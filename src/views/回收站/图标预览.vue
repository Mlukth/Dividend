<template>
  <div class="icon-preview-container">
    <h2>侧边栏菜单图标预览</h2>
    <p>以下为替代 Emoji 的 Element Plus 图标候选方案：</p>
    
    <div class="icon-grid">
      <div class="icon-card" v-for="item in iconList" :key="item.name">
        <div class="icon-wrapper">
          <component :is="item.icon" class="demo-icon" />
        </div>
        <span class="icon-label">{{ item.name }}</span>
        <span class="icon-desc">{{ item.desc }}</span>
      </div>
    </div>

    <div class="notes">
      <h3>📌 说明</h3>
      <ul>
        <li>图标大小通过 CSS 的 <code>font-size</code> 控制，当前为 32px。</li>
        <li>颜色会继承父级文字颜色，hover 或 active 状态自动适配。</li>
        <li>若需更换其他图标，请参考 <a href="https://element-plus.org/zh-CN/component/icon.html" target="_blank">Element Plus 图标库</a>。</li>
        <li>此页面仅为预览，不影响实际项目代码。</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { 
  DataAnalysis, HomeFilled, Tools, Robot, 
  Money, Document, Setting 
} from '@element-plus/icons-vue'

const iconList = [
  { icon: DataAnalysis, name: 'DataAnalysis', desc: '电站概览' },
  { icon: HomeFilled,   name: 'HomeFilled',   desc: '电站信息' },
  { icon: Tools,        name: 'Tools',        desc: '运维管理' },
  { icon: Robot,        name: 'Robot',        desc: 'AI 助手' },
  { icon: Money,        name: 'Money',        desc: '经营管理' },
  { icon: Document,     name: 'Document',     desc: '旧-基本信息' },
  { icon: Setting,      name: 'Setting',      desc: '旧-运维管理' }
]
</script>

<style scoped>
.icon-preview-container {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
  font-family: system-ui, -apple-system, sans-serif;
}

h2 {
  margin-bottom: 8px;
  color: #1a1a1a;
}

p {
  color: #555;
  margin-bottom: 24px;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.icon-card {
  background: white;
  border-radius: 12px;
  padding: 20px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.1s, box-shadow 0.2s;
}

.icon-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.icon-wrapper {
  width: 64px;
  height: 64px;
  background: #eef7ff;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  color: #0066cc;
}

.demo-icon {
  font-size: 32px;
}

.icon-label {
  font-weight: 600;
  font-size: 14px;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.icon-desc {
  font-size: 12px;
  color: #888;
}

.notes {
  background: white;
  border-radius: 12px;
  padding: 20px 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.notes h3 {
  margin-top: 0;
  margin-bottom: 12px;
  color: #1a1a1a;
}

.notes ul {
  padding-left: 20px;
  color: #555;
  line-height: 1.6;
}

.notes code {
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
}

.notes a {
  color: #0066cc;
  text-decoration: none;
}

.notes a:hover {
  text-decoration: underline;
}
</style>