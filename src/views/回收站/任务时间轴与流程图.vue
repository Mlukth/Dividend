<template>
  <div class="app-layout">
    <!-- ==================== 左侧操作区（固定宽度） ==================== -->
    <div class="left-panel">
      <div class="panel-header">
        <h2>任务管理中心</h2>
        <div class="header-actions">
          <el-button link type="primary" @click="showPromptDialog = true">
            <el-icon><Edit /></el-icon> 提示词
          </el-button>
          <el-dropdown @command="handleFileCommand">
            <el-button link type="primary">
              <el-icon><FolderOpened /></el-icon> 文件
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="import">
                  <el-icon><Upload /></el-icon> 导入 JSON
                </el-dropdown-item>
                <el-dropdown-item command="export">
                  <el-icon><Download /></el-icon> 导出 JSON
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <!-- 需求输入区 -->
      <div class="section-card">
        <div class="section-title">
          <el-icon><Microphone /></el-icon> 需求描述
        </div>
        <el-input
          v-model="userRequirement"
          type="textarea"
          :rows="5"
          placeholder="语音输入后文字自动填充，或直接打字..."
          class="custom-textarea"
        />
        <el-button type="primary" class="action-btn" @click="combineAndCopyPrompt">
          <el-icon><CopyDocument /></el-icon> 组合并复制完整提示词
        </el-button>
        <p class="hint-text">点击后复制到剪贴板，可粘贴至 AI 对话窗口</p>
      </div>

      <!-- 智能任务导入区 -->
      <div class="section-card import-section">
        <div class="section-title">
          <el-icon><DocumentAdd /></el-icon> 智能任务导入
        </div>
        <p class="hint-text">粘贴 AI 返回的 JSON 数组，或手动编辑的任务数据</p>
        <el-input
          v-model="taskImportJson"
          type="textarea"
          :rows="8"
          placeholder='[
  {
    "taskName": "组件通用化改造",
    "taskDate": "2026-04-25",
    "priority": "high",
    ...
  }
]'
          class="custom-textarea json-textarea"
        />
        <div class="import-actions">
          <el-button type="success" class="import-btn" @click="handleSmartImport">
            <el-icon><UploadFilled /></el-icon> 导入任务
          </el-button>
          <el-button class="clear-btn" @click="taskImportJson = ''">
            <el-icon><Delete /></el-icon> 清空
          </el-button>
        </div>
        <div class="task-stats">
          <span>当前任务总数：{{ tasks.length }} 个</span>
        </div>
      </div>
    </div>

    <!-- ==================== 右侧视图区（自适应剩余宽度） ==================== -->
    <div class="right-panel">
      <!-- 视图切换 -->
      <div class="view-tabs">
        <el-radio-group v-model="currentView" size="large">
          <el-radio-button value="timeline">
            <el-icon><Clock /></el-icon> 时间轴
          </el-radio-button>
          <el-radio-button value="flowchart">
            <el-icon><Connection /></el-icon> 流程图
          </el-radio-button>
        </el-radio-group>
      </div>

      <!-- 时间轴视图 -->
      <div v-show="currentView === 'timeline'" class="timeline-view">
        <div v-if="timelineData.length === 0" class="empty-full">
          <el-empty description="暂无任务，请在左侧导入 JSON 添加" />
        </div>
        <div v-else class="timeline-scroll">
          <div v-for="dateGroup in timelineData" :key="dateGroup.date" class="timeline-block">
            <div class="date-header">
              <span class="date-text">{{ formatDate(dateGroup.date) }}</span>
              <el-badge :value="dateGroup.tasks.length" type="primary" />
            </div>
            <div class="task-grid">
              <div
                v-for="task in dateGroup.tasks"
                :key="task.id"
                class="task-card"
                :class="[`priority-${task.priority}`, { completed: task.completed }]"
              >
                <div class="card-header">
                  <el-checkbox v-model="task.completed" @change="saveTasks">完成</el-checkbox>
                  <el-tag :type="getPriorityType(task.priority)" size="small">
                    {{ getPriorityText(task.priority) }}
                  </el-tag>
                </div>
                <h4 class="task-name" :class="{ 'line-through': task.completed }">{{ task.taskName }}</h4>
                <p v-if="task.description" class="task-desc">{{ task.description }}</p>
                <div class="task-meta">
                  <span><el-icon><Clock /></el-icon> {{ task.estimatedHours }}h</span>
                  <span v-if="task.dependencies?.length">
                    <el-icon><Link /></el-icon> {{ task.dependencies.length }}
                  </span>
                </div>
                <div v-if="task.tags?.length" class="task-tags">
                  <el-tag v-for="tag in task.tags" :key="tag" size="small">{{ tag }}</el-tag>
                </div>
                <div class="card-actions">
                  <el-button link type="primary" @click="editTask(task)">编辑</el-button>
                  <el-button link type="danger" @click="deleteTask(task.id)">删除</el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 流程图视图 -->
      <div v-show="currentView === 'flowchart'" class="flowchart-view">
        <div class="flow-toolbar">
          <el-button-group>
            <el-button size="small" @click="fitView">
              <el-icon><FullScreen /></el-icon> 自适应
            </el-button>
            <el-button size="small" @click="zoomIn">
              <el-icon><ZoomIn /></el-icon>
            </el-button>
            <el-button size="small" @click="zoomOut">
              <el-icon><ZoomOut /></el-icon>
            </el-button>
          </el-button-group>
        </div>
        <div ref="flowContainer" class="flow-canvas">
          <VueFlow
            v-if="flowNodes.length > 0"
            :nodes="flowNodes"
            :edges="flowEdges"
            :default-viewport="{ zoom: 1 }"
            @node-click="handleNodeClick"
            @edge-click="handleEdgeClick"
            @nodes-change="onNodesChange"
            @edges-change="onEdgesChange"
            @connect="onConnect"
          >
            <template #node-custom="{ data }">
              <div
                class="flow-node"
                :class="[`priority-${data.priority}`, { completed: data.completed }]"
              >
                <div class="node-header">
                  <el-checkbox
                    v-model="data.completed"
                    @click.stop
                    @change="updateTaskComplete(data.taskId, data.completed)"
                  >
                    {{ data.completed ? '已完成' : '待办' }}
                  </el-checkbox>
                </div>
                <div class="node-title">{{ data.label }}</div>
                <div class="node-meta">
                  <span>{{ data.estimatedHours }}h</span>
                  <el-tag :type="getPriorityType(data.priority)" size="small">
                    {{ getPriorityText(data.priority) }}
                  </el-tag>
                </div>
              </div>
            </template>
          </VueFlow>
          <div v-else class="empty-flow">
            <el-empty description="暂无任务数据" />
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== 编辑任务对话框 ==================== -->
    <el-dialog v-model="editDialogVisible" title="编辑任务" width="500px">
      <el-form :model="editingTask" label-width="100px">
        <el-form-item label="任务名称">
          <el-input v-model="editingTask.taskName" />
        </el-form-item>
        <el-form-item label="完成日期">
          <el-date-picker
            v-model="editingTask.taskDate"
            type="date"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="editingTask.priority" style="width: 100%">
            <el-option value="high" label="高优先级" />
            <el-option value="medium" label="中优先级" />
            <el-option value="low" label="低优先级" />
          </el-select>
        </el-form-item>
        <el-form-item label="预计耗时(h)">
          <el-input-number
            v-model="editingTask.estimatedHours"
            :min="0.5"
            :step="0.5"
          />
        </el-form-item>
        <el-form-item label="任务描述">
          <el-input v-model="editingTask.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="标签">
          <el-select
            v-model="editingTask.tags"
            multiple
            allow-create
            filterable
            style="width: 100%"
          >
            <el-option v-for="tag in allTags" :key="tag" :value="tag" :label="tag" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveTask">保存</el-button>
      </template>
    </el-dialog>

    <!-- ==================== 提示词编辑对话框 ==================== -->
    <el-dialog v-model="showPromptDialog" title="提示词配置" width="700px">
      <el-form :model="promptConfig" label-width="100px">
        <el-form-item label="任务解析提示词">
          <el-input
            v-model="promptConfig.taskPrompt"
            type="textarea"
            :rows="10"
            placeholder="输入提示词，用于解析自然语言生成任务JSON..."
          />
        </el-form-item>
        <el-form-item label="JSON字段说明">
          <div class="prompt-hint">
            <code>{{ JSON.stringify(promptConfig.fieldsDesc, null, 2) }}</code>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPromptDialog = false">取消</el-button>
        <el-button type="primary" @click="savePromptConfig">保存</el-button>
      </template>
    </el-dialog>

    <!-- 隐藏的文件 input -->
    <input
      ref="fileInput"
      type="file"
      accept=".json"
      style="display: none"
      @change="handleFileImport"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Clock, Connection, Edit, Download, Upload, Link,
  FullScreen, ZoomIn, ZoomOut, Microphone, CopyDocument,
  FolderOpened, DocumentAdd, UploadFilled, Delete
} from '@element-plus/icons-vue'

// --- Vue Flow 实例 ---
const { fitView, zoomIn: vueZoomIn, zoomOut: vueZoomOut, onConnect, onNodesChange, onEdgesChange, project } = useVueFlow()

// --- 响应式状态 ---
const currentView = ref('timeline')
const tasks = ref([])
const editDialogVisible = ref(false)
const showPromptDialog = ref(false)
const editingTask = ref({})
const flowContainer = ref(null)
const fileInput = ref(null)

const userRequirement = ref('')
const taskImportJson = ref('')

// --- 提示词配置 ---
const promptConfig = ref({
  taskPrompt: `你是一个任务拆解助手。用户会输入一段话，请提取其中的任务信息并输出JSON数组。

输出字段说明：
- taskName: 任务名称（必填）
- taskDate: 预计完成日期，格式YYYY-MM-DD（必填）
- priority: 优先级，high/medium/low（必填）
- dependencies: 关联的前置任务名数组（可选）
- estimatedHours: 预计耗时小时数（必填）
- description: 任务详细描述（可选）
- tags: 标签数组，如["开发","测试"]（可选）

注意：
1. 只输出JSON数组，不要其他内容
2. 如果有前置任务依赖，dependencies中填入已存在任务的taskName
3. 每个任务要有唯一标识，id会自动生成`,
  fields: ['taskName', 'taskDate', 'priority', 'dependencies', 'estimatedHours', 'description', 'tags'],
  fieldsDesc: {
    taskName: '任务名称（必填）',
    taskDate: '预计完成日期 YYYY-MM-DD（必填）',
    priority: '优先级 high/medium/low（必填）',
    dependencies: '前置任务名数组（可选）',
    estimatedHours: '预计耗时小时数（必填）',
    description: '任务详细描述（可选）',
    tags: '标签数组（可选）'
  }
})

// --- 初始化加载 localStorage ---
onMounted(() => {
  const savedTasks = localStorage.getItem('taskManager_tasks')
  const savedPrompt = localStorage.getItem('taskManager_prompt')
  if (savedTasks) {
    try {
      tasks.value = JSON.parse(savedTasks)
    } catch (e) {
      console.error('解析任务数据失败', e)
    }
  }
  if (savedPrompt) {
    try {
      promptConfig.value = JSON.parse(savedPrompt)
    } catch (e) {
      console.error('解析提示词配置失败', e)
    }
  }
  syncFlowData()
})

// --- 保存任务到 localStorage 并同步流程图 ---
const saveTasks = () => {
  localStorage.setItem('taskManager_tasks', JSON.stringify(tasks.value))
  syncFlowData()
}

// --- 保存提示词配置 ---
const savePromptConfig = () => {
  localStorage.setItem('taskManager_prompt', JSON.stringify(promptConfig.value))
  showPromptDialog.value = false
  ElMessage.success('提示词配置已保存')
}

// --- 组合并复制完整提示词 ---
const combineAndCopyPrompt = async () => {
  const base = promptConfig.value.taskPrompt
  const input = userRequirement.value.trim()
  if (!input) {
    ElMessage.warning('请先输入需求描述')
    return
  }
  const full = `${base}\n\n用户需求：\n${input}\n\n请根据以上需求生成符合格式的 JSON 数组。`
  try {
    await navigator.clipboard.writeText(full)
    ElMessage.success('✅ 完整提示词已复制到剪贴板！现在可以粘贴到 AI 对话窗口。')
  } catch {
    ElMessage.error('复制失败，请手动复制')
  }
}

// --- 智能导入任务（解析 JSON 并追加）---
const handleSmartImport = () => {
  const raw = taskImportJson.value.trim()
  if (!raw) {
    ElMessage.warning('请先粘贴 JSON 数据')
    return
  }
  try {
    let parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) parsed = [parsed]

    const newTasks = parsed.map(t => ({
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      taskName: t.taskName || '未命名任务',
      taskDate: t.taskDate || '',
      priority: t.priority || 'medium',
      dependencies: t.dependencies || [],
      estimatedHours: t.estimatedHours || 1,
      description: t.description || '',
      tags: t.tags || [],
      completed: false
    }))

    tasks.value = [...tasks.value, ...newTasks]
    saveTasks()
    ElMessage.success(`✅ 成功导入 ${newTasks.length} 个任务`)
  } catch (e) {
    ElMessage.error('JSON 格式错误：' + e.message)
  }
}

// --- 文件操作（导入/导出）---
const handleFileCommand = (command) => {
  if (command === 'import') {
    fileInput.value.click()
  } else if (command === 'export') {
    exportTasks()
  }
}

const handleFileImport = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result)
      if (Array.isArray(imported)) {
        const newTasks = imported.map(t => ({
          id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          taskName: t.taskName || '未命名任务',
          taskDate: t.taskDate || '',
          priority: t.priority || 'medium',
          dependencies: t.dependencies || [],
          estimatedHours: t.estimatedHours || 1,
          description: t.description || '',
          tags: t.tags || [],
          completed: t.completed || false
        }))
        tasks.value = [...tasks.value, ...newTasks]
        saveTasks()
        ElMessage.success(`成功导入 ${newTasks.length} 个任务`)
      }
    } catch (err) {
      ElMessage.error('文件格式错误：' + err.message)
    }
  }
  reader.readAsText(file)
  event.target.value = ''
}

const exportTasks = () => {
  const dataStr = JSON.stringify(tasks.value, null, 2)
  const blob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `tasks_${new Date().toISOString().slice(0, 10)}.json`
  link.click()
  URL.revokeObjectURL(url)
  ElMessage.success('任务已导出')
}

// --- 时间轴数据计算 ---
const timelineData = computed(() => {
  const grouped = {}
  tasks.value.forEach(task => {
    const date = task.taskDate || '未设置'
    if (!grouped[date]) {
      grouped[date] = { date, tasks: [] }
    }
    grouped[date].tasks.push(task)
  })
  return Object.values(grouped).sort((a, b) => {
    if (a.date === '未设置') return 1
    if (b.date === '未设置') return -1
    return new Date(a.date) - new Date(b.date)
  })
})

// --- 流程图数据 ---
const flowNodes = ref([])
const flowEdges = ref([])

const syncFlowData = () => {
  const existingNodeIds = new Set(flowNodes.value.map(n => n.id))

  tasks.value.forEach((task, index) => {
    if (!existingNodeIds.has(task.id)) {
      const node = {
        id: task.id,
        type: 'custom',
        position: project({ x: (index % 4) * 250, y: Math.floor(index / 4) * 120 }),
        data: {
          label: task.taskName,
          priority: task.priority,
          estimatedHours: task.estimatedHours,
          completed: task.completed || false,
          taskId: task.id
        }
      }
      flowNodes.value.push(node)
    } else {
      const node = flowNodes.value.find(n => n.id === task.id)
      if (node) {
        node.data.label = task.taskName
        node.data.priority = task.priority
        node.data.estimatedHours = task.estimatedHours
        node.data.completed = task.completed
      }
    }
  })

  const currentTaskIds = new Set(tasks.value.map(t => t.id))
  flowNodes.value = flowNodes.value.filter(n => currentTaskIds.has(n.id))

  flowEdges.value = []
  tasks.value.forEach(task => {
    if (task.dependencies && task.dependencies.length > 0) {
      task.dependencies.forEach(depName => {
        const depTask = tasks.value.find(t => t.taskName === depName)
        if (depTask) {
          flowEdges.value.push({
            id: `${depTask.id}-${task.id}`,
            source: depTask.id,
            target: task.id,
            type: 'smoothstep',
            animated: !task.completed,
            style: { stroke: task.completed ? '#67C23A' : '#409EFF' }
          })
        }
      })
    }
  })
}

watch(tasks, syncFlowData, { deep: true })

// --- 任务编辑相关 ---
const editTask = (task) => {
  editingTask.value = { ...task }
  editDialogVisible.value = true
}

const saveTask = () => {
  const index = tasks.value.findIndex(t => t.id === editingTask.value.id)
  if (index !== -1) {
    tasks.value[index] = { ...editingTask.value }
    saveTasks()
  }
  editDialogVisible.value = false
  ElMessage.success('任务已保存')
}

const deleteTask = (taskId) => {
  ElMessageBox.confirm('确定要删除这个任务吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    tasks.value = tasks.value.filter(t => t.id !== taskId)
    saveTasks()
    ElMessage.success('任务已删除')
  }).catch(() => {})
}

// --- 流程图交互 ---
const updateTaskComplete = (taskId, completed) => {
  const task = tasks.value.find(t => t.id === taskId)
  if (task) {
    task.completed = completed
    saveTasks()
  }
}

const zoomIn = () => vueZoomIn()
const zoomOut = () => vueZoomOut()

const handleNodeClick = (event) => {
  console.log('Node clicked:', event.node.data)
}

const handleEdgeClick = (event) => {
  console.log('Edge clicked:', event.edge)
}

// --- 辅助方法 ---
const formatDate = (dateStr) => {
  if (dateStr === '未设置') return '未设置'
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}月${date.getDate()}日 ${['日', '一', '二', '三', '四', '五', '六'][date.getDay()]}`
}

const getPriorityType = (priority) => {
  const map = { high: 'danger', medium: 'warning', low: 'info' }
  return map[priority] || 'info'
}

const getPriorityText = (priority) => {
  const map = { high: '高', medium: '中', low: '低' }
  return map[priority] || '未知'
}

const allTags = computed(() => {
  const tags = new Set()
  tasks.value.forEach(task => {
    if (task.tags) {
      task.tags.forEach(tag => tags.add(tag))
    }
  })
  return Array.from(tags)
})
</script>

<style scoped>
/* ===== 全局布局：严格左右两栏，无下方延伸 ===== */
* {
  box-sizing: border-box;
}

.app-layout {
  display: flex;
  flex-direction: row;
  height: 100vh;
  width: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  background: #f0f4f8;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

/* ===== 左侧面板：固定宽度，可滚动 ===== */
.left-panel {
  width: 420px;
  flex-shrink: 0;
  height: 100vh;
  overflow-y: auto;
  background: #ffffff;
  border-right: 1px solid #e9eef4;
  padding: 24px 20px;
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.02);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.panel-header h2 {
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.section-card {
  background: #fafcfd;
  border-radius: 18px;
  padding: 20px;
  margin-bottom: 24px;
  border: 1px solid #e2e8f0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 16px;
}

.custom-textarea :deep(.el-textarea__inner) {
  border-radius: 14px;
  background: #fff;
  border: 1px solid #cbd5e1;
  font-size: 14px;
  line-height: 1.5;
}

.action-btn {
  width: 100%;
  margin-top: 16px;
  border-radius: 40px;
  padding: 12px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border: none;
  font-weight: 600;
}

.hint-text {
  font-size: 13px;
  color: #64748b;
  margin-top: 10px;
  text-align: center;
}

.import-section {
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.json-textarea :deep(.el-textarea__inner) {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 13px;
}

.import-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.import-btn {
  flex: 1;
  border-radius: 40px;
  background: #10b981;
  border: none;
  font-weight: 600;
}

.clear-btn {
  border-radius: 40px;
  border: 1px solid #d1d5db;
}

.task-stats {
  margin-top: 16px;
  font-size: 13px;
  color: #475569;
  text-align: right;
}

/* ===== 右侧面板：自适应宽度，纵向 flex ===== */
.right-panel {
  flex: 1;
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 20px 28px;
  overflow: hidden;
}

.view-tabs {
  flex-shrink: 0;
  margin-bottom: 20px;
}

/* 时间轴视图 */
.timeline-view {
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;
}

.timeline-scroll {
  width: 100%;
}

.timeline-block {
  margin-bottom: 36px;
}

.date-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}

.date-text {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  background: linear-gradient(135deg, #ffffff, #f8fafc);
  padding: 4px 16px;
  border-radius: 30px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
}

.task-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.task-card {
  background: #fff;
  border-radius: 18px;
  padding: 18px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.04);
  border-left: 5px solid;
  transition: all 0.25s ease;
}

.task-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(0, 82, 217, 0.12);
}

.task-card.priority-high {
  border-left-color: #F53F3F;
}

.task-card.priority-medium {
  border-left-color: #FF7D00;
}

.task-card.priority-low {
  border-left-color: #909399;
}

.task-card.completed {
  opacity: 0.75;
  background: #fafbfc;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.task-name {
  font-size: 16px;
  font-weight: 700;
  color: #1D2129;
  margin: 0 0 12px 0;
}

.task-name.line-through {
  text-decoration: line-through;
  color: #909399;
}

.task-desc {
  font-size: 14px;
  color: #475569;
  margin: 0 0 16px 0;
  line-height: 1.6;
}

.task-meta {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
  font-size: 13px;
  color: #64748b;
}

.task-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #edf2f7;
}

.empty-full {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 流程图视图 */
.flowchart-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.flow-toolbar {
  flex-shrink: 0;
  margin-bottom: 12px;
}

.flow-canvas {
  flex: 1;
  width: 100%;
  background: #fafcfd;
  border-radius: 18px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.empty-flow {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.flow-node {
  background: #fff;
  border-radius: 14px;
  padding: 14px 18px;
  min-width: 180px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
  border-left: 5px solid #909399;
}

.flow-node.priority-high {
  border-left-color: #F53F3F;
}

.flow-node.priority-medium {
  border-left-color: #FF7D00;
}

.flow-node.priority-low {
  border-left-color: #909399;
}

.flow-node.completed {
  opacity: 0.7;
}

.node-header {
  margin-bottom: 10px;
}

.node-title {
  font-size: 15px;
  font-weight: 700;
  color: #1D2129;
  margin-bottom: 10px;
}

.node-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #64748b;
}

/* VueFlow 覆盖 */
:deep(.vue-flow) {
  background: #fafcfd;
}

:deep(.vue-flow__edge-path) {
  stroke-width: 2.5;
}

:deep(.vue-flow__handle) {
  width: 10px;
  height: 10px;
  background: #165DFF;
}

/* 提示词预览 */
.prompt-hint {
  background: #f5f9ff;
  padding: 18px;
  border-radius: 14px;
  border: 1px solid #e2edfb;
}

.prompt-hint code {
  font-size: 13px;
  color: #1e293b;
  white-space: pre-wrap;
}

/* 响应式 */
@media screen and (max-width: 1000px) {
  .app-layout {
    flex-direction: column;
  }
  .left-panel {
    width: 100%;
    height: auto;
    max-height: 40vh;
  }
  .right-panel {
    height: auto;
    flex: 1;
  }
}
</style>