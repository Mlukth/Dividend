<template>
  <!--
    DEEP DNA: niccolomiranda.com + canals typography
    - TYPE IS THE INTERFACE — text IS the visual element
    - Numbers as display type: 120px+, overlapping, dramatic scale jumps
    - No card containers — values float in typographic space
    - Labels as tiny annotations next to massive figures
    - Print-inspired: asymmetrical balance, intentional whitespace
    - This is NOT a dashboard. It's a typographic data composition.
  -->
  <div class="type-space">
    <!-- Inverter switcher — minimal text strip -->
    <nav class="type-nav">
      <button
        v-for="inv in inverterList"
        :key="inv.sn"
        :class="['type-nav-item', { active: currentInverter?.sn === inv.sn }]"
        @click="selectInverter(inv)"
      >
        {{ inv.name }}
      </button>
    </nav>

    <!-- The composition -->
    <main class="composition">
      <!-- Row 1: Device identity — asymmetric -->
      <div class="comp-row identity-row">
        <div class="identity-block">
          <h1 class="mega-name">{{ currentInverter?.name || '--' }}</h1>
          <span class="micro-sn">{{ currentInverter?.sn }}</span>
        </div>
        <div class="identity-meta">
          <span class="meta-line">{{ currentInverter?.model }}</span>
          <span class="meta-line">{{ currentInverter?.stationName }}</span>
          <span class="meta-line dim">{{ currentInverter?.updateTime }}</span>
        </div>
      </div>

      <!-- Row 2: The BIG number — real power as display type -->
      <div class="comp-row power-row">
        <div class="power-block">
          <span class="power-number">{{ currentInverter?.realPower || '--' }}</span>
          <span class="power-annotation">Real‑time<br>Power</span>
        </div>
        <div class="power-secondary">
          <span class="sec-value">{{ currentInverter?.dayEnergy || '--' }} <small>today</small></span>
          <span class="sec-value">{{ currentInverter?.dayHours || '--' }} <small>full hrs</small></span>
        </div>
      </div>

      <!-- Row 3: Energy accumulation — staircase layout -->
      <div class="comp-row energy-row">
        <div class="energy-item" v-for="(e, i) in energyItems" :key="e.label" :style="{ marginTop: (i * 20) + 'px' }">
          <span :class="['energy-number', { 'total-num': e.isTotal }]">{{ e.value }}</span>
          <span class="energy-annotation">{{ e.label }}</span>
        </div>
      </div>

      <!-- Row 4: Status — single word verdict -->
      <div class="comp-row status-row">
        <div class="status-block" :class="currentInverter?.alarm === '无' ? 'is-ok' : 'is-bad'">
          <span class="status-word">{{ currentInverter?.alarm === '无' ? 'Normal' : currentInverter?.alarm }}</span>
          <span class="status-context">
            IGBT {{ currentInverter?.igbtTemp }} · Warranty {{ currentInverter?.warrantyStatus }}
          </span>
        </div>
      </div>

      <!-- Row 5: Parameters — columnar data as text -->
      <div class="comp-row params-row">
        <div class="param-col">
          <h2 class="param-heading">DC Input</h2>
          <div class="param-lines">
            <div class="param-line" v-for="(r, i) in dcData" :key="i" :class="{ mute: r.current === 0 }">
              <span class="param-name">{{ r.name }}</span>
              <span class="param-data">{{ r.voltage }}<small>V</small></span>
              <span class="param-data">{{ r.current }}<small>A</small></span>
              <span class="param-data">{{ r.power }}<small>W</small></span>
            </div>
          </div>
        </div>
        <div class="param-col">
          <h2 class="param-heading">AC Output</h2>
          <div class="param-lines">
            <div class="param-line" v-for="(r, i) in acData" :key="i">
              <span class="param-name">{{ r.name }}</span>
              <span class="param-data">{{ r.voltage }}<small>V</small></span>
              <span class="param-data">{{ r.current }}<small>A</small></span>
              <span class="param-data">{{ r.freq }}<small>Hz</small></span>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const currentInverter = ref({
  sn: 'SOLAR-2024-A001', name: '1# 逆变器', model: 'SUN2000-330KTL-H3', ratedPower: '330kW',
  realPower: '287.5kW', dayEnergy: '1,842.6kWh', dayHours: '5.6h', monthEnergy: '38,215kWh',
  yearEnergy: '156,420kWh', totalEnergy: '892,671kWh', alarm: '无',
  warrantyStatus: '生效中', warrantyExpire: '2029-06-15', updateTime: '2026-05-07 14:32:05',
  igbtTemp: '52.3℃', stationName: '阳光光伏电站 #3',
})

const MOCK_INVERTERS = [
  { sn: 'SOLAR-2024-A001', name: '1# 逆变器', alarm: '无', realPower: '287.5kW', dayEnergy: '1,842.6kWh', dayHours: '5.6h', monthEnergy: '38,215kWh', yearEnergy: '156,420kWh', totalEnergy: '892,671kWh', warrantyStatus: '生效中', warrantyExpire: '2029-06-15', updateTime: '2026-05-07 14:32:05', igbtTemp: '52.3℃', stationName: '阳光光伏电站 #3', model: 'SUN2000-330KTL-H3', ratedPower: '330kW' },
  { sn: 'SOLAR-2024-A002', name: '2# 逆变器', alarm: '离线', realPower: '273.1kW', dayEnergy: '1,756.2kWh', dayHours: '5.3h', monthEnergy: '36,840kWh', yearEnergy: '149,230kWh', totalEnergy: '865,120kWh', warrantyStatus: '生效中', warrantyExpire: '2029-06-15', updateTime: '2026-05-07 14:28:33', igbtTemp: '55.1℃', stationName: '阳光光伏电站 #3', model: 'SUN2000-330KTL-H3', ratedPower: '330kW' },
  { sn: 'SOLAR-2024-A003', name: '3# 逆变器', alarm: '无', realPower: '295.8kW', dayEnergy: '1,901.4kWh', dayHours: '5.8h', monthEnergy: '39,980kWh', yearEnergy: '162,105kWh', totalEnergy: '910,340kWh', warrantyStatus: '即将到期', warrantyExpire: '2026-08-20', updateTime: '2026-05-07 14:31:18', igbtTemp: '49.7℃', stationName: '阳光光伏电站 #3', model: 'SUN2000-330KTL-H3', ratedPower: '330kW' },
  { sn: 'SOLAR-2024-A004', name: '4# 逆变器', alarm: '无', realPower: '188.2kW', dayEnergy: '1,230.5kWh', dayHours: '5.7h', monthEnergy: '25,610kWh', yearEnergy: '98,450kWh', totalEnergy: '541,200kWh', warrantyStatus: '生效中', warrantyExpire: '2028-03-10', updateTime: '2026-05-07 14:29:45', igbtTemp: '47.8℃', stationName: '阳光光伏电站 #3', model: 'SUN2000-215KTL-H3', ratedPower: '215kW' },
  { sn: 'SOLAR-2024-A005', name: '5# 逆变器', alarm: '停机', realPower: '0kW', dayEnergy: '812.0kWh', dayHours: '3.8h', monthEnergy: '18,420kWh', yearEnergy: '76,890kWh', totalEnergy: '432,680kWh', warrantyStatus: '已到期', warrantyExpire: '2025-12-31', updateTime: '2026-05-07 08:15:00', igbtTemp: '32.1℃', stationName: '阳光光伏电站 #3', model: 'SUN2000-215KTL-H3', ratedPower: '215kW' },
]

const inverterList = ref(MOCK_INVERTERS)
const selectInverter = (inv) => { currentInverter.value = inv }

const energyItems = computed(() => {
  const inv = currentInverter.value; if (!inv) return []
  return [
    { label: 'This Month', value: inv.monthEnergy },
    { label: 'This Year', value: inv.yearEnergy },
    { label: 'Lifetime Total', value: inv.totalEnergy, isTotal: true },
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
])

const acData = ref([
  { name: 'L1', voltage: 255.9, current: 1.4, freq: 50.03 },
  { name: 'L2', voltage: 257.7, current: 1.2, freq: 50.03 },
  { name: 'L3', voltage: 255.3, current: 1.2, freq: 50.03 },
])
</script>

<style scoped>
/* ═══════════════════════════════════════════════
   niccolomiranda.com + canals DEEP DNA:
   - Type IS the visual element — no decorative chrome
   - Asymmetric balance (not centered, not grid-aligned)
   - Dramatic scale: 120px numbers next to 10px labels
   - Staircase/offset layouts (not uniform grids)
   - Print-inspired: columns, hanging indents, intentional gaps
   ═══════════════════════════════════════════════ */

.type-space {
  position: fixed; inset: 0; top: 60px;
  background: #f7f5f0;
  color: #1a1a1a;
  font-family: 'Georgia', 'Noto Serif SC', 'STSong', 'Songti SC', serif;
  overflow-y: auto; overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}
.type-space::-webkit-scrollbar { width: 4px; }
.type-space::-webkit-scrollbar-track { background: transparent; }
.type-space::-webkit-scrollbar-thumb { background: #ddd9ce; }

/* ── Nav ── */
.type-nav {
  position: fixed; top: 72px; right: 40px;
  display: flex; flex-direction: column; gap: 2px;
  z-index: 10;
}
.type-nav-item {
  padding: 6px 16px; text-align: right;
  background: none; border: none;
  font-family: system-ui, sans-serif; font-size: 12px;
  color: #bbb; cursor: pointer;
  transition: color 0.2s;
}
.type-nav-item:hover { color: #666; }
.type-nav-item.active { color: #1a1a1a; font-weight: 600; }

/* ── Composition ── */
.composition {
  padding: 80px 64px 120px;
  max-width: 1100px;
}

.comp-row { margin-bottom: 80px; }

/* ═══ Row 1: IDENTITY ═══ */
.identity-row {
  display: flex; justify-content: space-between; align-items: flex-end;
}
.identity-block { display: flex; flex-direction: column; gap: 4px; }
.mega-name {
  font-size: 72px; font-weight: 400; color: #1a1a1a;
  letter-spacing: -0.03em; margin: 0; line-height: 1;
}
.micro-sn {
  font-family: 'SF Mono', 'Consolas', monospace;
  font-size: 12px; color: #ccc; letter-spacing: 0.04em;
}
.identity-meta {
  display: flex; flex-direction: column; align-items: flex-end; gap: 4px;
}
.meta-line {
  font-family: system-ui, sans-serif;
  font-size: 12px; color: #999;
}
.meta-line.dim { color: #ddd; }

/* ═══ Row 2: POWER — the big statement ═══ */
.power-row {
  display: flex; align-items: flex-end; gap: 64px;
}
.power-block {
  display: flex; align-items: baseline; gap: 16px;
}
.power-number {
  font-size: clamp(96px, 15vw, 180px);
  font-weight: 400; color: #1a1a1a;
  letter-spacing: -0.04em; line-height: 0.9;
  font-variant-numeric: tabular-nums;
}
.power-annotation {
  font-family: system-ui, sans-serif;
  font-size: 11px; color: #ccc; text-transform: uppercase;
  letter-spacing: 0.06em; line-height: 1.4;
}
.power-secondary {
  display: flex; flex-direction: column; gap: 8px;
  padding-bottom: 8px;
}
.sec-value {
  font-size: 18px; color: #666; font-variant-numeric: tabular-nums;
}
.sec-value small {
  font-family: system-ui, sans-serif;
  font-size: 10px; color: #ccc; text-transform: uppercase;
  letter-spacing: 0.06em;
}

/* ═══ Row 3: ENERGY — staircase offset ═══ */
.energy-row {
  display: flex; gap: 0;
  padding-left: 20%;
}
.energy-item {
  display: flex; flex-direction: column; gap: 4px;
  flex: 1;
}
.energy-number {
  font-size: 42px; font-weight: 400; color: #555;
  letter-spacing: -0.03em; font-variant-numeric: tabular-nums;
}
.total-num { font-size: 56px; color: #1a1a1a; font-weight: 400; }
.energy-annotation {
  font-family: system-ui, sans-serif;
  font-size: 10px; color: #ccc; text-transform: uppercase;
  letter-spacing: 0.06em;
}

/* ═══ Row 4: STATUS — single word ═══ */
.status-row { }
.status-block { }
.status-word {
  font-size: 96px; font-weight: 400; letter-spacing: -0.03em; line-height: 1;
}
.is-ok .status-word { color: #2a7d4f; }
.is-bad .status-word { color: #c0392b; }
.status-context {
  display: block; margin-top: 12px;
  font-family: system-ui, sans-serif;
  font-size: 13px; color: #aaa;
}

/* ═══ Row 5: PARAMETERS — columnar text ═══ */
.params-row { display: flex; gap: 80px; }
.param-col { flex: 1; }
.param-heading {
  font-family: system-ui, sans-serif;
  font-size: 11px; font-weight: 600; color: #ccc;
  text-transform: uppercase; letter-spacing: 0.08em;
  margin: 0 0 16px;
}
.param-lines { display: flex; flex-direction: column; gap: 2px; }
.param-line {
  display: flex; gap: 24px; padding: 6px 0;
  border-bottom: 1px solid #ebebe4;
  font-size: 13px; color: #666; font-variant-numeric: tabular-nums;
}
.param-line.mute { color: #ddd; }
.param-name { width: 56px; flex-shrink: 0; font-family: 'SF Mono', 'Consolas', monospace; font-size: 11px; color: #bbb; }
.param-data { width: 64px; }
.param-data small { font-size: 10px; color: #ccc; margin-left: 2px; }
</style>
