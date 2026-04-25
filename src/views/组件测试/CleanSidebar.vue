<template>
  <div class="sidebar-container">
    <div class="sidebar">
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
</script>

<style scoped>
.sidebar-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
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
}

.sidebar-header {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

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
}

.nav-item.active {
  background: #dbeafe;
  color: #1e40af;
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

.new-dialog {
  background: #3b82f6;
}

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
}

.history-item.active {
  background: #f3f4f6;
}

.pin {
  margin-left: auto;
  width: 16px;
  height: 16px;
  background: #6b7280;
}
</style>