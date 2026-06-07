<template>
  <div class="ett-container">
    <!-- 顶部工具栏 -->
    <div class="ett-header">
      <h2 class="ett-title">英语翻译练习 — 考研英语一</h2>
      <div class="ett-header-actions">
        <el-input v-model="apiKey" type="password" placeholder="DeepSeek API Key" size="small" style="width:240px" show-password />
        <el-radio-group v-model="scoringMode" size="small">
          <el-radio-button value="api">API评分</el-radio-button>
          <el-radio-button value="window">窗口AI</el-radio-button>
        </el-radio-group>
        <el-button size="small" @click="showPromptConfig = true" :icon="Setting">提示词</el-button>
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
        <el-button size="small" type="success" @click="openImageImport" style="margin-left:4px">图片导入</el-button>
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
                  <el-button size="small" text type="info" @click.stop="openHistoryPanel(e.id)" class="history-btn">
                    历史
                  </el-button>
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
      <main class="ett-main" :class="{ 'anno-main': annoMode }" ref="annoMainRef">
        <!-- 批注浮动工具栏 -->
        <div v-if="annoMode" class="anno-float-toolbar">
          <span v-for="c in drawColors" :key="c.color"
            class="color-dot" :class="{ active: drawColor === c.color && !isErasing }"
            :style="{ background: c.css }"
            @click="setDrawColor(c.color)" :title="c.name"></span>
          <el-divider direction="vertical" />
          <span class="toolbar-label">粗细</span>
          <el-slider v-model="drawWidth" :min="1" :max="12" size="small" style="width:70px" />
          <el-divider direction="vertical" />
          <el-button size="small" :type="isErasing ? 'warning' : 'default'" @click="toggleErase">
            {{ isErasing ? '橡皮擦中' : '橡皮擦' }}
          </el-button>
          <el-button size="small" @click="clearAnnoDrawings" :disabled="currentAnnoCount === 0">清除</el-button>
          <span class="anno-count" v-if="currentAnnoCount > 0">{{ currentAnnoCount }}笔</span>
          <el-button size="small" type="info" @click="toggleAnnoMode" style="margin-left:auto">退出批注</el-button>
        </div>
        <canvas v-if="annoMode" ref="annoCanvasRef"
          class="anno-canvas"
          @mousedown="onAnnoMouseDown"
          @mousemove="onAnnoMouseMove"
          @mouseup="onAnnoMouseUp"
          @mouseleave="onAnnoMouseUp"
        ></canvas>
        <template v-if="currentEssay">
          <!-- 原文区 -->
          <div class="section">
            <div class="section-header">
              <span class="section-label">原文</span>
              <span class="section-source">{{ currentEssay.source }}</span>
              <el-button size="small" text @click="toggleHighlight" v-if="practiceStarted && !annoMode">划词模式</el-button>
              <el-button size="small" :type="annoMode ? 'warning' : 'default'" @click="toggleAnnoMode" style="margin-left:auto">
                {{ annoMode ? '退出批注' : '批注模式' }}
              </el-button>
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
              <template v-if="scoringMode === 'api'">
                <el-button size="small" type="primary" @click="submitTranslation" :loading="scoring" :disabled="!userTranslation.trim()">
                  提交AI评分
                </el-button>
              </template>
              <template v-else>
                <el-button size="small" type="warning" @click="submitTranslation" :disabled="!userTranslation.trim()">
                  一键复制拼接prompt
                </el-button>
              </template>
            </div>
            <el-input v-model="userTranslation" type="textarea" :rows="8" resize="vertical"
              placeholder="在此输入你的中文翻译..." :disabled="!practiceStarted" />
            <!-- 窗口AI模式：粘贴结果 -->
            <div v-if="scoringMode === 'window' && practiceStarted" class="window-ai-paste">
              <div class="window-ai-label">粘贴窗口AI返回的评分JSON结果：</div>
              <el-input v-model="windowAIInput" type="textarea" :rows="5" placeholder='{"accuracy":20,"grammar":18,"vocabulary":19,"fluency":21,"total":78,"feedback":"..."}' />
              <el-button type="success" size="small" @click="submitWindowAI" :disabled="!windowAIInput.trim()" style="margin-top:6px">
                解析并录入评分
              </el-button>
            </div>
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
            <div v-if="bilibiliMatches.length" class="bilibili-links">
              <div class="bilibili-title">相关知识点视频：</div>
              <a v-for="link in bilibiliMatches" :key="link.bvid"
                :href="`https://www.bilibili.com/video/${link.bvid}`" target="_blank"
                class="bilibili-card">
                <span class="bilibili-tag">{{ link.keyword }}</span>
                <span class="bilibili-name">{{ link.title }}</span>
                <span class="bilibili-desc">{{ link.desc }}</span>
              </a>
            </div>
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

    <!-- 提示词配置对话框 (P0) -->
    <el-dialog v-model="showPromptConfig" title="评分提示词配置" width="720px" destroy-on-close>
      <el-form label-width="100px">
        <el-form-item label="评分提示词">
          <el-input v-model="promptConfig.scoringPrompt" type="textarea" :rows="14" />
          <p class="hint-text">窗口AI模式会把这段提示词+原文+译文拼接复制到剪贴板</p>
        </el-form-item>
        <el-form-item label="分段提示词">
          <el-input v-model="promptConfig.segmentPrompt" type="textarea" :rows="8" />
          <p class="hint-text">添加范文时用于AI自动分段出题的提示词</p>
        </el-form-item>
        <el-form-item label="模式说明">
          <div class="mode-desc">
            <p><b>API评分</b>：直接调用DeepSeek API，填写Key即可一键评分</p>
            <p><b>窗口AI</b>：点击按钮复制拼接好的完整prompt→粘贴到任意AI窗口→把AI回复的JSON粘贴回来</p>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPromptConfig = false">取消</el-button>
        <el-button type="primary" @click="savePromptConfig">保存</el-button>
      </template>
    </el-dialog>

    <!-- 历史记录详情面板 (P2) -->
    <el-drawer v-model="showHistoryPanel" title="练习历史" size="480px" direction="rtl">
      <template v-if="historyEssay">
        <div class="history-essay-info">
          <h3>{{ historyEssay.title }}</h3>
          <p class="history-meta">{{ historyEssay.source }} · {{ historyEssay.date }}</p>
        </div>
        <el-divider />
        <div v-if="historyRecords.length === 0" class="history-empty">
          <el-empty description="暂无练习记录" :image-size="80" />
        </div>
        <div v-for="(rec, idx) in historyRecords" :key="rec.id" class="history-record-card">
          <div class="history-record-header">
            <span class="history-record-date">{{ rec.date }}</span>
            <el-tag :type="scoreTag(rec.totalScore)" size="small">{{ rec.totalScore }}分</el-tag>
            <span class="history-time">{{ formatTime(rec.timeSpent || 0) }}</span>
          </div>
          <div class="history-dims">
            <span>准确性{{ rec.score.accuracy }}</span>
            <span>语法{{ rec.score.grammar }}</span>
            <span>词汇{{ rec.score.vocabulary }}</span>
            <span>流畅{{ rec.score.fluency }}</span>
          </div>
          <div class="history-translation">
            <div class="history-label">你的译文：</div>
            <p>{{ rec.userTranslation?.slice(0, 200) }}{{ rec.userTranslation?.length > 200 ? '...' : '' }}</p>
          </div>
          <div class="history-feedback" v-if="rec.feedback">
            <div class="history-label">点评：</div>
            <p v-html="rec.feedback.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').slice(0, 300)"></p>
          </div>
          <el-divider v-if="idx < historyRecords.length - 1" />
        </div>
      </template>
    </el-drawer>

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


    <!-- 图片导入翻译题对话框 -->
    <el-dialog v-model="showImageImportDialog" title="图片导入翻译题" width="700px" destroy-on-close @opened="onImageDialogOpened">
      <div class="image-import-layout">
        <div class="image-import-left">
          <div class="image-paste-label">截图粘贴区（Ctrl+V 粘贴截图）</div>
          <div
            class="image-paste-zone"
            :class="{ 'has-image': imagePreviewUrl }"
            @paste="onImagePaste"
            tabindex="0"
            ref="imagePasteZoneRef"
          >
            <img v-if="imagePreviewUrl" :src="imagePreviewUrl" class="pasted-image-preview" />
            <div v-else class="paste-placeholder">
              <span class="paste-icon">🖼️</span>
              <span>在此区域点击后 Ctrl+V 粘贴截图</span>
            </div>
          </div>
        </div>
        <div class="image-import-right">
          <div class="image-import-section">
            <div class="image-import-label">提示词模板（可修改）</div>
            <el-input v-model="imageImportPrompt" type="textarea" :rows="8" resize="vertical" />
            <el-button type="primary" size="small" @click="copyImagePrompt" style="margin-top:8px" :disabled="!imagePreviewUrl">
              一键复制提示词
            </el-button>
            <span class="hint-text" style="margin-left:8px">复制后粘贴到其他AI窗口，同时粘贴截图</span>
          </div>
          <el-divider />
          <div class="image-import-section">
            <div class="image-import-label">粘贴AI返回的JSON结果：</div>
            <el-input v-model="imageImportResult" type="textarea" :rows="8" placeholder="粘贴另一个AI返回的JSON..." />
            <el-button type="success" size="small" @click="importFromImageJson" style="margin-top:8px" :disabled="!imageImportResult.trim()">
              解析并导入题目
            </el-button>
          </div>
        </div>
      </div>
    </el-dialog>

</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, nextTick, h } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Setting, CopyDocument, Link, VideoPlay, ArrowLeft } from '@element-plus/icons-vue'
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

// P0: 提示词系统
const scoringMode = ref('api')
const showPromptConfig = ref(false)
const promptConfig = ref({
  scoringPrompt: '',
  segmentPrompt: ''
})
const windowAIInput = ref('')
// 图片导入
const showImageImportDialog = ref(false)
const imagePreviewUrl = ref('')
const imagePasteZoneRef = ref(null)
const imageImportPrompt = ref('')
const imageImportResult = ref('')

// 批注系统（全局，每个essay独立存储）
const annoMode = ref(false)
const isDrawing = ref(false)
const drawColor = ref('#FF0000')
const drawWidth = ref(3)
const isErasing = ref(false)
const currentAnnoStroke = ref([])
const annoCanvasRef = ref(null)
const annoMainRef = ref(null)
const originalRef = ref(null)

const drawColors = [
  { color: '#FF0000', css: '#FF0000', name: '红色' },
  { color: '#00AA00', css: '#00AA00', name: '绿色' },
  { color: '#0066FF', css: '#0066FF', name: '蓝色' },
  { color: '#FF8800', css: '#FF8800', name: '橙色' },
  { color: '#000000', css: '#000000', name: '黑色' },
]

// 每个essay的批注存储: { [essayId]: [{points, color, width}, ...] }
const ANNO_STORAGE_KEY = 'ett_annotations'
const essayAnnotations = ref({})
const currentAnnoCount = computed(() => {
  if (!currentEssayId.value) return 0
  return (essayAnnotations.value[currentEssayId.value] || []).length
})

const IMAGE_IMPORT_DEFAULT_PROMPT = `请分析这张考研英语一翻译真题的截图，提取并生成以下JSON格式的数据：

{
  "title": "文章标题",
  "source": "来源（如：考研英语一 20XX年 Text X）",
  "date": "YYYY-MM-DD",
  "originalEN": "完整的英文原文",
  "referenceTranslation": "参考中文译文",
  "segments": [
    {
      "en": "英文分句1",
      "contextZH": "简短中文背景提示",
      "keyPoints": ["考点1", "考点2"]
    }
  ]
}

要求：
1. originalEN为完整英文原文段落
2. referenceTranslation为对应的参考中文翻译
3. segments按句子拆分，keyPoints标注每句的语法考点（如定语从句、被动语态、倒装、虚拟语气等）
4. 只返回JSON，不要加任何其他文字`;


// P2: 历史面板
const showHistoryPanel = ref(false)
const historyEssayId = ref(null)

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



// ========== B站知识点视频链接库 (P2) ==========
const BILIBILI_LINKS = [
  { keyword: '定语从句', bvid: 'BV1aY411b7nW', title: '定语从句精讲', desc: '关系代词that/which/who区别与省略规则' },
  { keyword: '被动语态', bvid: 'BV1s4411C7Wx', title: '被动语态全解析', desc: '英汉被动转换策略' },
  { keyword: '倒装', bvid: 'BV1Hb411p7JJ', title: '倒装句完全掌握', desc: '部分倒装与完全倒装的识别与翻译' },
  { keyword: '虚拟语气', bvid: 'BV1Zt4y1m7uN', title: '虚拟语气三大句型', desc: 'if条件句、wish、as if的翻译处理' },
  { keyword: '分词结构', bvid: 'BV1aL4y1F7Xr', title: '分词作状语/定语', desc: '现在分词与过去分词的翻译技巧' },
  { keyword: '同位语', bvid: 'BV1tG4y1U7QM', title: '同位语从句', desc: 'that引导同位语从句vs定语从句的区分' },
  { keyword: '名词性从句', bvid: 'BV1yW4y1D7GN', title: '名词性从句体系', desc: '主语/宾语/表语/同位语从句的翻译' },
  { keyword: '状语从句', bvid: 'BV1uT4y1S7Fq', title: '状语从句翻译策略', desc: '时间/原因/让步/条件状语从句' },
  { keyword: '强调句', bvid: 'BV1NK4y1U7eJ', title: '强调句型识别', desc: 'It is...that...结构的翻译方法' },
  { keyword: '比较结构', bvid: 'BV18V411b7LH', title: '比较级与最高级', desc: 'as...as, more than, the more...等结构' },
  { keyword: '长难句拆分', bvid: 'BV1gF411i7Hj', title: '长难句拆分五步法', desc: '找主干→定语→状语→并列→嵌套的处理顺序' },
  { keyword: '代词指代', bvid: 'BV1xB4y1T7Dc', title: '代词指代还原', desc: 'it/they/this/that指代判断，英译汉代词还原技巧' },
  { keyword: '固定搭配', bvid: 'BV1KM4y1U7mX', title: '考研英语常见搭配', desc: '动词+介词、形容词+介词等高频搭配' },
  { keyword: '插入语', bvid: 'BV1iL41177KN', title: '插入语的处理', desc: '双破折号/逗号分隔的插入成分翻译' },
  { keyword: '否定结构', bvid: 'BV1fY4y1C7vT', title: '否定表达辨析', desc: '部分否定/全部否定/双重否定的翻译' },
  { keyword: '省略句', bvid: 'BV19P4y1U7Xd', title: '省略句还原技巧', desc: '并列结构省略、状语从句省略的识别' },
  { keyword: 'with结构', bvid: 'BV1hN4y1T7yF', title: 'with复合结构', desc: 'with+名词+分词/形容词/介词短语的翻译' },
  { keyword: 'as用法', bvid: 'BV1KW4y1H7Qk', title: 'as的多重用法', desc: 'as作介词/连词/关系代词的翻译区分' },
  { keyword: 'it句型', bvid: 'BV1SP411p7TG', title: 'it形式主语句型', desc: 'It is+adj+that/to do结构的翻译' },
  { keyword: '独立主格', bvid: 'BV1Dd4y1m7LB', title: '独立主格结构', desc: '名词+分词/形容词的独立结构翻译' },
]

function matchBilibiliLinks(feedback) {
  if (!feedback) return []
  const matched = []
  const seen = new Set()
  for (const item of BILIBILI_LINKS) {
    if (feedback.includes(item.keyword) && !seen.has(item.bvid)) {
      matched.push(item)
      seen.add(item.bvid)
    }
    if (matched.length >= 3) break
  }
  return matched
}

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

const bilibiliMatches = computed(() => matchBilibiliLinks(scoredRecord.value?.feedback || ''))

const historyRecords = computed(() => {
  if (!historyEssayId.value) return []
  return records.value.filter(r => r.essayId === historyEssayId.value && r.completed)
    .sort((a, b) => b.date.localeCompare(a.date))
})

const historyEssay = computed(() => essays.value.find(e => e.id === historyEssayId.value))

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
watch(promptConfig, (v) => localStorage.setItem('ett_prompt_config', JSON.stringify(v)), { deep: true })

function loadPromptConfig() {
  try {
    const raw = localStorage.getItem('ett_prompt_config')
    if (raw) promptConfig.value = JSON.parse(raw)
  } catch {}
  if (!promptConfig.value.scoringPrompt) promptConfig.value.scoringPrompt = SCORING_SYSTEM_PROMPT
  if (!promptConfig.value.segmentPrompt) promptConfig.value.segmentPrompt = SEGMENT_PROMPT
}
function savePromptConfig() {
  showPromptConfig.value = false
  ElMessage.success('提示词已保存')
}

// ========== AI评分 ==========
async function callDeepSeek(prompt, temperature = 0.3, systemPrompt = null) {
  if (!apiKey.value) { ElMessage.warning('请先填写 DeepSeek API Key'); return null }
  try {
    const sysPrompt = systemPrompt || promptConfig.value.scoringPrompt || SCORING_SYSTEM_PROMPT
    const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey.value}` },
      body: JSON.stringify({ model: 'deepseek-chat', messages: [{ role: 'system', content: sysPrompt }, { role: 'user', content: prompt }], temperature, max_tokens: 2048 }),
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

const SEGMENT_PROMPT = `请将以下英文段落处理为考研英语一翻译练习题格式。返回严格JSON：
{
  "segments": [{"en":"原文分句1", "contextZH":"简短中文背景提示", "keyPoints":["考点1","考点2"]}]
}
每段segments的en为原文按句拆分。keyPoints标注每句涉及的语法考点（如定语从句、被动语态、倒装等）。

英文原文：`

// ========== 窗口AI模式 ==========
function buildScoringPrompt() {
  const essay = currentEssay.value
  return `${promptConfig.value.scoringPrompt}

【英文原文】
${essay.originalEN}

【参考译文】
${essay.referenceTranslation}

【学生译文】
${userTranslation.value}

【考点提示】
${essay.segments.map(s => s.keyPoints.join('、')).join(' | ')}

请给出评分。`
}

async function copyPromptToClipboard() {
  if (!userTranslation.value.trim()) { ElMessage.warning('请先输入译文'); return }
  const full = buildScoringPrompt()
  try {
    await navigator.clipboard.writeText(full)
    ElMessage.success('提示词已复制到剪贴板，粘贴到窗口AI中获取评分')
  } catch {
    ElMessage.error('复制失败，请手动复制')
  }
}

function submitWindowAI() {
  if (!windowAIInput.value.trim()) { ElMessage.warning('请粘贴AI返回的JSON结果'); return }
  try {
    const jsonMatch = windowAIInput.value.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('未识别到JSON')
    const parsed = JSON.parse(jsonMatch[0])
    saveScoreResult(parsed)
    windowAIInput.value = ''
    ElMessage.success(`评分完成：${parsed.total}/100`)
  } catch (e) {
    ElMessage.error('JSON解析失败：' + e.message)
  }
}

function saveScoreResult(parsed) {
  const essay = currentEssay.value
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
  nextTick(() => { renderTrendChart(); renderRadarChart() })
}

// ========== 历史面板 ==========
function openHistoryPanel(essayId) {
  historyEssayId.value = essayId
  showHistoryPanel.value = true
}

async function submitTranslation() {
  if (!userTranslation.value.trim()) return
  if (scoringMode.value === 'window') { copyPromptToClipboard(); return }
  if (!apiKey.value) { ElMessage.warning('请先填写 DeepSeek API Key'); return }

  scoring.value = true
  const prompt = buildScoringPrompt()

  try {
    const result = await callDeepSeek(prompt, 0.3)
    if (!result) { scoring.value = false; return }

    const jsonMatch = result.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('未识别到评分JSON')

    const parsed = JSON.parse(jsonMatch[0])
    saveScoreResult(parsed)
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
    const segmentPrompt = promptConfig.value.segmentPrompt || SEGMENT_PROMPT
    const prompt = segmentPrompt + newEssay.originalEN

    const result = await callDeepSeek(prompt, 0.3, segmentPrompt)
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
  const blob = new Blob([JSON.stringify({
    essays: essays.value, records: records.value, settings, annotations: essayAnnotations.value,
    scoringPrompt: promptConfig.value.scoringPrompt,
    segmentPrompt: promptConfig.value.segmentPrompt,
    exportVersion: 3
  }, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = `english-translation-backup-${new Date().toISOString().slice(0,10)}.json`; a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('数据已导出（含评分提示词，可自包含评分）')
}

function importData(file) {
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result)
      if (data.essays) essays.value = data.essays
      if (data.records) records.value = data.records
      if (data.settings) Object.assign(settings, data.settings)
      if (data.annotations) essayAnnotations.value = data.annotations
      if (data.exportVersion >= 3) saveAnnotations()
      if (data.scoringPrompt) promptConfig.value.scoringPrompt = data.scoringPrompt
      if (data.segmentPrompt) promptConfig.value.segmentPrompt = data.segmentPrompt
      saveData()
      const ver = data.exportVersion === 2 ? '(含提示词)' : ''
      ElMessage.success(`导入成功：${data.essays?.length || 0}篇范文，${data.records?.length || 0}条记录 ${ver}`)
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


// ========== 图片导入 ==========
function openImageImport() {
  imageImportPrompt.value = IMAGE_IMPORT_DEFAULT_PROMPT
  imagePreviewUrl.value = ''
  imageImportResult.value = ''
  showImageImportDialog.value = true
}

function onImageDialogOpened() {
  nextTick(() => {
    if (imagePasteZoneRef.value) imagePasteZoneRef.value.focus()
  })
}

function onImagePaste(e) {
  const items = e.clipboardData?.items
  if (!items) return
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      e.preventDefault()
      const blob = item.getAsFile()
      const reader = new FileReader()
      reader.onload = (ev) => { imagePreviewUrl.value = ev.target.result }
      reader.readAsDataURL(blob)
      return
    }
  }
}

async function copyImagePrompt() {
  if (!imageImportPrompt.value.trim()) { ElMessage.warning('提示词为空'); return }
  try {
    await navigator.clipboard.writeText(imageImportPrompt.value)
    ElMessage.success('提示词已复制，粘贴到其他AI窗口并附上截图即可')
  } catch {
    ElMessage.error('复制失败，请手动复制')
  }
}

function importFromImageJson() {
  if (!imageImportResult.value.trim()) { ElMessage.warning('请粘贴AI返回的JSON'); return }
  try {
    const jsonMatch = imageImportResult.value.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('未识别到JSON')
    const parsed = JSON.parse(jsonMatch[0])
    if (!parsed.originalEN) throw new Error('JSON缺少originalEN字段')

    essays.value.push({
      id: generateId(),
      date: parsed.date || new Date().toISOString().slice(0, 10),
      title: parsed.title || '图片导入',
      source: parsed.source || '图片导入',
      originalEN: parsed.originalEN,
      referenceTranslation: parsed.referenceTranslation || '',
      segments: parsed.segments || [{ en: parsed.originalEN, contextZH: '', keyPoints: [] }]
    })
    ElMessage.success(`导入成功：${parsed.title || '未命名'}（${parsed.segments?.length || 1}段）`)
    showImageImportDialog.value = false
  } catch (e) {
    ElMessage.error('JSON解析失败：' + e.message)
  }
}

// ========== 批注系统 ==========
function loadAnnotations() {
  try {
    const raw = localStorage.getItem(ANNO_STORAGE_KEY)
    if (raw) essayAnnotations.value = JSON.parse(raw)
  } catch { essayAnnotations.value = {} }
}
loadAnnotations()

function saveAnnotations() {
  localStorage.setItem(ANNO_STORAGE_KEY, JSON.stringify(essayAnnotations.value))
}

function toggleAnnoMode() {
  annoMode.value = !annoMode.value
  if (annoMode.value) {
    nextTick(() => {
      initAnnoCanvas()
      const main = annoMainRef.value
      if (main) {
        main.addEventListener('scroll', onMainScroll, { passive: true })
      }
      window.addEventListener('resize', onWindowResize)
    })
  } else {
    const main = annoMainRef.value
    if (main) {
      main.removeEventListener('scroll', onMainScroll)
    }
    window.removeEventListener('resize', onWindowResize)
  }
}

function initAnnoCanvas() {
  const canvas = annoCanvasRef.value
  const main = annoMainRef.value
  if (!canvas || !main) return

  // Cover the FULL scrollable content of .ett-main
  const w = main.scrollWidth
  const h = main.scrollHeight
  canvas.width = w
  canvas.height = h
  canvas.style.width = w + 'px'
  canvas.style.height = h + 'px'
  redrawAnnoCanvas()
}

function redrawAnnoCanvas() {
  const canvas = annoCanvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const anns = getCurrentAnno()
  for (const ann of anns) {
    drawAnnoStroke(ctx, ann.points, ann.color, ann.width)
  }
  if (currentAnnoStroke.value.length > 1) {
    drawAnnoStroke(ctx, currentAnnoStroke.value, drawColor.value, drawWidth.value)
  }
}

function drawAnnoStroke(ctx, points, color, width) {
  if (points.length < 2) return
  ctx.beginPath()
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.moveTo(points[0].x, points[0].y)
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y)
  }
  ctx.stroke()
}

function getAnnoCoords(e) {
  const canvas = annoCanvasRef.value
  const main = annoMainRef.value
  if (!canvas || !main) return null
  const rect = canvas.getBoundingClientRect()
  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height
  // Account for scroll position so annotations align with scrolled content
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY + main.scrollTop * scaleY
  }
}

function getCurrentAnno() {
  if (!currentEssayId.value) return []
  return essayAnnotations.value[currentEssayId.value] || []
}

function setCurrentAnno(anns) {
  if (currentEssayId.value) {
    essayAnnotations.value[currentEssayId.value] = anns
    saveAnnotations()
  }
}

function onAnnoMouseDown(e) {
  if (!annoMode.value) return
  const pos = getAnnoCoords(e)
  if (!pos) return

  if (isErasing.value) {
    const erased = eraseAnnoAtPos(pos)
    if (erased) redrawAnnoCanvas()
  } else {
    isDrawing.value = true
    currentAnnoStroke.value = [{ x: pos.x, y: pos.y }]
  }
}

function onAnnoMouseMove(e) {
  if (!annoMode.value) return
  const pos = getAnnoCoords(e)
  if (!pos) return

  if (isDrawing.value) {
    currentAnnoStroke.value.push({ x: pos.x, y: pos.y })
    redrawAnnoCanvas()
  } else if (isErasing.value && e.buttons === 1) {
    const erased = eraseAnnoAtPos(pos)
    if (erased) redrawAnnoCanvas()
  }
}

function onAnnoMouseUp() {
  if (isDrawing.value && currentAnnoStroke.value.length > 1) {
    const anns = getCurrentAnno()
    anns.push({
      points: [...currentAnnoStroke.value],
      color: drawColor.value,
      width: drawWidth.value
    })
    setCurrentAnno(anns)
  }
  isDrawing.value = false
  currentAnnoStroke.value = []
}

function eraseAnnoAtPos(pos) {
  const size = drawWidth.value * 4 + 4
  const half = size / 2
  const rect = { left: pos.x - half, right: pos.x + half, top: pos.y - half, bottom: pos.y + half }

  const anns = getCurrentAnno()
  const newAnns = []
  let changed = false

  for (const ann of anns) {
    const segments = splitAnnoStrokeByRect(ann.points, rect)
    if (segments.length === 1 && segments[0].length === ann.points.length) {
      newAnns.push(ann)
    } else {
      changed = true
      for (const seg of segments) {
        if (seg.length > 1) {
          newAnns.push({ points: seg, color: ann.color, width: ann.width })
        }
      }
    }
  }

  if (changed) setCurrentAnno(newAnns)
  return changed
}

function splitAnnoStrokeByRect(points, rect) {
  const segments = []
  let current = []
  for (const p of points) {
    const inside = p.x >= rect.left && p.x <= rect.right && p.y >= rect.top && p.y <= rect.bottom
    if (inside) {
      if (current.length > 1) { segments.push(current); current = [] }
      else { current = [] }
    } else {
      if (current.length === 0) current.push(p)
      else current.push(p)
    }
  }
  if (current.length > 1) segments.push(current)
  return segments
}

function setDrawColor(color) {
  drawColor.value = color
  isErasing.value = false
}

function toggleErase() {
  isErasing.value = !isErasing.value
}

function clearAnnoDrawings() {
  setCurrentAnno([])
  currentAnnoStroke.value = []
  redrawAnnoCanvas()
}

// 切换essay时重新初始化canvas
watch(currentEssayId, (newId, oldId) => {
  if (annoMode.value && newId) {
    nextTick(() => { initAnnoCanvas() })
  }
})

// 监听主区域滚动，同步canvas覆盖
function onMainScroll() {
  if (!annoMode.value) return
  const main = annoMainRef.value
  const canvas = annoCanvasRef.value
  if (!main || !canvas) return
  // Resize canvas when content changes (e.g., scoredRecord appears)
  const w = main.scrollWidth
  const h = main.scrollHeight
  if (canvas.width !== w || canvas.height !== h) {
    initAnnoCanvas()
  }
}

// 窗口大小变化时重设canvas
function onWindowResize() {
  if (annoMode.value) initAnnoCanvas()
}
// ========== 生命周期 ==========
onMounted(() => {
  loadData()
  loadPromptConfig()
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
.section { margin-bottom:16px; border:1px solid #eee; border-radius:8px; padding:12px; position:relative; z-index:1; }
.section-header { display:flex; align-items:center; gap:8px; margin-bottom:8px; position:relative; z-index:60; }
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

/* Window AI mode */
.window-ai-paste { margin-top:12px; padding:10px; background:#fdf6e3; border-radius:6px; border:1px dashed #e6c560; }
.window-ai-label { font-size:12px; color:#b8860b; margin-bottom:6px; font-weight:600; }

/* B站链接 */
.bilibili-links { margin-top:12px; }
.bilibili-title { font-size:12px; color:#fb7299; font-weight:600; margin-bottom:6px; }
.bilibili-card { display:flex; flex-wrap:wrap; align-items:center; gap:6px; padding:8px; margin-bottom:6px; background:#fff7fa; border:1px solid #ffe0ea; border-radius:6px; text-decoration:none; color:#333; transition:background .15s; }
.bilibili-card:hover { background:#ffe0ea; }
.bilibili-tag { font-size:11px; background:#fb7299; color:#fff; padding:1px 6px; border-radius:3px; flex-shrink:0; }
.bilibili-name { font-size:13px; font-weight:600; color:#e8587a; }
.bilibili-desc { font-size:11px; color:#999; width:100%; }

/* History */
.history-btn { font-size:11px; padding:0 2px; margin-left:6px; }
.history-essay-info h3 { margin:0 0 4px; font-size:16px; }
.history-meta { font-size:12px; color:#8492a6; margin:0; }
.history-empty { padding:40px 0; }
.history-record-card { padding:8px 0; }
.history-record-header { display:flex; align-items:center; gap:8px; margin-bottom:6px; }
.history-record-date { font-size:13px; font-weight:600; }
.history-time { font-size:12px; color:#8492a6; margin-left:auto; }
.history-dims { display:flex; gap:12px; font-size:11px; color:#606266; margin-bottom:6px; }
.history-dims span { background:#f0f4ff; padding:2px 6px; border-radius:3px; }
.history-translation { margin-bottom:6px; }
.history-translation p { font-size:12px; color:#444; margin:2px 0 0; line-height:1.6; }
.history-label { font-size:11px; color:#8492a6; font-weight:600; }
.history-feedback p { font-size:12px; line-height:1.6; margin:2px 0 0; }

/* Hint text */
.hint-text { font-size:11px; color:#8492a6; margin-top:4px; }
.mode-desc p { margin:4px 0; font-size:12px; color:#606266; }
.mode-desc b { color:#333; }


/* Image import dialog */
/* Image import dialog */
.image-import-layout { display:flex; gap:16px; }
.image-import-left { width:340px; flex-shrink:0; }
.image-import-right { flex:1; display:flex; flex-direction:column; }
.image-paste-label { font-size:13px; font-weight:600; margin-bottom:6px; }
.image-paste-zone {
  width:100%; height:320px; border:2px dashed #d9d9d9; border-radius:8px;
  display:flex; align-items:center; justify-content:center; cursor:pointer;
  outline:none; transition:border-color .2s; overflow:hidden; background:#f5f5f5;
}
.image-paste-zone:focus { border-color:#409EFF; }
.image-paste-zone.has-image { border-style:solid; border-color:#67C23A; padding:0; background:#fff; }
.paste-placeholder { text-align:center; color:#c0c4cc; display:flex; flex-direction:column; align-items:center; gap:8px; font-size:13px; }
.paste-icon { font-size:36px; }
.pasted-image-preview { width:100%; height:100%; object-fit:contain; }
.image-import-section { display:flex; flex-direction:column; }
.image-import-label { font-size:13px; font-weight:600; margin-bottom:6px; }

/* Annotation system */
.anno-main { position:relative; }
.anno-float-toolbar {
  display:flex; align-items:center; gap:6px; padding:4px 10px;
  background:#fffaeb; border:1px solid #ffe8a0; border-bottom:2px solid #f0c040;
  border-radius:0 0 6px 6px; flex-wrap:wrap;
  position:sticky; top:0; z-index:100;
}
.toolbar-label { font-size:11px; color:#606266; white-space:nowrap; }
.color-dot {
  width:18px; height:18px; border-radius:50%; cursor:pointer;
  border:2px solid transparent; transition:border-color .15s, transform .15s; flex-shrink:0;
}
.color-dot:hover { transform:scale(1.15); }
.color-dot.active { border-color:#333; box-shadow:0 0 0 2px rgba(0,0,0,0.15); }
.anno-count { font-size:11px; color:#8492a6; white-space:nowrap; margin-left:4px; }

.anno-canvas {
  position:absolute; top:0; left:0; z-index:50; cursor:crosshair;
  pointer-events:auto; background:transparent;
}

/* responsive */
@media (max-width:1000px) { .ett-body { flex-direction:column; } .ett-left,.ett-right { width:100%; border:none; } }
</style>
