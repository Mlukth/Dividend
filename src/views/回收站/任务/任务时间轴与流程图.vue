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
                <el-dropdown-item command="import-project">
                  <el-icon><Upload /></el-icon> 导入项目
                </el-dropdown-item>
                <el-dropdown-item command="export-project">
                  <el-icon><Download /></el-icon> 导出项目
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
          <el-button v-if="lastImportBackup" type="warning" @click="undoImport">
            <el-icon><RefreshLeft /></el-icon> 撤回导入
          </el-button>
        </div>
        <div class="task-stats">
          <span>当前任务总数：{{ tasks.length }} 个</span>
          <el-button
            type="danger"
            size="small"
            :disabled="!hasCompletedTasks"
            @click="deleteAllCompletedTasks"
            class="delete-completed-btn"
          >
            <el-icon><Delete /></el-icon> 删除已完成任务
          </el-button>
        </div>
      </div>
    </div>

    <!-- ==================== 右侧视图区 ==================== -->
    <div class="right-panel">
      <!-- 担忧折叠面板 -->
      <el-collapse v-model="worryCollapseActive" class="worry-collapse">
        <el-collapse-item title="担忧事项" name="worry">
          <template #title>
            <div class="worry-collapse-title">
              <el-icon><WarningFilled /></el-icon>
              <span>担忧事项（{{ worries.length }}）</span>
            </div>
          </template>
          <div class="worry-panel">
            <div class="worry-input-row">
              <el-input v-model="newWorry.title" placeholder="担忧标题" size="small" class="worry-title-input" />
              <el-input v-model="newWorry.desc" placeholder="描述（可选）" size="small" class="worry-desc-input" />
              <el-button type="primary" size="small" @click="addWorry">添加</el-button>
            </div>
            <div v-if="worries.length === 0" class="empty-worry">
              <span>暂无担忧记录</span>
            </div>
            <div v-for="(item, index) in worries" :key="index" class="worry-card">
              <div class="worry-card-header">
                <h4>{{ item.title }}</h4>
                <el-button link type="danger" @click="removeWorry(index)">删除</el-button>
              </div>
              <p v-if="item.desc" class="worry-desc">{{ item.desc }}</p>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>

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
        <el-radio-group
          v-if="currentView === 'timeline'"
          v-model="groupMode"
          size="small"
          style="margin-left: 20px;"
        >
          <el-radio-button value="date">按日期</el-radio-button>
          <el-radio-button value="similarity">按相似度</el-radio-button>
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
                <!-- 决策树进度条 -->
                <div v-if="task.decisionTree && task.decisionTree.length > 0" class="tree-progress">
                  <el-progress
                    :percentage="calcTreeProgress(task.decisionTree)"
                    :stroke-width="6"
                    :show-text="true"
                    :color="progressColor(task.decisionTree)"
                  >
                    <span class="progress-text">{{ Math.round(calcTreeProgress(task.decisionTree)) }}%</span>
                  </el-progress>
                </div>
                <div class="card-actions">
                  <el-button link type="primary" @click="openDecisionTree(task)">🌳 决策树</el-button>
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
            <el-button size="small" @click="mainFitView">
              <el-icon><FullScreen /></el-icon> 自适应
            </el-button>
            <el-button size="small" @click="mainZoomIn">
              <el-icon><ZoomIn /></el-icon>
            </el-button>
            <el-button size="small" @click="mainZoomOut">
              <el-icon><ZoomOut /></el-icon>
            </el-button>
          </el-button-group>
        </div>
        <div ref="flowContainer" class="flow-canvas">
          <VueFlow
            id="main-flow"
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

    <!-- ==================== 决策树弹窗 ==================== -->
    <el-dialog
      v-model="decisionTreeDialogVisible"
      :title="`${currentDecisionTask?.taskName} - 决策树`"
      fullscreen
      destroy-on-close
    >
      <div class="tree-toolbar">
        <div class="tree-toolbar-left">
          <el-button type="primary" @click="addRootNodeIfEmpty">+ 添加根节点</el-button>
          <el-button @click="showAiImportPanel = !showAiImportPanel">
            🤖 AI 生成决策树
          </el-button>
          <el-button @click="fitTreeView">📷 自适应</el-button>
        </div>
        <div class="tree-progress-header">
          整体进度：
          <el-progress
            :percentage="currentTreeProgress"
            :stroke-width="8"
            style="width: 200px; display: inline-block; vertical-align: middle"
            :color="currentTreeProgress === 100 ? '#67C23A' : '#409EFF'"
          />
        </div>
      </div>

      <div v-if="showAiImportPanel" class="ai-import-panel">
        <el-alert type="info" :closable="false" show-icon>
          <template #title>
            输入你对任务执行过程的描述，点击“生成提示词”复制到剪贴板，粘贴至 AI 对话窗口。
            将返回的 JSON 粘贴到下方即可导入决策树。
          </template>
        </el-alert>
        <el-input
          v-model="treeDescription"
          type="textarea"
          :rows="4"
          placeholder="例如：先检查组件依赖，如果通过则升级组件，否则回退并修复依赖；最后进行测试验收。"
          class="tree-desc-input"
        />
        <div class="ai-action-row">
          <el-button type="primary" @click="copyTreePrompt">复制生成提示词</el-button>
          <el-button @click="importTreeFromJson">导入下方 JSON</el-button>
        </div>
        <el-input
          v-model="treeImportJson"
          type="textarea"
          :rows="6"
          placeholder="粘贴 AI 返回的 JSON 数组"
          class="json-textarea"
        />
      </div>

      <div class="decision-tree-container" v-if="currentDecisionTask">
        <div v-if="!currentDecisionTask.decisionTree || currentDecisionTask.decisionTree.length === 0" class="tree-empty">
          <el-empty description="尚无决策节点，请添加根节点或使用 AI 生成" />
        </div>
        <div v-else class="tree-view">
          <VueFlow
            id="tree-flow"
            :nodes="treeFlowNodes"
            :edges="treeFlowEdges"
            :default-viewport="{ zoom: 1.2 }"
            :snap-to-grid="true"
            :snap-grid="[20, 20]"
            @nodes-change="onTreeNodesChange"
            @edges-change="onTreeEdgesChange"
          >
            <template #node-tree-node="{ data }">
              <div
                class="tree-flow-node"
                :class="{ completed: data.completed }"
              >
                <div class="tree-node-header">
                  <el-checkbox
                    :model-value="data.completed"
                    @change="(val) => toggleNodeComplete(data.id, val)"
                  >
                    {{ data.completed ? '✓' : '○' }}
                  </el-checkbox>
                </div>
                <div class="tree-node-title" @dblclick="editTreeNodeLabel(data.id)">
                  {{ data.label }}
                </div>
                <div class="tree-node-actions">
                  <el-button link size="small" @click="editTreeNodeLabel(data.id)">✏️</el-button>
                  <el-button link size="small" @click="addChildNode(data.id)">➕</el-button>
                  <el-button link size="small" @click="deleteNode(data.id)">🗑️</el-button>
                </div>
              </div>
            </template>
            <template #edge-label="{ data }">
              <div class="tree-edge-label" v-if="data.condition">
                {{ data.condition }}
              </div>
            </template>
          </VueFlow>
        </div>
      </div>

      <template #footer>
        <el-button @click="decisionTreeDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- ==================== 提示词编辑对话框 ==================== -->
    <el-dialog v-model="showPromptDialog" title="提示词配置" width="700px">
      <el-form :model="promptConfig" label-width="100px">
        <el-form-item label="任务解析提示词">
          <el-input
            v-model="promptConfig.taskPrompt"
            type="textarea"
            :rows="12"
          />
        </el-form-item>
        <el-form-item label="决策树生成提示词">
          <el-input
            v-model="promptConfig.treePromptTemplate"
            type="textarea"
            :rows="8"
          />
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
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Clock, Connection, Edit, Download, Upload, Link,
  FullScreen, ZoomIn, ZoomOut, Microphone, CopyDocument,
  FolderOpened, DocumentAdd, UploadFilled, Delete, RefreshLeft, WarningFilled
} from '@element-plus/icons-vue'

// ============== 内置提示词常量 ==============
const DEFAULT_TASK_PROMPT = `你是一个任务拆解与决策树生成助手。用户会输入一段需求描述，请提取任务信息并输出JSON数组。

每个任务对象包含：
- taskName: 任务名称（必填）
- taskDate: 预计完成日期，格式YYYY-MM-DD（必填，若未给出则默认为调用当天）
- priority: 优先级 high/medium/low（必填）
- dependencies: 前置任务名数组（可选，只能引用已存在的任务名）
- estimatedHours: 预计耗时小时数（必填）
- description: 任务详细描述（可选，保留用户原意）
- tags: 标签数组（可选）
- decisionTree: 该任务的决策树数组（必填，无决策分支时为空数组 []）

decisionTree 节点结构：
{
  "id": "自动生成的唯一字符串",
  "parentId": "父节点id，根节点为null",
  "text": "节点描述",
  "completed": false,
  "branchCondition": "若为分支子节点，填写该分支的条件文本；否则可为空字符串"
}

【任务拆解规则】
1. 若用户已明确声明分块（如“已经区分好任务卡片，别给我乱拆”或使用编号列表分块），则严格按照用户的分块生成任务，一块只对应一个任务，不得拆分或合并。
2. 若无明确分块，则自行提炼合理粒度的任务，注意保持依赖关系正确。

【决策树生成规则（核心）】
对于每个任务，请分析其描述（以及用户在输入中与该任务相关的上下文）：
- 如果描述中包含明显的决策流程特征，例如：
    * 条件判断（如果…则…、是否、判断、检查…后决定）
    * 步骤序列中含有分支点（先做A，然后根据结果选择B或C）
    * 多条并行路径最终汇合（同时进行…，都完成后进入下一步）
    * 带有回退/重试的描述（失败则回到某步）
  则必须生成对应的决策树，放在该任务的 decisionTree 字段中。
- 如果描述仅包含线性操作、开发清单、配置说明等，无明显决策分支，则 decisionTree 置为空数组 []。

生成决策树时：
- 根节点表示任务起点或总览，parentId 为 null。
- 分支条件写在子节点的 branchCondition 中，清晰简洁。
- 若存在回退，在相应节点 text 中写明“失败则回退至XX”。
- 节点总数不超过20个，层次清晰。

【输出要求】
- 只输出 JSON 数组，不要任何解释、注释或代码块。
- 确保 tree 中无循环依赖。
- 多个任务之间 decisionTree 独立生成，互不影响。`;

const DEFAULT_TREE_PROMPT = `你是一个决策树生成助手。用户会描述一个任务的执行过程，请分析其中的步骤、分支、回退等，生成一个决策树JSON数组。
每个节点包含字段：
- id: 唯一字符串（自动生成）
- parentId: 父节点id，根节点为null
- text: 节点描述文本
- completed: false
- branchCondition: 如果有分支，填写该分支的条件文本；非分支节点可为空字符串

规则：
1. 只输出 JSON 数组，不要其他内容。
2. 确保树结构完整，根节点 parentId 必须为 null。
3. 分支条件写在子节点的 branchCondition 中，例如：父节点“检查条件”，子节点分别为{ text: "执行A", branchCondition: "条件满足" }和{ text: "执行B", branchCondition: "条件不满足" }。
4. 对于失败回退，可以创建指向先序节点的引用？但为了简单，我们只生成树状分支，不包含回退边。请在节点描述中写明“如果失败则回退至XX”作为文本。
5. 尽量保持简洁，节点数不超过20个。`;

// ============== 主流程 Vue Flow 实例 ==============
const {
  fitView: mainFitView,
  zoomIn: mainZoomIn,
  zoomOut: mainZoomOut,
  onConnect,
  onNodesChange,
  onEdgesChange,
  project
} = useVueFlow('main-flow')

// ============== 响应式状态 ==============
const currentView = ref('timeline')
const groupMode = ref('date')
const tasks = ref([])
const editDialogVisible = ref(false)
const showPromptDialog = ref(false)
const editingTask = ref({})
const flowContainer = ref(null)
const fileInput = ref(null)

const userRequirement = ref('')
const taskImportJson = ref('')
const lastImportBackup = ref(null)   // 导入前备份

// 担忧相关
const worryCollapseActive = ref([])
const worries = ref([])
const newWorry = ref({ title: '', desc: '' })

// 决策树弹窗相关
const decisionTreeDialogVisible = ref(false)
const currentDecisionTask = ref(null)
const showAiImportPanel = ref(false)
const treeDescription = ref('')
const treeImportJson = ref('')

// 提示词配置（初始为内置常量）
const promptConfig = ref({
  taskPrompt: DEFAULT_TASK_PROMPT,
  treePromptTemplate: DEFAULT_TREE_PROMPT
})

// ============== 持久化与恢复 ==============
onMounted(() => {
  const savedTasks = localStorage.getItem('taskManager_tasks')
  const savedPrompt = localStorage.getItem('taskManager_prompt')
  const savedWorries = localStorage.getItem('taskManager_worries')

  if (savedTasks) {
    try { tasks.value = JSON.parse(savedTasks) } catch (e) {}
  }
  if (savedPrompt) {
    try {
      const parsed = JSON.parse(savedPrompt)
      if (parsed.taskPrompt) promptConfig.value.taskPrompt = parsed.taskPrompt
      if (parsed.treePromptTemplate) promptConfig.value.treePromptTemplate = parsed.treePromptTemplate
    } catch (e) {}
  }
  if (savedWorries) {
    try { worries.value = JSON.parse(savedWorries) } catch (e) {}
  }
  syncFlowData()
})

const saveTasks = () => {
  localStorage.setItem('taskManager_tasks', JSON.stringify(tasks.value))
  syncFlowData()
}
const saveWorries = () => {
  localStorage.setItem('taskManager_worries', JSON.stringify(worries.value))
}
const savePromptToLocal = () => {
  localStorage.setItem('taskManager_prompt', JSON.stringify(promptConfig.value))
}

// ============== 担忧操作 ==============
const addWorry = () => {
  const title = newWorry.value.title.trim()
  if (!title) {
    ElMessage.warning('请输入担忧标题')
    return
  }
  worries.value.push({ title, desc: newWorry.value.desc.trim() })
  newWorry.value = { title: '', desc: '' }
  saveWorries()
  if (!worryCollapseActive.value.includes('worry')) {
    worryCollapseActive.value.push('worry')
  }
}
const removeWorry = (index) => {
  worries.value.splice(index, 1)
  saveWorries()
}

// ============== 撤回导入 ==============
const backupCurrentTasks = () => {
  lastImportBackup.value = JSON.parse(JSON.stringify(tasks.value))
}
const undoImport = () => {
  if (!lastImportBackup.value) return
  tasks.value = lastImportBackup.value
  lastImportBackup.value = null
  saveTasks()
  ElMessage.success('已撤回到导入前状态')
}

// ============== 智能导入任务 ==============
const handleSmartImport = () => {
  const raw = taskImportJson.value.trim()
  if (!raw) {
    ElMessage.warning('请先粘贴 JSON 数据')
    return
  }
  try {
    let parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) parsed = [parsed]

    backupCurrentTasks()

    const newTasks = parsed.map(t => ({
      id: generateId(),
      taskName: t.taskName || '未命名任务',
      taskDate: t.taskDate || '',
      priority: t.priority || 'medium',
      dependencies: t.dependencies || [],
      estimatedHours: t.estimatedHours || 1,
      description: t.description || '',
      tags: t.tags || [],
      completed: false,
      decisionTree: t.decisionTree || []
    }))

    tasks.value = [...tasks.value, ...newTasks]
    saveTasks()
    ElMessage.success(`✅ 成功导入 ${newTasks.length} 个任务`)
  } catch (e) {
    ElMessage.error('JSON 格式错误：' + e.message)
  }
}

// ============== 文件操作（导入/导出项目） ==============
const handleFileCommand = (command) => {
  if (command === 'import-project') {
    fileInput.value.click()
    fileInput.value.dataset.importType = 'project'
  } else if (command === 'export-project') {
    exportProject()
  }
}

const handleFileImport = (event) => {
  const file = event.target.files[0]
  if (!file) return
  const importType = event.target.dataset.importType || 'tasks'

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result)
      if (importType === 'project' && data.tasks && data.promptConfig) {
        backupCurrentTasks()
        tasks.value = data.tasks.map(t => ({ ...t, id: t.id || generateId() }))
        promptConfig.value = data.promptConfig
        saveTasks()
        savePromptToLocal()
        ElMessage.success('项目已导入，包含任务和提示词')
      } else {
        backupCurrentTasks()
        const newTasks = (Array.isArray(data) ? data : [data]).map(t => ({
          id: generateId(),
          taskName: t.taskName || '未命名任务',
          taskDate: t.taskDate || '',
          priority: t.priority || 'medium',
          dependencies: t.dependencies || [],
          estimatedHours: t.estimatedHours || 1,
          description: t.description || '',
          tags: t.tags || [],
          completed: t.completed || false,
          decisionTree: t.decisionTree || []
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
  delete event.target.dataset.importType
}

const generateId = () => `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

const exportProject = () => {
  const projectData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    tasks: tasks.value,
    promptConfig: promptConfig.value,
    worries: worries.value
  }
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  const timestamp = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`
  const filename = `任务时间轴与流程图_${timestamp}.json`

  const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
  ElMessage.success(`项目已导出：${filename}`)
}

// ============== 提示词操作 ==============
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
    ElMessage.success('✅ 完整提示词已复制到剪贴板！')
  } catch {
    ElMessage.error('复制失败，请手动复制')
  }
}

const savePromptConfig = () => {
  savePromptToLocal()
  showPromptDialog.value = false
  ElMessage.success('提示词配置已保存')
}

// ============== 任务增删改 ==============
const hasCompletedTasks = computed(() => tasks.value.some(t => t.completed))

const deleteAllCompletedTasks = async () => {
  try {
    await ElMessageBox.confirm('确定要删除所有已完成的任务吗？此操作不可恢复。', '警告', {
      confirmButtonText: '确认删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    })
    tasks.value = tasks.value.filter(t => !t.completed)
    saveTasks()
    ElMessage.success('已删除所有已完成任务')
  } catch {}
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
    saveTasks()
    ElMessage.success('任务已删除')
  }).catch(() => {})
}

// ============== 时间轴 / 流程图数据 ==============
function textSimilarity(a, b) {
  const bigrams = (str) => {
    const chars = str.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '').split('')
    const grams = new Set()
    for (let i = 0; i < chars.length - 1; i++) {
      grams.add(chars[i] + chars[i + 1])
    }
    return grams
  }
  const setA = bigrams(a)
  const setB = bigrams(b)
  if (setA.size === 0 && setB.size === 0) return 1
  if (setA.size === 0 || setB.size === 0) return 0
  let intersection = 0
  for (const gram of setA) {
    if (setB.has(gram)) intersection++
  }
  const union = setA.size + setB.size - intersection
  return intersection / union
}

function groupBySimilarity(tasks, threshold = 0.4) {
  if (tasks.length === 0) return []
  const groups = []
  const visited = new Set()
  const adjacency = {}
  tasks.forEach(t => { adjacency[t.id] = [] })
  for (let i = 0; i < tasks.length; i++) {
    for (let j = i + 1; j < tasks.length; j++) {
      const sim = textSimilarity(
        tasks[i].taskName + ' ' + (tasks[i].description || ''),
        tasks[j].taskName + ' ' + (tasks[j].description || '')
      )
      if (sim >= threshold) {
        adjacency[tasks[i].id].push(tasks[j].id)
        adjacency[tasks[j].id].push(tasks[i].id)
      }
    }
  }
  function dfs(id, currentGroup) {
    visited.add(id)
    currentGroup.push(tasks.find(t => t.id === id))
    for (const neighbor of adjacency[id]) {
      if (!visited.has(neighbor)) dfs(neighbor, currentGroup)
    }
  }
  for (const task of tasks) {
    if (!visited.has(task.id)) {
      const group = []
      dfs(task.id, group)
      groups.push(group)
    }
  }
  return groups
}

const timelineData = computed(() => {
  if (groupMode.value === 'similarity') {
    const groups = groupBySimilarity(tasks.value)
    return groups.map((group, index) => {
      const mainTask = group[0]
      const groupName = group.length === 1
        ? mainTask.taskName
        : `相似任务组 ${index + 1}（${group.length}个任务）`
      return { date: groupName, tasks: group }
    })
  }
  const grouped = {}
  tasks.value.forEach(task => {
    const date = task.taskDate || '未设置'
    if (!grouped[date]) grouped[date] = { date, tasks: [] }
    grouped[date].tasks.push(task)
  })
  return Object.values(grouped).sort((a, b) => {
    if (a.date === '未设置') return 1
    if (b.date === '未设置') return -1
    return new Date(a.date) - new Date(b.date)
  })
})

const flowNodes = ref([])
const flowEdges = ref([])

const syncFlowData = () => {
  const existingNodeIds = new Set(flowNodes.value.map(n => n.id))
  tasks.value.forEach((task, index) => {
    if (!existingNodeIds.has(task.id)) {
      const node = {
        id: task.id,
        type: 'custom',
        position: { x: (index % 4) * 250, y: Math.floor(index / 4) * 120 },
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

watch(tasks, saveTasks, { deep: true })

const updateTaskComplete = (taskId, completed) => {
  const task = tasks.value.find(t => t.id === taskId)
  if (task) {
    task.completed = completed
    saveTasks()
  }
}

const handleNodeClick = (event) => {
  console.log('Node clicked:', event.node.data)
}
const handleEdgeClick = (event) => {
  console.log('Edge clicked:', event.edge)
}

// ============== 决策树逻辑（独立流程图） ==============
const treeFlowNodes = ref([])
const treeFlowEdges = ref([])

const calcTreeProgress = (nodes) => {
  if (!nodes || nodes.length === 0) return 0
  const completed = nodes.filter(n => n.completed).length
  return Math.round((completed / nodes.length) * 100)
}
const progressColor = (nodes) => {
  const pct = calcTreeProgress(nodes)
  return pct === 100 ? '#67C23A' : '#409EFF'
}

const currentTreeProgress = computed(() => {
  const tree = currentDecisionTask.value?.decisionTree
  if (!tree || tree.length === 0) return 0
  return calcTreeProgress(tree)
})

const calculateTreeLayout = (nodes) => {
  if (!nodes || nodes.length === 0) return {}
  const childrenMap = {}
  const nodeMap = {}
  nodes.forEach(n => {
    nodeMap[n.id] = n
    if (!childrenMap[n.parentId]) childrenMap[n.parentId] = []
    childrenMap[n.parentId].push(n)
  })
  const rootNodes = nodes.filter(n => n.parentId === null || !nodeMap[n.parentId])
  const levels = {}
  const queue = rootNodes.map(n => ({ id: n.id, depth: 0 }))
  while (queue.length) {
    const { id, depth } = queue.shift()
    levels[id] = depth
    const children = childrenMap[id] || []
    children.forEach(child => queue.push({ id: child.id, depth: depth + 1 }))
  }
  const levelGroups = {}
  for (const [id, depth] of Object.entries(levels)) {
    if (!levelGroups[depth]) levelGroups[depth] = []
    levelGroups[depth].push(id)
  }
  const positions = {}
  const verticalSpacing = 150
  const horizontalSpacing = 220
  for (const depth of Object.keys(levelGroups).sort((a, b) => a - b)) {
    const ids = levelGroups[depth]
    ids.sort((a, b) => {
      const parentA = nodeMap[a]?.parentId
      const parentB = nodeMap[b]?.parentId
      if (parentA === parentB) {
        const siblings = nodes.filter(n => n.parentId === parentA)
        return siblings.findIndex(n => n.id === a) - siblings.findIndex(n => n.id === b)
      }
      return 0
    })
    const totalWidth = ids.length * horizontalSpacing
    const startX = -totalWidth / 2 + horizontalSpacing / 2
    ids.forEach((id, index) => {
      positions[id] = {
        x: startX + index * horizontalSpacing,
        y: depth * verticalSpacing + 50
      }
    })
  }
  return positions
}

const rebuildTreeFlow = () => {
  const tree = currentDecisionTask.value?.decisionTree
  if (!tree || tree.length === 0) {
    treeFlowNodes.value = []
    treeFlowEdges.value = []
    return
  }
  const positions = calculateTreeLayout(tree)
  treeFlowNodes.value = tree.map(node => ({
    id: node.id,
    type: 'tree-node',
    position: positions[node.id] || { x: 0, y: 0 },
    data: {
      id: node.id,
      label: node.text,
      completed: node.completed || false
    }
  }))
  treeFlowEdges.value = tree
    .filter(node => node.parentId)
    .map(node => ({
      id: `${node.parentId}-${node.id}`,
      source: node.parentId,
      target: node.id,
      type: 'smoothstep',
      animated: !node.completed,
      style: { stroke: node.completed ? '#67C23A' : '#409EFF' },
      data: { condition: node.branchCondition || '' },
      label: node.branchCondition || '',
      labelStyle: {
        fill: '#475569',
        fontWeight: 500,
        fontSize: 12,
        background: '#fff',
        padding: '2px 6px',
        borderRadius: '4px',
        border: '1px solid #e2e8f0'
      }
    }))
}

const openDecisionTree = (task) => {
  currentDecisionTask.value = task
  if (!task.decisionTree) {
    task.decisionTree = []
  }
  decisionTreeDialogVisible.value = true
  showAiImportPanel.value = false
  treeDescription.value = ''
  treeImportJson.value = ''
  nextTick(() => {
    rebuildTreeFlow()
  })
}

const fitTreeView = () => {
  rebuildTreeFlow()
}

const addRootNodeIfEmpty = () => {
  const tree = currentDecisionTask.value?.decisionTree
  if (!tree) return
  const hasRoot = tree.some(n => n.parentId === null)
  if (!hasRoot) {
    const newRoot = {
      id: `dt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      parentId: null,
      text: '新根节点',
      completed: false,
      branchCondition: ''
    }
    tree.push(newRoot)
    saveTasks()
    rebuildTreeFlow()
  } else {
    ElMessage.warning('根节点已存在')
  }
}

const updateNode = (updatedNode) => {
  const tree = currentDecisionTask.value?.decisionTree
  if (!tree) return
  const idx = tree.findIndex(n => n.id === updatedNode.id)
  if (idx !== -1) {
    tree[idx] = updatedNode
    saveTasks()
    rebuildTreeFlow()
  }
}

const deleteNode = (nodeId) => {
  const tree = currentDecisionTask.value?.decisionTree
  if (!tree) return
  const getChildrenIds = (parentId) => {
    const ids = []
    const children = tree.filter(n => n.parentId === parentId)
    children.forEach(child => {
      ids.push(child.id)
      ids.push(...getChildrenIds(child.id))
    })
    return ids
  }
  const idsToDelete = [nodeId, ...getChildrenIds(nodeId)]
  currentDecisionTask.value.decisionTree = tree.filter(n => !idsToDelete.includes(n.id))
  saveTasks()
  rebuildTreeFlow()
}

const addChildNode = (parentId) => {
  const tree = currentDecisionTask.value?.decisionTree
  if (!tree) return
  const newNode = {
    id: `dt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    parentId: parentId,
    text: '新步骤',
    completed: false,
    branchCondition: ''
  }
  tree.push(newNode)
  saveTasks()
  rebuildTreeFlow()
}

const toggleNodeComplete = (nodeId, completed) => {
  const tree = currentDecisionTask.value?.decisionTree
  if (!tree) return
  const node = tree.find(n => n.id === nodeId)
  if (node) {
    node.completed = completed
    saveTasks()
    rebuildTreeFlow()
  }
}

const editTreeNodeLabel = (nodeId) => {
  const node = currentDecisionTask.value.decisionTree.find(n => n.id === nodeId)
  if (!node) return
  ElMessageBox.prompt('修改节点名称', '编辑', {
    inputValue: node.text
  }).then(({ value }) => {
    if (value && value.trim()) {
      updateNode({ ...node, text: value.trim() })
    }
  }).catch(() => {})
}

const onTreeNodesChange = (changes) => {}
const onTreeEdgesChange = (changes) => {}

const copyTreePrompt = async () => {
  const desc = treeDescription.value.trim()
  if (!desc) {
    ElMessage.warning('请输入流程描述')
    return
  }
  const full = `${promptConfig.value.treePromptTemplate}\n\n用户描述：\n${desc}\n\n请生成决策树 JSON。`
  try {
    await navigator.clipboard.writeText(full)
    ElMessage.success('✅ 决策树提示词已复制，请粘贴到 AI 对话窗口')
  } catch {
    ElMessage.error('复制失败，请手动复制')
  }
}

const importTreeFromJson = () => {
  const raw = treeImportJson.value.trim()
  if (!raw) {
    ElMessage.warning('请先粘贴决策树 JSON 数组')
    return
  }
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) throw new Error('JSON 必须是数组')
    const valid = parsed.every(n => n.id && n.text && (n.parentId !== undefined))
    if (!valid) throw new Error('节点字段不完整')
    currentDecisionTask.value.decisionTree = parsed
    saveTasks()
    rebuildTreeFlow()
    ElMessage.success(`决策树导入成功，共 ${parsed.length} 个节点`)
    treeImportJson.value = ''
    showAiImportPanel.value = false
  } catch (e) {
    ElMessage.error('决策树 JSON 解析失败：' + e.message)
  }
}

// ============== 辅助方法 ==============
const formatDate = (dateStr) => {
  if (dateStr === '未设置' || dateStr.startsWith('相似任务组')) return dateStr
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
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
    if (task.tags) task.tags.forEach(tag => tags.add(tag))
  })
  return Array.from(tags)
})
</script>

<style scoped>
/* ========== 全局布局 ========== */
* { box-sizing: border-box; }
.app-layout { display: flex; flex-direction: row; height: 100vh; width: 100%; margin: 0; padding: 0; overflow: hidden; background: #f0f4f8; font-family: 'Inter', system-ui, -apple-system, sans-serif; }
.left-panel { width: 420px; flex-shrink: 0; height: 100vh; overflow-y: auto; background: #ffffff; border-right: 1px solid #e9eef4; padding: 24px 20px; box-shadow: 2px 0 12px rgba(0,0,0,0.02); }
.panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.panel-header h2 { font-size: 22px; font-weight: 700; color: #1e293b; margin: 0; }
.header-actions { display: flex; gap: 8px; }
.section-card { background: #fafcfd; border-radius: 18px; padding: 20px; margin-bottom: 24px; border: 1px solid #e2e8f0; }
.section-title { display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 600; color: #0f172a; margin-bottom: 16px; }
.custom-textarea :deep(.el-textarea__inner) { border-radius: 14px; background: #fff; border: 1px solid #cbd5e1; font-size: 14px; line-height: 1.5; }
.action-btn { width: 100%; margin-top: 16px; border-radius: 40px; padding: 12px; background: linear-gradient(135deg, #3b82f6, #2563eb); border: none; font-weight: 600; }
.hint-text { font-size: 13px; color: #64748b; margin-top: 10px; text-align: center; }
.import-section { background: #f0fdf4; border-color: #bbf7d0; }
.json-textarea :deep(.el-textarea__inner) { font-family: 'Monaco', 'Menlo', monospace; font-size: 13px; }
.import-actions { display: flex; gap: 12px; margin-top: 16px; flex-wrap: wrap; }
.import-btn { flex: 1; border-radius: 40px; background: #10b981; border: none; font-weight: 600; }
.clear-btn { border-radius: 40px; border: 1px solid #d1d5db; }
.task-stats { margin-top: 16px; font-size: 13px; color: #475569; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
.delete-completed-btn { font-size: 12px; }

/* ========== 右侧面板 ========== */
.right-panel { flex: 1; height: 100vh; display: flex; flex-direction: column; padding: 20px 28px; overflow: hidden; }
.view-tabs { flex-shrink: 0; margin-bottom: 20px; display: flex; align-items: center; }

/* ========== 担忧折叠面板 ========== */
.worry-collapse { margin-bottom: 16px; border-radius: 12px; overflow: hidden; }
.worry-collapse-title { display: flex; align-items: center; gap: 8px; font-weight: 600; }
.worry-panel { padding: 8px 0; }
.worry-input-row { display: flex; gap: 8px; margin-bottom: 12px; }
.worry-title-input { flex: 1.5; }
.worry-desc-input { flex: 2; }
.worry-card { background: #fff3e0; border-left: 4px solid #ff9800; border-radius: 8px; padding: 10px 14px; margin-bottom: 10px; }
.worry-card-header { display: flex; justify-content: space-between; align-items: center; }
.worry-card-header h4 { margin: 0; font-size: 14px; font-weight: 600; color: #1e293b; }
.worry-desc { font-size: 13px; color: #475569; margin: 6px 0 0; }
.empty-worry { text-align: center; color: #94a3b8; padding: 16px; font-size: 13px; }

/* ========== 时间轴视图 ========== */
.timeline-view { flex: 1; overflow-y: auto; padding-right: 4px; }
.timeline-scroll { width: 100%; }
.timeline-block { margin-bottom: 36px; }
.date-header { display: flex; align-items: center; gap: 12px; margin-bottom: 18px; }
.date-text { font-size: 18px; font-weight: 700; color: #1e293b; background: linear-gradient(135deg, #ffffff, #f8fafc); padding: 4px 16px; border-radius: 30px; box-shadow: 0 2px 6px rgba(0,0,0,0.02); }
.task-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }

.task-card { background: #fff; border-radius: 18px; padding: 18px; box-shadow: 0 6px 16px rgba(0,0,0,0.04); border-left: 5px solid; transition: all 0.25s ease; }
.task-card:hover { transform: translateY(-4px); box-shadow: 0 12px 28px rgba(0,82,217,0.12); }
.task-card.priority-high { border-left-color: #F53F3F; }
.task-card.priority-medium { border-left-color: #FF7D00; }
.task-card.priority-low { border-left-color: #909399; }
.task-card.completed { opacity: 0.75; background: #fafbfc; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
.task-name { font-size: 16px; font-weight: 700; color: #1D2129; margin: 0 0 12px 0; }
.task-name.line-through { text-decoration: line-through; color: #909399; }
.task-desc { font-size: 14px; color: #475569; margin: 0 0 16px 0; line-height: 1.6; }
.task-meta { display: flex; gap: 20px; margin-bottom: 16px; font-size: 13px; color: #64748b; }
.task-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
.tree-progress { margin: 12px 0; }
.tree-progress .progress-text { font-size: 12px; margin-left: 6px; }
.card-actions { display: flex; justify-content: flex-end; gap: 12px; padding-top: 16px; border-top: 1px solid #edf2f7; }
.empty-full { height: 100%; display: flex; align-items: center; justify-content: center; }

/* ========== 流程图视图 ========== */
.flowchart-view { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.flow-toolbar { flex-shrink: 0; margin-bottom: 12px; }
.flow-canvas { flex: 1; width: 100%; background: #fafcfd; border-radius: 18px; border: 1px solid #e2e8f0; overflow: hidden; }
.empty-flow { height: 100%; display: flex; align-items: center; justify-content: center; }

.flow-node { background: #fff; border-radius: 14px; padding: 14px 18px; min-width: 180px; box-shadow: 0 6px 16px rgba(0,0,0,0.06); border-left: 5px solid #909399; }
.flow-node.priority-high { border-left-color: #F53F3F; }
.flow-node.priority-medium { border-left-color: #FF7D00; }
.flow-node.priority-low { border-left-color: #909399; }
.flow-node.completed { opacity: 0.7; }
.node-header { margin-bottom: 10px; }
.node-title { font-size: 15px; font-weight: 700; color: #1D2129; margin-bottom: 10px; }
.node-meta { display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: #64748b; }

/* ========== 决策树弹窗 ========== */
.tree-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #ebeef5; }
.tree-toolbar-left { display: flex; gap: 12px; }
.ai-import-panel { background: #f0f9ff; border: 1px solid #b3d8ff; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
.tree-desc-input { margin: 16px 0; }
.ai-action-row { display: flex; gap: 12px; margin-bottom: 16px; }
.decision-tree-container { background: #fafcfd; border-radius: 12px; padding: 20px; min-height: 400px; }
.tree-empty { display: flex; justify-content: center; align-items: center; height: 300px; }
.tree-view {
  width: 100%;
  height: 70vh;
  background-color: #e5e7eb;
  background-image:
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 19px,
      rgba(180, 180, 180, 0.15) 19px,
      rgba(180, 180, 180, 0.15) 20px
    ),
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 19px,
      rgba(180, 180, 180, 0.15) 19px,
      rgba(180, 180, 180, 0.15) 20px
    );
}

.tree-flow-node {
  background: #ffffff;
  border-radius: 12px;
  padding: 10px 14px;
  min-width: 150px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  border-left: 4px solid #409EFF;
  transition: all 0.2s;
  font-size: 14px;
}
.tree-flow-node.completed { border-left-color: #67C23A; opacity: 0.8; }
.tree-node-header { margin-bottom: 6px; }
.tree-node-title { font-weight: 600; color: #1e293b; margin-bottom: 8px; cursor: pointer; }
.tree-node-actions { display: flex; gap: 2px; justify-content: flex-end; }
.tree-edge-label {
  background: #f0f9ff;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 11px;
  color: #475569;
  border: 1px solid #e2e8f0;
  white-space: nowrap;
}

:deep(.vue-flow) { background: transparent; }
:deep(.vue-flow__edge-path) { stroke-width: 2.5; }
:deep(.vue-flow__handle) { width: 10px; height: 10px; background: #165DFF; }

/* ========== 提示词弹窗 ========== */
.prompt-hint { background: #f5f9ff; padding: 18px; border-radius: 14px; border: 1px solid #e2edfb; }
.prompt-hint code { font-size: 13px; color: #1e293b; white-space: pre-wrap; }

@media screen and (max-width: 1000px) {
  .app-layout { flex-direction: column; }
  .left-panel { width: 100%; height: auto; max-height: 40vh; }
  .right-panel { height: auto; flex: 1; }
}
</style>