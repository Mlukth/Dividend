<template>
  <div class="ocr-wrapper">
    <!-- Header -->
    <div class="ocr-header">
      <h1>OCR 双引擎</h1>
      <div class="mode-tabs">
        <button :class="['mode-tab', { active: mode === 'paste' }]" @click="mode = 'paste'">粘贴图片</button>
        <button :class="['mode-tab', { active: mode === 'folder' }]" @click="mode = 'folder'">文件夹批量</button>
      </div>
      <div class="header-right">
        <el-switch
          v-model="ollamaOn"
          active-text="ollama"
          inactive-text="ollama"
          :loading="togglingOllama"
          @change="toggleOllama"
          size="small"
        />
        <el-select v-model="selectedModel" size="small" style="width:160px" :disabled="!ollamaOn" placeholder="无模型">
          <el-option v-for="m in availableModels" :key="m" :label="m" :value="m" />
        </el-select>
        <span :class="['status-tag', ollamaOn ? 'ok' : 'err']">{{ ollamaOn ? (selectedModel + ' 就绪') : 'qwen 离线' }}</span>
      </div>
    </div>

    <div class="ocr-main">
      <!-- ═══ PASTE MODE ═══ -->
      <div v-show="mode === 'paste'">
        <div
          :class="['paste-zone', { 'drag-over': dragOver }]"
          @click="$refs.fileInput.click()"
          @dragover.prevent="dragOver = true"
          @dragleave="dragOver = false"
          @drop.prevent="onDrop"
        >
          <div class="paste-icon">Ctrl+V</div>
          <p>在此处粘贴图片 或 点击选择文件</p>
          <p class="hint">支持剪贴板截图、JPG、PNG、BMP | 支持多图同时粘贴</p>
          <input ref="fileInput" type="file" accept="image/*" multiple style="display:none" @change="onFileSelect">
        </div>

        <!-- Progress -->
        <div v-if="pasteQueue.length" class="progress-section">
          <div class="progress-info">
            <span>{{ progressLabel }}</span>
            <span>{{ progressTime }}</span>
          </div>
          <el-progress :percentage="progressPct" :show-text="false" :stroke-width="6" color="linear-gradient(90deg, #e94560, #4ecca3)" />
          <div class="progress-step">{{ progressStep }}</div>
        </div>

        <!-- Queue -->
        <div v-if="pasteQueue.length" class="queue-list">
          <div v-for="(q, i) in pasteQueue" :key="i" class="queue-item">
            <span class="q-name">{{ q.name }}</span>
            <span :class="['q-status', q.status]">{{ q.statusText }}</span>
          </div>
        </div>

        <!-- Results -->
        <div v-if="pasteResults.length" class="result-section">
          <div class="batch-actions">
            <span class="batch-summary">共 {{ pasteResults.length }} 张</span>
            <el-button type="primary" size="small" @click="copyAllCorrected">复制全部纠错结果</el-button>
          </div>
          <div v-for="(pr, pi) in pasteResults" :key="pi" class="file-card" style="margin-top:8px">
            <div class="file-row" @click="pr.show = !pr.show" style="cursor:pointer">
              <span class="file-name">{{ pr.name }}</span>
              <div class="file-actions">
                <span class="file-status done">{{ pr.elapsed }}s | {{ pr.overlap }}%</span>
                <span style="font-size:12px;color:#888">{{ pr.show ? '收起' : '展开' }}</span>
              </div>
            </div>
            <div v-if="pr.show" class="inline-result">
              <div class="result-tabs">
                <button :class="['result-tab', { active: pr.tab === 'corrected' }]" @click.stop="pr.tab = 'corrected'">深度纠错</button>
                <button :class="['result-tab', { active: pr.tab === 'win' }]" @click.stop="pr.tab = 'win'">Windows OCR</button>
                <button :class="['result-tab', { active: pr.tab === 'easy' }]" @click.stop="pr.tab = 'easy'">easyocr</button>
              </div>
              <div class="result-content corrected">{{ pr.tab === 'corrected' ? (pr.data.corrected || pr.data.win_text) : pr.tab === 'win' ? pr.data.win_text : pr.data.easy_text }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══ FOLDER MODE ═══ -->
      <div v-show="mode === 'folder'">
        <div class="folder-row">
          <el-input v-model="folderPath" placeholder="输入图片文件夹路径，如 D:/temp/screenshots/" @keyup.enter="scanFolder" />
          <el-button type="primary" @click="scanFolder" :loading="scanning">扫描新图片</el-button>
          <el-button @click="processAll" :disabled="!folderImages.length">全部处理</el-button>
        </div>

        <!-- Folder progress -->
        <div v-if="folderProcessing" class="progress-section">
          <div class="progress-info">
            <span>{{ folderProgressLabel }}</span>
            <span>{{ folderProgressTime }}</span>
          </div>
          <el-progress :percentage="folderProgressPct" :show-text="false" :stroke-width="6" color="linear-gradient(90deg, #e94560, #4ecca3)" />
        </div>

        <div v-if="folderStatus" :class="['status-tag', folderStatusOk ? 'ok' : 'err']" style="margin-bottom:12px">{{ folderStatus }}</div>

        <!-- File list -->
        <div class="file-list">
          <div v-for="img in folderImages" :key="img.name" class="file-card">
            <div class="file-row">
              <span class="file-name">{{ img.name }}</span>
              <div class="file-actions">
                <span v-if="img.status === 'done'" class="file-status done">{{ img.time }}s {{ img.hasCorr ? '+纠错' : '' }}</span>
                <span v-else-if="img.status === 'err'" class="file-status err">{{ img.error }}</span>
                <span v-else class="file-status">{{ img.status || '待处理' }}</span>
                <el-button v-if="img.status !== 'done'" type="primary" size="small" @click="processOne(img)" :loading="img.status === 'processing'">处理</el-button>
                <el-button v-else size="small" @click="toggleResult(img)">{{ img.showResult ? '收起' : '查看' }}</el-button>
              </div>
            </div>
            <!-- Inline result -->
            <div v-if="img.showResult && img.result" class="inline-result">
              <div class="result-tabs">
                <button :class="['result-tab', { active: img.viewTab === 'corrected' }]" @click="img.viewTab = 'corrected'">深度纠错</button>
                <button :class="['result-tab', { active: img.viewTab === 'win' }]" @click="img.viewTab = 'win'">Windows OCR</button>
                <button :class="['result-tab', { active: img.viewTab === 'easy' }]" @click="img.viewTab = 'easy'">easyocr</button>
              </div>
              <div class="result-content corrected">{{ img.viewTab === 'corrected' ? (img.result.corrected || img.result.win_text) : img.viewTab === 'win' ? img.result.win_text : img.result.easy_text }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'

const API = 'http://127.0.0.1:5050/api'

// ── Common ──
const mode = ref('paste')
const ollamaOn = ref(false)
const togglingOllama = ref(false)
const selectedModel = ref('qwen3:8b')
const availableModels = ref(['qwen3:8b'])

async function checkStatus() {
  try { const r = await fetch(API + '/status'); const d = await r.json(); ollamaOn.value = d.ollama; } catch { ollamaOn.value = false }
}
async function fetchModels() {
  try { const r = await fetch(API + '/models'); const d = await r.json(); if (d.models.length) { availableModels.value = d.models; if (!d.models.includes(selectedModel.value)) selectedModel.value = d.models[0] } } catch {}
}
async function toggleOllama(on) {
  togglingOllama.value = true
  try {
    if (on) {
      await fetch(API + '/ollama/start', { method: 'POST' })
      // 等待 ollama 就绪
      for (let i = 0; i < 15; i++) {
        await new Promise(r => setTimeout(r, 1000))
        try { const r = await fetch(API + '/status'); const d = await r.json(); if (d.ollama) break } catch {}
      }
      await fetchModels()
    } else {
      await fetch(API + '/ollama/stop', { method: 'POST' })
    }
    await checkStatus()
  } catch(e) { alert('操作失败: ' + e.message) }
  togglingOllama.value = false
}
let statusTimer
onMounted(() => { checkStatus(); fetchModels(); statusTimer = setInterval(checkStatus, 30000) })
onUnmounted(() => clearInterval(statusTimer))

async function stopOllama() {
  stoppingOllama.value = true
  try { const r = await fetch(API + '/ollama/stop', { method: 'POST' }); const d = await r.json(); alert(d.message); setTimeout(checkStatus, 2000) } catch(e) { alert('失败: ' + e.message) }
  stoppingOllama.value = false
}

// ── Paste mode ──
const dragOver = ref(false)
const pasteQueue = ref([])
const progressLabel = ref('')
const progressTime = ref('')
const progressStep = ref('')
const progressPct = ref(0)
const pasteResults = ref([])

async function processFiles(files) {
  pasteQueue.value = files.map((f, i) => ({ name: f.name || `image_${i+1}.png`, file: f, status: 'pending', statusText: '待处理' }))
  pasteResults.value = []
  const batchStart = Date.now()

  for (let i = 0; i < pasteQueue.value.length; i++) {
    const q = pasteQueue.value[i]
    q.status = 'processing'; q.statusText = '识别中...'
    progressPct.value = Math.round((i / pasteQueue.value.length) * 100)
    progressLabel.value = `${i+1} / ${pasteQueue.value.length}: ${q.name}`
    progressTime.value = ((Date.now() - batchStart) / 1000).toFixed(1) + 's'
    progressStep.value = '读取图片...'

    const base64 = await new Promise(resolve => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result.split(',')[1])
      reader.readAsDataURL(q.file)
    })

    progressStep.value = 'Windows OCR + easyocr 双引擎识别中...'
    const t0 = Date.now()
    try {
      const r = await fetch(API + '/ocr/paste', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: base64, filename: q.name, model: selectedModel.value }) })
      const d = await r.json()
      q.status = 'done'; q.statusText = '完成'
      progressStep.value = d.corrected ? 'qwen3:8b 纠错完成' : 'OCR 完成 (qwen 离线)'
      pasteResults.value.push({
        name: q.name,
        data: d,
        elapsed: ((Date.now() - t0) / 1000).toFixed(1),
        overlap: (d.overlap * 100).toFixed(0),
        show: true,
        tab: 'corrected'
      })
    } catch(e) {
      q.status = 'err'; q.statusText = '失败'
      progressStep.value = '失败: ' + e.message
    }
  }

  progressPct.value = 100
  progressLabel.value = `完成 ${pasteQueue.value.length} 张 / ${((Date.now() - batchStart)/1000).toFixed(1)}s`
  progressTime.value = ''; progressStep.value = ''
}

// 只显示最后一张的结果 (default: show only last, others collapsed)
// user clicks to expand others

function copyAllCorrected() {
  const texts = pasteResults.value
    .map(r => `=== ${r.name} ===\n${r.data.corrected || r.data.win_text || '(无结果)'}`)
    .join('\n\n')
  navigator.clipboard.writeText(texts).then(() => {
    const btn = document.querySelector('.batch-actions .el-button')
    if (btn) { const orig = btn.textContent; btn.textContent = '已复制!'; setTimeout(() => btn.textContent = orig, 1500) }
  })
}

function onDrop(e) {
  dragOver.value = false
  const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
  if (files.length) processFiles(files)
}
function onFileSelect(e) { const files = Array.from(e.target.files); if (files.length) processFiles(files); e.target.value = '' }
function onPaste(e) {
  if (mode.value !== 'paste') return
  const files = []; for (let item of e.clipboardData.items) { if (item.type.startsWith('image/')) { e.preventDefault(); files.push(item.getAsFile()) } }
  if (files.length) processFiles(files)
}
onMounted(() => document.addEventListener('paste', onPaste))
onUnmounted(() => document.removeEventListener('paste', onPaste))

// ── Folder mode ──
const folderPath = ref('')
const folderImages = ref([])
const folderStatus = ref('')
const folderStatusOk = ref(true)
const scanning = ref(false)
const folderProcessing = ref(false)
const folderProgressLabel = ref('')
const folderProgressTime = ref('')
const folderProgressPct = ref(0)

async function scanFolder() {
  const path = folderPath.value.trim(); if (!path) return
  scanning.value = true; folderImages.value = []
  try {
    const r = await fetch(API + '/ocr/folder-scan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path }) })
    const d = await r.json()
    if (d.error) { folderStatus.value = d.error; folderStatusOk.value = false; return }
    folderStatus.value = `${d.new_count} 张新图片 / ${d.total_count} 张总计 / ${d.processed_count} 张已处理`
    folderStatusOk.value = true
    folderImages.value = d.images.map(img => ({ name: img.name, size: img.size, status: 'pending', viewTab: 'corrected', showResult: false, result: null, time: '', hasCorr: false, error: '' }))
  } catch(e) { folderStatus.value = '扫描失败: ' + e.message; folderStatusOk.value = false }
  finally { scanning.value = false }
}

async function processOne(img) {
  const path = folderPath.value.trim()
  img.status = 'processing'
  const t0 = Date.now()
  try {
    const r = await fetch(API + '/ocr/folder-process', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path, name: img.name, model: selectedModel.value }) })
    const d = await r.json()
    if (d.error) { img.status = 'err'; img.error = d.error } else {
      img.status = 'done'; img.time = d.time_s; img.hasCorr = !!d.corrected
      img.result = d; img.viewTab = 'corrected'; img.showResult = true
    }
  } catch(e) { img.status = 'err'; img.error = e.message }
}

function toggleResult(img) { img.showResult = !img.showResult }

async function processAll() {
  const path = folderPath.value.trim(); if (!path) return
  // Scan first
  scanning.value = true
  let images = []
  try {
    const r = await fetch(API + '/ocr/folder-scan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path }) })
    const d = await r.json()
    if (!d.images.length) { folderStatus.value = '没有新图片'; folderStatusOk.value = true; scanning.value = false; return }
    images = d.images
  } catch(e) { folderStatus.value = '扫描失败: ' + e.message; folderStatusOk.value = false; scanning.value = false; return }
  scanning.value = false

  folderProcessing.value = true; folderProgressPct.value = 0
  const t0 = Date.now()
  folderImages.value = images.map(img => ({ name: img.name, size: img.size, status: 'pending', viewTab: 'corrected', showResult: false, result: null, time: '', hasCorr: false, error: '' }))

  for (let i = 0; i < folderImages.value.length; i++) {
    const img = folderImages.value[i]
    folderProgressLabel.value = `${i+1} / ${images.length}: ${img.name}`
    folderProgressTime.value = ((Date.now() - t0) / 1000).toFixed(1) + 's'
    folderProgressPct.value = Math.round((i / images.length) * 100)
    await processOne(img)
  }

  folderProgressPct.value = 100
  folderProgressLabel.value = `完成 ${images.length} 张`
  folderProgressTime.value = ((Date.now() - t0) / 1000).toFixed(1) + 's'
  folderStatus.value = `完成: ${images.length} 张`
  folderStatusOk.value = true
  setTimeout(() => { folderProcessing.value = false }, 3000)
}
</script>

<style scoped>
.ocr-wrapper { font-family: 'Segoe UI', system-ui, sans-serif; background: #1a1a2e; color: #e0e0e0; min-height: 100vh; }
.ocr-header { background: #16213e; padding: 16px 24px; display: flex; align-items: center; gap: 16px; border-bottom: 2px solid #0f3460; flex-wrap: wrap; }
.ocr-header h1 { font-size: 18px; color: #e94560; white-space: nowrap; margin: 0; }
.mode-tabs { display: flex; gap: 4px; }
.mode-tab { padding: 8px 20px; border: none; background: transparent; color: #888; cursor: pointer; font-size: 14px; border-radius: 6px; transition: all .2s; }
.mode-tab.active { background: #e94560; color: #fff; }
.mode-tab:hover:not(.active) { background: #0f3460; color: #ccc; }
.header-right { margin-left: auto; display: flex; align-items: center; gap: 12px; }
.status-tag { font-size: 12px; padding: 4px 8px; background: #0f3460; border-radius: 4px; color: #888; }
.status-tag.ok { color: #4ecca3; }
.status-tag.err { color: #e94560; }
.ocr-main { padding: 24px; max-width: 1000px; margin: 0 auto; }

/* Paste zone */
.paste-zone { border: 2px dashed #0f3460; border-radius: 12px; padding: 60px 20px; text-align: center; cursor: pointer; transition: all .3s; margin-bottom: 16px; }
.paste-zone:hover, .paste-zone.drag-over { border-color: #e94560; background: rgba(233,69,96,.05); }
.paste-icon { font-size: 48px; margin-bottom: 12px; }
.paste-zone p { color: #888; font-size: 14px; }
.paste-zone .hint { color: #555; font-size: 12px; margin-top: 8px; }

/* Progress */
.progress-section { margin: 16px 0; }
.progress-info { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 12px; color: #888; }
.progress-step { font-size: 12px; color: #4ecca3; margin-top: 6px; min-height: 18px; }

/* Queue */
.queue-list { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
.queue-item { display: flex; align-items: center; gap: 10px; padding: 8px 12px; background: #16213e; border-radius: 6px; font-size: 13px; }
.q-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.q-status { font-size: 11px; color: #888; white-space: nowrap; }
.q-status.done { color: #4ecca3; }
.q-status.err, .q-status.processing { color: #e94560; }

/* Result */
.result-section { margin-top: 20px; }
.batch-actions { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
.batch-summary { font-size: 13px; color: #888; }
.result-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.result-tabs { display: flex; gap: 4px; }
.result-tab { padding: 6px 14px; border: 1px solid #0f3460; background: transparent; color: #888; cursor: pointer; border-radius: 6px; font-size: 13px; }
.result-tab.active { background: #0f3460; color: #e0e0e0; }
.result-content { background: #16213e; border-radius: 8px; padding: 16px; font-size: 14px; line-height: 1.8; white-space: pre-wrap; max-height: 500px; overflow-y: auto; }
.result-content.corrected { border-left: 3px solid #4ecca3; }

/* Folder */
.folder-row { display: flex; gap: 12px; margin-bottom: 20px; }
.file-list { display: flex; flex-direction: column; gap: 8px; }
.file-card { background: #16213e; border-radius: 8px; overflow: hidden; }
.file-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; }
.file-name { font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 400px; }
.file-actions { display: flex; gap: 8px; align-items: center; }
.file-status { font-size: 12px; color: #888; }
.file-status.done { color: #4ecca3; }
.file-status.err { color: #e94560; }

/* Inline result */
.inline-result { padding: 0 14px 14px; }
</style>
