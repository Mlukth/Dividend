<template>
  <div class="comparison-container">
    <div class="toolbar">
      <h2>流程图方案对比</h2>
      <div class="controls">
        <el-radio-group v-model="currentScheme" size="large">
          <el-radio-button value="A">方案A：泳道热度</el-radio-button>
          <el-radio-button value="B">方案B：层级树</el-radio-button>
          <el-radio-button value="C">方案C：卡片网格</el-radio-button>
        </el-radio-group>
        <el-button type="primary" @click="exportScheme">导出当前方案</el-button>
      </div>
    </div>

    <!-- 方案 A -->
    <div v-if="currentScheme === 'A'" class="scheme-wrapper">
      <div class="legend">
        <span class="legend-item"><span class="swatch" style="background:#f56c6c"></span> 已过期/今日到期</span>
        <span class="legend-item"><span class="swatch" style="background:#e6a23c"></span> 3天内</span>
        <span class="legend-item"><span class="swatch" style="background:#67c23a"></span> 7天内</span>
        <span class="legend-item"><span class="swatch" style="background:#b0c4de"></span> 更远</span>
      </div>
      <div class="heatmap-chart">
        <div
          v-for="task in tasks"
          :key="task.id"
          class="task-row"
          :class="{ 'pulse-row': isOverdue(task) }"
          :title="`${task.taskName} · 预计 ${task.estimatedHours}h · 截止 ${formatDate(task.expectedCompletionTime)}`"
        >
          <div class="task-label">{{ task.taskName }}</div>
          <div class="task-bar-area">
            <div
              class="task-bar"
              :style="{ width: taskWidth(task), backgroundColor: urgencyColor(task) }"
            >{{ task.estimatedHours }}h</div>
            <div class="deadline-marker" :style="{ left: deadlinePos(task) }"></div>
          </div>
          <div class="task-deadline">{{ formatDate(task.expectedCompletionTime) }}</div>
        </div>
      </div>
    </div>

    <!-- 方案 B -->
    <div v-if="currentScheme === 'B'" class="scheme-wrapper">
      <div class="legend">
        <span class="legend-item"><span class="swatch" style="background:#f56c6c"></span> 已过期/今日</span>
        <span class="legend-item"><span class="swatch" style="background:#e6a23c"></span> 3天内</span>
        <span class="legend-item"><span class="swatch" style="background:#67c23a"></span> 7天内</span>
        <span class="legend-item"><span class="swatch" style="background:#b0c4de"></span> 更远</span>
      </div>
      <div class="tree-view">
        <TreeNode v-for="node in treeData" :key="node.id" :node="node" :level="0" />
      </div>
    </div>

    <!-- 方案 C -->
    <div v-if="currentScheme === 'C'" class="scheme-wrapper">
      <div class="grid-layout">
        <div
          v-for="task in tasks"
          :key="task.id"
          class="card-grid-item"
          :class="urgencyCardClass(task)"
          :title="`${task.taskName} · 预计 ${task.estimatedHours}h · 截止 ${formatDate(task.expectedCompletionTime)}`"
        >
          <div class="card-header">
            <span class="card-title">{{ task.taskName }}</span>
            <el-tag :type="priorityTagType(task.priority)" size="small">{{ priorityLabel(task.priority) }}</el-tag>
          </div>
          <div class="card-deadline">⏱ {{ formatDate(task.expectedCompletionTime) }}</div>
          <div class="card-progress">
            <div class="progress-track">
              <div class="progress-fill" :style="{ width: urgencyPercent(task) + '%', backgroundColor: urgencyColor(task) }"></div>
            </div>
            <span class="progress-text">{{ urgencyPercent(task) }}%</span>
          </div>
          <div class="card-meta">{{ task.estimatedHours }}h 预计</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import TreeNode from './TreeNode.vue'

// TreeNode 的悬停提示由该组件内部处理 (TreeNode.vue 也会添加 title)
// 为了保持一致，我们也可以在 TreeNode 里添加，但这里暂不修改，你后续需要时可以让我补上。

const currentScheme = ref('A')

const tasks = ref([
  { id: 't1', taskName: '组件通用化改造', expectedCompletionTime: '2026-05-02', estimatedHours: 4, priority: 'high' },
  { id: 't2', taskName: '登录模块重构', expectedCompletionTime: '2026-05-05', estimatedHours: 8, priority: 'medium' },
  { id: 't3', taskName: 'UI 调整', expectedCompletionTime: '2026-05-10', estimatedHours: 2, priority: 'low' },
  { id: 't4', taskName: '性能优化', expectedCompletionTime: '2026-04-30', estimatedHours: 12, priority: 'high' },
  { id: 't5', taskName: '文档编写', expectedCompletionTime: '2026-05-20', estimatedHours: 6, priority: 'low' },
])

const today = new Date()
today.setHours(0, 0, 0, 0)

function daysUntil(dateStr) {
  const d = new Date(dateStr)
  d.setHours(0, 0, 0, 0)
  return Math.ceil((d - today) / (1000 * 60 * 60 * 24))
}

function isOverdue(task) {
  return daysUntil(task.expectedCompletionTime) <= 0
}

function urgencyColor(task) {
  const days = daysUntil(task.expectedCompletionTime)
  if (days <= 0) return '#f56c6c'
  if (days <= 3) return '#e6a23c'
  if (days <= 7) return '#67c23a'
  return '#b0c4de'
}

function taskWidth(task) {
  const maxHours = 16
  return Math.min((task.estimatedHours / maxHours) * 100, 100) + '%'
}

function deadlinePos(task) {
  const minD = Math.min(...tasks.value.map(t => daysUntil(t.expectedCompletionTime)))
  const maxD = Math.max(...tasks.value.map(t => daysUntil(t.expectedCompletionTime)))
  const range = maxD - minD || 1
  return ((daysUntil(task.expectedCompletionTime) - minD) / range * 80 + 10) + '%'
}

function urgencyPercent(task) {
  const days = daysUntil(task.expectedCompletionTime)
  if (days <= 0) return 100
  if (days >= 30) return 5
  return Math.max(5, Math.round(100 - (days / 30) * 100))
}

function urgencyCardClass(task) {
  const days = daysUntil(task.expectedCompletionTime)
  if (days <= 0) return 'pulse-strong'
  if (days <= 2) return 'pulse-mild'
  return ''
}

function priorityTagType(priority) {
  return priority === 'high' ? 'danger' : priority === 'medium' ? 'warning' : 'info'
}

function priorityLabel(priority) {
  return { high: '高', medium: '中', low: '低' }[priority] || priority
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

const treeData = computed(() => [
  {
    ...tasks.value[0],
    children: [
      { ...tasks.value[1], children: [] },
      { ...tasks.value[2], children: [] }
    ]
  },
  {
    ...tasks.value[3],
    children: [
      { ...tasks.value[4], children: [] }
    ]
  }
])

const schemeMeta = {
  A: { desc: '泳道时间热度网格 + 过期呼吸效果：横轴时间，纵轴任务，过期任务行有红色脉冲背景。', code: `<div class="heatmap-chart"> ... </div>` },
  B: { desc: '层级树状图：从上到下展示任务依赖树，左侧色带显示紧迫度，卡片式节点。', code: `<TreeNode v-for="node in treeData" ... />` },
  C: { desc: '卡片网格 + 脉冲动画：紧迫卡片自动脉冲提醒，进度条显示截止时间占比。', code: `<div class="grid-layout"> ... </div>` }
}

const exportScheme = () => {
  const meta = schemeMeta[currentScheme.value]
  const text = `方案${currentScheme.value}：${meta.desc}\n\n核心结构：\n${meta.code}`
  navigator.clipboard.writeText(text).then(() => ElMessage.success('方案核心已复制到剪贴板')).catch(() => ElMessage.error('复制失败'))
}
</script>

<style scoped>
.comparison-container {
  padding: 20px;
  background: #f8fafc;
  min-height: 100vh;
}
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.controls {
  display: flex;
  gap: 16px;
  align-items: center;
}
.legend {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  font-size: 13px;
}
.swatch {
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 4px;
  margin-right: 4px;
}

/* 方案 A 样式 */
.heatmap-chart {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
}
.task-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  border-radius: 12px;
  padding: 4px 8px;
  transition: background-color 0.3s;
}
.pulse-row {
  animation: pulseBg 1.8s infinite;
}
@keyframes pulseBg {
  0% { background-color: rgba(245, 108, 108, 0.04); }
  50% { background-color: rgba(245, 108, 108, 0.12); }
  100% { background-color: rgba(245, 108, 108, 0.04); }
}

.task-label {
  width: 140px;
  font-weight: 600;
  font-size: 14px;
}
.task-bar-area {
  flex: 1;
  height: 36px;
  background: #edf2f7;
  border-radius: 12px;
  position: relative;
}
.task-bar {
  height: 100%;
  border-radius: 12px;
  display: flex;
  align-items: center;
  padding-left: 8px;
  color: white;
  font-size: 12px;
  font-weight: 600;
  transition: width 0.4s;
}
.deadline-marker {
  position: absolute;
  top: -4px;
  bottom: -4px;
  width: 2px;
  background: #1e293b;
}
.task-deadline {
  width: 60px;
  font-size: 13px;
  color: #475569;
}

/* 方案 C 样式 */
.grid-layout {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}
.card-grid-item {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  border-left: 4px solid transparent;
  transition: box-shadow 0.3s;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.card-title {
  font-weight: 600;
  font-size: 15px;
}
.card-deadline {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 8px;
}
.card-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.progress-track {
  flex: 1;
  height: 8px;
  background: #e2e8f0;
  border-radius: 99px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.4s;
}
.progress-text {
  font-size: 12px;
  color: #64748b;
}
.card-meta {
  font-size: 13px;
  color: #64748b;
}
.pulse-strong {
  animation: pulseStrong 1.2s infinite;
  border-left-color: #f56c6c;
}
.pulse-mild {
  animation: pulseMild 2s infinite;
  border-left-color: #e6a23c;
}
@keyframes pulseStrong {
  0% { box-shadow: 0 0 0 0 rgba(245,108,108,0.4); }
  70% { box-shadow: 0 0 0 8px rgba(245,108,108,0); }
  100% { box-shadow: 0 0 0 0 rgba(245,108,108,0); }
}
@keyframes pulseMild {
  0% { box-shadow: 0 0 0 0 rgba(230,162,60,0.3); }
  70% { box-shadow: 0 0 0 6px rgba(230,162,60,0); }
  100% { box-shadow: 0 0 0 0 rgba(230,162,60,0); }
}
</style>