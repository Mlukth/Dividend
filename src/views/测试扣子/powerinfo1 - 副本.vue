<template>
  <div class="deep-blue-page">
    <!-- 顶部 -->
    <header class="db-header">
      <div class="db-header-left">
        <h1 class="db-logo">PV Station</h1>
        <span class="db-divider"></span>
        <span class="db-station">光伏电站实时监控</span>
      </div>
      <div class="db-header-right">
        <span class="db-status-chip online">● 在线</span>
        <span class="db-time">{{ currentTime }}</span>
      </div>
    </header>

    <!-- 核心数据行 -->
    <div class="db-row-main">
      <div class="db-gauge-wrap">
        <div ref="gaugeRef" class="db-gauge"></div>
        <div class="db-gauge-info">
          <span class="db-gauge-power">{{ realPower.toLocaleString() }} <small>kW</small></span>
          <span class="db-gauge-cap">额定 {{ capacity.toLocaleString() }} kWp</span>
        </div>
      </div>
      <div class="db-kpi-row">
        <div class="db-kpi" v-for="(kpi, idx) in kpiList" :key="idx">
          <span class="db-kpi-label">{{ kpi.label }}</span>
          <span class="db-kpi-value" :style="{ color: kpi.color }">{{ kpi.value }}</span>
          <span class="db-kpi-unit">{{ kpi.unit }}</span>
          <div class="db-kpi-bar">
            <div class="db-kpi-bar-fill" :style="{ width: kpi.bar + '%', background: kpi.color }"></div>
          </div>
          <div class="db-kpi-subs">
            <span v-for="(sub, si) in kpi.subs" :key="si"><b>{{ sub.value }}</b> {{ sub.label }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 趋势 + 评估 -->
    <div class="db-row-chart">
      <div class="db-chart-card">
        <div class="db-card-head">
          <span>发电功率趋势</span>
          <div class="db-tabs">
            <button v-for="t in ['日','月','年','总']" :key="t"
              :class="['db-tab', { active: dateType === t }]" @click="dateType = t">{{ t }}</button>
          </div>
        </div>
        <div ref="powerChartRef" class="db-chart-area"></div>
      </div>
      <div class="db-eval-card">
        <div class="db-card-head"><span>电站评估</span></div>
        <div class="db-eval-list">
          <div class="db-eval-row" v-for="(ev, idx) in evalRows" :key="idx">
            <span class="db-ev-label">{{ ev.label }}</span>
            <div class="db-ev-bar-wrap">
              <div class="db-ev-bar" :style="{ width: ev.pct + '%', background: ev.color }"></div>
            </div>
            <span class="db-ev-value" :style="{ color: ev.color }">{{ ev.value }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 温度 -->
    <div class="db-row-temp">
      <div class="db-chart-card full">
        <div class="db-card-head">
          <span>温度监测</span>
          <div class="db-temp-tags">
            <span class="db-tag orange">组件 {{ tempDisplay.moduleTemp }}°C</span>
            <span class="db-tag blue">环境 {{ tempDisplay.envTemp }}°C</span>
          </div>
        </div>
        <div ref="tempChartRef" class="db-chart-area-tall"></div>
      </div>
    </div>

    <!-- 社会贡献 -->
    <div class="db-row-social">
      <div class="db-social-item" v-for="(s, idx) in socialList" :key="idx">
        <div class="db-social-icon">{{ s.icon }}</div>
        <span class="db-social-val" :style="{ color: s.color }">{{ s.value }}</span>
        <span class="db-social-unit">{{ s.unit }}</span>
        <span class="db-social-label">{{ s.label }}</span>
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

const kpiList = computed(() => [
  { label: '当日发电量', value: '1,247', unit: 'kWh', color: '#00b4d8', bar: 78,
    subs: [{ label: '较昨日', value: '+5.2%' }, { label: '累计', value: '9,720 MWh' }] },
  { label: '当日收益', value: '748', unit: '元', color: '#00d68f', bar: 65,
    subs: [{ label: '当年', value: '12.3万' }, { label: '累计', value: '58.3万' }] },
  { label: '系统状态', value: '运行中', unit: '', color: '#00d68f', bar: 99,
    subs: [{ label: '告警', value: '0' }, { label: '逆变器', value: '3/3' }] },
])

const evalRows = [
  { label: '综合效率', value: '86.5%', pct: 86.5, color: '#00b4d8' },
  { label: '等效利用小时', value: '3.2h', pct: 53, color: '#00d68f' },
  { label: '性能比PR', value: '82.3%', pct: 82.3, color: '#00b4d8' },
  { label: '故障损失', value: '0.05kWh', pct: 5, color: '#ff4757' },
  { label: '可用率', value: '99.2%', pct: 99.2, color: '#00d68f' },
]

const socialList = computed(() => [
  { icon: '🏭', label: 'CO₂减排', value: '5,832', unit: '吨', color: '#00b4d8' },
  { icon: '🔥', label: '标煤节约', value: '1,195', unit: '吨', color: '#00d68f' },
  { icon: '🌳', label: '等效植树', value: '96,228', unit: '棵', color: '#00b4d8' },
  { icon: '⚡', label: '绿色发电', value: '9,720,000', unit: 'kWh', color: '#00d68f' },
])

const powerDataByType = {
  '日': { xAxis: ['00:00','02:00','04:00','06:00','08:00','10:00','12:00','14:00','16:00','18:00','20:00','22:00'], data: [0,0,0,0,220,780,1200,980,650,320,0,0] },
  '月': { xAxis: ['1日','5日','10日','15日','20日','25日','30日'], data: [4200,4800,5100,3900,4600,5200,4500] },
  '年': { xAxis: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'], data: [120,135,158,175,198,220,245,238,195,165,140,118] },
  '总': { xAxis: ['2022','2023','2024','2025','2026'], data: [850,920,980,1050,972] },
}

const updateClock = () => {
  currentTime.value = new Date().toLocaleString('zh-CN', { year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false })
}

const initGauge = () => {
  if (!gaugeRef.value) return
  if (gaugeChart) gaugeChart.dispose()
  gaugeChart = echarts.init(gaugeRef.value)
  gaugeChart.setOption({
    backgroundColor: 'transparent',
    animation: true, animationDuration: 1200, animationEasing: 'cubicOut',
    series: [{
      type: 'gauge', center: ['50%','55%'], radius: '88%',
      startAngle: 210, endAngle: -30, min: 0, max: capacity.value,
      axisLine: { lineStyle: { width: 10, color: [[1, 'rgba(255,255,255,0.06)']] } },
      progress: { show: true, width: 10, itemStyle: { color: '#00b4d8' } },
      axisTick: { show: false }, splitLine: { show: false }, axisLabel: { show: false },
      pointer: { length: '55%', width: 5, itemStyle: { color: '#00b4d8' } },
      anchor: { size: 12, itemStyle: { color: '#00b4d8', borderColor: 'rgba(0,180,216,0.25)', borderWidth: 5 } },
      title: { show: false },
      detail: { fontSize: 28, fontWeight: 700, color: '#00b4d8', offsetCenter: [0,'30%'], formatter: '{value}', valueAnimation: true },
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
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(13,27,42,0.95)', borderColor: 'rgba(0,180,216,0.3)', borderWidth: 1, textStyle: { color: '#e0e0e0' } },
    grid: { left: '3%', right: '3%', top: '6%', bottom: '8%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } }, axisTick: { show: false }, axisLabel: { color: '#7a8299', fontSize: 11 }, data: config.xAxis },
    yAxis: { type: 'value', axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } }, axisLabel: { color: '#7a8299', fontSize: 11 } },
    series: [{ name: '功率', type: 'line', smooth: true, symbol: 'circle', symbolSize: 5, animation: false, itemStyle: { color: '#00b4d8' }, lineStyle: { color: '#00b4d8', width: 2 }, data: config.data }]
  }, true)
}

const initTempChart = () => {
  if (!tempChartRef.value) return
  if (tempChart) tempChart.dispose()
  tempChart = echarts.init(tempChartRef.value)
  tempChart.setOption({
    backgroundColor: 'transparent', animation: false,
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(13,27,42,0.95)', borderColor: 'rgba(0,180,216,0.3)', borderWidth: 1, textStyle: { color: '#e0e0e0' } },
    grid: { left: '3%', right: '3%', top: '6%', bottom: '5%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } }, axisTick: { show: false }, axisLabel: { color: '#7a8299', fontSize: 11 }, data: ['00:00','02:00','04:00','06:00','08:00','10:00','12:00','14:00','16:00','18:00','20:00','22:00'] },
    yAxis: [
      { type: 'value', min: 0, max: 60, axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)', type: 'dashed' } }, axisLabel: { color: '#ff9a42', fontSize: 11, formatter: '{value}°C' } },
      { type: 'value', min: 0, max: 40, axisLine: { show: false }, axisTick: { show: false }, splitLine: { show: false }, axisLabel: { color: '#00b4d8', fontSize: 11, formatter: '{value}°C' } }
    ],
    series: [
      { name: '组件温度', type: 'line', smooth: true, symbol: 'none', animation: false, lineStyle: { color: '#ff9a42', width: 2 }, data: [18,17,16,17,25,35,45,48,42,35,26,20] },
      { name: '环境温度', type: 'line', yAxisIndex: 1, smooth: true, symbol: 'none', animation: false, lineStyle: { color: '#00b4d8', width: 2 }, data: [15,14,13,14,20,25,28,30,27,23,18,16] }
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
.deep-blue-page {
  --bg: #0d1b2a;
  --surface: #112240;
  --surface-hover: #1a3355;
  --border: rgba(255,255,255,0.06);
  --text: #ccd6f6;
  --text-dim: #6b7fa3;
  --cyan: #00b4d8;
  --green: #00d68f;
  --orange: #ff9a42;
  --red: #ff4757;

  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
  font-family: 'Inter', 'Microsoft YaHei', sans-serif;
  padding: 20px;
}

.db-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid var(--border); }
.db-header-left { display: flex; align-items: center; gap: 16px; }
.db-logo { font-size: 22px; font-weight: 800; color: var(--cyan); letter-spacing: -0.5px; }
.db-divider { width: 1px; height: 20px; background: var(--border); }
.db-station { font-size: 14px; color: var(--text-dim); }
.db-header-right { display: flex; align-items: center; gap: 12px; }
.db-status-chip { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
.db-status-chip.online { background: rgba(0,214,143,0.1); color: var(--green); }
.db-time { font-size: 13px; color: var(--text-dim); font-variant-numeric: tabular-nums; }

.db-row-main { display: flex; gap: 20px; margin-bottom: 20px; }
.db-gauge-wrap { flex: 0 0 280px; background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 20px; display: flex; flex-direction: column; align-items: center; }
.db-gauge { width: 240px; height: 200px; }
.db-gauge-info { text-align: center; margin-top: 8px; }
.db-gauge-power { font-size: 24px; font-weight: 800; color: var(--cyan); }
.db-gauge-power small { font-size: 14px; font-weight: 400; color: var(--text-dim); }
.db-gauge-cap { display: block; font-size: 12px; color: var(--text-dim); margin-top: 4px; }

.db-kpi-row { flex: 1; display: flex; gap: 16px; }
.db-kpi { flex: 1; background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 20px; display: flex; flex-direction: column; gap: 8px; transition: all 0.3s; }
.db-kpi:hover { border-color: rgba(0,180,216,0.2); }
.db-kpi-label { font-size: 13px; color: var(--text-dim); }
.db-kpi-value { font-size: 26px; font-weight: 800; line-height: 1; }
.db-kpi-unit { font-size: 12px; color: var(--text-dim); }
.db-kpi-bar { height: 3px; background: rgba(255,255,255,0.06); border-radius: 2px; overflow: hidden; }
.db-kpi-bar-fill { height: 100%; border-radius: 2px; transition: width 1s ease; }
.db-kpi-subs { display: flex; gap: 12px; font-size: 11px; color: var(--text-dim); margin-top: 4px; }
.db-kpi-subs b { color: var(--text); font-weight: 600; }

.db-row-chart { display: flex; gap: 20px; margin-bottom: 20px; }
.db-chart-card { flex: 1; min-width: 0; background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 20px; }
.db-chart-card.full { width: 100%; }
.db-card-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; font-size: 15px; font-weight: 700; }
.db-tabs { display: flex; gap: 2px; }
.db-tab { padding: 5px 14px; border: none; border-radius: 6px; background: transparent; color: var(--text-dim); font-size: 12px; cursor: pointer; transition: all 0.2s; }
.db-tab.active { background: var(--cyan); color: #fff; font-weight: 600; }
.db-chart-area { height: 260px; }
.db-chart-area-tall { height: 220px; }

.db-eval-card { flex: 0 0 260px; background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 20px; }
.db-eval-list { display: flex; flex-direction: column; gap: 14px; }
.db-eval-row { display: flex; align-items: center; gap: 10px; }
.db-ev-label { font-size: 12px; color: var(--text-dim); width: 72px; flex-shrink: 0; }
.db-ev-bar-wrap { flex: 1; height: 4px; background: rgba(255,255,255,0.06); border-radius: 2px; overflow: hidden; }
.db-ev-bar { height: 100%; border-radius: 2px; transition: width 1s ease; }
.db-ev-value { font-size: 13px; font-weight: 700; width: 60px; text-align: right; flex-shrink: 0; }

.db-row-temp { margin-bottom: 20px; }
.db-temp-tags { display: flex; gap: 8px; }
.db-tag { padding: 3px 10px; border-radius: 4px; font-size: 11px; }
.db-tag.orange { background: rgba(255,154,66,0.1); color: var(--orange); }
.db-tag.blue { background: rgba(0,180,216,0.1); color: var(--cyan); }

.db-row-social { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.db-social-item { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 20px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 4px; transition: all 0.3s; }
.db-social-item:hover { border-color: rgba(0,180,216,0.2); transform: translateY(-2px); }
.db-social-icon { font-size: 24px; margin-bottom: 4px; }
.db-social-val { font-size: 22px; font-weight: 800; }
.db-social-unit { font-size: 11px; color: var(--text-dim); }
.db-social-label { font-size: 12px; color: var(--text-dim); margin-top: 4px; }

@media (max-width: 1200px) {
  .db-row-main, .db-row-chart { flex-direction: column; }
  .db-gauge-wrap, .db-eval-card { flex: none; }
  .db-row-social { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .db-kpi-row { flex-direction: column; }
  .db-row-social { grid-template-columns: 1fr; }
}
</style>
