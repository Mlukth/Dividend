<template>
  <div class="pv-dashboard-wrap">
    <!-- 1. 左侧：电站概览（2x2网格 科技风） -->
    <div class="card-item kpi-card">
      <div class="card-header">
        <span class="title">电站概览</span>
      </div>
      <div class="kpi-grid">
        <div class="kpi-item">
          <div class="kpi-icon">
            <svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M192 128v704h384V128zm-32-64h448a32 32 0 0 1 32 32v768a32 32 0 0 1-32 32H160a32 32 0 0 1-32-32V96a32 32 0 0 1 32-32"></path><path fill="currentColor" d="M256 256h256v64H256zm0 192h256v64H256zm0 192h256v64H256zm384-128h128v64H640zm0 128h128v64H640zM64 832h896v64H64z"></path><path fill="currentColor" d="M640 384v448h192V384zm-32-64h256a32 32 0 0 1 32 32v512a32 32 0 0 1-32 32H608a32 32 0 0 1-32-32V352a32 32 0 0 1 32-32"></path></svg>
          </div>
          <div class="kpi-content">
            <div class="kpi-num-wrap">
              <span class="kpi-num">48</span>
              <span class="kpi-unit"></span>
            </div>
            <div class="kpi-text">电站个数</div>
          </div>
        </div>
        <div class="kpi-item">
          <div class="kpi-icon">
            <svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M224 160a64 64 0 0 0-64 64v576a64 64 0 0 0 64 64h576a64 64 0 0 0 64-64V224a64 64 0 0 0-64-64zm0-64h576a128 128 0 0 1 128 128v576a128 128 0 0 1-128 128H224A128 128 0 0 1 96 800V224A128 128 0 0 1 224 96"></path><path fill="currentColor" d="M384 416a64 64 0 1 0 0-128 64 64 0 0 0 0 128m0 64a128 128 0 1 1 0-256 128 128 0 0 1 0 256"></path><path fill="currentColor" d="M480 320h256q32 0 32 32t-32 32H480q-32 0-32-32t32-32m160 416a64 64 0 1 0 0-128 64 64 0 0 0 0 128m0 64a128 128 0 1 1 0-256 128 128 0 0 1 0 256"></path><path fill="currentColor" d="M288 640h256q32 0 32 32t-32 32H288q-32 0-32-32t32-32"></path></svg>
          </div>
          <div class="kpi-content">
            <div class="kpi-num-wrap">
              <span class="kpi-num">29.17</span>
              <span class="kpi-unit">MW</span>
            </div>
            <div class="kpi-text">装机规模</div>
          </div>
        </div>
        <div class="kpi-item">
          <div class="kpi-icon">
            <svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M416 896V128h192v768zm-288 0V448h192v448zm576 0V320h192v576z"></path></svg>
          </div>
          <div class="kpi-content">
            <div class="kpi-num-wrap">
              <span class="kpi-num">0</span>
              <span class="kpi-unit">万kWh</span>
            </div>
            <div class="kpi-text">当年发电量</div>
          </div>
        </div>
        <div class="kpi-item">
          <div class="kpi-icon">
            <svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M256 640v192h640V384H768v-64h150.976c14.272 0 19.456 1.472 24.64 4.288a29.06 29.06 0 0 1 12.16 12.096c2.752 5.184 4.224 10.368 4.224 24.64v493.952c0 14.272-1.472 19.456-4.288 24.64a29.06 29.06 0 0 1-12.096 12.16c-5.184 2.752-10.368 4.224-24.64 4.224H233.024c-14.272 0-19.456-1.472-24.64-4.288a29.06 29.06 0 0 1-12.16-12.096c-2.688-5.184-4.224-10.368-4.224-24.576V640z"></path><path fill="currentColor" d="M768 192H128v448h640zm64-22.976v493.952c0 14.272-1.472 19.456-4.288 24.64a29.06 29.06 0 0 1-12.096 12.16c-5.184 2.752-10.368 4.224-24.64 4.224H105.024c-14.272 0-19.456-1.472-24.64-4.288a29.06 29.06 0 0 1-12.16-12.096C65.536 682.432 64 677.248 64 663.04V169.024c0-14.272 1.472-19.456 4.288-24.64a29.06 29.06 0 0 1 12.096-12.16C85.568 129.536 90.752 128 104.96 128h685.952c14.272 0 19.456 1.472 24.64 4.288a29.06 29.06 0 0 1 12.16 12.096c2.752 5.184 4.224 10.368 4.224 24.64z"></path><path fill="currentColor" d="M448 576a160 160 0 1 1 0-320 160 160 0 0 1 0 320m0-64a96 96 0 1 0 0-192 96 96 0 0 0 0 192"></path></svg>
          </div>
          <div class="kpi-content">
            <div class="kpi-num-wrap">
              <span class="kpi-num">--</span>
              <span class="kpi-unit"></span>
            </div>
            <div class="kpi-text">当年收益</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. 中间：电量概览（左环形图+右3项） -->
    <div class="card-item power-card">
      <div class="card-header">
        <span class="title">电量概览</span>
      </div>
      <div class="card-content">
        <div class="chart-wrapper">
          <div ref="powerChartRef" class="chart-ring"></div>
          <div class="chart-center">
            <div class="center-value">5.8<span class="unit">万kWh</span></div>
          </div>
        </div>
        <div class="data-list">
          <div class="data-item">
            <div class="data-icon green">
              <svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z m46-334c-57.4 0-104-46.6-104-104s46.6-104 104-104 104 46.6 104 104-46.6 104-104 104z m0 160c-118.8 0-224-60.8-224-136 0-12 9.6-22 21.6-22h404.8c12 0 21.6 10 21.6 22 0 75.2-105.2 136-224 136z"/></svg>
            </div>
            <div class="data-info">
              <div class="num-wrap"><span class="num">4.35万</span><span class="unit">元</span></div>
              <div class="label">当日收益</div>
            </div>
          </div>
          <div class="data-item">
            <div class="data-icon blue">
              <svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M512 128c-212.1 0-384 171.9-384 384s171.9 384 384 384 384-171.9 384-384-171.9-384-384-384z m0 640c-141.4 0-256-114.6-256-256s114.6-256 256-256 256 114.6 256 256-114.6 256-256 256z m-32-384h64v256h-64z m0 320h64v64h-64z"/></svg>
            </div>
            <div class="data-info">
              <div class="num-wrap"><span class="num">61.2</span><span class="unit">%</span></div>
              <div class="label">实时功率占比</div>
            </div>
          </div>
          <div class="data-item">
            <div class="data-icon gray">
              <svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M512 128c-212.1 0-384 171.9-384 384s171.9 384 384 384 384-171.9 384-384-171.9-384-384-384z m0 640c-141.4 0-256-114.6-256-256s114.6-256 256-256 256 114.6 256 256-114.6 256-256 256z m192-256c0 106-86 192-192 192s-192-86-192-192 86-192 192-192c46.6 0 89.4 16.6 123.4 44.6l-45.2 45.2c-20.8-20.8-48.8-33.4-78.2-33.4-65 0-118 53-118 118s53 118 118 118 118-53 118-118h64z"/></svg>
            </div>
            <div class="data-info">
              <div class="num-wrap"><span class="num">--</span><span class="unit"></span></div>
              <div class="label">上月消纳率</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. 右侧：AI预警概览（左环形图+右4项） -->
    <div class="card-item warning-card">
      <div class="card-header">
        <span class="title">AI预警概览</span>
      </div>
      <div class="card-content">
        <div class="chart-wrapper">
          <div ref="alarmChart" class="chart-ring"></div>
          <div class="chart-center">
            <div class="center-value">24</div>
            <div class="center-label">预警总数</div>
          </div>
        </div>
        <div class="data-list">
          <div class="data-item">
            <div class="data-icon red">
              <svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M256 192h512v640H256V192zm32 32v576h448V224H288zm128 96h192v64H416v-64zm0 128h192v64H416v-64zm0 128h192v64H416v-64z"/></svg>
            </div>
            <div class="data-info">
              <div class="num-wrap"><span class="num clickable" @click="handleClick('inverter')">24</span></div>
              <div class="label">逆变器报警数</div>
            </div>
          </div>
          <div class="data-item">
            <div class="data-icon orange">
              <svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M192 832h640V192h64v704H128v-64h64zM320 704h64V384h-64v320zm160 0h64V256h-64v448zm160 0h64V512h-64v192z"/></svg>
            </div>
            <div class="data-info">
              <div class="num-wrap"><span class="num clickable" @click="handleClick('ratio')">8</span></div>
              <div class="label">发电量/理论发电量比例</div>
            </div>
          </div>
          <div class="data-item">
            <div class="data-icon yellow">
              <svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M128 512h64l128-192 160 256 128-160 128 96h128v-64H736l-128-96-128 160-160-256L192 576H128v-64z"/></svg>
            </div>
            <div class="data-info">
              <div class="num-wrap"><span class="num clickable" @click="handleClick('rate')">5</span></div>
              <div class="label">离散率大于20%逆变器个数</div>
            </div>
          </div>
          <div class="data-item">
            <div class="data-icon blue">
              <svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M512 128a384 384 0 1 0 0 768 384 384 0 0 0 0-768zm0 64a320 320 0 1 1 0 640 320 320 0 0 1 0-640zm-32 96v224l160 96 32-53-128-77V288h-32z"/></svg>
            </div>
            <div class="data-info">
              <div class="num-wrap"><span class="num clickable" @click="handleClick('pr')">3</span></div>
              <div class="label">PR低于80%电站个数</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'

const powerChartRef = ref(null)
const alarmChart = ref(null)
const handleClick = (type) => console.log('跳转预警：', type)

// 统一环形图配置（全局唯一，两个图表完全一致）
const RING_CONFIG = {
  backgroundColor: 'transparent',
  series: [{
    type: 'pie',
    radius: ['72%', '88%'], // 强制统一粗细、大小
    center: ['50%', '50%'],
    silent: true,
    label: { show: false }
  }]
}

// 电量环形图
const initPowerChart = () => {
  const chart = echarts.init(powerChartRef.value)
  chart.setOption({
    ...RING_CONFIG,
    series: [{
      ...RING_CONFIG.series[0],
      data: [
        { value: 5.8, itemStyle: { color: '#1890ff' } },
        { value: 4.2, itemStyle: { color: 'rgba(255,255,255,0.1)' } }
      ]
    }]
  })
}

// 预警环形图
const initAlarmChart = () => {
  const chart = echarts.init(alarmChart.value)
  chart.setOption({
    ...RING_CONFIG,
    series: [{
      ...RING_CONFIG.series[0],
      data: [
        { value: 24, itemStyle: { color: '#E53E3E' } },
        { value: 8,  itemStyle: { color: '#FF8A00' } },
        { value: 5,  itemStyle: { color: '#FFC107' } },
        { value: 3,  itemStyle: { color: '#36A2EB' } }
      ]
    }]
  })
}

onMounted(() => {
  initPowerChart()
  initAlarmChart()
})
</script>

<style scoped>
.pv-dashboard-wrap {
  width: 100%;
  height: 320px;
  display: flex;
  gap: 20px;
  background: #0a2a60;
  background-image: linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
  background-size: 60px 60px;
  padding: 16px 20px;
  box-sizing: border-box;
  font-family: "Microsoft YaHei", sans-serif;
  color: #fff;
}

/* 三卡片 100% 统一规范 */
.card-item {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* 标题全左对齐 + 统一尺寸 */
.card-header {
  height: 28px;
  line-height: 28px;
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 12px;
  text-align: left;
}

/* ========== 左侧 2x2网格 ========== */
.kpi-grid {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 14px 18px;
  align-content: center;
}
.kpi-item {
  display: flex;
  align-items: center;
  gap: 10px;
}
.kpi-icon {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.3);
  color: #1890ff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.kpi-icon svg {
  width: 18px;
  height: 18px;
}
.kpi-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.kpi-num-wrap {
  display: flex;
  align-items: baseline;
  gap: 3px;
}
.kpi-num {
  font-size: 24px;
  font-weight: 700;
}
.kpi-unit, .kpi-text {
  font-size: 12px;
  color: rgba(255,255,255,0.7);
}

/* ========== 中间&右侧 统一布局 ========== */
.card-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 16px;
}

/* 环形图容器 【强制统一尺寸】 */
.chart-wrapper {
  width: 140px;
  height: 140px;
  flex-shrink: 0;
  position: relative;
}
.chart-ring {
  width: 100%;
  height: 100%;
}
.chart-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  width: 100%;
}
.center-value {
  font-size: 24px;
  font-weight: 600;
}
.center-label, .chart-center .unit {
  font-size: 12px;
  color: rgba(255,255,255,0.7);
  margin-top: 2px;
}

/* 数据列表 统一规范 */
.data-list {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
}
.data-item {
  display: flex;
  align-items: center;
  gap: 10px;
}
.data-icon {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 2px solid currentColor;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.data-icon svg {
  width: 18px;
  height: 18px;
}
.data-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.num-wrap {
  display: flex;
  align-items: baseline;
  gap: 3px;
}
.num {
  font-size: 24px;
  font-weight: 700;
}
.num.clickable {
  cursor: pointer;
  transition: opacity 0.2s;
}
.num.clickable:hover {
  opacity: 0.8;
}
.unit, .label {
  font-size: 12px;
  color: rgba(255,255,255,0.7);
  white-space: nowrap;
}

/* 图标颜色统一 */
.green { color: #52c41a; }
.blue { color: #1890ff; }
.gray { color: #999; }
.red { color: #E53E3E; }
.orange { color: #FF8A00; }
.yellow { color: #FFC107; }
</style>