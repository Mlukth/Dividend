<template>
  <div class="tab-box-root">
    <div v-for="ver in versionList" :key="ver.id" class="version-card">
      <div class="version-label">{{ ver.label }}</div>
      <div class="btn-group" :class="ver.wrapClass">
        <button
          v-for="item in tabList"
          :key="item.value"
          class="btn-item"
          :class="[
            activeTab[ver.id] === item.value ? ver.activeClass : ver.inactiveClass
          ]"
          @click="activeTab[ver.id] = item.value"
        >
          {{ item.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 通用标签
const tabList = [
  { label: '今日', value: 'day' },
  { label: '本月', value: 'month' },
  { label: '本年', value: 'year' },
  { label: '累计', value: 'total' }
]

// 激活状态管理
const activeTab = ref({
  v1: 'day', v2: 'day', v3: 'day', v4: 'day', v5: 'day',
  v6: 'day', v7: 'day', v8: 'day', v9: 'day', v10: 'day',
  v11: 'day', v12: 'day', v13: 'day', v14: 'day', v15: 'day'
})

// 15个版本
const versionList = [
  { id: 'v1', label: 'V1 光伏标准蓝', wrapClass: 'wrap-v1', activeClass: 'act-v1', inactiveClass: 'ina-v1' },
  { id: 'v2', label: 'V2 全直角硬朗', wrapClass: 'wrap-v2', activeClass: 'act-v2', inactiveClass: 'ina-v2' },
  { id: 'v3', label: 'V3 细边框线框', wrapClass: 'wrap-v3', activeClass: 'act-v3', inactiveClass: 'ina-v3' },
  { id: 'v4', label: 'V4 浅灰底极简', wrapClass: 'wrap-v4', activeClass: 'act-v4', inactiveClass: 'ina-v4' },
  { id: 'v5', label: 'V5 底部指示条', wrapClass: 'wrap-v5', activeClass: 'act-v5', inactiveClass: 'ina-v5' },
  { id: 'v6', label: 'V6 实心深色块', wrapClass: 'wrap-v6', activeClass: 'act-v6', inactiveClass: 'ina-v6' },
  { id: 'v7', label: 'V7 渐变描边', wrapClass: 'wrap-v7', activeClass: 'act-v7', inactiveClass: 'ina-v7' },
  { id: 'v8', label: 'V8 磨砂半透', wrapClass: 'wrap-v8', activeClass: 'act-v8', inactiveClass: 'ina-v8' },
  { id: 'v9', label: 'V9 虚线边框', wrapClass: 'wrap-v9', activeClass: 'act-v9', inactiveClass: 'ina-v9' },
  { id: 'v10', label: 'V10 文字高亮', wrapClass: 'wrap-v10', activeClass: 'act-v10', inactiveClass: 'ina-v10' },
  { id: 'v11', label: 'V11 轻拟物白底', wrapClass: 'wrap-v11', activeClass: 'act-v11', inactiveClass: 'ina-v11' },
  { id: 'v12', label: 'V12 反色对比', wrapClass: 'wrap-v12', activeClass: 'act-v12', inactiveClass: 'ina-v12' },
  { id: 'v13', label: 'V13 小圆角商务', wrapClass: 'wrap-v13', activeClass: 'act-v13', inactiveClass: 'ina-v13' },
  { id: 'v14', label: 'V14 科技微光', wrapClass: 'wrap-v14', activeClass: 'act-v14', inactiveClass: 'ina-v14' },
  { id: 'v15', label: 'V15 纯扁平无饰', wrapClass: 'wrap-v15', activeClass: 'act-v15', inactiveClass: 'ina-v15' }
]
</script>

<style scoped>
/* 根容器 */
.tab-box-root {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}
.version-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.version-label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}
.btn-group {
  display: flex;
  gap: 6px;
}

/* 基础按钮：无任何弹跳、缩放动画 */
.btn-item {
  padding: 8px 16px;
  font-size: 14px;
  border: none;
  cursor: pointer;
  /* 只平滑过渡颜色/背景/边框，无transform */
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

/* ============================================== */
/* V1 光伏标准蓝（常用主风格） */
.wrap-v1 .btn-item { border-radius: 6px; }
.act-v1 { background: #1677ff; color: #fff; }
.ina-v1 { background: #f0f2f5; color: #666; }

/* V2 全直角硬朗 */
.wrap-v2 .btn-item { border-radius: 0; }
.act-v2 { background: #0052cc; color: #fff; }
.ina-v2 { background: #fff; color: #666; border: 1px solid #e5e6eb; }

/* V3 细边框线框 */
.wrap-v3 .btn-item { border-radius: 8px; border: 1px solid #1677ff; }
.act-v3 { background: #1677ff; color: #fff; }
.ina-v3 { background: #fff; color: #1677ff; }

/* V4 浅灰底极简 */
.wrap-v4 .btn-item { border-radius: 8px; }
.act-v4 { background: #e8f3ff; color: #1677ff; font-weight: 500; }
.ina-v4 { background: #f7f8fa; color: #888; }

/* V5 底部指示条 */
.wrap-v5 .btn-item { border-radius: 0; background: transparent; padding: 8px 14px; }
.act-v5 { color: #1677ff; border-bottom: 2px solid #1677ff; font-weight: 500; }
.ina-v5 { color: #999; border-bottom: 2px solid transparent; }

/* V6 实心深色块 */
.wrap-v6 .btn-item { border-radius: 6px; }
.act-v6 { background: #1d2129; color: #fff; }
.ina-v6 { background: #e5e6eb; color: #4e5969; }

/* V7 渐变描边 */
.wrap-v7 .btn-item { border-radius: 8px; border: 1px solid transparent; background-clip: padding-box; }
.act-v7 { background: linear-gradient(90deg, #1677ff, #40a9ff); color: #fff; }
.ina-v7 { background: #fff; color: #666; border-color: #e5e6eb; }

/* V8 磨砂半透 */
.wrap-v8 { background: rgba(255,255,255,.7); padding: 4px; border-radius: 10px; }
.wrap-v8 .btn-item { border-radius: 6px; }
.act-v8 { background: rgba(22,119,255,.9); color: #fff; }
.ina-v8 { background: transparent; color: #666; }

/* V9 虚线边框 */
.wrap-v9 .btn-item { border-radius: 8px; border: 1px dashed #1677ff; }
.act-v9 { background: #1677ff; color: #fff; border-style: solid; }
.ina-v9 { background: #fff; color: #1677ff; }

/* V10 文字高亮 */
.wrap-v10 .btn-item { border-radius: 0; background: transparent; padding: 8px 14px; }
.act-v10 { color: #1677ff; font-size: 15px; font-weight: 600; }
.ina-v10 { color: #999; }

/* V11 轻拟物白底 */
.wrap-v11 .btn-item { border-radius: 8px; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.06); }
.act-v11 { color: #1677ff; font-weight: 500; }
.ina-v11 { color: #888; }

/* V12 反色对比 */
.wrap-v12 .btn-item { border-radius: 6px; }
.act-v12 { background: #fff; color: #1677ff; border: 1px solid #1677ff; }
.ina-v12 { background: #1677ff; color: #fff; }

/* V13 小圆角商务 */
.wrap-v13 .btn-item { border-radius: 4px; }
.act-v13 { background: #0e72ed; color: #fff; }
.ina-v13 { background: #f2f3f5; color: #555; }

/* V14 科技微光（无弹跳） */
.wrap-v14 .btn-item { border-radius: 6px; }
.act-v14 { background: #1677ff; color: #fff; box-shadow: 0 0 6px rgba(22,119,255,.3); }
.ina-v14 { background: #172035; color: #c9cdd4; }

/* V15 纯扁平无装饰 */
.wrap-v15 .btn-item { border-radius: 0; background: transparent; padding: 6px 14px; }
.act-v15 { background: #e8f3ff; color: #1677ff; }
.ina-v15 { color: #999; }
</style>