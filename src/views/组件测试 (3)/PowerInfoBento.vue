<template>
  <div class="pv-run-data-page">
    <div class="page-header">
      <div class="header-left">
        <h1 class="station-name">光伏电站监控中心</h1>
        <span class="current-time">{{ currentTime }}</span>
      </div>
      <div class="header-right">
        <div class="status-wrapper">
          <div class="status-indicator" :class="statusDotClass"></div>
          <span class="status-text" :class="statusTextClass">{{ statusText }}</span>
        </div>
      </div>
    </div>

    <div class="left-sidebar">
      <div class="card gauge-card">
        <div class="card-header">
          <span class="card-title">实时发电功率</span>
        </div>
        <div class="gauge-wrapper">
          <div class="gauge-chart" ref="gaugeRef"></div>
          <div class="power-value">
            <div class="power-capacity">组件总容量：{{ totalCapacity }} kWp</div>
          </div>
        </div>
      </div>

      <div class="card status-card">
        <div class="card-header">
          <span class="card-title">系统运行状态</span>
        </div>
        <div class="status-grid">
          <div class="status-item">
            <div class="item-label">告警数量</div>
            <div class="item-value warning">{{ warningCount }}</div>
          </div>
          <div class="status-item">
            <div class="item-label">逆变器状态</div>
            <div class="item-value">{{ inverterOnline }}/{{ inverterTotal }}</div>
          </div>
          <div class="status-item">
            <div class="item-label">日满发小时</div>
            <div class="item-value">{{ powerMetrics.equivalentHours }} h</div>
          </div>
          <div class="status-item">
            <div class="item-label">实时功率占比</div>
            <div class="item-value">{{ powerMetrics.powerRatio }}%</div>
          </div>
        </div>
      </div>
    </div>

    <div class="right-main">
      <div class="kpi-row">
        <div class="card kpi-card">
          <span class="kpi-label">当日发电量</span>
          <span class="kpi-value">{{ powerMetrics.todayEnergy }}<span class="kpi-unit">kWh</span></span>
        </div>
        <div class="card kpi-card">
          <span class="kpi-label">累计发电量</span>
          <span class="kpi-value">{{ powerMetrics.totalEnergy }}<span class="kpi-unit">kWh</span></span>
        </div>
        <div class="card kpi-card">
          <span class="kpi-label">当日收益</span>
          <span class="kpi-value">¥ {{ powerMetrics.todayProfit }}</span>
        </div>
        <div class="card kpi-card">
          <span class="kpi-label">累计收益</span>
          <span class="kpi-value">¥ {{ powerMetrics.totalProfit }}</span>
        </div>
      </div>

      <div class="card chart-card">
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
    </div>

    <div class="bottom-row">
      <div class="card eval-card">
        <div class="card-header">
          <span class="card-title">🎯 电站评估</span>
        </div>
        <div class="eval-list">
          <div class="eval-row">
            <span class="eval-label">综合效率</span>
            <span class="eval-value highlight">{{ evalData.systemEfficiency }}%</span>
          </div>
          <div class="eval-row">
            <span class="eval-label">等效利用小时</span>
            <span class="eval-value">{{ evalData.equivalentHours }} h</span>
          </div>
          <div class="eval-row">
            <span class="eval-label">性能比 PR</span>
            <span class="eval-value">{{ evalData.pr }}%</span>
          </div>
          <div class="eval-row">
            <span class="eval-label">故障损失</span>
            <span class="eval-value warning">{{ evalData.faultLoss }} kWh</span>
          </div>
          <div class="eval-row">
            <span class="eval-label">可用率</span>
            <span class="eval-value success">{{ evalData.availability }}%</span>
          </div>
        </div>
      </div>

      <div class="card env-card">
        <div class="card-header">
          <span class="card-title">🌡️ 环境与温度监控</span>
        </div>
        <div class="env-grid">
          <div class="temp-chart-container">
            <div ref="tempChartRef" class="temp-chart"></div>
          </div>
          <div class="temp-legend">
            <div class="legend-item">
              <span class="legend-dot orange"></span>
              <span>组件温度</span>
              <span class="legend-value">{{ tempDisplay.moduleTemp }}°C</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot blue"></span>
              <span>环境温度</span>
              <span class="legend-value">{{ tempDisplay.envTemp }}°C</span>
            </div>
          </div>
          <div class="weather-container">
            <div class="weather-grid">
              <div class="weather-day" v-for="day in weatherData" :key="day.label">
                <div class="day-label">{{ day.label }}</div>
                <div class="day-icon">{{ day.icon }}</div>
                <div class="day-temp">{{ day.temp }}°C</div>
                <div class="day-desc">{{ day.desc }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card social-card">
        <div class="card-header">
          <span class="card-title">🌱 社会贡献</span>
        </div>
        <div class="social-grid">
          <div class="social-item">
            <div class="item-icon">♻️</div>
            <div class="item-value">{{ socialData.co2Reduction }}<span>吨</span></div>
            <div class="item-label">CO₂减排</div>
          </div>
          <div class="social-item">
            <div class="item-icon">🪨</div>
            <div class="item-value">{{ socialData.coalSaving }}<span>吨</span></div>
            <div class="item-label">标煤节约</div>
          </div>
          <div class="social-item">
            <div class="item-icon">🌳</div>
            <div class="item-value">{{ socialData.treeEquivalent }}<span>棵</span></div>
            <div class="item-label">等效植树</div>
          </div>
          <div class="social-item">
            <div class="item-icon">⚡</div>
            <div class="item-value">{{ socialData.greenPower }}<span>kWh</span></div>
            <div class="item-label">绿色发电</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'

const currentTime = ref('')
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', { 
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  })
}
setInterval(updateTime, 1000)
updateTime()

const realData = ref({
  powerInfo: {
    systemConstruct: { capacity: 500, stationAddress: '江西省赣州市' },
    systemMonitor: { runStatus: '运行中', warningCount: 0 },
    powerData: { todayPower: 2450, totalPower: '1.2GWh', realTimePower: 320, equivalentHours: 4.9 },
    profitCalc: { todayProfit: 980, totalProfit: 480000, yearProfit: 120000 }
  },
  archiveInfo: { devices: new Array(10).fill({}) }
})

const gaugeRef = ref(null)
const powerChartRef = ref(null)
const tempChartRef = ref(null)
let gaugeChart = null
let powerChart = null
let tempChart = null

const selectDate = ref(new Date())
const dateType = ref('day')

const weatherData = ref([
  { label: '今天', icon: '☀️', temp: '32', desc: '晴' },
  { label: '明天', icon: '⛅', temp: '28', desc: '多云' },
  { label: '后天', icon: '🌧️', temp: '24', desc: '小雨' }
])

const powerDataByType = {
  day: { xAxis: ['00:00','02:00','04:00','06:00','08:00','10:00','12:00','14:00','16:00','18:00','20:00','22:00'], data: [0,0,0,0,220,780,1200,980,650,320,0,0] },
  month: { xAxis: ['1日','5日','10日','15日','20日','25日','30日'], data: [4200,4800,5100,3900,4600,5200,4500] },
  year: { xAxis: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'], data: [120,135,158,175,198,220,245,238,195,165,140,118] },
  total: { xAxis: ['2022','2023','2024','2025','2026'], data: [850,920,980,1050,972] }
}

const totalCapacity = computed(() => realData.value?.powerInfo?.systemConstruct?.capacity || 0)

const systemMonitor = computed(() => realData.value?.powerInfo?.systemMonitor || {})
const statusText = computed(() => systemMonitor.value.runStatus || '运行中')
const statusDotClass = computed(() => systemMonitor.value.runStatus === '停机' ? 'dot-stopped' : 'dot-running')
const statusTextClass = computed(() => systemMonitor.value.runStatus === '停机' ? 'text-stopped' : 'text-running')
const warningCount = computed(() => systemMonitor.value.warningCount ?? 0)
const inverterTotal = computed(() => realData.value?.archiveInfo?.devices?.length || 0)
const inverterOnline = computed(() => inverterTotal.value - warningCount.value)

const powerMetrics = computed(() => {
  const pi = realData.value.powerInfo || {}
  const todayEnergy = pi.powerData?.todayPower ?? '--'
  const todayProfit = pi.profitCalc?.todayProfit ?? '--'
  const totalEnergy = pi.powerData?.totalPower ?? '--'
  const totalProfit = pi.profitCalc?.totalProfit ?? '--'
  const equivalentHours = pi.powerData?.equivalentHours ?? '--'
  const realPower = pi.powerData?.realTimePower ?? 0
  const capacity = pi.systemConstruct?.capacity ?? 1
  const powerRatio = capacity > 0 ? ((realPower / capacity) * 100).toFixed(1) : '--'
  return { todayEnergy, todayProfit, totalEnergy, totalProfit, equivalentHours, powerRatio }
})

const tempDisplay = ref({ moduleTemp: '45.2', envTemp: '24.5' })

const evalData = computed(() => ({
  systemEfficiency: (Math.random() * 15 + 80).toFixed(1),
  equivalentHours: 4.9,
  pr: (Math.random() * 10 + 80).toFixed(1),
  faultLoss: (Math.random() * 0.3).toFixed(2),
  availability: (Math.random() * 1 + 98.5).toFixed(1)
}))

const socialData = computed(() => ({
  co2Reduction: '720.1',
  coalSaving: '292.3',
  treeEquivalent: '11882',
  greenPower: '1200000'
}))

const initGauge = () => {
  if (!gaugeRef.value) return
  if (gaugeChart) gaugeChart.dispose()
  gaugeChart = echarts.init(gaugeRef.value)
  const capacity = totalCapacity.value || 500
  const realPower = realData.value?.powerInfo?.powerData?.realTimePower ?? 0
  gaugeChart.setOption({
    animation: false,
    series: [{
      type: 'gauge',
      center: ['50%', '55%'], radius: '78%',
      startAngle: 200, endAngle: -20,
      min: 0, max: capacity,
      detail: { fontSize: 22, color: '#1890ff', formatter: '{value} kW' },
      data: [{ value: realPower }]
    }]
  })
}

const initPowerChart = () => {
  if (!powerChartRef.value) return
  if (powerChart) powerChart.dispose()
  powerChart = echarts.init(powerChartRef.value)
  updatePowerChart()
}
const updatePowerChart = () => {
  const config = powerDataByType[dateType.value]
  powerChart.setOption({
    animation: false,
    xAxis: { type: 'category', data: config.xAxis },
    yAxis: { type: 'value' },
    series: [{ type: 'line', smooth: true, data: config.data, lineStyle: { color: '#1890ff' } }]
  })
}

const initTempChart = () => {
  if (!tempChartRef.value) return
  if (tempChart) tempChart.dispose()
  tempChart = echarts.init(tempChartRef.value)
  tempChart.setOption({
    animation: false,
    xAxis: { data: ['00:00','02:00','04:00','06:00','08:00','10:00','12:00','14:00','16:00','18:00','20:00','22:00'] },
    yAxis: { type: 'value' },
    series: [
      { type: 'line', data: [18,17,16,17,25,35,45,48,42,35,26,20], lineStyle: { color: '#ff6b00' } },
      { type: 'line', data: [15,14,13,14,20,25,28,30,27,23,18,16], lineStyle: { color: '#409EFF' } }
    ]
  })
}

const initAllCharts = () => { initGauge(); initPowerChart(); initTempChart() }
const handleDateTypeChange = () => updatePowerChart()

const handleResize = () => {
  requestAnimationFrame(() => {
    gaugeChart?.resize()
    powerChart?.resize()
    tempChart?.resize()
  })
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  nextTick(() => initAllCharts())
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  gaugeChart?.dispose()
  powerChart?.dispose()
  tempChart?.dispose()
})
</script>

<style scoped>
.pv-run-data-page {
  width: 100%;
  min-height: calc(100vh - 60px);
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf0 100%);
  padding: 20px;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: 3fr 7fr;
  grid-template-rows: auto auto 1fr;
  gap: 20px;
}
.page-header {
  grid-column: 1 / -1;
  background: #fff;
  border-radius: 12px;
  padding: 16px 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.left-sidebar { display: flex; flex-direction: column; gap: 20px; }
.right-main { display: flex; flex-direction: column; gap: 20px; }
.kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.bottom-row { grid-column: 1 / -1; display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  height: 100%;
  box-sizing: border-box;
}
.card-header { margin-bottom: 16px; }
.card-title { font-size: 16px; font-weight: 700; color: #1a1a2e; }
.gauge-chart { width: 100%; height: 200px; }
.status-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
.status-item { display: flex; flex-direction: column; gap: 4px; }
.item-label { font-size: 13px; color: #8c8c8c; }
.item-value { font-size: 18px; font-weight: 700; color: #1a1a2e; }
.kpi-card { display: flex; flex-direction: column; align-items: center; justify-content: center; }
.kpi-label { font-size: 13px; color: #8c8c8c; }
.kpi-value { font-size: 24px; font-weight: 700; color: #1a1a2e; }
.chart-container { width: 100%; height: 300px; }
.chart-box { width: 100%; height: 100%; }
.eval-list { display: flex; flex-direction: column; gap: 12px; }
.eval-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
.eval-row:last-child { border-bottom: none; }
.eval-label { font-size: 14px; color: #666; }
.eval-value { font-size: 16px; font-weight: 700; color: #1a1a2e; }
.highlight { color: #1890ff; }
.success { color: #52c41a; }
.warning { color: #fa8c16; }
.env-grid { display: flex; flex-direction: column; gap: 16px; }
.temp-chart-container { height: 160px; }
.temp-chart { width: 100%; height: 100%; }
.temp-legend { display: flex; justify-content: center; gap: 24px; margin-top: 8px; }
.legend-item { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #666; }
.legend-dot { width: 12px; height: 12px; border-radius: 50%; }
.legend-dot.orange { background: #ff6b00; }
.legend-dot.blue { background: #409EFF; }
.weather-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.weather-day { text-align: center; padding: 12px; background: #f8f9fb; border-radius: 8px; }
.social-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
.social-item { display: flex; flex-direction: column; align-items: center; padding: 8px; background: #f8f9fb; border-radius: 8px; }
.item-icon { font-size: 24px; margin-bottom: 8px; }
.item-value { font-size: 20px; font-weight: 700; color: #52c41a; }
.status-wrapper { display: flex; align-items: center; gap: 10px; }
.status-indicator { width: 12px; height: 12px; border-radius: 50%; }
.dot-running { background: #52c41a; animation: breathing 2s infinite; }
.dot-stopped { background: #f5222d; }
.status-text { font-size: 16px; font-weight: bold; }
.text-running { color: #52c41a; }
.text-stopped { color: #f5222d; }
@keyframes breathing {
  0% { box-shadow: 0 0 0 0 rgba(82,196,26,0.4); }
  70% { box-shadow: 0 0 0 10px rgba(82,196,26,0); }
  100% { box-shadow: 0 0 0 0 rgba(82,196,26,0); }
}
</style>