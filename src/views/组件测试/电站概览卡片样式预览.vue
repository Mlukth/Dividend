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

    <!-- 三卡并排展示区：三个不同风格的电站概览卡片 -->
    <div class="cards-grid">
      <!-- 方案 A：标准风格（浅色图标底） -->
      <div
        class="card-wrapper"
        :class="{ selected: selectedCards.includes('styleA') }"
        @click="toggleCard('styleA')"
      >
        <div class="card-header">
          <span class="card-title">方案 A · 标准</span>
          <span v-if="selectedCards.includes('styleA')" class="check-badge">✓</span>
        </div>
        <div class="overview-card style-a">
          <div class="stat-grid">
            <!-- 电站个数 -->
            <div class="grid-item">
              <div class="icon-circle"><OfficeBuilding /></div>
              <div class="stat-value">48</div>
              <div class="stat-label">电站个数</div>
            </div>
            <!-- 装机规模 -->
            <div class="grid-item">
              <div class="icon-circle"><SetUp /></div>
              <div class="stat-value">29.17 <span class="unit">MW</span></div>
              <div class="stat-label">装机规模</div>
            </div>
            <!-- 当年发电量 -->
            <div class="grid-item">
              <div class="icon-circle"><Histogram /></div>
              <div class="stat-value">0<span class="unit">万 kWh</span></div>
              <div class="stat-label">当年发电量</div>
            </div>
            <!-- 当年收益 -->
            <div class="grid-item">
              <div class="icon-circle"><Money /></div>
              <div class="stat-value">--</div>
              <div class="stat-label">当年收益</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 方案 B：强调风格（蓝色图标底） -->
      <div
        class="card-wrapper"
        :class="{ selected: selectedCards.includes('styleB') }"
        @click="toggleCard('styleB')"
      >
        <div class="card-header">
          <span class="card-title">方案 B · 强调</span>
          <span v-if="selectedCards.includes('styleB')" class="check-badge">✓</span>
        </div>
        <div class="overview-card style-b">
          <div class="stat-grid">
            <!-- 电站个数 -->
            <div class="grid-item">
              <div class="icon-circle primary"><OfficeBuilding /></div>
              <div class="stat-value">48</div>
              <div class="stat-label">电站个数</div>
            </div>
            <!-- 装机规模 -->
            <div class="grid-item">
              <div class="icon-circle primary"><SetUp /></div>
              <div class="stat-value">29.17 <span class="unit">MW</span></div>
              <div class="stat-label">装机规模</div>
            </div>
            <!-- 当年发电量 -->
            <div class="grid-item">
              <div class="icon-circle primary"><Histogram /></div>
              <div class="stat-value">0<span class="unit">万 kWh</span></div>
              <div class="stat-label">当年发电量</div>
            </div>
            <!-- 当年收益 -->
            <div class="grid-item">
              <div class="icon-circle primary"><Money /></div>
              <div class="stat-value">--</div>
              <div class="stat-label">当年收益</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 方案 C：轻量风格（无背景图标，仅线条） -->
      <div
        class="card-wrapper"
        :class="{ selected: selectedCards.includes('styleC') }"
        @click="toggleCard('styleC')"
      >
        <div class="card-header">
          <span class="card-title">方案 C · 轻量</span>
          <span v-if="selectedCards.includes('styleC')" class="check-badge">✓</span>
        </div>
        <div class="overview-card style-c">
          <div class="stat-grid">
            <!-- 电站个数 -->
            <div class="grid-item">
              <div class="icon-circle outline"><OfficeBuilding /></div>
              <div class="stat-value">48</div>
              <div class="stat-label">电站个数</div>
            </div>
            <!-- 装机规模 -->
            <div class="grid-item">
              <div class="icon-circle outline"><SetUp /></div>
              <div class="stat-value">29.17 <span class="unit">MW</span></div>
              <div class="stat-label">装机规模</div>
            </div>
            <!-- 当年发电量 -->
            <div class="grid-item">
              <div class="icon-circle outline"><Histogram /></div>
              <div class="stat-value">0<span class="unit">万 kWh</span></div>
              <div class="stat-label">当年发电量</div>
            </div>
            <!-- 当年收益 -->
            <div class="grid-item">
              <div class="icon-circle outline"><Money /></div>
              <div class="stat-value">--</div>
              <div class="stat-label">当年收益</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 图例说明区 -->
    <div class="icon-legend">
      <div class="legend-title">
        <el-icon><InfoFilled /></el-icon> 图标匹配方案
      </div>
      <div class="legend-grid">
        <div class="legend-item"><el-icon><OfficeBuilding /></el-icon> 电站个数 → OfficeBuilding</div>
        <div class="legend-item"><el-icon><SetUp /></el-icon> 装机规模 → SetUp</div>
        <div class="legend-item"><el-icon><Histogram /></el-icon> 当年发电量 → Histogram</div>
        <div class="legend-item"><el-icon><Money /></el-icon> 当年收益 → Money</div>
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
  OfficeBuilding,
  SetUp,
  Histogram,
  Money,
  InfoFilled
} from '@element-plus/icons-vue'

// 已选中的卡片方案
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

  const styleNameMap = {
    styleA: '标准风格（浅灰图标背景）',
    styleB: '强调风格（蓝色图标背景）',
    styleC: '轻量风格（无填充图标）'
  }

  const selectedNames = selectedCards.value.map(key => styleNameMap[key]).join('、')
  
  // 构建导出描述
  const exportDesc = `
【选中的卡片方案】：${selectedNames}

【布局规则】：
- 整体布局：2列网格，一行2个数据项，共2行，所有内容居中对齐
- 图标规则：圆形轮廓线条图标，位于每个数据项最上方
- 字体规则：
  - 数字：字号最大、加粗、无颜色区分
  - 单位：紧跟数字右侧，小号字体
  - 指标名称：数字正下方，小号字体，居中
- 无分割线、无右侧对齐，全部居中展示

【图标匹配方案】：
- 电站个数：OfficeBuilding
- 装机规模：SetUp
- 当年发电量：Histogram
- 当年收益：Money

【修改建议】：
可直接将上述布局样式应用到实际项目中的“电站概览”卡片。
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

/* 三卡并排网格 */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  width: 100%;
  margin-bottom: 24px;
}

.card-wrapper {
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.card-wrapper.selected {
  border-color: #165dff;
  box-shadow: 0 4px 20px rgba(22, 93, 255, 0.2);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  padding: 0 4px;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: #1d2129;
}

.check-badge {
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

/* 卡片基础样式 */
.overview-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 20px 16px;
  transition: all 0.2s ease;
}

.overview-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 20px rgba(0, 82, 217, 0.12);
}

/* 2x2 网格布局 */
.stat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px 16px;
  width: 100%;
}

.grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

/* 图标圆形样式 */
.icon-circle {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  font-size: 22px;
  color: #4e5969;
  background: #f2f3f5;
  transition: all 0.2s;
}

/* 方案B：蓝色图标背景 */
.style-b .icon-circle.primary {
  background: #165dff;
  color: #ffffff;
}

/* 方案C：无填充仅边框 */
.style-c .icon-circle.outline {
  background: transparent;
  border: 1.5px solid #e5e6eb;
  color: #4e5969;
}

/* 数字样式 */
.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1d2129;
  line-height: 1.3;
  margin-bottom: 2px;
}

.stat-value .unit {
  font-size: 12px;
  font-weight: 400;
  color: #86909c;
  margin-left: 2px;
}

/* 标签样式 */
.stat-label {
  font-size: 12px;
  color: #86909c;
  font-weight: 400;
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
@media screen and (max-width: 1200px) {
  .cards-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .legend-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media screen and (max-width: 768px) {
  .cards-grid {
    grid-template-columns: 1fr;
  }
  .legend-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>