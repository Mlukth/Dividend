<template>
  <div class="card-studio">
    <!-- 顶部装饰区 -->
    <div class="studio-header">
      <div class="bonfire">
        <div class="flame" />
        <span class="bonfire-label">提示词工坊</span>
      </div>
      <div class="header-stats">
        <span>📦 卡片 {{ cards.length }} 张</span>
        <span v-if="copyPromptMode">🔗 拼接模式</span>
        <span v-else>📄 直接复制</span>
        <span class="save-badge">💾 自动保存</span>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="studio-main">
      <!-- 上半区：新建卡片 + 提示词模板 -->
      <div class="control-row">
        <!-- 左侧：新建卡片区 -->
        <div class="card-creator">
          <div class="section-title">
            <span class="title-icon">✨</span> 新建卡片内容
          </div>
          <el-input
            v-model="newCardContent"
            type="textarea"
            :rows="3"
            placeholder="输入卡片内容，例如：Vue3 组合式 API 的响应式原理是基于 Proxy 实现的..."
            class="dark-input"
          />
          <el-button type="primary" class="gold-btn" :icon="Plus" @click="addCard">
            添加卡片
          </el-button>
        </div>

        <!-- 右侧：提示词模板区 -->
        <div class="prompt-editor">
          <div class="section-title">
            <span class="title-icon">⚡</span> 提示词模板
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
            :rows="3"
            placeholder="输入提示词前缀，例如：请分析以下内容并给出优化建议："
            class="dark-input"
          />
          <div class="preview-hint">
            <span v-if="copyPromptMode">🔗 点击卡片将复制：「{{ promptPreview }}」</span>
            <span v-else>📄 点击卡片将直接复制卡片原文</span>
          </div>
        </div>
      </div>

      <!-- 操作栏：导入 / 导出 + 清空 -->
      <div class="action-bar">
        <el-button size="small" class="action-btn" @click="exportCards">
          📤 导出卡片 (JSON)
        </el-button>
        <el-upload
          ref="uploadRef"
          :auto-upload="false"
          :show-file-list="false"
          accept=".json"
          :on-change="handleImportFile"
          class="import-upload"
        >
          <el-button size="small" class="action-btn">📥 导入卡片 (JSON)</el-button>
        </el-upload>
        <el-button size="small" class="action-btn clear-all" @click="clearAll" :disabled="cards.length === 0">
          🗑️ 清空全部
        </el-button>
      </div>

      <!-- 底部：卡片列表 -->
      <div class="cards-wrapper">
        <div class="cards-header">
          <span class="cards-title">📌 我的卡片</span>
          <span class="cards-count">{{ cards.length }} 张卡片</span>
        </div>
        <div class="cards-grid">
          <div
            v-for="(card, idx) in cards"
            :key="card.id"
            class="spire-card"
            @click="copyCardContent(card)"
          >
            <!-- 能量球 -->
            <div class="energy-orb" :class="getOrbClass(idx)">
              <span class="orb-num">{{ (idx % 3) + 1 }}</span>
            </div>

            <!-- 卡图区 -->
            <div class="card-art" :style="artGradient">
              <div class="art-symbol">📝</div>
            </div>

            <!-- 类型横幅 -->
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
          <div v-if="cards.length === 0" class="empty-card">
            <div class="empty-icon">📭</div>
            <div>暂无卡片，在左侧输入内容后点击“添加卡片”</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

// ==================== 存储 key ====================
const STORAGE_KEY = 'prompt_card_studio'

// ==================== 响应式数据 ====================
const newCardContent = ref('')
const promptTemplate = ref('请分析以下内容并给出建议：')
const copyPromptMode = ref(false)   // false: 直接复制卡片内容; true: 拼接提示词+卡片内容
const cards = ref([])

let nextId = 1

// 预览拼接内容（仅用于显示提示）
const promptPreview = computed(() => {
  const previewCard = '示例卡片内容...'
  const prefix = promptTemplate.value.trim()
  return prefix ? `${prefix} ${previewCard}` : previewCard
})

// 卡片图装饰背景（固定样式）
const artGradient = computed(() => 'linear-gradient(160deg, #1a1a2a 0%, #0f0f1a 60%, #08080d 100%)')

// 能量球等级（按索引，纯装饰）
const getOrbClass = (index) => {
  const mod = index % 4
  if (mod === 0) return 'copper'
  if (mod === 1) return 'bronze'
  if (mod === 2) return 'silver'
  return 'gold'
}

// ==================== 持久化存储 ====================
// 保存所有数据到 localStorage
const saveToLocalStorage = () => {
  const dataToStore = {
    cards: cards.value,
    promptTemplate: promptTemplate.value,
    copyPromptMode: copyPromptMode.value,
    nextId: nextId
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore))
}

// 从 localStorage 加载数据
const loadFromLocalStorage = () => {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return false
  try {
    const data = JSON.parse(raw)
    cards.value = data.cards || []
    promptTemplate.value = data.promptTemplate || '请分析以下内容并给出建议：'
    copyPromptMode.value = data.copyPromptMode || false
    nextId = data.nextId || 1
    return true
  } catch (e) {
    console.error('读取存储失败', e)
    return false
  }
}

// 监听数据变化，自动保存
watch([cards, promptTemplate, copyPromptMode], () => {
  saveToLocalStorage()
}, { deep: true })

// ==================== 卡片操作 ====================
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
  })
  newCardContent.value = ''
  ElMessage.success('卡片已添加')
}

// 删除卡片
const deleteCard = (id) => {
  cards.value = cards.value.filter(c => c.id !== id)
  ElMessage.success('已删除')
}

// 清空所有卡片
const clearAll = async () => {
  if (cards.value.length === 0) return
  try {
    await ElMessageBox.confirm('确定要清空所有卡片吗？此操作不可撤销。', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      background: '#140e09',
      confirmButtonClass: 'gold-btn',
    })
    cards.value = []
    ElMessage.success('已清空所有卡片')
  } catch {
    // 取消操作
  }
}

// 复制逻辑（核心）
const copyCardContent = (card) => {
  let textToCopy = ''
  if (copyPromptMode.value) {
    const prefix = promptTemplate.value.trim()
    textToCopy = prefix ? `${prefix}\n\n${card.content}` : card.content
  } else {
    textToCopy = card.content
  }

  navigator.clipboard.writeText(textToCopy).then(() => {
    const modeHint = copyPromptMode.value ? '（拼接模式）' : ''
    ElMessage.success(`已复制：${card.name} ${modeHint}`)
  }).catch(() => {
    ElMessage.error('复制失败，请检查权限')
  })
}

// ==================== 导入 / 导出 JSON ====================
// 导出卡片为 JSON 文件
const exportCards = () => {
  if (cards.value.length === 0) {
    ElMessage.warning('没有卡片可导出')
    return
  }
  const exportData = {
    exportTime: new Date().toISOString(),
    version: '1.0',
    cards: cards.value,
    promptTemplate: promptTemplate.value,
    copyPromptMode: copyPromptMode.value
  }
  const jsonStr = JSON.stringify(exportData, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `prompt_cards_${new Date().toISOString().slice(0,19).replace(/:/g, '-')}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  ElMessage.success('导出成功')
}

// 处理导入的 JSON 文件
const handleImportFile = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result)
      let importedCards = []
      // 兼容两种格式：直接是卡片数组，或者包含 cards 字段的对象
      if (Array.isArray(imported)) {
        importedCards = imported
      } else if (imported.cards && Array.isArray(imported.cards)) {
        importedCards = imported.cards
        // 可选：同时导入提示词模板
        if (imported.promptTemplate) promptTemplate.value = imported.promptTemplate
        if (typeof imported.copyPromptMode === 'boolean') copyPromptMode.value = imported.copyPromptMode
      } else {
        throw new Error('文件格式不正确，需要包含卡片数组')
      }

      if (importedCards.length === 0) {
        ElMessage.warning('导入文件中没有卡片')
        return
      }

      // 合并卡片：去重（基于 id 是否存在，如果存在则跳过，否则追加）
      const existingIds = new Set(cards.value.map(c => c.id))
      let addedCount = 0
      let duplicateCount = 0
      for (const card of importedCards) {
        if (card.id && existingIds.has(card.id)) {
          duplicateCount++
          continue
        }
        // 为没有 id 的卡片生成新 id
        if (!card.id) {
          card.id = nextId++
        } else {
          // 确保 id 不冲突，如果冲突则重新分配
          if (existingIds.has(card.id)) {
            card.id = nextId++
          } else {
            // 更新 nextId 避免未来冲突
            if (card.id >= nextId) nextId = card.id + 1
          }
        }
        // 确保 name 字段存在
        if (!card.name) card.name = `卡片 #${card.id}`
        cards.value.push(card)
        addedCount++
        existingIds.add(card.id)
      }

      ElMessage.success(`导入完成：新增 ${addedCount} 张卡片，跳过重复 ${duplicateCount} 张`)
    } catch (err) {
      ElMessage.error('解析 JSON 失败：' + err.message)
    }
  }
  reader.readAsText(file.raw)
  // 清空 upload 组件内部状态，允许重复导入同一个文件
  if (uploadRef.value) uploadRef.value.clearFiles()
}

const uploadRef = ref(null)

// ==================== 初始化加载 ====================
onMounted(() => {
  const hasData = loadFromLocalStorage()
  if (!hasData) {
    // 可选的示例初始数据，注释掉以保持空白
    // cards.value = [
    //   { id: 1, name: '示例卡片', content: '这是一个示例卡片，你可以添加自己的内容。' }
    // ]
    // nextId = 2
  }
})
</script>

<style scoped>
/* ========== 整体容器 ========== */
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

/* 头部（火焰+统计） */
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
  align-items: center;
}
.save-badge {
  background: #2a1f14;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 9px;
}

/* ========== 主内容 ========== */
.studio-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow: hidden;
}

/* 上半区：两栏展开布局 */
.control-row {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  flex-shrink: 0;
}
.card-creator, .prompt-editor {
  flex: 1;
  min-width: 260px;
  background: rgba(20, 14, 9, 0.5);
  border: 1px solid #2a1f14;
  border-radius: 10px;
  padding: 16px;
  backdrop-filter: blur(2px);
}
.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  font-weight: 600;
  color: #c8a45c;
  margin-bottom: 12px;
  border-left: 3px solid #c8a45c;
  padding-left: 10px;
}
.title-icon {
  font-size: 16px;
  margin-right: 6px;
}
.mode-switch {
  margin-left: auto;
}

/* 深色输入框覆盖 Element Plus 样式 */
.dark-input :deep(.el-textarea__inner) {
  background: #100a06;
  border-color: #2a1f14;
  color: #d4c8a8;
  font-family: monospace;
  font-size: 12px;
  resize: vertical;
}
.dark-input :deep(.el-textarea__inner::placeholder) {
  color: #4a3a2a;
}
.preview-hint {
  margin-top: 8px;
  font-size: 11px;
  color: #8a7a6a;
  font-style: italic;
}

/* 金色按钮 */
.gold-btn {
  margin-top: 12px;
  width: 100%;
  background: #5a3a1a !important;
  border: 1px solid #8b6a3a !important;
  color: #e0d4b8 !important;
}
.gold-btn:hover {
  background: #6a4a2a !important;
  border-color: #a0804a !important;
}

/* 操作栏（导入导出） */
.action-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-shrink: 0;
  justify-content: flex-end;
  border-top: 1px solid #2a1f14;
  padding-top: 16px;
}
.action-btn {
  background: transparent !important;
  border: 1px solid #3a2a1a !important;
  color: #8a7a6a !important;
  font-size: 11px !important;
}
.action-btn:hover {
  border-color: #8a6d2b !important;
  color: #c8a45c !important;
}
.clear-all:hover {
  color: #e8904a !important;
  border-color: #e8904a !important;
}
.import-upload {
  display: inline-block;
}

/* 卡片列表区域 */
.cards-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: rgba(13, 8, 5, 0.4);
  border-radius: 12px;
  padding: 8px;
}
.cards-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid #2a1f14;
}
.cards-title {
  font-size: 13px;
  font-weight: 600;
  color: #c8a45c;
  letter-spacing: 1px;
}
.cards-count {
  font-size: 10px;
  color: #6a5a4a;
}

/* 卡片网格 */
.cards-grid {
  flex: 1;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
  align-content: start;
  padding: 4px;
}

/* ========== 卡片样式（完全继承源文件风格） ========== */
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

/* 空卡片占位 */
.empty-card {
  grid-column: 1 / -1;
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
.cards-grid::-webkit-scrollbar {
  width: 6px;
}
.cards-grid::-webkit-scrollbar-thumb {
  background: #2a1f14;
  border-radius: 3px;
}

/* Element Plus 消息框样式覆盖 */
:deep(.el-message-box) {
  background: #140e09 !important;
  border: 1px solid #2a1f14 !important;
  color: #d4c8a8 !important;
}
:deep(.el-message-box__title) {
  color: #c8a45c !important;
}
:deep(.el-message-box__message) {
  color: #d4c8a8 !important;
}
:deep(.el-message-box__btns button) {
  background: #5a3a1a !important;
  border-color: #8b6a3a !important;
  color: #e0d4b8 !important;
}
</style>