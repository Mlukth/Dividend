<template>
  <div class="layout-generator">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <h2>🧱 布局描述生成器 (MVP)</h2>
      <div class="actions">
        <button @click="addComponent('container')">+ 加容器</button>
        <button @click="addComponent('card')">+ 加卡片</button>
        <button @click="addComponent('button')">+ 加按钮</button>
        <button @click="clearCanvas" class="danger">清空画布</button>
      </div>
    </div>

    <div class="workspace">
      <!-- 左侧：画布区域 -->
      <div class="canvas-container">
        <div class="canvas-header">画布区域 (拖拽右下角调整大小)</div>
        <div class="canvas" ref="canvasRef">
          <!-- PPT同款：边缘牵引对齐辅助线 -->
          <div class="guide-line" v-for="line in guideLines" :key="line.id"
            :style="{
              left: line.left + 'px',
              top: line.top + 'px',
              width: line.width + 'px',
              height: line.height + 'px',
            }"
          ></div>

          <vue3-draggable-resizable
            v-for="(comp, index) in components"
            :key="comp.id"
            :grid="[20, 20]"
            :parent="true"
            :w="comp.w"
            :h="comp.h"
            :x="comp.x"
            :y="comp.y"
            @drag="(x, y) => onDragging(index, x, y)"
            @dragstop="(x, y) => onDragStop(index, x, y)"
            @resizestop="(x, y, w, h) => onResizeStop(index, x, y, w, h)"
            @click.stop="selectComponent(index)"
            class="draggable-item"
            :class="[selectedIndex === index ? 'selected' : '', `type-${comp.type}`]"
          >
            <div class="item-content">
              <span class="label">{{ comp.label }}</span>
              <button class="delete-btn" @click="removeComponent(index)">×</button>
            </div>
          </vue3-draggable-resizable>
        </div>
      </div>

      <!-- 右侧：生成的描述 -->
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
import Vue3DraggableResizable from 'vue3-draggable-resizable'
import 'vue3-draggable-resizable/dist/Vue3DraggableResizable.css'

// 状态
const canvasRef = ref(null)
const components = ref([])
let idCounter = 0

// 选中 + 复制粘贴
const selectedIndex = ref(-1)
const copiedComponent = ref(null)

// PPT同款牵引辅助线
const guideLines = ref([])
const alignThreshold = 6 // 对齐灵敏度

// 添加组件
const addComponent = (type) => {
  const typeMap = {
    container: { label: '容器', w: 200, h: 200, color: '#e3f2fd' },
    card: { label: '卡片', w: 120, h: 80, color: '#fff3e0' },
    button: { label: '按钮', w: 80, h: 40, color: '#e8f5e9' }
  }
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

// 删除
const removeComponent = (index) => {
  components.value.splice(index, 1)
  if (selectedIndex.value === index) selectedIndex.value = -1
  else if (selectedIndex.value > index) selectedIndex.value--
}

// 清空
const clearCanvas = () => {
  if (confirm('确定清空所有组件吗？')) {
    components.value = []
    idCounter = 0
    selectedIndex.value = -1
    guideLines.value = []
  }
}

// 选中
const selectComponent = (index) => {
  selectedIndex.value = index
}

// 拖拽结束
const onDragStop = (index, x, y) => {
  components.value[index].x = x
  components.value[index].y = y
  guideLines.value = [] // 松开隐藏线
}

// 缩放结束
const onResizeStop = (index, x, y, w, h) => {
  const comp = components.value[index]
  comp.x = x
  comp.y = y
  comp.w = w
  comp.h = h
  guideLines.value = []
}

// ====================== 核心：PPT同款边缘牵引辅助线 ======================
const onDragging = (index, x, y) => {
  const current = components.value[index]
  guideLines.value = []
  let lineId = 0

  // 当前拖动盒子四边&中心
  const curr = {
    l: x, r: x + current.w, t: y, b: y + current.h,
    cx: x + current.w / 2, cy: y + current.h / 2
  }

  const others = components.value.filter((_, i) => i !== index)

  others.forEach(other => {
    // 其他盒子四边&中心
    const tar = {
      l: other.x, r: other.x + other.w, t: other.y, b: other.y + other.h,
      cx: other.x + other.w / 2, cy: other.y + other.h / 2
    }

    // 左边缘对齐：从当前盒子左边 延伸直线到目标盒子左边
    if (Math.abs(curr.l - tar.l) < alignThreshold) {
      guideLines.value.push({
        id: lineId++,
        left: tar.l, top: Math.min(curr.t, tar.t),
        width: 1, height: Math.abs(curr.t - tar.t) + current.h
      })
    }

    // 右边缘对齐
    if (Math.abs(curr.r - tar.r) < alignThreshold) {
      guideLines.value.push({
        id: lineId++,
        left: tar.r, top: Math.min(curr.t, tar.t),
        width: 1, height: Math.abs(curr.t - tar.t) + current.h
      })
    }

    // 上边缘对齐
    if (Math.abs(curr.t - tar.t) < alignThreshold) {
      guideLines.value.push({
        id: lineId++,
        left: Math.min(curr.l, tar.l), top: tar.t,
        width: Math.abs(curr.l - tar.l) + current.w, height: 1
      })
    }

    // 下边缘对齐
    if (Math.abs(curr.b - tar.b) < alignThreshold) {
      guideLines.value.push({
        id: lineId++,
        left: Math.min(curr.l, tar.l), top: tar.b,
        width: Math.abs(curr.l - tar.l) + current.w, height: 1
      })
    }

    // 垂直居中对齐
    if (Math.abs(curr.cx - tar.cx) < alignThreshold) {
      guideLines.value.push({
        id: lineId++,
        left: tar.cx, top: Math.min(curr.t, tar.t),
        width: 1, height: Math.abs(curr.t - tar.t) + current.h
      })
    }

    // 水平居中对齐
    if (Math.abs(curr.cy - tar.cy) < alignThreshold) {
      guideLines.value.push({
        id: lineId++,
        left: Math.min(curr.l, tar.l), top: tar.cy,
        width: Math.abs(curr.l - tar.l) + current.w, height: 1
      })
    }
  })
}

// 生成提示词
const generatedPrompt = computed(() => {
  if (components.value.length === 0) return "请在左侧画布添加组件开始设计..."
  let desc = "请根据以下布局描述生成前端代码：\n\n1. 页面整体背景为白色。\n2. 页面包含以下元素：\n\n"
  components.value.forEach(comp => {
    let sizeDesc = `宽度约为 ${comp.w}px，高度约为 ${comp.h}px`
    let posDesc = `位于页面左上角偏移 (X: ${Math.round(comp.x)}, Y: ${Math.round(comp.y)}) 的位置`
    if (comp.w > 300 && comp.h > 200) sizeDesc = "较大区域容器"
    else if (comp.w < 100 && comp.h < 60) sizeDesc = "小巧操作按钮"
    desc += `   - [${comp.label}]：${posDesc}。${sizeDesc}。\n`
    desc += `     样式：淡色背景、带边框、内部居中文字"${comp.label}"。\n`
  })
  desc += "\n3. 使用Flex/绝对定位实现。\n4. 只需还原视觉布局，无需交互。"
  return desc
})

// 复制提示词
const copyPrompt = async () => {
  try {
    await navigator.clipboard.writeText(generatedPrompt.value)
    alert('复制成功！')
  } catch {
    alert('复制失败，请手动复制')
  }
}

// ====================== Ctrl+C / Ctrl+V 复制粘贴 ======================
const handleKeyDown = (e) => {
  // Ctrl+C 复制选中组件
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
    if (selectedIndex.value !== -1) {
      copiedComponent.value = JSON.parse(JSON.stringify(components.value[selectedIndex.value]))
    }
  }
  // Ctrl+V 粘贴
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
    if (copiedComponent.value) {
      const newComp = {
        ...copiedComponent.value,
        id: idCounter++,
        label: copiedComponent.value.label.replace(/\d+$/, '') + idCounter,
        x: copiedComponent.value.x + 20,
        y: copiedComponent.value.y + 20
      }
      components.value.push(newComp)
      selectedIndex.value = components.value.length - 1
    }
  }
  // ESC取消选中
  if (e.key === 'Escape') selectedIndex.value = -1
}

onMounted(() => window.addEventListener('keydown', handleKeyDown))
onUnmounted(() => window.removeEventListener('keydown', handleKeyDown))
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
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
.toolbar h2 { margin: 0; font-size: 18px; color: #333; }
.actions button {
  margin-left: 10px;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background-color: #42b983;
  color: white;
}
.actions button.danger { background-color: #ff5252; }

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
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  overflow: hidden;
}
.canvas-header, .output-header {
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
  background-image:
    linear-gradient(#f0f0f0 1px, transparent 1px),
    linear-gradient(90deg, #f0f0f0 1px, transparent 1px);
  background-size: 20px 20px;
  overflow: hidden;
}

/* ====================== PPT同款红色虚线牵引辅助线【这次一定看得见】 ====================== */
.guide-line {
  position: absolute;
  pointer-events: none;
  z-index: 999;
  /* PPT原版：红色虚线 */
  background-color: #ff4757;
  background-image: linear-gradient(to right, #ff4757 50%, transparent 50%);
  background-size: 6px 1px;
}

/* 拖拽选中样式 */
.draggable-item {
  border: 2px dashed #666;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 2px 2px 10px rgba(0,0,0,0.1);
  cursor: move;
}
.draggable-item.selected {
  border-color: #42b983;
  border-style: solid;
  box-shadow: 0 0 0 3px rgba(66,185,131,0.2);
}

.item-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  user-select: none;
  font-weight: bold;
}
.delete-btn {
  position: absolute;
  top: 2px; right: 6px;
  background: none; border: none;
  font-size: 18px; cursor: pointer;
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
.output-header { background: #212529; color:#adb5bd; border:none; }
.copy-btn { background:#0984e3; color:#fff; border:none; padding:5px 12px; border-radius:4px; }
.output-content { flex:1; padding:20px; overflow:auto; }
.output-content pre { margin:0; color:#dfe6e9; font-size:13px; line-height:1.6; white-space:pre-wrap; }
</style>