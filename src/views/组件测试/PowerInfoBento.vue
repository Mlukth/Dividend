<template>
  <div class="pv-run-data-page">
    <!-- 顶部Header：电站名称/时间/运行状态 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="station-name">光伏电站监控中心</h1>
        <span class="current-time">{{ currentTime }}</span>
      </div>
      <div class="header-right">
        <div class="status-wrapper">
          <div class="status-indicator" :class="statusDotClass"></div>
          <span class="status-text" :class="statusTextClass">{{ statusText }}</span>
        </div>
      </div>
    </div>

    <!-- 左侧核心区 (30%)：仪表盘 + 系统状态 -->
    <div class="left-sidebar">
      <!-- 仪表盘卡片 -->
      <div class="card gauge-card">
        <div class="card-header">
          <span class="card-title">实时发电功率</span>
        </div>
        <div class="gauge-wrapper">
          <div class="gauge-chart" ref="gaugeRef"></div>
          <div class="power-value">
            <div class="power-capacity">组件总容量：{{ totalCapacity }} kWp</div>
          </div>
        </div>
      </div>

      <!-- 系统状态监控卡片 -->
      <div class="card status-card">
        <div class="card-header">
          <span class="card-title">系统运行状态</span>
        </div>
        <div class="status-grid">
          <div class="status-item">
            <div class="item-label">告警数量</div>
            <div class="item-value warning">{{ warningCount }}</div>
          </div>
          <div class="status-item">
            <div class="item-label">逆变器状态</div>
            <div class="item-value">{{ inverterOnline }}/{{ inverterTotal }}</div>
          </div>
          <div class="status-item">
            <div class="item-label">日满发小时</div>
            <div class="item-value">{{ powerMetrics.equivalentHours }} h</div>
          </div>
          <div class="status-item">
            <div class="item-label">实时功率占比</div>
            <div class="item-value">{{ powerMetrics.powerRatio }}%</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧关键指标与趋势区 (70%) -->
    <div class="right-main">
      <!-- 核心KPI卡片（4等分） -->
      <div class="kpi-row">
        <div class="card kpi-card">
          <span class="kpi-label">当日发电量</span>
          <span class="kpi-value">{{ powerMetrics.todayEnergy }}<span class="kpi-unit">kWh</span></span>
        </div>
        <div class="card kpi-card">
          <span class="kpi-label">累计发电量</span>
          <span class="kpi-value">{{ powerMetrics.totalEnergy }}<span class="kpi-unit">kWh</span></span>
        </div>
        <div class="card kpi-card">
          <span class="kpi-label">当日收益</span>
          <span class="kpi-value">¥ {{ powerMetrics.todayProfit }}</span>
        </div>
        <div class="card kpi-card">
          <span class="kpi-label">累计收益</span>
          <span class="kpi-value">¥ {{ powerMetrics.totalProfit }}</span>
        </div>
      </div>

      <!-- 发电功率趋势图 -->
      <div class="card chart-card">
        <div class="card-header space-between">
          <span class="card-title">📈 发电功率趋势</span>
          <div class="chart-tools">
            <el-radio-group v-model="dateType" size="large" @change="handleDateTypeChange">
              <el-radio-button value="day">日</el-radio-button>
              <el-radio-button value="month">月</el-radio-button>
              <el-radio-button value="year">年</el-radio-button>
              <el-radio-button value="total">总</el-radio-button>
            </el-radio-group>
            <el-date-picker 
              v-model="selectDate" 
              :type="dateType === 'month' ? 'month' : 'date'" 
              placeholder="选择日期" 
              size="large" 
            />
          </div>
        </div>
        <div class="chart-container">
          <div ref="powerChartRef" class="chart-box"></div>
        </div>
      </div>
    </div>

    <!-- 底部辅助数据区（3等分） -->
    <div class="bottom-row">
      <!-- 电站评估 -->
      <div class="card eval-card">
        <div class="card-header">
          <span class="card-title">🎯 电站评估</span>
        </div>
        <div class="eval-list">
          <div class="eval-row">
            <span class="eval-label">综合效率</span>
            <span class="eval-value highlight">{{ evalData.systemEfficiency }}%</span>
          </div>
          <div class="eval-row">
            <span class="eval-label">等效利用小时</span>
            <span class="eval-value">{{ evalData.equivalentHours }} h</span>
          </div>
          <div class="eval-row">
            <span class="eval-label">性能比 PR</span>
            <span class="eval-value">{{ evalData.pr }}%</span>
          </div>
          <div class="eval-row">
            <span class="eval-label">故障损失</span>
            <span class="eval-value warning">{{ evalData.faultLoss }} kWh</span>
          </div>
          <div class="eval-row">
            <span class="eval-label">可用率</span>
            <span class="eval-value success">{{ evalData.availability }}%</span>
          </div>
        </div>
      </div>

      <!-- 环境与温度监控 -->
      <div class="card env-card">
        <div class="card-header">
          <span class="card-title">🌡️ 环境与温度监控</span>
        </div>
        <div class="env-grid">
          <div class="temp-chart-container">
            <div ref="tempChartRef" class="temp-chart"></div>
          </div>
          <div class="temp-legend">
            <div class="legend-item">
              <span class="legend-dot orange"></span>
              <span>组件温度</span>
              <span class="legend-value">{{ tempDisplay.moduleTemp }}°C</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot blue"></span>
              <span>环境温度</span>
              <span class="legend-value">{{ tempDisplay.envTemp }}°C</span>
            </div>
          </div>
          <div class="weather-container">
            <div class="weather-grid">
              <div class="weather-day" v-for="day in weatherData" :key="day.label">
                <div class="day-label">{{ day.label }}</div>
                <div class="day-icon">{{ day.icon }}</div>
                <div class="day-temp">{{ day.temp }}°C</div>
                <div class="day-desc">{{ day.desc }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 社会贡献 -->
      <div class="card social-card">
        <div class="card-header">
          <span class="card-title">🌱 社会贡献</span>
        </div>
        <div class="social-grid">
          <div class="social-item">
            <div class="item-icon">♻️</div>
            <div class="item-value">{{ socialData.co2Reduction }}<span>吨</span></div>
            <div class="item-label">CO₂减排</div>
          </div>
          <div class="social-item">
            <div class="item-icon">🪨</div>
            <div class="item-value">{{ socialData.coalSaving }}<span>吨</span></div>
            <div class="item-label">标煤节约</div>
          </div>
          <div class="social-item">
            <div class="item-icon">🌳</div>
            <div class="item-value">{{ socialData.treeEquivalent }}<span>棵</span></div>
            <div class="item-label">等效植树</div>
          </div>
          <div class="social-item">
            <div class="item-icon">⚡</div>
            <div class="item-value">{{ socialData.greenPower }}<span>kWh</span></div>
            <div class="item-label">绿色发电</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'

// 当前时间格式化
const currentTime = ref('')
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', { 
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  })
}
setInterval(updateTime, 1000)
updateTime()

// 模拟数据
const realData = ref({
  powerInfo: {
    systemConstruct: {
      capacity: 500,
      stationAddress: '江西省赣州市'
    },
    systemMonitor: {
      runStatus: '运行中',
      warningCount: 0
    },
    powerData: {
      todayPower: 2450,
      totalPower: '1.2GWh',
      realTimePower: 320,
      equivalentHours: 4.9
    },
    profitCalc: {
      todayProfit: 980,
      totalProfit: 480000,
      yearProfit: 120000
    }
  },
  archiveInfo: {
    devices: new Array(10).fill({})
  }
})

const gaugeRef = ref(null)
const powerChartRef = ref(null)
const tempChartRef = ref(null)
let gaugeChart = null
let powerChart = null
let tempChart = null
const timeouts = []

const selectDate = ref(new Date())
const dateType = ref('day')

const weatherData = ref([
  { label: '今天', icon: '☀️', temp: '32', desc: '晴' },
  { label: '明天', icon: '⛅', temp: '28', desc: '多云' },
  { label: '后天', icon: '🌧️', temp: '24', desc: '小雨' }
])

const powerDataByType = {
  day: {
    xAxis: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
    data: [0, 0, 0, 0, 220, 780, 1200, 980, 650, 320, 0, 0]
  },
  month: {
    xAxis: ['1日', '5日', '10日', '15日', '20日', '25日', '30日'],
    data: [4200, 4800, 5100, 3900, 4600, 5200, 4500]
  },
  year: {
    xAxis: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    data: [120, 135, 158, 175, 198, 220, 245, 238, 195, 165, 140, 118]
  },
  total: {
    xAxis: ['2022', '2023', '2024', '2025', '2026'],
    data: [850, 920, 980, 1050, 972]
  }
}

const parseEnergyToKWh = (energyStr) => {
  if (energyStr === undefined || energyStr === null) return 0
  if (typeof energyStr === 'number') return energyStr
  const str = String(energyStr).trim()
  const match = str.match(/^([\d.]+)\s*([GMk]?)Wh?$/i)
  if (!match) return parseFloat(str) || 0
  const val = parseFloat(match[1])
  const unit = match[2].toLowerCase()
  if (unit === 'g') return val * 1000000
  if (unit === 'm') return val * 1000
  return val
}

const getProvinceFromAddr = (addr) => {
  if (!addr) return ''
  const provinces = ['北京', '天津', '上海', '重庆', '河北', '山西', '辽宁', '吉林', '黑龙江',
    '江苏', '浙江', '安徽', '福建', '江西', '山东', '河南', '湖北', '湖南', '广东', '海南',
    '四川', '贵州', '云南', '陕西', '甘肃', '青海', '台湾', '内蒙古', '广西', '宁夏', '新疆', '西藏']
  for (const p of provinces) if (addr.includes(p)) return p
  return ''
}
const getEmissionFactor = (addr) => {
  const province = getProvinceFromAddr(addr)
  const factorMap = {
    '北京': 0.6101, '天津': 0.6101, '河北': 0.6101, '山西': 0.6101, '山东': 0.6101,
    '辽宁': 0.6101, '吉林': 0.6101, '黑龙江': 0.6101,
    '上海': 0.7035, '江苏': 0.7035, '浙江': 0.7035, '安徽': 0.7035, '福建': 0.7035,
    '河南': 0.7035, '湖北': 0.7035, '湖南': 0.7035, '江西': 0.7035, '四川': 0.7035, '重庆': 0.7035,
    '广东': 0.5242, '广西': 0.5242, '海南': 0.5242,
    '陕西': 0.5865, '甘肃': 0.5865, '青海': 0.5865, '宁夏': 0.5865, '新疆': 0.5865,
    '内蒙古': 0.5865, '云南': 0.5865, '贵州': 0.5865
  }
  return factorMap[province] || 0.6
}

const totalCapacity = computed(() => {
  return realData.value?.powerInfo?.systemConstruct?.capacity || 0
})

const systemMonitor = computed(() => {
  return realData.value?.powerInfo?.systemMonitor || {}
})
const statusText = computed(() => systemMonitor.value.runStatus || '运行中')
const statusDotClass = computed(() => {
  return systemMonitor.value.runStatus === '停机' ? 'dot-stopped' : 'dot-running'
})
const statusTextClass = computed(() => {
  return systemMonitor.value.runStatus === '停机' ? 'text-stopped' : 'text-running'
})
const warningCount = computed(() => systemMonitor.value.warningCount ?? 0)
const inverterTotal = computed(() => {
  return realData.value?.archiveInfo?.devices?.length || 0
})
const inverterOnline = computed(() => {
  return inverterTotal.value - warningCount.value
})

const powerMetrics = computed(() => {
  if (!realData.value) return {
    todayEnergy: '--', todayProfit: '--',
    totalEnergy: '--', totalProfit: '--',
    equivalentHours: '--', powerRatio: '--',
    yearProfit: '--'
  }
  const pi = realData.value.powerInfo || {}
  const todayEnergy = pi.powerData?.todayPower ?? '--'
  const todayProfit = pi.profitCalc?.todayProfit ?? '--'
  const totalEnergy = pi.powerData?.totalPower ?? '--'
  const totalProfit = pi.profitCalc?.totalProfit ?? '--'
  const yearProfit = pi.profitCalc?.yearProfit ?? '--'
  const equivalentHours = pi.powerData?.equivalentHours ?? '--'
  const realPower = pi.powerData?.realTimePower ?? 0
  const capacity = pi.systemConstruct?.capacity ?? 1
  const powerRatio = capacity > 0 ? ((realPower / capacity) * 100).toFixed(1) : '--'
  return {
    todayEnergy, todayProfit,
    totalEnergy, totalProfit,
    yearProfit,
    equivalentHours, powerRatio
  }
})

const tempDisplay = ref({ moduleTemp: '45.2', envTemp: '24.5' })

const evalData = computed(() => {
  const pi = realData.value?.powerInfo || {}
  const equivalentHours = pi.powerData?.equivalentHours ?? 3.2
  return {
    systemEfficiency: (Math.random() * 15 + 80).toFixed(1),
    equivalentHours: equivalentHours !== '--' ? equivalentHours : 3.2,
    pr: (Math.random() * 10 + 80).toFixed(1),
    faultLoss: (Math.random() * 0.3).toFixed(2),
    availability: (Math.random() * 1 + 98.5).toFixed(1)
  }
})

const socialData = computed(() => {
  if (!realData.value) return { co2Reduction: '--', coalSaving: '--', treeEquivalent: '--', greenPower: '--' }
  const totalEnergyKWh = parseEnergyToKWh(realData.value.powerInfo?.powerData?.totalPower)
  const addr = realData.value.powerInfo?.systemConstruct?.stationAddress || ''
  const factor = getEmissionFactor(addr)
  const co2 = (totalEnergyKWh * factor / 1000).toFixed(1)
  const coal = (totalEnergyKWh * 0.1229 / 1000).toFixed(1)
  const trees = Math.round(co2 * 16.5)
  return {
    co2Reduction: co2,
    coalSaving: coal,
    treeEquivalent: trees,
    greenPower: totalEnergyKWh.toFixed(0)
  }
})

const initGauge = () => {
  if (!gaugeRef.value) return
  if (gaugeChart) gaugeChart.dispose()
  gaugeChart = echarts.init(gaugeRef.value)
  const capacity = totalCapacity.value || 500
  const realPower = realData.value?.powerInfo?.powerData?.realTimePower ?? 0
  gaugeChart.setOption({
    animation: false,
    backgroundColor: 'transparent',
    series: [{
      type: 'gauge',
      animation: false,
      center: ['50%', '55%'],
      radius: '78%',
      startAngle: 200,
      endAngle: -20,
      min: 0,
      max: capacity,
      splitNumber: 5,
      axisLabel: { distance: -20, fontSize: 9, color: '#aaa', formatter: (val) => Math.round((val / capacity) * 100) + '%' },
      axisTick: { distance: -15, length: 6, lineStyle: { color: '#ccc' } },
      splitLine: { distance: -15, length: 10, lineStyle: { color: '#ccc' } },
      axisLine: { lineStyle: { width: 12, color: [[1, '#e9eef4']] } },
      progress: { show: true, width: 12, itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: '#1890ff' }, { offset: 1, color: '#40a9ff' }]) } },
      pointer: { length: '55%', width: 5, itemStyle: { color: '#1890ff' } },
      anchor: { size: 12, itemStyle: { color: '#1890ff' } },
      title: { show: false },
      detail: { fontSize: 22, fontWeight: 700, color: '#1890ff', offsetCenter: [0, '35%'], formatter: '{value} kW' },
      data: [{ value: realPower }]
    }]
  })
}

const initPowerChart = () => {
  if (!powerChartRef.value) return
  if (powerChart) powerChart.dispose()
  powerChart = echarts.init(powerChartRef.value)
  updatePowerChart()
}
const updatePowerChart = () => {
  if (!powerChart) return
  const config = powerDataByType[dateType.value]
  powerChart.setOption({
    animation: false,
    backgroundColor: 'transparent',
    title: { 
      text: dateType.value === 'day' ? '日功率曲线' : 
            dateType.value === 'month' ? '月发电量趋势' : 
            dateType.value === 'year' ? '年月发电量' : '年累计发电量', 
      left: 'center', 
      textStyle: { fontSize: 14, color: '#666', fontWeight: 500 } 
    },
    tooltip: { 
      trigger: 'axis', 
      backgroundColor: 'rgba(50, 50, 50, 0.9)', 
      textStyle: { color: '#fff', fontSize: 13 }, 
      padding: [10, 14], 
      axisPointer: { type: 'cross', lineStyle: { color: '#1890ff', type: 'dashed' } } 
    },
    legend: { bottom: 10, left: 'center', itemIcon: 'diamond', textStyle: { color: '#1890ff' }, data: ['功率'] },
    grid: { left: '3%', right: '3%', top: '18%', bottom: '15%', containLabel: true },
    xAxis: { 
      type: 'category', 
      boundaryGap: false, 
      axisLine: { show: false }, 
      axisTick: { show: false }, 
      axisLabel: { color: '#666', fontSize: 12 }, 
      data: config.xAxis 
    },
    yAxis: { 
      type: 'value', 
      axisLine: { show: false }, 
      axisTick: { show: false }, 
      splitLine: { lineStyle: { color: '#f0f0f0' } }, 
      axisLabel: { color: '#666', fontSize: 12 } 
    },
    series: [{ 
      name: '功率', 
      type: 'line', 
      smooth: true, 
      symbol: 'circle', 
      symbolSize: 8, 
      animation: false, 
      itemStyle: { color: '#1890ff' }, 
      lineStyle: { color: '#1890ff', width: 3 }, 
      areaStyle: { 
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(24, 144, 255, 0.4)' }, 
          { offset: 1, color: 'rgba(24, 144, 255, 0.05)' }
        ]) 
      }, 
      data: config.data 
    }]
  })
}

const initTempChart = () => {
  if (!tempChartRef.value) return
  if (tempChart) tempChart.dispose()
  tempChart = echarts.init(tempChartRef.value)
  tempChart.setOption({
    animation: false,
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(50, 50, 50, 0.9)', textStyle: { color: '#fff', fontSize: 13 }, padding: [10, 14] },
    legend: { show: false },
    grid: { left: '3%', right: '3%', top: '10%', bottom: '5%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#666', fontSize: 11 }, data: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'] },
    yAxis: { type: 'value', min: 0, max: 60, axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } }, axisLabel: { color: '#666', fontSize: 11, formatter: '{value}°C' } },
    series: [
      { 
        name: '组件温度', 
        type: 'line', 
        smooth: true, 
        symbol: 'none', 
        animation: false, 
        lineStyle: { color: '#ff6b00', width: 2 }, 
        areaStyle: { 
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(255,107,0,0.3)' }, 
            { offset: 1, color: 'rgba(255,107,0,0)' }
          ]) 
        }, 
        data: [18, 17, 16, 17, 25, 35, 45, 48, 42, 35, 26, 20] 
      },
      { 
        name: '环境温度', 
        type: 'line', 
        smooth: true, 
        symbol: 'none', 
        animation: false, 
        lineStyle: { color: '#409EFF', width: 2 }, 
        areaStyle: { 
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64,158,255,0.3)' }, 
            { offset: 1, color: 'rgba(64,158,255,0)' }
          ]) 
        }, 
        data: [15, 14, 13, 14, 20, 25, 28, 30, 27, 23, 18, 16] 
      }
    ]
  })
}

const initAllCharts = () => { initGauge(); initPowerChart(); initTempChart() }
const handleDateTypeChange = () => { updatePowerChart() }

const handleResize = () => {
  requestAnimationFrame(() => {
    if (gaugeChart) gaugeChart.resize()
    if (powerChart) powerChart.resize()
    if (tempChart) tempChart.resize()
  })
}

onMounted(() => { 
  window.addEventListener('resize', handleResize)
  updateTime()
  nextTick(() => { initAllCharts() })
})
onUnmounted(() => {
  timeouts.forEach(clearTimeout)
  window.removeEventListener('resize', handleResize)
  clearInterval(updateTime)
  gaugeChart?.dispose()
  powerChart?.dispose()
  tempChart?.dispose()
})
</script>

<style scoped>
/* 核心Grid布局 */
.pv-run-data-page {
  width: 100%;
  min-height: calc(100vh - 60px);
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf0 100%);
  padding: 20px;
  box-sizing: border-box;
  font-family: "Microsoft YaHei", "DIN", sans-serif;
  /* 网格布局核心 */
  display: grid;
  grid-template-columns: 3fr 7fr; /* 左3右7 */
  grid-template-rows: auto auto 1fr;
  gap: 20px;
}

/* 顶部Header - 跨整行 */
.page-header {
  grid-column: 1 / -1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border-radius: 12px;
  padding: 16px 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.header-left .station-name {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 8px 0;
}

.header-left .current-time {
  font-size: 14px;
  color: #8c8c8c;
}

/* 左侧边栏 */
.left-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 右侧主区域 */
.right-main {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* KPI卡片行 - 4等分 */
.kpi-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

/* 底部行 - 跨整行 + 3等分 */
.bottom-row {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

/* 通用卡片样式 */
.card {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  height: 100%;
  box-sizing: border-box;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.space-between {
  justify-content: space-between;
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a2e;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 仪表盘卡片 */
.gauge-card {
  display: flex;
  flex-direction: column;
}

.gauge-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 16px;
}

.gauge-chart {
  width: 100%;
  height: 200px;
  max-height: 250px;
}

.power-value {
  text-align: center;
}

.power-capacity {
  font-size: 14px;
  color: #666;
  margin-top: 8px;
}

/* 系统状态卡片 */
.status-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.status-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-label {
  font-size: 13px;
  color: #8c8c8c;
}

.item-value {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a2e;
}

/* KPI卡片样式 */
.kpi-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.kpi-label {
  font-size: 13px;
  color: #8c8c8c;
  margin-bottom: 8px;
}

.kpi-value {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a2e;
  line-height: 1;
}

.kpi-unit {
  font-size: 14px;
  font-weight: 400;
  color: #999;
  margin-left: 4px;
}

/* 图表容器 */
.chart-container {
  width: 100%;
  height: 300px;
  min-height: 250px;
}

.chart-box {
  width: 100%;
  height: 100%;
}

/* 电站评估卡片 */
.eval-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.eval-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.eval-row:last-child {
  border-bottom: none;
}

.eval-label {
  font-size: 14px;
  color: #666;
}

.eval-value {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a2e;
}

.highlight {
  color: '#1890ff';
}

.success {
  color: #52c41a;
}

.warning {
  color: #fa8c16;
}

/* 环境温度卡片 */
.env-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}

.temp-chart-container {
  height: 160px;
  width: 100%;
}

.temp-chart {
  width: 100%;
  height: 100%;
}

.temp-legend {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.legend-dot.orange {
  background: #ff6b00;
}

.legend-dot.blue {
  background: #409EFF;
}

.legend-value {
  font-weight: 600;
  color: #1a1a2e;
  margin-left: 8px;
}

.weather-container {
  margin-top: 16px;
}

.weather-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.weather-day {
  text-align: center;
  padding: 12px 8px;
  background: #f8f9fb;
  border-radius: 8px;
}

.day-label {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
}

.day-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.day-temp {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 4px;
}

.day-desc {
  font-size: 12px;
  color: #888;
}

/* 社会贡献卡片 */
.social-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  height: 100%;
}

.social-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 8px;
  background: #f8f9fb;
  border-radius: 8px;
}

.item-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.item-value {
  font-size: 20px;
  font-weight: 700;
  color: #52c41a;
  line-height: 1;
}

.item-value span {
  font-size: 12px;
  font-weight: 400;
  color: #999;
  margin-left: 4px;
}

/* 运行状态呼吸灯 */
.status-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot-running {
  background-color: #52c41a;
  animation: breathing 2s infinite;
}

.dot-stopped {
  background-color: #f5222d;
  box-shadow: 0 0 0 4px rgba(245, 34, 45, 0.2);
}

.status-text {
  font-size: 16px;
  font-weight: bold;
}

.text-running {
  color: #52c41a;
}

.text-stopped {
  color: #f5222d;
}

/* 呼吸灯动画优化 */
@keyframes breathing {
  0% { box-shadow: 0 0 0 0 rgba(82, 196, 26, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(82, 196, 26, 0); }
  100% { box-shadow: 0 0 0 0 rgba(82, 196, 26, 0); }
}

/* ElementUI样式覆盖 */
:deep(.el-radio-button__inner) {
  border-radius: 8px !important;
}

:deep(.el-radio-button--large .el-radio-button__inner) {
  padding: 10px 18px;
  font-size: 14px;
}

:deep(.el-radio-button__orig-radio:checked + .el-radio-button__inner) {
  background-color: #1890ff !important;
  border-color: #1890ff !important;
  box-shadow: none;
}

/* 响应式适配 */
@media (max-width: 1440px) {
  .kpi-value {
    font-size: 20px;
  }
  
  .chart-container {
    height: 250px;
  }
}

@media (max-width: 1200px) {
  .pv-run-data-page {
    grid-template-columns: 4fr 6fr;
  }
  
  .kpi-row {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .bottom-row {
    grid-template-columns: 1fr;
  }
}
</style>