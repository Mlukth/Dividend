<template>
  <div class="decision-tree-page">
    <!-- 标题区域 -->
    <div class="page-header">
      <h2>{{ taskName }} - 决策树</h2>
    </div>

    <!-- 工具栏 -->
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

    <!-- AI 导入面板 -->
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

    <!-- 决策树流程图主体 -->
    <div class="decision-tree-container">
      <div v-if="!localTree || localTree.length === 0" class="tree-empty">
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
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { VueFlow } from '@vue-flow/core'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import { ElMessage, ElMessageBox } from 'element-plus'

const emit = defineEmits(['update:tree'])

const props = defineProps({
  taskName: {
    type: String,
    default: '未命名任务'
  },
  tree: {
    type: Array,
    default: () => []
  }
})

// ---------- 内部树数组，双向同步 ----------
const localTree = ref([])

watch(() => props.tree, (newVal) => {
  if (JSON.stringify(newVal) !== JSON.stringify(localTree.value)) {
    localTree.value = newVal ? [...newVal] : []
    rebuildTreeFlow()
  }
}, { immediate: true })

watch(localTree, (newVal) => {
  emit('update:tree', newVal)
}, { deep: true })

// ---------- AI 相关状态 ----------
const showAiImportPanel = ref(false)
const treeDescription = ref('')
const treeImportJson = ref('')

const treeFlowNodes = ref([])
const treeFlowEdges = ref([])

const treePromptTemplate = ref(`你是一个决策树生成助手。用户会描述一个任务的执行过程，请分析其中的步骤、分支、回退等，生成一个决策树JSON数组。
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
5. 尽量保持简洁，节点数不超过20个。`)

// ---------- 进度计算 ----------
const calcTreeProgress = (nodes) => {
  if (!nodes || nodes.length === 0) return 0
  const completed = nodes.filter(n => n.completed).length
  return Math.round((completed / nodes.length) * 100)
}

const currentTreeProgress = computed(() => calcTreeProgress(localTree.value))

// ---------- 布局算法 ----------
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

// ---------- 重建 VueFlow 数据 ----------
const rebuildTreeFlow = () => {
  const tree = localTree.value
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

const onTreeNodesChange = () => {}
const onTreeEdgesChange = () => {}

const fitTreeView = () => {
  rebuildTreeFlow()
}

// ---------- 节点操作 ----------
const addRootNodeIfEmpty = () => {
  const tree = localTree.value
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
    localTree.value = [...tree]
    rebuildTreeFlow()
  } else {
    ElMessage.warning('根节点已存在')
  }
}

const deleteNode = (nodeId) => {
  const tree = localTree.value
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
  const newTree = tree.filter(n => !idsToDelete.includes(n.id))
  localTree.value = newTree
  rebuildTreeFlow()
}

const addChildNode = (parentId) => {
  const tree = localTree.value
  if (!tree) return
  const newNode = {
    id: `dt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    parentId: parentId,
    text: '新步骤',
    completed: false,
    branchCondition: ''
  }
  tree.push(newNode)
  localTree.value = [...tree]
  rebuildTreeFlow()
}

const toggleNodeComplete = (nodeId, completed) => {
  const tree = localTree.value
  if (!tree) return
  const node = tree.find(n => n.id === nodeId)
  if (node) {
    node.completed = completed
    localTree.value = [...tree]
    rebuildTreeFlow()
  }
}

const editTreeNodeLabel = (nodeId) => {
  const node = localTree.value.find(n => n.id === nodeId)
  if (!node) return
  ElMessageBox.prompt('修改节点名称', '编辑', {
    inputValue: node.text
  }).then(({ value }) => {
    if (value && value.trim()) {
      node.text = value.trim()
      localTree.value = [...localTree.value]
      rebuildTreeFlow()
    }
  }).catch(() => {})
}

// ---------- AI 交互 ----------
const copyTreePrompt = async () => {
  const desc = treeDescription.value.trim()
  if (!desc) {
    ElMessage.warning('请输入流程描述')
    return
  }
  const full = `${treePromptTemplate.value}\n\n用户描述：\n${desc}\n\n请生成决策树 JSON。`
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
    localTree.value = parsed
    rebuildTreeFlow()
    ElMessage.success(`决策树导入成功，共 ${parsed.length} 个节点`)
    treeImportJson.value = ''
    showAiImportPanel.value = false
  } catch (e) {
    ElMessage.error('决策树 JSON 解析失败：' + e.message)
  }
}

// 初始构建
watch(localTree, () => {
  rebuildTreeFlow()
}, { immediate: true })
</script>

<style scoped>
/* 页面根容器 */
.decision-tree-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: #fafcfd;
  box-sizing: border-box;
}

/* 标题区域 */
.page-header {
  margin-bottom: 20px;
}
.page-header h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
}

/* 工具栏 */
.tree-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}
.tree-toolbar-left {
  display: flex;
  gap: 12px;
}
.tree-progress-header {
  font-size: 14px;
  color: #1e293b;
}

/* AI 导入面板 */
.ai-import-panel {
  background: #f0f9ff;
  border: 1px solid #b3d8ff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  flex-shrink: 0;
}
.tree-desc-input {
  margin: 16px 0;
}
.ai-action-row {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

/* 决策树容器 */
.decision-tree-container {
  flex: 1;
  background: #fafcfd;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 20px;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.tree-empty {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}
.tree-view {
  flex: 1;
  width: 100%;
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
  border-radius: 8px;
  overflow: hidden;
}

/* 决策树节点样式 */
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
.tree-flow-node.completed {
  border-left-color: #67C23A;
  opacity: 0.8;
}
.tree-node-header {
  margin-bottom: 6px;
}
.tree-node-title {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
  cursor: pointer;
}
.tree-node-actions {
  display: flex;
  gap: 2px;
  justify-content: flex-end;
}

/* 边标签样式 */
.tree-edge-label {
  background: #f0f9ff;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 11px;
  color: #475569;
  border: 1px solid #e2e8f0;
  white-space: nowrap;
}

/* VueFlow 全局穿透 */
:deep(.vue-flow) {
  background: transparent;
}
:deep(.vue-flow__edge-path) {
  stroke-width: 2.5;
}
:deep(.vue-flow__handle) {
  width: 10px;
  height: 10px;
  background: #165DFF;
}

.json-textarea :deep(.el-textarea__inner) {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 13px;
}
</style>