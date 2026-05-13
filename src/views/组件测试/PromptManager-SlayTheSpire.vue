<template>
  <div class="spire-app">
    <!-- 顶部 -->
    <div class="spire-header">
      <div class="spire-bonfire">
        <div class="bonfire-flame" />
        <span class="bonfire-label">遗物</span>
      </div>
      <div class="relic-row">
        <div class="relic-slot" v-for="r in relics" :key="r.name" :title="r.desc">
          <span class="relic-icon">{{ r.icon }}</span>
          <span class="relic-name">{{ r.name }}</span>
        </div>
      </div>
      <div class="header-stats">
        <span>调用 {{ totalUses }} 次</span>
        <span>共 {{ cards.length }} 张</span>
        <span>{{ catStats }}</span>
      </div>
    </div>

    <!-- 主区域 -->
    <div class="spire-main">
      <div class="spire-toolbar">
        <h2 class="spire-title">提示词卡组</h2>
        <div class="toolbar-actions">
          <el-switch v-model="copyMode" active-text="复制模式" inactive-text="浏览" size="small"
            style="--el-switch-on-color:#c8a45c" />
          <el-radio-group v-model="viewFilter" size="small" class="spire-filter">
            <el-radio-button value="all">全部</el-radio-button>
            <el-radio-button value="CDEV">代码</el-radio-button>
            <el-radio-button value="PM">管理</el-radio-button>
            <el-radio-button value="INFO">信息</el-radio-button>
            <el-radio-button value="LEARN">学习</el-radio-button>
            <el-radio-button value="DOC">文书</el-radio-button>
          </el-radio-group>
          <el-input v-model="search" placeholder="搜索卡牌..." size="small" style="width:180px" clearable class="spire-search" />
          <el-button size="small" :icon="CopyDocument" @click="openImport" class="spire-btn-ghost">导入</el-button>
          <el-button size="small" :icon="Plus" type="primary" class="spire-btn-gold">新卡牌</el-button>
          <el-tag v-if="dataLoaded" size="small" effect="plain" type="success" class="spire-tag">{{ cards.length }}张</el-tag>
          <el-button size="small" text @click="reloadCards" :loading="!dataLoaded" style="margin-left:2px">🔄</el-button>
        </div>
      </div>

      <!-- AI导入对话框 -->
      <el-dialog v-model="showImportPanel" title="窗口AI智能导入" width="620px" :close-on-click-modal="false" class="spire-dialog">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
          <span style="font-weight:600;font-size:13px;color:#d4c8a8">导入模式：</span>
          <el-radio-group v-model="importMode" size="small" @change="copyImportPrompt">
            <el-radio-button value="single">单条</el-radio-button>
            <el-radio-button value="batch">批量(语雀)</el-radio-button>
          </el-radio-group>
          <span style="font-size:11px;color:#8a7a6a">切换自动重新复制提示词</span>
        </div>
        <div style="background:rgba(200,164,92,0.06);border:1px solid rgba(200,164,92,0.2);border-radius:6px;padding:10px 14px;margin-bottom:14px;font-size:12px;color:#c8a45c">
          <b>① 提示词已自动复制到剪贴板</b> → 粘贴到任意AI窗口
        </div>
        <div style="margin-bottom:6px;font-weight:600;font-size:13px;color:#d4c8a8">② 粘贴AI返回的JSON{{ importMode==='batch' ? '数组' : '' }}：</div>
        <el-input v-model="aiImportInput" type="textarea" :rows="10" :placeholder="importPlaceholder" class="spire-textarea" />
        <template #footer>
          <el-button @click="showImportPanel = false" class="spire-btn-ghost">取消</el-button>
          <el-button type="success" @click="submitAiImport" :loading="aiImportLoading" class="spire-btn-gold">③ 解析导入</el-button>
        </template>
      </el-dialog>

      <!-- 卡牌网格 -->
      <div class="spire-grid">
        <div v-for="card in filteredCards" :key="card.code"
          :class="['spire-card', card.type, card._rarity]"
          @click="copyMode ? (copy(card.content, card.name), incrementUses(card.code)) : (selectedCardCode = card.code, upgradePreview = false)">
          <!-- 能量球 -->
          <div class="energy-orb" :class="card._rarity">
            <span class="orb-num">{{ card.cost }}</span>
          </div>
          <!-- 卡图区 -->
          <div class="card-art" :style="{ background: artGradient(card) }">
            <div class="art-symbol">{{ card.type }}</div>
          </div>
          <!-- 类型横幅 -->
          <div class="type-banner" :class="card.type">
            <span>{{ card.cat2Label }}</span>
          </div>
          <!-- 描述框 -->
          <div class="desc-box">
            <div class="card-name">{{ card.name }}</div>
            <div class="card-desc">{{ card.desc }}</div>
            <div class="rarity-line" :class="card._rarity">◆ {{ card._rarity }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog v-model="showDetail" :title="null" width="720px" top="12vh" :show-close="false" :close-on-click-modal="true" class="spire-dialog spire-detail-dialog" destroy-on-close>
      <template v-if="selectedCard">
        <div class="detail-layout">
          <!-- 大卡 -->
          <div class="detail-card" :class="[selectedCard.type, rarityRank(selectedCard.uses)]">
            <div class="detail-frame">
              <div class="detail-orb" :class="rarityRank(selectedCard.uses)">
                <span>{{ selectedCard.cost }}</span>
                <small>复杂度</small>
              </div>
              <div class="detail-art" :style="{ background: artGradient(selectedCard) }">
                <div class="detail-art-symbol">{{ selectedCard.type }}</div>
                <div class="detail-tags-row">
                  <el-tag v-for="t in selectedCard.tags" :key="t" size="small" effect="dark" class="spire-tag-sm">{{ t }}</el-tag>
                </div>
              </div>
              <div class="detail-banner" :class="selectedCard.type">{{ selectedCard.cat1 }} · {{ selectedCard.cat2Label }}</div>
              <div class="detail-body">
                <div class="detail-code">{{ selectedCard.code }}</div>
                <div class="detail-name">{{ selectedCard.name }}</div>
                <div class="detail-text">{{ displayedContent }}</div>
                <div class="detail-text-meta">{{ displayedContent.length }}字 · 滚动查看完整内容</div>
                <div class="detail-ver-row">
                  <span class="detail-ver" :class="{ upgraded: selectedVariantIndex >= 0 }">{{ displayedVersion }}</span>
                  <span class="detail-maturity">{{ selectedCard.maturity }}</span>
                </div>
                <div class="detail-source">来源：{{ selectedCard.sourceFile }}</div>
                <div class="detail-stats">
                  <span>使用 {{ selectedCard.uses }} 次</span>
                  <span>{{ rarityLabel(rarityRank(selectedCard.uses)) }}</span>
                </div>
              </div>
            </div>
          </div>
          <!-- 变体侧栏 -->
          <div class="detail-side">
            <div class="side-title">变体版本</div>
            <div class="variant-tree" v-if="selectedCard.variants && selectedCard.variants.length">
              <div v-for="(v, i) in selectedCard.variants" :key="i"
                :class="['variant-node', { on: selectedVariantIndex === i }]"
                @click="selectedVariantIndex = (selectedVariantIndex === i ? -1 : i)">
                <div class="variant-connector" v-if="i > 0" />
                <div class="variant-body">
                  <div class="variant-ver">{{ v.name }}</div>
                  <div class="variant-preview">{{ (v.code || '').slice(0, 60) }}...</div>
                </div>
              </div>
            </div>
            <div v-else class="no-variants">暂无变体</div>
            <div class="side-actions">
              <el-button size="small" :icon="CopyDocument" type="primary" class="spire-btn-gold"
                @click="copy(selectedVariantIndex >= 0 ? selectedCard.variants[selectedVariantIndex].code : selectedCard.content); incrementUses(selectedCard.code)">
                复制{{ selectedVariantIndex >= 0 ? '变体' : '' }}
              </el-button>
              <el-button v-if="selectedVariantIndex >= 0" size="small" text @click="selectedVariantIndex = -1" style="color:#8a7a6a">回主版本</el-button>
            </div>
            <div class="side-notes" v-if="selectedCard.notes">
              <div class="side-notes-title">灵感/备注</div>
              <div class="side-notes-body">{{ selectedCard.notes }}</div>
            </div>
            <div class="side-notes" v-if="selectedCard.testLog">
              <div class="side-notes-title">测试日志</div>
              <div class="side-notes-body">{{ selectedCard.testLog }}</div>
            </div>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { Plus, CopyDocument } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const search = ref('')
const viewFilter = ref('all')
const selectedCardCode = ref(null)
const upgradePreview = ref(false)
const selectedVariantIndex = ref(-1)
const showImportPanel = ref(false)
const copyMode = ref(false)
const dataLoaded = ref(false)

onMounted(async () => {
  try {
    const res = await fetch('/prompt-cards.json')
    if (!res.ok) throw new Error('HTTP ' + res.status)
    cards.value = await res.json()
    dataLoaded.value = true
    applyUses()
  } catch (e) {
    console.warn('[PromptManager] 无法加载 prompt-cards.json:', e.message)
    cards.value = []
    dataLoaded.value = true
  }
})

function openImport() { showImportPanel.value = true; copyImportPrompt() }

const artGradient = (card) => {
  const map = {
    CDEV: 'linear-gradient(160deg, #2a1010 0%, #150808 60%, #0a0404 100%)',
    PM:   'linear-gradient(160deg, #0a1a2a 0%, #081018 60%, #04080d 100%)',
    INFO:'linear-gradient(160deg, #0a1a1a 0%, #081515 60%, #040a0a 100%)',
    LEARN:'linear-gradient(160deg, #1a0a2a 0%, #100818 60%, #08040d 100%)',
    DOC: 'linear-gradient(160deg, #2a1a0a 0%, #181008 60%, #0d0804 100%)',
    TOOL:'linear-gradient(160deg, #1a1a1a 0%, #101010 60%, #080808 100%)',
  }
  return map[card.type] || map.PM
}

const typeLabel = (t) => ({ CDEV:'代码工程', PM:'提示词管理', INFO:'信息处理', LEARN:'学习辅助', DOC:'文书产出', TOOL:'工具开发' }[t] || t)

const relics = [
  { icon: '📜', name: '提示词库', desc: '80条提示词·6大分类·编码索引' },
  { icon: '⚡', name: '一键复制', desc: '浏览模式点卡查看·复制模式点卡即拷' },
  { icon: '🔄', name: '变体管理', desc: '多版本变体对比与切换' },
]

const catStats = computed(() => {
  const m = {}
  for (const c of cards.value) m[c.type] = (m[c.type] || 0) + 1
  return Object.entries(m).map(([k,v]) => k + ':' + v).join(' ')
})

const showDetail = computed({
  get: () => selectedCardCode.value !== null,
  set: (v) => { if (!v) { selectedCardCode.value = null; selectedVariantIndex.value = -1 } }
})
const selectedCard = computed(() => cards.value.find(c => c.code === selectedCardCode.value))
const displayedContent = computed(() => {
  if (!selectedCard.value) return ''
  if (selectedVariantIndex.value >= 0 && selectedCard.value.variants) {
    return selectedCard.value.variants[selectedVariantIndex.value].code
  }
  return selectedCard.value.content
})
const displayedVersion = computed(() => {
  if (!selectedCard.value) return ''
  if (selectedVariantIndex.value >= 0 && selectedCard.value.variants) {
    return selectedCard.value.variants[selectedVariantIndex.value].name
  }
  return selectedCard.value.version
})

const cards = ref([])

const rarityRank = (uses) => uses >= 300 ? 'gold' : uses >= 100 ? 'silver' : uses >= 50 ? 'bronze' : 'copper'
const rarityLabel = (r) => ({ gold: '稀有', silver: '罕见', bronze: '普通', copper: '基础' }[r] || r)

function loadUses() {
  try { return JSON.parse(localStorage.getItem('prompt_uses') || '{}') } catch { return {} }
}
function saveUses(map) {
  localStorage.setItem('prompt_uses', JSON.stringify(map))
}
function applyUses() {
  const map = loadUses()
  for (const c of cards.value) {
    c.uses = map[c.code] || 0
  }
}

function incrementUses(code) {
  const map = loadUses()
  map[code] = (map[code] || 0) + 1
  saveUses(map)
  const card = cards.value.find(c => c.code === code)
  if (card) card.uses = map[code]
}

const totalUses = computed(() => cards.value.reduce((s, c) => s + c.uses, 0))

const filteredCards = computed(() => {
  let list = cards.value
  if (viewFilter.value !== 'all') list = list.filter(c => c.type === viewFilter.value)
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(c =>
      c.name.includes(q) || c.desc.includes(q) || c.code.toLowerCase().includes(q) || c.cat2Label.includes(q)
    )
  }
  list = [...list].sort((a, b) => b.uses - a.uses)
  return list.map(c => ({ ...c, _rarity: rarityRank(c.uses) }))
})

// ========== 窗口AI智能导入 ==========
const aiImportInput = ref('')
const aiImportLoading = ref(false)
const importMode = ref('single')
const importPlaceholder = computed(() => importMode.value === 'batch'
  ? '[{"code":"PM-clarify-004","name":"...","type":"PM","cat1":"PM-提示词管理","cat2":"clarify-需求澄清","cat2Label":"需求澄清","desc":"...","cost":2,"content":"..."}]'
  : '{"name":"...","type":"CDEV|PM|INFO|LEARN|DOC","cat1":"...","cat2":"...","tags":["..."],"desc":"...","cost":2}')

const SINGLE_IMPORT_PROMPT = `请分析以下提示词内容，提取结构化信息，返回严格JSON（不要加任何其他文字）：

{
  "name": "提示词名称",
  "type": "CDEV|PM|INFO|LEARN|DOC",
  "cat1": "CDEV-代码工程|PM-提示词管理|INFO-信息处理|LEARN-学习辅助|DOC-文书产出",
  "cat2": "二级分类key（如 extract-组件提取、clarify-需求澄清）",
  "cat2Label": "二级分类中文名",
  "tags": ["标签1","标签2"],
  "desc": "一句话描述（80字内）",
  "cost": 1-3的复杂度数字
}

类型说明：CDEV=代码工程(产出/调试/工程)、PM=提示词管理(需求/复用/会话)、INFO=信息处理(提取/对比/核查)、LEARN=学习辅助(刷题/语言/笔记)、DOC=文书产出(文档生成)
cost: 1=简单指令(<500字), 2=需要上下文(500-2000字), 3=复杂多步骤(>2000字)

待分析提示词：`

const BATCH_IMPORT_PROMPT = `你是提示词库结构化整理专家。请解析以下提示词文档，提取每条提示词为结构化JSON数组。

分类体系（必须使用）：
- CDEV-代码工程: extract-组件提取/protocol-输出协议/debug-调试定位/scaffold-工程基建/anti-loop-防退化
- PM-提示词管理: clarify-需求澄清/locate-路径定位/iterate-迭代复用/session-会话管控/guide-引导发现
- INFO-信息处理: extract-信息提取/compare-横向对比/filter-条件筛选/verify-事实核查
- LEARN-学习辅助: exam-考试刷题/lang-语言学习/note-笔记整理
- DOC-文书产出: gen-文档生成

提取规则：
1. 每个独立提示词作为一个对象
2. type 根据上述分类体系判断（CDEV/PM/INFO/LEARN/DOC）
3. cat2 必须从上述二级分类中选择最匹配的
4. cost: 1=简单(<500字), 2=中等(500-2000字), 3=复杂(>2000字)
5. tags: 2-4个中文关键词
6. desc: 15字以内简述
7. content: 保留原文全文（核心资产，不可截断）

返回严格JSON数组（不要加任何其他文字）：
[
  {
    "name": "提示词名称",
    "type": "CDEV",
    "cat1": "CDEV-代码工程",
    "cat2": "extract-组件提取",
    "cat2Label": "组件提取",
    "tags": ["Vue3","前端","组件"],
    "desc": "从完整代码中剥离独立Vue组件",
    "cost": 2,
    "version": "v1.0",
    "content": "完整的提示词文本..."
  }
]

待处理文档：`

function buildImportPrompt() {
  return importMode.value === 'batch' ? BATCH_IMPORT_PROMPT : SINGLE_IMPORT_PROMPT
}

function copyImportPrompt() {
  const prompt = buildImportPrompt()
  navigator.clipboard.writeText(prompt).then(() =>
    ElMessage.success(`已复制${importMode.value === 'batch' ? '批量' : '单条'}导入提示词，粘贴到窗口AI获取结果`)
  )
}

function submitAiImport() {
  if (!aiImportInput.value.trim()) { ElMessage.warning('请粘贴AI返回的JSON'); return }
  aiImportLoading.value = true
  try {
    const text = aiImportInput.value.trim()
    let parsed

    if (text.startsWith('[')) {
      parsed = JSON.parse(text)
      if (!Array.isArray(parsed)) throw new Error('期望JSON数组')
    } else {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('未识别到JSON')
      parsed = [JSON.parse(jsonMatch[0])]
    }

    let imported = 0
    const validTypes = ['CDEV','PM','INFO','LEARN','DOC','TOOL']
    const cat1Icons = { 'CDEV-代码工程':'💻', 'PM-提示词管理':'📋', 'INFO-信息处理':'🔍', 'LEARN-学习辅助':'📚', 'DOC-文书产出':'📝', 'TOOL-工具开发':'🔧' }

    for (const data of parsed) {
      if (!data.name) continue
      const cat1 = data.cat1 || 'PM-提示词管理'
      const card = {
        code: data.code || (data.type + '-' + (data.cat2 || 'general') + '-' + String(Date.now()).slice(-4)),
        name: data.name,
        type: validTypes.includes(data.type) ? data.type : 'PM',
        cost: Math.min(3, Math.max(0, data.cost || 1)),
        icon: cat1Icons[cat1] || '📄',
        cat1,
        cat2: data.cat2 || '',
        cat2Label: data.cat2Label || data.cat2 || '',
        version: data.version || 'v1.0',
        sourceFile: data.sourceFile || '手动导入',
        maturity: data.maturity || '草稿',
        desc: data.desc || '',
        content: data.content || '',
        tags: data.tags || [],
        variants: data.variants || [],
        notes: data.notes || '',
        testLog: data.testLog || '',
        uses: 0,
        stage: 'draft',
        category: data.sourceFile || '手动导入',
      }
      cards.value.unshift(card)
      imported++
    }
    aiImportInput.value = ''
    ElMessage.success(`导入完成：${imported}条提示词`)
  } catch (e) {
    ElMessage.error('解析失败：' + e.message)
  }
  aiImportLoading.value = false
}

function copy(text, name) { navigator.clipboard.writeText(text).then(() => ElMessage.success(name ? `已复制：${name}` : '已复制')) }

async function reloadCards() {
  dataLoaded.value = false
  try {
    const res = await fetch('/prompt-cards.json?t=' + Date.now())
    if (!res.ok) throw new Error('HTTP ' + res.status)
    cards.value = await res.json()
    ElMessage.success(`已加载 ${cards.value.length} 张卡片`)
  } catch (e) {
    ElMessage.warning('加载失败: ' + e.message)
  }
  dataLoaded.value = true
}
</script>

<style scoped>
/* === 根基 === */
.spire-app {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 80px);
  background: #0d0805;
  color: #d4c8a8;
  overflow: hidden;
  border-radius: 8px;
  font-family: 'SimSun', 'Source Han Serif SC', 'Noto Serif SC', serif;
}

/* === 顶部 === */
.spire-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 20px;
  background: #140e09;
  border-bottom: 1px solid #2a1f14;
  flex-shrink: 0;
  flex-wrap: wrap;
}

.spire-bonfire { display: flex; align-items: center; gap: 8px; }

.bonfire-flame {
  width: 12px; height: 18px;
  background: #d4793a;
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  box-shadow: 0 0 8px #d4793a, 0 0 20px rgba(212,121,58,0.5);
  animation: flicker 0.6s ease-in-out infinite alternate;
}
@keyframes flicker {
  0% { box-shadow: 0 0 6px #d4793a, 0 0 14px rgba(212,121,58,0.4); }
  100% { box-shadow: 0 0 10px #e8904a, 0 0 22px rgba(212,121,58,0.6); }
}

.bonfire-label { font-size: 12px; color: #8a7a6a; letter-spacing: 2px; text-transform: uppercase; }

.relic-row { display: flex; gap: 8px; }

.relic-slot {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 12px; border: 1px solid #2a1f14; border-radius: 4px; background: #100a06;
  cursor: help; transition: border-color 0.2s;
}
.relic-slot:hover { border-color: #4a3a2a; }
.relic-icon { font-size: 14px; }
.relic-name { font-size: 11px; color: #8a7a6a; }

.header-stats { display: flex; gap: 16px; font-size: 11px; color: #6a5a4a; font-family: monospace; margin-left: auto; }

/* === 主区域 === */
.spire-main { flex: 1; display: flex; flex-direction: column; padding: 20px; overflow: hidden; }

.spire-toolbar {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 20px; flex-shrink: 0;
}
.spire-title { margin: 0; font-size: 22px; color: #d4c8a8; font-weight: 600; letter-spacing: -0.02em; }
.toolbar-actions { display: flex; gap: 8px; align-items: center; }

/* Element Plus 覆盖 */
.spire-filter :deep(.el-radio-button__inner) {
  background: transparent; border-color: #2a1f14; color: #6a5a4a; font-size: 11px; font-family: inherit;
}
.spire-filter :deep(.is-active .el-radio-button__inner) {
  background: rgba(200,164,92,0.1); border-color: #8a6d2b; color: #c8a45c;
}
.spire-search :deep(.el-input__inner) {
  background: #100a06; border-color: #2a1f14; color: #d4c8a8; font-family: inherit;
}
.spire-search :deep(.el-input__inner::placeholder) { color: #4a3a2a; }

.spire-btn-ghost {
  background: transparent !important; border: 1px solid #2a1f14 !important;
  color: #6a5a4a !important; font-family: inherit !important;
}
.spire-btn-ghost:hover { border-color: #4a3a2a !important; color: #9a8a7a !important; }

.spire-btn-gold {
  background: #5a3a1a !important; border: 1px solid #8b6a3a !important;
  color: #e0d4b8 !important; font-family: inherit !important;
}
.spire-btn-gold:hover { background: #6a4a2a !important; border-color: #a0804a !important; }

.spire-tag {
  background: rgba(200,164,92,0.1) !important; border-color: rgba(200,164,92,0.2) !important;
  color: #c8a45c !important; font-family: inherit !important;
}

/* 对话框覆盖 */
.spire-dialog :deep(.el-dialog) {
  background: #140e09; border: 1px solid #2a1f14; border-radius: 12px;
}
.spire-dialog :deep(.el-dialog__title) { color: #d4c8a8; font-family: inherit; }
.spire-dialog :deep(.el-dialog__header) { border-bottom: 1px solid #1a1108; padding: 16px 20px; }
.spire-dialog :deep(.el-dialog__body) { color: #d4c8a8; padding: 20px; }
.spire-textarea :deep(.el-textarea__inner) {
  background: #100a06; border-color: #2a1f14; color: #d4c8a8; font-family: monospace;
}

/* === 卡片网格 === */
.spire-grid {
  flex: 1; overflow-y: auto;
  display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px; align-content: start; padding: 4px;
}

/* === 卡片 — 对齐 B-SpireStyle === */
.spire-card {
  position: relative; width: 240px; height: 340px;
  background: #1a1108; border: 2px solid #3a2a1a; border-radius: 8px;
  cursor: pointer; transition: all 0.35s cubic-bezier(0.23, 1, 0.32, 1);
  overflow: hidden; display: flex; flex-direction: column;
  box-shadow: 0 4px 12px rgba(0,0,0,0.5);
}
.spire-card::before {
  content: ''; position: absolute; inset: 3px;
  border: 1px solid rgba(200,164,92,0.1); border-radius: 6px;
  pointer-events: none; z-index: 2;
}
.spire-card:hover { transform: translateY(-8px) scale(1.04); }

/* 类型左竖线 */
.spire-card.CDEV  { border-left: 3px solid #6b2a2a; }
.spire-card.PM    { border-left: 3px solid #2a4a6b; }
.spire-card.INFO  { border-left: 3px solid #2a5a3a; }
.spire-card.LEARN { border-left: 3px solid #5a2a6b; }
.spire-card.DOC   { border-left: 3px solid #6b4a2a; }
.spire-card.TOOL  { border-left: 3px solid #333; }

/* 稀有度边框 */
.spire-card.copper { border-color: #4a3020; }
.spire-card.bronze { border-color: #5a4030; box-shadow: 0 4px 12px rgba(0,0,0,0.5), inset 0 0 20px rgba(139,90,43,0.06); }
.spire-card.silver { border-color: #7a7a7a; box-shadow: 0 4px 14px rgba(0,0,0,0.5), inset 0 0 24px rgba(160,160,160,0.06); }
.spire-card.gold   { border-color: #8a6d2b; box-shadow: 0 4px 16px rgba(0,0,0,0.5), inset 0 0 30px rgba(200,160,40,0.08); }
.spire-card:hover.copper { border-color: #6a4a2a; }
.spire-card:hover.bronze { border-color: #8b5a2b; }
.spire-card:hover.silver { border-color: #a0a0a0; }
.spire-card:hover.gold   { border-color: #c8a040; }

/* 能量球 */
.energy-orb {
  position: absolute; top: 8px; left: 8px;
  width: 32px; height: 32px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  z-index: 3; border: 2px solid;
}
.energy-orb.copper { background: radial-gradient(circle at 40% 35%, #4a3020, #2a1a10); border-color: #4a3020; color: #8a6a5a; }
.energy-orb.bronze { background: radial-gradient(circle at 40% 35%, #6b4226, #3a2010); border-color: #8b5a2b; color: #c8a080; }
.energy-orb.silver { background: radial-gradient(circle at 40% 35%, #7a7a7a, #3a3a3a); border-color: #a0a0a0; color: #e0e0e0; }
.energy-orb.gold   { background: radial-gradient(circle at 40% 35%, #c8a040, #6a4a10); border-color: #c8a45c; color: #ffe8a0;
  box-shadow: 0 0 10px rgba(200,160,40,0.3); }
.orb-num { font-size: 12px; font-weight: bold; }

/* 卡图 — 纯文字，无 emoji 图标 */
.card-art {
  height: 38%; display: flex; align-items: center; justify-content: center;
  position: relative; overflow: hidden;
}
.card-art::after {
  content: ''; position: absolute; inset: 0;
  background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px);
  pointer-events: none;
}
.art-symbol {
  font-size: 28px; opacity: 0.35; text-transform: uppercase; letter-spacing: 4px;
  z-index: 1; color: #fff; font-weight: bold; text-shadow: 0 2px 8px rgba(0,0,0,0.5);
}

/* 类型横幅 */
.type-banner {
  height: 5px; margin: 0 10px; border-radius: 0 0 3px 3px;
  display: flex; align-items: center; justify-content: center;
  z-index: 3; font-size: 9px; letter-spacing: 1px; color: #1a1108; font-weight: bold;
}
.type-banner.CDEV  { background: #6b2a2a; }
.type-banner.PM    { background: #2a4a6b; }
.type-banner.INFO  { background: #2a5a3a; }
.type-banner.LEARN { background: #5a2a6b; }
.type-banner.DOC   { background: #6b4a2a; }
.type-banner.TOOL  { background: #4a4a4a; }
.type-banner span {
  background: inherit; padding: 0 8px; position: relative; top: -1px; font-size: 9px;
}

/* 描述框 */
.desc-box {
  flex: 1; padding: 8px 10px 10px; display: flex; flex-direction: column; gap: 2px;
  border-top: 1px solid rgba(200,164,92,0.08);
  background: linear-gradient(180deg, rgba(20,10,5,0.6) 0%, rgba(15,8,3,0.9) 100%);
}
.card-name {
  font-size: 14px; font-weight: bold; color: #e0d4b8; line-height: 1.3;
}
.card-desc {
  font-size: 11px; color: #8a7a6a; line-height: 1.5;
  overflow: hidden; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical;
  flex: 1;
}
.rarity-line { font-size: 9px; letter-spacing: 2px; text-transform: uppercase; }
.rarity-line.copper { color: #4a3020; }
.rarity-line.bronze { color: #8b5a2b; }
.rarity-line.silver { color: #a0a0a0; }
.rarity-line.gold   { color: #c8a040; }

/* === 详情弹窗 — 去白边 === */
.spire-detail-dialog :deep(.el-dialog) {
  border: 1px solid #2a1f14 !important;
  box-shadow: 0 8px 40px rgba(0,0,0,0.7) !important;
  background: #140e09 !important;
}
.spire-detail-dialog :deep(.el-dialog__header) { display: none; }
.spire-detail-dialog :deep(.el-dialog__body) { padding: 0; }
.spire-detail-dialog :deep(.el-dialog__headerbtn) { display: none; }
.spire-detail-dialog :deep(.el-dialog__headerbtn .el-dialog__close) { display: none; }
.spire-detail-dialog :deep(.el-overlay) { background: rgba(5,3,1,0.92) !important; }
.spire-detail-dialog :deep(.el-overlay-dialog) { background: transparent !important; }
.spire-detail-dialog :deep(.el-popper__arrow) { display: none !important; }

.detail-layout { display: flex; gap: 0; min-height: 540px; max-height: 80vh; }

.detail-card {
  flex: 1; padding: 24px; background: #1a1108;
  border-right: 1px solid #2a1f14; border-radius: 12px 0 0 12px;
  position: relative;
}
.detail-card::before {
  content: ''; position: absolute; inset: 3px;
  border: 1px solid rgba(200,164,92,0.08); border-radius: 10px; pointer-events: none; z-index: 2;
}
.detail-card.gold   { background: linear-gradient(135deg, #1f1a12, #151210); border-color: #8a6d2b; }
.detail-card.silver { background: linear-gradient(135deg, #1a1a1c, #121214); border-color: #7a7a7a; }
.detail-card.bronze { background: linear-gradient(135deg, #1a1512, #12100e); border-color: #5a4030; }
.detail-card.copper { border-color: #4a3020; }

.detail-frame { display: flex; flex-direction: column; align-items: center; gap: 6px; }

.detail-orb {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  width: 44px; height: 44px; border-radius: 50%; border: 2px solid;
}
.detail-orb.copper { background: radial-gradient(circle at 40% 35%, #4a3020, #2a1a10); border-color: #4a3020; color: #8a6a5a; }
.detail-orb.bronze { background: radial-gradient(circle at 40% 35%, #6b4226, #3a2010); border-color: #8b5a2b; color: #c8a080; }
.detail-orb.silver { background: radial-gradient(circle at 40% 35%, #7a7a7a, #3a3a3a); border-color: #a0a0a0; color: #e0e0e0; }
.detail-orb.gold   { background: radial-gradient(circle at 40% 35%, #c8a040, #6a4a10); border-color: #c8a45c; color: #ffe8a0;
  box-shadow: 0 0 10px rgba(200,160,40,0.3); }
.detail-orb span { font-size: 18px; font-weight: bold; }
.detail-orb small { font-size: 8px; opacity: 0.6; }

.detail-art {
  width: 100%; height: 90px; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 6px; border-radius: 4px;
}
.detail-art-symbol {
  font-size: 20px; opacity: 0.3; text-transform: uppercase; letter-spacing: 4px;
  color: #fff; font-weight: bold;
}
.detail-tags-row { display: flex; gap: 4px; justify-content: center; }
.spire-tag-sm { font-size: 10px !important; }

.detail-banner {
  height: 5px; margin: 0 40px; border-radius: 0 0 3px 3px;
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: bold; color: #1a1108; letter-spacing: 1px; padding: 0 12px;
}
.detail-banner.CDEV  { background: #6b2a2a; }
.detail-banner.PM    { background: #2a4a6b; }
.detail-banner.INFO  { background: #2a5a3a; }
.detail-banner.LEARN { background: #5a2a6b; }
.detail-banner.DOC   { background: #6b4a2a; }
.detail-banner.TOOL  { background: #4a4a4a; }

.detail-body {
  width: 100%; display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 8px 8px 0;
  border-top: 1px solid rgba(200,164,92,0.08);
}
.detail-code { font-family: monospace; font-size: 10px; color: #4a3a2a; }
.detail-name { font-size: 18px; font-weight: bold; color: #e0d4b8; }
.detail-text {
  font-size: 12px; color: #8a7a6a; line-height: 1.7; text-align: left;
  overflow-y: auto; max-height: 200px; width: 100%; padding-right: 4px;
  white-space: pre-wrap; word-break: break-word;
}
.detail-text::-webkit-scrollbar { width: 4px; }
.detail-text::-webkit-scrollbar-thumb { background: #2a1f14; border-radius: 2px; }
.detail-text-meta { font-size: 9px; color: #4a3a2a; }

.detail-ver-row { display: flex; align-items: center; gap: 8px; }
.detail-ver {
  font-family: monospace; font-weight: 600; color: #8a7a6a;
  background: rgba(255,255,255,0.03); border: 1px solid #2a1f14;
  padding: 2px 8px; border-radius: 4px;
}
.detail-ver.upgraded { color: #4ade80; border-color: #22c55e; background: rgba(34,197,94,0.08); }
.detail-maturity { font-size: 10px; color: #5a4a3a; }
.detail-source { font-size: 9px; color: #4a3a2a; }
.detail-stats { display: flex; gap: 16px; font-size: 10px; color: #6a5a4a; font-family: monospace; }

/* 变体侧栏 */
.detail-side {
  width: 240px; background: #100a06; padding: 16px;
  display: flex; flex-direction: column; overflow-y: auto;
  border-radius: 0 12px 12px 0;
}
.side-title { font-size: 13px; font-weight: 600; color: #8a7a6a; margin-bottom: 12px; }
.variant-tree { flex: 1; }
.no-variants { font-size: 11px; color: #4a3a2a; text-align: center; padding: 20px 0; }

.variant-node { position: relative; padding-left: 18px; cursor: pointer; }
.variant-node:not(:last-child) { margin-bottom: 2px; }
.variant-connector { position: absolute; left: 8px; top: 16px; width: 1px; height: calc(100% + 2px); background: #2a1f14; }
.variant-node.on .variant-connector { background: #c8a45c; }

.variant-body { padding: 8px 10px; border: 1px solid #2a1f14; border-radius: 6px; transition: all 0.15s; }
.variant-body:hover { border-color: #4a3a2a; background: rgba(255,255,255,0.02); }
.variant-node.on .variant-body { border-color: #c8a45c; background: rgba(200,164,92,0.06); }
.variant-ver { font-family: monospace; font-weight: 600; font-size: 11px; color: #8a7a6a; }
.variant-node.on .variant-ver { color: #c8a45c; }
.variant-preview { font-size: 10px; color: #5a4a3a; margin-top: 2px; }

.side-actions { display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px solid #2a1f14; margin-top: 12px; }
.side-notes { margin-top: 12px; padding-top: 12px; border-top: 1px solid #2a1f14; }
.side-notes-title { font-size: 11px; font-weight: 600; color: #8a7a6a; margin-bottom: 4px; }
.side-notes-body { font-size: 10px; color: #6a5a4a; line-height: 1.5; }
</style>

<style>
/* 全局打穿 Element Plus dialog teleport — 去白边 */
.spire-detail-dialog.el-dialog,
.spire-detail-dialog .el-dialog {
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  background: transparent !important;
}
.spire-detail-dialog .el-dialog__header,
.spire-detail-dialog .el-dialog__headerbtn,
.spire-detail-dialog .el-dialog__close {
  display: none !important;
}
.spire-detail-dialog .el-dialog__body {
  padding: 0 !important;
  border: none !important;
}
.spire-detail-dialog .el-overlay {
  background: rgba(5,3,1,0.92) !important;
}
.spire-detail-dialog .el-overlay-dialog {
  background: transparent !important;
}
/* 覆盖 Element Plus 默认的白色对话框样式 */
.spire-dialog.el-dialog,
.spire-dialog .el-dialog {
  border: 1px solid #2a1f14 !important;
  background: #140e09 !important;
  box-shadow: 0 8px 40px rgba(0,0,0,0.7) !important;
}
.spire-dialog .el-dialog__header {
  border-bottom: 1px solid #1a1108 !important;
  background: #140e09 !important;
}
.spire-dialog .el-dialog__title {
  color: #d4c8a8 !important;
}
.spire-dialog .el-dialog__body {
  color: #d4c8a8 !important;
  background: #140e09 !important;
}
</style>
