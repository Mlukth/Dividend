<template>
  <div class="preview-page">
    <h2 class="page-title">📂 侧边栏折叠/展开交互方案对比</h2>
    <p class="page-desc">
      点击“电站信息”后侧边栏自动收窄为仅图标模式，底部显示展开按钮。<br>
      以下三种方案展示不同的折叠触发方式和底部控制区域样式。
    </p>

    <div class="schemes-row">
      <!-- 方案1：点击菜单项触发折叠，底部固定展开按钮 -->
      <div class="scheme-column">
        <div class="scheme-label">
          <span class="badge scheme1">方案 1</span>
          <strong>菜单点击折叠 · 底部按钮展开</strong>
        </div>
        <div class="mock-app">
          <div class="mock-sidebar" :class="{ collapsed: scheme1Collapsed }" :style="{ width: scheme1Collapsed ? '80px' : '160px' }">
            <div class="sidebar-inner">
              <div 
                class="nav-item-full" 
                v-for="item in menuItems" 
                :key="item.key"
                @click="item.key === 'station-info' ? (scheme1Collapsed = true) : null"
              >
                <el-icon :size="20"><component :is="item.icon" /></el-icon>
                <span class="nav-text" v-show="!scheme1Collapsed">{{ item.label }}</span>
              </div>
            </div>
            <div class="sidebar-footer" v-if="scheme1Collapsed">
              <div class="expand-btn" @click="scheme1Collapsed = false">
                <el-icon :size="18"><DArrowRight /></el-icon>
                <span v-show="!scheme1Collapsed">展开</span>
              </div>
            </div>
            <div class="sidebar-footer" v-else>
              <div class="expand-placeholder">——</div>
            </div>
          </div>
          <div class="mock-content">
            <div class="content-placeholder">
              <span>📋 内容区域</span>
            </div>
          </div>
        </div>
        <ul class="scheme-notes">
          <li>点击“电站信息”立即折叠</li>
          <li>底部显示右箭头展开按钮</li>
          <li>折叠后仅图标，悬停无文字</li>
        </ul>
      </div>

      <!-- 方案2：底部切换按钮，点击任意位置不自动折叠，手动控制 -->
      <div class="scheme-column">
        <div class="scheme-label">
          <span class="badge scheme2">方案 2</span>
          <strong>底部按钮手动切换 · 菜单不自动折叠</strong>
        </div>
        <div class="mock-app">
          <div class="mock-sidebar" :class="{ collapsed: scheme2Collapsed }" :style="{ width: scheme2Collapsed ? '80px' : '160px' }">
            <div class="sidebar-inner">
              <div class="nav-item-full" v-for="item in menuItems" :key="item.key">
                <el-icon :size="20"><component :is="item.icon" /></el-icon>
                <span class="nav-text" v-show="!scheme2Collapsed">{{ item.label }}</span>
              </div>
            </div>
            <div class="sidebar-footer">
              <div class="expand-btn" @click="scheme2Collapsed = !scheme2Collapsed">
                <el-icon :size="18"><component :is="scheme2Collapsed ? DArrowRight : DArrowLeft" /></el-icon>
                <span v-show="!scheme2Collapsed">折叠</span>
                <span v-show="scheme2Collapsed">展开</span>
              </div>
            </div>
          </div>
          <div class="mock-content">
            <div class="content-placeholder">
              <span>📋 内容区域</span>
            </div>
          </div>
        </div>
        <ul class="scheme-notes">
          <li>底部固定切换按钮，手动折叠/展开</li>
          <li>点击菜单项不会自动折叠</li>
          <li>箭头方向随状态变化</li>
        </ul>
      </div>

      <!-- 方案3：折叠后显示小图标+文字提示（Tooltip） -->
      <div class="scheme-column">
        <div class="scheme-label">
          <span class="badge scheme3">方案 3</span>
          <strong>悬浮文字提示 + 底部展开</strong>
        </div>
        <div class="mock-app">
          <div class="mock-sidebar" :class="{ collapsed: scheme3Collapsed }" :style="{ width: scheme3Collapsed ? '80px' : '160px' }">
            <div class="sidebar-inner">
              <el-tooltip 
                v-for="item in menuItems" 
                :key="item.key"
                :content="item.label" 
                placement="right" 
                :disabled="!scheme3Collapsed"
              >
                <div 
                  class="nav-item-full" 
                  @click="item.key === 'station-info' ? (scheme3Collapsed = true) : null"
                >
                  <el-icon :size="20"><component :is="item.icon" /></el-icon>
                  <span class="nav-text" v-show="!scheme3Collapsed">{{ item.label }}</span>
                </div>
              </el-tooltip>
            </div>
            <div class="sidebar-footer" v-if="scheme3Collapsed">
              <el-tooltip content="展开导航栏" placement="right">
                <div class="expand-btn" @click="scheme3Collapsed = false">
                  <el-icon :size="18"><DArrowRight /></el-icon>
                </div>
              </el-tooltip>
            </div>
            <div class="sidebar-footer" v-else>
              <div class="expand-placeholder">——</div>
            </div>
          </div>
          <div class="mock-content">
            <div class="content-placeholder">
              <span>📋 内容区域</span>
            </div>
          </div>
        </div>
        <ul class="scheme-notes">
          <li>点击“电站信息”折叠，底部箭头展开</li>
          <li>折叠后悬停图标显示文字提示</li>
          <li>底部按钮也有 Tooltip 说明</li>
        </ul>
      </div>
    </div>

    <div class="interaction-tip">
      <h3>💡 使用建议</h3>
      <p>
        · <strong>方案1</strong>：适合明确入口（电站信息）后需要释放屏幕空间的场景。<br>
        · <strong>方案2</strong>：提供完全的手动控制，用户可按需折叠/展开，最灵活。<br>
        · <strong>方案3</strong>：折叠后仍可通过悬停识别菜单项，适合新手或需要保留一定可发现性的场景。<br>
        实际实现时请将折叠状态提升至全局状态（如 Pinia），并同步路由切换时的行为。
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { 
  PieChart, Sunny, Tools, Cpu, Money, DArrowRight, DArrowLeft
} from '@element-plus/icons-vue'

const menuItems = [
  { key: 'dashboard', label: '电站概览', icon: PieChart },
  { key: 'station-info', label: '电站信息', icon: Sunny },
  { key: 'operation-new', label: '运维管理', icon: Tools },
  { key: 'ai', label: 'AI 助手', icon: Cpu },
  { key: 'business', label: '经营管理', icon: Money }
]

const scheme1Collapsed = ref(false)
const scheme2Collapsed = ref(false)
const scheme3Collapsed = ref(false)
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.preview-page {
  padding: 24px 20px;
  max-width: 1500px;
  margin: 0 auto;
  font-family: system-ui, -apple-system, 'Microsoft YaHei', sans-serif;
  background: #f0f2f5;
  min-height: 100vh;
}

.page-title {
  text-align: center;
  margin-bottom: 8px;
  color: #1e1e1e;
  font-weight: 600;
  font-size: 26px;
}

.page-desc {
  text-align: center;
  color: #555;
  margin-bottom: 30px;
  font-size: 14px;
}

.schemes-row {
  display: flex;
  gap: 24px;
  justify-content: center;
  flex-wrap: wrap;
}

.scheme-column {
  flex: 1 1 300px;
  min-width: 320px;
  max-width: 400px;
  background: #ffffff;
  border-radius: 24px;
  padding: 20px 16px 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  transition: transform 0.15s;
}

.scheme-column:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
}

.scheme-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #eef2f6;
}

.badge {
  padding: 4px 10px;
  border-radius: 30px;
  font-size: 12px;
  font-weight: 600;
  color: white;
}

.badge.scheme1 { background: #409eff; }
.badge.scheme2 { background: #67c23a; }
.badge.scheme3 { background: #e6a23c; }

.mock-app {
  display: flex;
  height: 360px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.05);
  background: #fff;
  margin-bottom: 12px;
}

.mock-sidebar {
  background: #ffffff;
  border-right: 1px solid #ebeef5;
  display: flex;
  flex-direction: column;
  padding: 12px 0;
  box-shadow: 2px 0 8px rgba(0,0,0,0.02);
  transition: width 0.25s ease;
  position: relative;
}

.sidebar-inner {
  padding: 0 8px;
  flex: 1;
}

.nav-item-full {
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
.nav-item-full:hover {
  background: #ecf5ff;
  color: #409eff;
}
.nav-text {
  margin-left: 10px;
  transition: opacity 0.2s;
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
  gap: 4px;
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
.expand-placeholder {
  text-align: center;
  color: #ccc;
  font-size: 12px;
}

.mock-content {
  flex: 1;
  background: #f9fafc;
  display: flex;
  align-items: center;
  justify-content: center;
}

.content-placeholder {
  padding: 20px;
  color: #aaa;
  font-size: 16px;
  border: 2px dashed #d0d7de;
  border-radius: 20px;
  background: #fff;
  width: 80%;
  text-align: center;
}

.scheme-notes {
  margin: 12px 0 0;
  padding-left: 20px;
  color: #666;
  font-size: 13px;
  line-height: 1.6;
}

.interaction-tip {
  margin-top: 36px;
  background: #e6f7ff;
  border-radius: 20px;
  padding: 20px 28px;
  border-left: 6px solid #1890ff;
}

.interaction-tip h3 {
  margin: 0 0 8px;
  color: #1e1e1e;
}

.interaction-tip p {
  margin: 0;
  color: #333;
  line-height: 1.6;
}
</style>