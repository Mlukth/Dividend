<template>
  <div class="left-panel">
    <div class="panel-header">
      <h3>🌲 观点地图</h3>
      <div class="zoom-controls" v-if="treeMermaidCode">
        <button @click="zoomOut" :disabled="scale <= 0.3">−</button>
        <span class="zoom-label">{{ Math.round(scale * 100) }}%</span>
        <button @click="zoomIn" :disabled="scale >= 2">+</button>
        <button @click="resetZoom">↺</button>
        <button @click="openFullscreen">🔍</button>
      </div>
    </div>
    <div
      ref="viewport"
      class="tree-viewport"
      @wheel.prevent="onWheel"
      @mousedown="startPan"
      @mousemove="onPan"
      @mouseup="endPan"
      @mouseleave="endPan"
      @contextmenu.prevent
    >
      <div
        class="tree-scaler"
        :style="{ transform: `translate(${panX}px, ${panY}px) scale(${scale})` }"
      >
        <div ref="mermaidContainer" class="mermaid-container" v-show="treeMermaidCode"></div>
      </div>
      <div v-if="!treeMermaidCode" class="placeholder">
        对话后点击"生成观点树"<br/>在此看到交互式地图
      </div>
    </div>

    <!-- 全屏弹窗 -->
    <div class="fullscreen-overlay" v-if="fullscreenVisible" @click.self="closeFullscreen">
      <div class="fullscreen-content">
        <div class="fullscreen-toolbar">
          <button @click="zoomOut" :disabled="scale <= 0.3">−</button>
          <span>{{ Math.round(scale * 100) }}%</span>
          <button @click="zoomIn" :disabled="scale >= 2">+</button>
          <button @click="resetZoom">↺</button>
          <button @click="closeFullscreen">✖ 关闭</button>
        </div>
        <div
          class="fullscreen-viewport"
          @wheel.prevent="onWheel"
          @mousedown="startPan"
          @mousemove="onPan"
          @mouseup="endPan"
          @mouseleave="endPan"
          @contextmenu.prevent
        >
          <div :style="{ transform: `scale(${scale})`, transformOrigin: 'center top' }">
            <div ref="fullscreenContainer" class="mermaid-container"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';

const props = defineProps({
  treeMermaidCode: { type: String, default: '' },
});

defineEmits(['generate-tree']);

const mermaidContainer = ref(null);
const fullscreenContainer = ref(null);

const scale = ref(1);
const panX = ref(0);
const panY = ref(0);
const isPanning = ref(false);
const panStart = { x: 0, y: 0 };

const fullscreenVisible = ref(false);

// 暴露容器和全屏可见性给父组件（用于 Mermaid 渲染）
defineExpose({ mermaidContainer, fullscreenContainer, fullscreenVisible });

function zoomIn() { if (scale.value < 2) scale.value = Math.round((scale.value + 0.1) * 10) / 10; }
function zoomOut() { if (scale.value > 0.3) scale.value = Math.round((scale.value - 0.1) * 10) / 10; }
function resetZoom() { scale.value = 1; panX.value = 0; panY.value = 0; }

function onWheel(e) {
  if (!e.ctrlKey) return;
  e.preventDefault();
  const delta = e.deltaY > 0 ? -0.1 : 0.1;
  scale.value = Math.min(2, Math.max(0.3, Math.round((scale.value + delta) * 10) / 10));
}

function startPan(e) {
  if (e.button !== 0 && e.button !== 2) return;
  isPanning.value = true;
  panStart.x = e.clientX - panX.value;
  panStart.y = e.clientY - panY.value;
}
function onPan(e) {
  if (!isPanning.value) return;
  panX.value = e.clientX - panStart.x;
  panY.value = e.clientY - panStart.y;
}
function endPan() { isPanning.value = false; }

function openFullscreen() { fullscreenVisible.value = true; }
function closeFullscreen() { fullscreenVisible.value = false; }
</script>

<style scoped>
.left-panel { width: 45%; min-width: 360px; border: 1px solid #E5E7EB; border-radius: 12px; background: #FFFFFF; display: flex; flex-direction: column; overflow: hidden; }
.panel-header { display: flex; justify-content: space-between; align-items: center; padding: 0.7rem 1rem; border-bottom: 1px solid #F3F4F6; }
.panel-header h3 { margin: 0; font-size: 1rem; color: #1F2937; }
.zoom-controls { display: flex; align-items: center; gap: 0.3rem; }
.zoom-label { font-size: 0.8rem; min-width: 40px; text-align: center; color: #6B7280; }
.tree-viewport { flex: 1; overflow: hidden; position: relative; background: #FAFBFC; user-select: none; }
.tree-scaler { transform-origin: 0 0; }
.mermaid-container { padding: 20px; background: white; border-radius: 8px; }
.placeholder { display: flex; align-items: center; justify-content: center; height: 100%; color: #9CA3AF; text-align: center; font-size: 0.9rem; }
.fullscreen-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: #F3F4F6; z-index: 1000;
  display: flex; flex-direction: column;
}
.fullscreen-content { flex: 1; display: flex; flex-direction: column; }
.fullscreen-toolbar {
  padding: 0.8rem; display: flex; gap: 0.5rem; align-items: center;
  background: #E5E7EB; border-bottom: 1px solid #D1D5DB;
}
.fullscreen-toolbar span { min-width: 50px; color: #1F2937; }
.fullscreen-viewport {
  flex: 1; overflow: auto; display: flex; justify-content: center;
  padding: 20px; background: #F3F4F6;
}
</style>
