<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import * as echarts from 'echarts'
import { ElMessage, ElMessageBox } from 'element-plus'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

// ==================== 常量 ====================
const AMAP_KEY = 'fb15db372d4132c1e6aa041f8a9481fa'
const GEOJSON_URL = 'https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json'
const STORAGE_KEY = 'colleges_data'

// ==================== 状态 ====================
const mapContainer = ref(null)
const drawerVisible = ref(false)
const formVisible = ref(false)
const detailVisible = ref(false)
const currentStep = ref(1)
const editMode = ref('create')
const editingId = ref(null)
const proofLink = ref('')
const proofFieldBind = ref('')
const filterKeyword = ref('')
const viewingCollege = ref(null)

const drawerProvince = ref('')
const contextMenu = reactive({ visible: false, x: 0, y: 0, province: '', collegeCount: 0 })

const colleges = ref([])
const proofFiles = ref([])

// 浮窗系统（塔科夫式多窗口对比）
const floatingWindows = reactive([])
let globalZIndex = 10
let dragTarget = null
let dragOffX = 0
let dragOffY = 0

function openFloatingWindow(college) {
  // 已打开则提到最前并取消最小化
  const exist = floatingWindows.find(w => w.id === college.id)
  if (exist) {
    exist.minimized = false
    exist.z = ++globalZIndex
    return
  }
  floatingWindows.push({
    id: college.id,
    college,
    x: 60 + (floatingWindows.length % 5) * 40,
    y: 60 + (floatingWindows.length % 5) * 30,
    w: 380,
    minimized: false,
    z: ++globalZIndex
  })
}

function closeFloatingWindow(id) {
  const idx = floatingWindows.findIndex(w => w.id === id)
  if (idx > -1) floatingWindows.splice(idx, 1)
}

function minimizeWindow(id) {
  const w = floatingWindows.find(w => w.id === id)
  if (w) w.minimized = !w.minimized
}

function bringToFront(id) {
  const w = floatingWindows.find(w => w.id === id)
  if (w) w.z = ++globalZIndex
}

function startDrag(e, id) {
  const w = floatingWindows.find(w => w.id === id)
  if (!w) return
  bringToFront(id)
  dragTarget = w
  dragOffX = e.clientX - w.x
  dragOffY = e.clientY - w.y
  document.addEventListener('pointermove', onDrag)
  document.addEventListener('pointerup', stopDrag)
}

function onDrag(e) {
  if (!dragTarget) return
  dragTarget.x = Math.max(0, Math.min(window.innerWidth - 100, e.clientX - dragOffX))
  dragTarget.y = Math.max(0, Math.min(window.innerHeight - 60, e.clientY - dragOffY))
}

function stopDrag() {
  dragTarget = null
  document.removeEventListener('pointermove', onDrag)
  document.removeEventListener('pointerup', stopDrag)
}

const presetTags = ['冲刺', '稳妥', '保底', '自命题', '统考', '已联系导师', '已发邮件', '未联系']

const form = reactive({
  name: '', province: '', city: '', major: '', direction: '',
  tags: [], subjects: '', scoreLine: '', ratio: '', tuition: '', remark: '',
  tutorInfo: '', interviewStyle: '', discrimination: '', dormitory: '',
  groupAtmosphere: '', subjective: '',
  coords: null,
  photo: null,
  proofs: []
})

// ==================== File System Access API ====================
const fsaSupported = ref('showDirectoryPicker' in window)
let directoryHandle = null

async function selectProofFolder() {
  try {
    directoryHandle = await window.showDirectoryPicker({ mode: 'readwrite' })
    ElMessage.success(`已选择文件夹：${directoryHandle.name}`)
  } catch (e) {
    if (e.name !== 'AbortError') ElMessage.error('文件夹选择失败')
  }
}

async function saveProofToFS(fileEntry) {
  if (!directoryHandle) return
  try {
    const fileName = `proof_${Date.now()}_${fileEntry.label.replace(/[\\/:*?"<>|]/g, '_')}`
    const fileHandle = await directoryHandle.getFileHandle(fileName, { create: true })
    const writable = await fileHandle.createWritable()
    await writable.write(fileEntry.data instanceof File ? fileEntry.data : new Blob([fileEntry.data]))
    await writable.close()
    fileEntry.fsPath = fileName
    return true
  } catch (e) {
    console.error('FSA write failed:', e)
    return false
  }
}

const allKnownTags = computed(() => {
  const set = new Set(presetTags)
  colleges.value.forEach(c => c.tags?.forEach(t => set.add(t)))
  return [...set]
})

// ==================== 筛选 ====================
const filteredColleges = computed(() => {
  if (!filterKeyword.value) return colleges.value
  const kw = filterKeyword.value.toLowerCase()
  return colleges.value.filter(c =>
    c.name.includes(kw) || c.province.includes(kw) || c.city.includes(kw) ||
    c.major.includes(kw) || c.direction.includes(kw) ||
    c.tags.some(t => t.includes(kw)) || c.subjects.includes(kw)
  )
})

const filteredStats = computed(() => {
  const map = {}
  filteredColleges.value.forEach(c => {
    if (!map[c.province]) map[c.province] = 0
    map[c.province]++
  })
  return map
})

const provinceStats = computed(() => {
  const map = {}
  colleges.value.forEach(c => {
    if (!map[c.province]) map[c.province] = 0
    map[c.province]++
  })
  return map
})

const drawerColleges = computed(() =>
  colleges.value.filter(c => c.province === drawerProvince.value)
)

const drawerTitle = computed(() =>
  `${drawerProvince.value} · 已记录 ${drawerColleges.value.length} 所院校`
)

const collegesWithCoords = computed(() =>
  colleges.value.filter(c => c.coords && c.coords[0] && c.coords[1])
)

const viewingCompleteness = computed(() => {
  if (!viewingCollege.value) return 0
  const c = viewingCollege.value
  const fields = ['name', 'province', 'city', 'major', 'direction', 'subjects', 'scoreLine', 'ratio', 'tuition', 'tutorInfo', 'interviewStyle', 'discrimination', 'dormitory', 'groupAtmosphere']
  const filled = fields.filter(f => c[f] && String(c[f]).trim()).length
  const bonus = (c.tags?.length > 0 ? 1 : 0) + (c.proofs?.length > 0 ? 1 : 0) + (c.photo ? 1 : 0)
  return Math.min(100, Math.round(((filled + bonus) / (fields.length + 3)) * 100))
})

const completeness = computed(() => {
  const fields = ['name', 'province', 'city', 'major', 'direction', 'subjects', 'scoreLine', 'ratio', 'tuition', 'tutorInfo', 'interviewStyle', 'discrimination', 'dormitory', 'groupAtmosphere']
  const filled = fields.filter(f => form[f] && String(form[f]).trim()).length
  const bonus = form.tags.length > 0 ? 1 : 0
  const proofBonus = form.proofs.length > 0 ? 1 : 0
  const photoBonus = form.photo ? 1 : 0
  return Math.min(100, Math.round(((filled + bonus + proofBonus + photoBonus) / (fields.length + 3)) * 100))
})

const completenessLabel = (pct) => {
  if (pct >= 80) return '完整'
  if (pct >= 50) return '过半'
  if (pct >= 20) return '起步'
  return '待填'
}

// ==================== 存储 ====================
function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    colleges.value = raw ? JSON.parse(raw) : []
  } catch { colleges.value = [] }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(colleges.value))
}

// ==================== 地图 ====================
let chart = null

function getCollegeNames(province) {
  return colleges.value
    .filter(c => c.province === province)
    .map(c => c.name)
}

function findCollegeByName(name) {
  return colleges.value.find(c => c.name === name)
}

async function initMap() {
  if (!mapContainer.value) return

  let geoJson
  try {
    const cached = localStorage.getItem('china_geojson')
    if (cached) {
      geoJson = JSON.parse(cached)
    } else {
      const res = await fetch(GEOJSON_URL)
      geoJson = await res.json()
      localStorage.setItem('china_geojson', JSON.stringify(geoJson))
    }
  } catch (e) {
    ElMessage.error('加载地图数据失败，请检查网络连接')
    return
  }

  echarts.registerMap('china', geoJson)
  chart = echarts.init(mapContainer.value)

  const render = () => {
    const stats = filteredStats.value
    const data = Object.entries(stats).map(([name, value]) => ({ name, value }))
    const points = collegesWithCoords.value.map(c => ({
      name: c.name,
      value: [parseFloat(c.coords[0]), parseFloat(c.coords[1]), c]
    }))

    chart.setOption({
      tooltip: {
        trigger: 'item',
        formatter: p => {
          if (!p.name) return ''
          // 散点系列用专属 tooltip
          if (p.seriesType === 'scatter') {
            const c = p.value?.[2]
            if (!c) return p.name
            return `<b>${c.name}</b><br/>${c.province} ${c.city || ''}<br/>${c.major || ''} ${c.direction || ''}<br/>标签: ${c.tags?.join(' / ') || '无'}<br/><span style="color:#94a3b8;font-size:11px;">点击查看详情</span>`
          }
          const names = getCollegeNames(p.name)
          if (!names.length) return `${p.name}<br/>暂无已记录院校`
          return `<b>${p.name}</b> · ${names.length} 所<br/>${names.map(n => `&bull; ${n}`).join('<br/>')}`
        }
      },
      visualMap: {
        min: 0,
        max: Math.max(5, ...data.map(d => d.value)),
        inRange: { color: ['#f0f9ff', '#bae6fd', '#7dd3fc', '#38bdf8', '#0ea5e9'] },
        show: false
      },
      geo: {
        map: 'china', roam: true, zoom: 1.2,
        label: { show: false },
        itemStyle: { borderColor: '#cbd5e1', borderWidth: 1, areaColor: '#f8fafc' },
        emphasis: { label: { show: true, color: '#1e293b', fontWeight: 'bold' }, itemStyle: { areaColor: '#e0f2fe' } }
      },
      series: [
        {
          type: 'map', map: 'china', geoIndex: 0, roam: true, zoom: 1.2,
          label: {
            show: true, color: '#64748b', fontSize: 10,
            formatter: p => { const cnt = stats[p.name]; return cnt ? `${p.name} ${cnt}` : '' }
          },
          itemStyle: { borderColor: '#cbd5e1', borderWidth: 1, areaColor: '#f8fafc' },
          emphasis: { label: { color: '#1e293b', fontWeight: 'bold', fontSize: 12 }, itemStyle: { areaColor: '#e0f2fe' } },
          data
        },
        ...(points.length > 0 ? [{
          type: 'scatter', coordinateSystem: 'geo', geoIndex: 0,
          symbol: 'pin', symbolSize: 28,
          itemStyle: { color: '#0ea5e9' },
          label: { show: true, formatter: p => p.name, position: 'right', fontSize: 10, color: '#1e293b' },
          emphasis: { scale: 1.4, itemStyle: { color: '#0284c7' } },
          data: points
        }] : [])
      ]
    })
  }

  render()

  // 右键菜单 — 阻止浏览器原生菜单
  chart.on('contextmenu', params => {
    params.event.event.preventDefault()
    if (params.name) {
      const count = provinceStats.value[params.name] || 0
      contextMenu.province = params.name
      contextMenu.collegeCount = count
      contextMenu.x = params.event.event.clientX
      contextMenu.y = params.event.event.clientY
      contextMenu.visible = true
    }
  })

  // 左键点击 — 散点跳转详情，否则关闭右键菜单
  chart.on('click', params => {
    contextMenu.visible = false
    // 点击的是散点 → 打开对应院校的简历视图
    if (params.seriesType === 'scatter' && params.value) {
      const college = params.value[2]
      if (college) {
        openFloatingWindow(college)
      }
    }
  })

  watch(colleges, () => { saveData(); render() }, { deep: true })
  watch(filterKeyword, render)
}

// ==================== 右键菜单 ====================
function addCollegeInProvince(province) {
  contextMenu.visible = false
  resetForm()
  form.province = province
  editMode.value = 'create'
  formVisible.value = true
}

function openProvinceList(province) {
  contextMenu.visible = false
  drawerProvince.value = province
  drawerVisible.value = true
}

function openAddDialog() {
  resetForm()
  editMode.value = 'create'
  formVisible.value = true
}

// ==================== 简历视图 ====================
function openDetailView(college) {
  viewingCollege.value = college
  detailVisible.value = true
}

function goEditFromDetail() {
  const college = viewingCollege.value
  detailVisible.value = false
  if (college) editCollege(college)
}

function goDeleteFromDetail() {
  const college = viewingCollege.value
  detailVisible.value = false
  if (college) deleteCollege(college)
}

// ==================== 照片处理 ====================
function handlePhotoUpload(uploadFile) {
  const file = uploadFile.raw
  if (!file || !file.type.startsWith('image/')) {
    ElMessage.warning('请选择图片文件')
    return
  }
  const reader = new FileReader()
  reader.onload = (e) => {
    form.photo = e.target.result
  }
  reader.readAsDataURL(file)
}

function removePhoto() {
  form.photo = null
}

// ==================== 表单操作 ====================
function resetForm() {
  currentStep.value = 1
  editingId.value = null
  proofLink.value = ''
  proofFieldBind.value = ''
  proofFiles.value = []
  Object.assign(form, {
    name: '', province: '', city: '', major: '', direction: '',
    tags: [], subjects: '', scoreLine: '', ratio: '', tuition: '', remark: '',
    tutorInfo: '', interviewStyle: '', discrimination: '', dormitory: '',
    groupAtmosphere: '', subjective: '',
    coords: null, photo: null, proofs: []
  })
}

function editCollege(college) {
  resetForm()
  editMode.value = 'edit'
  editingId.value = college.id
  Object.assign(form, {
    name: college.name, province: college.province, city: college.city || '',
    major: college.major || '', direction: college.direction || '',
    tags: [...(college.tags || [])],
    subjects: college.subjects || '', scoreLine: college.scoreLine || '',
    ratio: college.ratio || '', tuition: college.tuition || '',
    remark: college.remark || '',
    tutorInfo: college.tutorInfo || '', interviewStyle: college.interviewStyle || '',
    discrimination: college.discrimination || '', dormitory: college.dormitory || '',
    groupAtmosphere: college.groupAtmosphere || '',
    subjective: college.subjective || '',
    coords: college.coords ? [...college.coords] : null,
    photo: college.photo || null,
    proofs: (college.proofs || []).map(p => ({ ...p }))
  })
  formVisible.value = true
}

async function saveCollege() {
  if (!form.name || !form.province) {
    ElMessage.warning('请至少填写院校名称和所在省')
    return
  }

  if (directoryHandle) {
    for (const p of form.proofs) {
      if (p.type === 'file' && p.data instanceof File) {
        await saveProofToFS(p)
      }
    }
  }

  const entry = {
    id: editingId.value || String(Date.now()),
    name: form.name, province: form.province, city: form.city,
    coords: form.coords || null,
    photo: form.photo || null,
    major: form.major, direction: form.direction,
    tags: [...form.tags],
    subjects: form.subjects, scoreLine: form.scoreLine,
    ratio: form.ratio, tuition: form.tuition, remark: form.remark,
    tutorInfo: form.tutorInfo, interviewStyle: form.interviewStyle,
    discrimination: form.discrimination, dormitory: form.dormitory,
    groupAtmosphere: form.groupAtmosphere, subjective: form.subjective,
    proofs: form.proofs.map(p => ({ type: p.type, label: p.label, data: p.data instanceof File ? p.label : p.data, field: p.field || '', fsPath: p.fsPath || '' }))
  }

  if (editMode.value === 'edit') {
    const idx = colleges.value.findIndex(c => c.id === editingId.value)
    if (idx > -1) colleges.value[idx] = entry
  } else {
    colleges.value.push(entry)
  }

  saveData()
  formVisible.value = false
  ElMessage.success(editMode.value === 'create' ? '已添加' : '已更新')
}

function deleteCollege(college) {
  ElMessageBox.confirm(
    `确认删除「${college.name}」？该操作不可恢复。`,
    '删除确认',
    { type: 'warning', confirmButtonText: '确认删除', cancelButtonText: '取消' }
  ).then(() => {
    colleges.value = colleges.value.filter(c => c.id !== college.id)
    saveData()
    drawerVisible.value = false
    ElMessage.success('已删除')
  }).catch(() => {})
}

// ==================== 证明材料 ====================
function handleProofFile(uploadFile) {
  const file = uploadFile.raw
  form.proofs.push({ type: 'file', label: file.name, data: file, field: proofFieldBind.value || '' })
}

function addProofLink() {
  if (!proofLink.value) return
  form.proofs.push({ type: 'link', label: proofLink.value, data: proofLink.value, field: proofFieldBind.value || '' })
  proofLink.value = ''
  proofFieldBind.value = ''
}

function removeProof(idx) {
  form.proofs.splice(idx, 1)
}

function checkLinkValidity(url) {
  ElMessage.info('链接存活检测功能预留 — 后续可接入检测 API 实现自动化扫描')
}

// ==================== 地理编码 ====================
async function autoLocate() {
  if (!form.name || !form.city) return
  try {
    const addr = encodeURIComponent(`${form.city}${form.name}`)
    const res = await fetch(`https://restapi.amap.com/v3/geocode/geo?key=${AMAP_KEY}&address=${addr}`)
    const json = await res.json()
    if (json.status === '1' && json.geocodes?.length) {
      const [lng, lat] = json.geocodes[0].location.split(',')
      const p = json.geocodes[0].province || ''
      form.coords = [lng, lat]
      if (p && form.province && !p.includes(form.province.replace(/[省市自治区]/g, ''))) {
        ElMessage.warning(`地理编码返回省份"${p}"与填写的"${form.province}"不一致，请核对`)
      }
    }
  } catch { /* 静默失败 */ }
}

// ==================== 导出/导入 ====================
function exportJSON() {
  const blob = new Blob([JSON.stringify(colleges.value, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `colleges_backup_${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  ElMessage.success('备份已导出')
}

function importJSON() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      if (!Array.isArray(data)) throw new Error()
      await ElMessageBox.confirm(
        `即将导入 ${data.length} 条记录，会覆盖当前数据。确认？`,
        '导入确认', { type: 'warning' }
      )
      colleges.value = data
      saveData()
      ElMessage.success(`已导入 ${data.length} 条记录`)
    } catch (e) {
      if (e !== 'cancel') ElMessage.error('文件格式不正确')
    }
  }
  input.click()
}

const pdfRenderArea = ref(null)

// 通过 html2canvas 渲染 HTML → 嵌入 PDF（解决中文字体问题）
async function htmlToPDF(html, fileName, orientation = 'p', format = 'a4') {
  if (!pdfRenderArea.value) return
  pdfRenderArea.value.innerHTML = html
  pdfRenderArea.value.style.display = 'block'
  await nextTick()
  await new Promise(r => setTimeout(r, 400))

  const canvas = await html2canvas(pdfRenderArea.value, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false
  })
  pdfRenderArea.value.style.display = 'none'
  pdfRenderArea.value.innerHTML = ''

  const doc = new jsPDF(orientation, 'mm', format)
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const marginX = 5
  const marginY = 3
  const imgW = pageW - marginX * 2
  const contentH = pageH - marginY * 2
  // 图片在 PDF 中的总高度（按比例缩放）
  const imgH = (canvas.height * imgW) / canvas.width
  // 图片在页面上的高度，对应的 canvas 源高度比例
  const scale = imgW / canvas.width

  let srcCanvasY = 0
  while (srcCanvasY < canvas.height) {
    if (srcCanvasY > 0) doc.addPage()
    // 本页对应的 canvas 像素高度（不超过剩余内容）
    const pageCanvasH = Math.min(canvas.height - srcCanvasY, Math.ceil(contentH / scale))
    // 切片 canvas
    const slice = document.createElement('canvas')
    slice.width = canvas.width
    slice.height = pageCanvasH
    const ctx = slice.getContext('2d')
    ctx.drawImage(canvas, 0, srcCanvasY, canvas.width, pageCanvasH, 0, 0, canvas.width, pageCanvasH)
    const sliceData = slice.toDataURL('image/png')
    const sliceH = pageCanvasH * scale
    doc.addImage(sliceData, 'PNG', marginX, marginY, imgW, sliceH)
    srcCanvasY += pageCanvasH
  }

  doc.save(fileName)
}

// 模式一：单校详细报告 PDF
async function exportSinglePDF(college) {
  if (!college) return
  const c = college

  const proofsHtml = (c.proofs || []).map(p => `
    <div class="pr-item">
      <span class="pr-icon">${p.type === 'file' ? '文件' : '链接'}</span>
      <span class="pr-label">${p.label}</span>
      ${p.field ? `<span class="pr-field">${p.field}</span>` : ''}
      ${p.type === 'link' ? `<a href="${p.data}" class="pr-link">${p.data}</a>` : ''}
    </div>
  `).join('')

  const section = (title, rows) => {
    const filled = rows.filter(([, v]) => v)
    if (!filled.length) return ''
    return `
      <div class="ps-section">
        <div class="ps-title">${title}</div>
        ${filled.map(([l, v]) => `<div class="ps-row"><span class="ps-label">${l}</span><span class="ps-value">${v}</span></div>`).join('')}
      </div>
    `
  }

  const html = `
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: system-ui, -apple-system, 'Microsoft YaHei', sans-serif; background: #fff; padding: 20px; width: 650px; color: #1e293b; }
      .ps-header { margin-bottom: 18px; }
      .ps-name { font-size: 26px; font-weight: 700; margin-bottom: 4px; }
      .ps-sub { font-size: 13px; color: #64748b; margin-bottom: 8px; }
      .ps-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
      .ps-tag { font-size: 11px; padding: 2px 8px; background: #e0f2fe; color: #0284c7; border-radius: 4px; }
      .ps-completeness { height: 4px; background: #e2e8f0; border-radius: 2px; margin-top: 10px; }
      .ps-completeness-fill { height: 100%; border-radius: 2px; }
      .ps-section { margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #f1f5f9; }
      .ps-title { font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; padding: 4px 8px; background: #f8fafc; border-radius: 4px; }
      .ps-row { display: flex; gap: 12px; margin-bottom: 6px; }
      .ps-label { font-size: 11px; color: #94a3b8; min-width: 80px; }
      .ps-value { font-size: 14px; color: #1e293b; flex: 1; white-space: pre-wrap; }
      .pr-item { display: flex; gap: 8px; align-items: center; margin-bottom: 6px; font-size: 12px; }
      .pr-icon { color: #0ea5e9; font-size: 11px; }
      .pr-label { flex: 1; color: #475569; }
      .pr-field { font-size: 10px; color: #94a3b8; background: #f1f5f9; padding: 1px 6px; border-radius: 3px; }
      .pr-link { color: #0ea5e9; font-size: 11px; max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .ps-footer { font-size: 10px; color: #cbd5e1; margin-top: 20px; text-align: right; }
    </style>
    <div class="ps-header">
      <div class="ps-name">${c.name}</div>
      <div class="ps-sub">${c.province}${c.city ? ' · ' + c.city : ''}  ${c.coords && c.coords[0] ? ' | ' + c.coords[0] + ', ' + c.coords[1] : ''}</div>
      <div class="ps-tags">${(c.tags || []).map(t => `<span class="ps-tag">${t}</span>`).join('')}</div>
    </div>
    ${section('基本信息', [['专业', c.major], ['方向', c.direction]])}
    ${section('考试信息', [['考试科目', c.subjects], ['分数线', c.scoreLine], ['报录比', c.ratio], ['学费/学制', c.tuition], ['备注', c.remark]])}
    ${section('软信息', [['导师信息', c.tutorInfo], ['复试风格', c.interviewStyle], ['歧视双非', c.discrimination], ['宿舍条件', c.dormitory], ['课题组氛围', c.groupAtmosphere], ['其他', c.subjective]])}
    ${(c.proofs || []).length ? `<div class="ps-section"><div class="ps-title">证明材料 (${c.proofs.length} 份)</div>${proofsHtml}</div>` : ''}
    <div class="ps-footer">导出时间: ${new Date().toLocaleString()}</div>
  `
  await htmlToPDF(html, `${c.name}_详细报告.pdf`)
  ElMessage.success('单校 PDF 已导出')
}

// 模式二：全局汇总总表 PDF
async function exportAllPDF() {
  if (!colleges.value.length) {
    ElMessage.warning('暂无院校数据可导出')
    return
  }

  const cols = [
    { k: 'name', title: '院校名称', w: 90 },
    { k: 'province', title: '省份', w: 40 },
    { k: 'city', title: '城市', w: 40 },
    { k: 'major', title: '专业', w: 70 },
    { k: 'direction', title: '方向', w: 70 },
    { k: 'tags', title: '标签', fmt: v => (v || []).join(' / '), w: 100 },
    { k: 'subjects', title: '考试科目', w: 120 },
    { k: 'scoreLine', title: '分数线', w: 50 },
    { k: 'ratio', title: '报录比', w: 50 },
    { k: 'tuition', title: '学费/学制', w: 70 },
    { k: 'tutorInfo', title: '导师信息', w: 100 },
    { k: 'discrimination', title: '歧视双非', w: 80 },
    { k: 'dormitory', title: '宿舍条件', w: 80 },
  ]

  const rows = colleges.value.map(c => cols.map(col => {
    const v = col.fmt ? col.fmt(c[col.k]) : (c[col.k] || '')
    return `<td>${String(v).slice(0, 200)}</td>`
  }).join('')).join('</tr><tr>')

  const html = `
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: system-ui, -apple-system, 'Microsoft YaHei', sans-serif; background: #fff; padding: 12px; color: #1e293b; }
      h1 { font-size: 18px; text-align: center; margin-bottom: 4px; }
      .st-sub { font-size: 10px; color: #64748b; text-align: center; margin-bottom: 10px; }
      table { border-collapse: collapse; width: 100%; font-size: 8px; }
      th { background: #f1f5f9; font-weight: 600; padding: 4px 3px; border: 1px solid #e2e8f0; text-align: left; white-space: nowrap; }
      td { padding: 3px; border: 1px solid #e2e8f0; vertical-align: top; word-break: break-all; }
      tr:nth-child(even) td { background: #fafafa; }
    </style>
    <h1>考研院校信息汇总表</h1>
    <div class="st-sub">${colleges.value.length} 所院校 | 导出时间: ${new Date().toLocaleString()}</div>
    <table>
      <thead><tr>${cols.map(c => `<th>${c.title}</th>`).join('')}</tr></thead>
      <tbody><tr>${rows}</tr></tbody>
    </table>
  `
  await htmlToPDF(html, `院校汇总表_${new Date().toISOString().slice(0, 10)}.pdf`, 'l', 'a3')
  ElMessage.success('汇总表 PDF 已导出')
}

function handlePDFExport(command) {
  if (command === 'all') exportAllPDF()
  else if (command === 'single') ElMessage.info('请先进入院校详情视图，点击「导出 PDF」按钮')
}

// ==================== 生命周期 ====================
onMounted(() => {
  loadData()
  nextTick(initMap)
})

onUnmounted(() => {
  chart?.dispose()
})
</script>

<template>
  <div class="cms-root" @contextmenu.prevent>
    <div ref="mapContainer" class="cms-map" @contextmenu.prevent></div>

    <!-- 顶部搜索/筛选栏 -->
    <div class="cms-topbar">
      <div class="cms-topbar-inner">
        <svg class="cms-search-icon" viewBox="0 0 24 24" width="16" height="16"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="#94a3b8"/></svg>
        <input v-model="filterKeyword" class="cms-search-input" placeholder="搜索院校、省份、专业、标签..." />
        <span v-if="filterKeyword" class="cms-search-count">{{ filteredColleges.length }} 条结果</span>
      </div>
      <div v-if="fsaSupported" class="cms-fsa-bar">
        <el-button size="small" @click="selectProofFolder">
          {{ directoryHandle ? `存储至: ${directoryHandle.name}` : '选择本地存储文件夹' }}
        </el-button>
        <span v-if="directoryHandle" class="cms-fsa-hint">证明材料将写入本地文件夹</span>
      </div>
    </div>

    <!-- 全局按钮 -->
    <div class="cms-toolbar">
      <el-button type="primary" circle size="large" @click="openAddDialog" title="全局新增院校">+</el-button>
      <el-button circle size="large" @click="exportJSON" title="导出备份JSON">↓</el-button>
      <el-button circle size="large" @click="importJSON" title="导入恢复JSON">↑</el-button>
      <el-dropdown trigger="click" @command="handlePDFExport">
        <el-button circle size="large" title="导出 PDF">PDF</el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="all">导出汇总总表 PDF</el-dropdown-item>
            <el-dropdown-item command="single">导出单校详细 PDF（需先打开详情）</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- 省份数据标签 -->
    <div class="cms-province-badges">
      <div v-for="(count, name) in (filterKeyword ? filteredStats : provinceStats)" :key="name" class="cms-badge" @click="openProvinceList(name)">
        {{ name }} <strong>{{ count }}</strong>
      </div>
    </div>

    <!-- 右键菜单 -->
    <div v-if="contextMenu.visible" class="cms-menu" :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }" @click.stop>
      <button class="cms-menu-btn" @click="addCollegeInProvince(contextMenu.province)">+ 新增院校 ({{ contextMenu.province }})</button>
      <button v-if="contextMenu.collegeCount > 0" class="cms-menu-btn" @click="openProvinceList(contextMenu.province)">查看已记录 ({{ contextMenu.collegeCount }})</button>
    </div>

    <!-- 院校列表抽屉 -->
    <el-drawer :title="drawerTitle" v-model="drawerVisible" direction="rtl" size="380px">
      <div v-if="drawerColleges.length" class="cms-drawer-list">
        <div v-for="c in drawerColleges" :key="c.id" class="cms-drawer-item">
          <div class="cms-drawer-header">
            <div class="cms-drawer-name" @click="openFloatingWindow(c); drawerVisible = false">{{ c.name }}</div>
            <div class="cms-drawer-actions">
              <el-button size="small" text @click.stop="openFloatingWindow(c)" title="打开浮窗对比">对比</el-button>
              <el-button size="small" text @click.stop="openDetailView(c); drawerVisible = false" title="查看详情">详情</el-button>
              <el-button size="small" text type="danger" @click.stop="deleteCollege(c)" title="删除">✕</el-button>
            </div>
          </div>
          <div class="cms-drawer-meta" @click="openFloatingWindow(c); drawerVisible = false">
            <el-tag v-for="t in c.tags" :key="t" size="small" class="cms-drawer-tag">{{ t }}</el-tag>
            <span v-if="c.major" class="cms-drawer-major">{{ c.major }}</span>
          </div>
          <div class="cms-drawer-sub" v-if="c.direction" @click="openFloatingWindow(c); drawerVisible = false">{{ c.direction }}</div>
          <div class="cms-drawer-sub" v-if="c.city" @click="openFloatingWindow(c); drawerVisible = false" style="font-size:11px;color:#b0b8c1;">{{ c.city }}</div>
        </div>
      </div>
      <el-empty v-else description="该省份暂无记录" />
    </el-drawer>

    <!-- ==================== 浮窗层（塔科夫式多窗口对比） ==================== -->
    <div class="cms-float-layer">
      <div
        v-for="win in floatingWindows"
        :key="win.id"
        class="cms-float-win"
        :class="{ minimized: win.minimized }"
        :style="{ left: win.x + 'px', top: win.y + 'px', width: win.w + 'px', zIndex: win.z }"
        @pointerdown="bringToFront(win.id)"
      >
        <div class="cms-float-titlebar" @pointerdown.prevent="startDrag($event, win.id)">
          <span class="cms-float-name">{{ win.college.name }}</span>
          <div class="cms-float-actions">
            <button class="cms-float-btn" @click.stop="minimizeWindow(win.id)" :title="win.minimized ? '展开' : '最小化'">
              {{ win.minimized ? '▤' : '—' }}
            </button>
            <button class="cms-float-btn" @click.stop="openDetailView(win.college)" title="查看完整详情">☰</button>
            <button class="cms-float-btn cms-float-edit" @click.stop="editCollege(win.college)" title="编辑">✎</button>
            <button class="cms-float-btn cms-float-close" @click.stop="closeFloatingWindow(win.id)" title="关闭">✕</button>
          </div>
        </div>
        <div class="cms-float-body" v-show="!win.minimized">
          <!-- 照片 + 核心信息 -->
          <div class="fw-head">
            <div class="fw-photo" v-if="win.college.photo">
              <img :src="win.college.photo" alt="" />
            </div>
            <div class="fw-meta">
              <div class="fw-loc">{{ win.college.province }}{{ win.college.city ? ' · ' + win.college.city : '' }}</div>
              <div class="fw-tags" v-if="win.college.tags?.length">
                <el-tag v-for="t in win.college.tags" :key="t" size="small" effect="plain" class="fw-tag">{{ t }}</el-tag>
              </div>
              <div class="fw-coords" v-if="win.college.coords && win.college.coords[0]">📍 {{ win.college.coords[0] }}, {{ win.college.coords[1] }}</div>
            </div>
          </div>
          <!-- 关键字段 -->
          <div class="fw-grid">
            <div class="fw-item" v-if="win.college.major">
              <span class="fw-label">专业</span>
              <span class="fw-value">{{ win.college.major }}</span>
            </div>
            <div class="fw-item" v-if="win.college.direction">
              <span class="fw-label">方向</span>
              <span class="fw-value">{{ win.college.direction }}</span>
            </div>
            <div class="fw-item" v-if="win.college.subjects">
              <span class="fw-label">考试科目</span>
              <span class="fw-value">{{ win.college.subjects }}</span>
            </div>
            <div class="fw-item" v-if="win.college.scoreLine">
              <span class="fw-label">分数线</span>
              <span class="fw-value fw-num">{{ win.college.scoreLine }}</span>
            </div>
            <div class="fw-item" v-if="win.college.ratio">
              <span class="fw-label">报录比</span>
              <span class="fw-value">{{ win.college.ratio }}</span>
            </div>
            <div class="fw-item" v-if="win.college.tuition">
              <span class="fw-label">学费/学制</span>
              <span class="fw-value">{{ win.college.tuition }}</span>
            </div>
            <div class="fw-item" v-if="win.college.discrimination">
              <span class="fw-label">歧视双非</span>
              <span class="fw-value">{{ win.college.discrimination }}</span>
            </div>
            <div class="fw-item" v-if="win.college.dormitory">
              <span class="fw-label">宿舍条件</span>
              <span class="fw-value">{{ win.college.dormitory }}</span>
            </div>
          </div>
          <!-- 备注摘要 -->
          <div class="fw-remark" v-if="win.college.remark">{{ win.college.remark.slice(0, 120) }}{{ win.college.remark.length > 120 ? '…' : '' }}</div>
        </div>
      </div>
    </div>

    <!-- ==================== 院校详情视图（简历模式） ==================== -->
    <el-dialog
      v-model="detailVisible"
      width="760px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <template #header>
        <div class="resume-header" v-if="viewingCollege">
          <div class="resume-header-main">
            <!-- 照片 -->
            <div class="resume-photo-box" v-if="viewingCollege.photo">
              <img :src="viewingCollege.photo" class="resume-photo-img" alt="院校照片" />
            </div>
            <div class="resume-photo-box resume-photo-empty" v-else>
              <svg viewBox="0 0 24 24" width="32" height="32" fill="#cbd5e1"><path d="M3 5h18v14H3V5zm1.5 1.5v11h15v-11h-15zm2 8.25l2.5-3 2 2.5 3-3.5 4.5 5.5H6.5v-1.5z"/></svg>
            </div>
            <div class="resume-header-info">
              <h2 class="resume-name">{{ viewingCollege.name }}</h2>
              <div class="resume-subhead">
                <span class="resume-location">{{ viewingCollege.province }}{{ viewingCollege.city ? ' · ' + viewingCollege.city : '' }}</span>
                <span v-if="viewingCollege.coords && viewingCollege.coords[0]" class="resume-coords">{{ viewingCollege.coords[0] }}, {{ viewingCollege.coords[1] }}</span>
              </div>
              <div class="resume-tags" v-if="viewingCollege.tags?.length">
                <el-tag v-for="t in viewingCollege.tags" :key="t" size="small" effect="plain">{{ t }}</el-tag>
              </div>
              <div class="resume-completeness">
                <div class="resume-completeness-bar">
                  <div class="resume-completeness-fill" :class="completenessLabel(viewingCompleteness)" :style="{ width: viewingCompleteness + '%' }"></div>
                </div>
                <span class="resume-completeness-text" :class="completenessLabel(viewingCompleteness)">{{ viewingCompleteness }}%</span>
              </div>
            </div>
          </div>
          <div class="resume-header-actions">
            <el-button size="small" @click="goEditFromDetail">编辑</el-button>
            <el-button size="small" type="danger" text @click="goDeleteFromDetail">删除</el-button>
          </div>
        </div>
      </template>

      <div class="resume-body" v-if="viewingCollege">
        <div class="resume-section">
          <h3 class="resume-section-title">基本信息</h3>
          <div class="resume-grid">
            <div class="resume-field" v-if="viewingCollege.major">
              <span class="resume-field-label">专业</span>
              <span class="resume-field-value">{{ viewingCollege.major }}</span>
            </div>
            <div class="resume-field" v-if="viewingCollege.direction">
              <span class="resume-field-label">方向</span>
              <span class="resume-field-value">{{ viewingCollege.direction }}</span>
            </div>
          </div>
          <div class="resume-empty" v-if="!viewingCollege.major && !viewingCollege.direction">暂无</div>
        </div>

        <div class="resume-section">
          <h3 class="resume-section-title">考试信息</h3>
          <div class="resume-grid" v-if="viewingCollege.subjects || viewingCollege.scoreLine || viewingCollege.ratio || viewingCollege.tuition">
            <div class="resume-field" v-if="viewingCollege.subjects">
              <span class="resume-field-label">考试科目</span>
              <span class="resume-field-value">{{ viewingCollege.subjects }}</span>
            </div>
            <div class="resume-field" v-if="viewingCollege.scoreLine">
              <span class="resume-field-label">分数线</span>
              <span class="resume-field-value resume-num">{{ viewingCollege.scoreLine }}</span>
            </div>
            <div class="resume-field" v-if="viewingCollege.ratio">
              <span class="resume-field-label">报录比</span>
              <span class="resume-field-value">{{ viewingCollege.ratio }}</span>
            </div>
            <div class="resume-field" v-if="viewingCollege.tuition">
              <span class="resume-field-label">学费/学制</span>
              <span class="resume-field-value">{{ viewingCollege.tuition }}</span>
            </div>
          </div>
          <div class="resume-field resume-field-block" v-if="viewingCollege.remark">
            <span class="resume-field-label">备注</span>
            <span class="resume-field-value">{{ viewingCollege.remark }}</span>
          </div>
          <div class="resume-empty" v-if="!viewingCollege.subjects && !viewingCollege.scoreLine && !viewingCollege.ratio && !viewingCollege.tuition && !viewingCollege.remark">暂无</div>
        </div>

        <div class="resume-section">
          <h3 class="resume-section-title">软信息</h3>
          <div class="resume-grid" v-if="viewingCollege.tutorInfo || viewingCollege.interviewStyle || viewingCollege.discrimination || viewingCollege.dormitory || viewingCollege.groupAtmosphere">
            <div class="resume-field" v-if="viewingCollege.tutorInfo">
              <span class="resume-field-label">导师信息</span>
              <span class="resume-field-value">{{ viewingCollege.tutorInfo }}</span>
            </div>
            <div class="resume-field" v-if="viewingCollege.interviewStyle">
              <span class="resume-field-label">复试风格</span>
              <span class="resume-field-value">{{ viewingCollege.interviewStyle }}</span>
            </div>
            <div class="resume-field" v-if="viewingCollege.discrimination">
              <span class="resume-field-label">歧视双非</span>
              <span class="resume-field-value">{{ viewingCollege.discrimination }}</span>
            </div>
            <div class="resume-field" v-if="viewingCollege.dormitory">
              <span class="resume-field-label">宿舍条件</span>
              <span class="resume-field-value">{{ viewingCollege.dormitory }}</span>
            </div>
            <div class="resume-field" v-if="viewingCollege.groupAtmosphere">
              <span class="resume-field-label">课题组氛围</span>
              <span class="resume-field-value">{{ viewingCollege.groupAtmosphere }}</span>
            </div>
          </div>
          <div class="resume-field resume-field-block" v-if="viewingCollege.subjective">
            <span class="resume-field-label">其他</span>
            <span class="resume-field-value">{{ viewingCollege.subjective }}</span>
          </div>
          <div class="resume-empty" v-if="!viewingCollege.tutorInfo && !viewingCollege.interviewStyle && !viewingCollege.discrimination && !viewingCollege.dormitory && !viewingCollege.groupAtmosphere && !viewingCollege.subjective">暂无</div>
        </div>

        <div class="resume-section">
          <h3 class="resume-section-title">证明材料 <span class="resume-count">{{ viewingCollege.proofs?.length || 0 }} 份</span></h3>
          <div v-if="viewingCollege.proofs?.length" class="resume-proofs">
            <div v-for="(p, idx) in viewingCollege.proofs" :key="idx" class="resume-proof-item">
              <span class="resume-proof-icon">{{ p.type === 'file' ? '📄' : '🔗' }}</span>
              <span class="resume-proof-label">{{ p.label }}</span>
              <el-tag v-if="p.field" size="small" type="info" effect="plain">{{ p.field }}</el-tag>
              <a v-if="p.type === 'link'" :href="p.data" target="_blank" class="resume-proof-open" @click.stop>打开</a>
              <span v-if="p.fsPath" class="resume-proof-fs">本地: {{ p.fsPath }}</span>
            </div>
          </div>
          <div class="resume-empty" v-else>暂无证明材料</div>
        </div>
      </div>

      <template #footer>
        <el-button @click="exportSinglePDF(viewingCollege)">导出 PDF</el-button>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- ==================== 表单弹窗（编辑模式） ==================== -->
    <el-dialog
      :title="editMode === 'create' ? '新增院校信息' : '编辑院校信息'"
      v-model="formVisible"
      width="700px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <div class="cms-completeness">
        <div class="cms-completeness-header">
          <span>信息完整度</span>
          <span class="cms-completeness-pct" :class="completenessLabel(completeness)">{{ completeness }}% · {{ completenessLabel(completeness) }}</span>
        </div>
        <div class="cms-completeness-bar">
          <div class="cms-completeness-fill" :style="{ width: completeness + '%' }" :class="completenessLabel(completeness)"></div>
        </div>
      </div>

      <div class="cms-steps">
        <div class="cms-step" :class="{ active: currentStep === 1, done: currentStep > 1 }">
          <span class="cms-step-num">1</span> 基本信息
        </div>
        <div class="cms-step-line" :class="{ done: currentStep > 1 }"></div>
        <div class="cms-step" :class="{ active: currentStep === 2, done: currentStep > 2 }">
          <span class="cms-step-num">2</span> 考试信息
        </div>
        <div class="cms-step-line" :class="{ done: currentStep > 2 }"></div>
        <div class="cms-step" :class="{ active: currentStep === 3 }">
          <span class="cms-step-num">3</span> 软信息与证明
        </div>
      </div>

      <el-form :model="form" label-width="100px" size="default" class="cms-form">
        <template v-if="currentStep === 1">
          <el-form-item label="院校名称" required><el-input v-model="form.name" placeholder="请输入完整校名" @change="autoLocate" /></el-form-item>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="所在省" required><el-input v-model="form.province" placeholder="如：江苏" /></el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="城市"><el-input v-model="form.city" placeholder="如：南京" @change="autoLocate" /></el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="专业"><el-input v-model="form.major" placeholder="报考专业" /></el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="方向"><el-input v-model="form.direction" placeholder="研究方向（可选）" /></el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="标签">
            <el-select v-model="form.tags" multiple filterable allow-create placeholder="选择或输入自定义标签" style="width:100%">
              <el-option v-for="t in allKnownTags" :key="t" :label="t" :value="t" />
            </el-select>
          </el-form-item>
          <el-form-item label="照片">
            <div class="cms-photo-area">
              <div v-if="form.photo" class="cms-photo-preview">
                <img :src="form.photo" class="cms-photo-img" alt="预览" />
                <el-button size="small" type="danger" text @click="removePhoto">移除照片</el-button>
              </div>
              <el-upload
                v-else
                action="#"
                :auto-upload="false"
                :show-file-list="false"
                :on-change="handlePhotoUpload"
                accept="image/*"
              >
                <el-button size="small">上传院校照片</el-button>
              </el-upload>
            </div>
          </el-form-item>
          <el-form-item v-if="form.coords" label="坐标">
            <span class="cms-coords-hint">{{ form.coords[0] }}, {{ form.coords[1] }} — 已自动定位</span>
          </el-form-item>
        </template>

        <template v-if="currentStep === 2">
          <el-form-item label="考试科目"><el-input v-model="form.subjects" placeholder="如：政治、英语一、数学一、408" /></el-form-item>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="分数线"><el-input v-model="form.scoreLine" placeholder="如：365" /></el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="报录比"><el-input v-model="form.ratio" placeholder="如：1:8" /></el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="学费/学制"><el-input v-model="form.tuition" placeholder="如：8000/年 3年" /></el-form-item>
          <el-form-item label="备注"><el-input v-model="form.remark" type="textarea" :rows="3" placeholder="其他备注信息" /></el-form-item>
        </template>

        <template v-if="currentStep === 3">
          <el-form-item label="导师信息"><el-input v-model="form.tutorInfo" type="textarea" :rows="2" placeholder="姓名、方向、风评等" /></el-form-item>
          <el-form-item label="复试风格"><el-input v-model="form.interviewStyle" placeholder="如：偏重项目经验、英语面试等" /></el-form-item>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="歧视双非"><el-input v-model="form.discrimination" placeholder="如：不歧视 / 传闻有偏好" /></el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="宿舍条件"><el-input v-model="form.dormitory" placeholder="如：四人间、独卫、空调" /></el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="课题组氛围"><el-input v-model="form.groupAtmosphere" placeholder="如：push / 放养 / 适中" /></el-form-item>
          <el-form-item label="其他"><el-input v-model="form.subjective" placeholder="其他自定义主观信息" /></el-form-item>
          <el-form-item label="证明材料">
            <div class="cms-proofs">
              <div v-for="(p, idx) in form.proofs" :key="idx" class="cms-proof-row">
                <el-tag size="small" :type="p.type === 'file' ? 'primary' : 'success'" effect="plain">{{ p.type === 'file' ? '文件' : '链接' }}</el-tag>
                <span class="cms-proof-label">{{ p.label }}</span>
                <el-tag v-if="p.field" size="small" type="info" effect="plain" class="cms-proof-field">{{ p.field }}</el-tag>
                <el-button size="small" type="danger" text @click="removeProof(idx)">删除</el-button>
              </div>
              <div class="cms-proof-actions">
                <el-select v-model="proofFieldBind" size="small" placeholder="关联字段（可选）" clearable style="width:140px">
                  <el-option v-for="opt in ['院校名称','专业方向','考试科目','分数线','报录比','学费','导师信息','复试风格','歧视双非','宿舍条件','课题组氛围','综合']" :key="opt" :label="opt" :value="opt" />
                </el-select>
                <el-upload action="#" :auto-upload="false" :show-file-list="false" :on-change="handleProofFile" accept="image/*,.pdf,.xlsx,.docx,.html">
                  <el-button size="small">上传文件</el-button>
                </el-upload>
                <el-input v-model="proofLink" placeholder="粘贴链接地址" size="small" style="width:180px" />
                <el-button size="small" @click="addProofLink" :disabled="!proofLink">添加链接</el-button>
              </div>
              <div v-if="form.proofs.some(p => p.type === 'link')" class="cms-link-check">
                <el-button size="small" text type="info" @click="checkLinkValidity">链路检测（预留）</el-button>
              </div>
            </div>
          </el-form-item>
        </template>
      </el-form>

      <template #footer>
        <el-button v-if="currentStep > 1" @click="currentStep--">上一步</el-button>
        <el-button v-if="currentStep < 3" type="primary" @click="currentStep++">下一步</el-button>
        <el-button v-if="currentStep === 3" type="success" @click="saveCollege">保存</el-button>
        <el-button @click="formVisible = false">取消</el-button>
      </template>
    </el-dialog>
    <!-- 隐藏的 PDF 渲染区（html2canvas 截图用） -->
    <div ref="pdfRenderArea" class="cms-pdf-render"></div>
  </div>
</template>

<style scoped>
.cms-root {
  position: relative;
  width: 100%;
  height: 100%;
  background: #f8fafc;
  font-family: system-ui, -apple-system, sans-serif;
  overflow: hidden;
}

.cms-map { width: 100%; height: 100%; }

/* ==================== 浮窗层（塔科夫式多窗口对比） ==================== */
.cms-float-layer {
  position: fixed; inset: 0; pointer-events: none; z-index: 50;
}
.cms-float-win {
  position: absolute;
  pointer-events: auto;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.16), 0 0 0 1px rgba(0,0,0,0.04);
  overflow: hidden;
  transition: box-shadow 0.2s;
  user-select: none;
}
.cms-float-win:hover { box-shadow: 0 12px 48px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.06); }
.cms-float-win.minimized { height: auto !important; }

.cms-float-titlebar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: #f8fafc;
  border-bottom: 1px solid #f1f5f9;
  cursor: grab;
  gap: 8px;
}
.cms-float-titlebar:active { cursor: grabbing; }
.cms-float-name {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
}
.cms-float-actions {
  display: flex;
  gap: 2px;
  flex-shrink: 0;
}
.cms-float-btn {
  width: 24px; height: 24px;
  border: none; background: none;
  font-size: 12px; color: #94a3b8;
  cursor: pointer; border-radius: 4px;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.cms-float-btn:hover { background: #e2e8f0; color: #1e293b; }
.cms-float-close:hover { background: #fecaca; color: #dc2626; }
.cms-float-edit:hover { background: #e0f2fe; color: #0ea5e9; }

.cms-float-body {
  padding: 12px;
  max-height: 55vh;
  overflow-y: auto;
  font-size: 13px;
}

/* 浮窗内字段 */
.fw-head {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}
.fw-photo {
  width: 48px; height: 48px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
}
.fw-photo img { width: 100%; height: 100%; object-fit: cover; }
.fw-meta { flex: 1; min-width: 0; }
.fw-loc { font-size: 11px; color: #94a3b8; margin-bottom: 4px; }
.fw-tags { display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 4px; }
.fw-tag { margin: 0; font-size: 10px !important; }
.fw-coords { font-size: 10px; color: #cbd5e1; font-family: 'SF Mono', 'JetBrains Mono', monospace; }

.fw-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px 12px;
}
.fw-item {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.fw-label { font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.03em; }
.fw-value { font-size: 13px; color: #1e293b; word-break: break-all; }
.fw-num { font-family: 'SF Mono', 'JetBrains Mono', monospace; font-weight: 600; }
.fw-remark {
  margin-top: 8px;
  padding: 6px 8px;
  background: #f8fafc;
  border-radius: 6px;
  font-size: 11px;
  color: #64748b;
  line-height: 1.5;
}

/* ==================== 顶部搜索 ==================== */
.cms-topbar {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.cms-topbar-inner {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 6px 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.cms-search-icon { flex-shrink: 0; }
.cms-search-input {
  border: none;
  outline: none;
  font-size: 13px;
  width: 240px;
  color: #1e293b;
  background: transparent;
}
.cms-search-input::placeholder { color: #b0b8c1; }
.cms-search-count { font-size: 11px; color: #0ea5e9; white-space: nowrap; }
.cms-fsa-bar { display: flex; align-items: center; gap: 6px; }
.cms-fsa-hint { font-size: 11px; color: #22c55e; }

/* ==================== 工具栏 ==================== */
.cms-toolbar {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 10;
}

/* ==================== 省份标签 ==================== */
.cms-province-badges {
  position: absolute;
  bottom: 16px;
  left: 16px;
  right: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  z-index: 10;
}
.cms-badge {
  padding: 4px 10px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 12px;
  color: #64748b;
  cursor: pointer;
  transition: 0.15s;
}
.cms-badge:hover { border-color: #38bdf8; color: #0ea5e9; }
.cms-badge strong { color: #1e293b; margin-left: 3px; }

/* ==================== 右键菜单 ==================== */
.cms-menu {
  position: fixed;
  z-index: 999;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.12);
  overflow: hidden;
  min-width: 200px;
}
.cms-menu-btn {
  display: block;
  width: 100%;
  padding: 10px 16px;
  border: none;
  background: none;
  font-size: 13px;
  color: #334155;
  cursor: pointer;
  text-align: left;
  transition: 0.1s;
}
.cms-menu-btn:hover { background: #f1f5f9; color: #0ea5e9; }

/* ==================== 抽屉列表 ==================== */
.cms-drawer-list { display: flex; flex-direction: column; gap: 4px; }
.cms-drawer-item {
  padding: 12px;
  border-radius: 8px;
  transition: 0.15s;
}
.cms-drawer-item:hover { background: #f8fafc; }
.cms-drawer-header { display: flex; justify-content: space-between; align-items: flex-start; }
.cms-drawer-name { font-size: 14px; font-weight: 600; color: #1e293b; margin-bottom: 6px; flex: 1; cursor: pointer; }
.cms-drawer-name:hover { color: #0ea5e9; }
.cms-drawer-actions { display: flex; gap: 4px; flex-shrink: 0; }
.cms-drawer-meta { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; cursor: pointer; }
.cms-drawer-tag { margin: 0; }
.cms-drawer-major { font-size: 12px; color: #94a3b8; }
.cms-drawer-sub { font-size: 12px; color: #94a3b8; margin-top: 4px; cursor: pointer; }

/* ==================== 照片 ==================== */
.cms-photo-area { display: flex; align-items: center; }
.cms-photo-preview {
  display: flex;
  align-items: center;
  gap: 12px;
}
.cms-photo-img {
  width: 80px;
  height: 56px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

/* ==================== 简历/详情视图 ==================== */
.resume-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}
.resume-header-main {
  display: flex;
  gap: 16px;
  flex: 1;
  min-width: 0;
}
.resume-photo-box {
  width: 80px;
  height: 80px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
}
.resume-photo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.resume-photo-empty {
  background: #f8fafc;
}
.resume-header-info {
  flex: 1;
  min-width: 0;
}
.resume-header-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}
.resume-name {
  font-size: 1.4rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 4px 0;
  line-height: 1.3;
}
.resume-header-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}
.resume-subhead {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  font-size: 13px;
  color: #64748b;
}
.resume-coords { font-size: 11px; color: #94a3b8; font-family: 'SF Mono', 'JetBrains Mono', monospace; }
.resume-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
.resume-completeness {
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 300px;
}
.resume-completeness-bar {
  flex: 1;
  height: 3px;
  background: #e2e8f0;
  border-radius: 2px;
  overflow: hidden;
}
.resume-completeness-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.4s ease;
}
.resume-completeness-fill.完整 { background: #22c55e; }
.resume-completeness-fill.过半 { background: #0ea5e9; }
.resume-completeness-fill.起步 { background: #f59e0b; }
.resume-completeness-fill.待填 { background: #cbd5e1; }
.resume-completeness-text {
  font-size: 12px;
  font-weight: 600;
  min-width: 36px;
  text-align: right;
}
.resume-completeness-text.完整 { color: #22c55e; }
.resume-completeness-text.过半 { color: #0ea5e9; }
.resume-completeness-text.起步 { color: #f59e0b; }
.resume-completeness-text.待填 { color: #cbd5e1; }

.resume-body {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.resume-section {
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
}
.resume-section:last-child { border-bottom: none; padding-bottom: 0; }
.resume-section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 12px 0;
}
.resume-count { font-weight: 400; color: #94a3b8; text-transform: none; letter-spacing: 0; }
.resume-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.resume-field { display: flex; flex-direction: column; gap: 2px; }
.resume-field-block { grid-column: 1 / -1; margin-top: 8px; }
.resume-field-label {
  font-size: 11px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.resume-field-value {
  font-size: 14px;
  color: #1e293b;
  line-height: 1.5;
  white-space: pre-wrap;
}
.resume-num { font-family: 'SF Mono', 'JetBrains Mono', monospace; font-weight: 600; }
.resume-empty { font-size: 13px; color: #cbd5e1; font-style: italic; }

.resume-proofs { display: flex; flex-direction: column; gap: 8px; }
.resume-proof-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background: #f8fafc;
  border-radius: 6px;
  font-size: 13px;
}
.resume-proof-icon { flex-shrink: 0; font-size: 14px; }
.resume-proof-label { flex: 1; color: #475569; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.resume-proof-open { font-size: 12px; color: #0ea5e9; text-decoration: none; flex-shrink: 0; }
.resume-proof-open:hover { text-decoration: underline; }
.resume-proof-fs { font-size: 10px; color: #22c55e; flex-shrink: 0; }

/* ==================== 信息完整度 ==================== */
.cms-completeness { margin-bottom: 16px; }
.cms-completeness-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  font-size: 12px;
  color: #94a3b8;
}
.cms-completeness-pct { font-weight: 600; }
.cms-completeness-pct.完整 { color: #22c55e; }
.cms-completeness-pct.过半 { color: #0ea5e9; }
.cms-completeness-pct.起步 { color: #f59e0b; }
.cms-completeness-pct.待填 { color: #cbd5e1; }
.cms-completeness-bar {
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  overflow: hidden;
}
.cms-completeness-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.4s ease;
}
.cms-completeness-fill.完整 { background: #22c55e; }
.cms-completeness-fill.过半 { background: #0ea5e9; }
.cms-completeness-fill.起步 { background: #f59e0b; }
.cms-completeness-fill.待填 { background: #cbd5e1; }

/* ==================== 步骤指示器 ==================== */
.cms-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  gap: 0;
}
.cms-step {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #94a3b8;
}
.cms-step.active { color: #0ea5e9; font-weight: 600; }
.cms-step.done { color: #22c55e; }
.cms-step-num {
  width: 24px; height: 24px;
  border-radius: 12px;
  background: #e2e8f0;
  color: #94a3b8;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 600;
}
.cms-step.active .cms-step-num { background: #0ea5e9; color: #fff; }
.cms-step.done .cms-step-num { background: #22c55e; color: #fff; }
.cms-step-line {
  width: 60px; height: 1px;
  background: #e2e8f0;
  margin: 0 8px;
}
.cms-step-line.done { background: #22c55e; }

/* ==================== 表单 ==================== */
.cms-form { margin-top: 8px; }
.cms-coords-hint { font-size: 12px; color: #0ea5e9; }

/* ==================== 证明材料 ==================== */
.cms-proofs { width: 100%; }
.cms-proof-row {
  display: flex; align-items: center; gap: 8px;
  padding: 6px 0;
}
.cms-proof-label { flex: 1; font-size: 12px; color: #475569; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cms-proof-field { flex-shrink: 0; }
.cms-proof-actions {
  display: flex; align-items: center; gap: 8px;
  margin-top: 8px; padding-top: 8px;
  border-top: 1px dashed #e2e8f0;
  flex-wrap: wrap;
}
.cms-link-check { margin-top: 8px; }

/* 隐藏的 PDF 渲染区 */
.cms-pdf-render {
  display: none;
  position: fixed;
  left: -9999px;
  top: 0;
  z-index: -1;
}
</style>
