<template>
  <header class="header">
    <div class="header-left">
      <div class="logo">FusionSolar</div>
      <span class="system-name">智能光伏管理系统</span>
    </div>
    <div class="header-right">
      <span class="header-text">用户</span>
      <span class="header-text">设置</span>
    </div>
  </header>
</template>

<script setup>
// 顶部导航无业务逻辑，仅布局
</script>

<style scoped>
/* 顶部导航样式（从原App.vue迁移） */
.header {
  height: 60px;
  width: 100%;
  background: #fff;
  border-bottom: 1px solid #E5E6EB;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  z-index: 1;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.logo {
  font-size: 18px;
  font-weight: 700;
  color: #0066CC;
}
.system-name {
  font-size: 16px;
  color: #1D2129;
}
.header-right {
  display: flex;
  gap: 20px;
  align-items: center;
}
.header-text {
  cursor: pointer;
  color: #4E5969;
  font-size: 14px;
  padding: 6px 12px;
  border-radius: 8px;
  transition: all 0.2s;
}
.header-text:hover {
  color: #0066CC;
  background-color: #EEF7FF;
}
</style>