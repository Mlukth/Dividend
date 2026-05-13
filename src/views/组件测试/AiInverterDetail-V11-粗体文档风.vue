<template>
  <!--
    DESIGN DNA: dixonandmoe.com/rellax
    - Light background (#ffffff), high contrast
    - Source Sans Pro ONLY bold weights (600, 700, 900)
    - Orange accent (#ff8c00 area)
    - Clean documentation-style layout
    - Subtle parallax inspiration ("subtle animations")
    - Bootstrap-like spacing rhythm
  -->
  <div class="doc-frame">
    <!-- Hero header — bold, orange accent -->
    <header class="hero">
      <div class="hero-left">
        <h1 class="hero-title">{{ currentInverter?.name || '--' }}</h1>
        <p class="hero-sn">{{ currentInverter?.sn || '--' }} <span class="hero-station">@ {{ currentInverter?.stationName || '--' }}</span></p>
      </div>
      <div class="hero-actions">
        <button class="btn-primary">Control</button>
        <button class="btn-ghost">Calibrate</button>
        <button class="btn-ghost">Log</button>
      </div>
    </header>

    <div class="doc-body">
      <!-- Sidebar — list -->
      <nav class="doc-sidebar">
        <input v-model="searchQuery" placeholder="Search..." class="sidebar-search" />
        <div class="sidebar-list">
          <a
            v-for="inv in filteredInverters"
            :key="inv.sn"
            :class="['sidebar-link', { active: currentInverter?.sn === inv.sn }]"
            @click="selectInverter(inv)"
          >
            <span>{{ inv.name }}</span>
            <span class="sidebar-badge" :class="inv.alarm === '无' ? 'badge-green' : 'badge-red'">{{ inv.realPower }}</span>
          </a>
        </div>
      </nav>

      <!-- Main content — documentation layout -->
      <main class="doc-main">
        <!-- KPIs — bold numbers like doc headings -->
        <section class="doc-section">
          <h2 class="doc-h2">Real‑time Metrics</h2>
          <div class="kpi-grid">
            <div class="kpi-item" v-for="kpi in kpiList" :key="kpi.label">
              <span class="kpi-value" :class="{ 'text-orange': kpi.accent }">{{ kpi.value }}</span>
              <span class="kpi-label">{{ kpi.label }}</span>
            </div>
          </div>
        </section>

        <!-- Meta — inline definition list -->
        <section class="doc-section">
          <h2 class="doc-h2">Device Information</h2>
          <dl class="def-list">
            <div class="def-item" v-for="m in metaList" :key="m.label">
              <dt>{{ m.label }}</dt>
              <dd>{{ m.value }}</dd>
            </div>
          </dl>
        </section>

        <!-- Tables — documentation code-block style -->
        <section class="doc-section">
          <h2 class="doc-h2">Electrical Parameters</h2>
          <div class="tables-grid">
            <div class="table-block">
              <h3 class="table-caption">DC Side <span class="badge-sim">simulated</span></h3>
              <div class="param-table">
                <div class="param-header">
                  <span>Channel</span><span>Voltage</span><span>Current</span><span>Power</span>
                </div>
                <div class="param-row" v-for="(r, i) in dcData" :key="i" :class="{ 'row-faded': r.current === 0 }">
                  <span>{{ r.name }}</span>
                  <span>{{ r.voltage }} <small>V</small></span>
                  <span>{{ r.current }} <small>A</small></span>
                  <span>{{ r.power }} <small>W</small></span>
                </div>
              </div>
            </div>
            <div class="table-block">
              <h3 class="table-caption">AC Side <span class="badge-sim">simulated</span></h3>
              <div class="param-table">
                <div class="param-header">
                  <span>Channel</span><span>Voltage</span><span>Current</span><span>Freq</span>
                </div>
                <div class="param-row" v-for="(r, i) in acData" :key="i">
                  <span>{{ r.name }}</span>
                  <span>{{ r.voltage }} <small>V</small></span>
                  <span>{{ r.current }} <small>A</small></span>
                  <span>{{ r.freq }} <small>Hz</small></span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const searchQuery = ref('')
const currentInverter = ref({
  sn: 'SOLAR-2024-A001', name: '1# 逆变器', model: 'SUN2000-330KTL-H3', ratedPower: '330kW',
  realPower: '287.5kW', dayEnergy: '1,842.6kWh', dayHours: '5.6h', monthEnergy: '38,215kWh',
  yearEnergy: '156,420kWh', totalEnergy: '892,671kWh', alarm: '无',
  warrantyStatus: '生效中', warrantyExpire: '2029-06-15', updateTime: '2026-05-07 14:32:05',
  igbtTemp: '52.3℃', stationName: '阳光光伏电站 #3',
})

const MOCK_INVERTERS = [
  { sn: 'SOLAR-2024-A001', name: '1# 逆变器', alarm: '无', realPower: '287.5kW', model: 'SUN2000-330KTL-H3', ratedPower: '330kW', dayEnergy: '1,842.6kWh', dayHours: '5.6h', monthEnergy: '38,215kWh', yearEnergy: '156,420kWh', totalEnergy: '892,671kWh', warrantyStatus: '生效中', warrantyExpire: '2029-06-15', updateTime: '2026-05-07 14:32:05', igbtTemp: '52.3℃', stationName: '阳光光伏电站 #3' },
  { sn: 'SOLAR-2024-A002', name: '2# 逆变器', alarm: '离线', realPower: '273.1kW', model: 'SUN2000-330KTL-H3', ratedPower: '330kW', dayEnergy: '1,756.2kWh', dayHours: '5.3h', monthEnergy: '36,840kWh', yearEnergy: '149,230kWh', totalEnergy: '865,120kWh', warrantyStatus: '生效中', warrantyExpire: '2029-06-15', updateTime: '2026-05-07 14:28:33', igbtTemp: '55.1℃', stationName: '阳光光伏电站 #3' },
  { sn: 'SOLAR-2024-A003', name: '3# 逆变器', alarm: '无', realPower: '295.8kW', model: 'SUN2000-330KTL-H3', ratedPower: '330kW', dayEnergy: '1,901.4kWh', dayHours: '5.8h', monthEnergy: '39,980kWh', yearEnergy: '162,105kWh', totalEnergy: '910,340kWh', warrantyStatus: '即将到期', warrantyExpire: '2026-08-20', updateTime: '2026-05-07 14:31:18', igbtTemp: '49.7℃', stationName: '阳光光伏电站 #3' },
  { sn: 'SOLAR-2024-A004', name: '4# 逆变器', alarm: '无', realPower: '188.2kW', model: 'SUN2000-215KTL-H3', ratedPower: '215kW', dayEnergy: '1,230.5kWh', dayHours: '5.7h', monthEnergy: '25,610kWh', yearEnergy: '98,450kWh', totalEnergy: '541,200kWh', warrantyStatus: '生效中', warrantyExpire: '2028-03-10', updateTime: '2026-05-07 14:29:45', igbtTemp: '47.8℃', stationName: '阳光光伏电站 #3' },
  { sn: 'SOLAR-2024-A005', name: '5# 逆变器', alarm: '停机', realPower: '0kW', model: 'SUN2000-215KTL-H3', ratedPower: '215kW', dayEnergy: '812.0kWh', dayHours: '3.8h', monthEnergy: '18,420kWh', yearEnergy: '76,890kWh', totalEnergy: '432,680kWh', warrantyStatus: '已到期', warrantyExpire: '2025-12-31', updateTime: '2026-05-07 08:15:00', igbtTemp: '32.1℃', stationName: '阳光光伏电站 #3' },
]

const inverterList = ref(MOCK_INVERTERS)
const filteredInverters = computed(() => {
  if (!searchQuery.value) return inverterList.value
  return inverterList.value.filter(inv => inv.name.includes(searchQuery.value) || inv.sn.includes(searchQuery.value))
})
const selectInverter = (inv) => { currentInverter.value = inv }

const kpiList = computed(() => {
  const inv = currentInverter.value; if (!inv) return []
  return [
    { label: 'Real Power', value: inv.realPower },
    { label: 'Day Energy', value: inv.dayEnergy },
    { label: 'Day Full Hours', value: inv.dayHours },
    { label: 'Month Energy', value: inv.monthEnergy },
    { label: 'Alarms', value: inv.alarm, accent: inv.alarm !== '无' },
    { label: 'Year Energy', value: inv.yearEnergy },
    { label: 'IGBT Temp', value: inv.igbtTemp },
    { label: 'Total Energy', value: inv.totalEnergy },
  ]
})

const metaList = computed(() => {
  const inv = currentInverter.value; if (!inv) return []
  return [
    { label: 'Model', value: inv.model },
    { label: 'Rated Power', value: inv.ratedPower },
    { label: 'Station', value: inv.stationName },
    { label: 'Warranty', value: inv.warrantyStatus },
    { label: 'Warranty Expire', value: inv.warrantyExpire },
    { label: 'Updated', value: inv.updateTime },
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
</script>

<style scoped>
/* ═══ dixonandmoe.com/rellax DNA ═══
   Light bg #fff, high contrast text #333
   Source Sans Pro bold-only (600, 700, 900)
   Orange accent #ff8c00
   Documentation layout — clear hierarchy, code blocks
   Subtle shadows, thin borders, minimal radius
*/

.doc-frame {
  position: fixed; inset: 0; top: 60px;
  display: flex; flex-direction: column;
  background: #ffffff;
  color: #333333;
  font-family: 'Source Sans Pro', 'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif;
  font-weight: 600;
  overflow: hidden;
  -webkit-font-smoothing: antialiased;
}

/* ── Hero ── */
.hero {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: 48px 56px 32px;
  border-bottom: 1px solid #e9ebed;
  background: #fafbfc;
}

.hero-title {
  font-size: 42px; font-weight: 900; color: #1a1a1a;
  margin: 0; letter-spacing: -0.02em; line-height: 1.1;
}

.hero-sn {
  font-size: 14px; font-weight: 600; color: #888; margin: 8px 0 0;
}

.hero-station { color: #ff8c00; }

.hero-actions { display: flex; gap: 8px; }

.btn-primary {
  padding: 10px 24px;
  background: #ff8c00; color: #fff;
  border: none; border-radius: 4px;
  font-family: inherit; font-size: 14px; font-weight: 700;
  cursor: pointer; transition: background 0.15s;
}
.btn-primary:hover { background: #e67e00; }

.btn-ghost {
  padding: 10px 24px;
  background: none; color: #666;
  border: 1px solid #dde0e4; border-radius: 4px;
  font-family: inherit; font-size: 14px; font-weight: 600;
  cursor: pointer; transition: all 0.15s;
}
.btn-ghost:hover { border-color: #ff8c00; color: #ff8c00; }

/* ── Body layout ── */
.doc-body {
  display: flex; flex: 1; overflow: hidden;
}

/* ── Sidebar ── */
.doc-sidebar {
  width: 220px; flex-shrink: 0;
  border-right: 1px solid #e9ebed;
  background: #fafbfc;
  display: flex; flex-direction: column;
}

.sidebar-search {
  margin: 16px; padding: 8px 12px;
  border: 1px solid #dde0e4; border-radius: 4px;
  font-family: inherit; font-size: 13px; font-weight: 600;
  color: #333; outline: none;
}
.sidebar-search::placeholder { color: #aaa; font-weight: 400; }
.sidebar-search:focus { border-color: #ff8c00; }

.sidebar-list { flex: 1; overflow-y: auto; }
.sidebar-link {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 16px;
  font-size: 13px; font-weight: 600; color: #666;
  cursor: pointer; transition: all 0.1s;
  text-decoration: none; border-left: 3px solid transparent;
}
.sidebar-link:hover { background: #f0f1f3; color: #333; }
.sidebar-link.active { background: #fff; color: #ff8c00; border-left-color: #ff8c00; }

.sidebar-badge { font-size: 11px; font-weight: 700; }
.badge-green { color: #27ae60; }
.badge-red { color: #e74c3c; }

/* ── Main ── */
.doc-main {
  flex: 1; overflow-y: auto;
  padding: 48px 56px 64px;
  display: flex; flex-direction: column; gap: 48px;
}

.doc-section { }
.doc-h2 {
  font-size: 20px; font-weight: 900; color: #1a1a1a;
  margin: 0 0 24px; letter-spacing: -0.01em;
}

/* ── KPI Grid ── */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.kpi-item {
  display: flex; flex-direction: column-reverse; gap: 4px;
  padding: 24px; border: 1px solid #e9ebed; border-radius: 6px;
  background: #fff;
}

.kpi-value {
  font-size: 36px; font-weight: 900; color: #1a1a1a;
  letter-spacing: -0.02em; font-variant-numeric: tabular-nums;
  line-height: 1;
}

.kpi-label {
  font-size: 12px; font-weight: 600; color: #999;
  text-transform: uppercase; letter-spacing: 0.05em;
}

.text-orange { color: #ff8c00; }

/* ── Definition list ── */
.def-list {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 0; margin: 0;
  border: 1px solid #e9ebed; border-radius: 6px;
  overflow: hidden;
}

.def-item {
  display: flex; flex-direction: column; gap: 4px;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f1f3;
  border-right: 1px solid #f0f1f3;
}

.def-item:nth-child(3n) { border-right: none; }
.def-item:nth-last-child(-n+3) { border-bottom: none; }

dt {
  font-size: 11px; font-weight: 600; color: #aaa;
  text-transform: uppercase; letter-spacing: 0.06em;
}

dd {
  font-size: 14px; font-weight: 700; color: #333; margin: 0;
}

/* ── Tables ── */
.tables-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }

.table-block {
  border: 1px solid #e9ebed; border-radius: 6px;
  overflow: hidden;
}

.table-caption {
  font-size: 13px; font-weight: 700; color: #555;
  padding: 16px 20px; margin: 0;
  background: #fafbfc;
  border-bottom: 1px solid #e9ebed;
}

.badge-sim {
  font-size: 10px; font-weight: 600; color: #fff;
  background: #ff8c00; padding: 2px 6px; border-radius: 3px;
  margin-left: 8px; text-transform: uppercase;
}

.param-table { }
.param-header {
  display: grid; grid-template-columns: 1.2fr 1fr 1fr 1fr;
  padding: 10px 20px;
  background: #fafbfc; border-bottom: 1px solid #e9ebed;
  font-size: 10px; font-weight: 700; color: #aaa;
  text-transform: uppercase; letter-spacing: 0.06em;
}

.param-row {
  display: grid; grid-template-columns: 1.2fr 1fr 1fr 1fr;
  padding: 14px 20px; border-bottom: 1px solid #f5f6f7;
  font-size: 13px; font-weight: 600; color: #444;
  font-variant-numeric: tabular-nums;
}

.param-row small { font-size: 11px; color: #aaa; margin-left: 2px; }
.row-faded { color: #ccc; }
</style>
