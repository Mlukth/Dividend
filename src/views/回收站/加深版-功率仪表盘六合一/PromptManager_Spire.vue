<template>
  <div class="spire-app">
    <!-- 顶部篝火与状态 -->
    <div class="spire-header">
      <div class="spire-bonfire">
        <div class="bonfire-flame" />
        <span class="bonfire-label">提示词熔炉</span>
      </div>
      <div class="header-stats">
        <span>内容 {{ totalCards }} 张</span>
        <span>提示词 {{ promptCards.length }} 条</span>
        <span>分区 {{ groups.length }} 个</span>
      </div>
    </div>

    <!-- 主操作区 -->
    <div class="spire-main">
      <!-- 标签页与工具栏 -->
      <div class="spire-toolbar">
        <div class="spire-tabs">
          <button :class="['spire-tab', { active: view === 'content' }]" @click="view = 'content'">📜 内容卡组</button>
          <button :class="['spire-tab', { active: view === 'prompts' }]" @click="view = 'prompts'">🕯️ 提示词卡组</button>
        </div>
        <div class="toolbar-actions">
          <div class="spire-mode-group">
            <label v-for="m in modes" :key="m.val" class="spire-mode-btn" :class="{ active: mode === m.val }">
              <input type="radio" name="spire-mode" v-model="mode" :value="m.val">
              <span>{{ m.label }}</span>
            </label>
          </div>
          <button class="spire-btn-ghost" @click="exportData">📤 导出</button>
          <button class="spire-btn-ghost" @click="clearData">🗑️ 清空</button>
        </div>
      </div>

      <!-- 内容卡组视图 -->
      <template v-if="view === 'content'">
        <!-- 分区管理 -->
        <div class="spire-groups-bar">
          <div class="group-tabs">
            <div v-for="g in groups" :key="g.id" 
                 :class="['group-tab', { active: activeGroupId === g.id }]"
                 @click="activeGroupId = g.id">
              <span class="group-name">{{ g.name }}</span>
              <span class="group-count">{{ g.cards.length }}</span>
              <button class="group-note-btn" @click.stop="editGroupNote(g)" title="编辑分区备注">📝</button>
              <button class="group-del-btn" @click.stop="deleteGroup(g.id)" title="删除分区">×</button>
            </div>
            <button class="group-tab add-group" @click="addGroup">+ 新增分区</button>
          </div>
          <div v-if="activeGroup" class="group-note-display" @click="editGroupNote(activeGroup)">
            {{ activeGroup.note || '点击编辑分区备注/说明...' }}
          </div>
        </div>

        <!-- 输入锻造台 -->
        <div class="spire-inputs">
          <div class="spire-input-group">
            <label>🔥 待锻造内容 <span class="spire-tip">（支持图片粘贴/上传）</span></label>
            <textarea v-model="newContent" placeholder="输入内容、代码或笔记... (Ctrl+V 可粘贴图片)" rows="3"></textarea>
            <div class="input-extras">
              <input type="file" ref="fileInput" accept="image/*" @change="handleImageUpload" style="display:none">
              <button class="spire-btn-ghost-sm" @click="$refs.fileInput?.click()">🖼️ 上传图片</button>
              <input v-model="newTitle" placeholder="卡片标题（可选，默认前7字）" class="spire-input-sm">
              <button class="spire-btn-gold" @click="forgeCard" :disabled="!newContent.trim() && !newImage">⚒️ 铸造入组</button>
            </div>
          </div>
        </div>

        <!-- 卡片网格 -->
        <div class="spire-grid">
          <div v-for="card in activeGroupCards" :key="card.id" 
               :class="['spire-card', card._rarity, 'is-content']"
               @click="openDetail(card)">
            <button class="card-quick-del" @click.stop="deleteCard(card.id)">×</button>
            <div class="card-img-preview" v-if="card.image">
              <img :src="card.image" alt="预览">
            </div>
            <div class="card-art" :style="{ background: artGradient('PM') }">
              <div class="art-symbol">{{ card.typeLabel || 'PM' }}</div>
            </div>
            <div class="energy-orb" :class="card._rarity"><span class="orb-num">{{ card.cost }}</span></div>
            <div class="type-banner PM"><span>{{ card.typeLabel }}</span></div>
            <div class="desc-box">
              <div class="card-name">{{ card.name }}</div>
              <div class="card-desc">{{ card.desc }}</div>
              <div class="rarity-line" :class="card._rarity">◆ {{ rarityLabel(card._rarity) }}</div>
            </div>
          </div>
          <div v-if="activeGroupCards.length === 0" class="spire-empty">
            {{ activeGroup ? '当前分区暂无卡牌，请锻造新卡' : '请先创建或选择一个分区' }}
          </div>
        </div>
      </template>

      <!-- 提示词卡组视图 -->
      <template v-else>
        <div class="spire-inputs">
          <div class="spire-input-group full-width">
            <label>🕯️ 铸造提示词模板 <span class="spire-tip">（支持多选拼接，顺序即拼接顺序）</span></label>
            <textarea v-model="newPrompt" placeholder="输入系统级提示词、上下文规则或角色设定..." rows="4"></textarea>
            <div style="display:flex; gap:8px; margin-top:4px;">
              <input v-model="newPromptName" placeholder="模板名称（留空自动取前7字）" style="flex:1; padding:6px 10px; background:#100a06; border:1px solid #2a1f14; color:#d4c8a8; border-radius:4px; font-size:12px;">
              <button class="spire-btn-gold" @click="forgePromptCard" :disabled="!newPrompt.trim()">⚒️ 铸造提示词</button>
            </div>
          </div>
        </div>
        <div class="spire-grid">
          <!-- 修复冲突：主体点击查看详情，独立按钮控制激活 -->
          <div v-for="p in promptCards" :key="p.id" 
               :class="['spire-card', 'is-prompt', { 'is-selected': p.isSelected }]"
               @click="openDetail(p)">
            <!-- 独立激活/勾选按钮 -->
            <button class="card-toggle-btn" :class="{ active: p.isSelected }" @click.stop="togglePrompt(p)" :title="p.isSelected ? '已激活拼接' : '点击激活拼接'">
              <span v-if="p.isSelected">✅</span><span v-else>○</span>
            </button>
            <!-- 顺序徽章 -->
            <div class="prompt-order-badge" v-if="p.isSelected">{{ promptSelectedIds.indexOf(p.id) + 1 }}</div>
            
            <button class="card-quick-del" @click.stop="deletePrompt(p.id)">×</button>
            <div class="card-art spire-art-prompt"><div class="art-symbol">PROMPT</div></div>
            <div class="energy-orb spire-prompt-orb"><span class="orb-num">P</span></div>
            <div class="type-banner PM"><span>提示词模板</span></div>
            <div class="desc-box">
              <div class="card-name">{{ p.name }}</div>
              <div class="card-desc">{{ p.content.slice(0, 100) }}{{ p.content.length > 100 ? '...' : '' }}</div>
              <div class="rarity-line">{{ p.isSelected ? '🔗 已链接至拼接队列' : '○ 未激活' }}</div>
            </div>
          </div>
          <div v-if="promptCards.length === 0" class="spire-empty">暂无提示词模板，请铸造</div>
        </div>
      </template>
    </div>

    <!-- 详情/编辑模态框 (纯 CSS) -->
    <div v-if="showDetailModal" class="spire-modal-overlay" @click.self="closeDetail">
      <div class="spire-modal">
        <div class="modal-header">
          <div class="modal-title">📜 卡牌详情与编辑</div>
          <button class="modal-close" @click="closeDetail">×</button>
        </div>
        <div class="modal-body" v-if="detailCard">
          <div class="modal-left">
            <div class="detail-preview">
              <div class="detail-img" v-if="detailCard.image">
                <img :src="detailCard.image" alt="大图">
              </div>
              <div class="detail-meta">
                <input v-model="detailCard.name" class="detail-title-input" placeholder="卡片标题">
                <div class="detail-rarity">{{ detailCard.typeLabel || '提示词模板' }} · 长度 {{ detailCard.content?.length || 0 }}</div>
                <textarea v-model="detailCard.note" class="detail-note" placeholder="备注/灵感/使用场景记录..."></textarea>
              </div>
            </div>
          </div>
          <div class="modal-right">
            <div class="editor-toolbar">
              <span class="editor-label">📝 内容编辑区 (支持 Tab 缩进/长文流)</span>
              <div class="editor-actions">
                <button class="spire-btn-ghost-sm" @click="copyDetailContent">📋 复制</button>
                <button class="spire-btn-gold-sm" @click="saveDetail">💾 保存更改</button>
              </div>
            </div>
            <textarea v-model="detailCard.content" class="detail-content-editor" 
              @keydown.tab.prevent="handleTab" placeholder="在此编辑完整内容..."></textarea>
            <div class="editor-footer">
              <span>{{ detailCard.content?.length || 0 }} 字符</span>
              <span class="editor-hint">提示：修改标题/备注后需点击保存，或失焦自动同步</span>
            </div>
          </div>
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
const view = ref('content')
const modes = [
  { val: 'browse', label: '👁️ 浏览' },
  { val: 'copy', label: '📋 复制模式' },
  { val: 'copy_del', label: '💥 复制并销毁' }
]
const mode = ref('browse')

// 分组与卡片
const groups = ref([])
const activeGroupId = ref(null)
const newContent = ref('')
const newTitle = ref('')
const newImage = ref(null)
const fileInput = ref(null)

// 提示词卡组
const promptCards = ref([])
const promptSelectedIds = ref([])
const newPrompt = ref('')
const newPromptName = ref('')

// 详情模态框
const showDetailModal = ref(false)
const detailCard = ref(null)
const isEditingPrompt = ref(false)

// 反馈
const toast = ref({ msg: '', type: 'success' })

// === 持久化 ===
const STORAGE = {
  GROUPS: 'spire_groups_v2',
  PROMPTS: 'spire_prompt_cards_v2',
  SEL_PROMPTS: 'spire_sel_prompts_v1',
  MODE: 'spire_mode_v1'
}

onMounted(() => {
  try {
    const g = localStorage.getItem(STORAGE.GROUPS)
    if (g) {
      groups.value = JSON.parse(g)
      activeGroupId.value = groups.value[0]?.id || null
    } else {
      addGroup('默认分区')
    }
    const p = localStorage.getItem(STORAGE.PROMPTS); if (p) promptCards.value = JSON.parse(p)
    const s = localStorage.getItem(STORAGE.SEL_PROMPTS); if (s) promptSelectedIds.value = JSON.parse(s)
    const m = localStorage.getItem(STORAGE.MODE); if (m) mode.value = m
  } catch (e) { console.warn('[SpireManager] 读取失败', e) }
})

watch(groups, v => localStorage.setItem(STORAGE.GROUPS, JSON.stringify(v)), { deep: true })
watch(promptCards, v => localStorage.setItem(STORAGE.PROMPTS, JSON.stringify(v)), { deep: true })
watch(promptSelectedIds, v => localStorage.setItem(STORAGE.SEL_PROMPTS, JSON.stringify(v)), { deep: true })
watch(mode, v => localStorage.setItem(STORAGE.MODE, v))

// === 计算属性 ===
const totalCards = computed(() => groups.value.reduce((sum, g) => sum + g.cards.length, 0))
const activeGroup = computed(() => groups.value.find(g => g.id === activeGroupId.value))
const activeGroupCards = computed(() => activeGroup.value?.cards || [])
const selectedPromptCount = computed(() => promptSelectedIds.value.length)
const selectedPrompts = computed(() => 
  promptSelectedIds.value.map(id => promptCards.value.find(p => p.id === id)).filter(Boolean)
)

// === 核心逻辑 ===
const makeTitle = (content) => content.slice(0, 7) + (content.length > 7 ? '...' : '')
const rarityRank = (len) => len >= 500 ? 'gold' : len >= 200 ? 'silver' : len >= 80 ? 'bronze' : 'copper'
const rarityLabel = (r) => ({ gold: '稀有', silver: '罕见', bronze: '普通', copper: '基础' }[r] || r)

const artGradient = (type) => ({
  PM:'linear-gradient(160deg, #0a1a2a 0%, #081018 60%, #04080d 100%)',
  CDEV:'linear-gradient(160deg, #2a1010 0%, #150808 60%, #0a0404 100%)',
  INFO:'linear-gradient(160deg, #0a1a1a 0%, #081515 60%, #040a0a 100%)',
  LEARN:'linear-gradient(160deg, #1a0a2a 0%, #100818 60%, #08040d 100%)',
  DOC:'linear-gradient(160deg, #2a1a0a 0%, #181008 60%, #0d0804 100%)'
}[type] || 'linear-gradient(160deg, #0a1a2a 0%, #081018 60%, #04080d 100%)')

// 分组管理
const addGroup = (name = '') => {
  const id = `grp_${Date.now().toString(36)}`
  const gName = name.trim() || `分区_${groups.value.length + 1}`
  groups.value.push({ id, name: gName, note: '', cards: [] })
  activeGroupId.value = id
  showToast('✅ 分区已创建', 'success')
}
const deleteGroup = (id) => {
  if (groups.value.length <= 1) return showToast('⚠️ 至少保留一个分区', 'error')
  if (confirm('确定删除此分区及其中所有卡牌吗？')) {
    groups.value = groups.value.filter(g => g.id !== id)
    activeGroupId.value = groups.value[0]?.id || null
    showToast('🗑️ 分区已删除', 'success')
  }
}
const editGroupNote = (group) => {
  const newNote = prompt('编辑分区备注/说明：', group.note)
  if (newNote !== null) {
    group.note = newNote.trim()
    showToast('📝 备注已更新', 'success')
  }
}

// 内容铸造
const handleImageUpload = (e) => {
  const file = e.target.files[0]
  if (!file) return
  if (file.size > 2 * 1024 * 1024) return showToast('⚠️ 图片过大(限2MB)', 'error')
  const reader = new FileReader()
  reader.onload = (ev) => { newImage.value = ev.target.result; showToast('🖼️ 图片已载入', 'success') }
  reader.readAsDataURL(file)
}

const forgeCard = () => {
  const content = newContent.value.trim()
  if (!content && !newImage.value) return
  
  const id = `c_${Date.now().toString(36)}`
  const title = newTitle.value.trim() || makeTitle(content || '图片卡')
  const group = activeGroup.value
  if (!group) return showToast('⚠️ 请先选择分区', 'error')

  group.cards.unshift({
    id, name: title, type: 'PM', typeLabel: '内容卡片', cost: content.length >= 1000 ? 3 : content.length >= 300 ? 2 : 1,
    desc: (content || '图片笔记').slice(0, 80) + (content.length > 80 ? '...' : ''), 
    content, image: newImage.value, note: '', _rarity: rarityRank(content.length),
    created: new Date().toLocaleTimeString()
  })
  newContent.value = ''; newTitle.value = ''; newImage.value = null
  if (fileInput.value) fileInput.value.value = ''
  showToast('⚒️ 卡牌铸造成功', 'success')
}

const deleteCard = (id) => {
  if (!activeGroup.value) return
  activeGroup.value.cards = activeGroup.value.cards.filter(c => c.id !== id)
  showToast('🗑️ 卡牌已销毁', 'success')
}

// 提示词逻辑
const forgePromptCard = () => {
  const content = newPrompt.value.trim()
  if (!content) return
  const name = newPromptName.value.trim() || makeTitle(content)
  promptCards.value.unshift({
    id: `p_${Date.now().toString(36)}`, name, content, isSelected: false, note: '', created: new Date().toLocaleTimeString()
  })
  newPrompt.value = ''; newPromptName.value = ''
  showToast('🕯️ 提示词模板铸造成功', 'success')
}

const togglePrompt = (p) => {
  p.isSelected = !p.isSelected
  if (p.isSelected) {
    promptSelectedIds.value.push(p.id)
  } else {
    promptSelectedIds.value = promptSelectedIds.value.filter(id => id !== p.id)
  }
}

const deletePrompt = (id) => {
  promptCards.value = promptCards.value.filter(p => p.id !== id)
  promptSelectedIds.value = promptSelectedIds.value.filter(i => i !== id)
  showToast('🗑️ 提示词已移除', 'success')
}

// === 详情模态框逻辑 ===
const openDetail = (card) => {
  detailCard.value = { ...card }
  isEditingPrompt.value = card.id.startsWith('p_')
  showDetailModal.value = true
}
const closeDetail = () => { showDetailModal.value = false; detailCard.value = null }
const handleTab = (e) => {
  const t = e.target, s = t.selectionStart, end = t.selectionEnd
  t.value = t.value.substring(0, s) + '  ' + t.value.substring(end)
  t.selectionStart = t.selectionEnd = s + 2
  detailCard.value.content = t.value
}

const saveDetail = async () => {
  if (!detailCard.value) return
  if (isEditingPrompt.value) {
    const idx = promptCards.value.findIndex(p => p.id === detailCard.value.id)
    if (idx !== -1) {
      detailCard.value.desc = detailCard.value.content.slice(0, 100) + (detailCard.value.content.length > 100 ? '...' : '')
      promptCards.value[idx] = { ...detailCard.value }
    }
  } else {
    const group = groups.value.find(g => g.id === detailCard.value.groupId || (activeGroup.value?.cards.some(c => c.id === detailCard.value.id) ? activeGroupId.value : null))
    if (group) {
      const idx = group.cards.findIndex(c => c.id === detailCard.value.id)
      if (idx !== -1) {
        detailCard.value.desc = (detailCard.value.content || '图片卡').slice(0, 80) + (detailCard.value.content?.length > 80 ? '...' : '')
        detailCard.value._rarity = rarityRank(detailCard.value.content?.length || 0)
        group.cards[idx] = { ...detailCard.value }
      }
    }
  }
  showToast('💾 更改已保存', 'success')
}

const copyDetailContent = async () => {
  if (!detailCard.value) return
  const promptText = (!isEditingPrompt.value && selectedPrompts.value.length > 0) 
    ? selectedPrompts.value.map(p => p.content).join('\n\n--- 提示词分隔 ---\n\n')
    : ''
  
  const finalText = promptText ? `${promptText}\n\n=== 拼接内容 ===\n\n${detailCard.value.content}` : detailCard.value.content
  
  try {
    await (navigator.clipboard?.writeText?.(finalText) || fallbackCopy(finalText))
    showToast('📋 已复制' + (promptText ? ' (含提示词)' : ''), 'success')
  } catch { showToast('❌ 复制失败', 'error') }
}

const fallbackCopy = (text) => {
  const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.left = '-9999px'
  document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta)
  return Promise.resolve()
}

const clearData = () => {
  if (confirm('确定清空所有分区、卡牌与提示词？不可撤销。')) {
    groups.value = [{ id: 'grp_init', name: '默认分区', note: '', cards: [] }]
    promptCards.value = []; promptSelectedIds.value = []
    activeGroupId.value = 'grp_init'
    localStorage.removeItem(STORAGE.GROUPS); localStorage.removeItem(STORAGE.PROMPTS); localStorage.removeItem(STORAGE.SEL_PROMPTS)
    showToast('🗑️ 数据已清空', 'success')
  }
}

const exportData = () => {
  if (totalCards.value === 0 && promptCards.value.length === 0) return showToast('⚠️ 无数据可导出', 'error')
  const payload = { groups: groups.value, prompts: promptCards.value, selectedPromptIds: promptSelectedIds.value, time: new Date().toISOString() }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `spire_deck_full_${new Date().toISOString().slice(0,10)}.json`
  a.click(); URL.revokeObjectURL(a.href); showToast('📤 完整卡组已导出', 'success')
}

const showToast = (msg, type = 'success') => { toast.value = { msg, type }; setTimeout(() => { toast.value.msg = '' }, 2000) }
</script>

<style scoped>
/* === 根基与布局 === */
.spire-app { display: flex; flex-direction: column; height: calc(100vh - 80px); background: #0d0805; color: #d4c8a8; overflow: hidden; border-radius: 8px; font-family: 'SimSun', 'Source Han Serif SC', 'Noto Serif SC', serif; }
.spire-header { display: flex; align-items: center; gap: 16px; padding: 12px 20px; background: #140e09; border-bottom: 1px solid #2a1f14; flex-shrink: 0; }
.spire-bonfire { display: flex; align-items: center; gap: 8px; }
.bonfire-flame { width: 12px; height: 18px; background: #d4793a; border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%; box-shadow: 0 0 8px #d4793a, 0 0 20px rgba(212,121,58,0.5); animation: flicker 0.6s ease-in-out infinite alternate; }
@keyframes flicker { 0% { box-shadow: 0 0 6px #d4793a, 0 0 14px rgba(212,121,58,0.4); } 100% { box-shadow: 0 0 10px #e8904a, 0 0 22px rgba(212,121,58,0.6); } }
.bonfire-label { font-size: 12px; color: #8a7a6a; letter-spacing: 2px; text-transform: uppercase; }
.header-stats { display: flex; gap: 16px; font-size: 11px; color: #6a5a4a; font-family: monospace; margin-left: auto; }

/* === 工具栏 === */
.spire-main { flex: 1; display: flex; flex-direction: column; padding: 20px; overflow: hidden; }
.spire-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-shrink: 0; flex-wrap: wrap; gap: 12px; }
.spire-tabs { display: flex; gap: 6px; }
.spire-tab { padding: 6px 14px; background: #100a06; border: 1px solid #2a1f14; color: #6a5a4a; border-radius: 4px 4px 0 0; cursor: pointer; font-size: 12px; transition: 0.2s; }
.spire-tab.active, .spire-tab:hover { border-color: #8a6d2b; background: rgba(200,164,92,0.1); color: #c8a45c; border-bottom-color: #140e09; }
.toolbar-actions { display: flex; gap: 8px; align-items: center; }
.spire-mode-group { display: flex; gap: 6px; }
.spire-mode-btn { display: flex; align-items: center; cursor: pointer; user-select: none; padding: 4px 10px; border: 1px solid #2a1f14; border-radius: 4px; background: #100a06; color: #6a5a4a; font-size: 11px; transition: 0.2s; }
.spire-mode-btn input { display: none; }
.spire-mode-btn.active, .spire-mode-btn:hover { border-color: #8a6d2b; background: rgba(200,164,92,0.1); color: #c8a45c; }

/* === 分区管理 === */
.spire-groups-bar { margin-bottom: 16px; background: #100a06; border: 1px solid #2a1f14; border-radius: 6px; padding: 10px; }
.group-tabs { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 6px; align-items: center; }
.group-tab { display: flex; align-items: center; gap: 6px; padding: 6px 12px; background: #0d0805; border: 1px solid #2a1f14; border-radius: 4px; color: #6a5a4a; cursor: pointer; font-size: 11px; transition: 0.2s; white-space: nowrap; position: relative; }
.group-tab.active, .group-tab:hover { border-color: #8a6d2b; background: rgba(200,164,92,0.1); color: #c8a45c; }
.group-name { font-weight: bold; } .group-count { background: #2a1f14; color: #8a7a6a; padding: 1px 5px; border-radius: 3px; font-size: 9px; }
.group-note-btn, .group-del-btn { background: transparent; border: none; color: #4a3a2a; cursor: pointer; padding: 2px; font-size: 12px; opacity: 0; transition: 0.2s; }
.group-tab:hover .group-note-btn, .group-tab:hover .group-del-btn { opacity: 0.7; }
.group-note-btn:hover { opacity: 1; color: #c8a45c; } .group-del-btn:hover { opacity: 1; color: #e8904a; }
.add-group { border-style: dashed; }
.group-note-display { font-size: 11px; color: #5a4a3a; padding: 6px 10px; border-top: 1px solid #2a1f14; cursor: text; margin-top: 6px; }
.group-note-display:hover { color: #8a7a6a; background: rgba(200,164,92,0.05); }

/* === 输入区 === */
.spire-inputs { margin-bottom: 20px; }
.spire-input-group { display: flex; flex-direction: column; gap: 6px; }
.spire-input-group.full-width { grid-column: 1 / -1; }
.spire-input-group label { font-size: 12px; color: #8a7a6a; display: flex; align-items: center; gap: 6px; }
.spire-tip { font-size: 9px; color: #4a3a2a; opacity: 0.7; }
textarea, .spire-input-sm { width: 100%; padding: 10px; border: 1px solid #2a1f14; border-radius: 4px; font-size: 12px; line-height: 1.5; resize: vertical; background: #100a06; color: #d4c8a8; font-family: inherit; box-sizing: border-box; transition: 0.2s; }
.spire-input-sm { height: 34px; flex: 1; padding: 0 10px; }
textarea:focus, .spire-input-sm:focus { outline: none; border-color: #c8a45c; background: #140e09; }
.input-extras { display: flex; gap: 8px; align-items: center; margin-top: 4px; }

/* === 按钮 === */
.spire-btn-gold, .spire-btn-gold-sm, .spire-btn-ghost, .spire-btn-ghost-sm { padding: 6px 12px; border-radius: 4px; font-size: 11px; cursor: pointer; font-family: inherit; transition: 0.2s; border: none; white-space: nowrap; }
.spire-btn-gold { background: #5a3a1a; border: 1px solid #8b6a3a; color: #e0d4b8; } .spire-btn-gold:hover:not(:disabled) { background: #6a4a2a; border-color: #a0804a; }
.spire-btn-gold:disabled { background: #2a1f14; border-color: #2a1f14; color: #4a3a2a; cursor: not-allowed; }
.spire-btn-ghost { background: transparent; border: 1px solid #2a1f14; color: #6a5a4a; } .spire-btn-ghost:hover { border-color: #4a3a2a; color: #9a8a7a; }
.spire-btn-gold-sm { background: #5a3a1a; border: 1px solid #8b6a3a; color: #e0d4b8; padding: 4px 8px; font-size: 10px; }
.spire-btn-ghost-sm { background: transparent; border: 1px solid #2a1f14; color: #6a5a4a; padding: 4px 8px; font-size: 10px; } .spire-btn-ghost-sm:hover { border-color: #4a3a2a; color: #9a8a7a; }

/* === 网格与卡片 === */
.spire-grid { flex: 1; overflow-y: auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 18px; align-content: start; padding: 4px; }
.spire-empty { grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #4a3a2a; background: #100a06; border-radius: 6px; border: 2px dashed #2a1f14; font-size: 13px; }

/* 修复：恢复固定高度和正确布局 */
.spire-card { 
  position: relative; 
  width: 100%; 
  height: 340px; /* 恢复固定高度 */
  background: #1a1108; 
  border: 2px solid #3a2a1a; 
  border-radius: 8px; 
  cursor: pointer; 
  transition: transform 0.25s ease, border-color 0.3s, box-shadow 0.3s; 
  overflow: hidden; 
  display: flex; 
  flex-direction: column; /* 确保垂直布局 */
  box-shadow: 0 4px 12px rgba(0,0,0,0.6);
}
.spire-card::before { content: ''; position: absolute; inset: 3px; border: 1px solid rgba(200,164,92,0.08); border-radius: 6px; pointer-events: none; z-index: 2; }
.spire-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.8); }

.card-quick-del { position: absolute; top: 6px; right: 6px; z-index: 5; width: 24px; height: 24px; border-radius: 50%; background: rgba(10,5,2,0.6); border: 1px solid #3a2a1a; color: #5a4a3a; font-size: 14px; line-height: 22px; text-align: center; cursor: pointer; opacity: 0; transition: 0.2s; }
.spire-card:hover .card-quick-del { opacity: 1; } .card-quick-del:hover { border-color: #c8a45c; background: rgba(200,164,92,0.15); color: #e8904a; }

/* 提示词独立切换按钮 */
.card-toggle-btn { 
  position: absolute; top: 8px; left: 8px; z-index: 4; width: 28px; height: 28px; 
  border-radius: 50%; background: rgba(10,5,2,0.8); border: 2px solid #3a2a1a; 
  color: #8a7a6a; font-size: 14px; cursor: pointer; transition: 0.2s;
  display: flex; align-items: center; justify-content: center;
}
.card-toggle-btn.active { border-color: #c8a45c; background: rgba(200,164,92,0.15); color: #ffe8a0; box-shadow: 0 0 8px rgba(200,164,92,0.3); }
.card-toggle-btn:hover { transform: scale(1.1); }

/* 图片预览 - 修复高度 */
.card-img-preview { 
  height: 35%; /* 固定百分比高度 */
  min-height: 120px; 
  background: #0a0502; 
  overflow: hidden; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  border-bottom: 1px solid #2a1f14; 
}
.card-img-preview img { max-width: 100%; max-height: 100%; object-fit: contain; opacity: 0.8; transition: 0.2s; }
.spire-card:hover .card-img-preview img { opacity: 1; transform: scale(1.03); }

/* 卡图区 - 恢复38%高度 */
.card-art {
  height: 38%; /* 固定百分比 */
  display: flex; 
  align-items: center; 
  justify-content: center;
  position: relative; 
  overflow: hidden;
  flex-shrink: 0; /* 防止压缩 */
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

/* 提示词专属样式 */
.is-prompt { }
.is-prompt.is-selected { border-color: #c8a45c; box-shadow: 0 0 12px rgba(200,164,92,0.4), inset 0 0 15px rgba(200,164,92,0.1); }
.spire-art-prompt { background: linear-gradient(160deg, #1a2a3a 0%, #0d1520 60%, #050a10 100%) !important; }
.spire-prompt-orb { background: radial-gradient(circle at 40% 35%, #2a3a4a, #101520); border-color: #2a4a6b; color: #8ab0d4; }
.prompt-order-badge { position: absolute; top: 8px; right: 8px; width: 22px; height: 22px; background: #c8a45c; color: #1a1108; font-size: 11px; font-weight: bold; border-radius: 50%; display: flex; align-items: center; justify-content: center; z-index: 4; box-shadow: 0 2px 6px rgba(0,0,0,0.5); }

.energy-orb { position: absolute; top: 8px; left: 8px; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; z-index: 3; border: 2px solid; }
.energy-orb.copper  { background: radial-gradient(circle at 40% 35%, #4a3020, #2a1a10); border-color: #4a3020; color: #8a6a5a; }
.energy-orb.bronze { background: radial-gradient(circle at 40% 35%, #6b4226, #3a2010); border-color: #8b5a2b; color: #c8a080; }
.energy-orb.silver { background: radial-gradient(circle at 40% 35%, #7a7a7a, #3a3a3a); border-color: #a0a0a0; color: #e0e0e0; }
.energy-orb.gold   { background: radial-gradient(circle at 40% 35%, #c8a040, #6a4a10); border-color: #c8a45c; color: #ffe8a0; box-shadow: 0 0 10px rgba(200,160,40,0.3); }
.orb-num { font-size: 12px; font-weight: bold; }

.type-banner { height: 5px; margin: 0 10px; border-radius: 0 0 3px 3px; display: flex; align-items: center; justify-content: center; z-index: 3; font-size: 9px; letter-spacing: 1px; color: #1a1108; font-weight: bold; flex-shrink: 0; }
.type-banner.PM { background: #2a4a6b; } .type-banner span { background: inherit; padding: 0 8px; position: relative; top: -1px; font-size: 9px; }

/* 描述框 - 使用flex: 1填充剩余空间 */
.desc-box { 
  flex: 1; /* 填充剩余空间 */
  padding: 8px 10px 10px; 
  display: flex; 
  flex-direction: column; 
  gap: 2px; 
  border-top: 1px solid rgba(200,164,92,0.08); 
  background: linear-gradient(180deg, rgba(20,10,5,0.6) 0%, rgba(15,8,3,0.9) 100%);
  overflow: hidden; /* 防止溢出 */
}
.card-name { font-size: 14px; font-weight: bold; color: #e0d4b8; line-height: 1.3; }
.card-desc { font-size: 11px; color: #8a7a6a; line-height: 1.5; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; }
.rarity-line { font-size: 9px; letter-spacing: 2px; text-transform: uppercase; }
.rarity-line.copper { color: #4a3020; } .rarity-line.bronze { color: #8b5a2b; } .rarity-line.silver { color: #a0a0a0; } .rarity-line.gold   { color: #c8a040; }

/* === 详情模态框 === */
.spire-modal-overlay { position: fixed; inset: 0; background: rgba(5,3,1,0.92); z-index: 999; display: flex; align-items: center; justify-content: center; padding: 20px; animation: fadeIn 0.2s ease; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.spire-modal { width: 90%; max-width: 1100px; height: 85vh; max-height: 800px; background: #140e09; border: 2px solid #2a1f14; border-radius: 12px; box-shadow: 0 12px 48px rgba(0,0,0,0.8); display: flex; flex-direction: column; overflow: hidden; position: relative; }
.spire-modal::before { content: ''; position: absolute; inset: 4px; border: 1px solid rgba(200,164,92,0.1); border-radius: 10px; pointer-events: none; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 20px; border-bottom: 1px solid #2a1f14; background: #100a06; }
.modal-title { font-size: 16px; color: #d4c8a8; font-weight: 600; }
.modal-close { background: transparent; border: none; color: #6a5a4a; font-size: 24px; cursor: pointer; transition: 0.2s; }
.modal-close:hover { color: #e8904a; transform: scale(1.1); }
.modal-body { flex: 1; display: flex; overflow: hidden; }
.modal-left { width: 320px; background: #0d0805; border-right: 1px solid #2a1f14; display: flex; flex-direction: column; overflow-y: auto; }
.modal-right { flex: 1; display: flex; flex-direction: column; background: #100a06; }

.detail-preview { padding: 16px; }
.detail-img { width: 100%; height: 180px; background: #0a0502; border: 1px solid #2a1f14; border-radius: 6px; overflow: hidden; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; }
.detail-img img { max-width: 100%; max-height: 100%; object-fit: contain; }
.detail-meta { display: flex; flex-direction: column; gap: 8px; }
.detail-title-input { background: transparent; border: 1px solid #2a1f14; color: #e0d4b8; font-size: 16px; font-weight: bold; padding: 6px 10px; border-radius: 4px; width: 100%; }
.detail-title-input:focus { outline: none; border-color: #c8a45c; }
.detail-rarity { font-size: 10px; color: #8a7a6a; letter-spacing: 1px; text-transform: uppercase; }
.detail-note { background: #100a06; border: 1px solid #2a1f14; color: #8a7a6a; font-size: 12px; padding: 8px; border-radius: 4px; min-height: 80px; resize: vertical; width: 100%; box-sizing: border-box; }
.detail-note:focus { outline: none; border-color: #8a6d2b; }

.editor-toolbar { display: flex; justify-content: space-between; align-items: center; padding: 8px 16px; border-bottom: 1px solid #2a1f14; background: #0d0805; }
.editor-label { font-size: 12px; color: #8a7a6a; font-weight: 600; }
.editor-actions { display: flex; gap: 8px; }
.detail-content-editor { flex: 1; width: 100%; padding: 16px; background: #140e09; color: #d4c8a8; border: none; font-size: 14px; line-height: 1.8; font-family: 'Consolas', 'Monaco', 'SimSun', monospace; resize: none; box-sizing: border-box; }
.detail-content-editor:focus { outline: none; background: #18100a; }
.editor-footer { display: flex; justify-content: space-between; padding: 6px 16px; border-top: 1px solid #2a1f14; background: #0d0805; font-size: 10px; color: #4a3a2a; }
.editor-hint { font-style: italic; }

/* 提示反馈 */
.spire-toast { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); padding: 8px 16px; border-radius: 4px; font-size: 12px; font-weight: 500; background: rgba(20,10,5,0.95); border: 1px solid #c8a45c; color: #e0d4b8; box-shadow: 0 4px 12px rgba(0,0,0,0.6); z-index: 9999; transition: opacity 0.3s, transform 0.3s; font-family: monospace; }
.spire-toast.error { border-color: #8b2a2a; color: #e8904a; }
</style>