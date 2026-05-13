<template>
  <div class="dashboard-page">
    <!-- 标题行 -->
    <div class="page-head">
      <div>
        <div class="breadcrumb">
          <span class="bc-link" @click="goBack">{{ inverter.stationName }}</span> / 逆变器详情
        </div>
        <h1 class="page-title">{{ inverter.name }} <span class="sn-text">{{ inverter.sn }}</span></h1>
      </div>
      <div class="head-actions">
        <button class="act-btn" @click="handleControl">控制</button>
        <button class="act-btn ghost" @click="handleCalibrate">校准</button>
        <button class="act-btn ghost" @click="goBack">返回</button>
      </div>
    </div>

    <!-- 核心仪表盘行 -->
    <div class="gauge-row">
      <div class="gauge-card" v-for="g in gaugeList" :key="g.label">
        <div :ref="el => gaugeEls[g.label] = el" class="gauge-echart"></div>
        <div class="gauge-title">{{ g.label }}</div>
      </div>
    </div>

    <!-- 趋势图 + 信息卡 -->
    <div class="mid-row">
      <div class="chart-card">
        <div class="card-hd">24h 功率趋势 <span class="hd-note">今日实时</span></div>
        <div ref="trendChart" class="trend-chart"></div>
      </div>
      <div class="info-card">
        <div class="card-hd">基础信息</div>
        <div class="info-list">
          <div class="info-li" v-for="f in infoFields" :key="f.label">
            <span class="info-l">{{ f.label }}</span>
            <span class="info-v" :class="{ ok: f.ok, link: f.link }">{{ f.value }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 直流/交流双表 -->
    <div class="table-row">
      <div class="tbl-card">
        <div class="card-hd">
          <span class="tag-chip dc-chip">直流侧</span>
          <span class="mock-chip">模拟数据</span>
        </div>
        <table class="dash-table">
          <thead><tr><th>通道</th><th>电压(V)</th><th>电流(A)</th><th>功率(W)</th><th>状态</th></tr></thead>
          <tbody>
            <tr v-for="d in dcData" :key="d.name" :class="{ danger: d.current <= 0.15 }">
              <td class="chn-cell">{{ d.name }}</td>
              <td>{{ d.voltage }}</td>
              <td>
                <div class="bar-cell">
                  <div class="bar-fill" :style="{ width: Math.min(d.current/10*100, 100) + '%', background: d.current <= 0.15 ? '#F53F3F' : '#165DFF' }"></div>
                  <span>{{ d.current }}</span>
                </div>
              </td>
              <td>{{ d.power }}</td>
              <td><span class="st-chip" :class="d.current <= 0.15 ? 'st-bad' : 'st-ok'">{{ d.current <= 0.15 ? '异常' : '正常' }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="tbl-card">
        <div class="card-hd">
          <span class="tag-chip ac-chip">交流侧</span>
          <span class="mock-chip">模拟数据</span>
        </div>
        <table class="dash-table">
          <thead><tr><th>相线</th><th>电压(V)</th><th>电流(A)</th><th>频率(Hz)</th><th>状态</th></tr></thead>
          <tbody>
            <tr v-for="a in acData" :key="a.name">
              <td class="chn-cell">{{ a.name }}</td>
              <td>{{ a.voltage }}</td>
              <td>
                <div class="bar-cell">
                  <div class="bar-fill" :style="{ width: Math.min(a.current/20*100, 100) + '%', background: '#00B42A' }"></div>
                  <span>{{ a.current }}</span>
                </div>
              </td>
              <td>{{ a.freq }}</td>
              <td><span class="st-chip st-ok">正常</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'

const goBack = () => {}
const handleControl = () => {}
const handleCalibrate = () => {}

const inverter = ref({
  name: 'INV-东江园区A1-001',
  sn: 'SOLIS-2024-A1B2C3D4',
  stationName: '东江高新产业园区'
})

const gaugeList = [
  { label: '实时功率', value: 48.6, max: 60, unit: 'kW', color: '#165DFF' },
  { label: '当日发电', value: 312.5, max: 500, unit: 'kWh', color: '#00B42A' },
  { label: '日满发小时', value: 4.8, max: 8, unit: 'h', color: '#722ED1' },
  { label: '系统效率PR', value: 85, max: 100, unit: '%', color: '#F7BA1E' }
]

const infoFields = [
  { label: '型号', value: 'S6-GC60K-US' },
  { label: '机型', value: '组串式逆变器' },
  { label: '额定功率', value: '60kW', ok: true },
  { label: '所属电站', value: '东江高新产业园区 →', link: true },
  { label: '质保状态', value: '质保期内', ok: true },
  { label: '质保到期', value: '2029-06-15' },
  { label: '国家标准', value: 'GB/T 37408-2019 →', link: true },
  { label: '版本', value: 'V2.4.1' },
  { label: 'AFO版本', value: 'V1.3.0' },
  { label: 'G100状态', value: '正常运行' },
  { label: '地址', value: '广东省惠州市博罗县' }
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

const gaugeEls = ref({})
const trendChart = ref(null)

const initGauges = () => {
  nextTick(() => {
    gaugeList.forEach(g => {
      const el = gaugeEls.value[g.label]
      if (!el) return
      const c = echarts.init(el)
      const pct = Math.round(g.value / g.max * 100)
      c.setOption({
        series: [{
          type: 'gauge', startAngle: 220, endAngle: -40,
          center: ['50%', '60%'], radius: '90%',
          min: 0, max: g.max,
          progress: { show: true, width: 10, itemStyle: { color: g.color } },
          axisLine: { lineStyle: { width: 10, color: [[pct/100, g.color],[1, '#E5E6EB']] } },
          axisTick: { show: false }, splitLine: { show: false }, axisLabel: { show: false },
          pointer: { length: '60%', width: 4, itemStyle: { color: '#1D2129' } },
          detail: {
            valueAnimation: true, fontSize: 20, fontWeight: 700, color: '#1D2129',
            formatter: '{value}' + g.unit, offsetCenter: [0, '80%']
          },
          data: [{ value: g.value }],
          title: { show: false }
        }]
      })
    })
  })
}

const initTrend = () => {
  nextTick(() => {
    if (!trendChart.value) return
    const c = echarts.init(trendChart.value)
    const hours = ['00:00','02:00','04:00','06:00','08:00','10:00','12:00','14:00','16:00','18:00','20:00','22:00']
    const vals = [0,0,0,2,15,38,52,48,42,28,8,0]
    c.setOption({
      grid: { left: 40, right: 20, top: 20, bottom: 30 },
      xAxis: { type: 'category', data: hours, axisLabel: { fontSize: 11, color: '#86909C' }, axisLine: { lineStyle: { color: '#E5E6EB' } } },
      yAxis: { type: 'value', name: 'kW', splitLine: { lineStyle: { color: '#F2F3F5' } }, axisLabel: { fontSize: 11, color: '#86909C' } },
      series: [{
        type: 'bar', data: vals.map((v, i) => ({ value: v, itemStyle: { color: i >= 5 && i <= 8 ? '#165DFF' : '#BEDAFF', borderRadius: [4,4,0,0] } })),
        barWidth: 14
      }],
      tooltip: { trigger: 'axis' }
    })
  })
}

onMounted(() => { initGauges(); initTrend() })
</script>

<style scoped>
.dashboard-page {
  width: 100%; min-height: 100vh;
  background: #F5F6F8;
  padding: 20px 24px; box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", sans-serif;
  color: #1D2129;
}

.page-head {
  display: flex; justify-content: space-between; align-items: flex-start;
  margin-bottom: 20px;
}
.breadcrumb { font-size: 13px; color: #86909C; }
.bc-link { color: #165DFF; cursor: pointer; }
.page-title { margin: 4px 0 0; font-size: 22px; font-weight: 700; }
.sn-text { font-size: 13px; color: #86909C; font-weight: 400; margin-left: 10px; font-family: monospace; }
.head-actions { display: flex; gap: 8px; }
.act-btn {
  padding: 8px 20px; border: none; border-radius: 6px;
  background: #165DFF; color: #fff; font-size: 13px; cursor: pointer;
}
.act-btn.ghost { background: #fff; color: #4E5969; border: 1px solid #E5E6EB; }
.act-btn.ghost:hover { border-color: #165DFF; color: #165DFF; }

.gauge-row {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 14px; margin-bottom: 14px;
}
.gauge-card {
  background: #fff; border-radius: 10px;
  padding: 16px; text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.gauge-echart { width: 100%; height: 140px; }
.gauge-title { font-size: 13px; color: #4E5969; font-weight: 500; margin-top: -12px; }

.mid-row {
  display: grid; grid-template-columns: 1.2fr 0.8fr;
  gap: 14px; margin-bottom: 14px;
}
.chart-card, .info-card, .tbl-card {
  background: #fff; border-radius: 10px;
  padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.card-hd {
  font-size: 15px; font-weight: 600; color: #1D2129;
  margin-bottom: 14px; display: flex; align-items: center; gap: 8px;
}
.hd-note { font-size: 12px; color: #86909C; font-weight: 400; }
.trend-chart { width: 100%; height: 260px; }
.info-list { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 16px; }
.info-li { font-size: 13px; display: flex; gap: 4px; }
.info-l { color: #86909C; white-space: nowrap; }
.info-v { color: #1D2129; }
.info-v.ok { color: #00B42A; font-weight: 500; }
.info-v.link { color: #165DFF; cursor: pointer; }

.table-row {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.tag-chip { padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
.dc-chip { background: #E8F3FF; color: #165DFF; }
.ac-chip { background: #E8FFEA; color: #00B42A; }
.mock-chip { font-size: 11px; color: #D46B08; background: #FFF7E8; padding: 1px 6px; border-radius: 3px; }

.dash-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.dash-table th {
  text-align: left; padding: 8px 10px;
  background: #FAFBFC; color: #4E5969; font-weight: 600; border-bottom: 1px solid #E5E6EB;
}
.dash-table td {
  padding: 8px 10px; border-bottom: 1px solid #F2F3F5; color: #1D2129;
}
.dash-table tr:hover td { background: #F7F8FA; }
.dash-table .danger td { background: #FFF2F0; }
.chn-cell { font-weight: 500; color: #4E5969; }
.bar-cell { display: flex; align-items: center; gap: 6px; }
.bar-fill { height: 6px; border-radius: 3px; min-width: 2px; }
.st-chip { padding: 1px 8px; border-radius: 10px; font-size: 11px; font-weight: 500; }
.st-ok { background: #E8FFEA; color: #00B42A; }
.st-bad { background: #FFECE8; color: #F53F3F; }
</style>
