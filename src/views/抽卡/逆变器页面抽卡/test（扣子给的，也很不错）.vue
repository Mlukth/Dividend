<template>
  <div class="inverter-detail-container">
    <!-- 顶部状态预警横幅 -->
    <transition name="slide-down">
      <div v-if="deviceStatus === 'fault'" class="alert-banner alert-danger">
        <span class="alert-icon">⚠️</span>
        <span class="alert-text">设备故障：{{ faultMessage }}</span>
        <button class="alert-close" @click="dismissAlert">✕</button>
      </div>
    </transition>

    <!-- 页面标题区 -->
    <div class="page-header">
      <div class="breadcrumb">
        <span class="breadcrumb-item">电站管理</span>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-item">电站详情</span>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-item active">逆变器详情</span>
      </div>
      <div class="header-main">
        <h1 class="page-title">{{ inverterData.inverterName }}</h1>
        <div class="header-actions">
          <button class="btn btn-outline" @click="exportReport">
            <span class="btn-icon">📥</span>
            导出报告
          </button>
          <button class="btn btn-primary" @click="refreshData">
            <span class="btn-icon">🔄</span>
            刷新数据
          </button>
        </div>
      </div>
      <div class="last-update">
        <span class="update-label">上次更新：</span>
        <span class="update-time">{{ formatTimestamp(lastUpdateTime) }}</span>
        <span class="auto-refresh">自动刷新中</span>
      </div>
    </div>

    <!-- 核心监控区 -->
    <div class="monitor-section">
      <!-- 3D设备模型 -->
      <div class="model-card">
        <div class="card-header">
          <h3 class="card-title">设备模型</h3>
          <div class="card-actions">
            <button class="icon-btn" @click="rotateLeft" title="向左旋转">↺</button>
            <button class="icon-btn" @click="resetModel" title="重置视角">⌂</button>
            <button class="icon-btn" @click="rotateRight" title="向右旋转">↻</button>
          </div>
        </div>
        <div class="model-container" ref="modelContainer">
          <div class="model-placeholder">
            <div class="model-visual">
              <div class="device-body" :class="deviceStatusClass">
                <div class="device-status-light"></div>
                <div class="device-screen">
                  <div class="screen-content">
                    <span class="screen-value">{{ inverterData.realTimePower }}</span>
                    <span class="screen-unit">kW</span>
                  </div>
                </div>
                <div class="device-vents"></div>
              </div>
            </div>
            <div class="model-info">
              <p class="model-model-name">{{ inverterData.deviceModel }}</p>
              <p class="model-sn">SN: {{ inverterData.inverterSN }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 实时功率曲线图 -->
      <div class="chart-card main-chart">
        <div class="card-header">
          <h3 class="card-title">实时功率曲线</h3>
          <div class="time-tabs">
            <button
              v-for="period in timePeriods"
              :key="period.value"
              class="time-tab"
              :class="{ active: selectedPeriod === period.value }"
              @click="selectPeriod(period.value)"
            >
              {{ period.label }}
            </button>
          </div>
        </div>
        <div class="chart-container" ref="realtimeChart"></div>
      </div>

      <!-- 关键指标卡片组 -->
      <div class="metrics-card">
        <div class="card-header">
          <h3 class="card-title">关键指标</h3>
          <span class="status-badge" :class="deviceStatusClass">
            {{ statusText }}
          </span>
        </div>
        <div class="metrics-grid">
          <!-- L1 核心指标 -->
          <div class="metric-item metric-large">
            <div class="metric-label">实时功率</div>
            <div class="metric-value primary">
              {{ inverterData.realTimePower }}
              <span class="metric-unit">kW</span>
            </div>
            <div class="metric-trend" :class="powerTrendClass">
              {{ powerTrendIcon }} {{ powerTrendValue }}%
            </div>
          </div>
          <div class="metric-item metric-large">
            <div class="metric-label">当日电量</div>
            <div class="metric-value success">
              {{ inverterData.dailyEnergy }}
              <span class="metric-unit">kWh</span>
            </div>
            <div class="metric-sub">
              目标: {{ dailyTarget }} kWh
            </div>
          </div>
          <div class="metric-item metric-large">
            <div class="metric-label">设备状态</div>
            <div class="metric-status" :class="deviceStatusClass">
              <span class="status-icon">{{ statusIcon }}</span>
              <span class="status-text">{{ statusText }}</span>
            </div>
          </div>
          
          <!-- L2 重要指标 -->
          <div class="metric-item">
            <div class="metric-label">额定功率</div>
            <div class="metric-value">
              {{ inverterData.ratedPower }}
              <span class="metric-unit">kW</span>
            </div>
            <div class="metric-bar">
              <div class="bar-fill" :style="{ width: utilizationRate + '%' }"></div>
            </div>
            <div class="metric-sub">利用率 {{ utilizationRate }}%</div>
          </div>
          <div class="metric-item">
            <div class="metric-label">当日等效小时数</div>
            <div class="metric-value">
              {{ inverterData.dailyEquivalentHours }}
              <span class="metric-unit">h</span>
            </div>
            <div class="metric-sub">
              <span :class="hoursTrendClass">{{ hoursTrendIcon }}</span>
              较昨日 {{ hoursTrendValue }}h
            </div>
          </div>
          <div class="metric-item">
            <div class="metric-label">累计电量</div>
            <div class="metric-value">
              {{ formatLargeNumber(inverterData.cumulativeEnergy) }}
              <span class="metric-unit">kWh</span>
            </div>
            <div class="metric-sub">
              累计等效: {{ inverterData.cumulativeEquivalentHours }}h
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 详细信息区 -->
    <div class="detail-section">
      <!-- 左侧：基础信息卡片 -->
      <div class="detail-left">
        <!-- 设备标识信息 -->
        <div class="info-card">
          <div class="card-header">
            <h3 class="card-title">设备标识信息</h3>
            <button class="icon-btn" @click="copyIdentifier" title="复制标识">📋</button>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">逆变器SN</span>
              <span class="info-value">{{ inverterData.inverterSN }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">数据ID</span>
              <span class="info-value">{{ inverterData.dataId }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">设备型号</span>
              <span class="info-value">{{ inverterData.deviceModel }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">产品型号</span>
              <span class="info-value">{{ inverterData.productModel }}</span>
            </div>
          </div>
        </div>

        <!-- 设备命名与归属 -->
        <div class="info-card">
          <div class="card-header">
            <h3 class="card-title">设备命名与归属</h3>
          </div>
          <div class="info-grid">
            <div class="info-item full-width">
              <span class="info-label">逆变器名称</span>
              <span class="info-value highlight">{{ inverterData.inverterName }}</span>
            </div>
            <div class="info-item full-width">
              <span class="info-label">所属电站</span>
              <span class="info-value link" @click="goToStation">
                {{ inverterData.belongStation }}
              </span>
            </div>
          </div>
        </div>

        <!-- 位置信息 -->
        <div class="info-card">
          <div class="card-header">
            <h3 class="card-title">安装位置信息</h3>
            <button class="icon-btn" @click="toggleMap" title="查看地图">📍</button>
          </div>
          <div class="info-grid">
            <div class="info-item full-width">
              <span class="info-label">安装地址</span>
              <span class="info-value">{{ inverterData.installAddress }}</span>
            </div>
          </div>
          <transition name="expand">
            <div v-show="showMap" class="map-container">
              <div class="map-placeholder">
                <div class="map-icon">🗺️</div>
                <p class="map-text">设备位置地图</p>
                <p class="map-subtext">{{ inverterData.installAddress }}</p>
                <button class="map-btn" @click="openFullMap">查看完整地图</button>
              </div>
            </div>
          </transition>
        </div>

        <!-- 时间信息 -->
        <div class="info-card">
          <div class="card-header">
            <h3 class="card-title">时间信息</h3>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">投产时间</span>
              <span class="info-value">{{ formatDate(inverterData.commissioningTime) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">质保到期</span>
              <span class="info-value" :class="warrantyClass">
                {{ formatDate(inverterData.warrantyExpiration) }}
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">数据时间戳</span>
              <span class="info-value small">{{ formatTimestamp(inverterData.dataTimestamp) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">更新时间</span>
              <span class="info-value small">{{ formatTimestamp(inverterData.updateTime) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：统计与图表 -->
      <div class="detail-right">
        <!-- 能效分析图表 -->
        <div class="chart-card large">
          <div class="card-header">
            <h3 class="card-title">30天能效分析</h3>
            <div class="chart-legend">
              <span class="legend-item">
                <span class="legend-color primary"></span>
                发电量
              </span>
              <span class="legend-item">
                <span class="legend-color success"></span>
                等效小时数
              </span>
            </div>
          </div>
          <div class="chart-container" ref="efficiencyChart"></div>
        </div>

        <!-- 性能指标 -->
        <div class="performance-card">
          <div class="card-header">
            <h3 class="card-title">性能指标统计</h3>
          </div>
          <div class="performance-grid">
            <div class="performance-item">
              <div class="perf-icon">⚡</div>
              <div class="perf-content">
                <div class="perf-label">平均发电量</div>
                <div class="perf-value">{{ averageDailyEnergy }} kWh/天</div>
              </div>
            </div>
            <div class="performance-item">
              <div class="perf-icon">📈</div>
              <div class="perf-content">
                <div class="perf-label">平均等效小时</div>
                <div class="perf-value">{{ averageEquivalentHours }} h/天</div>
              </div>
            </div>
            <div class="performance-item">
              <div class="perf-icon">💯</div>
              <div class="perf-content">
                <div class="perf-label">设备可用率</div>
                <div class="perf-value">{{ availabilityRate }}%</div>
              </div>
            </div>
            <div class="performance-item">
              <div class="perf-icon">🎯</div>
              <div class="perf-content">
                <div class="perf-label">目标完成率</div>
                <div class="perf-value" :class="completionClass">{{ completionRate }}%</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 时间轴信息图 -->
        <div class="timeline-card">
          <div class="card-header">
            <h3 class="card-title">设备生命周期</h3>
          </div>
          <div class="timeline-container">
            <div class="timeline-line"></div>
            <div class="timeline-item completed">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <div class="timeline-date">{{ formatDate(inverterData.commissioningTime) }}</div>
                <div class="timeline-label">投产时间</div>
              </div>
            </div>
            <div class="timeline-item completed">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <div class="timeline-date">{{ formatDate(inverterData.firstGridTime) }}</div>
                <div class="timeline-label">首次并网</div>
              </div>
            </div>
            <div class="timeline-item current">
              <div class="timeline-dot current"></div>
              <div class="timeline-content">
                <div class="timeline-date">{{ formatTimestamp(inverterData.dataTimestamp) }}</div>
                <div class="timeline-label">当前运行</div>
                <div class="timeline-badge">{{ runningDays }}天运行</div>
              </div>
            </div>
            <div class="timeline-item upcoming">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <div class="timeline-date">{{ formatDate(inverterData.warrantyExpiration) }}</div>
                <div class="timeline-label">质保到期</div>
                <div class="timeline-sub">剩余 {{ warrantyDays }} 天</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 设备状态详情 -->
        <div class="status-card">
          <div class="card-header">
            <h3 class="card-title">设备状态详情</h3>
          </div>
          <div class="status-detail">
            <div class="status-main" :class="deviceStatusClass">
              <div class="status-large-icon">{{ statusLargeIcon }}</div>
              <div class="status-main-text">
                <div class="status-main-title">{{ statusText }}</div>
                <div class="status-main-desc">{{ statusDescription }}</div>
              </div>
            </div>
            <div class="status-metrics">
              <div class="status-metric">
                <span class="metric-label">运行温度</span>
                <span class="metric-value">{{ deviceTemperature }}°C</span>
              </div>
              <div class="status-metric">
                <span class="metric-label">电网频率</span>
                <span class="metric-value">{{ gridFrequency }} Hz</span>
              </div>
              <div class="status-metric">
                <span class="metric-label">功率因数</span>
                <span class="metric-value">{{ powerFactor }}</span>
              </div>
              <div class="status-metric">
                <span class="metric-label">效率</span>
                <span class="metric-value">{{ inverterEfficiency }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast 提示 -->
    <transition name="toast">
      <div v-if="toast.show" class="toast" :class="toast.type">
        <span class="toast-icon">{{ toast.icon }}</span>
        <span class="toast-message">{{ toast.message }}</span>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import { useRouter } from 'vue-router'

const router = useRouter()

// ==================== 数据定义 ====================

// 模拟的逆变器数据
const inverterData = ref({
  inverterSN: 'INV-2024-03-0015',
  ratedPower: 50,
  realTimePower: 45.2,
  dailyEnergy: 210,
  cumulativeEnergy: 125680,
  installAddress: '山东省青岛市即墨区蓝村镇光伏电站A区3号方阵',
  dataTimestamp: Date.now() - 300000,
  updateTime: Date.now() - 120000,
  commissioningTime: new Date('2023-06-15').getTime(),
  dailyEquivalentHours: 4.2,
  dataId: 'DATA-INV-2024-03-15-170',
  deviceModel: 'SUN-50KTL-M1',
  inverterName: 'A区3号方阵-逆变器15',
  productModel: 'SUN-50KTL-M1-Pro',
  belongStation: '青岛蓝村镇100MW光伏电站',
  cumulativeEquivalentHours: 2513.6,
  warrantyExpiration: new Date('2033-06-15').getTime(),
  deviceStatus: 'running', // running, fault, stopped
  firstGridTime: new Date('2023-06-16').getTime()
})

// 扩展的设备状态数据
const deviceTemperature = ref(42)
const gridFrequency = ref(50.02)
const powerFactor = ref(0.98)
const inverterEfficiency = ref(98.5)
const faultMessage = ref('过压保护触发')
const firstGridTime = ref(new Date('2023-06-16').getTime())

// 最后更新时间
const lastUpdateTime = ref(Date.now())

// 自动刷新定时器
let refreshTimer = null

// Toast 状态
const toast = ref({
  show: false,
  type: 'success',
  icon: '✓',
  message: ''
})

// 控制状态
const showMap = ref(false)
const selectedPeriod = ref('24h')
const modelRotation = ref(0)

// 时间周期选项
const timePeriods = [
  { label: '1小时', value: '1h' },
  { label: '24小时', value: '24h' },
  { label: '7天', value: '7d' },
  { label: '30天', value: '30d' }
]

// 图表引用
const realtimeChart = ref(null)
const efficiencyChart = ref(null)
const modelContainer = ref(null)

// 图表实例
let realtimeChartInstance = null
let efficiencyChartInstance = null

// ==================== 计算属性 ====================

// 设备状态相关
const deviceStatus = computed(() => inverterData.value.deviceStatus)

const deviceStatusClass = computed(() => {
  return {
    'status-running': deviceStatus.value === 'running',
    'status-fault': deviceStatus.value === 'fault',
    'status-stopped': deviceStatus.value === 'stopped'
  }
})

const statusText = computed(() => {
  const statusMap = {
    running: '运行中',
    fault: '设备故障',
    stopped: '已停机'
  }
  return statusMap[deviceStatus.value]
})

const statusIcon = computed(() => {
  const iconMap = {
    running: '✅',
    fault: '⚠️',
    stopped: '⏸️'
  }
  return iconMap[deviceStatus.value]
})

const statusLargeIcon = computed(() => {
  const iconMap = {
    running: '🟢',
    fault: '🔴',
    stopped: '⚪'
  }
  return iconMap[deviceStatus.value]
})

const statusDescription = computed(() => {
  const descMap = {
    running: '设备正常运行，发电效率良好',
    fault: '检测到设备故障，请及时处理',
    stopped: '设备已停止运行，等待指令'
  }
  return descMap[deviceStatus.value]
})

// 功率相关
const utilizationRate = computed(() => {
  return ((inverterData.value.realTimePower / inverterData.value.ratedPower) * 100).toFixed(1)
})

const powerTrendValue = ref(5.2)
const powerTrendClass = computed(() => powerTrendValue.value >= 0 ? 'trend-up' : 'trend-down')
const powerTrendIcon = computed(() => powerTrendValue.value >= 0 ? '↑' : '↓')

// 小时数相关
const hoursTrendValue = ref(0.3)
const hoursTrendClass = computed(() => hoursTrendValue.value >= 0 ? 'trend-up' : 'trend-down')
const hoursTrendIcon = computed(() => hoursTrendValue.value >= 0 ? '↑' : '↓')

// 统计指标
const dailyTarget = ref(240)
const averageDailyEnergy = ref(218)
const averageEquivalentHours = ref(4.36)
const availabilityRate = ref(99.2)
const completionRate = ref(87.5)
const completionClass = computed(() => completionRate.value >= 90 ? 'text-success' : 'text-warning')

// 时间相关
const warrantyClass = computed(() => {
  const daysLeft = warrantyDays.value
  if (daysLeft > 365) return ''
  if (daysLeft > 90) return 'text-warning'
  return 'text-danger'
})

const warrantyDays = computed(() => {
  const now = new Date()
  const warrantyDate = new Date(inverterData.value.warrantyExpiration)
  const diffTime = warrantyDate - now
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

const runningDays = computed(() => {
  const now = new Date()
  const commissionDate = new Date(inverterData.value.commissioningTime)
  const diffTime = now - commissionDate
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

// ==================== 方法 ====================

// 格式化时间戳
const formatTimestamp = (timestamp) => {
  if (!timestamp) return '-'
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 格式化日期
const formatDate = (timestamp) => {
  if (!timestamp) return '-'
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 格式化大数字
const formatLargeNumber = (num) => {
  if (!num) return '0'
  return num.toLocaleString('en-US', { maximumFractionDigits: 1 })
}

// 显示 Toast
const showToast = (message, type = 'success') => {
  const iconMap = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  }
  toast.value = {
    show: true,
    type,
    icon: iconMap[type],
    message
  }
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

// 复制标识信息
const copyIdentifier = () => {
  const text = `逆变器SN: ${inverterData.value.inverterSN}\n设备型号: ${inverterData.value.deviceModel}\n数据ID: ${inverterData.value.dataId}`
  navigator.clipboard.writeText(text).then(() => {
    showToast('标识信息已复制到剪贴板')
  }).catch(() => {
    showToast('复制失败', 'error')
  })
}

// 跳转到电站详情
const goToStation = () => {
  router.push({ name: 'StationDetail', params: { id: inverterData.value.belongStation } })
  showToast('正在跳转到电站详情...')
}

// 切换地图显示
const toggleMap = () => {
  showMap.value = !showMap.value
}

// 打开完整地图
const openFullMap = () => {
  window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(inverterData.value.installAddress)}`, '_blank')
}

// 关闭警告
const dismissAlert = () => {
  showToast('警告已关闭', 'info')
  // 实际应用中可能需要调用 API
}

// 导出报告
const exportReport = () => {
  showToast('正在生成报告，请稍候...', 'info')
  // 模拟异步导出
  setTimeout(() => {
    showToast('报告导出成功！')
  }, 2000)
}

// 刷新数据
const refreshData = () => {
  // 模拟数据刷新
  lastUpdateTime.value = Date.now()
  
  // 模拟数据变化
  const powerChange = (Math.random() - 0.5) * 5
  inverterData.value.realTimePower = Math.max(0, Math.min(inverterData.value.ratedPower, inverterData.value.realTimePower + powerChange))
  
  powerTrendValue.value = (Math.random() - 0.5) * 10
  hoursTrendValue.value = (Math.random() - 0.5) * 0.6
  
  // 刷新图表
  updateCharts()
  
  showToast('数据已刷新')
}

// 选择时间周期
const selectPeriod = (period) => {
  selectedPeriod.value = period
  updateRealtimeChart()
}

// 3D模型控制
const rotateLeft = () => {
  modelRotation.value -= 45
}

const rotateRight = () => {
  modelRotation.value += 45
}

const resetModel = () => {
  modelRotation.value = 0
}

// ==================== 图表相关 ====================

// 生成实时功率数据
const generateRealtimeData = (period) => {
  const data = []
  const times = []
  const now = new Date()
  
  let points = 24
  let interval = 60 * 60 * 1000 // 1 hour
  
  if (period === '1h') {
    points = 60
    interval = 60 * 1000 // 1 minute
  } else if (period === '24h') {
    points = 24
    interval = 60 * 60 * 1000 // 1 hour
  } else if (period === '7d') {
    points = 7
    interval = 24 * 60 * 60 * 1000 // 1 day
  } else if (period === '30d') {
    points = 30
    interval = 24 * 60 * 60 * 1000 // 1 day
  }
  
  for (let i = 0; i < points; i++) {
    const time = new Date(now.getTime() - (points - i - 1) * interval)
    
    let timeStr = ''
    if (period === '1h') {
      timeStr = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`
    } else if (period === '24h') {
      timeStr = `${String(time.getHours()).padStart(2, '0')}:00`
    } else {
      timeStr = `${String(time.getMonth() + 1).padStart(2, '0')}-${String(time.getDate()).padStart(2, '0')}`
    }
    times.push(timeStr)
    
    // 生成模拟的功率曲线，考虑昼夜变化
    let power
    const hour = time.getHours()
    if (hour >= 6 && hour <= 18) {
      // 白天发电
      const peakHour = 12
      const hourDiff = Math.abs(hour - peakHour)
      const basePower = inverterData.value.ratedPower * 0.9
      power = basePower * (1 - hourDiff / 6) + (Math.random() - 0.5) * 5
    } else {
      // 夜晚不发电
      power = Math.random() * 2
    }
    power = Math.max(0, power)
    data.push(power.toFixed(1))
  }
  
  return { times, data }
}

// 初始化实时功率图表
const initRealtimeChart = () => {
  if (!realtimeChart.value) return
  
  realtimeChartInstance = echarts.init(realtimeChart.value)
  updateRealtimeChart()
  
  // 响应式
  window.addEventListener('resize', () => {
    realtimeChartInstance?.resize()
  })
}

// 更新实时功率图表
const updateRealtimeChart = () => {
  if (!realtimeChartInstance) return
  
  const { times, data } = generateRealtimeData(selectedPeriod.value)
  
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      },
      formatter: (params) => {
        const param = params[0]
        return `${param.name}<br/>功率: ${param.value} kW`
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: times,
      axisLine: {
        lineStyle: {
          color: '#E5E6EB'
        }
      },
      axisLabel: {
        color: '#86909C',
        fontSize: 12
      }
    },
    yAxis: {
      type: 'value',
      name: '功率 (kW)',
      nameTextStyle: {
        color: '#86909C',
        padding: [0, 0, 0, -20]
      },
      axisLine: {
        lineStyle: {
          color: '#E5E6EB'
        }
      },
      axisLabel: {
        color: '#86909C',
        fontSize: 12
      },
      splitLine: {
        lineStyle: {
          color: '#F2F3F5'
        }
      }
    },
    series: [
      {
        name: '实时功率',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        showSymbol: false,
        lineStyle: {
          width: 3,
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#0066CC' },
            { offset: 1, color: '#165DFF' }
          ])
        },
        itemStyle: {
          color: '#165DFF',
          borderWidth: 2,
          borderColor: '#fff'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(22, 93, 255, 0.2)' },
            { offset: 1, color: 'rgba(22, 93, 255, 0)' }
          ])
        },
        data: data,
        emphasis: {
          focus: 'series',
          scale: true
        }
      }
    ],
    animationDuration: 1000,
    animationEasing: 'cubicOut'
  }
  
  realtimeChartInstance.setOption(option)
}

// 初始化能效分析图表
const initEfficiencyChart = () => {
  if (!efficiencyChart.value) return
  
  efficiencyChartInstance = echarts.init(efficiencyChart.value)
  updateEfficiencyChart()
  
  // 响应式
  window.addEventListener('resize', () => {
    efficiencyChartInstance?.resize()
  })
}

// 生成30天数据
const generate30DaysData = () => {
  const dates = []
  const energies = []
  const hours = []
  
  const now = new Date()
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    dates.push(`${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`)
    
    // 模拟发电量和等效小时数
    const baseEnergy = 180 + Math.random() * 80
    energies.push(baseEnergy.toFixed(0))
    hours.push((baseEnergy / 50).toFixed(1))
  }
  
  return { dates, energies, hours }
}

// 更新能效分析图表
const updateEfficiencyChart = () => {
  if (!efficiencyChartInstance) return
  
  const { dates, energies, hours } = generate30DaysData()
  
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        crossStyle: {
          color: '#999'
        }
      },
      formatter: (params) => {
        let result = params[0].name + '<br/>'
        params.forEach(param => {
          result += `${param.marker} ${param.seriesName}: ${param.value}${param.seriesName.includes('电量') ? ' kWh' : ' h'}<br/>`
        })
        return result
      }
    },
    legend: {
      data: ['发电量', '等效小时数'],
      textStyle: {
        color: '#1D2129'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: dates,
        axisPointer: {
          type: 'shadow'
        },
        axisLine: {
          lineStyle: {
            color: '#E5E6EB'
          }
        },
        axisLabel: {
          color: '#86909C',
          fontSize: 11
        }
      }
    ],
    yAxis: [
      {
        type: 'value',
        name: '发电量 (kWh)',
        min: 0,
        max: 300,
        interval: 50,
        axisLabel: {
          formatter: '{value}'
        },
        axisLine: {
          lineStyle: {
            color: '#E5E6EB'
          }
        },
        axisLabel: {
          color: '#86909C',
          fontSize: 12
        },
        splitLine: {
          lineStyle: {
            color: '#F2F3F5'
          }
        }
      },
      {
        type: 'value',
        name: '等效小时数 (h)',
        min: 0,
        max: 6,
        interval: 1,
        axisLabel: {
          formatter: '{value} h'
        },
        axisLine: {
          lineStyle: {
            color: '#E5E6EB'
          }
        },
        axisLabel: {
          color: '#86909C',
          fontSize: 12
        },
        splitLine: {
          show: false
        }
      }
    ],
    series: [
      {
        name: '发电量',
        type: 'bar',
        barWidth: '40%',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#0066CC' },
            { offset: 1, color: '#165DFF' }
          ]),
          borderRadius: [4, 4, 0, 0]
        },
        data: energies,
        emphasis: {
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#165DFF' },
              { offset: 1, color: '#4CA5FF' }
            ])
          }
        }
      },
      {
        name: '等效小时数',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        showSymbol: false,
        lineStyle: {
          width: 2,
          color: '#00B42A'
        },
        itemStyle: {
          color: '#00B42A',
          borderWidth: 2,
          borderColor: '#fff'
        },
        data: hours,
        emphasis: {
          focus: 'series'
        }
      }
    ],
    animationDuration: 1000,
    animationEasing: 'cubicOut'
  }
  
  efficiencyChartInstance.setOption(option)
}

// 更新所有图表
const updateCharts = () => {
  updateRealtimeChart()
  updateEfficiencyChart()
}

// ==================== 生命周期 ====================

onMounted(() => {
  // 初始化图表
  nextTick(() => {
    initRealtimeChart()
    initEfficiencyChart()
  })
  
  // 启动自动刷新
  refreshTimer = setInterval(() => {
    // 自动刷新数据（不显示提示）
    lastUpdateTime.value = Date.now()
    const powerChange = (Math.random() - 0.5) * 3
    inverterData.value.realTimePower = Math.max(0, Math.min(inverterData.value.ratedPower, inverterData.value.realTimePower + powerChange))
    
    // 每5分钟更新一次图表
    if (Math.random() < 0.3) {
      updateCharts()
    }
  }, 60000) // 每分钟刷新一次
})

onUnmounted(() => {
  // 清理定时器和图表实例
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
  
  if (realtimeChartInstance) {
    realtimeChartInstance.dispose()
  }
  
  if (efficiencyChartInstance) {
    efficiencyChartInstance.dispose()
  }
  
  window.removeEventListener('resize', () => {})
})

// 监听窗口大小变化
watch(() => modelContainer.value, () => {
  // 3D模型容器变化时的处理
})
</script>

<style scoped>
/* ==================== 基础样式 ==================== */
.inverter-detail-container {
  min-height: calc(100vh - 60px);
  background: #F5F7FA;
  padding: 20px;
  color: #1D2129;
}

/* ==================== 警告横幅 ==================== */
.alert-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  animation: slideDown 0.3s ease-out;
}

.alert-banner.alert-danger {
  background: #FFF7F0;
  border: 1px solid #FFD4BF;
}

.alert-icon {
  font-size: 20px;
}

.alert-text {
  flex: 1;
  font-size: 14px;
  color: #D91A2C;
}

.alert-close {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #D91A2C;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
}

.alert-close:hover {
  background: rgba(217, 26, 44, 0.1);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ==================== 页面标题 ==================== */
.page-header {
  background: #FFFFFF;
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 14px;
}

.breadcrumb-item {
  color: #86909C;
}

.breadcrumb-item.active {
  color: #1D2129;
  font-weight: 500;
}

.breadcrumb-separator {
  color: #C9CDD4;
}

.header-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1D2129;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.btn-icon {
  font-size: 16px;
}

.btn-outline {
  background: #FFFFFF;
  border-color: #E5E6EB;
  color: #4E5969;
}

.btn-outline:hover {
  border-color: #0066CC;
  color: #0066CC;
}

.btn-primary {
  background: #0066CC;
  border-color: #0066CC;
  color: #FFFFFF;
}

.btn-primary:hover {
  background: #165DFF;
}

.last-update {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  font-size: 12px;
  color: #86909C;
}

.update-label {
  color: #86909C;
}

.update-time {
  color: #4E5969;
  font-weight: 500;
}

.auto-refresh {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #00B42A;
}

.auto-refresh::before {
  content: '';
  width: 6px;
  height: 6px;
  background: #00B42A;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}

/* ==================== 核心监控区 ==================== */
.monitor-section {
  display: grid;
  grid-template-columns: 320px 1fr 340px;
  gap: 20px;
  margin-bottom: 20px;
}

/* 通用卡片样式 */
.model-card,
.chart-card,
.metrics-card,
.info-card,
.performance-card,
.timeline-card,
.status-card {
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #F2F3F5;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1D2129;
  margin: 0;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.icon-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 6px;
  transition: all 0.2s;
  color: #86909C;
}

.icon-btn:hover {
  background: #F2F3F5;
  color: #1D2129;
}

/* ==================== 3D模型卡片 ==================== */
.model-card {
  display: flex;
  flex-direction: column;
  height: 380px;
}

.model-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #F5F7FA 0%, #E8F3FF 100%);
  overflow: hidden;
}

.model-placeholder {
  text-align: center;
}

.model-visual {
  margin-bottom: 20px;
}

.device-body {
  width: 180px;
  height: 120px;
  background: linear-gradient(180deg, #3D4656 0%, #2A3444 100%);
  border-radius: 8px;
  position: relative;
  margin: 0 auto;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  transition: all 0.3s;
}

.device-body.status-running {
  box-shadow: 0 8px 32px rgba(0, 180, 42, 0.3);
}

.device-body.status-fault {
  box-shadow: 0 8px 32px rgba(217, 26, 44, 0.3);
}

.device-status-light {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: statusLight 2s infinite;
}

.device-body.status-running .device-status-light {
  background: #00B42A;
  box-shadow: 0 0 12px rgba(0, 180, 42, 0.8);
}

.device-body.status-fault .device-status-light {
  background: #D91A2C;
  box-shadow: 0 0 12px rgba(217, 26, 44, 0.8);
  animation: statusLightBlink 0.5s infinite;
}

.device-body.status-stopped .device-status-light {
  background: #C9CDD4;
}

@keyframes statusLight {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes statusLightBlink {
  0%, 100% {
    opacity: 1;
    background: #D91A2C;
  }
  50% {
    opacity: 0.3;
    background: #FF7D00;
  }
}

.device-screen {
  position: absolute;
  top: 28px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 32px;
  background: #0A0F18;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #1D2129;
}

.screen-content {
  text-align: center;
  color: #00FF88;
  font-family: 'Courier New', monospace;
}

.screen-value {
  font-size: 16px;
  font-weight: bold;
}

.screen-unit {
  font-size: 10px;
}

.device-vents {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 4px;
}

.device-vents::before,
.device-vents::after {
  content: '';
  width: 60px;
  height: 2px;
  background: #1D2129;
  border-radius: 1px;
}

.model-info {
  margin-top: 16px;
}

.model-model-name {
  font-size: 14px;
  font-weight: 600;
  color: #1D2129;
  margin-bottom: 4px;
}

.model-sn {
  font-size: 12px;
  color: #86909C;
  font-family: 'Courier New', monospace;
}

/* ==================== 图表卡片 ==================== */
.chart-card {
  display: flex;
  flex-direction: column;
  height: 380px;
}

.chart-card.main-chart {
  grid-column: span 1;
}

.chart-card.large {
  height: 400px;
}

.chart-container {
  flex: 1;
  min-height: 300px;
  width: 100%;
}

.time-tabs {
  display: flex;
  gap: 4px;
}

.time-tab {
  padding: 6px 12px;
  border: none;
  background: none;
  border-radius: 6px;
  font-size: 12px;
  color: #86909C;
  cursor: pointer;
  transition: all 0.2s;
}

.time-tab:hover {
  background: #F2F3F5;
  color: #1D2129;
}

.time-tab.active {
  background: #0066CC;
  color: #FFFFFF;
}

.chart-legend {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #4E5969;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-color {
  width: 12px;
  height: 3px;
  border-radius: 2px;
}

.legend-color.primary {
  background: linear-gradient(90deg, #0066CC, #165DFF);
}

.legend-color.success {
  background: #00B42A;
}

/* ==================== 关键指标卡片 ==================== */
.metrics-card {
  display: flex;
  flex-direction: column;
}

.metrics-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
}

.metric-item {
  background: #F7F8FA;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s;
}

.metric-item:hover {
  background: #F2F3F5;
}

.metric-item.metric-large {
  background: linear-gradient(135deg, #0066CC 0%, #165DFF 100%);
  color: #FFFFFF;
}

.metric-item.metric-large:hover {
  background: linear-gradient(135deg, #165DFF 0%, #4CA5FF 100%);
}

.metric-label {
  font-size: 12px;
  color: #86909C;
  margin-bottom: 8px;
}

.metric-item.metric-large .metric-label {
  color: rgba(255, 255, 255, 0.8);
}

.metric-value {
  font-size: 28px;
  font-weight: 600;
  color: #1D2129;
  line-height: 1.2;
}

.metric-item.metric-large .metric-value {
  color: #FFFFFF;
  font-size: 32px;
}

.metric-value.primary {
  color: #0066CC;
}

.metric-value.success {
  color: #00B42A;
}

.metric-unit {
  font-size: 14px;
  font-weight: 400;
  color: #86909C;
  margin-left: 4px;
}

.metric-item.metric-large .metric-unit {
  color: rgba(255, 255, 255, 0.8);
}

.metric-trend {
  font-size: 12px;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.trend-up {
  color: #00B42A;
}

.trend-down {
  color: #D91A2C;
}

.metric-sub {
  font-size: 11px;
  color: #86909C;
  margin-top: 6px;
}

.metric-item.metric-large .metric-sub {
  color: rgba(255, 255, 255, 0.7);
}

.metric-bar {
  width: 100%;
  height: 4px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 2px;
  margin-top: 8px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #0066CC, #165DFF);
  border-radius: 2px;
  transition: width 0.5s ease-out;
}

.metric-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #FFFFFF;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
}

.status-running .metric-status {
  color: #00B42A;
  background: #E8FFEA;
}

.status-fault .metric-status {
  color: #D91A2C;
  background: #FFECE8;
}

.status-stopped .metric-status {
  color: #86909C;
  background: #F7F8FA;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.status-running {
  background: #E8FFEA;
  color: #00B42A;
}

.status-badge.status-fault {
  background: #FFECE8;
  color: #D91A2C;
}

.status-badge.status-stopped {
  background: #F7F8FA;
  color: #86909C;
}

/* ==================== 详细信息区 ==================== */
.detail-section {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 20px;
}

.detail-left {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-right {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ==================== 信息卡片 ==================== */
.info-card {
  padding-bottom: 16px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  padding: 16px 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-item.full-width {
  grid-column: span 2;
}

.info-label {
  font-size: 12px;
  color: #86909C;
}

.info-value {
  font-size: 14px;
  color: #1D2129;
  font-weight: 500;
}

.info-value.small {
  font-size: 12px;
  font-family: 'Courier New', monospace;
}

.info-value.highlight {
  font-size: 16px;
  font-weight: 600;
  color: #0066CC;
}

.info-value.link {
  color: #0066CC;
  cursor: pointer;
  text-decoration: underline;
  text-decoration-style: dotted;
}

.info-value.link:hover {
  text-decoration-style: solid;
}

.text-success {
  color: #00B42A;
}

.text-warning {
  color: #FF7D00;
}

.text-danger {
  color: #D91A2C;
}

/* ==================== 地图容器 ==================== */
.map-container {
  padding: 0 20px 16px;
}

.map-placeholder {
  background: linear-gradient(135deg, #E8F3FF 0%, #F5F7FA 100%);
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  border: 2px dashed #C9CDD4;
}

.map-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.map-text {
  font-size: 16px;
  font-weight: 600;
  color: #1D2129;
  margin-bottom: 8px;
}

.map-subtext {
  font-size: 12px;
  color: #86909C;
  margin-bottom: 16px;
  line-height: 1.5;
}

.map-btn {
  padding: 8px 16px;
  background: #0066CC;
  color: #FFFFFF;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.map-btn:hover {
  background: #165DFF;
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.expand-enter-to,
.expand-leave-from {
  max-height: 300px;
  opacity: 1;
}

/* ==================== 性能指标卡片 ==================== */
.performance-card {
  padding-bottom: 16px;
}

.performance-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  padding: 16px 20px;
}

.performance-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #F7F8FA;
  border-radius: 8px;
  transition: all 0.2s;
}

.performance-item:hover {
  background: #F2F3F5;
  transform: translateY(-2px);
}

.perf-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.perf-content {
  flex: 1;
  min-width: 0;
}

.perf-label {
  font-size: 12px;
  color: #86909C;
  margin-bottom: 4px;
}

.perf-value {
  font-size: 18px;
  font-weight: 600;
  color: #1D2129;
}

/* ==================== 时间轴卡片 ==================== */
.timeline-card {
  padding-bottom: 16px;
}

.timeline-container {
  position: relative;
  padding: 20px 20px 40px;
}

.timeline-line {
  position: absolute;
  top: 40px;
  left: 35px;
  right: 35px;
  height: 2px;
  background: #E5E6EB;
}

.timeline-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 40px;
}

.timeline-item:last-child {
  margin-bottom: 0;
}

.timeline-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #C9CDD4;
  border: 2px solid #FFFFFF;
  box-shadow: 0 0 0 3px #E5E6EB;
  z-index: 1;
}

.timeline-item.completed .timeline-dot {
  background: #00B42A;
  box-shadow: 0 0 0 3px rgba(0, 180, 42, 0.2);
}

.timeline-item.current .timeline-dot {
  background: #0066CC;
  box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.2);
  animation: currentPulse 2s infinite;
}

.timeline-item.upcoming .timeline-dot {
  background: #FFFFFF;
  border-color: #C9CDD4;
}

@keyframes currentPulse {
  0%, 100% {
    box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.2);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(0, 102, 204, 0.1);
  }
}

.timeline-content {
  text-align: center;
}

.timeline-date {
  font-size: 12px;
  font-weight: 500;
  color: #1D2129;
  margin-bottom: 4px;
}

.timeline-label {
  font-size: 11px;
  color: #86909C;
}

.timeline-badge {
  display: inline-block;
  padding: 4px 10px;
  background: linear-gradient(135deg, #0066CC, #165DFF);
  color: #FFFFFF;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  margin-top: 4px;
}

.timeline-sub {
  font-size: 11px;
  color: #FF7D00;
  margin-top: 4px;
}

/* ==================== 设备状态卡片 ==================== */
.status-card {
  padding-bottom: 16px;
}

.status-detail {
  padding: 16px 20px;
}

.status-main {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.status-main.status-running {
  background: #E8FFEA;
}

.status-main.status-fault {
  background: #FFECE8;
}

.status-main.status-stopped {
  background: #F7F8FA;
}

.status-large-icon {
  font-size: 32px;
}

.status-main-text {
  flex: 1;
}

.status-main-title {
  font-size: 18px;
  font-weight: 600;
  color: #1D2129;
  margin-bottom: 4px;
}

.status-main-desc {
  font-size: 13px;
  color: #86909C;
}

.status-metrics {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.status-metric {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #F7F8FA;
  border-radius: 8px;
}

.status-metric .metric-label {
  font-size: 12px;
  color: #86909C;
}

.status-metric .metric-value {
  font-size: 15px;
  font-weight: 600;
  color: #1D2129;
}

/* ==================== Toast 提示 ==================== */
.toast {
  position: fixed;
  top: 80px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  animation: toastIn 0.3s ease-out;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.toast-enter-to,
.toast-leave-from {
  opacity: 1;
  transform: translateX(0);
}

.toast.success {
  background: #FFFFFF;
  border-left: 4px solid #00B42A;
}

.toast.error {
  background: #FFFFFF;
  border-left: 4px solid #D91A2C;
}

.toast.warning {
  background: #FFFFFF;
  border-left: 4px solid #FF7D00;
}

.toast.info {
  background: #FFFFFF;
  border-left: 4px solid #0066CC;
}

.toast-icon {
  font-size: 18px;
}

.toast-message {
  font-size: 14px;
  color: #1D2129;
}

@keyframes toastIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* ==================== 响应式设计 ==================== */

/* 平板端 (768-1200px) */
@media (max-width: 1200px) {
  .monitor-section {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto;
  }
  
  .model-card {
    grid-column: span 1;
    height: 320px;
  }
  
  .chart-card.main-chart {
    grid-column: span 1;
    height: 320px;
  }
  
  .metrics-card {
    grid-column: span 2;
  }
  
  .metrics-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .detail-section {
    grid-template-columns: 1fr;
  }
  
  .performance-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 移动端 (<768px) */
@media (max-width: 768px) {
  .inverter-detail-container {
    padding: 12px;
  }
  
  .page-header {
    padding: 16px;
  }
  
  .header-main {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .page-title {
    font-size: 20px;
  }
  
  .header-actions {
    width: 100%;
  }
  
  .btn {
    flex: 1;
    justify-content: center;
  }
  
  .monitor-section {
    grid-template-columns: 1fr;
  }
  
  .model-card,
  .chart-card.main-chart {
    grid-column: span 1;
    height: 300px;
  }
  
  .metrics-card {
    grid-column: span 1;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .chart-card.large {
    height: 320px;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .info-item.full-width {
    grid-column: span 1;
  }
  
  .performance-grid {
    grid-template-columns: 1fr;
  }
  
  .status-metrics {
    grid-template-columns: 1fr;
  }
  
  .timeline-line {
    display: none;
  }
  
  .timeline-item {
    flex-direction: row;
    align-items: flex-start;
    margin-bottom: 24px;
  }
  
  .timeline-dot {
    margin-top: 4px;
    margin-right: 12px;
  }
  
  .toast {
    left: 12px;
    right: 12px;
    top: auto;
    bottom: 20px;
  }
}

/* 超小屏幕 (<480px) */
@media (max-width: 480px) {
  .page-title {
    font-size: 18px;
  }
  
  .metric-value {
    font-size: 24px;
  }
  
  .perf-value {
    font-size: 16px;
  }
  
  .time-tabs {
    flex-wrap: wrap;
  }
  
  .time-tab {
    padding: 4px 8px;
    font-size: 11px;
  }
}

/* 打印样式 */
@media print {
  .inverter-detail-container {
    background: #FFFFFF;
    padding: 0;
  }
  
  .header-actions,
  .icon-btn,
  .time-tabs,
  .map-btn {
    display: none;
  }
  
  .model-card,
  .chart-card,
  .metrics-card,
  .info-card,
  .performance-card,
  .timeline-card,
  .status-card {
    box-shadow: none;
    border: 1px solid #E5E6EB;
  }
}
</style>
