<template>
  <div class="inverter-detail-c">
    <!-- Header -->
    <div class="page-header">
      <h2 class="page-title">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
        逆变器详情
      </h2>
      <div class="inverter-switcher">
        <el-select v-model="currentId" placeholder="选择逆变器" size="default" class="warm-select">
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
        <div class="card glass-card info-card">
          <div class="card-header">
            <div class="header-icon">📋</div>
            <h3>基本信息</h3>
          </div>
          <div class="info-list">
            <div class="info-item" v-for="item in basicInfoItems" :key="item.label">
              <span class="info-label">{{ item.label }}</span>
              <span :class="['info-value', { mono: item.mono }]">{{ item.value }}</span>
            </div>
          </div>
        </div>

        <!-- Status Card -->
        <div class="card glass-card status-card">
          <div class="card-header">
            <div class="header-icon">⚙️</div>
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
        <div class="card glass-card time-card">
          <div class="card-header">
            <div class="header-icon">🕐</div>
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
        <div class="card glass-card energy-card">
          <div class="card-header">
            <div class="header-icon">⚡</div>
            <h3>能量统计</h3>
          </div>
          <div class="energy-grid">
            <div class="energy-item">
              <div class="energy-ring">
                <svg viewBox="0 0 36 36">
                  <path class="ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path class="ring-fill" :stroke-dasharray="`${dailyEnergyPercent}, 100`" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div class="ring-content">
                  <span class="energy-number">{{ inverter.dailyEnergy }}</span>
                  <span class="energy-unit">kWh</span>
                </div>
              </div>
              <div class="energy-desc">当日电量</div>
            </div>
            <div class="energy-item highlight">
              <div class="energy-ring">
                <svg viewBox="0 0 36 36">
                  <path class="ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path class="ring-fill accent" stroke-dasharray="75, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div class="ring-content">
                  <span class="energy-number warm">{{ inverter.totalEnergy }}</span>
                  <span class="energy-unit">MWh</span>
                </div>
              </div>
              <div class="energy-desc">累计电量</div>
            </div>
            <div class="energy-item">
              <div class="energy-number-plain">{{ inverter.dailyHours }}</div>
              <div class="energy-unit-plain">h</div>
              <div class="energy-desc">当日等效小时</div>
            </div>
            <div class="energy-item highlight">
              <div class="energy-number-plain warm">{{ inverter.totalHours }}</div>
              <div class="energy-unit-plain">h</div>
              <div class="energy-desc">累计等效小时</div>
            </div>
          </div>
        </div>

        <!-- History Trend - Collapsible -->
        <el-collapse v-model="activeCollapse" class="card glass-card collapse-card">
          <el-collapse-item name="trend">
            <template #title>
              <div class="collapse-title">
                <div class="header-icon">📈</div>
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
                <div class="header-icon">🔧</div>
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
const dailyEnergyPercent = computed(() => {
  if (!inverter.value) return 0
  return Math.min((inverter.value.dailyEnergy / (inverter.value.ratedPower * 6)) * 100, 100)
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
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(255,255,255,0.95)', borderColor: '#FF8C00', textStyle: { color: '#4a3520' } },
      grid: { left: 50, right: 20, top: 20, bottom: 30 },
      xAxis: { type: 'category', data: getHoursLabels(), axisLine: { lineStyle: { color: 'rgba(255,140,0,0.2)' } }, axisLabel: { color: '#8a6a3a', fontSize: 11 }, axisTick: { show: false } },
      yAxis: { type: 'value', name: 'kW', nameTextStyle: { color: '#8a6a3a', fontSize: 11 }, axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: 'rgba(255,140,0,0.08)' } }, axisLabel: { color: '#8a6a3a', fontSize: 11 } },
      series: [{
        type: 'line',
        data: inv.power24h,
        smooth: true,
        symbol: 'none',
        lineStyle: { color: '#FF8C00', width: 2.5, shadowColor: 'rgba(255,140,0,0.3)', shadowBlur: 8 },
        areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(245,158,11,0.35)' }, { offset: 1, color: 'rgba(245,158,11,0)' }]) }
      }]
    }
  } else {
    return {
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(255,255,255,0.95)', borderColor: '#FF8C00', textStyle: { color: '#4a3520' } },
      grid: { left: 50, right: 20, top: 20, bottom: 30 },
      xAxis: { type: 'category', data: get7dLabels(), axisLine: { lineStyle: { color: 'rgba(255,140,0,0.2)' } }, axisLabel: { color: '#8a6a3a', fontSize: 11 }, axisTick: { show: false } },
      yAxis: { type: 'value', name: 'kWh', nameTextStyle: { color: '#8a6a3a', fontSize: 11 }, axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: 'rgba(255,140,0,0.08)' } }, axisLabel: { color: '#8a6a3a', fontSize: 11 } },
      series: [{
        type: 'bar',
        data: inv.energy7d,
        barWidth: '45%',
        itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#F59E0B' }, { offset: 1, color: '#FF8C00' }]), borderRadius: [6, 6, 0, 0] }
      }]
    }
  }
}

function initChart() {
  if (!chartRef.value) return
  chartInstance = echarts.init(chartRef.value)
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
.inverter-detail-c {
  min-height: 100vh;
  background: linear-gradient(135deg, #FFF8F0 0%, #FFE8CC 30%, #FFF0DB 60%, #FFEDD5 100%);
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #4a3520;
  position: relative;
}
.inverter-detail-c::before {
  content: '';
  position: fixed;
  top: -50%;
  right: -20%;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,140,0,0.12) 0%, transparent 70%);
  pointer-events: none;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto 20px;
  position: relative;
  z-index: 1;
}
.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #92400e;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}
.page-title svg {
  color: #FF8C00;
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
.status-dot.running { background: #00B42A; box-shadow: 0 0 4px rgba(0,180,42,0.4); }
.status-dot.standby { background: #FF7D00; box-shadow: 0 0 4px rgba(255,125,0,0.4); }
.status-dot.fault { background: #F53F3F; box-shadow: 0 0 4px rgba(245,63,63,0.4); }
.status-dot.offline { background: #86909C; }

.content-wrapper {
  display: grid;
  grid-template-columns: 30% 70%;
  gap: 16px;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

/* Glass Card */
.glass-card {
  background: rgba(255,255,255,0.55);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.6);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 8px 32px rgba(255,140,0,0.08), 0 2px 8px rgba(0,0,0,0.04);
  transition: box-shadow 0.3s, transform 0.3s;
}
.glass-card:hover {
  box-shadow: 0 12px 40px rgba(255,140,0,0.12), 0 4px 12px rgba(0,0,0,0.06);
  transform: translateY(-1px);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255,140,0,0.12);
}
.header-icon {
  font-size: 16px;
}
.card-header h3 {
  font-size: 15px;
  font-weight: 600;
  color: #92400e;
  margin: 0;
}

/* Info Card */
.info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.info-item {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
}
.info-label {
  font-size: 12px;
  color: #a0845c;
  white-space: nowrap;
}
.info-value {
  font-size: 13px;
  color: #4a3520;
  text-align: right;
  word-break: break-all;
}
.info-value.mono {
  font-family: 'SF Mono', 'Fira Code', monospace;
  color: #FF8C00;
  font-weight: 500;
}

/* Status Card */
.status-main {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 600;
  width: fit-content;
  backdrop-filter: blur(10px);
}
.status-badge.running { background: rgba(0,180,42,0.1); color: #00B42A; border: 1px solid rgba(0,180,42,0.2); }
.status-badge.standby { background: rgba(255,125,0,0.1); color: #FF7D00; border: 1px solid rgba(255,125,0,0.2); }
.status-badge.fault { background: rgba(245,63,63,0.1); color: #F53F3F; border: 1px solid rgba(245,63,63,0.2); }
.status-badge.offline { background: rgba(134,144,156,0.1); color: #86909C; border: 1px solid rgba(134,144,156,0.2); }
.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}
.status-badge.running .status-indicator {
  animation: warm-pulse-green 2s infinite;
}
@keyframes warm-pulse-green {
  0%, 100% { box-shadow: 0 0 0 0 rgba(0,180,42,0.4); }
  50% { box-shadow: 0 0 0 6px rgba(0,180,42,0); }
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
  font-size: 12px;
  color: #a0845c;
}
.power-value {
  font-size: 28px;
  font-weight: 700;
  color: #6b5a3e;
  line-height: 1;
}
.power-value.accent {
  color: #FF8C00;
  text-shadow: 0 2px 8px rgba(255,140,0,0.2);
}
.power-value small {
  font-size: 14px;
  font-weight: 400;
  margin-left: 2px;
}
.power-divider {
  width: 1px;
  height: 36px;
  background: rgba(255,140,0,0.15);
}
.power-bar-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}
.power-bar-bg {
  flex: 1;
  height: 10px;
  background: rgba(255,140,0,0.1);
  border-radius: 5px;
  overflow: hidden;
}
.power-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #F59E0B, #FF8C00);
  border-radius: 5px;
  transition: width 0.6s ease;
  box-shadow: 0 0 10px rgba(255,140,0,0.3);
}
.power-percent {
  font-size: 13px;
  color: #FF8C00;
  font-weight: 600;
  min-width: 44px;
  text-align: right;
}

/* Time Card */
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
  font-size: 12px;
  color: #a0845c;
}
.time-value {
  font-size: 13px;
  color: #6b5a3e;
}

/* Energy Card */
.energy-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.energy-item {
  text-align: center;
  padding: 16px 8px;
  background: rgba(255,255,255,0.4);
  border-radius: 12px;
  border: 1px solid rgba(255,140,0,0.1);
  transition: border-color 0.3s;
}
.energy-item.highlight {
  border-color: rgba(255,140,0,0.25);
  background: rgba(255,255,255,0.55);
}
.energy-item:hover {
  border-color: rgba(255,140,0,0.35);
}
.energy-ring {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto 8px;
}
.energy-ring svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}
.ring-bg {
  fill: none;
  stroke: rgba(255,140,0,0.1);
  stroke-width: 3;
}
.ring-fill {
  fill: none;
  stroke: #F59E0B;
  stroke-width: 3;
  stroke-linecap: round;
  transition: stroke-dasharray 1s ease;
}
.ring-fill.accent {
  stroke: #FF8C00;
}
.ring-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}
.energy-number {
  font-size: 16px;
  font-weight: 700;
  color: #4a3520;
  display: block;
  line-height: 1.1;
}
.energy-number.warm {
  color: #FF8C00;
}
.energy-unit {
  font-size: 11px;
  color: #a0845c;
}
.energy-number-plain {
  font-size: 28px;
  font-weight: 700;
  color: #4a3520;
  line-height: 1.1;
  margin-top: 8px;
}
.energy-number-plain.warm {
  color: #FF8C00;
}
.energy-unit-plain {
  font-size: 13px;
  color: #a0845c;
  margin-top: 2px;
}
.energy-desc {
  font-size: 12px;
  color: #a0845c;
  margin-top: 4px;
}

/* Collapse Card */
.collapse-card {
  background: rgba(255,255,255,0.55);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.6);
  margin-bottom: 16px;
  padding: 0;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(255,140,0,0.08), 0 2px 8px rgba(0,0,0,0.04);
}
.collapse-card :deep(.el-collapse-item__header) {
  padding: 16px 20px;
  background: transparent;
  border-bottom: 1px solid rgba(255,140,0,0.12);
  color: #92400e;
  font-size: 15px;
  font-weight: 600;
  height: auto;
  line-height: 1.5;
}
.collapse-card :deep(.el-collapse-item__arrow) {
  color: #a0845c;
}
.collapse-card :deep(.el-collapse-item__wrap) {
  background: transparent;
  border-bottom: none;
}
.collapse-card :deep(.el-collapse-item__content) {
  padding: 16px 20px;
  color: #4a3520;
}
.collapse-title {
  display: flex;
  align-items: center;
  gap: 8px;
}
.collapse-title h3 {
  font-size: 15px;
  font-weight: 600;
  color: #92400e;
  margin: 0;
}

.chart-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}
.chart-tab {
  padding: 6px 16px;
  border: 1px solid rgba(255,140,0,0.2);
  border-radius: 20px;
  background: rgba(255,255,255,0.4);
  font-size: 13px;
  color: #a0845c;
  cursor: pointer;
  transition: all 0.2s;
}
.chart-tab.active {
  background: linear-gradient(135deg, #FF8C00, #F59E0B);
  color: #fff;
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(255,140,0,0.3);
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
  font-size: 12px;
  color: #a0845c;
}
.ops-value {
  font-size: 14px;
  color: #4a3520;
}
.ops-value.warning {
  color: #F53F3F;
}

/* Warm select overrides */
.inverter-detail-c :deep(.el-input__wrapper) {
  background: rgba(255,255,255,0.6) !important;
  box-shadow: 0 0 0 1px rgba(255,140,0,0.2) !important;
  border-radius: 12px !important;
}
.inverter-detail-c :deep(.el-input__inner) {
  color: #4a3520 !important;
}

/* Responsive */
@media (max-width: 1024px) {
  .content-wrapper {
    grid-template-columns: 1fr;
  }
  .energy-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 640px) {
  .inverter-detail-c {
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
  .info-list {
    gap: 10px;
  }
  .info-item {
    flex-direction: column;
    gap: 2px;
  }
  .info-value {
    text-align: left;
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
  .glass-card {
    padding: 16px;
    border-radius: 12px;
  }
}
</style>
