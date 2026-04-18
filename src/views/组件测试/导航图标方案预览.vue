<template>
  <div class="preview-container">
    <h2>🖼️ 导航栏图标方案预览（4套候选）</h2>
    <p class="subtitle">
      点击任意图标可复制组件名称 |
      <a href="https://element-plus.org/zh-CN/component/icon.html" target="_blank">官方图标库</a>
    </p>

    <!-- 图例说明 -->
    <div class="legend">
      <span>📊 电站概览</span> <span>🏠 电站信息</span> <span>🔧 运维管理</span> <span>🤖 AI 助手</span>
      <span>💰 经营管理</span> <span>📄 旧-基本信息</span> <span>⚙️ 旧-运维管理</span>
    </div>

    <!-- 方案1：语义直译版（最贴近原emoji含义） -->
    <div class="scheme-card">
      <div class="scheme-header">
        <h3>📋 方案一：语义直译版</h3>
        <span class="badge">推荐 · 最贴近原emoji含义</span>
      </div>
      <div class="scheme-desc">图标语义与菜单文字一一对应，用户无需学习即可理解</div>
      <div class="scheme-grid">
        <div class="menu-preview-item" @click="copyIconName('DataAnalysis')">
          <div class="icon-box blue"><el-icon :size="24"><DataAnalysis /></el-icon></div>
          <span class="icon-name">DataAnalysis</span>
          <span class="menu-label">电站概览</span>
        </div>
        <div class="menu-preview-item" @click="copyIconName('HomeFilled')">
          <div class="icon-box green"><el-icon :size="24"><HomeFilled /></el-icon></div>
          <span class="icon-name">HomeFilled</span>
          <span class="menu-label">电站信息</span>
        </div>
        <div class="menu-preview-item" @click="copyIconName('Tools')">
          <div class="icon-box orange"><el-icon :size="24"><Tools /></el-icon></div>
          <span class="icon-name">Tools</span>
          <span class="menu-label">运维管理</span>
        </div>
        <div class="menu-preview-item" @click="copyIconName('Cpu')">
          <div class="icon-box purple"><el-icon :size="24"><Cpu /></el-icon></div>
          <span class="icon-name">Cpu</span>
          <span class="menu-label">AI 助手</span>
        </div>
        <div class="menu-preview-item" @click="copyIconName('Money')">
          <div class="icon-box gold"><el-icon :size="24"><Money /></el-icon></div>
          <span class="icon-name">Money</span>
          <span class="menu-label">经营管理</span>
        </div>
        <div class="menu-preview-item" @click="copyIconName('Document')">
          <div class="icon-box gray"><el-icon :size="24"><Document /></el-icon></div>
          <span class="icon-name">Document</span>
          <span class="menu-label">旧-基本信息</span>
        </div>
        <div class="menu-preview-item" @click="copyIconName('Setting')">
          <div class="icon-box cyan"><el-icon :size="24"><Setting /></el-icon></div>
          <span class="icon-name">Setting</span>
          <span class="menu-label">旧-运维管理</span>
        </div>
      </div>
    </div>

    <!-- 方案2：数据可视化风格（图表类图标，强调监控与数据） -->
    <div class="scheme-card">
      <div class="scheme-header">
        <h3>📈 方案二：数据可视化风格</h3>
        <span class="badge">适合 · 强调图表与实时数据</span>
      </div>
      <div class="scheme-desc">使用图表、监控类图标，突出电站运营的实时数据监控氛围</div>
      <div class="scheme-grid">
        <div class="menu-preview-item" @click="copyIconName('TrendCharts')">
          <div class="icon-box blue"><el-icon :size="24"><TrendCharts /></el-icon></div>
          <span class="icon-name">TrendCharts</span>
          <span class="menu-label">电站概览</span>
        </div>
        <div class="menu-preview-item" @click="copyIconName('Monitor')">
          <div class="icon-box green"><el-icon :size="24"><Monitor /></el-icon></div>
          <span class="icon-name">Monitor</span>
          <span class="menu-label">电站信息</span>
        </div>
        <div class="menu-preview-item" @click="copyIconName('Operation')">
          <div class="icon-box orange"><el-icon :size="24"><Operation /></el-icon></div>
          <span class="icon-name">Operation</span>
          <span class="menu-label">运维管理</span>
        </div>
        <div class="menu-preview-item" @click="copyIconName('MagicStick')">
          <div class="icon-box purple"><el-icon :size="24"><MagicStick /></el-icon></div>
          <span class="icon-name">MagicStick</span>
          <span class="menu-label">AI 助手</span>
        </div>
        <div class="menu-preview-item" @click="copyIconName('DataLine')">
          <div class="icon-box gold"><el-icon :size="24"><DataLine /></el-icon></div>
          <span class="icon-name">DataLine</span>
          <span class="menu-label">经营管理</span>
        </div>
        <div class="menu-preview-item" @click="copyIconName('Files')">
          <div class="icon-box gray"><el-icon :size="24"><Files /></el-icon></div>
          <span class="icon-name">Files</span>
          <span class="menu-label">旧-基本信息</span>
        </div>
        <div class="menu-preview-item" @click="copyIconName('SetUp')">
          <div class="icon-box cyan"><el-icon :size="24"><SetUp /></el-icon></div>
          <span class="icon-name">SetUp</span>
          <span class="menu-label">旧-运维管理</span>
        </div>
      </div>
    </div>

    <!-- 方案3：系统管理风格（通用后台管理系统常见图标） -->
    <div class="scheme-card">
      <div class="scheme-header">
        <h3>🖥️ 方案三：系统管理风格</h3>
        <span class="badge">通用 · 后台管理常用图标</span>
      </div>
      <div class="scheme-desc">采用通用后台管理系统常见图标组合，风格简洁统一</div>
      <div class="scheme-grid">
        <div class="menu-preview-item" @click="copyIconName('Odometer')">
          <div class="icon-box blue"><el-icon :size="24"><Odometer /></el-icon></div>
          <span class="icon-name">Odometer</span>
          <span class="menu-label">电站概览</span>
        </div>
        <div class="menu-preview-item" @click="copyIconName('OfficeBuilding')">
          <div class="icon-box green"><el-icon :size="24"><OfficeBuilding /></el-icon></div>
          <span class="icon-name">OfficeBuilding</span>
          <span class="menu-label">电站信息</span>
        </div>
        <div class="menu-preview-item" @click="copyIconName('Management')">
          <div class="icon-box orange"><el-icon :size="24"><Management /></el-icon></div>
          <span class="icon-name">Management</span>
          <span class="menu-label">运维管理</span>
        </div>
        <div class="menu-preview-item" @click="copyIconName('Guide')">
          <div class="icon-box purple"><el-icon :size="24"><Guide /></el-icon></div>
          <span class="icon-name">Guide</span>
          <span class="menu-label">AI 助手</span>
        </div>
        <div class="menu-preview-item" @click="copyIconName('Wallet')">
          <div class="icon-box gold"><el-icon :size="24"><Wallet /></el-icon></div>
          <span class="icon-name">Wallet</span>
          <span class="menu-label">经营管理</span>
        </div>
        <div class="menu-preview-item" @click="copyIconName('Reading')">
          <div class="icon-box gray"><el-icon :size="24"><Reading /></el-icon></div>
          <span class="icon-name">Reading</span>
          <span class="menu-label">旧-基本信息</span>
        </div>
        <div class="menu-preview-item" @click="copyIconName('Tools')">
          <div class="icon-box cyan"><el-icon :size="24"><Tools /></el-icon></div>
          <span class="icon-name">Tools</span>
          <span class="menu-label">旧-运维管理</span>
        </div>
      </div>
    </div>

    <!-- 方案4：光伏业务风格（体现电站行业特色） -->
    <div class="scheme-card">
      <div class="scheme-header">
        <h3>☀️ 方案四：光伏业务风格</h3>
        <span class="badge">特色 · 体现新能源/光伏行业</span>
      </div>
      <div class="scheme-desc">使用与光伏、能源、电站相关的图标，增强行业识别度</div>
      <div class="scheme-grid">
        <div class="menu-preview-item" @click="copyIconName('PieChart')">
          <div class="icon-box blue"><el-icon :size="24"><PieChart /></el-icon></div>
          <span class="icon-name">PieChart</span>
          <span class="menu-label">电站概览</span>
        </div>
        <div class="menu-preview-item" @click="copyIconName('Sunny')">
          <div class="icon-box green"><el-icon :size="24"><Sunny /></el-icon></div>
          <span class="icon-name">Sunny</span>
          <span class="menu-label">电站信息</span>
        </div>
        <div class="menu-preview-item" @click="copyIconName('Connection')">
          <div class="icon-box orange"><el-icon :size="24"><Connection /></el-icon></div>
          <span class="icon-name">Connection</span>
          <span class="menu-label">运维管理</span>
        </div>
        <div class="menu-preview-item" @click="copyIconName('Aim')">
          <div class="icon-box purple"><el-icon :size="24"><Aim /></el-icon></div>
          <span class="icon-name">Aim</span>
          <span class="menu-label">AI 助手</span>
        </div>
        <div class="menu-preview-item" @click="copyIconName('Coin')">
          <div class="icon-box gold"><el-icon :size="24"><Coin /></el-icon></div>
          <span class="icon-name">Coin</span>
          <span class="menu-label">经营管理</span>
        </div>
        <div class="menu-preview-item" @click="copyIconName('Memo')">
          <div class="icon-box gray"><el-icon :size="24"><Memo /></el-icon></div>
          <span class="icon-name">Memo</span>
          <span class="menu-label">旧-基本信息</span>
        </div>
        <div class="menu-preview-item" @click="copyIconName('Switch')">
          <div class="icon-box cyan"><el-icon :size="24"><Switch /></el-icon></div>
          <span class="icon-name">Switch</span>
          <span class="menu-label">旧-运维管理</span>
        </div>
      </div>
    </div>

    <!-- 推荐总结 -->
    <div class="recommendation">
      <h4>💡 选择建议</h4>
      <ul>
        <li><strong>方案一</strong>：最直观，图标含义与菜单文字完全对应，适合用户快速上手</li>
        <li><strong>方案二</strong>：突出数据可视化氛围，适合强调电站运营监控的主视觉</li>
        <li><strong>方案三</strong>：最接近主流后台管理系统的视觉习惯，风格稳妥统一</li>
        <li><strong>方案四</strong>：突出光伏行业特色，增强品牌识别度和专业感</li>
      </ul>
      <p>你可以挑选其中一套，也可以自由组合各方案中的单个图标（点击即可复制组件名）。</p>
    </div>

    <!-- 复制提示 -->
    <transition name="fade">
      <div v-if="showTip" class="copy-tip">
        📋 已复制: {{ copiedName }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  // 方案1
  DataAnalysis, HomeFilled, Tools, Cpu, Money, Document, Setting,
  // 方案2
  TrendCharts, Monitor, Operation, MagicStick, DataLine, Files, SetUp,
  // 方案3
  Odometer, OfficeBuilding, Management, Guide, Wallet, Reading,
  // 方案4
  PieChart, Sunny, Connection, Aim, Coin, Memo, Switch
} from '@element-plus/icons-vue'

const showTip = ref(false)
const copiedName = ref('')

const copyIconName = (name) => {
  navigator.clipboard.writeText(name).then(() => {
    copiedName.value = name
    showTip.value = true
    ElMessage.success(`已复制: ${name}`)
    setTimeout(() => {
      showTip.value = false
    }, 1500)
  }).catch(() => {
    ElMessage.info(`图标名: ${name}`)
  })
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.preview-container {
  padding: 24px 32px;
  max-width: 1400px;
  margin: 0 auto;
  font-family: system-ui, -apple-system, 'Microsoft YaHei', sans-serif;
  background: #f5f7fa;
  min-height: 100vh;
}

h2 {
  text-align: center;
  color: #1a1a1a;
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 28px;
}

.subtitle {
  text-align: center;
  color: #666;
  font-size: 14px;
  margin-bottom: 20px;
}

.subtitle a {
  color: #409EFF;
  text-decoration: none;
}

.subtitle a:hover {
  text-decoration: underline;
}

.legend {
  display: flex;
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
  padding: 16px 20px;
  background: #fff;
  border-radius: 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  margin-bottom: 28px;
  font-size: 13px;
  color: #555;
}

.legend span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.scheme-card {
  background: #fff;
  border-radius: 20px;
  padding: 24px 28px;
  margin-bottom: 28px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.2s;
}

.scheme-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.scheme-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.scheme-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

.badge {
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 20px;
  background: #ecf5ff;
  color: #409EFF;
  font-weight: 500;
}

.scheme-desc {
  font-size: 13px;
  color: #888;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}

.scheme-grid {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 12px 8px;
}

.menu-preview-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 10px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #fafbfc;
  min-width: 100px;
  border: 1px solid transparent;
}

.menu-preview-item:hover {
  background: #ecf5ff;
  transform: translateY(-3px);
  border-color: #b3d8ff;
  box-shadow: 0 6px 12px rgba(64, 158, 255, 0.12);
}

.icon-box {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  color: #fff;
  transition: transform 0.2s;
}

.menu-preview-item:hover .icon-box {
  transform: scale(1.02);
}

.icon-box.blue { background: linear-gradient(145deg, #409EFF, #267de8); }
.icon-box.green { background: linear-gradient(145deg, #67C23A, #4ea819); }
.icon-box.orange { background: linear-gradient(145deg, #E6A23C, #d18e1f); }
.icon-box.purple { background: linear-gradient(145deg, #9B59B6, #8a47a5); }
.icon-box.gold { background: linear-gradient(145deg, #F39C12, #e08e0b); }
.icon-box.gray { background: linear-gradient(145deg, #909399, #7a7d82); }
.icon-box.cyan { background: linear-gradient(145deg, #00B4D8, #0096b4); }

.icon-name {
  font-size: 11px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  color: #777;
  margin-bottom: 4px;
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 20px;
}

.menu-label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.recommendation {
  background: #fff9e6;
  border-radius: 16px;
  padding: 20px 28px;
  border-left: 4px solid #e6a23c;
}

.recommendation h4 {
  margin: 0 0 12px 0;
  color: #1a1a1a;
  font-size: 16px;
}

.recommendation ul {
  margin: 0 0 12px 0;
  padding-left: 20px;
  color: #555;
  line-height: 1.8;
}

.recommendation p {
  margin: 0;
  color: #666;
  font-size: 13px;
}

.copy-tip {
  position: fixed;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  background: #1a1a1a;
  color: #fff;
  padding: 12px 28px;
  border-radius: 40px;
  font-size: 15px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  z-index: 9999;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>