```vue
<template>
  <!-- 电站状态卡片 1:1还原原图 -->
  <div class="station-status-card">
    <!-- 顶部标题 -->
    <div class="card-title">电站状态</div>

    <!-- 内容区：左右Flex布局（左圆环+右侧图例） -->
    <div class="card-content">
      <!-- 左侧：环形仪表盘区域 -->
      <div class="ring-container">
        <!-- ECharts环形空心圆环容器 -->
        <div class="ring-chart" ref="ringChartRef"></div>
        <!-- 圆环中心居中文字 -->
        <div class="ring-center-text">
          <div class="center-num">2</div>
          <div class="center-desc">电站总数</div>
        </div>
      </div>

      <!-- 右侧：垂直图例列表 -->
      <div class="legend-list">
        <div class="legend-item">
          <span class="legend-dot normal"></span>
          <span class="legend-num">2</span>
          <span class="legend-text">正常电站</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot fault"></span>
          <span class="legend-num">0</span>
          <span class="legend-text">故障电站</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot offline"></span>
          <span class="legend-num">0</span>
          <span class="legend-text">断连电站</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'

// 圆环图表ref
const ringChartRef = ref(null)

// 初始化ECharts空心环形仪表盘（完全对应原图绿色圆环）
onMounted(() => {
  const chart = echarts.init(ringChartRef.value)
  const option = {
    backgroundColor: 'transparent',
    series: [
      {
        type: 'pie',
        radius: ['85%', '95%'], // 空心圆环粗细，对应原图粗绿环
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 0,
          borderWidth: 0
        },
        label: { show: false },
        emphasis: { label: { show: false } },
        data: [
          // 正常电站占满全部，显示完整绿色圆环
          { value: 2, name: '正常', itemStyle: { color: '#32C832' } },
          { value: 0, name: '故障', itemStyle: { color: '#F53F3F' } },
          { value: 0, name: '断连', itemStyle: { color: '#999999' } }
        ]
      }
    ]
  }
  chart.setOption(option)
})
</script>

<style scoped>
/* 卡片外层容器：深蓝色科技背景 1:1还原原图 */
.station-status-card {
  width: 100%;
  height: 100%;
  background: #0F3476 url('data:image/svg+xml;utf8,<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><path d="M0 100 L200 100 M100 0 L100 200" stroke="rgba(255,255,255,0.1)" stroke-width="1"/></svg>');
  background-size: 80px 80px;
  padding: 40px 30px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 40px;
}

/* 顶部标题 */
.card-title {
  font-size: 48px;
  color: #ffffff;
  font-weight: 500;
  text-align: left;
}

/* 内容区：左右Flex水平布局 */
.card-content {
  display: flex;
  align-items: center;
  justify-content: space-around;
  flex: 1;
  gap: 60px;
}

/* 左侧圆环容器：相对定位，中心文字绝对居中 */
.ring-container {
  position: relative;
  width: 420px;
  height: 420px;
}

.ring-chart {
  width: 100%;
  height: 100%;
}

/* 圆环中心双层文字 完全对应原图 */
.ring-center-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.center-num {
  font-size: 80px;
  color: #ffffff;
  font-weight: 600;
}

.center-desc {
  font-size: 32px;
  color: #ffffff;
  opacity: 0.8;
}

/* 右侧图例：垂直竖向列布局 */
.legend-list {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* 单个图例项：圆点+数字+文字 水平对齐 */
.legend-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.legend-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
}

.legend-dot.normal {
  background-color: #32C832;
}
.legend-dot.fault {
  background-color: #F53F3F;
}
.legend-dot.offline {
  background-color: #999999;
}

.legend-num {
  font-size: 48px;
  color: #ffffff;
  font-weight: 500;
  width: 60px;
}

.legend-text {
  font-size: 32px;
  color: #ffffff;
  opacity: 0.9;
}
</style>