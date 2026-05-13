<script setup>
import { ref, onMounted } from 'vue'

const menuOpen = ref(false)
const currentPage = ref(0)
const mouseX = ref('50%')
const mouseY = ref('50%')
const loading = ref(true)

const navItems = [
  '新手入门', '免费内容', '学习工程', '图文教程',
  '学方舟做设计', '明日方舟美术资源共享', '作品库'
]

const pages = [
  {
    num: '01',
    title: 'ignoredone\'s space',
    subtitle: '明日方舟 · 设计 · 工程',
    desc: '探索游戏美术设计的无限可能。从 UI 到插画，从动画到特效，这里是明日方舟美术资源的共享与学习空间。',
    bg: '#e4efeb'
  },
  {
    num: '02',
    title: '免费内容',
    subtitle: '开源 · 共享 · 成长',
    desc: '分享免费的明日方舟美术素材、设计源文件、工程模板。让每一个热爱方舟美术的人都能轻松入手。',
    bg: '#f1fefb'
  },
  {
    num: '03',
    title: '学习工程',
    subtitle: '实战 · 复盘 · 提升',
    desc: '从零开始拆解明日方舟的 UI 设计、角色立绘、场景构图。完整工程文件 + 详细步骤解析，手把手带你复刻。',
    bg: '#e4efeb'
  },
  {
    num: '04',
    title: '图文教程',
    subtitle: '技巧 · 思路 · 经验',
    desc: '多年设计经验沉淀，从软件操作到设计思维，从色彩理论到排版技巧。每一篇都是用心打磨的实战笔记。',
    bg: '#f1fefb'
  },
]

function onMouseMove(e) {
  mouseX.value = e.clientX + 'px'
  mouseY.value = e.clientY + 'px'
}

function dismissLoader() {
  loading.value = false
}

onMounted(() => {
  setTimeout(dismissLoader, 2000)
})
</script>

<template>
  <div class="ignoredone-site" :class="{ 'force-light': true }" @mousemove="onMouseMove">
    <!-- Preloader -->
    <div
      v-if="loading"
      class="preloader"
      :class="{ 'preloader-hide': !loading }"
      :style="{ '--mouse-x': mouseX, '--mouse-y': mouseY }"
      @click="dismissLoader"
    >
      <div class="preloader-logo">
        <svg viewBox="0 0 100 100" class="logo-svg">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#111" stroke-width="2"/>
          <circle cx="50" cy="50" r="20" fill="none" stroke="#111" stroke-width="1" stroke-dasharray="4 2"/>
          <circle cx="50" cy="50" r="6" fill="#111"/>
        </svg>
      </div>
      <p class="preloader-text">Click anywhere to enter</p>
    </div>

    <!-- Header -->
    <header class="site-header">
      <div class="header-inner">
        <a href="#" class="site-logo">
          <svg viewBox="0 0 28 28" width="28" height="28">
            <circle cx="14" cy="14" r="12" fill="none" stroke="#111" stroke-width="2"/>
            <circle cx="14" cy="14" r="4" fill="#111"/>
          </svg>
        </a>
        <button class="menu-toggle" @click="menuOpen = !menuOpen" :aria-expanded="menuOpen">
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path d="M5 5v1.5h14V5H5zm0 6.5h14v-1.5H5v1.5zM5 19h14v-1.5H5V19z" fill="currentColor"/>
          </svg>
        </button>
      </div>
    </header>

    <!-- Mobile Menu -->
    <div v-if="menuOpen" class="mobile-menu">
      <button class="menu-close" @click="menuOpen = false">
        <svg width="24" height="24" viewBox="0 0 24 24"><path d="m13.06 12 6.47-6.47-1.06-1.06L12 10.94 5.53 4.47 4.47 5.53 10.94 12l-6.47 6.47 1.06 1.06L12 13.06l6.47 6.47 1.06-1.06L13.06 12Z" fill="currentColor"/></svg>
      </button>
      <ul class="menu-list">
        <li v-for="item in navItems" :key="item"><a href="#">{{ item }}</a></li>
      </ul>
    </div>

    <!-- Page Wrapper (horizontal swipe) -->
    <div class="page-wrapper" :style="{ transform: `translateX(-${currentPage * 100}vw)` }">
      <section
        v-for="(page, i) in pages"
        :key="page.num"
        class="page"
        :style="{ backgroundColor: page.bg }"
      >
        <div class="page-content">
          <div class="page-marker">{{ page.num }}</div>
          <div class="page-text">
            <h1 class="page-title">{{ page.title }}</h1>
            <p class="page-subtitle">{{ page.subtitle }}</p>
            <p class="page-desc">{{ page.desc }}</p>
            <div v-if="i === 0" class="page-actions">
              <a v-for="item in navItems.slice(0, 4)" :key="item" href="#" class="page-link">{{ item }} &rarr;</a>
            </div>
          </div>
          <div class="page-visual">
            <div class="visual-placeholder">
              <svg viewBox="0 0 200 200" class="visual-dots">
                <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(0,0,0,0.08)" stroke-width="1"/>
                <circle cx="100" cy="100" r="50" fill="none" stroke="rgba(0,0,0,0.06)" stroke-width="1" stroke-dasharray="3 3"/>
                <circle cx="100" cy="100" r="12" fill="rgba(0,0,0,0.15)"/>
              </svg>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Page Nav Dots -->
    <div class="page-dots">
      <button
        v-for="(page, i) in pages"
        :key="i"
        :class="{ active: currentPage === i }"
        @click="currentPage = i"
        :aria-label="`Page ${i + 1}`"
      ></button>
    </div>

    <!-- Page indicator right side -->
    <div class="page-indicator">
      <span>{{ String(currentPage + 1).padStart(2, '0') }}</span>
      <span class="indicator-divider">/</span>
      <span>{{ String(pages.length).padStart(2, '0') }}</span>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wdth,wght@75..100,400..700&family=Jost:ital,wght@0,100..900;1,100..900&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
@import url('https://cdn.jsdelivr.net/gh/TPCTang/MiSans-Webfont@latest/fonts.css');

*, *::after, *::before { box-sizing: border-box; margin: 0; padding: 0; }

.ignoredone-site {
  --base: #e4efeb;
  --base2: #f1fefb;
  --contrast: #000000;
  --contrast2: #353535;
  --contrast3: #A4A4A4;

  color-scheme: light !important;
  background: #fff; color: var(--contrast);
  font-family: 'Jost', 'MiSans', system-ui, sans-serif;
  font-size: 1.05rem; line-height: 1.55;
  -webkit-font-smoothing: antialiased;
  height: 100vh; overflow: hidden;
  -webkit-tap-highlight-color: transparent;
}

/* Force Light Mode */
.force-light {
  color-scheme: light !important;
}
.force-light img, .force-light svg { filter: none !important; }

/* Preloader */
.preloader {
  position: fixed; inset: 0; z-index: 9999;
  background: #E3E3E3;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  clip-path: circle(100% at 50% 50%);
  transition: clip-path 0.8s ease; cursor: pointer;
}
.preloader-hide {
  clip-path: circle(0px at var(--mouse-x, 50%) var(--mouse-y, 50%));
  pointer-events: none;
}
.preloader-logo { width: 100px; animation: fadeLogo 4s ease-in-out infinite; }
.logo-svg { width: 100%; height: 100%; display: block; }
@keyframes fadeLogo {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}
.preloader-text {
  margin-top: 2rem; font-family: 'MiSans', sans-serif;
  font-size: 0.8rem; color: rgba(0,0,0,0.4); letter-spacing: 0.05em;
}

/* Header */
.site-header {
  position: fixed; top: 0; left: 0; width: 100%; z-index: 100;
  padding: 1.2rem max(2rem, 3vw);
  background: rgba(255,255,255,0.8); backdrop-filter: blur(12px);
}
.header-inner { display: flex; align-items: center; justify-content: space-between; }
.site-logo { display: block; }
.menu-toggle {
  background: none; border: none; cursor: pointer; color: var(--contrast);
  padding: 0.25rem;
}

/* Mobile Menu */
.mobile-menu {
  position: fixed; inset: 0; z-index: 200;
  background: var(--base); padding: 2rem;
  display: flex; flex-direction: column;
}
.menu-close { align-self: flex-end; background: none; border: none; cursor: pointer; color: var(--contrast); }
.menu-list { list-style: none; margin-top: 3rem; }
.menu-list a {
  display: block; padding: 1rem 0;
  font-family: 'MiSans', sans-serif; font-size: 1.1rem;
  color: var(--contrast); text-decoration: none;
  border-bottom: 1px solid rgba(0,0,0,0.06);
}

/* Page Wrapper */
.page-wrapper {
  display: flex; height: 100vh;
  transition: transform 0.6s cubic-bezier(0.65, 0, 0.35, 1);
  overflow: hidden; overscroll-behavior: none;
}
.page {
  flex: 0 0 100vw; height: 100vh; position: relative;
  display: flex; align-items: center; overflow-y: auto;
  overscroll-behavior: contain; -webkit-overflow-scrolling: touch;
}
.page-content {
  max-width: 1280px; margin: 0 auto; padding: 4rem max(2rem, 5vw);
  display: grid; grid-template-columns: 1fr 1fr; gap: 3rem;
  width: 100%; align-items: center;
}
.page-marker {
  position: absolute; right: 40px; top: 50%; transform: translateY(-50%);
  font-family: 'Outfit', sans-serif; font-size: 4rem; font-weight: 700;
  color: rgba(0,0,0,0.06); pointer-events: none;
}
.page-text { position: relative; z-index: 2; }
.page-title {
  font-family: 'Instrument Sans', sans-serif;
  font-size: clamp(2rem, 4vw, 2.8rem); font-weight: 600; line-height: 1.15;
  margin-bottom: 0.75rem;
}
.page-subtitle {
  font-family: 'MiSans', sans-serif; font-size: 1.1rem; font-weight: 500;
  color: var(--contrast2); margin-bottom: 1.5rem;
}
.page-desc {
  font-size: 0.95rem; line-height: 1.7; color: var(--contrast2);
  max-width: 480px; margin-bottom: 2rem;
}
.page-actions { display: flex; flex-direction: column; gap: 0.6rem; }
.page-link {
  font-family: 'MiSans', sans-serif; font-size: 0.9rem;
  color: var(--contrast); text-decoration: none;
  transition: opacity 0.2s;
}
.page-link:hover { opacity: 0.5; }

.page-visual { position: relative; z-index: 1; }
.visual-placeholder {
  width: 100%; aspect-ratio: 1;
  display: flex; align-items: center; justify-content: center;
}
.visual-dots { width: 80%; height: 80%; opacity: 0.5; }

/* Page Nav Dots */
.page-dots {
  position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%);
  display: flex; gap: 0.75rem; z-index: 100;
}
.page-dots button {
  width: 8px; height: 8px; border-radius: 50%;
  border: 1px solid rgba(0,0,0,0.3); background: transparent;
  cursor: pointer; transition: all 0.3s; padding: 0;
}
.page-dots button.active { background: var(--contrast); border-color: var(--contrast); }

/* Page Indicator */
.page-indicator {
  position: fixed; right: max(2rem, 5vw); bottom: 2rem; z-index: 100;
  font-family: 'Outfit', sans-serif; font-size: 0.8rem;
  color: rgba(0,0,0,0.3); letter-spacing: 0.05em;
}
.indicator-divider { margin: 0 0.2rem; }

@media (max-width: 768px) {
  .page-content { grid-template-columns: 1fr; gap: 1.5rem; padding: 5rem 1.5rem 2rem; }
  .page-marker { font-size: 2.5rem; right: 16px; }
  .visual-placeholder { aspect-ratio: 16/10; }
}
</style>
