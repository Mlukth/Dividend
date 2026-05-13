<template>
  <div class="pi-outer">
    <!-- ====== 行1: 仪表盘 + KPI卡片 ====== -->
    <div class="row row-top">
      <div class="gauge-card">
        <div class="gauge-ring">
          <svg viewBox="0 0 160 100" class="gauge-svg">
            <path d="M20 90 A60 60 0 0 1 140 90" fill="none" stroke="#E2E8F0" stroke-width="14" stroke-linecap="round"/>
            <path d="M20 90 A60 60 0 0 1 140 90" fill="none" stroke="url(#gGrad)" stroke-width="14" stroke-linecap="round"
              stroke-dasharray="188 188" :stroke-dashoffset="188 - 188 * 0.72" />
            <defs>
              <linearGradient id="gGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stop-color="#0070D6"/>
                <stop offset="100%" stop-color="#38BDF8"/>
              </linearGradient>
            </defs>
          </svg>
          <div class="gauge-center">
            <span class="gauge-num">{{ powerData.realTimePower }}</span>
            <span class="gauge-unit">kW</span>
          </div>
        </div>
        <div class="gauge-label">实时功率</div>
        <div class="gauge-sub">组件总容量 {{ powerData.capacity }} kWp</div>
      </div>

      <div class="kpi-row">
        <div class="kpi-card">
          <div class="kpi-head">当日发电量</div>
          <div class="kpi-val">{{ powerData.todayEnergy }}<small>kWh</small></div>
          <div class="kpi-meta">
            <div class="meta-pair"><span>较昨日同期</span><b>--</b></div>
            <div class="meta-pair"><span>累计发电量</span><b>{{ powerData.totalEnergy }} kWh</b></div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-head">当日收益</div>
          <div class="kpi-val gold">¥ {{ powerData.todayProfit }}</div>
          <div class="kpi-meta quad">
            <div class="meta-pair"><span>当年收益</span><b>{{ powerData.yearProfit }} 元</b></div>
            <div class="meta-pair"><span>累计收益</span><b>{{ powerData.totalProfit }} 元</b></div>
            <div class="meta-pair"><span>上网电价</span><b>0.4 元/kWh</b></div>
            <div class="meta-pair"><span>自用电价</span><b>0.6 元/kWh</b></div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-head">系统运行状态</div>
          <div class="kpi-status">
            <span class="kpi-dot live"></span>
            <span class="kpi-state">运行中</span>
          </div>
          <div class="kpi-meta">
            <div class="meta-pair"><span>告警数量</span><b class="warn">{{ powerData.warningCount }}</b></div>
            <div class="meta-pair"><span>逆变器</span><b>{{ powerData.inverterOnline }}/{{ powerData.inverterTotal }}</b></div>
            <div class="meta-pair"><span>日满发小时</span><b>{{ powerData.equivalentHours }} h</b></div>
            <div class="meta-pair"><span>功率占比</span><b>{{ powerData.powerRatio }}%</b></div>
          </div>
        </div>
      </div>
    </div>

    <!-- ====== 行2: 发电功率趋势（无边面板） + 电站评估（无边面板） ====== -->
    <div class="row row-mid">
      <div class="panel chart-panel">
        <div class="panel-head">
          <span class="panel-title">发电功率趋势</span>
          <div class="chip-row">
            <span class="chip" v-for="t in ['day','month','year','total']" :key="t"
              :class="{ on: dateType === t }" @click="dateType = t"
            >{{ {day:'日',month:'月',year:'年',total:'总'}[t] }}</span>
          </div>
        </div>
        <div class="chart-body">
          <svg viewBox="0 0 600 160" class="area-svg" preserveAspectRatio="none">
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#38BDF8" stop-opacity="0.3"/>
                <stop offset="100%" stop-color="#38BDF8" stop-opacity="0.0"/>
              </linearGradient>
            </defs>
            <!-- 网格线 -->
            <line v-for="i in 4" :key="'g'+i" :x1="0" :y1="i*35" :x2="600" :y2="i*35" stroke="#F1F5F9" stroke-width="0.5"/>
            <polygon :points="areaPoints" fill="url(#areaGrad)"/>
            <polyline :points="linePoints" fill="none" stroke="#0070D6" stroke-width="2.5" vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round"/>
            <!-- 数据点 -->
            <circle v-for="(pt, i) in dotPoints" :key="'d'+i" :cx="pt.x" :cy="pt.y" r="3" fill="#0070D6" stroke="#fff" stroke-width="1.5"/>
          </svg>
          <div class="chart-labels">
            <span v-for="(l, i) in chartData.labels" :key="i" class="chart-label">{{ l }}</span>
          </div>
        </div>
      </div>

      <div class="panel eval-panel">
        <div class="panel-head">
          <span class="panel-title">电站评估</span>
        </div>
        <div class="eval-body">
          <div class="eval-item" v-for="e in evalItems" :key="e.label">
            <div class="eval-top">
              <span class="eval-label">{{ e.label }}</span>
              <span class="eval-val" :style="{ color: e.color }">{{ e.value }}<small>{{ e.unit }}</small></span>
            </div>
            <div class="eval-track"><div class="eval-bar" :style="{ width: e.pct+'%', background: e.color }"></div></div>
          </div>
        </div>
      </div>
    </div>

    <!-- ====== 行3: 温度监测 + 天气预报胶囊 ====== -->
    <div class="row row-mid">
      <div class="panel temp-panel">
        <div class="panel-head">
          <span class="panel-title">温度监测</span>
          <div class="chip-row">
            <span class="chip" :class="{ on: tempType==='day' }" @click="tempType='day'">日</span>
            <span class="chip" :class="{ on: tempType==='week' }" @click="tempType='week'">周</span>
          </div>
        </div>
        <div class="temp-body">
          <svg viewBox="0 0 400 100" class="temp-svg" preserveAspectRatio="none">
            <line v-for="i in 4" :key="'g'+i" :x1="0" :y1="i*25" :x2="400" :y2="i*25" stroke="#F1F5F9" stroke-width="0.5"/>
            <polyline :points="tempLine" fill="none" stroke="#F59E0B" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linecap="round"/>
            <polyline :points="tempLine2" fill="none" stroke="#0070D6" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linecap="round"/>
          </svg>
          <div class="temp-legend">
            <span class="t-leg"><i class="t-dot" style="background:#F59E0B"></i>组件温度 {{ tempData.moduleTemp }}°C</span>
            <span class="t-leg"><i class="t-dot" style="background:#0070D6"></i>环境温度 {{ tempData.envTemp }}°C</span>
          </div>
        </div>
      </div>

      <div class="weather-capsules">
        <span class="wx-title">天气预报</span>
        <div class="wx-row">
          <div class="wx-cap" v-for="w in weather" :key="w.label">
            <span class="wx-cap-icon">{{ w.icon }}</span>
            <span class="wx-cap-temp">{{ w.temp }}°</span>
            <span class="wx-cap-label">{{ w.label }}</span>
            <span class="wx-cap-desc">{{ w.desc }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ====== 行4: 社会贡献横条 ====== -->
    <div class="social-strip">
      <span class="soc-head">社会贡献</span>
      <div class="soc-items">
        <div class="soc-item" v-for="s in social" :key="s.label">
          <span class="soc-icon">{{ s.icon }}</span>
          <div class="soc-info">
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

const areaPoints = computed(() => {
  const d = chartData.value; const w = 600; const h = 160; const pad = 20; const n = d.bars.length
  const stepX = (w - pad * 2) / (n - 1)
  let pts = `${pad},${h - pad} `
  d.bars.forEach((v, i) => { pts += `${pad + i * stepX},${h - pad - (v/d.max*(h-pad*2))} ` })
  pts += `${w - pad},${h - pad}`
  return pts
})

const linePoints = computed(() => {
  const d = chartData.value; const w = 600; const h = 160; const pad = 20; const n = d.bars.length
  const stepX = (w - pad * 2) / (n - 1)
  return d.bars.map((v, i) => `${pad + i * stepX},${h - pad - (v/d.max*(h-pad*2))}`).join(' ')
})

const dotPoints = computed(() => {
  const d = chartData.value; const w = 600; const h = 160; const pad = 20; const n = d.bars.length
  const stepX = (w - pad * 2) / (n - 1)
  return d.bars.map(v => ({ x: pad + ((d.bars.indexOf(v)) * stepX), y: h - pad - (v/d.max*(h-pad*2)) }))
})

const evalItems = [
  { label: '综合效率', value: 92.5, unit: '%', pct: 92.5, color: '#0070D6' },
  { label: '等效利用小时', value: 4.2, unit: ' h', pct: 70, color: '#38BDF8' },
  { label: '性能比 PR', value: 85.3, unit: '%', pct: 85.3, color: '#10B981' },
  { label: '故障损失', value: 125, unit: ' kWh', pct: 12, color: '#EF4444' },
  { label: '可用率', value: 99.2, unit: '%', pct: 99.2, color: '#10B981' },
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
   PowerInfo V1 — Atmospheric Solar
   天空渐变 · 柔和光影 · 数据点强调
   ============================================ */
.pi-outer {
  --font: "Microsoft YaHei", "PingFang SC", -apple-system, sans-serif;
  --mono: "JetBrains Mono", "Fira Code", monospace;

  font-family: var(--font); font-size: 13px;
  /* 天空渐变背景 — 从浅蓝到暖白 */
  background: linear-gradient(175deg, #EEF4FB 0%, #F5F7FA 30%, #FDFCF8 100%);
  padding: 16px; display: flex; flex-direction: column; gap: 14px; min-height: 100%;
  color: #334155;
}

.row { display: flex; gap: 14px; align-items: stretch; }

/* ====== 仪表盘 ====== */
.gauge-card {
  background: #FFFFFF; border-radius: 14px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,102,204,0.06);
  width: 210px; flex-shrink: 0; display: flex; flex-direction: column;
  align-items: center; padding: 24px 16px 16px; gap: 6px;
}
.gauge-ring { position: relative; width: 160px; height: 100px; }
.gauge-svg { display: block; }
.gauge-center { position: absolute; bottom: 0; left: 0; right: 0; text-align: center; }
.gauge-num { font-size: 34px; font-weight: 700; color: #0F172A; font-family: var(--mono); line-height: 1; }
.gauge-unit { font-size: 13px; color: #94A3B8; margin-left: 2px; }
.gauge-label { font-size: 12px; color: #64748B; }
.gauge-sub { font-size: 11px; color: #94A3B8; }

/* ====== KPI卡片 ====== */
.kpi-row { flex: 1; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.kpi-card {
  background: #FFFFFF; border-radius: 14px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,102,204,0.06);
  padding: 20px; display: flex; flex-direction: column; gap: 10px;
  transition: box-shadow 0.3s ease, transform 0.3s ease;
}
.kpi-card:hover {
  box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 12px 32px rgba(0,102,204,0.10);
  transform: translateY(-2px);
}
.kpi-head { font-size: 13px; color: #64748B; font-weight: 500; }
.kpi-val { font-size: 28px; font-weight: 700; color: #0F172A; font-family: var(--mono); line-height: 1.1; }
.kpi-val small { font-size: 13px; font-weight: 400; color: #94A3B8; margin-left: 4px; }
.kpi-val.gold { color: #B45309; }
.kpi-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 14px; }
.kpi-meta.quad { grid-template-columns: 1fr 1fr; }
.meta-pair { display: flex; flex-direction: column; gap: 2px; }
.meta-pair span { font-size: 10px; color: #94A3B8; }
.meta-pair b { font-size: 12px; color: #475569; font-weight: 600; }
.meta-pair b.warn { color: #EF4444; }

.kpi-status { display: flex; align-items: center; gap: 8px; }
.kpi-dot { width: 10px; height: 10px; border-radius: 50%; }
.kpi-dot.live { background: #10B981; box-shadow: 0 0 12px rgba(16,185,129,0.4); animation: breathe 2s ease-in-out infinite; }
@keyframes breathe { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }
.kpi-state { font-size: 18px; font-weight: 700; color: #10B981; }

/* ====== 无边面板 ====== */
.panel {
  background: #FFFFFF; border-radius: 14px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,102,204,0.06);
  overflow: hidden;
}
.panel-head {
  display: flex; justify-content: space-between; align-items: center;
  padding: 16px 20px; border-bottom: 1px solid #F1F5F9;
}
.panel-title { font-size: 15px; font-weight: 700; color: #0F172A; }

.chip-row { display: flex; gap: 2px; background: #F1F5F9; border-radius: 6px; padding: 2px; }
.chip {
  padding: 4px 12px; font-size: 12px; cursor: pointer; border-radius: 4px;
  color: #94A3B8; transition: all 0.15s; user-select: none;
}
.chip:hover { color: #475569; }
.chip.on { background: #fff; color: #0070D6; font-weight: 700; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }

/* ====== 面积图 ====== */
.chart-panel { flex: 1; }
.chart-body { padding: 12px 20px 8px; height: 200px; display: flex; flex-direction: column; }
.area-svg { flex: 1; width: 100%; }
.chart-labels { display: flex; justify-content: space-between; padding: 2px 0; }
.chart-label { font-size: 10px; color: #94A3B8; }

/* ====== 评估面板 ====== */
.eval-panel { width: 300px; flex-shrink: 0; }
.eval-body { padding: 12px 20px; display: flex; flex-direction: column; gap: 14px; }
.eval-item { display: flex; flex-direction: column; gap: 5px; }
.eval-top { display: flex; justify-content: space-between; align-items: baseline; }
.eval-label { font-size: 13px; color: #475569; }
.eval-val { font-size: 16px; font-weight: 700; font-family: var(--mono); }
.eval-val small { font-size: 10px; font-weight: 400; color: #94A3B8; margin-left: 1px; }
.eval-track { height: 5px; background: #F1F5F9; border-radius: 3px; overflow: hidden; }
.eval-bar { height: 100%; border-radius: 3px; transition: width 0.5s ease; }

/* ====== 温度 ====== */
.temp-panel { flex: 1; }
.temp-body { padding: 12px 20px 16px; }
.temp-svg { width: 100%; height: 100px; display: block; }
.temp-legend { display: flex; gap: 28px; margin-top: 10px; }
.t-leg { font-size: 12px; color: #475569; display: flex; align-items: center; gap: 6px; }
.t-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; }

/* ====== 天气预报胶囊 ====== */
.weather-capsules { width: 320px; flex-shrink: 0; display: flex; flex-direction: column; gap: 10px; }
.wx-title { font-size: 15px; font-weight: 700; color: #0F172A; padding: 0 4px; }
.wx-row { display: flex; gap: 10px; }
.wx-cap {
  flex: 1; background: #FFFFFF; border-radius: 14px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,102,204,0.06);
  display: flex; flex-direction: column; align-items: center; padding: 18px 10px 14px; gap: 4px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.wx-cap:hover { transform: translateY(-3px); box-shadow: 0 4px 12px rgba(0,102,204,0.12); }
.wx-cap-icon { font-size: 30px; line-height: 1; }
.wx-cap-temp { font-size: 20px; font-weight: 700; color: #0F172A; font-family: var(--mono); }
.wx-cap-label { font-size: 12px; color: #64748B; }
.wx-cap-desc { font-size: 11px; color: #94A3B8; }

/* ====== 社会贡献横条 ====== */
.social-strip {
  background: #FFFFFF; border-radius: 14px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(16,185,129,0.06);
  padding: 20px 28px; display: flex; align-items: center; gap: 36px;
}
.soc-head { font-size: 15px; font-weight: 700; color: #0F172A; flex-shrink: 0; }
.soc-items { flex: 1; display: flex; justify-content: space-around; }
.soc-item { display: flex; align-items: center; gap: 10px; }
.soc-icon { font-size: 28px; }
.soc-info { display: flex; flex-direction: column; }
.soc-num { font-size: 18px; font-weight: 700; color: #0F172A; font-family: var(--mono); }
.soc-num small { font-size: 11px; font-weight: 400; color: #94A3B8; margin-left: 2px; }
.soc-label { font-size: 11px; color: #94A3B8; }
</style>
