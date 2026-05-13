<template>
  <div class="station-list-module">
    <!-- 卡片标题 -->
    <div class="list-header">
      <div class="module-title">电站健康综合看板</div>
    </div>

    <!-- 搜索栏内嵌在卡片内，标题下方 -->
    <div class="inline-filter">
      <el-form :model="filterForm" inline class="filter-form">
        <el-form-item label="电站名称">
          <el-input v-model="filterForm.stationName" placeholder="请输入电站名称" clearable class="filter-input" />
        </el-form-item>
        <el-form-item label="健康度范围">
          <el-select v-model="filterForm.healthRange" placeholder="请选择健康度范围" clearable class="filter-select">
            <el-option label="90分以上" value="90" />
            <el-option label="80~89分" value="80" />
            <el-option label="70~79分" value="70" />
            <el-option label="70分以下" value="60" />
          </el-select>
        </el-form-item>
      </el-form>
    </div>

    <!-- 分段筛选器 -->
    <div class="segmented-row">
      <div class="custom-segmented seg-pro5">
        <div class="selected-slider" :style="sliderStyle"></div>
        <label class="segment-item" :class="{ active: activeStatus === 'all' }" @click="setStatus('all')">
          <span class="dot" style="background:#409EFF"></span>
          <span class="text">全部({{ statusStats.total }})</span>
        </label>
        <label class="segment-item" :class="{ active: activeStatus === 'normal' }" @click="setStatus('normal')">
          <span class="dot" style="background:#67c23a"></span>
          <span class="text">健康({{ statusStats.normal }})</span>
        </label>
        <label class="segment-item" :class="{ active: activeStatus === 'warning' }" @click="setStatus('warning')">
          <span class="dot" style="background:#e6a23c"></span>
          <span class="text">预警({{ statusStats.warning }})</span>
        </label>
        <label class="segment-item" :class="{ active: activeStatus === 'serious' }" @click="setStatus('serious')">
          <span class="dot" style="background:#f56c6c"></span>
          <span class="text">严重({{ statusStats.serious }})</span>
        </label>
      </div>
    </div>

    <!-- 表格 -->
    <el-table :data="filteredList" border stripe class="station-table">
      <el-table-column label="状态" align="center" width="80">
        <template #default="{ row }">
          <el-tag :type="row.healthStatus === 'normal' ? 'success' : row.healthStatus === 'warning' ? 'warning' : 'danger'" size="small">
            {{ row.healthStatus === 'normal' ? '健康' : row.healthStatus === 'warning' ? '预警' : '严重' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="电站名称" align="center" min-width="160">
        <template #default="{ row }">
          <span class="station-name-link">{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="健康度" align="center" width="100">
        <template #default="{ row }">
          <span :style="{ color: row.healthScore >= 90 ? '#67c23a' : row.healthScore >= 80 ? '#409eff' : row.healthScore >= 70 ? '#e6a23c' : '#f56c6c' }">
            {{ row.healthScore }}分
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="pr" label="PR(%)" align="center" width="100" />
      <el-table-column prop="inverterDiscrete" label="逆变器离散率(%)" align="center" min-width="140" />
      <el-table-column prop="maxPowerRatio" label="最大功率占比(%)" align="center" min-width="140" />
      <el-table-column prop="lowCurrentRatio" label="低电流组串占比(%)" align="center" min-width="150" />
      <el-table-column prop="insufficientInverter" label="日满发不足逆变器" align="center" min-width="150" />
      <el-table-column label="标杆电站" align="center" width="100">
        <template #default="{ row }">
          <el-tag :type="row.isBenchmark ? 'success' : 'info'" size="small">{{ row.isBenchmark ? '是' : '否' }}</el-tag>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页器 -->
    <div class="pagination-wrap">
      <span class="total-text">共 {{ totalCount }} 条</span>
      <el-select v-model="pageSize" class="size-select" @change="pageNo = 1">
        <el-option label="10条/页" :value="10" />
        <el-option label="20条/页" :value="20" />
        <el-option label="50条/页" :value="50" />
      </el-select>
      <button class="text-btn" :disabled="pageNo === 1" @click="pageNo = 1">首页</button>
      <button class="pagination-arrow" :disabled="pageNo === 1" @click="pageNo--">
        <i class="el-icon"><svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M609.408 149.376 277.76 489.6a32 32 0 0 0 0 44.672l331.648 340.352a29.12 29.12 0 0 0 41.728 0 30.59 30.59 0 0 0 0-42.752L339.264 511.936l311.872-319.872a30.59 30.59 0 0 0 0-42.688 29.12 29.12 0 0 0-41.728 0"/></svg></i>
      </button>
      <div class="current-page-box">{{ pageNo }}</div>
      <button class="pagination-arrow" :disabled="pageNo === totalPage" @click="pageNo++">
        <i class="el-icon"><svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M340.864 149.312a30.59 30.59 0 0 0 0 42.752L652.736 512 340.864 831.872a30.59 30.59 0 0 0 0 42.752 29.12 29.12 0 0 0 41.728 0L714.24 534.336a32 32 0 0 0 0-44.672L382.592 149.376a29.12 29.12 0 0 0-41.728 0"/></svg></i>
      </button>
      <button class="text-btn" :disabled="pageNo === totalPage" @click="pageNo = totalPage">尾页</button>
      <span class="jump-text">前往</span>
      <el-input v-model="jumpValue" class="jump-input" @keyup.enter="handleJump" />
      <span class="jump-text">页</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 筛选
const activeStatus = ref('all')
const filterForm = ref({ stationName: '', healthRange: '' })
const pageNo = ref(1)
const pageSize = ref(10)
const jumpValue = ref('')

// 模拟数据
const stationList = ref([
  { id: 1, name: '三期-芳宇工程', healthScore: 92, healthStatus: 'normal', pr: 88, inverterDiscrete: '4.2%', maxPowerRatio: '85.3%', lowCurrentRatio: '2.1%', insufficientInverter: 0, isBenchmark: true },
  { id: 2, name: '二期-金富缘', healthScore: 78, healthStatus: 'warning', pr: 76, inverterDiscrete: '8.5%', maxPowerRatio: '81.2%', lowCurrentRatio: '4.8%', insufficientInverter: 1, isBenchmark: false },
  { id: 3, name: '一期-罗斯热熔胶', healthScore: 65, healthStatus: 'serious', pr: 68, inverterDiscrete: '12.1%', maxPowerRatio: '74.6%', lowCurrentRatio: '8.7%', insufficientInverter: 3, isBenchmark: false },
  { id: 4, name: '惠州百财新能源', healthScore: 95, healthStatus: 'normal', pr: 91, inverterDiscrete: '3.1%', maxPowerRatio: '90.5%', lowCurrentRatio: '1.5%', insufficientInverter: 0, isBenchmark: true },
  { id: 5, name: '户用电站', healthScore: 82, healthStatus: 'normal', pr: 83, inverterDiscrete: '5.6%', maxPowerRatio: '84.1%', lowCurrentRatio: '3.3%', insufficientInverter: 1, isBenchmark: false }
])

const statusStats = computed(() => ({
  total: stationList.value.length,
  normal: stationList.value.filter(i => i.healthStatus === 'normal').length,
  warning: stationList.value.filter(i => i.healthStatus === 'warning').length,
  serious: stationList.value.filter(i => i.healthStatus === 'serious').length
}))

const filteredList = computed(() => {
  let list = stationList.value
  if (activeStatus.value !== 'all') list = list.filter(i => i.healthStatus === activeStatus.value)
  if (filterForm.value.stationName) {
    const kw = filterForm.value.stationName.trim().toLowerCase()
    list = list.filter(i => i.name.toLowerCase().includes(kw))
  }
  if (filterForm.value.healthRange) {
    const rangeMin = parseInt(filterForm.value.healthRange)
    if (rangeMin === 60) list = list.filter(i => i.healthScore < 70)
    else if (rangeMin === 70) list = list.filter(i => i.healthScore >= 70 && i.healthScore < 80)
    else if (rangeMin === 80) list = list.filter(i => i.healthScore >= 80 && i.healthScore < 90)
    else if (rangeMin === 90) list = list.filter(i => i.healthScore >= 90)
  }
  return list.slice((pageNo.value - 1) * pageSize.value, pageNo.value * pageSize.value)
})

const totalCount = computed(() => {
  let list = stationList.value
  if (activeStatus.value !== 'all') list = list.filter(i => i.healthStatus === activeStatus.value)
  if (filterForm.value.stationName) {
    const kw = filterForm.value.stationName.trim().toLowerCase()
    list = list.filter(i => i.name.toLowerCase().includes(kw))
  }
  if (filterForm.value.healthRange) {
    const rangeMin = parseInt(filterForm.value.healthRange)
    if (rangeMin === 60) list = list.filter(i => i.healthScore < 70)
    else if (rangeMin === 70) list = list.filter(i => i.healthScore >= 70 && i.healthScore < 80)
    else if (rangeMin === 80) list = list.filter(i => i.healthScore >= 80 && i.healthScore < 90)
    else if (rangeMin === 90) list = list.filter(i => i.healthScore >= 90)
  }
  return list.length
})

const totalPage = computed(() => Math.max(1, Math.ceil(totalCount.value / pageSize.value)))

const setStatus = (val) => { activeStatus.value = val; pageNo.value = 1; nextTick(updateSlider) }

const sliderStyle = ref({})
const itemMap = { all: 0, normal: 1, warning: 2, serious: 3 }
const updateSlider = () => {
  const items = document.querySelectorAll('.seg-pro5 .segment-item')
  if (!items.length) return
  const rects = [...items].map(el => ({ w: el.offsetWidth, l: el.offsetLeft }))
  const rect = rects[itemMap[activeStatus.value] ?? 0]
  if (rect) sliderStyle.value = { width: `${rect.w}px`, transform: `translateX(${rect.l}px)` }
}

const handleJump = () => {
  const p = +jumpValue.value
  if (p >= 1 && p <= totalPage.value) { pageNo.value = p; jumpValue.value = '' }
  else ElMessage.warning(`请输入 1~${totalPage.value} 之间的页码`)
}

onMounted(() => nextTick(updateSlider))
</script>

<style scoped>
.station-list-module {
  background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  padding: 16px 24px; width: 100%; box-sizing: border-box; margin: 24px auto;
  max-width: 1200px;
}
.list-header { margin-bottom: 12px; }
.module-title { font-size: 16px; font-weight: 700; color: #1D2129; }

/* 内嵌搜索栏 */
.inline-filter {
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}
.filter-form { display: flex; align-items: center; flex-wrap: nowrap; gap: 8px; }
:deep(.el-form-item) { margin-bottom: 0; }
:deep(.el-form-item__label) { font-weight: 500; color: #4E5969; padding-right: 4px; }
.filter-input, .filter-select { flex: 1 1 100px; min-width: 80px; border-radius: 8px; }

/* 分段筛选器 */
.segmented-row { margin-bottom: 16px; }
.custom-segmented { position: relative; display: flex; align-items: center; width: fit-content; background: #F8F9FA; border-radius: 8px; user-select: none; }
.selected-slider { position: absolute; top: 0; left: 0; height: 100%; background: #fff; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); transition: all .3s ease; z-index: 1; }
.segment-item { position: relative; z-index: 2; display: flex; align-items: center; color: #4E5969; cursor: pointer; white-space: nowrap; }
.segment-item .text { line-height: 1; }
.dot { border-radius: 50%; flex-shrink: 0; }
.seg-pro5 { padding: 4px 8px; gap: 10px; }
.seg-pro5 .segment-item { padding: 6px 8px; font-size: 13px; }
.seg-pro5 .dot { width: 9px; height: 9px; }

/* 表格 */
.station-table { width: 100%; border-radius: 8px; overflow: hidden; font-size: 13px; }
.station-name-link { color: #165DFF; font-weight: 500; cursor: default; }
:deep(.el-table__header) { background: #F5F7FA; }
:deep(.el-table__header th) { font-weight: 700; color: #1D2129; }
:deep(.el-table__row:hover > td) { background-color: #F0F7FF !important; }

/* 分页 */
.pagination-wrap { display: flex; align-items: center; gap: 8px; margin-top: 20px; }
.total-text { font-size: 14px; color: #4E5969; margin-right: 8px; }
.size-select { width: 110px; }
.pagination-arrow { width: 32px; height: 32px; border: 1px solid #DCDFE6; background: #fff; border-radius: 8px; display: flex; align-items: center; justify-content: center; transition: all .2s; }
.pagination-arrow:hover:not(:disabled) { border-color: #165DFF; color: #165DFF; }
.pagination-arrow:disabled { opacity: 0.4; cursor: not-allowed; }
.pagination-arrow .el-icon { width: 14px; height: 14px; display: flex; }
.pagination-arrow .el-icon svg { width: 100%; height: 100%; }
.current-page-box { width: 40px; height: 32px; border: 1px solid #165DFF; background: #165DFF; color: #fff; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 14px; }
.text-btn { background: #fff; border: 1px solid #DCDFE6; border-radius: 8px; padding: 6px 12px; font-size: 13px; color: #4E5969; cursor: pointer; transition: all .2s; }
.text-btn:hover:not(:disabled) { border-color: #165DFF; color: #165DFF; }
.text-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.jump-text { font-size: 13px; color: #4E5969; }
.jump-input { width: 60px; }
.jump-input :deep(.el-input__inner) { text-align: center; height: 32px; border-radius: 8px; }
</style>