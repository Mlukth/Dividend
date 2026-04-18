<template>
  <div class="canvas-container">
    <!-- 完全匹配你F12获取的Canvas标签属性 -->
    <canvas
      ref="canvasRef"
      width="287"
      height="324"
      class="flow-canvas"
    ></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref(null)
let ctx = null
let animationId = null

// 流动箭头进度（0~1）
let arrow1 = 0 // 光伏→储能
let arrow2 = 0 // 光伏→负载
let arrow3 = 0 // 中间→电网

// 节点坐标配置（精准匹配布局）
const nodes = {
  pv: { x: 143, y: 50, color: '#FFB800', label: '2.266 kW' }, // 顶部光伏
  battery: { x: 50, y: 162, color: '#00E48F', label: '0.754 kW' }, // 左侧储能
  load: { x: 143, y: 274, color: '#00CCFF', label: '1.534 kW' }, // 底部负载
  grid: { x: 237, y: 162, color: '#D199FF', label: '0.022 kW' } // 右侧电网
}

// 初始化画布
onMounted(() => {
  const canvas = canvasRef.value
  ctx = canvas.getContext('2d')
  startAnimation()
})

// 主绘制函数
function draw() {
  if (!ctx) return
  // 清空画布
  ctx.clearRect(0, 0, 287, 324)
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, 287, 324)

  // 绘制顺序：路径 → 箭头 → 节点（层级正确）
  drawPaths()
  drawArrows()
  drawNodes()

  // 更新箭头进度
  arrow1 += 0.01
  arrow2 += 0.01
  arrow3 += 0.01
  if (arrow1 > 1) arrow1 = 0
  if (arrow2 > 1) arrow2 = 0
  if (arrow3 > 1) arrow3 = 0
}

// 1. 绘制3条能量路径
function drawPaths() {
  // 路径1：光伏 → 储能（转弯）
  drawGradientPath(nodes.pv, nodes.battery, nodes.pv.color, nodes.battery.color)
  // 路径2：光伏 → 负载（垂直）
  drawGradientPath(nodes.pv, nodes.load, nodes.pv.color, nodes.load.color)
  // 路径3：中间 → 电网（水平）
  drawGradientPath({ x: 143, y: 162 }, nodes.grid, nodes.load.color, nodes.grid.color)
}

// 绘制渐变线条
function drawGradientPath(start, end, color1, color2) {
  const gradient = ctx.createLinearGradient(start.x, start.y, end.x, end.y)
  gradient.addColorStop(0, color1)
  gradient.addColorStop(1, color2)

  ctx.lineWidth = 6
  ctx.lineCap = 'round'
  ctx.strokeStyle = gradient
  ctx.beginPath()
  ctx.moveTo(start.x, start.y)
  ctx.lineTo(end.x, end.y)
  ctx.stroke()
}

// 2. 绘制3个流动箭头
function drawArrows() {
  // 箭头1：光伏→储能
  drawArrow(
    { x: lerp(nodes.pv.x, nodes.battery.x, arrow1), y: lerp(nodes.pv.y, nodes.battery.y, arrow1) },
    nodes.battery.color
  )
  // 箭头2：光伏→负载
  drawArrow(
    { x: lerp(nodes.pv.x, nodes.load.x, arrow2), y: lerp(nodes.pv.y, nodes.load.y, arrow2) },
    nodes.load.color
  )
  // 箭头3：中间→电网
  drawArrow(
    { x: lerp(143, nodes.grid.x, arrow3), y: 162 },
    nodes.grid.color
  )
}

// 绘制发光箭头
function drawArrow(pos, color) {
  ctx.shadowColor = color
  ctx.shadowBlur = 8
  ctx.fillStyle = color

  ctx.beginPath()
  ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2)
  ctx.fill()

  ctx.shadowBlur = 0
}

// 3. 绘制4个发光节点
function drawNodes() {
  for (const key in nodes) {
    const node = nodes[key]
    // 外圈发光环
    ctx.shadowColor = node.color
    ctx.shadowBlur = 15
    ctx.fillStyle = node.color + '33'
    ctx.beginPath()
    ctx.arc(node.x, node.y, 22, 0, Math.PI * 2)
    ctx.fill()

    // 内圈白色
    ctx.shadowBlur = 0
    ctx.fillStyle = '#FFFFFF'
    ctx.beginPath()
    ctx.arc(node.x, node.y, 18, 0, Math.PI * 2)
    ctx.fill()

    // 文字数值
    ctx.fillStyle = '#333333'
    ctx.font = 'bold 12px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(node.label, node.x, node.y + 5)
  }
}

// 线性插值计算箭头位置
function lerp(a, b, t) {
  return a + (b - a) * t
}

// 动画循环
function startAnimation() {
  draw()
  animationId = requestAnimationFrame(startAnimation)
}

// 销毁动画
onUnmounted(() => {
  cancelAnimationFrame(animationId)
})
</script>

<style scoped>
.canvas-container {
  position: relative;
  width: 236px;
  height: 267px;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

/* 完全匹配你F12的样式 */
.flow-canvas {
  position: absolute;
  touch-action: none;
  width: 236px;
  height: 267px;
}
</style>