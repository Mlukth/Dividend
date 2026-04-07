<template>
  <div class="archive-page-container">
    <!-- 页面标题面包屑 -->
    <div class="page-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>基本信息</el-breadcrumb-item>
        <el-breadcrumb-item>电站档案</el-breadcrumb-item>
      </el-breadcrumb>
      <h2 class="page-title">电站档案信息</h2>
    </div>

    <!-- 第一模块：电站概要信息 -->
    <el-card class="module-card summary-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="header-title">
            <el-icon><Document /></el-icon> 电站概要信息
          </span>
          <el-tag type="info" effect="dark">投运中</el-tag>
        </div>
      </template>

      <div class="summary-content">
        <!-- 左侧：地图与位置 -->
        <div class="map-section">
          <div class="station-identity">
            <h3 class="station-name">{{ stationData.name }}</h3>
            <p class="station-location">
              <el-icon><Location /></el-icon>
              {{ stationData.location }}
            </p>
          </div>
          
          <!-- 模拟地图容器 -->
          <div class="map-placeholder" @click="openMapModal">
            <div class="map-overlay">
              <div class="map-tag">{{ stationData.type }}</div>
            </div>
            <div class="map-fake-bg">
              <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
                <rect width="400" height="200" fill="#e0e9f2"/>
                <path d="M0,150 L100,100 L200,120 L300,80 L400,140 L400,200 L0,200 Z" fill="#a8d5a2"/>
                <rect x="50" y="60" width="30" height="20" fill="#3478c2" opacity="0.8"/>
                <rect x="90" y="65" width="30" height="20" fill="#3478c2" opacity="0.8"/>
                <rect x="130" y="55" width="30" height="20" fill="#3478c2" opacity="0.8"/>
                <rect x="200" y="70" width="30" height="20" fill="#3478c2" opacity="0.8"/>
                <rect x="240" y="60" width="30" height="20" fill="#3478c2" opacity="0.8"/>
                <circle cx="200" cy="100" r="6" fill="#ff4d4f"/>
                <path d="M200,100 L200,70 M190,80 L200,70 L210,80" stroke="#ff4d4f" stroke-width="2" fill="none"/>
              </svg>
            </div>
            <div class="map-tip">
              <el-icon><ZoomIn /></el-icon> 点击查看详细卫星地图
            </div>
          </div>
        </div>

        <!-- 右侧：指标矩阵 -->
        <div class="metrics-grid">
          <!-- 指标1：装机容量 (仪表盘) -->
          <div class="metric-item capacity-item">
            <div class="metric-label">装机容量</div>
            <div ref="capacityChartRef" class="chart-container"></div>
            <div class="metric-value-main">{{ stationData.capacity }}<span class="unit">kW</span></div>
          </div>

          <!-- 指标2：投运时间 -->
          <div class="metric-item">
            <div class="metric-header">
              <el-icon class="metric-icon"><Calendar /></el-icon>
              <span class="metric-label">投运时间</span>
            </div>
            <div class="timeline-wrapper">
              <div class="timeline-dot"></div>
              <div class="timeline-line"></div>
            </div>
            <div class="metric-value">{{ stationData.operationDate }}</div>
            <div class="metric-sub">已运行 <strong>{{ daysOfOperation }}</strong> 天</div>
          </div>

          <!-- 指标3：电站类型 -->
          <div class="metric-item type-item">
            <div class="metric-icon-bg">
              <el-icon :size="40"><Sunny /></el-icon>
            </div>
            <div class="metric-label mt-10">电站类型</div>
            <div class="metric-value type-text">{{ stationData.type }}</div>
          </div>

          <!-- 指标4：并网电压 -->
          <div class="metric-item">
            <div class="metric-header">
              <el-icon class="metric-icon"><Lightning /></el-icon>
              <span class="metric-label">并网电压等级</span>
            </div>
            <div class="progress-wrapper">
              <el-progress 
                :percentage="voltagePercentage" 
                :color="voltageColor"
                :stroke-width="20"
                :show-text="false"
              />
            </div>
            <div class="metric-value voltage-text">{{ stationData.gridVoltage }}<span class="unit">kV</span></div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 第二模块：设备台账 -->
    <el-card class="module-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="header-title">
            <el-icon><Box /></el-icon> 设备台账
          </span>
          <div class="header-actions">
            <el-input v-model="deviceSearchText" placeholder="搜索设备型号或厂家" style="width: 240px" prefix-icon="Search">
            </el-input>
            <el-button type="primary" style="margin-left: 12px;">
              <el-icon><Upload /></el-icon> 导出台账
            </el-button>
          </div>
        </div>
      </template>

      <el-table 
        :data="filteredDevices" 
        style="width: 100%" 
        :header-cell-style="{ background: '#F5F7FA', color: '#4E5969', fontWeight: 'bold' }"
        @row-click="handleDeviceRowClick"
        stripe
        highlight-current-row
      >
        <el-table-column prop="stationName" label="所属电站" width="140" />
        <el-table-column prop="type" label="设备类型" width="140">
          <template #default="{ row }">
            <div class="device-type-cell">
              <el-icon v-if="row.type === '逆变器'" color="#0066CC"><Connection /></el-icon>
              <el-icon v-else-if="row.type === '光伏组件'" color="#722ed1"><Sunny /></el-icon>
              <el-icon v-else-if="row.type === '支架'" color="#52c41a"><Tools /></el-icon>
              <el-icon v-else color="#faad14"><Setting /></el-icon>
              <span>{{ row.type }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="model" label="型号" min-width="160" />
        <el-table-column prop="quantity" label="数量" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ row.quantity }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="coreParams" label="核心参数" min-width="200">
          <template #default="{ row }">
            <span class="param-text">{{ row.coreParams }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="manufacturer" label="生产厂家" min-width="180" show-overflow-tooltip />
        <el-table-column prop="installDate" label="安装日期" width="120">
          <template #default="{ row }">
            <span class="date-text"><el-icon><Calendar /></el-icon> {{ row.installDate }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" align="center">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click.stop="viewDeviceDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 第三模块：设计图纸 -->
    <el-card class="module-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="header-title">
            <el-icon><Picture /></el-icon> 设计图纸
          </span>
          <div class="header-actions">
            <el-radio-group v-model="viewMode" size="default">
              <el-radio-button label="grid">
                <el-icon><Grid /></el-icon>
              </el-radio-button>
              <el-radio-button label="list">
                <el-icon><List /></el-icon>
              </el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </template>

      <div v-if="viewMode === 'grid'" class="drawings-grid">
        <div v-for="(item, index) in drawings" :key="index" class="drawing-card" :class="{ hover: hoveredIndex === index }" @mouseenter="hoveredIndex = index" @mouseleave="hoveredIndex = -1">
          <div class="drawing-thumb">
            <div class="thumb-icon">
              <el-icon v-if="item.type === '电气原理图'" :size="50"><Connection /></el-icon>
              <el-icon v-else-if="item.type === '平面布置图'" :size="50"><Location /></el-icon>
              <el-icon v-else-if="item.type === '结构图'" :size="50"><Box /></el-icon>
              <el-icon v-else :size="50"><Document /></el-icon>
            </div>
            <!-- 悬停时的预览遮罩 -->
            <div class="thumb-overlay" v-show="hoveredIndex === index">
              <el-button type="primary" plain @click="previewDrawing(item)">
                <el-icon><View /></el-icon> 快速预览
              </el-button>
            </div>
          </div>
          
          <div class="drawing-info">
            <h4 class="drawing-type">{{ item.type }}</h4>
            <p class="drawing-id">{{ item.id }}</p>
            <div class="drawing-meta">
              <el-tag size="small" effect="plain" class="version-tag">V{{ item.version }}</el-tag>
              <span class="update-date">{{ item.updateDate }}</span>
            </div>
          </div>

          <div class="drawing-actions">
            <el-button class="action-btn" @click="previewDrawing(item)">
              <el-icon><View /></el-icon> 预览
            </el-button>
            <el-button class="action-btn download-btn" @click="downloadDrawing(item)">
              <el-icon><Download /></el-icon> 下载
            </el-button>
          </div>
        </div>
      </div>

      <!-- 列表视图 (备选) -->
      <el-table v-else :data="drawings" style="width: 100%">
        <el-table-column prop="stationName" label="电站名称" />
        <el-table-column prop="type" label="图纸类型" />
        <el-table-column prop="id" label="图纸编号" />
        <el-table-column prop="version" label="版本号" />
        <el-table-column prop="updateDate" label="更新日期" />
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button link type="primary">预览</el-button>
            <el-button link type="primary">下载</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 地图弹窗 -->
    <el-modal v-model="mapModalVisible" title="电站地理位置" width="60%" top="5vh">
      <div class="map-modal-content">
        <div class="map-large-placeholder">
          <el-icon :size="80" color="#ccc"><Location /></el-icon>
          <p>地图组件加载中...</p>
          <p class="sub-text">(此处接入百度/高德地图API)</p>
        </div>
      </div>
      <template #footer>
        <el-button @click="mapModalVisible = false">关闭</el-button>
      </template>
    </el-modal>

    <!-- 图纸预览弹窗 -->
    <el-modal v-model="drawingModalVisible" :title="currentDrawing?.type" width="80%" top="5vh">
      <div class="drawing-modal-content">
        <div class="drawing-viewer">
           <div class="drawing-toolbar">
              <el-button-group>
                <el-button><el-icon><ZoomOut /></el-icon></el-button>
                <el-button><el-icon><ZoomIn /></el-icon></el-button>
                <el-button><el-icon><RefreshLeft /></el-icon></el-button>
              </el-button-group>
              <span class="drawing-info-tip">{{ currentDrawing?.id }} (V{{ currentDrawing?.version }})</span>
           </div>
           <div class="drawing-canvas">
             <el-icon :size="120" color="#e0e0e0"><Picture /></el-icon>
             <p class="canvas-tip">图纸高清渲染区域</p>
           </div>
        </div>
      </div>
    </el-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, h } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'
import { 
  Document, Location, Calendar, Sunny, Lightning, Box, 
  Picture, Search, Upload, Connection, Tools, Setting, 
  Grid, List, View, Download, ZoomIn, ZoomOut, RefreshLeft
} from '@element-plus/icons-vue'

// --- 状态定义 ---
const capacityChartRef = ref(null)
let capacityChart = null

const deviceSearchText = ref('')
const viewMode = ref('grid')
const hoveredIndex = ref(-1)
const mapModalVisible = ref(false)
const drawingModalVisible = ref(false)
const currentDrawing = ref(null)

// --- 模拟数据 ---
const stationData = ref({
  name: '赣州瑞金市叶坪镇100MW光伏电站',
  location: '江西省赣州市瑞金市叶坪镇',
  capacity: 100000,
  operationDate: '2023-06-15',
  type: '地面光伏电站',
  gridVoltage: 110
})

const deviceList = ref([
  { stationName: '瑞金叶坪电站', type: '逆变器', model: 'SUN2000-100KTL-M0', quantity: 1000, coreParams: '效率: 98.6%, 最大直流电压: 1100V', manufacturer: '华为技术有限公司', installDate: '2023-03-10' },
  { stationName: '瑞金叶坪电站', type: '光伏组件', model: 'JAM72S30-550/MR', quantity: 181820, coreParams: '功率: 550W, 效率: 21.3%', manufacturer: '晶澳太阳能科技股份有限公司', installDate: '2023-02-20' },
  { stationName: '瑞金叶坪电站', type: '支架', model: 'ZT-001', quantity: 45455, coreParams: '材质: 镀锌铝镁, 倾角: 25°', manufacturer: '江苏中信博新能源科技股份有限公司', installDate: '2023-01-15' },
  { stationName: '瑞金叶坪电站', type: '箱变', model: 'ZGS11-Z.F-35000/35', quantity: 10, coreParams: '容量: 35000kVA, 电压比: 35kV', manufacturer: '特变电工股份有限公司', installDate: '2023-04-05' },
  { stationName: '瑞金叶坪电站', type: '汇流箱', model: 'AH-16/1000', quantity: 500, coreParams: '16路输入, IP65', manufacturer: '安徽金力电气技术有限公司', installDate: '2023-03-25' }
])

const drawings = ref([
  { stationName: '瑞金叶坪电站', type: '电气原理图', id: 'RY-SG-EL-001', version: '2.1', updateDate: '2024-01-10' },
  { stationName: '瑞金叶坪电站', type: '平面布置图', id: 'RY-SG-PL-002', version: '1.5', updateDate: '2023-11-22' },
  { stationName: '瑞金叶坪电站', type: '结构图', id: 'RY-SG-ST-003', version: '3.0', updateDate: '2024-02-01' },
  { stationName: '瑞金叶坪电站', type: '接地网图', id: 'RY-SG-GR-004', version: '1.0', updateDate: '2023-05-16' },
  { stationName: '瑞金叶坪电站', type: '电缆敷设图', id: 'RY-SG-CA-005', version: '1.2', updateDate: '2023-08-30' },
  { stationName: '瑞金叶坪电站', type: '设备清单', id: 'RY-SG-LI-006', version: '4.0', updateDate: '2024-03-01' }
])

// --- 计算属性 ---
const daysOfOperation = computed(() => {
  const start = new Date(stationData.value.operationDate)
  const now = new Date()
  const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24))
  return diff
})

const voltagePercentage = computed(() => {
  // 假设最高等级为 500kV，计算百分比用于进度条展示
  return Math.min(100, (stationData.value.gridVoltage / 500) * 100)
})

const voltageColor = computed(() => {
  if (stationData.value.gridVoltage >= 220) return '#f5222d'
  if (stationData.value.gridVoltage >= 110) return '#fa8c16'
  return '#52c41a'
})

const filteredDevices = computed(() => {
  if (!deviceSearchText.value) return deviceList.value
  return deviceList.value.filter(item => 
    item.model.includes(deviceSearchText.value) || 
    item.manufacturer.includes(deviceSearchText.value)
  )
})

// --- 方法 ---
const initCapacityChart = () => {
  if (!capacityChartRef.value) return
  
  capacityChart = echarts.init(capacityChartRef.value)
  
  const option = {
    series: [{
      type: 'gauge',
      startAngle: 180,
      endAngle: 0,
      min: 0,
      max: stationData.value.capacity * 1.2, // 量程稍微大一点
      splitNumber: 4,
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
      detail: {
        show: false
      },
      data: [{
        value: stationData.value.capacity
      }]
    }]
  }

  capacityChart.setOption(option)
}

const handleDeviceRowClick = (row) => {
  ElMessage.info(`查看设备: ${row.model}`)
}

const viewDeviceDetail = (row) => {
  ElMessageBox.alert(`
    <strong>设备型号:</strong> ${row.model}<br/>
    <strong>核心参数:</strong> ${row.coreParams}<br/>
    <strong>厂家:</strong> ${row.manufacturer}
  `, '设备详情', {
    dangerouslyUseHTMLString: true,
    confirmButtonText: '关闭'
  })
}

const previewDrawing = (item) => {
  currentDrawing.value = item
  drawingModalVisible.value = true
}

const downloadDrawing = (item) => {
  ElMessage.success(`正在下载: ${item.id}.pdf`)
}

const openMapModal = () => {
  mapModalVisible.value = true
}

// --- 生命周期 ---
onMounted(() => {
  nextTick(() => {
    initCapacityChart()
  })
  
  window.addEventListener('resize', () => {
    capacityChart && capacityChart.resize()
  })
})
</script>

<style scoped>
/* 全局容器与布局 */
.archive-page-container {
  padding: 0;
  background-color: #F5F7FA;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-header {
  margin-bottom: -8px;
}

.page-title {
  margin: 12px 0 0 0;
  font-size: 20px;
  color: #1D2129;
  font-weight: 600;
}

.module-card {
  border-radius: 12px;
  border: none;
}

/* 卡片头部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 16px;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1D2129;
}

/* 概要内容布局 */
.summary-content {
  display: flex;
  gap: 24px;
  height: 320px;
}

/* 左侧地图区域 */
.map-section {
  flex: 0 0 40%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.station-identity {
  padding: 0 8px;
}

.station-name {
  margin: 0;
  font-size: 18px;
  color: #1D2129;
  font-weight: 700;
}

.station-location {
  margin: 6px 0 0 0;
  color: #4E5969;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.map-placeholder {
  flex: 1;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  border: 1px solid #E5E6EB;
  cursor: pointer;
  transition: all 0.3s;
}

.map-placeholder:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.map-fake-bg {
  width: 100%;
  height: 100%;
}

.map-fake-bg svg {
  width: 100%;
  height: 100%;
}

.map-overlay {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 2;
}

.map-tag {
  background: rgba(0,0,0,0.7);
  color: #fff;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
}

.map-tip {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255,255,255,0.9);
  padding: 8px;
  text-align: center;
  font-size: 12px;
  color: #4E5969;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  backdrop-filter: blur(4px);
}

/* 右侧指标网格 */
.metrics-grid {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 16px;
}

.metric-item {
  background: #F5F7FA;
  border-radius: 8px;
  padding: 16px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.metric-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
}

.metric-label {
  font-size: 14px;
  color: #4E5969;
}

.metric-icon {
  color: #0066CC;
}

.metric-value {
  font-size: 20px;
  font-weight: 700;
  color: #1D2129;
}

.metric-sub {
  font-size: 12px;
  color: #86909C;
  margin-top: 4px;
}

/* 特殊样式：容量仪表盘 */
.capacity-item {
  background: #EEF7FF;
}

.chart-container {
  width: 100%;
  height: 100px;
  margin-top: -10px;
}

.metric-value-main {
  position: absolute;
  bottom: 20px;
  font-size: 24px;
  font-weight: 800;
  color: #0066CC;
}

.unit {
  font-size: 14px;
  font-weight: normal;
  margin-left: 2px;
}

/* 特殊样式：时间轴 */
.timeline-wrapper {
  position: absolute;
  left: 20px;
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 45px;
}

.timeline-dot {
  width: 12px;
  height: 12px;
  background: #0066CC;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 0 0 2px #0066CC;
  z-index: 2;
}

.timeline-line {
  width: 2px;
  flex: 1;
  background: #E5E6EB;
  margin-top: -2px;
}

/* 特殊样式：类型图标 */
.type-item {
  background: #F5F7FA;
}

.metric-icon-bg {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0066CC;
  box-shadow: 0 4px 10px rgba(0,102,204,0.1);
}

.type-text {
  color: #1D2129;
}

.mt-10 { margin-top: 10px; }

/* 特殊样式：电压进度条 */
.progress-wrapper {
  width: 80%;
  margin: 10px 0;
}

.voltage-text {
  color: #fa8c16;
}

/* 表格样式增强 */
.device-type-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.param-text {
  font-family: monospace;
  background: #f2f3f5;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  color: #1D2129;
}

.date-text {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #4E5969;
  font-size: 13px;
}

/* 图纸卡片网格 */
.drawings-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.drawing-card {
  border: 1px solid #E5E6EB;
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.3s;
  background: #fff;
  display: flex;
  flex-direction: column;
}

.drawing-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  border-color: transparent;
}

.drawing-thumb {
  height: 140px;
  background: #F5F7FA;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-bottom: 1px solid #f0f0f0;
}

.thumb-icon {
  color: #999;
  transition: transform 0.3s;
}

.drawing-card:hover .thumb-icon {
  transform: scale(1.1);
  color: #0066CC;
}

.thumb-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(2px);
}

.drawing-info {
  padding: 16px;
  flex: 1;
}

.drawing-type {
  margin: 0 0 6px 0;
  font-size: 16px;
  color: #1D2129;
  font-weight: 600;
}

.drawing-id {
  margin: 0 0 12px 0;
  font-size: 13px;
  color: #86909C;
  font-family: monospace;
}

.drawing-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.version-tag {
  border-color: #0066CC;
  color: #0066CC;
  background: #EEF7FF;
}

.update-date {
  font-size: 12px;
  color: #999;
}

.drawing-actions {
  padding: 0 16px 16px 16px;
  display: flex;
  gap: 10px;
}

.action-btn {
  flex: 1;
  border-radius: 6px;
}

.download-btn {
  background: #F5F7FA;
  color: #4E5969;
  border: none;
}

/* 弹窗内容 */
.map-modal-content, .drawing-modal-content {
  min-height: 500px;
}

.map-large-placeholder {
  height: 500px;
  background: #F5F7FA;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  border-radius: 8px;
}

.sub-text {
  font-size: 12px;
  color: #ccc;
}

.drawing-viewer {
  display: flex;
  flex-direction: column;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
}

.drawing-toolbar {
  background: #fff;
  padding: 10px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.drawing-info-tip {
  font-family: monospace;
  color: #888;
}

.drawing-canvas {
  height: 450px;
  background: #fafafa url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23e0e0e0' fill-opacity='0.3'%3E%3Cpath d='M0 0h10v10H0zM10 10h10v10H10z'/%3E%3C/g%3E%3C/svg%3E");
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.canvas-tip {
  color: #ccc;
  margin-top: 10px;
}
</style>