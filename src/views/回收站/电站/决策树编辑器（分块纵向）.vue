<template>
  <div class="tree-editor-page">
    <!-- 左侧操作区 -->
    <div class="left-panel">
      <div class="panel-header">
        <h2>{{ taskName }} - 决策树</h2>
        <el-button type="warning" size="small" @click="showPromptEditor = true">⚙️ 提示词模板</el-button>
      </div>

      <div class="section-card">
        <div class="section-title">
          <el-icon><Microphone /></el-icon> 流程描述
        </div>
        <el-input
          v-model="treeDescription"
          type="textarea"
          :rows="4"
          placeholder="描述任务执行流程，用于生成决策树..."
          class="custom-textarea"
        />
        <el-button type="primary" class="action-btn" @click="copyTreePrompt">
          <el-icon><CopyDocument /></el-icon> 生成并复制提示词
        </el-button>
        <p class="hint-text">点击后复制到剪贴板，可粘贴至 AI 对话窗口</p>
      </div>

      <div class="section-card import-section">
        <div class="section-title">
          <el-icon><DocumentAdd /></el-icon> 智能导入决策树
        </div>
        <p class="hint-text">粘贴 AI 返回的 JSON 数组，或手动编辑的决策树数据</p>
        <el-input
          v-model="treeImportJson"
          type="textarea"
          :rows="8"
          placeholder='[
  {
    "id": "...",
    "parentId": null,
    "text": "开始",
    ...
  }
]'
          class="custom-textarea json-textarea"
        />
        <div class="import-actions">
          <el-button type="success" class="import-btn" @click="importTreeFromJson">
            <el-icon><UploadFilled /></el-icon> 导入 JSON
          </el-button>
          <el-button class="clear-btn" @click="treeImportJson = ''">
            <el-icon><Delete /></el-icon> 清空
          </el-button>
        </div>
        <div class="import-stats">
          <span>当前节点数：{{ localTree.length }} 个</span>
        </div>
      </div>

      <div class="section-card">
        <div class="section-title">
          <el-icon><FolderOpened /></el-icon> 数据管理
        </div>
        <div class="data-actions">
          <el-button @click="handleExportImport('importFile')">
            <el-icon><Upload /></el-icon> 导入 JSON 文件
          </el-button>
          <el-button @click="handleExportImport('exportFile')">
            <el-icon><Download /></el-icon> 导出 JSON 文件
          </el-button>
        </div>
      </div>
    </div>

    <!-- 右侧画布区 -->
    <div class="right-panel">
      <div class="tree-toolbar">
        <div class="toolbar-left">
          <el-button type="primary" @click="addRootNodeIfEmpty">+ 添加根节点</el-button>
          <el-button @click="fitTreeView">📷 自适应</el-button>
        </div>
        <div class="toolbar-right">
          整体进度：
          <el-progress
            :percentage="currentTreeProgress"
            :stroke-width="8"
            :color="currentTreeProgress === 100 ? '#67C23A' : '#409EFF'"
            style="width: 200px; display: inline-block; vertical-align: middle;"
          />
        </div>
      </div>

      <div class="editor-body">
        <div class="canvas-container">
          <div v-if="!localTree || localTree.length === 0" class="tree-empty">
            <el-empty description="尚无决策节点，请添加根节点或使用 AI 生成" />
          </div>
          <div v-else class="tree-view">
            <VueFlow
              id="tree-flow"
              v-model:nodes="treeFlowNodes"
              v-model:edges="treeFlowEdges"
              :default-viewport="{ zoom: 0.9 }"
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
                  <pre class="tree-node-title" @dblclick="editNodeLabel(data.id)">{{ data.label }}</pre>
                  <div class="tree-node-actions">
                    <el-button link size="small" @click="editNodeLabel(data.id)">✏️</el-button>
                    <el-button link size="small" @click="addChildNode(data.id)">➕</el-button>
                    <el-button link size="small" @click="deleteNode(data.id)">🗑️</el-button>
                  </div>
                  <!-- 连接手柄：上为target，下为source（纵向布局） -->
                  <Handle type="source" :position="Position.Bottom" />
                  <Handle type="target" :position="Position.Top" />
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

        <transition name="slide-right">
          <div v-if="selectedNode" class="node-property-panel">
            <div class="panel-title">节点属性</div>
            <el-form :model="nodeForm" label-width="90px" size="small">
              <el-form-item label="名称">
                <el-input v-model="nodeForm.text" type="textarea" :rows="2" />
              </el-form-item>
              <el-form-item label="分支条件">
                <el-input v-model="nodeForm.branchCondition" placeholder="成为子节点时的条件" />
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
    </div>

    <el-dialog v-model="showPromptEditor" title="决策树生成提示词" width="700px" destroy-on-close>
      <el-input v-model="promptTemplate" type="textarea" :rows="15" />
      <template #footer>
        <el-button @click="showPromptEditor = false">取消</el-button>
        <el-button type="primary" @click="savePromptTemplate">保存模板</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { VueFlow, Position, Handle } from '@vue-flow/core'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Microphone, CopyDocument, DocumentAdd, UploadFilled, Delete,
  FolderOpened, Upload, Download
} from '@element-plus/icons-vue'

const emit = defineEmits(['update:tree'])

const props = defineProps({
  taskName: { type: String, default: '未命名任务' },
  tree: { type: Array, default: () => [] }
})

const localTree = ref([])

watch(() => props.tree, (newVal) => {
  const val = newVal ? JSON.parse(JSON.stringify(newVal)) : []
  if (JSON.stringify(val) !== JSON.stringify(localTree.value)) {
    localTree.value = val
    rebuildTreeFlow()
  }
}, { immediate: true })

watch(localTree, (newVal) => { emit('update:tree', newVal) }, { deep: true })

const treeFlowNodes = ref([])
const treeFlowEdges = ref([])
const selectedNode = ref(null)
const nodeForm = reactive({ id: '', text: '', branchCondition: '', parentId: null, completed: false })

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

const calcTreeProgress = (nodes) => {
  if (!nodes || nodes.length === 0) return 0
  const completed = nodes.filter(n => n.completed).length
  return Math.round((completed / nodes.length) * 100)
}
const currentTreeProgress = computed(() => calcTreeProgress(localTree.value))

// ====================== 块并排纵向布局算法 ======================
const calculateBlockLayout = (nodes) => {
  if (!nodes || nodes.length === 0) return {}
  const nodeMap = {}
  const childrenMap = {}
  nodes.forEach(n => {
    nodeMap[n.id] = n
    if (!childrenMap[n.parentId]) childrenMap[n.parentId] = []
    childrenMap[n.parentId].push(n)
  })

  // 找根节点（块）
  const rootNodes = nodes.filter(n => n.parentId === null || !nodeMap[n.parentId])

  const positions = {}
  let blockX = 0
  const blockGap = 420  // 块之间的水平间距
  const verticalSpacing = 100  // 父子垂直间距
  const siblingSpacing = 80    // 兄弟节点垂直间距

  // 计算子树最大宽度（用于居中），这里简单忽略，直接按宽度分配坐标
  const layoutSubtree = (rootId, startX, startY) => {
    const queue = [{ id: rootId, x: startX, y: startY }]
    const visited = new Set()
    while (queue.length) {
      const { id, x, y } = queue.shift()
      if (visited.has(id)) continue
      visited.add(id)
      positions[id] = { x, y }
      const children = childrenMap[id] || []
      const childrenCount = children.length
      // 子节点垂直居中排列在父节点下方
      const startChildY = y + verticalSpacing - ((childrenCount - 1) * siblingSpacing) / 2
      children.forEach((child, index) => {
        queue.push({ id: child.id, x, y: startChildY + index * siblingSpacing })
      })
    }
  }

  rootNodes.forEach(root => {
    // 每个块从 blockX 开始，y 从 60 开始
    layoutSubtree(root.id, blockX, 60)
    // 计算该块所有节点的最右坐标，更新 blockX
    const blockNodeIds = getSubtreeIds(root.id, childrenMap)
    let maxX = blockX
    blockNodeIds.forEach(id => {
      if (positions[id] && positions[id].x > maxX) maxX = positions[id].x
    })
    blockX = maxX + blockGap
  })

  return positions
}

const getSubtreeIds = (rootId, childrenMap) => {
  const ids = [rootId]
  const queue = [rootId]
  while (queue.length) {
    const id = queue.shift()
    const children = childrenMap[id] || []
    children.forEach(child => {
      ids.push(child.id)
      queue.push(child.id)
    })
  }
  return ids
}

const rebuildTreeFlow = () => {
  const tree = localTree.value
  if (!tree || tree.length === 0) {
    treeFlowNodes.value = []
    treeFlowEdges.value = []
    return
  }
  const positions = calculateBlockLayout(tree)
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
  // 边：从父节点Bottom到子节点Top
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
        fill: '#475569', fontWeight: 500, fontSize: 12,
        background: '#fff', padding: '2px 6px', borderRadius: '4px', border: '1px solid #e2e8f0'
      }
    }))
}

const fitTreeView = () => rebuildTreeFlow()

const handleNodesChange = (changes) => {
  changes.forEach(change => {
    if (change.type === 'position' && change.position) {
      const node = localTree.value.find(n => n.id === change.id)
      if (node) node._position = { x: change.position.x, y: change.position.y }
    }
  })
}
const handleEdgesChange = () => {}

const onConnect = (connection) => {
  const { source, target } = connection
  if (!source || !target) return
  if (source === target) { ElMessage.warning('不能连接自身'); return }
  if (isDescendant(source, target)) { ElMessage.error('不能形成循环依赖'); return }
  const idx = localTree.value.findIndex(n => n.id === target)
  if (idx !== -1) {
    localTree.value[idx].parentId = source
    localTree.value = [...localTree.value]
    rebuildTreeFlow()
    ElMessage.success('连线已创建')
  }
}

const isDescendant = (ancestorId, nodeId) => {
  const node = localTree.value.find(n => n.id === nodeId)
  if (!node) return false
  if (node.parentId === ancestorId) return true
  if (!node.parentId) return false
  return isDescendant(ancestorId, node.parentId)
}

const onEdgeClick = (event) => {
  const edge = event.edge
  ElMessageBox.confirm('确定删除这条连线吗？', { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' }).then(() => {
    const child = localTree.value.find(n => n.id === edge.target)
    if (child) {
      child.parentId = null
      localTree.value = [...localTree.value]
      rebuildTreeFlow()
      ElMessage.success('连线已删除')
    }
  }).catch(() => {})
}

const onNodeClick = (event) => {
  const nodeData = event.node.data
  const node = localTree.value.find(n => n.id === nodeData.id)
  if (node) {
    treeFlowNodes.value.forEach(n => { n.data.selected = (n.id === node.id) })
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

const saveNodeProperties = () => {
  if (!selectedNode.value) return
  const idx = localTree.value.findIndex(n => n.id === selectedNode.value.id)
  if (idx !== -1) {
    localTree.value[idx].text = nodeForm.text
    localTree.value[idx].branchCondition = nodeForm.branchCondition
    localTree.value[idx].parentId = nodeForm.parentId || null
    localTree.value[idx].completed = nodeForm.completed
    localTree.value = [...localTree.value]
    rebuildTreeFlow()
    ElMessage.success('节点已更新')
  }
  selectedNode.value = null
}

const addRootNodeIfEmpty = () => {
  if (!localTree.value.some(n => n.parentId === null)) {
    localTree.value.push({
      id: `dt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      parentId: null, text: '新根节点', completed: false, branchCondition: ''
    })
    localTree.value = [...localTree.value]
    rebuildTreeFlow()
  } else {
    ElMessage.warning('根节点已存在')
  }
}

const addChildNode = (parentId) => {
  localTree.value.push({
    id: `dt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    parentId, text: '新步骤', completed: false, branchCondition: ''
  })
  localTree.value = [...localTree.value]
  rebuildTreeFlow()
}

const deleteNode = (nodeId) => {
  const tree = localTree.value
  const getChildrenIds = (pid) => {
    const ids = []
    const children = tree.filter(n => n.parentId === pid)
    children.forEach(child => { ids.push(child.id); ids.push(...getChildrenIds(child.id)) })
    return ids
  }
  const idsToDelete = [nodeId, ...getChildrenIds(nodeId)]
  ElMessageBox.confirm(`确定删除该节点及其 ${idsToDelete.length - 1} 个子节点吗？`, { type: 'warning' }).then(() => {
    localTree.value = tree.filter(n => !idsToDelete.includes(n.id))
    selectedNode.value = null
    rebuildTreeFlow()
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const toggleNodeComplete = (nodeId, completed) => {
  const node = localTree.value.find(n => n.id === nodeId)
  if (node) {
    node.completed = completed
    localTree.value = [...localTree.value]
    rebuildTreeFlow()
  }
}

const editNodeLabel = (nodeId) => {
  const node = localTree.value.find(n => n.id === nodeId)
  if (!node) return
  ElMessageBox.prompt('修改节点名称', '编辑', { inputValue: node.text }).then(({ value }) => {
    if (value && value.trim()) {
      node.text = value.trim()
      localTree.value = [...localTree.value]
      rebuildTreeFlow()
    }
  }).catch(() => {})
}

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
        } catch (err) { ElMessage.error('导入失败：' + err.message) }
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
  }
}

const copyTreePrompt = async () => {
  const desc = treeDescription.value.trim()
  if (!desc) { ElMessage.warning('请输入流程描述'); return }
  const full = `${promptTemplate.value}\n\n用户描述：\n${desc}\n\n请生成决策树 JSON。`
  try {
    await navigator.clipboard.writeText(full)
    ElMessage.success('✅ 决策树提示词已复制')
  } catch { ElMessage.error('复制失败') }
}

const importTreeFromJson = () => {
  const raw = treeImportJson.value.trim()
  if (!raw) { ElMessage.warning('请先粘贴 JSON 数组'); return }
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) throw new Error('JSON 必须是数组')
    const valid = parsed.every(n => n.id && n.text && (n.parentId !== undefined))
    if (!valid) throw new Error('节点字段不完整')
    localTree.value = parsed
    rebuildTreeFlow()
    ElMessage.success(`导入成功，共 ${parsed.length} 个节点`)
    treeImportJson.value = ''
  } catch (e) { ElMessage.error('解析失败：' + e.message) }
}

const savePromptTemplate = () => {
  showPromptEditor.value = false
  ElMessage.success('提示词模板已保存')
}

onMounted(() => { rebuildTreeFlow() })
</script>

<style scoped>
.tree-editor-page { display: flex; height: 100vh; background: #f0f4f8; overflow: hidden; }

.left-panel { width: 380px; flex-shrink: 0; height: 100vh; overflow-y: auto; background: #fff; border-right: 1px solid #e9eef4; padding: 20px 16px; box-shadow: 2px 0 12px rgba(0,0,0,0.02); }
.panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.panel-header h2 { font-size: 18px; font-weight: 700; color: #1e293b; margin: 0; }
.section-card { background: #fafcfd; border-radius: 14px; padding: 16px; margin-bottom: 16px; border: 1px solid #e2e8f0; }
.section-title { display: flex; align-items: center; gap: 6px; font-size: 15px; font-weight: 600; color: #0f172a; margin-bottom: 12px; }
.custom-textarea :deep(.el-textarea__inner) { border-radius: 12px; background: #fff; border: 1px solid #cbd5e1; font-size: 14px; }
.action-btn { width: 100%; margin-top: 12px; border-radius: 40px; padding: 12px; background: linear-gradient(135deg, #3b82f6, #2563eb); border: none; font-weight: 600; }
.hint-text { font-size: 12px; color: #64748b; margin-top: 8px; text-align: center; }
.import-section { background: #f0fdf4; border-color: #bbf7d0; }
.import-actions { display: flex; gap: 10px; margin-top: 12px; }
.import-btn { flex: 1; border-radius: 40px; background: #10b981; border: none; font-weight: 600; }
.clear-btn { border-radius: 40px; border: 1px solid #d1d5db; }
.import-stats { margin-top: 12px; font-size: 13px; color: #475569; }
.data-actions { display: flex; flex-direction: column; gap: 8px; }
.data-actions .el-button { justify-content: flex-start; }

.right-panel { flex: 1; display: flex; flex-direction: column; padding: 16px 20px; min-width: 0; }
.tree-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid #ebeef5; }
.toolbar-left { display: flex; gap: 10px; }
.toolbar-right { display: flex; align-items: center; font-size: 14px; color: #1e293b; gap: 10px; }

.editor-body { display: flex; flex: 1; gap: 12px; min-height: 0; }
.canvas-container { flex: 1; background: #fafcfd; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; display: flex; }
.tree-empty { flex: 1; display: flex; justify-content: center; align-items: center; }
.tree-view { width: 100%; height: 100%; background-color: #e5e7eb; background-image: repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(180,180,180,0.15) 19px, rgba(180,180,180,0.15) 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(180,180,180,0.15) 19px, rgba(180,180,180,0.15) 20px); border-radius: 8px; }

.tree-flow-node { background: #fff; border-radius: 12px; padding: 10px 14px; min-width: 200px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border-left: 4px solid #409EFF; transition: all 0.2s; font-size: 14px; position: relative; }
.tree-flow-node.completed { border-left-color: #67C23A; opacity: 0.8; }
.tree-flow-node.selected { box-shadow: 0 0 0 2px #409EFF, 0 4px 16px rgba(64,158,255,0.3); }
.condition-tag { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: #fff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 2px 12px; font-size: 12px; color: #475569; white-space: nowrap; }
.tree-node-header { margin-bottom: 4px; }
.tree-node-title {
  margin: 0 0 8px 0;
  font-weight: 600;
  color: #1e293b;
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
  cursor: pointer;
  font-family: inherit;
}
.tree-node-actions { display: flex; gap: 2px; justify-content: flex-end; }

.tree-edge-label { background: #f0f9ff; padding: 2px 8px; border-radius: 6px; font-size: 11px; color: #475569; border: 1px solid #e2e8f0; white-space: nowrap; }

:deep(.vue-flow) { background: transparent; }
:deep(.vue-flow__edge-path) { stroke-width: 2.5; }
:deep(.vue-flow__handle) { width: 12px; height: 12px; background: #165DFF; border: 2px solid #fff; }

.node-property-panel { width: 260px; flex-shrink: 0; background: #fff; border-radius: 12px; padding: 16px; box-shadow: -2px 0 12px rgba(0,0,0,0.04); overflow-y: auto; }
.panel-title { font-size: 16px; font-weight: 700; color: #1e293b; margin-bottom: 16px; }

.slide-right-enter-active, .slide-right-leave-active { transition: all 0.3s ease; }
.slide-right-enter-from, .slide-right-leave-to { transform: translateX(100%); opacity: 0; }

.json-textarea :deep(.el-textarea__inner) { font-family: 'Monaco', 'Menlo', monospace; font-size: 13px; }
</style>