<template>
  <div class="overview-card power-card">
    <div class="card-title">电量概览</div>
    <div class="card-content">
      <!-- 左侧：当日发电量 环形图（保持不变） -->
      <div class="left-chart-box">
        <div class="chart-title">当日发电量</div>
        <div class="chart-container">
          <div ref="powerChartRef" class="power-chart"></div>
          <div class="chart-center">
            <div class="center-value">5.8<span class="unit">万kWh</span></div>
          </div>
        </div>
      </div>

      <!-- 右侧：后3个指标 改成KPI布局 -->
      <div class="right-stats-box">
        <!-- 1. 当日收益 -->
        <div class="stat-item">
          <div class="stat-icon green">
            <svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z m46-334c-57.4 0-104-46.6-104-104s46.6-104 104-104 104 46.6 104 104-46.6 104-104 104z m0 160c-118.8 0-224-60.8-224-136 0-12 9.6-22 21.6-22h404.8c12 0 21.6 10 21.6 22 0 75.2-105.2 136-224 136z"/></svg>
          </div>
          <div class="stat-content">
            <div class="stat-num-wrap">
              <span class="stat-num">4.35万</span>
              <span class="stat-unit">元</span>
            </div>
            <div class="stat-text">当日收益</div>
          </div>
        </div>
        <!-- 2. 实时功率占比 -->
        <div class="stat-item">
          <div class="stat-icon blue">
            <svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M512 128c-212.1 0-384 171.9-384 384s171.9 384 384 384 384-171.9 384-384-171.9-384-384-384z m0 640c-141.4 0-256-114.6-256-256s114.6-256 256-256 256 114.6 256 256-114.6 256-256 256z m-32-384h64v256h-64z m0 320h64v64h-64z"/></svg>
          </div>
          <div class="stat-content">
            <div class="stat-num-wrap">
              <span class="stat-num">61.2</span>
              <span class="stat-unit">%</span>
            </div>
            <div class="stat-text">实时功率占比</div>
          </div>
        </div>
        <!-- 3. 上月消纳率 -->
        <div class="stat-item">
          <div class="stat-icon gray">
            <svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M512 128c-212.1 0-384 171.9-384 384s171.9 384 384 384 384-171.9 384-384-171.9-384-384-384z m0 640c-141.4 0-256-114.6-256-256s114.6-256 256-256 256 114.6 256 256-114.6 256-256 256z m192-256c0 106-86 192-192 192s-192-86-192-192 86-192 192-192c46.6 0 89.4 16.6 123.4 44.6l-45.2 45.2c-20.8-20.8-48.8-33.4-78.2-33.4-65 0-118 53-118 118s53 118 118 118 118-53 118-118h64z"/></svg>
          </div>
          <div class="stat-content">
            <div class="stat-num-wrap">
              <span class="stat-num">--</span>
              <span class="stat-unit"></span>
            </div>
            <div class="stat-text">上月消纳率</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'

const powerChartRef = ref(null)

// 初始化当日发电量环形图（保持不变）
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
/* 外层卡片：保持原有class和科技风背景 */
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

/* ========== 左侧：当日发电量图表（保持不变） ========== */
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

/* ========== 右侧：后3个指标 改成KPI布局 ========== */
.right-stats-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 20px;
}

/* 核心：图标左 + 内容右 横向排列 */
.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

/* 空心圆圈图标 固定大小 */
.stat-icon {
  width: 44px;
  height: 44px;
  border: 2px solid currentColor;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.stat-icon svg {
  width: 20px;
  height: 20px;
}

/* 右侧内容区 垂直排列 */
.stat-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

/* 数字+单位 单行不换行 */
.stat-num-wrap {
  display: flex;
  align-items: baseline;
  gap: 4px;
}
.stat-num {
  font-size: 28px;
  font-weight: 700;
  color: #fff; /* 文字纯白 */
}
.stat-unit {
  font-size: 14px;
  color: rgba(255,255,255,0.7); /* 单位半透白 */
}

/* 标题 单行 */
.stat-text {
  font-size: 14px;
  color: rgba(255,255,255,0.7); /* 文字半透白 */
}

/* 仅图标保留颜色区分 */
.green { color: #52c41a; }
.blue { color: #1890ff; }
.gray { color: #999; }
</style>