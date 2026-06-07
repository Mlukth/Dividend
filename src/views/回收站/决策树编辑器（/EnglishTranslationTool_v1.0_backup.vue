<template>
  <div class="ett-container">
    <!-- 顶部工具栏 -->
    <div class="ett-header">
      <h2 class="ett-title">英语翻译练习 — 考研英语一</h2>
      <div class="ett-header-actions">
        <el-input v-model="apiKey" type="password" placeholder="DeepSeek API Key" size="small" style="width:240px" show-password />
        <el-select v-model="currentEssayId" placeholder="选择练习篇目" filterable size="small" style="width:260px">
          <el-option v-for="e in essays" :key="e.id" :label="`${e.date} ${e.title}`" :value="e.id">
            <span>{{ e.title }}</span>
            <span style="float:right;color:#8492a6;font-size:12px">{{ e.date }}</span>
          </el-option>
        </el-select>
        <el-button type="primary" size="small" @click="startPractice" :disabled="!currentEssay">开始练习</el-button>
        <el-button size="small" @click="showAddDialog = true">+ 添加范文</el-button>
        <el-button size="small" @click="exportData">导出</el-button>
        <el-upload :show-file-list="false" :before-upload="importData" accept=".json" style="display:inline-block;margin-left:4px">
          <el-button size="small">导入</el-button>
        </el-upload>
        <el-switch v-model="darkMode" size="small" active-text="🌙" style="margin-left:12px" />
      </div>
    </div>

    <!-- 主体三栏 -->
    <div class="ett-body" :class="{ dark: darkMode }">
      <!-- 左侧栏：范文列表 + 日历 -->
      <aside class="ett-left">
        <el-tabs model-value="list" type="border-card" class="ett-left-tabs">
          <el-tab-pane label="范文库" name="list">
            <div class="essay-list">
              <div v-for="e in essays" :key="e.id"
                class="essay-item" :class="{ active: e.id === currentEssayId, done: getRecord(e.id)?.completed }"
                @click="currentEssayId = e.id">
                <div class="essay-item-title">{{ e.title }}</div>
                <div class="essay-item-meta">{{ e.source }} · {{ e.date }}</div>
                <div class="essay-item-score" v-if="getRecord(e.id)?.completed">
                  <el-tag :type="scoreTag(getRecord(e.id).totalScore)">{{ getRecord(e.id).totalScore }}分</el-tag>
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="打卡日历" name="calendar">
            <el-calendar v-model="calendarDate">
              <template #default="{ data }">
                <div class="cal-cell" @click="calendarDate = data.date"
                  :class="{ checked: hasRecord(data.date), 'cal-today': isToday(data.date) }">
                  {{ data.date.getDate() }}
                  <span v-if="hasRecord(data.date)" class="cal-dot" :style="{ background: scoreDotColor(data.date) }"></span>
                </div>
              </template>
            </el-calendar>
          </el-tab-pane>
        </el-tabs>

        <!-- 统计面板 -->
        <div class="stats-panel" v-if="records.length > 0">
          <div class="stat-row"><span>连续打卡</span><strong>{{ streakDays }}天</strong></div>
          <div class="stat-row"><span>累计练习</span><strong>{{ records.filter(r=>r.completed).length }}篇</strong></div>
          <div class="stat-row"><span>平均分</span><strong>{{ avgScore }}分</strong></div>
          <div class="stat-row"><span>总耗时</span><strong>{{ totalTime }}</strong></div>
        </div>
      </aside>

      <!-- 中间栏：翻译练习区 -->
      <main class="ett-main">
        <template v-if="currentEssay">
          <!-- 原文区 -->
          <div class="section">
            <div class="section-header">
              <span class="section-label">原文</span>
              <span class="section-source">{{ currentEssay.source }}</span>
              <el-button size="small" text @click="toggleHighlight" v-if="practiceStarted">划词模式</el-button>
            </div>
            <div class="original-text" ref="originalRef">
              <p v-for="(seg, i) in currentEssay.segments" :key="i" class="orig-seg"
                :class="{ selected: selectedSeg === i }" @click="selectedSeg = i">
                <span class="seg-num">{{ i + 1 }}</span>
                <span class="seg-en">{{ seg.en }}</span>
                <span class="seg-hint" v-if="seg.keyPoints.length">考点：{{ seg.keyPoints.join('、') }}</span>
              </p>
            </div>
          </div>

          <!-- 翻译输入区 -->
          <div class="section">
            <div class="section-header">
              <span class="section-label">你的译文</span>
              <span class="timer" v-if="practiceStarted">{{ formatTime(elapsed) }}</span>
              <el-button size="small" type="primary" @click="submitTranslation" :loading="scoring" :disabled="!userTranslation.trim()">
                提交AI评分
              </el-button>
            </div>
            <el-input v-model="userTranslation" type="textarea" :rows="8" resize="vertical"
              placeholder="在此输入你的中文翻译..." :disabled="!practiceStarted" />
          </div>

          <!-- 对照区 -->
          <div class="section" v-if="scoredRecord">
            <div class="section-header">
              <span class="section-label">译文对照</span>
            </div>
            <div class="compare-view">
              <div class="compare-col yours">
                <div class="compare-col-title">你的译文</div>
                <p v-for="(line, i) in diffResult.userLines" :key="i"
                  :class="line.type">{{ line.text }}</p>
              </div>
              <div class="compare-col ref">
                <div class="compare-col-title">参考译文</div>
                <p v-for="(line, i) in diffResult.refLines" :key="i"
                  :class="line.type">{{ line.text }}</p>
              </div>
            </div>
          </div>
        </template>
        <el-empty v-else description="选择一篇范文，点击「开始练习」" :image-size="120" />
      </main>

      <!-- 右侧栏：AI评分面板 -->
      <aside class="ett-right">
        <template v-if="scoredRecord">
          <div class="score-card">
            <div class="total-score" :style="{ color: scoreColor(scoredRecord.totalScore) }">
              {{ scoredRecord.totalScore }}<span class="score-unit">/100</span>
            </div>
            <el-divider />
            <div class="dim-scores">
              <div class="dim-item">
                <span>准确性 ({{ scoredRecord.score.accuracy }}/25)</span>
                <el-progress :percentage="scoredRecord.score.accuracy / 25 * 100" :color="dimColor(scoredRecord.score.accuracy,25)" :stroke-width="8" />
              </div>
              <div class="dim-item">
                <span>语法结构 ({{ scoredRecord.score.grammar }}/25)</span>
                <el-progress :percentage="scoredRecord.score.grammar / 25 * 100" :color="dimColor(scoredRecord.score.grammar,25)" :stroke-width="8" />
              </div>
              <div class="dim-item">
                <span>词汇表达 ({{ scoredRecord.score.vocabulary }}/25)</span>
                <el-progress :percentage="scoredRecord.score.vocabulary / 25 * 100" :color="dimColor(scoredRecord.score.vocabulary,25)" :stroke-width="8" />
              </div>
              <div class="dim-item">
                <span>流畅度 ({{ scoredRecord.score.fluency }}/25)</span>
                <el-progress :percentage="scoredRecord.score.fluency / 25 * 100" :color="dimColor(scoredRecord.score.fluency,25)" :stroke-width="8" />
              </div>
            </div>
          </div>
          <div class="feedback-card">
            <div class="feedback-title">AI 点评</div>
            <div class="feedback-content" v-html="renderedFeedback"></div>
          </div>
          <div class="history-card" v-if="records.length > 1">
            <div class="feedback-title">趋势</div>
            <div ref="trendChartRef" style="width:100%;height:160px"></div>
            <div ref="radarChartRef" style="width:100%;height:180px;margin-top:8px"></div>
          </div>
        </template>
        <el-empty v-else description="提交翻译后查看评分" :image-size="100" />
      </aside>
    </div>

    <!-- 添加范文对话框 -->
    <el-dialog v-model="showAddDialog" title="添加练习范文" width="640px" destroy-on-close>
      <el-form label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="newEssay.title" placeholder="如：环境保护" />
        </el-form-item>
        <el-form-item label="来源">
          <el-input v-model="newEssay.source" placeholder="如：考研英语一 2023 Text 4" />
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker v-model="newEssay.date" type="date" value-format="YYYY-MM-DD" placeholder="练习日期" />
        </el-form-item>
        <el-form-item label="英文原文">
          <el-input v-model="newEssay.originalEN" type="textarea" :rows="8" placeholder="粘贴英文原文..." />
        </el-form-item>
        <el-form-item label="参考译文">
          <el-input v-model="newEssay.referenceTranslation" type="textarea" :rows="6" placeholder="粘贴参考译文..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="addEssay" :loading="aiProcessing" :disabled="!newEssay.originalEN.trim()">
          AI自动分段出题
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, nextTick, h } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'

// ========== 数据状态 ==========
const STORAGE_KEY = 'ett_data'
const apiKey = ref(localStorage.getItem('ett_apikey') || '')

const essays = ref([])
const records = ref([])
const settings = reactive({
  dailyGoal: 1,
  targetScore: 80
})

const currentEssayId = ref(null)
const userTranslation = ref('')
const practiceStarted = ref(false)
const scoring = ref(false)
const elapsed = ref(0)
let timerInterval = null

const darkMode = ref(false)
const selectedSeg = ref(null)
const showAddDialog = ref(false)
const aiProcessing = ref(false)
const calendarDate = ref(new Date())

const newEssay = reactive({
  title: '', source: '', date: '', originalEN: '', referenceTranslation: ''
})

const trendChartRef = ref(null)
const radarChartRef = ref(null)

// ========== 30篇考研英语一真题范文(内置题库) ==========
const BUILTIN_ESSAYS = [];

// 从 public/essays-data.json 加载真题数据
async function loadBuiltinEssays() {
  try {
    const res = await fetch('/essays-data.json');
    if (res.ok) BUILTIN_ESSAYS.length = 0, BUILTIN_ESSAYS.push(...await res.json());
  } catch(e) { /* fallback to empty */ }
}
loadBuiltinEssays();



// ========== 计算属性 ==========
const currentEssay = computed(() => essays.value.find(e => e.id === currentEssayId.value))
const scoredRecord = computed(() => currentEssayId.value ? getRecord(currentEssayId.value) : null)

const streakDays = computed(() => {
  let streak = 0
  const today = new Date()
  for (let d = new Date(today); ; d.setDate(d.getDate() - 1)) {
    const ds = d.toISOString().slice(0, 10)
    if (hasRecord(ds)) streak++
    else break
  }
  return streak
})
const avgScore = computed(() => {
  const done = records.value.filter(r => r.completed)
  if (!done.length) return 0
  return Math.round(done.reduce((s, r) => s + r.totalScore, 0) / done.length)
})
const totalTime = computed(() => {
  const sec = records.value.reduce((s, r) => s + (r.timeSpent || 0), 0)
  const h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
})

const diffResult = computed(() => {
  if (!scoredRecord.value || !currentEssay.value) return { userLines: [], refLines: [] }
  const userSentences = splitSentences(scoredRecord.value.userTranslation)
  const refSentences = splitSentences(currentEssay.value.referenceTranslation)
  const maxLen = Math.max(userSentences.length, refSentences.length)
  const userLines = [], refLines = []
  for (let i = 0; i < maxLen; i++) {
    const u = userSentences[i] || '', r = refSentences[i] || ''
    if (u === r) {
      userLines.push({ text: u || '(空)', type: 'match' })
      refLines.push({ text: r || '(空)', type: 'match' })
    } else {
      userLines.push({ text: u || '(缺)', type: u ? 'diff' : 'missing' })
      refLines.push({ text: r || '(缺)', type: r ? 'diff' : 'missing' })
    }
  }
  return { userLines, refLines }
})

const renderedFeedback = computed(() => {
  if (!scoredRecord.value?.feedback) return ''
  return scoredRecord.value.feedback.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
})

// ========== 工具函数 ==========
function generateId() { return 'ett_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8) }
function getRecord(essayId) { return records.value.find(r => r.essayId === essayId) || null }
function hasRecord(dateStr) { return records.value.some(r => r.date === dateStr && r.completed) }
function isToday(d) { return new Date().toDateString() === d.toDateString() }

function splitSentences(text) {
  return text.split(/(?<=[。！？；\n])/).map(s => s.trim()).filter(Boolean)
}

function formatTime(sec) {
  const m = Math.floor(sec / 60), s = sec % 60
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
}

function scoreColor(s) { if (s >= 80) return '#22C55E'; if (s >= 60) return '#F59E0B'; return '#EF4444' }
function scoreTag(s) { if (s >= 80) return 'success'; if (s >= 60) return 'warning'; return 'danger' }
function dimColor(v, max) { const p = v / max; if (p >= 0.8) return '#22C55E'; if (p >= 0.6) return '#F59E0B'; return '#EF4444' }
function scoreDotColor(dateStr) {
  const r = records.value.find(r => r.date === dateStr && r.completed)
  if (!r) return '#ccc'
  return scoreColor(r.totalScore)
}

// ========== 持久化 ==========
function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ essays: essays.value, records: records.value, settings }))
}
function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const data = JSON.parse(raw)
      essays.value = data.essays || []
      records.value = data.records || []
      Object.assign(settings, data.settings || {})
    }
  } catch (e) { /* use builtin */ }
  if (essays.value.length === 0) {
    essays.value = BUILTIN_ESSAYS.map(e => ({ ...e, id: generateId() }))
    saveData()
  }
}

watch(essays, saveData, { deep: true })
watch(records, saveData, { deep: true })
watch(apiKey, (v) => localStorage.setItem('ett_apikey', v))

// ========== AI评分 ==========
async function callDeepSeek(prompt, temperature = 0.3) {
  if (!apiKey.value) { ElMessage.warning('请先填写 DeepSeek API Key'); return null }
  try {
    const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey.value}` },
      body: JSON.stringify({ model: 'deepseek-chat', messages: [{ role: 'system', content: SCORING_SYSTEM_PROMPT }, { role: 'user', content: prompt }], temperature, max_tokens: 2048 }),
    })
    const data = await res.json()
    if (!data.choices?.length) throw new Error(data.error?.message || 'API返回异常')
    return data.choices[0].message.content
  } catch (e) { ElMessage.error('AI调用失败: ' + e.message); return null }
}

const SCORING_SYSTEM_PROMPT = `你是考研英语一翻译题的专业评分老师。你需要对学生的中文译文进行四维评分，满分100分（每个维度25分）。

评分标准：
1. 准确性(0-25)：原文意思是否准确传达，无漏译、误译、增译
2. 语法结构(0-25)：长难句和特殊语法结构（定语从句、被动语态、倒装、虚拟语气等）是否被正确处理
3. 词汇表达(0-25)：用词是否准确地道，搭配是否自然，术语翻译是否恰当
4. 流畅度(0-25)：中文表达是否通顺，语序是否符合汉语习惯，连接是否自然

请严格按照以下JSON格式返回，不要加任何其他文字：
{
  "accuracy": 20,
  "grammar": 18,
  "vocabulary": 19,
  "fluency": 21,
  "total": 78,
  "feedback": "逐句点评：\\n1. 第一句将...译为...基本准确，但...可以更精炼\\n2. 第二句对定语从句的处理恰当\\n3. ..."
}`

async function submitTranslation() {
  if (!userTranslation.value.trim()) return
  if (!apiKey.value) { ElMessage.warning('请先填写 DeepSeek API Key'); return }

  scoring.value = true
  const essay = currentEssay.value
  const prompt = `请对以下考研英语一翻译练习进行评分。

【英文原文】
${essay.originalEN}

【参考译文】
${essay.referenceTranslation}

【学生译文】
${userTranslation.value}

【考点提示】
${essay.segments.map(s => s.keyPoints.join('、')).join(' | ')}

请给出评分。`

  try {
    const result = await callDeepSeek(prompt, 0.3)
    if (!result) { scoring.value = false; return }

    // 解析JSON
    const jsonMatch = result.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('未识别到评分JSON')

    const parsed = JSON.parse(jsonMatch[0])
    const record = getRecord(essay.id)
    if (record) {
      record.userTranslation = userTranslation.value
      record.score = { accuracy: parsed.accuracy, grammar: parsed.grammar, vocabulary: parsed.vocabulary, fluency: parsed.fluency }
      record.totalScore = parsed.total
      record.feedback = parsed.feedback
      record.completed = true
      record.timeSpent = elapsed.value
      record.date = essay.date
    } else {
      records.value.push({
        id: generateId(),
        essayId: essay.id,
        date: essay.date,
        userTranslation: userTranslation.value,
        score: { accuracy: parsed.accuracy, grammar: parsed.grammar, vocabulary: parsed.vocabulary, fluency: parsed.fluency },
        totalScore: parsed.total,
        feedback: parsed.feedback,
        timeSpent: elapsed.value,
        completed: true
      })
    }
    ElMessage.success(`评分完成：${parsed.total}/100`)
    nextTick(() => { renderTrendChart(); renderRadarChart() })
  } catch (e) {
    ElMessage.error('评分解析失败：' + e.message)
  }
  scoring.value = false
}

// ========== 练习流程 ==========
function startPractice() {
  if (!currentEssay.value) return
  stopTimer()
  practiceStarted.value = true
  userTranslation.value = ''
  elapsed.value = 0
  timerInterval = setInterval(() => { elapsed.value++ }, 1000)
}

function stopTimer() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null }
}

function toggleHighlight() { /* 简单划词：点击词→查词典API，暂不实现 */ }

// ========== 范文管理 ==========
async function addEssay() {
  if (!newEssay.originalEN.trim() || !apiKey.value) {
    ElMessage.warning('请填写英文原文和API Key')
    return
  }
  aiProcessing.value = true
  try {
    const prompt = `请将以下英文段落处理为考研英语一翻译练习题格式。返回严格JSON：
{
  "segments": [{"en":"原文分句1", "contextZH":"简短中文背景提示", "keyPoints":["考点1","考点2"]}]
}
每段segments的en为原文按句拆分。keyPoints标注每句涉及的语法考点（如定语从句、被动语态、倒装等）。

英文原文：${newEssay.originalEN}`

    const result = await callDeepSeek(prompt, 0.3)
    if (!result) { aiProcessing.value = false; return }
    const jsonMatch = result.match(/\{[\s\S]*\}/)
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { segments: [{ en: newEssay.originalEN, contextZH: '', keyPoints: [] }] }

    essays.value.push({
      id: generateId(),
      date: newEssay.date || new Date().toISOString().slice(0, 10),
      title: newEssay.title || '未命名',
      source: newEssay.source || '自定义',
      originalEN: newEssay.originalEN,
      referenceTranslation: newEssay.referenceTranslation || '',
      segments: parsed.segments
    })
    ElMessage.success('范文添加成功')
    showAddDialog.value = false
    Object.assign(newEssay, { title: '', source: '', date: '', originalEN: '', referenceTranslation: '' })
  } catch (e) { ElMessage.error('AI处理失败：' + e.message) }
  aiProcessing.value = false
}

// ========== 导入导出 ==========
function exportData() {
  const blob = new Blob([JSON.stringify({ essays: essays.value, records: records.value, settings }, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = `english-translation-backup-${new Date().toISOString().slice(0,10)}.json`; a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('数据已导出')
}

function importData(file) {
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result)
      if (data.essays) essays.value = data.essays
      if (data.records) records.value = data.records
      if (data.settings) Object.assign(settings, data.settings)
      saveData()
      ElMessage.success(`导入成功：${data.essays?.length || 0}篇范文，${data.records?.length || 0}条记录`)
    } catch (ex) { ElMessage.error('文件格式错误') }
  }
  reader.readAsText(file)
  return false
}

// ========== 图表 ==========
function renderTrendChart() {
  if (!trendChartRef.value || records.value.length < 2) return
  const done = records.value.filter(r => r.completed).sort((a, b) => a.date.localeCompare(b.date))
  if (done.length < 2) return
  const chart = echarts.init(trendChartRef.value)
  chart.setOption({
    grid: { top: 8, right: 8, bottom: 24, left: 32 },
    xAxis: { type: 'category', data: done.map(r => r.date.slice(5)), axisLabel: { fontSize: 10 } },
    yAxis: { type: 'value', min: 0, max: 100, axisLabel: { fontSize: 10 } },
    series: [{ data: done.map(r => r.totalScore), type: 'line', smooth: true, areaStyle: { opacity: 0.15 }, lineStyle: { color: '#409EFF' }, itemStyle: { color: '#409EFF' }, symbolSize: 4 }],
  })
  chart.resize()
}

function renderRadarChart() {
  if (!radarChartRef.value || !scoredRecord.value) return
  const s = scoredRecord.value.score
  const chart = echarts.init(radarChartRef.value)
  chart.setOption({
    radar: { center: ['50%', '50%'], radius: '70%', indicator: [{ name: '准确性', max: 25 }, { name: '语法结构', max: 25 }, { name: '词汇表达', max: 25 }, { name: '流畅度', max: 25 }], axisName: { fontSize: 9 } },
    series: [{ type: 'radar', data: [{ value: [s.accuracy, s.grammar, s.vocabulary, s.fluency], name: '本次', areaStyle: { color: 'rgba(64,158,255,0.2)' }, lineStyle: { color: '#409EFF' } }], symbolSize: 3 }],
  })
  chart.resize()
}

// ========== 生命周期 ==========
onMounted(() => {
  loadData()
  if (essays.value.length > 0 && !currentEssayId.value) currentEssayId.value = essays.value[0].id
})
</script>

<style scoped>
.ett-container { display:flex; flex-direction:column; height:calc(100vh - 80px); padding:12px; gap:8px; box-sizing:border-box; }
.ett-header { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.ett-title { margin:0; font-size:18px; white-space:nowrap; }
.ett-header-actions { display:flex; align-items:center; gap:6px; margin-left:auto; }
.ett-body { display:flex; flex:1; gap:8px; overflow:hidden; background:#fff; border-radius:8px; }
.ett-body.dark { background:#1a1a2e; color:#e0e0e0; }

/* 左侧 */
.ett-left { width:260px; flex-shrink:0; display:flex; flex-direction:column; overflow:hidden; border-right:1px solid #eee; }
.ett-left-tabs { flex:1; overflow:hidden; }
.ett-left-tabs :deep(.el-tabs__content) { overflow-y:auto; height:calc(100% - 40px); }
.essay-list { padding:8px; }
.essay-item { padding:8px; border-radius:6px; cursor:pointer; margin-bottom:4px; transition:background .15s; border:1px solid transparent; }
.essay-item:hover { background:#f0f4ff; }
.essay-item.active { background:#e8f0fe; border-color:#409EFF; }
.essay-item.done { opacity:.85; }
.essay-item-title { font-weight:600; font-size:13px; }
.essay-item-meta { font-size:11px; color:#8492a6; margin-top:2px; }
.essay-item-score { margin-top:4px; }
.cal-cell { position:relative; cursor:pointer; padding:4px; text-align:center; }
.cal-cell.checked { font-weight:700; }
.cal-dot { display:inline-block; width:6px; height:6px; border-radius:50%; margin-left:2px; vertical-align:middle; }
.stats-panel { padding:12px; border-top:1px solid #eee; display:grid; grid-template-columns:1fr 1fr; gap:8px; }
.stat-row { text-align:center; }
.stat-row span { font-size:11px; color:#8492a6; display:block; }
.stat-row strong { font-size:16px; }

/* 中间 */
.ett-main { flex:1; overflow-y:auto; padding:12px; }
.section { margin-bottom:16px; border:1px solid #eee; border-radius:8px; padding:12px; }
.section-header { display:flex; align-items:center; gap:8px; margin-bottom:8px; }
.section-label { font-weight:700; font-size:14px; }
.section-source { font-size:12px; color:#8492a6; }
.timer { font-family:monospace; font-size:14px; color:#409EFF; margin-left:auto; }
.original-text { max-height:260px; overflow-y:auto; }
.orig-seg { display:flex; align-items:flex-start; gap:6px; padding:6px 4px; cursor:pointer; border-radius:4px; transition:background .15s; }
.orig-seg:hover { background:#f8f9fa; }
.orig-seg.selected { background:#e8f0fe; }
.seg-num { flex-shrink:0; width:20px; height:20px; border-radius:50%; background:#409EFF; color:#fff; font-size:11px; text-align:center; line-height:20px; }
.seg-en { flex:1; font-size:14px; line-height:1.6; }
.seg-hint { font-size:11px; color:#F59E0B; flex-shrink:0; }

/* 对照视图 */
.compare-view { display:flex; gap:8px; }
.compare-col { flex:1; border:1px solid #eee; border-radius:6px; padding:8px; }
.compare-col-title { font-size:12px; color:#8492a6; margin-bottom:6px; font-weight:600; }
.compare-col p { margin:4px 0; padding:4px; border-radius:3px; font-size:13px; line-height:1.6; }
.compare-col p.match { background:#f0fff0; }
.compare-col p.diff { background:#fff3cd; }
.compare-col p.missing { background:#ffe0e0; color:#aaa; font-style:italic; }

/* 右侧评分 */
.ett-right { width:320px; flex-shrink:0; overflow-y:auto; padding:12px; border-left:1px solid #eee; }
.score-card { text-align:center; }
.total-score { font-size:48px; font-weight:800; }
.score-unit { font-size:18px; color:#8492a6; }
.dim-scores { margin-top:8px; }
.dim-item { margin-bottom:10px; }
.dim-item span { font-size:12px; color:#606266; display:block; margin-bottom:4px; }
.feedback-card { margin-top:16px; border:1px solid #eee; border-radius:8px; padding:12px; }
.feedback-title { font-weight:700; font-size:14px; margin-bottom:8px; }
.feedback-content { font-size:13px; line-height:1.8; }
.history-card { margin-top:12px; }

/* Dark mode */
.dark .essay-item:hover { background:#2a2a3e; }
.dark .essay-item.active { background:#1e3a5f; }
.dark .section,.dark .feedback-card,.dark .score-card { border-color:#333; }
.dark .stat-row span { color:#aaa; }
.dark .compare-col p.match { background:#1a3a1a; }
.dark .compare-col p.diff { background:#3a3510; }
.dark .orig-seg:hover { background:#2a2a3e; }

/* responsive */
@media (max-width:1000px) { .ett-body { flex-direction:column; } .ett-left,.ett-right { width:100%; border:none; } }
</style>
