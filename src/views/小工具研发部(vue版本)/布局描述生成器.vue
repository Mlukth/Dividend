<template>
  <div class="layout-generator">
    <!-- 工具栏 -->
    <div class="toolbar">
      <h2>🧩 ComposeForge · Vue 布局工坊</h2>
      <div class="actions">
        <select v-model="currentPreset" @change="applyPreset" class="preset-select">
          <option value="">🎨 手动布局</option>
          <option value="preset1">📐 方案一：左右分栏</option>
          <option value="preset2">📊 方案二：顶部工作流</option>
          <option value="preset3">🗂️ 方案三：标签页式</option>
        </select>

        <button @click="addComponent('container')">加容器</button>
        <button @click="addComponent('card')">加卡片</button>
        <button @click="addComponent('button')">加按钮</button>
        <button @click="openImportDialog">📥 导入 AI 方案</button>
        <button @click="saveCurrentAsScheme">💾 保存当前为方案</button>
        <button class="danger" @click="clearCanvas">清空画布</button>
        
        <!-- 新增：折叠右侧面板按钮 -->
        <button @click="rightPanelCollapsed = !rightPanelCollapsed" class="toggle-right-btn">
          {{ rightPanelCollapsed ? '◀ 显示右侧' : '▶ 隐藏右侧' }}
        </button>
      </div>
    </div>

    <!-- 工作区 -->
    <div class="workspace">
      <!-- 左侧：画布 + 方案库 -->
      <div class="left-area" :class="{ 'library-collapsed': libraryCollapsed }">
        <div class="canvas-container">
          <div class="canvas-header">
            <span>画布区域 (空格+拖拽 / 中键拖拽平移)</span>
            <span class="canvas-coords">偏移: ({{ canvasOffsetX }}, {{ canvasOffsetY }})</span>
          </div>
          <div
            class="canvas"
            ref="canvasRef"
            @mousemove="onCanvasMouseMove"
            @mouseup="onCanvasMouseUp"
            @mousedown="onCanvasMouseDown"
            :class="{ 'panning': isPanning }"
            :style="{ transform: `translate(${canvasOffsetX}px, ${canvasOffsetY}px)` }"
          >
            <!-- 智能参考线层 -->
            <div
              v-for="line in smartLines"
              :key="line.id"
              :class="['smart-line', line.type]"
              :style="{
                left: line.left + 'px',
                top: line.top + 'px',
                width: line.width + 'px',
                height: line.height + 'px'
              }"
            ></div>

            <!-- 组件列表 -->
            <div
              v-for="(comp, index) in components"
              :key="comp.id"
              :class="['draggable-item', { selected: selectedIndex === index, dragging: draggingIndex === index }]"
              :style="{
                left: comp.x + 'px',
                top: comp.y + 'px',
                width: comp.w + 'px',
                height: comp.h + 'px',
                backgroundColor: comp.color,
                cursor: draggingIndex === index ? 'grabbing' : 'grab'
              }"
              @mousedown.stop="startDrag($event, index)"
              @click.stop="selectComponent(index)"
            >
              <div class="item-content">{{ comp.label }}</div>
              <div
                v-if="selectedIndex === index"
                class="resize-handle"
                @mousedown.stop="startResize($event, index)"
              ></div>
              <button class="delete-btn" @click.stop="removeComponent(index)">×</button>
            </div>
          </div>
        </div>

        <!-- 方案库面板（可向下折叠） -->
        <div class="scheme-library" :class="{ collapsed: libraryCollapsed }">
          <div class="library-header">
            <span>📚 方案库 ({{ savedSchemes.length }})</span>
            <div class="header-actions">
              <el-button v-if="!libraryCollapsed" type="text" size="small" @click="clearAllSchemes" :disabled="savedSchemes.length === 0">
                清空全部
              </el-button>
              <el-button type="text" size="small" @click="toggleLibrary" class="collapse-toggle">
                {{ libraryCollapsed ? '▲' : '▼' }}
              </el-button>
            </div>
          </div>
          <div class="library-list" v-show="!libraryCollapsed">
            <!-- 方案列表内容保持不变 -->
            <div
              v-for="(scheme, idx) in savedSchemes"
              :key="scheme.id"
              class="scheme-item"
              :class="{ active: activeSchemeId === scheme.id }"
              @click="loadScheme(scheme.id)"
            >
              <div class="scheme-info">
                <span class="scheme-name" @dblclick="startRenameScheme(scheme.id)" v-if="renamingId !== scheme.id">
                  {{ scheme.name }}
                </span>
                <el-input
                  v-else
                  v-model="renameTemp"
                  size="small"
                  @blur="finishRename(scheme.id)"
                  @keyup.enter="finishRename(scheme.id)"
                  ref="renameInput"
                />
                <span class="scheme-meta">{{ scheme.components.length }} 组件</span>
              </div>
              <div class="scheme-actions">
                <el-button type="text" size="small" @click.stop="duplicateScheme(scheme.id)">复制</el-button>
                <el-button type="text" size="small" @click.stop="deleteScheme(scheme.id)">删除</el-button>
              </div>
            </div>
            <div v-if="savedSchemes.length === 0" class="library-empty">
              暂无方案
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧面板组（整体可向右折叠） -->
      <div class="right-panels" v-show="!rightPanelCollapsed">
        <!-- 布局描述输出（可独立折叠） -->
        <div class="output-container" :class="{ collapsed: outputCollapsed }">
          <div class="output-header">
            <span>📝 当前布局描述</span>
            <div class="header-actions">
              <button class="copy-btn" @click="copyPrompt" v-if="!outputCollapsed">复制</button>
              <el-button type="text" size="small" @click="outputCollapsed = !outputCollapsed" class="collapse-toggle">
                {{ outputCollapsed ? '▼' : '▲' }}
              </el-button>
            </div>
          </div>
          <div class="output-content" v-show="!outputCollapsed">
            <pre>{{ generatedPrompt }}</pre>
          </div>
        </div>

        <!-- AI 提示词生成器（可独立折叠） -->
        <div class="prompt-generator" :class="{ collapsed: promptCollapsed }">
          <div class="prompt-header">
            <span>🤖 AI 提示词生成器</span>
            <div class="header-actions">
              <el-button v-if="!promptCollapsed" type="primary" size="small" @click="showPromptDialog = true">
                <el-icon><Edit /></el-icon> 编辑
              </el-button>
              <el-button type="text" size="small" @click="promptCollapsed = !promptCollapsed" class="collapse-toggle">
                {{ promptCollapsed ? '▼' : '▲' }}
              </el-button>
            </div>
          </div>
          <div class="prompt-body" v-show="!promptCollapsed">
            <el-input
              v-model="userCodeInput"
              type="textarea"
              :rows="5"
              placeholder="在此粘贴你的 Vue 组件代码（.vue 文件内容），以及任何额外要求..."
              class="code-input"
            />
            <el-button type="primary" class="generate-btn" @click="combineAndCopyFullPrompt">
              <el-icon><CopyDocument /></el-icon> 生成并复制完整提示词
            </el-button>
            <p class="hint">点击后拼接：预设提示词 + 当前布局描述 + 上方输入内容，复制到剪贴板。</p>
          </div>
        </div>
      </div>
      
      <!-- 右侧面板折叠后的窄条提示（可选） -->
      <div v-if="rightPanelCollapsed" class="right-panels-collapsed-placeholder">
        <el-button type="text" @click="rightPanelCollapsed = false" class="expand-btn">
          ◀ 展开<br>面板
        </el-button>
      </div>
    </div>

    <!-- 对话框部分保持不变（省略以节省篇幅，实际使用请保留完整） -->
    <!-- 导入布局方案对话框 -->
    <!-- 预设提示词编辑弹窗 -->
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, CopyDocument, Search } from '@element-plus/icons-vue'

// ==================== 原生 ID 生成 ====================
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

// ==================== 状态管理 ====================
const canvasRef = ref(null)
const components = ref([])
let idCounter = 0

const selectedIndex = ref(-1)
const copiedComponent = ref(null)

const draggingIndex = ref(-1)
const resizingIndex = ref(-1)
const dragStart = ref({ x: 0, y: 0, compX: 0, compY: 0, relX: 0, relY: 0 })
const resizeStart = ref({ x: 0, y: 0, w: 0, h: 0, compX: 0, compY: 0 })

const smartLines = ref([])
const threshold = 5

// 画布平移相关
const canvasOffsetX = ref(0)
const canvasOffsetY = ref(0)
const isPanning = ref(false)
const panStart = ref({ x: 0, y: 0, offsetX: 0, offsetY: 0 })
const isSpacePressed = ref(false)

// 面板折叠状态
const libraryCollapsed = ref(localStorage.getItem('ui_libraryCollapsed') === 'true')
const outputCollapsed = ref(localStorage.getItem('ui_outputCollapsed') === 'true')
const promptCollapsed = ref(localStorage.getItem('ui_promptCollapsed') === 'true')
const rightPanelCollapsed = ref(localStorage.getItem('ui_rightPanelCollapsed') === 'true')

const saveUIConfig = () => {
  localStorage.setItem('ui_libraryCollapsed', libraryCollapsed.value)
  localStorage.setItem('ui_outputCollapsed', outputCollapsed.value)
  localStorage.setItem('ui_promptCollapsed', promptCollapsed.value)
  localStorage.setItem('ui_rightPanelCollapsed', rightPanelCollapsed.value)
}

watch([libraryCollapsed, outputCollapsed, promptCollapsed, rightPanelCollapsed], saveUIConfig)

const toggleLibrary = () => {
  libraryCollapsed.value = !libraryCollapsed.value
}

const typeMap = {
  container: { label: '容器', w: 200, h: 200, color: '#e3f2fd' },
  card: { label: '卡片', w: 120, h: 80, color: '#fff3e0' },
  button: { label: '按钮', w: 80, h: 40, color: '#e8f5e9' }
}

const currentPreset = ref('')

const presets = {
  preset1: [
    { type: 'container', label: '左侧工作区', x: 30, y: 30, w: 380, h: 700, color: '#e3f2fd' },
    { type: 'card', label: '语音输入卡片', x: 50, y: 50, w: 340, h: 120, color: '#fff3e0' },
    { type: 'card', label: 'AI导入面板', x: 50, y: 190, w: 340, h: 120, color: '#fff3e0' },
    { type: 'container', label: '右侧视图区', x: 440, y: 30, w: 530, h: 700, color: '#f3e5f5' },
    { type: 'button', label: '时间轴切换', x: 460, y: 50, w: 100, h: 40, color: '#e8f5e9' },
    { type: 'button', label: '流程图切换', x: 570, y: 50, w: 100, h: 40, color: '#e8f5e9' },
    { type: 'card', label: '任务卡片列表', x: 460, y: 110, w: 490, h: 600, color: '#fff9c4' }
  ],
  preset2: [
    { type: 'container', label: '顶部工具栏', x: 30, y: 30, w: 940, h: 150, color: '#e3f2fd' },
    { type: 'card', label: '需求输入', x: 50, y: 50, w: 400, h: 110, color: '#fff3e0' },
    { type: 'card', label: 'AI结果导入', x: 470, y: 50, w: 480, h: 110, color: '#fff3e0' },
    { type: 'container', label: '主视图区', x: 30, y: 200, w: 940, h: 530, color: '#f3e5f5' },
    { type: 'button', label: '时间轴', x: 50, y: 220, w: 80, h: 40, color: '#e8f5e9' },
    { type: 'button', label: '流程图', x: 140, y: 220, w: 80, h: 40, color: '#e8f5e9' },
    { type: 'card', label: '视图内容', x: 50, y: 280, w: 900, h: 430, color: '#fff9c4' }
  ],
  preset3: [
    { type: 'container', label: '左侧选项卡栏', x: 30, y: 30, w: 200, h: 700, color: '#e8eaf6' },
    { type: 'button', label: '任务生成', x: 45, y: 50, w: 170, h: 50, color: '#c5cae9' },
    { type: 'button', label: '任务库', x: 45, y: 110, w: 170, h: 50, color: '#c5cae9' },
    { type: 'button', label: '配置', x: 45, y: 170, w: 170, h: 50, color: '#c5cae9' },
    { type: 'container', label: '右侧主视图', x: 260, y: 30, w: 710, h: 700, color: '#f3e5f5' },
    { type: 'card', label: '需求输入', x: 280, y: 50, w: 670, h: 120, color: '#fff3e0' },
    { type: 'card', label: 'AI导入', x: 280, y: 190, w: 670, h: 120, color: '#fff3e0' },
    { type: 'card', label: '时间轴/流程图视图', x: 280, y: 330, w: 670, h: 380, color: '#fff9c4' }
  ]
}

// ==================== 画布平移逻辑 ====================
const onCanvasMouseDown = (e) => {
  if (e.button === 1 || (isSpacePressed.value && e.button === 0)) {
    e.preventDefault()
    isPanning.value = true
    panStart.value = {
      x: e.clientX,
      y: e.clientY,
      offsetX: canvasOffsetX.value,
      offsetY: canvasOffsetY.value
    }
  }
}

const getCanvasRelativeCoords = (clientX, clientY) => {
  const canvas = canvasRef.value
  if (!canvas) return { x: 0, y: 0 }
  const rect = canvas.getBoundingClientRect()
  return {
    x: clientX - rect.left - canvasOffsetX.value,
    y: clientY - rect.top - canvasOffsetY.value
  }
}

// ==================== 原有拖拽/调整大小逻辑 ====================
const applyPreset = () => {
  if (!currentPreset.value) return
  const presetData = presets[currentPreset.value]
  if (!presetData) return
  components.value = []
  idCounter = 0
  presetData.forEach((item) => {
    components.value.push({
      id: idCounter++,
      type: item.type,
      label: item.label,
      x: item.x,
      y: item.y,
      w: item.w,
      h: item.h,
      color: item.color
    })
  })
  selectedIndex.value = -1
  smartLines.value = []
  activeSchemeId.value = null
  canvasOffsetX.value = 0
  canvasOffsetY.value = 0
}

const addComponent = (type) => {
  const config = typeMap[type]
  components.value.push({
    id: idCounter++,
    type,
    label: `${config.label}${idCounter}`,
    x: 50 + (idCounter % 5) * 30,
    y: 50 + Math.floor(idCounter / 5) * 30,
    w: config.w,
    h: config.h,
    color: config.color
  })
}

const removeComponent = (index) => {
  components.value.splice(index, 1)
  if (selectedIndex.value === index) {
    selectedIndex.value = -1
  } else if (selectedIndex.value > index) {
    selectedIndex.value--
  }
}

const clearCanvas = () => {
  if (confirm('确定清空所有组件吗？')) {
    components.value = []
    idCounter = 0
    selectedIndex.value = -1
    smartLines.value = []
    currentPreset.value = ''
    activeSchemeId.value = null
    canvasOffsetX.value = 0
    canvasOffsetY.value = 0
  }
}

const selectComponent = (index) => {
  selectedIndex.value = index
}

const startDrag = (e, index) => {
  e.preventDefault()
  draggingIndex.value = index
  const comp = components.value[index]
  const rel = getCanvasRelativeCoords(e.clientX, e.clientY)
  dragStart.value = {
    x: e.clientX,
    y: e.clientY,
    compX: comp.x,
    compY: comp.y,
    relX: rel.x,
    relY: rel.y
  }
  selectComponent(index)
}

const startResize = (e, index) => {
  e.preventDefault()
  resizingIndex.value = index
  const comp = components.value[index]
  resizeStart.value = {
    x: e.clientX,
    y: e.clientY,
    w: comp.w,
    h: comp.h,
    compX: comp.x,
    compY: comp.y
  }
}

const onCanvasMouseMove = (e) => {
  if (isPanning.value) {
    const dx = e.clientX - panStart.value.x
    const dy = e.clientY - panStart.value.y
    canvasOffsetX.value = panStart.value.offsetX + dx
    canvasOffsetY.value = panStart.value.offsetY + dy
    return
  }

  if (draggingIndex.value !== -1) {
    handleDrag(e)
  } else if (resizingIndex.value !== -1) {
    handleResize(e)
  }
}

const handleDrag = (e) => {
  const index = draggingIndex.value
  const comp = components.value[index]
  const rel = getCanvasRelativeCoords(e.clientX, e.clientY)

  const newX = rel.x - (dragStart.value.relX - dragStart.value.compX)
  const newY = rel.y - (dragStart.value.relY - dragStart.value.compY)

  const canvas = canvasRef.value
  const maxX = canvas.clientWidth - comp.w
  const maxY = canvas.clientHeight - comp.h

  comp.x = Math.max(0, Math.min(newX, maxX))
  comp.y = Math.max(0, Math.min(newY, maxY))

  updateSmartLines(index, comp.x, comp.y, comp.w, comp.h)
}

const handleResize = (e) => {
  const index = resizingIndex.value
  const comp = components.value[index]
  const dx = e.clientX - resizeStart.value.x
  const dy = e.clientY - resizeStart.value.y
  comp.w = Math.max(40, resizeStart.value.w + dx)
  comp.h = Math.max(30, resizeStart.value.h + dy)
  updateSmartLines(index, comp.x, comp.y, comp.w, comp.h)
}

const onCanvasMouseUp = () => {
  if (isPanning.value) {
    isPanning.value = false
    return
  }
  if (draggingIndex.value !== -1 || resizingIndex.value !== -1) {
    draggingIndex.value = -1
    resizingIndex.value = -1
    smartLines.value = []
  }
}

const updateSmartLines = (index, x, y, w, h) => {
  const canvas = canvasRef.value
  if (!canvas) return
  const canvasWidth = canvas.clientWidth
  const canvasHeight = canvas.clientHeight
  smartLines.value = []
  let lineId = 0
  const others = components.value.filter((_, i) => i !== index)
  others.forEach((other) => {
    const current = {
      left: x,
      right: x + w,
      top: y,
      bottom: y + h,
      centerX: x + w / 2,
      centerY: y + h / 2
    }
    const target = {
      left: other.x,
      right: other.x + other.w,
      top: other.y,
      bottom: other.y + other.h,
      centerX: other.x + other.w / 2,
      centerY: other.y + other.h / 2
    }
    const checkXAlign = (currentVal, targetVal, isCenter = false) => {
      if (Math.abs(currentVal - targetVal) < threshold) {
        smartLines.value.push({
          id: lineId++,
          type: isCenter ? 'vertical center' : 'vertical edge',
          left: targetVal,
          top: 0,
          width: 1,
          height: canvasHeight
        })
      }
    }
    checkXAlign(current.left, target.left)
    checkXAlign(current.left, target.right)
    checkXAlign(current.right, target.left)
    checkXAlign(current.right, target.right)
    checkXAlign(current.centerX, target.centerX, true)
    const checkYAlign = (currentVal, targetVal, isCenter = false) => {
      if (Math.abs(currentVal - targetVal) < threshold) {
        smartLines.value.push({
          id: lineId++,
          type: isCenter ? 'horizontal center' : 'horizontal edge',
          left: 0,
          top: targetVal,
          width: canvasWidth,
          height: 1
        })
      }
    }
    checkYAlign(current.top, target.top)
    checkYAlign(current.top, target.bottom)
    checkYAlign(current.bottom, target.top)
    checkYAlign(current.bottom, target.bottom)
    checkYAlign(current.centerY, target.centerY, true)
  })
}

const generatedPrompt = computed(() => {
  if (components.value.length === 0) {
    return '当前画布为空，请添加组件或选择预设方案。'
  }
  let desc = '当前画布包含以下组件（抽象方块）：\n'
  components.value.forEach((comp) => {
    desc += `- ${comp.label}：位于 (${Math.round(comp.x)}, ${Math.round(comp.y)})，尺寸 ${comp.w}x${comp.h}px\n`
  })
  return desc
})

const copyPrompt = async () => {
  try {
    await navigator.clipboard.writeText(generatedPrompt.value)
    ElMessage.success('布局描述已复制')
  } catch {
    ElMessage.error('复制失败')
  }
}

// ==================== 方案库管理 ====================
const savedSchemes = ref([])
const activeSchemeId = ref(null)
const renamingId = ref(null)
const renameTemp = ref('')
const renameInput = ref(null)

const loadSchemesFromStorage = () => {
  const stored = localStorage.getItem('composeforge_schemes')
  if (stored) {
    try {
      savedSchemes.value = JSON.parse(stored)
    } catch {}
  }
  if (savedSchemes.value.length === 0) {
    const defaultSchemes = [
      { id: generateId(), name: '示例：左右分栏', components: presets.preset1, createdAt: Date.now() },
      { id: generateId(), name: '示例：顶部工作流', components: presets.preset2, createdAt: Date.now() },
      { id: generateId(), name: '示例：标签页式', components: presets.preset3, createdAt: Date.now() }
    ]
    savedSchemes.value = defaultSchemes
    saveSchemesToStorage()
  }
}

const saveSchemesToStorage = () => {
  localStorage.setItem('composeforge_schemes', JSON.stringify(savedSchemes.value))
}

const saveCurrentAsScheme = () => {
  if (components.value.length === 0) {
    ElMessage.warning('画布为空，无法保存')
    return
  }
  ElMessageBox.prompt('请输入方案名称', '保存方案', {
    confirmButtonText: '保存',
    cancelButtonText: '取消',
    inputValue: `方案 ${savedSchemes.value.length + 1}`
  }).then(({ value }) => {
    const name = value.trim()
    if (!name) {
      ElMessage.warning('名称不能为空')
      return
    }
    const componentsCopy = JSON.parse(JSON.stringify(components.value))
    const newScheme = {
      id: generateId(),
      name,
      components: componentsCopy,
      createdAt: Date.now()
    }
    savedSchemes.value.push(newScheme)
    saveSchemesToStorage()
    activeSchemeId.value = newScheme.id
    ElMessage.success(`方案“${name}”已保存`)
  }).catch(() => {})
}

const loadScheme = (schemeId) => {
  const scheme = savedSchemes.value.find(s => s.id === schemeId)
  if (!scheme) return
  const componentsCopy = JSON.parse(JSON.stringify(scheme.components))
  components.value = componentsCopy.map(comp => ({
    ...comp,
    id: idCounter++
  }))
  selectedIndex.value = -1
  smartLines.value = []
  activeSchemeId.value = schemeId
  currentPreset.value = ''
  canvasOffsetX.value = 0
  canvasOffsetY.value = 0
  ElMessage.success(`已加载方案：${scheme.name}`)
}

const deleteScheme = (schemeId) => {
  ElMessageBox.confirm('确定删除此方案吗？', '确认删除', { type: 'warning' })
    .then(() => {
      const index = savedSchemes.value.findIndex(s => s.id === schemeId)
      if (index !== -1) {
        savedSchemes.value.splice(index, 1)
        saveSchemesToStorage()
        if (activeSchemeId.value === schemeId) activeSchemeId.value = null
        ElMessage.success('方案已删除')
      }
    }).catch(() => {})
}

const duplicateScheme = (schemeId) => {
  const scheme = savedSchemes.value.find(s => s.id === schemeId)
  if (!scheme) return
  const newScheme = {
    ...JSON.parse(JSON.stringify(scheme)),
    id: generateId(),
    name: `${scheme.name} (副本)`,
    createdAt: Date.now()
  }
  savedSchemes.value.push(newScheme)
  saveSchemesToStorage()
  ElMessage.success(`已复制方案：${newScheme.name}`)
}

const startRenameScheme = (schemeId) => {
  const scheme = savedSchemes.value.find(s => s.id === schemeId)
  if (!scheme) return
  renamingId.value = schemeId
  renameTemp.value = scheme.name
  nextTick(() => {
    if (renameInput.value) renameInput.value.focus()
  })
}

const finishRename = (schemeId) => {
  const scheme = savedSchemes.value.find(s => s.id === schemeId)
  if (!scheme) { renamingId.value = null; return }
  const newName = renameTemp.value.trim()
  if (newName && newName !== scheme.name) {
    scheme.name = newName
    saveSchemesToStorage()
    ElMessage.success('名称已更新')
  }
  renamingId.value = null
}

const clearAllSchemes = () => {
  ElMessageBox.confirm('确定清空所有方案吗？此操作不可恢复！', '警告', { type: 'error' })
    .then(() => {
      savedSchemes.value = []
      saveSchemesToStorage()
      activeSchemeId.value = null
      ElMessage.success('已清空方案库')
    }).catch(() => {})
}

// ==================== 导入对话框 ====================
const importDialogVisible = ref(false)
const importTab = ref('smart')
const aiFullResponse = ref('')
const importJsonText = ref('')
const manualSchemeName = ref('')
const parsedSchemes = ref([])
const selectedSchemeIndexes = ref([])
const parseError = ref('')

const openImportDialog = () => {
  importTab.value = 'smart'
  aiFullResponse.value = ''
  importJsonText.value = ''
  manualSchemeName.value = ''
  parsedSchemes.value = []
  selectedSchemeIndexes.value = []
  parseError.value = ''
  importDialogVisible.value = true
}

const parseAIResponse = () => {
  const text = aiFullResponse.value.trim()
  if (!text) { parseError.value = '请粘贴 AI 回答内容'; return }
  parseError.value = ''
  parsedSchemes.value = []
  const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)```/g
  const matches = [...text.matchAll(codeBlockRegex)]
  let candidates = []
  if (matches.length > 0) {
    candidates = matches.map(m => m[1].trim())
  } else {
    const arrayRegex = /\[\s*\{[\s\S]*?\}\s*\]/g
    candidates = text.match(arrayRegex) || []
  }
  const schemes = []
  candidates.forEach((candidate) => {
    try {
      let cleanCandidate = candidate.replace(/\/\/.*$/gm, '').replace(/,(\s*[}\]])/g, '$1')
      const parsed = JSON.parse(cleanCandidate)
      if (Array.isArray(parsed) && parsed.length > 0) {
        const isValid = parsed.every(item => item.type && item.label && typeof item.x === 'number')
        if (isValid) {
          let name = ''
          const blockIndex = text.indexOf(candidate)
          if (blockIndex > 0) {
            const beforeBlock = text.substring(0, blockIndex)
            const lines = beforeBlock.split('\n')
            for (let i = lines.length - 1; i >= 0; i--) {
              const line = lines[i].trim()
              if (line.startsWith('//') && (line.includes('方案') || line.includes('布局'))) {
                name = line.replace(/^\/\/\s*/, '').trim()
                break
              } else if (line.match(/^方案[一二三四五六七八九十\d]+[：:]/)) {
                name = line.trim()
                break
              }
            }
          }
          schemes.push({ name: name || `方案 ${schemes.length + 1}`, components: parsed, rawJson: candidate })
        }
      }
    } catch (e) {}
  })
  if (schemes.length === 0) {
    parseError.value = '未找到有效的 JSON 布局方案'
  } else {
    parsedSchemes.value = schemes
    selectedSchemeIndexes.value = schemes.map((_, idx) => idx)
    ElMessage.success(`成功解析 ${schemes.length} 个布局方案`)
  }
}

const selectAllParsed = () => { selectedSchemeIndexes.value = parsedSchemes.value.map((_, idx) => idx) }
const deselectAllParsed = () => { selectedSchemeIndexes.value = [] }

const applySelectedSchemes = () => {
  if (importTab.value === 'smart') {
    if (selectedSchemeIndexes.value.length === 0) { ElMessage.warning('请至少选择一个方案'); return }
    let importedCount = 0
    selectedSchemeIndexes.value.forEach(idx => {
      const scheme = parsedSchemes.value[idx]
      let finalName = scheme.name
      let counter = 1
      while (savedSchemes.value.some(s => s.name === finalName)) {
        finalName = `${scheme.name} (${counter})`
        counter++
      }
      const newScheme = {
        id: generateId(),
        name: finalName,
        components: JSON.parse(JSON.stringify(scheme.components)),
        createdAt: Date.now()
      }
      savedSchemes.value.push(newScheme)
      importedCount++
    })
    saveSchemesToStorage()
    ElMessage.success(`成功导入 ${importedCount} 个方案`)
  } else {
    try {
      const data = JSON.parse(importJsonText.value)
      if (!Array.isArray(data)) throw new Error('必须是数组格式')
      data.forEach(item => { if (!item.type || !item.label || item.x === undefined) throw new Error('字段缺失') })
      const name = manualSchemeName.value.trim() || `手动导入 ${new Date().toLocaleTimeString()}`
      const newScheme = { id: generateId(), name, components: JSON.parse(JSON.stringify(data)), createdAt: Date.now() }
      savedSchemes.value.push(newScheme)
      saveSchemesToStorage()
      ElMessage.success(`方案“${name}”已导入`)
    } catch (e) {
      ElMessage.error('JSON 解析失败：' + e.message)
      return
    }
  }
  importDialogVisible.value = false
}

// ==================== AI 提示词生成器 ====================
const showPromptDialog = ref(false)
const userCodeInput = ref('')

const defaultSystemPrompt = `你是一位资深的前端布局架构师。请根据我提供的 Vue 组件代码，分析现有组件，并设计 2~3 种优化布局方案。

## 输出协议（必须严格遵守）

请按以下格式输出每个布局方案：

// 方案名称（例如：方案一：左右分栏）
\`\`\`json
[
  { "type": "container", "label": "组件显示名", "x": 30, "y": 30, "w": 400, "h": 300, "color": "#e3f2fd" },
  ...
]
\`\`\`

### 格式要求
1. 每个方案前必须有一行注释（以 // 开头）写明方案名称。
2. JSON 数组中的每个对象必须包含以下字段：
   - type: "container" | "card" | "button"
   - label: 字符串，方块显示文字（应反映真实组件功能）
   - x, y, w, h: 数字，坐标和尺寸（基于 1000x800 画布参考）
   - color: 十六进制颜色，自行分配柔和色系
3. 每个方案单独一个代码块。
4. 在 JSON 之后，可以用简短文字说明方案优缺点。

## 第一步：分析现有组件
请列出所有识别到的独立组件及其功能角色。

## 第二步：输出布局方案
严格按照上述协议输出 2~3 个方案。

请开始。`

const promptConfig = ref({ systemPrompt: defaultSystemPrompt })

const savePromptConfig = () => {
  localStorage.setItem('layout_ai_prompt', JSON.stringify(promptConfig.value))
  showPromptDialog.value = false
  ElMessage.success('预设提示词已保存')
}

const combineAndCopyFullPrompt = async () => {
  const basePrompt = promptConfig.value.systemPrompt
  const layoutDesc = generatedPrompt.value
  const userInput = userCodeInput.value.trim()
  if (!userInput) { ElMessage.warning('请先粘贴组件代码或额外说明'); return }
  const fullPrompt = `${basePrompt}

---

## 当前画布参考布局（仅供参考，非必须遵循）
${layoutDesc}

---

## 提供的 Vue 组件代码及额外要求
${userInput}

---

请开始分析并严格按照输出协议输出布局方案。`
  try {
    await navigator.clipboard.writeText(fullPrompt)
    ElMessage.success('✅ 完整提示词已复制到剪贴板！')
  } catch {
    ElMessage.error('复制失败，请手动复制')
  }
}

// ==================== 键盘事件 ====================
const handleKeyDown = (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
    if (selectedIndex.value !== -1) copiedComponent.value = JSON.parse(JSON.stringify(components.value[selectedIndex.value]))
  }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
    if (copiedComponent.value) {
      components.value.push({
        ...copiedComponent.value,
        id: idCounter++,
        label: copiedComponent.value.label.replace(/\d+$/, '') + idCounter,
        x: copiedComponent.value.x + 20,
        y: copiedComponent.value.y + 20
      })
      selectedIndex.value = components.value.length - 1
    }
  }
  if (e.key === 'Escape') selectedIndex.value = -1
  if (e.key === 'Delete' || e.key === 'Backspace') {
    if (selectedIndex.value !== -1 && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      removeComponent(selectedIndex.value)
    }
  }
}

const handleGlobalKeyDown = (e) => {
  if (e.code === 'Space' && !isSpacePressed.value) {
    e.preventDefault()
    isSpacePressed.value = true
  }
}

const handleGlobalKeyUp = (e) => {
  if (e.code === 'Space') {
    isSpacePressed.value = false
  }
}

// ==================== 生命周期 ====================
onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keydown', handleGlobalKeyDown)
  window.addEventListener('keyup', handleGlobalKeyUp)
  window.addEventListener('mouseup', onCanvasMouseUp)

  loadSchemesFromStorage()
  const savedPrompt = localStorage.getItem('layout_ai_prompt')
  if (savedPrompt) {
    try { promptConfig.value = JSON.parse(savedPrompt) } catch {}
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('keydown', handleGlobalKeyDown)
  window.removeEventListener('keyup', handleGlobalKeyUp)
  window.removeEventListener('mouseup', onCanvasMouseUp)
})
</script>

<style scoped>
.layout-generator {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f7fa;
  font-family: sans-serif;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
}

.toolbar h2 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.preset-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  font-size: 14px;
  cursor: pointer;
  margin-right: 8px;
}

.actions button {
  padding: 8px 14px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background-color: #42b983;
  color: white;
  font-size: 14px;
  transition: 0.2s;
  white-space: nowrap;
}

.actions button:hover {
  opacity: 0.85;
}

.actions button.danger {
  background-color: #ff5252;
}

.toggle-right-btn {
  background-color: #6c757d !important;
}

.workspace {
  display: flex;
  flex: 1;
  padding: 20px;
  gap: 20px;
  overflow: hidden;
}

.left-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
  transition: all 0.3s ease;
}

.canvas-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 200px;
}

/* 方案库折叠时，画布容器自动扩展 */
.left-area.library-collapsed .canvas-container {
  flex: 1;
}

.canvas-header {
  padding: 12px 20px;
  background: #fafafa;
  border-bottom: 1px solid #eee;
  font-weight: bold;
  color: #666;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.canvas-coords {
  font-size: 12px;
  color: #888;
  font-weight: normal;
}

.canvas {
  flex: 1;
  position: relative;
  background-image: linear-gradient(#f0f0f0 1px, transparent 1px),
    linear-gradient(90deg, #f0f0f0 1px, transparent 1px);
  background-size: 20px 20px;
  overflow: hidden;
  user-select: none;
  transition: transform 0.05s ease-out;
  will-change: transform;
}

.canvas.panning {
  cursor: grabbing !important;
}

.scheme-library {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  height: 250px;
  min-height: 250px;
  overflow: hidden;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.scheme-library.collapsed {
  height: 50px !important;
  min-height: 50px !important;
}

.library-header {
  padding: 12px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  color: #333;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.collapse-toggle {
  padding: 4px 8px;
  font-size: 14px;
}

.library-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.scheme-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  margin-bottom: 4px;
  background: #f9f9f9;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s;
}

.scheme-item:hover {
  background: #f0f0f0;
}

.scheme-item.active {
  background: #e3f2fd;
  border-color: #42b983;
}

.scheme-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.scheme-name {
  font-weight: 500;
  color: #333;
}

.scheme-meta {
  font-size: 12px;
  color: #888;
}

.scheme-actions {
  display: flex;
  gap: 8px;
}

.library-empty {
  text-align: center;
  color: #999;
  padding: 20px;
}

.right-panels {
  width: 380px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
  transition: all 0.3s ease;
}

.right-panels-collapsed-placeholder {
  width: 40px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  cursor: pointer;
}

.expand-btn {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #42b983;
  font-size: 12px;
}

.output-container {
  background: #2d3436;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 40%;
  transition: all 0.3s ease;
}

.output-container.collapsed {
  height: 50px !important;
  min-height: 50px;
}

.output-header {
  padding: 12px 20px;
  background: #212529;
  color: #adb5bd;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.copy-btn {
  background: #0984e3;
  color: white;
  border: none;
  padding: 4px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.output-content {
  flex: 1;
  padding: 16px;
  overflow: auto;
}

.output-content pre {
  margin: 0;
  color: #dfe6e9;
  font-family: 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-wrap;
}

.prompt-generator {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  height: 60%;
  transition: all 0.3s ease;
}

.prompt-generator.collapsed {
  height: 50px !important;
  min-height: 50px;
}

.prompt-header {
  padding: 12px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  color: #333;
}

.prompt-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
}

.code-input :deep(.el-textarea__inner) {
  font-family: 'Consolas', monospace;
  font-size: 13px;
  border-radius: 8px;
}

.generate-btn {
  width: 100%;
  border-radius: 8px;
  padding: 12px;
}

.hint {
  font-size: 12px;
  color: #888;
  text-align: center;
  margin: 0;
}

.scheme-list-title {
  font-weight: bold;
  margin-bottom: 12px;
  color: #333;
}

.scheme-checkbox-group {
  width: 100%;
  max-height: 300px;
  overflow-y: auto;
}

.smart-line {
  position: absolute;
  pointer-events: none;
  z-index: 999;
}

.smart-line.vertical {
  width: 1px;
  height: 100%;
}

.smart-line.horizontal {
  width: 100%;
  height: 1px;
}

.smart-line.edge {
  background-color: #3498db;
}

.smart-line.center {
  background-color: #e74c3c;
}

.draggable-item {
  position: absolute;
  border: 2px dashed #666;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 2px 2px 10px rgba(0,0,0,0.1);
  transition: box-shadow 0.2s;
}

.draggable-item:hover {
  box-shadow: 4px 4px 15px rgba(0,0,0,0.2);
}

.draggable-item.selected {
  border-color: #42b983;
  border-style: solid;
  box-shadow: 0 0 0 3px rgba(66,185,131,0.3);
}

.draggable-item.dragging {
  border-style: solid;
  border-color: #42b983;
  opacity: 0.9;
}

.item-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  font-weight: bold;
  color: #555;
}

.delete-btn {
  position: absolute;
  top: 2px;
  right: 6px;
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #999;
}

.delete-btn:hover {
  color: #ff5252;
}

.resize-handle {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 16px;
  height: 16px;
  background: linear-gradient(135deg, transparent 50%, #42b983 50%);
  cursor: se-resize;
  border-radius: 0 0 6px 0;
}
</style>