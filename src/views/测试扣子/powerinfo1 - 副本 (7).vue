<template>
  <div class="pv-page pv-terminal">
    <!-- 顶部状态行 -->
    <div class="status-bar">
      <div class="sb-left">
        <span class="sb-dot" :class="statusDotClass"></span>
        <span class="sb-status" :class="statusTextClass">{{ statusText }}</span>
        <span class="sb-sep">│</span>
        <span class="sb-key">实时功率</span>
        <span class="sb-val" :class="{ 'val-danger': overloaded }">{{ realTimePower.toLocaleString() }} kW</span>
        <span class="sb-trend" :class="powerTrendClass">{{ powerTrendText }}</span>
        <span class="sb-sep">│</span>
        <span class="sb-key">功率占比</span>
        <span class="sb-val">{{ powerPercent.toFixed(1) }}%</span>
      </div>
      <div class="sb-right">
        <span class="sb-time">{{ currentTime }}</span>
        <span class="sb-sep">│</span>
        <span class="sb-key">刷新</span>
        <span class="sb-val">{{ countdown }}s</span>
      </div>
    </div>

    <!-- 核心数据网格 -->
    <div class="data-grid">
      <div class="dg-row dg-header">
        <span class="dg-cell dg-label">指标</span>
        <span class="dg-cell dg-val-col">当前值</span>
        <span class="dg-cell dg-sub">累计/参考</span>
        <span class="dg-cell dg-tag-col">状态</span>
      </div>
      <div class="dg-row" v-for="row in dataGridRows" :key="row.label" :class="{ 'dg-row-warn': row.warn }">
        <span class="dg-cell dg-label">
          <el-icon :size="12" :color="row.iconColor"><component :is="row.elIcon" /></el-icon>
          {{ row.label }}
        </span>
        <span class="dg-cell dg-val-col" :style="{ color: row.valColor }">{{ row.displayValue }}</span>
        <span class="dg-cell dg-sub">{{ row.subValue }}</span>
        <span class="dg-cell dg-tag-col">
          <span v-if="row.tag" class="dg-tag" :class="'tag-' + row.tagType">{{ row.tag }}</span>
        </span>
      </div>
    </div>

    <!-- 迷你仪表 + 趋势图 合并区 -->
    <div class="chart-area">
      <div class="chart-header">
        <div class="ch-left">
          <span class="ch-indicator" :class="statusDotClass"></span>
          <span class="ch-title">发电功率趋势</span>
          <span class="ch-inline-eval">效率 86.5% │ PR 82.3% │ 可用率 99.2% │ 故障 0.05</span>
        </div>
        <div class="ch-tools">
          <span v-for="opt in dateOptions" :key="opt.value" :class="['ch-opt', { active: dateType === opt.value }]" @click="dateType = opt.value; updatePowerChart()">{{ opt.label }}</span>
          <el-date-picker v-model="selectDate" :type="dateType === 'month' ? 'month' : 'date'" placeholder="日期" size="small" style="width:110px" />
        </div>
      </div>
      <div class="chart-body"><div ref="powerChartRef" class="chart-canvas"></div></div>
    </div>

    <!-- 温度图 -->
    <div class="chart-area">
      <div class="chart-header">
        <div class="ch-left">
          <span class="ch-indicator dot-blue"></span>
          <span class="ch-title">温度监测</span>
          <span class="ch-inline-eval">组件 {{ tempDisplay.moduleTemp }}°C │ 环境 {{ tempDisplay.envTemp }}°C</span>
        </div>
        <div class="ch-tools">
          <span class="ch-inline-weather" v-for="day in weatherData" :key="day.label">
            <el-icon :size="11" :color="day.iconColor"><component :is="day.elIcon" /></el-icon>
            {{ day.label }} {{ day.temp }}°C {{ day.desc }}
          </span>
        </div>
      </div>
      <div class="chart-body"><div ref="tempChartRef" class="chart-canvas" style="height:160px"></div></div>
    </div>

    <!-- 社会贡献单行 -->
    <div class="social-line">
      <div class="sl-item" v-for="item in socialLineData" :key="item.label">
        <el-icon :size="12" :color="item.color"><component :is="item.elIcon" /></el-icon>
        <span class="sl-label">{{ item.label }}</span>
        <span class="sl-val">{{ item.displayValue }}</span>
        <span class="sl-unit">{{ item.unit }}</span>
      </div>
    </div>
    <div class="social-line social-human-line">
      <span v-for="item in socialLineData" :key="item.label + '-h'" class="sl-human">{{ item.humanText }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { TrendCharts, Aim, Odometer, Lightning, Sunny, PartlyCloudy, Drizzling, Cloudy, Coin, Position, WarningFilled, DataLine, Money, Monitor, Timer } from '@element-plus/icons-vue'

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
const prevPower = ref(1680)
const powerChartRef = ref(null); const tempChartRef = ref(null)
let powerChart = null; let tempChart = null; let refreshTimer = null; let clockTimer = null
const selectDate = ref(new Date()); const dateType = ref('day')
const dateOptions = [{ label: '日', value: 'day' }, { label: '月', value: 'month' }, { label: '年', value: 'year' }, { label: '总', value: 'total' }]
const tempDisplay = ref({ moduleTemp: '45.2', envTemp: '24.5' })
const currentTime = ref(''); const countdown = ref(5)

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
const warningCount = computed(() => realData.value?.powerInfo?.systemMonitor?.warningCount ?? 1)
const statusText = computed(() => realData.value?.powerInfo?.systemMonitor?.runStatus || '运行中')
const statusDotClass = computed(() => statusText.value === '停机' ? 'dot-stopped' : 'dot-running')
const statusTextClass = computed(() => statusText.value === '停机' ? 'text-stopped' : 'text-running')

const powerTrendClass = computed(() => {
  const diff = realTimePower.value - prevPower.value
  if (diff > 10) return 'trend-up'; if (diff < -10) return 'trend-down'; return 'trend-flat'
})
const powerTrendText = computed(() => {
  const diff = realTimePower.value - prevPower.value
  if (diff > 10) return `↑${diff}`; if (diff < -10) return `↓${Math.abs(diff)}`; return '→0'
})

const dataGridRows = computed(() => [
  { elIcon: Lightning, iconColor: '#ff9a42', label: '当日发电', displayValue: '1,245.6 kWh', subValue: '累计 9,724,580 kWh', valColor: '#1a1a2e', tag: '+12.3%', tagType: 'success', warn: false },
  { elIcon: Money, iconColor: '#52c41a', label: '当日收益', displayValue: '¥ 747.36', subValue: '当年 185,420 / 累计 5,834,748', valColor: '#1a1a2e', tag: '', tagType: '', warn: false },
  { elIcon: Monitor, iconColor: warningCount.value > 0 ? '#e6a23c' : '#52c41a', label: '系统状态', displayValue: statusText.value, subValue: `告警 ${warningCount.value} │ 逆变器 ${4 - warningCount.value}/4`, valColor: warningCount.value > 0 ? '#e6a23c' : '#52c41a', tag: warningCount.value > 0 ? '注意' : '正常', tagType: warningCount.value > 0 ? 'warning' : 'success', warn: warningCount.value > 0 },
  { elIcon: TrendCharts, iconColor: '#409EFF', label: '等效小时', displayValue: '3.8 h', subValue: `功率占比 ${powerPercent.value.toFixed(1)}%`, valColor: '#1a1a2e', tag: '', tagType: '', warn: false },
  { elIcon: Timer, iconColor: '#909399', label: '电价', displayValue: '上网 0.4 / 自用 0.6', subValue: '元/kWh', valColor: '#666', tag: '', tagType: '', warn: false }
])

const socialLineData = computed(() => {
  const t = 9724580; const co2 = t * 0.7035 / 1000; const coal = t * 0.1229 / 1000; const trees = Math.round(co2 * 16.5)
  return [
    { elIcon: Cloudy, color: '#ff9a42', label: 'CO₂减排', displayValue: co2.toFixed(1), unit: '吨', humanText: `≈ ${Math.round(co2/1.4).toLocaleString()} 辆车年排放` },
    { elIcon: Coin, color: '#e6a23c', label: '标煤节约', displayValue: coal.toFixed(1), unit: '吨', humanText: `≈ ${Math.round(coal/0.25).toLocaleString()} 户月供暖` },
    { elIcon: Position, color: '#67c23a', label: '等效植树', displayValue: trees.toLocaleString(), unit: '棵', humanText: `≈ ${Math.round(trees/2000)} 足球场森林` },
    { elIcon: Lightning, color: '#409EFF', label: '绿色发电', displayValue: (t/10000).toFixed(1), unit: '万kWh', humanText: `≈ ${Math.round(t/2000).toLocaleString()} 户年用电` }
  ]
})

const simulateRealtime = () => {
  prevPower.value = realTimePower.value
  realTimePower.value = Math.max(0, Math.round(1680 + (Math.random() - 0.5) * 168))
  tempDisplay.value = { moduleTemp: (42 + Math.random() * 8).toFixed(1), envTemp: (22 + Math.random() * 6).toFixed(1) }
  countdown.value = 5
}

const initPowerChart = () => {
  if (!powerChartRef.value) return; if (powerChart) powerChart.dispose()
  powerChart = echarts.init(powerChartRef.value); updatePowerChart()
}
const updatePowerChart = () => {
  if (!powerChart) return; const c = powerDataByType[dateType.value]
  powerChart.setOption({
    animation: false, backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', backgroundColor: '#1a1a2e', textStyle: { color: '#ff9a42', fontSize: 12 }, axisPointer: { lineStyle: { color: '#ff9a42', type: 'dashed' } } },
    grid: { left: '1%', right: '1%', top: '4%', bottom: '10%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, axisLine: { lineStyle: { color: '#2a2a3e' } }, axisTick: { show: false }, axisLabel: { color: '#7a8299', fontSize: 11 }, data: c.xAxis },
    yAxis: { type: 'value', axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: '#1e1e30' } }, axisLabel: { color: '#7a8299', fontSize: 11 } },
    series: [{ type: 'line', smooth: true, symbol: 'none', lineStyle: { color: '#ff9a42', width: 2 }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(255,154,66,0.1)' }, { offset: 1, color: 'rgba(255,154,66,0)' }]) }, data: c.data }]
  })
}

const initTempChart = () => {
  if (!tempChartRef.value) return; if (tempChart) tempChart.dispose()
  tempChart = echarts.init(tempChartRef.value)
  tempChart.setOption({
    animation: false, backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', backgroundColor: '#1a1a2e', textStyle: { color: '#e8eaf0', fontSize: 12 } },
    grid: { left: '1%', right: '1%', top: '4%', bottom: '5%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, axisLine: { lineStyle: { color: '#2a2a3e' } }, axisTick: { show: false }, axisLabel: { color: '#7a8299', fontSize: 11 }, data: ['00:00','02:00','04:00','06:00','08:00','10:00','12:00','14:00','16:00','18:00','20:00','22:00'] },
    yAxis: { type: 'value', min: 0, max: 60, axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: '#1e1e30', type: 'dashed' } }, axisLabel: { color: '#7a8299', fontSize: 11, formatter: '{value}°C' } },
    series: [
      { name: '组件温度', type: 'line', smooth: true, symbol: 'none', lineStyle: { color: '#ff6b00', width: 1.5 }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(255,107,0,0.08)' }, { offset: 1, color: 'rgba(255,107,0,0)' }]) }, data: [18,17,16,17,25,35,45,48,42,35,26,20] },
      { name: '环境温度', type: 'line', smooth: true, symbol: 'none', lineStyle: { color: '#409EFF', width: 1.5 }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(64,158,255,0.08)' }, { offset: 1, color: 'rgba(64,158,255,0)' }]) }, data: [15,14,13,14,20,25,28,30,27,23,18,16] }
    ]
  })
}

const handleResize = () => { requestAnimationFrame(() => { powerChart?.resize(); tempChart?.resize() }) }

onMounted(() => {
  window.addEventListener('resize', handleResize); realData.value = MOCK_DATA
  currentTime.value = new Date().toLocaleTimeString()
  clockTimer = setInterval(() => { currentTime.value = new Date().toLocaleTimeString(); countdown.value = Math.max(0, countdown.value - 1) }, 1000)
  nextTick(() => { initPowerChart(); initTempChart() })
  refreshTimer = setInterval(simulateRealtime, 5000)
})
onUnmounted(() => {
  window.removeEventListener('resize', handleResize); if (refreshTimer) clearInterval(refreshTimer); if (clockTimer) clearInterval(clockTimer)
  powerChart?.dispose(); tempChart?.dispose()
})
</script>

<style scoped>
.pv-terminal {
  --bg: #0d0d1a; --surface: #13132a; --border: #1e1e30; --text: #e8eaf0; --dim: #7a8299;
  --accent: #ff9a42; --green: #00d68f; --red: #ff4757; --blue: #409EFF;
  min-height: 100vh; background: var(--bg); color: var(--text);
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace; font-size: 13px; line-height: 1.5;
  padding: 8px 16px;
}

/* ===== 状态条 ===== */
.status-bar { display: flex; align-items: center; justify-content: space-between; padding: 6px 12px; border-bottom: 1px solid var(--border); margin-bottom: 8px; flex-wrap: wrap; gap: 4px; }
.sb-left, .sb-right { display: flex; align-items: center; gap: 6px; }
.sb-sep { color: #2a2a3e; }
.sb-key { color: var(--dim); font-size: 11px; }
.sb-val { color: var(--accent); font-weight: 700; font-size: 13px; }
.sb-status { font-weight: 700; font-size: 12px; }
.sb-time { color: var(--dim); font-size: 12px; font-variant-numeric: tabular-nums; }
.sb-trend { font-size: 11px; font-weight: 700; }
.trend-up { color: var(--green); } .trend-down { color: var(--red); } .trend-flat { color: var(--dim); }
.text-running { color: var(--green); } .text-stopped { color: var(--red); }
.sb-dot { width: 7px; height: 7px; border-radius: 50%; }
.dot-running { background: var(--green); box-shadow: 0 0 6px rgba(0,214,143,0.4); }
.dot-stopped { background: var(--red); box-shadow: 0 0 6px rgba(255,71,87,0.4); }
.dot-blue { background: var(--blue); box-shadow: 0 0 6px rgba(64,158,255,0.4); }
.val-danger { color: var(--red) !important; }

/* ===== 数据网格 ===== */
.data-grid { border: 1px solid var(--border); border-radius: 4px; margin-bottom: 8px; overflow: hidden; }
.dg-row { display: flex; align-items: center; padding: 0 12px; height: 28px; border-bottom: 1px solid var(--border); transition: background 0.15s; }
.dg-row:last-child { border-bottom: none; }
.dg-row:hover { background: rgba(255,255,255,0.02); }
.dg-row-warn { background: rgba(230,162,60,0.05); border-left: 2px solid #e6a23c; }
.dg-header { background: rgba(255,255,255,0.03); }
.dg-header .dg-cell { color: var(--dim); font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
.dg-cell { display: flex; align-items: center; gap: 6px; }
.dg-label { flex: 0 0 120px; color: var(--dim); font-size: 12px; }
.dg-val-col { flex: 0 0 160px; font-weight: 700; font-size: 13px; color: var(--text); font-variant-numeric: tabular-nums; }
.dg-sub { flex: 1; color: var(--dim); font-size: 11px; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dg-tag-col { flex: 0 0 60px; justify-content: flex-end; }
.dg-tag { padding: 1px 6px; border-radius: 3px; font-size: 10px; font-weight: 700; }
.tag-success { background: rgba(0,214,143,0.15); color: var(--green); }
.tag-warning { background: rgba(230,162,60,0.15); color: #e6a23c; }

/* ===== 图表区 ===== */
.chart-area { border: 1px solid var(--border); border-radius: 4px; margin-bottom: 8px; overflow: hidden; }
.chart-header { display: flex; align-items: center; justify-content: space-between; padding: 6px 12px; border-bottom: 1px solid var(--border); flex-wrap: wrap; gap: 4px; }
.ch-left { display: flex; align-items: center; gap: 8px; }
.ch-indicator { width: 6px; height: 6px; border-radius: 50%; }
.ch-title { font-size: 12px; font-weight: 700; color: var(--text); }
.ch-inline-eval { font-size: 10px; color: var(--dim); }
.ch-tools { display: flex; align-items: center; gap: 8px; }
.ch-opt { font-size: 11px; color: var(--dim); cursor: pointer; padding: 2px 6px; transition: all 0.15s; border-radius: 2px; }
.ch-opt:hover { color: var(--text); }
.ch-opt.active { color: var(--accent); font-weight: 700; }
.ch-inline-weather { font-size: 10px; color: var(--dim); display: inline-flex; align-items: center; gap: 3px; }
.chart-body { padding: 4px; }
.chart-canvas { width: 100%; height: 200px; }

/* ===== 社会贡献单行 ===== */
.social-line { display: flex; gap: 0; padding: 6px 12px; border: 1px solid var(--border); border-radius: 4px; margin-bottom: 2px; }
.sl-item { display: flex; align-items: center; gap: 4px; flex: 1; padding: 2px 0; }
.sl-item:not(:last-child) { border-right: 1px solid var(--border); padding-right: 12px; margin-right: 12px; }
.sl-label { font-size: 10px; color: var(--dim); }
.sl-val { font-size: 14px; font-weight: 700; color: var(--accent); font-variant-numeric: tabular-nums; }
.sl-unit { font-size: 10px; color: var(--dim); }
.social-human-line { display: flex; border: none; border-top: none; border-radius: 0 0 4px 4px; padding: 3px 12px; background: rgba(255,255,255,0.01); }
.sl-human { flex: 1; font-size: 9px; color: #555; text-align: center; }

:deep(.el-date-editor) { width: 110px !important; }
:deep(.el-input__wrapper) { background: var(--surface) !important; border-radius: 2px !important; box-shadow: none !important; border: 1px solid var(--border) !important; }
:deep(.el-input__inner) { color: var(--dim) !important; font-family: 'SF Mono', monospace !important; font-size: 11px !important; }

@media (max-width: 700px) {
  .dg-label { flex: 0 0 80px; } .dg-val-col { flex: 0 0 120px; } .dg-sub { display: none; }
  .ch-inline-eval { display: none; }
  .sl-item { flex-wrap: wrap; }
}
</style>
