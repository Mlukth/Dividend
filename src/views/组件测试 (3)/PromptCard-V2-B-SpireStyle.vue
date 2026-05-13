<template>
  <div class="spire-wall">
    <!-- 顶部功能区 -->
    <div class="spire-header">
      <div class="spire-bonfire">
        <div class="bonfire-flame" />
        <span class="bonfire-label">遗物</span>
      </div>
      <div class="relic-row">
        <div class="relic-slot" v-for="i in 3" :key="i" />
      </div>
      <div class="filter-row">
        <span class="filter-title">筛选</span>
        <button
          v-for="tag in filterTags"
          :key="tag.value"
          :class="['filter-chip', tag.value, { on: activeFilter === tag.value }]"
          @click="activeFilter = activeFilter === tag.value ? 'all' : tag.value"
        >{{ tag.label }}</button>
      </div>
    </div>

    <!-- 卡片网格 -->
    <div class="spire-grid">
      <div
        v-for="card in filteredCards"
        :key="card.id"
        :class="['spire-card', card.rarity, card.category]"
        @click="selectedCard = card"
      >
        <!-- 能量球 -->
        <div class="energy-orb" :class="card.rarity">
          <span class="orb-num">{{ card.id }}</span>
        </div>

        <!-- 卡图区 -->
        <div class="card-art" :style="{ background: artGradient(card) }">
          <div class="art-symbol">{{ card.category }}</div>
        </div>

        <!-- 类型横幅 -->
        <div class="type-banner" :class="card.category">
          <span>{{ categoryLabel[card.category] }}</span>
        </div>

        <!-- 描述框 -->
        <div class="desc-box">
          <div class="card-name">{{ card.title }}</div>
          <div class="card-text">{{ card.prompt }}</div>
          <div class="rarity-line" :class="card.rarity">◆ {{ card.rarity }}</div>
        </div>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <div class="spire-modal-mask" v-if="selectedCard" @click="selectedCard = null">
      <div class="spire-modal" @click.stop>
        <div class="modal-frame">
          <div class="modal-energy" :class="selectedCard.rarity">{{ selectedCard.id }}</div>
          <div class="modal-art" :style="{ background: artGradient(selectedCard) }" />
          <div class="modal-banner" :class="selectedCard.category">{{ categoryLabel[selectedCard.category] }}</div>
          <div class="modal-desc">
            <div class="modal-name">{{ selectedCard.title }}</div>
            <div class="modal-text">{{ selectedCard.prompt }}</div>
            <div class="modal-rarity-line" :class="selectedCard.rarity">{{ selectedCard.rarity }}</div>
          </div>
        </div>
        <div class="modal-btns">
          <button class="spire-btn primary" @click="copyPrompt(selectedCard.prompt)">复制</button>
          <button class="spire-btn cancel" @click="selectedCard = null">关闭</button>
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

const categoryLabel = { role: '角色', scene: '场景', style: '风格', light: '光线' }

const artGradient = (card) => {
  const map = {
    role: 'linear-gradient(160deg, #3a1a1a 0%, #1a0a0a 60%, #0a0505 100%)',
    scene: 'linear-gradient(160deg, #1a2a3a 0%, #0a1a2a 60%, #050a15 100%)',
    style: 'linear-gradient(160deg, #2a1a3a 0%, #1a0a2a 60%, #0f0518 100%)',
    light: 'linear-gradient(160deg, #3a2a0a 0%, #2a1a05 60%, #150d02 100%)',
  }
  return map[card.category] || map.role
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
/* === 底色 === */
.spire-wall {
  min-height: 100vh;
  background: #0d0805;
  padding: 28px;
  font-family: 'SimSun', 'Source Han Serif SC', 'Noto Serif SC', serif;
  color: #d4c8a8;
}

/* === 顶部 === */
.spire-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 36px;
  padding: 16px 20px;
  background: #140e09;
  border: 1px solid #2a1f14;
  border-radius: 6px;
  flex-wrap: wrap;
}

.spire-bonfire {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bonfire-flame {
  width: 12px;
  height: 18px;
  background: #d4793a;
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  box-shadow: 0 0 8px #d4793a, 0 0 20px rgba(212, 121, 58, 0.5);
  animation: flicker 0.6s ease-in-out infinite alternate;
}

@keyframes flicker {
  0% { box-shadow: 0 0 6px #d4793a, 0 0 14px rgba(212, 121, 58, 0.4); }
  100% { box-shadow: 0 0 10px #e8904a, 0 0 22px rgba(212, 121, 58, 0.6); }
}

.bonfire-label {
  font-size: 12px;
  color: #8a7a6a;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.relic-row {
  display: flex;
  gap: 8px;
}

.relic-slot {
  width: 44px;
  height: 44px;
  border: 1px solid #2a1f14;
  border-radius: 4px;
  background: #100a06;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.filter-title {
  font-size: 12px;
  color: #8a7a6a;
  letter-spacing: 2px;
}

.filter-chip {
  padding: 4px 14px;
  border: 1px solid #2a1f14;
  background: transparent;
  color: #6a5a4a;
  font-size: 12px;
  border-radius: 3px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.3s;
}

.filter-chip:hover { border-color: #4a3a2a; color: #9a8a7a; }
.filter-chip.on { border-color: #c8a45c; color: #c8a45c; background: rgba(200, 164, 92, 0.08); }

/* === 网格 === */
.spire-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 24px;
}

/* === 卡片 === */
.spire-card {
  position: relative;
  width: 240px;
  height: 340px;
  background: #1a1108;
  border: 2px solid #3a2a1a;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.23, 1, 0.32, 1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.spire-card::before {
  content: '';
  position: absolute;
  inset: 3px;
  border: 1px solid rgba(200, 164, 92, 0.15);
  border-radius: 6px;
  pointer-events: none;
  z-index: 2;
}

.spire-card:hover {
  transform: translateY(-10px) scale(1.03);
}

/* 稀有度边框 */
.spire-card.bronze { border-color: #5a4030; box-shadow: 0 4px 12px rgba(0,0,0,0.5), inset 0 0 20px rgba(139, 90, 43, 0.08); }
.spire-card.silver { border-color: #7a7a7a; box-shadow: 0 4px 14px rgba(0,0,0,0.5), inset 0 0 24px rgba(160, 160, 160, 0.08); }
.spire-card.gold   { border-color: #8a6d2b; box-shadow: 0 4px 16px rgba(0,0,0,0.5), inset 0 0 30px rgba(200, 160, 40, 0.1); }

.spire-card:hover.bronze { border-color: #8b5a2b; }
.spire-card:hover.silver { border-color: #a0a0a0; }
.spire-card:hover.gold   { border-color: #c8a040; }

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
  font-size: 12px;
  font-weight: bold;
  border: 2px solid;
}

.energy-orb.bronze { background: radial-gradient(circle at 40% 35%, #6b4226, #3a2010); border-color: #8b5a2b; color: #c8a080; }
.energy-orb.silver { background: radial-gradient(circle at 40% 35%, #8a8a8a, #3a3a3a); border-color: #a0a0a0; color: #e0e0e0; }
.energy-orb.gold   { background: radial-gradient(circle at 40% 35%, #c8a040, #6a4a10); border-color: #c8a45c; color: #ffe8a0;
  box-shadow: 0 0 10px rgba(200, 160, 40, 0.3); }

/* 卡图 */
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
  background:
    repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px);
  pointer-events: none;
}

.art-symbol {
  font-size: 28px;
  opacity: 0.35;
  text-transform: uppercase;
  letter-spacing: 4px;
  z-index: 1;
  color: #fff;
  font-weight: bold;
  text-shadow: 0 2px 8px rgba(0,0,0,0.5);
}

/* 类型横幅 */
.type-banner {
  height: 6px;
  margin: 0 10px;
  border-radius: 0 0 3px 3px;
  position: relative;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  letter-spacing: 2px;
  color: #1a1108;
  font-weight: bold;
  text-transform: uppercase;
}

.type-banner.role  { background: #8b3a3a; }
.type-banner.scene { background: #3a5a8b; }
.type-banner.style { background: #6a3a8b; }
.type-banner.light { background: #8b7a3a; }

.type-banner span {
  background: inherit;
  padding: 0 10px;
  position: relative;
  top: -1px;
}

/* 描述框 */
.desc-box {
  flex: 1;
  padding: 10px 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-top: 1px solid rgba(200, 164, 92, 0.1);
  background: linear-gradient(180deg, rgba(20, 10, 5, 0.6) 0%, rgba(15, 8, 3, 0.9) 100%);
}

.card-name {
  font-size: 14px;
  font-weight: bold;
  color: #e0d4b8;
  line-height: 1.3;
}

.card-text {
  font-size: 11px;
  color: #8a7a6a;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.rarity-line {
  font-size: 10px;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-top: auto;
}

.rarity-line.bronze { color: #8b5a2b; }
.rarity-line.silver { color: #a0a0a0; }
.rarity-line.gold   { color: #c8a040; }

/* === 弹窗 === */
.spire-modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(5, 3, 1, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
}

.spire-modal {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
}

.modal-frame {
  width: 300px;
  background: #1a1108;
  border: 2px solid #5a4030;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.7);
}

.modal-frame::before {
  content: '';
  position: absolute;
  inset: 3px;
  border: 1px solid rgba(200, 164, 92, 0.2);
  border-radius: 6px;
  pointer-events: none;
  z-index: 2;
}

.modal-energy {
  position: absolute;
  top: 10px;
  left: 10px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
  font-size: 14px;
  font-weight: bold;
  border: 2px solid;
}

.modal-energy.bronze { background: radial-gradient(circle at 40% 35%, #6b4226, #3a2010); border-color: #8b5a2b; color: #c8a080; }
.modal-energy.silver { background: radial-gradient(circle at 40% 35%, #8a8a8a, #3a3a3a); border-color: #a0a0a0; color: #e0e0e0; }
.modal-energy.gold   { background: radial-gradient(circle at 40% 35%, #c8a040, #6a4a10); border-color: #c8a45c; color: #ffe8a0;
  box-shadow: 0 0 10px rgba(200, 160, 40, 0.3); }

.modal-art {
  height: 120px;
}

.modal-banner {
  height: 6px;
  margin: 0 14px;
  border-radius: 0 0 3px 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  letter-spacing: 2px;
  color: #1a1108;
  font-weight: bold;
}

.modal-banner.role  { background: #8b3a3a; }
.modal-banner.scene { background: #3a5a8b; }
.modal-banner.style { background: #6a3a8b; }
.modal-banner.light { background: #8b7a3a; }

.modal-desc {
  padding: 14px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  border-top: 1px solid rgba(200, 164, 92, 0.1);
  background: linear-gradient(180deg, rgba(20, 10, 5, 0.6) 0%, rgba(15, 8, 3, 0.9) 100%);
}

.modal-name {
  font-size: 18px;
  font-weight: bold;
  color: #e0d4b8;
}

.modal-text {
  font-size: 13px;
  color: #8a7a6a;
  line-height: 1.7;
}

.modal-rarity-line {
  font-size: 11px;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-top: 4px;
}

.modal-rarity-line.bronze { color: #8b5a2b; }
.modal-rarity-line.silver { color: #a0a0a0; }
.modal-rarity-line.gold   { color: #c8a040; }

.modal-btns {
  display: flex;
  gap: 12px;
}

.spire-btn {
  padding: 10px 32px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.3s;
}

.spire-btn.primary {
  background: #5a3a1a;
  border: 1px solid #8b6a3a;
  color: #e0d4b8;
}

.spire-btn.primary:hover { background: #6a4a2a; border-color: #a0804a; }

.spire-btn.cancel {
  background: transparent;
  border: 1px solid #3a2a1a;
  color: #6a5a4a;
}

.spire-btn.cancel:hover { border-color: #5a4a3a; color: #9a8a7a; }
</style>
