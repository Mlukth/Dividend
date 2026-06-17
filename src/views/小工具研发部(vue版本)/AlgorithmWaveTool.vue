<template>
  <div class="awt-container" :class="{ dark: darkMode }">
    <!-- 顶部栏 -->
    <div class="awt-header">
      <h2 class="awt-title">🌊 算法水波渐进分析</h2>
      <div class="awt-header-actions">
        <el-switch v-model="darkMode" size="small" active-text="🌙" inactive-text="☀️" />
      </div>
    </div>

    <!-- 主体：左右两栏 -->
    <div class="awt-body" :class="{ dark: darkMode }">
      <!-- 左栏：输入 + 水波分析 -->
      <div class="awt-left">
        <!-- 代码输入区 -->
        <div class="section">
          <div class="section-header">
            <span class="section-label">📋 代码输入</span>
            <el-radio-group v-model="inputMode" size="small">
              <el-radio-button value="text">粘贴代码</el-radio-button>
              <el-radio-button value="image">截图</el-radio-button>
            </el-radio-group>
          </div>
          <!-- 文本输入 -->
          <el-input v-if="inputMode==='text'" v-model="codeInput" type="textarea" :rows="10" resize="vertical"
            placeholder="在此粘贴算法代码片段（Python 或 C）..." />
          <!-- 截图输入 -->
          <div v-else class="image-paste-zone" @paste="onScreenshotPaste" tabindex="0">
            <img v-if="screenshotUrl" :src="screenshotUrl" class="screenshot-preview" />
            <div v-else class="paste-placeholder">在此区域 Ctrl+V 粘贴算法截图</div>
            <el-button v-if="screenshotUrl" size="small" type="danger" text @click="clearScreenshot" style="margin-top:4px">清除截图</el-button>
          </div>
          <div style="margin-top:10px;display:flex;gap:8px">
            <el-select v-model="codeLang" size="small" style="width:100px" placeholder="语言">
              <el-option label="Python" value="python" />
              <el-option label="C" value="c" />
              <el-option label="自动检测" value="auto" />
            </el-select>
            <!-- 窗口AI：复制水波分析提示词 -->
            <el-button type="primary" size="small" @click="copyWavePrompt" :disabled="!hasInput">
              🌊 复制水波分析提示词
            </el-button>
            <el-button size="small" @click="resetAll" :disabled="!hasInput && !waveResult">重置</el-button>
          </div>
          <!-- 贴回AI结果 -->
          <div class="paste-back" v-if="showWavePaste">
            <div class="paste-label">粘贴AI返回的水波分析JSON结果：</div>
            <el-input v-model="waveAIResponse" type="textarea" :rows="8" placeholder='AI返回的JSON...' />
            <el-button type="success" size="small" @click="parseWaveResponse" :disabled="!waveAIResponse.trim()" style="margin-top:6px">
              解析水波分析
            </el-button>
          </div>
        </div>

        <!-- 水波分析结果区 -->
        <div class="section" v-if="waveResult">
          <div class="section-header">
            <span class="section-label">🌊 水波分析</span>
            <span class="hint-text" v-if="waveResult.algorithmName">— {{ waveResult.algorithmName }}</span>
          </div>

          <!-- Layer 0: 核心操作 -->
          <div class="wave-layer" :class="{ expanded: expandedLayer >= 0 }" @click="expandedLayer = expandedLayer===0 ? -1 : 0">
            <div class="wave-layer-title">🔵 Layer 0 — 算法本质（一句话）</div>
            <div class="wave-layer-content" v-show="expandedLayer >= 0">{{ waveResult.opCore }}</div>
          </div>

          <!-- Layer 1: 关键步骤帧 -->
          <div class="wave-layer" :class="{ expanded: expandedLayer >= 1 }" @click="expandedLayer = expandedLayer===1 ? -1 : 1">
            <div class="wave-layer-title">🟢 Layer 1 — 关键步骤切分</div>
            <div class="wave-layer-content" v-show="expandedLayer >= 1">
              <div v-for="(step, i) in waveResult.stepFrames" :key="i" class="step-frame-item"
                :class="{ active: currentFrameIdx === i }" @click.stop="currentFrameIdx = i">
                <span class="step-num">{{ i + 1 }}</span>
                <div class="step-detail">
                  <div class="step-label">{{ step.label }}</div>
                  <div class="step-states" v-if="currentFrameIdx === i">
                    <div class="step-state"><b>入：</b>{{ step.inputState }}</div>
                    <div class="step-state"><b>做：</b>{{ step.operation }}</div>
                    <div class="step-state"><b>出：</b>{{ step.outputState }}</div>
                  </div>
                </div>
              </div>
              <!-- Canvas 关键帧 -->
              <div v-if="canvasFrames.length" class="canvas-frame-section" @click.stop>
                <div class="canvas-frame-header">
                  <span>📐 关键帧 {{ currentCanvasFrame + 1 }}/{{ canvasFrames.length }}：{{ canvasFrames[currentCanvasFrame]?.label }}</span>
                  <div style="display:flex;gap:4px">
                    <el-button size="small" @click="currentCanvasFrame=Math.max(0,currentCanvasFrame-1)" :disabled="currentCanvasFrame<=0">◀</el-button>
                    <el-button size="small" @click="currentCanvasFrame=Math.min(canvasFrames.length-1,currentCanvasFrame+1)" :disabled="currentCanvasFrame>=canvasFrames.length-1">▶</el-button>
                    <el-button size="small" type="info" @click="playCanvasFrames" :disabled="canvasPlaying">{{ canvasPlaying ? '播放中' : '▶▶ 自动播放' }}</el-button>
                  </div>
                </div>
                <canvas ref="frameCanvasRef" class="frame-canvas" width="600" height="220"></canvas>
                <div class="canvas-frame-desc" v-if="canvasFrames[currentCanvasFrame]?.description">
                  {{ canvasFrames[currentCanvasFrame].description }}
                </div>
              </div>
              <!-- 生成关键帧按钮 -->
              <div style="margin-top:8px;display:flex;gap:8px" v-if="!canvasFrames.length && waveResult.stepFrames?.length" @click.stop>
                <el-button size="small" type="warning" @click="copyCanvasPrompt">🎬 复制关键帧提示词</el-button>
                <div class="paste-back" v-if="showCanvasPaste" style="flex:1;margin:0">
                  <el-input v-model="canvasAIResponse" type="textarea" :rows="4" size="small" placeholder="粘贴AI返回的Canvas帧JSON..." />
                  <el-button type="success" size="small" @click="parseCanvasResponse" :disabled="!canvasAIResponse.trim()" style="margin-top:4px">解析</el-button>
                </div>
              </div>
            </div>
          </div>

          <!-- Layer 2: 卡点诊断 -->
          <div class="wave-layer" :class="{ expanded: expandedLayer >= 2 }" @click="expandedLayer = expandedLayer===2 ? -1 : 2">
            <div class="wave-layer-title">🟡 Layer 2 — 🚧 卡点诊断（白话）</div>
            <div class="wave-layer-content stuck" v-show="expandedLayer >= 2">{{ waveResult.stuckWhy }}</div>
          </div>

          <!-- Layer 3: 突破策略 -->
          <div class="wave-layer" :class="{ expanded: expandedLayer >= 3 }" @click="expandedLayer = expandedLayer===3 ? -1 : 3">
            <div class="wave-layer-title">🟠 Layer 3 — 💡 突破策略</div>
            <div class="wave-layer-content resolve" v-show="expandedLayer >= 3">{{ waveResult.bypassHow }}</div>
          </div>

          <!-- Layer 4: 生活类比 -->
          <div class="wave-layer" :class="{ expanded: expandedLayer >= 4 }" @click="expandedLayer = expandedLayer===4 ? -1 : 4">
            <div class="wave-layer-title">🔴 Layer 4 — 🌊 生活类比</div>
            <div class="wave-layer-content analogy" v-show="expandedLayer >= 4">{{ waveResult.lifeAnalogy }}</div>
          </div>

          <div style="margin-top:10px;display:flex;gap:8px">
            <el-button size="small" @click="expandedLayer = expandedLayer===4 ? -1 : 4">
              {{ expandedLayer >= 4 ? '收起全部' : '展开全部五层' }}
            </el-button>
          </div>
        </div>

        <!-- 提取的原始代码 -->
        <div class="section" v-if="extractedCode">
          <div class="section-header"><span class="section-label">📝 识别的代码</span></div>
          <pre class="code-block">{{ extractedCode }}</pre>
        </div>
      </div>

      <!-- 右栏：伪代码 + 回声验证 -->
      <div class="awt-right">
        <!-- 伪代码输入 -->
        <div class="section" v-if="waveResult">
          <div class="section-header">
            <span class="section-label">✍️ 你的理解（伪代码）</span>
            <span class="hint-text">用你理解的方式写出算法逻辑</span>
          </div>
          <el-input v-model="userPseudoCode" type="textarea" :rows="12" resize="vertical"
            placeholder="写下你理解的算法步骤，伪代码即可，不需要完美语法...
例如：
1. 选一个基准数 pivot
2. 比 pivot 小的放左边，大的放右边
3. 对左边和右边重复1-2
4. 直到每组只剩0或1个" />
          <div style="margin-top:8px;display:flex;gap:8px">
            <el-button type="primary" size="small" @click="copyVerifyPrompt" :disabled="!userPseudoCode.trim()">
              📡 复制验证提示词
            </el-button>
          </div>
          <div class="paste-back" v-if="showVerifyPaste" style="margin-top:8px">
            <div class="paste-label">粘贴AI返回的验证JSON结果：</div>
            <el-input v-model="verifyAIResponse" type="textarea" :rows="6" placeholder='{"isCorrect":true,"summary":"...","details":[...]}' />
            <el-button type="success" size="small" @click="parseVerifyResponse" :disabled="!verifyAIResponse.trim()" style="margin-top:6px">
              解析验证结果
            </el-button>
          </div>
        </div>

        <!-- 验证结果 -->
        <div class="section" v-if="verifyResult">
          <div class="section-header"><span class="section-label">📡 验证结果</span></div>
          <div class="verify-card" :class="{ correct: verifyResult.isCorrect, incorrect: !verifyResult.isCorrect }">
            <div class="verify-status">{{ verifyResult.isCorrect ? '✅ 思路基本正确' : '⚠️ 需要修正' }}</div>
            <div class="verify-summary">{{ verifyResult.summary }}</div>
          </div>
          <div class="verify-detail" v-if="verifyResult.details?.length">
            <div v-for="(d, i) in verifyResult.details" :key="i" class="verify-detail-item" :class="d.type">
              <span class="vd-tag">{{ d.type === 'correct' ? '✓ 正确' : d.type === 'missing' ? '✗ 遗漏' : '△ 偏差' }}</span>
              <span class="vd-text">{{ d.text }}</span>
            </div>
          </div>

          <!-- 深入引导按钮（验证有偏差/遗漏时显示） -->
          <div v-if="hasIssues" style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">
            <el-button type="warning" size="small" @click="copyDeepPrompt">
              🔍 针对问题深入引导
            </el-button>
          </div>
          <div class="paste-back" v-if="showDeepPaste" style="margin-top:8px">
            <div class="paste-label">粘贴AI返回的深入引导：</div>
            <el-input v-model="deepAIResponse" type="textarea" :rows="8" placeholder='AI针对具体问题的深入讲解...' />
            <el-button type="success" size="small" @click="parseDeepResponse" :disabled="!deepAIResponse.trim()" style="margin-top:6px">
              查看深入讲解
            </el-button>
          </div>
        </div>

        <!-- 深入引导结果 -->
        <div class="section" v-if="deepGuidance">
          <div class="section-header"><span class="section-label">🔍 深入引导</span></div>
          <div class="deep-guidance-content">{{ deepGuidance }}</div>
          <div style="margin-top:10px;font-size:12px;color:#f59e0b">👆 阅读上方讲解后，修改左侧伪代码，然后点下方按钮重新验证</div>
          <el-button type="primary" size="small" @click="copyReverifyPrompt" :disabled="!userPseudoCode.trim()" style="margin-top:6px">
            📡 重新验证（第{{ verifyRound }}轮）
          </el-button>
          <div class="paste-back" v-if="showReverifyPaste" style="margin-top:8px">
            <div class="paste-label">粘贴AI返回的重新验证JSON：</div>
            <el-input v-model="reverifyAIResponse" type="textarea" :rows="6" />
            <el-button type="success" size="small" @click="parseReverifyResponse" :disabled="!reverifyAIResponse.trim()" style="margin-top:6px">
              解析结果
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'

// ========== 基础状态 ==========
const darkMode = ref(true)
const inputMode = ref('text')
const codeInput = ref('')
const codeLang = ref('auto')
const screenshotUrl = ref('')
const screenshotBase64 = ref('')

// ========== 窗口AI 回复粘贴 ==========
const showWavePaste = ref(false)
const waveAIResponse = ref('')
const showCanvasPaste = ref(false)
const canvasAIResponse = ref('')
const showVerifyPaste = ref(false)
const verifyAIResponse = ref('')
const showDeepPaste = ref(false)
const deepAIResponse = ref('')
const deepGuidance = ref('')
const showReverifyPaste = ref(false)
const reverifyAIResponse = ref('')
const verifyRound = ref(1)

// ========== 分析结果 ==========
const extractedCode = ref('')
const waveResult = ref(null)
const expandedLayer = ref(-1)
const verifyResult = ref(null)
const hasIssues = computed(() => {
  if (!verifyResult.value?.details?.length) return false
  return verifyResult.value.details.some(d => d.type === 'missing' || d.type === 'deviated')
})

// ========== Canvas 关键帧 ==========
const canvasFrames = ref([])
const currentCanvasFrame = ref(0)
const canvasPlaying = ref(false)
let canvasPlayTimer = null
const frameCanvasRef = ref(null)

// ========== 伪代码 ==========
const userPseudoCode = ref('')

// ========== 计算属性 ==========
const hasInput = computed(() => {
  if (inputMode.value === 'text') return codeInput.value.trim().length > 0
  return !!screenshotBase64.value
})

const currentFrameIdx = ref(-1)

// ========== localStorage 持久化 ==========
const STORAGE_KEY = 'awt_state'
let _saveTimer = null

function saveState() {
  clearTimeout(_saveTimer)
  _saveTimer = setTimeout(() => {
    const state = {
      codeInput: codeInput.value,
      codeLang: codeLang.value,
      inputMode: inputMode.value,
      waveResult: waveResult.value,
      extractedCode: extractedCode.value,
      canvasFrames: canvasFrames.value,
      userPseudoCode: userPseudoCode.value,
      verifyResult: verifyResult.value,
      expandedLayer: expandedLayer.value,
      deepGuidance: deepGuidance.value,
      verifyRound: verifyRound.value,
    }
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch {}
  }, 500)
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const s = JSON.parse(raw)
    if (s.codeInput) codeInput.value = s.codeInput
    if (s.codeLang) codeLang.value = s.codeLang
    if (s.inputMode) inputMode.value = s.inputMode
    if (s.waveResult) waveResult.value = s.waveResult
    if (s.extractedCode) extractedCode.value = s.extractedCode
    if (s.canvasFrames?.length) {
      canvasFrames.value = s.canvasFrames
      currentCanvasFrame.value = 0
    }
    if (s.userPseudoCode) userPseudoCode.value = s.userPseudoCode
    if (s.verifyResult) verifyResult.value = s.verifyResult
    if (s.expandedLayer !== undefined) expandedLayer.value = s.expandedLayer
    if (s.deepGuidance) deepGuidance.value = s.deepGuidance
    if (s.verifyRound) verifyRound.value = s.verifyRound
    if (s.canvasFrames?.length) nextTick(() => renderCurrentCanvasFrame())
  } catch {}
}

// 监听关键状态变化自动保存
watch([codeInput, codeLang, inputMode, waveResult, extractedCode, canvasFrames, userPseudoCode, verifyResult, expandedLayer, deepGuidance, verifyRound],
  () => saveState(), { deep: true })

// 挂载时恢复
loadState()

// ========== JSON解析 ==========
function extractJSON(text) {
  try { return JSON.parse(text) } catch {}
  let cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
  const first = cleaned.indexOf('{')
  if (first === -1) return null
  let depth = 0
  for (let i = first; i < cleaned.length; i++) {
    if (cleaned[i] === '{') depth++
    else if (cleaned[i] === '}') { depth--; if (depth === 0) { cleaned = cleaned.slice(first, i + 1); break } }
  }
  try { return JSON.parse(cleaned) } catch {}
  return null
}

// ========== 截图粘贴 ==========
const screenshotBlob = ref(null)  // 保留原始blob用于剪贴板

function onScreenshotPaste(event) {
  const items = event.clipboardData?.items
  if (!items) return
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      const blob = item.getAsFile()
      screenshotBlob.value = blob  // 保存原始blob
      const reader = new FileReader()
      reader.onload = () => {
        screenshotUrl.value = reader.result
        screenshotBase64.value = reader.result.split(',')[1]
      }
      reader.readAsDataURL(blob)
    }
  }
}

// 将base64转为Blob（用于已有截图但blob丢失的情况）
function base64ToBlob(base64, mimeType = 'image/png') {
  const byteChars = atob(base64)
  const byteArrays = []
  for (let offset = 0; offset < byteChars.length; offset += 512) {
    const slice = byteChars.slice(offset, offset + 512)
    const byteNums = new Array(slice.length)
    for (let i = 0; i < slice.length; i++) byteNums[i] = slice.charCodeAt(i)
    byteArrays.push(new Uint8Array(byteNums))
  }
  return new Blob(byteArrays, { type: mimeType })
}

// ========== 提示词常量 ==========
const WAVE_SYSTEM_PROMPT = `你是一位算法教学专家，擅长用"水波法"（由核心向外层层扩展）分析算法代码片段。你的任务是帮助学生理解一段算法代码——不是翻译代码，而是解释算法本身的逻辑思想。

请严格输出以下JSON格式，不要加markdown代码块：

{
  "algorithmName": "算法名称（如'快速排序''二分查找'等）",
  "opCore": "【算法本质】用一句白话说明：这段算法到底在完成一件什么事？不要用术语，让完全不懂算法的人也能听懂",
  "stepFrames": [
    {
      "label": "步骤名称（如'选基准点'）",
      "inputState": "这一步开始时数据的样子",
      "operation": "这一步具体做了什么（白话，不用代码术语）",
      "outputState": "这一步结束后数据变成了什么样"
    }
  ],
  "stuckWhy": "【卡点诊断】初学者理解这段算法时最容易卡住的一个地方，用白话说清楚为什么容易卡。禁止使用'递归''指针''时间复杂度'等术语，用'套娃''书签''回马枪'等生活化表达替代",
  "bypassHow": "【突破策略】针对上述卡点，给出一个可操作的拆解/理解策略。必须给出具体的操作步骤",
  "lifeAnalogy": "【生活类比】用一个日常生活场景来类比这个算法的整体逻辑"
}

要求：
1. opCore 一句话，长度不超过50字
2. stepFrames 控制在3-6个步骤，每个步骤要具体描述数据状态
3. stuckWhy 和 bypassHow 必须用白话，禁止算法术语
4. lifeAnalogy 要具体、生动
5. algorithmName 要准确识别
6. 只返回JSON，不要其他文字`

const CANVAS_SYSTEM_PROMPT = `你是算法可视化专家。基于之前的算法水波分析，为每个关键步骤生成一个Canvas关键帧描述，用于前端Canvas渲染。

Canvas渲染器支持以下绘制元素：
- rect: 矩形 {type:"rect", x, y, w, h, fill, border, label, labelColor, labelSize}
- text: 文字 {type:"text", x, y, content, color, size}
- arrow: 箭头 {type:"arrow", fromX, fromY, toX, toY, color, label, labelColor}
- circle: 圆形 {type:"circle", x, y, r, fill, border, label, labelColor, labelSize}

请严格输出JSON：
{
  "frames": [
    {
      "label": "帧标题",
      "description": "这一帧发生了什么（白话）",
      "drawings": [ ... ]
    }
  ]
}

坐标说明：
- Canvas 600×220
- 数组元素用 rect 排列：x从左到右递增（宽40-50，间距4-6），y约60-90
- 指针用 arrow：from是标签位置，to指向元素
- 文字标注在元素上方
- 颜色：蓝色(#4A90D9)普通元素，红色(#e74c3c)pivot/当前操作，绿色(#27ae60)已处理，橙色(#f39c12)比较中

要求：
1. 每个关键步骤一个frame，3-6帧
2. 坐标精确不重叠
3. 只返回JSON`

const VERIFY_SYSTEM_PROMPT = `你是算法教学专家。学生已通过水波分析学习了算法，现在用伪代码证明理解。请对照原始代码验证。

严格输出JSON：
{
  "isCorrect": true,
  "summary": "一句话总结验证结果",
  "details": [
    {"type": "correct", "text": "正确理解了分治思想"},
    {"type": "missing", "text": "遗漏了递归终止条件"},
    {"type": "deviated", "text": "分区描述不够准确"}
  ]
}
type取值：correct(理解对) / missing(有遗漏) / deviated(有偏差)

判定标准：
- 只要核心逻辑（分治/迭代/递归方向）对，就判 isCorrect:true
- 语法问题、变量命名、代码风格完全不扣分
- 只检查逻辑正确性

只返回JSON。`

const DEEP_GUIDANCE_PROMPT = `你是算法教学专家。学生已经过水波分析和验证，但有些地方还没完全理解。请针对验证发现的**具体偏差和遗漏**，做一次更深入、更聚焦的讲解。

你的任务不是重新讲一遍算法，而是：
1. 针对学生具体卡住的那个点，换一种完全不同的方式解释
2. 用学生的具体例子，一步步走一遍（每一步：数据长什么样、做了什么操作、为什么这么做）
3. 如果学生混淆了两个概念（如"原地交换"和"新建数组"），把它们放在一起对比说明区别
4. 最后给出一个"你可以这样想"的简化口诀

输出格式：直接用中文写作，不要JSON格式。结构如下：

## 🎯 你卡在哪
（一句话定位学生的具体困惑）

## 🔄 换个角度看
（用和之前水波分析完全不同的角度/比喻来重新解释）

## 📝 跟着例子走一遍
（用学生自己的数据，一步一步走，每步都写清楚）

## ⚖️ 容易混淆的地方
（如果学生混淆了概念，并排对比）

## 💡 记住这个
（一句口诀或核心原则）

要求：白话、亲切、像家教一对一在讲。`

const REVERIFY_PROMPT = `你是算法教学专家。这是学生经过深入讲解后的**第N轮重新验证**。学生修改了伪代码，请重新对照原始代码验证。

严格输出JSON：
{
  "isCorrect": true,
  "summary": "一句话总结本轮验证结果",
  "progress": "相比上一轮有哪些进步",
  "details": [
    {"type": "correct", "text": "..."},
    {"type": "missing", "text": "..."},
    {"type": "deviated", "text": "..."}
  ]
}
type取值：correct / missing / deviated

判定标准不变：
- 核心逻辑对就判 isCorrect:true
- 语法和风格不扣分
- 只检查逻辑

只返回JSON。`

// ========== 构建完整提示词 ==========
function buildWavePrompt() {
  const code = codeInput.value.trim()
  const lang = codeLang.value
  const screenshotNote = inputMode.value === 'image' ? '\n（用户同时提供了截图，请结合截图读取代码）' : ''

  // 系统提示词 + 用户数据 合并在一个文本中，方便复制粘贴
  return `【系统指令 — 请严格按此执行】
${WAVE_SYSTEM_PROMPT}

【用户输入 — 请分析以下算法代码】
代码语言：${lang === 'auto' ? '自动检测' : lang}${screenshotNote}
代码：
${code}

请只输出JSON，不要markdown代码块，不要任何其他文字。`
}

function buildCanvasPrompt() {
  return `【系统指令 — 请严格按此执行】
${CANVAS_SYSTEM_PROMPT}

【水波分析结果（基于此生成Canvas帧）】
${JSON.stringify(waveResult.value, null, 2)}

【原始代码】
${extractedCode.value || codeInput.value}

请只输出JSON，不要markdown代码块，不要任何其他文字。`
}

function buildVerifyPrompt() {
  return `【系统指令 — 请严格按此执行】
${VERIFY_SYSTEM_PROMPT}

【原始代码】
${extractedCode.value || codeInput.value}

【水波分析（帮助学生理解的内容）】
${JSON.stringify(waveResult.value, null, 2)}

【学生的伪代码】
${userPseudoCode.value}

请只输出JSON，不要markdown代码块，不要任何其他文字。`
}

// ========== 复制到剪贴板（文本 or 文本+图片） ==========
async function copyToClipboard(text, label) {
  // 如果是截图模式且有图片，文本+图片一起复制
  const hasImage = inputMode.value === 'image' && (screenshotBlob.value || screenshotBase64.value)

  if (hasImage) {
    try {
      const imageBlob = screenshotBlob.value || base64ToBlob(screenshotBase64.value)
      const clipboardItem = new ClipboardItem({
        'text/plain': new Blob([text], { type: 'text/plain' }),
        'image/png': imageBlob
      })
      await navigator.clipboard.write([clipboardItem])
      ElMessage.success(`提示词+截图已复制（${label}），直接粘贴到AI窗口即可`)
      return true
    } catch (e) {
      // Fallback: 文本 only
      try {
        await navigator.clipboard.writeText(text)
        ElMessage.warning(`图片复制失败，仅复制了提示词文本（${label}），请手动附上截图`)
        return true
      } catch {
        ElMessage.error('复制失败，请手动复制文本')
        return false
      }
    }
  }

  // 纯文本模式
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success(`提示词已复制（${label}），粘贴到任意AI窗口中获取结果`)
    return true
  } catch (e) {
    ElMessage.error('复制失败，请手动复制文本')
    return false
  }
}

// ========== 步骤1: 水波分析 ==========
async function copyWavePrompt() {
  const prompt = buildWavePrompt()
  const ok = await copyToClipboard(prompt, '水波分析')
  if (ok) {
    showWavePaste.value = true
    waveAIResponse.value = ''
    waveResult.value = null
    verifyResult.value = null
    canvasFrames.value = []
  }
}

function parseWaveResponse() {
  const parsed = extractJSON(waveAIResponse.value)
  if (!parsed) {
    ElMessage.error('未识别到JSON，请检查AI返回的格式。确保没有markdown代码块包裹。')
    return
  }
  // 兼容 code 字段（有的AI同时提取了代码）
  if (parsed.code) extractedCode.value = parsed.code
  else extractedCode.value = codeInput.value.trim()

  waveResult.value = parsed
  expandedLayer.value = 0
  currentFrameIdx.value = -1
  showWavePaste.value = false
  ElMessage.success(`水波分析完成：${parsed.algorithmName || '未知算法'}`)
}

// ========== 步骤2: Canvas关键帧 ==========
async function copyCanvasPrompt() {
  const prompt = buildCanvasPrompt()
  const ok = await copyToClipboard(prompt, 'Canvas关键帧')
  if (ok) {
    showCanvasPaste.value = true
    canvasAIResponse.value = ''
  }
}

function parseCanvasResponse() {
  const parsed = extractJSON(canvasAIResponse.value)
  if (!parsed?.frames?.length) {
    ElMessage.error('未识别到frames数组，请检查格式')
    return
  }
  canvasFrames.value = parsed.frames
  currentCanvasFrame.value = 0
  showCanvasPaste.value = false
  nextTick(() => renderCurrentCanvasFrame())
  ElMessage.success(`已生成 ${parsed.frames.length} 个关键帧`)
}

// ========== 步骤3: 回声验证 ==========
async function copyVerifyPrompt() {
  const prompt = buildVerifyPrompt()
  const ok = await copyToClipboard(prompt, '伪代码验证')
  if (ok) {
    showVerifyPaste.value = true
    verifyAIResponse.value = ''
    verifyResult.value = null
  }
}

function parseVerifyResponse() {
  const parsed = extractJSON(verifyAIResponse.value)
  if (!parsed) {
    ElMessage.error('未识别到JSON')
    return
  }
  verifyResult.value = parsed
  showVerifyPaste.value = false
  verifyRound.value = 1
  ElMessage.success(parsed.isCorrect ? '✅ 思路正确！' : '⚠️ 还有需要修正的地方')
}

// ========== 深入引导 ==========
function buildDeepPrompt() {
  const issues = verifyResult.value?.details?.filter(d => d.type === 'missing' || d.type === 'deviated') || []
  const issueText = issues.map(d => `- [${d.type === 'missing' ? '遗漏' : '偏差'}] ${d.text}`).join('\n')

  return `【系统指令 — 请严格按此执行】
${DEEP_GUIDANCE_PROMPT}

【原始代码】
${extractedCode.value || codeInput.value}

【水波分析（学生已经看过）】
${JSON.stringify(waveResult.value, null, 2)}

【学生的伪代码】
${userPseudoCode.value}

【验证发现的具体问题】
${issueText}

请只输出中文讲解内容，不要JSON格式。`
}

async function copyDeepPrompt() {
  const prompt = buildDeepPrompt()
  const ok = await copyToClipboard(prompt, '深入引导')
  if (ok) {
    showDeepPaste.value = true
    deepAIResponse.value = ''
  }
}

function parseDeepResponse() {
  if (!deepAIResponse.value.trim()) { ElMessage.warning('请粘贴AI返回的讲解'); return }
  deepGuidance.value = deepAIResponse.value
  showDeepPaste.value = false
  ElMessage.success('深入讲解已加载，阅读后修改伪代码重新验证')
}

// ========== 重新验证 ==========
function buildReverifyPrompt() {
  return `【系统指令 — 请严格按此执行】
${REVERIFY_PROMPT.replace('第N轮', `第${verifyRound.value}轮`)}

【原始代码】
${extractedCode.value || codeInput.value}

【水波分析】
${JSON.stringify(waveResult.value, null, 2)}

【上一轮验证结果】
${JSON.stringify(verifyResult.value, null, 2)}

【深入讲解（学生已阅读）】
${deepGuidance.value || '（无）'}

【学生修改后的伪代码】
${userPseudoCode.value}

请只输出JSON，不要markdown代码块，不要任何其他文字。`
}

async function copyReverifyPrompt() {
  const prompt = buildReverifyPrompt()
  const ok = await copyToClipboard(prompt, `第${verifyRound.value}轮重新验证`)
  if (ok) {
    showReverifyPaste.value = true
    reverifyAIResponse.value = ''
  }
}

function parseReverifyResponse() {
  const parsed = extractJSON(reverifyAIResponse.value)
  if (!parsed) { ElMessage.error('未识别到JSON'); return }
  verifyResult.value = parsed  // 覆盖上一轮结果
  showReverifyPaste.value = false
  verifyRound.value++
  ElMessage.success(parsed.isCorrect ? '✅ 这轮通过了！' : `⚠️ 第${verifyRound.value - 1}轮仍有问题，可继续深入`)
}

// ========== Canvas 渲染 ==========
function renderCurrentCanvasFrame() {
  const canvas = frameCanvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = darkMode.value ? '#1a1a2e' : '#f8f9fa'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const frame = canvasFrames.value[currentCanvasFrame.value]
  if (!frame?.drawings) return

  for (const d of frame.drawings) {
    ctx.save()
    switch (d.type) {
      case 'rect': {
        ctx.fillStyle = d.fill || '#4A90D9'
        ctx.strokeStyle = d.border || '#2C5F8A'
        ctx.lineWidth = 2
        const r = d.radius || 4, x = d.x, y = d.y, w = d.w, h = d.h
        ctx.beginPath(); ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.arcTo(x+w,y,x+w,y+r,r); ctx.lineTo(x+w,y+h-r); ctx.arcTo(x+w,y+h,x+w-r,y+h,r); ctx.lineTo(x+r,y+h); ctx.arcTo(x,y+h,x,y+h-r,r); ctx.lineTo(x,y+r); ctx.arcTo(x,y,x+r,y,r); ctx.closePath()
        ctx.fill(); ctx.stroke()
        if (d.label) { ctx.fillStyle = d.labelColor || '#fff'; ctx.font = `${d.labelSize||14}px monospace`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(d.label, x+w/2, y+h/2) }
        break
      }
      case 'text': {
        ctx.fillStyle = d.color || '#ccc'; ctx.font = `${d.size||13}px sans-serif`; ctx.textAlign = d.align||'left'; ctx.textBaseline = 'top'; ctx.fillText(d.content, d.x, d.y)
        break
      }
      case 'arrow': {
        ctx.strokeStyle = d.color || '#e74c3c'; ctx.fillStyle = d.color || '#e74c3c'; ctx.lineWidth = 2
        ctx.beginPath(); ctx.moveTo(d.fromX, d.fromY); ctx.lineTo(d.toX, d.toY); ctx.stroke()
        const angle = Math.atan2(d.toY-d.fromY, d.toX-d.fromX), headLen = 8
        ctx.beginPath(); ctx.moveTo(d.toX, d.toY); ctx.lineTo(d.toX-headLen*Math.cos(angle-Math.PI/6), d.toY-headLen*Math.sin(angle-Math.PI/6)); ctx.lineTo(d.toX-headLen*Math.cos(angle+Math.PI/6), d.toY-headLen*Math.sin(angle+Math.PI/6)); ctx.closePath(); ctx.fill()
        if (d.label) { ctx.fillStyle = d.labelColor||d.color||'#e74c3c'; ctx.font = `${d.labelSize||12}px sans-serif`; ctx.textAlign = 'center'; ctx.fillText(d.label, (d.fromX+d.toX)/2, d.fromY-8) }
        break
      }
      case 'circle': {
        ctx.fillStyle = d.fill || '#4A90D9'; ctx.strokeStyle = d.border || '#2C5F8A'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(d.x, d.y, d.r||15, 0, Math.PI*2); ctx.fill(); ctx.stroke()
        if (d.label) { ctx.fillStyle = d.labelColor||'#fff'; ctx.font = `${d.labelSize||13}px monospace`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(d.label, d.x, d.y) }
        break
      }
    }
    ctx.restore()
  }
}

function playCanvasFrames() {
  if (canvasPlaying.value) { stopCanvasPlay(); return }
  canvasPlaying.value = true
  const loop = () => {
    if (!canvasPlaying.value) return
    if (currentCanvasFrame.value < canvasFrames.value.length-1) { currentCanvasFrame.value++; renderCurrentCanvasFrame(); canvasPlayTimer = setTimeout(loop, 1500) }
    else stopCanvasPlay()
  }
  canvasPlayTimer = setTimeout(loop, 1500)
}
function stopCanvasPlay() { canvasPlaying.value = false; clearTimeout(canvasPlayTimer) }
watch(currentCanvasFrame, () => renderCurrentCanvasFrame())

// ========== 重置 ==========
function resetAll() {
  codeInput.value = ''; clearScreenshot()
  waveResult.value = null; verifyResult.value = null; extractedCode.value = ''
  canvasFrames.value = []; currentCanvasFrame.value = 0; expandedLayer.value = -1
  currentFrameIdx.value = -1; userPseudoCode.value = ''
  waveAIResponse.value = ''; canvasAIResponse.value = ''; verifyAIResponse.value = ''
  showWavePaste.value = false; showCanvasPaste.value = false; showVerifyPaste.value = false
  deepGuidance.value = ''; deepAIResponse.value = ''; showDeepPaste.value = false
  reverifyAIResponse.value = ''; showReverifyPaste.value = false; verifyRound.value = 1
  stopCanvasPlay()
}

function clearScreenshot() {
  screenshotUrl.value = ''
  screenshotBase64.value = ''
  screenshotBlob.value = null
}
</script>

<style scoped>
.awt-container { background:#0d1117; color:#c9d1d9; min-height:100vh; font-family:'Segoe UI',system-ui,sans-serif; }
.awt-container:not(.dark) { background:#f5f5f5; color:#333; }
.awt-header { display:flex; align-items:center; justify-content:space-between; padding:10px 18px; border-bottom:1px solid #30363d; background:#161b22; }
.awt-container:not(.dark) .awt-header { background:#fff; border-bottom:1px solid #e0e0e0; }
.awt-title { margin:0; font-size:18px; color:#58a6ff; }
.awt-header-actions { display:flex; align-items:center; gap:8px; }

.awt-body { display:flex; gap:0; height:calc(100vh - 56px); overflow:hidden; }
.awt-left { flex:1; overflow-y:auto; padding:12px; }
.awt-right { width:420px; overflow-y:auto; padding:12px; border-left:1px solid #30363d; flex-shrink:0; }
.awt-container:not(.dark) .awt-right { border-left:1px solid #e0e0e0; }

.section { background:#161b22; border:1px solid #30363d; border-radius:8px; padding:14px; margin-bottom:12px; }
.awt-container:not(.dark) .section { background:#fff; border-color:#e0e0e0; }
.section-header { display:flex; align-items:center; gap:8px; margin-bottom:10px; flex-wrap:wrap; }
.section-label { font-weight:600; font-size:14px; color:#58a6ff; }
.hint-text { font-size:11px; color:#8b949e; }

.paste-back { margin-top:10px; padding:10px; background:#0d111744; border-radius:6px; border:1px dashed #30363d; }
.paste-label { font-size:12px; color:#f59e0b; margin-bottom:6px; }

.image-paste-zone { border:2px dashed #30363d; border-radius:8px; min-height:160px; display:flex; flex-direction:column; align-items:center; justify-content:center; cursor:pointer; outline:none; }
.image-paste-zone:focus { border-color:#58a6ff; }
.paste-placeholder { color:#8b949e; font-size:14px; }
.screenshot-preview { max-width:100%; max-height:300px; border-radius:4px; }

.wave-layer { border:1px solid #30363d; border-radius:6px; padding:10px 14px; margin-bottom:6px; cursor:pointer; transition:border-color .2s; }
.wave-layer:hover { border-color:#58a6ff55; }
.wave-layer.expanded { border-color:#58a6ff; }
.wave-layer-title { font-weight:600; font-size:13px; color:#f0f6fc; }
.wave-layer-content { margin-top:8px; font-size:13px; line-height:1.7; color:#b0b8c1; padding-left:8px; border-left:2px solid #30363d; }
.wave-layer-content.stuck { color:#f59e0b; border-left-color:#f59e0b; }
.wave-layer-content.resolve { color:#27ae60; border-left-color:#27ae60; }
.wave-layer-content.analogy { color:#58a6ff; border-left-color:#58a6ff; }

.step-frame-item { display:flex; align-items:flex-start; gap:8px; padding:6px 10px; margin:4px 0; border-radius:4px; cursor:pointer; font-size:12px; color:#b0b8c1; transition:background .15s; }
.step-frame-item:hover { background:#1f2937; }
.step-frame-item.active { background:#1a3a5c; color:#58a6ff; }
.step-num { width:22px; height:22px; border-radius:50%; background:#30363d; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:600; flex-shrink:0; margin-top:2px; }
.step-label { font-weight:600; margin-bottom:4px; }
.step-states { margin-top:4px; }
.step-state { margin:2px 0; color:#8b949e; font-size:11px; line-height:1.5; }
.step-state b { color:#c9d1d9; }

.canvas-frame-section { margin-top:10px; padding:8px; background:#0d1117; border-radius:6px; }
.canvas-frame-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; font-size:12px; color:#8b949e; }
.frame-canvas { width:100%; max-width:600px; border-radius:4px; border:1px solid #30363d; }
.canvas-frame-desc { margin-top:6px; font-size:12px; color:#b0b8c1; line-height:1.5; }

.code-block { background:#0d1117; color:#c9d1d9; padding:12px; border-radius:6px; font-size:12px; line-height:1.6; overflow-x:auto; white-space:pre-wrap; border:1px solid #30363d; margin:0; }

.verify-card { padding:12px; border-radius:6px; margin-bottom:8px; }
.verify-card.correct { background:#0d2818; border:1px solid #27ae60; }
.verify-card.incorrect { background:#28180d; border:1px solid #f59e0b; }
.verify-status { font-weight:600; font-size:15px; margin-bottom:4px; }
.verify-card.correct .verify-status { color:#27ae60; }
.verify-card.incorrect .verify-status { color:#f59e0b; }
.verify-summary { font-size:13px; color:#b0b8c1; line-height:1.5; }
.verify-detail-item { display:flex; align-items:flex-start; gap:6px; padding:6px 0; font-size:12px; border-bottom:1px solid #30363d15; }
.vd-tag { font-size:11px; padding:1px 6px; border-radius:3px; white-space:nowrap; flex-shrink:0; }
.verify-detail-item.correct .vd-tag { background:#0d2818; color:#27ae60; }
.verify-detail-item.missing .vd-tag { background:#28180d; color:#f59e0b; }
.verify-detail-item.deviated .vd-tag { background:#1a1a2e; color:#58a6ff; }
.vd-text { color:#b0b8c1; line-height:1.5; }

:deep(.el-textarea__inner) { background:#0d1117 !important; color:#c9d1d9 !important; border-color:#30363d !important; font-size:12px; }
:deep(.el-input__inner) { background:#0d1117 !important; color:#c9d1d9 !important; border-color:#30363d !important; }
:deep(.el-radio-button__inner) { background:transparent !important; color:#c9d1d9 !important; border-color:#30363d !important; }
:deep(.el-select .el-input__inner) { background:#0d1117 !important; }

.awt-left::-webkit-scrollbar, .awt-right::-webkit-scrollbar { width:6px; }
.awt-left::-webkit-scrollbar-thumb, .awt-right::-webkit-scrollbar-thumb { background:#30363d; border-radius:3px; }
</style>
