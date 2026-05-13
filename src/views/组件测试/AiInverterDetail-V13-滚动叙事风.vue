<template>
  <!--
    DEEP DNA: canals-amsterdam.com + makemepulse narrative
    - Full-screen chapters, not scrolling cards
    - Content reveals progressively as you scroll
    - Each chapter has a distinct visual treatment
    - IntersectionObserver for precise reveal timing
    - Translate3d + opacity text reveals (canals signature)
    - Cubic-bezier(.23, 1, .32, 1) throughout
  -->
  <div class="narrative" ref="narrativeEl">
    <!-- Fixed nav dots -->
    <nav class="nav-dots">
      <button
        v-for="(ch, i) in chapters"
        :key="i"
        :class="['nav-dot', { active: activeChapter === i }]"
        @click="scrollToChapter(i)"
        :aria-label="ch.label"
      />
    </nav>

    <!-- Fixed inverter selector -->
    <div class="device-switcher">
      <button
        v-for="inv in inverterList"
        :key="inv.sn"
        :class="['switcher-item', { active: currentInverter?.sn === inv.sn }]"
        @click="selectInverter(inv)"
      >
        {{ inv.name }}
      </button>
    </div>

    <!-- Chapter 1: Hero — massive name reveal -->
    <section class="chapter hero-chapter" ref="chapter0">
      <div class="chapter-content hero-content">
        <div class="reveal-line"><span class="reveal-text hero-name">{{ currentInverter?.name || '--' }}</span></div>
        <div class="reveal-line delay-1"><span class="reveal-text hero-sn">{{ currentInverter?.sn }}</span></div>
        <div class="reveal-line delay-2"><span class="reveal-text hero-station">{{ currentInverter?.stationName }}</span></div>
        <div class="reveal-line delay-3"><span class="reveal-text hero-model">{{ currentInverter?.model }} · {{ currentInverter?.ratedPower }}</span></div>
        <p class="scroll-hint">↓ Scroll to explore</p>
      </div>
    </section>

    <!-- Chapter 2: Power — the heartbeat number -->
    <section class="chapter power-chapter" ref="chapter1">
      <div class="chapter-content power-content">
        <span class="chapter-label">Chapter 01</span>
        <h2 class="chapter-title reveal-line"><span class="reveal-text">Real‑time Power</span></h2>
        <div class="reveal-line delay-1">
          <span class="power-number">{{ currentInverter?.realPower || '--' }}</span>
        </div>
        <div class="reveal-line delay-2">
          <p class="power-context">
            Today <strong>{{ currentInverter?.dayEnergy || '--' }}</strong> generated over
            <strong>{{ currentInverter?.dayHours || '--' }}</strong> full-load hours
          </p>
        </div>
      </div>
    </section>

    <!-- Chapter 3: Energy — cumulative story -->
    <section class="chapter energy-chapter" ref="chapter2">
      <div class="chapter-content energy-content">
        <span class="chapter-label">Chapter 02</span>
        <h2 class="chapter-title reveal-line"><span class="reveal-text">Energy Accumulated</span></h2>
        <div class="energy-grid">
          <div class="reveal-line delay-1">
            <div class="energy-stat">
              <span class="energy-value">{{ currentInverter?.dayEnergy || '--' }}</span>
              <span class="energy-label">Today</span>
            </div>
          </div>
          <div class="reveal-line delay-2">
            <div class="energy-stat">
              <span class="energy-value">{{ currentInverter?.monthEnergy || '--' }}</span>
              <span class="energy-label">This Month</span>
            </div>
          </div>
          <div class="reveal-line delay-3">
            <div class="energy-stat">
              <span class="energy-value">{{ currentInverter?.yearEnergy || '--' }}</span>
              <span class="energy-label">This Year</span>
            </div>
          </div>
          <div class="reveal-line delay-4">
            <div class="energy-stat total-stat">
              <span class="energy-value">{{ currentInverter?.totalEnergy || '--' }}</span>
              <span class="energy-label">Lifetime Total</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Chapter 4: Parameters — the technical core -->
    <section class="chapter params-chapter" ref="chapter3">
      <div class="chapter-content params-content">
        <span class="chapter-label">Chapter 03</span>
        <h2 class="chapter-title reveal-line"><span class="reveal-text">Electrical Parameters</span></h2>
        <div class="params-dual">
          <div class="params-col reveal-line delay-1">
            <h3 class="params-col-title">DC Input</h3>
            <div class="params-stream">
              <div class="stream-row" v-for="(r, i) in dcData" :key="i" :class="{ faint: r.current === 0 }">
                <span class="stream-name">{{ r.name }}</span>
                <span class="stream-bar" :style="{ width: (r.power / 130 * 100) + '%' }" :class="{ dead: r.current === 0 }"></span>
                <span class="stream-val">{{ r.power }}W</span>
              </div>
            </div>
          </div>
          <div class="params-col reveal-line delay-2">
            <h3 class="params-col-title">AC Output</h3>
            <div class="params-stream">
              <div class="stream-row" v-for="(r, i) in acData" :key="i">
                <span class="stream-name">{{ r.name }}</span>
                <span class="stream-bar" :style="{ width: (r.current / 1.5 * 100) + '%' }"></span>
                <span class="stream-val">{{ r.voltage }}V / {{ r.freq }}Hz</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Chapter 5: Status — the verdict -->
    <section class="chapter status-chapter" ref="chapter4">
      <div class="chapter-content status-content">
        <span class="chapter-label">Chapter 04</span>
        <h2 class="chapter-title reveal-line"><span class="reveal-text">Status & Health</span></h2>
        <div class="reveal-line delay-1">
          <div class="status-verdict" :class="currentInverter?.alarm === '无' ? 'good' : 'bad'">
            {{ currentInverter?.alarm === '无' ? 'All Systems Normal' : currentInverter?.alarm }}
          </div>
        </div>
        <div class="status-details">
          <div class="reveal-line delay-2"><div class="status-item"><span>IGBT Temp</span><span>{{ currentInverter?.igbtTemp || '--' }}</span></div></div>
          <div class="reveal-line delay-3"><div class="status-item"><span>Warranty</span><span>{{ currentInverter?.warrantyStatus || '--' }}</span></div></div>
          <div class="reveal-line delay-4"><div class="status-item"><span>Expires</span><span>{{ currentInverter?.warrantyExpire || '--' }}</span></div></div>
          <div class="reveal-line delay-5"><div class="status-item"><span>Updated</span><span>{{ currentInverter?.updateTime || '--' }}</span></div></div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

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

const chapters = [
  { label: 'Hero' }, { label: 'Power' }, { label: 'Energy' }, { label: 'Params' }, { label: 'Status' }
]
const activeChapter = ref(0)
const narrativeEl = ref(null)
const chapterRefs = ref([])

// DC/AC for chapter 3
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

// IntersectionObserver — scroll-driven chapter detection + text reveals
let observer = null
onMounted(() => {
  chapterRefs.value = [0, 1, 2, 3, 4].map(i => document.querySelector(`[ref="chapter${i}"]`))
  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const idx = chapterRefs.value.indexOf(entry.target)
      if (entry.isIntersecting && idx >= 0) {
        activeChapter.value = idx
        // Reveal hidden text lines
        entry.target.querySelectorAll('.reveal-line').forEach(el => el.classList.add('revealed'))
      }
    })
  }, { threshold: 0.3 })
  chapterRefs.value.forEach(el => el && observer.observe(el))
})

onBeforeUnmount(() => {
  observer?.disconnect()
})

function scrollToChapter(i) {
  chapterRefs.value[i]?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<style scoped>
/* ═══════════════════════════════════════════════
   canals-amsterdam.com DEEP DNA:
   - Full-viewport chapters (100vh each)
   - Text hidden at 102% translate → revealed on scroll
   - Cubic-bezier(.23, 1, .32, 1) on every animation
   - Fixed navigation, everything else is scroll-driven
   - Typographic drama: massive numbers, tiny labels
   ═══════════════════════════════════════════════ */

.narrative {
  position: fixed; inset: 0; top: 60px;
  overflow-y: scroll; overflow-x: hidden;
  scroll-snap-type: y proximity;
  background: #000;
  color: #fff;
  font-family: 'Inter', 'PingFang SC', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  scroll-behavior: smooth;
}
.narrative::-webkit-scrollbar { width: 0; }

/* ── Nav dots ── */
.nav-dots {
  position: fixed; right: 24px; top: 50%; transform: translateY(-50%);
  display: flex; flex-direction: column; gap: 12px;
  z-index: 100;
}
.nav-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: #333; border: none; cursor: pointer;
  transition: all 0.4s cubic-bezier(.23, 1, .32, 1);
}
.nav-dot.active { background: #fff; transform: scale(1.6); }
.nav-dot:hover { background: #888; }

/* ── Device switcher ── */
.device-switcher {
  position: fixed; top: 72px; left: 24px;
  display: flex; gap: 4px; z-index: 100;
}
.switcher-item {
  padding: 6px 14px; border-radius: 99px;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
  color: #555; font-size: 12px; cursor: pointer;
  transition: all 0.3s cubic-bezier(.23, 1, .32, 1);
}
.switcher-item:hover { color: #aaa; border-color: #333; }
.switcher-item.active { color: #fff; border-color: #555; background: rgba(255,255,255,0.1); }

/* ── Chapters ── */
.chapter {
  min-height: 100vh;
  display: flex; align-items: center; justify-content: center;
  scroll-snap-align: start;
}
.chapter-content { width: 100%; max-width: 900px; padding: 80px 64px; }

.chapter-label {
  font-size: 11px; color: #444; letter-spacing: 0.12em; text-transform: uppercase;
  margin-bottom: 16px; display: block;
}

/* ── Text reveal animation (canals core pattern) ── */
.reveal-line {
  overflow: hidden;
  padding: 4px 0;
}
.reveal-text {
  display: inline-block;
  transform: translate3d(0, 102%, 0);
  transition: transform 800ms cubic-bezier(.23, 1, .32, 1);
  will-change: transform;
}
.reveal-line.revealed .reveal-text { transform: translate3d(0, 0, 0); }
.reveal-line.delay-1 .reveal-text { transition-delay: 100ms; }
.reveal-line.delay-2 .reveal-text { transition-delay: 200ms; }
.reveal-line.delay-3 .reveal-text { transition-delay: 300ms; }
.reveal-line.delay-4 .reveal-text { transition-delay: 400ms; }
.reveal-line.delay-5 .reveal-text { transition-delay: 500ms; }

/* ═══ Chapter 1: HERO ═══ */
.hero-content { text-align: center; }
.hero-name { font-size: 72px; font-weight: 700; letter-spacing: -0.03em; }
.hero-sn { font-size: 14px; color: #555; font-family: 'SF Mono', 'Consolas', monospace; letter-spacing: 0.04em; }
.hero-station { font-size: 16px; color: #888; }
.hero-model { font-size: 13px; color: #555; }
.scroll-hint { margin-top: 48px; font-size: 11px; color: #333; letter-spacing: 0.08em; animation: pulse 2s ease infinite; }
@keyframes pulse { 0%,100%{opacity:0.3} 50%{opacity:0.8} }

/* ═══ Chapter 2: POWER ═══ */
.power-content { text-align: center; }
.chapter-title { font-size: 18px; font-weight: 400; color: #888; margin: 0 0 32px; letter-spacing: 0.02em; }
.power-number { font-size: clamp(80px, 12vw, 160px); font-weight: 300; letter-spacing: -0.04em; line-height: 1; color: #f00000; }
.power-context { font-size: 16px; color: #666; margin-top: 24px; }
.power-context strong { color: #bbb; font-weight: 500; }

/* ═══ Chapter 3: ENERGY ═══ */
.energy-content { }
.energy-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; margin-top: 32px; }
.energy-stat { display: flex; flex-direction: column; gap: 8px; }
.energy-value { font-size: 36px; font-weight: 300; letter-spacing: -0.03em; color: #ddd; font-variant-numeric: tabular-nums; }
.energy-label { font-size: 11px; color: #555; letter-spacing: 0.06em; text-transform: uppercase; }
.total-stat .energy-value { color: #f00000; font-size: 48px; }

/* ═══ Chapter 4: PARAMETERS ═══ */
.params-content { }
.params-dual { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; margin-top: 32px; }
.params-col-title { font-size: 13px; font-weight: 600; color: #666; margin: 0 0 20px; letter-spacing: 0.04em; }
.params-stream { display: flex; flex-direction: column; gap: 4px; }
.stream-row { display: flex; align-items: center; gap: 12px; }
.stream-name { width: 60px; font-size: 11px; color: #666; text-align: right; flex-shrink: 0; font-family: 'SF Mono', 'Consolas', monospace; }
.stream-bar { height: 2px; background: #f00000; transition: width 1s cubic-bezier(.23, 1, .32, 1); min-width: 0; border-radius: 1px; }
.stream-bar.dead { background: #1a1a1a; }
.stream-val { font-size: 11px; color: #888; flex-shrink: 0; font-family: 'SF Mono', 'Consolas', monospace; }
.faint .stream-name, .faint .stream-val { color: #222; }

/* ═══ Chapter 5: STATUS ═══ */
.status-content { text-align: center; }
.status-verdict {
  font-size: 56px; font-weight: 300; letter-spacing: -0.02em;
  margin: 24px 0 40px;
}
.status-verdict.good { color: #00aa55; }
.status-verdict.bad { color: #f00000; }
.status-details { display: flex; gap: 40px; justify-content: center; flex-wrap: wrap; }
.status-item { display: flex; flex-direction: column; gap: 4px; }
.status-item span:first-child { font-size: 11px; color: #555; letter-spacing: 0.06em; text-transform: uppercase; }
.status-item span:last-child { font-size: 18px; color: #bbb; font-weight: 400; }
</style>
