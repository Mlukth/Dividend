<template>
  <!-- 全局样式切换浮窗 -->
  <div class="style-switcher" :class="{ folded: isFolded }">
    <div class="switcher-header" @click="isFolded = !isFolded">
      <span v-if="!isFolded">导航栏样式切换器</span>
      <span class="fold-icon">{{ isFolded ? '▶' : '◀' }}</span>
    </div>
    <div class="switcher-body" v-show="!isFolded">
      <div
        v-for="item in styleList"
        :key="item.value"
        class="style-item"
        :class="{ active: currentStyle === item.value }"
        @click="setStyle(item.value)"
      >
        {{ item.label }}
      </div>
    </div>
  </div>

  <!-- 主体导航栏 -->
  <div class="sidebar-container">
    <div class="sidebar" :class="`sidebar-${currentStyle}`">
      <div class="sidebar-header">
        <span class="name">豆包</span>
      </div>

      <div class="sidebar-nav">
        <div class="nav-item active">
          <div class="icon new-dialog"></div>
          <span>新对话</span>
          <span class="shortcut">Ctrl+K</span>
        </div>
        <div class="nav-item">
          <div class="icon ai-create"></div>
          <span>AI 创作</span>
        </div>
        <div class="nav-item">
          <div class="icon cloud"></div>
          <span>云盘</span>
        </div>
        <div class="nav-item has-arrow">
          <div class="icon more"></div>
          <span>更多</span>
          <div class="arrow"></div>
        </div>
      </div>

      <div class="divider"></div>

      <div class="sidebar-history">
        <div class="history-title">历史对话</div>
        <div class="history-item">
          <div class="icon chat"></div>
          <span>精炼地址</span>
          <div class="pin"></div>
        </div>
        <div class="history-item active">
          <div class="icon chat"></div>
          <span>导航栏样式</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 当前激活样式
const currentStyle = ref('style1')

// 折叠状态
const isFolded = ref(false)

// 样式配置列表
const styleList = ref([
  { label: '样式1：原版背景高亮', value: 'style1' },
  { label: '样式2：左侧边框高亮', value: 'style2' },
  { label: '样式3：阴影强化质感', value: 'style3' },
  { label: '样式4：下划线极简', value: 'style4' },
])

// 切换样式
function setStyle(val) {
  currentStyle.value = val
}
</script>

<style scoped>
/* —————————————————— 全局样式切换器 —————————————————— */
.style-switcher {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border-radius: 0 0 8px 0;
  transition: all 0.3s ease;
}

.style-switcher.folded {
  width: 40px;
  height: 40px;
  overflow: hidden;
}

.switcher-header {
  padding: 10px 12px;
  background: #1d4ed8;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  user-select: none;
}

.fold-icon {
  font-size: 16px;
}

.switcher-body {
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 220px;
}

.style-item {
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.style-item.active {
  background: #dbeafe;
  color: #1e40af;
  font-weight: 500;
}

/* —————————————————— 导航栏基础结构 —————————————————— */
.sidebar-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
  display: flex;
  justify-content: center;
}

.sidebar {
  width: 280px;
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.sidebar-header {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

/* 菜单 */
.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-item.has-arrow {
  justify-content: space-between;
}

.arrow {
  width: 16px;
  height: 16px;
  border-right: 2px solid #6b7280;
  border-bottom: 2px solid #6b7280;
  transform: rotate(-45deg);
}

.icon {
  width: 20px;
  height: 20px;
  background: #6b7280;
  border-radius: 4px;
}

.new-dialog { background: #3b82f6; }
.ai-create { background: #6b7280; }
.cloud { background: #6b7280; }
.more { background: #6b7280; }
.chat { background: #6b7280; }

.shortcut {
  margin-left: auto;
  font-size: 12px;
  color: #6b7280;
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
}

.divider {
  height: 1px;
  background: #e5e7eb;
  margin: 8px 0;
}

/* 历史记录 */
.sidebar-history {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.history-title {
  font-size: 14px;
  color: #9ca3af;
  padding: 0 12px 4px;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.pin {
  margin-left: auto;
  width: 16px;
  height: 16px;
  background: #6b7280;
}

/* —————————————————— 4套主题样式 —————————————————— */
/* 样式1：原版高亮 */
.sidebar-style1 .nav-item.active {
  background: #dbeafe;
  color: #1e40af;
}
.sidebar-style1 .history-item.active {
  background: #f3f4f6;
}

/* 样式2：左侧边框 */
.sidebar-style2 .nav-item.active {
  background: #f9fafb;
  color: #111827;
  border-left: 4px solid #3b82f6;
}
.sidebar-style2 .history-item.active {
  background: #f9fafb;
  border-left: 4px solid #9ca3af;
}

/* 样式3：阴影强化 */
.sidebar-style3 .nav-item.active {
  background: #eff6ff;
  color: #1d4ed8;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
}
.sidebar-style3 .history-item.active {
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

/* 样式4：下划线极简 */
.sidebar-style4 .nav-item.active {
  color: #1d4ed8;
  border-bottom: 2px solid #3b82f6;
  border-radius: 0;
  background: transparent;
}
.sidebar-style4 .history-item.active {
  color: #1d4ed8;
  border-bottom: 1px solid #3b82f6;
  border-radius: 0;
  background: transparent;
}
</style>