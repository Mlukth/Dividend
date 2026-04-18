<template>
  <div class="test-dashboard">
    <h2>🔬 电站列表地址换行测试（数据固定为“广东省惠州市博罗县”）</h2>
    <p class="tip">四个版本使用相同数据，仅列宽和 CSS 覆盖策略不同，用于对比找出截断原因</p>

    <!-- 版本 1：原版模拟（不加任何额外修复） -->
    <div class="station-list-module">
      <div class="list-header">
        <div class="module-title">❌ 版本 1：原版模拟（无强制换行，140px 列宽）</div>
      </div>
      <el-table :data="tableData" border stripe class="station-table" size="small">
        <el-table-column prop="status" label="状态" align="center" width="80">
          <template #default="{ row }"><el-tag :type="row.statusType" size="small">{{ row.statusText }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="name" label="电站名称" align="center" min-width="140" show-overflow-tooltip />
        <el-table-column prop="shortAddress" label="电站地址" align="center" width="140">
          <template #default="{ row }">
            <div class="address-two-lines-v1">
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

    <!-- 版本 2：只覆盖 .cell 样式（与之前修改类似） -->
    <div class="station-list-module">
      <div class="list-header">
        <div class="module-title">⚠️ 版本 2：覆盖 .cell { white-space: normal !important }，140px</div>
      </div>
      <el-table :data="tableData" border stripe class="station-table v2-table" size="small">
        <el-table-column prop="status" label="状态" align="center" width="80">
          <template #default="{ row }"><el-tag :type="row.statusType" size="small">{{ row.statusText }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="name" label="电站名称" align="center" min-width="140" show-overflow-tooltip />
        <el-table-column prop="shortAddress" label="电站地址" align="center" width="140">
          <template #default="{ row }">
            <div class="address-two-lines">
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

    <!-- 版本 3：直接对 .address-line 强制换行，并增加列宽到 150px -->
    <div class="station-list-module">
      <div class="list-header">
        <div class="module-title">✅ 版本 3：.address-line 强制换行 + 列宽 150px</div>
      </div>
      <el-table :data="tableData" border stripe class="station-table v3-table" size="small">
        <el-table-column prop="status" label="状态" align="center" width="80">
          <template #default="{ row }"><el-tag :type="row.statusType" size="small">{{ row.statusText }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="name" label="电站名称" align="center" min-width="140" show-overflow-tooltip />
        <el-table-column prop="shortAddress" label="电站地址" align="center" width="150">
          <template #default="{ row }">
            <div class="address-two-lines-v3">
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

    <!-- 版本 4：彻底方案 - 覆盖 td/cell/内部元素，列宽 150px -->
    <div class="station-list-module">
      <div class="list-header">
        <div class="module-title">🚀 版本 4：覆盖 td + cell + 内部元素，列宽 150px</div>
      </div>
      <el-table :data="tableData" border stripe class="station-table v4-table" size="small">
        <el-table-column prop="status" label="状态" align="center" width="80">
          <template #default="{ row }"><el-tag :type="row.statusType" size="small">{{ row.statusText }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="name" label="电站名称" align="center" min-width="140" show-overflow-tooltip />
        <el-table-column prop="shortAddress" label="电站地址" align="center" width="150">
          <template #default="{ row }">
            <div class="address-two-lines-v4">
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

// 模拟数据 - 固定地址为“广东省惠州市博罗县”
const mockAddresses = [
  '广东省惠州市博罗县罗阳街道商业东街123号',
  '广东省惠州市博罗县石湾镇科技产业园8号',
  '广东省惠州市博罗县园洲镇工业大道56号',
]

const tableData = ref([])

const extractShortAddress = (fullAddr) => {
  if (!fullAddr) return ''
  // 简单截取：省+市+县，由于数据规范，直接匹配省、市、县
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

// 生成数据
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
.test-dashboard {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
}
h2 { color: #1d2129; margin-bottom: 8px; }
.tip { color: #86909c; margin-bottom: 24px; }

.station-list-module {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  padding: 16px 24px;
  margin-bottom: 30px;
  width: 100%;
  box-sizing: border-box;
}
.list-header { margin-bottom: 16px; }
.module-title { font-size: 16px; font-weight: 700; color: #1D2129; }

.station-table {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  font-size: 13px;
}

/* 版本1样式：默认不干预 */
.address-two-lines-v1 {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 版本2样式：模拟之前改法 - 覆盖 .cell */
.v2-table :deep(.cell) {
  white-space: normal !important;
  overflow: visible !important;
  text-overflow: unset !important;
}
.address-two-lines {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 版本3样式：直接控制内部元素 */
.v3-table :deep(.cell) {
  white-space: normal !important;
  overflow: visible !important;
}
.address-two-lines-v3 {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.addr-line {
  display: block;
  white-space: normal !important;
  overflow: visible !important;
  text-overflow: unset !important;
  word-break: break-word;
  line-height: 1.4;
}

/* 版本4样式：彻底覆盖 td/cell/内部元素 */
.v4-table :deep(td) {
  overflow: visible !important;
}
.v4-table :deep(.cell) {
  white-space: normal !important;
  overflow: visible !important;
  text-overflow: unset !important;
}
.address-two-lines-v4 {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.address-two-lines-v4 span {
  display: block;
  white-space: normal !important;
  overflow: visible !important;
  text-overflow: unset !important;
  word-break: break-word;
  line-height: 1.4;
}
</style>