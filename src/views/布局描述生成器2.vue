<template>
  <div class="layout-generator">
    <!-- 工具栏 -->
    <div class="toolbar">
      <h2>🧱 布局描述生成器 + 智能参考线</h2>
      <div class="actions">
        <button @click="addComponent('container')">加容器</button>
        <button @click="addComponent('card')">加卡片</button>
        <button @click="addComponent('button')">加按钮</button>
        <button class="danger" @click="clearCanvas">清空画布</button>
      </div>
    </div>

    <!-- 工作区 -->
    <div class="workspace">
      <!-- 左侧画布 -->
      <div class="canvas-container">
        <div class="canvas-header">画布区域</div>
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
            <!-- 调整大小手柄 -->
            <div
              v-if="selectedIndex === index"
              class="resize-handle"
              @mousedown.stop="startResize($event, index)"
            ></div>
            <button class="delete-btn" @click.stop="removeComponent(index)">×</button>
          </div>
        </div>
      </div>

      <!-- 右侧输出 -->
      <div class="output-container">
        <div class="output-header">
          <span>📝 AI 提示词描述</span>
          <button class="copy-btn" @click="copyPrompt">一键复制</button>
        </div>
        <div class="output-content">
          <pre>{{ generatedPrompt }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// 状态管理
const canvasRef = ref(null)
const components = ref([])
let idCounter = 0

// 选中状态
const selectedIndex = ref(-1)
const copiedComponent = ref(null)

// 拖拽状态
const draggingIndex = ref(-1)
const resizingIndex = ref(-1)
const dragStart = ref({ x: 0, y: 0, compX: 0, compY: 0 })
const resizeStart = ref({ x: 0, y: 0, w: 0, h: 0, compX: 0, compY: 0 })

// 智能参考线
const smartLines = ref([])
const threshold = 5

// 类型配置
const typeMap = {
  container: { label: '容器', w: 200, h: 200, color: '#e3f2fd' },
  card: { label: '卡片', w: 120, h: 80, color: '#fff3e0' },
  button: { label: '按钮', w: 80, h: 40, color: '#e8f5e9' }
}

// 添加组件
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

// 移除组件
const removeComponent = (index) => {
  components.value.splice(index, 1)
  if (selectedIndex.value === index) {
    selectedIndex.value = -1
  } else if (selectedIndex.value > index) {
    selectedIndex.value--
  }
}

// 清空画布
const clearCanvas = () => {
  if (confirm('确定清空所有组件吗？')) {
    components.value = []
    idCounter = 0
    selectedIndex.value = -1
    smartLines.value = []
  }
}

// 选中组件
const selectComponent = (index) => {
  selectedIndex.value = index
}

// ==================== 拖拽实现 ====================
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

  // 更新智能参考线
  updateSmartLines(index, newX, newY, comp.w, comp.h)
}

const handleResize = (e) => {
  const index = resizingIndex.value
  const comp = components.value[index]
  const dx = e.clientX - resizeStart.value.x
  const dy = e.clientY - resizeStart.value.y

  comp.w = Math.max(40, resizeStart.value.w + dx)
  comp.h = Math.max(30, resizeStart.value.h + dy)

  // 更新智能参考线
  updateSmartLines(index, comp.x, comp.y, comp.w, comp.h)
}

const onCanvasMouseUp = () => {
  if (draggingIndex.value !== -1 || resizingIndex.value !== -1) {
    draggingIndex.value = -1
    resizingIndex.value = -1
    smartLines.value = []
  }
}

// ==================== 智能参考线算法 ====================
const updateSmartLines = (index, x, y, w, h) => {
  const canvas = canvasRef.value
  if (!canvas) return

  const canvasWidth = canvas.clientWidth
  const canvasHeight = canvas.clientHeight

  smartLines.value = []
  let lineId = 0

  const others = components.value.filter((_, i) => i !== index)

  others.forEach((other) => {
    // 当前组件的边缘和中心
    const current = {
      left: x,
      right: x + w,
      top: y,
      bottom: y + h,
      centerX: x + w / 2,
      centerY: y + h / 2
    }

    // 其他组件的边缘和中心
    const target = {
      left: other.x,
      right: other.x + other.w,
      top: other.y,
      bottom: other.y + other.h,
      centerX: other.x + other.w / 2,
      centerY: other.y + other.h / 2
    }

    // --- 垂直参考线 (X轴) ---
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

    // --- 水平参考线 (Y轴) ---
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

// ==================== 提示词生成 ====================
const generatedPrompt = computed(() => {
  if (components.value.length === 0) {
    return '请在左侧画布添加组件开始设计...'
  }

  let desc = '请根据以下布局描述生成前端代码：\n\n'
  desc += '1. 页面整体背景为白色。\n'
  desc += '2. 页面包含以下元素：\n\n'

  components.value.forEach((comp) => {
    let sizeDesc = `宽度约为 ${comp.w}px，高度约为 ${comp.h}px`
    let posDesc = `位于页面左上角偏移 (X: ${Math.round(comp.x)}, Y: ${Math.round(comp.y)}) 的位置`

    if (comp.w > 300 && comp.h > 200) sizeDesc = '这是一个较大的区域容器'
    else if (comp.w < 100 && comp.h < 60) sizeDesc = '这是一个小巧的操作按钮'

    desc += ` - [${comp.label}]：${posDesc}。${sizeDesc}。\n`
    desc += ` 样式要求：背景色使用淡色系，带边框，内部居中显示文字"${comp.label}"。\n`
  })

  desc += '\n3. 请使用 Flexbox 或绝对定位实现上述布局。\n'
  desc += '4. 不需要添加交互逻辑，只需还原视觉布局即可。'

  return desc
})

// 复制功能
const copyPrompt = async () => {
  try {
    await navigator.clipboard.writeText(generatedPrompt.value)
    alert('复制成功！现在可以去粘贴给 AI 了')
  } catch {
    alert('复制失败，请手动复制')
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
    if (selectedIndex.value !== -1 && document.activeElement.tagName !== 'INPUT') {
      removeComponent(selectedIndex.value)
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('mouseup', onCanvasMouseUp)
})

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
  padding: 15px 30px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.toolbar h2 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.actions button {
  margin-left: 10px;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background-color: #42b983;
  color: white;
  transition: 0.2s;
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

.canvas-container {
  flex: 2;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.canvas-header,
.output-header {
  padding: 12px 20px;
  background: #fafafa;
  border-bottom: 1px solid #eee;
  font-weight: bold;
  color: #666;
  display: flex;
  justify-content: space-between;
  align-items: center;
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

/* 智能参考线 */
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
  background-color: #3498db;  /* 蓝色 - 边缘对齐 */
}

.smart-line.center {
  background-color: #e74c3c;  /* 红色 - 中心对齐 */
}

/* 可拖拽组件 */
.draggable-item {
  position: absolute;
  border: 2px dashed #666;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s;
}

.draggable-item:hover {
  box-shadow: 4px 4px 15px rgba(0, 0, 0, 0.2);
}

.draggable-item.selected {
  border-color: #42b983;
  border-style: solid;
  box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.3);
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
  line-height: 1;
}

.delete-btn:hover {
  color: #ff5252;
}

/* 调整大小手柄 */
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

/* 右侧输出 */
.output-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #2d3436;
  border-radius: 12px;
  overflow: hidden;
  min-width: 300px;
}

.output-header {
  background: #212529;
  color: #adb5bd;
  border: none;
}

.copy-btn {
  background: #0984e3;
  color: white;
  border: none;
  padding: 5px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.output-content {
  flex: 1;
  padding: 20px;
  overflow: auto;
}

.output-content pre {
  margin: 0;
  color: #dfe6e9;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
[[END]]
