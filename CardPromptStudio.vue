<template>
  <div class="card-studio">
    <!-- 顶部装饰区 -->
    <div class="studio-header">
      <div class="bonfire">
        <div class="flame" />
        <span class="bonfire-label">提示词工坊</span>
      </div>
      <div class="header-stats">
        <span>📋 卡片 {{ cards.length }} 张</span>
        <span v-if="copyPromptMode">🔗 拼接模式已启用</span>
        <span v-else>📄 直接复制模式</span>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="studio-main">
      <!-- 控制栏 - 上半区 -->
      <div class="control-panel">
        <!-- 左：新建卡片 -->
        <div class="input-area">
          <div class="input-label">
            <span class="label-icon">✨</span> 新建卡片内容
          </div>
          <el-input
            v-model="newCardContent"
            type="textarea"
            :rows="2"
            placeholder="输入卡片内容，例如：Vue3 组合式 API 的响应式原理..."
            class="studio-input"
          />
          <el-button type="primary" class="gold-btn" :icon="Plus" @click="addCard">
            添加卡片
          </el-button>
        </div>

        <!-- 右：提示词配置区 -->
        <div class="prompt-area">
          <div class="input-label">
            <span class="label-icon">⚡</span> 提示词模板
            <el-switch
              v-model="copyPromptMode"
              active-text="拼接模式"
              inactive-text="普通模式"
              size="small"
              class="mode-switch"
            />
          </div>
          <el-input
            v-model="promptTemplate"
            type="textarea"
            :rows="2"
            placeholder="输入提示词前缀，例如：请分析以下内容并给出优化建议："
            class="studio-input"
          />
          <div class="preview-tip" v-if="copyPromptMode">
            预览：{{ promptTemplate }} + [卡片内容]
          </div>
          <div class="preview-tip" v-else>
            点击卡片将直接复制卡片内容
          </div>
        </div>
      </div>

      <!-- 样式切换栏 -->
      <div class="style-bar">
        <span class="style-label">🎨 卡片样式</span>
        <el-radio-group v-model="cardStyle" size="small" class="style-group">
          <el-radio-button value="grid">网格视图</el-radio-button>
          <el-radio-button value="list">列表视图</el-radio-button>
          <el-radio-button value="compact">紧凑视图</el-radio-button>
        </el-radio-group>
        <el-button size="small" text @click="clearAllCards" class="clear-btn" :disabled="cards.length === 0">
          🗑️ 清空所有
        </el-button>
      </div>

      <!-- 卡片列表容器 (动态样式) -->
      <div :class="['cards-container', cardStyle]">
        <div
          v-for="(card, idx) in cards"
          :key="card.id"
          class="spire-card"
          :class="[cardStyle === 'list' ? 'list-mode-card' : '', cardStyle === 'compact' ? 'compact-mode-card' : '']"
          @click="copyCardContent(card)"
        >
          <!-- 能量球（稀有度装饰，按使用次数/序号显示） -->
          <div class="energy-orb" :class="getOrbClass(card)">
            <span class="orb-num">{{ (idx % 3) + 1 }}</span>
          </div>

          <!-- 卡图区（纯装饰） -->
          <div class="card-art" :style="artGradient">
            <div class="art-symbol">📝</div>
          </div>

          <!-- 类型横幅（简化装饰） -->
          <div class="type-banner">
            <span>PROMPT CARD</span>
          </div>

          <!-- 描述框 -->
          <div class="desc-box">
            <div class="card-name">{{ card.name }}</div>
            <div class="card-desc">{{ card.content }}</div>
            <div class="meta-line">
              <span class="copy-hint">✚ 点击复制</span>
              <el-button
                size="small"
                text
                class="delete-btn"
                @click.stop="deleteCard(card.id)"
              >
                🗑️
              </el-button>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="cards.length === 0" class="empty-state">
          <div class="empty-icon">📭</div>
          <div>暂无卡片，在左侧输入内容后点击“添加卡片”</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

// ==================== 数据 ====================
const newCardContent = ref('')
const promptTemplate = ref('请分析以下内容并给出建议：')
const copyPromptMode = ref(false)
const cardStyle = ref('grid') // 'grid' | 'list' | 'compact'

const cards = ref([
  {
    id: 1,
    name: '卡片 #1',
    content: 'Vue3 响应式原理基于 Proxy，能够拦截对象属性的读取和修改。',
    copyCount: 0
  },
  {
    id: 2,
    name: '卡片 #2',
    content: '组合式 API 将逻辑相关代码聚合在一起，提升代码可维护性。',
    copyCount: 0
  }
])

let nextId = 3

// ==================== 辅助方法 ====================
const artGradient = computed(() => 'linear-gradient(160deg, #1a1a2a 0%, #0f0f1a 60%, #08080d 100%)')

const getOrbClass = (card) => {
  const count = card.copyCount || 0
  if (count >= 10) return 'gold'
  if (count >= 5) return 'silver'
  if (count >= 2) return 'bronze'
  return 'copper'
}

// 添加卡片
const addCard = () => {
  const content = newCardContent.value.trim()
  if (!content) {
    ElMessage.warning('请输入卡片内容')
    return
  }
  cards.value.unshift({
    id: nextId++,
    name: `卡片 #${nextId - 1}`,
    content: content,
    copyCount: 0
  })
  newCardContent.value = ''
  ElMessage.success('卡片已添加')
}

// 删除卡片
const deleteCard = (id) => {
  cards.value = cards.value.filter(c => c.id !== id)
  ElMessage.success('已删除卡片')
}

// 清空所有卡片
const clearAllCards = () => {
  if (cards.value.length === 0) return
  cards.value = []
  ElMessage.success('已清空所有卡片')
}

// 复制卡片内容（核心逻辑）
const copyCardContent = (card) => {
  let textToCopy = ''
  if (copyPromptMode.value) {
    // 拼接模式：提示词模板 + 卡片内容
    const prefix = promptTemplate.value.trim()
    textToCopy = prefix ? `${prefix}\n\n${card.content}` : card.content
  } else {
    // 普通模式：仅卡片内容
    textToCopy = card.content
  }

  navigator.clipboard.writeText(textToCopy).then(() => {
    // 更新复制次数（用于能量球等级）
    card.copyCount = (card.copyCount || 0) + 1
    const modeText = copyPromptMode.value ? '（拼接模式）' : ''
    ElMessage.success(`已复制：${card.name} ${modeText}`)
  }).catch(() => {
    ElMessage.error('复制失败，请检查权限')
  })
}
</script>

<style scoped>
/* ========== 基础风格继承杀戮尖塔主题 ========== */
.card-studio {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #0d0805;
  color: #d4c8a8;
  font-family: 'SimSun', 'Source Han Serif SC', 'Noto Serif SC', serif;
  border-radius: 8px;
  overflow: hidden;
}

/* 顶部区域 */
.studio-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: #140e09;
  border-bottom: 1px solid #2a1f14;
  flex-shrink: 0;
}
.bonfire {
  display: flex;
  align-items: center;
  gap: 8px;
}
.flame {
  width: 12px;
  height: 18px;
  background: #d4793a;
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  box-shadow: 0 0 8px #d4793a;
  animation: flicker 0.6s ease-in-out infinite alternate;
}
@keyframes flicker {
  0% { box-shadow: 0 0 6px #d4793a; }
  100% { box-shadow: 0 0 10px #e8904a; }
}
.bonfire-label {
  font-size: 12px;
  color: #8a7a6a;
  letter-spacing: 2px;
}
.header-stats {
  font-size: 11px;
  color: #6a5a4a;
  font-family: monospace;
  display: flex;
  gap: 16px;
}

/* 主内容 */
.studio-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow: hidden;
}

/* 控制面板 */
.control-panel {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  flex-shrink: 0;
}
.input-area, .prompt-area {
  flex: 1;
  min-width: 240px;
  background: rgba(20, 14, 9, 0.6);
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #2a1f14;
}
.input-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  font-weight: 600;
  color: #c8a45c;
  margin-bottom: 8px;
}
.label-icon {
  font-size: 14px;
  margin-right: 6px;
}
.mode-switch {
  margin-left: 12px;
}
.studio-input {
  margin-bottom: 10px;
}
.preview-tip {
  font-size: 11px;
  color: #8a7a6a;
  margin-top: 6px;
  font-style: italic;
}

/* 样式切换栏 */
.style-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 12px;
  background: #100a06;
  border-radius: 6px;
  margin-bottom: 20px;
  flex-shrink: 0;
  border: 1px solid #2a1f14;
}
.style-label {
  font-size: 12px;
  color: #8a7a6a;
}
.style-group :deep(.el-radio-button__inner) {
  background: transparent;
  border-color: #2a1f14;
  color: #6a5a4a;
  font-size: 11px;
}
.style-group :deep(.is-active .el-radio-button__inner) {
  background: rgba(200, 164, 92, 0.1);
  border-color: #8a6d2b;
  color: #c8a45c;
}
.clear-btn {
  color: #8a6a5a;
  margin-left: auto;
}
.clear-btn:hover {
  color: #c8a45c;
}

/* ========== 卡片容器 & 多版式核心 ========== */
.cards-container {
  flex: 1;
  overflow-y: auto;
  padding: 4px;
}
/* 网格模式 */
.cards-container.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
  align-content: start;
}
/* 列表模式 */
.cards-container.list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
/* 紧凑模式 */
.cards-container.compact {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  align-content: start;
}

/* ========== 卡片样式（继承源文件风格） ========== */
.spire-card {
  position: relative;
  background: #1a1108;
  border: 2px solid #3a2a1a;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s, border-color 0.2s;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
}
.spire-card:hover {
  transform: translateY(-4px);
  border-color: #8a6d2b;
}
/* 列表模式下的卡片宽度100% */
.cards-container.list .spire-card {
  width: 100%;
}
/* 紧凑模式下内部间距微调 */
.compact-mode-card .desc-box {
  padding: 6px 8px;
}
.compact-mode-card .card-name {
  font-size: 12px;
}
.compact-mode-card .card-desc {
  font-size: 10px;
  -webkit-line-clamp: 3;
}

/* 能量球 */
.energy-orb {
  position: absolute;
  top: 8px;
  left: 8px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
  border: 2px solid;
}
.energy-orb.copper { background: radial-gradient(circle at 40% 35%, #4a3020, #2a1a10); border-color: #4a3020; color: #8a6a5a; }
.energy-orb.bronze { background: radial-gradient(circle at 40% 35%, #6b4226, #3a2010); border-color: #8b5a2b; color: #c8a080; }
.energy-orb.silver { background: radial-gradient(circle at 40% 35%, #7a7a7a, #3a3a3a); border-color: #a0a0a0; color: #e0e0e0; }
.energy-orb.gold   { background: radial-gradient(circle at 40% 35%, #c8a040, #6a4a10); border-color: #c8a45c; color: #ffe8a0; box-shadow: 0 0 8px rgba(200,160,40,0.4); }
.orb-num { font-size: 12px; font-weight: bold; }

/* 卡图区 */
.card-art {
  height: 38%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}
.card-art::after {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px);
  pointer-events: none;
}
.art-symbol {
  font-size: 32px;
  opacity: 0.4;
  z-index: 1;
  text-shadow: 0 2px 8px black;
}

/* 类型横幅 */
.type-banner {
  height: 4px;
  margin: 0 10px;
  background: #6b4a2a;
  border-radius: 0 0 3px 3px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.type-banner span {
  font-size: 8px;
  letter-spacing: 2px;
  color: #1a1108;
  font-weight: bold;
  background: #6b4a2a;
  padding: 0 6px;
  transform: translateY(-1px);
}

/* 描述框 */
.desc-box {
  flex: 1;
  padding: 8px 10px 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-top: 1px solid rgba(200,164,92,0.08);
  background: linear-gradient(180deg, rgba(20,10,5,0.6) 0%, rgba(15,8,3,0.9) 100%);
}
.card-name {
  font-size: 14px;
  font-weight: bold;
  color: #e0d4b8;
}
.card-desc {
  font-size: 11px;
  color: #8a7a6a;
  line-height: 1.5;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  flex: 1;
  word-break: break-word;
}
.meta-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
  font-size: 9px;
  color: #5a4a3a;
}
.copy-hint {
  font-size: 9px;
  letter-spacing: 1px;
  opacity: 0.6;
}
.delete-btn {
  font-size: 12px;
  padding: 0 4px;
  color: #8a6a5a;
}
.delete-btn:hover {
  color: #e8904a;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #6a5a4a;
  font-size: 13px;
}
.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

/* 滚动条 */
.cards-container::-webkit-scrollbar {
  width: 6px;
}
.cards-container::-webkit-scrollbar-thumb {
  background: #2a1f14;
  border-radius: 3px;
}

/* Element Plus 控件覆盖 */
:deep(.el-textarea__inner) {
  background: #100a06;
  border-color: #2a1f14;
  color: #d4c8a8;
  font-family: monospace;
}
:deep(.el-textarea__inner::placeholder) {
  color: #4a3a2a;
}
.gold-btn {
  background: #5a3a1a !important;
  border: 1px solid #8b6a3a !important;
  color: #e0d4b8 !important;
  width: 100%;
}
.gold-btn:hover {
  background: #6a4a2a !important;
  border-color: #a0804a !important;
}
</style>