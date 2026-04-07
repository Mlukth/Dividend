<template>
  <div class="inverter-detail-page">
    <!-- 1. 顶部标题与状态栏 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="device-title">
          {{ deviceInfo.inverterName }}
          <span class="device-sn-tag">#{{ deviceInfo.inverterSN }}</span>
        </h1>
      </div>
      <div class="header-right">
        <div class="status-wrapper" @click="showStatusHistory = true">
          <span
            class="status-indicator"
            :class="`status-${deviceInfo.deviceStatus.toLowerCase()}`"
          ></span>
          <span class="status-text" :class="`text-${deviceInfo.deviceStatus.toLowerCase()}`">
            {{ deviceInfo.deviceStatus === 'Online' ? '运行中' : deviceInfo.deviceStatus === 'Offline' ? '离线' : '故障' }}
          </span>
        </div>
      </div>
    </div>

    <!-- 2. 核心指标概览区 -->
    <el-row :gutter="20" class="overview-section">
      <!-- 卡片1：实时功率 -->
      <el-col :span="6">
        <el-card class="overview-card power-card" shadow="hover">
          <div class="card-content">
            <div class="card-label">实时功率 / 额定功率</div>
            <div class="gauge-container">
              <div ref="powerGaugeRef" class="power-gauge"></div>
            </div>
            <div class="power-values">
              <span class="current-power">{{ deviceInfo.realTimePower }} kW</span>
              <span class="rated-power">/ {{ deviceInfo.ratedPower }} kW</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 卡片2：当日电量 -->
      <el-col :span="6">
        <el-card class="overview-card energy-card" shadow="hover">
          <div class="card-content">
            <div class="card-label">当日电量</div>
            <div class="energy-main">
              <span class="energy-value">{{ deviceInfo.dailyEnergy }}</span>
              <span class="energy-unit">kWh</span>
            </div>
            <div class="sub-info">
              <span class="sub-label">当日等效小时数: </span>
              <span class="sub-value">{{ deviceInfo.dailyEquivalentHours }} h</span>
              <span class="trend-icon" :class="deviceInfo.yoyTrend > 0 ? 'trend-up' : 'trend-down'">
                {{ deviceInfo.yoyTrend > 0 ? '↑' : '↓' }} {{ Math.abs(deviceInfo.yoyTrend) }}%
              </span>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 卡片3：累计电量 -->
      <el-col :span="6">
        <el-card class="overview-card total-energy-card" shadow="hover">
          <div class="card-content">
            <div class="card-label">累计电量</div>
            <div class="energy-main">
              <span class="energy-value">{{ deviceInfo.totalEnergy }}</span>
              <span class="energy-unit">MWh</span>
            </div>
            <div class="sub-info">
              <span class="sub-label">累计等效小时数: </span>
              <span class="sub-value">{{ deviceInfo.totalEquivalentHours }} h</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 卡片4：关键时间 -->
      <el-col :span="6">
        <el-card class="overview-card time-card" shadow="hover">
          <div class="card-content">
            <div class="card-label">数据更新</div>
            <div class="time-main">
              <div class="update-time">
                <el-icon class="refresh-icon" :class="{ 'is-rotating': isRefreshing }" @click="handleRefresh">
                  <Refresh />
                </el-icon>
                {{ formatTime(deviceInfo.updateTime) }}
              </div>
            </div>
            <div class="sub-info">
              <span class="sub-label">数据时间戳: </span>
              <span class="sub-value">{{ formatTimestamp(deviceInfo.dataTimestamp) }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 3. 实时数据监控区 -->
    <el-row :gutter="20" class="monitor-section">
      <!-- 左侧：实时功率趋势图 -->
      <el-col :span="17">
        <el-card class="detail-card chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>最近1小时实时功率趋势</span>
            </div>
          </template>
          <div ref="realTimeChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 右侧：实时参数列表 -->
      <el-col :span="7">
        <el-card class="detail-card params-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>实时参数</span>
            </div>
          </template>
          <div class="params-list">
            <div class="param-item">
              <span class="param-icon">⚡</span>
              <span class="param-label">额定功率</span>
              <span class="param-value">{{ deviceInfo.ratedPower }} kW</span>
            </div>
            <div class="param-item highlight">
              <span class="param-icon">📈</span>
              <span class="param-label">实时功率</span>
              <span class="param-value">{{ deviceInfo.realTimePower }} kW</span>
            </div>
            <div class="param-item">
              <span class="param-icon">🕐</span>
              <span class="param-label">当日等效小时数</span>
              <span class="param-value">{{ deviceInfo.dailyEquivalentHours }} h</span>
            </div>
            <div class="param-item">
              <span class="param-icon">🏠</span>
              <span class="param-label">所属电站</span>
              <span class="param-value link" @click="goToStation">{{ deviceInfo.stationName }}</span>
            </div>
            <div class="param-item">
              <span class="param-icon">🔢</span>
              <span class="param-label">数据ID</span>
              <span class="param-value">{{ deviceInfo.dataId }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 4. 历史数据趋势区 -->
    <el-row :gutter="20" class="history-section">
      <!-- 左侧：当日发电量趋势 -->
      <el-col :span="12">
        <el-card class="detail-card chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>当日发电量趋势 (0-24时)</span>
            </div>
          </template>
          <div ref="dailyChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 右侧：累计电量与等效小时数趋势 -->
      <el-col :span="12">
        <el-card class="detail-card chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>累计趋势分析</span>
              <el-radio-group v-model="trendPeriod" size="small" @change="updateTrendChart">
                <el-radio-button label="7">近7天</el-radio-button>
                <el-radio-button label="30">近30天</el-radio-button>
                <el-radio-button label="90">近半年</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="trendChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 5. 设备静态信息区 -->
    <el-row :gutter="20" class="static-info-section">
      <!-- 左列：基础属性 -->
      <el-col :span="12">
        <el-card class="detail-card info-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>基础属性</span>
            </div>
          </template>
          <div class="info-content">
            <div class="device-thumbnail-wrapper">
              <img src="https://images.unsplash.com/photo-1509391366360-2e959784a276?w=300&h=200&fit=crop" alt="Inverter" class="device-thumbnail">
            </div>
            <div class="info-list">
              <div class="info-item">
                <span class="info-label">逆变器名称</span>
                <span class="info-value">{{ deviceInfo.inverterName }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">设备型号</span>
                <span class="info-value">{{ deviceInfo.deviceModel }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">产品型号</span>
                <span class="info-value">{{ deviceInfo.productModel }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">逆变器SN</span>
                <span class="info-value copyable" @click="copyText(deviceInfo.inverterSN)">{{ deviceInfo.inverterSN }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">数据ID</span>
                <span class="info-value">{{ deviceInfo.dataId }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右列：安装与生命周期 -->
      <el-col :span="12">
        <el-card class="detail-card info-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>安装与生命周期</span>
            </div>
          </template>
          <div class="info-content">
            <div class="info-list">
              <div class="info-item">
                <span class="info-label">安装地址</span>
                <span class="info-value location" @click="showMap = true">
                  <el-icon><Location /></el-icon>
                  {{ deviceInfo.installAddress }}
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">所属电站</span>
                <span class="info-value link" @click="goToStation">{{ deviceInfo.stationName }}</span>
              </div>
              <div class="info-item timeline-item">
                <div class="timeline-dot start"></div>
                <span class="info-label">投产时间</span>
                <span class="info-value">{{ formatDate(deviceInfo.productionDate) }}</span>
              </div>
              <div class="timeline-line"></div>
              <div class="info-item timeline-item">
                <div class="timeline-dot end"></div>
                <span class="info-label">质保到期时间</span>
                <span class="info-value" :class="{ 'warning-text': isWarrantyNear }">{{ formatDate(deviceInfo.warrantyExpiryDate) }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 6. 质保与生命周期区 -->
    <el-card class="detail-card warranty-card" shadow="hover">
      <div class="warranty-content">
        <!-- 左侧：质保倒计时 -->
        <div class="warranty-left">
          <div class="warranty-label">质保到期时间</div>
          <div class="warranty-date">{{ formatDate(deviceInfo.warrantyExpiryDate) }}</div>
          <div class="countdown-wrapper" :class="{ 'warning': isWarrantyNear }">
            <span v-if="isWarrantyNear" class="warning-icon"><el-icon><Warning /></el-icon></span>
            <span class="countdown-days">{{ warrantyDaysLeft }}</span>
            <span class="countdown-unit">天</span>
          </div>
          <div class="countdown-label">剩余天数</div>
        </div>

        <!-- 右侧：3D模型占位与时间轴 -->
        <div class="warranty-right">
          <div class="model-placeholder">
            <!-- 这里可以放置3D模型或高质量图片 -->
            <div class="model-bg">
              <el-icon class="model-icon"><Monitor /></el-icon>
            </div>
          </div>
          <div class="lifecycle-timeline">
            <div class="timeline-node start-node">
              <div class="node-dot"></div>
              <div class="node-label">投产</div>
              <div class="node-date">{{ formatDate(deviceInfo.productionDate) }}</div>
            </div>
            <div class="timeline-connector">
              <div class="connector-line" :style="{ width: `${lifecycleProgress}%` }"></div>
            </div>
            <div class="timeline-node current-node">
              <div class="node-dot"></div>
              <div class="node-label">已运行</div>
              <div class="node-date">{{ totalRunningDays }} 天</div>
            </div>
            <div class="timeline-connector">
              <div class="connector-line" :style="{ width: `${100 - lifecycleProgress}%` }"></div>
            </div>
            <div class="timeline-node end-node">
              <div class="node-dot"></div>
              <div class="node-label">质保到期</div>
              <div class="node-date">{{ formatDate(deviceInfo.warrantyExpiryDate) }}</div>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 模拟弹窗：状态历史 -->
    <el-dialog v-model="showStatusHistory" title="设备状态历史记录" width="500px">
      <el-timeline>
        <el-timeline-item
          v-for="(item, index) in statusHistory"
          :key="index"
          :timestamp="item.time"
          :type="item.type"
        >
          {{ item.content }}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>

    <!-- 模拟弹窗：地图 -->
    <el-dialog v-model="showMap" title="电站位置" width="600px">
      <div class="map-placeholder">
        <el-icon><Location /></el-icon>
        <p>{{ deviceInfo.installAddress }}</p>
        <p class="sub-text">（此处可接入真实地图组件）</p>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Location, Warning, Monitor } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

// --- 1. 响应式数据定义 ---
const deviceInfo = ref({
  inverterSN: 'INVT-SG-2025-0824-A001',
  ratedPower: 50,
  realTimePower: 32.5,
  dailyEnergy: 245.8,
  totalEnergy: 125.6,
  installAddress: '江西省赣州市章贡区光伏产业园A区12号',
  dataTimestamp: Date.now() - 60000,
  updateTime: Date.now(),
  productionDate: new Date('2023-08-15').getTime(),
  dailyEquivalentHours: 4.92,
  dataId: 'DEV-2023-0824-001X',
  deviceModel: 'INVT-SG-50KTL',
  inverterName: '组串式逆变器 #A1',
  productModel: 'SolarGuard 5000 Pro',
  stationName: '赣州高新区10MW光伏电站',
  totalEquivalentHours: 2512,
  warrantyExpiryDate: new Date('2028-08-14').getTime(),
  deviceStatus: 'Online', // Online, Offline, Fault
  yoyTrend: 12.5 // 同比趋势
})

// UI 状态
const isRefreshing = ref(false)
const showStatusHistory = ref(false)
const showMap = ref(false)
const trendPeriod = ref('30')

// 图表 Ref
const powerGaugeRef = ref(null)
const realTimeChartRef = ref(null)
const dailyChartRef = ref(null)
const trendChartRef = ref(null)

// 图表实例
let powerGaugeChart = null
let realTimeChart = null
let dailyChart = null
let trendChart = null

// 模拟状态历史
const statusHistory = ref([
  { time: '2026-03-25 14:30:00', content: '设备恢复正常运行', type: 'success' },
  { time: '2026-03-25 14:28:00', content: '直流侧电压波动告警消除', type: 'info' },
  { time: '2026-03-25 14:25:00', content: '检测到直流侧电压轻微波动', type: 'warning' },
  { time: '2026-03-24 06:00:00', content: '设备启动，开始并网发电', type: 'success' }
])

// --- 2. 计算属性 ---
const warrantyDaysLeft = computed(() => {
  const now = new Date()
  const expiry = new Date(deviceInfo.value.warrantyExpiryDate)
  const diff = expiry - now
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
})

const isWarrantyNear = computed(() => warrantyDaysLeft.value < 540) // 约1年半

const totalRunningDays = computed(() => {
  const now = new Date()
  const start = new Date(deviceInfo.value.productionDate)
  const diff = now - start
  return Math.floor(diff / (1000 * 60 * 60 * 24))
})

const lifecycleProgress = computed(() => {
  const total = new Date(deviceInfo.value.warrantyExpiryDate) - new Date(deviceInfo.value.productionDate)
  const current = Date.now() - new Date(deviceInfo.value.productionDate)
  return Math.min(100, Math.max(0, (current / total) * 100))
})

// --- 3. 方法 ---
const formatTime = (ts) => {
  return new Date(ts).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

const formatDate = (ts) => {
  return new Date(ts).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

const formatTimestamp = (ts) => {
  return new Date(ts).toISOString().replace('T', ' ').substring(0, 19)
}

const handleRefresh = () => {
  isRefreshing.value = true
  // 模拟刷新
  setTimeout(() => {
    deviceInfo.value.updateTime = Date.now()
    deviceInfo.value.realTimePower = +(30 + Math.random() * 10).toFixed(1)
    isRefreshing.value = false
    ElMessage.success('数据已刷新')
    // 更新图表
    if (realTimeChart) updateRealTimeChartData()
  }, 800)
}

const copyText = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('SN已复制到剪贴板')
  })
}

const goToStation = () => {
  ElMessage.info(`正在跳转到电站: ${deviceInfo.value.stationName}`)
}

// --- 4. 图表初始化 ---

// 功率仪表盘
const initPowerGauge = () => {
  if (!powerGaugeRef.value) return
  powerGaugeChart = echarts.init(powerGaugeRef.value)
  const option = {
    series: [{
      type: 'gauge',
      startAngle: 180,
      endAngle: 0,
      min: 0,
      max: deviceInfo.value.ratedPower,
      splitNumber: 5,
      itemStyle: {
        color: '#0066CC',
        shadowColor: 'rgba(0,102,204,0.3)',
        shadowBlur: 10
      },
      progress: {
        show: true,
        width: 12,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#165DFF' },
            { offset: 1, color: '#0066CC' }
          ])
        }
      },
      pointer: { show: false },
      axisLine: {
        lineStyle: {
          width: 12,
          color: [[1, '#E5E6EB']]
        }
      },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      detail: { show: false },
      data: [{ value: deviceInfo.value.realTimePower }]
    }]
  }
  powerGaugeChart.setOption(option)
}

// 实时功率趋势图
const initRealTimeChart = () => {
  if (!realTimeChartRef.value) return
  realTimeChart = echarts.init(realTimeChartRef.value)
  
  // 模拟数据
  const times = Array.from({ length: 60 }, (_, i) => `${String(14 * 60 + i - 60).padStart(2, '0').slice(-2)}:00`)
  const data = Array.from({ length: 60 }, () => +(25 + Math.random() * 15).toFixed(1))

  const option = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: times },
    yAxis: { type: 'value', name: 'kW' },
    series: [{
      name: '实时功率',
      type: 'line',
      smooth: true,
      symbol: 'none',
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(0,102,204,0.3)' },
          { offset: 1, color: 'rgba(0,102,204,0.05)' }
        ])
      },
      lineStyle: { color: '#0066CC', width: 2 },
      data: data
    }]
  }
  realTimeChart.setOption(option)
}

const updateRealTimeChartData = () => {
  if (!realTimeChart) return
  // 简单模拟数据跳动
  const option = realTimeChart.getOption()
  const lastVal = option.series[0].data[59]
  const newVal = Math.max(0, Math.min(deviceInfo.value.ratedPower, lastVal + (Math.random() - 0.5) * 5))
  option.series[0].data[59] = deviceInfo.value.realTimePower
  realTimeChart.setOption(option)
}

// 当日发电量柱状图
const initDailyChart = () => {
  if (!dailyChartRef.value) return
  dailyChart = echarts.init(dailyChartRef.value)
  
  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`)
  const data = Array.from({ length: 24 }, (_, i) => {
    if (i < 6 || i > 18) return 0
    return +(Math.sin((i - 6) / 12 * Math.PI) * 20 + Math.random() * 5).toFixed(1)
  })

  const option = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: hours },
    yAxis: { type: 'value', name: 'kWh' },
    series: [{
      name: '发电量',
      type: 'bar',
      barWidth: '60%',
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#165DFF' },
          { offset: 1, color: '#0066CC' }
        ])
      },
      data: data
    }]
  }
  dailyChart.setOption(option)
}

// 累计趋势图
const initTrendChart = () => {
  if (!trendChartRef.value) return
  trendChart = echarts.init(trendChartRef.value)
  updateTrendChart()
}

const updateTrendChart = () => {
  if (!trendChart) return
  
  const days = parseInt(trendPeriod.value)
  const dates = Array.from({ length: days }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (days - 1 - i))
    return `${d.getMonth() + 1}/${d.getDate()}`
  })
  
  const energyData = Array.from({ length: days }, (_, i) => 100 + i * 0.8 + Math.random() * 2)
  const hoursData = Array.from({ length: days }, (_, i) => 2000 + i * 3 + Math.random() * 5)

  const option = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
    legend: { data: ['累计电量', '累计等效小时'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: dates },
    yAxis: [
      { type: 'value', name: '累计电量 (MWh)', position: 'left' },
      { type: 'value', name: '等效小时 (h)', position: 'right' }
    ],
    series: [
      {
        name: '累计电量',
        type: 'line',
        smooth: true,
        yAxisIndex: 0,
        itemStyle: { color: '#0066CC' },
        data: energyData
      },
      {
        name: '累计等效小时',
        type: 'bar',
        yAxisIndex: 1,
        itemStyle: { color: '#E5E6EB' },
        data: hoursData
      }
    ]
  }
  trendChart.setOption(option)
}

// --- 5. 生命周期 ---
onMounted(() => {
  nextTick(() => {
    initPowerGauge()
    initRealTimeChart()
    initDailyChart()
    initTrendChart()

    // 监听窗口大小变化
    window.addEventListener('resize', () => {
      powerGaugeChart && powerGaugeChart.resize()
      realTimeChart && realTimeChart.resize()
      dailyChart && dailyChart.resize()
      trendChart && trendChart.resize()
    })
  })
})
</script>

<style scoped lang="scss">
/* 全局变量与重置 */
$primary-color: #0066CC;
$secondary-color: #165DFF;
$success-color: #00B42A;
$warning-color: #FF7D00;
$danger-color: #F53F3F;
$text-main: #1D2129;
$text-secondary: #4E5969;
$text-weak: #86909C;
$bg-color: #F5F7FA;
$card-bg: #FFFFFF;
$border-color: #E5E6EB;

.inverter-detail-page {
  padding: 0;
  background-color: $bg-color;
  min-height: calc(100vh - 80px);
  padding-bottom: 20px;
}

/* 1. 顶部标题栏 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0 20px 0;
  margin-bottom: 5px;

  .header-left {
    .device-title {
      margin: 0;
      font-size: 22px;
      font-weight: 600;
      color: $text-main;
      display: flex;
      align-items: center;
      gap: 12px;

      .device-sn-tag {
        font-size: 14px;
        font-weight: 400;
        color: $text-weak;
        background: #F2F3F5;
        padding: 2px 8px;
        border-radius: 4px;
      }
    }
  }

  .header-right {
    .status-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      padding: 6px 12px;
      border-radius: 20px;
      background: white;
      border: 1px solid $border-color;
      transition: all 0.3s;

      &:hover {
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      }

      .status-indicator {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        display: inline-block;
        
        &.status-online { background-color: $success-color; box-shadow: 0 0 8px $success-color; }
        &.status-offline { background-color: $text-weak; }
        &.status-fault { background-color: $danger-color; box-shadow: 0 0 8px $danger-color; }
      }

      .status-text {
        font-weight: 500;
        &.text-online { color: $success-color; }
        &.text-offline { color: $text-weak; }
        &.text-fault { color: $danger-color; }
      }
    }
  }
}

/* 2. 概览区通用卡片样式 */
.overview-section {
  margin-bottom: 20px;

  .overview-card {
    border: none;
    border-radius: 12px;
    height: 180px;
    transition: transform 0.3s;

    &:hover {
      transform: translateY(-2px);
    }

    .card-content {
      display: flex;
      flex-direction: column;
      height: 100%;
      justify-content: space-between;
      text-align: center;

      .card-label {
        font-size: 14px;
        color: $text-secondary;
        margin-bottom: 10px;
      }
    }

    /* 功率卡片特殊样式 */
    &.power-card {
      background: linear-gradient(135deg, #EEF7FF 0%, #FFFFFF 100%);
      
      .gauge-container {
        height: 80px;
        margin: -10px 0;
      }
      
      .power-values {
        .current-power { font-size: 24px; font-weight: 700; color: $primary-color; }
        .rated-power { font-size: 14px; color: $text-weak; margin-left: 4px; }
      }
    }

    /* 电量卡片通用 */
    .energy-main {
      margin: 10px 0;
      .energy-value { font-size: 32px; font-weight: 700; color: $text-main; }
      .energy-unit { font-size: 16px; color: $text-secondary; margin-left: 4px; }
    }

    .sub-info {
      font-size: 13px;
      color: $text-secondary;
      
      .sub-value { font-weight: 500; }
      .trend-icon {
        margin-left: 8px;
        font-weight: 600;
        &.trend-up { color: $success-color; }
        &.trend-down { color: $warning-color; }
      }
    }

    /* 累计卡片背景 */
    &.total-energy-card {
      position: relative;
      overflow: hidden;
      &::after {
        content: '';
        position: absolute;
        right: -20px;
        bottom: -20px;
        width: 120px;
        height: 120px;
        background-image: url('data:image/svg+xml;utf8,<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="10" width="30" height="15" fill="%230066CC" opacity="0.1"/><rect x="45" y="10" width="30" height="15" fill="%230066CC" opacity="0.1"/><rect x="10" y="30" width="30" height="15" fill="%230066CC" opacity="0.1"/><rect x="45" y="30" width="30" height="15" fill="%230066CC" opacity="0.1"/></svg>');
        background-size: contain;
        opacity: 0.4;
        pointer-events: none;
      }
    }

    /* 时间卡片 */
    &.time-card {
      .time-main {
        margin: 15px 0;
        .update-time {
          font-size: 20px;
          font-weight: 600;
          color: $text-main;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          
          .refresh-icon {
            cursor: pointer;
            font-size: 18px;
            color: $primary-color;
            transition: transform 0.3s;
            &.is-rotating { animation: rotate 1s linear infinite; }
            &:hover { color: $secondary-color; }
          }
        }
      }
    }
  }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 3. 详情卡片通用 */
.monitor-section, .history-section, .static-info-section {
  margin-bottom: 20px;
}

.detail-card {
  border: none;
  border-radius: 12px;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
    color: $text-main;
  }
  
  .chart-container {
    height: 300px;
    width: 100%;
  }
}

/* 参数列表 */
.params-card {
  .params-list {
    padding: 10px 0;
    
    .param-item {
      display: flex;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid $border-color;
      
      &:last-child { border-bottom: none; }
      &.highlight { background: #EEF7FF; margin: 0 -20px; padding: 12px 20px; border-radius: 8px; }
      
      .param-icon { font-size: 18px; margin-right: 12px; width: 24px; text-align: center; }
      .param-label { flex: 1; color: $text-secondary; font-size: 14px; }
      .param-value { font-weight: 600; color: $text-main; font-size: 15px; 
        &.link { color: $primary-color; cursor: pointer; &:hover { text-decoration: underline; } }
      }
    }
  }
}

/* 静态信息 */
.info-card {
  .info-content {
    display: flex;
    gap: 30px;
    
    .device-thumbnail-wrapper {
      flex-shrink: 0;
      .device-thumbnail {
        width: 150px;
        height: 100px;
        object-fit: cover;
        border-radius: 8px;
        border: 1px solid $border-color;
      }
    }
    
    .info-list {
      flex: 1;
      width: 100%;
      position: relative;
      
      .info-item {
        display: flex;
        padding: 8px 0;
        
        .info-label {
          width: 120px;
          color: $text-secondary;
          font-size: 14px;
          flex-shrink: 0;
        }
        .info-value {
          color: $text-main;
          font-weight: 500;
          flex: 1;
          
          &.copyable { color: $primary-color; cursor: pointer; &:hover { text-decoration: underline; } }
          &.location { display: flex; align-items: center; gap: 5px; cursor: pointer; color: $primary-color; }
          &.link { color: $primary-color; cursor: pointer; &:hover { text-decoration: underline; } }
          &.warning-text { color: $warning-color; font-weight: 700; }
        }
        
        /* 简易时间轴样式 */
        &.timeline-item {
          position: relative;
          padding-left: 25px;
          .timeline-dot {
            position: absolute;
            left: 0;
            top: 12px;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            &.start { background-color: $success-color; }
            &.end { background-color: $warning-color; }
          }
        }
      }
      
      .timeline-line {
        position: absolute;
        left: 4px;
        top: 40px;
        bottom: 40px;
        width: 2px;
        background-color: $border-color;
      }
    }
  }
}

/* 质保卡片 */
.warranty-card {
  background: linear-gradient(135deg, #EEF7FF 0%, #FFFFFF 100%);
  border: none;
  
  .warranty-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 0;
    
    .warranty-left {
      text-align: center;
      padding: 0 40px;
      border-right: 1px solid $border-color;
      
      .warranty-label { font-size: 14px; color: $text-secondary; margin-bottom: 5px; }
      .warranty-date { font-size: 16px; font-weight: 600; color: $text-main; margin-bottom: 20px; }
      
      .countdown-wrapper {
        display: flex;
        align-items: baseline;
        justify-content: center;
        gap: 8px;
        
        .warning-icon { color: $warning-color; font-size: 24px; animation: pulse 1.5s infinite; }
        .countdown-days { font-size: 48px; font-weight: 800; color: $primary-color; line-height: 1; }
        .countdown-unit { font-size: 18px; color: $text-secondary; }
        
        &.warning {
          .countdown-days { color: $warning-color; }
        }
      }
      .countdown-label { font-size: 13px; color: $text-weak; margin-top: 8px; }
    }
    
    .warranty-right {
      flex: 1;
      padding: 0 40px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 30px;
      
      .model-placeholder {
        .model-bg {
          width: 100px;
          height: 60px;
          background: rgba(0,102,204,0.05);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px dashed $border-color;
          
          .model-icon { font-size: 32px; color: $primary-color; opacity: 0.5; }
        }
      }
      
      .lifecycle-timeline {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        
        .timeline-node {
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 2;
          background: white;
          padding: 0 10px;
          
          .node-dot {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            border: 3px solid white;
            margin-bottom: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .node-label { font-size: 12px; color: $text-secondary; }
          .node-date { font-size: 13px; font-weight: 600; color: $text-main; }
          
          &.start-node .node-dot { background-color: $success-color; }
          &.current-node .node-dot { background-color: $primary-color; transform: scale(1.2); }
          &.end-node .node-dot { background-color: $warning-color; }
        }
        
        .timeline-connector {
          flex: 1;
          height: 4px;
          background: $border-color;
          border-radius: 2px;
          position: relative;
          margin: 0 -10px;
          z-index: 1;
          
          .connector-line {
            position: absolute;
            left: 0;
            top: 0;
            height: 100%;
            background: linear-gradient(90deg, $success-color, $primary-color);
            border-radius: 2px;
            transition: width 1s ease;
          }
        }
      }
    }
  }
}

@keyframes pulse {
  0% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.1); }
  100% { opacity: 1; transform: scale(1); }
}

/* 弹窗占位符样式 */
.map-placeholder {
  height: 300px;
  background: #F7F8FA;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: $text-weak;
  border-radius: 8px;
  
  .el-icon { font-size: 48px; color: $primary-color; margin-bottom: 16px; }
  p { margin: 0; font-size: 16px; }
  .sub-text { font-size: 14px; color: $text-weak; margin-top: 8px; }
}
</style>