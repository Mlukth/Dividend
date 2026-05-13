<template>
  <div class="inverter-detail-page">
    <!-- 顶部状态条 -->
    <div class="status-header">
      <div class="breadcrumb">
        <span class="station">{{ inverterInfo.station }}</span>
        <span class="separator">/</span>
        <span class="name">{{ inverterInfo.name }}</span>
      </div>
      <div class="status" :class="inverterInfo.statusClass">
        <span class="status-dot"></span>
        <span class="status-text">{{ inverterInfo.status }}</span>
      </div>
    </div>

    <!-- 实时核心指标区 -->
    <div class="kpi-section">
      <el-row :gutter="20">
        <el-col :xs="12" :sm="6" v-for="(kpi, index) in kpiList" :key="index">
          <div class="kpi-card">
            <div class="kpi-icon" :class="kpi.iconClass">
              <el-icon :size="28"><component :is="kpi.icon" /></el-icon>
            </div>
            <div class="kpi-content">
              <div class="kpi-value">
                <span class="number">{{ kpi.value }}</span>
                <span class="unit">{{ kpi.unit }}</span>
              </div>
              <div class="kpi-label">{{ kpi.label }}</div>
              <div class="kpi-trend" v-if="kpi.trend">
                <el-icon><Top /></el-icon>
                <span>{{ kpi.trend }}</span>
              </div>
            </div>
            <div class="water-wave"></div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 三维可视化中心 -->
    <div class="visual-center">
      <div class="model-container">
        <div class="model-placeholder">
          <div class="model-body">
            <div class="current-flow"></div>
            <div class="hotspot hotspot-1" @click="showHotspotInfo('device')">
              <div class="hotspot-ring"></div>
              <div class="hotspot-dot"></div>
            </div>
            <div class="hotspot hotspot-2" @click="showHotspotInfo('product')">
              <div class="hotspot-ring"></div>
              <div class="hotspot-dot"></div>
            </div>
          </div>
        </div>
        <div class="model-label">
          <el-icon><Monitor /></el-icon> 逆变器数字孪生模型
        </div>
      </div>
      <div class="chart-container">
        <div class="chart-header">
          <span class="chart-title">
            <el-icon><TrendCharts /></el-icon> 实时功率曲线
          </span>
          <div class="refresh-indicator">
            <svg class="progress-circle" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#E4E7ED"
                stroke-width="3"
              />
              <path
                class="progress-circle-path"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#0066CC"
                stroke-width="3"
                stroke-dasharray="100, 100"
                :style="{ strokeDashoffset: refreshDashoffset }"
              />
            </svg>
            <span class="refresh-text">{{ formatTime(dataTimestamp) }}</span>
          </div>
        </div>
        <div ref="powerChartRef" class="power-chart"></div>
      </div>
    </div>

    <!-- 设备参数详情区 -->
    <div class="detail-grid">
      <el-row :gutter="20">
        <!-- 身份组 -->
        <el-col :xs="24" :sm="8">
          <div class="detail-card">
            <div class="card-title">
              <el-icon><Key /></el-icon> 资产身份
            </div>
            <div class="detail-item">
              <span class="item-label">逆变器 SN</span>
              <div class="item-value sn-clipboard" @click="copySN">
                <span class="sn-code">{{ detailInfo.sn }}</span>
                <el-icon class="copy-icon"><DocumentCopy /></el-icon>
              </div>
            </div>
            <div class="detail-item">
              <span class="item-label">数据 ID</span>
              <span class="item-value code-text">{{ detailInfo.dataId }}</span>
            </div>
          </div>
        </el-col>
        <!-- 硬件组 -->
        <el-col :xs="24" :sm="8">
          <div class="detail-card">
            <div class="card-title">
              <el-icon><Setting /></el-icon> 硬件规格
            </div>
            <div class="detail-item">
              <span class="item-label">设备型号</span>
              <el-tag type="info" class="spec-tag" effect="light">{{ detailInfo.deviceModel }}</el-tag>
            </div>
            <div class="detail-item">
              <span class="item-label">产品型号</span>
              <el-tag type="info" class="spec-tag" effect="light">{{ detailInfo.productModel }}</el-tag>
            </div>
            <div class="detail-item">
              <span class="item-label">额定功率</span>
              <span class="item-value highlight">{{ detailInfo.ratedPower }} kW</span>
            </div>
          </div>
        </el-col>
        <!-- 位置组 -->
        <el-col :xs="24" :sm="8">
          <div class="detail-card">
            <div class="card-title">
              <el-icon><Location /></el-icon> 安装位置
            </div>
            <div class="detail-item address-item">
              <div class="address-icon-box">
                <el-icon :size="24"><LocationFilled /></el-icon>
              </div>
              <div class="address-text">
                {{ detailInfo.address }}
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 生命周期与运维区 -->
    <div class="lifecycle-section">
      <el-row :gutter="20">
        <!-- 时间轴 -->
        <el-col :xs="24" :md="12">
          <div class="lifecycle-card">
            <div class="card-title">
              <el-icon><Timer /></el-icon> 生命周期时间轴
            </div>
            <el-timeline class="custom-timeline">
              <el-timeline-item
                v-for="(item, index) in timelineList"
                :key="index"
                :timestamp="item.timestamp"
                :type="item.type"
                :color="item.color"
                :size="large"
              >
                <div class="timeline-content">
                  <h4>{{ item.title }}</h4>
                  <p>{{ item.content }}</p>
                </div>
              </el-timeline-item>
            </el-timeline>
          </div>
        </el-col>
        <!-- 质保与仪表盘 -->
        <el-col :xs="24" :md="12">
          <div class="lifecycle-card">
            <div class="card-title">
              <el-icon><Odometer /></el-icon> 质保与利用率
            </div>
            
            <!-- 质保进度 -->
            <div class="warranty-section">
              <div class="warranty-header">
                <div class="warranty-info">
                  <span class="warranty-label">质保周期</span>
                  <span class="warranty-date">{{ lifecycleInfo.warrantyStart }} 至 {{ lifecycleInfo.warrantyEnd }}</span>
                </div>
                <div class="warranty-percent-badge">
                  {{ lifecycleInfo.warrantyPercentage }}%
                </div>
              </div>
              <el-progress 
                :percentage="lifecycleInfo.warrantyPercentage" 
                :color="warrantyColor"
                :stroke-width="14"
                :show-text="false"
              />
              <div class="warranty-footer">
                <div class="warranty-countdown">
                  <el-icon><AlarmClock /></el-icon>
                  剩余质保：<span class="countdown-number">{{ lifecycleInfo.warrantyRemaining }}</span> 天
                </div>
                <div class="warranty-total">
                  总时长：5年
                </div>
              </div>
            </div>

            <div class="divider-line"></div>

            <!-- 仪表盘 -->
            <div class="gauge-section">
              <div class="gauge-header">
                <span class="gauge-label">累计等效小时数</span>
                <span class="gauge-total">设计寿命：30,000 h</span>
              </div>
              <div ref="gaugeChartRef" class="gauge-chart"></div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 动态粒子背景 -->
    <div class="particles-container">
      <div v-for="i in 40" :key="i" class="particle" :style="getParticleStyle(i)"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { 
  Lightning, Sunny, Timer, DataLine, Monitor, TrendCharts, 
  Key, Setting, Location, DocumentCopy, LocationFilled, 
  Timer as TimerIcon, Odometer, AlarmClock, Top
} from '@element-plus/icons-vue'
import dayjs from 'dayjs'

// --- 数据定义 ---

const inverterInfo = ref({
  name: '组串式逆变器 SG-250KTL-M',
  station: '江西赣州瑞金光伏电站',
  status: '运行中',
  statusClass: 'status-running'
})

const kpiList = ref([
  {
    label: '实时功率',
    value: 215.8,
    unit: 'kW',
    icon: Lightning,
    iconClass: 'icon-power',
    trend: '环比昨日+5.2%'
  },
  {
    label: '当日电量',
    value: 1842.5,
    unit: 'kWh',
    icon: Sunny,
    iconClass: 'icon-energy',
    trend: '环比昨日+3.8%'
  },
  {
    label: '当日等效小时数',
    value: 7.37,
    unit: 'h',
    icon: TimerIcon,
    iconClass: 'icon-hour',
    trend: ''
  },
  {
    label: '累计电量',
    value: 1258.6,
    unit: 'MWh',
    icon: DataLine,
    iconClass: 'icon-total',
    trend: ''
  }
])

const detailInfo = ref({
  sn: 'SG250KTL-M-2023-084521',
  dataId: 'INV-001-20230815-001',
  deviceModel: 'SG-250KTL-M',
  productModel: 'SUN2000-250KTL-M0',
  ratedPower: 250,
  address: '江西省赣州市瑞金市叶坪镇光伏产业园A区3号'
})

const lifecycleInfo = ref({
  warrantyStart: '2023-08-15',
  warrantyEnd: '2028-08-14',
  warrantyPercentage: 52,
  warrantyRemaining: 1752,
  totalHours: 15842
})

const timelineList = ref([
  {
    timestamp: '2023-08-15 10:30:00',
    title: '设备投产',
    content: '设备正式并网发电运行',
    type: 'primary',
    color: '#0066CC'
  },
  {
    timestamp: '2023-11-02 09:00:00',
    title: '例行维护',
    content: '完成首次季度例行检查及清洁',
    type: 'success',
    color: '#67C23A'
  },
  {
    timestamp: '2024-05-18 14:20:00',
    title: '年度检修',
    content: '完成年度深度检修及固件升级',
    type: 'success',
    color: '#67C23A'
  },
  {
    timestamp: '2026-03-25 ' + dayjs().format('HH:mm:ss'),
    title: '实时同步',
    content: '数据正在实时采集中...',
    type: 'warning',
    color: '#E6A23C'
  }
])

// --- 图表与状态 ---

const powerChartRef = ref(null)
const gaugeChartRef = ref(null)
const dataTimestamp = ref(new Date())
const refreshTimer = ref(null)

let powerChart = null
let gaugeChart = null

// 刷新进度条动画
const refreshDashoffset = ref(0)

// 质保颜色计算
const warrantyColor = computed(() => {
  const p = lifecycleInfo.value.warrantyPercentage
  if (p < 70) return '#67C23A'
  if (p < 90) return '#E6A23C'
  return '#F56C6C'
})

// --- 方法 ---

const copySN = async () => {
  try {
    await navigator.clipboard.writeText(detailInfo.value.sn)
    ElMessage.success('SN码已复制到剪贴板')
  } catch (err) {
    ElMessage.error('复制失败，请手动复制')
  }
}

const showHotspotInfo = (type) => {
  const info = type === 'device' 
    ? `设备型号：${detailInfo.value.deviceModel}`
    : `产品型号：${detailInfo.value.productModel}`
  ElMessage({
    message: info,
    type: 'info',
    duration: 2000
  })
}

const formatTime = (date) => {
  return dayjs(date).format('HH:mm:ss')
}

// --- 图表初始化 ---

const initPowerChart = () => {
  if (!powerChartRef.value) return
  
  powerChart = echarts.init(powerChartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 102, 204, 0.95)',
      borderColor: '#0066CC',
      textStyle: { color: '#fff' },
      formatter: '{b}<br/>{a}: <strong>{c} kW</strong>'
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
      data: generateTimeLabels(),
      axisLine: { lineStyle: { color: '#E4E7ED' } },
      axisLabel: { color: '#909399', fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      name: 'kW',
      splitLine: { lineStyle: { color: '#F5F7FA', type: 'dashed' } },
      axisLabel: { color: '#909399' }
    },
    series: [
      {
        name: '实时功率',
        type: 'line',
        smooth: true,
        symbol: 'none',
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(0, 102, 204, 0.4)' },
            { offset: 1, color: 'rgba(0, 102, 204, 0.01)' }
          ])
        },
        lineStyle: { color: '#0066CC', width: 3 },
        data: generatePowerData()
      }
    ]
  }
  
  powerChart.setOption(option)
}

const initGaugeChart = () => {
  if (!gaugeChartRef.value) return
  
  gaugeChart = echarts.init(gaugeChartRef.value)
  
  const option = {
    series: [
      {
        type: 'gauge',
        startAngle: 200,
        endAngle: -20,
        min: 0,
        max: 30000,
        splitNumber: 5,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: '#67C23A' },
              { offset: 0.5, color: '#0066CC' },
              { offset: 1, color: '#F56C6C' }
            ]
          }
        },
        progress: {
          show: true,
          width: 20,
          roundCap: true
        },
        pointer: { show: false },
        axisLine: {
          lineStyle: {
            width: 20,
            color: [[1, '#F5F7FA']]
          },
          roundCap: true
        },
        axisTick: { show: false },
        splitLine: {
          show: true,
          length: 5,
          lineStyle: {
            color: '#fff',
            width: 2
          }
        },
        axisLabel: {
          distance: 25,
          color: '#909399',
          fontSize: 12,
          formatter: function (value) {
            return value / 1000 + 'k'
          }
        },
        anchor: { show: false },
        title: { show: false },
        detail: {
          valueAnimation: true,
          fontSize: 32,
          fontWeight: 'bolder',
          color: '#303133',
          offsetCenter: [0, '20%'],
          formatter: function (value) {
            return '{value|' + value.toLocaleString() + '}\n{unit|h}'
          },
          rich: {
            value: { fontSize: 32, color: '#303133', lineHeight: 40 },
            unit: { fontSize: 14, color: '#909399', lineHeight: 20 }
          }
        },
        data: [
          {
            value: lifecycleInfo.value.totalHours
          }
        ]
      }
    ]
  }
  
  gaugeChart.setOption(option)
}

// 模拟数据生成
const generateTimeLabels = () => {
  const labels = []
  for (let i = 0; i <= 24; i++) {
    labels.push(`${i.toString().padStart(2, '0')}:00`)
  }
  return labels
}

const generatePowerData = () => {
  const data = []
  for (let i = 0; i <= 24; i++) {
    let power = 0
    if (i >= 6 && i <= 18) {
      const peak = 250
      const mid = 12
      const diff = Math.abs(i - mid)
      power = Math.round(peak * Math.exp(-0.05 * diff * diff) * (0.9 + Math.random() * 0.2))
    }
    data.push(power)
  }
  return data
}

// 粒子样式
const getParticleStyle = (index) => {
  const size = Math.random() * 4 + 1
  const left = Math.random() * 100
  const top = Math.random() * 100
  const delay = Math.random() * 15
  const duration = Math.random() * 25 + 15
  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${left}%`,
    top: `${top}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`
  }
}

// 模拟数据刷新
const startDataRefresh = () => {
  refreshTimer.value = setInterval(() => {
    // 更新时间戳
    dataTimestamp.value = new Date()
    
    // 模拟进度条动画 (0 to 100)
    let start = Date.now()
    const duration = 60000 // 60s
    const animate = () => {
      let p = (Date.now() - start) / duration
      if (p > 1) p = 1
      // stroke-dashoffset: 0 is full, 100 is empty
      refreshDashoffset.value = 100 - (p * 100)
      
      if (p < 1) {
        requestAnimationFrame(animate)
      } else {
        start = Date.now()
        // 模拟KPI跳动
        kpiList.value[0].value = Number((200 + Math.random() * 50).toFixed(1))
        requestAnimationFrame(animate)
      }
    }
    requestAnimationFrame(animate)

  }, 60000)
}

// --- 生命周期 ---

onMounted(() => {
  nextTick(() => {
    initPowerChart()
    initGaugeChart()
    startDataRefresh()
    
    // 初始化进度条
    refreshDashoffset.value = 50 // 随便设个初始值示意
  })

  window.addEventListener('resize', () => {
    powerChart && powerChart.resize()
    gaugeChart && gaugeChart.resize()
  })
})

onUnmounted(() => {
  if (refreshTimer.value) clearInterval(refreshTimer.value)
  if (powerChart) powerChart.dispose()
  if (gaugeChart) gaugeChart.dispose()
})
</script>

<style scoped>
/* 全局容器 */
.inverter-detail-page {
  position: relative;
  min-height: 100vh;
  padding: 24px;
  background-color: #F5F7FA;
  overflow-x: hidden;
  color: #303133;
}

/* 顶部状态条 */
.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0 24px 0;
}

.breadcrumb {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.breadcrumb .station {
  font-size: 14px;
  color: #909399;
}

.breadcrumb .separator {
  color: #DCDFE6;
  font-size: 14px;
}

.breadcrumb .name {
  font-size: 22px;
  font-weight: 800;
  color: #303133;
  letter-spacing: 0.5px;
}

.status {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 20px;
  border-radius: 24px;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #EBEEF5;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #67C23A;
  position: relative;
}

.status-dot::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: inherit;
  animation: breathing 2s ease-in-out infinite;
}

.status-running .status-dot {
  background-color: #67C23A;
}

.status-text {
  font-size: 14px;
  font-weight: 600;
  color: #67C23A;
}

/* KPI 卡片 */
.kpi-section {
  margin-bottom: 24px;
}

.kpi-card {
  position: relative;
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
  height: 160px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.kpi-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(0, 102, 204, 0.12);
  border-color: #0066CC20;
}

.kpi-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  margin-bottom: 12px;
}

.icon-power { background: linear-gradient(135deg, #0066CC, #0099FF); }
.icon-energy { background: linear-gradient(135deg, #FF9900, #FFCC00); }
.icon-hour { background: linear-gradient(135deg, #67C23A, #85CE61); }
.icon-total { background: linear-gradient(135deg, #606266, #909399); }

.kpi-content { z-index: 2; }

.kpi-value {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.kpi-value .number {
  font-size: 36px;
  font-weight: 800;
  color: #303133;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.kpi-value .unit {
  font-size: 14px;
  color: #909399;
  font-weight: 500;
}

.kpi-label {
  font-size: 14px;
  color: #606266;
  margin-top: 8px;
  font-weight: 500;
}

.kpi-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #67C23A;
  margin-top: 6px;
  font-weight: 600;
}

/* 水波纹背景 */
.water-wave {
  position: absolute;
  bottom: -50%;
  left: -20%;
  width: 140%;
  height: 100%;
  background: radial-gradient(ellipse at center, rgba(0, 102, 204, 0.04) 0%, transparent 70%);
  animation: waveFloat 6s ease-in-out infinite;
  z-index: 0;
}

/* 可视化中心 */
.visual-center {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  height: 380px;
}

.model-container, .chart-container {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
}

.model-container {
  flex: 1;
  align-items: center;
  justify-content: center;
}

.model-placeholder {
  width: 220px;
  height: 220px;
  perspective: 1000px;
}

.model-body {
  width: 100%;
  height: 100%;
  background: linear-gradient(145deg, #0052A3, #0066CC, #0077E6);
  border-radius: 24px;
  position: relative;
  box-shadow: 0 20px 40px rgba(0, 102, 204, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transform-style: preserve-3d;
  animation: modelFloat 6s ease-in-out infinite;
}

.current-flow {
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  transform: skewX(-25deg);
  animation: flowShine 3s linear infinite;
}

.hotspot {
  position: absolute;
  cursor: pointer;
  z-index: 10;
}

.hotspot-1 { top: 25%; left: 20%; }
.hotspot-2 { bottom: 25%; right: 20%; }

.hotspot-dot {
  width: 12px;
  height: 12px;
  background: #fff;
  border-radius: 50%;
  z-index: 2;
  position: relative;
}

.hotspot-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  border: 2px solid #fff;
  border-radius: 50%;
  animation: ripple 2s ease-out infinite;
}

.model-label {
  margin-top: 20px;
  font-size: 14px;
  color: #606266;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
}

/* 图表区域 */
.chart-container {
  flex: 1.5;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #F5F7FA;
}

.chart-title {
  font-size: 16px;
  font-weight: 700;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 8px;
}

.refresh-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-circle {
  width: 20px;
  height: 20px;
  transform: rotate(-90deg);
}

.progress-circle-path {
  transition: stroke-dashoffset 0.5s linear;
}

.refresh-text {
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 12px;
  color: #909399;
  background: #F5F7FA;
  padding: 2px 6px;
  border-radius: 4px;
}

.power-chart {
  flex: 1;
  width: 100%;
  min-height: 0;
}

/* 参数详情网格 */
.detail-grid {
  margin-bottom: 24px;
}

.detail-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  height: 100%;
}

.card-title {
  font-size: 15px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.item-label {
  font-size: 13px;
  color: #909399;
}

.item-value {
  font-size: 14px;
  color: #303133;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.sn-clipboard {
  cursor: pointer;
  padding: 4px 8px;
  background: #F5F7FA;
  border-radius: 6px;
  transition: background 0.2s;
}

.sn-clipboard:hover {
  background: #ECF5FF;
  color: #0066CC;
}

.sn-code, .code-text {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 13px;
}

.spec-tag {
  background-color: #ECF5FF;
  color: #0066CC;
  border: 1px solid #CCE2FF;
  font-weight: 600;
}

.highlight {
  color: #0066CC;
  font-size: 16px;
}

.address-item {
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
}

.address-icon-box {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #0066CC20, #0066CC10);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0066CC;
}

.address-text {
  font-size: 14px;
  color: #303133;
  line-height: 1.5;
  font-weight: 500;
}

/* 生命周期区域 */
.lifecycle-section {}

.lifecycle-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  height: 100%;
}

/* 质保进度条 */
.warranty-section {
  margin-bottom: 24px;
}

.warranty-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.warranty-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.warranty-label {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.warranty-date {
  font-size: 12px;
  color: #909399;
}

.warranty-percent-badge {
  font-size: 18px;
  font-weight: 800;
  color: #0066CC;
}

.warranty-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.warranty-countdown {
  font-size: 13px;
  color: #606266;
  display: flex;
  align-items: center;
  gap: 4px;
}

.countdown-number {
  color: #E6A23C;
  font-weight: 700;
  font-size: 16px;
}

.warranty-total {
  font-size: 12px;
  color: #C0C4CC;
}

.divider-line {
  height: 1px;
  background: #F5F7FA;
  margin: 24px 0;
}

/* 仪表盘 */
.gauge-section {}

.gauge-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.gauge-label {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.gauge-total {
  font-size: 12px;
  color: #909399;
}

.gauge-chart {
  width: 100%;
  height: 200px;
}

/* 时间轴自定义 */
.custom-timeline :deep(.el-timeline-item__timestamp) {
  font-size: 12px;
  color: #909399;
}

.timeline-content h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #303133;
  font-weight: 600;
}

.timeline-content p {
  margin: 0;
  font-size: 13px;
  color: #606266;
}

/* 粒子背景 */
.particles-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.particle {
  position: absolute;
  background: rgba(0, 102, 204, 0.15);
  border-radius: 50%;
  animation: floatUp linear infinite;
}

/* 动画 Keyframes */
@keyframes breathing {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
}

@keyframes waveFloat {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-20px) scale(1.05); }
}

@keyframes modelFloat {
  0%, 100% { transform: rotateY(0deg) rotateX(5deg); }
  50% { transform: rotateY(10deg) rotateX(-5deg); }
}

@keyframes flowShine {
  0% { left: -100%; }
  100% { left: 200%; }
}

@keyframes ripple {
  0% { width: 12px; height: 12px; opacity: 1; }
  100% { width: 40px; height: 40px; opacity: 0; }
}

@keyframes floatUp {
  0% { transform: translateY(0) translateX(0); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(-100vh) translateX(50px); opacity: 0; }
}

/* 响应式 */
@media (max-width: 1024px) {
  .visual-center {
    flex-direction: column;
    height: auto;
  }
  .model-placeholder { width: 180px; height: 180px; }
}
</style>