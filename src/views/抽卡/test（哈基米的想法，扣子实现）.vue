<template>
  <div class="inverter-monitor-container" :class="{ 'dark-mode': darkMode }">
    <!-- 动态粒子背景 -->
    <div class="energy-particles" ref="particleContainer"></div>
    
    <!-- 顶部状态条 -->
    <header class="status-header">
      <div class="status-indicator">
        <span class="breathing-dot" :class="statusClass"></span>
        <span class="status-text">{{ inverterStatus }}</span>
      </div>
      <div class="breadcrumb">
        <span class="station-name">{{ stationName }}</span>
        <span class="separator">/</span>
        <span class="inverter-name">{{ inverterName }}</span>
      </div>
      <div class="header-actions">
        <button @click="toggleDarkMode" class="theme-toggle">
          {{ darkMode ? '☀️' : '🌙' }}
        </button>
      </div>
    </header>

    <!-- 实时核心指标区 -->
    <section class="kpi-cards-section">
      <div class="kpi-grid">
        <div v-for="kpi in kpiData" :key="kpi.key" class="kpi-card" :class="{ 'warning': kpi.warning }">
          <div class="kpi-icon" :style="{ color: kpi.color }">
            <component :is="kpi.icon" />
          </div>
          <div class="kpi-content">
            <div class="kpi-label">{{ kpi.label }}</div>
            <div class="kpi-value" :style="{ color: kpi.color }">
              {{ kpi.value }}<span class="kpi-unit">{{ kpi.unit }}</span>
            </div>
            <div v-if="kpi.compare" class="kpi-compare" :class="kpi.compareClass">
              {{ kpi.compare }}
            </div>
          </div>
          <div v-if="kpi.animation" class="kpi-animation">
            <div class="energy-wave"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- 三维可视化中心 -->
    <section class="visual-center-section">
      <div class="visual-container">
        <!-- 3D逆变器模型 -->
        <div class="inverter-3d-model">
          <div class="inverter-base">
            <div class="inverter-front"></div>
            <div class="inverter-top"></div>
            <div class="inverter-side"></div>
            <div class="current-flow" :style="{ animationDuration: flowAnimationDuration }">
              <div class="flow-line line-1"></div>
              <div class="flow-line line-2"></div>
              <div class="flow-line line-3"></div>
            </div>
            <div v-if="selectedHotspot" class="hotspot-tooltip">
              <div class="tooltip-content">
                <div class="tooltip-title">{{ selectedHotspot.title }}</div>
                <div class="tooltip-value">{{ selectedHotspot.value }}</div>
              </div>
            </div>
          </div>
          <div class="hotspots">
            <div 
              v-for="hotspot in hotspots" 
              :key="hotspot.id"
              class="hotspot-point"
              :style="{ top: hotspot.top, left: hotspot.left }"
              @click="handleHotspotClick(hotspot)"
            ></div>
          </div>
        </div>
        
        <!-- 实时功率曲线图 -->
        <div class="power-chart-container">
          <div class="chart-header">
            <h3>实时功率曲线</h3>
            <div class="chart-legend">
              <span class="legend-item">
                <span class="legend-color" style="background: linear-gradient(90deg, #0066CC, #00CCFF)"></span>
                今日功率
              </span>
            </div>
          </div>
          <div ref="powerChartRef" class="chart-wrapper"></div>
        </div>
      </div>
    </section>

    <!-- 设备参数详情区 -->
    <section class="details-section">
      <h2 class="section-title">设备参数详情</h2>
      <div class="details-grid">
        <!-- 身份组 -->
        <div class="detail-card">
          <div class="card-header">
            <span class="card-title">身份信息</span>
            <span class="card-icon">🏷️</span>
          </div>
          <div class="detail-items">
            <div class="detail-item">
              <span class="detail-label">逆变器 SN</span>
              <span class="detail-value">
                {{ inverterSN }}
                <button @click="copySN" class="copy-btn" title="复制SN">📋</button>
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">数据 ID</span>
              <span class="detail-value">{{ dataId }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">所属电站</span>
              <span class="detail-value station-tag">{{ stationName }}</span>
            </div>
          </div>
        </div>

        <!-- 硬件组 -->
        <div class="detail-card">
          <div class="card-header">
            <span class="card-title">硬件规格</span>
            <span class="card-icon">⚙️</span>
          </div>
          <div class="detail-items">
            <div class="detail-item">
              <span class="detail-label">设备型号</span>
              <span class="detail-value model-tag">{{ deviceModel }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">产品型号</span>
              <span class="detail-value model-tag">{{ productModel }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">额定功率</span>
              <span class="detail-value">{{ ratedPower }} kW</span>
            </div>
          </div>
        </div>

        <!-- 位置组 -->
        <div class="detail-card">
          <div class="card-header">
            <span class="card-title">安装信息</span>
            <span class="card-icon">📍</span>
          </div>
          <div class="detail-items">
            <div class="detail-item">
              <span class="detail-label">安装地址</span>
              <span class="detail-value location-value" @click="showMap">
                {{ installationAddress }}
                <span class="map-icon">🗺️</span>
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">地理坐标</span>
              <span class="detail-value">{{ coordinates }}</span>
            </div>
          </div>
          <div class="mini-map-preview" @click="showMap">
            <div class="map-placeholder">点击查看地图</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 生命周期与运维区 -->
    <section class="lifecycle-section">
      <h2 class="section-title">生命周期与运维</h2>
      <div class="lifecycle-grid">
        <!-- 质保信息 -->
        <div class="lifecycle-card warranty-card">
          <div class="card-header">
            <span class="card-title">质保状态</span>
            <span class="card-icon">🛡️</span>
          </div>
          <div class="warranty-info">
            <div class="warranty-period">
              <div class="date-item">
                <span class="date-label">投产时间</span>
                <span class="date-value">{{ productionDate }}</span>
              </div>
              <div class="date-item">
                <span class="date-label">质保到期</span>
                <span class="date-value">{{ warrantyExpiry }}</span>
              </div>
            </div>
            <div class="warranty-progress">
              <div class="progress-header">
                <span>质保进度</span>
                <span class="progress-percent">{{ warrantyProgress }}%</span>
              </div>
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: warrantyProgress + '%', backgroundColor: warrantyColor }"
                ></div>
              </div>
              <div class="progress-days">
                剩余 {{ remainingWarrantyDays }} 天
              </div>
            </div>
          </div>
        </div>

        <!-- 利用率仪表盘 -->
        <div class="lifecycle-card utilization-card">
          <div class="card-header">
            <span class="card-title">累计利用率</span>
            <span class="card-icon">📊</span>
          </div>
          <div class="utilization-content">
            <div ref="gaugeChartRef" class="gauge-chart-wrapper"></div>
            <div class="utilization-details">
              <div class="utilization-stat">
                <span class="stat-label">累计等效小时数</span>
                <span class="stat-value">{{ totalEquivalentHours }} h</span>
              </div>
              <div class="utilization-stat">
                <span class="stat-label">累计发电量</span>
                <span class="stat-value">{{ totalEnergy }} MWh</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 数据同步信息 -->
        <div class="lifecycle-card sync-card">
          <div class="card-header">
            <span class="card-title">数据同步</span>
            <span class="card-icon">🔄</span>
          </div>
          <div class="sync-info">
            <div class="sync-item">
              <span class="sync-label">数据时间戳</span>
              <span class="sync-value">{{ dataTimestamp }}</span>
            </div>
            <div class="sync-item">
              <span class="sync-label">更新时间</span>
              <span class="sync-value">{{ updateTime }}</span>
            </div>
            <div class="refresh-indicator">
              <svg class="progress-circle" viewBox="0 0 36 36">
                <path
                  class="progress-bg"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#E0E0E0"
                  stroke-width="3"
                />
                <path
                  class="progress-indicator"
                  :style="{ strokeDasharray: refreshProgress + ', 100' }"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#0066CC"
                  stroke-width="3"
                  stroke-linecap="round"
                />
              </svg>
              <span class="refresh-text">{{ refreshText }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 地图弹窗 -->
    <div v-if="showMapModal" class="map-modal" @click="closeMap">
      <div class="map-content" @click.stop>
        <div class="map-header">
          <h3>安装位置</h3>
          <button @click="closeMap" class="close-btn">✕</button>
        </div>
        <div class="map-body">
          <div class="map-placeholder-large">
            <div class="map-icon-large">🗺️</div>
            <div class="map-address">{{ installationAddress }}</div>
            <div class="map-coords">{{ coordinates }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick, h } from 'vue'
import * as echarts from 'echarts'

// 响应式数据
const darkMode = ref(false)
const selectedHotspot = ref(null)
const showMapModal = ref(false)
const refreshProgress = ref(0)
const refreshText = ref('数据实时更新中...')

// DOM 引用
const particleContainer = ref(null)
const powerChartRef = ref(null)
const gaugeChartRef = ref(null)

// ECharts 实例
let powerChart = null
let gaugeChart = null
let particleInterval = null
let refreshInterval = null

// 核心数据
const stationName = ref('华东光伏示范电站')
const inverterName = ref('逆变器-01')
const inverterStatus = ref('运行中')
const inverterSN = ref('SN-2024-HD-INV-001234')
const dataId = ref('ID-D8F2-A3C4-9B1E')
const deviceModel = ref('SUNPRO-100K-TL')
const productModel = ref('SP100KTL-CN')
const ratedPower = ref(100)
const installationAddress = ref('江苏省苏州市工业园区星湖街218号')
const coordinates = ref('31.28°N, 120.72°E')
const productionDate = ref('2022-06-15')
const warrantyExpiry = ref('2032-06-15')
const totalEquivalentHours = ref(18542)
const totalEnergy = ref(1854.2)
const dataTimestamp = ref(new Date().toLocaleString('zh-CN'))
const updateTime = ref(new Date().toLocaleString('zh-CN'))

// KPI 数据
const kpiData = ref([
  {
    key: 'realtimePower',
    label: '实时功率',
    value: 87.5,
    unit: 'kW',
    color: '#0066CC',
    compare: '环比昨日 +5%',
    compareClass: 'positive',
    animation: true,
    warning: false,
    icon: () => h('svg', { 
      viewBox: '0 0 24 24', 
      fill: 'currentColor',
      class: 'power-icon'
    }, [
      h('path', { d: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z' })
    ])
  },
  {
    key: 'dailyEnergy',
    label: '当日电量',
    value: 425.8,
    unit: 'kWh',
    color: '#00CC99',
    compare: '环比昨日 +12%',
    compareClass: 'positive',
    animation: false,
    warning: false,
    icon: () => h('svg', {
      viewBox: '0 0 24 24',
      fill: 'currentColor'
    }, [
      h('path', { d: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z' })
    ])
  },
  {
    key: 'equivalentHours',
    label: '当日等效小时数',
    value: 4.26,
    unit: 'h',
    color: '#FF9500',
    compare: '目标达成率 92%',
    compareClass: 'neutral',
    animation: false,
    warning: false,
    icon: () => h('svg', {
      viewBox: '0 0 24 24',
      fill: 'currentColor'
    }, [
      h('path', { d: 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z' })
    ])
  },
  {
    key: 'cumulativeEnergy',
    label: '累计电量',
    value: 1854.2,
    unit: 'MWh',
    color: '#6C63FF',
    compare: '设备贡献度 15.8%',
    compareClass: 'positive',
    animation: false,
    warning: false,
    icon: () => h('svg', {
      viewBox: '0 0 24 24',
      fill: 'currentColor'
    }, [
      h('path', { d: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z' })
    ])
  }
])

// 3D模型热点
const hotspots = ref([
  {
    id: 1,
    top: '40%',
    left: '30%',
    title: '设备型号',
    value: 'SUNPRO-100K-TL'
  },
  {
    id: 2,
    top: '60%',
    left: '70%',
    title: '产品型号',
    value: 'SP100KTL-CN'
  }
])

// 计算属性
const statusClass = computed(() => {
  return {
    'status-running': inverterStatus.value === '运行中',
    'status-warning': inverterStatus.value === '警告',
    'status-error': inverterStatus.value === '故障'
  }
})

const flowAnimationDuration = computed(() => {
  const power = kpiData.value[0].value
  const maxPower = ratedPower.value
  const ratio = power / maxPower
  return `${2 - ratio * 1.5}s` // 功率越大，动画越快
})

const warrantyProgress = computed(() => {
  const startDate = new Date(productionDate.value)
  const endDate = new Date(warrantyExpiry.value)
  const currentDate = new Date()
  
  const totalDuration = endDate - startDate
  const elapsed = currentDate - startDate
  const progress = (elapsed / totalDuration) * 100
  
  return Math.min(Math.max(progress, 0), 100).toFixed(1)
})

const warrantyColor = computed(() => {
  const progress = parseFloat(warrantyProgress.value)
  if (progress >= 90) return '#FF6B6B'
  if (progress >= 75) return '#FF9500'
  return '#00CC99'
})

const remainingWarrantyDays = computed(() => {
  const endDate = new Date(warrantyExpiry.value)
  const currentDate = new Date()
  const diff = endDate - currentDate
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
})

// 方法
const toggleDarkMode = () => {
  darkMode.value = !darkMode.value
  updateChartsTheme()
}

const copySN = () => {
  navigator.clipboard.writeText(inverterSN.value)
  // 可以添加提示动画
}

const showMap = () => {
  showMapModal.value = true
}

const closeMap = () => {
  showMapModal.value = false
}

const handleHotspotClick = (hotspot) => {
  selectedHotspot.value = hotspot
  setTimeout(() => {
    selectedHotspot.value = null
  }, 3000)
}

// 动态功率数据生成
const generatePowerData = () => {
  const data = []
  const now = new Date()
  for (let i = 0; i < 96; i++) { // 24小时，每15分钟一个点
    const time = new Date(now.getTime() - (95 - i) * 15 * 60 * 1000)
    const hour = time.getHours()
    let power = 0
    
    // 模拟光伏发电曲线
    if (hour >= 6 && hour <= 18) {
      const peak = 12
      const distance = Math.abs(hour - peak)
      power = Math.max(0, 1 - (distance / 6)) * 100
      power += (Math.random() - 0.5) * 10 // 添加随机波动
    }
    
    power = Math.max(0, power)
    data.push([
      `${hour.toString().padStart(2, '0')}:${String((i % 4) * 15).padStart(2, '0')}`,
      power.toFixed(1)
    ])
  }
  return data
}

// 初始化功率曲线图
const initPowerChart = () => {
  if (!powerChartRef.value) return
  
  powerChart = echarts.init(powerChartRef.value)
  
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const data = params[0]
        return `${data.axisValue}<br/>功率: ${data.data[1]} kW`
      },
      backgroundColor: darkMode.value ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.95)',
      borderColor: '#0066CC',
      textStyle: {
        color: darkMode.value ? '#fff' : '#333'
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
      data: [],
      axisLine: {
        lineStyle: {
          color: '#E0E0E0'
        }
      },
      axisLabel: {
        color: '#999'
      }
    },
    yAxis: {
      type: 'value',
      name: '功率',
      axisLine: {
        lineStyle: {
          color: '#E0E0E0'
        }
      },
      axisLabel: {
        color: '#999'
      },
      splitLine: {
        lineStyle: {
          color: '#F0F0F0'
        }
      }
    },
    series: [
      {
        name: '实时功率',
        type: 'line',
        smooth: true,
        symbol: 'none',
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(0, 102, 204, 0.3)' },
            { offset: 1, color: 'rgba(0, 204, 255, 0.05)' }
          ])
        },
        lineStyle: {
          width: 2,
          color: '#0066CC'
        },
        data: generatePowerData()
      }
    ]
  }
  
  powerChart.setOption(option)
}

// 初始化仪表盘图表
const initGaugeChart = () => {
  if (!gaugeChartRef.value) return
  
  gaugeChart = echarts.init(gaugeChartRef.value)
  
  const option = {
    backgroundColor: 'transparent',
    series: [
      {
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        min: 0,
        max: 100,
        splitNumber: 10,
        radius: '90%',
        center: ['50%', '70%'],
        itemStyle: {
          color: '#0066CC',
          shadowColor: 'rgba(0, 102, 204, 0.3)',
          shadowBlur: 10
        },
        progress: {
          show: true,
          roundCap: true,
          width: 12
        },
        pointer: {
          show: false
        },
        axisLine: {
          roundCap: true,
          lineStyle: {
            width: 12,
            color: [[1, '#E0E0E0']]
          }
        },
        axisTick: {
          show: false
        },
        splitLine: {
          show: false
        },
        axisLabel: {
          show: false
        },
        title: {
          show: false
        },
        detail: {
          valueAnimation: true,
          width: '60%',
          lineHeight: 40,
          borderRadius: 8,
          offsetCenter: [0, '-20%'],
          fontSize: 24,
          fontWeight: 'bold',
          formatter: '{value}%',
          color: '#0066CC'
        },
        data: [
          {
            value: 85.4
          }
        ]
      }
    ]
  }
  
  gaugeChart.setOption(option)
}

// 更新图表主题
const updateChartsTheme = () => {
  if (powerChart) {
    powerChart.dispose()
    initPowerChart()
  }
  if (gaugeChart) {
    gaugeChart.dispose()
    initGaugeChart()
  }
}

// 创建粒子效果
const createParticles = () => {
  if (!particleContainer.value) return
  
  const container = particleContainer.value
  const particleCount = 30
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div')
    particle.className = 'particle'
    
    const size = Math.random() * 4 + 2
    const left = Math.random() * 100
    const top = Math.random() * 100
    const duration = Math.random() * 20 + 10
    const delay = Math.random() * 5
    
    particle.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${left}%;
      top: ${top}%;
      animation-duration: ${duration}s;
      animation-delay: ${delay}s;
    `
    
    container.appendChild(particle)
  }
}

// 刷新进度条
const startRefreshProgress = () => {
  refreshInterval = setInterval(() => {
    refreshProgress.value += 1.67 // 60秒从0到100
    
    if (refreshProgress.value >= 100) {
      refreshProgress.value = 0
      dataTimestamp.value = new Date().toLocaleString('zh-CN')
      updateTime.value = new Date().toLocaleString('zh-CN')
      
      // 模拟数据更新
      kpiData.value[0].value = (80 + Math.random() * 20).toFixed(1)
    }
  }, 1000)
}

// 窗口大小变化时重绘图表
const handleResize = () => {
  if (powerChart) powerChart.resize()
  if (gaugeChart) gaugeChart.resize()
}

// 生命周期钩子
onMounted(() => {
  nextTick(() => {
    initPowerChart()
    initGaugeChart()
    createParticles()
    startRefreshProgress()
  })
  
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (powerChart) powerChart.dispose()
  if (gaugeChart) gaugeChart.dispose()
  if (particleInterval) clearInterval(particleInterval)
  if (refreshInterval) clearInterval(refreshInterval)
  window.removeEventListener('resize', handleResize)
})

// 监听KPI数据变化，更新图表
watch(() => kpiData.value[0].value, (newValue) => {
  if (powerChart) {
    const data = powerChart.getOption().series[0].data
    const lastData = data[data.length - 1]
    lastData[1] = parseFloat(newValue).toFixed(1)
    powerChart.setOption({
      series: [{
        data: data
      }]
    })
  }
})
</script>

<style scoped>
.inverter-monitor-container {
  min-height: 100vh;
  background: #F5F7FA;
  padding: 20px;
  position: relative;
  overflow-x: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  transition: background 0.3s ease;
}

.inverter-monitor-container.dark-mode {
  background: #1a1a2e;
  color: #e0e0e0;
}

/* 粒子背景 */
.energy-particles {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.particle {
  position: absolute;
  background: radial-gradient(circle, rgba(0, 102, 204, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  animation: floatParticle linear infinite;
}

@keyframes floatParticle {
  0% {
    transform: translateX(0) translateY(0) scale(1);
    opacity: 0.3;
  }
  50% {
    opacity: 0.6;
  }
  100% {
    transform: translateX(100px) translateY(-50px) scale(1.5);
    opacity: 0;
  }
}

/* 顶部状态条 */
.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 16px 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: relative;
  z-index: 1;
}

.dark-mode .status-header {
  background: rgba(26, 26, 46, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.breathing-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  position: relative;
}

.breathing-dot::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: 50%;
  animation: breathing 2s ease-in-out infinite;
}

.status-running {
  background: #00CC99;
}

.status-running::before {
  background: #00CC99;
  animation: breathing 2s ease-in-out infinite;
}

.status-warning {
  background: #FF9500;
}

.status-warning::before {
  background: #FF9500;
  animation: breathing 1s ease-in-out infinite;
}

.status-error {
  background: #FF6B6B;
}

.status-error::before {
  background: #FF6B6B;
  animation: errorPulse 0.5s ease-in-out infinite;
}

@keyframes breathing {
  0%, 100% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.5);
    opacity: 0;
  }
}

@keyframes errorPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(2);
    opacity: 0;
  }
}

.status-text {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.dark-mode .status-text {
  color: #e0e0e0;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 12px;
}

.separator {
  color: #999;
  font-size: 18px;
}

.station-name,
.inverter-name {
  font-size: 20px;
  font-weight: 700;
  color: #333;
}

.dark-mode .station-name,
.dark-mode .inverter-name {
  color: #fff;
}

.theme-toggle {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background 0.3s;
}

.theme-toggle:hover {
  background: rgba(0, 102, 204, 0.1);
}

/* KPI 卡片区 */
.kpi-cards-section {
  margin-bottom: 24px;
  position: relative;
  z-index: 1;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

@media (max-width: 1200px) {
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.kpi-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  position: relative;
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
  border: 2px solid transparent;
}

.dark-mode .kpi-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.kpi-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 102, 204, 0.15);
}

.kpi-card.warning {
  border-color: #FF9500;
  animation: warningPulse 2s ease-in-out infinite;
}

@keyframes warningPulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(255, 149, 0, 0);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(255, 149, 0, 0.1);
  }
}

.kpi-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.kpi-content {
  position: relative;
  z-index: 2;
}

.kpi-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.dark-mode .kpi-label {
  color: #aaa;
}

.kpi-value {
  font-size: 32px;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 8px;
}

.kpi-unit {
  font-size: 16px;
  color: #999;
  font-weight: 500;
}

.kpi-compare {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
}

.kpi-compare.positive {
  background: rgba(0, 204, 153, 0.1);
  color: #00CC99;
}

.kpi-compare.negative {
  background: rgba(255, 107, 107, 0.1);
  color: #FF6B6B;
}

.kpi-compare.neutral {
  background: rgba(153, 153, 153, 0.1);
  color: #999;
}

.kpi-animation {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  overflow: hidden;
  pointer-events: none;
}

.energy-wave {
  position: absolute;
  bottom: 0;
  left: -50%;
  width: 200%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 102, 204, 0.1), transparent);
  animation: waveMove 3s linear infinite;
}

@keyframes waveMove {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(50%);
  }
}

/* 三维可视化中心 */
.visual-center-section {
  margin-bottom: 24px;
  position: relative;
  z-index: 1;
}

.visual-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.dark-mode .visual-container {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

@media (max-width: 768px) {
  .visual-container {
    grid-template-columns: 1fr;
  }
}

/* 3D逆变器模型 */
.inverter-3d-model {
  position: relative;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1000px;
}

.inverter-base {
  position: relative;
  width: 200px;
  height: 120px;
  transform-style: preserve-3d;
  animation: rotateInverter 20s linear infinite;
}

@keyframes rotateInverter {
  0% {
    transform: rotateY(0deg) rotateX(5deg);
  }
  100% {
    transform: rotateY(360deg) rotateX(5deg);
  }
}

.inverter-front,
.inverter-top,
.inverter-side {
  position: absolute;
  background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
}

.inverter-front {
  width: 200px;
  height: 120px;
  transform: translateZ(60px);
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
}

.inverter-top {
  width: 200px;
  height: 120px;
  transform: rotateX(90deg) translateZ(60px);
  background: linear-gradient(135deg, #2c3e50 0%, #4ca1af 100%);
}

.inverter-side {
  width: 120px;
  height: 120px;
  transform: rotateY(90deg) translateZ(100px);
  background: linear-gradient(135deg, #1a2980 0%, #26d0ce 100%);
}

/* 电流流动效果 */
.current-flow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.flow-line {
  position: absolute;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00CCFF, transparent);
  border-radius: 2px;
  animation: flowCurrent 2s linear infinite;
}

.flow-line.line-1 {
  top: 20%;
  left: 0;
  width: 30%;
}

.flow-line.line-2 {
  top: 50%;
  left: 0;
  width: 40%;
  animation-delay: 0.3s;
}

.flow-line.line-3 {
  top: 80%;
  left: 0;
  width: 25%;
  animation-delay: 0.6s;
}

@keyframes flowCurrent {
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateX(200%);
    opacity: 0;
  }
}

/* 热点标注 */
.hotspots {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.hotspot-point {
  position: absolute;
  width: 16px;
  height: 16px;
  background: rgba(0, 102, 204, 0.8);
  border: 2px solid white;
  border-radius: 50%;
  cursor: pointer;
  pointer-events: auto;
  animation: hotspotPulse 2s ease-in-out infinite;
  transition: transform 0.3s;
}

.hotspot-point:hover {
  transform: scale(1.3);
}

@keyframes hotspotPulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(0, 102, 204, 0.4);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(0, 102, 204, 0);
  }
}

.hotspot-tooltip {
  position: absolute;
  bottom: -60px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  white-space: nowrap;
  z-index: 100;
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.tooltip-title {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.tooltip-value {
  font-size: 14px;
  font-weight: 600;
}

/* 功率曲线图容器 */
.power-chart-container {
  display: flex;
  flex-direction: column;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.chart-header h3 {
  font-size: 18px;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.dark-mode .chart-header h3 {
  color: #fff;
}

.chart-legend {
  display: flex;
  gap: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #666;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.chart-wrapper {
  flex: 1;
  min-height: 250px;
}

/* 设备参数详情区 */
.details-section {
  margin-bottom: 24px;
  position: relative;
  z-index: 1;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #333;
  margin: 0 0 16px 0;
}

.dark-mode .section-title {
  color: #fff;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

@media (max-width: 1024px) {
  .details-grid {
    grid-template-columns: 1fr;
  }
}

.detail-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: transform 0.3s, box-shadow 0.3s;
}

.dark-mode .detail-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.detail-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 102, 204, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #F0F0F0;
}

.dark-mode .card-header {
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.dark-mode .card-title {
  color: #fff;
}

.card-icon {
  font-size: 20px;
}

.detail-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.detail-label {
  font-size: 14px;
  color: #666;
}

.dark-mode .detail-label {
  color: #aaa;
}

.detail-value {
  font-size: 14px;
  color: #333;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.dark-mode .detail-value {
  color: #e0e0e0;
}

.copy-btn {
  background: none;
  border: none;
  font-size: 14px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.3s;
}

.copy-btn:hover {
  background: rgba(0, 102, 204, 0.1);
}

.station-tag {
  background: rgba(0, 102, 204, 0.1);
  color: #0066CC;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 13px;
}

.model-tag {
  background: rgba(0, 204, 153, 0.1);
  color: #00CC99;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 13px;
}

.location-value {
  cursor: pointer;
  transition: color 0.3s;
}

.location-value:hover {
  color: #0066CC;
}

.map-icon {
  font-size: 12px;
}

.mini-map-preview {
  margin-top: 16px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.3s;
}

.mini-map-preview:hover {
  transform: scale(1.02);
}

.map-placeholder {
  color: white;
  font-size: 14px;
  font-weight: 500;
}

/* 生命周期与运维区 */
.lifecycle-section {
  margin-bottom: 24px;
  position: relative;
  z-index: 1;
}

.lifecycle-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

@media (max-width: 1024px) {
  .lifecycle-grid {
    grid-template-columns: 1fr;
  }
}

.lifecycle-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.dark-mode .lifecycle-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* 质保信息 */
.warranty-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.warranty-period {
  display: flex;
  justify-content: space-between;
}

.date-item {
  text-align: center;
}

.date-label {
  display: block;
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.dark-mode .date-label {
  color: #aaa;
}

.date-value {
  display: block;
  font-size: 14px;
  color: #333;
  font-weight: 600;
}

.dark-mode .date-value {
  color: #e0e0e0;
}

.warranty-progress {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #333;
}

.dark-mode .progress-header {
  color: #e0e0e0;
}

.progress-percent {
  font-weight: 700;
  color: #0066CC;
}

.progress-bar {
  height: 8px;
  background: #F0F0F0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease, background 0.5s ease;
}

.progress-days {
  font-size: 12px;
  color: #666;
  text-align: right;
}

.dark-mode .progress-days {
  color: #aaa;
}

/* 利用率信息 */
.utilization-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.gauge-chart-wrapper {
  width: 100%;
  height: 200px;
}

.utilization-details {
  width: 100%;
  display: flex;
  justify-content: space-around;
}

.utilization-stat {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.dark-mode .stat-label {
  color: #aaa;
}

.stat-value {
  display: block;
  font-size: 16px;
  color: #333;
  font-weight: 700;
}

.dark-mode .stat-value {
  color: #e0e0e0;
}

/* 数据同步信息 */
.sync-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sync-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sync-label {
  font-size: 14px;
  color: #666;
}

.dark-mode .sync-label {
  color: #aaa;
}

.sync-value {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.dark-mode .sync-value {
  color: #e0e0e0;
}

.refresh-indicator {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(0, 102, 204, 0.05);
  border-radius: 8px;
}

.dark-mode .refresh-indicator {
  background: rgba(255, 255, 255, 0.05);
}

.progress-circle {
  width: 36px;
  height: 36px;
  transform: rotate(-90deg);
}

.progress-bg {
  stroke: #E0E0E0;
}

.progress-indicator {
  transition: stroke-dasharray 0.1s linear;
}

.refresh-text {
  font-size: 12px;
  color: #666;
}

.dark-mode .refresh-text {
  color: #aaa;
}

/* 地图弹窗 */
.map-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.map-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  animation: scaleIn 0.3s ease-out;
}

@keyframes scaleIn {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.map-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #F0F0F0;
}

.map-header h3 {
  font-size: 18px;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.3s;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

.map-body {
  padding: 24px;
}

.map-placeholder-large {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  color: white;
}

.map-icon-large {
  font-size: 48px;
  margin-bottom: 16px;
}

.map-address {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.map-coords {
  font-size: 14px;
  opacity: 0.8;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .inverter-monitor-container {
    padding: 12px;
  }
  
  .status-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .header-actions {
    width: 100%;
    display: flex;
    justify-content: flex-end;
  }
  
  .breadcrumb {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .separator {
    display: none;
  }
  
  .kpi-value {
    font-size: 24px;
  }
}
</style>
