<template>
  <div class="outer-wrapper">
    <div class="layout-container">
      <!-- 左侧逆变器面板 -->
      <div class="station-panel" :class="{ 'panel-collapsed': isCollapsed }">
        <div class="panel-content">
          <div class="panel-header">
            <span class="panel-title">逆变器列表</span>
            <span class="panel-count">{{ inverterList.length }} 台</span>
          </div>
          <div class="search-box">
            <el-input
              v-model="searchQuery"
              placeholder="搜索逆变器名称"
              size="small"
              clearable
              :prefix-icon="Search"
            />
          </div>
          <div v-if="inverterList.length === 0 && !listLoading" class="empty-panel">
            <el-empty description="暂无逆变器" :image-size="80" />
          </div>
          <div v-else class="inverter-list">
            <div
              v-for="inv in filteredInverters"
              :key="inv.sn"
              class="inverter-item"
              :class="{ active: currentInverter && currentInverter.sn === inv.sn }"
              @click="selectInverter(inv)"
            >
              <div class="inv-left">
                <span class="status-dot" :class="inv.status === 'running' ? 'online' : 'offline'"></span>
                <div class="inv-info">
                  <span class="inv-name">{{ inv.name }}</span>
                  <span class="inv-sn">{{ inv.sn }}</span>
                </div>
              </div>
              <span class="inv-badge" :class="inv.status === 'running' ? 'running' : 'stopped'">
                {{ inv.status === 'running' ? '运行中' : '已停止' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 折叠拉手 -->
      <div class="toggle-handle" @click="isCollapsed = !isCollapsed" :title="isCollapsed ? '展开列表' : '收起列表'">
        <el-icon :size="14"><ArrowLeft v-if="!isCollapsed" /><ArrowRight v-else /></el-icon>
      </div>

      <!-- 右侧内容区 -->
      <div class="main-content" v-if="currentInverter">
        <!-- 顶部标题与操作栏 -->
        <div class="detail-header">
          <div class="header-left">
            <div class="title-row">
              <div class="inverter-icon-box">
                <Zap :size="20" />
              </div>
              <h1 class="inverter-title">{{ currentInverter.name }}</h1>
              <span class="status-chip" :class="currentInverter.status">
                {{ currentInverter.status === 'running' ? '运行中' : '已停止' }}
              </span>
            </div>
            <div class="sub-meta">
              <span class="meta-item">
                <span class="meta-label">电站</span>
                <span class="meta-value link" @click="goToStation">{{ currentStation.name }}</span>
              </span>
              <span class="meta-divider"></span>
              <span class="meta-item">
                <span class="meta-label">SN</span>
                <span class="meta-value">{{ currentInverter.sn }}</span>
                <el-icon class="copy-btn" :size="13" @click="copySn"><CopyDocument /></el-icon>
              </span>
              <span class="meta-divider"></span>
              <span class="meta-item">
                <span class="meta-label">数据时间</span>
                <span class="meta-value">{{ currentInverter.updateTime }}</span>
              </span>
            </div>
          </div>
          <div class="header-right">
            <el-button type="primary" size="small" @click="handleControl">逆变器控制</el-button>
            <el-button size="small" @click="handleCalibrate">校准电量</el-button>
            <el-button size="small" @click="handleLog">操作日志</el-button>
            <el-button size="small" text @click="goBack">
              <el-icon :size="16"><ArrowLeft /></el-icon>
              <span>返回</span>
            </el-button>
          </div>
        </div>

        <!-- 基础信息卡片 -->
        <div class="info-card">
          <div class="info-card-header">
            <span class="card-section-icon"><InfoFilled /></span>
            <span class="card-section-title">基本信息</span>
          </div>
          <div class="info-grid">
            <div class="info-field">
              <span class="info-label">型号</span>
              <span class="info-value">{{ currentInverter.model }}</span>
            </div>
            <div class="info-field">
              <span class="info-label">机型</span>
              <span class="info-value">{{ currentInverter.type }}</span>
            </div>
            <div class="info-field">
              <span class="info-label">额定功率</span>
              <span class="info-value emphasis">{{ currentInverter.ratedPower }}</span>
            </div>
            <div class="info-field">
              <span class="info-label">所属电站</span>
              <span class="info-value link" @click="goToStation">
                {{ currentStation.name }}
                <el-icon :size="13"><ArrowRight /></el-icon>
              </span>
            </div>
            <div class="info-field">
              <span class="info-label">质保状态</span>
              <span class="info-value">
                <span class="dot-indicator green"></span>
                {{ currentInverter.warrantyStatus }}
              </span>
            </div>
            <div class="info-field">
              <span class="info-label">质保到期</span>
              <span class="info-value">{{ currentInverter.warrantyExpire }}</span>
            </div>
            <div class="info-field">
              <span class="info-label">国家标准</span>
              <span class="info-value link">
                {{ currentInverter.standard }}
                <el-icon :size="13"><ArrowRight /></el-icon>
              </span>
            </div>
            <div class="info-field">
              <span class="info-label">逆变器版本</span>
              <span class="info-value">{{ currentInverter.version }}</span>
            </div>
            <div class="info-field">
              <span class="info-label">AFO版本</span>
              <span class="info-value">{{ currentInverter.afoVersion }}</span>
            </div>
            <div class="info-field">
              <span class="info-label">G100运行状态</span>
              <span class="info-value">{{ currentInverter.g100Status }}</span>
            </div>
            <div class="info-field">
              <span class="info-label">AFO方案</span>
              <span class="info-value">{{ currentInverter.afoScheme }}</span>
            </div>
            <div class="info-field">
              <span class="info-label">备注</span>
              <span class="info-value">{{ currentInverter.remark || '--' }}</span>
            </div>
            <div class="info-field">
              <span class="info-label">地址</span>
              <span class="info-value">{{ currentInverter.address }}</span>
            </div>
          </div>
        </div>

        <!-- 实时数据区 -->
        <div class="realtime-section">
          <!-- 左侧 KPI -->
          <div class="kpi-card">
            <div class="kpi-card-header">
              <span class="card-section-icon accent"><Activity /></span>
              <span class="card-section-title">实时信息</span>
              <span class="mock-badge">模拟数据</span>
            </div>
            <div class="kpi-grid">
              <!-- 实时监测类 -->
              <div class="kpi-item kpi-real">
                <span class="kpi-label">实时功率</span>
                <span class="kpi-value">{{ currentInverter.realPower }}</span>
              </div>
              <div class="kpi-item kpi-real">
                <span class="kpi-label">
                  IGBT温度
                  <el-tooltip content="绝缘栅双极晶体管温度" placement="top">
                    <el-icon :size="13" class="help-icon"><QuestionFilled /></el-icon>
                  </el-tooltip>
                </span>
                <span class="kpi-value temp">{{ currentInverter.igbtTemp }}</span>
              </div>
              <!-- 统计类 -->
              <div class="kpi-item kpi-stat">
                <span class="kpi-label">当日发电</span>
                <span class="kpi-value">{{ currentInverter.dayEnergy }}</span>
              </div>
              <div class="kpi-item kpi-stat">
                <span class="kpi-label">日满发小时</span>
                <span class="kpi-value">{{ currentInverter.dayHours }}</span>
              </div>
              <div class="kpi-item kpi-stat">
                <span class="kpi-label">当月发电</span>
                <span class="kpi-value">{{ currentInverter.monthEnergy }}</span>
              </div>
              <div class="kpi-item kpi-stat">
                <span class="kpi-label">当年发电</span>
                <span class="kpi-value">{{ currentInverter.yearEnergy }}</span>
              </div>
              <div class="kpi-item kpi-stat">
                <span class="kpi-label">累计发电</span>
                <span class="kpi-value total">{{ currentInverter.totalEnergy }}</span>
              </div>
              <!-- 告警类 -->
              <div class="kpi-item kpi-alert">
                <span class="kpi-label">报警信息</span>
                <span class="kpi-value alert-ok">{{ currentInverter.alarm || '无报警' }}</span>
              </div>
            </div>
          </div>

          <!-- 右侧数据表格 -->
          <div class="tables-column">
            <!-- 直流侧 -->
            <div class="data-table-card">
              <div class="table-header">
                <span class="table-title">直流侧参数</span>
                <span class="mock-tag-small">模拟</span>
              </div>
              <div class="table-inner">
                <div class="table-head-row">
                  <span class="th-name">通道</span>
                  <span class="th-v">电压 (V)</span>
                  <span class="th-i">电流 (A)</span>
                  <span class="th-p">功率 (W)</span>
                </div>
                <div class="table-body">
                  <div
                    v-for="(item, idx) in dcData"
                    :key="idx"
                    class="table-row"
                    :class="{ 'warning-row': isLowCurrent(item.current) }"
                  >
                    <span class="td-name">{{ item.name }}</span>
                    <span class="td-v">{{ item.voltage }}</span>
                    <span class="td-i" :class="{ 'danger-text': isLowCurrent(item.current) }">
                      {{ item.current }}
                      <span v-if="isLowCurrent(item.current)" class="low-tag">低电流</span>
                    </span>
                    <span class="td-p">{{ item.power }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 交流侧 -->
            <div class="data-table-card">
              <div class="table-header">
                <span class="table-title">交流侧参数</span>
                <span class="mock-tag-small">模拟</span>
              </div>
              <div class="table-inner">
                <div class="table-head-row">
                  <span class="th-name">相线</span>
                  <span class="th-v">电压 (V)</span>
                  <span class="th-i">电流 (A)</span>
                  <span class="th-p">频率 (Hz)</span>
                </div>
                <div class="table-body">
                  <div v-for="(item, idx) in acData" :key="idx" class="table-row">
                    <span class="td-name">{{ item.name }}</span>
                    <span class="td-v">{{ item.voltage }}</span>
                    <span class="td-i">{{ item.current }}</span>
                    <span class="td-p">{{ item.freq }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="main-content empty-main">
        <div class="empty-state">
          <div class="empty-icon-box">
            <el-icon :size="48"><Cpu /></el-icon>
          </div>
          <h3 class="empty-title">选择逆变器</h3>
          <p class="empty-desc">请从左侧列表中选择一台逆变器以查看详情</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { ArrowLeft, ArrowRight, Search, Cpu, CopyDocument, InfoFilled, QuestionFilled } from '@element-plus/icons-vue'
import { Zap, Activity } from 'lucide-vue-next'

const isCollapsed = ref(false)
const searchQuery = ref('')
const lowCurrentThreshold = ref(0.15)
const listLoading = ref(false)

const currentStation = ref({
  id: 'ST-2024-001',
  name: '西北光伏1号电站'
})

const currentInverter = ref(null)

const inverterList = ref([])

const loadInverterList = () => {
  const mockInverters = [
    { sn: 'INV-2024-A001', name: '1号逆变器', status: 'running', model: 'Solis-250K-EHV-5G', type: '组串式', ratedPower: '250kW', warrantyStatus: '正常', warrantyExpire: '2028-06-15', standard: 'GB/T 19964-2024', version: 'V3.2.1', afoVersion: 'V1.0.3', g100Status: '正常', afoScheme: '方案B', remark: '--', address: '青海省海西州格尔木市', realPower: '186.5kW', dayEnergy: '1,250kWh', dayHours: '5.2h', monthEnergy: '28,300kWh', yearEnergy: '156,800kWh', totalEnergy: '1,280,000kWh', alarm: '--', igbtTemp: '58.3℃', updateTime: '2026-05-06 14:32:10', stationName: '西北光伏1号电站' },
    { sn: 'INV-2024-A002', name: '2号逆变器', status: 'running', model: 'Solis-250K-EHV-5G', type: '组串式', ratedPower: '250kW', warrantyStatus: '正常', warrantyExpire: '2028-06-15', standard: 'GB/T 19964-2024', version: 'V3.2.1', afoVersion: 'V1.0.3', g100Status: '正常', afoScheme: '方案B', remark: '例行维护中', address: '青海省海西州格尔木市', realPower: '192.1kW', dayEnergy: '1,310kWh', dayHours: '5.5h', monthEnergy: '29,100kWh', yearEnergy: '162,300kWh', totalEnergy: '1,310,000kWh', alarm: '--', igbtTemp: '62.1℃', updateTime: '2026-05-06 14:32:05', stationName: '西北光伏1号电站' },
    { sn: 'INV-2024-A003', name: '3号逆变器', status: 'running', model: 'Solis-250K-EHV-5G', type: '组串式', ratedPower: '250kW', warrantyStatus: '即将到期', warrantyExpire: '2026-08-20', standard: 'GB/T 19964-2024', version: 'V3.2.0', afoVersion: 'V1.0.2', g100Status: '正常', afoScheme: '方案A', remark: '--', address: '青海省海西州格尔木市', realPower: '175.4kW', dayEnergy: '1,180kWh', dayHours: '4.9h', monthEnergy: '26,500kWh', yearEnergy: '148,200kWh', totalEnergy: '1,180,000kWh', alarm: '--', igbtTemp: '55.7℃', updateTime: '2026-05-06 14:31:58', stationName: '西北光伏1号电站' },
    { sn: 'INV-2024-A004', name: '4号逆变器', status: 'stopped', model: 'Solis-250K-EHV-5G', type: '组串式', ratedPower: '250kW', warrantyStatus: '正常', warrantyExpire: '2028-09-10', standard: 'GB/T 19964-2024', version: 'V3.2.1', afoVersion: 'V1.0.3', g100Status: '异常', afoScheme: '方案B', remark: '待检修', address: '青海省海西州格尔木市', realPower: '0kW', dayEnergy: '0kWh', dayHours: '0h', monthEnergy: '12,500kWh', yearEnergy: '98,400kWh', totalEnergy: '960,000kWh', alarm: '离线', igbtTemp: '32.1℃', updateTime: '2026-05-06 08:15:30', stationName: '西北光伏1号电站' },
    { sn: 'INV-2024-A005', name: '5号逆变器', status: 'running', model: 'Solis-250K-EHV-5G', type: '组串式', ratedPower: '250kW', warrantyStatus: '正常', warrantyExpire: '2028-11-05', standard: 'GB/T 19964-2024', version: 'V3.2.1', afoVersion: 'V1.0.4', g100Status: '正常', afoScheme: '方案C', remark: '--', address: '青海省海西州格尔木市', realPower: '200.8kW', dayEnergy: '1,390kWh', dayHours: '5.8h', monthEnergy: '31,200kWh', yearEnergy: '170,500kWh', totalEnergy: '1,420,000kWh', alarm: '--', igbtTemp: '60.5℃', updateTime: '2026-05-06 14:32:15', stationName: '西北光伏1号电站' }
  ]
  inverterList.value = mockInverters
  currentStation.value = { id: 'ST-2024-001', name: '西北光伏1号电站' }

  const target = mockInverters[0]
  if (target) {
    currentInverter.value = { ...target }
  }
}

const filteredInverters = computed(() => {
  if (!searchQuery.value) return inverterList.value
  const q = searchQuery.value.toLowerCase()
  return inverterList.value.filter(inv =>
    inv.name.toLowerCase().includes(q) || inv.sn.toLowerCase().includes(q)
  )
})

const selectInverter = (inv) => {
  currentInverter.value = {
    ...inv,
    igbtTemp: (45 + Math.random() * 25).toFixed(1) + '℃'
  }
}

const dcData = ref([
  { name: 'PV1', voltage: 648.6, current: 0.1, power: 65 },
  { name: 'PV2', voltage: 648.6, current: 0, power: 0 },
  { name: 'PV3', voltage: 596.5, current: 0.1, power: 60 },
  { name: 'PV4', voltage: 596.5, current: 0, power: 0 },
  { name: 'PV5', voltage: 553.9, current: 0.1, power: 55 },
  { name: 'PV6', voltage: 553.9, current: 0, power: 0 },
  { name: 'PV7', voltage: 632.9, current: 0.2, power: 127 },
  { name: 'PV8', voltage: 632.9, current: 0, power: 0 },
  { name: 'MPPT1', voltage: 648.5, current: 0.1, power: 65 },
  { name: 'MPPT2', voltage: 596.6, current: 0.1, power: 60 },
])

const acData = ref([
  { name: 'L1', voltage: 255.9, current: 1.4, freq: 50.03 },
  { name: 'L2', voltage: 257.7, current: 1.2, freq: 50.03 },
  { name: 'L3', voltage: 255.3, current: 1.2, freq: 50.03 },
])

const isLowCurrent = (val) => val <= lowCurrentThreshold.value

const copySn = () => {
  navigator.clipboard?.writeText(currentInverter.value.sn)
  ElMessage.success('SN 已复制')
}

const goToStation = () => ElMessage.info('跳转至电站详情')
const goBack = () => ElMessage.info('返回上一页')

const handleControl = () => ElMessage.info('逆变器控制')
const handleCalibrate = () => ElMessage.info('校准电量')
const handleLog = () => ElMessage.info('操作日志')

onMounted(loadInverterList)
</script>

<style scoped>
/* ========== 全局变量 ========== */
:root {
  --brand: #409eff;
  --brand-light: #ecf5ff;
  --success: #67c23a;
  --success-bg: #f0f9eb;
  --danger: #f56c6c;
  --danger-bg: #fef0f0;
  --warning: #e6a23c;
  --warning-bg: #fdf6ec;
  --text-primary: #1a1a1a;
  --text-regular: #333;
  --text-secondary: #666;
  --text-muted: #999;
  --text-placeholder: #c0c4cc;
  --border-base: #ebeef5;
  --border-light: #f0f0f0;
  --bg-page: #f0f2f5;
  --bg-card: #fff;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.06);
  --shadow-md: 0 2px 8px rgba(0,0,0,0.08);
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --transition-fast: 0.2s ease;
  --transition-smooth: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* ========== 外层 ========== */
.outer-wrapper {
  width: 100%;
  height: calc(100vh - 60px);
  overflow: hidden;
}
.layout-container {
  display: flex;
  width: 100%;
  height: 100%;
  background: var(--bg-page);
  overflow: hidden;
}

/* ========== 左侧面板 ========== */
.station-panel {
  width: 272px;
  background: var(--bg-card);
  border-right: 1px solid var(--border-base);
  box-shadow: 2px 0 12px rgba(0,0,0,0.04);
  transition: width var(--transition-smooth);
  flex-shrink: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.panel-collapsed {
  width: 0;
  border-right: none;
}
.panel-content {
  width: 272px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 16px 6px;
}
.panel-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}
.panel-count {
  font-size: 12px;
  color: var(--text-muted);
  background: var(--bg-page);
  padding: 2px 8px;
  border-radius: 10px;
}
.search-box {
  padding: 10px 16px 12px;
}
.inverter-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 8px 12px;
}
.inverter-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  margin-bottom: 2px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  border: 1px solid transparent;
}
.inverter-item:hover {
  background: #f5f7fa;
}
.inverter-item.active {
  background: var(--brand-light);
  border-color: #c6e2ff;
}
.inv-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 0 2px rgba(0,0,0,0.06);
}
.status-dot.online {
  background: var(--success);
  box-shadow: 0 0 0 3px rgba(103,194,58,0.2);
}
.status-dot.offline {
  background: var(--text-muted);
}
.inv-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.inv-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-regular);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.inv-sn {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 1px;
}
.inv-badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  flex-shrink: 0;
  font-weight: 500;
}
.inv-badge.running {
  background: var(--success-bg);
  color: var(--success);
}
.inv-badge.stopped {
  background: #f5f5f5;
  color: var(--text-muted);
}

.empty-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ========== 折叠拉手 ========== */
.toggle-handle {
  width: 22px;
  height: 56px;
  background: var(--bg-card);
  border: 1px solid var(--border-base);
  border-left: none;
  border-radius: 0 8px 8px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all var(--transition-fast);
  flex-shrink: 0;
  align-self: center;
  z-index: 2;
}
.toggle-handle:hover {
  background: var(--brand-light);
  color: var(--brand);
  border-color: #c6e2ff;
}

/* ========== 主内容区 ========== */
.main-content {
  flex: 1;
  padding: 20px 24px;
  overflow-y: auto;
  min-width: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}
.empty-main {
  display: flex;
  align-items: center;
  justify-content: center;
}
.empty-state {
  text-align: center;
}
.empty-icon-box {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: #c0c4cc;
}
.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-regular);
  margin: 0 0 8px;
}
.empty-desc {
  font-size: 14px;
  color: var(--text-muted);
  margin: 0;
}

/* ========== 顶部标题栏 ========== */
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding: 20px 24px;
  background: var(--bg-card);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}
.title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.inverter-icon-box {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  background: linear-gradient(135deg, #409eff, #66b1ff);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.inverter-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
}
.status-chip {
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 12px;
  font-weight: 500;
}
.status-chip.running {
  background: var(--success-bg);
  color: var(--success);
}
.status-chip.stopped {
  background: #f5f5f5;
  color: var(--text-muted);
}
.sub-meta {
  display: flex;
  align-items: center;
  gap: 0;
  margin-top: 10px;
  font-size: 13px;
}
.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}
.meta-label {
  color: var(--text-muted);
  font-size: 12px;
}
.meta-value {
  color: var(--text-regular);
}
.meta-value.link {
  color: var(--brand);
  cursor: pointer;
  transition: color var(--transition-fast);
}
.meta-value.link:hover {
  color: #337ecc;
}
.meta-divider {
  width: 1px;
  height: 12px;
  background: var(--border-base);
  margin: 0 12px;
}
.copy-btn {
  cursor: pointer;
  color: var(--text-muted);
  transition: color var(--transition-fast);
}
.copy-btn:hover {
  color: var(--brand);
}
.header-right {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

/* ========== 信息卡片 ========== */
.info-card {
  background: var(--bg-card);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  padding: 20px 24px;
  margin-bottom: 20px;
  border: 1px solid var(--border-base);
}
.info-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--border-light);
}
.card-section-icon {
  color: var(--brand);
  display: flex;
  align-items: center;
}
.card-section-icon.accent {
  color: #e6a23c;
}
.card-section-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}
.info-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px 24px;
}
.info-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.info-label {
  font-size: 12px;
  color: var(--text-muted);
}
.info-value {
  font-size: 14px;
  color: var(--text-regular);
  font-weight: 500;
  word-break: break-all;
}
.info-value.emphasis {
  color: var(--text-primary);
  font-weight: 700;
  font-size: 16px;
}
.info-value.link {
  color: var(--brand);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 3px;
}
.info-value.link:hover {
  color: #337ecc;
}
.dot-indicator {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 4px;
  vertical-align: middle;
}
.dot-indicator.green { background: var(--success); }

/* ========== KPI 卡片 ========== */
.realtime-section {
  display: flex;
  gap: 20px;
}
.kpi-card {
  width: 380px;
  background: var(--bg-card);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  padding: 20px 24px;
  flex-shrink: 0;
  border: 1px solid var(--border-base);
}
.kpi-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--border-light);
}
.mock-badge {
  margin-left: auto;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  background: var(--warning-bg);
  color: var(--warning);
  font-weight: 500;
}
.kpi-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 20px;
}
.kpi-item {
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  background: #fafbfc;
  border-left: 3px solid transparent;
  transition: background var(--transition-fast), border-color var(--transition-fast);
}
.kpi-item:hover {
  background: #f5f7fa;
}
.kpi-real {
  border-left-color: var(--brand);
}
.kpi-stat {
  border-left-color: #c0c4cc;
}
.kpi-alert {
  border-left-color: var(--success);
  grid-column: span 2;
}
.kpi-label {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.help-icon {
  color: var(--text-muted);
  cursor: help;
}
.kpi-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
}
.kpi-value.temp {
  color: #e6a23c;
}
.kpi-value.total {
  font-size: 18px;
  color: var(--text-regular);
}
.kpi-value.alert-ok {
  font-size: 16px;
  font-weight: 600;
  color: var(--success);
}

/* ========== 数据表格 ========== */
.tables-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}
.data-table-card {
  background: var(--bg-card);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-base);
  overflow: hidden;
}
.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: #fafbfc;
  border-bottom: 1px solid var(--border-base);
}
.table-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}
.mock-tag-small {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 8px;
  background: var(--warning-bg);
  color: var(--warning);
  font-weight: 500;
}
.table-inner {
  font-size: 13px;
}
.table-head-row {
  display: grid;
  grid-template-columns: minmax(80px, 1fr) minmax(90px, 1.2fr) minmax(120px, 1.5fr) minmax(90px, 1fr);
  padding: 10px 20px;
  background: #fafbfc;
  border-bottom: 1px solid var(--border-base);
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 500;
}
.table-body {
  max-height: 260px;
  overflow-y: auto;
}
.table-row {
  display: grid;
  grid-template-columns: minmax(80px, 1fr) minmax(90px, 1.2fr) minmax(120px, 1.5fr) minmax(90px, 1fr);
  padding: 10px 20px;
  border-bottom: 1px solid #f5f7fa;
  color: var(--text-regular);
  transition: background var(--transition-fast);
}
.table-row:nth-child(even) {
  background: #fafbfc;
}
.table-row:last-child {
  border-bottom: none;
}
.table-row:hover {
  background: #f0f5ff;
}
.table-row.warning-row {
  background: #fef7f7;
}
.table-row.warning-row:nth-child(even) {
  background: #fef7f7;
}
.th-name, .td-name { grid-column: 1; }
.th-v, .td-v { grid-column: 2; }
.th-i, .td-i { grid-column: 3; }
.th-p, .td-p { grid-column: 4; }
.td-i {
  display: flex;
  align-items: center;
  gap: 8px;
}
.danger-text {
  color: var(--danger);
  font-weight: 600;
}
.low-tag {
  display: inline-flex;
  align-items: center;
  height: 18px;
  padding: 0 6px;
  font-size: 10px;
  border-radius: 4px;
  background: var(--danger);
  color: #fff;
  font-weight: 500;
}
</style>
