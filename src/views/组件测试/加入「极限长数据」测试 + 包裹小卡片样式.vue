<template>
  <!-- 外层小卡片：白色背景、圆角、阴影 -->
  <div class="outer-card">
    <div class="kpi-container">
      <div class="kpi-grid">
        <!-- 1. 电站个数（正常数据） -->
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

        <!-- 2. 装机规模（正常数据） -->
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

        <!-- 3. 当年发电量（【极限长数据测试】数字+标题都超长） -->
        <div class="kpi-item">
          <div class="kpi-icon">
            <el-icon :size="22"><HistogramIcon /></el-icon>
          </div>
          <div class="kpi-content">
            <div class="kpi-num-wrap">
              <span class="kpi-num">1234567.89</span>
              <span class="kpi-unit">万kWh</span>
            </div>
            <div class="kpi-text">超级无敌长的当年发电量测试标题</div>
          </div>
        </div>

        <!-- 4. 当年收益（【极限长数据测试】只有数字超长） -->
        <div class="kpi-item">
          <div class="kpi-icon">
            <el-icon :size="22"><MoneyIcon /></el-icon>
          </div>
          <div class="kpi-content">
            <div class="kpi-num-wrap">
              <span class="kpi-num">98765432.10</span>
              <span class="kpi-unit">元</span>
            </div>
            <div class="kpi-text">当年收益</div>
          </div>
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
/* 【新增】外层小卡片样式 */
.outer-card {
  width: 100%;
  max-width: 800px; /* 模拟小卡片宽度限制 */
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 24px;
  margin: 20px;
}

.kpi-container {
  width: 100%;
}

/* 2×2等宽网格 永不错位 */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 28px 20px;
  width: 100%;
  min-width: 0; /* 防撑开核心 */
}

/* 核心：图标左 + 内容右 横向排列 */
.kpi-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-width: 0; /* 防撑开核心 */
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
  flex-shrink: 0; /* 图标绝不挤扁 */
  color: #666;
}

/* 右侧内容区 垂直排列 */
.kpi-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0; /* 防撑开核心 */
  flex: 1;
}

/* 数字+单位 单行不换行 溢出省略 */
.kpi-num-wrap {
  display: flex;
  align-items: baseline;
  gap: 4px;
  white-space: nowrap; /* 强制单行 */
  overflow: hidden;    /* 溢出隐藏 */
  text-overflow: ellipsis; /* 显示省略号... */
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

/* 标题 单行不换行 溢出省略 */
.kpi-text {
  font-size: 14px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>