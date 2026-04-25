<template>
  <div class="scheme-showcase">
    <!-- 四套方案纵向排列，每套都是完整组件 -->
    <div class="scheme-grid">
      
      <!-- 方案一：背景色高亮 -->
      <div class="scheme-item scheme-1">
        <div class="scheme-label">方案一 · 背景色高亮</div>
        <div class="main-card">
          <!-- 左侧仪表盘 - 橙色完全保留，不做任何交互 -->
          <div class="gauge-wrapper">
            <div class="gauge-chart" ref="chart1"></div>
            <div class="power-value">
              <div class="power-capacity">组件总容量：245.11 kWp</div>
            </div>
          </div>

          <!-- 右侧数据卡片 - 仅修改这里 -->
          <div class="data-card-grid">
            <div class="data-card">
              <span class="card-label">当日电量</span>
              <span class="card-value">150.1<span class="card-unit">kWh</span></span>
              <span class="card-desc">收益 150元</span>
            </div>
            <div class="data-card">
              <span class="card-label">当月电量</span>
              <span class="card-value">0<span class="card-unit">kWh</span></span>
              <span class="card-desc">收益 --元</span>
            </div>
            <div class="data-card">
              <span class="card-label">累计电量</span>
              <span class="card-value">52030<span class="card-unit">kWh</span></span>
              <span class="card-desc">收益 --元</span>
            </div>
            <div class="data-card">
              <span class="card-label">日满发小时数</span>
              <span class="card-value">0.61<span class="card-unit">h</span></span>
              <span class="card-desc">日发电量 150.1kWh</span>
            </div>
            <div class="data-card">
              <span class="card-label">实时功率占比</span>
              <span class="card-value">24.5<span class="card-unit">%</span></span>
              <span class="card-desc"></span>
            </div>
          </div>
        </div>
      </div>

      <!-- 方案二：上浮+阴影高亮 -->
      <div class="scheme-item scheme-2">
        <div class="scheme-label">方案二 · 上浮+阴影高亮</div>
        <div class="main-card">
          <!-- 左侧仪表盘 - 橙色完全保留，不做任何交互 -->
          <div class="gauge-wrapper">
            <div class="gauge-chart" ref="chart2"></div>
            <div class="power-value">
              <div class="power-capacity">组件总容量：245.11 kWp</div>
            </div>
          </div>

          <!-- 右侧数据卡片 - 仅修改这里 -->
          <div class="data-card-grid">
            <div class="data-card">
              <span class="card-label">当日电量</span>
              <span class="card-value">150.1<span class="card-unit">kWh</span></span>
              <span class="card-desc">收益 150元</span>
            </div>
            <div class="data-card">
              <span class="card-label">当月电量</span>
              <span class="card-value">0<span class="card-unit">kWh</span></span>
              <span class="card-desc">收益 --元</span>
            </div>
            <div class="data-card">
              <span class="card-label">累计电量</span>
              <span class="card-value">52030<span class="card-unit">kWh</span></span>
              <span class="card-desc">收益 --元</span>
            </div>
            <div class="data-card">
              <span class="card-label">日满发小时数</span>
              <span class="card-value">0.61<span class="card-unit">h</span></span>
              <span class="card-desc">日发电量 150.1kWh</span>
            </div>
            <div class="data-card">
              <span class="card-label">实时功率占比</span>
              <span class="card-value">24.5<span class="card-unit">%</span></span>
              <span class="card-desc"></span>
            </div>
          </div>
        </div>
      </div>

      <!-- 方案三：边框高亮 -->
      <div class="scheme-item scheme-3">
        <div class="scheme-label">方案三 · 边框高亮</div>
        <div class="main-card">
          <!-- 左侧仪表盘 - 橙色完全保留，不做任何交互 -->
          <div class="gauge-wrapper">
            <div class="gauge-chart" ref="chart3"></div>
            <div class="power-value">
              <div class="power-capacity">组件总容量：245.11 kWp</div>
            </div>
          </div>

          <!-- 右侧数据卡片 - 仅修改这里 -->
          <div class="data-card-grid">
            <div class="data-card">
              <span class="card-label">当日电量</span>
              <span class="card-value">150.1<span class="card-unit">kWh</span></span>
              <span class="card-desc">收益 150元</span>
            </div>
            <div class="data-card">
              <span class="card-label">当月电量</span>
              <span class="card-value">0<span class="card-unit">kWh</span></span>
              <span class="card-desc">收益 --元</span>
            </div>
            <div class="data-card">
              <span class="card-label">累计电量</span>
              <span class="card-value">52030<span class="card-unit">kWh</span></span>
              <span class="card-desc">收益 --元</span>
            </div>
            <div class="data-card">
              <span class="card-label">日满发小时数</span>
              <span class="card-value">0.61<span class="card-unit">h</span></span>
              <span class="card-desc">日发电量 150.1kWh</span>
            </div>
            <div class="data-card">
              <span class="card-label">实时功率占比</span>
              <span class="card-value">24.5<span class="card-unit">%</span></span>
              <span class="card-desc"></span>
            </div>
          </div>
        </div>
      </div>

      <!-- 方案四：文字变橙色高亮 -->
      <div class="scheme-item scheme-4">
        <div class="scheme-label">方案四 · 文字变橙色高亮</div>
        <div class="main-card">
          <!-- 左侧仪表盘 - 橙色完全保留，不做任何交互 -->
          <div class="gauge-wrapper">
            <div class="gauge-chart" ref="chart4"></div>
            <div class="power-value">
              <div class="power-capacity">组件总容量：245.11 kWp</div>
            </div>
          </div>

          <!-- 右侧数据卡片 - 仅修改这里 -->
          <div class="data-card-grid">
            <div class="data-card">
              <span class="card-label">当日电量</span>
              <span class="card-value">150.1<span class="card-unit">kWh</span></span>
              <span class="card-desc">收益 150元</span>
            </div>
            <div class="data-card">
              <span class="card-label">当月电量</span>
              <span class="card-value">0<span class="card-unit">kWh</span></span>
              <span class="card-desc">收益 --元</span>
            </div>
            <div class="data-card">
              <span class="card-label">累计电量</span>
              <span class="card-value">52030<span class="card-unit">kWh</span></span>
              <span class="card-desc">收益 --元</span>
            </div>
            <div class="data-card">
              <span class="card-label">日满发小时数</span>
              <span class="card-value">0.61<span class="card-unit">h</span></span>
              <span class="card-desc">日发电量 150.1kWh</span>
            </div>
            <div class="data-card">
              <span class="card-label">实时功率占比</span>
              <span class="card-value">24.5<span class="card-unit">%</span></span>
              <span class="card-desc"></span>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

// 4个图表ref 对应4套方案
const chart1 = ref(null)
const chart2 = ref(null)
const chart3 = ref(null)
const chart4 = ref(null)
let chartList = []

// 仪表盘配置 - 橙色完全保留，不做任何修改
const gaugeOption = {
  series: [{
    type: 'gauge',
    startAngle: 210,
    endAngle: -30,
    min: 0,
    max: 100,
    splitNumber: 5,
    axisLine: {
      lineStyle: {
        width: 12,
        color: [
          [0.245, '#FF7A18'], // 橙色常驻
          [1, '#E8EDF3']
        ],
        roundCap: true
      }
    },
    pointer: {
      icon: 'path://M12.8,0.7L12.8,0.7c-0.4-0.4-1-0.4-1.4,0L0.7,11.4c-0.4,0.4-0.4,1,0,1.4l0,0c0.4,0.4,1,0.4,1.4,0L12.8,2.1C13.2,1.7,13.2,1.1,12.8,0.7z',
      length: '60%',
      width: 8,
      itemStyle: {
        color: '#FF7A18' // 橙色常驻
      }
    },
    axisTick: {
      show: true,
      splitNumber: 2,
      lineStyle: {
        color: '#C9CDD4',
        width: 1
      },
      length: 6
    },
    splitLine: {
      show: true,
      length: 10,
      lineStyle: {
        color: '#C9CDD4',
        width: 1
      }
    },
    axisLabel: {
      color: '#999',
      fontSize: 14,
      distance: 10
    },
    detail: {
      valueAnimation: true,
      formatter: '{value}%',
      offsetCenter: [0, '70%'],
      fontSize: 32,
      fontWeight: 'bold',
      color: '#FF7A18' // 橙色常驻
    },
    data: [{ value: 24.5 }]
  }]
}

// 初始化图表
const initChart = (el) => {
  if (!el) return
  const chart = echarts.init(el)
  chart.setOption(gaugeOption)
  chartList.push(chart)
  return chart
}

onMounted(() => {
  initChart(chart1.value)
  initChart(chart2.value)
  initChart(chart3.value)
  initChart(chart4.value)

  const resizeHandler = () => chartList.forEach(chart => chart.resize())
  window.addEventListener('resize', resizeHandler)
  onUnmounted(() => window.removeEventListener('resize', resizeHandler))
})

onUnmounted(() => chartList.forEach(chart => chart.dispose()))
</script>

<style scoped>
/* 全局容器 */
.scheme-showcase {
  width: 100%;
  min-height: 100vh;
  background: #F5F7FA;
  padding: 40px 20px;
  box-sizing: border-box;
  font-family: 'Microsoft Yahei', sans-serif;
}

/* 方案网格 纵向排列 */
.scheme-grid {
  display: flex;
  flex-direction: column;
  gap: 40px;
  width: 100%;
  max-width: 1920px;
  margin: 0 auto;
}

/* 单个方案容器 */
.scheme-item {
  width: 100%;
}
.scheme-label {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  padding-left: 8px;
  border-left: 4px solid #FF7A18;
}

/* ------------------------------
   核心组件基础样式 - 1:1还原你的截图
------------------------------ */
.main-card {
  width: 100%;
  background: #FFFFFF;
  border-radius: 16px;
  padding: 32px 40px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 60px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

/* 左侧仪表盘 - 完全保留，不做任何交互 */
.gauge-wrapper {
  flex-shrink: 0;
  width: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.gauge-chart {
  width: 280px;
  height: 280px;
}
.power-value {
  margin-top: 8px;
}
.power-capacity {
  font-size: 16px;
  color: #666666;
  margin: 0;
}

/* 右侧数据卡片网格 - 基础样式 */
.data-card-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: auto auto;
  gap: 20px;
  width: 100%;
}
.data-card {
  width: 100%;
  min-width: 180px;
  padding: 24px 16px;
  background: #F8F9FA;
  border-radius: 12px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}
.card-label {
  font-size: 15px;
  color: #666666;
  transition: all 0.3s ease;
}
.card-value {
  font-size: 36px;
  font-weight: bold;
  color: #1D2129;
  line-height: 1;
  transition: all 0.3s ease;
}
.card-unit {
  font-size: 16px;
  font-weight: normal;
  color: #666666;
  margin-left: 4px;
  transition: all 0.3s ease;
}
.card-desc {
  font-size: 14px;
  color: #999999;
  margin-top: 4px;
  transition: all 0.3s ease;
}
/* 第二行2个卡片居中 */
.data-card:nth-child(4) {
  grid-column: 1 / 2;
  justify-self: end;
}
.data-card:nth-child(5) {
  grid-column: 2 / 3;
  justify-self: start;
}

/* ------------------------------
   方案一：背景色高亮
   鼠标经过卡片时，背景变为浅橙色
------------------------------ */
.scheme-1 .data-card:hover {
  background: rgba(255, 122, 24, 0.08);
}

/* ------------------------------
   方案二：上浮+阴影高亮
   鼠标经过卡片时，卡片上浮并出现橙色阴影
------------------------------ */
.scheme-2 .data-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(255, 122, 24, 0.15);
}

/* ------------------------------
   方案三：边框高亮
   鼠标经过卡片时，卡片边框变为橙色
------------------------------ */
.scheme-3 .data-card {
  border: 2px solid transparent;
}
.scheme-3 .data-card:hover {
  border-color: #FF7A18;
  background: rgba(255, 122, 24, 0.03);
}

/* ------------------------------
   方案四：文字变橙色高亮
   鼠标经过卡片时，卡片内的数值文字变为橙色
------------------------------ */
.scheme-4 .data-card:hover .card-value {
  color: #FF7A18;
}
.scheme-4 .data-card:hover .card-unit {
  color: rgba(255, 122, 24, 0.7);
}
</style>