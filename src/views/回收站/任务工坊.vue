<template>
  <div class="task-workshop">
    <!-- 头部区域 -->
    <header class="workshop-header">
      <div class="title-section">
        <i class="fas fa-tasks"></i>
        <h1>任务工坊 · 时间轴 + 流程图</h1>
        <span class="badge">提示词驱动</span>
      </div>
      <div class="action-bar">
        <button class="btn btn-outline" @click="exportData">
          <i class="fas fa-download"></i> 导出数据
        </button>
        <label class="btn btn-outline">
          <i class="fas fa-upload"></i> 导入JSON
          <input type="file" accept=".json,application/json" @change="importData" style="display: none" />
        </label>
        <button class="btn btn-primary" @click="applyPromptToFlow">
          <i class="fas fa-magic"></i> 应用提示词更新流程图
        </button>
      </div>
    </header>

    <!-- 主内容区域：左侧配置 + 时间轴，右侧流程图 -->
    <div class="main-layout">
      <!-- 左侧面板 -->
      <div class="left-column">
        <!-- 可编辑提示词卡片 -->
        <section class="card prompt-editor-card">
          <div class="card-header">
            <i class="fas fa-pen-to-square"></i>
            <span>固定提示词 (可编辑)</span>
            <button class="icon-btn" @click="resetPromptToDefault" title="重置为默认提示词">
              <i class="fas fa-rotate-left"></i>
            </button>
          </div>
          <div class="prompt-textarea-wrapper">
            <textarea
              v-model="systemPrompt"
              placeholder="在此编辑提示词… 大模型将根据此提示词和语音输入框的内容生成增量JSON。"
              rows="6"
              class="prompt-textarea"
            ></textarea>
          </div>
          <div class="prompt-footer">
            <span class="hint"><i class="far fa-lightbulb"></i> 点击下方「语音输入框」旁按钮可调用此提示词</span>
          </div>
        </section>

        <!-- 语音输入框 (模拟) + 增量更新区域 -->
        <section class="card voice-card">
          <div class="card-header">
            <i class="fas fa-microphone-alt"></i>
            <span>语音输入 (文本框模拟)</span>
          </div>
          <textarea
            v-model="voiceInput"
            placeholder="例如：新增一个「设计评审」任务，优先级高，明天下午3点，耗时2h，依赖「原型完成」…"
            rows="3"
            class="voice-textarea"
          ></textarea>
          <div class="button-group">
            <button class="btn btn-secondary" @click="simulateAIGenerate">
              <i class="fas fa-robot"></i> 模拟AI生成增量JSON
            </button>
            <button class="btn btn-primary" @click="applyIncrementalUpdate">
              <i class="fas fa-plus-circle"></i> 增量更新任务列表
            </button>
          </div>
          <div v-if="generatedJsonPreview" class="json-preview">
            <div class="preview-header">
              <span>生成的增量JSON预览 (基于提示词+输入)</span>
              <i class="fas fa-copy" @click="copyJsonPreview" title="复制"></i>
            </div>
            <pre>{{ generatedJsonPreview }}</pre>
          </div>
        </section>

        <!-- 纵向时间轴任务列表 -->
        <section class="card timeline-card">
          <div class="card-header">
            <i class="fas fa-timeline"></i>
            <span>任务时间轴</span>
            <span class="task-count">{{ tasks.length }} 项</span>
          </div>
          <div class="timeline-container">
            <div v-if="tasks.length === 0" class="empty-timeline">
              <i class="far fa-calendar-alt"></i>
              <p>暂无任务，导入JSON或使用语音输入添加</p>
            </div>
            <div v-else class="timeline-list">
              <div v-for="(task, idx) in sortedTasks" :key="task.id" class="timeline-item">
                <div class="timeline-badge">
                  <span class="date-badge">{{ formatDate(task.dueDate) || '未安排' }}</span>
                  <span :class="['priority-tag', task.priority]">{{ task.priority || '中' }}</span>
                </div>
                <div class="task-card">
                  <div class="task-header">
                    <span class="task-name">{{ task.name }}</span>
                    <span class="task-time">{{ task.time || '--:--' }}</span>
                  </div>
                  <div class="task-meta">
                    <span v-if="task.dependsOn && task.dependsOn.length" class="depends">
                      <i class="fas fa-link"></i> 前置: {{ task.dependsOn.join(', ') }}
                    </span>
                    <span class="duration"><i class="far fa-clock"></i> {{ task.estimatedHours || '?' }}h</span>
                  </div>
                  <div class="task-actions">
                    <i class="far fa-edit" @click="editTask(task)" title="编辑"></i>
                    <i class="far fa-trash-alt" @click="deleteTask(task.id)" title="删除"></i>
                    <i class="far fa-check-circle" :class="{ completed: task.completed }" @click="toggleComplete(task)" title="标记完成"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- 右侧流程图区域 (VueFlow) -->
      <div class="right-column">
        <div class="flow-header">
          <span><i class="fas fa-project-diagram"></i> 流程图 · 可拖拽/连线/标记完成</span>
          <div class="flow-toolbar">
            <button class="btn-sm" @click="addNodeToFlow"><i class="fas fa-plus"></i> 添加节点</button>
            <button class="btn-sm" @click="syncTasksToFlow"><i class="fas fa-sync"></i> 同步任务到流程图</button>
            <button class="btn-sm" @click="clearFlow"><i class="fas fa-eraser"></i> 清空</button>
          </div>
        </div>
        <div class="vue-flow-wrapper">
          <VueFlow
            v-model="flowElements"
            :node-types="nodeTypes"
            :default-viewport="{ zoom: 1, x: 0, y: 0 }"
            :snap-to-grid="true"
            :snap-grid="[15, 15]"
            fit-view-on-init
            @node-click="onNodeClick"
            @edge-click="onEdgeClick"
          >
            <Background pattern-color="#e2e8f0" :gap="16" />
            <Controls />
            <MiniMap />
          </VueFlow>
        </div>
        <div class="flow-footer">
          <span class="tip"><i class="far fa-hand-pointer"></i> 点击节点可标记完成/编辑，拖拽连线建立依赖</span>
        </div>
      </div>
    </div>

    <!-- 编辑任务对话框 (简单内联模拟) -->
    <div v-if="editingTask" class="modal-overlay" @click.self="closeEdit">
      <div class="modal-card">
        <h3>编辑任务</h3>
        <div class="form-group">
          <label>任务名</label>
          <input v-model="editingTask.name" />
        </div>
        <div class="form-group">
          <label>截止日期</label>
          <input type="date" v-model="editingTask.dueDate" />
        </div>
        <div class="form-group">
          <label>时间</label>
          <input v-model="editingTask.time" placeholder="14:00" />
        </div>
        <div class="form-group">
          <label>优先级</label>
          <select v-model="editingTask.priority">
            <option>高</option>
            <option>中</option>
            <option>低</option>
          </select>
        </div>
        <div class="form-group">
          <label>预计耗时(h)</label>
          <input type="number" step="0.5" v-model="editingTask.estimatedHours" />
        </div>
        <div class="form-group">
          <label>前置任务ID (逗号分隔)</label>
          <input v-model="editingTask.dependsOnInput" placeholder="task1, task2" />
        </div>
        <div class="modal-actions">
          <button class="btn" @click="closeEdit">取消</button>
          <button class="btn btn-primary" @click="saveEdit">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { VueFlow, useVueFlow, Background, Controls, MiniMap } from '@vue-flow/core'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'

// ---------- 响应式数据 ----------
const systemPrompt = ref(`你是一个任务解析助手。根据用户的自然语言输入，生成一个或多个任务的JSON数组，用于增量更新任务列表。每个任务对象必须包含以下字段：
- id: 唯一字符串 (可使用时间戳+随机数)
- name: 任务名称
- dueDate: 截止日期 (YYYY-MM-DD)
- time: 具体时间 (HH:mm)
- priority: "高"|"中"|"低"
- estimatedHours: 预计耗时(数字)
- dependsOn: 前置任务ID数组 (如无则为空数组)
- completed: false
请严格输出JSON数组格式，不要包含额外解释。`)

const voiceInput = ref('')
const generatedJsonPreview = ref('')
const tasks = ref([])

// 流程图相关
const flowElements = ref([])
const { addNodes, addEdges, updateNode, updateEdge, removeNodes, fitView } = useVueFlow()

// 自定义节点类型 (简单卡片)
const nodeTypes = {
  custom: {
    template: `<div class="flow-node" :class="{ completed: data.completed }" @click="toggle"><div class="node-name">{{ data.label }}</div><div class="node-priority">{{ data.priority }}</div><div v-if="data.completed" class="node-check">✔</div></div>`,
    props: ['data'],
    methods: {
      toggle() {
        this.data.completed = !this.data.completed
        // 同步回任务列表
        const task = tasks.value.find(t => t.id === this.data.id)
        if (task) task.completed = this.data.completed
      }
    }
  }
}

// 临时编辑任务
const editingTask = ref(null)

// ---------- 计算属性 ----------
const sortedTasks = computed(() => {
  return [...tasks.value].sort((a, b) => {
    if (!a.dueDate) return 1
    if (!b.dueDate) return -1
    return a.dueDate.localeCompare(b.dueDate) || (a.time || '').localeCompare(b.time || '')
  })
})

// ---------- 方法 ----------
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getMonth()+1}/${d.getDate()}`
}

// 模拟AI生成 (实际应调用大模型，此处根据简单规则模拟)
const simulateAIGenerate = () => {
  if (!voiceInput.value.trim()) {
    generatedJsonPreview.value = '[]'
    return
  }
  // 非常简单的模拟：基于输入生成一个任务，展示格式
  const mockTask = {
    id: 'task_' + Date.now(),
    name: voiceInput.value.slice(0, 20) + (voiceInput.value.length > 20 ? '…' : ''),
    dueDate: new Date().toISOString().slice(0,10),
    time: '15:00',
    priority: '中',
    estimatedHours: 2,
    dependsOn: [],
    completed: false
  }
  generatedJsonPreview.value = JSON.stringify([mockTask], null, 2)
}

// 应用增量更新
const applyIncrementalUpdate = () => {
  if (!generatedJsonPreview.value) return
  try {
    const newTasks = JSON.parse(generatedJsonPreview.value)
    if (Array.isArray(newTasks)) {
      // 增量追加，不覆盖
      tasks.value = [...tasks.value, ...newTasks]
      // 清空预览和输入?
      voiceInput.value = ''
      generatedJsonPreview.value = ''
      // 同步到流程图
      syncTasksToFlow()
    }
  } catch (e) {
    alert('JSON解析失败: ' + e.message)
  }
}

// 复制JSON预览
const copyJsonPreview = () => {
  navigator.clipboard?.writeText(generatedJsonPreview.value)
}

// 重置提示词
const resetPromptToDefault = () => {
  systemPrompt.value = `你是一个任务解析助手。根据用户的自然语言输入，生成一个或多个任务的JSON数组，用于增量更新任务列表。每个任务对象必须包含以下字段：
- id: 唯一字符串 (可使用时间戳+随机数)
- name: 任务名称
- dueDate: 截止日期 (YYYY-MM-DD)
- time: 具体时间 (HH:mm)
- priority: "高"|"中"|"低"
- estimatedHours: 预计耗时(数字)
- dependsOn: 前置任务ID数组 (如无则为空数组)
- completed: false
请严格输出JSON数组格式，不要包含额外解释。`
}

// 导出数据
const exportData = () => {
  const data = {
    prompt: systemPrompt.value,
    tasks: tasks.value,
    flowElements: flowElements.value
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `task-workshop-${new Date().toISOString().slice(0,10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// 导入数据
const importData = (e) => {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    try {
      const imported = JSON.parse(ev.target.result)
      if (imported.prompt) systemPrompt.value = imported.prompt
      if (imported.tasks) tasks.value = imported.tasks
      if (imported.flowElements) flowElements.value = imported.flowElements
      else syncTasksToFlow()
    } catch (err) {
      alert('文件格式错误')
    }
  }
  reader.readAsText(file)
}

// 编辑任务
const editTask = (task) => {
  editingTask.value = { 
    ...task, 
    dependsOnInput: (task.dependsOn || []).join(', ') 
  }
}
const closeEdit = () => { editingTask.value = null }
const saveEdit = () => {
  if (!editingTask.value) return
  const idx = tasks.value.findIndex(t => t.id === editingTask.value.id)
  if (idx !== -1) {
    const dependsArray = editingTask.value.dependsOnInput.split(',').map(s => s.trim()).filter(s => s)
    tasks.value[idx] = { ...editingTask.value, dependsOn: dependsArray }
    delete tasks.value[idx].dependsOnInput
  }
  closeEdit()
  syncTasksToFlow()
}

const deleteTask = (id) => {
  tasks.value = tasks.value.filter(t => t.id !== id)
  syncTasksToFlow()
}

const toggleComplete = (task) => {
  task.completed = !task.completed
  syncTasksToFlow()
}

// ---------- 流程图相关 ----------
const syncTasksToFlow = () => {
  const nodes = tasks.value.map((task, index) => ({
    id: task.id,
    type: 'custom',
    position: { x: (index % 4) * 220 + 50, y: Math.floor(index / 4) * 120 + 50 },
    data: { 
      label: task.name, 
      priority: task.priority, 
      completed: task.completed,
      id: task.id 
    },
    style: { width: 180, padding: '10px', borderRadius: '12px' }
  }))
  
  const edges = []
  tasks.value.forEach(task => {
    if (task.dependsOn && Array.isArray(task.dependsOn)) {
      task.dependsOn.forEach(depId => {
        if (tasks.value.some(t => t.id === depId)) {
          edges.push({
            id: `e-${depId}-${task.id}`,
            source: depId,
            target: task.id,
            animated: true,
            style: { stroke: '#3b82f6' }
          })
        }
      })
    }
  })
  
  flowElements.value = [...nodes, ...edges]
  setTimeout(() => fitView(), 50)
}

const addNodeToFlow = () => {
  const newId = `node_${Date.now()}`
  const newNode = {
    id: newId,
    type: 'custom',
    position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
    data: { label: '新任务', priority: '中', completed: false, id: newId }
  }
  flowElements.value.push(newNode)
  // 同时加入任务列表
  tasks.value.push({
    id: newId,
    name: '新任务',
    dueDate: new Date().toISOString().slice(0,10),
    time: '12:00',
    priority: '中',
    estimatedHours: 1,
    dependsOn: [],
    completed: false
  })
}

const clearFlow = () => {
  flowElements.value = []
}

const onNodeClick = ({ node }) => {
  // 可标记完成或编辑
  const task = tasks.value.find(t => t.id === node.id)
  if (task) {
    task.completed = !task.completed
    node.data.completed = task.completed
  }
}

const onEdgeClick = ({ edge }) => {
  // 简单删除边
  flowElements.value = flowElements.value.filter(el => el.id !== edge.id)
}

const applyPromptToFlow = () => {
  // 触发提示词应用，实际上我们模拟生成预览
  simulateAIGenerate()
  if (generatedJsonPreview.value) {
    applyIncrementalUpdate()
  }
}

// 初始化示例任务
onMounted(() => {
  if (tasks.value.length === 0) {
    tasks.value = [
      { id: 't1', name: '需求分析', dueDate: '2026-04-20', time: '10:00', priority: '高', estimatedHours: 3, dependsOn: [], completed: false },
      { id: 't2', name: '原型设计', dueDate: '2026-04-21', time: '14:00', priority: '高', estimatedHours: 4, dependsOn: ['t1'], completed: false },
      { id: 't3', name: '开发环境搭建', dueDate: '2026-04-19', time: '09:00', priority: '中', estimatedHours: 2, dependsOn: [], completed: true },
      { id: 't4', name: '接口联调', dueDate: '2026-04-23', time: '16:00', priority: '中', estimatedHours: 5, dependsOn: ['t2'], completed: false }
    ]
    syncTasksToFlow()
  }
})
</script>

<style scoped>
/* 整体卡片风格，继承原项目可能的清爽风格 */
.task-workshop {
  font-family: 'Inter', system-ui, sans-serif;
  background: #f9fbfd;
  border-radius: 24px;
  padding: 24px;
  min-height: 90vh;
}

.workshop-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  flex-wrap: wrap;
}
.title-section {
  display: flex;
  align-items: center;
  gap: 12px;
}
.title-section i {
  font-size: 28px;
  color: #2563eb;
}
h1 {
  font-size: 1.8rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}
.badge {
  background: #e0f2fe;
  color: #0369a1;
  padding: 4px 12px;
  border-radius: 40px;
  font-size: 0.8rem;
}
.action-bar {
  display: flex;
  gap: 10px;
}
.btn {
  padding: 10px 18px;
  border-radius: 36px;
  border: none;
  background: white;
  box-shadow: 0 2px 6px rgba(0,0,0,0.03);
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #e2e8f0;
  transition: all 0.15s;
}
.btn-primary {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
}
.btn-outline {
  background: white;
}
.btn-secondary {
  background: #f1f5f9;
}
.btn-sm {
  padding: 6px 12px;
  font-size: 0.85rem;
  border-radius: 20px;
  background: white;
  border: 1px solid #cbd5e1;
}
.icon-btn {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
}
.main-layout {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 24px;
}
.left-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
  border: 1px solid #eef2f6;
}
.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #1e293b;
}
.prompt-textarea, .voice-textarea {
  width: 100%;
  border: 1px solid #d1d9e6;
  border-radius: 16px;
  padding: 14px;
  font-size: 0.95rem;
  background: #fafcff;
  resize: vertical;
}
.button-group {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}
.json-preview {
  margin-top: 16px;
  background: #1e293b;
  border-radius: 14px;
  padding: 12px;
}
.json-preview pre {
  color: #e2e8f0;
  font-size: 0.8rem;
  overflow-x: auto;
}
.preview-header {
  display: flex;
  justify-content: space-between;
  color: #94a3b8;
  margin-bottom: 8px;
}

/* 时间轴 */
.timeline-container {
  max-height: 400px;
  overflow-y: auto;
  padding-right: 4px;
}
.timeline-item {
  display: flex;
  gap: 12px;
  margin-bottom: 18px;
}
.timeline-badge {
  min-width: 80px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
.date-badge {
  background: #eef2ff;
  padding: 6px 10px;
  border-radius: 24px;
  font-weight: 500;
  font-size: 0.85rem;
}
.priority-tag {
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 20px;
  margin-top: 4px;
}
.priority-tag.高 { background: #fee2e2; color: #b91c1c; }
.priority-tag.中 { background: #fef9c3; color: #854d0e; }
.priority-tag.低 { background: #dcfce7; color: #166534; }

.task-card {
  background: #f8fafc;
  border-radius: 16px;
  padding: 14px 16px;
  flex: 1;
  border-left: 4px solid #94a3b8;
  transition: 0.1s;
}
.task-header {
  display: flex;
  justify-content: space-between;
  font-weight: 600;
}
.task-meta {
  display: flex;
  gap: 16px;
  margin-top: 6px;
  font-size: 0.8rem;
  color: #475569;
}
.task-actions i {
  margin-left: 12px;
  color: #64748b;
  cursor: pointer;
}
.task-actions i.completed { color: #16a34a; }

/* 右侧流程图 */
.right-column {
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 20px;
  border: 1px solid #eef2f6;
  overflow: hidden;
}
.flow-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
}
.vue-flow-wrapper {
  flex: 1;
  height: 500px;
  background: #fdfdfe;
}
.flow-footer {
  padding: 10px 20px;
  border-top: 1px solid #e2e8f0;
  color: #64748b;
}

/* 模态框 */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-card {
  background: white;
  padding: 28px;
  border-radius: 28px;
  width: 400px;
}
.form-group {
  margin-bottom: 16px;
}
.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
}
.form-group input, .form-group select {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 20px;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 流程图节点样式 (全局) */
:deep(.vue-flow__node-custom) {
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 16px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.04);
}
:deep(.vue-flow__node-custom.completed) {
  background: #dcfce7;
  border-color: #86efac;
}
.flow-node {
  padding: 8px 12px;
}
.node-name { font-weight: 600; }
.node-priority { font-size: 0.7rem; }
.node-check { color: #16a34a; margin-top: 4px; }
</style>