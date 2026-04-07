<template>
  <div class="solar-monitor">
    <!-- 左侧电站列表栏 -->
    <div class="sidebar">
      <div class="sidebar-header">
        <span class="logo">FusionSolar</span>
      </div>
      <div class="company-select">
        <el-select v-model="selectedCompany" placeholder="选择企业" style="width: 100%">
          <el-option label="深圳菱瑞新能源有限..." value="company1" />
        </el-select>
      </div>
      <div class="station-list">
        <el-input v-model="stationSearch" placeholder="请输入电站名" prefix-icon="Search" style="margin-bottom: 10px" />
        <el-tree
          :data="stationTreeData"
          :props="treeProps"
          default-expand-all
          highlight-current
          @current-change="handleStationChange"
        />
      </div>
    </div>

    <!-- 右侧主内容区 -->
    <div class="main-content">
      <!-- 顶部导航栏 -->
      <div class="top-nav">
        <div class="nav-left">
          <span class="station-title">裕同2000KW光伏发电</span>
          <el-menu mode="horizontal" :default-active="activeTab" class="nav-menu">
            <el-menu-item index="1">概览</el-menu-item>
            <el-menu-item index="2">电站视图</el-menu-item>
            <el-menu-item index="3">趋势分析</el-menu-item>
            <el-menu-item index="4">报表管理</el-menu-item>
            <el-menu-item index="5">设备管理</el-menu-item>
            <el-menu-item index="6">告警管理</el-menu-item>
            <el-menu-item index="7">离散率分析</el-menu-item>
            <el-menu-item index="8">电站用户</el-menu-item>
          </el-menu>
        </div>
        <div class="nav-right">
          <span class="weather">18~28℃ 晴天 周四 2026-03-12</span>
          <el-icon class="icon"><Sunny /></el-icon>
          <el-icon class="icon"><Moon /></el-icon>
          <el-icon class="icon"><Setting /></el-icon>
          <el-icon class="icon"><QuestionFilled /></el-icon>
          <el-button type="text" class="back-btn">←返回旧版</el-button>
        </div>
      </div>

      <!-- 核心数据卡片区 -->
      <div class="data-cards">
        <div class="data-card">
          <div class="card-value">1.09<span class="unit">万度</span></div>
          <div class="card-label">当日发电量</div>
        </div>
        <div class="data-card">
          <div class="card-value">4,913.12<span class="unit">元</span></div>
          <div class="card-label">当日收益</div>
        </div>
        <div class="data-card">
          <div class="card-value">526.42<span class="unit">万度</span></div>
          <div class="card-label">累计发电量</div>
        </div>
        <div class="data-card">
          <div class="card-value">1.76<span class="unit">MW</span></div>
          <div class="card-label">逆变器额定功率</div>
        </div>
        <div class="data-card">
          <div class="card-value">--<span class="unit">度</span></div>
          <div class="card-label">当日购买电量</div>
        </div>
      </div>

      <!-- 告警标签区 -->
      <div class="alert-tags">
        <el-tag type="danger" effect="dark">紧急 <span class="tag-num">0</span></el-tag>
        <el-tag type="warning" effect="dark">重要 <span class="tag-num">0</span></el-tag>
        <el-tag type="info" effect="dark">次要 <span class="tag-num">0</span></el-tag>
        <el-tag type="primary" effect="dark">提示 <span class="tag-num">0</span></el-tag>
      </div>

      <!-- 中间内容区：拓扑图 + 趋势图 -->
      <div class="middle-content">
        <!-- 左侧设备拓扑图 -->
        <div class="topology-container">
          <div id="topologyChart" class="topology-chart"></div>
        </div>
        <!-- 右侧能量趋势 + 收益趋势 -->
        <div class="charts-container">
          <!-- 能量趋势图 -->
          <div class="chart-card">
            <div class="chart-header">
              <span>能量趋势</span>
              <el-button-group size="small">
                <el-button type="primary" plain>月</el-button>
                <el-button plain>年</el-button>
                <el-button plain>生命期</el-button>
              </el-button-group> <!-- 修复：将</el-button>改为</el-button-group> -->
              <el-date-picker v-model="dateRange" type="date" placeholder="选择日期" size="small" />
            </div>
            <div id="energyChart" class="chart-content"></div>
            <div class="chart-total">1.09 万度</div>
          </div>
          <!-- 收益趋势图 -->
          <div class="chart-card">
            <div class="chart-header">
              <span>收益趋势</span>
              <el-button-group size="small">
                <el-button type="primary" plain>月</el-button>
                <el-button plain>年</el-button>
                <el-button plain>生命期</el-button>
              </el-button-group> <!-- 修复：同样改为正确的闭合标签 -->
              <el-date-picker v-model="monthRange" type="month" placeholder="选择月份" size="small" />
            </div>
            <div id="profitChart" class="chart-content"></div>
            <div class="chart-total">3.28 万元</div>
          </div>
        </div>
      </div>

      <!-- 社会贡献区 -->
      <div class="social-contribution">
        <div class="contribution-title">社会贡献</div>
        <div class="contribution-items">
          <div class="contribution-item">
            <el-icon class="item-icon"><Leaf /></el-icon>
            <div class="item-value">2,105.66<span class="item-unit">kg</span></div>
            <div class="item-label">节约标准煤</div>
          </div>
          <div class="contribution-item">
            <el-icon class="item-icon"><CirclePlus /></el-icon>
            <div class="item-value">2,500.48<span class="item-unit">kg</span></div>
            <div class="item-label">CO₂减排量</div>
          </div>
          <div class="contribution-item">
            <el-icon class="item-icon"><Tree /></el-icon>
            <div class="item-value">3,416<span class="item-unit">棵</span></div>
            <div class="item-label">等效植树量</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'

// 响应式数据
const selectedCompany = ref('company1')
const stationSearch = ref('')
const stationTreeData = ref([
  {
    label: '裕同2000KW光伏发电',
    children: []
  },
  {
    label: '欧菲光1000KW光伏电站',
    children: []
  }
])
const treeProps = ref({
  label: 'label'
})
const activeTab = ref('1')
const dateRange = ref('2026-03-12')
const monthRange = ref('2026-03')

// 电站切换事件
const handleStationChange = (data) => {
  console.log('选中电站：', data.label)
}

// 初始化图表
onMounted(() => {
  // 1. 设备拓扑图
  const topologyChart = echarts.init(document.getElementById('topologyChart'))
  topologyChart.setOption({
    backgroundColor: 'transparent',
    graphic: [
      // 电网图标
      {
        type: 'image',
        left: '15%',
        top: '50%',
        width: 60,
        height: 60,
        style: {
          image: 'https://img.icons8.com/fluency/96/000000/power-grid.png',
          borderRadius: '50%'
        }
      },
      // 逆变器图标
      {
        type: 'image',
        left: '50%',
        top: '50%',
        width: 60,
        height: 60,
        style: {
          image: 'https://img.icons8.com/fluency/96/000000/inverter.png',
          borderRadius: '8px'
        }
      },
      // 光伏板图标
      {
        type: 'image',
        left: '85%',
        top: '50%',
        width: 60,
        height: 60,
        style: {
          image: 'https://img.icons8.com/fluency/96/000000/solar-panel.png',
          borderRadius: '8px'
        }
      },
      // 连接线1（电网→逆变器）
      {
        type: 'line',
        shape: {
          x1: '22%', y1: '50%', x2: '45%', y2: '50%'
        },
        style: {
          stroke: '#ccc',
          lineWidth: 2,
          lineDash: [5, 5]
        }
      },
      // 连接线2（逆变器→光伏）
      {
        type: 'line',
        shape: {
          x1: '55%', y1: '50%', x2: '78%', y2: '50%'
        },
        style: {
          stroke: '#ccc',
          lineWidth: 2,
          lineDash: [5, 5]
        }
      },
      // 文字标注
      {
        type: 'text',
        left: '15%',
        top: '30%',
        style: {
          text: '电网',
          fontSize: 14,
          fill: '#666'
        }
      },
      {
        type: 'text',
        left: '50%',
        top: '30%',
        style: {
          text: '逆变器',
          fontSize: 14,
          fill: '#666'
        }
      },
      {
        type: 'text',
        left: '85%',
        top: '30%',
        style: {
          text: '光伏',
          fontSize: 14,
          fill: '#666'
        }
      },
      {
        type: 'text',
        left: '50%',
        top: '70%',
        style: {
          text: '0.000kW 输出功率',
          fontSize: 12,
          fill: '#999'
        }
      }
    ]
  })

  // 2. 能量趋势折线图
  const energyChart = echarts.init(document.getElementById('energyChart'))
  energyChart.setOption({
    backgroundColor: 'transparent',
    grid: { left: '3%', right: '4%', top: '10%', bottom: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['00:00', '01:20', '02:40', '04:00', '05:20', '06:40', '08:00', '09:20', '10:40', '12:00', '13:20', '14:40', '16:00', '17:20', '18:40', '20:00', '21:20', '22:40'],
      axisLine: { lineStyle: { color: '#e6e6e6' } },
      axisLabel: { fontSize: 12, color: '#999' }
    },
    yAxis: {
      type: 'value',
      max: 1.75,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#f0f0f0' } },
      axisLabel: { fontSize: 12, color: '#999' }
    },
    series: [{
      name: '光伏发电功率',
      type: 'line',
      data: [0, 0, 0, 0, 0.1, 0.5, 1.0, 1.4, 1.6, 1.7, 1.65, 1.5, 1.2, 0.8, 0.4, 0.1, 0, 0],
      smooth: true,
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
          offset: 0, color: 'rgba(143, 223, 219, 0.5)'
        }, {
          offset: 1, color: 'rgba(143, 223, 219, 0)'
        }])
      },
      lineStyle: { color: '#8fdfdb', width: 2 },
      itemStyle: { color: '#8fdfdb' },
      symbol: 'none'
    }],
    tooltip: {
      trigger: 'axis',
      textStyle: { fontSize: 12 }
    }
  })

  // 3. 收益趋势柱状图
  const profitChart = echarts.init(document.getElementById('profitChart'))
  profitChart.setOption({
    backgroundColor: 'transparent',
    grid: { left: '3%', right: '4%', top: '10%', bottom: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: Array.from({ length: 31 }, (_, i) => i + 1),
      axisLine: { lineStyle: { color: '#e6e6e6' } },
      axisLabel: { fontSize: 12, color: '#999' }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#f0f0f0' } },
      axisLabel: { fontSize: 12, color: '#999' }
    },
    series: [{
      name: '收益',
      type: 'bar',
      data: [1000, 800, 1500, 2000, 3000, 4000, 4500, 4200, 3800, 3500, 4000, 4800, 4500, 4000, 3500, 3000, 3800, 4200, 4500, 4000, 3500, 3000, 2500, 2000, 1500, 2000, 2500, 3000, 2800, 2500, 2000],
      itemStyle: { color: '#9c27b0' },
      barWidth: '60%'
    }],
    tooltip: {
      trigger: 'axis',
      textStyle: { fontSize: 12 }
    }
  })

  // 自适应窗口大小
  window.addEventListener('resize', () => {
    topologyChart.resize()
    energyChart.resize()
    profitChart.resize()
  })
})
</script>

<style scoped>
/* 全局布局 */
.solar-monitor {
  display: flex;
  width: 100%;
  height: 100vh;
  background-color: #f9f9f9;
}

/* 左侧侧边栏 */
.sidebar {
  width: 240px;
  background-color: #fff;
  border-right: 1px solid #e6e6e6;
  padding: 15px;
  display: flex;
  flex-direction: column;
}
.sidebar-header .logo {
  font-size: 18px;
  font-weight: bold;
  color: #1976d2;
  display: block;
  margin-bottom: 20px;
}
.company-select {
  margin-bottom: 20px;
}
.station-list {
  flex: 1;
  overflow-y: auto;
}

/* 右侧主内容 */
.main-content {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
}

/* 顶部导航 */
.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e6e6e6;
}
.nav-left {
  display: flex;
  align-items: center;
}
.station-title {
  font-size: 16px;
  font-weight: bold;
  margin-right: 20px;
  color: #333;
}
.nav-menu {
  border-bottom: none !important;
}
.nav-right {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #666;
  font-size: 12px;
}
.icon {
  cursor: pointer;
  color: #666;
}
.back-btn {
  color: #1976d2 !important;
}

/* 数据卡片 */
.data-cards {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}
.data-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
.card-value {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}
.unit {
  font-size: 14px;
  color: #999;
  margin-left: 5px;
}
.card-label {
  font-size: 12px;
  color: #999;
}

/* 告警标签 */
.alert-tags {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
.tag-num {
  background-color: #fff;
  border-radius: 10px;
  padding: 0 6px;
  margin-left: 5px;
  color: #666;
}

/* 中间内容区 */
.middle-content {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  height: 400px;
}
.topology-container {
  flex: 1;
  background-color: #fff;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
.topology-chart {
  width: 100%;
  height: 100%;
}
.charts-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.chart-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  flex: 1;
  display: flex;
  flex-direction: column;
}
.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: bold;
  color: #333;
}
.chart-content {
  flex: 1;
  width: 100%;
}
.chart-total {
  text-align: right;
  font-size: 12px;
  color: #666;
  margin-top: 5px;
}

/* 社会贡献 */
.social-contribution {
  background-color: #fff;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
.contribution-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
}
.contribution-items {
  display: flex;
  justify-content: space-around;
  text-align: center;
}
.contribution-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}
.item-icon {
  font-size: 24px;
  color: #4caf50;
  margin-bottom: 5px;
}
.item-value {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}
.item-unit {
  font-size: 12px;
  color: #999;
  margin-left: 5px;
}
.item-label {
  font-size: 12px;
  color: #999;
}

/* 滚动条优化 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-thumb {
  border-radius: 3px;
  background-color: #ccc;
}
::-webkit-scrollbar-track {
  background-color: #f5f5f5;
}
</style>