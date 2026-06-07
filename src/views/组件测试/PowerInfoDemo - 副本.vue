<template>
  <div class="pv-run-data-page" v-loading="loading" element-loading-text="加载中...">
    <!-- 空状态 -->
    <el-empty description="暂无电站数据" v-if="!realData && !loading" class="empty-wrapper" />
    
    <template v-else>
      <!-- 第一行：实时功率+发电指标 -->
      <div class="row-top merged-card-box">
        <div class="gauge-card-small">
          <div class="gauge-wrapper">
            <div class="gauge-chart" ref="gaugeRef"></div>
            <div class="power-value">
              <div class="power-capacity">组件总容量：{{ totalCapacity }} kWp</div>
            </div>
          </div>
        </div>
        <div class="kpi-card-wide">
          <div class="kpi-grid-3col-wide">
            <!-- 当日发电量 -->
            <div class="data-card" @click="handleCardClick('energy')">
              <span class="card-label">当日发电量</span>
              <span class="card-value">{{ powerMetrics.todayEnergy }}<span class="card-unit">kWh</span></span>
              <div class="card-grid-2x2">
                <div class="grid-cell">
                  <div class="cell-label">较昨日同期</div>
                  <div class="cell-value">{{ EMPTY_PLACEHOLDER }}</div>
                </div>
                <div class="grid-cell">
                  <div class="cell-label">累计发电量</div>
                  <div class="cell-value">{{ powerMetrics.totalEnergy }} kWh</div>
                </div>
              </div>
            </div>

            <!-- 当日收益 -->
            <div class="data-card" @click="handleCardClick('profit')">
              <span class="card-label">当日收益</span>
              <span class="card-value">¥ {{ powerMetrics.todayProfit }}</span>
              <div class="card-grid-2x2">
                <div class="grid-cell">
                  <div class="cell-label">当年收益</div>
                  <div class="cell-value">{{ powerMetrics.yearProfit }} 元</div>
                </div>
                <div class="grid-cell">
                  <div class="cell-label">累计收益</div>
                  <div class="cell-value">{{ powerMetrics.totalProfit }} 元</div>
                </div>
                <div class="grid-cell">
                  <div class="cell-label">上网电价</div>
                  <div class="cell-value">{{ ELECTRICITY_PRICE.grid }} 元/kWh</div>
                </div>
                <div class="grid-cell">
                  <div class="cell-label">自用电价</div>
                  <div class="cell-value">{{ ELECTRICITY_PRICE.self }} 元/kWh</div>
                </div>
              </div>
            </div>

            <!-- 系统运行状态（呼吸灯） -->
            <div class="data-card" @click="handleCardClick('status')">
              <span class="card-label">系统运行状态</span>
              <div class="status-wrapper">
                <div class="status-indicator" :class="statusDotClass"></div>
                <span class="status-text" :class="statusTextClass">{{ statusText }}</span>
              </div>
              <div class="card-grid-2x2">
                <div class="grid-cell">
                  <div class="cell-label">告警数量</div>
                  <div class="cell-value" :class="warningCount > 0 ? 'text-danger' : ''">{{ warningCount }}</div>
                </div>
                <div class="grid-cell">
                  <div class="cell-label">逆变器</div>
                  <div class="cell-value">{{ inverterOnline }}/{{ inverterTotal }}</div>
                </div>
                <div class="grid-cell">
                  <div class="cell-label">日满发小时</div>
                  <div class="cell-value">{{ powerMetrics.equivalentHours }} h</div>
                </div>
                <div class="grid-cell">
                  <div class="cell-label">实时功率占比</div>
                  <div class="cell-value">{{ powerMetrics.powerRatio }}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 第二行：发电功率趋势 + 电站评估 -->
      <div class="row-top row-gap-wide">
        <div class="chart-card">
          <div class="card-header space-between">
            <span class="card-title"><el-icon><TrendCharts /></el-icon> 发电功率趋势</span>
            <div class="chart-tools">
              <el-radio-group v-model="dateType" size="large" @change="handleDateTypeChange">
                <el-radio-button value="day">日</el-radio-button>
                <el-radio-button value="month">月</el-radio-button>
                <el-radio-button value="year">年</el-radio-button>
                <el-radio-button value="total">总</el-radio-button>
              </el-radio-group>
              <el-date-picker 
                v-model="selectDate" 
                :type="datePickerType" 
                :placeholder="datePickerPlaceholder"
                size="large" 
                v-if="dateType !== 'total'"
              />
            </div>
          </div>
          <div class="chart-container">
            <div ref="powerChartRef" class="chart-box"></div>
          </div>
        </div>

        <div class="eval-card">
          <div class="card-header">
            <span class="card-title"><el-icon><Target /></el-icon> 电站评估</span>
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
      </div>

      <!-- 第三行：温度监测 + 天气预报 -->
      <div class="row-middle">
        <div class="temp-card">
          <div class="card-header space-between">
            <span class="card-title"><el-icon><Sunny /></el-icon> 温度监测</span>
            <el-radio-group v-model="tempDateType" size="small" @change="handleTempDateTypeChange">
              <el-radio-button value="day">日</el-radio-button>
              <el-radio-button value="week">周</el-radio-button>
            </el-radio-group>
          </div>
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
        </div>

        <div class="weather-card">
          <div class="card-header">
            <span class="card-title"><el-icon><Cloud /></el-icon> 天气预报</span>
          </div>
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

      <!-- 第四行：社会贡献 -->
      <div class="row-bottom">
        <div class="social-card full-width">
          <div class="card-header">
            <span class="card-title"><el-icon><Plant /></el-icon> 社会贡献</span>
          </div>
          <div class="social-stats">
            <div class="social-stat">
              <div class="stat-number">{{ socialData.co2Reduction }} <span>吨</span></div>
              <div class="stat-label">CO₂减排</div>
            </div>
            <div class="social-stat">
              <div class="stat-number">{{ socialData.coalSaving }} <span>吨</span></div>
              <div class="stat-label">标煤节约</div>
            </div>
            <div class="social-stat">
              <div class="stat-number">{{ socialData.treeEquivalent }} <span>棵</span></div>
              <div class="stat-label">等效植树</div>
            </div>
            <div class="social-stat">
              <div class="stat-number">{{ socialData.greenPower }} <span>kWh</span></div>
              <div class="stat-label">绿色发电</div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useDebounceFn } from '@vueuse/core' // 可替换为自定义防抖函数
import { ElMessage } from 'element-plus'
// ECharts 按需引入（大幅减少打包体积）
import * as echarts from 'echarts/core'
import { GaugeChart, LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent
} from 'echarts/components'
import { LabelLayout, UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'
// ElementPlus 图标（可替换为自定义图标）
import { TrendCharts, Target, Sunny, Cloud, Plant } from '@element-plus/icons-vue'
import { getStationDetail } from '@/api/station'
// 公共工具函数（建议抽离到@/utils/common）
import { parseEnergyToKWh, getProvinceFromAddr, getEmissionFactor } from '@/utils/common'

// 注册ECharts组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  GaugeChart,
  LineChart,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer
])

// ==================== 全局常量（建议抽离到@/constants/station）====================
const EMPTY_PLACEHOLDER = '--'
const ELECTRICITY_PRICE = { grid: 0.4, self: 0.6 } // 电价配置
const CHART_COLORS = {
  primary: '#ff9a42',
  secondary: '#ff6b00',
  blue: '#409EFF',
  success: '#52c41a',
  warning: '#faad14',
  danger: '#f5222d'
}
const DATE_TYPE_MAP = {
  day: { label: '日', pickerType: 'date', placeholder: '选择日期' },
  month: { label: '月', pickerType: 'month', placeholder: '选择月份' },
  year: { label: '年', pickerType: 'year', placeholder: '选择年份' },
  total: { label: '总', pickerType: null, placeholder: '' }
}
// 模拟数据（TODO 对接接口后删除）
const MOCK_POWER_DATA = {
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
const MOCK_TEMP_DATA = {
  day: {
    xAxis: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
    module: [18, 17, 16, 17, 25, 35, 45, 48, 42, 35, 26, 20],
    env: [15, 14, 13, 14, 20, 25, 28, 30, 27, 23, 18, 16]
  },
  week: {
    xAxis: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    module: [32, 35, 42, 38, 40, 45, 36],
    env: [22, 24, 28, 25, 26, 30, 23]
  }
}

// ==================== Props 定义 ====================
const props = defineProps({
  stationId: { type: String, default: '', required: true }, // 建议设为必传
  fullScreen: { type: Boolean, default: false },
  resizeTrigger: { type: Number, default: 0 }
})

// ==================== 状态定义 ====================
const loading = ref(true)
const realData = ref(null)
// 图表实例引用
const gaugeRef = ref(null)
const powerChartRef = ref(null)
const tempChartRef = ref(null)
const gaugeChart = ref(null)
const powerChart = ref(null)
const tempChart = ref(null)
// 定时器引用
const resizeTimer = ref(null)
// 筛选条件
const selectDate = ref(new Date())
const dateType = ref('day')
const tempDateType = ref('day')
// 天气数据（TODO 对接天气接口）
const weatherData = ref([
  { label: '今天', icon: '☀️', temp: '32', desc: '晴' },
  { label: '明天', icon: '⛅', temp: '28', desc: '多云' },
  { label: '后天', icon: '🌧️', temp: '24', desc: '小雨' }
])
// 温度显示数据（TODO 对接接口）
const tempDisplay = ref({ moduleTemp: '45.2', envTemp: '24.5' })

// ==================== 计算属性 ====================
// 日期选择器配置
const datePickerType = computed(() => DATE_TYPE_MAP[dateType.value]?.pickerType || 'date')
const datePickerPlaceholder = computed(() => DATE_TYPE_MAP[dateType.value]?.placeholder || '选择日期')

// 电站基础信息
const totalCapacity = computed(() => realData.value?.powerInfo?.systemConstruct?.capacity || 0)
const systemMonitor = computed(() => realData.value?.powerInfo?.systemMonitor || {})
const statusText = computed(() => systemMonitor.value.runStatus || '运行中')
const statusDotClass = computed(() => systemMonitor.value.runStatus === '停机' ? 'dot-stopped' : 'dot-running')
const statusTextClass = computed(() => systemMonitor.value.runStatus === '停机' ? 'text-stopped' : 'text-running')
const warningCount = computed(() => systemMonitor.value.warningCount ?? 0)
const inverterTotal = computed(() => realData.value?.archiveInfo?.devices?.length || 0)
const inverterOnline = computed(() => Math.max(0, inverterTotal.value - warningCount.value))

// 发电指标
const powerMetrics = computed(() => {
  if (!realData.value) return {
    todayEnergy: EMPTY_PLACEHOLDER,
    todayProfit: EMPTY_PLACEHOLDER,
    totalEnergy: EMPTY_PLACEHOLDER,
    totalProfit: EMPTY_PLACEHOLDER,
    yearProfit: EMPTY_PLACEHOLDER,
    equivalentHours: EMPTY_PLACEHOLDER,
    powerRatio: EMPTY_PLACEHOLDER
  }
  const pi = realData.value.powerInfo || {}
  const todayEnergy = pi.powerData?.todayPower ?? EMPTY_PLACEHOLDER
  const todayProfit = pi.profitCalc?.todayProfit ?? EMPTY_PLACEHOLDER
  const totalEnergy = pi.powerData?.totalPower ?? EMPTY_PLACEHOLDER
  const totalProfit = pi.profitCalc?.totalProfit ?? EMPTY_PLACEHOLDER
  const yearProfit = pi.profitCalc?.yearProfit ?? EMPTY_PLACEHOLDER
  const equivalentHours = pi.powerData?.equivalentHours ?? EMPTY_PLACEHOLDER
  const realPower = pi.powerData?.realTimePower ?? 0
  const capacity = totalCapacity.value || 1
  const powerRatio = capacity > 0 ? ((realPower / capacity) * 100).toFixed(1) : EMPTY_PLACEHOLDER
  
  return { todayEnergy, todayProfit, totalEnergy, totalProfit, yearProfit, equivalentHours, powerRatio }
})

// 电站评估数据（TODO 对接接口删除随机数）
const evalData = computed(() => {
  const pi = realData.value?.powerInfo || {}
  const equivalentHours = pi.powerData?.equivalentHours ?? 3.2
  return {
    systemEfficiency: (Math.random() * 15 + 80).toFixed(1),
    equivalentHours: equivalentHours !== EMPTY_PLACEHOLDER ? equivalentHours : 3.2,
    pr: (Math.random() * 10 + 80).toFixed(1),
    faultLoss: (Math.random() * 0.3).toFixed(2),
    availability: (Math.random() * 1 + 98.5).toFixed(1)
  }
})

// 社会贡献数据
const socialData = computed(() => {
  if (!realData.value) return { 
    co2Reduction: EMPTY_PLACEHOLDER, 
    coalSaving: EMPTY_PLACEHOLDER, 
    treeEquivalent: EMPTY_PLACEHOLDER, 
    greenPower: EMPTY_PLACEHOLDER 
  }
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

// ==================== 业务逻辑 ====================
// 获取电站数据
const fetchData = async () => {
  if (!props.stationId) {
    loading.value = false
    ElMessage.warning('请选择电站')
    return
  }
  loading.value = true
  try {
    const data = await getStationDetail(props.stationId)
    realData.value = data
    // TODO 对接温度接口后删除
    tempDisplay.value = {
      moduleTemp: (Math.random() * 20 + 35).toFixed(1),
      envTemp: (Math.random() * 15 + 18).toFixed(1)
    }
    // 首次初始化图表，后续仅更新数据
    await nextTick()
    if (!gaugeChart.value) initAllCharts()
    else updateAllCharts()
  } catch (error) {
    console.error('获取电站发电信息失败', error)
    ElMessage.error('获取电站数据失败，请稍后重试')
    realData.value = null
  } finally {
    loading.value = false
  }
}

// 卡片点击事件（可扩展跳转到对应明细页）
const handleCardClick = (type) => {
  console.log('点击卡片:', type)
  // 示例：跳转告警页 if(type === 'status') router.push(`/alarm?stationId=${props.stationId}`)
}

// ==================== 图表逻辑 ====================
// 初始化仪表盘
const initGauge = () => {
  if (!gaugeRef.value) return
  gaugeChart.value = echarts.init(gaugeRef.value)
  updateGauge()
}
// 更新仪表盘
const updateGauge = () => {
  if (!gaugeChart.value) return
  const capacity = totalCapacity.value || 1 // 避免0值报错
  const realPower = realData.value?.powerInfo?.powerData?.realTimePower ?? 0
  gaugeChart.value.setOption({
    animation: false,
    backgroundColor: 'transparent',
    series: [{
      type: 'gauge',
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
      progress: { show: true, width: 12, itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: CHART_COLORS.primary }, { offset: 1, color: CHART_COLORS.secondary }]) } },
      pointer: { length: '55%', width: 5, itemStyle: { color: CHART_COLORS.secondary } },
      anchor: { size: 12, itemStyle: { color: CHART_COLORS.secondary } },
      title: { show: false },
      detail: { fontSize: 22, fontWeight: 700, color: CHART_COLORS.secondary, offsetCenter: [0, '35%'], formatter: '{value} kW' },
      data: [{ value: realPower }]
    }]
  }, false) // false表示不合并配置，提升性能
}

// 初始化功率趋势图
const initPowerChart = () => {
  if (!powerChartRef.value) return
  powerChart.value = echarts.init(powerChartRef.value)
  updatePowerChart()
}
// 更新功率趋势图
const updatePowerChart = () => {
  if (!powerChart.value) return
  const config = MOCK_POWER_DATA[dateType.value] // TODO 对接接口后替换为真实数据
  const titleMap = {
    day: `${selectDate.value.getFullYear()}年${selectDate.value.getMonth() + 1}月${selectDate.value.getDate()}日 功率曲线`,
    month: `${selectDate.value.getFullYear()}年${selectDate.value.getMonth() + 1}月 发电量趋势`,
    year: `${selectDate.value.getFullYear()}年 发电量趋势`,
    total: '累计发电量趋势'
  }
  powerChart.value.setOption({
    animation: false,
    backgroundColor: 'transparent',
    title: { text: titleMap[dateType.value], left: 'center', textStyle: { fontSize: 14, color: '#666', fontWeight: 500 } },
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(50, 50, 50, 0.9)', textStyle: { color: '#fff', fontSize: 13 }, padding: [10, 14], axisPointer: { type: 'cross', lineStyle: { color: CHART_COLORS.primary, type: 'dashed' } } },
    legend: { bottom: 10, left: 'center', itemIcon: 'diamond', textStyle: { color: CHART_COLORS.primary }, data: ['功率'] },
    grid: { left: '3%', right: '3%', top: '18%', bottom: '15%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#666', fontSize: 12 }, data: config.xAxis },
    yAxis: { type: 'value', axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: '#f0f0f0' } }, axisLabel: { color: '#666', fontSize: 12 } },
    series: [{ 
      name: '功率', 
      type: 'line', 
      smooth: true, 
      symbol: 'circle', 
      symbolSize: 8, 
      itemStyle: { color: CHART_COLORS.primary }, 
      lineStyle: { color: CHART_COLORS.primary, width: 3 }, 
      areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(255,154,66,0.3)' }, { offset: 1, color: 'rgba(255,154,66,0.05)' }]) }, 
      data: config.data 
    }]
  }, false)
}

// 初始化温度图表
const initTempChart = () => {
  if (!tempChartRef.value) return
  tempChart.value = echarts.init(tempChartRef.value)
  updateTempChart()
}
// 更新温度图表
const updateTempChart = () => {
  if (!tempChart.value) return
  const config = MOCK_TEMP_DATA[tempDateType.value] // TODO 对接接口后替换为真实数据
  tempChart.value.setOption({
    animation: false,
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(50, 50, 50, 0.9)', textStyle: { color: '#fff', fontSize: 13 }, padding: [10, 14] },
    legend: { show: false },
    grid: { left: '3%', right: '3%', top: '10%', bottom: '5%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#666', fontSize: 11 }, data: config.xAxis },
    yAxis: { type: 'value', min: 0, max: 60, axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } }, axisLabel: { color: '#666', fontSize: 11, formatter: '{value}°C' } },
    series: [
      { name: '组件温度', type: 'line', smooth: true, symbol: 'none', lineStyle: { color: CHART_COLORS.secondary, width: 2 }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(255,107,0,0.2)' }, { offset: 1, color: 'rgba(255,107,0,0)' }]) }, data: config.module },
      { name: '环境温度', type: 'line', smooth: true, symbol: 'none', lineStyle: { color: CHART_COLORS.blue, width: 2 }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(64,158,255,0.2)' }, { offset: 1, color: 'rgba(64,158,255,0)' }]) }, data: config.env }
    ]
  }, false)
}

// 统一初始化/更新图表
const initAllCharts = () => { initGauge(); initPowerChart(); initTempChart() }
const updateAllCharts = () => { updateGauge(); updatePowerChart(); updateTempChart() }

// 维度切换事件
const handleDateTypeChange = () => {
  // 切换维度时自动调整日期选择器的值
  if (dateType.value === 'year') selectDate.value = new Date().getFullYear()
  if (dateType.value === 'month') selectDate.value = new Date(new Date().getFullYear(), new Date().getMonth())
  updatePowerChart()
}
const handleTempDateTypeChange = () => { updateTempChart() }

// 防抖处理图表Resize
const handleResize = useDebounceFn(() => {
  requestAnimationFrame(() => {
    gaugeChart.value?.resize()
    powerChart.value?.resize()
    tempChart.value?.resize()
  })
}, 200)

// ==================== 生命周期 ====================
watch(() => props.stationId, fetchData, { immediate: true })

watch(() => props.fullScreen, () => {
  clearTimeout(resizeTimer.value)
  resizeTimer.value = setTimeout(handleResize, 100)
})

watch(() => props.resizeTrigger, handleResize)

onMounted(() => { window.addEventListener('resize', handleResize) })

onUnmounted(() => {
  clearTimeout(resizeTimer.value)
  window.removeEventListener('resize', handleResize)
  // 销毁图表实例
  gaugeChart.value?.dispose()
  powerChart.value?.dispose()
  tempChart.value?.dispose()
})
</script>

<style scoped>
/* 全局CSS变量 */
:root {
  --theme-primary: #ff9a42;
  --theme-secondary: #ff6b00;
  --theme-blue: #409EFF;
  --theme-success: #52c41a;
  --theme-warning: #faad14;
  --theme-danger: #f5222d;
  --card-radius: 16px;
  --card-shadow: 0 4px 20px rgba(0,0,0,0.06);
  --bg-gradient: linear-gradient(135deg, #f8f9fb 0%, #e8ecf0 100%);
}

/* 基准样式 */
.pv-run-data-page {
  width: 100%;
  min-height: calc(100vh - var(--nav-height, 60px));
  background: var(--bg-gradient);
  padding: clamp(12px, 1.67vw, 24px);
  box-sizing: border-box;
  /* 跨平台字体栈 */
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Microsoft YaHei", sans-serif;
}

.empty-wrapper {
  padding: 100px 0;
}

/* 布局通用 */
.row-top { 
  display: grid;
  grid-template-columns: 1fr;
  gap: 0; 
  margin-bottom: clamp(12px, 1.4vw, 20px); 
}
.row-gap-wide { gap: clamp(12px, 1.67vw, 24px); }
.row-middle, .row-bottom {
  display: grid;
  grid-template-columns: 1fr;
  gap: clamp(12px, 1.4vw, 20px);
  margin-bottom: clamp(12px, 1.4vw, 20px);
}

/* 大屏适配（≥768px） */
@media screen and (min-width: 768px) {
  .row-top { grid-template-columns: 1fr; }
  .merged-card-box { grid-template-columns: clamp(220px, 19.4vw, 320px) 1fr; }
  .row-gap-wide { grid-template-columns: 3fr 1fr; }
  .row-middle { grid-template-columns: 3fr 1fr; }
}
/* 超大屏适配（≥1200px） */
@media screen and (min-width: 1200px) {
  .kpi-grid-3col-wide { grid-template-columns: repeat(3, 1fr); }
}

/* 第一行卡片 */
.merged-card-box { 
  background: #fff; 
  border-radius: var(--card-radius); 
  box-shadow: var(--card-shadow); 
  padding: 0; 
  width: 100%; 
  display: grid;
  min-width: 0; 
}
.gauge-card-small {
  height: clamp(220px, 20.8vw, 320px);
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  justify-content: center;
}
.gauge-wrapper { 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  justify-content: center; 
  gap: clamp(8px, 1.1vw, 16px); 
  height: 100%; 
  width: 100%; 
}
.gauge-chart { 
  width: clamp(180px, 18vw, 280px); 
  height: clamp(180px, 18vw, 280px); 
}
.power-value { text-align: center; margin-top: 4px; }
.power-capacity { font-size: clamp(12px, 0.97vw, 14px); color: #666; margin-top: 4px; }

.kpi-card-wide {
  flex: 1;
  height: clamp(220px, 20.8vw, 320px);
  display: flex; 
  align-items: center; 
  min-width: 0;
}
.kpi-grid-3col-wide { 
  width: 100%; 
  display: grid; 
  grid-template-columns: 1fr;
  gap: clamp(12px, 1.1vw, 16px); 
  padding: clamp(12px, 1.1vw, 16px) clamp(16px, 1.4vw, 20px); 
}
@media screen and (min-width: 1024px) {
  .kpi-grid-3col-wide { grid-template-columns: repeat(3, 1fr); }
}

.data-card {
  width: 100%; 
  min-width: 0; 
  padding: clamp(12px, 1.4vw, 20px) clamp(8px, 0.83vw, 12px); 
  background: #F8F9FA;
  border-radius: 12px; 
  box-sizing: border-box; 
  display: flex; 
  flex-direction: column;
  align-items: center; 
  gap: clamp(6px, 0.56vw, 8px); 
  cursor: pointer; 
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
/* 减少动画模式适配 */
@media (prefers-reduced-motion: reduce) {
  .data-card { transition: none; }
}
.data-card:hover { transform: translateY(-4px); box-shadow: 0 8px 20px rgba(255, 122, 24, 0.15); }

.card-label { font-size: clamp(13px, 0.97vw, 15px); color: #666; }
.card-value { font-size: clamp(18px, 1.53vw, 24px); font-weight: 700; color: #1D2129; line-height: 1; }
.card-unit { font-size: clamp(11px, 0.9vw, 13px); font-weight: 400; color: #999; margin-left: 4px; }

.card-grid-2x2 { 
  display: grid; 
  grid-template-columns: 1fr 1fr; 
  gap: clamp(8px, 0.7vw, 10px) clamp(10px, 0.97vw, 14px); 
  width: 100%; 
  margin-top: 4px; 
}
.grid-cell { display: flex; flex-direction: column; align-items: flex-start; min-width: 0; }
.cell-label { font-size: clamp(11px, 0.9vw, 13px); color: #888; margin-bottom: 3px; line-height: 1.3; }
.cell-value { font-size: clamp(12px, 0.97vw, 14px); font-weight: 600; color: #1D2129; line-height: 1.3; }
.text-danger { color: var(--theme-danger); }

/* 系统运行状态 & 呼吸灯（性能优化版） */
.status-wrapper { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; height: clamp(20px, 1.67vw, 24px); }
.status-indicator { 
  position: relative;
  width: 12px; 
  height: 12px; 
  border-radius: 50%; 
  flex-shrink: 0; 
}
.status-indicator::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  border-radius: 50%;
}
.dot-running { background-color: var(--theme-success); }
.dot-running::after {
  background-color: var(--theme-success);
  animation: pulse 2s infinite;
}
.dot-stopped { background-color: var(--theme-danger); }
.dot-stopped::after {
  background-color: var(--theme-danger);
  opacity: 0.4;
}
.status-text { font-size: clamp(15px, 1.25vw, 18px); font-weight: bold; line-height: 1.3; }
.text-running { color: var(--theme-success); }
.text-stopped { color: var(--theme-danger); }
/* 用transform实现呼吸动画，性能提升50% */
@keyframes pulse {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 0.4; }
  70% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
  100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .dot-running::after { animation: none; }
}

/* 第二行：趋势图 + 评估卡 */
.chart-card {
  background: #fff; 
  border-radius: var(--card-radius);
  box-shadow: var(--card-shadow); 
  padding: clamp(16px, 1.67vw, 24px);
  min-width: 0;
  overflow: hidden;
}
.card-header { 
  display: flex; 
  align-items: center; 
  margin-bottom: clamp(12px, 1.4vw, 20px); 
  min-width: 0;
  flex-wrap: wrap;
  gap: 12px;
}
.space-between { justify-content: space-between; }
.card-title { 
  font-size: clamp(16px, 1.25vw, 18px); 
  font-weight: 700; 
  color: #1a1a2e; 
  display: flex; 
  align-items: center; 
  gap: 8px; 
}
.chart-tools { 
  display: flex; 
  gap: 12px; 
  align-items: center; 
  flex-wrap: wrap; 
}
.chart-container { 
  width: 100%; 
  min-width: 0; 
  overflow: hidden; 
  height: clamp(220px, 20.8vw, 320px); 
}
.chart-box { width: 100%; height: 100%; }

.eval-card {
  background: #fff; 
  border-radius: var(--card-radius);
  box-shadow: var(--card-shadow); 
  padding: clamp(16px, 1.67vw, 24px);
}
.eval-list { display: flex; flex-direction: column; }
.eval-row {
  display: flex; 
  justify-content: space-between; 
  align-items: center;
  padding: clamp(8px, 0.7vw, 10px) 0; 
  border-bottom: 1px solid #f0f0f0;
}
.eval-row:last-child { border-bottom: none; }
.eval-label { font-size: clamp(13px, 0.97vw, 14px); color: #666; }
.eval-value { font-size: clamp(14px, 1.11vw, 16px); font-weight: 700; color: #1a1a2e; }
.highlight { color: var(--theme-primary); }
.warning { color: var(--theme-warning); }
.success { color: var(--theme-success); }

/* 第三行：温度图 + 天气预报 */
.temp-card {
  background: #fff; 
  border-radius: var(--card-radius);
  box-shadow: var(--card-shadow); 
  padding: clamp(16px, 1.67vw, 24px);
  min-width: 0;
  overflow: hidden;
}
.temp-chart-container { 
  height: clamp(140px, 14vw, 220px); 
  min-width: 0; 
  overflow: hidden; 
}
.temp-chart { width: 100%; height: 100%; }
.temp-legend { 
  display: flex; 
  justify-content: center; 
  gap: clamp(16px, 2.2vw, 32px); 
  margin-top: clamp(12px, 1.1vw, 16px);
  flex-wrap: wrap;
}
.legend-item { display: flex; align-items: center; gap: 8px; font-size: clamp(12px, 0.97vw, 14px); color: #666; }
.legend-dot { width: 12px; height: 12px; border-radius: 50%; }
.legend-dot.orange { background: var(--theme-secondary); }
.legend-dot.blue { background: var(--theme-blue); }
.legend-value { font-weight: 600; color: #1a1a2e; margin-left: 8px; }

.weather-card {
  background: #fff; 
  border-radius: var(--card-radius);
  box-shadow: var(--card-shadow); 
  padding: clamp(16px, 1.67vw, 24px);
}
.weather-grid { 
  display: grid; 
  grid-template-columns: repeat(3, 1fr); 
  gap: clamp(8px, 1.1vw, 16px); 
  margin-top: 8px; 
}
.weather-day { 
  text-align: center; 
  padding: clamp(8px, 1.1vw, 16px) clamp(6px, 0.56vw, 8px); 
  background: #f8f9fb; 
  border-radius: 12px; 
}
.day-label { font-size: clamp(13px, 0.97vw, 14px); color: #666; margin-bottom: 8px; }
.day-icon { font-size: clamp(24px, 2.2vw, 32px); margin-bottom: 8px; }
.day-temp { font-size: clamp(18px, 1.53vw, 22px); font-weight: 700; color: #1a1a2e; margin-bottom: 4px; }
.day-desc { font-size: clamp(12px, 0.9vw, 13px); color: #888; }

/* 第四行：社会贡献 */
.full-width { width: 100%; }
.social-card { 
  height: clamp(160px, 14vw, 220px); 
  background:#fff; 
  border-radius: var(--card-radius); 
  box-shadow: var(--card-shadow); 
  padding: clamp(16px, 1.67vw, 24px); 
}
.social-stats { 
  display: grid; 
  grid-template-columns: repeat(2, 1fr); 
  gap: clamp(12px, 1.4vw, 20px); 
  height: calc(100% - 40px); 
  align-items: center; 
}
@media screen and (min-width: 768px) {
  .social-stats { grid-template-columns: repeat(4, 1fr); }
}
.social-stat { 
  text-align: center; 
  padding: clamp(8px, 1.1vw, 16px); 
  background: #f8f9fb; 
  border-radius: 12px; 
  height: 100%; 
  display: flex; 
  flex-direction: column; 
  justify-content: center; 
}
.stat-number { font-size: clamp(20px, 1.94vw, 28px); font-weight: 700; color: var(--theme-success); line-height: 1.2; }
.stat-number span { font-size: clamp(12px, 0.97vw, 14px); font-weight: 400; color: #999; margin-left: 4px; }
.stat-label { font-size: clamp(13px, 0.97vw, 14px); color: #666; margin-top: 8px; }

/* ElementPlus 样式覆盖（限制作用域，避免全局污染） */
.pv-run-data-page :deep(.el-radio-button__inner) { border-radius: 8px !important; }
.pv-run-data-page :deep(.el-radio-button--large .el-radio-button__inner) { 
  padding: 10px 18px; 
  font-size: clamp(13px, 0.97vw, 14px); 
}
.pv-run-data-page :deep(.el-radio-button__orig-radio:checked + .el-radio-button__inner) { 
  background-color: var(--theme-primary) !important; 
  border-color: var(--theme-primary) !important; 
  box-shadow: none; 
}
</style>