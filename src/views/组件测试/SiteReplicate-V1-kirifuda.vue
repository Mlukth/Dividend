<template>
  <!--
    REPLICATED FROM: kirifuda.co.jp (株式会社切札)
    Based on noscript fallback CSS — exact typography, spacing, layout ratios
    Fonts: Oswald (headings), Padauk (labels/values), Noto Sans JP (body JP), Almarai (body EN)
  -->
  <div class="kiri-root">
    <!-- ═══ HEADER ═══ -->
    <header class="kiri-header">
      <a href="#" class="kiri-logo-link">
        <svg width="38" height="51" viewBox="0 0 38 51" class="kiri-logo-img">
          <rect x="2" y="2" width="34" height="47" rx="3" fill="none" stroke="#fff" stroke-width="1.5"/>
          <line x1="10" y1="16" x2="28" y2="16" stroke="#fff" stroke-width="1.2"/>
          <line x1="10" y1="24" x2="28" y2="24" stroke="#fff" stroke-width="1.2"/>
          <line x1="10" y1="32" x2="22" y2="32" stroke="#fff" stroke-width="1.2"/>
          <line x1="10" y1="40" x2="26" y2="40" stroke="#fff" stroke-width="1.2"/>
        </svg>
      </a>
      <ul class="kiri-nav-list">
        <li><a href="#works" class="kiri-nav-a">WORKS</a></li>
        <li><a href="#about" class="kiri-nav-a">ABOUT</a></li>
        <li><a href="#contact" class="kiri-nav-a">CONTACT</a></li>
      </ul>
      <a href="https://twitter.com/kirifuda_inc" target="_blank" rel="noopener" class="kiri-sns kiri-sns-tw">Tw</a>
      <a href="https://www.facebook.com/kirifuda.co.jp" target="_blank" rel="noopener" class="kiri-sns kiri-sns-fb">Fb</a>
      <a href="https://www.instagram.com/kirifuda_13/" target="_blank" rel="noopener" class="kiri-sns kiri-sns-ig">Ig</a>
    </header>

    <!-- ═══ MAIN ═══ -->
    <main id="nogl_contents" class="kiri-main">
      <!-- Hero -->
      <div class="kiri-hero-wrap">
        <h1 class="kiri-hero-h1">kirifuda inc.</h1>
        <p class="kiri-hero-desc">CRAFTING DIGITAL EXPERIENCES THROUGH DESIGN AND TECHNOLOGY.</p>
      </div>

      <!-- ═══ WORKS ═══ -->
      <section id="works">
        <h2 class="kiri-works-title">WORKS</h2>

        <a v-for="(work, i) in works" :key="i" class="kiri-work-box" href="/works/kajima-dxlabo/">
          <div class="kiri-work-info">
            <div class="kiri-work-row">
              <span class="kiri-work-label">CLIENT</span>
              <span class="kiri-work-value kiri-work-client">{{ work.client }}</span>
            </div>
            <div class="kiri-work-row">
              <span class="kiri-work-label">TYPE</span>
              <span class="kiri-work-value">{{ work.type }}</span>
            </div>
            <div class="kiri-work-row">
              <span class="kiri-work-label">AGENCY</span>
              <span class="kiri-work-value">{{ work.agency }}</span>
            </div>
            <div class="kiri-work-row">
              <span class="kiri-work-label">RELEASE</span>
              <span class="kiri-work-value">{{ work.release }}</span>
            </div>
          </div>
          <div class="kiri-work-name">
            <h3 v-if="work.subtitle" class="kiri-work-sub">{{ work.subtitle }}</h3>
            <h2 class="kiri-work-name-b">{{ work.title }}</h2>
          </div>
        </a>
      </section>

      <!-- ═══ ABOUT US ═══ -->
      <section id="about">
        <h2 class="kiri-about-title">ABOUT US</h2>
        <div class="kiri-about-contents">
          <p class="kiri-about-heading">WHO WE ARE</p>
          <p class="kiri-about-body-jp">株式会社切札は、デザインとテクノロジーを用いた制作および開発を行うクリエイティブ集団です。<br/>Webサイト・スマートフォンアプリ・映像・デジタルサイネージ・インスタレーション・XRなど、さまざまなデジタル広告制作業務を行なっています。</p>
          <p class="kiri-about-body-en">We are a creative digital studio that crafts digital experiences through design and technology. We focus on Websites, apps, interactive videos, installations, VR &amp; AR experiences.</p>

          <p class="kiri-about-heading">OUR CREWS</p>
          <div v-for="(m, i) in crew" :key="i">
            <p class="kiri-crew-role">{{ m.role }}</p>
            <p class="kiri-crew-name">{{ m.name }}</p>
          </div>

          <p class="kiri-about-heading">AWARDS</p>
          <ul class="kiri-awards-ul">
            <li v-for="(a, i) in awards" :key="i" class="kiri-awards-li">{{ a }}</li>
          </ul>

          <p class="kiri-about-heading">COMPANY PROFILE</p>
          <div v-for="(item, i) in profile" :key="i">
            <p class="kiri-profile-label">{{ item.label }}</p>
            <p class="kiri-profile-value" v-html="item.value"></p>
          </div>
        </div>
      </section>
    </main>

    <!-- ═══ CONTACT ═══ -->
    <section id="contact" class="kiri-contact-wrap">
      <div class="kiri-contact-inner">
        <div class="kiri-contact-title-span">
          <p class="kiri-contact-title">CON<span class="kiri-contact-ta">T</span>ACT</p>
        </div>
        <div class="kiri-contact-desc-box">
          <div class="kiri-contact-vmid">
            <p class="kiri-contact-desc-jp">新規案件のご相談・その他お問い合わせは、お手数ですがMailにてご連絡ください。折り返しご連絡させていただきます。</p>
            <p class="kiri-contact-desc-en">If you have any questions about new projects or other inquiries, please contact us by email. We will get back to you as soon as possible.</p>
          </div>
        </div>
        <div class="kiri-contact-mail-span">
          <a class="kiri-contact-mail" href="mailto:info@kirifuda.co.jp">info@kirifuda.co.jp</a>
        </div>
      </div>
    </section>

    <!-- ═══ JOIN US ═══ -->
    <section class="kiri-join-wrap">
      <div class="kiri-join-inner">
        <div class="kiri-contact-title-span">
          <p class="kiri-join-subtitle">WE AWAIT YOUR APPLICATION!</p>
        </div>
        <div class="kiri-contact-title-span">
          <p class="kiri-join-title">JOIN US</p>
        </div>
        <div class="kiri-contact-desc-box">
          <div class="kiri-contact-vmid">
            <p class="kiri-join-desc-copy">Seeking for following positions,</p>
            <div class="kiri-join-positions">
              <span class="kiri-join-pos-li">Web Developers</span><br/>
              <span class="kiri-join-pos-li">Programmers</span><br/>
              <span class="kiri-join-pos-li">Designers</span>
            </div>
          </div>
        </div>
        <div class="kiri-contact-mail-span">
          <a class="kiri-join-mail" href="mailto:job@kirifuda.co.jp">job@kirifuda.co.jp</a>
        </div>
        <p class="kiri-join-note-jp">ポートフォリオを添付の上、上記のアドレスまでご応募ください。</p>
        <p class="kiri-join-note-en">Please submit your portfolio to the address above.</p>
      </div>
    </section>
  </div>
</template>

<script setup>
const works = [
  { client: 'Panasonic', type: 'Websites', agency: 'DENTSU', release: 'August 2022', title: "Panasonic's DIGITAL SHOWROOM" },
  { client: 'SHUEISHA', type: 'Websites', agency: 'KAYAC', release: 'September 2021', title: 'WORLD MAKER βversion' },
  { client: 'KAJIMA CORPORATION', type: 'Installations / XR Experiences', agency: 'DENTSU', release: 'October 2020', title: 'KAJIMA DX LABO', subtitle: 'A birds-eye glimpse of the entire Naruse Dam' },
  { client: 'Sompo Himawari Life Insurance', type: 'Installations / Experiential Events', agency: 'dof', release: 'January 2019', title: 'STRESS CHECK APP', subtitle: 'The App to Monitor Heart Rate and Measure Stress Levels at CES' },
  { client: 'Seiko Watch', type: 'Websites / XR Experiences', agency: 'CHERRY', release: 'December 2019', title: 'UNLOCK YOU | WW | WIRED' },
  { client: 'Santen Pharmaceutical', type: 'Experiential Games', agency: 'CHERRY', release: 'August 2019', title: 'VIRTUAL EYEDROPS', subtitle: "Attack on Titan Collaboration with Santen's Eye Care Project" },
  { client: 'SHUEISHA / KODANSHA', type: 'Websites', agency: 'PARTY', release: 'April 2019', title: 'SHONEN JUM-MAGA CAMPUS' },
  { client: 'Twitter', type: 'Websites', agency: 'DENTSU', release: 'March 2019', title: "THE NAME OF JAPAN'S NEW ERA" },
  { client: 'U-CAN', type: 'Websites', agency: 'HAKUHODO', release: 'November 2018', title: 'THE LAST LETTER', subtitle: 'The last gift from my husband' },
  { client: 'TOKYO METROPOLITAN ART MUSEUM / The Asahi Shimbun', type: 'Websites / Installations', agency: 'HAKUHODO', release: 'September 2018', title: 'MUNCH EXHIBITION / DRAW! SCREAM' },
  { client: 'SHUEISHA', type: 'Installations / Experiential Events', agency: 'DENTSU', release: 'December 2017', title: 'THE READING CHAIR FOR ONE PIECE' },
  { client: 'Sony Music Entertainment', type: 'Apps / Websites', agency: 'DENTSU', release: 'December 2017', title: 'Uru MOON LIVE', subtitle: 'The Music Video Viewer Only Full Moon Day' },
  { client: 'FiNC', type: 'Websites', agency: 'PARTY', release: 'October 2017', title: 'GOHOBI WALKER', subtitle: 'Fitness Walking Game' },
  { client: 'Mizuho Bank', type: 'Websites', agency: 'DENTSU', release: 'May 2017', title: 'JUMBO GACHA', subtitle: 'Virtual Capsule Toy Machine' },
  { client: 'Adobe', type: 'Websites', agency: 'TOKYU AGENCY', release: 'July 2017', title: 'DANCING MIKU MAKER' },
  { client: 'SUNTORY', type: 'Websites', agency: 'Shingata / DENTSU', release: 'February 2017', title: 'SAWARERU CM', subtitle: 'The Story Branches Depending on User Interactions' },
  { client: 'SUNTORY', type: 'Websites', agency: 'DENTSU', release: 'November 2016', title: 'FUNWARI THEATER' },
  { client: 'SHISEIDO', type: 'Websites', agency: 'PARTY / DENTSU', release: 'April 2016', title: 'uno SOCIAL BARBER' },
  { client: 'AMUSE', type: 'Websites', agency: 'DENTSU', release: 'March 2016', title: 'flumpool KAIHOU-KU' },
  { client: 'dof', type: 'Websites', agency: '', release: 'October 2015', title: 'dof inc. OFFICIAL WEBSITE' },
  { client: 'CITIZEN Watch', type: 'Websites', agency: 'DENTSU', release: 'August 2015', title: 'SATELLITE WAVE GPS WATCH', subtitle: 'CITIZEN Eco-Drive' },
  { client: 'Sony Interactive Entertainment', type: 'Experiential Games', agency: 'DENTSU', release: 'February 2015', title: 'PS4 × DRAGON BALL XENOVERSE' },
  { client: 'P&G', type: 'Installations / Experiential Events', agency: 'DENTSU', release: 'January 2015', title: 'SK-II 35th INTERACTIVE HISTORY ART' },
  { client: 'Pernod Ricard Japan', type: 'Installations / Experiential Events', agency: 'FICC', release: 'December 2014', title: 'GIRLS! CHEERS! FANTASY!' },
  { client: 'OK Go + Honda', type: 'Websites', agency: 'Mori / DENTSU', release: 'November 2014', title: "I WON'T LET YOU DOWN", subtitle: 'Drawing Pre-visualization' },
  { client: 'Yahoo! JAPAN', type: 'Installations / XR Experiences', agency: 'HAKUHODO Kettle', release: 'September 2014', title: 'YAHOO! TREND COASTER' },
  { client: 'Panasonic', type: 'Screensavers', agency: 'DENTSU', release: 'June 2014', title: 'BARCA CLOCK', subtitle: "Turn PC Desktops into Camp Nou, FC Barcelona's Home Stadium" },
]

const crew = [
  { role: 'Chief Executive Officer / Founder / Technical Director', name: 'ARIKATA NOBUAKI' },
  { role: 'Executive Officer / Founder / Technical Director', name: 'NAKASHIMA KENSHIRO' },
  { role: 'Developer', name: 'KISHI SYUNSUKE' },
  { role: 'Designer / Motion Designer', name: 'OTSUKA ERIKA' },
]

const awards = [
  'The One Show Festival', 'ACC TOKYO CREATIVITY AWARDS', 'WOMMY AWARDS',
  'FWA', 'CSS DESIGN AWARDS', 'ADFEST', '広告電通賞', 'CSS WINNER',
  'DESIGN AWARDS ASIA', '文化庁メディア芸術祭', 'CODE AWARDS', 'AWWWARDS',
  'THE WEBBY AWARDS', 'SPIKES ASIA',
]

const profile = [
  { label: 'Name', value: '株式会社切札 / kirifuda inc.' },
  { label: 'Officer', value: '有方伸晃 / Arikata Nobuaki<br/>中島賢志郎 / Nakashima Kenshiro' },
  { label: 'Founded', value: 'April 2014' },
  { label: 'Address', value: '〒151-0063 東京都渋谷区富ヶ谷1-6-8 3階<br/>3rd Floor, 1-6-8 Tomigaya, Shibuya-ku, Tokyo 151-0063, Japan' },
  { label: 'Mail', value: 'info@kirifuda.co.jp' },
  { label: 'Capital', value: '7,000,000yen' },
]
</script>

<style scoped>
/* ═══════════════════════════════════════════════
   kirifuda.co.jp noscript CSS — exact replication
   Fonts: Oswald 600 (headings), Padauk 400/700 (labels/values),
          Noto Sans JP 300 (body JP), Almarai 300 (body EN)
   Imported from Google Fonts at page level
   ═══════════════════════════════════════════════ */

@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@200;400;600&family=Padauk:wght@400;700&family=Noto+Sans+JP:wght@300&family=Almarai:wght@300&display=swap');

.kiri-root {
  position: fixed; inset: 0; top: 60px;
  background: #000;
  overflow-y: auto; overflow-x: hidden;
  scroll-behavior: smooth;
}
.kiri-root::-webkit-scrollbar { width: 0; }

/* ── HEADER ── */
.kiri-header {
  position: relative;
  width: 100%; height: 51px;
  margin-top: 22px;
}
.kiri-logo-link {
  position: absolute; left: 30px; display: inline-block;
}
.kiri-logo-img {
  width: 38px; height: 51px; display: block;
}
.kiri-nav-list {
  position: absolute; left: 120px; top: 50%;
  transform: translateY(-50%);
  padding: 0; margin: 0; list-style: none;
}
.kiri-nav-list li {
  display: inline-block; padding: 0 0 0 25px; margin: 0;
}
.kiri-nav-a {
  text-decoration: none; color: #fff;
  font-size: 15px;
  font-family: 'Padauk', 'Helvetica Neue', Arial, sans-serif;
  font-weight: 700; letter-spacing: 0;
}
.kiri-sns {
  display: inline-block; position: absolute; top: 50%;
  transform: translateY(-50%);
  color: #fff; text-decoration: none;
  font-family: 'Padauk', 'Helvetica Neue', Arial, sans-serif;
  font-size: 13px;
}
.kiri-sns-tw { right: 120px; }
.kiri-sns-fb { right: 75px; }
.kiri-sns-ig { right: 30px; }

/* ── MAIN CONTAINER ── */
.kiri-main {
  width: 1000px; margin: 0 auto;
  padding-bottom: 60px;
}

/* ── HERO ── */
.kiri-hero-wrap {
  width: 800px; margin: 0 auto;
}
.kiri-hero-h1 {
  color: #fff;
  font-size: 115px;
  font-family: 'Oswald', 'Helvetica Neue', Arial, sans-serif;
  font-weight: 600; letter-spacing: 2px;
  padding: 0; margin: 100px 0 0 0;
  line-height: 115px;
}
.kiri-hero-desc {
  color: #fff;
  font-size: 20px;
  font-family: 'Padauk', 'Helvetica Neue', Arial, sans-serif;
  font-weight: 400; letter-spacing: 0.05em;
  line-height: 20px;
  padding: 0 0 100px 0;
  margin: 8px 0 0 0;
}

/* ── WORKS ── */
.kiri-works-title {
  display: block; width: 900px;
  color: #fff;
  font-size: 115px;
  font-family: 'Oswald', 'Helvetica Neue', Arial, sans-serif;
  font-weight: 600; letter-spacing: 2px;
  padding: 0 0 80px 100px; margin: 0;
  line-height: 115px;
  border-bottom: 1px solid #515151;
}
.kiri-work-box {
  position: relative; text-decoration: none; display: block;
  color: #fff;
  width: 900px; height: 154px;
  padding: 0 0 0 100px; margin: 0;
  border-bottom: 1px solid #515151;
  transition: all 0.15s;
}
.kiri-work-box:hover {
  color: #000; background-color: #fff;
}
.kiri-work-info {
  display: inline-block; position: absolute;
  top: 50%; transform: translateY(-50%);
}
.kiri-work-row { line-height: 1.3; }
.kiri-work-label {
  display: inline-block; width: 52px;
  font-size: 14px;
  font-family: 'Oswald', 'Helvetica Neue', Arial, sans-serif;
  letter-spacing: 0; color: #777;
  vertical-align: top;
}
.kiri-work-value {
  display: inline-block; width: 240px;
  font-size: 15px;
  font-family: 'Padauk', 'Helvetica Neue', Arial, sans-serif;
  font-weight: 400; line-height: 15px; letter-spacing: 0;
}
.kiri-work-client {
  font-size: 21px; font-weight: 700; line-height: 21px;
}
.kiri-work-name {
  display: inline-block; position: absolute;
  padding: 0; top: 50%; transform: translateY(-50%);
  left: 425px;
}
.kiri-work-sub {
  font-weight: 200; font-size: 23px; line-height: 23px;
  margin: 0; padding: 0;
  font-family: 'Oswald', 'Helvetica Neue', Arial, sans-serif;
}
.kiri-work-name-b {
  font-weight: 600; font-size: 55px; line-height: 55px;
  margin: 0; padding: 0 0 3px 0;
  font-family: 'Oswald', 'Helvetica Neue', Arial, sans-serif;
}

/* ── ABOUT ── */
.kiri-about-title {
  display: block; width: 900px; height: 386px;
  color: #fff;
  font-size: 115px;
  font-family: 'Oswald', 'Helvetica Neue', Arial, sans-serif;
  font-weight: 600; letter-spacing: 2px;
  padding: 180px 0 80px 100px; margin: 0;
  line-height: 115px;
  background: linear-gradient(180deg, #000 40%, #1a1a1a 70%, #333 100%);
}
.kiri-about-contents {
  padding-top: 50px;
  width: 800px; margin: 0 auto;
  color: #fff;
}
.kiri-about-heading {
  font-family: 'Padauk', 'Helvetica Neue', Arial, sans-serif;
  font-weight: 700; font-size: 23px; font-style: italic;
  padding-top: 24px; padding-bottom: 12px; margin: 0;
}
.kiri-about-body-jp {
  padding-left: 13px; line-height: 2.2em;
  font-family: 'Noto Sans JP', 'Helvetica Neue', Arial, sans-serif;
  font-weight: 300; font-feature-settings: "palt"; letter-spacing: 0.05em;
  font-size: 13px; padding-bottom: 10px; margin: 0;
}
.kiri-about-body-en {
  padding-left: 13px; line-height: 2em;
  font-family: 'Almarai', 'Helvetica Neue', Arial, sans-serif;
  font-weight: 300; font-size: 15px; letter-spacing: 0.03em;
  padding-bottom: 54px; margin: 0;
}
.kiri-crew-role {
  padding-left: 13px; line-height: 1em;
  font-family: 'Almarai', 'Helvetica Neue', Arial, sans-serif;
  font-weight: 300; font-size: 12px; color: #888;
  letter-spacing: 0.03em; padding-top: 8px; padding-bottom: 8px; margin: 0;
}
.kiri-crew-name {
  padding-left: 13px; line-height: 1em;
  font-family: 'Almarai', 'Helvetica Neue', Arial, sans-serif;
  font-weight: 300; font-size: 15px; letter-spacing: 0.03em;
  padding-bottom: 24px; margin: 0;
}
.kiri-awards-ul {
  padding: 0; margin: 0; list-style: none; display: block;
}
.kiri-awards-li {
  display: inline-block; width: auto; height: 88px;
  padding: 0 13px 0 16px; margin: 0;
  font-size: 13px; color: #aaa;
  font-family: 'Almarai', 'Helvetica Neue', Arial, sans-serif;
}
.kiri-profile-label {
  padding-left: 13px; line-height: 1em;
  font-family: 'Almarai', 'Helvetica Neue', Arial, sans-serif;
  font-weight: 300; font-size: 12px; color: #888;
  letter-spacing: 0.03em; padding-top: 8px; padding-bottom: 4px; margin: 0;
}
.kiri-profile-value {
  padding-left: 13px; line-height: 2em;
  font-family: 'Noto Sans JP', 'Helvetica Neue', Arial, sans-serif;
  font-weight: 300; font-size: 13px; letter-spacing: 0.03em;
  padding-bottom: 24px; margin: 0;
}

/* ── CONTACT ── */
.kiri-contact-wrap {
  background: #fff; color: #000;
}
.kiri-contact-inner {
  display: block; width: 800px; margin: 0 auto;
  padding: 50px 100px 80px 100px;
}
.kiri-contact-title-span {
  width: auto; height: auto; margin: 0; padding: 0;
  display: block; overflow: hidden;
}
.kiri-contact-title {
  font-size: 115px;
  font-family: 'Oswald', 'Helvetica Neue', Arial, sans-serif;
  font-weight: 600; letter-spacing: -0.01em; margin: 0; padding: 0;
}
.kiri-contact-ta { letter-spacing: -0.05em; }
.kiri-contact-desc-box {
  height: 142px; margin-bottom: 10px;
  vertical-align: middle; position: relative;
}
.kiri-contact-vmid {
  margin: 0; position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -50%); width: 100%;
}
.kiri-contact-desc-jp {
  line-height: 2em;
  font-family: 'Noto Sans JP', 'Helvetica Neue', Arial, sans-serif;
  font-weight: 300; font-size: 14px; letter-spacing: 0.03em;
  font-feature-settings: "palt"; margin: 0 auto; word-break: keep-all;
}
.kiri-contact-desc-en {
  padding-top: 1em; line-height: 1.4em;
  font-family: 'Almarai', 'Helvetica Neue', Arial, sans-serif;
  font-weight: 300; font-size: 15px; letter-spacing: 0.02em;
  margin: 0 auto;
}
.kiri-contact-mail-span {
  width: auto; height: auto; margin: 0; padding: 0; display: block;
}
.kiri-contact-mail {
  font-family: 'Padauk', 'Helvetica Neue', Arial, sans-serif;
  font-weight: 700; font-size: 28px; cursor: pointer;
  text-decoration: none; color: #000;
}
.kiri-contact-mail::before {
  content: '✉'; display: inline-block;
  margin-right: 10px; font-size: 23px;
}

/* ── JOIN US ── */
.kiri-join-wrap {
  color: #fff;
}
.kiri-join-inner {
  display: block; width: 800px; margin: 0 auto;
  padding: 100px 100px;
}
.kiri-join-subtitle {
  font-family: 'Oswald', 'Helvetica Neue', Arial, sans-serif;
  font-weight: 600; font-size: 21px; margin: 0; padding: 0;
}
.kiri-join-title {
  font-family: 'Oswald', 'Helvetica Neue', Arial, sans-serif;
  font-weight: 600; font-size: 115px; letter-spacing: -0.01em;
  margin: 0; padding: 0; margin-top: -2vh; margin-bottom: 2vh;
}
.kiri-join-desc-copy {
  line-height: 2em;
  font-family: 'Almarai', 'Helvetica Neue', Arial, sans-serif;
  font-weight: 300; font-size: 15px; letter-spacing: 0.03em;
  margin: 0; padding: 0;
}
.kiri-join-positions {
  width: auto; margin: 0 auto; text-align: left; display: inline-block;
}
.kiri-join-pos-li {
  width: auto; display: inline-block; text-align: left;
  line-height: 2em;
  font-family: 'Almarai', 'Helvetica Neue', Arial, sans-serif;
  font-weight: 300; font-size: 15px; letter-spacing: 0.03em;
  white-space: nowrap;
}
.kiri-join-pos-li::before {
  content: ''; display: inline-block; background-color: #fff;
  width: 9px; height: 9px; margin-right: 7px; margin-bottom: 1px;
}
.kiri-join-mail {
  font-family: 'Padauk', 'Helvetica Neue', Arial, sans-serif;
  font-weight: 700; font-size: 28px; cursor: pointer;
  text-decoration: none; color: #fff;
}
.kiri-join-mail::before {
  content: '✉'; display: inline-block;
  margin-right: 10px; font-size: 23px;
}
.kiri-join-note-jp {
  line-height: 2em;
  font-family: 'Noto Sans JP', 'Helvetica Neue', Arial, sans-serif;
  font-weight: 300; font-size: 12px; letter-spacing: 0.03em;
  font-feature-settings: "palt"; margin: 0; padding: 0; margin-top: 1vh;
}
.kiri-join-note-en {
  line-height: 2em;
  font-family: 'Almarai', 'Helvetica Neue', Arial, sans-serif;
  font-weight: 300; font-size: 13px; letter-spacing: 0.03em;
  margin: 0; padding: 0;
}
</style>
