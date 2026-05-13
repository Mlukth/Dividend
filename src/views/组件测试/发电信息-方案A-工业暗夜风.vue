<template>
  <div class="page">
    <!-- Row 1: 仪表盘 + 3 KPI -->
    <div class="row1">
      <div class="gauge-panel">
        <div class="gauge-label">REAL-TIME POWER</div>
        <div class="gauge-ring">
          <svg viewBox="0 0 200 200" class="gauge-svg">
            <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="10"/>
            <circle cx="100" cy="100" r="88" fill="none" stroke="#e6a817" stroke-width="10"
              stroke-dasharray="553" :stroke-dashoffset="553 - 553 * (realPower / totalCap)"
              stroke-linecap="round" transform="rotate(-135 100 100)" style="transition: stroke-dashoffset 1s ease"/>
          </svg>
          <div class="gauge-center">
            <span class="gauge-val">{{ realPower }}<small> kW</small></span>
            <span class="gauge-sub">容量 {{ totalCap }} kWp</span>
          </div>
        </div>
      </div>

      <div class="kpi-panel">
        <div class="kpi-item">
          <div class="kpi-head"><span class="kpi-dot on"></span><span class="kpi-title">当日发电量</span></div>
          <div class="kpi-value">{{ data.todayEnergy }}<small>kWh</small></div>
          <div class="kpi-sub">
            <span>昨日同期 <b>--</b></span>
            <span>累计 <b>{{ data.totalEnergy }} kWh</b></span>
          </div>
        </div>
        <div class="kpi-item">
          <div class="kpi-head"><span class="kpi-dot warn"></span><span class="kpi-title">当日收益</span></div>
          <div class="kpi-value">¥ {{ data.todayProfit }}</div>
          <div class="kpi-sub grid4">
            <span>当年 <b>{{ data.yearProfit }}</b></span>
            <span>累计 <b>{{ data.totalProfit }}</b></span>
            <span>上网 <b>0.4 元</b></span>
            <span>自用 <b>0.6 元</b></span>
          </div>
        </div>
        <div class="kpi-item">
          <div class="kpi-head"><span class="kpi-dot" :class="statusClass"></span><span class="kpi-title">系统状态</span></div>
          <div class="kpi-value status">{{ statusText }}</div>
          <div class="kpi-sub">
            <span>告警 <b class="red">{{ warningCount }}</b></span>
            <span>逆变器 <b>{{ inverterOnline }}/{{ inverterTotal }}</b></span>
            <span>满发 <b>{{ data.equivalentHours }}h</b></span>
            <span>功率比 <b>{{ data.powerRatio }}%</b></span>
          </div>
        </div>
      </div>
    </div>

    <!-- Row 2: 趋势图 + 评估 -->
    <div class="row2">
      <div class="chart-panel">
        <div class="panel-head">
          <span class="panel-title">POWER TREND</span>
          <div class="panel-tools">
            <span class="tab" v-for="t in ['day','month','year','total']" :key="t" :class="{ on: dateType === t }" @click="dateType = t">{{ t === 'day' ? '日' : t === 'month' ? '月' : t === 'year' ? '年' : '总' }}</span>
          </div>
        </div>
        <div class="chart-box" ref="trendRef"></div>
      </div>

      <div class="eval-panel">
        <div class="panel-head"><span class="panel-title">EVALUATION</span></div>
        <div class="eval-list">
          <div class="eval-r" v-for="e in evalData" :key="e.label">
            <span class="el">{{ e.label }}</span>
            <span class="ev" :class="e.cls">{{ e.value }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Row 3: 温度 + 天气 -->
    <div class="row3">
      <div class="temp-panel">
        <div class="panel-head">
          <span class="panel-title">TEMPERATURE</span>
          <span class="tab" :class="{ on: tempType === 'day' }" @click="tempType = 'day'">日</span>
          <span class="tab" :class="{ on: tempType === 'week' }" @click="tempType = 'week'">周</span>
        </div>
        <div class="chart-box short" ref="tempRef"></div>
        <div class="temp-legend">
          <span><i class="ld ot"></i>组件 {{ temp.moduleTemp }}°C</span>
          <span><i class="ld bl"></i>环境 {{ temp.envTemp }}°C</span>
        </div>
      </div>

      <div class="weather-panel">
        <div class="panel-head"><span class="panel-title">WEATHER</span></div>
        <div class="wx-grid">
          <div class="wx-day" v-for="w in weather" :key="w.label">
            <span class="wx-label">{{ w.label }}</span>
            <span class="wx-icon">{{ w.icon }}</span>
            <span class="wx-temp">{{ w.temp }}°</span>
            <span class="wx-desc">{{ w.desc }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Row 4: 社会贡献 -->
    <div class="row4">
      <div class="social-panel">
        <div class="panel-head"><span class="panel-title">SOCIAL IMPACT</span></div>
        <div class="social-grid">
          <div class="social-item" v-for="s in social" :key="s.label">
            <span class="s-val">{{ s.value }}</span>
            <span class="s-unit">{{ s.unit }}</span>
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
const statusText = ref('RUNNING')
const statusClass = ref('on')
const warningCount = ref(2)
const inverterOnline = ref(7)
const inverterTotal = ref(9)
const dateType = ref('day')
const tempType = ref('day')
const trendRef = ref(null)
const tempRef = ref(null)

const data = ref({
  todayEnergy: '1,250', todayProfit: '500.00', yearProfit: '78,000', totalProfit: '312,000',
  totalEnergy: '1,280,000', equivalentHours: '5.2', powerRatio: '37.3'
})

const evalData = [
  { label: '综合效率', value: '87.3%', cls: '' },
  { label: '等效利用小时', value: '5.2 h', cls: '' },
  { label: '性能比 PR', value: '82.6%', cls: '' },
  { label: '故障损失', value: '0.12 kWh', cls: 'warn' },
  { label: '可用率', value: '99.2%', cls: 'ok' },
]

const temp = ref({ moduleTemp: '45.2', envTemp: '24.5' })
const weather = [
  { label: '今天', icon: '☀️', temp: '32', desc: '晴' },
  { label: '明天', icon: '⛅', temp: '28', desc: '多云' },
  { label: '后天', icon: '🌧️', temp: '24', desc: '小雨' },
]
const social = [
  { value: '768', unit: '吨', label: 'CO₂减排' },
  { value: '155', unit: '吨', label: '标煤节约' },
  { value: '12,672', unit: '棵', label: '等效植树' },
  { value: '1,280,000', unit: 'kWh', label: '绿色发电' },
]

const makeTrendChart = (dom) => {
  const c = echarts.init(dom)
  c.setOption({
    backgroundColor: 'transparent',
    grid: { left: 10, right: 20, top: 20, bottom: 10 },
    xAxis: { type: 'category', data: ['00:00','02:00','04:00','06:00','08:00','10:00','12:00','14:00','16:00','18:00','20:00','22:00'], axisLine: { lineStyle: { color: '#333' } }, axisLabel: { color: '#555', fontSize: 10 } },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } }, axisLabel: { color: '#555', fontSize: 10 } },
    series: [{ type: 'line', data: [0,0,0,0,220,780,1200,980,650,320,0,0], smooth: true, symbol: 'none', lineStyle: { color: '#e6a817', width: 2 }, areaStyle: { color: new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:'rgba(230,168,23,0.15)'},{offset:1,color:'rgba(230,168,23,0)'}]) } }]
  })
  return c
}

const makeTempChart = (dom) => {
  const c = echarts.init(dom)
  c.setOption({
    backgroundColor: 'transparent',
    grid: { left: 10, right: 10, top: 10, bottom: 5 },
    xAxis: { type: 'category', data: ['00:00','02:00','04:00','06:00','08:00','10:00','12:00','14:00','16:00','18:00','20:00','22:00'], axisLine: { show: false }, axisLabel: { color: '#555', fontSize: 9 } },
    yAxis: { type: 'value', min: 0, max: 60, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)', type: 'dashed' } }, axisLabel: { color: '#555', fontSize: 9 } },
    series: [
      { type: 'line', data: [18,17,16,17,25,35,45,48,42,35,26,20], smooth: true, symbol: 'none', lineStyle: { color: '#ff6b00', width: 1.5 } },
      { type: 'line', data: [15,14,13,14,20,25,28,30,27,23,18,16], smooth: true, symbol: 'none', lineStyle: { color: '#409EFF', width: 1.5 } },
    ]
  })
  return c
}

onMounted(async () => {
  await nextTick()
  makeTrendChart(trendRef.value)
  makeTempChart(tempRef.value)
})
</script>

<style scoped>
/* ===== 工业暗夜风 — SCADA 美学 ===== */
.page {
  width: 100%; min-height: calc(100vh - 60px);
  background: #0d1117;
  padding: 20px 24px; box-sizing: border-box;
  font-family: "JetBrains Mono", "Consolas", "Microsoft YaHei", monospace;
  color: #c0c0c0;
}

/* Row 1 */
.row1 { display: flex; gap: 16px; margin-bottom: 16px; }
.gauge-panel {
  flex: 0 0 280px; background: #161b22; border: 1px solid rgba(255,255,255,0.05);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 24px 16px;
}
.gauge-label { font-size: 10px; color: #484f58; letter-spacing: 3px; margin-bottom: 16px; }
.gauge-svg { width: 200px; height: 200px; }
.gauge-ring { position: relative; }
.gauge-center { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); text-align: center; }
.gauge-val { font-size: 32px; font-weight: 700; color: #e6a817; line-height: 1; }
.gauge-val small { font-size: 14px; font-weight: 400; color: #666; }
.gauge-sub { font-size: 10px; color: #484f58; margin-top: 4px; }

.kpi-panel { flex: 1; display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; min-width: 0; }
.kpi-item {
  background: #161b22; border: 1px solid rgba(255,255,255,0.05);
  padding: 16px 20px; display: flex; flex-direction: column; gap: 8px;
}
.kpi-head { display: flex; align-items: center; gap: 8px; }
.kpi-dot { width: 6px; height: 6px; flex-shrink: 0; }
.kpi-dot.on { background: #3cba54; }
.kpi-dot.warn { background: #e6a817; }
.kpi-title { font-size: 10px; color: #666; letter-spacing: 1px; }
.kpi-value { font-size: 28px; font-weight: 700; color: #e0e0e0; line-height: 1; }
.kpi-value small { font-size: 12px; color: #555; margin-left: 4px; }
.kpi-value.status { font-size: 20px; color: #3cba54; letter-spacing: 2px; }
.kpi-sub { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 16px; font-size: 10px; color: #555; }
.kpi-sub.grid4 { grid-template-columns: 1fr 1fr; }
.kpi-sub b { color: #999; font-weight: 600; }
.red { color: #db4437 !important; }

/* Row 2 */
.row2 { display: flex; gap: 16px; margin-bottom: 16px; }
.chart-panel {
  flex: 1; background: #161b22; border: 1px solid rgba(255,255,255,0.05);
  padding: 16px 20px; min-width: 0;
}
.panel-head { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.panel-title { font-size: 10px; color: #484f58; letter-spacing: 3px; margin-right: auto; }
.panel-tools { display: flex; gap: 0; }
.tab {
  padding: 4px 10px; font-size: 10px; color: #484f58; cursor: pointer;
  border: 1px solid transparent; transition: all 0.15s;
}
.tab:hover { color: #999; }
.tab.on { color: #e6a817; border-color: rgba(230,168,23,0.3); }
.chart-box { width: 100%; height: 240px; }
.chart-box.short { height: 160px; }

.eval-panel {
  flex: 0 0 220px; background: #161b22; border: 1px solid rgba(255,255,255,0.05);
  padding: 16px 20px;
}
.eval-list { display: flex; flex-direction: column; }
.eval-r { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.03); }
.eval-r:last-child { border-bottom: none; }
.el { font-size: 10px; color: #555; }
.ev { font-size: 14px; font-weight: 700; color: #c0c0c0; }
.ev.warn { color: #e6a817; }
.ev.ok { color: #3cba54; }

/* Row 3 */
.row3 { display: flex; gap: 16px; margin-bottom: 16px; }
.temp-panel { flex: 1; background: #161b22; border: 1px solid rgba(255,255,255,0.05); padding: 16px 20px; min-width: 0; }
.temp-legend { display: flex; gap: 24px; margin-top: 8px; font-size: 10px; color: #666; }
.ld { display: inline-block; width: 8px; height: 8px; margin-right: 4px; vertical-align: middle; }
.ld.ot { background: #ff6b00; }
.ld.bl { background: #409EFF; }

.weather-panel { flex: 0 0 280px; background: #161b22; border: 1px solid rgba(255,255,255,0.05); padding: 16px 20px; }
.wx-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; margin-top: 8px; }
.wx-day { text-align: center; padding: 12px 4px; background: rgba(255,255,255,0.015); }
.wx-label { font-size: 10px; color: #555; display: block; margin-bottom: 4px; }
.wx-icon { font-size: 24px; display: block; margin-bottom: 4px; }
.wx-temp { font-size: 18px; font-weight: 700; color: #c0c0c0; display: block; }
.wx-desc { font-size: 10px; color: #555; display: block; }

/* Row 4 */
.row4 { display: flex; }
.social-panel { flex: 1; background: #161b22; border: 1px solid rgba(255,255,255,0.05); padding: 16px 24px; }
.social-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-top: 12px; }
.social-item { text-align: center; padding: 16px; background: rgba(255,255,255,0.015); }
.s-val { font-size: 24px; font-weight: 700; color: #3cba54; }
.s-unit { font-size: 11px; color: #555; margin-left: 2px; }
.s-label { display: block; font-size: 10px; color: #555; margin-top: 6px; }
</style>
