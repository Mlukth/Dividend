<template>
  <div class="preview-container">
    <div class="preview-header">
      <span class="preview-title">搜索筛选区域预览</span>
      <el-select v-model="currentWidth" style="width: 200px;">
        <el-option label="方案A：160px（推荐）" :value="160" />
        <el-option label="方案B：150px（紧凑）" :value="150" />
        <el-option label="方案C：140px（超紧凑）" :value="140" />
      </el-select>
    </div>

    <div class="filter-module">
      <el-form :model="filterForm" inline class="filter-form" :style="{ gap: gapStyle }">
        <el-form-item label="电站名称" class="filter-item">
          <el-input v-model="filterForm.stationName" placeholder="请输入电站名称" clearable :style="{ width: currentWidth + 'px' }" />
        </el-form-item>
        <el-form-item label="电站地址" class="filter-item">
          <el-input v-model="filterForm.stationAddress" placeholder="请输入电站地址" clearable :style="{ width: currentWidth + 'px' }" />
        </el-form-item>
        <el-form-item label="电站类型" class="filter-item">
          <el-select v-model="filterForm.stationType" placeholder="请选择电站类型" clearable :style="{ width: currentWidth + 'px' }">
            <el-option label="户用光伏" value="household" />
            <el-option label="工商业光伏" value="commercial" />
            <el-option label="地面电站" value="ground" />
          </el-select>
        </el-form-item>
        <el-form-item label="并网时间" class="filter-item">
          <el-date-picker
            v-model="filterForm.gridTimeRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            :style="{ width: datePickerWidth + 'px' }"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="btn-search">搜索</el-button>
          <el-button class="btn-reset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="info-note">
      <p>当前方案：输入框宽度 <strong>{{ currentWidth }}px</strong>，日期选择器宽度 <strong>{{ datePickerWidth }}px</strong>，项目间距 <strong>{{ gapStyle }}</strong></p>
      <p>可自由缩放浏览器窗口，查看不同宽度下的换行情况</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const currentWidth = ref(160)

// 根据输入框宽度动态计算日期选择器宽度（保证日期组件更大一些）
const datePickerWidth = computed(() => {
  // 日期选择器需要显示两个日期框，所以稍宽一点
  return currentWidth.value === 160 ? 220 : currentWidth.value === 150 ? 210 : 200
})

// 间距也随宽度微调
const gapStyle = computed(() => {
  return currentWidth.value === 160 ? '12px' : currentWidth.value === 150 ? '10px' : '8px'
})

const filterForm = ref({
  stationName: '',
  stationAddress: '',
  stationType: '',
  gridTimeRange: []
})
</script>

<style scoped>
.preview-container {
  padding: 24px;
  background: #f0f2f5;
  min-height: 200px;
  font-family: "Microsoft YaHei", sans-serif;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.preview-title {
  font-size: 18px;
  font-weight: 600;
  color: #1D2129;
}

/* 完全继承原项目的卡片风格 */
.filter-module {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  padding: 16px 24px;
  width: 100%;
  box-sizing: border-box;
}

.filter-form {
  width: 100%;
  display: flex;
  align-items: center;
  flex-wrap: wrap; /* 预览时保留换行观察，但多数情况已单行 */
}

/* 继承原项目表单项样式 */
:deep(.el-form-item) {
  margin-bottom: 0;
  display: flex;
  align-items: center;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #4E5969;
  padding-right: 6px; /* 略微紧凑 */
}

.btn-search {
  border-radius: 8px;
  padding: 8px 20px;
  background: linear-gradient(90deg, #0052D9, #165DFF);
  border: none;
}

.btn-reset {
  border-radius: 8px;
  padding: 8px 20px;
  border-color: #DCDFE6;
  color: #606266;
}

.info-note {
  margin-top: 20px;
  padding: 12px 16px;
  background: #fff;
  border-radius: 8px;
  font-size: 14px;
  color: #4E5969;
}

.info-note p {
  margin: 4px 0;
}
</style>