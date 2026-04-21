<template>
  <div class="compare-outer">
    <h2 class="compare-title">左侧菜单样式对比预览</h2>
    <p class="compare-desc">右侧内容区域固定宽度，左侧菜单绝对定位浮层，展开/收缩不影响右侧布局。</p>
    
    <!-- 样式切换器 -->
    <div class="style-switcher">
      <el-radio-group v-model="currentStyle" size="large">
        <el-radio-button value="A">样式 A · 经典白</el-radio-button>
        <el-radio-button value="B">样式 B · 暗色透明</el-radio-button>
        <el-radio-button value="C">样式 C · 圆角拉手</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 预览舞台 -->
    <div class="preview-stage">
      <!-- 样式 A -->
      <StyleA v-if="currentStyle === 'A'" />
      <!-- 样式 B -->
      <StyleB v-if="currentStyle === 'B'" />
      <!-- 样式 C -->
      <StyleC v-if="currentStyle === 'C'" />
    </div>

    <!-- 说明信息 -->
    <div class="style-info">
      <el-alert 
        :title="currentStyleDesc" 
        type="info" 
        :closable="false"
        show-icon
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import StyleA from './StyleA.vue'
import StyleB from './StyleB.vue'
import StyleC from './StyleC.vue'

const currentStyle = ref('A')

const currentStyleDesc = computed(() => {
  const map = {
    A: '样式A：经典白色菜单，拉手为细长条带箭头，位于菜单右侧边缘。菜单展开时带有轻微阴影。',
    B: '样式B：菜单背景为半透明深色，拉手为圆形悬浮按钮，位于菜单右下角。收缩时仅显示圆形按钮。',
    C: '样式C：菜单背景为浅灰色，拉手为圆角胶囊形状，带“展开/收缩”文字提示。'
  }
  return map[currentStyle.value] || ''
})
</script>

<style scoped>
.compare-outer {
  padding: 24px;
  background: #f0f2f5;
  min-height: 100vh;
}

.compare-title {
  font-size: 24px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 8px;
}

.compare-desc {
  font-size: 14px;
  color: #86909c;
  margin-bottom: 24px;
}

.style-switcher {
  margin-bottom: 24px;
}

.preview-stage {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  margin-bottom: 24px;
}

.style-info {
  max-width: 800px;
}
</style>