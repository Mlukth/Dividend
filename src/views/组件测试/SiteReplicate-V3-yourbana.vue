<template>
  <div class="yourbana">
    <!-- Preloader -->
    <div class="preloader">
      <div class="loader">
        <div class="prcnt-loader">100</div>
      </div>
    </div>

    <!-- Header -->
    <header class="page-header">
      <div class="header-menu">
        <div class="grid-trigger">
          <div class="grid-trigger-inner"></div>
        </div>
        <div class="header-btn flak">Partecipa</div>
        <div class="header-navtrigger">
          <div class="nav-line"></div>
          <div class="nav-line"></div>
          <div class="nav-line"></div>
        </div>
      </div>
    </header>

    <div class="percent-scrolled flak"><span class="percent">00%</span></div>

    <!-- Overlay Menu -->
    <div class="page-menu">
      <div class="menu-inner">
        <div class="menu-header">
          <svg class="yourbana-iso" viewBox="0 0 409 760">
            <polygon points="0,760 0,559.3 0,0 166.5,0 409,0 409,760"/>
            <polygon points="409,0 409,0 242.5,0 242.5,0 409,0"/>
          </svg>
        </div>
        <div class="menu-content">
          <ul class="main-menu">
            <li class="main-menu-item flak" v-for="(item, i) in menuItems" :key="i">
              <span class="menu-item-group">
                <span class="mask"><span class="menu-item-index">{{ i + 1 }}</span></span>
                <span class="mask"><span class="menu-item-title">{{ item }}</span></span>
              </span>
            </li>
          </ul>
        </div>
        <div class="menu-bottom">
          <div class="menu-langs">
            <a href="#" class="current-lang lang-item">IT</a>
            <div class="lang-divider">/</div>
            <a href="#" class="lang-item">EN</a>
          </div>
          <div class="menu-footer">
            <div class="menu-social">
              <a href="#" class="social-link">Instagram</a>
              <a href="#" class="social-link">TikTok</a>
            </div>
            <div class="menu-time">
              <div class="time-icon">
                <svg viewBox="0 0 20 20"><path d="M10,20C4.5,20,0,15.5,0,10C0,4.5,4.5,0,10,0c5.5,0,10,4.5,10,10C20,15.5,15.5,20,10,20z M10,1c-5,0-9,4-9,9c0,5,4,9,9,9c5,0,9-4,9-9C19,5,15,1,10,1z"/><rect x="1" y="6.3" width="17.9" height="1"/><rect x="1" y="12.7" width="17.9" height="1"/></svg>
              </div>
              <div class="current-time"><span>Roma</span><span class="time"></span></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Hero Section -->
    <section class="section-hero section-black">
      <div class="section-inner">
        <div class="hero-main">
          <div class="layout-grid">
            <div class="hero-top">
              <h1 class="hero-title">
                <span class="visually-hidden">Yourbana Roma 25</span>
                <span class="title-line mask">
                  <span class="title-inner">
                    <span class="hero-letter">Y</span><span class="hero-letter">O</span><span class="hero-letter">U</span><span class="hero-letter">R</span>
                    <span class="hero-letter">B</span><span class="hero-letter">A</span><span class="hero-letter">N</span><span class="hero-letter">A</span>
                  </span>
                </span>
                <span class="title-line mask">
                  <span class="title-inner">
                    <span class="hero-letter">R</span><span class="hero-letter">O</span><span class="hero-letter">M</span><span class="hero-letter">A</span>
                  </span>
                </span>
                <span class="title-line mask">
                  <span class="title-inner">
                    <span class="hero-letter hero-number">2</span><span class="hero-letter hero-number">5</span>
                  </span>
                </span>
              </h1>
            </div>
            <div class="hero-footer">
              <div class="intro-text">
                <span class="mask"><span>Una fotografia</span></span>
                <span class="mask"><span>in movimento</span></span>
                <span class="mask"><span>della città</span></span>
              </div>
              <div class="hero-sponsors">
                <div class="sponsors-text">In collaborazione con</div>
                <div class="sponsors-container">
                  <span class="sponsor-logo atac-logo">ATAC</span>
                  <div class="sponsors-divider"></div>
                  <span class="sponsor-logo mastercard-logo">Mastercard</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="hero-media">
          <div class="hero-claim">
            <div class="claim-inner flak">
              <div class="claim"><div class="claim-text">Scroll / Drag</div></div>
              <div class="claim-forward">
                <div class="mask">
                  <div class="arrow-container">
                    <svg viewBox="0 0 80 80"><polygon points="39.3,12 31.8,19.5 46.9,34.6 48.5,36.2 52.3,40 48.5,43.8 46.9,45.4 31.8,60.5 39.3,68 67.3,40"/><polygon points="44.7,40 39.3,34.6 12.7,34.6 12.7,40 12.7,45.4 39.3,45.4"/></svg>
                    <svg viewBox="0 0 80 80"><polygon points="39.3,12 31.8,19.5 46.9,34.6 48.5,36.2 52.3,40 48.5,43.8 46.9,45.4 31.8,60.5 39.3,68 67.3,40"/><polygon points="44.7,40 39.3,34.6 12.7,34.6 12.7,40 12.7,45.4 39.3,45.4"/></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="flowmap"><div class="flowmap-inner"></div></div>
        </div>
      </div>
    </section>

    <!-- Intro Section -->
    <section class="section-intro section-black">
      <div class="section-inner">
        <div class="intro-main">
          <div class="layout-grid">
            <div class="intro-layout-title">
              <div class="main-title flak">
                <span class="title-line mask"><span class="title-inner"><span class="title-word">Un'esperienza</span></span></span>
                <span class="title-line mask"><span class="title-inner"><span class="title-word">culturale</span></span></span>
                <span class="title-line mask"><span class="title-inner"><span class="title-word">collettiva in</span></span></span>
                <span class="title-line mask"><span class="title-inner"><span class="title-word">continua evoluzione</span></span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Step 1: Cos'è Yourbana (Red) -->
    <section class="section-step section-red" data-step="1">
      <div class="section-inner">
        <div class="step-number">
          <svg viewBox="0 0 560 1080">
            <polygon points="250.7,1080 98,1080 98,0 250.7,0"/>
            <polygon points="462,1080 249.7,1080 249.7,0 462,0 462,1080"/>
          </svg>
        </div>
        <div class="section-main">
          <div class="layout-grid">
            <div class="step-layout-title">
              <h2 class="main-title flak">
                <span class="title-line mask"><span class="title-inner"><span class="title-word">Cos'è</span></span></span>
                <span class="title-line mask"><span class="title-inner"><span class="title-word">Yourbana</span></span></span>
              </h2>
            </div>
            <div class="section-text">
              <div class="text-title">E' un contenitore d'immagini</div>
              <div class="text-description">
                <p>E' un progetto video partecipativo che racconta il movimento della città attraverso le immagini che i suoi protagonisti producono ogni giorno con gli smartphone.</p>
                <p>I video ricevuti saranno il punto di partenza per la produzione di immagini originali sulla città che verranno mostrate sugli schermi del trasporto pubblico, gestiti da Atac, della città.</p>
              </div>
            </div>
            <div class="badge">
              <div class="badge-icon">
                <svg viewBox="0 0 96 96"><path d="M38.2,96V70.7L22.2,0h21l13.9,70.7V96H38.2z M59.2,64.2l-9.6-48.4L52.8,0h21L59.2,64.2z"/></svg>
              </div>
              <div class="badge-text">Un racconto creativo e sostenibile del transporto pubblico</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Step 2: Come funziona (Beige) -->
    <section class="section-step section-beige" data-step="2">
      <div class="section-inner">
        <div class="step-number">
          <svg viewBox="0 0 560 1080">
            <polygon points="300.4,370.1 50,629.6 50,0 156.2,0 300.4,0"/>
            <polygon points="511.7,449.9 262.3,711.1 262.3,1080.1 48.3,1080.1 50,628.6 299.4,369.1 299.4,0 405.5,0 511.6,0 511.6,449.8"/>
            <polygon points="511.7,1080 261.3,1080 261.3,710.1 511.7,448.9"/>
          </svg>
        </div>
        <div class="section-main">
          <div class="layout-grid">
            <div class="step-layout-title">
              <h2 class="main-title flak">
                <span class="title-line mask"><span class="title-inner"><span class="title-word">Come</span></span></span>
                <span class="title-line mask"><span class="title-inner"><span class="title-word">funziona</span></span></span>
              </h2>
            </div>
            <div class="section-text">
              <div class="text-title">Filma il tuo percorso e condividi la tua storia</div>
              <div class="text-description text-columns">
                <ul>
                  <li>Filma Roma in movimento dal trasporto pubblico nel rispetto della privacy dei luoghi e delle persone.</li>
                  <li>Carica i video, montati o no, sul portale dedicato.</li>
                  <li>La durata massima di ogni video non deve superare i 90 secondi.</li>
                </ul>
                <ul>
                  <li>Si possono caricare più video.</li>
                  <li>Qualunque formato va bene.</li>
                  <li>Si possono aggiungere effetti o emoticon.</li>
                  <li>Il team creativo seleziona i video ricevuti e crea il racconto.</li>
                  <li>Il risultato sarà mostrato su più di 2000 schermi del trasporto pubblico e delle stazioni di Roma.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Step 3: Cosa filmare (Black) -->
    <section class="section-step section-black" data-step="3">
      <div class="section-inner">
        <div class="step-number">
          <svg viewBox="0 0 560 1080">
            <polygon points="299.7,326.8 155.4,326.8 49.2,326.8 49.2,0 155.3,0 299.6,0 299.6,217.3"/>
            <polygon points="510.8,1080 404.7,1080 298.6,1080 298.6,754.2 49.3,754.2 49.2,325.8 298.6,325.8 298.6,0 404.7,0 510.8,0 510.8,456.6 510.8,539.2 510.8,621.8 510.8,968.9"/>
            <polygon points="299.6,1080 155.4,1080 49.3,1080.1 49.3,753.2 299.6,753.2 299.6,864.4 299.6,1080.1"/>
          </svg>
        </div>
        <div class="section-main">
          <div class="layout-grid">
            <div class="section-text">
              <div class="text-title">Il tuo sguardo su Roma</div>
              <div class="text-description">
                <p>Filma i tuoi spostamenti nella città quando usi il trasporto pubblico, il tuo sguardo sulla città mentre l'attraversi. I tuoi video se verranno selezionati, faranno parte di un nuovo racconto della città creato da chi la vive e l'attraversa.</p>
                <p>Ti suggeriamo due temi.</p>
              </div>
            </div>
            <div class="step-layout-title">
              <h2 class="main-title flak">
                <span class="title-line mask"><span class="title-inner"><span class="title-word">Cosa</span></span></span>
                <span class="title-line mask"><span class="title-inner"><span class="title-word">filmare</span></span></span>
              </h2>
            </div>
          </div>
        </div>
        <div class="matters-container">
          <div class="matter matter-1">
            <div class="matter-text">
              <h3 class="text-title"><span class="mask"><span>Luci e</span></span><span class="mask"><span>Riflessi</span></span></h3>
              <div class="matter-cta"><div class="matter-cta-line"></div><div class="matter-cta-line"></div></div>
              <div class="hidden-text"><p>Le luci della città si riflettono sui vetri dell'autobus e creano fotografie che durano un istante. Cattura il tramonto, l'alba, le luci artificiali che ti accompagnano negli spostamenti.</p></div>
            </div>
          </div>
          <div class="matter matter-2">
            <div class="matter-text">
              <h3 class="text-title"><span class="mask"><span>Diario di</span></span><span class="mask"><span>transito</span></span></h3>
              <div class="matter-cta"><div class="matter-cta-line"></div><div class="matter-cta-line"></div></div>
              <div class="hidden-text"><p>Racconta la città che vedi dal finestrino di un autobus o di una metropolitana; i trend, gli stili e le emozioni che incontri quando ti muovi nel trasporto pubblico.</p></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Step 4: Partecipa (Yellow) -->
    <section class="section-step section-yellow" data-step="4">
      <div class="section-inner">
        <div class="step-number">
          <svg viewBox="0 0 560 1080">
            <polygon points="538.6,872.8 538.7,1080 260.6,1080 260.6,0 538.7,0 538.7,660.5 538.7,872.8"/>
            <polygon points="261.6,1080 21.4,1080 21.4,0 261.6,0 261.6,1080"/>
          </svg>
        </div>
        <div class="section-main">
          <div class="layout-grid">
            <div class="step-layout-title">
              <h2 class="main-title flak">
                <span class="title-line mask"><span class="title-inner"><span class="title-word">Partecipa</span></span></span>
              </h2>
            </div>
            <div class="step-4-middle">
              <div class="instructions-container">
                <div class="instructions-title flak">Step 1</div>
                <div class="instructions-main">
                  <div class="text-description"><p>Con il tuo smartphone, tablet o videocamera, filma Roma seguendo le tematiche suggerite.</p></div>
                </div>
              </div>
              <div class="instructions-container">
                <div class="instructions-title flak">Step 2</div>
                <div class="instructions-main">
                  <div class="text-description"><p>Registrati per partecipare in meno di un minuto.</p></div>
                  <a class="btn mask" href="#"><span class="btn-inner">Accesso</span><span class="btn-inner">Accesso</span></a>
                </div>
              </div>
            </div>
            <div class="step-4-bottom">
              <div class="quote-line flak"><span class="mask"><span class="quote-word">movimento della città!</span></span></div>
              <div class="quote-line flak"><span class="mask"><span class="quote-word">Crea il tuo racconto!</span></span></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Outro Section -->
    <section class="section-outro section-black">
      <div class="section-inner">
        <div class="outro-main">
          <div class="layout-grid">
            <div class="outro-layout">
              <div class="video-mask" v-for="letter in 'YOURBANA'.split('')" :key="letter">
                <div class="video-letter flak">{{ letter }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer (Step 5: Crediti) -->
    <footer class="page-footer section-orange" data-step="5">
      <div class="section-inner">
        <div class="footer-inner">
          <div class="layout-grid">
            <div class="footer-logos-container">
              <div class="footer-logos-text flak">
                <span class="mask"><span>Yourbana è un progetto di</span></span>
              </div>
              <div class="footer-logos">
                <div class="footer-humans">
                  <div class="sponsors-text">Humans Artis</div>
                  <span class="humans-logo">Humans Artis</span>
                </div>
                <div class="footer-sponsors">
                  <div class="sponsors-text">In collaborazione con</div>
                  <div class="sponsors-container">
                    <span class="sponsor-logo">ATAC</span>
                    <div class="sponsors-divider"></div>
                    <span class="sponsor-logo">Mastercard</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="footer-layout-title">
              <div class="main-title flak">
                <span class="title-line mask"><span class="title-inner"><span class="title-word">YBN.</span></span></span>
              </div>
            </div>
          </div>
          <div class="layout-grid">
            <div class="section-partners">
              <div class="partners-top">
                <div class="text-title">Con il patrocinio di</div>
                <div class="footer-patronage"><span class="partner-logo">Roma</span></div>
              </div>
              <div class="partners-bottom">
                <div class="text-title">Con la collaborazione di</div>
                <div class="footer-collaborazione">
                  <span class="partner-logo">Scuola Nazionale di Cinema</span>
                  <span class="partner-logo">IED</span>
                  <span class="partner-logo">Sentieri Selvaggi</span>
                  <span class="partner-logo">Zip Zone</span>
                  <span class="partner-logo">Sapienza Università di Roma</span>
                  <span class="partner-logo">Museo delle Periferie</span>
                  <span class="partner-logo">Aurorart</span>
                  <span class="partner-logo">Ecomuseo Casilino</span>
                  <span class="partner-logo">Accademia Griffith</span>
                  <span class="partner-logo">Teatro del Lido di Ostia</span>
                </div>
              </div>
            </div>
            <div class="footer-nav">
              <div class="copyright">&copy; 2026</div>
              <div class="legal-nav">
                <a href="#" class="legal-link">Termini e condizione</a>
                <a href="#" class="legal-link">Politica sulla privacy</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
const menuItems = ["Cos'è Yourbana", "Come funziona", "Cosa filmare", "Partecipa", "Crediti"]
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Almarai:wght@300;400&family=Noto+Sans+JP:wght@300;400&family=Oswald:wght@400;600&family=Padauk:wght@400;700&display=swap');

@font-face {
  font-family: 'Flak';
  font-weight: 400;
  font-display: swap;
  src: url('https://yourbana.com/wp-content/themes/wp-blank-special/assets/fonts/flak-regular.woff2') format('woff2');
}

@font-face {
  font-family: 'Mark Pro';
  font-weight: 400;
  font-display: swap;
  src: url('https://yourbana.com/wp-content/themes/wp-blank-special/assets/fonts/markoffcformc.woff2') format('woff2');
}
@font-face {
  font-family: 'Mark Pro';
  font-weight: 500;
  font-display: swap;
  src: url('https://yourbana.com/wp-content/themes/wp-blank-special/assets/fonts/markoffcformc-medium.woff2') format('woff2');
}
@font-face {
  font-family: 'Mark Pro';
  font-weight: 700;
  font-display: swap;
  src: url('https://yourbana.com/wp-content/themes/wp-blank-special/assets/fonts/markoffcformc-bold.woff2') format('woff2');
}

.yourbana {
  --color-black: #000000;
  --color-white: #FFFFFF;
  --color-beige: #E9E6E0;
  --color-yellow: #F79E1B;
  --color-orange: #FF5F00;
  --color-red: #EB001B;
  --grid-margin: 4.762vh;
  --grid-gutter: 0.952vh;

  background: var(--color-black);
  color: var(--color-white);
  font-family: 'Mark Pro', 'Noto Sans JP', sans-serif;
  font-weight: 400;
  line-height: 1.4;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

.flak { font-family: 'Flak', 'Oswald', sans-serif; font-weight: 400; line-height: 1; }

/* Preloader */
.preloader {
  position: fixed; inset: 0; z-index: 1000; background: #000;
  display: flex; align-items: flex-end; justify-content: flex-start;
  padding: 4.762vh; animation: fadeOut 0.8s 1.5s ease forwards;
  pointer-events: none;
}
@keyframes fadeOut { to { opacity: 0; } }
.loader { color: #fff; font-family: 'Flak'; font-size: 16.2vh; line-height: 1; }
.prcnt-loader { margin-top: -1.7vh; }

/* Header */
.page-header {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  padding: var(--grid-margin);
}
.header-menu { display: flex; justify-content: space-between; align-items: center; }
.header-btn { font-size: 2.2vh; cursor: pointer; }
.header-navtrigger { display: flex; flex-direction: column; gap: 6px; cursor: pointer; }
.nav-line { width: 28px; height: 1.5px; background: #fff; }
.percent-scrolled {
  position: fixed; right: var(--grid-margin); top: 50%; z-index: 99;
  transform: translateY(-50%); font-size: 2vh; writing-mode: vertical-lr;
}

/* Overlay Menu */
.page-menu {
  position: fixed; inset: 0; z-index: 200; background: #000;
  display: flex; align-items: center; justify-content: center;
  opacity: 0; pointer-events: none; transition: opacity 0.5s ease;
}
.page-menu:hover { opacity: 1; pointer-events: all; }
.menu-inner { width: 90vw; max-width: 1000px; }
.yourbana-iso { width: 80px; height: auto; fill: #fff; margin-bottom: 6vh; }
.main-menu { list-style: none; padding: 0; }
.main-menu-item {
  font-size: 6vh; line-height: 1.1; padding: 1.5vh 0;
  border-bottom: 1px solid rgba(255,255,255,0.1); cursor: pointer;
}
.menu-item-index { font-size: 2vh; margin-right: 1vw; opacity: 0.5; }
.menu-item-title { color: #fff; }
.menu-bottom { display: flex; justify-content: space-between; margin-top: 4vh; font-family: 'Mark Pro'; font-size: 1.6vh; }
.menu-langs { display: flex; gap: 0.5em; }
.lang-divider { opacity: 0.4; }
.menu-social { display: flex; gap: 1.5em; }
.menu-social a { color: #fff; text-decoration: none; }
.menu-time { display: flex; align-items: center; gap: 0.8em; }
.time-icon { width: 16px; fill: #fff; }

/* Sections */
.section-inner { min-height: 100vh; display: flex; flex-direction: column; justify-content: center; padding: var(--grid-margin); position: relative; }
.section-black { background: var(--color-black); color: var(--color-white); }
.section-red { background: var(--color-red); color: var(--color-white); }
.section-beige { background: var(--color-beige); color: var(--color-black); }
.section-yellow { background: var(--color-yellow); color: var(--color-black); }
.section-orange { background: var(--color-orange); color: var(--color-white); }

.layout-grid {
  display: grid; grid-template-columns: repeat(12, 1fr);
  gap: var(--grid-gutter); max-width: 1400px; margin: 0 auto; width: 100%;
}

/* Hero */
.hero-title { grid-column: 1 / -1; display: flex; flex-direction: column; gap: 0; }
.title-line { overflow: hidden; }
.title-inner { display: flex; gap: 0.02em; }
.hero-letter {
  font-family: 'Flak'; font-size: clamp(60px, 12vw, 160px);
  line-height: 0.85; color: #fff; display: block;
}
.hero-number { color: var(--color-red); }
.visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); }
.hero-footer { grid-column: 1 / -1; display: flex; justify-content: space-between; align-items: flex-end; margin-top: 4vh; }
.intro-text { font-size: 2.6vh; display: flex; flex-direction: column; gap: 0.2em; }
.intro-text .mask { overflow: hidden; display: block; }
.hero-sponsors { text-align: right; }
.sponsors-text { font-size: 1.2vh; text-transform: uppercase; opacity: 0.5; margin-bottom: 1vh; }
.sponsors-container { display: flex; align-items: center; gap: 1.5em; font-size: 2.5vh; font-weight: 700; }
.sponsors-divider { width: 1px; height: 3vh; background: rgba(255,255,255,0.3); }
.sponsor-logo { font-weight: 700; }
.hero-media { position: relative; height: 40vh; margin-top: 4vh; }
.hero-claim { position: absolute; bottom: 0; left: 0; z-index: 10; }
.claim-text { font-size: 1.8vh; }
.arrow-container { display: flex; flex-direction: column; gap: 4px; }
.arrow-container svg { width: 24px; fill: #fff; }
.flowmap { position: absolute; inset: 0; background: radial-gradient(ellipse at center, rgba(235,0,27,0.3) 0%, transparent 70%); }
.flowmap-inner { width: 100%; height: 100%; }

/* Section Titles */
.step-number { position: absolute; right: 5vw; top: 5vh; width: 8vw; opacity: 0.2; }
.step-number svg { fill: currentColor; width: 100%; height: auto; }
.main-title { grid-column: 1 / -1; display: flex; flex-direction: column; gap: 1vh; margin-bottom: 4vh; }
.main-title .title-word { font-family: 'Flak'; font-size: clamp(40px, 8vw, 110px); display: block; line-height: 0.9; }
.text-title { font-size: clamp(20px, 3vh, 32px); font-weight: 500; margin-bottom: 2vh; }
.text-description { font-size: clamp(14px, 2vh, 18px); line-height: 1.5; opacity: 0.8; max-width: 600px; }
.text-description p { margin-bottom: 1em; }
.text-description ul { list-style: none; padding: 0; }
.text-description li { padding: 0.4em 0; padding-left: 1em; position: relative; }
.text-description li::before { content: '—'; position: absolute; left: 0; }
.text-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 2em; }

.section-text { grid-column: 1 / span 6; }
.step-layout-title { grid-column: 7 / -1; }

/* Matters (Step 3) */
.matters-container { display: grid; grid-template-columns: 1fr 1fr; gap: var(--grid-gutter); margin-top: 6vh; max-width: 1400px; margin-left: auto; margin-right: auto; width: 100%; padding: 0 var(--grid-margin); }
.matter { position: relative; min-height: 50vh; display: flex; flex-direction: column; justify-content: flex-end; padding: 3vh; }
.matter-1 { background: #1a1a1a; }
.matter-2 { background: #2a2a2a; }
.matter-text .text-title { color: #fff; font-size: clamp(24px, 4vh, 44px); }
.matter-text .text-title .mask { display: block; overflow: hidden; }
.matter-cta { margin-top: 2vh; display: flex; gap: 8px; }
.matter-cta-line { width: 20px; height: 1px; background: #fff; }
.hidden-text { margin-top: 2vh; font-size: 1.6vh; opacity: 0.6; max-width: 90%; display: none; }
.matter:hover .hidden-text { display: block; }

/* Step 4 */
.step-4-middle { grid-column: 1 / span 10; display: grid; grid-template-columns: 1fr 1fr; gap: 4vw; margin: 4vh 0; }
.instructions-title { font-size: clamp(30px, 5vh, 60px); margin-bottom: 2vh; }
.instructions-main .text-description { font-size: 1.8vh; }
.btn {
  display: inline-block; padding: 1.2vh 3vh; border: 1px solid currentColor;
  font-size: 1.8vh; margin-top: 2vh; cursor: pointer; text-decoration: none;
  color: inherit; overflow: hidden; position: relative;
}
.btn-inner { display: block; }
.step-4-bottom { grid-column: 1 / -1; margin-top: 4vh; }
.quote-line { font-size: clamp(36px, 6vw, 80px); margin: 0; }
.mask { overflow: hidden; display: block; }
.quote-word { display: block; }

/* Outro */
.outro-layout { grid-column: 1 / -1; display: flex; justify-content: center; gap: 1vw; flex-wrap: wrap; }
.video-mask { width: clamp(40px, 8vw, 100px); height: clamp(120px, 20vw, 300px); background: #1a1a1a; display: flex; align-items: center; justify-content: center; }
.video-letter { font-size: clamp(30px, 6vw, 90px); color: #333; }

/* Footer */
.page-footer .section-inner { justify-content: flex-start; padding-top: 10vh; }
.footer-logos-text { font-size: clamp(24px, 3vh, 36px); margin-bottom: 4vh; grid-column: 1 / span 6; }
.footer-logos { grid-column: 1 / span 6; display: flex; gap: 4vw; }
.footer-layout-title { grid-column: 7 / -1; }
.footer-layout-title .main-title .title-word { font-size: clamp(60px, 12vw, 160px); }
.section-partners { grid-column: 1 / -1; margin-top: 6vh; }
.partners-top, .partners-bottom { margin-bottom: 3vh; }
.footer-collaborazione { display: flex; flex-wrap: wrap; gap: 1.5em; margin-top: 2vh; }
.partner-logo { font-size: 1.4vh; opacity: 0.6; }
.footer-nav { grid-column: 1 / -1; display: flex; justify-content: space-between; margin-top: 6vh; padding-top: 3vh; border-top: 1px solid rgba(255,255,255,0.2); font-size: 1.4vh; }
.legal-nav { display: flex; gap: 2em; }
.legal-link { color: inherit; text-decoration: none; }
</style>
