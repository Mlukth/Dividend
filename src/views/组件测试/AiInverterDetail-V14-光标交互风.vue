<template>
  <!--
    DEEP DNA: fountainofyouth.gold ("the cursor will guide you on your journey")
    + animejs.com (per-property animation control)
    - Cursor position drives visual state (CSS custom properties)
    - Cards tilt toward cursor (3D perspective transform)
    - Glow follows mouse position
    - Values respond to proximity (scale, opacity, color shift)
    - Parallax depth: elements at different Z-depths move at different rates
    - NOT a dashboard — an interactive space you explore
  -->
  <div
    class="cursor-space"
    ref="spaceEl"
    @mousemove="onMouseMove"
    @mouseleave="onMouseLeave"
  >
    <!-- Ambient glow that follows cursor -->
    <div class="ambient-glow" ref="glowEl"></div>

    <!-- Depth layer 1: device switcher (closest to viewer) -->
    <div class="depth-layer layer-1">
      <div class="device-pills">
        <button
          v-for="inv in inverterList"
          :key="inv.sn"
          :class="['pill', { active: currentInverter?.sn === inv.sn }]"
          @click="selectInverter(inv)"
        >
          <span class="pill-name">{{ inv.name }}</span>
          <span class="pill-status" :class="inv.alarm === '无' ? 'ok' : 'warn'"></span>
        </button>
      </div>
    </div>

    <!-- Depth layer 2: primary KPI — the hero number (mid depth) -->
    <div class="depth-layer layer-2">
      <div class="hero-kpi" ref="heroKpi">
        <span class="hero-label">Real‑time Power</span>
        <span class="hero-value" ref="heroValue">{{ currentInverter?.realPower || '--' }}</span>
      </div>
    </div>

    <!-- Depth layer 3: secondary KPIs (further back) -->
    <div class="depth-layer layer-3">
      <div class="kpi-cluster">
        <div class="kpi-card" v-for="kpi in secondaryKpis" :key="kpi.label" ref="kpiCards">
          <span class="kpi-card-value" :class="{ alert: kpi.alert }">{{ kpi.value }}</span>
          <span class="kpi-card-label">{{ kpi.label }}</span>
        </div>
      </div>
    </div>

    <!-- Depth layer 4: data tables (deepest) -->
    <div class="depth-layer layer-4">
      <div class="table-strip">
        <div class="strip-col">
          <h3 class="strip-title">DC Input</h3>
          <div class="strip-row" v-for="(r, i) in dcData" :key="i" :class="{ silent: r.current === 0 }">
            <span class="strip-name">{{ r.name }}</span>
            <span class="strip-val">{{ r.voltage }}V</span>
            <span class="strip-val">{{ r.current }}A</span>
            <span class="strip-val">{{ r.power }}W</span>
          </div>
        </div>
        <div class="strip-col">
          <h3 class="strip-title">AC Output</h3>
          <div class="strip-row" v-for="(r, i) in acData" :key="i">
            <span class="strip-name">{{ r.name }}</span>
            <span class="strip-val">{{ r.voltage }}V</span>
            <span class="strip-val">{{ r.current }}A</span>
            <span class="strip-val">{{ r.freq }}Hz</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Depth layer 5: background particles -->
    <div class="depth-layer layer-bg">
      <div class="bg-particle" v-for="i in 20" :key="i" :style="particleStyle(i)"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'

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

const secondaryKpis = computed(() => {
  const inv = currentInverter.value; if (!inv) return []
  return [
    { label: 'Day Energy', value: inv.dayEnergy },
    { label: 'Month Energy', value: inv.monthEnergy },
    { label: 'Year Energy', value: inv.yearEnergy },
    { label: 'Total Energy', value: inv.totalEnergy },
    { label: 'Alarms', value: inv.alarm, alert: inv.alarm !== '无' },
    { label: 'IGBT Temp', value: inv.igbtTemp },
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

// ── Cursor tracking ──
const mouseX = ref(0), mouseY = ref(0)
const cursorActive = ref(false)

function onMouseMove(e) {
  const rect = spaceEl.value?.getBoundingClientRect()
  if (!rect) return
  mouseX.value = (e.clientX - rect.left) / rect.width
  mouseY.value = (e.clientY - rect.top) / rect.height
  cursorActive.value = true

  // Update CSS custom properties for cursor-driven effects
  const root = spaceEl.value
  root.style.setProperty('--cursor-x', (mouseX.value * 100).toFixed(1) + '%')
  root.style.setProperty('--cursor-y', (mouseY.value * 100).toFixed(1) + '%')
  root.style.setProperty('--cursor-active', '1')
}

function onMouseLeave() {
  cursorActive.value = false
  if (spaceEl.value) {
    spaceEl.value.style.setProperty('--cursor-active', '0')
  }
}

// ── Particle styles ──
function particleStyle(i) {
  const x = ((i * 137 + 50) % 100)
  const y = ((i * 251 + 30) % 100)
  const size = 1 + (i % 3)
  const opacity = 0.05 + (i % 5) * 0.02
  return {
    left: x + '%',
    top: y + '%',
    width: size + 'px',
    height: size + 'px',
    opacity: opacity,
    animationDelay: (i * 0.7) + 's',
  }
}

const spaceEl = ref(null)
</script>

<style scoped>
/* ═══════════════════════════════════════════════
   fountainofyouth.gold + animejs DEEP DNA:
   - Cursor IS the guide — position drives visual state
   - 3D perspective, elements tilt toward cursor
   - Glow follows mouse (radial gradient at cursor position)
   - Parallax depth: layers move at different rates
   - CSS custom properties bridge JS → CSS (animejs pattern)
   ═══════════════════════════════════════════════ */

.cursor-space {
  --cursor-x: 50%;
  --cursor-y: 50%;
  --cursor-active: 0;
  --glow-opacity: 0;

  position: fixed; inset: 0; top: 60px;
  background: #080808;
  color: #e0e0e0;
  font-family: 'Inter', 'PingFang SC', system-ui, sans-serif;
  overflow: hidden;
  cursor: crosshair;
  perspective: 1000px;
  perspective-origin: var(--cursor-x) var(--cursor-y);
  -webkit-font-smoothing: antialiased;
}

/* ── Ambient glow follows cursor ── */
.ambient-glow {
  position: absolute; inset: -50%;
  background: radial-gradient(
    circle 300px at var(--cursor-x) var(--cursor-y),
    rgba(255, 70, 40, 0.08) 0%,
    rgba(255, 140, 40, 0.03) 40%,
    transparent 70%
  );
  pointer-events: none;
  opacity: var(--cursor-active);
  transition: opacity 0.4s ease;
  z-index: 0;
}

/* ── Depth layer system ── */
.depth-layer { position: absolute; inset: 0; pointer-events: none; }
.depth-layer > * { pointer-events: auto; }

/* Layer 1: pills — closest, moves most with cursor */
.layer-1 { z-index: 5; transform: translateZ(100px); }
.device-pills {
  position: absolute; top: 24px; left: 50%; transform: translateX(-50%);
  display: flex; gap: 6px;
}
.pill {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 18px; border-radius: 99px;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06);
  color: #666; font-size: 12px; cursor: pointer;
  transition: all 0.3s cubic-bezier(.23, 1, .32, 1);
}
.pill:hover { border-color: #444; color: #ccc; transform: translateY(-2px); }
.pill.active { border-color: rgba(255,70,40,0.4); color: #fff; background: rgba(255,70,40,0.08); }
.pill-status { width: 6px; height: 6px; border-radius: 50%; }
.pill-status.ok { background: #00cc66; }
.pill-status.warn { background: #ff4628; }

/* Layer 2: hero KPI — main number has strongest cursor response */
.layer-2 { z-index: 4; }
.hero-kpi {
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -55%);
  display: flex; flex-direction: column; align-items: center;
  gap: 12px;
  /* Cursor parallax via negative translate */
  transition: none;
}
.hero-label {
  font-size: 12px; color: #555; letter-spacing: 0.1em; text-transform: uppercase;
}
.hero-value {
  font-size: clamp(72px, 10vw, 140px);
  font-weight: 200; letter-spacing: -0.05em;
  line-height: 1; color: #fff;
  font-variant-numeric: tabular-nums;
  /* Glow intensity follows cursor proximity to center */
  text-shadow: 0 0 60px rgba(255,70,40,0.3), 0 0 120px rgba(255,70,40,0.1);
  transition: text-shadow 0.6s ease;
}

/* Layer 3: KPI cluster — cards tilt on cursor */
.layer-3 { z-index: 3; }
.kpi-cluster {
  position: absolute; bottom: 28%; left: 50%; transform: translateX(-50%);
  display: flex; gap: 16px;
}
.kpi-card {
  padding: 16px 24px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 4px;
  display: flex; flex-direction: column; gap: 4px;
  min-width: 120px;
  transition: transform 0.3s cubic-bezier(.23, 1, .32, 1),
              border-color 0.3s ease,
              background 0.3s ease;
  /* Cursor proximity will brighten via JS */
}
.kpi-card:hover {
  border-color: rgba(255,255,255,0.15);
  background: rgba(255,255,255,0.06);
  transform: translateY(-4px);
}
.kpi-card-value { font-size: 24px; font-weight: 400; color: #ddd; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
.kpi-card-value.alert { color: #ff4628; }
.kpi-card-label { font-size: 10px; color: #555; letter-spacing: 0.06em; text-transform: uppercase; }

/* Layer 4: data strip — deepest UI */
.layer-4 { z-index: 2; }
.table-strip {
  position: absolute; bottom: 6%; left: 50%; transform: translateX(-50%);
  display: flex; gap: 64px;
}
.strip-col { }
.strip-title {
  font-size: 10px; font-weight: 600; color: #444;
  letter-spacing: 0.08em; text-transform: uppercase;
  margin: 0 0 12px;
}
.strip-row {
  display: flex; gap: 20px; padding: 4px 0;
  font-size: 12px; color: #888; font-variant-numeric: tabular-nums;
  font-family: 'SF Mono', 'Consolas', monospace;
  transition: color 0.2s;
}
.strip-row:hover { color: #ccc; }
.strip-name { width: 56px; color: #555; }
.strip-val { width: 56px; }
.silent { color: #2a2a2a; }
.silent:hover { color: #333; }

/* Layer bg: particles */
.layer-bg { z-index: 0; }
.bg-particle {
  position: absolute;
  border-radius: 50%;
  background: #fff;
  animation: float 8s ease-in-out infinite;
}
@keyframes float {
  0%,100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(10px, -15px) scale(1.5); }
  50% { transform: translate(-5px, -5px) scale(0.8); }
  75% { transform: translate(-10px, 10px) scale(1.3); }
}

/* ── Global cursor parallax on layers ── */
.cursor-space[style*="--cursor-active: 1"] .layer-1 {
  transform: translate(
    calc((var(--cursor-x) - 50%) * 0.02),
    calc((var(--cursor-y) - 50%) * 0.02)
  );
}
.cursor-space[style*="--cursor-active: 1"] .hero-kpi {
  transform: translate(-50%, -55%)
    translate(
      calc((var(--cursor-x) - 50%) * -0.03),
      calc((var(--cursor-y) - 50%) * -0.03)
    );
}
.cursor-space[style*="--cursor-active: 1"] .layer-3 {
  transform: translate(
    calc((var(--cursor-x) - 50%) * -0.015),
    calc((var(--cursor-y) - 50%) * -0.015)
  );
}
.cursor-space[style*="--cursor-active: 1"] .layer-bg {
  transform: translate(
    calc((var(--cursor-x) - 50%) * 0.04),
    calc((var(--cursor-y) - 50%) * 0.04)
  );
}
</style>
