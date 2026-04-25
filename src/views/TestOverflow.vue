<template>
  <div class="power-info">
    <!-- 加载中状态 (已直接赋值为 false，无需等待) -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>
    <div v-else>
      <!-- 2. 核心KPI指标卡片 4列 -->
      <div class="kpi-card-row">
        <!-- 实时发电功率卡片 -->
        <div class="kpi-card">
          <div class="kpi-title">实时发电功率</div>
          <div class="kpi-content">
            <div class="power-gauge" ref="powerGaugeRef"></div>
            <div class="kpi-number">{{ powerData.realTimePower }}<span class="kpi-unit">kW</span></div>
          </div>
        </div>

        <!-- 当日发电量卡片 -->
        <div class="kpi-card">
          <div class="kpi-title">当日发电量</div>
          <div class="kpi-number big">{{ powerData.todayEnergy }}<span class="kpi-unit">kWh</span></div>
          <div class="kpi-trend">
            <span v-if="dailyChange" :style="{ color: dailyChange.color }">
              {{ dailyChange.sign }} {{ dailyChange.value }}%
            </span>
            <span v-else>--</span>
            <span class="trend-desc">较昨日同期</span>
          </div>
          <div class="kpi-extra">累计发电量：{{ powerData.totalEnergy }} kWh</div>
        </div>

        <!-- 当日收益卡片 -->
        <div class="kpi-card">
          <div class="kpi-title">当日收益</div>
          <div class="kpi-number big">¥ {{ powerData.todayProfit }}</div>
          <div class="kpi-extra">
            <span>当年收益：{{ powerData.yearProfit }} 元</span>
            <span>累计收益：{{ powerData.totalProfit }} 元</span>
          </div>
          <div class="kpi-price">
            <span>上网电价：{{ powerData.gridPrice }} 元/kWh</span>
            <span>自用电价：{{ powerData.selfUsePrice }} 元/kWh</span>
          </div>
        </div>

        <!-- 系统状态卡片 -->
        <div class="kpi-card">
          <div class="kpi-title">系统运行状态</div>
          <div class="status-wrapper">
            <div class="status-indicator" :class="powerData.runStatus === '运行中' ? 'status-normal' : 'status-alarm'"></div>
            <div class="status-text" :class="{ 'status-text-stop': powerData.runStatus === '停机' }">
              {{ powerData.runStatus }}
            </div>
          </div>
          <div class="alarm-wrapper">
            <span>当前告警数量</span>
            <span class="alarm-number" :class="powerData.alarmCount > 0 ? 'alarm-red' : ''">{{ powerData.alarmCount }}</span>
          </div>
          <div class="comm-status">
            <span>设备通信状态：</span>
            <span v-if="commStatus === '全部在线'" class="comm-normal">✅ {{ commStatus }}</span>
            <span v-else-if="commStatus === '部分离线'" class="comm-alarm">⚠️ {{ commStatus }}</span>
            <span v-else>{{ commStatus }}</span>
          </div>
          <!-- 逆变器在线数/总数 -->
          <div class="inverter-stat">
            <span>逆变器在线数/总数：</span>
            <span class="stat-value">{{ powerData.inverterOnline }}/{{ powerData.inverterTotal }}</span>
          </div>
        </div>
      </div>

      <!-- 3. 发电趋势 + 环境监测 2列布局 -->
      <div class="chart-row">
        <!-- 左侧：发电趋势图表 [模拟] -->
        <div class="chart-card chart-card-left">
          <div class="card-title">
            发电数据趋势 <span class="mock-badge">[模拟]</span>
            <el-select v-model="dateType" size="small" style="width: 100px; margin-left: 12px;">
              <el-option label="日" value="day" />
              <el-option label="月" value="month" />
              <el-option label="年" value="year" />
            </el-select>
          </div>
          <div class="chart-container" ref="powerTrendRef"></div>
          <div class="chart-extra-info">
            <span>日满发小时数：{{ powerData.equivalentHours }} h</span>
            <span>当年发电量：{{ powerData.yearEnergy }} kWh</span>
          </div>
        </div>

        <!-- 右侧：环境监测图表 [模拟] -->
        <div class="chart-card chart-card-right">
          <div class="card-title">环境监测数据 <span class="mock-badge">[模拟]</span></div>
          <div class="chart-container" ref="envChartRef"></div>
          <div class="weather-wrapper">
            <div class="weather-item" v-for="item in mockEnvironment.weatherForecast" :key="item.date">
              <div class="weather-icon">{{ item.icon }}</div>
              <div class="weather-date">{{ item.date }}</div>
              <div class="weather-temp">{{ item.temp }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. 设备监控 + 电站评估 2列布局 -->
      <div class="chart-row">
        <!-- 左侧：设备监控 [模拟] -->
        <div class="chart-card chart-card-left">
          <div class="card-title">设备组成与通信状态 <span class="mock-badge">[模拟]</span></div>
          <div class="device-content">
            <div class="device-list">
              <div class="device-item" v-for="device in mockDeviceList" :key="device.id">
                <span class="device-name">{{ device.name }}</span>
                <span class="device-status" :class="device.status === '在线' ? 'status-online' : 'status-offline'">{{ device.status }}</span>
              </div>
            </div>
            <div class="device-topo">
              <div class="topo-title">通信状态拓扑</div>
              <div class="topo-graph">
                <div class="topo-node center-node">
                  <span>数据采集器</span>
                  <span class="node-status online">在线</span>
                </div>
                <div class="topo-line"></div>
                <div class="topo-nodes-wrapper">
                  <div class="topo-node" v-for="device in mockDeviceList.slice(0,4)" :key="device.topoId">
                    <span>{{ device.name }}</span>
                    <span class="node-status" :class="device.status === '在线' ? 'online' : 'offline'">{{ device.status }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：电站评估数据（模拟计算） -->
        <div class="chart-card chart-card-right">
          <div class="card-title">电站评估数据</div>
          <div class="assessment-container">
            <div class="progress-item" v-for="item in assessmentItems" :key="item.name">
              <div class="progress-header">
                <span>{{ item.name }}</span>
                <span class="progress-value">{{ item.value }}%</span>
              </div>
              <div class="progress-chart" :ref="el => { if (el) progressRefs[item.key] = el }"></div>
            </div>
          </div>
          <div class="social-contribution">
            <div class="contribution-title">社会贡献</div>
            <div class="contribution-list">
              <div class="contribution-item">
                <span class="contribution-icon">🌱</span>
                <div class="contribution-info">
                  <div class="contribution-number">{{ socialContributions.co2Reduction }} 吨</div>
                  <div class="contribution-desc">CO₂减排</div>
                </div>
              </div>
              <div class="contribution-item">
                <span class="contribution-icon">⛽</span>
                <div class="contribution-info">
                  <div class="contribution-number">{{ socialContributions.coalSaving }} 吨</div>
                  <div class="contribution-desc">节约标准煤</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 5. 物理布局图 全宽 [模拟] -->
      <div class="layout-card">
        <div class="card-title">电站物理布局图 <span class="mock-badge">[模拟]</span></div>
        <div class="layout-container">
          <div class="layout-placeholder">
            <span class="layout-icon">🏗️</span>
            <p>电站物理布局图展示区</p>
            <p class="layout-tip">可接入2D/3D可视化布局图，支持缩放、点位点击查看设备详情</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, onUnmounted, watch, nextTick, computed } from 'vue'
import * as echarts from 'echarts'

// ---------- 模拟数据定义 ----------
// 页面加载状态（已直接设为 false，无接口等待）
const loading = ref(false)

// 模拟的电力数据
const powerData = reactive({
  realTimePower: 285,
  todayEnergy: 2846,
  totalEnergy: 128500,
  todayProfit: 1138.4,
  yearProfit: 45200,
  totalProfit: 128500,
  gridPrice: 0.4,
  selfUsePrice: 0.6,
  runStatus: '运行中',
  alarmCount: 0,
  commStatus: '全部在线',
  equivalentHours: 5.2,
  yearEnergy: 68400,
  inverterOnline: 6,
  inverterTotal: 6
})

// 环境模拟数据
const mockEnvironment = {
  weatherForecast: [
    { date: '今日', icon: '☀️', temp: '18~30℃' },
    { date: '明日', icon: '⛅', temp: '17~28℃' },
    { date: '后天', icon: '🌧️', temp: '15~24℃' }
  ]
}

// 设备模拟数据
const mockDeviceList = [
  { id: 1, name: '光伏组件阵列', status: '在线', topoId: 1 },
  { id: 2, name: '组串式逆变器', status: '在线', topoId: 2 },
  { id: 3, name: '并网柜', status: '在线', topoId: 3 },
  { id: 4, name: '气象站', status: '在线', topoId: 4 },
  { id: 5, name: '智能电表', status: '在线', topoId: 5 },
  { id: 6, name: '监控采集器', status: '在线', topoId: 6 }
]

// 昨日发电量 (模拟为 null，显示同比为 --)
const yesterdayEnergy = ref(null)

// 日发电量同比 (基于模拟数据，若无昨日数据则返回 null)
const dailyChange = computed(() => {
  if (yesterdayEnergy.value === null) return null
  const today = parseFloat(powerData.todayEnergy)
  const yesterday = parseFloat(yesterdayEnergy.value)
  if (isNaN(today) || isNaN(yesterday) || yesterday === 0) return null
  const change = ((today - yesterday) / yesterday * 100).toFixed(1)
  return {
    value: Math.abs(change),
    sign: change >= 0 ? '↑' : '↓',
    color: change >= 0 ? '#52c41a' : '#f5222d'
  }
})

// 通信状态计算
const commStatus = computed(() => {
  const online = powerData.inverterOnline
  const total = powerData.inverterTotal
  if (total === 0) return '部分离线'
  if (online === total) return '全部在线'
  return '部分离线'
})

// 评估项数据 (模拟)
const assessmentItems = ref([
  { name: '系统效率', key: 'systemEfficiency', value: 85 },
  { name: '当年消纳率', key: 'consumptionRate', value: 92 },
  { name: '电站健康度', key: 'healthScore', value: 98 }
])

// 社会贡献数据 (模拟)
const socialContributions = ref({
  co2Reduction: 128.5,
  coalSaving: 52.3
})

// 日期类型选择
const dateType = ref('day')

// ---------- 图表相关 refs ----------
const powerGaugeRef = ref(null)
const powerTrendRef = ref(null)
const envChartRef = ref(null)
const progressRefs = reactive({})
let chartInstances = []

// 图表自适应
const resizeAllCharts = () => {
  chartInstances.forEach(chart => {
    if (chart && !chart.isDisposed()) chart.resize()
  })
}

// 销毁所有图表实例
const disposeAllCharts = () => {
  chartInstances.forEach(chart => {
    if (chart && !chart.isDisposed()) chart.dispose()
  })
  chartInstances = []
}

// ----- 发电趋势数据生成器（模拟）-----
const getPowerTrendData = () => {
  if (dateType.value === 'day') {
    const timeAxis = Array.from({ length: 24 }, (_, i) => `${i}:00`)
    const powerData = [0, 0, 0, 0, 0, 0, 20, 85, 180, 260, 310, 330, 340, 335, 320, 280, 200, 120, 50, 10, 0, 0, 0, 0]
    const energyData = [0, 0, 0, 0, 0, 0, 20, 105, 285, 545, 855, 1185, 1525, 1860, 2180, 2460, 2660, 2780, 2830, 2840, 2846, 2846, 2846, 2846]
    return { timeAxis, powerData, energyData }
  } else if (dateType.value === 'month') {
    const days = 30
    const timeAxis = Array.from({ length: days }, (_, i) => `${i + 1}日`)
    const powerData = Array.from({ length: days }, () => Math.floor(280 + Math.random() * 60))
    const energyData = powerData.reduce((acc, val, idx) => {
      const prev = idx === 0 ? 0 : acc[idx - 1]
      acc.push(prev + val * 8)
      return acc
    }, [])
    return { timeAxis, powerData, energyData }
  } else {
    const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    const powerData = [8000, 7500, 10000, 12000, 15000, 16000, 17000, 16500, 14000, 11000, 9000, 8200]
    const energyData = powerData.reduce((acc, val, idx) => {
      const prev = idx === 0 ? 0 : acc[idx - 1]
      acc.push(prev + val)
      return acc
    }, [])
    return { timeAxis: months, powerData, energyData }
  }
}

// ----- 初始化图表 -----
const initPowerTrendChart = () => {
  if (!powerTrendRef.value) return
  const existing = echarts.getInstanceByDom(powerTrendRef.value)
  if (existing) existing.dispose()
  const chart = echarts.init(powerTrendRef.value)
  chartInstances.push(chart)

  const { timeAxis, powerData: pwData, energyData } = getPowerTrendData()
  const option = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
    legend: { data: ['实时发电功率(kW)', '累计发电量(kWh)'], top: 0, textStyle: { fontSize: 12 } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: timeAxis, axisLabel: { rotate: dateType.value === 'year' ? 0 : 45 } },
    yAxis: [
      { type: 'value', name: '功率(kW)', position: 'left', axisLine: { lineStyle: { color: '#0066CC' } }, axisLabel: { color: '#0066CC' } },
      { type: 'value', name: '发电量(kWh)', position: 'right', axisLine: { lineStyle: { color: '#52c41a' } }, axisLabel: { color: '#52c41a' } }
    ],
    series: [
      { name: '实时发电功率(kW)', type: 'line', smooth: true, yAxisIndex: 0, data: pwData, lineStyle: { color: '#0066CC', width: 2 }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(0, 102, 204, 0.2)' }, { offset: 1, color: 'rgba(0, 102, 204, 0)' }]) } },
      { name: '累计发电量(kWh)', type: 'line', smooth: true, yAxisIndex: 1, data: energyData, lineStyle: { color: '#52c41a', width: 2 } }
    ]
  }
  chart.setOption(option)
}

// 初始化仪表盘
const initPowerGauge = () => {
  if (!powerGaugeRef.value) return
  const existing = echarts.getInstanceByDom(powerGaugeRef.value)
  if (existing) existing.dispose()
  const chart = echarts.init(powerGaugeRef.value)
  chartInstances.push(chart)

  const max = 500 // 模拟装机容量
  const value = powerData.realTimePower || 0
  const option = {
    series: [{
      type: 'gauge',
      min: 0,
      max: max,
      splitNumber: 5,
      radius: '80%',
      axisLine: {
        lineStyle: {
          width: 6,
          color: [
            [0.3, '#52c41a'],
            [0.7, '#faad14'],
            [1, '#f5222d']
          ]
        }
      },
      pointer: { show: true, width: 2, length: '60%' },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      detail: { show: false },
      data: [{ value: value }]
    }]
  }
  chart.setOption(option)
}

// 初始化环境图表
const initEnvChart = () => {
  if (!envChartRef.value) return
  const existing = echarts.getInstanceByDom(envChartRef.value)
  if (existing) existing.dispose()
  const chart = echarts.init(envChartRef.value)
  chartInstances.push(chart)

  const timeAxis = Array.from({ length: 24 }, (_, i) => `${i}:00`)
  const radiationData = [0, 0, 0, 0, 0, 0, 10, 50, 200, 400, 600, 750, 800, 760, 650, 450, 200, 50, 0, 0, 0, 0, 0, 0]
  const tempData = [18, 17.5, 17, 16.8, 16.5, 16.3, 17, 19, 22, 24, 26, 28, 29, 29.5, 29, 28, 26, 24, 22, 21, 20, 19.5, 19, 18.5]
  const moduleTempData = tempData.map(t => t + 12)

  const option = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
    legend: { data: ['日辐射量(W/㎡)', '环境温度(℃)', '组件温度(℃)'], top: 0, textStyle: { fontSize: 11 }, itemWidth: 10, itemHeight: 10 },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: timeAxis, axisLabel: { fontSize: 10 } },
    yAxis: [
      { type: 'value', name: '辐射量', position: 'left', axisLine: { lineStyle: { color: '#faad14' } }, axisLabel: { color: '#faad14', fontSize: 10 } },
      { type: 'value', name: '温度(℃)', position: 'right', axisLine: { lineStyle: { color: '#f5222d' } }, axisLabel: { color: '#f5222d', fontSize: 10 } }
    ],
    series: [
      { name: '日辐射量(W/㎡)', type: 'line', smooth: true, yAxisIndex: 0, data: radiationData, lineStyle: { color: '#faad14', width: 2 }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(250, 173, 20, 0.2)' }, { offset: 1, color: 'rgba(250, 173, 20, 0)' }]) } },
      { name: '环境温度(℃)', type: 'line', smooth: true, yAxisIndex: 1, data: tempData, lineStyle: { color: '#13c2c2', width: 2 } },
      { name: '组件温度(℃)', type: 'line', smooth: true, yAxisIndex: 1, data: moduleTempData, lineStyle: { color: '#f5222d', width: 2 } }
    ]
  }
  chart.setOption(option)
}

// 初始化环形进度条
const initProgressCharts = () => {
  const items = assessmentItems.value
  Object.keys(progressRefs).forEach(key => {
    const dom = progressRefs[key]
    if (!dom) return
    const existing = echarts.getInstanceByDom(dom)
    if (existing) existing.dispose()
    const chart = echarts.init(dom)
    chartInstances.push(chart)
    const targetItem = items.find(item => item.key === key)
    if (!targetItem || targetItem.value === '--') {
      chart.setOption({ series: [] })
      return
    }
    const option = {
      series: [{
        type: 'pie',
        radius: ['70%', '90%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
        label: { show: false },
        emphasis: { label: { show: false } },
        data: [
          { value: targetItem.value, itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: '#0066CC' }, { offset: 1, color: '#165DFF' }]) } },
          { value: 100 - targetItem.value, itemStyle: { color: '#f0f2f5' } }
        ]
      }]
    }
    chart.setOption(option)
  })
}

// 统一初始化所有图表
const initAllCharts = () => {
  disposeAllCharts()
  initPowerGauge()
  initPowerTrendChart()
  initEnvChart()
  initProgressCharts()
}

// 监听日期类型变化，重绘趋势图
watch(dateType, async () => {
  await nextTick()
  initPowerTrendChart()
})

// 挂载后初始化图表并监听窗口 resize
onMounted(() => {
  initAllCharts()
  window.addEventListener('resize', resizeAllCharts)
})

// 销毁时清理
onUnmounted(() => {
  window.removeEventListener('resize', resizeAllCharts)
  disposeAllCharts()
})
</script>

<style scoped>
.power-info {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding: 4px 0;
  box-sizing: border-box;
}

/* 滚动条美化 */
.power-info::-webkit-scrollbar {
  width: 6px;
}

.power-info::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.power-info::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.power-info::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 加载中状态 */
.loading-container {
  padding: 20px;
}

/* ---------------- KPI卡片行 ---------------- */
.kpi-card-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.kpi-card {
  background-color: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  padding: 20px;
  box-sizing: border-box;
  transition: all 0.2s ease;
}

.kpi-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.kpi-title {
  font-size: 14px;
  color: #4E5969;
  margin-bottom: 16px;
}

.kpi-content {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80px;
}

.power-gauge {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

.kpi-number {
  font-size: 28px;
  font-weight: bold;
  color: #1D2129;
  z-index: 10;
}

.kpi-number.big {
  font-size: 32px;
  margin-bottom: 8px;
}

.kpi-unit {
  font-size: 16px;
  font-weight: normal;
  color: #4E5969;
  margin-left: 4px;
}

.kpi-trend {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.trend-up {
  color: #52c41a;
  font-weight: 500;
}

.trend-desc {
  font-size: 12px;
  color: #999999;
}

.kpi-extra {
  font-size: 12px;
  color: #666666;
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.kpi-price {
  font-size: 12px;
  color: #666666;
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* 状态卡片样式 */
.status-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.status-normal {
  background-color: #52c41a;
  box-shadow: 0 0 0 4px rgba(82, 196, 26, 0.2);
  animation: pulse 2s infinite;
}

.status-alarm {
  background-color: #f5222d;
  box-shadow: 0 0 0 4px rgba(245, 34, 45, 0.2);
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(82, 196, 26, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(82, 196, 26, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(82, 196, 26, 0);
  }
}

.status-text {
  font-size: 20px;
  font-weight: bold;
  color: #52c41a;
}
/* 新增：停机文字红色 */
.status-text-stop {
  color: #f5222d !important;
}

.alarm-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  color: #4E5969;
  margin-bottom: 12px;
}

.alarm-number {
  font-size: 18px;
  font-weight: bold;
}

.alarm-red {
  color: #f5222d;
}

.comm-status {
  font-size: 14px;
  color: #4E5969;
}

.comm-normal {
  color: #52c41a;
  font-weight: 500;
}

.comm-alarm {
  color: #faad14;
  font-weight: 500;
}

/* 逆变器统计容器样式 */
.inverter-stat {
  color: #1D2129; /* 深色文字 */
  font-size: 14px;
  margin-top: 12px;
}
.inverter-stat span:first-child {
  color: #1D2129; /* 明确标题文字颜色 */
}

/* 强化逆变器统计数字样式，确保可见 */
.inverter-stat .stat-value {
  font-weight: bold;
  color: #1D2129 !important;      /* 深色文字，强制覆盖 */
  background: #f5f7fa;           /* 浅灰背景 */
  padding: 2px 8px;
  border-radius: 12px;
  display: inline-block;
}

/* 图表行布局 */
.chart-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.chart-card {
  background-color: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  padding: 20px;
  box-sizing: border-box;
  transition: all 0.2s ease;
}

.chart-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.chart-card-left {
  width: 60%;
}

.chart-card-right {
  width: 40%;
}

.card-title {
  font-size: 16px;
  font-weight: bold;
  color: #1D2129;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #EEF7FF;
}

.mock-badge {
  font-size: 12px;
  color: #ff9800;
  background: #fff3e0;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 8px;
}

.chart-container {
  width: 100%;
  height: 220px;
}

.chart-extra-info {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  font-size: 14px;
  color: #4E5969;
}

/* 天气预报样式 */
.weather-wrapper {
  display: flex;
  justify-content: space-around;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.weather-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.weather-icon {
  font-size: 24px;
}

.weather-date {
  font-size: 12px;
  color: #666666;
}

.weather-temp {
  font-size: 14px;
  font-weight: 500;
  color: #1D2129;
}

/* 设备监控内容 */
.device-content {
  display: flex;
  gap: 20px;
}

.device-list {
  width: 35%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.device-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background-color: #F8F9FA;
  border-radius: 8px;
  font-size: 14px;
}

.device-name {
  color: #1D2129;
}

.device-status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.status-online {
  background-color: #f6ffed;
  color: #52c41a;
}

.status-offline {
  background-color: #fff2f0;
  color: #f5222d;
}

.device-topo {
  flex: 1;
}

.topo-title {
  font-size: 14px;
  color: #4E5969;
  margin-bottom: 20px;
  text-align: center;
}

.topo-graph {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.topo-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 16px;
  background-color: #EEF7FF;
  border-radius: 8px;
  font-size: 12px;
  color: #0066CC;
  width: 100px;
}

.center-node {
  background: linear-gradient(90deg, #0066CC, #165DFF);
  color: #FFFFFF;
}

.node-status {
  font-size: 10px;
  margin-top: 2px;
  padding: 1px 6px;
  border-radius: 10px;
}

.node-status.online {
  background-color: #f6ffed;
  color: #52c41a;
}

.node-status.offline {
  background-color: #fff2f0;
  color: #f5222d;
}

.topo-line {
  width: 2px;
  height: 20px;
  background-color: #0066CC;
}

.topo-nodes-wrapper {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

/* 电站评估样式 */
.assessment-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

.progress-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #1D2129;
}

.progress-value {
  font-weight: bold;
  color: #0066CC;
}

.progress-chart {
  width: 100%;
  height: 20px;
}

.social-contribution {
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.contribution-title {
  font-size: 14px;
  font-weight: 500;
  color: #1D2129;
  margin-bottom: 12px;
}

.contribution-list {
  display: flex;
  justify-content: space-around;
}

.contribution-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.contribution-icon {
  font-size: 32px;
}

.contribution-number {
  font-size: 16px;
  font-weight: bold;
  color: #1D2129;
}

.contribution-desc {
  font-size: 12px;
  color: #666666;
}

/* 物理布局卡片 */
.layout-card {
  background-color: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  padding: 20px;
  box-sizing: border-box;
  margin-bottom: 20px;
}

.layout-container {
  width: 100%;
  height: 360px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #F8F9FA;
  border-radius: 8px;
  border: 1px dashed #d9d9d9;
}

.layout-placeholder {
  text-align: center;
  color: #999999;
}

.layout-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
}

.layout-placeholder p {
  margin: 0 0 8px 0;
  font-size: 16px;
}

.layout-tip {
  font-size: 12px;
  color: #b3b3b3;
}
</style>