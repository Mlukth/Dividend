<template>
  <div class="task-flow-editor">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <el-card class="tool-card">
        <template #header>
          <div class="card-header">
            <span>🔧 任务管理控制台</span>
            <el-button type="primary" @click="copyPrompt">
              <el-icon><DocumentCopy /></el-icon>
              复制提示词
            </el-button>
          </div>
        </template>
        
        <div class="prompt-box">
          <el-input
            v-model="systemPrompt"
            type="textarea"
            :rows="3"
            placeholder="系统提示词模板"
            readonly
          />
        </div>
      </el-card>
    </div>

    <!-- 主体内容区 -->
    <el-row :gutter="20" class="main-content">
      <!-- 左侧：时间轴任务列表 -->
      <el-col :span="8">
        <el-card class="task-card">
          <template #header>
            <div class="card-header">
              <span>📅 任务时间轴</span>
              <el-button type="success" size="small" @click="showAddDialog = true">
                <el-icon><Plus /></el-icon>
                新增
              </el-button>
            </div>
          </template>
          
          <div class="timeline">
            <el-timeline>
              <el-timeline-item
                v-for="task in sortedTasks"
                :key="task.id"
                :timestamp="task.dueDate"
                :type="getStatusType(task.status)"
                :color="getStatusColor(task.status)"
              >
                <div class="task-item">
                  <div class="task-title">
                    <el-tag :type="getStatusType(task.status)" size="small">
                      {{ getStatusText(task.status) }}
                    </el-tag>
                    <span class="title-text">{{ task.title }}</span>
                  </div>
                  <div class="task-actions">
                    <el-button type="primary" link size="small" @click="editTask(task)">
                      编辑
                    </el-button>
                    <el-button type="danger" link size="small" @click="deleteTask(task.id)">
                      删除
                    </el-button>
                  </div>
                </div>
              </el-timeline-item>
            </el-timeline>
          </div>
        </el-card>
      </el-col>

      <!-- 中间：增量更新输入区 -->
      <el-col :span="8">
        <el-card class="input-card">
          <template #header>
            <div class="card-header">
              <span>🎤 语音输入增量更新</span>
            </div>
          </template>
          
          <div class="input-area">
            <el-input
              v-model="voiceInput"
              type="textarea"
              :rows="10"
              placeholder="在此输入语音转文字内容...&#10;&#10;示例：&#10;新增任务：完成前端开发，截止日期4月20日，依赖于需求分析&#10;将任务'编写Vue组件'状态改为完成"
            />
            <el-button type="primary" class="generate-btn" @click="generateUpdate" :loading="generating">
              <el-icon><MagicStick /></el-icon>
              生成JSON更新
            </el-button>
            
            <div class="json-preview" v-if="generatedJson">
              <el-divider content-position="left">生成的JSON</el-divider>
              <el-input
                v-model="generatedJson"
                type="textarea"
                :rows="8"
                readonly
              />
              <el-button type="success" class="apply-btn" @click="applyUpdate">
                <el-icon><Check /></el-icon>
                应用更新
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧：流程图编辑器 -->
      <el-col :span="8">
        <el-card class="flow-card">
          <template #header>
            <div class="card-header">
              <span>🔀 流程图可视化</span>
              <div class="flow-actions">
                <el-button type="primary" size="small" @click="refreshFlow">
                  <el-icon><Refresh /></el-icon>
                  刷新
                </el-button>
                <el-button type="warning" size="small" @click="exportFlow">
                  <el-icon><Download /></el-icon>
                  导出
                </el-button>
              </div>
            </div>
          </template>
          
          <div class="flow-container" ref="flowContainer">
            <!-- 流程图将在这里渲染 -->
            <div class="flow-placeholder" v-if="!flowInitialized">
              <el-empty description="点击刷新生成流程图" />
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 新增/编辑任务对话框 -->
    <el-dialog v-model="showAddDialog" :title="editingTask ? '编辑任务' : '新增任务'" width="500px">
      <el-form :model="taskForm" label-width="100px">
        <el-form-item label="任务标题">
          <el-input v-model="taskForm.title" placeholder="请输入任务标题" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="taskForm.description" type="textarea" :rows="3" placeholder="请输入任务描述" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="taskForm.status" placeholder="请选择状态">
            <el-option label="待处理" value="pending" />
            <el-option label="进行中" value="in_progress" />
            <el-option label="已完成" value="done" />
          </el-select>
        </el-form-item>
        <el-form-item label="截止日期">
          <el-date-picker v-model="taskForm.dueDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="依赖任务">
          <el-select v-model="taskForm.dependsOn" multiple placeholder="请选择依赖的任务">
            <el-option
              v-for="task in tasks.filter(t => t.id !== editingTask?.id)"
              :key="task.id"
              :label="task.title"
              :value="task.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="saveTask">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { DocumentCopy, Plus, MagicStick, Check, Refresh, Download } from '@element-plus/icons-vue'

// --- 数据状态 ---
const tasks = ref([
  {
    id: 'task_001',
    title: '完成需求分析',
    description: '梳理Vue项目的所有功能点',
    status: 'done',
    dueDate: '2026-04-18',
    dependsOn: []
  },
  {
    id: 'task_002',
    title: '编写Vue组件',
    description: '实现核心功能组件',
    status: 'in_progress',
    dueDate: '2026-04-19',
    dependsOn: ['task_001']
  },
  {
    id: 'task_003',
    title: '集成流程图库',
    description: '引入G6或Vue-Flow',
    status: 'pending',
    dueDate: '2026-04-20',
    dependsOn: ['task_002']
  }
])

const systemPrompt = ref(`「任务更新助手」：
你是一个严格的 JSON 生成器。请将以下自然语言描述，转换成符合给定 Schema 的 JSON Patch（增量更新）。
- 只输出 JSON，不要其他文字
- 如果是新任务，自动生成 UUID（格式：task_xxx）
- 如果是修改现有任务，通过 title 或 id 匹配
- 状态只能是：pending, in_progress, done
- 操作类型：add（新增）、update（更新）、delete（删除）

Schema：
{
  "operations": [
    {
      "type": "add|update|delete",
      "task": {
        "id": "task_xxx",
        "title": "任务标题",
        "description": "描述",
        "status": "pending|in_progress|done",
        "dueDate": "2026-04-18",
        "dependsOn": ["task_001"]
      }
    }
  ]
}`)

const voiceInput = ref('')
const generatedJson = ref('')
const generating = ref(false)
const showAddDialog = ref(false)
const editingTask = ref(null)
const flowInitialized = ref(false)
const flowContainer = ref(null)

const taskForm = ref({
  id: '',
  title: '',
  description: '',
  status: 'pending',
  dueDate: '',
  dependsOn: []
})

// --- 计算属性 ---
const sortedTasks = computed(() => {
  return [...tasks.value].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
})

// --- 方法 ---
const getStatusType = (status) => {
  const map = { pending: 'info', in_progress: 'warning', done: 'success' }
  return map[status] || 'info'
}

const getStatusColor = (status) => {
  const map = { pending: 'gray', in_progress: 'blue', done: 'green' }
  return map[status] || 'gray'
}

const getStatusText = (status) => {
  const map = { pending: '待处理', in_progress: '进行中', done: '已完成' }
  return map[status] || status
}

const copyPrompt = async () => {
  try {
    await navigator.clipboard.writeText(systemPrompt.value)
    ElMessage.success('提示词已复制到剪贴板')
  } catch (err) {
    ElMessage.error('复制失败，请手动复制')
  }
}

const generateUpdate = () => {
  if (!voiceInput.value.trim()) {
    ElMessage.warning('请先输入语音转文字内容')
    return
  }
  
  generating.value = true
  
  // 模拟AI生成JSON的过程
  setTimeout(() => {
    // 简单的规则匹配生成示例JSON
    const input = voiceInput.value
    let operations = []
    
    if (input.includes('新增') || input.includes('添加')) {
      operations.push({
        type: 'add',
        task: {
          id: `task_${String(tasks.value.length + 1).padStart(3, '0')}`,
          title: '新任务（请根据语音修改）',
          description: '自动生成的任务描述',
          status: 'pending',
          dueDate: '2026-04-21',
          dependsOn: []
        }
      })
    }
    
    if (input.includes('完成') || input.includes('改为完成')) {
      const taskToUpdate = tasks.value.find(t => input.includes(t.title))
      if (taskToUpdate) {
        operations.push({
          type: 'update',
          task: { ...taskToUpdate, status: 'done' }
        })
      }
    }
    
    generatedJson.value = JSON.stringify({ operations }, null, 2)
    generating.value = false
    ElMessage.success('JSON生成成功')
  }, 1000)
}

const applyUpdate = () => {
  try {
    const data = JSON.parse(generatedJson.value)
    if (data.operations && Array.isArray(data.operations)) {
      data.operations.forEach(op => {
        if (op.type === 'add') {
          tasks.value.push(op.task)
        } else if (op.type === 'update') {
          const index = tasks.value.findIndex(t => t.id === op.task.id)
          if (index !== -1) {
            tasks.value[index] = op.task
          }
        } else if (op.type === 'delete') {
          const index = tasks.value.findIndex(t => t.id === op.task.id)
          if (index !== -1) {
            tasks.value.splice(index, 1)
          }
        }
      })
      ElMessage.success('更新已应用')
      generatedJson.value = ''
      voiceInput.value = ''
    }
  } catch (err) {
    ElMessage.error('JSON解析失败：' + err.message)
  }
}

const editTask = (task) => {
  editingTask.value = task
  taskForm.value = { ...task }
  showAddDialog.value = true
}

const deleteTask = (id) => {
  ElMessageBox.confirm('确定要删除这个任务吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = tasks.value.findIndex(t => t.id === id)
    if (index !== -1) {
      tasks.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

const saveTask = () => {
  if (!taskForm.value.title) {
    ElMessage.warning('请输入任务标题')
    return
  }
  
  if (editingTask.value) {
    const index = tasks.value.findIndex(t => t.id === editingTask.value.id)
    if (index !== -1) {
      tasks.value[index] = { ...taskForm.value }
    }
  } else {
    taskForm.value.id = `task_${String(tasks.value.length + 1).padStart(3, '0')}`
    tasks.value.push({ ...taskForm.value })
  }
  
  showAddDialog.value = false
  editingTask.value = null
  taskForm.value = { id: '', title: '', description: '', status: 'pending', dueDate: '', dependsOn: [] }
  ElMessage.success('保存成功')
}

const refreshFlow = () => {
  flowInitialized.value = true
  ElMessage.success('流程图已刷新（实际项目中需集成G6/Vue-Flow）')
}

const exportFlow = () => {
  const dataStr = JSON.stringify({ tasks: tasks.value }, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'tasks-flow.json'
  link.click()
  URL.revokeObjectURL(url)
  ElMessage.success('流程图数据已导出')
}

onMounted(() => {
  // 初始化流程图（实际使用时需引入G6或Vue-Flow）
  console.log('组件已挂载，流程图容器：', flowContainer.value)
})
</script>

<style scoped>
.task-flow-editor {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.toolbar {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.main-content {
  margin-top: 20px;
}

.tool-card, .task-card, .input-card, .flow-card {
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.prompt-box {
  margin-top: 10px;
}

.timeline {
  max-height: 600px;
  overflow-y: auto;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.task-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-text {
  font-weight: 500;
}

.task-actions {
  display: flex;
  gap: 5px;
}

.input-area {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.generate-btn {
  width: 100%;
}

.json-preview {
  margin-top: 10px;
}

.apply-btn {
  width: 100%;
  margin-top: 10px;
}

.flow-container {
  height: 500px;
  background-color: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.flow-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.flow-actions {
  display: flex;
  gap: 8px;
}
</style>