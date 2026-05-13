<template>
  <div class="inv-outer">
    <div class="inv-layout">
      <!-- ===== 左侧逆变器面板 ===== -->
      <aside class="inv-panel" :class="{ fold: isCollapsed }">
        <div v-if="!isCollapsed" class="panel-inner">
          <div class="panel-search">
            <el-input v-model="searchQuery" placeholder="搜索逆变器" size="small" clearable>
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
          </div>
          <div v-if="inverterList.length === 0 && !listLoading" class="panel-empty">
            <el-empty description="暂无逆变器" :image-size="60" />
          </div>
          <el-menu v-else :default-active="currentInverter ? String(currentInverter.sn) : ''" class="inv-menu">
            <el-menu-item v-for="inv in filteredInverters" :key="inv.sn" :index="String(inv.sn)" @click="selectInverter(inv)">
              <span class="menu-row">
                <span class="menu-pip" :class="inv.status === 'running' ? 'run' : 'stop'"></span>
                <span class="menu-label">{{ inv.name }}</span>
              </span>
            </el-menu-item>
          </el-menu>
        </div>
      </aside>

      <!-- 折叠拉手 -->
      <button class="inv-toggle" @click="isCollapsed = !isCollapsed">
        <el-icon><ArrowLeft v-if="!isCollapsed" /><ArrowRight v-else /></el-icon>
      </button>

      <!-- ===== 右侧主内容 ===== -->
      <main class="inv-main" v-if="currentInverter">
        <!-- 标题栏 -->
        <header class="inv-header">
          <div class="hdr-left">
            <div class="hdr-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="22" height="22">
                <rect x="3" y="3" width="18" height="18" rx="3"/>
                <path d="M7 8h10M7 12h6M7 16h8"/>
              </svg>
            </div>
            <div>
              <h1 class="hdr-title">{{ currentInverter.name }}</h1>
              <p class="hdr-meta">
                <span>电站 {{ currentStation.id }}</span>
                <span class="meta-sep">|</span>
                <span>{{ currentInverter.updateTime }}</span>
              </p>
            </div>
          </div>
          <div class="hdr-actions">
            <button class="act-btn primary" @click="handleControl">逆变器控制</button>
            <button class="act-btn" @click="handleCalibrate">校准电量</button>
            <button class="act-btn" @click="handleLog">操作日志</button>
            <button class="act-btn danger" @click="goBack">返回</button>
          </div>
        </header>

        <!-- 基础信息卡片 -->
        <section class="info-card">
          <div class="info-top">
            <div class="device-visual">
              <svg viewBox="0 0 80 130" class="device-svg" width="56" height="91">
                <rect x="4" y="4" width="72" height="122" rx="6" fill="#F8FAFB" stroke="#D5DFE8" stroke-width="1.5"/>
                <rect x="18" y="22" width="44" height="28" rx="3" fill="#E6EEF4"/>
                <circle cx="40" cy="82" r="16" fill="#E6EEF4" stroke="#D0DAE3" stroke-width="1"/>
                <circle cx="40" cy="82" r="6" fill="#fff"/>
              </svg>
              <span class="sn-text">SN: {{ currentInverter.sn }}</span>
            </div>
            <div class="info-grid">
              <div class="info-cell"><span class="cell-label">型号</span><span class="cell-val">{{ currentInverter.model }}</span></div>
              <div class="info-cell"><span class="cell-label">机型</span><span class="cell-val">{{ currentInverter.type }}</span></div>
              <div class="info-cell"><span class="cell-label">额定功率</span><span class="cell-val">{{ currentInverter.ratedPower }}</span></div>
              <div class="info-cell"><span class="cell-label">所属电站</span><span class="cell-val link" @click="goToStation">{{ currentStation.name }} <span class="link-arrow">→</span></span></div>
              <div class="info-cell"><span class="cell-label">质保状态</span><span class="cell-val ok">{{ currentInverter.warrantyStatus }}</span></div>
              <div class="info-cell"><span class="cell-label">质保到期</span><span class="cell-val">{{ currentInverter.warrantyExpire }}</span></div>
              <div class="info-cell"><span class="cell-label">国家标准</span><span class="cell-val link">{{ currentInverter.standard }} <span class="link-arrow">→</span></span></div>
              <div class="info-cell"><span class="cell-label">逆变器版本</span><span class="cell-val">{{ currentInverter.version }}</span></div>
              <div class="info-cell"><span class="cell-label">AFO版本</span><span class="cell-val">{{ currentInverter.afoVersion }}</span></div>
              <div class="info-cell"><span class="cell-label">G100运行</span><span class="cell-val">{{ currentInverter.g100Status }}</span></div>
              <div class="info-cell"><span class="cell-label">AFO方案</span><span class="cell-val">{{ currentInverter.afoScheme }}</span></div>
              <div class="info-cell"><span class="cell-label">备注</span><span class="cell-val muted">{{ currentInverter.remark }}</span></div>
              <div class="info-cell"><span class="cell-label">地址</span><span class="cell-val">{{ currentInverter.address }}</span></div>
              <div class="info-cell"></div>
            </div>
          </div>
        </section>

        <!-- 实时信息区 -->
        <div class="realtime-row">
          <!-- KPI卡片 -->
          <section class="rt-kpi-card">
            <div class="rt-title">实时信息</div>
            <div class="kpi-grid">
              <div class="kpi" v-for="k in kpiList" :key="k.label">
                <span class="kpi-label">{{ k.label }}</span>
                <span class="kpi-val" :class="{ alarm: k.alarm }">{{ k.value }}</span>
              </div>
            </div>
          </section>

          <!-- 直流/交流数据表 -->
          <div class="rt-tables">
            <div class="table-block">
              <div class="tbl-head">
                <span class="tbl-title">直流侧 <em>模拟</em></span>
                <span class="tbl-col">电压(V)</span>
                <span class="tbl-col">电流(A)</span>
                <span class="tbl-col">功率(W)</span>
              </div>
              <div class="tbl-row" v-for="(r,i) in dcData" :key="i" :class="{ lo: isLowCurrent(r.current) }">
                <span class="tbl-title">{{ r.name }}</span>
                <span class="tbl-col">{{ r.voltage }}</span>
                <span class="tbl-col">
                  {{ r.current }}
                  <span v-if="isLowCurrent(r.current)" class="lo-tag">低电流</span>
                </span>
                <span class="tbl-col">{{ r.power }}</span>
              </div>
            </div>
            <div class="table-block">
              <div class="tbl-head">
                <span class="tbl-title">交流侧 <em>模拟</em></span>
                <span class="tbl-col">电压(V)</span>
                <span class="tbl-col">电流(A)</span>
                <span class="tbl-col">频率(Hz)</span>
              </div>
              <div class="tbl-row" v-for="(r,i) in acData" :key="i">
                <span class="tbl-title">{{ r.name }}</span>
                <span class="tbl-col">{{ r.voltage }}</span>
                <span class="tbl-col">{{ r.current }}</span>
                <span class="tbl-col">{{ r.freq }}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Search, ArrowLeft, ArrowRight, Cpu } from '@element-plus/icons-vue'

// ===== 模拟数据 =====
const isCollapsed = ref(false)
const searchQuery = ref('')

function mockInverters() {
  const list = []
  const prefixes = ['A区', 'B区', 'C区']
  for (let i = 1; i <= 12; i++) {
    const p = prefixes[Math.floor((i - 1) / 4)]
    const running = i <= 9
    list.push({
      sn: `INV-2024-${String(i).padStart(4, '0')}`,
      name: `${p}-${String(i).padStart(2, '0')} 逆变器`,
      status: running ? 'running' : 'stopped',
      model: 'SUN2000-330KTL-H2',
      type: '组串式',
      ratedPower: '330 kW',
      warrantyStatus: running ? '质保期内' : '已过期',
      warrantyExpire: running ? '2034-06-15' : '2024-12-31',
      standard: 'GB/T 19964-2012',
      version: 'V2.4.1',
      afoVersion: 'AFO-3.2.0',
      g100Status: running ? '已投运' : '待调试',
      afoScheme: running ? '标准方案A' : '—',
      remark: running ? '运行正常' : '需维护',
      address: `光伏园区${p}${String(i).padStart(2, '0')}号机位`,
      updateTime: '2026-05-07 14:30',
      realPower: running ? `${(Math.random() * 200 + 100).toFixed(1)} kW` : '0 kW',
      dayEnergy: running ? `${(Math.random() * 800 + 200).toFixed(1)} kWh` : '0 kWh',
      dayHours: running ? `${(Math.random() * 4 + 2).toFixed(1)} h` : '0 h',
      monthEnergy: running ? `${(Math.random() * 15 + 5).toFixed(1)} MWh` : '0 MWh',
      alarm: running ? '无' : '设备离线',
      yearEnergy: running ? `${(Math.random() * 120 + 40).toFixed(1)} MWh` : '0 MWh',
      igbtTemp: running ? `${(Math.random() * 30 + 40).toFixed(1)}°C` : '—',
      totalEnergy: running ? `${(Math.random() * 500 + 200).toFixed(1)} MWh` : '0 MWh',
    })
  }
  return list
}

const inverterList = ref(mockInverters())
const listLoading = ref(false)
const currentInverter = ref(inverterList.value[0])

const currentStation = computed(() => ({ id: 'STA-001', name: '阳光工业园屋顶电站' }))

const filteredInverters = computed(() => {
  const q = searchQuery.value.toLowerCase()
  return q ? inverterList.value.filter(i => i.name.toLowerCase().includes(q) || i.sn.toLowerCase().includes(q)) : inverterList.value
})

const kpiList = computed(() => {
  const inv = currentInverter.value
  return [
    { label: '实时功率', value: inv.realPower },
    { label: '当日发电', value: inv.dayEnergy },
    { label: '日满发小时数', value: inv.dayHours },
    { label: '当月发电', value: inv.monthEnergy },
    { label: '报警信息', value: inv.alarm, alarm: inv.alarm !== '无' },
    { label: '当年发电', value: inv.yearEnergy },
    { label: 'IGBT温度', value: inv.igbtTemp },
    { label: '累计发电', value: inv.totalEnergy },
  ]
})

function selectInverter(inv) { currentInverter.value = inv }
function goToStation() {}
function handleControl() {}
function handleCalibrate() {}
function handleLog() {}
function goBack() {}

// 直流/交流模拟数据
const dcData = [
  { name: 'MPPT-1', voltage: '756.3', current: '12.5', power: '9453' },
  { name: 'MPPT-2', voltage: '748.1', current: '11.8', power: '8827' },
  { name: 'MPPT-3', voltage: '752.0', current: '3.2', power: '2406' },
  { name: 'MPPT-4', voltage: '760.5', current: '13.1', power: '9962' },
]
const acData = [
  { name: 'A相', voltage: '400.2', current: '85.3', freq: '50.02' },
  { name: 'B相', voltage: '399.8', current: '84.7', freq: '49.98' },
  { name: 'C相', voltage: '401.1', current: '86.0', freq: '50.01' },
]
function isLowCurrent(val) { return parseFloat(val) < 5 }
</script>

<style scoped>
/* ============================================
   Solar Lab — 逆变器详情
   白底 + 天空蓝，精密仪器质感
   ============================================ */

.inv-outer {
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
  --font: "Microsoft YaHei", "PingFang SC", -apple-system, sans-serif;
  --font-mono: "JetBrains Mono", "Fira Code", monospace;
  --r-sm: 4px; --r-md: 8px; --r-lg: 12px;
  --shadow: 0 0 0 1px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.03), 0 4px 12px rgba(0,0,0,0.03);

  font-family: var(--font);
  font-size: 14px;
  color: var(--c-body);
  background: var(--c-bg);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.inv-layout { display: flex; flex: 1; overflow: hidden; }

/* ── 左侧面板 ── */
.inv-panel {
  width: 240px; flex-shrink: 0;
  background: var(--c-white);
  border-right: 1px solid var(--c-line);
  display: flex; flex-direction: column;
  transition: width 0.25s ease;
  overflow: hidden;
}
.inv-panel.fold { width: 0; }
.panel-inner { padding: 12px; display: flex; flex-direction: column; gap: 10px; height: 100%; }
.panel-empty { margin-top: 40px; }

.inv-menu { border-right: none !important; flex: 1; overflow-y: auto; }
.inv-menu :deep(.el-menu-item) {
  height: 40px; line-height: 40px; margin-bottom: 2px;
  border-radius: var(--r-md); font-size: 13px;
}
.inv-menu :deep(.el-menu-item.is-active) {
  background: var(--c-ice) !important; color: var(--c-blue) !important; font-weight: 600;
}
.menu-row { display: flex; align-items: center; gap: 8px; }
.menu-pip { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.menu-pip.run { background: var(--c-green); }
.menu-pip.stop { background: var(--c-muted); }

/* 折叠拉手 */
.inv-toggle {
  width: 24px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: var(--c-white); border: 1px solid var(--c-line); border-left: none;
  cursor: pointer; color: var(--c-muted); border-radius: 0 var(--r-md) var(--r-md) 0;
  transition: color 0.15s; margin: 20px 0;
}
.inv-toggle:hover { color: var(--c-blue); }

/* ── 右侧主内容 ── */
.inv-main {
  flex: 1; overflow-y: auto; overflow-x: hidden;
  padding: 20px 24px;
  display: flex; flex-direction: column; gap: 16px;
}

/* ── 标题栏 ── */
.inv-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  background: var(--c-white); border-radius: var(--r-lg);
  padding: 20px 24px; box-shadow: var(--shadow);
}
.hdr-left { display: flex; align-items: flex-start; gap: 14px; }
.hdr-icon {
  width: 40px; height: 40px; border-radius: var(--r-md);
  background: var(--c-ice); color: var(--c-blue);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; margin-top: 2px;
}
.hdr-title { font-size: 20px; font-weight: 700; color: var(--c-ink); margin: 0; line-height: 1.3; }
.hdr-meta { font-size: 12px; color: var(--c-muted); margin: 4px 0 0; }
.meta-sep { margin: 0 8px; color: var(--c-line); }

.hdr-actions { display: flex; gap: 8px; flex-shrink: 0; }
.act-btn {
  padding: 7px 16px; border-radius: var(--r-sm); font-size: 13px;
  border: 1px solid var(--c-line); background: var(--c-white);
  color: var(--c-body); cursor: pointer; font-family: var(--font);
  transition: all 0.15s; white-space: nowrap;
}
.act-btn:hover { border-color: var(--c-sky); color: var(--c-blue); }
.act-btn.primary { background: var(--c-blue); color: #fff; border-color: var(--c-blue); }
.act-btn.primary:hover { background: var(--c-sky); }
.act-btn.danger:hover { border-color: var(--c-red); color: var(--c-red); }

/* ── 基础信息卡片 ── */
.info-card {
  background: var(--c-white); border-radius: var(--r-lg);
  padding: 20px 24px; box-shadow: var(--shadow);
}
.info-top { display: flex; gap: 28px; }
.device-visual {
  display: flex; flex-direction: column; align-items: center;
  gap: 10px; flex-shrink: 0; min-width: 80px;
}
.device-svg { display: block; }
.sn-text { font-size: 11px; color: var(--c-muted); font-family: var(--font-mono); word-break: break-all; text-align: center; }

.info-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px 24px; flex: 1; }
.info-cell { display: flex; gap: 6px; font-size: 13px; }
.cell-label { color: var(--c-muted); white-space: nowrap; }
.cell-val { color: var(--c-ink); font-weight: 500; }
.cell-val.ok { color: var(--c-green); }
.cell-val.link { color: var(--c-blue); cursor: pointer; }
.cell-val.link:hover { text-decoration: underline; }
.cell-val.muted { color: var(--c-muted); font-style: italic; }
.link-arrow { font-size: 11px; }

/* ── 实时信息 ── */
.realtime-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

.rt-kpi-card {
  background: var(--c-white); border-radius: var(--r-lg);
  padding: 20px 24px; box-shadow: var(--shadow);
}
.rt-title {
  font-size: 15px; font-weight: 700; color: var(--c-ink);
  padding-bottom: 14px; margin-bottom: 6px;
  border-bottom: 1px solid var(--c-line);
}
.kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px 20px; }
.kpi { display: flex; flex-direction: column; gap: 4px; }
.kpi-label { font-size: 12px; color: var(--c-muted); }
.kpi-val {
  font-size: 18px; font-weight: 700; color: var(--c-ink);
  font-family: var(--font-mono);
}
.kpi-val.alarm { color: var(--c-red); }

/* ── 直流/交流表格 ── */
.rt-tables { display: flex; flex-direction: column; gap: 12px; }
.table-block {
  background: var(--c-white); border-radius: var(--r-lg);
  padding: 14px 20px; box-shadow: var(--shadow);
}
.tbl-head, .tbl-row {
  display: grid; grid-template-columns: 1fr 100px 100px 100px; gap: 12px;
  align-items: center; padding: 7px 0;
}
.tbl-head {
  font-size: 12px; font-weight: 700; color: var(--c-muted);
  text-transform: uppercase; letter-spacing: 0.4px;
  border-bottom: 1px solid var(--c-line); margin-bottom: 2px;
}
.tbl-head em { text-transform: none; font-weight: 400; }
.tbl-row { font-size: 13px; border-bottom: 1px solid #F5F6F8; }
.tbl-row:last-child { border-bottom: none; }
.tbl-row.lo { background: #FFF9F5; }
.tbl-title { font-weight: 600; color: var(--c-ink); font-size: 13px; }
.tbl-col { color: var(--c-body); font-family: var(--font-mono); font-size: 13px; }
.lo-tag {
  display: inline-block; font-size: 10px; font-weight: 700;
  color: var(--c-red); background: #FDF0EF; padding: 1px 6px;
  border-radius: var(--r-sm); margin-left: 6px; font-family: var(--font);
}
.lo .tbl-col { color: var(--c-red); }
</style>
