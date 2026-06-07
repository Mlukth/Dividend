<template>
  <div class="nexus-archive" :class="{ 'is-dragging': isDragging }">
    <!-- 动态背景 -->
    <div class="bg-grid" />
    <div class="bg-particles" />

    <!-- 顶部控制台 -->
    <header class="nexus-header">
      <div class="title-block">
        <h1>虚空档案库</h1>
        <span class="subtitle">NEXUS ARCHIVE v3.0</span>
      </div>

      <div class="controls">
        <div class="search-box">
          <input v-model="searchQuery" placeholder="检索协议..." @input="handleSearch" />
          <span class="search-icon">⌕</span>
        </div>
        <div class="filter-chips">
          <button v-for="cat in categories" :key="cat"
                  :class="['chip', { active: activeFilter === cat }]"
                  @click="toggleFilter(cat)">
            {{ cat }}
          </button>
        </div>
        <div class="rarity-toggles">
          <button v-for="r in rarities" :key="r"
                  :class="['rarity-btn', r, { active: activeRarity === r }]"
                  @click="toggleRarity(r)">
            {{ r === 'all' ? '全谱' : r }}
          </button>
        </div>
      </div>

      <div class="status-bar">
        <span>已收录: <strong>{{ collectionCount }}/{{ cards.length }}</strong></span>
        <button class="export-btn" @click="exportData">⬇ 导出协议</button>
      </div>
    </header>

    <!-- 卡牌网格 -->
    <div class="card-grid" ref="gridRef" @keydown="handleGridKeydown" tabindex="0">
      <div v-for="(card, idx) in filteredCards" :key="card.id"
           v-memo="[card.collected, card.favorited, activeFilter, activeRarity, searchQuery]"
           :class="['archive-card', card.rarity, { 'collected': card.collected, 'dragging': draggedIdx === idx }]"
           :draggable="true"
           @dragstart="onDragStart($event, idx)"
           @dragover.prevent
           @drop="onDrop($event, idx)"
           @dragend="onDragEnd"
           @mouseenter="onCardHover($event, idx)"
           @mouseleave="onCardLeave"
           @click="openModal(card)">
        
        <div class="card-inner">
          <div class="card-glow" :class="card.rarity" />
          <div class="card-header">
            <span class="card-id">{{ formatId(card.id) }}</span>
            <span class="card-status" v-if="card.collected">✓</span>
          </div>
          <div class="card-artwork" :style="{ background: getArtGradient(card) }">
            <div class="art-overlay" />
            <span class="art-icon">{{ getCategoryIcon(card.category) }}</span>
          </div>
          <div class="card-meta">
            <h3>{{ card.title }}</h3>
            <p class="card-snippet">{{ truncate(card.prompt, 65) }}</p>
            <div class="rarity-bar" :class="card.rarity" />
          </div>
          <div class="card-footer">
            <button class="fav-btn" :class="{ active: card.favorited }" @click.stop="toggleFav(card)">♥</button>
            <span class="tag">{{ card.category }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <Transition name="modal" mode="out-in">
      <div v-if="selectedCard" class="modal-overlay" @click.self="closeModal" @keydown.esc="closeModal" tabindex="-1">
        <div class="modal-container" :class="selectedCard.rarity" @click.stop>
          <div class="modal-header">
            <h2>{{ selectedCard.title }}</h2>
            <button class="close-btn" @click="closeModal" aria-label="关闭弹窗">✕</button>
          </div>
          <div class="modal-body">
            <div class="modal-art" :style="{ background: getArtGradient(selectedCard) }" />
            <div class="modal-info">
              <div class="info-grid">
                <div class="info-item"><span>协议ID</span><code>{{ formatId(selectedCard.id) }}</code></div>
                <div class="info-item"><span>稀有度</span><span :class="['rarity-tag', selectedCard.rarity]">{{ selectedCard.rarity.toUpperCase() }}</span></div>
                <div class="info-item"><span>分类</span><span>{{ selectedCard.category }}</span></div>
                <div class="info-item"><span>状态</span><span>{{ selectedCard.collected ? '已归档' : '未捕获' }}</span></div>
              </div>
              <div class="prompt-box">
                <pre>{{ selectedCard.prompt }}</pre>
                <button class="copy-btn" @click="copyToClipboard(selectedCard.prompt)">📋 复制提示词</button>
              </div>
              <div class="action-row">
                <button class="action-btn primary" @click="collectCard(selectedCard)">
                  {{ selectedCard.collected ? '✓ 已收录' : '⬇ 归档此协议' }}
                </button>
                <button class="action-btn secondary" @click="toggleFav(selectedCard)">
                  {{ selectedCard.favorited ? '★ 已星标' : '☆ 加入星标' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 提示框 -->
    <Transition name="toast">
      <div v-if="toast" class="toast" :class="toast.type">
        {{ toast.message }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

// ================= 类型定义 =================
interface ArchiveCard {
  id: string
  title: string
  category: 'role' | 'scene' | 'style' | 'light' | 'tech'
  prompt: string
  rarity: 'bronze' | 'silver' | 'gold' | 'legend'
  collected: boolean
  favorited: boolean
}

type FilterType = 'all' | 'role' | 'scene' | 'style' | 'light' | 'tech'
type RarityType = 'all' | 'bronze' | 'silver' | 'gold' | 'legend'

// ================= 初始数据 =================
const cards = ref<ArchiveCard[]>([
  { id: 'N-001', title: '赛博浪人', category: 'role', prompt: 'cyberpunk ronin, neon katana, rain-slicked alley, holographic tattoos, chrome prosthetic arm, cinematic volumetric fog', rarity: 'gold', collected: false, favorited: false },
  { id: 'N-002', title: '废土调音师', category: 'role', prompt: 'post-apocalyptic tuner, patched duster coat, analog synthesizer rig, dust storm backdrop, warm amber lighting, gritty realism', rarity: 'silver', collected: false, favorited: false },
  { id: 'N-003', title: '浮空回廊', category: 'scene', prompt: 'floating marble corridors, anti-gravity debris, aurora sky, impossible geometry, ethereal god rays, studio Ghibli meets brutalism', rarity: 'gold', collected: false, favorited: false },
  { id: 'N-004', title: '深渊监听站', category: 'scene', prompt: 'deep-sea monitoring outpost, bioluminescent flora, sonar pings, cracked viewport, oppressive darkness, Lovecraftian scale', rarity: 'silver', collected: false, favorited: false },
  { id: 'N-005', title: '蚀刻版画风', category: 'style', prompt: 'etching print style, cross-hatching, ink bleed, vintage paper grain, monochrome palette, 19th century engraving aesthetic', rarity: 'bronze', collected: false, favorited: false },
  { id: 'N-006', title: '故障艺术', category: 'style', prompt: 'glitch art, datamoshing, RGB split, VHS tracking lines, digital corruption, cyber decay, high contrast distortion', rarity: 'legend', collected: false, favorited: false },
  { id: 'N-007', title: '生物荧光', category: 'light', prompt: 'bioluminescent glow, dark environment, neon cyan & magenta accents, subsurface scattering, macro photography depth of field', rarity: 'silver', collected: false, favorited: false },
  { id: 'N-008', title: '逆光剪影', category: 'light', prompt: 'backlit silhouette, rim lighting, fog diffusion, high contrast, dramatic shadow play, cinematic wide angle', rarity: 'bronze', collected: false, favorited: false },
  { id: 'N-009', title: '量子接口', category: 'tech', prompt: 'quantum interface UI, holographic data streams, translucent glass panels, neural link ports, clean futuristic lab, soft white lighting', rarity: 'gold', collected: false, favorited: false },
  { id: 'N-010', title: '蒸汽核心', category: 'tech', prompt: 'steampunk engine core, brass gears, pressure valves, steam vents, copper piping, warm incandescent glow, intricate mechanical details', rarity: 'legend', collected: false, favorited: false },
])

// ================= 状态管理 =================
const activeFilter = ref<FilterType>('all')
const activeRarity = ref<RarityType>('all')
const searchQuery = ref('')
const selectedCard = ref<ArchiveCard | null>(null)
const toast = ref<{ message: string; type: 'success' | 'info' } | null>(null)
const draggedIdx = ref<number | null>(null)
const isDragging = ref(false)
const categories: FilterType[] = ['all', 'role', 'scene', 'style', 'light', 'tech']
const rarities: RarityType[] = ['all', 'bronze', 'silver', 'gold', 'legend']

// ================= 响应式过滤 =================
const filteredCards = computed(() => {
  let list = [...cards.value]
  if (activeFilter.value !== 'all') list = list.filter(c => c.category === activeFilter.value)
  if (activeRarity.value !== 'all') list = list.filter(c => c.rarity === activeRarity.value)
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(c => c.title.toLowerCase().includes(q) || c.prompt.toLowerCase().includes(q))
  }
  return list
})

const collectionCount = computed(() => cards.value.filter(c => c.collected).length)

// ================= 工具函数 =================
const debounce = <T extends (...args: any[]) => any>(fn: T, delay: number) => {
  let timer: number
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = window.setTimeout(() => fn(...args), delay)
  }
}

const handleSearch = debounce(() => { /* computed 自动响应 */ }, 200)

const truncate = (str: string, len: number) => str.length > len ? str.slice(0, len) + '...' : str

const formatId = (id: string) => `#${id.replace('N-', '')}`

const getCategoryIcon = (cat: string) => ({ role: '👤', scene: '🌌', style: '🎨', light: '💡', tech: '⚙️' })[cat] || '❓'

const getArtGradient = (card: ArchiveCard) => {
  const map: Record<string, string> = {
    role: 'linear-gradient(145deg, #2a1a1a 0%, #0f0505 60%, #000000 100%)',
    scene: 'linear-gradient(145deg, #1a2a3a 0%, #050a15 60%, #000000 100%)',
    style: 'linear-gradient(145deg, #2a1a3a 0%, #0f0518 60%, #000000 100%)',
    light: 'linear-gradient(145deg, #3a2a0a 0%, #150d02 60%, #000000 100%)',
    tech: 'linear-gradient(145deg, #1a3a3a 0%, #051515 60%, #000000 100%)',
  }
  return map[card.category] || map.role
}

// ================= 交互逻辑 =================
const toggleFilter = (cat: FilterType) => activeFilter.value = activeFilter.value === cat ? 'all' : cat
const toggleRarity = (r: RarityType) => activeRarity.value = activeRarity.value === r ? 'all' : r

const toggleFav = (card: ArchiveCard) => {
  card.favorited = !card.favorited
  showToast(card.favorited ? '已加入星标' : '已取消星标', 'info')
}

const collectCard = (card: ArchiveCard) => {
  card.collected = !card.collected
  showToast(card.collected ? '协议已归档' : '已从归档中移除', 'success')
}

const openModal = (card: ArchiveCard) => selectedCard.value = card
const closeModal = () => selectedCard.value = null

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    showToast('提示词已复制至剪贴板', 'success')
  } catch {
    // 降级方案
    const ta = document.createElement('textarea')
    ta.value = text
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    showToast('提示词已复制（兼容模式）', 'success')
  }
}

const exportData = () => {
  const data = JSON.stringify(cards.value, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'nexus-archive.json'
  a.click()
  URL.revokeObjectURL(url)
  showToast('档案导出完成', 'success')
}

const showToast = (message: string, type: 'success' | 'info') => {
  toast.value = { message, type }
  setTimeout(() => toast.value = null, 2200)
}

// ================= 拖拽排序 =================
const onDragStart = (e: DragEvent, idx: number) => {
  draggedIdx.value = idx
  isDragging.value = true
  if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'
}

const onDrop = (e: DragEvent, targetIdx: number) => {
  e.preventDefault()
  if (draggedIdx.value === null || draggedIdx.value === targetIdx) return
  
  // 同步到原始数组
  const [moved] = cards.value.splice(draggedIdx.value, 1)
  cards.value.splice(targetIdx, 0, moved)
  showToast('协议顺序已更新', 'info')
}

const onDragEnd = () => {
  draggedIdx.value = null
  isDragging.value = false
}

// ================= 键盘导航 =================
const handleGridKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    const active = document.activeElement
    if (active?.classList.contains('archive-card')) active.click()
  }
}

const onCardHover = (e: MouseEvent, idx: number) => {
  const card = (e.currentTarget as HTMLElement)
  const rect = card.getBoundingClientRect()
  const x = (e.clientX - rect.left) / rect.width - 0.5
  const y = (e.clientY - rect.top) / rect.height - 0.5
  card.style.setProperty('--tilt-x', `${y * -10}deg`)
  card.style.setProperty('--tilt-y', `${x * 10}deg`)
}

const onCardLeave = (e: MouseEvent) => {
  (e.currentTarget as HTMLElement).style.setProperty('--tilt-x', '0deg')
  (e.currentTarget as HTMLElement).style.setProperty('--tilt-y', '0deg')
}

// ================= 持久化 =================
watch(cards, (val) => {
  try { localStorage.setItem('nexus-archive-v3', JSON.stringify(val)) } catch {}
}, { deep: true })

onMounted(() => {
  try {
    const saved = localStorage.getItem('nexus-archive-v3')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) cards.value = parsed
    }
  } catch {}
})

onUnmounted(() => {
  // 清理全局监听（如需）
})
</script>

<style scoped>
/* === 注册自定义动画属性 === */
@property --tilt-x { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
@property --tilt-y { syntax: '<angle>'; initial-value: 0deg; inherits: false; }

/* === 全局变量 === */
:root {
  --bg-primary: #0a0505;
  --bg-card: #140e09;
  --border-base: #2a1f14;
  --text-primary: #e8d4b0;
  --text-muted: #8a7a6a;
  --accent-bronze: #8b5a2b;
  --accent-silver: #a0a0a0;
  --accent-gold: #c8a040;
  --accent-legend: #e040e0;
  --glow-bronze: rgba(139, 90, 43, 0.4);
  --glow-silver: rgba(160, 160, 160, 0.4);
  --glow-gold: rgba(200, 160, 40, 0.5);
  --glow-legend: rgba(224, 64, 224, 0.5);
}

/* === 基础容器 === */
.nexus-archive {
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'Source Han Serif SC', 'Noto Serif SC', 'SimSun', serif;
  padding: 24px;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
}

/* === 背景网格 & 粒子 === */
.bg-grid {
  position: fixed; inset: 0; pointer-events: none;
  background-image: 
    linear-gradient(rgba(200, 160, 40, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(200, 160, 40, 0.03) 1px, transparent 1px);
  background-size: 40px 40px;
  z-index: -2;
}
.bg-particles {
  position: fixed; inset: 0; pointer-events: none; z-index: -1;
  background: radial-gradient(circle at 20% 30%, rgba(200, 160, 40, 0.08) 0%, transparent 40%),
              radial-gradient(circle at 80% 70%, rgba(224, 64, 224, 0.06) 0%, transparent 35%);
  animation: pulseBg 8s ease-in-out infinite alternate;
}
@keyframes pulseBg { 0% { opacity: 0.8; } 100% { opacity: 1; } }

/* === 头部控制 === */
.nexus-header {
  display: flex; flex-direction: column; gap: 16px;
  margin-bottom: 32px; padding: 20px;
  background: rgba(20, 14, 9, 0.85); border: 1px solid var(--border-base);
  border-radius: 8px; backdrop-filter: blur(10px);
}
.title-block h1 { margin: 0; font-size: 1.8rem; letter-spacing: 2px; }
.subtitle { font-size: 0.75rem; color: var(--text-muted); letter-spacing: 4px; }

.controls { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
.search-box { position: relative; flex: 1; min-width: 200px; }
.search-box input {
  width: 100%; padding: 10px 14px 10px 36px; border: 1px solid var(--border-base);
  background: rgba(0,0,0,0.4); color: var(--text-primary); border-radius: 6px;
  font-family: inherit; outline: none; transition: all 0.3s;
}
.search-box input:focus { border-color: var(--accent-gold); box-shadow: 0 0 0 2px rgba(200, 160, 40, 0.2); }
.search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted); }

.filter-chips, .rarity-toggles { display: flex; gap: 8px; flex-wrap: wrap; }
.chip, .rarity-btn {
  padding: 6px 14px; border: 1px solid var(--border-base); background: transparent;
  color: var(--text-muted); border-radius: 4px; cursor: pointer; font-family: inherit;
  font-size: 0.85rem; transition: all 0.25s;
}
.chip:hover, .rarity-btn:hover { border-color: #4a3a2a; color: var(--text-primary); }
.chip.active, .rarity-btn.active { border-color: var(--accent-gold); color: var(--accent-gold); background: rgba(200, 160, 40, 0.1); }

.rarity-btn.bronze.active { border-color: var(--accent-bronze); color: var(--accent-bronze); }
.rarity-btn.silver.active { border-color: var(--accent-silver); color: var(--accent-silver); }
.rarity-btn.legend.active { border-color: var(--accent-legend); color: var(--accent-legend); }

.status-bar { display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px solid var(--border-base); }
.export-btn { background: transparent; border: 1px solid var(--accent-gold); color: var(--accent-gold); padding: 8px 16px; border-radius: 6px; cursor: pointer; transition: all 0.2s; }
.export-btn:hover { background: rgba(200, 160, 40, 0.1); }

/* === 网格 === */
.card-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px; perspective: 1200px;
}

/* === 卡牌 === */
.archive-card {
  position: relative; height: 320px; background: var(--bg-card);
  border: 2px solid var(--border-base); border-radius: 10px;
  cursor: pointer; overflow: hidden; transition: all 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);
  transform-style: preserve-3d; will-change: transform;
  box-shadow: 0 6px 20px rgba(0,0,0,0.4);
}
.archive-card:hover {
  transform: rotateX(var(--tilt-x)) rotateY(var(--tilt-y)) scale(1.03) translateY(-8px);
  border-color: #5a4a3a; box-shadow: 0 12px 30px rgba(0,0,0,0.5);
}
.archive-card.dragging { opacity: 0.6; transform: scale(0.95); }
.archive-card.collected { border-color: #2a5a3a; }

/* 稀有度光晕 */
.card-glow {
  position: absolute; inset: 0; pointer-events: none; z-index: 2; opacity: 0;
  transition: opacity 0.4s;
}
.card-glow.bronze { box-shadow: inset 0 0 30px var(--glow-bronze); }
.card-glow.silver { box-shadow: inset 0 0 30px var(--glow-silver); }
.card-glow.gold { box-shadow: inset 0 0 40px var(--glow-gold); }
.card-glow.legend { box-shadow: inset 0 0 40px var(--glow-legend); }
.archive-card:hover .card-glow { opacity: 1; }

.card-inner { position: relative; height: 100%; display: flex; flex-direction: column; z-index: 3; }

.card-header { display: flex; justify-content: space-between; padding: 10px 12px 0; }
.card-id { font-size: 0.75rem; color: var(--text-muted); letter-spacing: 1px; }
.card-status { color: #4a9a6a; font-weight: bold; }

.card-artwork { height: 42%; margin: 0 12px; border-radius: 6px; position: relative; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.art-overlay { position: absolute; inset: 0; background: linear-gradient(180deg, transparent 0%, rgba(10, 5, 5, 0.8) 100%); }
.art-icon { font-size: 32px; opacity: 0.25; z-index: 1; filter: grayscale(0.8); }

.card-meta { flex: 1; padding: 8px 12px; display: flex; flex-direction: column; gap: 4px; }
.card-meta h3 { margin: 0; font-size: 0.95rem; color: var(--text-primary); }
.card-snippet { margin: 0; font-size: 0.75rem; color: var(--text-muted); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }

.rarity-bar { height: 4px; border-radius: 2px; margin-top: auto; }
.rarity-bar.bronze { background: var(--accent-bronze); }
.rarity-bar.silver { background: var(--accent-silver); }
.rarity-bar.gold { background: var(--accent-gold); }
.rarity-bar.legend { background: var(--accent-legend); }

.card-footer { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; border-top: 1px solid rgba(200, 160, 40, 0.15); }
.fav-btn { background: none; border: none; color: #5a4a3a; cursor: pointer; font-size: 1.1rem; transition: all 0.2s; }
.fav-btn.active { color: #e04040; transform: scale(1.1); }
.tag { font-size: 0.7rem; padding: 2px 6px; background: rgba(200, 160, 40, 0.1); border-radius: 4px; color: var(--text-muted); text-transform: uppercase; }

/* === 弹窗 === */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(5, 3, 1, 0.92);
  display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px;
  backdrop-filter: blur(6px);
}
.modal-container {
  width: min(480px, 100%); background: var(--bg-card); border: 2px solid #3a2a1a;
  border-radius: 12px; overflow: hidden; box-shadow: 0 16px 50px rgba(0,0,0,0.6);
  animation: modalEnter 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}
.modal-container.legend { border-color: #6a2a6a; box-shadow: 0 0 30px rgba(224, 64, 224, 0.2); }
@keyframes modalEnter { from { opacity: 0; transform: scale(0.9) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }

.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid var(--border-base); }
.modal-header h2 { margin: 0; font-size: 1.2rem; }
.close-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.2rem; padding: 4px; }
.modal-body { display: flex; flex-direction: column; gap: 16px; padding: 20px; }
.modal-art { height: 140px; border-radius: 8px; position: relative; }
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.info-item { display: flex; flex-direction: column; gap: 4px; }
.info-item span:first-child { font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; }
.info-item span:last-child, .info-item code { font-size: 0.85rem; color: var(--text-primary); }
.rarity-tag.bronze { color: var(--accent-bronze); }
.rarity-tag.silver { color: var(--accent-silver); }
.rarity-tag.gold { color: var(--accent-gold); }
.rarity-tag.legend { color: var(--accent-legend); }

.prompt-box { background: rgba(0,0,0,0.4); padding: 12px; border-radius: 6px; position: relative; }
.prompt-box pre { margin: 0; font-size: 0.8rem; color: #b8a888; white-space: pre-wrap; line-height: 1.6; font-family: 'Consolas', monospace; max-height: 120px; overflow-y: auto; }
.copy-btn { position: absolute; top: 8px; right: 8px; background: rgba(200, 160, 40, 0.15); border: 1px solid var(--accent-gold); color: var(--accent-gold); padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 0.75rem; }

.action-row { display: flex; gap: 10px; margin-top: 8px; }
.action-btn { flex: 1; padding: 10px; border-radius: 6px; cursor: pointer; font-family: inherit; transition: all 0.2s; }
.action-btn.primary { background: #3a2a1a; border: 1px solid #6a4a2a; color: var(--text-primary); }
.action-btn.primary:hover { background: #4a3a2a; }
.action-btn.secondary { background: transparent; border: 1px solid #3a2a1a; color: var(--text-muted); }
.action-btn.secondary:hover { border-color: #5a4a3a; color: var(--text-primary); }

/* === Toast === */
.toast {
  position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
  background: #1a1410; border: 1px solid #3a2a1a; color: var(--text-primary);
  padding: 10px 20px; border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.5);
  z-index: 2000; font-size: 0.9rem;
}
.toast.success { border-color: #4a7a4a; color: #8a9a8a; }
.toast.info { border-color: #4a4a7a; color: #8a8a9a; }

/* === 过渡动画 === */
.modal-enter-active, .modal-leave-active { transition: all 0.3s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.95); }
.toast-enter-active, .toast-leave-active { transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translate(-50%, 20px); }

/* === 响应式 === */
@media (max-width: 768px) {
  .controls { flex-direction: column; }
  .search-box { width: 100%; }
  .card-grid { grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
</style>