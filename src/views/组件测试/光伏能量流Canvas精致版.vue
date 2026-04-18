```vue
<template>
  <div class="box">
    <canvas
      ref="canvasRef"
      width="287"
      height="324"
      class="flow-canvas"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref(null)
let ctx = null
let aniId = null

// 箭头流动进度
let t1 = 0
let t2 = 0
let t3 = 0

// 坐标完全按你截图十字布局
const config = {
  pv:      { x: 143, y: 60, c: '#ffcc33' },
  battery: { x: 55, y: 162, c: '#52c41a' },
  load:    { x: 143, y: 265, c: '#1890ff' },
  grid:    { x: 232, y: 162, c: '#722ed1' },
  mid:     { x: 143, y: 162 }
}

function draw() {
  const c = ctx
  if (!c) return

  c.clearRect(0, 0, 287, 324)
  c.fillStyle = '#fff'
  c.fillRect(0, 0, 287, 324)

  // ---------- 路径 ----------
  c.lineWidth = 4
  c.lineCap = 'round'

  // 光伏 → 电池
  c.beginPath()
  c.moveTo(config.pv.x, config.pv.y)
  c.lineTo(config.battery.x, config.battery.y)
  c.strokeStyle = '#d6e4ff'
  c.stroke()

  // 光伏 → 负载
  c.beginPath()
  c.moveTo(config.pv.x, config.pv.y)
  c.lineTo(config.load.x, config.load.y)
  c.strokeStyle = '#d6e4ff'
  c.stroke()

  // 中间 → 电网
  c.beginPath()
  c.moveTo(config.mid.x, config.mid.y)
  c.lineTo(config.grid.x, config.grid.y)
  c.strokeStyle = '#d6e4ff'
  c.stroke()

  // ---------- 流动箭头（真正的箭头，不是圆点） ----------
  function drawArrowShape(x, y, angle, color) {
    c.save()
    c.translate(x, y)
    c.rotate(angle)
    c.fillStyle = color
    c.beginPath()
    c.moveTo(6, 0)
    c.lineTo(-4, -4)
    c.lineTo(-4, 4)
    c.closePath()
    c.fill()
    c.restore()
  }

  // 箭头1：pv → battery
  const a1x = lerp(config.pv.x, config.battery.x, t1)
  const a1y = lerp(config.pv.y, config.battery.y, t1)
  drawArrowShape(a1x, a1y, Math.PI * 1.25, '#52c41a')

  // 箭头2：pv → load
  const a2x = lerp(config.pv.x, config.load.x, t2)
  const a2y = lerp(config.pv.y, config.load.y, t2)
  drawArrowShape(a2x, a2y, Math.PI / 2, '#1890ff')

  // 箭头3：mid → grid
  const a3x = lerp(config.mid.x, config.grid.x, t3)
  const a3y = config.mid.y
  drawArrowShape(a3x, a3y, 0, '#722ed1')

  // ---------- 节点 ----------
  function drawNode(node, color) {
    // 柔和光晕
    c.shadowColor = color
    c.shadowBlur = 12
    c.fillStyle = color + '22'
    c.beginPath()
    c.arc(node.x, node.y, 19, 0, Math.PI * 2)
    c.fill()

    // 白色主体
    c.shadowBlur = 0
    c.fillStyle = '#fff'
    c.strokeStyle = color
    c.lineWidth = 1.5
    c.beginPath()
    c.arc(node.x, node.y, 16, 0, Math.PI * 2)
    c.fill()
    c.stroke()
  }

  drawNode(config.pv, config.pv.c)
  drawNode(config.battery, config.battery.c)
  drawNode(config.load, config.load.c)
  drawNode(config.grid, config.grid.c)

  // 进度更新
  t1 += 0.012
  t2 += 0.010
  t3 += 0.011
  if (t1 > 1) t1 = 0
  if (t2 > 1) t2 = 0
  if (t3 > 1) t3 = 0
}

function lerp(a, b, t) {
  return a + (b - a) * t
}

onMounted(() => {
  const canvas = canvasRef.value
  ctx = canvas.getContext('2d')
  const loop = () => {
    draw()
    aniId = requestAnimationFrame(loop)
  }
  loop()
})

onUnmounted(() => {
  cancelAnimationFrame(aniId)
})
</script>

<style scoped>
.box {
  position: relative;
  width: 236px;
  height: 267px;
  background: #ffffff;
  border-radius: 8px;
  overflow: hidden;
}
.flow-canvas {
  position: absolute;
  touch-action: none;
  width: 236px;
  height: 267px;
}
</style>
```