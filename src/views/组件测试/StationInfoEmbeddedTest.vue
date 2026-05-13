<template>
  <div class="test-app">
    <!-- 模拟全局一级导航栏 -->
    <div class="global-header">光伏电站管理系统 - 内嵌电站列表测试</div>
    <div class="global-layout">
      <!-- 全局侧边栏（模拟 AppSidebar 收缩） -->
      <aside class="global-sidebar" :class="{ collapsed: globalCollapsed }">
        <div class="nav-item" :class="{ active: globalActive === 'dashboard' }" @click="globalActive = 'dashboard'">
          <el-icon><PieChart /></el-icon>
          <span v-show="!globalCollapsed">电站概览</span>
        </div>
        <div class="nav-item" :class="{ active: globalActive === 'station-info' }" @click="globalActive = 'station-info'">
          <el-icon><Sunny /></el-icon>
          <span v-show="!globalCollapsed">电站信息</span>
        </div>
        <div class="collapse-btn" @click="globalCollapsed = !globalCollapsed">
          <el-icon><DArrowLeft v-if="!globalCollapsed" /><DArrowRight v-else /></el-icon>
        </div>
      </aside>

      <!-- 主内容区 -->
      <div class="main-container">
        <!-- 内嵌式电站列表（不再绝对定位，而是 flex 子项） -->
        <div class="station-panel" :class="{ 'panel-collapsed': stationPanelCollapsed }">
          <div v-if="!stationPanelCollapsed" class="panel-content">
            <div class="search-box">
              <el-input v-model="searchQuery" placeholder="请输入电站名" clearable />
            </div>
            <div class="station-list">
              <div
                v-for="station in filteredStations"
                :key="station.id"
                class="station-item"
                :class="{ active: selectedStationId === station.id }"
                @click="selectedStationId = station.id"
              >
                <span class="status-dot" :style="{ backgroundColor: station.statusColor }"></span>
                {{ station.name }}
              </div>
            </div>
          </div>
        </div>

        <!-- 折叠拉手 -->
        <div class="panel-handle" @click="stationPanelCollapsed = !stationPanelCollapsed">
          <el-icon><ArrowLeft v-if="!stationPanelCollapsed" /><ArrowRight v-else /></el-icon>
        </div>

        <!-- 右侧发电信息主体 -->
        <div class="power-content" ref="powerContentRef">
          <div class="header">
            <el-icon><Location /></el-icon>
            <span class="station-title">{{ selectedStation?.name || '请选择电站' }}</span>
          </div>

          <!-- 仪表盘 + KPI 卡片（方案C布局） -->
          <div class="dashboard-row">
            <div class="gauge-card">
              <div ref="gaugeChartRef" style="width:100%;height:300px;"></div>
            </div>
            <div class="kpi-cards">
              <div class="kpi-item">
                <div class="kpi-label">当日发电量</div>
                <div class="kpi-value">1,280 <small>kWh</small></div>
              </div>
              <div class="kpi-item">
                <div class="kpi-label">当日收益</div>
                <div class="kpi-value">¥ 896 <small>元</small></div>
              </div>
              <div class="kpi-item">
                <div class="kpi-label">系统运行状态</div>
                <div class="kpi-state">
                  <span class="state-alarm"><span class="dot"></span>告警 2</span>
                  <span class="state-offline"><span class="dot"></span>离线 1</span>
                  <span class="state-online"><span class="dot"></span>在线 15</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 趋势图 -->
          <div class="trend-card">
            <div ref="trendChartRef" style="width:100%;height:300px;"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { PieChart, Sunny, DArrowLeft, DArrowRight, ArrowLeft, ArrowRight, Location } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

// ----- 模拟数据 -----
const stations = [
  { id: '1', name: '裕同2000KW光伏发电', status: 1, statusColor: '#67c23a' },
  { id: '2', name: '欧菲光1000KW光伏电站', status: 2, statusColor: '#909399' },
  { id: '3', name: '创维500KW屋顶电站', status: 1, statusColor: '#67c23a' },
  { id: '4', name: '华星光电800KW电站', status: 0, statusColor: '#f56c6c' }
]

// ----- 全局导航状态 -----
const globalCollapsed = ref(false)
const globalActive = ref('station-info')

// ----- 电站列表面板状态 -----
const stationPanelCollapsed = ref(false)
const searchQuery = ref('')
const selectedStationId = ref('1')

const filteredStations = computed(() => {
  if (!searchQuery.value) return stations
  return stations.filter(s => s.name.includes(searchQuery.value))
})
const selectedStation = computed(() => stations.find(s => s.id === selectedStationId.value))

// ----- 图表引用 -----
const gaugeChartRef = ref(null)
const trendChartRef = ref(null)
let gaugeChart = null
let trendChart = null

// 初始化仪表盘
const initGauge = () => {
  if (!gaugeChartRef.value) return
  gaugeChart = echarts.init(gaugeChartRef.value)
  gaugeChart.setOption({
    series: [{
      type: 'gauge',
      startAngle: 210,
      endAngle: -30,
      center: ['50%', '55%'],
      radius: '78%',
      min: 0,
      max: 100,
      splitNumber: 10,
      axisLine: { show: true, lineStyle: { width: 16, color: [[0.3, '#67c23a'], [0.7, '#e6a23c'], [1, '#f56c6c']] } },
      pointer: { icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z', length: '70%', width: 6, offsetCenter: [0, '-10%'], itemStyle: { color: '#409eff' } },
      axisTick: { length: 10, lineStyle: { width: 2, color: 'auto' } },
      splitLine: { length: 20, lineStyle: { width: 4, color: 'auto' } },
      axisLabel: { distance: -40, color: '#999', fontSize: 12, formatter: Math.round },
      detail: { formatter: '{value}%', offsetCenter: [0, '60%'], fontSize: 22, color: '#333' },
      data: [{ value: 87 }]
    }]
  })
}

// 初始化趋势图
const initTrend = () => {
  if (!trendChartRef.value) return
  trendChart = echarts.init(trendChartRef.value)
  const hours = ['6:00','7:00','8:00','9:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00']
  const powerData = [0, 12, 35, 68, 95, 112, 105, 98, 115, 108, 72, 30, 5]
  trendChart.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: hours, boundaryGap: false },
    yAxis: { type: 'value', name: 'kW' },
    series: [{
      type: 'line',
      data: powerData,
      smooth: true,
      areaStyle: { opacity: 0.2 },
      lineStyle: { color: '#409eff' }
    }]
  })
}

// 窗口大小改变或布局变化时重绘
const resizeCharts = () => {
  nextTick(() => {
    gaugeChart?.resize()
    trendChart?.resize()
  })
}

// 监听可能的宽度变化：全局侧边栏折叠、电站面板折叠
watch([globalCollapsed, stationPanelCollapsed], () => {
  resizeCharts()
})

window.addEventListener('resize', resizeCharts)

onMounted(() => {
  initGauge()
  initTrend()
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeCharts)
  gaugeChart?.dispose()
  trendChart?.dispose()
})
</script>

<style scoped>
/* 全局重置 */
* { margin: 0; padding: 0; box-sizing: border-box; }

.test-app {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
  font-family: 'Microsoft YaHei', sans-serif;
}

.global-header {
  height: 60px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  padding: 0 20px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  flex-shrink: 0;
}

.global-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* 模拟全局侧边栏 */
.global-sidebar {
  width: 160px;
  background: #fff;
  border-radius: 0 12px 12px 0;
  box-shadow: 2px 0 8px rgba(0,0,0,0.05);
  padding: 10px 10px 0;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: width 0.25s ease;
}
.global-sidebar.collapsed {
  width: 80px;
}
.nav-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 4px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition: background 0.2s;
}
.nav-item.active {
  background-color: #eef7ff;
  color: #0066cc;
}
.nav-item:hover { background: #f5f7fa; }
.nav-item .el-icon { font-size: 20px; margin-right: 10px; }
.collapsed .nav-item { justify-content: center; padding: 12px 0; }
.collapsed .nav-item .el-icon { margin-right: 0; }
.collapse-btn {
  margin-top: auto;
  padding: 10px;
  text-align: center;
  cursor: pointer;
  color: #909399;
  transition: color 0.2s;
}
.collapse-btn:hover { color: #409eff; }

/* 主容器（flex:1） */
.main-container {
  flex: 1;
  display: flex;
  overflow: hidden;
  padding: 10px;
  gap: 10px;
  position: relative;
}

/* 内嵌电站面板 */
.station-panel {
  width: 280px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  overflow: hidden;
  transition: width 0.25s ease, padding 0.25s ease;
  flex-shrink: 0;
}
.station-panel.panel-collapsed {
  width: 0;
  padding: 0;
}
.panel-content {
  width: 280px; /* 防止收缩折断内容 */
  height: 100%;
  display: flex;
  flex-direction: column;
}
.search-box { padding: 16px; }
.station-list { flex: 1; overflow-y: auto; }
.station-item {
  padding: 12px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #333;
  transition: background 0.2s;
}
.station-item.active {
  background: #ecf5ff;
  color: #409eff;
}
.station-item:hover { background: #f5f7fa; }
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
}

/* 折叠拉手 */
.panel-handle {
  width: 18px;
  height: 60px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 0 8px 8px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #606266;
  transition: background 0.2s, transform 0.25s;
  flex-shrink: 0;
}
.panel-handle:hover { background: #ecf5ff; color: #409eff; }
.panel-handle .el-icon { font-size: 14px; }

/* 右侧发电信息 */
.power-content {
  flex: 1;
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.header {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  gap: 8px;
}

/* 仪表盘行 */
.dashboard-row {
  display: flex;
  gap: 16px;
}
.gauge-card {
  width: 280px;
  height: 300px;
  background: #f9fbfd;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.kpi-cards {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.kpi-item {
  background: #f9fbfd;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 300px;
}
.kpi-label { font-size: 14px; color: #86909c; margin-bottom: 12px; }
.kpi-value { font-size: 28px; font-weight: 700; color: #333; }
.kpi-value small { font-size: 14px; color: #86909c; margin-left: 4px; }
.kpi-state { display: flex; flex-direction: column; gap: 6px; }
.kpi-state span { display: flex; align-items: center; font-size: 14px; color: #333; }
.state-alarm .dot { background: #f56c6c; }
.state-offline .dot { background: #e6a23c; }
.state-online .dot { background: #67c23a; }
.dot {
  width: 8px; height: 8px; border-radius: 50%; margin-right: 6px;
}

/* 趋势图卡片 */
.trend-card {
  background: #f9fbfd;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
</style>