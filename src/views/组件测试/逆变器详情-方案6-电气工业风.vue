<template>
  <div class="page">
    <div class="layout">
      <!-- 左面板 -->
      <div class="left-panel" :class="{ collapsed: isCollapsed }">
        <div class="panel-inner">
          <div class="panel-top">
            <span class="panel-title">逆变器列表</span>
            <span class="panel-badge">{{ inverterList.length }} 台</span>
          </div>
          <div class="search-wrap">
            <el-input v-model="searchQuery" placeholder="搜索逆变器" size="small" clearable />
          </div>
          <div class="inv-list">
            <div v-for="inv in filteredInverters" :key="inv.sn" class="inv-row" :class="{ active: cur && cur.sn === inv.sn }" @click="selectInverter(inv)">
              <span class="dot" :class="inv.status"></span>
              <div class="inv-text">
                <span class="inv-name">{{ inv.name }}</span>
                <span class="inv-sn">{{ inv.sn }}</span>
              </div>
              <span class="inv-tag" :class="inv.status">{{ inv.status === 'running' ? '运行' : '停止' }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="handle" @click="isCollapsed = !isCollapsed">
        <svg viewBox="0 0 1024 1024" :style="{ transform: isCollapsed ? 'rotate(180deg)' : '' }"><path fill="currentColor" d="M340.864 149.312a30.59 30.59 0 0 0 0 42.752L652.736 512 340.864 831.872a30.59 30.59 0 0 0 0 42.752 29.12 29.12 0 0 0 41.728 0L714.24 534.336a32 32 0 0 0 0-44.672L382.592 149.376a29.12 29.12 0 0 0-41.728 0z"/></svg>
      </div>

      <div class="main" v-if="cur">
        <!-- Header -->
        <div class="hero">
          <div class="hero-left">
            <div class="hero-title-row">
              <span class="hero-icon">
                <svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M288 671.36v64.128A239.81 239.81 0 0 1 63.744 496.192a240.32 240.32 0 0 1 199.488-236.8 256.128 256.128 0 0 1 487.872-30.976A256.064 256.064 0 0 1 736 734.016v-64.768a192 192 0 0 0 3.328-377.92l-35.2-6.592-12.8-33.408a192.064 192.064 0 0 0-365.952 23.232l-9.92 40.896-41.472 7.04a176.32 176.32 0 0 0-146.24 173.568c0 91.968 70.464 167.36 160.256 175.232z"/><path fill="currentColor" d="M416 736a32 32 0 0 1-27.776-47.872l128-224a32 32 0 1 1 55.552 31.744L471.168 672H608a32 32 0 0 1 27.776 47.872l-128 224a32 32 0 1 1-55.68-31.744L552.96 736z"/></svg>
              </span>
              <h1 class="hero-name">{{ cur.name }}</h1>
              <span class="hero-badge" :class="cur.status">{{ cur.status === 'running' ? 'RUN' : 'STOP' }}</span>
            </div>
            <div class="hero-meta">
              <span>SN: {{ cur.sn }}</span><i class="sep">|</i>
              <span>型号: {{ cur.model }}</span><i class="sep">|</i>
              <span>{{ cur.updateTime }}</span>
            </div>
          </div>
          <div class="hero-right">
            <button class="btn" @click="handleControl">设备控制</button>
            <button class="btn sec" @click="handleCalibrate">校准电量</button>
            <button class="btn sec" @click="handleLog">运行日志</button>
            <button class="btn ghost" @click="goBack">← 返回</button>
          </div>
        </div>

        <!-- 基本信息卡片 -->
        <div class="card info-card">
          <div class="card-head">
            <span class="card-head-dot"></span>
            <span class="card-head-title">设备信息 DEVICE INFO</span>
          </div>
          <div class="info-grid">
            <div class="info-f" v-for="f in infoFields" :key="f.label">
              <span class="info-l">{{ f.label }}</span>
              <span class="info-v" :class="{ link: f.link, green: f.green }">{{ f.value }}</span>
            </div>
          </div>
        </div>

        <!-- 实时数据 + 表格 -->
        <div class="realtime-row">
          <div class="card kpi-card">
            <div class="card-head">
              <span class="card-head-dot live"></span>
              <span class="card-head-title">实时监测 LIVE DATA</span>
              <span class="mock-tag">SIM</span>
            </div>
            <div class="kpi-grid">
              <div class="kpi" v-for="k in kpiItems" :key="k.label">
                <div class="kpi-body">
                  <div class="kpi-num" :class="{ warn: k.warn, ok: k.ok }">{{ k.value }}</div>
                  <div class="kpi-label">{{ k.label }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="tables-col">
            <div class="card table-card">
              <div class="card-head tight">
                <span class="card-head-dot dc"></span>
                <span class="card-head-title">DC INPUT</span>
                <span class="mock-tag">SIM</span>
              </div>
              <div class="tbl">
                <div class="tbl-h"><span class="c1">CH</span><span class="c2">V</span><span class="c3">A</span><span class="c4">W</span></div>
                <div class="tbl-body">
                  <div v-for="(r,i) in dcData" :key="i" class="tbl-r" :class="{ warn: isLowCurrent(r.current) }">
                    <span class="c1">{{ r.name }}</span><span class="c2">{{ r.voltage }}</span>
                    <span class="c3" :class="{ danger: isLowCurrent(r.current) }">
                      {{ r.current }}
                      <span v-if="isLowCurrent(r.current)" class="low-chip">LOW</span>
                    </span>
                    <span class="c4">{{ r.power }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="card table-card">
              <div class="card-head tight">
                <span class="card-head-dot ac"></span>
                <span class="card-head-title">AC OUTPUT</span>
                <span class="mock-tag">SIM</span>
              </div>
              <div class="tbl">
                <div class="tbl-h"><span class="c1">PH</span><span class="c2">V</span><span class="c3">A</span><span class="c4">Hz</span></div>
                <div class="tbl-body">
                  <div v-for="(r,i) in acData" :key="i" class="tbl-r">
                    <span class="c1">{{ r.name }}</span><span class="c2">{{ r.voltage }}</span><span class="c3">{{ r.current }}</span><span class="c4 mono">{{ r.freq }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="main empty-main">
        <div class="empty-box">
          <span class="empty-icon">◈</span>
          <p class="empty-text">选择一台逆变器查看参数</p>
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
  { label: '型号', value: cur.value.model }, { label: '机型', value: cur.value.type },
  { label: '额定功率', value: cur.value.ratedPower }, { label: '所属电站', value: station.value.name, link: true },
  { label: '质保状态', value: cur.value.warrantyStatus, green: cur.value.warrantyStatus === '正常' },
  { label: '质保到期', value: cur.value.warrantyExpire }, { label: '国家标准', value: cur.value.standard, link: true },
  { label: '版本', value: cur.value.version }, { label: 'AFO版本', value: cur.value.afoVersion },
  { label: 'G100状态', value: cur.value.g100Status }, { label: 'AFO方案', value: cur.value.afoScheme },
  { label: '备注', value: cur.value.remark }, { label: '地址', value: cur.value.address },
  { label: 'SN', value: cur.value.sn }, { label: '数据时间', value: cur.value.updateTime },
] : [])

const kpiItems = computed(() => cur.value ? [
  { label: '实时功率', value: cur.value.realPower },
  { label: 'IGBT温度', value: cur.value.igbtTemp, warn: parseFloat(cur.value.igbtTemp) > 60 },
  { label: '当日发电', value: cur.value.dayEnergy },
  { label: '日满发小时', value: cur.value.dayHours },
  { label: '当月发电', value: cur.value.monthEnergy },
  { label: '当年发电', value: cur.value.yearEnergy },
  { label: '累计发电', value: cur.value.totalEnergy },
  { label: '报警状态', value: cur.value.alarm === '--' ? 'NORMAL' : cur.value.alarm, ok: cur.value.alarm === '--' },
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
/* ===== 电气工业风 — 配色 ===== */
/*
  主底: #16161a (深炭灰), 面: #1e1e24, 卡片: #21212a
  铜色: #d4880f, 琥珀: #e6a817, 绿: #3cba54, 红: #db4437
  字体: 正文等宽倾向, 工业感标签
*/

.page { width: 100%; height: calc(100vh - 60px); overflow: hidden; font-family: "Microsoft YaHei", "Consolas", monospace; }
.layout { display: flex; width: 100%; height: 100%; background: #16161a; overflow: hidden; }

/* ===== 左面板 — 工业配电柜风格 ===== */
.left-panel {
  width: 272px; flex-shrink: 0; overflow: hidden;
  background: #1a1a20;
  background-image:
    linear-gradient(rgba(212,136,15,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(212,136,15,0.04) 1px, transparent 1px);
  background-size: 32px 32px;
  border-right: 1px solid rgba(212,136,15,0.12);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.left-panel.collapsed { width: 0; border-right: none; }
.panel-inner { width: 272px; height: 100%; display: flex; flex-direction: column; color: #c8c8c8; }
.panel-top { display: flex; align-items: center; justify-content: space-between; padding: 20px 16px 8px; }
.panel-title { font-size: 15px; font-weight: 700; color: #d4880f; letter-spacing: 2px; }
.panel-badge { font-size: 10px; padding: 2px 10px; border-radius: 2px; background: rgba(212,136,15,0.1); color: #d4880f; letter-spacing: 1px; }
.search-wrap { padding: 12px 12px 8px; }
.search-wrap :deep(.el-input__wrapper) { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 2px; box-shadow: none; }
.search-wrap :deep(.el-input__inner) { color: #c8c8c8; }
.search-wrap :deep(.el-input__inner::placeholder) { color: rgba(200,200,200,0.25); }

.inv-list { flex: 1; overflow-y: auto; padding: 4px 8px 12px; }
.inv-row { display: flex; align-items: center; gap: 10px; padding: 10px 12px; margin-bottom: 1px; cursor: pointer; transition: background 0.15s; border-left: 2px solid transparent; }
.inv-row:hover { background: rgba(212,136,15,0.04); }
.inv-row.active { background: rgba(212,136,15,0.08); border-left-color: #d4880f; }
.dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.dot.running { background: #3cba54; box-shadow: 0 0 4px rgba(60,186,84,0.5); }
.dot.stopped { background: #555; }
.inv-text { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.inv-name { font-size: 12px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.inv-sn { font-size: 10px; color: rgba(200,200,200,0.35); margin-top: 1px; font-family: "Consolas", monospace; }
.inv-tag { font-size: 9px; padding: 2px 6px; border-radius: 2px; flex-shrink: 0; font-weight: 600; letter-spacing: 1px; }
.inv-tag.running { background: rgba(60,186,84,0.12); color: #3cba54; }
.inv-tag.stopped { background: rgba(255,255,255,0.04); color: #666; }

/* ===== 折叠手柄 ===== */
.handle {
  width: 20px; height: 56px; flex-shrink: 0; align-self: center;
  background: #21212a; border: 1px solid rgba(255,255,255,0.06); border-left: none;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: #666; transition: all 0.2s; z-index: 2;
}
.handle:hover { background: #2a2a34; color: #d4880f; }
.handle svg { width: 12px; height: 12px; transition: transform 0.25s; }

/* ===== 主内容区 ===== */
.main { flex: 1; padding: 20px 24px; overflow-y: auto; min-width: 0; }
.empty-main { display: flex; align-items: center; justify-content: center; }
.empty-box { text-align: center; }
.empty-icon { font-size: 48px; color: #333; display: block; margin-bottom: 12px; }
.empty-text { font-size: 13px; color: #555; }

/* ===== Header ===== */
.hero {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: 20px 24px; margin-bottom: 16px;
  background: #1e1e24; border: 1px solid rgba(212,136,15,0.15);
  color: #c8c8c8;
}
.hero-left { display: flex; flex-direction: column; gap: 10px; }
.hero-title-row { display: flex; align-items: center; gap: 10px; }
.hero-icon {
  width: 36px; height: 36px; flex-shrink: 0;
  border: 1px solid rgba(212,136,15,0.3); color: #d4880f;
  display: flex; align-items: center; justify-content: center;
}
.hero-icon svg { width: 16px; height: 16px; }
.hero-name { margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 1px; }
.hero-badge { font-size: 10px; padding: 2px 8px; font-weight: 600; letter-spacing: 2px; }
.hero-badge.running { background: rgba(60,186,84,0.1); color: #3cba54; border: 1px solid rgba(60,186,84,0.2); }
.hero-badge.stopped { background: rgba(255,255,255,0.03); color: #555; border: 1px solid rgba(255,255,255,0.06); }
.hero-meta { font-size: 11px; color: rgba(200,200,200,0.4); display: flex; align-items: center; gap: 6px; font-family: "Consolas", monospace; }
.sep { color: rgba(255,255,255,0.08); font-style: normal; }
.hero-right { display: flex; gap: 8px; flex-shrink: 0; }
.btn {
  padding: 7px 16px; font-size: 12px; cursor: pointer; border: none; font-family: inherit;
  font-weight: 600; letter-spacing: 1px; transition: all 0.2s;
  background: #d4880f; color: #16161a;
}
.btn:hover { background: #e6a817; }
.btn.sec { background: transparent; border: 1px solid rgba(255,255,255,0.12); color: #999; }
.btn.sec:hover { border-color: #d4880f; color: #d4880f; }
.btn.ghost { background: transparent; border: none; color: #666; }
.btn.ghost:hover { color: #db4437; }

/* ===== 卡片 ===== */
.card { background: #1e1e24; border: 1px solid rgba(255,255,255,0.05); padding: 16px 24px; margin-bottom: 16px; box-sizing: border-box; }
.card-head { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.05); }
.card-head.tight { margin-bottom: 0; padding-bottom: 10px; }
.card-head-dot { width: 8px; height: 8px; flex-shrink: 0; background: #d4880f; }
.card-head-dot.live { background: #3cba54; animation: pulse 2s infinite; }
.card-head-dot.dc { background: #e6a817; }
.card-head-dot.ac { background: #2196F3; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
.card-head-title { font-size: 13px; font-weight: 700; color: #d4880f; letter-spacing: 2px; }
.mock-tag { margin-left: auto; font-size: 9px; padding: 2px 6px; background: rgba(255,255,255,0.04); color: #555; letter-spacing: 1px; }

/* ===== 信息网格 ===== */
.info-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px 20px; }
.info-f { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.info-l { font-size: 10px; color: #555; letter-spacing: 1px; }
.info-v { font-size: 12px; color: #c8c8c8; font-weight: 500; word-break: break-all; }
.info-v.link { color: #d4880f; cursor: pointer; }
.info-v.link:hover { color: #e6a817; }
.info-v.green { color: #3cba54; }

/* ===== 实时数据 ===== */
.realtime-row { display: flex; gap: 16px; }
.kpi-card { width: 380px; flex-shrink: 0; }
.kpi-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 16px; }
.kpi { padding: 10px 12px; background: rgba(255,255,255,0.015); border-left: 2px solid rgba(255,255,255,0.06); }
.kpi-body { display: flex; flex-direction: column; gap: 4px; }
.kpi-num { font-size: 22px; font-weight: 700; color: #e0e0e0; font-family: "Consolas", monospace; }
.kpi-num.warn { color: #e6a817; }
.kpi-num.ok { color: #3cba54; font-size: 16px; }
.kpi-label { font-size: 10px; color: #555; letter-spacing: 1px; }

/* ===== 表格 ===== */
.tables-col { flex: 1; display: flex; flex-direction: column; gap: 16px; min-width: 0; }
.table-card { padding: 0; overflow: hidden; }
.table-card .card-head { padding: 14px 20px 0; margin-bottom: 0; border-bottom: none; }
.tbl { font-size: 12px; font-family: "Consolas", monospace; }
.tbl-h { display: grid; grid-template-columns: 80px 100px 120px 1fr; padding: 8px 20px; background: rgba(255,255,255,0.02); border-bottom: 1px solid rgba(255,255,255,0.05); color: #555; font-size: 10px; font-weight: 700; letter-spacing: 2px; }
.tbl-body { max-height: 220px; overflow-y: auto; }
.tbl-r { display: grid; grid-template-columns: 80px 100px 120px 1fr; padding: 8px 20px; border-bottom: 1px solid rgba(255,255,255,0.02); color: #c8c8c8; transition: background 0.15s; }
.tbl-r:last-child { border-bottom: none; }
.tbl-r:hover { background: rgba(212,136,15,0.04); }
.tbl-r.warn { background: rgba(219,68,55,0.06); }
.c3 { display: flex; align-items: center; gap: 6px; }
.danger { color: #db4437; font-weight: 700; }
.low-chip { display: inline-flex; align-items: center; height: 16px; padding: 0 4px; font-size: 9px; border-radius: 1px; background: #db4437; color: #fff; font-weight: 700; letter-spacing: 1px; }
</style>
