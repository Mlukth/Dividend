<script setup>
const features = [
  {
    id: 'intuitive',
    title: 'Intuitive API',
    desc: 'Animate faster with an easy-to-use, yet powerful animation API.',
    links: ['Per property parameters', 'Flexible keyframes system', 'Built-in easings'],
    color: 'getting-started',
  },
  {
    id: 'composition',
    title: 'Enhanced transforms',
    desc: 'Smoothly blend individual CSS transform properties with a versatile composition API.',
    links: ['Individual CSS Transforms', 'Function based values', 'Blend composition'],
    color: 'animation',
  },
  {
    id: 'scroll',
    title: 'Scroll Observer',
    desc: 'Synchronise and trigger animations on scroll with the Scroll Observer API.',
    links: ['Multiple synchronisation modes', 'Custom thresholds', 'Container based scrolling'],
    color: 'turquoise',
  },
  {
    id: 'stagger',
    title: 'Stagger',
    desc: 'Create beautiful staggered animations with built-in overlapping and delay controls.',
    links: ['Advanced overlapping', 'Delay, start & end', 'From center, edges or custom'],
    color: 'coral',
  },
  {
    id: 'timeline',
    title: 'Timeline',
    desc: 'Orchestrate complex sequences with precise timing between multiple animations.',
    links: ['Add, sync & shift', 'Loop & alternate', 'Absolute & relative offsets'],
    color: 'orange',
  },
]

const navLinks = ['Docs', 'Easings', 'Learn', 'Examples', 'GitHub', 'Sponsor']
</script>

<template>
  <div class="animejs-site">
    <!-- Header -->
    <header class="site-header">
      <div class="header-content">
        <a href="#" class="logo">
          <span class="logo-text">anime<span class="logo-dot">.</span>js</span>
          <span class="logo-sub">JavaScript Animation Engine</span>
        </a>
        <nav class="site-nav">
          <a v-for="link in navLinks" :key="link" href="#" class="nav-link">{{ link }}</a>
        </nav>
      </div>
    </header>

    <main class="main">
      <!-- Intro -->
      <section id="intro" class="intro-section">
        <div class="intro-content">
          <h2 class="intro-heading">All-in-one <br>animation <br>engine<span class="red-dot">.</span></h2>
          <p class="intro-desc">A fast and flexible JavaScript <br>library to animate <span class="animate-anything">the web</span><span class="red-dot">.</span></p>
          <div class="intro-actions">
            <pre class="npm-code"><code>npm i animejs</code></pre>
            <button class="learn-btn">Learn more &#8595;</button>
          </div>
        </div>
        <div class="section-spacer"></div>
      </section>

      <!-- Toolbox -->
      <section id="toolbox" class="toolbox-section">
        <div class="toolbox-content">
          <h2 class="section-heading-xl">The complete <br>animator's toolbox</h2>
          <p class="section-sub">Break free from browser limitations and animate anything on the web with a single API.</p>
          <div class="toolbox-tags">
            <span class="tag">CSS Transforms</span>
            <span class="tag">SVG</span>
            <span class="tag">DOM Attributes</span>
            <span class="tag">JavaScript Objects</span>
            <span class="tag">CSS Variables</span>
            <span class="tag">Colors</span>
          </div>
        </div>
        <div class="section-spacer"></div>
      </section>

      <!-- Feature Sections -->
      <section v-for="feat in features" :key="feat.id" :id="feat.id" class="feature-section" :class="`color-${feat.color}`">
        <div class="feature-content">
          <div class="feature-text">
            <h2>{{ feat.title }}</h2>
            <p>{{ feat.desc }}</p>
            <ul class="feature-links">
              <li v-for="link in feat.links" :key="link"><a href="#">{{ link }} &rarr;</a></li>
            </ul>
          </div>
          <div class="feature-demo">
            <div class="demo-placeholder">{{ feat.id }}</div>
          </div>
        </div>
        <div class="section-spacer"></div>
      </section>

      <!-- Easing -->
      <section id="easing" class="easing-section">
        <div class="feature-content">
          <div class="feature-text">
            <h2>Easing functions</h2>
            <p>40+ built-in easing functions to create the perfect motion curve.</p>
            <div class="easing-list">
              <span class="easing-chip">easeInQuad</span>
              <span class="easing-chip">easeOutQuad</span>
              <span class="easing-chip">easeInOutQuad</span>
              <span class="easing-chip">easeInCubic</span>
              <span class="easing-chip">easeOutCubic</span>
              <span class="easing-chip">easeInOutCubic</span>
              <span class="easing-chip">easeInElastic</span>
              <span class="easing-chip">easeOutElastic</span>
              <span class="easing-chip">easeInBack</span>
            </div>
          </div>
          <div class="easing-viz">
            <svg viewBox="0 0 200 200" class="easing-curve">
              <path d="M0,200 C50,200 100,0 200,0" fill="none" stroke="currentColor" stroke-width="3"/>
            </svg>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="cta-section">
        <h2>Ready to animate?</h2>
        <pre class="npm-code large"><code>npm i animejs</code></pre>
        <p>v4.4.1 &middot; MIT License &middot; 7KB gzipped</p>
      </section>
    </main>

    <footer class="site-footer">
      <p>Made by <a href="#">Julian Garnier</a> &middot; anime.js v4</p>
    </footer>
  </div>
</template>

<style scoped>
* { box-sizing: border-box; margin: 0; padding: 0; }

.animejs-site {
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  background: #252423;
  color: #f6f4f2;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  --red-1: #ff4b4b; --red-2: #d34343; --red-3: #883534;
  --coral-1: #ff7d36; --coral-2: #d36b32;
  --orange-1: #ffa828; --orange-2: #d38e27;
  --yellow-1: #ffcc2a;
  --turquoise-1: #00ffaa; --turquoise-2: #07d38f;
  --gray-1: #f6f4f2; --gray-2: #cccac9; --gray-3: #85837e;
  --gray-5: #5b5855; --gray-7: #3b3937; --gray-8: #2c2a28;
  --bg: #252423;
}

/* Header */
.site-header {
  position: fixed; top: 0; left: 0; width: 100%; z-index: 1000;
  background: rgba(37,36,35,0.9); backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--gray-8);
  padding: 0 2rem;
}
.header-content {
  max-width: 1400px; margin: 0 auto;
  display: flex; align-items: center; justify-content: space-between;
  height: 64px;
}
.logo { text-decoration: none; color: inherit; display: flex; flex-direction: column; }
.logo-text { font-size: 1.3rem; font-weight: 700; letter-spacing: -0.02em; }
.logo-dot { color: var(--red-1); }
.logo-sub { font-size: 0.65rem; color: var(--gray-3); letter-spacing: 0.02em; }
.site-nav { display: flex; gap: 0.25rem; }
.nav-link {
  color: var(--gray-2); text-decoration: none; padding: 0.4rem 0.75rem;
  font-size: 0.85rem; border-radius: 6px; transition: all 0.2s;
}
.nav-link:hover { color: var(--gray-1); background: var(--gray-8); }

/* Intro */
.intro-section { padding: 10rem 2rem 0; }
.intro-content { max-width: 800px; margin: 0 auto; }
.intro-heading {
  font-size: clamp(3rem, 8vw, 6rem); font-weight: 700; line-height: 1.05;
  letter-spacing: -0.03em; margin-bottom: 1.5rem;
}
.red-dot { color: var(--red-1); }
.intro-desc { font-size: 1.3rem; color: var(--gray-2); margin-bottom: 2rem; }
.animate-anything { text-decoration: underline; text-decoration-color: var(--red-1); text-underline-offset: 4px; }
.intro-actions { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
.npm-code {
  background: var(--gray-8); padding: 0.75rem 1.25rem; border-radius: 8px;
  font-family: 'SF Mono', 'Fira Code', monospace; font-size: 0.9rem;
  color: var(--turquoise-1); border: 1px solid var(--gray-7);
}
.npm-code.large { font-size: 1.15rem; padding: 1rem 2rem; }
.learn-btn {
  background: var(--gray-7); color: var(--gray-1); border: 1px solid var(--gray-5);
  padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer;
  font-family: inherit; font-size: 0.9rem; transition: all 0.2s;
}
.learn-btn:hover { background: var(--gray-5); }

/* Section Spacer */
.section-spacer { height: 30vh; }

/* Toolbox */
.toolbox-section {
  padding: 0 2rem; position: relative;
}
.toolbox-content { max-width: 800px; margin: 0 auto; }
.section-heading-xl {
  font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 700;
  line-height: 1.1; letter-spacing: -0.03em; margin-bottom: 1rem;
}
.section-sub { font-size: 1.1rem; color: var(--gray-3); margin-bottom: 2rem; max-width: 500px; }
.toolbox-tags { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.tag {
  padding: 0.4rem 1rem; border-radius: 20px; border: 1px solid var(--gray-7);
  font-size: 0.8rem; color: var(--gray-2); background: var(--gray-8);
}

/* Feature Sections */
.feature-section { padding: 0 2rem; }
.feature-content {
  max-width: 1200px; margin: 0 auto;
  display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; align-items: center;
}
.feature-text h2 { font-size: 2.5rem; font-weight: 700; margin-bottom: 0.75rem; letter-spacing: -0.02em; }
.feature-text p { font-size: 1.05rem; color: var(--gray-3); margin-bottom: 1.5rem; max-width: 400px; }
.feature-links { list-style: none; display: flex; flex-direction: column; gap: 0.5rem; }
.feature-links a { color: var(--gray-2); text-decoration: none; font-size: 0.9rem; transition: color 0.2s; }
.feature-links a:hover { color: var(--gray-1); }
.feature-demo { display: flex; align-items: center; justify-content: center; }
.demo-placeholder {
  width: 100%; height: 300px; border-radius: 12px;
  background: var(--gray-8); border: 1px solid var(--gray-7);
  display: flex; align-items: center; justify-content: center;
  color: var(--gray-5); font-size: 1.5rem; text-transform: uppercase;
  letter-spacing: 0.1em;
}

/* Color accents */
.color-getting-started { --accent: var(--red-1); }
.color-animation { --accent: var(--coral-1); }
.color-turquoise { --accent: var(--turquoise-1); }
.color-coral { --accent: var(--coral-1); }
.color-orange { --accent: var(--orange-1); }
.color-getting-started .feature-text h2 { color: var(--accent); }
.color-animation .feature-text h2 { color: var(--accent); }
.color-turquoise .feature-text h2 { color: var(--accent); }
.color-coral .feature-text h2 { color: var(--accent); }
.color-orange .feature-text h2 { color: var(--accent); }

/* Easing */
.easing-section { padding: 0 2rem; }
.easing-list { display: flex; gap: 0.4rem; flex-wrap: wrap; margin-top: 1rem; }
.easing-chip {
  padding: 0.3rem 0.75rem; border-radius: 6px; font-size: 0.75rem;
  background: var(--gray-8); color: var(--gray-3); border: 1px solid var(--gray-7);
  font-family: 'SF Mono', monospace;
}
.easing-viz { height: 200px; }
.easing-curve { width: 100%; height: 100%; color: var(--turquoise-1); opacity: 0.5; }

/* CTA */
.cta-section { padding: 8rem 2rem; text-align: center; }
.cta-section h2 { font-size: 2.5rem; font-weight: 700; margin-bottom: 1.5rem; }
.cta-section p { color: var(--gray-3); margin-top: 1rem; font-size: 0.85rem; }

/* Footer */
.site-footer { padding: 2rem; text-align: center; border-top: 1px solid var(--gray-8); }
.site-footer p { color: var(--gray-5); font-size: 0.8rem; }
.site-footer a { color: var(--gray-3); text-decoration: none; }
.site-footer a:hover { color: var(--gray-1); }

@media (max-width: 768px) {
  .site-nav { display: none; }
  .feature-content { grid-template-columns: 1fr; gap: 2rem; }
  .site-header { padding: 0 1rem; }
  .intro-section { padding: 8rem 1rem 0; }
  .toolbox-section, .feature-section, .easing-section { padding: 0 1rem; }
  .section-spacer { height: 15vh; }
}
</style>
