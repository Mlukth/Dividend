```vue
<template>
  <div class="overview-card power-card">
    <div class="card-title">电量概览</div>
    <div class="card-content">
      <!-- 左侧：当日发电量 环形图 -->
      <div class="left-chart-box">
        <div class="chart-title">当日发电量</div>
        <div class="chart-container">
          <div ref="powerChartRef" class="power-chart"></div>
          <div class="chart-center">
            <div class="center-value">5.8<span class="unit">万kWh</span></div>
          </div>
        </div>
      </div>

      <!-- 右侧：后3个指标 -->
      <div class="right-stats-box">
        <div class="stat-item">
          <span class="stat-label">当日收益</span>
          <span class="stat-value">4.35万 元</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">实时功率占比</span>
          <span class="stat-value">61.2 %</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">上月消纳率</span>
          <span class="stat-value">--</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'

const powerChartRef = ref(null)

// 初始化当日发电量环形图
const initPowerChart = () => {
  const chart = echarts.init(powerChartRef.value)
  chart.setOption({
    backgroundColor: 'transparent',
    series: [{
      type: 'pie',
      radius: ['70%', '85%'],
      center: ['50%', '50%'],
      silent: true,
      label: { show: false },
      data: [
        { value: 5.8, itemStyle: { color: '#1890ff' } },
        { value: 4.2, itemStyle: { color: 'rgba(255,255,255,0.1)' } }
      ]
    }]
  })
}

onMounted(() => {
  initPowerChart()
})
</script>

<style scoped>
/* 外层卡片：保持原有class，添加科技风背景 */
.overview-card {
  width: 100%;
  height: 280px;
  background: #0a2a60;
  background-image: linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
  background-size: 40px 40px;
  border-radius: 8px;
  padding: 20px 24px;
  box-sizing: border-box;
  font-family: "Microsoft YaHei", sans-serif;
  color: #fff;
}

/* 卡片标题 */
.card-title {
  font-size: 24px;
  font-weight: 500;
  margin-bottom: 20px;
}

/* 内容区：左右Flex布局 */
.card-content {
  display: flex;
  align-items: center;
  gap: 40px;
  height: calc(100% - 50px);
}

/* ========== 左侧：当日发电量图表 ========== */
.left-chart-box {
  width: 200px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.chart-title {
  font-size: 16px;
  opacity: 0.8;
  margin-bottom: 12px;
}

.chart-container {
  position: relative;
  width: 160px;
  height: 160px;
}

.power-chart {
  width: 100%;
  height: 100%;
}

.chart-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.center-value {
  font-size: 28px;
  font-weight: 600;
}

.unit {
  font-size: 14px;
  margin-left: 4px;
  opacity: 0.7;
}

/* ========== 右侧：后3个指标 ========== */
.right-stats-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 24px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255,255,255,0.05);
  border-radius: 6px;
}

.stat-label {
  font-size: 16px;
  opacity: 0.8;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
}
</style>