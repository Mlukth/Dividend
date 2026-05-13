<template>
  <div class="preview-wrapper">
    <h2 class="preview-title">方案B衍生 · 滑出标签变体对比</h2>
    <div class="preview-row">

      <!-- 变体1：原版 · 深色圆角标签（方案B原版） -->
      <div class="preview-card">
        <div class="card-label">B1 · 深色圆角标签（原版）</div>
        <div class="sidebar-demo collapsed">
          <div class="sidebar-main-demo">
            <div v-for="item in menuItems" :key="item.text" class="nav-item-demo slide-label" :class="{ active: item.active }">
              <el-icon :size="20"><component :is="item.icon" /></el-icon>
              <span class="slide-text variant-b1">{{ item.text }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 变体2：浅色填充标签（白底 + 边框 + 箭头） -->
      <div class="preview-card">
        <div class="card-label">B2 · 浅色卡片标签</div>
        <div class="sidebar-demo collapsed">
          <div class="sidebar-main-demo">
            <div v-for="item in menuItems" :key="item.text" class="nav-item-demo slide-label" :class="{ active: item.active }">
              <el-icon :size="20"><component :is="item.icon" /></el-icon>
              <span class="slide-text variant-b2">{{ item.text }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 变体3：下置标签（文字出现在图标下方） -->
      <div class="preview-card">
        <div class="card-label">B3 · 下置标签</div>
        <div class="sidebar-demo collapsed">
          <div class="sidebar-main-demo">
            <div v-for="item in menuItems" :key="item.text" class="nav-item-demo slide-label-bottom" :class="{ active: item.active }">
              <el-icon :size="20"><component :is="item.icon" /></el-icon>
              <span class="slide-text-bottom">{{ item.text }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 变体4：胶囊型标签（圆角更大，渐变底色） -->
      <div class="preview-card">
        <div class="card-label">B4 · 胶囊渐变标签</div>
        <div class="sidebar-demo collapsed">
          <div class="sidebar-main-demo">
            <div v-for="item in menuItems" :key="item.text" class="nav-item-demo slide-label" :class="{ active: item.active }">
              <el-icon :size="20"><component :is="item.icon" /></el-icon>
              <span class="slide-text variant-b4">{{ item.text }}</span>
            </div>
          </div>
        </div>
      </div>

    </div>

    <div class="info-note">
      <p><strong>B1 深色圆角标签（原版）：</strong>深色背景 + 白色文字，简洁通用，对比度强。</p>
      <p><strong>B2 浅色卡片标签：</strong>白底 + 浅灰边框 + 小三角箭头，视觉更轻，适合浅色主题。</p>
      <p><strong>B3 下置标签：</strong>文字在图标正下方滑出，不遮挡右侧内容，适合窄屏幕场景。</p>
      <p><strong>B4 胶囊渐变标签：</strong>品牌蓝色渐变背景 + 大圆角胶囊形态，现代感强，与项目主色调呼应。</p>
    </div>
  </div>
</template>

<script setup>
import { PieChart, Sunny, Tools, Cpu, Money } from '@element-plus/icons-vue'

const menuItems = [
  { icon: PieChart, text: '电站概览', active: false },
  { icon: Sunny, text: '电站信息', active: true },
  { icon: Tools, text: '运维管理', active: false },
  { icon: Cpu, text: 'AI助手', active: false },
  { icon: Money, text: '经营管理', active: false }
]
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

/* ----- 基础滑出文字通用样式（调整 left）----- */
.slide-label {
  overflow: visible;
  justify-content: center;
}
.slide-label .slide-text {
  position: absolute;
  left: 60px;
  top: 50%;
  transform: translateY(-50%);
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
}
.slide-label:hover .slide-text {
  opacity: 1;
  left: 64px;
}

/* 变体 B1：深色圆角标签 */
.variant-b1 {
  background: #1D2129;
  color: #fff;
}
.variant-b1::before {
  border-right-color: #1D2129;
}

/* 变体 B2：浅色卡片标签 */
.variant-b2 {
  background: #fff;
  color: #333;
  border: 1px solid #E4E7ED;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.variant-b2::before {
  border-right-color: #E4E7ED; /* 箭头边框与标签边框同色 */
}

/* 变体 B3：下置标签（覆盖 left 和 top 定位） */
.slide-label-bottom {
  overflow: visible;
  justify-content: center;
  flex-direction: column; /* 竖直排列 */
}
.slide-label-bottom .slide-text-bottom {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: #1D2129;
  color: #fff;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease, top 0.2s ease;
  margin-top: 4px;
  z-index: 100;
}
.slide-label-bottom .slide-text-bottom::before {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-bottom-color: #1D2129;
}
.slide-label-bottom:hover .slide-text-bottom {
  opacity: 1;
  top: calc(100% + 2px);
}

/* 变体 B4：胶囊渐变标签 */
.variant-b4 {
  background: linear-gradient(135deg, #0052D9, #409EFF);
  color: #fff;
  border-radius: 20px; /* 大圆角胶囊 */
  padding: 4px 12px;
  box-shadow: 0 2px 6px rgba(0,82,217,0.3);
}
.variant-b4::before {
  border-right-color: #0052D9;
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