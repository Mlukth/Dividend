<template>
  <div class="app-layout">
    <TopNav ref="topNavRef" :style="{ height: navHeight + 'px' }" />
    <!-- 可拖拽分隔条（折叠按钮在正中央） -->
    <div 
      class="resize-handle"
      @mousedown="startResize"
    >
      <div class="handle-line"></div>
      <el-tooltip :content="isCollapsed ? '展开导航栏' : '收起导航栏'" placement="right">
        <el-button 
          class="collapse-btn"
          :icon="isCollapsed ? ArrowDown : ArrowUp"
          circle
          @mousedown.stop
          @click.stop="toggleCollapse"
        />
      </el-tooltip>
    </div>
    <main class="main-content">
      <router-view />
    </main>
    <!-- 全局悬浮文档按钮（仅对「小工具研发部」目录生效） -->
    <FloatingDocButton />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue'
import TopNav from '@/components/TopNav.vue'
import FloatingDocButton from '@/components/FloatingDocButton.vue'

const DEFAULT_HEIGHT = 280   // 默认展开高度
const MIN_HEIGHT = 40        // 折叠时的最小高度
const MAX_HEIGHT = 500
const STORAGE_KEY = 'top-nav-height'
const COLLAPSED_KEY = 'top-nav-collapsed'

const topNavRef = ref(null)
const navHeight = ref(DEFAULT_HEIGHT)
const isCollapsed = ref(false)
const previousHeight = ref(DEFAULT_HEIGHT)

// 读取保存的高度和折叠状态
const savedHeight = localStorage.getItem(STORAGE_KEY)
if (savedHeight) {
  const h = parseInt(savedHeight, 10)
  if (!isNaN(h) && h >= MIN_HEIGHT && h <= MAX_HEIGHT) {
    navHeight.value = h
    previousHeight.value = h
  }
}

const savedCollapsed = localStorage.getItem(COLLAPSED_KEY)
if (savedCollapsed === 'true') {
  isCollapsed.value = true
  navHeight.value = MIN_HEIGHT
}

// 拖拽相关状态
let isResizing = false
let startY = 0
let startHeight = 0

const startResize = (e) => {
  if (isCollapsed.value) return
  isResizing = true
  startY = e.clientY
  startHeight = navHeight.value
  
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
  document.body.style.cursor = 'row-resize'
  document.body.style.userSelect = 'none'
}

const handleResize = (e) => {
  if (!isResizing) return
  const deltaY = e.clientY - startY
  const newHeight = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, startHeight + deltaY))
  navHeight.value = newHeight
  if (newHeight > MIN_HEIGHT && isCollapsed.value) {
    isCollapsed.value = false
    localStorage.setItem(COLLAPSED_KEY, 'false')
  }
}

const stopResize = () => {
  if (isResizing) {
    localStorage.setItem(STORAGE_KEY, navHeight.value)
  }
  isResizing = false
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

const toggleCollapse = () => {
  if (isCollapsed.value) {
    navHeight.value = DEFAULT_HEIGHT
    isCollapsed.value = false
    localStorage.setItem(COLLAPSED_KEY, 'false')
    localStorage.setItem(STORAGE_KEY, DEFAULT_HEIGHT)
  } else {
    previousHeight.value = navHeight.value
    navHeight.value = MIN_HEIGHT
    isCollapsed.value = true
    localStorage.setItem(COLLAPSED_KEY, 'true')
  }
}

onMounted(() => {
  if (isCollapsed.value) {
    navHeight.value = MIN_HEIGHT
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
html, body, #app {
  height: 100%;
  width: 100%;
}
.app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  overflow: hidden;
}
.resize-handle {
  height: 12px;
  background: transparent;
  cursor: row-resize;
  flex-shrink: 0;
  transition: background 0.2s;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.handle-line {
  width: 40px;
  height: 3px;
  background: #dcdfe6;
  border-radius: 2px;
  transition: background 0.2s;
}
.resize-handle:hover .handle-line {
  background: #409eff;
}
.resize-handle:active .handle-line {
  background: #66b1ff;
}
.collapse-btn {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  transition: all 0.2s;
  width: 32px;
  height: 32px;
  padding: 0;
}
.collapse-btn:hover {
  transform: translate(-50%, -50%) scale(1.08);
}
.collapse-btn :deep(.el-icon) {
  font-size: 18px;
}
.main-content {
  flex: 1;
  overflow: auto;
  padding: 20px;
  background: #fff;
}
</style>