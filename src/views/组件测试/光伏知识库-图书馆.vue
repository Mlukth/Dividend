<template>
  <div class="library">
    <!-- 顶栏 -->
    <header class="lib-header">
      <h1>光伏知识图书馆</h1>
      <span class="subtitle">{{ stats.totalChunks }} 条知识 · {{ stats.articles }} 篇文章 · 6 大分类</span>
      <div class="api-bar">
        <span class="api-label">API</span>
        <input v-model="apiBase" @change="saveApiUrl" class="api-input" placeholder="http://127.0.0.1:8765" />
        <span class="api-status" :style="{color: apiOk ? '#4ade80' : '#f87171'}">{{ apiOk ? '● 已连接' : '○ 未连接' }}</span>
      </div>
    </header>

    <!-- 导航标签 -->
    <nav class="lib-nav">
      <button v-for="t in tabs" :key="t.key" :class="['nav-btn', { active: tab === t.key }]" @click="tab = t.key">
        {{ t.icon }} {{ t.label }}
      </button>
    </nav>

    <!-- ====== 问答页 ====== -->
    <div v-if="tab === 'qa'" class="qa-view">
      <div class="search-box">
        <input v-model="query" @keyup.enter="search" placeholder="输入问题，例如：逆变器过温了怎么办、高处作业新国标有什么变化..." class="search-input" />
        <button @click="search" class="search-btn">搜索</button>
      </div>

      <div v-if="searched && results.length === 0" class="empty">知识库中未找到相关内容。试试换一个关键词。</div>

      <div v-if="results.length > 0" class="qa-results">
        <div class="result-meta">找到 {{ results.length }} 条相关内容</div>

        <div v-for="(r, i) in results" :key="i" class="answer-card">
          <div class="answer-source">
            <span class="conf-badge" :class="confClass(r.confidence)">🟢 {{ Math.round(r.confidence*100) }}%</span>
            <span class="cat-badge" :style="{background: catColor(r.classification.primary)+'18', color: catColor(r.classification.primary)}">{{ r.classification.primary }} › {{ r.classification.secondary }}</span>
            <span class="src-label">《{{ r.source.title }}》{{ r.source.date }}</span>
          </div>

          <div class="answer-summary">{{ r.summary }}</div>

          <div v-if="r.highlight" class="answer-highlight">"{{ r.highlight }}"</div>

          <div class="answer-tags">
            <span v-for="t in r.tags" :key="t" class="a-tag">{{ t }}</span>
          </div>

          <div v-if="r.warning" class="answer-warning">⚠ {{ r.warning }}</div>

          <details>
            <summary class="src-toggle">查看原文</summary>
            <div class="src-text">{{ r.original_text }}</div>
          </details>
        </div>
      </div>
    </div>

    <!-- ====== 浏览页 ====== -->
    <div v-if="tab === 'browse'" class="browse-view">
      <div class="cat-filters">
        <button v-for="c in categories" :key="c.key" :class="['cat-btn', { active: browseCat === c.key }]" @click="browseCat = browseCat === c.key ? '' : c.key" :style="browseCat === c.key ? {background: c.color, color:'#fff'} : {borderColor: c.color, color: c.color}">
          {{ c.key }} {{ c.label }}
          <span class="cat-count">{{ catCounts[c.key] || 0 }}</span>
        </button>
      </div>

      <div class="browse-list">
        <div v-for="c in filteredBrowseChunks" :key="c.id" class="browse-card">
          <div class="browse-head">
            <span class="browse-cat" :style="{color: catColor(c.classification.primary)}">{{ c.classification.secondary }}</span>
            <span class="browse-conf" :class="confClass(c.confidence)">{{ Math.round(c.confidence*100) }}%</span>
          </div>
          <div class="browse-summary">{{ c.summary }}</div>
          <div class="browse-tags"><span v-for="t in c.tags" :key="t" class="b-tag">{{ t }}</span></div>
          <details><summary>原文</summary><div class="browse-text">{{ c.original_text }}</div></details>
        </div>
      </div>
    </div>

    <!-- ====== 统计页 ====== -->
    <div v-if="tab === 'stats'" class="stats-view">
      <div class="stat-cards">
        <div class="stat-card"><div class="big-num">{{ stats.totalChunks }}</div><div>知识片段</div></div>
        <div class="stat-card"><div class="big-num">{{ stats.articles }}</div><div>文章来源</div></div>
        <div class="stat-card"><div class="big-num">{{ stats.avgConf }}%</div><div>平均置信度</div></div>
        <div class="stat-card"><div class="big-num">{{ stats.highConf }}%</div><div>高置信(≥90%)</div></div>
      </div>

      <div class="stat-section">
        <h3>分类分布</h3>
        <div class="bar-list">
          <div v-for="c in categories" :key="c.key" class="bar-row">
            <span class="bar-label">{{ c.key }} {{ c.label }}</span>
            <div class="bar-track"><div class="bar-fill" :style="{width: (catCounts[c.key]||0)/stats.totalChunks*100+'%', background: c.color}"></div></div>
            <span class="bar-val">{{ catCounts[c.key] || 0 }}</span>
          </div>
        </div>
      </div>

      <div class="stat-section">
        <h3>置信度分布</h3>
        <div class="bar-list">
          <div class="bar-row"><span class="bar-label">🟢 ≥90%</span><div class="bar-track"><div class="bar-fill" :style="{width: confDist.high/stats.totalChunks*100+'%', background:'#16a34a'}"></div></div><span class="bar-val">{{ confDist.high }}</span></div>
          <div class="bar-row"><span class="bar-label">🟡 75-90%</span><div class="bar-track"><div class="bar-fill" :style="{width: confDist.mid/stats.totalChunks*100+'%', background:'#ca8a04'}"></div></div><span class="bar-val">{{ confDist.mid }}</span></div>
          <div class="bar-row"><span class="bar-label">🔴 <75%</span><div class="bar-track"><div class="bar-fill" :style="{width: confDist.low/stats.totalChunks*100+'%', background:'#dc2626'}"></div></div><span class="bar-val">{{ confDist.low }}</span></div>
        </div>
      </div>
    </div>

    <!-- ====== AI助手 ====== -->
    <div class="ai-float" :class="{ open: aiOpen }">
      <div v-if="aiOpen" class="ai-panel">
        <div class="ai-header">
          <span>💡 AI搜索助手</span>
          <button class="ai-close" @click="aiOpen = false">×</button>
        </div>
        <div class="ai-body">
          <div class="ai-hint">不知道怎么搜？用大白话告诉我你想了解什么，我帮你找到相关关键词和问题。</div>
          <div class="ai-input-row">
            <input v-model="aiInput" @keyup.enter="aiSuggest" placeholder="例如：电站不发电了怎么办..." class="ai-input" />
            <button @click="aiSuggest" class="ai-send" :disabled="!aiInput.trim()">→</button>
          </div>
          <div v-if="aiSuggestions.length > 0" class="ai-sugs">
            <div class="ai-sug-label">试试这些搜索：</div>
            <div v-for="(s, i) in aiSuggestions" :key="i" class="ai-sug-item" @click="useSuggestion(s)">
              <span class="ai-sug-query">{{ s.query }}</span>
              <span class="ai-sug-reason">{{ s.reason }}</span>
            </div>
          </div>
        </div>
      </div>
      <button v-if="!aiOpen" class="ai-bubble" @click="aiOpen = true">💡 AI助手</button>
    </div>

    <!-- ====== 管理页 ====== -->
    <div v-if="tab === 'manage'" class="manage-view">
      <div class="manage-section">
        <h3>数据导入</h3>
        <p class="hint">支持导入清洗后的知识片段JSON文件，或通过管道脚本处理新的Markdown文章。</p>
        <div class="manage-actions">
          <button class="m-btn" disabled>📥 导入JSON (开发中)</button>
          <button class="m-btn" disabled>📝 直接粘贴文章 (开发中)</button>
        </div>
      </div>
      <div class="manage-section">
        <h3>知识库维护</h3>
        <div class="manage-stats">
          <div class="m-stat"><span class="m-num">{{ stats.totalChunks }}</span> 总片段</div>
          <div class="m-stat"><span class="m-num">{{ now }}</span> 最后更新</div>
        </div>
        <p class="hint">分类法版本 v0.1 · 标注Prompt版本 v1.0 · 数据文件: knowledge_chunks.json</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// ===== 数据 =====
const chunks = [
  { id:'WX_001', source:{title:'光伏逆变器那些事(二)散热的经济学',date:'2025-04-14',author:'小李',account:'光伏运维员小李'}, classification:{primary:'3.故障与处理',secondary:'3.1 逆变器故障'}, summary:'IGBT模块每秒开关高达2万次。逆变器效率约97%，即3%能量变热量。100kW逆变器每小时产热3kW。温度每升高10℃，电子元件寿命缩短一半。', highlight:'温度每升高10℃，电子元件的寿命就会缩短一半。', tags:['逆变器','IGBT','效率','发热原理'], confidence:0.95, warning:'散热不良→效率下降→发热加剧→寿命缩短，恶性循环。', original_text:'在逆变器内部的一块巴掌大的IGBT模块，每秒开关动作就高达2万次。一般来说，逆变器的效率在97%左右，即3%的能量变成了热量。一个100kW的逆变器每小时就能产生3kW的热量。温度每升高10℃，电子元件寿命缩短一半。' },
  { id:'WX_002', source:{title:'光伏逆变器那些事(二)散热的经济学',date:'2025-04-14',author:'小李',account:'光伏运维员小李'}, classification:{primary:'3.故障与处理',secondary:'3.1 逆变器故障'}, summary:'风扇故障是逆变器散热问题第一大元凶。三种常见原因：轴承磨损（咔咔响）、叶片积灰（风量下降）、电源线松动（时转时停）。关键是风扇故障往往是渐进式的——今天还能转明天就不行了。', highlight:'风扇故障往往是渐进式的——今天还能转，明天就不行了，等发现的时候逆变器已经跳了。', tags:['逆变器','风扇故障','轴承磨损','渐进式故障'], confidence:0.95, warning:'风扇从异响到停转只有几天窗口期。听到异响立即换，不要等。', original_text:'风扇故障可以说是逆变器散热问题的第一大元凶。最常见三种：轴承磨损，风扇咔咔响甚至卡死；叶片积灰，风量大幅下降；电源线松动，风扇时转时停。关键是风扇故障往往是渐进式的——今天还能转明天就不行了，等发现的时候逆变器已经跳了。' },
  { id:'WX_003', source:{title:'光伏逆变器那些事(二)散热的经济学',date:'2025-04-14',author:'小李',account:'光伏运维员小李'}, classification:{primary:'2.运维操作',secondary:'2.1 日常巡检'}, summary:'巡检三招：听风扇声音（正常嗡嗡声vs咔咔异响→轴承磨损）、摸外壳温度（局部烫手→散热问题）、看通风口滤网（灰尘杨絮堵塞最常见）。花不了几分钟但能避免几小时停机。', tags:['逆变器','巡检','风扇检查','温度监测'], confidence:0.90, warning:'杨絮季节特别关注滤网——最易忽略但最易解决。', original_text:'第一听声音——正常嗡嗡声，咔咔吱吱异响轴承八成磨损。第二摸外壳——局部明显烫手说明散热出问题。第三看通风口滤网——被杨絮灰尘堵住最易忽略。花不了几分钟，能避免几小时停机。' },
  { id:'WX_004', source:{title:'高处作业分级国标已强制生效',date:'2026-05-09',author:'小李',account:'光伏运维员小李'}, classification:{primary:'4.安全规范',secondary:'4.2 高空作业安全'}, summary:'GB 3608-2025于2026年5月1日正式生效，由推荐性标准(GB/T)升级为强制性标准(GB)。光伏运维大半时间在登高——2米以上全是高处作业，是行业事故最高发场景。', highlight:'由过去的推荐性标准，一跃成为强制性国家标准。', tags:['高处作业','GB 3608','强制性标准'], confidence:0.95, warning:'推荐变强制=不执行不再是"不规范"而是"违法"。', original_text:'《高处作业分级》国标已强制生效。光伏运维大半时间都在登高。这部新标准最核心的变化是由推荐性标准一跃成为强制性国家标准。GB必须执行，违反可能面临法律责任。' },
  { id:'WX_005', source:{title:'高处作业分级国标已强制生效',date:'2026-05-09',author:'小李',account:'光伏运维员小李'}, classification:{primary:'4.安全规范',secondary:'4.2 高空作业安全'}, summary:'光伏运维安全事故八成以上是高处坠落。彩钢瓦薄脆滑、山地支架檩条窄、渔光互补坠落就是落水。新标准用制度卡死侥幸作业。', highlight:'光伏运维的安全事故里，八成以上都是高处坠落。', tags:['高处坠落','事故率','彩钢瓦','侥幸心理'], confidence:0.90, warning:'"干了好几年都没事"是最危险的想法。', original_text:'光伏运维的安全事故里八成以上都是高处坠落。分布式光伏彩钢瓦屋面薄脆滑，透光瓦踩上去随时碎裂。以前标准不强制，很多人抱着侥幸心理出了意外。' },
  { id:'WX_006', source:{title:'高处作业分级国标已强制生效',date:'2026-05-09',author:'小李',account:'光伏运维员小李'}, classification:{primary:'4.安全规范',secondary:'4.2 高空作业安全'}, summary:'新国标作业高度公式：hw=hb+R。hw作业高度，hb基础高度，R坠落半径。实例：屋顶距地10m+活动半径0.8m=10.8m作业高度。支架下方有沟壑时坠落基准面是沟底。', tags:['作业高度','hw=hb+R','坠落半径'], confidence:0.80, warning:'支架下方是沟壑→坠落基准面是沟底不是脚底。容易算错。', original_text:'新国标给出公式hw=hb+R。hb是基础高度，R是可能的坠落半径。实例：屋顶边缘距地10米，身体外倾活动半径0.8米，实际判定作业高度10.8米。支架下方是沟壑，坠落基准面不再是脚下土地而是沟壑底部。' },
  { id:'WX_007', source:{title:'温度也能偷走光伏发电量',date:'2025-05-29',author:'小李',account:'光伏运维员小李'}, classification:{primary:'6.设计与工程',secondary:'6.2 发电量测算'}, summary:'组件最佳发电温度约25℃。温度每升高1℃，输出功率降低约0.35%-0.44%。夏季组件可达85℃，效率下降超20%。2024年南方某2.55MW电站7月发电量比去年低8.4%。', highlight:'人们想当然以为阳光越强发电量越大——真实情况恰恰相反。', tags:['组件','温度系数','发电效率','最佳温度'], confidence:0.95, warning:'夏季发电量评估必须做温度修正。光照好=发电多？不一定。', original_text:'组件最佳发电温度大约25℃。温度每升高1℃输出功率降低约0.35%-0.44%。夏季组件温度可达85℃效率下降超过20%。南方某电站7月光照优于去年但发电量反低8.4%。' },
  { id:'WX_008', source:{title:'温度也能偷走光伏发电量',date:'2025-05-29',author:'小李',account:'光伏运维员小李'}, classification:{primary:'3.故障与处理',secondary:'3.1 逆变器故障'}, summary:'高温危害不只组件。逆变器效率下降寿命缩短、电缆绝缘加速老化、变压器油温升高绝缘油劣化。整个电站是一个热力学系统——很多运维只盯组件温度忽略了其他设备，这是片面的。', highlight:'整个电站其实是一个热力学系统。很多运维只盯着组件温度，忽略了其他设备的热管理，这是片面的。', tags:['高温','设备老化','逆变器','电缆','变压器','全站热管理'], confidence:0.90, warning:'只关注组件温度忽视逆变器/电缆/变压器=顾头不顾尾。', original_text:'高温危害远不止组件。逆变器效率下降寿命缩短、电缆绝缘加速老化、变压器油温升高。整个电站是一个热力学系统。很多运维只盯着组件温度忽略其他设备热管理，这是片面的。' },
]

// ===== 状态 =====
const tab = ref('qa')
const query = ref('')
const searched = ref(false)
const browseCat = ref('')

const tabs = [
  { key:'qa', icon:'🔍', label:'问答' },
  { key:'browse', icon:'📂', label:'分类浏览' },
  { key:'stats', icon:'📊', label:'统计' },
  { key:'manage', icon:'⚙', label:'管理' },
]

const categories = [
  { key:'1.设备与组件', label:'设备', color:'#3b82f6' },
  { key:'2.运维操作', label:'运维', color:'#10b981' },
  { key:'3.故障与处理', label:'故障', color:'#ef4444' },
  { key:'4.安全规范', label:'安全', color:'#f59e0b' },
  { key:'5.政策与标准', label:'政策', color:'#8b5cf6' },
  { key:'6.设计与工程', label:'设计', color:'#06b6d4' },
]

// ===== 计算 =====
const stats = computed(() => {
  const total = chunks.length
  const articles = new Set(chunks.map(c => c.source.title)).size
  const confs = chunks.map(c => c.confidence)
  const avg = Math.round(confs.reduce((a,b) => a+b, 0) / total * 100)
  const high = chunks.filter(c => c.confidence >= 0.9).length
  return { totalChunks: total, articles, avgConf: avg, highConf: Math.round(high/total*100) }
})

const catCounts = computed(() => {
  const counts = {}
  chunks.forEach(c => {
    const k = c.classification.primary
    counts[k] = (counts[k] || 0) + 1
  })
  return counts
})

const confDist = computed(() => ({
  high: chunks.filter(c => c.confidence >= 0.9).length,
  mid: chunks.filter(c => c.confidence >= 0.75 && c.confidence < 0.9).length,
  low: chunks.filter(c => c.confidence < 0.75).length,
}))

const now = '2026-06-17'

// 搜索
const results = ref([])
function search() {
  if (!query.value.trim()) return
  const q = query.value.toLowerCase()
  results.value = chunks
    .filter(c =>
      c.summary.includes(q) || c.original_text.includes(q) ||
      c.tags.some(t => t.includes(q)) || c.classification.secondary.includes(q) ||
      c.source.title.includes(q)
    )
    .sort((a, b) => b.confidence - a.confidence)
  searched.value = true
}

// 浏览
const filteredBrowseChunks = computed(() => {
  if (!browseCat.value) return chunks
  return chunks.filter(c => c.classification.primary === browseCat.value)
})

const catColor = (cat) => {
  const m = { '1.设备与组件':'#3b82f6','2.运维操作':'#10b981','3.故障与处理':'#ef4444','4.安全规范':'#f59e0b','5.政策与标准':'#8b5cf6','6.设计与工程':'#06b6d4' }
  return m[cat] || '#6b7280'
}
const confClass = (v) => v >= 0.9 ? 'c-high' : v >= 0.75 ? 'c-mid' : 'c-low'

// ===== AI助手 =====
const aiOpen = ref(false)
const aiInput = ref('')
const aiSuggestions = ref([])
const aiLoading = ref(false)

// API配置（测试阶段放前端，生产移到环境变量）
const apiBase = ref(localStorage.getItem('pv_kb_api') || 'http://127.0.0.1:8765')
const apiOk = ref(false)
function saveApiUrl() {
  localStorage.setItem('pv_kb_api', apiBase.value)
  checkApi()
}
async function checkApi() {
  try {
    const res = await fetch(apiBase.value + '/health')
    apiOk.value = res.ok
  } catch { apiOk.value = false }
}
checkApi()

async function aiSuggest() {
  const input = aiInput.value.trim()
  if (!input) return
  aiLoading.value = true
  try {
    const res = await fetch(apiBase.value + '/suggest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: input })
    })
    const data = await res.json()
    aiSuggestions.value = data.suggestions || []
  } catch (e) {
    aiSuggestions.value = [{ query: input, reason: 'API未连接，直接搜索' }]
  }
  aiLoading.value = false
}

function useSuggestion(s) {
  query.value = s.query
  tab.value = 'qa'
  aiOpen.value = false
  setTimeout(() => search(), 100)
}

// 意图→搜索词映射表（API不可用时的兜底）
const intentMap = [
  { patterns: ['不发电','没电','停机','跳了','不工作','坏了','故障','报错','报警'], queries: [
    { query:'逆变器过温保护停机', reason:'不发电最常见原因' },
    { query:'逆变器风扇故障', reason:'散热失效导致停机' },
    { query:'逆变器保护机制误触发', reason:'可能不是真的坏了' },
  ]},
  { patterns: ['热','温度','烫','散热','风扇','高温','夏天'], queries: [
    { query:'逆变器散热系统', reason:'主动散热vs自然冷却' },
    { query:'温度升高发电效率下降', reason:'温度系数0.35%/℃' },
    { query:'逆变器风扇故障渐进式', reason:'风扇不会突然坏' },
  ]},
  { patterns: ['高','爬','屋顶','彩钢瓦','登高','坠落','安全','摔'], queries: [
    { query:'高处作业新国标GB 3608', reason:'推荐变强制标准' },
    { query:'高处作业高度计算公式 hw=hb+R', reason:'怎么算作业等级' },
    { query:'光伏运维高处坠落八成', reason:'头号事故原因' },
  ]},
  { patterns: ['发电少','发电量','功率','效率','低','不如'], queries: [
    { query:'温度升高发电效率下降', reason:'每升1℃降0.4%' },
    { query:'最佳发电温度25℃', reason:'不是越热越发电' },
    { query:'夏季发电量温度修正', reason:'光照好不等于发电多' },
  ]},
  { patterns: ['标准','国标','政策','规定','细则','考核'], queries: [
    { query:'高处作业新国标强制标准', reason:'GB/T升级为GB' },
    { query:'两个细则数据上报15分钟', reason:'合格率低于95%考核' },
  ]},
  { patterns: ['巡检','检查','维护','日常','值班'], queries: [
    { query:'逆变器巡检听摸看三步', reason:'耳朵比仪器好用' },
    { query:'风扇轴承磨损咔咔响', reason:'巡检时主动听声音' },
  ]},
  { patterns: ['IGBT','元件','器件','芯片','烧','击穿'], queries: [
    { query:'IGBT过流失效微秒级', reason:'过流比发热更致命' },
    { query:'IGBT热循环键合线疲劳', reason:'减少启停延长寿命' },
  ]},
]

// 兜底函数已由上面的 async aiSuggest 替代

</script>

<style scoped>
.library { font-family:"PingFang SC","Microsoft YaHei",sans-serif; min-height:100vh; background:#f0f2f5; }
.lib-header { background:linear-gradient(135deg,#1e3a5f,#2563eb); color:#fff; padding:24px 28px; }
.lib-header h1 { margin:0; font-size:20px; }
.subtitle { font-size:12px; opacity:0.75; margin-top:4px; display:inline-block; }
.api-bar { display:flex; align-items:center; gap:8px; margin-top:10px; }
.api-label { font-size:11px; opacity:0.6; }
.api-input { padding:4px 10px; border-radius:4px; border:1px solid rgba(255,255,255,0.2); background:rgba(255,255,255,0.1); color:#fff; font-size:12px; width:220px; outline:none; }
.api-input::placeholder { color:rgba(255,255,255,0.4); }
.api-input:focus { border-color:rgba(255,255,255,0.5); }
.api-status { font-size:11px; }

.lib-nav { display:flex; gap:0; background:#fff; border-bottom:1px solid #e5e7eb; padding:0 20px; }
.nav-btn { padding:12px 20px; border:0; background:none; font-size:14px; cursor:pointer; border-bottom:2px solid transparent; color:#666; transition:all .2s; }
.nav-btn:hover { color:#2563eb; }
.nav-btn.active { color:#2563eb; border-bottom-color:#2563eb; font-weight:600; }

/* 问答页 */
.qa-view { max-width:800px; margin:0 auto; padding:20px; }
.search-box { display:flex; gap:10px; margin-bottom:20px; }
.search-input { flex:1; padding:12px 16px; border:1px solid #ddd; border-radius:8px; font-size:14px; outline:none; }
.search-input:focus { border-color:#2563eb; box-shadow:0 0 0 2px rgba(37,99,235,0.1); }
.search-btn { padding:12px 24px; background:#2563eb; color:#fff; border:0; border-radius:8px; cursor:pointer; font-size:14px; }
.empty { text-align:center; padding:40px; color:#999; }
.result-meta { font-size:12px; color:#888; margin-bottom:12px; }

.answer-card { background:#fff; border-radius:10px; padding:20px; margin-bottom:14px; }
.answer-source { display:flex; align-items:center; gap:10px; margin-bottom:10px; flex-wrap:wrap; }
.conf-badge { font-size:11px; padding:2px 8px; border-radius:10px; }
.c-high { background:#dcfce7; color:#16a34a; }
.c-mid { background:#fef9c3; color:#ca8a04; }
.c-low { background:#fee2e2; color:#dc2626; }
.cat-badge { font-size:11px; padding:2px 8px; border-radius:8px; }
.src-label { font-size:12px; color:#999; }
.answer-summary { font-size:14px; color:#1e3a5f; line-height:1.8; padding:10px 12px; background:#f8fafc; border-left:3px solid #2563eb; border-radius:0 4px 4px 0; margin:8px 0; }
.answer-highlight { font-size:13px; color:#7c3aed; font-style:italic; padding:6px 10px; background:#f5f3ff; border-radius:4px; margin:6px 0; }
.answer-tags { display:flex; gap:4px; flex-wrap:wrap; margin:6px 0; }
.a-tag { font-size:10px; padding:2px 8px; background:#eef2ff; color:#4f6ef7; border-radius:10px; }
.answer-warning { font-size:12px; color:#d97706; padding:6px 10px; background:#fffbeb; border-left:3px solid #f59e0b; margin:6px 0; }
.src-toggle { font-size:12px; color:#2563eb; cursor:pointer; }
.src-text { font-size:13px; color:#666; line-height:1.8; padding:10px; background:#fafafa; border-radius:4px; margin-top:4px; white-space:pre-wrap; }

/* 浏览页 */
.browse-view { max-width:900px; margin:0 auto; padding:20px; }
.cat-filters { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:20px; }
.cat-btn { padding:8px 16px; border-radius:20px; border:1.5px solid; background:#fff; cursor:pointer; font-size:13px; transition:all .2s; }
.cat-count { font-size:10px; opacity:0.7; margin-left:4px; }
.browse-list { display:flex; flex-direction:column; gap:10px; }
.browse-card { background:#fff; border-radius:8px; padding:16px; }
.browse-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; }
.browse-cat { font-size:12px; font-weight:600; }
.browse-conf { font-size:11px; padding:1px 8px; border-radius:10px; }
.browse-summary { font-size:13px; color:#333; line-height:1.7; }
.browse-tags { display:flex; gap:4px; flex-wrap:wrap; margin:6px 0; }
.b-tag { font-size:10px; padding:1px 7px; background:#f0f4ff; color:#64748b; border-radius:8px; }
.browse-text { font-size:12px; color:#888; line-height:1.7; padding:8px; background:#fafafa; border-radius:4px; margin-top:4px; white-space:pre-wrap; }

/* 统计页 */
.stats-view { max-width:800px; margin:0 auto; padding:20px; }
.stat-cards { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:24px; }
.stat-card { background:#fff; padding:20px; border-radius:10px; text-align:center; }
.big-num { font-size:32px; font-weight:700; color:#2563eb; display:block; margin-bottom:4px; }
.stat-section { background:#fff; border-radius:10px; padding:20px; margin-bottom:16px; }
.stat-section h3 { margin:0 0 14px 0; font-size:15px; }
.bar-list { display:flex; flex-direction:column; gap:10px; }
.bar-row { display:flex; align-items:center; gap:12px; }
.bar-label { width:120px; font-size:13px; flex-shrink:0; }
.bar-track { flex:1; height:20px; background:#f0f0f0; border-radius:10px; overflow:hidden; }
.bar-fill { height:100%; border-radius:10px; transition:width .5s; }
.bar-val { width:30px; font-size:12px; color:#666; text-align:right; }

/* 管理页 */
.manage-view { max-width:700px; margin:0 auto; padding:20px; }
.manage-section { background:#fff; border-radius:10px; padding:20px; margin-bottom:16px; }
.manage-section h3 { margin:0 0 10px 0; font-size:15px; }
.hint { font-size:12px; color:#999; margin:6px 0; }
.manage-actions { display:flex; gap:10px; margin-top:12px; }
.m-btn { padding:8px 16px; border:1px solid #ddd; border-radius:6px; background:#f8f8f8; color:#999; font-size:13px; cursor:not-allowed; }
.manage-stats { display:flex; gap:24px; margin:10px 0; }
.m-stat { font-size:13px; color:#666; }
.m-num { font-weight:600; color:#333; }

/* AI助手 */
.ai-float { position:fixed; bottom:24px; right:24px; z-index:1000; }
.ai-bubble { padding:12px 20px; background:linear-gradient(135deg,#7c3aed,#a855f7); color:#fff; border:0; border-radius:24px; font-size:14px; cursor:pointer; box-shadow:0 4px 16px rgba(124,58,237,0.3); transition:transform .2s; }
.ai-bubble:hover { transform:scale(1.05); }
.ai-panel { width:380px; background:#fff; border-radius:16px; box-shadow:0 8px 32px rgba(0,0,0,0.15); overflow:hidden; margin-bottom:12px; }
.ai-header { display:flex; justify-content:space-between; align-items:center; padding:14px 18px; background:linear-gradient(135deg,#7c3aed,#a855f7); color:#fff; font-size:15px; font-weight:600; }
.ai-close { background:none; border:0; color:#fff; font-size:20px; cursor:pointer; }
.ai-body { padding:16px; }
.ai-hint { font-size:12px; color:#999; margin-bottom:10px; line-height:1.6; }
.ai-input-row { display:flex; gap:8px; }
.ai-input { flex:1; padding:10px 12px; border:1px solid #e0e0e0; border-radius:8px; font-size:13px; outline:none; }
.ai-input:focus { border-color:#7c3aed; }
.ai-send { padding:10px 16px; background:#7c3aed; color:#fff; border:0; border-radius:8px; cursor:pointer; font-size:16px; }
.ai-send:disabled { opacity:0.4; cursor:not-allowed; }
.ai-sugs { margin-top:14px; }
.ai-sug-label { font-size:11px; color:#aaa; margin-bottom:8px; }
.ai-sug-item { padding:10px 12px; border-radius:8px; cursor:pointer; transition:background .15s; margin-bottom:6px; border:1px solid #f0f0f0; }
.ai-sug-item:hover { background:#f5f3ff; border-color:#ddd6fe; }
.ai-sug-query { display:block; font-size:13px; color:#1e3a5f; font-weight:500; }
.ai-sug-reason { display:block; font-size:11px; color:#999; margin-top:3px; }
</style>
