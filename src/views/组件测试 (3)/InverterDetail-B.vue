<template>
  <div class="inverter-detail-b">
    <!-- Header -->
    <div class="page-header">
      <h2 class="page-title">
        <svg class="title-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2"/><path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 7h5M17 17h5"/></svg>
        逆变器详情
      </h2>
      <div class="inverter-switcher">
        <el-select v-model="currentId" placeholder="选择逆变器" size="default" class="dark-select">
          <el-option
            v-for="inv in inverterList"
            :key="inv.id"
            :label="inv.name"
            :value="inv.id"
          >
            <span :class="['status-dot', inv.status]"></span>
            <span>{{ inv.name }}</span>
          </el-option>
        </el-select>
      </div>
    </div>

    <div class="content-wrapper" v-if="inverter">
      <!-- Left Column -->
      <div class="left-column">
        <!-- Basic Info Card -->
        <div class="card info-card glow-border">
          <div class="card-header">
            <span class="header-line"></span>
            <h3>基本信息</h3>
          </div>
          <div class="info-grid">
            <div class="info-item" v-for="item in basicInfoItems" :key="item.label">
              <span class="info-label">{{ item.label }}</span>
              <span :class="['info-value', { mono: item.mono }]">{{ item.value }}</span>
            </div>
          </div>
        </div>

        <!-- Status Card -->
        <div class="card status-card" :class="'glow-' + inverter.status">
          <div class="card-header">
            <span class="header-line"></span>
            <h3>状态指标</h3>
          </div>
          <div class="status-main">
            <div class="status-badge" :class="inverter.status">
              <span class="status-indicator"></span>
              <span class="status-text">{{ statusLabel[inverter.status] }}</span>
            </div>
            <div class="power-display">
              <div class="power-item">
                <span class="power-label">实时功率</span>
                <span class="power-value accent">{{ inverter.realtimePower }}<small>kW</small></span>
              </div>
              <div class="power-divider"></div>
              <div class="power-item">
                <span class="power-label">额定功率</span>
                <span class="power-value">{{ inverter.ratedPower }}<small>kW</small></span>
              </div>
            </div>
            <div class="power-bar-wrapper">
              <div class="power-bar-bg">
                <div class="power-bar-fill" :style="{ width: powerPercent + '%' }"></div>
              </div>
              <span class="power-percent">{{ powerPercent.toFixed(1) }}%</span>
            </div>
          </div>
        </div>

        <!-- Time Info Card -->
        <div class="card time-card glow-border">
          <div class="card-header">
            <span class="header-line"></span>
            <h3>时间信息</h3>
          </div>
          <div class="time-grid">
            <div class="time-item">
              <span class="time-label">数据时间</span>
              <span class="time-value">{{ inverter.dataTimestamp }}</span>
            </div>
            <div class="time-item">
              <span class="time-label">更新时间</span>
              <span class="time-value">{{ inverter.updateTime }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="right-column">
        <!-- Energy Statistics -->
        <div class="card energy-card glow-border">
          <div class="card-header">
            <span class="header-line"></span>
            <h3>能量统计</h3>
          </div>
          <div class="energy-grid">
            <div class="energy-item">
              <div class="energy-icon">⚡</div>
              <div class="energy-number">{{ inverter.dailyEnergy }}</div>
              <div class="energy-unit">kWh</div>
              <div class="energy-desc">当日电量</div>
            </div>
            <div class="energy-item featured">
              <div class="energy-icon">📊</div>
              <div class="energy-number neon">{{ inverter.totalEnergy }}</div>
              <div class="energy-unit">MWh</div>
              <div class="energy-desc">累计电量</div>
            </div>
            <div class="energy-item">
              <div class="energy-icon">☀️</div>
              <div class="energy-number">{{ inverter.dailyHours }}</div>
              <div class="energy-unit">h</div>
              <div class="energy-desc">当日等效小时数</div>
            </div>
            <div class="energy-item featured">
              <div class="energy-icon">⏱️</div>
              <div class="energy-number neon">{{ inverter.totalHours }}</div>
              <div class="energy-unit">h</div>
              <div class="energy-desc">累计等效小时数</div>
            </div>
          </div>
        </div>

        <!-- History Trend - Collapsible -->
        <el-collapse v-model="activeCollapse" class="card collapse-card">
          <el-collapse-item name="trend">
            <template #title>
              <div class="collapse-title">
                <span class="header-line"></span>
                <h3>历史趋势</h3>
              </div>
            </template>
            <div class="chart-tabs">
              <button
                :class="['chart-tab', { active: chartTab === '24h' }]"
                @click="chartTab = '24h'"
              >24小时功率</button>
              <button
                :class="['chart-tab', { active: chartTab === '7d' }]"
                @click="chartTab = '7d'"
              >7天发电量</button>
            </div>
            <div ref="chartRef" class="chart-container"></div>
          </el-collapse-item>
          <el-collapse-item name="ops">
            <template #title>
              <div class="collapse-title">
                <span class="header-line"></span>
                <h3>设备运维</h3>
              </div>
            </template>
            <div class="ops-grid">
              <div class="ops-item">
                <span class="ops-label">投产时间</span>
                <span class="ops-value">{{ inverter.commissionDate }}</span>
              </div>
              <div class="ops-item">
                <span class="ops-label">质保到期时间</span>
                <span class="ops-value" :class="{ warning: isWarrantyExpiring }">{{ inverter.warrantyExpiry }}</span>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as echarts from 'echarts'

const statusLabel = {
  running: '运行中',
  standby: '待机',
  fault: '故障',
  offline: '离线'
}

const mockInverters = [
  {
    id: 'inv001',
    sn: 'SN-INV-2024-00001',
    name: '逆变器 #01 - A区',
    deviceModel: 'SUN2000-100KTL-M1',
    productModel: 'Huawei FusionSolar',
    station: '阳光光伏电站',
    address: '甘肃省武威市凉州区光伏产业园A区',
    dataId: 'DID-A1B2C3D4E5F6',
    status: 'running',
    realtimePower: 82.5,
    ratedPower: 100,
    dailyEnergy: 526.8,
    totalEnergy: 1582.6,
    dailyHours: 5.27,
    totalHours: 15826,
    dataTimestamp: '2025-01-15 14:30:00',
    updateTime: '2025-01-15 14:30:05',
    commissionDate: '2023-06-15',
    warrantyExpiry: '2028-06-14',
    power24h: [0,0,0,0,0,0,0.5,12.3,35.7,58.2,72.1,80.5,85.3,82.5,78.6,71.2,55.8,30.4,10.2,1.0,0,0,0,0],
    energy7d: [480,512,498,535,520,526,510]
  },
  {
    id: 'inv002',
    sn: 'SN-INV-2024-00002',
    name: '逆变器 #02 - B区',
    deviceModel: 'SUN2000-60KTL-M0',
    productModel: 'Huawei FusionSolar',
    station: '阳光光伏电站',
    address: '甘肃省武威市凉州区光伏产业园B区',
    dataId: 'DID-G7H8I9J0K1L2',
    status: 'standby',
    realtimePower: 0,
    ratedPower: 60,
    dailyEnergy: 312.4,
    totalEnergy: 985.3,
    dailyHours: 5.21,
    totalHours: 16422,
    dataTimestamp: '2025-01-15 14:30:00',
    updateTime: '2025-01-15 14:30:03',
    commissionDate: '2023-08-20',
    warrantyExpiry: '2028-08-19',
    power24h: [0,0,0,0,0,0,0,8.5,28.2,45.6,55.3,58.1,0,0,0,0,0,0,0,0,0,0,0,0],
    energy7d: [290,305,298,312,288,312,295]
  },
  {
    id: 'inv003',
    sn: 'SN-INV-2024-00003',
    name: '逆变器 #03 - C区',
    deviceModel: 'SG110CX',
    productModel: 'Sungrow Power',
    station: '阳光光伏电站',
    address: '甘肃省武威市凉州区光伏产业园C区',
    dataId: 'DID-M3N4O5P6Q7R8',
    status: 'fault',
    realtimePower: 0,
    ratedPower: 110,
    dailyEnergy: 156.2,
    totalEnergy: 2103.8,
    dailyHours: 1.42,
    totalHours: 19125,
    dataTimestamp: '2025-01-15 10:15:00',
    updateTime: '2025-01-15 10:15:02',
    commissionDate: '2022-03-10',
    warrantyExpiry: '2027-03-09',
    power24h: [0,0,0,0,0,0,0,10.2,42.5,65.8,78.3,85.1,0,0,0,0,0,0,0,0,0,0,0,0],
    energy7d: [520,535,0,0,156,0,0]
  }
]

const currentId = ref('inv001')
const chartTab = ref('24h')
const activeCollapse = ref(['trend', 'ops'])
const chartRef = ref(null)
let chartInstance = null

const inverterList = computed(() => mockInverters.map(i => ({ id: i.id, name: i.name, status: i.status })))
const inverter = computed(() => mockInverters.find(i => i.id === currentId.value))
const powerPercent = computed(() => {
  if (!inverter.value) return 0
  return (inverter.value.realtimePower / inverter.value.ratedPower) * 100
})
const isWarrantyExpiring = computed(() => false)

const basicInfoItems = computed(() => {
  if (!inverter.value) return []
  const inv = inverter.value
  return [
    { label: '逆变器SN', value: inv.sn },
    { label: '名称', value: inv.name },
    { label: '设备型号', value: inv.deviceModel },
    { label: '产品型号', value: inv.productModel },
    { label: '所属电站', value: inv.station },
    { label: '安装地址', value: inv.address },
    { label: '数据ID', value: inv.dataId, mono: true }
  ]
})

function getHoursLabels() {
  return Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`)
}
function get7dLabels() {
  return ['周一','周二','周三','周四','周五','周六','周日']
}

function buildChartOption() {
  if (!inverter.value) return {}
  const inv = inverter.value
  if (chartTab.value === '24h') {
    return {
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(22,33,62,0.95)', borderColor: '#0AFFEF', textStyle: { color: '#0AFFEF' } },
      grid: { left: 50, right: 20, top: 20, bottom: 30 },
      xAxis: { type: 'category', data: getHoursLabels(), axisLine: { lineStyle: { color: '#2a3a5c' } }, axisLabel: { color: '#5a6a8a', fontSize: 11 }, axisTick: { show: false } },
      yAxis: { type: 'value', name: 'kW', nameTextStyle: { color: '#5a6a8a', fontSize: 11 }, axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: 'rgba(42,58,92,0.5)' } }, axisLabel: { color: '#5a6a8a', fontSize: 11 } },
      series: [{
        type: 'line',
        data: inv.power24h,
        smooth: true,
        symbol: 'none',
        lineStyle: { color: '#00FF88', width: 2, shadowColor: '#00FF88', shadowBlur: 8 },
        areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(0,255,136,0.3)' }, { offset: 1, color: 'rgba(0,255,136,0)' }]) }
      }]
    }
  } else {
    return {
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(22,33,62,0.95)', borderColor: '#0AFFEF', textStyle: { color: '#0AFFEF' } },
      grid: { left: 50, right: 20, top: 20, bottom: 30 },
      xAxis: { type: 'category', data: get7dLabels(), axisLine: { lineStyle: { color: '#2a3a5c' } }, axisLabel: { color: '#5a6a8a', fontSize: 11 }, axisTick: { show: false } },
      yAxis: { type: 'value', name: 'kWh', nameTextStyle: { color: '#5a6a8a', fontSize: 11 }, axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: 'rgba(42,58,92,0.5)' } }, axisLabel: { color: '#5a6a8a', fontSize: 11 } },
      series: [{
        type: 'bar',
        data: inv.energy7d,
        barWidth: '45%',
        itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#0AFFEF' }, { offset: 1, color: '#0066FF' }]), borderRadius: [4, 4, 0, 0] }
      }]
    }
  }
}

function initChart() {
  if (!chartRef.value) return
  chartInstance = echarts.init(chartRef.value, null, { renderer: 'canvas' })
  chartInstance.setOption(buildChartOption())
}

function updateChart() {
  if (!chartInstance) return
  chartInstance.setOption(buildChartOption(), true)
}

watch([currentId, chartTab], () => {
  nextTick(() => updateChart())
})

onMounted(() => {
  nextTick(() => initChart())
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})

function handleResize() {
  if (chartInstance) chartInstance.resize()
}
</script>

<style scoped>
.inverter-detail-b {
  min-height: 100vh;
  background: #1A1A2E;
  padding: 20px;
  font-family: 'SF Mono', 'Fira Code', 'Courier New', monospace;
  color: #c8d6e5;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto 20px;
}
.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #0AFFEF;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  text-shadow: 0 0 20px rgba(10,255,239,0.3);
}
.title-icon {
  filter: drop-shadow(0 0 6px rgba(10,255,239,0.5));
}
.inverter-switcher {
  min-width: 240px;
}

.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
  vertical-align: middle;
}
.status-dot.running { background: #00B42A; box-shadow: 0 0 6px #00B42A; }
.status-dot.standby { background: #FF7D00; box-shadow: 0 0 6px #FF7D00; }
.status-dot.fault { background: #F53F3F; box-shadow: 0 0 6px #F53F3F; }
.status-dot.offline { background: #86909C; }

.content-wrapper {
  display: grid;
  grid-template-columns: 30% 70%;
  gap: 16px;
  max-width: 1200px;
  margin: 0 auto;
}

.card {
  background: rgba(22,33,62,0.8);
  border-radius: 8px;
  border: 1px solid rgba(42,58,92,0.6);
  padding: 20px;
  margin-bottom: 16px;
  backdrop-filter: blur(10px);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(42,58,92,0.6);
}
.header-line {
  display: inline-block;
  width: 3px;
  height: 16px;
  background: #0AFFEF;
  border-radius: 2px;
  box-shadow: 0 0 8px rgba(10,255,239,0.5);
}
.card-header h3 {
  font-size: 14px;
  font-weight: 600;
  color: #e2e8f0;
  margin: 0;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.glow-border { border-color: rgba(10,255,239,0.15); }
.glow-running {
  border-color: rgba(0,180,42,0.3);
  box-shadow: 0 0 15px rgba(0,180,42,0.1), inset 0 0 15px rgba(0,180,42,0.05);
}
.glow-standby {
  border-color: rgba(255,125,0,0.3);
  box-shadow: 0 0 15px rgba(255,125,0,0.1), inset 0 0 15px rgba(255,125,0,0.05);
}
.glow-fault {
  border-color: rgba(245,63,63,0.3);
  box-shadow: 0 0 15px rgba(245,63,63,0.1), inset 0 0 15px rgba(245,63,63,0.05);
  animation: fault-glow 2s ease-in-out infinite;
}
@keyframes fault-glow {
  0%, 100% { box-shadow: 0 0 15px rgba(245,63,63,0.1), inset 0 0 15px rgba(245,63,63,0.05); }
  50% { box-shadow: 0 0 25px rgba(245,63,63,0.25), inset 0 0 25px rgba(245,63,63,0.1); }
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 16px;
}
.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.info-label {
  font-size: 11px;
  color: #5a6a8a;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.info-value {
  font-size: 13px;
  color: #c8d6e5;
  word-break: break-all;
}
.info-value.mono {
  color: #00FF88;
  font-family: 'SF Mono', 'Fira Code', monospace;
  text-shadow: 0 0 8px rgba(0,255,136,0.3);
}

.status-main {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  width: fit-content;
  letter-spacing: 1px;
  text-transform: uppercase;
}
.status-badge.running { background: rgba(0,180,42,0.12); color: #00B42A; border: 1px solid rgba(0,180,42,0.3); }
.status-badge.standby { background: rgba(255,125,0,0.12); color: #FF7D00; border: 1px solid rgba(255,125,0,0.3); }
.status-badge.fault { background: rgba(245,63,63,0.12); color: #F53F3F; border: 1px solid rgba(245,63,63,0.3); }
.status-badge.offline { background: rgba(134,144,156,0.12); color: #86909C; border: 1px solid rgba(134,144,156,0.3); }
.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}
.status-badge.running .status-indicator {
  box-shadow: 0 0 8px #00B42A;
  animation: neon-pulse-green 2s infinite;
}
.status-badge.fault .status-indicator {
  box-shadow: 0 0 8px #F53F3F;
  animation: neon-pulse-red 1.5s infinite;
}
@keyframes neon-pulse-green {
  0%, 100% { box-shadow: 0 0 4px #00B42A; }
  50% { box-shadow: 0 0 12px #00B42A, 0 0 24px rgba(0,180,42,0.3); }
}
@keyframes neon-pulse-red {
  0%, 100% { box-shadow: 0 0 4px #F53F3F; }
  50% { box-shadow: 0 0 12px #F53F3F, 0 0 24px rgba(245,63,63,0.3); }
}

.power-display {
  display: flex;
  align-items: center;
  gap: 16px;
}
.power-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.power-label {
  font-size: 11px;
  color: #5a6a8a;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.power-value {
  font-size: 28px;
  font-weight: 700;
  color: #8a9ab5;
  line-height: 1;
}
.power-value.accent {
  color: #00FF88;
  text-shadow: 0 0 20px rgba(0,255,136,0.4);
}
.power-value small {
  font-size: 14px;
  font-weight: 400;
  margin-left: 2px;
}
.power-divider {
  width: 1px;
  height: 36px;
  background: rgba(42,58,92,0.8);
}
.power-bar-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}
.power-bar-bg {
  flex: 1;
  height: 6px;
  background: rgba(42,58,92,0.8);
  border-radius: 3px;
  overflow: hidden;
  border: 1px solid rgba(10,255,239,0.15);
}
.power-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #00FF88, #0AFFEF);
  border-radius: 3px;
  transition: width 0.6s ease;
  box-shadow: 0 0 10px rgba(0,255,136,0.5);
}
.power-percent {
  font-size: 13px;
  color: #0AFFEF;
  font-weight: 600;
  min-width: 44px;
  text-align: right;
  text-shadow: 0 0 8px rgba(10,255,239,0.4);
}

.time-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.time-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.time-label {
  font-size: 11px;
  color: #5a6a8a;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.time-value {
  font-size: 13px;
  color: #8a9ab5;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.energy-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.energy-item {
  text-align: center;
  padding: 16px 8px;
  background: rgba(10,20,40,0.6);
  border-radius: 8px;
  border: 1px solid rgba(42,58,92,0.5);
  transition: border-color 0.3s;
}
.energy-item.featured {
  border-color: rgba(10,255,239,0.2);
}
.energy-item:hover {
  border-color: rgba(10,255,239,0.4);
}
.energy-icon {
  font-size: 18px;
  margin-bottom: 8px;
}
.energy-number {
  font-size: 28px;
  font-weight: 700;
  color: #c8d6e5;
  line-height: 1.1;
}
.energy-number.neon {
  color: #0AFFEF;
  text-shadow: 0 0 15px rgba(10,255,239,0.4);
}
.energy-unit {
  font-size: 12px;
  color: #5a6a8a;
  margin-top: 4px;
}
.energy-desc {
  font-size: 11px;
  color: #5a6a8a;
  margin-top: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.collapse-card {
  background: rgba(22,33,62,0.8);
  border-radius: 8px;
  border: 1px solid rgba(42,58,92,0.6);
  margin-bottom: 16px;
  padding: 0;
  overflow: hidden;
  backdrop-filter: blur(10px);
}
.collapse-card :deep(.el-collapse-item__header) {
  padding: 16px 20px;
  background: transparent;
  border-bottom: 1px solid rgba(42,58,92,0.6);
  color: #e2e8f0;
  font-size: 14px;
  font-weight: 600;
  height: auto;
  line-height: 1.5;
  letter-spacing: 0.5px;
}
.collapse-card :deep(.el-collapse-item__arrow) {
  color: #5a6a8a;
}
.collapse-card :deep(.el-collapse-item__wrap) {
  background: transparent;
  border-bottom: none;
}
.collapse-card :deep(.el-collapse-item__content) {
  padding: 16px 20px;
  color: #c8d6e5;
}
.collapse-title {
  display: flex;
  align-items: center;
  gap: 10px;
}
.collapse-title h3 {
  font-size: 14px;
  font-weight: 600;
  color: #e2e8f0;
  margin: 0;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.chart-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}
.chart-tab {
  padding: 6px 16px;
  border: 1px solid rgba(42,58,92,0.8);
  border-radius: 4px;
  background: rgba(10,20,40,0.6);
  font-size: 13px;
  color: #5a6a8a;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}
.chart-tab.active {
  background: rgba(10,255,239,0.1);
  color: #0AFFEF;
  border-color: rgba(10,255,239,0.4);
  box-shadow: 0 0 10px rgba(10,255,239,0.15);
}
.chart-container {
  width: 100%;
  height: 320px;
}

.ops-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.ops-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.ops-label {
  font-size: 11px;
  color: #5a6a8a;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.ops-value {
  font-size: 13px;
  color: #c8d6e5;
}
.ops-value.warning {
  color: #FF7D00;
  text-shadow: 0 0 8px rgba(255,125,0,0.3);
}

.inverter-detail-b :deep(.el-input__wrapper) {
  background: rgba(22,33,62,0.8) !important;
  box-shadow: 0 0 0 1px rgba(42,58,92,0.6) !important;
}
.inverter-detail-b :deep(.el-input__inner) {
  color: #c8d6e5 !important;
}
.inverter-detail-b :deep(.el-input__inner::placeholder) {
  color: #5a6a8a !important;
}

@media (max-width: 1024px) {
  .content-wrapper {
    grid-template-columns: 1fr;
  }
  .energy-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 640px) {
  .inverter-detail-b {
    padding: 12px;
  }
  .page-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  .inverter-switcher {
    width: 100%;
    min-width: auto;
  }
  .info-grid {
    grid-template-columns: 1fr;
  }
  .energy-grid {
    grid-template-columns: 1fr 1fr;
  }
  .ops-grid {
    grid-template-columns: 1fr;
  }
  .power-display {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  .power-divider {
    display: none;
  }
  .chart-container {
    height: 240px;
  }
}
</style>