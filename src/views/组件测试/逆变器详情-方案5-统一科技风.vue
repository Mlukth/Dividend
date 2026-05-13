<template>
  <div class="page">
    <div class="layout">
      <!-- 左侧面板：深蓝科技风 -->
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
            <div
              v-for="inv in filteredInverters" :key="inv.sn"
              class="inv-row" :class="{ active: cur && cur.sn === inv.sn }"
              @click="selectInverter(inv)"
            >
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

      <!-- 折叠手柄 -->
      <div class="handle" @click="isCollapsed = !isCollapsed">
        <svg viewBox="0 0 1024 1024" :style="{ transform: isCollapsed ? 'rotate(180deg)' : '' }"><path fill="currentColor" d="M340.864 149.312a30.59 30.59 0 0 0 0 42.752L652.736 512 340.864 831.872a30.59 30.59 0 0 0 0 42.752 29.12 29.12 0 0 0 41.728 0L714.24 534.336a32 32 0 0 0 0-44.672L382.592 149.376a29.12 29.12 0 0 0-41.728 0z"/></svg>
      </div>

      <!-- 右侧内容 -->
      <div class="main" v-if="cur">
        <!-- Header：深蓝科技风条 -->
        <div class="hero">
          <div class="hero-left">
            <div class="hero-title-row">
              <span class="hero-icon">
                <svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M288 671.36v64.128A239.81 239.81 0 0 1 63.744 496.192a240.32 240.32 0 0 1 199.488-236.8 256.128 256.128 0 0 1 487.872-30.976A256.064 256.064 0 0 1 736 734.016v-64.768a192 192 0 0 0 3.328-377.92l-35.2-6.592-12.8-33.408a192.064 192.064 0 0 0-365.952 23.232l-9.92 40.896-41.472 7.04a176.32 176.32 0 0 0-146.24 173.568c0 91.968 70.464 167.36 160.256 175.232z"/><path fill="currentColor" d="M416 736a32 32 0 0 1-27.776-47.872l128-224a32 32 0 1 1 55.552 31.744L471.168 672H608a32 32 0 0 1 27.776 47.872l-128 224a32 32 0 1 1-55.68-31.744L552.96 736z"/></svg>
              </span>
              <h1 class="hero-name">{{ cur.name }}</h1>
              <span class="hero-badge" :class="cur.status">{{ cur.status === 'running' ? '运行中' : '已停止' }}</span>
            </div>
            <div class="hero-meta">
              <span>SN: {{ cur.sn }}</span><i class="sep">|</i>
              <span>型号: {{ cur.model }}</span><i class="sep">|</i>
              <span>电站: {{ station.name }}</span><i class="sep">|</i>
              <span>{{ cur.updateTime }}</span>
            </div>
          </div>
          <div class="hero-right">
            <button class="btn" @click="handleControl">逆变器控制</button>
            <button class="btn outline" @click="handleCalibrate">校准电量</button>
            <button class="btn outline" @click="handleLog">操作日志</button>
            <button class="btn text" @click="goBack">返回</button>
          </div>
        </div>

        <!-- 基本信息卡片 -->
        <div class="card info-card">
          <div class="card-head">
            <span class="card-head-icon blue">
              <svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M224 160a64 64 0 0 0-64 64v576a64 64 0 0 0 64 64h576a64 64 0 0 0 64-64V224a64 64 0 0 0-64-64zm0-64h576a128 128 0 0 1 128 128v576a128 128 0 0 1-128 128H224A128 128 0 0 1 96 800V224A128 128 0 0 1 224 96"/><path fill="currentColor" d="M384 416a64 64 0 1 0 0-128 64 64 0 0 0 0 128m0 64a128 128 0 1 1 0-256 128 128 0 0 1 0 256"/><path fill="currentColor" d="M480 320h256q32 0 32 32t-32 32H480q-32 0-32-32t32-32m160 416a64 64 0 1 0 0-128 64 64 0 0 0 0 128m0 64a128 128 0 1 1 0-256 128 128 0 0 1 0 256"/><path fill="currentColor" d="M288 640h256q32 0 32 32t-32 32H288q-32 0-32-32t32-32"/></svg>
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

        <!-- 实时数据 + 直流/交流表格 -->
        <div class="realtime-row">
          <!-- KPI卡片 -->
          <div class="card kpi-card">
            <div class="card-head">
              <span class="card-head-icon green">
                <svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M416 896V128h192v768zm-288 0V448h192v448zm576 0V320h192v576z"/></svg>
              </span>
              <span class="card-head-title">实时信息</span>
              <span class="mock-tag">模拟</span>
            </div>
            <div class="kpi-grid">
              <div class="kpi">
                <div class="kpi-icon-wrap blue">
                  <svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"/></svg>
                </div>
                <div class="kpi-body">
                  <div class="kpi-num">{{ cur.realPower }}</div>
                  <div class="kpi-label">实时功率</div>
                </div>
              </div>
              <div class="kpi">
                <div class="kpi-icon-wrap orange">
                  <svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M512 128a384 384 0 1 0 0 768 384 384 0 0 0 0-768zm0 64a320 320 0 1 1 0 640 320 320 0 0 1 0-640zm-32 96v224l160 96 32-53-128-77V288h-32z"/></svg>
                </div>
                <div class="kpi-body">
                  <div class="kpi-num">{{ cur.igbtTemp }}</div>
                  <div class="kpi-label">IGBT温度</div>
                </div>
              </div>
              <div class="kpi">
                <div class="kpi-icon-wrap green">
                  <svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z m46-334c-57.4 0-104-46.6-104-104s46.6-104 104-104 104 46.6 104 104-46.6 104-104 104z"/></svg>
                </div>
                <div class="kpi-body">
                  <div class="kpi-num">{{ cur.dayEnergy }}</div>
                  <div class="kpi-label">当日发电</div>
                </div>
              </div>
              <div class="kpi">
                <div class="kpi-icon-wrap blue">
                  <svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M256 640v192h640V384H768v-64h150.976c14.272 0 19.456 1.472 24.64 4.288a29.06 29.06 0 0 1 12.16 12.096c2.752 5.184 4.224 10.368 4.224 24.64v493.952c0 14.272-1.472 19.456-4.288 24.64a29.06 29.06 0 0 1-12.096 12.16c-5.184 2.752-10.368 4.224-24.64 4.224H233.024c-14.272 0-19.456-1.472-24.64-4.288a29.06 29.06 0 0 1-12.16-12.096c-2.688-5.184-4.224-10.368-4.224-24.576V640z"/><path fill="currentColor" d="M768 192H128v448h640zm64-22.976v493.952c0 14.272-1.472 19.456-4.288 24.64a29.06 29.06 0 0 1-12.096 12.16c-5.184 2.752-10.368 4.224-24.64 4.224H105.024c-14.272 0-19.456-1.472-24.64-4.288a29.06 29.06 0 0 1-12.16-12.096C65.536 682.432 64 677.248 64 663.04V169.024c0-14.272 1.472-19.456 4.288-24.64a29.06 29.06 0 0 1 12.096-12.16C85.568 129.536 90.752 128 104.96 128h685.952c14.272 0 19.456 1.472 24.64 4.288a29.06 29.06 0 0 1 12.16 12.096c2.752 5.184 4.224 10.368 4.224 24.64z"/><path fill="currentColor" d="M448 576a160 160 0 1 1 0-320 160 160 0 0 1 0 320m0-64a96 96 0 1 0 0-192 96 96 0 0 0 0 192"/></svg>
                </div>
                <div class="kpi-body">
                  <div class="kpi-num">{{ cur.dayHours }}</div>
                  <div class="kpi-label">日满发小时</div>
                </div>
              </div>
              <div class="kpi">
                <div class="kpi-icon-wrap green">
                  <svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M128 512h64l128-192 160 256 128-160 128 96h128v-64H736l-128-96-128 160-160-256L192 576H128v-64z"/></svg>
                </div>
                <div class="kpi-body">
                  <div class="kpi-num">{{ cur.monthEnergy }}</div>
                  <div class="kpi-label">当月发电</div>
                </div>
              </div>
              <div class="kpi">
                <div class="kpi-icon-wrap blue">
                  <svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M512 128c-212.1 0-384 171.9-384 384s171.9 384 384 384 384-171.9 384-384-171.9-384-384-384z m0 640c-141.4 0-256-114.6-256-256s114.6-256 256-256 256 114.6 256 256-114.6 256-256 256z m-32-384h64v256h-64z m0 320h64v64h-64z"/></svg>
                </div>
                <div class="kpi-body">
                  <div class="kpi-num">{{ cur.yearEnergy }}</div>
                  <div class="kpi-label">当年发电</div>
                </div>
              </div>
              <div class="kpi">
                <div class="kpi-icon-wrap blue">
                  <svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"/></svg>
                </div>
                <div class="kpi-body">
                  <div class="kpi-num total">{{ cur.totalEnergy }}</div>
                  <div class="kpi-label">累计发电</div>
                </div>
              </div>
              <div class="kpi alert-kpi">
                <div class="kpi-icon-wrap" :class="cur.alarm === '--' ? 'green' : 'red'">
                  <svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M256 192h512v640H256V192zm32 32v576h448V224H288zm128 96h192v64H416v-64zm0 128h192v64H416v-64zm0 128h192v64H416v-64z"/></svg>
                </div>
                <div class="kpi-body">
                  <div class="kpi-num" :class="{ ok: cur.alarm === '--' }">{{ cur.alarm === '--' ? '无报警' : cur.alarm }}</div>
                  <div class="kpi-label">报警信息</div>
                </div>
              </div>
            </div>
          </div>

          <!-- DC + AC 表格 -->
          <div class="tables-col">
            <div class="card table-card">
              <div class="card-head tight">
                <span class="card-head-title">直流侧参数</span>
                <span class="mock-tag">模拟</span>
              </div>
              <div class="tbl">
                <div class="tbl-h">
                  <span class="c1">通道</span><span class="c2">电压(V)</span><span class="c3">电流(A)</span><span class="c4">功率(W)</span>
                </div>
                <div class="tbl-body">
                  <div v-for="(r,i) in dcData" :key="i" class="tbl-r" :class="{ warn: isLowCurrent(r.current) }">
                    <span class="c1">{{ r.name }}</span>
                    <span class="c2">{{ r.voltage }}</span>
                    <span class="c3" :class="{ danger: isLowCurrent(r.current) }">
                      {{ r.current }}
                      <span v-if="isLowCurrent(r.current)" class="low-chip">低电流</span>
                    </span>
                    <span class="c4">{{ r.power }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="card table-card">
              <div class="card-head tight">
                <span class="card-head-title">交流侧参数</span>
                <span class="mock-tag">模拟</span>
              </div>
              <div class="tbl">
                <div class="tbl-h">
                  <span class="c1">相线</span><span class="c2">电压(V)</span><span class="c3">电流(A)</span><span class="c4">频率(Hz)</span>
                </div>
                <div class="tbl-body">
                  <div v-for="(r,i) in acData" :key="i" class="tbl-r">
                    <span class="c1">{{ r.name }}</span><span class="c2">{{ r.voltage }}</span><span class="c3">{{ r.current }}</span><span class="c4">{{ r.freq }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="main empty-main">
        <div class="empty-box">
          <span class="empty-icon">
            <svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M224 160a64 64 0 0 0-64 64v576a64 64 0 0 0 64 64h576a64 64 0 0 0 64-64V224a64 64 0 0 0-64-64zm0-64h576a128 128 0 0 1 128 128v576a128 128 0 0 1-128 128H224A128 128 0 0 1 96 800V224A128 128 0 0 1 224 96"/></svg>
          </span>
          <p class="empty-text">请从左侧选择一台逆变器</p>
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
  { sn: 'INV-2024-A001', name: '1号逆变器', status: 'running', model: 'Solis-250K-EHV-5G', type: '组串式', ratedPower: '250kW', warrantyStatus: '正常', warrantyExpire: '2028-06-15', standard: 'GB/T 19964-2024', version: 'V3.2.1', afoVersion: 'V1.0.3', g100Status: '正常', afoScheme: '方案B', remark: '--', address: '青海省海西州格尔木市', realPower: '186.5kW', dayEnergy: '1,250kWh', dayHours: '5.2h', monthEnergy: '28,300kWh', yearEnergy: '156,800kWh', totalEnergy: '1,280,000kWh', alarm: '--', igbtTemp: '58.3℃', updateTime: '2026-05-06 14:32:10' },
  { sn: 'INV-2024-A002', name: '2号逆变器', status: 'running', model: 'Solis-250K-EHV-5G', type: '组串式', ratedPower: '250kW', warrantyStatus: '正常', warrantyExpire: '2028-06-15', standard: 'GB/T 19964-2024', version: 'V3.2.1', afoVersion: 'V1.0.3', g100Status: '正常', afoScheme: '方案B', remark: '例行维护中', address: '青海省海西州格尔木市', realPower: '192.1kW', dayEnergy: '1,310kWh', dayHours: '5.5h', monthEnergy: '29,100kWh', yearEnergy: '162,300kWh', totalEnergy: '1,310,000kWh', alarm: '--', igbtTemp: '62.1℃', updateTime: '2026-05-06 14:32:05' },
  { sn: 'INV-2024-A003', name: '3号逆变器', status: 'running', model: 'Solis-250K-EHV-5G', type: '组串式', ratedPower: '250kW', warrantyStatus: '即将到期', warrantyExpire: '2026-08-20', standard: 'GB/T 19964-2024', version: 'V3.2.0', afoVersion: 'V1.0.2', g100Status: '正常', afoScheme: '方案A', remark: '--', address: '青海省海西州格尔木市', realPower: '175.4kW', dayEnergy: '1,180kWh', dayHours: '4.9h', monthEnergy: '26,500kWh', yearEnergy: '148,200kWh', totalEnergy: '1,180,000kWh', alarm: '--', igbtTemp: '55.7℃', updateTime: '2026-05-06 14:31:58' },
  { sn: 'INV-2024-A004', name: '4号逆变器', status: 'stopped', model: 'Solis-250K-EHV-5G', type: '组串式', ratedPower: '250kW', warrantyStatus: '正常', warrantyExpire: '2028-09-10', standard: 'GB/T 19964-2024', version: 'V3.2.1', afoVersion: 'V1.0.3', g100Status: '异常', afoScheme: '方案B', remark: '待检修', address: '青海省海西州格尔木市', realPower: '0kW', dayEnergy: '0kWh', dayHours: '0h', monthEnergy: '12,500kWh', yearEnergy: '98,400kWh', totalEnergy: '960,000kWh', alarm: '离线', igbtTemp: '32.1℃', updateTime: '2026-05-06 08:15:30' },
  { sn: 'INV-2024-A005', name: '5号逆变器', status: 'running', model: 'Solis-250K-EHV-5G', type: '组串式', ratedPower: '250kW', warrantyStatus: '正常', warrantyExpire: '2028-11-05', standard: 'GB/T 19964-2024', version: 'V3.2.1', afoVersion: 'V1.0.4', g100Status: '正常', afoScheme: '方案C', remark: '--', address: '青海省海西州格尔木市', realPower: '200.8kW', dayEnergy: '1,390kWh', dayHours: '5.8h', monthEnergy: '31,200kWh', yearEnergy: '170,500kWh', totalEnergy: '1,420,000kWh', alarm: '--', igbtTemp: '60.5℃', updateTime: '2026-05-06 14:32:15' }
])

const filteredInverters = computed(() => {
  if (!searchQuery.value) return inverterList.value
  const q = searchQuery.value.toLowerCase()
  return inverterList.value.filter(i => i.name.includes(q) || i.sn.toLowerCase().includes(q))
})

const infoFields = computed(() => {
  if (!cur.value) return []
  return [
    { label: '型号', value: cur.value.model },
    { label: '机型', value: cur.value.type },
    { label: '额定功率', value: cur.value.ratedPower },
    { label: '所属电站', value: station.value.name, link: true },
    { label: '质保状态', value: cur.value.warrantyStatus, green: cur.value.warrantyStatus === '正常' },
    { label: '质保到期', value: cur.value.warrantyExpire },
    { label: '国家标准', value: cur.value.standard, link: true },
    { label: '逆变器版本', value: cur.value.version },
    { label: 'AFO版本', value: cur.value.afoVersion },
    { label: 'G100运行状态', value: cur.value.g100Status },
    { label: 'AFO方案', value: cur.value.afoScheme },
    { label: '备注', value: cur.value.remark },
    { label: '地址', value: cur.value.address },
    { label: 'SN', value: cur.value.sn },
    { label: '更新时间', value: cur.value.updateTime },
  ]
})

const selectInverter = (inv) => {
  cur.value = { ...inv, igbtTemp: (45 + Math.random() * 25).toFixed(1) + '℃' }
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

const isLowCurrent = (v) => v <= 0.15
const goBack = () => ElMessage.info('返回上一页')
const handleControl = () => ElMessage.info('逆变器控制')
const handleCalibrate = () => ElMessage.info('校准电量')
const handleLog = () => ElMessage.info('操作日志')

onMounted(() => { cur.value = { ...inverterList.value[0], igbtTemp: (45 + Math.random() * 25).toFixed(1) + '℃' } })
</script>

<style scoped>
/* ===== 设计令牌：统一继承 StationOverview 的视觉系统 ===== */
.page {
  width: 100%; height: calc(100vh - 60px); overflow: hidden;
  font-family: "Microsoft YaHei", sans-serif;
}
.layout {
  display: flex; width: 100%; height: 100%;
  background: #f0f2f5; overflow: hidden;
}

/* ===== 左侧面板：深蓝科技风 ===== */
.left-panel {
  width: 272px; flex-shrink: 0; overflow: hidden;
  background: #0a2a60;
  background-image: linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
  background-size: 40px 40px;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.left-panel.collapsed { width: 0; }
.panel-inner { width: 272px; height: 100%; display: flex; flex-direction: column; color: #fff; }
.panel-top {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 16px 8px;
}
.panel-title { font-size: 16px; font-weight: 700; }
.panel-badge {
  font-size: 11px; padding: 2px 10px; border-radius: 10px;
  background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.7);
}
.search-wrap { padding: 12px 12px 8px; }
.search-wrap :deep(.el-input__wrapper) {
  background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12);
  border-radius: 8px; box-shadow: none;
}
.search-wrap :deep(.el-input__inner) { color: #fff; }
.search-wrap :deep(.el-input__inner::placeholder) { color: rgba(255,255,255,0.35); }

.inv-list { flex: 1; overflow-y: auto; padding: 4px 8px 12px; }
.inv-row {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; margin-bottom: 2px; border-radius: 8px;
  cursor: pointer; transition: background 0.2s;
  border: 1px solid transparent;
}
.inv-row:hover { background: rgba(255,255,255,0.06); }
.inv-row.active {
  background: rgba(24,144,255,0.15); border-color: rgba(24,144,255,0.3);
}
.dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.dot.running { background: #67c23a; box-shadow: 0 0 6px rgba(103,194,58,0.5); }
.dot.stopped { background: #909399; }
.inv-text { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.inv-name { font-size: 13px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.inv-sn { font-size: 11px; color: rgba(255,255,255,0.5); margin-top: 1px; }
.inv-tag {
  font-size: 10px; padding: 2px 8px; border-radius: 8px; flex-shrink: 0; font-weight: 500;
}
.inv-tag.running { background: rgba(103,194,58,0.2); color: #67c23a; }
.inv-tag.stopped { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.5); }

/* ===== 折叠手柄 ===== */
.handle {
  width: 22px; height: 56px; flex-shrink: 0; align-self: center;
  background: #fff; border: 1px solid #e4e7ed; border-left: none;
  border-radius: 0 8px 8px 0; display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: #606266; transition: all 0.2s; z-index: 2;
}
.handle:hover { background: #ecf5ff; color: #409eff; border-color: #c6e2ff; }
.handle svg { width: 14px; height: 14px; transition: transform 0.25s; }

/* ===== 主内容区 ===== */
.main { flex: 1; padding: 20px 24px; overflow-y: auto; min-width: 0; }
.empty-main { display: flex; align-items: center; justify-content: center; }
.empty-box { text-align: center; }
.empty-icon {
  display: flex; align-items: center; justify-content: center;
  width: 80px; height: 80px; margin: 0 auto 16px; border-radius: 50%;
  background: #e8eaed; color: #999;
}
.empty-icon svg { width: 36px; height: 36px; }
.empty-text { font-size: 14px; color: #999; }

/* ===== Header 深蓝条 ===== */
.hero {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: 20px 24px; margin-bottom: 16px; border-radius: 12px;
  background: #0a2a60;
  background-image: linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
  background-size: 50px 50px;
  color: #fff;
}
.hero-left { display: flex; flex-direction: column; gap: 10px; }
.hero-title-row { display: flex; align-items: center; gap: 10px; }
.hero-icon {
  width: 38px; height: 38px; border-radius: 50%; flex-shrink: 0;
  border: 2px solid rgba(255,255,255,0.3); color: #1890ff;
  display: flex; align-items: center; justify-content: center;
}
.hero-icon svg { width: 18px; height: 18px; }
.hero-name { margin: 0; font-size: 20px; font-weight: 600; }
.hero-badge {
  font-size: 12px; padding: 2px 10px; border-radius: 10px; font-weight: 500;
}
.hero-badge.running { background: rgba(103,194,58,0.2); color: #67c23a; }
.hero-badge.stopped { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.6); }
.hero-meta { font-size: 12px; color: rgba(255,255,255,0.6); display: flex; align-items: center; gap: 6px; }
.sep { color: rgba(255,255,255,0.2); font-style: normal; }
.hero-right { display: flex; gap: 8px; flex-shrink: 0; }
.btn {
  padding: 7px 18px; border-radius: 8px; font-size: 13px; cursor: pointer;
  border: none; font-family: inherit; font-weight: 500; transition: all 0.2s;
  background: linear-gradient(90deg, #0052D9, #165DFF); color: #fff;
}
.btn:hover { opacity: 0.9; }
.btn.outline {
  background: transparent; border: 1px solid rgba(255,255,255,0.25); color: rgba(255,255,255,0.85);
}
.btn.outline:hover { border-color: rgba(255,255,255,0.5); background: rgba(255,255,255,0.05); }
.btn.text { background: transparent; border: none; color: rgba(255,255,255,0.7); }
.btn.text:hover { color: #f56c6c; }

/* ===== 白色卡片（统一 StationOverview 卡片风格） ===== */
.card {
  background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  padding: 16px 24px; margin-bottom: 16px; box-sizing: border-box;
}
.card-head {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 16px; padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}
.card-head.tight { margin-bottom: 0; padding-bottom: 12px; }
.card-head-icon {
  width: 38px; height: 38px; border-radius: 50%; flex-shrink: 0;
  border: 2px solid currentColor;
  display: flex; align-items: center; justify-content: center;
}
.card-head-icon svg { width: 18px; height: 18px; }
.card-head-icon.blue { color: #1890ff; }
.card-head-icon.green { color: #52c41a; }
.card-head-title { font-size: 15px; font-weight: 600; color: #1D2129; }
.mock-tag {
  margin-left: auto; font-size: 10px; padding: 2px 8px; border-radius: 8px;
  background: #fdf6ec; color: #e6a23c; font-weight: 500;
}

/* ===== 基本信息网格 ===== */
.info-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px 24px; }
.info-f { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.info-l { font-size: 12px; color: #999; }
.info-v { font-size: 13px; color: #333; font-weight: 500; word-break: break-all; }
.info-v.link { color: #409eff; cursor: pointer; }
.info-v.link:hover { color: #337ecc; }
.info-v.green { color: #67c23a; }

/* ===== 实时数据行 ===== */
.realtime-row { display: flex; gap: 16px; }
.kpi-card { width: 440px; flex-shrink: 0; }
.kpi-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 18px; }
.kpi { display: flex; align-items: center; gap: 10px; }
.alert-kpi { grid-column: span 2; }

.kpi-icon-wrap {
  width: 38px; height: 38px; border-radius: 50%; flex-shrink: 0;
  border: 2px solid currentColor;
  display: flex; align-items: center; justify-content: center;
}
.kpi-icon-wrap svg { width: 18px; height: 18px; }
.kpi-icon-wrap.blue { color: #1890ff; }
.kpi-icon-wrap.green { color: #52c41a; }
.kpi-icon-wrap.orange { color: #FF8A00; }
.kpi-icon-wrap.red { color: #E53E3E; }

.kpi-body { display: flex; flex-direction: column; gap: 2px; }
.kpi-num { font-size: 24px; font-weight: 700; color: #1D2129; }
.kpi-num.total { font-size: 17px; color: #333; }
.kpi-num.ok { font-size: 16px; color: #67c23a; }
.kpi-label { font-size: 12px; color: #999; }

/* ===== 表格列 ===== */
.tables-col { flex: 1; display: flex; flex-direction: column; gap: 16px; min-width: 0; }
.table-card { padding: 0; overflow: hidden; }
.table-card .card-head { padding: 14px 20px 0; margin-bottom: 0; border-bottom: none; }
.tbl { font-size: 13px; }
.tbl-h {
  display: grid; grid-template-columns: 100px 120px 140px 1fr;
  padding: 10px 20px; background: #F5F7FA; border-bottom: 1px solid #ebeef5;
  color: #4E5969; font-size: 12px; font-weight: 600;
}
.tbl-body { max-height: 240px; overflow-y: auto; }
.tbl-r {
  display: grid; grid-template-columns: 100px 120px 140px 1fr;
  padding: 10px 20px; border-bottom: 1px solid #f5f7fa; color: #333;
  transition: background 0.2s;
}
.tbl-r:last-child { border-bottom: none; }
.tbl-r:hover { background: #F0F7FF; }
.tbl-r.warn { background: #fef0f0; }
.tbl-r.warn:hover { background: #fde2e2; }
.c3 { display: flex; align-items: center; gap: 8px; }
.danger { color: #f56c6c; font-weight: 600; }
.low-chip {
  display: inline-flex; align-items: center; height: 18px; padding: 0 6px;
  font-size: 10px; border-radius: 4px; background: #f56c6c; color: #fff; font-weight: 500;
}
</style>
