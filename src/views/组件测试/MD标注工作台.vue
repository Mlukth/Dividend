<template>
  <div class="mdwb">
    <!-- 顶栏 -->
    <header class="top">
      <h2>📝 MD标注工作台</h2>
      <span class="info" v-if="segs.length">{{ segs.length }}段 | AI标:{{ aiN }} | 人工:{{ huN }}</span>
      <div class="prog" v-if="busy">
        <div class="prog-fill" :style="{width:Math.round(prog.now/Math.max(prog.total,1)*100)+'%'}"></div>
        <span class="prog-text">{{ prog.now }}/{{ prog.total }} {{ prog.label }}</span>
      </div>
      <div class="acts">
        <input v-model="title" placeholder="文章标题" class="tlin" />
        <button class="btn ai" @click="analyze" :disabled="busy||!raw.trim()">🔍 AI分析(方案E)</button>
        <label class="pen" :class="{on:pen}"><input type="checkbox" v-model="pen"> 🖊 荧光笔</label>
        <button class="btn regen" :disabled="busy||huN===0" @click="regenerateMarks">🔄 生成标注({{ huN }})</button>
        <button class="btn ok" :disabled="busy||readyN===0" @click="ingestAll">📥 入库({{ readyN }})</button>
        <button class="btn toggle-left" v-if="segs.length" @click="showLeft = !showLeft">{{ showLeft ? '◀' : '▶' }}</button>
      </div>
    </header>

    <!-- 双栏 -->
    <div class="main">
      <div class="left" v-show="showLeft">
        <div class="ph">📄 Markdown原文</div>
        <textarea v-model="raw" placeholder="粘贴Markdown文章..." class="ta"></textarea>
      </div>

      <!-- 阅读视图 -->
      <div class="reader" ref="reader" @mouseup="onMouseUp">
        <div v-if="!raw.trim()" class="empty">← 粘贴MD文章，点AI分析</div>
        <div v-else-if="!segs.length" class="raw-text" v-html="md(raw)"></div>

        <div v-else class="article">
          <div
            v-for="(s, i) in segs" :key="s.id"
            :data-seg-id="s.id"
            :data-seg-idx="i"
            :class="['seg-block', segCls(s)]"
          >
            <!-- 段号 + 标题 -->
            <div class="seg-label">
              <span class="seg-num">{{ i + 1 }}</span>
              <span class="seg-heading" v-if="s.heading">{{ s.heading }}</span>
              <span class="seg-badge" v-if="s.userMarked">🖊 人工</span>
              <span class="seg-badge ai-badge" v-else-if="s.card && s.card.confidence >= 0.65">🤖 AI <button class="ai-clear" @click.stop="clearAiMark(s)" title="去掉AI标记">✕</button></span>
            </div>

            <!-- 荧光笔高亮原文 -->
            <div class="seg-body" @click="onSegClick(s, i, $event)" v-html="renderSegBody(s)"></div>

            <!-- 加载中 -->
            <div v-if="s.loading" class="seg-loading">⏳ 方案E生成中...</div>

            <!-- 内联卡片 -->
            <div v-if="s.expanded && s.card" class="icard" @click.stop>
              <div class="icard-head">
                <span class="iconf" :class="s.card.confidence>=0.9?'chi':s.card.confidence>=0.75?'cmd':'clo'">{{ Math.round((s.card.confidence||0)*100) }}%</span>
                <span class="icat">{{ s.card.classification }}</span>
              </div>
              <div class="icsum">{{ s.card.summary }}</div>
              <div v-if="s.card.highlight" class="ichl">💬 "{{ s.card.highlight }}"</div>
              <div v-if="s.card.warning" class="icwarn">⚠ {{ s.card.warning }}</div>
              <div class="ictags"><span v-for="t in s.card.tags" :key="t" class="ict">{{ t }}</span></div>
              <div class="icacts">
                <button @click.stop="reanalyzeSeg(s)" title="重新划定">🔄</button>
                <button @click.stop="ingestSeg(s)" title="入库">📥</button>
              </div>
            </div>

            <!-- 用户子标注 -->
            <div v-if="s.marks.length" class="marks">
              <div v-for="(m, mi) in s.marks" :key="m.id" class="mark" @click.stop="toggleMark(s, m)">
                <span class="mk-txt">"{{ m.text.slice(0,60) }}{{ m.text.length>60?'...':'' }}"</span>
                <span v-if="m.loading" class="mk-loading">⏳</span>
                <span v-else-if="m.card" class="mk-dot" :class="m.card.confidence>=0.9?'chi':m.card.confidence>=0.75?'cmd':'clo'">{{ Math.round((m.card.confidence||0)*100) }}%</span>
                <span v-else class="mk-dot dim">未生成</span>
                <div v-if="m.expanded && m.card" class="icard">
                  <div class="icard-head">
                    <span class="iconf" :class="m.card.confidence>=0.9?'chi':m.card.confidence>=0.75?'cmd':'clo'">{{ Math.round((m.card.confidence||0)*100) }}%</span>
                    <span class="icat">{{ m.card.classification }}</span>
                  </div>
                  <div class="icsum">{{ m.card.summary }}</div>
                  <div v-if="m.card.highlight" class="ichl">💬 "{{ m.card.highlight }}"</div>
                  <div v-if="m.card.warning" class="icwarn">⚠ {{ m.card.warning }}</div>
                  <div class="ictags"><span v-for="t in m.card.tags" :key="t" class="ict">{{ t }}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 荧光笔浮动工具栏 -->
    <div v-if="penTooltip.show" class="pentip" :style="{left:penTooltip.x+'px',top:penTooltip.y+'px'}" @click.stop>
      <button class="pentip-btn" @click="markSelection">🖊 标注选中文字</button>
      <button v-if="penTooltip.segHasAi" class="pentip-btn reduce" @click="reduceAiMark">📐 缩减AI范围到此</button>
    </div>

    <!-- 入库汇总弹窗 -->
    <div v-if="modal" class="mo" @click.self="modal=null">
      <div class="mc">
        <div class="mh"><h3>📥 入库 · {{ modal.new_chunks }}张卡片</h3></div>
        <div class="mb">
          <div v-for="c in modal.cards" :key="c.id" style="padding:8px 0;border-bottom:1px solid #f0f0f0">
            <span style="font-size:10px;font-weight:700" :style="{color:c.confidence>=0.9?'#16a34a':c.confidence>=0.75?'#ca8a04':'#dc2626'}">{{ Math.round(c.confidence*100) }}%</span>
            <span style="font-size:10px;color:#888;margin-left:6px">{{ c.classification }}</span>
            <div style="font-size:12px;color:#333;margin-top:2px">{{ c.summary?.slice(0,80) }}</div>
          </div>
        </div>
        <div class="mf"><span style="font-size:11px;color:#999">总计 {{ modal.total }} 条</span><button class="mfc" @click="modal=null">关闭</button></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, nextTick } from 'vue'
const API = 'http://localhost:8765'

const raw = ref(''), title = ref(''), segs = ref([]), busy = ref(false), pen = ref(false), showLeft = ref(true)
const modal = ref(null)
const reader = ref(null)
const prog = reactive({ now: 0, total: 0, label: '' })
const penTooltip = reactive({ show: false, x: 0, y: 0, selText: '', segIdx: -1, segHasAi: false })

let idCounter = 0
function uid() { return 's' + (++idCounter) }

// 统计
const aiN = computed(() => segs.value.filter(s => s.card && !s.userMarked).length)
const huN = computed(() => segs.value.filter(s => s.userMarked || s.marks.length).length)
const readyN = computed(() => segs.value.filter(s => s.card || s.userMarked).length)

// Markdown渲染
function md(t) {
  if (!t) return ''
  return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>')
}

// 渲染段落原文 + 荧光笔高亮（子标注文字在原文中高亮）
function renderSegBody(s) {
  if (!s.marks || !s.marks.length) return md(s.text)
  // 收集所有标记区间 [start, end]
  const ranges = []
  for (const m of s.marks) {
    if (!m.text || m.text.length < 2) continue
    let idx = s.text.indexOf(m.text)
    // 处理可能的重复文本：优先找未被覆盖的位置
    while (idx !== -1) {
      const overlap = ranges.some(r => idx < r.end && idx + m.text.length > r.start)
      if (!overlap) { ranges.push({ start: idx, end: idx + m.text.length }); break }
      idx = s.text.indexOf(m.text, idx + 1)
    }
  }
  if (!ranges.length) return md(s.text)
  ranges.sort((a, b) => a.start - b.start)
  // 合并重叠区间
  const merged = []
  for (const r of ranges) {
    if (merged.length && r.start <= merged[merged.length-1].end) {
      merged[merged.length-1].end = Math.max(merged[merged.length-1].end, r.end)
    } else { merged.push({ ...r }) }
  }
  // 拼接HTML
  let html = '', pos = 0
  for (const r of merged) {
    if (r.start > pos) html += md(s.text.slice(pos, r.start))
    html += '<mark class="user-hl">' + md(s.text.slice(r.start, r.end)) + '</mark>'
    pos = r.end
  }
  if (pos < s.text.length) html += md(s.text.slice(pos))
  return html
}

// 段落样式（真荧光笔）
function segCls(s) {
  if (s.userMarked) return 'hl-yellow'
  if (s.card && (s.card.confidence || 0) >= 0.65) return 'hl-orange'
  if (s.card && (s.card.confidence || 0) < 0.5) return 'hl-fade'
  if (!s.card) return 'hl-none'
  return 'hl-none'
}

// 点击段落：展开/收起卡片（荧光笔模式=标记段落）
function onSegClick(s, i, e) {
  if (pen.value) { s.userMarked = !s.userMarked; return }
  s.expanded = !s.expanded
}

// 荧光笔选区
function onMouseUp(e) {
  if (!pen.value || busy.value) { penTooltip.show = false; return }
  setTimeout(() => {
    const sel = window.getSelection()
    if (!sel || !sel.rangeCount || sel.isCollapsed) { penTooltip.show = false; return }
    const text = sel.toString().trim()
    if (!text || text.length < 5) { penTooltip.show = false; return }

    // 找到选区所属的段落
    const anchor = sel.anchorNode
    let segEl = anchor.nodeType === 3 ? anchor.parentElement : anchor
    while (segEl && segEl !== reader.value) {
      if (segEl.dataset.segIdx !== undefined) break
      segEl = segEl.parentElement
    }
    const segIdx = segEl && segEl.dataset.segIdx !== undefined ? parseInt(segEl.dataset.segIdx) : -1
    if (segIdx < 0) { penTooltip.show = false; return }

    // 定位浮动工具栏
    const range = sel.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    const parentRect = reader.value.getBoundingClientRect()
    penTooltip.show = true
    penTooltip.x = rect.left - parentRect.left + reader.value.scrollLeft + rect.width / 2 - 50
    penTooltip.y = rect.bottom - parentRect.top + reader.value.scrollTop + 6
    penTooltip.selText = text
    penTooltip.segIdx = segIdx
    penTooltip.segHasAi = !!(segs.value[segIdx] && segs.value[segIdx].card && !segs.value[segIdx].userMarked)
  }, 10)
}

// 荧光笔标注选中文字
async function markSelection() {
  const { selText, segIdx } = penTooltip
  penTooltip.show = false
  window.getSelection().removeAllRanges()
  if (segIdx < 0 || !segs.value[segIdx]) return

  const seg = segs.value[segIdx]
  // 创建子标注
  const mark = { id: uid(), text: selText, card: null, loading: true, expanded: false }
  seg.marks.push(mark)
  if (!seg.userMarked) seg.userMarked = true

  try {
    const r = await fetch(API + '/preview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: selText }) })
    const d = await r.json()
    if (d.ok) mark.card = d.card
  } catch (e) { console.error('标注失败', e) }
  mark.loading = false
}

// 去掉AI标记
function clearAiMark(s) { s.card = null; s.expanded = false }

// 缩减AI范围：只保留选中部分，去掉整段AI标记
async function reduceAiMark() {
  const { selText, segIdx } = penTooltip
  penTooltip.show = false
  window.getSelection().removeAllRanges()
  const seg = segs.value[segIdx]
  if (!seg) return
  // 去掉AI标记
  seg.card = null
  // 为选中文字创建人工标注
  const mark = { id: uid(), text: selText, card: null, loading: true, expanded: false }
  seg.marks.push(mark)
  seg.userMarked = true
  try {
    const r = await fetch(API + '/preview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: selText }) })
    const d = await r.json()
    if (d.ok) mark.card = d.card
  } catch (e) { console.error('缩减标注失败', e) }
  mark.loading = false
}

// 切换子标注卡片
function toggleMark(seg, mark) {
  mark.expanded = !mark.expanded
}

// === 核心：AI分析（/split用已有管道切段 → 逐段/preview方案E → 进度条）===
async function analyze() {
  if (!raw.value.trim()) return
  busy.value = true
  segs.value = []
  window.getSelection().removeAllRanges()

  try {
    // 1. 预处理：调已有 cleanArticle+splitParagraphs 管道（秒返）
    prog.total = 0; prog.now = 0; prog.label = '预处理切段中...'
    const r1 = await fetch(API + '/split', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: raw.value })
    })
    const d1 = await r1.json()
    if (!d1.ok || !d1.paragraphs?.length) { prog.label = '未找到有效段落'; busy.value = false; return }

    const paras = d1.paragraphs
    prog.total = paras.length
    prog.label = '方案E标注中'

    // 2. 创建段落（初始空白卡片）
    for (const p of paras) {
      segs.value.push({
        id: uid(), text: p.text, heading: p.heading || '',
        card: null, loading: true, expanded: false, userMarked: false, marks: []
      })
    }

    // 3. 逐段调方案E（自然进度条）
    for (let i = 0; i < segs.value.length; i++) {
      const s = segs.value[i]
      prog.now = i + 1
      try {
        const r2 = await fetch(API + '/preview', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: s.text })
        })
        const d2 = await r2.json()
        if (d2.ok) s.card = d2.card
      } catch (e) { console.error(`段${i}失败:`, e.message) }
      s.loading = false
    }
    showLeft.value = false  // 分析完自动折叠左栏
    prog.label = `完成 · ${segs.value.filter(s => s.card).length}张卡片`
  } catch (e) {
    console.error('分析失败:', e.message)
    prog.label = '失败: ' + e.message
  }
  busy.value = false
}

// 重新生成单段
async function reanalyzeSeg(s) {
  s.loading = true; s.card = null
  try {
    const r = await fetch(API + '/preview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: s.text }) })
    const d = await r.json()
    if (d.ok) s.card = d.card
  } catch (e) { console.error(e) }
  s.loading = false
}

// 批量重新生成用户标记的段
async function regenerateMarks() {
  busy.value = true
  const targets = []
  for (const s of segs.value) {
    if (s.userMarked) targets.push(s)
    for (const m of s.marks) { targets.push(m); m.card = null; m.loading = true }
  }
  prog.total = targets.length; prog.now = 0; prog.label = '重新生成'
  for (const t of targets) {
    prog.now++
    t.loading = true
    try {
      const r = await fetch(API + '/preview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: t.text }) })
      const d = await r.json()
      if (d.ok) t.card = d.card
    } catch (e) { console.error(e) }
    t.loading = false
  }
  prog.label = '完成'
  busy.value = false
}

// 入库单段
async function ingestSeg(s) {
  if (!s.text || !s.card) return; busy.value = true
  try {
    const r = await fetch(API + '/ingest', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: s.text, title: title.value || '手动标注', date: new Date().toISOString().split('T')[0] }) })
    const d = await r.json()
    if (d.ok) { modal.value = d; segs.value = segs.value.filter(x => x.id !== s.id) }
  } catch (e) { alert('入库失败') }
  busy.value = false
}

// 入库全部
async function ingestAll() {
  const ti = segs.value.filter(s => s.card || s.userMarked)
  if (!ti.length) return; busy.value = true
  try {
    const combined = ti.map(s => s.text).join('\n\n')
    const r = await fetch(API + '/ingest', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: combined, title: title.value || '手动标注', date: new Date().toISOString().split('T')[0] }) })
    const d = await r.json()
    if (d.ok) { modal.value = d; segs.value = segs.value.filter(s => !(s.card || s.userMarked)) }
  } catch (e) { alert('入库失败') }
  busy.value = false
}
</script>

<style scoped>
.mdwb { font-family:"PingFang SC","Microsoft YaHei",sans-serif; height:100vh; display:flex; flex-direction:column; background:#f5f0eb }

/* 顶栏 */
.top { background:#1e293b; color:#fff; padding:8px 16px; display:flex; align-items:center; gap:10px; flex-wrap:wrap }
.top h2 { margin:0; font-size:15px }
.info { font-size:11px; opacity:.8; white-space:nowrap }
.acts { display:flex; gap:6px; margin-left:auto; align-items:center }
.tlin { padding:5px 10px; border-radius:4px; border:1px solid rgba(255,255,255,.15); background:rgba(255,255,255,.08); color:#fff; font-size:12px; width:130px }
.tlin::placeholder { color:rgba(255,255,255,.3) }
.btn { padding:5px 12px; border-radius:6px; border:0; cursor:pointer; font-size:11px; font-weight:600; white-space:nowrap }
.btn:disabled { opacity:.35; cursor:not-allowed }
.btn.ai { background:#f59e0b; color:#1e293b }
.btn.regen { background:#8b5cf6; color:#fff }
.btn.ok { background:#10b981; color:#fff }
.btn.toggle-left { background:rgba(255,255,255,.1); color:#fff; font-size:14px; padding:5px 10px }
.pen { font-size:11px; color:#94a3b8; cursor:pointer; display:flex; align-items:center; gap:3px; padding:4px 8px; border-radius:6px; white-space:nowrap }
.pen.on { background:rgba(234,179,8,.2); color:#eab308 }

/* 进度条 */
.prog { display:flex; align-items:center; gap:6px; background:rgba(255,255,255,.08); border-radius:10px; padding:3px 10px; min-width:200px }
.prog-fill { height:4px; background:#10b981; border-radius:2px; transition:width .3s }
.prog-text { font-size:10px; color:#94a3b8; white-space:nowrap }

/* 双栏 */
.main { display:flex; flex:1; overflow:hidden }
.left { width:340px; flex-shrink:0; display:flex; flex-direction:column; border-right:2px solid #ddd }
.ph { padding:8px 14px; background:#fff; font-size:12px; font-weight:600; border-bottom:1px solid #e5e7eb }
.ta { flex:1; padding:14px; border:0; resize:none; font-family:inherit; font-size:13px; line-height:1.8; outline:none }

/* 阅读区 */
.reader { flex:1; overflow-y:auto; padding:24px 40px; position:relative }
.empty { text-align:center; color:#ccc; padding-top:80px; font-size:13px }
.raw-text { font-size:15px; line-height:2; color:#333 }

/* 段落卡片 */
.article { font-size:15px; line-height:2; color:#333; display:flex; flex-direction:column; gap:16px }
.seg-block { border-radius:10px; padding:14px 18px; position:relative; transition:all .2s }
.seg-block:hover { box-shadow:0 2px 12px rgba(0,0,0,.06) }

/* 荧光笔底色 */
.hl-orange { background:linear-gradient(135deg,#fff7ed,#fff1e0); border:1px solid #fcd49a }
.hl-yellow { background:linear-gradient(135deg,#fefce8,#fef9c3); border:1px solid #fde68a }
.hl-fade { opacity:.4; background:#f8f8f8; border:1px dashed #e0e0e0 }
.hl-none { background:#fff; border:1px solid #eee }

/* 段号+标题 */
.seg-label { display:flex; align-items:center; gap:8px; margin-bottom:10px }
.seg-num { display:inline-flex; align-items:center; justify-content:center; width:24px; height:24px; border-radius:50%; background:#e5e7eb; color:#666; font-size:11px; font-weight:700; flex-shrink:0 }
.seg-heading { font-size:13px; font-weight:700; color:#374151 }
.seg-badge { font-size:10px; padding:2px 8px; border-radius:10px; font-weight:600 }
.ai-badge { background:#fff7ed; color:#c2410c }
.ai-clear { margin-left:4px; padding:0 4px; border:0; background:none; color:#c2410c; cursor:pointer; font-size:12px; line-height:1; opacity:.6 }
.ai-clear:hover { opacity:1; color:#dc2626 }
.seg-badge:not(.ai-badge) { background:#fef9c3; color:#a16207 }

/* 段落原文 */
.seg-body { cursor:pointer; padding:6px 4px; border-radius:4px; transition:background .15s }
.seg-body:hover { background:rgba(0,0,0,.03) }
.seg-body :deep(strong) { color:#1e3a5f }
.seg-body :deep(em) { color:#666 }
.seg-body :deep(mark.user-hl) { background:#fde68a; border-radius:2px; padding:1px 2px; color:inherit }
.seg-loading { font-size:11px; color:#f59e0b; padding:4px 0 }

/* 内联卡片 */
.icard { margin:6px 0 6px 8px; padding:10px 14px; background:#fff; border-radius:8px; border:1px solid #e5e7eb; box-shadow:0 2px 8px rgba(0,0,0,.06); font-size:13px; line-height:1.6 }
.icard-head { display:flex; align-items:center; gap:8px; margin-bottom:6px }
.iconf { font-size:11px; font-weight:700; padding:1px 6px; border-radius:4px }
.chi { color:#16a34a }
.cmd { color:#ca8a04 }
.clo { color:#dc2626 }
.icat { font-size:11px; color:#888 }
.icsum { color:#1e3a5f; margin-bottom:4px }
.ichl { font-size:11px; color:#7c3aed; font-style:italic; padding:2px 6px; background:#f5f3ff; border-radius:3px; margin:3px 0 }
.icwarn { font-size:11px; color:#d97706; padding:3px 6px; background:#fffbeb; border-left:2px solid #f59e0b; border-radius:3px; margin:3px 0 }
.ictags { display:flex; gap:3px; margin-top:4px; flex-wrap:wrap }
.ict { font-size:9px; padding:1px 6px; background:#eef2ff; color:#4f6ef7; border-radius:8px }
.icacts { display:flex; gap:4px; margin-top:6px; justify-content:flex-end }
.icacts button { padding:3px 8px; border:1px solid #ddd; border-radius:4px; background:#fff; cursor:pointer; font-size:11px }
.icacts button:hover { background:#f0f0f0 }

/* 用户子标注 */
.marks { margin-left:16px }
.mark { display:flex; align-items:center; gap:6px; padding:4px 8px; margin:3px 0; border-radius:4px; cursor:pointer; background:rgba(234,179,8,.06); border-left:2px solid #eab308; font-size:12px }
.mark:hover { background:rgba(234,179,8,.12) }
.mk-txt { color:#92400e; flex:1; font-style:italic }
.mk-loading { font-size:11px; color:#f59e0b }
.mk-dot { font-size:10px; font-weight:700; padding:1px 5px; border-radius:3px }
.mk-dot.dim { color:#bbb }

/* 荧光笔浮动工具栏 */
.pentip { position:absolute; z-index:100; background:#1e293b; border-radius:8px; padding:4px; box-shadow:0 4px 16px rgba(0,0,0,.25) }
.pentip-btn { padding:6px 14px; border:0; border-radius:6px; cursor:pointer; font-size:12px; background:#eab308; color:#1e293b; font-weight:600; white-space:nowrap }
.pentip-btn:hover { background:#fbbf24 }
.pentip-btn.reduce { background:#f87171; color:#fff; margin-left:4px }
.pentip-btn.reduce:hover { background:#ef4444 }

/* 弹窗 */
.mo { position:fixed; inset:0; background:rgba(0,0,0,.4); z-index:999; display:flex; align-items:center; justify-content:center }
.mc { background:#fff; border-radius:14px; min-width:380px; max-width:520px; max-height:80vh; display:flex; flex-direction:column; box-shadow:0 16px 48px rgba(0,0,0,.2) }
.mh { display:flex; justify-content:space-between; align-items:center; padding:14px 18px; border-bottom:1px solid #f0f0f0 }
.mh h3 { margin:0; font-size:15px }
.mb { flex:1; overflow-y:auto; padding:14px 18px; max-height:50vh }
.mf { display:flex; justify-content:flex-end; gap:6px; padding:10px 18px; border-top:1px solid #f0f0f0 }
.mfc { padding:5px 14px; border:0; border-radius:6px; cursor:pointer; font-size:12px; background:#e5e7eb; color:#333 }
</style>
