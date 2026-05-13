<template>
  <div class="probe-container">
    <h2 class="probe-title">KPI 卡片文字样式探究 (共9版)</h2>

    <!-- ██ 方案 A · 原最大号（仅作对比）██ -->
    <section class="version-block">
      <h3>A · 原最大号 28px bold / 标签15px / 网格值16px （对比基准）</h3>
      <div class="merged-card-box kpi-ver-a">
        <div class="gauge-card-small"><div class="gauge-sim">仪表盘</div></div>
        <div class="kpi-card-wide"><div class="kpi-grid-3col">
          <div class="data-card">
            <div class="card-label">当日发电量</div>
            <div class="card-value">1,250<span class="card-unit">kWh</span></div>
            <div class="card-grid-2x2">
              <div class="grid-cell"><span class="cell-label">较昨日同期</span><span class="cell-value">+6.2%</span></div>
              <div class="grid-cell"><span class="cell-label">累计发电量</span><span class="cell-value">38,500 kWh</span></div>
            </div>
          </div>
          <div class="data-card">
            <div class="card-label">当日收益</div>
            <div class="card-value">¥ 825</div>
            <div class="card-grid-2x2">
              <div class="grid-cell"><span class="cell-label">当年收益</span><span class="cell-value">98,200 元</span></div>
              <div class="grid-cell"><span class="cell-label">累计</span><span class="cell-value">425,000 元</span></div>
              <div class="grid-cell"><span class="cell-label">上网电价</span><span class="cell-value">0.4 元/kWh</span></div>
              <div class="grid-cell"><span class="cell-label">自用电价</span><span class="cell-value">0.6 元/kWh</span></div>
            </div>
          </div>
          <div class="data-card">
            <div class="card-label">系统运行状态</div>
            <div class="status-sim">运行中</div>
            <div class="card-grid-2x2">
              <div class="grid-cell"><span class="cell-label">告警数量</span><span class="cell-value">2</span></div>
              <div class="grid-cell"><span class="cell-label">逆变器</span><span class="cell-value">4/5</span></div>
              <div class="grid-cell"><span class="cell-label">日满发小时</span><span class="cell-value">4.2 h</span></div>
              <div class="grid-cell"><span class="cell-label">实时功率</span><span class="cell-value">62%</span></div>
            </div>
          </div>
        </div></div>
      </div>
    </section>

    <!-- ██ 方案 B · 常规缩小 24px bold ██ -->
    <section class="version-block">
      <h3>B · 数值 24px bold / 标签14px / 网格值15px（第一档缩小）</h3>
      <div class="merged-card-box kpi-ver-b">
        <div class="gauge-card-small"><div class="gauge-sim">仪表盘</div></div>
        <div class="kpi-card-wide"><div class="kpi-grid-3col">
          <div class="data-card">
            <div class="card-label">当日发电量</div>
            <div class="card-value">1,250<span class="card-unit">kWh</span></div>
            <div class="card-grid-2x2">
              <div class="grid-cell"><span class="cell-label">较昨日同期</span><span class="cell-value">+6.2%</span></div>
              <div class="grid-cell"><span class="cell-label">累计发电量</span><span class="cell-value">38,500 kWh</span></div>
            </div>
          </div>
          <div class="data-card">
            <div class="card-label">当日收益</div>
            <div class="card-value">¥ 825</div>
            <div class="card-grid-2x2">
              <div class="grid-cell"><span class="cell-label">当年收益</span><span class="cell-value">98,200 元</span></div>
              <div class="grid-cell"><span class="cell-label">累计</span><span class="cell-value">425,000 元</span></div>
              <div class="grid-cell"><span class="cell-label">上网电价</span><span class="cell-value">0.4 元/kWh</span></div>
              <div class="grid-cell"><span class="cell-label">自用电价</span><span class="cell-value">0.6 元/kWh</span></div>
            </div>
          </div>
          <div class="data-card">
            <div class="card-label">系统运行状态</div>
            <div class="status-sim">运行中</div>
            <div class="card-grid-2x2">
              <div class="grid-cell"><span class="cell-label">告警数量</span><span class="cell-value">2</span></div>
              <div class="grid-cell"><span class="cell-label">逆变器</span><span class="cell-value">4/5</span></div>
              <div class="grid-cell"><span class="cell-label">日满发小时</span><span class="cell-value">4.2 h</span></div>
              <div class="grid-cell"><span class="cell-label">实时功率</span><span class="cell-value">62%</span></div>
            </div>
          </div>
        </div></div>
      </div>
    </section>

    <!-- ██ 方案 C · 优雅中型 20px + 深灰柔和 ██ -->
    <section class="version-block">
      <h3>C · 数值 20px medium 深灰 / 标签13px / 网格值14px（中型、柔和）</h3>
      <div class="merged-card-box kpi-ver-c">
        <div class="gauge-card-small"><div class="gauge-sim">仪表盘</div></div>
        <div class="kpi-card-wide"><div class="kpi-grid-3col">
          <div class="data-card">
            <div class="card-label">当日发电量</div>
            <div class="card-value">1,250<span class="card-unit">kWh</span></div>
            <div class="card-grid-2x2">
              <div class="grid-cell"><span class="cell-label">较昨日同期</span><span class="cell-value">+6.2%</span></div>
              <div class="grid-cell"><span class="cell-label">累计发电量</span><span class="cell-value">38,500 kWh</span></div>
            </div>
          </div>
          <div class="data-card">
            <div class="card-label">当日收益</div>
            <div class="card-value">¥ 825</div>
            <div class="card-grid-2x2">
              <div class="grid-cell"><span class="cell-label">当年收益</span><span class="cell-value">98,200 元</span></div>
              <div class="grid-cell"><span class="cell-label">累计</span><span class="cell-value">425,000 元</span></div>
              <div class="grid-cell"><span class="cell-label">上网电价</span><span class="cell-value">0.4 元/kWh</span></div>
              <div class="grid-cell"><span class="cell-label">自用电价</span><span class="cell-value">0.6 元/kWh</span></div>
            </div>
          </div>
          <div class="data-card">
            <div class="card-label">系统运行状态</div>
            <div class="status-sim">运行中</div>
            <div class="card-grid-2x2">
              <div class="grid-cell"><span class="cell-label">告警数量</span><span class="cell-value">2</span></div>
              <div class="grid-cell"><span class="cell-label">逆变器</span><span class="cell-value">4/5</span></div>
              <div class="grid-cell"><span class="cell-label">日满发小时</span><span class="cell-value">4.2 h</span></div>
              <div class="grid-cell"><span class="cell-label">实时功率</span><span class="cell-value">62%</span></div>
            </div>
          </div>
        </div></div>
      </div>
    </section>

    <!-- ██ 方案 D · 主题蓝色数字 22px bold ██ -->
    <section class="version-block">
      <h3>D · 数值 22px bold 蓝色 / 标签14px / 网格值14px（数字带品牌色）</h3>
      <div class="merged-card-box kpi-ver-d">
        <div class="gauge-card-small"><div class="gauge-sim">仪表盘</div></div>
        <div class="kpi-card-wide"><div class="kpi-grid-3col">
          <div class="data-card">
            <div class="card-label">当日发电量</div>
            <div class="card-value">1,250<span class="card-unit">kWh</span></div>
            <div class="card-grid-2x2">
              <div class="grid-cell"><span class="cell-label">较昨日同期</span><span class="cell-value">+6.2%</span></div>
              <div class="grid-cell"><span class="cell-label">累计发电量</span><span class="cell-value">38,500 kWh</span></div>
            </div>
          </div>
          <div class="data-card">
            <div class="card-label">当日收益</div>
            <div class="card-value">¥ 825</div>
            <div class="card-grid-2x2">
              <div class="grid-cell"><span class="cell-label">当年收益</span><span class="cell-value">98,200 元</span></div>
              <div class="grid-cell"><span class="cell-label">累计</span><span class="cell-value">425,000 元</span></div>
              <div class="grid-cell"><span class="cell-label">上网电价</span><span class="cell-value">0.4 元/kWh</span></div>
              <div class="grid-cell"><span class="cell-label">自用电价</span><span class="cell-value">0.6 元/kWh</span></div>
            </div>
          </div>
          <div class="data-card">
            <div class="card-label">系统运行状态</div>
            <div class="status-sim">运行中</div>
            <div class="card-grid-2x2">
              <div class="grid-cell"><span class="cell-label">告警数量</span><span class="cell-value">2</span></div>
              <div class="grid-cell"><span class="cell-label">逆变器</span><span class="cell-value">4/5</span></div>
              <div class="grid-cell"><span class="cell-label">日满发小时</span><span class="cell-value">4.2 h</span></div>
              <div class="grid-cell"><span class="cell-label">实时功率</span><span class="cell-value">62%</span></div>
            </div>
          </div>
        </div></div>
      </div>
    </section>

    <!-- ██ 方案 E · 左右横排布局 数值22px ██ -->
    <section class="version-block">
      <h3>E · 数值 22px bold + 标签数字左右排列（横向布局探索）</h3>
      <div class="merged-card-box kpi-ver-e">
        <div class="gauge-card-small"><div class="gauge-sim">仪表盘</div></div>
        <div class="kpi-card-wide"><div class="kpi-grid-3col">
          <div class="data-card data-card-horiz">
            <div class="horiz-item">
              <span class="horiz-label">当日发电量</span>
              <span class="horiz-value">1,250 <small>kWh</small></span>
            </div>
            <div class="card-grid-2x2">
              <div class="grid-cell"><span class="cell-label">较昨日同期</span><span class="cell-value">+6.2%</span></div>
              <div class="grid-cell"><span class="cell-label">累计发电量</span><span class="cell-value">38,500 kWh</span></div>
            </div>
          </div>
          <div class="data-card data-card-horiz">
            <div class="horiz-item">
              <span class="horiz-label">当日收益</span>
              <span class="horiz-value">¥ 825</span>
            </div>
            <div class="card-grid-2x2">
              <div class="grid-cell"><span class="cell-label">当年收益</span><span class="cell-value">98,200 元</span></div>
              <div class="grid-cell"><span class="cell-label">累计</span><span class="cell-value">425,000 元</span></div>
              <div class="grid-cell"><span class="cell-label">上网电价</span><span class="cell-value">0.4 元/kWh</span></div>
              <div class="grid-cell"><span class="cell-label">自用电价</span><span class="cell-value">0.6 元/kWh</span></div>
            </div>
          </div>
          <div class="data-card data-card-horiz">
            <div class="horiz-item">
              <span class="horiz-label">系统运行状态</span>
              <span class="horiz-value status-sim">运行中</span>
            </div>
            <div class="card-grid-2x2">
              <div class="grid-cell"><span class="cell-label">告警数量</span><span class="cell-value">2</span></div>
              <div class="grid-cell"><span class="cell-label">逆变器</span><span class="cell-value">4/5</span></div>
              <div class="grid-cell"><span class="cell-label">日满发小时</span><span class="cell-value">4.2 h</span></div>
              <div class="grid-cell"><span class="cell-label">实时功率</span><span class="cell-value">62%</span></div>
            </div>
          </div>
        </div></div>
      </div>
    </section>

    <!-- ██ 方案 F · 更小字体 18px bold + 紧凑间距 ██ -->
    <section class="version-block">
      <h3>F · 数值 18px bold / 标签12px / 网格值13px（更紧凑、信息密度高）</h3>
      <div class="merged-card-box kpi-ver-f">
        <div class="gauge-card-small"><div class="gauge-sim">仪表盘</div></div>
        <div class="kpi-card-wide"><div class="kpi-grid-3col">
          <div class="data-card">
            <div class="card-label">当日发电量</div>
            <div class="card-value">1,250<span class="card-unit">kWh</span></div>
            <div class="card-grid-2x2">
              <div class="grid-cell"><span class="cell-label">较昨日同期</span><span class="cell-value">+6.2%</span></div>
              <div class="grid-cell"><span class="cell-label">累计发电量</span><span class="cell-value">38,500 kWh</span></div>
            </div>
          </div>
          <div class="data-card">
            <div class="card-label">当日收益</div>
            <div class="card-value">¥ 825</div>
            <div class="card-grid-2x2">
              <div class="grid-cell"><span class="cell-label">当年收益</span><span class="cell-value">98,200 元</span></div>
              <div class="grid-cell"><span class="cell-label">累计</span><span class="cell-value">425,000 元</span></div>
              <div class="grid-cell"><span class="cell-label">上网电价</span><span class="cell-value">0.4 元/kWh</span></div>
              <div class="grid-cell"><span class="cell-label">自用电价</span><span class="cell-value">0.6 元/kWh</span></div>
            </div>
          </div>
          <div class="data-card">
            <div class="card-label">系统运行状态</div>
            <div class="status-sim">运行中</div>
            <div class="card-grid-2x2">
              <div class="grid-cell"><span class="cell-label">告警数量</span><span class="cell-value">2</span></div>
              <div class="grid-cell"><span class="cell-label">逆变器</span><span class="cell-value">4/5</span></div>
              <div class="grid-cell"><span class="cell-label">日满发小时</span><span class="cell-value">4.2 h</span></div>
              <div class="grid-cell"><span class="cell-label">实时功率</span><span class="cell-value">62%</span></div>
            </div>
          </div>
        </div></div>
      </div>
    </section>

    <!-- ██ 方案 G · 衬线字体 24px bold ██ -->
    <section class="version-block">
      <h3>G · 衬线字体 24px bold / 标签14px / 网格值15px（经典、稳重感）</h3>
      <div class="merged-card-box kpi-ver-g">
        <div class="gauge-card-small"><div class="gauge-sim">仪表盘</div></div>
        <div class="kpi-card-wide"><div class="kpi-grid-3col">
          <div class="data-card">
            <div class="card-label">当日发电量</div>
            <div class="card-value">1,250<span class="card-unit">kWh</span></div>
            <div class="card-grid-2x2">
              <div class="grid-cell"><span class="cell-label">较昨日同期</span><span class="cell-value">+6.2%</span></div>
              <div class="grid-cell"><span class="cell-label">累计发电量</span><span class="cell-value">38,500 kWh</span></div>
            </div>
          </div>
          <div class="data-card">
            <div class="card-label">当日收益</div>
            <div class="card-value">¥ 825</div>
            <div class="card-grid-2x2">
              <div class="grid-cell"><span class="cell-label">当年收益</span><span class="cell-value">98,200 元</span></div>
              <div class="grid-cell"><span class="cell-label">累计</span><span class="cell-value">425,000 元</span></div>
              <div class="grid-cell"><span class="cell-label">上网电价</span><span class="cell-value">0.4 元/kWh</span></div>
              <div class="grid-cell"><span class="cell-label">自用电价</span><span class="cell-value">0.6 元/kWh</span></div>
            </div>
          </div>
          <div class="data-card">
            <div class="card-label">系统运行状态</div>
            <div class="status-sim">运行中</div>
            <div class="card-grid-2x2">
              <div class="grid-cell"><span class="cell-label">告警数量</span><span class="cell-value">2</span></div>
              <div class="grid-cell"><span class="cell-label">逆变器</span><span class="cell-value">4/5</span></div>
              <div class="grid-cell"><span class="cell-label">日满发小时</span><span class="cell-value">4.2 h</span></div>
              <div class="grid-cell"><span class="cell-label">实时功率</span><span class="cell-value">62%</span></div>
            </div>
          </div>
        </div></div>
      </div>
    </section>

    <!-- ██ 方案 H · 深色卡片底 + 白色字 ██ -->
    <section class="version-block">
      <h3>H · 深色卡片底(#2c3e50) + 数字22px bold 白色 / 标签14px 浅灰（暗黑风格）</h3>
      <div class="merged-card-box kpi-ver-h">
        <div class="gauge-card-small"><div class="gauge-sim">仪表盘</div></div>
        <div class="kpi-card-wide"><div class="kpi-grid-3col">
          <div class="data-card">
            <div class="card-label">当日发电量</div>
            <div class="card-value">1,250<span class="card-unit">kWh</span></div>
            <div class="card-grid-2x2">
              <div class="grid-cell"><span class="cell-label">较昨日同期</span><span class="cell-value">+6.2%</span></div>
              <div class="grid-cell"><span class="cell-label">累计发电量</span><span class="cell-value">38,500 kWh</span></div>
            </div>
          </div>
          <div class="data-card">
            <div class="card-label">当日收益</div>
            <div class="card-value">¥ 825</div>
            <div class="card-grid-2x2">
              <div class="grid-cell"><span class="cell-label">当年收益</span><span class="cell-value">98,200 元</span></div>
              <div class="grid-cell"><span class="cell-label">累计</span><span class="cell-value">425,000 元</span></div>
              <div class="grid-cell"><span class="cell-label">上网电价</span><span class="cell-value">0.4 元/kWh</span></div>
              <div class="grid-cell"><span class="cell-label">自用电价</span><span class="cell-value">0.6 元/kWh</span></div>
            </div>
          </div>
          <div class="data-card">
            <div class="card-label">系统运行状态</div>
            <div class="status-sim">运行中</div>
            <div class="card-grid-2x2">
              <div class="grid-cell"><span class="cell-label">告警数量</span><span class="cell-value">2</span></div>
              <div class="grid-cell"><span class="cell-label">逆变器</span><span class="cell-value">4/5</span></div>
              <div class="grid-cell"><span class="cell-label">日满发小时</span><span class="cell-value">4.2 h</span></div>
              <div class="grid-cell"><span class="cell-label">实时功率</span><span class="cell-value">62%</span></div>
            </div>
          </div>
        </div></div>
      </div>
    </section>

    <!-- ██ 方案 I · 左对齐布局 数值22px ██ -->
    <section class="version-block">
      <h3>I · 左对齐 数值22px bold / 标签14px / 网格值14px（提高扫描效率）</h3>
      <div class="merged-card-box kpi-ver-i">
        <div class="gauge-card-small"><div class="gauge-sim">仪表盘</div></div>
        <div class="kpi-card-wide"><div class="kpi-grid-3col">
          <div class="data-card data-card-left">
            <div class="card-label">当日发电量</div>
            <div class="card-value">1,250<span class="card-unit">kWh</span></div>
            <div class="card-grid-2x2">
              <div class="grid-cell"><span class="cell-label">较昨日同期</span><span class="cell-value">+6.2%</span></div>
              <div class="grid-cell"><span class="cell-label">累计发电量</span><span class="cell-value">38,500 kWh</span></div>
            </div>
          </div>
          <div class="data-card data-card-left">
            <div class="card-label">当日收益</div>
            <div class="card-value">¥ 825</div>
            <div class="card-grid-2x2">
              <div class="grid-cell"><span class="cell-label">当年收益</span><span class="cell-value">98,200 元</span></div>
              <div class="grid-cell"><span class="cell-label">累计</span><span class="cell-value">425,000 元</span></div>
              <div class="grid-cell"><span class="cell-label">上网电价</span><span class="cell-value">0.4 元/kWh</span></div>
              <div class="grid-cell"><span class="cell-label">自用电价</span><span class="cell-value">0.6 元/kWh</span></div>
            </div>
          </div>
          <div class="data-card data-card-left">
            <div class="card-label">系统运行状态</div>
            <div class="status-sim">运行中</div>
            <div class="card-grid-2x2">
              <div class="grid-cell"><span class="cell-label">告警数量</span><span class="cell-value">2</span></div>
              <div class="grid-cell"><span class="cell-label">逆变器</span><span class="cell-value">4/5</span></div>
              <div class="grid-cell"><span class="cell-label">日满发小时</span><span class="cell-value">4.2 h</span></div>
              <div class="grid-cell"><span class="cell-label">实时功率</span><span class="cell-value">62%</span></div>
            </div>
          </div>
        </div></div>
      </div>
    </section>
  </div>
</template>

<script setup>
// 纯展示，无逻辑
</script>

<style scoped>
/* 基础环境 */
.probe-container {
  padding: 24px;
  background: #f0f2f5;
  min-height: 100vh;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}
.probe-title {
  font-size: 22px;
  margin-bottom: 24px;
  color: #1a1a2e;
}
.version-block {
  margin-bottom: 48px;
}
.version-block h3 {
  font-size: 15px;
  margin-bottom: 12px;
  color: #444;
  background: #fff;
  padding: 6px 16px;
  border-radius: 6px;
  display: inline-block;
}

/* 共有布局：仪表盘 + KPI区域 */
.merged-card-box {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  display: flex;
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
  width: 240px;
  height: 240px;
  border: 2px dashed #ccc;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 14px;
}
.kpi-card-wide {
  flex: 1;
  height: 300px;
  display: flex;
  align-items: center;
  min-width: 0;
}
.kpi-grid-3col {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 16px 20px;
}
.data-card {
  background: #F8F9FA;
  border-radius: 12px;
  padding: 20px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.status-sim {
  font-size: 18px;
  font-weight: bold;
  color: #52c41a;
}
.card-grid-2x2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 14px;
  width: 100%;
}
.grid-cell {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

/* ====== 方案 A 样式 ====== */
.kpi-ver-a .card-label { font-size: 15px; color: #666; }
.kpi-ver-a .card-value { font-size: 28px; font-weight: 700; color: #1D2129; line-height: 1; }
.kpi-ver-a .card-unit { font-size: 14px; font-weight: 400; color: #999; margin-left: 4px; }
.kpi-ver-a .cell-label { font-size: 14px; color: #888; }
.kpi-ver-a .cell-value { font-size: 16px; font-weight: 600; color: #1D2129; }

/* ====== 方案 B 样式 ====== */
.kpi-ver-b .card-label { font-size: 14px; color: #666; }
.kpi-ver-b .card-value { font-size: 24px; font-weight: 700; color: #1D2129; line-height: 1; }
.kpi-ver-b .card-unit { font-size: 13px; font-weight: 400; color: #999; margin-left: 4px; }
.kpi-ver-b .cell-label { font-size: 13px; color: #888; }
.kpi-ver-b .cell-value { font-size: 15px; font-weight: 600; color: #1D2129; }

/* ====== 方案 C 样式 ====== */
.kpi-ver-c .card-label { font-size: 13px; color: #777; }
.kpi-ver-c .card-value {
  font-size: 20px;
  font-weight: 500;
  color: #2c3e50;
  line-height: 1;
}
.kpi-ver-c .card-unit { font-size: 12px; font-weight: 400; color: #aaa; margin-left: 4px; }
.kpi-ver-c .cell-label { font-size: 12px; color: #999; }
.kpi-ver-c .cell-value { font-size: 14px; font-weight: 500; color: #2c3e50; }

/* ====== 方案 D 样式 ====== */
.kpi-ver-d .card-label { font-size: 14px; color: #666; }
.kpi-ver-d .card-value {
  font-size: 22px;
  font-weight: 700;
  color: #409EFF;
  line-height: 1;
}
.kpi-ver-d .card-unit { font-size: 13px; font-weight: 400; color: #81bcf7; margin-left: 4px; }
.kpi-ver-d .cell-label { font-size: 13px; color: #888; }
.kpi-ver-d .cell-value { font-size: 14px; font-weight: 600; color: #1D2129; }
.kpi-ver-d .status-sim { color: #52c41a; }

/* ====== 方案 E 样式（左右布局） ====== */
.kpi-ver-e .data-card-horiz {
  align-items: stretch;
  gap: 12px;
}
.horiz-item {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 0 4px;
}
.horiz-label {
  font-size: 15px;
  color: #666;
}
.horiz-value {
  font-size: 22px;
  font-weight: 700;
  color: #1D2129;
  line-height: 1;
}
.horiz-value small {
  font-size: 14px;
  font-weight: 400;
  color: #999;
  margin-left: 4px;
}
.kpi-ver-e .cell-label { font-size: 13px; color: #888; }
.kpi-ver-e .cell-value { font-size: 14px; font-weight: 600; color: #1D2129; }

/* ====== 方案 F 样式（更小字体、紧凑） ====== */
.kpi-ver-f .card-label { font-size: 12px; color: #777; }
.kpi-ver-f .card-value { font-size: 18px; font-weight: 700; color: #1D2129; line-height: 1; }
.kpi-ver-f .card-unit { font-size: 11px; font-weight: 400; color: #aaa; margin-left: 3px; }
.kpi-ver-f .cell-label { font-size: 11px; color: #999; }
.kpi-ver-f .cell-value { font-size: 13px; font-weight: 600; color: #1D2129; }
.kpi-ver-f .card-grid-2x2 { gap: 8px 10px; }

/* ====== 方案 G 样式（衬线字体） ====== */
.kpi-ver-g .card-label { font-size: 14px; color: #666; }
.kpi-ver-g .card-value {
  font-size: 24px;
  font-weight: 700;
  color: #1D2129;
  line-height: 1;
  font-family: 'Georgia', 'Times New Roman', serif;
}
.kpi-ver-g .card-unit { font-size: 14px; font-weight: 400; color: #999; margin-left: 4px; font-family: 'Georgia', serif; }
.kpi-ver-g .cell-label { font-size: 13px; color: #888; }
.kpi-ver-g .cell-value { font-size: 15px; font-weight: 600; color: #1D2129; }

/* ====== 方案 H 样式（深色卡片） ====== */
.kpi-ver-h .data-card {
  background: #2c3e50;          /* 深色背景 */
}
.kpi-ver-h .card-label { font-size: 14px; color: #b0bec5; }
.kpi-ver-h .card-value {
  font-size: 22px;
  font-weight: 700;
  color: #ffffff;
  line-height: 1;
}
.kpi-ver-h .card-unit { font-size: 13px; font-weight: 400; color: #90a4ae; margin-left: 4px; }
.kpi-ver-h .cell-label { font-size: 13px; color: #90a4ae; }
.kpi-ver-h .cell-value { font-size: 14px; font-weight: 600; color: #eceff1; }
.kpi-ver-h .status-sim { color: #69f0ae; }

/* ====== 方案 I 样式（左对齐） ====== */
.kpi-ver-i .data-card-left {
  align-items: flex-start;           /* 改为左对齐 */
  padding: 20px 16px;
}
.kpi-ver-i .card-label { font-size: 14px; color: #666; margin-bottom: 2px; }
.kpi-ver-i .card-value { font-size: 22px; font-weight: 700; color: #1D2129; line-height: 1; }
.kpi-ver-i .card-unit { font-size: 13px; font-weight: 400; color: #999; margin-left: 4px; }
.kpi-ver-i .cell-label { font-size: 13px; color: #888; }
.kpi-ver-i .cell-value { font-size: 14px; font-weight: 600; color: #1D2129; }
</style>