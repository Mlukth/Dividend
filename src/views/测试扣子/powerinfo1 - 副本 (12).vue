<template>
  <div class="solar-page">
    <!-- ═══ HERO ═══ -->
    <section class="hero">
      <div class="hero-gradient"></div>
      <div class="hero-grid"></div>
      <!-- Decorative sun SVG -->
      <svg class="hero-sun" viewBox="0 0 200 200" fill="none">
        <circle cx="100" cy="100" r="60" fill="rgba(245,158,11,0.06)" />
        <circle cx="100" cy="100" r="40" fill="rgba(245,158,11,0.04)" />
        <circle cx="100" cy="100" r="20" fill="rgba(245,158,11,0.03)" />
      </svg>
      <div class="hero-inner">
        <div class="hero-main">
          <div class="hero-breadcrumb">
            <el-icon :size="14"><Location /></el-icon>
            <span>{{ stationAddress || '光伏电站' }}</span>
            <span class="hero-sep">·</span>
            <span class="hero-status-tag" :class="runStatus === '停机' ? 'tag-danger' : 'tag-ok'">
              {{ runStatus }}
            </span>
          </div>
          <div class="hero-number-row">
            <span class="hero-power" :class="{ 'flash-val': flashFlags.power }">
              {{ realTimePower.toLocaleString() }}
            </span>
            <span class="hero-power-unit">kW</span>
            <span class="hero-trend" :class="powerTrend.dir">
              <el-icon :size="14"><CaretTop v-if="powerTrend.dir==='up'" /><CaretBottom v-else-if="powerTrend.dir==='down'" /><Minus v-else /></el-icon>
              {{ powerTrend.text }}
            </span>
          </div>
          <p class="hero-sub">实时功率 · 装机容量 {{ totalCapacity.toLocaleString() }} kWp · 占比 {{ powerRatio }}%</p>
          <div class="hero-pills">
            <span class="pill"><el-icon :size="13"><Sunny /></el-icon> 32°C 晴</span>
            <span class="pill"><el-icon :size="13"><Odometer /></el-icon> 等效 {{ equivalentHours }}h</span>
            <span class="pill" :class="warningCount > 0 ? 'pill-warn' : ''">
              <el-icon :size="13"><Warning /></el-icon> 告警 {{ warningCount }}
            </span>
            <span class="pill pill-clock">{{ currentTime }}</span>
          </div>
        </div>
        <div class="hero-gauge-side">
          <svg viewBox="0 0 220 130" class="gauge-svg">
            <defs>
              <linearGradient id="gGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#fbbf24" />
                <stop offset="100%" stop-color="#ea580c" />
              </linearGradient>
              <filter id="gGlow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            <path d="M 20 115 A 90 90 0 0 1 200 115" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="12" stroke-linecap="round" />
            <path d="M 20 115 A 90 90 0 0 1 200 115" fill="none" stroke="url(#gGrad)" stroke-width="12" stroke-linecap="round"
              :stroke-dasharray="gaugeArc.total" :stroke-dashoffset="gaugeArc.offset"
              filter="url(#gGlow)" class="gauge-arc" />
            <template v-for="tick in gaugeTicks" :key="tick.pct">
              <line :x1="tick.x1" :y1="tick.y1" :x2="tick.x2" :y2="tick.y2" stroke="rgba(255,255,255,0.25)" stroke-width="1.5" />
              <text :x="tick.lx" :y="tick.ly" fill="rgba(255,255,255,0.4)" font-size="9" text-anchor="middle">{{ tick.label }}</text>
            </template>
            <text x="110" y="92" fill="#fff" font-size="30" font-weight="800" text-anchor="middle" font-variant-numeric="tabular-nums">{{ powerRatio }}</text>
            <text x="110" y="110" fill="rgba(255,255,255,0.5)" font-size="10" text-anchor="middle">功率占比 %</text>
          </svg>
        </div>
      </div>
    </section>

    <!-- ═══ KPI CARDS ═══ -->
    <section class="kpi-row">
      <div class="kpi-card" :class="{ 'card-flash': flashFlags.todayEnergy }">
        <div class="kpi-bar orange"></div>
        <div class="kpi-inner">
          <div class="kpi-top">
            <span class="kpi-eyebrow">当日发电量</span>
            <span class="kpi-badge-sm" v-if="todayEnergyChange !== '--'" :class="todayEnergyChange.startsWith('+') ? 'badge-up' : 'badge-down'">{{ todayEnergyChange }}</span>
          </div>
          <div class="kpi-big-row">
            <span class="kpi-big">{{ todayEnergy }}</span>
            <span class="kpi-big-unit">kWh</span>
          </div>
          <div class="kpi-progress-track">
            <div class="kpi-progress-fill" :style="{ width: dailyCompletion + '%', backgroundColor: dailyCompletion >= 80 ? '#10b981' : dailyCompletion >= 50 ? '#f59e0b' : '#ef4444' }"></div>
          </div>
          <div class="kpi-progress-labels">
            <span>日计划完成度</span>
            <span class="kpi-progress-pct">{{ dailyCompletion }}%</span>
          </div>
          <div class="kpi-mini-grid">
            <div><span class="mini-l">较昨日</span><span class="mini-v up">+12.3%</span></div>
            <div><span class="mini-l">累计</span><span class="mini-v">{{ totalEnergy }} kWh</span></div>
          </div>
        </div>
      </div>

      <div class="kpi-card" :class="{ 'card-flash': flashFlags.todayProfit }">
        <div class="kpi-bar gold"></div>
        <div class="kpi-inner">
          <div class="kpi-top">
            <span class="kpi-eyebrow">当日收益</span>
          </div>
          <div class="kpi-big-row">
            <span class="kpi-big">¥ {{ todayProfit }}</span>
          </div>
          <div class="profit-bars">
            <div class="pbar" v-for="(h, i) in profitBars" :key="i" :style="{ height: h + '%' }"></div>
          </div>
          <div class="kpi-mini-grid cols3">
            <div><span class="mini-l">年收益</span><span class="mini-v">{{ yearProfit }}元</span></div>
            <div><span class="mini-l">累计</span><span class="mini-v">{{ totalProfit }}元</span></div>
            <div><span class="mini-l">电价</span><span class="mini-v">0.4元</span></div>
          </div>
        </div>
      </div>

      <div class="kpi-card" :class="{ 'card-warn': warningCount > 0, 'card-danger': runStatus === '停机' }">
        <div class="kpi-bar" :class="runStatus === '停机' ? 'red' : 'green'"></div>
        <div class="kpi-inner">
          <div class="kpi-top">
            <span class="kpi-eyebrow">系统状态</span>
            <span class="dot-sm" :class="runStatus === '停机' ? 'dot-red' : 'dot-green'"></span>
          </div>
          <div class="kpi-big-row">
            <span class="kpi-big" :class="runStatus === '停机' ? 'val-red' : 'val-green'">{{ runStatus }}</span>
          </div>
          <div class="device-row">
            <div class="dev-dot" v-for="n in inverterTotal" :key="n" :class="n <= inverterOnline ? 'on' : 'off'" :title="`逆变器${n}`"></div>
            <span class="dev-count">{{ inverterOnline }}/{{ inverterTotal }}</span>
          </div>
          <div class="kpi-mini-grid">
            <div><span class="mini-l">告警</span><span class="mini-v" :class="warningCount > 0 ? 'val-red' : ''">{{ warningCount }}</span></div>
            <div><span class="mini-l">满发小时</span><span class="mini-v">{{ equivalentHours }}h</span></div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ POWER TREND + EVALUATION ═══ -->
    <section class="chart-row">
      <div class="chart-main">
        <div class="sec-header">
          <div class="sec-title-group">
            <span class="sec-dot orange"></span>
            <span class="sec-title">发电功率趋势</span>
          </div>
          <div class="sec-tools">
            <div class="seg-ctrl">
              <button v-for="opt in dateTypeOptions" :key="opt.value"
                :class="['seg-btn', { active: dateType === opt.value }]"
                @click="dateType = opt.value; updatePowerChart()">{{ opt.label }}</button>
            </div>
            <el-date-picker v-model="selectDate" :type="dateType === 'month' ? 'month' : 'date'"
              placeholder="选择日期" size="default" class="picker-thin" />
          </div>
        </div>
        <div class="chart-box" ref="powerChartRef"></div>
      </div>
      <div class="eval-side">
        <div class="sec-header">
          <div class="sec-title-group">
            <span class="sec-dot green"></span>
            <span class="sec-title">电站评估</span>
          </div>
        </div>
        <div class="eval-list">
          <div class="eval-item" v-for="item in evalItems" :key="item.label">
            <span class="eval-label">{{ item.label }}</span>
            <div class="eval-track">
              <div class="eval-fill" :style="{ width: item.pct + '%', backgroundColor: item.color }"></div>
            </div>
            <span class="eval-val" :style="{ color: item.color }">{{ item.display }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ TEMPERATURE + WEATHER ═══ -->
    <section class="temp-section">
      <div class="temp-main">
        <div class="sec-header">
          <div class="sec-title-group">
            <span class="sec-dot blue"></span>
            <span class="sec-title">温度监测</span>
          </div>
          <div class="sec-tools">
            <div class="temp-badges">
              <span class="temp-pill t-orange"><el-icon :size="11"><Odometer /></el-icon> {{ moduleTemp }}°C</span>
              <span class="temp-pill t-blue"><el-icon :size="11"><Odometer /></el-icon> {{ envTemp }}°C</span>
            </div>
            <div class="seg-ctrl small">
              <button :class="['seg-btn', { active: tempDateType === 'day' }]" @click="tempDateType = 'day'">日</button>
              <button :class="['seg-btn', { active: tempDateType === 'week' }]" @click="tempDateType = 'week'">周</button>
            </div>
          </div>
        </div>
        <div class="weather-strip">
          <div class="wday" v-for="day in weatherData" :key="day.label">
            <el-icon :size="14"><component :is="day.icon" /></el-icon>
            <span class="wday-name">{{ day.label }}</span>
            <span class="wday-temp">{{ day.temp }}°</span>
            <span class="wday-desc">{{ day.desc }}</span>
          </div>
        </div>
        <div class="chart-box temp-chart" ref="tempChartRef"></div>
      </div>
    </section>

    <!-- ═══ SOCIAL CONTRIBUTION ═══ -->
    <section class="social-section">
      <div class="social-card" v-for="(item, idx) in socialItems" :key="item.label" :class="'social-' + idx">
        <div class="social-icon" :style="{ background: item.iconBg }">
          <el-icon :size="20" :color="item.iconColor"><component :is="item.icon" /></el-icon>
        </div>
        <div class="social-body">
          <div class="social-num">
            <span class="social-val">{{ item.display }}</span>
            <span class="social-unit">{{ item.unit }}</span>
          </div>
          <div class="social-label">{{ item.label }}</div>
          <div class="social-ctx">{{ item.context }}</div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick, markRaw } from 'vue'
import * as echarts from 'echarts'
import {
  Sunny, PartlyCloudy, Cloudy, Odometer, Coin, Monitor,
  CaretTop, CaretBottom, Minus, Sunrise, Location, Warning
} from '@element-plus/icons-vue'

// ═══════════════════════════════════════
// 数据
// ═══════════════════════════════════════
const totalCapacity = 2336
const realTimePower = ref(1680)
const prevPower = ref(1680)
const todayEnergy = ref('1,245.6')
const totalEnergy = ref('972.5万')
const todayProfit = ref('747.36')
const yearProfit = ref('85,230')
const totalProfit = ref('583,680')
const equivalentHours = ref('3.8')
const runStatus = ref('运行中')
const warningCount = ref(1)
const inverterTotal = ref(12)
const inverterOnline = ref(11)
const moduleTemp = ref('45.2')
const envTemp = ref('24.5')
const stationAddress = ref('江苏省南京市江宁区')

const selectDate = ref(new Date())
const dateType = ref('day')
const tempDateType = ref('day')
const dateTypeOptions = [
  { value: 'day', label: '日' },
  { value: 'month', label: '月' },
  { value: 'year', label: '年' },
  { value: 'total', label: '总' },
]

const currentTime = ref('')
const weatherData = ref([
  { label: '今天', icon: markRaw(Sunny), temp: '32', desc: '晴' },
  { label: '明天', icon: markRaw(PartlyCloudy), temp: '28', desc: '多云' },
  { label: '后天', icon: markRaw(Cloudy), temp: '24', desc: '小雨' },
])

const profitBars = [35, 52, 68, 45, 78, 62, 55, 70, 48, 82]

// ═══════════════════════════════════════
// 计算属性
// ═══════════════════════════════════════
const powerRatio = computed(() => {
  return totalCapacity > 0 ? ((realTimePower.value / totalCapacity) * 100).toFixed(1) : 0
})

const dailyCompletion = computed(() => {
  const expected = totalCapacity * 4
  const actual = parseFloat(todayEnergy.value.replace(/,/g, '')) || 0
  return Math.min(Math.round((actual / expected) * 100), 100)
})

const powerTrend = computed(() => {
  const diff = realTimePower.value - prevPower.value
  if (Math.abs(diff) < 5) return { dir: 'flat', text: '持平' }
  if (diff > 0) return { dir: 'up', text: `+${diff} kW` }
  return { dir: 'down', text: `${diff} kW` }
})

const todayEnergyChange = computed(() => '+12.3%')

// SVG Gauge arc
const gaugeArc = computed(() => {
  const r = 90
  const total = Math.PI * r
  const pct = Math.min(realTimePower.value / (totalCapacity || 1), 1)
  return { total: total.toFixed(2), offset: (total * (1 - pct)).toFixed(2) }
})

const gaugeTicks = computed(() => {
  const cx = 110, cy = 115, r = 90
  const ticks = []
  for (let i = 0; i <= 4; i++) {
    const pct = i / 4
    const angle = Math.PI * (1 - pct)
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    ticks.push({
      x1: cx + (r - 8) * cos,
      y1: cy - (r - 8) * sin,
      x2: cx + (r + 5) * cos,
      y2: cy - (r + 5) * sin,
      lx: cx + (r + 17) * cos,
      ly: cy - (r + 17) * sin + 3,
      label: Math.round(pct * 100) + '%',
      pct
    })
  }
  return ticks
})

const evalItems = computed(() => [
  { label: '综合效率', display: '86.5%', pct: 86.5, color: '#f59e0b' },
  { label: '等效利用小时', display: '3.8 h', pct: 63.3, color: '#ea580c' },
  { label: '性能比 PR', display: '82.3%', pct: 82.3, color: '#f59e0b' },
  { label: '故障损失', display: '0.05 kWh', pct: 2, color: '#10b981' },
  { label: '可用率', display: '99.2%', pct: 99.2, color: '#10b981' },
])

const socialItems = computed(() => {
  const totalKWh = 9725000
  const co2 = (totalKWh * 0.6 / 1000).toFixed(1)
  const coal = (totalKWh * 0.1229 / 1000).toFixed(1)
  const trees = Math.round(parseFloat(co2) * 16.5)
  return [
    { label: 'CO₂减排', display: Number(co2).toLocaleString(), unit: '吨', icon: markRaw(Cloudy), iconBg: 'rgba(245,158,11,0.12)', iconColor: '#f59e0b', context: `相当于 ${Math.round(parseFloat(co2)/2)} 辆汽车年排放` },
    { label: '标煤节约', display: Number(coal).toLocaleString(), unit: '吨', icon: markRaw(Coin), iconBg: 'rgba(212,168,83,0.12)', iconColor: '#d4a853', context: `可供 ${Math.round(parseFloat(coal)*4)} 户家庭月供暖` },
    { label: '等效植树', display: Number(trees).toLocaleString(), unit: '棵', icon: markRaw(Location), iconBg: 'rgba(16,185,129,0.12)', iconColor: '#10b981', context: `相当于 ${Math.round(trees/2000)} 个足球场森林` },
    { label: '绿色发电', display: '972.5', unit: '万kWh', icon: markRaw(Warning), iconBg: 'rgba(59,130,246,0.12)', iconColor: '#3b82f6', context: `相当于 ${Math.round(totalKWh/10000/2000*5)} 户家庭年用电` },  // ✅ 修复：WarnTriangle 改为 Warning
  ]
})

// ═══════════════════════════════════════
// 数值微闪
// ═══════════════════════════════════════
const flashFlags = ref({ power: false, todayEnergy: false, todayProfit: false })
const triggerFlash = (key) => {
  flashFlags.value[key] = true
  setTimeout(() => { flashFlags.value[key] = false }, 400)
}

// ═══════════════════════════════════════
// 图表
// ═══════════════════════════════════════
const powerChartRef = ref(null)
const tempChartRef = ref(null)
let powerChart = null
let tempChart = null
let refreshTimer = null
let clockTimer = null

const powerDataByType = {
  day: {
    xAxis: ['00:00','02:00','04:00','06:00','08:00','10:00','12:00','14:00','16:00','18:00','20:00','22:00'],
    data: [0, 0, 0, 5, 220, 780, 1200, 1380, 980, 650, 320, 0]
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

const initPowerChart = () => {
  if (!powerChartRef.value) return
  if (powerChart) powerChart.dispose()
  powerChart = echarts.init(powerChartRef.value)
  updatePowerChart()
}

const updatePowerChart = () => {
  if (!powerChart) return
  const config = powerDataByType[dateType.value]
  const isDay = dateType.value === 'day'
  powerChart.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15,23,42,0.92)',
      borderColor: 'rgba(245,158,11,0.3)',
      borderWidth: 1,
      padding: [12, 16],
      textStyle: { color: '#f1f5f9', fontSize: 13, fontFamily: 'inherit' },
      axisPointer: {
        type: 'cross',
        lineStyle: { color: 'rgba(245,158,11,0.3)', type: 'dashed' },
        crossStyle: { color: 'rgba(245,158,11,0.3)' },
        label: { backgroundColor: '#f59e0b', color: '#fff', fontSize: 11 }
      },
      formatter: (params) => {
        const p = params[0]
        return `<div style="font-weight:600;margin-bottom:4px">${p.axisValue}</div>
                <div style="display:flex;align-items:center;gap:6px">
                  <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#f59e0b"></span>
                  功率：<strong style="color:#fbbf24">${p.value} kW</strong>
                </div>`
      }
    },
    grid: { left: '3%', right: '4%', top: '10%', bottom: '10%', containLabel: true },
    xAxis: {
      type: 'category', boundaryGap: !isDay,
      axisLine: { show: true, lineStyle: { color: '#e2e8f0' } },
      axisTick: { show: false },
      axisLabel: { color: '#94a3b8', fontSize: 12, margin: 12 },
      data: config.xAxis
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false }, axisTick: { show: false },
      splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
      axisLabel: { color: '#94a3b8', fontSize: 12 }
    },
    series: [{
      name: '功率', type: isDay ? 'line' : 'bar',
      smooth: isDay, symbol: isDay ? 'circle' : 'none', symbolSize: 6, showSymbol: isDay,
      animationDuration: 800, animationEasing: 'cubicOut',
      lineStyle: isDay ? {
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: '#fbbf24' }, { offset: 1, color: '#ea580c' }
        ]),
        width: 3, shadowColor: 'rgba(245,158,11,0.15)', shadowBlur: 8, shadowOffsetY: 4
      } : undefined,
      areaStyle: isDay ? {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(245,158,11,0.18)' },
          { offset: 0.6, color: 'rgba(245,158,11,0.04)' },
          { offset: 1, color: 'rgba(245,158,11,0)' }
        ])
      } : undefined,
      itemStyle: isDay ? {
        color: '#f59e0b', borderColor: '#fff', borderWidth: 2
      } : {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#fbbf24' }, { offset: 1, color: 'rgba(245,158,11,0.35)' }
        ]),
        borderRadius: [4, 4, 0, 0]
      },
      barWidth: !isDay ? '40%' : undefined,
      barMaxWidth: !isDay ? 32 : undefined,
      emphasis: {
        itemStyle: { color: '#ea580c', borderColor: '#ea580c', borderWidth: 2, shadowColor: 'rgba(245,158,11,0.35)', shadowBlur: 10 }
      },
      data: config.data
    }]
  }, true)
}

const initTempChart = () => {
  if (!tempChartRef.value) return
  if (tempChart) tempChart.dispose()
  tempChart = echarts.init(tempChartRef.value)
  tempChart.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15,23,42,0.92)',
      borderColor: 'rgba(59,130,246,0.3)',
      borderWidth: 1,
      padding: [12, 16],
      textStyle: { color: '#f1f5f9', fontSize: 13, fontFamily: 'inherit' },
      formatter: (params) => {
        let html = `<div style="font-weight:600;margin-bottom:6px">${params[0].axisValue}</div>`
        params.forEach(p => {
          html += `<div style="display:flex;align-items:center;gap:6px;margin:3px 0">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color}"></span>
            ${p.seriesName}：<strong>${p.value}°C</strong></div>`
        })
        return html
      }
    },
    grid: { left: '3%', right: '4%', top: '8%', bottom: '5%', containLabel: true },
    xAxis: {
      type: 'category', boundaryGap: false,
      axisLine: { show: true, lineStyle: { color: '#e2e8f0' } },
      axisTick: { show: false },
      axisLabel: { color: '#94a3b8', fontSize: 11 },
      data: ['00:00','02:00','04:00','06:00','08:00','10:00','12:00','14:00','16:00','18:00','20:00','22:00']
    },
    yAxis: {
      type: 'value', min: 0, max: 60,
      axisLine: { show: false }, axisTick: { show: false },
      splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
      axisLabel: { color: '#94a3b8', fontSize: 11, formatter: '{value}°C' }
    },
    series: [
      {
        name: '组件温度', type: 'line', smooth: true, symbol: 'none',
        animationDuration: 800,
        lineStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#fbbf24' }, { offset: 1, color: '#ea580c' }
          ]),
          width: 2.5, shadowColor: 'rgba(245,158,11,0.12)', shadowBlur: 6, shadowOffsetY: 3
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(245,158,11,0.15)' },
            { offset: 1, color: 'rgba(245,158,11,0.01)' }
          ])
        },
        data: [18,17,16,17,25,35,45,48,42,35,26,20]
      },
      {
        name: '环境温度', type: 'line', smooth: true, symbol: 'none',
        animationDuration: 800,
        lineStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#60a5fa' }, { offset: 1, color: '#3b82f6' }
          ]),
          width: 2.5, shadowColor: 'rgba(59,130,246,0.1)', shadowBlur: 6, shadowOffsetY: 3
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(59,130,246,0.12)' },
            { offset: 1, color: 'rgba(59,130,246,0.01)' }
          ])
        },
        data: [15,14,13,14,20,25,28,30,27,23,18,16]
      }
    ]
  })
}

// ═══════════════════════════════════════
// 实时模拟
// ═══════════════════════════════════════
const simulateRealtime = () => {
  prevPower.value = realTimePower.value
  const delta = Math.round((Math.random() - 0.45) * totalCapacity * 0.03)
  realTimePower.value = Math.max(0, Math.min(totalCapacity, realTimePower.value + delta))
  moduleTemp.value = (35 + Math.random() * 15).toFixed(1)
  envTemp.value = (18 + Math.random() * 14).toFixed(1)
  triggerFlash('power')
}

const updateClock = () => {
  currentTime.value = new Date().toLocaleTimeString('zh-CN', { hour12: false })
}

const handleResize = () => {
  requestAnimationFrame(() => {
    powerChart?.resize()
    tempChart?.resize()
  })
}

onMounted(() => {
  updateClock()
  clockTimer = setInterval(updateClock, 1000)
  nextTick(() => {
    initPowerChart()
    initTempChart()
  })
  refreshTimer = setInterval(simulateRealtime, 5000)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  clearInterval(clockTimer)
  clearInterval(refreshTimer)
  window.removeEventListener('resize', handleResize)
  powerChart?.dispose()
  tempChart?.dispose()
})

watch(dateType, () => { updatePowerChart() })
</script>

<style scoped>
/* ═══════════════════════════════════════
   设计系统
   ═══════════════════════════════════════ */
.solar-page {
  --sun-400: #fbbf24;
  --sun-500: #f59e0b;
  --sun-600: #d97706;
  --sun-700: #b45309;

  --navy-800: #1e293b;
  --navy-900: #0f172a;

  --slate-50: #f8fafc;
  --slate-100: #f1f5f9;
  --slate-200: #e2e8f0;
  --slate-300: #cbd5e1;
  --slate-400: #94a3b8;
  --slate-500: #64748b;
  --slate-600: #475569;
  --slate-700: #334155;
  --slate-800: #1e293b;
  --slate-900: #0f172a;

  --emerald-500: #10b981;
  --red-500: #ef4444;
  --blue-500: #3b82f6;

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 18px;
  --radius-2xl: 24px;
  --radius-full: 9999px;

  --shadow-card: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02);
  --shadow-hover: 0 10px 25px rgba(0,0,0,0.06), 0 4px 10px rgba(0,0,0,0.03);

  width: 100%;
  min-height: calc(100vh - 60px);
  background: var(--slate-50);
  padding: 0;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "PingFang SC", "Microsoft YaHei", sans-serif;
  color: var(--slate-800);
  line-height: 1.5;
}

/* ═══════════════════════════════════════
   HERO
   ═══════════════════════════════════════ */
.hero {
  position: relative;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #334155 70%, #1e293b 100%);
  padding: 40px 48px 36px;
  overflow: hidden;
}

.hero-gradient {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 75% 30%, rgba(245,158,11,0.12) 0%, transparent 55%),
    radial-gradient(ellipse at 25% 80%, rgba(59,130,246,0.06) 0%, transparent 45%);
  pointer-events: none;
}

.hero-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
  background-size: 48px 48px;
  pointer-events: none;
}

.hero-sun {
  position: absolute;
  right: 60px;
  top: -30px;
  width: 200px;
  height: 200px;
  opacity: 0.7;
  pointer-events: none;
}

.hero-inner {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 48px;
  max-width: 1600px;
  margin: 0 auto;
}

.hero-main { flex: 1; }

.hero-breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: rgba(255,255,255,0.55);
  margin-bottom: 14px;
}

.hero-sep { color: rgba(255,255,255,0.25); }

.hero-status-tag {
  padding: 2px 12px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.3px;
}
.hero-status-tag.tag-ok { background: rgba(16,185,129,0.18); color: #6ee7b7; }
.hero-status-tag.tag-danger { background: rgba(239,68,68,0.18); color: #fca5a5; }

.hero-number-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 10px;
}

.hero-power {
  font-size: 56px;
  font-weight: 800;
  color: #fff;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  letter-spacing: -1.5px;
  transition: color 0.3s ease;
}
.hero-power.flash-val { color: var(--sun-400); }

.hero-power-unit {
  font-size: 20px;
  font-weight: 600;
  color: rgba(255,255,255,0.45);
}

.hero-trend {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 13px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: var(--radius-full);
}
.hero-trend.up { color: #6ee7b7; background: rgba(16,185,129,0.12); }
.hero-trend.down { color: #fca5a5; background: rgba(239,68,68,0.12); }
.hero-trend.flat { color: rgba(255,255,255,0.45); background: rgba(255,255,255,0.06); }

.hero-sub {
  font-size: 14px;
  color: rgba(255,255,255,0.4);
  margin: 0 0 22px;
}

.hero-pills {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 16px;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: var(--radius-full);
  font-size: 13px;
  color: rgba(255,255,255,0.65);
  backdrop-filter: blur(10px);
  transition: background 0.2s ease;
}
.pill:hover { background: rgba(255,255,255,0.1); }
.pill-warn { border-color: rgba(245,158,11,0.2); color: #fbbf24; background: rgba(245,158,11,0.08); }
.pill-clock { font-variant-numeric: tabular-nums; }

/* Hero SVG Gauge */
.hero-gauge-side {
  flex: 0 0 240px;
}

.gauge-svg { width: 100%; height: auto; }

.gauge-arc {
  transition: stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1);
}

/* ═══════════════════════════════════════
   KPI CARDS
   ═══════════════════════════════════════ */
.kpi-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  padding: 28px 48px;
  max-width: 1600px;
  margin: 0 auto;
}

.kpi-card {
  background: #fff;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
  display: flex;
  overflow: hidden;
  transition: box-shadow 0.25s ease, transform 0.25s ease;
}
.kpi-card:hover {
  box-shadow: var(--shadow-hover);
  transform: translateY(-2px);
}

.kpi-bar {
  width: 4px;
  flex-shrink: 0;
}
.kpi-bar.orange { background: linear-gradient(180deg, #fbbf24, #ea580c); }
.kpi-bar.gold { background: linear-gradient(180deg, #d4a853, #b45309); }
.kpi-bar.green { background: linear-gradient(180deg, #34d399, #059669); }
.kpi-bar.red { background: linear-gradient(180deg, #f87171, #dc2626); }

.kpi-inner {
  flex: 1;
  padding: 22px 26px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.kpi-card.card-warn { background: linear-gradient(135deg, #fff, rgba(245,158,11,0.03)); }
.kpi-card.card-danger { background: linear-gradient(135deg, #fff, rgba(239,68,68,0.03)); }

.card-flash { animation: cardFlash 0.4s ease; }
@keyframes cardFlash {
  0% { background-color: rgba(245,158,11,0.06); }
  100% { background-color: #fff; }
}

.kpi-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.kpi-eyebrow {
  font-size: 12px;
  color: var(--slate-400);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.kpi-badge-sm {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: var(--radius-full);
}
.badge-up { background: rgba(16,185,129,0.1); color: #059669; }
.badge-down { background: rgba(239,68,68,0.1); color: #dc2626; }

.dot-sm {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.dot-green { background: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.18); animation: pulseG 2s infinite; }
.dot-red { background: #ef4444; box-shadow: 0 0 0 3px rgba(239,68,68,0.18); animation: pulseR 1.5s infinite; }

@keyframes pulseG {
  0% { box-shadow: 0 0 0 0 rgba(16,185,129,0.35); }
  70% { box-shadow: 0 0 0 8px rgba(16,185,129,0); }
  100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
}
@keyframes pulseR {
  0% { box-shadow: 0 0 0 0 rgba(239,68,68,0.35); }
  70% { box-shadow: 0 0 0 8px rgba(239,68,68,0); }
  100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
}

.kpi-big-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.kpi-big {
  font-size: 32px;
  font-weight: 800;
  color: var(--slate-900);
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.kpi-big-unit {
  font-size: 14px;
  color: var(--slate-400);
  font-weight: 500;
}

.val-green { color: #10b981 !important; }
.val-red { color: #ef4444 !important; }

/* Progress bar */
.kpi-progress-track {
  height: 4px;
  background: var(--slate-100);
  border-radius: var(--radius-full);
  overflow: hidden;
}
.kpi-progress-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}
.kpi-progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--slate-400);
}
.kpi-progress-pct { font-weight: 700; color: var(--slate-600); }

/* Profit mini bars */
.profit-bars {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 40px;
  padding: 0 2px;
}
.pbar {
  flex: 1;
  background: linear-gradient(180deg, #fbbf24, rgba(245,158,11,0.25));
  border-radius: 2px 2px 0 0;
  transition: height 0.5s ease;
  min-height: 4px;
}

/* Device dots */
.device-row {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
}
.dev-dot {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  transition: all 0.3s ease;
}
.dev-dot.on { background: #10b981; }
.dev-dot.off { background: var(--slate-200); }
.dev-count {
  margin-left: auto;
  font-size: 12px;
  color: var(--slate-400);
  font-weight: 600;
}

/* Mini grid */
.kpi-mini-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px 16px;
  padding-top: 10px;
  border-top: 1px solid var(--slate-100);
}
.kpi-mini-grid.cols3 { grid-template-columns: 1fr 1fr 1fr; }

.mini-l {
  font-size: 11px;
  color: var(--slate-400);
  display: block;
  line-height: 1.3;
}
.mini-v {
  font-size: 12px;
  font-weight: 600;
  color: var(--slate-700);
  display: block;
  line-height: 1.3;
}
.mini-v.up { color: #059669; }

/* ═══════════════════════════════════════
   CHART + EVALUATION ROW
   ═══════════════════════════════════════ */
.chart-row {
  display: flex;
  gap: 20px;
  padding: 0 48px 28px;
  max-width: 1600px;
  margin: 0 auto;
}

.chart-main {
  flex: 1;
  background: #fff;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
  padding: 22px 26px;
  min-width: 0;
  transition: box-shadow 0.25s ease;
}
.chart-main:hover { box-shadow: var(--shadow-hover); }

.eval-side {
  flex: 0 0 260px;
  background: #fff;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
  padding: 22px 26px;
  transition: box-shadow 0.25s ease;
}
.eval-side:hover { box-shadow: var(--shadow-hover); }

/* Section header */
.sec-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.sec-title-group { display: flex; align-items: center; gap: 8px; }
.sec-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.sec-dot.orange { background: #f59e0b; box-shadow: 0 0 6px rgba(245,158,11,0.4); }
.sec-dot.green { background: #10b981; box-shadow: 0 0 6px rgba(16,185,129,0.4); }
.sec-dot.blue { background: #3b82f6; box-shadow: 0 0 6px rgba(59,130,246,0.4); }
.sec-title { font-size: 16px; font-weight: 700; color: var(--slate-800); }
.sec-tools { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }

/* Segment control */
.seg-ctrl {
  display: inline-flex;
  background: var(--slate-100);
  border-radius: var(--radius-full);
  padding: 3px;
  gap: 2px;
}
.seg-ctrl.small .seg-btn { padding: 4px 12px; font-size: 12px; }

.seg-btn {
  padding: 6px 16px;
  border: none;
  background: transparent;
  color: var(--slate-400);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border-radius: var(--radius-full);
  transition: all 0.15s ease;
  font-family: inherit;
  line-height: 1.4;
}
.seg-btn:hover { color: var(--slate-600); background: rgba(255,255,255,0.6); }
.seg-btn.active {
  background: #f59e0b;
  color: #fff;
  box-shadow: 0 2px 8px rgba(245,158,11,0.3);
  font-weight: 600;
}

.chart-box { width: 100%; height: 280px; min-width: 0; }

/* Evaluation */
.eval-list { display: flex; flex-direction: column; gap: 16px; }
.eval-item { display: flex; align-items: center; gap: 12px; }
.eval-label { font-size: 13px; color: var(--slate-500); white-space: nowrap; min-width: 76px; }
.eval-track {
  flex: 1;
  height: 6px;
  background: var(--slate-100);
  border-radius: var(--radius-full);
  overflow: hidden;
}
.eval-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
}
.eval-val {
  font-size: 13px;
  font-weight: 700;
  min-width: 60px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

/* ═══════════════════════════════════════
   TEMPERATURE
   ═══════════════════════════════════════ */
.temp-section {
  padding: 0 48px 28px;
  max-width: 1600px;
  margin: 0 auto;
}

.temp-main {
  background: #fff;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
  padding: 22px 26px;
  transition: box-shadow 0.25s ease;
}
.temp-main:hover { box-shadow: var(--shadow-hover); }

.temp-badges { display: flex; gap: 8px; }
.temp-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 12px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.temp-pill.t-orange { background: rgba(245,158,11,0.1); color: #d97706; }
.temp-pill.t-blue { background: rgba(59,130,246,0.1); color: #3b82f6; }

.temp-chart { height: 200px; }

.weather-strip {
  display: flex;
  gap: 28px;
  padding: 10px 0 14px;
  margin-bottom: 14px;
  border-bottom: 1px solid var(--slate-100);
}
.wday {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--slate-500);
}
.wday-name { font-size: 12px; color: var(--slate-400); }
.wday-temp { font-weight: 700; color: var(--slate-700); font-variant-numeric: tabular-nums; }
.wday-desc { font-size: 12px; color: var(--slate-400); }

/* ═══════════════════════════════════════
   SOCIAL CONTRIBUTION
   ═══════════════════════════════════════ */
.social-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  padding: 0 48px 36px;
  max-width: 1600px;
  margin: 0 auto;
}

.social-card {
  background: #fff;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
  padding: 26px;
  display: flex;
  align-items: flex-start;
  gap: 18px;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
}
.social-card::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  opacity: 0;
  transition: opacity 0.25s ease;
}
.social-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}
.social-card:hover::after { opacity: 1; }

.social-0::after { background: linear-gradient(90deg, #f59e0b, transparent); }
.social-1::after { background: linear-gradient(90deg, #d4a853, transparent); }
.social-2::after { background: linear-gradient(90deg, #10b981, transparent); }
.social-3::after { background: linear-gradient(90deg, #3b82f6, transparent); }

.social-icon {
  width: 50px;
  height: 50px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.25s ease;
}
.social-card:hover .social-icon { transform: scale(1.06); }

.social-body { min-width: 0; }
.social-num { display: flex; align-items: baseline; gap: 4px; }
.social-val {
  font-size: 28px;
  font-weight: 800;
  color: var(--slate-900);
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
.social-unit { font-size: 13px; color: var(--slate-400); font-weight: 400; }
.social-label { font-size: 13px; color: var(--slate-500); margin-top: 4px; }
.social-ctx { font-size: 11px; color: var(--slate-400); margin-top: 3px; line-height: 1.4; }

/* ═══════════════════════════════════════
   Element Plus 覆盖
   ═══════════════════════════════════════ */
.picker-thin :deep(.el-input__wrapper) {
  border-radius: var(--radius-full) !important;
  box-shadow: 0 0 0 1px var(--slate-200) inset !important;
}
.picker-thin :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #f59e0b inset !important;
}

/* ═══════════════════════════════════════
   响应式
   ═══════════════════════════════════════ */
@media (max-width: 1200px) {
  .hero-inner { flex-direction: column; gap: 24px; }
  .hero-gauge-side { flex: 0 0 auto; width: 220px; align-self: center; }
  .chart-row { flex-direction: column; }
  .eval-side { flex: none; width: 100%; }
  .eval-list { flex-direction: row; flex-wrap: wrap; }
  .eval-item { flex: 1 1 45%; min-width: 200px; }
}

@media (max-width: 960px) {
  .hero { padding: 28px 24px; }
  .hero-power { font-size: 42px; }
  .kpi-row { grid-template-columns: 1fr; padding: 20px 24px; }
  .chart-row { padding: 0 24px 20px; }
  .temp-section { padding: 0 24px 20px; }
  .social-section { grid-template-columns: repeat(2, 1fr); padding: 0 24px 24px; }
}

@media (max-width: 600px) {
  .hero { padding: 20px 16px; }
  .hero-power { font-size: 36px; }
  .hero-pills { flex-direction: column; gap: 6px; }
  .kpi-row, .chart-row, .temp-section, .social-section { padding-left: 16px; padding-right: 16px; }
  .social-section { grid-template-columns: 1fr; }
  .weather-strip { flex-direction: column; gap: 8px; }
  .sec-header { flex-direction: column; align-items: flex-start; gap: 8px; }
}

/* ═══════════════════════════════════════
   减少动画偏好
   ═══════════════════════════════════════ */
@media (prefers-reduced-motion: reduce) {
  .dot-green, .dot-red { animation: none !important; }
  .kpi-card, .social-card, .chart-main, .temp-main, .eval-side { transition: none !important; }
  .kpi-card:hover, .social-card:hover { transform: none !important; }
  .kpi-progress-fill, .eval-fill, .gauge-arc { transition: none !important; }
  .card-flash, .flash-val { animation: none !important; }
}
</style>