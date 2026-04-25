<template>
  <div class="pv-run-data-page">
    <!-- 加载状态条 -->
    <div class="status-bar">
      <span class="status-text">数据上报时间：2026-04-16 10:35:41 · 5分钟前</span>
    </div>

    <!-- 第一行：方形仪表盘 + 2x2 卡片网格 -->
    <div class="row-top">
      <!-- 左侧方形仪表盘 -->
      <div class="gauge-card">
        <div class="card-header">
          <el-icon class="header-icon" color="#409EFF" :size="22"><Odometer /></el-icon>
          <span class="card-title">实时功率</span>
        </div>
        <div ref="gaugeRef" class="gauge-chart"></div>
        <div class="gauge-footer">
          <span class="capacity-label">组件总容量</span>
          <span class="capacity-value">2.336 MWp</span>
        </div>
      </div>

      <!-- 右侧 2x2 发电指标卡片 -->
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-header">
            <el-icon color="#409EFF" :size="20"><Sunny /></el-icon>
            <span>实时功率</span>
          </div>
          <div class="metric-main">
            <span class="metric-number">42.84</span>
            <span class="metric-unit">kW</span>
          </div>
          <div class="metric-footer">
            <span>组件总容量 2.336MWp</span>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-header">
            <el-icon color="#409EFF" :size="20"><DataLine /></el-icon>
            <span>当日电量</span>
          </div>
          <div class="metric-main">
            <span class="metric-number">5.573</span>
            <span class="metric-unit">MWh</span>
          </div>
          <div class="metric-footer">
            <span>当日收益 2229元</span>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-header">
            <el-icon color="#409EFF" :size="20"><Calendar /></el-icon>
            <span>当月电量</span>
          </div>
          <div class="metric-main">
            <span class="metric-number">116.771</span>
            <span class="metric-unit">MWh</span>
          </div>
          <div class="metric-footer">
            <span>当月收益 4.67万元</span>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-header">
            <el-icon color="#409EFF" :size="20"><TrendCharts /></el-icon>
            <span>累计电量</span>
          </div>
          <div class="metric-main">
            <span class="metric-number">972.79</span>
            <span class="metric-unit">MWh</span>
          </div>
          <div class="metric-footer">
            <span>累计收益 38.911万元</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 第二行：发电数据趋势 -->
    <div class="trend-card">
      <div class="card-header space-between">
        <span class="card-title">发电功率趋势</span>
        <div class="trend-tools">
          <el-date-picker v-model="selectDate" type="date" size="default" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
          <el-radio-group v-model="dateType" size="default">
            <el-radio-button value="day">日</el-radio-button>
            <el-radio-button value="month">月</el-radio-button>
            <el-radio-button value="year">年</el-radio-button>
            <el-radio-button value="total">总</el-radio-button>
          </el-radio-group>
          <el-button>参数选择</el-button>
          <el-button>导出</el-button>
        </div>
      </div>
      <div ref="powerChartRef" class="trend-chart"></div>
    </div>

    <!-- 第三行：温度监测 + 环境监测 + 电站评估 -->
    <div class="row-third">
      <!-- 温度监测模块 -->
      <div class="temp-card">
        <div class="card-header">
          <el-icon color="#409EFF" :size="18"><WindPower /></el-icon>
          <span class="card-title">温度监测</span>
        </div>
        <div class="temp-content">
          <div class="temp-main">
            <span class="temp-value">24.5</span>
            <span class="temp-unit">°C</span>
          </div>
          <div class="temp-range">
            <span>组件温度 42.3°C</span>
            <span>环境温度 21.8°C</span>
          </div>
        </div>
      </div>

      <!-- 环境监测模块 -->
      <div class="env-card">
        <div class="card-header">
          <el-icon color="#409EFF" :size="18"><Sunrise /></el-icon>
          <span class="card-title">环境监测</span>
        </div>
        <div class="env-list">
          <div class="env-item">
            <span class="env-label">辐照度</span>
            <span class="env-value">856 W/m²</span>
          </div>
          <div class="env-item">
            <span class="env-label">湿度</span>
            <span class="env-value">58 %RH</span>
          </div>
          <div class="env-item">
            <span class="env-label">风速</span>
            <span class="env-value">3.2 m/s</span>
          </div>
          <div class="env-item">
            <span class="env-label">风向</span>
            <span class="env-value">东南</span>
          </div>
        </div>
      </div>

      <!-- 电站评估数据 -->
      <div class="eval-card">
        <div class="card-header">
          <el-icon color="#409EFF" :size="18"><DataAnalysis /></el-icon>
          <span class="card-title">电站评估</span>
        </div>
        <div class="eval-list">
          <div class="eval-item">
            <span class="eval-label">综合效率</span>
            <span class="eval-value">86.5%</span>
          </div>
          <div class="eval-item">
            <span class="eval-label">等效利用小时</span>
            <span class="eval-value">3.2 h</span>
          </div>
          <div class="eval-item">
            <span class="eval-label">性能比 PR</span>
            <span class="eval-value">82.3%</span>
          </div>
          <div class="eval-item">
            <span class="eval-label">故障损失</span>
            <span class="eval-value">0.12 MWh</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 第四行：社会贡献模块 -->
    <div class="social-card">
      <div class="card-header">
        <span class="card-title">社会贡献</span>
      </div>
      <div class="social-stats">
        <div class="social-item">
          <span class="social-number">387.5</span>
          <span class="social-unit">吨</span>
          <span class="social-label">CO₂减排</span>
        </div>
        <div class="social-item">
          <span class="social-number">156.2</span>
          <span class="social-unit">吨</span>
          <span class="social-label">标煤节约</span>
        </div>
        <div class="social-item">
          <span class="social-number">2,380</span>
          <span class="social-unit">棵</span>
          <span class="social-label">等效植树</span>
        </div>
      </div>
    </div>

    <!-- 第五行：电站物理布局图 -->
    <div class="layout-card">
      <div class="card-header">
        <span class="card-title">电站物理布局</span>
      </div>
      <div class="layout-placeholder">
        <el-icon :size="40" color="#b0c8e0"><MapLocation /></el-icon>
        <span>光伏阵列布局示意图（占位）</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { 
  ElDatePicker, ElRadioGroup, ElRadioButton, ElButton, ElIcon 
} from 'element-plus'
import { 
  Sunny, DataLine, Calendar, TrendCharts, Odometer, 
  WindPower, Sunrise, DataAnalysis, MapLocation 
} from '@element-plus/icons-vue'

const selectDate = ref('2026-04-16')
const dateType = ref('day')

const gaugeRef = ref(null)
const powerChartRef = ref(null)
let gaugeChart = null
let powerChart = null

const initGauge = () => {
  if (!gaugeRef.value) return
  gaugeChart = echarts.init(gaugeRef.value)
  const deepColor = new echarts.graphic.LinearGradient(0, 0, 1, 0, [
    { offset: 0, color: '#2d7dd2' },
    { offset: 1, color: '#1a5aaa' }
  ])
  gaugeChart.setOption({
    backgroundColor: 'transparent',
    series: [{
      type: 'gauge',
      center: ['50%', '50%'],
      radius: '75%',
      startAngle: 200,
      endAngle: -20,
      min: 0,
      max: 100,
      axisLabel: { distance: -25, fontSize: 14, color: '#888' },
      axisTick: { distance: -14, length: 4, lineStyle: { color: '#bbb' } },
      splitLine: { distance: -14, length: 8, lineStyle: { color: '#bbb' } },
      axisLine: { lineStyle: { width: 18, color: [[1, '#e9eef4']], cap: 'round' } },
      progress: { show: true, width: 18, cap: 'round', itemStyle: { color: deepColor } },
      pointer: { length: '65%', width: 4, itemStyle: { color: '#1a5aaa' } },
      anchor: { size: 10, itemStyle: { color: '#1a5aaa' } },
      title: { show: false },
      detail: {
        fontSize: 36,
        fontWeight: 600,
        color: '#1a5aaa',
        offsetCenter: [0, '55%'],
        formatter: '743kW'
      },
      data: [{ value: 32 }]
    }]
  })
}

const initTrendChart = () => {
  if (!powerChartRef.value) return
  powerChart = echarts.init(powerChartRef.value)
  powerChart.setOption({
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '3%', top: 25, bottom: 25, containLabel: true },
    xAxis: {
      type: 'category',
      data: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
      axisLabel: { color: '#666', fontSize: 13 }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#eee' } },
      axisLabel: { color: '#666', fontSize: 13 }
    },
    series: [{
      type: 'line',
      smooth: true,
      data: [0, 0, 0, 0, 220, 780, 160, 0, 0, 0, 0, 0],
      lineStyle: { color: '#409EFF', width: 3 },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(64,158,255,0.35)' },
          { offset: 1, color: 'rgba(64,158,255,0.05)' }
        ])
      },
      symbol: 'circle',
      symbolSize: 8,
      itemStyle: { color: '#409EFF' }
    }]
  })
}

const handleResize = () => {
  gaugeChart?.resize()
  powerChart?.resize()
}

onMounted(() => {
  initGauge()
  initTrendChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  gaugeChart?.dispose()
  powerChart?.dispose()
})
</script>

<style scoped>
.pv-run-data-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  background: #f5f7fa;
  font-family: "Microsoft YaHei", sans-serif;
  box-sizing: border-box;
}

.status-bar,
.gauge-card,
.metric-card,
.trend-card,
.temp-card,
.env-card,
.eval-card,
.social-card,
.layout-card {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.04);
  padding: 20px 24px;
  box-sizing: border-box;
}

.status-bar {
  padding: 14px 24px;
  margin-bottom: 20px;
}
.status-text {
  color: #409EFF;
  font-size: 16px;
  font-weight: 500;
}

.row-top {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.gauge-card {
  flex: 0 0 34%;
  display: flex;
  flex-direction: column;
}
.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.header-icon {
  margin-right: 4px;
}
.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a2b3c;
}
.gauge-chart {
  flex: 1;
  min-height: 160px;
  width: 100%;
}
.gauge-footer {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
  margin-top: 5px;
}
.capacity-label {
  font-size: 14px;
  color: #666;
}
.capacity-value {
  font-size: 18px;
  font-weight: 600;
  color: #1a2b3c;
}

.metrics-grid {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.metric-card {
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.metric-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  color: #444;
  margin-bottom: 12px;
}
.metric-main {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 8px;
}
.metric-number {
  font-size: 34px;
  font-weight: 700;
  color: #1a2b3c;
  line-height: 1.2;
}
.metric-unit {
  font-size: 18px;
  color: #888;
}
.metric-footer {
  font-size: 14px;
  color: #999;
}

.trend-card {
  margin-bottom: 20px;
}
.space-between {
  justify-content: space-between;
}
.trend-tools {
  display: flex;
  align-items: center;
  gap: 12px;
}
.trend-chart {
  width: 100%;
  height: 250px;
  margin-top: 10px;
}

.row-third {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}
.temp-card {
  flex: 0 0 28%;
}
.temp-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100% - 40px);
}
.temp-main {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 16px;
}
.temp-value {
  font-size: 48px;
  font-weight: 700;
  color: #1a2b3c;
}
.temp-unit {
  font-size: 22px;
  color: #888;
}
.temp-range {
  display: flex;
  gap: 20px;
  font-size: 15px;
  color: #666;
}

.env-card {
  flex: 0 0 27%;
}
.env-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 20px;
  margin-top: 15px;
}
.env-item {
  display: flex;
  flex-direction: column;
}
.env-label {
  font-size: 14px;
  color: #888;
  margin-bottom: 4px;
}
.env-value {
  font-size: 20px;
  font-weight: 600;
  color: #1a2b3c;
}

.eval-card {
  flex: 0 0 37%;
}
.eval-list {
  margin-top: 15px;
}
.eval-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}
.eval-label {
  font-size: 15px;
  color: #666;
}
.eval-value {
  font-size: 18px;
  font-weight: 600;
  color: #1a2b3c;
}

.social-card {
  margin-bottom: 20px;
  padding: 16px 24px;
}
.social-stats {
  display: flex;
  justify-content: space-around;
  align-items: center;
}
.social-item {
  display: flex;
  align-items: baseline;
  gap: 6px;
}
.social-number {
  font-size: 32px;
  font-weight: 700;
  color: #2d7dd2;
}
.social-unit {
  font-size: 16px;
  color: #888;
  margin-right: 12px;
}
.social-label {
  font-size: 15px;
  color: #666;
}

.layout-card {
  margin-bottom: 0;
  padding: 16px 24px;
}
.layout-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 80px;
  background: #f9fafc;
  border-radius: 6px;
  color: #7f9fbf;
  font-size: 16px;
  gap: 8px;
  margin-top: 10px;
}

:deep(.el-radio-button__orig-radio:checked + .el-radio-button__inner) {
  background-color: #409EFF !important;
  border-color: #409EFF !important;
}
:deep(.el-button:hover) {
  color: #409EFF;
  border-color: #409EFF;
}
</style>