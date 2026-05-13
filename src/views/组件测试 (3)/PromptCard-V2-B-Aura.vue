<template>
  <div class="aura-container">
    <!-- 顶部功能区 -->
    <div class="header-bar">
      <div class="relic-slot">
        <div class="slot-label">遗物栏</div>
        <div class="relic-area">
          <div class="relic-item empty" v-for="i in 3" :key="i">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </div>
        </div>
      </div>
      <div class="filter-bar">
        <span class="filter-label">筛选</span>
        <div class="filter-buttons">
          <button 
            v-for="tag in filterTags" 
            :key="tag.value"
            :class="['filter-btn', tag.value, { active: activeFilter === tag.value }]"
            @click="activeFilter = activeFilter === tag.value ? 'all' : tag.value"
          >{{ tag.label }}</button>
        </div>
      </div>
    </div>

    <!-- 卡片网格 -->
    <div class="card-grid">
      <div 
        v-for="card in filteredCards" 
        :key="card.id"
        :class="['prompt-card', card.rarity]"
        @click="selectedCard = card"
      >
        <div class="aura-glow"></div>
        <div class="card-inner">
          <div class="card-category" :style="{ borderLeftColor: categoryColors[card.category] }">
            {{ card.category }}
          </div>
          <div class="card-content">
            <div class="card-title">{{ card.title }}</div>
            <div class="card-prompt">{{ card.prompt }}</div>
          </div>
          <div class="card-footer">
            <span class="rarity-badge" :class="card.rarity">{{ card.rarity }}</span>
            <button class="copy-btn" @click.stop="copyPrompt(card.prompt)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2"/>
                <path d="M5 15V5a2 2 0 012-2h10"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <div class="modal-overlay" v-if="selectedCard" @click="selectedCard = null">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="selectedCard = null">×</button>
        <div class="modal-header">
          <span class="modal-category" :style="{ borderLeftColor: categoryColors[selectedCard.category] }">
            {{ selectedCard.category }}
          </span>
          <span class="modal-rarity" :class="selectedCard.rarity">{{ selectedCard.rarity }}</span>
        </div>
        <div class="modal-title">{{ selectedCard.title }}</div>
        <div class="modal-prompt">{{ selectedCard.prompt }}</div>
        <div class="modal-actions">
          <button class="action-btn primary" @click="copyPrompt(selectedCard.prompt)">复制提示词</button>
          <button class="action-btn secondary" @click="selectedCard = null">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const activeFilter = ref('all')
const selectedCard = ref(null)

const filterTags = [
  { label: '角色', value: 'role' },
  { label: '场景', value: 'scene' },
  { label: '风格', value: 'style' },
  { label: '光线', value: 'light' },
]

const categoryColors = {
  role: '#e74c3c',
  scene: '#3498db',
  style: '#9b59b6',
  light: '#f39c12'
}

const cards = ref([
  { id: 1, title: '赛博朋克武士', category: 'role', prompt: 'cyberpunk samurai, neon katana, rain-soaked streets, holographic tattoos, chrome arm replacements, cinematic lighting', rarity: 'gold' },
  { id: 2, title: '蒸汽朋克机械师', category: 'role', prompt: 'steampunk mechanic, brass goggles, leather apron, gear-powered prosthetics, Victorian industrial background, warm sepia tones', rarity: 'silver' },
  { id: 3, title: '未来都市夜景', category: 'scene', prompt: 'futuristic cityscape, flying vehicles, holographic billboards, wet streets reflecting neon lights, aerial view, Blade Runner atmosphere', rarity: 'gold' },
  { id: 4, title: '废弃太空站', category: 'scene', prompt: 'abandoned space station, zero gravity debris, flickering emergency lights, Earth visible through cracked window, desolation', rarity: 'silver' },
  { id: 5, title: '水彩插画风', category: 'style', prompt: 'watercolor illustration style, soft edges, bleeding colors, delicate brushstrokes, paper texture visible, dreamy atmosphere', rarity: 'bronze' },
  { id: 6, title: '厚涂油画风', category: 'style', prompt: 'oil painting style, thick impasto brushstrokes, rich texture, visible canvas, dramatic chiaroscuro lighting, classical technique', rarity: 'silver' },
  { id: 7, title: '金色hourglass光线', category: 'light', prompt: 'golden hour lighting, warm sun rays streaming through clouds, long dramatic shadows, golden particles in air, magic hour', rarity: 'bronze' },
  { id: 8, title: '霓虹背光', category: 'light', prompt: 'neon backlighting, silhouette foreground, vibrant color bleeding, foggy atmosphere, urban night scene, high contrast', rarity: 'bronze' },
  { id: 9, title: '森林精灵猎人', category: 'role', prompt: 'elf ranger, moss green cloak, compound bow, pointed ears, forest camouflage makeup, ancient woodland throne', rarity: 'gold' },
  { id: 10, title: '机械义体医生', category: 'role', prompt: 'cybernetic surgeon, surgical arm interface, sterile white coat, neural connection ports, operating room hologram', rarity: 'silver' },
  { id: 11, title: '浮空花园神殿', category: 'scene', prompt: 'floating garden temple, clouds below, marble columns, hanging vines, impossible architecture, golden sunrise', rarity: 'gold' },
  { id: 12, title: '深海探测器', category: 'scene', prompt: 'deep sea exploration vessel, bioluminescent creatures, crushing darkness, pressure gauge, sonar screen, unknown depths', rarity: 'bronze' },
])

const filteredCards = computed(() => {
  if (activeFilter.value === 'all') return cards.value
  return cards.value.filter(c => c.category === activeFilter.value)
})

const copyPrompt = (text) => {
  navigator.clipboard.writeText(text)
}
</script>

<style scoped>
.aura-container {
  min-height: 100vh;
  background: #08080a;
  padding: 24px;
  font-family: system-ui, sans-serif;
}

.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  gap: 24px;
  flex-wrap: wrap;
}

.relic-slot {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.slot-label, .filter-label {
  color: #555;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.relic-area {
  display: flex;
  gap: 8px;
}

.relic-item {
  width: 56px;
  height: 56px;
  border: 1px dashed #2a2a2a;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333;
  cursor: pointer;
  transition: all 0.3s ease;
}

.relic-item:hover {
  border-color: var(--accent);
  background: rgba(199, 106, 82, 0.1);
}

.relic-item svg {
  width: 20px;
  height: 20px;
}

.filter-bar {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 6px 14px;
  border: 1px solid #2a2a2a;
  background: transparent;
  color: #666;
  font-size: 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  font-family: inherit;
}

.filter-btn:hover, .filter-btn.active {
  border-color: #c76a52;
  color: #c76a52;
}

.filter-btn.active {
  background: rgba(199, 106, 82, 0.15);
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.prompt-card {
  position: relative;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  overflow: visible;
}

/* 铜卡 - 暖橙光晕 */
.prompt-card.bronze {
  --aura-color: #cd7f32;
  --aura-size: 30px;
  --aura-opacity: 0.6;
  background: linear-gradient(180deg, #1a1512 0%, #0f0d0b 100%);
  border: 1px solid rgba(205, 127, 50, 0.2);
}
.prompt-card.bronze:hover {
  transform: translateY(-6px);
}
.prompt-card.bronze:hover .aura-glow {
  opacity: 1;
  box-shadow: 
    0 0 var(--aura-size) rgba(205, 127, 50, var(--aura-opacity)),
    0 0 calc(var(--aura-size) * 2) rgba(255, 140, 50, calc(var(--aura-opacity) * 0.5)),
    inset 0 0 20px rgba(205, 127, 50, 0.1);
}

/* 银卡 - 冷蓝光晕 */
.prompt-card.silver {
  --aura-color: #a8d4ff;
  --aura-size: 35px;
  --aura-opacity: 0.5;
  background: linear-gradient(180deg, #1a1c1f 0%, #0f1012 100%);
  border: 1px solid rgba(168, 212, 255, 0.15);
}
.prompt-card.silver:hover {
  transform: translateY(-8px);
}
.prompt-card.silver:hover .aura-glow {
  opacity: 1;
  box-shadow: 
    0 0 var(--aura-size) rgba(168, 212, 255, var(--aura-opacity)),
    0 0 calc(var(--aura-size) * 2) rgba(200, 230, 255, calc(var(--aura-opacity) * 0.4)),
    inset 0 0 25px rgba(168, 212, 255, 0.08);
}

/* 金卡 - 强金色辉光 */
.prompt-card.gold {
  --aura-color: #ffd700;
  --aura-size: 45px;
  --aura-opacity: 0.7;
  background: linear-gradient(180deg, #1f1a12 0%, #0f0e0a 100%);
  border: 1px solid rgba(255, 215, 0, 0.3);
}
.prompt-card.gold:hover {
  transform: translateY(-10px);
}
.prompt-card.gold:hover .aura-glow {
  opacity: 1;
  box-shadow: 
    0 0 var(--aura-size) rgba(255, 215, 0, var(--aura-opacity)),
    0 0 calc(var(--aura-size) * 1.5) rgba(255, 200, 0, calc(var(--aura-opacity) * 0.6)),
    0 0 calc(var(--aura-size) * 3) rgba(255, 180, 0, calc(var(--aura-opacity) * 0.3)),
    inset 0 0 30px rgba(255, 215, 0, 0.12);
}

.aura-glow {
  position: absolute;
  inset: -20px;
  border-radius: 24px;
  opacity: 0;
  transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
  pointer-events: none;
  z-index: -1;
}

.card-inner {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
}

.card-category {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: #666;
  padding-left: 8px;
  border-left: 2px solid;
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #e8e8e8;
  line-height: 1.4;
}

.card-prompt {
  font-size: 12px;
  color: #555;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rarity-badge {
  font-size: 10px;
  padding: 3px 10px;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.rarity-badge.bronze { background: rgba(205, 127, 50, 0.15); color: #cd7f32; }
.rarity-badge.silver { background: rgba(168, 212, 255, 0.12); color: #a8d4ff; }
.rarity-badge.gold { background: rgba(255, 215, 0, 0.15); color: #ffd700; }

.copy-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #333;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #555;
  transition: all 0.3s;
}

.copy-btn:hover {
  border-color: #c76a52;
  color: #c76a52;
  background: rgba(199, 106, 82, 0.1);
}

.copy-btn svg {
  width: 16px;
  height: 16px;
}

/* 弹窗 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
}

.modal-content {
  background: #101010;
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  padding: 32px;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border: 1px solid #333;
  background: transparent;
  color: #666;
  font-size: 20px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.modal-close:hover {
  border-color: #c76a52;
  color: #c76a52;
}

.modal-header {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
}

.modal-category {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: #666;
  padding-left: 8px;
  border-left: 2px solid;
}

.modal-rarity {
  font-size: 10px;
  padding: 3px 10px;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.modal-rarity.bronze { background: rgba(205, 127, 50, 0.15); color: #cd7f32; }
.modal-rarity.silver { background: rgba(168, 212, 255, 0.12); color: #a8d4ff; }
.modal-rarity.gold { background: rgba(255, 215, 0, 0.15); color: #ffd700; }

.modal-title {
  font-size: 24px;
  font-weight: 600;
  color: #e8e8e8;
  margin-bottom: 16px;
}

.modal-prompt {
  font-size: 14px;
  color: #666;
  line-height: 1.8;
  margin-bottom: 24px;
  word-break: break-word;
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  flex: 1;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  font-family: inherit;
}

.action-btn.primary {
  background: #c76a52;
  border: none;
  color: #fff;
}

.action-btn.primary:hover {
  background: #d4795f;
}

.action-btn.secondary {
  background: transparent;
  border: 1px solid #333;
  color: #888;
}

.action-btn.secondary:hover {
  border-color: #555;
  color: #aaa;
}
</style>
