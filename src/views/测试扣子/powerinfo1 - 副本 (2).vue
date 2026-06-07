<template>
  <div class="gold-page">
    <header class="gold-header">
      <div class="gold-header-glow"></div>
      <div class="gold-header-content">
        <h1 class="gold-title">PV <span class="gold-accent">Monitor</span></h1>
        <div class="gold-header-stats">
          <span class="gold-stat-chip"><i class="gold-dot green"></i> 运行中</span>
          <span class="gold-stat-chip">实时 {{ realPower.toLocaleString() }} kW</span>
          <span class="gold-stat-chip">{{ currentTime }}</span>
        </div>
      </div>
      <div class="gold-line"></div>
    </header>

    <!-- 仪表盘 + KPI -->
    <div class="gold-row-top">
      <div class="gold-gauge-card">
        <div ref="gaugeRef" class="gold-gauge"></div>
        <div class="gold-gauge-footer">
          <span>实时功率 <b>{{ realPower.toLocaleString() }}</b> kW</span>
          <span>额定容量 <b>{{ capacity.toLocaleString() }}</b> kWp</span>
        </div>
      </div>
      <div class="gold-kpi-group">
        <div class="gold-kpi" v-for="(kpi, idx) in kpiList" :key="idx">
          <div class="gold-kpi-head">
            <span class="gold-kpi-icon">{{ kpi.icon }}</span>
            <span class="gold-kpi-label">{{ kpi.label }}</span>
          </div>
          <div class="gold-kpi-body">
            <span class="gold-kpi-value">{{ kpi.value }}</span>
            <span class="gold-kpi-unit">{{ kpi.unit }}</span>
          </div>
          <div class="gold-kpi-divider"></div>
          <div class="gold-kpi-subs">
            <span v-for="(sub, si) in kpi.subs" :key="si">{{ sub.label }} <b>{{ sub.value }}</b></span>
          </div>
        </div>
      </div>
    </div>

    <!-- 趋势 + 评估 -->
    <div class="gold-row-mid">
      <div class="gold-chart-card">
        <div class="gold-card-head">
          <span>发电功率趋势</span>
          <div class="gold-tabs">
            <button v-for="t in ['日','月','年','总']" :key="t"
              :class="['gold-tab', { active: dateType === t }]" @click="dateType = t">{{ t }}</button>
          </div>
        </div>
        <div ref="powerChartRef" class="gold-chart"></div>
      </div>
      <div class="gold-eval-card">
        <div class="gold-card-head"><span>电站评估</span></div>
        <div class="gold-eval-grid">
          <div class="gold-eval-circle" v-for="(ev, idx) in evalRows" :key="idx">
            <svg viewBox="0 0 80 80" class="gold-ring-svg">
              <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="4" />
              <circle cx="40" cy="40" r="34" fill="none" :stroke="ev.color" stroke-width="4"
                :stroke-dasharray="214" :stroke-dashoffset="214 - 214 * ev.pct / 100"
                stroke-linecap="round" transform="rotate(-90 40 40)" class="gold-ring-fill" />
            </svg>
            <div class="gold-eval-center">
              <span class="gold-ev-val" :style="{ color: ev.color }">{{ ev.value }}</span>
              <span class="gold-ev-lbl">{{ ev.label }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 温度 -->
    <div class="gold-row-temp">
      <div class="gold-chart-card">
        <div class="gold-card-head">
          <span>温度监测</span>
          <div class="gold-temp-legend">
            <span class="gold-legend-item"><i class="gold-ldot orange"></i>组件 {{ tempDisplay.moduleTemp }}°C</span>
            <span class="gold-legend-item"><i class="gold-ldot blue"></i>环境 {{ tempDisplay.envTemp }}°C</span>
          </div>
        </div>
        <div ref="tempChartRef" class="gold-chart"></div>
      </div>
    </div>

    <!-- 社会贡献 -->
    <div class="gold-row-social">
      <div class="gold-social" v-for="(s, idx) in socialList" :key="idx">
        <div class="gold-social-icon-ring" :style="{ borderColor: s.color }">
          <span>{{ s.icon }}</span>
        </div>
        <span class="gold-social-val" :style="{ color: s.color }">{{ s.value }}</span>
        <span class="gold-social-unit">{{ s.unit }}</span>
        <span class="gold-social-label">{{ s.label }}</span>
        <span class="gold-social-note">{{ s.note }}</span>
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
  { icon: '⚡', label: '当日发电量', value: '1,247', unit: 'kWh',
    subs: [{ label: '较昨日', value: '+5.2%' }, { label: '累计', value: '9,720 MWh' }] },
  { icon: '💰', label: '当日收益', value: '748', unit: '元',
    subs: [{ label: '当年', value: '12.3万' }, { label: '累计', value: '58.3万' }] },
  { icon: '📡', label: '系统状态', value: '运行中', unit: '',
    subs: [{ label: '告警', value: '0' }, { label: '逆变器', value: '3/3' }] },
]

const evalRows = [
  { label: '综合效率', value: '86.5%', pct: 86.5, color: '#d4a853' },
  { label: '等效利用', value: '3.2h', pct: 53, color: '#00d68f' },
  { label: '性能比PR', value: '82.3%', pct: 82.3, color: '#d4a853' },
  { label: '故障损失', value: '0.05', pct: 5, color: '#ff4757' },
  { label: '可用率', value: '99.2%', pct: 99.2, color: '#00d68f' },
  { label: '日满发', value: '3.2h', pct: 53, color: '#d4a853' },
]

const socialList = [
  { icon: '🏭', label: 'CO₂减排', value: '5,832', unit: '吨', color: '#d4a853', note: '约6辆汽车年排放' },
  { icon: '🔥', label: '标煤节约', value: '1,195', unit: '吨', color: '#00d68f', note: '约120户家庭月用煤' },
  { icon: '🌳', label: '等效植树', value: '96,228', unit: '棵', color: '#d4a853', note: '约1.5亩森林年吸碳' },
  { icon: '⚡', label: '绿色发电', value: '9,720,000', unit: 'kWh', color: '#00d68f', note: '约583户家庭月用电' },
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
      axisLine: { lineStyle: { width: 12, color: [[1, 'rgba(255,255,255,0.05)']] } },
      progress: { show: true, width: 12, itemStyle: { color: new echarts.graphic.LinearGradient(0,0,1,0, [{ offset:0, color:'#b8860b' },{ offset:1, color:'#ffd700' }]) } },
      axisTick: { show: false }, splitLine: { show: false }, axisLabel: { show: false },
      pointer: { length: '55%', width: 5, itemStyle: { color: '#d4a853' } },
      anchor: { size: 13, itemStyle: { color: '#d4a853', borderColor: 'rgba(212,168,83,0.25)', borderWidth: 5 } },
      title: { show: false },
      detail: { fontSize: 30, fontWeight: 700, color: '#d4a853', offsetCenter: [0,'30%'], formatter: '{value}', valueAnimation: true },
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
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(15,15,15,0.95)', borderColor: 'rgba(212,168,83,0.3)', borderWidth: 1, textStyle: { color: '#e0d6c0' } },
    grid: { left: '3%', right: '3%', top: '6%', bottom: '8%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, axisLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } }, axisTick: { show: false }, axisLabel: { color: '#8a7e65', fontSize: 11 }, data: config.xAxis },
    yAxis: { type: 'value', axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.03)' } }, axisLabel: { color: '#8a7e65', fontSize: 11 } },
    series: [{ name: '功率', type: 'line', smooth: true, symbol: 'circle', symbolSize: 5, animation: false, itemStyle: { color: '#d4a853', borderColor: '#0f0f0f', borderWidth: 2 }, lineStyle: { color: '#d4a853', width: 2, shadowColor: 'rgba(212,168,83,0.3)', shadowBlur: 6 }, areaStyle: { color: new echarts.graphic.LinearGradient(0,0,0,1, [{ offset:0, color:'rgba(212,168,83,0.15)' },{ offset:1, color:'rgba(212,168,83,0)' }]) }, data: config.data }]
  }, true)
}

const initTempChart = () => {
  if (!tempChartRef.value) return
  if (tempChart) tempChart.dispose()
  tempChart = echarts.init(tempChartRef.value)
  tempChart.setOption({
    backgroundColor: 'transparent', animation: false,
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(15,15,15,0.95)', borderColor: 'rgba(212,168,83,0.3)', borderWidth: 1, textStyle: { color: '#e0d6c0' } },
    grid: { left: '3%', right: '3%', top: '6%', bottom: '5%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, axisLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } }, axisTick: { show: false }, axisLabel: { color: '#8a7e65', fontSize: 11 }, data: ['00:00','02:00','04:00','06:00','08:00','10:00','12:00','14:00','16:00','18:00','20:00','22:00'] },
    yAxis: [
      { type: 'value', min: 0, max: 60, axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.03)', type: 'dashed' } }, axisLabel: { color: '#d4a853', fontSize: 11, formatter: '{value}°C' } },
      { type: 'value', min: 0, max: 40, axisLine: { show: false }, axisTick: { show: false }, splitLine: { show: false }, axisLabel: { color: '#00d68f', fontSize: 11, formatter: '{value}°C' } }
    ],
    series: [
      { name: '组件温度', type: 'line', smooth: true, symbol: 'none', animation: false, lineStyle: { color: '#d4a853', width: 2 }, areaStyle: { color: new echarts.graphic.LinearGradient(0,0,0,1, [{ offset:0, color:'rgba(212,168,83,0.1)' },{ offset:1, color:'rgba(212,168,83,0)' }]) }, data: [18,17,16,17,25,35,45,48,42,35,26,20] },
      { name: '环境温度', type: 'line', yAxisIndex: 1, smooth: true, symbol: 'none', animation: false, lineStyle: { color: '#00d68f', width: 2 }, data: [15,14,13,14,20,25,28,30,27,23,18,16] }
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
.gold-page {
  --bg: #0f0f0f;
  --surface: #1a1a1a;
  --surface-hover: #222222;
  --border: rgba(255,255,255,0.06);
  --border-hover: rgba(212,168,83,0.2);
  --text: #e0d6c0;
  --text-dim: #8a7e65;
  --gold: #d4a853;
  --gold-light: #ffd700;
  --green: #00d68f;
  --red: #ff4757;

  min-height: 100vh;
  background: var(--bg);
  background-image: radial-gradient(ellipse at 50% 0%, rgba(212,168,83,0.04) 0%, transparent 50%);
  color: var(--text);
  font-family: 'Inter', 'Microsoft YaHei', sans-serif;
  padding: 0 24px 30px;
}

.gold-header { position: relative; margin-bottom: 28px; padding: 20px 0; }
.gold-header-glow { position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, var(--gold), transparent); opacity: 0.5; }
.gold-header-content { display: flex; justify-content: space-between; align-items: center; }
.gold-title { font-size: 24px; font-weight: 800; letter-spacing: 2px; }
.gold-accent { color: var(--gold); }
.gold-header-stats { display: flex; gap: 12px; }
.gold-stat-chip { font-size: 12px; padding: 4px 12px; background: rgba(255,255,255,0.04); border-radius: 6px; color: var(--text-dim); display: flex; align-items: center; gap: 6px; }
.gold-dot { width: 6px; height: 6px; border-radius: 50%; display: inline-block; }
.gold-dot.green { background: var(--green); box-shadow: 0 0 6px rgba(0,214,143,0.4); }
.gold-line { height: 1px; background: linear-gradient(90deg, transparent, var(--border), transparent); margin-top: 20px; }

.gold-row-top { display: flex; gap: 20px; margin-bottom: 20px; }
.gold-gauge-card { flex: 0 0 300px; background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 24px; display: flex; flex-direction: column; align-items: center; position: relative; overflow: hidden; }
.gold-gauge-card::before { content: ''; position: absolute; top: 0; left: 15%; right: 15%; height: 1px; background: linear-gradient(90deg, transparent, var(--gold), transparent); opacity: 0.4; }
.gold-gauge { width: 260px; height: 220px; }
.gold-gauge-footer { display: flex; gap: 24px; margin-top: 12px; font-size: 12px; color: var(--text-dim); }
.gold-gauge-footer b { color: var(--gold); }

.gold-kpi-group { flex: 1; display: flex; flex-direction: column; gap: 12px; }
.gold-kpi { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 16px 20px; display: flex; flex-direction: column; gap: 6px; transition: all 0.3s; }
.gold-kpi:hover { border-color: var(--border-hover); }
.gold-kpi-head { display: flex; align-items: center; gap: 8px; }
.gold-kpi-icon { font-size: 14px; }
.gold-kpi-label { font-size: 12px; color: var(--text-dim); }
.gold-kpi-body { display: flex; align-items: baseline; gap: 4px; }
.gold-kpi-value { font-size: 24px; font-weight: 800; color: var(--gold); }
.gold-kpi-unit { font-size: 12px; color: var(--text-dim); }
.gold-kpi-divider { height: 1px; background: var(--border); margin: 4px 0; }
.gold-kpi-subs { display: flex; gap: 16px; font-size: 11px; color: var(--text-dim); }
.gold-kpi-subs b { color: var(--text); font-weight: 600; }

.gold-row-mid { display: flex; gap: 20px; margin-bottom: 20px; }
.gold-chart-card { flex: 1; min-width: 0; background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 20px; position: relative; overflow: hidden; }
.gold-chart-card::before { content: ''; position: absolute; top: 0; left: 15%; right: 15%; height: 1px; background: linear-gradient(90deg, transparent, var(--gold), transparent); opacity: 0.3; }
.gold-card-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; font-size: 15px; font-weight: 700; }
.gold-tabs { display: flex; gap: 2px; }
.gold-tab { padding: 5px 14px; border: none; border-radius: 6px; background: transparent; color: var(--text-dim); font-size: 12px; cursor: pointer; transition: all 0.2s; }
.gold-tab.active { background: var(--gold); color: #0f0f0f; font-weight: 600; }
.gold-chart { height: 260px; }

.gold-eval-card { flex: 0 0 300px; background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 20px; }
.gold-eval-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.gold-eval-circle { position: relative; aspect-ratio: 1; display: flex; align-items: center; justify-content: center; }
.gold-ring-svg { width: 100%; height: 100%; position: absolute; top: 0; left: 0; }
.gold-ring-fill { transition: stroke-dashoffset 1.5s ease-out; }
.gold-eval-center { text-align: center; position: relative; z-index: 1; }
.gold-ev-val { display: block; font-size: 14px; font-weight: 800; }
.gold-ev-lbl { display: block; font-size: 9px; color: var(--text-dim); margin-top: 2px; }

.gold-row-temp { margin-bottom: 20px; }
.gold-temp-legend { display: flex; gap: 16px; }
.gold-legend-item { display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--text-dim); }
.gold-ldot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
.gold-ldot.orange { background: var(--gold); }
.gold-ldot.blue { background: var(--green); }

.gold-row-social { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.gold-social { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 20px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 4px; transition: all 0.3s; }
.gold-social:hover { border-color: var(--border-hover); transform: translateY(-2px); }
.gold-social-icon-ring { width: 48px; height: 48px; border-radius: 50%; border: 1.5px solid; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.02); font-size: 20px; }
.gold-social-val { font-size: 22px; font-weight: 800; }
.gold-social-unit { font-size: 11px; color: var(--text-dim); }
.gold-social-label { font-size: 12px; color: var(--text-dim); }
.gold-social-note { font-size: 10px; color: var(--text-dim); opacity: 0.6; margin-top: 2px; }

@media (max-width: 1200px) {
  .gold-row-top, .gold-row-mid { flex-direction: column; }
  .gold-gauge-card, .gold-eval-card { flex: none; }
  .gold-row-social { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .gold-kpi-group { flex-direction: column; }
  .gold-row-social { grid-template-columns: 1fr; }
  .gold-eval-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
