<template>
  <div class="page-container">
    <!-- 1. 顶部状态条 -->
    <header class="header">
      <div class="header-left">
        <div class="icon-box">
          <ZapIcon class="icon-primary" :size="24" />
        </div>
        <div>
          <div class="breadcrumbs">{{ inverterData.stationName }} / 逆变器详情</div>
          <h1 class="page-title">{{ inverterData.name }}</h1>
        </div>
      </div>

      <div class="header-right">
        <div class="status-badge">
          <span class="status-dot">
            <span class="status-ping"></span>
          </span>
          <span>{{ inverterData.status }}</span>
        </div>
        <button @click="handleRefresh" class="refresh-btn">
          <RefreshCwIcon :class="{'spin': isRefreshing}" class="refresh-icon" :size="20" />
        </button>
      </div>
    </header>

    <!-- 2. 核心指标卡片 -->
    <div class="kpi-grid">
      <div v-for="(kpi, index) in kpiMetrics" :key="index" class="kpi-card">
        <div class="kpi-bg">
          <component :is="kpi.icon" :size="80" />
        </div>
        <div class="kpi-content">
          <p class="kpi-label">
            <component :is="kpi.icon" :size="16" class="icon-primary mr-1" />
            {{ kpi.label }}
          </p>
          <div class="kpi-value">
            <span class="num">{{ kpi.value }}</span>
            <span class="unit">{{ kpi.unit }}</span>
          </div>
          <div v-if="kpi.trend" class="kpi-trend">
            <TrendingUpIcon :size="12" /> {{ kpi.trend }}
          </div>
        </div>
      </div>
    </div>

    <!-- 3. 可视化区域 -->
    <div class="visual-grid">
      <!-- 左侧3D模型 -->
      <div class="model-card">
        <div class="card-title">
          <BoxIcon :size="16" class="icon-primary mr-1" /> 数字孪生实时预览
        </div>
        <div class="model-content">
          <div class="inverter-3d">
            <div class="inverter-body">
              <div class="inverter-top"></div>
              <div class="inverter-grid">
                <div class="grid-item pulse"></div>
                <div class="grid-item"></div>
                <div class="grid-item"></div>
                <div class="grid-item pulse"></div>
              </div>
              <div class="energy-flow"></div>
            </div>
            <div class="model-tag">型号: {{ inverterData.deviceModel }}</div>
          </div>
        </div>
      </div>

      <!-- 右侧图表 -->
      <div class="chart-card">
        <div class="card-title flex-between">
          <div>
            <ActivityIcon :size="16" class="icon-primary mr-1" /> 今日实时功率负载 (kW)
          </div>
          <span class="update-time">更新于: {{ inverterData.updateTime }}</span>
        </div>
        <!-- 修复ECharts宽高问题 -->
        <div ref="chartRef" class="chart-container"></div>
      </div>
    </div>

    <!-- 4. 参数与生命周期 -->
    <div class="info-grid">
      <div class="spec-card">
        <h2 class="section-title">技术参数详情</h2>
        <div class="spec-grid">
          <div v-for="(val, key) in technicalSpecs" :key="key" class="spec-item">
            <span class="spec-label">{{ val.label }}</span>
            <div>
              <span class="spec-value">{{ val.value }}</span>
              <CopyIcon 
                v-if="val.copyable" 
                @click="copyText(val.value)"
                class="copy-icon" 
                :size="14" 
              />
            </div>
          </div>
        </div>
      </div>

      <div class="life-card">
        <h2 class="section-title">生命周期管理</h2>
        <div class="warranty-box">
          <div class="flex-between text-sm">
            <span>质保服务进度</span>
            <span class="text-primary">{{ warrantyPercent }}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{width: warrantyPercent + '%'}"></div>
          </div>
          <div class="flex-between text-xs text-gray">
            <span>投产: {{ inverterData.commissionDate }}</span>
            <span>到期: {{ inverterData.warrantyDate }}</span>
          </div>
        </div>

        <div class="hours-box">
          <p class="text-xs uppercase text-gray">Total Equivalent Hours</p>
          <span class="hours-num">{{ inverterData.totalEquivHours }} <small>h</small></span>
          <div class="text-center mt-2">
            <p class="text-xs text-gray">数据戳</p>
            <p class="text-sm">{{ inverterData.timestamp }}</p>
          </div>
        </div>
        <ShieldCheckIcon class="life-bg" :size="120" />
      </div>
    </div>

    <!-- 底部信息 -->
    <footer class="footer">
      <div>
        <MapPinIcon :size="14" class="icon-primary mr-1" />
        安装地址：{{ inverterData.address }}
      </div>
      <div>
        <span>数据 ID: {{ inverterData.dataId }}</span>
        <span class="dot"></span>
        <span>额定功率: {{ inverterData.ratedPower }}kW</span>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted, nextTick } from 'vue';
import * as echarts from 'echarts';
import { 
  ZapIcon, ActivityIcon, BoxIcon, RefreshCwIcon, TrendingUpIcon, 
  ClockIcon, ShieldCheckIcon, CopyIcon, MapPinIcon,
  SunIcon, DatabaseIcon
} from 'lucide-vue-next';

// 图表DOM引用
const chartRef = ref(null);
let powerChart = null;

// 模拟数据
const inverterData = ref({
  name: 'SN-INV-2024-0892',
  stationName: '龙源青海格尔木一号电站',
  status: '运行中',
  realtimePower: 452.8,
  dailyGeneration: 1240.5,
  dailyEquivHours: 5.2,
  totalGeneration: 892.4,
  sn: 'INV-A88-293-XP',
  dataId: 'DID-900321',
  deviceModel: 'SUN2000-196KTL-H3',
  productModel: 'KTL-Industrial-V3',
  ratedPower: 200,
  address: '青海省海西蒙古族藏族自治州格尔木市东郊戈壁滩 03区',
  commissionDate: '2022-05-20',
  warrantyDate: '2027-05-20',
  timestamp: '1711362000',
  updateTime: new Date().toLocaleString(),
  totalEquivHours: 14208
});

// KPI指标
const kpiMetrics = computed(() => [
  { label: '实时功率', value: inverterData.value.realtimePower, unit: 'kW', icon: ZapIcon, trend: '+2.4%' },
  { label: '当日电量', value: inverterData.value.dailyGeneration, unit: 'kWh', icon: SunIcon, trend: '+5.1%' },
  { label: '当日等效小时', value: inverterData.value.dailyEquivHours, unit: 'h', icon: ClockIcon },
  { label: '累计电量', value: inverterData.value.totalGeneration, unit: 'MWh', icon: DatabaseIcon }
]);

// 技术参数
const technicalSpecs = computed(() => ({
  sn: { label: '逆变器 SN 码', value: inverterData.value.sn, copyable: true },
  dataId: { label: '通讯数据 ID', value: inverterData.value.dataId, copyable: false },
  deviceModel: { label: '设备型号', value: inverterData.value.deviceModel, copyable: false },
  productModel: { label: '产品型号', value: inverterData.value.productModel, copyable: false },
  ratedPower: { label: '额定输出功率', value: inverterData.value.ratedPower + ' kW', copyable: false },
  address: { label: '经纬度坐标', value: '36.402, 94.903', copyable: false }
}));

// 质保进度
const warrantyPercent = computed(() => {
  const start = new Date(inverterData.value.commissionDate).getTime();
  const end = new Date(inverterData.value.warrantyDate).getTime();
  const now = new Date().getTime();
  const progress = ((now - start) / (end - start)) * 100;
  return Math.min(Math.round(progress), 100);
});

// 交互
const isRefreshing = ref(false);
const handleRefresh = () => {
  isRefreshing.value = true;
  setTimeout(() => {
    isRefreshing.value = false;
    inverterData.value.updateTime = new Date().toLocaleString();
    inverterData.value.realtimePower = (450 + Math.random() * 20).toFixed(1);
  }, 1000);
};

// 复制文本
const copyText = (text) => {
  navigator.clipboard.writeText(text);
  alert('已复制：' + text);
};

// 初始化图表（修复宽高问题）
const initChart = async () => {
  await nextTick();
  if (!chartRef.value) return;
  
  powerChart = echarts.init(chartRef.value);
  const option = {
    color: ['#0066CC'],
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '5%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00']
    },
    yAxis: { type: 'value' },
    series: [{
      name: '功率',
      type: 'line',
      smooth: true,
      data: [120, 280, 410, 480, 452, 320, 150]
    }]
  };
  powerChart.setOption(option);
};

// 生命周期
onMounted(() => {
  initChart();
  window.addEventListener('resize', () => powerChart?.resize());
});

onUnmounted(() => {
  window.removeEventListener('resize', () => powerChart?.resize());
  powerChart?.dispose();
});
</script>

<style scoped>
/* 全局页面样式 */
.page-container {
  min-height: 100vh;
  background: #F5F7FA;
  padding: 24px;
  font-family: sans-serif;
  color: #333;
}

/* 头部 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}
.icon-box {
  background: white;
  padding: 8px;
  border-radius: 12px;
}
.breadcrumbs {
  font-size: 12px;
  color: #666;
}
.page-title {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}
.status-badge {
  background: white;
  padding: 8px 16px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #eee;
}
.status-dot {
  width: 12px;
  height: 12px;
  background: #10B981;
  border-radius: 50%;
  position: relative;
}
.status-ping {
  position: absolute;
  width: 100%;
  height: 100%;
  background: #10B981;
  border-radius: 50%;
  animation: ping 2s infinite;
}
.refresh-btn {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
}
.spin {
  animation: spin 1s linear infinite;
}

/* KPI卡片 */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}
.kpi-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  transition: 0.3s;
}
.kpi-bg {
  position: absolute;
  right: -10px;
  bottom: -10px;
  color: #E6F0FF;
}
.kpi-label {
  font-size: 14px;
  color: #666;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
}
.kpi-value {
  display: flex;
  align-items: baseline;
  gap: 4px;
}
.num {
  font-size: 24px;
  font-weight: bold;
}
.unit {
  font-size: 12px;
  color: #666;
}
.kpi-trend {
  font-size: 10px;
  color: #10B981;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 2px;
}

/* 可视化区域 */
.visual-grid {
  display: grid;
  grid-template-columns: 5fr 7fr;
  gap: 24px;
  margin-bottom: 24px;
}
.model-card, .chart-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  min-height: 400px;
}
.card-title {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}
.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.update-time {
  font-size: 10px;
  background: #F5F7FA;
  padding: 4px 8px;
  border-radius: 4px;
  color: #666;
}
.chart-container {
  width: 100%;
  height: 320px;
}

/* 3D模型 */
.model-content {
  width: 100%;
  height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(to bottom right, white, #E6F0FF);
}
.inverter-3d {
  position: relative;
  transform: rotateY(-15deg) rotateX(10deg);
}
.inverter-body {
  width: 192px;
  height: 256px;
  background: #E5E7EB;
  border-radius: 8px;
  border: 4px solid white;
  padding: 16px;
  position: relative;
  overflow: hidden;
}
.inverter-top {
  height: 40px;
  background: #1F2937;
  border-radius: 4px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.inverter-top::after {
  content: '';
  width: 48px;
  height: 4px;
  background: #00CCFF;
}
.inverter-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.grid-item {
  height: 40px;
  background: #D1D5DB;
  border-radius: 4px;
}
.pulse {
  animation: pulse 2s infinite;
}
.energy-flow {
  position: absolute;
  top: 0;
  left: -100%;
  width: 200%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0,102,204,0.1), transparent);
  animation: flow 3s infinite linear;
}
.model-tag {
  position: absolute;
  top: 40px;
  right: -40px;
  background: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  border: 1px solid #0066CC33;
}

/* 参数卡片 */
.info-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}
.spec-card, .life-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  position: relative;
}
.section-title {
  font-size: 16px;
  font-weight: bold;
  border-left: 4px solid #0066CC;
  padding-left: 8px;
  margin-bottom: 24px;
}
.spec-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 32px;
}
.spec-item {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #F5F5F5;
  padding-bottom: 8px;
}
.spec-label {
  font-size: 14px;
  color: #666;
}
.spec-value {
  font-size: 14px;
  font-weight: 500;
}
.copy-icon {
  color: #999;
  cursor: pointer;
  margin-left: 4px;
}

/* 生命周期 */
.warranty-box {
  margin-bottom: 24px;
}
.progress-bar {
  height: 8px;
  background: #F5F7FA;
  border-radius: 4px;
  overflow: hidden;
  margin: 8px 0;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(to right, #0066CC, #00CCFF);
  transition: 1s;
}
.hours-box {
  background: #F5F7FA;
  padding: 16px;
  border-radius: 12px;
  text-align: center;
  border: 1px dashed #E5E7EB;
}
.hours-num {
  font-size: 32px;
  font-weight: bold;
  margin: 8px 0;
}
.life-bg {
  position: absolute;
  bottom: -20px;
  right: -20px;
  color: #F9FAFB;
}

/* 底部 */
.footer {
  margin-top: 24px;
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
}
.dot {
  width: 4px;
  height: 4px;
  background: #999;
  border-radius: 50%;
  display: inline-block;
  margin: 0 8px;
}

/* 工具类 */
.icon-primary {
  color: #0066CC;
}
.text-primary {
  color: #0066CC;
}
.text-gray {
  color: #999;
}
.text-sm { font-size: 12px; }
.text-xs { font-size: 10px; }
.mr-1 { margin-right: 4px; }

/* 动画 */
@keyframes ping {
  75%, 100% { transform: scale(2); opacity: 0; }
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
@keyframes flow {
  from { transform: translateX(-50%); }
  to { transform: translateX(50%); }
}

/* 响应式 */
@media (max-width: 1024px) {
  .kpi-grid { grid-template-columns: repeat(2, 1fr); }
  .visual-grid { grid-template-columns: 1fr; }
  .info-grid { grid-template-columns: 1fr; }
}
</style>