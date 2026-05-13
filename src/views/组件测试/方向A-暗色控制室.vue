<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const clock = ref('')
let timer = null

onMounted(() => {
  timer = setInterval(() => {
    clock.value = new Date().toLocaleTimeString('zh-CN', { hour12: false })
  }, 1000)
})
onUnmounted(() => clearInterval(timer))

const stations = [
  { id: 'tongxiang', name: '桐乡光伏电站', power: '2.86', unit: 'MW', status: 'run', efficiency: 97.2, irradiance: 826, todayEnergy: '18,642', alarm: 0 },
  { id: 'haining', name: '海宁光伏电站', power: '4.12', unit: 'MW', status: 'run', efficiency: 95.8, irradiance: 791, todayEnergy: '24,318', alarm: 1 },
  { id: 'pinghu', name: '平湖光伏电站', power: '1.76', unit: 'MW', status: 'run', efficiency: 98.1, irradiance: 852, todayEnergy: '11,047', alarm: 0 },
  { id: 'jiashan', name: '嘉善光伏电站', power: '0', unit: 'MW', status: 'fault', efficiency: 0, irradiance: 0, todayEnergy: '0', alarm: 3 },
]

const inverters = [
  { sn: 'INV-TX-001', power: '68.4kW', temp: 42, eff: 97.8, status: 'run' },
  { sn: 'INV-TX-002', power: '72.1kW', temp: 44, eff: 97.2, status: 'run' },
  { sn: 'INV-TX-003', power: '65.8kW', temp: 41, eff: 98.1, status: 'run' },
  { sn: 'INV-TX-004', power: '0kW', temp: 28, eff: 0, status: 'fault' },
  { sn: 'INV-TX-005', power: '70.3kW', temp: 43, eff: 96.9, status: 'run' },
  { sn: 'INV-TX-006', power: '59.2kW', temp: 39, eff: 97.5, status: 'standby' },
]
</script>

<template>
  <div class="control-room">
    <!-- Top Status Bar -->
    <header class="cr-header">
      <div class="cr-header-left">
        <span class="cr-logo">PV<span class="cr-logo-dot">·</span>Control</span>
        <span class="cr-divider">|</span>
        <span class="cr-system-label">电站监控系统 v3.2</span>
      </div>
      <div class="cr-header-center">
        <div class="cr-status-pills">
          <span class="cr-pill cr-pill-green">系统正常</span>
          <span class="cr-pill cr-pill-amber">PR 92.4%</span>
          <span class="cr-pill">辐照 823W/m²</span>
        </div>
      </div>
      <div class="cr-header-right">
        <span class="cr-clock">{{ clock }}</span>
        <span class="cr-date">2026-05-07</span>
      </div>
    </header>

    <main class="cr-main">
      <!-- Primary KPI Row -->
      <section class="cr-kpi-row">
        <div class="cr-kpi cr-kpi-primary">
          <div class="cr-kpi-eyebrow">实时总功率</div>
          <div class="cr-kpi-value">8.74<span class="cr-kpi-unit"> MW</span></div>
          <div class="cr-kpi-bar">
            <div class="cr-kpi-bar-fill" style="width: 87.4%"></div>
          </div>
          <div class="cr-kpi-footer">额定容量 10MW · 负载率 87.4%</div>
        </div>
        <div class="cr-kpi">
          <div class="cr-kpi-eyebrow">今日发电量</div>
          <div class="cr-kpi-value">54,007<span class="cr-kpi-unit"> kWh</span></div>
          <div class="cr-kpi-change up">↑ 3.2% 较昨日同期</div>
        </div>
        <div class="cr-kpi">
          <div class="cr-kpi-eyebrow">今日收益</div>
          <div class="cr-kpi-value">¥ 35,644<span class="cr-kpi-unit"> .52</span></div>
          <div class="cr-kpi-change up">↑ 2.8% 较昨日同期</div>
        </div>
        <div class="cr-kpi">
          <div class="cr-kpi-eyebrow">设备健康率</div>
          <div class="cr-kpi-value">96.3<span class="cr-kpi-unit">%</span></div>
          <div class="cr-kpi-change down">↓ 0.7% 1台故障</div>
        </div>
        <div class="cr-kpi">
          <div class="cr-kpi-eyebrow">日均辐照量</div>
          <div class="cr-kpi-value">4.82<span class="cr-kpi-unit"> kWh/m²</span></div>
          <div class="cr-kpi-change up">晴 22°-26°</div>
        </div>
      </section>

      <!-- Station Grid + Inverter Table -->
      <section class="cr-grid">
        <!-- Left: Station Cards -->
        <div class="cr-stations">
          <div class="cr-section-head">
            <span>电站实时状态</span>
            <span class="cr-section-count">4 座</span>
          </div>
          <div class="cr-station-list">
            <div
              v-for="st in stations" :key="st.id"
              class="cr-station-card"
              :class="{ 'cr-station-fault': st.status === 'fault' }"
            >
              <div class="cr-station-top">
                <span class="cr-station-name">{{ st.name }}</span>
                <span class="cr-station-dot" :class="st.status === 'run' ? 'dot-run' : 'dot-fault'"></span>
              </div>
              <div class="cr-station-mid">
                <div class="cr-station-power">
                  <span class="cr-station-pv">{{ st.power }}</span>
                  <span class="cr-station-pu">{{ st.unit }}</span>
                </div>
                <div class="cr-station-meta">
                  <div class="cr-meta-item">
                    <span class="cr-meta-label">效率</span>
                    <span class="cr-meta-val">{{ st.efficiency }}%</span>
                  </div>
                  <div class="cr-meta-item">
                    <span class="cr-meta-label">辐照</span>
                    <span class="cr-meta-val">{{ st.irradiance }}W/m²</span>
                  </div>
                  <div class="cr-meta-item">
                    <span class="cr-meta-label">今日</span>
                    <span class="cr-meta-val">{{ st.todayEnergy }}kWh</span>
                  </div>
                </div>
              </div>
              <div v-if="st.alarm > 0" class="cr-station-alarm">
                ⚠ {{ st.alarm }} 条告警
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Inverter Table -->
        <div class="cr-inverters">
          <div class="cr-section-head">
            <span>逆变器实时监测</span>
            <span class="cr-section-count">6 台</span>
          </div>
          <div class="cr-inv-list">
            <div
              v-for="inv in inverters" :key="inv.sn"
              class="cr-inv-row"
              :class="{ 'cr-inv-fault': inv.status === 'fault', 'cr-inv-standby': inv.status === 'standby' }"
            >
              <div class="cr-inv-id">
                <span class="cr-inv-dot" :class="inv.status === 'run' ? 'dot-run' : inv.status === 'standby' ? 'dot-standby' : 'dot-fault'"></span>
                {{ inv.sn }}
              </div>
              <div class="cr-inv-power">{{ inv.power }}</div>
              <div class="cr-inv-temp">
                <span class="cr-temp-bar" :style="{ width: inv.temp + '%', background: inv.temp > 40 ? '#f59e0b' : '#22c55e' }"></span>
                {{ inv.temp }}°C
              </div>
              <div class="cr-inv-eff">{{ inv.eff }}%</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Bottom: Chart placeholder -->
      <section class="cr-chart-area">
        <div class="cr-chart-box">
          <div class="cr-chart-head">功率曲线 &mdash; 过去24小时</div>
          <div class="cr-chart-canvas">
            <!-- Simulated chart with SVG sparkline -->
            <svg viewBox="0 0 1200 200" class="cr-sparkline">
              <defs>
                <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#22c55e" stop-opacity="0.15"/>
                  <stop offset="100%" stop-color="#22c55e" stop-opacity="0"/>
                </linearGradient>
              </defs>
              <path d="M0,150 C30,148 60,145 90,140 C120,130 150,110 180,95 C210,75 240,50 270,30 C300,15 330,10 360,20 C390,35 420,60 450,80 C480,100 510,115 540,120 C570,125 600,128 630,130 C660,135 690,140 720,145 C750,148 780,150 810,152 C840,155 870,160 900,158 C930,155 960,148 990,140 C1020,135 1050,132 1080,130 C1110,128 1140,126 1170,125 L1200,125" fill="none" stroke="#22c55e" stroke-width="2"/>
              <path d="M0,150 C30,148 60,145 90,140 C120,130 150,110 180,95 C210,75 240,50 270,30 C300,15 330,10 360,20 C390,35 420,60 450,80 C480,100 510,115 540,120 C570,125 600,128 630,130 C660,135 690,140 720,145 C750,148 780,150 810,152 C840,155 870,160 900,158 C930,155 960,148 990,140 C1020,135 1050,132 1080,130 C1110,128 1140,126 1170,125 L1200,125 L1200,200 L0,200 Z" fill="url(#sg)" opacity="0.5"/>
            </svg>
            <!-- X-axis labels -->
            <div class="cr-axis-labels">
              <span>00:00</span><span>04:00</span><span>08:00</span><span>12:00</span><span>16:00</span><span>20:00</span>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Bottom status bar -->
    <footer class="cr-footer">
      <span>数据刷新间隔 30s</span>
      <span class="cr-f-div">·</span>
      <span>最后更新 14:32:05</span>
      <span class="cr-f-div">·</span>
      <span>通信状态 全部在线</span>
    </footer>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');

*, *::after, *::before { box-sizing: border-box; margin: 0; padding: 0; }

.control-room {
  --bg-deep: #0d1117;
  --bg-panel: #161b22;
  --bg-card: #1c2128;
  --border: #21262d;
  --text-primary: #e6edf3;
  --text-secondary: #8b949e;
  --text-dim: #484f58;
  --accent-green: #22c55e;
  --accent-amber: #f59e0b;
  --accent-red: #ef4444;
  --accent-blue: #3b82f6;

  background: var(--bg-deep); color: var(--text-primary);
  font-family: 'Inter', 'JetBrains Mono', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  min-height: 100vh; display: flex; flex-direction: column;
}

/* Header */
.cr-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.75rem 1.5rem;
  background: var(--bg-panel); border-bottom: 1px solid var(--border);
  font-size: 0.75rem;
}
.cr-header-left { display: flex; align-items: center; gap: 0.75rem; }
.cr-logo { font-weight: 700; font-size: 0.85rem; letter-spacing: -0.02em; }
.cr-logo-dot { color: var(--accent-green); }
.cr-divider { color: var(--text-dim); }
.cr-system-label { color: var(--text-secondary); }
.cr-header-center { display: flex; gap: 0.5rem; }
.cr-status-pills { display: flex; gap: 0.5rem; }
.cr-pill {
  padding: 0.2rem 0.6rem; border-radius: 3px; font-family: 'JetBrains Mono', monospace;
  font-size: 0.65rem; background: var(--bg-card); color: var(--text-secondary);
  border: 1px solid var(--border);
}
.cr-pill-green { color: var(--accent-green); border-color: rgba(34,197,94,0.3); }
.cr-pill-amber { color: var(--accent-amber); border-color: rgba(245,158,11,0.3); }
.cr-header-right { display: flex; gap: 1rem; color: var(--text-secondary); }
.cr-clock { font-family: 'JetBrains Mono', monospace; font-weight: 600; }

/* KPI Row */
.cr-kpi-row {
  display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr 1fr;
  gap: 1px; background: var(--border); margin: 0 1.5rem 1rem;
}
.cr-kpi { background: var(--bg-panel); padding: 1.25rem 1.5rem; }
.cr-kpi-primary { background: var(--bg-card); }
.cr-kpi-eyebrow {
  font-size: 0.6rem; text-transform: uppercase; letter-spacing: 0.1em;
  color: var(--text-dim); margin-bottom: 0.5rem;
}
.cr-kpi-value { font-size: 2rem; font-weight: 600; letter-spacing: -0.02em; line-height: 1; }
.cr-kpi-primary .cr-kpi-value { font-size: 2.5rem; color: var(--accent-green); }
.cr-kpi-unit { font-size: 0.9rem; font-weight: 400; color: var(--text-secondary); }
.cr-kpi-bar {
  height: 3px; background: var(--border); border-radius: 1.5px; margin: 0.75rem 0;
}
.cr-kpi-bar-fill { height: 100%; background: var(--accent-green); border-radius: 1.5px; transition: width 0.6s; }
.cr-kpi-change { font-size: 0.65rem; color: var(--text-secondary); }
.cr-kpi-change.up { color: var(--accent-green); }
.cr-kpi-change.down { color: var(--accent-red); }
.cr-kpi-footer { font-size: 0.65rem; color: var(--text-dim); margin-top: 0.25rem; }

/* Grid */
.cr-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 1px;
  background: var(--border); margin: 0 1.5rem 1rem;
}
.cr-section-head {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0.75rem 1.25rem; border-bottom: 1px solid var(--border);
  font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--text-secondary);
}
.cr-section-count { color: var(--text-dim); }

/* Station Cards */
.cr-stations { background: var(--bg-panel); }
.cr-station-list { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: var(--border); }
.cr-station-card { background: var(--bg-card); padding: 1.25rem; }
.cr-station-card.cr-station-fault { border-left: 2px solid var(--accent-red); }
.cr-station-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
.cr-station-name { font-size: 0.8rem; font-weight: 600; }
.cr-station-dot { width: 6px; height: 6px; border-radius: 50%; }
.dot-run { background: var(--accent-green); box-shadow: 0 0 6px rgba(34,197,94,0.5); }
.dot-fault { background: var(--accent-red); box-shadow: 0 0 6px rgba(239,68,68,0.5); }
.dot-standby { background: var(--accent-amber); box-shadow: 0 0 6px rgba(245,158,11,0.5); }
.cr-station-power { margin-bottom: 0.75rem; }
.cr-station-pv { font-size: 2rem; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
.cr-station-pu { font-size: 0.8rem; color: var(--text-secondary); margin-left: 0.25rem; }
.cr-station-meta { display: flex; gap: 1.25rem; }
.cr-meta-item { display: flex; flex-direction: column; gap: 0.15rem; }
.cr-meta-label { font-size: 0.55rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.06em; }
.cr-meta-val { font-size: 0.75rem; font-family: 'JetBrains Mono', monospace; }
.cr-station-alarm { margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid var(--border); font-size: 0.65rem; color: var(--accent-red); }

/* Inverter Table */
.cr-inverters { background: var(--bg-panel); }
.cr-inv-list { display: flex; flex-direction: column; }
.cr-inv-row {
  display: grid; grid-template-columns: 1.5fr 1fr 1.2fr 0.8fr;
  padding: 0.7rem 1.25rem; border-bottom: 1px solid var(--border); align-items: center;
  font-family: 'JetBrains Mono', monospace; font-size: 0.75rem;
}
.cr-inv-row:last-child { border-bottom: none; }
.cr-inv-row:hover { background: rgba(255,255,255,0.02); }
.cr-inv-id { display: flex; align-items: center; gap: 0.5rem; }
.cr-inv-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
.cr-inv-power { font-weight: 600; }
.cr-inv-temp { display: flex; align-items: center; gap: 0.5rem; }
.cr-temp-bar { display: inline-block; height: 2px; border-radius: 1px; flex-shrink: 0; max-width: 60px; }
.cr-inv-eff { color: var(--text-secondary); }
.cr-inv-fault { opacity: 0.5; }
.cr-inv-standby { opacity: 0.7; }

/* Chart */
.cr-chart-area { margin: 0 1.5rem 1.5rem; }
.cr-chart-box { background: var(--bg-panel); border: 1px solid var(--border); }
.cr-chart-head { padding: 0.75rem 1.25rem; border-bottom: 1px solid var(--border); font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-secondary); }
.cr-chart-canvas { padding: 1.25rem; }
.cr-sparkline { width: 100%; height: 200px; }
.cr-axis-labels { display: flex; justify-content: space-between; padding: 0.5rem 0; font-size: 0.6rem; color: var(--text-dim); font-family: 'JetBrains Mono', monospace; }

/* Footer */
.cr-footer {
  display: flex; justify-content: center; gap: 1rem; padding: 0.6rem;
  font-size: 0.6rem; color: var(--text-dim); border-top: 1px solid var(--border);
  font-family: 'JetBrains Mono', monospace;
}
.cr-f-div { color: var(--border); }
</style>
