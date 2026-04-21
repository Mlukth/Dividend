<template>
  <div class="gauge-page">
    <div class="page-title">光伏功率仪表盘 · 4版样式合集（天蓝色主题）</div>

    <!-- 选择导出区 -->
    <div class="select-bar">
      <el-button type="primary" @click="exportConfig">一键导出选中配置</el-button>
      <span class="tip">勾选下方组件即可选中</span>
    </div>

    <!-- 版本1：原版复刻（截图同款） -->
    <div class="gauge-card" :class="{ active: checkList[0] }" @click="checkList[0] = !checkList[0]">
      <div class="gauge-tag">版本1 · 截图原版复刻</div>
      <div class="report-time">数据上报时间：{{ reportTime }} 5分钟前</div>
      <div ref="gauge1" class="gauge-chart"></div>
      <div class="capacity-text">组件总容量：2.336MWp</div>
    </div>

    <!-- 版本2：天蓝色主题（适配你的项目） -->
    <div class="gauge-card" :class="{ active: checkList[1] }" @click="checkList[1] = !checkList[1]">
      <div class="gauge-tag">版本2 · 项目天蓝色主题</div>
      <div class="report-time">数据上报时间：{{ reportTime }} 5分钟前</div>
      <div ref="gauge2" class="gauge-chart"></div>
      <div class="capacity-text">组件总容量：2.336MWp</div>
    </div>

    <!-- 版本3：科技磨砂蓝 -->
    <div class="gauge-card" :class="{ active: checkList[2] }" @click="checkList[2] = !checkList[2]">
      <div class="gauge-tag">版本3 · 科技磨砂蓝</div>
      <div class="report-time">数据上报时间：{{ reportTime }} 5分钟前</div>
      <div ref="gauge3" class="gauge-chart"></div>
      <div class="capacity-text">组件总容量：2.336MWp</div>
    </div>

    <!-- 版本4：极简渐变蓝 -->
    <div class="gauge-card" :class="{ active: checkList[3] }" @click="checkList[3] = !checkList[3]">
      <div class="gauge-tag">版本4 · 极简渐变蓝</div>
      <div class="report-time">数据上报时间：{{ reportTime }} 5分钟前</div>
      <div ref="gauge4" class="gauge-chart"></div>
      <div class="capacity-text">组件总容量：2.336MWp</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { ElButton, ElMessage } from 'element-plus'

// 基础数据
const reportTime = ref('2026-04-16 10:35:41')
const powerValue = ref(743)
const checkList = ref([false, false, false, false])
const chartList = []

// 图表DOM
const gauge1 = ref(null)
const gauge2 = ref(null)
const gauge3 = ref(null)
const gauge4 = ref(null)

// 通用仪表盘配置（1:1复刻截图刻度、角度、指针）
const baseOption = {
  backgroundColor: 'transparent',
  series: [
    {
      type: 'gauge',
      startAngle: 200,
      endAngle: -20,
      min: 0,
      max: 100,
      splitNumber: 10,
      axisLine: {
        lineStyle: { width: 18, color: [[1, '#e8f0f9']] }
      },
      splitLine: { show: false },
      axisTick: {
        distance: -28,
        length: 8,
        lineStyle: { color: '#c0c8d5', width: 2 }
      },
      axisLabel: {
        distance: -40,
        color: '#999',
        fontSize: 16,
        formatter: '{value}%'
      },
      pointer: {
        width: 6,
        itemStyle: { color: '#ff8a29' }
      },
      anchor: {
        show: true,
        size: 12,
        itemStyle: { color: '#ff8a29' }
      },
      title: { show: false },
      detail: {
        valueAnimation: true,
        fontSize: 42,
        fontWeight: 'bold',
        color: '#ff8a29',
        formatter: '{value}kW',
        offsetCenter: [0, '60%']
      },
      data: [{ value: 32, name: '功率' }]
    }
  ]
}

// 初始化4个版本图表
const initCharts = () => {
  // 版本1：原版橙色
  const opt1 = JSON.parse(JSON.stringify(baseOption))
  opt1.series[0].axisLine.lineStyle.color = [[0.32, '#ff8a29'], [1, '#e8f0f9']]
  chartList.push(echarts.init(gauge1.value).setOption(opt1))

  // 版本2：天蓝色主题
  const opt2 = JSON.parse(JSON.stringify(baseOption))
  opt2.series[0].axisLine.lineStyle.color = [[0.32, '#409eff'], [1, '#e8f4ff']]
  opt2.series[0].pointer.itemStyle.color = '#409eff'
  opt2.series[0].anchor.itemStyle.color = '#409eff'
  opt2.series[0].detail.color = '#409eff'
  chartList.push(echarts.init(gauge2.value).setOption(opt2))

  // 版本3：科技磨砂蓝
  const opt3 = JSON.parse(JSON.stringify(baseOption))
  opt3.series[0].axisLine.lineStyle.color = [[0.32, '#36cbcb'], [1, '#f0f9ff']]
  opt3.series[0].pointer.itemStyle.color = '#36cbcb'
  opt3.series[0].anchor.itemStyle.color = '#36cbcb'
  opt3.series[0].detail.color = '#36cbcb'
  chartList.push(echarts.init(gauge3.value).setOption(opt3))

  // 版本4：极简渐变蓝
  const opt4 = JSON.parse(JSON.stringify(baseOption))
  opt4.series[0].axisLine.lineStyle.color = [[0.32, '#69b1ff'], [1, '#f5faff']]
  opt4.series[0].pointer.itemStyle.color = '#69b1ff'
  opt4.series[0].anchor.itemStyle.color = '#69b1ff'
  opt4.series[0].detail.color = '#69b1ff'
  chartList.push(echarts.init(gauge4.value).setOption(opt4))
}

// 一键导出配置
const exportConfig = () => {
  const selectIndex = checkList.value.findIndex(item => item)
  if (selectIndex === -1) return ElMessage.warning('请先勾选一个版本')
  const configText = `选中版本：版本${selectIndex+1}\n功率值：${powerValue.value}kW\n容量：2.336MWp\n主题：天蓝色系仪表盘`
  console.log('导出配置：', configText)
  ElMessage.success('配置已导出至控制台')
}

// 自适应
const resizeCharts = () => chartList.forEach(chart => chart?.resize?.())

onMounted(initCharts)
window.addEventListener('resize', resizeCharts)
onUnmounted(() => window.removeEventListener('resize', resizeCharts))
</script>

<style scoped>
.gauge-page {
  width: 100%;
  min-height: 100vh;
  padding: 24px;
  box-sizing: border-box;
  background: #f5f8ff;
  font-family: "Microsoft YaHei", sans-serif;
}
.page-title {
  font-size: 20px;
  color: #2c5aa0;
  font-weight: 600;
  margin-bottom: 20px;
}
.select-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}
.tip {
  color: #666;
  font-size: 14px;
}
.gauge-card {
  width: 100%;
  max-width: 500px;
  margin: 0 auto 32px;
  padding: 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.1);
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}
.gauge-card.active {
  border-color: #409eff;
  box-shadow: 0 4px 20px rgba(64, 158, 255, 0.2);
}
.gauge-tag {
  display: inline-block;
  padding: 4px 12px;
  background: #e8f4ff;
  color: #409eff;
  border-radius: 20px;
  font-size: 12px;
  margin-bottom: 16px;
}
.report-time {
  font-size: 16px;
  color: #409eff;
  margin-bottom: 16px;
}
.gauge-chart {
  width: 100%;
  height: 320px;
}
.capacity-text {
  font-size: 18px;
  color: #666;
  margin-top: 8px;
}
</style>