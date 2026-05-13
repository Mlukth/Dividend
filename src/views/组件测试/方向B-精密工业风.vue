<script setup>
import { ref } from 'vue'

const activeTab = ref('overview')

const stats = [
  { label: '实时功率', value: '8.74', unit: 'MW', change: '+4.2%' },
  { label: '今日发电', value: '54,007', unit: 'kWh', change: '+3.2%' },
  { label: '今日收益', value: '35,644', unit: '¥', change: '+2.8%' },
  { label: '设备健康率', value: '96.3', unit: '%', change: '-0.7%' },
  { label: '日均辐照', value: '4.82', unit: 'kWh/m²', change: '晴 22-26°' },
]

const stations = [
  { name: '桐乡光伏电站', power: '2.86 MW', today: '18,642 kWh', efficiency: '97.2%', status: '在线', alarm: 0 },
  { name: '海宁光伏电站', power: '4.12 MW', today: '24,318 kWh', efficiency: '95.8%', status: '在线', alarm: 1 },
  { name: '平湖光伏电站', power: '1.76 MW', today: '11,047 kWh', efficiency: '98.1%', status: '在线', alarm: 0 },
  { name: '嘉善光伏电站', power: '—', today: '—', efficiency: '—', status: '故障', alarm: 3 },
]

const inverters = [
  { id: 'INV-TX-001', power: '68.4 kW', eff: '97.8%', temp: '42°C' },
  { id: 'INV-TX-002', power: '72.1 kW', eff: '97.2%', temp: '44°C' },
  { id: 'INV-TX-003', power: '65.8 kW', eff: '98.1%', temp: '41°C' },
  { id: 'INV-TX-004', power: '—', eff: '—', temp: '28°C' },
  { id: 'INV-TX-005', power: '70.3 kW', eff: '96.9%', temp: '43°C' },
]
</script>

<template>
  <div class="industrial">
    <!-- Top Bar -->
    <header class="ind-header">
      <div class="ind-header-left">
        <span class="ind-wordmark">光伏监控</span>
        <span class="ind-version">v3.2</span>
      </div>
      <div class="ind-header-center">
        <button
          v-for="tab in ['概览', '设备', '趋势', '报表', '告警']" :key="tab"
          class="ind-tab"
          :class="{ active: activeTab === (tab === '概览' ? 'overview' : tab) }"
          @click="activeTab = tab === '概览' ? 'overview' : tab"
        >{{ tab }}</button>
      </div>
      <div class="ind-header-right">
        <span class="ind-clock">14:32:05</span>
        <span class="ind-date">2026.05.07</span>
      </div>
    </header>

    <main class="ind-main">
      <!-- Hero Stats -->
      <section class="ind-hero">
        <div class="ind-hero-stats">
          <div v-for="stat in stats" :key="stat.label" class="ind-stat">
            <div class="ind-stat-label">{{ stat.label }}</div>
            <div class="ind-stat-value">
              <span class="ind-stat-num">{{ stat.value }}</span>
              <span class="ind-stat-unit">{{ stat.unit }}</span>
            </div>
            <div class="ind-stat-change" :class="{ down: stat.change.startsWith('-') }">{{ stat.change }}</div>
          </div>
        </div>
        <!-- Inline sparkline -->
        <div class="ind-hero-visual">
          <svg viewBox="0 0 800 80" class="ind-spark">
            <path d="M0,50 C40,48 80,45 120,40 C160,32 200,20 240,12 C280,5 320,3 360,8 C400,15 440,25 480,32 C520,38 560,42 600,44 C640,46 680,48 720,49 C760,50 780,50 800,50" fill="none" stroke="#1a1a1a" stroke-width="1.5"/>
            <path d="M0,50 C40,48 80,45 120,40 C160,32 200,20 240,12 C280,5 320,3 360,8 C400,15 440,25 480,32 C520,38 560,42 600,44 C640,46 680,48 720,49 C760,50 780,50 800,50 L800,80 L0,80 Z" fill="rgba(0,0,0,0.03)"/>
          </svg>
        </div>
      </section>

      <!-- Two Column Content -->
      <div class="ind-content">
        <!-- Station Panel -->
        <section class="ind-panel">
          <div class="ind-panel-head">
            <h2 class="ind-panel-title">电站</h2>
            <span class="ind-panel-count">4座运行中</span>
          </div>
          <div class="ind-panel-body">
            <div v-for="st in stations" :key="st.name" class="ind-row">
              <div class="ind-row-main">
                <div class="ind-row-name">
                  {{ st.name }}
                  <span class="ind-row-status" :class="{ fault: st.status === '故障' }">{{ st.status }}</span>
                </div>
                <div class="ind-row-data">
                  <div class="ind-data-item">
                    <span class="ind-data-label">功率</span>
                    <span class="ind-data-val">{{ st.power }}</span>
                  </div>
                  <div class="ind-data-item">
                    <span class="ind-data-label">今日</span>
                    <span class="ind-data-val">{{ st.today }}</span>
                  </div>
                  <div class="ind-data-item">
                    <span class="ind-data-label">效率</span>
                    <span class="ind-data-val">{{ st.efficiency }}</span>
                  </div>
                  <div v-if="st.alarm > 0" class="ind-alarm-badge">{{ st.alarm }}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Inverter Panel -->
        <section class="ind-panel">
          <div class="ind-panel-head">
            <h2 class="ind-panel-title">逆变器</h2>
            <span class="ind-panel-count">5台</span>
          </div>
          <div class="ind-panel-body">
            <div v-for="(inv, i) in inverters" :key="inv.id" class="ind-row ind-inv-row">
              <div class="ind-inv-index">{{ String(i + 1).padStart(2, '0') }}</div>
              <div class="ind-row-name ind-inv-name">{{ inv.id }}</div>
              <div class="ind-inv-power">{{ inv.power }}</div>
              <div class="ind-inv-eff">{{ inv.eff }}</div>
              <div class="ind-inv-temp">{{ inv.temp }}</div>
            </div>
          </div>
        </section>
      </div>

      <!-- Chart Area -->
      <section class="ind-chart-section">
        <div class="ind-panel-head">
          <h2 class="ind-panel-title">功率趋势 · 24小时</h2>
          <span class="ind-panel-count">更新于 14:30</span>
        </div>
        <div class="ind-chart-big">
          <svg viewBox="0 0 1200 240" class="ind-big-spark">
            <defs>
              <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#1a1a1a" stop-opacity="0.06"/>
                <stop offset="100%" stop-color="#1a1a1a" stop-opacity="0"/>
              </linearGradient>
            </defs>
            <path d="M0,200 C30,195 60,190 80,180 C100,168 120,150 140,130 C160,110 180,90 200,70 C220,55 240,45 260,40 C280,35 300,38 320,50 C340,65 360,85 380,100 C400,115 420,128 440,135 C460,140 480,138 500,130 C520,120 540,108 560,100 C580,95 600,92 620,94 C640,97 660,102 680,108 C700,115 720,120 740,122 C760,125 780,127 800,128 C820,129 840,130 860,132 C880,134 900,135 920,136 C940,138 960,140 980,142 C1000,143 1020,144 1040,145 C1060,146 1080,146 1100,145 C1120,144 1140,143 1160,142 C1180,141 1190,141 1200,141" fill="none" stroke="#1a1a1a" stroke-width="2"/>
            <path d="M0,200 C30,195 60,190 80,180 C100,168 120,150 140,130 C160,110 180,90 200,70 C220,55 240,45 260,40 C280,35 300,38 320,50 C340,65 360,85 380,100 C400,115 420,128 440,135 C460,140 480,138 500,130 C520,120 540,108 560,100 C580,95 600,92 620,94 C640,97 660,102 680,108 C700,115 720,120 740,122 C760,125 780,127 800,128 C820,129 840,130 860,132 C880,134 900,135 920,136 C940,138 960,140 980,142 C1000,143 1020,144 1040,145 C1060,146 1080,146 1100,145 C1120,144 1140,143 1160,142 C1180,141 1190,141 1200,141 L1200,240 L0,240 Z" fill="url(#bg)"/>
          </svg>
          <div class="ind-axis">
            <span>00:00</span><span>04:00</span><span>08:00</span><span>12:00</span><span>16:00</span><span>20:00</span>
          </div>
        </div>
      </section>
    </main>

    <footer class="ind-footer">
      <span>光伏监控系统</span>
      <span>·</span>
      <span>数据刷新 30s</span>
      <span>·</span>
      <span>通信 全部在线</span>
    </footer>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700&family=DM+Mono:wght@400;500&display=swap');

*, *::after, *::before { box-sizing: border-box; margin: 0; padding: 0; }

.industrial {
  --bg: #f5f3ef;
  --surface: #ffffff;
  --ink: #1a1a1a;
  --ink-secondary: #6b6b6b;
  --ink-dim: #b0b0b0;
  --accent: #1a1a1a;
  --danger: #d94a4a;
  --rule: #e8e5e0;

  background: var(--bg); color: var(--ink);
  font-family: 'Inter', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
}

/* Header */
.ind-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1.25rem 2.5rem;
  background: var(--surface);
  border-bottom: 1px solid var(--rule);
}
.ind-header-left { display: flex; align-items: baseline; gap: 0.5rem; }
.ind-wordmark { font-size: 1rem; font-weight: 700; letter-spacing: -0.02em; }
.ind-version { font-size: 0.65rem; color: var(--ink-dim); font-family: 'DM Mono', monospace; }
.ind-header-center { display: flex; gap: 0; }
.ind-tab {
  padding: 0.4rem 1.25rem; border: none; background: none;
  font-family: inherit; font-size: 0.75rem; color: var(--ink-secondary);
  cursor: pointer; transition: color 0.2s; font-weight: 500;
}
.ind-tab:hover { color: var(--ink); }
.ind-tab.active { color: var(--ink); font-weight: 700; }
.ind-header-right { display: flex; gap: 1.5rem; font-size: 0.7rem; color: var(--ink-secondary); font-family: 'DM Mono', monospace; }

/* Main */
.ind-main { padding: 3rem 2.5rem; max-width: 1400px; margin: 0 auto; }

/* Hero Stats */
.ind-hero { margin-bottom: 3rem; }
.ind-hero-stats { display: grid; grid-template-columns: repeat(5, 1fr); gap: 3rem; }
.ind-stat { display: flex; flex-direction: column; gap: 0.35rem; }
.ind-stat-label {
  font-size: 0.6rem; text-transform: uppercase; letter-spacing: 0.12em;
  color: var(--ink-dim); font-weight: 500;
}
.ind-stat-value { font-size: 2.5rem; font-weight: 700; letter-spacing: -0.03em; line-height: 1; margin: 0.15rem 0; }
.ind-stat-num { font-family: 'DM Mono', monospace; }
.ind-stat-unit { font-size: 1rem; font-weight: 400; color: var(--ink-secondary); margin-left: 0.15rem; }
.ind-stat-change { font-size: 0.65rem; color: var(--ink-secondary); }
.ind-stat-change.down { color: var(--danger); }
.ind-hero-visual { margin-top: 1.5rem; }
.ind-spark { width: 100%; height: 80px; }

/* Two Column */
.ind-content { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 3rem; }

/* Panel */
.ind-panel { }
.ind-panel-head {
  display: flex; justify-content: space-between; align-items: baseline;
  margin-bottom: 1.25rem; padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--rule);
}
.ind-panel-title {
  font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em;
  font-weight: 600; color: var(--ink);
}
.ind-panel-count { font-size: 0.6rem; color: var(--ink-dim); font-family: 'DM Mono', monospace; }

.ind-row {
  padding: 1rem 0;
  border-bottom: 1px solid var(--rule);
}
.ind-row:last-child { border-bottom: none; }
.ind-row-main { display: flex; flex-direction: column; gap: 0.5rem; }
.ind-row-name { font-size: 0.85rem; font-weight: 600; display: flex; align-items: center; gap: 0.5rem; }
.ind-row-status { font-size: 0.6rem; color: var(--ink-dim); font-weight: 400; }
.ind-row-status.fault { color: var(--danger); }
.ind-row-data { display: flex; gap: 2rem; align-items: center; }
.ind-data-item { display: flex; flex-direction: column; gap: 0.1rem; }
.ind-data-label { font-size: 0.55rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--ink-dim); }
.ind-data-val { font-size: 0.8rem; font-family: 'DM Mono', monospace; }
.ind-alarm-badge {
  margin-left: auto;
  width: 20px; height: 20px; border-radius: 50%;
  background: var(--danger); color: #fff;
  font-size: 0.6rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}

/* Inverter Rows */
.ind-inv-row {
  display: flex; align-items: center; gap: 1rem;
}
.ind-inv-index { font-size: 0.6rem; color: var(--ink-dim); font-family: 'DM Mono', monospace; width: 20px; }
.ind-inv-name { flex: 1; font-size: 0.75rem; }
.ind-inv-power { font-size: 0.8rem; font-family: 'DM Mono', monospace; font-weight: 500; width: 70px; }
.ind-inv-eff { font-size: 0.75rem; font-family: 'DM Mono', monospace; color: var(--ink-secondary); width: 50px; }
.ind-inv-temp { font-size: 0.7rem; font-family: 'DM Mono', monospace; color: var(--ink-dim); width: 45px; text-align: right; }

/* Big Chart */
.ind-chart-section { margin-bottom: 2rem; }
.ind-chart-big { }
.ind-big-spark { width: 100%; height: 240px; }
.ind-axis { display: flex; justify-content: space-between; padding: 0.5rem 0; font-size: 0.6rem; color: var(--ink-dim); font-family: 'DM Mono', monospace; }

/* Footer */
.ind-footer {
  display: flex; justify-content: center; gap: 1rem; padding: 1.5rem;
  font-size: 0.6rem; color: var(--ink-dim); border-top: 1px solid var(--rule);
  font-family: 'DM Mono', monospace;
}

@media (max-width: 900px) {
  .ind-hero-stats { grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
  .ind-content { grid-template-columns: 1fr; }
  .ind-main { padding: 2rem 1rem; }
  .ind-header { padding: 1rem; }
  .ind-header-center { display: none; }
}
</style>
