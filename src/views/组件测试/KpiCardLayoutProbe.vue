<template>
  <div class="probe-container">
    <h2 class="probe-title">KPI 卡片字体 & 布局探究</h2>

    <!-- 方案 A（当前基准） -->
    <section class="version-block">
      <h3>方案 A · 基准（数值 28px / 标签 15px / 网格值 16px）</h3>
      <div class="merged-card-box">
        <div class="gauge-card-small">
          <div class="gauge-sim">仪表盘<br>280×300</div>
        </div>
        <div class="kpi-card-wide kpi-ver-a">
          <div class="kpi-grid-3col-wide">
            <div class="data-card">
              <span class="card-label">当日发电量</span>
              <span class="card-value">1,250<span class="card-unit">kWh</span></span>
              <div class="card-grid-2x2">
                <div class="grid-cell"><div class="cell-label">较昨日同期</div><div class="cell-value">+6.2%</div></div>
                <div class="grid-cell"><div class="cell-label">累计发电量</div><div class="cell-value">38,500 kWh</div></div>
              </div>
            </div>
            <div class="data-card">
              <span class="card-label">当日收益</span>
              <span class="card-value">¥ 825</span>
              <div class="card-grid-2x2">
                <div class="grid-cell"><div class="cell-label">当年收益</div><div class="cell-value">98,200 元</div></div>
                <div class="grid-cell"><div class="cell-label">累计</div><div class="cell-value">425,000 元</div></div>
                <div class="grid-cell"><div class="cell-label">上网电价</div><div class="cell-value">0.4 元/kWh</div></div>
                <div class="grid-cell"><div class="cell-label">自用电价</div><div class="cell-value">0.6 元/kWh</div></div>
              </div>
            </div>
            <div class="data-card">
              <span class="card-label">系统运行状态</span>
              <div class="status-sim">正在运行</div>
              <div class="card-grid-2x2">
                <div class="grid-cell"><div class="cell-label">告警数量</div><div class="cell-value">2</div></div>
                <div class="grid-cell"><div class="cell-label">逆变器</div><div class="cell-value">4/5</div></div>
                <div class="grid-cell"><div class="cell-label">日满发小时</div><div class="cell-value">4.2 h</div></div>
                <div class="grid-cell"><div class="cell-label">实时功率占比</div><div class="cell-value">62%</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 方案 B · 数值加大（32px），标签微调 -->
    <section class="version-block">
      <h3>方案 B · 数值加大（32px / 标签 14px / 网格值 17px）</h3>
      <div class="merged-card-box">
        <div class="gauge-card-small">
          <div class="gauge-sim">仪表盘<br>280×300</div>
        </div>
        <div class="kpi-card-wide kpi-ver-b">
          <div class="kpi-grid-3col-wide">
            <div class="data-card">
              <span class="card-label">当日发电量</span>
              <span class="card-value">1,250<span class="card-unit">kWh</span></span>
              <div class="card-grid-2x2">
                <div class="grid-cell"><div class="cell-label">较昨日同期</div><div class="cell-value">+6.2%</div></div>
                <div class="grid-cell"><div class="cell-label">累计发电量</div><div class="cell-value">38,500 kWh</div></div>
              </div>
            </div>
            <div class="data-card">
              <span class="card-label">当日收益</span>
              <span class="card-value">¥ 825</span>
              <div class="card-grid-2x2">
                <div class="grid-cell"><div class="cell-label">当年收益</div><div class="cell-value">98,200 元</div></div>
                <div class="grid-cell"><div class="cell-label">累计</div><div class="cell-value">425,000 元</div></div>
                <div class="grid-cell"><div class="cell-label">上网电价</div><div class="cell-value">0.4 元/kWh</div></div>
                <div class="grid-cell"><div class="cell-label">自用电价</div><div class="cell-value">0.6 元/kWh</div></div>
              </div>
            </div>
            <div class="data-card">
              <span class="card-label">系统运行状态</span>
              <div class="status-sim">正在运行</div>
              <div class="card-grid-2x2">
                <div class="grid-cell"><div class="cell-label">告警数量</div><div class="cell-value">2</div></div>
                <div class="grid-cell"><div class="cell-label">逆变器</div><div class="cell-value">4/5</div></div>
                <div class="grid-cell"><div class="cell-label">日满发小时</div><div class="cell-value">4.2 h</div></div>
                <div class="grid-cell"><div class="cell-label">实时功率占比</div><div class="cell-value">62%</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 方案 C · 数值略小（26px），标签突出（16px） -->
    <section class="version-block">
      <h3>方案 C · 数值略小 & 标签突出（数值 26px / 标签 16px / 网格值 15px）</h3>
      <div class="merged-card-box">
        <div class="gauge-card-small">
          <div class="gauge-sim">仪表盘<br>280×300</div>
        </div>
        <div class="kpi-card-wide kpi-ver-c">
          <div class="kpi-grid-3col-wide">
            <div class="data-card">
              <span class="card-label">当日发电量</span>
              <span class="card-value">1,250<span class="card-unit">kWh</span></span>
              <div class="card-grid-2x2">
                <div class="grid-cell"><div class="cell-label">较昨日同期</div><div class="cell-value">+6.2%</div></div>
                <div class="grid-cell"><div class="cell-label">累计发电量</div><div class="cell-value">38,500 kWh</div></div>
              </div>
            </div>
            <div class="data-card">
              <span class="card-label">当日收益</span>
              <span class="card-value">¥ 825</span>
              <div class="card-grid-2x2">
                <div class="grid-cell"><div class="cell-label">当年收益</div><div class="cell-value">98,200 元</div></div>
                <div class="grid-cell"><div class="cell-label">累计</div><div class="cell-value">425,000 元</div></div>
                <div class="grid-cell"><div class="cell-label">上网电价</div><div class="cell-value">0.4 元/kWh</div></div>
                <div class="grid-cell"><div class="cell-label">自用电价</div><div class="cell-value">0.6 元/kWh</div></div>
              </div>
            </div>
            <div class="data-card">
              <span class="card-label">系统运行状态</span>
              <div class="status-sim">正在运行</div>
              <div class="card-grid-2x2">
                <div class="grid-cell"><div class="cell-label">告警数量</div><div class="cell-value">2</div></div>
                <div class="grid-cell"><div class="cell-label">逆变器</div><div class="cell-value">4/5</div></div>
                <div class="grid-cell"><div class="cell-label">日满发小时</div><div class="cell-value">4.2 h</div></div>
                <div class="grid-cell"><div class="cell-label">实时功率占比</div><div class="cell-value">62%</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 方案 D · 两列布局 + 数值 30px -->
    <section class="version-block">
      <h3>方案 D · 两列布局 & 加大卡片（数值 30px / 标签 15px）</h3>
      <div class="merged-card-box">
        <div class="gauge-card-small">
          <div class="gauge-sim">仪表盘<br>280×300</div>
        </div>
        <div class="kpi-card-wide kpi-ver-d">
          <div class="kpi-grid-2col-wide">
            <!-- 第一列：发电量 + 收益 -->
            <div class="data-card data-card-lg">
              <span class="card-label">当日发电量</span>
              <span class="card-value">1,250<span class="card-unit">kWh</span></span>
              <div class="card-grid-2x2">
                <div class="grid-cell"><div class="cell-label">较昨日同期</div><div class="cell-value">+6.2%</div></div>
                <div class="grid-cell"><div class="cell-label">累计</div><div class="cell-value">38,500 kWh</div></div>
              </div>
              <div class="card-seg-line"></div>
              <span class="card-label">当日收益</span>
              <span class="card-value">¥ 825</span>
              <div class="card-grid-2x2">
                <div class="grid-cell"><div class="cell-label">当年收益</div><div class="cell-value">98,200 元</div></div>
                <div class="grid-cell"><div class="cell-label">累计</div><div class="cell-value">425,000 元</div></div>
              </div>
            </div>
            <!-- 第二列：运行状态 + 电价等 -->
            <div class="data-card data-card-lg">
              <span class="card-label">系统运行状态</span>
              <div class="status-sim">正在运行</div>
              <div class="card-grid-2x2">
                <div class="grid-cell"><div class="cell-label">告警数量</div><div class="cell-value">2</div></div>
                <div class="grid-cell"><div class="cell-label">逆变器</div><div class="cell-value">4/5</div></div>
                <div class="grid-cell"><div class="cell-label">日满发小时</div><div class="cell-value">4.2 h</div></div>
                <div class="grid-cell"><div class="cell-label">实时功率占比</div><div class="cell-value">62%</div></div>
                <div class="grid-cell"><div class="cell-label">上网电价</div><div class="cell-value">0.4 元/kWh</div></div>
                <div class="grid-cell"><div class="cell-label">自用电价</div><div class="cell-value">0.6 元/kWh</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
// 纯展示组件，无逻辑
</script>

<style scoped>
/* 全局容器 */
.probe-container {
  padding: 24px;
  background: #f0f2f5;
  min-height: 100vh;
}
.probe-title {
  font-size: 24px;
  margin-bottom: 24px;
  color: #1a1a2e;
}
.version-block {
  margin-bottom: 48px;
}
.version-block h3 {
  font-size: 16px;
  margin-bottom: 12px;
  color: #555;
  background: #fff;
  padding: 8px 16px;
  border-radius: 8px;
  display: inline-block;
}

/* 复用原组件布局（merged-card-box/gauge-card-small/kpi-card-wide） */
.merged-card-box {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  display: flex;
  padding: 0;
  width: 100%;
  min-width: 0;
}
.gauge-card-small {
  flex: 0 0 280px;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.gauge-sim {
  width: 260px;
  height: 260px;
  border: 2px dashed #ccc;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 14px;
  text-align: center;
  line-height: 1.5;
}
.kpi-card-wide {
  flex: 1;
  height: 300px;
  display: flex;
  align-items: center;
  min-width: 0;
}

/* 方案 A 样式（基准） */
.kpi-ver-a .kpi-grid-3col-wide {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 16px 20px;
}
.kpi-ver-a .data-card {
  background: #F8F9FA;
  border-radius: 12px;
  padding: 20px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.kpi-ver-a .card-label { font-size: 15px; color: #666; }
.kpi-ver-a .card-value { font-size: 28px; font-weight: bold; color: #1D2129; line-height: 1; }
.kpi-ver-a .card-unit { font-size: 14px; font-weight: normal; color: #666; margin-left: 4px; }
.kpi-ver-a .card-grid-2x2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 14px; width: 100%; margin-top: 4px; }
.kpi-ver-a .grid-cell { display: flex; flex-direction: column; align-items: flex-start; }
.kpi-ver-a .cell-label { font-size: 14px; color: #888; margin-bottom: 3px; }
.kpi-ver-a .cell-value { font-size: 16px; font-weight: 600; color: #1D2129; }

/* 方案 B · 数值加大 */
.kpi-ver-b .kpi-grid-3col-wide {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 16px 20px;
}
.kpi-ver-b .data-card {
  background: #F8F9FA;
  border-radius: 12px;
  padding: 20px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.kpi-ver-b .card-label { font-size: 14px; color: #666; }
.kpi-ver-b .card-value { font-size: 32px; font-weight: bold; color: #1D2129; line-height: 1; }
.kpi-ver-b .card-unit { font-size: 16px; font-weight: normal; color: #666; margin-left: 4px; }
.kpi-ver-b .card-grid-2x2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 14px; width: 100%; margin-top: 8px; }
.kpi-ver-b .grid-cell { display: flex; flex-direction: column; align-items: flex-start; }
.kpi-ver-b .cell-label { font-size: 13px; color: #888; margin-bottom: 3px; }
.kpi-ver-b .cell-value { font-size: 17px; font-weight: 600; color: #1D2129; }

/* 方案 C · 标签突出 */
.kpi-ver-c .kpi-grid-3col-wide {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 16px 20px;
}
.kpi-ver-c .data-card {
  background: #F8F9FA;
  border-radius: 12px;
  padding: 20px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.kpi-ver-c .card-label { font-size: 16px; font-weight: 500; color: #555; }
.kpi-ver-c .card-value { font-size: 26px; font-weight: bold; color: #1D2129; line-height: 1; }
.kpi-ver-c .card-unit { font-size: 14px; font-weight: normal; color: #666; margin-left: 4px; }
.kpi-ver-c .card-grid-2x2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 12px; width: 100%; margin-top: 4px; }
.kpi-ver-c .grid-cell { display: flex; flex-direction: column; align-items: flex-start; }
.kpi-ver-c .cell-label { font-size: 14px; color: #888; margin-bottom: 2px; }
.kpi-ver-c .cell-value { font-size: 15px; font-weight: 600; color: #1D2129; }

/* 方案 D · 两列布局 */
.kpi-ver-d .kpi-grid-2col-wide {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  padding: 16px 20px;
}
.kpi-ver-d .data-card-lg {
  background: #F8F9FA;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-height: 260px; /* 保证两列高度一致 */
}
.kpi-ver-d .card-label { font-size: 15px; color: #666; }
.kpi-ver-d .card-value { font-size: 30px; font-weight: bold; color: #1D2129; line-height: 1; }
.kpi-ver-d .card-unit { font-size: 15px; font-weight: normal; color: #666; margin-left: 4px; }
.kpi-ver-d .card-grid-2x2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 14px; width: 100%; margin-top: 6px; }
.kpi-ver-d .grid-cell { display: flex; flex-direction: column; align-items: flex-start; }
.kpi-ver-d .cell-label { font-size: 14px; color: #888; }
.kpi-ver-d .cell-value { font-size: 16px; font-weight: 600; color: #1D2129; }
.kpi-ver-d .card-seg-line {
  width: 80%;
  height: 1px;
  background: #e0e0e0;
  margin: 8px 0 4px;
}

/* 状态模拟 */
.status-sim {
  font-size: 18px;
  font-weight: bold;
  color: #52c41a;
  margin-bottom: 4px;
}
</style>