<script setup>
const partnerLogos = [
  { name: 'Angular', file: 'angular' },
  { name: 'Astro', file: 'astro' },
  { name: 'Bootstrap', file: 'bootstrap' },
  { name: 'Chromium Developers', file: 'chrome' },
  { name: 'Discord', file: 'discord' },
  { name: 'Docusaurus', file: 'docusaurus' },
  { name: 'Expo', file: 'expo' },
  { name: 'Helm', file: 'helm' },
  { name: 'Homebrew', file: 'homebrew' },
  { name: 'Laravel', file: 'laravel' },
  { name: 'Jest', file: 'jest' },
  { name: 'MarkDoc', file: 'markdoc' },
  { name: 'Material UI', file: 'material-ui' },
  { name: 'React', file: 'react' },
  { name: 'Remix', file: 'remix' },
  { name: 'Scala', file: 'scala' },
  { name: 'Snap Developers', file: 'snapchat' },
  { name: 'Tailwind CSS', file: 'tailwind' },
  { name: 'Twilio', file: 'twilio' },
  { name: 'Typescript', file: 'typescript' },
  { name: 'Vite', file: 'vite' },
  { name: 'VitePress', file: 'vitepress' },
  { name: 'Vue', file: 'vue' },
  { name: 'WebPack', file: 'webpack' },
]

const features = [
  {
    title: 'Made for docs',
    description: 'DocSearch is purpose-built to index and surface technical content, from API references to how-tos. It understands code snippets, tables, and markdown structures so your users get pinpoint answers every time.',
    img: 'docs',
    large: false,
  },
  {
    title: 'AI-powered',
    description: 'Leveraging Algolia Ask AI, DocSearch interprets natural-language queries, suggests synonyms, and ranks results by relevance. It turns even complex developer questions into instant, context-aware answers.',
    img: 'ai-powered',
    large: false,
  },
  {
    title: 'Powered by Algolia',
    description: 'Built & deployed on Algolia\'s global search infrastructure, DocSearch delivers sub-20 ms replies at any scale. Enjoy 99.99% uptime and auto-scaled capacity without lifting a finger—your docs stay lightning-fast, always.',
    img: 'powered-by-algolia',
    large: true,
  },
  {
    title: 'Customizable',
    description: 'Tailor DocSearch to match your brand and UX needs—colors, fonts, layouts, and even search behaviors are under your control. Drop-in CSS variables and simple JS hooks make it effortless to blend search seamlessly into any docs site.',
    img: 'customizable',
    large: false,
  },
  {
    title: 'A11y',
    description: 'DocSearch follows WAI-ARIA best practices to ensure full keyboard, screen-reader, and voice-control support. Delight every user with an inclusive search experience that\'s tested against WCAG 2.1 standards.',
    img: 'accessible',
    large: false,
  },
]

const footerCols = [
  {
    title: 'Docs',
    links: ['Getting Started', 'FAQ', 'DocSearch v3', 'DocSearch v4 - Beta'],
  },
  {
    title: 'DocSearch',
    links: ['Sign up', 'Issues', 'Privacy'],
  },
  {
    title: 'Community',
    links: ['Discord'],
  },
  {
    title: 'Social',
    links: ['GitHub', 'Twitter', 'Algolia Blog'],
  },
]
</script>

<template>
  <div class="docsearch-site">
    <!-- Announcement Bar -->
    <div class="announcement-bar">
      <div class="announcement-content">
        Ask AI is now part of <strong>Agent Studio</strong> - We're integrating Ask AI into Agent Studio, our centralized space to build and manage AI agents.
        <a href="#">Explore Agent Studio</a>
      </div>
      <button class="announcement-close" aria-label="Close">&times;</button>
    </div>

    <!-- Navbar -->
    <nav class="navbar">
      <div class="navbar-inner">
        <div class="navbar-left">
          <button class="navbar-toggle" aria-label="Toggle navigation bar">
            <svg width="30" height="30" viewBox="0 0 30 30"><path stroke="currentColor" stroke-linecap="round" stroke-miterlimit="10" stroke-width="2" d="M4 7h22M4 15h22M4 23h22"/></svg>
          </button>
          <a href="#" class="navbar-brand">
            <span class="brand-logo">DocSearch <span class="brand-x">x</span> Algolia</span>
          </a>
          <a href="#" class="navbar-link">Documentation</a>
          <a href="#" class="navbar-link">Playground</a>
          <a href="#" class="navbar-link navbar-signup">Sign up</a>
        </div>
        <div class="navbar-right">
          <div class="version-dropdown">
            <button class="version-btn">Stable (v4.x)</button>
          </div>
          <a href="#" class="navbar-link github-link" title="GitHub">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
          </a>
          <button class="theme-toggle" aria-label="Switch theme">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4C12.92 3.04 12.46 3 12 3z"/></svg>
          </button>
          <div class="search-bar">
            <button class="search-button">
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="8" stroke="currentColor" fill="none" stroke-width="1.4"/><path d="m21 21-4.3-4.3" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
              <span class="search-placeholder">Go on, give it a search...</span>
              <span class="search-keys">
                <kbd>Meta</kbd><kbd>K</kbd>
              </span>
            </button>
          </div>
        </div>
      </div>
    </nav>

    <main class="main-content">
      <!-- Hero -->
      <section class="hero-section">
        <div class="spotlight"></div>
        <div class="hero-container">
          <div class="hero-badge">
            <span class="sparkle">✨</span>
            <span class="badge-text">Celebrating 10 Years of DocSearch</span>
            <span class="sparkle">✨</span>
          </div>
          <h1 class="hero-title">Search Made For Documentation</h1>
          <p class="hero-subtitle">DocSearch by Algolia makes your docs and blogs instantly searchable—<strong>for free</strong>.</p>
          <div class="hero-cta">
            <a href="#" class="btn btn-secondary">Find out more</a>
            <a href="#" class="btn btn-primary">Sign up</a>
          </div>
          <div class="hero-video">
            <div class="video-container">
              <div class="video-placeholder">
                <div class="video-badge">DocSearch Demo</div>
              </div>
            </div>
            <div class="video-timeline">
              <div class="timeline-track">
                <div class="timeline-marker" style="left: 9%">
                  <div class="marker-dot"></div>
                  <span class="marker-label">Keyword</span>
                </div>
                <div class="timeline-marker" style="left: 37%">
                  <div class="marker-dot"></div>
                  <span class="marker-label">Ask AI</span>
                </div>
                <div class="timeline-marker" style="left: 65%">
                  <div class="marker-dot"></div>
                  <span class="marker-label">Conversations</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Trusted By -->
      <section class="trusted-section">
        <div class="section-header">
          <h2 class="section-title">Already trusted by your favorite docs</h2>
          <p class="section-subtitle">Join 7,000+ projects finding answers in milliseconds</p>
        </div>
        <div class="logo-grid">
          <a v-for="logo in partnerLogos" :key="logo.name" href="#" class="logo-card">
            <div class="logo-placeholder">{{ logo.name.charAt(0) }}</div>
            <span class="logo-name">{{ logo.name }}</span>
          </a>
        </div>
        <div class="trusted-more">
          <a href="#">...And <strong>much more!</strong></a>
        </div>
      </section>

      <!-- Features -->
      <section class="features-section">
        <div class="section-header">
          <h2 class="section-title">Solve docs challenges with a search engine</h2>
          <p class="section-subtitle">Docs are only helpful when your users can find answers easily. Enter DocSearch.</p>
        </div>
        <div class="features-grid">
          <div v-for="(feat, i) in features" :key="i" class="feature-card" :class="{ 'feature--large': feat.large }">
            <div class="feature-img">
              <span>{{ feat.img }}</span>
            </div>
            <div class="feature-body">
              <h3 class="feature-title">{{ feat.title }}</h3>
              <p class="feature-desc">{{ feat.description }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Ask AI / MCP -->
      <section class="ai-section">
        <div class="section-header">
          <h2 class="section-title">Expand your Docs beyond the search box</h2>
          <p class="section-subtitle">Power your documentation with AI</p>
        </div>
        <div class="ai-grid">
          <!-- Ask AI Card -->
          <div class="ai-card">
            <div class="ai-card-header">
              <div class="ai-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z"/></svg>
              </div>
              <span class="ai-card-title">Ask AI</span>
            </div>
            <p class="ai-card-desc">Get instant, AI-powered answers from your documentation. Ask natural language questions and receive accurate, context-aware responses.</p>
            <div class="ai-card-actions">
              <button class="btn btn-primary btn-sm">Try now</button>
              <a href="#" class="link-learn">Learn more &rarr;</a>
            </div>
          </div>

          <!-- MCP Server Card -->
          <div class="ai-card">
            <div class="ai-card-header">
              <div class="ai-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Zm.75-12h9v9h-9v-9Z"/></svg>
              </div>
              <span class="ai-card-title">MCP Server</span>
            </div>
            <p class="ai-card-desc">Connect your documentation to AI assistants like Claude and Cursor with the Model Context Protocol.</p>
            <div class="mcp-steps">
              <div v-for="step in ['Sign up with Algolia or use an existing app', 'Go to the MCP section under Generative AI', 'Create a new MCP server with your index', 'Use it anywhere']" :key="step" class="mcp-step">
                <span class="step-num">{{ ['Sign up with Algolia or use an existing app', 'Go to the MCP section under Generative AI', 'Create a new MCP server with your index', 'Use it anywhere'].indexOf(step) + 1 }}</span>
                <span>{{ step }}</span>
              </div>
            </div>
            <a href="#" class="link-learn">Learn more &rarr;</a>
          </div>
        </div>
      </section>

      <!-- Ctrl+K Section -->
      <section class="ctrlk-section">
        <div class="ctrlk-badge">
          Over 10 years of <kbd>Ctrl</kbd><kbd>K</kbd> – the OG search shortcut, still going strong
        </div>
        <div class="keypad">
          <div class="keypad-base">
            <div class="key key--ctrl">
              <span class="key-text">Ctrl</span>
            </div>
            <div class="key key--k">
              <span class="key-text">K</span>
            </div>
            <div class="key key--search">
              <span class="key-text">Search</span>
            </div>
          </div>
        </div>
        <h2 class="cta-title">Build faster with DocSearch</h2>
        <a href="#" class="btn btn-primary">Sign up for free</a>
      </section>
    </main>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-grid">
        <div v-for="col in footerCols" :key="col.title" class="footer-col">
          <h4 class="footer-col-title">{{ col.title }}</h4>
          <ul class="footer-links">
            <li v-for="link in col.links" :key="link"><a href="#">{{ link }}</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <div class="footer-logo">DocSearch x Algolia</div>
        <div class="footer-copyright">2015-2026 – Built with 💙 by Algolia</div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.docsearch-site {
  font-family: 'Sora', system-ui, -apple-system, sans-serif;
  color: #1a1a1a;
  background: #ffffff;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

/* Announcement Bar */
.announcement-bar {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  padding: 0.75rem 2rem;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.85rem; gap: 1rem;
}
.announcement-content a {
  color: white; font-weight: 600; margin-left: 0.5rem;
}
.announcement-close {
  background: none; border: none; color: white; font-size: 1.5rem;
  cursor: pointer; line-height: 1;
}

/* Navbar */
.navbar {
  position: sticky; top: 0; z-index: 100;
  background: rgba(255,255,255,0.85); backdrop-filter: blur(12px);
  border-bottom: 1px solid #e5e7eb;
  padding: 0 2rem;
}
.navbar-inner {
  max-width: 1400px; margin: 0 auto;
  display: flex; align-items: center; justify-content: space-between;
  height: 60px;
}
.navbar-left, .navbar-right { display: flex; align-items: center; gap: 1.5rem; }
.navbar-toggle { display: none; background: none; border: none; cursor: pointer; }
.brand-logo { font-weight: 700; font-size: 1.1rem; color: #1a1a1a; }
.brand-x { color: #2563eb; }
.navbar-link {
  text-decoration: none; color: #4b5563; font-size: 0.9rem; font-weight: 500;
  transition: color 0.2s;
}
.navbar-link:hover { color: #2563eb; }
.navbar-signup {
  color: #2563eb; font-weight: 600;
}
.version-btn {
  background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 6px;
  padding: 0.3rem 0.75rem; font-size: 0.8rem; cursor: pointer;
  font-family: inherit; color: #374151;
}
.github-link svg { display: block; }
.theme-toggle { background: none; border: none; cursor: pointer; color: #4b5563; }

/* Search Bar */
.search-button {
  display: flex; align-items: center; gap: 0.5rem;
  background: #f9fafb; border: 1px solid #d1d5db; border-radius: 8px;
  padding: 0.4rem 0.75rem; cursor: pointer; font-family: inherit;
  min-width: 240px; color: #9ca3af; font-size: 0.85rem;
}
.search-placeholder { flex: 1; text-align: left; }
.search-keys { display: flex; gap: 3px; }
.search-keys kbd {
  background: #e5e7eb; border: 1px solid #d1d5db; border-radius: 4px;
  padding: 1px 5px; font-size: 0.7rem; font-family: monospace;
}

/* Hero */
.hero-section {
  padding: 5rem 2rem 3rem;
  position: relative; overflow: hidden;
  text-align: center;
}
.spotlight {
  position: absolute; top: -40%; left: 10%;
  width: 120%; height: 150%;
  background: radial-gradient(ellipse at center, rgba(37,99,235,0.08) 0%, transparent 70%);
  pointer-events: none;
}
.hero-container {
  max-width: 900px; margin: 0 auto; position: relative; z-index: 1;
}
.hero-badge {
  display: flex; align-items: center; justify-content: center; gap: 0.5rem;
  margin-bottom: 1rem;
}
.sparkle { animation: pulse 2s ease-in-out infinite; }
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
.badge-text { color: #2563eb; font-weight: 600; font-size: 1.1rem; }
.hero-title {
  font-size: clamp(2.5rem, 7vw, 5rem); font-weight: 800; line-height: 1.1;
  background: linear-gradient(to top left, #171717, #525252);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  margin-bottom: 1rem;
}
.hero-subtitle { font-size: 1.15rem; color: #6b7280; margin-bottom: 2rem; }
.hero-cta { display: flex; gap: 1rem; justify-content: center; margin-bottom: 3rem; }

/* Buttons */
.btn {
  display: inline-flex; align-items: center; justify-content: center;
  height: 48px; padding: 0 1.5rem; border-radius: 8px;
  font-size: 0.9rem; font-weight: 600; font-family: inherit;
  text-decoration: none; cursor: pointer; transition: all 0.3s;
  min-width: 160px;
}
.btn-primary {
  background: linear-gradient(to top left, #2563eb, #3b82f6, #1d4ed8);
  color: white !important; border: 1px solid #93c5fd;
}
.btn-primary:hover { filter: brightness(1.1); }
.btn-secondary {
  background: white; color: #1a1a1a !important;
  border: 1px solid #d1d5db;
}
.btn-secondary:hover { background: #f9fafb; }
.btn-sm { height: 36px; padding: 0 1rem; font-size: 0.8rem; min-width: auto; }

/* Video */
.video-container {
  max-width: 800px; margin: 0 auto;
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  border-radius: 12px; height: 400px; display: flex;
  align-items: center; justify-content: center;
  position: relative; overflow: hidden;
}
.video-placeholder { color: #2563eb; font-weight: 600; font-size: 1.5rem; }
.video-timeline { max-width: 600px; margin: 1rem auto 0; }
.timeline-track {
  height: 4px; background: #e5e7eb; border-radius: 2px;
  position: relative; margin: 1rem 0;
}
.timeline-marker { position: absolute; top: -6px; transform: translateX(-50%); }
.marker-dot {
  width: 12px; height: 12px; background: #2563eb; border-radius: 50%;
  margin: 0 auto 4px;
}
.marker-label {
  font-size: 0.7rem; color: #2563eb; font-weight: 600; white-space: nowrap;
}

/* Sections */
.section-header { text-align: center; margin-bottom: 3rem; }
.section-title {
  font-size: clamp(1.8rem, 3.5vw, 2.5rem); font-weight: 700;
  color: #1a1a1a; margin-bottom: 0.75rem;
}
.section-subtitle { font-size: 1.1rem; color: #9ca3af; }

/* Trusted By */
.trusted-section { padding: 5rem 2rem; }
.logo-grid {
  max-width: 1200px; margin: 2rem auto;
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px;
  background: #e5e7eb; border-radius: 16px; overflow: hidden;
}
.logo-card {
  background: #fafafa; padding: 2rem; text-decoration: none;
  display: flex; flex-direction: column; align-items: center; gap: 0.75rem;
  transition: all 0.2s;
}
.logo-card:hover { background: #dbeafe; }
.logo-placeholder {
  width: 48px; height: 48px; border-radius: 12px;
  background: linear-gradient(135deg, #e5e7eb, #d1d5db);
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; color: #6b7280; font-size: 1.25rem;
}
.logo-name { font-size: 0.8rem; color: #9ca3af; font-weight: 500; }
.trusted-more { text-align: center; margin-top: 1.5rem; }
.trusted-more a { color: #9ca3af; text-decoration: none; font-size: 1.1rem; }
.trusted-more a:hover { color: #2563eb; }

/* Features Grid */
.features-section { padding: 5rem 2rem; background: #fafafa; }
.features-grid {
  max-width: 1200px; margin: 0 auto;
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;
}
.feature-card {
  background: white; border-radius: 16px; overflow: hidden;
  border: 1px solid #e5e7eb;
}
.feature--large { grid-column: 1 / -1; }
.feature-img {
  height: 200px; background: linear-gradient(135deg, #f0f4ff, #e8eeff);
  display: flex; align-items: center; justify-content: center;
  color: #93c5fd; font-size: 1.5rem; text-transform: uppercase; letter-spacing: 0.1em;
}
.feature-body { padding: 2rem; }
.feature-title {
  font-size: 1.25rem; font-weight: 700; color: #2563eb; margin-bottom: 0.75rem;
}
.feature-desc { font-size: 0.9rem; color: #6b7280; line-height: 1.7; }

/* AI Section */
.ai-section { padding: 5rem 2rem; }
.ai-grid {
  max-width: 900px; margin: 0 auto;
  display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;
}
.ai-card {
  background: white; border: 1px solid #e5e7eb; border-radius: 16px;
  padding: 1.5rem; transition: box-shadow 0.3s;
}
.ai-card:hover { box-shadow: 0 10px 40px rgba(37,99,235,0.1); }
.ai-card-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; }
.ai-icon {
  width: 36px; height: 36px; border-radius: 10px;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  display: flex; align-items: center; justify-content: center;
  color: white;
}
.ai-card-title { font-weight: 700; font-size: 1.1rem; }
.ai-card-desc { font-size: 0.85rem; color: #6b7280; margin-bottom: 1rem; line-height: 1.6; }
.ai-card-actions { display: flex; align-items: center; gap: 1rem; }
.link-learn {
  color: #2563eb; text-decoration: none; font-size: 0.85rem; font-weight: 500;
}
.link-learn:hover { text-decoration: underline; }
.mcp-steps { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem; }
.mcp-step { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; color: #6b7280; }
.step-num {
  width: 20px; height: 20px; border-radius: 50%;
  background: #dbeafe; color: #2563eb;
  font-size: 0.65rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

/* Ctrl+K */
.ctrlk-section { padding: 5rem 2rem; text-align: center; background: #fafafa; }
.ctrlk-badge {
  display: inline-block; background: #dbeafe; color: #1e40af;
  padding: 0.5rem 1.5rem; border-radius: 9999px; font-weight: 600;
  font-size: 1rem; margin-bottom: 3rem;
}
.ctrlk-badge kbd {
  background: white; border: 1px solid #d1d5db; border-radius: 4px;
  padding: 1px 6px; font-family: monospace; font-size: 0.9rem; margin: 0 2px;
}
.keypad { margin-bottom: 2rem; }
.keypad-base {
  display: flex; align-items: center; justify-content: center; gap: 1rem;
}
.key {
  border-radius: 12px; padding: 1rem 2rem; font-weight: 700;
  color: white; font-size: 1.5rem; cursor: pointer;
}
.key--ctrl { background: linear-gradient(135deg, #f59e0b, #d97706); }
.key--k { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
.key--search { background: linear-gradient(135deg, #ec4899, #db2777); font-size: 1rem; padding: 1rem 3rem; }
.key-text { display: block; }
.cta-title { font-size: 2rem; font-weight: 700; margin-bottom: 1.5rem; }

/* Footer */
.footer {
  background: #fafafa; border-top: 1px solid #e5e7eb;
  padding: 4rem 2rem 2rem;
}
.footer-grid {
  max-width: 1200px; margin: 0 auto 3rem;
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 2rem;
}
.footer-col-title { font-size: 0.85rem; font-weight: 700; color: #374151; margin-bottom: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; }
.footer-links { list-style: none; display: flex; flex-direction: column; gap: 0.5rem; }
.footer-links a { text-decoration: none; color: #6b7280; font-size: 0.85rem; }
.footer-links a:hover { color: #2563eb; }
.footer-bottom { max-width: 1200px; margin: 0 auto; text-align: center; padding-top: 2rem; border-top: 1px solid #e5e7eb; }
.footer-logo { font-weight: 700; color: #374151; margin-bottom: 0.5rem; }
.footer-copyright { font-size: 0.8rem; color: #9ca3af; }

@media (max-width: 768px) {
  .navbar-toggle { display: block; }
  .navbar-link { display: none; }
  .navbar-left { gap: 0.75rem; }
  .search-button { min-width: auto; }
  .search-placeholder { display: none; }
  .hero-section { padding: 3rem 1rem; }
  .hero-cta { flex-direction: column; align-items: center; }
  .logo-grid { grid-template-columns: repeat(2, 1fr); }
  .features-grid { grid-template-columns: 1fr; }
  .feature--large { grid-column: auto; }
  .ai-grid { grid-template-columns: 1fr; }
  .footer-grid { grid-template-columns: repeat(2, 1fr); }
  .navbar-right .version-btn { display: none; }
  .navbar-right .github-link { display: none; }
}
</style>
