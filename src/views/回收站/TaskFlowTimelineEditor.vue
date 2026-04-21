<template>
  <div class="task-timeline-flow-container">
    <!-- 顶部配置栏：提示词编辑 + 导入导出 -->
    <el-card class="header-card" shadow="hover">
      <div class="header-flex">
        <div class="title-group">
          <h3>任务时间轴流程图编辑器</h3>
          <span class="sub-title">JSON增量追加 | 本地持久化 (流程图依赖未安装)</span>
        </div>
        <div class="btn-group">
          <el-upload accept=".json" :show-file-list="false" :before-upload="importJsonAppend">
            <el-button type="primary" icon="Upload">导入JSON(追加)</el-button>
          </el-upload>
          <el-button type="success" icon="Download" @click="exportJson">导出JSON</el-button>
          <el-button type="warning" icon="Delete" @click="clearAllData">清空数据</el-button>
        </div>
      </div>
      <!-- 可编辑提示词配置 -->
      <el-divider content-position="left">提示词模板配置(可编辑)</el-divider>
      <el-input v-model="promptConfig" type="textarea" :rows="4" placeholder="AI生成任务JSON专用提示词" />
    </el-card>

    <!-- 主体单栏布局（时间轴） -->
    <el-row :gutter="20" class="main-row">
      <!-- 左侧：纵向时间轴 左日期 右卡片 -->
      <el-col :span="24">
        <el-card class="timeline-card" shadow="hover">
          <template #header>
            <span>📅 任务时间轴 (按日期排序)</span>
          </template>
          <div class="timeline-wrapper">
            <el-timeline mode="left" class="vertical-timeline">
              <el-timeline-item
                v-for="task in sortedTaskList"
                :key="task.id"
                :timestamp="task.taskDate"
                placement="left"
                :type="task.status === 'done' ? 'success' : getPriorityType(task.priority)"
              >
                <el-card class="task-card-item" shadow="never" :class="{ 'task-done': task.status === 'done' }">
                  <div class="task-header">
                    <h4 class="task-name">{{ task.taskName }}</h4>
                    <el-checkbox v-model="task.status" true-label="done" false-label="pending" @change="saveLocalData" />
                  </div>
                  <div class="task-info-grid">
                    <div class="info-item"><span>时间：</span>{{ task.taskTime }}</div>
                    <div class="info-item"><span>优先级：</span>{{ task.priority }}</div>
                    <div class="info-item"><span>预计耗时：</span>{{ task.duration }}</div>
                    <div class="info-item full-width"><span>前置任务：</span>{{ task.preTask || '无' }}</div>
                  </div>
                </el-card>
              </el-timeline-item>
            </el-timeline>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 核心数据
const taskList = ref([])
const promptConfig = ref(`# 任务JSON生成提示词
请严格输出标准JSON数组，字段如下：
id(唯一字符串),taskName(任务名),taskDate(YYYY-MM-DD),taskTime(HH:mm),priority(高/中/低),preTask(前置任务名),duration(耗时),status(pending/done)
仅输出JSON，无多余文字，用于增量追加任务列表`)

// 本地存储KEY
const STORAGE_KEY = 'TASK_TIMELINE_FLOW_DATA'

// 计算属性：按日期排序的任务
const sortedTaskList = computed(() => {
  return [...taskList.value].sort((a, b) => new Date(a.taskDate) - new Date(b.taskDate))
})

// 优先级样式映射
const getPriorityType = (level) => {
  const map = { 高: 'danger', 中: 'warning', 低: 'info' }
  return map[level] || 'info'
}

// 初始化：加载本地数据
onMounted(() => {
  loadLocalData()
})

// 监听任务变化 自动同步本地存储
watch(taskList, () => {
  saveLocalData()
}, { deep: true })

// 本地存储：加载
const loadLocalData = () => {
  const data = localStorage.getItem(STORAGE_KEY)
  if (data) taskList.value = JSON.parse(data)
}

// 本地存储：保存
const saveLocalData = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(taskList.value))
}

// JSON导入：增量追加 不覆盖
const importJsonAppend = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const newTasks = JSON.parse(e.target.result)
      if (!Array.isArray(newTasks)) throw new Error('必须是JSON数组格式')
      // 增量合并 去重
      const existIds = taskList.value.map(t => t.id)
      const uniqueTasks = newTasks.filter(t => !existIds.includes(t.id))
      taskList.value.push(...uniqueTasks)
      ElMessage.success(`成功追加 ${uniqueTasks.length} 条任务`)
    } catch (err) {
      ElMessage.error('JSON格式错误：' + err.message)
    }
  }
  reader.readAsText(file)
  return false
}

// JSON导出
const exportJson = () => {
  const blob = new Blob([JSON.stringify(taskList.value, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `任务列表_${new Date().toLocaleDateString()}.json`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('导出成功')
}

// 清空所有数据
const clearAllData = () => {
  ElMessageBox.confirm('确定清空所有任务？本地数据将删除', '警告', { type: 'warning' })
    .then(() => {
      taskList.value = []
      localStorage.removeItem(STORAGE_KEY)
      ElMessage.success('已清空')
    })
}
</script>

<style scoped>
.task-timeline-flow-container {
  padding: 16px;
  background: #f5f7fa;
  min-height: 100vh;
}
.header-card { margin-bottom: 16px; }
.header-flex { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
.title-group h3 { margin: 0; color: #303133; }
.sub-title { font-size: 12px; color: #909399; }
.btn-group { display: flex; gap: 8px; }
.main-row { min-height: calc(100vh - 220px); }

/* 时间轴样式 左日期 右卡片 */
.timeline-card { height: 100%; }
.timeline-wrapper { max-height: 75vh; overflow-y: auto; padding-right: 8px; }
.vertical-timeline :deep(.el-timeline-item__timestamp) { font-weight: 500; color: #606266; }
.task-card-item { margin-bottom: 8px; transition: all 0.3s; }
.task-card-item:hover { transform: translateX(4px); }
.task-done { opacity: 0.7; background: #f9f9f9; }
.task-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.task-name { margin: 0; font-size: 14px; color: #303133; }
.task-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 12px; color: #606266; }
.info-item.full-width { grid-column: 1 / -1; }
.info-item span { color: #909399; }
</style>