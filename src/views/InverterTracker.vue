<template>
  <div class="inverter-tracker">
    <!-- 顶部控制栏：筛选与概览 -->
    <div class="control-bar">
      <!-- 左侧：筛选与搜索 -->
      <div class="filter-section">
        <el-input
          v-model="searchQuery"
          placeholder="搜索逆变器SN或设备名称"
          class="search-input"
          clearable
          @keyup.enter="handleSearch"
        />
        <el-select v-model="filterConditions.station" placeholder="所属电站" clearable class="filter-select">
          <el-option label="赣州瑞金光伏电站" value="ruijin" />
          <el-option label="赣州于都光伏电站" value="yudu" />
          <el-option label="赣州兴国光伏电站" value="xingguo" />
        </el-select>
        <el-select v-model="filterConditions.status" placeholder="设备状态" clearable class="filter-select">
          <el-option label="运行" value="running" />
          <el-option label="待机" value="standby" />
          <el-option label="故障" value="fault" />
        </el-select>
        <el-select v-model="filterConditions.alarmLevel" placeholder="告警级别" clearable class="filter-select">
          <el-option label="正常" value="normal" />
          <el-option label="提示" value="info" />
          <el-option label="警告" value="warning" />
          <el-option label="严重" value="critical" />
        </el-select>
        <el-select v-model="filterConditions.communication" placeholder="通信状态" clearable class="filter-select">
          <el-option label="正常" value="normal" />
          <el-option label="微弱" value="weak" />
          <el-option label="离线" value="offline" />
        </el-select>
        <el-button type="primary" @click="handleFilter" class="filter-btn">
          🔍 筛选
        </el-button>
      </div>

      <!-- 右侧：概览数据卡片 -->
      <div class="overview-cards">
        <el-card class="overview-card" shadow="hover">
          <div class="card-content">
            <div class="card-icon online-icon">📡</div>
            <div class="card-info">
              <div class="card-value">{{ overviewData.online }}</div>
              <div class="card-label">在线设备数</div>
              <div class="card-sub">在线率 98.5%</div>
            </div>
          </div>
        </el-card>
        <el-card class="overview-card" shadow="hover">
          <div class="card-content">
            <div class="card-icon alarm-icon">🔔</div>
            <div class="card-info">
              <div class="card-value">{{ overviewData.alarm }}</div>
              <div class="card-label">告警设备数</div>
              <div class="card-sub sub-alarm">需立即处理</div>
            </div>
          </div>
        </el-card>
        <el-card class="overview-card" shadow="hover">
          <div class="card-content">
            <div class="card-icon energy-icon">⚡</div>
            <div class="card-info">
              <div class="card-value">{{ overviewData.dailyEnergy }}<span class="unit">kWh</span></div>
              <div class="card-label">今日总发电量</div>
              <div class="card-sub sub-up">↑ 12.3%</div>
            </div>
          </div>
        </el-card>
        <el-card class="overview-card" shadow="hover">
          <div class="card-content">
            <div class="card-icon efficiency-icon">📈</div>
            <div class="card-info">
              <div class="card-value">{{ overviewData.avgEfficiency }}<span class="unit">%</span></div>
              <div class="card-label">平均转换效率</div>
              <div class="card-sub sub-up">优于昨日</div>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 中间核心区：设备台账表格 -->
    <div class="table-section">
      <el-table
        :data="paginatedData"
        style="width: 100%"
        stripe
        highlight-current-row
        @sort-change="handleSortChange"
        :default-sort="{ prop: 'dailyEnergy', order: 'descending' }"
      >
        <!-- 状态列 -->
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" effect="dark" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 名称列 -->
        <el-table-column prop="name" label="名称" width="140" sortable>
          <template #default="{ row }">
            <div class="device-name" :title="`SN: ${row.sn}`">{{ row.name }}</div>
          </template>
        </el-table-column>

        <!-- 逆变器SN列 -->
        <el-table-column prop="sn" label="逆变器SN" width="180">
          <template #default="{ row }">
            <div class="sn-text">
              {{ row.sn }}
              <span class="copy-icon" @click="copySN(row.sn)">📋</span>
            </div>
          </template>
        </el-table-column>

        <!-- 额定功率列 -->
        <el-table-column prop="ratedPower" label="额定功率" width="110" sortable>
          <template #default="{ row }">
            <div>{{ row.ratedPower }} kW</div>
          </template>
        </el-table-column>

        <!-- 实时功率列（带进度条） -->
        <el-table-column prop="realTimePower" label="实时功率" width="200" sortable>
          <template #default="{ row }">
            <div class="power-bar-container">
              <el-progress
                :percentage="getPowerPercentage(row.realTimePower, row.ratedPower)"
                :color="getPowerColor(row.realTimePower, row.ratedPower)"
                :stroke-width="10"
                :show-text="false"
              />
              <div class="power-text">{{ row.realTimePower }} kW / {{ row.ratedPower }} kW</div>
            </div>
          </template>
        </el-table-column>

        <!-- 当日电量列（带迷你柱状图） -->
        <el-table-column prop="dailyEnergy" label="当日电量" width="160" sortable>
          <template #default="{ row }">
            <div class="energy-column">
              <div class="mini-chart">
                <div
                  v-for="(bar, index) in row.hourlyEnergy"
                  :key="index"
                  class="mini-bar"
                  :style="{ height: `${bar}%` }"
                ></div>
              </div>
              <div class="energy-text">{{ row.dailyEnergy }} kWh</div>
            </div>
          </template>
        </el-table-column>

        <!-- 累计电量列 -->
        <el-table-column prop="totalEnergy" label="累计电量" width="120" sortable>
          <template #default="{ row }">
            <div class="total-energy">{{ row.totalEnergy }} MWh</div>
          </template>
        </el-table-column>

        <!-- 当日转换效率列 -->
        <el-table-column prop="conversionEfficiency" label="当日转换效率" width="130" sortable>
          <template #default="{ row }">
            <div class="efficiency-text">
              {{ row.efficiencyTrend === 'up' ? '📈' : '📉' }}
              {{ row.conversionEfficiency }}%
            </div>
          </template>
        </el-table-column>

        <!-- 设备最高温度列 -->
        <el-table-column prop="maxTemperature" label="设备最高温度" width="130" sortable>
          <template #default="{ row }">
            <div class="temp-container">
              <div class="temp-bar" :class="{ 'temp-over': row.maxTemperature > 65 }">
                <div class="temp-fill" :style="{ height: `${row.maxTemperature / 80 * 100}%` }"></div>
              </div>
              <div class="temp-text" :class="{ 'text-over': row.maxTemperature > 65 }">
                {{ row.maxTemperature }}℃
                <span v-if="row.maxTemperature > 65" class="fire-icon">🔥</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 通信状态列 -->
        <el-table-column prop="communicationStatus" label="通信状态" width="100">
          <template #default="{ row }">
            <div class="comm-status">
              <span v-if="row.communicationStatus === 'normal'" class="comm-strong">🟢</span>
              <span v-else-if="row.communicationStatus === 'weak'" class="comm-weak">🟡</span>
              <span v-else class="comm-offline">🔴</span>
            </div>
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column label="操作" width="320" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="viewDetail(row)" class="action-btn">
              👁 查看详情
            </el-button>
            <el-button
              v-if="row.status === 'fault'"
              type="warning"
              size="small"
              @click="troubleshoot(row)"
              class="action-btn"
            >
              🔧 故障排查
            </el-button>
            <el-button type="primary" size="small" plain @click="remoteControl(row)" class="action-btn">
              ⚙️ 远程控制
            </el-button>
            <el-button
              :type="row.isFavorite ? 'danger' : 'info'"
              size="small"
              circle
              @click="toggleFavorite(row)"
              class="favorite-btn"
            >
              {{ row.isFavorite ? '⭐' : '☆' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页器 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="filteredData.length"
          layout="total, sizes, prev, pager, next, jumper"
          class="pagination"
        />
      </div>
    </div>

    <!-- 底部详情抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      :title="`设备详情 - ${currentDevice.name}`"
      size="60%"
      :append-to-body="false"
      class="detail-drawer"
    >
      <div class="drawer-content">
        <!-- 左侧：设备基本信息 -->
        <div class="info-left">
          <h4 class="section-title">基本信息</h4>
          <div class="info-item">
            <span class="info-icon">📄</span>
            <span class="info-label">设备名称：</span>
            <span class="info-value">{{ currentDevice.name }}</span>
          </div>
          <div class="info-item">
            <span class="info-icon">🔑</span>
            <span class="info-label">逆变器SN：</span>
            <span class="info-value">{{ currentDevice.sn }}</span>
          </div>
          <div class="info-item">
            <span class="info-icon">⚡</span>
            <span class="info-label">额定功率：</span>
            <span class="info-value">{{ currentDevice.ratedPower }} kW</span>
          </div>
          <div class="info-item">
            <span class="info-icon">📍</span>
            <span class="info-label">所属电站：</span>
            <span class="info-value">{{ currentDevice.station }}</span>
          </div>
          <div class="info-item">
            <span class="info-icon">📅</span>
            <span class="info-label">质保到期时间：</span>
            <span class="info-value" :class="{ 'expiring': isExpiring(currentDevice.warrantyEnd) }">
              {{ currentDevice.warrantyEnd }}
            </span>
          </div>
          <div class="info-item">
            <span class="info-icon">🛡️</span>
            <span class="info-label">绝缘阻抗：</span>
            <span class="info-value">{{ currentDevice.insulationResistance }} MΩ</span>
          </div>
          <div class="info-item">
            <span class="info-icon">⏰</span>
            <span class="info-label">更新时间：</span>
            <span class="info-value">{{ currentDevice.updateTime }}</span>
          </div>
        </div>

        <!-- 中间：实时监控图表 -->
        <div class="chart-center">
          <h4 class="section-title">实时监控</h4>
          <div class="chart-wrapper">
            <div ref="powerChartRef" class="chart-container"></div>
            <div class="chart-title">功率与电量趋势（过去24小时）</div>
          </div>
          <div class="chart-wrapper">
            <div ref="tempChartRef" class="chart-container"></div>
            <div class="chart-title">温度与电网曲线（过去1小时）</div>
          </div>
        </div>

        <!-- 右侧：告警与故障 -->
        <div class="alarm-right">
          <h4 class="section-title">告警记录</h4>
          <div class="alarm-list">
            <div v-for="(alarm, index) in currentDevice.alarms" :key="index" class="alarm-item">
              <el-tag :type="getAlarmType(alarm.level)" size="small" class="alarm-tag">
                {{ getAlarmLevelText(alarm.level) }}
              </el-tag>
              <div class="alarm-content">
                <div class="alarm-desc">{{ alarm.desc }}</div>
                <div class="alarm-time">{{ alarm.time }}</div>
              </div>
            </div>
          </div>

          <h4 class="section-title" v-if="currentDevice.faultCode">故障信息</h4>
          <el-card v-if="currentDevice.faultCode" class="fault-card" shadow="hover">
            <div class="fault-code">故障代码：{{ currentDevice.faultCode }}</div>
            <div class="fault-desc">{{ currentDevice.faultDesc }}</div>
            <el-button type="primary" size="small" class="trouble-btn" @click="showTroubleshooting = true">
              查看排查指南
            </el-button>
          </el-card>

          <h4 class="section-title" v-if="currentDevice.deratingReason">降额原因</h4>
          <el-card v-if="currentDevice.deratingReason" class="derating-card" shadow="hover">
            <div class="derating-reason">{{ currentDevice.deratingReason }}</div>
          </el-card>

          <!-- 排查指南模态框 -->
          <el-dialog v-model="showTroubleshooting" title="故障排查指南" width="500px">
            <div class="troubleshooting-steps">
              <div v-for="(step, index) in troubleshootingSteps" :key="index" class="step-item">
                <div class="step-number">{{ index + 1 }}</div>
                <div class="step-content">{{ step }}</div>
              </div>
            </div>
            <template #footer>
              <el-button type="primary" @click="showTroubleshooting = false">我知道了</el-button>
            </template>
          </el-dialog>
        </div>
      </div>
    </el-drawer>

    <!-- 远程控制模态框 -->
    <el-dialog v-model="remoteControlVisible" title="远程控制" width="400px">
      <div class="remote-control-content">
        <p>确定要对设备 <strong>{{ currentDevice.name }}</strong> 执行以下操作吗？</p>
        <el-radio-group v-model="selectedControl" class="control-radio">
          <el-radio label="start">启动设备</el-radio>
          <el-radio label="stop">停止设备</el-radio>
          <el-radio label="reset">重启设备</el-radio>
        </el-radio-group>
      </div>
      <template #footer>
        <el-button @click="remoteControlVisible = false">取消</el-button>
        <el-button type="primary" @click="executeRemoteControl" :loading="controlLoading">
          确认执行
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick, watch } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'

// --- 响应式数据定义 ---
const searchQuery = ref('')
const filterConditions = reactive({
  station: '',
  status: '',
  alarmLevel: '',
  communication: ''
})
const currentPage = ref(1)
const pageSize = ref(10)
const drawerVisible = ref(false)
const remoteControlVisible = ref(false)
const showTroubleshooting = ref(false)
const controlLoading = ref(false)
const selectedControl = ref('start')
const powerChartRef = ref(null)
const tempChartRef = ref(null)

// 概览数据
const overviewData = reactive({
  online: 128,
  alarm: 7,
  dailyEnergy: 15230,
  avgEfficiency: 98.2
})

// 当前选中的设备
const currentDevice = reactive({
  name: '',
  sn: '',
  ratedPower: 0,
  station: '',
  warrantyEnd: '',
  insulationResistance: 0,
  updateTime: '',
  alarms: [],
  faultCode: '',
  faultDesc: '',
  deratingReason: ''
})

// 排查指南步骤
const troubleshootingSteps = [
  '检查设备散热风扇是否正常运转，清理进风口滤网。',
  '使用万用表测量电网电压，确认是否在允许范围内（AC 220V±10%）。',
  '检查直流输入侧接线端子是否松动，重新紧固。',
  '查看设备日志，记录故障发生前的运行参数。',
  '若以上步骤无效，请联系技术支持工程师。'
]

// --- 模拟数据生成 ---
const generateMockData = () => {
  const stations = ['赣州瑞金光伏电站', '赣州于都光伏电站', '赣州兴国光伏电站']
  const statuses = ['running', 'running', 'running', 'standby', 'fault']
  const commStatuses = ['normal', 'normal', 'normal', 'weak', 'offline']

  return Array.from({ length: 50 }, (_, i) => {
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const ratedPower = [500, 630, 1000, 1500][Math.floor(Math.random() * 4)]
    const realTimePower = status === 'running' ? (Math.random() * ratedPower * 0.9 + ratedPower * 0.1).toFixed(1) : 0
    const maxTemperature = Math.floor(Math.random() * 40 + 35)
    const isFault = status === 'fault'

    return {
      id: i + 1,
      status: status,
      name: `组串式逆变器-${String(i + 1).padStart(3, '0')}`,
      sn: `INV-${stations[i % 3].substring(2, 4)}-2024-${String(i + 1000).padStart(4, '0')}`,
      ratedPower: ratedPower,
      realTimePower: parseFloat(realTimePower),
      dailyEnergy: Math.floor(Math.random() * 2000 + 500),
      totalEnergy: (Math.random() * 500 + 100).toFixed(1),
      conversionEfficiency: (Math.random() * 2 + 96).toFixed(1),
      efficiencyTrend: Math.random() > 0.5 ? 'up' : 'down',
      powerFactor: (Math.random() * 0.1 + 0.9).toFixed(2),
      maxTemperature: maxTemperature,
      insulationResistance: (Math.random() * 50 + 100).toFixed(1),
      station: stations[i % 3],
      warrantyEnd: `202${6 + Math.floor(Math.random() * 5)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      updateTime: `2026-03-25 ${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      alarmLevel: isFault ? 'critical' : (Math.random() > 0.8 ? 'warning' : 'normal'),
      faultCode: isFault ? `E0${Math.floor(Math.random() * 5) + 1}` : '',
      faultDesc: isFault ? ['过温保护', '电网过压', '直流过流', '通讯中断', '绝缘故障'][Math.floor(Math.random() * 5)] : '',
      deratingReason: Math.random() > 0.9 ? '电网电压波动' : '',
      gridVoltage: (Math.random() * 20 + 220).toFixed(1),
      gridFrequency: (Math.random() * 0.5 + 50).toFixed(2),
      communicationStatus: commStatuses[Math.floor(Math.random() * commStatuses.length)],
      isFavorite: Math.random() > 0.8,
      hourlyEnergy: Array.from({ length: 6 }, () => Math.floor(Math.random() * 80 + 20)),
      alarms: isFault ? [
        { level: 'critical', desc: '设备过温保护触发', time: `10:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:05` },
        { level: 'warning', desc: '直流输入电压偏高', time: `10:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:02` }
      ] : (Math.random() > 0.7 ? [
        { level: 'info', desc: '设备自检完成', time: `08:00:00` }
      ] : [])
    }
  })
}

const tableData = ref(generateMockData())

// --- 计算属性 ---
const filteredData = computed(() => {
  let data = [...tableData.value]

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    data = data.filter(item =>
      item.name.toLowerCase().includes(query) ||
      item.sn.toLowerCase().includes(query)
    )
  }

  // 筛选条件过滤
  if (filterConditions.station) {
    data = data.filter(item => item.station.includes(filterConditions.station === 'ruijin' ? '瑞金' : filterConditions.station === 'yudu' ? '于都' : '兴国'))
  }
  if (filterConditions.status) {
    data = data.filter(item => item.status === filterConditions.status)
  }
  if (filterConditions.alarmLevel) {
    data = data.filter(item => item.alarmLevel === filterConditions.alarmLevel)
  }
  if (filterConditions.communication) {
    data = data.filter(item => item.communicationStatus === filterConditions.communication)
  }

  // 收藏置顶
  data.sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0))

  return data
})

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredData.value.slice(start, end)
})

// --- 方法定义 ---
const handleSearch = () => {
  currentPage.value = 1
  ElMessage.success('搜索完成')
}

const handleFilter = () => {
  currentPage.value = 1
  ElMessage.success('筛选条件已应用')
}

const handleSortChange = ({ prop, order }) => {
  // 排序逻辑可在此扩展
}

const getStatusType = (status) => {
  return status === 'running' ? 'success' : status === 'fault' ? 'danger' : 'info'
}

const getStatusText = (status) => {
  return status === 'running' ? '运行' : status === 'fault' ? '故障' : '待机'
}

const getPowerPercentage = (real, rated) => {
  return Math.min(Math.round((real / rated) * 100), 100)
}

const getPowerColor = (real, rated) => {
  const pct = real / rated
  return pct > 0.9 ? '#E6A23C' : pct > 0.7 ? '#67C23A' : '#409EFF'
}

const getAlarmType = (level) => {
  return level === 'critical' ? 'danger' : level === 'warning' ? 'warning' : 'info'
}

const getAlarmLevelText = (level) => {
  return level === 'critical' ? '严重' : level === 'warning' ? '警告' : level === 'info' ? '提示' : '正常'
}

const copySN = (sn) => {
  navigator.clipboard.writeText(sn).then(() => {
    ElMessage.success('SN已复制到剪贴板')
  })
}

const isExpiring = (dateStr) => {
  if (!dateStr) return false
  const date = new Date(dateStr)
  const now = new Date()
  const diff = (date - now) / (1000 * 60 * 60 * 24)
  return diff < 365
}

const viewDetail = (row) => {
  Object.assign(currentDevice, row)
  drawerVisible.value = true
  nextTick(() => {
    initCharts()
  })
}

const troubleshoot = (row) => {
  Object.assign(currentDevice, row)
  showTroubleshooting.value = true
}

const remoteControl = (row) => {
  Object.assign(currentDevice, row)
  selectedControl.value = 'start'
  remoteControlVisible.value = true
}

const executeRemoteControl = () => {
  controlLoading.value = true
  setTimeout(() => {
    controlLoading.value = false
    remoteControlVisible.value = false
    ElMessage.success(`设备 ${currentDevice.name} ${selectedControl.value === 'start' ? '启动' : selectedControl.value === 'stop' ? '停止' : '重启'} 指令已发送`)
  }, 1500)
}

const toggleFavorite = (row) => {
  row.isFavorite = !row.isFavorite
  ElMessage.success(row.isFavorite ? '已收藏' : '已取消收藏')
}

// --- ECharts 图表初始化 ---
const initCharts = () => {
  if (powerChartRef.value) {
    const powerChart = echarts.init(powerChartRef.value)
    const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`)
    const powerData = Array.from({ length: 24 }, () => Math.random() * 400 + 100)
    const energyData = powerData.reduce((acc, val, idx) => {
      acc.push((acc[idx - 1] || 0) + val * 0.25)
      return acc
    }, [])

    powerChart.setOption({
      tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
      legend: { data: ['实时功率', '累计电量'], top: 0 },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', boundaryGap: false, data: hours },
      yAxis: [
        { type: 'value', name: '功率 (kW)', position: 'left' },
        { type: 'value', name: '电量 (kWh)', position: 'right' }
      ],
      series: [
        {
          name: '实时功率',
          type: 'line',
          smooth: true,
          data: powerData,
          itemStyle: { color: '#409EFF' },
          areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(64, 158, 255, 0.3)' }, { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }]) }
        },
        {
          name: '累计电量',
          type: 'line',
          yAxisIndex: 1,
          smooth: true,
          data: energyData,
          itemStyle: { color: '#67C23A' }
        }
      ]
    })
  }

  if (tempChartRef.value) {
    const tempChart = echarts.init(tempChartRef.value)
    const minutes = Array.from({ length: 60 }, (_, i) => `${i}m`)
    const tempData = Array.from({ length: 60 }, () => Math.random() * 15 + 50)
    const voltageData = Array.from({ length: 60 }, () => Math.random() * 10 + 215)
    const freqData = Array.from({ length: 60 }, () => Math.random() * 0.2 + 49.9)

    tempChart.setOption({
      tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
      legend: { data: ['设备温度', '电网电压', '电网频率'], top: 0 },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', boundaryGap: false, data: minutes },
      yAxis: [
        { type: 'value', name: '温度 (℃)', min: 30, max: 80 },
        { type: 'value', name: '电压 (V)', min: 200, max: 240, position: 'right' }
      ],
      visualMap: { show: false, pieces: [{ lt: 65, color: '#67C23A' }, { gte: 65, color: '#F56C6C' }] },
      series: [
        {
          name: '设备温度',
          type: 'line',
          smooth: true,
          data: tempData,
          markLine: { silent: true, data: [{ yAxis: 65 }], lineStyle: { color: '#F56C6C', type: 'dashed' } }
        },
        {
          name: '电网电压',
          type: 'line',
          yAxisIndex: 1,
          smooth: true,
          data: voltageData,
          itemStyle: { color: '#909399' }
        },
        {
          name: '电网频率',
          type: 'line',
          yAxisIndex: 1,
          smooth: true,
          data: freqData,
          itemStyle: { color: '#E6A23C' }
        }
      ]
    })
  }
}

// 监听抽屉关闭，重置图表
watch(drawerVisible, (val) => {
  if (!val) {
    // 可在此销毁图表实例
  }
})
</script>

<style scoped>
/* 整体容器 */
.inverter-tracker {
  padding: 20px;
  background-color: #F5F7FA;
  min-height: calc(100vh - 60px);
  box-sizing: border-box;
}

/* 顶部控制栏 */
.control-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  gap: 20px;
  flex-wrap: wrap;
}

/* 筛选区 */
.filter-section {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.search-input {
  width: 280px;
}

.filter-select {
  width: 150px;
}

.filter-btn {
  border-radius: 8px;
}

/* 概览卡片 */
.overview-cards {
  display: flex;
  gap: 16px;
}

.overview-card {
  width: 180px;
  height: 100px;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border-radius: 12px;
}

.overview-card:hover {
  transform: translateY(-4px);
}

.card-content {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 100%;
}

.card-icon {
  font-size: 32px;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
}

.online-icon { background: linear-gradient(135deg, #E6FFFA, #B2F5EA); }
.alarm-icon { background: linear-gradient(135deg, #FFF5F5, #FED7D7); }
.energy-icon { background: linear-gradient(135deg, #FFFFF0, #FEFCBF); }
.efficiency-icon { background: linear-gradient(135deg, #F0FFF4, #C6F6D5); }

.card-info {
  flex: 1;
}

.card-value {
  font-size: 24px;
  font-weight: bold;
  color: #1D2129;
  line-height: 1.2;
}

.card-value .unit {
  font-size: 14px;
  font-weight: normal;
  color: #4E5969;
  margin-left: 4px;
}

.card-label {
  font-size: 14px;
  color: #4E5969;
  margin-top: 4px;
}

.card-sub {
  font-size: 12px;
  color: #86909C;
  margin-top: 2px;
}

.sub-up { color: #52C41A; }
.sub-alarm { color: #FF4D4F; }

/* 表格区 */
.table-section {
  background-color: #FFFFFF;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.device-name {
  font-weight: 600;
  color: #1D2129;
}

.sn-text {
  font-family: 'Consolas', 'Monaco', monospace;
  color: #4E5969;
  display: flex;
  align-items: center;
  gap: 6px;
}

.copy-icon {
  cursor: pointer;
  font-size: 14px;
}

/* 功率进度条 */
.power-bar-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.power-text {
  font-size: 12px;
  color: #4E5969;
  text-align: right;
}

/* 当日电量迷你柱状图 */
.energy-column {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mini-chart {
  display: flex;
  gap: 3px;
  align-items: flex-end;
  height: 30px;
}

.mini-bar {
  width: 8px;
  background: linear-gradient(180deg, #409EFF, #66B1FF);
  border-radius: 2px 2px 0 0;
}

.energy-text {
  font-weight: 500;
  color: #1D2129;
}

.total-energy {
  color: #1D2129;
}

/* 转换效率 */
.efficiency-text {
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
}

/* 温度指示器 */
.temp-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.temp-bar {
  width: 8px;
  height: 30px;
  background-color: #E5E6EB;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.temp-bar.temp-over {
  background-color: #FFECEC;
}

.temp-fill {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: linear-gradient(180deg, #67C23A, #95DE64);
  border-radius: 4px;
  transition: height 0.3s;
}

.temp-bar.temp-over .temp-fill {
  background: linear-gradient(180deg, #F56C6C, #FF9C9C);
}

.temp-text {
  font-weight: 500;
  color: #1D2129;
  display: flex;
  align-items: center;
  gap: 2px;
}

.temp-text.text-over {
  color: #F56C6C;
}

/* 通信状态 */
.comm-status {
  display: flex;
  justify-content: center;
  font-size: 20px;
}

/* 操作按钮 */
.action-btn {
  margin-right: 6px;
  border-radius: 6px;
}

.favorite-btn {
  margin-left: 4px;
  font-size: 16px;
}

/* 分页器 */
.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

/* 抽屉样式 */
.detail-drawer :deep(.el-drawer__header) {
  border-bottom: 1px solid #E5E6EB;
  padding-bottom: 16px;
  margin-bottom: 20px;
}

.drawer-content {
  display: flex;
  gap: 24px;
  height: 100%;
  overflow-y: auto;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1D2129;
  margin-bottom: 16px;
  padding-left: 8px;
  border-left: 3px solid #409EFF;
}

/* 左侧基本信息 */
.info-left {
  width: 25%;
  flex-shrink: 0;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 14px;
  font-size: 14px;
}

.info-icon {
  margin-right: 8px;
  font-size: 16px;
}

.info-label {
  color: #86909C;
  width: 100px;
  flex-shrink: 0;
}

.info-value {
  color: #1D2129;
  font-weight: 500;
}

.expiring {
  color: #FF4D4F;
  font-weight: 600;
}

/* 中间图表区 */
.chart-center {
  width: 50%;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.chart-wrapper {
  background-color: #F7F8FA;
  border-radius: 8px;
  padding: 16px;
}

.chart-container {
  height: 200px;
  width: 100%;
}

.chart-title {
  text-align: center;
  font-size: 12px;
  color: #86909C;
  margin-top: 8px;
}

/* 右侧告警区 */
.alarm-right {
  width: 25%;
  flex-shrink: 0;
}

.alarm-list {
  margin-bottom: 20px;
}

.alarm-item {
  display: flex;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid #F2F3F5;
}

.alarm-tag {
  flex-shrink: 0;
}

.alarm-content {
  flex: 1;
}

.alarm-desc {
  font-size: 14px;
  color: #1D2129;
  margin-bottom: 4px;
}

.alarm-time {
  font-size: 12px;
  color: #86909C;
}

.fault-card {
  background: linear-gradient(135deg, #FFF1F0, #FFECEC);
  border: 1px solid #FFCCC7;
  margin-bottom: 16px;
}

.fault-code {
  font-weight: 600;
  color: #CF1322;
  margin-bottom: 8px;
}

.fault-desc {
  font-size: 14px;
  color: #1D2129;
  margin-bottom: 12px;
}

.trouble-btn {
  width: 100%;
}

.derating-card {
  background: linear-gradient(135deg, #FFFFF0, #FEFCBF);
  border: 1px solid #FFE58F;
}

.derating-reason {
  font-size: 14px;
  color: #1D2129;
}

/* 排查指南 */
.troubleshooting-steps {
  padding: 10px 0;
}

.step-item {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  align-items: flex-start;
}

.step-number {
  width: 24px;
  height: 24px;
  background-color: #409EFF;
  color: #FFFFFF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
  font-size: 14px;
  color: #1D2129;
  line-height: 1.6;
  padding-top: 2px;
}

/* 远程控制 */
.remote-control-content {
  padding: 10px 0;
}

.remote-control-content p {
  margin-bottom: 20px;
  font-size: 14px;
  color: #1D2129;
}

.control-radio {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>