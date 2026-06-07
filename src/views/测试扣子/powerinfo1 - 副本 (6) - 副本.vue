<template>
  <div class="pv-page pv-magazine">
    <!-- 英雄区：仪表盘 + 1大2小KPI -->
    <section class="hero-section">
      <div class="hero-gauge">
        <div ref="gaugeRef" class="gauge-canvas"></div>
        <div class="gauge-caption">
          <span class="gauge-capacity">组件总容量 {{ totalCapacity }} kWp</span>
          <div class="gauge-completion">
            <div class="gc-bar"><div class="gc-fill" :style="{ width: powerCompletion + '%' }"></div></div>
            <span class="gc-label">日发电完成 {{ powerCompletion }}%</span>
          </div>
        </div>
      </div>
      <div class="hero-kpi">
        <!-- 大卡：当日发电量 -->
        <div class="kpi-hero-card" :class="{ 'kpi-flash': flashFlags.todayEnergy }">
          <div class="kpi-hero-top">
            <span class="kpi-hero-label">当日发电量</span>
            <span class="kpi-hero-trend" :class="metrics.todayEnergyTrend.class">
              <el-icon :size="10"><component :is="metrics.todayEnergyTrend.icon" /></el-icon>
              {{ metrics.todayEnergyTrend.text }}
            </span>
          </div>
          <div class="kpi-hero-number">{{ metrics.todayEnergy }}<span class="kpi-hero-unit">kWh</span></div>
          <div class="kpi-hero-sub">
            <span>较昨日 <em :class="{ 'val-up': metrics.yesterdayCompare.startsWith('+') }">{{ metrics.yesterdayCompare }}</em></span>
            <span>累计 {{ metrics.totalEnergy }} kWh</span>
          </div>
        </div>
        <!-- 紧凑区：收益 + 状态 -->
        <div class="kpi-compact-row">
          <div class="kpi-compact" :class="{ 'kpi-flash': flashFlags.todayProfit }">
            <span class="kc-label">当日收益</span>
            <span class="kc-value">¥{{ metrics.todayProfit }}</span>
            <span class="kc-sub">年 {{ metrics.yearProfit }} | 累计 {{ metrics.totalProfit }}</span>
          </div>
          <div class="kpi-compact" :class="{ 'kpi-warn': warningCount > 0 }">
            <span class="kc-label">系统状态</span>
            <div class="kc-status">
              <span class="kc-dot" :class="statusDotClass"></span>
              <span class="kc-status-text" :class="statusTextClass">{{ statusText }}</span>
            </div>
            <span class="kc-sub">告警 {{ warningCount }} | 逆变器 {{ inverterOnline }}/{{ inverterTotal }} | 占比 {{ metrics.powerRatio }}%</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 趋势图：全宽，大留白 -->
    <section class="chart-section">
      <div class="section-header">
        <h2 class="section-title"><el-icon><TrendCharts /></el-icon> 发电功率趋势</h2>
        <div class="section-controls">
          <div class="capsule-group">
            <button v-for="opt in dateOptions" :key="opt.value" :class="['capsule-btn', { active: dateType === opt.value }]" @click="dateType = opt.value; updatePowerChart()">{{ opt.label }}</button>
          </div>
          <el-date-picker v-model="selectDate" :type="dateType === 'month' ? 'month' : 'date'" placeholder="选择日期" size="small" />
        </div>
      </div>
      <div class="chart-area">
        <div ref="powerChartRef" class="chart-canvas"></div>
      </div>
    </section>

    <!-- 评估：5个大数字横排 -->
    <section class="eval-section">
      <h2 class="section-title"><el-icon><Aim /></el-icon> 电站评估</h2>
      <div class="eval-big-row">
        <div class="eval-big-item" v-for="(row, idx) in evalMatrixData" :key="idx">
          <span class="eb-value" :style="{ color: row.color }">{{ row.displayValue }}</span>
          <span class="eb-label">{{ row.label }}</span>
          <div class="eb-minibar"><div class="eb-minifill" :style="{ width: row.pct + '%', backgroundColor: row.color }"></div></div>
        </div>
      </div>
    </section>

    <!-- 温度：全宽 -->
    <section class="chart-section">
      <div class="section-header">
        <h2 class="section-title"><el-icon><Odometer /></el-icon> 温度监测</h2>
        <div class="section-controls">
          <div class="capsule-group">
            <button v-for="opt in tempOptions" :key="opt.value" :class="['capsule-btn', { active: tempDateType === opt.value }]" @click="tempDateType = opt.value">{{ opt.label }}</button>
          </div>
        </div>
      </div>
      <!-- 天气条带 -->
      <div class="weather-strip">
        <div class="ws-item" v-for="day in weatherData" :key="day.label">
          <el-icon :size="14" :color="day.iconColor"><component :is="day.elIcon" /></el-icon>
          <span class="ws-label">{{ day.label }}</span>
          <span class="ws-temp">{{ day.temp }}°C</span>
          <span class="ws-desc">{{ day.desc }}</span>
        </div>
      </div>
      <div class="chart-area temp-chart-area">
        <div class="temp-overlay">
          <div class="to-item to-module"><span class="to-val">{{ tempDisplay.moduleTemp }}<span class="to-deg">°C</span></span><span class="to-lbl">组件</span></div>
          <div class="to-sep"></div>
          <div class="to-item to-env"><span class="to-val">{{ tempDisplay.envTemp }}<span class="to-deg">°C</span></span><span class="to-lbl">环境</span></div>
        </div>
        <div ref="tempChartRef" class="chart-canvas"></div>
      </div>
    </section>

    <!-- 社会贡献：横幅 -->
    <section class="social-section">
      <div class="social-banner">
        <div class="sb-item" v-for="(item, idx) in socialTileData" :key="idx">
          <div class="sb-icon-wrap" :style="{ backgroundColor: item.bgColor }">
            <el-icon :size="16" color="#fff"><component :is="item.elIcon" /></el-icon>
          </div>
          <div class="sb-text">
            <span class="sb-val" :data-target="item.numValue">{{ item.displayValue }}</span>
            <span class="sb-unit">{{ item.unit }}</span>
            <span class="sb-label">{{ item.label }}</span>
            <span class="sb-human">{{ item.humanText }}</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import { TrendCharts, Aim, Odometer, Clock, Top, Bottom, Remove, Sunny, PartlyCloudy, Drizzling, Cloudy, Coin, Position, Lightning, WarningFilled } from '@element-plus/icons-vue'

const MOCK_DATA = {
  powerInfo: {
    systemConstruct: { capacity: 2336, stationAddress: '江苏省南京市' },
    systemMonitor: { runStatus: '运行中', warningCount: 1 },
    powerData: { realTimePower: 1680, todayPower: '1,245.6', totalPower: '9,724,580', equivalentHours: 3.8 },
    profitCalc: { todayProfit: '747.36', yearProfit: '185,420', totalProfit: '5,834,748' }
  },
  archiveInfo: { devices: [{ id: 1, status: 'online' }, { id: 2, status: 'online' }, { id: 3, status: 'online' }, { id: 4, status: 'alarm' }] }
}

const realData = ref(null)
const realTimePower = ref(1680)
const prevPower = ref(1680)
const flashFlags = ref({ todayEnergy: false, todayProfit: false })
const currentTime = ref('')

const gaugeRef = ref(null); const powerChartRef = ref(null); const tempChartRef = ref(null)
let gaugeChart = null; let powerChart = null; let tempChart = null
let refreshTimer = null

const selectDate = ref(new Date()); const dateType = ref('day'); const tempDateType = ref('day')
const dateOptions = [{ label: '日', value: 'day' }, { label: '月', value: 'month' }, { label: '年', value: 'year' }, { label: '总', value: 'total' }]
const tempOptions = [{ label: '日', value: 'day' }, { label: '周', value: 'week' }]

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

const totalCapacity = computed(() => realData.value?.powerInfo?.systemConstruct?.capacity || 0)
const systemMonitor = computed(() => realData.value?.powerInfo?.systemMonitor || {})
const statusText = computed(() => systemMonitor.value.runStatus || '运行中')
const statusDotClass = computed(() => statusText.value === '停机' ? 'dot-stopped' : 'dot-running')
const statusTextClass = computed(() => statusText.value === '停机' ? 'text-stopped' : 'text-running')
const warningCount = computed(() => systemMonitor.value.warningCount ?? 0)
const inverterTotal = computed(() => realData.value?.archiveInfo?.devices?.length || 0)
const inverterOnline = computed(() => inverterTotal.value - warningCount.value)

const powerTrend = computed(() => {
  const diff = realTimePower.value - prevPower.value
  if (Math.abs(diff) < 5) return { icon: Remove, text: '持平', class: 'trend-flat' }
  if (diff > 0) return { icon: Top, text: `+${diff}kW`, class: 'trend-up' }
  return { icon: Bottom, text: `${diff}kW`, class: 'trend-down' }
})

const powerCompletion = computed(() => {
  const cap = totalCapacity.value || 2336
  const today = parseFloat((metrics.value.todayEnergy || '0').replace(/,/g, '')) || 0
  return Math.min(Math.round((today / (cap * 4)) * 100), 100)
})

const metrics = computed(() => {
  if (!realData.value) return { todayEnergy: '--', todayProfit: '--', totalEnergy: '--', totalProfit: '--', equivalentHours: '--', powerRatio: '--', yearProfit: '--', yesterdayCompare: '--', todayEnergyTrend: { icon: Remove, text: '', class: 'trend-flat' } }
  const pi = realData.value.powerInfo || {}
  return {
    todayEnergy: pi.powerData?.todayPower ?? '--', todayProfit: pi.profitCalc?.todayProfit ?? '--',
    totalEnergy: pi.powerData?.totalPower ?? '--', totalProfit: pi.profitCalc?.totalProfit ?? '--',
    yearProfit: pi.profitCalc?.yearProfit ?? '--', equivalentHours: pi.powerData?.equivalentHours ?? '--',
    yesterdayCompare: '+12.3%', todayEnergyTrend: { icon: Top, text: '+5.2%', class: 'trend-up' },
    powerRatio: totalCapacity.value > 0 ? ((realTimePower.value / totalCapacity.value) * 100).toFixed(1) : '--'
  }
})

const tempDisplay = ref({ moduleTemp: '45.2', envTemp: '24.5' })

const evalMatrixData = computed(() => {
  const d = { systemEfficiency: 86.5, equivalentHours: 3.8, pr: 82.3, faultLoss: 0.05, availability: 99.2 }
  const gc = (p) => p >= 95 ? '#52c41a' : p >= 80 ? '#ff9a42' : '#f5222d'
  return [
    { label: '综合效率', displayValue: d.systemEfficiency + '%', pct: d.systemEfficiency, color: gc(d.systemEfficiency) },
    { label: '等效小时', displayValue: d.equivalentHours + 'h', pct: Math.min((d.equivalentHours / 6) * 100, 100), color: gc((d.equivalentHours / 6) * 100) },
    { label: '性能比PR', displayValue: d.pr + '%', pct: d.pr, color: gc(d.pr) },
    { label: '故障损失', displayValue: d.faultLoss + 'kWh', pct: Math.min(d.faultLoss / 1 * 100, 100), color: '#ff9a42' },
    { label: '可用率', displayValue: d.availability + '%', pct: d.availability, color: gc(d.availability) }
  ]
})

const socialTileData = computed(() => {
  const totalKWh = 9724580; const co2 = totalKWh * 0.7035 / 1000; const coal = totalKWh * 0.1229 / 1000; const trees = Math.round(co2 * 16.5)
  return [
    { elIcon: Cloudy, bgColor: '#ff9a42', label: 'CO₂减排', displayValue: co2.toFixed(1), numValue: co2, unit: '吨', humanText: `≈ ${Math.round(co2 / 1.4).toLocaleString()} 辆汽车年排放` },
    { elIcon: Coin, bgColor: '#e6a23c', label: '标煤节约', displayValue: coal.toFixed(1), numValue: coal, unit: '吨', humanText: `≈ ${Math.round(coal / 0.25).toLocaleString()} 户月供暖` },
    { elIcon: Position, bgColor: '#67c23a', label: '等效植树', displayValue: String(trees), numValue: trees, unit: '棵', humanText: `≈ ${Math.round(trees / 2000)} 足球场森林` },
    { elIcon: Lightning, bgColor: '#409EFF', label: '绿色发电', displayValue: (totalKWh / 10000).toFixed(1), numValue: totalKWh / 10000, unit: '万kWh', humanText: `≈ ${Math.round(totalKWh / 2000).toLocaleString()} 户年用电` }
  ]
})

const triggerFlash = (key) => { flashFlags.value[key] = true; setTimeout(() => { flashFlags.value[key] = false }, 300) }
const animateNumbers = () => {
  document.querySelectorAll('.pv-magazine .sb-val[data-target]').forEach(el => {
    const target = parseFloat(el.getAttribute('data-target')) || 0
    const isInt = target > 100; const start = performance.now()
    const step = (now) => { const p = Math.min((now - start) / 1500, 1); const e = 1 - Math.pow(1 - p, 3); const c = target * e; el.textContent = isInt ? Math.round(c).toLocaleString() : c.toFixed(1); if (p < 1) requestAnimationFrame(step) }
    requestAnimationFrame(step)
  })
}

const simulateRealtime = () => {
  prevPower.value = realTimePower.value
  realTimePower.value = Math.max(0, Math.round(1680 + (Math.random() - 0.5) * 168))
  tempDisplay.value = { moduleTemp: (42 + Math.random() * 8).toFixed(1), envTemp: (22 + Math.random() * 6).toFixed(1) }
  triggerFlash('todayEnergy')
  if (gaugeChart) gaugeChart.setOption({ series: [{ data: [{ value: realTimePower.value }] }] })
}

const initGauge = () => {
  if (!gaugeRef.value) return; if (gaugeChart) gaugeChart.dispose()
  gaugeChart = echarts.init(gaugeRef.value)
  const cap = totalCapacity.value || 2336
  gaugeChart.setOption({
    animation: true, animationEasing: 'elasticOut', backgroundColor: 'transparent',
    series: [{
      type: 'gauge', center: ['50%', '55%'], radius: '82%', startAngle: 200, endAngle: -20, min: 0, max: cap, splitNumber: 5,
      axisLabel: { distance: -22, fontSize: 10, color: '#bbb', formatter: v => Math.round(v / cap * 100) + '%' },
      axisTick: { distance: -16, length: 5, lineStyle: { color: '#ddd' } },
      splitLine: { distance: -16, length: 10, lineStyle: { color: '#ddd' } },
      axisLine: { lineStyle: { width: 10, color: [[1, '#f0f0f0']] } },
      progress: { show: true, width: 10, itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: '#ff9a42' }, { offset: 1, color: '#ff6b00' }]) } },
      pointer: { length: '55%', width: 4, itemStyle: { color: '#ff6b00' } },
      anchor: { size: 10, itemStyle: { color: '#ff6b00' } },
      title: { show: false },
      detail: { fontSize: 28, fontWeight: 800, color: '#ff6b00', offsetCenter: [0, '38%'], formatter: '{value} kW' },
      data: [{ value: realTimePower.value }]
    }]
  })
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
    series: [{ type: 'line', smooth: true, symbol: 'none', lineStyle: { color: '#ff9a42', width: 2.5 }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(255,154,66,0.2)' }, { offset: 1, color: 'rgba(255,154,66,0)' }]) }, data: c.data }]
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
      { name: '组件温度', type: 'line', smooth: true, symbol: 'none', lineStyle: { color: '#ff6b00', width: 2 }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(255,107,0,0.15)' }, { offset: 1, color: 'rgba(255,107,0,0)' }]) }, data: [18,17,16,17,25,35,45,48,42,35,26,20] },
      { name: '环境温度', type: 'line', smooth: true, symbol: 'none', lineStyle: { color: '#409EFF', width: 2 }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(64,158,255,0.15)' }, { offset: 1, color: 'rgba(64,158,255,0)' }]) }, data: [15,14,13,14,20,25,28,30,27,23,18,16] }
    ]
  })
}

const handleResize = () => { requestAnimationFrame(() => { gaugeChart?.resize(); powerChart?.resize(); tempChart?.resize() }) }

onMounted(() => {
  window.addEventListener('resize', handleResize)
  realData.value = MOCK_DATA
  nextTick(() => { initGauge(); initPowerChart(); initTempChart(); animateNumbers() })
  refreshTimer = setInterval(simulateRealtime, 5000)
})
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (refreshTimer) clearInterval(refreshTimer)
  gaugeChart?.dispose(); powerChart?.dispose(); tempChart?.dispose()
})
</script>

<style scoped>
.pv-magazine {
  --accent: #ff6b00; --accent-light: #ff9a42;
  max-width: 1120px; margin: 0 auto;
  padding: 32px 24px; background: #fafafa;
  font-family: "Microsoft YaHei", -apple-system, sans-serif;
}

/* ===== 英雄区 ===== */
.hero-section { display: flex; gap: 32px; margin-bottom: 48px; align-items: stretch; }
.hero-gauge {
  flex: 0 0 300px; display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 24px; background: #fff; border: 1px solid #eee; border-left: 4px solid var(--accent);
}
.gauge-canvas { width: 260px; height: 260px; }
.gauge-caption { text-align: center; margin-top: 8px; }
.gauge-capacity { font-size: 12px; color: #999; }
.gauge-completion { display: flex; align-items: center; gap: 8px; margin-top: 6px; }
.gc-bar { flex: 1; max-width: 140px; height: 3px; background: #f0f0f0; border-radius: 2px; overflow: hidden; }
.gc-fill { height: 100%; background: var(--accent); border-radius: 2px; transition: width 0.6s ease; }
.gc-label { font-size: 11px; color: #bbb; }

.hero-kpi { flex: 1; display: flex; flex-direction: column; gap: 16px; }
.kpi-hero-card {
  padding: 28px 32px; background: #fff; border: 1px solid #eee; border-left: 4px solid var(--accent);
  transition: border-color 0.2s;
}
.kpi-hero-card:hover { border-left-color: var(--accent-light); }
.kpi-hero-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.kpi-hero-label { font-size: 13px; color: #999; letter-spacing: 0.05em; text-transform: uppercase; }
.kpi-hero-trend { display: inline-flex; align-items: center; gap: 2px; font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 10px; }
.trend-up { color: #52c41a; background: rgba(82,196,26,0.08); }
.trend-down { color: #f5222d; background: rgba(245,34,45,0.08); }
.trend-flat { color: #999; background: rgba(0,0,0,0.03); }
.kpi-hero-number { font-size: 42px; font-weight: 800; color: #1a1a2e; line-height: 1; margin-bottom: 8px; }
.kpi-hero-unit { font-size: 16px; font-weight: 400; color: #bbb; margin-left: 4px; }
.kpi-hero-sub { display: flex; gap: 24px; font-size: 12px; color: #999; }
.kpi-hero-sub em { font-style: normal; font-weight: 600; }
.val-up { color: #52c41a; }
.kpi-flash { animation: mag-flash 0.3s ease; }
@keyframes mag-flash { 0% { border-left-color: var(--accent-light); background: rgba(255,154,66,0.06); } 100% { background: #fff; } }

.kpi-compact-row { display: flex; gap: 16px; }
.kpi-compact {
  flex: 1; padding: 18px 20px; background: #fff; border: 1px solid #eee; border-left: 4px solid #ddd;
  transition: border-color 0.2s;
}
.kpi-compact:hover { border-left-color: var(--accent); }
.kpi-warn { border-left-color: #e6a23c !important; }
.kc-label { font-size: 12px; color: #999; letter-spacing: 0.05em; text-transform: uppercase; }
.kc-value { display: block; font-size: 24px; font-weight: 700; color: #1a1a2e; margin: 4px 0; }
.kc-status { display: flex; align-items: center; gap: 8px; margin: 4px 0; }
.kc-dot { width: 8px; height: 8px; border-radius: 50%; }
.dot-running { background: #52c41a; animation: mag-pulse 2s infinite; }
.dot-stopped { background: #f5222d; }
@keyframes mag-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(82,196,26,0.3); } 50% { box-shadow: 0 0 0 5px rgba(82,196,26,0); } }
.kc-status-text { font-size: 18px; font-weight: 700; }
.text-running { color: #52c41a; } .text-stopped { color: #f5222d; }
.kc-sub { display: block; font-size: 11px; color: #bbb; margin-top: 4px; }

/* ===== 通用段落 ===== */
.chart-section { margin-bottom: 48px; }
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
.section-title { font-size: 14px; font-weight: 700; color: #1a1a2e; letter-spacing: 0.08em; text-transform: uppercase; display: flex; align-items: center; gap: 8px; margin: 0; }
.section-title .el-icon { color: var(--accent); font-size: 18px; }
.section-controls { display: flex; align-items: center; gap: 12px; }

/* 胶囊按钮 */
.capsule-group { display: inline-flex; border: 1px solid #e0e0e0; border-radius: 20px; overflow: hidden; }
.capsule-btn {
  padding: 5px 16px; border: none; background: transparent; font-size: 13px; color: #999;
  cursor: pointer; transition: all 0.2s; font-weight: 500;
}
.capsule-btn:hover { color: #666; background: #f5f5f5; }
.capsule-btn.active { background: var(--accent); color: #fff; font-weight: 600; }

.chart-area { background: #fff; border: 1px solid #eee; padding: 16px; position: relative; }
.chart-canvas { width: 100%; height: 280px; }
.temp-chart-area { position: relative; }
.temp-chart-area .chart-canvas { height: 240px; }

/* 温度浮层 */
.temp-overlay {
  position: absolute; top: 24px; right: 28px; z-index: 10;
  display: flex; align-items: center; gap: 12px;
  padding: 8px 14px; background: rgba(255,255,255,0.9); backdrop-filter: blur(8px);
  border-radius: 10px; border: 1px solid rgba(0,0,0,0.04);
}
.to-item { text-align: center; }
.to-val { font-size: 22px; font-weight: 800; display: block; line-height: 1.2; }
.to-deg { font-size: 12px; font-weight: 400; }
.to-module .to-val { color: #ff6b00; } .to-env .to-val { color: #409EFF; }
.to-lbl { font-size: 10px; color: #bbb; } .to-sep { width: 1px; height: 24px; background: #eee; }

/* 天气条带 */
.weather-strip { display: flex; gap: 24px; padding: 8px 16px; margin-bottom: 12px; }
.ws-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #999; }
.ws-label { font-weight: 600; color: #1a1a2e; } .ws-temp { font-weight: 700; color: var(--accent); } .ws-desc { color: #bbb; }

/* ===== 评估 ===== */
.eval-section { margin-bottom: 48px; }
.eval-big-row { display: flex; gap: 0; }
.eval-big-item {
  flex: 1; text-align: center; padding: 24px 8px;
  border: 1px solid #eee; border-right: none;
  transition: background 0.2s;
}
.eval-big-item:last-child { border-right: 1px solid #eee; }
.eval-big-item:hover { background: #fafafa; }
.eb-value { display: block; font-size: 36px; font-weight: 800; line-height: 1.1; }
.eb-label { display: block; font-size: 11px; color: #999; margin-top: 4px; letter-spacing: 0.05em; text-transform: uppercase; }
.eb-minibar { height: 3px; background: #f0f0f0; border-radius: 2px; margin-top: 10px; overflow: hidden; }
.eb-minifill { height: 100%; border-radius: 2px; transition: width 0.8s ease; }

/* ===== 社会贡献横幅 ===== */
.social-section { margin-bottom: 0; }
.social-banner {
  display: flex; background: #fff; border: 1px solid #eee; border-left: 4px solid var(--accent);
  overflow: hidden;
}
.sb-item {
  flex: 1; display: flex; align-items: center; gap: 12px;
  padding: 18px 20px;
  border-right: 1px solid #f0f0f0;
}
.sb-item:last-child { border-right: none; }
.sb-icon-wrap { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.sb-text { display: flex; flex-wrap: wrap; align-items: baseline; gap: 2px 6px; }
.sb-val { font-size: 22px; font-weight: 800; color: var(--accent); font-variant-numeric: tabular-nums; }
.sb-unit { font-size: 12px; color: #999; }
.sb-label { font-size: 12px; color: #666; }
.sb-human { font-size: 10px; color: #bbb; width: 100%; }

/* ===== 日期选择器覆盖 ===== */
:deep(.el-date-editor) { width: 140px !important; }
:deep(.el-input__wrapper) { border-radius: 16px !important; }

@media (max-width: 900px) {
  .hero-section { flex-direction: column; gap: 20px; }
  .hero-gauge { flex: none; }
  .kpi-hero-number { font-size: 32px; }
  .eval-big-row { flex-wrap: wrap; }
  .eval-big-item { flex: 0 0 calc(50% - 1px); border-right: 1px solid #eee; }
  .eval-big-item:nth-child(2n) { border-right: none; }
  .eval-big-item:nth-child(3) { border-top: none; }
  .social-banner { flex-wrap: wrap; }
  .sb-item { flex: 0 0 50%; }
}
@media (max-width: 600px) {
  .kpi-compact-row { flex-direction: column; }
  .eval-big-item { flex: 0 0 100%; border-right: none; border-bottom: none; }
  .eval-big-item:not(:last-child) { border-bottom: 1px solid #eee; }
  .sb-item { flex: 0 0 100%; border-right: none; border-bottom: 1px solid #f0f0f0; }
}
</style>
