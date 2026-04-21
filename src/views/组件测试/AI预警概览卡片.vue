```vue
<template>
  <div data-v-8309015e class="overview-card warning-card">
    <div data-v-8309015e class="card-title">AI预警概览</div>
    <div data-v-8309015e class="card-content">
      <!-- 左侧：四色分段环形图（保持不变） -->
      <div data-v-8309015e class="left-chart">
        <div data-v-8309015e class="chart-box">
          <div ref="alarmChart" data-v-8309015e class="alarm-ring"></div>
          <div data-v-8309015e class="chart-center">
            <div data-v-8309015e class="center-num">24</div>
            <div data-v-8309015e class="center-label">预警总数</div>
          </div>
        </div>
      </div>
      <!-- 右侧：布局1:1对齐KPI代码 文字无颜色 -->
      <div data-v-8309015e class="right-list">
        <!-- 1. 逆变器报警 -->
        <div data-v-8309015e class="warning-item">
          <div data-v-8309015e class="item-icon red">
            <svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M256 192h512v640H256V192zm32 32v576h448V224H288zm128 96h192v64H416v-64zm0 128h192v64H416v-64zm0 128h192v64H416v-64z"/></svg>
          </div>
          <div data-v-8309015e class="item-content">
            <div data-v-8309015e class="item-num-wrap">
              <span data-v-8309015e class="item-num" @click="handleClick('inverter')">24</span>
            </div>
            <div data-v-8309015e class="item-text">逆变器报警数</div>
          </div>
        </div>
        <!-- 2. 发电量比例 -->
        <div data-v-8309015e class="warning-item">
          <div data-v-8309015e class="item-icon orange">
            <svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M192 832h640V192h64v704H128v-64h64zM320 704h64V384h-64v320zm160 0h64V256h-64v448zm160 0h64V512h-64v192z"/></svg>
          </div>
          <div data-v-8309015e class="item-content">
            <div data-v-8309015e class="item-num-wrap">
              <span data-v-8309015e class="item-num" @click="handleClick('ratio')">8</span>
            </div>
            <div data-v-8309015e class="item-text">发电量/理论发电量比例</div>
          </div>
        </div>
        <!-- 3. 离散率 -->
        <div data-v-8309015e class="warning-item">
          <div data-v-8309015e class="item-icon yellow">
            <svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M128 512h64l128-192 160 256 128-160 128 96h128v-64H736l-128-96-128 160-160-256L192 576H128v-64z"/></svg>
          </div>
          <div data-v-8309015e class="item-content">
            <div data-v-8309015e class="item-num-wrap">
              <span data-v-8309015e class="item-num" @click="handleClick('rate')">5</span>
            </div>
            <div data-v-8309015e class="item-text">离散率大于20%逆变器个数</div>
          </div>
        </div>
        <!-- 4. PR值 -->
        <div data-v-8309015e class="warning-item">
          <div data-v-8309015e class="item-icon blue">
            <svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M512 128a384 384 0 1 0 0 768 384 384 0 0 0 0-768zm0 64a320 320 0 1 1 0 640 320 320 0 0 1 0-640zm-32 96v224l160 96 32-53-128-77V288h-32z"/></svg>
          </div>
          <div data-v-8309015e class="item-content">
            <div data-v-8309015e class="item-num-wrap">
              <span data-v-8309015e class="item-num" @click="handleClick('pr')">3</span>
            </div>
            <div data-v-8309015e class="item-text">PR低于80%电站个数</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'

const alarmChart = ref(null)
const handleClick = (type) => console.log('跳转：', type)

// 左侧四色环形图保持不变
onMounted(() => {
  const chart = echarts.init(alarmChart.value)
  chart.setOption({
    backgroundColor: 'transparent',
    series: [{
      type: 'pie',
      radius: ['75%', '92%'],
      center: ['50%', '50%'],
      silent: true,
      label: { show: false },
      data: [
        { value: 24, itemStyle: { color: '#E53E3E' } },
        { value: 8,  itemStyle: { color: '#FF8A00' } },
        { value: 5,  itemStyle: { color: '#FFC107' } },
        { value: 3,  itemStyle: { color: '#36A2EB' } }
      ]
    }]
  })
})
</script>

<style scoped>
/* 原生全局样式 */
.overview-card {
  width: 100%;
  height: 300px;
  background: #0A2A5F;
  background-image: linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
  background-size: 50px 50px;
  border-radius: 8px;
  padding: 24px;
  box-sizing: border-box;
  color: #fff;
  font-family: Microsoft YaHei;
}
.card-title {
  font-size: 28px;
  font-weight: 500;
  margin-bottom: 20px;
}
.card-content {
  display: flex;
  align-items: center;
  gap: 40px;
  height: calc(100% - 52px);
}

/* 左侧环形图 */
.left-chart {
  width: 200px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.chart-box {
  position: relative;
  width: 180px;
  height: 180px;
}
.alarm-ring {
  width: 100%;
  height: 100%;
}
.chart-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}
.center-num {
  font-size: 50px;
  font-weight: 600;
}
.center-label {
  font-size: 20px;
  opacity: 0.7;
  margin-top: 6px;
}

/* 右侧列表：1:1对齐KPI布局 */
.right-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.warning-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}
.item-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 2px solid currentColor;
}
.item-icon svg {
  width: 20px;
  height: 20px;
}
.item-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}
.item-num-wrap {
  display: flex;
  align-items: baseline;
}
.item-num {
  font-size: 28px;
  font-weight: 700;
  color: #fff; /* 文字无颜色 纯白 */
  cursor: pointer;
}
.item-text {
  font-size: 14px;
  color: rgba(255,255,255,0.7); /* 文字无颜色 半透白 */
}

/* 仅图标保留四色 */
.red { color: #E53E3E; }
.orange { color: #FF8A00; }
.yellow { color: #FFC107; }
.blue { color: #36A2EB; }
</style>