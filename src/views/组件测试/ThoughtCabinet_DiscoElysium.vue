<script setup>
import { ref, computed } from 'vue'

// ==================== 极乐迪斯科 24 技能 ====================
const ATTRIBUTES = [
  {
    id: 'intellect', name: '智力', color: '#4a8bc2', glow: '#5ba0db',
    desc: 'INTELLECT — 原始智力储备。你的逻辑能力、模式识别能力，以及从零碎信息中构建完整图景的天赋。',
    skills: [
      { id: 'logic', name: '逻辑思维', en: 'Logic', desc: '分析事实与证据，建立因果链。不放过任何矛盾。', level: 4 },
      { id: 'encyclopedia', name: '百科全书', en: 'Encyclopedia', desc: '你内在的知识库。从历史到流行文化，储藏着看似无用却能突然发光的信息碎片。', level: 3 },
      { id: 'rhetoric', name: '辞藻华丽', en: 'Rhetoric', desc: '语言的艺术。辨别谎言、察觉操纵，或自己成为那个操纵者。', level: 2 },
      { id: 'drama', name: '故弄玄虚', en: 'Drama', desc: '你的戏剧感。撒谎、演戏、察言观色。生活即舞台，人人皆演员。', level: 3 },
      { id: 'conceptualization', name: '标新立异', en: 'Conceptualization', desc: '抽象思维能力。理解艺术、哲学、隐喻。在看似无关的事物间建立联系。', level: 1 },
      { id: 'visual-calculus', name: '能工巧匠', en: 'Visual Calculus', desc: '空间推理。在脑中重构犯罪现场，推演弹道轨迹，还原事件发生时的物理真实。', level: 2 }
    ]
  },
  {
    id: 'psyche', name: '精神', color: '#9b6bcf', glow: '#b38bdf',
    desc: 'PSYCHE — 你的灵魂敏感度。影响你的共情能力、直觉，以及你如何与他人和世界建立情感连接。',
    skills: [
      { id: 'volition', name: '坚忍不拔', en: 'Volition', desc: '意志力之堡垒。在深渊中撑住你的那根支柱。拒绝放弃。', level: 5 },
      { id: 'inland-empire', name: '内陆帝国', en: 'Inland Empire', desc: '你的灵魂深处。与万事万物对话——包括你的领带、城市的墙壁，以及那些早已不存在的事物。', level: 4 },
      { id: 'empathy', name: '通情达理', en: 'Empathy', desc: '感知他人的情绪。你知道他们什么时候在撒谎，什么时候在崩溃。', level: 3 },
      { id: 'authority', name: '争强好胜', en: 'Authority', desc: '你的支配力。让别人服从你、畏惧你、或尊敬你——取决于你如何运用它。', level: 2 },
      { id: 'esprit-de-corps', name: '同舟共济', en: 'Esprit de Corps', desc: '你与警队的精神联结。听见远处传来的警笛声，感知同事们在做什么。', level: 3 },
      { id: 'suggestion', name: '能言善辩', en: 'Suggestion', desc: '温和的说服力。不是命令，而是暗示。让对方的想法在你种下的种子中自己生长。', level: 2 }
    ]
  },
  {
    id: 'physique', name: '体格', color: '#c25b4a', glow: '#d9705b',
    desc: 'PHYSIQUE — 你的肉体。你的肌肉、你的痛觉阈值、你那与生俱来的电化学冲动。',
    skills: [
      { id: 'endurance', name: '钢筋铁骨', en: 'Endurance', desc: '你的身体耐受力。受得了拳头、子弹、酒精，还有这个烂透了的世界。', level: 6 },
      { id: 'pain-threshold', name: '坚如磐石', en: 'Pain Threshold', desc: '你感受痛苦的能力——或者说，不被它击败的能力。每一道伤疤都是勋章。', level: 4 },
      { id: 'physical-instrument', name: '钢筋铁骨', en: 'Physical Instrument', desc: '纯粹的肉体力量。击碎大门，捏碎骨头，在这个物理世界留下你的印记。', level: 3 },
      { id: 'electrochemistry', name: '电化学', en: 'Electrochemistry', desc: '你的神经递质在说话。酒精、尼古丁、安非他命——所有能让你好受一点的东西。它知道的。', level: 2 },
      { id: 'shivers', name: '天人感应', en: 'Shivers', desc: '你与这座城市本身的连接。风吹过街道时耳语它的秘密。你感觉到瑞瓦肖的脉搏。', level: 3 },
      { id: 'half-light', name: '草木皆兵', en: 'Half Light', desc: '你的恐惧本能。颈后的汗毛竖立——有人在跟踪你。逃跑，或者反击。', level: 2 }
    ]
  },
  {
    id: 'motorics', name: '协调', color: '#c9a452', glow: '#ddba65',
    desc: 'MOTORICS — 你的感官敏锐度和身体操控力。从扣动扳机到发现最细微的线索，全在这双手和这双眼里。',
    skills: [
      { id: 'hand-eye', name: '眼明手巧', en: 'Hand/Eye Coordination', desc: '指尖的控制力。扣下扳机、投掷物体、完成精密的物理操作。', level: 3 },
      { id: 'perception', name: '火眼金睛', en: 'Perception', desc: '你的五感敏锐度。看见别人忽略的细节，听见最轻的脚步声，闻到谎言的气味。', level: 4 },
      { id: 'reaction-speed', name: '争分夺秒', en: 'Reaction Speed', desc: '你的神经反应速度。在别人还没想好做什么的时候，你已经做完了。', level: 2 },
      { id: 'savoir-faire', name: '从容自若', en: 'Savoir Faire', desc: '优雅与敏捷。在屋顶奔跑，从危险中滑开，让你的身体以最华丽的方式完成不可能的动作。', level: 3 },
      { id: 'interfacing', name: '能工巧匠', en: 'Interfacing', desc: '你与机器的对话。撬锁、接线、修理——让那些由齿轮和电路组成的造物服从你的意志。', level: 2 },
      { id: 'composure', name: '不动如山', en: 'Composure', desc: '你的镇定面具。无论内心如何翻涌，你的脸始终如一汪静水。扑克脸中的扑克脸。', level: 4 }
    ]
  }
]

// ==================== 状态 ====================
const activeAttribute = ref(null)
const selectedSkill = ref(null)
const hoveredSkill = ref(null)

const filteredAttributes = computed(() => {
  if (!activeAttribute.value) return ATTRIBUTES
  return ATTRIBUTES.filter(a => a.id === activeAttribute.value)
})

function attrById(id) {
  return ATTRIBUTES.find(a => a.id === id) || ATTRIBUTES[0]
}

// level → 格式化文字
function levelLabel(lv) {
  if (lv >= 6) return '登峰造极'
  if (lv >= 5) return '出类拔萃'
  if (lv >= 4) return '驾轻就熟'
  if (lv >= 3) return '略有小成'
  if (lv >= 2) return '初窥门径'
  return '一知半解'
}

function levelDots(lv) {
  return Array.from({ length: 8 }, (_, i) => i < lv)
}

// 总技能点
const totalPoints = computed(() =>
  ATTRIBUTES.reduce((s, a) => s + a.skills.reduce((ss, sk) => ss + sk.level, 0), 0)
)
</script>

<template>
  <div class="de-root">
    <!-- 背景纹理 -->
    <div class="de-noise"></div>
    <div class="de-vignette"></div>

    <!-- 顶栏 -->
    <header class="de-header">
      <div class="de-header-left">
        <h1 class="de-title">思 维 阁</h1>
        <span class="de-subtitle">THOUGHT CABINET · 瑞瓦肖警局精神评估</span>
      </div>
      <div class="de-header-right">
        <div class="de-stat">
          <span class="de-stat-val">{{ totalPoints }}</span>
          <span class="de-stat-label">技能点总数</span>
        </div>
        <div class="de-divider"></div>
        <div class="de-stat">
          <span class="de-stat-val">{{ ATTRIBUTES.length }}</span>
          <span class="de-stat-label">属性分类</span>
        </div>
      </div>
    </header>

    <!-- 属性筛选 -->
    <nav class="de-nav">
      <button
        :class="['de-nav-btn', { active: !activeAttribute }]"
        @click="activeAttribute = null"
      >
        全部
      </button>
      <button
        v-for="attr in ATTRIBUTES"
        :key="attr.id"
        :class="['de-nav-btn', { active: activeAttribute === attr.id }]"
        :style="activeAttribute === attr.id ? {
          background: attr.color + '22',
          borderColor: attr.color,
          color: attr.glow,
          boxShadow: `0 0 20px ${attr.color}33`
        } : {}"
        @click="activeAttribute = activeAttribute === attr.id ? null : attr.id"
      >
        <span class="de-nav-dot" :style="{ background: attr.glow }"></span>
        {{ attr.name }}
      </button>
    </nav>

    <!-- 主内容区 -->
    <div class="de-content">
      <div
        v-for="attr in filteredAttributes"
        :key="attr.id"
        class="de-attr-section"
      >
        <!-- 属性头部 -->
        <div class="de-attr-header">
          <div class="de-attr-line" :style="{ background: `linear-gradient(90deg, ${attr.color}, transparent)` }"></div>
          <div class="de-attr-info">
            <h2 class="de-attr-name" :style="{ color: attr.glow }">
              {{ attr.name }}
              <span class="de-attr-en">{{ attr.id.toUpperCase() }}</span>
            </h2>
            <p class="de-attr-desc">{{ attr.desc }}</p>
          </div>
          <div class="de-attr-line" :style="{ background: `linear-gradient(90deg, transparent, ${attr.color})` }"></div>
        </div>

        <!-- 技能网格：6列 -->
        <div class="de-skills-grid">
          <div
            v-for="skill in attr.skills"
            :key="skill.id"
            :class="['de-skill-card', {
              active: selectedSkill?.id === skill.id,
              hovered: hoveredSkill?.id === skill.id
            }]"
            :style="{
              '--attr-color': attr.color,
              '--attr-glow': attr.glow
            }"
            @click="selectedSkill = selectedSkill?.id === skill.id ? null : skill"
            @mouseenter="hoveredSkill = skill"
            @mouseleave="hoveredSkill = null"
          >
            <!-- 技能图标占位（原版有肖像画） -->
            <div class="de-skill-portrait" :style="{ borderColor: attr.color }">
              <div class="de-portrait-inner" :style="{ background: `radial-gradient(circle at 30% 30%, ${attr.glow}44, ${attr.color}88, #1a1a2e)` }">
                <span class="de-portrait-icon">{{ skill.en.charAt(0) }}</span>
              </div>
            </div>

            <!-- 技能信息 -->
            <div class="de-skill-info">
              <div class="de-skill-name-group">
                <span class="de-skill-name-cn">{{ skill.name }}</span>
                <span class="de-skill-name-en">{{ skill.en }}</span>
              </div>

              <!-- 等级点 -->
              <div class="de-skill-level">
                <span
                  v-for="(filled, di) in levelDots(skill.level)"
                  :key="di"
                  class="de-level-dot"
                  :class="{ filled: filled }"
                  :style="filled ? {
                    background: attr.glow,
                    boxShadow: `0 0 8px ${attr.glow}99`
                  } : {
                    borderColor: attr.color + '55'
                  }"
                ></span>
              </div>

              <!-- 等级文字 -->
              <span class="de-level-label" :style="{ color: attr.glow }">
                LV.{{ skill.level }} · {{ levelLabel(skill.level) }}
              </span>
            </div>

            <!-- 展开描述 -->
            <transition name="de-desc">
              <div v-if="selectedSkill?.id === skill.id" class="de-skill-desc">
                <p>{{ skill.desc }}</p>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部 -->
    <footer class="de-footer">
      <span>极乐迪斯科 · 思维阁 / DISCO ELYSIUM · THOUGHT CABINET</span>
      <span class="de-footer-sep">|</span>
      <span>点击卡片查看技能详情</span>
    </footer>
  </div>
</template>

<style scoped>
/* ==================== 根：暗黑基调 ==================== */
.de-root {
  min-height: 100vh;
  background: #0d0d1a;
  color: #d4c8b8;
  font-family: 'Georgia', 'Times New Roman', 'Microsoft YaHei', serif;
  position: relative;
  overflow-x: hidden;
}

/* 噪点纹理 */
.de-noise {
  position: fixed; inset: 0; pointer-events: none; z-index: 1; opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
}

/* 边缘暗角 */
.de-vignette {
  position: fixed; inset: 0; pointer-events: none; z-index: 1;
  background: radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%);
}

/* ==================== 顶栏 ==================== */
.de-header {
  position: relative; z-index: 2;
  display: flex; align-items: center; justify-content: space-between;
  padding: 24px 40px 16px;
  border-bottom: 1px solid #ffffff10;
}
.de-header-left { display: flex; align-items: baseline; gap: 16px; }
.de-title {
  font-size: 28px; font-weight: 400; letter-spacing: 12px;
  color: #e8d5b0; margin: 0;
  text-shadow: 0 0 40px rgba(200, 170, 100, 0.3);
}
.de-subtitle {
  font-size: 11px; letter-spacing: 3px; color: #6b5e4e;
  text-transform: uppercase;
}
.de-header-right { display: flex; align-items: center; gap: 20px; }
.de-stat { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.de-stat-val { font-size: 24px; font-weight: 700; color: #e8d5b0; }
.de-stat-label { font-size: 10px; color: #6b5e4e; letter-spacing: 2px; text-transform: uppercase; }
.de-divider { width: 1px; height: 36px; background: #ffffff15; }

/* ==================== 导航 ==================== */
.de-nav {
  position: relative; z-index: 2;
  display: flex; gap: 8px; padding: 12px 40px; flex-wrap: wrap;
  border-bottom: 1px solid #ffffff08;
}
.de-nav-btn {
  padding: 6px 16px; border-radius: 2px;
  border: 1px solid #ffffff15; background: transparent;
  color: #8a7d6b; cursor: pointer; font-size: 12px; letter-spacing: 2px;
  font-family: inherit; transition: all 0.2s;
  text-transform: uppercase;
}
.de-nav-btn:hover { border-color: #ffffff30; color: #c4b89a; }
.de-nav-btn.active { font-weight: 600; }
.de-nav-dot { width: 6px; height: 6px; border-radius: 50%; display: inline-block; margin-right: 6px; }

/* ==================== 内容区 ==================== */
.de-content {
  position: relative; z-index: 2; padding: 32px 40px 40px;
  display: flex; flex-direction: column; gap: 40px;
}

/* ==================== 属性段 ==================== */
.de-attr-header {
  display: flex; align-items: center; gap: 20px; margin-bottom: 20px;
}
.de-attr-line { flex: 1; height: 1px; }
.de-attr-info { text-align: center; }
.de-attr-name {
  font-size: 18px; font-weight: 400; letter-spacing: 6px; margin: 0 0 6px 0;
}
.de-attr-en {
  font-size: 10px; letter-spacing: 3px; opacity: 0.4; margin-left: 10px;
  font-family: monospace;
}
.de-attr-desc {
  font-size: 12px; color: #6b5e4e; margin: 0; max-width: 560px;
  line-height: 1.6; font-style: italic;
}

/* ==================== 技能网格 ==================== */
.de-skills-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
}

/* ==================== 技能卡片 ==================== */
.de-skill-card {
  background: #12121f;
  border: 1px solid #ffffff08;
  border-radius: 2px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
}
.de-skill-card::before {
  content: '';
  position: absolute; inset: 0;
  background: radial-gradient(circle at 50% 0%, var(--attr-color)11, transparent 70%);
  opacity: 0; transition: opacity 0.3s;
}
.de-skill-card:hover,
.de-skill-card.active {
  border-color: var(--attr-color)55;
  background: #181828;
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0,0,0,0.5), 0 0 0 1px var(--attr-color)22;
}
.de-skill-card:hover::before,
.de-skill-card.active::before { opacity: 1; }
.de-skill-card.active {
  border-color: var(--attr-glow)88;
  box-shadow: 0 0 30px var(--attr-color)33, 0 8px 30px rgba(0,0,0,0.5);
}

/* 肖像框 */
.de-skill-portrait {
  width: 56px; height: 56px; margin: 0 auto 12px;
  border: 2px solid; border-radius: 2px;
  overflow: hidden;
}
.de-portrait-inner {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
}
.de-portrait-icon {
  font-size: 24px; color: #e8d5b0; font-weight: 700;
  font-family: 'Georgia', serif;
  text-shadow: 0 0 10px rgba(200,170,100,0.5);
}

/* 技能信息 */
.de-skill-info { text-align: center; }
.de-skill-name-group { margin-bottom: 8px; }
.de-skill-name-cn {
  display: block; font-size: 13px; font-weight: 700; color: #d4c8b8;
  letter-spacing: 1px;
}
.de-skill-name-en {
  display: block; font-size: 9px; color: #5a4e3e; letter-spacing: 1px;
  font-family: monospace; margin-top: 2px;
}

/* 等级点 */
.de-skill-level {
  display: flex; justify-content: center; gap: 5px; margin-bottom: 6px;
}
.de-level-dot {
  width: 8px; height: 8px; border-radius: 50%;
  border: 1px solid; transition: all 0.3s;
}

.de-level-label { font-size: 10px; letter-spacing: 1px; }

/* 展开描述 */
.de-skill-desc { margin-top: 12px; padding-top: 12px; border-top: 1px solid #ffffff08; }
.de-skill-desc p {
  font-size: 11px; color: #8a7d6b; line-height: 1.7; margin: 0;
  font-style: italic;
}

.de-desc-enter-active { transition: all 0.3s ease; }
.de-desc-leave-active { transition: all 0.2s ease; }
.de-desc-enter-from, .de-desc-leave-to {
  opacity: 0; max-height: 0; margin-top: 0; padding-top: 0;
}
.de-desc-enter-to, .de-desc-leave-from {
  opacity: 1; max-height: 120px;
}

/* ==================== 底部 ==================== */
.de-footer {
  position: relative; z-index: 2;
  text-align: center; padding: 20px 40px;
  border-top: 1px solid #ffffff08;
  font-size: 10px; color: #3a3028; letter-spacing: 2px;
}
.de-footer-sep { margin: 0 10px; color: #ffffff10; }

/* ==================== 响应式 ==================== */
@media (max-width: 1200px) {
  .de-skills-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 640px) {
  .de-skills-grid { grid-template-columns: repeat(2, 1fr); }
  .de-header { padding: 16px 20px; }
  .de-content { padding: 20px; }
  .de-nav { padding: 10px 20px; }
}
</style>
