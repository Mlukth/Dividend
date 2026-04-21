<template>
  <div class="archive-page">
    <!-- 1. 电站概要信息 (优化版-卡片化布局) -->
    <el-card class="section-card overview-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">电站概要信息</span>
        </div>
      </template>
      
      <div class="overview-content">
        <!-- 左侧：核心指标卡片矩阵 -->
        <div class="info-matrix">
          <div class="info-card">
            <div class="card-icon icon-house">
              <span>🏠</span>
            </div>
            <div class="card-content">
              <div class="card-label">电站名称</div>
              <div class="card-value">赣州瑞金光伏电站</div>
            </div>
          </div>
          
          <div class="info-card">
            <div class="card-icon icon-location">
              <span>📍</span>
            </div>
            <div class="card-content">
              <div class="card-label">电站位置</div>
              <div class="card-value">江西省赣州市瑞金市</div>
            </div>
          </div>
          
          <div class="info-card">
            <div class="card-icon icon-power">
              <span>⚡</span>
            </div>
            <div class="card-content">
              <div class="card-label">装机容量</div>
              <div class="card-value">100,000 kW</div>
            </div>
          </div>
          
          <div class="info-card">
            <div class="card-icon icon-date">
              <span>📅</span>
            </div>
            <div class="card-content">
              <div class="card-label">投运时间</div>
              <div class="card-value">2023-06-15</div>
              <div class="card-subvalue">已运行 637 天</div>
            </div>
          </div>
          
          <div class="info-card">
            <div class="card-icon icon-type">
              <span>🔋</span>
            </div>
            <div class="card-content">
              <div class="card-label">电站类型</div>
              <div class="card-value">
                <el-tag type="primary" effect="light" size="small">地面电站</el-tag>
              </div>
            </div>
          </div>
          
          <div class="info-card">
            <div class="card-icon icon-voltage">
              <span>🔌</span>
            </div>
            <div class="card-content">
              <div class="card-label">并网电压等级</div>
              <div class="card-value">110 kV</div>
            </div>
          </div>
        </div>
        
        <!-- 右侧：仪表盘 + 图片轮播 (微调适配) -->
        <div class="visual-area">
          <div class="gauge-card">
            <div ref="gaugeRef" class="gauge-chart"></div>
            <div class="gauge-label">装机容量达标率</div>
          </div>
          
          <el-carousel height="180px" class="station-carousel" :interval="3000" indicator-position="outside">
            <el-carousel-item v-for="(item, index) in stationImages" :key="index">
              <div class="carousel-item" :style="{ backgroundImage: `url(${item})` }"></div>
            </el-carousel-item>
          </el-carousel>
        </div>
      </div>
    </el-card>

    <!-- 2. 设备台账 -->
    <el-card class="section-card equipment-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">设备台账</span>
        </div>
      </template>
      
      <!-- 顶部图表区 -->
      <div class="charts-row">
        <div class="chart-item">
          <div ref="pieRef" class="small-chart"></div>
          <div class="chart-label">设备类型分布</div>
        </div>
        <div class="chart-item">
          <div ref="barRef" class="small-chart"></div>
          <div class="chart-label">厂家分布 TOP5</div>
        </div>
        <div class="chart-item">
          <div ref="lineRef" class="small-chart"></div>
          <div class="chart-label">安装时间趋势</div>
        </div>
      </div>
      
      <!-- 底部表格 -->
      <el-table 
        :data="equipmentData" 
        stripe 
        style="width: 100%"
        class="equipment-table"
        :row-class-name="tableRowClassName"
      >
        <el-table-column prop="stationName" label="电站名称" width="180" />
        <el-table-column prop="deviceType" label="设备类型" width="120">
          <template #default="scope">
            <el-tag size="small" :type="getDeviceTypeTag(scope.row.deviceType)">
              {{ scope.row.deviceType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="model" label="型号" width="150" />
        <el-table-column prop="quantity" label="数量" width="80" />
        <el-table-column prop="coreParams" label="核心参数" />
        <el-table-column prop="manufacturer" label="生产厂家" width="180" />
        <el-table-column prop="installDate" label="安装日期" width="120" />
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-button link type="primary" size="small">详情</el-button>
            <el-button link type="primary" size="small">文档</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 3. 设计图纸 (优化版) -->
    <el-card class="section-card drawing-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">设计图纸</span>
          <!-- 优化点1：增加顶部筛选栏 -->
          <div class="header-actions">
            <el-select v-model="filterType" placeholder="图纸类型" clearable style="width: 150px; margin-right: 12px">
              <el-option label="全部" value="" />
              <el-option label="电气主接线图" value="电气主接线图" />
              <el-option label="总平面布置图" value="总平面布置图" />
              <el-option label="设备基础图" value="设备基础图" />
              <el-option label="接地网图" value="接地网图" />
            </el-select>
            <el-checkbox v-model="filterLatest" style="color: #1D2129;">仅显示最新版本</el-checkbox>
          </div>
        </div>
      </template>
      
      <!-- 优化点2：缩略图墙改为响应式Grid + 视觉升级 -->
      <div class="drawing-wall">
        <div 
          v-for="(drawing, index) in filteredDrawings" 
          :key="index" 
          class="drawing-item"
          @click="openPreview(drawing)"
        >
          <div class="drawing-thumbnail">
            <span class="drawing-icon">{{ drawing.icon }}</span>
            <!-- 增加最新版本角标 -->
            <div v-if="drawing.isLatest" class="latest-badge">LATEST</div>
          </div>
          <div class="drawing-info">
            <div class="drawing-name">{{ drawing.name }}</div>
            <div class="drawing-type">{{ drawing.type }}</div>
            <div class="drawing-meta">
              <span class="drawing-version" :class="{ latest: drawing.isLatest }">
                V{{ drawing.version }}
              </span>
              <span class="drawing-date">{{ drawing.updateDate }}</span>
            </div>
          </div>
          <div class="drawing-actions">
            <el-button link type="primary" size="small" @click.stop="openPreview(drawing)">预览</el-button>
            <el-button link type="primary" size="small">下载</el-button>
          </div>
        </div>
      </div>
      
      <!-- 优化点3：底部表格样式微调 -->
      <el-table 
        :data="filteredDrawings" 
        stripe 
        style="width: 100%; margin-top: 24px"
        class="drawing-table"
      >
        <el-table-column prop="stationName" label="电站名称" width="180" />
        <el-table-column prop="type" label="图纸类型" width="140" />
        <el-table-column prop="code" label="图纸编号" width="180" />
        <el-table-column prop="version" label="版本号" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.isLatest" type="danger" size="small" effect="dark">
              V{{ scope.row.version }}
            </el-tag>
            <span v-else style="color: #86909C;">V{{ scope.row.version }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="updateDate" label="更新日期" width="140" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="openPreview(scope.row)">预览</el-button>
            <el-button link type="primary" size="small">下载</el-button>
            <el-button link type="info" size="small">历史</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 优化点4：增加图纸预览弹窗 -->
    <el-dialog 
      v-model="previewVisible" 
      :title="currentPreviewDrawing?.name" 
      width="70vw"
      :close-on-click-modal="true"
      class="preview-dialog"
    >
      <div class="preview-content">
        <div class="preview-main">
          <div class="preview-placeholder">
            <span class="preview-icon">{{ currentPreviewDrawing?.icon }}</span>
            <p class="preview-tip">图纸预览区域</p>
            <p class="preview-subtip">（实际项目中此处将渲染CAD或PDF预览）</p>
          </div>
        </div>
        <div class="preview-sidebar">
          <div class="sidebar-section">
            <h4>图纸信息</h4>
            <div class="info-row">
              <span class="label">图纸编号</span>
              <span class="value">{{ currentPreviewDrawing?.code }}</span>
            </div>
            <div class="info-row">
              <span class="label">版本号</span>
              <span class="value" :class="{ latest: currentPreviewDrawing?.isLatest }">
                V{{ currentPreviewDrawing?.version }}
                <el-tag v-if="currentPreviewDrawing?.isLatest" type="danger" size="small" style="margin-left: 8px;">最新</el-tag>
              </span>
            </div>
            <div class="info-row">
              <span class="label">类型</span>
              <span class="value">{{ currentPreviewDrawing?.type }}</span>
            </div>
            <div class="info-row">
              <span class="label">更新日期</span>
              <span class="value">{{ currentPreviewDrawing?.updateDate }}</span>
            </div>
          </div>
          <div class="sidebar-actions">
            <el-button type="primary" size="large" style="width: 100%;">下载图纸</el-button>
            <el-button size="large" style="width: 100%; margin-top: 12px;">查看历史版本</el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed } from 'vue'
import * as echarts from 'echarts'
import { ElTag, ElButton, ElTable, ElTableColumn, ElCard, ElCarousel, ElCarouselItem, ElSelect, ElOption, ElCheckbox, ElDialog } from 'element-plus'

// --- 数据模拟 ---
const stationImages = [
  'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=600&h=400&fit=crop'
]

const equipmentData = [
  { stationName: '赣州瑞金光伏电站', deviceType: '光伏组件', model: 'JKM395N-60HL4', quantity: 254000, coreParams: '395W, 单晶PERC', manufacturer: '晶科能源', installDate: '2023-03-10' },
  { stationName: '赣州瑞金光伏电站', deviceType: '逆变器', model: 'SUN2000-100KTL-M0', quantity: 1000, coreParams: '100kW, 三路MPPT', manufacturer: '华为技术', installDate: '2023-04-15' },
  { stationName: '赣州瑞金光伏电站', deviceType: '支架', model: 'ZJ-210-60', quantity: 42000, coreParams: '镀锌钢, 倾角25°', manufacturer: '中信博', installDate: '2023-02-20' },
  { stationName: '赣州瑞金光伏电站', deviceType: '箱变', model: 'ZGS11-Z-1250/35', quantity: 80, coreParams: '1250kVA, 35kV', manufacturer: '特变电工', installDate: '2023-05-08' }
]

const drawings = [
  { stationName: '赣州瑞金光伏电站', type: '电气主接线图', code: 'GR-PV-ELE-001', version: '2.1', updateDate: '2023-05-20', name: '110kV升压站主接线', icon: '📐', isLatest: true },
  { stationName: '赣州瑞金光伏电站', type: '总平面布置图', code: 'GR-PV-GEO-001', version: '1.5', updateDate: '2023-04-10', name: '电站总平面规划', icon: '🗺️', isLatest: false },
  { stationName: '赣州瑞金光伏电站', type: '设备基础图', code: 'GR-PV-STR-005', version: '3.0', updateDate: '2023-06-01', name: '逆变器基础施工图', icon: '🏗️', isLatest: true },
  { stationName: '赣州瑞金光伏电站', type: '接地网图', code: 'GR-PV-GRD-002', version: '1.0', updateDate: '2023-01-15', name: '全站接地系统', icon: '⚡', isLatest: false }
]

// --- 筛选逻辑 (新增) ---
const filterType = ref('')
const filterLatest = ref(false)

const filteredDrawings = computed(() => {
  return drawings.filter(drawing => {
    const matchType = !filterType.value || drawing.type === filterType.value
    const matchLatest = !filterLatest.value || drawing.isLatest
    return matchType && matchLatest
  })
})

// --- 预览逻辑 (新增) ---
const previewVisible = ref(false)
const currentPreviewDrawing = ref(null)

const openPreview = (drawing) => {
  currentPreviewDrawing.value = drawing
  previewVisible.value = true
}

// --- DOM 引用 ---
const gaugeRef = ref(null)
const pieRef = ref(null)
const barRef = ref(null)
const lineRef = ref(null)

// --- 图表初始化 ---
onMounted(() => {
  nextTick(() => {
    initGaugeChart()
    initPieChart()
    initBarChart()
    initLineChart()
  })
})

const initGaugeChart = () => {
  const chart = echarts.init(gaugeRef.value)
  const option = {
    series: [{
      type: 'gauge',
      startAngle: 180,
      endAngle: 0,
      min: 0,
      max: 120000,
      splitNumber: 6,
      itemStyle: {
        color: '#0066CC'
      },
      progress: {
        show: true,
        width: 18
      },
      pointer: {
        show: false
      },
      axisLine: {
        lineStyle: {
          width: 18,
          color: [[1, '#E5E6EB']]
        }
      },
      axisTick: {
        show: false
      },
      splitLine: {
        show: false
      },
      axisLabel: {
        show: false
      },
      title: {
        show: false
      },
      detail: {
        valueAnimation: true,
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1D2129',
        offsetCenter: [0, '20%'],
        formatter: '{value} kW'
      },
      data: [{
        value: 100000
      }]
    }]
  }
  chart.setOption(option)
}

const initPieChart = () => {
  const chart = echarts.init(pieRef.value)
  const option = {
    tooltip: {
      trigger: 'item'
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 4,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: false
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 12,
          fontWeight: 'bold'
        }
      },
      data: [
        { value: 254000, name: '光伏组件', itemStyle: { color: '#0066CC' } },
        { value: 1000, name: '逆变器', itemStyle: { color: '#165DFF' } },
        { value: 42000, name: '支架', itemStyle: { color: '#4080FF' } },
        { value: 80, name: '箱变', itemStyle: { color: '#6AA1FF' } }
      ]
    }]
  }
  chart.setOption(option)
}

const initBarChart = () => {
  const chart = echarts.init(barRef.value)
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      show: false
    },
    yAxis: {
      type: 'category',
      data: ['阳光电源', '华为', '特变电工', '晶科', '中信博'],
      axisLabel: {
        fontSize: 10
      }
    },
    series: [{
      type: 'bar',
      data: [1200, 1000, 850, 600, 420],
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: '#0066CC' },
          { offset: 1, color: '#4080FF' }
        ]),
        borderRadius: [0, 4, 4, 0]
      }
    }]
  }
  chart.setOption(option)
}

const initLineChart = () => {
  const chart = echarts.init(lineRef.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['2022-Q4', '2023-Q1', '2023-Q2', '2023-Q3'],
      axisLabel: {
        fontSize: 10
      }
    },
    yAxis: {
      type: 'value',
      show: false
    },
    series: [{
      type: 'line',
      data: [0, 150, 320, 480],
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: {
        color: '#0066CC',
        width: 2
      },
      itemStyle: {
        color: '#0066CC'
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(0, 102, 204, 0.3)' },
          { offset: 1, color: 'rgba(0, 102, 204, 0.05)' }
        ])
      }
    }]
  }
  chart.setOption(option)
}

// --- 辅助函数 ---
const getDeviceTypeTag = (type) => {
  const map = {
    '光伏组件': '',
    '逆变器': 'warning',
    '支架': 'info',
    '箱变': 'danger'
  }
  return map[type] || ''
}

const tableRowClassName = ({ rowIndex }) => {
  return rowIndex % 2 === 0 ? '' : 'stripe-row'
}
</script>

<style scoped>
.archive-page {
  background-color: #F5F7FA;
  padding: 0;
  min-height: calc(100vh - 60px);
}

.section-card {
  margin-bottom: 20px;
  border-radius: 12px;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 16px;
  font-weight: bold;
  color: #1D2129;
}

/* --- 电站概要样式 (优化版-卡片化布局) --- */
.overview-content {
  display: flex;
  gap: 24px;
}

/* 核心指标矩阵 */
.info-matrix {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

/* 指标卡片核心样式 */
.info-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid #F2F3F5;
  transition: all 0.3s ease;
  cursor: default;
}

.info-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 102, 204, 0.08);
  border-color: #165DFF;
}

/* 图标区渐变样式 */
.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 22px;
}

.icon-house {
  background: linear-gradient(135deg, #165DFF 0%, #4080FF 100%);
}
.icon-location {
  background: linear-gradient(135deg, #00B42A 0%, #52C41A 100%);
}
.icon-power {
  background: linear-gradient(135deg, #FF7D00 0%, #FF9A2E 100%);
}
.icon-date {
  background: linear-gradient(135deg, #722ED1 0%, #9E55FF 100%);
}
.icon-type {
  background: linear-gradient(135deg, #13C2C2 0%, #36CFC9 100%);
}
.icon-voltage {
  background: linear-gradient(135deg, #F5319D 0%, #FF7CB9 100%);
}

.card-icon span {
  filter: brightness(0) invert(1);
}

/* 内容区样式 */
.card-content {
  flex: 1;
  min-width: 0;
}

.card-label {
  font-size: 12px;
  color: #86909C;
  margin-bottom: 4px;
  line-height: 1;
}

.card-value {
  font-size: 15px;
  font-weight: 600;
  color: #1D2129;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-subvalue {
  font-size: 12px;
  color: #0066CC;
  font-weight: 500;
  margin-top: 2px;
  line-height: 1;
}

/* 右侧可视化区域 */
.visual-area {
  flex: 0 0 280px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.gauge-card {
  padding: 16px;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #F2F3F5;
  text-align: center;
}

.gauge-chart {
  width: 100%;
  height: 120px;
}

.gauge-label {
  font-size: 12px;
  color: #86909C;
  margin-top: -10px;
}

.station-carousel {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #F2F3F5;
}

.carousel-item {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
}

/* --- 设备台账样式 --- */
.charts-row {
  display: flex;
  justify-content: space-around;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #F2F3F5;
}

.chart-item {
  width: 30%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.small-chart {
  width: 100%;
  height: 180px;
}

.chart-label {
  font-size: 12px;
  color: #86909C;
  margin-top: 8px;
}

.equipment-table {
  border-radius: 8px;
  overflow: hidden;
}

/* --- 设计图纸样式 (优化版) --- */
.header-actions {
  display: flex;
  align-items: center;
}

.drawing-wall {
  display: grid;
  /* 优化：响应式网格，最小宽度280px */
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.drawing-item {
  border: 1px solid #E5E6EB;
  border-radius: 12px;
  padding: 16px;
  transition: all 0.3s ease;
  cursor: pointer;
  background-color: #fff;
  position: relative;
}

.drawing-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: #165DFF;
}

.drawing-thumbnail {
  height: 120px;
  background: linear-gradient(135deg, #EEF7FF 0%, #E6F4FF 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  position: relative;
  overflow: hidden;
}

/* 优化：增加悬停光效 */
.drawing-thumbnail::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(22, 93, 255, 0.15) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.drawing-item:hover .drawing-thumbnail::before {
  opacity: 1;
}

.drawing-icon {
  font-size: 48px;
  z-index: 1;
}

.latest-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: #F53F3F;
  color: #fff;
  font-size: 10px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 4px;
  letter-spacing: 0.5px;
}

.drawing-info {
  margin-bottom: 12px;
}

.drawing-name {
  font-size: 15px;
  font-weight: 600;
  color: #1D2129;
  margin-bottom: 6px;
}

.drawing-type {
  font-size: 12px;
  color: #86909C;
  margin-bottom: 8px;
}

.drawing-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #86909C;
}

.drawing-version.latest {
  color: #F53F3F;
  font-weight: 600;
  background-color: #FFF1F0;
  padding: 2px 8px;
  border-radius: 4px;
}

.drawing-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid #F2F3F5;
}

.drawing-actions .el-button {
  padding: 4px 12px;
  border-radius: 6px;
  font-weight: 500;
}

.drawing-table {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #E5E6EB;
}

/* --- 预览弹窗样式 --- */
.preview-dialog :deep(.el-dialog__header) {
  border-bottom: 1px solid #F2F3F5;
}

.preview-content {
  display: flex;
  height: 70vh;
  gap: 20px;
}

.preview-main {
  flex: 1;
  background-color: #F7F8FA;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed #E5E6EB;
}

.preview-placeholder {
  text-align: center;
  color: #86909C;
}

.preview-icon {
  font-size: 80px;
  display: block;
  margin-bottom: 20px;
  opacity: 0.5;
}

.preview-tip {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 8px;
}

.preview-subtip {
  font-size: 12px;
}

.preview-sidebar {
  width: 280px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sidebar-section {
  background-color: #fff;
  border: 1px solid #E5E6EB;
  border-radius: 8px;
  padding: 20px;
}

.sidebar-section h4 {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: #1D2129;
  font-weight: 600;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 13px;
}

.info-row .label {
  color: #86909C;
}

.info-row .value {
  color: #1D2129;
  font-weight: 500;
}

.info-row .value.latest {
  color: #F53F3F;
}

.sidebar-actions {
  margin-top: auto;
}
</style>