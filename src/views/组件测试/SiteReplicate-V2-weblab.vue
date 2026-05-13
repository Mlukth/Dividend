<template>
  <!--
    REPLICATED FROM: site.weblab.is (web.lab — MIT IAP course)
    Stack: Next.js + Tailwind CSS v3.4
    DNA: Dark academia glass morphism, metallic gradients, dot-grid background, Gilroy font
  -->
  <div class="wlab-root">
    <!-- Dot grid background -->
    <div class="wlab-dots"></div>

    <!-- ═══ NAV ═══ -->
    <nav class="wlab-nav">
      <div class="wlab-nav-inner">
        <a href="/" class="wlab-nav-brand" draggable="false">
          <svg width="24" height="24" viewBox="0 0 229 207" class="wlab-nav-logo">
            <polygon points="114.5,0 229,207 0,207" fill="none" stroke="#fff" stroke-width="12"/>
          </svg>
          <span class="wlab-nav-name">web.lab</span>
        </a>
        <ul class="wlab-nav-links">
          <li><a href="/schedule">schedule</a></li>
          <li><a href="/info">info</a></li>
          <li><a href="/team">team</a></li>
          <li><a href="/hof">hof</a></li>
        </ul>
      </div>
    </nav>

    <!-- ═══ HERO ═══ -->
    <section class="wlab-hero">
      <div class="wlab-jumbo"></div>

      <div class="wlab-hero-content">
        <!-- Left text -->
        <div class="wlab-hero-left">
          <a href="https://portal.weblab.is/" class="wlab-badge">
            registration is now open! <span>→</span>
          </a>
          <h1 class="wlab-hero-h1">
            learn web dev.<br/>win cash prizes.<br/>all in 4 weeks.
          </h1>
          <div class="wlab-hero-btns">
            <a href="https://portal.weblab.is/" class="wlab-btn wlab-btn-white">register now</a>
            <a href="https://weblab.is/piazza" class="wlab-btn wlab-btn-ghost">join piazza</a>
          </div>
        </div>

        <!-- Terminal window -->
        <div class="wlab-terminal">
          <div class="wlab-term-bar">
            <span class="wlab-term-dot red"></span>
            <span class="wlab-term-dot yellow"></span>
            <span class="wlab-term-dot green"></span>
            <span class="wlab-term-tab active">utilities.js</span>
            <span class="wlab-term-tab">utilities.css</span>
            <span class="wlab-term-tab">index.js</span>
          </div>
          <div class="wlab-term-body">
            <div class="wlab-term-line"><span class="wlab-term-keyword">import</span> express <span class="wlab-term-keyword">from</span> <span class="wlab-term-string">'express'</span>;</div>
            <div class="wlab-term-line"><span class="wlab-term-keyword">const</span> app = <span class="wlab-term-fn">express</span>();</div>
            <div class="wlab-term-line"></div>
            <div class="wlab-term-line">app.<span class="wlab-term-fn">get</span>(<span class="wlab-term-string">'/'</span>, (req, res) => {</div>
            <div class="wlab-term-line">&nbsp;&nbsp;res.<span class="wlab-term-fn">send</span>(<span class="wlab-term-string">'Hello web.lab!'</span>);</div>
            <div class="wlab-term-line">});</div>
            <div class="wlab-term-line"></div>
            <div class="wlab-term-line">app.<span class="wlab-term-fn">listen</span>(<span class="wlab-term-num">3000</span>, () => {</div>
            <div class="wlab-term-line">&nbsp;&nbsp;console.<span class="wlab-term-fn">log</span>(<span class="wlab-term-string">'Server running'</span>);</div>
            <div class="wlab-term-line">});</div>
          </div>
        </div>
      </div>

      <!-- Sponsors -->
      <div class="wlab-sponsors">
        <a href="mailto:weblab-staff@mit.edu" class="wlab-sponsor-cta">become a sponsor :)</a>
        <div class="wlab-sponsor-logos">
          <span class="wlab-sponsor-logo">Akamai</span>
          <span class="wlab-sponsor-logo">Delve</span>
          <span class="wlab-sponsor-logo">HackMIT</span>
          <span class="wlab-sponsor-logo">Enhearten</span>
        </div>
      </div>
    </section>

    <!-- ═══ WHAT IS WEB.LAB ═══ -->
    <section class="wlab-section">
      <div class="wlab-card wlab-card-horiz">
        <div class="wlab-card-text">
          <h2 class="wlab-card-title">what is web.lab?</h2>
          <p class="wlab-card-desc">
            at its core, web.lab is a 6-unit MIT IAP class that teaches the fundamentals of web development.
            it lays the foundations for understanding complicated web technologies and allows enrolled students
            to take part in a competition to win cash and glory!
          </p>
        </div>
        <div class="wlab-card-thumb">
          <div class="wlab-thumb-placeholder">web.lab</div>
        </div>
      </div>
    </section>

    <!-- ═══ WHO + WHY ═══ -->
    <section class="wlab-section wlab-grid-2col">
      <div class="wlab-card">
        <div class="wlab-card-text">
          <h2 class="wlab-card-title">who can take web.lab?</h2>
          <p class="wlab-card-desc">
            students of all skill levels who are registered/cross-registered at MIT and are officially enrolled
            for web.lab can participate. at least one team member must be available on campus during the final
            week of IAP to present their team's website to the judges.
          </p>
        </div>
      </div>
      <div class="wlab-card">
        <div class="wlab-card-text">
          <h2 class="wlab-card-title">why web.lab?</h2>
          <p class="wlab-card-desc">
            web.lab teaches you valuable skills to establish your presence on the web. in addition to glory and
            fame, winners of web.lab get cash prizes and many times even receive job offers. we strongly recommend
            entering the competition and giving it your best effort through IAP :)
          </p>
        </div>
      </div>
    </section>

    <!-- ═══ HOW WILL WEB.LAB WORK ═══ -->
    <section class="wlab-section wlab-grid-2col">
      <div class="wlab-card wlab-card-tall">
        <div class="wlab-card-text">
          <h2 class="wlab-card-title">how will web.lab work?</h2>
          <ul class="wlab-phases">
            <li class="wlab-phase">
              <span class="wlab-phase-num">phase 0:</span>
              <span class="wlab-phase-title">team selection</span>
              <p class="wlab-phase-desc">form teams of up to three members. team members should contribute an appropriate amount to receive individual credit for the course.</p>
            </li>
            <li class="wlab-phase">
              <span class="wlab-phase-num">phase 1:</span>
              <span class="wlab-phase-title">learning</span>
              <p class="wlab-phase-desc">the learning phase of web.lab lasts for the first two weeks of IAP, with lectures and workshops every day. the first week goes over fundamental topics while the second week dives into more advanced topics and sponsor lectures.</p>
            </li>
            <li class="wlab-phase">
              <span class="wlab-phase-num">phase 2:</span>
              <span class="wlab-phase-title">competition</span>
              <p class="wlab-phase-desc">for the last two weeks of IAP, teams build their own web apps to enter into the competition!</p>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- ═══ PRIZES ═══ -->
    <section class="wlab-section">
      <div class="wlab-card wlab-prizes-card">
        <h2 class="wlab-card-title wlab-text-center">alright, what are the prizes?</h2>

        <!-- Top 4 -->
        <div class="wlab-prizes-top">
          <div class="wlab-prize-box gold" v-for="(prize, i) in topPrizes" :key="i">
            <span class="wlab-prize-rank">{{ i + 1 }}</span>
            <span class="wlab-prize-amount">${{ prize.amount }}</span>
          </div>
        </div>

        <!-- Special categories -->
        <div class="wlab-prizes-special">
          <div class="wlab-prize-row" v-for="(cat, i) in specialPrizes" :key="i" :style="{ backgroundImage: cat.gradient }">
            <span class="wlab-prize-cat">{{ cat.name }}</span>
            <span class="wlab-prize-cat-amount">${{ cat.amount }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ CTA ═══ -->
    <section class="wlab-section">
      <div class="wlab-card wlab-cta-card">
        <div class="wlab-cta-grid-bg"></div>
        <h2 class="wlab-card-title wlab-text-center">what're you waiting for?</h2>
        <div class="wlab-cta-btns">
          <a href="https://portal.weblab.is/" class="wlab-btn wlab-btn-white">register now</a>
          <a href="https://weblab.is/piazza" class="wlab-btn wlab-btn-ghost">join piazza</a>
        </div>
      </div>
    </section>

    <!-- ═══ FOOTER ═══ -->
    <footer class="wlab-footer">
      <div class="wlab-footer-inner">
        <a href="/" class="wlab-nav-brand">
          <svg width="24" height="24" viewBox="0 0 229 207" class="wlab-nav-logo">
            <polygon points="114.5,0 229,207 0,207" fill="none" stroke="#fff" stroke-width="12"/>
          </svg>
          web.lab
        </a>
        <div class="wlab-footer-socials">
          <a href="https://github.com/weblab-class" target="_blank">GitHub</a>
          <a href="mailto:weblab-staff@mit.edu" target="_blank">Email</a>
          <a href="https://www.youtube.com/@mitweblab" target="_blank">YouTube</a>
          <a href="https://instagram.com/mitweblab" target="_blank">Instagram</a>
        </div>
        <span class="wlab-footer-copy">
          © 2026 web.lab<br/>
          <a href="https://accessibility.mit.edu/" target="_blank">accessibility</a>
        </span>
      </div>
    </footer>
  </div>
</template>

<script setup>
const topPrizes = [
  { amount: '4,000' },
  { amount: '3,000' },
  { amount: '2,000' },
  { amount: '1,000' },
]

const specialPrizes = [
  { name: 'honorable mention', amount: '500', gradient: 'linear-gradient(135deg, #343a40, #212529, #495057)' },
  { name: 'most unique concept', amount: '500', gradient: 'linear-gradient(135deg, #f27059, #f25c54, #f4845f)' },
  { name: 'most responsive ui design', amount: '500', gradient: 'linear-gradient(135deg, #9f86c0, #5e548e, #e0b1cb)' },
  { name: 'most innovative frontend', amount: '500', gradient: 'linear-gradient(135deg, #1e6091, #184e77, #1a759f)' },
  { name: 'most innovative backend', amount: '500', gradient: 'linear-gradient(135deg, #800f2f, #590d22, #a4133c)' },
  { name: "people's choice award", amount: '250', gradient: 'linear-gradient(135deg, #065a60, #0b525b, #006466)' },
  { name: 'best social impact', amount: '100/member', gradient: 'linear-gradient(135deg, #de7a3f, #f3a25f, #dfc7b0)' },
]
</script>

<style scoped>
/* ═══════════════════════════════════════════════
   site.weblab.is — Tailwind CSS v3.4 replication
   Fonts: Gilroy (custom), Inter
   Colors: neutral-950 (#0a0a0a) background
   Design: glass morphism, metallic gradients, dot grid
   ═══════════════════════════════════════════════ */

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

/* Gilroy substitute — geometric sans */
@font-face {
  font-family: 'Gilroy';
  src: local('Century Gothic'), local('Futura'), local('Segoe UI');
  font-weight: 100 900;
}

.wlab-root {
  position: fixed; inset: 0; top: 60px;
  background: #0a0a0a;
  color: #fff;
  font-family: 'Gilroy', 'Inter', 'PingFang SC', system-ui, sans-serif;
  font-weight: 400;
  letter-spacing: -0.05em;
  overflow-y: auto; overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
  color-scheme: dark;
}
.wlab-root::-webkit-scrollbar { width: 4px; }
.wlab-root::-webkit-scrollbar-thumb { background: #1a1a1a; }

/* ── Dot grid ── */
.wlab-dots {
  position: fixed; inset: 0; pointer-events: none; z-index: 0;
  background-size: 50px 50px;
  background-image: radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px);
}

/* ── Nav ── */
.wlab-nav {
  position: fixed; top: 60px; left: 0; right: 0; z-index: 10;
  height: 64px; display: flex; align-items: center; justify-content: center;
  border-bottom: 1px solid transparent;
  background: transparent;
  padding: 0 24px;
}
.wlab-nav-inner {
  display: flex; align-items: center; width: 100%; max-width: 1280px;
}
.wlab-nav-brand {
  display: flex; align-items: center; gap: 8px;
  font-size: 20px; font-weight: 600; color: #fff;
  text-decoration: none;
}
.wlab-nav-logo { width: 24px; height: auto; display: block; }
.wlab-nav-name { display: none; }
@media (min-width: 1024px) { .wlab-nav-name { display: block; } }

.wlab-nav-links {
  display: flex; align-items: center; justify-content: flex-end;
  gap: 24px; list-style: none; margin: 0 0 0 auto; padding: 0;
}
.wlab-nav-links a {
  font-size: 14px; color: #fff; text-decoration: none;
  letter-spacing: -0.025em;
}

/* ── Jumbo background ── */
.wlab-jumbo {
  position: absolute; inset: 0; z-index: 0; overflow: hidden; opacity: 0.5;
}
.wlab-jumbo::before {
  content: ''; position: absolute; inset: -10px;
  background:
    repeating-linear-gradient(100deg, #000 0%, #000 7%, transparent 10%, transparent 12%, #000 16%),
    repeating-linear-gradient(100deg, #60a5fa 10%, #e879f9 15%, #60a5fa 20%, #5eead4 25%, #60a5fa 30%);
  background-size: 300%, 200%;
  filter: blur(10px) opacity(0.5) saturate(2);
  mask-image: radial-gradient(ellipse at 100% 0, #000 40%, transparent 70%);
}

/* ── Hero ── */
.wlab-hero {
  position: relative; z-index: 1;
  display: flex; flex-direction: column; align-items: center;
  min-height: 100vh; padding: 100px 24px 48px;
}
.wlab-hero-content {
  display: flex; flex-direction: column; align-items: center;
  gap: 48px; width: 100%; max-width: 1280px;
}
@media (min-width: 1024px) {
  .wlab-hero-content { flex-direction: row; gap: 48px; }
}
.wlab-hero-left {
  display: flex; flex-direction: column; align-items: center;
  gap: 16px; white-space: nowrap;
}
@media (min-width: 1024px) {
  .wlab-hero-left { align-items: flex-start; }
}

.wlab-badge {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 16px; border-radius: 16px;
  border: 1px solid #404040;
  background: transparent; backdrop-filter: blur(16px);
  font-size: 13px; color: #a3a3a3; letter-spacing: 0;
  text-decoration: none;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}
.wlab-hero-h1 {
  z-index: 1; text-align: center;
  font-size: 48px; font-weight: 600; letter-spacing: -0.05em;
  line-height: 1.1; margin: 0;
}
@media (min-width: 1024px) { .wlab-hero-h1 { text-align: left; font-size: 60px; } }
@media (min-width: 1536px) { .wlab-hero-h1 { font-size: 72px; } }

.wlab-hero-btns { display: flex; gap: 12px; width: 100%; }
.wlab-btn {
  z-index: 1; padding: 10px 24px; border-radius: 16px;
  border: 1px solid #404040;
  font-size: 14px; font-weight: 500; letter-spacing: -0.025em;
  text-decoration: none; text-align: center;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  flex: 1;
}
@media (min-width: 1024px) { .wlab-btn { flex: 0 0 33%; } }
.wlab-btn-white {
  background: #fff; color: #000;
}
.wlab-btn-white:hover { background: rgba(255,255,255,0.75); }
.wlab-btn-ghost {
  background: transparent; color: #fff;
  backdrop-filter: brightness(0.5);
}
.wlab-btn-ghost:hover { background: rgba(255,255,255,0.1); }

/* ── Terminal ── */
.wlab-terminal {
  width: 100%; border-radius: 8px; border: 1px solid #171717;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(64px) brightness(0.75);
  overflow: hidden;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
}
@media (min-width: 640px) { .wlab-terminal { height: 400px; } }
@media (min-width: 1536px) { .wlab-terminal { height: 475px; } }
.wlab-term-bar {
  position: sticky; top: 0; display: flex; align-items: center; height: 40px;
}
.wlab-term-dot { width: 12px; height: 12px; border-radius: 50%; margin-left: 8px; }
.wlab-term-dot.red { background: #ef4444; }
.wlab-term-dot.yellow { background: #eab308; }
.wlab-term-dot.green { background: #22c55e; }
.wlab-term-dot:first-child { margin-left: 16px; }
.wlab-term-tab {
  padding: 0 16px; height: 100%; display: flex; align-items: center;
  font-size: 14px; color: #a3a3a3; letter-spacing: -0.025em;
  border-bottom: 1px solid transparent; cursor: pointer;
}
.wlab-term-tab.active { border-bottom-color: #1e3a5f; background: rgba(255,255,255,0.05); }
.wlab-term-body {
  padding: 16px; font-family: 'SF Mono', 'Consolas', 'Liberation Mono', monospace;
  font-size: 13px; line-height: 1.7; overflow-y: auto; height: calc(100% - 40px);
  color: #d4d4d4;
}
.wlab-term-keyword { color: #c084fc; }
.wlab-term-string { color: #86efac; }
.wlab-term-fn { color: #60a5fa; }
.wlab-term-num { color: #fb923c; }

/* ── Sponsors ── */
.wlab-sponsors {
  display: flex; flex-direction: column; align-items: center; gap: 16px;
  margin-top: 48px;
}
.wlab-sponsor-cta {
  font-size: 18px; font-weight: 500; color: rgba(255,255,255,0.5);
  text-decoration: none; transition: color 0.3s;
}
.wlab-sponsor-cta:hover { color: #fff; }
.wlab-sponsor-logos {
  display: flex; flex-wrap: wrap; justify-content: center; gap: 48px;
}
@media (min-width: 640px) { .wlab-sponsor-logos { gap: 48px; } }
.wlab-sponsor-logo {
  font-size: 14px; color: #555; filter: grayscale(1);
  transition: all 0.3s;
}
.wlab-sponsor-logo:hover { color: #aaa; filter: grayscale(0); }

/* ── Sections ── */
.wlab-section {
  position: relative; z-index: 1;
  padding: 0 24px; margin-bottom: 32px; max-width: 1280px;
}
@media (min-width: 1024px) { .wlab-section { padding: 0 64px; } }
.wlab-grid-2col {
  display: grid; grid-template-columns: 1fr; gap: 32px;
}
@media (min-width: 768px) { .wlab-grid-2col { grid-template-columns: 1fr 1fr; } }

/* ── Cards ── */
.wlab-card {
  border-radius: 16px; border: 1px solid #171717;
  background: transparent; backdrop-filter: blur(1px);
  padding: 24px;
  transition: all 0.3s ease;
}
.wlab-card:hover { border-color: #404040; backdrop-filter: brightness(1.25) blur(1px); }
@media (min-width: 1024px) { .wlab-card { padding: 32px; } }
@media (min-width: 1536px) { .wlab-card { padding: 64px 48px; } }

.wlab-card-horiz {
  display: flex; flex-direction: column-reverse; align-items: center;
  gap: 16px;
}
@media (min-width: 640px) { .wlab-card-horiz { flex-direction: row; } }
.wlab-card-text { display: flex; flex-direction: column; gap: 16px; }
@media (min-width: 1024px) { .wlab-card-text { gap: 32px; } }
.wlab-card-title {
  font-size: 30px; font-weight: 600; letter-spacing: -0.05em; margin: 0;
}
@media (min-width: 1024px) { .wlab-card-title { font-size: 36px; } }
@media (min-width: 1536px) { .wlab-card-title { font-size: 48px; } }
.wlab-card-desc {
  font-size: 14px; line-height: 1.6; color: #a3a3a3;
  letter-spacing: -0.025em; margin: 0;
}
@media (min-width: 768px) { .wlab-card-desc { font-size: 16px; } }
@media (min-width: 1024px) { .wlab-card-desc { font-size: 18px; } }

.wlab-card-thumb {
  aspect-ratio: 16/9; width: 100%;
  border-radius: 12px; border: 1px solid #171717;
  overflow: hidden; position: relative;
  transition: border-color 0.3s;
}
.wlab-card:hover .wlab-card-thumb { border-color: #404040; }
.wlab-thumb-placeholder {
  width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
  background: #1a1a1a; color: #333; font-size: 32px; font-weight: 700;
}

/* ── Phases ── */
.wlab-card-tall {
  grid-column: 1 / -1;
}
.wlab-phases {
  display: flex; flex-direction: column; justify-content: space-between;
  gap: 16px; list-style: none; padding: 0; margin: 0;
}
.wlab-phase {
  display: flex; flex-direction: column; gap: 4px;
}
.wlab-phase-num {
  font-size: 16px; font-weight: 600; color: #737373;
  letter-spacing: -0.025em; transition: color 0.3s;
}
.wlab-phase:hover .wlab-phase-num { color: #d4d4d4; }
.wlab-phase-title {
  font-size: 14px; font-weight: 600; color: #737373;
  letter-spacing: -0.025em; transition: color 0.3s;
}
.wlab-phase:hover .wlab-phase-title { color: #d4d4d4; }
.wlab-phase-desc {
  font-size: 14px; color: #525252; letter-spacing: -0.025em;
  margin: 0; transition: color 0.3s;
}
.wlab-phase:hover .wlab-phase-desc { color: #a3a3a3; }

/* ── Prizes ── */
.wlab-prizes-card { position: relative; overflow: hidden; }
.wlab-text-center { text-align: center; }

.wlab-prizes-top {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;
  margin-top: 32px;
}
@media (min-width: 640px) { .wlab-prizes-top { grid-template-columns: repeat(4, 1fr); } }
.wlab-prize-box {
  position: relative; aspect-ratio: 1; display: flex;
  flex-direction: column; align-items: center; justify-content: center;
  border-radius: 12px; border: 1px solid #171717;
  overflow: hidden; transition: all 0.3s ease;
}
.wlab-prize-box:hover { transform: translateY(-2px); filter: brightness(1.3); }
.wlab-prize-box.gold:nth-child(1) { background: linear-gradient(135deg, #C5AB50, #AC933E, #FBF8AE); }
.wlab-prize-box.gold:nth-child(2) { background: linear-gradient(135deg, #B4B9BE, #716F71, #A8A9AD); }
.wlab-prize-box.gold:nth-child(3) { background: linear-gradient(135deg, #A97142, #6E3A06, #B08D57); }
.wlab-prize-box.gold:nth-child(4) { background: linear-gradient(135deg, #DC826B, #CB6A52, #FFE4BB); }
.wlab-prize-rank {
  position: absolute; font-size: 72px; font-weight: 600;
  color: rgba(255,255,255,0.1); pointer-events: none;
}
@media (min-width: 1024px) { .wlab-prize-rank { font-size: 80px; } }
.wlab-prize-amount {
  position: relative; z-index: 1;
  font-size: 28px; font-weight: 600; color: rgba(229,229,229,0.9);
}
@media (min-width: 1024px) { .wlab-prize-amount { font-size: 36px; } }

.wlab-prizes-special {
  display: flex; flex-direction: column; gap: 16px; margin-top: 24px;
}
.wlab-prize-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 24px; border-radius: 12px;
  border: 1px solid #171717; color: #e5e5e5;
  transition: all 0.3s ease; font-size: 22px; font-weight: 600;
}
.wlab-prize-row:hover { transform: translateY(-2px); filter: brightness(1.3); }
.wlab-prize-cat { }
.wlab-prize-cat-amount { }

/* ── CTA card ── */
.wlab-cta-card {
  position: relative; overflow: hidden;
  text-align: center; padding: 48px 24px;
}
.wlab-cta-grid-bg {
  position: absolute; inset: 0; z-index: -1;
  width: 100%; height: 640px;
  background-image:
    linear-gradient(90deg, rgba(42,42,42,0.4) 1px, transparent 0),
    linear-gradient(180deg, rgba(42,42,42,0.4) 1px, transparent 0);
  background-size: 65px 40px;
  transform-origin: 100% 0;
  animation: wlab-grid-scroll 5s linear infinite;
  filter: blur(1px);
}
@keyframes wlab-grid-scroll {
  0% { transform: perspective(450px) rotateX(35deg) translateY(0); }
  100% { transform: perspective(450px) rotateX(35deg) translateY(-50%); }
}
.wlab-cta-btns {
  display: flex; gap: 12px; justify-content: center; margin-top: 24px;
}

/* ── Footer ── */
.wlab-footer {
  position: relative; z-index: 1;
  border-top: 1px solid rgba(23,23,23,0.5);
  backdrop-filter: blur(4px);
  padding: 48px 24px;
}
.wlab-footer-inner {
  max-width: 1280px; margin: 0 auto;
  display: flex; flex-direction: column; align-items: center; gap: 24px;
}
.wlab-footer-socials {
  display: flex; gap: 24px;
}
.wlab-footer-socials a {
  font-size: 14px; font-weight: 500; color: #a3a3a3;
  text-decoration: none; letter-spacing: -0.05em;
  transition: color 0.3s;
}
.wlab-footer-socials a:hover { color: #fff; }
.wlab-footer-copy {
  font-size: 14px; font-weight: 600; color: #a3a3a3;
  text-align: center;
}
.wlab-footer-copy a {
  font-weight: 400; color: #a3a3a3; text-decoration: none;
}
.wlab-footer-copy a:hover { color: #fff; text-decoration: underline; }
</style>
