<template>
  <div class="pm-cards">
    <!-- 顶栏：搜索 + 标签 -->
    <header class="cards-header">
      <h3>提示词库</h3>
      <el-input v-model="search" placeholder="搜索提示词..." size="small" style="width:320px" clearable />
      <el-button size="small" :icon="Plus" type="primary">新建</el-button>
    </header>

    <div class="cards-tags">
      <el-tag v-for="t in allTags" :key="t" :type="activeTag===t ? '' : 'info'"
        :effect="activeTag===t ? 'dark' : 'plain'" size="small"
        @click="activeTag = activeTag===t ? '' : t" style="cursor:pointer">
        {{ t }}
      </el-tag>
    </div>

    <!-- 卡片网格 -->
    <div class="cards-grid">
      <div v-for="card in filteredCards" :key="card.id" class="prompt-card"
        :class="{ selected: selectedId === card.id }" @click="selectedId = card.id">
        <div class="card-header">
          <span class="card-name">{{ card.name }}</span>
          <el-tag size="small" type="primary" effect="plain">{{ card.version }}</el-tag>
        </div>
        <p class="card-preview">{{ card.content.slice(0, 120) }}...</p>
        <div class="card-footer">
          <span class="card-uses">{{ card.uses }}次调用</span>
          <span class="card-date">{{ card.updated }}</span>
          <el-button size="small" text :icon="CopyDocument" @click.stop="copy(card.content)">复制</el-button>
        </div>
      </div>
    </div>

    <!-- 点击卡片展开详情抽屉 -->
    <el-drawer v-model="showDetail" :title="selectedCard?.name" size="520px" direction="rtl">
      <template v-if="selectedCard">
        <div class="detail-head">
          <el-input v-model="selectedCard.name" size="small" style="width:300px" placeholder="名称" />
          <el-select v-model="selectedCard.version" size="small">
            <el-option v-for="v in ['v1.0','v1.1','v2.0','v3.0']" :key="v" :label="v" :value="v" />
          </el-select>
          <el-button size="small" :icon="CopyDocument" @click="copy(selectedCard.content)">复制</el-button>
        </div>
        <el-input v-model="selectedCard.content" type="textarea" :rows="14" resize="vertical" class="detail-area" />
        <div class="detail-tags">
          <span class="detail-label">标签：</span>
          <el-tag v-for="t in selectedCard.tags" :key="t" size="small" closable @close="removeTag(t)">{{ t }}</el-tag>
          <el-button size="small" text :icon="Plus" @click="addTag">添加</el-button>
        </div>
        <div class="detail-versions">
          <div class="detail-label">历史版本</div>
          <div v-for="v in selectedCard.history" :key="v.ver" class="dv-item">
            <span class="dv-ver">{{ v.ver }}</span>
            <span>{{ v.desc }}</span>
            <span class="dv-date">{{ v.date }}</span>
          </div>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Plus, CopyDocument } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const search = ref('')
const activeTag = ref('')
const selectedId = ref(null)
const showDetail = ref(false)

const allTags = ['翻译', '代码', '写作', '任务', '评分', '结构化输出', '教育']

const cards = ref([
  { id: 1, name: '考研英语翻译评分', version: 'v3.0', content: '你是考研英语一翻译题的专业评分老师。你需要对学生的中文译文进行四维评分，满分100分（每个维度25分）。评分标准：1. 准确性(0-25)...', uses: 387, updated: '05-10', tags: ['翻译', '评分', '教育'], history: [{ver:'v3.0', desc:'增加流畅度维度', date:'05-10'},{ver:'v2.0', desc:'重构评分标准', date:'04-15'},{ver:'v1.0', desc:'初版', date:'03-20'}] },
  { id: 2, name: 'Vue3 组件生成器', version: 'v2.1', content: '你是一个Vue 3专家，请根据以下需求生成完整的SFC组件，使用Composition API和Element Plus。要求：1. 类型安全...', uses: 203, updated: '05-08', tags: ['代码', '结构化输出'], history: [{ver:'v2.1', desc:'增加TypeScript支持', date:'05-08'},{ver:'v1.0', desc:'初版', date:'03-25'}] },
  { id: 3, name: '周报生成助手', version: 'v1.2', content: '根据以下工作要点生成一份专业的周报。要求：按项目分组、突出关键进展、标注风险和阻塞项、控制在500字以内...', uses: 56, updated: '04-30', tags: ['写作'], history: [{ver:'v1.2', desc:'增加风险标注', date:'04-30'},{ver:'v1.0', desc:'初版', date:'04-10'}] },
  { id: 4, name: 'TaskCenter 任务解析', version: 'v1.0', content: '解析用户输入的自然语言，提取任务信息并生成结构化JSON。字段：标题、优先级、预估时间、截止日期、标签列表...', uses: 129, updated: '04-22', tags: ['任务', '结构化输出'], history: [{ver:'v1.0', desc:'初版', date:'04-22'}] },
  { id: 5, name: '邮件润色助手', version: 'v1.0', content: '请润色以下邮件内容，使其更加专业、简洁、有礼貌。注意：保持原意不变、去除冗余表达、调整语气...', uses: 41, updated: '04-18', tags: ['写作'], history: [{ver:'v1.0', desc:'初版', date:'04-18'}] },
  { id: 6, name: 'Python脚本编写器', version: 'v1.0', content: '请编写一个Python脚本，要求：类型提示、异常处理、argparse命令行参数、主函数守卫...', uses: 94, updated: '04-05', tags: ['代码'], history: [{ver:'v1.0', desc:'初版', date:'04-05'}] },
  { id: 7, name: '通用翻译质量评估', version: 'v1.0', content: '请评估以下翻译的质量，从准确性、流畅度、文化适配三个维度进行评分和点评...', uses: 18, updated: '03-28', tags: ['翻译', '评分'], history: [{ver:'v1.0', desc:'初版', date:'03-28'}] },
  { id: 8, name: '论文摘要改写', version: 'v2.0', content: '改写以下学术摘要，使其更加简洁明了，适合期刊投稿。要求：保留核心发现、缩短30%篇幅...', uses: 33, updated: '03-15', tags: ['写作', '教育'], history: [{ver:'v2.0', desc:'增加篇幅控制', date:'03-15'},{ver:'v1.0', desc:'初版', date:'02-20'}] },
])

const filteredCards = computed(() => {
  let list = cards.value
  if (activeTag.value) list = list.filter(c => c.tags.includes(activeTag.value))
  if (search.value) list = list.filter(c => c.name.includes(search.value) || c.content.includes(search.value))
  return list
})

const selectedCard = computed(() => cards.value.find(c => c.id === selectedId.value))
watch(selectedId, (v) => { if (v) showDetail.value = true })
import { watch } from 'vue'

function copy(text) { navigator.clipboard.writeText(text).then(() => ElMessage.success('已复制到剪贴板')) }
function removeTag(t) { if (selectedCard.value) selectedCard.value.tags = selectedCard.value.tags.filter(x => x !== t) }
function addTag() { ElMessage.info('添加标签（演示）') }
</script>

<style scoped>
.pm-cards { display:flex; flex-direction:column; height:calc(100vh - 80px); padding:16px; gap:12px; }
.cards-header { display:flex; align-items:center; gap:12px; }
.cards-header h3 { margin:0; font-size:16px; }
.cards-tags { display:flex; gap:6px; flex-wrap:wrap; }

.cards-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(320px, 1fr)); gap:12px; flex:1; overflow-y:auto; align-content:start; }
.prompt-card { padding:14px; border:1px solid #eee; border-radius:8px; cursor:pointer; transition:all .15s; }
.prompt-card:hover { box-shadow:0 2px 12px rgba(0,0,0,0.06); border-color:#d0d7de; }
.prompt-card.selected { border-color:#409EFF; background:#f0f7ff; }
.card-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; }
.card-name { font-weight:700; font-size:14px; }
.card-preview { font-size:12px; color:#606266; line-height:1.6; margin:6px 0; }
.card-footer { display:flex; align-items:center; gap:8px; font-size:11px; color:#8492a6; }
.card-uses { flex:1; }

.detail-head { display:flex; gap:8px; align-items:center; margin-bottom:12px; flex-wrap:wrap; }
.detail-area { font-family:'Consolas','monospace'; font-size:13px; margin-bottom:16px; }
.detail-tags { display:flex; align-items:center; gap:6px; margin-bottom:16px; }
.detail-label { font-size:13px; font-weight:600; color:#606266; }
.detail-versions { border-top:1px solid #eee; padding-top:12px; }
.dv-item { display:flex; align-items:center; gap:12px; padding:6px 0; font-size:12px; }
.dv-ver { font-family:monospace; background:#e6f0ff; color:#409EFF; padding:1px 6px; border-radius:3px; }
.dv-date { color:#8492a6; margin-left:auto; }
</style>
