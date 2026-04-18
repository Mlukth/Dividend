<template>
  <div class="station-list-card-demo">
    <!-- 电站列表卡片模块（完全继承 StationOverview 的卡片风格） -->
    <div class="station-list-module">
      <div class="list-header">
        <div class="module-title">电站列表</div>
        <el-radio-group v-model="activeStatus" size="small" @change="handleStatusFilter">
          <el-radio-button label="all">全部</el-radio-button>
          <el-radio-button label="normal">正常</el-radio-button>
          <el-radio-button label="fault">故障</el-radio-button>
          <el-radio-button label="offline">断连</el-radio-button>
        </el-radio-group>
      </div>

      <!-- 均衡型列宽配置：状态 80px · 地址 120px · 逆变器 130px -->
      <el-table :data="filteredTableData" border stripe class="station-table">
        <el-table-column prop="status" label="状态" align="center" width="80">
          <template #default="{ row }">
            <el-tag :type="row.statusType">{{ row.statusText }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="电站名称" align="left" min-width="160" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="station-name-link" @click="handleStationClick(row)">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="shortAddress" label="电站地址" align="left" min-width="120" show-overflow-tooltip />
        <el-table-column prop="capacity" label="组串总容量(kW)" align="center" width="130" />
        <el-table-column prop="gridTime" label="并网时间" align="center" width="110" />
        <el-table-column prop="inverterDisplay" label="逆变器在线数/总数" align="center" width="130" />
        <el-table-column prop="currentPower" label="当前功率(kW)" align="center" width="120" />
        <el-table-column prop="dailyHours" label="日满发小时数" align="center" width="120" />
        <el-table-column prop="todayPower" label="当日发电量(kWh)" align="center" width="140" />
        <el-table-column prop="updateTime" label="更新时间" align="center" width="150" />
        <el-table-column prop="prValue" label="系统效率PR(%)" align="center" width="120" />
        <el-table-column prop="totalRadiation" label="总辐照量(W/㎡)" align="center" width="130" />
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.currentPage"
        :page-size="pagination.pageSize"
        layout="total, pager, jumper"
        :total="pagination.total"
        @current-change="handlePageChange"
        class="table-pagination"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 状态筛选项
const activeStatus = ref('all')

// 分页
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 原始数据
const originData = ref([])

// 地址截取函数：提取省市区县
const extractShortAddress = (fullAddr) => {
  const match = fullAddr.match(/([\u4e00-\u9fa5]{2,}(?:省|自治区|特别行政区|市))?([\u4e00-\u9fa5]{2,}(?:市|自治州|盟))?([\u4e00-\u9fa5]{2,}(?:区|县|旗|市))?/)
  if (match) {
    const province = match[1] || ''
    const city = match[2] || ''
    const district = match[3] || ''
    let short = (province + city + district).replace(/(省|市|自治区|特别行政区|自治州|盟|区|县|旗|市)$/g, '')
    return short || fullAddr.slice(0, 6)
  }
  return fullAddr.slice(0, 6)
}

// 模拟生成表格数据（完全参照真实接口字段）
const generateMockData = () => {
  const statuses = [
    { statusText: '正常', statusType: 'success' },
    { statusText: '故障', statusType: 'danger' },
    { statusText: '断连', statusType: 'info' }
  ]
  const names = [
    '阳光光伏电站一期', 
    '蓝天清洁能源站', 
    '绿能科技园区站', 
    '智慧分布式电站A区', 
    '滨海风力互补站',
    '云顶山地电站',
    '工业园区屋顶光伏',
    '农业大棚互补电站',
    '城市公交充电站光伏',
    '高速公路边坡电站'
  ]
  const addresses = [
    '广东省广州市天河区珠江新城华夏路10号',
    '浙江省杭州市西湖区文三路90号东部软件园',
    '江苏省苏州市工业园区星湖街328号创意产业园',
    '山东省济南市历城区工业北路21号',
    '四川省成都市武侯区天府大道中段500号',
    '福建省厦门市思明区软件园二期望海路39号',
    '上海市浦东新区张江高科技园区科苑路88号',
    '北京市海淀区中关村软件园二期10号楼',
    '安徽省合肥市高新区创新大道288号',
    '湖北省武汉市东湖高新区光谷大道77号'
  ]
  
  const result = []
  for (let i = 0; i < 12; i++) {
    const full = addresses[i % addresses.length]
    const short = extractShortAddress(full)
    const status = statuses[i % 3]
    const capacity = (500 + i * 100).toFixed(0)
    const online = 12 + (i % 5)
    const total = 15 + (i % 3)
    
    result.push({
      id: `station_${i + 1}`,
      name: names[i % names.length] + (i < 5 ? '' : ` ${Math.floor(i/5)+1}`),
      shortAddress: short,
      fullAddress: full,
      capacity: capacity,
      gridTime: `202${i % 4}-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
      inverterDisplay: `${online}/${total}`,
      currentPower: (120 + i * 15).toFixed(1),
      dailyHours: (3.2 + i * 0.25).toFixed(2),
      todayPower: (3800 + i * 280).toFixed(0),
      updateTime: `2026-04-17 ${10 + (i % 12)}:${String((i * 7) % 60).padStart(2, '0')}`,
      prValue: (92.5 - i * 0.8).toFixed(1),
      totalRadiation: (5400 + i * 80).toFixed(0),
      status: status.statusText,
      statusText: status.statusText,
      statusType: status.statusType
    })
  }
  originData.value = result
  pagination.value.total = result.length
}

// 筛选后的数据
const filteredTableData = computed(() => {
  let data = [...originData.value]
  
  // 按状态筛选
  if (activeStatus.value !== 'all') {
    data = data.filter(item => item.status === activeStatus.value)
  }
  
  pagination.value.total = data.length
  
  // 分页切割
  const start = (pagination.value.currentPage - 1) * pagination.value.pageSize
  const end = start + pagination.value.pageSize
  return data.slice(start, end)
})

// 状态筛选处理
const handleStatusFilter = () => {
  pagination.value.currentPage = 1
}

// 分页切换
const handlePageChange = (page) => {
  pagination.value.currentPage = page
}

// 点击电站名称（模拟跳转）
const handleStationClick = (row) => {
  ElMessage.info(`点击了电站：${row.name}（ID: ${row.id}）`)
  // 实际项目中可跳转：router.push(`/station-info/${row.id}`)
}

onMounted(() => {
  generateMockData()
})
</script>

<style scoped>
/* 完全继承原 StationOverview.vue 的卡片与表格样式 */
.station-list-card-demo {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
  box-sizing: border-box;
}

.station-list-module {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 16px 24px;
  width: 100%;
  box-sizing: border-box;
  transition: box-shadow 0.2s;
}

.station-list-module:hover {
  box-shadow: 0 4px 20px rgba(0, 82, 217, 0.08);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.module-title {
  font-size: 16px;
  font-weight: 700;
  color: #1D2129;
}

/* 单选按钮组样式 */
:deep(.el-radio-button__inner) {
  border-radius: 6px;
  padding: 8px 16px;
}

:deep(.el-radio-button__orig-radio:checked + .el-radio-button__inner) {
  background: linear-gradient(90deg, #0052D9, #165DFF);
  border-color: #165DFF;
  box-shadow: none;
}

/* 表格样式 */
.station-table {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  font-size: 13px;
}

:deep(.station-table .el-table__header) {
  background: #F5F7FA;
}

:deep(.station-table .el-table__header th) {
  font-weight: 700;
  color: #1D2129;
  padding: 10px 0;
}

:deep(.station-table .el-table__row:hover > td) {
  background-color: #F0F7FF !important;
}

:deep(.station-table .cell) {
  padding: 0 6px;
  white-space: nowrap;
}

/* 电站名称链接样式 */
.station-name-link {
  color: #165DFF;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.station-name-link:hover {
  color: #0052D9;
  text-decoration: underline;
}

/* 分页样式 */
.table-pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-pagination .el-pager li) {
  border-radius: 6px;
}

:deep(.el-pager li.is-active) {
  background: linear-gradient(90deg, #0052D9, #165DFF);
  color: #fff;
}

/* 响应式 */
@media screen and (max-width: 768px) {
  .station-list-card-demo {
    padding: 16px;
  }
  .list-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>