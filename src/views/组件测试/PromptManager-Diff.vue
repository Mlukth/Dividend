<template>
  <div class="pm-hybrid">
    <!-- 元模型类比栏 -->
    <div class="meta-banner">
      <span>🎴 <b>收藏品</b> → 可迭代升级 → 可对比遴选</span>
      <span class="meta-ref">宝可梦图鉴 + 暗黑威能 + 原神对比</span>
    </div>

    <!-- 三栏主体 -->
    <div class="hyb-body">
      <!-- 栏1：提示词图鉴 -->
      <aside class="hyb-col hyb-library">
        <div class="hyb-col-header">
          <h3>图鉴</h3>
          <el-button size="small" circle :icon="Plus" @click="addNewPrompt" />
        </div>
        <el-input v-model="search" placeholder="搜索..." size="small" class="hyb-search" clearable />
        <div class="hyb-tags">
          <el-tag v-for="t in allTags" :key="t" size="small"
            :type="activeTag === t ? '' : 'info'" :effect="activeTag === t ? 'dark' : 'plain'"
            @click="activeTag = activeTag === t ? '' : t" style="cursor:pointer">
            {{ t }}
          </el-tag>
        </div>
        <div class="hyb-card-list">
          <div v-for="p in filteredPrompts" :key="p.id" class="hyb-card"
            :class="{ active: selectedPromptId === p.id }"
            @click="selectPrompt(p.id)">
            <span class="hyb-card-icon">{{ categoryIcon(p.category) }}</span>
            <div class="hyb-card-body">
              <div class="hyb-card-name">{{ p.name }}</div>
              <div class="hyb-card-meta">
                <span>{{ p.category }}</span>
                <span>{{ p.versions.length }}版本</span>
                <span>{{ p.totalUses }}次</span>
              </div>
            </div>
            <span class="hyb-card-ver">{{ p.activeVersion }}</span>
          </div>
        </div>
        <div class="hyb-col-footer">共 {{ filteredPrompts.length }} 个</div>
      </aside>

      <!-- 栏2：版本时间线（竖向） -->
      <aside class="hyb-col hyb-versions" v-if="selectedPrompt">
        <div class="hyb-col-header">
          <h3>版本</h3>
          <el-button size="small" circle :icon="Plus" @click="ElMessage.info('新建版本（演示）')" />
        </div>
        <div class="hyb-ver-list">
          <div v-for="v in selectedPrompt.versions" :key="v.id" class="hyb-ver-item"
            :class="{
              active: v.id === activeVerId,
              base: v.id === compareVerId,
              prod: v.stage === 'prod'
            }"
            @click="activeVerId = v.id"
            @dblclick="compareVerId = v.id">
            <div class="hyb-ver-head">
              <span class="hyb-ver-tag">{{ v.version }}</span>
              <el-tag v-if="v.stage==='prod'" size="small" type="success" effect="dark">生产</el-tag>
              <el-tag v-else-if="v.stage==='staging'" size="small" type="warning" effect="dark">预发</el-tag>
            </div>
            <div class="hyb-ver-date">{{ v.date }}</div>
            <div class="hyb-ver-desc">{{ v.desc }}</div>
            <div class="hyb-ver-actions" v-if="v.id === activeVerId">
              <span class="hyb-ver-current">当前查看</span>
            </div>
            <div class="hyb-ver-actions" v-if="v.id === compareVerId">
              <span class="hyb-ver-baseline">对比基准</span>
            </div>
          </div>
        </div>
        <div class="hyb-ver-hint">双击版本设为对比基准</div>
      </aside>

      <!-- 栏3：内容/diff -->
      <main class="hyb-col hyb-content" v-if="selectedPrompt && activeVersion">
        <div class="hyb-col-header">
          <h3>
            <span v-if="!compareVerId">编辑</span>
            <span v-else>对比</span>
          </h3>
          <div class="hyb-content-actions">
            <el-button size="small" :icon="CopyDocument" @click="copy(activeVersion.content)">复制</el-button>
            <el-button v-if="compareVerId" size="small" text @click="compareVerId = null">退出对比</el-button>
          </div>
        </div>

        <!-- 单栏编辑模式 -->
        <div v-if="!compareVerId" class="hyb-edit-area">
          <div class="hyb-edit-meta">
            <span class="hyb-edit-ver">{{ activeVersion.version }}</span>
            <span>{{ activeVersion.date }}</span>
            <span class="hyb-edit-desc">{{ activeVersion.desc }}</span>
          </div>
          <el-input v-model="activeVersion.content" type="textarea" :rows="99" resize="vertical"
            class="hyb-editor" />
        </div>

        <!-- 双栏 diff 模式 -->
        <div v-else-if="compareVersion" class="hyb-diff-area">
          <div class="hyb-diff-stats">
            <span style="color:#22C55E">+{{ diffStats.added }}行</span>
            <span style="color:#EF4444">-{{ diffStats.removed }}行</span>
            <span style="color:#8492a6">{{ diffStats.same }}行相同</span>
            <span style="margin-left:auto;font-size:11px">{{ compareVersion.version }} → {{ activeVersion.version }}</span>
          </div>
          <div class="hyb-diff-panels">
            <div class="hyb-diff-panel hyb-diff-old">
              <div class="hyb-diff-panel-head">
                <span class="hyb-diff-ver-tag old">{{ compareVersion.version }}</span>
                <span>{{ compareVersion.date }}</span>
                <span class="hyb-diff-role">基准</span>
              </div>
              <pre class="hyb-diff-content" v-html="renderDiff(compareVersion.content, activeVersion.content, 'old')"></pre>
            </div>
            <div class="hyb-diff-panel hyb-diff-new">
              <div class="hyb-diff-panel-head">
                <span class="hyb-diff-ver-tag new">{{ activeVersion.version }}</span>
                <span>{{ activeVersion.date }}</span>
                <span class="hyb-diff-role">对比</span>
              </div>
              <pre class="hyb-diff-content" v-html="renderDiff(activeVersion.content, compareVersion.content, 'new')"></pre>
            </div>
          </div>
        </div>
      </main>
      <main class="hyb-col hyb-content hyb-empty-content" v-else>
        <el-empty :description="selectedPrompt ? '选择一个版本' : '从图鉴选提示词 → 选版本'" :image-size="90" />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Plus, CopyDocument } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const search = ref('')
const activeTag = ref('')
const selectedPromptId = ref(null)
const activeVerId = ref(null)
const compareVerId = ref(null)

const allTags = ['翻译评分', '代码生成', '写作助手', '任务编排', '教育']
const categoryIcon = (cat) => ({ '翻译评分': '📝', '代码生成': '💻', '写作助手': '✍️', '任务编排': '📋', '教育': '📚' }[cat] || '📄')

const prompts = ref([
  { id: 1, name: '考研英语翻译评分', category: '翻译评分', activeVersion: 'v3.0', stage: 'prod', totalUses: 387,
    versions: [
      { id: 101, version: 'v3.0', date: '05-10', desc: '增加流畅度维度，四维评分', stage: 'prod', content: '你是考研英语一翻译题的专业评分老师。你需要对学生的中文译文进行四维评分，满分100分（每个维度25分）。\n\n评分标准：\n1. 准确性(0-25)：原文意思是否准确传达，无漏译、误译、增译\n2. 语法结构(0-25)：长难句和特殊语法结构（定语从句、被动语态、倒装、虚拟语气等）是否被正确处理\n3. 词汇表达(0-25)：用词是否准确地道，搭配是否自然，术语翻译是否恰当\n4. 流畅度(0-25)：中文表达是否通顺，语序是否符合汉语习惯，连接是否自然\n\n请严格按照以下JSON格式返回，不要加任何其他文字：\n{\n  "accuracy": 20,\n  "grammar": 18,\n  "vocabulary": 19,\n  "fluency": 21,\n  "total": 78,\n  "feedback": "逐句点评：\\n1. ..."\n}' },
      { id: 102, version: 'v2.1', date: '04-28', desc: '修复JSON格式不稳定问题', stage: 'staging', content: '你是考研英语一翻译题的专业评分老师。你需要对学生的中文译文进行三维评分，满分75分。\n\n评分标准：\n1. 准确性(0-25)：原文意思是否准确传达\n2. 语法结构(0-25)：长难句和特殊语法结构是否被正确处理\n3. 词汇表达(0-25)：用词是否准确地道\n\n返回严格JSON格式：\n{"accuracy":20,"grammar":18,"vocabulary":19,"total":57,"feedback":"..."}' },
      { id: 103, version: 'v2.0', date: '04-15', desc: '重构评分标准，增加考点提示', stage: 'draft', content: '你是考研英语翻译题评分老师。请从准确性和语法两个维度评分。\n\n评分维度：\n1. 准确性(0-50)：原文理解准确度\n2. 语法结构(0-50)：长难句处理\n\n返回JSON：\n{"accuracy":42,"grammar":35,"total":77,"feedback":"..."}' },
      { id: 104, version: 'v1.0', date: '03-20', desc: '初版，基础评分', stage: 'draft', content: '请对以下翻译进行评分，满分100分。从准确性和语法两个维度进行评分。返回评分和简要点评。' },
    ]},
  { id: 2, name: 'Vue3组件生成器', category: '代码生成', activeVersion: 'v2.1', stage: 'prod', totalUses: 203,
    versions: [
      { id: 201, version: 'v2.1', date: '05-08', desc: '增加TypeScript和测试要求', stage: 'prod', content: '你是一个专业的Vue 3开发专家。请根据以下需求，生成完整的单文件组件(SFC)。\n\n要求：\n1. 使用Composition API (<script setup>)\n2. 使用Element Plus UI组件库\n3. TypeScript类型安全\n4. 错误处理和加载状态\n5. 响应式设计\n6. 包含单元测试示例' },
      { id: 202, version: 'v1.0', date: '03-25', desc: '初版，基础组件生成', stage: 'draft', content: '你是一个Vue 3开发专家。请根据以下需求生成SFC组件。\n要求：\n1. 使用<script setup>\n2. 使用Element Plus\n3. 响应式设计' },
    ]},
  { id: 3, name: 'TaskCenter任务解析', category: '任务编排', activeVersion: 'v1.3', stage: 'prod', totalUses: 316,
    versions: [
      { id: 301, version: 'v1.3', date: '04-22', desc: '增加子任务和blocked状态', stage: 'prod', content: '解析用户输入的自然语言文本，提取任务信息并生成结构化JSON。\n\n提取字段：\n- 标题(必填)\n- 优先级(high/medium/low)\n- 预估时间(小时)\n- 截止日期(YYYY-MM-DD)\n- 标签列表\n- 子任务列表(可选)\n- 阻塞状态(可选)\n\n如果不是任务描述，返回{"isTask": false}' },
      { id: 302, version: 'v1.0', date: '03-10', desc: '初版，基础字段', stage: 'draft', content: '解析用户输入为任务JSON。提取：标题、优先级、时间、日期。如果不是任务返回isTask:false。' },
    ]},
  { id: 4, name: '决策树生成', category: '任务编排', activeVersion: 'v1.0', stage: 'staging', totalUses: 129,
    versions: [
      { id: 401, version: 'v1.0', date: '04-05', desc: '初版，三层层级决策树', stage: 'staging', content: '根据任务描述，生成一个决策树JSON。\n\n节点格式：\n{\n  "id": "string",\n  "label": "子任务描述",\n  "status": "pending",\n  "estimatedHours": number,\n  "children": [...]\n}\n\n规则：最大深度3层，叶子节点必须是可直接执行的具体步骤。' },
    ]},
  { id: 5, name: '周报生成', category: '写作助手', activeVersion: 'v1.2', stage: 'prod', totalUses: 56,
    versions: [
      { id: 501, version: 'v1.2', date: '04-30', desc: '增加风险标注和字数控制', stage: 'prod', content: '根据以下工作要点生成一份专业的周报。\n\n要求：\n- 按项目分组\n- 突出关键进展和里程碑\n- 标注风险和阻塞项\n- 控制在500字以内' },
      { id: 502, version: 'v1.0', date: '04-10', desc: '初版', stage: 'draft', content: '根据以下要点生成周报。按项目分组，突出关键进展。' },
    ]},
  { id: 6, name: '论文摘要改写', category: '教育', activeVersion: 'v2.0', stage: 'prod', totalUses: 33,
    versions: [
      { id: 701, version: 'v2.0', date: '03-15', desc: '增加篇幅和期刊风格控制', stage: 'prod', content: '改写以下学术摘要。\n要求：\n1. 篇幅缩减30%\n2. 保留核心发现和方法\n3. 句式更多样化\n4. 适合目标期刊风格（SCI三区）' },
      { id: 702, version: 'v1.0', date: '02-20', desc: '初版，基础改写', stage: 'draft', content: '改写以下摘要，使其更简洁。保留核心发现。' },
    ]},
])

const filteredPrompts = computed(() => {
  let list = prompts.value
  if (activeTag.value) list = list.filter(p => p.category === activeTag.value)
  if (search.value) list = list.filter(p => p.name.includes(search.value))
  return list
})

const selectedPrompt = computed(() => prompts.value.find(p => p.id === selectedPromptId.value))
const activeVersion = computed(() => selectedPrompt.value?.versions.find(v => v.id === activeVerId.value))
const compareVersion = computed(() => selectedPrompt.value?.versions.find(v => v.id === compareVerId.value))

const diffStats = computed(() => {
  if (!activeVersion.value || !compareVersion.value) return { added: 0, removed: 0, same: 0 }
  const a = activeVersion.value.content.split('\n')
  const b = compareVersion.value.content.split('\n')
  return { added: Math.max(0, a.length - b.length), removed: Math.max(0, b.length - a.length), same: Math.min(a.length, b.length) }
})

function selectPrompt(id) {
  if (selectedPromptId.value === id) return
  selectedPromptId.value = id
  compareVerId.value = null
  const p = prompts.value.find(x => x.id === id)
  if (p?.versions.length) activeVerId.value = p.versions[0].id
}
function addNewPrompt() { ElMessage.info('新建提示词（演示）') }
function copy(text) { navigator.clipboard.writeText(text).then(() => ElMessage.success('已复制')) }

function renderDiff(content, otherContent, side) {
  const lines = content.split('\n')
  const otherLines = otherContent.split('\n')
  return lines.map((line, i) => {
    let cls = 'same'
    if (i >= otherLines.length) cls = side === 'new' ? 'added' : 'removed'
    else if (line !== otherLines[i]) cls = 'changed'
    return `<span class="diff-${cls}">${esc(line)}</span>`
  }).join('\n')
}
function esc(s) { return s.replace(/</g, '&lt;').replace(/>/g, '&gt;') }
</script>

<style scoped>
.pm-hybrid { display:flex; flex-direction:column; height:calc(100vh - 80px); background:#fff; border-radius:8px; overflow:hidden; }

/* 元模型说明栏 */
.meta-banner { display:flex; align-items:center; gap:12px; padding:5px 16px; background:linear-gradient(135deg,#667eea,#764ba2); color:#fff; font-size:11px; flex-shrink:0; }
.meta-ref { opacity:.7; font-size:10px; }

/* 三栏主体 */
.hyb-body { display:flex; flex:1; overflow:hidden; }

/* 通用列样式 */
.hyb-col { display:flex; flex-direction:column; overflow:hidden; }
.hyb-col-header { display:flex; justify-content:space-between; align-items:center; padding:10px 12px; border-bottom:1px solid #eee; flex-shrink:0; }
.hyb-col-header h3 { margin:0; font-size:14px; }
.hyb-col-footer { font-size:11px; color:#8492a6; text-align:center; padding:8px; border-top:1px solid #f0f0f0; }

/* 栏1：图鉴 280px */
.hyb-library { width:280px; border-right:1px solid #eee; flex-shrink:0; }
.hyb-search { padding:8px 12px 0; }
.hyb-tags { display:flex; gap:4px; flex-wrap:wrap; padding:8px 12px; }
.hyb-card-list { flex:1; overflow-y:auto; padding:0 8px; }
.hyb-card { display:flex; align-items:center; gap:8px; padding:10px; border:1px solid #eee; border-radius:8px; cursor:pointer; margin-bottom:6px; transition:all .15s; }
.hyb-card:hover { border-color:#c0d0e0; box-shadow:0 1px 4px rgba(0,0,0,0.04); }
.hyb-card.active { border-color:#409EFF; background:#f0f7ff; }
.hyb-card-icon { font-size:20px; flex-shrink:0; }
.hyb-card-body { flex:1; min-width:0; }
.hyb-card-name { font-weight:600; font-size:13px; }
.hyb-card-meta { font-size:10px; color:#8492a6; display:flex; gap:6px; margin-top:2px; }
.hyb-card-ver { font-family:monospace; font-size:10px; color:#409EFF; background:#ecf5ff; padding:1px 5px; border-radius:3px; flex-shrink:0; }

/* 栏2：版本时间线 200px */
.hyb-versions { width:200px; border-right:1px solid #eee; flex-shrink:0; background:#fafbfc; }
.hyb-ver-list { flex:1; overflow-y:auto; padding:8px; }
.hyb-ver-item { padding:10px; border:1px solid #e0e0e0; border-radius:8px; margin-bottom:6px; cursor:pointer; transition:all .15s; }
.hyb-ver-item:hover { border-color:#c0d0e0; background:#fff; }
.hyb-ver-item.active { border-color:#409EFF; background:#f0f7ff; }
.hyb-ver-item.base { border-color:#F59E0B; background:#fffde8; }
.hyb-ver-item.prod { border-left:3px solid #22C55E; }
.hyb-ver-head { display:flex; align-items:center; gap:4px; }
.hyb-ver-tag { font-family:monospace; font-weight:700; font-size:12px; color:#409EFF; }
.hyb-ver-date { font-size:10px; color:#8492a6; margin-top:2px; }
.hyb-ver-desc { font-size:11px; color:#606266; margin-top:4px; line-height:1.4; }
.hyb-ver-actions { margin-top:4px; }
.hyb-ver-current { font-size:10px; color:#409EFF; background:#ecf5ff; padding:1px 6px; border-radius:3px; }
.hyb-ver-baseline { font-size:10px; color:#F59E0B; background:#fffde8; padding:1px 6px; border-radius:3px; }
.hyb-ver-hint { font-size:10px; color:#8492a6; text-align:center; padding:6px; }

/* 栏3：内容区 */
.hyb-content { flex:1; }
.hyb-empty-content { justify-content:center; }
.hyb-content-actions { display:flex; gap:6px; align-items:center; }

/* 编辑模式 */
.hyb-edit-area { flex:1; display:flex; flex-direction:column; padding:12px; overflow:hidden; }
.hyb-edit-meta { display:flex; align-items:center; gap:8px; font-size:12px; color:#8492a6; margin-bottom:8px; }
.hyb-edit-ver { font-family:monospace; font-weight:700; color:#409EFF; }
.hyb-edit-desc { color:#606266; }
.hyb-editor { flex:1; font-family:'Consolas','monospace'; font-size:13px; }
.hyb-editor :deep(textarea) { line-height:1.8; height:100% !important; }

/* Diff 模式 */
.hyb-diff-area { flex:1; display:flex; flex-direction:column; overflow:hidden; padding:12px; }
.hyb-diff-stats { display:flex; gap:16px; align-items:center; padding:6px 12px; background:#f8f9fa; border-radius:6px; font-size:12px; font-family:monospace; margin-bottom:8px; flex-shrink:0; }
.hyb-diff-panels { flex:1; display:flex; gap:8px; overflow:hidden; }
.hyb-diff-panel { flex:1; display:flex; flex-direction:column; border:1px solid #eee; border-radius:8px; overflow:hidden; }
.hyb-diff-panel-head { display:flex; align-items:center; gap:6px; padding:8px 12px; background:#fafbfc; border-bottom:1px solid #eee; font-size:12px; flex-shrink:0; }
.hyb-diff-ver-tag { font-family:monospace; font-weight:700; padding:1px 6px; border-radius:3px; font-size:11px; }
.hyb-diff-ver-tag.old { background:#fef0f0; color:#EF4444; }
.hyb-diff-ver-tag.new { background:#f0f9eb; color:#22C55E; }
.hyb-diff-role { font-size:10px; color:#8492a6; margin-left:auto; }
.hyb-diff-content { flex:1; margin:0; padding:12px; font-size:12px; line-height:1.8; white-space:pre-wrap; overflow-y:auto; font-family:'Consolas','monospace'; }

/* Diff 行高亮 */
:deep(.diff-same) { display:block; }
:deep(.diff-added) { display:block; background:#e6ffec; border-left:3px solid #22C55E; padding-left:6px; }
:deep(.diff-removed) { display:block; background:#ffeef0; border-left:3px solid #EF4444; padding-left:6px; text-decoration:line-through; opacity:.7; }
:deep(.diff-changed) { display:block; background:#fff8c5; border-left:3px solid #F59E0B; padding-left:6px; }
</style>
