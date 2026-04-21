<template>
  <div class="app-layout">
    <TopNav ref="topNavRef" :style="{ height: navHeight + 'px' }" />
    <!-- 可拖拽分隔条 -->
    <div 
      class="resize-handle"
      @mousedown="startResize"
    ></div>
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import TopNav from '@/components/TopNav.vue'

const topNavRef = ref(null)
const navHeight = ref(280) // 默认高度
const MIN_HEIGHT = 120
const MAX_HEIGHT = 500
const STORAGE_KEY = 'top-nav-height'

// 读取保存的高度
const savedHeight = localStorage.getItem(STORAGE_KEY)
if (savedHeight) {
  const h = parseInt(savedHeight, 10)
  if (!isNaN(h) && h >= MIN_HEIGHT && h <= MAX_HEIGHT) {
    navHeight.value = h
  }
}

// 拖拽相关状态
let isResizing = false
let startY = 0
let startHeight = 0

const startResize = (e) => {
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

onBeforeUnmount(() => {
  // 清理全局事件
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
  height: 6px;
  background: transparent;
  cursor: row-resize;
  flex-shrink: 0;
  transition: background 0.2s;
  position: relative;
}
.resize-handle:hover {
  background: #409eff;
}
.resize-handle:active {
  background: #66b1ff;
}
.main-content {
  flex: 1;
  overflow: auto;
  padding: 20px;
  background: #fff;
}
</style>