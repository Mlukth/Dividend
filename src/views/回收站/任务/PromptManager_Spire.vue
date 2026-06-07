<template>
  <div class="spire-app">
    <!-- 顶部篝火与状态 -->
    <div class="spire-header">
      <div class="spire-bonfire">
        <div class="bonfire-flame" />
        <span class="bonfire-label">提示词熔炉</span>
      </div>
      <div class="header-stats">
        <span>库存 {{ cards.length }} 张</span>
        <span>提示词 {{ promptTemplate ? '已载入' : '未填写' }}</span>
        <span>模式 {{ modeLabel }}</span>
      </div>
    </div>

    <!-- 主操作区 -->
    <div class="spire-main">
      <div class="spire-toolbar">
        <h2 class="spire-title">提示词卡组</h2>
        <div class="toolbar-actions">
          <!-- 模式切换 (纯CSS实现) -->
          <div class="spire-mode-group">
            <label v-for="m in modes" :key="m.val" class="spire-mode-btn" :class="{ active: mode === m.val }">
              <input type="radio" name="spire-mode" v-model="mode" :value="m.val">
              <span>{{ m.label }}</span>
            </label>
          </div>
          <button class="spire-btn-ghost" @click="exportData">📤 导出JSON</button>
          <button class="spire-btn-ghost" @click="clearAll">🗑️ 清空卡组</button>
        </div>
      </div>

      <!-- 输入锻造台 -->
      <div class="spire-inputs">
        <div class="spire-input-group">
          <label>📜 提示词模板 <span class="spire-tip">（自动保存）</span></label>
          <textarea v-model="promptTemplate" placeholder="输入系统提示词/上下文规则，开启复制模式时将自动拼接..."></textarea>
        </div>
        <div class="spire-input-group">
          <label>🔥 待锻造内容</label>
          <textarea v-model="newContent" placeholder="输入需保存的提示词、代码片段或笔记..."></textarea>
          <button class="spire-btn-gold" @click="forgeCard" :disabled="!newContent.trim()">
            ⚒️ 铸造入组
          </button>
        </div>
      </div>

      <!-- 卡牌网格 -->
      <div class="spire-grid">
        <div v-for="card in cards" :key="card.id" 
             :class="['spire-card', card.type, card._rarity]"
             @click="handleCardClick(card)">
          
          <!-- 删除按钮 -->
          <button class="card-delete-btn" @click.stop="deleteCard(card.id)" title="删除此卡">×</button>
          
          <!-- 能量球 -->
          <div class="energy-orb" :class="card._rarity">
            <span class="orb-num">{{ card.cost }}</span>
          </div>
          <!-- 卡图区 -->
          <div class="card-art" :style="{ background: artGradient(card.type) }">
            <div class="art-symbol">{{ card.type }}</div>
          </div>
          <!-- 类型横幅 -->
          <div class="type-banner" :class="card.type">
            <span>{{ card.type }}</span>
          </div>
          <!-- 描述框 -->
          <div class="desc-box">
            <div class="card-name">{{ card.name }}</div>
            <div class="card-desc">{{ card.desc }}</div>
            <div class="rarity-line" :class="card._rarity">◆ {{ rarityLabel(card._rarity) }}</div>
          </div>
          
          <!-- 模式提示浮层 -->
          <div v-if="mode !== 'browse'" class="spire-copy-overlay">
            {{ mode === 'copy' ? '📋 点击复制' : '💥 点击复制并销毁' }}
          </div>
        </div>
        <div v-if="cards.length === 0" class="spire-empty">
          熔炉已冷却，请在上方输入内容并锻造新卡
        </div>
      </div>
    </div>

    <!-- 提示反馈 -->
    <div v-if="toast.msg" class="spire-toast" :class="toast.type">{{ toast.msg }}</div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

// === 状态 ===
const modes = [
  { val: 'browse', label: '👁️ 浏览' },
  { val: 'copy', label: '📋 复制模式' },
  { val: 'copy_del', label: '💥 复制并销毁' }
]
const mode = ref('browse')
const modeLabel = computed(() => modes.find(m => m.val === mode.value)?.label || '')

const promptTemplate = ref('')
const newContent = ref('')
const cards = ref([])
const toast = ref({ msg: '', type: 'success' })

// === 持久化存储 ===
const STORAGE_CARDS = 'spire_prompt_cards_v2'
const STORAGE_TPL = 'spire_prompt_template_v1'

onMounted(() => {
  try {
    const savedCards = localStorage.getItem(STORAGE_CARDS)
    if (savedCards) cards.value = JSON.parse(savedCards)
    const savedTpl = localStorage.getItem(STORAGE_TPL)
    if (savedTpl) promptTemplate.value = savedTpl
  } catch (e) {
    console.warn('[SpireManager] 读取本地存储失败', e)
  }
})

// 自动保存提示词模板
watch(promptTemplate, (val) => {
  localStorage.setItem(STORAGE_TPL, val)
})

// 自动保存卡牌数组
watch(cards, (val) => {
  localStorage.setItem(STORAGE_CARDS, JSON.stringify(val))
}, { deep: true })

// === 核心逻辑 ===
const rarityRank = (len) => len >= 500 ? 'gold' : len >= 200 ? 'silver' : len >= 80 ? 'bronze' : 'copper'
const rarityLabel = (r) => ({ gold: '稀有', silver: '罕见', bronze: '普通', copper: '基础' }[r] || r)

const artGradient = (type) => {
  const map = {
    PM:   'linear-gradient(160deg, #0a1a2a 0%, #081018 60%, #04080d 100%)',
    CDEV: 'linear-gradient(160deg, #2a1010 0%, #150808 60%, #0a0404 100%)',
    INFO: 'linear-gradient(160deg, #0a1a1a 0%, #081515 60%, #040a0a 100%)',
    LEARN:'linear-gradient(160deg, #1a0a2a 0%, #100818 60%, #08040d 100%)',
    DOC:  'linear-gradient(160deg, #2a1a0a 0%, #181008 60%, #0d0804 100%)'
  }
  return map[type] || map.PM
}

const forgeCard = () => {
  const content = newContent.value.trim()
  if (!content) return

  const id = `card_${Date.now().toString(36)}`
  const cost = content.length >= 1000 ? 3 : content.length >= 300 ? 2 : 1
  const desc = content.slice(0, 80) + (content.length > 80 ? '...' : '')
  const typeGuess = content.includes('function') || content.includes('<template') || content.includes('import') ? 'CDEV' : 'PM'

  cards.value.unshift({
    id,
    name: `卡#${id.slice(-4)}`,
    type: typeGuess,
    cost,
    desc,
    content,
    _rarity: rarityRank(content.length),
    created: new Date().toLocaleTimeString()
  })

  newContent.value = ''
  showToast('⚒️ 锻造成功，卡牌已入组', 'success')
}

const deleteCard = (id) => {
  cards.value = cards.value.filter(c => c.id !== id)
  showToast('🗑️ 卡牌已销毁', 'success')
}

const clearAll = () => {
  if (confirm('确定要清空本地所有卡牌与提示词吗？此操作不可撤销。')) {
    cards.value = []
    promptTemplate.value = ''
    localStorage.removeItem(STORAGE_CARDS)
    localStorage.removeItem(STORAGE_TPL)
    showToast('🗑️ 卡组与模板已清空', 'success')
  }
}

const handleCardClick = async (card) => {
  if (mode.value === 'browse') return

  const finalText = promptTemplate.value.trim()
    ? `${promptTemplate.value}\n\n---\n${card.content}`
    : card.content

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(finalText)
    } else {
      const ta = document.createElement('textarea')
      ta.value = finalText
      ta.style.position = 'fixed'
      ta.style.left = '-9999px'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    
    if (mode.value === 'copy_del') {
      deleteCard(card.id)
      showToast('💥 已复制并自动销毁', 'success')
    } else {
      showToast('📋 已复制' + (promptTemplate.value.trim() ? ' (含提示词)' : ''), 'success')
    }
  } catch (err) {
    showToast('❌ 复制失败，请检查浏览器权限', 'error')
  }
}

const exportData = () => {
  if (cards.value.length === 0 && !promptTemplate.value.trim()) {
    showToast('⚠️ 卡组为空，无法导出', 'error')
    return
  }
  const payload = { template: promptTemplate.value, cards: cards.value, exportTime: new Date().toISOString() }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `spire_prompt_deck_${new Date().toISOString().slice(0,10)}.json`
  a.click()
  URL.revokeObjectURL(url)
  showToast('📤 卡组JSON已导出', 'success')
}

const showToast = (msg, type = 'success') => {
  toast.value = { msg, type }
  setTimeout(() => { toast.value.msg = '' }, 2000)
}
</script>

<style scoped>
/* === 根基 === */
.spire-app {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 80px);
  background: #0d0805;
  color: #d4c8a8;
  overflow: hidden;
  border-radius: 8px;
  font-family: 'SimSun', 'Source Han Serif SC', 'Noto Serif SC', serif;
}

/* === 顶部 === */
.spire-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 20px;
  background: #140e09;
  border-bottom: 1px solid #2a1f14;
  flex-shrink: 0;
}
.spire-bonfire { display: flex; align-items: center; gap: 8px; }
.bonfire-flame {
  width: 12px; height: 18px;
  background: #d4793a;
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  box-shadow: 0 0 8px #d4793a, 0 0 20px rgba(212,121,58,0.5);
  animation: flicker 0.6s ease-in-out infinite alternate;
}
@keyframes flicker {
  0% { box-shadow: 0 0 6px #d4793a, 0 0 14px rgba(212,121,58,0.4); }
  100% { box-shadow: 0 0 10px #e8904a, 0 0 22px rgba(212,121,58,0.6); }
}
.bonfire-label { font-size: 12px; color: #8a7a6a; letter-spacing: 2px; text-transform: uppercase; }
.header-stats { display: flex; gap: 16px; font-size: 11px; color: #6a5a4a; font-family: monospace; margin-left: auto; }

/* === 主区域 === */
.spire-main { flex: 1; display: flex; flex-direction: column; padding: 20px; overflow: hidden; }
.spire-toolbar {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 20px; flex-shrink: 0; flex-wrap: wrap; gap: 12px;
}
.spire-title { margin: 0; font-size: 22px; color: #d4c8a8; font-weight: 600; letter-spacing: -0.02em; }
.toolbar-actions { display: flex; gap: 8px; align-items: center; }

/* 模式切换组 */
.spire-mode-group { display: flex; gap: 6px; }
.spire-mode-btn {
  display: flex; align-items: center; cursor: pointer; user-select: none;
  padding: 4px 10px; border: 1px solid #2a1f14; border-radius: 4px;
  background: #100a06; color: #6a5a4a; font-size: 11px; transition: 0.2s;
}
.spire-mode-btn input { display: none; }
.spire-mode-btn.active, .spire-mode-btn:hover {
  border-color: #8a6d2b; background: rgba(200,164,92,0.1); color: #c8a45c;
}

/* 按钮 */
.spire-btn-ghost, .spire-btn-gold {
  padding: 6px 12px; border-radius: 4px; font-size: 11px; cursor: pointer; font-family: inherit; transition: 0.2s;
}
.spire-btn-ghost {
  background: transparent; border: 1px solid #2a1f14; color: #6a5a4a;
}
.spire-btn-ghost:hover { border-color: #4a3a2a; color: #9a8a7a; }
.spire-btn-gold {
  background: #5a3a1a; border: 1px solid #8b6a3a; color: #e0d4b8;
}
.spire-btn-gold:hover:not(:disabled) { background: #6a4a2a; border-color: #a0804a; }
.spire-btn-gold:disabled { background: #2a1f14; border-color: #2a1f14; color: #4a3a2a; cursor: not-allowed; }

/* 输入区 */
.spire-inputs { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
.spire-input-group { display: flex; flex-direction: column; gap: 6px; }
.spire-input-group label { font-size: 12px; color: #8a7a6a; display: flex; align-items: center; gap: 6px; }
.spire-tip { font-size: 9px; color: #4a3a2a; opacity: 0.7; }
textarea {
  width: 100%; padding: 10px; border: 1px solid #2a1f14; border-radius: 4px;
  font-size: 12px; line-height: 1.5; resize: vertical; min-height: 90px;
  background: #100a06; color: #d4c8a8; font-family: inherit; box-sizing: border-box;
  transition: 0.2s;
}
textarea:focus { outline: none; border-color: #c8a45c; background: #140e09; }

/* 网格与卡片 */
.spire-grid {
  flex: 1; overflow-y: auto;
  display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 18px; align-content: start; padding: 4px;
}
.spire-empty {
  grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #4a3a2a;
  background: #100a06; border-radius: 6px; border: 2px dashed #2a1f14; font-size: 13px;
}

/* 删除按钮 */
.card-delete-btn {
  position: absolute; top: 6px; right: 6px; z-index: 5;
  width: 24px; height: 24px; border-radius: 50%;
  background: rgba(10,5,2,0.6); border: 1px solid #3a2a1a; color: #5a4a3a;
  font-size: 14px; line-height: 22px; text-align: center; cursor: pointer;
  opacity: 0; transition: 0.2s; pointer-events: auto;
}
.spire-card:hover .card-delete-btn { opacity: 1; }
.card-delete-btn:hover {
  border-color: #c8a45c; background: rgba(200,164,92,0.15); color: #e8904a;
}

/* 卡片核心样式 (严格继承参考文件) */
.spire-card {
  position: relative; width: 100%; height: 320px;
  background: #1a1108; border: 2px solid #3a2a1a; border-radius: 8px;
  cursor: default; transition: transform 0.25s ease, border-color 0.3s, box-shadow 0.3s;
  overflow: hidden; display: flex; flex-direction: column;
  box-shadow: 0 4px 12px rgba(0,0,0,0.6);
}
.spire-card::before { 
  content: ''; position: absolute; inset: 3px;
  border: 1px solid rgba(200,164,92,0.08); border-radius: 6px;
  pointer-events: none; z-index: 2;
}
.spire-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.8); }

.spire-card.PM { border-left: 3px solid #2a4a6b; }
.spire-card.copper { border-color: #4a3020; }
.spire-card.bronze { border-color: #5a4030; box-shadow: 0 4px 12px rgba(0,0,0,0.5), inset 0 0 20px rgba(139,90,43,0.06); }
.spire-card.silver { border-color: #7a7a7a; box-shadow: 0 4px 14px rgba(0,0,0,0.5), inset 0 0 24px rgba(160,160,160,0.06); }
.spire-card.gold   { border-color: #8a6d2b; box-shadow: 0 4px 16px rgba(0,0,0,0.5), inset 0 0 30px rgba(200,160,40,0.08); }

.energy-orb {
  position: absolute; top: 8px; left: 8px;
  width: 32px; height: 32px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  z-index: 3; border: 2px solid;
}
.energy-orb.copper  { background: radial-gradient(circle at 40% 35%, #4a3020, #2a1a10); border-color: #4a3020; color: #8a6a5a; }
.energy-orb.bronze { background: radial-gradient(circle at 40% 35%, #6b4226, #3a2010); border-color: #8b5a2b; color: #c8a080; }
.energy-orb.silver { background: radial-gradient(circle at 40% 35%, #7a7a7a, #3a3a3a); border-color: #a0a0a0; color: #e0e0e0; }
.energy-orb.gold   { background: radial-gradient(circle at 40% 35%, #c8a040, #6a4a10); border-color: #c8a45c; color: #ffe8a0; box-shadow: 0 0 10px rgba(200,160,40,0.3); }
.orb-num { font-size: 12px; font-weight: bold; }

.card-art {
  height: 38%; display: flex; align-items: center; justify-content: center;
  position: relative; overflow: hidden;
}
.card-art::after {
  content: ''; position: absolute; inset: 0;
  background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px);
  pointer-events: none;
}
.art-symbol {
  font-size: 28px; opacity: 0.35; text-transform: uppercase; letter-spacing: 4px;
  z-index: 1; color: #fff; font-weight: bold; text-shadow: 0 2px 8px rgba(0,0,0,0.5);
}

.type-banner {
  height: 5px; margin: 0 10px; border-radius: 0 0 3px 3px;
  display: flex; align-items: center; justify-content: center;
  z-index: 3; font-size: 9px; letter-spacing: 1px; color: #1a1108; font-weight: bold;
}
.type-banner.PM { background: #2a4a6b; }
.type-banner span { background: inherit; padding: 0 8px; position: relative; top: -1px; font-size: 9px; }

.desc-box {
  flex: 1; padding: 8px 10px 10px; display: flex; flex-direction: column; gap: 2px;
  border-top: 1px solid rgba(200,164,92,0.08);
  background: linear-gradient(180deg, rgba(20,10,5,0.6) 0%, rgba(15,8,3,0.9) 100%);
}
.card-name { font-size: 14px; font-weight: bold; color: #e0d4b8; line-height: 1.3; }
.card-desc {
  font-size: 11px; color: #8a7a6a; line-height: 1.5;
  overflow: hidden; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical;
  flex: 1;
}
.rarity-line { font-size: 9px; letter-spacing: 2px; text-transform: uppercase; }
.rarity-line.copper { color: #4a3020; }
.rarity-line.bronze { color: #8b5a2b; }
.rarity-line.silver { color: #a0a0a0; }
.rarity-line.gold   { color: #c8a040; }

.spire-copy-overlay {
  position: absolute; bottom: 0; left: 0; right: 0;
  background: rgba(20,10,5,0.9); color: #c8a45c; font-size: 10px;
  text-align: center; padding: 4px; letter-spacing: 1px;
  transform: translateY(100%); transition: 0.2s; z-index: 4;
}
.spire-card:hover .spire-copy-overlay { transform: translateY(0); }

/* 提示反馈 */
.spire-toast {
  position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
  padding: 8px 16px; border-radius: 4px; font-size: 12px; font-weight: 500;
  background: rgba(20,10,5,0.95); border: 1px solid #c8a45c; color: #e0d4b8;
  box-shadow: 0 4px 12px rgba(0,0,0,0.6); z-index: 99;
  transition: opacity 0.3s, transform 0.3s; font-family: monospace;
}
.spire-toast.error { border-color: #8b2a2a; color: #e8904a; }
</style>