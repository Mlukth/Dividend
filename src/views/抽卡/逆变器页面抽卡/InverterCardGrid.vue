<template>
  <div class="inverter-card-grid-container">
    <!-- 顶部电站信息栏 -->
    <div class="station-header">
      <div class="station-info">
        <div class="breadcrumb">
          <span class="breadcrumb-item">电站管理</span>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-item active">{{ stationName }}</span>
        </div>
        <div class="station-main">
          <div class="station-title">
            <h1 class="station-name">{{ stationName }}</h1>
            <span class="station-code">电站编号：{{ stationCode }}</span>
          </div>
          <div class="station-meta">
            <div class="meta-item">
              <span class="meta-icon">📍</span>
              <span class="meta-text">{{ stationAddress }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-icon">📅</span>
              <span class="meta-text">投产时间：{{ formatDate(stationCommissioningTime) }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="header-actions">
        <button class="btn btn-outline" @click="toggleViewMode" :class="{ active: viewMode === 'card' }">
          <span class="btn-icon">{{ viewMode === 'card' ? '📱' : '📊' }}</span>
          {{ viewMode === 'card' ? '卡片视图' : '表格视图' }}
        </button>
        <button class="btn btn-outline" @click="exportData">
          <span class="btn-icon">📥</span>
          导出数据
        </button>
        <button class="btn btn-primary" @click="refreshAll">
          <span class="btn-icon">🔄</span>
          刷新数据
        </button>
      </div>
    </div>

    <!-- 顶部统计卡片 -->
    <div class="stats-section">
      <div class="stat-card stat-primary">
        <div class="stat-icon">🔌</div>
        <div class="stat-content">
          <div class="stat-label">逆变器总数</div>
          <div class="stat-value">{{ totalInverters }}</div>
          <div class="stat-sub">台设备</div>
        </div>
      </div>
      <div class="stat-card stat-success">
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <div class="stat-label">运行中</div>
          <div class="stat-value">{{ runningCount }}</div>
          <div class="stat-sub">{{ ((runningCount / totalInverters) * 100).toFixed(1) }}%</div>
        </div>
      </div>
      <div class="stat-card stat-warning">
        <div class="stat-icon">⚠️</div>
        <div class="stat-content">
          <div class="stat-label">故障</div>
          <div class="stat-value">{{ faultCount }}</div>
          <div class="stat-sub">需处理</div>
        </div>
      </div>
      <div class="stat-card stat-info">
        <div class="stat-icon">⏸️</div>
        <div class="stat-content">
          <div class="stat-label">停机</div>
          <div class="stat-value">{{ stoppedCount }}</div>
          <div class="stat-sub">暂时停运</div>
        </div>
      </div>
      <div class="stat-card stat-energy">
        <div class="stat-icon">⚡</div>
        <div class="stat-content">
          <div class="stat-label">实时总功率</div>
          <div class="stat-value">{{ formatNumber(totalRealPower) }} <span class="unit">kW</span></div>
          <div class="stat-sub">利用率 {{ totalUtilizationRate }}%</div>
        </div>
      </div>
      <div class="stat-card stat-energy-dark">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <div class="stat-label">当日总发电</div>
          <div class="stat-value">{{ formatNumber(totalDailyEnergy) }} <span class="unit">kWh</span></div>
          <div class="stat-sub">完成率 {{ dailyCompletionRate }}%</div>
        </div>
      </div>
    </div>

    <!-- 筛选和搜索区 -->
    <div class="filter-section">
      <div class="filter-left">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input
            type="text"
            v-model="searchKeyword"
            placeholder="搜索逆变器名称、SN编号..."
            class="search-input"
          />
        </div>
        <div class="filter-group">
          <button 
            class="filter-chip" 
            :class="{ active: filterStatus === '' }"
            @click="filterStatus = ''"
          >
            全部状态
          </button>
          <button 
            class="filter-chip chip-success" 
            :class="{ active: filterStatus === 'running' }"
            @click="filterStatus = 'running'"
          >
            运行中
          </button>
          <button 
            class="filter-chip chip-warning" 
            :class="{ active: filterStatus === 'fault' }"
            @click="filterStatus = 'fault'"
          >
            故障
          </button>
          <button 
            class="filter-chip chip-info" 
            :class="{ active: filterStatus === 'stopped' }"
            @click="filterStatus = 'stopped'"
          >
            已停机
          </button>
        </div>
        <div class="filter-group">
          <select v-model="filterModel" class="filter-select">
            <option value="">全部型号</option>
            <option v-for="model in uniqueModels" :key="model" :value="model">
              {{ model }}
            </option>
          </select>
          <select v-model="filterArea" class="filter-select">
            <option value="">全部区域</option>
            <option v-for="area in uniqueAreas" :key="area" :value="area">
              {{ area }}
            </option>
          </select>
        </div>
        <div class="sort-group">
          <button class="sort-btn" :class="{ active: sortBy === 'power' }" @click="setSort('power')">
            按功率
            <span v-if="sortBy === 'power'" class="sort-icon">{{ sortOrder === 'desc' ? '↓' : '↑' }}</span>
          </button>
          <button class="sort-btn" :class="{ active: sortBy === 'energy' }" @click="setSort('energy')">
            按电量
            <span v-if="sortBy === 'energy'" class="sort-icon">{{ sortOrder === 'desc' ? '↓' : '↑' }}</span>
          </button>
          <button class="sort-btn" :class="{ active: sortBy === 'status' }" @click="setSort('status')">
            按状态
            <span v-if="sortBy === 'status'" class="sort-icon">{{ sortOrder === 'desc' ? '↓' : '↑' }}</span>
          </button>
        </div>
      </div>
      <div class="filter-right">
        <div class="view-controls">
          <span class="view-label">排列方式：</span>
          <button 
            class="layout-btn" 
            :class="{ active: layoutMode === 'grid' }"
            @click="layoutMode = 'grid'"
            title="网格视图"
          >
            ⊞
          </button>
          <button 
            class="layout-btn" 
            :class="{ active: layoutMode === 'list' }"
            @click="layoutMode = 'list'"
            title="列表视图"
          </button>
        </div>
        <div class="density-controls">
          <span class="density-label">卡片大小：</span>
          <button 
            class="density-btn" 
            :class="{ active: cardSize === 'large' }"
            @click="cardSize = 'large'"
          >
            大
          </button>
          <button 
            class="density-btn" 
            :class="{ active: cardSize === 'medium' }"
            @click="cardSize = 'medium'"
          >
            中
          </button>
          <button 
            class="density-btn" 
            :class="{ active: cardSize === 'small' }"
            @click="cardSize = 'small'"
          >
            小
          </button>
        </div>
      </div>
    </div>

    <!-- 批量操作栏 -->
    <transition name="slide-down">
      <div v-if="selectedInverters.length > 0" class="batch-bar">
        <div class="batch-info">
          <span class="batch-check">✓</span>
          <span>已选择 <strong>{{ selectedInverters.length }}</strong> 台设备</span>
        </div>
        <div class="batch-actions">
          <button class="batch-btn batch-start" @click="batchAction('start')">
            <span class="btn-icon">▶️</span>
            批量启动
          </button>
          <button class="batch-btn batch-stop" @click="batchAction('stop')">
            <span class="btn-icon">⏸️</span>
            批量停机
          </button>
          <button class="batch-btn batch-refresh" @click="batchAction('refresh')">
            <span class="btn-icon">🔄</span>
            批量刷新
          </button>
          <button class="batch-btn batch-cancel" @click="clearSelection">
            取消选择
          </button>
        </div>
      </div>
    </transition>

    <!-- 结果统计 -->
    <div class="result-summary">
      <span class="summary-text">找到 <strong>{{ filteredInverters.length }}</strong> 台设备</span>
      <span class="summary-divider">|</span>
      <span class="summary-text">运行中 <strong class="text-success">{{ filteredRunningCount }}</strong> 台</span>
      <span class="summary-divider">|</span>
      <span class="summary-text">故障 <strong class="text-warning">{{ filteredFaultCount }}</strong> 台</span>
      <span class="summary-divider">|</span>
      <span class="summary-text">停机 <strong class="text-info">{{ filteredStoppedCount }}</strong> 台</span>
    </div>

    <!-- 设备卡片网格 -->
    <div class="cards-container" :class="[layoutMode, `size-${cardSize}`]">
      <div
        v-for="inverter in paginatedInverters"
        :key="inverter.id"
        class="inverter-card"
        :class="{
          'card-selected': isSelected(inverter.id),
          'card-fault': inverter.status === 'fault',
          'card-stopped': inverter.status === 'stopped'
        }"
        @click="handleCardClick(inverter)"
      >
        <!-- 卡片选择框 -->
        <div class="card-checkbox" @click.stop="toggleSelect(inverter.id)">
          <input
            type="checkbox"
            :checked="isSelected(inverter.id)"
            class="checkbox-input"
          />
        </div>

        <!-- 优化后的设备模型 -->
        <div class="device-model-container">
          <div 
            class="device-model-3d"
            :class="[
              `status-${inverter.status}`,
              { 'model-large': cardSize === 'large' }
            ]"
          >
            <!-- 设备主体 -->
            <div class="device-body">
              <!-- 顶部状态灯带 -->
              <div class="device-light-strip">
                <div class="light-dot" v-for="i in 8" :key="i"></div>
              </div>
              
              <!-- 显示屏 -->
              <div class="device-screen">
                <div class="screen-glow" :class="`glow-${inverter.status}`"></div>
                <div class="screen-content">
                  <div class="screen-power">
                    <span class="screen-value">{{ inverter.realTimePower.toFixed(1) }}</span>
                    <span class="screen-unit">kW</span>
                  </div>
                  <div class="screen-status" :class="`status-${inverter.status}`">
                    {{ statusText(inverter.status) }}
                  </div>
                </div>
              </div>

              <!-- 散热孔 -->
              <div class="device-vents">
                <div class="vent-row" v-for="i in 3" :key="i">
                  <div class="vent-hole" v-for="j in 6" :key="j"></div>
                </div>
              </div>

              <!-- 底部连接器 -->
              <div class="device-connectors">
                <div class="connector" v-for="i in 4" :key="i"></div>
              </div>

              <!-- 装饰线条 -->
              <div class="device-decor-line decor-top"></div>
              <div class="device-decor-line decor-bottom"></div>
            </div>

            <!-- 阴影 -->
            <div class="device-shadow"></div>

            <!-- 功率波形动画 -->
            <div class="power-wave" v-if="inverter.status === 'running'">
              <div class="wave-bar" v-for="i in 5" :key="i" :style="{ animationDelay: `${i * 0.1}s` }"></div>
            </div>
          </div>
        </div>

        <!-- 卡片内容 -->
        <div class="card-content">
          <!-- 设备名称和型号 -->
          <div class="card-header-content">
            <div class="card-title-row">
              <h3 class="card-title">{{ inverter.name }}</h3>
              <span class="card-status-badge" :class="`badge-${inverter.status}`">
                <span class="badge-dot"></span>
                {{ statusText(inverter.status) }}
              </span>
            </div>
            <div class="card-subtitle">{{ inverter.model }}</div>
            <div class="card-sn">SN: {{ inverter.sn }}</div>
          </div>

          <!-- 关键指标 -->
          <div class="card-metrics">
            <div class="metric-group">
              <div class="metric-item metric-primary">
                <div class="metric-label">实时功率</div>
                <div class="metric-value">
                  {{ inverter.realTimePower.toFixed(1) }}
                  <span class="metric-unit">kW</span>
                </div>
                <div class="metric-trend" :class="getTrendClass(inverter.powerTrend)">
                  {{ inverter.powerTrend >= 0 ? '↑' : '↓' }} {{ Math.abs(inverter.powerTrend).toFixed(1) }}%
                </div>
              </div>
              <div class="metric-item metric-success">
                <div class="metric-label">当日电量</div>
                <div class="metric-value">
                  {{ inverter.dailyEnergy.toFixed(0) }}
                  <span class="metric-unit">kWh</span>
                </div>
                <div class="metric-progress">
                  <div 
                    class="progress-bar" 
                    :style="{ width: Math.min(100, (inverter.dailyEnergy / dailyTargetPerInverter) * 100) + '%' }"
                  ></div>
                </div>
              </div>
            </div>

            <!-- 利用率 -->
            <div class="utilization-section">
              <div class="utilization-header">
                <span class="utilization-label">利用率</span>
                <span class="utilization-value" :class="getUtilizationClass(inverter.utilizationRate)">
                  {{ inverter.utilizationRate.toFixed(1) }}%
                </span>
              </div>
              <div class="utilization-bar">
                <div 
                  class="utilization-fill" 
                  :class="getUtilizationClass(inverter.utilizationRate)"
                  :style="{ width: inverter.utilizationRate + '%' }"
                ></div>
              </div>
            </div>

            <!-- 额定功率和等效小时 -->
            <div class="metric-row">
              <div class="mini-metric">
                <span class="mini-label">额定</span>
                <span class="mini-value">{{ inverter.ratedPower }} kW</span>
              </div>
              <div class="mini-metric">
                <span class="mini-label">等效小时</span>
                <span class="mini-value">{{ inverter.equivalentHours.toFixed(1) }} h</span>
              </div>
            </div>
          </div>

          <!-- 位置和时间信息 -->
          <div class="card-meta">
            <div class="meta-row">
              <span class="meta-icon">📍</span>
              <span class="meta-text">{{ inverter.area }}</span>
            </div>
            <div class="meta-row">
              <span class="meta-icon">📅</span>
              <span class="meta-text">投产: {{ formatDate(inverter.commissioningTime) }}</span>
            </div>
            <div class="meta-row" :class="getWarrantyClass(inverter.warrantyExpiration)">
              <span class="meta-icon">🛡️</span>
              <span class="meta-text">质保: {{ formatDate(inverter.warrantyExpiration) }}</span>
            </div>
          </div>

          <!-- 卡片操作按钮 -->
          <div class="card-actions">
            <button class="action-btn action-detail" @click.stop="viewDetail(inverter)" title="查看详情">
              <span>📋</span>
              <span>详情</span>
            </button>
            <button class="action-btn action-chart" @click.stop="showChart(inverter)" title="查看图表">
              <span>📈</span>
              <span>图表</span>
            </button>
            <button 
              class="action-btn action-control" 
              @click.stop="controlDevice(inverter)"
              :title="inverter.status === 'stopped' ? '启动设备' : '停机'"
            >
              <span>{{ inverter.status === 'stopped' ? '▶️' : '⏸️' }}</span>
              <span>{{ inverter.status === 'stopped' ? '启动' : '停机' }}</span>
            </button>
            <button class="action-btn action-refresh" @click.stop="refreshSingle(inverter)" title="刷新数据">
              <span>🔄</span>
              <span>刷新</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredInverters.length === 0" class="empty-grid">
        <div class="empty-icon">🔍</div>
        <div class="empty-title">没有找到匹配的设备</div>
        <div class="empty-desc">尝试调整筛选条件或搜索关键词</div>
        <button class="empty-btn" @click="resetFilters">
          清除所有筛选
        </button>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination-section">
      <div class="pagination-left">
        <span class="pagination-info">
          显示 {{ paginationStart }} - {{ paginationEnd }} / 共 {{ filteredInverters.length }} 条
        </span>
        <select v-model="pageSize" class="page-size-select">
          <option :value="12">12条/页</option>
          <option :value="24">24条/页</option>
          <option :value="48">48条/页</option>
          <option :value="96">96条/页</option>
        </select>
      </div>
      <div class="pagination-controls">
        <button 
          class="page-btn page-prev" 
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          上一页
        </button>
        <button
          v-for="page in visiblePages"
          :key="page"
          class="page-btn"
          :class="{ active: page === currentPage, ellipsis: page === '...' }"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>
        <button 
          class="page-btn page-next" 
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          下一页
        </button>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'

// ==================== 电站信息 ====================
const stationName = ref('青岛蓝村镇100MW光伏电站')
const stationCode = ref('ST-QD-2023-001')
const stationAddress = ref('山东省青岛市即墨区蓝村镇')
const stationCommissioningTime = ref(new Date('2023-06-15').getTime())

// ==================== 视图控制 ====================
const viewMode = ref('card') // card, table
const layoutMode = ref('grid') // grid, list
const cardSize = ref('medium') // large, medium, small

// ==================== 逆变器数据 ====================
const inverters = ref([])

// 模拟生成逆变器数据
const generateInverters = () => {
  const models = ['SUN-50KTL-M1', 'SUN-60KTL-M2', 'SUN-100KTL-M3', 'SUN-120KTL-M4']
  const areas = ['A区1号方阵', 'A区2号方阵', 'A区3号方阵', 'B区1号方阵', 'B区2号方阵', 'C区1号方阵']
  const statuses = ['running', 'running', 'running', 'fault', 'stopped']
  
  const data = []
  for (let i = 1; i <= 48; i++) {
    const modelIndex = Math.floor(Math.random() * models.length)
    const areaIndex = Math.floor(Math.random() * areas.length)
    const statusIndex = Math.floor(Math.random() * statuses.length)
    
    const ratedPower = parseInt(models[modelIndex].match(/\d+/)[0])
    const utilizationRate = Math.random() * 40 + 60
    
    data.push({
      id: `INV-${i}`,
      name: `${areas[areaIndex]}-逆变器${String(i).padStart(2, '0')}`,
      sn: `INV-2024-03-${String(i).padStart(4, '0')}`,
      model: models[modelIndex],
      area: areas[areaIndex],
      status: statuses[statusIndex],
      ratedPower: ratedPower,
      realTimePower: statuses[statusIndex] === 'stopped' ? 0 : ratedPower * (utilizationRate / 100),
      powerTrend: statuses[statusIndex] === 'stopped' ? 0 : (Math.random() - 0.5) * 20,
      utilizationRate: statuses[statusIndex] === 'stopped' ? 0 : utilizationRate,
      dailyEnergy: statuses[statusIndex] === 'stopped' ? 0 : Math.random() * 300 + 150,
      cumulativeEnergy: Math.random() * 200000 + 50000,
      equivalentHours: statuses[statusIndex] === 'stopped' ? 0 : Math.random() * 6 + 2,
      commissioningTime: new Date('2023-' + String(Math.floor(Math.random() * 12) + 1).padStart(2, '0') + '-' + String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')).getTime(),
      warrantyExpiration: new Date('2033-' + String(Math.floor(Math.random() * 12) + 1).padStart(2, '0') + '-' + String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')).getTime()
    })
  }
  
  return data.sort((a, b) => {
    if (a.area !== b.area) return a.area.localeCompare(b.area)
    return a.name.localeCompare(b.name)
  })
}

// ==================== 统计数据 ====================
const totalInverters = computed(() => inverters.value.length)
const runningCount = computed(() => inverters.value.filter(i => i.status === 'running').length)
const faultCount = computed(() => inverters.value.filter(i => i.status === 'fault').length)
const stoppedCount = computed(() => inverters.value.filter(i => i.status === 'stopped').length)

const totalRealPower = computed(() => inverters.value.reduce((sum, i) => sum + i.realTimePower, 0))
const totalRatedPower = computed(() => inverters.value.reduce((sum, i) => sum + i.ratedPower, 0))
const totalUtilizationRate = computed(() => {
  if (totalRatedPower.value === 0) return 0
  return ((totalRealPower.value / totalRatedPower.value) * 100).toFixed(1)
})

const totalDailyEnergy = computed(() => inverters.value.reduce((sum, i) => sum + i.dailyEnergy, 0))
const dailyTarget = ref(12000)
const dailyCompletionRate = computed(() => {
  if (dailyTarget.value === 0) return 0
  return ((totalDailyEnergy.value / dailyTarget.value) * 100).toFixed(1)
})

const dailyTargetPerInverter = computed(() => dailyTarget.value / totalInverters.value)

// ==================== 筛选数据统计 ====================
const filteredRunningCount = computed(() => filteredInverters.value.filter(i => i.status === 'running').length)
const filteredFaultCount = computed(() => filteredInverters.value.filter(i => i.status === 'fault').length)
const filteredStoppedCount = computed(() => filteredInverters.value.filter(i => i.status === 'stopped').length)

// ==================== 筛选和搜索 ====================
const searchKeyword = ref('')
const filterStatus = ref('')
const filterModel = ref('')
const filterArea = ref('')
const sortBy = ref('power')
const sortOrder = ref('desc')

const uniqueModels = computed(() => [...new Set(inverters.value.map(i => i.model))].sort())
const uniqueAreas = computed(() => [...new Set(inverters.value.map(i => i.area))].sort())

const filteredInverters = computed(() => {
  let result = [...inverters.value]
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(i => 
      i.name.toLowerCase().includes(keyword) ||
      i.sn.toLowerCase().includes(keyword)
    )
  }
  
  if (filterStatus.value) {
    result = result.filter(i => i.status === filterStatus.value)
  }
  
  if (filterModel.value) {
    result = result.filter(i => i.model === filterModel.value)
  }
  
  if (filterArea.value) {
    result = result.filter(i => i.area === filterArea.value)
  }
  
  if (sortBy.value) {
    result.sort((a, b) => {
      let valueA, valueB
      switch (sortBy.value) {
        case 'power':
          valueA = a.realTimePower
          valueB = b.realTimePower
          break
        case 'energy':
          valueA = a.dailyEnergy
          valueB = b.dailyEnergy
          break
        case 'status':
          const statusOrder = { 'fault': 0, 'stopped': 1, 'running': 2 }
          valueA = statusOrder[a.status]
          valueB = statusOrder[b.status]
          break
      }
      
      return sortOrder.value === 'desc' ? valueB - valueA : valueA - valueB
    })
  }
  
  return result
})

// ==================== 分页 ====================
const currentPage = ref(1)
const pageSize = ref(24)

const totalPages = computed(() => Math.ceil(filteredInverters.value.length / pageSize.value))
const paginationStart = computed(() => (currentPage.value - 1) * pageSize.value + 1)
const paginationEnd = computed(() => Math.min(currentPage.value * pageSize.value, filteredInverters.value.length))

const paginatedInverters = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredInverters.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value
  
  let startPage = Math.max(1, current - 2)
  let endPage = Math.min(total, current + 2)
  
  if (startPage > 1) pages.push(1)
  if (startPage > 2) pages.push('...')
  
  for (let i = startPage; i <= endPage; i++) pages.push(i)
  
  if (endPage < total - 1) pages.push('...')
  if (endPage < total) pages.push(total)
  
  return pages
})

// ==================== 选择相关 ====================
const selectedInverters = ref([])

const isSelected = (id) => selectedInverters.value.includes(id)

const toggleSelect = (id) => {
  const index = selectedInverters.value.indexOf(id)
  if (index > -1) {
    selectedInverters.value.splice(index, 1)
  } else {
    selectedInverters.value.push(id)
  }
}

const clearSelection = () => {
  selectedInverters.value = []
}

// ==================== 操作 ====================
const viewDetail = (inverter) => {
  showToast(`正在打开 ${inverter.name} 详情页...`)
  // 跳转到详情页
}

const showChart = (inverter) => {
  showToast(`正在打开 ${inverter.name} 图表...`)
  // 打开图表弹窗
}

const controlDevice = (inverter) => {
  const newStatus = inverter.status === 'stopped' ? 'running' : 'stopped'
  const action = newStatus === 'running' ? '启动' : '停机'
  
  showToast(`${action} ${inverter.name} 中...`, 'info')
  setTimeout(() => {
    inverter.status = newStatus
    if (newStatus === 'running') {
      inverter.realTimePower = inverter.ratedPower * 0.8
      inverter.utilizationRate = 80
    } else {
      inverter.realTimePower = 0
      inverter.utilizationRate = 0
    }
    showToast(`${action}成功`)
  }, 1000)
}

const refreshSingle = (inverter) => {
  inverter.realTimePower = inverter.ratedPower * (Math.random() * 0.3 + 0.7)
  inverter.utilizationRate = (inverter.realTimePower / inverter.ratedPower) * 100
  inverter.powerTrend = (Math.random() - 0.5) * 20
  showToast(`已刷新 ${inverter.name}`)
}

const handleCardClick = (inverter) => {
  // 可以在卡片上点击跳转到详情
}

const batchAction = (action) => {
  const actionText = {
    'start': '启动',
    'stop': '停机',
    'refresh': '刷新'
  }[action]
  
  showToast(`正在${actionText} ${selectedInverters.value.length} 台设备...`, 'info')
  setTimeout(() => {
    selectedInverters.value.forEach(id => {
      const inverter = inverters.value.find(i => i.id === id)
      if (!inverter) return
      
      if (action === 'start') {
        inverter.status = 'running'
        inverter.realTimePower = inverter.ratedPower * 0.8
        inverter.utilizationRate = 80
      } else if (action === 'stop') {
        inverter.status = 'stopped'
        inverter.realTimePower = 0
        inverter.utilizationRate = 0
      } else if (action === 'refresh') {
        inverter.realTimePower = inverter.ratedPower * (Math.random() * 0.3 + 0.7)
        inverter.utilizationRate = (inverter.realTimePower / inverter.ratedPower) * 100
        inverter.powerTrend = (Math.random() - 0.5) * 20
      }
    })
    showToast(`${actionText}完成`)
    clearSelection()
  }, 1500)
}

const refreshAll = () => {
  showToast('正在刷新所有数据...', 'info')
  setTimeout(() => {
    inverters.value.forEach(inverter => {
      if (inverter.status === 'running') {
        inverter.realTimePower = inverter.ratedPower * (Math.random() * 0.3 + 0.7)
        inverter.utilizationRate = (inverter.realTimePower / inverter.ratedPower) * 100
        inverter.powerTrend = (Math.random() - 0.5) * 20
      }
    })
    showToast('数据刷新完成')
  }, 1000)
}

const exportData = () => {
  showToast('正在导出数据...', 'info')
  setTimeout(() => {
    showToast('数据导出成功')
  }, 2000)
}

const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'card' ? 'table' : 'card'
}

// ==================== 排序 ====================
const setSort = (type) => {
  if (sortBy.value === type) {
    sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
  } else {
    sortBy.value = type
    sortOrder.value = 'desc'
  }
}

const resetFilters = () => {
  searchKeyword.value = ''
  filterStatus.value = ''
  filterModel.value = ''
  filterArea.value = ''
  sortBy.value = 'power'
  sortOrder.value = 'desc'
  currentPage.value = 1
}

const goToPage = (page) => {
  if (typeof page === 'number' && page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// ==================== 工具函数 ====================
const statusText = (status) => {
  const map = { running: '运行中', fault: '故障', stopped: '已停机' }
  return map[status] || status
}

const getTrendClass = (trend) => {
  return trend >= 0 ? 'trend-up' : 'trend-down'
}

const getUtilizationClass = (rate) => {
  if (rate >= 90) return 'util-high'
  if (rate >= 70) return 'util-medium'
  return 'util-low'
}

const getWarrantyClass = (expiration) => {
  const daysLeft = Math.ceil((expiration - Date.now()) / (1000 * 60 * 60 * 24))
  if (daysLeft > 365) return ''
  if (daysLeft > 90) return 'text-warning'
  return 'text-danger'
}

const formatNumber = (num) => num.toFixed(1)

const formatDate = (timestamp) => {
  if (!timestamp) return '-'
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// ==================== Toast ====================
const toast = ref({ show: false, type: 'success', icon: '✓', message: '' })

const showToast = (message, type = 'success') => {
  const iconMap = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' }
  toast.value = { show: true, type, icon: iconMap[type], message }
  setTimeout(() => toast.value.show = false, 3000)
}

// ==================== 生命周期 ====================
onMounted(() => {
  inverters.value = generateInverters()
  
  setInterval(() => {
    const refreshCount = Math.floor(Math.random() * 5) + 1
    for (let i = 0; i < refreshCount; i++) {
      const idx = Math.floor(Math.random() * inverters.value.length)
      const inv = inverters.value[idx]
      if (inv && inv.status === 'running') {
        inv.realTimePower = inv.ratedPower * (Math.random() * 0.1 + 0.85)
        inv.utilizationRate = (inv.realTimePower / inv.ratedPower) * 100
        inv.powerTrend = (Math.random() - 0.5) * 5
      }
    }
  }, 30000)
})
</script>

<style scoped>
/* ==================== 基础样式 ==================== */
.inverter-card-grid-container {
  min-height: calc(100vh - 60px);
  background: #F5F7FA;
  color: #1D2129;
  padding: 20px;
}

/* ==================== 电站信息栏 ==================== */
.station-header {
  background: #FFFFFF;
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.station-info {
  flex: 1;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 13px;
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

.station-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.station-title {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.station-name {
  font-size: 22px;
  font-weight: 600;
  color: #1D2129;
  margin: 0;
}

.station-code {
  font-size: 13px;
  color: #86909C;
  font-family: 'Courier New', monospace;
}

.station-meta {
  display: flex;
  gap: 24px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #4E5969;
}

.meta-icon {
  font-size: 16px;
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
  background: #FFFFFF;
}

.btn:hover {
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

.btn.active {
  background: #0066CC;
  color: #FFFFFF;
  border-color: #0066CC;
}

/* ==================== 统计卡片 ==================== */
.stats-section {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  background: #FFFFFF;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  font-size: 32px;
  flex-shrink: 0;
  background: linear-gradient(135deg, #0066CC 0%, #165DFF 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stat-card.stat-success .stat-icon {
  background: linear-gradient(135deg, #00B42A 0%, #00C975 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stat-card.stat-warning .stat-icon {
  background: linear-gradient(135deg, #FF7D00 0%, #FFA94D 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stat-card.stat-info .stat-icon {
  background: linear-gradient(135deg, #86909C 0%, #C9CDD4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stat-card.stat-energy .stat-icon {
  background: linear-gradient(135deg, #722ED1 0%, #9254DE 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stat-card.stat-energy-dark .stat-icon {
  background: linear-gradient(135deg, #0F9D58 0%, #34A853 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 12px;
  color: #86909C;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #1D2129;
  line-height: 1.2;
}

.stat-value .unit {
  font-size: 14px;
  font-weight: 400;
  color: #86909C;
  margin-left: 2px;
}

.stat-sub {
  font-size: 11px;
  color: #86909C;
  margin-top: 4px;
}

/* ==================== 筛选区 ==================== */
.filter-section {
  background: #FFFFFF;
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.filter-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  flex: 1;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  min-width: 280px;
}

.search-icon {
  position: absolute;
  left: 12px;
  font-size: 16px;
  color: #86909C;
}

.search-input {
  width: 100%;
  padding: 8px 12px 8px 40px;
  border: 1px solid #E5E6EB;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #0066CC;
  box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
}

.filter-group {
  display: flex;
  gap: 8px;
}

.filter-chip {
  padding: 6px 16px;
  border: 1px solid #E5E6EB;
  border-radius: 20px;
  font-size: 13px;
  color: #4E5969;
  background: #FFFFFF;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-chip:hover {
  border-color: #0066CC;
  color: #0066CC;
}

.filter-chip.active {
  border-color: #0066CC;
  background: #0066CC;
  color: #FFFFFF;
}

.filter-chip.chip-success.active {
  border-color: #00B42A;
  background: #00B42A;
}

.filter-chip.chip-warning.active {
  border-color: #FF7D00;
  background: #FF7D00;
}

.filter-chip.chip-info.active {
  border-color: #86909C;
  background: #86909C;
}

.filter-select {
  padding: 6px 12px;
  border: 1px solid #E5E6EB;
  border-radius: 6px;
  font-size: 13px;
  color: #1D2129;
  background: #FFFFFF;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-select:hover {
  border-color: #0066CC;
}

.sort-group {
  display: flex;
  gap: 4px;
}

.sort-btn {
  padding: 6px 12px;
  border: 1px solid #E5E6EB;
  border-radius: 6px;
  font-size: 13px;
  color: #4E5969;
  background: #FFFFFF;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.sort-btn:hover {
  border-color: #0066CC;
  color: #0066CC;
}

.sort-btn.active {
  background: #0066CC;
  color: #FFFFFF;
  border-color: #0066CC;
}

.filter-right {
  display: flex;
  gap: 20px;
  align-items: center;
}

.view-controls,
.density-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #86909C;
}

.layout-btn,
.density-btn {
  padding: 6px 12px;
  border: 1px solid #E5E6EB;
  border-radius: 4px;
  font-size: 13px;
  background: #FFFFFF;
  cursor: pointer;
  transition: all 0.2s;
  color: #4E5969;
}

.layout-btn:hover,
.density-btn:hover {
  border-color: #0066CC;
  color: #0066CC;
}

.layout-btn.active,
.density-btn.active {
  background: #0066CC;
  color: #FFFFFF;
  border-color: #0066CC;
}

/* ==================== 批量操作栏 ==================== */
.batch-bar {
  background: linear-gradient(135deg, #0066CC 0%, #165DFF 100%);
  padding: 16px 24px;
  border-radius: 12px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 102, 204, 0.2);
}

.batch-info {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
  color: #FFFFFF;
  font-weight: 500;
}

.batch-check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: #FFFFFF;
  color: #0066CC;
  border-radius: 50%;
  font-weight: bold;
}

.batch-actions {
  display: flex;
  gap: 8px;
}

.batch-btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
  background: rgba(255, 255, 255, 0.9);
  color: #0066CC;
  font-weight: 500;
}

.batch-btn:hover {
  background: #FFFFFF;
  transform: translateY(-1px);
}

.batch-btn.batch-start {
  background: #00B42A;
  color: #FFFFFF;
}

.batch-btn.batch-stop {
  background: #D91A2C;
  color: #FFFFFF;
}

.batch-btn.batch-refresh {
  background: #165DFF;
  color: #FFFFFF;
}

.batch-btn.batch-cancel {
  background: rgba(255, 255, 255, 0.7);
}

/* ==================== 结果统计 ==================== */
.result-summary {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background: #FFFFFF;
  border-radius: 8px;
  font-size: 13px;
  color: #86909C;
}

.summary-text strong {
  color: #1D2129;
  font-weight: 600;
}

.text-success {
  color: #00B42A !important;
}

.text-warning {
  color: #FF7D00 !important;
}

.text-info {
  color: #86909C !important;
}

.text-danger {
  color: #D91A2C !important;
}

.summary-divider {
  color: #E5E6EB;
}

/* ==================== 卡片网格 ==================== */
.cards-container {
  display: grid;
  gap: 20px;
}

.cards-container.grid.size-large {
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
}

.cards-container.grid.size-medium {
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}

.cards-container.grid.size-small {
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
}

.cards-container.list {
  grid-template-columns: 1fr;
}

/* ==================== 设备卡片 ==================== */
.inverter-card {
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  border: 2px solid transparent;
}

.inverter-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.inverter-card.card-selected {
  border-color: #0066CC;
  box-shadow: 0 4px 16px rgba(0, 102, 204, 0.2);
}

.inverter-card.card-fault {
  border-color: #FF7D00;
}

.inverter-card.card-stopped {
  opacity: 0.7;
}

.card-checkbox {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 10;
}

.checkbox-input {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #0066CC;
}

/* ==================== 优化的设备模型 ==================== */
.device-model-container {
  padding: 20px;
  background: linear-gradient(135deg, #F5F7FA 0%, #E8F3FF 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 180px;
  position: relative;
}

.device-model-3d {
  position: relative;
  width: 160px;
  transition: all 0.3s;
}

.device-model-3d.model-large {
  width: 200px;
}

.device-model-3d:hover {
  transform: scale(1.05) rotateY(5deg);
}

/* 设备主体 */
.device-body {
  position: relative;
  width: 100%;
  height: 100px;
  background: linear-gradient(180deg, #3D4656 0%, #2A3444 100%);
  border-radius: 10px;
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

.device-model-3d.status-running .device-body {
  box-shadow: 
    0 8px 32px rgba(0, 180, 42, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.device-model-3d.status-fault .device-body {
  box-shadow: 
    0 8px 32px rgba(217, 26, 44, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

/* 顶部状态灯带 */
.device-light-strip {
  position: absolute;
  top: 8px;
  left: 12px;
  right: 12px;
  display: flex;
  justify-content: space-between;
  gap: 4px;
}

.light-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #4E5969;
  transition: all 0.3s;
}

.device-model-3d.status-running .light-dot {
  background: #00B42A;
  animation: lightPulse 2s ease-in-out infinite;
}

.device-model-3d.status-running .light-dot:nth-child(2),
.device-model-3d.status-running .light-dot:nth-child(5) {
  animation-delay: 0.3s;
}

.device-model-3d.status-running .light-dot:nth-child(3),
.device-model-3d.status-running .light-dot:nth-child(6) {
  animation-delay: 0.6s;
}

.device-model-3d.status-fault .light-dot {
  background: #D91A2C;
  animation: faultBlink 0.5s ease-in-out infinite;
}

@keyframes lightPulse {
  0%, 100% {
    opacity: 0.6;
    box-shadow: 0 0 4px rgba(0, 180, 42, 0.5);
  }
  50% {
    opacity: 1;
    box-shadow: 0 0 8px rgba(0, 180, 42, 0.8);
  }
}

@keyframes faultBlink {
  0%, 100% {
    opacity: 1;
    background: #D91A2C;
  }
  50% {
    opacity: 0.3;
    background: #FF7D00;
  }
}

/* 显示屏 */
.device-screen {
  position: absolute;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  width: 70px;
  height: 36px;
  background: #0A0F18;
  border-radius: 4px;
  border: 1px solid #1D2129;
  overflow: hidden;
}

.screen-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.1;
  transition: all 0.3s;
}

.screen-glow.glow-running {
  background: #00B42A;
  animation: screenGlow 2s ease-in-out infinite;
}

.screen-glow.glow-fault {
  background: #D91A2C;
  animation: screenGlow 0.5s ease-in-out infinite;
}

@keyframes screenGlow {
  0%, 100% {
    opacity: 0.05;
  }
  50% {
    opacity: 0.15;
  }
}

.screen-content {
  padding: 6px 8px;
  text-align: center;
}

.screen-power {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 2px;
  margin-bottom: 4px;
}

.screen-value {
  font-size: 14px;
  font-weight: bold;
  color: #00FF88;
  font-family: 'Courier New', monospace;
}

.screen-unit {
  font-size: 9px;
  color: #00FF88;
  font-family: 'Arial', sans-serif;
}

.screen-status {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
}

.screen-status.status-running {
  color: #00B42A;
  background: rgba(0, 180, 42, 0.1);
}

.screen-status.status-fault {
  color: #D91A2C;
  background: rgba(217, 26, 44, 0.1);
}

.screen-status.status-stopped {
  color: #86909C;
  background: rgba(134, 144, 156, 0.1);
}

/* 散热孔 */
.device-vents {
  position: absolute;
  bottom: 16px;
  left: 12px;
  right: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.vent-row {
  display: flex;
  justify-content: space-between;
  gap: 3px;
}

.vent-hole {
  width: 6px;
  height: 2px;
  background: #1D2129;
  border-radius: 1px;
}

/* 底部连接器 */
.device-connectors {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
}

.connector {
  width: 8px;
  height: 4px;
  background: #4E5969;
  border-radius: 2px 2px 0 0;
}

/* 装饰线条 */
.device-decor-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
}

.decor-top {
  top: 20px;
}

.decor-bottom {
  bottom: 24px;
}

/* 阴影 */
.device-shadow {
  position: absolute;
  bottom: -8px;
  left: 10%;
  right: 10%;
  height: 8px;
  background: radial-gradient(ellipse, rgba(0, 0, 0, 0.15), transparent);
  border-radius: 50%;
}

/* 功率波形动画 */
.power-wave {
  position: absolute;
  right: -20px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: center;
}

.wave-bar {
  width: 3px;
  background: linear-gradient(180deg, #00B42A, transparent);
  border-radius: 2px;
  animation: waveMove 1s ease-in-out infinite;
}

@keyframes waveMove {
  0%, 100% {
    height: 8px;
    opacity: 0.5;
  }
  50% {
    height: 20px;
    opacity: 1;
  }
}

/* ==================== 卡片内容 ==================== */
.card-content {
  padding: 16px;
}

.card-header-content {
  margin-bottom: 16px;
}

.card-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 4px;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #1D2129;
  margin: 0;
  flex: 1;
  line-height: 1.3;
}

.card-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
}

.card-status-badge.badge-running {
  background: #E8FFEA;
  color: #00B42A;
}

.card-status-badge.badge-fault {
  background: #FFECE8;
  color: #D91A2C;
}

.card-status-badge.badge-stopped {
  background: #F7F8FA;
  color: #86909C;
}

.badge-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
}

.card-subtitle {
  font-size: 12px;
  color: #4E5969;
  margin-bottom: 4px;
}

.card-sn {
  font-size: 11px;
  color: #86909C;
  font-family: 'Courier New', monospace;
}

/* 关键指标 */
.card-metrics {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.metric-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.metric-item {
  padding: 10px;
  background: #F7F8FA;
  border-radius: 8px;
}

.metric-primary .metric-value {
  color: #0066CC;
}

.metric-success .metric-value {
  color: #00B42A;
}

.metric-label {
  font-size: 11px;
  color: #86909C;
  margin-bottom: 4px;
}

.metric-value {
  font-size: 18px;
  font-weight: 600;
  line-height: 1.2;
}

.metric-unit {
  font-size: 11px;
  font-weight: 400;
  color: #86909C;
  margin-left: 2px;
}

.metric-trend {
  font-size: 10px;
  margin-top: 2px;
  display: flex;
  align-items: center;
  gap: 2px;
}

.trend-up {
  color: #00B42A;
}

.trend-down {
  color: #D91A2C;
}

.metric-progress {
  width: 100%;
  height: 3px;
  background: #E5E6EB;
  border-radius: 2px;
  overflow: hidden;
  margin-top: 4px;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #00B42A, #00C975);
  border-radius: 2px;
  transition: width 0.5s ease-out;
}

/* 利用率 */
.utilization-section {
  margin-top: 8px;
}

.utilization-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.utilization-label {
  font-size: 11px;
  color: #86909C;
}

.utilization-value {
  font-size: 13px;
  font-weight: 600;
}

.utilization-value.util-high {
  color: #00B42A;
}

.utilization-value.util-medium {
  color: #0066CC;
}

.utilization-value.util-low {
  color: #FF7D00;
}

.utilization-bar {
  width: 100%;
  height: 6px;
  background: #E5E6EB;
  border-radius: 3px;
  overflow: hidden;
}

.utilization-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease-out;
}

.utilization-fill.util-high {
  background: linear-gradient(90deg, #00B42A, #00C975);
}

.utilization-fill.util-medium {
  background: linear-gradient(90deg, #0066CC, #165DFF);
}

.utilization-fill.util-low {
  background: linear-gradient(90deg, #FF7D00, #FFA94D);
}

.metric-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #F2F3F5;
}

.mini-metric {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.mini-label {
  font-size: 10px;
  color: #86909C;
}

.mini-value {
  font-size: 12px;
  font-weight: 500;
  color: #1D2129;
}

/* 元数据 */
.card-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
  padding: 10px;
  background: #F7F8FA;
  border-radius: 8px;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #4E5969;
}

.meta-icon {
  font-size: 12px;
  flex-shrink: 0;
}

.meta-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 操作按钮 */
.card-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 8px;
  border: 1px solid #E5E6EB;
  border-radius: 6px;
  background: #FFFFFF;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 11px;
  color: #4E5969;
}

.action-btn span:first-child {
  font-size: 16px;
}

.action-btn:hover {
  border-color: #0066CC;
  color: #0066CC;
  background: #F7F8FA;
}

.action-btn.action-detail:hover {
  border-color: #0066CC;
  color: #0066CC;
}

.action-btn.action-chart:hover {
  border-color: #722ED1;
  color: #722ED1;
}

.action-btn.action-control:hover {
  border-color: #00B42A;
  color: #00B42A;
}

.action-btn.action-refresh:hover {
  border-color: #FF7D00;
  color: #FF7D00;
}

/* ==================== 空状态 ==================== */
.empty-grid {
  grid-column: 1 / -1;
  grid-row: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: #1D2129;
  margin-bottom: 8px;
}

.empty-desc {
  font-size: 14px;
  color: #86909C;
  margin-bottom: 20px;
}

.empty-btn {
  padding: 10px 24px;
  background: #0066CC;
  color: #FFFFFF;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.empty-btn:hover {
  background: #165DFF;
}

/* ==================== 分页 ==================== */
.pagination-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  padding: 16px 20px;
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.pagination-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.pagination-info {
  font-size: 13px;
  color: #86909C;
}

.page-size-select {
  padding: 6px 10px;
  border: 1px solid #E5E6EB;
  border-radius: 4px;
  font-size: 13px;
  background: #FFFFFF;
  cursor: pointer;
}

.pagination-controls {
  display: flex;
  gap: 4px;
}

.page-btn {
  min-width: 32px;
  height: 32px;
  padding: 0 12px;
  border: 1px solid #E5E6EB;
  border-radius: 4px;
  background: #FFFFFF;
  font-size: 13px;
  color: #4E5969;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled):not(.ellipsis) {
  border-color: #0066CC;
  color: #0066CC;
}

.page-btn.active {
  background: #0066CC;
  color: #FFFFFF;
  border-color: #0066CC;
}

.page-btn.ellipsis {
  background: transparent;
  border: none;
  cursor: default;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ==================== Toast ==================== */
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

/* ==================== 动画 ==================== */
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

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
}

.slide-down-enter-to,
.slide-down-leave-from {
  max-height: 80px;
  opacity: 1;
}

/* ==================== 响应式设计 ==================== */
@media (max-width: 1400px) {
  .stats-section {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .cards-container.grid.size-large {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

@media (max-width: 1200px) {
  .stats-section {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .inverter-card-grid-container {
    padding: 12px;
  }
  
  .station-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .header-actions {
    width: 100%;
  }
  
  .btn {
    flex: 1;
    justify-content: center;
  }
  
  .stats-section {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .stat-card {
    padding: 16px;
  }
  
  .filter-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-left,
  .filter-right {
    width: 100%;
  }
  
  .filter-group,
  .sort-group {
    flex-wrap: wrap;
  }
  
  .cards-container.grid {
    grid-template-columns: 1fr !important;
  }
  
  .metric-group {
    grid-template-columns: 1fr;
  }
  
  .card-actions {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .pagination-section {
    flex-direction: column;
    gap: 16px;
  }
  
  .pagination-controls {
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }
}

@media (max-width: 480px) {
  .stats-section {
    grid-template-columns: 1fr;
  }
  
  .filter-chip {
    font-size: 12px;
    padding: 4px 12px;
  }
  
  .station-name {
    font-size: 18px;
  }
  
  .batch-bar {
    flex-direction: column;
    gap: 12px;
  }
  
  .batch-actions {
    width: 100%;
    flex-wrap: wrap;
  }
  
  .batch-btn {
    flex: 1;
    min-width: calc(50% - 4px);
  }
}
</style>
