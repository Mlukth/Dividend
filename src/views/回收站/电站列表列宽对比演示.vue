<template>
  <div class="dashboard-page">
    <!-- 第一部分：上半区 三大概览卡片并排（继承原风格） -->
    <div class="overview-cards">
      <!-- 1. 电站概览卡片 -->
      <div class="overview-card station-card">
        <div class="card-title">电站概览</div>
        <div class="card-content">
          <div class="stat-item" v-for="(item, index) in stationOverviewData" :key="`station-${index}`">
            <span class="stat-label">{{ item.label }}</span>
            <span class="stat-value">{{ item.value }}</span>
          </div>
        </div>
      </div>

      <!-- 2. 电量概览卡片 -->
      <div class="overview-card power-card">
        <div class="card-title">电量概览</div>
        <div class="card-content">
          <div class="stat-item" v-for="(item, index) in powerOverviewData" :key="`power-${index}`">
            <span class="stat-label">{{ item.label }}</span>
            <span class="stat-value">{{ item.value }}</span>
          </div>
        </div>
      </div>

      <!-- 3. AI预警概览卡片 -->
      <div class="overview-card warning-card">
        <div class="card-title">AI预警概览</div>
        <div class="card-content">
          <div class="warning-item" v-for="(item, index) in warningOverviewData" :key="`warning-${index}`">
            <span class="warning-label">{{ item.label }}</span>
            <span class="warning-value">{{ item.value }}</span>
            <span class="link-btn">点击进入</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 第二部分：搜索筛选模块（保留原样式，不可交互） -->
    <div class="filter-module">
      <el-form :model="{}" inline class="filter-form">
        <el-form-item label="电站名称">
          <el-input placeholder="请输入电站名称" class="filter-input" disabled />
        </el-form-item>
        <el-form-item label="电站地址">
          <el-input placeholder="请输入电站地址" class="filter-input" disabled />
        </el-form-item>
        <el-form-item label="电站类型">
          <el-select placeholder="请选择电站类型" class="filter-select" disabled />
        </el-form-item>
        <el-form-item label="并网时间">
          <el-date-picker type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" class="filter-date" disabled />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="btn-search" disabled>搜索</el-button>
          <el-button class="btn-reset" disabled>重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 第三部分：三个并排的电站列表卡片（列宽对比） -->
    <div class="comparison-row">
      <!-- 方案 A：紧凑型 -->
      <div class="station-list-module comparison-card">
        <div class="list-header">
          <div class="module-title">📋 方案 A · 紧凑型</div>
          <el-radio-group v-model="activeStatus" size="small" disabled>
            <el-radio-button label="all">全部</el-radio-button>
            <el-radio-button label="normal">正常</el-radio-button>
            <el-radio-button label="fault">故障</el-radio-button>
            <el-radio-button label="offline">断连</el-radio-button>
          </el-radio-group>
        </div>
        <el-table :data="tableData" border stripe size="small" class="station-table">
          <el-table-column prop="status" label="状态" align="center" width="70">
            <template #default="{ row }">
              <el-tag :type="row.statusType" size="small">{{ row.statusText }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="电站名称" align="left" min-width="120" show-overflow-tooltip />
          <el-table-column prop="shortAddress" label="电站地址" align="left" min-width="100" show-overflow-tooltip />
          <el-table-column prop="capacity" label="容量(kW)" align="center" width="80" />
          <el-table-column prop="gridTime" label="并网时间" align="center" width="90" />
          <el-table-column prop="inverterDisplay" label="逆变器在线/总数" align="center" width="110" />
          <el-table-column prop="currentPower" label="功率(kW)" align="center" width="80" />
          <el-table-column prop="dailyHours" label="日满发h" align="center" width="80" />
          <el-table-column prop="todayPower" label="日发电量(kWh)" align="center" width="110" />
          <el-table-column prop="updateTime" label="更新时间" align="center" width="130" />
          <el-table-column prop="prValue" label="PR(%)" align="center" width="70" />
          <el-table-column prop="totalRadiation" label="辐照量" align="center" width="90" />
        </el-table>
        <div class="table-footer-note">✅ 状态列 70px · 地址列 100px · 逆变器列 110px</div>
      </div>

      <!-- 方案 B：均衡型 -->
      <div class="station-list-module comparison-card">
        <div class="list-header">
          <div class="module-title">📋 方案 B · 均衡型</div>
          <el-radio-group v-model="activeStatus" size="small" disabled>
            <el-radio-button label="all">全部</el-radio-button>
            <el-radio-button label="normal">正常</el-radio-button>
            <el-radio-button label="fault">故障</el-radio-button>
            <el-radio-button label="offline">断连</el-radio-button>
          </el-radio-group>
        </div>
        <el-table :data="tableData" border stripe class="station-table">
          <el-table-column prop="status" label="状态" align="center" width="80">
            <template #default="{ row }">
              <el-tag :type="row.statusType">{{ row.statusText }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="电站名称" align="left" min-width="140" show-overflow-tooltip />
          <el-table-column prop="shortAddress" label="电站地址" align="left" min-width="120" show-overflow-tooltip />
          <el-table-column prop="capacity" label="组串总容量(kW)" align="center" width="120" />
          <el-table-column prop="gridTime" label="并网时间" align="center" width="100" />
          <el-table-column prop="inverterDisplay" label="逆变器在线数/总数" align="center" width="130" />
          <el-table-column prop="currentPower" label="当前功率(kW)" align="center" width="110" />
          <el-table-column prop="dailyHours" label="日满发小时数" align="center" width="110" />
          <el-table-column prop="todayPower" label="当日发电量(kWh)" align="center" width="130" />
          <el-table-column prop="updateTime" label="更新时间" align="center" width="140" />
          <el-table-column prop="prValue" label="系统效率PR(%)" align="center" width="110" />
          <el-table-column prop="totalRadiation" label="总辐照量(W/㎡)" align="center" width="120" />
        </el-table>
        <div class="table-footer-note">✅ 状态列 80px · 地址列 120px · 逆变器列 130px</div>
      </div>

      <!-- 方案 C：极简型 -->
      <div class="station-list-module comparison-card">
        <div class="list-header">
          <div class="module-title">📋 方案 C · 极简型</div>
          <el-radio-group v-model="activeStatus" size="small" disabled>
            <el-radio-button label="all">全部</el-radio-button>
            <el-radio-button label="normal">正常</el-radio-button>
            <el-radio-button label="fault">故障</el-radio-button>
            <el-radio-button label="offline">断连</el-radio-button>
          </el-radio-group>
        </div>
        <el-table :data="tableData" border stripe size="small" class="station-table">
          <el-table-column prop="status" label="状态" align="center" width="65">
            <template #default="{ row }">
              <el-tag :type="row.statusType" size="small">{{ row.statusText }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="电站名称" align="left" min-width="110" show-overflow-tooltip />
          <el-table-column prop="shortAddress" label="地址" align="left" min-width="90" show-overflow-tooltip />
          <el-table-column prop="capacity" label="容量" align="center" width="70" />
          <el-table-column prop="gridTime" label="并网" align="center" width="80" />
          <el-table-column prop="inverterDisplay" label="逆变器" align="center" width="95" />
          <el-table-column prop="currentPower" label="功率" align="center" width="70" />
          <el-table-column prop="dailyHours" label="满发h" align="center" width="70" />
          <el-table-column prop="todayPower" label="日发电量" align="center" width="100" />
          <el-table-column prop="updateTime" label="更新时间" align="center" width="120" />
          <el-table-column prop="prValue" label="PR" align="center" width="65" />
          <el-table-column prop="totalRadiation" label="辐照量" align="center" width="85" />
        </el-table>
        <div class="table-footer-note">✅ 状态列 65px · 地址列 90px · 逆变器列 95px</div>
      </div>
    </div>
    <p class="global-note">✨ 上方卡片、筛选栏完全继承原页面风格。三个表格均采用地址省市区县截取，有效避免横向滚动。</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 静态概览数据（仅作展示）
const stationOverviewData = ref([
  { label: '电站总数', value: '24座' },
  { label: '运行中', value: '20座' },
  { label: '故障/断连', value: '4座' },
  { label: '总装机容量', value: '48.6 MWp' }
])

const powerOverviewData = ref([
  { label: '今日发电量', value: '142.8 MWh' },
  { label: '本月累计', value: '3,842 MWh' },
  { label: '年度累计', value: '18,336 MWh' },
  { label: '累计发电量', value: '127.5 GWh' }
])

const warningOverviewData = ref([
  { label: '发电健康预警', value: '3条' },
  { label: '低效电站', value: '2座' },
  { label: '设备异常', value: '5台' },
  { label: '待处理告警', value: '8个' }
])

// 状态筛选项（不可交互）
const activeStatus = ref('all')

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

// 生成模拟数据
const mockAddresses = [
  '广东省广州市天河区珠江新城华夏路10号',
  '浙江省杭州市西湖区文三路90号东部软件园',
  '江苏省苏州市工业园区星湖街328号创意产业园',
  '山东省济南市历城区工业北路21号',
  '四川省成都市武侯区天府大道中段500号'
]

const tableData = ref([])
const generateTableData = () => {
  const statuses = [
    { statusText: '正常', statusType: 'success' },
    { statusText: '故障', statusType: 'danger' },
    { statusText: '断连', statusType: 'info' }
  ]
  const names = ['阳光光伏电站', '蓝天清洁能源站', '绿能科技园区站', '智慧分布式电站', '滨海风力互补站']
  const result = []
  for (let i = 0; i < 5; i++) {
    const full = mockAddresses[i]
    const short = extractShortAddress(full)
    const status = statuses[i % 3]
    result.push({
      status: status.statusText,
      statusText: status.statusText,
      statusType: status.statusType,
      name: names[i] + (i+1),
      shortAddress: short,
      capacity: (500 + i*100).toFixed(0),
      gridTime: `202${i}-0${(i%4)+1}-${(i%28)+1}`.replace(/(\d{4})-(\d{1,2})-(\d{1,2})/, (_,y,m,d)=>`${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`),
      inverterDisplay: `${12+i}/${15+i}`,
      currentPower: (120 + i*20).toFixed(1),
      dailyHours: (3.5 + i*0.3).toFixed(1),
      todayPower: (3800 + i*300).toFixed(0),
      updateTime: `2026-04-17 ${10+i}:${(i*7)%60}`.replace(/:(\d)$/, ':0$1'),
      prValue: (92.5 - i*1.2).toFixed(1),
      totalRadiation: (5400 + i*100).toFixed(0)
    })
  }
  tableData.value = result
}
generateTableData()
</script>

<style scoped>
/* 完全继承原 StationOverview.vue 的样式，并增加对比布局适配 */
.dashboard-page {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
  box-sizing: border-box;
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  width: 100%;
}

.overview-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  padding: 20px 24px;
  transition: all 0.2s ease;
}

.overview-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 20px rgba(0,82,217,0.12);
}

.card-title {
  font-size: 17px;
  font-weight: 700;
  color: #1D2129;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #F0F0F0;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.stat-label {
  font-size: 14px;
  color: #4E5969;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #1D2129;
  background: linear-gradient(90deg, #0052D9, #165DFF);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.warning-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px dashed #F0F0F0;
}

.warning-item:last-child {
  border-bottom: none;
}

.warning-label {
  font-size: 14px;
  color: #4E5969;
  flex: 2;
}

.warning-value {
  font-size: 16px;
  font-weight: 700;
  color: #F53F3F;
  flex: 1;
  text-align: center;
}

.link-btn {
  font-size: 13px;
  color: #165DFF;
  cursor: default;
  transition: all 0.2s;
  flex: 1;
  text-align: right;
}

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
  flex-wrap: wrap;
  gap: 16px;
}

:deep(.el-form-item) {
  margin-bottom: 0;
  display: flex;
  align-items: center;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #4E5969;
  padding-right: 8px;
}

.filter-input, .filter-select, .filter-date {
  width: 180px;
  border-radius: 8px;
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

/* 三个列表卡片并排布局 */
.comparison-row {
  display: flex;
  gap: 20px;
  width: 100%;
}

.comparison-card {
  flex: 1;
  min-width: 0; /* 防止flex溢出 */
}

.station-list-module {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  padding: 16px 16px;
  width: 100%;
  box-sizing: border-box;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.module-title {
  font-size: 15px;
  font-weight: 700;
  color: #1D2129;
}

:deep(.el-radio-button__inner) {
  border-radius: 6px;
  padding: 5px 10px;
}

:deep(.el-radio-button__orig-radio:checked+.el-radio-button__inner) {
  background: linear-gradient(90deg, #0052D9, #165DFF);
  border-color: #165DFF;
  box-shadow: none;
}

.station-table {
  width: 100%;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 12px;
}

:deep(.station-table .el-table__header) {
  background: #F5F7FA;
}

:deep(.station-table .el-table__header th) {
  font-weight: 700;
  color: #1D2129;
  padding: 8px 0;
}

:deep(.station-table .el-table__row:hover>td) {
  background-color: #F0F7FF !important;
}

:deep(.station-table .cell) {
  padding: 0 4px;
  white-space: nowrap;
}

.table-footer-note {
  margin-top: 10px;
  font-size: 12px;
  color: #86909c;
  text-align: right;
}

.global-note {
  margin-top: 8px;
  color: #00a870;
  font-weight: 500;
  text-align: center;
}

/* 响应式：小屏幕时卡片竖向排列 */
@media screen and (max-width: 1400px) {
  .comparison-row {
    flex-direction: column;
  }
  .overview-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  .warning-card {
    grid-column: 1 / 3;
  }
}

@media screen and (max-width: 768px) {
  .overview-cards {
    grid-template-columns: 1fr;
  }
  .warning-card {
    grid-column: 1 / 2;
  }
}
</style>