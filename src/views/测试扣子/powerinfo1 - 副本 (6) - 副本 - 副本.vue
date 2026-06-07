<template>
  <div class="pv-page pv-health">
    <!-- 英雄数字区 -->
    <section class="hero-rings">
      <div class="ring-main">
        <svg class="ring-svg" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="82" fill="none" stroke="#f0f0f0" stroke-width="12" />
          <circle cx="100" cy="100" r="82" fill="none" :stroke="overloaded ? '#f5222d' : '#ff6b00'" stroke-width="12" stroke-linecap="round"
            :stroke-dasharray="2 * Math.PI * 82" :stroke-dashoffset="2 * Math.PI * 82 * (1 - powerPercent / 100)" transform="rotate(-90 100 100)" style="transition: stroke-dashoffset 1s ease, stroke 0.3s" />
        </svg>
        <div class="ring-center">
          <span class="ring-value" :class="{ 'val-danger': overloaded }">{{ realTimePower.toLocaleString() }}</span>
          <span class="ring-unit">kW</span>
          <span class="ring-label">实时功率</span>
        </div>
      </div>
      <div class="ring-sub-row">
        <div class="ring-sub-item" v-for="ring in subRings" :key="ring.label">
          <svg class="ring-sub-svg" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="32" fill="none" stroke="#f0f0f0" stroke-width="6" />
            <circle cx="40" cy="40" r="32" fill="none" :stroke="ring.color" stroke-width="6" stroke-linecap="round"
              :stroke-dasharray="2 * Math.PI * 32" :stroke-dashoffset="2 * Math.PI * 32 * (1 - ring.pct / 100)" transform="rotate(-90 40 40)" style="transition: stroke-dashoffset 1s ease" />
          </svg>
          <div class="ring-sub-center">
            <span class="rs-value">{{ ring.displayValue }}</span>
            <span class="rs-label">{{ ring.label }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- KPI横条 -->
    <section class="kpi-bars">
      <div class="kpi-bar" v-for="bar in kpiBarData" :key="bar.label" :class="{ 'kpi-bar-warn': bar.warn }">
        <div class="kb-left">
          <el-icon :size="16" :color="bar.iconColor"><component :is="bar.elIcon" /></el-icon>
          <span class="kb-label">{{ bar.label }}</span>
        </div>
        <div class="kb-spark">
          <svg :viewBox="`0 0 ${bar.sparkData.length * 10} 30`" preserveAspectRatio="none" class="spark-svg">
            <polyline fill="none" :stroke="bar.sparkColor" stroke-width="1.5" stroke-linejoin="round"
              :points="bar.sparkData.map((v, i) => `${i * 10},${30 - v * 28 / Math.max(...bar.sparkData)}`).join(' ')" />
          </svg>
        </div>
        <div class="kb-right">
          <span class="kb-value">{{ bar.displayValue }}</span>
          <span class="kb-unit">{{ bar.unit }}</span>
        </div>
      </div>
    </section>

    <!-- 趋势图 -->
    <section class="chart-section">
      <div class="section-bar">
        <h2 class="section-title">发电功率趋势</h2>
        <div class="segment-control">
          <button v-for="opt in dateOptions" :key="opt.value" :class="['seg-btn', { active: dateType === opt.value }]" @click="dateType = opt.value; updatePowerChart()">{{ opt.label }}</button>
        </div>
        <el-date-picker v-model="selectDate" :type="dateType === 'month' ? 'month' : 'date'" placeholder="选择日期" size="small" />
      </div>
      <div class="chart-wrap"><div ref="powerChartRef" class="chart-canvas"></div></div>
    </section>

    <!-- 评估圆形徽章 -->
    <section class="eval-badges">
      <div class="eb-item" v-for="(item, idx) in evalCircleData" :key="idx" :style="{ width: item.size + 'px', height: item.size + 'px' }">
        <svg :viewBox="`0 0 ${item.size} ${item.size}`" class="eb-svg">
          <circle :cx="item.size/2" :cy="item.size/2" :r="item.size/2 - 4" fill="none" stroke="#f0f0f0" stroke-width="3" />
          <circle :cx="item.size/2" :cy="item.size/2" :r="item.size/2 - 4" fill="none" :stroke="item.color" stroke-width="3" stroke-linecap="round"
            :stroke-dasharray="2 * Math.PI * (item.size/2 - 4)" :stroke-dashoffset="2 * Math.PI * (item.size/2 - 4) * (1 - item.pct / 100)" transform="rotate(-90 item.size/2 item.size/2)" style="transition: stroke-dashoffset 1s ease" />
        </svg>
        <div class="eb-center">
          <span class="eb-val" :style="{ color: item.color }">{{ item.displayValue }}</span>
          <span class="eb-lbl">{{ item.label }}</span>
        </div>
      </div>
    </section>

    <!-- 温度+天气 -->
    <section class="chart-section">
      <div class="section-bar">
        <h2 class="section-title">温度监测</h2>
        <div class="temp-now">
          <span class="tn-module">{{ tempDisplay.moduleTemp }}<span class="tn-deg">°C</span></span>
          <span class="tn-sep">/</span>
          <span class="tn-env">{{ tempDisplay.envTemp }}<span class="tn-deg">°C</span></span>
        </div>
      </div>
      <div class="weather-strip">
        <div class="ws-item" v-for="day in weatherData" :key="day.label">
          <el-icon :size="14" :color="day.iconColor"><component :is="day.elIcon" /></el-icon>
          <span class="ws-label">{{ day.label }}</span>
          <span class="ws-temp">{{ day.temp }}°C</span>
          <span class="ws-desc">{{ day.desc }}</span>
        </div>
      </div>
      <div class="chart-wrap"><div ref="tempChartRef" class="chart-canvas" style="height:180px"></div></div>
    </section>

    <!-- 社会贡献圆形色块 -->
    <section class="social-circles">
      <div class="sc-item" v-for="(item, idx) in socialCircleData" :key="idx">
        <div class="sc-ring" :style="{ borderColor: item.color }">
          <div class="sc-inner" :style="{ backgroundColor: item.color + '10' }">
            <el-icon :size="22" :color="item.color"><component :is="item.elIcon" /></el-icon>
          </div>
        </div>
        <span class="sc-val" :data-target="item.numValue">{{ item.displayValue }}</span>
        <span class="sc-unit">{{ item.unit }}</span>
        <span class="sc-label">{{ item.label }}</span>
        <span class="sc-human">{{ item.humanText }}</span>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { TrendCharts, Aim, Odometer, Lightning, Sunny, PartlyCloudy, Drizzling, Cloudy, Coin, Position, WarningFilled, DataLine, Money, Monitor } from '@element-plus/icons-vue'

const MOCK_DATA = {
  powerInfo: {
    systemConstruct: { capacity: 2336 },
    systemMonitor: { runStatus: '运行中', warningCount: 1 },
    powerData: { realTimePower: 1680, todayPower: '1,245.6', totalPower: '9,724,580', equivalentHours: 3.8 },
    profitCalc: { todayProfit: '747.36', yearProfit: '185,420', totalProfit: '5,834,748' }
  },
  archiveInfo: { devices: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }] }
}

const realData = ref(null)
const realTimePower = ref(1680)
const powerChartRef = ref(null); const tempChartRef = ref(null)
let powerChart = null; let tempChart = null; let refreshTimer = null
const selectDate = ref(new Date()); const dateType = ref('day')
const dateOptions = [{ label: '日', value: 'day' }, { label: '月', value: 'month' }, { label: '年', value: 'year' }, { label: '总', value: 'total' }]
const tempDisplay = ref({ moduleTemp: '45.2', envTemp: '24.5' })

const weatherData = ref([
  { label: '今天', elIcon: Sunny, iconColor: '#ff9a42', temp: '32', desc: '晴' },
  { label: '明天', elIcon: PartlyCloudy, iconColor: '#909399', temp: '28', desc: '多云' },
  { label: '后天', elIcon: Drizzling, iconColor: '#409EFF', temp: '24', desc: '小雨' }
])

const powerDataByType = {
  day: { xAxis: ['00:00','02:00','04:00','06:00','08:00','10:00','12:00','14:00','16:00','18:00','20:00','22:00'], data: [0,0,0,0,220,780,1200,980,650,320,0,0] },
  month: { xAxis: ['1日','5日','10日','15日','20日','25日','30日'], data: [4200,4800,5100,3900,4600,5200,4500] },
  year: { xAxis: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'], data: [120,135,158,175,198,220,245,238,195,165,140,118] },
  total: { xAxis: ['2022','2023','2024','2025','2026'], data: [850,920,980,1050,972] }
}

const totalCapacity = computed(() => realData.value?.powerInfo?.systemConstruct?.capacity || 2336)
const powerPercent = computed(() => Math.min((realTimePower.value / totalCapacity.value) * 100, 100))
const overloaded = computed(() => powerPercent.value > 90)

const subRings = computed(() => [
  { label: '发电完成', displayValue: powerCompletion.value + '%', pct: powerCompletion.value, color: '#52c41a' },
  { label: '综合效率', displayValue: '86.5%', pct: 86.5, color: '#ff9a42' },
  { label: '系统可用率', displayValue: '99.2%', pct: 99.2, color: '#409EFF' }
])

const powerCompletion = computed(() => {
  const cap = totalCapacity.value; const today = 1245.6
  return Math.min(Math.round((today / (cap * 4)) * 100), 100)
})

const kpiBarData = computed(() => [
  { elIcon: Lightning, iconColor: '#ff9a42', label: '当日发电', displayValue: '1,245.6', unit: 'kWh', sparkColor: '#ff9a42', sparkData: [0.2,0.4,0.7,0.9,1,0.8,0.6,0.3,0.1,0], warn: false },
  { elIcon: Money, iconColor: '#52c41a', label: '当日收益', displayValue: '747.36', unit: '元', sparkColor: '#52c41a', sparkData: [0.1,0.3,0.5,0.7,0.9,1,0.85,0.6,0.35,0.15], warn: false },
  { elIcon: Monitor, iconColor: warningCount.value > 0 ? '#e6a23c' : '#52c41a', label: '运行状态', displayValue: statusText.value, unit: '', sparkColor: '#52c41a', sparkData: [0.9,0.92,0.88,0.95,0.93,0.91,0.94,0.9,0.92,0.93], warn: warningCount.value > 0 }
])

const warningCount = computed(() => realData.value?.powerInfo?.systemMonitor?.warningCount ?? 1)
const statusText = computed(() => realData.value?.powerInfo?.systemMonitor?.runStatus || '运行中')

const evalCircleData = computed(() => {
  const d = { systemEfficiency: 86.5, equivalentHours: 3.8, pr: 82.3, faultLoss: 0.05, availability: 99.2 }
  const gc = p => p >= 95 ? '#52c41a' : p >= 80 ? '#ff9a42' : '#f5222d'
  return [
    { label: '综合效率', displayValue: d.systemEfficiency + '%', pct: d.systemEfficiency, color: gc(d.systemEfficiency), size: 90 },
    { label: '可用率', displayValue: d.availability + '%', pct: d.availability, color: gc(d.availability), size: 86 },
    { label: '性能比PR', displayValue: d.pr + '%', pct: d.pr, color: gc(d.pr), size: 80 },
    { label: '等效小时', displayValue: d.equivalentHours + 'h', pct: Math.min(d.equivalentHours / 6 * 100, 100), color: '#ff9a42', size: 74 },
    { label: '故障损失', displayValue: d.faultLoss + '', pct: 5, color: '#f5222d', size: 68 }
  ]
})

const socialCircleData = computed(() => {
  const t = 9724580; const co2 = t * 0.7035 / 1000; const coal = t * 0.1229 / 1000; const trees = Math.round(co2 * 16.5)
  return [
    { elIcon: Cloudy, color: '#ff9a42', label: 'CO₂减排', displayValue: co2.toFixed(1), numValue: co2, unit: '吨', humanText: `≈ ${Math.round(co2/1.4).toLocaleString()} 辆汽车年排放` },
    { elIcon: Coin, color: '#e6a23c', label: '标煤节约', displayValue: coal.toFixed(1), numValue: coal, unit: '吨', humanText: `≈ ${Math.round(coal/0.25).toLocaleString()} 户月供暖` },
    { elIcon: Position, color: '#67c23a', label: '等效植树', displayValue: String(trees), numValue: trees, unit: '棵', humanText: `≈ ${Math.round(trees/2000)} 足球场森林` },
    { elIcon: Lightning, color: '#409EFF', label: '绿色发电', displayValue: (t/10000).toFixed(1), numValue: t/10000, unit: '万kWh', humanText: `≈ ${Math.round(t/2000).toLocaleString()} 户年用电` }
  ]
})

const animateNumbers = () => {
  document.querySelectorAll('.pv-health .sc-val[data-target]').forEach(el => {
    const target = parseFloat(el.getAttribute('data-target')) || 0; const isInt = target > 100
    const start = performance.now()
    const step = now => { const p = Math.min((now - start) / 1500, 1); const e = 1 - Math.pow(1 - p, 3); const c = target * e; el.textContent = isInt ? Math.round(c).toLocaleString() : c.toFixed(1); if (p < 1) requestAnimationFrame(step) }
    requestAnimationFrame(step)
  })
}

const simulateRealtime = () => {
  realTimePower.value = Math.max(0, Math.round(1680 + (Math.random() - 0.5) * 168))
  tempDisplay.value = { moduleTemp: (42 + Math.random() * 8).toFixed(1), envTemp: (22 + Math.random() * 6).toFixed(1) }
}

const initPowerChart = () => {
  if (!powerChartRef.value) return; if (powerChart) powerChart.dispose()
  powerChart = echarts.init(powerChartRef.value); updatePowerChart()
}
const updatePowerChart = () => {
  if (!powerChart) return; const c = powerDataByType[dateType.value]
  powerChart.setOption({
    animation: true, backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(40,40,40,0.92)', textStyle: { color: '#fff', fontSize: 13 }, axisPointer: { lineStyle: { color: '#ff9a42', type: 'dashed' } } },
    grid: { left: '2%', right: '2%', top: '8%', bottom: '12%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#999', fontSize: 12 }, data: c.xAxis },
    yAxis: { type: 'value', axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: '#f5f5f5' } }, axisLabel: { color: '#999', fontSize: 12 } },
    series: [{ type: 'line', smooth: true, symbol: 'none', lineStyle: { color: '#ff9a42', width: 2 }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(255,154,66,0.15)' }, { offset: 1, color: 'rgba(255,154,66,0)' }]) }, data: c.data }]
  })
}

const initTempChart = () => {
  if (!tempChartRef.value) return; if (tempChart) tempChart.dispose()
  tempChart = echarts.init(tempChartRef.value)
  tempChart.setOption({
    animation: true, backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(40,40,40,0.92)', textStyle: { color: '#fff', fontSize: 13 } },
    grid: { left: '2%', right: '2%', top: '6%', bottom: '5%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#999', fontSize: 11 }, data: ['00:00','02:00','04:00','06:00','08:00','10:00','12:00','14:00','16:00','18:00','20:00','22:00'] },
    yAxis: { type: 'value', min: 0, max: 60, axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: '#f5f5f5', type: 'dashed' } }, axisLabel: { color: '#999', fontSize: 11, formatter: '{value}°C' } },
    series: [
      { name: '组件温度', type: 'line', smooth: true, symbol: 'none', lineStyle: { color: '#ff6b00', width: 2 }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(255,107,0,0.12)' }, { offset: 1, color: 'rgba(255,107,0,0)' }]) }, data: [18,17,16,17,25,35,45,48,42,35,26,20] },
      { name: '环境温度', type: 'line', smooth: true, symbol: 'none', lineStyle: { color: '#409EFF', width: 2 }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(64,158,255,0.12)' }, { offset: 1, color: 'rgba(64,158,255,0)' }]) }, data: [15,14,13,14,20,25,28,30,27,23,18,16] }
    ]
  })
}

const handleResize = () => { requestAnimationFrame(() => { powerChart?.resize(); tempChart?.resize() }) }

onMounted(() => {
  window.addEventListener('resize', handleResize); realData.value = MOCK_DATA
  nextTick(() => { initPowerChart(); initTempChart(); animateNumbers() })
  refreshTimer = setInterval(simulateRealtime, 5000)
})
onUnmounted(() => {
  window.removeEventListener('resize', handleResize); if (refreshTimer) clearInterval(refreshTimer)
  powerChart?.dispose(); tempChart?.dispose()
})
</script>

<style scoped>
.pv-health {
  --accent: #ff6b00; --accent-light: #ff9a42;
  max-width: 860px; margin: 0 auto; padding: 32px 20px;
  background: #f9f9fb; font-family: -apple-system, "SF Pro Display", "Microsoft YaHei", sans-serif;
}

/* ===== 英雄环 ===== */
.hero-rings { display: flex; flex-direction: column; align-items: center; gap: 20px; margin-bottom: 32px; }
.ring-main { position: relative; width: 200px; height: 200px; }
.ring-svg { width: 100%; height: 100%; }
.ring-center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.ring-value { font-size: 40px; font-weight: 800; color: var(--accent); line-height: 1; }
.val-danger { color: #f5222d !important; }
.ring-unit { font-size: 14px; color: #999; margin-top: 2px; }
.ring-label { font-size: 11px; color: #bbb; margin-top: 4px; letter-spacing: 0.08em; text-transform: uppercase; }

.ring-sub-row { display: flex; gap: 24px; }
.ring-sub-item { position: relative; width: 80px; height: 80px; }
.ring-sub-svg { width: 100%; height: 100%; }
.ring-sub-center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.rs-value { font-size: 16px; font-weight: 700; color: #1a1a2e; }
.rs-label { font-size: 9px; color: #bbb; margin-top: 1px; }

/* ===== KPI横条 ===== */
.kpi-bars { display: flex; flex-direction: column; gap: 8px; margin-bottom: 32px; }
.kpi-bar {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 18px; background: #fff; border-radius: 12px;
  border: 1px solid #f0f0f0; transition: all 0.2s;
}
.kpi-bar:hover { border-color: #e0e0e0; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.kpi-bar-warn { border-left: 3px solid #e6a23c; }
.kb-left { display: flex; align-items: center; gap: 8px; min-width: 100px; }
.kb-label { font-size: 13px; color: #999; font-weight: 500; }
.kb-spark { flex: 1; height: 28px; }
.spark-svg { width: 100%; height: 100%; }
.kb-right { display: flex; align-items: baseline; gap: 4px; min-width: 100px; justify-content: flex-end; }
.kb-value { font-size: 20px; font-weight: 700; color: #1a1a2e; font-variant-numeric: tabular-nums; }
.kb-unit { font-size: 11px; color: #bbb; }

/* ===== 通用 ===== */
.chart-section { margin-bottom: 28px; }
.section-bar { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; flex-wrap: wrap; }
.section-title { font-size: 15px; font-weight: 700; color: #1a1a2e; margin: 0; }
.chart-wrap { background: #fff; border-radius: 12px; border: 1px solid #f0f0f0; padding: 12px; }
.chart-canvas { width: 100%; height: 220px; }

/* Segment Control */
.segment-control { display: inline-flex; border-bottom: 2px solid #f0f0f0; }
.seg-btn {
  padding: 4px 14px; border: none; background: transparent; font-size: 13px; color: #999;
  cursor: pointer; font-weight: 500; position: relative; transition: all 0.2s;
}
.seg-btn::after { content: ''; position: absolute; bottom: -2px; left: 0; right: 0; height: 2px; background: transparent; transition: background 0.2s; }
.seg-btn.active { color: var(--accent); font-weight: 700; }
.seg-btn.active::after { background: var(--accent); }

/* 温度当前值 */
.temp-now { margin-left: auto; display: flex; align-items: baseline; gap: 4px; }
.tn-module { font-size: 18px; font-weight: 700; color: #ff6b00; }
.tn-env { font-size: 18px; font-weight: 700; color: #409EFF; }
.tn-deg { font-size: 12px; font-weight: 400; }
.tn-sep { color: #ddd; font-size: 14px; }

/* 天气条带 */
.weather-strip { display: flex; gap: 20px; padding: 4px 0 8px; }
.ws-item { display: flex; align-items: center; gap: 5px; font-size: 12px; color: #999; }
.ws-label { font-weight: 600; color: #1a1a2e; } .ws-temp { font-weight: 700; color: var(--accent); } .ws-desc { color: #bbb; }

/* ===== 评估圆形徽章 ===== */
.eval-badges { display: flex; align-items: flex-end; justify-content: center; gap: 12px; margin-bottom: 32px; flex-wrap: wrap; }
.eb-item { position: relative; }
.eb-svg { width: 100%; height: 100%; }
.eb-center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.eb-val { font-size: 15px; font-weight: 800; line-height: 1; }
.eb-lbl { font-size: 8px; color: #bbb; margin-top: 2px; white-space: nowrap; }

/* ===== 社会贡献圆形色块 ===== */
.social-circles { display: flex; justify-content: center; gap: 28px; flex-wrap: wrap; }
.sc-item { display: flex; flex-direction: column; align-items: center; gap: 6px; }
.sc-ring {
  width: 56px; height: 56px; border-radius: 50%; border: 3px solid #f0f0f0;
  display: flex; align-items: center; justify-content: center; transition: border-color 0.3s;
}
.sc-inner { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.sc-val { font-size: 22px; font-weight: 800; color: #1a1a2e; font-variant-numeric: tabular-nums; }
.sc-unit { font-size: 11px; color: #999; margin-left: 2px; }
.sc-label { font-size: 12px; color: #666; }
.sc-human { font-size: 10px; color: #bbb; text-align: center; max-width: 120px; }

:deep(.el-date-editor) { width: 130px !important; }
:deep(.el-input__wrapper) { border-radius: 12px !important; }

@media (max-width: 700px) {
  .ring-sub-row { flex-wrap: wrap; justify-content: center; }
  .eval-badges { flex-wrap: wrap; }
  .social-circles { gap: 20px; }
  .kpi-bar { flex-wrap: wrap; }
  .kb-spark { display: none; }
}
</style>
