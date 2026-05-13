<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const cursorX = ref(0)
const cursorY = ref(0)
const cursorActive = ref(false)

const sections = [
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
]

function onMouseMove(e) {
  cursorX.value = e.clientX
  cursorY.value = e.clientY
}

function onMouseEnter() { cursorActive.value = true }
function onMouseLeave() { cursorActive.value = false }

onMounted(() => {
  window.addEventListener('mousemove', onMouseMove)
})
onUnmounted(() => {
  window.removeEventListener('mousemove', onMouseMove)
})
</script>

<template>
  <div class="foy-site" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
    <!-- Custom Cursor -->
    <div
      class="custom-cursor"
      :class="{ active: cursorActive }"
      :style="{ left: cursorX + 'px', top: cursorY + 'px' }"
    >
      <div class="cursor-inner"></div>
      <svg viewBox="0 0 40 40" class="cursor-ring">
        <circle cx="20" cy="20" r="18" fill="none" stroke="#d4a843" stroke-width="1" opacity="0.6"/>
        <circle cx="20" cy="20" r="14" fill="none" stroke="#d4a843" stroke-width="0.5" opacity="0.3" stroke-dasharray="4 2"/>
      </svg>
    </div>

    <!-- Monkey Guide -->
    <div
      class="monkey-guide"
      :style="{ left: cursorX - 20 + 'px', top: cursorY - 20 + 'px' }"
    >
      <svg viewBox="0 0 40 40" class="monkey-svg">
        <circle cx="20" cy="14" r="6" fill="rgba(212,168,67,0.15)" stroke="#d4a843" stroke-width="1"/>
        <circle cx="17" cy="13" r="1.5" fill="#d4a843"/>
        <circle cx="23" cy="13" r="1.5" fill="#d4a843"/>
        <ellipse cx="20" cy="22" rx="10" ry="14" fill="none" stroke="#d4a843" stroke-width="1" opacity="0.6"/>
        <path d="M10 22 Q20 36 30 22" fill="none" stroke="#d4a843" stroke-width="0.8" opacity="0.4"/>
      </svg>
    </div>

    <!-- Header -->
    <header class="site-header">
      <div class="header-inner">
        <a href="#" class="brand">
          <span class="brand-icon">
            <svg viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>
          </span>
          <span class="brand-text">Fountain of Youth</span>
        </a>
        <nav class="nav">
          <a v-for="s in sections" :key="s.id" :href="`#${s.id}`" class="nav-link">{{ s.subtitle }}</a>
        </nav>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main">
      <section
        v-for="(section, i) in sections"
        :key="section.id"
        :id="section.id"
        class="story-section"
        :style="{ '--accent': section.accent }"
      >
        <div class="section-bg">
          <div class="bg-gradient" :style="{ background: `radial-gradient(ellipse at center, ${section.accent}05 0%, transparent 70%)` }"></div>
        </div>

        <div class="section-content">
          <div class="section-chapter">
            <span class="chapter-rule"></span>
            {{ section.subtitle }}
          </div>
          <h2 class="section-title">
            <span v-for="(word, wi) in section.title.split(' ')" :key="wi" class="title-word" :style="{ animationDelay: `${0.1 + wi * 0.08}s` }">{{ word }}</span>
          </h2>
          <div class="section-divider"></div>
          <p class="section-desc">{{ section.desc }}</p>
        </div>

        <!-- Section visual -->
        <div class="section-visual">
          <div class="visual-orb" :style="{ background: `radial-gradient(circle, ${section.accent}30 0%, ${section.accent}05 50%, transparent 70%)` }">
            <div class="orb-ring" v-for="ring in 3" :key="ring" :style="{ animationDelay: `${ring * 0.5}s`, borderColor: `${section.accent}${20 + ring * 10}` }"></div>
            <div class="orb-core" :style="{ background: `${section.accent}` }"></div>
          </div>
        </div>

        <!-- Scroll indicator -->
        <div v-if="i < sections.length - 1" class="scroll-hint">
          <span class="scroll-line"></span>
          <span class="scroll-text">Scroll to continue</span>
        </div>
      </section>

      <!-- CTA -->
      <section class="cta-section">
        <div class="cta-content">
          <h2 class="cta-title">Begin Your Quest</h2>
          <p class="cta-desc">The fountain awaits those who dare to seek. Join the journey and discover the golden secret that has inspired legends for centuries.</p>
          <a href="#" class="cta-btn">
            <span>Start the Journey</span>
            <span class="cta-arrow">&rarr;</span>
          </a>
        </div>
        <div class="cta-bg"></div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="site-footer">
      <div class="footer-content">
        <span>Fountain of Youth &copy; 2024</span>
        <span class="footer-dot">·</span>
        <span>The Golden Spring</span>
        <span class="footer-dot">·</span>
        <span>Est. MMXXIV</span>
      </div>
    </footer>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap');

*, *::after, *::before { box-sizing: border-box; margin: 0; padding: 0; }

.foy-site {
  --gold-1: #d4a843;
  --gold-2: #c49a2c;
  --gold-3: #b8860b;
  --gold-4: #daa520;
  --dark: #1a1410;
  --darker: #0f0c08;
  --text: #e8dcc8;
  --text-dim: #9b8e7a;

  background: var(--dark); color: var(--text);
  font-family: 'Inter', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  cursor: none; overflow-x: hidden;
}

/* Custom Cursor */
.custom-cursor {
  position: fixed; z-index: 9999; pointer-events: none;
  width: 40px; height: 40px; transform: translate(-50%, -50%);
  opacity: 0; transition: opacity 0.3s;
  mix-blend-mode: difference;
}
.custom-cursor.active { opacity: 1; }
.cursor-inner {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  width: 6px; height: 6px; background: var(--gold-1); border-radius: 50%;
}
.cursor-ring { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }

/* Monkey Guide */
.monkey-guide {
  position: fixed; z-index: 9998; pointer-events: none;
  width: 40px; height: 40px; transform: translate(-50%, -50%);
  transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  opacity: 0.5;
}
.monkey-svg { width: 100%; height: 100%; }

/* Header */
.site-header {
  position: fixed; top: 0; left: 0; width: 100%; z-index: 100;
  padding: 1.5rem 3rem;
  background: linear-gradient(to bottom, var(--darker) 0%, transparent 100%);
}
.header-inner {
  max-width: 1400px; margin: 0 auto;
  display: flex; align-items: center; justify-content: space-between;
}
.brand { display: flex; align-items: center; gap: 0.75rem; text-decoration: none; color: var(--gold-1); }
.brand-icon { display: block; }
.brand-text { font-family: 'Cormorant Garamond', serif; font-size: 1.1rem; letter-spacing: 0.06em; color: var(--gold-1); }
.nav { display: flex; gap: 2.5rem; }
.nav-link {
  font-family: 'Inter', sans-serif; font-size: 0.65rem; text-transform: uppercase;
  letter-spacing: 0.15em; color: var(--text-dim); text-decoration: none;
  transition: color 0.3s;
}
.nav-link:hover { color: var(--gold-1); }

/* Story Sections */
.story-section {
  min-height: 100vh; position: relative;
  display: flex; align-items: center; justify-content: center;
  padding: 6rem 3rem;
}
.section-bg { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.bg-gradient { position: absolute; inset: 0; }

.section-content { max-width: 800px; position: relative; z-index: 2; }
.section-chapter {
  display: flex; align-items: center; gap: 0.75rem; margin-bottom: 2rem;
  font-family: 'Inter', sans-serif; font-size: 0.6rem; text-transform: uppercase;
  letter-spacing: 0.2em; color: var(--accent, var(--gold-1));
}
.chapter-rule {
  display: inline-block; width: 40px; height: 1px;
  background: var(--accent, var(--gold-1));
}

.section-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(3rem, 7vw, 6rem); font-weight: 300; line-height: 1.1;
  margin-bottom: 2rem; display: flex; flex-wrap: wrap; gap: 0.3em;
}
.title-word {
  display: inline-block;
  animation: wordReveal 1.2s cubic-bezier(0.23, 1, 0.32, 1) forwards;
  opacity: 0; transform: translateY(40px);
}
@keyframes wordReveal {
  to { opacity: 1; transform: translateY(0); }
}

.section-divider {
  width: 60px; height: 1px; background: linear-gradient(to right, var(--accent, var(--gold-1)), transparent);
  margin-bottom: 2rem;
}
.section-desc {
  font-size: 1.05rem; line-height: 1.8; color: var(--text-dim);
  max-width: 560px; font-weight: 300;
}

/* Visual Orb */
.section-visual {
  position: absolute; right: -10%; top: 50%; transform: translateY(-50%);
  width: 50vw; height: 50vw; max-width: 600px; max-height: 600px;
  pointer-events: none; z-index: 1;
}
.visual-orb { position: relative; width: 100%; height: 100%; }
.orb-ring {
  position: absolute; inset: 0; border-radius: 50%;
  border: 1px solid var(--gold-1);
  animation: orbPulse 4s ease-in-out infinite;
}
@keyframes orbPulse {
  0%, 100% { transform: scale(0.8); opacity: 0.2; }
  50% { transform: scale(1.2); opacity: 0.5; }
}
.orb-core {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  width: 8px; height: 8px; border-radius: 50%;
  box-shadow: 0 0 40px var(--accent, var(--gold-1));
}

/* Scroll Hint */
.scroll-hint {
  position: absolute; bottom: 3rem; left: 50%; transform: translateX(-50%);
  display: flex; flex-direction: column; align-items: center; gap: 1rem;
  z-index: 2;
}
.scroll-line {
  width: 1px; height: 40px; background: linear-gradient(to bottom, var(--gold-1), transparent);
  animation: scrollLine 2s ease-in-out infinite;
}
@keyframes scrollLine {
  0%, 100% { opacity: 0.3; height: 40px; }
  50% { opacity: 1; height: 60px; }
}
.scroll-text { font-size: 0.55rem; text-transform: uppercase; letter-spacing: 0.2em; color: var(--text-dim); }

/* CTA Section */
.cta-section {
  min-height: 80vh; position: relative;
  display: flex; align-items: center; justify-content: center;
  text-align: center; padding: 4rem 2rem;
}
.cta-content { max-width: 700px; position: relative; z-index: 2; }
.cta-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(3rem, 6vw, 5rem); font-weight: 300;
  color: var(--gold-1); margin-bottom: 1.5rem;
}
.cta-desc {
  font-size: 1rem; line-height: 1.7; color: var(--text-dim);
  margin-bottom: 3rem; font-weight: 300;
}
.cta-btn {
  display: inline-flex; align-items: center; gap: 1rem;
  padding: 1rem 2.5rem;
  border: 1px solid var(--gold-1); border-radius: 50px;
  font-family: 'Cormorant Garamond', serif; font-size: 1.1rem; color: var(--gold-1);
  text-decoration: none; letter-spacing: 0.06em;
  transition: all 0.4s;
}
.cta-btn:hover { background: rgba(212,168,67,0.08); }
.cta-arrow { transition: transform 0.3s; }
.cta-btn:hover .cta-arrow { transform: translateX(4px); }
.cta-bg {
  position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(ellipse at center, rgba(212,168,67,0.08) 0%, transparent 70%);
}

/* Footer */
.site-footer {
  padding: 3rem; text-align: center; border-top: 1px solid rgba(212,168,67,0.1);
}
.footer-content {
  font-size: 0.7rem; color: var(--text-dim);
  display: flex; justify-content: center; gap: 0.75rem;
  letter-spacing: 0.06em;
}

@media (max-width: 768px) {
  .site-header { padding: 1rem 1.5rem; }
  .nav { display: none; }
  .story-section { padding: 5rem 1.5rem; }
  .section-visual { display: none; }
  .section-title { font-size: 2.2rem; }
}
</style>
