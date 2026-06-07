<script setup lang="ts">
import { ref, h } from 'vue'

const activeTab = ref('Overview')
const heroTabs = ['Overview', 'Hotels', 'Itinerary', 'Flights']

// 补充 WarnTriangle 组件定义
const WarnTriangle = {
  render() {
    return h(
      'svg',
      {
        width: 16,
        height: 16,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': 2,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      },
      [
        h('path', {
          d: 'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z'
        }),
        h('line', { x1: 12, y1: 9, x2: 12, y2: 13 }),
        h('line', { x1: 12, y1: 17, x2: 12.01, y2: 17 })
      ]
    )
  }
}

// weather bar chart data (simplified week view)
const budgetBars = Array.from({ length: 10 }, (_, i) => ({
  filled: i < 6,
  height: 8 + Math.random() * 8,
}))

// crowd calendar - 7 cols x 4 rows
const crowdCells = Array.from({ length: 28 }, (_, i) => ({
  active: i === 17,
  busy: [5, 6, 12, 13, 19, 20, 26, 27].includes(i),
}))
</script>

<template>
  <div class="app-shell">
    <!-- ===== Left Sidebar ===== -->
    <aside class="sidebar">
      <div class="sidebar-top">
        <div class="brand-dot"></div>
        <nav class="sidebar-nav">
          <div class="nav-icon active">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
          <div class="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
          </div>
          <div class="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
          </div>
          <div class="nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
          </div>
        </nav>
      </div>
      <div class="sidebar-bottom">
        <div class="nav-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.32 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
        </div>
        <div class="nav-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
        </div>
        <div class="user-avatar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
      </div>
    </aside>

    <!-- ===== Main Area ===== -->
    <div class="main-area">
      <!-- Top Tab Bar -->
      <div class="tab-bar">
        <div class="tab-bar-left">
          <div class="tab active-tab">
            <span>Travel planning</span>
            <svg class="tab-close" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </div>
          <div class="tab new-tab">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>New chat</span>
          </div>
        </div>
        <div class="tab-bar-right">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </div>
      </div>

      <!-- Hero Banner -->
      <div class="hero-banner">
        <div class="hero-bg"></div>
        <div class="hero-overlay"></div>
        <div class="hero-content">
          <div class="hero-top">
            <div class="hero-left">
              <div class="hero-location">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff" stroke="none"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3" fill="#2D9CDB"/></svg>
                <span>Greece</span>
              </div>
              <h1 class="hero-title">Santorini</h1>
              <p class="hero-desc">Santorini is a beautiful city located in the Aegean Sea, in Greece. It is known for its stunning views of the sea, the white-washed buildings, and the blue-domed churches.</p>
              <div class="hero-actions">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              </div>
            </div>
            <div class="hero-right">
              <div class="hero-thumbs">
                <div class="thumb-img" style="background: linear-gradient(135deg, #87CEEB, #4682B4);"></div>
                <div class="thumb-img" style="background: linear-gradient(135deg, #F4A460, #DEB887);"></div>
                <div class="thumb-img" style="background: linear-gradient(135deg, #ADD8E6, #87CEEB);"></div>
                <div class="thumb-img" style="background: linear-gradient(135deg, #FFDAB9, #F5DEB3);"></div>
                <div class="thumb-img" style="background: linear-gradient(135deg, #B0C4DE, #6495ED);"></div>
                <div class="thumb-more">+5</div>
              </div>
              <div class="hero-view-icons">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              </div>
            </div>
          </div>
          <div class="hero-tabs">
            <button
              v-for="tab in heroTabs"
              :key="tab"
              :class="['hero-tab', { 'hero-tab-active': activeTab === tab }]"
              @click="activeTab = tab"
            >{{ tab }}</button>
          </div>
        </div>
      </div>

      <!-- Content Area -->
      <div class="content-area">
        <!-- Left: Assistant -->
        <div class="assistant-card">
          <div class="assistant-header">
            <div class="assistant-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#111"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              <span>Assistant</span>
            </div>
            <svg class="assistant-expand" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
          </div>
          <p class="assistant-text">Ready to dive into some hotel options or maybe an itinerary?</p>
          <div class="assistant-buttons">
            <button class="assistant-btn">Hotel options</button>
            <button class="assistant-btn">Itinerary</button>
            <button class="assistant-btn">Things to do</button>
          </div>
          <div class="assistant-input-bar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
            <div class="input-spacer"></div>
            <div class="input-circle-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
            </div>
            <div class="input-circle-btn send-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff" stroke="none"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </div>
          </div>
        </div>

        <!-- Right: Cards + Map -->
        <div class="right-panel">
          <div class="info-cards-row">
            <!-- Weather Card -->
            <div class="info-card weather-card">
              <div class="card-icon-label">
                <div class="sun-icon">
                  <svg width="48" height="48" viewBox="0 0 64 64">
                    <defs>
                      <radialGradient id="sunGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stop-color="#FFE066"/>
                        <stop offset="100%" stop-color="#FFB823"/>
                      </radialGradient>
                    </defs>
                    <circle cx="32" cy="32" r="16" fill="url(#sunGrad)"/>
                    <g stroke="#FFD042" stroke-width="2.5" stroke-linecap="round">
                      <line x1="32" y1="6" x2="32" y2="12"/>
                      <line x1="32" y1="52" x2="32" y2="58"/>
                      <line x1="6" y1="32" x2="12" y2="32"/>
                      <line x1="52" y1="32" x2="58" y2="32"/>
                      <line x1="13.6" y1="13.6" x2="17.8" y2="17.8"/>
                      <line x1="46.2" y1="46.2" x2="50.4" y2="50.4"/>
                      <line x1="13.6" y1="50.4" x2="17.8" y2="46.2"/>
                      <line x1="46.2" y1="17.8" x2="50.4" y2="13.6"/>
                    </g>
                  </svg>
                </div>
              </div>
              <div class="weather-value">28<span class="weather-unit">℃</span></div>
              <div class="weather-sub">For your dates</div>
            </div>

            <!-- Budget Card -->
            <div class="info-card budget-card">
              <div class="card-icon-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
                <span class="card-label">Budget</span>
              </div>
              <div class="budget-value">$1,581 - $3,162</div>
              <div class="budget-sub">One week trip</div>
              <div class="budget-bars">
                <div
                  v-for="(bar, i) in budgetBars"
                  :key="i"
                  :class="['budget-bar', { 'budget-bar-filled': bar.filled }]"
                  :style="{ height: bar.height + 'px' }"
                ></div>
              </div>
            </div>

            <!-- Crowd Card -->
            <div class="info-card crowd-card">
              <div class="card-icon-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                <span class="card-label">Crowd</span>
              </div>
              <div class="crowd-value">Not too busy</div>
              <div class="crowd-sub">Jun</div>
              <div class="crowd-calendar">
                <div
                  v-for="(cell, i) in crowdCells"
                  :key="i"
                  :class="['crowd-cell', {
                    'crowd-cell-active': cell.active,
                    'crowd-cell-busy': cell.busy && !cell.active,
                  }]"
                ></div>
              </div>
            </div>
          </div>

          <!-- Map -->
          <div class="map-card">
            <div class="map-container">
              <svg class="map-svg" viewBox="0 0 600 300" fill="none">
                <rect width="600" height="300" fill="#D1E7FF"/>
                <path d="M150 140 Q200 100 300 110 Q400 120 450 150 Q440 180 350 190 Q250 200 180 180 Z" fill="#E8E4D8" stroke="#C4B89A" stroke-width="1"/>
                <path d="M220 145 Q280 130 350 140 Q380 150 370 165 Q310 170 250 165 Z" fill="#B8D8F0"/>
                <line x1="200" y1="130" x2="400" y2="140" stroke="#C4B89A" stroke-width="1" stroke-dasharray="3,3"/>
                <line x1="280" y1="115" x2="300" y2="175" stroke="#C4B89A" stroke-width="1" stroke-dasharray="3,3"/>
                <g class="map-marker">
                  <circle cx="280" cy="125" r="8" fill="#27AE60"/>
                  <circle cx="280" cy="125" r="3" fill="#fff"/>
                </g>
                <g class="map-marker">
                  <circle cx="350" cy="145" r="8" fill="#27AE60"/>
                  <circle cx="350" cy="145" r="3" fill="#fff"/>
                </g>
                <g class="map-marker-gray">
                  <circle cx="230" cy="150" r="6" fill="#999"/>
                  <text x="230" y="165" text-anchor="middle" fill="#555" font-size="8" font-family="system-ui">Megalochori</text>
                </g>
                <g class="map-marker-gray">
                  <circle cx="370" cy="130" r="6" fill="#999"/>
                  <text x="370" y="122" text-anchor="middle" fill="#555" font-size="8" font-family="system-ui">Kamari</text>
                </g>
                <g class="map-marker-gray">
                  <circle cx="200" cy="155" r="6" fill="#999"/>
                  <text x="200" y="170" text-anchor="middle" fill="#555" font-size="8" font-family="system-ui">Akrotiri</text>
                </g>
                <g class="map-marker-gray">
                  <circle cx="300" cy="155" r="6" fill="#999"/>
                  <text x="300" y="170" text-anchor="middle" fill="#555" font-size="8" font-family="system-ui">Fira</text>
                </g>
              </svg>
              <div class="map-controls">
                <button class="map-ctrl-btn">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
                <button class="map-ctrl-btn">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
                <button class="map-ctrl-btn">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                </button>
              </div>
              <div class="map-bottom-bar">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/></svg>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"><circle cx="12" cy="10" r="3"/><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 10-16 0c0 3 2.7 7 8 11.7z"/></svg>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
              </div>
              <div class="spot-card">
                <div class="spot-thumb" style="background: linear-gradient(135deg, #C4A35A, #8B7355);"></div>
                <div class="spot-info">
                  <div class="spot-name">Ancient Thera</div>
                  <div class="spot-stars">
                    <svg v-for="n in 4" :key="n" width="12" height="12" viewBox="0 0 24 24" fill="#FFB823" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#DDD" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  </div>
                </div>
                <button class="spot-go-btn">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ============================================
   RESET & BASE
   ============================================ */
* { box-sizing: border-box; margin: 0; padding: 0; }

.app-shell {
  display: flex;
  height: 100vh;
  width: 100vw;
  background: #F5F7FA;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', Roboto, Helvetica, Arial, sans-serif;
  overflow: hidden;
}

/* ============================================
   LEFT SIDEBAR
   ============================================ */
.sidebar {
  width: 72px;
  background: #F5F7FA;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  flex-shrink: 0;
  border-right: 1px solid #E5E7EB;
}

.sidebar-top {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.brand-dot {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #F9D423, #F5A623);
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(245, 166, 35, 0.3);
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.nav-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  color: #999;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-icon:hover {
  background: #E5E7EB;
  color: #2D9CDB;
}

.nav-icon.active {
  background: #E1F0FA;
  color: #2D9CDB;
}

.sidebar-bottom {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667EEA, #764BA2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 8px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

/* ============================================
   MAIN AREA
   ============================================ */
.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

/* ============================================
   TAB BAR
   ============================================ */
.tab-bar {
  height: 52px;
  background: #FFFFFF;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  flex-shrink: 0;
}

.tab-bar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.active-tab {
  background: #111;
  color: #fff;
}

.active-tab .tab-close {
  opacity: 0.6;
}

.tab-close {
  opacity: 0.4;
  cursor: pointer;
}

.tab-close:hover {
  opacity: 1;
}

.new-tab {
  background: #F3F4F6;
  color: #666;
}

.new-tab:hover {
  background: #E5E7EB;
}

.tab-bar-right {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

/* ============================================
   HERO BANNER
   ============================================ */
.hero-banner {
  position: relative;
  height: 280px;
  flex-shrink: 0;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, #6CB4EE 0%, #87CEEB 40%, #B0D4E8 70%, #E8D5B7 90%, #F5DEB3 100%),
    linear-gradient(135deg, #4682B4 0%, #5B9BD5 50%, #87CEEB 100%);
  background-size: cover;
  filter: blur(1px);
}

.hero-bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 20px 30px at 75% 65%, #F5F0E8 0%, transparent 100%),
    linear-gradient(transparent 55%, rgba(245, 240, 232, 0.6) 55%, rgba(245, 240, 232, 0.6) 75%, transparent 75%),
    linear-gradient(transparent 60%, rgba(240, 235, 225, 0.5) 60%, rgba(240, 235, 225, 0.5) 80%, transparent 80%);
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(100deg, rgba(45, 156, 219, 0.75) 0%, rgba(15, 76, 129, 0.85) 100%);
}

.hero-content {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 24px 32px 20px;
}

.hero-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.hero-left {
  max-width: 560px;
}

.hero-location {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 500;
  margin-bottom: 8px;
}

.hero-title {
  font-size: 48px;
  font-weight: 700;
  color: #FFFFFF;
  line-height: 1.1;
  margin-bottom: 12px;
  letter-spacing: -0.5px;
}

.hero-desc {
  font-size: 14px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  max-width: 440px;
}

.hero-actions {
  display: flex;
  gap: 16px;
  margin-top: 16px;
  cursor: pointer;
}

.hero-actions svg {
  opacity: 0.7;
  transition: opacity 0.2s;
}

.hero-actions svg:hover {
  opacity: 1;
}

.hero-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

.hero-thumbs {
  display: flex;
  gap: 8px;
  align-items: center;
}

.thumb-img {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.thumb-more {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  transition: background 0.2s;
}

.thumb-more:hover {
  background: rgba(255, 255, 255, 0.4);
}

.hero-view-icons {
  display: flex;
  gap: 10px;
}

.hero-view-icons svg {
  cursor: pointer;
  transition: stroke 0.2s;
}

.hero-view-icons svg:hover {
  stroke: #fff;
}

.hero-tabs {
  display: flex;
  gap: 4px;
}

.hero-tab {
  padding: 8px 20px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.hero-tab:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.hero-tab-active {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

/* ============================================
   CONTENT AREA
   ============================================ */
.content-area {
  flex: 1;
  display: flex;
  gap: 24px;
  padding: 24px 32px;
  overflow: auto;
  min-height: 0;
}

/* ============================================
   ASSISTANT CARD
   ============================================ */
.assistant-card {
  width: 380px;
  min-width: 320px;
  background: linear-gradient(180deg, #F9F3B6 0%, #F0E87E 100%);
  border-radius: 20px;
  padding: 28px 24px 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-shrink: 0;
  box-shadow: 0 4px 16px rgba(240, 232, 126, 0.25);
}

.assistant-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.assistant-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #111;
}

.assistant-expand {
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.2s;
}

.assistant-expand:hover {
  opacity: 1;
}

.assistant-text {
  font-size: 14px;
  color: #333;
  line-height: 1.6;
  margin-bottom: 24px;
}

.assistant-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
}

.assistant-btn {
  padding: 8px 16px;
  border-radius: 20px;
  border: none;
  background: rgba(255, 255, 255, 0.6);
  color: #444;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  backdrop-filter: blur(4px);
}

.assistant-btn:hover {
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.assistant-input-bar {
  display: flex;
  align-items: center;
  gap: 10px;
}

.input-spacer {
  flex: 1;
}

.input-circle-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #111;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
}

.input-circle-btn:hover {
  background: #333;
}

.send-btn {
  background: #111;
}

/* ============================================
   RIGHT PANEL
   ============================================ */
.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}

.info-cards-row {
  display: flex;
  gap: 16px;
}

.info-card {
  flex: 1;
  background: #FFFFFF;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.info-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.card-icon-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.card-label {
  font-size: 12px;
  color: #999;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Weather */
.weather-card {
  display: flex;
  flex-direction: column;
}

.sun-icon {
  margin-bottom: 8px;
}

.weather-value {
  font-size: 36px;
  font-weight: 700;
  color: #111;
  line-height: 1;
}

.weather-unit {
  font-size: 18px;
  font-weight: 500;
  color: #333;
}

.weather-sub {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

/* Budget */
.budget-value {
  font-size: 18px;
  font-weight: 600;
  color: #111;
  margin-bottom: 2px;
}

.budget-sub {
  font-size: 12px;
  color: #999;
  margin-bottom: 12px;
}

.budget-bars {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 24px;
}

.budget-bar {
  width: 20px;
  min-height: 4px;
  border-radius: 3px;
  background: #E5E7EB;
  transition: all 0.3s ease;
}

.budget-bar-filled {
  background: linear-gradient(180deg, #2ECC71, #27AE60);
}

/* Crowd */
.crowd-value {
  font-size: 16px;
  font-weight: 600;
  color: #111;
  margin-bottom: 2px;
}

.crowd-sub {
  font-size: 12px;
  color: #999;
  margin-bottom: 10px;
}

.crowd-calendar {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 3px;
}

.crowd-cell {
  aspect-ratio: 1;
  border-radius: 3px;
  background: #F0F0F0;
  transition: all 0.15s ease;
}

.crowd-cell-busy {
  background: #D4EDDA;
}

.crowd-cell-active {
  background: #27AE60;
  box-shadow: 0 0 0 2px rgba(39, 174, 96, 0.3);
}

/* ============================================
   MAP
   ============================================ */
.map-card {
  flex: 1;
  min-height: 280px;
}

.map-container {
  position: relative;
  width: 100%;
  height: 100%;
  background: #FFFFFF;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.map-svg {
  width: 100%;
  height: 100%;
}

.map-controls {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.map-ctrl-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #fff;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.15s ease;
}

.map-ctrl-btn:hover {
  background: #F3F4F6;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

.map-bottom-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40px;
  background: #fff;
  border-top: 1px solid #E5E7EB;
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 0 20px;
}

.map-bottom-bar svg {
  cursor: pointer;
  transition: stroke 0.2s;
}

.map-bottom-bar svg:hover {
  stroke: #2D9CDB;
}

.spot-card {
  position: absolute;
  bottom: 52px;
  left: 16px;
  background: #fff;
  border-radius: 12px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.spot-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.16);
}

.spot-thumb {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  flex-shrink: 0;
}

.spot-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.spot-name {
  font-size: 14px;
  font-weight: 500;
  color: #111;
}

.spot-stars {
  display: flex;
  gap: 2px;
}

.spot-go-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #111;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-left: 8px;
  transition: background 0.2s;
}

.spot-go-btn:hover {
  background: #333;
}

/* ============================================
   RESPONSIVE
   ============================================ */
@media (max-width: 1100px) {
  .content-area {
    flex-direction: column;
  }
  .assistant-card {
    width: 100%;
    min-width: unset;
  }
  .info-cards-row {
    min-width: unset;
  }
}

@media (max-width: 768px) {
  .sidebar {
    width: 56px;
  }
  .hero-title {
    font-size: 32px;
  }
  .hero-thumbs {
    display: none;
  }
  .info-cards-row {
    flex-direction: column;
  }
  .content-area {
    padding: 16px;
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
    animation: none !important;
  }
}
</style>