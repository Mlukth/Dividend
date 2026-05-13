<template>
  <!--
    DESIGN DNA: animejs.com
    - Warm dark gray (#252423) not pure black
    - Full 8-color accent palette with shade scale
    - Structured token system (--hex-{color}-{level})
    - Section spacers for breathing room
    - Technical/developer-tool aesthetic
    - Clean monospace code blocks
  -->
  <div class="tool-frame">
    <!-- Fixed top bar — animejs style -->
    <header class="topbar">
      <h1 class="topbar-title">
        <span class="title-accent">{{ currentInverter?.name || '--' }}</span>
        <span class="title-dim">/ {{ currentInverter?.sn || '--' }}</span>
      </h1>
      <nav class="topbar-nav">
        <button class="nav-btn" v-for="a in actions" :key="a" @click="() => {}">{{ a }}</button>
      </nav>
    </header>

    <!-- Sidebar — compact inverter list -->
    <aside class="sidebar">
      <input v-model="searchQuery" placeholder="Filter inverters..." class="filter-input" />
      <div class="inv-list">
        <button
          v-for="inv in filteredInverters"
          :key="inv.sn"
          :class="['inv-row', { active: currentInverter?.sn === inv.sn }]"
          @click="selectInverter(inv)"
        >
          <span class="inv-row-name">{{ inv.name }}</span>
          <span class="inv-row-status" :class="inv.alarm === '无' ? 'status-ok' : 'status-warn'">{{ inv.alarm === '无' ? '●' : '●' }}</span>
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <main class="content">
      <!-- Section: KPIs — animejs "toolbox" layout -->
      <section class="section">
        <h2 class="section-heading">Real‑time Metrics</h2>
        <div class="kpi-grid">
          <div class="kpi-card" v-for="kpi in kpiList" :key="kpi.label">
            <span class="kpi-label">{{ kpi.label }}</span>
            <span class="kpi-value" :class="{ 'text-red': kpi.accent && kpi.value !== '无', 'text-green': kpi.label === '报警信息' && kpi.value === '无' }">
              {{ kpi.value }}
            </span>
          </div>
        </div>
      </section>

      <div class="section-spacer"></div>

      <!-- Section: Meta — animejs "feature" layout -->
      <section class="section">
        <h2 class="section-heading">Device Info</h2>
        <div class="meta-grid">
          <div class="meta-item" v-for="m in metaList" :key="m.label">
            <span class="meta-label">{{ m.label }}</span>
            <span class="meta-value">{{ m.value }}</span>
          </div>
        </div>
      </section>

      <div class="section-spacer"></div>

      <!-- Section: Tables — animejs code-block aesthetic -->
      <section class="section">
        <h2 class="section-heading">Electrical Parameters</h2>
        <div class="tables-row">
          <div class="table-box">
            <h3 class="table-box-title">DC Side <code class="mock-badge">sim</code></h3>
            <table class="data-table">
              <thead>
                <tr><th>Channel</th><th>Voltage</th><th>Current</th><th>Power</th></tr>
              </thead>
              <tbody>
                <tr v-for="(r, i) in dcData" :key="i" :class="{ 'row-dim': r.current === 0 }">
                  <td>{{ r.name }}</td>
                  <td>{{ r.voltage }}<span class="unit">V</span></td>
                  <td>{{ r.current }}<span class="unit">A</span></td>
                  <td>{{ r.power }}<span class="unit">W</span></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="table-box">
            <h3 class="table-box-title">AC Side <code class="mock-badge">sim</code></h3>
            <table class="data-table">
              <thead>
                <tr><th>Channel</th><th>Voltage</th><th>Current</th><th>Freq</th></tr>
              </thead>
              <tbody>
                <tr v-for="(r, i) in acData" :key="i">
                  <td>{{ r.name }}</td>
                  <td>{{ r.voltage }}<span class="unit">V</span></td>
                  <td>{{ r.current }}<span class="unit">A</span></td>
                  <td>{{ r.freq }}<span class="unit">Hz</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <div class="section-spacer"></div>
    </main>
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
  { sn: 'SOLAR-2024-A001', name: '1# 逆变器', alarm: '无', model: 'SUN2000-330KTL-H3', ratedPower: '330kW', realPower: '287.5kW', dayEnergy: '1,842.6kWh', dayHours: '5.6h', monthEnergy: '38,215kWh', yearEnergy: '156,420kWh', totalEnergy: '892,671kWh', warrantyStatus: '生效中', warrantyExpire: '2029-06-15', updateTime: '2026-05-07 14:32:05', igbtTemp: '52.3℃', stationName: '阳光光伏电站 #3' },
  { sn: 'SOLAR-2024-A002', name: '2# 逆变器', alarm: '离线', model: 'SUN2000-330KTL-H3', ratedPower: '330kW', realPower: '273.1kW', dayEnergy: '1,756.2kWh', dayHours: '5.3h', monthEnergy: '36,840kWh', yearEnergy: '149,230kWh', totalEnergy: '865,120kWh', warrantyStatus: '生效中', warrantyExpire: '2029-06-15', updateTime: '2026-05-07 14:28:33', igbtTemp: '55.1℃', stationName: '阳光光伏电站 #3' },
  { sn: 'SOLAR-2024-A003', name: '3# 逆变器', alarm: '无', model: 'SUN2000-330KTL-H3', ratedPower: '330kW', realPower: '295.8kW', dayEnergy: '1,901.4kWh', dayHours: '5.8h', monthEnergy: '39,980kWh', yearEnergy: '162,105kWh', totalEnergy: '910,340kWh', warrantyStatus: '即将到期', warrantyExpire: '2026-08-20', updateTime: '2026-05-07 14:31:18', igbtTemp: '49.7℃', stationName: '阳光光伏电站 #3' },
  { sn: 'SOLAR-2024-A004', name: '4# 逆变器', alarm: '无', model: 'SUN2000-215KTL-H3', ratedPower: '215kW', realPower: '188.2kW', dayEnergy: '1,230.5kWh', dayHours: '5.7h', monthEnergy: '25,610kWh', yearEnergy: '98,450kWh', totalEnergy: '541,200kWh', warrantyStatus: '生效中', warrantyExpire: '2028-03-10', updateTime: '2026-05-07 14:29:45', igbtTemp: '47.8℃', stationName: '阳光光伏电站 #3' },
  { sn: 'SOLAR-2024-A005', name: '5# 逆变器', alarm: '停机', model: 'SUN2000-215KTL-H3', ratedPower: '215kW', realPower: '0kW', dayEnergy: '812.0kWh', dayHours: '3.8h', monthEnergy: '18,420kWh', yearEnergy: '76,890kWh', totalEnergy: '432,680kWh', warrantyStatus: '已到期', warrantyExpire: '2025-12-31', updateTime: '2026-05-07 08:15:00', igbtTemp: '32.1℃', stationName: '阳光光伏电站 #3' },
]

const inverterList = ref(MOCK_INVERTERS)
const filteredInverters = computed(() => {
  if (!searchQuery.value) return inverterList.value
  return inverterList.value.filter(inv => inv.name.includes(searchQuery.value) || inv.sn.includes(searchQuery.value))
})

const selectInverter = (inv) => { currentInverter.value = inv }

const actions = ['Control', 'Calibrate', 'Log', 'Back']

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
/* ═══ animejs.com DNA ═══
   --hex-black base: #252423 (warm dark, not pure black)
   --hex-white text: #f6f4f2 (warm white)
   Accent palette: Red #ff4b4b, Green #8dff55, Turquoise #00ffaa
   System: CSS custom properties, 8-level shade scale per color
   Layout: sections + spacers, fixed nav, text-layout containers
*/

.tool-frame {
  position: fixed; inset: 0; top: 60px;
  display: flex;
  background: #252423;
  color: #f6f4f2;
  font-family: system-ui, -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  -webkit-font-smoothing: antialiased;
  overflow: hidden;
}

/* ── Topbar ── */
.topbar {
  position: absolute; top: 0; left: 200px; right: 0;
  height: 48px;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 32px;
  background: #2c2a28;
  border-bottom: 1px solid #3b3937;
  z-index: 10;
}

.topbar-title {
  font-size: 14px; font-weight: 600; margin: 0;
  letter-spacing: -0.01em;
}

.title-accent { color: #f6f4f2; }
.title-dim { color: #706e69; font-weight: 400; font-family: 'SF Mono', 'Consolas', monospace; font-size: 12px; }

.topbar-nav { display: flex; gap: 4px; }
.nav-btn {
  padding: 4px 16px;
  background: none; border: 1px solid #3b3937; border-radius: 4px;
  color: #85837e; font-size: 12px; cursor: pointer;
  transition: all 0.15s;
}
.nav-btn:hover { border-color: #706e69; color: #cccac9; }

/* ── Sidebar ── */
.sidebar {
  width: 200px; flex-shrink: 0;
  background: #2c2a28;
  border-right: 1px solid #3b3937;
  display: flex; flex-direction: column;
  padding-top: 60px;
}

.filter-input {
  margin: 12px;
  padding: 6px 10px;
  background: #3b3937; border: none; border-radius: 4px;
  color: #cccac9; font-size: 12px; outline: none;
}
.filter-input::placeholder { color: #706e69; }
.filter-input:focus { background: #4a4745; }

.inv-list { flex: 1; overflow-y: auto; }
.inv-row {
  display: flex; justify-content: space-between; align-items: center;
  width: 100%; padding: 10px 16px;
  background: none; border: none; color: #85837e;
  font-size: 12px; cursor: pointer; transition: all 0.1s;
}
.inv-row:hover { background: #3b3937; color: #cccac9; }
.inv-row.active { background: #3b3937; color: #f6f4f2; }
.inv-row-name { font-weight: 500; }
.status-ok { color: #8dff55; font-size: 10px; }
.status-warn { color: #ff4b4b; font-size: 10px; }

/* ── Content ── */
.content {
  flex: 1; overflow-y: auto;
  padding: 80px 48px 64px;
  display: flex; flex-direction: column;
}
.content::-webkit-scrollbar { width: 4px; }
.content::-webkit-scrollbar-track { background: transparent; }
.content::-webkit-scrollbar-thumb { background: #3b3937; }

.section { }
.section-heading {
  font-size: 11px; font-weight: 600; color: #706e69;
  letter-spacing: 0.08em; text-transform: uppercase;
  margin: 0 0 20px;
}
.section-spacer { height: 40px; }

/* ── KPI Grid ── */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}
.kpi-card {
  background: #2c2a28;
  border: 1px solid #3b3937;
  border-radius: 6px;
  padding: 20px;
  display: flex; flex-direction: column; gap: 8px;
}
.kpi-label {
  font-size: 11px; color: #85837e;
  letter-spacing: 0.04em; text-transform: uppercase;
}
.kpi-value {
  font-size: 32px; font-weight: 500; color: #f6f4f2;
  letter-spacing: -0.02em; font-variant-numeric: tabular-nums;
  line-height: 1;
}
.text-red { color: #ff4b4b; }
.text-green { color: #8dff55; }

/* ── Meta Grid ── */
.meta-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.meta-item {
  display: flex; flex-direction: column; gap: 4px;
  padding: 12px 16px;
  background: #2c2a28;
  border-radius: 4px;
}
.meta-label { font-size: 10px; color: #706e69; letter-spacing: 0.06em; text-transform: uppercase; }
.meta-value { font-size: 13px; color: #cccac9; font-weight: 500; }

/* ── Tables ── */
.tables-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.table-box {
  background: #2c2a28;
  border: 1px solid #3b3937;
  border-radius: 6px;
  overflow: hidden;
}
.table-box-title {
  font-size: 12px; font-weight: 600; color: #85837e;
  padding: 14px 20px; margin: 0;
  border-bottom: 1px solid #3b3937;
}
.mock-badge {
  font-size: 10px; color: #ffa828; font-weight: 400;
  background: #3b3937; padding: 1px 6px; border-radius: 3px;
  margin-left: 6px;
}
.data-table { width: 100%; border-collapse: collapse; }
.data-table th {
  font-size: 10px; font-weight: 500; color: #5b5855;
  letter-spacing: 0.06em; text-align: left;
  padding: 10px 20px; border-bottom: 1px solid #3b3937;
}
.data-table td {
  font-size: 13px; color: #cccac9; font-variant-numeric: tabular-nums;
  padding: 12px 20px; border-bottom: 1px solid #3b3937;
}
.unit { color: #706e69; font-size: 11px; margin-left: 3px; }
.row-dim td { color: #5b5855; }
</style>
