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
      </div>
    </div>

    <!-- 工作区 -->
    <div class="workspace">
      <!-- 左侧：画布 + 方案库 -->
      <div class="left-area">
        <div class="canvas-container">
          <div class="canvas-header">画布区域 (拖拽调整位置/大小)</div>
          <div class="canvas" ref="canvasRef" @mousemove="onCanvasMouseMove" @mouseup="onCanvasMouseUp">
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

        <!-- 方案库面板 -->
        <div class="scheme-library">
          <div class="library-header">
            <span>📚 方案库 ({{ savedSchemes.length }})</span>
            <el-button type="text" size="small" @click="clearAllSchemes" :disabled="savedSchemes.length === 0">
              清空全部
            </el-button>
          </div>
          <div class="library-list">
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
              暂无方案，点击“保存当前为方案”或“导入 AI 方案”
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧面板 -->
      <div class="right-panels">
        <!-- 布局描述输出 -->
        <div class="output-container">
          <div class="output-header">
            <span>📝 当前布局描述</span>
            <button class="copy-btn" @click="copyPrompt">复制</button>
          </div>
          <div class="output-content">
            <pre>{{ generatedPrompt }}</pre>
          </div>
        </div>

        <!-- AI 提示词生成器 -->
        <div class="prompt-generator">
          <div class="prompt-header">
            <span>🤖 AI 提示词生成器</span>
            <el-button type="primary" size="small" @click="showPromptDialog = true">
              <el-icon><Edit /></el-icon> 编辑预设提示词
            </el-button>
          </div>
          <div class="prompt-body">
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
    </div>

    <!-- 导入布局方案对话框（增强版：智能解析 + 手动） -->
    <el-dialog v-model="importDialogVisible" title="导入 AI 布局方案" width="750px">
      <el-tabs v-model="importTab" type="border-card">
        <!-- 智能解析标签 -->
        <el-tab-pane label="🤖 智能解析 AI 回答" name="smart">
          <el-input
            v-model="aiFullResponse"
            type="textarea"
            :rows="12"
            placeholder="直接粘贴 AI 的完整回答（包含分析文字和 JSON 代码块）..."
          />
          <el-button type="primary" @click="parseAIResponse" style="margin-top: 12px; width: 100%;">
            <el-icon><Search /></el-icon> 解析方案
          </el-button>
          
          <div v-if="parsedSchemes.length > 0" style="margin-top: 16px;">
            <div class="scheme-list-title">✅ 识别到 {{ parsedSchemes.length }} 个布局方案</div>
            <el-checkbox-group v-model="selectedSchemeIndexes" class="scheme-checkbox-group">
              <el-checkbox
                v-for="(scheme, idx) in parsedSchemes"
                :key="idx"
                :label="idx"
                border
                style="margin-bottom: 8px; width: 100%; display: block; padding: 10px 15px;"
              >
                <span style="font-weight: bold;">{{ scheme.name }}</span>
                <span style="margin-left: 12px; color: #666;">{{ scheme.components.length }} 个组件</span>
              </el-checkbox>
            </el-checkbox-group>
            <div style="margin-top: 12px;">
              <el-button size="small" @click="selectAllParsed">全选</el-button>
              <el-button size="small" @click="deselectAllParsed">取消全选</el-button>
            </div>
          </div>
          
          <el-alert
            v-if="parseError"
            :title="parseError"
            type="error"
            :closable="false"
            style="margin-top: 12px;"
          />
        </el-tab-pane>

        <!-- 手动粘贴 JSON 标签 -->
        <el-tab-pane label="📋 手动粘贴 JSON" name="manual">
          <el-input
            v-model="importJsonText"
            type="textarea"
            :rows="15"
            placeholder='粘贴单个 JSON 数组，例如：[{"type":"container","label":"主区域","x":30,"y":30,"w":400,"h":300,"color":"#e3f2fd"}]'
          />
          <el-input
            v-model="manualSchemeName"
            placeholder="方案名称（可选）"
            style="margin-top: 12px;"
          />
        </el-tab-pane>
      </el-tabs>

      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="applySelectedSchemes"
          :disabled="importTab === 'smart' && selectedSchemeIndexes.length === 0"
        >
          {{ importTab === 'smart' ? '导入选中方案到库' : '导入 JSON 到库' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 预设提示词编辑弹窗 -->
    <el-dialog v-model="showPromptDialog" title="编辑预设提示词" width="750px">
      <el-form :model="promptConfig" label-width="100px">
        <el-form-item label="系统提示词">
          <el-input
            v-model="promptConfig.systemPrompt"
            type="textarea"
            :rows="20"
            placeholder="输入预设的系统提示词..."
          />
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
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, CopyDocument, Search } from '@element-plus/icons-vue'
import { v4 as uuidv4 } from 'uuid' // 需要安装 uuid 库：npm install uuid

// ==================== 原有状态 ====================
const canvasRef = ref(null)
const components = ref([])
let idCounter = 0

const selectedIndex = ref(-1)
const copiedComponent = ref(null)

const draggingIndex = ref(-1)
const resizingIndex = ref(-1)
const dragStart = ref({ x: 0, y: 0, compX: 0, compY: 0 })
const resizeStart = ref({ x: 0, y: 0, w: 0, h: 0, compX: 0, compY: 0 })

const smartLines = ref([])
const threshold = 5

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
  }
}

const selectComponent = (index) => {
  selectedIndex.value = index
}

const startDrag = (e, index) => {
  draggingIndex.value = index
  const comp = components.value[index]
  dragStart.value = {
    x: e.clientX,
    y: e.clientY,
    compX: comp.x,
    compY: comp.y
  }
  selectComponent(index)
}

const startResize = (e, index) => {
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
  if (draggingIndex.value !== -1) {
    handleDrag(e)
  } else if (resizingIndex.value !== -1) {
    handleResize(e)
  }
}

const handleDrag = (e) => {
  const index = draggingIndex.value
  const comp = components.value[index]
  const dx = e.clientX - dragStart.value.x
  const dy = e.clientY - dragStart.value.y
  const newX = Math.max(0, Math.min(dragStart.value.compX + dx, canvasRef.value.clientWidth - comp.w))
  const newY = Math.max(0, Math.min(dragStart.value.compY + dy, canvasRef.value.clientHeight - comp.h))
  comp.x = newX
  comp.y = newY
  updateSmartLines(index, newX, newY, comp.w, comp.h)
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
// 方案数据结构：{ id: string, name: string, components: Array, createdAt: number }
const savedSchemes = ref([])
const activeSchemeId = ref(null) // 当前画布显示的方案ID（若与库中某方案完全一致则高亮）

// 重命名临时状态
const renamingId = ref(null)
const renameTemp = ref('')
const renameInput = ref(null)

// 初始化：从 localStorage 加载方案库
const loadSchemesFromStorage = () => {
  const stored = localStorage.getItem('composeforge_schemes')
  if (stored) {
    try {
      savedSchemes.value = JSON.parse(stored)
    } catch {}
  }
  // 如果没有方案，添加默认内置方案作为示例
  if (savedSchemes.value.length === 0) {
    const defaultSchemes = [
      { id: uuidv4(), name: '示例：左右分栏', components: presets.preset1, createdAt: Date.now() },
      { id: uuidv4(), name: '示例：顶部工作流', components: presets.preset2, createdAt: Date.now() },
      { id: uuidv4(), name: '示例：标签页式', components: presets.preset3, createdAt: Date.now() }
    ]
    savedSchemes.value = defaultSchemes
    saveSchemesToStorage()
  }
}

const saveSchemesToStorage = () => {
  localStorage.setItem('composeforge_schemes', JSON.stringify(savedSchemes.value))
}

// 保存当前画布为方案
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
    // 深拷贝组件数据
    const componentsCopy = JSON.parse(JSON.stringify(components.value))
    const newScheme = {
      id: uuidv4(),
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

// 加载方案到画布
const loadScheme = (schemeId) => {
  const scheme = savedSchemes.value.find(s => s.id === schemeId)
  if (!scheme) return
  
  // 深拷贝组件数据并重新生成ID
  const componentsCopy = JSON.parse(JSON.stringify(scheme.components))
  components.value = componentsCopy.map(comp => ({
    ...comp,
    id: idCounter++
  }))
  selectedIndex.value = -1
  smartLines.value = []
  activeSchemeId.value = schemeId
  currentPreset.value = '' // 切换至手动模式
  ElMessage.success(`已加载方案：${scheme.name}`)
}

// 删除方案
const deleteScheme = (schemeId) => {
  ElMessageBox.confirm('确定删除此方案吗？', '确认删除', {
    type: 'warning'
  }).then(() => {
    const index = savedSchemes.value.findIndex(s => s.id === schemeId)
    if (index !== -1) {
      savedSchemes.value.splice(index, 1)
      saveSchemesToStorage()
      if (activeSchemeId.value === schemeId) {
        activeSchemeId.value = null
      }
      ElMessage.success('方案已删除')
    }
  }).catch(() => {})
}

// 复制方案
const duplicateScheme = (schemeId) => {
  const scheme = savedSchemes.value.find(s => s.id === schemeId)
  if (!scheme) return
  const newScheme = {
    ...JSON.parse(JSON.stringify(scheme)),
    id: uuidv4(),
    name: `${scheme.name} (副本)`,
    createdAt: Date.now()
  }
  savedSchemes.value.push(newScheme)
  saveSchemesToStorage()
  ElMessage.success(`已复制方案：${newScheme.name}`)
}

// 开始重命名
const startRenameScheme = (schemeId) => {
  const scheme = savedSchemes.value.find(s => s.id === schemeId)
  if (!scheme) return
  renamingId.value = schemeId
  renameTemp.value = scheme.name
  nextTick(() => {
    if (renameInput.value) {
      renameInput.value.focus()
    }
  })
}

// 完成重命名
const finishRename = (schemeId) => {
  const scheme = savedSchemes.value.find(s => s.id === schemeId)
  if (!scheme) {
    renamingId.value = null
    return
  }
  const newName = renameTemp.value.trim()
  if (newName && newName !== scheme.name) {
    scheme.name = newName
    saveSchemesToStorage()
    ElMessage.success('名称已更新')
  }
  renamingId.value = null
}

// 清空所有方案
const clearAllSchemes = () => {
  ElMessageBox.confirm('确定清空所有方案吗？此操作不可恢复！', '警告', {
    type: 'error'
  }).then(() => {
    savedSchemes.value = []
    saveSchemesToStorage()
    activeSchemeId.value = null
    ElMessage.success('已清空方案库')
  }).catch(() => {})
}

// ==================== 导入对话框增强 ====================
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
  if (!text) {
    parseError.value = '请粘贴 AI 回答内容'
    return
  }

  parseError.value = ''
  parsedSchemes.value = []
  
  // 1. 提取所有代码块内容（```json ... ``` 或 ``` ... ```）
  const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)```/g
  const matches = [...text.matchAll(codeBlockRegex)]
  
  let candidates = []
  if (matches.length > 0) {
    candidates = matches.map(m => m[1].trim())
  } else {
    // 尝试从文本中提取类似 JSON 数组的部分
    const arrayRegex = /\[\s*\{[\s\S]*?\}\s*\]/g
    candidates = text.match(arrayRegex) || []
  }

  // 2. 尝试解析每个候选 JSON，并关联方案名称
  const schemes = []
  candidates.forEach((candidate, idx) => {
    try {
      const parsed = JSON.parse(candidate)
      if (Array.isArray(parsed) && parsed.length > 0) {
        const isValid = parsed.every(item => 
          item.type && item.label && typeof item.x === 'number'
        )
        if (isValid) {
          // 提取方案名称：优先查找该代码块前的注释行（如 // 方案一：xxx）
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
          schemes.push({
            name: name || `方案 ${schemes.length + 1}`,
            components: parsed,
            rawJson: candidate
          })
        }
      }
    } catch (e) {
      // 忽略
    }
  })

  if (schemes.length === 0) {
    parseError.value = '未找到有效的 JSON 布局方案，请确保回答中包含 JSON 代码块且格式正确。'
  } else {
    parsedSchemes.value = schemes
    selectedSchemeIndexes.value = schemes.map((_, idx) => idx) // 默认全选
    ElMessage.success(`成功解析 ${schemes.length} 个布局方案`)
  }
}

const selectAllParsed = () => {
  selectedSchemeIndexes.value = parsedSchemes.value.map((_, idx) => idx)
}

const deselectAllParsed = () => {
  selectedSchemeIndexes.value = []
}

// 导入选中方案到库
const applySelectedSchemes = () => {
  if (importTab.value === 'smart') {
    if (selectedSchemeIndexes.value.length === 0) {
      ElMessage.warning('请至少选择一个方案')
      return
    }
    let importedCount = 0
    selectedSchemeIndexes.value.forEach(idx => {
      const scheme = parsedSchemes.value[idx]
      // 检查是否已存在同名方案，若存在则自动追加序号
      let finalName = scheme.name
      let counter = 1
      while (savedSchemes.value.some(s => s.name === finalName)) {
        finalName = `${scheme.name} (${counter})`
        counter++
      }
      const newScheme = {
        id: uuidv4(),
        name: finalName,
        components: JSON.parse(JSON.stringify(scheme.components)),
        createdAt: Date.now()
      }
      savedSchemes.value.push(newScheme)
      importedCount++
    })
    saveSchemesToStorage()
    ElMessage.success(`成功导入 ${importedCount} 个方案到方案库`)
  } else {
    // 手动导入
    try {
      const data = JSON.parse(importJsonText.value)
      if (!Array.isArray(data)) throw new Error('必须是数组格式')
      data.forEach(item => {
        if (!item.type || !item.label || item.x === undefined) throw new Error('字段缺失')
      })
      const name = manualSchemeName.value.trim() || `手动导入 ${new Date().toLocaleTimeString()}`
      const newScheme = {
        id: uuidv4(),
        name,
        components: JSON.parse(JSON.stringify(data)),
        createdAt: Date.now()
      }
      savedSchemes.value.push(newScheme)
      saveSchemesToStorage()
      ElMessage.success(`方案“${name}”已导入到库`)
    } catch (e) {
      ElMessage.error('JSON 解析失败：' + e.message)
      return
    }
  }
  importDialogVisible.value = false
}

// ==================== AI 提示词生成器（升级协议） ====================
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

const promptConfig = ref({
  systemPrompt: defaultSystemPrompt
})

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('mouseup', onCanvasMouseUp)
  
  // 加载方案库
  loadSchemesFromStorage()
  
  // 加载本地存储的提示词
  const savedPrompt = localStorage.getItem('layout_ai_prompt')
  if (savedPrompt) {
    try {
      promptConfig.value = JSON.parse(savedPrompt)
    } catch {}
  }
})

const savePromptConfig = () => {
  localStorage.setItem('layout_ai_prompt', JSON.stringify(promptConfig.value))
  showPromptDialog.value = false
  ElMessage.success('预设提示词已保存')
}

const combineAndCopyFullPrompt = async () => {
  const basePrompt = promptConfig.value.systemPrompt
  const layoutDesc = generatedPrompt.value
  const userInput = userCodeInput.value.trim()
  
  if (!userInput) {
    ElMessage.warning('请先粘贴组件代码或额外说明')
    return
  }

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

// 键盘事件
const handleKeyDown = (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
    if (selectedIndex.value !== -1) {
      copiedComponent.value = JSON.parse(JSON.stringify(components.value[selectedIndex.value]))
    }
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
  if (e.key === 'Escape') {
    selectedIndex.value = -1
  }
  if (e.key === 'Delete' || e.key === 'Backspace') {
    if (selectedIndex.value !== -1 && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      removeComponent(selectedIndex.value)
    }
  }
}

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
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

.workspace {
  display: flex;
  flex: 1;
  padding: 20px;
  gap: 20px;
  overflow: hidden;
}

.left-area {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}

.canvas-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 60%;
}

.canvas-header {
  padding: 12px 20px;
  background: #fafafa;
  border-bottom: 1px solid #eee;
  font-weight: bold;
  color: #666;
}

.canvas {
  flex: 1;
  position: relative;
  background-image: linear-gradient(#f0f0f0 1px, transparent 1px),
    linear-gradient(90deg, #f0f0f0 1px, transparent 1px);
  background-size: 20px 20px;
  overflow: hidden;
  user-select: none;
}

/* 方案库面板 */
.scheme-library {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  height: 40%;
  overflow: hidden;
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
  flex: 1.2;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 360px;
}

.output-container {
  background: #2d3436;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 40%;
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

/* 智能参考线、拖拽组件样式保持不变 */
.smart-line {
  position: absolute;
  pointer-events: none;
  z-index: 999;
}
.smart-line.vertical { width: 1px; height: 100%; }
.smart-line.horizontal { width: 100%; height: 1px; }
.smart-line.edge { background-color: #3498db; }
.smart-line.center { background-color: #e74c3c; }

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
.draggable-item:hover { box-shadow: 4px 4px 15px rgba(0,0,0,0.2); }
.draggable-item.selected { border-color: #42b983; border-style: solid; box-shadow: 0 0 0 3px rgba(66,185,131,0.3); }
.draggable-item.dragging { border-style: solid; border-color: #42b983; opacity: 0.9; }
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
.delete-btn:hover { color: #ff5252; }
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