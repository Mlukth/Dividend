<template>
  <div class="gauge-refine-container">
    <!-- 精修复刻版（1:1 原图比例） -->
    <div class="gauge-card">
      <div class="time-text">数据上报时间：2026-04-16 10:35:41 5分钟前</div>
      <div ref="gaugeRef" class="gauge-core"></div>
      <div class="bottom-text">组件总容量：2.336MWp</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

const gaugeRef = ref(null)
let myChart = null

// 1:1 精修配置（完全匹配原图刻度、标签、圆角、比例）
const initGauge = () => {
  myChart = echarts.init(gaugeRef.value)
  myChart.setOption({
    backgroundColor: 'transparent',
    series: [{
      type: 'gauge',
      startAngle: 210,
      endAngle: -30,
      min: 0,
      max: 100,
      // 核心：只显示 5 个标签，和原图一致
      axisLabel: {
        distance: -45,
        fontSize: 18,
        color: '#b8bfc9',
        formatter: (v) => {
          const showLabels = [0,20,50,80,100]
          return showLabels.includes(v) ? `${v}%` : ''
        }
      },
      // 刻度线：长短分层，复刻原图精细度
      axisTick: {
        distance: -25,
        splitNumber: 2,
        length: 6,
        lineStyle: { color: '#d1d6e0', width: 2 }
      },
      splitLine: {
        distance: -25,
        length: 12,
        lineStyle: { color: '#d1d6e0', width: 2 }
      },
      // 圆弧轨道：圆角端点，浅蓝底色
      axisLine: {
        lineStyle: {
          width: 22,
          color: [[1, '#f0f4fa']],
          cap: 'round' // 圆角，核心细节
        }
      },
      // 进度条：圆角，渐变橙/蓝
      progress: {
        show: true,
        width: 22,
        itemStyle: {
          color: '#409eff',
          cap: 'round'
        }
      },
      // 指针：细长尖锐，复刻原图样式
      pointer: {
        icon: 'path://M-2,0 L0,-120 L2,0 Z',
        length: '75%',
        width: 4,
        itemStyle: { color: '#409eff' }
      },
      anchor: {
        show: true,
        size: 14,
        itemStyle: { color: '#409eff' }
      },
      title: { show: false },
      // 中心数值：位置、大小完全对齐
      detail: {
        valueAnimation: false,
        fontSize: 48,
        fontWeight: 600,
        color: '#409eff',
        offsetCenter: [0, '65%'],
        formatter: '743kW'
      },
      data: [{ value: 32 }]
    }]
  })
}

const resize = () => myChart?.resize()
onMounted(initGauge)
window.addEventListener('resize', resize)
onUnmounted(() => {
  window.removeEventListener('resize', resize)
  myChart?.dispose()
})
</script>

<style scoped>
.gauge-refine-container {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #ffffff;
  font-family: "Microsoft YaHei", sans-serif;
}
.gauge-card {
  width: 520px;
  text-align: center;
}
.time-text {
  font-size: 16px;
  color: #409eff;
  margin-bottom: 10px;
}
.gauge-core {
  width: 100%;
  height: 380px;
}
.bottom-text {
  font-size: 20px;
  color: #666;
  margin-top: -10px;
}
</style>