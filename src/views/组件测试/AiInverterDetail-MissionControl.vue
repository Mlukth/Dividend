<template>
  <div class="mc-outer">
    <div class="mc-layout">
      <!-- 左侧逆变器面板 -->
      <aside class="mc-panel" :class="{ collapsed: isCollapsed }">
        <div v-if="!isCollapsed" class="panel-inner">
          <div class="panel-search">
            <el-input
              v-model="searchQuery"
              placeholder="搜索逆变器"
              size="small"
              clearable
              class="mc-search-input"
            >
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
          </div>
          <div v-if="inverterList.length === 0 && !listLoading" class="panel-empty">
            <el-empty description="暂无逆变器" :image-size="80" />
          </div>
          <el-menu
            v-else
            :default-active="currentInverter ? String(currentInverter.sn) : ''"
            class="mc-inverter-menu"
          >
            <el-menu-item
              v-for="inv in filteredInverters"
              :key="inv.sn"
              :index="String(inv.sn)"
              @click="selectInverter(inv)"
            >
              <span class="menu-row">
                <span class="menu-dot" :class="inv.status === 'running' ? 'live' : 'idle'"></span>
                <span class="menu-label">{{ inv.name }}</span>
              </span>
            </el-menu-item>
          </el-menu>
        </div>
      </aside>

      <!-- 折叠拉手 -->
      <button class="mc-toggle" @click="isCollapsed = !isCollapsed">
        <el-icon><ArrowLeft v-if="!isCollapsed" /><ArrowRight v-else /></el-icon>
      </button>

      <!-- 右侧主内容区 -->
      <main class="mc-main" v-if="currentInverter">
        <!-- 顶部标题栏 -->
        <header class="mc-header">
          <div class="header-start">
            <div class="header-icon-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="3" width="18" height="18" rx="3"/>
                <path d="M7 8h10M7 12h6M7 16h8"/>
              </svg>
            </div>
            <div class="header-titles">
              <h1 class="mc-title">{{ currentInverter.name }}</h1>
              <p class="mc-subtitle">
                <span>电站 {{ currentStation.id }}</span>
                <span class="sub-sep">·</span>
                <span>{{ currentInverter.updateTime }}</span>
              </p>
            </div>
          </div>
          <div class="header-actions">
            <button class="mc-btn primary" @click="handleControl">逆变器控制</button>
            <button class="mc-btn ghost" @click="handleCalibrate">校准电量</button>
            <button class="mc-btn ghost" @click="handleLog">操作日志</button>
            <button class="mc-btn ghost danger" @click="goBack">返回</button>
          </div>
        </header>

        <!-- 基础信息卡片 -->
        <section class="mc-card info-card">
          <div class="card-grid">
            <!-- 设备预览 -->
            <div class="device-col">
              <div class="device-frame">
                <svg viewBox="0 0 80 140" class="device-svg">
                  <rect x="2" y="2" width="76" height="136" rx="6" fill="none" stroke="currentColor" stroke-width="1" opacity="0.3"/>
                  <rect x="20" y="20" width="40" height="24" rx="3" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.2"/>
                  <line x1="28" y1="28" x2="52" y2="28" stroke="currentColor" stroke-width="0.8" opacity="0.15"/>
                  <line x1="28" y1="33" x2="46" y2="33" stroke="currentColor" stroke-width="0.8" opacity="0.15"/>
                  <line x1="28" y1="38" x2="50" y2="38" stroke="currentColor" stroke-width="0.8" opacity="0.15"/>
                  <circle cx="40" cy="90" r="18" fill="none" stroke="currentColor" stroke-width="1" opacity="0.3"/>
                  <circle cx="40" cy="90" r="10" fill="none" stroke="#00c6ff" stroke-width="1" opacity="0.6"/>
                  <circle cx="40" cy="90" r="4" fill="#00c6ff" opacity="0.4"/>
                  <line x1="40" y1="68" x2="40" y2="80" stroke="currentColor" stroke-width="0.8" opacity="0.2"/>
                  <line x1="40" y1="100" x2="40" y2="112" stroke="currentColor" stroke-width="0.8" opacity="0.2"/>
                  <line x1="18" y1="90" x2="30" y2="90" stroke="currentColor" stroke-width="0.8" opacity="0.2"/>
                  <line x1="50" y1="90" x2="62" y2="90" stroke="currentColor" stroke-width="0.8" opacity="0.2"/>
                </svg>
              </div>
              <div class="sn-line" @click="copySn">
                <code class="sn-code">{{ currentInverter.sn }}</code>
                <svg class="copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="8" y="2" width="14" height="18" rx="2"/><path d="M16 2v4H4v14"/></svg>
              </div>
            </div>
            <!-- 信息字段网格 -->
            <div class="fields-grid">
              <div class="field" v-for="f in infoFields" :key="f.label">
                <span class="field-label">{{ f.label }}</span>
                <span class="field-val" :class="{ link: f.link, green: f.green }">
                  {{ f.value }}
                  <svg v-if="f.link" class="link-arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 4h6v6M12 4L4 12"/></svg>
                </span>
              </div>
            </div>
          </div>
        </section>

        <!-- 实时数据 + 表格区域 -->
        <section class="bottom-zone">
          <!-- 实时KPI -->
          <div class="mc-card kpi-card">
            <h2 class="section-head">实时信息</h2>
            <div class="kpi-grid">
              <div class="kpi-cell" v-for="k in kpiItems" :key="k.label">
                <span class="kpi-label">{{ k.label }}</span>
                <span class="kpi-val" :class="k.css">{{ k.value }}</span>
              </div>
            </div>
          </div>

          <!-- 直流/交流表格 -->
          <div class="mc-card tables-card">
            <div class="table-block">
              <div class="table-head">
                <span class="th-name">直流侧 <em class="mock-badge">模拟</em></span>
                <span class="th-v">电压(V)</span>
                <span class="th-i">电流(A)</span>
                <span class="th-p">功率(W)</span>
              </div>
              <div class="table-rows">
                <div
                  v-for="(item, idx) in dcData"
                  :key="idx"
                  class="table-row"
                  :class="{ warn: isLowCurrent(item.current) }"
                >
                  <span class="td-name">{{ item.name }}</span>
                  <span class="td-v">{{ item.voltage }}</span>
                  <span class="td-i" :class="{ danger: isLowCurrent(item.current) }">
                    {{ item.current }}
                    <span v-if="isLowCurrent(item.current)" class="tag-danger">低电流</span>
                  </span>
                  <span class="td-p">{{ item.power }}</span>
                </div>
              </div>
            </div>
            <div class="table-block">
              <div class="table-head">
                <span class="th-name">交流侧 <em class="mock-badge">模拟</em></span>
                <span class="th-v">电压(V)</span>
                <span class="th-i">电流(A)</span>
                <span class="th-p">频率(Hz)</span>
              </div>
              <div class="table-rows">
                <div v-for="(item, idx) in acData" :key="idx" class="table-row">
                  <span class="td-name">{{ item.name }}</span>
                  <span class="td-v">{{ item.voltage }}</span>
                  <span class="td-i">{{ item.current }}</span>
                  <span class="td-p">{{ item.freq }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <!-- 空状态 -->
      <main class="mc-main empty" v-else>
        <el-empty description="请从左侧选择一个逆变器" :image-size="160" />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, ArrowRight, Search } from '@element-plus/icons-vue'
const route = useRoute()
const router = useRouter()

const isCollapsed = ref(false) // 默认展开以展示UI
const searchQuery = ref('')
const lowCurrentThreshold = ref(0.15)
const listLoading = ref(false)

const currentStation = ref({
  id: 'ST-2024-0018',
  name: '阳光工业园屋顶电站'
})

// Mock 数据 — 测试组件自带数据无需API
function mockInverters() {
  const snList = [
    { sn: 'INV-20240501-A001', name: '1号逆变器', state: 1 },
    { sn: 'INV-20240501-A002', name: '2号逆变器', state: 1 },
    { sn: 'INV-20240501-A003', name: '3号逆变器', state: 2 },
    { sn: 'INV-20240501-B001', name: '4号逆变器', state: 1 },
    { sn: 'INV-20240501-B002', name: '5号逆变器', state: 1 },
    { sn: 'INV-20240501-B003', name: '6号逆变器', state: 0 },
  ]
  return snList.map(inv => ({
    sn: inv.sn,
    name: inv.name,
    status: inv.state === 1 ? 'running' : 'stopped',
    model: 'Solis-110K-5G',
    type: '三相并网型',
    ratedPower: '110kW',
    warrantyStatus: '质保期内',
    warrantyExpire: '2029-06-15',
    standard: 'GB/T 30427-2013',
    version: 'V4.2.1.230915',
    afoVersion: 'AFO-3.1.0',
    g100Status: '已激活',
    afoScheme: '标准方案V2',
    remark: '正常运行，定期巡检',
    address: '江苏省南京市江宁区阳光科技园A区',
    realPower: (82 + Math.random() * 15).toFixed(1) + 'kW',
    dayEnergy: (420 + Math.random() * 80).toFixed(1) + 'kWh',
    dayHours: (3.2 + Math.random() * 1.5).toFixed(2) + 'h',
    monthEnergy: '12,846kWh',
    alarm: '--',
    yearEnergy: '148,520kWh',
    igbtTemp: (45 + Math.random() * 25).toFixed(1) + '℃',
    totalEnergy: '1,245,680kWh',
    updateTime: '2024-05-07 14:32:18',
    stationName: '阳光工业园屋顶电站'
  }))
}

const inverterList = ref([])
const currentInverter = ref(null)

const loadInverterList = () => {
  listLoading.value = true
  inverterList.value = mockInverters()
  currentStation.value.name = '阳光工业园屋顶电站'

  const target = inverterList.value[0]
  if (target) {
    currentInverter.value = { ...target }
  }
  listLoading.value = false
}

const filteredInverters = computed(() => {
  if (!searchQuery.value) return inverterList.value
  return inverterList.value.filter(inv => inv.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
})

const selectInverter = (inv) => {
  const stationId = route.params.stationId
  currentInverter.value = {
    ...inv,
    igbtTemp: (45 + Math.random() * 25).toFixed(1) + '℃'
  }
  router.push({ name: 'AiInverterDetail', params: { stationId, id: inv.sn } }).catch(() => {})
}

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

const isLowCurrent = (val) => val <= lowCurrentThreshold.value

const infoFields = computed(() => [
  { label: '型号', value: currentInverter.value.model },
  { label: '机型', value: currentInverter.value.type },
  { label: '额定功率', value: currentInverter.value.ratedPower },
  { label: '所属电站', value: currentStation.value.name, link: true },
  { label: '质保状态', value: currentInverter.value.warrantyStatus, green: true },
  { label: '质保到期', value: currentInverter.value.warrantyExpire },
  { label: '国家标准', value: currentInverter.value.standard, link: true },
  { label: '逆变器版本', value: currentInverter.value.version },
  { label: 'AFO版本', value: currentInverter.value.afoVersion },
  { label: 'G100运行状态', value: currentInverter.value.g100Status },
  { label: 'AFO方案', value: currentInverter.value.afoScheme },
  { label: '备注', value: currentInverter.value.remark },
  { label: '地址', value: currentInverter.value.address },
])

const kpiItems = computed(() => [
  { label: '实时功率', value: currentInverter.value.realPower },
  { label: '当日发电', value: currentInverter.value.dayEnergy },
  { label: '日满发小时数', value: currentInverter.value.dayHours },
  { label: '当月发电', value: currentInverter.value.monthEnergy },
  { label: '报警信息', value: currentInverter.value.alarm, css: currentInverter.value.alarm !== '--' ? 'ok' : '' },
  { label: '当年发电', value: currentInverter.value.yearEnergy },
  { label: 'IGBT温度', value: currentInverter.value.igbtTemp },
  { label: '累计发电', value: currentInverter.value.totalEnergy },
])

const copySn = () => {
  navigator.clipboard?.writeText(currentInverter.value.sn)
  ElMessage.success('SN已复制')
}

const goToStation = () => {
  router.push(`/ai-new/station/${currentStation.value.id}`).catch(() => {})
}

const goBack = () => {
  router.push(`/ai-new/station/${currentStation.value.id}`).catch(() => {})
}

const handleControl = () => ElMessage.info('逆变器控制功能')
const handleCalibrate = () => ElMessage.info('校准电量功能')
const handleLog = () => ElMessage.info('操作日志功能')

onMounted(loadInverterList)
</script>

<style scoped>
/* ── Design Tokens (scoped，挂载在组件根元素上) ── */
.mc-outer {
  --bg-deep: #060d1a;
  --bg-panel: rgba(255,255,255,0.015);
  --bg-card: rgba(255,255,255,0.02);
  --border-subtle: rgba(255,255,255,0.06);
  --border-active: rgba(0,198,255,0.3);
  --text-primary: #e8eaed;
  --text-secondary: rgba(255,255,255,0.55);
  --text-tertiary: rgba(255,255,255,0.35);
  --accent-cyan: #00c6ff;
  --accent-amber: #ff6b35;
  --status-live: #00e676;
  --status-danger: #ff3d4f;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 14px;
}

/* ── Outer Shell ── */
.mc-outer {
  width: 100%;
  height: calc(100vh - 60px);
  overflow: hidden;
}

.mc-layout {
  display: flex;
  width: 100%;
  height: 100%;
  background: #060d1a;
  background-image:
    linear-gradient(rgba(0,198,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,198,255,0.03) 1px, transparent 1px);
  background-size: 48px 48px;
  font-family: "Microsoft YaHei", "PingFang SC", system-ui, sans-serif;
  color: var(--text-primary);
  overflow: hidden;
}

/* ── Left Panel ── */
.mc-panel {
  width: 260px;
  background: rgba(255,255,255,0.015);
  border-right: 1px solid rgba(255,255,255,0.06);
  flex-shrink: 0;
  overflow: hidden;
  transition: width 0.3s ease;
  backdrop-filter: blur(4px);
}
.mc-panel.collapsed { width: 0; }
.panel-inner {
  width: 260px;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.panel-search { padding: 20px 16px 12px; }
.mc-search-input :deep(.el-input__wrapper) {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 6px;
  box-shadow: none;
}
.mc-search-input :deep(.el-input__inner) { color: #e8eaed; }
.mc-search-input :deep(.el-input__inner::placeholder) { color: rgba(255,255,255,0.3); }

.panel-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mc-inverter-menu {
  flex: 1;
  border: none;
  background: transparent;
  overflow-y: auto;
}
.mc-inverter-menu :deep(.el-menu-item) {
  background: transparent;
  color: rgba(255,255,255,0.6);
  height: 40px;
  line-height: 40px;
  padding: 0 16px;
  margin: 2px 8px;
  border-radius: 6px;
  transition: all 0.2s;
}
.mc-inverter-menu :deep(.el-menu-item:hover) {
  background: rgba(255,255,255,0.05);
  color: #e8eaed;
}
.mc-inverter-menu :deep(.el-menu-item.is-active) {
  background: rgba(0,198,255,0.1) !important;
  color: #00c6ff !important;
}

.menu-row { display: flex; align-items: center; gap: 10px; }
.menu-dot {
  width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
}
.menu-dot.live {
  background: #00e676;
  box-shadow: 0 0 6px rgba(0,230,118,0.5);
}
.menu-dot.idle {
  background: rgba(255,255,255,0.25);
}
.menu-label { font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* ── Toggle Handle ── */
.mc-toggle {
  width: 20px;
  height: 56px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-left: none;
  border-radius: 0 8px 8px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: rgba(255,255,255,0.4);
  flex-shrink: 0;
  align-self: center;
  transition: all 0.2s;
  padding: 0;
}
.mc-toggle:hover {
  background: rgba(0,198,255,0.1);
  color: #00c6ff;
}

/* ── Main Content ── */
.mc-main {
  flex: 1;
  padding: 24px 28px;
  overflow-y: auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.mc-main.empty {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ── Header ── */
.mc-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.header-start {
  display: flex;
  align-items: center;
  gap: 14px;
}
.header-icon-box {
  width: 42px; height: 42px;
  border: 2px solid rgba(255,255,255,0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00c6ff;
  flex-shrink: 0;
}
.header-icon-box svg { width: 20px; height: 20px; }
.mc-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.5px;
}
.mc-subtitle {
  margin: 4px 0 0;
  font-size: 13px;
  color: rgba(255,255,255,0.4);
  display: flex;
  gap: 6px;
}
.sub-sep { color: rgba(255,255,255,0.15); }

.header-actions { display: flex; gap: 8px; align-items: center; }

.mc-btn {
  height: 34px;
  padding: 0 16px;
  border-radius: 6px;
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s;
  font-weight: 500;
}
.mc-btn.primary {
  background: #00c6ff;
  color: #060d1a;
  border-color: #00c6ff;
}
.mc-btn.primary:hover {
  background: #33d4ff;
  box-shadow: 0 0 16px rgba(0,198,255,0.25);
}
.mc-btn.ghost {
  background: transparent;
  color: rgba(255,255,255,0.65);
  border-color: rgba(255,255,255,0.12);
}
.mc-btn.ghost:hover {
  background: rgba(255,255,255,0.06);
  color: #e8eaed;
  border-color: rgba(255,255,255,0.2);
}
.mc-btn.ghost.danger:hover {
  color: #ff3d4f;
  border-color: rgba(255,61,79,0.3);
  background: rgba(255,61,79,0.08);
}

/* ── Cards ── */
.mc-card {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: var(--radius-lg);
  padding: 22px 26px;
  position: relative;
  overflow: hidden;
}

/* scan-line texture on cards */
.mc-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(255,255,255,0.004) 2px,
    rgba(255,255,255,0.004) 4px
  );
  pointer-events: none;
  border-radius: inherit;
}

/* ── Info Card ── */
.card-grid {
  display: flex;
  gap: 32px;
}
.device-col {
  width: 130px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.device-frame {
  width: 100px;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255,255,255,0.3);
}
.device-svg { width: 80px; height: 140px; }
.sn-line {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 4px 10px;
  border-radius: 4px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  transition: border-color 0.2s;
}
.sn-line:hover { border-color: rgba(0,198,255,0.3); }
.sn-code {
  font-family: "Cascadia Code", "Fira Code", "JetBrains Mono", monospace;
  font-size: 11px;
  color: rgba(255,255,255,0.5);
}
.copy-icon {
  width: 14px; height: 14px;
  color: rgba(255,255,255,0.3);
  transition: color 0.2s;
}
.sn-line:hover .copy-icon { color: #00c6ff; }

.fields-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px 24px;
  align-content: start;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}
.field-label {
  font-size: 11px;
  color: rgba(255,255,255,0.35);
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
.field-val {
  font-size: 13px;
  color: rgba(255,255,255,0.8);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.field-val.link {
  color: #00c6ff;
  cursor: pointer;
}
.field-val.green { color: #00e676; }
.link-arrow { width: 12px; height: 12px; flex-shrink: 0; }

/* ── Bottom Zone ── */
.bottom-zone {
  display: flex;
  gap: 18px;
  flex: 1;
  min-height: 0;
}

/* ── KPI Card ── */
.kpi-card {
  width: 380px;
  flex-shrink: 0;
}
.section-head {
  margin: 0 0 22px;
  font-size: 13px;
  font-weight: 600;
  color: rgba(255,255,255,0.5);
  text-transform: uppercase;
  letter-spacing: 1.5px;
}
.kpi-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 22px 16px;
}
.kpi-cell {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.kpi-label {
  font-size: 12px;
  color: rgba(255,255,255,0.4);
}
.kpi-val {
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  font-variant-numeric: tabular-nums;
}
.kpi-val.ok { color: #00e676; }

/* ── Tables Card ── */
.tables-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 18px 22px;
}
.table-block {
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 8px;
  overflow: hidden;
}
.table-head {
  display: grid;
  grid-template-columns: 100px 120px 160px 1fr;
  padding: 10px 16px;
  background: rgba(255,255,255,0.03);
  border-bottom: 1px solid rgba(255,255,255,0.05);
  font-size: 11px;
  font-weight: 600;
  color: rgba(255,255,255,0.4);
  text-transform: uppercase;
  letter-spacing: 0.6px;
}
.mock-badge {
  font-style: normal;
  font-weight: 400;
  color: rgba(255,107,53,0.7);
  margin-left: 4px;
}
.table-rows {
  max-height: 220px;
  overflow-y: auto;
}
.table-row {
  display: grid;
  grid-template-columns: 100px 120px 160px 1fr;
  padding: 9px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.02);
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  transition: background 0.15s;
}
.table-row:last-child { border-bottom: none; }
.table-row:hover { background: rgba(255,255,255,0.02); }
.table-row.warn { background: rgba(255,61,79,0.06); }
.table-row.warn:hover { background: rgba(255,61,79,0.1); }

.td-name { color: rgba(255,255,255,0.7); }
.td-v, .td-p {
  color: rgba(255,255,255,0.6);
  font-family: "Cascadia Code", "Fira Code", "JetBrains Mono", monospace;
}
.td-i {
  color: rgba(255,255,255,0.6);
  font-family: "Cascadia Code", "Fira Code", "JetBrains Mono", monospace;
  display: flex;
  align-items: center;
  gap: 8px;
}
.td-i.danger { color: #ff3d4f; font-weight: 600; }

.tag-danger {
  display: inline-flex;
  align-items: center;
  height: 18px;
  padding: 0 6px;
  font-size: 10px;
  font-weight: 600;
  background: rgba(255,61,79,0.2);
  color: #ff3d4f;
  border: 1px solid rgba(255,61,79,0.3);
  border-radius: 3px;
  font-family: "Microsoft YaHei", sans-serif;
  letter-spacing: 0.5px;
}

/* ── Scrollbar ── */
.mc-main::-webkit-scrollbar,
.table-rows::-webkit-scrollbar,
.mc-inverter-menu::-webkit-scrollbar {
  width: 4px;
}
.mc-main::-webkit-scrollbar-track,
.table-rows::-webkit-scrollbar-track,
.mc-inverter-menu::-webkit-scrollbar-track {
  background: transparent;
}
.mc-main::-webkit-scrollbar-thumb,
.table-rows::-webkit-scrollbar-thumb,
.mc-inverter-menu::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.08);
  border-radius: 2px;
}

/* ── Element Plus overrides ── */
:deep(.el-empty__description) { color: rgba(255,255,255,0.3); }
:deep(.el-empty__image svg) { opacity: 0.3; }
</style>
