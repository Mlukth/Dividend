<template>
  <div class="gauge-container">
    <div class="header">加深版 · 6款精致仪表盘（数值同色 | 加深蓝 | 无空白）</div>
    <div class="gauge-grid">
      <!-- 版本1 标准天蓝色 -->
      <div class="gauge-card">
        <div class="label">版本1 标准天蓝</div>
        <div ref="chart1" class="gauge-box"></div>
        <div class="desc">组件总容量：2.336MWp</div>
      </div>
      <!-- 版本2 浅蓝柔光 -->
      <div class="gauge-card">
        <div class="label">版本2 浅蓝柔光</div>
        <div ref="chart2" class="gauge-box"></div>
        <div class="desc">组件总容量：2.336MWp</div>
      </div>
      <!-- 版本3 加深渐变蓝（按你要求加深） -->
      <div class="gauge-card">
        <div class="label">版本3 加深渐变蓝（推荐）</div>
        <div ref="chart3" class="gauge-box"></div>
        <div class="desc">组件总容量：2.336MWp</div>
      </div>
      <!-- 版本4 深海蓝 -->
      <div class="gauge-card">
        <div class="label">版本4 深海蓝</div>
        <div ref="chart4" class="gauge-box"></div>
        <div class="desc">组件总容量：2.336MWp</div>
      </div>
      <!-- 版本5 科技靛蓝 -->
      <div class="gauge-card">
        <div class="label">版本5 科技靛蓝</div>
        <div ref="chart5" class="gauge-box"></div>
        <div class="desc">组件总容量：2.336MWp</div>
      </div>
      <!-- 版本6 极简深邃蓝 -->
      <div class="gauge-card">
        <div class="label">版本6 极简深邃蓝</div>
        <div ref="chart6" class="gauge-box"></div>
        <div class="desc">组件总容量：2.336MWp</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

const chart1 = ref(null), chart2 = ref(null), chart3 = ref(null)
const chart4 = ref(null), chart5 = ref(null), chart6 = ref(null)
const chartArr = []

// 通用配置（数值同色 + 仅5个刻度 + 圆润圆弧）
const getOption = (color) => {
  return {
    backgroundColor: 'transparent',
    series: [{
      type: 'gauge',
      startAngle: 200,
      endAngle: -20,
      min: 0,
      max: 100,
      axisLabel: {
        distance: -40,
        fontSize: 16,
        color: '#c5c9d2',
        formatter: v => [0,20,50,80,100].includes(v) ? `${v}%` : ''
      },
      axisTick: {
        show: true,
        distance: -22,
        splitNumber: 2,
        length: 4,
        lineStyle: { color: '#dfe3e9', width: 1.5 }
      },
      splitLine: {
        show: true,
        distance: -22,
        length: 8,
        lineStyle: { color: '#dfe3e9', width: 1.5 }
      },
      axisLine: {
        lineStyle: { width: 18, color: [[1, '#f1f5fa']], cap: 'round' }
      },
      progress: {
        show: true,
        width: 18,
        cap: 'round',
        itemStyle: { color: color }
      },
      pointer: {
        show: true,
        length: '70%',
        width: 4,
        itemStyle: { color: color }
      },
      anchor: {
        show: true,
        size: 10,
        itemStyle: { color: color }
      },
      title: { show: false },
      detail: {
        show: true,
        fontSize: 40,
        fontWeight: 600,
        color: color, // 数值同色
        offsetCenter: [0, '65%'],
        formatter: '743kW'
      },
      data: [{ value: 32 }]
    }]
  }
}

onMounted(() => {
  // 版本1
  const c1 = echarts.init(chart1.value)
  c1.setOption(getOption('#409eff'))
  
  // 版本2
  const c2 = echarts.init(chart2.value)
  c2.setOption(getOption('#66b1ff'))
  
  // 版本3（加深渐变蓝）
  const c3 = echarts.init(chart3.value)
  const deepGrad = new echarts.graphic.LinearGradient(0,0,1,0,[
    {offset:0,color:'#2d7dd2'},
    {offset:1,color:'#1a5aaa'}
  ])
  c3.setOption(getOption(deepGrad))
  
  // 版本4
  const c4 = echarts.init(chart4.value)
  c4.setOption(getOption('#1e88e5'))
  
  // 版本5
  const c5 = echarts.init(chart5.value)
  c5.setOption(getOption('#3949ab'))
  
  // 版本6
  const c6 = echarts.init(chart6.value)
  c6.setOption(getOption('#1565c0'))

  chartArr.push(c1,c2,c3,c4,c5,c6)
  window.addEventListener('resize', () => chartArr.forEach(c => c.resize()))
})

onUnmounted(() => {
  window.removeEventListener('resize', () => {})
  chartArr.forEach(c => c.dispose())
})
</script>

<style scoped>
.gauge-container {
  width: 100%;
  min-height: 100vh;
  padding: 20px;
  box-sizing: border-box;
  background: #f5f8ff;
  font-family: "Microsoft YaHei";
}
.header {
  text-align: center;
  font-size: 18px;
  color: #2b5b9e;
  margin-bottom: 24px;
}
.gauge-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  max-width: 1400px;
  margin: 0 auto;
}
.gauge-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(64, 158, 255, 0.08);
}
.label {
  font-size: 14px;
  color: #409eff;
  margin-bottom: 10px;
}
.gauge-box {
  width: 100%;
  height: 280px;
}
.desc {
  font-size: 16px;
  color: #666;
  margin-top: 8px;
}
</style>