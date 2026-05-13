<template>
  <div class="tab-root">
    <div v-for="ver in versionList" :key="ver.id" class="version-item">
      <div class="version-title">{{ ver.title }}</div>
      <div class="btn-group" :class="ver.wrapClass">
        <button
          v-for="item in tabItems"
          :key="item.value"
          class="btn-el"
          :class="[
            activeVal[ver.id] === item.value ? ver.activeCls : ver.inactiveCls
          ]"
          @click="activeVal[ver.id] = item.value"
        >
          {{ item.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const tabItems = [
  { label: '今日', value: 'day' },
  { label: '本月', value: 'month' },
  { label: '本年', value: 'year' },
  { label: '累计', value: 'total' }
]

const activeVal = ref({
  v1: 'day', v2: 'day', v3: 'day', v4: 'day', v5: 'day',
  v6: 'day', v7: 'day', v8: 'day', v9: 'day', v10: 'day',
  v11: 'day', v12: 'day', v13: 'day', v14: 'day', v15: 'day',
  v16: 'day', v17: 'day', v18: 'day', v19: 'day', v20: 'day',
  v21: 'day', v22: 'day', v23: 'day', v24: 'day', v25: 'day',
  v26: 'day', v27: 'day', v28: 'day', v29: 'day', v30: 'day'
})

const versionList = [
  // 前15版（原有稳定版）
  { id: 'v1', title: 'V1 光伏标准蓝', wrapClass: 'wrap1', activeCls: 'act1', inactiveCls: 'ina1' },
  { id: 'v2', title: 'V2 全直角硬朗', wrapClass: 'wrap2', activeCls: 'act2', inactiveCls: 'ina2' },
  { id: 'v3', title: 'V3 细边框线框', wrapClass: 'wrap3', activeCls: 'act3', inactiveCls: 'ina3' },
  { id: 'v4', title: 'V4 浅灰底极简', wrapClass: 'wrap4', activeCls: 'act4', inactiveCls: 'ina4' },
  { id: 'v5', title: 'V5 底部指示条', wrapClass: 'wrap5', activeCls: 'act5', inactiveCls: 'ina5' },
  { id: 'v6', title: 'V6 实心深色块', wrapClass: 'wrap6', activeCls: 'act6', inactiveCls: 'ina6' },
  { id: 'v7', title: 'V7 渐变描边', wrapClass: 'wrap7', activeCls: 'act7', inactiveCls: 'ina7' },
  { id: 'v8', title: 'V8 磨砂半透', wrapClass: 'wrap8', activeCls: 'act8', inactiveCls: 'ina8' },
  { id: 'v9', title: 'V9 虚线边框', wrapClass: 'wrap9', activeCls: 'act9', inactiveCls: 'ina9' },
  { id: 'v10', title: 'V10 文字高亮', wrapClass: 'wrap10', activeCls: 'act10', inactiveCls: 'ina10' },
  { id: 'v11', title: 'V11 轻拟物白底', wrapClass: 'wrap11', activeCls: 'act11', inactiveCls: 'ina11' },
  { id: 'v12', title: 'V12 反色对比', wrapClass: 'wrap12', activeCls: 'act12', inactiveCls: 'ina12' },
  { id: 'v13', title: 'V13 小圆角商务', wrapClass: 'wrap13', activeCls: 'act13', inactiveCls: 'ina13' },
  { id: 'v14', title: 'V14 科技微光', wrapClass: 'wrap14', activeCls: 'act14', inactiveCls: 'ina14' },
  { id: 'v15', title: 'V15 纯扁平无饰', wrapClass: 'wrap15', activeCls: 'act15', inactiveCls: 'ina15' },

  // 新增15版（无弹跳，全新风格）
  { id: 'v16', title: 'V16 工业金属灰', wrapClass: 'wrap16', activeCls: 'act16', inactiveCls: 'ina16' },
  { id: 'v17', title: 'V17 水墨极简风', wrapClass: 'wrap17', activeCls: 'act17', inactiveCls: 'ina17' },
  { id: 'v18', title: 'V18 紧凑无间距', wrapClass: 'wrap18', activeCls: 'act18', inactiveCls: 'ina18' },
  { id: 'v19', title: 'V19 马卡龙淡蓝', wrapClass: 'wrap19', activeCls: 'act19', inactiveCls: 'ina19' },
  { id: 'v20', title: 'V20 微浮雕质感', wrapClass: 'wrap20', activeCls: 'act20', inactiveCls: 'ina20' },
  { id: 'v21', title: 'V21 分割线区块', wrapClass: 'wrap21', activeCls: 'act21', inactiveCls: 'ina21' },
  { id: 'v22', title: 'V22 深色光伏主题', wrapClass: 'wrap22', activeCls: 'act22', inactiveCls: 'ina22' },
  { id: 'v23', title: 'V23 像素复古风', wrapClass: 'wrap23', activeCls: 'act23', inactiveCls: 'ina23' },
  { id: 'v24', title: 'V24 双色块拼接', wrapClass: 'wrap24', activeCls: 'act24', inactiveCls: 'ina24' },
  { id: 'v25', title: 'V25 超小圆角', wrapClass: 'wrap25', activeCls: 'act25', inactiveCls: 'ina25' },
  { id: 'v26', title: 'V26 空心渐变蓝', wrapClass: 'wrap26', activeCls: 'act26', inactiveCls: 'ina26' },
  { id: 'v27', title: 'V27 浅线框极简', wrapClass: 'wrap27', activeCls: 'act27', inactiveCls: 'ina27' },
  { id: 'v28', title: 'V28 磨砂深灰', wrapClass: 'wrap28', activeCls: 'act28', inactiveCls: 'ina28' },
  { id: 'v29', title: 'V29 半实心填充', wrapClass: 'wrap29', activeCls: 'act29', inactiveCls: 'ina29' },
  { id: 'v30', title: 'V30 极窄细长条', wrapClass: 'wrap30', activeCls: 'act30', inactiveCls: 'ina30' }
]
</script>

<style scoped>
.tab-root {
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}
.version-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.version-title {
  font-size: 14px;
  color: #555;
  font-weight: 500;
}
.btn-group {
  display: flex;
  gap: 6px;
}

/* 基础按钮：彻底无弹跳、无缩放、无抖动 */
.btn-el {
  padding: 8px 16px;
  font-size: 14px;
  border: none;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

/* ============================================== */
/* 1-15 原有样式 */
.wrap1 .btn-el { border-radius: 6px; }
.act1 { background: #1677ff; color: #fff; }
.ina1 { background: #f0f2f5; color: #666; }

.wrap2 .btn-el { border-radius: 0; }
.act2 { background: #0052cc; color: #fff; }
.ina2 { background: #fff; color: #666; border: 1px solid #e5e6eb; }

.wrap3 .btn-el { border-radius: 8px; border: 1px solid #1677ff; }
.act3 { background: #1677ff; color: #fff; }
.ina3 { background: #fff; color: #1677ff; }

.wrap4 .btn-el { border-radius: 8px; }
.act4 { background: #e8f3ff; color: #1677ff; font-weight: 500; }
.ina4 { background: #f7f8fa; color: #888; }

.wrap5 .btn-el { border-radius: 0; background: transparent; padding: 8px 14px; }
.act5 { color: #1677ff; border-bottom: 2px solid #1677ff; font-weight: 500; }
.ina5 { color: #999; border-bottom: 2px solid transparent; }

.wrap6 .btn-el { border-radius: 6px; }
.act6 { background: #1d2129; color: #fff; }
.ina6 { background: #e5e6eb; color: #4e5969; }

.wrap7 .btn-el { border-radius: 8px; border: 1px solid transparent; }
.act7 { background: linear-gradient(90deg, #1677ff, #40a9ff); color: #fff; }
.ina7 { background: #fff; color: #666; border-color: #e5e6eb; }

.wrap8 { background: rgba(255,255,255,.7); padding: 4px; border-radius: 10px; }
.wrap8 .btn-el { border-radius: 6px; }
.act8 { background: rgba(22,119,255,.9); color: #fff; }
.ina8 { background: transparent; color: #666; }

.wrap9 .btn-el { border-radius: 8px; border: 1px dashed #1677ff; }
.act9 { background: #1677ff; color: #fff; border-style: solid; }
.ina9 { background: #fff; color: #1677ff; }

.wrap10 .btn-el { border-radius: 0; background: transparent; padding: 8px 14px; }
.act10 { color: #1677ff; font-size: 15px; font-weight: 600; }
.ina10 { color: #999; }

.wrap11 .btn-el { border-radius: 8px; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.06); }
.act11 { color: #1677ff; font-weight: 500; }
.ina11 { color: #888; }

.wrap12 .btn-el { border-radius: 6px; }
.act12 { background: #fff; color: #1677ff; border: 1px solid #1677ff; }
.ina12 { background: #1677ff; color: #fff; }

.wrap13 .btn-el { border-radius: 4px; }
.act13 { background: #0e72ed; color: #fff; }
.ina13 { background: #f2f3f5; color: #555; }

.wrap14 .btn-el { border-radius: 6px; }
.act14 { background: #1677ff; color: #fff; box-shadow: 0 0 6px rgba(22,119,255,.3); }
.ina14 { background: #172035; color: #c9cdd4; }

.wrap15 .btn-el { border-radius: 0; background: transparent; padding: 6px 14px; }
.act15 { background: #e8f3ff; color: #1677ff; }
.ina15 { color: #999; }

/* ============================================== */
/* 16-30 新增15套全新样式 */
.wrap16 .btn-el { border-radius: 4px; }
.act16 { background: #7a7f8a; color: #fff; }
.ina16 { background: #eaecef; color: #555; border: 1px solid #d0d3d9; }

.wrap17 .btn-el { border-radius: 2px; background: transparent; }
.act17 { color: #2c3e50; border-bottom: 1px solid #2c3e50; font-weight: 500; }
.ina17 { color: #7f8c8d; }

.wrap18 { gap: 0 !important; }
.wrap18 .btn-el { border-radius: 0; }
.act18 { background: #1677ff; color: #fff; }
.ina18 { background: #f0f2f5; color: #666; border-right: 1px solid #dcdfe6; }

.wrap19 .btn-el { border-radius: 12px; }
.act19 { background: #d1e9ff; color: #2f80ed; }
.ina19 { background: #f7fafc; color: #64748b; }

.wrap20 .btn-el { border-radius: 8px; box-shadow: inset 0 1px 2px rgba(0,0,0,.05); }
.act20 { background: #edf4ff; color: #1677ff; border: 1px solid #adc6ff; }
.ina20 { background: #fff; color: #888; border: 1px solid #e5e6eb; }

.wrap21 { border: 1px solid #e5e6eb; border-radius: 8px; overflow: hidden; }
.wrap21 .btn-el { border-radius: 0; }
.act21 { background: #e8f3ff; color: #1677ff; }
.ina21 { background: #fff; color: #666; }

.wrap22 { background: #121a29; padding: 4px; border-radius: 8px; }
.wrap22 .btn-el { border-radius: 4px; }
.act22 { background: #1677ff; color: #fff; }
.ina22 { background: #1e293b; color: #94a3b8; }

.wrap23 .btn-el { border-radius: 0; border: 1px solid #222; }
.act23 { background: #000; color: #0f0; }
.ina23 { background: #222; color: #ccc; }

.wrap24 .btn-el { border-radius: 6px; }
.act24 { background: linear-gradient(90deg, #1677ff 50%, #0052cc 50%); color: #fff; }
.ina24 { background: #f0f2f5; color: #666; }

.wrap25 .btn-el { border-radius: 2px; }
.act25 { background: #1677ff; color: #fff; }
.ina25 { background: #f5f7fa; color: #666; }

.wrap26 .btn-el { border-radius: 10px; border: 1px solid #1677ff; }
.act26 { background: linear-gradient(#1677ff, #40a9ff); color: #fff; }
.ina26 { background: transparent; color: #1677ff; }

.wrap27 .btn-el { border-radius: 8px; border: 1px solid #dcdfe6; }
.act27 { border-color: #1677ff; color: #1677ff; background: #fff; }
.ina27 { color: #999; background: #fff; }

.wrap28 .btn-el { border-radius: 8px; }
.act28 { background: #4e5969; color: #fff; }
.ina28 { background: #c9cdd4; color: #333; }

.wrap29 .btn-el { border-radius: 8px; }
.act29 { background: #1677ff; color: #fff; }
.ina29 { background: rgba(22,119,255,.15); color: #1677ff; }

.wrap30 .btn-el { border-radius: 4px; padding: 6px 12px; font-size: 13px; }
.act30 { background: #1677ff; color: #fff; }
.ina30 { background: #f0f2f5; color: #666; }
</style>