<script setup>
import { ref } from 'vue'

const menuOpen = ref(false)
const cookieVisible = ref(true)

const navItems = [
  { text: 'Wer wir sind', href: '#' },
  { text: 'Was wir tun', href: '#' },
  { text: 'Wie es gelingt', href: '#', separator: true },
  { text: 'Herausforderungen', href: '#' },
  { text: 'Für dich', href: '#', hasChildren: true },
  { text: 'Kontakt', href: '#', contact: true },
]

const challenges = [
  {
    title: 'Miteinander',
    question: 'Wie schaffen wir ein gemeinsames Verständnis dafür, wie wir zusammenarbeiten?',
    description: 'Die einzelnen Bereiche einer Organisation folgen ihrer eigenen Logik. Den Weg, wie trotzdem ein funktionierendes Zusammenspiel entsteht, sind wir gemeinsam mit unseren Kunden schon viele Male gegangen.',
  },
  {
    title: 'Offene Kommunikation',
    question: 'Wie können wir als Führungsteam geeint die Organisation steuern?',
    description: 'Im Top-Team kommen die Widersprüche und Unterschiede einer Organisation zusammen. Da braucht es ehrliche offene Kommunikation, um eine gemeinsame Linie zu definieren. Wie das gelingen kann, erfährt ihr hier.',
  },
  {
    title: 'Wohin wollen wir?',
    question: 'Wie können wir unsere Organisation an einer gemeinsamen Strategie ausrichten?',
    description: 'In unsicheren Zeiten sehnen sich Menschen nach Orientierung. Hier unsere Antworten auf die Fragen: Wie können wir miteinander die Zukunft unserer Organisation gestalten? Und wie mobilisieren wir die Energie, um das gemeinsame Ziel zu erreichen?',
  },
  {
    title: 'Freiheit mit Verantwortung',
    question: 'Wie können wir führen, damit Menschen bei uns eigenverantwortlicher handeln?',
    description: 'Jede Organisation hat ihre eigene Führungskultur. Wollt ihr so führen, dass die Menschen bei euch freier und verantwortlicher handeln? Dann braucht eure Organisation ihren ganz eigenen Entwicklungspfad.',
  },
]

const clientLogos1 = [
  'neuroth', 'knill-gruppe', 'zeta', 'saubermacher', 'oegk', 'fastbox',
  'netconomy', 'dewetron', 'vamed', 'andritz', 'kleine-zeitung', 'ams',
]
const clientLogos2 = [
  'samsung', 'uni-graz', 'plankenauer', 'norske-skog', 'magna', 'tttech',
  'omv', 'nxp', 'zkw', 'strabag', 'dupont',
]

const caseStudies = [
  { title: 'Interdisziplinär besser zusammenarbeiten in einem Automotive-Produktionswerk', excerpt: 'Der Technologiewandel hält die Automobilindustrie in Atem. Um vorne dabei zu bleiben, intensiviert ein Werk von Magna Powertrain die Zusammenarbeit der Fachbereiche. Erstaunlich wie die Führungskräfte nun an komplexe Probleme herangehen.' },
  { title: 'Strategiemeeting: Ein starker Impuls', excerpt: 'Bei Komptech ist das Strategiemeeting ein Ritual, das so wandlungsfähig ist wie das Unternehmen. Was dieses Meeting über die Jahre bewirkt, hat viele überrascht.' },
  { title: 'Strategische Unternehmensentwicklung bei SMB', excerpt: 'In der Anfangsphase ergreifen Unternehmen die Gelegenheiten, die sich bieten. Je größer und komplexer die Organisation wird, umso wichtiger wird eine bewusste strategische Planung. SMB nimmt die Herausforderung dieser Transformation an.' },
  { title: 'Führungsentwicklung aus eigener Kraft', excerpt: 'Wie ein agiles Software-Unternehmen seine Führungsausbildung selbst entwickelte und allein damit schon Erstaunliches bewirkte.' },
  { title: 'Komplexes Geschäftsmodell in der Organisation verankern', excerpt: 'Alles läuft super in der Organisation. Doch die Resourcen werden knapp, denn die Prozesse sind unscharf und der personelle Aufwand steigt.' },
]

const footerNavItems = ['Impressum', 'Datenschutzerklärung']
</script>

<template>
  <div class="site">
    <!-- Preloader -->
    <div class="preloader"></div>

    <!-- Header -->
    <header class="site-head">
      <div class="header-inner">
        <a href="#" class="site-logo">
          <svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0" y="0" viewBox="0 0 328.1 146.1" xml:space="preserve" class="logo-svg">
            <g>
              <path d="M55.3 66.2v.7h-8c-1.3-2.2-2.4-5.7-2.5-10.6l-.1-4.6c-.2-6.4-3.8-9.1-10-9.1H18.2v24.3h-7.6V11.3h26.2c11.3 0 17.3 6.2 17.3 14.6 0 6.6-3.9 11.2-10.5 13.1 5.6 1.5 8.6 4.8 8.7 11l.1 5.9c.2 4.6 1.4 8.1 2.9 10.3zM35.1 36.6c7.9 0 10.8-4.9 10.8-9.6 0-4.9-3.2-9.8-10.8-9.8H18.2v19.4h16.9zM92.1 27.7v39.2h-7.3v-6.2C82 65.6 77.7 68 71.9 68c-7.6 0-11.6-5-11.6-13.7V27.7h7.3v25.8c0 5.6 2.2 8.6 7.1 8.6 4.8 0 10-3.7 10-12.1l.1-22.3h7.3zM132.1 8.6v58.2h-7.3v-6.2c-2.4 4.6-6.1 7.4-12 7.4-9.9 0-15.8-7.6-15.8-20.8s5.9-20.8 16-20.8c6.5 0 10 3.4 11.9 7V8.6h7.2zm-7.3 38.7c0-9.5-3.8-14.9-10.1-14.9-6.2 0-10 4.9-10 14.9s3.8 14.9 10 14.9c6.3 0 10.1-5.4 10.1-14.9zM146.1 8.6v58.2h-7.3V8.6h7.3zM200.1 27.7v39.2h-7.3v-6.2c-2.8 4.9-7.1 7.3-12.9 7.3-7.6 0-11.6-5-11.6-13.7V27.7h7.3v25.8c0 5.6 2.2 8.6 7.1 8.6 4.8 0 10-3.7 10-12.1l.1-22.3h7.3zM239 40.1v26.8h-7.3V41.1c0-5.6-2.5-8.6-7.3-8.6s-10.2 3.7-10.2 12.1l-.1 22.3h-7.3V27.7h7.3v6.2c2.9-4.9 7.3-7.4 13.1-7.4 7.7 0 11.8 5 11.8 13.6zM279.1 8.6v58.2h-7.3v-6.2c-2.4 4.6-6.1 7.4-12 7.4-9.9 0-15.8-7.6-15.8-20.8s5.9-20.8 16-20.8c6.5 0 10 3.4 11.9 7V8.6h7.2zm-7.4 38.7c0-9.5-3.8-14.9-10.1-14.9-6.2 0-10 4.9-10 14.9s3.8 14.9 10 14.9c6.3 0 10.1-5.4 10.1-14.9z"/>
            </g>
            <g>
              <path d="M31.1 131.4c6.7 0 13-2.9 13-9.6 0-7.8-8.6-9.4-12.6-10.1l-4.2-.8c-7-1.2-16.8-4.6-16.8-15.1 0-10.4 9.6-16.3 20.8-16.3 9.6 0 18.8 4.4 21.1 15.4l-7.9 1.4c-.9-6.4-6.5-10.7-13.6-10.7-6.3 0-12.8 3.3-12.8 9.6 0 6.9 7.8 8.4 12 9.1l3.9.7c7.6 1.3 17.7 4.9 17.7 16 0 11.3-10 16.4-20.8 16.4-11.5 0-21.1-5.5-22.4-16.9l7.4-1.3c.9 7.5 6.7 12.2 15.2 12.2zM75.2 101.7c-6.6 0-11.5 5.2-11.5 15.4 0 9.6 4.2 14.6 11 14.6 5.3 0 9.4-3 10.4-8.3l7.5 1.3c-1.8 8.6-8.9 12.7-17.6 12.7-10.7 0-18.8-6.4-18.8-20.3 0-14.4 8.7-21.2 19.3-21.2 8.3 0 15.4 4.1 16.7 13l-7.4 1.3c-1.1-5.6-4.7-8.5-9.6-8.5zM128.7 109.5v26.8h-7.3v-25.8c0-5.6-2.5-8.6-7.2-8.6-5 0-10.3 3.7-10.3 12.1l-.1 22.3h-7.3V78h7.3v25.3c2.9-4.9 7.5-7.4 13-7.4 7.7 0 11.9 5.1 11.9 13.6zM191 97.1l-13.3 39.2h-7.2l-9.3-31.2-9.3 31.2h-7.2l-13.3-39.2h7.8l9.7 30.8 8.9-30.8h6.9l8.9 30.8 9.6-30.8h7.8zM226.3 135.6v.7h-7c-.6-2.2-1-4.7-1.2-7.4-2.5 4.9-7.5 8.2-13.6 8.2-6.5 0-11.6-3.5-11.6-10.4 0-8.3 7.7-11.9 15.6-14l9.5-2.5c0-5.6-3.6-8.7-8.8-8.7-5.4 0-9.7 3.6-10.1 8.8l-7.3-1.2c1.2-8.8 9.3-13 17.4-13 8.8 0 15.8 4.6 15.8 14.1v14.3c0 4.3.4 8.3 1.3 11.1zm-8.3-17.4v-2.9l-8.6 2.4c-3.5 1-9.1 3.2-9.1 8.3 0 3.5 2.6 5.4 6.2 5.4 5.8 0 11.5-5.2 11.5-13.2zM254.1 104l-6.1-.2c-5.7-.2-9.2 4.4-9.2 9.5v23.1h-7.3V97.1h7.3v6.3c2.2-3.8 5.8-6.3 10.4-6.3l4.4-.1.5 7zM312.7 108.8v27.5h-7.3V110c0-5.3-2.8-8.1-7-8.1-5.2 0-9 3.6-9 10.3v24.1H282V110c0-5.3-2.8-8.1-7-8.1-5.2 0-9 3.6-9 10.3v24.1h-7.3V97.1h7.3v5.2c2.6-4.3 6.4-6.3 11.4-6.3 5.2 0 8.9 2.4 10.7 7 2.8-5.2 7.6-7 12.7-7 7.3-.1 11.9 4.1 11.9 12.8z"/>
            </g>
          </svg>
        </a>

        <nav class="nav-main" :class="{ open: menuOpen }">
          <div class="nav-toggle" @click="menuOpen = !menuOpen">
            <div class="lines">
              <div class="line"></div>
              <div class="line"></div>
            </div>
          </div>
          <div class="nav-container">
            <ul class="menu">
              <li v-for="item in navItems" :key="item.text" class="menu-item" :class="{ separator: item.separator, 'link-contact': item.contact }">
                <a :href="item.href">
                  <span class="link-inner">{{ item.text }}</span>
                  <svg v-if="item.contact" class="icon-contact" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 23.2 18.1"><path d="M9.1 8.2L23.2 1V0L0 2.6l.1.8z"/><path d="M9.1 11.2L.3 6.3l1.1 11.8 21.3-.8.4-13.5z"/></svg>
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </header>

    <main class="page-container">
      <!-- Hero -->
      <section class="hero">
        <div class="hero-inner">
          <div class="hero-content">
            <h1 class="hero-title">
              <span class="title-line">Es läuft das Rudl.</span>
              <span class="title-line">Es fliegt der Schwarm.</span>
            </h1>
            <div class="separator"></div>
            <p class="hero-text">Wir beraten Organisationen, die ihren eigenen Weg gehen.</p>
            <a href="#" class="btn-outline btn-outline--secondary">Leistungen</a>
          </div>
          <div class="hero-illustration">
            <div class="bees">
              <span class="bee bee--1">🐝</span>
              <span class="bee bee--2">🐝</span>
              <span class="bee bee--3">🐝</span>
              <span class="bee bee--4">🐝</span>
              <span class="bee bee--5">🐝</span>
              <span class="bee bee--6">🐝</span>
              <span class="bee bee--7">🐝</span>
            </div>
            <div class="clouds">
              <span class="cloud cloud--1">☁️</span>
              <span class="cloud cloud--2">☁️</span>
              <span class="cloud cloud--3">☁️</span>
              <span class="cloud cloud--4">☁️</span>
              <span class="cloud cloud--5">☁️</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Challenges -->
      <section class="section-challenges">
        <div class="challenges-header">
          <h2 class="section-title">
            <span class="title-line">Wir lieben die</span>
            <span class="title-line">wirklich großen</span>
            <span class="title-line">Herausforderungen</span>
            <span class="title-line">in Organisationen.</span>
          </h2>
          <div class="challenges-intro">
            <p>Das Besondere an Rudl und Schwarm? Wir unterstützen euch nicht nur dabei, wie ihr über Strategien entscheidet, Strukturen verändert oder Führungsteams entwickelt.</p>
            <p>Wir verbinden diese Herausforderungen immer auch mit tiefgreifendem Lernen über euer soziales Zusammenspiel. So kommt nicht nur eure Organisation auf ihrem ganz eigenen Weg voran, sondern auch die einzelnen Menschen.</p>
          </div>
        </div>

        <div class="challenges-list">
          <article v-for="(ch, i) in challenges" :key="i" class="challenge">
            <div class="separator"></div>
            <h3 class="challenge-title">{{ ch.title }}</h3>
            <div class="challenge-content">
              <div class="challenge-text">
                <p class="challenge-question">{{ ch.question }}</p>
                <p>{{ ch.description }}</p>
              </div>
              <a href="#" class="btn-outline btn-outline--primary">Lies mehr</a>
            </div>
          </article>
        </div>

        <div class="challenges-cta">
          <a href="#" class="btn-outline btn-outline--primary btn-outline--md">Alle Herausforderungen</a>
        </div>
      </section>

      <!-- Clients -->
      <section class="section-clients">
        <div class="clients-content">
          <div class="clients-year">
            <span class="char c2">2</span>
            <span class="char c0">0</span>
            <span class="char c0">0</span>
            <span class="char c1">1</span>
          </div>
          <div class="clients-text">
            <div class="clients-illustration">🦄</div>
            <p>Seit 2001 vertrauen uns <br>Kunden, die wissen: <br>Als Partner bringen wir <br>die besten Ergebnisse!</p>
          </div>
        </div>

        <div class="logos-marquee">
          <div class="logos-row">
            <span v-for="logo in clientLogos1" :key="logo" class="logo-item">{{ logo }}</span>
          </div>
          <div class="logos-row">
            <span v-for="logo in clientLogos2" :key="logo" class="logo-item">{{ logo }}</span>
          </div>
        </div>
      </section>

      <!-- Case Studies -->
      <section class="section-case-studies">
        <div class="case-studies-header">
          <div class="separator"></div>
          <h2 class="section-title">
            <span class="title-line">Aktuelle</span>
            <span class="title-line">Fallbeispiele</span>
          </h2>
          <div class="separator"></div>
        </div>

        <div class="case-studies-grid">
          <article v-for="(cs, i) in caseStudies" :key="i" class="case-study">
            <div class="case-study-image">
              <div class="image-placeholder">{{ i + 1 }}</div>
            </div>
            <div class="case-study-content">
              <h3 class="case-study-title">{{ cs.title }}</h3>
              <p class="case-study-excerpt">{{ cs.excerpt }}</p>
              <a href="#" class="btn-outline btn-outline--primary btn-outline--sm">Lies mehr</a>
            </div>
          </article>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="site-foot">
      <div class="footer-grid">
        <!-- Newsletter -->
        <div class="footer-block footer-newsletter">
          <div class="separator"></div>
          <h2 class="footer-title">Mehr von uns</h2>
          <p class="footer-text">Was weiß das Rudl und wovon schwärmt der Schwarm? Abonniere unseren Newsletter:</p>
          <form class="newsletter-form" @submit.prevent>
            <input type="email" placeholder="Deine Email-Adresse" required class="newsletter-input">
            <button type="submit" class="btn-plain">Anmelden</button>
          </form>
        </div>

        <!-- Contact -->
        <div class="footer-block footer-contact">
          <div class="separator"></div>
          <h2 class="sr-only">Contact</h2>
          <div class="contact-links">
            <a href="mailto:office@rudlundschwarm.at" class="contact-link">office@rudlundschwarm.at</a>
            <a href="tel:+43316374321" class="contact-link">+43 316 37 43 21</a>
            <a href="#" class="contact-link">Hochsteingasse 30 — 8010 Graz Austria</a>
            <a href="#" class="contact-link">Kaserngasse 20 — 1230 Wien Austria</a>
          </div>
          <ul class="social-links">
            <li><a href="#" class="social-link">LinkedIn</a></li>
          </ul>
        </div>

        <!-- Footer Nav -->
        <div class="footer-nav">
          <a v-for="item in footerNavItems" :key="item" href="#" class="footer-nav-link">{{ item }}</a>
        </div>

        <!-- Signature -->
        <div class="footer-signature">
          <span>Website by Waaark</span>
        </div>
      </div>
    </footer>

    <!-- Cookie Notice -->
    <div v-if="cookieVisible" class="cookie-notice">
      <p class="cookie-text">Wenn du auf dieser Seite weitersurfst, stimmst du unserer Cookie-Nutzung zur Analyse von Besucherstatistiken zu. <a href="#">Informationen zum Datenschutz</a></p>
      <button class="cookie-btn" @click="cookieVisible = false">Ich stimme zu</button>
    </div>
  </div>
</template>

<style scoped>
@font-face {
  font-family: 'Principal';
  src: url('https://www.rudlundschwarm.at/wp-content/themes/rus/static/fonts/principal/Principal-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Principal';
  src: url('https://www.rudlundschwarm.at/wp-content/themes/rus/static/fonts/principal/Principal-Semibold.woff2') format('woff2');
  font-weight: 600;
  font-style: normal;
  font-display: swap;
}

:root {
  --yellow: #FFD500;
  --pink: #FF8BA7;
  --black: #000000;
  --white: #ffffff;
  --gray: #666666;
  --light-gray: #f5f5f5;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

.site {
  font-family: 'Principal', -apple-system, sans-serif;
  font-weight: 400;
  color: var(--black);
  background: var(--white);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

/* Preloader */
.preloader {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: var(--yellow);
  z-index: 9999;
  animation: preloaderOut 1.5s ease forwards;
  animation-delay: 1s;
  pointer-events: none;
}
@keyframes preloaderOut {
  0% { opacity: 1; }
  100% { opacity: 0; visibility: hidden; }
}

/* Header */
.site-head {
  position: fixed; top: 0; left: 0; width: 100%;
  z-index: 100;
  padding: 2rem 4rem;
  mix-blend-mode: difference;
  color: var(--white);
}
.header-inner {
  display: flex; justify-content: space-between; align-items: center;
  max-width: 1800px; margin: 0 auto;
}
.logo-svg {
  height: 32px; width: auto; fill: currentColor;
}
.nav-main { position: relative; }
.nav-toggle {
  cursor: pointer; width: 32px; height: 24px;
  display: flex; align-items: center; justify-content: center;
}
.nav-toggle .lines { display: flex; flex-direction: column; gap: 6px; }
.nav-toggle .line {
  width: 32px; height: 2px; background: currentColor;
  transition: transform 0.3s ease;
}
.nav-container {
  position: fixed; top: 0; right: 0; width: 400px; height: 100vh;
  background: var(--white); color: var(--black);
  padding: 6rem 3rem;
  transform: translateX(100%);
  transition: transform 0.5s cubic-bezier(0.77, 0, 0.175, 1);
  display: flex; flex-direction: column; gap: 0;
}
.nav-main.open .nav-container { transform: translateX(0); }
.nav-main.open .nav-toggle { position: relative; z-index: 101; }
.menu {
  list-style: none; display: flex; flex-direction: column; gap: 0.5rem;
  margin-top: 3rem;
}
.menu-item a {
  text-decoration: none; color: var(--black);
  font-size: 2rem; font-weight: 400; line-height: 1.4;
  display: flex; align-items: center; gap: 0.5rem;
  transition: opacity 0.3s;
}
.menu-item a:hover { opacity: 0.5; }
.menu-item.separator { margin-top: 2rem; padding-top: 2rem; border-top: 1px solid #ddd; }
.icon-contact { width: 18px; height: auto; fill: currentColor; }

/* Hero */
.hero {
  min-height: 100vh; display: flex; align-items: center;
  background: var(--white);
  padding: 8rem 4rem 4rem;
  position: relative; overflow: hidden;
}
.hero-inner {
  max-width: 1800px; margin: 0 auto; width: 100%;
  display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center;
}
.hero-content { max-width: 650px; }
.hero-title {
  font-size: clamp(3rem, 8vw, 7rem); font-weight: 400; line-height: 1.05;
  display: flex; flex-direction: column;
}
.title-line { display: block; }
.separator {
  width: 60px; height: 2px; background: var(--black);
  margin: 2rem 0;
}
.hero-text {
  font-size: 1.25rem; color: var(--gray); margin-bottom: 2.5rem; max-width: 400px;
}
.hero-illustration {
  position: relative; height: 500px; display: flex; align-items: center; justify-content: center;
}
.bees { position: relative; width: 100%; height: 100%; }
.bee {
  position: absolute; font-size: 2rem;
  animation: float 6s ease-in-out infinite;
}
.bee--1 { top: 10%; left: 20%; animation-delay: 0s; }
.bee--2 { top: 30%; left: 60%; animation-delay: 1s; }
.bee--3 { top: 50%; left: 30%; animation-delay: 2s; }
.bee--4 { top: 20%; left: 80%; animation-delay: 3s; }
.bee--5 { top: 60%; left: 70%; animation-delay: 4s; }
.bee--6 { top: 70%; left: 40%; animation-delay: 0.5s; }
.bee--7 { top: 40%; left: 10%; animation-delay: 2.5s; }
@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
}
.clouds { position: absolute; bottom: 0; left: 0; width: 100%; display: flex; justify-content: space-around; opacity: 0.3; }
.cloud { font-size: 3rem; animation: drift 20s linear infinite; }
.cloud--2 { animation-delay: -5s; font-size: 2rem; }
.cloud--3 { animation-delay: -10s; font-size: 4rem; }
.cloud--4 { animation-delay: -15s; font-size: 2.5rem; }
.cloud--5 { animation-delay: -7s; font-size: 3.5rem; }
@keyframes drift {
  0% { transform: translateX(-100px); }
  100% { transform: translateX(100px); }
}

/* Buttons */
.btn-outline {
  display: inline-flex; align-items: center;
  padding: 0.8rem 2rem;
  border: 2px solid var(--black);
  text-decoration: none; color: var(--black);
  font-size: 0.9rem; font-weight: 400;
  transition: all 0.3s ease;
  background: transparent;
}
.btn-outline:hover { background: var(--black); color: var(--white); }
.btn-outline--secondary { border-color: var(--pink); color: var(--pink); }
.btn-outline--secondary:hover { background: var(--pink); color: var(--white); }
.btn-outline--primary { border-color: var(--black); }
.btn-outline--md { padding: 1rem 3rem; font-size: 1rem; }
.btn-outline--sm { padding: 0.5rem 1.5rem; font-size: 0.8rem; }

/* Challenges */
.section-challenges {
  padding: 8rem 4rem;
  background: var(--light-gray);
}
.challenges-header {
  max-width: 1800px; margin: 0 auto 6rem;
  display: grid; grid-template-columns: 1fr 1fr; gap: 4rem;
}
.section-title {
  font-size: clamp(2.5rem, 5vw, 4.5rem); font-weight: 400; line-height: 1.1;
}
.challenges-intro { font-size: 1rem; color: var(--gray); line-height: 1.8; display: flex; flex-direction: column; gap: 1rem; }
.challenges-list {
  max-width: 1800px; margin: 0 auto;
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 4rem;
}
.challenge { padding-top: 2rem; }
.challenge-title {
  font-size: 2.5rem; font-weight: 400; margin: 1.5rem 0;
}
.challenge-content { padding-left: 2rem; }
.challenge-question { font-weight: 600; margin-bottom: 0.5rem; }
.challenge-text { font-size: 0.95rem; color: var(--gray); line-height: 1.7; margin-bottom: 1.5rem; }
.challenges-cta { text-align: center; margin-top: 5rem; }

/* Clients */
.section-clients {
  padding: 8rem 4rem;
  background: var(--white);
}
.clients-content {
  max-width: 1800px; margin: 0 auto 4rem;
  display: grid; grid-template-columns: auto 1fr; gap: 6rem; align-items: center;
}
.clients-year {
  font-size: clamp(6rem, 12vw, 12rem); font-weight: 400; line-height: 0.9;
  display: flex;
}
.clients-year .char { display: inline-block; }
.clients-text {
  display: flex; align-items: center; gap: 2rem;
  font-size: 1.25rem; line-height: 1.6;
}
.clients-illustration { font-size: 4rem; }
.logos-marquee {
  max-width: 1800px; margin: 0 auto;
  overflow: hidden;
}
.logos-row {
  display: flex; gap: 3rem; padding: 1.5rem 0;
  animation: marquee 30s linear infinite;
  white-space: nowrap;
}
.logos-row:last-child { animation-direction: reverse; animation-duration: 35s; }
@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.logo-item {
  font-size: 0.8rem; color: #999; text-transform: uppercase;
  letter-spacing: 0.1em; flex-shrink: 0;
  padding: 0.5rem 1rem; border: 1px solid #eee; border-radius: 4px;
}

/* Case Studies */
.section-case-studies {
  padding: 8rem 4rem;
  background: var(--white);
}
.case-studies-header {
  max-width: 1800px; margin: 0 auto 4rem;
}
.case-studies-grid {
  max-width: 1800px; margin: 0 auto;
  display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 2rem;
}
.case-study {
  border-top: 1px solid #ddd; padding-top: 1.5rem;
}
.case-study-image {
  width: 100%; height: 220px; background: #f0f0f0;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 1.5rem; overflow: hidden;
}
.image-placeholder {
  font-size: 3rem; color: #ccc; font-family: 'Principal', sans-serif;
}
.case-study-title {
  font-size: 1.25rem; font-weight: 400; line-height: 1.3; margin-bottom: 0.75rem;
}
.case-study-excerpt {
  font-size: 0.85rem; color: var(--gray); line-height: 1.6; margin-bottom: 1rem;
}

/* Footer */
.site-foot {
  background: var(--black); color: var(--white);
  padding: 6rem 4rem 3rem;
}
.footer-grid {
  max-width: 1800px; margin: 0 auto;
  display: grid; grid-template-columns: 1fr 1fr; gap: 4rem;
}
.footer-block .separator {
  background: rgba(255,255,255,0.2); margin: 0 0 2rem;
}
.footer-title { font-size: 2rem; font-weight: 400; margin-bottom: 1rem; }
.footer-text { color: rgba(255,255,255,0.6); margin-bottom: 1.5rem; max-width: 400px; }
.newsletter-form { display: flex; gap: 0.5rem; max-width: 400px; }
.newsletter-input {
  flex: 1; background: transparent; border: none; border-bottom: 1px solid rgba(255,255,255,0.3);
  color: var(--white); padding: 0.75rem 0; font-family: inherit; font-size: 0.9rem;
  outline: none;
}
.newsletter-input::placeholder { color: rgba(255,255,255,0.4); }
.btn-plain {
  background: none; border: none; color: var(--yellow); cursor: pointer;
  font-family: inherit; font-size: 0.9rem; white-space: nowrap;
  padding: 0.75rem 0;
}
.contact-links { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 2rem; }
.contact-link {
  color: rgba(255,255,255,0.7); text-decoration: none; font-size: 0.9rem;
  transition: color 0.3s;
}
.contact-link:hover { color: var(--yellow); }
.social-links { list-style: none; display: flex; gap: 1rem; }
.social-link { color: rgba(255,255,255,0.5); text-decoration: none; font-size: 0.85rem; }
.social-link:hover { color: var(--yellow); }
.footer-nav { grid-column: 1 / -1; display: flex; gap: 2rem; padding-top: 2rem; border-top: 1px solid rgba(255,255,255,0.1); }
.footer-nav-link { color: rgba(255,255,255,0.5); text-decoration: none; font-size: 0.85rem; }
.footer-nav-link:hover { color: var(--yellow); }
.footer-signature { grid-column: 1 / -1; color: rgba(255,255,255,0.3); font-size: 0.8rem; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); }

/* Cookie Notice */
.cookie-notice {
  position: fixed; bottom: 0; left: 0; width: 100%;
  background: var(--white); border-top: 1px solid #eee;
  padding: 1.5rem 4rem; display: flex; align-items: center; gap: 2rem;
  z-index: 200; font-size: 0.85rem;
}
.cookie-text { flex: 1; color: var(--gray); }
.cookie-text a { color: var(--black); }
.cookie-btn {
  background: var(--black); color: var(--white); border: none;
  padding: 0.6rem 1.5rem; cursor: pointer; font-family: inherit; font-size: 0.85rem;
  white-space: nowrap;
}
.cookie-btn:hover { background: #333; }

@media (max-width: 768px) {
  .site-head { padding: 1.5rem; }
  .hero { padding: 6rem 1.5rem 3rem; }
  .hero-inner { grid-template-columns: 1fr; gap: 2rem; }
  .hero-illustration { height: 300px; }
  .section-challenges, .section-clients, .section-case-studies { padding: 4rem 1.5rem; }
  .challenges-header { grid-template-columns: 1fr; gap: 2rem; }
  .challenges-list { grid-template-columns: 1fr; gap: 2rem; }
  .clients-content { grid-template-columns: 1fr; gap: 2rem; }
  .clients-year { font-size: 4rem; }
  .footer-grid { grid-template-columns: 1fr; gap: 2rem; }
  .site-foot { padding: 4rem 1.5rem 2rem; }
  .cookie-notice { flex-direction: column; padding: 1.5rem; text-align: center; }
  .case-studies-grid { grid-template-columns: 1fr; }
}
</style>
