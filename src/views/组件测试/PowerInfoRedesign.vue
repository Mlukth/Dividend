<template>
  <div class="pi-outer">
    <!-- ====== 行1: 仪表盘 + KPI卡片（保留原布局，优化样式） ====== -->
    <div class="row row-top">
      <!-- 仪表盘 -->
      <div class="gauge-card">
        <div class="gauge-ring">
          <svg viewBox="0 0 160 100" class="gauge-svg">
            <path d="M20 90 A60 60 0 0 1 140 90" fill="none" stroke="#EDF0F4" stroke-width="14" stroke-linecap="round"/>
            <path d="M20 90 A60 60 0 0 1 140 90" fill="none" stroke="url(#gGrad)" stroke-width="14" stroke-linecap="round"
              stroke-dasharray="188 188" :stroke-dashoffset="188 - 188 * 0.72" />
            <defs>
              <linearGradient id="gGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stop-color="#0070D6"/>
                <stop offset="100%" stop-color="#1A8FF0"/>
              </linearGradient>
            </defs>
          </svg>
          <div class="gauge-center">
            <span class="gauge-num">{{ powerData.realTimePower }}</span>
            <span class="gauge-unit">kW</span>
          </div>
        </div>
        <div class="gauge-label">实时功率</div>
        <div class="gauge-info">组件总容量：{{ powerData.capacity }} kWp</div>
      </div>

      <!-- KPI宽卡片 -->
      <div class="kpi-wide">
        <div class="kpi-three">
          <!-- 当日发电量 -->
          <div class="kpi-block">
            <div class="kpi-head">当日发电量</div>
            <div class="kpi-big">{{ powerData.todayEnergy }}<small>kWh</small></div>
            <div class="kpi-sub-row">
              <div class="kpi-sub"><span>较昨日同期</span><b>--</b></div>
              <div class="kpi-sub"><span>累计发电量</span><b>{{ powerData.totalEnergy }} kWh</b></div>
            </div>
          </div>
          <!-- 当日收益 -->
          <div class="kpi-block">
            <div class="kpi-head">当日收益</div>
            <div class="kpi-big gold">¥ {{ powerData.todayProfit }}</div>
            <div class="kpi-sub-row quad">
              <div class="kpi-sub"><span>当年收益</span><b>{{ powerData.yearProfit }} 元</b></div>
              <div class="kpi-sub"><span>累计收益</span><b>{{ powerData.totalProfit }} 元</b></div>
              <div class="kpi-sub"><span>上网电价</span><b>0.4 元/kWh</b></div>
              <div class="kpi-sub"><span>自用电价</span><b>0.6 元/kWh</b></div>
            </div>
          </div>
          <!-- 系统运行状态 -->
          <div class="kpi-block">
            <div class="kpi-head">系统运行状态</div>
            <div class="kpi-status">
              <span class="kpi-dot live"></span>
              <span class="kpi-state-text">运行中</span>
            </div>
            <div class="kpi-sub-row">
              <div class="kpi-sub"><span>告警数量</span><b class="red">{{ powerData.warningCount }}</b></div>
              <div class="kpi-sub"><span>逆变器</span><b>{{ powerData.inverterOnline }}/{{ powerData.inverterTotal }}</b></div>
              <div class="kpi-sub"><span>日满发小时</span><b>{{ powerData.equivalentHours }} h</b></div>
              <div class="kpi-sub"><span>功率占比</span><b>{{ powerData.powerRatio }}%</b></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ====== 行2: 发电功率趋势 + 电站评估 ====== -->
    <div class="row row-mid">
      <div class="panel chart-panel">
        <div class="panel-head">
          <span class="panel-title">发电功率趋势</span>
          <div class="panel-tools">
            <span class="tool-chip" :class="{ on: dateType === 'day' }" @click="dateType = 'day'">日</span>
            <span class="tool-chip" :class="{ on: dateType === 'month' }" @click="dateType = 'month'">月</span>
            <span class="tool-chip" :class="{ on: dateType === 'year' }" @click="dateType = 'year'">年</span>
            <span class="tool-chip" :class="{ on: dateType === 'total' }" @click="dateType = 'total'">总</span>
          </div>
        </div>
        <div class="chart-body">
          <div class="bar-chart">
            <div class="bar-col" v-for="(v, i) in chartData.bars" :key="i">
              <div class="bar-fill" :style="{ height: (v / chartData.max * 100) + '%' }"></div>
              <span class="bar-x">{{ chartData.labels[i] }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="panel eval-panel">
        <div class="panel-head">
          <span class="panel-title">电站评估</span>
        </div>
        <div class="eval-list">
          <div class="eval-row" v-for="e in evalItems" :key="e.label">
            <span class="eval-label">{{ e.label }}</span>
            <span class="eval-bar-wrap">
              <span class="eval-bar" :style="{ width: e.pct + '%', background: e.color }"></span>
            </span>
            <span class="eval-val" :class="e.cls">{{ e.value }}{{ e.unit }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ====== 行3: 温度监测 + 天气预报 ====== -->
    <div class="row row-mid">
      <div class="panel temp-panel">
        <div class="panel-head">
          <span class="panel-title">温度监测</span>
          <div class="panel-tools">
            <span class="tool-chip" :class="{ on: tempType === 'day' }" @click="tempType = 'day'">日</span>
            <span class="tool-chip" :class="{ on: tempType === 'week' }" @click="tempType = 'week'">周</span>
          </div>
        </div>
        <div class="temp-body">
          <div class="temp-curve">
            <svg viewBox="0 0 400 100" class="temp-svg">
              <polyline :points="tempLine" fill="none" stroke="#F5A623" stroke-width="2" />
              <polyline :points="tempLine2" fill="none" stroke="#1A8FF0" stroke-width="2" />
            </svg>
          </div>
          <div class="temp-legend">
            <span><i class="t-dot" style="background:#F5A623"></i>组件温度 {{ tempData.moduleTemp }}°C</span>
            <span><i class="t-dot" style="background:#1A8FF0"></i>环境温度 {{ tempData.envTemp }}°C</span>
          </div>
        </div>
      </div>

      <div class="panel weather-panel">
        <div class="panel-head">
          <span class="panel-title">天气预报</span>
        </div>
        <div class="weather-row">
          <div class="wx-day" v-for="w in weather" :key="w.label">
            <span class="wx-label">{{ w.label }}</span>
            <span class="wx-icon">{{ w.icon }}</span>
            <span class="wx-temp">{{ w.temp }}°C</span>
            <span class="wx-desc">{{ w.desc }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ====== 行4: 社会贡献 ====== -->
    <div class="row">
      <div class="panel social-panel">
        <div class="panel-head">
          <span class="panel-title">社会贡献</span>
        </div>
        <div class="social-grid">
          <div class="soc-item" v-for="s in social" :key="s.label">
            <span class="soc-icon">{{ s.icon }}</span>
            <span class="soc-num">{{ s.value }} <small>{{ s.unit }}</small></span>
            <span class="soc-label">{{ s.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

// ===== 模拟数据 =====
const dateType = ref('day')
const tempType = ref('day')

const powerData = reactive({
  capacity: 5200,
  realTimePower: 3748,
  todayEnergy: '18,240',
  todayProfit: '7,296',
  totalEnergy: '2,450,000',
  totalProfit: '980,000',
  yearProfit: '185,000',
  equivalentHours: 4.2,
  powerRatio: 72.1,
  warningCount: 3,
  inverterOnline: 45,
  inverterTotal: 48,
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
  { label: '综合效率', value: 92.5, unit: '%', pct: 92.5, color: 'var(--c-blue)', cls: '' },
  { label: '等效利用小时', value: 4.2, unit: ' h', pct: 70, color: 'var(--c-sky)', cls: '' },
  { label: '性能比 PR', value: 85.3, unit: '%', pct: 85.3, color: 'var(--c-green)', cls: '' },
  { label: '故障损失', value: 125, unit: ' kWh', pct: 12, color: 'var(--c-red)', cls: 'warn' },
  { label: '可用率', value: 99.2, unit: '%', pct: 99.2, color: 'var(--c-green)', cls: 'ok' },
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
   PowerInfo — 蓝白 Solar Lab
   保留行1仪表盘+KPI布局，重设计行2-4
   ============================================ */
.pi-outer {
  --c-bg: #F5F7FA;
  --c-white: #FFFFFF;
  --c-ink: #13202E;
  --c-body: #3B4858;
  --c-muted: #8F9BA8;
  --c-line: #E9ECF0;
  --c-blue: #0070D6;
  --c-sky: #1A8FF0;
  --c-ice: #EBF5FF;
  --c-green: #1BA04A;
  --c-red: #E0343C;
  --c-gold: #D4880F;
  --font: "Microsoft YaHei", "PingFang SC", -apple-system, sans-serif;
  --font-mono: "JetBrains Mono", "Fira Code", monospace;
  --r-sm: 4px; --r-md: 8px; --r-lg: 12px;
  --shadow: 0 0 0 1px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.03), 0 4px 12px rgba(0,0,0,0.03);

  font-family: var(--font);
  font-size: 13px;
  color: var(--c-body);
  background: var(--c-bg);
  padding: 16px;
  display: flex; flex-direction: column; gap: 14px;
}

/* ── 行 ── */
.row { display: flex; gap: 14px; }
.row-top { align-items: stretch; }
.row-mid { align-items: stretch; }

/* ====== 仪表盘卡片 ====== */
.gauge-card {
  background: var(--c-white); border-radius: var(--r-lg);
  padding: 20px 24px; box-shadow: var(--shadow);
  display: flex; flex-direction: column; align-items: center;
  width: 220px; flex-shrink: 0; gap: 8px;
}
.gauge-ring { position: relative; width: 160px; height: 100px; }
.gauge-svg { display: block; }
.gauge-center { position: absolute; bottom: 0; left: 0; right: 0; text-align: center; }
.gauge-num { font-size: 32px; font-weight: 700; color: var(--c-ink); font-family: var(--font-mono); line-height: 1; }
.gauge-unit { font-size: 13px; color: var(--c-muted); margin-left: 2px; }
.gauge-label { font-size: 12px; color: var(--c-muted); }
.gauge-info { font-size: 11px; color: var(--c-muted); }

/* ====== KPI宽卡片 ====== */
.kpi-wide {
  background: var(--c-white); border-radius: var(--r-lg);
  padding: 20px 24px; box-shadow: var(--shadow);
  flex: 1; display: flex;
}
.kpi-three { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; width: 100%; }
.kpi-block { display: flex; flex-direction: column; gap: 8px; }
.kpi-head { font-size: 13px; color: var(--c-muted); font-weight: 500; }
.kpi-big { font-size: 28px; font-weight: 700; color: var(--c-ink); font-family: var(--font-mono); line-height: 1.1; }
.kpi-big small { font-size: 13px; font-weight: 400; color: var(--c-muted); margin-left: 4px; }
.kpi-big.gold { color: var(--c-gold); }
.kpi-sub-row { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 12px; }
.kpi-sub-row.quad { grid-template-columns: 1fr 1fr; }
.kpi-sub { display: flex; flex-direction: column; gap: 2px; }
.kpi-sub span { font-size: 10px; color: var(--c-muted); }
.kpi-sub b { font-size: 12px; color: var(--c-body); font-weight: 600; }
.kpi-sub b.red { color: var(--c-red); }

.kpi-status { display: flex; align-items: center; gap: 8px; }
.kpi-dot { width: 10px; height: 10px; border-radius: 50%; }
.kpi-dot.live { background: var(--c-green); box-shadow: 0 0 8px rgba(27,160,74,0.5); animation: breathe 2s ease-in-out infinite; }
@keyframes breathe { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
.kpi-state-text { font-size: 18px; font-weight: 700; color: var(--c-green); }

/* ====== 面板通用 ====== */
.panel { background: var(--c-white); border-radius: var(--r-lg); box-shadow: var(--shadow); overflow: hidden; }
.panel-head { display: flex; justify-content: space-between; align-items: center; padding: 14px 20px; border-bottom: 1px solid var(--c-line); }
.panel-title { font-size: 15px; font-weight: 700; color: var(--c-ink); }
.panel-tools { display: flex; gap: 2px; background: #F5F7FA; border-radius: var(--r-sm); padding: 2px; }
.tool-chip { padding: 4px 12px; font-size: 12px; cursor: pointer; border-radius: var(--r-sm); color: var(--c-muted); transition: all 0.15s; }
.tool-chip:hover { color: var(--c-body); }
.tool-chip.on { background: var(--c-white); color: var(--c-blue); font-weight: 700; box-shadow: 0 1px 2px rgba(0,0,0,0.06); }

/* ====== 行2: 功率曲线 + 评估 ====== */
.chart-panel { flex: 1; }
.chart-body { padding: 20px 20px 16px; height: 220px; }
.bar-chart { display: flex; align-items: flex-end; gap: 2px; height: 100%; padding-bottom: 22px; position: relative; }
.bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end; }
.bar-fill {
  width: 100%; max-width: 40px;
  background: linear-gradient(180deg, var(--c-sky), var(--c-blue));
  border-radius: 3px 3px 0 0; min-height: 2px; transition: height 0.4s ease;
}
.bar-x { position: absolute; bottom: 0; font-size: 10px; color: var(--c-muted); }

.eval-panel { width: 320px; flex-shrink: 0; }
.eval-list { padding: 6px 0; }
.eval-row { display: flex; align-items: center; gap: 12px; padding: 10px 20px; }
.eval-row:hover { background: #F8FAFB; }
.eval-label { width: 80px; font-size: 13px; color: var(--c-body); flex-shrink: 0; }
.eval-bar-wrap { flex: 1; height: 6px; background: #EDF0F4; border-radius: 3px; overflow: hidden; }
.eval-bar { height: 100%; border-radius: 3px; transition: width 0.5s ease; }
.eval-val { width: 72px; text-align: right; font-weight: 700; font-size: 13px; font-family: var(--font-mono); color: var(--c-ink); }
.eval-val.warn { color: var(--c-red); }
.eval-val.ok { color: var(--c-green); }

/* ====== 行3: 温度 + 天气 ====== */
.temp-panel { flex: 1; }
.temp-body { padding: 14px 20px; }
.temp-curve { height: 100px; }
.temp-svg { width: 100%; height: 100%; }
.temp-legend { display: flex; gap: 24px; margin-top: 8px; }
.temp-legend span { font-size: 12px; color: var(--c-body); display: flex; align-items: center; gap: 6px; }
.t-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; }

.weather-panel { width: 320px; flex-shrink: 0; }
.weather-row { display: flex; gap: 0; padding: 10px 0; }
.wx-day { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 12px 0; }
.wx-label { font-size: 12px; color: var(--c-muted); }
.wx-icon { font-size: 28px; }
.wx-temp { font-size: 18px; font-weight: 700; color: var(--c-ink); }
.wx-desc { font-size: 12px; color: var(--c-muted); }

/* ====== 行4: 社会贡献 ====== */
.social-panel { flex: 1; }
.social-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; }
.soc-item { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 24px 16px; }
.soc-item:not(:last-child) { border-right: 1px solid var(--c-line); }
.soc-icon { font-size: 28px; }
.soc-num { font-size: 22px; font-weight: 700; color: var(--c-ink); font-family: var(--font-mono); }
.soc-num small { font-size: 12px; font-weight: 400; color: var(--c-muted); margin-left: 2px; }
.soc-label { font-size: 12px; color: var(--c-muted); }
</style>
