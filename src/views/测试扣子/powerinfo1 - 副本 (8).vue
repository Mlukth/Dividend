<template>
  <div class="pv-page pv-progressive">
    <!-- 顶部状态条 -->
    <div class="status-bar">
      <div class="sb-left">
        <span class="sb-dot" :class="statusDotClass"></span>
        <span class="sb-status">{{ statusText }}</span>
        <span class="sb-divider">|</span>
        <span class="sb-label">实时功率</span>
        <span class="sb-power" :class="{ 'val-danger': overloaded }">{{ realTimePower.toLocaleString() }} kW</span>
        <span class="sb-trend" :class="powerTrend.class">{{ powerTrend.text }}</span>
      </div>
      <div class="sb-right">
        <span class="sb-weather">
          <el-icon :size="14" color="#ff9a42"><Sunny /></el-icon>
          32°C 晴
        </span>
        <span class="sb-divider">|</span>
        <span class="sb-time">{{ currentTime }}</span>
      </div>
    </div>

    <!-- 核心概览：默认始终展示 -->
    <div class="core-overview">
      <div class="co-item" v-for="item in coreItems" :key="item.label">
        <el-icon :size="20" :color="item.color"><component :is="item.icon" /></el-icon>
        <div class="co-content">
          <div class="co-value" :style="{ color: item.color }">{{ item.value }}</div>
          <div class="co-label">{{ item.label }}</div>
        </div>
        <div class="co-trend" v-if="item.trend" :class="item.trendClass">{{ item.trend }}</div>
        <div class="co-progress" v-if="item.progress != null">
          <div class="co-bar" :style="{ width: item.progress + '%', backgroundColor: item.color }"></div>
        </div>
      </div>
    </div>

    <!-- 趋势图：默认始终展示 -->
    <div class="section-always">
      <div class="chart-card">
        <div class="card-header">
          <div class="ch-left">
            <el-icon :size="16" color="#ff9a42"><TrendCharts /></el-icon>
            <span class="ch-title">发电功率趋势</span>
          </div>
          <div class="ch-tools">
            <button v-for="opt in dateOptions" :key="opt.value"
              :class="['pill-btn', { active: dateType === opt.value }]"
              @click="dateType = opt.value; updatePowerChart()">{{ opt.label }}</button>
            <el-date-picker v-model="selectDate" :type="dateType === 'month' ? 'month' : 'date'" placeholder="日期" size="small" style="width:130px" />
          </div>
        </div>
        <div class="chart-area"><div ref="powerChartRef" class="chart-canvas"></div></div>
      </div>
    </div>

    <!-- 社会贡献横幅：默认始终展示 -->
    <div class="social-banner">
      <div class="sb-item" v-for="item in socialItems" :key="item.label">
        <el-icon :size="16" :color="item.color"><component :is="item.icon" /></el-icon>
        <span class="sb-val" :style="{ color: item.color }">{{ item.value }}</span>
        <span class="sb-unit-text">{{ item.unit }}</span>
        <span class="sb-name">{{ item.label }}</span>
      </div>
    </div>

    <!-- ========== 以下为折叠区域 ========== -->

    <!-- 功率详情（仪表盘+KPI详细） -->
    <div class="collapsible-section">
      <button class="collapse-toggle" @click="expanded.powerDetail = !expanded.powerDetail">
        <el-icon :size="14"><component :is="expanded.powerDetail ? 'ArrowDown' : 'ArrowRight'" /></el-icon>
        <span>功率详情</span>
        <span class="toggle-summary">仪表盘 · 发电指标 · 收益明细</span>
        <span class="toggle-arrow">{{ expanded.powerDetail ? '收起' : '展开' }}</span>
      </button>
      <Transition name="slide-down">
        <div v-if="expanded.powerDetail" class="collapse-body">
          <div class="power-detail-grid">
            <div class="gauge-area">
              <div ref="gaugeRef" class="gauge-canvas"></div>
            </div>
            <div class="kpi-detail-grid">
              <div class="kpi-row-item" v-for="item in kpiDetailItems" :key="item.label">
                <span class="kpi-label">{{ item.label }}</span>
                <span class="kpi-value">{{ item.value }}</span>
                <span class="kpi-sub" v-if="item.sub">{{ item.sub }}</span>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- 电站评估 -->
    <div class="collapsible-section">
      <button class="collapse-toggle" @click="expanded.eval = !expanded.eval">
        <el-icon :size="14"><component :is="expanded.eval ? 'ArrowDown' : 'ArrowRight'" /></el-icon>
        <span>电站评估</span>
        <span class="toggle-summary">效率 {{ evalData.systemEfficiency }}% · 可用率 {{ evalData.availability }}%</span>
        <span class="toggle-arrow">{{ expanded.eval ? '收起' : '展开' }}</span>
      </button>
      <Transition name="slide-down">
        <div v-if="expanded.eval" class="collapse-body">
          <div class="eval-matrix">
            <div class="eval-bar-item" v-for="item in evalItems" :key="item.label">
              <div class="eb-top">
                <span class="eb-label">{{ item.label }}</span>
                <span class="eb-value" :style="{ color: item.color }">{{ item.value }}</span>
              </div>
              <div class="eb-bar">
                <div class="eb-fill" :style="{ width: item.percent + '%', backgroundColor: item.color }"></div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- 温度监测 -->
    <div class="collapsible-section">
      <button class="collapse-toggle" @click="expanded.temp = !expanded.temp">
        <el-icon :size="14"><component :is="expanded.temp ? 'ArrowDown' : 'ArrowRight'" /></el-icon>
        <span>温度监测</span>
        <span class="toggle-summary">组件 {{ tempDisplay.moduleTemp }}°C · 环境 {{ tempDisplay.envTemp }}°C</span>
        <span class="toggle-arrow">{{ expanded.temp ? '收起' : '展开' }}</span>
      </button>
      <Transition name="slide-down">
        <div v-if="expanded.temp" class="collapse-body">
          <div class="chart-card no-border">
            <div class="temp-header">
              <span class="th-dot orange"></span><span>组件温度 {{ tempDisplay.moduleTemp }}°C</span>
              <span class="th-sep">|</span>
              <span class="th-dot blue"></span><span>环境温度 {{ tempDisplay.envTemp }}°C</span>
            </div>
            <div class="chart-area"><div ref="tempChartRef" class="chart-canvas" style="height:200px"></div></div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, onUnmounted, nextTick, watch } from 'vue'
import * as echarts from 'echarts'
import {
  TrendCharts, Aim, Odometer, Lightning, Sunny, PartlyCloudy, Drizzling,
  Cloudy, Coin, Position, Monitor, ArrowDown, ArrowRight
} from '@element-plus/icons-vue'

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
const gaugeRef = ref(null); const powerChartRef = ref(null); const tempChartRef = ref(null)
let gaugeChart = null; let powerChart = null; let tempChart = null; let refreshTimer = null
const selectDate = ref(new Date()); const dateType = ref('day')
const dateOptions = [{ label: '日', value: 'day' }, { label: '月', value: 'month' }, { label: '年', value: 'year' }, { label: '总', value: 'total' }]
const tempDisplay = ref({ moduleTemp: '45.2', envTemp: '24.5' })
const currentTime = ref('')

const expanded = reactive({ powerDetail: false, eval: false, temp: false })

// 时钟
const updateTime = () => { currentTime.value = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) }

const totalCapacity = computed(() => realData.value?.powerInfo?.systemConstruct?.capacity || 2336)
const powerPercent = computed(() => Math.min((realTimePower.value / totalCapacity.value) * 100, 100))
const overloaded = computed(() => powerPercent.value > 90)
const statusText = computed(() => realData.value?.powerInfo?.systemMonitor?.runStatus || '运行中')
const statusDotClass = computed(() => statusText.value === '停机' ? 'dot-stopped' : 'dot-running')
const completionPercent = computed(() => { const expected = totalCapacity.value * 4; return Math.min((1245.6 / expected) * 100, 100) })

const powerTrend = computed(() => {
  const diff = realTimePower.value - prevPower.value
  if (Math.abs(diff) < 5) return { text: '→ 稳定', class: '' }
  if (diff > 0) return { text: `↑ +${diff} kW`, class: 'trend-up' }
  return { text: `↓ ${diff} kW`, class: 'trend-down' }
})

const evalData = computed(() => ({ systemEfficiency: '86.5', equivalentHours: 3.8, pr: '82.3', faultLoss: '0.05', availability: '99.2' }))

// 核心概览4项
const coreItems = computed(() => [
  { icon: Lightning, label: '实时功率', value: realTimePower.value.toLocaleString() + ' kW', color: '#ff9a42', trend: powerTrend.value.text, trendClass: powerTrend.value.class, progress: powerPercent.value },
  { icon: TrendCharts, label: '当日发电', value: '1,245.6 kWh', color: '#00d68f', trend: '+12.3%', trendClass: 'trend-up', progress: completionPercent.value },
  { icon: Coin, label: '当日收益', value: '¥ 747.36', color: '#409EFF', trend: '', trendClass: '', progress: null },
  { icon: Monitor, label: '运行状态', value: statusText.value, color: statusText.value === '停机' ? '#ff4757' : '#52c41a', trend: '', trendClass: '', progress: null }
])

// 社会贡献
const socialItems = computed(() => {
  const t = 9724580; const co2 = (t * 0.7035 / 1000).toFixed(1); const coal = (t * 0.1229 / 1000).toFixed(1); const trees = Math.round(co2 * 16.5)
  return [
    { icon: Cloudy, color: '#ff9a42', value: co2, unit: '吨 CO₂', label: '减排' },
    { icon: Coin, color: '#e6a23c', value: coal, unit: '吨标煤', label: '节约' },
    { icon: Position, color: '#67c23a', value: trees.toLocaleString(), unit: '棵', label: '植树' },
    { icon: Lightning, color: '#409EFF', value: (t / 10000).toFixed(1), unit: '万kWh', label: '绿电' }
  ]
})

// KPI详细
const kpiDetailItems = computed(() => [
  { label: '组件总容量', value: totalCapacity.value + ' kWp' },
  { label: '累计发电量', value: '9,724,580 kWh' },
  { label: '累计收益', value: '¥ 5,834,748' },
  { label: '当年收益', value: '¥ 185,420' },
  { label: '上网电价', value: '0.4 元/kWh' },
  { label: '自用电价', value: '0.6 元/kWh' },
  { label: '日满发小时', value: '3.8 h' },
  { label: '实时功率占比', value: powerPercent.value.toFixed(1) + '%' },
  { label: '逆变器在线', value: '3/4' },
  { label: '告警数量', value: '1' }
])

// 评估矩阵
const evalItems = computed(() => [
  { label: '综合效率', value: evalData.value.systemEfficiency + '%', percent: parseFloat(evalData.value.systemEfficiency), color: '#409EFF' },
  { label: '等效利用小时', value: evalData.value.equivalentHours + ' h', percent: (evalData.value.equivalentHours / 5) * 100, color: '#ff9a42' },
  { label: '性能比 PR', value: evalData.value.pr + '%', percent: parseFloat(evalData.value.pr), color: '#a78bfa' },
  { label: '故障损失', value: evalData.value.faultLoss + ' kWh', percent: parseFloat(evalData.value.faultLoss) * 100, color: '#ff4757' },
  { label: '可用率', value: evalData.value.availability + '%', percent: parseFloat(evalData.value.availability), color: '#52c41a' }
])

// ECharts数据
const powerDataByType = {
  day: { xAxis: ['00:00','02:00','04:00','06:00','08:00','10:00','12:00','14:00','16:00','18:00','20:00','22:00'], data: [0,0,0,0,220,780,1200,980,650,320,0,0] },
  month: { xAxis: ['1日','5日','10日','15日','20日','25日','30日'], data: [4200,4800,5100,3900,4600,5200,4500] },
  year: { xAxis: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'], data: [120,135,158,175,198,220,245,238,195,165,140,118] },
  total: { xAxis: ['2022','2023','2024','2025','2026'], data: [850,920,980,1050,972] }
}

const simulateRealtime = () => {
  prevPower.value = realTimePower.value
  realTimePower.value = Math.max(0, Math.round(1680 + (Math.random() - 0.5) * 168))
  tempDisplay.value = { moduleTemp: (42 + Math.random() * 8).toFixed(1), envTemp: (22 + Math.random() * 6).toFixed(1) }
}

const initGauge = () => {
  if (!gaugeRef.value) return; if (gaugeChart) gaugeChart.dispose()
  gaugeChart = echarts.init(gaugeRef.value)
  const capacity = totalCapacity.value
  gaugeChart.setOption({
    animation: true, animationEasing: 'elasticOut', animationDuration: 800,
    backgroundColor: 'transparent',
    series: [{
      type: 'gauge', center: ['50%', '55%'], radius: '80%', startAngle: 200, endAngle: -20, min: 0, max: capacity,
      axisLabel: { distance: -20, fontSize: 10, color: '#999', formatter: v => Math.round(v / capacity * 100) + '%' },
      axisTick: { distance: -15, length: 5, lineStyle: { color: '#ddd' } },
      splitLine: { distance: -15, length: 10, lineStyle: { color: '#ddd' } },
      axisLine: { lineStyle: { width: 14, color: [[1, '#e9eef4']] } },
      progress: { show: true, width: 14, itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: '#ff9a42' }, { offset: 1, color: '#ff6b00' }]) } },
      pointer: { length: '55%', width: 5, itemStyle: { color: '#ff6b00' } },
      anchor: { size: 10, itemStyle: { color: '#ff6b00' } },
      title: { show: false },
      detail: { fontSize: 24, fontWeight: 700, color: '#ff6b00', offsetCenter: [0, '35%'], formatter: '{value} kW' },
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
    animation: false, backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(50,50,50,0.9)', textStyle: { color: '#ff9a42', fontSize: 12 } },
    grid: { left: '2%', right: '2%', top: '8%', bottom: '14%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, axisLine: { lineStyle: { color: '#e5e5e5' } }, axisTick: { show: false }, axisLabel: { color: '#888', fontSize: 11 }, data: c.xAxis },
    yAxis: { type: 'value', axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: '#f0f0f0' } }, axisLabel: { color: '#888', fontSize: 11 } },
    series: [{ type: 'line', smooth: true, symbol: 'none', lineStyle: { color: '#ff9a42', width: 2.5 }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(255,154,66,0.2)' }, { offset: 1, color: 'rgba(255,154,66,0)' }]) }, data: c.data }]
  })
}

const initTempChart = () => {
  if (!tempChartRef.value) return; if (tempChart) tempChart.dispose()
  tempChart = echarts.init(tempChartRef.value)
  tempChart.setOption({
    animation: false, backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(50,50,50,0.9)', textStyle: { color: '#e8eaf0', fontSize: 12 } },
    grid: { left: '2%', right: '2%', top: '8%', bottom: '5%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, axisLine: { lineStyle: { color: '#e5e5e5' } }, axisTick: { show: false }, axisLabel: { color: '#888', fontSize: 11 }, data: ['00:00','02:00','04:00','06:00','08:00','10:00','12:00','14:00','16:00','18:00','20:00','22:00'] },
    yAxis: { type: 'value', min: 0, max: 60, axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } }, axisLabel: { color: '#888', fontSize: 11, formatter: '{value}°C' } },
    series: [
      { name: '组件温度', type: 'line', smooth: true, symbol: 'none', lineStyle: { color: '#ff6b00', width: 2 }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(255,107,0,0.15)' }, { offset: 1, color: 'rgba(255,107,0,0)' }]) }, data: [18,17,16,17,25,35,45,48,42,35,26,20] },
      { name: '环境温度', type: 'line', smooth: true, symbol: 'none', lineStyle: { color: '#409EFF', width: 2 }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(64,158,255,0.15)' }, { offset: 1, color: 'rgba(64,158,255,0)' }]) }, data: [15,14,13,14,20,25,28,30,27,23,18,16] }
    ]
  })
}

// 展开时初始化对应图表
watch(() => expanded.powerDetail, (v) => { if (v) nextTick(() => { initGauge(); powerChart?.resize() }) })
watch(() => expanded.temp, (v) => { if (v) nextTick(() => initTempChart()) })

const handleResize = () => { requestAnimationFrame(() => { gaugeChart?.resize(); powerChart?.resize(); tempChart?.resize() }) }

onMounted(() => {
  window.addEventListener('resize', handleResize); realData.value = MOCK_DATA
  updateTime(); setInterval(updateTime, 1000)
  nextTick(() => initPowerChart())
  refreshTimer = setInterval(simulateRealtime, 5000)
})
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (refreshTimer) clearInterval(refreshTimer)
  gaugeChart?.dispose(); powerChart?.dispose(); tempChart?.dispose()
})
</script>

<style scoped>
.pv-progressive {
  min-height: 100vh; background: #f5f6f8; color: #1d2129;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  padding: 0; line-height: 1.5;
}

/* ===== 顶部状态条 ===== */
.status-bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 24px; background: #fff; border-bottom: 1px solid #e8e8ec;
  position: sticky; top: 0; z-index: 10;
}
.sb-left, .sb-right { display: flex; align-items: center; gap: 8px; }
.sb-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.dot-running { background: #52c41a; box-shadow: 0 0 6px rgba(82,196,26,0.4); animation: pulse 2s infinite; }
.dot-stopped { background: #ff4757; box-shadow: 0 0 6px rgba(255,71,87,0.4); }
@keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(82,196,26,0.4); } 70% { box-shadow: 0 0 0 8px rgba(82,196,26,0); } 100% { box-shadow: 0 0 0 0 rgba(82,196,26,0); } }
.sb-status { font-size: 13px; font-weight: 700; color: #52c41a; }
.sb-divider { color: #d0d0d0; font-size: 12px; }
.sb-label { font-size: 12px; color: #888; }
.sb-power { font-size: 14px; font-weight: 800; color: #ff6b00; }
.sb-power.val-danger { color: #ff4757; }
.sb-trend { font-size: 11px; font-weight: 700; }
.trend-up { color: #52c41a; }
.trend-down { color: #ff4757; }
.sb-weather { display: flex; align-items: center; gap: 4px; font-size: 12px; color: #666; }
.sb-time { font-size: 12px; color: #888; font-variant-numeric: tabular-nums; font-weight: 600; }

/* ===== 核心概览 ===== */
.core-overview {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
  padding: 20px 24px;
}
.co-item {
  display: flex; align-items: center; gap: 12px; padding: 16px 20px;
  background: #fff; border-radius: 12px; position: relative;
  transition: transform 0.2s, box-shadow 0.2s;
}
.co-item:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.08); }
.co-content { flex: 1; min-width: 0; }
.co-value { font-size: 22px; font-weight: 800; line-height: 1.2; font-variant-numeric: tabular-nums; }
.co-label { font-size: 12px; color: #888; margin-top: 2px; }
.co-trend { font-size: 11px; font-weight: 700; }
.co-progress { position: absolute; bottom: 0; left: 12px; right: 12px; height: 3px; background: #f0f0f0; border-radius: 0 0 12px 12px; overflow: hidden; }
.co-bar { height: 100%; border-radius: 2px; transition: width 0.8s ease-out; }

/* ===== 图表卡片 ===== */
.section-always { padding: 0 24px 16px; }
.chart-card { background: #fff; border-radius: 12px; overflow: hidden; }
.no-border { border-radius: 0; }
.card-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; border-bottom: 1px solid #f0f0f0; flex-wrap: wrap; gap: 8px; }
.ch-left { display: flex; align-items: center; gap: 8px; }
.ch-title { font-size: 15px; font-weight: 700; }
.ch-tools { display: flex; align-items: center; gap: 6px; }
.pill-btn { padding: 4px 14px; border: 1px solid #e0e0e0; background: #fff; color: #888; font-size: 12px; cursor: pointer; border-radius: 20px; transition: all 0.2s; font-weight: 600; }
.pill-btn:hover { border-color: #ff9a42; color: #ff9a42; }
.pill-btn.active { background: #ff9a42; border-color: #ff9a42; color: #fff; }
.chart-area { padding: 8px 12px; }
.chart-canvas { width: 100%; height: 240px; }

/* ===== 社会贡献横幅 ===== */
.social-banner {
  display: flex; justify-content: center; gap: 0; margin: 0 24px 8px;
  background: #fff; border-radius: 12px; padding: 14px 0; overflow: hidden;
}
.sb-item { display: flex; align-items: center; gap: 6px; padding: 0 24px; }
.sb-item:not(:last-child) { border-right: 1px solid #f0f0f0; }
.sb-val { font-size: 18px; font-weight: 800; font-variant-numeric: tabular-nums; }
.sb-unit-text { font-size: 11px; color: #888; }
.sb-name { font-size: 11px; color: #aaa; margin-left: 4px; }

/* ===== 折叠区域 ===== */
.collapsible-section { margin: 8px 24px; }
.collapse-toggle {
  width: 100%; display: flex; align-items: center; gap: 8px;
  padding: 12px 16px; background: #fff; border: 1px solid #e8e8ec;
  border-radius: 10px; cursor: pointer; font-size: 14px; font-weight: 700;
  color: #1d2129; transition: all 0.2s; text-align: left;
}
.collapse-toggle:hover { border-color: #ff9a42; color: #ff6b00; }
.toggle-summary { font-size: 12px; color: #aaa; font-weight: 400; margin-left: 8px; flex: 1; }
.toggle-arrow { font-size: 12px; color: #ff9a42; font-weight: 600; }
.collapse-body { background: #fff; border: 1px solid #e8e8ec; border-top: none; border-radius: 0 0 10px 10px; padding: 20px; }

/* 展开/收起动画 */
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.3s ease-out; overflow: hidden; }
.slide-down-enter-from, .slide-down-leave-to { max-height: 0; opacity: 0; padding-top: 0; padding-bottom: 0; }
.slide-down-enter-to, .slide-down-leave-from { max-height: 800px; opacity: 1; }

/* 功率详情网格 */
.power-detail-grid { display: flex; gap: 20px; }
.gauge-area { flex: 0 0 240px; }
.gauge-canvas { width: 240px; height: 220px; }
.kpi-detail-grid { flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
.kpi-row-item { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-bottom: 1px solid #f5f5f5; }
.kpi-row-item:nth-child(odd) { border-right: 1px solid #f5f5f5; }
.kpi-label { font-size: 12px; color: #888; }
.kpi-value { font-size: 14px; font-weight: 700; font-variant-numeric: tabular-nums; }
.kpi-sub { font-size: 11px; color: #aaa; margin-left: 4px; }

/* 评估矩阵 */
.eval-matrix { display: flex; flex-direction: column; gap: 16px; }
.eval-bar-item {}
.eb-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.eb-label { font-size: 13px; color: #666; }
.eb-value { font-size: 15px; font-weight: 800; font-variant-numeric: tabular-nums; }
.eb-bar { height: 6px; background: #f0f0f0; border-radius: 3px; overflow: hidden; }
.eb-fill { height: 100%; border-radius: 3px; transition: width 0.8s ease-out; }

/* 温度头部 */
.temp-header { display: flex; align-items: center; gap: 6px; padding: 8px 16px; font-size: 13px; color: #666; }
.th-dot { width: 10px; height: 10px; border-radius: 50%; }
.th-dot.orange { background: #ff6b00; }
.th-dot.blue { background: #409EFF; }
.th-sep { color: #ddd; }

:deep(.el-date-editor) { width: 130px !important; }
:deep(.el-input__wrapper) { border-radius: 20px !important; box-shadow: none !important; }
:deep(.el-input__inner) { font-size: 12px !important; }

@media (max-width: 768px) {
  .core-overview { grid-template-columns: repeat(2, 1fr); gap: 10px; padding: 12px; }
  .social-banner { flex-wrap: wrap; gap: 8px; }
  .sb-item { padding: 0 12px; }
  .power-detail-grid { flex-direction: column; }
  .gauge-area { flex: auto; }
  .gauge-canvas { width: 100%; height: 200px; }
}
</style>
