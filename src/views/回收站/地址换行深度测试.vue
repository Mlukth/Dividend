<template>
  <div class="dashboard-page">
    <!-- 完全复用 StationOverview 的卡片布局头部，保证样式容器一致 -->
    <div class="overview-cards">
      <div class="overview-card station-card">
        <div class="card-title">测试说明</div>
        <div class="card-content">
          <p>四个版本使用相同数据，地址均为“广东省惠州市博罗县罗阳街道...”，短地址“广东省惠州市博罗县”</p>
          <p>列宽均设置为 140px，仅 CSS 覆盖策略不同</p>
        </div>
      </div>
    </div>

    <!-- 版本 1：完全模拟原表格样式（不额外干预） -->
    <div class="station-list-module">
      <div class="list-header">
        <div class="module-title">❌ 版本1：原表格默认样式（预期截断）</div>
      </div>
      <el-table :data="tableData" border stripe class="station-table" size="small">
        <el-table-column prop="status" label="状态" align="center" width="80">
          <template #default="{ row }"><el-tag :type="row.statusType" size="small">{{ row.statusText }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="name" label="电站名称" align="center" min-width="150" show-overflow-tooltip />
        <el-table-column prop="shortAddress" label="电站地址" align="center" width="140">
          <template #default="{ row }">
            <div style="display: flex; flex-direction: column; align-items: center;">
              <span>{{ splitAddress(row.shortAddress).province }}</span>
              <span>{{ splitAddress(row.shortAddress).cityDistrict }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="capacity" label="容量(kW)" align="center" width="100" />
        <el-table-column prop="gridTime" label="并网时间" align="center" width="100" />
        <el-table-column prop="inverterDisplay" label="逆变器" align="center" width="100" />
      </el-table>
    </div>

    <!-- 版本 2：仅覆盖 .cell 样式（与之前修改一致） -->
    <div class="station-list-module">
      <div class="list-header">
        <div class="module-title">⚠️ 版本2：覆盖 .cell { white-space: normal !important }</div>
      </div>
      <el-table :data="tableData" border stripe class="station-table v2-table" size="small">
        <el-table-column prop="status" label="状态" align="center" width="80">
          <template #default="{ row }"><el-tag :type="row.statusType" size="small">{{ row.statusText }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="name" label="电站名称" align="center" min-width="150" show-overflow-tooltip />
        <el-table-column prop="shortAddress" label="电站地址" align="center" width="140">
          <template #default="{ row }">
            <div style="display: flex; flex-direction: column; align-items: center;">
              <span>{{ splitAddress(row.shortAddress).province }}</span>
              <span>{{ splitAddress(row.shortAddress).cityDistrict }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="capacity" label="容量(kW)" align="center" width="100" />
        <el-table-column prop="gridTime" label="并网时间" align="center" width="100" />
        <el-table-column prop="inverterDisplay" label="逆变器" align="center" width="100" />
      </el-table>
    </div>

    <!-- 版本 3：强制内部 span 换行 + 列宽 150px -->
    <div class="station-list-module">
      <div class="list-header">
        <div class="module-title">✅ 版本3：强制内部 span 换行 + 列宽 150px</div>
      </div>
      <el-table :data="tableData" border stripe class="station-table v3-table" size="small">
        <el-table-column prop="status" label="状态" align="center" width="80">
          <template #default="{ row }"><el-tag :type="row.statusType" size="small">{{ row.statusText }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="name" label="电站名称" align="center" min-width="150" show-overflow-tooltip />
        <el-table-column prop="shortAddress" label="电站地址" align="center" width="150">
          <template #default="{ row }">
            <div style="display: flex; flex-direction: column; align-items: center;">
              <span class="addr-line">{{ splitAddress(row.shortAddress).province }}</span>
              <span class="addr-line">{{ splitAddress(row.shortAddress).cityDistrict }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="capacity" label="容量(kW)" align="center" width="100" />
        <el-table-column prop="gridTime" label="并网时间" align="center" width="100" />
        <el-table-column prop="inverterDisplay" label="逆变器" align="center" width="100" />
      </el-table>
    </div>

    <!-- 版本 4：彻底覆盖 td/.cell/内部元素 + 列宽 150px -->
    <div class="station-list-module">
      <div class="list-header">
        <div class="module-title">🚀 版本4：覆盖 td + .cell + span，列宽 150px</div>
      </div>
      <el-table :data="tableData" border stripe class="station-table v4-table" size="small">
        <el-table-column prop="status" label="状态" align="center" width="80">
          <template #default="{ row }"><el-tag :type="row.statusType" size="small">{{ row.statusText }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="name" label="电站名称" align="center" min-width="150" show-overflow-tooltip />
        <el-table-column prop="shortAddress" label="电站地址" align="center" width="150">
          <template #default="{ row }">
            <div style="display: flex; flex-direction: column; align-items: center;">
              <span>{{ splitAddress(row.shortAddress).province }}</span>
              <span>{{ splitAddress(row.shortAddress).cityDistrict }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="capacity" label="容量(kW)" align="center" width="100" />
        <el-table-column prop="gridTime" label="并网时间" align="center" width="100" />
        <el-table-column prop="inverterDisplay" label="逆变器" align="center" width="100" />
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const mockAddresses = [
  '广东省惠州市博罗县罗阳街道商业东街123号',
  '广东省惠州市博罗县石湾镇科技产业园8号',
  '广东省惠州市博罗县园洲镇工业大道56号',
]

const tableData = ref([])

const extractShortAddress = (fullAddr) => {
  if (!fullAddr) return ''
  const regex = /([\u4e00-\u9fa5]{2,}?(?:省|自治区|特别行政区))?([\u4e00-\u9fa5]{2,}?(?:市|自治州|盟))?([\u4e00-\u9fa5]{2,}?(?:县|区|旗|市))?/
  const match = fullAddr.match(regex)
  if (match) {
    return (match[1] || '') + (match[2] || '') + (match[3] || '')
  }
  return fullAddr.slice(0, 6)
}

const splitAddress = (shortAddr) => {
  if (!shortAddr) return { province: '', cityDistrict: '' }
  const provinceMatch = shortAddr.match(/^([\u4e00-\u9fa5]{2,}?(?:省|自治区|特别行政区))/)
  if (provinceMatch) {
    const province = provinceMatch[1]
    const cityDistrict = shortAddr.slice(province.length)
    return { province, cityDistrict }
  }
  return { province: shortAddr.slice(0, 2), cityDistrict: shortAddr.slice(2) }
}

const generate = () => {
  const statuses = [
    { statusText: '正常', statusType: 'success' },
    { statusText: '故障', statusType: 'danger' },
    { statusText: '断连', statusType: 'info' }
  ]
  const names = ['阳光光伏电站', '蓝天清洁能源站', '绿能科技园区站']
  const arr = []
  for (let i = 0; i < 3; i++) {
    const full = mockAddresses[i]
    const short = extractShortAddress(full)
    const status = statuses[i % 3]
    arr.push({
      name: names[i] + (i+1),
      shortAddress: short,
      capacity: (500 + i*100).toFixed(0),
      gridTime: `2023-0${i+1}-01`,
      inverterDisplay: `${12+i}/${15+i}`,
      status: status.statusText,
      statusText: status.statusText,
      statusType: status.statusType,
    })
  }
  tableData.value = arr
}
generate()
</script>

<style scoped>
/* 完全复用 StationOverview 的样式结构，确保容器一致 */
.dashboard-page {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
  box-sizing: border-box;
}
.overview-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
.overview-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  padding: 20px 24px;
}
.card-title {
  font-size: 17px;
  font-weight: 700;
  color: #1D2129;
  margin-bottom: 16px;
}
.station-list-module {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  padding: 16px 24px;
  margin-bottom: 20px;
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
.station-table {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  font-size: 13px;
}

/* 版本2样式：模拟之前修改 */
.v2-table :deep(.cell) {
  white-space: normal !important;
  overflow: visible !important;
  text-overflow: unset !important;
}

/* 版本3样式：强制内部 span 换行 */
.addr-line {
  display: block;
  white-space: normal !important;
  overflow: visible !important;
  text-overflow: unset !important;
  word-break: break-word;
  line-height: 1.4;
}

/* 版本4样式：彻底覆盖 */
.v4-table :deep(td) {
  overflow: visible !important;
}
.v4-table :deep(.cell) {
  white-space: normal !important;
  overflow: visible !important;
  text-overflow: unset !important;
}
.v4-table span {
  white-space: normal !important;
  overflow: visible !important;
}
</style>