<template>
  <div class="preview-wrapper">
    <h2 class="preview-title">侧边栏悬停提示 - 三版样式对比</h2>
    <div class="preview-row">

      <!-- 方案A：Element Plus Tooltip 浮窗提示（最常规） -->
      <div class="preview-card">
        <div class="card-label">方案A · Tooltip 浮窗</div>
        <div class="sidebar-demo collapsed">
          <div class="sidebar-main-demo">
            <el-tooltip content="电站概览" placement="right" :show-after="400">
              <div class="nav-item-demo"><el-icon :size="20"><PieChart /></el-icon></div>
            </el-tooltip>
            <el-tooltip content="电站信息" placement="right" :show-after="400">
              <div class="nav-item-demo active"><el-icon :size="20"><Sunny /></el-icon></div>
            </el-tooltip>
            <el-tooltip content="运维管理" placement="right" :show-after="400">
              <div class="nav-item-demo"><el-icon :size="20"><Tools /></el-icon></div>
            </el-tooltip>
            <el-tooltip content="AI助手" placement="right" :show-after="400">
              <div class="nav-item-demo"><el-icon :size="20"><Cpu /></el-icon></div>
            </el-tooltip>
            <el-tooltip content="经营管理" placement="right" :show-after="400">
              <div class="nav-item-demo"><el-icon :size="20"><Money /></el-icon></div>
            </el-tooltip>
          </div>
        </div>
      </div>

      <!-- 方案B：纯 CSS 向右滑出文字标签（最轻量） -->
      <div class="preview-card">
        <div class="card-label">方案B · 滑出文字标签</div>
        <div class="sidebar-demo collapsed">
          <div class="sidebar-main-demo">
            <div class="nav-item-demo slide-label">
              <el-icon :size="20"><PieChart /></el-icon>
              <span class="slide-text">电站概览</span>
            </div>
            <div class="nav-item-demo slide-label active">
              <el-icon :size="20"><Sunny /></el-icon>
              <span class="slide-text">电站信息</span>
            </div>
            <div class="nav-item-demo slide-label">
              <el-icon :size="20"><Tools /></el-icon>
              <span class="slide-text">运维管理</span>
            </div>
            <div class="nav-item-demo slide-label">
              <el-icon :size="20"><Cpu /></el-icon>
              <span class="slide-text">AI助手</span>
            </div>
            <div class="nav-item-demo slide-label">
              <el-icon :size="20"><Money /></el-icon>
              <span class="slide-text">经营管理</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 方案C：底部状态栏式文字（折叠时在底部显示当前选中） -->
      <div class="preview-card">
        <div class="card-label">方案C · 底部名称栏</div>
        <div class="sidebar-demo collapsed sidebar-demo-bottom">
          <div class="sidebar-main-demo">
            <div class="nav-item-demo"><el-icon :size="20"><PieChart /></el-icon></div>
            <div class="nav-item-demo active"><el-icon :size="20"><Sunny /></el-icon></div>
            <div class="nav-item-demo"><el-icon :size="20"><Tools /></el-icon></div>
            <div class="nav-item-demo"><el-icon :size="20"><Cpu /></el-icon></div>
            <div class="nav-item-demo"><el-icon :size="20"><Money /></el-icon></div>
          </div>
          <div class="bottom-label-bar">电站信息</div>
        </div>
      </div>

    </div>

    <div class="info-note">
      <p><strong>方案A：</strong>使用 Element Plus 原生 Tooltip，延迟 400ms 显示，最符合常规交互习惯，无需额外 CSS。</p>
      <p><strong>方案B：</strong>纯 CSS 实现，hover 时文字向右滑出，流畅轻量，无 JS 开销，视觉上更现代。</p>
      <p><strong>方案C：</strong>底部常驻当前页面名称，始终可见，不需要等待悬停，适合初次使用者快速定位。</p>
    </div>
  </div>
</template>

<script setup>
import { PieChart, Sunny, Tools, Cpu, Money } from '@element-plus/icons-vue'
</script>

<style scoped>
.preview-wrapper {
  padding: 24px;
  background: #f0f2f5;
  min-height: 100vh;
  font-family: "Microsoft YaHei", sans-serif;
}

.preview-title {
  font-size: 20px;
  font-weight: 700;
  color: #1D2129;
  margin-bottom: 20px;
}

.preview-row {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.preview-card {
  flex: 1;
  min-width: 200px;
  max-width: 260px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.card-label {
  font-size: 14px;
  font-weight: 600;
  color: #4E5969;
  margin-bottom: 12px;
  text-align: center;
}

/* 模拟折叠侧边栏 */
.sidebar-demo {
  width: 80px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
}

.sidebar-demo-bottom {
  flex-direction: column;
}

.sidebar-main-demo {
  padding: 10px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

/* 通用菜单项样式（仿原项目） */
.nav-item-demo {
  width: 56px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #333;
  position: relative;
}
.nav-item-demo.active {
  background-color: #EEF7FF;
  color: #0066CC;
  box-shadow: 0 2px 6px rgba(0,102,204,0.1);
}
.nav-item-demo:hover {
  background-color: #F5F7FA;
  transform: translateY(-1px);
}

/* ----- 方案B：滑出文字标签 ----- */
.slide-label {
  overflow: visible;
  justify-content: center;
}
.slide-label .slide-text {
  position: absolute;
  left: 60px;
  top: 50%;
  transform: translateY(-50%);
  background: #1D2129;
  color: #fff;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 6px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease, left 0.2s ease;
  z-index: 100;
}
.slide-label .slide-text::before {
  content: '';
  position: absolute;
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  border: 5px solid transparent;
  border-right-color: #1D2129;
}
.slide-label:hover .slide-text {
  opacity: 1;
  left: 64px;
}

/* ----- 方案C：底部名称栏 ----- */
.bottom-label-bar {
  width: 100%;
  padding: 8px 4px;
  text-align: center;
  font-size: 12px;
  color: #0066CC;
  background: #EEF7FF;
  border-top: 1px solid #D6EBFF;
  border-radius: 0 0 12px 12px;
  box-sizing: border-box;
  white-space: nowrap;
}

/* 说明区域 */
.info-note {
  margin-top: 24px;
  padding: 16px 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  font-size: 13px;
  color: #4E5969;
  line-height: 1.8;
}

.info-note p {
  margin: 4px 0;
}
</style>