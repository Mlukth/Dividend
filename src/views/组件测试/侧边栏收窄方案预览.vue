<template>
  <div class="preview-page">
    <h2 class="page-title">📐 侧边栏宽度方案对比（三列并列）</h2>
    <p class="page-desc">
      左侧为侧边栏预览，右侧为模拟内容区。您可对比不同宽度下导航栏的视觉效果。<br>
      当前图标已使用 Element Plus 替换 Emoji，菜单项已移除“旧-基本信息”和“旧-运维管理”。
    </p>

    <div class="schemes-row">
      <!-- 方案一：超窄（仅图标） -->
      <div class="scheme-column">
        <div class="scheme-label">
          <span class="badge narrow">方案 A</span>
          <strong>超窄 · 仅图标</strong>
          <span class="width-value">宽度 80px</span>
        </div>
        <div class="mock-app narrow-sidebar">
          <div class="mock-sidebar" style="width: 80px;">
            <div class="sidebar-inner">
              <div class="nav-item-icon-only" v-for="item in menuItems" :key="item.key">
                <el-icon :size="22"><component :is="item.icon" /></el-icon>
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
          <li>仅显示图标，悬停可提示文字（实际项目需加 tooltip）</li>
          <li>最大化节省横向空间</li>
        </ul>
      </div>

      <!-- 方案二：适中宽度（图标+文字） -->
      <div class="scheme-column">
        <div class="scheme-label">
          <span class="badge medium">方案 B</span>
          <strong>适中 · 图标+文字</strong>
          <span class="width-value">宽度 160px</span>
        </div>
        <div class="mock-app medium-sidebar">
          <div class="mock-sidebar" style="width: 160px;">
            <div class="sidebar-inner">
              <div class="nav-item-full" v-for="item in menuItems" :key="item.key">
                <el-icon :size="20"><component :is="item.icon" /></el-icon>
                <span class="nav-text">{{ item.label }}</span>
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
          <li>平衡图标与文字展示</li>
          <li>适合大多数后台系统</li>
          <li>文字完整显示，阅读舒适</li>
        </ul>
      </div>

      <!-- 方案三：常规宽度（原有尺寸优化） -->
      <div class="scheme-column">
        <div class="scheme-label">
          <span class="badge wide">方案 C</span>
          <strong>常规 · 图标+文字（宽松）</strong>
          <span class="width-value">宽度 220px</span>
        </div>
        <div class="mock-app wide-sidebar">
          <div class="mock-sidebar" style="width: 220px;">
            <div class="sidebar-inner">
              <div class="nav-item-full" v-for="item in menuItems" :key="item.key">
                <el-icon :size="20"><component :is="item.icon" /></el-icon>
                <span class="nav-text">{{ item.label }}</span>
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
          <li>当前修改后的默认宽度（原200px，微调至220px）</li>
          <li>文字与图标间距充足</li>
          <li>适合多级菜单展开显示</li>
        </ul>
      </div>
    </div>

    <!-- 交互说明 -->
    <div class="interaction-tip">
      <h3>💡 实际应用时需配合调整</h3>
      <p>
        选择方案后，修改 <code>src/components/AppSidebar.vue</code> 中 <code>.sidebar</code> 的 <code>width</code> 值即可。<br>
        若采用超窄方案，建议添加 <code>el-tooltip</code> 显示菜单文字，或保留悬浮展开效果。
      </p>
    </div>
  </div>
</template>

<script setup>
import { 
  PieChart, Sunny, Tools, Cpu, Money
} from '@element-plus/icons-vue'

const menuItems = [
  { key: 'dashboard', label: '电站概览', icon: PieChart },
  { key: 'station-info', label: '电站信息', icon: Sunny },
  { key: 'operation-new', label: '运维管理', icon: Tools },
  { key: 'ai', label: 'AI 助手', icon: Cpu },
  { key: 'business', label: '经营管理', icon: Money }
]
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

.badge.narrow { background: #e6a23c; }
.badge.medium { background: #409eff; }
.badge.wide { background: #67c23a; }

.width-value {
  margin-left: auto;
  font-family: 'SF Mono', monospace;
  background: #f5f7fa;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 13px;
  color: #606266;
}

/* 模拟整体 App 布局 */
.mock-app {
  display: flex;
  height: 400px;
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
  transition: width 0.2s;
}

.sidebar-inner {
  padding: 0 8px;
}

/* 仅图标模式 */
.nav-item-icon-only {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  margin: 4px 0;
  border-radius: 12px;
  color: #555;
  cursor: default;
  transition: all 0.15s;
}
.nav-item-icon-only:hover {
  background: #ecf5ff;
  color: #409eff;
}

/* 完整模式 */
.nav-item-full {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  margin: 2px 0;
  border-radius: 12px;
  color: #333;
  font-size: 14px;
  font-weight: 500;
  cursor: default;
  transition: all 0.15s;
  white-space: nowrap;
}
.nav-item-full:hover {
  background: #ecf5ff;
  color: #409eff;
}
.nav-text {
  margin-left: 10px;
}

/* 内容区模拟 */
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

.interaction-tip code {
  background: #fff;
  padding: 3px 8px;
  border-radius: 8px;
  font-family: monospace;
  color: #d63384;
}
</style>