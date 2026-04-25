<template>
  <div class="pv-run-data-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">🏭 光伏电站运行数据中心</h1>
        <div class="update-info">
          <span class="status-dot"></span>
          <span>数据加载完成</span>
          <span class="separator">·</span>
          <span>最后更新 {{ currentTime }}</span>
        </div>
      </div>
      <div class="header-right">
        <el-button type="primary" class="btn-export">
          <span>📤</span> 导出报表
        </el-button>
      </div>
    </div>

    <!-- 第一行：实时功率(居中+撑大) + 发电指标(6项) -->
    <div class="row-top">
      <!-- 实时功率卡片：仪表盘居中，当前功率放仪表盘下方 -->
      <div class="gauge-card">
        <div class="card-header">
          <span class="card-title">⚡ 实时功率</span>
        </div>
        <div class="gauge-wrapper">
          <div class="gauge-chart" ref="gaugeRef"></div>
          <div class="power-value">
            <div class="power-number">42.84<span class="power-unit">kW</span></div>
            <div class="power-label">当前功率</div>
          </div>
        </div>
      </div>

      <!-- 发电指标：6个卡片 -->
      <div class="kpi-card">
        <div class="card-header">
          <span class="card-title">📊 发电指标</span>
        </div>
        <div class="kpi-grid">
          <div class="kpi-item highlight">
            <div class="kpi-label">当日发电量</div>
            <div class="kpi-value">5.573 <span class="unit">MWh</span></div>
            <div class="kpi-sub">日收益 2,229 元</div>
          </div>
          <div class="kpi-item">
            <div class="kpi-label">当月发电量</div>
            <div class="kpi-value">116.77 <span class="unit">MWh</span></div>
            <div class="kpi-sub">月收益 4.67 万元</div>
          </div>
          <div class="kpi-item">
            <div class="kpi-label">累计发电量</div>
            <div class="kpi-value">972.79 <span class="unit">MWh</span></div>
            <div class="kpi-sub">累计收益 38.91 万元</div>
          </div>
          <div class="kpi-item">
            <div class="kpi-label">日满发小时数</div>
            <div class="kpi-value">0.86 <span class="unit">h</span></div>
            <div class="kpi-sub">日发电量 2.01 MWh</div>
          </div>
          <div class="kpi-item">
            <div class="kpi-label">组件总容量</div>
            <div class="kpi-value">2.336 <span class="unit">MWp</span></div>
            <div class="kpi-sub">直流侧容量</div>
          </div>
          <div class="kpi-item">
            <div class="kpi-label">实时功率占比</div>
            <div class="kpi-value">1.83 <span class="unit">%</span></div>
            <div class="kpi-sub">当前/总额定</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 第二行：发电功率趋势(关闭动画，容器撑高) -->
    <div class="chart-card">
      <div class="card-header space-between">
        <span class="card-title">📈 发电功率趋势</span>
        <div class="chart-tools">
          <el-radio-group v-model="dateType" size="large" @change="handleDateTypeChange">
            <el-radio-button value="day">日</el-radio-button>
            <el-radio-button value="month">月</el-radio-button>
            <el-radio-button value="year">年</el-radio-button>
            <el-radio-button value="total">总</el-radio-button>
          </el-radio-group>
          <el-date-picker 
            v-model="selectDate" 
            :type="dateType === 'month' ? 'month' : 'date'" 
            placeholder="选择日期" 
            size="large" 
          />
        </div>
      </div>
      <div class="chart-container">
        <div ref="powerChartRef" class="chart-box"></div>
      </div>
    </div>

    <!-- 第三行：温度监测 + 环境监测 + 电站评估 -->
    <div class="row-middle">
      <!-- 温度监测 -->
      <div class="temp-card">
        <div class="card-header space-between">
          <span class="card-title">🌡️ 温度监测</span>
          <el-radio-group v-model="tempDateType" size="small">
            <el-radio-button value="day">日</el-radio-button>
            <el-radio-button value="week">周</el-radio-button>
          </el-radio-group>
        </div>
        <div class="temp-chart-container">
          <div ref="tempChartRef" class="temp-chart"></div>
        </div>
        <div class="temp-legend">
          <div class="legend-item">
            <span class="legend-dot orange"></span>
            <span>组件温度</span>
            <span class="legend-value">45.2°C</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot blue"></span>
            <span>环境温度</span>
            <span class="legend-value">24.5°C</span>
          </div>
        </div>
      </div>

      <!-- 环境监测 -->
      <div class="env-card">
        <div class="card-header">
          <span class="card-title">🌤️ 环境监测</span>
        </div>
        <div class="env-grid">
          <div class="env-item">
            <div class="env-icon">☀️</div>
            <div class="env-info">
              <span class="env-label">辐照度</span>
              <span class="env-value">856 <span class="unit">W/m²</span></span>
            </div>
          </div>
          <div class="env-item">
            <div class="env-icon">🌡️</div>
            <div class="env-info">
              <span class="env-label">温度</span>
              <span class="env-value">24.5 <span class="unit">°C</span></span>
            </div>
          </div>
          <div class="env-item">
            <div class="env-icon">💧</div>
            <div class="env-info">
              <span class="env-label">湿度</span>
              <span class="env-value">58 <span class="unit">%RH</span></span>
            </div>
          </div>
          <div class="env-item">
            <div class="env-icon">💨</div>
            <div class="env-info">
              <span class="env-label">风速</span>
              <span class="env-value">3.2 <span class="unit">m/s</span></span>
            </div>
          </div>
          <div class="env-item">
            <div class="env-icon">🧭</div>
            <div class="env-info">
              <span class="env-label">风向</span>
              <span class="env-value">东南</span>
            </div>
          </div>
          <div class="env-item">
            <div class="env-icon">☁️</div>
            <div class="env-info">
              <span class="env-label">天气</span>
              <span class="env-value">晴</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 电站评估 -->
      <div class="eval-card">
        <div class="card-header">
          <span class="card-title">🎯 电站评估</span>
        </div>
        <div class="eval-list">
          <div class="eval-row">
            <span class="eval-label">综合效率</span>
            <span class="eval-value highlight">86.5%</span>
          </div>
          <div class="eval-row">
            <span class="eval-label">等效利用小时</span>
            <span class="eval-value">3.2 h</span>
          </div>
          <div class="eval-row">
            <span class="eval-label">性能比 PR</span>
            <span class="eval-value">82.3%</span>
          </div>
          <div class="eval-row">
            <span class="eval-label">故障损失</span>
            <span class="eval-value warning">0.12 MWh</span>
          </div>
          <div class="eval-row">
            <span class="eval-label">可用率</span>
            <span class="eval-value success">99.8%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 第四行：社会贡献(拉高数字不挤) + 物理布局(拉高) -->
    <div class="row-bottom">
      <!-- 社会贡献 -->
      <div class="social-card">
        <div class="card-header">
          <span class="card-title">🌱 社会贡献</span>
        </div>
        <div class="social-stats">
          <div class="social-stat">
            <div class="stat-number">387.5 <span>吨</span></div>
            <div class="stat-label">CO₂减排</div>
          </div>
          <div class="social-stat">
            <div class="stat-number">156.2 <span>吨</span></div>
            <div class="stat-label">标煤节约</div>
          </div>
          <div class="social-stat">
            <div class="stat-number">2,380 <span>棵</span></div>
            <div class="stat-label">等效植树</div>
          </div>
          <div class="social-stat">
            <div class="stat-number">1,258 <span>MWh</span></div>
            <div class="stat-label">绿色发电</div>
          </div>
        </div>
      </div>

      <!-- 电站物理布局 -->
      <div class="layout-card">
        <div class="card-header space-between">
          <span class="card-title">🗺️ 电站物理布局</span>
          <el-button link type="primary">查看详情</el-button>
        </div>
        <div class="layout-placeholder">
          📐 光伏阵列布局示意图
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

const selectDate = ref('2026-04-16')
const dateType = ref('day')
const tempDateType = ref('day')

const gaugeRef = ref(null)
const powerChartRef = ref(null)
const tempChartRef = ref(null)

let gaugeChart = null
let powerChart = null
let tempChart = null

// 模拟数据
const powerDataByType = {
  day: {
    xAxis: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
    data: [0, 0, 0, 0, 220, 780, 1200, 980, 650, 320, 0, 0],
    title: '日功率曲线'
  },
  month: {
    xAxis: ['1日', '5日', '10日', '15日', '20日', '25日', '30日'],
    data: [4200, 4800, 5100, 3900, 4600, 5200, 4500],
    title: '月发电量趋势'
  },
  year: {
    xAxis: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    data: [120, 135, 158, 175, 198, 220, 245, 238, 195, 165, 140, 118],
    title: '年月发电量'
  },
  total: {
    xAxis: ['2022', '2023', '2024', '2025', '2026'],
    data: [850, 920, 980, 1050, 972],
    title: '年累计发电量'
  }
}

const currentTime = computed(() => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
})

// 仪表盘
const initGauge = () => {
  if (!gaugeRef.value) return
  gaugeChart = echarts.init(gaugeRef.value)
  const gradient = new echarts.graphic.LinearGradient(0, 0, 1, 0, [
    { offset: 0, color: '#ff9a42' },
    { offset: 1, color: '#ff6b00' }
  ])
  gaugeChart.setOption({
    backgroundColor: 'transparent',
    series: [{
      type: 'gauge',
      center: ['50%', '55%'],
      radius: '90%',
      startAngle: 200,
      endAngle: -20,
      min: 0,
      max: 100,
      splitNumber: 5,
      axisLabel: { distance: -25, fontSize: 12, color: '#aaa' },
      axisTick: { distance: -15, length: 6, lineStyle: { color: '#ccc' } },
      splitLine: { distance: -15, length: 10, lineStyle: { color: '#ccc' } },
      axisLine: { lineStyle: { width: 18, color: [[1, '#e9eef4']] } },
      progress: { show: true, width: 18, itemStyle: { color: gradient } },
      pointer: { length: '60%', width: 5, itemStyle: { color: '#ff6b00' } },
      anchor: { size: 12, itemStyle: { color: '#ff6b00' } },
      title: { show: false },
      detail: { show: false },
      data: [{ value: 32 }]
    }]
  })
}

// 功率趋势图（关闭动画）
const initPowerChart = () => {
  if (!powerChartRef.value) return
  powerChart = echarts.init(powerChartRef.value)
  updatePowerChart()
}

const updatePowerChart = () => {
  const config = powerDataByType[dateType.value]
  powerChart.setOption({
    backgroundColor: 'transparent',
    title: {
      text: config.title,
      left: 'center',
      textStyle: { fontSize: 14, color: '#666', fontWeight: 500 }
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(50, 50, 50, 0.9)',
      textStyle: { color: '#fff', fontSize: 13 },
      padding: [10, 14],
      axisPointer: { type: 'cross', lineStyle: { color: '#ff9a42', type: 'dashed' } }
    },
    legend: { bottom: 10, left: 'center', itemIcon: 'diamond', textStyle: { color: '#ff9a42' }, data: ['功率'] },
    grid: { left: '3%', right: '3%', top: '18%', bottom: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#666', fontSize: 12 },
      data: config.xAxis
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#f0f0f0' } },
      axisLabel: { color: '#666', fontSize: 12 }
    },
    series: [{
      name: '功率',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      animation: false,
      itemStyle: { color: '#ff9a42' },
      lineStyle: { color: '#ff9a42', width: 3 },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(255,154,66,0.3)' },
          { offset: 1, color: 'rgba(255,154,66,0.05)' }
        ])
      },
      data: config.data
    }]
  })
}

// 温度曲线图（关闭动画）
const initTempChart = () => {
  if (!tempChartRef.value) return
  tempChart = echarts.init(tempChartRef.value)
  tempChart.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(50, 50, 50, 0.9)',
      textStyle: { color: '#fff', fontSize: 13 },
      padding: [10, 14]
    },
    legend: { show: false },
    grid: { left: '3%', right: '3%', top: '10%', bottom: '5%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#666', fontSize: 11 },
      data: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00']
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 60,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } },
      axisLabel: { color: '#666', fontSize: 11, formatter: '{value}°C' }
    },
    series: [
      {
        name: '组件温度',
        type: 'line',
        smooth: true,
        symbol: 'none',
        animation: false,
        lineStyle: { color: '#ff6b00', width: 2 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(255,107,0,0.2)' },
            { offset: 1, color: 'rgba(255,107,0,0)' }
          ])
        },
        data: [18, 17, 16, 17, 25, 35, 45, 48, 42, 35, 26, 20]
      },
      {
        name: '环境温度',
        type: 'line',
        smooth: true,
        symbol: 'none',
        animation: false,
        lineStyle: { color: '#409EFF', width: 2 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64,158,255,0.2)' },
            { offset: 1, color: 'rgba(64,158,255,0)' }
          ])
        },
        data: [15, 14, 13, 14, 20, 25, 28, 30, 27, 23, 18, 16]
      }
    ]
  })
}

const handleDateTypeChange = () => {
  updatePowerChart()
}

const handleResize = () => {
  gaugeChart?.resize()
  powerChart?.resize()
  tempChart?.resize()
}

onMounted(() => {
  initGauge()
  initPowerChart()
  initTempChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  gaugeChart?.dispose()
  powerChart?.dispose()
  tempChart?.dispose()
})
</script>

<style scoped>
/* ==================== 整体布局 ==================== */
.pv-run-data-page {
  width: 100%;
  min-height: calc(100vh - 120px);
  background: linear-gradient(135deg, #f8f9fb 0%, #e8ecf0 100%);
  padding: 24px;
  box-sizing: border-box;
  font-family: "Microsoft YaHei", sans-serif;
}

/* ==================== 页面头部 ==================== */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px 28px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
}
.header-left { display: flex; flex-direction: column; gap: 8px; }
.page-title { font-size: 26px; font-weight: 700; color: #fff; margin: 0; }
.update-info { display: flex; align-items: center; gap: 8px; font-size: 14px; color: rgba(255,255,255,0.7); }
.status-dot { width: 8px; height: 8px; background: #52c41a; border-radius: 50%; animation: pulse 2s infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
.separator { color: rgba(255,255,255,0.4); }
.btn-export { background: linear-gradient(135deg, #ff9a42, #ff6b00); border: none; border-radius: 8px; padding: 12px 24px; font-weight: 600; }

/* ==================== 卡片通用 ==================== */
.gauge-card, .kpi-card, .chart-card, .temp-card, .env-card, .eval-card, .social-card, .layout-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  box-sizing: border-box;
}
.card-header { display: flex; align-items: center; margin-bottom: 20px; }
.space-between { justify-content: space-between; }
.card-title { font-size: 18px; font-weight: 700; color: #1a1a2e; display: flex; align-items: center; gap: 8px; }

/* ==================== 第一行 ==================== */
.row-top { display: flex; gap: 20px; margin-bottom: 20px; }

/* 实时功率卡片：仪表盘居中，撑大 */
.gauge-card { 
  flex: 0 0 420px;
  height: 420px;
}
.gauge-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100% - 50px);
}
.gauge-chart { 
  width: 280px; 
  height: 280px; 
}
.power-value {
  text-align: center;
  margin-top: 16px;
}
.power-number {
  font-size: 48px;
  font-weight: 700;
  color: #ff6b00;
  line-height: 1.2;
}
.power-unit {
  font-size: 18px;
  color: #999;
  margin-left: 6px;
  font-weight: 400;
}
.power-label {
  font-size: 14px;
  color: #888;
  margin-top: 4px;
}

/* KPI 发电指标：改为6项3列 */
.kpi-card { flex: 1; }
.kpi-grid { 
  display: grid; 
  grid-template-columns: repeat(3, 1fr); 
  gap: 16px; 
  height: calc(100% - 50px); 
}
.kpi-item { 
  padding: 18px 12px; 
  background: #f8f9fb; 
  border-radius: 12px; 
  display: flex; 
  flex-direction: column; 
  justify-content: center;
  transition: all 0.3s ease;
}
.kpi-item:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
.kpi-item.highlight { background: linear-gradient(135deg, #ff9a42, #ff6b00); }
.kpi-item.highlight .kpi-label, 
.kpi-item.highlight .kpi-value, 
.kpi-item.highlight .kpi-sub { color: #fff; }
.kpi-label { font-size: 14px; color: #888; margin-bottom: 6px; }
.kpi-value { font-size: 26px; font-weight: 700; color: #1a1a2e; line-height: 1.2; }
.kpi-value .unit { font-size: 14px; font-weight: 400; color: #999; margin-left: 4px; }
.kpi-sub { font-size: 12px; color: #666; margin-top: 4px; }

/* ==================== 功率趋势图（容器撑高） ==================== */
.chart-card { margin-bottom: 20px; }
.chart-tools { display: flex; gap: 12px; align-items: center; }
.chart-container { width: 100%; height: 450px; margin-top: 10px; }
.chart-box { width: 100%; height: 100%; }

:deep(.el-radio-button__inner) { border-radius: 8px !important; }
:deep(.el-radio-button--large .el-radio-button__inner) { padding: 12px 20px; font-size: 14px; }
:deep(.el-radio-button__orig-radio:checked + .el-radio-button__inner) { background-color: #ff9a42 !important; border-color: #ff9a42 !important; box-shadow: none; }

/* ==================== 第三行 ==================== */
.row-middle { display: flex; gap: 20px; margin-bottom: 20px; }

/* 温度监测 */
.temp-card { flex: 1.5; }
.temp-chart-container { height: 200px; }
.temp-chart { width: 100%; height: 100%; }
.temp-legend { display: flex; justify-content: center; gap: 32px; margin-top: 16px; }
.legend-item { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #666; }
.legend-dot { width: 12px; height: 12px; border-radius: 50%; }
.legend-dot.orange { background: #ff6b00; }
.legend-dot.blue { background: #409EFF; }
.legend-value { font-weight: 600; color: #1a1a2e; margin-left: 8px; }

/* 环境监测 */
.env-card { flex: 1; }
.env-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
.env-item { display: flex; align-items: center; gap: 12px; padding: 16px; background: #f8f9fb; border-radius: 12px; }
.env-icon { font-size: 28px; }
.env-info { display: flex; flex-direction: column; }
.env-label { font-size: 12px; color: #888; }
.env-value { font-size: 20px; font-weight: 700; color: #1a1a2e; }
.env-value .unit { font-size: 12px; font-weight: 400; color: #999; }

/* 电站评估 */
.eval-card { flex: 0.8; }
.eval-list { display: flex; flex-direction: column; }
.eval-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f0f0f0; }
.eval-row:last-child { border-bottom: none; }
.eval-label { font-size: 14px; color: #666; }
.eval-value { font-size: 18px; font-weight: 700; color: #1a1a2e; }
.eval-value.highlight { color: #52c41a; }
.eval-value.warning { color: #ff6b00; }
.eval-value.success { color: #409EFF; }

/* ==================== 第四行（拉高，数字不挤） ==================== */
.row-bottom { display: flex; gap: 20px; margin-bottom: 0; }
.social-card { flex: 1; height: 200px; }
.social-stats { 
  display: grid; 
  grid-template-columns: repeat(4, 1fr); 
  gap: 20px;
  height: calc(100% - 50px);
  align-items: center;
}
.social-stat { 
  text-align: center; 
  padding: 20px 10px;
  background: #f8f9fb;
  border-radius: 12px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.stat-number { font-size: 32px; font-weight: 700; color: #52c41a; line-height: 1.2; }
.stat-number span { font-size: 14px; font-weight: 400; color: #999; margin-left: 4px; }
.stat-label { font-size: 14px; color: #666; margin-top: 8px; }

.layout-card { flex: 1; height: 200px; }
.layout-placeholder { 
  height: calc(100% - 60px); 
  background: linear-gradient(135deg, #f8f9fb, #e8ecf0); 
  border-radius: 12px; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  color: #999; 
  font-size: 16px;
}

/* ==================== 响应式 ==================== */
@media screen and (max-width: 1400px) {
  .row-top { flex-wrap: wrap; }
  .gauge-card { flex: 0 0 100%; height: auto; }
  .kpi-card { flex: 1 1 100%; }
  .kpi-grid { grid-template-columns: repeat(3, 1fr); }
  .row-middle { flex-wrap: wrap; }
  .temp-card, .env-card, .eval-card { flex: 1 1 calc(50% - 10px); }
  .social-card, .layout-card { flex: 1 1 calc(50% - 10px); height: auto; }
}

@media screen and (max-width: 768px) {
  .row-top, .row-middle, .row-bottom { flex-direction: column; }
  .gauge-card, .kpi-card, .temp-card, .env-card, .eval-card, .social-card, .layout-card { 
    flex: 1 1 100%; 
    height: auto;
  }
  .kpi-grid { grid-template-columns: repeat(2, 1fr); }
  .social-stats { grid-template-columns: repeat(2, 1fr); }
  .chart-container { height: 350px; }
}
</style>