<template>
  <div class="station-list-demo">
    <h2 class="page-title">电站列表列宽调整预览（竖向排列）</h2>

    <!-- 版本一：紧凑型 -->
    <div class="station-list-module">
      <div class="list-header">
        <div class="module-title">
          <span class="version-badge">版本 A</span> 紧凑型 — 状态 70px · 地址 100px · 逆变器 110px
        </div>
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
        <el-table-column prop="name" label="电站名称" align="left" min-width="140" show-overflow-tooltip />
        <el-table-column prop="shortAddress" label="电站地址" align="left" min-width="100" show-overflow-tooltip />
        <el-table-column prop="capacity" label="容量(kW)" align="center" width="90" />
        <el-table-column prop="gridTime" label="并网时间" align="center" width="100" />
        <el-table-column prop="inverterDisplay" label="逆变器在线/总数" align="center" width="110" />
        <el-table-column prop="currentPower" label="功率(kW)" align="center" width="90" />
        <el-table-column prop="dailyHours" label="日满发h" align="center" width="90" />
        <el-table-column prop="todayPower" label="日发电量(kWh)" align="center" width="120" />
        <el-table-column prop="updateTime" label="更新时间" align="100" width="140" />
        <el-table-column prop="prValue" label="PR(%)" align="center" width="80" />
        <el-table-column prop="totalRadiation" label="辐照量" align="center" width="100" />
      </el-table>
      <div class="scroll-test">👉 此版本总宽度约 1130px，在 1280px 屏幕下无横向滚动条</div>
    </div>

    <!-- 版本二：均衡型 -->
    <div class="station-list-module">
      <div class="list-header">
        <div class="module-title">
          <span class="version-badge">版本 B</span> 均衡型 — 状态 80px · 地址 120px · 逆变器 130px
        </div>
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
        <el-table-column prop="name" label="电站名称" align="left" min-width="160" show-overflow-tooltip />
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
      <div class="scroll-test">👉 此版本总宽度约 1350px，在 1440px 及以上屏幕显示完美</div>
    </div>

    <!-- 版本三：极简型（进一步压缩） -->
    <div class="station-list-module">
      <div class="list-header">
        <div class="module-title">
          <span class="version-badge">版本 C</span> 极简型 — 状态 65px · 地址 90px · 逆变器 95px
        </div>
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
        <el-table-column prop="name" label="电站名称" align="left" min-width="130" show-overflow-tooltip />
        <el-table-column prop="shortAddress" label="地址" align="left" min-width="90" show-overflow-tooltip />
        <el-table-column prop="capacity" label="容量" align="center" width="80" />
        <el-table-column prop="gridTime" label="并网" align="center" width="90" />
        <el-table-column prop="inverterDisplay" label="逆变器" align="center" width="95" />
        <el-table-column prop="currentPower" label="功率" align="center" width="80" />
        <el-table-column prop="dailyHours" label="满发h" align="center" width="80" />
        <el-table-column prop="todayPower" label="日发电量" align="center" width="110" />
        <el-table-column prop="updateTime" label="更新时间" align="center" width="130" />
        <el-table-column prop="prValue" label="PR" align="center" width="70" />
        <el-table-column prop="totalRadiation" label="辐照量" align="center" width="90" />
      </el-table>
      <div class="scroll-test">👉 此版本总宽度约 1020px，极窄屏幕也可完整显示</div>
    </div>

    <!-- 版本四：自适应伸缩型（无固定宽度） -->
    <div class="station-list-module">
      <div class="list-header">
        <div class="module-title">
          <span class="version-badge">版本 D</span> 自适应伸缩型 — 全部使用 min-width，浏览器自动分配
        </div>
        <el-radio-group v-model="activeStatus" size="small" disabled>
          <el-radio-button label="all">全部</el-radio-button>
          <el-radio-button label="normal">正常</el-radio-button>
          <el-radio-button label="fault">故障</el-radio-button>
          <el-radio-button label="offline">断连</el-radio-button>
        </el-radio-group>
      </div>
      <el-table :data="tableData" border stripe class="station-table">
        <el-table-column prop="status" label="状态" align="center" min-width="70">
          <template #default="{ row }">
            <el-tag :type="row.statusType" size="small">{{ row.statusText }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="电站名称" align="left" min-width="150" show-overflow-tooltip />
        <el-table-column prop="shortAddress" label="电站地址" align="left" min-width="110" show-overflow-tooltip />
        <el-table-column prop="capacity" label="容量(kW)" align="center" min-width="90" />
        <el-table-column prop="gridTime" label="并网时间" align="center" min-width="100" />
        <el-table-column prop="inverterDisplay" label="逆变器在线/总数" align="center" min-width="120" />
        <el-table-column prop="currentPower" label="功率(kW)" align="center" min-width="90" />
        <el-table-column prop="dailyHours" label="日满发小时" align="center" min-width="100" />
        <el-table-column prop="todayPower" label="日发电量(kWh)" align="center" min-width="120" />
        <el-table-column prop="updateTime" label="更新时间" align="center" min-width="140" />
        <el-table-column prop="prValue" label="PR(%)" align="center" min-width="80" />
        <el-table-column prop="totalRadiation" label="辐照量" align="center" min-width="100" />
      </el-table>
      <div class="scroll-test">👉 使用 min-width，容器宽度变化时列宽自动调整，推荐用于响应式布局</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 状态筛选项（不可交互，仅作样式展示）
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

// 模拟地址库
const mockAddresses = [
  '广东省广州市天河区珠江新城华夏路10号',
  '浙江省杭州市西湖区文三路90号东部软件园',
  '江苏省苏州市工业园区星湖街328号创意产业园',
  '山东省济南市历城区工业北路21号',
  '四川省成都市武侯区天府大道中段500号'
]

// 模拟表格数据
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
/* 整体继承原卡片式设计风格 */
.station-list-demo {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
  box-sizing: border-box;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #1d2129;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e5e6eb;
}

/* 电站列表卡片模块 */
.station-list-module {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  padding: 16px 24px;
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 30px;
  transition: box-shadow 0.2s;
}

.station-list-module:hover {
  box-shadow: 0 4px 20px rgba(0,82,217,0.08);
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
  display: flex;
  align-items: center;
  gap: 10px;
}

.version-badge {
  display: inline-block;
  background: linear-gradient(90deg, #0052D9, #165DFF);
  color: white;
  font-size: 13px;
  font-weight: 600;
  padding: 2px 12px;
  border-radius: 20px;
  letter-spacing: 0.5px;
}

/* 单选按钮组样式（仅作展示，不可交互） */
:deep(.el-radio-button__inner) {
  border-radius: 6px;
  padding: 5px 10px;
  background: #f2f3f5;
  border-color: #e5e6eb;
  color: #4e5969;
}

:deep(.el-radio-button__orig-radio:checked+.el-radio-button__inner) {
  background: linear-gradient(90deg, #0052D9, #165DFF);
  border-color: #165DFF;
  box-shadow: none;
  color: white;
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

:deep(.station-table .el-table__row:hover>td) {
  background-color: #F0F7FF !important;
}

:deep(.station-table .cell) {
  padding: 0 6px;
  white-space: nowrap;
}

/* 提示文字 */
.scroll-test {
  margin-top: 12px;
  font-size: 12px;
  color: #86909c;
  text-align: right;
  border-top: 1px dashed #e5e6eb;
  padding-top: 10px;
}

/* 响应式 */
@media screen and (max-width: 768px) {
  .station-list-demo {
    padding: 16px;
  }
  .list-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>