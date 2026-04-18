<template>
  <div class="energy-flow-container">
    <!-- 模拟原图场景背景（浅木色墙面+中间设备） -->
    <div class="device-bg"></div>

    <!-- 核心：SVG管道与三层光效叠加 -->
    <svg class="pipe-svg" viewBox="0 0 1000 400">
      <!-- 1. 静态白色管道（底层，和原图一致的左右两段） -->
      <polyline
        class="pipe-base"
        points="100,200 450,200"
        fill="none"
      />
      <polyline
        class="pipe-base"
        points="550,200 900,200"
        fill="none"
      />

      <!-- 2. 底层辉光（大模糊，慢流动，做尾迹效果） -->
      <polyline
        class="flow-glow"
        points="100,200 450,200"
        fill="none"
      />
      <polyline
        class="flow-glow"
        points="550,200 900,200"
        fill="none"
      />

      <!-- 3. 中层主光（核心黄光，正常速度） -->
      <polyline
        class="flow-main"
        points="100,200 450,200"
        fill="none"
      />
      <polyline
        class="flow-main"
        points="550,200 900,200"
        fill="none"
      />

      <!-- 4. 上层高光（亮白色尖峰，快流动，模拟光源） -->
      <polyline
        class="flow-highlight"
        points="100,200 450,200"
        fill="none"
      />
      <polyline
        class="flow-highlight"
        points="550,200 900,200"
        fill="none"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
// 纯CSS动画，无任何JS依赖
</script>

<style scoped>
/* 容器：模拟原图场景尺寸与风格 */
.energy-flow-container {
  width: 100%;
  height: 400px;
  position: relative;
  background: #f0e8d9; /* 浅木色墙面，和原图色调匹配 */
  overflow: hidden;
}

/* 中间设备背景，模拟逆变器效果 */
.device-bg {
  position: absolute;
  top: 100px;
  left: 450px;
  width: 100px;
  height: 200px;
  background: #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

/* SVG：全屏覆盖管道，不阻挡交互 */
.pipe-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

/* 1. 静态管道：白色基础线条 */
.pipe-base {
  stroke: #ffffff;
  stroke-width: 3;
  stroke-linecap: round;
}

/* 2. 底层辉光：柔和尾迹效果 */
.flow-glow {
  stroke: #ffd700;
  stroke-width: 12;
  stroke-linecap: round;
  filter: blur(8px) drop-shadow(0 0 15px #ffd700);
  stroke-dasharray: 80 120;
  stroke-dashoffset: 0;
  animation: flow-glow 6s linear infinite;
}

/* 3. 中层主光：核心黄色能量流 */
.flow-main {
  stroke: #ffc107;
  stroke-width: 6;
  stroke-linecap: round;
  filter: drop-shadow(0 0 8px #ffc107);
  stroke-dasharray: 40 160;
  stroke-dashoffset: 0;
  animation: flow-main 4s linear infinite;
}

/* 4. 上层高光：亮白色尖峰，模拟光源质感 */
.flow-highlight {
  stroke: #ffffff;
  stroke-width: 2;
  stroke-linecap: round;
  filter: drop-shadow(0 0 5px #ffffff);
  stroke-dasharray: 10 190;
  stroke-dashoffset: 0;
  animation: flow-highlight 2s linear infinite;
}

/* 动画关键帧：让光效从左向右流动 */
@keyframes flow-glow {
  to {
    stroke-dashoffset: -200; /* 值为 dasharray 总和 */
  }
}
@keyframes flow-main {
  to {
    stroke-dashoffset: -200;
  }
}
@keyframes flow-highlight {
  to {
    stroke-dashoffset: -200;
  }
}
</style>