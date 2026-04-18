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

    <!-- 三卡并排展示区：三个不同风格的 KPI 卡片 -->
    <div class="cards-grid">
      <!-- 方案 A：标准风格（浅灰图标背景） -->
      <div
        class="card-wrapper"
        :class="{ selected: selectedCards.includes('styleA') }"
        @click="toggleCard('styleA')"
      >
        <div class="card-header">
          <span class="card-title">方案 A · 标准</span>
          <span v-if="selectedCards.includes('styleA')" class="check-badge">✓</span>
        </div>
        <div class="kpi-card style-a">
          <div class="kpi-wrap">
            <!-- 第一行 -->
            <el-row :gutter="20" class="kpi-row">
              <el-col :xs="12" :sm="12">
                <div class="nco-kpi-counter-value">
                  <div class="counter-value-icon">
                    <el-icon size="24"><OfficeBuilding /></el-icon>
                  </div>
                  <div class="counter-value-main">
                    <div class="counter-value-main-value">
                      <div class="value"><span>48</span></div>
                      <div class="unit-and-increase"><div class="unit"></div></div>
                    </div>
                    <div class="counter-value-main-title">电站个数</div>
                  </div>
                </div>
              </el-col>
              <el-col :xs="12" :sm="12">
                <div class="nco-kpi-counter-value">
                  <div class="counter-value-icon">
                    <el-icon size="24"><SetUp /></el-icon>
                  </div>
                  <div class="counter-value-main">
                    <div class="counter-value-main-value">
                      <div class="value"><span>29.17</span></div>
                      <div class="unit-and-increase"><div class="unit">MW</div></div>
                    </div>
                    <div class="counter-value-main-title">装机规模</div>
                  </div>
                </div>
              </el-col>
            </el-row>

            <!-- 第二行 -->
            <el-row :gutter="20" class="kpi-row">
              <el-col :xs="12" :sm="12">
                <div class="nco-kpi-counter-value">
                  <div class="counter-value-icon">
                    <el-icon size="24"><Histogram /></el-icon>
                  </div>
                  <div class="counter-value-main">
                    <div class="counter-value-main-value">
                      <div class="value"><span>0</span></div>
                      <div class="unit-and-increase"><div class="unit">万kWh</div></div>
                    </div>
                    <div class="counter-value-main-title">当年发电量</div>
                  </div>
                </div>
              </el-col>
              <el-col :xs="12" :sm="12">
                <div class="nco-kpi-counter-value">
                  <div class="counter-value-icon">
                    <el-icon size="24"><Money /></el-icon>
                  </div>
                  <div class="counter-value-main">
                    <div class="counter-value-main-value">
                      <div class="value"><span>--</span></div>
                      <div class="unit-and-increase"><div class="unit"></div></div>
                    </div>
                    <div class="counter-value-main-title">当年收益</div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </div>
      </div>

      <!-- 方案 B：强调风格（蓝色图标背景） -->
      <div
        class="card-wrapper"
        :class="{ selected: selectedCards.includes('styleB') }"
        @click="toggleCard('styleB')"
      >
        <div class="card-header">
          <span class="card-title">方案 B · 强调</span>
          <span v-if="selectedCards.includes('styleB')" class="check-badge">✓</span>
        </div>
        <div class="kpi-card style-b">
          <div class="kpi-wrap">
            <el-row :gutter="20" class="kpi-row">
              <el-col :xs="12" :sm="12">
                <div class="nco-kpi-counter-value">
                  <div class="counter-value-icon primary">
                    <el-icon size="24"><OfficeBuilding /></el-icon>
                  </div>
                  <div class="counter-value-main">
                    <div class="counter-value-main-value">
                      <div class="value"><span>48</span></div>
                      <div class="unit-and-increase"><div class="unit"></div></div>
                    </div>
                    <div class="counter-value-main-title">电站个数</div>
                  </div>
                </div>
              </el-col>
              <el-col :xs="12" :sm="12">
                <div class="nco-kpi-counter-value">
                  <div class="counter-value-icon primary">
                    <el-icon size="24"><SetUp /></el-icon>
                  </div>
                  <div class="counter-value-main">
                    <div class="counter-value-main-value">
                      <div class="value"><span>29.17</span></div>
                      <div class="unit-and-increase"><div class="unit">MW</div></div>
                    </div>
                    <div class="counter-value-main-title">装机规模</div>
                  </div>
                </div>
              </el-col>
            </el-row>
            <el-row :gutter="20" class="kpi-row">
              <el-col :xs="12" :sm="12">
                <div class="nco-kpi-counter-value">
                  <div class="counter-value-icon primary">
                    <el-icon size="24"><Histogram /></el-icon>
                  </div>
                  <div class="counter-value-main">
                    <div class="counter-value-main-value">
                      <div class="value"><span>0</span></div>
                      <div class="unit-and-increase"><div class="unit">万kWh</div></div>
                    </div>
                    <div class="counter-value-main-title">当年发电量</div>
                  </div>
                </div>
              </el-col>
              <el-col :xs="12" :sm="12">
                <div class="nco-kpi-counter-value">
                  <div class="counter-value-icon primary">
                    <el-icon size="24"><Money /></el-icon>
                  </div>
                  <div class="counter-value-main">
                    <div class="counter-value-main-value">
                      <div class="value"><span>--</span></div>
                      <div class="unit-and-increase"><div class="unit"></div></div>
                    </div>
                    <div class="counter-value-main-title">当年收益</div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </div>
      </div>

      <!-- 方案 C：轻量风格（无背景，仅线条图标） -->
      <div
        class="card-wrapper"
        :class="{ selected: selectedCards.includes('styleC') }"
        @click="toggleCard('styleC')"
      >
        <div class="card-header">
          <span class="card-title">方案 C · 轻量</span>
          <span v-if="selectedCards.includes('styleC')" class="check-badge">✓</span>
        </div>
        <div class="kpi-card style-c">
          <div class="kpi-wrap">
            <el-row :gutter="20" class="kpi-row">
              <el-col :xs="12" :sm="12">
                <div class="nco-kpi-counter-value">
                  <div class="counter-value-icon outline">
                    <el-icon size="24"><OfficeBuilding /></el-icon>
                  </div>
                  <div class="counter-value-main">
                    <div class="counter-value-main-value">
                      <div class="value"><span>48</span></div>
                      <div class="unit-and-increase"><div class="unit"></div></div>
                    </div>
                    <div class="counter-value-main-title">电站个数</div>
                  </div>
                </div>
              </el-col>
              <el-col :xs="12" :sm="12">
                <div class="nco-kpi-counter-value">
                  <div class="counter-value-icon outline">
                    <el-icon size="24"><SetUp /></el-icon>
                  </div>
                  <div class="counter-value-main">
                    <div class="counter-value-main-value">
                      <div class="value"><span>29.17</span></div>
                      <div class="unit-and-increase"><div class="unit">MW</div></div>
                    </div>
                    <div class="counter-value-main-title">装机规模</div>
                  </div>
                </div>
              </el-col>
            </el-row>
            <el-row :gutter="20" class="kpi-row">
              <el-col :xs="12" :sm="12">
                <div class="nco-kpi-counter-value">
                  <div class="counter-value-icon outline">
                    <el-icon size="24"><Histogram /></el-icon>
                  </div>
                  <div class="counter-value-main">
                    <div class="counter-value-main-value">
                      <div class="value"><span>0</span></div>
                      <div class="unit-and-increase"><div class="unit">万kWh</div></div>
                    </div>
                    <div class="counter-value-main-title">当年发电量</div>
                  </div>
                </div>
              </el-col>
              <el-col :xs="12" :sm="12">
                <div class="nco-kpi-counter-value">
                  <div class="counter-value-icon outline">
                    <el-icon size="24"><Money /></el-icon>
                  </div>
                  <div class="counter-value-main">
                    <div class="counter-value-main-value">
                      <div class="value"><span>--</span></div>
                      <div class="unit-and-increase"><div class="unit"></div></div>
                    </div>
                    <div class="counter-value-main-title">当年收益</div>
                  </div>
                </div>
              </el-col>
            </el-row>
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
    styleC: '轻量风格（无填充边框图标）'
  }

  const selectedNames = selectedCards.value.map(key => styleNameMap[key]).join('、')
  
  // 构建导出描述
  const exportDesc = `
【选中的卡片方案】：${selectedNames}

【布局规则】：
- 整体布局：使用 el-row / el-col 实现严格 2 行 2 列
- 每行两个 KPI 数据项，共两行
- 每个数据项结构：左侧图标 + 右侧（数值+单位 / 标题）

【字体与格式】：
- 数字：28px、加粗、颜色 #333
- 单位：14px、颜色 #999，紧跟数字
- 标题：14px、颜色 #666，位于数字下方

【图标匹配方案】：
- 电站个数：OfficeBuilding
- 装机规模：SetUp
- 当年发电量：Histogram
- 当年收益：Money

【样式修改建议】：
可复制对应方案的 .kpi-card 及内部样式代码到项目中。
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

/* KPI 卡片基础样式 */
.kpi-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 20px 16px;
  transition: all 0.2s ease;
}

.kpi-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 20px rgba(0, 82, 217, 0.12);
}

/* 核心 KPI 布局（严格按提供代码） */
.kpi-wrap {
  width: 100%;
  background: #fff;
}

.kpi-row {
  margin-bottom: 24px; /* 两行间距 */
}

.nco-kpi-counter-value {
  display: flex;
  align-items: center;
  gap: 12px;
}

.counter-value-icon {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4e5969;
  background: #f2f3f5;
  transition: all 0.2s;
}

/* 方案B：蓝色图标背景 */
.style-b .counter-value-icon.primary {
  background: #165dff;
  color: #ffffff;
}

/* 方案C：无填充仅边框 */
.style-c .counter-value-icon.outline {
  background: transparent;
  border: 1.5px solid #e5e6eb;
  color: #4e5969;
}

.counter-value-main {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.counter-value-main-value {
  display: flex;
  align-items: baseline;
  gap: 4px;
  font-size: 28px;
  font-weight: 700;
  color: #333;
}

.unit {
  font-size: 14px;
  color: #999;
}

.counter-value-main-title {
  font-size: 14px;
  color: #666;
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