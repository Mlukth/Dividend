<template>
  <div class="exam-container">
    <!-- 左右分栏布局 -->
    <div class="main-layout">
      <!-- 左侧内容区 -->
      <div class="left-content">
        <!-- 页面标题 -->
        <div class="page-header">
          <h2 class="page-title">电站运维检测</h2>
        </div>

        <!-- 运维清洗频次 -->
        <div class="ops-frequency-card">
          <div class="card-header">
            <span class="card-title">运维清洗频次 · 近7日</span>
          </div>
          <!-- 精致柱状图：7天清洗次数，带刻度+数值 -->
          <div class="bar-chart-wrapper">
            <div class="y-axis-labels">
              <span>5</span><span>4</span><span>3</span><span>2</span><span>1</span><span>0</span>
            </div>
            <div class="bar-main">
              <div class="chart-grid"></div>
              <div class="bar-group">
                <div class="bar-item" style="height: 24%">
                  <span class="bar-num">1</span>
                </div>
                <div class="bar-item" style="height: 48%">
                  <span class="bar-num">2</span>
                </div>
                <div class="bar-item" style="height: 36%">
                  <span class="bar-num">1</span>
                </div>
                <div class="bar-item" style="height: 72%">
                  <span class="bar-num">3</span>
                </div>
                <div class="bar-item" style="height: 60%">
                  <span class="bar-num">2</span>
                </div>
                <div class="bar-item" style="height: 84%">
                  <span class="bar-num">4</span>
                </div>
                <div class="bar-item" style="height: 48%">
                  <span class="bar-num">2</span>
                </div>
              </div>
              <div class="x-axis-labels">
                <span>1日</span><span>2日</span><span>3日</span><span>4日</span><span>5日</span><span>6日</span><span>7日</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 图表行 -->
        <div class="charts-row">
          <!-- 发电量趋势：24小时，蓝色折线+填充+峰值 -->
          <div class="chart-card">
            <div class="chart-title">📈 发电量趋势 · 近24h</div>
            <svg class="line-chart" viewBox="0 0 340 130">
              <defs>
                <linearGradient id="powerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#1677ff" stop-opacity="0.15"/>
                  <stop offset="100%" stop-color="#1677ff" stop-opacity="0"/>
                </linearGradient>
              </defs>
              <!-- 网格线 -->
              <path d="M0,26 H340 M0,52 H340 M0,78 H340 M0,104 H340" stroke="#f2f3f5" stroke-width="1"/>
              <!-- 填充区域 -->
              <path d="M0,100 L28,86 L56,72 L85,58 L113,44 L141,30 L170,22 L198,36 L226,48 L255,32 L283,18 L311,26 L340,32 L340,130 L0,130 Z" fill="url(#powerGrad)"/>
              <!-- 折线 -->
              <polyline points="0,100 28,86 56,72 85,58 113,44 141,30 170,22 198,36 226,48 255,32 283,18 311,26 340,32" 
                fill="none" stroke="#1677ff" stroke-width="2" stroke-linecap="round"/>
              <!-- 数据点 -->
              <circle cx="170" cy="22" r="3.5" fill="#1677ff" stroke="#fff" stroke-width="1"/>
              <circle cx="283" cy="18" r="3.5" fill="#1677ff" stroke="#fff" stroke-width="1"/>
              <!-- 峰值标注 -->
              <text x="283" y="12" font-size="8" fill="#1677ff" text-anchor="middle">峰值</text>
            </svg>
            <div class="chart-time-labels">
              <span>00</span><span>06</span><span>12</span><span>18</span><span>24</span>
            </div>
          </div>

          <!-- PR值趋势：30天，绿色折线+填充+平均值虚线 -->
          <div class="chart-card">
            <div class="chart-title">📉 PR值趋势 · 近30日</div>
            <svg class="line-chart" viewBox="0 0 340 130">
              <defs>
                <linearGradient id="prGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#67c23a" stop-opacity="0.15"/>
                  <stop offset="100%" stop-color="#67c23a" stop-opacity="0"/>
                </linearGradient>
              </defs>
              <!-- 网格线 -->
              <path d="M0,26 H340 M0,52 H340 M0,78 H340 M0,104 H340" stroke="#f2f3f5" stroke-width="1"/>
              <!-- 平均值虚线 -->
              <path d="M0,60 H340" stroke="#999" stroke-width="1" stroke-dasharray="4,2"/>
              <text x="10" y="57" font-size="7" fill="#999">均值</text>
              <!-- 填充区域 -->
              <path d="M0,65 L34,62 L68,68 L102,59 L136,55 L170,52 L204,54 L238,51 L272,50 L306,48 L340,47 L340,130 L0,130 Z" fill="url(#prGrad)"/>
              <!-- 折线 -->
              <polyline points="0,65 34,62 68,68 102,59 136,55 170,52 204,54 238,51 272,50 306,48 340,47" 
                fill="none" stroke="#67c23a" stroke-width="2" stroke-linecap="round"/>
              <!-- 数据点 -->
              <circle cx="170" cy="52" r="3.5" fill="#67c23a" stroke="#fff" stroke-width="1"/>
              <circle cx="340" cy="47" r="3.5" fill="#67c23a" stroke="#fff" stroke-width="1"/>
            </svg>
            <div class="chart-time-labels">
              <span>1</span><span>7</span><span>15</span><span>22</span><span>30</span>
            </div>
          </div>
        </div>

        <!-- 告警区域 -->
        <div class="alarm-section">
          <!-- 逆变器报警 -->
          <div class="alarm-card">
            <div class="alarm-card-header">🔔 逆变器报警</div>
            <div class="alarm-levels">
              <div class="level-item emergency">
                <span>紧急</span>
                <span class="count">{{ alarmData.inverter.emergency }}</span>
              </div>
              <div class="level-item general">
                <span>一般</span>
                <span class="count">{{ alarmData.inverter.general }}</span>
              </div>
              <div class="level-item info">
                <span>提示</span>
                <span class="count">{{ alarmData.inverter.info }}</span>
              </div>
            </div>
            <el-button type="primary" size="small" @click="pushWorkOrder('逆变器报警')">推送工单</el-button>
          </div>

          <!-- AI告警 -->
          <div class="alarm-card">
            <div class="alarm-card-header">🤖 AI告警</div>
            <div class="alarm-levels">
              <div class="level-item">
                <span>PV低电流个数</span>
                <span class="count">{{ alarmData.ai.lowCurrent }}</span>
              </div>
              <div class="level-item">
                <span>阴影遮挡个数</span>
                <span class="count">{{ alarmData.ai.shadow }}</span>
              </div>
            </div>
            <el-button type="primary" size="small" @click="pushWorkOrder('AI告警')">推送工单</el-button>
          </div>

          <!-- 运维告警 -->
          <div class="alarm-card">
            <div class="alarm-card-header">🔧 运维告警</div>
            <div class="alarm-levels">
              <div class="level-item">
                <span>污染物严重</span>
                <span class="count">{{ alarmData.ops.pollution }}</span>
              </div>
              <div class="level-item">
                <span>人为损坏</span>
                <span class="count">{{ alarmData.ops.damage }}</span>
              </div>
              <div class="level-item">
                <span>上次运维遗留问题</span>
                <span class="count">{{ alarmData.ops.legacy }}</span>
              </div>
            </div>
            <el-button type="primary" size="small" @click="pushWorkOrder('运维告警')">推送工单</el-button>
          </div>

          <!-- 仪器检测 -->
          <div class="alarm-card">
            <div class="alarm-card-header">🔬 仪器检测</div>
            <div class="alarm-levels">
              <div class="level-item">
                <span>EL检测</span>
                <span class="count">{{ alarmData.instrument.el }}</span>
              </div>
              <div class="level-item">
                <span>裂片</span>
                <span class="count">{{ alarmData.instrument.crack }}</span>
              </div>
              <div class="level-item">
                <span>红外</span>
                <span class="count">{{ alarmData.instrument.ir }}</span>
              </div>
              <div class="level-item">
                <span>热斑检测</span>
                <span class="count">{{ alarmData.instrument.hotspot }}</span>
              </div>
            </div>
            <el-button type="primary" size="small" @click="pushWorkOrder('仪器检测')">推送工单</el-button>
          </div>
        </div>
      </div>

      <!-- 右侧健康评分区 -->
      <div class="right-sidebar">
        <div class="health-score-card">
          <div class="score-value">{{ station.healthScore }}</div>
          <div class="score-label">健康评分</div>
        </div>
      </div>
    </div>

    <!-- 推送工单对话框 -->
    <el-dialog v-model="workOrderVisible" title="推送工单" width="500px">
      <el-form :model="workOrderForm" label-width="100px">
        <el-form-item label="运维人员">
          <el-input v-model="workOrderForm.pusher" />
        </el-form-item>
        <el-form-item label="电站信息">
          <el-input v-model="workOrderForm.stationInfo" disabled />
        </el-form-item>
        <el-form-item label="处理建议">
          <el-input v-model="workOrderForm.suggestion" type="textarea" :rows="4" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="workOrderVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmPush">确认推送</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  stationId: { type: String, default: '' }
})

const station = computed(() => {
  return {
    id: props.stationId,
    healthScore: 86
  }
})

const alarmData = ref({
  inverter: { emergency: 1, general: 2, info: 0 },
  ai: { lowCurrent: 1, shadow: 0 },
  ops: { pollution: 1, damage: 0, legacy: 1 },
  instrument: { el: '正常', crack: '无', ir: '正常', hotspot: '无' }
})

const workOrderVisible = ref(false)
const workOrderForm = reactive({
  pusher: '当前运维人员',
  stationInfo: '',
  suggestion: ''
})
const currentAlarmType = ref('')

const pushWorkOrder = (type) => {
  currentAlarmType.value = type
  workOrderForm.stationInfo = `电站运维检测`
  workOrderForm.suggestion = `针对${type}的建议处理方式...`
  workOrderVisible.value = true
}

const confirmPush = () => {
  ElMessage.success(`工单已推送至故障处理页（${currentAlarmType.value}）`)
  workOrderVisible.value = false
}
</script>

<style scoped>
.exam-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 120px);
}

/* 主布局：左右分栏 */
.main-layout {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  position: relative;
}

.left-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 右侧悬浮 + 垂直/水平居中 */
.right-sidebar {
  width: 280px;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

/* 页面头部 */
.page-header {
  background: #fff;
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.page-title {
  font-size: 18px;
  font-weight: 700;
  color: #1D2129;
  margin: 0;
}

/* 健康评分 */
.health-score-card {
  text-align: center;
  background: linear-gradient(135deg, #67c23a, #85ce61);
  padding: 40px 30px;
  border-radius: 16px;
  color: #fff;
  box-shadow: 0 4px 16px rgba(103, 194, 58, 0.3);
  width: 220px;
}

.score-value {
  font-size: 72px;
  font-weight: 700;
  line-height: 1;
}

.score-label {
  font-size: 18px;
  opacity: 0.9;
  margin-top: 12px;
}

/* 运维清洗频次卡片 */
.ops-frequency-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.card-header {
  margin-bottom: 12px;
}

.card-title {
  font-weight: 600;
  color: #1D2129;
  font-size: 15px;
}

/* 柱状图样式 */
.bar-chart-wrapper {
  display: flex;
  height: 150px;
  margin-top: 8px;
}
.y-axis-labels {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-right: 6px;
  font-size: 10px;
  color: #999;
  height: 120px;
}
.bar-main {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
}
.chart-grid {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 20px;
  background-image: linear-gradient(#f2f3f5 1px, transparent 1px);
  background-size: 100% 24px;
  opacity: 0.8;
}
.bar-group {
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  padding: 0 4px;
}
.bar-item {
  width: 22px;
  background: linear-gradient(to top, #67c23a, #95d475);
  border-radius: 4px 4px 0 0;
  position: relative;
  transition: all 0.3s;
}
.bar-item:hover {
  opacity: 0.8;
}
.bar-num {
  position: absolute;
  top: -14px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  color: #67c23a;
  font-weight: 600;
}
.x-axis-labels {
  display: flex;
  justify-content: space-around;
  font-size: 10px;
  color: #999;
  margin-top: 4px;
}

/* 图表行 */
.charts-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.chart-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.chart-title {
  font-weight: 600;
  margin-bottom: 4px;
  color: #1D2129;
}

.line-chart {
  width: 100%;
  height: 130px;
}

.chart-time-labels {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #999;
  padding: 0 4px;
}

/* 告警区域 */
.alarm-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.alarm-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  transition: all 0.2s ease;
}

.alarm-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
}

.alarm-card-header {
  font-weight: 600;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #f0f0f0;
  color: #1D2129;
}

.alarm-levels {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

.level-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px dashed #f5f5f5;
  color: #4E5969;
  font-size: 14px;
}

.level-item.emergency {
  color: #F53F3F;
}

.level-item.general {
  color: #FF7D00;
}

.level-item.info {
  color: #165DFF;
}

.count {
  font-weight: 700;
  font-size: 16px;
}

/* 响应式 */
@media screen and (max-width: 1400px) {
  .alarm-section {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media screen and (max-width: 1200px) {
  .main-layout {
    flex-direction: column;
  }
  .right-sidebar {
    width: 100%;
    height: auto;
    position: static;
    padding: 20px 0;
  }
  .health-score-card {
    padding: 24px;
    width: 200px;
  }
  .score-value {
    font-size: 48px;
  }
}

@media screen and (max-width: 768px) {
  .alarm-section,
  .charts-row {
    grid-template-columns: 1fr;
  }
}
</style>