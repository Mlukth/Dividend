<template>
  <el-dialog
    :model-value="visible"
    :title="`${taskName} - 决策树`"
    fullscreen
    destroy-on-close
    @update:model-value="emit('update:visible', $event)"
    @opened="onDialogOpened"
  >
    <div class="tree-editor-layout">
      <!-- ========== 左侧：工具栏 + 画布 ========== -->
      <div class="tree-main">
        <!-- 顶部工具栏 -->
        <div class="tree-toolbar">
          <div class="toolbar-left">
            <el-button type="primary" @click="addRootNodeIfEmpty">+ 添加根节点</el-button>
            <el-button @click="showAiImportPanel = !showAiImportPanel">
              🤖 AI 生成决策树
            </el-button>
            <el-button @click="fitTreeView">📷 自适应</el-button>
            <el-dropdown @command="handleExportImport">
              <el-button>
                数据管理 <el-icon><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="importFile">📥 导入 JSON 文件</el-dropdown-item>
                  <el-dropdown-item command="exportFile">📤 导出 JSON 文件</el-dropdown-item>
                  <el-dropdown-item command="importClipboard">📋 从剪贴板导入</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          <div class="toolbar-right">
            <span>整体进度：</span>
            <el-progress
              :percentage="currentTreeProgress"
              :stroke-width="8"
              :color="currentTreeProgress === 100 ? '#67C23A' : '#409EFF'"
              style="width: 200px; display: inline-block; vertical-align: middle;"
            />
            <el-button type="warning" size="small" style="margin-left: 12px;" @click="showPromptEditor = true">
              ⚙️ 提示词模板
            </el-button>
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

        <!-- 画布 -->
        <div class="decision-tree-container">
          <div v-if="!localTree || localTree.length === 0" class="tree-empty">
            <el-empty description="尚无决策节点，请添加根节点或使用 AI 生成" />
          </div>
          <div v-else class="tree-view">
            <VueFlow
              id="tree-flow"
              v-model:nodes="treeFlowNodes"
              v-model:edges="treeFlowEdges"
              :default-viewport="{ zoom: 1.2 }"
              :snap-to-grid="true"
              :snap-grid="[20, 20]"
              :connection-line-style="{ stroke: '#409EFF', strokeWidth: 2 }"
              fit-view-on-init
              @nodes-change="handleNodesChange"
              @edges-change="handleEdgesChange"
              @connect="onConnect"
              @edge-click="onEdgeClick"
              @node-click="onNodeClick"
            >
              <template #node-tree-node="{ data }">
                <div
                  class="tree-flow-node"
                  :class="{ completed: data.completed, selected: data.selected }"
                >
                  <!-- 顶部分支条件标签 -->
                  <div v-if="data.condition" class="condition-tag">
                    {{ data.condition }}
                  </div>
                  <div class="tree-node-header">
                    <el-checkbox
                      :model-value="data.completed"
                      @change="(val) => toggleNodeComplete(data.id, val)"
                    >
                      {{ data.completed ? '✓' : '○' }}
                    </el-checkbox>
                  </div>
                  <div class="tree-node-title" @dblclick="editNodeLabel(data.id)">
                    {{ data.label }}
                  </div>
                  <div class="tree-node-actions">
                    <el-button link size="small" @click="editNodeLabel(data.id)">✏️</el-button>
                    <el-button link size="small" @click="addChildNode(data.id)">➕</el-button>
                    <el-button link size="small" @click="deleteNode(data.id)">🗑️</el-button>
                  </div>
                  <!-- VueFlow 连接手柄 -->
                  <Handle type="source" :position="Position.Right" />
                  <Handle type="target" :position="Position.Left" />
                </div>
              </template>
              <template #edge-label="{ data }">
                <div class="tree-edge-label" v-if="data && data.condition">
                  {{ data.condition }}
                </div>
              </template>
            </VueFlow>
          </div>
        </div>
      </div>

      <!-- ========== 右侧：节点属性编辑面板（选中节点时出现） ========== -->
      <transition name="slide-right">
        <div v-if="selectedNode" class="node-property-panel">
          <div class="panel-title">节点属性</div>
          <el-form :model="nodeForm" label-width="90px" size="small">
            <el-form-item label="名称">
              <el-input v-model="nodeForm.text" />
            </el-form-item>
            <el-form-item label="分支条件">
              <el-input v-model="nodeForm.branchCondition" placeholder="该节点成为子节点时的条件" />
            </el-form-item>
            <el-form-item label="父节点">
              <el-select v-model="nodeForm.parentId" clearable placeholder="无父节点则为根" style="width:100%">
                <el-option
                  v-for="n in localTree"
                  :key="n.id"
                  :label="n.text"
                  :value="n.id"
                  :disabled="n.id === selectedNode.id || isDescendant(n.id, selectedNode.id)"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="完成状态">
              <el-switch v-model="nodeForm.completed" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveNodeProperties">保存</el-button>
              <el-button @click="selectedNode = null">取消</el-button>
            </el-form-item>
          </el-form>
        </div>
      </transition>
    </div>

    <!-- 提示词模板编辑 -->
    <el-dialog
      v-model="showPromptEditor"
      title="决策树生成提示词"
      width="700px"
      append-to-body
      destroy-on-close
    >
      <el-input
        v-model="promptTemplate"
        type="textarea"
        :rows="15"
        placeholder="编辑提示词模板…"
      />
      <template #footer>
        <el-button @click="showPromptEditor = false">取消</el-button>
        <el-button type="primary" @click="savePromptTemplate">保存模板</el-button>
      </template>
    </el-dialog>

    <template #footer>
      <el-button @click="emit('update:visible', false)">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { VueFlow, useVueFlow, Position } from '@vue-flow/core'
import { Handle } from '@vue-flow/core'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import { cloneDeep } from 'lodash-es'

const emit = defineEmits(['update:visible', 'update:tree'])

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  taskName: {
    type: String,
    default: ''
  },
  tree: {
    type: Array,
    default: () => []
  }
})

// ---------- 内部状态 ----------
const localTree = ref([])

// 双向同步
watch(() => props.tree, (newVal) => {
  if (JSON.stringify(newVal) !== JSON.stringify(localTree.value)) {
    localTree.value = newVal ? cloneDeep(newVal) : []
    rebuildTreeFlow()
  }
}, { immediate: true })

watch(localTree, (newVal) => {
  emit('update:tree', newVal)
}, { deep: true })

// 对话框打开时重新布局
const onDialogOpened = () => {
  rebuildTreeFlow()
}

// ---------- VueFlow 状态 ----------
const treeFlowNodes = ref([])
const treeFlowEdges = ref([])
const selectedNode = ref(null)
const nodeForm = reactive({
  id: '',
  text: '',
  branchCondition: '',
  parentId: null,
  completed: false
})

// ---------- AI 面板 ----------
const showAiImportPanel = ref(false)
const treeDescription = ref('')
const treeImportJson = ref('')
const showPromptEditor = ref(false)
const promptTemplate = ref(`你是一个决策树生成助手。用户会描述一个任务的执行过程，请分析其中的步骤、分支、回退等，生成一个决策树JSON数组。
每个节点包含字段：
- id: 唯一字符串（自动生成）
- parentId: 父节点id，根节点为null
- text: 节点描述文本
- completed: false
- branchCondition: 如果有分支，填写该分支的条件文本；非分支节点可为空字符串

规则：
1. 只输出 JSON 数组，不要其他内容。
2. 确保树结构完整，根节点 parentId 必须为 null。
3. 分支条件写在子节点的 branchCondition 中。
4. 尽量保持简洁，节点数不超过20个。`)

// ---------- 进度 ----------
const calcTreeProgress = (nodes) => {
  if (!nodes || nodes.length === 0) return 0
  const completed = nodes.filter(n => n.completed).length
  return Math.round((completed / nodes.length) * 100)
}
const currentTreeProgress = computed(() => calcTreeProgress(localTree.value))

// ---------- 树布局 ----------
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

// 从 localTree 重建 VueFlow 节点/边
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
      completed: node.completed || false,
      condition: node.branchCondition || '',
      selected: false
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

const fitTreeView = () => rebuildTreeFlow()

// ---------- VueFlow 事件 ----------
const handleNodesChange = (changes) => {
  // 自动保存节点位置（可选）
  changes.forEach(change => {
    if (change.type === 'position' && change.position) {
      const node = localTree.value.find(n => n.id === change.id)
      if (node) {
        node._position = { x: change.position.x, y: change.position.y }
      }
    }
  })
}

const handleEdgesChange = () => {}

// 手动连线回调
const onConnect = (connection) => {
  const { source, target } = connection
  if (!source || !target) return

  // 禁止自连接
  if (source === target) {
    ElMessage.warning('不能连接自身')
    return
  }

  // 检查目标节点是否已有父节点（可选：允许重新连接，即剪掉旧边）
  const targetNode = localTree.value.find(n => n.id === target)
  if (targetNode && targetNode.parentId === source) {
    ElMessage.info('这条连线已存在')
    return
  }

  // 避免出现循环依赖（简单检查：target 不能是 source 的祖先）
  if (isDescendant(source, target)) {
    ElMessage.error('不能形成循环依赖')
    return
  }

  // 更新 target 节点的 parentId
  const tree = localTree.value
  const targetIdx = tree.findIndex(n => n.id === target)
  if (targetIdx !== -1) {
    tree[targetIdx].parentId = source
    localTree.value = [...tree]
    rebuildTreeFlow()
    ElMessage.success('连线已创建')
  }
}

// 判断 nodeId 是否是 ancestorId 的后代
const isDescendant = (ancestorId, nodeId) => {
  const node = localTree.value.find(n => n.id === nodeId)
  if (!node) return false
  if (node.parentId === ancestorId) return true
  if (!node.parentId) return false
  return isDescendant(ancestorId, node.parentId)
}

// 点击边 -> 删除
const onEdgeClick = (event) => {
  const edge = event.edge
  ElMessageBox.confirm('确定要删除这条连线吗？', '提示', {
    type: 'warning',
    confirmButtonText: '删除',
    cancelButtonText: '取消'
  }).then(() => {
    // 找到对应的子节点，将其 parentId 设为 null
    const childNode = localTree.value.find(n => n.id === edge.target)
    if (childNode) {
      childNode.parentId = null
      // 也可清空 branchCondition
      // childNode.branchCondition = ''
      localTree.value = [...localTree.value]
      rebuildTreeFlow()
      ElMessage.success('连线已删除')
    }
  }).catch(() => {})
}

// 点击节点 -> 选中并编辑
const onNodeClick = (event) => {
  const nodeData = event.node.data
  const node = localTree.value.find(n => n.id === nodeData.id)
  if (node) {
    // 高亮选中节点
    treeFlowNodes.value.forEach(n => {
      n.data.selected = (n.id === node.id)
    })
    selectedNode.value = node
    Object.assign(nodeForm, {
      id: node.id,
      text: node.text,
      branchCondition: node.branchCondition || '',
      parentId: node.parentId,
      completed: node.completed
    })
  }
}

// 保存属性编辑
const saveNodeProperties = () => {
  if (!selectedNode.value) return
  const tree = localTree.value
  const idx = tree.findIndex(n => n.id === selectedNode.value.id)
  if (idx !== -1) {
    tree[idx].text = nodeForm.text
    tree[idx].branchCondition = nodeForm.branchCondition
    tree[idx].parentId = nodeForm.parentId || null
    tree[idx].completed = nodeForm.completed
    localTree.value = [...tree]
    rebuildTreeFlow()
    ElMessage.success('节点已更新')
  }
  selectedNode.value = null
}

// ---------- 节点基本操作 ----------
const addRootNodeIfEmpty = () => {
  const tree = localTree.value
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
    localTree.value = [...tree]
    rebuildTreeFlow()
  } else {
    ElMessage.warning('根节点已存在')
  }
}

const addChildNode = (parentId) => {
  const tree = localTree.value
  if (!tree) return
  tree.push({
    id: `dt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    parentId: parentId,
    text: '新步骤',
    completed: false,
    branchCondition: ''
  })
  localTree.value = [...tree]
  rebuildTreeFlow()
}

const deleteNode = (nodeId) => {
  const tree = localTree.value
  if (!tree) return
  const getChildrenIds = (pid) => {
    const ids = []
    const children = tree.filter(n => n.parentId === pid)
    children.forEach(child => {
      ids.push(child.id)
      ids.push(...getChildrenIds(child.id))
    })
    return ids
  }
  const idsToDelete = [nodeId, ...getChildrenIds(nodeId)]
  ElMessageBox.confirm(`确定删除该节点及其 ${idsToDelete.length - 1} 个子节点吗？`, '谨慎操作', {
    type: 'warning'
  }).then(() => {
    localTree.value = tree.filter(n => !idsToDelete.includes(n.id))
    selectedNode.value = null
    rebuildTreeFlow()
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const toggleNodeComplete = (nodeId, completed) => {
  const tree = localTree.value
  const node = tree.find(n => n.id === nodeId)
  if (node) {
    node.completed = completed
    localTree.value = [...tree]
    rebuildTreeFlow()
  }
}

const editNodeLabel = (nodeId) => {
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

// ---------- 导入/导出 ----------
const handleExportImport = (command) => {
  if (command === 'importFile') {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target.result)
          if (!Array.isArray(imported)) throw new Error('格式错误')
          localTree.value = imported
          rebuildTreeFlow()
          ElMessage.success('文件导入成功')
        } catch (err) {
          ElMessage.error('导入失败：' + err.message)
        }
      }
      reader.readAsText(file)
      input.remove()
    }
    input.click()
  } else if (command === 'exportFile') {
    const dataStr = JSON.stringify(localTree.value, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `decision_tree_${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    ElMessage.success('已导出决策树 JSON')
  } else if (command === 'importClipboard') {
    navigator.clipboard.readText().then(text => {
      try {
        const data = JSON.parse(text)
        if (!Array.isArray(data)) throw new Error('格式错误')
        localTree.value = data
        rebuildTreeFlow()
        ElMessage.success('已从剪贴板导入')
      } catch (e) {
        ElMessage.error('剪贴板内容不是合法的决策树 JSON')
      }
    }).catch(() => {
      ElMessage.error('读取剪贴板失败')
    })
  }
}

// ---------- AI 生成相关 ----------
const copyTreePrompt = async () => {
  const desc = treeDescription.value.trim()
  if (!desc) {
    ElMessage.warning('请输入流程描述')
    return
  }
  const full = `${promptTemplate.value}\n\n用户描述：\n${desc}\n\n请生成决策树 JSON。`
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

const savePromptTemplate = () => {
  showPromptEditor.value = false
  ElMessage.success('提示词模板已保存')
}
</script>

<style scoped>
/* ========== 整体布局 ========== */
.tree-editor-layout {
  display: flex;
  height: 85vh;
  gap: 16px;
}

.tree-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* ---------- 工具栏 ---------- */
.tree-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
  flex-shrink: 0;
}
.toolbar-left {
  display: flex;
  gap: 12px;
}
.toolbar-right {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #1e293b;
}

/* ---------- AI 面板 ---------- */
.ai-import-panel {
  background: #f0f9ff;
  border: 1px solid #b3d8ff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
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

/* ---------- 画布 ---------- */
.decision-tree-container {
  flex: 1;
  background: #fafcfd;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 10px;
  display: flex;
  flex-direction: column;
  min-height: 0;
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
    repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(180,180,180,0.15) 19px, rgba(180,180,180,0.15) 20px),
    repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(180,180,180,0.15) 19px, rgba(180,180,180,0.15) 20px);
  border-radius: 8px;
  overflow: hidden;
}

/* 节点样式 */
.tree-flow-node {
  background: #ffffff;
  border-radius: 12px;
  padding: 10px 14px 10px 14px;
  min-width: 160px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  border-left: 4px solid #409EFF;
  transition: all 0.2s;
  font-size: 14px;
  position: relative;
}
.tree-flow-node.completed {
  border-left-color: #67C23A;
  opacity: 0.8;
}
.tree-flow-node.selected {
  box-shadow: 0 0 0 2px #409EFF, 0 4px 16px rgba(64,158,255,0.3);
}
.condition-tag {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: #fff;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 2px 12px;
  font-size: 12px;
  color: #475569;
  white-space: nowrap;
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

/* 边标签 */
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
:deep(.vue-flow__handle) {
  width: 12px;
  height: 12px;
  background: #165DFF;
  border: 2px solid #fff;
}

/* ---------- 右侧属性面板 ---------- */
.node-property-panel {
  width: 280px;
  flex-shrink: 0;
  background: #ffffff;
  border-left: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  box-shadow: -2px 0 12px rgba(0,0,0,0.04);
  overflow-y: auto;
}
.panel-title {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 20px;
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease;
}
.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.json-textarea :deep(.el-textarea__inner) {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 13px;
}
</style>