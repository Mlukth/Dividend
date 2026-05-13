<template>
  <div class="explorer-page">
    <h2 class="explorer-title">电站列表 - 筛选标签 & 状态统计布局优化方案</h2>
    <p class="explorer-desc">
      当前设计：筛选标签与状态统计栏在视觉上形成重复（彩色圆点 + 文字均出现两次）。<br>
      以下方案均继承项目美术风格（白色圆角卡片、阴影、蓝色高亮等），探索合并或重新排布的可能性。
    </p>

    <!-- 方案A：原始布局 -->
    <div class="scheme-card">
      <h3 class="scheme-label">方案A：原始布局（筛选标签 + 独立统计栏）</h3>
      <div class="station-list-module">
        <div class="list-header">
          <div class="module-title">电站列表</div>
          <el-radio-group v-model="activeStatusA" size="small">
            <el-radio-button value="all">全部</el-radio-button>
            <el-radio-button value="normal">正常</el-radio-button>
            <el-radio-button value="fault">故障</el-radio-button>
            <el-radio-button value="offline">断连</el-radio-button>
          </el-radio-group>
        </div>
        <div class="status-statistics">
          <span class="stat-item"><span class="dot" style="background: #409EFF;"></span>总数(48)</span>
          <span class="stat-item"><span class="dot" style="background: #67c23a;"></span>正常(45)</span>
          <span class="stat-item"><span class="dot" style="background: #f56c6c;"></span>故障(1)</span>
          <span class="stat-item"><span class="dot" style="background: #909399;"></span>断连(2)</span>
        </div>
        <div class="table-placeholder">表格区域（模拟）</div>
      </div>
    </div>

    <!-- 方案B：数字直接融入标签（无额外颜色） -->
    <div class="scheme-card">
      <h3 class="scheme-label">方案B：数字融入标签（无额外颜色）</h3>
      <div class="station-list-module">
        <div class="list-header">
          <div class="module-title">电站列表</div>
          <el-radio-group v-model="activeStatusB" size="small">
            <el-radio-button value="all">
              <span class="tag-with-count">全部 <span class="count">48</span></span>
            </el-radio-button>
            <el-radio-button value="normal">
              <span class="tag-with-count">正常 <span class="count">45</span></span>
            </el-radio-button>
            <el-radio-button value="fault">
              <span class="tag-with-count">故障 <span class="count">1</span></span>
            </el-radio-button>
            <el-radio-button value="offline">
              <span class="tag-with-count">断连 <span class="count">2</span></span>
            </el-radio-button>
          </el-radio-group>
        </div>
        <div class="table-placeholder">表格区域（模拟）</div>
      </div>
    </div>

    <!-- 方案C：筛选标签与统计栏同行左右分布 -->
    <div class="scheme-card">
      <h3 class="scheme-label">方案C：同行左右分布（标签左，统计右）</h3>
      <div class="station-list-module">
        <div class="list-header">
          <div class="module-title">电站列表</div>
          <div class="header-right-group">
            <div class="status-statistics inline-stats">
              <span class="stat-item"><span class="dot" style="background: #409EFF;"></span>总数 48</span>
              <span class="stat-item"><span class="dot" style="background: #67c23a;"></span>正常 45</span>
              <span class="stat-item"><span class="dot" style="background: #f56c6c;"></span>故障 1</span>
              <span class="stat-item"><span class="dot" style="background: #909399;"></span>断连 2</span>
            </div>
            <el-radio-group v-model="activeStatusC" size="small">
              <el-radio-button value="all">全部</el-radio-button>
              <el-radio-button value="normal">正常</el-radio-button>
              <el-radio-button value="fault">故障</el-radio-button>
              <el-radio-button value="offline">断连</el-radio-button>
            </el-radio-group>
          </div>
        </div>
        <div class="table-placeholder">表格区域（模拟）</div>
      </div>
    </div>

    <!-- 方案D：统计栏用进度条替代（已修复显示问题） -->
    <div class="scheme-card">
      <h3 class="scheme-label">方案D：统计栏改为进度条（百分比展示）</h3>
      <div class="station-list-module">
        <div class="list-header">
          <div class="module-title">电站列表</div>
          <el-radio-group v-model="activeStatusD" size="small">
            <el-radio-button value="all">全部</el-radio-button>
            <el-radio-button value="normal">正常</el-radio-button>
            <el-radio-button value="fault">故障</el-radio-button>
            <el-radio-button value="offline">断连</el-radio-button>
          </el-radio-group>
        </div>
        <div class="progress-stats">
          <div class="progress-item">
            <span class="progress-label">正常</span>
            <el-progress :percentage="93.75" :stroke-width="6" :show-text="false" color="#67c23a" />
          </div>
          <div class="progress-item">
            <span class="progress-label">故障</span>
            <el-progress :percentage="2.08" :stroke-width="6" :show-text="false" color="#f56c6c" />
          </div>
          <div class="progress-item">
            <span class="progress-label">断连</span>
            <el-progress :percentage="4.17" :stroke-width="6" :show-text="false" color="#909399" />
          </div>
        </div>
        <div class="table-placeholder">表格区域（模拟）</div>
      </div>
    </div>

    <!-- 方案E：数字融入标签 + 前置彩色圆点 -->
    <div class="scheme-card">
      <h3 class="scheme-label">方案E：数字融入标签 + 前置彩色圆点</h3>
      <div class="station-list-module">
        <div class="list-header">
          <div class="module-title">电站列表</div>
          <el-radio-group v-model="activeStatusE" size="small">
            <el-radio-button value="all">
              <span class="tag-with-count"><span class="dot" style="background: #409EFF; display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 4px; vertical-align: middle;"></span>全部 <span class="count">48</span></span>
            </el-radio-button>
            <el-radio-button value="normal">
              <span class="tag-with-count"><span class="dot" style="background: #67c23a; display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 4px; vertical-align: middle;"></span>正常 <span class="count">45</span></span>
            </el-radio-button>
            <el-radio-button value="fault">
              <span class="tag-with-count"><span class="dot" style="background: #f56c6c; display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 4px; vertical-align: middle;"></span>故障 <span class="count">1</span></span>
            </el-radio-button>
            <el-radio-button value="offline">
              <span class="tag-with-count"><span class="dot" style="background: #909399; display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 4px; vertical-align: middle;"></span>断连 <span class="count">2</span></span>
            </el-radio-button>
          </el-radio-group>
        </div>
        <div class="table-placeholder">表格区域（模拟）</div>
      </div>
    </div>

    <!-- 方案F：数字融入标签 + 彩色圆角方块背景 -->
    <div class="scheme-card">
      <h3 class="scheme-label">方案F：数字融入标签 + 彩色圆角方块（徽章）</h3>
      <div class="station-list-module">
        <div class="list-header">
          <div class="module-title">电站列表</div>
          <el-radio-group v-model="activeStatusF" size="small">
            <el-radio-button value="all">
              <span class="tag-with-count">全部 <span class="count badge" style="background: #409EFF; color: #fff; border-radius: 10px; padding: 1px 6px; font-size: 12px; margin-left: 4px; vertical-align: middle;">48</span></span>
            </el-radio-button>
            <el-radio-button value="normal">
              <span class="tag-with-count">正常 <span class="count badge" style="background: #67c23a; color: #fff; border-radius: 10px; padding: 1px 6px; font-size: 12px; margin-left: 4px; vertical-align: middle;">45</span></span>
            </el-radio-button>
            <el-radio-button value="fault">
              <span class="tag-with-count">故障 <span class="count badge" style="background: #f56c6c; color: #fff; border-radius: 10px; padding: 1px 6px; font-size: 12px; margin-left: 4px; vertical-align: middle;">1</span></span>
            </el-radio-button>
            <el-radio-button value="offline">
              <span class="tag-with-count">断连 <span class="count badge" style="background: #909399; color: #fff; border-radius: 10px; padding: 1px 6px; font-size: 12px; margin-left: 4px; vertical-align: middle;">2</span></span>
            </el-radio-button>
          </el-radio-group>
        </div>
        <div class="table-placeholder">表格区域（模拟）</div>
      </div>
    </div>

    <!-- 上一版G：纯白背景选中 · 无抖动无蓝色 -->
    <div class="scheme-card">
      <h3 class="scheme-label">方案G(旧版)：纯白背景选中 · 无抖动无蓝色</h3>
      <div class="station-list-module">
        <div class="list-header">
          <div class="module-title">电站列表</div>
        </div>
        <div class="status-statistics stats-filter-g">
          <span class="stat-item" :class="{ active: activeStatusG === 'all' }" @click="activeStatusG = 'all'">
            <span class="dot" style="background: #409EFF;"></span>总数(48)
          </span>
          <span class="stat-item" :class="{ active: activeStatusG === 'normal' }" @click="activeStatusG = 'normal'">
            <span class="dot" style="background: #67c23a;"></span>正常(45)
          </span>
          <span class="stat-item" :class="{ active: activeStatusG === 'fault' }" @click="activeStatusG = 'fault'">
            <span class="dot" style="background: #f56c6c;"></span>故障(1)
          </span>
          <span class="stat-item" :class="{ active: activeStatusG === 'offline' }" @click="activeStatusG = 'offline'">
            <span class="dot" style="background: #909399;"></span>断连(2)
          </span>
        </div>
        <div class="table-placeholder">筛选后表格区域</div>
      </div>
    </div>

    <!-- 方案H：浅灰描边选中 · 极简干净 -->
    <div class="scheme-card">
      <h3 class="scheme-label">方案H：浅灰描边选中 · 极简干净</h3>
      <div class="station-list-module">
        <div class="list-header">
          <div class="module-title">电站列表</div>
        </div>
        <div class="status-statistics stats-filter-h">
          <span class="stat-item" :class="{ active: activeStatusH === 'all' }" @click="activeStatusH = 'all'">
            <span class="dot" style="background: #409EFF;"></span>总数(48)
          </span>
          <span class="stat-item" :class="{ active: activeStatusH === 'normal' }" @click="activeStatusH = 'normal'">
            <span class="dot" style="background: #67c23a;"></span>正常(45)
          </span>
          <span class="stat-item" :class="{ active: activeStatusH === 'fault' }" @click="activeStatusH = 'fault'">
            <span class="dot" style="background: #f56c6c;"></span>故障(1)
          </span>
          <span class="stat-item" :class="{ active: activeStatusH === 'offline' }" @click="activeStatusH = 'offline'">
            <span class="dot" style="background: #909399;"></span>断连(2)
          </span>
        </div>
        <div class="table-placeholder">筛选后表格区域</div>
      </div>
    </div>

    <!-- 方案I：状态色浅底选中 · 视觉统一 -->
    <div class="scheme-card">
      <h3 class="scheme-label">方案I：状态色浅底选中 · 视觉统一</h3>
      <div class="station-list-module">
        <div class="list-header">
          <div class="module-title">电站列表</div>
        </div>
        <div class="status-statistics stats-filter-i">
          <span class="stat-item all" :class="{ active: activeStatusI === 'all' }" @click="activeStatusI = 'all'">
            <span class="dot"></span>总数(48)
          </span>
          <span class="stat-item normal" :class="{ active: activeStatusI === 'normal' }" @click="activeStatusI = 'normal'">
            <span class="dot"></span>正常(45)
          </span>
          <span class="stat-item fault" :class="{ active: activeStatusI === 'fault' }" @click="activeStatusI = 'fault'">
            <span class="dot"></span>故障(1)
          </span>
          <span class="stat-item offline" :class="{ active: activeStatusI === 'offline' }" @click="activeStatusI = 'offline'">
            <span class="dot"></span>断连(2)
          </span>
        </div>
        <div class="table-placeholder">筛选后表格区域</div>
      </div>
    </div>

    <!-- 方案J：仅圆点放大高亮 · 最极简 -->
    <div class="scheme-card">
      <h3 class="scheme-label">方案J：仅圆点放大高亮 · 无背景变化</h3>
      <div class="station-list-module">
        <div class="list-header">
          <div class="module-title">电站列表</div>
        </div>
        <div class="status-statistics stats-filter-j">
          <span class="stat-item" :class="{ active: activeStatusJ === 'all' }" @click="activeStatusJ = 'all'">
            <span class="dot" style="background: #409EFF;"></span>总数(48)
          </span>
          <span class="stat-item" :class="{ active: activeStatusJ === 'normal' }" @click="activeStatusJ = 'normal'">
            <span class="dot" style="background: #67c23a;"></span>正常(45)
          </span>
          <span class="stat-item" :class="{ active: activeStatusJ === 'fault' }" @click="activeStatusJ = 'fault'">
            <span class="dot" style="background: #f56c6c;"></span>故障(1)
          </span>
          <span class="stat-item" :class="{ active: activeStatusJ === 'offline' }" @click="activeStatusJ = 'offline'">
            <span class="dot" style="background: #909399;"></span>断连(2)
          </span>
        </div>
        <div class="table-placeholder">筛选后表格区域</div>
      </div>
    </div>

    <!-- 方案G(最终原版)：参照官方分段器 · 原版尺寸 -->
    <div class="scheme-card">
      <h3 class="scheme-label">方案G(最终原版)：官方分段器逻辑 · 原版尺寸</h3>
      <div class="station-list-module">
        <div class="list-header">
          <div class="module-title">电站列表</div>
        </div>
        <div class="custom-segmented">
          <div class="selected-slider" :style="sliderStyle"></div>
          <label class="segment-item" :class="{ active: activeFinal === 'all' }" @click="setFinal('all')">
            <span class="dot" style="background:#409EFF"></span><span class="text">总数(48)</span>
          </label>
          <label class="segment-item" :class="{ active: activeFinal === 'normal' }" @click="setFinal('normal')">
            <span class="dot" style="background:#67c23a"></span><span class="text">正常(45)</span>
          </label>
          <label class="segment-item" :class="{ active: activeFinal === 'fault' }" @click="setFinal('fault')">
            <span class="dot" style="background:#f56c6c"></span><span class="text">故障(1)</span>
          </label>
          <label class="segment-item" :class="{ active: activeFinal === 'offline' }" @click="setFinal('offline')">
            <span class="dot" style="background:#909399"></span><span class="text">断连(2)</span>
          </label>
        </div>
        <div class="table-placeholder">表格区域</div>
      </div>
    </div>

    <!-- ==================== 新增5套微调方案（缩小尺寸+优化比例） ==================== -->
    <!-- Pro1：紧凑迷你版（整体缩小，间距变小） -->
    <div class="scheme-card">
      <h3 class="scheme-label">G-Pro1：紧凑迷你版 · 更小更精致</h3>
      <div class="station-list-module">
        <div class="list-header"><div class="module-title">电站列表</div></div>
        <div class="custom-segmented seg-pro1">
          <div class="selected-slider" :style="sliderStyle1"></div>
          <label class="segment-item" :class="{ active: activePro1 === 'all' }" @click="setPro1('all')">
            <span class="dot" style="background:#409EFF"></span><span class="text">总数(48)</span>
          </label>
          <label class="segment-item" :class="{ active: activePro1 === 'normal' }" @click="setPro1('normal')">
            <span class="dot" style="background:#67c23a"></span><span class="text">正常(45)</span>
          </label>
          <label class="segment-item" :class="{ active: activePro1 === 'fault' }" @click="setPro1('fault')">
            <span class="dot" style="background:#f56c6c"></span><span class="text">故障(1)</span>
          </label>
          <label class="segment-item" :class="{ active: activePro1 === 'offline' }" @click="setPro1('offline')">
            <span class="dot" style="background:#909399"></span><span class="text">断连(2)</span>
          </label>
        </div>
        <div class="table-placeholder">表格区域</div>
      </div>
    </div>

    <!-- Pro2：细窄长条版（降低高度，纤细不臃肿） -->
    <div class="scheme-card">
      <h3 class="scheme-label">G-Pro2：细窄长条版 · 扁平纤细</h3>
      <div class="station-list-module">
        <div class="list-header"><div class="module-title">电站列表</div></div>
        <div class="custom-segmented seg-pro2">
          <div class="selected-slider" :style="sliderStyle2"></div>
          <label class="segment-item" :class="{ active: activePro2 === 'all' }" @click="setPro2('all')">
            <span class="dot" style="background:#409EFF"></span><span class="text">总数(48)</span>
          </label>
          <label class="segment-item" :class="{ active: activePro2 === 'normal' }" @click="setPro2('normal')">
            <span class="dot" style="background:#67c23a"></span><span class="text">正常(45)</span>
          </label>
          <label class="segment-item" :class="{ active: activePro2 === 'fault' }" @click="setPro2('fault')">
            <span class="dot" style="background:#f56c6c"></span><span class="text">故障(1)</span>
          </label>
          <label class="segment-item" :class="{ active: activePro2 === 'offline' }" @click="setPro2('offline')">
            <span class="dot" style="background:#909399"></span><span class="text">断连(2)</span>
          </label>
        </div>
        <div class="table-placeholder">表格区域</div>
      </div>
    </div>

    <!-- Pro3：浅灰滑块版（滑块低调不突兀） -->
    <div class="scheme-card">
      <h3 class="scheme-label">G-Pro3：浅灰滑块版 · 低调柔和</h3>
      <div class="station-list-module">
        <div class="list-header"><div class="module-title">电站列表</div></div>
        <div class="custom-segmented seg-pro3">
          <div class="selected-slider" :style="sliderStyle3"></div>
          <label class="segment-item" :class="{ active: activePro3 === 'all' }" @click="setPro3('all')">
            <span class="dot" style="background:#409EFF"></span><span class="text">总数(48)</span>
          </label>
          <label class="segment-item" :class="{ active: activePro3 === 'normal' }" @click="setPro3('normal')">
            <span class="dot" style="background:#67c23a"></span><span class="text">正常(45)</span>
          </label>
          <label class="segment-item" :class="{ active: activePro3 === 'fault' }" @click="setPro3('fault')">
            <span class="dot" style="background:#f56c6c"></span><span class="text">故障(1)</span>
          </label>
          <label class="segment-item" :class="{ active: activePro3 === 'offline' }" @click="setPro3('offline')">
            <span class="dot" style="background:#909399"></span><span class="text">断连(2)</span>
          </label>
        </div>
        <div class="table-placeholder">表格区域</div>
      </div>
    </div>

    <!-- Pro4：极致简约版（无多余内边距，最小尺寸） -->
    <div class="scheme-card">
      <h3 class="scheme-label">G-Pro4：极致简约版 · 最小占比</h3>
      <div class="station-list-module">
        <div class="list-header"><div class="module-title">电站列表</div></div>
        <div class="custom-segmented seg-pro4">
          <div class="selected-slider" :style="sliderStyle4"></div>
          <label class="segment-item" :class="{ active: activePro4 === 'all' }" @click="setPro4('all')">
            <span class="dot" style="background:#409EFF"></span><span class="text">总数(48)</span>
          </label>
          <label class="segment-item" :class="{ active: activePro4 === 'normal' }" @click="setPro4('normal')">
            <span class="dot" style="background:#67c23a"></span><span class="text">正常(45)</span>
          </label>
          <label class="segment-item" :class="{ active: activePro4 === 'fault' }" @click="setPro4('fault')">
            <span class="dot" style="background:#f56c6c"></span><span class="text">故障(1)</span>
          </label>
          <label class="segment-item" :class="{ active: activePro4 === 'offline' }" @click="setPro4('offline')">
            <span class="dot" style="background:#909399"></span><span class="text">断连(2)</span>
          </label>
        </div>
        <div class="table-placeholder">表格区域</div>
      </div>
    </div>

    <!-- Pro5：圆点突出版（文字紧凑，圆点更明显） -->
    <div class="scheme-card">
      <h3 class="scheme-label">G-Pro5：圆点突出版 · 视觉重点清晰</h3>
      <div class="station-list-module">
        <div class="list-header"><div class="module-title">电站列表</div></div>
        <div class="custom-segmented seg-pro5">
          <div class="selected-slider" :style="sliderStyle5"></div>
          <label class="segment-item" :class="{ active: activePro5 === 'all' }" @click="setPro5('all')">
            <span class="dot" style="background:#409EFF"></span><span class="text">总数(48)</span>
          </label>
          <label class="segment-item" :class="{ active: activePro5 === 'normal' }" @click="setPro5('normal')">
            <span class="dot" style="background:#67c23a"></span><span class="text">正常(45)</span>
          </label>
          <label class="segment-item" :class="{ active: activePro5 === 'fault' }" @click="setPro5('fault')">
            <span class="dot" style="background:#f56c6c"></span><span class="text">故障(1)</span>
          </label>
          <label class="segment-item" :class="{ active: activePro5 === 'offline' }" @click="setPro5('offline')">
            <span class="dot" style="background:#909399"></span><span class="text">断连(2)</span>
          </label>
        </div>
        <div class="table-placeholder">表格区域</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'

// 原有所有方案状态
const activeStatusA = ref('all')
const activeStatusB = ref('all')
const activeStatusC = ref('all')
const activeStatusD = ref('all')
const activeStatusE = ref('all')
const activeStatusF = ref('all')
const activeStatusG = ref('all')
const activeStatusH = ref('all')
const activeStatusI = ref('all')
const activeStatusJ = ref('all')

// 最终原版G
const activeFinal = ref('all')
const sliderStyle = ref({})
// Pro1-Pro5 状态
const activePro1 = ref('all'), sliderStyle1 = ref({})
const activePro2 = ref('all'), sliderStyle2 = ref({})
const activePro3 = ref('all'), sliderStyle3 = ref({})
const activePro4 = ref('all'), sliderStyle4 = ref({})
const activePro5 = ref('all'), sliderStyle5 = ref({})

const itemMap = { all: 0, normal: 1, fault: 2, offline: 3 }

// 工具函数：计算滑块位置
function calcSlider(selector, styleRef) {
  const items = document.querySelectorAll(selector)
  const rects = Array.from(items).map(el => ({ width: el.offsetWidth, left: el.offsetLeft }))
  return (val) => {
    const rect = rects[itemMap[val]]
    if(rect) styleRef.value = { width: `${rect.width}px`, transform: `translateX(${rect.left}px)` }
  }
}

// 绑定所有方案
let setFinal, setPro1, setPro2, setPro3, setPro4, setPro5
onMounted(() => {
  nextTick(() => {
    setFinal = calcSlider('.custom-segmented:not([class*="seg-pro"]) .segment-item', sliderStyle)
    setPro1 = calcSlider('.seg-pro1 .segment-item', sliderStyle1)
    setPro2 = calcSlider('.seg-pro2 .segment-item', sliderStyle2)
    setPro3 = calcSlider('.seg-pro3 .segment-item', sliderStyle3)
    setPro4 = calcSlider('.seg-pro4 .segment-item', sliderStyle4)
    setPro5 = calcSlider('.seg-pro5 .segment-item', sliderStyle5)
    
    setFinal('all'); setPro1('all'); setPro2('all'); setPro3('all'); setPro4('all'); setPro5('all')
  })
})
</script>

<style scoped>
/* 全局原有样式（100%保留） */
.explorer-page {
  width: 100%; min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fb 0%, #e8ecf0 100%);
  padding: 24px; box-sizing: border-box;
  font-family: "Microsoft YaHei", sans-serif;
}
.explorer-title { font-size: 22px; font-weight: 700; color: #1a1a2e; margin-bottom: 8px; }
.explorer-desc { font-size: 14px; color: #86909c; margin-bottom: 32px; line-height: 1.6; }
.scheme-card { margin-bottom: 32px; }
.scheme-label {
  font-size: 16px; font-weight: 600; color: #1D2129; margin-bottom: 12px;
  padding: 8px 16px; background: #fff; border-radius: 8px; display: inline-block;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.station-list-module {
  background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  padding: 16px 24px; width: 100%; box-sizing: border-box;
}
.list-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.module-title { font-size: 16px; font-weight: 700; color: #1D2129; }
:deep(.el-radio-button__inner) { border-radius: 6px; padding: 8px 16px; }
:deep(.el-radio-button__orig-radio:checked + .el-radio-button__inner) {
  background: linear-gradient(90deg, #0052D9, #165DFF); border-color: #165DFF; box-shadow: none;
}
.status-statistics {
  display: flex; align-items: center; gap: 24px;
  margin-bottom: 16px; padding: 8px 16px;
  background: #F8F9FA; border-radius: 8px;
  font-size: 14px; color: #4E5969;
}
.stat-item {
  display: flex; align-items: center; gap: 6px; cursor: pointer;
  transition: all 0.2s ease; padding: 4px 8px; border-radius: 4px;
  width: fit-content; white-space: nowrap;
}
.dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.tag-with-count .count {
  background: rgba(255,255,255,0.3); border-radius: 10px;
  padding: 0 6px; margin-left: 4px; font-size: 12px;
}
.tag-with-count .badge { background: inherit; padding: 1px 6px; }
.header-right-group { display: flex; align-items: center; gap: 16px; }
.inline-stats { margin-bottom: 0; padding: 6px 12px; }
.progress-stats { display: flex; gap: 24px; margin-bottom: 16px; padding: 8px 0; }
.progress-item { flex: 1; display: flex; align-items: center; gap: 8px; }
.progress-item :deep(.el-progress) { flex: 1; }
.progress-label { font-size: 13px; color: #4E5969; min-width: 40px; }
.table-placeholder {
  height: 120px; background: #f5f7fa; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  color: #aaa; font-size: 14px;
}

/* 旧G/H/I/J样式保留 */
.stats-filter-g .stat-item.active { background: #ffffff; color: #333; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.stats-filter-g .stat-item:hover { background: #f2f3f5; }
.stats-filter-h .stat-item.active { border: 1px solid #dcdfe6; background: #fff; }
.stats-filter-h .stat-item:hover { border-color: #c0c4cc; }
.stats-filter-i .stat-item { padding: 4px 10px; }
.stats-filter-i .all .dot { background: #409EFF; }
.stats-filter-i .normal .dot { background: #67c23a; }
.stats-filter-i .fault .dot { background: #f56c6c; }
.stats-filter-i .offline .dot { background: #909399; }
.stats-filter-i .all.active { background: #ecf5ff; }
.stats-filter-i .normal.active { background: #f0f9e6; }
.stats-filter-i .fault.active { background: #fef0f0; }
.stats-filter-i .offline.active { background: #f5f7fa; }
.stats-filter-j .stat-item.active .dot { transform: scale(1.5); transition: transform 0.2s ease; }
.stats-filter-j .stat-item:hover { background: transparent; }

/* 核心滑动组件通用样式 */
.custom-segmented {
  position: relative; display: flex; align-items: center;
  width: fit-content; padding: 6px 12px;
  background: #F8F9FA; border-radius: 8px;
  margin-bottom: 16px; user-select: none;
}
.selected-slider {
  position: absolute; top: 0; left: 0; height: 100%;
  background: #ffffff; border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  transition: all 0.3s ease; z-index: 1;
}
.segment-item {
  position: relative; z-index: 2; display: flex; align-items: center;
  gap: 6px; padding: 8px 12px; font-size: 14px;
  color: #4E5969; cursor: pointer; white-space: nowrap;
}
.segment-item .text { line-height: 1; }

/* ==================== 5套微调样式（缩小尺寸+优化比例） ==================== */
/* Pro1 紧凑迷你版：缩小内边距、间距、字体 */
.seg-pro1 { padding: 4px 8px; gap: 12px; }
.seg-pro1 .segment-item { padding: 6px 8px; font-size: 13px; }
.seg-pro1 .dot { width: 7px; height: 7px; }

/* Pro2 细窄长条版：降低高度，扁平纤细 */
.seg-pro2 { padding: 3px 8px; gap: 16px; }
.seg-pro2 .segment-item { padding: 4px 8px; font-size: 14px; }
.seg-pro2 .selected-slider { height: 80%; top: 10%; }

/* Pro3 浅灰滑块版：滑块浅灰，更低调 */
.seg-pro3 { padding: 4px 8px; gap: 12px; }
.seg-pro3 .segment-item { padding: 6px 8px; font-size: 13px; }
.seg-pro3 .selected-slider { background: #f1f3f6; box-shadow: none; }

/* Pro4 极致简约版：最小尺寸，无多余间距 */
.seg-pro4 { padding: 2px 6px; gap: 8px; border-radius: 6px; }
.seg-pro4 .segment-item { padding: 4px 6px; font-size: 12px; }
.seg-pro4 .dot { width: 6px; height: 6px; }

/* Pro5 圆点突出版：文字紧凑，圆点稍大，重点清晰 */
.seg-pro5 { padding: 4px 8px; gap: 10px; }
.seg-pro5 .segment-item { padding: 6px 8px; font-size: 13px; }
.seg-pro5 .dot { width: 9px; height: 9px; }
</style>