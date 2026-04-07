<template>
  <div class="contribution-statistics-page">
    <!-- 页面标题与全局操作区 -->
    <div class="page-header">
      <div class="page-title">
        <span class="title-icon">📊</span>
        <h1>小组贡献积分统计</h1>
      </div>
      <div class="global-actions">
        <el-button type="primary" :loading="exporting" @click="handleExport">
          📥 导出完整报表
        </el-button>
        <el-popconfirm title="确定清空所有积分？不可恢复！" @confirm="handleClearAllScores">
          <el-button type="danger">🔄 清空所有积分</el-button>
        </el-popconfirm>
        <el-popconfirm title="确定清空所有日志？不可恢复！" @confirm="handleClearAllLogs">
          <el-button>🗑️ 清空操作日志</el-button>
        </el-popconfirm>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 左侧：积分计算器 + 排行榜 -->
      <div class="left-section">
        <!-- 积分计算器 -->
        <div class="card">
          <div class="card-header"><h3>积分计算器</h3></div>
          <div class="card-body">
            <div class="form-item">
              <label>任务难度</label>
              <el-select v-model="selectedDifficulty" class="full-width">
                <el-option v-for="d in difficultyLevels" :key="d.level" 
                  :label="`难度${d.level}（系数${d.coefficient}）`" :value="d.level"/>
              </el-select>
            </div>
            <div class="form-item">
              <label>预估工时（小时）</label>
              <el-input-number v-model="workHours" :min="0.5" :step="0.5" class="full-width"/>
            </div>
            <div class="result-display">
              <div class="result-label">本次积分</div>
              <div class="result-value">{{ currentScore.toFixed(1) }}</div>
              <div class="formula">公式：{{ workHours }} × {{ currentCoefficient }}</div>
            </div>
            <div class="form-item">
              <label>选择成员</label>
              <el-select v-model="selectedMemberId" placeholder="请选择成员" class="full-width">
                <el-option v-for="m in members" :key="m.id" :label="m.name" :value="m.id"/>
              </el-select>
            </div>
            <el-button type="primary" class="btn-block" @click="handleCalculate">自动计算积分</el-button>
            <el-button type="success" class="btn-block" @click="handleAddToMember" :disabled="!selectedMemberId">
              一键加到该成员
            </el-button>
          </div>
        </div>

        <!-- 贡献排行榜 -->
        <div class="card">
          <div class="card-header"><h3>贡献排行榜</h3></div>
          <div class="card-body">
            <div class="ranking-list">
              <div v-for="(m, i) in sortedMembers" :key="m.id" class="ranking-item" :class="`rank-${i+1}`">
                <span class="rank-num">{{ i===0?'🏆':i===1?'🥈':i===2?'🥉':i+1 }}</span>
                <span class="name">{{ m.name }}</span>
                <span class="score">{{ m.score.toFixed(1) }}分</span>
                <div class="progress-bar">
                  <div class="fill" :style="{width: `${m.percentage}%`}"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：总积分 + 成员卡片 -->
      <div class="right-section">
        <!-- 团队总积分 -->
        <div class="card total-card">
          <div class="card-body">
            <div>
              <div class="label">团队总积分</div>
              <div class="value">{{ totalScore.toFixed(1) }}</div>
              <div class="target">目标：1000分 | 完成度 {{ completionRate }}%</div>
            </div>
            <div ref="ringChart" class="chart"></div>
          </div>
        </div>

        <!-- 成员积分卡片 -->
        <div class="card">
          <div class="card-header"><h3>成员积分详情</h3></div>
          <div class="card-body">
            <div class="members-grid">
              <div v-for="m in members" :key="m.id" class="member-card">
                <div class="avatar">{{ m.name.charAt(0) }}</div>
                <div class="name">{{ m.name }}</div>
                <div class="score">{{ m.score.toFixed(1) }} 分</div>
                <div class="percent">占比 {{ m.percentage }}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作日志 -->
    <div class="card">
      <div class="card-header">
        <h3>操作日志</h3>
      </div>
      <div class="card-body">
        <el-table :data="operationLogs" stripe style="width: 100%">
          <el-table-column prop="timestamp" label="时间" width="180" sortable/>
          <el-table-column prop="operatorName" label="操作人" width="100"/>
          <el-table-column prop="typeText" label="操作类型" width="100">
            <template #default="{row}">
              <el-tag :type="row.type==='add'?'success':'danger'" size="small">{{ row.typeText }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="difficulty" label="难度" width="80"/>
          <el-table-column prop="workHours" label="工时" width="80"/>
          <el-table-column prop="score" label="积分" width="80">
            <template #default="{row}">
              <span v-if="row.score" class="positive">+{{ row.score.toFixed(1) }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import * as XLSX from 'xlsx'

// 基础配置
const members = ref([
  { id: 1, name: '张三', score: 0, percentage: 0 },
  { id: 2, name: '李四', score: 0, percentage: 0 },
  { id: 3, name: '王五', score: 0, percentage: 0 },
  { id: 4, name: '赵六', score: 0, percentage: 0 },
  { id: 5, name: '钱七', score: 0, percentage: 0 },
  { id: 6, name: '孙八', score: 0, percentage: 0 }
])

const difficultyLevels = [
  { level: 1, coefficient: 1.0 },
  { level: 2, coefficient: 1.5 },
  { level: 3, coefficient: 2.0 },
  { level: 4, coefficient: 2.5 },
  { level: 5, coefficient: 3.0 }
]

// 响应式数据
const selectedDifficulty = ref(3)
const workHours = ref(2.0)
const selectedMemberId = ref(null)
const currentScore = ref(0)
const operationLogs = ref([])
const exporting = ref(false)
const ringChart = ref(null)

// 计算属性
const currentCoefficient = computed(() => 
  difficultyLevels.find(d => d.level === selectedDifficulty.value).coefficient
)

const totalScore = computed(() => 
  members.value.reduce((sum, m) => sum + m.score, 0)
)

const completionRate = computed(() => 
  Math.min(100, Math.round((totalScore.value / 1000) * 100))
)

const sortedMembers = computed(() => {
  const sorted = [...members.value].sort((a, b) => b.score - a.score)
  sorted.forEach(m => {
    m.percentage = totalScore.value > 0 ? Math.round((m.score / totalScore.value) * 100) : 0
  })
  return sorted
})

// 核心方法
const handleCalculate = () => {
  currentScore.value = workHours.value * currentCoefficient.value
}

const handleAddToMember = () => {
  if (!selectedMemberId.value) return ElMessage.warning('请先选择成员')
  if (currentScore.value === 0) return ElMessage.warning('请先计算积分')

  const member = members.value.find(m => m.id === selectedMemberId.value)
  member.score += currentScore.value

  // 添加日志（关键：存储所有原始数据用于导出公式）
  const log = {
    timestamp: new Date().toLocaleString(),
    operatorId: member.id,
    operatorName: member.name,
    type: 'add',
    typeText: '加分',
    difficulty: selectedDifficulty.value,
    workHours: workHours.value,
    score: currentScore.value,
    coefficient: currentCoefficient.value
  }
  operationLogs.value.unshift(log)

  // 保存到本地
  saveToLocal()
  updateChart()
  ElMessage.success(`已为${member.name}添加${currentScore.value.toFixed(1)}积分`)
  
  // 重置
  currentScore.value = 0
  workHours.value = 2.0
}

const handleClearAllScores = () => {
  members.value.forEach(m => m.score = 0)
  operationLogs.value.unshift({
    timestamp: new Date().toLocaleString(),
    operatorName: '系统',
    type: 'clear',
    typeText: '清空积分'
  })
  saveToLocal()
  updateChart()
  ElMessage.success('已清空所有积分')
}

const handleClearAllLogs = () => {
  operationLogs.value = [{
    timestamp: new Date().toLocaleString(),
    operatorName: '系统',
    type: 'clear',
    typeText: '清空日志'
  }]
  saveToLocal()
  ElMessage.success('已清空所有操作日志')
}

// ✅ 修复后的Excel导出（真正生成可联动公式）
const handleExport = async () => {
  exporting.value = true
  try {
    // 1. 准备原始操作日志表（所有原始数据，公式的数据源）
    const logData = [
      ['时间', '操作人', '任务难度', '难度系数', '预估工时', '单次积分']
    ]

    // 只保留加分记录（清空操作不参与计算）
    const addLogs = operationLogs.value.filter(log => log.type === 'add')
    
    addLogs.forEach((log, index) => {
      const rowNum = index + 2 // Excel行号（从第2行开始，第1行是表头）
      logData.push([
        log.timestamp,
        log.operatorName,
        log.difficulty,
        log.coefficient,
        log.workHours,
        { f: `=D${rowNum}*E${rowNum}` } // ✅ 单次积分公式：系数×工时
      ])
    })

    // 2. 准备按日积分统计表（带SUMIFS公式，自动汇总）
    const dailyData = [
      ['日期', '张三', '李四', '王五', '赵六', '钱七', '孙八', '当日总计']
    ]

    // 提取所有不重复的日期
    const dates = [...new Set(addLogs.map(log => log.timestamp.split(' ')[0]))].sort()
    
    dates.forEach((date, dateIndex) => {
      const row = [date]
      // 为每个成员生成SUMIFS公式：按日期和姓名汇总原始日志的积分
      members.value.forEach((member, memberIndex) => {
        // 公式：=SUMIFS(原始日志!F:F, 原始日志!A:A, 日期, 原始日志!B:B, 姓名)
        const formula = `=SUMIFS(原始操作日志!$F:$F, 原始操作日志!$A:$A, "*${date}*", 原始操作日志!$B:$B, "${member.name}")`
        row.push({ f: formula })
      })
      // 当日总计公式
      row.push({ f: `=SUM(B${dateIndex+2}:H${dateIndex+2})` })
      dailyData.push(row)
    })

    // 3. 添加累计总计行（带SUM公式）
    const totalRow = ['累计总计']
    members.value.forEach((_, index) => {
      const col = String.fromCharCode(66 + index) // B到G列
      totalRow.push({ f: `=SUM(${col}2:${col}${dates.length+1})` })
    })
    totalRow.push({ f: `=SUM(B${dates.length+2}:H${dates.length+2})` })
    dailyData.push(totalRow)

    // 4. 创建工作簿并导出
    const wb = XLSX.utils.book_new()
    const ws1 = XLSX.utils.aoa_to_sheet(dailyData)
    const ws2 = XLSX.utils.aoa_to_sheet(logData)

    XLSX.utils.book_append_sheet(wb, ws1, '按日积分统计表')
    XLSX.utils.book_append_sheet(wb, ws2, '原始操作日志')

    // 自动调整列宽
    ws1['!cols'] = [{wch:12}, {wch:10}, {wch:10}, {wch:10}, {wch:10}, {wch:10}, {wch:10}, {wch:12}]
    ws2['!cols'] = [{wch:20}, {wch:10}, {wch:10}, {wch:10}, {wch:10}, {wch:12}]

    const fileName = `小组贡献积分统计_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`
    XLSX.writeFile(wb, fileName)

    ElMessage.success('✅ 导出成功！修改原始日志的工时/难度，所有积分会自动更新')
  } catch (e) {
    console.error(e)
    ElMessage.error('导出失败')
  } finally {
    exporting.value = false
  }
}

// 本地存储
const saveToLocal = () => {
  localStorage.setItem('members', JSON.stringify(members.value))
  localStorage.setItem('logs', JSON.stringify(operationLogs.value))
}

const loadFromLocal = () => {
  const savedMembers = localStorage.getItem('members')
  const savedLogs = localStorage.getItem('logs')
  if (savedMembers) members.value = JSON.parse(savedMembers)
  if (savedLogs) operationLogs.value = JSON.parse(savedLogs)
}

// 图表
const initChart = () => {
  const chart = echarts.init(ringChart.value)
  updateChart(chart)
  window.addEventListener('resize', () => chart.resize())
}

const updateChart = (chart = echarts.getInstanceByDom(ringChart.value)) => {
  if (!chart) return
  chart.setOption({
    series: [{
      type: 'pie',
      radius: ['60%', '80%'],
      data: [
        { value: totalScore.value, name: '已完成', itemStyle: { color: '#0066CC' } },
        { value: Math.max(0, 1000 - totalScore.value), name: '未完成', itemStyle: { color: '#F5F7FA' } }
      ],
      label: { show: false }
    }]
  })
}

onMounted(() => {
  loadFromLocal()
  handleCalculate()
  nextTick(initChart)
})
</script>

<style scoped>
.contribution-statistics-page {
  padding: 20px;
  background: #F5F7FA;
  min-height: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: bold;
}

.global-actions {
  display: flex;
  gap: 12px;
}

.main-content {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
}

.left-section {
  width: 360px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.right-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.card-header {
  padding: 16px 20px;
  border-bottom: 1px solid #E5E6EB;
  font-size: 16px;
  font-weight: bold;
}

.card-body {
  padding: 20px;
}

.form-item {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.full-width {
  width: 100%;
}

.result-display {
  background: #EEF7FF;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  margin-bottom: 16px;
}

.result-label {
  font-size: 14px;
  color: #86909C;
}

.result-value {
  font-size: 28px;
  font-weight: bold;
  color: #0066CC;
  margin: 8px 0;
}

.formula {
  font-size: 12px;
  color: #86909C;
}

.btn-block {
  width: 100%;
  margin-bottom: 8px;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background: #F5F7FA;
}

.ranking-item.rank-1 { background: #FFF7E6; }
.ranking-item.rank-2 { background: #EEF7FF; }
.ranking-item.rank-3 { background: #E6FFED; }

.rank-num {
  width: 24px;
  text-align: center;
  font-size: 18px;
}

.name {
  flex: 1;
}

.progress-bar {
  width: 60px;
  height: 6px;
  background: #E5E6EB;
  border-radius: 3px;
  overflow: hidden;
}

.fill {
  height: 100%;
  background: #0066CC;
  border-radius: 3px;
}

.rank-1 .fill { background: #FF7D00; }
.rank-2 .fill { background: #165DFF; }
.rank-3 .fill { background: #00B42A; }

.total-card .card-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label {
  font-size: 14px;
  color: #86909C;
}

.value {
  font-size: 36px;
  font-weight: bold;
  color: #0066CC;
  margin: 8px 0;
}

.target {
  font-size: 14px;
  color: #86909C;
}

.chart {
  width: 160px;
  height: 160px;
}

.members-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.member-card {
  background: #F5F7FA;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0066CC, #165DFF);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  font-weight: bold;
}

.name {
  font-weight: 500;
  margin-bottom: 8px;
}

.score {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 4px;
}

.percent {
  font-size: 12px;
  color: #86909C;
}

.positive {
  color: #00B42A;
  font-weight: 500;
}
</style>