<template>
  <div class="pv-run-data-page">
    <!-- 第一行：实时功率+发电指标 -->
    <div class="row-top merged-card-box">
      <div class="gauge-card-small">
        <div class="gauge-wrapper">
          <div class="gauge-chart" ref="gaugeRef"></div>
          <div class="power-value">
            <div class="power-capacity">组件总容量：{{ totalCapacity }} kWp</div>
          </div>
        </div>
      </div>
      <div class="kpi-card-wide">
        <div class="kpi-grid-3col-wide">
          <div class="data-card">
            <span class="card-label">当日发电量</span>
            <span class="card-value">{{ powerMetrics.todayEnergy }}<span class="card-unit">kWh</span></span>
            <div class="card-grid-2x2">
              <div class="grid-cell"><div class="cell-label">较昨日同期</div><div class="cell-value">{{ powerMetrics.yesterdayCompare }}</div></div>
              <div class="grid-cell"><div class="cell-label">累计发电量</div><div class="cell-value">{{ powerMetrics.totalEnergy }} kWh</div></div>
            </div>
          </div>
          <div class="data-card">
            <span class="card-label">当日收益</span>
            <span class="card-value">¥ {{ powerMetrics.todayProfit }}</span>
            <div class="card-grid-2x2">
              <div class="grid-cell"><div class="cell-label">当年收益</div><div class="cell-value">{{ powerMetrics.yearProfit }} 元</div></div>
              <div class="grid-cell"><div class="cell-label">累计收益</div><div class="cell-value">{{ powerMetrics.totalProfit }} 元</div></div>
              <div class="grid-cell"><div class="cell-label">上网电价</div><div class="cell-value">0.4 元/kWh</div></div>
              <div class="grid-cell"><div class="cell-label">自用电价</div><div class="cell-value">0.6 元/kWh</div></div>
            </div>
          </div>
          <div class="data-card">
            <span class="card-label">系统运行状态</span>
            <div class="status-wrapper">
              <div class="status-indicator" :class="statusDotClass"></div>
              <span class="status-text" :class="statusTextClass">{{ statusText }}</span>
            </div>
            <div class="card-grid-2x2">
              <div class="grid-cell"><div class="cell-label">告警数量</div><div class="cell-value">{{ warningCount }}</div></div>
              <div class="grid-cell"><div class="cell-label">逆变器</div><div class="cell-value">{{ inverterOnline }}/{{ inverterTotal }}</div></div>
              <div class="grid-cell"><div class="cell-label">日满发小时</div><div class="cell-value">{{ powerMetrics.equivalentHours }} h</div></div>
              <div class="grid-cell"><div class="cell-label">实时功率占比</div><div class="cell-value">{{ powerMetrics.powerRatio }}%</div></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 第二行：趋势图（嵌入评估面板） -->
    <div class="row-top row-gap-wide">
      <div class="chart-card chart-with-inset">
        <div class="card-header space-between">
          <span class="card-title"><el-icon><TrendCharts /></el-icon> 发电功率趋势</span>
          <div class="chart-tools">
            <el-radio-group v-model="dateType" size="large" @change="handleDateTypeChange">
              <el-radio-button value="day">日</el-radio-button>
              <el-radio-button value="month">月</el-radio-button>
              <el-radio-button value="year">年</el-radio-button>
              <el-radio-button value="total">总</el-radio-button>
            </el-radio-group>
            <el-date-picker v-model="selectDate" :type="dateType === 'month' ? 'month' : 'date'" placeholder="选择日期" size="large" />
          </div>
        </div>
        <div class="chart-body-with-inset">
          <div class="chart-main-area">
            <div ref="powerChartRef" class="chart-box"></div>
          </div>
          <!-- 嵌入评估面板 Inset -->
          <div class="eval-inset">
            <div class="eval-inset-title"><el-icon><Aim /></el-icon> 电站评估</div>
            <div class="eval-matrix">
              <div class="matrix-row" v-for="(row, idx) in evalMatrixData" :key="idx">
                <span class="matrix-label">{{ row.label }}</span>
                <div class="matrix-bar">
                  <div class="matrix-fill" :style="{ width: row.pct + '%', backgroundColor: row.color }"></div>
                </div>
                <span class="matrix-val" :style="{ color: row.color }">{{ row.value }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 第三行：天气条带 + 温度图（浮层当前值） -->
    <div class="row-middle">
      <div class="temp-card">
        <!-- 天气条带 Strip -->
        <div class="weather-strip">
          <div class="ws-item" v-for="day in weatherData" :key="day.label">
            <el-icon :size="18" :color="day.iconColor"><component :is="day.elIcon" /></el-icon>
            <span class="ws-label">{{ day.label }}</span>
            <span class="ws-temp">{{ day.temp }}°C</span>
            <span class="ws-desc">{{ day.desc }}</span>
          </div>
        </div>
        <div class="card-header space-between temp-header-row">
          <span class="card-title"><el-icon><Odometer /></el-icon> 温度监测</span>
          <el-radio-group v-model="tempDateType" size="small">
            <el-radio-button value="day">日</el-radio-button>
            <el-radio-button value="week">周</el-radio-button>
          </el-radio-group>
        </div>
        <div class="temp-chart-container temp-chart-with-overlay">
          <!-- 浮层 Overlay：当前温度 -->
          <div class="temp-overlay">
            <div class="to-item to-module">
              <span class="to-val">{{ tempDisplay.moduleTemp }}<span class="to-deg">°C</span></span>
              <span class="to-lbl">组件</span>
            </div>
            <div class="to-sep"></div>
            <div class="to-item to-env">
              <span class="to-val">{{ tempDisplay.envTemp }}<span class="to-deg">°C</span></span>
              <span class="to-lbl">环境</span>
            </div>
          </div>
          <div ref="tempChartRef" class="temp-chart"></div>
        </div>
      </div>
    </div>

    <!-- 第四行：社会贡献（瓦片 Tile） -->
    <div class="row-bottom">
      <div class="social-tile-group">
        <div class="social-tile" v-for="(item, idx) in socialTileData" :key="idx">
          <div class="st-icon-wrap" :style="{ backgroundColor: item.bgColor }">
            <el-icon :size="22" color="#fff"><component :is="item.elIcon" /></el-icon>
          </div>
          <span class="st-number">
            <span class="st-val" :data-target="item.numValue">{{ item.displayValue }}</span>
          </span>
          <span class="st-unit">{{ item.unit }}</span>
          <span class="st-label">{{ item.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import {
  TrendCharts, Aim, Odometer,
  Sunny, PartlyCloudy, Drizzling,
  Cloudy, Coin, Position, Lightning
} from '@element-plus/icons-vue'

// ===================== 模拟数据 =====================
const MOCK_DATA = {
  powerInfo: {
    systemConstruct: {
      capacity: 2336,
      stationAddress: '江苏省南京市江宁区'
    },
    systemMonitor: {
      runStatus: '运行中',
      warningCount: 1
    },
    powerData: {
      realTimePower: 1680,
      todayPower: '1,245.6',
      totalPower: '9,724,580',
      equivalentHours: 3.8
    },
    profitCalc: {
      todayProfit: '747.36',
      yearProfit: '185,420',
      totalProfit: '5,834,748'
    }
  },
  archiveInfo: {
    devices: [
      { id: 1, name: '逆变器A', status: 'online' },
      { id: 2, name: '逆变器B', status: 'online' },
      { id: 3, name: '逆变器C', status: 'online' },
      { id: 4, name: '逆变器D', status: 'alarm' }
    ]
  }
}

// ===================== 状态 =====================
const realData = ref(null)
const realTimePower = ref(1680)

const gaugeRef = ref(null)
const powerChartRef = ref(null)
const tempChartRef = ref(null)
let gaugeChart = null
let powerChart = null
let tempChart = null
const timeouts = []
let refreshTimer = null

const selectDate = ref(new Date())
const dateType = ref('day')
const tempDateType = ref('day')

const weatherData = ref([
  { label: '今天', elIcon: Sunny, iconColor: '#ff9a42', temp: '32', desc: '晴' },
  { label: '明天', elIcon: PartlyCloudy, iconColor: '#909399', temp: '28', desc: '多云' },
  { label: '后天', elIcon: Drizzling, iconColor: '#409EFF', temp: '24', desc: '小雨' }
])

const powerDataByType = {
  day: {
    xAxis: ['00:00','02:00','04:00','06:00','08:00','10:00','12:00','14:00','16:00','18:00','20:00','22:00'],
    data: [0, 0, 0, 0, 220, 780, 1200, 980, 650, 320, 0, 0]
  },
  month: {
    xAxis: ['1日','5日','10日','15日','20日','25日','30日'],
    data: [4200, 4800, 5100, 3900, 4600, 5200, 4500]
  },
  year: {
    xAxis: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
    data: [120, 135, 158, 175, 198, 220, 245, 238, 195, 165, 140, 118]
  },
  total: {
    xAxis: ['2022','2023','2024','2025','2026'],
    data: [850, 920, 980, 1050, 972]
  }
}

// ===================== 计算属性 =====================
const totalCapacity = computed(() => realData.value?.powerInfo?.systemConstruct?.capacity || 0)
const systemMonitor = computed(() => realData.value?.powerInfo?.systemMonitor || {})
const statusText = computed(() => systemMonitor.value.runStatus || '运行中')
const statusDotClass = computed(() => systemMonitor.value.runStatus === '停机' ? 'dot-stopped' : 'dot-running')
const statusTextClass = computed(() => systemMonitor.value.runStatus === '停机' ? 'text-stopped' : 'text-running')
const warningCount = computed(() => systemMonitor.value.warningCount ?? 0)
const inverterTotal = computed(() => realData.value?.archiveInfo?.devices?.length || 0)
const inverterOnline = computed(() => inverterTotal.value - warningCount.value)

const powerMetrics = computed(() => {
  if (!realData.value) {
    return {
      todayEnergy: '--', todayProfit: '--', totalEnergy: '--', totalProfit: '--',
      equivalentHours: '--', powerRatio: '--', yearProfit: '--', yesterdayCompare: '--'
    }
  }
  const pi = realData.value.powerInfo || {}
  return {
    todayEnergy: pi.powerData?.todayPower ?? '--',
    todayProfit: pi.profitCalc?.todayProfit ?? '--',
    totalEnergy: pi.powerData?.totalPower ?? '--',
    totalProfit: pi.profitCalc?.totalProfit ?? '--',
    yearProfit: pi.profitCalc?.yearProfit ?? '--',
    equivalentHours: pi.powerData?.equivalentHours ?? '--',
    yesterdayCompare: '+12.3%',
    powerRatio: totalCapacity.value > 0
      ? ((realTimePower.value / totalCapacity.value) * 100).toFixed(1)
      : '--'
  }
})

const tempDisplay = ref({ moduleTemp: '45.2', envTemp: '24.5' })

// 评估数据
const evalData = computed(() => ({
  systemEfficiency: 86.5,
  equivalentHours: 3.8,
  pr: 82.3,
  faultLoss: 0.05,
  availability: 99.2
}))

const evalMatrixData = computed(() => {
  const d = evalData.value
  const getColor = (pct) => pct >= 95 ? '#52c41a' : pct >= 80 ? '#ff9a42' : '#f5222d'
  return [
    { label: '综合效率', value: d.systemEfficiency + '%', pct: d.systemEfficiency, color: getColor(d.systemEfficiency) },
    { label: '等效小时', value: d.equivalentHours + 'h', pct: Math.min((d.equivalentHours / 6) * 100, 100), color: getColor((d.equivalentHours / 6) * 100) },
    { label: '性能比PR', value: d.pr + '%', pct: d.pr, color: getColor(d.pr) },
    { label: '故障损失', value: d.faultLoss + 'kWh', pct: Math.min(d.faultLoss / 1 * 100, 100), color: '#ff9a42' },
    { label: '可用率', value: d.availability + '%', pct: d.availability, color: getColor(d.availability) },
  ]
})

// 社会贡献
const socialTileData = computed(() => {
  // 基于模拟累计发电量计算
  const totalKWh = 9724580
  const factor = 0.7035
  const co2 = (totalKWh * factor / 1000).toFixed(1)
  const coal = (totalKWh * 0.1229 / 1000).toFixed(1)
  const trees = Math.round(parseFloat(co2) * 16.5)
  return [
    { elIcon: Cloudy, bgColor: '#ff9a42', label: 'CO₂减排', displayValue: co2, numValue: parseFloat(co2), unit: '吨' },
    { elIcon: Coin, bgColor: '#e6a23c', label: '标煤节约', displayValue: coal, numValue: parseFloat(coal), unit: '吨' },
    { elIcon: Position, bgColor: '#67c23a', label: '等效植树', displayValue: String(trees), numValue: trees, unit: '棵' },
    { elIcon: Lightning, bgColor: '#409EFF', label: '绿色发电', displayValue: (totalKWh / 10000).toFixed(1), numValue: totalKWh / 10000, unit: '万kWh' },
  ]
})

// ===================== 数字滚动动画 =====================
const animateNumbers = () => {
  const els = document.querySelectorAll('.pv-run-data-page .st-val[data-target]')
  els.forEach((el) => {
    const target = parseFloat(el.getAttribute('data-target')) || 0
    if (target === 0) { el.textContent = '0'; return }
    const duration = 1500
    const startTime = performance.now()
    const isInt = Number.isInteger(target) || target > 100
    const step = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = target * eased
      el.textContent = isInt ? Math.round(current).toLocaleString() : current.toFixed(1)
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  })
}

// ===================== 模拟实时刷新 =====================
const simulateRealtime = () => {
  // 功率随机波动 ±5%
  const base = 1680
  const fluctuation = (Math.random() - 0.5) * base * 0.1
  realTimePower.value = Math.max(0, Math.round(base + fluctuation))
  // 温度微调
  tempDisplay.value = {
    moduleTemp: (42 + Math.random() * 8).toFixed(1),
    envTemp: (22 + Math.random() * 6).toFixed(1),
  }
  // 更新仪表盘
  if (gaugeChart) {
    gaugeChart.setOption({
      series: [{ data: [{ value: realTimePower.value }] }]
    })
  }
}

// ===================== 加载模拟数据 =====================
const loadMockData = () => {
  realData.value = MOCK_DATA
  nextTick(() => {
    initAllCharts()
    animateNumbers()
  })
}

// ===================== 图表初始化 =====================
const initGauge = () => {
  if (!gaugeRef.value) return
  if (gaugeChart) gaugeChart.dispose()
  gaugeChart = echarts.init(gaugeRef.value)
  const capacity = totalCapacity.value || 2336
  gaugeChart.setOption({
    animation: true, animationDuration: 800, animationEasing: 'elasticOut',
    backgroundColor: 'transparent',
    series: [{
      type: 'gauge', center: ['50%', '55%'], radius: '78%',
      startAngle: 200, endAngle: -20, min: 0, max: capacity, splitNumber: 5,
      axisLabel: { distance: -20, fontSize: 9, color: '#aaa', formatter: (val) => Math.round((val / capacity) * 100) + '%' },
      axisTick: { distance: -15, length: 6, lineStyle: { color: '#ccc' } },
      splitLine: { distance: -15, length: 10, lineStyle: { color: '#ccc' } },
      axisLine: { lineStyle: { width: 12, color: [[1, '#e9eef4']] } },
      progress: { show: true, width: 12, itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: '#ff9a42' }, { offset: 1, color: '#ff6b00' }]) } },
      pointer: { length: '55%', width: 5, itemStyle: { color: '#ff6b00' } },
      anchor: { size: 12, itemStyle: { color: '#ff6b00' } },
      title: { show: false },
      detail: { fontSize: 22, fontWeight: 700, color: '#ff6b00', offsetCenter: [0, '35%'], formatter: '{value} kW' },
      data: [{ value: realTimePower.value }]
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
  if (!powerChart) return
  const config = powerDataByType[dateType.value]
  powerChart.setOption({
    animation: true, animationDuration: 600,
    backgroundColor: 'transparent',
    title: {
      text: dateType.value === 'day' ? '日功率曲线' : dateType.value === 'month' ? '月发电量趋势' : dateType.value === 'year' ? '年月发电量' : '年累计发电量',
      left: 'center', textStyle: { fontSize: 14, color: '#666', fontWeight: 500 }
    },
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(50,50,50,0.9)', textStyle: { color: '#fff', fontSize: 13 }, padding: [10, 14], axisPointer: { type: 'cross', lineStyle: { color: '#ff9a42', type: 'dashed' } } },
    legend: { bottom: 10, left: 'center', itemIcon: 'diamond', textStyle: { color: '#ff9a42' }, data: ['功率'] },
    grid: { left: '3%', right: '3%', top: '18%', bottom: '15%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#666', fontSize: 12 }, data: config.xAxis },
    yAxis: { type: 'value', axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: '#f0f0f0' } }, axisLabel: { color: '#666', fontSize: 12 } },
    series: [{ name: '功率', type: 'line', smooth: true, symbol: 'circle', symbolSize: 8, itemStyle: { color: '#ff9a42' }, lineStyle: { color: '#ff9a42', width: 3 }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(255,154,66,0.3)' }, { offset: 1, color: 'rgba(255,154,66,0.05)' }]) }, data: config.data }]
  })
}

const initTempChart = () => {
  if (!tempChartRef.value) return
  if (tempChart) tempChart.dispose()
  tempChart = echarts.init(tempChartRef.value)
  tempChart.setOption({
    animation: true, animationDuration: 600,
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(50,50,50,0.9)', textStyle: { color: '#fff', fontSize: 13 }, padding: [10, 14] },
    legend: { show: false },
    grid: { left: '3%', right: '3%', top: '6%', bottom: '5%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#666', fontSize: 11 }, data: ['00:00','02:00','04:00','06:00','08:00','10:00','12:00','14:00','16:00','18:00','20:00','22:00'] },
    yAxis: { type: 'value', min: 0, max: 60, axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } }, axisLabel: { color: '#666', fontSize: 11, formatter: '{value}°C' } },
    series: [
      { name: '组件温度', type: 'line', smooth: true, symbol: 'none', lineStyle: { color: '#ff6b00', width: 2 }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(255,107,0,0.2)' }, { offset: 1, color: 'rgba(255,107,0,0)' }]) }, data: [18,17,16,17,25,35,45,48,42,35,26,20] },
      { name: '环境温度', type: 'line', smooth: true, symbol: 'none', lineStyle: { color: '#409EFF', width: 2 }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(64,158,255,0.2)' }, { offset: 1, color: 'rgba(64,158,255,0)' }]) }, data: [15,14,13,14,20,25,28,30,27,23,18,16] }
    ]
  })
}

const initAllCharts = () => { initGauge(); initPowerChart(); initTempChart() }
const handleDateTypeChange = () => { updatePowerChart() }

const handleResize = () => {
  requestAnimationFrame(() => {
    if (gaugeChart) gaugeChart.resize()
    if (powerChart) powerChart.resize()
    if (tempChart) tempChart.resize()
  })
}

// ===================== 生命周期 =====================
onMounted(() => {
  window.addEventListener('resize', handleResize)
  loadMockData()
  // 每5秒模拟实时刷新
  refreshTimer = setInterval(simulateRealtime, 5000)
})

onUnmounted(() => {
  timeouts.forEach(clearTimeout)
  window.removeEventListener('resize', handleResize)
  if (refreshTimer) clearInterval(refreshTimer)
  gaugeChart?.dispose()
  powerChart?.dispose()
  tempChart?.dispose()
})
</script>

<style scoped>
.pv-run-data-page {
  width: 100%;
  min-height: calc(100vh - 60px);
  background: linear-gradient(135deg, #f8f9fb 0%, #e8ecf0 100%);
  padding: clamp(16px, 1.67vw, 24px);
  box-sizing: border-box;
  font-family: "Microsoft YaHei", sans-serif;
}

/* ===== 第一行 ===== */
.row-top { display: flex; gap: 0; margin-bottom: clamp(16px, 1.4vw, 20px); min-width: 0; }
.row-gap-wide { gap: clamp(16px, 1.67vw, 24px); }

.merged-card-box { background: #fff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); padding: 0; width: 100%; display: flex; flex-wrap: wrap; min-width: 0; }
.gauge-card-small {
  flex: 0 0 clamp(220px, 19.4vw, 320px);
  height: clamp(250px, 20.8vw, 320px);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
}
.gauge-wrapper { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: clamp(8px, 1.1vw, 16px); height: 100%; width: 100%; }
.gauge-chart { width: clamp(200px, 18vw, 280px); height: clamp(200px, 18vw, 280px); }
.power-value { text-align: center; margin-top: 4px; }
.power-capacity { font-size: clamp(12px, 0.97vw, 14px); color: #666; margin-top: 4px; }

.kpi-card-wide {
  flex: 1; height: clamp(250px, 20.8vw, 320px);
  display: flex; align-items: center; min-width: 0;
}
.kpi-grid-3col-wide { width: 100%; display: grid; grid-template-columns: repeat(3, 1fr); gap: clamp(12px, 1.1vw, 16px); padding: clamp(12px, 1.1vw, 16px) clamp(16px, 1.4vw, 20px); }

.data-card {
  width: 100%; min-width: 0; padding: clamp(16px, 1.4vw, 20px) clamp(8px, 0.83vw, 12px); background: #F8F9FA;
  border-radius: 12px; box-sizing: border-box; display: flex; flex-direction: column;
  align-items: center; gap: clamp(6px, 0.56vw, 8px); cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.data-card:hover { transform: translateY(-4px); box-shadow: 0 8px 20px rgba(255, 122, 24, 0.15); }

.card-label { font-size: clamp(13px, 0.97vw, 15px); color: #666; }
.card-value { font-size: clamp(18px, 1.53vw, 24px); font-weight: 700; color: #1D2129; line-height: 1; }
.card-unit { font-size: clamp(11px, 0.9vw, 13px); font-weight: 400; color: #999; margin-left: 4px; }

.card-grid-2x2 { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(8px, 0.7vw, 10px) clamp(10px, 0.97vw, 14px); width: 100%; margin-top: 4px; }
.grid-cell { display: flex; flex-direction: column; align-items: flex-start; min-width: 0; }
.cell-label { font-size: clamp(11px, 0.9vw, 13px); color: #888; margin-bottom: 3px; line-height: 1.3; }
.cell-value { font-size: clamp(12px, 0.97vw, 14px); font-weight: 600; color: #1D2129; line-height: 1.3; }

.status-wrapper { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; height: clamp(20px, 1.67vw, 24px); }
.status-indicator { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
.dot-running { background-color: #52c41a; box-shadow: 0 0 0 4px rgba(82, 196, 26, 0.2); animation: pulse 2s infinite; }
.dot-stopped { background-color: #f5222d; box-shadow: 0 0 0 4px rgba(245, 34, 45, 0.2); }
.status-text { font-size: clamp(15px, 1.25vw, 18px); font-weight: bold; line-height: 1.3; }
.text-running { color: #52c41a; }
.text-stopped { color: #f5222d; }
@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(82, 196, 26, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(82, 196, 26, 0); }
  100% { box-shadow: 0 0 0 0 rgba(82, 196, 26, 0); }
}

/* ===== 第二行：趋势图 + 嵌入评估 ===== */
.chart-card {
  background: #fff; border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06); padding: clamp(20px, 1.67vw, 24px);
  flex: 1 1 0%; min-width: 0; overflow: hidden;
}
.chart-with-inset { flex: 1; }
.card-header { display: flex; align-items: center; margin-bottom: clamp(16px, 1.4vw, 20px); min-width: 0; }
.space-between { justify-content: space-between; }
.card-title {
  font-size: clamp(16px, 1.25vw, 18px); font-weight: 700; color: #1a1a2e;
  display: flex; align-items: center; gap: 8px;
}
.card-title .el-icon { color: #ff9a42; font-size: 20px; }
.chart-tools { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }

.chart-body-with-inset { display: flex; gap: 0; }
.chart-main-area { flex: 1; min-width: 0; height: clamp(250px, 20.8vw, 320px); }
.chart-main-area .chart-box { width: 100%; height: 100%; }

.eval-inset {
  flex: 0 0 clamp(180px, 14vw, 240px);
  border-left: 1px dashed #e8e8e8;
  margin-left: clamp(12px, 1.1vw, 16px);
  padding-left: clamp(12px, 1.1vw, 16px);
  display: flex; flex-direction: column; justify-content: center;
}
.eval-inset-title {
  font-size: clamp(14px, 1.11vw, 16px); font-weight: 700; color: #1a1a2e;
  margin-bottom: clamp(12px, 1vw, 16px);
  display: flex; align-items: center; gap: 6px;
}
.eval-inset-title .el-icon { color: #ff9a42; font-size: 18px; }

.eval-matrix { display: flex; flex-direction: column; gap: clamp(10px, 0.83vw, 14px); }
.matrix-row { display: flex; align-items: center; gap: 8px; }
.matrix-label { font-size: clamp(11px, 0.83vw, 13px); color: #888; width: clamp(48px, 4vw, 64px); flex-shrink: 0; }
.matrix-bar { flex: 1; height: 6px; background: #f0f0f0; border-radius: 3px; overflow: hidden; }
.matrix-fill { height: 100%; border-radius: 3px; transition: width 1s cubic-bezier(0.4, 0, 0.2, 1); }
.matrix-val { font-size: clamp(12px, 0.97vw, 14px); font-weight: 700; width: clamp(40px, 3.5vw, 52px); text-align: right; flex-shrink: 0; }

/* ===== 第三行：天气条带 + 温度图 ===== */
.row-middle { display: flex; gap: clamp(16px, 1.4vw, 20px); margin-bottom: clamp(16px, 1.4vw, 20px); }

.temp-card {
  background: #fff; border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06); padding: clamp(20px, 1.67vw, 24px);
  flex: 1 1 0%; min-width: 0; overflow: hidden;
}

.weather-strip {
  display: flex; gap: clamp(20px, 1.67vw, 32px);
  padding: clamp(8px, 0.7vw, 12px) clamp(14px, 1.2vw, 20px);
  background: #f8f9fb; border-radius: 10px;
  margin-bottom: clamp(12px, 1vw, 16px);
}
.ws-item { display: flex; align-items: center; gap: 6px; font-size: clamp(12px, 0.9vw, 13px); color: #666; }
.ws-label { font-weight: 600; color: #1a1a2e; }
.ws-temp { font-weight: 700; color: #ff6b00; }
.ws-desc { color: #999; }

.temp-header-row { margin-bottom: clamp(10px, 0.83vw, 14px); }

.temp-chart-container { position: relative; min-width: 0; overflow: hidden; }
.temp-chart-with-overlay { height: clamp(200px, 17vw, 260px); }
.temp-chart { width: 100%; height: 100%; }

.temp-overlay {
  position: absolute; top: 8px; right: 12px; z-index: 10;
  display: flex; align-items: center; gap: clamp(8px, 0.7vw, 12px);
  padding: clamp(6px, 0.56vw, 10px) clamp(10px, 0.83vw, 14px);
  background: rgba(255,255,255,0.88); backdrop-filter: blur(8px);
  border-radius: 10px; border: 1px solid rgba(0,0,0,0.04);
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}
.to-item { text-align: center; }
.to-val { font-size: clamp(18px, 1.53vw, 24px); font-weight: 800; display: block; line-height: 1.2; }
.to-deg { font-size: clamp(12px, 0.9vw, 14px); font-weight: 400; }
.to-module .to-val { color: #ff6b00; }
.to-env .to-val { color: #409EFF; }
.to-lbl { font-size: clamp(10px, 0.76vw, 12px); color: #999; }
.to-sep { width: 1px; height: 28px; background: #e8e8e8; }

/* ===== 第四行：社会贡献瓦片 ===== */
.row-bottom { display: flex; margin-bottom: 0; }

.social-tile-group {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: clamp(12px, 1.1vw, 16px); width: 100%;
}
.social-tile {
  text-align: center; padding: clamp(18px, 1.53vw, 28px) clamp(8px, 0.7vw, 12px);
  background: #fff; border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: default;
}
.social-tile:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(255, 122, 24, 0.12); }

.st-icon-wrap {
  width: 44px; height: 44px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 4px;
}
.st-number { display: block; }
.st-val {
  font-size: clamp(26px, 2.2vw, 36px); font-weight: 800;
  color: #ff6b00; line-height: 1.1;
  font-variant-numeric: tabular-nums;
}
.st-unit { font-size: clamp(12px, 0.9vw, 14px); color: #999; font-weight: 400; }
.st-label { font-size: clamp(12px, 0.9vw, 14px); color: #666; margin-top: 2px; }

/* ===== Element Plus 覆盖 ===== */
:deep(.el-radio-button__inner) { border-radius: 8px !important; }
:deep(.el-radio-button--large .el-radio-button__inner) { padding: 10px 18px; font-size: clamp(13px, 0.97vw, 14px); }
:deep(.el-radio-button__orig-radio:checked + .el-radio-button__inner) { background-color: #ff9a42 !important; border-color: #ff9a42 !important; box-shadow: none; }

/* ===== 响应式 ===== */
@media (max-width: 1200px) {
  .chart-body-with-inset { flex-direction: column; }
  .eval-inset { flex: none; border-left: none; border-top: 1px dashed #e8e8e8; margin-left: 0; padding-left: 0; margin-top: 12px; padding-top: 12px; }
  .eval-matrix { flex-direction: row; flex-wrap: wrap; gap: 8px 16px; }
  .matrix-row { flex: 0 0 calc(50% - 8px); }
}
@media (max-width: 900px) {
  .merged-card-box { flex-direction: column; }
  .gauge-card-small, .kpi-card-wide { flex: none; height: auto; }
  .kpi-grid-3col-wide { grid-template-columns: 1fr; }
  .social-tile-group { grid-template-columns: repeat(2, 1fr); }
  .weather-strip { flex-direction: column; gap: 6px; }
}
@media (max-width: 600px) {
  .social-tile-group { grid-template-columns: 1fr 1fr; }
  .matrix-row { flex: 0 0 100%; }
}
</style>
