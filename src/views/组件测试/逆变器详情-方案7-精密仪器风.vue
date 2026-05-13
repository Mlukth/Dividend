<template>
  <div class="page">
    <div class="layout">
      <div class="left-panel" :class="{ collapsed: isCollapsed }">
        <div class="panel-inner">
          <div class="panel-top">
            <span class="panel-title">Inverters</span>
            <span class="panel-count">{{ inverterList.length }}</span>
          </div>
          <div class="search-wrap">
            <el-input v-model="searchQuery" placeholder="Filter..." size="small" clearable />
          </div>
          <div class="inv-list">
            <div v-for="inv in filteredInverters" :key="inv.sn" class="inv-row" :class="{ active: cur && cur.sn === inv.sn }" @click="selectInverter(inv)">
              <span class="dot" :class="inv.status"></span>
              <div class="inv-text">
                <span class="inv-name">{{ inv.name }}</span>
                <span class="inv-sn">{{ inv.sn }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="handle" @click="isCollapsed = !isCollapsed">
        <svg viewBox="0 0 1024 1024" :style="{ transform: isCollapsed ? 'rotate(180deg)' : '' }"><path fill="currentColor" d="M340.864 149.312a30.59 30.59 0 0 0 0 42.752L652.736 512 340.864 831.872a30.59 30.59 0 0 0 0 42.752 29.12 29.12 0 0 0 41.728 0L714.24 534.336a32 32 0 0 0 0-44.672L382.592 149.376a29.12 29.12 0 0 0-41.728 0z"/></svg>
      </div>

      <div class="main" v-if="cur">
        <div class="hero">
          <div class="hero-left">
            <div class="hero-label">DEVICE</div>
            <h1 class="hero-name">{{ cur.name }}<span class="hero-stat" :class="cur.status">{{ cur.status === 'running' ? '● ONLINE' : '○ OFFLINE' }}</span></h1>
            <div class="hero-meta">
              <span>{{ cur.model }}</span><span class="meta-gap"></span><span>SN {{ cur.sn }}</span><span class="meta-gap"></span><span>{{ cur.updateTime }}</span>
            </div>
          </div>
          <div class="hero-right">
            <button class="btn" @click="handleControl">Control</button>
            <button class="btn" @click="handleCalibrate">Calibrate</button>
            <button class="btn" @click="handleLog">Log</button>
            <button class="btn dim" @click="goBack">Back</button>
          </div>
        </div>

        <div class="card info-card">
          <div class="card-label">DEVICE INFO</div>
          <div class="info-grid">
            <div class="info-f" v-for="f in infoFields" :key="f.label">
              <span class="info-l">{{ f.label }}</span>
              <span class="info-v" :class="{ link: f.link, ok: f.green }">{{ f.value }}</span>
            </div>
          </div>
        </div>

        <div class="realtime-row">
          <div class="card kpi-card">
            <div class="card-label">LIVE DATA</div>
            <div class="kpi-grid">
              <div class="kpi" v-for="k in kpiItems" :key="k.label">
                <div class="kpi-num" :class="{ warn: k.warn, ok: k.ok }">{{ k.value }}</div>
                <div class="kpi-label">{{ k.label }}</div>
              </div>
            </div>
          </div>

          <div class="tables-col">
            <div class="card table-card">
              <div class="card-label">DC INPUT</div>
              <div class="tbl">
                <div class="tbl-h"><span>CH</span><span>V</span><span>A</span><span>W</span></div>
                <div class="tbl-body">
                  <div v-for="(r,i) in dcData" :key="i" class="tbl-r" :class="{ warn: isLowCurrent(r.current) }">
                    <span>{{ r.name }}</span><span>{{ r.voltage }}</span>
                    <span :class="{ danger: isLowCurrent(r.current) }">{{ r.current }}</span>
                    <span>{{ r.power }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="card table-card">
              <div class="card-label">AC OUTPUT</div>
              <div class="tbl">
                <div class="tbl-h"><span>PH</span><span>V</span><span>A</span><span>Hz</span></div>
                <div class="tbl-body">
                  <div v-for="(r,i) in acData" :key="i" class="tbl-r">
                    <span>{{ r.name }}</span><span>{{ r.voltage }}</span><span>{{ r.current }}</span><span>{{ r.freq }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="main empty-main">
        <div class="empty-box">
          <span class="empty-dot"></span>
          <p class="empty-text">Select an inverter</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const isCollapsed = ref(false)
const searchQuery = ref('')
const cur = ref(null)
const station = ref({ id: 'ST-2024-001', name: '西北光伏1号电站' })

const inverterList = ref([
  { sn: 'INV-2024-A001', name: '1号逆变器', status: 'running', model: 'Solis-250K-EHV-5G', type: '组串式', ratedPower: '250kW', warrantyStatus: '正常', warrantyExpire: '2028-06-15', standard: 'GB/T 19964-2024', version: 'V3.2.1', afoVersion: 'V1.0.3', g100Status: '正常', afoScheme: '方案B', remark: '--', address: '青海省海西州格尔木市', realPower: '186.5kW', dayEnergy: '1,250kWh', dayHours: '5.2h', monthEnergy: '28,300kWh', yearEnergy: '156,800kWh', totalEnergy: '1,280,000kWh', alarm: '--', igbtTemp: '58.3℃', updateTime: '2026-05-07 14:32:10' },
  { sn: 'INV-2024-A002', name: '2号逆变器', status: 'running', model: 'Solis-250K-EHV-5G', type: '组串式', ratedPower: '250kW', warrantyStatus: '正常', warrantyExpire: '2028-06-15', standard: 'GB/T 19964-2024', version: 'V3.2.1', afoVersion: 'V1.0.3', g100Status: '正常', afoScheme: '方案B', remark: '例行维护中', address: '青海省海西州格尔木市', realPower: '192.1kW', dayEnergy: '1,310kWh', dayHours: '5.5h', monthEnergy: '29,100kWh', yearEnergy: '162,300kWh', totalEnergy: '1,310,000kWh', alarm: '--', igbtTemp: '62.1℃', updateTime: '2026-05-07 14:32:05' },
  { sn: 'INV-2024-A003', name: '3号逆变器', status: 'running', model: 'Solis-250K-EHV-5G', type: '组串式', ratedPower: '250kW', warrantyStatus: '即将到期', warrantyExpire: '2026-08-20', standard: 'GB/T 19964-2024', version: 'V3.2.0', afoVersion: 'V1.0.2', g100Status: '正常', afoScheme: '方案A', remark: '--', address: '青海省海西州格尔木市', realPower: '175.4kW', dayEnergy: '1,180kWh', dayHours: '4.9h', monthEnergy: '26,500kWh', yearEnergy: '148,200kWh', totalEnergy: '1,180,000kWh', alarm: '--', igbtTemp: '55.7℃', updateTime: '2026-05-07 14:31:58' },
  { sn: 'INV-2024-A004', name: '4号逆变器', status: 'stopped', model: 'Solis-250K-EHV-5G', type: '组串式', ratedPower: '250kW', warrantyStatus: '正常', warrantyExpire: '2028-09-10', standard: 'GB/T 19964-2024', version: 'V3.2.1', afoVersion: 'V1.0.3', g100Status: '异常', afoScheme: '方案B', remark: '待检修', address: '青海省海西州格尔木市', realPower: '0kW', dayEnergy: '0kWh', dayHours: '0h', monthEnergy: '12,500kWh', yearEnergy: '98,400kWh', totalEnergy: '960,000kWh', alarm: '离线', igbtTemp: '32.1℃', updateTime: '2026-05-07 08:15:30' },
  { sn: 'INV-2024-A005', name: '5号逆变器', status: 'running', model: 'Solis-250K-EHV-5G', type: '组串式', ratedPower: '250kW', warrantyStatus: '正常', warrantyExpire: '2028-11-05', standard: 'GB/T 19964-2024', version: 'V3.2.1', afoVersion: 'V1.0.4', g100Status: '正常', afoScheme: '方案C', remark: '--', address: '青海省海西州格尔木市', realPower: '200.8kW', dayEnergy: '1,390kWh', dayHours: '5.8h', monthEnergy: '31,200kWh', yearEnergy: '170,500kWh', totalEnergy: '1,420,000kWh', alarm: '--', igbtTemp: '60.5℃', updateTime: '2026-05-07 14:32:15' }
])

const filteredInverters = computed(() => {
  if (!searchQuery.value) return inverterList.value
  const q = searchQuery.value.toLowerCase()
  return inverterList.value.filter(i => i.name.includes(q) || i.sn.toLowerCase().includes(q))
})

const infoFields = computed(() => cur.value ? [
  { label: 'Model', value: cur.value.model }, { label: 'Type', value: cur.value.type },
  { label: 'Rated Power', value: cur.value.ratedPower }, { label: 'Station', value: station.value.name, link: true },
  { label: 'Warranty', value: cur.value.warrantyStatus, green: cur.value.warrantyStatus === '正常' },
  { label: 'Warranty Exp.', value: cur.value.warrantyExpire }, { label: 'Standard', value: cur.value.standard, link: true },
  { label: 'Version', value: cur.value.version }, { label: 'AFO Ver.', value: cur.value.afoVersion },
  { label: 'G100 Status', value: cur.value.g100Status }, { label: 'AFO Scheme', value: cur.value.afoScheme },
  { label: 'Remark', value: cur.value.remark }, { label: 'Address', value: cur.value.address },
  { label: 'SN', value: cur.value.sn }, { label: 'Timestamp', value: cur.value.updateTime },
] : [])

const kpiItems = computed(() => cur.value ? [
  { label: 'Real Power', value: cur.value.realPower },
  { label: 'IGBT Temp', value: cur.value.igbtTemp, warn: parseFloat(cur.value.igbtTemp) > 60 },
  { label: 'Day Energy', value: cur.value.dayEnergy },
  { label: 'Full Hours', value: cur.value.dayHours },
  { label: 'Month Energy', value: cur.value.monthEnergy },
  { label: 'Year Energy', value: cur.value.yearEnergy },
  { label: 'Total Energy', value: cur.value.totalEnergy },
  { label: 'Alarm', value: cur.value.alarm === '--' ? 'CLEAR' : cur.value.alarm, ok: cur.value.alarm === '--' },
] : [])

const selectInverter = (inv) => { cur.value = { ...inv, igbtTemp: (45 + Math.random() * 25).toFixed(1) + '℃' } }
const dcData = ref([{ name: 'PV1', voltage: 648.6, current: 0.1, power: 65 },{ name: 'PV2', voltage: 648.6, current: 0, power: 0 },{ name: 'PV3', voltage: 596.5, current: 0.1, power: 60 },{ name: 'PV4', voltage: 596.5, current: 0, power: 0 },{ name: 'PV5', voltage: 553.9, current: 0.1, power: 55 },{ name: 'PV6', voltage: 553.9, current: 0, power: 0 },{ name: 'PV7', voltage: 632.9, current: 0.2, power: 127 },{ name: 'PV8', voltage: 632.9, current: 0, power: 0 },{ name: 'MPPT1', voltage: 648.5, current: 0.1, power: 65 },{ name: 'MPPT2', voltage: 596.6, current: 0.1, power: 60 }])
const acData = ref([{ name: 'L1', voltage: 255.9, current: 1.4, freq: 50.03 },{ name: 'L2', voltage: 257.7, current: 1.2, freq: 50.03 },{ name: 'L3', voltage: 255.3, current: 1.2, freq: 50.03 }])
const isLowCurrent = (v) => v <= 0.15
const goBack = () => ElMessage.info('返回上一页')
const handleControl = () => ElMessage.info('逆变器控制')
const handleCalibrate = () => ElMessage.info('校准电量')
const handleLog = () => ElMessage.info('操作日志')

onMounted(() => { cur.value = { ...inverterList.value[0], igbtTemp: (45 + Math.random() * 25).toFixed(1) + '℃' } })
</script>

<style scoped>
/* ===== 精密仪器风 — 示波器/万用表美学 ===== */
/*
  主底: #0b0b0d, 面: #111114, 卡片: #141418
  单色冷白: #e0e0e0 / #b0b0b0 / #707070 / #404040 / #262626
  唯一强调色: 青 #00e5ff 极小面积
  极致克制：无渐变、无发光、无圆角、无阴影
*/

.page { width: 100%; height: calc(100vh - 60px); overflow: hidden; font-family: "JetBrains Mono", "Consolas", "SF Mono", monospace; }
.layout { display: flex; width: 100%; height: 100%; background: #0b0b0d; overflow: hidden; }

/* ===== 左面板 ===== */
.left-panel {
  width: 260px; flex-shrink: 0; overflow: hidden;
  background: #0e0e11; border-right: 1px solid rgba(255,255,255,0.04);
  transition: width 0.25s ease;
}
.left-panel.collapsed { width: 0; border-right: none; }
.panel-inner { width: 260px; height: 100%; display: flex; flex-direction: column; color: #909090; }
.panel-top { display: flex; align-items: baseline; justify-content: space-between; padding: 24px 20px 8px; }
.panel-title { font-size: 10px; font-weight: 600; color: #505050; letter-spacing: 3px; text-transform: uppercase; }
.panel-count { font-size: 10px; color: #404040; font-weight: 600; }
.search-wrap { padding: 12px 16px 8px; }
.search-wrap :deep(.el-input__wrapper) { background: transparent; border: 1px solid rgba(255,255,255,0.05); border-radius: 0; box-shadow: none; }
.search-wrap :deep(.el-input__inner) { color: #909090; font-family: inherit; font-size: 11px; }
.search-wrap :deep(.el-input__inner::placeholder) { color: #303030; }

.inv-list { flex: 1; overflow-y: auto; padding: 0 12px 12px; }
.inv-row { display: flex; align-items: center; gap: 12px; padding: 10px 12px; cursor: pointer; transition: background 0.1s; border-bottom: 1px solid rgba(255,255,255,0.02); }
.inv-row:hover { background: rgba(255,255,255,0.015); }
.inv-row.active { background: rgba(0,229,255,0.03); border-bottom-color: rgba(0,229,255,0.08); }
.dot { width: 4px; height: 4px; flex-shrink: 0; }
.dot.running { background: #00e5ff; }
.dot.stopped { background: #404040; }
.inv-text { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.inv-name { font-size: 11px; color: #b0b0b0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.inv-sn { font-size: 9px; color: #404040; margin-top: 2px; }

/* ===== 折叠手柄 ===== */
.handle {
  width: 16px; height: 48px; flex-shrink: 0; align-self: center;
  background: #111114; border: 1px solid rgba(255,255,255,0.04); border-left: none;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: #404040; transition: color 0.2s; z-index: 2;
}
.handle:hover { color: #909090; }
.handle svg { width: 10px; height: 10px; transition: transform 0.25s; }

/* ===== 主内容区 ===== */
.main { flex: 1; padding: 32px 40px; overflow-y: auto; min-width: 0; }
.empty-main { display: flex; align-items: center; justify-content: center; }
.empty-box { text-align: center; }
.empty-dot { display: block; width: 4px; height: 4px; background: #404040; margin: 0 auto 16px; }
.empty-text { font-size: 11px; color: #404040; letter-spacing: 2px; }

/* ===== Header ===== */
.hero {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: 0 0 32px 0; margin-bottom: 32px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  color: #b0b0b0;
}
.hero-left { display: flex; flex-direction: column; gap: 16px; }
.hero-label { font-size: 9px; color: #404040; letter-spacing: 4px; font-weight: 600; }
.hero-name { margin: 0; font-size: 24px; font-weight: 300; color: #e0e0e0; letter-spacing: -0.5px; display: flex; align-items: center; gap: 12px; }
.hero-stat { font-size: 10px; font-weight: 600; letter-spacing: 2px; }
.hero-stat.running { color: #00e5ff; }
.hero-stat.stopped { color: #404040; }
.hero-meta { font-size: 10px; color: #505050; display: flex; align-items: center; }
.meta-gap { width: 24px; }
.hero-right { display: flex; gap: 2px; flex-shrink: 0; }
.btn {
  padding: 6px 14px; font-size: 10px; cursor: pointer; border: 1px solid rgba(255,255,255,0.06);
  font-family: inherit; font-weight: 500; letter-spacing: 1px; transition: all 0.15s;
  background: transparent; color: #707070;
}
.btn:hover { border-color: rgba(255,255,255,0.12); color: #b0b0b0; }
.btn:first-child { border-color: rgba(0,229,255,0.2); color: #00e5ff; }
.btn:first-child:hover { border-color: rgba(0,229,255,0.4); }
.btn.dim:hover { color: #ff5252; border-color: rgba(255,82,82,0.2); }

/* ===== 卡片 ===== */
.card { background: #111114; border: 1px solid rgba(255,255,255,0.04); padding: 28px 32px; margin-bottom: 20px; box-sizing: border-box; }
.card-label { font-size: 9px; color: #404040; letter-spacing: 3px; font-weight: 600; margin-bottom: 24px; }

/* ===== 信息网格 ===== */
.info-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px 32px; }
.info-f { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.info-l { font-size: 9px; color: #404040; letter-spacing: 1px; }
.info-v { font-size: 11px; color: #909090; word-break: break-all; }
.info-v.link { color: #00e5ff; cursor: pointer; }
.info-v.link:hover { color: #80f0ff; }
.info-v.ok { color: #707070; }

/* ===== 实时数据 ===== */
.realtime-row { display: flex; gap: 20px; }
.kpi-card { width: 360px; flex-shrink: 0; }
.kpi-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
.kpi { padding: 20px 0; border-bottom: 1px solid rgba(255,255,255,0.03); }
.kpi:nth-child(odd) { padding-right: 20px; }
.kpi:nth-child(even) { padding-left: 20px; border-left: 1px solid rgba(255,255,255,0.03); }
.kpi-num { font-size: 28px; font-weight: 200; color: #e0e0e0; letter-spacing: -1px; }
.kpi-num.warn { color: #ffab00; }
.kpi-num.ok { color: #707070; font-size: 18px; }
.kpi-label { font-size: 9px; color: #404040; letter-spacing: 2px; margin-top: 4px; }

/* ===== 表格 ===== */
.tables-col { flex: 1; display: flex; flex-direction: column; gap: 20px; min-width: 0; }
.table-card { padding: 0; overflow: hidden; }
.table-card .card-label { padding: 20px 24px 0; margin-bottom: 0; }
.tbl { font-size: 11px; }
.tbl-h { display: grid; grid-template-columns: 80px 100px 100px 1fr; padding: 12px 24px; border-bottom: 1px solid rgba(255,255,255,0.04); color: #404040; font-size: 9px; font-weight: 600; letter-spacing: 2px; }
.tbl-body { max-height: 220px; overflow-y: auto; }
.tbl-r { display: grid; grid-template-columns: 80px 100px 100px 1fr; padding: 10px 24px; border-bottom: 1px solid rgba(255,255,255,0.015); color: #808080; transition: background 0.1s; }
.tbl-r:last-child { border-bottom: none; }
.tbl-r:hover { background: rgba(255,255,255,0.01); }
.tbl-r.warn { color: #ff5252; }
.danger { color: #ff5252; font-weight: 600; }
</style>
