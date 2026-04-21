<template>
  <div class="comparison-container">
    <h2>电站列表列宽调整对比预览</h2>
    <p class="tip">数据均为模拟演示，地址已自动截取为省/市/区县</p>

    <!-- 版本一：紧凑型 -->
    <div class="demo-section">
      <h3>版本 A：紧凑型（极力压缩，无横向滚动）</h3>
      <el-table :data="tableData" border stripe size="small" style="width: 100%">
        <el-table-column prop="status" label="状态" align="center" width="70">
          <template #default="{ row }">
            <el-tag :type="row.statusType" size="small">{{ row.statusText }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="电站名称" align="left" min-width="140" show-overflow-tooltip />
        <el-table-column prop="shortAddress" label="电站地址" align="left" min-width="110" show-overflow-tooltip />
        <el-table-column prop="capacity" label="容量(kW)" align="center" width="90" />
        <el-table-column prop="gridTime" label="并网时间" align="center" width="100" />
        <el-table-column prop="inverterDisplay" label="逆变器在线/总数" align="center" width="120" />
        <el-table-column prop="currentPower" label="功率(kW)" align="center" width="90" />
        <el-table-column prop="dailyHours" label="日满发小时" align="center" width="90" />
        <el-table-column prop="todayPower" label="日发电量(kWh)" align="center" width="120" />
        <el-table-column prop="updateTime" label="更新时间" align="center" width="140" />
        <el-table-column prop="prValue" label="PR(%)" align="center" width="80" />
        <el-table-column prop="totalRadiation" label="辐照量" align="center" width="100" />
      </el-table>
    </div>

    <!-- 版本二：均衡型 -->
    <div class="demo-section">
      <h3>版本 B：均衡型（兼顾可读性与紧凑）</h3>
      <el-table :data="tableData" border stripe style="width: 100%">
        <el-table-column prop="status" label="状态" align="center" width="80">
          <template #default="{ row }">
            <el-tag :type="row.statusType">{{ row.statusText }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="电站名称" align="left" min-width="160" show-overflow-tooltip />
        <el-table-column prop="shortAddress" label="电站地址" align="left" min-width="130" show-overflow-tooltip />
        <el-table-column prop="capacity" label="组串总容量(kW)" align="center" width="130" />
        <el-table-column prop="gridTime" label="并网时间" align="center" width="110" />
        <el-table-column prop="inverterDisplay" label="逆变器在线数/总数" align="center" width="140" />
        <el-table-column prop="currentPower" label="当前功率(kW)" align="center" width="120" />
        <el-table-column prop="dailyHours" label="日满发小时数" align="center" width="110" />
        <el-table-column prop="todayPower" label="当日发电量(kWh)" align="center" width="140" />
        <el-table-column prop="updateTime" label="更新时间" align="center" width="160" />
        <el-table-column prop="prValue" label="系统效率PR(%)" align="center" width="120" />
        <el-table-column prop="totalRadiation" label="总辐照量(W/㎡)" align="center" width="130" />
      </el-table>
    </div>

    <!-- 版本三：极简型 -->
    <div class="demo-section">
      <h3>版本 C：极简型（进一步压缩次要字段）</h3>
      <el-table :data="tableData" border stripe size="small" style="width: 100%">
        <el-table-column prop="status" label="状态" align="center" width="65">
          <template #default="{ row }">
            <el-tag :type="row.statusType" size="small">{{ row.statusText }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="电站名称" align="left" min-width="130" show-overflow-tooltip />
        <el-table-column prop="shortAddress" label="地址" align="left" min-width="100" show-overflow-tooltip />
        <el-table-column prop="capacity" label="容量" align="center" width="80" />
        <el-table-column prop="gridTime" label="并网" align="center" width="90" />
        <el-table-column prop="inverterDisplay" label="逆变器" align="center" width="100" />
        <el-table-column prop="currentPower" label="功率" align="center" width="80" />
        <el-table-column prop="dailyHours" label="满发h" align="center" width="80" />
        <el-table-column prop="todayPower" label="日发电量" align="center" width="110" />
        <el-table-column prop="updateTime" label="更新时间" align="center" width="130" />
        <el-table-column prop="prValue" label="PR" align="center" width="70" />
        <el-table-column prop="totalRadiation" label="辐照量" align="center" width="90" />
      </el-table>
    </div>

    <!-- 版本四：自适应伸缩型（通过 min-width 自由分配空间） -->
    <div class="demo-section">
      <h3>版本 D：自适应伸缩型（各列按内容权重分配，无固定宽度）</h3>
      <el-table :data="tableData" border stripe style="width: 100%">
        <el-table-column prop="status" label="状态" align="center" min-width="70">
          <template #default="{ row }">
            <el-tag :type="row.statusType" size="small">{{ row.statusText }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="电站名称" align="left" min-width="150" show-overflow-tooltip />
        <el-table-column prop="shortAddress" label="电站地址" align="left" min-width="120" show-overflow-tooltip />
        <el-table-column prop="capacity" label="容量(kW)" align="center" min-width="90" />
        <el-table-column prop="gridTime" label="并网时间" align="center" min-width="100" />
        <el-table-column prop="inverterDisplay" label="逆变器在线/总数" align="center" min-width="130" />
        <el-table-column prop="currentPower" label="功率(kW)" align="center" min-width="90" />
        <el-table-column prop="dailyHours" label="日满发小时" align="center" min-width="100" />
        <el-table-column prop="todayPower" label="日发电量(kWh)" align="center" min-width="120" />
        <el-table-column prop="updateTime" label="更新时间" align="center" min-width="140" />
        <el-table-column prop="prValue" label="PR(%)" align="center" min-width="80" />
        <el-table-column prop="totalRadiation" label="辐照量" align="center" min-width="100" />
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 地址处理函数：提取省市区县（模拟真实数据格式）
const extractShortAddress = (fullAddr) => {
  // 简单正则匹配常见格式：XX省XX市XX区/县
  const match = fullAddr.match(/([\u4e00-\u9fa5]{2,}(?:省|自治区|特别行政区|市))?([\u4e00-\u9fa5]{2,}(?:市|自治州|盟))?([\u4e00-\u9fa5]{2,}(?:区|县|旗|市))?/)
  if (match) {
    const province = match[1] || ''
    const city = match[2] || ''
    const district = match[3] || ''
    let short = (province + city + district).replace(/(省|市|自治区|特别行政区|自治州|盟|区|县|旗|市)$/g, '')
    // 如果截取后为空，退回前6个字符
    return short || fullAddr.slice(0, 6)
  }
  return fullAddr.slice(0, 6)
}

// 模拟表格数据
const mockFullAddresses = [
  '广东省广州市天河区珠江新城华夏路10号',
  '浙江省杭州市西湖区文三路90号东部软件园',
  '江苏省苏州市工业园区星湖街328号创意产业园',
  '山东省济南市历城区工业北路21号',
  '四川省成都市武侯区天府大道中段500号',
]

const tableData = ref([])

const generateMockData = () => {
  const statuses = [
    { statusText: '正常', statusType: 'success' },
    { statusText: '故障', statusType: 'danger' },
    { statusText: '断连', statusType: 'info' },
  ]
  const names = ['阳光光伏电站', '蓝天清洁能源站', '绿能科技园区站', '智慧分布式电站', '滨海风力互补站']
  const data = []
  for (let i = 0; i < 5; i++) {
    const fullAddr = mockFullAddresses[i % mockFullAddresses.length]
    const shortAddr = extractShortAddress(fullAddr)
    const status = statuses[i % statuses.length]
    data.push({
      status: status.statusText,
      statusText: status.statusText,
      statusType: status.statusType,
      name: names[i] + (i+1),
      shortAddress: shortAddr,
      capacity: (500 + i*100).toFixed(0),
      gridTime: `202${i}-0${(i%4)+1}-${(i%28)+1}`.replace(/(\d{4})-(\d{1,2})-(\d{1,2})/, (_,y,m,d)=>`${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`),
      inverterDisplay: `${12+i}/${15+i}`,
      currentPower: (120 + i*20).toFixed(1),
      dailyHours: (3.5 + i*0.3).toFixed(1),
      todayPower: (3800 + i*300).toFixed(0),
      updateTime: `2026-04-17 ${10+i}:${(i*7)%60}`.replace(/:(\d)$/, ':0$1'),
      prValue: (92.5 - i*1.2).toFixed(1),
      totalRadiation: (5400 + i*100).toFixed(0),
    })
  }
  tableData.value = data
}

generateMockData()
</script>

<style scoped>
.comparison-container {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
}

h2 {
  color: #1d2129;
  margin-bottom: 8px;
}

.tip {
  color: #86909c;
  margin-bottom: 24px;
}

.demo-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 32px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

h3 {
  margin-top: 0;
  margin-bottom: 16px;
  color: #1d2129;
  font-weight: 600;
  border-left: 4px solid #165dff;
  padding-left: 12px;
}

/* 表格内文字适当缩小以配合压缩 */
:deep(.el-table) {
  font-size: 13px;
}

:deep(.el-table .cell) {
  padding: 0 6px;
}

/* 标签微调 */
:deep(.el-tag--small) {
  padding: 0 6px;
  height: 22px;
  line-height: 20px;
}
</style>