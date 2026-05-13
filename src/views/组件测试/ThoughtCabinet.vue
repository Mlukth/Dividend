<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'

// ==================== 四个书架分类 ====================
const QUADRANTS = [
  { id: 'foundation', label: '基础学科', color: '#5b8cce', wood: '#6b4c3b', desc: '数学·物理·统计' },
  { id: 'language', label: '语言能力', color: '#8b6bce', wood: '#5c4a3a', desc: '英语·写作·翻译' },
  { id: 'engineering', label: '工程技能', color: '#ce9b3b', wood: '#4d3d2e', desc: '编程·工具·框架' },
  { id: 'practice', label: '实践项目', color: '#4bae6e', wood: '#3d342a', desc: '项目·应用·作品' }
]

const STORAGE_KEY = 'thought_cabinet_data'

// ==================== 示例数据 ====================
const DEFAULT_NODES = [
  { id: 'advanced-math', name: '高等数学', quadrant: 'foundation', icon: '∫', progress: 65, status: 'in_progress',
    resources: [
      { type: 'book', title: '张宇高等数学18讲', author: '张宇', done: true, link: '' },
      { type: 'book', title: '线性代数辅导讲义', author: '李永乐', done: false, link: '' },
      { type: 'article', title: '极限计算技巧总结', url: '', done: true }
    ], notes: '上册已完成，下册多重积分部分待加强' },
  { id: 'linear-algebra', name: '线性代数', quadrant: 'foundation', icon: '⊞', progress: 30, status: 'in_progress',
    resources: [
      { type: 'book', title: '线性代数及其应用', author: 'David Lay', done: false, link: '' },
      { type: 'article', title: '3Blue1Brown 线性代数的本质', url: 'https://www.3blue1brown.com/topics/linear-algebra', done: false }
    ], notes: '特征值与特征向量需要加深理解' },
  { id: 'probability', name: '概率论与统计', quadrant: 'foundation', icon: 'σ', progress: 10, status: 'in_progress',
    resources: [{ type: 'book', title: '概率论与数理统计', author: '茆诗松', done: false, link: '' }], notes: '' },
  { id: 'discrete-math', name: '离散数学', quadrant: 'foundation', icon: '⟦', progress: 0, status: 'not_started', resources: [], notes: '' },
  { id: 'numerical-analysis', name: '数值分析', quadrant: 'foundation', icon: '≈', progress: 0, status: 'not_started', resources: [], notes: '' },
  { id: 'optimization', name: '最优化方法', quadrant: 'foundation', icon: '∇', progress: 0, status: 'not_started', resources: [], notes: '' },
  { id: 'english-writing', name: '英语写作', quadrant: 'language', icon: '✎', progress: 20, status: 'in_progress',
    resources: [
      { type: 'book', title: '考研英语写作高分突破', author: '', done: false, link: '' },
      { type: 'article', title: '英语写作句型模板整理', url: '', done: false }
    ], notes: '大作文模板待整理，小作文格式需练习' },
  { id: 'english-translation', name: '英语翻译', quadrant: 'language', icon: '⇄', progress: 15, status: 'in_progress',
    resources: [{ type: 'book', title: '考研英语翻译教程', author: '', done: false, link: '' }], notes: '英译中基础尚可，中译英需要强化' },
  { id: 'english-reading', name: '英语阅读', quadrant: 'language', icon: '👁', progress: 50, status: 'in_progress',
    resources: [{ type: 'article', title: 'The Economist 精选文章', url: '', done: false }], notes: '长难句分析能力已有提升' },
  { id: 'tech-writing', name: '技术写作', quadrant: 'language', icon: '⚙', progress: 5, status: 'in_progress', resources: [], notes: '文档规范、README写作' },
  { id: 'chinese-writing', name: '中文写作', quadrant: 'language', icon: '文', progress: 40, status: 'in_progress', resources: [], notes: '' },
  { id: 'academic-reading', name: '学术阅读', quadrant: 'language', icon: '📖', progress: 0, status: 'not_started', resources: [], notes: '' },
  { id: 'vue3', name: 'Vue 3 + TS', quadrant: 'engineering', icon: '⚡', progress: 70, status: 'in_progress',
    resources: [
      { type: 'book', title: 'Vue.js 设计与实现', author: '霍春阳', done: false, link: '' },
      { type: 'article', title: 'Vue 3 官方文档', url: 'https://vuejs.org/', done: true }
    ], notes: '响应式原理已理解，SSR待学' },
  { id: 'python', name: 'Python 进阶', quadrant: 'engineering', icon: '🐍', progress: 60, status: 'in_progress',
    resources: [{ type: 'book', title: 'Fluent Python', author: 'Luciano Ramalho', done: false, link: '' }], notes: '装饰器、协程' },
  { id: 'deep-learning', name: '深度学习', quadrant: 'engineering', icon: '🧠', progress: 45, status: 'in_progress',
    resources: [
      { type: 'book', title: '动手学深度学习', author: '李沐', done: false, link: 'https://d2l.ai/' },
      { type: 'article', title: 'PyTorch官方教程', url: 'https://pytorch.org/tutorials/', done: false }
    ], notes: 'Transformer注意力机制' },
  { id: 'devops', name: 'DevOps', quadrant: 'engineering', icon: '🔧', progress: 5, status: 'in_progress',
    resources: [{ type: 'book', title: 'Docker实战', author: '', done: false, link: '' }], notes: 'Docker, CI/CD' },
  { id: 'ds-algo', name: '数据结构与算法', quadrant: 'engineering', icon: '🌳', progress: 35, status: 'in_progress',
    resources: [
      { type: 'book', title: '算法导论', author: 'CLRS', done: false, link: '' },
      { type: 'article', title: 'LeetCode热题100', url: 'https://leetcode.cn/', done: false }
    ], notes: '图算法和DP是薄弱点' },
  { id: 'database', name: '数据库', quadrant: 'engineering', icon: '🗄', progress: 25, status: 'in_progress', resources: [], notes: 'SQL优化、索引设计' },
  { id: 'pv-platform', name: '光伏管理平台', quadrant: 'practice', icon: '☀', progress: 80, status: 'in_progress',
    resources: [{ type: 'article', title: '项目仓库', url: '', done: true }], notes: '逆变器详情页UI' },
  { id: 'knowledge-base', name: '个人知识库', quadrant: 'practice', icon: '🗂', progress: 30, status: 'in_progress',
    resources: [], notes: '认知图谱可视化（本工具）' },
  { id: 'english-tool', name: '英语练习工具', quadrant: 'practice', icon: '📝', progress: 0, status: 'not_started', resources: [], notes: '翻译AI判分系统' },
  { id: 'auto-workflow', name: '自动化工作流', quadrant: 'practice', icon: '🤖', progress: 0, status: 'not_started', resources: [], notes: '截图→OCR→分类' },
  { id: 'portfolio', name: '作品集', quadrant: 'practice', icon: '🎯', progress: 0, status: 'not_started', resources: [], notes: '' },
  { id: 'open-source', name: '开源贡献', quadrant: 'practice', icon: '🌟', progress: 0, status: 'not_started', resources: [], notes: '' }
]

// ==================== 状态 ====================
const nodes = ref([])
const searchQuery = ref('')
const activeQuadrant = ref(null)

// 浮窗系统
const floatingWindows = reactive([])
let globalZIndex = 20
let dragWinTarget = null; let dragWinOffX = 0; let dragWinOffY = 0

// 书本拖拽
const dragBook = ref(null)       // 正在被拖的书
const dragOverShelf = ref(null)  // 鼠标悬停在哪个书架
const dragCloneStyle = reactive({ left: '0px', top: '0px', display: 'none' })

// ==================== 计算 ====================
const filteredNodes = computed(() => {
  let list = nodes.value
  if (activeQuadrant.value) list = list.filter(n => n.quadrant === activeQuadrant.value)
  if (searchQuery.value) {
    const kw = searchQuery.value.toLowerCase()
    list = list.filter(n => n.name.toLowerCase().includes(kw) || n.notes.toLowerCase().includes(kw))
  }
  return list
})

const nodesByQuadrant = (qid) => filteredNodes.value.filter(n => n.quadrant === qid)

const overallProgress = computed(() => {
  if (!nodes.value.length) return 0
  return Math.round(nodes.value.reduce((s, n) => s + n.progress, 0) / nodes.value.length)
})

const completedCount = computed(() => nodes.value.filter(n => n.status === 'completed').length)
const inProgressCount = computed(() => nodes.value.filter(n => n.status === 'in_progress').length)

// ==================== 数据 ====================
function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) { nodes.value = JSON.parse(raw); return }
  } catch (e) {}
  nodes.value = JSON.parse(JSON.stringify(DEFAULT_NODES))
}
function saveData() { localStorage.setItem(STORAGE_KEY, JSON.stringify(nodes.value)) }
function resetData() { nodes.value = JSON.parse(JSON.stringify(DEFAULT_NODES)); saveData(); ElMessage.success('已恢复默认') }

// ==================== 浮动窗口 ====================
function openWindow(node) {
  const exist = floatingWindows.find(w => w.id === node.id)
  if (exist) { exist.minimized = false; exist.z = ++globalZIndex; return }
  floatingWindows.push({
    id: node.id, node, x: 200 + (floatingWindows.length % 3) * 50,
    y: 80 + (floatingWindows.length % 3) * 40, w: 420, minimized: false, z: ++globalZIndex
  })
}
function closeWindow(id) { const i = floatingWindows.findIndex(w => w.id === id); if (i > -1) floatingWindows.splice(i, 1) }
function minimizeWindow(id) { const w = floatingWindows.find(w => w.id === id); if (w) w.minimized = !w.minimized }
function bringToFront(id) { const w = floatingWindows.find(w => w.id === id); if (w) w.z = ++globalZIndex }

function startWinDrag(e, id) {
  const w = floatingWindows.find(w => w.id === id)
  if (!w) return
  bringToFront(id); dragWinTarget = w
  dragWinOffX = e.clientX - w.x; dragWinOffY = e.clientY - w.y
  document.addEventListener('pointermove', onWinDrag); document.addEventListener('pointerup', stopWinDrag)
}
function onWinDrag(e) {
  if (!dragWinTarget) return
  dragWinTarget.x = Math.max(0, Math.min(window.innerWidth - 150, e.clientX - dragWinOffX))
  dragWinTarget.y = Math.max(0, Math.min(window.innerHeight - 60, e.clientY - dragWinOffY))
}
function stopWinDrag() { dragWinTarget = null; document.removeEventListener('pointermove', onWinDrag); document.removeEventListener('pointerup', stopWinDrag) }

// ==================== 书本拖拽 ====================
function startBookDrag(e, node) {
  const rect = e.currentTarget.getBoundingClientRect()
  dragBook.value = node
  dragCloneStyle.left = rect.left + 'px'; dragCloneStyle.top = rect.top + 'px'
  dragCloneStyle.display = 'block'
  dragOffX = e.clientX - rect.left; dragOffY = e.clientY - rect.top
  document.addEventListener('pointermove', onBookDrag); document.addEventListener('pointerup', stopBookDrag)
  e.preventDefault()
}

let dragOffX = 0; let dragOffY = 0

function onBookDrag(e) {
  if (!dragBook.value) return
  dragCloneStyle.left = (e.clientX - dragOffX) + 'px'
  dragCloneStyle.top = (e.clientY - dragOffY) + 'px'
  // 检测鼠标在哪个书架上
  const shelves = document.querySelectorAll('.tc-shelf')
  dragOverShelf.value = null
  shelves.forEach(el => {
    const r = el.getBoundingClientRect()
    if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
      dragOverShelf.value = el.dataset.qid
    }
  })
}

function stopBookDrag(e) {
  if (dragBook.value && dragOverShelf.value && dragBook.value.quadrant !== dragOverShelf.value) {
    dragBook.value.quadrant = dragOverShelf.value
    saveData()
  }
  dragBook.value = null; dragOverShelf.value = null
  dragCloneStyle.display = 'none'
  document.removeEventListener('pointermove', onBookDrag); document.removeEventListener('pointerup', stopBookDrag)
}

// ==================== 资源操作 ====================
const newResType = ref('book'); const newResTitle = ref(''); const newResAuthor = ref(''); const newResUrl = ref('')

function addResource(node) {
  if (!newResTitle.value.trim()) return
  node.resources.push({ type: newResType.value, title: newResTitle.value.trim(), author: newResAuthor.value.trim(), url: newResUrl.value.trim(), done: false })
  newResTitle.value = ''; newResAuthor.value = ''; newResUrl.value = ''
  recalcProgress(node); saveData()
}
function toggleResource(node, idx) { node.resources[idx].done = !node.resources[idx].done; recalcProgress(node); saveData() }
function removeResource(node, idx) { node.resources.splice(idx, 1); recalcProgress(node); saveData() }

function recalcProgress(node) {
  if (!node.resources?.length) { node.progress = node.status === 'completed' ? 100 : 0; return }
  const done = node.resources.filter(r => r.done).length
  node.progress = Math.round((done / node.resources.length) * 100)
  node.status = node.progress === 100 ? 'completed' : node.progress > 0 ? 'in_progress' : 'not_started'
}
function setStatus(node, s) { node.status = s; if (s === 'completed') node.progress = 100; if (s === 'not_started') node.progress = 0; saveData() }

// ==================== 生命周期 ====================
onMounted(() => { loadData(); document.addEventListener('keydown', onKey) })
onUnmounted(() => { document.removeEventListener('keydown', onKey) })
function onKey(e) { if (e.key === 'Escape') { floatingWindows.length = 0 } }
function exportData() {
  const blob = new Blob([JSON.stringify(nodes.value, null, 2)], { type: 'application/json' })
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'bookshelf-backup.json'; a.click()
  ElMessage.success('已导出')
}

function spineColor(node) {
  if (node.status === 'completed') return '#22c55e'
  if (node.status === 'in_progress') return quadrantById(node.quadrant).color
  return '#78716c'
}
function quadrantById(id) { return QUADRANTS.find(q => q.id === id) || QUADRANTS[0] }
function bookThickness(node) { return Math.max(44, Math.min(72, 44 + (node.resources?.length || 0) * 6)) }
</script>

<template>
  <div class="bs-root">
    <!-- 顶栏 -->
    <header class="bs-header">
      <h1 class="bs-title">📚 我的书架</h1>
      <div class="bs-header-right">
        <input v-model="searchQuery" placeholder="搜索书名或笔记..." class="bs-search" />
        <span class="bs-chip done">{{ completedCount }} 已读完</span>
        <span class="bs-chip active">{{ inProgressCount }} 在读</span>
        <span class="bs-chip total">{{ nodes.length }} 本</span>
        <button class="bs-btn" @click="exportData">导出</button>
        <button class="bs-btn warn" @click="resetData">重置</button>
      </div>
    </header>

    <!-- 分类筛选 + 总进度 -->
    <div class="bs-toolbar">
      <div class="bs-filters">
        <button :class="['bs-fbtn', { active: !activeQuadrant }]" @click="activeQuadrant = null">全部书架</button>
        <button v-for="q in QUADRANTS" :key="q.id"
          :class="['bs-fbtn', { active: activeQuadrant === q.id }]"
          :style="activeQuadrant === q.id ? { background: q.color + '22', borderColor: q.color, color: q.color } : {}"
          @click="activeQuadrant = activeQuadrant === q.id ? null : q.id"
        >
          <span class="bs-fdot" :style="{ background: q.color }"></span>{{ q.label }}
        </button>
      </div>
      <div class="bs-overall">
        <div class="bs-progress-bar"><div class="bs-progress-fill" :style="{ width: overallProgress + '%' }"></div></div>
        <span>{{ overallProgress }}%</span>
      </div>
    </div>

    <!-- 书架区 -->
    <div class="bs-library">
      <div v-for="q in QUADRANTS" :key="q.id"
        :class="['tc-shelf', { dim: activeQuadrant && activeQuadrant !== q.id }]"
        :data-qid="q.id"
        :style="{ '--wood': q.wood, '--accent': q.color }"
      >
        <!-- 书架标签 -->
        <div class="bs-shelf-label">
          <span class="bs-shelf-dot" :style="{ background: q.color }"></span>
          <span class="bs-shelf-name">{{ q.label }}</span>
          <span class="bs-shelf-desc">{{ q.desc }}</span>
          <span class="bs-shelf-count">{{ nodesByQuadrant(q.id).length }}本</span>
        </div>

        <!-- 书本行 -->
        <div
          class="bs-shelf-books"
          :class="{ 'drag-over': dragOverShelf === q.id }"
        >
          <div v-if="nodesByQuadrant(q.id).length === 0" class="bs-empty">拖书到这里</div>

          <div
            v-for="node in nodesByQuadrant(q.id)"
            :key="node.id"
            :class="['bs-book', `status-${node.status}`, { dragging: dragBook?.id === node.id }]"
            :style="{
              width: bookThickness(node) + 'px',
              '--spine': spineColor(node),
              '--spine-dark': spineColor(node) + 'cc'
            }"
            @pointerdown="startBookDrag($event, node)"
            @click="openWindow(node)"
          >
            <!-- 书脊顶部装饰 -->
            <div class="bs-book-head" :style="{ background: spineColor(node) }"></div>
            <!-- 书脊主体 -->
            <div class="bs-book-spine">
              <span class="bs-book-icon">{{ node.icon }}</span>
              <span class="bs-book-title">{{ node.name }}</span>
              <!-- 进度填充 -->
              <div class="bs-book-progress-fill" :style="{ height: node.progress + '%', background: spineColor(node) }"></div>
            </div>
            <!-- 书脊底部 -->
            <div class="bs-book-foot">
              <span class="bs-book-pct">{{ node.progress }}%</span>
            </div>
          </div>
        </div>

        <!-- 搁板 -->
        <div class="bs-shelf-board" :style="{ background: `linear-gradient(180deg, ${q.wood}, ${q.wood}dd)` }">
          <div class="bs-shelf-board-edge"></div>
        </div>
      </div>
    </div>

    <!-- 拖拽中的书影 -->
    <div class="bs-drag-clone" :style="dragCloneStyle">
      <div class="bs-book-head" :style="{ background: dragBook ? spineColor(dragBook) : '#888' }"></div>
      <div class="bs-book-spine" style="background: #fff; opacity: 0.9;">
        <span class="bs-book-icon">{{ dragBook?.icon }}</span>
        <span class="bs-book-title">{{ dragBook?.name }}</span>
      </div>
      <div class="bs-book-foot"></div>
    </div>

    <!-- 浮动详情窗口 -->
    <div v-for="win in floatingWindows" :key="win.id"
      class="bs-float"
      :class="{ minimized: win.minimized }"
      :style="{ left: win.x + 'px', top: win.y + 'px', width: win.w + 'px', zIndex: win.z }"
      @pointerdown="bringToFront(win.id)"
    >
      <div class="bs-float-head" @pointerdown="startWinDrag($event, win.id)">
        <span class="bs-float-icon">{{ win.node.icon }}</span>
        <span class="bs-float-name">{{ win.node.name }}</span>
        <span class="bs-float-st" :style="{ color: spineColor(win.node) }">{{ win.node.status === 'completed' ? '已读完' : win.node.status === 'in_progress' ? '在读' : '未开始' }}</span>
        <button class="bs-float-act" @click.stop="minimizeWindow(win.id)">_</button>
        <button class="bs-float-act" @click.stop="closeWindow(win.id)">×</button>
      </div>
      <div v-if="!win.minimized" class="bs-float-body">
        <!-- 进度 + 状态 -->
        <div class="bs-float-prog">
          <div class="bs-progress-bar sm"><div class="bs-progress-fill" :style="{ width: win.node.progress + '%', background: spineColor(win.node) }"></div></div>
          <span>{{ win.node.progress }}%</span>
          <div class="bs-status-btns">
            <button :class="{ on: win.node.status === 'not_started' }" @click="setStatus(win.node, 'not_started')">未开始</button>
            <button :class="{ on: win.node.status === 'in_progress' }" @click="setStatus(win.node, 'in_progress')">在读</button>
            <button :class="{ on: win.node.status === 'completed' }" @click="setStatus(win.node, 'completed')">已读完</button>
          </div>
        </div>

        <!-- 资源列表 -->
        <div class="bs-sec">
          <h4>📖 学习资源</h4>
          <div v-if="win.node.resources?.length" class="bs-res-list">
            <div v-for="(r, ri) in win.node.resources" :key="ri" :class="['bs-res', { done: r.done }]">
              <span class="bs-res-chk" @click="toggleResource(win.node, ri)">{{ r.done ? '✓' : '○' }}</span>
              <span class="bs-res-tag">{{ r.type === 'book' ? '📕' : r.type === 'article' ? '📄' : '🔗' }}</span>
              <div class="bs-res-info">
                <span class="bs-res-title">{{ r.title }}</span>
                <span v-if="r.author" class="bs-res-author">— {{ r.author }}</span>
              </div>
              <a v-if="r.url" :href="r.url" target="_blank" class="bs-res-link" @click.stop>🔗</a>
              <button class="bs-res-del" @click="removeResource(win.node, ri)">×</button>
            </div>
          </div>
          <div v-else class="bs-hint">暂无资源</div>
        </div>

        <!-- 添加资源 -->
        <div class="bs-add">
          <select v-model="newResType" class="bs-sel">
            <option value="book">书</option>
            <option value="article">文章</option>
            <option value="link">链接</option>
          </select>
          <input v-model="newResTitle" placeholder="标题" class="bs-inp" @keyup.enter="addResource(win.node)" />
          <input v-if="newResType === 'book'" v-model="newResAuthor" placeholder="作者" class="bs-inp sh" />
          <input v-else v-model="newResUrl" placeholder="URL" class="bs-inp sh" />
          <button class="bs-add-btn" @click="addResource(win.node)">+</button>
        </div>

        <!-- 笔记 -->
        <div class="bs-sec">
          <h4>✎ 笔记</h4>
          <textarea :value="win.node.notes" @input="win.node.notes = $event.target.value; saveData()" placeholder="记录心得..." class="bs-notes"></textarea>
        </div>
      </div>
    </div>

    <footer class="bs-footer">拖拽书本可移入不同书架 | 点击书本查看详情 → 添加资源、写笔记 | Esc 关闭所有窗口</footer>
  </div>
</template>

<style scoped>
/* ==================== 根 ==================== */
.bs-root {
  min-height: 100vh; background: #2c2420; color: #d4c5b2;
  font-family: 'Georgia', 'Noto Serif SC', 'Microsoft YaHei', serif;
  display: flex; flex-direction: column;
  background-image: radial-gradient(ellipse at 50% 0%, #3d3228 0%, #2c2420 60%);
}

/* ==================== 顶栏 ==================== */
.bs-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 28px; background: #1e1916; border-bottom: 1px solid #3d3228;
  flex-shrink: 0; gap: 16px;
}
.bs-title { font-size: 20px; font-weight: 400; letter-spacing: 4px; color: #e8d5b0; margin: 0; white-space: nowrap; }
.bs-header-right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.bs-search {
  padding: 6px 12px; border: 1px solid #3d3228; border-radius: 6px;
  background: #2c2420; color: #d4c5b2; font-size: 12px; width: 200px;
  outline: none; font-family: inherit;
}
.bs-search:focus { border-color: #8b6b4e; }
.bs-chip { font-size: 11px; padding: 2px 10px; border-radius: 10px; font-weight: 600; }
.bs-chip.done { background: #14532d44; color: #4ade80; }
.bs-chip.active { background: #1e3a5f44; color: #60a5fa; }
.bs-chip.total { background: #3d322844; color: #a89a80; }
.bs-btn {
  padding: 5px 14px; border: 1px solid #3d3228; border-radius: 6px;
  background: #2c2420; color: #a89a80; cursor: pointer; font-size: 12px;
  font-family: inherit; transition: all 0.15s;
}
.bs-btn:hover { border-color: #8b6b4e; color: #d4c5b2; }
.bs-btn.warn:hover { border-color: #c25b4a; color: #f87171; }

/* ==================== 工具栏 ==================== */
.bs-toolbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 28px; background: #1e191688; border-bottom: 1px solid #2c2420;
  flex-shrink: 0; gap: 16px;
}
.bs-filters { display: flex; gap: 6px; flex-wrap: wrap; }
.bs-fbtn {
  padding: 4px 14px; border-radius: 14px; border: 1px solid #3d3228;
  background: transparent; color: #8a7b6b; cursor: pointer; font-size: 11px;
  font-family: inherit; transition: all 0.15s; display: flex; align-items: center; gap: 5px;
}
.bs-fbtn:hover { border-color: #8b6b4e; color: #c4b59a; }
.bs-fbtn.active { font-weight: 600; }
.bs-fdot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.bs-overall { display: flex; align-items: center; gap: 10px; font-size: 12px; color: #8a7b6b; white-space: nowrap; }
.bs-progress-bar { width: 160px; height: 5px; background: #3d3228; border-radius: 3px; overflow: hidden; }
.bs-progress-bar.sm { width: auto; flex: 1; height: 4px; }
.bs-progress-fill { height: 100%; background: #8b6b4e; border-radius: 3px; transition: width 0.5s; }

/* ==================== 书架区 ==================== */
.bs-library {
  flex: 1; overflow-y: auto; padding: 20px 28px 32px;
  display: flex; flex-direction: column; gap: 24px;
}

/* 单个书架 */
.tc-shelf { transition: opacity 0.3s; }
.tc-shelf.dim { opacity: 0.25; }

.bs-shelf-label {
  display: flex; align-items: center; gap: 8px; padding: 0 4px 8px;
}
.bs-shelf-dot { width: 10px; height: 10px; border-radius: 50%; }
.bs-shelf-name { font-size: 15px; font-weight: 600; color: #d4c5b2; letter-spacing: 2px; }
.bs-shelf-desc { font-size: 11px; color: #6b5e4e; }
.bs-shelf-count { margin-left: auto; font-size: 11px; color: #5a4a3a; }

/* 书本行 */
.bs-shelf-books {
  display: flex; gap: 6px; padding: 6px 8px 2px;
  min-height: 170px; align-items: flex-end; flex-wrap: wrap;
  background: #1e191644; border-radius: 4px 4px 0 0;
  transition: background 0.2s;
}
.bs-shelf-books.drag-over { background: #8b6b4e22; outline: 2px dashed #8b6b4e44; outline-offset: -2px; }
.bs-empty { color: #3d3228; font-size: 12px; padding: 20px; align-self: center; }

/* ==================== 书本 ==================== */
.bs-book {
  cursor: grab; user-select: none; position: relative;
  transition: transform 0.15s, box-shadow 0.15s;
  display: flex; flex-direction: column;
}
.bs-book:hover { transform: translateY(-6px); z-index: 5; }
.bs-book:active { cursor: grabbing; }
.bs-book.dragging { opacity: 0.3; }

/* 书头 */
.bs-book-head {
  height: 8px; border-radius: 3px 3px 0 0;
  transition: background 0.3s;
}

/* 书脊 */
.bs-book-spine {
  flex: 1; background: #f5f0e8;
  display: flex; flex-direction: column; align-items: center;
  justify-content: flex-start; padding: 10px 6px; gap: 6px;
  position: relative; overflow: hidden;
  border-left: 2px solid #00000015; border-right: 2px solid #00000015;
  min-height: 110px;
}
.bs-book-icon { font-size: 18px; position: relative; z-index: 1; flex-shrink: 0; }
.bs-book-title {
  writing-mode: vertical-rl; font-size: 11px; font-weight: 600;
  color: #3d3228; letter-spacing: 2px; line-height: 1.4;
  position: relative; z-index: 1;
  max-height: 80px; overflow: hidden;
}

/* 进度填充（从底部向上） */
.bs-book-progress-fill {
  position: absolute; bottom: 0; left: 0; right: 0;
  transition: height 0.5s ease; opacity: 0.2; z-index: 0;
}

/* 书脚 */
.bs-book-foot {
  height: 18px; background: #e8e0d5;
  border-radius: 0 0 2px 2px;
  border-top: 1px solid #d4c5b2;
  display: flex; align-items: center; justify-content: center;
  border-left: 2px solid #00000010; border-right: 2px solid #00000010;
}
.bs-book-pct { font-size: 8px; color: #8a7b6b; font-weight: 700; }

/* 已读完绿色 */
.bs-book.status-completed .bs-book-spine { background: #f0fdf4; }
.bs-book.status-completed .bs-book-head { background: #22c55e; }
.bs-book.status-completed .bs-book-foot { background: #dcfce7; }
.bs-book.status-completed .bs-book-progress-fill { opacity: 0.3; }

/* 书架搁板 */
.bs-shelf-board {
  height: 14px; border-radius: 0 0 4px 4px;
  position: relative; box-shadow: 0 4px 12px rgba(0,0,0,0.4);
}
.bs-shelf-board-edge { position: absolute; bottom: 0; left: 0; right: 0; height: 3px; background: #00000030; border-radius: 0 0 4px 4px; }

/* ==================== 拖拽克隆 ==================== */
.bs-drag-clone {
  position: fixed; z-index: 999; pointer-events: none;
  display: flex; flex-direction: column; width: 54px;
  opacity: 0.85; transform: rotate(-3deg);
  box-shadow: 0 12px 40px rgba(0,0,0,0.5);
}
.bs-drag-clone .bs-book-spine { background: #fff !important; min-height: 100px; }

/* ==================== 浮动窗口 ==================== */
.bs-float {
  position: fixed; background: #1e1916; border-radius: 10px;
  box-shadow: 0 12px 50px rgba(0,0,0,0.6); border: 1px solid #3d3228;
  overflow: hidden; display: flex; flex-direction: column; max-height: 70vh;
}
.bs-float.minimized { max-height: none; }
.bs-float-head {
  display: flex; align-items: center; gap: 8px; padding: 8px 12px;
  background: #2c2420; border-bottom: 1px solid #3d3228; cursor: grab;
}
.bs-float-icon { font-size: 16px; }
.bs-float-name { font-size: 13px; font-weight: 700; color: #d4c5b2; flex: 1; }
.bs-float-st { font-size: 11px; font-weight: 600; }
.bs-float-act {
  width: 22px; height: 22px; border: none; background: none;
  cursor: pointer; font-size: 13px; color: #6b5e4e; border-radius: 4px;
}
.bs-float-act:hover { background: #3d3228; color: #c4b59a; }
.bs-float-body { padding: 12px; overflow-y: auto; flex: 1; }
.bs-float-prog { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; }
.bs-status-btns { display: flex; gap: 4px; margin-left: auto; }
.bs-status-btns button {
  font-size: 10px; padding: 3px 8px; border-radius: 10px;
  border: 1px solid #3d3228; background: transparent; cursor: pointer;
  color: #8a7b6b; font-family: inherit; transition: all 0.15s;
}
.bs-status-btns button.on { background: #8b6b4e; color: #fff; border-color: #8b6b4e; }
.bs-sec { margin-bottom: 14px; }
.bs-sec h4 { font-size: 11px; color: #6b5e4e; margin: 0 0 8px 0; letter-spacing: 1px; }

/* 资源列表 */
.bs-res-list { display: flex; flex-direction: column; gap: 4px; }
.bs-res {
  display: flex; align-items: center; gap: 6px; padding: 6px 8px;
  border-radius: 6px; background: #2c2420; font-size: 12px;
  border: 1px solid transparent; transition: all 0.15s;
}
.bs-res:hover { border-color: #3d3228; }
.bs-res.done { opacity: 0.55; }
.bs-res.done .bs-res-title { text-decoration: line-through; color: #4ade80; }
.bs-res-chk { cursor: pointer; font-size: 14px; color: #6b5e4e; flex-shrink: 0; }
.bs-res-tag { font-size: 12px; flex-shrink: 0; }
.bs-res-info { flex: 1; min-width: 0; }
.bs-res-title { font-weight: 500; color: #d4c5b2; }
.bs-res-author { color: #6b5e4e; }
.bs-res-link { color: #8b6b4e; text-decoration: none; font-size: 12px; flex-shrink: 0; }
.bs-res-del { border: none; background: none; cursor: pointer; color: #3d3228; font-size: 14px; }
.bs-res-del:hover { color: #f87171; }
.bs-hint { font-size: 12px; color: #3d3228; text-align: center; padding: 12px; }

/* 添加资源 */
.bs-add { display: flex; gap: 5px; margin-bottom: 14px; align-items: center; }
.bs-sel { padding: 4px 6px; border: 1px solid #3d3228; border-radius: 5px; background: #2c2420; color: #d4c5b2; font-size: 11px; font-family: inherit; }
.bs-inp { flex: 1; padding: 5px 8px; border: 1px solid #3d3228; border-radius: 5px; background: #2c2420; color: #d4c5b2; font-size: 11px; outline: none; font-family: inherit; min-width: 0; }
.bs-inp:focus { border-color: #8b6b4e; }
.bs-inp.sh { flex: 0 1 70px; }
.bs-add-btn { padding: 5px 12px; border: none; border-radius: 5px; background: #8b6b4e; color: #fff; cursor: pointer; font-size: 14px; }
.bs-add-btn:hover { background: #a07d5a; }

/* 笔记 */
.bs-notes {
  width: 100%; height: 56px; padding: 8px; border: 1px solid #3d3228; border-radius: 6px;
  background: #2c2420; color: #d4c5b2; font-size: 12px; resize: vertical;
  outline: none; font-family: inherit; box-sizing: border-box;
}
.bs-notes:focus { border-color: #8b6b4e; }

/* 底部 */
.bs-footer {
  text-align: center; padding: 10px 20px; background: #1e1916;
  border-top: 1px solid #2c2420; font-size: 11px; color: #3d3228;
  flex-shrink: 0;
}
</style>
