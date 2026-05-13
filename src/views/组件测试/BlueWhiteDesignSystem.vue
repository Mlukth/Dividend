<template>
  <div class="observatory" :style="cssVars">

    <!-- ===== 顶部导航 ===== -->
    <header class="topbar">
      <div class="topbar-left">
        <span class="logo-dot"></span>
        <span class="logo-name">FusionSolar</span>
        <span class="logo-divider"></span>
        <span class="logo-sub">智能光伏管理系统</span>
      </div>
      <div class="topbar-right">
        <span class="topbar-link">工作台</span>
        <span class="topbar-link">消息<span class="badge-dot">3</span></span>
        <span class="avatar">张</span>
      </div>
    </header>

    <!-- ===== 主体 ===== -->
    <div class="body-wrap">

      <!-- 侧边栏 -->
      <aside class="sidenav" :class="{ fold: sidebarCollapsed }">
        <nav class="sidenav-nav">
          <div
            v-for="item in navItems" :key="item.key"
            class="sidenav-item" :class="{ on: activeNav === item.key }"
            @click="activeNav = item.key"
          >
            <span class="sidenav-dot"></span>
            <span class="sidenav-label" v-show="!sidebarCollapsed">{{ item.label }}</span>
          </div>
        </nav>
        <div class="sidenav-fold" @click="sidebarCollapsed = !sidebarCollapsed">
          <span class="fold-arrow" :class="{ flipped: sidebarCollapsed }">&#8249;</span>
        </div>
      </aside>

      <!-- 内容区 -->
      <main class="content">

        <div class="page-top">
          <div>
            <h1 class="page-heading">电站总览</h1>
            <p class="page-meta">最后更新 2026-05-07 14:30:25 · 所有电站运行中</p>
          </div>
          <div class="sun-ring">
            <div class="sun-core"></div>
            <div class="sun-halo"></div>
          </div>
        </div>

        <!-- KPI -->
        <div class="kpi-grid">
          <article class="kpi" v-for="kpi in kpiData" :key="kpi.label">
            <div class="kpi-top">
              <span class="kpi-symbol">{{ kpi.icon }}</span>
              <span class="kpi-trend" :class="kpi.trendDir">{{ kpi.trend }}</span>
            </div>
            <div class="kpi-metric">
              <span class="kpi-val">{{ kpi.value }}</span>
              <span class="kpi-unit">{{ kpi.unit }}</span>
            </div>
            <div class="kpi-tag">{{ kpi.label }}</div>
          </article>
        </div>

        <!-- 图表 + 设备状态 -->
        <div class="dual-col">
          <section class="panel chart-panel">
            <div class="panel-head">
              <span class="panel-title">今日发电功率</span>
              <span class="panel-chip live">LIVE</span>
            </div>
            <div class="chart-area">
              <div class="chart-bars">
                <div class="bar-col" v-for="(h, i) in chartBars" :key="i">
                  <div class="bar-fill" :style="{ height: h + '%' }"></div>
                  <span class="bar-label">{{ timeLabels[i] }}</span>
                </div>
              </div>
            </div>
          </section>

          <section class="panel status-panel">
            <div class="panel-head">
              <span class="panel-title">设备状态</span>
              <span class="panel-chip ok">在线 24</span>
            </div>
            <div class="status-rows">
              <div class="st-row" v-for="s in statusData" :key="s.name">
                <span class="st-pip" :class="s.status"></span>
                <span class="st-name">{{ s.name }}</span>
                <span class="st-pct">{{ s.rate }}%</span>
                <span class="st-count">{{ s.count }}</span>
              </div>
            </div>
          </section>
        </div>

        <!-- 电站表 -->
        <section class="panel">
          <div class="panel-head">
            <span class="panel-title">电站列表</span>
            <span class="panel-action">+ 新增电站</span>
          </div>
          <table class="table">
            <thead>
              <tr>
                <th>电站名称</th>
                <th>装机容量</th>
                <th>今日发电</th>
                <th>PR</th>
                <th>状态</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in stationList" :key="s.id">
                <td class="cell-name">{{ s.name }}</td>
                <td>{{ s.capacity }} kW</td>
                <td class="cell-num">{{ s.todayPower }} kWh</td>
                <td>
                  <span class="pr-badge" :class="s.prLevel">{{ s.pr }}%</span>
                </td>
                <td>
                  <span class="status-tag" :class="s.deviceStatus">{{ s.deviceStatus === 'normal' ? '正常' : '异常' }}</span>
                </td>
                <td class="cell-link">查看</td>
              </tr>
            </tbody>
          </table>
        </section>

      </main>
    </div>

    <!-- 环境光晕（背景装饰） -->
    <div class="ambient-glow glow-top-right"></div>
    <div class="ambient-glow glow-bottom-left"></div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

/* ============================================
   设计令牌 — Luminous Precision
   白 = 光 (不是空白)  |  蓝 = 晴空深度
   金色 = 阳光 (微点缀，不抢戏)
   ============================================ */
const tokens = {
  // ── 白系（光的层次） ──
  whiteBase: '#FFFDF7',      // 暖白底（模拟阳光洒落）
  whiteCard: '#FFFFFF',       // 纯白卡片
  whiteHeader: '#FFFFFF',     // 顶栏纯白
  whiteSide: '#FFFFFF',       // 侧栏纯白

  // ── 蓝系（天空深度） ──
  blueInk: '#003D73',        // 最深 — 标题、正文强强调
  blueCore: '#0072CC',       // 核心蓝 — 数字、链接、选中
  blueSky: '#1EA0FF',        // 天空蓝 — 图表、hover、高亮
  blueMist: '#D9EEFF',       // 雾蓝 — 浅背景、分隔
  blueIce: '#F2F8FF',        // 冰蓝 — 大面积浅底

  // ── 暖色点缀 ──
  gold: '#F5A623',           // 日光金 — 极少使用，装饰线/强调点
  goldPale: '#FFF8EC',       // 浅金 — 微妙暖底

  // ── 文字 ──
  textPrimary: '#14181F',    // 主文（接近黑但留一点蓝调）
  textSecondary: '#5F6B7A',  // 次文
  textMuted: '#98A3B0',      // 禁用/占位

  // ── 语义色 ──
  ok: '#1FAD50',
  warn: '#F5A623',
  fail: '#E5453C',

  // ── 排版 ──
  fontStack: '"Microsoft YaHei", "PingFang SC", -apple-system, sans-serif',
  fontMono: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
  f1: '11px', f2: '12px', f3: '13px', f4: '14px',
  f5: '16px', f6: '20px', f7: '28px', f8: '38px',

  // ── 间距（4px基准） ──
  s1: '4px', s2: '8px', s3: '12px', s4: '16px',
  s5: '20px', s6: '24px', s7: '32px', s8: '48px',

  // ── 圆角 ──
  r1: '4px', r2: '8px', r3: '12px', rFull: '9999px',

  // ── 光影 ──
  shadowCard: '0 0 0 1px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)',
  shadowHover: '0 0 0 1px rgba(0,114,204,0.10), 0 2px 6px rgba(0,0,0,0.05), 0 8px 28px rgba(0,0,0,0.05)',
  shadowTopbar: '0 1px 0 rgba(0,0,0,0.05)',
}

const cssVars = computed(() => {
  const v = {}
  Object.entries(tokens).forEach(([k, val]) => { v[`--${k}`] = val })
  return v
})

// ── 模拟数据 ──
const sidebarCollapsed = ref(false)
const activeNav = ref('dashboard')

const navItems = [
  { key: 'dashboard', label: '电站概览' },
  { key: 'station', label: '电站信息' },
  { key: 'operation', label: '运维管理' },
  { key: 'ai', label: 'AI助手' },
  { key: 'business', label: '经营管理' },
]

const kpiData = [
  { icon: '☀', label: '电站总数', value: '48', unit: '座', trend: '+12%', trendDir: 'up' },
  { icon: '⚡', label: '装机总容量', value: '256.8', unit: 'MW', trend: '+8.5%', trendDir: 'up' },
  { icon: '⌁', label: '今日发电量', value: '1,245', unit: 'MWh', trend: '+15%', trendDir: 'up' },
  { icon: '¥', label: '当年收益', value: '3,852', unit: '万元', trend: '-3.2%', trendDir: 'down' },
]

const timeLabels = ['00','02','04','06','08','10','12','14','16','18','20','22']
const chartBars = [0, 0, 0, 2, 12, 38, 68, 88, 95, 72, 32, 8, 0, 0]

const statusData = [
  { name: '逆变器', status: 'ok', count: 192, rate: 98.5 },
  { name: '汇流箱', status: 'ok', count: 86, rate: 100 },
  { name: '电表', status: 'warn', count: 48, rate: 95.8 },
  { name: '气象站', status: 'ok', count: 24, rate: 100 },
  { name: '变压器', status: 'fail', count: 12, rate: 91.7 },
]

const stationList = [
  { id: 1, name: '阳光工业园屋顶电站', capacity: 5200, todayPower: 18240, pr: 92.5, prLevel: 'good', deviceStatus: 'normal' },
  { id: 2, name: '滨海新区光伏示范项目', capacity: 8200, todayPower: 28650, pr: 88.3, prLevel: 'good', deviceStatus: 'normal' },
  { id: 3, name: '高新开发区分布式电站', capacity: 3600, todayPower: 11200, pr: 85.1, prLevel: 'ok', deviceStatus: 'normal' },
  { id: 4, name: '临港物流园光伏电站', capacity: 6400, todayPower: 21300, pr: 91.8, prLevel: 'good', deviceStatus: 'normal' },
  { id: 5, name: '城北保障房光伏项目', capacity: 1800, todayPower: 5200, pr: 76.4, prLevel: 'warn', deviceStatus: 'abnormal' },
]
</script>

<style scoped>
/* ============================================
   OBSERVATORY — Luminous Precision
   ============================================ */

/* ── 全局底子 ── */
.observatory {
  --dot-size: 10px;
  font-family: var(--fontStack);
  font-size: var(--f4);
  color: var(--textPrimary);
  background: var(--whiteBase);
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  -webkit-font-smoothing: antialiased;
}

/* ── 环境光晕（日冕效果，极淡） ── */
.ambient-glow {
  position: fixed;
  pointer-events: none;
  z-index: 0;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.25;
}
.glow-top-right {
  width: 600px; height: 600px;
  top: -200px; right: -150px;
  background: radial-gradient(circle, rgba(245,166,35,0.12) 0%, transparent 70%);
}
.glow-bottom-left {
  width: 500px; height: 500px;
  bottom: -150px; left: -100px;
  background: radial-gradient(circle, rgba(30,160,255,0.08) 0%, transparent 70%);
}

/* ── 顶栏 ── */
.topbar {
  height: 56px;
  background: var(--whiteHeader);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--s6);
  flex-shrink: 0;
  position: relative;
  z-index: 10;
  box-shadow: var(--shadowTopbar);
}
.topbar::after {
  content: '';
  position: absolute;
  bottom: 0; left: var(--s6); right: var(--s6);
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(0,114,204,0.15) 50%, transparent 100%);
}
.topbar-left { display: flex; align-items: center; gap: var(--s3); }
.logo-dot {
  width: 12px; height: 12px;
  border-radius: 50%;
  background: var(--gold);
  box-shadow: 0 0 12px rgba(245,166,35,0.5);
  animation: logoPulse 3s ease-in-out infinite;
}
@keyframes logoPulse {
  0%, 100% { box-shadow: 0 0 8px rgba(245,166,35,0.4); }
  50% { box-shadow: 0 0 20px rgba(245,166,35,0.7); }
}
.logo-name { font-size: var(--f5); font-weight: 700; color: var(--blueInk); letter-spacing: -0.3px; }
.logo-divider { width: 1px; height: 16px; background: #E5E8EC; }
.logo-sub { font-size: var(--f2); color: var(--textSecondary); }

.topbar-right { display: flex; align-items: center; gap: var(--s5); }
.topbar-link {
  font-size: var(--f3); color: var(--textSecondary); cursor: pointer;
  transition: color 0.15s; position: relative;
}
.topbar-link:hover { color: var(--blueCore); }
.badge-dot {
  position: absolute; top: -4px; right: -14px;
  background: var(--fail); color: #fff; font-size: 10px; font-weight: 700;
  min-width: 16px; height: 16px; line-height: 16px; text-align: center;
  border-radius: var(--rFull); padding: 0 5px;
}
.avatar {
  width: 32px; height: 32px; border-radius: var(--rFull);
  background: var(--blueCore); color: #fff;
  font-size: var(--f2); font-weight: 600;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
}

/* ── 主体布局 ── */
.body-wrap { display: flex; flex: 1; overflow: hidden; position: relative; z-index: 1; }

/* ── 侧边栏 ── */
.sidenav {
  width: 180px; background: var(--whiteSide);
  display: flex; flex-direction: column; flex-shrink: 0;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-right: 1px solid #F0F1F3;
}
.sidenav.fold { width: 56px; }
.sidenav-nav { flex: 1; padding: var(--s3) var(--s2); display: flex; flex-direction: column; gap: 1px; }
.sidenav-item {
  display: flex; align-items: center; gap: var(--s3);
  padding: 10px var(--s3); border-radius: var(--r2);
  cursor: pointer; transition: all 0.2s;
  color: var(--textSecondary); font-size: var(--f4);
  position: relative; min-height: 40px;
}
.sidenav-item:hover { background: var(--blueIce); color: var(--blueInk); }
.sidenav-item.on { color: var(--blueCore); font-weight: 600; }
.sidenav-item.on .sidenav-dot {
  background: var(--blueCore);
  box-shadow: 0 0 8px rgba(0,114,204,0.5);
  transform: scale(1.3);
}
.sidenav-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: #D0D5DD;
  flex-shrink: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.sidenav.fold .sidenav-item { justify-content: center; padding: 10px; }
.sidenav.fold .sidenav-dot { width: var(--dot-size); height: var(--dot-size); }
.sidenav.fold .sidenav-item.on .sidenav-dot { transform: scale(1.5); }
.sidenav-label { white-space: nowrap; }
.sidenav-fold {
  padding: var(--s3); border-top: 1px solid #F0F1F3;
  text-align: center; cursor: pointer; user-select: none;
  color: var(--textMuted); font-size: var(--f5);
  transition: color 0.15s; flex-shrink: 0;
}
.sidenav-fold:hover { color: var(--blueCore); }
.fold-arrow { display: inline-block; transition: transform 0.3s; }
.fold-arrow.flipped { transform: rotate(180deg); }

/* ── 内容区 ── */
.content {
  flex: 1; overflow-y: auto; overflow-x: hidden;
  padding: var(--s7) var(--s7);
  display: flex; flex-direction: column; gap: var(--s5);
}

/* ── 页面标题行 + 日冕装饰 ── */
.page-top { display: flex; justify-content: space-between; align-items: flex-start; }
.page-heading { font-size: var(--f7); font-weight: 700; color: var(--blueInk); margin: 0; letter-spacing: -0.5px; }
.page-meta { font-size: var(--f2); color: var(--textMuted); margin: var(--s1) 0 0 0; }
.sun-ring {
  width: 48px; height: 48px; border-radius: 50%; position: relative;
  background: radial-gradient(circle, rgba(245,166,35,0.15) 0%, transparent 70%);
  flex-shrink: 0;
}
.sun-core {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
  width: 12px; height: 12px; border-radius: 50%; background: var(--gold);
  box-shadow: 0 0 16px rgba(245,166,35,0.4);
}
.sun-halo {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
  width: 36px; height: 36px; border-radius: 50%;
  border: 1px solid rgba(245,166,35,0.2);
  animation: haloSpin 20s linear infinite;
}
@keyframes haloSpin {
  to { transform: translate(-50%,-50%) rotate(360deg); }
}

/* ── KPI 卡片网格 ── */
.kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--s4); }
.kpi {
  background: var(--whiteCard); border-radius: var(--r3);
  padding: var(--s5) var(--s5);
  box-shadow: var(--shadowCard);
  transition: box-shadow 0.25s ease, transform 0.25s ease;
  display: flex; flex-direction: column; gap: var(--s3);
  position: relative; overflow: hidden;
}
.kpi::before {
  content: ''; position: absolute; top: 0; left: var(--s5); right: var(--s5);
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(0,114,204,0.3) 50%, transparent 100%);
  opacity: 0; transition: opacity 0.25s;
}
.kpi:hover {
  box-shadow: var(--shadowHover);
  transform: translateY(-2px);
}
.kpi:hover::before { opacity: 1; }
.kpi-top { display: flex; justify-content: space-between; align-items: center; }
.kpi-symbol { font-size: var(--f6); line-height: 1; }
.kpi-trend { font-size: var(--f1); font-weight: 700; padding: 2px 8px; border-radius: var(--rFull); }
.kpi-trend.up { color: var(--ok); background: #EFFAF3; }
.kpi-trend.down { color: var(--fail); background: #FDF0EF; }
.kpi-metric { display: flex; align-items: baseline; gap: var(--s2); }
.kpi-val {
  font-size: var(--f8); font-weight: 700; color: var(--blueInk);
  font-family: var(--fontMono); line-height: 1; letter-spacing: -1px;
}
.kpi-unit { font-size: var(--f3); color: var(--textSecondary); }
.kpi-tag { font-size: var(--f2); color: var(--textSecondary); font-weight: 500; }

/* ── 双列布局 ── */
.dual-col { display: grid; grid-template-columns: 1fr 340px; gap: var(--s4); }

/* ── 面板通用 ── */
.panel {
  background: var(--whiteCard); border-radius: var(--r3);
  box-shadow: var(--shadowCard); overflow: hidden;
}
.panel-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: var(--s4) var(--s5);
  border-bottom: 1px solid #F2F3F5;
}
.panel-title { font-size: var(--f4); font-weight: 600; color: var(--blueInk); }
.panel-action { font-size: var(--f3); color: var(--blueCore); cursor: pointer; font-weight: 500; }
.panel-action:hover { opacity: 0.8; }
.panel-chip {
  font-size: 10px; font-weight: 700; letter-spacing: 0.5px;
  padding: 3px 10px; border-radius: var(--rFull);
}
.panel-chip.live { color: var(--ok); background: #EFFAF3; }
.panel-chip.ok { color: var(--blueCore); background: var(--blueIce); }

/* ── 图表 ── */
.chart-area { padding: var(--s5) var(--s5) var(--s4); height: 240px; }
.chart-bars {
  display: flex; align-items: flex-end; gap: 2px;
  height: 100%; padding-bottom: 24px; position: relative;
}
.bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end; }
.bar-fill {
  width: 100%; max-width: 36px;
  background: linear-gradient(180deg, var(--blueSky) 0%, var(--blueCore) 100%);
  border-radius: 3px 3px 0 0; transition: opacity 0.15s; min-height: 2px;
}
.bar-fill:hover { opacity: 0.75; }
.bar-label {
  position: absolute; bottom: 0;
  font-size: 10px; color: var(--textMuted); font-weight: 500;
}

/* ── 设备状态 ── */
.status-rows { padding: var(--s2) 0; }
.st-row {
  display: flex; align-items: center; gap: var(--s3);
  padding: 10px var(--s5); transition: background 0.1s;
}
.st-row:hover { background: var(--blueIce); }
.st-pip { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.st-pip.ok { background: var(--ok); }
.st-pip.warn { background: var(--warn); }
.st-pip.fail { background: var(--fail); }
.st-name { flex: 1; font-size: var(--f4); color: var(--textPrimary); }
.st-pct { font-weight: 600; color: var(--blueInk); font-size: var(--f4); width: 56px; text-align: right; }
.st-count { font-size: var(--f3); color: var(--textMuted); width: 32px; text-align: right; }

/* ── 表格 ── */
.table { width: 100%; border-collapse: collapse; font-size: var(--f4); }
.table th {
  text-align: left; padding: var(--s3) var(--s5);
  font-size: var(--f1); font-weight: 700; color: var(--textMuted);
  text-transform: uppercase; letter-spacing: 0.6px;
  background: var(--blueIce); border-bottom: 1px solid #EDF0F4;
}
.table td {
  padding: var(--s3) var(--s5);
  border-bottom: 1px solid #F5F6F8;
  color: var(--textPrimary);
}
.table tbody tr { transition: background 0.12s; }
.table tbody tr:hover { background: #FFFDF7; }
.cell-name { font-weight: 600; color: var(--blueInk); }
.cell-num { font-family: var(--fontMono); font-size: var(--f3); font-weight: 500; }
.cell-link { color: var(--blueCore); cursor: pointer; font-weight: 500; }
.cell-link:hover { opacity: 0.7; }

.pr-badge {
  font-size: var(--f3); font-weight: 700; padding: 2px 8px; border-radius: var(--rFull);
}
.pr-badge.good { color: var(--ok); background: #EFFAF3; }
.pr-badge.ok { color: #B8860B; background: #FFF8EC; }
.pr-badge.warn { color: var(--fail); background: #FDF0EF; }

.status-tag {
  font-size: var(--f2); font-weight: 600; padding: 3px 10px; border-radius: var(--rFull);
}
.status-tag.normal { color: var(--ok); background: #EFFAF3; }
.status-tag.abnormal { color: var(--fail); background: #FDF0EF; }
</style>
