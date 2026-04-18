<template>
  <div class="preview-page">
    <!-- 操作栏：支持选中和导出 -->
    <div class="action-bar">
      <div class="left-tip">
        <el-icon><Select /></el-icon>
        <span>点击卡片即可选中/取消，选中后一键导出方案</span>
      </div>
      <el-button type="primary" @click="handleExport">
        <el-icon><Download /></el-icon> 导出选中方案
      </el-button>
    </div>

    <!-- 三卡并排展示区 -->
    <div class="overview-cards">
      <!-- 1. 电站概览卡片 -->
      <div
        class="overview-card station-card"
        :class="{ selected: selectedCards.includes('station') }"
        @click="toggleCard('station')"
      >
        <div class="card-title">
          <el-icon class="title-icon"><DataAnalysis /></el-icon>
          电站概览
          <span v-if="selectedCards.includes('station')" class="check-badge">✓</span>
        </div>
        <div class="card-content">
          <div class="stat-item">
            <span class="stat-label">
              <el-icon class="item-icon"><OfficeBuilding /></el-icon>电站个数
            </span>
            <span class="stat-value">48</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">
              <el-icon class="item-icon"><SetUp /></el-icon>装机规模
            </span>
            <span class="stat-value">29.17 MW</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">
              <el-icon class="item-icon"><Histogram /></el-icon>当年发电量
            </span>
            <span class="stat-value">0万 kWh</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">
              <el-icon class="item-icon"><Money /></el-icon>当年收益
            </span>
            <span class="stat-value">--</span>
          </div>
        </div>
      </div>

      <!-- 2. 电量概览卡片 -->
      <div
        class="overview-card power-card"
        :class="{ selected: selectedCards.includes('power') }"
        @click="toggleCard('power')"
      >
        <div class="card-title">
          <el-icon class="title-icon"><TrendCharts /></el-icon>
          电量概览
          <span v-if="selectedCards.includes('power')" class="check-badge">✓</span>
        </div>
        <div class="card-content">
          <div class="stat-item">
            <span class="stat-label">
              <el-icon class="item-icon"><Sunny /></el-icon>当日发电量
            </span>
            <span class="stat-value">5.62万 kWh</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">
              <el-icon class="item-icon"><Coin /></el-icon>当日收益
            </span>
            <span class="stat-value">3.98万 元</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">
              <el-icon class="item-icon"><Odometer /></el-icon>实时功率占比
            </span>
            <span class="stat-value">1.2 %</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">
              <el-icon class="item-icon"><DataLine /></el-icon>上月消纳率
            </span>
            <span class="stat-value">--</span>
          </div>
        </div>
      </div>

      <!-- 3. AI预警概览卡片 -->
      <div
        class="overview-card warning-card"
        :class="{ selected: selectedCards.includes('warning') }"
        @click="toggleCard('warning')"
      >
        <div class="card-title">
          <el-icon class="title-icon"><Warning /></el-icon>
          AI预警概览
          <span v-if="selectedCards.includes('warning')" class="check-badge">✓</span>
        </div>
        <div class="card-content">
          <div class="warning-item">
            <span class="warning-label">
              <el-icon class="item-icon"><Bell /></el-icon>逆变器报警数
            </span>
            <span class="warning-value">89</span>
            <span class="link-btn">点击进入</span>
          </div>
          <div class="warning-item">
            <span class="warning-label">
              <el-icon class="item-icon"><PieChart /></el-icon>发电量/理论发电量比例
            </span>
            <span class="warning-value">--</span>
            <span class="link-btn">点击进入</span>
          </div>
          <div class="warning-item">
            <span class="warning-label">
              <el-icon class="item-icon"><Sort /></el-icon>离散率大于20%逆变器个数
            </span>
            <span class="warning-value">--</span>
            <span class="link-btn">点击进入</span>
          </div>
          <div class="warning-item">
            <span class="warning-label">
              <el-icon class="item-icon"><CircleClose /></el-icon>PR低于80%电站个数
            </span>
            <span class="warning-value">--</span>
            <span class="link-btn">点击进入</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 图例说明区 -->
    <div class="icon-legend">
      <div class="legend-title">
        <el-icon><InfoFilled /></el-icon> 图标使用说明
      </div>
      <div class="legend-grid">
        <div class="legend-item"><el-icon><OfficeBuilding /></el-icon> 电站个数 → OfficeBuilding</div>
        <div class="legend-item"><el-icon><SetUp /></el-icon> 装机规模 → SetUp</div>
        <div class="legend-item"><el-icon><Histogram /></el-icon> 当年发电量 → Histogram</div>
        <div class="legend-item"><el-icon><Money /></el-icon> 当年收益 → Money</div>
        <div class="legend-item"><el-icon><Sunny /></el-icon> 当日发电量 → Sunny</div>
        <div class="legend-item"><el-icon><Coin /></el-icon> 当日收益 → Coin</div>
        <div class="legend-item"><el-icon><Odometer /></el-icon> 实时功率占比 → Odometer</div>
        <div class="legend-item"><el-icon><DataLine /></el-icon> 上月消纳率 → DataLine</div>
        <div class="legend-item"><el-icon><Bell /></el-icon> 逆变器报警数 → Bell</div>
        <div class="legend-item"><el-icon><PieChart /></el-icon> 发电量/理论发电量 → PieChart</div>
        <div class="legend-item"><el-icon><Sort /></el-icon> 离散率逆变器个数 → Sort</div>
        <div class="legend-item"><el-icon><CircleClose /></el-icon> PR低于80%电站 → CircleClose</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Select,
  Download,
  DataAnalysis,
  OfficeBuilding,
  SetUp,
  Histogram,
  Money,
  TrendCharts,
  Sunny,
  Coin,
  Odometer,
  DataLine,
  Warning,
  Bell,
  PieChart,
  Sort,
  CircleClose,
  InfoFilled
} from '@element-plus/icons-vue'

// 已选中的卡片（station / power / warning）
const selectedCards = ref([])

// 切换卡片选中状态
const toggleCard = (cardKey) => {
  const index = selectedCards.value.indexOf(cardKey)
  if (index > -1) {
    selectedCards.value.splice(index, 1)
  } else {
    selectedCards.value.push(cardKey)
  }
}

// 一键导出选中方案
const handleExport = () => {
  if (selectedCards.value.length === 0) {
    ElMessage.warning('请至少选中一个卡片方案')
    return
  }

  const cardNameMap = {
    station: '电站概览',
    power: '电量概览',
    warning: 'AI预警概览'
  }

  const selectedNames = selectedCards.value.map(key => cardNameMap[key]).join('、')
  
  // 构建导出描述
  const exportDesc = `
【选中的卡片方案】：${selectedNames}

【图标配置详情】：
--- 电站概览 ---
- 电站个数：OfficeBuilding
- 装机规模：SetUp
- 当年发电量：Histogram
- 当年收益：Money

--- 电量概览 ---
- 当日发电量：Sunny
- 当日收益：Coin
- 实时功率占比：Odometer
- 上月消纳率：DataLine

--- AI预警概览 ---
- 逆变器报警数：Bell
- 发电量/理论发电量比例：PieChart
- 离散率大于20%逆变器个数：Sort
- PR低于80%电站个数：CircleClose

【修改建议】：
可直接将上述图标导入到实际项目文件中使用。
  `.trim()

  // 复制到剪贴板
  navigator.clipboard.writeText(exportDesc).then(() => {
    ElMessage.success(`已导出方案：${selectedNames}，配置描述已复制到剪贴板`)
  }).catch(() => {
    ElMessage.info(`已选中：${selectedNames}`)
  })
}
</script>

<style scoped>
.preview-page {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
  box-sizing: border-box;
}

/* 操作栏 */
.action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding: 12px 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.left-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #4e5969;
  font-size: 14px;
}

.left-tip .el-icon {
  color: #165dff;
}

/* 三卡片并排 */
.overview-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  width: 100%;
  margin-bottom: 24px;
}

.overview-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 20px 24px;
  transition: all 0.2s ease;
  cursor: pointer;
  border: 2px solid transparent;
  position: relative;
}

.overview-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 20px rgba(0, 82, 217, 0.12);
}

.overview-card.selected {
  border-color: #165dff;
  box-shadow: 0 4px 20px rgba(22, 93, 255, 0.2);
}

.card-title {
  font-size: 17px;
  font-weight: 700;
  color: #1d2129;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.title-icon {
  color: #165dff;
  font-size: 18px;
}

.check-badge {
  position: absolute;
  right: 0;
  top: -4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #165dff;
  color: white;
  font-size: 14px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.stat-label {
  font-size: 14px;
  color: #4e5969;
  display: flex;
  align-items: center;
  gap: 6px;
}

.item-icon {
  color: #86909c;
  font-size: 16px;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #1d2129;
  background: linear-gradient(90deg, #0052d9, #165dff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.warning-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px dashed #f0f0f0;
}

.warning-item:last-child {
  border-bottom: none;
}

.warning-label {
  font-size: 14px;
  color: #4e5969;
  flex: 2;
  display: flex;
  align-items: center;
  gap: 6px;
}

.warning-value {
  font-size: 16px;
  font-weight: 700;
  color: #f53f3f;
  flex: 1;
  text-align: center;
}

.link-btn {
  font-size: 13px;
  color: #165dff;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
  text-align: right;
}

.link-btn:hover {
  color: #0052d9;
  text-decoration: underline;
}

/* 图例说明区 */
.icon-legend {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 20px 24px;
}

.legend-title {
  font-size: 16px;
  font-weight: 700;
  color: #1d2129;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px 20px;
}

.legend-item {
  font-size: 13px;
  color: #4e5969;
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-item .el-icon {
  color: #165dff;
}

/* 响应式 */
@media screen and (max-width: 1400px) {
  .overview-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  .warning-card {
    grid-column: 1 / 3;
  }
  .legend-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media screen and (max-width: 768px) {
  .overview-cards {
    grid-template-columns: 1fr;
  }
  .warning-card {
    grid-column: 1 / 2;
  }
  .legend-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>