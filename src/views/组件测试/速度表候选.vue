<template>
  <div class="comparison-page">
    <div class="page-title">🔍 仪表盘方案对比 · 六合一平铺视图</div>
    
    <!-- 版本A：加深渐变蓝 · 50%上移（单盘） -->
    <div class="version-section">
      <div class="section-label">🎯 加深渐变蓝 · 50%上移优化</div>
      <div class="gauge-card single-style">
        <div class="time-text">数据上报时间：2026-04-16 10:35:41 5分钟前</div>
        <div ref="deepBlueGauge" class="gauge-box"></div>
        <div class="desc">组件总容量：2.336MWp</div>
      </div>
    </div>

    <!-- 版本B：四版本网格（原修复版） -->
    <div class="version-section">
      <div class="section-label">🌐 四版本网格 · 修复版</div>
      <div class="gauge-grid">
        <div class="gauge-card grid-card">
          <div class="label">版本1 标准复刻</div>
          <div ref="grid1" class="gauge-box"></div>
          <div class="desc">组件总容量：2.336MWp</div>
        </div>
        <div class="gauge-card grid-card">
          <div class="label">版本2 浅蓝柔光</div>
          <div ref="grid2" class="gauge-box"></div>
          <div class="desc">组件总容量：2.336MWp</div>
        </div>
        <div class="gauge-card grid-card">
          <div class="label">版本3 渐变高级</div>
          <div ref="grid3" class="gauge-box"></div>
          <div class="desc">组件总容量：2.336MWp</div>
        </div>
        <div class="gauge-card grid-card">
          <div class="label">版本4 极简纤细</div>
          <div ref="grid4" class="gauge-box"></div>
          <div class="desc">组件总容量：2.336MWp</div>
        </div>
      </div>
    </div>

    <!-- 版本C：极简数字（新增第三版） -->
    <div class="version-section">
      <div class="section-label">📊 版本3 · 极简数字（新增）</div>
      <div class="gauge-card minimal-wrapper">
        <div class="report-time">数据上报时间：2026-04-16 10:35:41 5分钟前</div>
        <div ref="minimalGauge" class="gauge-box"></div>
        <div class="desc">组件总容量：2.336MWp</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

// DOM refs
const deepBlueGauge = ref(null)
const grid1 = ref(null)
const grid2 = ref(null)
const grid3 = ref(null)
const grid4 = ref(null)
const minimalGauge = ref(null)

const chartInstances = []

// ---------- 1. 加深渐变蓝 · 50%上移 (完全保留原配置) ----------
const initDeepBlue = () => {
  if (!deepBlueGauge.value) return
  const chart = echarts.init(deepBlueGauge.value)
  const deepColor = new echarts.graphic.LinearGradient(0, 0, 1, 0, [
    { offset: 0, color: '#2d7dd2' },
    { offset: 1, color: '#1a5aaa' }
  ])
  chart.setOption({
    backgroundColor: 'transparent',
    graphic: [{
      type: 'text',
      left: 'center',
      top: '5%',
      style: { text: '50%', fontSize: 20, fill: '#c5c9d2' }
    }],
    series: [{
      type: 'gauge',
      startAngle: 200, endAngle: -20, min: 0, max: 100,
      axisLabel: {
        distance: -40, fontSize: 16, color: '#c5c9d2',
        formatter: v => [0, 20, 50, 80, 100].includes(v) ? `${v}%` : ''
      },
      axisTick: { show: true, distance: -22, splitNumber: 2, length: 4, lineStyle: { color: '#dfe3e9', width: 1.5 } },
      splitLine: { show: true, distance: -22, length: 8, lineStyle: { color: '#dfe3e9', width: 1.5 } },
      axisLine: { lineStyle: { width: 18, color: [[1, '#f1f5fa']], cap: 'round' } },
      progress: { show: true, width: 18, cap: 'round', itemStyle: { color: deepColor } },
      pointer: { show: true, length: '70%', width: 4, itemStyle: { color: '#1a5aaa' } },
      anchor: { show: true, size: 10, itemStyle: { color: '#1a5aaa' } },
      title: { show: false },
      detail: { show: true, fontSize: 40, fontWeight: 600, color: '#1a5aaa', offsetCenter: [0, '65%'], formatter: '743kW' },
      data: [{ value: 32 }]
    }]
  })
  chartInstances.push(chart)
}

// ---------- 2. 四网格基础配置函数 (保留原修复版) ----------
const getGridOption = (color) => ({
  backgroundColor: 'transparent',
  series: [{
    type: 'gauge',
    startAngle: 200, endAngle: -20, min: 0, max: 100,
    axisLabel: {
      distance: -40, fontSize: 16, color: '#c5c9d2',
      formatter: v => [0, 20, 50, 80, 100].includes(v) ? `${v}%` : ''
    },
    axisTick: { show: true, distance: -22, splitNumber: 2, length: 4, lineStyle: { color: '#dfe3e9', width: 1.5 } },
    splitLine: { show: true, distance: -22, length: 8, lineStyle: { color: '#dfe3e9', width: 1.5 } },
    axisLine: { lineStyle: { width: 18, color: [[1, '#f1f5fa']], cap: 'round' } },
    progress: { show: true, width: 18, cap: 'round', itemStyle: { color } },
    pointer: { show: true, length: '70%', width: 4, itemStyle: { color } },
    anchor: { show: true, size: 10, itemStyle: { color } },
    title: { show: false },
    detail: { show: true, fontSize: 40, fontWeight: 600, color, offsetCenter: [0, '65%'], formatter: '743kW' },
    data: [{ value: 32 }]
  }]
})

const initGridCharts = () => {
  if (grid1.value) {
    const c1 = echarts.init(grid1.value)
    c1.setOption(getGridOption('#409eff'))
    chartInstances.push(c1)
  }
  if (grid2.value) {
    const c2 = echarts.init(grid2.value)
    c2.setOption(getGridOption('#66b1ff'))
    chartInstances.push(c2)
  }
  if (grid3.value) {
    const c3 = echarts.init(grid3.value)
    c3.setOption(getGridOption(
      new echarts.graphic.LinearGradient(0, 0, 1, 0, [
        { offset: 0, color: '#79bbff' },
        { offset: 1, color: '#409eff' }
      ])
    ))
    chartInstances.push(c3)
  }
  if (grid4.value) {
    const c4 = echarts.init(grid4.value)
    c4.setOption(getGridOption('#3399ff'))
    chartInstances.push(c4)
  }
}

// ---------- 3. 极简数字版 (新增第三版，完全保留原风格) ----------
const initMinimal = () => {
  if (!minimalGauge.value) return
  const chart = echarts.init(minimalGauge.value)
  chart.setOption({
    backgroundColor: '#fafafa',
    series: [{
      type: 'gauge',
      center: ['50%', '60%'],
      radius: '95%',
      startAngle: 180,
      endAngle: 0,
      min: 0,
      max: 100,
      splitNumber: 10,
      axisLine: { lineStyle: { width: 6, color: [[1, '#e0e0e0']] } },
      splitLine: { show: false },
      axisTick: { distance: -20, length: 4, lineStyle: { color: '#999', width: 1 } },
      axisLabel: { distance: -30, color: '#999', fontSize: 10, formatter: '{value}' },
      pointer: { show: false },
      detail: { valueAnimation: true, fontSize: 64, fontWeight: '300', color: '#222', formatter: '{value}', offsetCenter: [0, '-20%'] },
      title: { show: true, offsetCenter: [0, '30%'], color: '#666', fontSize: 14, fontWeight: 'normal' },
      data: [{ value: 32, name: '功率占比' }]
    }, {
      type: 'gauge',
      center: ['50%', '60%'],
      radius: '95%',
      startAngle: 180,
      endAngle: 0,
      min: 0,
      max: 100,
      axisLine: { lineStyle: { width: 6, color: [[0.32, '#222']] } },
      splitLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
      pointer: { width: 0, length: 0 },
      anchor: { show: false },
      detail: { show: false },
      data: [{ value: 32 }]
    }]
  })
  chartInstances.push(chart)
}

// 自适应
const handleResize = () => chartInstances.forEach(c => c?.resize())

onMounted(() => {
  initDeepBlue()
  initGridCharts()
  initMinimal()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chartInstances.forEach(c => c?.dispose())
})
</script>

<style scoped>
.comparison-page {
  width: 100%;
  min-height: 100vh;
  padding: 24px 32px;
  box-sizing: border-box;
  background: #f8fafc;
  font-family: "Microsoft YaHei", sans-serif;
}

.page-title {
  font-size: 26px;
  font-weight: 600;
  color: #1e293b;
  text-align: center;
  margin-bottom: 32px;
  letter-spacing: 1px;
}

.version-section {
  margin-bottom: 48px;
  background: #ffffff;
  border-radius: 24px;
  padding: 24px 20px 20px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.04);
}

.section-label {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 24px;
  padding-left: 12px;
  border-left: 6px solid #409eff;
}

/* 通用卡片 */
.gauge-card {
  text-align: center;
}

.single-style {
  max-width: 520px;
  margin: 0 auto;
}

.time-text, .report-time {
  font-size: 15px;
  color: #409eff;
  margin-bottom: 10px;
}

.gauge-box {
  width: 100%;
  height: 300px;
}

.desc {
  font-size: 18px;
  color: #666;
  margin-top: 8px;
}

/* 四网格布局 */
.gauge-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  max-width: 1000px;
  margin: 0 auto;
}

.grid-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 16px 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid #edf2f7;
}

.grid-card .label {
  font-size: 15px;
  font-weight: 500;
  color: #409eff;
  margin-bottom: 8px;
}

.grid-card .gauge-box {
  height: 260px;
}

/* 极简数字版包装 */
.minimal-wrapper {
  max-width: 480px;
  margin: 0 auto;
  background: #fafafa;
  border-radius: 20px;
  padding: 20px 16px;
}

/* 响应式 */
@media (max-width: 800px) {
  .gauge-grid {
    grid-template-columns: 1fr;
  }
}
</style>