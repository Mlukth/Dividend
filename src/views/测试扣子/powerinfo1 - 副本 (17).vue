<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// ============================================================================
// 📦 配置数据
// ============================================================================
const SECTIONS = Object.freeze([
  {
    id: 'discover',
    title: 'Discover the Source',
    subtitle: 'Chapter I',
    desc: 'Deep within the hidden valleys, a legendary spring awaits. Its waters hold the power to restore, renew, and transform. The journey begins with a single step — and the cursor will guide you.',
    accent: '#d4a843'
  },
  {
    id: 'journey',
    title: 'The Journey Begins',
    subtitle: 'Chapter II',
    desc: 'Through ancient forests and across golden plains, follow the winding path carved by centuries of seekers. Each step brings you closer to the fountain that has eluded mankind for millennia.',
    accent: '#c49a2c'
  },
  {
    id: 'wisdom',
    title: 'Ancient Wisdom',
    subtitle: 'Chapter III',
    desc: 'The guardians of the fountain have protected its secrets since time immemorial. They speak in riddles, test the worthy, and reveal truths only to those whose hearts are pure and whose intentions are noble.',
    accent: '#b8860b'
  },
  {
    id: 'eternal',
    title: 'Eternal Youth',
    subtitle: 'Chapter IV',
    desc: 'At the heart of the golden spring, time stands still. The waters reflect not your face, but your soul. Drink deeply, and carry its essence with you forever.',
    accent: '#daa520'
  },
])

// ============================================================================
// ♿ 用户偏好检测
// ============================================================================
const isReducedMotion = ref(false)
const isTouchDevice = ref(false)

const checkUserPreferences = () => {
  isReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  isTouchDevice.value = 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

// ============================================================================
// 🖱️ 光标系统 (RAF 平滑插值)
// ============================================================================
const cursor = ref({ x: 0, y: 0 })
const cursorTarget = ref({ x: 0, y: 0 })
const cursorActive = ref(false)
const cursorVisible = ref(true)
let rafId = null
const CURSOR_SMOOTH = 0.12

const updateCursorSmooth = () => {
  cursor.value.x += (cursorTarget.value.x - cursor.value.x) * CURSOR_SMOOTH
  cursor.value.y += (cursorTarget.value.y - cursor.value.y) * CURSOR_SMOOTH
  
  const diff = Math.hypot(
    cursorTarget.value.x - cursor.value.x,
    cursorTarget.value.y - cursor.value.y
  )
  
  if (diff > 0.5) {
    rafId = requestAnimationFrame(updateCursorSmooth)
  } else {
    rafId = null
  }
}

const handleMouseMove = (e) => {
  if (isReducedMotion.value || isTouchDevice.value) return
  cursorTarget.value = { x: e.clientX, y: e.clientY }
  if (!rafId) rafId = requestAnimationFrame(updateCursorSmooth)
}

const handleMouseEnter = () => { if (!isTouchDevice.value) cursorActive.value = true }
const handleMouseLeave = () => { cursorActive.value = false; cursorVisible.value = false }
const handleWindowMouseEnter = () => { if (!isTouchDevice.value) cursorVisible.value = true }
const handleWindowMouseLeave = () => { cursorVisible.value = false }

// ============================================================================
// 📜 滚动高亮
// ============================================================================
const activeSection = ref(SECTIONS[0].id)

const updateActiveSection = () => {
  const scrollY = window.scrollY + window.innerHeight * 0.35
  for (const section of SECTIONS) {
    const el = document.getElementById(section.id)
    if (el && el.offsetTop <= scrollY) activeSection.value = section.id
  }
}

// ============================================================================
// 🎨 计算属性 & 辅助函数
// ============================================================================
const currentAccent = computed(() => 
  SECTIONS.find(s => s.id === activeSection.value)?.accent || '#d4a843'
)

const getMonkeyStyle = () => ({
  transform: `translate3d(${cursor.value.x - 20}px, ${cursor.value.y - 20}px, 0)`,
  opacity: cursorActive.value && cursorVisible.value ? 0.6 : 0,
  transition: isReducedMotion.value ? 'none' : 'transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.3s'
})

// ============================================================================
// 🔄 生命周期
// ============================================================================
onMounted(() => {
  checkUserPreferences()
  
  if (!isTouchDevice.value && !isReducedMotion.value) {
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
  }
  window.addEventListener('scroll', updateActiveSection, { passive: true })
  window.addEventListener('mouseenter', handleWindowMouseEnter)
  window.addEventListener('mouseleave', handleWindowMouseLeave)
  
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  const handleMotionChange = (e) => { isReducedMotion.value = e.matches }
  mediaQuery.addEventListener?.('change', handleMotionChange)
  
  updateActiveSection()
})

onUnmounted(() => {
  if (rafId) cancelAnimationFrame(rafId)
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('scroll', updateActiveSection)
  window.removeEventListener('mouseenter', handleWindowMouseEnter)
  window.removeEventListener('mouseleave', handleWindowMouseLeave)
})
</script>

<template>
  <div 
    class="foy-site" 
    :class="{ 
      'reduced-motion': isReducedMotion,
      'touch-device': isTouchDevice,
      'cursor-hidden': !cursorVisible 
    }"
    @mouseenter="handleMouseEnter" 
    @mouseleave="handleMouseLeave"
  >
    <!-- 🖱️ 自定义光标 -->
    <div
      v-if="!isTouchDevice && !isReducedMotion"
      class="custom-cursor"
      :class="{ active: cursorActive && cursorVisible }"
      :style="{ 
        transform: `translate3d(${cursor.x}px, ${cursor.y}px, 0) translate(-50%, -50%)`,
        willChange: 'transform'
      }"
      aria-hidden="true"
    >
      <div class="cursor-inner" :style="{ background: currentAccent }"></div>
      <svg viewBox="0 0 40 40" class="cursor-ring">
        <circle cx="20" cy="20" r="18" fill="none" :stroke="currentAccent" stroke-width="1" opacity="0.6"/>
        <circle cx="20" cy="20" r="14" fill="none" :stroke="currentAccent" stroke-width="0.5" opacity="0.3" stroke-dasharray="4 2"/>
      </svg>
    </div>

    <!-- 🐒 猴子向导 -->
    <div
      v-if="!isTouchDevice && !isReducedMotion"
      class="monkey-guide"
      :style="getMonkeyStyle()"
      aria-hidden="true"
    >
      <svg viewBox="0 0 40 40" class="monkey-svg">
        <circle cx="20" cy="14" r="6" :fill="`${currentAccent}26`" :stroke="currentAccent" stroke-width="1"/>
        <circle cx="17" cy="13" r="1.5" :fill="currentAccent"/>
        <circle cx="23" cy="13" r="1.5" :fill="currentAccent"/>
        <ellipse cx="20" cy="22" rx="10" ry="14" fill="none" :stroke="currentAccent" stroke-width="1" opacity="0.6"/>
        <path d="M10 22 Q20 36 30 22" fill="none" :stroke="currentAccent" stroke-width="0.8" opacity="0.4"/>
      </svg>
    </div>

    <!-- 📰 头部导航 -->
    <header class="site-header" role="banner">
      <div class="header-inner">
        <a href="#" class="brand" aria-label="Fountain of Youth - Return to top">
          <span class="brand-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.5"/>
              <circle cx="12" cy="12" r="3" fill="currentColor"/>
            </svg>
          </span>
          <span class="brand-text">Fountain of Youth</span>
        </a>
        
        <nav class="nav" role="navigation" aria-label="Chapter navigation">
          <a 
            v-for="s in SECTIONS" 
            :key="s.id" 
            :href="`#${s.id}`" 
            class="nav-link"
            :class="{ active: activeSection === s.id }"
            @click.prevent="() => {
              document.getElementById(s.id)?.scrollIntoView({ 
                behavior: isReducedMotion ? 'auto' : 'smooth',
                block: 'start'
              })
            }"
          >
            {{ s.subtitle }}
            <span class="nav-indicator" aria-hidden="true"></span>
          </a>
        </nav>
      </div>
    </header>

    <!-- 📖 主内容 -->
    <main class="main" id="main-content" role="main">
      <section
        v-for="(section, i) in SECTIONS"
        :key="section.id"
        :id="section.id"
        class="story-section"
        :style="{ '--accent': section.accent }"
        :aria-labelledby="`${section.id}-title`"
      >
        <div class="section-bg" aria-hidden="true">
          <div class="bg-gradient" :style="{ background: `radial-gradient(ellipse at center, ${section.accent}08 0%, transparent 70%)` }"></div>
        </div>

        <div class="section-content">
          <div class="section-chapter">
            <span class="chapter-rule" aria-hidden="true"></span>
            {{ section.subtitle }}
          </div>
          
          <h2 :id="`${section.id}-title`" class="section-title">
            <TransitionGroup name="word" tag="span" :css="!isReducedMotion" appear>
              <span 
                v-for="(word, wi) in section.title.split(' ')" 
                :key="`${section.id}-word-${wi}`"
                class="title-word"
              >{{ word }}&nbsp;</span>
            </TransitionGroup>
          </h2>
          
          <div class="section-divider" aria-hidden="true"></div>
          <p class="section-desc">{{ section.desc }}</p>
        </div>

        <div class="section-visual" aria-hidden="true">
          <div class="visual-orb" :style="{ background: `radial-gradient(circle, ${section.accent}30 0%, ${section.accent}08 50%, transparent 70%)` }">
            <div 
              v-for="ring in 3" 
              :key="ring" 
              class="orb-ring" 
              :style="{ 
                animationDelay: isReducedMotion ? '0s' : `${ring * 0.5}s`,
                borderColor: `${section.accent}${20 + ring * 10}` 
              }"
            ></div>
            <div class="orb-core" :style="{ background: section.accent }"></div>
          </div>
        </div>

        <div v-if="i < SECTIONS.length - 1" class="scroll-hint" :class="{ 'animate': !isReducedMotion }">
          <span class="scroll-line" aria-hidden="true"></span>
          <span class="scroll-text">Scroll to continue</span>
        </div>
      </section>

      <!-- CTA -->
      <section class="cta-section" aria-labelledby="cta-title">
        <div class="cta-content">
          <h2 id="cta-title" class="cta-title">Begin Your Quest</h2>
          <p class="cta-desc">The fountain awaits those who dare to seek. Join the journey and discover the golden secret that has inspired legends for centuries.</p>
          <a href="#" class="cta-btn" @click.prevent>
            <span>Start the Journey</span>
            <span class="cta-arrow" aria-hidden="true">&rarr;</span>
          </a>
        </div>
        <div class="cta-bg" aria-hidden="true"></div>
      </section>
    </main>

    <!-- 🦶 页脚 -->
    <footer class="site-footer" role="contentinfo">
      <div class="footer-content">
        <span>Fountain of Youth &copy; 2024</span>
        <span class="footer-dot" aria-hidden="true">·</span>
        <span>The Golden Spring</span>
        <span class="footer-dot" aria-hidden="true">·</span>
        <span>Est. MMXXIV</span>
      </div>
    </footer>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap');

*, *::after, *::before { box-sizing: border-box; margin: 0; padding: 0; }

.foy-site {
  --gold-1: #d4a843; --gold-2: #c49a2c; --gold-3: #b8860b; --gold-4: #daa520;
  --dark: #1a1410; --darker: #0f0c08; --text: #e8dcc8; --text-dim: #9b8e7a;
  
  background: var(--dark); color: var(--text);
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;
  cursor: none; overflow-x: hidden;
}

.foy-site.touch-device, .foy-site.reduced-motion { cursor: auto; }
.foy-site.cursor-hidden .custom-cursor { opacity: 0 !important; }

/* ♿ 焦点可见 & 减少动画 */
:deep(a:focus-visible), :deep(button:focus-visible) {
  outline: 2px solid var(--gold-1); outline-offset: 4px; border-radius: 2px;
}
.foy-site.reduced-motion *, .foy-site.reduced-motion *::before, .foy-site.reduced-motion *::after {
  animation-duration: 0.01ms !important; animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important; scroll-behavior: auto !important;
}

/* 🖱️ 光标 */
.custom-cursor {
  position: fixed; z-index: 9999; pointer-events: none; width: 40px; height: 40px;
  will-change: transform; opacity: 0; transition: opacity 0.2s ease; mix-blend-mode: difference;
}
.custom-cursor.active { opacity: 1; }
.cursor-inner {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  width: 6px; height: 6px; border-radius: 50%;
}
.cursor-ring { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }

/* 🐒 猴子 */
.monkey-guide {
  position: fixed; z-index: 9998; pointer-events: none; width: 40px; height: 40px;
  will-change: transform, opacity;
}
.monkey-svg { width: 100%; height: 100%; }

/* 📰 头部 */
.site-header {
  position: fixed; top: 0; left: 0; width: 100%; z-index: 100; padding: 1.5rem 3rem;
  background: linear-gradient(to bottom, var(--darker) 0%, transparent 100%);
  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
}
.header-inner {
  max-width: 1400px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between;
}
.brand { display: flex; align-items: center; gap: 0.75rem; text-decoration: none; color: var(--gold-1); transition: opacity 0.2s; }
.brand:hover { opacity: 0.9; }
.brand-icon { display: block; }
.brand-text { font-family: 'Cormorant Garamond', serif; font-size: 1.1rem; letter-spacing: 0.06em; color: var(--gold-1); }
.nav { display: flex; gap: 2rem; }
.nav-link {
  position: relative; font-family: 'Inter', sans-serif; font-size: 0.65rem; text-transform: uppercase;
  letter-spacing: 0.15em; color: var(--text-dim); text-decoration: none; padding: 0.5rem 0; transition: color 0.2s;
}
.nav-link:hover, .nav-link.active { color: var(--gold-1); }
.nav-indicator {
  position: absolute; bottom: 0; left: 0; width: 0; height: 1px; background: var(--gold-1); transition: width 0.3s ease;
}
.nav-link:hover .nav-indicator, .nav-link.active .nav-indicator { width: 100%; }

/* 📖 章节 */
.story-section {
  min-height: 100vh; position: relative; display: flex; align-items: center; justify-content: center;
  padding: 6rem 3rem; scroll-margin-top: 100px;
}
.section-bg { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.bg-gradient { position: absolute; inset: 0; }
.section-content { max-width: 800px; position: relative; z-index: 2; }
.section-chapter {
  display: flex; align-items: center; gap: 0.75rem; margin-bottom: 2rem;
  font-family: 'Inter', sans-serif; font-size: 0.6rem; text-transform: uppercase;
  letter-spacing: 0.2em; color: var(--accent, var(--gold-1));
}
.chapter-rule { display: inline-block; width: 40px; height: 1px; background: var(--accent, var(--gold-1)); }
.section-title {
  font-family: 'Cormorant Garamond', serif; font-size: clamp(3rem, 7vw, 6rem); font-weight: 300; line-height: 1.1;
  margin-bottom: 2rem; display: flex; flex-wrap: wrap; gap: 0.2em;
}
.word-enter-active, .word-leave-active { transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.6s; }
.word-enter-from, .word-leave-to { opacity: 0; transform: translateY(30px); }
.section-divider { width: 60px; height: 1px; background: linear-gradient(to right, var(--accent, var(--gold-1)), transparent); margin-bottom: 2rem; }
.section-desc { font-size: 1.05rem; line-height: 1.8; color: var(--text-dim); max-width: 560px; font-weight: 300; }

/* ✨ 视觉光球 */
.section-visual {
  position: absolute; right: -10%; top: 50%; transform: translateY(-50%);
  width: 50vw; height: 50vw; max-width: 600px; max-height: 600px; pointer-events: none; z-index: 1;
}
.visual-orb { position: relative; width: 100%; height: 100%; }
.orb-ring {
  position: absolute; inset: 0; border-radius: 50%; border: 1px solid var(--gold-1);
  animation: orbPulse 4s ease-in-out infinite;
}
@keyframes orbPulse {
  0%, 100% { transform: scale(0.8); opacity: 0.2; }
  50% { transform: scale(1.2); opacity: 0.5; }
}
.orb-core {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  width: 8px; height: 8px; border-radius: 50%; box-shadow: 0 0 40px var(--accent, var(--gold-1));
}

/* 📜 滚动提示 */
.scroll-hint {
  position: absolute; bottom: 3rem; left: 50%; transform: translateX(-50%);
  display: flex; flex-direction: column; align-items: center; gap: 1rem; z-index: 2;
}
.scroll-hint.animate .scroll-line { animation: scrollLine 2s ease-in-out infinite; }
.scroll-line { width: 1px; height: 40px; background: linear-gradient(to bottom, var(--gold-1), transparent); }
@keyframes scrollLine {
  0%, 100% { opacity: 0.3; height: 40px; } 50% { opacity: 1; height: 60px; }
}
.scroll-text { font-size: 0.55rem; text-transform: uppercase; letter-spacing: 0.2em; color: var(--text-dim); }

/* 🎯 CTA */
.cta-section {
  min-height: 80vh; position: relative; display: flex; align-items: center; justify-content: center;
  text-align: center; padding: 4rem 2rem;
}
.cta-content { max-width: 700px; position: relative; z-index: 2; }
.cta-title {
  font-family: 'Cormorant Garamond', serif; font-size: clamp(3rem, 6vw, 5rem); font-weight: 300;
  color: var(--gold-1); margin-bottom: 1.5rem;
}
.cta-desc { font-size: 1rem; line-height: 1.7; color: var(--text-dim); margin-bottom: 3rem; font-weight: 300; }
.cta-btn {
  display: inline-flex; align-items: center; gap: 1rem; padding: 1rem 2.5rem;
  border: 1px solid var(--gold-1); border-radius: 50px;
  font-family: 'Cormorant Garamond', serif; font-size: 1.1rem; color: var(--gold-1);
  text-decoration: none; letter-spacing: 0.06em; transition: all 0.3s ease; position: relative; overflow: hidden;
}
.cta-btn::before {
  content: ''; position: absolute; inset: 0; background: rgba(212,168,67,0.1); opacity: 0; transition: opacity 0.3s;
}
.cta-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(212,168,67,0.2); }
.cta-btn:hover::before { opacity: 1; }
.cta-arrow { transition: transform 0.3s; display: inline-block; }
.cta-btn:hover .cta-arrow { transform: translateX(4px); }
.cta-bg {
  position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(ellipse at center, rgba(212,168,67,0.08) 0%, transparent 70%);
}

/* 🦶 页脚 */
.site-footer { padding: 3rem; text-align: center; border-top: 1px solid rgba(212,168,67,0.1); }
.footer-content { font-size: 0.7rem; color: var(--text-dim); display: flex; justify-content: center; gap: 0.75rem; letter-spacing: 0.06em; flex-wrap: wrap; }
.footer-dot { opacity: 0.5; }

/* 📱 响应式 */
@media (max-width: 1024px) {
  .section-visual { display: none; }
  .story-section { padding: 5rem 2rem; }
}
@media (max-width: 768px) {
  .site-header { padding: 1rem 1.5rem; }
  .nav { display: none; }
  .section-title { font-size: 2.5rem; }
  .section-desc { font-size: 1rem; }
  .cta-title { font-size: 2.5rem; }
}
@media (max-width: 480px) {
  .story-section { padding: 4rem 1.5rem; }
  .section-title { font-size: 2rem; }
  .brand-text { font-size: 1rem; }
}

/* 🖨️ 打印优化 (已移至正确位置) */
@media print {
  .custom-cursor, .monkey-guide, .scroll-hint, .site-header, .section-visual, .cta-bg { display: none !important; }
  .foy-site { background: white !important; color: black !important; cursor: auto !important; }
  .story-section { min-height: auto !important; page-break-inside: avoid; padding: 2rem !important; }
  .section-title, .cta-title { color: black !important; font-size: 1.5rem !important; }
  .section-desc, .cta-desc { color: #333 !important; font-size: 0.9rem !important; }
  a { text-decoration: none !important; color: inherit !important; }
}
</style>