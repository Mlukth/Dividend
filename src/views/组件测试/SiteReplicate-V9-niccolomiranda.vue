<script setup>
const workItems = [
  { title: 'The Books of Ye', desc: 'A conceptual NFT web experience depicting the five Books of Moses, in which each instance of God is replaced with Ye (Kanye West).', isNew: false },
  { title: 'Om Swami', desc: 'Om Swami is a spiritual leader, bestselling author and serial entrepreneur who resides in the Himalayan foothills.', isNew: false },
  { title: 'AvroKO', desc: 'AvroKO is an award-winning global design firm, established itself as a global leader in interior architecture for hospitality, restaurant and bars.', isNew: true },
]

const workItems2 = [
  { title: 'WOW Concept', desc: 'The world\'s first concept store based in Madrid revolutionizing retail with a dynamic & interactive shopping experience.', isNew: true },
  { title: 'The Roger Hub', desc: 'An immersive web experience showcasing the tennis-inspired On sneakers, a collaboration born out of a partnership with Roger Federer.', isNew: true },
  { title: 'Prada', desc: 'Prada Employees online store is an eCommerce outlet gathering previous Prada\'s collection seasons on a minimalist-based design.', isNew: false },
]

const upNext = [
  { title: 'Unexpected Time', desc: 'A classic-futuristic gamification web experience showcasing the lost history & culture in a world dominated by virtual reality.', isNew: false },
]

const testimonials = [
  { quote: '"Blurring the line between design & dev, Niccolo has an unmatched eye for detail and precise execution in his work which pushes the whole industry forward"', name: 'Sam Day', role: 'Creative Director & Designer' },
  { quote: '"Niccolò\'s eye for detail & design as well as his impeccable aesthetics, make him one of the leaders in today\'s digital design scene"', name: 'Sofia Papadopoulou', role: 'Designer & Art Director' },
  { quote: '"High-skilled designer who creates novel experiences with ease and craft. His signature is more vivid on each new project he launches and this is only the start"', name: 'Bruno Arizio', role: 'Creative Director at Studio BA' },
  { quote: '"A very promising Creative Director and Interactive Designer given his natural aesthetic taste and innate instinct for functionality"', name: 'Enea Rossi', role: 'Co-Founder at Adoratorio' },
]

const awards = [
  { label: 'Site of the day', subtitle: 'Awards', count: '9' },
  { label: 'Site of the month', subtitle: 'Winners', count: '1' },
  { label: 'FWA OF THE DAY', subtitle: 'Awards', count: '6' },
  { label: 'acclaimed', subtitle: 'Mentions', count: '8' },
]
</script>

<template>
  <div class="miranda-site" data-scroll-container>
    <!-- Nav -->
    <nav class="nav">
      <div class="nav-inner">
        <div class="nav-block-l">Amsterdam, NL</div>
        <a href="#" class="nav-brand">
          <svg width="70" height="30" viewBox="0 0 70 30" class="nav-logo">
            <circle cx="15" cy="15" r="12" fill="none" stroke="#cdc6be" stroke-width="1.5"/>
            <circle cx="35" cy="15" r="12" fill="none" stroke="#cdc6be" stroke-width="1.5"/>
            <circle cx="55" cy="15" r="12" fill="none" stroke="#cdc6be" stroke-width="1.5"/>
          </svg>
        </a>
        <div class="nav-block-r">
          <div class="nav-menu-toggle">
            <div class="nav-line"></div>
            <div class="nav-line"></div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Menu Overlay -->
    <div class="menu-overlay">
      <div class="menu-links">
        <a href="#" class="menu-link m-active">Index</a>
        <a href="#" class="menu-link">Work</a>
        <a href="#" class="menu-link">About</a>
      </div>
      <div class="menu-social">
        <a href="#">twitter</a> · <a href="#">instagram</a> · <a href="#">dribbble</a> · <a href="#">behance</a>
      </div>
    </div>

    <main class="main">
      <!-- Hero Grid -->
      <section class="hero-grid">
        <div class="hg-item hg-title">
          <h1 class="hero-name">Miranda</h1>
        </div>
        <div class="hg-item hg-intro">
          <div class="intro-block">
            <h2 class="intro-head">Interactive</h2>
            <h2 class="intro-sub">Artist!</h2>
            <div class="intro-divider"></div>
          </div>
          <div class="intro-avatar">
            <div class="avatar-placeholder blend-img"></div>
          </div>
        </div>
        <div class="hg-item hg-dropcap">
          <p class="dropcap-text"><span class="dropcap">A</span>s a multidisciplinary freelancer, I'm passionate about creating iconic digital experiences through motion, typography, and creative coding for companies and agencies around the world.</p>
        </div>
        <div class="hg-item hg-avatar2">
          <div class="avatar-placeholder2 blend-img"></div>
        </div>
        <div class="hg-item hg-roles">
          <h2 class="role-head">digital art director</h2>
          <h2 class="role-head">Interactive Designer</h2>
          <h2 class="role-head">creative developer</h2>
          <h2 class="role-head">based in <span class="under">Amsterdam, NL</span>.</h2>
          <div class="role-dividers">
            <span class="role-div"></span><span class="role-div"></span><span class="role-div"></span><span class="role-div"></span>
          </div>
        </div>
        <div class="hg-item hg-stamp">
          <h2 class="stamp-label">Website</h2>
          <div class="stamp-img blend-img">STAMP</div>
        </div>

        <!-- Up Next -->
        <div class="hg-item hg-upnext">
          <div class="upnext-header">
            <a href="#" class="doodle-link">
              <h3 class="doodle-title">Upcoming Next</h3>
              <svg viewBox="0 0 500 146" class="doodle-ellipse">
                <ellipse cx="250" cy="73" rx="242" ry="68" fill="none" stroke="#1d1d1b" stroke-width="2"/>
              </svg>
            </a>
            <p class="upnext-desc">Fresh entry – A selected work from the latest digital releases.</p>
          </div>
          <div v-for="item in upNext" :key="item.title" class="work-card">
            <div class="work-img-placeholder"></div>
            <div class="work-info">
              <div class="work-title">{{ item.title }}</div>
              <p class="work-desc">{{ item.desc }}</p>
            </div>
          </div>
        </div>

        <!-- Think Create -->
        <div class="hg-item hg-think">
          <div class="think-heads">
            <h2 class="think-title">Think, Create</h2>
            <h2 class="think-sub">Deliver</h2>
            <div class="think-dividers"><span></span><span></span></div>
          </div>
          <p class="dropcap-text"><span class="dropcap">A</span> strong project is created by deep collaboration. I design, develop, and deliver websites that drive results and win awards.</p>
          <p class="think-desc">Like an artisan, I like to start from raw matter and give life to an iconic product that makes your brand stand out, starting from a Visual Strategy that guide the client's vision to reality.</p>
          <a href="#" class="cta-btn">All Work <span class="cta-arrow">&rarr;</span></a>
        </div>
      </section>

      <!-- Awards Row -->
      <section class="awards-row">
        <a v-for="award in awards" :key="award.label" href="#" class="award-item">
          <div class="award-inner">
            <div class="award-label">{{ award.label }}</div>
            <div class="award-sub">{{ award.subtitle }}</div>
          </div>
          <div class="award-count">{{ award.count }}</div>
        </a>
      </section>

      <!-- The Pixel Perfect -->
      <section class="pixel-section">
        <div class="pixel-row-top">
          <div class="pixel-half">
            <div class="pixel-avatar4 blend-img"></div>
            <h2 class="pixel-the">The</h2>
          </div>
          <div class="pixel-half">
            <h2 class="pixel-pixel">pixel</h2>
          </div>
          <div class="pixel-half-r">
            <div class="pixel-avatar5 blend-img"></div>
          </div>
        </div>
        <div class="pixel-row-bottom">
          <div class="pixel-trophy blend-img"></div>
          <h2 class="pixel-perfect">perfect</h2>
        </div>
        <div class="pixel-row-text">
          <div class="pixel-artisan-block">
            <h2 class="artisan-label">artisan</h2>
          </div>
          <p class="pixel-desc">Over the past 5+ years, I've teamed up with high-profile clients and partners globally earning <a href="#" class="under">mentions & awards</a> from digital platforms like The FWA,</p>
          <a href="#" class="awwwards-link">Awwwards</a>
          <p class="pixel-desc">Communication Arts, Site Inspire, Behance, Codrops and many others.</p>
        </div>
      </section>

      <!-- Testimonials Carousel -->
      <section class="testimonials-section">
        <div v-for="(t, i) in testimonials" :key="t.name" class="testimonial-card" :style="{ transform: `translateX(${i * -22}vw)` }">
          <div class="testimonial-content">
            <div v-if="i === 0 || i === 1 || i === 3" class="testimonial-quote-mark">
              <svg viewBox="0 0 130 314" class="quote-svg"><path fill="#1d1d1b" d="M23.6 178.5c0 22 5.7 36 22.8 62l9.2-6.6c-9.6-15-9.6-23.8-9.6-35.2 0-17.6 20.1-33.5 43.3-56.7C110.7 120.5 130 96.3 130 63.8 130 29.5 102.9 0 64.3 0 37.2 0 16.6 10.6 0 22.9L10.5 55.4C19.7 33.4 35.9 15.4 59.5 15.4c20.6 0 36.8 11.9 36.8 33 0 22.9-18 36.5-40.3 59.3C30.6 134.6 23.6 150.8 23.6 178.5zM79.2 289.8L54.7 265.6 30.2 289.8l24.5 24.2z"/></svg>
            </div>
            <p class="testimonial-quote">{{ t.quote }}</p>
            <div class="testimonial-author">
              <div class="author-thumb"></div>
              <div class="author-info">
                <div class="author-name">{{ t.name }}</div>
                <div class="author-role">{{ t.role }}</div>
              </div>
            </div>
          </div>
          <div class="dash-border"></div>
        </div>
      </section>

      <!-- Sidebar Works -->
      <section class="sidebar-works">
        <div v-for="item in workItems2" :key="item.title" class="work-card">
          <div class="work-img-placeholder"></div>
          <div class="work-info">
            <div class="work-title">{{ item.title }} <span v-if="item.isNew" class="new-badge">New</span></div>
            <p class="work-desc">{{ item.desc }}</p>
          </div>
        </div>
        <a href="#" class="doodle-link">
          <h3 class="doodle-title">All Work!</h3>
          <svg viewBox="0 0 500 146" class="doodle-ellipse">
            <ellipse cx="250" cy="73" rx="242" ry="68" fill="none" stroke="#1d1d1b" stroke-width="2"/>
          </svg>
        </a>
        <p class="work-footer-desc">Handpicked highlights – spanning the last few years.</p>
      </section>
    </main>

    <!-- Marquee -->
    <div class="marquee">
      <div class="marquee-inner">
        <div class="marquee-content" v-for="i in 3" :key="i">
          <h4 class="marquee-label">Let's create something together</h4>
          <a href="mailto:info@niccolomiranda.com" class="marquee-email">Email Me</a>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-left">
        <div class="footer-brand">Miranda©</div>
        <div class="footer-year">2021</div>
        <div class="footer-stamp blend-img">STAMP</div>
        <a href="#" class="footer-legal">Legal</a>
      </div>
      <div class="footer-right">
        <a href="#">twitter</a> · <a href="#">instagram</a> · <a href="#">dribbble</a> · <a href="#">behance</a>
      </div>
    </footer>
  </div>
</template>

<style scoped>
*, *::after, *::before { box-sizing: border-box; margin: 0; padding: 0; }

@font-face {
  font-family: 'Canopee';
  src: url('https://cdn.prod.website-files.com/5f2429f172d117fcee10e819/610a9b7e7e08e1a0b88e42ed_Canopee.woff2') format('woff2');
  font-weight: 400; font-style: normal; font-display: swap;
}

.miranda-site {
  --ink: #1d1d1b;
  --paper: #cdc6be;
  --bg: #1d1d1b;
  --f-span-color: #96B59F;

  background: var(--bg); color: var(--ink);
  font-family: 'Canopee', 'Times New Roman', serif;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

/* Nav */
.nav { position: fixed; top: 0; left: 0; width: 100%; z-index: 100; }
.nav-inner {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1.5rem 2.5rem;
}
.nav-block-l, .nav-block-r { font-size: 0.75rem; color: var(--paper); letter-spacing: 0.06em; }
.nav-logo { display: block; }
.nav-menu-toggle { display: flex; flex-direction: column; gap: 6px; cursor: pointer; }
.nav-line { width: 24px; height: 1.5px; background: var(--paper); }

/* Menu */
.menu-overlay {
  position: fixed; inset: 0; z-index: 99;
  background: var(--paper); color: var(--ink);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  opacity: 0; pointer-events: none;
}
.menu-links { display: flex; flex-direction: column; gap: 1rem; text-align: center; }
.menu-link { font-size: 3rem; text-decoration: none; color: var(--ink); }
.menu-link.m-active { text-decoration: underline; }
.menu-social { margin-top: 2rem; font-size: 0.75rem; }
.menu-social a { color: var(--ink); text-decoration: none; }

/* Hero Grid */
.hero-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 0; padding: 6rem 2rem 2rem;
  background: var(--paper); color: var(--ink);
}

.hg-title { grid-column: span 3; }
.hero-name { font-family: 'Canopee', serif; font-size: clamp(3rem, 6vw, 5rem); line-height: 0.9; font-weight: 400; }

.hg-intro { grid-column: span 3; border-right: 1px solid rgba(0,0,0,0.1); padding-right: 2rem; }
.intro-head { font-size: 2rem; font-weight: 400; }
.intro-sub { font-size: 2rem; font-weight: 400; color: var(--f-span-color); }
.intro-divider { width: 40%; height: 1px; background: var(--ink); margin: 0.75rem 0; }
.intro-avatar { margin-top: 1rem; }
.avatar-placeholder { width: 100%; aspect-ratio: 1; background: rgba(0,0,0,0.06); border-radius: 4px; }

.hg-dropcap { grid-column: span 3; padding: 0 1.5rem; }
.dropcap-text { font-size: 0.85rem; line-height: 1.6; font-family: Georgia, serif; color: rgba(0,0,0,0.7); }
.dropcap {
  font-family: 'Canopee', serif; float: left;
  font-size: 4rem; line-height: 0.8; margin: 0.3rem 0.5rem 0.3rem 0;
  background: var(--ink); color: var(--paper); padding: 0.4rem 0.3rem 0.1rem;
}

.hg-avatar2 { grid-column: span 3; }
.avatar-placeholder2 { width: 100%; aspect-ratio: 3/4; background: rgba(0,0,0,0.06); border-radius: 4px; }

.hg-roles { grid-column: span 6; padding: 1.5rem 0 0 2rem; }
.role-head { font-family: 'Canopee', serif; font-size: 1.6rem; font-weight: 400; text-transform: uppercase; letter-spacing: 0.02em; }
.role-head .under { text-decoration: underline; text-underline-offset: 0.3vw; }
.role-dividers { display: flex; gap: 1px; margin-top: 1rem; }
.role-div { width: 18%; height: 1px; background: var(--ink); }

.hg-stamp { grid-column: span 3; text-align: right; padding: 1.5rem 0; }
.stamp-label { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.5rem; }
.stamp-img {
  font-size: 0.55rem; padding: 0.5rem; border: 1px dashed var(--ink);
  display: inline-block; border-radius: 3px;
}

/* Up Next */
.hg-upnext { grid-column: span 6; padding: 2rem 0; }
.doodle-link { text-decoration: none; color: inherit; display: inline-block; margin-bottom: 0.5rem; }
.doodle-title { font-size: 1.8rem; font-weight: 400; }
.doodle-ellipse { width: 200px; height: 60px; display: block; }
.upnext-desc { font-family: Georgia, serif; font-size: 0.8rem; color: rgba(0,0,0,0.6); margin-bottom: 1rem; }

.hg-think { grid-column: span 6; padding: 2rem 0 0 2rem; }
.think-heads { margin-bottom: 1rem; }
.think-title { font-size: 2.2rem; font-weight: 400; }
.think-sub { font-size: 2.2rem; font-weight: 400; color: var(--f-span-color); }
.think-dividers { display: flex; gap: 1px; margin: 0.5rem 0; }
.think-dividers span { width: 30%; height: 1px; background: var(--ink); }
.think-desc { font-family: Georgia, serif; font-size: 0.75rem; line-height: 1.6; color: rgba(0,0,0,0.7); margin-top: 0.5rem; }
.cta-btn {
  display: inline-block; margin-top: 1.5rem; text-decoration: none;
  color: var(--ink); font-size: 1.1rem; border-bottom: 1px solid var(--ink);
  padding-bottom: 0.25rem;
}

/* Work Cards */
.work-card { margin-bottom: 1.5rem; }
.work-img-placeholder { width: 100%; aspect-ratio: 16/10; background: rgba(0,0,0,0.05); border-radius: 4px; margin-bottom: 0.5rem; }
.work-title { font-size: 1.2rem; font-weight: 400; margin-bottom: 0.25rem; }
.new-badge { font-size: 0.55rem; background: var(--ink); color: var(--paper); padding: 0.1rem 0.35rem; border-radius: 2px; vertical-align: middle; }
.work-desc { font-family: Georgia, serif; font-size: 0.7rem; color: rgba(0,0,0,0.6); line-height: 1.4; }

/* Awards */
.awards-row {
  display: flex; justify-content: center; gap: 3rem;
  padding: 3rem 2rem; background: var(--paper);
  border-top: 1px solid rgba(0,0,0,0.06); border-bottom: 1px solid rgba(0,0,0,0.06);
}
.award-item { text-decoration: none; color: var(--ink); text-align: center; display: flex; gap: 1.5rem; align-items: center; }
.award-label { font-size: 0.5rem; text-transform: uppercase; letter-spacing: 0.1em; }
.award-sub { font-size: 0.7rem; }
.award-count { font-size: 2.5rem; line-height: 1; }

/* Pixel Section */
.pixel-section { background: var(--paper); padding: 3rem 2rem; }
.pixel-row-top { display: flex; gap: 1rem; align-items: flex-end; }
.pixel-row-bottom { display: flex; gap: 2rem; align-items: center; margin: 1rem 0; }
.pixel-half, .pixel-half-r { display: flex; flex-direction: column; }
.pixel-the { font-size: 3rem; font-weight: 400; }
.pixel-pixel { font-size: 3rem; font-weight: 400; color: var(--f-span-color); }
.pixel-perfect { font-size: clamp(3rem, 8vw, 7rem); font-weight: 400; }
.artisan-label { font-size: 3rem; font-weight: 400; background: var(--ink); color: var(--paper); display: inline-block; padding: 0.2rem 1rem; }
.pixel-desc { font-family: Georgia, serif; font-size: 0.8rem; line-height: 1.6; color: rgba(0,0,0,0.7); max-width: 400px; margin-top: 0.5rem; }
.awwwards-link { font-size: 1.8rem; color: var(--ink); text-decoration: none; display: inline-block; margin: 0.5rem 0; }
.pixel-avatar4, .pixel-avatar5, .pixel-trophy {
  width: 80px; height: 60px; background: rgba(0,0,0,0.06); border-radius: 4px;
}

/* Testimonials */
.testimonials-section {
  background: var(--ink); color: var(--paper);
  padding: 3rem 2rem; display: flex; gap: 2rem; overflow-x: auto;
}
.testimonial-card { min-width: 350px; position: relative; padding: 1.5rem; }
.testimonial-content { position: relative; z-index: 2; }
.testimonial-quote-mark { margin-bottom: 0.5rem; }
.quote-svg { width: 50px; height: auto; }
.testimonial-quote { font-family: Georgia, serif; font-size: 0.85rem; line-height: 1.6; margin-bottom: 1rem; }
.testimonial-author { display: flex; gap: 0.75rem; align-items: center; }
.author-thumb { width: 36px; height: 36px; border-radius: 50%; background: rgba(205,198,190,0.2); }
.author-name { font-size: 0.8rem; }
.author-role { font-size: 0.6rem; color: rgba(205,198,190,0.5); }
.dash-border {
  position: absolute; inset: 0; border-radius: 8px;
  border: 1px dashed rgba(205,198,190,0.2); z-index: 1;
}

/* Sidebar Works */
.sidebar-works {
  background: var(--ink); color: var(--paper);
  padding: 3rem 2rem;
}
.work-footer-desc { font-family: Georgia, serif; font-size: 0.7rem; color: rgba(205,198,190,0.5); margin-top: 1rem; }

/* Marquee */
.marquee {
  background: var(--paper); overflow: hidden; padding: 1.5rem 0;
  border-top: 1px solid rgba(0,0,0,0.06);
}
.marquee-inner { display: flex; animation: marqueeScroll 8s linear infinite; }
.marquee-inner:hover { animation-play-state: paused; }
.marquee-content { display: flex; gap: 2rem; align-items: center; flex-shrink: 0; padding-right: 2rem; }
.marquee-label { font-size: 0.8rem; font-weight: 400; white-space: nowrap; }
.marquee-email { font-size: 0.8rem; color: var(--ink); text-decoration: none; border-bottom: 1px solid var(--ink); }
@keyframes marqueeScroll {
  from { transform: translate3d(0,0,0); }
  to { transform: translate3d(-33.33%,0,0); }
}

/* Footer */
.footer { background: var(--paper); padding: 2rem; display: flex; justify-content: space-between; font-size: 0.65rem; }
.footer-left { display: flex; gap: 1.5rem; align-items: center; }
.footer-right { display: flex; gap: 0.5rem; }
.footer a { color: var(--ink); text-decoration: none; }
.footer-stamp { font-size: 0.5rem; border: 1px dashed var(--ink); padding: 0.2rem 0.4rem; }

/* Utility */
.blend-img { mix-blend-mode: multiply; }
.f-span { color: var(--f-span-color); }

@media (max-width: 991px) {
  .hero-grid { grid-template-columns: 1fr; gap: 2rem; padding: 5rem 1rem 2rem; }
  .hg-item { grid-column: span 1 !important; }
  .awards-row { gap: 1.5rem; flex-wrap: wrap; }
  .testimonials-section { flex-wrap: nowrap; overflow-x: scroll; }
  .nav-inner { padding: 1rem 1.5rem; }
}
</style>
