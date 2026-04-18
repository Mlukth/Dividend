<template>
  <div class="kpi-container">
    <div class="kpi-grid">
      <!-- 电站个数 -->
      <div class="kpi-item">
        <div class="kpi-icon">
          <el-icon :size="22"><OfficeBuildingIcon /></el-icon>
        </div>
        <div class="kpi-content">
          <div class="kpi-num-wrap">
            <span class="kpi-num">48</span>
            <span class="kpi-unit"></span>
          </div>
          <div class="kpi-text">电站个数</div>
        </div>
      </div>
      <!-- 装机规模 -->
      <div class="kpi-item">
        <div class="kpi-icon">
          <el-icon :size="22"><SetUpIcon /></el-icon>
        </div>
        <div class="kpi-content">
          <div class="kpi-num-wrap">
            <span class="kpi-num">29.17</span>
            <span class="kpi-unit">MW</span>
          </div>
          <div class="kpi-text">装机规模</div>
        </div>
      </div>
      <!-- 当年发电量 -->
      <div class="kpi-item">
        <div class="kpi-icon">
          <el-icon :size="22"><HistogramIcon /></el-icon>
        </div>
        <div class="kpi-content">
          <div class="kpi-num-wrap">
            <span class="kpi-num">0</span>
            <span class="kpi-unit">万kWh</span>
          </div>
          <div class="kpi-text">当年发电量</div>
        </div>
      </div>
      <!-- 当年收益 -->
      <div class="kpi-item">
        <div class="kpi-icon">
          <el-icon :size="22"><MoneyIcon /></el-icon>
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
</template>

<script setup>
import { markRaw } from 'vue'
import { OfficeBuilding, SetUp, Histogram, Money } from '@element-plus/icons-vue'
const OfficeBuildingIcon = markRaw(OfficeBuilding)
const SetUpIcon = markRaw(SetUp)
const HistogramIcon = markRaw(Histogram)
const MoneyIcon = markRaw(Money)
</script>

<style scoped>
.kpi-container {
  width: 100%;
  background: #fff;
}
/* 2×2等宽网格 永不错位 */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 28px 20px;
  width: 100%;
  min-width: 0;
}
/* 核心：图标左 + 内容右 横向排列 */
.kpi-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-width: 0;
  overflow: hidden;
}
/* 空心圆圈图标 固定大小 */
.kpi-icon {
  width: 44px;
  height: 44px;
  border: 2px solid #e5e6eb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #666;
}
/* 右侧内容区 垂直排列 */
.kpi-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  flex: 1;
}
/* 数字+单位 单行不换行 */
.kpi-num-wrap {
  display: flex;
  align-items: baseline;
  gap: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.kpi-num {
  font-size: 28px;
  font-weight: 700;
  color: #333;
}
.kpi-unit {
  font-size: 14px;
  color: #999;
}
/* 标题 单行居中 */
.kpi-text {
  font-size: 14px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>