<script setup>
import { ref, computed } from 'vue'

const menuOpen = ref(false)
const lang = ref('en')
const theme = ref('lat-theme')
const loading = ref(true)
const loadingPercent = ref(0)

const themes = [
  { value: 'lat-theme', labelEn: 'Laterano', labelZh: '拉特兰', primary: '#2c4ed0' },
  { value: 'jie-garden', labelEn: 'Jie Garden', labelZh: '界园', primary: '#4a8c3f' },
  { value: 'lonetrail', labelEn: 'Lonetrail', labelZh: '孤迹', primary: '#eb702a' },
  { value: 'sarkaz', labelEn: 'Sarkaz', labelZh: '萨卡兹', primary: '#c44545' },
]

const currentTheme = computed(() => themes.find(t => t.value === theme.value))

const quotes = {
  'lat-theme': {
    en: [
      'Beneath an eternal halo, they share joy and glory;',
      'Amidst ceaseless gunshots, they fend off pain and darkness.',
      'Foreign travelers marvel at the scenery, while returning Messengers silently pray:',
      'May supreme grace be bestowed upon us, may eternal redemption descend to us.',
      'May you and I, guided by the light, journey ahead to an unknown horizon.',
    ],
    zh: [
      '在永恒的光环下，他们共享喜悦与荣耀；',
      '在不绝的枪火中，他们抵御苦痛与黑暗。',
      '异乡旅人惊叹于风景，归来的信使默默祈祷：',
      '愿至高的恩典降临于我们，愿永恒的救赎垂临于我们。',
      '愿你我在光的指引下，踏上通往未知地平线的旅途。',
    ],
  },
  'jie-garden': {
    en: [
      'Near Baizao, nestled between mounts and stream, tourists enjoy themselves.',
      'With the garden cleared of bystanders, prepare for battle.',
      'Throw wide the gates, and look down from the peaks. The Placation begins.',
    ],
    zh: [
      '百灶城边，依山傍水处，游人流连忘返。',
      '如今已清退旁人，严阵以待。',
      '你打开大门，眺望山巅，镇抚仪式由此开始。',
    ],
  },
  'lonetrail': {
    en: [
      'Dark clouds gather as a rainstorm draws near.',
      'Is this a conspiracy, a farce, or one\'s lone awakening?',
      'Old grudges now cross paths here, as the past and the present clash.',
      'Tonight, nobody sleeps.',
    ],
    zh: [
      '乌云聚拢，暴雨欲来。',
      '这是阴谋，是闹剧，还是某人孤独的觉醒？',
      '旧日恩怨在此交汇，过去与现在激烈碰撞。',
      '今夜，无人入眠。',
    ],
  },
  'sarkaz': {
    en: [
      'The voices of the revenants draw you away from reality.',
      'A ritual, a communion.',
      'An otherworldly experience is about to begin.',
    ],
    zh: [
      '死魂灵的声音将你引离现实。',
      '一场仪式，一场沟通。',
      '超脱大地的畅想即将开始。',
    ],
  },
}

const aboutText = {
  en: [
    'I originally started playing Arknights because of W. After reading her event\'s story, I wanted to play the game. Later, I gradually had a lot of fun playing it. The previous gacha games I played before were "Alchemy Stars", "Guardian Tales" and "Honkai Impact 3rd", but the first two were too easy for me to get tired of, and "Honkai Impact 3rd" felt too grindy for me.',
    'Then, I started enjoying playing Arknights, which was the middle ground of the two. It wasn\'t too demanding because there were guides on how to clear the stages, and it was also relatively interesting with the new stage mechanics introduced with every event.',
    'Although, I do regret only starting to play Contingency Contract around the end of its first season, because I thought that the gamemode was too difficult.',
  ],
  zh: [
    '我最开始会玩明日方舟是因为W，看了她的活动剧情之后就想玩这款游戏。后来自己也慢慢玩得很开心。之前玩过的抽卡游戏有《白夜极光》、《守望传说》和《崩坏3》，但前两个对我来说太容易腻了，而《崩坏3》又太肝了。',
    '然后就开始喜欢上明日方舟，因为它刚好介于两者之间。它不会太肝，因为有很多关卡都有攻略可以参考；而且每次活动都会有新的机制，玩起来也挺有趣的。',
    '不过我确实有点后悔自己在第一季快结束时才开始玩危机合约，因为当时觉得这个模式太难了。',
  ],
}

const navItems = {
  en: ['Home', 'About', 'Collections', 'Projects', 'Contact'],
  zh: ['主页', '关于', '收藏', '项目', '联系'],
}

const socialLinks = [
  { name: 'X/Twitter', icon: 'X', color: '#14171a' },
  { name: 'YouTube', icon: '▶', color: '#ff0000' },
  { name: 'Bilibili', icon: 'B', color: '#fa769c' },
  { name: 'Instagram', icon: '📷', color: '#d62976' },
  { name: 'Email', icon: '@', color: '#4285f4' },
  { name: 'Discord', icon: 'D', color: '#5865f2' },
  { name: 'QQ', icon: 'Q', color: '#25bcfc' },
]

const projectFilters = ['All', 'Photography', 'Illustration', 'Design', 'Cosplay']
const activeFilter = ref('All')

function toggleLanguage() { lang.value = lang.value === 'en' ? 'zh' : 'en' }
function selectTheme(t) { theme.value = t; menuOpen.value = false }

const t = computed(() => (key) => {
  const map = {
    about: { en: 'About Me', zh: '关于我' },
    collections: { en: 'Collections', zh: '收藏' },
    projects: { en: 'Projects', zh: '项目' },
    contact: { en: 'Contact', zh: '联系' },
  }
  return map[key]?.[lang.value] || key
})

// Loading simulation
let loadTimer
function startLoading() {
  let p = 0
  loadTimer = setInterval(() => {
    p += Math.random() * 8
    if (p >= 100) { p = 100; clearInterval(loadTimer); setTimeout(() => loading.value = false, 500) }
    loadingPercent.value = Math.min(Math.round(p), 100)
  }, 150)
}
startLoading()
</script>

<template>
  <div class="lensark-site" :class="[theme, `lang-${lang}`]">
    <!-- Loading Screen -->
    <div v-if="loading" class="loading-screen">
      <div class="ls-loader">
        <svg class="ls-slash" viewBox="-95.46 0 572.76 295.28" xmlns="http://www.w3.org/2000/svg">
          <polygon points="276.67 0 0 295.28 105.17 295.28 381.84 0 276.67 0" />
        </svg>
        <div class="ls-track">
          <div class="ls-percent" :style="{ left: loadingPercent + '%' }">{{ loadingPercent }}%</div>
        </div>
        <svg class="ls-slash" viewBox="-95.46 0 572.76 295.28" xmlns="http://www.w3.org/2000/svg">
          <polygon points="276.67 0 0 295.28 105.17 295.28 381.84 0 276.67 0" />
        </svg>
      </div>
      <div class="ls-decoration">LOADING</div>
    </div>

    <!-- Menu Button -->
    <button class="menu-btn" @click="menuOpen = !menuOpen">
      <span v-if="!menuOpen" class="menu-icon">☰</span>
      <span v-else class="close-icon">✕</span>
    </button>

    <!-- Language Toggle -->
    <button class="lang-toggle" @click="toggleLanguage">
      {{ lang === 'en' ? '中' : 'EN' }}
    </button>

    <!-- Music Button -->
    <button class="music-btn" title="Music">
      <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor">
        <path d="M408-144q-60 0-102-42t-42-102q0-60 42-102t102-42q20 0 38 5.5t34 14.5v-404h216v144H552v384q0 60-42 102t-102 42Z"/>
      </svg>
    </button>

    <!-- Theme Selector -->
    <div class="theme-selector">
      <select v-model="theme">
        <option v-for="t in themes" :key="t.value" :value="t.value">
          {{ lang === 'en' ? t.labelEn : t.labelZh }}
        </option>
      </select>
    </div>

    <!-- Overlay Menu -->
    <div class="menu-overlay" :class="{ open: menuOpen }" @click.self="menuOpen = false">
      <nav class="overlay-nav">
        <ul>
          <li v-for="(item, i) in navItems[lang]" :key="i">
            <a :href="'#' + ['', 'about', 'collections', 'projects', 'contact'][i]" @click="menuOpen = false">{{ item }}</a>
          </li>
        </ul>
      </nav>
    </div>

    <!-- Hero -->
    <section class="hero">
      <div class="hero-bg"></div>
      <div class="hero-content">
        <h1 class="hero-greeting">
          <span v-if="lang === 'en'">Welcome to Lens Ark</span>
          <span v-else>欢迎来到镜舟</span>
        </h1>
        <p class="hero-sub">
          <span v-if="lang === 'en'">An Arknights Fan Art & Photography Portfolio</span>
          <span v-else>明日方舟同人艺术与摄影作品集</span>
        </p>
      </div>
    </section>

    <!-- Quote Section -->
    <section class="quote-section">
      <div class="quote-wrapper">
        <blockquote class="quote-text">
          <span v-for="(line, i) in (quotes[theme]?.[lang] || quotes['lat-theme'][lang])" :key="i" class="quote-line">{{ line }}</span>
        </blockquote>
      </div>
    </section>

    <!-- About -->
    <section id="about" class="about-section">
      <div class="container">
        <div class="about-grid">
          <div class="about-text">
            <h2 class="section-heading">
              <span v-if="lang === 'en'">About Me</span>
              <span v-else>关于我</span>
            </h2>
            <p v-for="(p, i) in aboutText[lang]" :key="i">{{ p }}</p>
          </div>
          <div class="about-media">
            <div class="media-box">
              <span class="media-label">Lens</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Collections -->
    <section id="collections" class="collections-section">
      <div class="container">
        <h2 class="section-heading">
          <span v-if="lang === 'en'">Collections</span>
          <span v-else>收藏</span>
        </h2>
        <div class="collections-grid">
          <div v-for="n in 6" :key="n" class="collection-card">
            <div class="card-img">{{ n }}</div>
            <div class="card-label">Collection {{ n }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Projects -->
    <section id="projects" class="projects-section">
      <div class="container">
        <div class="projects-header">
          <h2 class="section-heading">
            <span v-if="lang === 'en'">Projects</span>
            <span v-else>项目</span>
          </h2>
          <div class="view-controls">
            <span class="ctrl-label">{{ lang === 'en' ? 'Per page' : '每页' }}</span>
            <span class="ctrl-value">12</span>
          </div>
        </div>
        <div class="filter-bar">
          <button
            v-for="f in projectFilters" :key="f"
            class="filter-btn" :class="{ active: activeFilter === f }"
            @click="activeFilter = f"
          >{{ f }}</button>
        </div>
        <div class="projects-masonry">
          <div v-for="n in 12" :key="n" class="project-item">
            <div class="project-img">{{ n }}</div>
            <div class="project-overlay">
              <div class="project-title">Project {{ n }}</div>
              <div class="project-desc">Arknights fan work</div>
            </div>
            <span class="corner-dot top-left"></span>
            <span class="corner-dot top-right"></span>
            <span class="corner-dot bottom-left"></span>
            <span class="corner-dot bottom-right"></span>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact -->
    <section id="contact" class="contact-section">
      <div class="container">
        <h2 class="section-heading">
          <span v-if="lang === 'en'">Contact</span>
          <span v-else>联系</span>
        </h2>
        <div class="social-grid">
          <a v-for="s in socialLinks" :key="s.name" href="#" class="social-item" :style="{ '--bg': s.color }">
            <span class="social-icon">{{ s.icon }}</span>
            <span class="social-name">{{ s.name }}</span>
          </a>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="site-footer">
      <p>&copy; 2024 Lens Ark. Arknights &copy; Hypergryph.</p>
    </footer>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700;900&family=Poppins:wght@400;500;600;700;900&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.lensark-site {
  font-family: 'Poppins', 'HarmonyOS Sans SC', 'Noto Serif SC', sans-serif;
  background: #ffffff;
  color: #000000;
  line-height: 1.7;
  -webkit-font-smoothing: antialiased;
  --primary: #2c4ed0;
  --bg-dark: #111111;
  --bg-light: #f8f8f8;
  transition: background 0.4s, color 0.4s;
}

/* Theme Variants */
.lonetrail-theme { --primary: #eb702a; color: #f8f6e7; }
.lonetrail-theme { background: #111111; }
.lonetrail-theme .container { background: #111111; }
.sarkaz-theme { --primary: #c44545; background: #16120f; color: #ffffff; }
.sarkaz-theme .container { background: #16120f; }
.jie-garden-theme { --primary: #4a8c3f; }

/* Loading Screen */
.loading-screen {
  position: fixed; inset: 0; z-index: 10000;
  background: #0a0a0a; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  transition: opacity 0.75s ease;
}
.ls-loader { display: flex; align-items: center; gap: 1rem; }
.ls-slash { width: 80px; height: 40px; fill: var(--primary); }
.ls-track {
  width: 300px; height: 4px; background: rgba(255,255,255,0.1);
  border-radius: 2px; position: relative; overflow: visible;
}
.ls-percent {
  position: absolute; top: -28px; transform: translateX(-50%);
  font-size: 1.2rem; font-weight: 700; color: var(--primary);
  font-family: 'Poppins', sans-serif; white-space: nowrap;
}
.ls-decoration { color: rgba(255,255,255,0.3); font-size: 0.8rem; margin-top: 2rem; letter-spacing: 0.3em; }

/* Menu Btn */
.menu-btn {
  position: fixed; top: 20px; right: 20px; z-index: 1002;
  width: 50px; height: 50px; border: none; background: none;
  cursor: pointer; font-size: 1.5rem; color: inherit;
  transition: filter 0.3s, transform 0.3s;
}
.menu-btn:hover { filter: drop-shadow(0 6px 12px rgba(0,0,0,0.5)); transform: translateY(-2px); }

/* Lang Toggle */
.lang-toggle {
  position: fixed; bottom: 20px; right: 20px; z-index: 1003;
  width: 44px; height: 44px; border: 2px solid currentColor;
  background: transparent; border-radius: 50%; cursor: pointer;
  font-size: 0.85rem; font-weight: 700; color: inherit;
  transition: filter 0.3s, transform 0.3s;
}
.lang-toggle:hover { filter: drop-shadow(0 6px 12px rgba(0,0,0,0.5)); transform: translateY(-2px); }

/* Music Btn */
.music-btn {
  position: fixed; bottom: 20px; left: 20px; z-index: 1003;
  width: 40px; height: 40px; border: none; background: none;
  cursor: pointer; color: inherit;
}

/* Theme Selector */
.theme-selector {
  position: fixed; top: 20px; left: 20px; z-index: 1005;
}
.theme-selector select {
  background: rgba(0,0,0,0.6); color: white; border: 1px solid rgba(255,255,255,0.2);
  border-radius: 8px; padding: 0.4rem 0.75rem; font-family: inherit; font-size: 0.85rem;
  cursor: pointer; backdrop-filter: blur(10px);
}

/* Overlay Menu */
.menu-overlay {
  position: fixed; top: 0; right: -100%; width: 100%; height: 100%;
  background: rgba(255,255,255,0.3); backdrop-filter: blur(12px);
  z-index: 1001; display: flex; align-items: center; justify-content: center;
  transition: right 0.6s cubic-bezier(0.77, 0, 0.175, 1);
}
.menu-overlay.open { right: 0; }
.overlay-nav ul { list-style: none; text-align: center; }
.overlay-nav li { margin: 15px 0; }
.overlay-nav a {
  text-decoration: none; font-size: 30px; font-weight: 700;
  color: #000; padding: 10px 30px; border-radius: 50px;
  display: inline-block; position: relative; transition: color 0.3s;
}
.overlay-nav a:hover { color: white; }
.overlay-nav a::after {
  content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  border-radius: 50px; background: var(--primary); z-index: -1;
  transform: scaleY(0); transition: transform 0.3s ease;
}
.overlay-nav a:hover::after { transform: scaleY(1); }

/* Hero */
.hero {
  min-height: 100vh; display: flex; align-items: flex-end; justify-content: center;
  text-align: center; padding: 2rem 2rem 100px; position: relative; overflow: hidden;
}
.hero-bg {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  z-index: -1;
}
.hero-content { position: relative; z-index: 1; }
.hero-greeting {
  font-size: clamp(2rem, 6vw, 4rem); font-weight: 900;
  color: white; margin-bottom: 0.5rem;
  text-shadow: 0 2px 20px rgba(0,0,0,0.5);
}
.hero-sub { font-size: 1.1rem; color: rgba(255,255,255,0.7); }

/* Quote */
.quote-section { padding: 5rem 2rem; text-align: center; background: var(--bg-light); }
.sarkaz-theme .quote-section { background: #1a1612; }
.lonetrail-theme .quote-section { background: #111; }
.quote-wrapper { max-width: 800px; margin: 0 auto; }
.quote-text { font-style: italic; font-size: 1.2rem; line-height: 2; position: relative; padding: 2rem; }
.quote-text::before, .quote-text::after {
  font-size: 4rem; color: var(--primary); font-family: Georgia, serif;
  position: absolute; font-style: normal;
}
.quote-text::before { content: '\201C'; top: -20px; left: -20px; }
.quote-text::after { content: '\201D'; bottom: -40px; right: -20px; }
.quote-line { display: block; }

/* Container */
.container { max-width: 1100px; margin: 0 auto; padding: 100px 20px 40px; }

/* Section Headings */
.section-heading {
  font-size: 2rem; font-weight: 700; margin-bottom: 2rem;
  letter-spacing: -0.05em; position: relative; display: inline-block;
}
.section-heading::after {
  content: ''; position: absolute; bottom: -8px; left: 0; width: 60%;
  height: 3px; background: var(--primary);
}

/* About */
.about-section .container { padding-top: 80px; }
.about-grid { display: grid; grid-template-columns: 1fr 400px; gap: 3rem; align-items: center; }
.about-text p { font-size: 1rem; color: #555; margin-bottom: 0.5rem; line-height: 1.8; }
.lonetrail-theme .about-text p, .sarkaz-theme .about-text p { color: #aaa; }
.about-media { display: flex; justify-content: center; }
.media-box {
  width: 350px; height: 350px; border-radius: 16px;
  background: linear-gradient(135deg, #1a1a2e, #2d2d44);
  display: flex; align-items: center; justify-content: center;
  position: relative; overflow: hidden; cursor: pointer;
  clip-path: inset(0); transition: clip-path 0.6s;
}
.media-box:hover { clip-path: inset(5%); }
.media-label { color: white; font-size: 2rem; font-weight: 700; letter-spacing: 0.2em; }

/* Collections */
.collections-section .container { padding-top: 80px; }
.collections-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
.collection-card {
  background: var(--bg-light); border-radius: 12px; overflow: hidden;
  border: 1px solid rgba(0,0,0,0.08); transition: transform 0.3s, box-shadow 0.3s; cursor: pointer;
}
.collection-card:hover { transform: translateY(-4px); box-shadow: 0 12px 30px rgba(0,0,0,0.15); }
.card-img {
  height: 200px; background: linear-gradient(135deg, #e0e0e0, #c0c0c0);
  display: flex; align-items: center; justify-content: center;
  font-size: 3rem; font-weight: 700; color: #999;
}
.card-label { padding: 1rem; font-weight: 600; font-size: 0.9rem; }

/* Projects */
.projects-section .container { padding-top: 80px; }
.projects-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem; }
.view-controls { display: flex; align-items: center; gap: 0.75rem; font-size: 0.85rem; }
.ctrl-label { color: #888; text-transform: uppercase; letter-spacing: 0.08em; }
.ctrl-value { font-weight: 700; color: var(--primary); }
.filter-bar { display: flex; gap: 0.5rem; margin-bottom: 2rem; flex-wrap: wrap; }
.filter-btn {
  padding: 0.35rem 1rem; border: 1px solid #ddd; border-radius: 20px;
  background: transparent; cursor: pointer; font-family: inherit; font-size: 0.8rem;
  color: #888; transition: all 0.2s;
}
.filter-btn:hover, .filter-btn.active { border-color: var(--primary); color: var(--primary); background: rgba(0,0,0,0.03); }

.projects-masonry {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;
}
.project-item {
  position: relative; aspect-ratio: 1; overflow: hidden;
  border: 1px solid var(--primary); cursor: pointer;
}
.project-img {
  width: 100%; height: 100%; background: #2a2a2a;
  display: flex; align-items: center; justify-content: center;
  font-size: 2rem; color: #555; filter: brightness(0.5);
  transition: filter 0.4s;
}
.project-item:hover .project-img { filter: brightness(1); }
.project-overlay {
  position: absolute; bottom: 0; left: 0; width: 100%; padding: 1.5rem;
  background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);
  color: white; opacity: 0; transition: opacity 0.5s;
}
.project-item:hover .project-overlay { opacity: 1; }
.project-title { font-size: 1.1rem; font-weight: 600; }
.project-desc { font-size: 0.8rem; color: #b1b1b1; margin-top: 4px; }

.corner-dot {
  position: absolute; width: 6px; height: 6px; background: var(--primary); z-index: 2;
}
.top-left { top: -3px; left: -3px; }
.top-right { top: -3px; right: -3px; }
.bottom-left { bottom: -3px; left: -3px; }
.bottom-right { bottom: -3px; right: -3px; }

/* Contact */
.contact-section .container { padding-top: 80px; padding-bottom: 60px; text-align: center; }
.social-grid { display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap; margin-top: 2rem; }
.social-item {
  width: 56px; height: 56px; border-radius: 50%; display: flex;
  align-items: center; justify-content: center;
  background: var(--bg); color: white; text-decoration: none;
  font-size: 1.1rem; transition: transform 0.3s;
  position: relative;
}
.social-item:hover { transform: scale(1.15); }
.social-name { display: none; }

/* Footer */
.site-footer {
  text-align: center; padding: 2rem; font-size: 0.8rem;
  color: #888; border-top: 1px solid rgba(0,0,0,0.08);
}

@media (max-width: 768px) {
  .about-grid { grid-template-columns: 1fr; }
  .media-box { width: 250px; height: 250px; }
  .collections-grid { grid-template-columns: repeat(2, 1fr); }
  .projects-masonry { grid-template-columns: repeat(2, 1fr); }
  .overlay-nav a { font-size: 24px; }
}
</style>
