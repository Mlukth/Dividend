<template>
  <div class="command-center">
    <!-- 背景粒子 -->
    <div class="particle-layer">
      <div v-for="p in particles" :key="p.id" class="particle" :style="p.style"></div>
    </div>

    <!-- 顶部状态栏 -->
    <div class="top-bar">
      <div class="top-left">
        <span class="status-dot running"></span>
        <span class="station-name">光伏电站实时监控</span>
        <span class="divider-v"></span>
        <span class="realtime-power">实时功率 <strong>{{ realPower.toLocaleString() }}</strong> kW</span>
      </div>
      <div class="top-center">
        <div class="scroll-notice">
          <div class="scroll-track">
            <span v-for="(n, i) in notices" :key="i" class="notice-item">{{ n }}</span>
          </div>
        </div>
      </div>
      <div class="top-right">
        <span class="weather-badge">☀️ 32°C 晴</span>
        <span class="divider-v"></span>
        <span class="clock">{{ currentTime }}</span>
      </div>
    </div>

    <!-- 核心区：仪表盘 + KPI -->
    <div class="core-zone">
      <div class="gauge-panel">
        <!-- 活动环 SVG -->
        <svg class="activity-rings" viewBox="0 0 200 200">
          <!-- 背景环 -->
          <circle cx="100" cy="100" r="92" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="4" />
          <circle cx="100" cy="100" r="84" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="4" />
          <circle cx="100" cy="100" r="76" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="4" />
          <!-- 功率占比环 (橙) -->
          <circle cx="100" cy="100" r="92" fill="none" stroke="#ff7a2f" stroke-width="4"
            stroke-dasharray="578" :stroke-dashoffset="578 - 578 * powerRatio / 100"
            stroke-linecap="round" transform="rotate(-90 100 100)" class="ring-progress ring-power" />
          <!-- 日发电完成度环 (绿) -->
          <circle cx="100" cy="100" r="84" fill="none" stroke="#00d68f" stroke-width="4"
            stroke-dasharray="528" :stroke-dashoffset="528 - 528 * dayComplete / 100"
            stroke-linecap="round" transform="rotate(-90 100 100)" class="ring-progress ring-energy" />
          <!-- 可用率环 (蓝) -->
          <circle cx="100" cy="100" r="76" fill="none" stroke="#3b82f6" stroke-width="4"
            stroke-dasharray="477" :stroke-dashoffset="477 - 477 * availability / 100"
            stroke-linecap="round" transform="rotate(-90 100 100)" class="ring-progress ring-avail" />
        </svg>
        <div ref="gaugeRef" class="gauge-chart"></div>
        <div class="gauge-bottom">
          <div class="gauge-stat">
            <span class="gs-value orange">{{ realPower.toLocaleString() }}</span>
            <span class="gs-label">实时功率 kW</span>
          </div>
          <div class="gauge-stat-sep"></div>
          <div class="gauge-stat">
            <span class="gs-value">{{ capacity.toLocaleString() }}</span>
            <span class="gs-label">额定容量 kWp</span>
          </div>
          <div class="gauge-stat-sep"></div>
          <div class="gauge-stat">
            <span class="gs-value blue">{{ powerRatio }}%</span>
            <span class="gs-label">功率占比</span>
          </div>
        </div>
        <!-- 环图例 -->
        <div class="ring-legend">
          <span class="rl-item"><i class="rl-dot orange"></i>功率占比</span>
          <span class="rl-item"><i class="rl-dot green"></i>日发电完成</span>
          <span class="rl-item"><i class="rl-dot blue"></i>系统可用率</span>
        </div>
      </div>

      <div class="kpi-column">
        <div class="kpi-strip" v-for="(kpi, idx) in kpiList" :key="idx" :style="{ animationDelay: idx * 0.1 + 's' }">
          <div class="kpi-header">
            <span class="kpi-icon">{{ kpi.icon }}</span>
            <span class="kpi-label">{{ kpi.label }}</span>
          </div>
          <div class="kpi-value-row">
            <span class="kpi-value" :style="{ color: kpi.color }">{{ kpi.value }}</span>
            <span class="kpi-unit">{{ kpi.unit }}</span>
            <span v-if="kpi.trend" class="kpi-trend" :class="kpi.trendDir">
              {{ kpi.trendDir === 'up' ? '↑' : '↓' }} {{ kpi.trend }}
            </span>
          </div>
          <div class="kpi-sub-row">
            <span v-for="(sub, si) in kpi.subs" :key="si" class="kpi-sub">
              <span class="sub-label">{{ sub.label }}</span>
              <span class="sub-value">{{ sub.value }}</span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 中部：趋势图 + 评估 -->
    <div class="mid-zone">
      <div class="trend-panel">
        <div class="panel-header">
          <span class="panel-title">发电功率趋势</span>
          <div class="trend-tools">
            <div class="btn-group">
              <button v-for="t in ['日','月','年','总']" :key="t"
                :class="['btn-tab', { active: dateType === t }]" @click="dateType = t">{{ t }}</button>
            </div>
          </div>
        </div>
        <div class="chart-area">
          <div ref="powerChartRef" class="chart-box"></div>
          <!-- 当前时刻标记（日视图） -->
          <div v-if="dateType === '日'" class="now-marker" :style="{ left: nowPosition + '%' }">
            <span class="now-dot"></span>
            <span class="now-label">现在</span>
          </div>
        </div>
      </div>
      <div class="eval-panel">
        <div class="panel-header">
          <span class="panel-title">电站评估</span>
        </div>
        <div ref="radarRef" class="radar-chart"></div>
        <div class="eval-highlights">
          <div class="eval-hl">
            <span class="eval-hl-value orange">{{ evalData.systemEfficiency }}%</span>
            <span class="eval-hl-label">综合效率</span>
          </div>
          <div class="eval-hl">
            <span class="eval-hl-value green">{{ evalData.availability }}%</span>
            <span class="eval-hl-label">可用率</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 温度区 -->
    <div class="temp-zone">
      <div class="panel-header">
        <span class="panel-title">温度监测</span>
        <div class="temp-legend-inline">
          <span class="tl-item"><i class="tl-dot orange"></i>组件温度 {{ tempDisplay.moduleTemp }}°C</span>
          <span class="tl-item"><i class="tl-dot blue"></i>环境温度 {{ tempDisplay.envTemp }}°C</span>
        </div>
      </div>
      <div class="temp-chart-area">
        <div ref="tempChartRef" class="chart-box"></div>
        <!-- 当前温度大数字叠加 -->
        <div class="temp-overlay">
          <span class="temp-big orange">{{ tempDisplay.moduleTemp }}°</span>
          <span class="temp-big-sub">组件温度</span>
        </div>
      </div>
    </div>

    <!-- 社会贡献 -->
    <div class="social-zone">
      <div class="panel-header">
        <span class="panel-title">社会贡献</span>
      </div>
      <div class="social-grid">
        <div class="social-card" v-for="(s, idx) in socialList" :key="idx" :style="{ animationDelay: idx * 0.12 + 's' }">
          <div class="social-icon-wrap" :style="{ borderColor: s.color }">
            <span class="social-icon">{{ s.icon }}</span>
          </div>
          <div class="social-info">
            <span class="social-value" :style="{ color: s.color, textShadow: '0 0 20px ' + s.color + '66' }">{{ s.value }}</span>
            <span class="social-unit">{{ s.unit }}</span>
            <span class="social-label">{{ s.label }}</span>
            <span class="social-metaphor">{{ s.metaphor }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'

// ============ 响应式数据 ============
const realPower = ref(1200)
const capacity = ref(2336)
const powerRatio = computed(() => capacity.value > 0 ? ((realPower.value / capacity.value) * 100).toFixed(1) : 0)
const dayComplete = ref(65)
const availability = ref(99.2)
const currentTime = ref('')
const dateType = ref('日')

const gaugeRef = ref(null)
const powerChartRef = ref(null)
const tempChartRef = ref(null)
const radarRef = ref(null)
let gaugeChart = null
let powerChart = null
let tempChart = null
let radarChart = null
let clockTimer = null
let dataTimer = null

const tempDisplay = ref({ moduleTemp: '45.2', envTemp: '24.5' })

const notices = [
  '系统运行正常 · 数据更新于 10:35:41',
  '逆变器 #1 #2 #3 在线运行中',
  '今日预计发电量 1,580 kWh',
  '当前功率占比 51.4%',
]

// 粒子背景
const particles = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  style: {
    left: Math.random() * 100 + '%',
    top: Math.random() * 100 + '%',
    width: (1 + Math.random() * 2) + 'px',
    height: (1 + Math.random() * 2) + 'px',
    animationDuration: (8 + Math.random() * 12) + 's',
    animationDelay: Math.random() * 5 + 's',
  }
}))

const kpiList = computed(() => [
  {
    icon: '⚡', label: '当日发电量', value: '1,247', unit: 'kWh', color: '#ff7a2f',
    trend: '5.2%', trendDir: 'up',
    subs: [
      { label: '较昨日同期', value: '+5.2%' },
      { label: '累计发电量', value: '9,720 MWh' },
    ]
  },
  {
    icon: '💰', label: '当日收益', value: '748', unit: '元', color: '#00d68f',
    trend: '3.8%', trendDir: 'up',
    subs: [
      { label: '当年收益', value: '12.3 万' },
      { label: '累计收益', value: '58.3 万' },
    ]
  },
  {
    icon: '📡', label: '系统状态', value: '运行中', unit: '', color: '#00d68f',
    subs: [
      { label: '告警', value: '0' },
      { label: '逆变器', value: '3/3' },
      { label: '等效小时', value: '3.2 h' },
    ]
  },
])

const evalData = ref({
  systemEfficiency: '86.5',
  equivalentHours: 3.2,
  pr: '82.3',
  faultLoss: '0.05',
  availability: '99.2'
})

const socialList = computed(() => [
  { icon: '🏭', label: 'CO₂减排', value: socialData.value.co2Reduction, unit: '吨', color: '#ff7a2f', metaphor: '约6辆汽车年排放' },
  { icon: '🔥', label: '标煤节约', value: socialData.value.coalSaving, unit: '吨', color: '#00d68f', metaphor: '约120户家庭月用煤' },
  { icon: '🌳', label: '等效植树', value: socialData.value.treeEquivalent, unit: '棵', color: '#3b82f6', metaphor: '约1.5亩森林年吸碳' },
  { icon: '⚡', label: '绿色发电', value: socialData.value.greenPower, unit: 'kWh', color: '#a78bfa', metaphor: '约583户家庭月用电' },
])

const socialData = computed(() => {
  const totalKWh = 9720000
  return {
    co2Reduction: (totalKWh * 0.6 / 1000).toFixed(1),
    coalSaving: (totalKWh * 0.1229 / 1000).toFixed(1),
    treeEquivalent: Math.round(totalKWh * 0.6 / 1000 * 16.5),
    greenPower: totalKWh.toLocaleString()
  }
})

const nowPosition = computed(() => {
  const now = new Date()
  return ((now.getHours() * 60 + now.getMinutes()) / 1440) * 100
})

const powerDataByType = {
  '日': {
    xAxis: ['00:00','02:00','04:00','06:00','08:00','10:00','12:00','14:00','16:00','18:00','20:00','22:00'],
    data: [0, 0, 0, 0, 220, 780, 1200, 980, 650, 320, 0, 0]
  },
  '月': {
    xAxis: ['1日','5日','10日','15日','20日','25日','30日'],
    data: [4200, 4800, 5100, 3900, 4600, 5200, 4500]
  },
  '年': {
    xAxis: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
    data: [120, 135, 158, 175, 198, 220, 245, 238, 195, 165, 140, 118]
  },
  '总': {
    xAxis: ['2022','2023','2024','2025','2026'],
    data: [850, 920, 980, 1050, 972]
  }
}

// ============ 时钟 ============
const updateClock = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  })
}

// ============ 模拟数据刷新 ============
const simulateData = () => {
  realPower.value = Math.floor(1000 + Math.random() * 400)
  tempDisplay.value = {
    moduleTemp: (35 + Math.random() * 20).toFixed(1),
    envTemp: (18 + Math.random() * 15).toFixed(1)
  }
}

// ============ 图表初始化 ============
const initGauge = () => {
  if (!gaugeRef.value) return
  if (gaugeChart) gaugeChart.dispose()
  gaugeChart = echarts.init(gaugeRef.value, null, { renderer: 'canvas' })
  gaugeChart.setOption({
    backgroundColor: 'transparent',
    animation: true,
    animationDuration: 1500,
    animationEasing: 'elasticOut',
    series: [{
      type: 'gauge',
      center: ['50%', '55%'],
      radius: '85%',
      startAngle: 210,
      endAngle: -30,
      min: 0,
      max: capacity.value,
      splitNumber: 5,
      axisLine: {
        lineStyle: {
          width: 14,
          color: [[1, 'rgba(255,255,255,0.06)']]
        }
      },
      progress: {
        show: true,
        width: 14,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#ff9a42' },
            { offset: 1, color: '#ff5722' }
          ])
        }
      },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      pointer: {
        length: '55%',
        width: 6,
        itemStyle: { color: '#ff7a2f' }
      },
      anchor: {
        size: 14,
        itemStyle: {
          color: '#ff7a2f',
          borderColor: 'rgba(255,122,47,0.3)',
          borderWidth: 6
        }
      },
      title: { show: false },
      detail: {
        fontSize: 32,
        fontWeight: 700,
        color: '#ff7a2f',
        offsetCenter: [0, '30%'],
        formatter: '{value}',
        valueAnimation: true,
      },
      data: [{ value: realPower.value }]
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
    backgroundColor: 'transparent',
    animation: false,
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(10,14,26,0.95)',
      borderColor: 'rgba(255,122,47,0.3)',
      borderWidth: 1,
      textStyle: { color: '#e8eaf0', fontSize: 13 },
      axisPointer: { lineStyle: { color: 'rgba(255,122,47,0.4)', type: 'dashed' } }
    },
    grid: { left: '3%', right: '3%', top: '8%', bottom: '8%', containLabel: true },
    xAxis: {
      type: 'category', boundaryGap: false,
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
      axisTick: { show: false },
      axisLabel: { color: '#7a8299', fontSize: 11 },
      data: config.xAxis,
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } },
      axisLabel: { color: '#7a8299', fontSize: 11 },
    },
    series: [{
      name: '功率',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      animation: false,
      itemStyle: { color: '#ff7a2f', borderColor: '#0a0e1a', borderWidth: 2 },
      lineStyle: { color: '#ff7a2f', width: 3, shadowColor: 'rgba(255,122,47,0.4)', shadowBlur: 8 },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(255,122,47,0.25)' },
          { offset: 1, color: 'rgba(255,122,47,0)' }
        ])
      },
      data: config.data,
    }]
  }, true)
}

const initTempChart = () => {
  if (!tempChartRef.value) return
  if (tempChart) tempChart.dispose()
  tempChart = echarts.init(tempChartRef.value)
  tempChart.setOption({
    backgroundColor: 'transparent',
    animation: false,
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(10,14,26,0.95)',
      borderColor: 'rgba(255,122,47,0.3)',
      borderWidth: 1,
      textStyle: { color: '#e8eaf0', fontSize: 13 },
    },
    grid: { left: '3%', right: '3%', top: '8%', bottom: '5%', containLabel: true },
    xAxis: {
      type: 'category', boundaryGap: false,
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
      axisTick: { show: false },
      axisLabel: { color: '#7a8299', fontSize: 11 },
      data: ['00:00','02:00','04:00','06:00','08:00','10:00','12:00','14:00','16:00','18:00','20:00','22:00'],
    },
    yAxis: [
      {
        type: 'value', min: 0, max: 60,
        axisLine: { show: false }, axisTick: { show: false },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)', type: 'dashed' } },
        axisLabel: { color: '#ff7a2f', fontSize: 11, formatter: '{value}°C' },
      },
      {
        type: 'value', min: 0, max: 40,
        axisLine: { show: false }, axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { color: '#3b82f6', fontSize: 11, formatter: '{value}°C' },
      }
    ],
    series: [
      {
        name: '组件温度', type: 'line', smooth: true, symbol: 'none',
        animation: false,
        lineStyle: { color: '#ff7a2f', width: 2 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(255,122,47,0.15)' },
            { offset: 1, color: 'rgba(255,122,47,0)' }
          ])
        },
        data: [18, 17, 16, 17, 25, 35, 45, 48, 42, 35, 26, 20],
      },
      {
        name: '环境温度', type: 'line', yAxisIndex: 1, smooth: true, symbol: 'none',
        animation: false,
        lineStyle: { color: '#3b82f6', width: 2 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(59,130,246,0.1)' },
            { offset: 1, color: 'rgba(59,130,246,0)' }
          ])
        },
        data: [15, 14, 13, 14, 20, 25, 28, 30, 27, 23, 18, 16],
      }
    ]
  })
}

const initRadar = () => {
  if (!radarRef.value) return
  if (radarChart) radarChart.dispose()
  radarChart = echarts.init(radarRef.value)
  radarChart.setOption({
    backgroundColor: 'transparent',
    animation: true,
    radar: {
      indicator: [
        { name: '综合效率', max: 100 },
        { name: '等效利用', max: 6 },
        { name: '性能比PR', max: 100 },
        { name: '可用率', max: 100 },
        { name: '故障率(低优)', max: 100 },
      ],
      shape: 'polygon',
      splitNumber: 4,
      axisName: { color: '#7a8299', fontSize: 11 },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
      splitArea: { show: false },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
    },
    series: [{
      type: 'radar',
      data: [{
        value: [86.5, 3.2, 82.3, 99.2, 95],
        name: '电站评估',
        lineStyle: { color: '#ff7a2f', width: 2 },
        areaStyle: { color: 'rgba(255,122,47,0.2)' },
        itemStyle: { color: '#ff7a2f' },
      }]
    }]
  })
}

const initAllCharts = () => {
  initGauge()
  initPowerChart()
  initTempChart()
  initRadar()
}

const handleResize = () => {
  requestAnimationFrame(() => {
    gaugeChart?.resize()
    powerChart?.resize()
    tempChart?.resize()
    radarChart?.resize()
  })
}

watch(dateType, () => updatePowerChart())

watch(realPower, (val) => {
  if (gaugeChart) {
    gaugeChart.setOption({
      series: [{ data: [{ value: val }] }]
    })
  }
})

onMounted(() => {
  updateClock()
  clockTimer = setInterval(updateClock, 1000)
  dataTimer = setInterval(simulateData, 5000)
  nextTick(() => initAllCharts())
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  clearInterval(clockTimer)
  clearInterval(dataTimer)
  window.removeEventListener('resize', handleResize)
  gaugeChart?.dispose()
  powerChart?.dispose()
  tempChart?.dispose()
  radarChart?.dispose()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.cn/css2?family=Inter:wght@400;600;700;800&display=swap');

.command-center {
  --bg: #0a0e1a;
  --surface: rgba(255,255,255,0.04);
  --surface-hover: rgba(255,255,255,0.07);
  --border: rgba(255,255,255,0.08);
  --border-hover: rgba(255,255,255,0.15);
  --text: #e8eaf0;
  --text-dim: #7a8299;
  --orange: #ff7a2f;
  --green: #00d68f;
  --blue: #3b82f6;
  --purple: #a78bfa;
  --red: #ff4757;

  position: relative;
  min-height: 100vh;
  background: var(--bg);
  background-image: radial-gradient(ellipse at 50% 0%, rgba(255,122,47,0.05) 0%, transparent 60%);
  color: var(--text);
  font-family: 'Inter', 'Microsoft YaHei', sans-serif;
  padding: 0 20px 30px;
  overflow-x: hidden;
}

/* ===== 粒子背景 ===== */
.particle-layer {
  position: fixed; inset: 0;
  pointer-events: none; z-index: 0;
  overflow: hidden;
}
.particle {
  position: absolute;
  background: rgba(255,255,255,0.3);
  border-radius: 50%;
  animation: float-particle linear infinite;
}
@keyframes float-particle {
  0% { transform: translateY(0) translateX(0); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(-100vh) translateX(30px); opacity: 0; }
}

/* ===== 顶部状态栏 ===== */
.top-bar {
  position: relative; z-index: 10;
  display: flex; align-items: center; justify-content: space-between;
  height: 48px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  border-radius: 0 0 12px 12px;
  padding: 0 20px;
  margin: 0 -20px 20px;
  backdrop-filter: blur(12px);
}
.top-left, .top-right { display: flex; align-items: center; gap: 12px; font-size: 13px; }
.top-left strong { color: var(--orange); font-size: 15px; }
.status-dot {
  width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
}
.status-dot.running {
  background: var(--green);
  box-shadow: 0 0 0 3px rgba(0,214,143,0.2);
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(0,214,143,0.4); }
  70% { box-shadow: 0 0 0 8px rgba(0,214,143,0); }
  100% { box-shadow: 0 0 0 0 rgba(0,214,143,0); }
}
.station-name { font-weight: 600; color: var(--text); }
.divider-v { width: 1px; height: 16px; background: var(--border); }
.scroll-notice { overflow: hidden; width: 360px; }
.scroll-track {
  display: flex; gap: 60px;
  animation: scroll-notice 20s linear infinite;
  white-space: nowrap;
}
.notice-item { font-size: 12px; color: var(--text-dim); }
@keyframes scroll-notice {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.weather-badge {
  background: rgba(255,122,47,0.1);
  padding: 3px 10px; border-radius: 6px;
  font-size: 12px; color: var(--orange);
}
.clock { font-size: 13px; color: var(--text-dim); font-variant-numeric: tabular-nums; }

/* ===== 核心区 ===== */
.core-zone {
  display: flex; gap: 20px; margin-bottom: 20px;
  position: relative; z-index: 1;
}

/* ===== 仪表盘面板 ===== */
.gauge-panel {
  position: relative;
  flex: 0 0 340px;
  height: 400px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 20px;
  display: flex; flex-direction: column; align-items: center;
  overflow: hidden;
}
.gauge-panel::before {
  content: '';
  position: absolute; top: 0; left: 10%; right: 10%; height: 1px;
  background: linear-gradient(90deg, transparent, var(--orange), transparent);
  opacity: 0.6;
}
.activity-rings {
  position: absolute; top: 8px; left: 50%;
  transform: translateX(-50%);
  width: 220px; height: 220px;
  pointer-events: none;
}
.ring-progress {
  transition: stroke-dashoffset 1s ease-out;
}
.ring-power { filter: drop-shadow(0 0 4px rgba(255,122,47,0.4)); }
.ring-energy { filter: drop-shadow(0 0 4px rgba(0,214,143,0.4)); }
.ring-avail { filter: drop-shadow(0 0 4px rgba(59,130,246,0.4)); }

.gauge-chart { width: 260px; height: 220px; margin-top: 10px; }
.gauge-bottom {
  display: flex; align-items: center; gap: 16px;
  margin-top: 8px;
}
.gauge-stat { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.gs-value { font-size: 18px; font-weight: 700; }
.gs-value.orange { color: var(--orange); }
.gs-value.blue { color: var(--blue); }
.gs-label { font-size: 11px; color: var(--text-dim); }
.gauge-stat-sep { width: 1px; height: 28px; background: var(--border); }
.ring-legend {
  display: flex; gap: 16px; margin-top: 12px; font-size: 11px; color: var(--text-dim);
}
.rl-item { display: flex; align-items: center; gap: 4px; }
.rl-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
.rl-dot.orange { background: var(--orange); }
.rl-dot.green { background: var(--green); }
.rl-dot.blue { background: var(--blue); }

/* ===== KPI 条 ===== */
.kpi-column {
  flex: 1;
  display: flex; flex-direction: column; gap: 12px;
}
.kpi-strip {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 16px 20px;
  display: flex; flex-direction: column; gap: 8px;
  animation: slide-up 0.5s ease both;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}
.kpi-strip::before {
  content: '';
  position: absolute; top: 0; left: 10%; right: 10%; height: 1px;
  background: linear-gradient(90deg, transparent, var(--border-hover), transparent);
}
.kpi-strip:hover {
  background: var(--surface-hover);
  border-color: var(--border-hover);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
}
@keyframes slide-up {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
.kpi-header { display: flex; align-items: center; gap: 8px; }
.kpi-icon { font-size: 16px; }
.kpi-label { font-size: 13px; color: var(--text-dim); }
.kpi-value-row { display: flex; align-items: baseline; gap: 6px; }
.kpi-value { font-size: 28px; font-weight: 800; line-height: 1; }
.kpi-unit { font-size: 13px; color: var(--text-dim); }
.kpi-trend {
  font-size: 12px; padding: 2px 6px; border-radius: 4px;
  margin-left: auto;
}
.kpi-trend.up { background: rgba(0,214,143,0.1); color: var(--green); }
.kpi-trend.down { background: rgba(255,71,87,0.1); color: var(--red); }
.kpi-sub-row { display: flex; gap: 20px; }
.kpi-sub { display: flex; gap: 4px; }
.sub-label { font-size: 11px; color: var(--text-dim); }
.sub-value { font-size: 11px; color: var(--text); font-weight: 600; }

/* ===== 中部区域 ===== */
.mid-zone {
  display: flex; gap: 20px; margin-bottom: 20px;
  position: relative; z-index: 1;
}
.trend-panel {
  flex: 1; min-width: 0;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 20px;
  position: relative; overflow: hidden;
}
.trend-panel::before {
  content: '';
  position: absolute; top: 0; left: 10%; right: 10%; height: 1px;
  background: linear-gradient(90deg, transparent, var(--orange), transparent);
  opacity: 0.4;
}
.panel-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 16px;
}
.panel-title {
  font-size: 16px; font-weight: 700;
}
.trend-tools { display: flex; gap: 8px; align-items: center; }
.btn-group { display: flex; gap: 2px; }
.btn-tab {
  padding: 6px 14px; border: none; border-radius: 8px;
  background: transparent; color: var(--text-dim);
  font-size: 13px; cursor: pointer; transition: all 0.2s;
}
.btn-tab:hover { background: rgba(255,255,255,0.06); }
.btn-tab.active {
  background: var(--orange); color: #fff; font-weight: 600;
}
.chart-area { position: relative; height: 280px; }
.chart-box { width: 100%; height: 100%; }
.now-marker {
  position: absolute; top: 0; bottom: 40px;
  width: 1px; background: rgba(255,122,47,0.4);
  transform: translateX(-50%);
}
.now-dot {
  position: absolute; top: -3px; left: -4px;
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--orange);
  box-shadow: 0 0 8px rgba(255,122,47,0.6);
}
.now-label {
  position: absolute; top: -20px; left: 50%;
  transform: translateX(-50%);
  font-size: 10px; color: var(--orange);
  white-space: nowrap;
}

/* ===== 评估面板 ===== */
.eval-panel {
  flex: 0 0 280px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 20px;
  display: flex; flex-direction: column;
  position: relative; overflow: hidden;
}
.eval-panel::before {
  content: '';
  position: absolute; top: 0; left: 10%; right: 10%; height: 1px;
  background: linear-gradient(90deg, transparent, var(--green), transparent);
  opacity: 0.4;
}
.radar-chart { flex: 1; min-height: 200px; }
.eval-highlights {
  display: flex; gap: 12px; margin-top: 8px;
}
.eval-hl {
  flex: 1; text-align: center;
  padding: 8px;
  background: rgba(255,255,255,0.03);
  border-radius: 10px;
}
.eval-hl-value { display: block; font-size: 20px; font-weight: 800; }
.eval-hl-value.orange { color: var(--orange); }
.eval-hl-value.green { color: var(--green); }
.eval-hl-label { font-size: 11px; color: var(--text-dim); margin-top: 2px; display: block; }

/* ===== 温度区 ===== */
.temp-zone {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 20px;
  position: relative; z-index: 1;
  overflow: hidden;
}
.temp-zone::before {
  content: '';
  position: absolute; top: 0; left: 10%; right: 10%; height: 1px;
  background: linear-gradient(90deg, transparent, var(--orange), transparent);
  opacity: 0.4;
}
.temp-legend-inline {
  display: flex; gap: 20px; font-size: 12px; color: var(--text-dim);
}
.tl-item { display: flex; align-items: center; gap: 6px; }
.tl-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
.tl-dot.orange { background: var(--orange); }
.tl-dot.blue { background: var(--blue); }
.temp-chart-area {
  position: relative; height: 240px;
}
.temp-overlay {
  position: absolute; top: 16px; right: 60px;
  display: flex; flex-direction: column; align-items: center;
  pointer-events: none;
}
.temp-big {
  font-size: 42px; font-weight: 800; line-height: 1;
}
.temp-big.orange { color: var(--orange); }
.temp-big-sub { font-size: 11px; color: var(--text-dim); margin-top: 4px; }

/* ===== 社会贡献 ===== */
.social-zone {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 20px;
  position: relative; z-index: 1;
  overflow: hidden;
}
.social-zone::before {
  content: '';
  position: absolute; top: 0; left: 10%; right: 10%; height: 1px;
  background: linear-gradient(90deg, transparent, var(--green), transparent);
  opacity: 0.4;
}
.social-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
}
.social-card {
  display: flex; align-items: center; gap: 16px;
  padding: 20px;
  background: rgba(255,255,255,0.02);
  border: 1px solid var(--border);
  border-radius: 16px;
  animation: slide-up 0.5s ease both;
  transition: all 0.3s;
}
.social-card:hover {
  background: var(--surface-hover);
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
}
.social-icon-wrap {
  width: 48px; height: 48px;
  border-radius: 14px;
  border: 1.5px solid;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.03);
  flex-shrink: 0;
}
.social-icon { font-size: 22px; }
.social-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.social-value {
  font-size: 24px; font-weight: 800; line-height: 1.1;
}
.social-unit { font-size: 12px; color: var(--text-dim); }
.social-label { font-size: 13px; color: var(--text-dim); }
.social-metaphor { font-size: 10px; color: var(--text-dim); opacity: 0.7; margin-top: 2px; }

/* ===== 响应式 ===== */
@media (max-width: 1200px) {
  .core-zone { flex-direction: column; }
  .gauge-panel { flex: none; height: auto; }
  .mid-zone { flex-direction: column; }
  .eval-panel { flex: none; }
  .social-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .top-bar { flex-wrap: wrap; height: auto; padding: 10px 16px; gap: 8px; }
  .scroll-notice { display: none; }
  .social-grid { grid-template-columns: 1fr; }
  .temp-overlay { display: none; }
}
</style>
