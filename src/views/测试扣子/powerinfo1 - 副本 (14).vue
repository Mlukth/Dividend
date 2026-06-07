<script setup lang="ts">
import { ref, onMounted, onUnmounted, markRaw } from 'vue'
import * as echarts from 'echarts'

/**
 * design-extractor-v3 实测数据驱动的复刻
 * 
 * 数据来源：程序像素级分析
 * 原图尺寸：795x562px
 * 
 * 颜色系统（程序实测，非目测猜测）：
 *   卡片背景: #1F1F1F  (80.7%)
 *   绿色强调: #BAFB6A   (3.7%)
 *   柔绿辅助: #BFD3A7   (3.6%)
 *   橙色强调: #F69B29   (2.5%)
 *   暗绿底色: #5A5640   (2.2%)
 *   灰色中性: #898B80   (1.7%)
 *   白色文字: #E1E2E3   (1.1%)
 *   深色背景: #13130F   (4.6%)
 * 
 * 布局（像素坐标）：
 *   左导航栏: x=0-78   (78px, 占9.8%)
 *   顶栏:     y=0-145   (145px, 占25.8%)
 *   左上卡片: x=81,  y=148, 159x176  (CUSTOMER)
 *   右上卡片: x=258, y=148, 170x176  (PRODUCT)
 *   右侧大卡: x=443, y=148, 352x392  (TIMELINE, 跨上下两排)
 *   左下大卡: x=81,  y=327, 386x213  (PRODUCT)
 *   卡片水平间距: 16px / 22px
 *   卡片垂直间距: 3px (存疑，可能原图更大)
 */

// ── 实测颜色 Token ──
const C = {
  bg:          '#000000',  // 纯黑背景
  card:        '#1F1F1F',  // 卡片背景
  cardDark:    '#13130F',  // 深色卡片变体
  green:       '#BAFB6A',  // 主绿色强调
  greenSoft:   '#BFD3A7',  // 柔绿色
  greenDark:   '#5A5640',  // 暗绿色底
  orange:      '#F69B29',  // 橙色强调
  gray:        '#898B80',  // 灰色中性
  textWhite:   '#E1E2E3',  // 白色文字
  textDim:     '#9C9C9C',  // 暗淡文字
  textMuted:   '#6B6B6B',  // 更暗文字
  pink:        '#F2A0B5',  // 粉色条(实测推算)
  blue:        '#94A4B6',  // 蓝灰色条(实测推算)
}

// ── Refs ──
const lineChartRef = ref<HTMLElement | null>(null)
const dotMatrixRef = ref<HTMLElement | null>(null)
const timelineChartRef = ref<HTMLElement | null>(null)
const progressChartRef = ref<HTMLElement | null>(null)
let charts: echarts.ECharts[] = []
let breathTimer: ReturnType<typeof setInterval> | null = null
let breathPhase = 0

// ── 导航栏图标 ──
const navIcons = ['heart', 'calendar', 'diamond', 'settings']
const navActive = ref(1)

// ── 顶栏按钮 ──
const topTabs = [
  { label: 'Check Box', icon: 'checkbox', active: false },
  { label: 'Monitoring', icon: 'wave', active: true },
  { label: 'Support', icon: 'chat', active: false },
]

// ── CUSTOMER 卡片数据 ──
const customerMetrics = [
  { value: '2,4%', label: 'Web Surfing', trend: 'up' as const },
  { value: '1,1%', label: 'Radio Station', trend: 'up' as const },
]

// ── PRODUCT 卡片数据(上) ──
const productMetrics = [
  { value: '2,8%', label: 'Partners', trend: 'up' as const },
  { value: '3,2%', label: 'Owners', trend: 'up' as const },
]

// ── PRODUCT 卡片数据(下-进度条) ──
const progressItems = [
  { value: 92, type: 'valid' as const },
  { value: 10, type: 'resource' as const },
  { value: 28, type: 'invalid' as const },
  { value: 84, type: 'valid' as const },
  { value: 22, type: 'resource' as const },
  { value: 39, type: 'invalid' as const },
  { value: 25, type: 'valid' as const },
  { value: 15, type: 'resource' as const },
  { value: 19, type: 'valid' as const },
  { value: 8,  type: 'resource' as const },
  { value: 12, type: 'valid' as const },
  { value: 17, type: 'valid' as const },
  { value: 21, type: 'invalid' as const },
]

// ── TIMELINE 甘特图数据 ──
const timelineRows = [
  { date: '30.09', bars: [{ type: 'customer', start: 5, len: 16 }, { type: 'web', start: 22, len: 8 }] },
  { date: '29.09', bars: [{ type: 'product', start: 2, len: 25 }, { type: 'customer', start: 28, len: 2 }] },
  { date: '28.09', bars: [{ type: 'customer', start: 0, len: 11 }, { type: 'web', start: 12, len: 10 }] },
  { date: '27.09', bars: [{ type: 'product', start: 3, len: 21 }, { type: 'pink', start: 25, len: 5 }] },
  { date: '26.09', bars: [{ type: 'web', start: 1, len: 10 }, { type: 'blue', start: 12, len: 15 }] },
  { date: '25.09', bars: [{ type: 'customer', start: 5, len: 19 }, { type: 'web', start: 25, len: 5 }] },
  { date: '24.09', bars: [{ type: 'product', start: 0, len: 8 }, { type: 'web', start: 10, len: 15 }] },
]

const barColorMap: Record<string, string> = {
  customer: C.green,
  product: C.orange,
  web: C.textWhite,
  pink: C.pink,
  blue: C.blue,
}

// ── 折线图 ──
function initLineChart() {
  if (!lineChartRef.value) return
  const chart = echarts.init(lineChartRef.value)
  charts.push(chart)

  // 模拟数据
  const xData = Array.from({ length: 20 }, (_, i) => i)
  const greenLine = [3, 4, 3.5, 5, 4.8, 3.2, 4.5, 5.2, 4.1, 3.8, 5.5, 4.2, 3.6, 4.8, 5.1, 4.3, 3.9, 4.6, 5.3, 4.7]
  const orangeLine = [2, 2.5, 2.2, 3, 2.8, 2.1, 2.6, 3.2, 2.7, 2.3, 3.1, 2.5, 2.8, 3, 2.9, 2.4, 2.6, 2.8, 3.1, 2.7]

  chart.setOption({
    grid: { top: 8, right: 8, bottom: 8, left: 8 },
    xAxis: { type: 'category', show: false, data: xData },
    yAxis: { type: 'value', show: false },
    series: [
      {
        type: 'line',
        data: greenLine,
        smooth: false,
        symbol: 'none',
        lineStyle: { color: C.green, width: 2 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(186,251,106,0.3)' },
            { offset: 1, color: 'rgba(186,251,106,0)' },
          ]),
        },
      },
      {
        type: 'line',
        data: orangeLine,
        smooth: false,
        symbol: 'none',
        lineStyle: { color: C.orange, width: 1.5 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(246,155,41,0.2)' },
            { offset: 1, color: 'rgba(246,155,41,0)' },
          ]),
        },
      },
    ],
  })
}

// ── 点阵图 ──
function initDotMatrix() {
  if (!dotMatrixRef.value) return
  const chart = echarts.init(dotMatrixRef.value)
  charts.push(chart)

  const cols = 12
  const rows = 8
  const data: number[][] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const rand = Math.random()
      let val = 0 // 灰色
      if (rand > 0.65) val = 1 // 绿色
      else if (rand > 0.5) val = 2 // 橙色
      else if (rand > 0.3) val = 3 // 白色
      data.push([c, r, val])
    }
  }

  chart.setOption({
    grid: { top: 8, right: 8, bottom: 8, left: 8 },
    xAxis: { type: 'value', min: -0.5, max: cols - 0.5, show: false },
    yAxis: { type: 'value', min: -0.5, max: rows - 0.5, show: false },
    series: [{
      type: 'scatter',
      data: data,
      symbolSize: 10,
      itemStyle: {
        color: (params: any) => {
          const v = params.value[2]
          if (v === 1) return C.green
          if (v === 2) return C.orange
          if (v === 3) return C.textWhite
          return '#2A2A2A'
        },
      },
    }],
  })

  // 呼吸动效
  breathTimer = setInterval(() => {
    breathPhase = (breathPhase + 1) % 4
    const newData = data.map((d) => {
      const [c, r, v] = d
      if (v === 1 && (c + r) % 4 === breathPhase) {
        return [c, r, 3] // 临时变亮
      }
      if (v === 3 && (c + r) % 4 === (breathPhase + 2) % 4) {
        return [c, r, 1] // 临时变绿
      }
      return d
    })
    chart.setOption({
      series: [{
        data: newData,
        itemStyle: {
          color: (params: any) => {
            const v2 = params.value[2]
            if (v2 === 1) return C.green
            if (v2 === 2) return C.orange
            if (v2 === 3) return C.textWhite
            return '#2A2A2A'
          },
        },
      }],
    })
  }, 800)
}

// ── 进度条图(下排左) ──
function initProgressChart() {
  if (!progressChartRef.value) return
  const chart = echarts.init(progressChartRef.value)
  charts.push(chart)

  const data = progressItems.map((item, i) => ({
    value: item.value,
    itemStyle: {
      color: item.type === 'valid' ? C.green : item.type === 'invalid' ? C.orange : C.textWhite,
      borderRadius: 4,
    },
  }))

  chart.setOption({
    grid: { top: 12, right: 40, bottom: 32, left: 12 },
    xAxis: { type: 'value', show: false, max: 100 },
    yAxis: {
      type: 'category',
      data: progressItems.map((_, i) => ''),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
    },
    series: [{
      type: 'bar',
      data: data,
      barWidth: 10,
      barGap: 4,
      label: {
        show: true,
        position: 'right',
        color: C.textDim,
        fontSize: 10,
        formatter: '{c}',
      },
    }],
  })
}

// ── 甘特图(下排右) ──
function initTimelineChart() {
  if (!timelineChartRef.value) return
  const chart = echarts.init(timelineChartRef.value)
  charts.push(chart)

  const seriesData: any[] = []
  const yData = timelineRows.map(r => r.date)

  timelineRows.forEach((row, rowIdx) => {
    row.bars.forEach(bar => {
      seriesData.push({
        value: [bar.start, rowIdx, bar.start + bar.len, bar.len],
        itemStyle: {
          color: barColorMap[bar.type] || C.textWhite,
          borderRadius: 4,
        },
      })
    })
  })

  chart.setOption({
    grid: { top: 12, right: 20, bottom: 28, left: 48 },
    xAxis: {
      type: 'value',
      min: 0,
      max: 30,
      splitNumber: 6,
      axisLine: { lineStyle: { color: '#333' } },
      axisLabel: { color: C.textMuted, fontSize: 9 },
      splitLine: { lineStyle: { color: '#1A1A1A' } },
    },
    yAxis: {
      type: 'category',
      data: yData,
      axisLine: { lineStyle: { color: '#333' } },
      axisLabel: { color: C.textDim, fontSize: 10 },
      inverse: true,
    },
    series: [{
      type: 'custom',
      renderItem: (params: any, api: any) => {
        const start = api.value(0)
        const yIdx = api.value(1)
        const end = api.value(2)
        const startCoord = api.coord([start, yIdx])
        const endCoord = api.coord([end, yIdx])
        const height = api.size([0, 1])[1] * 0.5
        return {
          type: 'rect',
          shape: {
            x: startCoord[0],
            y: startCoord[1] - height / 2,
            width: endCoord[0] - startCoord[0],
            height: height,
          },
          style: api.style(),
        }
      },
      data: seriesData,
    }],
  })
}

onMounted(() => {
  setTimeout(() => {
    initLineChart()
    initDotMatrix()
    initProgressChart()
    initTimelineChart()
  }, 100)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  charts.forEach(c => c.dispose())
  if (breathTimer) clearInterval(breathTimer)
  window.removeEventListener('resize', handleResize)
})

function handleResize() {
  charts.forEach(c => c.resize())
}
</script>

<template>
  <!-- 
    布局基于实测像素坐标，按比例转换到 CSS
    原图 795x562:
      左导航: 78px = 9.8%
      顶栏: 145px = 25.8%
      卡片区: y=148开始
      水平间距: 16px(2%) / 22px(2.8%)
      左列宽: x81-428 = 347px = 43.6%
      右列宽: x443-795 = 352px = 44.3%
  -->
  <div class="dashboard-root">
    <!-- 左侧垂直导航栏 (实测: 78px宽, 占9.8%) -->
    <aside class="sidebar">
      <div class="sidebar-top">
        <!-- LOGO圆形 -->
        <div class="sidebar-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="4" width="16" height="16" rx="4" stroke="#E1E2E3" stroke-width="2"/>
            <path d="M9 12L11 14L15 10" stroke="#BAFB6A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="sidebar-icons">
          <button
            v-for="(icon, idx) in navIcons"
            :key="icon"
            class="sidebar-btn"
            :class="{ active: navActive === idx }"
            @click="navActive = idx"
          >
            <!-- 心 -->
            <svg v-if="icon === 'heart'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            <!-- 日历 -->
            <svg v-if="icon === 'calendar'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <!-- 钻石 -->
            <svg v-if="icon === 'diamond'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l4 6-10 13L2 9z"/></svg>
            <!-- 齿轮 -->
            <svg v-if="icon === 'settings'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </button>
        </div>
      </div>
      <div class="sidebar-bottom">
        <button class="sidebar-add">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      </div>
    </aside>

    <!-- 主内容区 -->
    <div class="main">
      <!-- 顶栏 (实测: y=0-145, 145px高) -->
      <header class="topbar">
        <div class="topbar-left">
          <!-- LOGO + 品牌名 -->
          <div class="topbar-brand">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="13" stroke="#E1E2E3" stroke-width="2"/>
              <path d="M9 14L12.5 17.5L19 11" stroke="#BAFB6A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="topbar-brand-text">CHECK BOX</span>
          </div>
          <!-- 功能按钮 -->
          <div class="topbar-tabs">
            <button
              v-for="tab in topTabs"
              :key="tab.label"
              class="topbar-tab"
              :class="{ active: tab.active }"
            >
              <svg v-if="tab.icon === 'checkbox'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 12l2 2 4-4"/></svg>
              <svg v-if="tab.icon === 'wave'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0"/><path d="M2 17c2-3 4-3 6 0s4 3 6 0 4-3 6 0"/></svg>
              <svg v-if="tab.icon === 'chat'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              {{ tab.label }}
            </button>
          </div>
          <!-- 搜索 -->
          <button class="topbar-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9C9C9C" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </button>
        </div>
        <div class="topbar-right">
          <!-- 下拉选择框 -->
          <div class="topbar-selects">
            <button class="topbar-select">Date: Now ▾</button>
            <button class="topbar-select">Product: All ▾</button>
            <button class="topbar-select">Profile: Bogdan ▾</button>
          </div>
          <!-- 打印图标 -->
          <button class="topbar-icon-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9C9C9C" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          </button>
          <!-- 用户信息 -->
          <div class="topbar-user">
            <div class="topbar-user-info">
              <span class="topbar-user-name">Bogdan Nikitin</span>
              <span class="topbar-user-handle">@Nikito</span>
            </div>
            <div class="topbar-avatar">
              <div class="topbar-avatar-img">BN</div>
              <div class="topbar-badge">3</div>
            </div>
          </div>
        </div>
      </header>

      <!-- 卡片网格区 -->
      <div class="cards-grid">
        <!-- 左上: CUSTOMER (实测: 159x176, 正方形偏矮) -->
        <div class="card card-customer">
          <div class="card-header">
            <span class="card-title">CUSTOMER</span>
            <button class="card-more">···</button>
          </div>
          <div class="card-metrics">
            <div v-for="m in customerMetrics" :key="m.label" class="metric-row">
              <svg class="metric-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 2L10 7H2L6 2Z" :fill="C.green"/>
              </svg>
              <span class="metric-value">{{ m.value }}</span>
              <span class="metric-label">{{ m.label }}</span>
            </div>
          </div>
          <div ref="lineChartRef" class="card-chart"></div>
        </div>

        <!-- 右上: PRODUCT (实测: 170x176) -->
        <div class="card card-product-top">
          <div class="card-header">
            <span class="card-title">PRODUCT</span>
            <button class="card-more">···</button>
          </div>
          <div class="card-metrics">
            <div v-for="m in productMetrics" :key="m.label" class="metric-row">
              <svg class="metric-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 2L10 7H2L6 2Z" :fill="C.green"/>
              </svg>
              <span class="metric-value">{{ m.value }}</span>
              <span class="metric-label">{{ m.label }}</span>
            </div>
          </div>
          <div ref="dotMatrixRef" class="card-chart"></div>
        </div>

        <!-- 右侧: PROJECTS TIMELINE (实测: x=443-795, y=148-540, 352x392, 跨上下两排) -->
        <div class="card card-timeline">
          <div class="card-header">
            <span class="card-title">PROJECTS TIMELINE</span>
            <button class="card-more">···</button>
          </div>
          <div ref="timelineChartRef" class="card-chart card-chart--tall"></div>
          <div class="card-footer">
            <div class="card-legend">
              <span class="legend-item"><span class="legend-dot" :style="{ background: C.green }"></span>Customer</span>
              <span class="legend-item"><span class="legend-dot" :style="{ background: C.orange }"></span>Product</span>
              <span class="legend-item"><span class="legend-dot" :style="{ background: C.textWhite }"></span>Web</span>
            </div>
            <span class="card-total">Total: 284</span>
          </div>
        </div>

        <!-- 左下: PRODUCT (实测: x=81-428, y=327-540, 347x213) -->
        <div class="card card-product-bottom">
          <div class="card-header">
            <span class="card-title">PRODUCT</span>
            <button class="card-more">···</button>
          </div>
          <div ref="progressChartRef" class="card-chart card-chart--progress"></div>
          <div class="card-footer">
            <div class="card-legend">
              <span class="legend-item"><span class="legend-dot" :style="{ background: C.green }"></span>Valid</span>
              <span class="legend-item"><span class="legend-dot" :style="{ background: C.orange }"></span>Invalid</span>
              <span class="legend-item"><span class="legend-dot" :style="{ background: C.textWhite }"></span>Resources</span>
            </div>
            <span class="card-total">Total: 1,012</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 
  设计 Token - 基于 design-extractor-v3 实测数据
  原图: 795x562px
*/
:root {
  --c-bg:        #000000;
  --c-card:      #1F1F1F;
  --c-card-dark: #13130F;
  --c-green:     #BAFB6A;
  --c-green-soft:#BFD3A7;
  --c-green-dark:#5A5640;
  --c-orange:    #F69B29;
  --c-gray:      #898B80;
  --c-white:     #E1E2E3;
  --c-text-dim:  #9C9C9C;
  --c-text-muted:#6B6B6B;
  --c-pink:      #F2A0B5;
  --c-blue:      #94A4B6;

  /* 间距 - 实测比例 */
  --sidebar-w: 9.8%;       /* 78/795 */
  --topbar-h: 78px;        /* 简化，原图25.8%偏高 */
  --gap-h: 2.0%;           /* 16/795 水平间距 */
  --gap-h2: 2.8%;          /* 22/795 水平间距 */
  --card-radius: 8px;      /* 实测 */
  --card-pad: 16px;        /* 小卡片 */
  --card-pad-lg: 20px;     /* 大卡片 */
}

* { box-sizing: border-box; margin: 0; padding: 0; }

.dashboard-root {
  display: flex;
  width: 100vw;
  height: 100vh;
  background: var(--c-bg);
  color: var(--c-white);
  font-family: -apple-system, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
  overflow: hidden;
}

/* ── 左侧导航栏 ── */
.sidebar {
  width: var(--sidebar-w);
  min-width: 60px;
  max-width: 80px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  background: var(--c-bg);
}

.sidebar-logo {
  margin-bottom: 32px;
}

.sidebar-icons {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sidebar-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--c-text-dim);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.sidebar-btn:hover { background: #1A1A1A; color: var(--c-white); }
.sidebar-btn.active { color: var(--c-green); background: #1A1A1A; }

.sidebar-bottom { display: flex; flex-direction: column; gap: 16px; align-items: center; }

.sidebar-add {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1.5px solid var(--c-text-muted);
  background: transparent;
  color: var(--c-text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.sidebar-add:hover { border-color: var(--c-green); color: var(--c-green); }

/* ── 主内容区 ── */
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ── 顶栏 ── */
.topbar {
  height: var(--topbar-h);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  flex-shrink: 0;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.topbar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.topbar-brand-text {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: var(--c-white);
}

.topbar-tabs {
  display: flex;
  gap: 6px;
}

.topbar-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border: none;
  border-radius: 8px;
  background: #1A1A1A;
  color: var(--c-text-dim);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}
.topbar-tab:hover { background: #252525; }
.topbar-tab.active {
  background: #2A2A2A;
  color: var(--c-white);
  box-shadow: 0 0 8px rgba(186, 251, 106, 0.15);
}

.topbar-search {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: #1A1A1A;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.topbar-selects {
  display: flex;
  gap: 8px;
}

.topbar-select {
  padding: 5px 10px;
  border: none;
  border-radius: 6px;
  background: #1A1A1A;
  color: var(--c-text-dim);
  font-size: 11px;
  cursor: pointer;
}

.topbar-icon-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.topbar-user {
  display: flex;
  align-items: center;
  gap: 10px;
}

.topbar-user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.topbar-user-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--c-white);
}

.topbar-user-handle {
  font-size: 10px;
  color: var(--c-text-muted);
}

.topbar-avatar {
  position: relative;
}

.topbar-avatar-img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #2A2A2A;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: var(--c-green);
}

.topbar-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #E53E3E;
  color: white;
  font-size: 9px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ── 卡片网格 ── */
.cards-grid {
  flex: 1;
  display: grid;
  /*
    实测网格布局:
    左列(43.6%)  | 右列(44.3%)
    左上+右上     | TIMELINE(跨2行)
    左下          | (TIMELINE继续)
  */
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1.2fr;
  gap: 16px;
  padding: 16px 24px 20px;
}

.card {
  background: var(--c-card);
  border-radius: var(--card-radius);
  padding: var(--card-pad);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 左上CUSTOMER: 占第1列第1行 */
.card-customer {
  grid-column: 1;
  grid-row: 1;
}

/* 右上PRODUCT: 占第2列第1行 */
.card-product-top {
  grid-column: 2;
  grid-row: 1;
}

/* 右侧TIMELINE: 占第3列，跨2行 */
.card-timeline {
  grid-column: 3;
  grid-row: 1 / 3;
}

/* 左下PRODUCT: 占第1-2列第2行 */
.card-product-bottom {
  grid-column: 1 / 3;
  grid-row: 2;
}

/* ── 卡片内部 ── */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.card-title {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--c-text-dim);
}

.card-more {
  background: none;
  border: none;
  color: var(--c-text-muted);
  font-size: 16px;
  cursor: pointer;
  padding: 0 4px;
}

.card-metrics {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.metric-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.metric-arrow {
  flex-shrink: 0;
}

.metric-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--c-white);
}

.metric-label {
  font-size: 10px;
  color: var(--c-text-muted);
}

.card-chart {
  flex: 1;
  min-height: 0;
}

.card-chart--tall {
  flex: 1;
}

.card-chart--progress {
  flex: 1;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  border-top: 1px solid #2A2A2A;
  margin-top: 8px;
}

.card-legend {
  display: flex;
  gap: 14px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  color: var(--c-text-dim);
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.card-total {
  font-size: 10px;
  color: var(--c-text-dim);
}
</style>
