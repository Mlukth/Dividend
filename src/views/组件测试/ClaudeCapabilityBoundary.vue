<template>
  <div class="boundary-root">
    <header class="boundary-header">
      <h1>Claude Code 联网能力边界</h1>
      <p>
        从 <b>Claude Code</b>（运行在 Windows 中国网络环境下）的视角，
        展示通过 <b>Tavily API</b> + <b>Firecrawl</b> + <b>WebSearch/WebFetch</b> 三条通道
        能触及的互联网信息范围。
      </p>
    </header>

    <!-- ====== Tab 切换 ====== -->
    <div class="tab-row">
      <button
        v-for="t in tabs" :key="t.id"
        :class="['tab-btn', { active: activeTab === t.id }]"
        @click="activeTab = t.id"
      >{{ t.label }}</button>
    </div>

    <!-- ================================================================ -->
    <!-- TAB 1: 理论边界 — 韦恩图 -->
    <!-- ================================================================ -->
    <template v-if="activeTab === 'boundary'">
      <div class="venn-wrap" ref="vennWrapRef">
        <svg viewBox="0 0 1000 700" xmlns="http://www.w3.org/2000/svg" @mousemove="onSvgMouseMove" @mouseleave="tooltip.show = false">
          <g v-for="ly in layers" :key="ly.id"
            @mouseenter="onLayerEnter(ly, $event)"
            @mouseleave="onLayerLeave(ly)"
          >
            <ellipse
              :cx="ly.cx" :cy="ly.cy" :rx="ly.rx" :ry="ly.ry"
              :fill="ly.color"
              :fill-opacity="hoveredLayer === ly.id ? 0.55 : ly.fillOpacity"
              :stroke="ly.textColor"
              :stroke-width="hoveredLayer === ly.id ? 3 : ly.strokeWidth"
              :stroke-dasharray="ly.dash || ''"
              :stroke-opacity="hoveredLayer === ly.id ? 1 : 0.55"
              :transform="ly.transform || ''"
              class="venn-ellipse"
            />
            <text :x="ly.labelX" :y="ly.labelY" text-anchor="middle" :fill="ly.textColor"
              :font-size="ly.id === 'window' ? 13 : 11" :font-weight="ly.id === 'window' ? 700 : 600" pointer-events="none">
              <tspan :x="ly.labelX" dy="0">{{ ly.label }}</tspan>
              <tspan :x="ly.labelX" dy="16" font-size="9" fill-opacity="0.7">{{ ly.sub }}</tspan>
            </text>
          </g>
          <g @mouseenter="onCenterEnter" @mouseleave="onCenterLeave" style="cursor:pointer;">
            <circle cx="492" cy="348" r="18" fill="#6c8cff" fill-opacity="0.9" stroke="#fff" stroke-width="2" />
            <text x="492" y="352" text-anchor="middle" fill="#fff" font-size="9" font-weight="700" pointer-events="none">我</text>
          </g>
          <line x1="330" y1="210" x2="230" y2="148" stroke="#ff6b7a" stroke-width="1" stroke-dasharray="3,3" opacity="0.5" />
          <text x="152" y="140" fill="#ff6b7a" font-size="9" opacity="0.65">96%技术覆盖</text>
          <line x1="380" y1="340" x2="280" y2="395" stroke="#ffe66d" stroke-width="1" stroke-dasharray="3,3" opacity="0.5" />
          <text x="200" y="412" fill="#ffe66d" font-size="9" opacity="0.65">付费墙~40%</text>
        </svg>
        <div v-if="tooltip.show" class="venn-tooltip" :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }">
          <strong>{{ tooltip.title }}</strong>
          <div>{{ tooltip.desc }}</div>
        </div>
      </div>

      <div class="legend-row">
        <span v-for="ly in layers" :key="ly.id" class="legend-chip"
          :style="{ '--chip-color': ly.textColor, '--chip-bg': ly.color }"
          @mouseenter="hoveredLayer = ly.id" @mouseleave="hoveredLayer = null">
          <span class="legend-dot" :style="{ background: ly.color, borderColor: ly.textColor }"></span>{{ ly.label }}
        </span>
      </div>

      <div class="stats-grid">
        <div v-for="s in statsData" :key="s.label" class="stat-card">
          <div class="stat-num" :style="{ color: s.color }">{{ s.num }}</div>
          <div class="stat-label">{{ s.label }}</div>
        </div>
      </div>
    </template>

    <!-- ================================================================ -->
    <!-- TAB 2: 单次任务漏斗 -->
    <!-- ================================================================ -->
    <template v-if="activeTab === 'funnel'">
      <!-- 场景选择 -->
      <div class="scenario-pills">
        <button v-for="s in scenarios" :key="s.id"
          :class="['scenario-pill', { active: activeScenario === s.id }]"
          @click="activeScenario = s.id">
          {{ s.icon }} {{ s.label }}
        </button>
      </div>

      <!-- 漏斗 SVG -->
      <div class="funnel-svg-wrap">
        <svg viewBox="0 0 1000 600" xmlns="http://www.w3.org/2000/svg">
          <!-- 背景网格线 -->
          <line v-for="y in [80,180,280,380,480]" :key="'grid'+y" x1="80" :x2="920" :y1="y" :y2="y"
            stroke="#2a2d3a" stroke-width="0.5" stroke-dasharray="4,8" />

          <!-- 漏斗阶段条 -->
          <g v-for="(stage, si) in currentFunnel" :key="stage.label">
            <!-- 条形 -->
            <rect
              :x="stage.x" :y="stage.y"
              :width="stage.w" :height="60"
              :rx="8" :ry="8"
              :fill="stage.color"
              :fill-opacity="hoveredStage === si ? 0.65 : 0.35"
              :stroke="stage.textColor"
              :stroke-width="hoveredStage === si ? 2.5 : 1.2"
              :stroke-opacity="hoveredStage === si ? 1 : 0.5"
              class="funnel-bar"
              @mouseenter="hoveredStage = si"
              @mouseleave="hoveredStage = null"
            />
            <!-- 数字 -->
            <text :x="stage.x + stage.w / 2" :y="stage.y + 28" text-anchor="middle"
              :fill="stage.textColor" font-size="22" font-weight="700" pointer-events="none">
              {{ stage.num }}
            </text>
            <!-- 阶段名 -->
            <text :x="stage.x + stage.w / 2" :y="stage.y + 50" text-anchor="middle"
              :fill="stage.textColor" font-size="11" fill-opacity="0.8" pointer-events="none">
              {{ stage.label }}
            </text>

            <!-- 损失标注（除最后一层外） -->
            <template v-if="si < currentFunnel.length - 1">
              <line :x1="stage.x + stage.w + 12" :y1="stage.y + 30"
                :x2="stage.x + stage.w + 55" :y2="stage.y + 30"
                :stroke="stage.lossColor" stroke-width="1" stroke-dasharray="3,2" opacity="0.6" />
              <text :x="stage.x + stage.w + 60" :y="stage.y + 24"
                :fill="stage.lossColor" font-size="10" font-weight="600" pointer-events="none">
                {{ stage.loss }}
              </text>
              <text :x="stage.x + stage.w + 60" :y="stage.y + 40"
                :fill="stage.lossColor" font-size="9" fill-opacity="0.65" pointer-events="none">
                {{ stage.lossReason }}
              </text>
            </template>
          </g>

          <!-- hover 详情气泡 -->
          <g v-if="hoveredStage !== null">
            <rect :x="currentFunnel[hoveredStage].x + currentFunnel[hoveredStage].w / 2 - 120"
              :y="currentFunnel[hoveredStage].y - 52"
              width="240" height="42" rx="6"
              fill="#1a1d27" stroke="#2a2d3a" stroke-width="1" />
            <text :x="currentFunnel[hoveredStage].x + currentFunnel[hoveredStage].w / 2"
              :y="currentFunnel[hoveredStage].y - 32"
              text-anchor="middle" fill="#e1e4eb" font-size="10">
              {{ currentFunnel[hoveredStage].detail }}
            </text>
            <text :x="currentFunnel[hoveredStage].x + currentFunnel[hoveredStage].w / 2"
              :y="currentFunnel[hoveredStage].y - 18"
              text-anchor="middle" fill="#8b8fa3" font-size="9">
              剩余率 {{ currentFunnel[hoveredStage].rate }}
            </text>
          </g>
        </svg>
      </div>

      <!-- 三档对比卡片 -->
      <div class="compare-grid">
        <div v-for="s in scenarios" :key="s.id" class="compare-card"
          :class="{ highlight: activeScenario === s.id }">
          <div class="compare-head">
            <span class="compare-icon">{{ s.icon }}</span>
            <span class="compare-label">{{ s.label }}</span>
          </div>
          <div class="compare-stats">
            <div class="compare-row">
              <span>搜索次数</span><span class="compare-val">{{ s.searches }}</span>
            </div>
            <div class="compare-row">
              <span>摘要接触</span><span class="compare-val">{{ s.snippets }}</span>
            </div>
            <div class="compare-row">
              <span>实际读全文</span><span class="compare-val">{{ s.fullReads }}</span>
            </div>
            <div class="compare-row">
              <span>最终引用</span><span class="compare-val compare-accent">{{ s.cited }}</span>
            </div>
          </div>
          <div class="compare-tagline">{{ s.tagline }}</div>
        </div>
      </div>

      <!-- 关键瓶颈说明 -->
      <div class="bottleneck-row">
        <div class="bottleneck-card">
          <span class="bn-emoji">💰</span>
          <strong>付费墙</strong>
          <p>~40% 专业/新闻内容有付费墙，摘要能看到但全文拿不到</p>
        </div>
        <div class="bottleneck-card">
          <span class="bn-emoji">🧠</span>
          <strong>Token衰减</strong>
          <p>读一篇网页 ≈ 3-8K tokens。读10篇就吃掉50K+，留给思考的空间不够</p>
        </div>
        <div class="bottleneck-card">
          <span class="bn-emoji">📉</span>
          <strong>回报递减</strong>
          <p>读到第5篇后新信息量急剧下降，大多数是重复观点</p>
        </div>
      </div>
    </template>

    <!-- ====== 详细面板（两tab共用） ====== -->
    <div class="detail-grid">
      <div class="detail-block">
        <h3>🔍 Tavily — 搜索引擎层</h3>
        <ul>
          <li class="warn">混合聚合型搜索（非自有独立索引）</li>
          <li class="warn">依赖第三方数据源 + 自有爬虫补充</li>
          <li>免费额度：1,000 credits / 月</li>
          <li>search: 1 credit，advanced: 2 credits</li>
          <li>extract: 1 credit / 5 URLs</li>
          <li>crawl / map：深度受限</li>
          <li>支持国家定向、时间过滤、域名过滤</li>
          <li>不透露索引规模（对比：Google >100B页，Brave 40B+页）</li>
        </ul>
      </div>
      <div class="detail-block">
        <h3>🕷 Firecrawl — 抓取引擎层</h3>
        <ul>
          <li class="good">自称 96% 网页覆盖率（含JS渲染）</li>
          <li>Fire-Engine：无头浏览器集群</li>
          <li>支持 scrape / crawl / map / search</li>
          <li class="bad">明确屏蔽：Instagram、YouTube、TikTok</li>
          <li class="bad">无法绕过：付费墙、登录墙、CAPTCHA</li>
          <li class="bad">结果 24h 后过期</li>
          <li>免费：500 credits</li>
          <li>P95延迟 3.4s</li>
        </ul>
      </div>
      <div class="detail-block">
        <h3>🚫 被阻挡的信息</h3>
        <ul>
          <li class="bad">付费墙（~40% 新闻/专业内容有付费墙）</li>
          <li class="bad">登录/认证墙（SaaS后台、企业内网）</li>
          <li class="bad">CAPTCHA / JS挑战（Cloudflare、DataDome等）</li>
          <li class="bad">IP风控封禁（地域黑名单、频率限制）</li>
          <li class="bad">robots.txt禁止（法律风险）</li>
          <li class="bad">社交平台（IG/YT/TT — Firecrawl主动屏蔽）</li>
          <li class="warn">中国境外：GFW屏蔽部分境外站点</li>
          <li class="warn">Dark Web / 暗网（不可索引）</li>
        </ul>
      </div>
      <div class="detail-block">
        <h3>✅ 最佳可获取信息</h3>
        <ul>
          <li class="good">公开博客、技术文档、开源项目页</li>
          <li class="good">新闻文章（非付费墙）</li>
          <li class="good">论坛帖子（Reddit、StackOverflow等）</li>
          <li class="good">学术论文（开放获取）</li>
          <li class="good">产品文档、官方API文档</li>
          <li class="good">GitHub README、Issues、Discussions</li>
          <li class="good">Wikipedia / Wikimedia</li>
          <li class="good">政府公开数据、统计报告</li>
        </ul>
      </div>
    </div>

    <footer class="boundary-footer">
      数据来源：Tavily官方文档 · Firecrawl官方博客 · WebsitePlanet 2025 Paywall Index · Siteefy互联网统计 · Mordor Intelligence · AIMultiple Benchmark 2026<br>
      估算值标注 ~ 表示基于多项数据源的最佳推断，非精确测量 · 生成时间 2026-06-13
    </footer>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

// ========================= TABS =========================
const tabs = [
  { id: 'boundary', label: '🌐 理论边界（韦恩图）' },
  { id: 'funnel',   label: '🔽 单次任务漏斗' },
]
const activeTab = ref('funnel')

// ========================= TAB 1: 韦恩图数据 =========================
const layers = [
  { id:'total',  label:'全部网站', sub:'~1.2B 站点', cx:500,cy:340,rx:440,ry:300, color:'#2a2d3a',textColor:'#8b8fa3',fillOpacity:.25,strokeWidth:1.2,dash:null,transform:null,labelX:500,labelY:58, desc:'互联网上注册的所有域名。包含不活跃站点、停放域名、内网系统等。' },
  { id:'active', label:'活跃公开站点', sub:'~200M 站点', cx:500,cy:340,rx:370,ry:250, color:'#3a3550',textColor:'#a78bfa',fillOpacity:.28,strokeWidth:1.2,dash:null,transform:null,labelX:500,labelY:108, desc:'实际有内容更新、可公开访问的网站。约占总域名数的 16%。' },
  { id:'indexed',label:'搜索引擎索引', sub:'~50M–80M 站点', cx:500,cy:340,rx:290,ry:195, color:'#2d3a50',textColor:'#6c8cff',fillOpacity:.28,strokeWidth:1.2,dash:null,transform:null,labelX:500,labelY:160, desc:'被 Google/Bing/Brave 等主流搜索引擎爬取并纳入索引的站点。' },
  { id:'tavily', label:'Tavily 可搜', sub:'~15M–30M 站点', cx:500,cy:340,rx:215,ry:145, color:'#1a4a4a',textColor:'#4ecdc4',fillOpacity:.30,strokeWidth:1.5,dash:'6,3',transform:null,labelX:500,labelY:210, desc:'Tavily 混合聚合触达范围。聚合器而非独立索引，覆盖依赖底层数据源。' },
  { id:'firecrawl',label:'Firecrawl 可爬', sub:'96% 技术覆盖', cx:440,cy:290,rx:155,ry:105, color:'#4a2a2a',textColor:'#ff6b7a',fillOpacity:.28,strokeWidth:1.5,dash:'8,4',transform:'rotate(-15,440,290)',labelX:440,labelY:178, desc:'Firecrawl 96% 技术覆盖。但屏蔽社交平台，无法绕付费墙/CAPTCHA。' },
  { id:'actual', label:'实际可获取', sub:'~40M–80M 站点', cx:470,cy:330,rx:110,ry:72, color:'#3a3a1a',textColor:'#ffe66d',fillOpacity:.38,strokeWidth:2,dash:null,transform:'rotate(10,470,330)',labelX:470,labelY:248, desc:'减除付费墙、登录墙、CAPTCHA、robots.txt、IP风控后。' },
  { id:'window', label:'我的有效窗口', sub:'~10M–30M 站点', cx:490,cy:345,rx:68,ry:46, color:'#1a3a2a',textColor:'#4ecdc4',fillOpacity:.5,strokeWidth:2.5,dash:null,transform:'rotate(-5,490,345)',labelX:490,labelY:288, desc:'Claude Code 实际可利用：Tavily + Firecrawl + WebFetch 并集，减去额度/速率/超时。' },
]

const statsData = [
  { num:'1.2B', label:'全部网站', color:'#8b8fa3' },
  { num:'200M', label:'活跃公开', color:'#a78bfa' },
  { num:'~65M', label:'搜索引擎索引', color:'#6c8cff' },
  { num:'~22M', label:'Tavily可搜', color:'#4ecdc4' },
  { num:'96% 技术', label:'Firecrawl覆盖', color:'#ff6b7a' },
  { num:'~55M', label:'实际可获取', color:'#ffe66d' },
  { num:'~18M', label:'有效窗口', color:'#4ecdc4' },
]

const hoveredLayer = ref(null)
const tooltip = reactive({ show:false, x:0, y:0, title:'', desc:'' })
const vennWrapRef = ref(null)

function onLayerEnter(ly, e) { hoveredLayer.value = ly.id; tooltip.show = true; tooltip.title = ly.label; tooltip.desc = ly.desc; updateTooltipPos(e) }
function onLayerLeave() { hoveredLayer.value = null; tooltip.show = false }
function onCenterEnter(e) { tooltip.show = true; tooltip.title = 'Claude Code'; tooltip.desc = '运行在 Windows 中国网络环境下。三条通道：Tavily + Firecrawl + WebSearch/WebFetch。实际有效范围受额度、速率、超时、GFW共同压缩。'; updateTooltipPos(e) }
function onCenterLeave() { tooltip.show = false }
function onSvgMouseMove(e) { if (tooltip.show) updateTooltipPos(e) }
function updateTooltipPos(e) { const r = vennWrapRef.value?.getBoundingClientRect(); if (!r) return; tooltip.x = e.clientX - r.left + 15; tooltip.y = e.clientY - r.top - 65 }

// ========================= TAB 2: 漏斗数据 =========================
const scenarios = [
  { id:'simple', icon:'🔍', label:'简单查证', searches:'1–2次', snippets:'10–20条', fullReads:'1–3篇', cited:'1–2个', tagline:'摘要基本够用，很少需要点进去' },
  { id:'medium', icon:'📋', label:'中等调研', searches:'3–5次', snippets:'30–50条', fullReads:'2–8篇', cited:'3–8个', tagline:'摘要过滤 → 精选几篇深读 → 交叉验证' },
  { id:'deep',   icon:'🔬', label:'深度研究', searches:'5–10次', snippets:'50–100条', fullReads:'5–20篇', cited:'5–15个', tagline:'多轮搜索 + 反方验证 + 综合报告' },
]
const activeScenario = ref('medium')

// 漏斗阶段配置（6层）
const funnelStageMeta = [
  { label:'搜索返回',     lossLabel:'标题过滤', lossReason:'标题/URL不相关',       color:'#3a3550', textColor:'#a78bfa', lossColor:'#ff9f43' },
  { label:'摘要筛选后',   lossLabel:'付费墙拦截', lossReason:'付费墙/登录墙/404',   color:'#2d3a50', textColor:'#6c8cff', lossColor:'#ff6b7a' },
  { label:'成功加载',     lossLabel:'信息密度低', lossReason:'广告多/内容短/重复',   color:'#1a4a4a', textColor:'#4ecdc4', lossColor:'#ff9f43' },
  { label:'值得全文读',   lossLabel:'Token取舍', lossReason:'token预算/时间约束',   color:'#3a3a1a', textColor:'#ffe66d', lossColor:'#ff6b7a' },
  { label:'深度引用',     lossLabel:'',          lossReason:'',                    color:'#1a3a2a', textColor:'#4ecdc4', lossColor:'' },
]

const funnelData = {
  simple:  [30,  12,  8,  3,  2],
  medium:  [50,  20,  12, 6,  5],
  deep:    [100, 35,  20, 12, 10],
}

const funnelDetail = {
  simple:  ['30条摘要', '12条看起来相关', '8个能打开', '3篇值得仔细读', '1-2个最终引用'],
  medium:  ['50条摘要', '20条看起来相关', '12个能打开', '6篇值得仔细读', '3-8个最终引用'],
  deep:    ['100条摘要', '35条看起来相关', '20个能打开', '12篇值得仔细读', '5-15个最终引用'],
}

const funnelRates = {
  simple:  ['100%', '40%', '27%', '10%', '5%'],
  medium:  ['100%', '40%', '24%', '12%', '8%'],
  deep:    ['100%', '35%', '20%', '12%', '8%'],
}

// 根据最大宽度 820px 和最大数值 100，计算每个阶段的条宽
const MAX_BAR_W = 820
const MAX_VAL = 100
const BAR_Y_START = 80
const BAR_Y_GAP = 100

const currentFunnel = computed(() => {
  const vals = funnelData[activeScenario.value]
  const details = funnelDetail[activeScenario.value]
  const rates = funnelRates[activeScenario.value]
  return funnelStageMeta.map((meta, i) => {
    const w = (vals[i] / MAX_VAL) * MAX_BAR_W
    return {
      ...meta,
      num: vals[i],
      w,
      x: (920 - w) / 2 + 80,  // center aligned
      y: BAR_Y_START + i * BAR_Y_GAP,
      detail: details[i],
      rate: rates[i],
      loss: meta.lossLabel,
      lossReason: meta.lossReason,
    }
  })
})

const hoveredStage = ref(null)
</script>

<style scoped>
/* ====== Root ====== */
.boundary-root {
  min-height: 100vh;
  background: #0f1117;
  color: #e1e4eb;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

/* ====== Header ====== */
.boundary-header {
  text-align: center;
  max-width: 850px;
}
.boundary-header h1 {
  font-size: 1.85rem;
  font-weight: 700;
  background: linear-gradient(135deg, #6c8cff, #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
}
.boundary-header p {
  color: #8b8fa3;
  font-size: 0.93rem;
  line-height: 1.6;
}

/* ====== Tabs ====== */
.tab-row {
  display: flex;
  gap: 0.5rem;
  background: #1a1d27;
  border: 1px solid #2a2d3a;
  border-radius: 10px;
  padding: 0.35rem;
}
.tab-btn {
  padding: 0.55rem 1.3rem;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #8b8fa3;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}
.tab-btn:hover { color: #e1e4eb; }
.tab-btn.active {
  background: #2a2d3a;
  color: #e1e4eb;
  font-weight: 600;
}

/* ====== Tab 1: Venn ====== */
.venn-wrap { position: relative; width: 100%; max-width: 1000px; }
.venn-wrap svg { width: 100%; height: auto; display: block; }
.venn-ellipse { transition: fill-opacity 0.25s, stroke-opacity 0.25s, stroke-width 0.25s; cursor: pointer; }

.venn-tooltip {
  position: absolute;
  background: #1a1d27;
  border: 1px solid #2a2d3a;
  border-radius: 8px;
  padding: 0.65rem 0.9rem;
  font-size: 0.82rem;
  pointer-events: none;
  max-width: 270px;
  box-shadow: 0 8px 28px rgba(0,0,0,0.55);
  z-index: 10;
  line-height: 1.45;
}
.venn-tooltip strong { display: block; margin-bottom: 0.2rem; color: #e1e4eb; }

.legend-row { display: flex; flex-wrap: wrap; gap: 0.5rem 1.2rem; justify-content: center; max-width: 950px; }
.legend-chip {
  display: flex; align-items: center; gap: 0.4rem; font-size: 0.82rem;
  color: #8b8fa3; cursor: pointer; padding: 0.3rem 0.65rem; border-radius: 6px;
  transition: background 0.2s, color 0.2s;
}
.legend-chip:hover { background: var(--chip-bg); color: var(--chip-color); }
.legend-dot { width: 11px; height: 11px; border-radius: 50%; border: 1.5px solid; flex-shrink: 0; }

/* ====== Stats ====== */
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.8rem; max-width: 1000px; width: 100%; }
.stat-card { background: #1a1d27; border: 1px solid #2a2d3a; border-radius: 10px; padding: 1rem; text-align: center; transition: transform 0.2s, border-color 0.2s; }
.stat-card:hover { transform: translateY(-2px); border-color: #6c8cff; }
.stat-num { font-size: 1.55rem; font-weight: 700; letter-spacing: -0.02em; }
.stat-label { font-size: 0.78rem; color: #8b8fa3; margin-top: 0.25rem; }

/* ====== Tab 2: Funnel ====== */
.scenario-pills { display: flex; gap: 0.5rem; }
.scenario-pill {
  padding: 0.5rem 1.2rem; border-radius: 20px; border: 1px solid #2a2d3a;
  background: transparent; color: #8b8fa3; font-size: 0.85rem; cursor: pointer;
  transition: all 0.2s; font-family: inherit;
}
.scenario-pill:hover { border-color: #6c8cff; color: #e1e4eb; }
.scenario-pill.active { background: #2a2d3a; border-color: #6c8cff; color: #e1e4eb; font-weight: 600; }

.funnel-svg-wrap { width: 100%; max-width: 1000px; }
.funnel-svg-wrap svg { width: 100%; height: auto; display: block; }
.funnel-bar { transition: fill-opacity 0.25s, stroke-opacity 0.25s, stroke-width 0.25s; cursor: pointer; }

/* Compare cards */
.compare-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 0.8rem; max-width: 1000px; width: 100%; }
.compare-card {
  background: #1a1d27; border: 1px solid #2a2d3a; border-radius: 10px; padding: 1.1rem;
  transition: border-color 0.2s;
}
.compare-card.highlight { border-color: #6c8cff; }
.compare-head { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.8rem; font-weight: 600; font-size: 0.95rem; }
.compare-icon { font-size: 1.2rem; }
.compare-stats { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 0.7rem; }
.compare-row { display: flex; justify-content: space-between; font-size: 0.82rem; color: #8b8fa3; }
.compare-val { color: #e1e4eb; font-weight: 600; }
.compare-accent { color: #4ecdc4 !important; }
.compare-tagline { font-size: 0.76rem; color: #5a5d6e; font-style: italic; }

/* Bottleneck cards */
.bottleneck-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 0.8rem; max-width: 1000px; width: 100%; }
.bottleneck-card {
  background: #1a1d27; border: 1px solid #2a2d3a; border-radius: 10px; padding: 1rem;
  text-align: center;
}
.bn-emoji { font-size: 1.4rem; display: block; margin-bottom: 0.35rem; }
.bottleneck-card strong { font-size: 0.88rem; display: block; margin-bottom: 0.3rem; }
.bottleneck-card p { font-size: 0.78rem; color: #8b8fa3; line-height: 1.5; margin: 0; }

/* ====== Detail blocks ====== */
.detail-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; max-width: 1000px; width: 100%; }
.detail-block { background: #1a1d27; border: 1px solid #2a2d3a; border-radius: 10px; padding: 1.2rem; }
.detail-block h3 { font-size: 0.95rem; margin-bottom: 0.8rem; }
.detail-block ul { list-style: none; font-size: 0.82rem; color: #8b8fa3; line-height: 1.85; padding: 0; }
.detail-block ul li::before { content: '•'; margin-right: 0.5rem; color: #6c8cff; }
.detail-block ul li.good::before { color: #4ecdc4; }
.detail-block ul li.bad::before  { color: #ff6b7a; }
.detail-block ul li.warn::before { color: #ffe66d; }

/* ====== Footer ====== */
.boundary-footer {
  color: #5a5d6e; font-size: 0.7rem; padding: 1rem; text-align: center;
  border-top: 1px solid #2a2d3a; width: 100%; max-width: 1000px; line-height: 1.6;
}
</style>
