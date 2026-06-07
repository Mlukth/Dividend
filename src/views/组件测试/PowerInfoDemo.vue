<template>
  <div class="demo-container">
    <!-- 方案选择器 -->
    <div class="scheme-selector">
      <div class="selector-title">🎨 选择样式方案</div>
      <div class="scheme-buttons">
        <button 
          v-for="scheme in schemes" 
          :key="scheme.id"
          :class="['scheme-btn', { active: currentScheme === scheme.id }]"
          @click="currentScheme = scheme.id"
        >
          {{ scheme.name }}
        </button>
      </div>
    </div>    <!-- 方案 A: 科技深色风 -->
    <div v-if="currentScheme === 'A'" class="scheme-wrapper scheme-a">
      <div class="page-header">
        <h1>⚡ 光伏电站监控中心</h1>
        <div class="header-time">{{ currentTime }}</div>
      </div>
      
      <div class="grid-layout">
        <!-- 左上：实时功率 -->
        <div class="card card-gauge">
          <div class="card-title">实时功率</div>
          <div class="gauge-container">
            <div class="gauge-circle">
              <svg viewBox="0 0 200 200" class="gauge-svg">
                <circle cx="100" cy="100" r="85" fill="none" stroke="#1e293b" stroke-width="12"/>
                <circle cx="100" cy="100" r="85" fill="none" stroke="url(#gradientA)" stroke-width="12"
                  stroke-dasharray="534" :stroke-dashoffset="534 - (534 * powerRatio / 100)"
                  stroke-linecap="round" transform="rotate(-90 100 100)"/>
                <defs>
                  <linearGradient id="gradientA" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style="stop-color:#06b6d4"/>
                    <stop offset="100%" style="stop-color:#8b5cf6"/>
                  </linearGradient>
                </defs>
              </svg>
              <div class="gauge-value">{{ mockData.realPower }}<span class="unit">kW</span></div>
            </div>
            <div class="gauge-info">
              <div class="info-item">
                <span class="label">总容量</span>
                <span class="value">{{ mockData.totalCapacity }} kWp</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 上中：发电指标 -->
        <div class="card card-kpi">
          <div class="card-title">发电指标</div>
          <div class="kpi-grid">
            <div class="kpi-item">
              <div class="kpi-value">{{ mockData.todayEnergy }}<span class="kpi-unit">kWh</span></div>
              <div class="kpi-label">当日发电量</div>
              <div class="kpi-sub">累计: {{ mockData.totalEnergy }} kWh</div>
            </div>
            <div class="kpi-item">
              <div class="kpi-value">¥ {{ mockData.todayProfit }}</div>
              <div class="kpi-label">当日收益</div>
              <div class="kpi-sub">累计: ¥ {{ mockData.totalProfit }}</div>
            </div>
            <div class="kpi-item status-item">
              <div class="status-badge running">
                <span class="status-dot"></span>
                运行中
              </div>
              <div class="kpi-label">系统状态</div>
              <div class="kpi-sub">告警: {{ mockData.warningCount }} 条</div>
            </div>
          </div>
        </div>

        <!-- 右上：电站评估 -->
        <div class="card card-eval">
          <div class="card-title">电站评估</div>
          <div class="eval-list">
            <div class="eval-item" v-for="item in mockData.evalData" :key="item.label">
              <span class="eval-label">{{ item.label }}</span>
              <div class="eval-bar">
                <div class="eval-progress" :style="{ width: item.value + '%', background: item.color }"></div>
              </div>
              <span class="eval-value">{{ item.displayValue }}</span>
            </div>
          </div>
        </div>

        <!-- 左下：功率趋势 -->
        <div class="card card-chart">
          <div class="card-header">
            <div class="card-title">发电功率趋势</div>
            <div class="chart-tabs">
              <button :class="['tab', { active: chartPeriod === 'day' }]" @click="chartPeriod = 'day'">日</button>
              <button :class="['tab', { active: chartPeriod === 'month' }]" @click="chartPeriod = 'month'">月</button>
              <button :class="['tab', { active: chartPeriod === 'year' }]" @click="chartPeriod = 'year'">年</button>
            </div>
          </div>
          <div class="chart-placeholder">
            <div class="chart-bars">
              <div v-for="(bar, i) in chartData" :key="i" class="bar-wrapper">
                <div class="bar" :style="{ height: bar.height + '%' }"></div>
                <div class="bar-label">{{ bar.label }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 中下：温度监测 -->
        <div class="card card-temp">
          <div class="card-title">温度监测</div>
          <div class="temp-display">
            <div class="temp-item">
              <div class="temp-icon orange">🌡️</div>
              <div class="temp-info">
                <div class="temp-label">组件温度</div>
                <div class="temp-value">{{ mockData.moduleTemp }}°C</div>
              </div>
            </div>
            <div class="temp-item">
              <div class="temp-icon blue">🌤️</div>
              <div class="temp-info">
                <div class="temp-label">环境温度</div>
                <div class="temp-value">{{ mockData.envTemp }}°C</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右下：天气预报 -->
        <div class="card card-weather">
          <div class="card-title">天气预报</div>
          <div class="weather-list">
            <div v-for="day in mockData.weather" :key="day.day" class="weather-item">
              <div class="weather-day">{{ day.day }}</div>
              <div class="weather-icon">{{ day.icon }}</div>
              <div class="weather-temp">{{ day.temp }}°C</div>
            </div>
          </div>
        </div>

        <!-- 底部：社会贡献 -->
        <div class="card card-social full-width">
          <div class="card-title">社会贡献</div>
          <div class="social-grid">
            <div v-for="item in mockData.socialData" :key="item.label" class="social-item">
              <div class="social-icon">{{ item.icon }}</div>
              <div class="social-value">{{ item.value }}<span class="social-unit">{{ item.unit }}</span></div>
              <div class="social-label">{{ item.label }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 方案 B: 现代简约风 -->
    <div v-if="currentScheme === 'B'" class="scheme-wrapper scheme-b">
      <div class="top-bar">
        <h1>☀️ 光伏电站监测</h1>
        <div class="time-display">{{ currentTime }}</div>
      </div>

      <div class="main-content">
        <!-- 核心指标行 -->
        <div class="hero-section">
          <div class="hero-gauge">
            <div class="gauge-ring">
              <svg viewBox="0 0 180 180">
                <circle cx="90" cy="90" r="75" fill="none" stroke="#f0f0f0" stroke-width="10"/>
                <circle cx="90" cy="90" r="75" fill="none" stroke="#10b981" stroke-width="10"
                  stroke-dasharray="471" :stroke-dashoffset="471 - (471 * powerRatio / 100)"
                  stroke-linecap="round" transform="rotate(-90 90 90)"/>
              </svg>
              <div class="hero-value">{{ mockData.realPower }} kW</div>
            </div>
            <div class="hero-label">实时功率</div>
          </div>
          
          <div class="hero-cards">
            <div class="hero-card">
              <div class="hero-card-icon">⚡</div>
              <div class="hero-card-content">
                <div class="hero-card-value">{{ mockData.todayEnergy }} kWh</div>
                <div class="hero-card-label">今日发电</div>
              </div>
            </div>
            <div class="hero-card">
              <div class="hero-card-icon">💰</div>
              <div class="hero-card-content">
                <div class="hero-card-value">¥ {{ mockData.todayProfit }}</div>
                <div class="hero-card-label">今日收益</div>
              </div>
            </div>
            <div class="hero-card">
              <div class="hero-card-icon status-dot-b"></div>
              <div class="hero-card-content">
                <div class="hero-card-value">运行中</div>
                <div class="hero-card-label">系统状态</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 数据网格 -->
        <div class="data-grid">
          <div class="data-card-b chart-card-b">
            <div class="card-header-b">
              <span class="card-title-b">功率趋势</span>
              <div class="toggle-group">
                <button :class="['toggle', { active: chartPeriod === 'day' }]" @click="chartPeriod = 'day'">日</button>
                <button :class="['toggle', { active: chartPeriod === 'month' }]" @click="chartPeriod = 'month'">月</button>
              </div>
            </div>
            <div class="chart-area">
              <svg viewBox="0 0 400 150" class="line-chart">
                <polyline :points="chartLinePoints" fill="none" stroke="#10b981" stroke-width="3"/>
                <polyline :points="chartAreaPoints" fill="url(#areaGradient)" stroke="none"/>
                <defs>
                  <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#10b981;stop-opacity:0.3"/>
                    <stop offset="100%" style="stop-color:#10b981;stop-opacity:0"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          <div class="data-card-b eval-card-b">
            <div class="card-title-b">电站评估</div>
            <div class="eval-stats">
              <div v-for="item in mockData.evalData" :key="item.label" class="eval-stat">
                <div class="eval-stat-value">{{ item.displayValue }}</div>
                <div class="eval-stat-label">{{ item.label }}</div>
              </div>
            </div>
          </div>

          <div class="data-card-b temp-card-b">
            <div class="card-title-b">温度监测</div>
            <div class="temp-stats">
              <div class="temp-stat">
                <div class="temp-circle orange-b">
                  <span class="temp-num-b">{{ mockData.moduleTemp }}°</span>
                </div>
                <div class="temp-label-b">组件温度</div>
              </div>
              <div class="temp-stat">
                <div class="temp-circle blue-b">
                  <span class="temp-num-b">{{ mockData.envTemp }}°</span>
                </div>
                <div class="temp-label-b">环境温度</div>
              </div>
            </div>
          </div>

          <div class="data-card-b weather-card-b">
            <div class="card-title-b">天气预报</div>
            <div class="weather-forecast">
              <div v-for="day in mockData.weather" :key="day.day" class="forecast-item">
                <span class="forecast-day">{{ day.day }}</span>
                <span class="forecast-icon">{{ day.icon }}</span>
                <span class="forecast-temp">{{ day.temp }}°</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 社会贡献 -->
        <div class="social-section">
          <div class="section-title">🌱 绿色贡献</div>
          <div class="social-items">
            <div v-for="item in mockData.socialData" :key="item.label" class="social-item-b">
              <span class="social-icon-b">{{ item.icon }}</span>
              <span class="social-value-b">{{ item.value }}{{ item.unit }}</span>
              <span class="social-label-b">{{ item.label }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 方案 C: 工业数据风 -->
    <div v-if="currentScheme === 'C'" class="scheme-wrapper scheme-c">
      <!-- 顶部状态栏 -->
      <div class="header-c">
        <div class="title-c">
          <span class="decorator"></span>
          光伏电站监控系统
          <span class="decorator"></span>
        </div>
        <div class="status-bar-c">
          <span class="status-item-c">
            <span class="label-c">当前时间:</span>
            <span class="value-c">{{ currentTime }}</span>
          </span>
          <span class="status-item-c">
            <span class="label-c">运行状态:</span>
            <span class="value-c highlight-c">正常</span>
          </span>
        </div>
      </div>

      <div class="container-c">
        <!-- 左侧面板 -->
        <div class="panel-c left-panel-c">
          <div class="panel-header-c">
            <span class="panel-title-c">实时监测</span>
          </div>
          
          <div class="gauge-c">
            <div class="gauge-display-c">
              <svg viewBox="0 0 200 120" class="semi-gauge">
                <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#1a2332" stroke-width="8"/>
                <path :d="gaugeArcPath" fill="none" stroke="#ff6b00" stroke-width="8" stroke-linecap="round"/>
              </svg>
              <div class="gauge-value-c">{{ mockData.realPower }}<span class="unit-c">kW</span></div>
            </div>
            <div class="gauge-label-c">实时功率</div>
          </div>

          <div class="data-list-c">
            <div class="data-row-c">
              <span class="data-label-c">总容量</span>
              <span class="data-value-c">{{ mockData.totalCapacity }} kWp</span>
            </div>
            <div class="data-row-c">
              <span class="data-label-c">今日发电</span>
              <span class="data-value-c highlight-c">{{ mockData.todayEnergy }} kWh</span>
            </div>
            <div class="data-row-c">
              <span class="data-label-c">今日收益</span>
              <span class="data-value-c highlight-c">¥ {{ mockData.todayProfit }}</span>
            </div>
            <div class="data-row-c">
              <span class="data-label-c">告警数量</span>
              <span class="data-value-c warning-c">{{ mockData.warningCount }}</span>
            </div>
          </div>

          <div class="panel-header-c">
            <span class="panel-title-c">温度监测</span>
          </div>
          <div class="temp-monitor-c">
            <div class="temp-bar-c">
              <div class="temp-bar-fill orange-c" :style="{ height: (mockData.moduleTemp / 60 * 100) + '%' }"></div>
              <div class="temp-bar-label">{{ mockData.moduleTemp }}°</div>
            </div>
            <div class="temp-bar-c">
              <div class="temp-bar-fill blue-c" :style="{ height: (mockData.envTemp / 60 * 100) + '%' }"></div>
              <div class="temp-bar-label">{{ mockData.envTemp }}°</div>
            </div>
          </div>
          <div class="temp-legend-c">
            <span>组件</span>
            <span>环境</span>
          </div>
        </div>

        <!-- 中间主面板 -->
        <div class="main-panel-c">
          <div class="panel-header-c flex-c">
            <span class="panel-title-c">发电功率趋势</span>
            <div class="tabs-c">
              <button :class="['tab-c', { active: chartPeriod === 'day' }]" @click="chartPeriod = 'day'">日</button>
              <button :class="['tab-c', { active: chartPeriod === 'month' }]" @click="chartPeriod = 'month'">月</button>
              <button :class="['tab-c', { active: chartPeriod === 'year' }]" @click="chartPeriod = 'year'">年</button>
            </div>
          </div>
          
          <div class="chart-container-c">
            <svg viewBox="0 0 500 200" class="bar-chart-c">
              <g v-for="(bar, i) in chartData" :key="i" :transform="`translate(${i * 45 + 20}, 0)`">
                <rect x="0" :y="200 - bar.height * 1.8" width="30" :height="bar.height * 1.8" fill="#ff6b00" rx="2"/>
                <text x="15" y="215" text-anchor="middle" fill="#8896a8" font-size="10">{{ bar.label }}</text>
              </g>
            </svg>
          </div>

          <div class="eval-section-c">
            <div class="panel-header-c">
              <span class="panel-title-c">电站评估</span>
            </div>
            <div class="eval-grid-c">
              <div v-for="item in mockData.evalData" :key="item.label" class="eval-item-c">
                <div class="eval-number-c">{{ item.displayValue }}</div>
                <div class="eval-name-c">{{ item.label }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧面板 -->
        <div class="panel-c right-panel-c">
          <div class="panel-header-c">
            <span class="panel-title-c">天气预报</span>
          </div>
          <div class="weather-cards-c">
            <div v-for="day in mockData.weather" :key="day.day" class="weather-card-c">
              <div class="weather-day-c">{{ day.day }}</div>
              <div class="weather-icon-c">{{ day.icon }}</div>
              <div class="weather-temp-c">{{ day.temp }}°C</div>
            </div>
          </div>

          <div class="panel-header-c">
            <span class="panel-title-c">社会贡献</span>
          </div>
          <div class="social-cards-c">
            <div v-for="item in mockData.socialData" :key="item.label" class="social-card-c">
              <div class="social-icon-c">{{ item.icon }}</div>
              <div class="social-value-c">{{ item.value }}{{ item.unit }}</div>
              <div class="social-name-c">{{ item.label }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// 当前方案
const currentScheme = ref('A')

// 方案列表
const schemes = [
  { id: 'A', name: '方案A: 科技深色风' },
  { id: 'B', name: '方案B: 现代简约风' },
  { id: 'C', name: '方案C: 工业数据风' }
]

// 模拟数据
const mockData = ref({
  realPower: 856,
  totalCapacity: 1500,
  todayEnergy: '4,286',
  totalEnergy: '1,256,890',
  todayProfit: '1,714',
  totalProfit: '502,756',
  warningCount: 0,
  moduleTemp: '45.2',
  envTemp: '24.5',
  evalData: [
    { label: '综合效率', value: 86, displayValue: '86.0%', color: '#06b6d4' },
    { label: '等效小时', value: 75, displayValue: '3.2h', color: '#8b5cf6' },
    { label: '性能比PR', value: 88, displayValue: '88.0%', color: '#10b981' },
    { label: '可用率', value: 99, displayValue: '99.2%', color: '#f59e0b' }
  ],
  weather: [
    { day: '今天', icon: '☀️', temp: '32' },
    { day: '明天', icon: '⛅', temp: '28' },
    { day: '后天', icon: '🌧️', temp: '24' }
  ],
  socialData: [
    { icon: '🌿', label: 'CO₂减排', value: '754.1', unit: '吨' },
    { icon: '⛏️', label: '标煤节约', value: '154.3', unit: '吨' },
    { icon: '🌳', label: '等效植树', value: '12,443', unit: '棵' },
    { icon: '⚡', label: '绿色发电', value: '1,256,890', unit: 'kWh' }
  ]
})

// 图表周期
const chartPeriod = ref('day')

// 图表数据
const chartData = computed(() => {
  const dayData = [
    { label: '08', height: 30 },
    { label: '10', height: 55 },
    { label: '12', height: 85 },
    { label: '14', height: 78 },
    { label: '16', height: 60 },
    { label: '18', height: 35 },
    { label: '20', height: 10 }
  ]
  const monthData = [
    { label: '1日', height: 60 },
    { label: '10日', height: 75 },
    { label: '20日', height: 80 },
    { label: '30日', height: 65 }
  ]
  return chartPeriod.value === 'day' ? dayData : monthData
})

// 功率占比
const powerRatio = computed(() => {
  return (mockData.value.realPower / mockData.value.totalCapacity * 100)
})

// 图表线点（方案B）
const chartLinePoints = computed(() => {
  const points = chartData.value.map((d, i) => `${i * 60 + 30},${150 - d.height * 1.2}`)
  return points.join(' ')
})

// 图表区域点（方案B）
const chartAreaPoints = computed(() => {
  const start = '30,150'
  const end = `${(chartData.value.length - 1) * 60 + 30},150`
  return `${start} ${chartLinePoints.value} ${end}`
})

// 仪表盘弧线路径（方案C）
const gaugeArcPath = computed(() => {
  const angle = (powerRatio.value / 100) * 180
  const startX = 20
  const startY = 100
  const endX = 20 + 160 * Math.cos((angle - 180) * Math.PI / 180)
  const endY = 100 + 160 * Math.sin((angle - 180) * Math.PI / 180)
  return `M 20 100 A 80 80 0 ${angle > 180 ? 1 : 0} 1 ${endX} ${endY}`
})

// 当前时间
const currentTime = ref('')
let timeInterval = null

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval)
})
</script>

<style scoped>
/* 通用样式 */
.demo-container {
  min-height: 100vh;
  background: #f5f7fa;
}

.scheme-selector {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}

.selector-title {
  color: white;
  font-size: 18px;
  font-weight: 600;
}

.scheme-buttons {
  display: flex;
  gap: 12px;
}

.scheme-btn {
  padding: 10px 20px;
  border: 2px solid rgba(255,255,255,0.3);
  background: rgba(255,255,255,0.1);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
}

.scheme-btn:hover {
  background: rgba(255,255,255,0.2);
  border-color: rgba(255,255,255,0.5);
}

.scheme-btn.active {
  background: white;
  color: #667eea;
  border-color: white;
}

.scheme-wrapper {
  padding-top: 80px;
  min-height: 100vh;
}

/* ========== 方案 A: 科技深色风 ========== */
.scheme-a {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #e2e8f0;
  padding: 100px 24px 40px;
}

.scheme-a .page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.scheme-a .page-header h1 {
  font-size: 28px;
  margin: 0;
  background: linear-gradient(90deg, #06b6d4, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.scheme-a .header-time {
  font-size: 16px;
  color: #94a3b8;
}

.scheme-a .grid-layout {
  display: grid;
  grid-template-columns: 280px 1fr 280px;
  gap: 20px;
}

.scheme-a .card {
  background: linear-gradient(145deg, rgba(30,41,59,0.8), rgba(15,23,42,0.9));
  border: 1px solid rgba(100,116,139,0.2);
  border-radius: 16px;
  padding: 20px;
  backdrop-filter: blur(10px);
}

.scheme-a .card-title {
  font-size: 16px;
  font-weight: 600;
  color: #cbd5e1;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(100,116,139,0.2);
}

.scheme-a .full-width {
  grid-column: 1 / -1;
}

/* 仪表盘 */
.scheme-a .gauge-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.scheme-a .gauge-circle {
  position: relative;
  width: 200px;
  height: 200px;
}

.scheme-a .gauge-svg {
  width: 100%;
  height: 100%;
}

.scheme-a .gauge-value {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 32px;
  font-weight: 700;
  color: #06b6d4;
}

.scheme-a .gauge-value .unit {
  font-size: 16px;
  font-weight: 400;
  color: #64748b;
}

.scheme-a .gauge-info {
  margin-top: 16px;
  text-align: center;
}

.scheme-a .info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.scheme-a .info-item .label {
  color: #64748b;
  font-size: 14px;
}

.scheme-a .info-item .value {
  color: #e2e8f0;
  font-size: 16px;
  font-weight: 600;
}

/* KPI 网格 */
.scheme-a .kpi-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.scheme-a .kpi-item {
  text-align: center;
  padding: 20px;
  background: rgba(15,23,42,0.5);
  border-radius: 12px;
}

.scheme-a .kpi-value {
  font-size: 28px;
  font-weight: 700;
  color: #06b6d4;
}

.scheme-a .kpi-unit {
  font-size: 14px;
  color: #64748b;
  margin-left: 4px;
}

.scheme-a .kpi-label {
  font-size: 14px;
  color: #94a3b8;
  margin-top: 8px;
}

.scheme-a .kpi-sub {
  font-size: 12px;
  color: #64748b;
  margin-top: 4px;
}

.scheme-a .status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.scheme-a .status-badge.running {
  background: rgba(16,185,129,0.2);
  color: #10b981;
}

.scheme-a .status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* 评估列表 */
.scheme-a .eval-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.scheme-a .eval-item {
  display: grid;
  grid-template-columns: 70px 1fr 50px;
  align-items: center;
  gap: 12px;
}

.scheme-a .eval-label {
  font-size: 13px;
  color: #94a3b8;
}

.scheme-a .eval-bar {
  height: 8px;
  background: #1e293b;
  border-radius: 4px;
  overflow: hidden;
}

.scheme-a .eval-progress {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.scheme-a .eval-value {
  font-size: 14px;
  font-weight: 600;
  text-align: right;
}

/* 图表 */
.scheme-a .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(100,116,139,0.2);
}

.scheme-a .chart-tabs {
  display: flex;
  gap: 8px;
}

.scheme-a .tab {
  padding: 6px 14px;
  border: none;
  background: rgba(100,116,139,0.2);
  color: #94a3b8;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s;
}

.scheme-a .tab:hover {
  background: rgba(100,116,139,0.3);
}

.scheme-a .tab.active {
  background: #06b6d4;
  color: white;
}

.scheme-a .chart-placeholder {
  margin-top: 20px;
}

.scheme-a .chart-bars {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 180px;
  padding: 0 20px;
}

.scheme-a .bar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  height: 100%;
  justify-content: flex-end;
}

.scheme-a .bar {
  width: 30px;
  background: linear-gradient(180deg, #06b6d4, #8b5cf6);
  border-radius: 4px 4px 0 0;
  min-height: 5px;
}

.scheme-a .bar-label {
  font-size: 12px;
  color: #64748b;
}

/* 温度 */
.scheme-a .temp-display {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.scheme-a .temp-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(15,23,42,0.5);
  border-radius: 12px;
}

.scheme-a .temp-icon {
  font-size: 28px;
}

.scheme-a .temp-label {
  font-size: 13px;
  color: #94a3b8;
}

.scheme-a .temp-value {
  font-size: 24px;
  font-weight: 700;
}

.scheme-a .temp-value.orange { color: #f59e0b; }
.scheme-a .temp-value.blue { color: #3b82f6; }

/* 天气 */
.scheme-a .weather-list {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.scheme-a .weather-item {
  flex: 1;
  text-align: center;
  padding: 16px 8px;
  background: rgba(15,23,42,0.5);
  border-radius: 12px;
}

.scheme-a .weather-day {
  font-size: 13px;
  color: #94a3b8;
  margin-bottom: 8px;
}

.scheme-a .weather-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.scheme-a .weather-temp {
  font-size: 20px;
  font-weight: 700;
}

/* 社会贡献 */
.scheme-a .social-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.scheme-a .social-item {
  text-align: center;
  padding: 20px;
  background: rgba(15,23,42,0.5);
  border-radius: 12px;
}

.scheme-a .social-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.scheme-a .social-value {
  font-size: 24px;
  font-weight: 700;
  color: #10b981;
}

.scheme-a .social-unit {
  font-size: 14px;
  color: #64748b;
  margin-left: 4px;
}

.scheme-a .social-label {
  font-size: 14px;
  color: #94a3b8;
  margin-top: 8px;
}

/* ========== 方案 B: 现代简约风 ========== */
.scheme-b {
  background: #f8fafc;
  padding: 100px 32px 40px;
}

.scheme-b .top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding: 0 8px;
}

.scheme-b .top-bar h1 {
  margin: 0;
  font-size: 28px;
  color: #1e293b;
}

.scheme-b .time-display {
  font-size: 16px;
  color: #64748b;
}

.scheme-b .main-content {
  max-width: 1400px;
  margin: 0 auto;
}

/* Hero 区域 */
.scheme-b .hero-section {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 32px;
  margin-bottom: 32px;
}

.scheme-b .hero-gauge {
  background: white;
  border-radius: 20px;
  padding: 32px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
}

.scheme-b .gauge-ring {
  position: relative;
  width: 180px;
  height: 180px;
  margin: 0 auto;
}

.scheme-b .gauge-ring svg {
  width: 100%;
  height: 100%;
}

.scheme-b .hero-value {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
}

.scheme-b .hero-label {
  margin-top: 16px;
  font-size: 16px;
  color: #64748b;
}

.scheme-b .hero-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.scheme-b .hero-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
}

.scheme-b .hero-card-icon {
  font-size: 40px;
}

.scheme-b .status-dot-b {
  width: 40px;
  height: 40px;
  background: #10b981;
  border-radius: 50%;
  animation: pulse2 2s infinite;
}

@keyframes pulse2 {
  0% { box-shadow: 0 0 0 0 rgba(16,185,129,0.4); }
  70% { box-shadow: 0 0 0 12px rgba(16,185,129,0); }
  100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
}

.scheme-b .hero-card-value {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
}

.scheme-b .hero-card-label {
  font-size: 14px;
  color: #64748b;
  margin-top: 4px;
}

/* 数据网格 */
.scheme-b .data-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 20px;
  margin-bottom: 32px;
}

.scheme-b .data-card-b {
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
}

.scheme-b .card-header-b {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.scheme-b .card-title-b {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.scheme-b .toggle-group {
  display: flex;
  gap: 4px;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 8px;
}

.scheme-b .toggle {
  padding: 6px 14px;
  border: none;
  background: transparent;
  color: #64748b;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s;
}

.scheme-b .toggle.active {
  background: white;
  color: #1e293b;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.scheme-b .chart-area {
  height: 150px;
}

.scheme-b .line-chart {
  width: 100%;
  height: 100%;
}

/* 评估 */
.scheme-b .eval-stats {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.scheme-b .eval-stat {
  text-align: center;
}

.scheme-b .eval-stat-value {
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
}

.scheme-b .eval-stat-label {
  font-size: 13px;
  color: #64748b;
  margin-top: 4px;
}

/* 温度 */
.scheme-b .temp-stats {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.scheme-b .temp-stat {
  text-align: center;
}

.scheme-b .temp-circle {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
}

.scheme-b .temp-circle.orange-b {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
}

.scheme-b .temp-circle.blue-b {
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
}

.scheme-b .temp-num-b {
  font-size: 20px;
  font-weight: 700;
  color: white;
}

.scheme-b .temp-label-b {
  font-size: 13px;
  color: #64748b;
}

/* 天气 */
.scheme-b .weather-forecast {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.scheme-b .forecast-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8fafc;
  border-radius: 12px;
}

.scheme-b .forecast-day {
  font-size: 14px;
  color: #64748b;
}

.scheme-b .forecast-icon {
  font-size: 24px;
}

.scheme-b .forecast-temp {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

/* 社会贡献 */
.scheme-b .social-section {
  background: white;
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
}

.scheme-b .section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 24px;
}

.scheme-b .social-items {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.scheme-b .social-item-b {
  text-align: center;
  padding: 20px;
  background: #f8fafc;
  border-radius: 16px;
}

.scheme-b .social-icon-b {
  font-size: 32px;
  margin-bottom: 12px;
  display: block;
}

.scheme-b .social-value-b {
  font-size: 24px;
  font-weight: 700;
  color: #10b981;
}

.scheme-b .social-label-b {
  font-size: 14px;
  color: #64748b;
  margin-top: 8px;
  display: block;
}

/* ========== 方案 C: 工业数据风 ========== */
.scheme-c {
  background: #0a0e17;
  color: #e8eef6;
  padding: 100px 20px 40px;
  font-family: 'Microsoft YaHei', sans-serif;
}

.scheme-c .header-c {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: linear-gradient(90deg, transparent, rgba(0,212,255,0.1), transparent);
  border: 1px solid rgba(0,212,255,0.2);
  margin-bottom: 20px;
}

.scheme-c .title-c {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 4px;
  color: #00d4ff;
  display: flex;
  align-items: center;
  gap: 16px;
}

.scheme-c .decorator {
  width: 60px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00d4ff);
}

.scheme-c .decorator:last-child {
  background: linear-gradient(90deg, #00d4ff, transparent);
}

.scheme-c .status-bar-c {
  display: flex;
  gap: 32px;
}

.scheme-c .status-item-c {
  font-size: 14px;
}

.scheme-c .label-c {
  color: #8896a8;
}

.scheme-c .value-c {
  color: #e8eef6;
  margin-left: 8px;
}

.scheme-c .highlight-c {
  color: #00d4ff;
}

.scheme-c .container-c {
  display: grid;
  grid-template-columns: 260px 1fr 260px;
  gap: 20px;
  max-width: 1600px;
  margin: 0 auto;
}

.scheme-c .panel-c {
  background: linear-gradient(180deg, rgba(15,23,42,0.9), rgba(10,14,23,0.95));
  border: 1px solid rgba(0,212,255,0.2);
  position: relative;
}

.scheme-c .panel-c::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #00d4ff, #ff6b00);
}

.scheme-c .panel-header-c {
  padding: 14px 16px;
  background: rgba(0,212,255,0.05);
  border-bottom: 1px solid rgba(0,212,255,0.2);
}

.scheme-c .panel-header-c.flex-c {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.scheme-c .panel-title-c {
  font-size: 15px;
  font-weight: 600;
  color: #00d4ff;
}

/* 仪表盘 */
.scheme-c .gauge-c {
  padding: 24px 16px;
  text-align: center;
}

.scheme-c .gauge-display-c {
  position: relative;
  height: 140px;
}

.scheme-c .semi-gauge {
  width: 100%;
  height: 120px;
}

.scheme-c .gauge-value-c {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 32px;
  font-weight: 700;
  color: #ff6b00;
}

.scheme-c .unit-c {
  font-size: 14px;
  color: #8896a8;
  margin-left: 4px;
}

.scheme-c .gauge-label-c {
  font-size: 14px;
  color: #8896a8;
  margin-top: 8px;
}

/* 数据列表 */
.scheme-c .data-list-c {
  padding: 16px;
}

.scheme-c .data-row-c {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(136,150,168,0.15);
}

.scheme-c .data-row-c:last-child {
  border-bottom: none;
}

.scheme-c .data-label-c {
  color: #8896a8;
  font-size: 14px;
}

.scheme-c .data-value-c {
  font-size: 16px;
  font-weight: 600;
}

.scheme-c .warning-c {
  color: #ff6b00;
}

/* 温度监测 */
.scheme-c .temp-monitor-c {
  display: flex;
  justify-content: center;
  gap: 40px;
  padding: 20px 16px;
  height: 160px;
}

.scheme-c .temp-bar-c {
  width: 40px;
  height: 120px;
  background: #1a2332;
  border-radius: 4px;
  position: relative;
  display: flex;
  flex-direction: column-reverse;
  overflow: hidden;
}

.scheme-c .temp-bar-fill {
  width: 100%;
  transition: height 0.5s ease;
  border-radius: 4px 4px 0 0;
}

.scheme-c .temp-bar-fill.orange-c {
  background: linear-gradient(180deg, #ff6b00, #ff9500);
}

.scheme-c .temp-bar-fill.blue-c {
  background: linear-gradient(180deg, #00d4ff, #0099cc);
}

.scheme-c .temp-bar-label {
  position: absolute;
  bottom: -24px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 14px;
  font-weight: 600;
}

.scheme-c .temp-legend-c {
  display: flex;
  justify-content: center;
  gap: 40px;
  padding: 0 16px 16px;
  font-size: 13px;
  color: #8896a8;
}

/* 中间主面板 */
.scheme-c .main-panel-c {
  background: linear-gradient(180deg, rgba(15,23,42,0.9), rgba(10,14,23,0.95));
  border: 1px solid rgba(0,212,255,0.2);
  position: relative;
}

.scheme-c .main-panel-c::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #00d4ff, #ff6b00);
}

.scheme-c .tabs-c {
  display: flex;
  gap: 8px;
}

.scheme-c .tab-c {
  padding: 6px 16px;
  border: 1px solid rgba(0,212,255,0.3);
  background: transparent;
  color: #8896a8;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s;
}

.scheme-c .tab-c.active {
  background: rgba(0,212,255,0.15);
  color: #00d4ff;
  border-color: #00d4ff;
}

.scheme-c .chart-container-c {
  padding: 24px 16px;
  height: 240px;
}

.scheme-c .bar-chart-c {
  width: 100%;
  height: 100%;
}

/* 评估 */
.scheme-c .eval-section-c {
  border-top: 1px solid rgba(0,212,255,0.2);
}

.scheme-c .eval-grid-c {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: rgba(0,212,255,0.2);
}

.scheme-c .eval-item-c {
  background: rgba(15,23,42,0.95);
  padding: 20px 16px;
  text-align: center;
}

.scheme-c .eval-number-c {
  font-size: 24px;
  font-weight: 700;
  color: #ff6b00;
}

.scheme-c .eval-name-c {
  font-size: 13px;
  color: #8896a8;
  margin-top: 8px;
}

/* 天气卡片 */
.scheme-c .weather-cards-c {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.scheme-c .weather-card-c {
  background: rgba(0,212,255,0.05);
  border: 1px solid rgba(0,212,255,0.15);
  padding: 16px;
  text-align: center;
}

.scheme-c .weather-day-c {
  font-size: 13px;
  color: #8896a8;
  margin-bottom: 8px;
}

.scheme-c .weather-icon-c {
  font-size: 28px;
  margin-bottom: 8px;
}

.scheme-c .weather-temp-c {
  font-size: 18px;
  font-weight: 600;
  color: #00d4ff;
}

/* 社会贡献 */
.scheme-c .social-cards-c {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.scheme-c .social-card-c {
  background: rgba(0,212,255,0.05);
  border: 1px solid rgba(0,212,255,0.15);
  padding: 16px;
  text-align: center;
}

.scheme-c .social-icon-c {
  font-size: 24px;
  margin-bottom: 8px;
}

.scheme-c .social-value-c {
  font-size: 18px;
  font-weight: 700;
  color: #10b981;
}

.scheme-c .social-name-c {
  font-size: 13px;
  color: #8896a8;
  margin-top: 6px;
}
</style>