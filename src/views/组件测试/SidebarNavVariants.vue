<template>
  <div class="sidebar-container">
    <!-- 版本1：原版复刻 -->
    <div class="sidebar variant1">
      <div class="sidebar-header">
        <div class="avatar"></div>
        <span class="name">豆包</span>
        <div class="collapse-btn"></div>
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
      <div class="sidebar-history">
        <div class="history-title">历史对话</div>
        <div class="history-item">
          <div class="icon chat"></div>
          <span>精炼地址</span>
          <div class="pin"></div>
        </div>
        <div class="history-item">
          <div class="icon chat"></div>
          <span>导航栏拉手细节差异</span>
          <div class="pin"></div>
        </div>
        <div class="history-item active">
          <div class="icon chat"></div>
          <span>新对话</span>
        </div>
        <div class="history-item">
          <div class="icon chat"></div>
          <span>新对话</span>
        </div>
      </div>
    </div>

    <!-- 版本2：左侧边框高亮版 -->
    <div class="sidebar variant2">
      <div class="sidebar-header">
        <div class="avatar"></div>
        <span class="name">豆包</span>
        <div class="collapse-btn"></div>
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
      <div class="sidebar-history">
        <div class="history-title">历史对话</div>
        <div class="history-item">
          <div class="icon chat"></div>
          <span>精炼地址</span>
          <div class="pin"></div>
        </div>
        <div class="history-item">
          <div class="icon chat"></div>
          <span>导航栏拉手细节差异</span>
          <div class="pin"></div>
        </div>
        <div class="history-item active">
          <div class="icon chat"></div>
          <span>新对话</span>
        </div>
        <div class="history-item">
          <div class="icon chat"></div>
          <span>新对话</span>
        </div>
      </div>
    </div>

    <!-- 版本3：阴影强化版 -->
    <div class="sidebar variant3">
      <div class="sidebar-header">
        <div class="avatar"></div>
        <span class="name">豆包</span>
        <div class="collapse-btn"></div>
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
      <div class="sidebar-history">
        <div class="history-title">历史对话</div>
        <div class="history-item">
          <div class="icon chat"></div>
          <span>精炼地址</span>
          <div class="pin"></div>
        </div>
        <div class="history-item">
          <div class="icon chat"></div>
          <span>导航栏拉手细节差异</span>
          <div class="pin"></div>
        </div>
        <div class="history-item active">
          <div class="icon chat"></div>
          <span>新对话</span>
        </div>
        <div class="history-item">
          <div class="icon chat"></div>
          <span>新对话</span>
        </div>
      </div>
    </div>

    <!-- 版本4：简洁分割线版 -->
    <div class="sidebar variant4">
      <div class="sidebar-header">
        <span class="name">豆包</span>
        <div class="collapse-btn"></div>
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
        <div class="history-item">
          <div class="icon chat"></div>
          <span>导航栏拉手细节差异</span>
          <div class="pin"></div>
        </div>
        <div class="history-item active">
          <div class="icon chat"></div>
          <span>新对话</span>
        </div>
        <div class="history-item">
          <div class="icon chat"></div>
          <span>新对话</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 无业务逻辑，纯样式展示
</script>

<style scoped>
.sidebar-container {
  display: flex;
  gap: 24px;
  padding: 16px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.sidebar {
  width: 280px;
  background-color: #ffffff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 16px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e5e7eb;
  background-image: url('https://picsum.photos/40/40');
  background-size: cover;
}

.name {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  flex: 1;
}

.collapse-btn {
  width: 20px;
  height: 20px;
  border: 2px solid #6b7280;
  border-radius: 4px;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-item.active {
  background-color: #eff6ff;
  color: #1d4ed8;
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
  background-color: #6b7280;
  border-radius: 4px;
}

.new-dialog {
  background-color: #3b82f6;
  mask-image: url('data:image/svg+xml;utf8,<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 4V20M4 12H20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>');
  mask-size: cover;
  -webkit-mask-image: url('data:image/svg+xml;utf8,<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 4V20M4 12H20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>');
  -webkit-mask-size: cover;
}

.ai-create {
  background-color: #6b7280;
  mask-image: url('data:image/svg+xml;utf8,<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>');
  mask-size: cover;
  -webkit-mask-image: url('data:image/svg+xml;utf8,<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>');
  -webkit-mask-size: cover;
}

.cloud {
  background-color: #6b7280;
  mask-image: url('data:image/svg+xml;utf8,<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>');
  mask-size: cover;
  -webkit-mask-image: url('data:image/svg+xml;utf8,<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>');
  -webkit-mask-size: cover;
}

.more {
  background-color: #6b7280;
  mask-image: url('data:image/svg+xml;utf8,<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 5v.01M12 12v.01M12 19v.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>');
  mask-size: cover;
  -webkit-mask-image: url('data:image/svg+xml;utf8,<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 5v.01M12 12v.01M12 19v.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>');
  -webkit-mask-size: cover;
}

.chat {
  background-color: #6b7280;
  mask-image: url('data:image/svg+xml;utf8,<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>');
  mask-size: cover;
  -webkit-mask-image: url('data:image/svg+xml;utf8,<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>');
  -webkit-mask-size: cover;
}

.shortcut {
  margin-left: auto;
  font-size: 12px;
  color: #6b7280;
  background-color: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
}

.sidebar-history {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  overflow-y: auto;
}

.history-title {
  font-size: 14px;
  color: #9ca3af;
  padding: 8px 12px;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.history-item.active {
  background-color: #f3f4f6;
}

.pin {
  margin-left: auto;
  width: 16px;
  height: 16px;
  background-color: #6b7280;
  mask-image: url('data:image/svg+xml;utf8,<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>');
  mask-size: cover;
  -webkit-mask-image: url('data:image/svg+xml;utf8,<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>');
  -webkit-mask-size: cover;
}

.divider {
  height: 1px;
  background-color: #e5e7eb;
  margin: 8px 0;
}

/* 版本1：原版复刻样式 */
.variant1 .nav-item.active {
  background-color: #dbeafe;
  color: #1e40af;
}

.variant1 .history-item.active {
  background-color: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* 版本2：左侧边框高亮样式 */
.variant2 .nav-item.active {
  background-color: #f3f4f6;
  color: #111827;
  border-left: 4px solid #3b82f6;
}

.variant2 .history-item.active {
  background-color: #f3f4f6;
  border-left: 4px solid #6b7280;
}

/* 版本3：阴影强化样式 */
.variant3 .nav-item.active {
  background-color: #eff6ff;
  color: #1d4ed8;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
}

.variant3 .history-item.active {
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 版本4：简洁分割线样式 */
.variant4 .sidebar-header {
  padding-bottom: 8px;
}

.variant4 .avatar {
  display: none;
}

.variant4 .nav-item.active {
  color: #1d4ed8;
  border-bottom: 2px solid #3b82f6;
  border-radius: 0;
}

.variant4 .history-item.active {
  color: #1d4ed8;
  border-bottom: 1px solid #3b82f6;
  border-radius: 0;
}
</style>