<template>
  <!--
    DESIGN DNA: niccolomiranda.com + canals typography
    - Paper/cream background (#f5f5f0)
    - Print-inspired typography — dramatic size contrast
    - Magazine layout: wide margins, narrow text columns
    - Scroll-reveal animations (translate3d + opacity)
    - Minimal chrome, no shadows
    - Serif/system font elegance
  -->
  <div class="magazine-frame">
    <!-- Masthead -->
    <header class="masthead">
      <h1 class="masthead-title">{{ currentInverter?.name || '--' }}</h1>
      <div class="masthead-meta">
        <span>{{ currentInverter?.sn || '--' }}</span>
        <span class="meta-sep">·</span>
        <span>{{ currentInverter?.stationName || '--' }}</span>
        <span class="meta-sep">·</span>
        <span>{{ currentInverter?.updateTime || '--' }}</span>
      </div>
    </header>

    <!-- Layout: sidebar + main -->
    <div class="mag-body">
      <!-- Sidebar — table of contents style -->
      <nav class="toc">
        <div class="toc-search">
          <input v-model="searchQuery" placeholder="Search..." class="toc-input" />
        </div>
        <ul class="toc-list">
          <li
            v-for="inv in filteredInverters"
            :key="inv.sn"
            :class="['toc-item', { active: currentInverter?.sn === inv.sn }]"
            @click="selectInverter(inv)"
          >
            <span class="toc-name">{{ inv.name }}</span>
            <span class="toc-status">{{ inv.alarm === '无' ? 'Normal' : inv.alarm }}</span>
          </li>
        </ul>
      </nav>

      <!-- Main article -->
      <main class="article">
        <!-- Lead paragraph — the numbers that matter most -->
        <section class="lead-section">
          <p class="lead-label">At a Glance</p>
          <div class="lead-numbers">
            <div class="lead-number" v-for="kpi in kpiList.slice(0, 4)" :key="kpi.label">
              <span class="lead-value" :class="{ 'accent-red': kpi.accent }">{{ kpi.value }}</span>
              <span class="lead-caption">{{ kpi.label }}</span>
            </div>
          </div>
        </section>

        <!-- Body section: more KPIs -->
        <section class="body-section">
          <div class="body-kpis">
            <div class="body-kpi" v-for="kpi in kpiList.slice(4)" :key="kpi.label">
              <span class="body-kpi-value" :class="{ 'accent-red': kpi.accent }">{{ kpi.value }}</span>
              <span class="body-kpi-label">{{ kpi.label }}</span>
            </div>
          </div>
        </section>

        <!-- Section divider — canals inspired thin line -->
        <hr class="section-rule" />

        <!-- Device info — prose style -->
        <section class="body-section">
          <h2 class="section-title">Device Information</h2>
          <div class="prose-grid">
            <div class="prose-item" v-for="m in metaList" :key="m.label">
              <span class="prose-label">{{ m.label }}</span>
              <span class="prose-value">{{ m.value }}</span>
            </div>
          </div>
        </section>

        <hr class="section-rule" />

        <!-- Tables — magazine data style -->
        <section class="body-section">
          <h2 class="section-title">Electrical Parameters</h2>
          <div class="mag-tables">
            <div class="mag-table">
              <h3 class="mag-table-title">DC Side</h3>
              <div class="mag-table-rows">
                <div class="mag-row head">
                  <span>Channel</span><span>V</span><span>A</span><span>W</span>
                </div>
                <div class="mag-row" v-for="(r, i) in dcData" :key="i" :class="{ dim: r.current === 0 }">
                  <span>{{ r.name }}</span><span>{{ r.voltage }}</span><span>{{ r.current }}</span><span>{{ r.power }}</span>
                </div>
              </div>
            </div>
            <div class="mag-table">
              <h3 class="mag-table-title">AC Side</h3>
              <div class="mag-table-rows">
                <div class="mag-row head">
                  <span>Channel</span><span>V</span><span>A</span><span>Hz</span>
                </div>
                <div class="mag-row" v-for="(r, i) in acData" :key="i">
                  <span>{{ r.name }}</span><span>{{ r.voltage }}</span><span>{{ r.current }}</span><span>{{ r.freq }}</span>
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
/* ═══ niccolomiranda.com DNA ═══
   Paper cream bg (#f5f5f0), high-contrast text (#1a1a1a)
   Magazine layout — wide margins, narrow body
   Dramatic size contrast (display → body → caption)
   Scroll-reveal animations
   No shadows, no radii — pure print aesthetic
   Thin rules (hr) for section separation
*/

.magazine-frame {
  position: fixed; inset: 0; top: 60px;
  display: flex; flex-direction: column;
  background: #f5f5f0;
  color: #1a1a1a;
  font-family: 'Georgia', 'Noto Serif SC', 'STSong', 'SimSun', 'Songti SC', serif;
  overflow: hidden;
  -webkit-font-smoothing: antialiased;
}

/* ── Masthead ── */
.masthead {
  background: #f5f5f0;
  padding: 56px 80px 32px;
  border-bottom: 1px solid #ddd9ce;
}

.masthead-title {
  font-size: 56px; font-weight: 400; color: #1a1a1a;
  margin: 0; letter-spacing: -0.02em; line-height: 1.05;
}

.masthead-meta {
  margin-top: 16px;
  font-size: 14px; color: #999; font-family: system-ui, -apple-system, 'PingFang SC', sans-serif;
  letter-spacing: 0.02em;
}

.meta-sep { margin: 0 8px; color: #ccc; }

/* ── Body layout ── */
.mag-body { display: flex; flex: 1; overflow: hidden; }

/* ── TOC sidebar ── */
.toc {
  width: 240px; flex-shrink: 0;
  background: #efeee8;
  border-right: 1px solid #ddd9ce;
  display: flex; flex-direction: column;
}

.toc-search { padding: 20px; }
.toc-input {
  width: 100%; padding: 10px 14px;
  border: none; background: #f5f5f0;
  font-family: system-ui, sans-serif; font-size: 13px;
  color: #1a1a1a; outline: none;
}
.toc-input::placeholder { color: #bbb; }
.toc-input:focus { background: #fff; }

.toc-list { flex: 1; overflow-y: auto; list-style: none; padding: 0; margin: 0; }
.toc-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 20px;
  font-family: system-ui, sans-serif; font-size: 13px;
  color: #999; cursor: pointer; transition: all 0.15s;
  border-left: 3px solid transparent;
}
.toc-item:hover { color: #555; background: #eae9e2; }
.toc-item.active { color: #1a1a1a; background: #f5f5f0; border-left-color: #c0392b; font-weight: 600; }
.toc-status { font-size: 11px; color: #bbb; }

/* ── Article ── */
.article {
  flex: 1; overflow-y: auto;
  padding: 48px 80px 80px;
  max-width: 960px;
}
.article::-webkit-scrollbar { width: 4px; }
.article::-webkit-scrollbar-track { background: transparent; }
.article::-webkit-scrollbar-thumb { background: #ddd9ce; }

/* ── Lead section ── */
.lead-section { margin-bottom: 48px; }
.lead-label {
  font-family: system-ui, sans-serif;
  font-size: 11px; font-weight: 600; color: #bbb;
  text-transform: uppercase; letter-spacing: 0.12em;
  margin: 0 0 24px;
}

.lead-numbers {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 32px;
}

.lead-number {
  display: flex; flex-direction: column; gap: 6px;
}

.lead-value {
  font-size: 56px; font-weight: 400; color: #1a1a1a;
  letter-spacing: -0.03em; line-height: 1; font-variant-numeric: tabular-nums;
}

.lead-caption {
  font-family: system-ui, sans-serif;
  font-size: 11px; font-weight: 500; color: #bbb;
  text-transform: uppercase; letter-spacing: 0.06em;
}

.accent-red { color: #c0392b; }

/* ── Body section ── */
.body-section { margin-bottom: 48px; }

.body-kpis {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.body-kpi {
  display: flex; flex-direction: column; gap: 4px;
}

.body-kpi-value {
  font-size: 32px; font-weight: 400; color: #444;
  letter-spacing: -0.02em; font-variant-numeric: tabular-nums;
  line-height: 1;
}

.body-kpi-label {
  font-family: system-ui, sans-serif;
  font-size: 11px; color: #bbb; text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* ── Section rule ── */
.section-rule {
  border: none; border-top: 1px solid #ddd9ce;
  margin: 0 0 48px;
}

/* ── Section title ── */
.section-title {
  font-size: 18px; font-weight: 400; color: #555;
  margin: 0 0 24px; letter-spacing: -0.01em;
}

/* ── Prose grid ── */
.prose-grid {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 20px 40px;
}

.prose-item {
  display: flex; flex-direction: column; gap: 4px;
}

.prose-label {
  font-family: system-ui, sans-serif;
  font-size: 10px; color: #ccc; text-transform: uppercase;
  letter-spacing: 0.08em;
}

.prose-value {
  font-size: 15px; color: #444;
}

/* ── Magazine tables ── */
.mag-tables { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; }

.mag-table-title {
  font-family: system-ui, sans-serif;
  font-size: 13px; font-weight: 600; color: #999;
  margin: 0 0 16px; letter-spacing: 0.04em;
}

.mag-table-rows { }
.mag-row {
  display: grid; grid-template-columns: 1.2fr 1fr 1fr 1fr;
  padding: 12px 0; border-bottom: 1px solid #e8e5da;
  font-size: 14px; font-variant-numeric: tabular-nums; color: #555;
}

.mag-row.head {
  font-family: system-ui, sans-serif;
  font-size: 10px; color: #ccc; text-transform: uppercase;
  letter-spacing: 0.08em; border-bottom-color: #ddd9ce;
}

.mag-row.dim { color: #ddd; }
</style>
