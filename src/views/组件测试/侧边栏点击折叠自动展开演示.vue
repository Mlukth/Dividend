<template>
  <div class="demo-container">
    <h2>📁 侧边栏交互演示：点击“电站信息”折叠，点击其他菜单自动展开</h2>
    <p class="desc">
      当前模拟侧边栏宽度：<strong>{{ collapsed ? '80px (仅图标)' : '160px (图标+文字)' }}</strong><br>
      点击「电站信息」→ 立即折叠；点击「电站概览」「运维管理」「AI助手」「经营管理」→ 自动展开。
    </p>

    <div class="mock-app">
      <!-- 模拟侧边栏 -->
      <div class="mock-sidebar" :class="{ collapsed: collapsed }" :style="{ width: collapsed ? '80px' : '160px' }">
        <div class="sidebar-inner">
          <div 
            class="nav-item" 
            v-for="item in menuItems" 
            :key="item.key"
            @click="handleMenuClick(item.key)"
          >
            <el-icon :size="20"><component :is="item.icon" /></el-icon>
            <span class="nav-text" v-show="!collapsed">{{ item.label }}</span>
          </div>
        </div>
        <!-- 底部展开按钮（仅折叠时显示） -->
        <div class="sidebar-footer" v-if="collapsed">
          <div class="expand-btn" @click="collapsed = false">
            <el-icon :size="18"><DArrowRight /></el-icon>
          </div>
        </div>
        <div class="sidebar-footer" v-else>
          <div class="placeholder">——</div>
        </div>
      </div>

      <!-- 模拟内容区 -->
      <div class="mock-content">
        <div class="content-card">
          <p>📌 当前点击菜单：<span class="highlight">{{ activeMenuLabel }}</span></p>
          <p>👉 点击「电站信息」侧边栏会折叠；点击其他菜单自动展开。</p>
          <p>👉 折叠后底部出现右箭头按钮，点击也可展开。</p>
        </div>
      </div>
    </div>

    <div class="action-log">
      <h3>📋 操作日志</h3>
      <div class="log-list">
        <div v-for="(log, idx) in logs" :key="idx" class="log-item">{{ log }}</div>
      </div>
      <button class="clear-btn" @click="logs = []">清空日志</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  PieChart, Sunny, Tools, Cpu, Money, DArrowRight 
} from '@element-plus/icons-vue'

const menuItems = [
  { key: 'dashboard', label: '电站概览', icon: PieChart },
  { key: 'station-info', label: '电站信息', icon: Sunny },
  { key: 'operation', label: '运维管理', icon: Tools },
  { key: 'ai', label: 'AI 助手', icon: Cpu },
  { key: 'business', label: '经营管理', icon: Money }
]

const collapsed = ref(false)
const activeMenu = ref('dashboard')
const logs = ref(['初始化完成'])

const activeMenuLabel = computed(() => {
  const item = menuItems.find(m => m.key === activeMenu.value)
  return item ? item.label : ''
})

const addLog = (msg) => {
  logs.value.unshift(`[${new Date().toLocaleTimeString()}] ${msg}`)
  if (logs.value.length > 10) logs.value.pop()
}

const handleMenuClick = (key) => {
  const item = menuItems.find(m => m.key === key)
  activeMenu.value = key

  if (key === 'station-info') {
    // 点击电站信息：折叠侧边栏
    collapsed.value = true
    addLog(`点击「${item.label}」→ 侧边栏折叠`)
  } else {
    // 点击其他菜单：自动展开侧边栏
    if (collapsed.value) {
      collapsed.value = false
      addLog(`点击「${item.label}」→ 自动展开侧边栏`)
    } else {
      addLog(`点击「${item.label}」`)
    }
  }
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.demo-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
  font-family: system-ui, 'Microsoft YaHei', sans-serif;
  background: #f5f7fa;
  min-height: 100vh;
}

h2 {
  margin-bottom: 8px;
  color: #1e1e1e;
}

.desc {
  color: #555;
  margin-bottom: 24px;
  font-size: 14px;
}

.mock-app {
  display: flex;
  height: 360px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  background: #fff;
  margin-bottom: 24px;
}

.mock-sidebar {
  background: #ffffff;
  border-right: 1px solid #ebeef5;
  display: flex;
  flex-direction: column;
  padding: 12px 0;
  transition: width 0.25s ease;
  box-shadow: 2px 0 8px rgba(0,0,0,0.02);
}

.sidebar-inner {
  padding: 0 8px;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  margin: 2px 0;
  border-radius: 12px;
  color: #333;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.nav-item:hover {
  background: #ecf5ff;
  color: #409eff;
}

.nav-text {
  margin-left: 10px;
}

.sidebar-footer {
  padding: 16px 12px 8px;
  border-top: 1px solid #ebeef5;
  margin-top: auto;
}

.expand-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 0;
  border-radius: 8px;
  background: #f5f7fa;
  color: #606266;
  cursor: pointer;
  transition: all 0.15s;
}

.expand-btn:hover {
  background: #ecf5ff;
  color: #409eff;
}

.placeholder {
  text-align: center;
  color: #ccc;
  font-size: 12px;
}

.mock-content {
  flex: 1;
  background: #fafbfc;
  padding: 24px;
  display: flex;
  align-items: center;
}

.content-card {
  background: white;
  border-radius: 16px;
  padding: 20px 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  width: 100%;
}

.content-card p {
  margin: 8px 0;
  color: #444;
}

.highlight {
  color: #409eff;
  font-weight: 600;
}

.action-log {
  background: white;
  border-radius: 16px;
  padding: 16px 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.action-log h3 {
  margin-top: 0;
  margin-bottom: 12px;
  color: #333;
  font-size: 16px;
}

.log-list {
  max-height: 180px;
  overflow-y: auto;
  background: #f9fafc;
  border-radius: 12px;
  padding: 8px 12px;
  margin-bottom: 12px;
}

.log-item {
  font-size: 13px;
  padding: 4px 0;
  border-bottom: 1px solid #eee;
  color: #555;
  font-family: monospace;
}

.clear-btn {
  background: #f0f0f0;
  border: none;
  border-radius: 8px;
  padding: 6px 16px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.clear-btn:hover {
  background: #e0e0e0;
}
</style>