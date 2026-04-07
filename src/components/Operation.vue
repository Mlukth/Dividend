<template>
  <div class="operation-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">运行管理</h1>
      <p class="page-subtitle">光伏电站全方位监控与运维管理中心</p>
    </div>

    <!-- 1. 定向检查模块 -->
    <div class="section-container">
      <div class="section-header">
        <h2 class="section-title">
          <span class="title-icon">🔍</span>
          定向检查
        </h2>
        <el-tag type="info" size="small">实时监控</el-tag>
      </div>

      <!-- 1.1 电站异常排查 -->
      <div class="module-card">
        <div class="module-header">
          <h3 class="module-title">电站异常排查</h3>
          <el-button type="primary" size="small" link>查看详情</el-button>
        </div>
        
        <el-row :gutter="20">
          <!-- 左侧：数据概览 -->
          <el-col :span="6">
            <div class="data-overview-card">
              <div class="alarm-total">
                <div class="alarm-number" :class="{ 'danger': alarmTotal > 10 }">
                  {{ alarmTotal }}
                </div>
                <div class="alarm-label">当前告警总数</div>
              </div>
              <div class="alarm-levels">
                <div class="level-item">
                  <span class="level-dot danger"></span>
                  <span class="level-text">严重：{{ alarmLevels.severe }}</span>
                </div>
                <div class="level-item">
                  <span class="level-dot warning"></span>
                  <span class="level-text">重要：{{ alarmLevels.important }}</span>
                </div>
                <div class="level-item">
                  <span class="level-dot info"></span>
                  <span class="level-text">一般：{{ alarmLevels.general }}</span>
                </div>
                <div class="level-item">
                  <span class="level-dot tip"></span>
                  <span class="level-text">提示：{{ alarmLevels.tip }}</span>
                </div>
              </div>
            </div>
          </el-col>

          <!-- 中间：趋势图表 -->
          <el-col :span="10">
            <div class="chart-card">
              <div class="chart-title">近30天历史告警趋势</div>
              <div ref="alarmTrendChartRef" class="chart-container"></div>
            </div>
          </el-col>

          <!-- 右侧：故障列表 -->
          <el-col :span="8">
            <div class="fault-list-card">
              <div class="list-title">最新故障</div>
              <el-table :data="faultList" style="width: 100%" size="small">
                <el-table-column prop="device" label="故障设备" width="100" />
                <el-table-column prop="type" label="故障类型" width="100">
                  <template #default="{ row }">
                    <el-tag :type="getSeverityType(row.severity)" size="small">
                      {{ row.type }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="time" label="发生时间" />
                <el-table-column prop="duration" label="持续时长" width="80" />
              </el-table>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 1.2 失预警排查 -->
      <div class="module-card">
        <div class="module-header">
          <h3 class="module-title">失预警排查</h3>
          <el-button type="primary" size="small" link>查看详情</el-button>
        </div>
        
        <el-row :gutter="20">
          <!-- 左侧：预警统计饼图 -->
          <el-col :span="10">
            <div class="chart-card">
              <div class="chart-title">预警类型分布</div>
              <div ref="warningPieChartRef" class="chart-container"></div>
            </div>
          </el-col>

          <!-- 右侧：预警时间线 -->
          <el-col :span="14">
            <div class="timeline-card">
              <div class="timeline-title">最新预警时间线</div>
              <el-timeline>
                <el-timeline-item
                  v-for="(item, index) in warningTimeline"
                  :key="index"
                  :timestamp="item.time"
                  :type="item.type"
                  :color="item.color"
                >
                  <div class="timeline-content">
                    <div class="timeline-content-title">{{ item.title }}</div>
                    <div class="timeline-content-desc">{{ item.content }}</div>
                  </div>
                </el-timeline-item>
              </el-timeline>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 1.3 发电异常排查 -->
      <div class="module-card">
        <div class="module-header">
          <h3 class="module-title">发电异常排查</h3>
          <el-button type="primary" size="small" link>查看详情</el-button>
        </div>
        
        <el-row :gutter="16">
          <el-col :span="6" v-for="(item, index) in powerAbnormalList" :key="index">
            <div class="abnormal-card" :class="{ 'abnormal': item.status === 'error' }">
              <div class="abnormal-icon">{{ item.icon }}</div>
              <div class="abnormal-title">{{ item.title }}</div>
              <div class="abnormal-status">
                <span class="status-dot" :class="item.status"></span>
                <span class="status-text">{{ item.statusText }}</span>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- 2. 常规巡检模块 -->
    <div class="section-container">
      <div class="section-header">
        <h2 class="section-title">
          <span class="title-icon">📋</span>
          常规巡检
        </h2>
        <el-tag type="success" size="small">日常维护</el-tag>
      </div>

      <!-- 2.1-2.5 设备检查 -->
      <el-row :gutter="20">
        <el-col :span="12" v-for="(item, index) in inspectionList" :key="index">
          <div class="inspection-card">
            <div class="inspection-header">
              <h4 class="inspection-title">{{ item.title }}</h4>
              <el-tag :type="item.completed ? 'success' : 'warning'" size="small">
                {{ item.completed ? '已完成' : '待检查' }}
              </el-tag>
            </div>
            <el-row :gutter="16">
              <el-col :span="14">
                <div class="checklist">
                  <el-checkbox-group v-model="item.checkedItems">
                    <div class="check-item" v-for="(check, checkIndex) in item.checklist" :key="checkIndex">
                      <el-checkbox :label="check" />
                    </div>
                  </el-checkbox-group>
                </div>
              </el-col>
              <el-col :span="10">
                <div class="inspection-image">
                  <div class="image-placeholder">
                    <span class="image-icon">📷</span>
                    <span class="image-text">{{ item.imageText }}</span>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-col>
      </el-row>

      <!-- 2.6 运维巡检记录 -->
      <div class="module-card">
        <div class="module-header">
          <h3 class="module-title">运维巡检记录</h3>
          <el-button type="primary" size="small">新增记录</el-button>
        </div>
        
        <el-row :gutter="20">
          <!-- 巡检记录表格 -->
          <el-col :span="16">
            <div class="record-table-card">
              <el-table :data="inspectionRecords" style="width: 100%" stripe>
                <el-table-column prop="item" label="检查项" width="120" />
                <el-table-column prop="content" label="巡检内容" />
                <el-table-column prop="finding" label="巡检发现" width="150">
                  <template #default="{ row }">
                    <div class="finding-cell">
                      <span v-if="row.hasPhoto">📷</span>
                      <span>{{ row.finding }}</span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="level" label="缺陷等级" width="100">
                  <template #default="{ row }">
                    <el-tag :type="getLevelType(row.level)" size="small">
                      {{ row.level }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="100">
                  <template #default>
                    <el-button type="primary" size="small" link>查看</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-col>

          <!-- 整改跟踪 -->
          <el-col :span="8">
            <div class="rectification-card">
              <div class="rectification-title">整改跟踪</div>
              <el-steps direction="vertical" :active="2" finish-status="success">
                <el-step title="阶段性整改计划" description="2024-01-15 制定清洗计划" />
                <el-step title="跟踪时间" description="2024-01-20 跟踪进度" />
                <el-step title="完成状态" description="进行中" />
                <el-step title="遗留问题" description="无" />
              </el-steps>
              
              <div class="safety-check">
                <div class="safety-title">
                  <span class="safety-icon">🛡️</span>
                  安全检查
                </div>
                <div class="safety-item">
                  <span class="safety-label">消防系统状态：</span>
                  <el-tag type="success" size="small">正常</el-tag>
                </div>
                <div class="safety-item">
                  <span class="safety-label">安全标识完整性：</span>
                  <el-tag type="success" size="small">完整</el-tag>
                </div>
                <div class="safety-item">
                  <span class="safety-label">接地电阻：</span>
                  <el-tag type="success" size="small">合格</el-tag>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- 3. 故障处理模块 -->
    <div class="section-container">
      <div class="section-header">
        <h2 class="section-title">
          <span class="title-icon">🔧</span>
          故障处理
        </h2>
        <el-tag type="danger" size="small">紧急处理</el-tag>
      </div>

      <div class="module-card">
        <div class="module-header">
          <h3 class="module-title">故障处理流程</h3>
          <el-button type="primary" size="small">新建工单</el-button>
        </div>
        
        <el-row :gutter="20">
          <!-- 左侧：状态流转 -->
          <el-col :span="6">
            <div class="flow-card">
              <div class="flow-title">处理状态流转</div>
              <el-steps direction="vertical" :active="currentStep" finish-status="success" align-center>
                <el-step title="待处理" description="等待分配">
                  <template #icon>
                    <div class="step-icon">⏳</div>
                  </template>
                </el-step>
                <el-step title="处理中" description="正在修复">
                  <template #icon>
                    <div class="step-icon">🔨</div>
                  </template>
                </el-step>
                <el-step title="已解决" description="故障修复">
                  <template #icon>
                    <div class="step-icon">✅</div>
                  </template>
                </el-step>
                <el-step title="挂起" description="跟踪处理">
                  <template #icon>
                    <div class="step-icon">⏸️</div>
                  </template>
                </el-step>
              </el-steps>
            </div>
          </el-col>

          <!-- 中间：处理记录 -->
          <el-col :span="10">
            <div class="record-card">
              <div class="record-title">处理记录</div>
              <el-timeline>
                <el-timeline-item
                  v-for="(item, index) in processRecords"
                  :key="index"
                  :timestamp="item.time"
                  placement="top"
                >
                  <el-card shadow="hover" size="small">
                    <div class="process-record">
                      <div class="process-person">
                        <el-avatar :size="24" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
                        <span class="person-name">{{ item.person }}</span>
                      </div>
                      <div class="process-measure">{{ item.measure }}</div>
                      <div class="process-result">
                        <el-tag :type="item.resultType" size="small">{{ item.result }}</el-tag>
                      </div>
                    </div>
                  </el-card>
                </el-timeline-item>
              </el-timeline>
            </div>
          </el-col>

          <!-- 右侧：故障分析 -->
          <el-col :span="8">
            <div class="analysis-card">
              <div class="analysis-title">
                故障分析
                <el-tag type="info" size="small" effect="dark">知识库</el-tag>
              </div>
              
              <div class="mind-map">
                <div class="mind-root">
                  <div class="root-node">
                    <span class="root-icon">🔍</span>
                    根本原因分析
                  </div>
                </div>
                <div class="mind-branches">
                  <div class="branch-item">
                    <div class="branch-dot"></div>
                    <div class="branch-content">设备老化</div>
                  </div>
                  <div class="branch-item">
                    <div class="branch-dot"></div>
                    <div class="branch-content">连接松动</div>
                  </div>
                  <div class="branch-item">
                    <div class="branch-dot"></div>
                    <div class="branch-content">环境因素</div>
                  </div>
                </div>
                
                <div class="mind-root" style="margin-top: 30px;">
                  <div class="root-node">
                    <span class="root-icon">💡</span>
                    预防措施建议
                  </div>
                </div>
                <div class="mind-branches">
                  <div class="branch-item">
                    <div class="branch-dot success"></div>
                    <div class="branch-content">定期巡检</div>
                  </div>
                  <div class="branch-item">
                    <div class="branch-dot success"></div>
                    <div class="branch-content">加强维护</div>
                  </div>
                  <div class="branch-item">
                    <div class="branch-dot success"></div>
                    <div class="branch-content">更新设备</div>
                  </div>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- 4. 运维评估模块 -->
    <div class="section-container">
      <div class="section-header">
        <h2 class="section-title">
          <span class="title-icon">📊</span>
          运维评估
        </h2>
        <el-tag type="warning" size="small">数据分析</el-tag>
      </div>

      <el-row :gutter="20">
        <!-- 运维前后对比 -->
        <el-col :span="12">
          <div class="evaluation-card">
            <div class="evaluation-header">
              <h4 class="evaluation-title">运维前后对比</h4>
            </div>
            <div ref="comparisonChartRef" class="chart-container"></div>
            <div class="chart-annotation">
              <span class="annotation-text">清洗后发电量提升</span>
              <span class="annotation-value">+20%</span>
            </div>
          </div>
        </el-col>

        <!-- 污染程度 -->
        <el-col :span="6">
          <div class="evaluation-card">
            <div class="evaluation-header">
              <h4 class="evaluation-title">污染程度</h4>
            </div>
            <div ref="pollutionGaugeRef" class="chart-container"></div>
            <div class="gauge-hint">
              <el-tag type="warning" size="small">建议清洗</el-tag>
            </div>
          </div>
        </el-col>

        <!-- 成本节约率 -->
        <el-col :span="6">
          <div class="evaluation-card highlight">
            <div class="evaluation-header">
              <h4 class="evaluation-title">成本节约率</h4>
            </div>
            <div class="saving-rate">
              <div class="rate-number">12.5%</div>
              <div class="rate-trend">
                <span class="trend-icon">📈</span>
                <span class="trend-text">较上月提升 3.2%</span>
              </div>
            </div>
            <div class="saving-amount">
              <span class="amount-label">累计节约金额</span>
              <span class="amount-value">¥ 25,680</span>
            </div>
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px;">
        <!-- 运维成本曲线 -->
        <el-col :span="14">
          <div class="evaluation-card">
            <div class="evaluation-header">
              <h4 class="evaluation-title">运维成本曲线</h4>
            </div>
            <div ref="costChartRef" class="chart-container"></div>
          </div>
        </el-col>

        <!-- 历史运维时间记录 -->
        <el-col :span="10">
          <div class="evaluation-card">
            <div class="evaluation-header">
              <h4 class="evaluation-title">历史运维时间记录</h4>
            </div>
            <el-table :data="maintenanceRecords" style="width: 100%" size="small">
              <el-table-column prop="time" label="运维时间" width="110" />
              <el-table-column prop="content" label="运维内容" />
              <el-table-column prop="duration" label="耗时" width="70" />
              <el-table-column prop="person" label="人员" width="70" />
            </el-table>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'

// 图表引用
const alarmTrendChartRef = ref(null)
const warningPieChartRef = ref(null)
const comparisonChartRef = ref(null)
const pollutionGaugeRef = ref(null)
const costChartRef = ref(null)

// 图表实例
let alarmTrendChart = null
let warningPieChart = null
let comparisonChart = null
let pollutionGauge = null
let costChart = null

// 模拟数据
const alarmTotal = ref(15)
const alarmLevels = ref({
  severe: 3,
  important: 5,
  general: 4,
  tip: 3
})

const faultList = ref([
  { device: '逆变器#1', type: '过温', severity: 'severe', time: '2024-01-20 14:30', duration: '2h' },
  { device: '组串#5', type: '低电流', severity: 'important', time: '2024-01-20 13:15', duration: '1h' },
  { device: '汇流箱#2', type: '通讯异常', severity: 'general', time: '2024-01-20 12:00', duration: '30m' },
  { device: '支架#3', type: '松动', severity: 'tip', time: '2024-01-20 10:30', duration: '15m' }
])

const warningTimeline = ref([
  { time: '2024-01-20 15:00', title: '电网电压波动', content: '检测到电网电压异常波动，建议检查并网设备', type: 'warning', color: '#E6A23C' },
  { time: '2024-01-20 14:30', title: '逆变器过温预警', content: '逆变器#1温度超过阈值，请及时处理', type: 'danger', color: '#F56C6C' },
  { time: '2024-01-20 13:00', title: '组串电流偏低', content: '组串#5电流异常，可能存在阴影遮挡', type: 'info', color: '#409EFF' }
])

const powerAbnormalList = ref([
  { icon: '⚡', title: '电网异常', status: 'normal', statusText: '正常' },
  { icon: '🔋', title: '低电流组串排查', status: 'error', statusText: '异常' },
  { icon: '🔌', title: '低电压组串排查', status: 'normal', statusText: '正常' },
  { icon: '🌥️', title: '阴影遮挡组串排查', status: 'normal', statusText: '正常' },
  { icon: '🔗', title: 'MC4虚接组串排查', status: 'warning', statusText: '注意' },
  { icon: '↩️', title: '电流反灌组串排查', status: 'normal', statusText: '正常' },
  { icon: '💔', title: '隐裂裂片组件排查', status: 'normal', statusText: '正常' },
  { icon: '🌡️', title: '温度过高逆变器排查', status: 'error', statusText: '异常' }
])

const inspectionList = ref([
  {
    title: '光伏组件及支架检查',
    completed: true,
    imageText: '组件示意图',
    checklist: ['组件是否老化', '无裂纹或明显变形', '组件有无灰尘或遮挡'],
    checkedItems: ['组件是否老化', '无裂纹或明显变形', '组件有无灰尘或遮挡']
  },
  {
    title: '线路检查',
    completed: false,
    imageText: '线路连接图',
    checklist: ['支架是否牢固', '螺丝是否松动', 'MC4接头连接是否松动', '电缆是否老化破皮'],
    checkedItems: []
  },
  {
    title: '桥架水管检查',
    completed: true,
    imageText: '桥架示意图',
    checklist: ['桥架外观检查', '运维水管检查'],
    checkedItems: ['桥架外观检查', '运维水管检查']
  },
  {
    title: '逆变器检查',
    completed: false,
    imageText: '逆变器实物图',
    checklist: ['外观检查', '安装牢固可靠', '电气连接检查', '开关分合闸灵活', '显示屏清晰', '按键操作正常'],
    checkedItems: []
  },
  {
    title: '并网柜检查',
    completed: true,
    imageText: '并网柜示意图',
    checklist: ['直流输入电压', '直流电压', '交流电压', '瞬时功率', '交流效率', '电缆出线接线柱清扫'],
    checkedItems: ['直流输入电压', '直流电压', '交流电压', '瞬时功率', '交流效率', '电缆出线接线柱清扫']
  }
])

const inspectionRecords = ref([
  { item: '组件检查', content: '设备外观、接线状态', finding: '正常', hasPhoto: false, level: '无' },
  { item: '逆变器检查', content: '清洁度、安全标识', finding: '发现少量灰尘', hasPhoto: true, level: '一般' },
  { item: '线路检查', content: '连接状态', finding: 'MC4接头松动', hasPhoto: true, level: '重要' }
])

const currentStep = ref(1)

const processRecords = ref([
  {
    time: '2024-01-20 14:30',
    person: '张三',
    measure: '到达现场，检查逆变器#1温度',
    result: '正在处理',
    resultType: 'warning'
  },
  {
    time: '2024-01-20 15:00',
    person: '李四',
    measure: '清理散热风扇，检查通风情况',
    result: '处理中',
    resultType: 'primary'
  },
  {
    time: '2024-01-20 15:30',
    person: '张三',
    measure: '温度恢复正常，设备运行稳定',
    result: '已解决',
    resultType: 'success'
  }
])

const maintenanceRecords = ref([
  { time: '2024-01-15', content: '组件清洗', duration: '4h', person: '张三' },
  { time: '2024-01-10', content: '逆变器检查', duration: '2h', person: '李四' },
  { time: '2024-01-05', content: '线路巡检', duration: '3h', person: '王五' },
  { time: '2024-01-01', content: '全站安全检查', duration: '5h', person: '团队' }
])

// 辅助方法
const getSeverityType = (severity) => {
  const map = {
    severe: 'danger',
    important: 'warning',
    general: 'info',
    tip: 'success'
  }
  return map[severity] || 'info'
}

const getLevelType = (level) => {
  const map = {
    '严重': 'danger',
    '重要': 'warning',
    '一般': 'info',
    '无': 'success'
  }
  return map[level] || 'info'
}

// 图表初始化
const initCharts = () => {
  nextTick(() => {
    // 告警趋势图
    if (alarmTrendChartRef.value) {
      alarmTrendChart = echarts.init(alarmTrendChartRef.value)
      const option = {
        tooltip: { trigger: 'axis' },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['1-1', '1-5', '1-10', '1-15', '1-20', '1-25', '1-30']
        },
        yAxis: { type: 'value' },
        series: [{
          name: '告警数量',
          type: 'line',
          smooth: true,
          data: [8, 12, 6, 10, 15, 9, 7],
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(0, 102, 204, 0.3)' },
              { offset: 1, color: 'rgba(0, 102, 204, 0.05)' }
            ])
          },
          lineStyle: { color: '#0066CC', width: 2 },
          itemStyle: { color: '#0066CC' }
        }]
      }
      alarmTrendChart.setOption(option)
    }

    // 预警饼图
    if (warningPieChartRef.value) {
      warningPieChart = echarts.init(warningPieChartRef.value)
      const option = {
        tooltip: { trigger: 'item' },
        legend: { orient: 'vertical', left: 'left' },
        series: [{
          name: '预警类型',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
          label: { show: false },
          emphasis: {
            label: { show: true, fontSize: 14, fontWeight: 'bold' }
          },
          data: [
            { value: 40, name: '设备预警', itemStyle: { color: '#F56C6C' } },
            { value: 30, name: '电网预警', itemStyle: { color: '#E6A23C' } },
            { value: 20, name: '通讯预警', itemStyle: { color: '#409EFF' } },
            { value: 10, name: '其他预警', itemStyle: { color: '#909399' } }
          ]
        }]
      }
      warningPieChart.setOption(option)
    }

    // 运维前后对比图
    if (comparisonChartRef.value) {
      comparisonChart = echarts.init(comparisonChartRef.value)
      const option = {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: {
          type: 'category',
          data: ['1月', '2月', '3月', '4月', '5月', '6月']
        },
        yAxis: { type: 'value', name: '发电量 (kWh)' },
        series: [
          {
            name: '运维前',
            type: 'bar',
            data: [950, 980, 1000, 970, 990, 1000],
            itemStyle: { color: '#909399' }
          },
          {
            name: '运维后',
            type: 'bar',
            data: [1100, 1150, 1200, 1180, 1190, 1200],
            itemStyle: { color: '#0066CC' }
          }
        ]
      }
      comparisonChart.setOption(option)
    }

    // 污染程度仪表盘
    if (pollutionGaugeRef.value) {
      pollutionGauge = echarts.init(pollutionGaugeRef.value)
      const option = {
        series: [{
          type: 'gauge',
          startAngle: 180,
          endAngle: 0,
          min: 0,
          max: 100,
          splitNumber: 5,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#67C23A' },
              { offset: 0.5, color: '#E6A23C' },
              { offset: 1, color: '#F56C6C' }
            ])
          },
          progress: { show: true, width: 18 },
          pointer: { show: false },
          axisLine: { lineStyle: { width: 18 } },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          title: { show: false },
          detail: {
            valueAnimation: true,
            fontSize: 24,
            fontWeight: 'bold',
            offsetCenter: [0, '20%'],
            formatter: '{value}分'
          },
          data: [{ value: 65 }]
        }]
      }
      pollutionGauge.setOption(option)
    }

    // 运维成本曲线图
    if (costChartRef.value) {
      costChart = echarts.init(costChartRef.value)
      const option = {
        tooltip: { trigger: 'axis' },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: {
          type: 'category',
          data: ['8月', '9月', '10月', '11月', '12月', '1月']
        },
        yAxis: { type: 'value', name: '成本 (元)' },
        series: [{
          name: '运维成本',
          type: 'line',
          smooth: true,
          data: [5000, 4800, 4500, 4200, 4000, 3800],
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(103, 194, 58, 0.3)' },
              { offset: 1, color: 'rgba(103, 194, 58, 0.05)' }
            ])
          },
          lineStyle: { color: '#67C23A', width: 2 },
          itemStyle: { color: '#67C23A' }
        }]
      }
      costChart.setOption(option)
    }
  })
}

// 响应式处理
const handleResize = () => {
  alarmTrendChart?.resize()
  warningPieChart?.resize()
  comparisonChart?.resize()
  pollutionGauge?.resize()
  costChart?.resize()
}

onMounted(() => {
  initCharts()
  window.addEventListener('resize', handleResize)
})
</script>

<style scoped>
.operation-management {
  padding: 20px;
  background-color: #F5F7FA;
  min-height: calc(100vh - 100px);
}

/* 页面标题 */
.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1D2129;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 14px;
  color: #86909C;
  margin: 0;
}

/* 章节容器 */
.section-container {
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1D2129;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-icon {
  font-size: 20px;
}

/* 模块卡片 */
.module-card {
  background: #FFFFFF;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 16px;
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.module-title {
  font-size: 16px;
  font-weight: 600;
  color: #1D2129;
  margin: 0;
}

/* 电站异常排查 */
.data-overview-card {
  background: linear-gradient(135deg, #FFF5F5 0%, #FFFFFF 100%);
  border-radius: 8px;
  padding: 20px;
  text-align: center;
}

.alarm-total {
  margin-bottom: 20px;
}

.alarm-number {
  font-size: 48px;
  font-weight: 700;
  color: #4E5969;
  line-height: 1;
}

.alarm-number.danger {
  color: #F56C6C;
}

.alarm-label {
  font-size: 14px;
  color: #86909C;
  margin-top: 8px;
}

.alarm-levels {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.level-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #4E5969;
}

.level-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.level-dot.danger { background: #F56C6C; }
.level-dot.warning { background: #E6A23C; }
.level-dot.info { background: #409EFF; }
.level-dot.tip { background: #909399; }

.chart-card {
  background: #F7F8FA;
  border-radius: 8px;
  padding: 16px;
  height: 100%;
}

.chart-title {
  font-size: 14px;
  font-weight: 500;
  color: #1D2129;
  margin-bottom: 12px;
}

.chart-container {
  width: 100%;
  height: 200px;
}

.fault-list-card {
  background: #FFFFFF;
  border: 1px solid #E5E6EB;
  border-radius: 8px;
  padding: 16px;
  height: 100%;
}

.list-title {
  font-size: 14px;
  font-weight: 500;
  color: #1D2129;
  margin-bottom: 12px;
}

/* 预警时间线 */
.timeline-card {
  background: #FFFFFF;
  border-radius: 8px;
  padding: 16px;
  height: 100%;
}

.timeline-title {
  font-size: 14px;
  font-weight: 500;
  color: #1D2129;
  margin-bottom: 16px;
}

.timeline-content-title {
  font-size: 14px;
  font-weight: 500;
  color: #1D2129;
  margin-bottom: 4px;
}

.timeline-content-desc {
  font-size: 13px;
  color: #86909C;
}

/* 发电异常排查 */
.abnormal-card {
  background: #F7F8FA;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  transition: all 0.3s;
  cursor: pointer;
}

.abnormal-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.abnormal-card.abnormal {
  background: linear-gradient(135deg, #FFF5F5 0%, #FFFFFF 100%);
  border: 1px solid #FDE2E2;
}

.abnormal-icon {
  font-size: 36px;
  margin-bottom: 12px;
}

.abnormal-title {
  font-size: 14px;
  font-weight: 500;
  color: #1D2129;
  margin-bottom: 12px;
}

.abnormal-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot.normal { background: #67C23A; }
.status-dot.warning { background: #E6A23C; }
.status-dot.error { background: #F56C6C; }

.status-text {
  font-size: 13px;
  color: #4E5969;
}

/* 常规巡检 */
.inspection-card {
  background: #FFFFFF;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 16px;
}

.inspection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.inspection-title {
  font-size: 15px;
  font-weight: 600;
  color: #1D2129;
  margin: 0;
}

.checklist {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.check-item {
  font-size: 14px;
  color: #4E5969;
}

.inspection-image {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-placeholder {
  width: 100%;
  height: 120px;
  background: #F7F8FA;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 2px dashed #E5E6EB;
}

.image-icon {
  font-size: 32px;
}

.image-text {
  font-size: 13px;
  color: #86909C;
}

/* 运维巡检记录 */
.record-table-card {
  background: #FFFFFF;
  border-radius: 8px;
  overflow: hidden;
}

.finding-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}

.rectification-card {
  background: #F7F8FA;
  border-radius: 8px;
  padding: 16px;
  height: 100%;
}

.rectification-title {
  font-size: 14px;
  font-weight: 500;
  color: #1D2129;
  margin-bottom: 16px;
}

.safety-check {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #E5E6EB;
}

.safety-title {
  font-size: 14px;
  font-weight: 500;
  color: #1D2129;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.safety-icon {
  font-size: 16px;
}

.safety-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.safety-label {
  font-size: 13px;
  color: #4E5969;
}

/* 故障处理 */
.flow-card {
  background: #F7F8FA;
  border-radius: 8px;
  padding: 16px;
  height: 100%;
}

.flow-title {
  font-size: 14px;
  font-weight: 500;
  color: #1D2129;
  margin-bottom: 16px;
}

.step-icon {
  font-size: 20px;
}

.record-card {
  background: #FFFFFF;
  border-radius: 8px;
  padding: 16px;
  height: 100%;
}

.record-title {
  font-size: 14px;
  font-weight: 500;
  color: #1D2129;
  margin-bottom: 16px;
}

.process-record {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.process-person {
  display: flex;
  align-items: center;
  gap: 8px;
}

.person-name {
  font-size: 14px;
  font-weight: 500;
  color: #1D2129;
}

.process-measure {
  font-size: 13px;
  color: #4E5969;
}

.process-result {
  margin-top: 4px;
}

.analysis-card {
  background: linear-gradient(135deg, #EEF7FF 0%, #FFFFFF 100%);
  border-radius: 8px;
  padding: 16px;
  height: 100%;
}

.analysis-title {
  font-size: 14px;
  font-weight: 500;
  color: #1D2129;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.mind-map {
  padding: 10px 0;
}

.mind-root {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.root-node {
  background: #0066CC;
  color: #FFFFFF;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.root-icon {
  font-size: 16px;
}

.mind-branches {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-left: 30px;
}

.branch-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.branch-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #409EFF;
  border: 2px solid #FFFFFF;
  box-shadow: 0 0 0 2px #409EFF;
}

.branch-dot.success {
  background: #67C23A;
  box-shadow: 0 0 0 2px #67C23A;
}

.branch-content {
  font-size: 14px;
  color: #4E5969;
  background: #FFFFFF;
  padding: 6px 12px;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

/* 运维评估 */
.evaluation-card {
  background: #FFFFFF;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  height: 100%;
}

.evaluation-card.highlight {
  background: linear-gradient(135deg, #E8F7EF 0%, #FFFFFF 100%);
}

.evaluation-header {
  margin-bottom: 16px;
}

.evaluation-title {
  font-size: 15px;
  font-weight: 600;
  color: #1D2129;
  margin: 0;
}

.chart-annotation {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #E5E6EB;
}

.annotation-text {
  font-size: 14px;
  color: #4E5969;
}

.annotation-value {
  font-size: 18px;
  font-weight: 600;
  color: #67C23A;
}

.gauge-hint {
  text-align: center;
  margin-top: 12px;
}

.saving-rate {
  text-align: center;
  padding: 20px 0;
}

.rate-number {
  font-size: 48px;
  font-weight: 700;
  color: #67C23A;
  line-height: 1;
  margin-bottom: 12px;
}

.rate-trend {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 14px;
  color: #4E5969;
}

.trend-icon {
  font-size: 16px;
}

.saving-amount {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #E5E6EB;
}

.amount-label {
  font-size: 14px;
  color: #86909C;
}

.amount-value {
  font-size: 18px;
  font-weight: 600;
  color: #1D2129;
}
</style>