<template>
  <div class="di-outer">
    <!-- 设备标签切换 -->
    <div class="di-tabs">
      <span
        v-for="(t, i) in tabs" :key="i"
        class="di-tab" :class="{ on: activeTab === i }"
        @click="activeTab = i"
      >{{ t }}</span>
    </div>

    <!-- KPI 汇总卡片 -->
    <div class="kpi-row">
      <div class="kpi" v-for="k in kpiSummary" :key="k.label">
        <span class="kpi-pip" :style="{ background: k.color }"></span>
        <div class="kpi-body">
          <span class="kpi-num">{{ k.count }}</span>
          <span class="kpi-label">{{ k.label }}</span>
        </div>
      </div>
    </div>

    <!-- 搜索筛选 -->
    <div class="filter-bar">
      <el-input v-model="keyword" placeholder="搜索设备名称或SN" size="small" clearable class="filter-input" @input="page = 1" />
      <el-select v-model="model" placeholder="全部型号" size="small" clearable class="filter-select" @change="page = 1">
        <el-option v-for="m in models" :key="m" :label="m" :value="m" />
      </el-select>
      <el-select v-model="status" placeholder="全部状态" size="small" clearable class="filter-select" @change="page = 1">
        <el-option label="运行中" value="running" />
        <el-option label="故障" value="fault" />
        <el-option label="离线" value="stopped" />
      </el-select>
    </div>

    <!-- 设备卡片网格 -->
    <div class="card-grid">
      <article
        class="dev-card" :class="{ fault: d.status === 'fault', stopped: d.status === 'stopped' }"
        v-for="d in pageItems" :key="d.sn"
      >
        <!-- 卡片顶部状态条 -->
        <div class="card-top">
          <span class="card-status" :class="d.status">
            <span class="card-dot"></span>{{ statusMap[d.status] }}
          </span>
          <span class="card-model">{{ d.model }}</span>
        </div>

        <!-- 设备名 + SN -->
        <div class="card-name">{{ d.name }}</div>
        <div class="card-sn">{{ d.sn }}</div>

        <!-- 功率条 -->
        <div class="card-power">
          <div class="power-head">
            <span>实时功率</span>
            <span class="power-val">{{ d.realTimePower != null ? d.realTimePower.toFixed(1) : '--' }} kW</span>
          </div>
          <div class="power-bar">
            <div class="power-fill" :style="{ width: powerPct(d) + '%' }"></div>
          </div>
        </div>

        <!-- 底部数据行 -->
        <div class="card-meta">
          <div class="meta-item">
            <span class="meta-label">当日电量</span>
            <span class="meta-val">{{ d.dailyEnergy != null ? d.dailyEnergy.toFixed(0) : '--' }}<small>kWh</small></span>
          </div>
          <div class="meta-item">
            <span class="meta-label">当日等效</span>
            <span class="meta-val">{{ d.equivalentHours != null ? d.equivalentHours.toFixed(1) : '--' }}<small>h</small></span>
          </div>
          <div class="meta-item">
            <span class="meta-label">累计电量</span>
            <span class="meta-val">{{ d.cumulativeEnergy != null ? fmtNum(d.cumulativeEnergy) : '--' }}<small>kWh</small></span>
          </div>
          <div class="meta-item">
            <span class="meta-label">额定功率</span>
            <span class="meta-val">{{ d.ratedPower }}<small>kW</small></span>
          </div>
          <div class="meta-item">
            <span class="meta-label">功率占比</span>
            <span class="meta-val">{{ d.utilizationRate != null ? d.utilizationRate.toFixed(1) : '--' }}<small>%</small></span>
          </div>
          <div class="meta-item">
            <span class="meta-label">安装区域</span>
            <span class="meta-val area">{{ d.area }}</span>
          </div>
        </div>

        <!-- 底部操作 -->
        <div class="card-foot">
          <span class="foot-date">{{ fmtDate(d.commissioningTime) }} 投产</span>
          <span class="foot-action" @click="toast = '查看 ' + d.name">详情 →</span>
        </div>
      </article>
    </div>

    <!-- 空态 -->
    <div v-if="filtered.length === 0" class="empty">没有匹配的设备</div>

    <!-- 分页 -->
    <div class="pager" v-if="totalPages > 1">
      <button :disabled="page === 1" @click="page = 1">首页</button>
      <button :disabled="page === 1" @click="page--">‹</button>
      <span class="page-num">{{ page }} / {{ totalPages }}</span>
      <button :disabled="page === totalPages" @click="page++">›</button>
      <button :disabled="page === totalPages" @click="page = totalPages">尾页</button>
      <span class="pager-total">共 {{ filtered.length }} 台</span>
    </div>

    <!-- Toast -->
    <Transition name="fade">
      <div v-if="toast" class="toast">{{ toast }}</div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// ===== 模拟数据 =====
function mockDevices() {
  const list = []
  const areas = ['A区-1号机位', 'A区-2号机位', 'B区-1号机位', 'B区-3号机位', 'C区-1号机位', 'C区-2号机位', 'D区-屋顶', 'D区-地面', 'E区-1号机位', 'E区-3号机位']
  const models = ['SUN2000-330KTL-H2', 'SUN2000-300KTL-H1', 'SUN2000-196KTL-H2', 'SUN2000-330KTL-H2', 'SUN2000-300KTL-H1']
  for (let i = 1; i <= 28; i++) {
    const running = i <= 20
    const fault = i === 21 || i === 22
    const status = fault ? 'fault' : running ? 'running' : 'stopped'
    const rated = [330, 300, 196, 330, 300][i % 5]
    const realPower = status === 'running' ? Math.random() * rated : status === 'fault' ? Math.random() * rated * 0.3 : 0
    const dailyEnergy = status === 'running' ? Math.random() * rated * 5 : 0
    const eqHours = status === 'running' ? Math.random() * 4 + 1 : 0
    const cumEnergy = running ? Math.random() * 5000 + 2000 + i * 300 : i * 100

    list.push({
      sn: `INV-2024-${String(i).padStart(4, '0')}`,
      name: `${areas[i % areas.length]}-${String(i).padStart(2, '0')} 逆变器`,
      status,
      model: models[i % 5],
      ratedPower: rated,
      realTimePower: realPower,
      equivalentHours: eqHours,
      dailyEnergy: dailyEnergy,
      cumulativeEnergy: cumEnergy,
      utilizationRate: status === 'running' ? 75 + Math.random() * 23 : 0,
      area: areas[i % areas.length],
      commissioningTime: Date.now() - Math.random() * 3 * 365 * 24 * 3600 * 1000,
      warrantyExpiration: Date.now() + Math.random() * 10 * 365 * 24 * 3600 * 1000,
    })
  }
  return list
}

const tabs = ['逆变器', '电池', '采集器', 'EPM', '气象仪', '电表']
const activeTab = ref(0)
const statusMap = { running: '运行中', fault: '故障', stopped: '离线' }

const devices = ref(mockDevices())
const keyword = ref('')
const model = ref('')
const status = ref('')
const page = ref(1)
const pageSize = 12
const toast = ref('')

const models = computed(() => [...new Set(devices.value.map(d => d.model))].sort())

const filtered = computed(() => {
  let r = devices.value
  if (status.value) r = r.filter(d => d.status === status.value)
  if (keyword.value) {
    const kw = keyword.value.toLowerCase()
    r = r.filter(d => d.name.toLowerCase().includes(kw) || d.sn.toLowerCase().includes(kw))
  }
  if (model.value) r = r.filter(d => d.model === model.value)
  return r
})

const totalPages = computed(() => Math.ceil(filtered.value.length / pageSize))
const pageItems = computed(() => {
  const s = (page.value - 1) * pageSize
  return filtered.value.slice(s, s + pageSize)
})

const kpiSummary = computed(() => {
  const all = devices.value
  return [
    { label: '总数', count: all.length, color: 'var(--c-ink)' },
    { label: '运行中', count: all.filter(d => d.status === 'running').length, color: 'var(--c-green)' },
    { label: '故障', count: all.filter(d => d.status === 'fault').length, color: 'var(--c-red)' },
    { label: '离线', count: all.filter(d => d.status === 'stopped').length, color: 'var(--c-muted)' },
  ]
})

function powerPct(d) {
  if (!d.realTimePower || !d.ratedPower) return 0
  return Math.min(d.realTimePower / d.ratedPower * 100, 100)
}
function fmtNum(n) { return n != null ? n.toLocaleString('en-US', { maximumFractionDigits: 0 }) : '--' }
function fmtDate(ts) {
  if (!ts) return '--'
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}
</script>

<style scoped>
/* ============================================
   Device Info Cards — Solar Lab 蓝白
   ============================================ */

.di-outer {
  --c-bg: #F9FAFB;
  --c-white: #FFFFFF;
  --c-ink: #13202E;
  --c-body: #3B4858;
  --c-muted: #8F9BA8;
  --c-line: #E9ECF0;
  --c-blue: #0070D6;
  --c-sky: #1A8FF0;
  --c-ice: #EBF5FF;
  --c-green: #1BA04A;
  --c-red: #E0343C;
  --c-amber: #D4880F;
  --c-fault-bg: #FFF8F5;
  --c-stop-bg: #F8F9FA;
  --font: "Microsoft YaHei", "PingFang SC", -apple-system, sans-serif;
  --font-mono: "JetBrains Mono", "Fira Code", monospace;
  --r-sm: 4px; --r-md: 8px; --r-lg: 12px;
  --shadow: 0 0 0 1px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.03), 0 4px 12px rgba(0,0,0,0.03);

  font-family: var(--font);
  font-size: 13px;
  color: var(--c-body);
  background: var(--c-bg);
  padding: 20px;
  min-height: 100%;
}

/* ── 标签导航 ── */
.di-tabs {
  display: flex; gap: 0; margin-bottom: 16px;
  background: var(--c-white); border-radius: var(--r-lg);
  padding: 0 8px; box-shadow: var(--shadow);
}
.di-tab {
  padding: 10px 20px; cursor: pointer; color: var(--c-muted);
  font-size: 14px; transition: all 0.15s; position: relative;
}
.di-tab:hover { color: var(--c-ink); }
.di-tab.on { color: var(--c-blue); font-weight: 700; }
.di-tab.on::after {
  content: ''; position: absolute; bottom: 0; left: 20px; right: 20px;
  height: 2px; background: var(--c-blue); border-radius: 1px;
}

/* ── KPI 汇总行 ── */
.kpi-row {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;
  margin-bottom: 14px;
}
.kpi {
  background: var(--c-white); border-radius: var(--r-lg);
  padding: 16px 20px; box-shadow: var(--shadow);
  display: flex; align-items: center; gap: 14px;
}
.kpi-pip { width: 3px; height: 36px; border-radius: 2px; flex-shrink: 0; }
.kpi-body { display: flex; flex-direction: column; }
.kpi-num { font-size: 26px; font-weight: 700; color: var(--c-ink); line-height: 1.1; }
.kpi-label { font-size: 12px; color: var(--c-muted); margin-top: 2px; }

/* ── 搜索筛选 ── */
.filter-bar {
  display: flex; gap: 10px; margin-bottom: 14px;
}
.filter-input { width: 260px; }
.filter-select { width: 180px; }

/* ── 卡片网格 ── */
.card-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.dev-card {
  background: var(--c-white); border-radius: var(--r-lg);
  padding: 16px; box-shadow: var(--shadow);
  transition: box-shadow 0.2s, transform 0.2s;
  display: flex; flex-direction: column; gap: 10px;
}
.dev-card:hover { box-shadow: 0 0 0 1px rgba(0,112,214,0.12), 0 2px 6px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.05); transform: translateY(-1px); }
.dev-card.fault { background: var(--c-fault-bg); }
.dev-card.stopped { background: var(--c-stop-bg); }

/* 顶部状态行 */
.card-top { display: flex; justify-content: space-between; align-items: center; }
.card-status { font-size: 11px; font-weight: 700; display: flex; align-items: center; gap: 5px; padding: 2px 8px; border-radius: 999px; }
.card-status.running { color: var(--c-green); background: #EDF8F0; }
.card-status.fault { color: var(--c-red); background: #FDF0EF; }
.card-status.stopped { color: var(--c-muted); background: #F2F3F5; }
.card-dot { width: 6px; height: 6px; border-radius: 50%; }
.card-status.running .card-dot { background: var(--c-green); }
.card-status.fault .card-dot { background: var(--c-red); }
.card-status.stopped .card-dot { background: var(--c-muted); }
.card-model { font-size: 11px; color: var(--c-muted); }

/* 设备名 + SN */
.card-name { font-size: 15px; font-weight: 700; color: var(--c-ink); line-height: 1.3; }
.card-sn { font-size: 11px; color: var(--c-muted); font-family: var(--font-mono); }

/* 功率条 */
.card-power { display: flex; flex-direction: column; gap: 4px; }
.power-head { display: flex; justify-content: space-between; font-size: 11px; color: var(--c-muted); }
.power-val { font-weight: 700; color: var(--c-ink); font-family: var(--font-mono); }
.power-bar { height: 4px; background: #EDF0F4; border-radius: 2px; overflow: hidden; }
.power-fill { height: 100%; background: linear-gradient(90deg, var(--c-sky), var(--c-blue)); border-radius: 2px; transition: width 0.5s ease; }
.dev-card.fault .power-fill { background: linear-gradient(90deg, #F5A623, var(--c-red)); }

/* 底部元数据 */
.card-meta {
  display: grid; grid-template-columns: 1fr 1fr; gap: 6px 12px;
  padding-top: 8px; border-top: 1px solid var(--c-line);
}
.meta-item { display: flex; flex-direction: column; gap: 1px; }
.meta-label { font-size: 10px; color: var(--c-muted); }
.meta-val { font-size: 13px; font-weight: 600; color: var(--c-ink); font-family: var(--font-mono); }
.meta-val small { font-weight: 400; color: var(--c-muted); margin-left: 2px; font-size: 10px; }
.meta-val.area { font-family: var(--font); font-size: 12px; }

/* 底部操作 */
.card-foot {
  display: flex; justify-content: space-between; align-items: center;
  padding-top: 8px; border-top: 1px solid var(--c-line);
}
.foot-date { font-size: 11px; color: var(--c-muted); }
.foot-action { font-size: 12px; color: var(--c-blue); cursor: pointer; font-weight: 600; }
.foot-action:hover { opacity: 0.7; }

/* ── 空态 ── */
.empty { text-align: center; padding: 60px; color: var(--c-muted); font-size: 15px; }

/* ── 分页 ── */
.pager {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  margin-top: 20px;
}
.pager button {
  padding: 5px 12px; border: 1px solid var(--c-line); background: var(--c-white);
  border-radius: var(--r-sm); cursor: pointer; font-size: 13px; color: var(--c-body);
  transition: all 0.15s; font-family: var(--font);
}
.pager button:hover:not(:disabled) { border-color: var(--c-blue); color: var(--c-blue); }
.pager button:disabled { opacity: 0.35; cursor: default; }
.page-num { font-size: 13px; color: var(--c-body); font-weight: 600; padding: 0 6px; }
.pager-total { font-size: 12px; color: var(--c-muted); margin-left: 8px; }

/* Toast */
.toast {
  position: fixed; bottom: 40px; left: 50%; transform: translateX(-50%);
  background: var(--c-ink); color: #fff; padding: 8px 20px;
  border-radius: 999px; font-size: 13px; z-index: 999; pointer-events: none;
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
