<script setup lang="ts">
import { ref, onMounted, onUnmounted, markRaw } from 'vue'
import * as echarts from 'echarts'

// ── Refs ──
const lineChartRef = ref<HTMLElement | null>(null)
const dotMatrixRef = ref<HTMLElement | null>(null)
let lineChart: echarts.ECharts | null = null
let dotChart: echarts.ECharts | null = null
let breathTimer: ReturnType<typeof setInterval> | null = null

// ── Dot matrix state ──
const dotRows = 7
const dotCols = 14
const dots = ref<{ color: string; active: boolean }[]>([])

function initDots() {
  const colors = ['#88D860', '#FF9D3A', '#FFFFFF', '#2A2A2A']
  const weights = [0.25, 0.1, 0.1, 0.55]
  dots.value = Array.from({ length: dotRows * dotCols }, () => {
    const r = Math.random()
    let cum = 0
    for (let i = 0; i < weights.length; i++) {
      cum += weights[i]
      if (r < cum) return { color: colors[i], active: colors[i] !== '#2A2A2A' }
    }
    return { color: '#2A2A2A', active: false }
  })
}

function breatheDots() {
  const count = 4 + Math.floor(Math.random() * 6)
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * dots.value.length)
    const d = dots.value[idx]
    if (d.active) {
      d.color = d.color === '#88D860' ? '#5EA840' : '#88D860'
    }
  }
}

// ── Progress bars data ──
const progressGroups = ref([
  { label: 'Valid', color: '#88D860', items: [12, 92, 24, 84, 28] },
  { label: 'Invalid', color: '#FF9D3A', items: [39, 25, 10] },
  { label: 'Resources', color: '#FFFFFF', items: [17, 21, 15, 19, 8] },
])

// ── Timeline data ──
const timelineRows = ref([
  { name: 'Customer', color: '#88D860', bars: [{ start: 0, end: 3.5, avatar: true }, { start: 5, end: 8 }] },
  { name: 'Product', color: '#FF9D3A', bars: [{ start: 1, end: 4.5 }, { start: 6, end: 9, close: true }] },
  { name: 'Web', color: '#FFFFFF', bars: [{ start: 0, end: 2 }, { start: 3.5, end: 7, fb: true }, { start: 8, end: 10 }] },
  { name: 'Customer', color: '#88D860', bars: [{ start: 2, end: 6 }, { start: 7.5, end: 10 }] },
  { name: 'Product', color: '#FF9D3A', bars: [{ start: 0.5, end: 3 }, { start: 4, end: 7.5 }] },
  { name: 'Web', color: '#FFFFFF', bars: [{ start: 1, end: 5 }, { start: 6.5, end: 9 }] },
])

const timeLabels = ['24:00', '25:00', '26:00', '27:00', '28:00', '29:00', '30:00']

// ── Left nav ──
const navItems = [
  { icon: 'heart', active: false },
  { icon: 'calendar', active: true },
  { icon: 'diamond', active: false },
  { icon: 'gear', active: false },
]

// ── Top tabs ──
const topTabs = [
  { label: 'Check Box', active: false },
  { label: 'Monitoring', active: true },
  { label: 'Support', active: false },
]

// ── ECharts ──
function initLineChart() {
  if (!lineChartRef.value) return
  lineChart = echarts.init(lineChartRef.value, undefined, { renderer: 'canvas' })
  const data = [40, 55, 38, 65, 48, 72, 60, 85, 68, 78, 55, 90, 75, 82, 60, 70, 88, 65, 92, 78]
  lineChart.setOption({
    grid: { top: 10, right: 10, bottom: 20, left: 30 },
    xAxis: {
      type: 'category',
      show: false,
      data: data.map((_, i) => i),
    },
    yAxis: {
      type: 'value',
      show: false,
    },
    series: [{
      type: 'line',
      data,
      smooth: true,
      symbol: 'none',
      lineStyle: {
        width: 2,
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: '#88D860' },
          { offset: 1, color: '#C4E85E' },
        ]),
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(136,216,96,0.25)' },
          { offset: 1, color: 'rgba(136,216,96,0)' },
        ]),
      },
    }],
  })
}

function initDotMatrixChart() {
  if (!dotMatrixRef.value) return
  dotChart = echarts.init(dotMatrixRef.value, undefined, { renderer: 'canvas' })
  renderDotChart()
}

function renderDotChart() {
  if (!dotChart) return
  const scatterData: { value: number[]; itemStyle: { color: string; opacity: number } }[] = []
  dots.value.forEach((d, i) => {
    const row = Math.floor(i / dotCols)
    const col = i % dotCols
    scatterData.push({
      value: [col, dotRows - row],
      itemStyle: {
        color: d.color,
        opacity: d.color === '#2A2A2A' ? 0.4 : 1,
      },
    })
  })
  dotChart.setOption({
    grid: { top: 5, right: 5, bottom: 5, left: 5, containLabel: false },
    xAxis: { type: 'value', show: false, min: -0.5, max: dotCols - 0.5 },
    yAxis: { type: 'value', show: false, min: 0.5, max: dotRows + 0.5 },
    series: [{
      type: 'scatter',
      data: scatterData,
      symbolSize: 14,
      symbol: 'circle',
      itemStyle: { borderWidth: 0 },
    }],
  })
}

// ── Lifecycle ──
onMounted(() => {
  initDots()
  initLineChart()
  initDotMatrixChart()
  breathTimer = setInterval(() => {
    breatheDots()
    renderDotChart()
  }, 800)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  lineChart?.dispose()
  dotChart?.dispose()
  if (breathTimer) clearInterval(breathTimer)
  window.removeEventListener('resize', handleResize)
})

function handleResize() {
  lineChart?.resize()
  dotChart?.resize()
}
</script>

<template>
  <div class="dashboard">
    <!-- ═══ LEFT NAV ═══ -->
    <aside class="left-nav">
      <div class="nav-items">
        <button
          v-for="(item, i) in navItems"
          :key="i"
          class="nav-btn"
          :class="{ active: item.active }"
        >
          <!-- heart -->
          <svg v-if="item.icon === 'heart'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          <!-- calendar -->
          <svg v-if="item.icon === 'calendar'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <!-- diamond -->
          <svg v-if="item.icon === 'diamond'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/><line x1="12" y1="22" x2="12" y2="15.5"/><polyline points="22 8.5 12 15.5 2 8.5"/><polyline points="2 15.5 12 8.5 22 15.5"/><line x1="12" y1="2" x2="12" y2="8.5"/></svg>
          <!-- gear -->
          <svg v-if="item.icon === 'gear'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        </button>
      </div>
      <button class="nav-btn add-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>
    </aside>

    <!-- ═══ MAIN ═══ -->
    <div class="main">
      <!-- ═══ TOP BAR ═══ -->
      <header class="top-bar">
        <div class="top-left">
          <div class="brand-logo">
            <svg viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="13" stroke="#fff" stroke-width="2"/><path d="M9 10h10M9 14h7M9 18h10" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>
          </div>
          <span class="brand-name">CHECK BOX</span>
        </div>

        <div class="top-center">
          <button
            v-for="(tab, i) in topTabs"
            :key="i"
            class="top-tab"
            :class="{ active: tab.active }"
          >
            {{ tab.label }}
          </button>
          <button class="search-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </button>
        </div>

        <div class="top-right">
          <div class="user-info">
            <span class="user-name">Bogdan Nikitin</span>
            <span class="user-handle">@Nikito</span>
          </div>
          <div class="avatar-wrap">
            <div class="avatar">
              <svg viewBox="0 0 32 32" fill="none"><circle cx="16" cy="12" r="5" fill="#888"/><ellipse cx="16" cy="26" rx="9" ry="6" fill="#888"/></svg>
            </div>
            <span class="badge">3</span>
          </div>
          <div class="dropdowns">
            <select class="dd"><option>Date: Now</option></select>
            <select class="dd"><option>Product: All</option></select>
            <select class="dd"><option>Profile: Bogdan</option></select>
          </div>
          <button class="print-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          </button>
        </div>
      </header>

      <!-- ═══ CONTENT ═══ -->
      <div class="content">
        <!-- ── TOP ROW ── -->
        <div class="row top-row">
          <!-- CUSTOMER CARD -->
          <div class="card glow-card">
            <div class="card-header">
              <h3 class="card-title">CUSTOMER</h3>
              <button class="more-btn">
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
              </button>
            </div>
            <div class="card-stats">
              <div class="stat">
                <svg class="arrow-up" viewBox="0 0 16 16" fill="#88D860" width="14" height="14"><path d="M8 2l6 8H2z"/></svg>
                <span class="stat-val">2,4%</span>
                <span class="stat-label">Web Surfing</span>
              </div>
              <div class="stat">
                <svg class="arrow-up" viewBox="0 0 16 16" fill="#88D860" width="14" height="14"><path d="M8 2l6 8H2z"/></svg>
                <span class="stat-val">1,1%</span>
                <span class="stat-label">Radio Station</span>
              </div>
            </div>
            <div ref="lineChartRef" class="chart-area"></div>
          </div>

          <!-- PRODUCT CARD (dot matrix) -->
          <div class="card glow-card">
            <div class="card-header">
              <h3 class="card-title">PRODUCT</h3>
              <button class="more-btn">
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
              </button>
            </div>
            <div class="card-stats">
              <div class="stat">
                <svg class="arrow-up" viewBox="0 0 16 16" fill="#88D860" width="14" height="14"><path d="M8 2l6 8H2z"/></svg>
                <span class="stat-val">2,8%</span>
                <span class="stat-label">Partners</span>
              </div>
              <div class="stat">
                <svg class="arrow-up" viewBox="0 0 16 16" fill="#88D860" width="14" height="14"><path d="M8 2l6 8H2z"/></svg>
                <span class="stat-val">3,2%</span>
                <span class="stat-label">Owners</span>
              </div>
            </div>
            <div ref="dotMatrixRef" class="chart-area"></div>
          </div>
        </div>

        <!-- ── BOTTOM ROW ── -->
        <div class="row bottom-row">
          <!-- PRODUCT (progress bars) -->
          <div class="card glow-card wide">
            <div class="card-header">
              <h3 class="card-title">PRODUCT</h3>
              <button class="more-btn">
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
              </button>
            </div>
            <div class="progress-area">
              <template v-for="group in progressGroups" :key="group.label">
                <div
                  v-for="(val, i) in group.items"
                  :key="group.label + i"
                  class="progress-bar-wrap"
                >
                  <div
                    class="progress-bar"
                    :style="{
                      width: val + '%',
                      backgroundColor: group.color,
                      color: group.color === '#FFFFFF' ? '#222' : '#fff',
                    }"
                  >
                    {{ val }}
                  </div>
                </div>
              </template>
            </div>
            <div class="card-footer">
              <div class="legend">
                <span v-for="group in progressGroups" :key="group.label" class="legend-item">
                  <span class="legend-dot" :style="{ backgroundColor: group.color }"></span>
                  {{ group.label }}
                </span>
              </div>
              <span class="total">Total: 1,012</span>
            </div>
          </div>

          <!-- PROJECTS TIMELINE -->
          <div class="card glow-card wide">
            <div class="card-header">
              <h3 class="card-title">PROJECTS TIMELINE</h3>
              <button class="more-btn">
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
              </button>
            </div>
            <div class="timeline-area">
              <!-- time axis header -->
              <div class="timeline-header">
                <div class="timeline-label-space"></div>
                <div class="timeline-ticks">
                  <span v-for="t in timeLabels" :key="t" class="tick">{{ t }}</span>
                </div>
              </div>
              <!-- rows -->
              <div v-for="(row, ri) in timelineRows" :key="ri" class="timeline-row">
                <div class="timeline-label" :style="{ color: row.color }">
                  <span class="label-dot" :style="{ backgroundColor: row.color }"></span>
                  {{ row.name }}
                </div>
                <div class="timeline-track">
                  <div
                    v-for="(bar, bi) in row.bars"
                    :key="bi"
                    class="timeline-bar"
                    :style="{
                      left: (bar.start / 10 * 100) + '%',
                      width: ((bar.end - bar.start) / 10 * 100) + '%',
                      backgroundColor: row.color,
                      color: row.color === '#FFFFFF' ? '#222' : '#fff',
                    }"
                  >
                    <div v-if="bar.avatar" class="bar-avatar">
                      <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12"><circle cx="10" cy="7" r="3"/><ellipse cx="10" cy="16" rx="5" ry="3"/></svg>
                    </div>
                    <span v-if="bar.close" class="bar-close">&times;</span>
                    <span v-if="bar.fb" class="bar-fb">f</span>
                    {{ (bar.end - bar.start).toFixed(1) }}
                  </div>
                </div>
              </div>
            </div>
            <div class="card-footer">
              <div class="legend">
                <span class="legend-item"><span class="legend-dot" style="background:#88D860"></span> Customer</span>
                <span class="legend-item"><span class="legend-dot" style="background:#FF9D3A"></span> Product</span>
                <span class="legend-item"><span class="legend-dot" style="background:#FFFFFF"></span> Web</span>
              </div>
              <span class="total">Total: 284</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ══════════════════════════════════════
   DESIGN TOKENS
   ══════════════════════════════════════ */
:root {
  --bg: #121212;
  --card: #1E1E1E;
  --border-glow: rgba(136, 216, 96, 0.35);
  --green: #88D860;
  --green-light: #C4E85E;
  --orange: #FF9D3A;
  --white: #FFFFFF;
  --text: #FFFFFF;
  --text-muted: #AAAAAA;
  --text-dim: #666666;
  --nav-bg: #181818;
  --btn-bg: #2A2A2A;
  --radius: 8px;
}

/* ══════════════════════════════════════
   BASE LAYOUT
   ══════════════════════════════════════ */
.dashboard {
  display: flex;
  width: 100vw;
  height: 100vh;
  background: var(--bg);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: var(--text);
  overflow: hidden;
}

/* ══════════════════════════════════════
   LEFT NAV
   ══════════════════════════════════════ */
.left-nav {
  width: 64px;
  background: var(--nav-bg);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
  justify-content: space-between;
  border-right: 1px solid rgba(255,255,255,0.05);
}

.nav-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: var(--text-muted);
  transition: all 0.2s;
}

.nav-btn svg {
  width: 18px;
  height: 18px;
}

.nav-btn:hover {
  background: rgba(255,255,255,0.06);
  color: var(--text);
}

.nav-btn.active {
  background: rgba(136, 216, 96, 0.12);
  color: var(--green);
}

.add-btn {
  color: var(--text-dim);
}

.add-btn:hover {
  background: rgba(255,255,255,0.06);
  color: var(--text);
}

/* ══════════════════════════════════════
   MAIN AREA
   ══════════════════════════════════════ */
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ═══ TOP BAR ═══ */
.top-bar {
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  gap: 24px;
  flex-shrink: 0;
}

.top-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-logo svg {
  width: 28px;
  height: 28px;
}

.brand-name {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--text);
}

.top-center {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  justify-content: center;
}

.top-tab {
  padding: 8px 20px;
  border-radius: 6px;
  border: 1px solid transparent;
  background: var(--btn-bg);
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.top-tab:hover {
  background: #333;
  color: var(--text);
}

.top-tab.active {
  border-color: var(--border-glow);
  box-shadow: 0 0 12px rgba(136, 216, 96, 0.15), inset 0 0 8px rgba(136, 216, 96, 0.06);
  color: var(--text);
}

.search-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: var(--text-muted);
  transition: all 0.2s;
}

.search-btn:hover {
  background: rgba(255,255,255,0.06);
  color: var(--text);
}

.top-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.user-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}

.user-handle {
  font-size: 11px;
  color: var(--text-muted);
}

.avatar-wrap {
  position: relative;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #2A2A2A;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar svg {
  width: 24px;
  height: 24px;
  color: #888;
}

.badge {
  position: absolute;
  top: -3px;
  right: -3px;
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

.dropdowns {
  display: flex;
  gap: 8px;
}

.dd {
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid rgba(255,255,255,0.08);
  background: var(--btn-bg);
  color: var(--text-muted);
  font-size: 11px;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  outline: none;
}

.print-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: var(--text-muted);
  transition: all 0.2s;
}

.print-btn:hover {
  background: rgba(255,255,255,0.06);
  color: var(--text);
}

/* ═══ CONTENT ═══ */
.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  gap: 16px;
  overflow: auto;
}

.row {
  display: flex;
  gap: 16px;
}

.top-row {
  flex: 4;
}

.bottom-row {
  flex: 5;
}

/* ═══ CARD ═══ */
.card {
  background: var(--card);
  border-radius: var(--radius);
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex: 1;
  position: relative;
}

.glow-card {
  border: 1px solid var(--border-glow);
  box-shadow: 0 0 20px rgba(136, 216, 96, 0.06), inset 0 0 12px rgba(136, 216, 96, 0.03);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-title {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 1.5px;
  color: var(--text);
}

.more-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: var(--text-muted);
  transition: all 0.2s;
}

.more-btn:hover {
  background: rgba(255,255,255,0.08);
  color: var(--text);
}

/* ═══ CARD STATS ═══ */
.card-stats {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 6px;
}

.arrow-up {
  flex-shrink: 0;
}

.stat-val {
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
}

.stat-label {
  font-size: 12px;
  color: var(--text-muted);
  margin-left: 4px;
}

/* ═══ CHART AREA ═══ */
.chart-area {
  flex: 1;
  min-height: 0;
}

/* ═══ PROGRESS BARS ═══ */
.progress-area {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-content: flex-start;
}

.progress-bar-wrap {
  width: calc(50% - 4px);
}

.progress-bar {
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  transition: width 0.5s ease;
}

/* ═══ CARD FOOTER ═══ */
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid rgba(255,255,255,0.06);
}

.legend {
  display: flex;
  gap: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-muted);
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.total {
  font-size: 12px;
  color: var(--text-muted);
}

/* ═══ TIMELINE ═══ */
.timeline-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.timeline-header {
  display: flex;
  gap: 12px;
}

.timeline-label-space {
  width: 80px;
  flex-shrink: 0;
}

.timeline-ticks {
  flex: 1;
  display: flex;
  justify-content: space-between;
}

.tick {
  font-size: 10px;
  color: var(--text-dim);
}

.timeline-row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.timeline-label {
  width: 80px;
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.label-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.timeline-track {
  flex: 1;
  position: relative;
  height: 28px;
  background: rgba(255,255,255,0.02);
  border-radius: 4px;
}

.timeline-bar {
  position: absolute;
  top: 2px;
  height: 24px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  min-width: 40px;
  padding: 0 6px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.timeline-bar:hover {
  opacity: 0.85;
}

.bar-avatar svg {
  width: 14px;
  height: 14px;
}

.bar-close {
  font-size: 13px;
  line-height: 1;
}

.bar-fb {
  font-size: 12px;
  font-weight: 800;
}
</style>
