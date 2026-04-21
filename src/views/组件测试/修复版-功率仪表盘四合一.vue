<template>
  <div class="gauge-container">
    <div class="header">修复版 · 4款精致仪表盘（天蓝色 | 无空白 | 对标原图）</div>
    <div class="gauge-grid">
      <!-- 版本1 标准复刻（首选） -->
      <div class="gauge-card">
        <div class="label">版本1 标准复刻</div>
        <div ref="chart1" class="gauge-box"></div>
        <div class="desc">组件总容量：2.336MWp</div>
      </div>
      <!-- 版本2 浅蓝柔光 -->
      <div class="gauge-card">
        <div class="label">版本2 浅蓝柔光</div>
        <div ref="chart2" class="gauge-box"></div>
        <div class="desc">组件总容量：2.336MWp</div>
      </div>
      <!-- 版本3 渐变高级 -->
      <div class="gauge-card">
        <div class="label">版本3 渐变高级</div>
        <div ref="chart3" class="gauge-box"></div>
        <div class="desc">组件总容量：2.336MWp</div>
      </div>
      <!-- 版本4 极简纤细 -->
      <div class="gauge-card">
        <div class="label">版本4 极简纤细</div>
        <div ref="chart4" class="gauge-box"></div>
        <div class="desc">组件总容量：2.336MWp</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

// 图表DOM
const chart1 = ref(null)
const chart2 = ref(null)
const chart3 = ref(null)
const chart4 = ref(null)
const chartArr = []

// 【修复版】基础配置 - 保证100%显示 无空白
const getBaseOption = (color) => {
  return {
    backgroundColor: 'transparent',
    series: [
      {
        type: 'gauge',
        startAngle: 200,
        endAngle: -20,
        min: 0,
        max: 100,
        // 仅显示5个刻度文字 对标原图
        axisLabel: {
          distance: -40,
          fontSize: 16,
          color: '#c5c9d2',
          formatter: (val) => [0, 20, 50, 80, 100].includes(val) ? `${val}%` : ''
        },
        // 刻度线 精细匹配
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
        // 背景圆弧 圆角
        axisLine: {
          lineStyle: {
            width: 18,
            color: [[1, '#f1f5fa']],
            cap: 'round'
          }
        },
        // 进度条 必显 圆角
        progress: {
          show: true,
          width: 18,
          cap: 'round',
          itemStyle: { color: color }
        },
        // 指针 必显
        pointer: {
          show: true,
          length: '70%',
          width: 4,
          itemStyle: { color: color }
        },
        // 中心点
        anchor: {
          show: true,
          size: 10,
          itemStyle: { color: color }
        },
        title: { show: false },
        // 中心数值 必显
        detail: {
          show: true,
          fontSize: 40,
          fontWeight: 600,
          color: color,
          offsetCenter: [0, '65%'],
          formatter: '743kW'
        },
        // 固定数值 保证显示
        data: [{ value: 32 }]
      }
    ]
  }
}

// 初始化 全部修复无空白
onMounted(() => {
  const c1 = echarts.init(chart1.value)
  c1.setOption(getBaseOption('#409eff'))
  const c2 = echarts.init(chart2.value)
  c2.setOption(getBaseOption('#66b1ff'))
  const c3 = echarts.init(chart3.value)
  c3.setOption(getBaseOption(new echarts.graphic.LinearGradient(0,0,1,0,[{offset:0,color:'#79bbff'},{offset:1,color:'#409eff'}])))
  const c4 = echarts.init(chart4.value)
  c4.setOption(getBaseOption('#3399ff'))

  chartArr.push(c1,c2,c3,c4)
  window.addEventListener('resize', () => chartArr.forEach(item => item.resize()))
})

onUnmounted(() => {
  window.removeEventListener('resize', () => {})
  chartArr.forEach(item => item.dispose())
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
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  max-width: 1000px;
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