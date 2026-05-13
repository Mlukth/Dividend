<template>
  <div class="page">
    <div class="layout">
      <div class="left-panel" :class="{ collapsed: isCollapsed }">
        <div class="panel-inner">
          <div class="panel-top">
            <span class="panel-title">☀ 逆变器列表</span>
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
        <!-- Header — 能量条 -->
        <div class="hero">
          <div class="hero-glow"></div>
          <div class="hero-left">
            <div class="hero-title-row">
              <span class="hero-icon sun">
                <svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M512 128a384 384 0 1 0 0 768 384 384 0 0 0 0-768zM256 512a256 256 0 1 1 512 0 256 256 0 0 1-512 0zm256-320V64h64v128h-64zm0 768v-128h64v128h-64zm320-448h128v64H832v-64zm-768 0h128v64H64v-64z"/></svg>
              </span>
              <h1 class="hero-name">{{ cur.name }}</h1>
              <span class="hero-badge" :class="cur.status">{{ cur.status === 'running' ? '运行中' : '已停止' }}</span>
            </div>
            <div class="hero-meta">
              <span>{{ cur.model }}</span><i class="sep">·</i>
              <span>SN {{ cur.sn }}</span><i class="sep">·</i>
              <span>{{ station.name }}</span><i class="sep">·</i>
              <span>{{ cur.updateTime }}</span>
            </div>
          </div>
          <div class="hero-right">
            <button class="btn" @click="handleControl">设备控制</button>
            <button class="btn" @click="handleCalibrate">校准电量</button>
            <button class="btn" @click="handleLog">运行日志</button>
            <button class="btn dim" @click="goBack">返回</button>
          </div>
          <!-- 底部能量流动线 -->
          <div class="energy-line">
            <div class="energy-dot" v-for="i in 20" :key="i" :style="{ animationDelay: i * 0.12 + 's', left: (i - 1) * 5 + '%' }"></div>
          </div>
        </div>

        <!-- 基本信息卡片 -->
        <div class="card info-card">
          <div class="card-head">
            <span class="card-head-icon">
              <svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M224 160a64 64 0 0 0-64 64v576a64 64 0 0 0 64 64h576a64 64 0 0 0 64-64V224a64 64 0 0 0-64-64zm0-64h576a128 128 0 0 1 128 128v576a128 128 0 0 1-128 128H224A128 128 0 0 1 96 800V224A128 128 0 0 1 224 96"/></svg>
            </span>
            <span class="card-head-title">基本信息</span>
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
              <span class="card-head-icon pulse">
                <svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M416 896V128h192v768zm-288 0V448h192v448zm576 0V320h192v576z"/></svg>
              </span>
              <span class="card-head-title">实时数据</span>
              <span class="mock-tag">模拟</span>
            </div>
            <div class="kpi-grid">
              <div class="kpi" v-for="k in kpiItems" :key="k.label">
                <div class="kpi-glow" :class="{ warm: k.warn, safe: k.ok }"></div>
                <div class="kpi-num" :class="{ warn: k.warn, ok: k.ok }">{{ k.value }}</div>
                <div class="kpi-label">{{ k.label }}</div>
              </div>
            </div>
          </div>

          <div class="tables-col">
            <div class="card table-card">
              <div class="card-head tight">
                <span class="card-head-icon dc">
                  <svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M192 128v704h384V128zm-32-64h448a32 32 0 0 1 32 32v768a32 32 0 0 1-32 32H160a32 32 0 0 1-32-32V96a32 32 0 0 1 32-32"/></svg>
                </span>
                <span class="card-head-title">直流侧 DC Input</span>
                <span class="mock-tag">模拟</span>
              </div>
              <div class="tbl">
                <div class="tbl-h"><span>通道</span><span>电压(V)</span><span>电流(A)</span><span>功率(W)</span></div>
                <div class="tbl-body">
                  <div v-for="(r,i) in dcData" :key="i" class="tbl-r" :class="{ warn: isLowCurrent(r.current) }">
                    <span>{{ r.name }}</span><span>{{ r.voltage }}</span>
                    <span :class="{ danger: isLowCurrent(r.current) }">
                      {{ r.current }}
                      <span v-if="isLowCurrent(r.current)" class="low-chip">低电流</span>
                    </span>
                    <span>{{ r.power }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="card table-card">
              <div class="card-head tight">
                <span class="card-head-icon ac">
                  <svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M512 64 96 256v512l416 192 416-192V256zm0 768L160 704V320l352-160 352 160v384z"/></svg>
                </span>
                <span class="card-head-title">交流侧 AC Output</span>
                <span class="mock-tag">模拟</span>
              </div>
              <div class="tbl">
                <div class="tbl-h"><span>相线</span><span>电压(V)</span><span>电流(A)</span><span>频率(Hz)</span></div>
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
          <p class="empty-text">从左侧选择逆变器查看详情</p>
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
  { label: 'G100运行状态', value: cur.value.g100Status }, { label: 'AFO方案', value: cur.value.afoScheme },
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
  { label: '报警信息', value: cur.value.alarm === '--' ? '无报警' : cur.value.alarm, ok: cur.value.alarm === '--' },
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
/* ===== 能源流动风 ===== */
/*
  底: 深绿渐变 #0a1a10 → #0d2216
  日照金: #f5a623, 电流蓝: #2196F3, 生机绿: #4caf50
  关键视觉元素: 径向光晕, 能量流动线, moss质感
*/

.page { width: 100%; height: calc(100vh - 60px); overflow: hidden; font-family: "Microsoft YaHei", sans-serif; }
.layout { display: flex; width: 100%; height: 100%; background: #0a1a10; overflow: hidden; }

/* ===== 左面板 ===== */
.left-panel {
  width: 272px; flex-shrink: 0; overflow: hidden;
  background: linear-gradient(180deg, #0d2216 0%, #0a1a10 100%);
  border-right: 1px solid rgba(76,175,80,0.1);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.left-panel.collapsed { width: 0; border-right: none; }
.panel-inner { width: 272px; height: 100%; display: flex; flex-direction: column; color: #c8d6c0; }
.panel-top { display: flex; align-items: center; justify-content: space-between; padding: 20px 16px 8px; }
.panel-title { font-size: 15px; font-weight: 700; color: #f5a623; }
.panel-badge { font-size: 11px; padding: 2px 10px; border-radius: 10px; background: rgba(245,166,35,0.1); color: #d4981e; }
.search-wrap { padding: 12px 12px 8px; }
.search-wrap :deep(.el-input__wrapper) { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; box-shadow: none; }
.search-wrap :deep(.el-input__inner) { color: #c8d6c0; }
.search-wrap :deep(.el-input__inner::placeholder) { color: rgba(200,214,192,0.25); }

.inv-list { flex: 1; overflow-y: auto; padding: 4px 8px 12px; }
.inv-row { display: flex; align-items: center; gap: 10px; padding: 10px 12px; margin-bottom: 2px; border-radius: 8px; cursor: pointer; transition: all 0.2s; border: 1px solid transparent; }
.inv-row:hover { background: rgba(245,166,35,0.05); }
.inv-row.active { background: rgba(245,166,35,0.1); border-color: rgba(245,166,35,0.2); }
.dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.dot.running { background: #4caf50; box-shadow: 0 0 8px rgba(76,175,80,0.5); }
.dot.stopped { background: #555; }
.inv-text { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.inv-name { font-size: 13px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.inv-sn { font-size: 11px; color: rgba(200,214,192,0.4); margin-top: 1px; }
.inv-tag { font-size: 10px; padding: 2px 8px; border-radius: 8px; flex-shrink: 0; font-weight: 500; }
.inv-tag.running { background: rgba(76,175,80,0.15); color: #4caf50; }
.inv-tag.stopped { background: rgba(255,255,255,0.04); color: rgba(200,214,192,0.3); }

/* ===== 折叠手柄 ===== */
.handle {
  width: 22px; height: 56px; flex-shrink: 0; align-self: center;
  background: #0d2216; border: 1px solid rgba(76,175,80,0.1); border-left: none;
  border-radius: 0 8px 8px 0; display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: rgba(200,214,192,0.4); transition: all 0.2s; z-index: 2;
}
.handle:hover { background: rgba(245,166,35,0.1); color: #f5a623; }
.handle svg { width: 14px; height: 14px; transition: transform 0.25s; }

/* ===== 主内容区 ===== */
.main { flex: 1; padding: 20px 24px; overflow-y: auto; min-width: 0; }
.empty-main { display: flex; align-items: center; justify-content: center; }
.empty-box { text-align: center; }
.empty-dot { display: block; width: 32px; height: 32px; border-radius: 50%; background: radial-gradient(circle, rgba(245,166,35,0.4), transparent 70%); margin: 0 auto 16px; }
.empty-text { font-size: 14px; color: rgba(200,214,192,0.3); }

/* ===== Header — 能量辐照区 ===== */
.hero {
  position: relative; overflow: hidden;
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: 24px 28px; margin-bottom: 16px; border-radius: 12px;
  background: linear-gradient(135deg, #0d2216 0%, #132d1a 50%, #0d2216 100%);
  border: 1px solid rgba(76,175,80,0.1);
  color: #c8d6c0;
}
.hero-glow {
  position: absolute; top: -80px; right: -40px;
  width: 240px; height: 240px; border-radius: 50%;
  background: radial-gradient(circle, rgba(245,166,35,0.12) 0%, transparent 70%);
  pointer-events: none;
}
.hero-left { display: flex; flex-direction: column; gap: 10px; position: relative; z-index: 1; }
.hero-title-row { display: flex; align-items: center; gap: 12px; }
.hero-icon {
  width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;
  background: radial-gradient(circle, rgba(245,166,35,0.25), transparent 70%);
  border: 1px solid rgba(245,166,35,0.3); color: #f5a623;
  display: flex; align-items: center; justify-content: center;
}
.hero-icon svg { width: 18px; height: 18px; }
.hero-icon.sun { animation: sunGlow 3s ease-in-out infinite; }
@keyframes sunGlow { 0%,100%{ box-shadow: 0 0 8px rgba(245,166,35,0.2) } 50%{ box-shadow: 0 0 20px rgba(245,166,35,0.4) } }
.hero-name { margin: 0; font-size: 22px; font-weight: 700; }
.hero-badge { font-size: 11px; padding: 3px 12px; border-radius: 10px; font-weight: 500; }
.hero-badge.running { background: rgba(76,175,80,0.15); color: #4caf50; }
.hero-badge.stopped { background: rgba(255,255,255,0.04); color: rgba(200,214,192,0.3); }
.hero-meta { font-size: 12px; color: rgba(200,214,192,0.5); display: flex; align-items: center; gap: 6px; }
.sep { color: rgba(255,255,255,0.08); }
.hero-right { display: flex; gap: 8px; flex-shrink: 0; position: relative; z-index: 1; }
.btn {
  padding: 7px 18px; border-radius: 20px; font-size: 12px; cursor: pointer; border: none;
  font-family: inherit; font-weight: 500; transition: all 0.2s;
  background: linear-gradient(135deg, #f5a623, #e8961a); color: #0a1a10;
}
.btn:hover { box-shadow: 0 0 16px rgba(245,166,35,0.3); }
.btn:nth-child(2), .btn:nth-child(3) {
  background: transparent; border: 1px solid rgba(245,166,35,0.2); color: rgba(245,166,35,0.8);
}
.btn:nth-child(2):hover, .btn:nth-child(3):hover { border-color: rgba(245,166,35,0.5); background: rgba(245,166,35,0.05); }
.btn.dim { background: transparent; border: none; color: rgba(200,214,192,0.4); }
.btn.dim:hover { color: #4caf50; }

/* 能量流动线 */
.energy-line {
  position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent, rgba(245,166,35,0.1) 20%, rgba(33,150,243,0.15) 50%, rgba(245,166,35,0.1) 80%, transparent);
}
.energy-dot {
  position: absolute; top: -2px; width: 4px; height: 6px; border-radius: 1px;
  background: #f5a623; opacity: 0; animation: flow 2.5s linear infinite;
}
@keyframes flow { 0%{ opacity:0; transform:translateX(0) } 10%{ opacity:0.8 } 90%{ opacity:0.8 } 100%{ opacity:0; transform:translateX(20px) } }

/* ===== 卡片 ===== */
.card { background: rgba(13,34,22,0.6); border: 1px solid rgba(76,175,80,0.08); border-radius: 12px; padding: 16px 24px; margin-bottom: 16px; box-sizing: border-box; backdrop-filter: blur(4px); }
.card-head { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid rgba(76,175,80,0.06); }
.card-head.tight { margin-bottom: 0; padding-bottom: 10px; }
.card-head-icon {
  width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  color: #f5a623;
}
.card-head-icon svg { width: 16px; height: 16px; }
.card-head-icon.pulse { color: #4caf50; animation: pulseIcon 2s ease-in-out infinite; }
.card-head-icon.dc { color: #f5a623; }
.card-head-icon.ac { color: #2196F3; }
@keyframes pulseIcon { 0%,100%{ box-shadow: 0 0 0 rgba(76,175,80,0) } 50%{ box-shadow: 0 0 12px rgba(76,175,80,0.3) } }
.card-head-title { font-size: 14px; font-weight: 600; color: #d4e4c8; }
.mock-tag { margin-left: auto; font-size: 10px; padding: 2px 8px; border-radius: 8px; background: rgba(245,166,35,0.08); color: rgba(245,166,35,0.5); }

/* ===== 信息网格 ===== */
.info-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px 24px; }
.info-f { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.info-l { font-size: 11px; color: rgba(200,214,192,0.4); }
.info-v { font-size: 13px; color: #c8d6c0; font-weight: 500; word-break: break-all; }
.info-v.link { color: #f5a623; cursor: pointer; }
.info-v.link:hover { color: #ffb940; }
.info-v.green { color: #4caf50; }

/* ===== 实时数据 KPI ===== */
.realtime-row { display: flex; gap: 16px; }
.kpi-card { width: 400px; flex-shrink: 0; }
.kpi-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 16px; }
.kpi {
  position: relative; padding: 14px 16px; border-radius: 10px;
  background: rgba(255,255,255,0.015); border: 1px solid rgba(255,255,255,0.03);
  overflow: hidden;
}
.kpi-glow {
  position: absolute; top: -20px; right: -20px; width: 80px; height: 80px; border-radius: 50%;
  background: radial-gradient(circle, rgba(245,166,35,0.06) 0%, transparent 70%);
  pointer-events: none;
}
.kpi-glow.warm { background: radial-gradient(circle, rgba(255,138,0,0.08) 0%, transparent 70%); }
.kpi-glow.safe { background: radial-gradient(circle, rgba(76,175,80,0.08) 0%, transparent 70%); }
.kpi-num { font-size: 22px; font-weight: 700; color: #d4e4c8; position: relative; z-index: 1; }
.kpi-num.warn { color: #ff8a00; }
.kpi-num.ok { color: #4caf50; }
.kpi-label { font-size: 11px; color: rgba(200,214,192,0.4); margin-top: 2px; position: relative; z-index: 1; }

/* ===== 表格 ===== */
.tables-col { flex: 1; display: flex; flex-direction: column; gap: 16px; min-width: 0; }
.table-card { padding: 0; overflow: hidden; }
.table-card .card-head { padding: 14px 20px 0; margin-bottom: 0; border-bottom: none; }
.tbl { font-size: 12px; }
.tbl-h { display: grid; grid-template-columns: 100px 120px 140px 1fr; padding: 10px 20px; background: rgba(255,255,255,0.015); border-bottom: 1px solid rgba(76,175,80,0.06); color: rgba(200,214,192,0.4); font-size: 11px; font-weight: 600; }
.tbl-body { max-height: 230px; overflow-y: auto; }
.tbl-r { display: grid; grid-template-columns: 100px 120px 140px 1fr; padding: 10px 20px; border-bottom: 1px solid rgba(255,255,255,0.015); color: #c8d6c0; transition: background 0.2s; }
.tbl-r:last-child { border-bottom: none; }
.tbl-r:hover { background: rgba(245,166,35,0.03); }
.tbl-r.warn { background: rgba(255,82,82,0.06); }
.tbl-r.warn:hover { background: rgba(255,82,82,0.1); }
.danger { color: #ff5252; font-weight: 600; }
.low-chip { display: inline-flex; align-items: center; height: 18px; padding: 0 6px; font-size: 10px; border-radius: 4px; background: #ff5252; color: #fff; font-weight: 500; }
</style>
