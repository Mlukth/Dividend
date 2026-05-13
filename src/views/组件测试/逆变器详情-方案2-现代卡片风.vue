<template>
  <div class="modern-card-page">
    <!-- 顶栏 -->
    <div class="top-bar">
      <div class="top-bar-left">
        <span class="back-link" @click="goBack">← {{ inverter.stationName }}</span>
        <h1 class="page-title">{{ inverter.name }}</h1>
        <span class="sn-badge">SN: {{ inverter.sn }}</span>
      </div>
      <div class="top-bar-right">
        <span class="status-tag" :class="inverter.status">{{ inverter.status === 'online' ? '● 在线' : '○ 离线' }}</span>
        <span class="update-time">更新于 {{ inverter.updateTime }}</span>
      </div>
    </div>

    <!-- 5列 KPI 卡片 -->
    <div class="kpi-cards">
      <div class="kpi-c" v-for="k in kpiList" :key="k.label" :style="{ borderTopColor: k.color }">
        <div class="kpi-c-icon" :style="{ background: k.color + '15', color: k.color }">
          <svg viewBox="0 0 1024 1024"><path fill="currentColor" :d="k.icon" /></svg>
        </div>
        <div class="kpi-c-body">
          <div class="kpi-c-value">{{ k.value }}<span class="kpi-c-unit">{{ k.unit }}</span></div>
          <div class="kpi-c-label">{{ k.label }}</div>
        </div>
        <div v-if="k.trend" class="kpi-c-trend" :class="k.trend > 0 ? 'up' : 'down'">
          {{ k.trend > 0 ? '↑' : '↓' }}{{ Math.abs(k.trend) }}%
        </div>
      </div>
    </div>

    <!-- 双栏：信息卡 + 实时数据 -->
    <div class="two-col">
      <!-- 左：基础信息 -->
      <div class="white-card">
        <div class="card-hd">基础信息</div>
        <div class="info-two-col">
          <div class="info-row" v-for="f in infoFields" :key="f.label">
            <span class="info-l">{{ f.label }}</span>
            <span class="info-v" :class="{ accent: f.accent, link: f.link }">{{ f.value }}</span>
          </div>
        </div>
      </div>

      <!-- 右：运行概览 -->
      <div class="white-card">
        <div class="card-hd">运行概览</div>
        <div class="run-metrics">
          <div class="run-item" v-for="r in runMetrics" :key="r.label">
            <div class="run-ring" :style="{ '--pct': r.pct + '%', '--clr': r.color }">
              <span class="run-val">{{ r.value }}</span>
            </div>
            <div class="run-lbl">{{ r.label }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 直流/交流双表格 -->
    <div class="two-col">
      <div class="white-card table-card">
        <div class="card-hd">
          <span class="dot dc-dot"></span> 直流侧数据
          <span class="mock-badge">模拟</span>
        </div>
        <table class="mod-table">
          <thead><tr><th>通道</th><th>电压(V)</th><th>电流(A)</th><th>功率(W)</th></tr></thead>
          <tbody>
            <tr v-for="d in dcData" :key="d.name" :class="{ 'alert-row': d.current <= 0.15 }">
              <td class="chn">{{ d.name }}</td>
              <td>{{ d.voltage }}</td>
              <td>
                <span class="curr-bar" :style="{ width: Math.min(d.current/10*100, 100) + '%', background: d.current <= 0.15 ? '#f56c6c' : '#409eff' }"></span>
                {{ d.current }}
                <span v-if="d.current <= 0.15" class="low-tag">低电流</span>
              </td>
              <td>{{ d.power }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="white-card table-card">
        <div class="card-hd">
          <span class="dot ac-dot"></span> 交流侧数据
          <span class="mock-badge">模拟</span>
        </div>
        <table class="mod-table">
          <thead><tr><th>相线</th><th>电压(V)</th><th>电流(A)</th><th>频率(Hz)</th></tr></thead>
          <tbody>
            <tr v-for="a in acData" :key="a.name">
              <td class="chn">{{ a.name }}</td>
              <td>{{ a.voltage }}</td>
              <td><span class="curr-bar" :style="{ width: Math.min(a.current/20*100, 100) + '%', background: '#52c41a' }"></span>{{ a.current }}</td>
              <td>{{ a.freq }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 底部操作 -->
    <div class="bottom-actions">
      <button class="btn-primary" @click="handleControl">逆变器控制</button>
      <button class="btn-default" @click="handleCalibrate">校准电量</button>
      <button class="btn-default" @click="handleLog">操作日志</button>
      <button class="btn-back" @click="goBack">返回电站</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const goBack = () => {}
const handleControl = () => {}
const handleCalibrate = () => {}
const handleLog = () => {}

const inverter = ref({
  name: 'INV-东江园区A1-001',
  sn: 'SOLIS-2024-A1B2C3D4',
  stationName: '东江高新产业园区',
  updateTime: '2026-05-06 14:30:25',
  status: 'online'
})

const kpiList = [
  { label: '实时功率', value: '48.6', unit: 'kW', color: '#165DFF', trend: 3.2, icon: 'M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z m46-334c-57.4 0-104-46.6-104-104s46.6-104 104-104 104 46.6 104 104-46.6 104-104 104z' },
  { label: '当日发电', value: '312.5', unit: 'kWh', color: '#00B42A', trend: 5.1, icon: 'M416 896V128h192v768zm-288 0V448h192v448zm576 0V320h192v576z' },
  { label: '日满发小时', value: '4.8', unit: 'h', color: '#722ED1', trend: -1.5, icon: 'M512 128c-212.1 0-384 171.9-384 384s171.9 384 384 384 384-171.9 384-384-171.9-384-384-384z m0 640c-141.4 0-256-114.6-256-256s114.6-256 256-256 256 114.6 256 256-114.6 256-256 256z m-32-384h64v256h-64z m0 320h64v64h-64z' },
  { label: '累计发电', value: '158.6', unit: 'MWh', color: '#F7BA1E', trend: null, icon: 'M192 128v704h384V128zm-32-64h448a32 32 0 0 1 32 32v768a32 32 0 0 1-32 32H160a32 32 0 0 1-32-32V96a32 32 0 0 1 32-32' },
  { label: '报警状态', value: '无', unit: '', color: '#00B42A', trend: null, icon: 'M512 128c-212.1 0-384 171.9-384 384s171.9 384 384 384 384-171.9 384-384-171.9-384-384-384z m0 640c-141.4 0-256-114.6-256-256s114.6-256 256-256 256 114.6 256 256-114.6 256-256 256z m-32-384h64v256h-64z m0 320h64v64h-64z' }
]

const infoFields = [
  { label: '型号', value: 'S6-GC60K-US' },
  { label: '机型', value: '组串式逆变器' },
  { label: '额定功率', value: '60kW', accent: true },
  { label: '所属电站', value: '东江高新产业园区 →', link: true },
  { label: '质保状态', value: '质保期内', accent: true },
  { label: '质保到期时间', value: '2029-06-15' },
  { label: '国家标准', value: 'GB/T 37408-2019 →', link: true },
  { label: '逆变器版本', value: 'V2.4.1' },
  { label: 'AFO版本', value: 'V1.3.0' },
  { label: 'G100运行状态', value: '正常运行' },
  { label: 'AFO方案', value: '标准方案A' },
  { label: '地址', value: '广东省惠州市博罗县' }
]

const runMetrics = [
  { label: '系统效率PR', value: '85%', pct: 85, color: '#165DFF' },
  { label: '逆变器效率', value: '98.2%', pct: 98.2, color: '#00B42A' },
  { label: '功率因数', value: '0.96', pct: 96, color: '#722ED1' },
  { label: '离散率', value: '3.2%', pct: 16, color: '#F7BA1E' }
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
</script>

<style scoped>
.modern-card-page {
  width: 100%; min-height: 100vh;
  background: #f0f2f5;
  padding: 20px 24px; box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", sans-serif;
  color: #1D2129;
}

.top-bar {
  display: flex; justify-content: space-between; align-items: flex-start;
  margin-bottom: 20px;
}
.back-link { color: #86909C; font-size: 13px; cursor: pointer; }
.back-link:hover { color: #165DFF; }
.page-title { margin: 4px 0; font-size: 22px; font-weight: 700; color: #1D2129; }
.sn-badge {
  display: inline-block; padding: 2px 8px;
  background: #E8F3FF; color: #165DFF; border-radius: 4px;
  font-size: 12px; margin-top: 4px; font-family: monospace;
}
.status-tag { font-size: 13px; font-weight: 500; }
.status-tag.online { color: #00B42A; }
.status-tag.offline { color: #86909C; }
.update-time { font-size: 12px; color: #86909C; margin-left: 12px; }

.kpi-cards {
  display: grid; grid-template-columns: repeat(5, 1fr);
  gap: 14px; margin-bottom: 16px;
}
.kpi-c {
  background: #fff; border-radius: 10px;
  padding: 18px 16px;
  border-top: 3px solid #165DFF;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  position: relative; overflow: hidden;
}
.kpi-c-icon {
  width: 32px; height: 32px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center; margin-bottom: 10px;
}
.kpi-c-icon svg { width: 18px; height: 18px; }
.kpi-c-body { display: flex; flex-direction: column; gap: 2px; }
.kpi-c-value { font-size: 24px; font-weight: 700; color: #1D2129; line-height: 1.2; }
.kpi-c-unit { font-size: 12px; color: #86909C; margin-left: 2px; font-weight: 400; }
.kpi-c-label { font-size: 12px; color: #86909C; }
.kpi-c-trend {
  position: absolute; top: 14px; right: 14px;
  font-size: 12px; font-weight: 600; padding: 2px 6px; border-radius: 4px;
}
.kpi-c-trend.up { color: #00B42A; background: #E8FFEA; }
.kpi-c-trend.down { color: #F53F3F; background: #FFECE8; }

.two-col {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 14px; margin-bottom: 14px;
}
.white-card {
  background: #fff; border-radius: 10px;
  padding: 20px 24px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.card-hd {
  font-size: 15px; font-weight: 600; color: #1D2129;
  margin-bottom: 16px; display: flex; align-items: center; gap: 8px;
}
.dot {
  width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
}
.dc-dot { background: #165DFF; }
.ac-dot { background: #00B42A; }
.mock-badge {
  font-size: 11px; padding: 1px 6px; border-radius: 3px;
  background: #FFF7E8; color: #D46B08; font-weight: 500;
}

.info-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 16px; }
.info-row { font-size: 13px; display: flex; gap: 6px; }
.info-l { color: #86909C; white-space: nowrap; }
.info-v { color: #1D2129; }
.info-v.accent { color: #00B42A; font-weight: 500; }
.info-v.link { color: #165DFF; cursor: pointer; }

.run-metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; text-align: center; }
.run-item { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.run-ring {
  width: 72px; height: 72px; border-radius: 50%;
  background: conic-gradient(var(--clr) 0deg, var(--clr) calc(var(--pct) * 3.6deg), #f0f2f5 calc(var(--pct) * 3.6deg));
  display: flex; align-items: center; justify-content: center;
  position: relative;
}
.run-ring::after { content: ''; position: absolute; width: 56px; height: 56px; border-radius: 50%; background: #fff; }
.run-val { position: relative; z-index: 1; font-size: 14px; font-weight: 700; color: #1D2129; }
.run-lbl { font-size: 12px; color: #86909C; }

.table-card { overflow: hidden; }
.mod-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.mod-table th {
  text-align: left; padding: 10px 12px;
  background: #FAFBFC; color: #4E5969; font-weight: 600; border-bottom: 1px solid #E5E6EB;
}
.mod-table td {
  padding: 8px 12px; border-bottom: 1px solid #F2F3F5; color: #1D2129;
}
.mod-table tr:hover td { background: #F7F8FA; }
.mod-table .alert-row td { background: #FFF2F0; }
.mod-table .chn { font-weight: 500; color: #4E5969; }
.curr-bar {
  display: inline-block; height: 6px; border-radius: 3px;
  vertical-align: middle; margin-right: 6px; max-width: 80px;
}
.low-tag {
  display: inline-block; margin-left: 6px; padding: 1px 6px; border-radius: 3px;
  font-size: 10px; background: #FFECE8; color: #F53F3F; font-weight: 600;
}

.bottom-actions { display: flex; gap: 10px; margin-top: 4px; }
.btn-primary {
  padding: 10px 24px; border: none; border-radius: 6px;
  background: linear-gradient(90deg, #165DFF, #4080FF);
  color: #fff; font-size: 14px; cursor: pointer; transition: all 0.2s;
}
.btn-primary:hover { box-shadow: 0 4px 12px rgba(22,93,255,0.3); }
.btn-default {
  padding: 10px 20px; border: 1px solid #E5E6EB; border-radius: 6px;
  background: #fff; color: #4E5969; font-size: 14px; cursor: pointer; transition: all 0.2s;
}
.btn-default:hover { border-color: #165DFF; color: #165DFF; }
.btn-back {
  padding: 10px 20px; border: none; background: transparent;
  color: #86909C; font-size: 14px; cursor: pointer;
}
.btn-back:hover { color: #F53F3F; }
</style>
