<template>
  <div class="cyber-page">
    <!-- 扫描线 -->
    <div class="scanlines"></div>

    <!-- 头部 -->
    <header class="cyber-header">
      <div class="cyber-glitch-wrap">
        <h1 class="cyber-title" data-text="PV::MONITOR">PV<span class="cyber-neon">::</span>MONITOR</h1>
      </div>
      <div class="cyber-header-info">
        <span class="cyber-chip pulse-green">● LIVE</span>
        <span class="cyber-chip">{{ currentTime }}</span>
        <span class="cyber-chip">☀️ 32°C</span>
      </div>
    </header>

    <!-- 核心区 -->
    <div class="cyber-core">
      <div class="cyber-gauge-box">
        <div class="cyber-gauge-border"></div>
        <div ref="gaugeRef" class="cyber-gauge"></div>
        <div class="cyber-gauge-stats">
          <div class="cyber-gs">
            <span class="cyber-gs-val neon-green">{{ realPower.toLocaleString() }}</span>
            <span class="cyber-gs-lbl">kW 实时</span>
          </div>
          <div class="cyber-gs-sep"></div>
          <div class="cyber-gs">
            <span class="cyber-gs-val neon-pink">{{ capacity.toLocaleString() }}</span>
            <span class="cyber-gs-lbl">kWp 额定</span>
          </div>
        </div>
      </div>
      <div class="cyber-kpi-stack">
        <div class="cyber-kpi" v-for="(kpi, idx) in kpiList" :key="idx">
          <div class="cyber-kpi-flash"></div>
          <div class="cyber-kpi-row1">
            <span class="cyber-kpi-tag">{{ kpi.tag }}</span>
            <span class="cyber-kpi-label">{{ kpi.label }}</span>
          </div>
          <div class="cyber-kpi-row2">
            <span class="cyber-kpi-value" :class="kpi.neonClass">{{ kpi.value }}</span>
            <span class="cyber-kpi-unit">{{ kpi.unit }}</span>
          </div>
          <div class="cyber-kpi-subs">
            <span v-for="(sub, si) in kpi.subs" :key="si">
              <span class="cyber-sub-val">{{ sub.value }}</span>
              <span class="cyber-sub-lbl">{{ sub.label }}</span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 趋势 + 评估 -->
    <div class="cyber-mid">
      <div class="cyber-chart-box">
        <div class="cyber-box-header">
          <span class="cyber-box-title">▸ 发电功率趋势</span>
          <div class="cyber-btn-group">
            <button v-for="t in ['日','月','年','总']" :key="t"
              :class="['cyber-btn', { active: dateType === t }]" @click="dateType = t">{{ t }}</button>
          </div>
        </div>
        <div ref="powerChartRef" class="cyber-chart"></div>
      </div>
      <div class="cyber-eval-box">
        <div class="cyber-box-header">
          <span class="cyber-box-title">▸ 电站评估</span>
        </div>
        <div class="cyber-matrix">
          <div class="cyber-matrix-row" v-for="(ev, idx) in evalRows" :key="idx">
            <span class="cyber-mx-label">{{ ev.label }}</span>
            <div class="cyber-mx-bar">
              <div class="cyber-mx-fill" :style="{ width: ev.pct + '%', background: ev.color }"></div>
            </div>
            <span class="cyber-mx-val" :style="{ color: ev.color }">{{ ev.value }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 温度 -->
    <div class="cyber-temp">
      <div class="cyber-chart-box wide">
        <div class="cyber-box-header">
          <span class="cyber-box-title">▸ 温度监测</span>
          <div class="cyber-temp-legend">
            <span class="cyber-tl neon-green">■ 组件 {{ tempDisplay.moduleTemp }}°C</span>
            <span class="cyber-tl neon-pink">■ 环境 {{ tempDisplay.envTemp }}°C</span>
          </div>
        </div>
        <div ref="tempChartRef" class="cyber-chart"></div>
      </div>
    </div>

    <!-- 社会贡献 -->
    <div class="cyber-social">
      <div class="cyber-social-item" v-for="(s, idx) in socialList" :key="idx">
        <span class="cyber-social-icon">{{ s.icon }}</span>
        <span class="cyber-social-val" :class="s.neonClass">{{ s.value }}</span>
        <span class="cyber-social-unit">{{ s.unit }}</span>
        <span class="cyber-social-label">{{ s.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'

const realPower = ref(1200)
const capacity = ref(2336)
const currentTime = ref('')
const dateType = ref('日')
const gaugeRef = ref(null)
const powerChartRef = ref(null)
const tempChartRef = ref(null)
let gaugeChart = null
let powerChart = null
let tempChart = null
let clockTimer = null

const tempDisplay = ref({ moduleTemp: '45.2', envTemp: '24.5' })

const kpiList = [
  { tag: 'PWR', label: '当日发电量', value: '1,247', unit: 'kWh', neonClass: 'neon-green',
    subs: [{ label: '较昨日', value: '+5.2%' }, { label: '累计', value: '9.72GWh' }] },
  { tag: 'REV', label: '当日收益', value: '¥748', unit: '', neonClass: 'neon-pink',
    subs: [{ label: '当年', value: '12.3万' }, { label: '累计', value: '58.3万' }] },
  { tag: 'SYS', label: '系统状态', value: 'ONLINE', unit: '', neonClass: 'neon-green',
    subs: [{ label: '告警', value: '0' }, { label: '逆变器', value: '3/3' }] },
]

const evalRows = [
  { label: 'EFF', value: '86.5%', pct: 86.5, color: '#00ff88' },
  { label: 'EQU', value: '3.2h', pct: 53, color: '#ff0066' },
  { label: 'PR', value: '82.3%', pct: 82.3, color: '#00ff88' },
  { label: 'FLT', value: '0.05', pct: 5, color: '#ff4444' },
  { label: 'AVL', value: '99.2%', pct: 99.2, color: '#00ff88' },
]

const socialList = [
  { icon: '🏭', label: 'CO₂减排', value: '5,832', unit: '吨', neonClass: 'neon-green' },
  { icon: '🔥', label: '标煤节约', value: '1,195', unit: '吨', neonClass: 'neon-pink' },
  { icon: '🌳', label: '等效植树', value: '96,228', unit: '棵', neonClass: 'neon-green' },
  { icon: '⚡', label: '绿色发电', value: '9.72M', unit: 'kWh', neonClass: 'neon-pink' },
]

const powerDataByType = {
  '日': { xAxis: ['00:00','02:00','04:00','06:00','08:00','10:00','12:00','14:00','16:00','18:00','20:00','22:00'], data: [0,0,0,0,220,780,1200,980,650,320,0,0] },
  '月': { xAxis: ['1日','5日','10日','15日','20日','25日','30日'], data: [4200,4800,5100,3900,4600,5200,4500] },
  '年': { xAxis: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'], data: [120,135,158,175,198,220,245,238,195,165,140,118] },
  '总': { xAxis: ['2022','2023','2024','2025','2026'], data: [850,920,980,1050,972] },
}

const updateClock = () => { currentTime.value = new Date().toLocaleString('zh-CN', { year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false }) }

const initGauge = () => {
  if (!gaugeRef.value) return
  if (gaugeChart) gaugeChart.dispose()
  gaugeChart = echarts.init(gaugeRef.value)
  gaugeChart.setOption({
    backgroundColor: 'transparent', animation: true, animationDuration: 1500, animationEasing: 'elasticOut',
    series: [{
      type: 'gauge', center: ['50%','55%'], radius: '88%',
      startAngle: 210, endAngle: -30, min: 0, max: capacity.value,
      axisLine: { lineStyle: { width: 10, color: [[1, 'rgba(255,255,255,0.04)']] } },
      progress: { show: true, width: 10, itemStyle: { color: new echarts.graphic.LinearGradient(0,0,1,0, [{ offset:0, color:'#00ff88' },{ offset:1, color:'#ff0066' }]) } },
      axisTick: { show: false }, splitLine: { show: false }, axisLabel: { show: false },
      pointer: { length: '55%', width: 5, itemStyle: { color: '#00ff88' } },
      anchor: { size: 12, itemStyle: { color: '#00ff88', borderColor: 'rgba(0,255,136,0.25)', borderWidth: 5 } },
      title: { show: false },
      detail: { fontSize: 30, fontWeight: 700, color: '#00ff88', offsetCenter: [0,'30%'], formatter: '{value}', valueAnimation: true },
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
    backgroundColor: 'transparent', animation: false,
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(10,0,20,0.95)', borderColor: 'rgba(0,255,136,0.3)', borderWidth: 1, textStyle: { color: '#e0ffe0' } },
    grid: { left: '3%', right: '3%', top: '6%', bottom: '8%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, axisLine: { lineStyle: { color: 'rgba(0,255,136,0.1)' } }, axisTick: { show: false }, axisLabel: { color: '#4a6', fontSize: 11 }, data: config.xAxis },
    yAxis: { type: 'value', axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: 'rgba(0,255,136,0.04)' } }, axisLabel: { color: '#4a6', fontSize: 11 } },
    series: [{ name: '功率', type: 'line', smooth: true, symbol: 'circle', symbolSize: 5, animation: false, itemStyle: { color: '#00ff88', borderColor: '#0a0014', borderWidth: 2 }, lineStyle: { color: '#00ff88', width: 2, shadowColor: 'rgba(0,255,136,0.5)', shadowBlur: 10 }, areaStyle: { color: new echarts.graphic.LinearGradient(0,0,0,1, [{ offset:0, color:'rgba(0,255,136,0.15)' },{ offset:1, color:'rgba(0,255,136,0)' }]) }, data: config.data }]
  }, true)
}

const initTempChart = () => {
  if (!tempChartRef.value) return
  if (tempChart) tempChart.dispose()
  tempChart = echarts.init(tempChartRef.value)
  tempChart.setOption({
    backgroundColor: 'transparent', animation: false,
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(10,0,20,0.95)', borderColor: 'rgba(0,255,136,0.3)', borderWidth: 1, textStyle: { color: '#e0ffe0' } },
    grid: { left: '3%', right: '3%', top: '6%', bottom: '5%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, axisLine: { lineStyle: { color: 'rgba(0,255,136,0.1)' } }, axisTick: { show: false }, axisLabel: { color: '#4a6', fontSize: 11 }, data: ['00:00','02:00','04:00','06:00','08:00','10:00','12:00','14:00','16:00','18:00','20:00','22:00'] },
    yAxis: [
      { type: 'value', min: 0, max: 60, axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: 'rgba(0,255,136,0.04)', type: 'dashed' } }, axisLabel: { color: '#00ff88', fontSize: 11, formatter: '{value}°C' } },
      { type: 'value', min: 0, max: 40, axisLine: { show: false }, axisTick: { show: false }, splitLine: { show: false }, axisLabel: { color: '#ff0066', fontSize: 11, formatter: '{value}°C' } }
    ],
    series: [
      { name: '组件温度', type: 'line', smooth: true, symbol: 'none', animation: false, lineStyle: { color: '#00ff88', width: 2, shadowColor: 'rgba(0,255,136,0.4)', shadowBlur: 6 }, data: [18,17,16,17,25,35,45,48,42,35,26,20] },
      { name: '环境温度', type: 'line', yAxisIndex: 1, smooth: true, symbol: 'none', animation: false, lineStyle: { color: '#ff0066', width: 2, shadowColor: 'rgba(255,0,102,0.4)', shadowBlur: 6 }, data: [15,14,13,14,20,25,28,30,27,23,18,16] }
    ]
  })
}

const initAll = () => { initGauge(); initPowerChart(); initTempChart() }
const handleResize = () => { requestAnimationFrame(() => { gaugeChart?.resize(); powerChart?.resize(); tempChart?.resize() }) }
watch(dateType, () => updatePowerChart())
watch(realPower, (val) => { gaugeChart?.setOption({ series: [{ data: [{ value: val }] }] }) })

onMounted(() => {
  updateClock(); clockTimer = setInterval(updateClock, 1000)
  nextTick(() => initAll())
  window.addEventListener('resize', handleResize)
})
onUnmounted(() => {
  clearInterval(clockTimer); window.removeEventListener('resize', handleResize)
  gaugeChart?.dispose(); powerChart?.dispose(); tempChart?.dispose()
})
</script>

<style scoped>
.cyber-page {
  --bg: #0a0014;
  --surface: rgba(0,255,136,0.03);
  --surface-hover: rgba(0,255,136,0.06);
  --border: rgba(0,255,136,0.1);
  --border-hover: rgba(0,255,136,0.25);
  --text: #c0ffc0;
  --text-dim: #3a6a3a;
  --neon-green: #00ff88;
  --neon-pink: #ff0066;
  --red: #ff4444;

  position: relative;
  min-height: 100vh;
  background: var(--bg);
  background-image:
    radial-gradient(ellipse at 50% 0%, rgba(0,255,136,0.03) 0%, transparent 40%),
    radial-gradient(ellipse at 80% 100%, rgba(255,0,102,0.02) 0%, transparent 40%);
  color: var(--text);
  font-family: 'Courier New', 'SF Mono', 'Microsoft YaHei', monospace;
  padding: 0 20px 30px;
  overflow-x: hidden;
}

/* 扫描线 */
.scanlines {
  position: fixed; inset: 0; z-index: 9999; pointer-events: none;
  background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px);
}

/* 头部 */
.cyber-header { padding: 20px 0; margin-bottom: 24px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
.cyber-title {
  font-size: 28px; font-weight: 800; letter-spacing: 4px;
  color: var(--neon-green);
  text-shadow: 0 0 10px rgba(0,255,136,0.5), 0 0 40px rgba(0,255,136,0.2);
}
.cyber-neon { color: var(--neon-pink); text-shadow: 0 0 10px rgba(255,0,102,0.5); }
.cyber-header-info { display: flex; gap: 8px; }
.cyber-chip { font-size: 11px; padding: 4px 10px; background: var(--surface); border: 1px solid var(--border); border-radius: 4px; color: var(--text-dim); font-variant-numeric: tabular-nums; }
.pulse-green { color: var(--neon-green); border-color: rgba(0,255,136,0.3); animation: cyber-pulse 2s infinite; }
@keyframes cyber-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(0,255,136,0.3); } 50% { box-shadow: 0 0 8px 2px rgba(0,255,136,0.1); } }

.neon-green { color: var(--neon-green); text-shadow: 0 0 10px rgba(0,255,136,0.4); }
.neon-pink { color: var(--neon-pink); text-shadow: 0 0 10px rgba(255,0,102,0.4); }

/* 核心区 */
.cyber-core { display: flex; gap: 16px; margin-bottom: 16px; }
.cyber-gauge-box {
  position: relative; flex: 0 0 300px;
  background: var(--surface); border: 1px solid var(--border); border-radius: 4px;
  padding: 20px; display: flex; flex-direction: column; align-items: center;
}
.cyber-gauge-border {
  position: absolute; top: -1px; left: 20%; right: 20%; height: 2px;
  background: linear-gradient(90deg, transparent, var(--neon-green), var(--neon-pink), transparent);
  animation: border-glow 3s ease infinite alternate;
}
@keyframes border-glow { 0% { opacity: 0.5; } 100% { opacity: 1; } }
.cyber-gauge { width: 260px; height: 220px; }
.cyber-gauge-stats { display: flex; gap: 20px; margin-top: 12px; }
.cyber-gs { text-align: center; }
.cyber-gs-val { display: block; font-size: 20px; font-weight: 800; }
.cyber-gs-lbl { font-size: 10px; color: var(--text-dim); }
.cyber-gs-sep { width: 1px; background: var(--border); }

/* KPI */
.cyber-kpi-stack { flex: 1; display: flex; flex-direction: column; gap: 10px; }
.cyber-kpi {
  position: relative; background: var(--surface); border: 1px solid var(--border); border-radius: 4px;
  padding: 14px 18px; display: flex; flex-direction: column; gap: 6px;
  transition: all 0.3s; overflow: hidden;
}
.cyber-kpi-flash {
  position: absolute; top: 0; left: -100%; width: 100%; height: 1px;
  background: linear-gradient(90deg, transparent, var(--neon-green), transparent);
  animation: flash-scan 4s linear infinite;
}
@keyframes flash-scan { 0% { left: -100%; } 100% { left: 100%; } }
.cyber-kpi:hover { border-color: var(--border-hover); background: var(--surface-hover); }
.cyber-kpi-row1 { display: flex; align-items: center; gap: 8px; }
.cyber-kpi-tag { font-size: 10px; padding: 1px 6px; background: rgba(0,255,136,0.1); border: 1px solid rgba(0,255,136,0.2); border-radius: 2px; color: var(--neon-green); }
.cyber-kpi-label { font-size: 12px; color: var(--text-dim); }
.cyber-kpi-row2 { display: flex; align-items: baseline; gap: 4px; }
.cyber-kpi-value { font-size: 24px; font-weight: 800; }
.cyber-kpi-unit { font-size: 11px; color: var(--text-dim); }
.cyber-kpi-subs { display: flex; gap: 14px; font-size: 10px; }
.cyber-sub-val { color: var(--text); font-weight: 600; }
.cyber-sub-lbl { color: var(--text-dim); margin-left: 3px; }

/* 中部 */
.cyber-mid { display: flex; gap: 16px; margin-bottom: 16px; }
.cyber-chart-box { flex: 1; min-width: 0; background: var(--surface); border: 1px solid var(--border); border-radius: 4px; padding: 16px; }
.cyber-chart-box.wide { width: 100%; }
.cyber-box-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.cyber-box-title { font-size: 14px; font-weight: 700; color: var(--neon-green); }
.cyber-btn-group { display: flex; gap: 2px; }
.cyber-btn { padding: 4px 12px; border: 1px solid var(--border); border-radius: 2px; background: transparent; color: var(--text-dim); font-size: 11px; cursor: pointer; transition: all 0.2s; font-family: inherit; }
.cyber-btn.active { background: var(--neon-green); color: var(--bg); border-color: var(--neon-green); font-weight: 700; }
.cyber-chart { height: 260px; }

.cyber-eval-box { flex: 0 0 240px; background: var(--surface); border: 1px solid var(--border); border-radius: 4px; padding: 16px; }
.cyber-matrix { display: flex; flex-direction: column; gap: 12px; }
.cyber-matrix-row { display: flex; align-items: center; gap: 8px; }
.cyber-mx-label { font-size: 10px; color: var(--text-dim); width: 32px; flex-shrink: 0; }
.cyber-mx-bar { flex: 1; height: 3px; background: rgba(255,255,255,0.04); border-radius: 1px; overflow: hidden; }
.cyber-mx-fill { height: 100%; border-radius: 1px; transition: width 1s ease; }
.cyber-mx-val { font-size: 12px; font-weight: 700; width: 50px; text-align: right; flex-shrink: 0; }

/* 温度 */
.cyber-temp { margin-bottom: 16px; }
.cyber-temp-legend { display: flex; gap: 14px; font-size: 10px; }
.cyber-tl { display: flex; align-items: center; gap: 4px; }

/* 社会贡献 */
.cyber-social { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.cyber-social-item {
  background: var(--surface); border: 1px solid var(--border); border-radius: 4px;
  padding: 16px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 4px;
  transition: all 0.3s;
}
.cyber-social-item:hover { border-color: var(--border-hover); box-shadow: 0 0 20px rgba(0,255,136,0.05); }
.cyber-social-icon { font-size: 22px; }
.cyber-social-val { font-size: 20px; font-weight: 800; }
.cyber-social-unit { font-size: 10px; color: var(--text-dim); }
.cyber-social-label { font-size: 11px; color: var(--text-dim); }

@media (max-width: 1200px) {
  .cyber-core, .cyber-mid { flex-direction: column; }
  .cyber-gauge-box, .cyber-eval-box { flex: none; }
  .cyber-social { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .cyber-kpi-stack { flex-direction: column; }
  .cyber-social { grid-template-columns: 1fr; }
}
</style>
