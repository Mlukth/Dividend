<template>
  <div class="preview-wrapper">
    <h2 class="preview-title">发电信息顶部 - 新样式预览（字体放大+呼吸灯）</h2>
    <div class="merged-card-box">
      <div class="gauge-card-small">
        <div class="gauge-wrapper">
          <div class="gauge-chart" ref="gaugeRef"></div>
          <div class="power-val-text">
            <div class="power-capacity">组件总容量：{{ totalCapacity }} kWp</div>
          </div>
        </div>
      </div>
      <div class="kpi-card-wide">
        <div class="kpi-grid-3col-wide">
          <!-- 当日发电量 -->
          <div class="data-card">
            <span class="card-label">当日发电量</span>
            <span class="card-value">2300<span class="card-unit">kWh</span></span>
            <div class="card-grid-2x2">
              <div class="grid-cell">
                <div class="cell-label">较昨日同期</div>
                <div class="cell-value">--</div>
              </div>
              <div class="grid-cell">
                <div class="cell-label">累计发电量</div>
                <div class="cell-value">544060 kWh</div>
              </div>
            </div>
          </div>

          <!-- 当日收益 -->
          <div class="data-card">
            <span class="card-label">当日收益</span>
            <span class="card-value">¥ 1040</span>
            <div class="card-grid-2x2">
              <div class="grid-cell">
                <div class="cell-label">当年收益</div>
                <div class="cell-value">-- 元</div>
              </div>
              <div class="grid-cell">
                <div class="cell-label">累计</div>
                <div class="cell-value">-- 元</div>
              </div>
              <div class="grid-cell">
                <div class="cell-label">上网电价</div>
                <div class="cell-value">0.4 元/kWh</div>
              </div>
              <div class="grid-cell">
                <div class="cell-label">自用电价</div>
                <div class="cell-value">0.6 元/kWh</div>
              </div>
            </div>
          </div>

          <!-- 系统运行状态（呼吸灯） -->
          <div class="data-card">
            <span class="card-label">系统运行状态</span>
            <span class="card-status">
              <span class="status-dot green breathing"></span>运行中
            </span>
            <div class="card-grid-2x2">
              <div class="grid-cell">
                <div class="cell-label">告警数量</div>
                <div class="cell-value">0</div>
              </div>
              <div class="grid-cell">
                <div class="cell-label">逆变器</div>
                <div class="cell-value">6/6</div>
              </div>
              <div class="grid-cell">
                <div class="cell-label">日满发小时</div>
                <div class="cell-value">3.04 h</div>
              </div>
              <div class="grid-cell">
                <div class="cell-label">实时功率占比</div>
                <div class="cell-value">0.0%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'

const gaugeRef = ref(null)
const totalCapacity = ref(500)
const realPower = 0.12

onMounted(() => {
  initGauge()
})

const initGauge = () => {
  if (!gaugeRef.value) return
  const chart = echarts.init(gaugeRef.value)
  chart.setOption({
    backgroundColor: 'transparent',
    series: [{
      type: 'gauge',
      center: ['50%', '55%'],
      radius: '78%',
      startAngle: 200,
      endAngle: -20,
      min: 0,
      max: totalCapacity.value,
      splitNumber: 5,
      axisLabel: {
        distance: -20,
        fontSize: 9,
        color: '#aaa',
        formatter: (val) => {
          const percent = ((val / totalCapacity.value) * 100).toFixed(0)
          return percent + '%'
        }
      },
      axisTick: { distance: -15, length: 6, lineStyle: { color: '#ccc' } },
      splitLine: { distance: -15, length: 10, lineStyle: { color: '#ccc' } },
      axisLine: { lineStyle: { width: 12, color: [[1, '#e9eef4']] } },
      progress: { show: true, width: 12, itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: '#ff9a42' }, { offset: 1, color: '#ff6b00' }]) } },
      pointer: { length: '55%', width: 5, itemStyle: { color: '#ff6b00' } },
      anchor: { size: 12, itemStyle: { color: '#ff6b00' } },
      title: { show: false },
      detail: { fontSize: 22, fontWeight: 700, color: '#ff6b00', offsetCenter: [0, '35%'], formatter: '{value} kW' },
      data: [{ value: realPower }]
    }]
  })
}
</script>

<style scoped>
.preview-wrapper { padding: 24px; background: #f0f2f5; min-height: 100vh; }
.preview-title { font-size: 20px; font-weight: 700; margin-bottom: 24px; color: #1a1a2e; }

.merged-card-box {
  background: #fff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  padding: 0; width: 100%; display: flex; flex-wrap: wrap;
}

.gauge-card-small {
  flex: 0 0 280px; height: 300px; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
}
.gauge-wrapper { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; height: 100%; width: 100%; }
.gauge-chart { width: 260px; height: 260px; }
.power-val-text { text-align: center; }
.power-capacity { font-size: 14px; color: #666; }

.kpi-card-wide { flex: 1; height: 300px; display: flex; align-items: center; }
.kpi-grid-3col-wide {
  width: 100%; display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; padding: 16px 20px;
}

.data-card {
  width: 100%; min-width: 160px; padding: 20px 12px; background: #F8F9FA;
  border-radius: 12px; box-sizing: border-box; display: flex; flex-direction: column;
  align-items: center; gap: 8px; cursor: pointer; transition: all 0.3s;
}
.data-card:hover { transform: translateY(-4px); box-shadow: 0 8px 20px rgba(255, 122, 24, 0.15); }

.card-label { font-size: 15px; color: #666; }
.card-value { font-size: 28px; font-weight: bold; color: #1D2129; }
.card-unit { font-size: 14px; font-weight: normal; color: #666; margin-left: 4px; }

.card-status {
  display: flex; align-items: center; gap: 8px; font-size: 18px; font-weight: bold; color: #52c41a; margin-bottom: 4px;
}

.status-dot {
  width: 10px; height: 10px; border-radius: 50%;
  background: #52c41a;
  box-shadow: 0 0 0 4px rgba(82, 196, 26, 0.2);
}
.status-dot.green { background: #52c41a; }

/* 呼吸灯动画 */
.breathing {
  animation: breathe 1.5s ease-in-out infinite;
}
@keyframes breathe {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.3); }
}

/* 2x2 网格 */
.card-grid-2x2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 14px;      /* 稍微加大间距 */
  width: 100%;
  margin-top: 4px;
}

.grid-cell {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.cell-label {
  font-size: 14px;      /* 从12px加大到14px */
  color: #888;
  margin-bottom: 3px;
  white-space: nowrap;
}

.cell-value {
  font-size: 16px;      /* 从13px加大到16px，更清晰 */
  font-weight: 600;
  color: #1D2129;
  white-space: nowrap;
}
</style>