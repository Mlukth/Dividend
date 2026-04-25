<template>
  <div class="explorer-page">
    <h2 class="explorer-title">电站列表 - 筛选标签 & 状态统计布局优化方案</h2>
    <p class="explorer-desc">
      当前设计：筛选标签与状态统计栏在视觉上形成重复（彩色圆点 + 文字均出现两次）。<br>
      以下方案均继承项目美术风格（白色圆角卡片、阴影、蓝色高亮等），探索合并或重新排布的可能性。
    </p>

    <!-- 方案A：原始布局 -->
    <div class="scheme-card">
      <h3 class="scheme-label">方案A：原始布局（筛选标签 + 独立统计栏）</h3>
      <div class="station-list-module">
        <div class="list-header">
          <div class="module-title">电站列表</div>
          <el-radio-group v-model="activeStatusA" size="small">
            <el-radio-button value="all">全部</el-radio-button>
            <el-radio-button value="normal">正常</el-radio-button>
            <el-radio-button value="fault">故障</el-radio-button>
            <el-radio-button value="offline">断连</el-radio-button>
          </el-radio-group>
        </div>
        <div class="status-statistics">
          <span class="stat-item"><span class="dot" style="background: #409EFF;"></span>总数(48)</span>
          <span class="stat-item"><span class="dot" style="background: #67c23a;"></span>正常(45)</span>
          <span class="stat-item"><span class="dot" style="background: #f56c6c;"></span>故障(1)</span>
          <span class="stat-item"><span class="dot" style="background: #909399;"></span>断连(2)</span>
        </div>
        <div class="table-placeholder">表格区域（模拟）</div>
      </div>
    </div>

    <!-- 方案B：数字直接融入标签（无额外颜色） -->
    <div class="scheme-card">
      <h3 class="scheme-label">方案B：数字融入标签（无额外颜色）</h3>
      <div class="station-list-module">
        <div class="list-header">
          <div class="module-title">电站列表</div>
          <el-radio-group v-model="activeStatusB" size="small">
            <el-radio-button value="all">
              <span class="tag-with-count">全部 <span class="count">48</span></span>
            </el-radio-button>
            <el-radio-button value="normal">
              <span class="tag-with-count">正常 <span class="count">45</span></span>
            </el-radio-button>
            <el-radio-button value="fault">
              <span class="tag-with-count">故障 <span class="count">1</span></span>
            </el-radio-button>
            <el-radio-button value="offline">
              <span class="tag-with-count">断连 <span class="count">2</span></span>
            </el-radio-button>
          </el-radio-group>
        </div>
        <div class="table-placeholder">表格区域（模拟）</div>
      </div>
    </div>

    <!-- 方案C：筛选标签与统计栏同行左右分布 -->
    <div class="scheme-card">
      <h3 class="scheme-label">方案C：同行左右分布（标签左，统计右）</h3>
      <div class="station-list-module">
        <div class="list-header">
          <div class="module-title">电站列表</div>
          <div class="header-right-group">
            <div class="status-statistics inline-stats">
              <span class="stat-item"><span class="dot" style="background: #409EFF;"></span>总数 48</span>
              <span class="stat-item"><span class="dot" style="background: #67c23a;"></span>正常 45</span>
              <span class="stat-item"><span class="dot" style="background: #f56c6c;"></span>故障 1</span>
              <span class="stat-item"><span class="dot" style="background: #909399;"></span>断连 2</span>
            </div>
            <el-radio-group v-model="activeStatusC" size="small">
              <el-radio-button value="all">全部</el-radio-button>
              <el-radio-button value="normal">正常</el-radio-button>
              <el-radio-button value="fault">故障</el-radio-button>
              <el-radio-button value="offline">断连</el-radio-button>
            </el-radio-group>
          </div>
        </div>
        <div class="table-placeholder">表格区域（模拟）</div>
      </div>
    </div>

    <!-- 方案D：统计栏用进度条替代（已修复显示问题） -->
    <div class="scheme-card">
      <h3 class="scheme-label">方案D：统计栏改为进度条（百分比展示）</h3>
      <div class="station-list-module">
        <div class="list-header">
          <div class="module-title">电站列表</div>
          <el-radio-group v-model="activeStatusD" size="small">
            <el-radio-button value="all">全部</el-radio-button>
            <el-radio-button value="normal">正常</el-radio-button>
            <el-radio-button value="fault">故障</el-radio-button>
            <el-radio-button value="offline">断连</el-radio-button>
          </el-radio-group>
        </div>
        <div class="progress-stats">
          <div class="progress-item">
            <span class="progress-label">正常</span>
            <el-progress :percentage="93.75" :stroke-width="6" :show-text="false" color="#67c23a" />
          </div>
          <div class="progress-item">
            <span class="progress-label">故障</span>
            <el-progress :percentage="2.08" :stroke-width="6" :show-text="false" color="#f56c6c" />
          </div>
          <div class="progress-item">
            <span class="progress-label">断连</span>
            <el-progress :percentage="4.17" :stroke-width="6" :show-text="false" color="#909399" />
          </div>
        </div>
        <div class="table-placeholder">表格区域（模拟）</div>
      </div>
    </div>

    <!-- 方案E：数字融入标签 + 前置彩色圆点 -->
    <div class="scheme-card">
      <h3 class="scheme-label">方案E：数字融入标签 + 前置彩色圆点</h3>
      <div class="station-list-module">
        <div class="list-header">
          <div class="module-title">电站列表</div>
          <el-radio-group v-model="activeStatusE" size="small">
            <el-radio-button value="all">
              <span class="tag-with-count"><span class="dot" style="background: #409EFF; display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 4px; vertical-align: middle;"></span>全部 <span class="count">48</span></span>
            </el-radio-button>
            <el-radio-button value="normal">
              <span class="tag-with-count"><span class="dot" style="background: #67c23a; display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 4px; vertical-align: middle;"></span>正常 <span class="count">45</span></span>
            </el-radio-button>
            <el-radio-button value="fault">
              <span class="tag-with-count"><span class="dot" style="background: #f56c6c; display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 4px; vertical-align: middle;"></span>故障 <span class="count">1</span></span>
            </el-radio-button>
            <el-radio-button value="offline">
              <span class="tag-with-count"><span class="dot" style="background: #909399; display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 4px; vertical-align: middle;"></span>断连 <span class="count">2</span></span>
            </el-radio-button>
          </el-radio-group>
        </div>
        <div class="table-placeholder">表格区域（模拟）</div>
      </div>
    </div>

    <!-- 方案F：数字融入标签 + 彩色圆角方块背景 -->
    <div class="scheme-card">
      <h3 class="scheme-label">方案F：数字融入标签 + 彩色圆角方块（徽章）</h3>
      <div class="station-list-module">
        <div class="list-header">
          <div class="module-title">电站列表</div>
          <el-radio-group v-model="activeStatusF" size="small">
            <el-radio-button value="all">
              <span class="tag-with-count">全部 <span class="count badge" style="background: #409EFF; color: #fff; border-radius: 10px; padding: 1px 6px; font-size: 12px; margin-left: 4px; vertical-align: middle;">48</span></span>
            </el-radio-button>
            <el-radio-button value="normal">
              <span class="tag-with-count">正常 <span class="count badge" style="background: #67c23a; color: #fff; border-radius: 10px; padding: 1px 6px; font-size: 12px; margin-left: 4px; vertical-align: middle;">45</span></span>
            </el-radio-button>
            <el-radio-button value="fault">
              <span class="tag-with-count">故障 <span class="count badge" style="background: #f56c6c; color: #fff; border-radius: 10px; padding: 1px 6px; font-size: 12px; margin-left: 4px; vertical-align: middle;">1</span></span>
            </el-radio-button>
            <el-radio-button value="offline">
              <span class="tag-with-count">断连 <span class="count badge" style="background: #909399; color: #fff; border-radius: 10px; padding: 1px 6px; font-size: 12px; margin-left: 4px; vertical-align: middle;">2</span></span>
            </el-radio-button>
          </el-radio-group>
        </div>
        <div class="table-placeholder">表格区域（模拟）</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const activeStatusA = ref('all')
const activeStatusB = ref('all')
const activeStatusC = ref('all')
const activeStatusD = ref('all')
const activeStatusE = ref('all')
const activeStatusF = ref('all')
</script>

<style scoped>
.explorer-page {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fb 0%, #e8ecf0 100%);
  padding: 24px;
  box-sizing: border-box;
  font-family: "Microsoft YaHei", sans-serif;
}
.explorer-title { font-size: 22px; font-weight: 700; color: #1a1a2e; margin-bottom: 8px; }
.explorer-desc { font-size: 14px; color: #86909c; margin-bottom: 32px; line-height: 1.6; }
.scheme-card { margin-bottom: 32px; }
.scheme-label {
  font-size: 16px; font-weight: 600; color: #1D2129; margin-bottom: 12px;
  padding: 8px 16px; background: #fff; border-radius: 8px; display: inline-block;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

/* 卡片容器 */
.station-list-module {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  padding: 16px 24px;
  width: 100%;
  box-sizing: border-box;
}
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.module-title { font-size: 16px; font-weight: 700; color: #1D2129; }
:deep(.el-radio-button__inner) { border-radius: 6px; padding: 8px 16px; }
:deep(.el-radio-button__orig-radio:checked + .el-radio-button__inner) {
  background: linear-gradient(90deg, #0052D9, #165DFF); border-color: #165DFF; box-shadow: none;
}

/* 统计栏 */
.status-statistics {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 16px;
  padding: 8px 16px;
  background: #F8F9FA;
  border-radius: 8px;
  font-size: 14px;
  color: #4E5969;
}
.stat-item { display: flex; align-items: center; gap: 6px; }
.dot { width: 8px; height: 8px; border-radius: 50%; }

/* 方案B/E/F 数字融入标签样式 */
.tag-with-count .count {
  background: rgba(255,255,255,0.3);
  border-radius: 10px;
  padding: 0 6px;
  margin-left: 4px;
  font-size: 12px;
}
/* 确保彩色徽章背景覆盖通用样式 */
.tag-with-count .badge {
  background: inherit;
  padding: 1px 6px;
}

/* 方案C */
.header-right-group {
  display: flex;
  align-items: center;
  gap: 16px;
}
.inline-stats {
  margin-bottom: 0;
  padding: 6px 12px;
}

/* 方案D 进度条 */
.progress-stats {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
  padding: 8px 0;
}
.progress-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}
.progress-item :deep(.el-progress) {
  flex: 1;
}
.progress-label {
  font-size: 13px;
  color: #4E5969;
  min-width: 40px;
}

/* 占位表格 */
.table-placeholder {
  height: 120px;
  background: #f5f7fa;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #aaa;
  font-size: 14px;
}
</style>