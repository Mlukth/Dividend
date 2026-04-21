<template>
  <div class="gauge-container">
    <div class="header">最终版 · 加深渐变蓝仪表盘（50%上移优化 | 数值同色）</div>
    <div class="gauge-card">
      <div class="time-text">数据上报时间：2026-04-16 10:35:41 5分钟前</div>
      <div ref="gaugeRef" class="gauge-box"></div>
      <div class="desc">组件总容量：2.336MWp</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

const gaugeRef = ref(null)
let myChart = null

const initGauge = () => {
  myChart = echarts.init(gaugeRef.value)
  
  // 加深深蓝渐变（原版保持不变）
  const deepColor = new echarts.graphic.LinearGradient(0,0,1,0,[
    {offset:0,color:'#2d7dd2'},
    {offset:1,color:'#1a5aaa'}
  ])

  myChart.setOption({
    backgroundColor: 'transparent',
    graphic: [
      // 50%文字向上大幅上移，完全对齐你截图位置
      {
        type: 'text',
        left: 'center',
        top: '5%', // 从10%改为5%，往上调高
        style: {
          text: '50%',
          fontSize: 20,
          fill: '#c5c9d2'
        }
      }
    ],
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
        itemStyle: { color: deepColor }
      },
      pointer: {
        show: true,
        length: '70%',
        width: 4,
        itemStyle: { color: '#1a5aaa' }
      },
      anchor: {
        show: true,
        size: 10,
        itemStyle: { color: '#1a5aaa' }
      },
      title: { show: false },
      detail: {
        show: true,
        fontSize: 40,
        fontWeight: 600,
        color: '#1a5aaa', // 数值和进度条完全同深蓝色
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
.gauge-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #ffffff;
  font-family: "Microsoft YaHei";
}
.header {
  font-size: 18px;
  color: #2b5b9e;
  margin-bottom: 20px;
}
.gauge-card {
  width: 500px;
  text-align: center;
}
.time-text {
  font-size: 16px;
  color: #409eff;
  margin-bottom: 10px;
}
.gauge-box {
  width: 100%;
  height: 320px;
}
.desc {
  font-size: 20px;
  color: #666;
  margin-top: 8px;
}
</style>