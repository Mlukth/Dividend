<template>
  <div class="task-manager">
    <!-- 顶部操作栏 -->
    <div class="header-bar">
      <h2 class="page-title">任务管理中心</h2>
      <div class="header-actions">
        <el-button type="primary" class="btn-primary" @click="showPromptDialog = true">
          <el-icon><Edit /></el-icon> 编辑提示词
        </el-button>
        <el-button class="btn-export" @click="exportTasks">
          <el-icon><Download /></el-icon> 导出JSON
        </el-button>
        <el-button class="btn-import" @click="triggerImport">
          <el-icon><Upload /></el-icon> 导入JSON
        </el-button>
        <input ref="fileInput" type="file" accept=".json" style="display:none" @change="handleFileImport" />
      </div>
    </div>

    <!-- 语音/文本需求输入区 -->
    <div class="voice-input-section">
      <div class="section-label">
        <el-icon><Microphone /></el-icon> 需求描述（语音输入后文字显示于此）
      </div>
      <el-input
        v-model="userRequirement"
        type="textarea"
        :rows="4"
        placeholder="在此输入或粘贴需求描述，例如：请帮我生成 4 月份的前端开发任务，包括组件测试和接口联调..."
        class="requirement-textarea"
      />
      <div class="voice-action-bar">
        <el-button type="primary" size="large" class="combine-copy-btn" @click="combineAndCopyPrompt">
          <el-icon><CopyDocument /></el-icon> 组合并复制完整提示词
        </el-button>
        <span class="action-tip">点击后自动复制到剪贴板，可粘贴至 AI 对话窗口</span>
      </div>
    </div>

    <!-- Tab切换：时间轴 / 流程图 -->
    <div class="view-tabs">
      <el-radio-group v-model="currentView">
        <el-radio-button value="timeline">
          <el-icon><Clock /></el-icon> 时间轴视图
        </el-radio-button>
        <el-radio-button value="flowchart">
          <el-icon><Connection /></el-icon> 流程图视图
        </el-radio-button>
      </el-radio-group>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 时间轴视图 -->
      <div v-show="currentView === 'timeline'" class="timeline-panel">
        <!-- 增量更新输入区 -->
        <div class="update-panel">
          <h3 class="panel-title">📝 增量更新任务</h3>
          <p class="panel-hint">粘贴 JSON 或使用提示词+大模型生成后粘贴</p>
          <el-input
            v-model="jsonInput"
            type="textarea"
            :rows="6"
            placeholder='粘贴JSON数组，例如：
[
  {
    "taskName": "任务名称",
    "taskDate": "2026-04-20",
    "priority": "high",
    "dependencies": [],
    "estimatedHours": 4,
    "description": "任务描述",
    "tags": ["标签1"]
  }
]'
            class="json-input"
          />
          <el-button type="primary" class="btn-update" @click="handleIncrementalUpdate">
            <el-icon><Plus /></el-icon> 追加任务
          </el-button>
        </div>

        <!-- ===== 新增：AI 响应直接导入区 ===== -->
        <div class="ai-import-panel">
          <h3 class="panel-title">
            <el-icon><ChatDotRound /></el-icon> AI 响应直接导入
          </h3>
          <p class="panel-hint">将从 AI 对话中获取的 JSON 数组粘贴到下方，一键导入任务列表（无需保存文件）</p>
          <el-input
            v-model="aiResponseJson"
            type="textarea"
            :rows="8"
            placeholder="粘贴 AI 返回的 JSON 数组..."
            class="ai-json-input"
          />
          <div class="ai-import-actions">
            <el-button type="success" class="btn-ai-import" @click="handleAiResponseImport">
              <el-icon><UploadFilled /></el-icon> 直接导入任务
            </el-button>
            <el-button class="btn-clear" @click="aiResponseJson = ''">
              <el-icon><Delete /></el-icon> 清空
            </el-button>
          </div>
        </div>
        <!-- ===== 新增结束 ===== -->

        <!-- 时间轴：无滚动条，自然撑开 -->
        <div class="timeline-container">
          <div v-if="timelineData.length === 0" class="empty-state">
            <el-empty description="暂无任务，请导入JSON添加" />
          </div>
          <div v-else class="timeline">
            <div v-for="dateGroup in timelineData" :key="dateGroup.date" class="timeline-item">
              <div class="timeline-date">
                <div class="date-badge">{{ formatDate(dateGroup.date) }}</div>
                <div class="date-count">{{ dateGroup.tasks.length }} 个任务</div>
              </div>
              <div class="timeline-cards">
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
                    <span class="meta-item">
                      <el-icon><Clock /></el-icon> {{ task.estimatedHours }}h
                    </span>
                    <span v-if="task.dependencies && task.dependencies.length > 0" class="meta-item">
                      <el-icon><Link /></el-icon> {{ task.dependencies.length }} 个前置
                    </span>
                  </div>
                  <div v-if="task.tags && task.tags.length > 0" class="task-tags">
                    <el-tag v-for="tag in task.tags" :key="tag" size="small" type="info">{{ tag }}</el-tag>
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
      </div>

      <!-- 流程图视图 -->
      <div v-show="currentView === 'flowchart'" class="flowchart-panel">
        <div class="flowchart-toolbar">
          <el-button size="small" @click="fitView">
            <el-icon><FullScreen /></el-icon> 自适应
          </el-button>
          <el-button size="small" @click="zoomIn">
            <el-icon><ZoomIn /></el-icon> 放大
          </el-button>
          <el-button size="small" @click="zoomOut">
            <el-icon><ZoomOut /></el-icon> 缩小
          </el-button>
          <el-button size="small" @click="addNode">
            <el-icon><Plus /></el-icon> 添加节点
          </el-button>
        </div>
        <div ref="flowContainer" class="flow-container">
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
                  <el-checkbox v-model="data.completed" @click.stop @change="updateTaskComplete(data.id, data.completed)">
                    {{ data.completed ? '已完成' : '待办' }}
                  </el-checkbox>
                </div>
                <div class="node-title">{{ data.label }}</div>
                <div class="node-meta">
                  <span>{{ data.estimatedHours }}h</span>
                  <el-tag :type="getPriorityType(data.priority)" size="small">{{ getPriorityText(data.priority) }}</el-tag>
                </div>
              </div>
            </template>
          </VueFlow>
          <div v-else class="empty-flow">
            <el-empty description="暂无任务数据，请先在时间轴视图导入任务" />
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑任务对话框 -->
    <el-dialog v-model="editDialogVisible" title="编辑任务" width="500px">
      <el-form :model="editingTask" label-width="100px">
        <el-form-item label="任务名称">
          <el-input v-model="editingTask.taskName" />
        </el-form-item>
        <el-form-item label="完成日期">
          <el-date-picker v-model="editingTask.taskDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="editingTask.priority" style="width: 100%">
            <el-option value="high" label="高优先级" />
            <el-option value="medium" label="中优先级" />
            <el-option value="low" label="低优先级" />
          </el-select>
        </el-form-item>
        <el-form-item label="预计耗时(h)">
          <el-input-number v-model="editingTask.estimatedHours" :min="0.5" :step="0.5" />
        </el-form-item>
        <el-form-item label="任务描述">
          <el-input v-model="editingTask.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="标签">
          <el-select v-model="editingTask.tags" multiple allow-create filterable style="width: 100%">
            <el-option v-for="tag in allTags" :key="tag" :value="tag" :label="tag" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveTask">保存</el-button>
      </template>
    </el-dialog>

    <!-- 提示词编辑对话框 -->
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Clock, Connection, Edit, Download, Upload, Plus, Link,
  FullScreen, ZoomIn, ZoomOut, Microphone, CopyDocument,
  ChatDotRound, UploadFilled, Delete
} from '@element-plus/icons-vue'

const { fitView, zoomIn: vueZoomIn, zoomOut: vueZoomOut, onConnect, onNodesChange, onEdgesChange, addNodes, project } = useVueFlow()

// 状态
const currentView = ref('timeline')
const tasks = ref([])
const jsonInput = ref('')
const editDialogVisible = ref(false)
const showPromptDialog = ref(false)
const editingTask = ref({})
const flowContainer = ref(null)
const fileInput = ref(null)

// 用户需求输入
const userRequirement = ref('')

// 新增：AI 响应 JSON 直接导入框
const aiResponseJson = ref('')

// 提示词配置
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

// 组合并复制功能
const combineAndCopyPrompt = async () => {
  const basePrompt = promptConfig.value.taskPrompt
  const userInput = userRequirement.value.trim()
  
  if (!userInput) {
    ElMessage.warning('请先在需求描述框中输入内容')
    return
  }
  
  const fullPrompt = `${basePrompt}\n\n用户需求：\n${userInput}\n\n请根据以上需求生成符合格式的 JSON 数组。`
  
  try {
    await navigator.clipboard.writeText(fullPrompt)
    ElMessage.success('✅ 完整提示词已复制到剪贴板！现在可以粘贴到 AI 对话窗口。')
  } catch (err) {
    ElMessage.error('复制失败，请手动复制')
  }
}

// 新增：AI 响应直接导入处理
const handleAiResponseImport = () => {
  const rawJson = aiResponseJson.value.trim()
  if (!rawJson) {
    ElMessage.warning('请先粘贴 AI 返回的 JSON 数据')
    return
  }

  try {
    let parsedTasks = JSON.parse(rawJson)
    if (!Array.isArray(parsedTasks)) {
      parsedTasks = [parsedTasks]
    }

    const newTasks = parsedTasks.map(task => ({
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      taskName: task.taskName || '未命名任务',
      taskDate: task.taskDate || '',
      priority: task.priority || 'medium',
      dependencies: task.dependencies || [],
      estimatedHours: task.estimatedHours || 1,
      description: task.description || '',
      tags: task.tags || [],
      completed: false
    }))

    tasks.value = [...tasks.value, ...newTasks]
    saveTasks()
    
    // 可选：清空输入框
    // aiResponseJson.value = ''
    
    ElMessage.success(`✅ 成功导入 ${newTasks.length} 个任务`)
  } catch (e) {
    ElMessage.error('JSON 格式错误：' + e.message)
  }
}

// 从localStorage加载
onMounted(() => {
  const savedTasks = localStorage.getItem('taskManager_tasks')
  const savedPrompt = localStorage.getItem('taskManager_prompt')
  if (savedTasks) {
    tasks.value = JSON.parse(savedTasks)
  }
  if (savedPrompt) {
    promptConfig.value = JSON.parse(savedPrompt)
  }
})

// 保存到localStorage
const saveTasks = () => {
  localStorage.setItem('taskManager_tasks', JSON.stringify(tasks.value))
  syncFlowData()
}

const savePromptConfig = () => {
  localStorage.setItem('taskManager_prompt', JSON.stringify(promptConfig.value))
  showPromptDialog.value = false
  ElMessage.success('提示词配置已保存')
}

// 时间轴数据
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

// 流程图数据
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

// 增量更新（原有）
const handleIncrementalUpdate = () => {
  if (!jsonInput.value.trim()) {
    ElMessage.warning('请先输入JSON数据')
    return
  }
  
  try {
    let newTasks = JSON.parse(jsonInput.value)
    if (!Array.isArray(newTasks)) {
      newTasks = [newTasks]
    }

    newTasks = newTasks.map(task => ({
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      taskName: task.taskName || '未命名任务',
      taskDate: task.taskDate || '',
      priority: task.priority || 'medium',
      dependencies: task.dependencies || [],
      estimatedHours: task.estimatedHours || 1,
      description: task.description || '',
      tags: task.tags || [],
      completed: false
    }))

    tasks.value = [...tasks.value, ...newTasks]
    saveTasks()
    jsonInput.value = ''
    ElMessage.success(`成功追加 ${newTasks.length} 个任务`)
  } catch (e) {
    ElMessage.error('JSON格式错误：' + e.message)
  }
}

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
    flowNodes.value = flowNodes.value.filter(n => n.id !== taskId)
    flowEdges.value = flowEdges.value.filter(e => e.source !== taskId && e.target !== taskId)
    saveTasks()
    ElMessage.success('任务已删除')
  }).catch(() => {})
}

const updateTaskComplete = (taskId, completed) => {
  const task = tasks.value.find(t => t.id === taskId)
  if (task) {
    task.completed = completed
    saveTasks()
  }
}

const zoomIn = () => vueZoomIn()
const zoomOut = () => vueZoomOut()

const addNode = () => {
  ElMessage.info('请在左侧时间轴添加任务，流程图会自动同步')
}

const handleNodeClick = (event) => {
  console.log('Node clicked:', event.node.data)
}

const handleEdgeClick = (event) => {
  console.log('Edge clicked:', event.edge)
}

const triggerImport = () => {
  fileInput.value.click()
}

const handleFileImport = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const importedTasks = JSON.parse(e.target.result)
      if (Array.isArray(importedTasks)) {
        const newTasks = importedTasks.map(task => ({
          id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          taskName: task.taskName || '未命名任务',
          taskDate: task.taskDate || '',
          priority: task.priority || 'medium',
          dependencies: task.dependencies || [],
          estimatedHours: task.estimatedHours || 1,
          description: task.description || '',
          tags: task.tags || [],
          completed: task.completed || false
        }))
        tasks.value = [...tasks.value, ...newTasks]
        saveTasks()
        ElMessage.success(`成功导入 ${newTasks.length} 个任务`)
      }
    } catch (e) {
      ElMessage.error('文件格式错误：' + e.message)
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

const formatDate = (dateStr) => {
  if (dateStr === '未设置') return '未设置'
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}月${date.getDate()}日 ${['日','一','二','三','四','五','六'][date.getDay()]}`
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
/* 整体布局 */
.task-manager {
  width: 100%;
  min-height: 100vh;
  background: #f0f4f8;
  padding: 28px 32px;
  box-sizing: border-box;
}

.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #1D2129;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 16px;
}

.btn-primary {
  background: linear-gradient(90deg, #0052D9, #165DFF);
  border: none;
  border-radius: 10px;
  padding: 10px 20px;
}

.btn-export, .btn-import {
  border-radius: 10px;
  border-color: #DCDFE6;
  color: #606266;
  padding: 10px 20px;
}

.btn-update {
  background: linear-gradient(90deg, #0052D9, #165DFF);
  border: none;
  border-radius: 10px;
  width: 100%;
  margin-top: 16px;
  padding: 12px;
}

/* 语音输入区 */
.voice-input-section {
  background: #ffffff;
  border-radius: 20px;
  padding: 24px 28px;
  margin-bottom: 28px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  border: 1px solid #e9eef4;
}

.section-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
}

.requirement-textarea :deep(.el-textarea__inner) {
  font-size: 15px;
  line-height: 1.6;
  border-radius: 14px;
  background: #fafcfd;
  border: 1px solid #d0d9e4;
}

.voice-action-bar {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
}

.combine-copy-btn {
  padding: 14px 32px;
  font-size: 16px;
  border-radius: 40px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border: none;
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.3);
}

.action-tip {
  color: #64748b;
  font-size: 14px;
  font-style: italic;
}

/* Tab切换 */
.view-tabs {
  margin-bottom: 24px;
}

:deep(.el-radio-button__inner) {
  border-radius: 10px;
  padding: 12px 24px;
  font-weight: 500;
}

:deep(.el-radio-button__orig-radio:checked + .el-radio-button__inner) {
  background: linear-gradient(90deg, #0052D9, #165DFF);
  border-color: #165DFF;
  box-shadow: none;
}

/* 主内容区 */
.main-content {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
  padding: 4px;
}

.timeline-panel {
  padding: 28px;
}

/* 增量更新面板 */
.update-panel {
  background: #f5f9ff;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 28px;
  border: 1px solid #e2edfb;
}

.panel-title {
  font-size: 18px;
  font-weight: 700;
  color: #1D2129;
  margin: 0 0 10px 0;
}

.panel-hint {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 16px 0;
}

.json-input :deep(.el-textarea__inner) {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 14px;
  border-radius: 12px;
  background: #fff;
  border: 1px solid #d0d9e4;
}

/* AI 响应直接导入面板 */
.ai-import-panel {
  background: #f0fdf4;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
  border: 1px solid #bbf7d0;
}

.ai-json-input :deep(.el-textarea__inner) {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 14px;
  border-radius: 12px;
  background: #fff;
  border: 1px solid #86efac;
}

.ai-import-actions {
  display: flex;
  gap: 16px;
  margin-top: 20px;
}

.btn-ai-import {
  flex: 1;
  background: #10b981;
  border: none;
  border-radius: 40px;
  padding: 14px;
  font-size: 16px;
  font-weight: 600;
  color: white;
}

.btn-ai-import:hover {
  background: #059669;
}

.btn-clear {
  border-radius: 40px;
  padding: 14px 24px;
  border: 1px solid #d1d5db;
}

/* 时间轴容器 */
.timeline-container {
  padding-bottom: 20px;
}

.empty-state {
  padding: 80px 0;
}

.timeline {
  position: relative;
  padding-left: 24px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 4px;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, #0052D9, #165DFF);
  border-radius: 4px;
}

.timeline-item {
  position: relative;
  padding-left: 36px;
  margin-bottom: 44px;
}

.timeline-item::before {
  content: '';
  position: absolute;
  left: -28px;
  top: 10px;
  width: 16px;
  height: 16px;
  background: #fff;
  border: 4px solid #165DFF;
  border-radius: 50%;
  box-shadow: 0 2px 6px rgba(22, 93, 255, 0.2);
}

.timeline-date {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.date-badge {
  background: linear-gradient(90deg, #0052D9, #165DFF);
  color: #fff;
  padding: 8px 20px;
  border-radius: 30px;
  font-size: 15px;
  font-weight: 600;
}

.date-count {
  font-size: 14px;
  color: #64748b;
  background: #f0f4f8;
  padding: 4px 12px;
  border-radius: 20px;
}

.timeline-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.task-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.04);
  border-left: 5px solid #909399;
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
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
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

/* 流程图面板 */
.flowchart-panel {
  padding: 28px;
}

.flowchart-toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  padding: 14px 18px;
  background: #f5f9ff;
  border-radius: 14px;
  border: 1px solid #e2edfb;
}

.flow-container {
  height: calc(100vh - 380px);
  background: #fafcfd;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
}

.empty-flow {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.flow-node {
  background: #fff;
  border-radius: 12px;
  padding: 14px 18px;
  min-width: 180px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
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

.prompt-hint {
  background: #f5f9ff;
  padding: 18px;
  border-radius: 12px;
  border: 1px solid #e2edfb;
}

.prompt-hint code {
  font-size: 13px;
  color: #1e293b;
  white-space: pre-wrap;
}

@media screen and (max-width: 900px) {
  .task-manager {
    padding: 20px 16px;
  }
  
  .voice-input-section {
    padding: 20px;
  }
  
  .voice-action-bar {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .combine-copy-btn {
    width: 100%;
  }
}

@media screen and (max-width: 768px) {
  .header-bar {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .header-actions {
    flex-wrap: wrap;
  }
  
  .timeline-cards {
    grid-template-columns: 1fr;
  }
}
</style>