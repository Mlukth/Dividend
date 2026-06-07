<template>
  <div class="pv-page">
    <!-- ═══ 顶部状态条 ═══ -->
    <div class="status-strip">
      <div class="strip-left">
        <span class="status-dot" :class="runStatus === '停机' ? 'dot-danger' : 'dot-ok'"></span>
        <span class="strip-power">{{ realTimePower.toLocaleString() }} kW</span>
        <span class="strip-trend" :class="powerTrend.dir">
          <el-icon :size="12"><CaretTop v-if="powerTrend.dir==='up'" /><CaretBottom v-else-if="powerTrend.dir==='down'" /><Minus v-else /></el-icon>
          {{ powerTrend.text }}
        </span>
      </div>
      <div class="strip-right">
        <span class="strip-weather">
          <el-icon :size="14"><Sunny /></el-icon> 32°C 晴
        </span>
        <span class="strip-clock">{{ currentTime }}</span>
      </div>
    </div>

    <!-- ═══ 第一行：仪表盘 + KPI ═══ -->
    <div class="row-top">
      <div class="gauge-panel">
        <div class="gauge-chart" ref="gaugeRef"></div>
        <div class="gauge-center-info">
          <span class="gauge-value" :class="{ 'value-flash': flashFlags.power }">{{ realTimePower.toLocaleString() }}</span>
          <span class="gauge-unit">kW</span>
        </div>
        <div class="gauge-footer">
          <span>组件总容量：{{ totalCapacity.toLocaleString() }} kWp</span>
          <span :class="powerRatio > 90 ? 'text-danger' : 'text-muted'">功率占比 {{ powerRatio }}%</span>
        </div>
      </div>

      <div class="kpi-area">
        <!-- 当日发电量 -->
        <div class="kpi-card" :class="{ 'kpi-flash': flashFlags.todayEnergy }">
          <div class="kpi-header">
            <span class="kpi-icon-wrap orange"><el-icon :size="16"><Odometer /></el-icon></span>
            <span class="kpi-label">当日发电量</span>
            <span class="kpi-badge" v-if="todayEnergyChange !== '--'" :class="todayEnergyChange.startsWith('+') ? 'badge-up' : 'badge-down'">
              {{ todayEnergyChange }}
            </span>
          </div>
          <div class="kpi-body">
            <span class="kpi-value">{{ todayEnergy }}</span>
            <span class="kpi-unit">kWh</span>
          </div>
          <div class="kpi-progress-row">
            <span class="kpi-progress-label">日计划完成度</span>
            <div class="kpi-progress-track">
              <div class="kpi-progress-fill" :style="{ width: dailyCompletion + '%', backgroundColor: dailyCompletion >= 80 ? 'var(--color-success)' : dailyCompletion >= 50 ? 'var(--color-primary)' : 'var(--color-warning)' }"></div>
            </div>
            <span class="kpi-progress-pct">{{ dailyCompletion }}%</span>
          </div>
          <div class="kpi-sub-grid">
            <div class="kpi-sub-item">
              <span class="sub-label">较昨日同期</span>
              <span class="sub-value up">+12.3%</span>
            </div>
            <div class="kpi-sub-item">
              <span class="sub-label">累计发电量</span>
              <span class="sub-value">{{ totalEnergy }} kWh</span>
            </div>
          </div>
        </div>

        <!-- 当日收益 -->
        <div class="kpi-card" :class="{ 'kpi-flash': flashFlags.todayProfit }">
          <div class="kpi-header">
            <span class="kpi-icon-wrap gold"><el-icon :size="16"><Coin /></el-icon></span>
            <span class="kpi-label">当日收益</span>
          </div>
          <div class="kpi-body">
            <span class="kpi-value">¥ {{ todayProfit }}</span>
          </div>
          <div class="kpi-sub-grid">
            <div class="kpi-sub-item">
              <span class="sub-label">当年收益</span>
              <span class="sub-value">{{ yearProfit }} 元</span>
            </div>
            <div class="kpi-sub-item">
              <span class="sub-label">累计收益</span>
              <span class="sub-value">{{ totalProfit }} 元</span>
            </div>
            <div class="kpi-sub-item">
              <span class="sub-label">上网电价</span>
              <span class="sub-value">0.4 元/kWh</span>
            </div>
            <div class="kpi-sub-item">
              <span class="sub-label">自用电价</span>
              <span class="sub-value">0.6 元/kWh</span>
            </div>
          </div>
        </div>

        <!-- 系统运行状态 -->
        <div class="kpi-card" :class="{ 'kpi-warning': warningCount > 0, 'kpi-danger': runStatus === '停机' }">
          <div class="kpi-header">
            <span class="kpi-icon-wrap" :class="runStatus === '停机' ? 'red' : 'green'">
              <el-icon :size="16"><Monitor /></el-icon>
            </span>
            <span class="kpi-label">系统运行状态</span>
          </div>
          <div class="kpi-body">
            <span class="kpi-status-dot" :class="runStatus === '停机' ? 'dot-danger-lg' : 'dot-ok-lg'"></span>
            <span class="kpi-status-text" :class="runStatus === '停机' ? 'text-danger' : 'text-success'">{{ runStatus }}</span>
          </div>
          <div class="kpi-sub-grid">
            <div class="kpi-sub-item">
              <span class="sub-label">告警数量</span>
              <span class="sub-value" :class="warningCount > 0 ? 'text-danger' : ''">{{ warningCount }}</span>
            </div>
            <div class="kpi-sub-item">
              <span class="sub-label">逆变器</span>
              <span class="sub-value">{{ inverterOnline }}/{{ inverterTotal }}</span>
            </div>
            <div class="kpi-sub-item">
              <span class="sub-label">日满发小时</span>
              <span class="sub-value">{{ equivalentHours }} h</span>
            </div>
            <div class="kpi-sub-item">
              <span class="sub-label">实时功率占比</span>
              <span class="sub-value" :class="powerRatio > 90 ? 'text-danger' : ''">{{ powerRatio }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ 第二行：趋势图 + 评估 ═══ -->
    <div class="row-chart">
      <div class="chart-panel">
        <div class="panel-header">
          <div class="panel-title-group">
            <span class="panel-title-dot"></span>
            <span class="panel-title">发电功率趋势</span>
          </div>
          <div class="panel-tools">
            <div class="segment-control">
              <button
                v-for="opt in dateTypeOptions"
                :key="opt.value"
                :class="['segment-btn', { active: dateType === opt.value }]"
                @click="dateType = opt.value; updatePowerChart()"
              >{{ opt.label }}</button>
            </div>
            <el-date-picker
              v-model="selectDate"
              :type="dateType === 'month' ? 'month' : 'date'"
              placeholder="选择日期"
              size="default"
              class="picker-override"
            />
          </div>
        </div>
        <div class="chart-area" ref="powerChartRef"></div>
      </div>

      <div class="eval-panel">
        <div class="panel-header">
          <div class="panel-title-group">
            <span class="panel-title-dot eval-dot"></span>
            <span class="panel-title">电站评估</span>
          </div>
        </div>
        <div class="eval-list">
          <div class="eval-item" v-for="item in evalItems" :key="item.label">
            <div class="eval-left">
              <span class="eval-label">{{ item.label }}</span>
            </div>
            <div class="eval-bar-track">
              <div
                class="eval-bar-fill"
                :style="{ width: item.pct + '%', backgroundColor: item.color }"
              ></div>
            </div>
            <div class="eval-right">
              <span class="eval-value" :style="{ color: item.color }">{{ item.display }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ 第三行：温度 + 天气条带 ═══ -->
    <div class="row-temp">
      <div class="temp-panel">
        <div class="panel-header">
          <div class="panel-title-group">
            <span class="panel-title-dot temp-dot"></span>
            <span class="panel-title">温度监测</span>
          </div>
          <div class="temp-header-right">
            <div class="temp-current-values">
              <span class="temp-badge orange"><el-icon :size="12"><Odometer /></el-icon> {{ moduleTemp }}°C</span>
              <span class="temp-badge blue"><el-icon :size="12"><Odometer /></el-icon> {{ envTemp }}°C</span>
            </div>
            <div class="segment-control small">
              <button
                :class="['segment-btn', { active: tempDateType === 'day' }]"
                @click="tempDateType = 'day'"
              >日</button>
              <button
                :class="['segment-btn', { active: tempDateType === 'week' }]"
                @click="tempDateType = 'week'"
              >周</button>
            </div>
          </div>
        </div>
        <!-- 天气条带 -->
        <div class="weather-strip">
          <div class="weather-item" v-for="day in weatherData" :key="day.label">
            <el-icon :size="14"><component :is="day.icon" /></el-icon>
            <span class="weather-label">{{ day.label }}</span>
            <span class="weather-temp">{{ day.temp }}°C</span>
            <span class="weather-desc">{{ day.desc }}</span>
          </div>
        </div>
        <div class="chart-area temp-chart" ref="tempChartRef"></div>
      </div>
    </div>

    <!-- ═══ 第四行：社会贡献 ═══ -->
    <div class="row-social">
      <div class="social-tile" v-for="item in socialItems" :key="item.label">
        <div class="tile-icon-wrap" :style="{ backgroundColor: item.iconBg }">
          <el-icon :size="22" :color="item.iconColor"><component :is="item.icon" /></el-icon>
        </div>
        <div class="tile-body">
          <div class="tile-number">
            <span class="tile-value">{{ item.display }}</span>
            <span class="tile-unit">{{ item.unit }}</span>
          </div>
          <div class="tile-label">{{ item.label }}</div>
          <div class="tile-context">{{ item.context }}</div>
        </div>
      </div>
    </div>
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
// 模拟数据
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

const evalItems = computed(() => [
  { label: '综合效率', display: '86.5%', pct: 86.5, color: 'var(--color-primary)' },
  { label: '等效利用小时', display: '3.8 h', pct: 63.3, color: 'var(--color-warning)' },
  { label: '性能比 PR', display: '82.3%', pct: 82.3, color: 'var(--color-primary)' },
  { label: '故障损失', display: '0.05 kWh', pct: 2, color: 'var(--color-success)' },
  { label: '可用率', display: '99.2%', pct: 99.2, color: 'var(--color-success)' },
])

const socialItems = computed(() => {
  const totalKWh = 9725000
  const co2 = (totalKWh * 0.6 / 1000).toFixed(1)
  const coal = (totalKWh * 0.1229 / 1000).toFixed(1)
  const trees = Math.round(parseFloat(co2) * 16.5)
  return [
    { label: 'CO₂减排', display: Number(co2).toLocaleString(), unit: '吨', icon: markRaw(Cloudy), iconBg: 'rgba(255,106,0,0.12)', iconColor: '#ff6b00', context: `相当于 ${Math.round(parseFloat(co2)/2)} 辆汽车年排放` },
    { label: '标煤节约', display: Number(coal).toLocaleString(), unit: '吨', icon: markRaw(Coin), iconBg: 'rgba(212,168,83,0.12)', iconColor: '#d4a853', context: `可供 ${Math.round(parseFloat(coal)*4)} 户家庭月供暖` },
    { label: '等效植树', display: Number(trees).toLocaleString(), unit: '棵', icon: markRaw(Location), iconBg: 'rgba(0,214,143,0.12)', iconColor: '#00d68f', context: `相当于 ${Math.round(trees/2000)} 个足球场森林` },
    { label: '绿色发电', display: '972.5', unit: '万kWh', icon: markRaw(Warning), iconBg: 'rgba(64,158,255,0.12)', iconColor: '#409eff', context: `相当于 ${Math.round(totalKWh/10000/2000*5)} 户家庭年用电` },
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
// 图表实例
// ═══════════════════════════════════════
const gaugeRef = ref(null)
const powerChartRef = ref(null)
const tempChartRef = ref(null)
let gaugeChart = null
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

// ═══════════════════════════════════════
// 仪表盘初始化
// ═══════════════════════════════════════
const initGauge = () => {
  if (!gaugeRef.value) return
  if (gaugeChart) gaugeChart.dispose()
  gaugeChart = echarts.init(gaugeRef.value)
  const capacity = totalCapacity || 500
  const isOverload = realTimePower.value / capacity > 0.9
  const arcColor = isOverload
    ? new echarts.graphic.LinearGradient(0, 0, 1, 0, [
        { offset: 0, color: '#ff4757' },
        { offset: 1, color: '#ff6b81' }
      ])
    : new echarts.graphic.LinearGradient(0, 0, 1, 0, [
        { offset: 0, color: '#ff9a42' },
        { offset: 0.5, color: '#ff7a2f' },
        { offset: 1, color: '#ff6b00' }
      ])
  const pointerColor = isOverload ? '#ff4757' : '#ff6b00'

  gaugeChart.setOption({
    backgroundColor: 'transparent',
    series: [{
      type: 'gauge',
      center: ['50%', '55%'],
      radius: '85%',
      startAngle: 210,
      endAngle: -30,
      min: 0,
      max: capacity,
      splitNumber: 5,
      animationDuration: 1200,
      animationEasingUpdate: 'cubicOut',
      axisLine: {
        lineStyle: {
          width: 14,
          color: [[1, '#eef1f6']]
        }
      },
      progress: {
        show: true,
        width: 14,
        roundCap: true,
        itemStyle: {
          color: arcColor,
          shadowColor: isOverload ? 'rgba(255,71,87,0.35)' : 'rgba(255,106,0,0.3)',
          shadowBlur: 12
        }
      },
      axisTick: {
        distance: -18,
        length: 5,
        lineStyle: { color: '#c5cdd8', width: 1 }
      },
      splitLine: {
        distance: -18,
        length: 12,
        lineStyle: { color: '#c5cdd8', width: 1.5 }
      },
      axisLabel: {
        distance: -28,
        fontSize: 10,
        color: '#8c96a6',
        formatter: (val) => Math.round((val / capacity) * 100) + '%'
      },
      pointer: {
        length: '52%',
        width: 5,
        itemStyle: { color: pointerColor },
        anchor: {
          size: 10,
          itemStyle: {
            color: pointerColor,
            borderColor: '#fff',
            borderWidth: 2
          }
        }
      },
      title: { show: false },
      detail: { show: false },
      data: [{ value: realTimePower.value }]
    }]
  })
}

// ═══════════════════════════════════════
// 趋势图初始化
// ═══════════════════════════════════════
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
      backgroundColor: 'rgba(26, 27, 46, 0.92)',
      borderColor: 'rgba(255,154,66,0.3)',
      borderWidth: 1,
      padding: [12, 16],
      textStyle: { color: '#e8eaf0', fontSize: 13, fontFamily: 'inherit' },
      axisPointer: {
        type: 'cross',
        lineStyle: { color: 'rgba(255,154,66,0.4)', type: 'dashed' },
        crossStyle: { color: 'rgba(255,154,66,0.4)' },
        label: { backgroundColor: '#ff7a2f', color: '#fff', fontSize: 11 }
      },
      formatter: (params) => {
        const p = params[0]
        return `<div style="font-weight:600;margin-bottom:4px">${p.axisValue}</div>
                <div style="display:flex;align-items:center;gap:6px">
                  <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#ff7a2f"></span>
                  功率：<strong style="color:#ff9a42">${p.value} kW</strong>
                </div>`
      }
    },
    grid: {
      left: '3%', right: '4%', top: '12%', bottom: '12%',
      containLabel: true,
      backgroundColor: 'rgba(248,249,251,0.4)',
      show: true,
      borderWidth: 0
    },
    xAxis: {
      type: 'category',
      boundaryGap: !isDay,
      axisLine: { show: true, lineStyle: { color: '#e0e4ea' } },
      axisTick: { show: false },
      axisLabel: { color: '#8c96a6', fontSize: 12, margin: 12 },
      data: config.xAxis
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#eef1f6', type: 'dashed' } },
      axisLabel: { color: '#8c96a6', fontSize: 12 }
    },
    series: [{
      name: '功率',
      type: isDay ? 'line' : 'bar',
      smooth: isDay,
      symbol: isDay ? 'circle' : 'none',
      symbolSize: 6,
      showSymbol: isDay,
      animationDuration: 800,
      animationEasing: 'cubicOut',
      itemStyle: {
        color: '#ff7a2f',
        borderColor: '#fff',
        borderWidth: 2
      },
      lineStyle: isDay ? {
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: '#ff9a42' },
          { offset: 1, color: '#ff6b00' }
        ]),
        width: 3,
        shadowColor: 'rgba(255,106,0,0.2)',
        shadowBlur: 8,
        shadowOffsetY: 4
      } : undefined,
      areaStyle: isDay ? {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(255,154,66,0.25)' },
          { offset: 0.6, color: 'rgba(255,154,66,0.08)' },
          { offset: 1, color: 'rgba(255,154,66,0.01)' }
        ])
      } : undefined,
      barWidth: !isDay ? '40%' : undefined,
      barMaxWidth: !isDay ? 32 : undefined,
      itemStyle: !isDay ? {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#ff9a42' },
          { offset: 1, color: 'rgba(255,154,66,0.4)' }
        ]),
        borderRadius: [4, 4, 0, 0]
      } : undefined,
      emphasis: {
        itemStyle: {
          color: '#ff6b00',
          borderColor: '#ff6b00',
          borderWidth: 2,
          shadowColor: 'rgba(255,106,0,0.4)',
          shadowBlur: 10
        }
      },
      data: config.data
    }]
  }, true)
}

// ═══════════════════════════════════════
// 温度图初始化
// ═══════════════════════════════════════
const initTempChart = () => {
  if (!tempChartRef.value) return
  if (tempChart) tempChart.dispose()
  tempChart = echarts.init(tempChartRef.value)
  tempChart.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(26,27,46,0.92)',
      borderColor: 'rgba(255,154,66,0.3)',
      borderWidth: 1,
      padding: [12, 16],
      textStyle: { color: '#e8eaf0', fontSize: 13, fontFamily: 'inherit' },
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
    grid: {
      left: '3%', right: '4%', top: '8%', bottom: '5%',
      containLabel: true,
      backgroundColor: 'rgba(248,249,251,0.3)',
      show: true,
      borderWidth: 0
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      axisLine: { show: true, lineStyle: { color: '#e0e4ea' } },
      axisTick: { show: false },
      axisLabel: { color: '#8c96a6', fontSize: 11 },
      data: ['00:00','02:00','04:00','06:00','08:00','10:00','12:00','14:00','16:00','18:00','20:00','22:00']
    },
    yAxis: {
      type: 'value',
      min: 0, max: 60,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#eef1f6', type: 'dashed' } },
      axisLabel: { color: '#8c96a6', fontSize: 11, formatter: '{value}°C' }
    },
    series: [
      {
        name: '组件温度', type: 'line', smooth: true, symbol: 'none',
        animationDuration: 800,
        lineStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#ff9a42' }, { offset: 1, color: '#ff6b00' }
          ]),
          width: 2.5,
          shadowColor: 'rgba(255,106,0,0.15)', shadowBlur: 6, shadowOffsetY: 3
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(255,154,66,0.18)' },
            { offset: 1, color: 'rgba(255,154,66,0.01)' }
          ])
        },
        data: [18,17,16,17,25,35,45,48,42,35,26,20]
      },
      {
        name: '环境温度', type: 'line', smooth: true, symbol: 'none',
        animationDuration: 800,
        lineStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#64b5f6' }, { offset: 1, color: '#409eff' }
          ]),
          width: 2.5,
          shadowColor: 'rgba(64,158,255,0.12)', shadowBlur: 6, shadowOffsetY: 3
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64,158,255,0.15)' },
            { offset: 1, color: 'rgba(64,158,255,0.01)' }
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
  initGauge()
}

// ═══════════════════════════════════════
// 时钟
// ═══════════════════════════════════════
const updateClock = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', { hour12: false })
}

// ═══════════════════════════════════════
// 社会贡献数字滚动动画
// ═══════════════════════════════════════
const animatedSocial = ref({ co2: 0, coal: 0, trees: 0, green: 0 })
const animateNumbers = () => {
  const targets = { co2: 6847.1, coal: 1195.5, trees: 112977, green: 972.5 }
  const duration = 2000
  const start = performance.now()
  const step = (now) => {
    const elapsed = now - start
    const progress = Math.min(elapsed / duration, 1)
    const ease = 1 - Math.pow(1 - progress, 3)
    animatedSocial.value.co2 = (targets.co2 * ease).toFixed(1)
    animatedSocial.value.coal = (targets.coal * ease).toFixed(1)
    animatedSocial.value.trees = Math.round(targets.trees * ease)
    animatedSocial.value.green = (targets.green * ease).toFixed(1)
    if (progress < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

// ═══════════════════════════════════════
// 窗口 resize
// ═══════════════════════════════════════
const handleResize = () => {
  requestAnimationFrame(() => {
    gaugeChart?.resize()
    powerChart?.resize()
    tempChart?.resize()
  })
}

// ═══════════════════════════════════════
// 生命周期
// ═══════════════════════════════════════
onMounted(() => {
  updateClock()
  clockTimer = setInterval(updateClock, 1000)
  nextTick(() => {
    initGauge()
    initPowerChart()
    initTempChart()
    animateNumbers()
  })
  refreshTimer = setInterval(simulateRealtime, 5000)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  clearInterval(clockTimer)
  clearInterval(refreshTimer)
  window.removeEventListener('resize', handleResize)
  gaugeChart?.dispose()
  powerChart?.dispose()
  tempChart?.dispose()
})

watch(dateType, () => { updatePowerChart() })
</script>

<style scoped>
/* ═══════════════════════════════════════
   设计系统 Token
   ═══════════════════════════════════════ */
.pv-page {
  /* 色彩 */
  --color-primary: #ff7a2f;
  --color-primary-light: #ff9a42;
  --color-primary-dark: #e86a1f;
  --color-primary-bg: rgba(255,122,47,0.08);
  --color-success: #00d68f;
  --color-success-bg: rgba(0,214,143,0.08);
  --color-warning: #ff9a42;
  --color-warning-bg: rgba(255,154,66,0.08);
  --color-danger: #ff4757;
  --color-danger-bg: rgba(255,71,87,0.08);
  --color-info: #409eff;
  --color-info-bg: rgba(64,158,255,0.08);
  --color-gold: #d4a853;
  --color-gold-bg: rgba(212,168,83,0.08);

  /* 背景 & 表面 */
  --bg-page: #f4f6f9;
  --bg-card: #ffffff;
  --bg-card-hover: #fefefe;
  --bg-inset: #f8f9fb;
  --bg-inset-alt: #f0f2f5;

  /* 文字 */
  --text-primary: #1a1d2e;
  --text-secondary: #5a6070;
  --text-muted: #8c96a6;
  --text-disabled: #c0c6d2;

  /* 边框 */
  --border-light: #eef1f6;
  --border-base: #e0e4ea;
  --border-dark: #c5cdd8;

  /* 间距 (4px 基数) */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;

  /* 字号 */
  --text-xs: 11px;
  --text-sm: 12px;
  --text-base: 13px;
  --text-md: 14px;
  --text-lg: 16px;
  --text-xl: 18px;
  --text-2xl: 22px;
  --text-3xl: 28px;
  --text-4xl: 36px;

  /* 圆角 */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 18px;
  --radius-full: 9999px;

  /* 阴影 */
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04);
  --shadow-hover: 0 12px 32px rgba(0,0,0,0.10), 0 4px 8px rgba(0,0,0,0.05);
  --shadow-primary: 0 4px 16px rgba(255,122,47,0.18);

  /* 过渡 */
  --transition-fast: 150ms ease;
  --transition-base: 250ms ease;
  --transition-slow: 400ms ease;

  /* 容器 */
  width: 100%;
  min-height: calc(100vh - 60px);
  background: var(--bg-page);
  padding: var(--space-6);
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC", "Microsoft YaHei", sans-serif;
  color: var(--text-primary);
  line-height: 1.5;
}

/* ═══════════════════════════════════════
   顶部状态条
   ═══════════════════════════════════════ */
.status-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  padding: 0 var(--space-5);
  background: var(--bg-card);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--space-4);
  font-size: var(--text-md);
}
.strip-left, .strip-right { display: flex; align-items: center; gap: var(--space-3); }
.strip-power { font-weight: 700; font-size: var(--text-lg); color: var(--text-primary); }
.strip-trend { display: inline-flex; align-items: center; gap: 2px; font-size: var(--text-sm); font-weight: 600; }
.strip-trend.up { color: var(--color-success); }
.strip-trend.down { color: var(--color-danger); }
.strip-trend.flat { color: var(--text-muted); }
.strip-weather { display: flex; align-items: center; gap: var(--space-1); color: var(--text-secondary); }
.strip-clock { font-variant-numeric: tabular-nums; color: var(--text-muted); font-size: var(--text-sm); }

/* 状态指示灯 */
.status-dot {
  width: 8px; height: 8px; border-radius: var(--radius-full);
  flex-shrink: 0;
}
.dot-ok { background: var(--color-success); box-shadow: 0 0 0 3px var(--color-success-bg); animation: pulse-green 2s infinite; }
.dot-danger { background: var(--color-danger); box-shadow: 0 0 0 3px var(--color-danger-bg); animation: pulse-red 1.5s infinite; }
.kpi-status-dot { width: 10px; height: 10px; border-radius: var(--radius-full); flex-shrink: 0; }
.dot-ok-lg { background: var(--color-success); box-shadow: 0 0 0 4px var(--color-success-bg); animation: pulse-green 2s infinite; }
.dot-danger-lg { background: var(--color-danger); box-shadow: 0 0 0 4px var(--color-danger-bg); animation: pulse-red 1.5s infinite; }

@keyframes pulse-green {
  0% { box-shadow: 0 0 0 0 rgba(0,214,143,0.4); }
  70% { box-shadow: 0 0 0 8px rgba(0,214,143,0); }
  100% { box-shadow: 0 0 0 0 rgba(0,214,143,0); }
}
@keyframes pulse-red {
  0% { box-shadow: 0 0 0 0 rgba(255,71,87,0.4); }
  70% { box-shadow: 0 0 0 8px rgba(255,71,87,0); }
  100% { box-shadow: 0 0 0 0 rgba(255,71,87,0); }
}

/* ═══════════════════════════════════════
   第一行：仪表盘 + KPI
   ═══════════════════════════════════════ */
.row-top {
  display: flex;
  gap: var(--space-5);
  margin-bottom: var(--space-5);
  min-width: 0;
}

/* 仪表盘面板 */
.gauge-panel {
  position: relative;
  flex: 0 0 300px;
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  padding: var(--space-5) var(--space-4) var(--space-4);
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: box-shadow var(--transition-base);
  overflow: hidden;
}
.gauge-panel::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--color-primary), var(--color-primary-light), transparent);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
}
.gauge-panel:hover { box-shadow: var(--shadow-hover); }
.gauge-chart { width: 260px; height: 220px; }
.gauge-center-info {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -30%);
  text-align: center;
  pointer-events: none;
}
.gauge-value {
  display: block;
  font-size: var(--text-4xl);
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
  transition: color var(--transition-fast);
}
.gauge-unit {
  display: block;
  font-size: var(--text-md);
  color: var(--text-muted);
  margin-top: var(--space-1);
}
.gauge-footer {
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 0 var(--space-2);
  font-size: var(--text-sm);
  color: var(--text-muted);
  margin-top: var(--space-1);
}

/* 数值微闪 */
.value-flash { animation: flash-primary 0.4s ease; }
.kpi-flash { animation: flash-bg 0.4s ease; }
@keyframes flash-primary {
  0% { color: var(--color-primary); }
  100% { color: var(--text-primary); }
}
@keyframes flash-bg {
  0% { background-color: var(--color-primary-bg); }
  100% { background-color: var(--bg-inset); }
}

/* KPI 区域 */
.kpi-area {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
  min-width: 0;
}

.kpi-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  transition: all var(--transition-base);
  border-left: 3px solid transparent;
  cursor: default;
  position: relative;
  overflow: hidden;
}
.kpi-card::after {
  content: '';
  position: absolute;
  top: 0; right: 0; bottom: 0;
  width: 120px;
  background: linear-gradient(135deg, transparent 60%, rgba(255,122,47,0.03));
  pointer-events: none;
}
.kpi-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-hover);
}
.kpi-card.kpi-warning { border-left-color: var(--color-warning); background: linear-gradient(135deg, var(--bg-card), var(--color-warning-bg)); }
.kpi-card.kpi-danger { border-left-color: var(--color-danger); background: linear-gradient(135deg, var(--bg-card), var(--color-danger-bg)); }

.kpi-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.kpi-icon-wrap {
  width: 32px; height: 32px;
  border-radius: var(--radius-sm);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.kpi-icon-wrap.orange { background: var(--color-primary-bg); color: var(--color-primary); }
.kpi-icon-wrap.gold { background: var(--color-gold-bg); color: var(--color-gold); }
.kpi-icon-wrap.green { background: var(--color-success-bg); color: var(--color-success); }
.kpi-icon-wrap.red { background: var(--color-danger-bg); color: var(--color-danger); }

.kpi-label { font-size: var(--text-md); color: var(--text-secondary); font-weight: 500; }
.kpi-badge {
  margin-left: auto;
  font-size: var(--text-xs);
  font-weight: 700;
  padding: 2px 8px;
  border-radius: var(--radius-full);
}
.badge-up { background: var(--color-success-bg); color: var(--color-success); }
.badge-down { background: var(--color-danger-bg); color: var(--color-danger); }

.kpi-body {
  display: flex;
  align-items: baseline;
  gap: var(--space-1);
}
.kpi-value {
  font-size: var(--text-2xl);
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}
.kpi-unit { font-size: var(--text-md); color: var(--text-muted); font-weight: 400; }
.kpi-status-text { font-size: var(--text-xl); font-weight: 700; }

/* 进度行 */
.kpi-progress-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.kpi-progress-label { font-size: var(--text-xs); color: var(--text-muted); white-space: nowrap; }
.kpi-progress-track {
  flex: 1;
  height: 4px;
  background: var(--bg-inset-alt);
  border-radius: var(--radius-full);
  overflow: hidden;
}
.kpi-progress-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.5s ease;
}
.kpi-progress-pct { font-size: var(--text-xs); font-weight: 700; color: var(--text-secondary); min-width: 32px; text-align: right; }

/* 子网格 */
.kpi-sub-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-2) var(--space-4);
  padding-top: var(--space-2);
  border-top: 1px solid var(--border-light);
}
.kpi-sub-item { display: flex; flex-direction: column; gap: 2px; }
.sub-label { font-size: var(--text-xs); color: var(--text-muted); line-height: 1.3; }
.sub-value { font-size: var(--text-sm); font-weight: 600; color: var(--text-primary); line-height: 1.3; }
.sub-value.up { color: var(--color-success); }

/* ═══════════════════════════════════════
   第二行：趋势图 + 评估
   ═══════════════════════════════════════ */
.row-chart {
  display: flex;
  gap: var(--space-5);
  margin-bottom: var(--space-5);
  min-width: 0;
}

.chart-panel {
  flex: 1;
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  padding: var(--space-5);
  min-width: 0;
  overflow: hidden;
  transition: box-shadow var(--transition-base);
}
.chart-panel:hover { box-shadow: var(--shadow-hover); }

.eval-panel {
  flex: 0 0 260px;
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  padding: var(--space-5);
  transition: box-shadow var(--transition-base);
}
.eval-panel:hover { box-shadow: var(--shadow-hover); }

/* 面板头部 */
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
  min-width: 0;
}
.panel-title-group { display: flex; align-items: center; gap: var(--space-2); }
.panel-title-dot {
  width: 6px; height: 6px; border-radius: var(--radius-full);
  background: var(--color-primary);
  box-shadow: 0 0 6px rgba(255,122,47,0.4);
}
.panel-title-dot.eval-dot { background: var(--color-success); box-shadow: 0 0 6px rgba(0,214,143,0.4); }
.panel-title-dot.temp-dot { background: var(--color-info); box-shadow: 0 0 6px rgba(64,158,255,0.4); }
.panel-title { font-size: var(--text-lg); font-weight: 700; color: var(--text-primary); }
.panel-tools { display: flex; align-items: center; gap: var(--space-3); flex-wrap: wrap; }

/* 胶囊分段控件 */
.segment-control {
  display: inline-flex;
  background: var(--bg-inset);
  border-radius: var(--radius-full);
  padding: 3px;
  gap: 2px;
}
.segment-control.small .segment-btn { padding: 4px 12px; font-size: var(--text-sm); }
.segment-btn {
  padding: 6px 16px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-size: var(--text-base);
  font-weight: 500;
  cursor: pointer;
  border-radius: var(--radius-full);
  transition: all var(--transition-fast);
  font-family: inherit;
  line-height: 1.4;
}
.segment-btn:hover { color: var(--text-secondary); background: rgba(255,255,255,0.6); }
.segment-btn.active {
  background: var(--color-primary);
  color: #fff;
  box-shadow: var(--shadow-primary);
  font-weight: 600;
}

/* 图表区域 */
.chart-area {
  width: 100%;
  height: 280px;
  min-width: 0;
}

/* 评估列表 */
.eval-list { display: flex; flex-direction: column; gap: var(--space-4); }
.eval-item { display: flex; align-items: center; gap: var(--space-3); }
.eval-left { min-width: 80px; }
.eval-label { font-size: var(--text-md); color: var(--text-secondary); white-space: nowrap; }
.eval-bar-track {
  flex: 1;
  height: 6px;
  background: var(--bg-inset-alt);
  border-radius: var(--radius-full);
  overflow: hidden;
}
.eval-bar-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
}
.eval-right { min-width: 64px; text-align: right; }
.eval-value { font-size: var(--text-md); font-weight: 700; font-variant-numeric: tabular-nums; }

/* ═══════════════════════════════════════
   第三行：温度 + 天气条带
   ═══════════════════════════════════════ */
.row-temp {
  margin-bottom: var(--space-5);
  min-width: 0;
}

.temp-panel {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  padding: var(--space-5);
  min-width: 0;
  overflow: hidden;
  transition: box-shadow var(--transition-base);
}
.temp-panel:hover { box-shadow: var(--shadow-hover); }

.temp-header-right {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.temp-current-values {
  display: flex;
  gap: var(--space-2);
}
.temp-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.temp-badge.orange { background: var(--color-primary-bg); color: var(--color-primary); }
.temp-badge.blue { background: var(--color-info-bg); color: var(--color-info); }

.temp-chart { height: 200px; }

/* 天气条带 */
.weather-strip {
  display: flex;
  gap: var(--space-6);
  padding: var(--space-2) 0 var(--space-3);
  margin-bottom: var(--space-3);
  border-bottom: 1px solid var(--border-light);
}
.weather-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-md);
  color: var(--text-secondary);
}
.weather-label { color: var(--text-muted); font-size: var(--text-sm); }
.weather-temp { font-weight: 700; color: var(--text-primary); font-variant-numeric: tabular-nums; }
.weather-desc { color: var(--text-muted); font-size: var(--text-sm); }

/* ═══════════════════════════════════════
   第四行：社会贡献
   ═══════════════════════════════════════ */
.row-social {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-4);
}

.social-tile {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--space-5);
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
  transition: all var(--transition-base);
  cursor: default;
  position: relative;
  overflow: hidden;
}
.social-tile::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--color-primary), transparent);
  opacity: 0;
  transition: opacity var(--transition-base);
}
.social-tile:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-hover);
}
.social-tile:hover::after { opacity: 1; }

.tile-icon-wrap {
  width: 48px; height: 48px;
  border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  transition: transform var(--transition-base);
}
.social-tile:hover .tile-icon-wrap { transform: scale(1.08); }

.tile-body { min-width: 0; }
.tile-number { display: flex; align-items: baseline; gap: var(--space-1); }
.tile-value {
  font-size: var(--text-3xl);
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}
.tile-unit { font-size: var(--text-md); color: var(--text-muted); font-weight: 400; }
.tile-label { font-size: var(--text-md); color: var(--text-secondary); margin-top: var(--space-1); }
.tile-context { font-size: var(--text-xs); color: var(--text-muted); margin-top: var(--space-1); line-height: 1.4; }

/* ═══════════════════════════════════════
   通用工具
   ═══════════════════════════════════════ */
.text-success { color: var(--color-success) !important; }
.text-danger { color: var(--color-danger) !important; }
.text-warning { color: var(--color-warning) !important; }
.text-muted { color: var(--text-muted) !important; }

/* Element Plus 日期选择器覆盖 */
.picker-override :deep(.el-input__wrapper) {
  border-radius: var(--radius-full) !important;
  box-shadow: 0 0 0 1px var(--border-base) inset !important;
}
.picker-override :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px var(--color-primary) inset !important;
}

/* Radio 按钮覆盖 */
:deep(.el-radio-button__inner) {
  border-radius: var(--radius-full) !important;
  font-family: inherit !important;
}
:deep(.el-radio-button__orig-radio:checked + .el-radio-button__inner) {
  background-color: var(--color-primary) !important;
  border-color: var(--color-primary) !important;
  box-shadow: var(--shadow-primary) !important;
}

/* ═══════════════════════════════════════
   响应式
   ═══════════════════════════════════════ */
@media (max-width: 1200px) {
  .row-top { flex-direction: column; }
  .gauge-panel { flex: none; width: 100%; }
  .gauge-chart { width: 200px; height: 180px; }
  .gauge-center-info { transform: translate(-50%, -25%); }
  .kpi-area { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 960px) {
  .kpi-area { grid-template-columns: 1fr; }
  .row-chart { flex-direction: column; }
  .eval-panel { flex: none; width: 100%; }
  .eval-list { flex-direction: row; flex-wrap: wrap; }
  .eval-item { flex: 1 1 45%; min-width: 200px; }
  .row-social { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 600px) {
  .pv-page { padding: var(--space-3); }
  .status-strip { flex-direction: column; height: auto; padding: var(--space-2) var(--space-3); gap: var(--space-2); }
  .row-social { grid-template-columns: 1fr; }
  .weather-strip { flex-direction: column; gap: var(--space-2); }
  .panel-header { flex-direction: column; align-items: flex-start; gap: var(--space-2); }
  .temp-header-right { flex-wrap: wrap; }
}

/* ═══════════════════════════════════════
   减少动画偏好
   ═══════════════════════════════════════ */
@media (prefers-reduced-motion: reduce) {
  .dot-ok, .dot-danger, .dot-ok-lg, .dot-danger-lg { animation: none !important; }
  .kpi-card, .social-tile, .gauge-panel, .chart-panel, .temp-panel, .eval-panel { transition: none !important; }
  .kpi-card:hover, .social-tile:hover { transform: none !important; }
  .kpi-progress-fill, .eval-bar-fill { transition: none !important; }
  .value-flash, .kpi-flash { animation: none !important; }
}
</style>