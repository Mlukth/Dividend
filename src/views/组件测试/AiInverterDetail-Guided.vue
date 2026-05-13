<template>
  <div class="inv-detail">
    <!-- ====== 顶部标题栏 ====== -->
    <header class="top-bar">
      <div class="top-left">
        <div class="status-badge" :class="inv.status">
          <span class="badge-dot"></span>
          {{ statusLabel }}
        </div>
        <h1 class="top-title">{{ inv.name }}</h1>
        <span class="top-sn">{{ inv.sn }}</span>
      </div>
      <div class="top-right">
        <span class="top-time">数据时间 {{ inv.dataTime }}</span>
        <span class="top-update">更新于 {{ inv.updateTime }}</span>
        <button class="btn btn-primary" @click="handleRefresh">刷新数据</button>
        <button class="btn" @click="handleExport">导出报表</button>
      </div>
    </header>

    <!-- ====== 主体：左右两栏 ====== -->
    <div class="main-body">
      <!-- 左栏 30%：基本信息 + 能量统计 -->
      <aside class="col-left">
        <!-- 基本信息组 -->
        <section class="card info-card">
          <div class="card-head">
            <span class="card-title">基本信息</span>
          </div>
          <div class="info-list">
            <div class="info-row" v-for="f in infoFields" :key="f.label">
              <span class="info-label">{{ f.label }}</span>
              <span class="info-val" :class="{ link: f.link }">{{ f.value }}</span>
            </div>
          </div>
        </section>

        <!-- 能量统计组 -->
        <section class="energy-stats">
          <div class="stat-card" v-for="s in energyStats" :key="s.label">
            <span class="stat-label">{{ s.label }}</span>
            <span class="stat-val">{{ s.value }}<small>{{ s.unit }}</small></span>
          </div>
        </section>
      </aside>

      <!-- 右栏 70%：仪表盘 + 趋势图 -->
      <main class="col-right">
        <!-- 状态指标组：仪表盘 + 实时功率 -->
        <section class="card gauge-section">
          <div class="gauge-wrap">
            <!-- SVG仪表盘 -->
            <div class="gauge-ring">
              <svg viewBox="0 0 180 110" class="gauge-svg">
                <path d="M20 95 A65 65 0 0 1 160 95" fill="none" stroke="#E8ECF2" stroke-width="16" stroke-linecap="round"/>
                <path d="M20 95 A65 65 0 0 1 160 95" fill="none" stroke="url(#gGrad)" stroke-width="16" stroke-linecap="round"
                  stroke-dasharray="220 220" :stroke-dashoffset="220 - 220 * gaugePct" />
                <defs>
                  <linearGradient id="gGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stop-color="var(--c-blue)"/>
                    <stop offset="100%" stop-color="var(--c-sky)"/>
                  </linearGradient>
                </defs>
              </svg>
              <div class="gauge-center">
                <span class="gauge-num">{{ inv.realPower }}</span>
                <span class="gauge-unit">kW</span>
              </div>
            </div>
            <div class="gauge-meta">
              <span class="gauge-label">实时功率</span>
              <span class="gauge-rated">额定 {{ inv.ratedPower }} kW</span>
            </div>
          </div>
          <!-- 功率占比指示 -->
          <div class="power-indicator">
            <div class="pi-top">
              <span>功率占比</span>
              <span class="pi-pct">{{ powerPercent }}%</span>
            </div>
            <div class="pi-track">
              <div class="pi-fill" :style="{ width: powerPercent + '%' }"></div>
            </div>
            <div class="pi-range">
              <span>0</span>
              <span>{{ inv.ratedPower }} kW</span>
            </div>
          </div>
        </section>

        <!-- 历史趋势组 -->
        <section class="card trend-section">
          <div class="card-head">
            <span class="card-title">发电趋势</span>
            <div class="trend-tabs">
              <span v-for="t in trendTabs" :key="t.key"
                class="t-tab" :class="{ on: activeTrend === t.key }"
                @click="activeTrend = t.key"
              >{{ t.label }}</span>
            </div>
          </div>
          <div class="trend-chart-area">
            <!-- 24h 功率曲线 -->
            <svg viewBox="0 0 700 200" class="trend-svg" preserveAspectRatio="none" v-if="activeTrend === '24h'">
              <defs>
                <linearGradient id="tArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="var(--c-sky)" stop-opacity="0.20"/>
                  <stop offset="100%" stop-color="var(--c-sky)" stop-opacity="0.01"/>
                </linearGradient>
              </defs>
              <!-- 网格 -->
              <line v-for="i in 5" :key="'g'+i" :x1="0" :y1="i*35" :x2="700" :y2="i*35" stroke="#F0F3F7" stroke-width="0.5" />
              <polygon :points="area24h" fill="url(#tArea)"/>
              <polyline :points="line24h" fill="none" stroke="var(--c-blue)" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>
            </svg>
            <!-- 7天柱状图 -->
            <div class="trend-bars" v-if="activeTrend === '7d'">
              <div class="tbar-col" v-for="(b, i) in bars7d" :key="i">
                <div class="tbar-fill" :style="{ height: (b.val / 6200 * 100) + '%' }"></div>
                <span class="tbar-label">{{ b.label }}</span>
              </div>
            </div>
            <!-- 30天面积 -->
            <svg viewBox="0 0 700 200" class="trend-svg" preserveAspectRatio="none" v-if="activeTrend === '30d'">
              <defs>
                <linearGradient id="tArea2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="var(--c-sky)" stop-opacity="0.20"/>
                  <stop offset="100%" stop-color="var(--c-sky)" stop-opacity="0.01"/>
                </linearGradient>
              </defs>
              <line v-for="i in 5" :key="'g'+i" :x1="0" :y1="i*35" :x2="700" :y2="i*35" stroke="#F0F3F7" stroke-width="0.5" />
              <polygon :points="area30d" fill="url(#tArea2)"/>
              <polyline :points="line30d" fill="none" stroke="var(--c-blue)" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>
            </svg>
          </div>
          <!-- 图例 -->
          <div class="trend-legend">
            <span v-if="activeTrend === '24h'">功率 (kW)</span>
            <span v-else-if="activeTrend === '7d'">日发电量 (kWh)</span>
            <span v-else>月累计 (kWh)</span>
          </div>
        </section>

        <!-- 设备运维组（可折叠） -->
        <section class="card ops-section">
          <div class="card-head collapsible" @click="showOps = !showOps">
            <span class="card-title">设备运维</span>
            <span class="collapse-arrow" :class="{ open: showOps }">▾</span>
          </div>
          <div class="ops-body" v-if="showOps">
            <div class="ops-grid">
              <div class="ops-cell">
                <span class="ops-label">投产时间</span>
                <span class="ops-val">{{ inv.commissionDate }}</span>
              </div>
              <div class="ops-cell">
                <span class="ops-label">质保到期</span>
                <span class="ops-val" :class="{ expiring: inv.warrantyExpiring }">{{ inv.warrantyExpire }}</span>
              </div>
              <div class="ops-cell">
                <span class="ops-label">国家标准</span>
                <span class="ops-val">{{ inv.standard }}</span>
              </div>
              <div class="ops-cell">
                <span class="ops-label">固件版本</span>
                <span class="ops-val">{{ inv.firmwareVer }}</span>
              </div>
              <div class="ops-cell">
                <span class="ops-label">AFO版本</span>
                <span class="ops-val">{{ inv.afoVer }}</span>
              </div>
              <div class="ops-cell">
                <span class="ops-label">G100状态</span>
                <span class="ops-val">{{ inv.g100Status }}</span>
              </div>
            </div>
            <div class="ops-remark" v-if="inv.remark">
              <span class="ops-label">备注</span>
              <p>{{ inv.remark }}</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

// ===== 模拟数据 =====
const inv = reactive({
  sn: 'INV-2024-0012',
  name: 'A区-03 逆变器',
  model: 'SUN2000-330KTL-H2',
  productType: '组串式',
  station: '阳光工业园屋顶电站',
  stationId: 'STA-001',
  address: '光伏园区A区03号机位',
  dataId: 'DID-330-012',
  status: 'running',
  realPower: 248.5,
  ratedPower: 330,
  todayEnergy: 1240.8,
  totalEnergy: 48250.3,
  todayEqHours: 3.76,
  totalEqHours: 146.2,
  dataTime: '2026-05-07 15:30:00',
  updateTime: '2026-05-07 15:30:05',
  commissionDate: '2024-03-15',
  warrantyExpire: '2034-03-15',
  warrantyExpiring: false,
  standard: 'GB/T 19964-2012',
  firmwareVer: 'V2.4.1',
  afoVer: 'AFO-3.2.0',
  g100Status: '已投运',
  remark: '设备运行正常，无异常记录。',
})

const showOps = ref(false)
const activeTrend = ref('24h')

const trendTabs = [
  { key: '24h', label: '24小时' },
  { key: '7d', label: '7天' },
  { key: '30d', label: '30天' },
]

const statusLabel = computed(() => {
  const map = { running: '运行中', standby: '待机', fault: '故障', offline: '离线' }
  return map[inv.status] || '未知'
})

const gaugePct = computed(() => {
  return Math.min(inv.realPower / inv.ratedPower, 1)
})

const powerPercent = computed(() => {
  return Math.min((inv.realPower / inv.ratedPower * 100), 100).toFixed(1)
})

const infoFields = [
  { label: '设备SN', value: inv.sn },
  { label: '设备型号', value: inv.model },
  { label: '机型', value: inv.productType },
  { label: '所属电站', value: inv.station, link: true },
  { label: '安装地址', value: inv.address },
  { label: '数据ID', value: inv.dataId },
]

const energyStats = [
  { label: '当日电量', value: '1,240.8', unit: 'kWh' },
  { label: '累计电量', value: '48,250.3', unit: 'kWh' },
  { label: '当日等效时数', value: '3.76', unit: 'h' },
  { label: '累计等效时数', value: '146.2', unit: 'h' },
]

// 24h趋势数据
const raw24h = [0,0,0,0,12,45,95,148,198,235,248,242,228,210,185,152,108,62,28,8,0,0,0,0]
const line24h = (() => {
  const w = 700; const h = 200; const padX = 20; const padY = 20
  const max = 260; const n = raw24h.length
  const stepX = (w - padX * 2) / (n - 1)
  return raw24h.map((v, i) => `${padX + i * stepX},${h - padY - (v/max*(h-padY*2))}`).join(' ')
})()
const area24h = (() => {
  const w = 700; const h = 200; const padX = 20; const padY = 20
  const max = 260; const n = raw24h.length
  const stepX = (w - padX * 2) / (n - 1)
  let pts = `${padX},${h - padY} `
  raw24h.forEach((v, i) => { pts += `${padX + i * stepX},${h - padY - (v/max*(h-padY*2))} ` })
  pts += `${w - padX},${h - padY}`
  return pts
})()

// 7天柱状图
const bars7d = [
  { label: '5/1', val: 4850 }, { label: '5/2', val: 5120 }, { label: '5/3', val: 3980 },
  { label: '5/4', val: 5480 }, { label: '5/5', val: 6120 }, { label: '5/6', val: 4290 },
  { label: '5/7', val: 3740 },
]

// 30天趋势
const raw30d = [
  3200,3450,2980,4120,3850,4500,4780,3920,3560,4890,
  5120,3980,4450,4680,3890,4210,5480,6120,4290,3740,
  3560,4120,3850,3980,4450,4680,3890,5120,3980,3740,
]
const line30d = (() => {
  const w = 700; const h = 200; const padX = 20; const padY = 20
  const max = 6200; const n = raw30d.length
  const stepX = (w - padX * 2) / (n - 1)
  return raw30d.map((v, i) => `${padX + i * stepX},${h - padY - (v/max*(h-padY*2))}`).join(' ')
})()
const area30d = (() => {
  const w = 700; const h = 200; const padX = 20; const padY = 20
  const max = 6200; const n = raw30d.length
  const stepX = (w - padX * 2) / (n - 1)
  let pts = `${padX},${h - padY} `
  raw30d.forEach((v, i) => { pts += `${padX + i * stepX},${h - padY - (v/max*(h-padY*2))} ` })
  pts += `${w - padX},${h - padY}`
  return pts
})()

function handleRefresh() {}
function handleExport() {}
</script>

<style scoped>
/* ============================================
   AiInverterDetail — Guided Design
   基于设计指导书：8dp网格 · 3:7两栏 · 信息架构6组
   ============================================ */
.inv-detail {
  --c-bg: #F4F6F9;
  --c-white: #FFFFFF;
  --c-ink: #0E1A2C;
  --c-body: #415368;
  --c-muted: #8899AC;
  --c-line: #E4E8EE;
  --c-blue: #005FAD;
  --c-sky: #2190F0;
  --c-green: #0D9448;
  --c-yellow: #D4800C;
  --c-red: #D83838;
  --c-gray: #8899AC;
  --font: "Microsoft YaHei", "PingFang SC", -apple-system, sans-serif;
  --mono: "JetBrains Mono", "Fira Code", monospace;
  --r-card: 10px;

  font-family: var(--font); font-size: 14px; color: var(--c-body);
  background: var(--c-bg); min-height: 100vh; padding: 16px;
  max-width: 1200px; margin: 0 auto;
  display: flex; flex-direction: column; gap: 16px;
}

/* ====== 顶部标题栏 ====== */
.top-bar {
  display: flex; justify-content: space-between; align-items: center;
  background: var(--c-white); border-radius: var(--r-card);
  padding: 16px 24px; border: 1px solid var(--c-line);
}
.top-left { display: flex; align-items: center; gap: 14px; }
.status-badge {
  display: flex; align-items: center; gap: 6px;
  padding: 4px 12px; border-radius: 999px;
  font-size: 12px; font-weight: 700;
}
.status-badge.running { color: var(--c-green); background: #EDF8F0; }
.status-badge.standby { color: var(--c-yellow); background: #FFF8EC; }
.status-badge.fault { color: var(--c-red); background: #FDF0EF; }
.status-badge.offline { color: var(--c-gray); background: #F2F4F6; }
.badge-dot { width: 6px; height: 6px; border-radius: 50%; }
.status-badge.running .badge-dot { background: var(--c-green); }
.status-badge.fault .badge-dot { background: var(--c-red); }
.status-badge.offline .badge-dot { background: var(--c-gray); }

.top-title { font-size: 20px; font-weight: 700; color: var(--c-ink); margin: 0; }
.top-sn { font-size: 12px; color: var(--c-muted); font-family: var(--mono); }
.top-right { display: flex; align-items: center; gap: 16px; }
.top-time, .top-update { font-size: 12px; color: var(--c-muted); }

.btn {
  padding: 6px 16px; border-radius: 6px; font-size: 13px; cursor: pointer;
  border: 1px solid var(--c-line); background: var(--c-white);
  color: var(--c-body); font-family: var(--font); transition: all 0.15s;
}
.btn:hover { border-color: var(--c-blue); color: var(--c-blue); }
.btn-primary { background: var(--c-blue); color: #fff; border-color: var(--c-blue); }
.btn-primary:hover { background: var(--c-sky); }

/* ====== 主体两栏 ====== */
.main-body { display: grid; grid-template-columns: 3fr 7fr; gap: 16px; align-items: start; }

/* ====== 卡片通用 ====== */
.card { background: var(--c-white); border-radius: var(--r-card); border: 1px solid var(--c-line); }
.card-head { display: flex; justify-content: space-between; align-items: center; padding: 14px 20px; border-bottom: 1px solid var(--c-line); }
.card-head.collapsible { cursor: pointer; user-select: none; }
.card-head.collapsible:hover { background: #F9FAFB; }
.card-title { font-size: 14px; font-weight: 700; color: var(--c-ink); }

/* ====== 左栏：基本信息 ====== */
.col-left { display: flex; flex-direction: column; gap: 16px; }
.info-list { padding: 4px 0; }
.info-row { display: flex; padding: 9px 20px; border-bottom: 1px solid #F8F9FB; }
.info-row:last-child { border-bottom: none; }
.info-label { width: 72px; flex-shrink: 0; font-size: 13px; color: var(--c-muted); }
.info-val { font-size: 13px; color: var(--c-ink); font-weight: 500; flex: 1; word-break: break-all; }
.info-val.link { color: var(--c-blue); cursor: pointer; }
.info-val.link:hover { text-decoration: underline; }

/* ====== 左栏：能量统计 ====== */
.energy-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.stat-card {
  background: var(--c-white); border: 1px solid var(--c-line); border-radius: var(--r-card);
  padding: 18px 16px; display: flex; flex-direction: column; gap: 6px;
}
.stat-label { font-size: 12px; color: var(--c-muted); }
.stat-val { font-size: 22px; font-weight: 700; color: var(--c-ink); font-family: var(--mono); line-height: 1; }
.stat-val small { font-size: 12px; font-weight: 400; color: var(--c-muted); margin-left: 3px; }

/* ====== 右栏 ====== */
.col-right { display: flex; flex-direction: column; gap: 16px; }

/* ====== 仪表盘区 ====== */
.gauge-section { display: flex; padding: 24px 28px; gap: 40px; align-items: center; }
.gauge-wrap { display: flex; flex-direction: column; align-items: center; gap: 8px; flex-shrink: 0; }
.gauge-ring { position: relative; width: 180px; height: 110px; }
.gauge-svg { display: block; }
.gauge-center { position: absolute; bottom: 2px; left: 0; right: 0; text-align: center; }
.gauge-num { font-size: 36px; font-weight: 700; color: var(--c-ink); font-family: var(--mono); line-height: 1; letter-spacing: -1px; }
.gauge-unit { font-size: 14px; color: var(--c-muted); margin-left: 2px; }
.gauge-meta { text-align: center; }
.gauge-label { font-size: 13px; color: var(--c-muted); }
.gauge-rated { font-size: 12px; color: var(--c-muted); }

/* 功率占比指示器 */
.power-indicator { flex: 1; display: flex; flex-direction: column; gap: 8px; }
.pi-top { display: flex; justify-content: space-between; font-size: 13px; color: var(--c-body); }
.pi-pct { font-weight: 700; color: var(--c-blue); font-family: var(--mono); }
.pi-track { height: 8px; background: #EDF0F4; border-radius: 4px; overflow: hidden; }
.pi-fill {
  height: 100%; border-radius: 4px;
  background: linear-gradient(90deg, var(--c-blue), var(--c-sky));
  transition: width 0.5s ease;
}
.pi-range { display: flex; justify-content: space-between; font-size: 11px; color: var(--c-muted); }

/* ====== 趋势区 ====== */
.trend-section { }
.trend-tabs { display: flex; gap: 2px; background: #F0F3F7; border-radius: 6px; padding: 2px; }
.t-tab {
  padding: 4px 14px; font-size: 12px; cursor: pointer; border-radius: 4px;
  color: var(--c-muted); font-weight: 500; transition: all 0.15s;
}
.t-tab:hover { color: var(--c-body); }
.t-tab.on { background: #fff; color: var(--c-blue); font-weight: 700; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }

.trend-chart-area { padding: 16px 20px 4px; height: 220px; }
.trend-svg { width: 100%; height: 100%; }
.trend-bars { display: flex; align-items: flex-end; gap: 4px; height: 100%; justify-content: center; padding-bottom: 22px; position: relative; }
.tbar-col { flex: 1; max-width: 64px; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end; }
.tbar-fill {
  width: 100%; background: linear-gradient(180deg, var(--c-sky), var(--c-blue));
  border-radius: 4px 4px 0 0; min-height: 2px; transition: height 0.4s ease;
}
.tbar-label { position: absolute; bottom: 0; font-size: 10px; color: var(--c-muted); }

.trend-legend { padding: 0 20px 12px; font-size: 11px; color: var(--c-muted); }

/* ====== 运维区 ====== */
.collapse-arrow {
  font-size: 14px; color: var(--c-muted); transition: transform 0.25s ease;
}
.collapse-arrow.open { transform: rotate(180deg); }
.ops-body { padding: 16px 20px; display: flex; flex-direction: column; gap: 14px; }
.ops-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px 24px; }
.ops-cell { display: flex; flex-direction: column; gap: 4px; }
.ops-label { font-size: 12px; color: var(--c-muted); }
.ops-val { font-size: 14px; color: var(--c-ink); font-weight: 500; }
.ops-val.expiring { color: var(--c-red); }
.ops-remark p { font-size: 13px; color: var(--c-body); margin: 4px 0 0; line-height: 1.5; }
</style>
