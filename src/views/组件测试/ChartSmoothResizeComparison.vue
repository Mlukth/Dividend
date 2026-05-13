<template>
  <div class="test-page">
    <h2 class="test-title">图表缩放平滑度对比：SVG 渲染 vs 双缓冲 Canvas</h2>
    <p class="test-desc">
      拖拽下方滑块或点击“收缩/展开”按钮，观察两个图表在容器宽度变化时的表现差异。
    </p>

    <!-- 控制栏 -->
    <div class="controls">
      <el-button @click="toggleWidth">{{ isCollapsed ? '展开' : '收缩' }}容器</el-button>
      <span class="hint">当前容器宽度：<strong>{{ containerWidth }}px</strong></span>
      <el-slider v-model="containerWidth" :min="400" :max="900" :step="10" style="flex:1; margin-left: 20px;" />
    </div>

    <!-- 对比区域 -->
    <div class="compare-row">
      <!-- 方案 A：SVG 渲染 -->
      <div class="compare-col">
        <div class="col-header success">方案 A：SVG 渲染</div>
        <div class="chart-card" :style="{ width: containerWidth + 'px' }">
          <div class="card-header">
            <span>📈 发电功率趋势 (SVG)</span>
          </div>
          <div ref="svgChartRef" class="chart-box"></div>
        </div>
        <div class="col-note">
          ⚡ 不需要 resize() 调用，由 CSS 控制尺寸
        </div>
      </div>

      <!-- 方案 B：双缓冲 Canvas -->
      <div class="compare-col">
        <div class="col-header warning">方案 B：双缓冲 Canvas</div>
        <div class="chart-card" :style="{ width: containerWidth + 'px' }">
          <div class="card-header">
            <span>📈 发电功率趋势 (Canvas + 双缓冲)</span>
          </div>
          <div class="chart-wrapper" ref="canvasChartWrapper">
            <div ref="canvasChartRef" class="chart-box"></div>
            <!-- 离屏缓冲层：尺寸与图表一致，在 resize 期间先显示旧画面 -->
            <canvas
              ref="bufferCanvasRef"
              class="buffer-canvas"
              :style="{ display: bufferVisible ? 'block' : 'none' }"
            ></canvas>
          </div>
        </div>
        <div class="col-note">
          🛡️ 先显示旧画面，新画面绘制完成后切换
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'

// ----- 容器宽度 -----
const containerWidth = ref(700)
const isCollapsed = ref(false)
const toggleWidth = () => {
  isCollapsed.value = !isCollapsed.value
  containerWidth.value = isCollapsed.value ? 400 : 700
}

// ----- 方案A：SVG 图表 -----
const svgChartRef = ref(null)
let svgChart = null

const initSvgChart = () => {
  if (!svgChartRef.value) return
  svgChart = echarts.init(svgChartRef.value, null, { renderer: 'svg' })
  svgChart.setOption(getChartOption())
}

// ----- 方案B：双缓冲 Canvas 图表 -----
const canvasChartRef = ref(null)
const bufferCanvasRef = ref(null)
const canvasChartWrapper = ref(null)
let canvasChart = null
const bufferVisible = ref(false)
let resizeTimer = null

const initCanvasChart = () => {
  if (!canvasChartRef.value) return
  canvasChart = echarts.init(canvasChartRef.value)
  canvasChart.setOption(getChartOption())
}

// ----- 公用图表配置（ECharts option） -----
const getChartOption = () => ({
  animation: false,
  tooltip: { trigger: 'axis' },
  xAxis: {
    type: 'category',
    data: ['00:00','02:00','04:00','06:00','08:00','10:00','12:00','14:00','16:00','18:00','20:00','22:00'],
    boundaryGap: false
  },
  yAxis: { type: 'value', name: 'kW' },
  series: [{
    type: 'line',
    data: [0, 0, 0, 0, 220, 780, 1200, 980, 650, 320, 0, 0],
    smooth: true,
    areaStyle: { opacity: 0.2 },
    lineStyle: { color: '#409eff' }
  }]
})

// ----- 双缓冲 resize 逻辑 -----
const handleCanvasResize = () => {
  if (!canvasChart || !bufferCanvasRef.value) return

  // 1. 检查离屏 Canvas 尺寸是否需要更新
  const wrapper = canvasChartWrapper.value
  if (!wrapper) return
  const rect = wrapper.getBoundingClientRect()
  const width = rect.width
  const height = rect.height
  if (width <= 0 || height <= 0) return

  const buffer = bufferCanvasRef.value
  if (buffer.width !== width || buffer.height !== height) {
    buffer.width = width
    buffer.height = height
  }

  // 2. 把当前图表画面绘制到离屏 Canvas（保存旧画面）
  const oldCanvas = canvasChart.getRenderedCanvas?.()
  if (oldCanvas) {
    const ctx = buffer.getContext('2d')
    ctx.clearRect(0, 0, width, height)
    ctx.drawImage(oldCanvas, 0, 0, width, height)
  }

  // 3. 显示缓冲层（遮住即将发生的空白）
  bufferVisible.value = true

  // 4. 执行真正的 resize（图表内部会清空画布 + 重绘）
  nextTick(() => {
    canvasChart.resize({ width, height })

    // 5. 等一帧确保新画面渲染完成，再隐藏缓冲层
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        bufferVisible.value = false
      })
    })
  })
}

// 防抖版的 resize
const debouncedCanvasResize = () => {
  if (resizeTimer) clearTimeout(resizeTimer)
  resizeTimer = setTimeout(handleCanvasResize, 200)
}

// ----- 监听宽度变化 -----
watch(containerWidth, () => {
  nextTick(() => {
    // SVG 方案不需要手动 resize，但若想验证也可以 resize（这里故意不做）
    // 双缓冲方案触发 resize
    debouncedCanvasResize()
  })
})

// ----- 生命周期 -----
onMounted(() => {
  initSvgChart()
  initCanvasChart()
  window.addEventListener('resize', debouncedCanvasResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', debouncedCanvasResize)
  if (resizeTimer) clearTimeout(resizeTimer)
  svgChart?.dispose()
  canvasChart?.dispose()
})
</script>

<style scoped>
.test-page { padding: 24px; font-family: 'Microsoft YaHei', sans-serif; background: #f5f7fa; min-height: 100vh; }
.test-title { margin: 0 0 8px; font-size: 22px; color: #1a1a2e; }
.test-desc { margin: 0 0 16px; color: #666; font-size: 14px; }

.controls { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
.hint { font-size: 14px; color: #333; }

.compare-row { display: flex; gap: 24px; }
.compare-col { flex: 1; display: flex; flex-direction: column; }

.col-header { padding: 12px; border-radius: 8px 8px 0 0; font-weight: 700; font-size: 16px; text-align: center; color: #fff; }
.col-header.success { background: #52c41a; }
.col-header.warning { background: #ff6b00; }

.chart-card {
  background: #fff;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  padding: 16px;
  margin: 0 auto;
  transition: width 0.3s ease;
  overflow: hidden;
}

.card-header { margin-bottom: 12px; font-size: 15px; font-weight: 600; color: #333; }
.chart-box { width: 100%; height: 300px; }

/* 方案 B 的包装器 */
.chart-wrapper { position: relative; width: 100%; height: 300px; }
.buffer-canvas { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 10; pointer-events: none; }

.col-note { margin-top: 12px; font-size: 13px; color: #888; text-align: center; }
</style>