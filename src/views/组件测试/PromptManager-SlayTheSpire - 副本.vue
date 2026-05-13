<template>
  <div class="sts-app">
    <!-- 顶部遗物栏 -->
    <div class="sts-relic-bar">
      <div class="sts-relic" v-for="r in relics" :key="r.name" :title="r.desc">
        <span class="sts-relic-icon">{{ r.icon }}</span>
        <span class="sts-relic-name">{{ r.name }}</span>
      </div>
      <div class="sts-relic-bar-spacer"></div>
      <div class="sts-health">
        <span>调用 {{ totalUses }} 次</span>
        <span>收藏 {{ activePrompts }} 张</span>
      </div>
    </div>

    <!-- 主区域：卡组网格 -->
    <div class="sts-main">
      <div class="sts-header">
        <h2>提示词卡组</h2>
        <div class="sts-header-actions">
          <el-switch v-model="copyMode" active-text="复制模式" inactive-text="浏览模式" size="small"
            style="--el-switch-on-color:#22C55E" />
          <el-radio-group v-model="viewFilter" size="small" class="sts-filter-group">
            <el-radio-button value="all">全部</el-radio-button>
            <el-radio-button value="attack">生成型</el-radio-button>
            <el-radio-button value="skill">分析型</el-radio-button>
            <el-radio-button value="power">评估型</el-radio-button>
          </el-radio-group>
          <el-input v-model="search" placeholder="搜索卡牌..." size="small" style="width:200px" clearable />
          <el-button size="small" :icon="CopyDocument" @click="openImport">导入</el-button>
          <el-button size="small" :icon="Plus" type="primary">新卡牌</el-button>
          <el-tag v-if="dataLoaded" size="small" effect="plain" :type="cards.length > 8 ? 'success' : 'info'" style="margin-left:4px">
            {{ cards.length }}张
          </el-tag>
          <el-button size="small" text @click="reloadCards" :loading="!dataLoaded" style="margin-left:2px">🔄</el-button>
        </div>
      </div>

      <!-- 窗口AI导入对话框 -->
      <el-dialog v-model="showImportPanel" title="窗口AI智能导入" width="620px" :close-on-click-modal="false">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
          <span style="font-weight:600;font-size:13px">导入模式：</span>
          <el-radio-group v-model="importMode" size="small" @change="copyImportPrompt">
            <el-radio-button value="single">单条</el-radio-button>
            <el-radio-button value="batch">批量(语雀)</el-radio-button>
          </el-radio-group>
          <span style="font-size:11px;color:#8492a6">切换自动重新复制提示词</span>
        </div>
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:10px 14px;margin-bottom:14px;font-size:12px;color:#166534">
          <b>① 提示词已自动复制到剪贴板</b> → 粘贴到任意AI窗口（ChatGPT/DeepSeek/Kimi等）
        </div>
        <div style="margin-bottom:6px;font-weight:600;font-size:13px">② 粘贴AI返回的JSON{{ importMode==='batch' ? '数组' : '' }}：</div>
        <el-input v-model="aiImportInput" type="textarea" :rows="10" :placeholder="importPlaceholder" />
        <template #footer>
          <el-button @click="showImportPanel = false">取消</el-button>
          <el-button type="success" @click="submitAiImport" :loading="aiImportLoading">③ 解析导入</el-button>
        </template>
      </el-dialog>

      <!-- 卡牌网格 -->
      <div class="sts-card-grid">
        <div v-for="card in filteredCards" :key="card.id" class="sts-card"
          :class="[`sts-card-${card.type}`, `sts-card-rarity-${card._rarity}`,
                   { 'sts-card-upgraded': card.version !== card.versions[card.versions.length-1].version }]"
          @click="copyMode ? copy(card.content, card.name) : (selectedCardId = card.id, upgradePreview = false)">
          <!-- 卡牌框架 -->
          <div class="sts-card-frame">
            <!-- 能量消耗 -->
            <div class="sts-card-cost">
              <span class="sts-cost-orb">{{ card.cost }}</span>
            </div>
            <!-- 卡图区域 -->
            <div class="sts-card-art">
              <span class="sts-card-art-icon">{{ card.icon }}</span>
            </div>
            <!-- 卡名 -->
            <div class="sts-card-name">{{ card.name }}</div>
            <!-- 类型条 -->
            <div class="sts-card-type-bar">
              {{ typeLabel(card.type) }}
            </div>
            <!-- 描述 -->
            <div class="sts-card-desc">
              {{ card.desc }}
            </div>
            <!-- 版本指示器 -->
            <div class="sts-card-ver">
              <span class="sts-ver-tag">{{ card.version }}</span>
              <span class="sts-ver-count" v-if="card.versions.length > 1">+{{ card.versions.length - 1 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 卡牌详情弹窗（大卡牌视图 + 升级预览） -->
    <el-dialog v-model="showDetail" :title="null" width="680px" :show-close="true" class="sts-dialog" destroy-on-close>
      <template v-if="selectedCard">
        <div class="sts-detail-layout">
          <!-- 大卡牌展示 -->
          <div class="sts-detail-card" :class="[`sts-card-type-${selectedCard.type}`, `sts-card-rarity-${rarityRank(selectedCard.uses)}`]">
            <div class="sts-detail-card-frame">
              <div class="sts-detail-cost">
                <span class="sts-detail-cost-orb">{{ selectedCard.cost }}</span>
                <span class="sts-detail-cost-label">复杂度</span>
              </div>
              <div class="sts-detail-art">
                <span class="sts-detail-art-icon">{{ selectedCard.icon }}</span>
                <div class="sts-detail-tags">
                  <el-tag v-for="t in selectedCard.tags" :key="t" size="small" effect="dark">{{ t }}</el-tag>
                </div>
              </div>
              <div class="sts-detail-name">{{ selectedCard.name }}</div>
              <div class="sts-detail-type-bar">{{ typeLabel(selectedCard.type) }}</div>
              <div class="sts-detail-desc">
                <div class="sts-detail-desc-scroll">{{ upgradePreview ? selectedVersion.content : selectedCard.content }}</div>
                <div class="sts-detail-desc-meta">{{ (upgradePreview ? selectedVersion.content : selectedCard.content).length }}字 · 滚动查看完整内容</div>
              </div>
              <div class="sts-detail-ver">
                <span class="sts-detail-ver-tag" :class="{ upgraded: upgradePreview }">{{ upgradePreview ? selectedVersion.version : selectedCard.version }}</span>
                <span v-if="!upgradePreview && selectedCard.versions.length > 1" class="sts-upgrade-hint">点击下方版本升级预览</span>
              </div>
              <div class="sts-detail-stats">
                <span>使用 {{ selectedCard.uses }} 次</span>
                <span>胜率 {{ selectedCard.winRate }}%</span>
              </div>
            </div>
          </div>

          <!-- 右侧：升级树 + 操作 -->
          <div class="sts-detail-side">
            <div class="sts-upgrade-title">升级路径</div>
            <div class="sts-upgrade-tree">
              <div v-for="(v, i) in selectedCard.versions" :key="v.id" class="sts-upgrade-node"
                :class="{ current: v.version === selectedCard.version && !upgradePreview,
                         preview: v.version === selectedVersion?.version && upgradePreview,
                         latest: i === selectedCard.versions.length - 1 }"
                @click="selectedVersion = v; upgradePreview = v.version !== selectedCard.version">
                <div class="sts-upgrade-connector" v-if="i > 0"></div>
                <div class="sts-upgrade-node-body">
                  <div class="sts-upgrade-node-ver">{{ v.version }}</div>
                  <div class="sts-upgrade-node-date">{{ v.date }}</div>
                  <div class="sts-upgrade-node-desc">{{ v.desc }}</div>
                  <el-tag v-if="v.stage==='prod'" size="small" type="success" effect="dark">生产</el-tag>
                  <el-tag v-else-if="v.stage==='staging'" size="small" type="warning" effect="dark">预发</el-tag>
                  <span v-else class="sts-draft-badge">草稿</span>
                </div>
              </div>
            </div>
            <div class="sts-detail-actions">
              <el-button size="small" :icon="CopyDocument" type="primary" @click="copy(upgradePreview ? selectedVersion.content : selectedCard.content)">
                复制{{ upgradePreview ? selectedVersion.version : '' }}
              </el-button>
              <el-button size="small" text @click="upgradePreview = false; selectedVersion = null">回当前版本</el-button>
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
const selectedCardId = ref(null)
const upgradePreview = ref(false)
const selectedVersion = ref(null)
const showImportPanel = ref(false)
const copyMode = ref(false)
const dataLoaded = ref(false)

// Load cards from external JSON on mount
onMounted(async () => {
  try {
    const res = await fetch('/prompt-cards.json')
    if (!res.ok) throw new Error('HTTP ' + res.status)
    const data = await res.json()
    cards.value = data
    dataLoaded.value = true
    console.log('[PromptManager] 已加载 ' + data.length + ' 张卡片')
  } catch (e) {
    console.warn('[PromptManager] 无法加载 prompt-cards.json，使用内置示例:', e.message)
    cards.value = sampleCards
    dataLoaded.value = true
  }
})

// 打开导入面板时自动复制拼接好的prompt
function openImport() { showImportPanel.value = true; copyImportPrompt() }

const typeLabel = (t) => ({ attack: '生成型', skill: '分析型', power: '评估型' }[t] || t)
const rarityRank = (uses) => uses >= 300 ? 'gold' : uses >= 100 ? 'silver' : uses >= 50 ? 'bronze' : 'copper'
const rarityLabel = (r) => ({ gold: '稀有', silver: '罕见', bronze: '普通', copper: '基础' }[r] || r)
const rarityGradient = (r) => ({
  gold: 'linear-gradient(135deg, #C5AB50, #AC933E, #FBF8AE)',
  silver: 'linear-gradient(135deg, #B4B9BE, #716F71, #A8A9AD)',
  bronze: 'linear-gradient(135deg, #A97142, #6E3A06, #B08D57)',
  copper: 'linear-gradient(135deg, #DC826B, #CB6A52, #FFE4BB)',
}[r] || '')

const relics = [
  { icon: '📜', name: '提示词法典', desc: '管理所有AI提示词版本' },
  { icon: '⚡', name: '闪电瓶', desc: '一键复制到剪贴板' },
  { icon: '🔄', name: '升级棱镜', desc: '版本迭代与对比' },
]

const showDetail = computed({
  get: () => selectedCardId.value !== null,
  set: (v) => { if (!v) { selectedCardId.value = null; upgradePreview.value = false; selectedVersion.value = null } }
})
const selectedCard = computed(() => cards.value.find(c => c.id === selectedCardId.value))
const totalUses = computed(() => cards.value.reduce((s, c) => s + c.uses, 0))
const activePrompts = computed(() => cards.value.filter(c => c.stage === 'prod').length)

// Sample data — used as fallback if prompt-cards.json can't be loaded
const sampleCards = [
  { id: 1, name: '考研翻译评分', type: 'power', cost: 3, icon: '📝', uses: 387, winRate: 82, stage: 'prod',
    version: 'v3.0', desc: '对学生译文进行四维AI评分', content: '你是考研英语一翻译题的专业评分老师。你需要对学生的中文译文进行四维评分，满分100分（每个维度25分）。\n\n评分标准：\n1. 准确性(0-25)：原文意思是否准确传达，无漏译、误译、增译\n2. 语法结构(0-25)：长难句和特殊语法结构（定语从句、被动语态、倒装、虚拟语气等）是否被正确处理\n3. 词汇表达(0-25)：用词是否准确地道，搭配是否自然，术语翻译是否恰当\n4. 流畅度(0-25)：中文表达是否通顺，语序是否符合汉语习惯，连接是否自然\n\n请严格按照以下JSON格式返回，不要加任何其他文字：\n{\n  "accuracy": 20,\n  "grammar": 18,\n  "vocabulary": 19,\n  "fluency": 21,\n  "total": 78,\n  "feedback": "逐句点评：\\n1. ..."\n}',
    tags: ['翻译', '教育'], versions: [
      { id: 101, version: 'v3.0', date: '05-10', desc: '增加流畅度维度，四维评分', stage: 'prod', content: '四维评分版本...' },
      { id: 102, version: 'v2.1', date: '04-28', desc: '修复JSON格式不稳定', stage: 'staging', content: '三维评分版本...' },
      { id: 103, version: 'v2.0', date: '04-15', desc: '重构评分标准', stage: 'draft', content: '二维评分版本...' },
      { id: 104, version: 'v1.0', date: '03-20', desc: '初版', stage: 'draft', content: '基础评分版本...' },
    ]},
  { id: 2, name: 'Vue3组件生成', type: 'attack', cost: 2, icon: '💻', uses: 203, winRate: 75, stage: 'prod',
    version: 'v2.1', desc: '根据需求生成Vue3 SFC组件', content: '你是一个专业的Vue 3开发专家。请根据以下需求，生成完整的单文件组件(SFC)。\n\n要求：\n1. 使用Composition API (<script setup>)\n2. 使用Element Plus UI组件库\n3. TypeScript类型安全\n4. 错误处理和加载状态\n5. 响应式设计',
    tags: ['代码', '前端'], versions: [
      { id: 201, version: 'v2.1', date: '05-08', desc: '增加TS和测试', stage: 'prod', content: '带TS版本...' },
      { id: 202, version: 'v1.0', date: '03-25', desc: '初版', stage: 'draft', content: '基础版本...' },
    ]},
  { id: 3, name: '任务解析器', type: 'skill', cost: 2, icon: '📋', uses: 316, winRate: 88, stage: 'prod',
    version: 'v1.3', desc: '解析自然语言为结构化任务JSON', content: '解析用户输入的自然语言文本，提取任务信息并生成结构化JSON。\n\n提取字段：\n- 标题(必填)\n- 优先级(high/medium/low)\n- 预估时间(小时)\n- 截止日期(YYYY-MM-DD)\n- 标签列表',
    tags: ['任务', '结构化'], versions: [
      { id: 301, version: 'v1.3', date: '04-22', desc: '增加子任务和阻塞', stage: 'prod', content: '含子任务版本...' },
      { id: 302, version: 'v1.0', date: '03-10', desc: '初版', stage: 'draft', content: '基础版本...' },
    ]},
  { id: 4, name: '决策树构建', type: 'skill', cost: 3, icon: '🌳', uses: 129, winRate: 70, stage: 'staging',
    version: 'v1.0', desc: '根据任务描述生成三层决策树', content: '根据任务描述，生成一个决策树JSON。\n\n节点格式：\n{\n  "id": "string",\n  "label": "子任务描述",\n  "status": "pending",\n  "estimatedHours": number,\n  "children": [...]\n}\n\n规则：最大深度3层。',
    tags: ['任务', '结构化'], versions: [
      { id: 401, version: 'v1.0', date: '04-05', desc: '初版', stage: 'staging', content: '三层决策树...' },
    ]},
  { id: 5, name: '周报生成', type: 'attack', cost: 1, icon: '📊', uses: 56, winRate: 90, stage: 'prod',
    version: 'v1.2', desc: '按项目分组生成专业周报', content: '根据以下工作要点生成一份专业的周报。\n\n要求：\n- 按项目分组\n- 突出关键进展和里程碑\n- 标注风险和阻塞项\n- 控制在500字以内',
    tags: ['写作'], versions: [
      { id: 501, version: 'v1.2', date: '04-30', desc: '增加风险标注', stage: 'prod', content: '含风险标注版本...' },
      { id: 502, version: 'v1.0', date: '04-10', desc: '初版', stage: 'draft', content: '基础版本...' },
    ]},
  { id: 6, name: '邮件润色', type: 'skill', cost: 1, icon: '✉️', uses: 41, winRate: 95, stage: 'draft',
    version: 'v1.0', desc: '润色邮件使其专业简洁', content: '请润色以下邮件内容，使其更加专业、简洁、有礼貌。保持原意不变，不添加新内容。',
    tags: ['写作'], versions: [
      { id: 601, version: 'v1.0', date: '04-18', desc: '初版', stage: 'draft', content: '基础版本...' },
    ]},
  { id: 7, name: '论文摘要改写', type: 'skill', cost: 2, icon: '📚', uses: 33, winRate: 78, stage: 'prod',
    version: 'v2.0', desc: '改写学术摘要适配期刊风格', content: '改写以下学术摘要。\n要求：\n1. 篇幅缩减30%\n2. 保留核心发现和方法\n3. 句式更多样化\n4. 适合目标期刊风格（SCI三区）',
    tags: ['写作', '教育'], versions: [
      { id: 701, version: 'v2.0', date: '03-15', desc: '增加期刊风格', stage: 'prod', content: '期刊风格版本...' },
      { id: 702, version: 'v1.0', date: '02-20', desc: '初版', stage: 'draft', content: '基础版本...' },
    ]},
  { id: 8, name: 'Python脚本编写', type: 'attack', cost: 2, icon: '🐍', uses: 94, winRate: 72, stage: 'staging',
    version: 'v1.0', desc: '生成类型安全的Python脚本', content: '请编写一个Python 3.10+脚本。\n\n代码规范：\n- 完整的类型提示\n- 异常处理\n- argparse命令行参数\n- if __name__ == "__main__" 守卫',
    tags: ['代码'], versions: [
      { id: 801, version: 'v1.0', date: '04-05', desc: '初版', stage: 'staging', content: '基础版本...' },
    ]},
]

// Runtime cards — populated from JSON on mount, falls back to sampleCards
const cards = ref([])

const filteredCards = computed(() => {
  let list = cards.value
  if (viewFilter.value !== 'all') list = list.filter(c => c.type === viewFilter.value)
  if (search.value) list = list.filter(c => c.name.includes(search.value) || c.desc.includes(search.value))
  // 按使用次数降序排列
  list = [...list].sort((a, b) => b.uses - a.uses)
  // 动态计算稀有度
  return list.map(c => ({ ...c, _rarity: rarityRank(c.uses) }))
})

// ========== 窗口AI智能导入 ==========
const aiImportInput = ref('')
const aiImportLoading = ref(false)
const importMode = ref('single') // 'single' | 'batch'
const importPlaceholder = computed(() => importMode.value === 'batch'
  ? '[{"name":"...","type":"skill","category":"...","tags":[...],"desc":"...","cost":2,"version":"v2.1","content":"..."}]'
  : '{"name":"...","type":"skill","tags":["..."],"desc":"...","cost":2}')

// 单条导入提示词
const SINGLE_IMPORT_PROMPT = `请分析以下提示词内容，提取结构化信息，返回严格JSON（不要加任何其他文字）：

{
  "name": "提示词名称",
  "type": "attack|skill|power",
  "category": "分类名",
  "tags": ["标签1","标签2"],
  "desc": "一句话描述",
  "cost": 1-3的复杂度数字
}

类型说明：attack(生成型-产出代码/文档/内容)、skill(分析型-解析/转换/提取)、power(评估型-评分/判断/审查)
cost: 1=简单指令, 2=需要上下文, 3=复杂多步骤

待分析提示词：`

// 批量导入提示词 — 处理语雀导出的N级标题+版本号格式
const BATCH_IMPORT_PROMPT = `你是提示词结构化整理专家。请解析以下从语雀导出的提示词文档，将其中的每一条提示词提取为结构化JSON数组。

语雀文档格式特点：
- 用N级标题(# ## ### ####)划分提示词层级和分类
- 版本号用注释标注，如 /*v1.0*/ /*v2.3*/ /*最终版*/ 等
- 提示词内容包含系统指令、角色设定、输出格式要求等
- 一个标题段落通常是一条独立的提示词

提取规则：
1. 每个独立的提示词作为一个对象
2. 用标题层级推断 category（一级标题=大类，二级标题=子类）
3. 识别版本号注释并提取为 version 字段
4. 根据内容判断 type：产出代码/文档/内容的=attack，解析/转换/提取信息的=skill，评分/判断/审查质量的=power
5. cost 根据提示词复杂度：简单一问一答=1，需要上下文理解=2，多步骤复杂流程=3
6. 提取3-5个关键词作为 tags
7. desc 写一句简短描述（15字以内）
8. content 保留原始提示词全文（即使很长也要完整保留，这是用户的核心资产）
9. 如果原文有多级标题嵌套，category 用 "大类/子类" 格式

返回严格JSON数组（不要加任何其他文字）：
[
  {
    "name": "提示词名称",
    "type": "attack|skill|power",
    "category": "编程/代码生成",
    "tags": ["Vue3","前端","组件"],
    "desc": "生成Vue3 SFC组件",
    "cost": 2,
    "version": "v2.1",
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

    // 尝试解析JSON数组（批量）或单个对象（单条）
    if (text.startsWith('[')) {
      parsed = JSON.parse(text)
      if (!Array.isArray(parsed)) throw new Error('期望JSON数组')
    } else {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('未识别到JSON')
      parsed = [JSON.parse(jsonMatch[0])]
    }

    let imported = 0
    for (const data of parsed) {
      if (!data.name) continue
      const card = {
        id: Date.now() + imported,
        name: data.name,
        type: ['attack','skill','power'].includes(data.type) ? data.type : 'skill',
        cost: Math.min(3, Math.max(1, data.cost || 1)),
        icon: ({ attack:'💻', skill:'📋', power:'📝' }[data.type]) || '📄',
        uses: 0, winRate: 0, stage: data.version ? 'draft' : 'draft',
        version: data.version || 'v1.0',
        desc: data.desc || '',
        content: data.content || '',
        category: data.category || '未分类',
        tags: data.tags || [],
        versions: [{
          id: Date.now() + imported + 1000,
          version: data.version || 'v1.0',
          date: new Date().toISOString().slice(0,10),
          desc: '语雀导入',
          stage: 'draft',
          content: data.content || ''
        }],
      }
      cards.value.unshift(card)
      imported++
    }
    aiImportInput.value = ''
    ElMessage.success(`批量导入完成：${imported}条提示词`)
  } catch (e) {
    ElMessage.error('解析失败：' + e.message)
  }
  aiImportLoading.value = false
}

watch(upgradePreview, (v) => { if (!v) selectedVersion.value = null })

function copy(text, name) { navigator.clipboard.writeText(text).then(() => ElMessage.success(name ? `已复制：${name}` : '已复制')) }

// Reload cards from JSON (for after re-running merge script)
async function reloadCards() {
  dataLoaded.value = false
  try {
    const res = await fetch('/prompt-cards.json?t=' + Date.now())
    if (!res.ok) throw new Error('HTTP ' + res.status)
    cards.value = await res.json()
    ElMessage.success(`已加载 ${cards.value.length} 张卡片`)
  } catch (e) {
    ElMessage.warning('加载失败: ' + e.message)
    if (cards.value.length === 0) cards.value = sampleCards
  }
  dataLoaded.value = true
}
</script>

<style scoped>
/* === 全局暗色基调 === */
.sts-app {
  display:flex; flex-direction:column; height:calc(100vh - 80px);
  background:linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color:#d0d0d0; overflow:hidden; border-radius:8px;
}

/* === 遗物栏 === */
.sts-relic-bar {
  display:flex; align-items:center; gap:12px; padding:8px 16px;
  background:linear-gradient(180deg, #2c2c1a, #1a1a0e);
  border-bottom:2px solid #6b4c1e; flex-shrink:0;
}
.sts-relic { display:flex; align-items:center; gap:4px; padding:4px 10px; background:rgba(107,76,30,.3); border:1px solid #6b4c1e; border-radius:6px; cursor:help; }
.sts-relic-icon { font-size:16px; }
.sts-relic-name { font-size:11px; color:#c8a96e; }
.sts-relic-bar-spacer { flex:1; }
.sts-health { display:flex; gap:12px; font-size:11px; color:#c8a96e; font-family:monospace; }

/* === 主区域 === */
.sts-main { flex:1; display:flex; flex-direction:column; padding:16px; overflow:hidden; }
.sts-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-shrink:0; }
.sts-header h2 { margin:0; font-size:22px; color:#c8a96e; text-shadow:1px 1px 2px rgba(0,0,0,.5); }
.sts-header-actions { display:flex; gap:8px; align-items:center; }
.sts-filter-group :deep(.el-radio-button__inner) { background:rgba(0,0,0,.3); border-color:#4a3728; color:#aaa; }
.sts-filter-group :deep(.is-active .el-radio-button__inner) { background:#c8a96e; border-color:#c8a96e; color:#1a1a2e; }

/* 导入面板 */


/* === 卡牌网格 === */
.sts-card-grid { flex:1; overflow-y:auto; display:grid; grid-template-columns:repeat(auto-fill, minmax(220px, 1fr)); gap:14px; align-content:start; padding:4px; }
.sts-card { cursor:pointer; transition:transform .15s, box-shadow .15s; perspective:600px; }
.sts-card:hover { transform:translateY(-4px); z-index:2; }
.sts-card-frame {
  padding:12px 14px; border-radius:10px; border:2px solid #4a3728;
  background:linear-gradient(180deg, #2a2a3e, #1e1e30);
  position:relative; min-height:180px; display:flex; flex-direction:column;
}
/* 卡牌类型边框色 */
.sts-card-type-attack .sts-card-frame { border-color:#c0392b; box-shadow:inset 0 0 20px rgba(192,57,43,.1); }
.sts-card-type-skill .sts-card-frame { border-color:#2980b9; box-shadow:inset 0 0 20px rgba(41,128,185,.1); }
.sts-card-type-power .sts-card-frame { border-color:#8e44ad; box-shadow:inset 0 0 20px rgba(142,68,173,.15); }
/* 稀有度 — 基于使用次数，配色来自 prize-box */
.sts-card-rarity-gold .sts-card-frame { background:linear-gradient(180deg, #3a2a0e, #1a0e00); border-color:#C5AB50; box-shadow:0 0 12px rgba(197,171,80,.25); }
.sts-card-rarity-gold .sts-card-name { color:#FBF8AE; }
.sts-card-rarity-gold .sts-cost-orb { background:radial-gradient(circle at 35% 35%, #FBF8AE, #C5AB50); border-color:#AC933E; color:#1a0e00; }
.sts-card-rarity-silver .sts-card-frame { background:linear-gradient(180deg, #2a2a2a, #181818); border-color:#B4B9BE; box-shadow:0 0 8px rgba(180,185,190,.2); }
.sts-card-rarity-silver .sts-card-name { color:#A8A9AD; }
.sts-card-rarity-silver .sts-cost-orb { background:radial-gradient(circle at 35% 35%, #A8A9AD, #716F71); border-color:#716F71; color:#fff; }
.sts-card-rarity-bronze .sts-card-frame { background:linear-gradient(180deg, #2a1a0e, #1a0e00); border-color:#A97142; box-shadow:0 0 6px rgba(169,113,66,.15); }
.sts-card-rarity-bronze .sts-card-name { color:#B08D57; }
.sts-card-rarity-bronze .sts-cost-orb { background:radial-gradient(circle at 35% 35%, #B08D57, #6E3A06); border-color:#6E3A06; color:#fff; }
.sts-card-rarity-copper .sts-card-frame { background:linear-gradient(180deg, #252530, #1a1a24); border-color:#555; }
.sts-card-rarity-copper .sts-card-name { color:#ccc; }
.sts-card-rarity-copper .sts-cost-orb { background:radial-gradient(circle at 35% 35%, #999, #555); border-color:#444; color:#fff; }

/* 详情弹窗稀有度 */
.sts-detail-card.sts-card-rarity-gold { background:linear-gradient(180deg, #3a2a0e, #1a0e00); border:2px solid #C5AB50; }
.sts-detail-card.sts-card-rarity-silver { background:linear-gradient(180deg, #2a2a2a, #181818); border:2px solid #B4B9BE; }
.sts-detail-card.sts-card-rarity-bronze { background:linear-gradient(180deg, #2a1a0e, #1a0e00); border:2px solid #A97142; }
.sts-detail-card.sts-card-rarity-copper { background:linear-gradient(180deg, #252530, #1a1a24); border:2px solid #555; }

/* 升级辉光 */
.sts-card-upgraded .sts-card-frame { box-shadow:0 0 12px rgba(34,197,94,.3); }
.sts-card-upgraded .sts-card-name { color:#4ade80; }

/* 能量球 */
.sts-card-cost { position:absolute; top:-6px; left:8px; }
.sts-cost-orb {
  display:inline-flex; align-items:center; justify-content:center;
  width:32px; height:32px; border-radius:50%;
  background:radial-gradient(circle at 35% 35%, #5dade2, #2471a3);
  border:2px solid #1b4f72; color:#fff; font-size:14px; font-weight:800;
  box-shadow:0 2px 8px rgba(36,113,163,.4);
}

/* 卡图 */
.sts-card-art { text-align:center; padding:10px 0 6px; }
.sts-card-art-icon { font-size:36px; filter:drop-shadow(0 2px 4px rgba(0,0,0,.5)); }

/* 卡名 */
.sts-card-name { font-weight:700; font-size:14px; color:#e8e8e8; text-align:center; }

/* 类型条 */
.sts-card-type-bar {
  text-align:center; font-size:10px; padding:2px 0; margin:6px 0;
  border-radius:3px; font-weight:600; letter-spacing:1px;
}
.sts-card-type-attack .sts-card-type-bar { background:rgba(192,57,43,.2); color:#e74c3c; }
.sts-card-type-skill .sts-card-type-bar { background:rgba(41,128,185,.2); color:#3498db; }
.sts-card-type-power .sts-card-type-bar { background:rgba(142,68,173,.2); color:#9b59b6; }

/* 描述 */
.sts-card-desc { font-size:11px; color:#909090; text-align:center; line-height:1.5; flex:1; }

/* 版本 */
.sts-card-ver { display:flex; justify-content:center; gap:4px; margin-top:8px; }
.sts-ver-tag { font-family:monospace; font-size:10px; color:#c8a96e; background:rgba(107,76,30,.2); padding:1px 6px; border-radius:3px; }
.sts-ver-count { font-size:10px; color:#4ade80; background:rgba(34,197,94,.15); padding:1px 5px; border-radius:3px; }

/* === 详情弹窗 === */
.sts-dialog :deep(.el-dialog) { background:#1a1a2e; border:2px solid #6b4c1e; border-radius:12px; }
.sts-dialog :deep(.el-dialog__header) { display:none; }
.sts-dialog :deep(.el-dialog__body) { padding:0; }
.sts-detail-layout { display:flex; gap:0; min-height:480px; }
.sts-detail-card { flex:1; padding:20px; background:#16213e; }
.sts-detail-card-frame { position:relative; display:flex; flex-direction:column; align-items:center; gap:8px; }
.sts-detail-cost { text-align:center; }
.sts-detail-cost-orb {
  display:inline-flex; align-items:center; justify-content:center;
  width:48px; height:48px; border-radius:50%;
  background:radial-gradient(circle at 35% 35%, #5dade2, #2471a3);
  border:3px solid #1b4f72; color:#fff; font-size:22px; font-weight:800;
}
.sts-detail-cost-label { display:block; font-size:10px; color:#5dade2; margin-top:2px; }
.sts-detail-art { text-align:center; padding:8px 0; }
.sts-detail-art-icon { font-size:56px; }
.sts-detail-tags { display:flex; gap:4px; justify-content:center; margin-top:6px; }
.sts-detail-name { font-weight:800; font-size:20px; color:#e8e8e8; }
.sts-detail-type-bar {
  padding:4px 0; width:120px; text-align:center; font-size:11px; font-weight:700;
  border-radius:4px; letter-spacing:2px;
}
.sts-card-type-attack .sts-detail-type-bar { background:rgba(192,57,43,.3); color:#e74c3c; }
.sts-card-type-skill .sts-detail-type-bar { background:rgba(41,128,185,.3); color:#3498db; }
.sts-card-type-power .sts-detail-type-bar { background:rgba(142,68,173,.3); color:#9b59b6; }
.sts-detail-desc { display:flex; flex-direction:column; max-width:320px; flex:1; min-height:0; }
.sts-detail-desc-scroll { font-size:12px; color:#909090; line-height:1.7; text-align:left; overflow-y:auto; flex:1; max-height:200px; padding-right:4px; white-space:pre-wrap; word-break:break-word; }
.sts-detail-desc-scroll::-webkit-scrollbar { width:4px; }
.sts-detail-desc-scroll::-webkit-scrollbar-thumb { background:#4a3728; border-radius:2px; }
.sts-detail-desc-meta { font-size:10px; color:#6b5e4e; text-align:center; margin-top:4px; flex-shrink:0; }
.sts-detail-ver { display:flex; align-items:center; gap:8px; }
.sts-detail-ver-tag {
  font-family:monospace; font-weight:700; color:#c8a96e;
  background:rgba(107,76,30,.3); border:1px solid #6b4c1e; padding:2px 10px; border-radius:4px;
 transition:all .2s;
}
.sts-detail-ver-tag.upgraded { color:#4ade80; border-color:#22c55e; background:rgba(34,197,94,.2); box-shadow:0 0 10px rgba(34,197,94,.3); }
.sts-upgrade-hint { font-size:11px; color:#4ade80; }
.sts-detail-stats { display:flex; gap:16px; font-size:11px; color:#8492a6; font-family:monospace; }

/* 升级树 */
.sts-detail-side { width:280px; background:#12121e; padding:16px; display:flex; flex-direction:column; overflow-y:auto; }
.sts-upgrade-title { font-size:14px; font-weight:700; color:#c8a96e; margin-bottom:12px; }
.sts-upgrade-tree { flex:1; }
.sts-upgrade-node { position:relative; padding-left:20px; cursor:pointer; }
.sts-upgrade-node:not(:last-child) { margin-bottom:2px; }
.sts-upgrade-node:not(:last-child)::before {
  content:''; position:absolute; left:8px; top:16px; width:2px; height:calc(100% + 2px);
  background:#4a3728;
}
.sts-upgrade-node.current::before { background:#c8a96e; }
.sts-upgrade-node-body { padding:10px 12px; border:1px solid #2a2a3e; border-radius:6px; transition:all .15s; }
.sts-upgrade-node-body:hover { border-color:#6b4c1e; background:rgba(107,76,30,.1); }
.sts-upgrade-node.current .sts-upgrade-node-body { border-color:#c8a96e; background:rgba(200,169,110,.1); }
.sts-upgrade-node.preview .sts-upgrade-node-body { border-color:#4ade80; background:rgba(34,197,94,.1); box-shadow:0 0 8px rgba(34,197,94,.2); }
.sts-upgrade-node-ver { font-family:monospace; font-weight:700; font-size:13px; color:#c8a96e; }
.sts-upgrade-node.preview .sts-upgrade-node-ver { color:#4ade80; }
.sts-upgrade-node-date { font-size:10px; color:#8492a6; }
.sts-upgrade-node-desc { font-size:11px; color:#909090; margin-top:2px; }
.sts-draft-badge { font-size:10px; color:#606060; }
.sts-detail-actions { display:flex; justify-content:space-between; align-items:center; padding-top:12px; border-top:1px solid #2a2a3e; margin-top:12px; }
</style>
