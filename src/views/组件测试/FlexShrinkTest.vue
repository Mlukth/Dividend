<template>
  <div class="test-wrapper">
    <h2>Flex-Shrink 权重分配对比</h2>
    <p>拉动右下角滑块，观察“图表”与“信息卡片”的同步收缩表现</p>
    <div class="control">
      <label>容器宽度：<strong>{{ containerWidth }}px</strong></label>
      <input type="range" v-model.number="containerWidth" min="480" max="900" step="10" />
    </div>

    <!-- 方案 A：默认无权重（对照） -->
    <section class="case">
      <h3>A. 默认 flex-shrink（均等，但右侧卡片受内容 min-width 锁死）</h3>
      <div class="flex-row" :style="{ width: containerWidth + 'px' }">
        <div class="chart-box">📈 图表 (flex:1)</div>
        <div class="info-box info-a">🎯 信息卡片 (flex:0 0 300px)</div>
      </div>
    </section>

    <!-- 方案 B：左右均 flex:1，右侧加 min-width 保护 -->
    <section class="case">
      <h3>B. 左右均 flex:1，右侧加 min-width:220px</h3>
      <div class="flex-row" :style="{ width: containerWidth + 'px' }">
        <div class="chart-box chart-flex1">📈 图表 (flex:1)</div>
        <div class="info-box info-flex1">🎯 信息卡片 (flex:1, min-width:220px)</div>
      </div>
    </section>

    <!-- 方案 C：flex-shrink 权重 3:1（图表更易缩） -->
    <section class="case">
      <h3>C. 图表 flex-shrink:3，信息 flex-shrink:1</h3>
      <div class="flex-row" :style="{ width: containerWidth + 'px' }">
        <div class="chart-box chart-shrink3">📈 图表 (flex:1 3 0)</div>
        <div class="info-box info-shrink1">🎯 信息卡片 (flex:1 1 300px)</div>
      </div>
    </section>

    <!-- 方案 D：图表 flex-shrink:4，信息 flex-shrink:1，且信息最小可控 -->
    <section class="case">
      <h3>D. 图表 flex-shrink:4，信息 flex-shrink:1 + min-width:200px</h3>
      <div class="flex-row" :style="{ width: containerWidth + 'px' }">
        <div class="chart-box chart-shrink4">📈 图表 (flex:1 4 0)</div>
        <div class="info-box info-shrink1-min200">🎯 信息卡片 (flex:1 1 300px, min-width:200px)</div>
      </div>
    </section>

    <!-- 模拟天气预报行 -->
    <section class="case">
      <h3>E. 天气预报场景：温度图表 flex:1 3 0，预报卡片 flex:1 1 380px, min-width:260px</h3>
      <div class="flex-row" :style="{ width: containerWidth + 'px' }">
        <div class="chart-box chart-shrink3">🌡️ 温度图表 (flex:1 3 0)</div>
        <div class="weather-box">🌤️ 天气预报 (flex:1 1 380px, min:260px)<br><small>内部3列网格</small></div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const containerWidth = ref(700) // 默认宽度
</script>

<style scoped>
.test-wrapper {
  padding: 20px;
  font-family: 'Microsoft YaHei', sans-serif;
  background: #f5f7fa;
  min-height: 100vh;
}
h2 { margin-bottom: 4px; }
p { color: #666; margin-bottom: 20px; }
.control {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 20px 0;
  padding: 12px;
  background: #fff;
  border-radius: 8px;
}
.control input[type=range] {
  width: 300px;
}
.case {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.case h3 {
  margin: 0 0 12px;
  font-size: 16px;
  color: #1a1a2e;
}
.flex-row {
  display: flex;
  gap: 16px;
  background: #e8ecf0;
  padding: 8px;
  border-radius: 8px;
  transition: width 0.2s;
}

/* 模拟图表块 */
.chart-box {
  background: linear-gradient(135deg, #ffecd2, #fcb69f);
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  color: #fff;
  font-weight: 700;
  min-width: 0;  /* 允许收缩 */
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 信息卡片通用 */
.info-box, .weather-box {
  background: #F8F9FA;
  border: 2px dashed #c0c4cc;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  color: #333;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

/* 方案 A 用：固定宽 */
.info-a {
  flex: 0 0 300px;
}

/* 方案 B */
.chart-flex1 {
  flex: 1;
}
.info-flex1 {
  flex: 1;
  min-width: 220px;
}

/* 方案 C */
.chart-shrink3 {
  flex: 1 3 0;
}
.info-shrink1 {
  flex: 1 1 300px;
  min-width: 220px;
}

/* 方案 D */
.chart-shrink4 {
  flex: 1 4 0;
}
.info-shrink1-min200 {
  flex: 1 1 300px;
  min-width: 200px;
}

/* 方案 E 天气预报块 */
.weather-box {
  flex: 1 1 380px;
  min-width: 260px;
  background: #e6f7ff;
  border-color: #91d5ff;
}
</style>