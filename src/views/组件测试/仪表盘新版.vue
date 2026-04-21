<template>
  <div class="gauge-page">
    <div class="page-title">光伏功率仪表盘 · 新版设计</div>
    
    <!-- 版本1：霓虹发光仪表盘 -->
    <div class="gauge-card" :class="{ active: checkList[0] }" @click="checkList[0] = !checkList[0]">
      <div class="gauge-tag">版本1 · 霓虹发光</div>
      <div class="report-time">数据上报时间：{{ reportTime }}</div>
      <div ref="gauge1" class="gauge-chart neon-gauge"></div>
      <div class="capacity-text">组件总容量：2.336MWp</div>
    </div>

    <!-- 版本2：玻璃拟态仪表盘 -->
    <div class="gauge-card glass-card" :class="{ active: checkList[1] }" @click="checkList[1] = !checkList[1]">
      <div class="gauge-tag">版本2 · 玻璃拟态</div>
      <div class="report-time">数据上报时间：{{ reportTime }}</div>
      <div ref="gauge2" class="gauge-chart glass-gauge"></div>
      <div class="capacity-text">组件总容量：2.336MWp</div>
    </div>

    <!-- 版本3：极简数字仪表盘 -->
    <div class="gauge-card minimal-card" :class="{ active: checkList[2] }" @click="checkList[2] = !checkList[2]">
      <div class="gauge-tag">版本3 · 极简数字</div>
      <div class="report-time">数据上报时间：{{ reportTime }}</div>
      <div ref="gauge3" class="gauge-chart minimal-gauge"></div>
      <div class="capacity-text">组件总容量：2.336MWp</div>
    </div>

    <!-- 版本4：科技圆环仪表盘 -->
    <div class="gauge-card tech-card" :class="{ active: checkList[3] }" @click="checkList[3] = !checkList[3]">
      <div class="gauge-tag">版本4 · 科技圆环</div>
      <div class="report-time">数据上报时间：{{ reportTime }}</div>
      <div ref="gauge4" class="gauge-chart tech-gauge"></div>
      <div class="capacity-text">组件总容量：2.336MWp</div>
    </div>

    <!-- 底部信息栏 -->
    <div class="bottom-bar">
      <div class="power-display">
        <span class="power-label">当前功率</span>
        <span class="power-value">{{ powerValue }}</span>
        <span class="power-unit">kW</span>
      </div>
      <div class="action-buttons">
        <el-checkbox v-model="checkList[0]" label="版本1" />
        <el-checkbox v-model="checkList[1]" label="版本2" />
        <el-checkbox v-model="checkList[2]" label="版本3" />
        <el-checkbox v-model="checkList[3]" label="版本4" />
        <el-button type="primary" @click="exportConfig">导出配置</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { ElButton, ElMessage } from 'element-plus'

const reportTime = ref('2026-04-16 10:35:41')
const powerValue = ref(743)
const checkList = ref([false, false, false, false])
const chartList = []

const gauge1 = ref(null)
const gauge2 = ref(null)
const gauge3 = ref(null)
const gauge4 = ref(null)

// 版本1：霓虹发光仪表盘
const initNeonGauge = () => {
  const chart = echarts.init(gauge1.value)
  const option = {
    backgroundColor: '#0a1628',
    series: [{
      type: 'gauge',
      startAngle: 200,
      endAngle: -20,
      min: 0,
      max: 100,
      splitNumber: 10,
      radius: '90%',
      axisLine: {
        lineStyle: {
          width: 20,
          color: [
            [0.32, {
              type: 'linear',
              x: 0, y: 0, x2: 1, y2: 0,
              colorStops: [
                { offset: 0, color: '#00f5ff' },
                { offset: 1, color: '#00ff88' }
              ]
            }],
            [1, 'rgba(255,255,255,0.05)']
          ],
          shadowColor: '#00f5ff',
          shadowBlur: 20
        }
      },
      splitLine: {
        show: false
      },
      axisTick: {
        distance: -35,
        length: 12,
        lineStyle: {
          color: '#00f5ff',
          width: 2,
          shadowColor: '#00f5ff',
          shadowBlur: 10
        }
      },
      axisLabel: {
        distance: -50,
        color: '#00f5ff',
        fontSize: 14,
        fontWeight: 'bold',
        formatter: '{value}%'
      },
      pointer: {
        width: 5,
        length: '60%',
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: '#00f5ff' },
              { offset: 1, color: '#00ff88' }
            ]
          },
          shadowColor: '#00f5ff',
          shadowBlur: 15
        }
      },
      anchor: {
        show: true,
        size: 14,
        itemStyle: {
          color: '#00f5ff',
          borderColor: '#00f5ff',
          borderWidth: 3,
          shadowColor: '#00f5ff',
          shadowBlur: 20
        }
      },
      detail: {
        valueAnimation: true,
        fontSize: 48,
        fontWeight: 'bold',
        color: '#00f5ff',
        formatter: '{value}kW',
        offsetCenter: [0, '70%'],
        textStyle: {
          textShadowColor: '#00f5ff',
          textShadowBlur: 20
        }
      },
      title: {
        show: true,
        offsetCenter: [0, '110%'],
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14
      },
      data: [{ value: 32, name: '实时功率占比' }]
    }]
  }
  chartList.push(chart.setOption(option))
}

// 版本2：玻璃拟态仪表盘
const initGlassGauge = () => {
  const chart = echarts.init(gauge2.value)
  const option = {
    backgroundColor: 'transparent',
    series: [{
      type: 'gauge',
      startAngle: 200,
      endAngle: -20,
      min: 0,
      max: 100,
      splitNumber: 8,
      radius: '88%',
      center: ['50%', '55%'],
      axisLine: {
        lineStyle: {
          width: 24,
          color: [
            [0.25, '#409eff'],
            [0.5, '#36cbcb'],
            [0.75, '#7c3aed'],
            [1, 'rgba(200,200,200,0.2)']
          ]
        }
      },
      progress: {
        show: true,
        width: 24,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: '#409eff' },
              { offset: 0.5, color: '#36cbcb' },
              { offset: 1, color: '#7c3aed' }
            ]
          },
          shadowColor: 'rgba(64, 158, 255, 0.5)',
          shadowBlur: 20
        }
      },
      splitLine: {
        show: false
      },
      axisTick: {
        distance: -30,
        length: 8,
        lineStyle: { color: '#fff', width: 2 }
      },
      axisLabel: {
        distance: -45,
        color: '#666',
        fontSize: 12,
        formatter: '{value}'
      },
      pointer: {
        show: false
      },
      anchor: {
        show: false
      },
      detail: {
        valueAnimation: true,
        fontSize: 56,
        fontWeight: 'bold',
        color: '#333',
        formatter: '{value}%',
        offsetCenter: [0, '-10%']
      },
      data: [{ value: 32 }]
    }, {
      type: 'gauge',
      startAngle: 200,
      endAngle: -20,
      min: 0,
      max: 100,
      radius: '60%',
      axisLine: { lineStyle: { width: 0, color: [[1, 'rgba(255,255,255,0)']] } },
      splitLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
      pointer: {
        width: 4,
        length: '80%',
        itemStyle: { color: '#333' }
      },
      anchor: {
        show: true,
        size: 10,
        itemStyle: { color: '#333', borderWidth: 2 }
      },
      detail: {
        show: true,
        fontSize: 20,
        color: '#666',
        formatter: '{value}kW',
        offsetCenter: [0, '60%']
      },
      data: [{ value: 743 }]
    }]
  }
  chartList.push(chart.setOption(option))
}

// 版本3：极简数字仪表盘
const initMinimalGauge = () => {
  const chart = echarts.init(gauge3.value)
  const option = {
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
      axisLine: {
        lineStyle: {
          width: 6,
          color: [
            [1, '#e0e0e0']
          ]
        }
      },
      splitLine: {
        show: false
      },
      axisTick: {
        distance: -20,
        length: 4,
        lineStyle: { color: '#999', width: 1 }
      },
      axisLabel: {
        distance: -30,
        color: '#999',
        fontSize: 10,
        formatter: '{value}'
      },
      pointer: {
        show: false
      },
      detail: {
        valueAnimation: true,
        fontSize: 64,
        fontWeight: '300',
        color: '#222',
        formatter: '{value}',
        offsetCenter: [0, '-20%']
      },
      title: {
        show: true,
        offsetCenter: [0, '30%'],
        color: '#666',
        fontSize: 14,
        fontWeight: 'normal'
      },
      data: [{ value: 32, name: '功率占比' }]
    }, {
      type: 'gauge',
      center: ['50%', '60%'],
      radius: '95%',
      startAngle: 180,
      endAngle: 0,
      min: 0,
      max: 100,
      axisLine: {
        lineStyle: {
          width: 6,
          color: [[0.32, '#222']]
        }
      },
      splitLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
      pointer: {
        width: 0,
        length: 0
      },
      anchor: { show: false },
      detail: {
        show: false
      },
      data: [{ value: 32 }]
    }]
  }
  chartList.push(chart.setOption(option))
}

// 版本4：科技圆环仪表盘
const initTechGauge = () => {
  const chart = echarts.init(gauge4.value)
  const option = {
    backgroundColor: '#0f1923',
    series: [{
      type: 'gauge',
      startAngle: 90,
      endAngle: -270,
      min: 0,
      max: 100,
      radius: '85%',
      center: ['50%', '50%'],
      axisLine: {
        lineStyle: {
          width: 30,
          color: [[1, 'rgba(255,255,255,0.08)']]
        }
      },
      progress: {
        show: true,
        width: 30,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 1, x2: 0, y2: 0,
            colorStops: [
              { offset: 0, color: '#69b1ff' },
              { offset: 1, color: '#1d4e89' }
            ]
          }
        }
      },
      splitLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
      pointer: { show: false },
      anchor: { show: false },
      detail: {
        valueAnimation: true,
        fontSize: 52,
        fontWeight: 'bold',
        color: '#fff',
        formatter: '{value}%',
        offsetCenter: [0, 0]
      },
      data: [{ value: 32 }]
    }, {
      type: 'gauge',
      startAngle: 90,
      endAngle: -270,
      min: 0,
      max: 100,
      radius: '55%',
      center: ['50%', '50%'],
      axisLine: {
        lineStyle: {
          width: 20,
          color: [[1, 'rgba(255,255,255,0.05)']]
        }
      },
      progress: { show: false },
      splitLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
      pointer: { show: false },
      anchor: { show: false },
      detail: {
        valueAnimation: true,
        fontSize: 28,
        fontWeight: 'bold',
        color: '#69b1ff',
        formatter: '{value}kW',
        offsetCenter: [0, '80%']
      },
      data: [{ value: 743 }]
    }]
  }
  chartList.push(chart.setOption(option))
}

const initCharts = () => {
  initNeonGauge()
  initGlassGauge()
  initMinimalGauge()
  initTechGauge()
}

const exportConfig = () => {
  const selectIndex = checkList.value.findIndex(item => item)
  if (selectIndex === -1) return ElMessage.warning('请先勾选一个版本')
  const configs = ['霓虹发光', '玻璃拟态', '极简数字', '科技圆环']
  console.log(`选中版本：${configs[selectIndex]}，功率：${powerValue.value}kW`)
  ElMessage.success('配置已导出至控制台')
}

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
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
  font-family: "Microsoft YaHei", sans-serif;
}

.page-title {
  font-size: 24px;
  color: #1a1a2e;
  font-weight: 600;
  margin-bottom: 24px;
  text-align: center;
}

.gauge-card {
  width: 100%;
  max-width: 420px;
  margin: 0 auto 32px;
  padding: 32px;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  border: 3px solid transparent;
}

.gauge-card.active {
  border-color: #409eff;
  transform: scale(1.02);
  box-shadow: 0 12px 48px rgba(64, 158, 255, 0.2);
}

.gauge-tag {
  display: inline-block;
  padding: 6px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 16px;
}

.report-time {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

.gauge-chart {
  width: 100%;
  height: 300px;
}

.capacity-text {
  font-size: 15px;
  color: #999;
  margin-top: 8px;
}

/* 版本2玻璃卡片 */
.glass-card {
  background: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.3);
}

/* 版本3极简卡片 */
.minimal-card {
  background: #fff;
  border-radius: 16px;
}

/* 版本4科技卡片 */
.tech-card {
  background: linear-gradient(145deg, #1a1a2e 0%, #16213e 100%);
  border: 1px solid rgba(255,255,255,0.1);
}

.tech-card .gauge-tag {
  background: linear-gradient(135deg, #69b1ff 0%, #1d4e89 100%);
}

.tech-card .report-time,
.tech-card .capacity-text {
  color: rgba(255,255,255,0.6);
}

/* 底部栏 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 24px;
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(0,0,0,0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 -4px 24px rgba(0,0,0,0.08);
}

.power-display {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.power-label {
  font-size: 14px;
  color: #666;
}

.power-value {
  font-size: 36px;
  font-weight: 700;
  color: #1a1a2e;
}

.power-unit {
  font-size: 16px;
  color: #999;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 16px;
}
</style>