<template>
  <div class="page">
    <!-- Row 1: 仪表盘 + 3 KPI -->
    <div class="row1">
      <div class="gauge-panel">
        <div class="gauge-label">实时功率</div>
        <div class="gauge-ring">
          <svg viewBox="0 0 200 200" class="gauge-svg">
            <circle cx="100" cy="100" r="85" fill="none" stroke="#f0f0f0" stroke-width="12"/>
            <circle cx="100" cy="100" r="85" fill="none" stroke="#ff6b00" stroke-width="12"
              stroke-dasharray="534" :stroke-dashoffset="534 - 534 * (realPower / totalCap)"
              stroke-linecap="round" transform="rotate(-135 100 100)" style="transition: stroke-dashoffset 1s ease"/>
          </svg>
          <div class="gauge-center">
            <span class="gauge-val">{{ realPower }}<small>kW</small></span>
            <span class="gauge-sub">容量 {{ totalCap }} kWp</span>
          </div>
        </div>
      </div>

      <div class="kpi-row">
        <div class="kpi" v-for="k in kpiList" :key="k.label">
          <div class="kpi-top">
            <span class="kpi-icon" :style="{background: k.bg}">{{ k.icon }}</span>
            <span class="kpi-label">{{ k.label }}</span>
          </div>
          <span class="kpi-val">{{ k.value }}<small>{{ k.unit }}</small></span>
          <div class="kpi-details">
            <span v-for="d in k.details" :key="d.text">{{ d.text }} <b>{{ d.val }}</b></span>
          </div>
        </div>
      </div>
    </div>

    <!-- Row 2: 趋势图 + 评估 -->
    <div class="row2">
      <div class="chart-card">
        <div class="card-head">
          <span class="card-title">发电功率趋势</span>
          <div class="tabs">
            <span v-for="t in tabs" :key="t.key" class="tab" :class="{ on: dateType === t.key }" @click="dateType = t.key">{{ t.label }}</span>
          </div>
        </div>
        <div class="chart-wrap" ref="trendRef"></div>
      </div>

      <div class="eval-card">
        <div class="card-head"><span class="card-title">电站评估</span></div>
        <div class="eval-list">
          <div class="eval-r" v-for="e in evalData" :key="e.label">
            <span class="e-label">{{ e.label }}</span>
            <div class="e-bar-wrap">
              <div class="e-bar" :class="e.cls" :style="{width: e.pct + '%'}"></div>
            </div>
            <span class="e-val" :class="e.cls">{{ e.value }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Row 3: 温度 + 天气 -->
    <div class="row3">
      <div class="temp-card">
        <div class="card-head">
          <span class="card-title">温度监测</span>
          <span class="tab" :class="{ on: tempType === 'day' }" @click="tempType = 'day'">日</span>
          <span class="tab" :class="{ on: tempType === 'week' }" @click="tempType = 'week'">周</span>
        </div>
        <div class="chart-wrap short" ref="tempRef"></div>
        <div class="t-legend">
          <span class="t-dot ot"></span>组件 {{ temp.moduleTemp }}°C
          <span class="t-dot bl"></span>环境 {{ temp.envTemp }}°C
        </div>
      </div>
      <div class="wx-card">
        <div class="card-head"><span class="card-title">天气预报</span></div>
        <div class="wx-list">
          <div class="wx-item" v-for="w in weather" :key="w.label">
            <span class="wx-day">{{ w.label }}</span>
            <span class="wx-icn">{{ w.icon }}</span>
            <span class="wx-t">{{ w.temp }}°C</span>
            <span class="wx-d">{{ w.desc }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Row 4: 社会贡献 -->
    <div class="row4">
      <div class="social-card">
        <div class="card-head"><span class="card-title">社会贡献</span></div>
        <div class="s-grid">
          <div class="s-item" v-for="s in social" :key="s.label">
            <span class="s-icon">{{ s.icon }}</span>
            <span class="s-val">{{ s.value }}<small>{{ s.unit }}</small></span>
            <span class="s-label">{{ s.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'

const realPower = ref(186.5)
const totalCap = ref(500)
const dateType = ref('day')
const tempType = ref('day')
const trendRef = ref(null)
const tempRef = ref(null)

const tabs = [
  { key: 'day', label: '日' }, { key: 'month', label: '月' }, { key: 'year', label: '年' }, { key: 'total', label: '累计' }
]

const kpiList = [
  { icon: '⚡', bg: '#fff3e0', label: '当日发电量', value: '1,250', unit: 'kWh', details: [{text:'较昨日',val:'--'},{text:'累计',val:'1,280,000 kWh'}] },
  { icon: '¥', bg: '#e8f5e9', label: '当日收益', value: '500.00', unit: '', details: [{text:'当年收益',val:'78,000元'},{text:'累计收益',val:'312,000元'},{text:'上网电价',val:'0.4元'},{text:'自用电价',val:'0.6元'}] },
  { icon: '●', bg: '#e3f2fd', label: '系统运行状态', value: '运行中', unit: '', details: [{text:'告警',val:'2'},{text:'逆变器',val:'7/9'},{text:'满发小时',val:'5.2h'},{text:'功率比',val:'37.3%'}] },
]

const evalData = [
  { label: '综合效率', pct: 87, value: '87.3%', cls: '' },
  { label: '等效利用小时', pct: 52, value: '5.2h', cls: '' },
  { label: '性能比 PR', pct: 83, value: '82.6%', cls: '' },
  { label: '故障损失', pct: 2, value: '0.12 kWh', cls: 'warn' },
  { label: '可用率', pct: 99, value: '99.2%', cls: 'ok' },
]

const temp = ref({ moduleTemp: '45.2', envTemp: '24.5' })
const weather = [
  { label: '今天', icon: '☀️', temp: '32', desc: '晴' },
  { label: '明天', icon: '⛅', temp: '28', desc: '多云' },
  { label: '后天', icon: '🌧️', temp: '24', desc: '小雨' },
]
const social = [
  { icon: '🌿', value: '768', unit: '吨', label: 'CO₂减排' },
  { icon: '⛏️', value: '155', unit: '吨', label: '标煤节约' },
  { icon: '🌳', value: '12,672', unit: '棵', label: '等效植树' },
  { icon: '🔋', value: '1,280,000', unit: 'kWh', label: '绿色发电' },
]

onMounted(async () => {
  await nextTick()
  const t = echarts.init(trendRef.value)
  t.setOption({
    backgroundColor: 'transparent',
    grid: { left: 8, right: 16, top: 16, bottom: 8 },
    xAxis: { type: 'category', data: ['00:00','02:00','04:00','06:00','08:00','10:00','12:00','14:00','16:00','18:00','20:00','22:00'], axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#999', fontSize: 11 } },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: '#f0f0f0' } }, axisLabel: { color: '#999', fontSize: 11 } },
    series: [{ type: 'line', data: [0,0,0,0,220,780,1200,980,650,320,0,0], smooth: true, symbol: 'circle', symbolSize: 4, lineStyle: { color: '#ff6b00', width: 2.5 }, itemStyle: { color: '#ff6b00' }, areaStyle: { color: new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:'rgba(255,107,0,0.12)'},{offset:1,color:'rgba(255,107,0,0)'}]) } }]
  })
  const t2 = echarts.init(tempRef.value)
  t2.setOption({
    backgroundColor: 'transparent',
    grid: { left: 8, right: 8, top: 8, bottom: 4 },
    xAxis: { type: 'category', data: ['00:00','02:00','04:00','06:00','08:00','10:00','12:00','14:00','16:00','18:00','20:00','22:00'], axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#999', fontSize: 10 } },
    yAxis: { type: 'value', min: 0, max: 60, splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } }, axisLabel: { color: '#999', fontSize: 10 } },
    series: [
      { type: 'line', data: [18,17,16,17,25,35,45,48,42,35,26,20], smooth: true, symbol: 'none', lineStyle: { color: '#ff6b00', width: 2 } },
      { type: 'line', data: [15,14,13,14,20,25,28,30,27,23,18,16], smooth: true, symbol: 'none', lineStyle: { color: '#409EFF', width: 2 } },
    ]
  })
})
</script>

<style scoped>
/* ===== 日光高亮风 — 高对比、户外可视 ===== */
.page {
  width: 100%; min-height: calc(100vh - 60px);
  background: #fafaf8;
  padding: 24px 28px; box-sizing: border-box;
  font-family: "Microsoft YaHei", -apple-system, sans-serif;
  color: #1a1a1a;
}

/* Row 1 */
.row1 { display: flex; gap: 20px; margin-bottom: 20px; }
.gauge-panel {
  flex: 0 0 260px; background: #fff; border-radius: 0; border: 1px solid #e8e8e4;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 28px 20px;
}
.gauge-label { font-size: 13px; color: #888; font-weight: 500; margin-bottom: 12px; }
.gauge-svg { width: 200px; height: 200px; }
.gauge-ring { position: relative; }
.gauge-center { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); text-align: center; }
.gauge-val { font-size: 36px; font-weight: 800; color: #1a1a1a; line-height: 1; letter-spacing: -1px; }
.gauge-val small { font-size: 14px; font-weight: 500; color: #888; }
.gauge-sub { font-size: 11px; color: #999; margin-top: 6px; display: block; }

.kpi-row { flex: 1; display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; min-width: 0; }
.kpi {
  background: #fff; border: 1px solid #e8e8e4;
  padding: 20px 24px; display: flex; flex-direction: column; gap: 12px;
}
.kpi-top { display: flex; align-items: center; gap: 10px; }
.kpi-icon {
  width: 36px; height: 36px; border-radius: 2px;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; flex-shrink: 0;
}
.kpi-label { font-size: 13px; color: #888; font-weight: 500; }
.kpi-val { font-size: 32px; font-weight: 800; color: #1a1a1a; line-height: 1; letter-spacing: -1px; }
.kpi-val small { font-size: 13px; font-weight: 500; color: #888; margin-left: 4px; }
.kpi-details { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 12px; font-size: 11px; color: #999; }
.kpi-details b { color: #555; font-weight: 600; }

/* Row 2 */
.row2 { display: flex; gap: 20px; margin-bottom: 20px; }
.chart-card { flex: 1; background: #fff; border: 1px solid #e8e8e4; padding: 20px 24px; min-width: 0; }
.card-head { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.card-title { font-size: 14px; font-weight: 700; color: #1a1a1a; margin-right: auto; }
.tabs { display: flex; gap: 2px; }
.tab { padding: 5px 12px; font-size: 12px; color: #999; cursor: pointer; border: 1px solid transparent; transition: all 0.15s; }
.tab:hover { color: #555; }
.tab.on { color: #ff6b00; border-color: #ff6b00; font-weight: 600; }
.chart-wrap { width: 100%; height: 260px; }
.chart-wrap.short { height: 180px; }

.eval-card { flex: 0 0 260px; background: #fff; border: 1px solid #e8e8e4; padding: 20px 24px; }
.eval-list { display: flex; flex-direction: column; gap: 2px; }
.eval-r { display: flex; align-items: center; gap: 12px; padding: 8px 0; }
.e-label { font-size: 12px; color: #888; width: 80px; flex-shrink: 0; text-align: right; }
.e-bar-wrap { flex: 1; height: 6px; background: #f0f0f0; }
.e-bar { height: 100%; background: #555; transition: width 0.5s ease; }
.e-bar.ok { background: #52c41a; }
.e-bar.warn { background: #ff6b00; }
.e-val { font-size: 13px; font-weight: 600; color: #1a1a1a; width: 70px; flex-shrink: 0; }
.e-val.ok { color: #52c41a; }
.e-val.warn { color: #ff6b00; }

/* Row 3 */
.row3 { display: flex; gap: 20px; margin-bottom: 20px; }
.temp-card { flex: 1; background: #fff; border: 1px solid #e8e8e4; padding: 20px 24px; min-width: 0; }
.t-legend { display: flex; gap: 20px; margin-top: 8px; font-size: 12px; color: #888; align-items: center; }
.t-dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 4px; }
.t-dot.ot { background: #ff6b00; }
.t-dot.bl { background: #409EFF; }

.wx-card { flex: 0 0 300px; background: #fff; border: 1px solid #e8e8e4; padding: 20px 24px; }
.wx-list { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; margin-top: 8px; }
.wx-item { text-align: center; padding: 14px 6px; background: #fafaf8; }
.wx-day { font-size: 12px; color: #888; display: block; margin-bottom: 8px; }
.wx-icn { font-size: 28px; display: block; margin-bottom: 8px; }
.wx-t { font-size: 20px; font-weight: 700; color: #1a1a1a; display: block; }
.wx-d { font-size: 11px; color: #aaa; display: block; margin-top: 2px; }

/* Row 4 */
.row4 { display: flex; }
.social-card { flex: 1; background: #fff; border: 1px solid #e8e8e4; padding: 20px 24px; }
.s-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-top: 12px; }
.s-item { text-align: center; padding: 20px; background: #fafaf8; }
.s-icon { font-size: 28px; display: block; margin-bottom: 8px; }
.s-val { font-size: 22px; font-weight: 800; color: #52c41a; letter-spacing: -0.5px; }
.s-val small { font-size: 11px; font-weight: 500; color: #999; margin-left: 3px; }
.s-label { display: block; font-size: 12px; color: #888; margin-top: 6px; }
</style>
