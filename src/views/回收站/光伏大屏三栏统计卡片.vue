<template>
  <div class="pv-dashboard-wrap">
    <!-- 1. 左侧：电站KPI 统一规范 -->
    <div class="card-item">
      <div class="card-title">电站KPI</div>
      <div class="card-body kpi-grid">
        <div class="kpi-item">
          <div class="item-icon">
            <svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M192 128v704h384V128zm-32-64h448a32 32 0 0 1 32 32v768a32 32 0 0 1-32 32H160a32 32 0 0 1-32-32V96a32 32 0 0 1 32-32"></path><path fill="currentColor" d="M256 256h256v64H256zm0 192h256v64H256zm0 192h256v64H256zm384-128h128v64H640zm0 128h128v64H640zM64 832h896v64H64z"></path></svg>
          </div>
          <div class="item-content">
            <div class="item-num">48</div>
            <div class="item-label">电站个数</div>
          </div>
        </div>
        <div class="kpi-item">
          <div class="item-icon">
            <svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M224 160a64 64 0 0 0-64 64v576a64 64 0 0 0 64 64h576a64 64 0 0 0 64-64V224a64 64 0 0 0-64-64zm0-64h576a128 128 0 0 1 128 128v576a128 128 0 0 1-128 128H224A128 128 0 0 1 96 800V224A128 128 0 0 1 224 96"></path></svg>
          </div>
          <div class="item-content">
            <div class="item-num">29.17<span class="unit">MW</span></div>
            <div class="item-label">装机规模</div>
          </div>
        </div>
        <div class="kpi-item">
          <div class="item-icon">
            <svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M416 896V128h192v768zm-288 0V448h192v448zm576 0V320h192v576z"></path></svg>
          </div>
          <div class="item-content">
            <div class="item-num">0<span class="unit">万kWh</span></div>
            <div class="item-label">当年发电量</div>
          </div>
        </div>
        <div class="kpi-item">
          <div class="item-icon">
            <svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64z"></path></svg>
          </div>
          <div class="item-content">
            <div class="item-num">--</div>
            <div class="item-label">当年收益</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. 中间：电量概览 统一规范 -->
    <div class="card-item">
      <div class="card-title">电量概览</div>
      <div class="card-body flex-row">
        <div class="ring-box">
          <div ref="powerChart" class="chart-ring"></div>
          <div class="ring-center">
            <div class="ring-num">5.8万</div>
            <div class="ring-text">kWh</div>
          </div>
        </div>
        <div class="list-group">
          <div class="list-item">
            <div class="item-icon green">
              <svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M512 128a384 384 0 1 0 0 768 384 384 0 0 0 0-768z"/></svg>
            </div>
            <div class="item-content">
              <div class="item-num">4.35万<span class="unit">元</span></div>
              <div class="item-label">当日收益</div>
            </div>
          </div>
          <div class="list-item">
            <div class="item-icon blue">
              <svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M512 128a384 384 0 1 0 0 768 384 384 0 0 0 0-768z"/></svg>
            </div>
            <div class="item-content">
              <div class="item-num">61.2<span class="unit">%</span></div>
              <div class="item-label">实时功率占比</div>
            </div>
          </div>
          <div class="list-item">
            <div class="item-icon gray">
              <svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M512 128a384 384 0 1 0 0 768 384 384 0 0 0 0-768z"/></svg>
            </div>
            <div class="item-content">
              <div class="item-num">--</div>
              <div class="item-label">上月消纳率</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. 右侧：AI预警概览 统一规范 -->
    <div class="card-item">
      <div class="card-title">AI预警概览</div>
      <div class="card-body flex-row">
        <div class="ring-box">
          <div ref="alarmChart" class="chart-ring"></div>
          <div class="ring-center">
            <div class="ring-num">24</div>
            <div class="ring-text">预警总数</div>
          </div>
        </div>
        <div class="list-group">
          <div class="list-item">
            <div class="item-icon red">
              <svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M512 128a384 384 0 1 0 0 768 384 384 0 0 0 0-768z"/></svg>
            </div>
            <div class="item-content">
              <div class="item-num">24</div>
              <div class="item-label">逆变器报警数</div>
            </div>
          </div>
          <div class="list-item">
            <div class="item-icon orange">
              <svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M512 128a384 384 0 1 0 0 768 384 384 0 0 0 0-768z"/></svg>
            </div>
            <div class="item-content">
              <div class="item-num">8</div>
              <div class="item-label">发电量比例</div>
            </div>
          </div>
          <div class="list-item">
            <div class="item-icon yellow">
              <svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M512 128a384 384 0 1 0 0 768 384 384 0 0 0 0-768z"/></svg>
            </div>
            <div class="item-content">
              <div class="item-num">5</div>
              <div class="item-label">离散率超限数</div>
            </div>
          </div>
          <div class="list-item">
            <div class="item-icon light-blue">
              <svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M512 128a384 384 0 1 0 0 768 384 384 0 0 0 0-768z"/></svg>
            </div>
            <div class="item-content">
              <div class="item-num">3</div>
              <div class="item-label">PR低标电站数</div>
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
const powerChart = ref(null)
const alarmChart = ref(null)

// 统一环形图配置（尺寸完全一致）
const ringOption = (color, data) => ({
  backgroundColor: 'transparent',
  series: [{
    type: 'pie', radius: ['72%', '88%'],
    center: ['50%', '50%'], silent: true,
    label: { show: false }, data
  }]
})

onMounted(() => {
  // 电量环形图
  echarts.init(powerChart.value).setOption(ringOption('#1890ff', [
    { value: 5.8, itemStyle: { color: '#1890ff' } },
    { value: 4.2, itemStyle: { color: 'rgba(255,255,255,0.1)' } }
  ]))
  // 预警四色环
  echarts.init(alarmChart.value).setOption(ringOption('', [
    { value:24, itemStyle:{color:'#E53E3E'} },
    { value:8, itemStyle:{color:'#FF8A00'} },
    { value:5, itemStyle:{color:'#FFC107'} },
    { value:3, itemStyle:{color:'#36A2EB'} }
  ]))
})
</script>

<style scoped>
/* 全局统一：三栏等宽等高 零偏差 */
.pv-dashboard-wrap {
  width: 100%;
  height: 280px;
  display: flex;
  gap: 16px;
  background: #0a2a60;
  background-image: linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
  background-size: 50px 50px;
  padding: 20px;
  box-sizing: border-box;
  font-family: Microsoft YaHei;
  color: #fff;
}

/* 所有卡片统一尺寸 */
.card-item {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 标题全局统一：左对齐 字号统一 */
.card-title {
  font-size: 22px;
  font-weight: 500;
  margin-bottom: 16px;
  text-align: left;
}

/* 内容区全局统一 */
.card-body {
  flex: 1;
  width: 100%;
}

/* 左栏：2x2网格 统一间距 */
.kpi-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

/* 中右栏：左图右文 统一布局 */
.flex-row {
  display: flex;
  align-items: center;
  gap: 24px;
}

/* 环形图全局统一尺寸 */
.ring-box {
  width: 140px;
  height: 140px;
  position: relative;
  flex-shrink: 0;
}
.chart-ring {
  width: 100%;
  height: 100%;
}
.ring-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}
.ring-num {
  font-size: 26px;
  font-weight: 600;
}
.ring-text {
  font-size: 14px;
  opacity: 0.7;
}

/* 列表项全局统一 */
.list-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.kpi-item, .list-item {
  display: flex;
  align-items: center;
  gap: 10px;
}
.item-icon {
  width: 36px;
  height: 36px;
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: rgba(255,255,255,0.6);
}
.item-icon svg {
  width: 16px;
  height: 16px;
}
.item-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.item-num {
  font-size: 20px;
  font-weight: 600;
  line-height: 1;
}
.unit {
  font-size: 12px;
  opacity: 0.7;
  margin-left: 4px;
}
.item-label {
  font-size: 13px;
  opacity: 0.7;
}

/* 图标配色统一 */
.green { color: #52c41a; }
.blue { color: #1890ff; }
.gray { color: #999; }
.red { color: #E53E3E; }
.orange { color: #FF8A00; }
.yellow { color: #FFC107; }
.light-blue { color: #36A2EB; }
</style>