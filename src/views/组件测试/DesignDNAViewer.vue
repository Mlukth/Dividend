<template>
  <div class="dna-viewer">
    <!-- Header -->
    <header class="dna-header">
      <h1>🎨 Design DNA 参考库</h1>
      <p class="dna-subtitle">
        从 {{ sites.length }} 个欣赏的网站提取的设计 token，用于光伏监控系统 UI 重设计
      </p>
      <div class="dna-toolbar">
        <input v-model="searchQuery" placeholder="搜索网站 / 标签 / 风格..." class="dna-search" />
        <div class="dna-filters">
          <button
            v-for="tag in popularTags"
            :key="tag"
            :class="['dna-tag-btn', { active: activeTags.includes(tag) }]"
            @click="toggleTag(tag)"
          >{{ tag }}</button>
        </div>
      </div>
    </header>

    <!-- Grid -->
    <section class="dna-grid">
      <article
        v-for="site in filteredSites"
        :key="site.id"
        :class="['dna-card', { expanded: expandedId === site.id }]"
        @click="expandedId = expandedId === site.id ? null : site.id"
      >
        <div class="dna-card-header">
          <h2 class="dna-site-name">{{ site.id }}</h2>
          <span class="dna-moods">
            <span v-for="m in site.mood" :key="m" class="dna-mood-tag">{{ m }}</span>
          </span>
        </div>

        <!-- 收起时显示摘要 -->
        <div v-if="expandedId !== site.id" class="dna-card-preview">
          <div class="dna-quick-stats">
            <div class="dna-stat" v-if="site.designTokens?.colors">
              <span class="dna-stat-label">配色</span>
              <span class="dna-stat-value">{{ site.designTokens.colors.designApproach?.slice(0, 50) }}...</span>
            </div>
            <div class="dna-stat" v-if="site.designTokens?.typography">
              <span class="dna-stat-label">字体</span>
              <span class="dna-stat-value">
                {{ site.designTokens.typography.customFonts?.join(', ') || site.designTokens.typography.primaryFont || site.designTokens.typography.approach?.slice(0, 50) }}...
              </span>
            </div>
          </div>
          <div class="dna-notable-count">{{ site.notablePatterns?.length || 0 }} 个设计亮点</div>
        </div>

        <!-- 展开时显示完整信息 -->
        <div v-else class="dna-card-detail" @click.stop>
          <button class="dna-close-btn" @click="expandedId = null">✕</button>

          <!-- 配色板块 -->
          <section class="dna-section" v-if="site.designTokens?.colors">
            <h3>🎯 配色方案</h3>
            <p class="dna-approach">{{ site.designTokens.colors.designApproach }}</p>
            <div class="dna-color-row">
              <div class="dna-color-chip" v-if="site.designTokens.colors.primaryBackground">
                <div class="dna-color-swatch" :style="{ background: site.designTokens.colors.primaryBackground }" :class="{ 'is-light': isLightColor(site.designTokens.colors.primaryBackground) }"></div>
                <span>主背景</span>
                <code>{{ site.designTokens.colors.primaryBackground }}</code>
              </div>
              <div class="dna-color-chip" v-if="site.designTokens.colors.primaryText">
                <div class="dna-color-swatch" :style="{ background: site.designTokens.colors.primaryText }" :class="{ 'is-light': isLightColor(site.designTokens.colors.primaryText) }"></div>
                <span>主文字</span>
                <code>{{ site.designTokens.colors.primaryText }}</code>
              </div>
              <div class="dna-color-chip" v-if="site.designTokens.colors.accent">
                <div class="dna-color-swatch" :style="{ background: site.designTokens.colors.accent }" :class="{ 'is-light': isLightColor(site.designTokens.colors.accent) }"></div>
                <span>强调色</span>
                <code>{{ site.designTokens.colors.accent }}</code>
              </div>
            </div>
            <!-- 完整色板 -->
            <div class="dna-palette" v-if="site.designTokens.colors.palette">
              <div v-for="(shades, name) in site.designTokens.colors.palette" :key="name" class="dna-palette-row">
                <span class="dna-palette-name">{{ name }}</span>
                <div class="dna-palette-swatches">
                  <div v-for="(hex, level) in shades" :key="level" class="dna-palette-chip" :style="{ background: hex }" :title="`${name}-${level}: ${hex}`"></div>
                </div>
              </div>
            </div>
          </section>

          <!-- 字体板块 -->
          <section class="dna-section" v-if="site.designTokens?.typography">
            <h3>🔤 字体系统</h3>
            <p class="dna-approach">{{ site.designTokens.typography.approach }}</p>
            <div class="dna-font-list" v-if="site.designTokens.typography.customFonts?.length">
              <span class="dna-label">定制字体:</span>
              <code v-for="f in site.designTokens.typography.customFonts" :key="f" class="dna-font-tag">{{ f }}</code>
            </div>
            <div class="dna-font-list" v-if="site.designTokens.typography.googleFonts?.length">
              <span class="dna-label">Google Fonts:</span>
              <code v-for="f in site.designTokens.typography.googleFonts" :key="f" class="dna-font-tag">{{ f }}</code>
            </div>
            <div class="dna-font-meta" v-if="site.designTokens.typography.weights">
              <span class="dna-label">字重:</span>
              <code>{{ site.designTokens.typography.weights.join(', ') }}</code>
            </div>
            <div class="dna-font-meta" v-if="site.designTokens.typography.scale">
              <span class="dna-label">字号层级:</span>
              <code>{{ site.designTokens.typography.scale.join(' → ') }}</code>
            </div>
          </section>

          <!-- 动画板块 -->
          <section class="dna-section" v-if="site.designTokens?.animation">
            <h3>✨ 动画风格</h3>
            <p class="dna-approach">{{ site.designTokens.animation.approach || site.designTokens.animation.style }}</p>
            <div class="dna-font-meta" v-if="site.designTokens.animation.customEasing">
              <span class="dna-label">缓动曲线:</span>
              <code>{{ site.designTokens.animation.customEasing }}</code>
            </div>
            <div class="dna-font-meta" v-if="site.designTokens.animation.duration">
              <span class="dna-label">过渡时长:</span>
              <code>{{ site.designTokens.animation.duration }}</code>
            </div>
          </section>

          <!-- 间距板块 -->
          <section class="dna-section" v-if="site.designTokens?.spacing">
            <h3>📐 间距与布局</h3>
            <p class="dna-approach">{{ site.designTokens.spacing.approach }}</p>
            <div class="dna-font-meta" v-if="site.designTokens.spacing.unit">
              <span class="dna-label">基础单位:</span>
              <code>{{ site.designTokens.spacing.unit }}</code>
            </div>
            <div class="dna-font-meta" v-if="site.designTokens.spacing.notable">
              <span class="dna-label">亮点:</span>
              <span>{{ site.designTokens.spacing.notable }}</span>
            </div>
          </section>

          <!-- 设计亮点 -->
          <section class="dna-section" v-if="site.notablePatterns?.length">
            <h3>💡 {{ site.notablePatterns.length }} 个设计亮点</h3>
            <ul class="dna-patterns">
              <li v-for="p in site.notablePatterns" :key="p">{{ p }}</li>
            </ul>
          </section>

          <!-- 原始 JSON -->
          <details class="dna-raw">
            <summary>查看原始 JSON</summary>
            <pre>{{ JSON.stringify(site, null, 2) }}</pre>
          </details>
        </div>
      </article>
    </section>

    <!-- 空状态 -->
    <div v-if="filteredSites.length === 0" class="dna-empty">
      没有匹配的网站，试试换个搜索词或标签
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const sites = ref([])
const searchQuery = ref('')
const activeTags = ref([])
const expandedId = ref(null)

const allTags = computed(() => {
  const tags = new Set()
  sites.value.forEach(s => {
    s.mood?.forEach(m => tags.add(m))
    s.tags?.forEach(t => tags.add(t))
  })
  return [...tags].sort()
})

const popularTags = computed(() => allTags.value.slice(0, 12))

const filteredSites = computed(() => {
  let result = sites.value
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(s =>
      s.id.includes(q) ||
      s.mood?.some(m => m.includes(q)) ||
      s.tags?.some(t => t.includes(q)) ||
      JSON.stringify(s.notablePatterns).toLowerCase().includes(q)
    )
  }
  if (activeTags.value.length) {
    result = result.filter(s =>
      activeTags.value.some(t => (s.mood || []).includes(t) || (s.tags || []).includes(t))
    )
  }
  return result
})

function toggleTag(tag) {
  const idx = activeTags.value.indexOf(tag)
  if (idx >= 0) activeTags.value.splice(idx, 1)
  else activeTags.value.push(tag)
}

function isLightColor(hex) {
  if (!hex || !hex.startsWith('#')) return false
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) > 128
}

onMounted(async () => {
  // Vite 静态导入所有站点 JSON
  const siteModules = import.meta.glob('./design-dna/sites/*.json', { eager: true })
  const indexModule = import.meta.glob('./design-dna/index.json', { eager: true })
  const indexData = Object.values(indexModule)[0]?.default

  const loaded = Object.entries(siteModules).map(([path, mod]) => {
    const data = mod.default || mod
    const id = path.split('/').pop().replace('.json', '')
    const indexEntry = indexData?.sites?.find(e => e.id === id)
    return { ...data, tags: indexEntry?.tags || [] }
  })
  sites.value = loaded
})
</script>

<style scoped>
.dna-viewer {
  min-height: 100vh;
  background: #0d0d0d;
  color: #e0e0e0;
  font-family: system-ui, -apple-system, sans-serif;
  padding: 24px;
}

.dna-header {
  margin-bottom: 32px;
}

.dna-header h1 {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 4px;
  color: #ffffff;
}

.dna-subtitle {
  font-size: 14px;
  color: #888;
  margin: 0 0 20px;
}

.dna-toolbar {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dna-search {
  width: 100%;
  max-width: 480px;
  padding: 10px 16px;
  border-radius: 8px;
  border: 1px solid #333;
  background: #1a1a1a;
  color: #e0e0e0;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.dna-search:focus {
  border-color: #666;
}

.dna-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.dna-tag-btn {
  padding: 4px 12px;
  border-radius: 99px;
  border: 1px solid #333;
  background: transparent;
  color: #999;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.dna-tag-btn:hover {
  border-color: #666;
  color: #ccc;
}

.dna-tag-btn.active {
  background: #333;
  border-color: #666;
  color: #fff;
}

/* Grid */
.dna-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 16px;
}

.dna-card {
  background: #141414;
  border: 1px solid #222;
  border-radius: 10px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.dna-card:hover {
  border-color: #444;
  background: #181818;
}

.dna-card.expanded {
  grid-column: 1 / -1;
  cursor: default;
  border-color: #444;
}

.dna-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 12px;
}

.dna-site-name {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #fff;
}

.dna-moods {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: flex-end;
}

.dna-mood-tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 99px;
  background: #222;
  color: #999;
}

.dna-card-preview {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
}

.dna-quick-stats {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.dna-stat {
  display: flex;
  gap: 8px;
  font-size: 13px;
}

.dna-stat-label {
  color: #666;
  min-width: 32px;
  flex-shrink: 0;
}

.dna-stat-value {
  color: #aaa;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dna-notable-count {
  font-size: 12px;
  color: #555;
  flex-shrink: 0;
}

/* Detail */
.dna-card-detail {
  position: relative;
}

.dna-close-btn {
  position: absolute;
  right: 0;
  top: 0;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid #333;
  background: #1a1a1a;
  color: #999;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.dna-close-btn:hover {
  background: #333;
  color: #fff;
}

.dna-section {
  margin-bottom: 24px;
}

.dna-section h3 {
  font-size: 14px;
  font-weight: 600;
  color: #aaa;
  margin: 0 0 8px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.dna-approach {
  font-size: 14px;
  color: #bbb;
  margin: 0 0 12px;
  line-height: 1.6;
}

.dna-color-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.dna-color-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.dna-color-swatch {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  border: 1px solid #333;
}

.dna-color-swatch.is-light {
  border-color: #555;
}

.dna-color-chip span {
  font-size: 11px;
  color: #777;
}

.dna-color-chip code {
  font-size: 11px;
  color: #999;
}

.dna-palette {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dna-palette-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dna-palette-name {
  font-size: 11px;
  color: #777;
  width: 60px;
  flex-shrink: 0;
  text-align: right;
}

.dna-palette-swatches {
  display: flex;
  gap: 2px;
}

.dna-palette-chip {
  width: 20px;
  height: 20px;
  border-radius: 3px;
  border: 1px solid rgba(255,255,255,0.1);
}

.dna-font-list,
.dna-font-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 6px;
  font-size: 13px;
}

.dna-label {
  color: #666;
  flex-shrink: 0;
}

.dna-font-tag {
  padding: 2px 8px;
  border-radius: 4px;
  background: #1a1a1a;
  color: #aaa;
  font-size: 12px;
  font-family: 'Courier New', monospace;
}

.dna-font-meta code {
  color: #aaa;
  font-size: 12px;
}

.dna-patterns {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.dna-patterns li {
  font-size: 13px;
  color: #bbb;
  padding-left: 16px;
  position: relative;
  line-height: 1.5;
}

.dna-patterns li::before {
  content: '→';
  position: absolute;
  left: 0;
  color: #555;
}

.dna-raw {
  margin-top: 16px;
  border-top: 1px solid #222;
  padding-top: 12px;
}

.dna-raw summary {
  font-size: 12px;
  color: #666;
  cursor: pointer;
}

.dna-raw pre {
  margin-top: 8px;
  font-size: 11px;
  color: #777;
  max-height: 300px;
  overflow: auto;
  background: #0d0d0d;
  padding: 12px;
  border-radius: 6px;
}

.dna-empty {
  text-align: center;
  color: #555;
  padding: 60px 0;
  font-size: 14px;
}
</style>
