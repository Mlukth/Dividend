<template>
  <div class="pv-run-data-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">🏭 光伏电站运行数据中心</h1>
        <div class="update-info">
          <span class="status-dot"></span>
          <span>数据加载完成</span>
          <span class="separator">·</span>
          <span>最后更新 {{ currentTime }}</span>
        </div>
      </div>
      <div class="header-right">
        <el-button type="primary" class="btn-export">
          <span>📤</span> 导出报表
        </el-button>
      </div>
    </div>

    <!-- 第一行：实时功率 + KPI卡片 -->
    <div class="row-top">
      <!-- 实时功率仪表盘 -->
      <div class="gauge-card">
        <div class="card-header space-between">
          <span class="card-title">⚡ 实时功率</span>
        </div>
        <div class="gauge-content">
          <div class="gauge-left">
            <div class="gauge-chart" ref="gaugeRef"></div>
            <div class="gauge-label">综合效率 743kW</div>
          </div>
          <div class="gauge-right">
            <div class="gauge-stat">
              <div class="stat-label">组件总容量</div>
              <div class="stat-value">2.336 <span class="unit">MWp</span></div>
            </div>
          </div>
        </div>
      </div>

      <!-- KPI指标卡片 -->
      <div class="kpi-card">
        <div class="card-header space-between">
          <span class="card-title">📊 发电指标</span>
        </div>
        <div class="kpi-grid">
          <div class="kpi-item">
            <div class="kpi-label">当日电量</div>
            <div class="kpi-value">5.573 <span class="unit">MWh</span></div>
            <div class="kpi-sub">收益 2229元</div>
          </div>
          <div class="kpi-item">
            <div class="kpi-label">当月电量</div>
            <div class="kpi-value">116.771 <span class="unit">MWh</span></div>
            <div class="kpi-sub">收益 4.67万元</div>
          </div>
          <div class="kpi-item highlight">
            <div class="kpi-label">累计电量</div>
            <div class="kpi-value">972.79 <span class="unit">MWh</span></div>
            <div class="kpi-sub">收益 38.911万元</div>
          </div>
          <div class="kpi-item">
            <div class="kpi-label">日发电量</div>
            <div class="kpi-value">2.012 <span class="unit">MWh</span></div>
            <div class="kpi-sub">收益 804.68元</div>
          </div>
        </div>
      </div>

      <!-- 快速统计 -->
      <div class="quick-stats-card">
        <div class="card-header">
          <span class="card-title">📈 关键数据</span>
        </div>
        <div class="quick-stats">
          <div class="quick-item">
            <div class="quick-value">2.336<span>MWp</span></div>
            <div class="quick-label">装机容量</div>
          </div>
          <div class="quick-item">
            <div class="quick-value">86.5<span>%</span></div>
            <div class="quick-label">系统效率</div>
          </div>
          <div class="quick-item">
            <div class="quick-value">743<span>kW</span></div>
            <div class="quick-label">当前功率</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 第二行：功率趋势图 -->
    <div class="chart-card">
      <div class="card-header space-between">
        <span class="card-title">📉 发电功率趋势</span>
        <div class="chart-tools">
          <el-radio-group v-model="dateType" size="default">
            <el-radio-button value="day">日</el-radio-button>
            <el-radio-button value="month">月</el-radio-button>
            <el-radio-button value="year">年</el-radio-button>
            <el-radio-button value="total">总</el-radio-button>
          </el-radio-group>
          <el-date-picker v-model="selectDate" type="date" placeholder="选择日期" size="default" />
        </div>
      </div>
      <div class="chart-container">
        <div ref="powerChartRef" class="chart-box"></div>
      </div>
    </div>

    <!-- 第三行：环境 + 评估 + 社会贡献 -->
    <div class="row-middle">
      <!-- 环境监测 -->
      <div class="env-card">
        <div class="card-header">
          <span class="card-title">🌤️ 环境监测</span>
        </div>
        <div class="env-grid">
          <div class="env-item">
            <span class="env-label">辐照度</span>
            <span class="env-value">856 <span class="unit">W/m²</span></span>
          </div>
          <div class="env-item">
            <span class="env-label">温度</span>
            <span class="env-value">24.5 <span class="unit">°C</span></span>
          </div>
          <div class="env-item">
            <span class="env-label">湿度</span>
            <span class="env-value">58 <span class="unit">%RH</span></span>
          </div>
          <div class="env-item">
            <span class="env-label">风速</span>
            <span class="env-value">3.2 <span class="unit">m/s</span></span>
          </div>
          <div class="env-item">
            <span class="env-label">风向</span>
            <span class="env-value">东南</span>
          </div>
        </div>
      </div>

      <!-- 电站评估 -->
      <div class="eval-card">
        <div class="card-header">
          <span class="card-title">🎯 电站评估</span>
        </div>
        <div class="eval-list">
          <div class="eval-row">
            <span class="eval-label">综合效率</span>
            <span class="eval-value highlight">86.5%</span>
          </div>
          <div class="eval-row">
            <span class="eval-label">等效利用小时</span>
            <span class="eval-value">3.2 h</span>
          </div>
          <div class="eval-row">
            <span class="eval-label">性能比 PR</span>
            <span class="eval-value">82.3%</span>
          </div>
          <div class="eval-row">
            <span class="eval-label">故障损失</span>
            <span class="eval-value warning">0.12 MWh</span>
          </div>
        </div>
      </div>

      <!-- 社会贡献 -->
      <div class="social-card">
        <div class="card-header">
          <span class="card-title">🌱 社会贡献</span>
        </div>
        <div class="social-stats">
          <div class="social-stat">
            <div class="stat-number">387.5 <span>吨</span></div>
            <div class="stat-label">CO₂减排</div>
          </div>
          <div class="social-stat">
            <div class="stat-number">156.2 <span>吨</span></div>
            <div class="stat-label">标煤节约</div>
          </div>
          <div class="social-stat">
            <div class="stat-number">2,380 <span>棵</span></div>
            <div class="stat-label">等效植树</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 第四行：物理布局 + 其他占位 -->
    <div class="row-bottom">
      <!-- 电站物理布局 -->
      <div class="layout-card">
        <div class="card-header space-between">
          <span class="card-title">🗺️ 电站物理布局</span>
          <el-button link type="primary">查看详情</el-button>
        </div>
        <div class="layout-placeholder">
          📐 光伏阵列布局示意图
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { ElDatePicker, ElRadioGroup, ElRadioButton, ElButton } from 'element-plus'

const selectDate = ref('2026-04-16')
const dateType = ref('day')
const gaugeRef = ref(null)
const powerChartRef = ref(null)

let gaugeChart = null
let myChart = null

const currentTime = computed(() => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
})

const initGauge = () => {
  if (!gaugeRef.value) return
  gaugeChart = echarts.init(gaugeRef.value)
  const deepColor = new echarts.graphic.LinearGradient(0, 0, 1, 0, [
    { offset: 0, color: '#ff9a42' },
    { offset: 1, color: '#ff6b00' }
  ])
  gaugeChart.setOption({
    backgroundColor: 'transparent',
    series: [{
      type: 'gauge',
      center: ['50%', '60%'],
      radius: '85%',
      startAngle: 200,
      endAngle: -20,
      min: 0,
      max: 100,
      splitNumber: 5,
      axisLabel: { distance: -20, fontSize: 11, color: '#aaa' },
      axisTick: { distance: -12, length: 4, lineStyle: { color: '#ccc' } },
      splitLine: { distance: -12, length: 8, lineStyle: { color: '#ccc' } },
      axisLine: { lineStyle: { width: 16, color: [[1, '#e9eef4']] } },
      progress: { show: true, width: 16, itemStyle: { color: deepColor } },
      pointer: { length: '55%', width: 4, itemStyle: { color: '#ff6b00' } },
      anchor: { size: 10, itemStyle: { color: '#ff6b00' } },
      title: { show: false },
      detail: { fontSize: 32, fontWeight: 700, color: '#ff6b00', offsetCenter: [0, '50%'], formatter: '{value}kW' },
      data: [{ value: 32 }]
    }]
  })
}

const initTrendChart = () => {
  if (!powerChartRef.value) return
  myChart = echarts.init(powerChartRef.value)
  myChart.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#7a7d84',
      textStyle: { color: '#fff', fontSize: 14 },
      padding: [12, 16],
      axisPointer: { type: 'cross', lineStyle: { color: '#ff9a42', type: 'dashed' } }
    },
    legend: { bottom: 10, left: 'center', itemIcon: 'diamond', textStyle: { color: '#ff9a42' }, data: ['功率'] },
    grid: { left: '3%', right: '3%', top: '10%', bottom: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#666', fontSize: 13 },
      data: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00']
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#f0f0f0' } },
      axisLabel: { color: '#666', fontSize: 13 }
    },
    series: [{
      name: '功率',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      itemStyle: { color: '#ff9a42' },
      lineStyle: { color: '#ff9a42', width: 3 },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(255,154,66,0.35)' },
          { offset: 1, color: 'rgba(255,154,66,0.05)' }
        ])
      },
      data: [0, 0, 0, 0, 220, 780, 160, 0, 0, 0, 0, 0]
    }]
  })
}

const handleResize = () => {
  gaugeChart?.resize()
  myChart?.resize()
}

onMounted(() => {
  initGauge()
  initTrendChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  gaugeChart?.dispose()
  myChart?.dispose()
})
</script>

<style scoped>
/* ==================== 整体布局 ==================== */
.pv-run-data-page {
  width: 100%;
  min-height: calc(100vh - 120px);
  background: linear-gradient(135deg, #f8f9fb 0%, #e8ecf0 100%);
  padding: 24px;
  box-sizing: border-box;
  font-family: "Microsoft YaHei", sans-serif;
}

/* ==================== 页面头部 ==================== */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px 28px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.page-title {
  font-size: 26px;
  font-weight: 700;
  color: #fff;
  margin: 0;
  letter-spacing: 1px;
}

.update-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: rgba(255,255,255,0.7);
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #52c41a;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.separator {
  color: rgba(255,255,255,0.4);
}

.header-right .btn-export {
  background: linear-gradient(135deg, #ff9a42, #ff6b00);
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 600;
}

/* ==================== 卡片通用 ==================== */
.gauge-card, .kpi-card, .quick-stats-card, .chart-card, .env-card, .eval-card, .social-card, .layout-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  box-sizing: border-box;
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.space-between {
  justify-content: space-between;
}

.card-title {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a2e;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ==================== 第一行 ==================== */
.row-top {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

/* 仪表盘卡片 */
.gauge-card {
  flex: 0 0 340px;
}

.gauge-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.gauge-left {
  flex: 1;
}

.gauge-chart {
  width: 180px;
  height: 180px;
}

.gauge-label {
  text-align: center;
  font-size: 14px;
  color: #666;
  margin-top: 8px;
}

.gauge-right {
  flex: 1;
}

.gauge-stat .stat-label {
  font-size: 14px;
  color: #888;
  margin-bottom: 8px;
}

.gauge-stat .stat-value {
  font-size: 36px;
  font-weight: 700;
  color: #1a1a2e;
}

.gauge-stat .unit {
  font-size: 16px;
  font-weight: 400;
  color: #999;
  margin-left: 4px;
}

/* KPI卡片 */
.kpi-card {
  flex: 1;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.kpi-item {
  padding: 16px;
  background: #f8f9fb;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.kpi-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}

.kpi-item.highlight {
  background: linear-gradient(135deg, #ff9a42, #ff6b00);
}

.kpi-item.highlight .kpi-label,
.kpi-item.highlight .kpi-value,
.kpi-item.highlight .kpi-sub {
  color: #fff;
}

.kpi-label {
  font-size: 14px;
  color: #888;
  margin-bottom: 8px;
}

.kpi-value {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a2e;
  line-height: 1.2;
}

.kpi-value .unit {
  font-size: 14px;
  font-weight: 400;
  color: #999;
  margin-left: 4px;
}

.kpi-sub {
  font-size: 13px;
  color: #666;
  margin-top: 6px;
}

/* 快速统计卡片 */
.quick-stats-card {
  flex: 0 0 280px;
}

.quick-stats {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.quick-item {
  text-align: center;
  padding: 16px;
  background: linear-gradient(135deg, #f8f9fb, #fff);
  border-radius: 12px;
}

.quick-value {
  font-size: 32px;
  font-weight: 700;
  color: #ff6b00;
}

.quick-value span {
  font-size: 14px;
  font-weight: 400;
  color: #999;
  margin-left: 4px;
}

.quick-label {
  font-size: 14px;
  color: #666;
  margin-top: 6px;
}

/* ==================== 图表卡片 ==================== */
.chart-card {
  margin-bottom: 20px;
}

.chart-tools {
  display: flex;
  gap: 12px;
  align-items: center;
}

.chart-container {
  width: 100%;
  height: 350px;
}

.chart-box {
  width: 100%;
  height: 100%;
}

/* 主题色覆盖 */
:deep(.el-radio-button__orig-radio:checked + .el-radio-button__inner) {
  background-color: #ff9a42 !important;
  border-color: #ff9a42 !important;
  box-shadow: none;
}

:deep(.el-date-editor) {
  --el-date-editor-width: 140px;
}

/* ==================== 第三行 ==================== */
.row-middle {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

/* 环境监测 */
.env-card {
  flex: 1.5;
}

.env-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
}

.env-item {
  text-align: center;
  padding: 20px 12px;
  background: #f8f9fb;
  border-radius: 12px;
}

.env-label {
  display: block;
  font-size: 13px;
  color: #888;
  margin-bottom: 8px;
}

.env-value {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a2e;
}

.env-value .unit {
  font-size: 12px;
  font-weight: 400;
  color: #999;
}

/* 电站评估 */
.eval-card {
  flex: 1;
}

.eval-list {
  display: flex;
  flex-direction: column;
}

.eval-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid #f0f0f0;
}

.eval-row:last-child {
  border-bottom: none;
}

.eval-label {
  font-size: 15px;
  color: #666;
}

.eval-value {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a2e;
}

.eval-value.highlight {
  color: #52c41a;
}

.eval-value.warning {
  color: #ff6b00;
}

/* 社会贡献 */
.social-card {
  flex: 1.2;
}

.social-stats {
  display: flex;
  justify-content: space-around;
  padding: 10px 0;
}

.social-stat {
  text-align: center;
}

.social-stat .stat-number {
  font-size: 36px;
  font-weight: 700;
  color: #52c41a;
  line-height: 1.2;
}

.social-stat .stat-number span {
  font-size: 14px;
  font-weight: 400;
  color: #999;
  margin-left: 4px;
}

.social-stat .stat-label {
  font-size: 14px;
  color: #666;
  margin-top: 8px;
}

/* ==================== 第四行 ==================== */
.row-bottom {
  margin-bottom: 0;
}

.layout-placeholder {
  height: 200px;
  background: linear-gradient(135deg, #f8f9fb, #e8ecf0);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 18px;
}

/* ==================== 响应式 ==================== */
@media screen and (max-width: 1400px) {
  .row-top {
    flex-wrap: wrap;
  }
  .gauge-card {
    flex: 0 0 100%;
  }
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .row-middle {
    flex-wrap: wrap;
  }
  .env-card, .eval-card, .social-card {
    flex: 1 1 calc(50% - 10px);
  }
  .env-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media screen and (max-width: 768px) {
  .row-top, .row-middle {
    flex-direction: column;
  }
  .gauge-card, .kpi-card, .quick-stats-card, .env-card, .eval-card, .social-card {
    flex: 1 1 100%;
  }
  .kpi-grid {
    grid-template-columns: 1fr 1fr;
  }
  .env-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>