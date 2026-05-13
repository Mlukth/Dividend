<template>
  <div class="dark-tech-page">
    <!-- 顶部英雄区 -->
    <div class="hero-banner">
      <div class="hero-bg-grid"></div>
      <div class="hero-content">
        <div class="hero-left">
          <div class="breadcrumb">
            <span class="bc-link" @click="goBack">{{ inverter.stationName }}</span>
            <span class="bc-sep">/</span>
            <span>逆变器详情</span>
          </div>
          <h1 class="hero-title">
            <span class="status-pulse" :class="inverter.status"></span>
            {{ inverter.name }}
          </h1>
          <div class="hero-meta">
            <span>SN: {{ inverter.sn }}</span>
            <span class="meta-sep">|</span>
            <span>型号: {{ inverter.model }}</span>
            <span class="meta-sep">|</span>
            <span>更新: {{ inverter.updateTime }}</span>
          </div>
        </div>
        <div class="hero-right">
          <div class="hero-kpi">
            <div class="hero-kpi-value">{{ inverter.realPower }}</div>
            <div class="hero-kpi-label">实时功率</div>
          </div>
          <div class="hero-kpi">
            <div class="hero-kpi-value">{{ inverter.dayEnergy }}</div>
            <div class="hero-kpi-label">当日发电</div>
          </div>
          <div class="hero-kpi">
            <div class="hero-kpi-value highlight">{{ inverter.totalEnergy }}</div>
            <div class="hero-kpi-label">累计发电</div>
          </div>
        </div>
      </div>
    </div>

    <!-- KPI 四列卡片 -->
    <div class="kpi-strip">
      <div class="kpi-card" v-for="k in topKpis" :key="k.label">
        <div class="kpi-card-icon" :style="{ color: k.color }">
          <svg viewBox="0 0 1024 1024"><path fill="currentColor" :d="k.icon" /></svg>
        </div>
        <div class="kpi-card-info">
          <div class="kpi-card-num">{{ k.value }}<span class="kpi-card-unit">{{ k.unit }}</span></div>
          <div class="kpi-card-label">{{ k.label }}</div>
        </div>
      </div>
    </div>

    <!-- 主体两栏 -->
    <div class="main-grid">
      <!-- 左侧：基础信息 -->
      <div class="panel info-panel">
        <div class="panel-title">
          <span class="panel-title-icon"></span>
          基础信息
        </div>
        <div class="info-grid">
          <div class="info-item" v-for="f in infoFields" :key="f.label">
            <span class="info-label">{{ f.label }}</span>
            <span class="info-value" :class="{ link: f.link, green: f.green }">{{ f.value }}</span>
          </div>
        </div>
      </div>

      <!-- 右侧：运行指标环形图 -->
      <div class="panel gauge-panel">
        <div class="panel-title">
          <span class="panel-title-icon"></span>
          运行指标
        </div>
        <div class="gauge-row">
          <div class="gauge-item" v-for="g in gaugeData" :key="g.label">
            <div :ref="el => gaugeRefs[g.label] = el" class="gauge-chart"></div>
            <div class="gauge-label">{{ g.label }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 直流/交流双表格 -->
    <div class="table-duo">
      <div class="panel table-panel">
        <div class="panel-title">
          <span class="badge badge-dc">DC</span>
          直流侧数据
          <span class="mock-tag">(模拟)</span>
        </div>
        <table class="data-table dark">
          <thead><tr><th></th><th>电压(V)</th><th>电流(A)</th><th>功率(W)</th></tr></thead>
          <tbody>
            <tr v-for="d in dcData" :key="d.name" :class="{ 'row-warn': d.current <= 0.15 }">
              <td class="td-name">{{ d.name }}</td>
              <td>{{ d.voltage }}</td>
              <td>
                {{ d.current }}
                <span v-if="d.current <= 0.15" class="tag-danger">低电流</span>
              </td>
              <td>{{ d.power }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="panel table-panel">
        <div class="panel-title">
          <span class="badge badge-ac">AC</span>
          交流侧数据
          <span class="mock-tag">(模拟)</span>
        </div>
        <table class="data-table dark">
          <thead><tr><th></th><th>电压(V)</th><th>电流(A)</th><th>频率(Hz)</th></tr></thead>
          <tbody>
            <tr v-for="a in acData" :key="a.name">
              <td class="td-name">{{ a.name }}</td>
              <td>{{ a.voltage }}</td>
              <td>{{ a.current }}</td>
              <td>{{ a.freq }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar">
      <button class="btn-neon" @click="handleControl">逆变器控制</button>
      <button class="btn-outline" @click="handleCalibrate">校准电量</button>
      <button class="btn-outline" @click="handleLog">操作日志</button>
      <button class="btn-outline danger" @click="goBack">返回电站</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'

const goBack = () => {}
const handleControl = () => {}
const handleCalibrate = () => {}
const handleLog = () => {}

const inverter = ref({
  name: 'INV-东江园区A1-001',
  sn: 'SOLIS-2024-A1B2C3D4',
  model: 'S6-GC60K-US',
  stationName: '东江高新产业园区',
  realPower: '48.6kW',
  dayEnergy: '312.5kWh',
  totalEnergy: '158.6MWh',
  updateTime: '2026-05-06 14:30:25',
  status: 'online'
})

const topKpis = [
  { label: '日满发小时', value: '4.8', unit: 'h', color: '#36A2EB', icon: 'M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z m46-334c-57.4 0-104-46.6-104-104s46.6-104 104-104 104 46.6 104 104-46.6 104-104 104z' },
  { label: '当月发电', value: '8.2', unit: 'MWh', color: '#52c41a', icon: 'M416 896V128h192v768zm-288 0V448h192v448zm576 0V320h192v576z' },
  { label: '当年发电', value: '42.6', unit: 'MWh', color: '#FFC107', icon: 'M192 128v704h384V128zm-32-64h448a32 32 0 0 1 32 32v768a32 32 0 0 1-32 32H160a32 32 0 0 1-32-32V96a32 32 0 0 1 32-32' },
  { label: '报警信息', value: '正常', unit: '', color: '#67c23a', icon: 'M512 128c-212.1 0-384 171.9-384 384s171.9 384 384 384 384-171.9 384-384-171.9-384-384-384z m0 640c-141.4 0-256-114.6-256-256s114.6-256 256-256 256 114.6 256 256-114.6 256-256 256z m-32-384h64v256h-64z m0 320h64v64h-64z' }
]

const infoFields = [
  { label: '型号', value: 'S6-GC60K-US' },
  { label: '机型', value: '组串式逆变器' },
  { label: '额定功率', value: '60kW', green: true },
  { label: '所属电站', value: '东江高新产业园区 →', link: true },
  { label: '质保状态', value: '质保期内', green: true },
  { label: '质保到期', value: '2029-06-15' },
  { label: '国家标准', value: 'GB/T 37408-2019 →', link: true },
  { label: '逆变器版本', value: 'V2.4.1' },
  { label: 'AFO版本', value: 'V1.3.0' },
  { label: 'G100运行状态', value: '运行中' },
  { label: 'AFO方案', value: '标准方案A' },
  { label: '地址', value: '惠州市博罗县' }
]

const dcData = [
  { name: 'PV1', voltage: 648.6, current: 6.8, power: 4410 },
  { name: 'PV2', voltage: 648.6, current: 0.05, power: 32 },
  { name: 'PV3', voltage: 596.5, current: 7.1, power: 4235 },
  { name: 'PV4', voltage: 596.5, current: 0.08, power: 48 },
  { name: 'PV5', voltage: 553.9, current: 5.3, power: 2936 },
  { name: 'PV6', voltage: 553.9, current: 0.03, power: 17 },
  { name: 'PV7', voltage: 632.9, current: 8.2, power: 5189 },
  { name: 'PV8', voltage: 632.9, current: 0.12, power: 76 },
  { name: 'MPPT1', voltage: 648.5, current: 6.9, power: 4476 },
  { name: 'MPPT2', voltage: 596.6, current: 7.0, power: 4176 }
]

const acData = [
  { name: 'L1', voltage: 255.9, current: 14.2, freq: 50.03 },
  { name: 'L2', voltage: 257.7, current: 13.8, freq: 50.03 },
  { name: 'L3', voltage: 255.3, current: 14.0, freq: 50.03 }
]

const gaugeData = [
  { label: '系统效率PR', value: 85 },
  { label: '逆变器效率', value: 98.2 },
  { label: '功率因数', value: 0.96 },
  { label: '离散率', value: 3.2 }
]

const gaugeRefs = ref({})

const initGauges = () => {
  nextTick(() => {
    gaugeData.forEach(g => {
      const el = gaugeRefs.value[g.label]
      if (!el) return
      const c = echarts.init(el)
      c.setOption({
        series: [{
          type: 'gauge', startAngle: 210, endAngle: -30,
          center: ['50%', '55%'], radius: '85%',
          min: 0, max: g.label === '离散率' ? 20 : 100,
          axisLine: { show: true, lineStyle: { width: 8, color: [[g.value/100, '#36A2EB'],[1, 'rgba(255,255,255,0.1)']] } },
          pointer: { length: '55%', width: 3, itemStyle: { color: '#fff' } },
          detail: { valueAnimation: true, formatter: '{value}' + (g.label === '离散率' ? '%' : '%'), color: '#fff', fontSize: 13, offsetCenter: [0, '70%'] },
          data: [{ value: g.value }],
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          title: { show: false }
        }]
      })
    })
  })
}

onMounted(initGauges)
</script>

<style scoped>
.dark-tech-page {
  width: 100%; min-height: 100vh;
  background: #080e1a;
  color: #e0e6f0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", sans-serif;
}

.hero-banner {
  position: relative;
  background: linear-gradient(135deg, #0a2a60 0%, #0d1b3e 50%, #0a1628 100%);
  padding: 28px 32px;
  overflow: hidden;
}
.hero-bg-grid {
  position: absolute; inset: 0;
  background-image: linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
  background-size: 50px 50px;
  pointer-events: none;
}
.hero-content {
  position: relative; z-index: 1;
  display: flex; justify-content: space-between; align-items: flex-end;
}
.breadcrumb { font-size: 13px; color: rgba(255,255,255,0.5); margin-bottom: 6px; }
.bc-link { cursor: pointer; color: #409eff; }
.bc-link:hover { text-decoration: underline; }
.bc-sep { margin: 0 6px; color: rgba(255,255,255,0.3); }

.hero-title {
  font-size: 26px; font-weight: 700; margin: 0; display: flex; align-items: center; gap: 10px;
  background: linear-gradient(90deg, #fff, #a0c4ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}
.status-pulse {
  width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0;
  -webkit-text-fill-color: initial;
}
.status-pulse.online { background: #52c41a; box-shadow: 0 0 8px #52c41a; animation: pulse 2s infinite; }
.status-pulse.offline { background: #909399; }
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }

.hero-meta { font-size: 13px; color: rgba(255,255,255,0.5); margin-top: 6px; }
.meta-sep { margin: 0 8px; color: rgba(255,255,255,0.2); }

.hero-right { display: flex; gap: 32px; }
.hero-kpi { text-align: right; }
.hero-kpi-value { font-size: 28px; font-weight: 700; color: #fff; }
.hero-kpi-value.highlight { color: #36A2EB; text-shadow: 0 0 20px rgba(54,162,235,0.4); }
.hero-kpi-label { font-size: 12px; color: rgba(255,255,255,0.5); }

.kpi-strip {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 16px; padding: 16px 32px;
  background: rgba(255,255,255,0.02);
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.kpi-card {
  display: flex; align-items: center; gap: 12px;
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
  border-radius: 8px; padding: 16px 20px;
  transition: border-color 0.2s;
}
.kpi-card:hover { border-color: rgba(255,255,255,0.15); }
.kpi-card-icon { width: 40px; height: 40px; flex-shrink: 0; }
.kpi-card-icon svg { width: 100%; height: 100%; }
.kpi-card-info { display: flex; flex-direction: column; gap: 2px; }
.kpi-card-num { font-size: 22px; font-weight: 700; color: #fff; }
.kpi-card-unit { font-size: 12px; color: rgba(255,255,255,0.5); margin-left: 2px; font-weight: 400; }
.kpi-card-label { font-size: 12px; color: rgba(255,255,255,0.5); }

.main-grid {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 16px; padding: 16px 32px;
}
.panel {
  background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06);
  border-radius: 10px; padding: 20px 24px;
}
.panel-title {
  font-size: 15px; font-weight: 600; color: #e0e6f0;
  display: flex; align-items: center; gap: 8px; margin-bottom: 16px;
}
.panel-title-icon { width: 4px; height: 16px; border-radius: 2px; background: #409eff; }
.badge { padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; }
.badge-dc { background: rgba(54,162,235,0.2); color: #36A2EB; }
.badge-ac { background: rgba(82,196,26,0.2); color: #52c41a; }
.mock-tag { font-size: 11px; color: #e6a23c; font-weight: 400; }

.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 16px; }
.info-item { font-size: 13px; display: flex; gap: 6px; }
.info-label { color: rgba(255,255,255,0.45); white-space: nowrap; }
.info-value { color: rgba(255,255,255,0.85); }
.info-value.link { color: #409eff; cursor: pointer; }
.info-value.green { color: #52c41a; }

.gauge-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.gauge-item { text-align: center; }
.gauge-chart { width: 100%; height: 120px; }
.gauge-label { font-size: 12px; color: rgba(255,255,255,0.5); margin-top: -8px; }

.table-duo {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 16px; padding: 0 32px 16px;
}
.data-table.dark { width: 100%; border-collapse: collapse; font-size: 13px; }
.data-table.dark th {
  text-align: left; padding: 10px 12px;
  background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.5); font-weight: 500;
}
.data-table.dark td {
  padding: 8px 12px;
  border-bottom: 1px solid rgba(255,255,255,0.04); color: rgba(255,255,255,0.8);
}
.data-table.dark tr:hover td { background: rgba(255,255,255,0.02); }
.data-table.dark .row-warn td { background: rgba(245,108,108,0.08); }
.data-table.dark .td-name { color: rgba(255,255,255,0.6); font-weight: 500; }
.tag-danger {
  display: inline-block; margin-left: 6px;
  padding: 1px 6px; border-radius: 3px;
  font-size: 10px; background: rgba(245,108,108,0.2); color: #f56c6c;
  font-weight: 600;
}

.action-bar {
  display: flex; gap: 10px; padding: 0 32px 24px;
}
.btn-neon {
  padding: 8px 24px; border-radius: 6px; border: none;
  background: linear-gradient(135deg, #0052D9, #165DFF);
  color: #fff; font-size: 14px; cursor: pointer;
  box-shadow: 0 0 16px rgba(22,93,255,0.3);
  transition: all 0.2s;
}
.btn-neon:hover { box-shadow: 0 0 24px rgba(22,93,255,0.5); transform: translateY(-1px); }
.btn-outline {
  padding: 8px 20px; border-radius: 6px;
  border: 1px solid rgba(255,255,255,0.15);
  background: transparent; color: rgba(255,255,255,0.7); font-size: 14px; cursor: pointer;
  transition: all 0.2s;
}
.btn-outline:hover { border-color: rgba(255,255,255,0.3); color: #fff; }
.btn-outline.danger { color: #f56c6c; border-color: rgba(245,108,108,0.2); }
.btn-outline.danger:hover { border-color: #f56c6c; }
</style>
