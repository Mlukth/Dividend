<script setup>
import { ref } from 'vue'

const activeSection = ref('GettingStarted')

const docSections = [
  { id: 'GettingStarted', label: 'Getting Started!', type: 'option' },
  { id: 'Speed', label: 'Speed', type: 'option' },
  { id: 'Centering', label: 'Centering', type: 'option' },
  { id: 'ZIndex', label: 'Z-Index', type: 'option' },
  { id: 'HorParlx', label: 'Horizontal Scrolling', type: 'option' },
  { id: 'CustomWrapper', label: 'Custom Wrapper', type: 'option' },
  { id: 'TargetNode', label: 'Target Node', type: 'method' },
  { id: 'Refresh', label: 'Refresh', type: 'method' },
  { id: 'Destroy', label: 'Destroy', type: 'method' },
]

function scrollTo(id) {
  activeSection.value = id
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <div class="rellax-site">
    <!-- Grid overlay -->
    <div class="grid-overlay">
      <div class="container">
        <div class="grid-row">
          <div v-for="col in 5" :key="col" class="grid-col">
            <div class="grid-line"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Decorative floating shape -->
    <div class="floating-shape"></div>

    <main class="main">
      <!-- Header -->
      <header class="header">
        <div class="container">
          <div class="row">
            <div class="col-11 col-offset-1">
              <a href="http://dixonandmoe.com/" class="dm-link">
                <h2 class="dm-heading">BY DIXON & MOE <span class="dm-arrow">&#10132;</span></h2>
              </a>
              <div class="white-block"></div>
            </div>
          </div>
          <div class="title-area">
            <div class="row">
              <div class="col-6 col-offset-1">
                <h1 class="rellax-title">RELLAX<span class="title-js">JS</span></h1>
              </div>
              <div class="col-4 text-right">
                <a href="https://github.com/dixonandmoe/rellax" class="github-link">GITHUB</a>
              </div>
            </div>
          </div>
          <div class="subtitle-area">
            <div class="row">
              <div class="col-2 col-offset-1">
                <h3 class="subtitle-item">Lightweight</h3>
              </div>
              <div class="col-2">
                <h3 class="subtitle-item">Vanilla Javascript</h3>
              </div>
              <div class="col-2">
                <h3 class="subtitle-item">Parallax Library</h3>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- San Francisco Section -->
      <section class="sf-section">
        <div class="sf-absolute">
          <div class="container">
            <div class="row">
              <div class="col-11 col-offset-1">
                <h2 class="sf-heading">San Francisco<br>California</h2>
              </div>
            </div>
          </div>
        </div>

        <div class="sf-shapes">
          <div class="container">
            <div class="row">
              <div class="col-2 col-offset-1">
                <div class="shape lg-green"></div>
                <div class="shape sm-purple"></div>
              </div>
              <div class="col-1 col-offset-2">
                <div class="shape sm-purple"></div>
              </div>
              <div class="col-1 col-offset-3">
                <div class="shape xs-green"></div>
                <div class="shape md-green"></div>
              </div>
              <div class="col-1">
                <div class="shape lg-purple"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="container">
          <div class="row">
            <div class="col-5 col-offset-1">
              <div class="sf-date">
                Incorporated—<br>1850<br><br>37°47'N 122°25'W
              </div>
            </div>
            <div class="col-4 col-offset-1">
              <div class="sf-temp">68°</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Documentation -->
      <section class="docs-section">
        <div class="container">
          <div class="row">
            <div class="col-4">
              <div class="sidebar-sticky">
                <p class="options-label">Options</p>
                <a
                  v-for="section in docSections.filter(s => s.type === 'option')"
                  :key="section.id"
                  :href="`#${section.id}`"
                  class="option-link"
                  :class="{ active: activeSection === section.id }"
                  @click.prevent="scrollTo(section.id)"
                >{{ section.label }}</a>

                <p class="options-label options-label-margin">Methods</p>
                <a
                  v-for="section in docSections.filter(s => s.type === 'method')"
                  :key="section.id"
                  :href="`#${section.id}`"
                  class="option-link"
                  :class="{ active: activeSection === section.id }"
                  @click.prevent="scrollTo(section.id)"
                >{{ section.label }}</a>
              </div>
            </div>

            <div class="col-8">
              <!-- Getting Started -->
              <section id="GettingStarted" class="doc-section">
                <div class="doc-block">
                  <h2 class="doc-heading">Getting Started!</h2>
                  <div class="code-block">
                    <code><span class="s-orange">npm install rellax --save</span></code>
                  </div>
                  <p class="doc-text">
                    or if you're old school like us, download and insert
                    <kbd>rellax.min.js</kbd> file in your project folder.
                  </p>

                  <h3 class="doc-subheading">JavaScript (<code>accepts any class name</code>)</h3>
                  <div class="code-block">
                    <code><span class="s-purple">var</span> rellax = <span class="s-green">new</span> <span class="s-white">Rellax</span>('.rellax');</code>
                  </div>

                  <h3 class="doc-subheading">Basic Markup (Default Speed: -2)</h3>
                  <div class="code-block">
                    <code>&lt;div <span class="s-purple">class</span>="<span class="s-green">rellax</span>"&gt;<br>&nbsp;&nbsp;<span class="s-white">I'm slow and smooth</span><br>&lt;/div&gt;</code>
                  </div>

                  <h3 class="doc-subheading">Optional Speed (-10 to +10)</h3>
                  <div class="code-block">
                    <code>
                      &lt;div <span class="s-purple">class</span>="<span class="s-green">rellax</span>" <span class="s-purple">data-rellax-speed</span>="<span class="s-green">-3</span>"&gt;<br>&nbsp;&nbsp;<span class="s-white">I'm slow and smooth</span><br>&lt;/div&gt;<br><br>
                      &lt;div <span class="s-purple">class</span>="<span class="s-green">rellax</span>" <span class="s-purple">data-rellax-speed</span>="<span class="s-green">7</span>"&gt;<br>&nbsp;&nbsp;<span class="s-white">I'm super fast!!</span><br>&lt;/div&gt;<br><br>
                      &lt;div <span class="s-purple">class</span>="<span class="s-green">rellax</span>" <span class="s-purple">data-rellax-speed</span>="<span class="s-green">-5</span>"&gt;<br>&nbsp;&nbsp;<span class="s-white">I'm extra slow and smooth</span><br>&lt;/div&gt;
                    </code>
                  </div>
                </div>
              </section>

              <!-- Speed -->
              <section id="Speed" class="doc-section">
                <div class="doc-block">
                  <h2 class="doc-heading">Speed</h2>
                  <p class="doc-text">
                    Use the <kbd>data-rellax-speed</kbd> attribute to set the speed of a
                    <kbd>.rellax</kbd> element to something other than the default value
                    (which is <kbd>-2</kbd>). A negative value will make it move slower
                    than regular scrolling, and a positive value will make it move faster.
                    We recommend keeping the speed between <kbd>-10 and +10</kbd>.
                  </p>

                  <h3 class="doc-subheading">Responsive Speed</h3>
                  <p class="doc-text">
                    Use responsive speed attributes for breakpoint levels that require a
                    different speed. Defaults to the <kbd>data-rellax-speed</kbd> setting
                    in unspecified breakpoints.
                  </p>

                  <div class="code-block">
                    <code>
                      &lt;div<br>
                      &nbsp;&nbsp;<span class="s-purple">class</span>="<span class="s-green">rellax</span>"<br>
                      &nbsp;&nbsp;<span class="s-purple">data-rellax-speed</span>="<span class="s-green">7</span>"<br>
                      &nbsp;&nbsp;<span class="s-purple">data-rellax-xs-speed</span>="<span class="s-green">-5</span>"<br>
                      &nbsp;&nbsp;<span class="s-purple">data-rellax-mobile-speed</span>="<span class="s-green">3</span>"<br>
                      &nbsp;&nbsp;<span class="s-purple">data-rellax-tablet-speed</span>="<span class="s-green">-8</span>"<br>
                      &nbsp;&nbsp;<span class="s-purple">data-rellax-desktop-speed</span>="<span class="s-green">1</span>"&gt;<br>
                      &nbsp;&nbsp;&nbsp;&nbsp;<span class="s-white">I parallax at all different speeds depending on your screen width.</span><br>
                      &lt;/div&gt;
                    </code>
                  </div>
                  <p class="doc-text">
                    Pass an array of breakpoints. Each breakpoint value represents the
                    resolution for mobile, tablet, desktop respectively.
                  </p>
                  <div class="code-block">
                    <code>
                      &lt;script&gt;<br>
                      &nbsp;&nbsp;<span class="s-comment">//default JS Setting</span><br>
                      &nbsp;&nbsp;<span class="s-purple">var</span> rellax = <span class="s-green">new</span> <span class="s-white">Rellax</span>('.rellax', {<br>
                      &nbsp;&nbsp;&nbsp;&nbsp;<span class="s-green">breakpoints:</span>[<span class="s-orange">576, 768, 1201</span>]<br>
                      &nbsp;&nbsp;});<br>
                      &lt;/script&gt;
                    </code>
                  </div>
                </div>
              </section>

              <!-- Centering -->
              <section id="Centering" class="doc-section">
                <div class="doc-block">
                  <h2 class="doc-heading">Centering</h2>
                  <p class="doc-text">
                    After some fantastic work from <a href="#" class="orange-link">@p-realinho</a>, we
                    just released the ability to center parallax elements in your viewport.
                    There's two ways to implement centering, either on specific elements or as a global option.
                  </p>

                  <div class="code-block">
                    <code>
                      &lt;div <span class="s-purple">class</span>="<span class="s-green">rellax</span>" <span class="s-purple">data-rellax-percentage</span>="<span class="s-green">0.5</span>"&gt;<br>
                      &nbsp;&nbsp;<span class="s-white">I'm that default chill speed of "-2" and "centered"</span><br>
                      &lt;/div&gt;<br><br>
                      &lt;div <span class="s-purple">class</span>="<span class="s-green">rellax</span>" <span class="s-purple">data-rellax-speed</span>="<span class="s-green">7</span>" <span class="s-purple">data-rellax-percentage</span>="<span class="s-green">0.5</span>"&gt;<br>
                      &nbsp;&nbsp;<span class="s-white">I'm super fast!! And super centered!!</span><br>
                      &lt;/div&gt;
                    </code>
                  </div>

                  <div class="code-block">
                    <code>
                      &lt;script&gt;<br>
                      &nbsp;&nbsp;<span class="s-comment">//global JS Setting</span><br>
                      &nbsp;&nbsp;<span class="s-purple">var</span> rellax = <span class="s-green">new</span> <span class="s-white">Rellax</span>('.rellax', {<br>
                      &nbsp;&nbsp;&nbsp;&nbsp;<span class="s-green">center:</span><span class="s-orange">true</span><br>
                      &nbsp;&nbsp;});<br>
                      &lt;/script&gt;
                    </code>
                  </div>
                </div>
              </section>

              <!-- Z-Index -->
              <section id="ZIndex" class="doc-section">
                <div class="doc-block">
                  <h2 class="doc-heading">Z-Index</h2>
                  <p class="doc-text">
                    If you want to sort your elements properly in the Z space,
                    you can use the <kbd>data-rellax-zindex</kbd> property.
                  </p>
                  <div class="code-block">
                    <code>
                      &lt;div <span class="s-purple">class</span>="<span class="s-green">rellax</span>"&gt;<br>
                      &nbsp;&nbsp;<span class="s-white">I'm that default chill speed of "-2" and default z-index of 0</span><br>
                      &lt;/div&gt;<br><br>
                      &lt;div <span class="s-purple">class</span>="<span class="s-green">rellax</span>" <span class="s-purple">data-rellax-speed</span>="<span class="s-green">7</span>" <span class="s-purple">data-rellax-zindex</span>="<span class="s-green">5</span>"&gt;<br>
                      &nbsp;&nbsp;<span class="s-white">I'm super fast!! And on top of the previous element, I'm z-index 5!!</span><br>
                      &lt;/div&gt;
                    </code>
                  </div>
                </div>
              </section>

              <!-- Horizontal Parallax -->
              <section id="HorParlx" class="doc-section">
                <div class="doc-block">
                  <h2 class="doc-heading">Horizontal Parallax</h2>
                  <p class="doc-text">
                    Horizontal parallax is disabled by default. You can enable it by passing
                    <kbd><span class="s-orange">horizontal: true</span></kbd> in the settings
                    block. This feature is intended for panoramic style websites, where users
                    scroll horizontally instead of vertically.
                  </p>
                  <div class="code-block">
                    <code>
                      &lt;script&gt;<br>
                      &nbsp;&nbsp;<span class="s-comment">//Enable Horizontal Parallax Scrolling</span><br>
                      &nbsp;&nbsp;<span class="s-purple">var</span> rellax = <span class="s-green">new</span> <span class="s-white">Rellax</span>('.rellax', {<br>
                      &nbsp;&nbsp;&nbsp;&nbsp;<span class="s-green">horizontal:</span><span class="s-orange">true</span><br>
                      &nbsp;&nbsp;&nbsp;&nbsp;<span class="s-comment">//Disable vertical Parallax Scrolling</span><br>
                      &nbsp;&nbsp;&nbsp;&nbsp;<span class="s-green">vertical:</span><span class="s-orange">false</span><br>
                      &nbsp;&nbsp;});<br>
                      &lt;/script&gt;
                    </code>
                  </div>
                </div>
              </section>

              <!-- Custom Wrapper -->
              <section id="CustomWrapper" class="doc-section">
                <div class="doc-block">
                  <h2 class="doc-heading">Custom Wrapper</h2>
                  <p class="doc-text">
                    By default, the position of parallax elements is determined via the scroll
                    position of the body. Passing in the <kbd><span class="s-orange">wrapper</span></kbd>
                    property in the settings block will tell Rellax to watch that element instead.
                  </p>
                  <div class="code-block">
                    <code>
                      &lt;script&gt;<br>
                      &nbsp;&nbsp;<span class="s-comment">//Set wrapper to .custom-element instead of the body</span><br>
                      &nbsp;&nbsp;<span class="s-purple">var</span> rellax = <span class="s-green">new</span> <span class="s-white">Rellax</span>('.rellax', {<br>
                      &nbsp;&nbsp;&nbsp;&nbsp;<span class="s-green">wrapper:</span><span class="s-orange">'.custom-element'</span><br>
                      &nbsp;&nbsp;});<br>
                      &lt;/script&gt;
                    </code>
                  </div>
                </div>
              </section>

              <!-- Target Node -->
              <section id="TargetNode" class="doc-section">
                <div class="doc-block">
                  <h2 class="doc-heading">Target Node</h2>
                  <p class="doc-text">
                    Instead of using a class selector for all elements, you can specify
                    a target node element.
                  </p>
                  <div class="code-block">
                    <code>
                      &lt;script&gt;<br>
                      &nbsp;&nbsp;<span class="s-purple">var</span> rellax = <span class="s-green">new</span> <span class="s-white">Rellax</span>(document.getElementById('target'));<br>
                      &lt;/script&gt;
                    </code>
                  </div>
                </div>
              </section>

              <!-- Refresh -->
              <section id="Refresh" class="doc-section">
                <div class="doc-block">
                  <h2 class="doc-heading">Refresh</h2>
                  <p class="doc-text">Call the refresh method to recalculate element positions.</p>
                  <div class="code-block">
                    <code>
                      &lt;script&gt;<br>
                      &nbsp;&nbsp;<span class="s-comment">// Start Rellax</span><br>
                      &nbsp;&nbsp;<span class="s-purple">var</span> rellax = <span class="s-green">new</span> <span class="s-white">Rellax</span>('.rellax');<br><br>
                      &nbsp;&nbsp;<span class="s-comment">// Refresh positions</span><br>
                      &nbsp;&nbsp;rellax.refresh();<br>
                      &lt;/script&gt;
                    </code>
                  </div>
                </div>
              </section>

              <!-- Destroy -->
              <section id="Destroy" class="doc-section">
                <div class="doc-block">
                  <h2 class="doc-heading">Destroy</h2>
                  <p class="doc-text">Call the destroy method to remove all parallax event listeners.</p>
                  <div class="code-block">
                    <code>
                      &lt;script&gt;<br>
                      &nbsp;&nbsp;<span class="s-comment">// Start Rellax</span><br>
                      &nbsp;&nbsp;<span class="s-purple">var</span> rellax = <span class="s-green">new</span> <span class="s-white">Rellax</span>('.rellax');<br><br>
                      &nbsp;&nbsp;<span class="s-comment">// End Rellax and reset parallax elements to their original positions</span><br>
                      &nbsp;&nbsp;rellax.destroy();<br>
                      &lt;/script&gt;
                    </code>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@600;700;900&display=swap');

*, *::after, *::before { box-sizing: border-box; margin: 0; padding: 0; }

.rellax-site {
  font-family: 'Source Sans Pro', sans-serif;
  font-weight: 600;
  background: #fff;
  color: #333;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

/* Grid Overlay */
.grid-overlay { position: fixed; inset: 0; z-index: 9999; pointer-events: none; }
.grid-row { display: flex; }
.grid-col { flex: 1; padding: 0 15px; }
.grid-line { height: 100vh; border-left: 1px solid rgba(0,0,0,0.05); }

.container { max-width: 1170px; margin: 0 auto; padding: 0 15px; }
.row { display: flex; flex-wrap: wrap; margin: 0 -15px; }
[class*="col-"] { padding: 0 15px; position: relative; min-height: 1px; }
.col-1 { width: 8.33%; } .col-2 { width: 16.66%; } .col-3 { width: 25%; }
.col-4 { width: 33.33%; } .col-5 { width: 41.66%; } .col-6 { width: 50%; }
.col-8 { width: 66.66%; } .col-10 { width: 83.33%; } .col-11 { width: 91.66%; }
.col-offset-1 { margin-left: 8.33%; } .col-offset-2 { margin-left: 16.66%; }
.col-offset-3 { margin-left: 25%; } .col-offset-5 { margin-left: 41.66%; }
.col-offset-8 { margin-left: 66.66%; }
.text-right { text-align: right; }

/* Floating Shape */
.floating-shape {
  position: fixed; top: 0; right: 0; z-index: -1;
  width: 400px; height: 400px;
  background: linear-gradient(135deg, #ff8c00, #ffb347);
  transform: rotate(45deg); opacity: 0.03; border-radius: 80px;
}

/* Header */
.header { padding-top: 4rem; }
.dm-link { text-decoration: none; color: #333; }
.dm-heading { font-size: 0.75rem; font-weight: 700; letter-spacing: 0.15em; margin-bottom: 1rem; }
.dm-arrow { color: #ff8c00; }
.white-block { width: 100%; height: 1px; background: #eee; margin-bottom: 2rem; }

.title-area { margin: 2rem 0; }
.rellax-title { font-size: clamp(4rem, 10vw, 8rem); font-weight: 900; line-height: 0.9; }
.title-js { color: #ff8c00; }
.github-link {
  display: inline-block; margin-top: 2rem;
  font-size: 0.8rem; font-weight: 900; letter-spacing: 0.2em;
  color: #ff8c00; text-decoration: none;
  padding: 0.5rem 1rem; border: 2px solid #ff8c00; border-radius: 4px;
}

.subtitle-area { margin: 1.5rem 0 3rem; }
.subtitle-item { font-size: 1.1rem; font-weight: 700; color: #555; }

/* SF Section */
.sf-section { position: relative; padding: 4rem 0; min-height: 60vh; }
.sf-absolute { position: relative; z-index: 2; }
.sf-heading { font-size: clamp(3rem, 6vw, 5rem); font-weight: 900; line-height: 1.05; color: #222; }
.sf-shapes { position: absolute; inset: 0; z-index: 1; display: flex; align-items: center; }
.shape {
  transform: rotate(45deg); margin: 0.5rem 0;
  border-radius: 6px; opacity: 0.8;
}
.lg-green { width: 80px; height: 80px; background: #5cb85c; }
.md-green { width: 60px; height: 60px; background: #5cb85c; }
.xs-green { width: 40px; height: 40px; background: #5cb85c; margin-top: 1rem; }
.sm-purple { width: 50px; height: 50px; background: #9b59b6; }
.lg-purple { width: 90px; height: 90px; background: #9b59b6; }

.sf-date { font-size: 0.8rem; font-weight: 700; line-height: 1.6; color: #666; margin-top: 2rem; }
.sf-temp { font-size: 8rem; font-weight: 900; color: #ff8c00; line-height: 1; }

/* Docs */
.docs-section { padding: 4rem 0 8rem; }
.sidebar-sticky { position: sticky; top: 2rem; }
.options-label {
  font-size: 0.7rem; font-weight: 900; text-transform: uppercase;
  letter-spacing: 0.1em; color: #999; margin-bottom: 0.75rem;
}
.options-label-margin { margin-top: 2rem; }
.option-link {
  display: block; padding: 0.35rem 0;
  font-size: 0.85rem; font-weight: 700; color: #888; text-decoration: none;
  transition: color 0.2s;
}
.option-link:hover, .option-link.active { color: #ff8c00; }

.doc-section { margin-bottom: 2rem; }
.doc-block { margin-top: 6rem; }
.doc-heading { font-size: 2.5rem; font-weight: 900; margin-bottom: 1.5rem; color: #222; }
.doc-subheading { font-size: 1.3rem; font-weight: 900; margin: 2rem 0 1rem; color: #444; }
.doc-subheading code { font-size: 0.85rem; color: #888; }
.doc-text { font-size: 0.9rem; font-weight: 600; line-height: 1.7; color: #555; margin-bottom: 1rem; }
.doc-text kbd {
  background: #f5f5f5; padding: 0.15rem 0.4rem; border-radius: 3px;
  font-family: 'SF Mono', monospace; font-size: 0.8rem;
  border: 1px solid #e0e0e0; font-weight: 600;
}

.code-block {
  background: #2d2d2d; padding: 1.25rem 1.5rem; border-radius: 6px;
  margin: 1rem 0; overflow-x: auto;
  font-family: 'SF Mono', 'Fira Code', monospace; font-size: 0.82rem; line-height: 1.8;
  color: #f8f8f2;
}
.s-orange { color: #ff8c00; }
.s-purple { color: #c594c5; }
.s-green { color: #99c794; }
.s-white { color: #f8f8f2; }
.s-comment { color: #65737e; font-style: italic; }
.orange-link { color: #ff8c00; text-decoration: none; }
.orange-link:hover { text-decoration: underline; }

@media (max-width: 768px) {
  .col-4, .col-6, .col-8, .col-11, .col-2, .col-1, .col-5 {
    width: 100%;
  }
  .col-offset-1, .col-offset-2, .col-offset-3, .col-offset-5, .col-offset-8 {
    margin-left: 0;
  }
  .grid-overlay { display: none; }
  .sf-temp { font-size: 4rem; }
  .rellax-title { font-size: 3rem; }
  .sidebar-sticky { position: static; margin-bottom: 2rem; }
  .header { padding-top: 2rem; }
}
</style>
