<template>
  <div class="aig">
    <div class="aig-header">
      <h2>📱 Android App 图标生成器</h2>
      <p class="aig-sub">选一张本地图片 → 方形/圆形裁剪 → 生成 Capacitor/Android 各密度 mipmap 图标 PNG</p>
    </div>

    <div class="aig-layout">
      <!-- 左：上传 + 裁剪 -->
      <div class="aig-col">
        <div class="aig-card">
          <div class="aig-card-title">① 选择图片 + 裁剪</div>

          <div v-if="!srcImg" class="aig-drop" @dragover.prevent @drop.prevent="onDrop" @click="pickEl.click()">
            <div class="aig-drop-icon">🖼️</div>
            <div>点击选择或拖拽图片到此处</div>
            <div class="aig-drop-hint">支持 PNG / JPG / WebP</div>
          </div>

          <div v-else>
            <div class="aig-preview-wrap" ref="previewWrapEl">
              <img :src="imgDataUrl" class="aig-preview-img" draggable="false" />
              <!-- 裁剪框（正方形） -->
              <div v-if="fitRect"
                class="aig-crop"
                :style="cropStyle"
                @mousedown.stop="startMove($event)"
                @touchstart.stop.prevent="startMoveTouch($event)"
              >
                <span class="aig-crop-corner aig-crop-nw"></span>
                <span class="aig-crop-corner aig-crop-ne"></span>
                <span class="aig-crop-corner aig-crop-sw"></span>
                <span class="aig-crop-corner aig-crop-se" @mousedown.stop="startResize($event)" @touchstart.stop.prevent="startResizeTouch($event)"></span>
                <span class="aig-crop-size">{{ Math.round(crop.size / Math.min(fitRect.w, fitRect.h) * 100) }}%</span>
              </div>
            </div>
            <div class="aig-preview-actions">
              <el-button size="small" @click="resetCrop">↺ 重置选框</el-button>
              <el-button size="small" @click="pickEl.click()">换一张</el-button>
            </div>
          </div>

          <input ref="pickEl" type="file" accept="image/png,image/jpeg,image/webp" style="display:none" @change="onFile" />
        </div>
      </div>

      <!-- 右：参数 + 生成 -->
      <div class="aig-col">
        <div class="aig-card">
          <div class="aig-card-title">② 参数</div>
          <div class="aig-param-row">
            <span class="aig-param-label">输出内容</span>
            <el-checkbox-group v-model="outputModes">
              <el-checkbox value="legacy">legacy 图标</el-checkbox>
              <el-checkbox value="round">圆形图标</el-checkbox>
              <el-checkbox value="foreground">adaptive 前景</el-checkbox>
            </el-checkbox-group>
          </div>
          <div class="aig-param-row" v-if="outputModes.includes('legacy')">
            <span class="aig-param-label">legacy 形状</span>
            <el-radio-group v-model="legacyShape">
              <el-radio-button value="square">方形</el-radio-button>
              <el-radio-button value="rounded">圆角方形</el-radio-button>
            </el-radio-group>
          </div>
          <div class="aig-param-row" v-if="outputModes.includes('foreground')">
            <span class="aig-param-label">前景安全区</span>
            <el-slider v-model="safeRatio" :min="50" :max="100" :step="1" show-input style="flex:1" :format-tooltip="v => v + '%'" />
          </div>
          <div class="aig-param-row">
            <span class="aig-param-label">密度</span>
            <span class="aig-density-list">
              <span v-for="d in DENSITIES" :key="d.name" class="aig-density-chip">{{ d.name }}</span>
            </span>
          </div>
          <div class="aig-param-note">
            生成 {{ DENSITIES.length }} 个密度的 mipmap 目录，输出为 <b>ZIP</b>（含 res/ 目录结构，解压后直接放入 android/app/src/main/ 即可）。
          </div>
          <el-button type="primary" :disabled="!srcImg" :loading="generating" class="aig-gen-btn" @click="generate">
            ⚙️ 生成图标 ZIP
          </el-button>
        </div>

        <!-- 结果预览 -->
        <div class="aig-card" v-if="results.length > 0">
          <div class="aig-card-title">③ 生成结果（预览）</div>
          <div class="aig-res-grid">
            <div v-for="r in results" :key="r.name" class="aig-res-item">
              <div class="aig-res-frame"><img :src="r.dataUrl" /></div>
              <div class="aig-res-name">{{ r.short }}</div>
              <div class="aig-res-size">{{ r.size }}px</div>
            </div>
          </div>
          <div class="aig-dl-row">
            <el-button type="success" @click="downloadZip">📦 下载 ZIP（{{ results.length }} 个文件）</el-button>
            <el-button @click="downloadAllPng">逐张下载 PNG</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 尺寸参考表 -->
    <div class="aig-card aig-spec">
      <div class="aig-card-title">📐 Android 图标尺寸规格</div>
      <table class="aig-spec-table">
        <thead><tr><th>mipmap</th><th>ic_launcher / round</th><th>ic_launcher_foreground</th></tr></thead>
        <tbody>
          <tr v-for="d in DENSITIES" :key="d.name">
            <td class="aig-spec-d">mipmap-{{ d.name }}</td>
            <td>{{ d.legacy }}×{{ d.legacy }}</td>
            <td>{{ d.fg }}×{{ d.fg }}</td>
          </tr>
        </tbody>
      </table>
      <div class="aig-spec-note">adaptive icon（Android 8+）：foreground 为 108/162/216/324/432，实际显示时被系统 mask 裁切，内容应落在约 66% 安全区内。</div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick } from 'vue'
import { ElMessage } from 'element-plus'

const DENSITIES = [
  { name: 'mdpi', legacy: 48, fg: 108 },
  { name: 'hdpi', legacy: 72, fg: 162 },
  { name: 'xhdpi', legacy: 96, fg: 216 },
  { name: 'xxhdpi', legacy: 144, fg: 324 },
  { name: 'xxxhdpi', legacy: 192, fg: 432 }
]

const pickEl = ref(null)
const previewWrapEl = ref(null)
const imgDataUrl = ref('')
const srcImg = ref(null) // Image 对象
const generating = ref(false)
const results = ref([])

const outputModes = ref(['legacy', 'round', 'foreground'])
const legacyShape = ref('rounded')
const safeRatio = ref(66)

const CONTAINER = 340 // 预览容器边长
const fitRect = computed(() => {
  if (!srcImg.value) return null
  const iw = srcImg.value.naturalWidth, ih = srcImg.value.naturalHeight
  const s = Math.min(CONTAINER / iw, CONTAINER / ih)
  const w = iw * s, h = ih * s
  return { x: (CONTAINER - w) / 2, y: (CONTAINER - h) / 2, w, h }
})

// 裁剪框（容器坐标），正方形
const crop = reactive({ x: 0, y: 0, size: 200 })

function resetCrop() {
  if (!fitRect.value) return
  const r = fitRect.value
  crop.size = Math.min(r.w, r.h) * 0.8
  crop.x = r.x + (r.w - crop.size) / 2
  crop.y = r.y + (r.h - crop.size) / 2
  clampCrop()
}

function clampCrop() {
  const r = fitRect.value
  if (!r) return
  const maxSize = Math.min(r.w, r.h)
  crop.size = Math.max(20, Math.min(crop.size, maxSize))
  crop.x = Math.max(r.x, Math.min(crop.x, r.x + r.w - crop.size))
  crop.y = Math.max(r.y, Math.min(crop.y, r.y + r.h - crop.size))
}

const cropStyle = computed(() => ({
  left: crop.x + 'px',
  top: crop.y + 'px',
  width: crop.size + 'px',
  height: crop.size + 'px'
}))

// ---- 拖拽移动 ----
function startMove(e) {
  const startX = e.clientX, startY = e.clientY
  const ox = crop.x, oy = crop.y
  const move = (ev) => { crop.x = ox + (ev.clientX - startX); crop.y = oy + (ev.clientY - startY); clampCrop() }
  const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up) }
  window.addEventListener('mousemove', move); window.addEventListener('mouseup', up)
}
function startMoveTouch(e) {
  const t = e.touches[0]; const startX = t.clientX, startY = t.clientY
  const ox = crop.x, oy = crop.y
  const move = (ev) => { const p = ev.touches[0]; crop.x = ox + (p.clientX - startX); crop.y = oy + (p.clientY - startY); clampCrop() }
  const up = () => { document.removeEventListener('touchmove', move); document.removeEventListener('touchend', up) }
  document.addEventListener('touchmove', move); document.addEventListener('touchend', up)
}

// ---- 缩放手柄（右下） ----
function startResize(e) {
  const startX = e.clientX, startY = e.clientY
  const os = crop.size
  const move = (ev) => { crop.size = os + Math.max(ev.clientX - startX, ev.clientY - startY); clampCrop() }
  const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up) }
  window.addEventListener('mousemove', move); window.addEventListener('mouseup', up)
}
function startResizeTouch(e) {
  const t = e.touches[0]; const startX = t.clientX, startY = t.clientY
  const os = crop.size
  const move = (ev) => { const p = ev.touches[0]; crop.size = os + Math.max(p.clientX - startX, p.clientY - startY); clampCrop() }
  const up = () => { document.removeEventListener('touchmove', move); document.removeEventListener('touchend', up) }
  document.addEventListener('touchmove', move); document.addEventListener('touchend', up)
}

// ---- 图片加载 ----
function onFile(e) { const f = e.target.files && e.target.files[0]; if (f) loadFile(f); e.target.value = '' }
function onDrop(e) { const f = e.dataTransfer.files && e.dataTransfer.files[0]; if (f) loadFile(f) }
function loadFile(file) {
  const rd = new FileReader()
  rd.onload = () => {
    const im = new Image()
    im.onload = () => {
      srcImg.value = im
      imgDataUrl.value = rd.result
      results.value = []
      nextTick(() => resetCrop())
    }
    im.src = rd.result
  }
  rd.readAsDataURL(file)
}

// ---- 渲染 ----
// 裁剪框容器坐标 → 图片像素坐标
function cropToPixel() {
  const r = fitRect.value
  const scale = srcImg.value.naturalWidth / r.w // 方形，宽高同比例
  const px = (crop.x - r.x) * scale
  const py = (crop.y - r.y) * scale
  const size = crop.size * scale
  return { x: px, y: py, size }
}

// 渲染单个图标 canvas
function renderIcon(size, shape, safeRatioPct = 100) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')
  const p = cropToPixel()
  // 若指定安全区，把源区域在目标画布内缩小（居中）
  const drawSize = size * (safeRatioPct / 100)
  const off = (size - drawSize) / 2

  if (shape === 'circle') {
    ctx.beginPath(); ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2); ctx.clip()
  } else if (shape === 'rounded') {
    const r = size * 0.2
    ctx.beginPath()
    ctx.moveTo(r, 0)
    ctx.arcTo(size, 0, size, size, r)
    ctx.arcTo(size, size, 0, size, r)
    ctx.arcTo(0, size, 0, 0, r)
    ctx.arcTo(0, 0, size, 0, r)
    ctx.closePath(); ctx.clip()
  }
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(srcImg.value, p.x, p.y, p.size, p.size, off, off, drawSize, drawSize)
  return canvas
}

function canvasToDataUrl(c) { return c.toDataURL('image/png') }

// ---- 生成 ----
function generate() {
  if (!srcImg.value) return
  generating.value = true
  results.value = []
  const list = [] // { name, short, size, canvas }
  for (const d of DENSITIES) {
    if (outputModes.value.includes('legacy')) {
      list.push({ name: `res/mipmap-${d.name}/ic_launcher.png`, short: `ic_launcher (${d.name})`, size: d.legacy, canvas: renderIcon(d.legacy, legacyShape.value) })
    }
    if (outputModes.value.includes('round')) {
      list.push({ name: `res/mipmap-${d.name}/ic_launcher_round.png`, short: `round (${d.name})`, size: d.legacy, canvas: renderIcon(d.legacy, 'circle') })
    }
    if (outputModes.value.includes('foreground')) {
      list.push({ name: `res/mipmap-${d.name}/ic_launcher_foreground.png`, short: `foreground (${d.name})`, size: d.fg, canvas: renderIcon(d.fg, 'square', safeRatio.value) })
    }
  }
  results.value = list.map(r => ({ name: r.name, short: r.short, size: r.size, dataUrl: canvasToDataUrl(r.canvas) }))
  generating.value = false
  ElMessage.success(`已生成 ${list.length} 个图标`)
}

// ---- 下载 ----
function dataUrlToUint8(d) {
  const bin = atob(d.split(',')[1])
  const arr = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i)
  return arr
}

function downloadBlob(blob, filename) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 5000)
}

function downloadAllPng() {
  for (const r of results.value) {
    const short = r.name.replace('res/mipmap-', '').replace('/', '_')
    downloadBlob(dataUrlToBlob(r.dataUrl), short)
  }
}
function dataUrlToBlob(d) {
  const arr = dataUrlToUint8(d)
  return new Blob([arr], { type: 'image/png' })
}

// ---- 最小 STORE ZIP 打包 ----
function crc32Table() {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1)
    t[n] = c >>> 0
  }
  return t
}
const CRC_TABLE = crc32Table()
function crc32(bytes) {
  let c = 0xFFFFFFFF
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8)
  return (c ^ 0xFFFFFFFF) >>> 0
}

function buildZip(files) {
  const enc = new TextEncoder()
  const parts = []
  const central = []
  let offset = 0
  const now = new Date()
  const dosTime = ((now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1)) & 0xffff
  const dosDate = ((((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate())) & 0xffff

  for (const f of files) {
    const nameBytes = enc.encode(f.name)
    const dataBytes = f.data
    const crc = crc32(dataBytes)
    const header = new Uint8Array(30)
    const dv = new DataView(header.buffer)
    dv.setUint32(0, 0x04034b50, true) // local header sig
    dv.setUint16(4, 20, true)         // version needed
    dv.setUint16(6, 0x0800, true)     // UTF-8 flag
    dv.setUint16(8, 0, true)          // method store
    dv.setUint16(10, dosTime, true)
    dv.setUint16(12, dosDate, true)
    dv.setUint32(14, crc, true)
    dv.setUint32(18, dataBytes.length, true) // comp size
    dv.setUint32(22, dataBytes.length, true) // uncomp size
    dv.setUint16(26, nameBytes.length, true)
    dv.setUint16(28, 0, true) // extra len
    parts.push(header, nameBytes, dataBytes)

    const ch = new Uint8Array(46)
    const cdv = new DataView(ch.buffer)
    cdv.setUint32(0, 0x02014b50, true)
    cdv.setUint16(4, 20, true)
    cdv.setUint16(6, 20, true)
    cdv.setUint16(8, 0x0800, true)
    cdv.setUint16(10, 0, true)
    cdv.setUint16(12, dosTime, true)
    cdv.setUint16(14, dosDate, true)
    cdv.setUint32(16, crc, true)
    cdv.setUint32(20, dataBytes.length, true)
    cdv.setUint32(24, dataBytes.length, true)
    cdv.setUint16(28, nameBytes.length, true)
    cdv.setUint32(42, offset, true) // local header offset
    central.push(ch, nameBytes)
    offset += header.length + nameBytes.length + dataBytes.length
  }

  const centralSize = central.reduce((a, b) => a + b.length, 0)
  const eocd = new Uint8Array(22)
  const edv = new DataView(eocd.buffer)
  edv.setUint32(0, 0x06054b50, true)
  edv.setUint16(8, files.length, true)
  edv.setUint16(10, files.length, true)
  edv.setUint32(12, centralSize, true)
  edv.setUint32(16, offset, true)
  parts.push(...central, eocd)
  return new Blob(parts, { type: 'application/zip' })
}

function downloadZip() {
  if (results.value.length === 0) return
  const files = results.value.map(r => ({ name: r.name, data: dataUrlToUint8(r.dataUrl) }))
  downloadBlob(buildZip(files), 'app-icon.zip')
}
</script>

<style scoped>
.aig { max-width: 980px; margin: 0 auto; padding: 24px 16px 40px; font-family: -apple-system, 'Segoe UI', 'Microsoft YaHei', sans-serif; }
.aig-header h2 { margin: 0 0 4px; }
.aig-sub { margin: 0 0 18px; color: #909399; font-size: 13px; }
.aig-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
@media (max-width: 860px) { .aig-layout { grid-template-columns: 1fr; } }
.aig-col { display: flex; flex-direction: column; gap: 16px; min-width: 0; }
.aig-card { background: #fff; border: 1px solid #e4e7ed; border-radius: 12px; padding: 14px 16px; box-shadow: 0 2px 10px rgba(0,0,0,0.04); }
.aig-card-title { font-weight: 700; font-size: 14px; margin-bottom: 12px; color: #303133; }

/* 上传 */
.aig-drop { border: 2px dashed #c0c4cc; border-radius: 12px; padding: 40px 16px; text-align: center; color: #606266; cursor: pointer; transition: all .2s; }
.aig-drop:hover { border-color: #409EFF; color: #409EFF; background: rgba(64,158,255,0.04); }
.aig-drop-icon { font-size: 40px; margin-bottom: 8px; }
.aig-drop-hint { font-size: 12px; color: #c0c4cc; margin-top: 6px; }

/* 预览 + 裁剪 */
.aig-preview-wrap { position: relative; width: 340px; height: 340px; margin: 0 auto; background: repeating-conic-gradient(#eee 0 25%, #fff 0 50%) 0 0/20px 20px; border-radius: 8px; overflow: hidden; user-select: none; touch-action: none; }
.aig-preview-img { position: absolute; left: 0; top: 0; width: 100%; height: 100%; object-fit: contain; pointer-events: none; }
.aig-crop { position: absolute; border: 2px solid #409EFF; box-shadow: 0 0 0 9999px rgba(0,0,0,0.45); cursor: move; }
.aig-crop-corner { position: absolute; width: 10px; height: 10px; background: #fff; border: 2px solid #409EFF; }
.aig-crop-nw { left: -6px; top: -6px; }
.aig-crop-ne { right: -6px; top: -6px; }
.aig-crop-sw { left: -6px; bottom: -6px; }
.aig-crop-se { right: -6px; bottom: -6px; cursor: nwse-resize; }
.aig-crop-size { position: absolute; left: 50%; bottom: -24px; transform: translateX(-50%); font-size: 11px; color: #409EFF; font-weight: 700; background: #fff; padding: 1px 6px; border-radius: 8px; border: 1px solid #409EFF; white-space: nowrap; }
.aig-preview-actions { display: flex; justify-content: center; gap: 8px; margin-top: 26px; }

/* 参数 */
.aig-param-row { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; flex-wrap: wrap; }
.aig-param-label { font-size: 13px; color: #909399; font-weight: 600; width: 90px; flex-shrink: 0; }
.aig-density-list { display: flex; gap: 6px; flex-wrap: wrap; }
.aig-density-chip { font-size: 11px; background: #f0f7ff; color: #409EFF; border: 1px solid #c6e2ff; padding: 2px 8px; border-radius: 10px; }
.aig-param-note { font-size: 12px; color: #909399; line-height: 1.6; background: #f8f9fb; border-radius: 8px; padding: 10px 12px; margin-bottom: 14px; }
.aig-gen-btn { width: 100%; }

/* 结果 */
.aig-res-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 12px; margin-bottom: 14px; }
.aig-res-item { text-align: center; }
.aig-res-frame { width: 100%; aspect-ratio: 1; border-radius: 12px; overflow: hidden; border: 1px solid #eee; background: #fff; display: flex; align-items: center; justify-content: center; }
.aig-res-frame img { width: 100%; height: 100%; object-fit: contain; }
.aig-res-name { font-size: 11px; color: #606266; margin-top: 4px; word-break: break-all; }
.aig-res-size { font-size: 10px; color: #c0c4cc; }
.aig-dl-row { display: flex; gap: 8px; flex-wrap: wrap; }

/* 规格表 */
.aig-spec { margin-top: 16px; }
.aig-spec-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.aig-spec-table th, .aig-spec-table td { border: 1px solid #e4e7ed; padding: 6px 10px; text-align: center; }
.aig-spec-table th { background: #f8f9fb; color: #606266; }
.aig-spec-d { font-family: 'JetBrains Mono', monospace; color: #409EFF; }
.aig-spec-note { font-size: 11px; color: #909399; margin-top: 8px; line-height: 1.6; }
</style>
