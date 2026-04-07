<template>
  <div class="archive-page">
    <!-- 1. 页面标题区 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">电站档案信息</h1>
        <span class="page-subtitle">Archive Management</span>
      </div>
      <div class="header-cards">
        <div class="mini-card blue-gradient">
          <span class="mini-icon">⚡</span>
          <div class="mini-text">
            <div class="mini-value">{{ stationInfo.capacity }} kW</div>
            <div class="mini-label">总装机容量</div>
          </div>
        </div>
        <div class="mini-card">
          <span class="mini-icon">🔧</span>
          <div class="mini-text">
            <div class="mini-value">{{ deviceList.length }} 台</div>
            <div class="mini-label">设备总数</div>
          </div>
        </div>
        <div class="mini-card">
          <span class="mini-icon">📋</span>
          <div class="mini-text">
            <div class="mini-value">{{ drawingList.length }} 份</div>
            <div class="mini-label">图纸份数</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. 电站概要信息 -->
    <div class="section-card">
      <h2 class="section-title">电站概要信息</h2>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-icon">🏭</span>
          <div class="info-content">
            <div class="info-label">电站名称</div>
            <div class="info-value">{{ stationInfo.name }}</div>
          </div>
        </div>
        <div class="info-item">
          <div class="info-map">📍</div>
          <div class="info-content">
            <div class="info-label">电站位置</div>
            <div class="info-value">{{ stationInfo.location }}</div>
          </div>
        </div>
        <div class="info-item highlight">
          <span class="info-icon">⚡</span>
          <div class="info-content">
            <div class="info-label">装机容量</div>
            <div class="info-value">{{ stationInfo.capacity }} kW</div>
          </div>
        </div>
        <div class="info-item">
          <span class="info-icon">📅</span>
          <div class="info-content">
            <div class="info-label">投运时间</div>
            <div class="info-value">{{ stationInfo.operationDate }}</div>
            <div class="info-days">已运行 {{ stationInfo.operationDays }} 天</div>
          </div>
        </div>
        <div class="info-item">
          <span class="info-icon">🌞</span>
          <div class="info-content">
            <div class="info-label">电站类型</div>
            <div class="info-value">
              <el-tag size="small">{{ stationInfo.type }}</el-tag>
            </div>
          </div>
        </div>
        <div class="info-item">
          <span class="info-icon">🔌</span>
          <div class="info-content">
            <div class="info-label">并网电压等级</div>
            <div class="info-value">{{ stationInfo.gridVoltage }} kV</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. 设备台账 -->
    <div class="section-card">
      <h2 class="section-title">设备台账</h2>
      <div class="device-top">
        <div class="chart-box">
          <div ref="pieChartRef" class="chart"></div>
        </div>
        <div class="chart-box">
          <div ref="lineChartRef" class="chart"></div>
        </div>
      </div>
      <div class="table-toolbar">
        <el-input v-model="searchKeyword" placeholder="搜索型号/厂家" style="width: 240px" />
        <el-button type="primary">筛选</el-button>
        <el-button>导出</el-button>
      </div>
      <el-table :data="filteredDeviceList" stripe style="width: 100%" class="custom-table">
        <el-table-column prop="deviceType" label="设备类型" width="120">
          <template #default="{ row }">
            <span class="device-icon">{{ getDeviceIcon(row.deviceType) }}</span>
            {{ row.deviceType }}
          </template>
        </el-table-column>
        <el-table-column prop="model" label="型号" width="180" />
        <el-table-column prop="quantity" label="数量" width="80" />
        <el-table-column prop="coreParams" label="核心参数" show-overflow-tooltip />
        <el-table-column prop="manufacturer" label="生产厂家" />
        <el-table-column prop="installDate" label="安装日期" width="120" />
      </el-table>
    </div>

    <!-- 4. 设计图纸 -->
    <div class="section-card">
      <h2 class="section-title">设计图纸</h2>
      <div class="drawing-layout">
        <div class="drawing-filter">
          <div class="filter-title">图纸类型</div>
          <el-checkbox-group v-model="checkedTypes">
            <el-checkbox label="电气图">电气图</el-checkbox>
            <el-checkbox label="结构图">结构图</el-checkbox>
            <el-checkbox label="布局图">布局图</el-checkbox>
          </el-checkbox-group>
          <div class="filter-title mt-4">版本筛选</div>
          <el-select v-model="versionFilter" placeholder="请选择" style="width: 100%">
            <el-option label="最新版" value="latest" />
            <el-option label="历史版" value="history" />
          </el-select>
        </div>
        <div class="drawing-list">
          <div v-for="item in filteredDrawingList" :key="item.id" class="drawing-card">
            <div class="drawing-thumb">
              <span class="thumb-placeholder">📄</span>
            </div>
            <div class="drawing-info">
              <div class="drawing-name">{{ item.name }}</div>
              <div class="drawing-id">{{ item.code }}</div>
              <div class="drawing-meta">
                <el-tag size="small" type="info">V{{ item.version }}</el-tag>
                <span class="drawing-date">{{ item.updateDate }}</span>
              </div>
              <div class="drawing-actions">
                <el-button link type="primary" size="small">预览</el-button>
                <el-button link type="primary" size="small">下载</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'

// --- 1. 模拟数据 ---
const stationInfo = ref({
  name: '赣州瑞金光伏电站',
  location: '江西省赣州市瑞金市',
  capacity: 50000,
  operationDate: '2023-06-15',
  operationDays: 1000,
  type: '地面电站',
  gridVoltage: 110
})

const deviceList = ref([
  { deviceType: '逆变器', model: 'SUN2000-50KTL', quantity: 100, coreParams: '50kW, 1000V', manufacturer: '华为', installDate: '2023-05-10' },
  { deviceType: '组件', model: 'JKM395N-72HL4', quantity: 120000, coreParams: '395W, 单晶硅', manufacturer: '晶科能源', installDate: '2023-04-20' },
  { deviceType: '支架', model: 'ST-001', quantity: 5000, coreParams: '固定倾角35°', manufacturer: '清源科技', installDate: '2023-03-15' },
  { deviceType: '箱变', model: 'S11-2500', quantity: 20, coreParams: '2500kVA, 35kV', manufacturer: '特变电工', installDate: '2023-05-25' }
])

const drawingList = ref([
  { id: 1, name: '10kV电气主接线图', code: 'DRW-EL-001', type: '电气图', version: '2.0', updateDate: '2025-12-01' },
  { id: 2, name: '组件阵列布局图', code: 'DRW-ST-002', type: '布局图', version: '1.5', updateDate: '2025-10-15' },
  { id: 3, name: '逆变器基础结构图', code: 'DRW-ST-003', type: '结构图', version: '1.0', updateDate: '2023-05-01' }
])

// --- 2. 状态与筛选 ---
const searchKeyword = ref('')
const checkedTypes = ref(['电气图', '结构图', '布局图'])
const versionFilter = ref('')

const filteredDeviceList = computed(() => {
  if (!searchKeyword.value) return deviceList.value
  return deviceList.value.filter(item => 
    item.model.includes(searchKeyword.value) || item.manufacturer.includes(searchKeyword.value)
  )
})

const filteredDrawingList = computed(() => {
  return drawingList.value.filter(item => 
    checkedTypes.value.includes(item.type)
  )
})

// --- 3. 图表逻辑 ---
const pieChartRef = ref(null)
const lineChartRef = ref(null)

const initPieChart = () => {
  const chart = echarts.init(pieChartRef.value)
  chart.setOption({
    title: { text: '设备类型占比', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'item' },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        data: [
          { value: 100, name: '逆变器', itemStyle: { color: '#0066CC' } },
          { value: 1200, name: '组件', itemStyle: { color: '#165DFF' } },
          { value: 50, name: '支架', itemStyle: { color: '#4080FF' } },
          { value: 20, name: '箱变', itemStyle: { color: '#6AA1FF' } }
        ]
      }
    ]
  })
}

const initLineChart = () => {
  const chart = echarts.init(lineChartRef.value)
  chart.setOption({
    title: { text: '设备新增趋势', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['2023', '2024', '2025'] },
    yAxis: { type: 'value' },
    series: [{ data: [120, 80, 50], type: 'line', smooth: true, itemStyle: { color: '#0066CC' } }]
  })
}

// --- 4. 辅助函数 ---
const getDeviceIcon = (type) => {
  const map = { '逆变器': '🔄', '组件': '🔲', '支架': '🏗️', '箱变': '📦' }
  return map[type] || '🔧'
}

// --- 5. 生命周期 ---
onMounted(() => {
  nextTick(() => {
    initPieChart()
    initLineChart()
  })
})
</script>

<style scoped lang="scss">
/* 全局变量与基础样式 (匹配全局设计) */
$brand-blue: #0066CC;
$light-blue: #EEF7FF;
$bg-gray: #F5F7FA;
$text-main: #1D2129;
$text-secondary: #4E5969;
$border-radius: 12px;
$shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

.archive-page {
  padding: 0;
  background-color: $bg-gray;
  min-height: calc(100vh - 60px);
}

/* 1. 页面标题区 */
.page-header {
  background: #fff;
  padding: 20px;
  border-radius: $border-radius;
  box-shadow: $shadow;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  .header-left {
    .page-title {
      margin: 0;
      font-size: 20px;
      color: $text-main;
      font-weight: bold;
    }
    .page-subtitle {
      font-size: 12px;
      color: #999;
    }
  }

  .header-cards {
    display: flex;
    gap: 16px;

    .mini-card {
      display: flex;
      align-items: center;
      gap: 12px;
      background: $bg-gray;
      padding: 12px 20px;
      border-radius: 10px;
      transition: all 0.3s;

      &.blue-gradient {
        background: linear-gradient(135deg, $brand-blue, #165DFF);
        .mini-value, .mini-label { color: #fff; }
      }

      .mini-icon { font-size: 24px; }
      .mini-text {
        .mini-value { font-size: 18px; font-weight: bold; color: $text-main; }
        .mini-label { font-size: 12px; color: $text-secondary; }
      }
    }
  }
}

/* 通用卡片容器 */
.section-card {
  background: #fff;
  padding: 20px;
  border-radius: $border-radius;
  box-shadow: $shadow;
  margin-bottom: 16px;

  .section-title {
    margin: 0 0 20px 0;
    font-size: 16px;
    color: $text-main;
    font-weight: bold;
    border-left: 4px solid $brand-blue;
    padding-left: 12px;
  }
}

/* 2. 电站概要网格 */
.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;

  .info-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: $bg-gray;
    border-radius: 10px;
    transition: transform 0.2s;
    cursor: default;

    &:hover { transform: translateY(-2px); }
    &.highlight { 
      background: linear-gradient(135deg, $brand-blue, #165DFF); 
      .info-label, .info-value { color: #fff; }
    }

    .info-icon { font-size: 28px; }
    .info-map { 
      width: 48px; height: 48px; 
      background: #e0e0e0; 
      border-radius: 8px; 
      display: flex; align-items: center; justify-content: center;
      font-size: 20px;
    }
    .info-content {
      .info-label { font-size: 12px; color: $text-secondary; margin-bottom: 4px; }
      .info-value { font-size: 15px; color: $text-main; font-weight: 500; }
      .info-days { font-size: 12px; color: #00b42a; margin-top: 2px; }
    }
  }
}

/* 3. 设备台账 */
.device-top {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;

  .chart-box {
    flex: 1;
    height: 220px;
    background: $bg-gray;
    border-radius: 10px;
    padding: 10px;
    
    .chart { width: 100%; height: 100%; }
  }
}

.table-toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.custom-table {
  border-radius: 8px;
  overflow: hidden;
  
  :deep(.el-table__header-wrapper th) { background-color: $bg-gray; font-weight: bold; }
}

.device-icon { margin-right: 6px; }

/* 4. 设计图纸 */
.drawing-layout {
  display: flex;
  gap: 20px;

  .drawing-filter {
    width: 200px;
    background: $bg-gray;
    padding: 16px;
    border-radius: 10px;
    flex-shrink: 0;

    .filter-title { font-size: 14px; font-weight: bold; margin-bottom: 12px; color: $text-main; }
    .mt-4 { margin-top: 20px; }
    :deep(.el-checkbox) { display: block; margin-bottom: 8px; }
  }

  .drawing-list {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
    align-content: start;

    .drawing-card {
      background: #fff;
      border: 1px solid #e5e6eb;
      border-radius: 10px;
      overflow: hidden;
      transition: all 0.3s;

      &:hover {
        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        transform: translateY(-2px);
      }

      .drawing-thumb {
        height: 120px;
        background: $bg-gray;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 40px;
      }

      .drawing-info {
        padding: 12px;

        .drawing-name { font-size: 14px; font-weight: bold; color: $text-main; margin-bottom: 4px; }
        .drawing-id { font-size: 12px; color: #999; margin-bottom: 8px; }
        .drawing-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          .drawing-date { font-size: 12px; color: $text-secondary; }
        }
        .drawing-actions { display: flex; gap: 10px; }
      }
    }
  }
}
</style>