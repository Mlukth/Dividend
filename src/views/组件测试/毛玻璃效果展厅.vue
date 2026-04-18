<template>
  <div class="glass-show-page">
    <div class="bg-pattern"></div>
    <div class="title-box">
      <h2>毛玻璃效果组件库</h2>
      <p>7档强度 · 悬浮通透 · 一键复制</p>
    </div>

    <div class="glass-container">
      <div class="glass-card" v-for="(item, i) in glassItems" :key="i">
        <div class="glass-preview" :class="`glass-level-${i+1}`">
          <span class="preview-text">{{ item.name }}</span>
        </div>
        <div class="code-area">
          <pre class="code-text">{{ item.css }}</pre>
          <button class="copy-btn" @click="copyCss(item.css, i)">
            {{ btnText[i] || '复制CSS' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, markRaw } from 'vue'

// 毛玻璃配置
const glassItems = ref([
  { name: 'Level 1 轻磨砂', css: `background: rgba(255,255,255,0.15);backdrop-filter: blur(6px);-webkit-backdrop-filter: blur(6px);border: 1px solid rgba(255,255,255,0.1);box-shadow: 0 2px 8px rgba(0,0,0,0.05);` },
  { name: 'Level 2 标准毛玻璃', css: `background: rgba(255,255,255,0.25);backdrop-filter: blur(10px);-webkit-backdrop-filter: blur(10px);border: 1px solid rgba(255,255,255,0.15);box-shadow: 0 4px 12px rgba(0,0,0,0.08);` },
  { name: 'Level 3 通透玻璃', css: `background: rgba(255,255,255,0.35);backdrop-filter: blur(14px);-webkit-backdrop-filter: blur(14px);border: 1px solid rgba(255,255,255,0.2);box-shadow: 0 6px 16px rgba(0,0,0,0.1);` },
  { name: 'Level 4 质感玻璃', css: `background: rgba(255,255,255,0.45);backdrop-filter: blur(18px);-webkit-backdrop-filter: blur(18px);border: 1px solid rgba(255,255,255,0.25);box-shadow: 0 8px 20px rgba(0,0,0,0.12);` },
  { name: 'Level 5 悬浮玻璃', css: `background: rgba(255,255,255,0.55);backdrop-filter: blur(22px);-webkit-backdrop-filter: blur(22px);border: 1px solid rgba(255,255,255,0.3);box-shadow: 0 12px 28px rgba(0,0,0,0.15);` },
  { name: 'Level 6 高级磨砂', css: `background: rgba(255,255,255,0.65);backdrop-filter: blur(26px);-webkit-backdrop-filter: blur(26px);border: 1px solid rgba(255,255,255,0.35);box-shadow: 0 16px 32px rgba(0,0,0,0.18);` },
  { name: 'Level 7 顶级浮空', css: `background: rgba(255,255,255,0.7);backdrop-filter: blur(30px);-webkit-backdrop-filter: blur(30px);border: 1px solid rgba(255,255,255,0.4);box-shadow: 0 20px 40px rgba(0,0,0,0.2);` }
])

const btnText = ref([])

// 复制CSS（原生实现，无依赖报错）
const copyCss = async (css, index) => {
  await navigator.clipboard.writeText(css)
  btnText.value[index] = '✅ 已复制'
  setTimeout(() => {
    btnText.value[index] = '复制CSS'
  }, 1500)
}
</script>

<style scoped>
/* 基础页面 */
.glass-show-page {
  width: 100%;
  min-height: 100vh;
  padding: 40px 20px;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
}

/* 动态渐变背景（毛玻璃必备） */
.bg-pattern {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #F08519, #F19130, #36DB11, #9B56FD);
  background-size: 400% 400%;
  animation: bgMove 12s ease infinite;
  z-index: 0;
}

@keyframes bgMove {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* 标题 */
.title-box {
  text-align: center;
  margin-bottom: 40px;
  position: relative;
  z-index: 2;
}
.title-box h2 {
  font-size: 26px;
  color: #fff;
  margin: 0 0 8px 0;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.title-box p {
  font-size: 14px;
  color: #fff;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* 网格布局 */
.glass-container {
  max-width: 1300px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  position: relative;
  z-index: 2;
}

/* 卡片悬浮效果 */
.glass-card {
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  overflow: hidden;
  transition: transform 0.3s ease;
}
.glass-card:hover {
  transform: translateY(-8px);
}

/* 毛玻璃预览区 */
.glass-preview {
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.preview-text {
  color: #fff;
  font-size: 16px;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
}

/* 代码区域 */
.code-area {
  background: #1e1e2e;
  padding: 16px;
  position: relative;
}
.code-text {
  color: #a6e3a1;
  font-size: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0 0 10px 0;
  font-family: Consolas, monospace;
}
.copy-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 6px 12px;
  background: #F08519;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

/* 7档毛玻璃样式 */
.glass-level-1 { background: rgba(255,255,255,0.15); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
.glass-level-2 { background: rgba(255,255,255,0.25); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
.glass-level-3 { background: rgba(255,255,255,0.35); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); border: 1px solid rgba(255,255,255,0.2); box-shadow: 0 6px 16px rgba(0,0,0,0.1); }
.glass-level-4 { background: rgba(255,255,255,0.45); backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px); border: 1px solid rgba(255,255,255,0.25); box-shadow: 0 8px 20px rgba(0,0,0,0.12); }
.glass-level-5 { background: rgba(255,255,255,0.55); backdrop-filter: blur(22px); -webkit-backdrop-filter: blur(22px); border: 1px solid rgba(255,255,255,0.3); box-shadow: 0 12px 28px rgba(0,0,0,0.15); }
.glass-level-6 { background: rgba(255,255,255,0.65); backdrop-filter: blur(26px); -webkit-backdrop-filter: blur(26px); border: 1px solid rgba(255,255,255,0.35); box-shadow: 0 16px 32px rgba(0,0,0,0.18); }
.glass-level-7 { background: rgba(255,255,255,0.7); backdrop-filter: blur(30px); -webkit-backdrop-filter: blur(30px); border: 1px solid rgba(255,255,255,0.4); box-shadow: 0 20px 40px rgba(0,0,0,0.2); }
</style>