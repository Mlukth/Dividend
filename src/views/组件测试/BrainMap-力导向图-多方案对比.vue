<template>
  <div class="preview-page">
    <h2 class="page-title">脑图力导向图 — 多方案对比</h2>
    <p class="page-desc">
      同一份数据（3个主题→子任务→具体行动），用不同的渲染引擎和交互模式实现。<br>
      每套方案侧重点不同：有的轻量快速，有的交互丰富，有的生态成熟。
    </p>

    <!-- ===== 方案 A: ECharts ===== -->
    <div class="section-label">
      <span class="badge scheme-a">方案 A</span>
      <strong>ECharts Graph — 配置式力导向图</strong>
      <span class="tag tag-ok">已安装</span>
    </div>
    <div class="schemes-row single-scheme">
      <div class="scheme-wide">
        <div ref="chartA" class="chart-box" style="height:460px"></div>
        <ul class="scheme-notes-sm">
          <li>✅ 已安装 echarts ^6.0.0，开箱即用</li>
          <li>✅ 内置 force layout + 缩放/拖拽/tooltip</li>
          <li>✅ 配置式开发，代码量最少（~60行）</li>
          <li>⚠️ 节点交互定制受限于 ECharts API</li>
          <li>⚠️ 节点样式用 rich text，复杂UI难以实现</li>
          <li>⚠️ collapse/expand 需手动实现</li>
        </ul>
      </div>
    </div>

    <!-- ===== 方案 B: 纯 SVG + 手写力模拟 ===== -->
    <div class="section-label">
      <span class="badge scheme-b">方案 B</span>
      <strong>纯 SVG + 手写力模拟</strong>
      <span class="tag tag-zero">零依赖</span>
    </div>
    <div class="schemes-row single-scheme">
      <div class="scheme-wide">
        <div ref="chartB" class="chart-box" style="height:460px;position:relative">
          <svg ref="svgB" width="100%" height="100%" style="background:#1a1a2e;border-radius:12px"></svg>
        </div>
        <ul class="scheme-notes-sm">
          <li>✅ 零依赖，纯 JavaScript + SVG DOM</li>
          <li>✅ 每个节点/边都是真实 DOM，CSS 动画、样式完全可控</li>
          <li>✅ 可以嵌入任意 HTML（按钮、输入框、进度条）</li>
          <li>⚠️ 力模拟需自己写（~80行，但逻辑透明）</li>
          <li>⚠️ 节点 > 200 时 SVG 性能下降（可用 Canvas 替代）</li>
          <li>✅ 最适合做"可点击交互节点"的方案</li>
        </ul>
      </div>
    </div>

    <!-- ===== 方案 C: 三种力布局算法对比 ===== -->
    <div class="section-label">
      <span class="badge scheme-c">方案 C</span>
      <strong>力布局算法对比（同一数据集）</strong>
      <span class="tag tag-algo">算法</span>
    </div>
    <div class="schemes-row">
      <div class="scheme-column" v-for="(item, i) in schemeC" :key="'c'+i">
        <div class="scheme-sub-label">{{ item.label }}</div>
        <div :ref="el => chartCRefs[i] = el" class="chart-box-sm"></div>
        <ul class="scheme-notes-sm">
          <li v-for="n in item.notes" :key="n">{{ n }}</li>
        </ul>
      </div>
    </div>

    <!-- ===== 方案 D: 节点状态视觉传达 ===== -->
    <div class="section-label">
      <span class="badge scheme-d">方案 D</span>
      <strong>节点状态视觉传达方案</strong>
      <span class="tag tag-visual">视觉</span>
    </div>
    <div class="schemes-row">
      <div class="scheme-column" v-for="(item, i) in schemeD" :key="'d'+i">
        <div class="scheme-sub-label">{{ item.label }}</div>
        <div class="node-viz-demo" :style="{background: item.bg || '#1a1a2e'}">
          <div v-for="(node, j) in item.nodes" :key="j"
            class="demo-node"
            :style="nodeStyle(node, item.theme)"
          >
            <span class="demo-node-label">{{ node.label }}</span>
            <span v-if="node.badge" class="demo-node-badge">{{ node.badge }}</span>
          </div>
        </div>
        <ul class="scheme-notes-sm">
          <li v-for="n in item.notes" :key="n">{{ n }}</li>
        </ul>
      </div>
    </div>

    <!-- ===== 方案 E: 交互模式对比 ===== -->
    <div class="section-label">
      <span class="badge scheme-e">方案 E</span>
      <strong>节点交互模式对比</strong>
      <span class="tag tag-interact">交互</span>
    </div>
    <div class="schemes-row">
      <div class="scheme-column" v-for="(item, i) in schemeE" :key="'e'+i">
        <div class="scheme-sub-label">{{ item.label }}</div>
        <div class="interact-demo" :style="{background: '#1a1a2e'}">
          <div class="interact-node"
            :class="{ active: item.activeAnim }"
            @click="item.activeAnim = !item.activeAnim"
          >
            <span>{{ item.nodeLabel || '目标节点' }}</span>
          </div>
          <!-- 交互面板模拟 -->
          <div class="interact-panel" v-if="item.showPanel !== false && item.activeAnim">
            <div class="interact-panel-hdr">{{ item.panelTitle || '节点详情' }}</div>
            <div class="interact-panel-body">
              <div v-if="item.panelType === 'edit'" style="display:flex;flex-direction:column;gap:6px">
                <input class="interact-input" placeholder="补充需求描述..." />
                <textarea class="interact-textarea" rows="2" placeholder="详细说明..."></textarea>
                <div style="display:flex;gap:4px">
                  <span class="ph-d-chip on">保存</span>
                  <span class="ph-d-chip">删除节点</span>
                </div>
              </div>
              <div v-if="item.panelType === 'navigate'" style="display:flex;flex-direction:column;gap:4px">
                <div v-for="a in (item.actions || ['展开子节点','标记完成','添加依赖','查看详情'])" :key="a"
                  class="interact-action-row">{{ a }} →</div>
              </div>
              <div v-if="item.panelType === 'status'" style="display:flex;flex-wrap:wrap;gap:3px">
                <span v-for="s in ['🟢 进行中','✅ 已完成','⏸️ 搁置','🔴 阻塞']" :key="s"
                  class="ph-d-chip" style="font-size:10px">{{ s }}</span>
              </div>
            </div>
          </div>
          <!-- 提示文字 -->
          <div style="position:absolute;bottom:8px;font-size:9px;color:#666;text-align:center;width:100%">
            {{ item.activeAnim ? '面板已展开' : '点击节点展开面板 ↑' }}
          </div>
        </div>
        <ul class="scheme-notes-sm">
          <li v-for="n in item.notes" :key="n">{{ n }}</li>
        </ul>
      </div>
    </div>

    <!-- ===== 总结对比表 ===== -->
    <div class="interaction-tip">
      <h3>方案对照表</h3>
      <table class="compare-table">
        <thead>
          <tr>
            <th>维度</th>
            <th>方案 A: ECharts</th>
            <th>方案 B: 纯SVG</th>
            <th>方案 C: 其他布局</th>
            <th>推荐</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>渲染引擎</strong></td>
            <td>Canvas (ECharts 内部)</td>
            <td>SVG DOM</td>
            <td>Canvas/SVG/WebGL</td>
            <td>看节点数</td>
          </tr>
          <tr>
            <td><strong>安装成本</strong></td>
            <td>0（已安装）</td>
            <td>0（零依赖）</td>
            <td>需安装 1-2 个包</td>
            <td>A 或 B</td>
          </tr>
          <tr>
            <td><strong>节点交互</strong></td>
            <td>click/hover API</td>
            <td>完全自由 DOM 事件</td>
            <td>取决于库</td>
            <td><strong>B 最优</strong></td>
          </tr>
          <tr>
            <td><strong>节点内嵌HTML</strong></td>
            <td>❌ 仅 rich text</td>
            <td>✅ 任意 HTML/CSS</td>
            <td>部分支持</td>
            <td><strong>B 最优</strong></td>
          </tr>
          <tr>
            <td><strong>力导向质量</strong></td>
            <td>⭐⭐⭐ 够用</td>
            <td>⭐⭐ 需调参</td>
            <td>⭐⭐⭐ D3标准</td>
            <td>C（如装D3）</td>
          </tr>
          <tr>
            <td><strong>大规模节点(500+)</strong></td>
            <td>⭐⭐⭐ Canvas</td>
            <td>⭐ SVG 卡顿</td>
            <td>⭐⭐⭐ Canvas</td>
            <td>A 或 C</td>
          </tr>
          <tr>
            <td><strong>动画能力</strong></td>
            <td>内置过渡动画</td>
            <td>CSS transition/SMIL</td>
            <td>取决于库</td>
            <td>A 或 B</td>
          </tr>
          <tr>
            <td><strong>移动端适配</strong></td>
            <td>✅ 响应式</td>
            <td>✅ 完全可控</td>
            <td>因库而异</td>
            <td>均可</td>
          </tr>
        </tbody>
      </table>
      <p style="margin-top:16px">
        <strong>推荐路径</strong>：先用 <strong>方案 B（纯SVG）</strong> 做 MVP——
        节点可点击交互是核心需求，SVG 给最大自由度。力模拟代码透明可控。
        如果后续节点数超200，迁移到 <strong>D3-force + Canvas</strong>（方案C的变体），力模拟逻辑一致，只换渲染层。
        方案 A（ECharts）可作为快速原型验证数据结构的工具。
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'

// ==================== 共享数据 ====================
const graphData = {
  nodes: [
    // 主题1: 邮件管线
    { id: 't1', name: '邮件管线\nqwen集成', category: 0, symbolSize: 42 },
    { id: 't1-1', name: 'poller守护', category: 0, symbolSize: 24 },
    { id: 't1-2', name: 'IDLE推送', category: 0, symbolSize: 24 },
    { id: 't1-3', name: 'qwen分类', category: 0, symbolSize: 24 },
    { id: 't1-1a', name: '进程保活', category: 0, symbolSize: 16 },
    { id: 't1-1b', name: '崩溃重启', category: 0, symbolSize: 16 },
    { id: 't1-3a', name: 'prompt调优', category: 0, symbolSize: 16 },
    // 主题2: D盘备份
    { id: 't2', name: 'D盘自动\n备份工具', category: 1, symbolSize: 42 },
    { id: 't2-1', name: '增量扫描', category: 1, symbolSize: 24 },
    { id: 't2-2', name: 'Git Push', category: 1, symbolSize: 24 },
    { id: 't2-1a', name: 'SHA比对', category: 1, symbolSize: 16 },
    { id: 't2-1b', name: '定时调度', category: 1, symbolSize: 16 },
    // 主题3: 微信小程序
    { id: 't3', name: '小程序\n商城外包', category: 2, symbolSize: 42 },
    { id: 't3-1', name: '选型定案', category: 2, symbolSize: 24 },
    { id: 't3-2', name: '工期评估', category: 2, symbolSize: 24 },
    { id: 't3-1a', name: '开源方案', category: 2, symbolSize: 16 },
  ],
  links: [
    // 主题1 内部
    { source: 't1', target: 't1-1' }, { source: 't1', target: 't1-2' }, { source: 't1', target: 't1-3' },
    { source: 't1-1', target: 't1-1a' }, { source: 't1-1', target: 't1-1b' },
    { source: 't1-3', target: 't1-3a' },
    // 主题2 内部
    { source: 't2', target: 't2-1' }, { source: 't2', target: 't2-2' },
    { source: 't2-1', target: 't2-1a' }, { source: 't2-1', target: 't2-1b' },
    // 主题3 内部
    { source: 't3', target: 't3-1' }, { source: 't3', target: 't3-2' },
    { source: 't3-1', target: 't3-1a' },
    // 跨主题连接
    { source: 't1-3', target: 't3-2' }, // qwen分类 和 工期评估 相关
    { source: 't2-1', target: 't3-1a' }, // 增量扫描 和 开源方案 都用技术选型
  ]
}

// ==================== 方案 A: ECharts ====================
const chartA = ref(null)
onMounted(async () => {
  await nextTick()
  if (chartA.value) {
    const inst = echarts.init(chartA.value, 'dark')
    const categories = [
      { name: '邮件管线', itemStyle: { color: '#5470c6' } },
      { name: 'D盘备份', itemStyle: { color: '#91cc75' } },
      { name: '小程序商城', itemStyle: { color: '#fac858' } },
    ]
    inst.setOption({
      tooltip: { formatter: p => p.data.name?.replace(/\n/g, ' · ') },
      legend: { data: categories.map(c => c.name), bottom: 0, textStyle: { color: '#ccc' } },
      series: [{
        type: 'graph', layout: 'force', roam: true, draggable: true,
        categories,
        data: graphData.nodes.map(n => ({ ...n, name: n.name.replace(/\n/g, ' ') })),
        links: graphData.links,
        force: { repulsion: 300, edgeLength: [80, 200], gravity: 0.1 },
        label: { show: true, fontSize: 9, color: '#ddd', formatter: p => p.name },
        lineStyle: { color: 'source', curveness: 0.1, opacity: 0.5 },
        emphasis: { focus: 'adjacency', lineStyle: { width: 3 } },
      }]
    })
    window.addEventListener('resize', () => inst.resize())
  }
})

// ==================== 方案 B: 纯 SVG + 手写力模拟 ====================
const chartB = ref(null)
const svgB = ref(null)
onMounted(async () => {
  await nextTick()
  if (!svgB.value || !chartB.value) return

  const svg = svgB.value
  const W = chartB.value.clientWidth
  const H = 460
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`)

  // 创建 defs（渐变、滤镜、marker箭头）
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')

  // 箭头 marker
  const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker')
  marker.setAttribute('id', 'arrow')
  marker.setAttribute('viewBox', '0 -4 8 8')
  marker.setAttribute('refX', 20); marker.setAttribute('refY', 0)
  marker.setAttribute('markerWidth', 6); marker.setAttribute('markerHeight', 6)
  marker.setAttribute('orient', 'auto')
  const arrowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  arrowPath.setAttribute('d', 'M0,-4L8,0L0,4')
  arrowPath.setAttribute('fill', '#555')
  marker.appendChild(arrowPath)
  defs.appendChild(marker)

  // 发光滤镜
  const glow = document.createElementNS('http://www.w3.org/2000/svg', 'filter')
  glow.setAttribute('id', 'glow')
  glow.innerHTML = `<feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>`
  defs.appendChild(glow)
  svg.appendChild(defs)

  // 分组
  const edgeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  svg.appendChild(edgeGroup)
  svg.appendChild(nodeGroup)

  // 颜色
  const colors = ['#5470c6', '#91cc75', '#fac858']

  // 初始化节点位置（随机分布在中心周围）
  const nodes = graphData.nodes.map(n => ({
    ...n,
    x: W/2 + (Math.random() - 0.5) * 200,
    y: H/2 + (Math.random() - 0.5) * 200,
    vx: 0, vy: 0
  }))

  // 构建边的快速查找
  const linkMap = {}
  graphData.links.forEach(l => {
    const key = `${l.source}->${l.target}`
    linkMap[key] = true
  })

  // 创建 SVG 元素
  const edgeEls = graphData.links.map(l => {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    line.setAttribute('stroke', '#444')
    line.setAttribute('stroke-width', '1')
    line.setAttribute('opacity', '0.5')
    edgeGroup.appendChild(line)
    return { source: l.source, target: l.target, el: line }
  })

  const nodeEls = nodes.map(n => {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    g.style.cursor = 'pointer'

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    circle.setAttribute('r', n.symbolSize / 2)
    circle.setAttribute('fill', colors[n.category])
    circle.setAttribute('stroke', '#fff')
    circle.setAttribute('stroke-width', '1.5')
    circle.setAttribute('opacity', '0.9')
    g.appendChild(circle)

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    text.setAttribute('text-anchor', 'middle')
    text.setAttribute('dy', n.symbolSize / 2 + 12)
    text.setAttribute('fill', '#ccc')
    text.setAttribute('font-size', n.symbolSize > 30 ? '10' : '8')
    const lines = n.name.split('\n')
    lines.forEach((line, i) => {
      const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan')
      tspan.setAttribute('x', '0')
      tspan.setAttribute('dy', i === 0 ? '0' : '1.1em')
      tspan.textContent = line
      text.appendChild(tspan)
    })
    g.appendChild(text)

    // 悬停效果
    g.addEventListener('mouseenter', () => {
      circle.setAttribute('stroke', '#fff')
      circle.setAttribute('stroke-width', '3')
      circle.setAttribute('filter', 'url(#glow)')
    })
    g.addEventListener('mouseleave', () => {
      circle.setAttribute('stroke', '#fff')
      circle.setAttribute('stroke-width', '1.5')
      circle.setAttribute('filter', '')
    })

    // 拖拽
    let dragging = false
    g.addEventListener('mousedown', e => { dragging = true; e.stopPropagation() })
    window.addEventListener('mousemove', e => {
      if (!dragging) return
      const rect = svg.getBoundingClientRect()
      n.x = e.clientX - rect.left
      n.y = e.clientY - rect.top
    })
    window.addEventListener('mouseup', () => { dragging = false })

    nodeGroup.appendChild(g)
    return { ...n, g, circle, text }
  })

  // 力模拟循环
  function forceTick() {
    // 斥力（节点间）
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[j].x - nodes[i].x
        const dy = nodes[j].y - nodes[i].y
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        const force = 500 / (dist * dist)
        const fx = (dx / dist) * force
        const fy = (dy / dist) * force
        nodes[i].vx -= fx; nodes[i].vy -= fy
        nodes[j].vx += fx; nodes[j].vy += fy
      }
    }

    // 引力（边）
    graphData.links.forEach(l => {
      const s = nodes.find(n => n.id === l.source)
      const t = nodes.find(n => n.id === l.target)
      if (!s || !t) return
      const dx = t.x - s.x
      const dy = t.y - s.y
      const dist = Math.sqrt(dx * dx + dy * dy) || 1
      const targetDist = 100
      const force = (dist - targetDist) / dist * 0.05
      s.vx += dx * force; s.vy += dy * force
      t.vx -= dx * force; t.vy -= dy * force
    })

    // 中心引力
    nodes.forEach(n => {
      n.vx += (W/2 - n.x) * 0.003
      n.vy += (H/2 - n.y) * 0.003
      n.vx *= 0.85 // 阻尼
      n.vy *= 0.85
      n.x += n.vx
      n.y += n.vy
      // 边界
      n.x = Math.max(30, Math.min(W - 30, n.x))
      n.y = Math.max(30, Math.min(H - 30, n.y))
    })

    // 更新 SVG
    edgeEls.forEach(e => {
      const s = nodes.find(n => n.id === e.source)
      const t = nodes.find(n => n.id === e.target)
      if (s && t) {
        e.el.setAttribute('x1', s.x); e.el.setAttribute('y1', s.y)
        e.el.setAttribute('x2', t.x); e.el.setAttribute('y2', t.y)
      }
    })

    nodeEls.forEach(n => {
      n.g.setAttribute('transform', `translate(${n.x},${n.y})`)
    })
  }

  // 启动模拟（持续运行直到稳定）
  let tickCount = 0
  const maxTicks = 300
  function tick() {
    forceTick()
    tickCount++
    if (tickCount < maxTicks) {
      requestAnimationFrame(tick)
    }
  }
  tick()
})

// ==================== 方案 C: 布局算法对比 ====================
const chartCRefs = reactive([null, null, null])
const schemeC = reactive([
  {
    label: 'C1: 力导向 (force)',
    notes: [
      '节点互相排斥 + 边弹簧吸引',
      '收敛后呈现自然聚类',
      '适合：发现隐藏关系结构',
      '缺点：每次布局结果略有不同',
    ]
  },
  {
    label: 'C2: 径向树 (radial)',
    notes: [
      '根节点在中心，子节点按层级辐射',
      '层次关系一目了然',
      '适合：有明确主次的计划',
      '缺点：跨分支连线会显得乱',
    ]
  },
  {
    label: 'C3: 环形 (circular)',
    notes: [
      '所有节点均匀分布在圆环上',
      '适合：节点数少且彼此平等',
      '适合：展示循环依赖关系',
      '缺点：不表达层级',
    ]
  },
])

onMounted(async () => {
  await nextTick()
  // C1: 力导向（与方案A相同，换个颜色）
  if (chartCRefs[0]) {
    const inst = echarts.init(chartCRefs[0], 'dark')
    inst.setOption({
      series: [{
        type: 'graph', layout: 'force', roam: true,
        data: graphData.nodes.map(n => ({ ...n, name: n.name.replace(/\n/g, ' ') })),
        links: graphData.links,
        force: { repulsion: 200, edgeLength: [60, 150], gravity: 0.08 },
        label: { show: true, fontSize: 7, color: '#aaa', formatter: p => p.name.split(' ')[0] },
        itemStyle: { color: '#8b5cf6' },
        lineStyle: { color: '#444', curveness: 0.1, opacity: 0.4 },
      }]
    })
    window.addEventListener('resize', () => inst.resize())
  }

  // C2: 径向树（circular layout 模拟径向）
  if (chartCRefs[1]) {
    const inst = echarts.init(chartCRefs[1], 'dark')
    inst.setOption({
      series: [{
        type: 'graph', layout: 'circular', roam: true,
        data: graphData.nodes.map(n => ({ ...n, name: n.name.replace(/\n/g, ' ') })),
        links: graphData.links,
        label: { show: true, fontSize: 7, color: '#aaa', formatter: p => p.name.split(' ')[0] },
        itemStyle: { color: '#ec4899' },
        lineStyle: { color: '#444', curveness: 0.1, opacity: 0.4 },
        circular: { rotateLabel: true },
      }]
    })
    window.addEventListener('resize', () => inst.resize())
  }

  // C3: 环形（与C2相同layout但不同视觉参数，用 force + 极低repulsion模拟松散环形）
  if (chartCRefs[2]) {
    const inst = echarts.init(chartCRefs[2], 'dark')
    inst.setOption({
      series: [{
        type: 'graph', layout: 'force', roam: true,
        data: graphData.nodes.map(n => ({ ...n, name: n.name.replace(/\n/g, ' ') })),
        links: graphData.links,
        force: { repulsion: 600, edgeLength: [120, 250], gravity: 0.02 },
        label: { show: true, fontSize: 7, color: '#aaa', formatter: p => p.name.split(' ')[0] },
        itemStyle: { color: '#f97316' },
        lineStyle: { color: '#444', curveness: 0.2, opacity: 0.4 },
      }]
    })
    window.addEventListener('resize', () => inst.resize())
  }
})

// ==================== 方案 D: 节点状态视觉传达 ====================
const schemeD = reactive([
  {
    label: 'D1: 深浅+标记',
    theme: 'opacity',
    bg: '#1a1a2e',
    nodes: [
      { label: '已完成', status: 'done', badge: '✓' },
      { label: '进行中', status: 'active' },
      { label: '下一个', status: 'next' },
      { label: '未触及', status: 'dim' },
    ],
    notes: [
      '已完成→变暗+✓标记',
      '进行中→高亮+脉冲',
      '下一个目标→边框高亮',
      '未触及分支→低不透明度',
      '只衰减视觉，不删节点',
    ]
  },
  {
    label: 'D2: 颜色编码',
    theme: 'color',
    bg: '#1a1a2e',
    nodes: [
      { label: '已完成', status: 'done' },
      { label: '进行中', status: 'active' },
      { label: '阻塞', status: 'blocked' },
      { label: '未开始', status: 'pending' },
    ],
    notes: [
      '绿色=已完成，蓝色=进行中',
      '红色=阻塞，灰色=未开始',
      '颜色直观但需图例说明',
      '适合节点数多的场景',
    ]
  },
  {
    label: 'D3: 大小缩放',
    theme: 'size',
    bg: '#1a1a2e',
    nodes: [
      { label: '当前焦点', status: 'focus', size: 48 },
      { label: '相关节点', status: 'related', size: 32 },
      { label: '背景节点', status: 'bg', size: 20 },
    ],
    notes: [
      '焦点节点放大+居中',
      '相关节点中等大小',
      '背景节点缩小退后',
      '本质是 fisheye 变体',
    ]
  },
  {
    label: 'D4: 边框动画',
    theme: 'border',
    bg: '#1a1a2e',
    nodes: [
      { label: '脉冲边框', status: 'pulse' },
      { label: '虚线边框', status: 'dashed' },
      { label: '实线边框', status: 'solid' },
      { label: '无边框', status: 'none' },
    ],
    notes: [
      '脉冲=当前工作节点',
      '虚线=下一步目标',
      '实线=活跃节点',
      '无边框=休眠节点',
      '动画最省性能',
    ]
  },
])

function nodeStyle(node, theme) {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '6px 12px', borderRadius: '8px', fontSize: '12px',
    margin: '4px', transition: 'all 0.3s',
  }
  if (theme === 'opacity') {
    const map = { done: 0.35, active: 1, next: 0.8, dim: 0.25 }
    return { ...base, background: '#2d2d3f', color: '#ccc', opacity: map[node.status] || 1,
      border: node.status === 'next' ? '2px solid #409eff' : '2px solid transparent',
      animation: node.status === 'active' ? 'pulse 2s infinite' : 'none',
    }
  }
  if (theme === 'color') {
    const map = { done: '#22C55E', active: '#409eff', blocked: '#e53e3e', pending: '#555' }
    return { ...base, background: map[node.status] || '#555', color: '#fff' }
  }
  if (theme === 'size') {
    const map = { focus: 48, related: 32, bg: 20 }
    const s = map[node.status] || 28
    return { ...base, background: '#2d2d3f', color: '#fff', fontSize: s/3 + 'px', padding: s/6 + 'px ' + s/3 + 'px',
      transform: node.status === 'focus' ? 'scale(1.15)' : 'scale(1)',
    }
  }
  if (theme === 'border') {
    const bmap = { pulse: '2px solid #409eff', dashed: '2px dashed #91cc75', solid: '1.5px solid #666', none: 'none' }
    return { ...base, background: '#2d2d3f', color: '#ccc', border: bmap[node.status] || 'none',
      animation: node.status === 'pulse' ? 'pulse 1.5s infinite' : 'none',
    }
  }
  return base
}

// ==================== 方案 E: 交互模式 ====================
const schemeE = reactive([
  {
    label: 'E1: 浮动面板',
    nodeLabel: '📋 任务节点',
    panelType: 'navigate',
    panelTitle: '操作菜单',
    activeAnim: false, showPanel: true,
    notes: [
      '点击节点→弹出浮动操作面板',
      '面板列出可执行操作',
      '类似右键菜单但更直观',
      '适合操作选项少的场景',
    ]
  },
  {
    label: 'E2: 内联编辑',
    nodeLabel: '✏️ 可编辑节点',
    panelType: 'edit',
    panelTitle: '编辑节点',
    activeAnim: false, showPanel: true,
    notes: [
      '点击节点→内联编辑面板',
      '可直接输入/修改文字',
      '保存后更新图数据',
      '适合需要频繁补充内容的节点',
    ]
  },
  {
    label: 'E3: 状态切换',
    nodeLabel: '🔄 状态节点',
    panelType: 'status',
    panelTitle: '状态',
    activeAnim: false, showPanel: true,
    notes: [
      '点击节点→弹出状态选择器',
      '快速切换进行中/完成/搁置',
      '切换后节点视觉自动更新',
      '适合轻量级进度追踪',
    ]
  },
  {
    label: 'E4: 智能推荐',
    nodeLabel: '🤖 AI节点',
    panelTitle: 'Claude 建议',
    activeAnim: false, showPanel: true,
    panelType: 'navigate',
    actions: ['拆解为子任务','关联已有节点','标记为完成','向Claude提问...'],
    notes: [
      '点击节点→Claude分析上下文',
      '给出智能建议（拆解/关联）',
      '用户确认后自动更新图',
      '这是Hook集成的入口点',
    ]
  },
])
</script>

<style scoped>
* { box-sizing: border-box; }

.preview-page {
  padding: 24px 20px; max-width: 1500px; margin: 0 auto;
  font-family: system-ui, -apple-system, 'Microsoft YaHei', sans-serif;
  background: #f0f2f5; min-height: 100vh;
}

.page-title { text-align: center; margin-bottom: 8px; color: #1e1e1e; font-weight: 600; font-size: 24px; }
.page-desc { text-align: center; color: #555; margin-bottom: 0; font-size: 13px; line-height: 1.6; }

/* 分区标签 */
.section-label {
  display: flex; align-items: center; gap: 8px;
  margin: 28px 0 14px; padding: 12px 18px;
  background: #fff; border-radius: 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.badge { padding: 4px 10px; border-radius: 30px; font-size: 12px; font-weight: 600; color: white; }
.badge.scheme-a { background: #5470c6; }
.badge.scheme-b { background: #91cc75; color: #1e1e1e; }
.badge.scheme-c { background: #8b5cf6; }
.badge.scheme-d { background: #ec4899; }
.badge.scheme-e { background: #f97316; }

.tag { margin-left: 4px; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 600; }
.tag-ok { background: #d4edda; color: #155724; }
.tag-zero { background: #cce5ff; color: #004085; }
.tag-algo { background: #fff3cd; color: #856404; }
.tag-visual { background: #fce4ec; color: #880e4f; }
.tag-interact { background: #e8f5e9; color: #2e7d32; }

/* 方案行 */
.schemes-row { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
.single-scheme { flex-direction: column; }

.scheme-wide {
  background: #ffffff; border-radius: 20px; padding: 20px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.05); width: 100%;
}

.scheme-column {
  flex: 1 1 240px; min-width: 240px; max-width: 320px;
  background: #ffffff; border-radius: 20px; padding: 16px 12px 20px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.05);
  display: flex; flex-direction: column;
}

.scheme-sub-label {
  font-size: 11px; font-weight: 600; color: #555;
  text-align: center; margin-bottom: 8px;
}

/* 图表容器 */
.chart-box, .chart-box-sm {
  background: #1a1a2e; border-radius: 12px;
  overflow: hidden; width: 100%;
}
.chart-box-sm { height: 260px; }

/* 方案 D: 节点视觉demo */
.node-viz-demo {
  border-radius: 12px; padding: 12px; min-height: 200px;
  display: flex; flex-wrap: wrap; align-content: flex-start;
  justify-content: center;
}

.demo-node {
  display: inline-flex; align-items: center; gap: 6px;
  position: relative;
}

.demo-node-label { font-weight: 500; }
.demo-node-badge {
  width: 18px; height: 18px; border-radius: 9px;
  background: #22C55E; color: #fff; font-size: 11px;
  display: flex; align-items: center; justify-content: center;
}

/* 方案 E: 交互demo */
.interact-demo {
  border-radius: 12px; padding: 20px; min-height: 220px;
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; position: relative; gap: 12px;
}

.interact-node {
  padding: 10px 20px; border-radius: 12px;
  background: #5470c6; color: #fff; font-size: 13px;
  cursor: pointer; transition: all 0.2s;
  border: 2px solid transparent;
}
.interact-node:hover { border-color: #fff; transform: scale(1.05); }
.interact-node.active { border-color: #fff; box-shadow: 0 0 16px rgba(84,112,198,0.6); }

.interact-panel {
  background: #252540; border-radius: 10px; width: 100%;
  box-shadow: 0 4px 16px rgba(0,0,0,0.4); overflow: hidden;
}
.interact-panel-hdr {
  padding: 8px 12px; font-size: 11px; font-weight: 700; color: #fff;
  border-bottom: 1px solid #374151;
}
.interact-panel-body { padding: 10px; }

.interact-input, .interact-textarea {
  width: 100%; background: #1a1a2e; border: 1px solid #374151;
  border-radius: 6px; padding: 6px 8px; color: #ccc; font-size: 10px;
  font-family: inherit; resize: vertical;
}

.interact-action-row {
  padding: 6px 10px; border-radius: 6px; font-size: 10px; color: #ccc;
  cursor: pointer; background: #2d2d3f; transition: background 0.15s;
}
.interact-action-row:hover { background: #374151; color: #fff; }

/* 通用 */
.ph-d-chip {
  padding: 4px 8px; border-radius: 8px; font-size: 9px;
  background: #374151; color: #888; cursor: pointer; display: inline-block;
}
.ph-d-chip.on { background: #409eff; color: #fff; }

.scheme-notes-sm { margin: 8px 0 0; padding-left: 18px; color: #666; font-size: 11px; line-height: 1.5; }

/* 对比表格 */
.interaction-tip {
  margin-top: 32px; background: #e6f7ff; border-radius: 20px; padding: 20px 28px; border-left: 6px solid #1890ff;
}
.interaction-tip h3 { margin: 0 0 12px; color: #1e1e1e; }

.compare-table {
  width: 100%; border-collapse: collapse; font-size: 12px;
}
.compare-table th {
  background: #d4e6f1; padding: 8px 10px; text-align: left;
  font-weight: 600; color: #1e1e1e;
}
.compare-table td {
  padding: 8px 10px; border-bottom: 1px solid #d4e6f1; color: #333;
}

/* 脉冲动画 */
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(64,158,255,0.4); }
  50% { box-shadow: 0 0 0 8px rgba(64,158,255,0); }
}
</style>
