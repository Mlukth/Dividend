<template>
  <div class="v1-shell">
    <div class="v1-layout">
      <!-- 左侧面板 -->
      <div class="v1-panel" :class="{ collapsed: isCollapsed }">
        <div class="v1-panel-inner">
          <div class="v1-panel-head">
            <span class="v1-panel-title">INVERTER LIST</span>
            <span class="v1-panel-badge">{{ inverterList.length }}</span>
          </div>
          <div class="v1-search">
            <input v-model="searchQuery" placeholder="SEARCH INVERTER..." class="v1-input" />
            <span class="v1-search-icon">⌕</span>
          </div>
          <div class="v1-list">
            <div
              v-for="inv in filteredInverters"
              :key="inv.sn"
              class="v1-list-item"
              :class="{ active: currentInverter && currentInverter.sn === inv.sn }"
              @click="selectInverter(inv)"
            >
              <span class="v1-dot" :class="inv.status === 'running' ? 'live' : 'dead'"></span>
              <div class="v1-item-info">
                <span class="v1-item-name">{{ inv.name }}</span>
                <span class="v1-item-sn">{{ inv.sn }}</span>
              </div>
              <span class="v1-item-tag" :class="inv.status === 'running' ? 'live' : 'dead'">
                {{ inv.status === 'running' ? 'LIVE' : 'OFF' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 折叠把手 -->
      <div class="v1-toggle" @click="isCollapsed = !isCollapsed">
        <span class="v1-toggle-arrow">{{ isCollapsed ? '▶' : '◀' }}</span>
      </div>

      <!-- 右侧 -->
      <div class="v1-main" v-if="currentInverter">
        <!-- 顶栏 -->
        <div class="v1-topbar">
          <div class="v1-top-left">
            <div class="v1-top-icon">
              <span class="v1-icon-zap">⚡</span>
            </div>
            <div>
              <h1 class="v1-title">{{ currentInverter.name }}</h1>
              <div class="v1-sub-row">
                <span class="v1-sub-item">S/N {{ currentInverter.sn }}</span>
                <span class="v1-sub-sep">│</span>
                <span class="v1-sub-item">STATION {{ currentStation.name }}</span>
                <span class="v1-sub-sep">│</span>
                <span class="v1-sub-item">{{ currentInverter.updateTime }}</span>
              </div>
            </div>
          </div>
          <div class="v1-top-right">
            <span class="v1-status-badge" :class="currentInverter.status">
              <span class="v1-status-pulse" :class="currentInverter.status"></span>
              {{ currentInverter.status === 'running' ? 'OPERATIONAL' : 'OFFLINE' }}
            </span>
          </div>
        </div>

        <!-- 操作栏 -->
        <div class="v1-action-bar">
          <button class="v1-btn primary" @click="handleControl">REMOTE CONTROL</button>
          <button class="v1-btn" @click="handleCalibrate">CALIBRATE</button>
          <button class="v1-btn" @click="handleLog">EVENT LOG</button>
          <button class="v1-btn ghost" @click="goBack">← BACK</button>
        </div>

        <!-- 信息栅格 -->
        <div class="v1-grid-card">
          <div class="v1-grid-title">DEVICE SPECIFICATION</div>
          <div class="v1-grid">
            <div class="v1-field"><span class="v1-f-label">MODEL</span><span class="v1-f-val">{{ currentInverter.model }}</span></div>
            <div class="v1-field"><span class="v1-f-label">TYPE</span><span class="v1-f-val">{{ currentInverter.type }}</span></div>
            <div class="v1-field"><span class="v1-f-label">RATED POWER</span><span class="v1-f-val highlight">{{ currentInverter.ratedPower }}</span></div>
            <div class="v1-field"><span class="v1-f-label">STATION</span><span class="v1-f-val link" @click="goToStation">{{ currentStation.name }} →</span></div>
            <div class="v1-field"><span class="v1-f-label">WARRANTY</span><span class="v1-f-val"><span class="v1-inline-dot green"></span>{{ currentInverter.warrantyStatus }}</span></div>
            <div class="v1-field"><span class="v1-f-label">WARRANTY UNTIL</span><span class="v1-f-val">{{ currentInverter.warrantyExpire }}</span></div>
            <div class="v1-field"><span class="v1-f-label">STANDARD</span><span class="v1-f-val link">{{ currentInverter.standard }} →</span></div>
            <div class="v1-field"><span class="v1-f-label">VERSION</span><span class="v1-f-val">{{ currentInverter.version }}</span></div>
            <div class="v1-field"><span class="v1-f-label">AFO VER</span><span class="v1-f-val">{{ currentInverter.afoVersion }}</span></div>
            <div class="v1-field"><span class="v1-f-label">G100 STATUS</span><span class="v1-f-val">{{ currentInverter.g100Status }}</span></div>
            <div class="v1-field"><span class="v1-f-label">AFO SCHEME</span><span class="v1-f-val">{{ currentInverter.afoScheme }}</span></div>
            <div class="v1-field"><span class="v1-f-label">REMARK</span><span class="v1-f-val dim">{{ currentInverter.remark }}</span></div>
            <div class="v1-field"><span class="v1-f-label">ADDRESS</span><span class="v1-f-val dim">{{ currentInverter.address }}</span></div>
          </div>
        </div>

        <!-- 实时数据 + 表格 -->
        <div class="v1-bottom">
          <!-- KPI -->
          <div class="v1-kpi-panel">
            <div class="v1-kpi-head">
              <span class="v1-kpi-title">LIVE METRICS</span>
              <span class="v1-sim-tag">SIMULATED</span>
            </div>
            <div class="v1-kpi-grid">
              <div class="v1-kpi" v-for="kpi in kpiItems" :key="kpi.label">
                <span class="v1-kpi-label">{{ kpi.label }}</span>
                <span class="v1-kpi-num" :class="kpi.accent">{{ kpi.value }}</span>
              </div>
            </div>
          </div>

          <!-- 表格区 -->
          <div class="v1-tables">
            <div class="v1-table-card">
              <div class="v1-table-head">
                <span>DC INPUTS</span><span class="v1-sim-tag small">SIM</span>
              </div>
              <div class="v1-table-row header">
                <span class="c1">CH</span><span class="c2">VOLTAGE (V)</span><span class="c3">CURRENT (A)</span><span class="c4">POWER (W)</span>
              </div>
              <div class="v1-table-scroll">
                <div v-for="(d, i) in dcData" :key="i" class="v1-table-row" :class="{ warn: isLowCurrent(d.current) }">
                  <span class="c1">{{ d.name }}</span>
                  <span class="c2">{{ d.voltage }}</span>
                  <span class="c3" :class="{ danger: isLowCurrent(d.current) }">{{ d.current }}<span v-if="isLowCurrent(d.current)" class="v1-low-chip">LOW</span></span>
                  <span class="c4">{{ d.power }}</span>
                </div>
              </div>
            </div>
            <div class="v1-table-card">
              <div class="v1-table-head">
                <span>AC OUTPUTS</span><span class="v1-sim-tag small">SIM</span>
              </div>
              <div class="v1-table-row header">
                <span class="c1">LN</span><span class="c2">VOLTAGE (V)</span><span class="c3">CURRENT (A)</span><span class="c4">FREQ (Hz)</span>
              </div>
              <div class="v1-table-scroll">
                <div v-for="(d, i) in acData" :key="i" class="v1-table-row">
                  <span class="c1">{{ d.name }}</span><span class="c2">{{ d.voltage }}</span><span class="c3">{{ d.current }}</span><span class="c4">{{ d.freq }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空 -->
      <div v-else class="v1-main empty">
        <div class="v1-empty-box">
          <span class="v1-empty-icon">◈</span>
          <p>SELECT AN INVERTER FROM THE LEFT PANEL</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

const isCollapsed = ref(false)
const searchQuery = ref('')

const currentStation = ref({ id: 'ST-2024-001', name: '西北光伏1号电站' })
const currentInverter = ref(null)

const inverterList = ref([
  { sn: 'INV-2024-A001', name: 'INVERTER #1', status:'running',model:'Solis-250K-EHV-5G',type:'STRING',ratedPower:'250kW',warrantyStatus:'NORMAL',warrantyExpire:'2028-06-15',standard:'GB/T 19964-2024',version:'V3.2.1',afoVersion:'V1.0.3',g100Status:'NORMAL',afoScheme:'PLAN B',remark:'--',address:'QINGHAI GOLMUD',realPower:'186.5 kW',dayEnergy:'1,250 kWh',dayHours:'5.2 h',monthEnergy:'28,300 kWh',yearEnergy:'156,800 kWh',totalEnergy:'1,280 MWh',alarm:'--',igbtTemp:'58.3℃',updateTime:'2026-05-06 14:32:10',stationName:'西北光伏1号电站'},
  { sn: 'INV-2024-A002', name: 'INVERTER #2', status:'running',model:'Solis-250K-EHV-5G',type:'STRING',ratedPower:'250kW',warrantyStatus:'NORMAL',warrantyExpire:'2028-06-15',standard:'GB/T 19964-2024',version:'V3.2.1',afoVersion:'V1.0.3',g100Status:'NORMAL',afoScheme:'PLAN B',remark:'MAINTENANCE',address:'QINGHAI GOLMUD',realPower:'192.1 kW',dayEnergy:'1,310 kWh',dayHours:'5.5 h',monthEnergy:'29,100 kWh',yearEnergy:'162,300 kWh',totalEnergy:'1,310 MWh',alarm:'--',igbtTemp:'62.1℃',updateTime:'2026-05-06 14:32:05',stationName:'西北光伏1号电站'},
  { sn: 'INV-2024-A003', name: 'INVERTER #3', status:'running',model:'Solis-250K-EHV-5G',type:'STRING',ratedPower:'250kW',warrantyStatus:'EXPIRING',warrantyExpire:'2026-08-20',standard:'GB/T 19964-2024',version:'V3.2.0',afoVersion:'V1.0.2',g100Status:'NORMAL',afoScheme:'PLAN A',remark:'--',address:'QINGHAI GOLMUD',realPower:'175.4 kW',dayEnergy:'1,180 kWh',dayHours:'4.9 h',monthEnergy:'26,500 kWh',yearEnergy:'148,200 kWh',totalEnergy:'1,180 MWh',alarm:'--',igbtTemp:'55.7℃',updateTime:'2026-05-06 14:31:58',stationName:'西北光伏1号电站'},
  { sn: 'INV-2024-A004', name: 'INVERTER #4', status:'stopped',model:'Solis-250K-EHV-5G',type:'STRING',ratedPower:'250kW',warrantyStatus:'NORMAL',warrantyExpire:'2028-09-10',standard:'GB/T 19964-2024',version:'V3.2.1',afoVersion:'V1.0.3',g100Status:'FAULT',afoScheme:'PLAN B',remark:'PENDING REPAIR',address:'QINGHAI GOLMUD',realPower:'0 kW',dayEnergy:'0 kWh',dayHours:'0 h',monthEnergy:'12,500 kWh',yearEnergy:'98,400 kWh',totalEnergy:'960 MWh',alarm:'OFFLINE',igbtTemp:'32.1℃',updateTime:'2026-05-06 08:15:30',stationName:'西北光伏1号电站'},
  { sn: 'INV-2024-A005', name: 'INVERTER #5', status:'running',model:'Solis-250K-EHV-5G',type:'STRING',ratedPower:'250kW',warrantyStatus:'NORMAL',warrantyExpire:'2028-11-05',standard:'GB/T 19964-2024',version:'V3.2.1',afoVersion:'V1.0.4',g100Status:'NORMAL',afoScheme:'PLAN C',remark:'--',address:'QINGHAI GOLMUD',realPower:'200.8 kW',dayEnergy:'1,390 kWh',dayHours:'5.8 h',monthEnergy:'31,200 kWh',yearEnergy:'170,500 kWh',totalEnergy:'1,420 MWh',alarm:'--',igbtTemp:'60.5℃',updateTime:'2026-05-06 14:32:15',stationName:'西北光伏1号电站'}
])

const filteredInverters = computed(() => {
  if (!searchQuery.value) return inverterList.value
  const q = searchQuery.value.toLowerCase()
  return inverterList.value.filter(i => i.name.toLowerCase().includes(q) || i.sn.toLowerCase().includes(q))
})

const selectInverter = (inv) => { currentInverter.value = { ...inv, igbtTemp: (45 + Math.random()*25).toFixed(1) + '℃' } }
selectInverter(inverterList.value[0])

const dcData = ref([
  { name:'PV1',voltage:648.6,current:0.1,power:65 },{ name:'PV2',voltage:648.6,current:0,power:0 },{ name:'PV3',voltage:596.5,current:0.1,power:60 },{ name:'PV4',voltage:596.5,current:0,power:0 },{ name:'PV5',voltage:553.9,current:0.1,power:55 },{ name:'PV6',voltage:553.9,current:0,power:0 },{ name:'PV7',voltage:632.9,current:0.2,power:127 },{ name:'PV8',voltage:632.9,current:0,power:0 },{ name:'MPPT1',voltage:648.5,current:0.1,power:65 },{ name:'MPPT2',voltage:596.6,current:0.1,power:60 }
])
const acData = ref([
  { name:'L1',voltage:255.9,current:1.4,freq:50.03 },{ name:'L2',voltage:257.7,current:1.2,freq:50.03 },{ name:'L3',voltage:255.3,current:1.2,freq:50.03 }
])

const kpiItems = computed(() => currentInverter.value ? [
  { label:'REAL-TIME POWER', value:currentInverter.value.realPower, accent:'' },
  { label:'IGBT TEMPERATURE', value:currentInverter.value.igbtTemp, accent:'temp' },
  { label:'DAILY ENERGY', value:currentInverter.value.dayEnergy, accent:'' },
  { label:'DAILY FULL HOURS', value:currentInverter.value.dayHours, accent:'' },
  { label:'MONTHLY ENERGY', value:currentInverter.value.monthEnergy, accent:'' },
  { label:'YEARLY ENERGY', value:currentInverter.value.yearEnergy, accent:'' },
  { label:'TOTAL ENERGY', value:currentInverter.value.totalEnergy, accent:'total' },
  { label:'ALARM STATUS', value:currentInverter.value.alarm || 'CLEAR', accent:'ok' },
] : [])

const isLowCurrent = (v) => v <= 0.15
const goToStation = () => ElMessage.info('跳转电站')
const goBack = () => ElMessage.info('返回')
const handleControl = () => ElMessage.info('远程控制')
const handleCalibrate = () => ElMessage.info('校准')
const handleLog = () => ElMessage.info('日志')
</script>

<style scoped>
/* ====== 工业仪表风 ====== */
.v1-shell { width:100%; height:calc(100vh - 60px); overflow:hidden; background:#0a0e14; color:#b0bec5; font-family:'JetBrains Mono','Consolas','Courier New',monospace; }
.v1-layout { display:flex; width:100%; height:100%; }

/* 面板 */
.v1-panel { width:272px; background:#11161d; border-right:2px solid #1c2430; transition:width 0.3s; flex-shrink:0; overflow:hidden; }
.v1-panel.collapsed { width:0; border-right:none; }
.v1-panel-inner { width:272px; height:100%; display:flex; flex-direction:column; }
.v1-panel-head { display:flex; align-items:center; justify-content:space-between; padding:20px 16px 8px; }
.v1-panel-title { font-size:12px; font-weight:700; letter-spacing:2px; color:#546e7a; }
.v1-panel-badge { font-size:11px; color:#00e676; background:rgba(0,230,118,0.1); padding:2px 10px; border-radius:4px; border:1px solid rgba(0,230,118,0.3); }
.v1-search { padding:12px 16px; position:relative; }
.v1-input { width:100%; background:#0a0e14; border:1px solid #1c2430; color:#b0bec5; padding:8px 32px 8px 12px; font-size:12px; font-family:inherit; outline:none; border-radius:4px; box-sizing:border-box; }
.v1-input:focus { border-color:#00e676; }
.v1-input::placeholder { color:#37474f; }
.v1-search-icon { position:absolute; right:26px; top:18px; color:#546e7a; font-size:16px; }
.v1-list { flex:1; overflow-y:auto; padding:0 8px 12px; }
.v1-list-item { display:flex; align-items:center; gap:10px; padding:10px 12px; margin-bottom:1px; border-radius:4px; cursor:pointer; border:1px solid transparent; transition:all 0.15s; }
.v1-list-item:hover { background:rgba(255,255,255,0.03); }
.v1-list-item.active { background:rgba(0,230,118,0.08); border-color:rgba(0,230,118,0.3); }
.v1-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
.v1-dot.live { background:#00e676; box-shadow:0 0 6px #00e676; }
.v1-dot.dead { background:#546e7a; }
.v1-item-info { display:flex; flex-direction:column; min-width:0; }
.v1-item-name { font-size:12px; font-weight:600; color:#cfd8dc; }
.v1-item-sn { font-size:10px; color:#546e7a; }
.v1-item-tag { font-size:10px; padding:2px 8px; border-radius:3px; flex-shrink:0; font-weight:700; letter-spacing:0.5px; }
.v1-item-tag.live { background:rgba(0,230,118,0.15); color:#00e676; border:1px solid rgba(0,230,118,0.3); }
.v1-item-tag.dead { background:rgba(255,255,255,0.05); color:#546e7a; border:1px solid rgba(255,255,255,0.06); }

/* 折叠 */
.v1-toggle { width:18px; height:48px; background:#11161d; border:1px solid #1c2430; border-left:none; border-radius:0 6px 6px 0; display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0; align-self:center; color:#546e7a; font-size:10px; transition:all 0.2s; }
.v1-toggle:hover { color:#00e676; background:#151d26; }

/* 主区 */
.v1-main { flex:1; padding:24px; overflow-y:auto; min-width:0; }
.v1-main.empty { display:flex; align-items:center; justify-content:center; }
.v1-empty-box { text-align:center; color:#37474f; }
.v1-empty-icon { font-size:48px; color:#1c2430; }
.v1-empty-box p { font-size:11px; letter-spacing:2px; margin-top:12px; }

/* 顶栏 */
.v1-topbar { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px; }
.v1-top-left { display:flex; align-items:flex-start; gap:12px; }
.v1-top-icon { width:40px; height:40px; background:rgba(0,230,118,0.12); border:1px solid rgba(0,230,118,0.3); display:flex; align-items:center; justify-content:center; border-radius:4px; flex-shrink:0; }
.v1-icon-zap { font-size:20px; }
.v1-title { margin:0; font-size:20px; font-weight:700; color:#eceff1; letter-spacing:1px; }
.v1-sub-row { display:flex; gap:12px; margin-top:4px; font-size:11px; color:#546e7a; }
.v1-sub-item { color:#546e7a; }
.v1-sub-sep { color:#263238; }
.v1-status-badge { display:flex; align-items:center; gap:6px; padding:6px 14px; border-radius:4px; font-size:11px; font-weight:700; letter-spacing:1px; }
.v1-status-badge.running { background:rgba(0,230,118,0.1); color:#00e676; border:1px solid rgba(0,230,118,0.3); }
.v1-status-badge.stopped { background:rgba(255,82,82,0.1); color:#ff5252; border:1px solid rgba(255,82,82,0.3); }
.v1-status-pulse { width:6px; height:6px; border-radius:50%; }
.v1-status-pulse.running { background:#00e676; box-shadow:0 0 8px #00e676; animation:pulse 1.5s infinite; }
.v1-status-pulse.stopped { background:#ff5252; }
@keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.3;} }

/* 操作栏 */
.v1-action-bar { display:flex; gap:8px; margin-bottom:16px; }
.v1-btn { padding:8px 18px; font-size:11px; font-weight:700; letter-spacing:0.5px; cursor:pointer; border:1px solid #1c2430; background:#11161d; color:#78909c; border-radius:4px; font-family:inherit; transition:all 0.15s; }
.v1-btn:hover { border-color:#00e676; color:#00e676; }
.v1-btn.primary { background:rgba(0,230,118,0.12); border-color:rgba(0,230,118,0.3); color:#00e676; }
.v1-btn.primary:hover { background:rgba(0,230,118,0.2); }
.v1-btn.ghost { border-color:transparent; color:#546e7a; }
.v1-btn.ghost:hover { color:#ff5252; }

/* 信息栅格 */
.v1-grid-card { background:#11161d; border:1px solid #1c2430; padding:20px 24px; margin-bottom:16px; border-radius:6px; }
.v1-grid-title { font-size:10px; font-weight:700; letter-spacing:2px; color:#546e7a; margin-bottom:16px; padding-bottom:12px; border-bottom:1px solid #1c2430; }
.v1-grid { display:grid; grid-template-columns:repeat(4, 1fr); gap:14px 20px; }
.v1-field { display:flex; flex-direction:column; gap:4px; }
.v1-f-label { font-size:9px; font-weight:700; letter-spacing:1.5px; color:#546e7a; }
.v1-f-val { font-size:13px; color:#cfd8dc; font-weight:500; }
.v1-f-val.highlight { color:#00e676; font-size:16px; font-weight:700; }
.v1-f-val.link { color:#4fc3f7; cursor:pointer; }
.v1-f-val.link:hover { color:#81d4fa; }
.v1-f-val.dim { color:#546e7a; }
.v1-inline-dot { display:inline-block; width:6px; height:6px; border-radius:50%; margin-right:6px; }
.v1-inline-dot.green { background:#00e676; }

/* 底部区 */
.v1-bottom { display:flex; gap:16px; }
.v1-kpi-panel { width:360px; background:#11161d; border:1px solid #1c2430; border-radius:6px; padding:20px; flex-shrink:0; }
.v1-kpi-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; padding-bottom:12px; border-bottom:1px solid #1c2430; }
.v1-kpi-title { font-size:10px; font-weight:700; letter-spacing:2px; color:#546e7a; }
.v1-sim-tag { font-size:9px; padding:2px 8px; border-radius:3px; background:rgba(255,171,0,0.12); color:#ffab00; letter-spacing:1px; font-weight:700; border:1px solid rgba(255,171,0,0.3); }
.v1-sim-tag.small { font-size:8px; padding:1px 6px; }
.v1-kpi-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
.v1-kpi { padding:12px; background:rgba(255,255,255,0.02); border:1px solid #1c2430; border-left:3px solid #1c2430; border-radius:4px; display:flex; flex-direction:column; gap:6px; }
.v1-kpi:nth-child(1), .v1-kpi:nth-child(2) { border-left-color:#00e676; }
.v1-kpi:last-child { grid-column:span 2; border-left-color:#ffab00; }
.v1-kpi-label { font-size:9px; letter-spacing:1px; color:#546e7a; font-weight:600; }
.v1-kpi-num { font-size:20px; font-weight:700; color:#eceff1; }
.v1-kpi-num.temp { color:#ffab00; }
.v1-kpi-num.total { font-size:16px; color:#78909c; }
.v1-kpi-num.ok { font-size:14px; color:#00e676; }

/* 表格 */
.v1-tables { flex:1; display:flex; flex-direction:column; gap:12px; min-width:0; }
.v1-table-card { background:#11161d; border:1px solid #1c2430; border-radius:6px; overflow:hidden; }
.v1-table-head { display:flex; align-items:center; justify-content:space-between; padding:12px 20px; background:rgba(255,255,255,0.02); border-bottom:1px solid #1c2430; font-size:10px; font-weight:700; letter-spacing:1.5px; color:#546e7a; }
.v1-table-row { display:grid; grid-template-columns:minmax(60px,1fr) minmax(80px,1.2fr) minmax(110px,1.5fr) minmax(70px,1fr); padding:9px 20px; border-bottom:1px solid rgba(255,255,255,0.03); font-size:12px; color:#b0bec5; }
.v1-table-row.header { font-size:10px; color:#546e7a; font-weight:600; background:rgba(255,255,255,0.015); }
.v1-table-row:nth-child(even):not(.header) { background:rgba(255,255,255,0.01); }
.v1-table-scroll { max-height:220px; overflow-y:auto; }
.v1-table-row:last-child { border-bottom:none; }
.v1-table-row.warn { background:rgba(255,82,82,0.06); }
.c1{grid-column:1}.c2{grid-column:2}.c3{grid-column:3;display:flex;align-items:center;gap:8px;}.c4{grid-column:4}
.danger { color:#ff5252; font-weight:700; }
.v1-low-chip { display:inline-block; padding:1px 6px; font-size:9px; border-radius:3px; background:#ff5252; color:#fff; font-weight:700; letter-spacing:0.5px; }
</style>
