<template>
  <div class="device-type-page">
    <div class="page-card">
      <!-- 可点击分段状态筛选器（替换原静态统计栏） -->
      <div class="segmented-row">
        <div class="custom-segmented seg-device">
          <div class="selected-slider" :style="sliderStyle"></div>
          <label class="segment-item" :class="{ active: activeStatus === 'all' }" @click="setStatus('all')">
            <span class="dot" style="background:#1D2129"></span>
            <span class="text">总数({{ stats.total }})</span>
          </label>
          <label class="segment-item" :class="{ active: activeStatus === 'online' }" @click="setStatus('online')">
            <span class="dot" style="background:#00B42A"></span>
            <span class="text">在线({{ stats.online }})</span>
          </label>
          <label class="segment-item" :class="{ active: activeStatus === 'alarm' }" @click="setStatus('alarm')">
            <span class="dot" style="background:#F53F3F"></span>
            <span class="text">报警({{ stats.alarm }})</span>
          </label>
          <label class="segment-item" :class="{ active: activeStatus === 'offline' }" @click="setStatus('offline')">
            <span class="dot" style="background:#86909C"></span>
            <span class="text">离线({{ stats.offline }})</span>
          </label>
        </div>
      </div>

      <!-- 内嵌搜索栏 -->
      <div class="inline-filter">
        <el-form :model="filterForm" inline class="filter-form">
          <el-form-item label="搜索SN">
            <el-select v-model="filterForm.sn" placeholder="搜索电池SN" clearable class="filter-input">
              <el-option v-for="opt in snOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="电池型号">
            <el-input v-model="filterForm.modelNo" placeholder="输入电池型号" clearable class="filter-input" />
          </el-form-item>
          <el-form-item label="电池类型">
            <el-select v-model="filterForm.batteryType" placeholder="选择电池类型" clearable class="filter-input">
              <el-option label="磷酸铁锂" value="lfp" />
              <el-option label="三元锂" value="ternary" />
            </el-select>
          </el-form-item>
          <el-form-item label="质保状态">
            <el-select v-model="filterForm.warranty" placeholder="请选择" clearable class="filter-input">
              <el-option label="在保" value="active" />
              <el-option label="过保" value="expired" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button class="btn-search" @click="handleSearch">查询</el-button>
            <el-button class="btn-reset" @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 表格区域 -->
      <div class="table-section">
        <el-table
          :data="pagedData"
          :header-cell-style="headerCellStyle"
          :cell-style="cellStyle"
          stripe
          style="width: 100%"
          table-layout="auto"
        >
          <el-table-column prop="status" label="状态" width="140" align="center">
            <template #default="{ row }">
              <div class="status-cell">
                <span class="status-dot" :style="{ backgroundColor: getStateInfo(row.status).color }"></span>
                <span class="status-text">{{ getStateInfo(row.status).text }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="名称" min-width="140" align="center" />
          <el-table-column prop="sn" label="电池SN" min-width="160" align="center">
            <template #default="{ row }">
              <a href="javascript:void(0)" class="sn-link">{{ row.sn }}</a>
            </template>
          </el-table-column>
          <el-table-column prop="ratedCapacity" label="额定容量(kWh)" width="120" align="center" />
          <el-table-column prop="soc" label="当前SOC(%)" width="120" align="center" sortable />
          <el-table-column prop="soh" label="健康度SOH(%)" width="130" align="center" sortable>
            <template #default="{ row }">
              <span :class="sohColor(row.soh)">{{ row.soh }}%</span>
            </template>
          </el-table-column>
          <el-table-column prop="soe" label="可用能量SOE(kWh)" width="120" align="center" />
          <el-table-column prop="cycleCount" label="循环次数" width="120" align="center" />
          <el-table-column prop="chargePower" label="充电功率(kW)" width="130" align="center" sortable />
          <el-table-column prop="dischargePower" label="放电功率(kW)" width="130" align="center" sortable />
          <el-table-column prop="batteryTemp" label="电池温度(℃)" width="120" align="center">
            <template #default="{ row }">
              <span :class="tempColor(row.batteryTemp)">{{ row.batteryTemp }}℃</span>
            </template>
          </el-table-column>
          <el-table-column prop="maxVoltageDiff" label="单体最大压差(V)" width="140" align="center">
            <template #default="{ row }">
              <span :class="voltageDiffColor(row.maxVoltageDiff)">{{ row.maxVoltageDiff }}V</span>
            </template>
          </el-table-column>
          <el-table-column label="单体电压范围" width="140" align="center">
            <template #default="{ row }">
              <span :class="cellVoltageColor(row.maxCellVoltage)">
                {{ row.minCellVoltage }}~{{ row.maxCellVoltage }}V
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="bmsStatus" label="BMS状态" width="120" align="center">
            <template #default="{ row }">
              <el-tag :type="bmsTagType(row.bmsStatus)" size="small">{{ bmsText(row.bmsStatus) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="station" label="所属电站" min-width="160" align="center" />
          <el-table-column prop="updateTime" label="更新时间" width="180" align="center" />

          <el-table-column label="操作" width="260" fixed="right" align="center">
            <template #default="{ row }">
              <el-dropdown @command="(cmd) => handleOperation(cmd, row)">
                <div class="operation-btn">
                  操作
                  <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                </div>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="detail">查看详情</el-dropdown-item>
                    <el-dropdown-item command="troubleshoot">故障排查</el-dropdown-item>
                    <el-dropdown-item command="remote">远程控制</el-dropdown-item>
                    <el-dropdown-item command="favorite">收藏</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>

        <!-- 统一分页器 -->
        <div class="pagination-wrap pagination-fast">
          <span class="total-text">共 {{ totalCount }} 条</span>
          <el-select v-model="pageSize" class="size-select" @change="pageNo = 1">
            <el-option label="10条/页" :value="10" />
            <el-option label="20条/页" :value="20" />
            <el-option label="50条/页" :value="50" />
          </el-select>
          <button class="text-btn" :disabled="pageNo === 1" @click="pageNo = 1">首页</button>
          <button class="pagination-arrow" :disabled="pageNo === 1" @click="pageNo--">
            <i class="el-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path fill="currentColor" d="M609.408 149.376 277.76 489.6a32 32 0 0 0 0 44.672l331.648 340.352a29.12 29.12 0 0 0 41.728 0 30.59 30.59 0 0 0 0-42.752L339.264 511.936l311.872-319.872a30.59 30.59 0 0 0 0-42.688 29.12 29.12 0 0 0-41.728 0"></path></svg></i>
          </button>
          <div class="current-page-box">{{ pageNo }}</div>
          <button class="pagination-arrow" :disabled="pageNo === totalPage" @click="pageNo++">
            <i class="el-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path fill="currentColor" d="M340.864 149.312a30.59 30.59 0 0 0 0 42.752L652.736 512 340.864 831.872a30.59 30.59 0 0 0 0 42.752 29.12 29.12 0 0 0 41.728 0L714.24 534.336a32 32 0 0 0 0-44.672L382.592 149.376a29.12 29.12 0 0 0-41.728 0z"></path></svg></i>
          </button>
          <button class="text-btn" :disabled="pageNo === totalPage" @click="pageNo = totalPage">尾页</button>
          <span class="jump-text">前往</span>
          <el-input v-model="jumpValue" class="jump-input" @keyup.enter="handleJump" />
          <span class="jump-text">页</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'

// 模拟数据
const tableData = [
  { id: 1, status: 1, name: '1号储能电池', sn: 'BAT-2023-001', ratedCapacity: 200, soc: 85, soh: 98, soe: 170, cycleCount: 1250, chargePower: 50, dischargePower: 0, batteryTemp: 32, maxVoltageDiff: 0.05, maxCellVoltage: 3.42, minCellVoltage: 3.37, bmsStatus: 1, station: '江西赣州光伏电站A区', updateTime: '2026-03-24 14:30:00' },
  { id: 2, status: 3, name: '2号储能电池', sn: 'BAT-2023-002', ratedCapacity: 200, soc: 12, soh: 82, soe: 24, cycleCount: 5850, chargePower: 0, dischargePower: 0, batteryTemp: 48, maxVoltageDiff: 0.15, maxCellVoltage: 3.68, minCellVoltage: 3.20, bmsStatus: 3, station: '江西赣州光伏电站A区', updateTime: '2026-03-24 14:29:30' },
  { id: 3, status: 8, name: '3号储能电池', sn: 'BAT-2023-003', ratedCapacity: 200, soc: 0, soh: 95, soe: 0, cycleCount: 890, chargePower: 0, dischargePower: 0, batteryTemp: 0, maxVoltageDiff: 0, maxCellVoltage: 0, minCellVoltage: 0, bmsStatus: 0, station: '江西赣州光伏电站B区', updateTime: '2026-03-24 09:20:15' }
]

// 激活状态
const activeStatus = ref('all')

const stats = computed(() => ({
  total: tableData.length,
  online: tableData.filter(i => i.status === 1).length,
  alarm: tableData.filter(i => [3,4,5,6].includes(i.status)).length,
  offline: tableData.filter(i => i.status === 8).length
}))

// 筛选条件
const filterForm = reactive({
  sn: '',
  modelNo: '',
  batteryType: '',
  warranty: ''
})
const snOptions = [
  { label: 'BAT-2023-001', value: 'BAT-2023-001' },
  { label: 'BAT-2023-002', value: 'BAT-2023-002' }
]

// 分段选择器
const setStatus = (val) => {
  activeStatus.value = val
  pageNo.value = 1
  nextTick(updateSlider)
}
const sliderStyle = ref({})
const itemMap = { all: 0, online: 1, alarm: 2, offline: 3 }
const updateSlider = () => {
  const items = document.querySelectorAll('.seg-device .segment-item')
  if (!items.length) return
  const rects = [...items].map(el => ({ w: el.offsetWidth, l: el.offsetLeft }))
  const rect = rects[itemMap[activeStatus.value] ?? 0]
  if (rect) sliderStyle.value = { width: `${rect.w}px`, transform: `translateX(${rect.l}px)` }
}

const handleSearch = () => { ElMessage.success('搜索完成') }
const handleReset = () => { filterForm.sn = ''; filterForm.modelNo = ''; filterForm.batteryType = ''; filterForm.warranty = ''; }

// 状态映射
const stateMap = {
  0: { text: '待机', color: '#86909C' },
  1: { text: '运行中', color: '#00B42A' },
  2: { text: '光照不足', color: '#C9CDD4' },
  3: { text: '故障', color: '#F53F3F' },
  4: { text: '降额运行', color: '#FF7D00' },
  5: { text: '电网异常', color: '#FFAA00' },
  6: { text: '保护触发', color: '#F53F3F' },
  7: { text: '关机', color: '#86909C' },
  8: { text: '离线', color: '#4E5969' }
}
const getStateInfo = (status) => stateMap[status] || stateMap[8]

const sohColor = (soh) => soh < 80 ? 'text-red' : soh < 90 ? 'text-orange' : ''
const tempColor = (temp) => !temp ? 'text-gray' : temp > 45 ? 'text-red' : temp > 40 ? 'text-orange' : ''
const voltageDiffColor = (diff) => !diff ? 'text-gray' : diff > 0.1 ? 'text-red' : diff > 0.08 ? 'text-orange' : ''
const cellVoltageColor = (voltage) => !voltage ? 'text-gray' : voltage > 3.65 || voltage < 2.8 ? 'text-red' : (voltage > 3.5 || voltage < 3.0) ? 'text-orange' : ''
const bmsTagType = (status) => ({ 0: 'danger', 1: 'success', 2: 'warning', 3: 'danger' })[status] || ''
const bmsText = (status) => ({ 0: '离线', 1: '在线', 2: '保护中', 3: '故障' })[status] || '未知'

const handleOperation = (command, row) => {
  if (command === 'troubleshoot') ElMessage.success('已进入故障排查流程')
  else ElMessage.info(`执行 ${command} 操作`)
}

// 过滤
const filteredData = computed(() => {
  let list = tableData
  if (activeStatus.value !== 'all') {
    if (activeStatus.value === 'online') list = list.filter(i => i.status === 1)
    else if (activeStatus.value === 'alarm') list = list.filter(i => [3,4,5,6].includes(i.status))
    else if (activeStatus.value === 'offline') list = list.filter(i => i.status === 8)
  }
  // 此处可添加其他筛选字段，暂时省略
  return list
})

const pageNo = ref(1)
const pageSize = ref(10)
const jumpValue = ref('')
const totalCount = computed(() => filteredData.value.length)
const totalPage = computed(() => Math.max(1, Math.ceil(totalCount.value / pageSize.value)))
const pagedData = computed(() => {
  const start = (pageNo.value - 1) * pageSize.value
  return filteredData.value.slice(start, start + pageSize.value)
})
const handleJump = () => {
  const p = +jumpValue.value
  if (p >= 1 && p <= totalPage.value) { pageNo.value = p; jumpValue.value = '' }
  else ElMessage.warning(`请输入 1~${totalPage.value} 之间的页码`)
}

const headerCellStyle = () => ({
  backgroundColor: '#F7F8FA', color: '#1D2129', fontSize: '14px', fontWeight: '400',
  height: '48px', borderBottom: '1px solid #E5E6EB'
})
const cellStyle = () => ({
  fontSize: '14px', color: '#1D2129', height: '52px', borderBottom: '1px solid #F2F3F5'
})
</script>

<style scoped>
.device-type-page {
  background-color: #F5F7FA;
  padding: 16px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.page-card {
  background-color: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 20px 24px;
}

/* 分段选择器 */
.segmented-row { margin-bottom: 20px; }
.custom-segmented { position: relative; display: flex; align-items: center; width: fit-content; background: #F8F9FA; border-radius: 8px; user-select: none; }
.selected-slider { position: absolute; top: 0; left: 0; height: 100%; background: #fff; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); transition: all .3s ease; z-index: 1; }
.segment-item { position: relative; z-index: 2; display: flex; align-items: center; color: #4E5969; cursor: pointer; white-space: nowrap; padding: 6px 12px; font-size: 13px; }
.segment-item .text { line-height: 1; margin-left: 4px; }
.dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

/* 内嵌搜索 */
.inline-filter { margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid #ebeef5; }
.filter-form { display: flex; align-items: center; flex-wrap: nowrap; gap: 8px; }
:deep(.el-form-item) { margin-bottom: 0; }
:deep(.el-form-item__label) { font-weight: 500; color: #4E5969; padding-right: 4px; }
.filter-input, .filter-select { flex: 1 1 100px; min-width: 80px; border-radius: 8px; }
.btn-search { background: #0066CC; color: #fff; border-radius: 8px; padding: 8px 20px; border: none; }
.btn-reset { background: #fff; color: #4E5969; border: 1px solid #E5E6EB; border-radius: 8px; padding: 8px 20px; }
.btn-search:hover { background: #0052A3; }
.btn-reset:hover { border-color: #0066CC; color: #0066CC; }

/* 表格和状态等保持原样式 */
.table-section { width: 100%; }
:deep(.el-table) { border-radius: 8px 8px 0 0; overflow: hidden; }
:deep(.el-table__row:hover) { background-color: #F5F7FA !important; }
.status-cell .status-dot { width: 6px; height: 6px; border-radius: 50%; margin-right: 6px; }
.status-text { font-size: 14px; }
.sn-link { color: #0066CC; text-decoration: none; font-size: 14px; }
.sn-link:hover { text-decoration: underline; }
.text-red { color: #F53F3F !important; font-weight: 500; }
.text-orange { color: #FF7D00 !important; font-weight: 500; }
.text-gray { color: #86909C !important; }
.operation-btn { background: #EEF7FF; color: #0066CC; padding: 6px 16px; border-radius: 8px; font-size: 14px; cursor: pointer; display: inline-flex; align-items: center; }
.operation-btn:hover { background: #0066CC; color: #fff; }

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