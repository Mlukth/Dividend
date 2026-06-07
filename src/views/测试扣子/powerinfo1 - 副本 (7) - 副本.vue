<template>
  <div class="pv-page pv-dashboard" @mousemove="onMouseMove">
    <!-- 顶部：4个圆形仪表盘 -->
    <div class="gauge-row">
      <!-- 主仪表：实时功率 -->
      <div class="gauge-unit gauge-main">
        <div class="ring-wrapper">
          <svg viewBox="0 0 200 200" class="ring-svg">
            <circle cx="100" cy="100" r="85" fill="none" :stroke="ringBgColor" stroke-width="10" />
            <circle cx="100" cy="100" r="85" fill="none" :stroke="ringColor" stroke-width="10"
              stroke-linecap="round" :stroke-dasharray="mainArc" stroke-dashoffset="0"
              transform="rotate(-90 100 100)" class="ring-progress" />
            <!-- 扫描光点 -->
            <circle :cx="scanDot.x" :cy="scanDot.y" r="4" :fill="ringColor" class="scan-dot">
              <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
            </circle>
          </svg>
          <div class="ring-center">
            <div class="ring-value" :class="{ 'val-danger': overloaded }">{{ realTimePower.toLocaleString() }}</div>
            <div class="ring-unit">kW</div>
            <div class="ring-sub">功率占比 {{ powerPercent.toFixed(1) }}%</div>
          </div>
        </div>
        <div class="gauge-label">
          <el-icon :size="14" color="#ff9a42"><Lightning /></el-icon>
          实时功率
        </div>
      </div>

      <!-- 子仪表：发电完成度 -->
      <div class="gauge-unit gauge-sub">
        <div class="ring-wrapper">
          <svg viewBox="0 0 200 200" class="ring-svg">
            <circle cx="100" cy="100" r="85" fill="none" stroke="#1e2a3a" stroke-width="8" />
            <circle cx="100" cy="100" r="85" fill="none" stroke="#00d68f" stroke-width="8"
              stroke-linecap="round" :stroke-dasharray="completionArc" stroke-dashoffset="0"
              transform="rotate(-90 100 100)" class="ring-progress" />
          </svg>
          <div class="ring-center">
            <div class="ring-value-sm">{{ completionPercent.toFixed(1) }}%</div>
            <div class="ring-unit-sm">完成度</div>
          </div>
        </div>
        <div class="gauge-label">
          <el-icon :size="12" color="#00d68f"><TrendCharts /></el-icon>
          发电完成
        </div>
      </div>

      <!-- 子仪表：综合效率 -->
      <div class="gauge-unit gauge-sub">
        <div class="ring-wrapper">
          <svg viewBox="0 0 200 200" class="ring-svg">
            <circle cx="100" cy="100" r="85" fill="none" stroke="#1e2a3a" stroke-width="8" />
            <circle cx="100" cy="100" r="85" fill="none" stroke="#409EFF" stroke-width="8"
              stroke-linecap="round" :stroke-dasharray="efficiencyArc" stroke-dashoffset="0"
              transform="rotate(-90 100 100)" class="ring-progress" />
          </svg>
          <div class="ring-center">
            <div class="ring-value-sm">{{ evalData.systemEfficiency }}%</div>
            <div class="ring-unit-sm">效率</div>
          </div>
        </div>
        <div class="gauge-label">
          <el-icon :size="12" color="#409EFF"><Aim /></el-icon>
          综合效率
        </div>
      </div>

      <!-- 子仪表：可用率 -->
      <div class="gauge-unit gauge-sub">
        <div class="ring-wrapper">
          <svg viewBox="0 0 200 200" class="ring-svg">
            <circle cx="100" cy="100" r="85" fill="none" stroke="#1e2a3a" stroke-width="8" />
            <circle cx="100" cy="100" r="85" fill="none" stroke="#52c41a" stroke-width="8"
              stroke-linecap="round" :stroke-dasharray="availabilityArc" stroke-dashoffset="0"
              transform="rotate(-90 100 100)" class="ring-progress" />
          </svg>
          <div class="ring-center">
            <div class="ring-value-sm">{{ evalData.availability }}%</div>
            <div class="ring-unit-sm">可用率</div>
          </div>
        </div>
        <div class="gauge-label">
          <el-icon :size="12" color="#52c41a"><Monitor /></el-icon>
          系统可用
        </div>
      </div>
    </div>

    <!-- KPI数字行 -->
    <div class="kpi-row">
      <div class="kpi-item" v-for="kpi in kpiItems" :key="kpi.label">
        <div class="kpi-value" :style="{ color: kpi.color }">{{ kpi.value }}</div>
        <div class="kpi-unit">{{ kpi.unit }}</div>
        <div class="kpi-label">{{ kpi.label }}</div>
        <div class="kpi-trend" v-if="kpi.trend" :class="kpi.trendClass">{{ kpi.trend }}</div>
      </div>
    </div>

    <!-- 趋势图 + 评估弧 -->
    <div class="chart-section">
      <div class="chart-main">
        <div class="section-header">
          <div class="sh-left">
            <span class="sh-dot" :class="statusDotClass"></span>
            <span class="sh-title">发电功率趋势</span>
          </div>
          <div class="sh-tools">
            <button v-for="opt in dateOptions" :key="opt.value" :class="['hw-btn', { active: dateType === opt.value }]" @click="dateType = opt.value; updatePowerChart()">{{ opt.label }}</button>
            <el-date-picker v-model="selectDate" :type="dateType === 'month' ? 'month' : 'date'" placeholder="日期" size="small" style="width:120px" />
          </div>
        </div>
        <div class="chart-body"><div ref="powerChartRef" class="chart-canvas"></div></div>
      </div>
      <!-- 评估弧形仪表 -->
      <div class="eval-arcs">
        <div class="arc-title">
          <el-icon :size="14" color="#ff9a42"><Aim /></el-icon>
          电站评估
        </div>
        <div class="arc-item" v-for="arc in evalArcs" :key="arc.label">
          <svg viewBox="0 0 100 55" class="arc-svg">
            <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#1e2a3a" stroke-width="6" stroke-linecap="round" />
            <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" :stroke="arc.color" stroke-width="6" stroke-linecap="round"
              :stroke-dasharray="arc.dashArray" :stroke-dashoffset="0" class="arc-progress" />
          </svg>
          <div class="arc-info">
            <span class="arc-val" :style="{ color: arc.color }">{{ arc.value }}</span>
            <span class="arc-label">{{ arc.label }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 温度 + 天气 -->
    <div class="chart-section">
      <div class="chart-main">
        <div class="section-header">
          <div class="sh-left">
            <span class="sh-dot dot-blue"></span>
            <span class="sh-title">温度监测</span>
          </div>
          <div class="sh-tools">
            <span class="temp-current">{{ tempDisplay.moduleTemp }}°C</span>
            <span class="temp-divider">/</span>
            <span class="temp-env">{{ tempDisplay.envTemp }}°C</span>
          </div>
        </div>
        <div class="chart-body"><div ref="tempChartRef" class="chart-canvas" style="height:180px"></div></div>
      </div>
      <div class="weather-strip">
        <div class="ws-item" v-for="day in weatherData" :key="day.label">
          <el-icon :size="18" :color="day.iconColor"><component :is="day.elIcon" /></el-icon>
          <div class="ws-day">{{ day.label }}</div>
          <div class="ws-temp">{{ day.temp }}°C</div>
          <div class="ws-desc">{{ day.desc }}</div>
        </div>
      </div>
    </div>

    <!-- 社会贡献半圆仪表 -->
    <div class="social-dash">
      <div class="sd-item" v-for="item in socialArcData" :key="item.label">
        <svg viewBox="0 0 120 65" class="sd-svg">
          <path d="M 12 60 A 48 48 0 0 1 108 60" fill="none" stroke="#1e2a3a" stroke-width="7" stroke-linecap="round" />
          <path d="M 12 60 A 48 48 0 0 1 108 60" fill="none" :stroke="item.color" stroke-width="7" stroke-linecap="round"
            :stroke-dasharray="item.dashArray" :stroke-dashoffset="0" class="arc-progress" />
        </svg>
        <div class="sd-center">
          <el-icon :size="16" :color="item.color"><component :is="item.elIcon" /></el-icon>
          <span class="sd-val" :style="{ color: item.color }">{{ item.displayValue }}</span>
          <span class="sd-unit">{{ item.unit }}</span>
        </div>
        <div class="sd-label">{{ item.label }}</div>
        <div class="sd-human">{{ item.humanText }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { TrendCharts, Aim, Odometer, Lightning, Sunny, PartlyCloudy, Drizzling, Cloudy, Coin, Position, Monitor } from '@element-plus/icons-vue'

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
const realTimePower = ref(1680); const prevPower = ref(1680)
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
const completionPercent = computed(() => { const expected = totalCapacity.value * 4; const today = 1245.6; return Math.min((today / expected) * 100, 100) })
const statusText = computed(() => realData.value?.powerInfo?.systemMonitor?.runStatus || '运行中')
const statusDotClass = computed(() => statusText.value === '停机' ? 'dot-stopped' : 'dot-running')

const evalData = computed(() => ({ systemEfficiency: '86.5', equivalentHours: 3.8, pr: '82.3', faultLoss: '0.05', availability: '99.2' }))

// SVG弧线计算
const circumference = 2 * Math.PI * 85
const mainArc = computed(() => `${(powerPercent.value / 100) * circumference} ${circumference}`)
const completionArc = computed(() => `${(completionPercent.value / 100) * circumference} ${circumference}`)
const efficiencyArc = computed(() => `${(parseFloat(evalData.value.systemEfficiency) / 100) * circumference} ${circumference}`)
const availabilityArc = computed(() => `${(parseFloat(evalData.value.availability) / 100) * circumference} ${circumference}`)
const ringColor = computed(() => overloaded.value ? '#ff4757' : '#ff9a42')
const ringBgColor = '#1a2030'

// 扫描光点位置
const scanAngle = ref(0)
const scanDot = computed(() => {
  const angle = (scanAngle.value * Math.PI) / 180
  const cx = 100 + 85 * Math.cos(angle - Math.PI / 2)
  const cy = 100 + 85 * Math.sin(angle - Math.PI / 2)
  return { x: cx, y: cy }
})
let scanTimer = null

// 鼠标追踪
const mouse = ref({ x: 0, y: 0 })
const onMouseMove = (e) => { mouse.value = { x: e.clientX, y: e.clientY } }

const kpiItems = computed(() => [
  { label: '当日发电', value: '1,245.6', unit: 'kWh', color: '#ff9a42', trend: '+12.3%', trendClass: 'trend-up' },
  { label: '当日收益', value: '¥ 747.36', unit: '', color: '#00d68f', trend: '', trendClass: '' },
  { label: '累计发电', value: '9,724,580', unit: 'kWh', color: '#e8eaf0', trend: '', trendClass: '' },
  { label: '累计收益', value: '¥ 5,834,748', unit: '', color: '#e8eaf0', trend: '', trendClass: '' },
  { label: '等效小时', value: '3.8', unit: 'h', color: '#409EFF', trend: '', trendClass: '' },
  { label: '逆变器', value: '3/4', unit: '在线', color: '#52c41a', trend: '', trendClass: '' }
])

// 评估弧形
const arcCircumference = Math.PI * 40 // 半圆弧长
const evalArcs = computed(() => [
  { label: '综合效率', value: '86.5%', color: '#409EFF', dashArray: `${(86.5/100)*arcCircumference} ${arcCircumference}` },
  { label: '等效小时', value: '3.8h', color: '#ff9a42', dashArray: `${(3.8/5)*arcCircumference} ${arcCircumference}` },
  { label: '性能比PR', value: '82.3%', color: '#a78bfa', dashArray: `${(82.3/100)*arcCircumference} ${arcCircumference}` },
  { label: '故障损失', value: '0.05', color: '#ff4757', dashArray: `${(0.05/1)*arcCircumference} ${arcCircumference}` },
  { label: '可用率', value: '99.2%', color: '#52c41a', dashArray: `${(99.2/100)*arcCircumference} ${arcCircumference}` }
])

// 社会贡献半圆
const sdCircumference = Math.PI * 48
const socialArcData = computed(() => {
  const t = 9724580; const co2 = t * 0.7035 / 1000; const coal = t * 0.1229 / 1000; const trees = Math.round(co2 * 16.5)
  return [
    { elIcon: Cloudy, color: '#ff9a42', label: 'CO₂减排', displayValue: co2.toFixed(1), unit: '吨', humanText: `≈ ${Math.round(co2/1.4).toLocaleString()} 辆车年排放`, dashArray: `${Math.min(co2/10000, 1) * sdCircumference} ${sdCircumference}` },
    { elIcon: Coin, color: '#e6a23c', label: '标煤节约', displayValue: coal.toFixed(1), unit: '吨', humanText: `≈ ${Math.round(coal/0.25).toLocaleString()} 户月供暖`, dashArray: `${Math.min(coal/2000, 1) * sdCircumference} ${sdCircumference}` },
    { elIcon: Position, color: '#67c23a', label: '等效植树', displayValue: trees.toLocaleString(), unit: '棵', humanText: `≈ ${Math.round(trees/2000)} 足球场森林`, dashArray: `${Math.min(trees/200000, 1) * sdCircumference} ${sdCircumference}` },
    { elIcon: Lightning, color: '#409EFF', label: '绿色发电', displayValue: (t/10000).toFixed(1), unit: '万kWh', humanText: `≈ ${Math.round(t/2000).toLocaleString()} 户年用电`, dashArray: `${Math.min(t/10000000, 1) * sdCircumference} ${sdCircumference}` }
  ]
})

const simulateRealtime = () => {
  prevPower.value = realTimePower.value
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
    animation: false, backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(10,14,26,0.9)', textStyle: { color: '#ff9a42', fontSize: 12 }, axisPointer: { lineStyle: { color: '#ff9a42', type: 'dashed' } } },
    grid: { left: '2%', right: '2%', top: '6%', bottom: '12%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, axisLine: { lineStyle: { color: '#1e2a3a' } }, axisTick: { show: false }, axisLabel: { color: '#7a8299', fontSize: 11 }, data: c.xAxis },
    yAxis: { type: 'value', axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: '#0f1520' } }, axisLabel: { color: '#7a8299', fontSize: 11 } },
    series: [{ type: 'line', smooth: true, symbol: 'none', lineStyle: { color: '#ff9a42', width: 2 }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(255,154,66,0.15)' }, { offset: 1, color: 'rgba(255,154,66,0)' }]) }, data: c.data }]
  })
}

const initTempChart = () => {
  if (!tempChartRef.value) return; if (tempChart) tempChart.dispose()
  tempChart = echarts.init(tempChartRef.value)
  tempChart.setOption({
    animation: false, backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(10,14,26,0.9)', textStyle: { color: '#e8eaf0', fontSize: 12 } },
    grid: { left: '2%', right: '2%', top: '6%', bottom: '5%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, axisLine: { lineStyle: { color: '#1e2a3a' } }, axisTick: { show: false }, axisLabel: { color: '#7a8299', fontSize: 11 }, data: ['00:00','02:00','04:00','06:00','08:00','10:00','12:00','14:00','16:00','18:00','20:00','22:00'] },
    yAxis: { type: 'value', min: 0, max: 60, axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: '#0f1520', type: 'dashed' } }, axisLabel: { color: '#7a8299', fontSize: 11, formatter: '{value}°C' } },
    series: [
      { name: '组件温度', type: 'line', smooth: true, symbol: 'none', lineStyle: { color: '#ff6b00', width: 2 }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(255,107,0,0.1)' }, { offset: 1, color: 'rgba(255,107,0,0)' }]) }, data: [18,17,16,17,25,35,45,48,42,35,26,20] },
      { name: '环境温度', type: 'line', smooth: true, symbol: 'none', lineStyle: { color: '#409EFF', width: 2 }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(64,158,255,0.1)' }, { offset: 1, color: 'rgba(64,158,255,0)' }]) }, data: [15,14,13,14,20,25,28,30,27,23,18,16] }
    ]
  })
}

const handleResize = () => { requestAnimationFrame(() => { powerChart?.resize(); tempChart?.resize() }) }

onMounted(() => {
  window.addEventListener('resize', handleResize); realData.value = MOCK_DATA
  nextTick(() => { initPowerChart(); initTempChart() })
  refreshTimer = setInterval(simulateRealtime, 5000)
  scanTimer = setInterval(() => {
    scanAngle.value = (scanAngle.value + (powerPercent.value / 100) * 360 / 200) % 360
  }, 50)
})
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (refreshTimer) clearInterval(refreshTimer); if (scanTimer) clearInterval(scanTimer)
  powerChart?.dispose(); tempChart?.dispose()
})
</script>

<style scoped>
.pv-dashboard {
  --bg: #080c18; --surface: #0d1225; --border: #151d30; --text: #e8eaf0; --dim: #5a6580;
  --accent: #ff9a42; --green: #00d68f; --red: #ff4757; --blue: #409EFF;
  min-height: 100vh; background: var(--bg); color: var(--text);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  padding: 20px; line-height: 1.5;
  background-image: radial-gradient(ellipse at 50% 0%, rgba(255,154,66,0.03) 0%, transparent 60%);
}

/* ===== 圆形仪表行 ===== */
.gauge-row { display: flex; gap: 20px; justify-content: center; align-items: flex-end; margin-bottom: 24px; flex-wrap: wrap; }
.gauge-unit { display: flex; flex-direction: column; align-items: center; }
.gauge-main { width: 240px; }
.gauge-sub { width: 150px; }
.ring-wrapper { position: relative; width: 100%; aspect-ratio: 1; }
.ring-svg { width: 100%; height: 100%; }
.ring-progress { transition: stroke-dasharray 0.8s ease-out; }
.scan-dot { filter: drop-shadow(0 0 6px currentColor); }
.ring-center { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; }
.ring-value { font-size: 32px; font-weight: 800; color: var(--accent); font-variant-numeric: tabular-nums; line-height: 1; }
.ring-value.val-danger { color: var(--red); }
.ring-unit { font-size: 12px; color: var(--dim); margin-top: 2px; }
.ring-sub { font-size: 11px; color: var(--dim); margin-top: 4px; }
.ring-value-sm { font-size: 22px; font-weight: 800; color: var(--text); font-variant-numeric: tabular-nums; line-height: 1; }
.ring-unit-sm { font-size: 10px; color: var(--dim); margin-top: 2px; }
.gauge-label { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--dim); margin-top: 8px; font-weight: 600; }

/* ===== KPI行 ===== */
.kpi-row { display: flex; gap: 0; justify-content: center; margin-bottom: 24px; padding: 12px 0; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); flex-wrap: wrap; }
.kpi-item { text-align: center; padding: 0 20px; position: relative; }
.kpi-item:not(:last-child)::after { content: ''; position: absolute; right: 0; top: 20%; height: 60%; width: 1px; background: var(--border); }
.kpi-value { font-size: 20px; font-weight: 800; font-variant-numeric: tabular-nums; line-height: 1.2; }
.kpi-unit { font-size: 11px; color: var(--dim); }
.kpi-label { font-size: 11px; color: var(--dim); margin-top: 2px; }
.kpi-trend { font-size: 10px; font-weight: 700; margin-top: 2px; }
.trend-up { color: var(--green); }

/* ===== 图表区 ===== */
.chart-section { display: flex; gap: 16px; margin-bottom: 20px; }
.chart-main { flex: 1; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; min-width: 0; }
.section-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid var(--border); flex-wrap: wrap; gap: 8px; }
.sh-left { display: flex; align-items: center; gap: 8px; }
.sh-dot { width: 8px; height: 8px; border-radius: 50%; }
.dot-running { background: var(--green); box-shadow: 0 0 8px rgba(0,214,143,0.4); animation: pulse 2s infinite; }
.dot-stopped { background: var(--red); box-shadow: 0 0 8px rgba(255,71,87,0.4); }
.dot-blue { background: var(--blue); box-shadow: 0 0 8px rgba(64,158,255,0.4); }
@keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(0,214,143,0.4); } 70% { box-shadow: 0 0 0 8px rgba(0,214,143,0); } 100% { box-shadow: 0 0 0 0 rgba(0,214,143,0); } }
.sh-title { font-size: 14px; font-weight: 700; }
.sh-tools { display: flex; align-items: center; gap: 8px; }
.hw-btn { padding: 4px 14px; border: 1px solid var(--border); background: transparent; color: var(--dim); font-size: 12px; cursor: pointer; border-radius: 16px; transition: all 0.2s; font-weight: 600; }
.hw-btn:hover { border-color: var(--accent); color: var(--accent); }
.hw-btn.active { background: var(--accent); border-color: var(--accent); color: #fff; }
.temp-current { font-size: 18px; font-weight: 800; color: #ff6b00; }
.temp-divider { color: var(--dim); font-size: 14px; }
.temp-env { font-size: 14px; font-weight: 700; color: var(--blue); }
.chart-body { padding: 8px; }
.chart-canvas { width: 100%; height: 240px; }

/* ===== 评估弧形 ===== */
.eval-arcs { flex: 0 0 160px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 8px; }
.arc-title { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 700; margin-bottom: 4px; }
.arc-item { display: flex; align-items: center; gap: 8px; }
.arc-svg { width: 60px; height: 33px; flex-shrink: 0; }
.arc-progress { transition: stroke-dasharray 0.8s ease-out; }
.arc-info { display: flex; flex-direction: column; }
.arc-val { font-size: 14px; font-weight: 800; font-variant-numeric: tabular-nums; line-height: 1.2; }
.arc-label { font-size: 10px; color: var(--dim); }

/* ===== 天气条 ===== */
.weather-strip { flex: 0 0 120px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 16px 12px; display: flex; flex-direction: column; align-items: center; gap: 12px; }
.ws-item { text-align: center; }
.ws-day { font-size: 11px; color: var(--dim); margin-top: 4px; }
.ws-temp { font-size: 16px; font-weight: 800; color: var(--text); }
.ws-desc { font-size: 10px; color: var(--dim); }

/* ===== 社会贡献半圆 ===== */
.social-dash { display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; padding: 20px 0; }
.sd-item { text-align: center; width: 160px; position: relative; }
.sd-svg { width: 120px; height: 65px; margin: 0 auto; display: block; }
.sd-center { position: absolute; top: 18px; left: 50%; transform: translateX(-50%); display: flex; align-items: baseline; gap: 4px; }
.sd-val { font-size: 18px; font-weight: 800; font-variant-numeric: tabular-nums; }
.sd-unit { font-size: 11px; color: var(--dim); }
.sd-label { font-size: 12px; color: var(--dim); margin-top: 4px; font-weight: 600; }
.sd-human { font-size: 9px; color: #445; margin-top: 2px; }

:deep(.el-date-editor) { width: 120px !important; }
:deep(.el-input__wrapper) { background: var(--surface) !important; border-radius: 16px !important; box-shadow: none !important; border: 1px solid var(--border) !important; }
:deep(.el-input__inner) { color: var(--dim) !important; font-size: 12px !important; }

@media (max-width: 900px) {
  .chart-section { flex-direction: column; }
  .eval-arcs, .weather-strip { flex: auto; }
  .weather-strip { flex-direction: row; justify-content: center; }
  .gauge-row { gap: 12px; }
  .gauge-sub { width: 120px; }
}
</style>
