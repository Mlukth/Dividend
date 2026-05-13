<template>
  <div class="page">
    <div class="sun-glow"></div>

    <!-- Row 1: 仪表盘 + 3 KPI -->
    <div class="row1">
      <div class="gauge-panel">
        <div class="gauge-label">实时功率</div>
        <div class="gauge-ring">
          <svg viewBox="0 0 200 200" class="gauge-svg">
            <defs>
              <radialGradient id="sunGrad" cx="30%" cy="30%">
                <stop offset="0%" stop-color="#f5a623" stop-opacity="0.25"/>
                <stop offset="100%" stop-color="#f5a623" stop-opacity="0.02"/>
              </radialGradient>
            </defs>
            <circle cx="100" cy="100" r="95" fill="url(#sunGrad)"/>
            <circle cx="100" cy="100" r="82" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="8"/>
            <circle cx="100" cy="100" r="82" fill="none" stroke="#f5a623" stroke-width="8"
              stroke-dasharray="515" :stroke-dashoffset="515 - 515 * (realPower / totalCap)"
              stroke-linecap="round" transform="rotate(-135 100 100)" style="transition: stroke-dashoffset 1.2s ease"/>
          </svg>
          <div class="gauge-center">
            <span class="gauge-val">{{ realPower }}</span>
            <span class="gauge-unit">kW</span>
            <span class="gauge-sub">组件总容量 {{ totalCap }} kWp</span>
          </div>
        </div>
      </div>

      <div class="kpi-row">
        <div class="kpi sun">
          <div class="kpi-glow"></div>
          <span class="kpi-icon">☀️</span>
          <div class="kpi-body">
            <span class="kpi-label">当日发电量</span>
            <span class="kpi-val">1,250 <small>kWh</small></span>
            <div class="kpi-meta">
              <span>累计发电 <b>1,280,000 kWh</b></span>
            </div>
          </div>
        </div>
        <div class="kpi leaf">
          <div class="kpi-glow"></div>
          <span class="kpi-icon">💰</span>
          <div class="kpi-body">
            <span class="kpi-label">当日收益</span>
            <span class="kpi-val">¥ 500.00</span>
            <div class="kpi-meta">
              <span>当年 <b>78,000</b></span>
              <span>累计 <b>312,000</b></span>
              <span>上网价 <b>0.4</b></span>
              <span>自用价 <b>0.6</b></span>
            </div>
          </div>
        </div>
        <div class="kpi pulse" :class="statusClass">
          <div class="kpi-glow"></div>
          <span class="kpi-icon">{{ statusClass === 'on' ? '🟢' : '🔴' }}</span>
          <div class="kpi-body">
            <span class="kpi-label">系统运行状态</span>
            <span class="kpi-val status">{{ statusText }}</span>
            <div class="kpi-meta">
              <span>告警 <b class="r">2</b></span>
              <span>逆变器 <b>7/9</b></span>
              <span>满发 <b>5.2h</b></span>
              <span>功率比 <b>37.3%</b></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Row 2: 趋势图 + 评估 -->
    <div class="row2">
      <div class="chart-card">
        <div class="card-head">
          <span class="card-title">📈 发电功率趋势</span>
          <div class="tabs">
            <span v-for="t in tabs" :key="t.key" class="tab" :class="{ on: dateType === t.key }" @click="dateType = t.key">{{ t.label }}</span>
          </div>
        </div>
        <div class="chart-wrap" ref="trendRef"></div>
      </div>

      <div class="eval-card">
        <div class="card-head"><span class="card-title">🎯 电站评估</span></div>
        <div class="eval-list">
          <div class="eval-r" v-for="e in evalData" :key="e.label">
            <span class="e-label">{{ e.label }}</span>
            <div class="e-ring-wrap">
              <svg viewBox="0 0 40 40" class="e-ring">
                <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="4"/>
                <circle cx="20" cy="20" r="16" fill="none" :stroke="e.cls === 'warn' ? '#f5a623' : e.cls === 'ok' ? '#4caf50' : '#7eb8da'" stroke-width="4"
                  :stroke-dasharray="100.5" :stroke-dashoffset="100.5 - 100.5 * e.pct / 100"
                  stroke-linecap="round" transform="rotate(-90 20 20)"/>
              </svg>
              <span class="e-ring-val">{{ e.value }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Row 3: 温度 + 天气 -->
    <div class="row3">
      <div class="temp-card">
        <div class="card-head">
          <span class="card-title">🌡️ 温度监测</span>
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
        <div class="card-head"><span class="card-title">🌤️ 天气预报</span></div>
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
      <div class="social-card">
        <div class="card-head"><span class="card-title">🌱 社会贡献</span></div>
        <div class="s-grid">
          <div class="s-item" v-for="s in social" :key="s.label">
            <span class="s-leaf">{{ s.icon }}</span>
            <div class="s-data">
              <span class="s-val">{{ s.value }}<small>{{ s.unit }}</small></span>
              <span class="s-label">{{ s.label }}</span>
            </div>
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
const statusText = ref('运行中')
const statusClass = ref('on')
const dateType = ref('day')
const tempType = ref('day')
const trendRef = ref(null)
const tempRef = ref(null)

const tabs = [
  { key: 'day', label: '日' }, { key: 'month', label: '月' }, { key: 'year', label: '年' }, { key: 'total', label: '累计' }
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
    xAxis: { type: 'category', data: ['00:00','02:00','04:00','06:00','08:00','10:00','12:00','14:00','16:00','18:00','20:00','22:00'], axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: 'rgba(200,214,192,0.5)', fontSize: 11 } },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } }, axisLabel: { color: 'rgba(200,214,192,0.5)', fontSize: 11 } },
    series: [{ type: 'line', data: [0,0,0,0,220,780,1200,980,650,320,0,0], smooth: true, symbol: 'none', lineStyle: { color: '#f5a623', width: 2.5, shadowBlur: 8, shadowColor: 'rgba(245,166,35,0.3)' }, areaStyle: { color: new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:'rgba(245,166,35,0.12)'},{offset:1,color:'rgba(245,166,35,0)'}]) } }]
  })
  const t2 = echarts.init(tempRef.value)
  t2.setOption({
    backgroundColor: 'transparent',
    grid: { left: 8, right: 8, top: 8, bottom: 4 },
    xAxis: { type: 'category', data: ['00:00','02:00','04:00','06:00','08:00','10:00','12:00','14:00','16:00','18:00','20:00','22:00'], axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: 'rgba(200,214,192,0.4)', fontSize: 10 } },
    yAxis: { type: 'value', min: 0, max: 60, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)', type: 'dashed' } }, axisLabel: { color: 'rgba(200,214,192,0.4)', fontSize: 10 } },
    series: [
      { type: 'line', data: [18,17,16,17,25,35,45,48,42,35,26,20], smooth: true, symbol: 'none', lineStyle: { color: '#ff6b00', width: 1.5 } },
      { type: 'line', data: [15,14,13,14,20,25,28,30,27,23,18,16], smooth: true, symbol: 'none', lineStyle: { color: '#7eb8da', width: 1.5 } },
    ]
  })
})
</script>

<style scoped>
/* ===== 自然叙事风 — 光伏能源美学 ===== */
.page {
  width: 100%; min-height: calc(100vh - 60px);
  background: linear-gradient(175deg, #0d2216 0%, #13261a 40%, #0d2216 100%);
  padding: 24px 28px; box-sizing: border-box;
  font-family: "Microsoft YaHei", sans-serif;
  color: #c8d6c0;
  position: relative; overflow: hidden;
}
.sun-glow {
  position: absolute; top: -120px; right: -80px;
  width: 360px; height: 360px; border-radius: 50%;
  background: radial-gradient(circle, rgba(245,166,35,0.1) 0%, rgba(245,166,35,0.04) 40%, transparent 70%);
  pointer-events: none;
}

/* Row 1 */
.row1 { display: flex; gap: 20px; margin-bottom: 20px; position: relative; z-index: 1; }
.gauge-panel {
  flex: 0 0 260px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05);
  border-radius: 16px; backdrop-filter: blur(8px);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 28px 20px;
}
.gauge-label { font-size: 12px; color: rgba(200,214,192,0.5); margin-bottom: 8px; letter-spacing: 1px; }
.gauge-svg { width: 200px; height: 200px; }
.gauge-ring { position: relative; }
.gauge-center { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); text-align: center; }
.gauge-val { font-size: 36px; font-weight: 700; color: #f5a623; line-height: 1; }
.gauge-unit { font-size: 13px; color: rgba(245,166,35,0.6); display: block; }
.gauge-sub { font-size: 10px; color: rgba(200,214,192,0.35); margin-top: 6px; display: block; }

.kpi-row { flex: 1; display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; min-width: 0; }
.kpi {
  position: relative; overflow: hidden;
  background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05);
  border-radius: 16px; backdrop-filter: blur(8px);
  padding: 20px 24px; display: flex; flex-direction: column; gap: 12px;
}
.kpi-glow { position: absolute; top: -30px; right: -30px; width: 120px; height: 120px; border-radius: 50%; pointer-events: none; }
.kpi.sun .kpi-glow { background: radial-gradient(circle, rgba(245,166,35,0.12), transparent 70%); }
.kpi.leaf .kpi-glow { background: radial-gradient(circle, rgba(76,175,80,0.1), transparent 70%); }
.kpi.pulse .kpi-glow { background: radial-gradient(circle, rgba(126,184,218,0.1), transparent 70%); }
.kpi.pulse.off .kpi-glow { background: radial-gradient(circle, rgba(255,82,82,0.08), transparent 70%); }

.kpi-icon { font-size: 24px; }
.kpi-body { display: flex; flex-direction: column; gap: 6px; position: relative; z-index: 1; }
.kpi-label { font-size: 12px; color: rgba(200,214,192,0.5); }
.kpi-val { font-size: 28px; font-weight: 700; color: #d4e4c8; line-height: 1; }
.kpi-val small { font-size: 12px; color: rgba(200,214,192,0.4); }
.kpi-val.status { color: #4caf50; font-size: 22px; }
.kpi.pulse.off .kpi-val.status { color: #ff5252; }
.kpi-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 2px 12px; font-size: 10px; color: rgba(200,214,192,0.35); }
.kpi-meta b { color: rgba(200,214,192,0.6); font-weight: 600; }
.kpi-meta .r { color: #ff5252; }

/* Row 2 */
.row2 { display: flex; gap: 20px; margin-bottom: 20px; position: relative; z-index: 1; }
.chart-card {
  flex: 1; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05);
  border-radius: 16px; backdrop-filter: blur(8px); padding: 20px 24px; min-width: 0;
}
.card-head { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.card-title { font-size: 14px; font-weight: 600; color: #d4e4c8; margin-right: auto; }
.tabs { display: flex; gap: 2px; }
.tab { padding: 5px 12px; font-size: 11px; color: rgba(200,214,192,0.35); cursor: pointer; border-radius: 20px; transition: all 0.15s; }
.tab:hover { color: rgba(200,214,192,0.6); }
.tab.on { color: #f5a623; background: rgba(245,166,35,0.1); }
.chart-wrap { width: 100%; height: 260px; }
.chart-wrap.short { height: 180px; }

.eval-card {
  flex: 0 0 280px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05);
  border-radius: 16px; backdrop-filter: blur(8px); padding: 20px 24px;
}
.eval-list { display: flex; flex-direction: column; gap: 4px; }
.eval-r { display: flex; align-items: center; gap: 12px; padding: 6px 0; }
.e-label { font-size: 11px; color: rgba(200,214,192,0.5); flex: 1; }
.e-ring-wrap { position: relative; width: 40px; height: 40px; flex-shrink: 0; }
.e-ring { width: 40px; height: 40px; }
.e-ring-val { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); font-size: 9px; font-weight: 700; color: #d4e4c8; white-space: nowrap; }

/* Row 3 */
.row3 { display: flex; gap: 20px; margin-bottom: 20px; position: relative; z-index: 1; }
.temp-card {
  flex: 1; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05);
  border-radius: 16px; backdrop-filter: blur(8px); padding: 20px 24px; min-width: 0;
}
.t-legend { display: flex; gap: 20px; margin-top: 8px; font-size: 11px; color: rgba(200,214,192,0.5); align-items: center; }
.t-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 4px; }
.t-dot.ot { background: #ff6b00; }
.t-dot.bl { background: #7eb8da; }

.wx-card {
  flex: 0 0 300px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05);
  border-radius: 16px; backdrop-filter: blur(8px); padding: 20px 24px;
}
.wx-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; margin-top: 8px; }
.wx-day { text-align: center; padding: 14px 6px; background: rgba(255,255,255,0.015); border-radius: 12px; }
.wx-label { font-size: 11px; color: rgba(200,214,192,0.4); display: block; margin-bottom: 6px; }
.wx-icon { font-size: 26px; display: block; margin-bottom: 6px; }
.wx-temp { font-size: 18px; font-weight: 700; color: #d4e4c8; display: block; }
.wx-desc { font-size: 10px; color: rgba(200,214,192,0.35); display: block; margin-top: 2px; }

/* Row 4 */
.row4 { display: flex; position: relative; z-index: 1; }
.social-card {
  flex: 1; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05);
  border-radius: 16px; backdrop-filter: blur(8px); padding: 20px 24px;
}
.s-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-top: 12px; }
.s-item { text-align: center; padding: 20px 10px; background: rgba(255,255,255,0.015); border-radius: 12px; }
.s-leaf { font-size: 28px; display: block; margin-bottom: 8px; }
.s-data { display: flex; flex-direction: column; gap: 4px; }
.s-val { font-size: 20px; font-weight: 700; color: #4caf50; }
.s-val small { font-size: 10px; color: rgba(200,214,192,0.35); margin-left: 2px; }
.s-label { font-size: 11px; color: rgba(200,214,192,0.4); }
</style>
