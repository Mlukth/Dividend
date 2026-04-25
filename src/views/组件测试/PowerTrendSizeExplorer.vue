<template>
  <div class="explorer-page">
    <h2 class="explorer-title">发电功率趋势 - 图表尺寸方案对比</h2>
    <p class="explorer-desc">
      当前页面缩放比例 67%，原图表高度 580px 过大，一页放不下。<br>
      下面依次展示 4 种高度方案（580px原版 / 450px / 380px / 300px），均保留日/月/年/总切换和日期选择功能。<br>
      美术风格继续沿用当前项目：白色圆角卡片、橙色系图表、浅灰背景。
    </p>

    <!-- 方案1：原版 580px -->
    <div class="scheme-section">
      <h3 class="scheme-label">方案1：图表高度 580px（原版，供参照）</h3>
      <div class="chart-card">
        <div class="card-header space-between">
          <span class="card-title">📈 发电功率趋势</span>
          <div class="chart-tools">
            <el-radio-group v-model="dateType1" size="small" @change="() => updateChart(1)">
              <el-radio-button value="day">日</el-radio-button>
              <el-radio-button value="month">月</el-radio-button>
              <el-radio-button value="year">年</el-radio-button>
              <el-radio-button value="total">总</el-radio-button>
            </el-radio-group>
            <el-date-picker
              v-model="selectDate1"
              :type="dateType1 === 'month' ? 'month' : 'date'"
              placeholder="选择日期"
              size="small"
            />
          </div>
        </div>
        <div class="chart-body chart-h-580" ref="chart1Ref"></div>
      </div>
    </div>

    <!-- 方案2：450px -->
    <div class="scheme-section">
      <h3 class="scheme-label">方案2：图表高度 450px（缩小约22%）</h3>
      <div class="chart-card">
        <div class="card-header space-between">
          <span class="card-title">📈 发电功率趋势</span>
          <div class="chart-tools">
            <el-radio-group v-model="dateType2" size="small" @change="() => updateChart(2)">
              <el-radio-button value="day">日</el-radio-button>
              <el-radio-button value="month">月</el-radio-button>
              <el-radio-button value="year">年</el-radio-button>
              <el-radio-button value="total">总</el-radio-button>
            </el-radio-group>
            <el-date-picker
              v-model="selectDate2"
              :type="dateType2 === 'month' ? 'month' : 'date'"
              placeholder="选择日期"
              size="small"
            />
          </div>
        </div>
        <div class="chart-body chart-h-450" ref="chart2Ref"></div>
      </div>
    </div>

    <!-- 方案3：380px -->
    <div class="scheme-section">
      <h3 class="scheme-label">方案3：图表高度 380px（缩小约35%）</h3>
      <div class="chart-card">
        <div class="card-header space-between">
          <span class="card-title">📈 发电功率趋势</span>
          <div class="chart-tools">
            <el-radio-group v-model="dateType3" size="small" @change="() => updateChart(3)">
              <el-radio-button value="day">日</el-radio-button>
              <el-radio-button value="month">月</el-radio-button>
              <el-radio-button value="year">年</el-radio-button>
              <el-radio-button value="total">总</el-radio-button>
            </el-radio-group>
            <el-date-picker
              v-model="selectDate3"
              :type="dateType3 === 'month' ? 'month' : 'date'"
              placeholder="选择日期"
              size="small"
            />
          </div>
        </div>
        <div class="chart-body chart-h-380" ref="chart3Ref"></div>
      </div>
    </div>

    <!-- 方案4：300px -->
    <div class="scheme-section">
      <h3 class="scheme-label">方案4：图表高度 300px（缩小约48%，极限压缩）</h3>
      <div class="chart-card">
        <div class="card-header space-between">
          <span class="card-title">📈 发电功率趋势</span>
          <div class="chart-tools">
            <el-radio-group v-model="dateType4" size="small" @change="() => updateChart(4)">
              <el-radio-button value="day">日</el-radio-button>
              <el-radio-button value="month">月</el-radio-button>
              <el-radio-button value="year">年</el-radio-button>
              <el-radio-button value="total">总</el-radio-button>
            </el-radio-group>
            <el-date-picker
              v-model="selectDate4"
              :type="dateType4 === 'month' ? 'month' : 'date'"
              placeholder="选择日期"
              size="small"
            />
          </div>
        </div>
        <div class="chart-body chart-h-300" ref="chart4Ref"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'

const dateType1 = ref('day')
const dateType2 = ref('day')
const dateType3 = ref('day')
const dateType4 = ref('day')
const selectDate1 = ref(new Date())
const selectDate2 = ref(new Date())
const selectDate3 = ref(new Date())
const selectDate4 = ref(new Date())

const chart1Ref = ref(null)
const chart2Ref = ref(null)
const chart3Ref = ref(null)
const chart4Ref = ref(null)
const chartInstances = ref([])

const powerDataByType = {
  day: {
    xAxis: ['00:00','02:00','04:00','06:00','08:00','10:00','12:00','14:00','16:00','18:00','20:00','22:00'],
    data: [0, 0, 0, 0, 220, 780, 1200, 980, 650, 320, 0, 0]
  },
  month: {
    xAxis: ['1日','5日','10日','15日','20日','25日','30日'],
    data: [4200, 4800, 5100, 3900, 4600, 5200, 4500]
  },
  year: {
    xAxis: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
    data: [120, 135, 158, 175, 198, 220, 245, 238, 195, 165, 140, 118]
  },
  total: {
    xAxis: ['2022','2023','2024','2025','2026'],
    data: [850, 920, 980, 1050, 972]
  }
}

const makeChart = (dom, type) => {
  if (!dom) return null
  const existing = echarts.getInstanceByDom(dom)
  if (existing) existing.dispose()
  const chart = echarts.init(dom)
  const config = powerDataByType[type]
  chart.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(50, 50, 50, 0.9)',
      textStyle: { color: '#fff', fontSize: 13 },
      padding: [10, 14],
      axisPointer: { type: 'cross', lineStyle: { color: '#ff9a42', type: 'dashed' } }
    },
    legend: { bottom: 10, left: 'center', itemIcon: 'diamond', textStyle: { color: '#ff9a42' }, data: ['功率'] },
    grid: { left: '3%', right: '3%', top: '5%', bottom: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#666', fontSize: 11 },
      data: config.xAxis
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#f0f0f0' } },
      axisLabel: { color: '#666', fontSize: 11 }
    },
    series: [{
      name: '功率',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      animation: false,
      itemStyle: { color: '#ff9a42' },
      lineStyle: { color: '#ff9a42', width: 3 },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(255,154,66,0.3)' },
          { offset: 1, color: 'rgba(255,154,66,0.05)' }
        ])
      },
      data: config.data
    }]
  })
  return chart
}

const updateChart = (idx) => {
  const typeMap = { 1: dateType1.value, 2: dateType2.value, 3: dateType3.value, 4: dateType4.value }
  const refMap = { 1: chart1Ref.value, 2: chart2Ref.value, 3: chart3Ref.value, 4: chart4Ref.value }
  makeChart(refMap[idx], typeMap[idx])
}

onMounted(() => {
  nextTick(() => {
    chartInstances.value = [
      makeChart(chart1Ref.value, 'day'),
      makeChart(chart2Ref.value, 'day'),
      makeChart(chart3Ref.value, 'day'),
      makeChart(chart4Ref.value, 'day')
    ]
  })
})

onUnmounted(() => {
  chartInstances.value.forEach(c => { if (c && !c.isDisposed()) c.dispose() })
})
</script>

<style scoped>
.explorer-page {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fb 0%, #e8ecf0 100%);
  padding: 24px;
  box-sizing: border-box;
  font-family: "Microsoft YaHei", sans-serif;
}
.explorer-title { font-size: 22px; font-weight: 700; color: #1a1a2e; margin-bottom: 8px; }
.explorer-desc { font-size: 14px; color: #86909c; margin-bottom: 32px; line-height: 1.6; }
.scheme-section { margin-bottom: 32px; }
.scheme-label { font-size: 16px; font-weight: 600; color: #1D2129; margin-bottom: 12px; padding: 8px 16px; background: #fff; border-radius: 8px; display: inline-block; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }

/* 图表卡片 */
.chart-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  padding: 20px;
  width: 100%;
  box-sizing: border-box;
}
.card-header { display: flex; align-items: center; margin-bottom: 12px; }
.space-between { justify-content: space-between; }
.card-title { font-size: 16px; font-weight: 700; color: #1a1a2e; }
.chart-tools { display: flex; gap: 10px; align-items: center; }

/* 图表高度变体 */
.chart-body { width: 100%; }
.chart-h-580 { height: 580px; }
.chart-h-450 { height: 450px; }
.chart-h-380 { height: 380px; }
.chart-h-300 { height: 300px; }
</style>