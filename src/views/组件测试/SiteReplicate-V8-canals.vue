<script setup>
const chapters = [
  { num: 'I', title: 'The Golden Age', desc: 'How a small fishing village became the epicentre of global trade, fuelling an unprecedented urban expansion that gave birth to the canal ring.' },
  { num: 'II', title: 'Engineering a City', desc: 'Draining marshland, driving wooden piles into soft earth, and digging three concentric canals created a masterwork of 17th-century civil engineering.' },
  { num: 'III', title: 'Merchant Princes', desc: 'The grand canal houses — narrow, deep, and crowned with ornate gables — were built by merchants who turned shipping fortunes into architectural legacy.' },
  { num: 'IV', title: 'Water & Light', desc: 'The interplay of water reflections and Dutch light has drawn artists for four centuries, from Rembrandt\'s etchings to contemporary photography.' },
  { num: 'V', title: 'Living Heritage', desc: 'Today the Grachtengordel is a UNESCO World Heritage site, its 165 canals and 1,700 bridges still the beating heart of Amsterdam.' },
]

const navItems = ['The Canals', 'History', 'Architecture', 'Map', 'About']
</script>

<template>
  <div class="canals-site">
    <!-- Decorative overlay -->
    <div class="overlay-noise"></div>

    <!-- Fixed nav -->
    <header class="site-nav">
      <div class="nav-left">
        <span class="nav-wordmark">CANALS</span>
      </div>
      <nav class="nav-links">
        <a v-for="item in navItems" :key="item" href="#" class="nav-link">{{ item }}</a>
      </nav>
      <div class="nav-right">
        <span class="nav-by">By Marcus Brown &amp; Aristide Benoist</span>
      </div>
    </header>

    <main class="canvas-main">
      <!-- Hero -->
      <section class="hero-panel">
        <div class="hero-rule"></div>
        <h1 class="hero-title">
          <span class="line-reveal"><span class="line-inner">The Amsterdam</span></span>
          <span class="line-reveal"><span class="line-inner">Canal Ring</span></span>
        </h1>
        <div class="hero-sub reveal-text">
          <p>An editorial glimpse into the creation,<br>history and expansions of the iconic<br>17th-century canals in the Netherlands.</p>
        </div>
        <div class="hero-marker reveal-text">Grachtengordel &mdash; est. 1613</div>
      </section>

      <!-- Intro spread -->
      <section class="spread-panel">
        <div class="spread-grid">
          <div class="spread-stat">
            <div class="stat-num reveal-text">165</div>
            <div class="stat-label reveal-text">Canals</div>
          </div>
          <div class="spread-stat">
            <div class="stat-num reveal-text">1,700</div>
            <div class="stat-label reveal-text">Bridges</div>
          </div>
          <div class="spread-stat">
            <div class="stat-num reveal-text">14km</div>
            <div class="stat-label reveal-text">Canal ring length</div>
          </div>
        </div>
        <div class="spread-rule"></div>
      </section>

      <!-- Chapters -->
      <section v-for="(ch, i) in chapters" :key="ch.num" class="chapter-panel">
        <div class="chapter-layout">
          <div class="chapter-num reveal-text">{{ ch.num }}</div>
          <div class="chapter-body">
            <h2 class="chapter-title reveal-text">{{ ch.title }}</h2>
            <p class="chapter-desc reveal-text">{{ ch.desc }}</p>
          </div>
          <div class="chapter-image">
            <div class="image-placeholder"></div>
          </div>
        </div>
        <div class="chapter-rule"></div>
      </section>

      <!-- Map reference -->
      <section class="map-panel">
        <div class="map-section">
          <div class="map-title reveal-text">Grachtengordel</div>
          <div class="map-coords reveal-text">
            <div>Herengracht</div>
            <div>Keizersgracht</div>
            <div>Prinsengracht</div>
          </div>
          <div class="map-note reveal-text">The three main canals form concentric<br>half-circles around the historic centre.</div>
        </div>
        <div class="map-rule"></div>
      </section>

      <!-- Colophon -->
      <section class="colophon-panel">
        <div class="colophon-text reveal-text">
          <p>CANALS is a collaboration between photographer <a href="#">Marcus Brown</a> and designer <a href="#">Aristide Benoist</a>, documenting the enduring beauty of Amsterdam's 400-year-old waterway system.</p>
        </div>
        <div class="colophon-rule"></div>
      </section>
    </main>

    <footer class="site-footer">
      <div class="footer-rule"></div>
      <div class="footer-content">
        <span>CANALS &copy; 2023</span>
        <span>Amsterdam, NL</span>
      </div>
    </footer>
  </div>
</template>

<style scoped>
*, *::after, *::before { box-sizing: border-box; margin: 0; padding: 0; }

@font-face {
  font-family: 'Caslon Graphique';
  src: url('https://canals-amsterdam.com/public/font/CaslonGraComD.woff2') format('woff2');
  font-weight: 400; font-style: normal; font-display: swap;
}
@font-face {
  font-family: 'Graphik';
  src: url('https://canals-amsterdam.com/public/font/GraphikRegular.woff2') format('woff2');
  font-weight: 400; font-style: normal; font-display: swap;
}
@font-face {
  font-family: 'Graphik Italic';
  src: url('https://canals-amsterdam.com/public/font/GraphikRegularItalic.woff2') format('woff2');
  font-weight: 400; font-style: normal; font-display: swap;
}
@font-face {
  font-family: 'Grifinito';
  src: url('https://canals-amsterdam.com/public/font/GrifinitoMRegular.woff2') format('woff2');
  font-weight: 400; font-style: normal; font-display: swap;
}
@font-face {
  font-family: 'Maelstrom Sans';
  src: url('https://canals-amsterdam.com/public/font/MaelstromSansBold.woff2') format('woff2');
  font-weight: 400; font-style: normal; font-display: swap;
}
@font-face {
  font-family: 'Coign';
  src: url('https://canals-amsterdam.com/public/font/Coign37B.woff2') format('woff2');
  font-weight: 400; font-style: normal; font-display: swap;
}

.canals-site {
  --black: #000000;
  --white: #ffffff;
  --red: #f00000;
  --ease-canals: cubic-bezier(.23, 1, .32, 1);

  position: fixed; inset: 0;
  background: var(--black);
  color: var(--white);
  font-family: 'Graphik', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  overflow-y: auto; overflow-x: hidden;
  cursor: default;
  user-select: none;
  -webkit-user-select: none;
}

.overlay-noise {
  position: fixed; inset: 0; z-index: 9998;
  pointer-events: none; opacity: 0.03;
  background: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

/* Nav */
.site-nav {
  position: fixed; top: 0; left: 0; width: 100%; z-index: 9000;
  display: flex; align-items: center; justify-content: space-between;
  padding: 2rem 2.5rem;
  mix-blend-mode: difference;
}
.nav-wordmark {
  font-family: 'Maelstrom Sans', sans-serif;
  font-size: 1.1rem; letter-spacing: 0.3em; color: var(--white);
}
.nav-links { display: flex; gap: 2.5rem; }
.nav-link {
  font-family: 'Graphik', sans-serif;
  font-size: 0.7rem; text-transform: uppercase;
  letter-spacing: 0.12em; color: var(--white);
  text-decoration: none; transition: opacity 0.4s;
}
.nav-link:hover { opacity: 0.5; }
.nav-by {
  font-family: 'Grifinito', serif;
  font-size: 0.65rem; color: rgba(255,255,255,0.5);
}

/* Hero */
.hero-panel {
  padding: 12rem 2.5rem 4rem;
  min-height: 100vh; display: flex; flex-direction: column;
}
.hero-rule {
  width: 100%; height: 1px; background: rgba(255,255,255,0.15);
  margin-bottom: 3rem;
}
.hero-title {
  font-family: 'Caslon Graphique', serif;
  font-size: clamp(3.5rem, 8vw, 8rem);
  font-weight: 400; line-height: 1.1;
  letter-spacing: -0.02em; margin-bottom: 3rem;
}
.line-reveal { display: block; overflow: hidden; }
.line-inner {
  display: block;
  animation: revealLine 1s var(--ease-canals) forwards;
}
.line-reveal:nth-child(2) .line-inner { animation-delay: 0.15s; }
@keyframes revealLine {
  from { transform: translate3d(0, 102%, 0); }
  to { transform: translate3d(0, 0, 0); }
}
.hero-sub {
  font-family: 'Graphik', sans-serif;
  font-size: 1.1rem; line-height: 1.6;
  color: rgba(255,255,255,0.6); margin-bottom: 3rem;
}
.hero-marker {
  font-family: 'Grifinito', serif;
  font-size: 0.7rem; letter-spacing: 0.08em;
  color: rgba(255,255,255,0.35);
}

/* Spread */
.spread-panel { padding: 2rem 2.5rem 4rem; }
.spread-grid {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 2rem; margin-bottom: 3rem;
}
.spread-stat { text-align: center; }
.stat-num {
  font-family: 'Coign', sans-serif;
  font-size: clamp(3rem, 5vw, 5rem); line-height: 1;
  color: var(--white); margin-bottom: 0.5rem;
}
.stat-label {
  font-family: 'Graphik', sans-serif;
  font-size: 0.65rem; text-transform: uppercase;
  letter-spacing: 0.15em; color: rgba(255,255,255,0.4);
}
.spread-rule {
  width: 100%; height: 1px; background: rgba(255,255,255,0.12);
}

/* Chapter */
.chapter-panel { padding: 4rem 2.5rem 2rem; }
.chapter-layout {
  display: grid; grid-template-columns: 80px 1fr 1fr;
  gap: 3rem; align-items: start;
}
.chapter-num {
  font-family: 'Grifinito', serif;
  font-size: 4rem; line-height: 1;
  color: var(--red);
}
.chapter-title {
  font-family: 'Maelstrom Sans', sans-serif;
  font-size: 2.2rem; font-weight: 400; line-height: 1.15;
  margin-bottom: 1rem;
}
.chapter-desc {
  font-family: 'Graphik', sans-serif;
  font-size: 0.9rem; line-height: 1.7;
  color: rgba(255,255,255,0.55); max-width: 380px;
}
.chapter-image {
  aspect-ratio: 4/3;
  border: 1px solid rgba(255,255,255,0.08);
}
.image-placeholder {
  width: 100%; height: 100%;
  background: linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.06));
}
.chapter-rule {
  width: 100%; height: 1px; background: rgba(255,255,255,0.08);
  margin-top: 3rem;
}

/* Map */
.map-panel { padding: 4rem 2.5rem 2rem; }
.map-section { max-width: 600px; }
.map-title {
  font-family: 'Maelstrom Sans', sans-serif;
  font-size: 2.5rem; margin-bottom: 1.5rem;
}
.map-coords {
  display: flex; gap: 2rem; margin-bottom: 1.5rem;
}
.map-coords div {
  font-family: 'Graphik', sans-serif;
  font-size: 0.8rem; letter-spacing: 0.06em;
  color: rgba(255,255,255,0.5);
}
.map-note {
  font-family: 'Graphik', sans-serif;
  font-size: 0.8rem; line-height: 1.6;
  color: rgba(255,255,255,0.35);
}
.map-rule {
  width: 100%; height: 1px; background: rgba(255,255,255,0.08);
  margin-top: 2rem;
}

/* Colophon */
.colophon-panel { padding: 4rem 2.5rem 2rem; }
.colophon-text {
  max-width: 600px; margin-bottom: 3rem;
}
.colophon-text p {
  font-family: 'Graphik Italic', sans-serif;
  font-size: 1rem; line-height: 1.7;
  color: rgba(255,255,255,0.5);
}
.colophon-text a {
  color: var(--red); text-decoration: none;
  transition: opacity 0.3s;
}
.colophon-text a:hover { opacity: 0.6; }
.colophon-rule {
  width: 100%; height: 1px; background: rgba(255,255,255,0.08);
}

/* Footer */
.site-footer { padding: 2rem 2.5rem 4rem; }
.footer-rule {
  width: 100%; height: 1px; background: rgba(255,255,255,0.08);
  margin-bottom: 1.5rem;
}
.footer-content {
  display: flex; justify-content: space-between;
  font-family: 'Grifinito', serif;
  font-size: 0.65rem; color: rgba(255,255,255,0.25);
}

/* Animation classes */
.reveal-text {
  animation: revealText 1s var(--ease-canals) forwards;
}
@keyframes revealText {
  from { transform: translate3d(0, 40px, 0); opacity: 0; }
  to { transform: translate3d(0, 0, 0); opacity: 1; }
}

::selection { color: var(--black); background: var(--black); }

@media (max-width: 768px) {
  .nav-links, .nav-by { display: none; }
  .site-nav { padding: 1.5rem; }
  .hero-panel { padding: 8rem 1.5rem 3rem; }
  .spread-panel, .chapter-panel, .map-panel, .colophon-panel { padding: 2rem 1.5rem; }
  .chapter-layout { grid-template-columns: 1fr; gap: 1rem; }
  .chapter-num { font-size: 2.5rem; }
  .spread-grid { grid-template-columns: 1fr; gap: 1.5rem; }
}
</style>
