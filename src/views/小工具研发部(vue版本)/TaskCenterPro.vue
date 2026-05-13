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

      <!-- 通知权限 -->
      <div class="section-card">
        <el-button @click="requestNotificationPermission" :type="notificationPermission === 'granted' ? 'success' : 'primary'" size="small">
          {{ notificationPermission === 'granted' ? '✅ 通知已开启' : '🔔 开启截止提醒通知' }}
        </el-button>
        <span style="margin-left:10px;font-size:13px;color:#64748b;">需要浏览器通知权限</span>
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
                <div v-if="task.goal" class="task-goal">
                  <el-icon><Aim /></el-icon> {{ task.goal }}
                </div>
                <div class="task-meta">
                  <span><el-icon><Clock /></el-icon> {{ task.estimatedHours }}h</span>
                  <span v-if="task.dependencies?.length">
                    <el-icon><Link /></el-icon> {{ task.dependencies.length }}
                  </span>
                </div>
                <div v-if="task.expectedCompletionTime" class="task-deadline-info">
                  <span class="deadline-label">预期完成：</span>{{ task.expectedCompletionTime }}
                </div>
                <div v-if="task.tags?.length" class="task-tags">
                  <el-tag v-for="tag in task.tags" :key="tag" size="small">{{ tag }}</el-tag>
                </div>
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

      <!-- 流程图视图（替换为方案A泳道热度图） -->
      <div v-show="currentView === 'flowchart'" class="flowchart-view">
        <div class="heatmap-legend">
          <span class="legend-item"><span class="swatch" style="background:#f56c6c"></span> 已过期/今日到期</span>
          <span class="legend-item"><span class="swatch" style="background:#e6a23c"></span> 3天内</span>
          <span class="legend-item"><span class="swatch" style="background:#67c23a"></span> 7天内</span>
          <span class="legend-item"><span class="swatch" style="background:#b0c4de"></span> 更远</span>
        </div>
        <div class="heatmap-chart" v-if="tasks.length > 0">
          <div
            v-for="task in tasks"
            :key="task.id"
            class="task-row"
            :class="{ 'pulse-row': isOverdue(task) }"
            :title="`${task.taskName} · 预计 ${task.estimatedHours}h · 截止 ${task.expectedCompletionTime || '未设置'}`"
          >
            <div class="task-label">{{ task.taskName }}</div>
            <div class="task-bar-area">
              <div
                class="task-bar"
                :style="{ width: taskWidth(task), backgroundColor: urgencyColor(task) }"
              >{{ task.estimatedHours }}h</div>
              <div class="deadline-marker" :style="{ left: deadlinePos(task) }"></div>
            </div>
            <div class="task-deadline">{{ task.expectedCompletionTime || '未设' }}</div>
          </div>
        </div>
        <div v-else class="empty-flow">
          <el-empty description="暂无任务数据" />
        </div>
      </div>
    </div>

    <!-- ==================== 编辑任务对话框 ==================== -->
    <el-dialog v-model="editDialogVisible" title="编辑任务" width="560px">
      <el-form :model="editingTask" label-width="110px">
        <el-form-item label="任务名称">
          <el-input v-model="editingTask.taskName" />
        </el-form-item>
        <el-form-item label="计划完成日期">
          <el-date-picker
            v-model="editingTask.taskDate"
            type="date"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="预期完成时间">
          <el-date-picker
            v-model="editingTask.expectedCompletionTime"
            type="date"
            value-format="YYYY-MM-DD"
            style="width: 100%"
            placeholder="不填则按优先级默认"
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
        <el-form-item label="任务目标">
          <el-autocomplete
            v-model="editingTask.goal"
            :fetch-suggestions="queryGoalSuggestions"
            placeholder="可手写，或从语料库选择"
            style="width: 100%"
            clearable
          />
        </el-form-item>
        <el-form-item label="到期提醒语">
          <el-input v-model="editingTask.reminderText" placeholder="到期时弹出的提醒内容（支持占位符 {任务名}）" />
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

    <!-- ==================== 决策树弹窗（完整保留） ==================== -->
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
        <el-form-item label="目标语料库">
          <el-input
            v-model="promptConfig.goalCorpus"
            type="textarea"
            :rows="6"
            placeholder="每行一个目标模板，例如：
核心是让功能跑通，不是让代码漂亮
完成 MVP 版本，细节可下个迭代优化
若进度过半仍偏移，立刻回归核心目标"
          />
          <p class="hint-text">这些模板会出现在任务编辑的“目标”下拉建议中</p>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPromptDialog = false">取消</el-button>
        <el-button type="primary" @click="savePromptConfig">保存</el-button>
      </template>
    </el-dialog>

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
import { ref, computed, onMounted, watch, nextTick, onUnmounted } from 'vue'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Clock, Connection, Edit, Download, Upload, Link,
  FullScreen, ZoomIn, ZoomOut, Microphone, CopyDocument,
  FolderOpened, DocumentAdd, UploadFilled, Delete, RefreshLeft, WarningFilled, Aim
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
- expectedCompletionTime: 预期完成时间，格式YYYY-MM-DD（必填，可按优先级默认）
- goal: 任务目标（可选，一句话描述）
- reminderText: 到期提醒语（可选）

decisionTree 节点结构：
{
  "id": "自动生成的唯一字符串",
  "parentId": "父节点id，根节点为null",
  "text": "节点描述",
  "completed": false,
  "branchCondition": "若为分支子节点，填写该分支的条件文本；否则可为空字符串"
}

【任务拆解规则】
1. 若用户已明确声明分块，则严格按照用户的分块生成任务。
2. 若无明确分块，则自行提炼合理粒度的任务。

【决策树生成规则】
- 如果描述包含决策流程特征（如果…则…、判断、分支等），则生成决策树；否则 decisionTree 为空数组。
- 节点总数不超过20个。

【输出要求】
- 只输出 JSON 数组，不要任何解释、注释或代码块。`;

const DEFAULT_TREE_PROMPT = `你是一个决策树生成助手。用户会描述一个任务的执行过程，请分析其中的步骤、分支、回退等，生成一个决策树JSON数组。
每个节点包含字段：id, parentId, text, completed, branchCondition。
规则：
1. 只输出 JSON 数组。
2. 根节点 parentId 为 null。
3. 分支条件写在子节点的 branchCondition 中。
4. 失败回退在节点描述中写明。
5. 节点数不超过20个。`;

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
const lastImportBackup = ref(null)

const worryCollapseActive = ref([])
const worries = ref([])
const newWorry = ref({ title: '', desc: '' })

const decisionTreeDialogVisible = ref(false)
const currentDecisionTask = ref(null)
const showAiImportPanel = ref(false)
const treeDescription = ref('')
const treeImportJson = ref('')

const promptConfig = ref({
  taskPrompt: DEFAULT_TASK_PROMPT,
  treePromptTemplate: DEFAULT_TREE_PROMPT,
  goalCorpus: ''
})

const notificationPermission = ref(Notification?.permission || 'default')
const remindedTaskIds = ref(new Set())

// ============== 辅助函数 ==============
const generateId = () => `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

const getDefaultExpectedTime = (priority) => {
  const now = new Date()
  switch (priority) {
    case 'high': now.setDate(now.getDate() + 1); break
    case 'medium': now.setDate(now.getDate() + 3); break
    case 'low': now.setDate(now.getDate() + 7); break
    default: now.setDate(now.getDate() + 3)
  }
  return now.toISOString().split('T')[0]
}

const formatDate = (dateStr) => {
  if (dateStr === '未设置' || dateStr.startsWith('相似任务组')) return dateStr
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  return `${date.getMonth() + 1}月${date.getDate()}日 ${['日', '一', '二', '三', '四', '五', '六'][date.getDay()]}`
}
const getPriorityType = (priority) => ({ high: 'danger', medium: 'warning', low: 'info' }[priority] || 'info')
const getPriorityText = (priority) => ({ high: '高', medium: '中', low: '低' }[priority] || '未知')
const calcTreeProgress = (nodes) => {
  if (!nodes || nodes.length === 0) return 0
  const completed = nodes.filter(n => n.completed).length
  return Math.round((completed / nodes.length) * 100)
}
const progressColor = (nodes) => {
  const pct = calcTreeProgress(nodes)
  return pct === 100 ? '#67C23A' : '#409EFF'
}
const allTags = computed(() => {
  const tags = new Set()
  tasks.value.forEach(task => {
    if (task.tags) task.tags.forEach(tag => tags.add(tag))
  })
  return Array.from(tags)
})

// ============== 泳道热度图辅助（流程图视图用） ==============
const today = new Date()
today.setHours(0,0,0,0)

function daysUntil(dateStr) {
  if (!dateStr) return Infinity
  const d = new Date(dateStr)
  d.setHours(0,0,0,0)
  return Math.ceil((d - today) / (1000*60*60*24))
}

const isOverdue = (task) => daysUntil(task.expectedCompletionTime) <= 0

const urgencyColor = (task) => {
  const days = daysUntil(task.expectedCompletionTime)
  if (days <= 0) return '#f56c6c'
  if (days <= 3) return '#e6a23c'
  if (days <= 7) return '#67c23a'
  return '#b0c4de'
}

const taskWidth = (task) => {
  const maxHours = 16
  return Math.min((task.estimatedHours / maxHours) * 100, 100) + '%'
}

const deadlinePos = (task) => {
  const minD = Math.min(...tasks.value.map(t => daysUntil(t.expectedCompletionTime)))
  const maxD = Math.max(...tasks.value.map(t => daysUntil(t.expectedCompletionTime)))
  const range = maxD - minD || 1
  return ((daysUntil(task.expectedCompletionTime) - minD) / range * 80 + 10) + '%'
}

// ============== 流程图数据同步 ==============
const flowNodes = ref([])
const flowEdges = ref([])
const syncFlowData = () => {
  // 保留同步函数，但流程图视图已替换为泳道图，所以不操作VueFlow节点
  // 如果未来需要恢复VueFlow可在此调整
}

// ============== 从后端同步任务卡片（Claude自动生成） ==============
const loadSyncedTasks = async () => {
  try {
    const res = await fetch('/api/task-sync?' + Date.now())
    if (!res.ok) return
    const syncedTasks = await res.json()
    const existingNames = new Set(tasks.value.map(t => t.taskName))
    let added = 0
    let updated = 0
    for (const st of syncedTasks) {
      if (!existingNames.has(st.taskName)) {
        st.id = generateId()
        if (!st.expectedCompletionTime) st.expectedCompletionTime = getDefaultExpectedTime(st.priority || 'medium')
        if (!st.goal) st.goal = ''
        if (!st.reminderText) st.reminderText = ''
        tasks.value.push(st)
        added++
      } else {
        const exist = tasks.value.find(t => t.taskName === st.taskName)
        if (exist && st.decisionTree && st.decisionTree.length) {
          if (!exist.decisionTree || exist.decisionTree.length === 0) {
            exist.decisionTree = st.decisionTree
            updated++
          } else {
            for (const syncNode of st.decisionTree) {
              const existNode = exist.decisionTree.find(n => n.text === syncNode.text)
              if (existNode && syncNode.completed) {
                existNode.completed = true
              } else if (!existNode) {
                exist.decisionTree.push(syncNode)
              }
            }
            updated++
          }
        }
      }
    }
    if (added || updated) {
      saveTasks()
      console.log(`[TaskSync] 新增 ${added}，更新 ${updated}`)
    }
  } catch (e) {
    console.warn('[TaskSync] 同步失败:', e.message)
  }
}

// ============== 写回文件供Claude读取 ==============
const syncBackToFile = async () => {
  try {
    // 只传纯数据，不传Vue响应式代理
    const plain = JSON.parse(JSON.stringify(tasks.value))
    await fetch('/api/task-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tasks: plain })
    })
  } catch (e) {
    console.warn('[TaskSync] 写回文件失败:', e.message)
  }
}

// ============== 保存任务（必须在调用它的函数之前定义） ==============
const saveTasks = () => {
  localStorage.setItem('taskManager_tasks', JSON.stringify(tasks.value))
  syncFlowData()
  syncBackToFile()
}

watch(tasks, saveTasks, { deep: true })

// ============== 持久化恢复 ==============
onMounted(() => {
  const savedTasks = localStorage.getItem('taskManager_tasks')
  const savedPrompt = localStorage.getItem('taskManager_prompt')
  const savedWorries = localStorage.getItem('taskManager_worries')

  if (savedTasks) {
    try {
      tasks.value = JSON.parse(savedTasks)
      tasks.value.forEach(t => {
        if (!t.expectedCompletionTime) t.expectedCompletionTime = getDefaultExpectedTime(t.priority)
        if (!t.goal) t.goal = ''
        if (!t.reminderText) t.reminderText = ''
      })
    } catch (e) {}
  }
  if (savedPrompt) {
    try {
      const parsed = JSON.parse(savedPrompt)
      if (parsed.taskPrompt) promptConfig.value.taskPrompt = parsed.taskPrompt
      if (parsed.treePromptTemplate) promptConfig.value.treePromptTemplate = parsed.treePromptTemplate
      if (parsed.goalCorpus) promptConfig.value.goalCorpus = parsed.goalCorpus
    } catch (e) {}
  }
  if (savedWorries) {
    try { worries.value = JSON.parse(savedWorries) } catch (e) {}
  }
  // 从后端同步任务卡片（Claude自动生成）
  loadSyncedTasks()
  syncFlowData()
  startDeadlineCheck()
})

onUnmounted(() => {
  if (deadlineTimer) clearInterval(deadlineTimer)
})

// ============== 通知 ==============
let deadlineTimer = null
const startDeadlineCheck = () => {
  deadlineTimer = setInterval(checkAndNotifyDeadlines, 60000)
  checkAndNotifyDeadlines()
}

const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    ElMessage.warning('当前浏览器不支持通知')
    return
  }
  const permission = await Notification.requestPermission()
  notificationPermission.value = permission
  if (permission === 'granted') ElMessage.success('通知已开启')
  else ElMessage.warning('通知权限被拒绝')
}

const checkAndNotifyDeadlines = () => {
  if (notificationPermission.value !== 'granted') return
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  tasks.value.forEach(task => {
    if (task.completed) return
    if (!task.expectedCompletionTime) return
    const deadline = new Date(task.expectedCompletionTime)
    deadline.setHours(0, 0, 0, 0)
    if (deadline <= now) {
      if (remindedTaskIds.value.has(task.id)) return
      const reminder = task.reminderText || `任务「${task.taskName}」已到期，目标：${task.goal || '未设置'}`
      const title = '任务截止提醒'
      const options = { body: reminder, icon: '/favicon.ico' }
      try {
        new Notification(title, options)
        remindedTaskIds.value.add(task.id)
      } catch (e) {}
    }
  })
}

// ============== 目标语料库 ==============
const goalSuggestions = computed(() => {
  const corpus = promptConfig.value.goalCorpus || ''
  return corpus.split('\n').map(line => line.trim()).filter(Boolean).map(text => ({ value: text }))
})
const queryGoalSuggestions = (queryString, cb) => {
  const results = queryString
    ? goalSuggestions.value.filter(s => s.value.includes(queryString))
    : goalSuggestions.value
  cb(results)
}

// ============== 担忧操作 ==============
const addWorry = () => {
  const title = newWorry.value.title.trim()
  if (!title) return ElMessage.warning('请输入担忧标题')
  worries.value.push({ title, desc: newWorry.value.desc.trim() })
  newWorry.value = { title: '', desc: '' }
  saveWorries()
  if (!worryCollapseActive.value.includes('worry')) worryCollapseActive.value.push('worry')
}
const removeWorry = (index) => { worries.value.splice(index, 1); saveWorries() }
const saveWorries = () => localStorage.setItem('taskManager_worries', JSON.stringify(worries.value))

// ============== 导入/导出 ==============
const backupCurrentTasks = () => { lastImportBackup.value = JSON.parse(JSON.stringify(tasks.value)) }
const undoImport = () => {
  if (!lastImportBackup.value) return
  tasks.value = lastImportBackup.value
  lastImportBackup.value = null
  saveTasks()
  ElMessage.success('已撤回到导入前状态')
}

const handleSmartImport = () => {
  const raw = taskImportJson.value.trim()
  if (!raw) return ElMessage.warning('请先粘贴 JSON 数据')
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
      decisionTree: t.decisionTree || [],
      expectedCompletionTime: t.expectedCompletionTime || getDefaultExpectedTime(t.priority || 'medium'),
      goal: t.goal || '',
      reminderText: t.reminderText || ''
    }))
    tasks.value = [...tasks.value, ...newTasks]
    saveTasks()
    ElMessage.success(`✅ 成功导入 ${newTasks.length} 个任务`)
  } catch (e) { ElMessage.error('JSON 格式错误：' + e.message) }
}

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
        ElMessage.success('项目已导入')
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
          completed: false,
          decisionTree: t.decisionTree || [],
          expectedCompletionTime: t.expectedCompletionTime || getDefaultExpectedTime(t.priority || 'medium'),
          goal: t.goal || '',
          reminderText: t.reminderText || ''
        }))
        tasks.value = [...tasks.value, ...newTasks]
        saveTasks()
        ElMessage.success(`导入 ${newTasks.length} 个任务`)
      }
    } catch (err) { ElMessage.error('文件格式错误') }
  }
  reader.readAsText(file)
  event.target.value = ''
  delete event.target.dataset.importType
}

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
  if (!input) return ElMessage.warning('请先输入需求描述')
  let taskContext = tasks.value.map(t =>
    `${t.taskName}（目标：${t.goal || '未设'}，预期：${t.expectedCompletionTime || '未定'}，预估${t.estimatedHours}h）`
  ).join('\n')
  const full = `${base}\n\n用户需求：\n${input}\n\n当前任务上下文：\n${taskContext}\n\n请根据以上需求生成符合格式的 JSON 数组。`
  try {
    await navigator.clipboard.writeText(full)
    ElMessage.success('✅ 完整提示词已复制到剪贴板！')
  } catch { ElMessage.error('复制失败，请手动复制') }
}

const savePromptConfig = () => {
  savePromptToLocal()
  showPromptDialog.value = false
  ElMessage.success('提示词配置已保存')
}
const savePromptToLocal = () => localStorage.setItem('taskManager_prompt', JSON.stringify(promptConfig.value))

// ============== 任务增删改（依赖 saveTasks） ==============
const hasCompletedTasks = computed(() => tasks.value.some(t => t.completed))
const deleteAllCompletedTasks = async () => {
  try {
    await ElMessageBox.confirm('确定要删除所有已完成的任务吗？', '警告', { type: 'warning' })
    tasks.value = tasks.value.filter(t => !t.completed)
    saveTasks()
    ElMessage.success('已删除所有已完成任务')
  } catch {}
}
const editTask = (task) => {
  editingTask.value = { ...task }
  if (!editingTask.value.expectedCompletionTime) editingTask.value.expectedCompletionTime = getDefaultExpectedTime(editingTask.value.priority)
  editDialogVisible.value = true
}
const saveTask = () => {
  const index = tasks.value.findIndex(t => t.id === editingTask.value.id)
  if (index !== -1) {
    tasks.value[index] = { ...editingTask.value }
    remindedTaskIds.value.delete(editingTask.value.id)
    saveTasks()
  }
  editDialogVisible.value = false
  ElMessage.success('任务已保存')
}
const deleteTask = (taskId) => {
  ElMessageBox.confirm('确定要删除这个任务吗？', '提示', { type: 'warning' }).then(() => {
    tasks.value = tasks.value.filter(t => t.id !== taskId)
    remindedTaskIds.value.delete(taskId)
    saveTasks()
    ElMessage.success('任务已删除')
  }).catch(() => {})
}

// ============== 时间轴数据 ==============
function textSimilarity(a, b) {
  const bigrams = (str) => {
    const chars = str.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '').split('')
    const grams = new Set()
    for (let i = 0; i < chars.length - 1; i++) grams.add(chars[i] + chars[i + 1])
    return grams
  }
  const setA = bigrams(a), setB = bigrams(b)
  if (setA.size === 0 && setB.size === 0) return 1
  if (setA.size === 0 || setB.size === 0) return 0
  let intersection = 0
  for (const gram of setA) { if (setB.has(gram)) intersection++ }
  return intersection / (setA.size + setB.size - intersection)
}
function groupBySimilarity(tasks, threshold = 0.4) {
  if (!tasks.length) return []
  const groups = [], visited = new Set(), adjacency = {}
  tasks.forEach(t => { adjacency[t.id] = [] })
  for (let i = 0; i < tasks.length; i++) {
    for (let j = i + 1; j < tasks.length; j++) {
      const sim = textSimilarity(tasks[i].taskName + ' ' + (tasks[i].description || ''), tasks[j].taskName + ' ' + (tasks[j].description || ''))
      if (sim >= threshold) {
        adjacency[tasks[i].id].push(tasks[j].id)
        adjacency[tasks[j].id].push(tasks[i].id)
      }
    }
  }
  function dfs(id, currentGroup) {
    visited.add(id)
    currentGroup.push(tasks.find(t => t.id === id))
    for (const neighbor of adjacency[id]) if (!visited.has(neighbor)) dfs(neighbor, currentGroup)
  }
  for (const task of tasks) {
    if (!visited.has(task.id)) { const group = []; dfs(task.id, group); groups.push(group) }
  }
  return groups
}
const timelineData = computed(() => {
  if (groupMode.value === 'similarity') {
    const groups = groupBySimilarity(tasks.value)
    return groups.map((group, index) => ({
      date: group.length === 1 ? group[0].taskName : `相似任务组 ${index+1}（${group.length}个任务）`,
      tasks: group
    }))
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

const updateTaskComplete = (taskId, completed) => {
  const task = tasks.value.find(t => t.id === taskId)
  if (task) { task.completed = completed; saveTasks() }
}
const handleNodeClick = (event) => console.log('Node clicked:', event.node.data)
const handleEdgeClick = (event) => console.log('Edge clicked:', event.edge)

// ============== 决策树逻辑 ==============
const treeFlowNodes = ref([])
const treeFlowEdges = ref([])
const currentTreeProgress = computed(() => {
  const tree = currentDecisionTask.value?.decisionTree
  if (!tree || tree.length === 0) return 0
  return calcTreeProgress(tree)
})

const calculateTreeLayout = (nodes) => {
  if (!nodes || nodes.length === 0) return {}
  const childrenMap = {}, nodeMap = {}
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
  for (const depth of Object.keys(levelGroups).sort((a,b)=>a-b)) {
    const ids = levelGroups[depth]
    ids.sort((a,b) => {
      const parentA = nodeMap[a]?.parentId, parentB = nodeMap[b]?.parentId
      if (parentA === parentB) {
        const siblings = nodes.filter(n => n.parentId === parentA)
        return siblings.findIndex(n => n.id === a) - siblings.findIndex(n => n.id === b)
      }
      return 0
    })
    const totalWidth = ids.length * 220
    const startX = -totalWidth / 2 + 110
    ids.forEach((id, index) => {
      positions[id] = { x: startX + index * 220, y: depth * 150 + 50 }
    })
  }
  return positions
}

const rebuildTreeFlow = () => {
  const tree = currentDecisionTask.value?.decisionTree
  if (!tree || tree.length === 0) { treeFlowNodes.value = []; treeFlowEdges.value = []; return }
  const positions = calculateTreeLayout(tree)
  treeFlowNodes.value = tree.map(node => ({
    id: node.id,
    type: 'tree-node',
    position: positions[node.id] || { x: 0, y: 0 },
    data: { id: node.id, label: node.text, completed: node.completed }
  }))
  treeFlowEdges.value = tree.filter(node => node.parentId).map(node => ({
    id: `${node.parentId}-${node.id}`,
    source: node.parentId,
    target: node.id,
    type: 'smoothstep',
    animated: !node.completed,
    style: { stroke: node.completed ? '#67C23A' : '#409EFF' },
    data: { condition: node.branchCondition || '' },
    label: node.branchCondition || '',
    labelStyle: { fill: '#475569', fontWeight: 500, fontSize: 12, background: '#fff', padding: '2px 6px', borderRadius: '4px', border: '1px solid #e2e8f0' }
  }))
}

const openDecisionTree = (task) => {
  currentDecisionTask.value = task
  if (!task.decisionTree) task.decisionTree = []
  decisionTreeDialogVisible.value = true
  showAiImportPanel.value = false
  treeDescription.value = ''
  treeImportJson.value = ''
  nextTick(() => rebuildTreeFlow())
}

const fitTreeView = () => rebuildTreeFlow()

const addRootNodeIfEmpty = () => {
  const tree = currentDecisionTask.value?.decisionTree
  if (!tree) return
  const hasRoot = tree.some(n => n.parentId === null)
  if (!hasRoot) {
    tree.push({
      id: `dt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      parentId: null,
      text: '新根节点',
      completed: false,
      branchCondition: ''
    })
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
  if (idx !== -1) { tree[idx] = updatedNode; saveTasks(); rebuildTreeFlow() }
}

const deleteNode = (nodeId) => {
  const tree = currentDecisionTask.value?.decisionTree
  if (!tree) return
  const getChildrenIds = (parentId) => {
    const ids = []
    const children = tree.filter(n => n.parentId === parentId)
    children.forEach(child => { ids.push(child.id); ids.push(...getChildrenIds(child.id)) })
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
  tree.push({
    id: `dt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    parentId,
    text: '新步骤',
    completed: false,
    branchCondition: ''
  })
  saveTasks()
  rebuildTreeFlow()
}

const toggleNodeComplete = (nodeId, completed) => {
  const tree = currentDecisionTask.value?.decisionTree
  if (!tree) return
  const node = tree.find(n => n.id === nodeId)
  if (node) { node.completed = completed; saveTasks(); rebuildTreeFlow() }
}

const editTreeNodeLabel = (nodeId) => {
  const node = currentDecisionTask.value.decisionTree.find(n => n.id === nodeId)
  if (!node) return
  ElMessageBox.prompt('修改节点名称', '编辑', { inputValue: node.text }).then(({ value }) => {
    if (value && value.trim()) updateNode({ ...node, text: value.trim() })
  }).catch(() => {})
}

const onTreeNodesChange = () => {}
const onTreeEdgesChange = () => {}

const copyTreePrompt = async () => {
  const desc = treeDescription.value.trim()
  if (!desc) return ElMessage.warning('请输入流程描述')
  const full = `${promptConfig.value.treePromptTemplate}\n\n用户描述：\n${desc}\n\n请生成决策树 JSON。`
  try {
    await navigator.clipboard.writeText(full)
    ElMessage.success('✅ 决策树提示词已复制')
  } catch { ElMessage.error('复制失败') }
}

const importTreeFromJson = () => {
  const raw = treeImportJson.value.trim()
  if (!raw) return ElMessage.warning('请先粘贴决策树 JSON 数组')
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
  } catch (e) { ElMessage.error('决策树 JSON 解析失败：' + e.message) }
}
</script>

<style scoped>
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

/* 右侧面板 */
.right-panel { flex: 1; height: 100vh; display: flex; flex-direction: column; padding: 20px 28px; overflow: hidden; }
.view-tabs { flex-shrink: 0; margin-bottom: 20px; display: flex; align-items: center; }
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

/* 时间轴 */
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
.task-goal { font-size: 13px; color: #409EFF; margin: 4px 0; display: flex; align-items: center; gap: 6px; }
.task-meta { display: flex; gap: 20px; margin-bottom: 16px; font-size: 13px; color: #64748b; }
.task-deadline-info { font-size: 12px; color: #909399; margin-top: 5px; }
.deadline-label { font-weight: 600; }
.task-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
.tree-progress { margin: 12px 0; }
.card-actions { display: flex; justify-content: flex-end; gap: 12px; padding-top: 16px; border-top: 1px solid #edf2f7; }
.empty-full { height: 100%; display: flex; align-items: center; justify-content: center; }

/* 流程图视图（泳道热度图） */
.flowchart-view { flex: 1; overflow-y: auto; padding-right: 4px; }
.heatmap-legend { display: flex; gap: 16px; margin-bottom: 16px; font-size: 13px; padding: 0 4px; }
.legend-item { display: flex; align-items: center; }
.swatch { display: inline-block; width: 14px; height: 14px; border-radius: 4px; margin-right: 6px; }
.heatmap-chart { background: #fff; border-radius: 16px; padding: 20px; }
.task-row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; border-radius: 12px; padding: 4px 8px; transition: background-color 0.3s; }
.pulse-row { animation: pulseBg 1.8s infinite; }
@keyframes pulseBg {
  0% { background-color: rgba(245, 108, 108, 0.04); }
  50% { background-color: rgba(245, 108, 108, 0.12); }
  100% { background-color: rgba(245, 108, 108, 0.04); }
}
.task-label { width: 140px; font-weight: 600; font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.task-bar-area { flex: 1; height: 36px; background: #edf2f7; border-radius: 12px; position: relative; }
.task-bar { height: 100%; border-radius: 12px; display: flex; align-items: center; padding-left: 8px; color: white; font-size: 12px; font-weight: 600; transition: width 0.4s; }
.deadline-marker { position: absolute; top: -4px; bottom: -4px; width: 2px; background: #1e293b; }
.task-deadline { width: 80px; font-size: 12px; color: #475569; text-align: right; }
.empty-flow { height: 100%; display: flex; align-items: center; justify-content: center; }

/* 决策树 */
.tree-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #ebeef5; }
.tree-toolbar-left { display: flex; gap: 12px; }
.ai-import-panel { background: #f0f9ff; border: 1px solid #b3d8ff; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
.tree-desc-input { margin: 16px 0; }
.ai-action-row { display: flex; gap: 12px; margin-bottom: 16px; }
.decision-tree-container { background: #fafcfd; border-radius: 12px; padding: 20px; min-height: 400px; }
.tree-empty { display: flex; justify-content: center; align-items: center; height: 300px; }
.tree-view { width: 100%; height: 70vh; background-color: #e5e7eb; background-image: repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(180,180,180,0.15) 19px, rgba(180,180,180,0.15) 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(180,180,180,0.15) 19px, rgba(180,180,180,0.15) 20px); }
.tree-flow-node { background: #ffffff; border-radius: 12px; padding: 10px 14px; min-width: 150px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border-left: 4px solid #409EFF; transition: all 0.2s; font-size: 14px; }
.tree-flow-node.completed { border-left-color: #67C23A; opacity: 0.8; }
.tree-node-header { margin-bottom: 6px; }
.tree-node-title { font-weight: 600; color: #1e293b; margin-bottom: 8px; cursor: pointer; }
.tree-node-actions { display: flex; gap: 2px; justify-content: flex-end; }
.tree-edge-label { background: #f0f9ff; padding: 2px 8px; border-radius: 6px; font-size: 11px; color: #475569; border: 1px solid #e2e8f0; white-space: nowrap; }
:deep(.vue-flow) { background: transparent; }
:deep(.vue-flow__edge-path) { stroke-width: 2.5; }
:deep(.vue-flow__handle) { width: 10px; height: 10px; background: #165DFF; }

@media screen and (max-width: 1000px) {
  .app-layout { flex-direction: column; }
  .left-panel { width: 100%; height: auto; max-height: 40vh; }
  .right-panel { height: auto; flex: 1; }
}
</style>