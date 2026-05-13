<template>
  <div class="instrument-frame" :class="{ 'sidebar-open': !isCollapsed }">
    <!-- ── 侧栏：纯文字逆变器列表 ── -->
    <aside class="sidebar">
      <div class="sidebar-search">
        <input
          v-model="searchQuery"
          placeholder="搜索逆变器..."
          class="search-input"
        />
      </div>
      <nav class="inverter-list">
        <button
          v-for="inv in filteredInverters"
          :key="inv.sn"
          :class="['inv-item', { active: currentInverter?.sn === inv.sn }]"
          @click="selectInverter(inv)"
        >
          <span class="inv-name">{{ inv.name }}</span>
          <span class="inv-sn">{{ inv.sn }}</span>
        </button>
        <div v-if="filteredInverters.length === 0 && !listLoading" class="empty-list">
          暂无逆变器
        </div>
      </nav>
    </aside>

    <!-- ── 折叠把手 ── -->
    <button class="toggle-btn" @click="isCollapsed = !isCollapsed">
      {{ isCollapsed ? '◀' : '▶' }}
    </button>

    <!-- ── 主内容区 ── -->
    <main class="main-panel" v-if="currentInverter">
      <!-- 顶部：标题行 — 借鉴 canals 的大标题 + 红色强调 -->
      <header class="panel-header">
        <div class="header-primary">
          <h1 class="device-title">{{ currentInverter.name }}</h1>
          <span class="device-sn reveal-text">{{ currentInverter.sn }}</span>
        </div>
        <div class="header-actions">
          <button class="action-btn" @click="handleControl">控制</button>
          <button class="action-btn" @click="handleCalibrate">校准</button>
          <button class="action-btn" @click="handleLog">日志</button>
          <button class="action-btn ghost" @click="goBack">返回</button>
        </div>
      </header>

      <!-- 设备元数据 — 排版驱动的信息行 -->
      <section class="meta-strip">
        <div class="meta-item">
          <span class="meta-label">型号</span>
          <span class="meta-value">{{ currentInverter.model }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">额定功率</span>
          <span class="meta-value">{{ currentInverter.ratedPower }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">所属电站</span>
          <span class="meta-value link" @click="goToStation">{{ currentStation.name }} ↗</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">质保</span>
          <span class="meta-value accent">{{ currentInverter.warrantyStatus }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">更新时间</span>
          <span class="meta-value dim">{{ currentInverter.updateTime }}</span>
        </div>
      </section>

      <!-- KPI 数字 — 借鉴 canals 的排版力量：大数字 + 小标签 -->
      <section class="kpi-grid">
        <div class="kpi-block" v-for="kpi in kpiList" :key="kpi.label">
          <span class="kpi-label">{{ kpi.label }}</span>
          <span :class="['kpi-number', { 'kpi-accent': kpi.accent }]">{{ kpi.value }}</span>
        </div>
      </section>

      <!-- 直流/交流参数 — 排版表格，零边框 -->
      <section class="data-tables">
        <div class="table-block">
          <h2 class="table-title">直流侧</h2>
          <div class="type-table">
            <div class="type-table-header">
              <span>通道</span>
              <span>电压 V</span>
              <span>电流 A</span>
              <span>功率 W</span>
            </div>
            <div
              v-for="(item, idx) in dcData"
              :key="idx"
              :class="['type-table-row', { 'row-warn': isLowCurrent(item.current) }]"
            >
              <span>{{ item.name }}</span>
              <span>{{ item.voltage }}</span>
              <span>
                {{ item.current }}
                <small v-if="isLowCurrent(item.current)" class="warn-tag">低电流</small>
              </span>
              <span>{{ item.power }}</span>
            </div>
          </div>
        </div>
        <div class="table-block">
          <h2 class="table-title">交流侧</h2>
          <div class="type-table">
            <div class="type-table-header">
              <span>通道</span>
              <span>电压 V</span>
              <span>电流 A</span>
              <span>频率 Hz</span>
            </div>
            <div v-for="(item, idx) in acData" :key="idx" class="type-table-row">
              <span>{{ item.name }}</span>
              <span>{{ item.voltage }}</span>
              <span>{{ item.current }}</span>
              <span>{{ item.freq }}</span>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- 空状态 -->
    <main class="main-panel empty-state" v-else>
      <p class="empty-text">从左侧选择逆变器</p>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const isCollapsed = ref(false)
const searchQuery = ref('')
const lowCurrentThreshold = ref(0.15)

// Mock 数据 — 独立测试组件，不依赖外部 API
const MOCK_INVERTERS = [
  { sn: 'SOLAR-2024-A001', name: '1# 逆变器', model: 'SUN2000-330KTL-H3', ratedPower: '330kW', realPower: '287.5kW', dayEnergy: '1,842.6kWh', dayHours: '5.6h', monthEnergy: '38,215kWh', yearEnergy: '156,420kWh', totalEnergy: '892,671kWh', alarm: '无', warrantyStatus: '生效中', warrantyExpire: '2029-06-15', updateTime: '2026-05-07 14:32:05', igbtTemp: '52.3℃', stationName: '阳光光伏电站 #3' },
  { sn: 'SOLAR-2024-A002', name: '2# 逆变器', model: 'SUN2000-330KTL-H3', ratedPower: '330kW', realPower: '273.1kW', dayEnergy: '1,756.2kWh', dayHours: '5.3h', monthEnergy: '36,840kWh', yearEnergy: '149,230kWh', totalEnergy: '865,120kWh', alarm: '离线', warrantyStatus: '生效中', warrantyExpire: '2029-06-15', updateTime: '2026-05-07 14:28:33', igbtTemp: '55.1℃', stationName: '阳光光伏电站 #3' },
  { sn: 'SOLAR-2024-A003', name: '3# 逆变器', model: 'SUN2000-330KTL-H3', ratedPower: '330kW', realPower: '295.8kW', dayEnergy: '1,901.4kWh', dayHours: '5.8h', monthEnergy: '39,980kWh', yearEnergy: '162,105kWh', totalEnergy: '910,340kWh', alarm: '无', warrantyStatus: '即将到期', warrantyExpire: '2026-08-20', updateTime: '2026-05-07 14:31:18', igbtTemp: '49.7℃', stationName: '阳光光伏电站 #3' },
  { sn: 'SOLAR-2024-A004', name: '4# 逆变器', model: 'SUN2000-215KTL-H3', ratedPower: '215kW', realPower: '188.2kW', dayEnergy: '1,230.5kWh', dayHours: '5.7h', monthEnergy: '25,610kWh', yearEnergy: '98,450kWh', totalEnergy: '541,200kWh', alarm: '无', warrantyStatus: '生效中', warrantyExpire: '2028-03-10', updateTime: '2026-05-07 14:29:45', igbtTemp: '47.8℃', stationName: '阳光光伏电站 #3' },
  { sn: 'SOLAR-2024-A005', name: '5# 逆变器', model: 'SUN2000-215KTL-H3', ratedPower: '215kW', realPower: '0kW', dayEnergy: '812.0kWh', dayHours: '3.8h', monthEnergy: '18,420kWh', yearEnergy: '76,890kWh', totalEnergy: '432,680kWh', alarm: '停机', warrantyStatus: '已到期', warrantyExpire: '2025-12-31', updateTime: '2026-05-07 08:15:00', igbtTemp: '32.1℃', stationName: '阳光光伏电站 #3' },
]

const currentStation = ref({ id: 'STATION-03', name: '阳光光伏电站 #3' })
const inverterList = ref(MOCK_INVERTERS)
const currentInverter = ref(MOCK_INVERTERS[0])

const filteredInverters = computed(() => {
  if (!searchQuery.value) return inverterList.value
  return inverterList.value.filter(inv => inv.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
})

const selectInverter = (inv) => {
  currentInverter.value = inv
}

const kpiList = computed(() => {
  if (!currentInverter.value) return []
  const inv = currentInverter.value
  return [
    { label: '实时功率', value: inv.realPower },
    { label: '当日发电', value: inv.dayEnergy },
    { label: '日满发小时', value: inv.dayHours },
    { label: '当月发电', value: inv.monthEnergy },
    { label: '报警信息', value: inv.alarm, accent: true },
    { label: '当年发电', value: inv.yearEnergy },
    { label: 'IGBT温度', value: inv.igbtTemp },
    { label: '累计发电', value: inv.totalEnergy },
  ]
})

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
const goToStation = () => {}
const goBack = () => {}
const handleControl = () => {}
const handleCalibrate = () => {}
const handleLog = () => {}
</script>

<style scoped>
/* ═══════════════════════════════════════════════════════
   DESIGN DNA SOURCE: canals-amsterdam.com
   Principles applied:
   - #000 true black (not dark blue)
   - Typography as the ONLY hierarchy tool (no cards)
   - Zero borders, zero shadows, zero border-radius
   - letter-spacing: tight for impact, wide for labels
   - Red (#f00000) as singular accent
   - cubic-bezier(.23, 1, .32, 1) for reveals
   - transform-based animations
   ═══════════════════════════════════════════════════════ */

/* ── Canvas-level frame ── */
.instrument-frame {
  position: fixed;
  inset: 0;
  top: 60px; /* 留出顶部导航 */
  display: flex;
  background: #000;
  color: #ffffff;
  font-family: 'Inter', 'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif;
  overflow: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ── Sidebar: text-only inverter list ── */
.sidebar {
  width: 0;
  overflow: hidden;
  background: #080808;
  border-right: 1px solid #1a1a1a;
  transition: width 400ms cubic-bezier(.23, 1, .32, 1);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.instrument-frame.sidebar-open .sidebar {
  width: 240px;
}

.sidebar-search {
  padding: 20px 16px 12px;
  flex-shrink: 0;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  background: #0d0d0d;
  border: none;
  border-bottom: 1px solid #222;
  color: #ccc;
  font-size: 13px;
  letter-spacing: 0.02em;
  outline: none;
  transition: border-color 0.3s;
}

.search-input:focus {
  border-bottom-color: #555;
}

.search-input::placeholder {
  color: #444;
}

.inverter-list {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
}

.inv-item {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 12px 16px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s;
  gap: 2px;
}

.inv-item:hover {
  background: #0f0f0f;
}

.inv-item.active {
  background: #141414;
}

.inv-item.active .inv-name {
  color: #fff;
}

.inv-name {
  font-size: 13px;
  font-weight: 500;
  color: #999;
  letter-spacing: -0.01em;
  transition: color 0.2s;
}

.inv-sn {
  font-size: 11px;
  color: #444;
  letter-spacing: 0.02em;
  font-family: 'SF Mono', 'Cascadia Code', 'Consolas', monospace;
}

.empty-list {
  padding: 24px 16px;
  font-size: 13px;
  color: #444;
  text-align: center;
}

/* ── Toggle ── */
.toggle-btn {
  width: 28px;
  background: none;
  border: none;
  color: #555;
  font-size: 11px;
  cursor: pointer;
  flex-shrink: 0;
  transition: color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-btn:hover {
  color: #999;
}

/* ── Main panel ── */
.main-panel {
  flex: 1;
  padding: 40px 48px 48px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 40px;
}

/* Scrollbar */
.main-panel::-webkit-scrollbar { width: 4px; }
.main-panel::-webkit-scrollbar-track { background: transparent; }
.main-panel::-webkit-scrollbar-thumb { background: #1a1a1a; }
.inverter-list::-webkit-scrollbar { width: 4px; }
.inverter-list::-webkit-scrollbar-track { background: transparent; }
.inverter-list::-webkit-scrollbar-thumb { background: #1a1a1a; }

/* ── Header: canals-style title with SN ── */
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-primary {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.device-title {
  font-size: 36px;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: #fff;
  margin: 0;
  line-height: 1.1;
}

.device-sn {
  font-size: 13px;
  color: #555;
  letter-spacing: 0.04em;
  font-family: 'SF Mono', 'Cascadia Code', 'Consolas', monospace;
}

.header-actions {
  display: flex;
  gap: 0;
}

.action-btn {
  padding: 8px 20px;
  background: none;
  border: 1px solid #222;
  color: #888;
  font-size: 13px;
  letter-spacing: 0.03em;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(.23, 1, .32, 1);
  margin-left: -1px; /* 边框重叠 */
}

.action-btn:first-child {
  margin-left: 0;
}

.action-btn:hover {
  color: #fff;
  border-color: #555;
}

.action-btn.ghost {
  border-color: transparent;
  color: #555;
}

.action-btn.ghost:hover {
  color: #f00000;
}

/* ── Meta strip: typographic data row ── */
.meta-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.meta-label {
  font-size: 11px;
  color: #444;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.meta-value {
  font-size: 14px;
  font-weight: 500;
  color: #bbb;
  letter-spacing: -0.01em;
}

.meta-value.accent {
  color: #00cc88;
}

.meta-value.link {
  color: #888;
  cursor: pointer;
  transition: color 0.2s;
}

.meta-value.link:hover {
  color: #fff;
}

.meta-value.dim {
  color: #555;
}

/* ── KPI Grid: numbers as headlines ── */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 40px 24px;
}

.kpi-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.kpi-label {
  font-size: 11px;
  color: #444;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.kpi-number {
  font-size: 48px;
  font-weight: 300;
  color: #ddd;
  letter-spacing: -0.04em;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.kpi-accent {
  color: #f00000;
  font-weight: 400;
}

/* ── Data tables: typographic, no boxes ── */
.data-tables {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
}

.table-block {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.table-title {
  font-size: 14px;
  font-weight: 600;
  color: #888;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin: 0;
}

.type-table {
  display: flex;
  flex-direction: column;
}

.type-table-header {
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr 1fr;
  padding: 10px 0;
  border-bottom: 1px solid #1a1a1a;
  font-size: 11px;
  color: #444;
  letter-spacing: 0.05em;
}

.type-table-row {
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr 1fr;
  padding: 12px 0;
  border-bottom: 1px solid #0d0d0d;
  font-size: 14px;
  color: #bbb;
  font-variant-numeric: tabular-nums;
  transition: background 0.2s;
}

.type-table-row:hover {
  background: #0a0a0a;
}

.row-warn {
  color: #f00000;
}

.warn-tag {
  margin-left: 6px;
  font-size: 10px;
  color: #f00000;
  letter-spacing: 0.04em;
}

/* ── Empty state ── */
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-text {
  font-size: 16px;
  color: #333;
  letter-spacing: 0.05em;
}

/* ── Animation: section reveal on mount ── */
.panel-header,
.meta-strip,
.kpi-grid,
.data-tables {
  animation: reveal-up 800ms cubic-bezier(.23, 1, .32, 1) both;
}

.panel-header   { animation-delay: 0ms; }
.meta-strip     { animation-delay: 80ms; }
.kpi-grid       { animation-delay: 160ms; }
.data-tables    { animation-delay: 240ms; }

@keyframes reveal-up {
  from {
    opacity: 0;
    transform: translate3d(0, 24px, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}
</style>
