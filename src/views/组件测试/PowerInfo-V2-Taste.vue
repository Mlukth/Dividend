<template>
  <div class="pi-outer">
    <!-- ====== 行1: 仪表盘 + KPI卡片 ====== -->
    <div class="row row-top">
      <div class="gauge-card">
        <div class="gauge-ring">
          <svg viewBox="0 0 160 100" class="gauge-svg">
            <path d="M20 90 A60 60 0 0 1 140 90" fill="none" stroke="#E5E7EB" stroke-width="10" stroke-linecap="round"/>
            <path d="M20 90 A60 60 0 0 1 140 90" fill="none" stroke="url(#gGrad)" stroke-width="10" stroke-linecap="round"
              stroke-dasharray="188 188" :stroke-dashoffset="188 - 188 * 0.72" />
            <defs>
              <linearGradient id="gGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stop-color="var(--c-blue)"/>
                <stop offset="100%" stop-color="var(--c-sky)"/>
              </linearGradient>
            </defs>
          </svg>
          <div class="gauge-center">
            <span class="gauge-num">{{ powerData.realTimePower }}</span>
            <span class="gauge-unit">kW</span>
          </div>
        </div>
        <div class="gauge-label">实时功率</div>
        <div class="gauge-sub">容量 {{ powerData.capacity }} kWp</div>
      </div>

      <div class="kpi-row">
        <div class="kpi-card">
          <div class="kpi-hd">当日发电量</div>
          <div class="kpi-num">{{ powerData.todayEnergy }}<small>kWh</small></div>
          <div class="kpi-foot">
            <span>较昨日同期 <b>--</b></span>
            <span>累计 <b>{{ powerData.totalEnergy }} kWh</b></span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-hd">当日收益</div>
          <div class="kpi-num gold">¥{{ powerData.todayProfit }}</div>
          <div class="kpi-foot quad">
            <span>当年 <b>{{ powerData.yearProfit }} 元</b></span>
            <span>累计 <b>{{ powerData.totalProfit }} 元</b></span>
            <span>上网电价 <b>0.4 元/kWh</b></span>
            <span>自用电价 <b>0.6 元/kWh</b></span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-hd">系统运行状态</div>
          <div class="kpi-status">
            <span class="kpi-dot live"></span>
            <span class="kpi-state">运行中</span>
          </div>
          <div class="kpi-foot">
            <span>告警 <b class="warn">{{ powerData.warningCount }}</b></span>
            <span>逆变器 <b>{{ powerData.inverterOnline }}/{{ powerData.inverterTotal }}</b></span>
            <span>日满发小时 <b>{{ powerData.equivalentHours }} h</b></span>
            <span>功率占比 <b>{{ powerData.powerRatio }}%</b></span>
          </div>
        </div>
      </div>
    </div>

    <!-- ====== 行2: 功率趋势 + 电站评估（无边框面板） ====== -->
    <div class="row row-mid">
      <div class="panel chart-panel">
        <div class="panel-bar">
          <span class="bar-title">发电功率趋势</span>
          <div class="tabs">
            <span v-for="t in ['day','month','year','total']" :key="t"
              class="tab" :class="{ on: dateType === t }" @click="dateType = t"
            >{{ {day:'日',month:'月',year:'年',total:'总'}[t] }}</span>
          </div>
        </div>
        <div class="chart-body">
          <div class="bar-chart">
            <div class="bar-col" v-for="(v, i) in chartData.bars" :key="i">
              <div class="bar-val">{{ v > 0 ? v : '' }}</div>
              <div class="bar-fill" :style="{ height: (v / chartData.max * 100) + '%' }">
                <div class="bar-glow"></div>
              </div>
              <span class="bar-x">{{ chartData.labels[i] }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="panel eval-panel">
        <div class="panel-bar">
          <span class="bar-title">电站评估</span>
        </div>
        <div class="eval-body">
          <div class="eval-row" v-for="e in evalItems" :key="e.label">
            <span class="e-label">{{ e.label }}</span>
            <span class="e-track"><span class="e-bar" :style="{ width: e.pct+'%', background: e.color }"></span></span>
            <span class="e-val" :style="{ color: e.color }">{{ e.value }}{{ e.unit }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ====== 行3: 温度监测 + 天气预报胶囊 ====== -->
    <div class="row row-mid">
      <div class="panel temp-panel">
        <div class="panel-bar">
          <span class="bar-title">温度监测</span>
          <div class="tabs">
            <span class="tab" :class="{ on: tempType==='day' }" @click="tempType='day'">日</span>
            <span class="tab" :class="{ on: tempType==='week' }" @click="tempType='week'">周</span>
          </div>
        </div>
        <div class="temp-body">
          <svg viewBox="0 0 400 100" class="temp-svg" preserveAspectRatio="none">
            <line v-for="i in 5" :key="'g'+i" :x1="0" :y1="i*20" :x2="400" :y2="i*20" stroke="#F3F4F6" stroke-width="1" stroke-dasharray="3 3"/>
            <polyline :points="tempLine" fill="none" stroke="#F59E0B" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linecap="round"/>
            <polyline :points="tempLine2" fill="none" stroke="var(--c-blue)" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linecap="round"/>
          </svg>
          <div class="temp-legend">
            <span><i class="t-dot" style="background:#F59E0B"></i>组件 {{ tempData.moduleTemp }}°C</span>
            <span><i class="t-dot" style="background:var(--c-blue)"></i>环境 {{ tempData.envTemp }}°C</span>
          </div>
        </div>
      </div>

      <div class="weather-capsules">
        <span class="wx-head">天气预报</span>
        <div class="wx-row">
          <div class="wx-cap" v-for="w in weather" :key="w.label">
            <span class="wx-icon">{{ w.icon }}</span>
            <span class="wx-temp">{{ w.temp }}°</span>
            <span class="wx-label">{{ w.label }}</span>
            <span class="wx-desc">{{ w.desc }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ====== 行4: 社会贡献横条 ====== -->
    <div class="social-strip">
      <span class="soc-head">社会贡献</span>
      <div class="soc-row">
        <div class="soc-item" v-for="s in social" :key="s.label">
          <span class="soc-icon">{{ s.icon }}</span>
          <div class="soc-data">
            <span class="soc-num">{{ s.value }}<small>{{ s.unit }}</small></span>
            <span class="soc-label">{{ s.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

const dateType = ref('day')
const tempType = ref('day')

const powerData = reactive({
  capacity: 5200, realTimePower: 3748, todayEnergy: '18,240', todayProfit: '7,296',
  totalEnergy: '2,450,000', totalProfit: '980,000', yearProfit: '185,000',
  equivalentHours: 4.2, powerRatio: 72.1, warningCount: 3, inverterOnline: 45, inverterTotal: 48,
})

const chartData = computed(() => {
  const map = {
    day: { labels: ['00','02','04','06','08','10','12','14','16','18','20','22'], bars: [0,0,0,0,220,780,1200,980,650,320,0,0], max: 1200 },
    month: { labels: ['1日','5日','10日','15日','20日','25日','30日'], bars: [4200,4800,5100,3900,4600,5200,4500], max: 5200 },
    year: { labels: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'], bars: [120,135,158,175,198,220,245,238,195,165,140,118], max: 245 },
    total: { labels: ['2022','2023','2024','2025','2026'], bars: [850,920,980,1050,972], max: 1050 },
  }
  return map[dateType.value]
})

const evalItems = [
  { label: '综合效率', value: 92.5, unit: '%', pct: 92.5, color: 'var(--c-blue)' },
  { label: '等效利用小时', value: 4.2, unit: ' h', pct: 70, color: 'var(--c-sky)' },
  { label: '性能比 PR', value: 85.3, unit: '%', pct: 85.3, color: 'var(--c-green)' },
  { label: '故障损失', value: 125, unit: ' kWh', pct: 12, color: 'var(--c-red)' },
  { label: '可用率', value: 99.2, unit: '%', pct: 99.2, color: 'var(--c-green)' },
]

const tempLine = '0,80 40,75 80,70 120,68 160,55 200,45 240,48 280,52 320,58 360,65 400,72'
const tempLine2 = '0,60 40,55 80,50 120,48 160,38 200,28 240,30 280,32 320,38 360,45 400,48'
const tempData = reactive({ moduleTemp: 45.2, envTemp: 24.5 })

const weather = [
  { label: '今天', icon: '☀️', temp: 32, desc: '晴' },
  { label: '明天', icon: '⛅', temp: 28, desc: '多云' },
  { label: '后天', icon: '🌧️', temp: 24, desc: '小雨' },
]

const social = [
  { icon: '🌲', label: 'CO₂减排', value: '4,850', unit: '吨' },
  { icon: '⛏️', label: '标煤节约', value: '1,820', unit: '吨' },
  { icon: '🌳', label: '等效植树', value: '12,400', unit: '棵' },
  { icon: '⚡', label: '绿色发电', value: '2,450', unit: 'MWh' },
]
</script>

<style scoped>
/* ============================================
   PowerInfo V2 — Industrial Precision
   工业感 · 无阴影 · 刻线分隔 · 等宽数字主导
   ============================================ */
.pi-outer {
  --c-bg: #F2F3F5;
  --c-white: #FFFFFF;
  --c-ink: #0B1622;
  --c-body: #4A5568;
  --c-muted: #8899AA;
  --c-line: #E2E6EA;
  --c-blue: #0055A4;
  --c-sky: #1E88E5;
  --c-green: #0D9448;
  --c-red: #DC3838;
  --font: "Microsoft YaHei", "PingFang SC", -apple-system, sans-serif;
  --mono: "JetBrains Mono", "Fira Code", monospace;

  font-family: var(--font); font-size: 13px; color: var(--c-body);
  background: var(--c-bg);
  padding: 16px; display: flex; flex-direction: column; gap: 14px; min-height: 100%;
}

.row { display: flex; gap: 14px; align-items: stretch; }

/* ====== 仪表盘 — 工业风 ====== */
.gauge-card {
  background: var(--c-white); border: 1px solid var(--c-line);
  width: 210px; flex-shrink: 0;
  display: flex; flex-direction: column; align-items: center; padding: 22px 16px 16px; gap: 6px;
}
.gauge-ring { position: relative; width: 160px; height: 100px; }
.gauge-svg { display: block; }
.gauge-center { position: absolute; bottom: 0; left: 0; right: 0; text-align: center; }
.gauge-num { font-size: 34px; font-weight: 700; color: var(--c-ink); font-family: var(--mono); line-height: 1; letter-spacing: -1px; }
.gauge-unit { font-size: 13px; color: var(--c-muted); margin-left: 2px; }
.gauge-label { font-size: 11px; color: var(--c-muted); text-transform: uppercase; letter-spacing: 1px; }
.gauge-sub { font-size: 11px; color: var(--c-muted); }

/* ====== KPI — 边框替代阴影 ====== */
.kpi-row { flex: 1; display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; }
.kpi-card {
  background: var(--c-white); border: 1px solid var(--c-line);
  padding: 20px; display: flex; flex-direction: column; gap: 10px;
  margin-left: -1px;
  transition: background 0.15s;
}
.kpi-card:hover { background: #FAFBFC; }
.kpi-card:first-child { margin-left: 0; }
.kpi-hd { font-size: 11px; color: var(--c-muted); text-transform: uppercase; letter-spacing: 0.8px; font-weight: 600; }
.kpi-num { font-size: 30px; font-weight: 700; color: var(--c-ink); font-family: var(--mono); line-height: 1; letter-spacing: -1px; }
.kpi-num small { font-size: 12px; font-weight: 400; color: var(--c-muted); margin-left: 3px; letter-spacing: 0; }
.kpi-num.gold { color: #9A6718; }
.kpi-foot { display: grid; grid-template-columns: 1fr 1fr; gap: 3px 12px; }
.kpi-foot.quad { grid-template-columns: 1fr 1fr; }
.kpi-foot span { font-size: 10px; color: var(--c-muted); }
.kpi-foot b { font-size: 12px; color: var(--c-body); font-weight: 600; }
.kpi-foot b.warn { color: var(--c-red); }

.kpi-status { display: flex; align-items: center; gap: 8px; }
.kpi-dot { width: 10px; height: 10px; border-radius: 50%; }
.kpi-dot.live { background: var(--c-green); animation: breathe 2s ease-in-out infinite; }
@keyframes breathe { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
.kpi-state { font-size: 16px; font-weight: 700; color: var(--c-green); }

/* ====== 面板 — 1px边框 + 刻线 ====== */
.panel { background: var(--c-white); border: 1px solid var(--c-line); overflow: hidden; }
.panel-bar { display: flex; justify-content: space-between; align-items: center; padding: 14px 20px; border-bottom: 1px solid var(--c-line); }
.bar-title { font-size: 12px; font-weight: 700; color: var(--c-ink); text-transform: uppercase; letter-spacing: 1px; }

.tabs { display: flex; gap: 0; }
.tab {
  padding: 4px 12px; font-size: 11px; cursor: pointer; color: var(--c-muted);
  border: 1px solid var(--c-line); margin-left: -1px; font-weight: 500;
  transition: all 0.15s; user-select: none;
}
.tab:first-child { margin-left: 0; }
.tab:hover { color: var(--c-body); background: #F8FAFB; }
.tab.on { background: var(--c-blue); color: #fff; border-color: var(--c-blue); }

/* ====== 柱状图 — 带数值标注 ====== */
.chart-panel { flex: 1; }
.chart-body { padding: 16px 20px 4px; height: 210px; }
.bar-chart { display: flex; align-items: flex-end; gap: 2px; height: 100%; padding-bottom: 22px; position: relative; }
.bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end; }
.bar-val { font-size: 9px; color: var(--c-muted); margin-bottom: 4px; font-family: var(--mono); }
.bar-fill {
  width: 100%; max-width: 36px; min-height: 2px; position: relative;
  background: var(--c-blue); transition: height 0.4s ease;
}
.bar-glow { position: absolute; top: 0; left: 0; right: 0; height: 4px; background: var(--c-sky); opacity: 0.5; }
.bar-x { position: absolute; bottom: 0; font-size: 10px; color: var(--c-muted); }

/* ====== 评估 ====== */
.eval-panel { width: 300px; flex-shrink: 0; }
.eval-body { padding: 8px 0; }
.eval-row { display: flex; align-items: center; gap: 12px; padding: 10px 20px; border-bottom: 1px solid #F8F9FA; }
.eval-row:last-child { border-bottom: none; }
.e-label { width: 80px; font-size: 12px; color: var(--c-body); flex-shrink: 0; }
.e-track { flex: 1; height: 4px; background: #EEF0F2; overflow: hidden; }
.e-bar { display: block; height: 100%; transition: width 0.5s ease; }
.e-val { width: 68px; text-align: right; font-weight: 700; font-size: 13px; font-family: var(--mono); }

/* ====== 温度 ====== */
.temp-panel { flex: 1; }
.temp-body { padding: 14px 20px 16px; }
.temp-svg { width: 100%; height: 100px; display: block; }
.temp-legend { display: flex; gap: 28px; margin-top: 12px; }
.temp-legend span { font-size: 12px; color: var(--c-body); display: flex; align-items: center; gap: 6px; }
.t-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; }

/* ====== 天气预报胶囊 ====== */
.weather-capsules { width: 320px; flex-shrink: 0; display: flex; flex-direction: column; gap: 10px; }
.wx-head { font-size: 12px; font-weight: 700; color: var(--c-ink); text-transform: uppercase; letter-spacing: 1px; padding: 0 2px; }
.wx-row { display: flex; gap: 0; }
.wx-cap {
  flex: 1; background: var(--c-white); border: 1px solid var(--c-line);
  display: flex; flex-direction: column; align-items: center;
  padding: 16px 8px 12px; gap: 3px; margin-left: -1px;
  transition: background 0.15s;
}
.wx-cap:first-child { margin-left: 0; }
.wx-cap:hover { background: #FAFBFC; }
.wx-icon { font-size: 28px; line-height: 1; }
.wx-temp { font-size: 18px; font-weight: 700; color: var(--c-ink); font-family: var(--mono); }
.wx-label { font-size: 11px; color: var(--c-muted); }
.wx-desc { font-size: 10px; color: var(--c-muted); }

/* ====== 社会贡献横条 ====== */
.social-strip {
  background: var(--c-white); border: 1px solid var(--c-line);
  padding: 18px 24px; display: flex; align-items: center; gap: 36px;
}
.soc-head { font-size: 12px; font-weight: 700; color: var(--c-ink); text-transform: uppercase; letter-spacing: 1px; flex-shrink: 0; }
.soc-row { flex: 1; display: flex; justify-content: space-around; }
.soc-item { display: flex; align-items: center; gap: 10px; }
.soc-icon { font-size: 26px; }
.soc-data { display: flex; flex-direction: column; }
.soc-num { font-size: 18px; font-weight: 700; color: var(--c-ink); font-family: var(--mono); }
.soc-num small { font-size: 11px; font-weight: 400; color: var(--c-muted); margin-left: 2px; }
.soc-label { font-size: 10px; color: var(--c-muted); text-transform: uppercase; letter-spacing: 0.5px; }
</style>
