<script setup>
const stations = [
  {
    id: 'tongxiang',
    name: '桐乡光伏电站',
    location: '浙江 · 嘉兴',
    power: '2.86 MW',
    todayEnergy: '18,642 kWh',
    todayProfit: '12,303 ¥',
    efficiency: '97.2%',
    irradiance: '826 W/m²',
    alarm: 0,
    gradient: 'linear-gradient(135deg, #1a3a4a 0%, #2d6a4f 30%, #52b788 60%, #d8f3dc 100%)',
    photoHint: '桐乡 · 渔光互补'
  },
  {
    id: 'haining',
    name: '海宁光伏电站',
    location: '浙江 · 嘉兴',
    power: '4.12 MW',
    todayEnergy: '24,318 kWh',
    todayProfit: '16,050 ¥',
    efficiency: '95.8%',
    irradiance: '791 W/m²',
    alarm: 1,
    gradient: 'linear-gradient(135deg, #1b3a4b 0%, #2c7da0 30%, #61a5c2 60%, #e0fbfc 100%)',
    photoHint: '海宁 · 农光互补'
  },
  {
    id: 'pinghu',
    name: '平湖光伏电站',
    location: '浙江 · 嘉兴',
    power: '1.76 MW',
    todayEnergy: '11,047 kWh',
    todayProfit: '7,291 ¥',
    efficiency: '98.1%',
    irradiance: '852 W/m²',
    alarm: 0,
    gradient: 'linear-gradient(135deg, #2d1b69 0%, #5a189a 30%, #9d4edd 60%, #e0aaff 100%)',
    photoHint: '平湖 · 屋顶分布式'
  },
]

const quickLinks = [
  { label: '设备远程控制', desc: '开关机、功率调节、参数下发', icon: '⚙' },
  { label: '智能派单系统', desc: '故障自动派单 · 工单跟踪', icon: '📋' },
  { label: '设备健康度', desc: 'AI 预测性维护 · 寿命评估', icon: '💚' },
  { label: 'IV 诊断', desc: '全量 IV 曲线扫描与分析', icon: '📊' },
]
</script>

<template>
  <div class="immersive">
    <!-- Station Photo Banners -->
    <section
      v-for="st in stations" :key="st.id"
      class="imm-station"
    >
      <!-- Photo Background -->
      <div class="imm-photo" :style="{ background: st.gradient }">
        <div class="imm-photo-overlay">
          <div class="imm-photo-label">{{ st.photoHint }}</div>
        </div>
      </div>

      <!-- Data Overlay -->
      <div class="imm-data-sheet">
        <div class="imm-station-header">
          <div>
            <h2 class="imm-station-name">{{ st.name }}</h2>
            <p class="imm-station-loc">{{ st.location }}</p>
          </div>
          <div class="imm-station-status" :class="{ 'has-alarm': st.alarm > 0 }">
            <span class="imm-status-dot"></span>
            {{ st.alarm > 0 ? `${st.alarm} 条告警` : '运行正常' }}
          </div>
        </div>

        <div class="imm-kpi-strip">
          <div class="imm-kpi-item">
            <span class="imm-kpi-label">实时功率</span>
            <span class="imm-kpi-value">{{ st.power }}</span>
          </div>
          <div class="imm-kpi-item">
            <span class="imm-kpi-label">今日发电</span>
            <span class="imm-kpi-value">{{ st.todayEnergy }}</span>
          </div>
          <div class="imm-kpi-item">
            <span class="imm-kpi-label">今日收益</span>
            <span class="imm-kpi-value">{{ st.todayProfit }}</span>
          </div>
          <div class="imm-kpi-item">
            <span class="imm-kpi-label">转换效率</span>
            <span class="imm-kpi-value">{{ st.efficiency }}</span>
          </div>
          <div class="imm-kpi-item">
            <span class="imm-kpi-label">当前辐照</span>
            <span class="imm-kpi-value">{{ st.irradiance }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- System Overview Banner -->
    <section class="imm-overview">
      <div class="imm-overview-bg"></div>
      <div class="imm-overview-content">
        <h2 class="imm-overview-title">嘉兴区域 · 今日总览</h2>
        <div class="imm-overview-stats">
          <div class="imm-overview-stat">
            <div class="imm-os-value">8.74<span>MW</span></div>
            <div class="imm-os-label">实时总功率</div>
          </div>
          <div class="imm-overview-stat">
            <div class="imm-os-value">54,007<span>kWh</span></div>
            <div class="imm-os-label">总发电量</div>
          </div>
          <div class="imm-overview-stat">
            <div class="imm-os-value">35,644<span>¥</span></div>
            <div class="imm-os-label">总收益</div>
          </div>
          <div class="imm-overview-stat">
            <div class="imm-os-value">96.3<span>%</span></div>
            <div class="imm-os-label">设备健康率</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Quick Actions -->
    <section class="imm-actions">
      <a v-for="link in quickLinks" :key="link.label" href="#" class="imm-action-card">
        <span class="imm-action-icon">{{ link.icon }}</span>
        <div class="imm-action-text">
          <span class="imm-action-label">{{ link.label }}</span>
          <span class="imm-action-desc">{{ link.desc }}</span>
        </div>
        <span class="imm-action-arrow">&rarr;</span>
      </a>
    </section>

    <footer class="imm-footer">
      <span>光伏监控系统 v3.2</span>
      <span>·</span>
      <span>数据最后更新 14:32:05</span>
      <span>·</span>
      <span>今日天气 晴 22°-26°</span>
    </footer>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700&family=Noto+Sans+SC:wght@400;500;600;700&display=swap');

*, *::after, *::before { box-sizing: border-box; margin: 0; padding: 0; }

.immersive {
  --ink: #1a1a1a;
  --ink-dim: #6b6b6b;
  --surface: rgba(255,255,255,0.85);
  --surface-glass: rgba(255,255,255,0.6);
  --accent: #2d6a4f;
  --danger: #d94a4a;

  font-family: 'Inter', 'Noto Sans SC', system-ui, sans-serif;
  color: var(--ink); -webkit-font-smoothing: antialiased;
  background: #f5f5f0;
}

/* Station Banner */
.imm-station { margin-bottom: 0.5rem; }
.imm-photo {
  position: relative; height: 340px; overflow: hidden;
}
.imm-photo-overlay {
  position: absolute; inset: 0;
  display: flex; align-items: flex-end; justify-content: flex-end;
  padding: 2rem;
  background: linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 50%);
}
.imm-photo-label {
  font-size: 0.8rem; color: rgba(255,255,255,0.7);
  letter-spacing: 0.08em; font-weight: 500;
}

/* Data Sheet — floats over photo bottom */
.imm-data-sheet {
  background: var(--surface);
  backdrop-filter: blur(16px);
  margin: -3rem 2rem 0;
  position: relative; z-index: 2;
  border-radius: 12px; padding: 1.5rem 2rem;
  border: 1px solid rgba(0,0,0,0.06);
  box-shadow: 0 2px 24px rgba(0,0,0,0.06);
}

.imm-station-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  margin-bottom: 1.25rem;
}
.imm-station-name { font-size: 1.3rem; font-weight: 700; letter-spacing: -0.02em; }
.imm-station-loc { font-size: 0.75rem; color: var(--ink-dim); margin-top: 0.15rem; }
.imm-station-status {
  display: flex; align-items: center; gap: 0.4rem;
  font-size: 0.7rem; color: #52b788; padding: 0.35rem 0.75rem;
  background: rgba(82,183,136,0.1); border-radius: 20px;
}
.imm-station-status.has-alarm { color: var(--danger); background: rgba(217,74,74,0.08); }
.imm-status-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

/* KPI Strip */
.imm-kpi-strip { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1rem; }
.imm-kpi-item { display: flex; flex-direction: column; gap: 0.2rem; }
.imm-kpi-label {
  font-size: 0.6rem; text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--ink-dim);
}
.imm-kpi-value { font-size: 1.35rem; font-weight: 700; letter-spacing: -0.02em; }

/* Overview Banner */
.imm-overview {
  position: relative; margin: 2rem 2rem;
  border-radius: 16px; overflow: hidden;
  min-height: 200px; display: flex; align-items: center;
}
.imm-overview-bg {
  position: absolute; inset: 0;
  background: linear-gradient(135deg, #0f2027 0%, #203a43 40%, #2c5364 100%);
}
.imm-overview-content {
  position: relative; z-index: 2; padding: 3rem; width: 100%;
}
.imm-overview-title { font-size: 1rem; color: rgba(255,255,255,0.6); font-weight: 500; margin-bottom: 1.5rem; letter-spacing: 0.04em; }
.imm-overview-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2rem; }
.imm-overview-stat { }
.imm-os-value { font-size: 2.5rem; font-weight: 700; color: #fff; letter-spacing: -0.03em; line-height: 1; }
.imm-os-value span { font-size: 1rem; font-weight: 400; opacity: 0.5; margin-left: 0.2rem; }
.imm-os-label { font-size: 0.65rem; color: rgba(255,255,255,0.4); margin-top: 0.4rem; text-transform: uppercase; letter-spacing: 0.08em; }

/* Quick Actions */
.imm-actions { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin: 0 2rem 3rem; }
.imm-action-card {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 1.25rem; background: var(--surface);
  border-radius: 10px; border: 1px solid rgba(0,0,0,0.05);
  text-decoration: none; color: inherit;
  transition: transform 0.2s, box-shadow 0.2s;
}
.imm-action-card:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
.imm-action-icon { font-size: 1.5rem; }
.imm-action-text { flex: 1; }
.imm-action-label { display: block; font-size: 0.8rem; font-weight: 600; }
.imm-action-desc { display: block; font-size: 0.65rem; color: var(--ink-dim); margin-top: 0.15rem; }
.imm-action-arrow { font-size: 1rem; color: var(--ink-dim); }

/* Footer */
.imm-footer {
  display: flex; justify-content: center; gap: 1rem; padding: 2rem;
  font-size: 0.65rem; color: var(--ink-dim); border-top: 1px solid rgba(0,0,0,0.06);
}

@media (max-width: 768px) {
  .imm-data-sheet { margin: -2rem 1rem 0; padding: 1rem 1.25rem; }
  .imm-kpi-strip { grid-template-columns: repeat(3, 1fr); gap: 0.75rem; }
  .imm-overview-stats { grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
  .imm-actions { grid-template-columns: repeat(2, 1fr); margin: 0 1rem 2rem; }
  .imm-overview { margin: 2rem 1rem; }
}
</style>
