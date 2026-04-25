<template>
  <div class="explorer-page">
    <h2 class="explorer-title">发电信息 - 仪表盘 & KPI卡片 & 趋势图 综合方案对比</h2>
    <p class="explorer-desc">
      所有方案均继承当前代码的美术风格（浅灰圆角卡片、hover上浮、橙色系仪表盘）<br>
      字段完整覆盖：当日发电量（含较昨日同期+累计）、当日收益（含电价+年/累计收益）、系统运行状态<br>
      仪表盘优化：圆环刻度数字只显示整数<br>
      点击左下「趋势图高度」可统一切换所有方案的图表尺寸，方便对比
    </p>

    <!-- 统一切换器（可折叠，默认展开） -->
    <div class="trend-height-switcher" :class="{ collapsed: switcherCollapsed }">
      <div class="switcher-trigger" @click="switcherCollapsed = !switcherCollapsed">
        <el-icon :size="16" class="switcher-arrow">
          <ArrowRight v-if="switcherCollapsed" />
          <ArrowDown v-else />
        </el-icon>
        <span class="switcher-label">趋势图高度</span>
      </div>
      <div v-show="!switcherCollapsed" class="switcher-content">
        <el-radio-group v-model="trendHeight" size="small" @change="onTrendHeightChange">
          <el-radio-button :value="580">580px</el-radio-button>
          <el-radio-button :value="450">450px</el-radio-button>
          <el-radio-button :value="380">380px</el-radio-button>
          <el-radio-button :value="300">300px</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <!-- 方案A -->
    <div class="scheme-section">
      <h3 class="scheme-label">方案A：仪表盘420px × 400px + 右侧3列卡片</h3>
      <div class="s-merged-card">
        <div class="s-gauge-a">
          <div class="s-gauge-chart" ref="gaugeARef"></div>
          <div class="s-gauge-capacity">组件总容量：755.16 kWp</div>
        </div>
        <div class="s-kpi-3col">
          <div class="s-kpi-item">
            <div class="s-kpi-label">当日发电量</div>
            <div class="s-kpi-val">2846<span>kWh</span></div>
            <div class="s-kpi-trend"><span class="trend-up">↑ 5.2%</span><span class="trend-desc">较昨日同期</span></div>
            <div class="s-kpi-desc">累计发电量：128500 kWh</div>
          </div>
          <div class="s-kpi-item">
            <div class="s-kpi-label">当日收益</div>
            <div class="s-kpi-val">¥ 1138.4</div>
            <div class="s-kpi-desc">当年收益：45200 元<br>累计收益：128500 元</div>
            <div class="s-kpi-price">上网电价：0.4 元/kWh<br>自用电价：0.6 元/kWh</div>
          </div>
          <div class="s-kpi-item">
            <div class="s-kpi-label">系统运行状态</div>
            <div class="s-kpi-status"><span class="s-dot green"></span>运行中</div>
            <div class="s-kpi-alarm">当前告警数量 <span class="alarm-zero">0</span></div>
            <div class="s-kpi-desc">设备通信状态：✅ 全部在线<br>逆变器在线数/总数：6/6</div>
          </div>
        </div>
      </div>
      <div class="trend-chart-card">
        <div class="card-header space-between">
          <span class="card-title">📈 发电功率趋势</span>
          <div class="chart-tools">
            <el-radio-group v-model="trendTypeA" size="small" @change="() => renderTrendChart('A')">
              <el-radio-button value="day">日</el-radio-button>
              <el-radio-button value="month">月</el-radio-button>
              <el-radio-button value="year">年</el-radio-button>
              <el-radio-button value="total">总</el-radio-button>
            </el-radio-group>
            <el-date-picker v-model="trendDateA" :type="trendTypeA === 'month' ? 'month' : 'date'" placeholder="选择日期" size="small" />
          </div>
        </div>
        <div class="trend-chart-body" :style="{ height: trendHeight + 'px' }" ref="trendARef"></div>
      </div>
    </div>

    <!-- 方案B -->
    <div class="scheme-section">
      <h3 class="scheme-label">方案B：仪表盘320px × 340px + 右侧3列卡片（仪表盘缩小）</h3>
      <div class="s-merged-card">
        <div class="s-gauge-b">
          <div class="s-gauge-chart" ref="gaugeBRef"></div>
          <div class="s-gauge-capacity">组件总容量：755.16 kWp</div>
        </div>
        <div class="s-kpi-3col">
          <div class="s-kpi-item">
            <div class="s-kpi-label">当日发电量</div>
            <div class="s-kpi-val">2846<span>kWh</span></div>
            <div class="s-kpi-trend"><span class="trend-up">↑ 5.2%</span><span class="trend-desc">较昨日同期</span></div>
            <div class="s-kpi-desc">累计发电量：128500 kWh</div>
          </div>
          <div class="s-kpi-item">
            <div class="s-kpi-label">当日收益</div>
            <div class="s-kpi-val">¥ 1138.4</div>
            <div class="s-kpi-desc">当年收益：45200 元<br>累计收益：128500 元</div>
            <div class="s-kpi-price">上网电价：0.4 元/kWh<br>自用电价：0.6 元/kWh</div>
          </div>
          <div class="s-kpi-item">
            <div class="s-kpi-label">系统运行状态</div>
            <div class="s-kpi-status"><span class="s-dot green"></span>运行中</div>
            <div class="s-kpi-alarm">当前告警数量 <span class="alarm-zero">0</span></div>
            <div class="s-kpi-desc">设备通信状态：✅ 全部在线<br>逆变器在线数/总数：6/6</div>
          </div>
        </div>
      </div>
      <div class="trend-chart-card">
        <div class="card-header space-between">
          <span class="card-title">📈 发电功率趋势</span>
          <div class="chart-tools">
            <el-radio-group v-model="trendTypeB" size="small" @change="() => renderTrendChart('B')">
              <el-radio-button value="day">日</el-radio-button>
              <el-radio-button value="month">月</el-radio-button>
              <el-radio-button value="year">年</el-radio-button>
              <el-radio-button value="total">总</el-radio-button>
            </el-radio-group>
            <el-date-picker v-model="trendDateB" :type="trendTypeB === 'month' ? 'month' : 'date'" placeholder="选择日期" size="small" />
          </div>
        </div>
        <div class="trend-chart-body" :style="{ height: trendHeight + 'px' }" ref="trendBRef"></div>
      </div>
    </div>

    <!-- 方案C -->
    <div class="scheme-section">
      <h3 class="scheme-label">方案C：仪表盘280px + 3列宽卡片（字段合并）</h3>
      <div class="s-merged-card">
        <div class="s-gauge-c">
          <div class="s-gauge-chart" ref="gaugeCRef"></div>
          <div class="s-gauge-capacity">组件总容量：755.16 kWp</div>
        </div>
        <div class="s-kpi-3col-wide">
          <div class="s-kpi-item">
            <div class="s-kpi-label">当日发电量</div>
            <div class="s-kpi-val">2846<span>kWh</span></div>
            <div class="s-kpi-trend"><span class="trend-up">↑ 5.2%</span><span class="trend-desc">较昨日同期</span></div>
            <div class="s-kpi-desc">累计发电量：128500 kWh</div>
          </div>
          <div class="s-kpi-item">
            <div class="s-kpi-label">当日收益</div>
            <div class="s-kpi-val">¥ 1138.4</div>
            <div class="s-kpi-desc">当年收益：45200 元 | 累计：128500 元</div>
            <div class="s-kpi-price">上网电价：0.4 元/kWh | 自用电价：0.6 元/kWh</div>
          </div>
          <div class="s-kpi-item">
            <div class="s-kpi-label">系统运行状态</div>
            <div class="s-kpi-status"><span class="s-dot green"></span>运行中</div>
            <div class="s-kpi-alarm">告警 0 | 逆变器 6/6 | 通信 ✅</div>
            <div class="s-kpi-desc">日满发小时：5.2 h | 实时功率占比：38%</div>
          </div>
        </div>
      </div>
      <div class="trend-chart-card">
        <div class="card-header space-between">
          <span class="card-title">📈 发电功率趋势</span>
          <div class="chart-tools">
            <el-radio-group v-model="trendTypeC" size="small" @change="() => renderTrendChart('C')">
              <el-radio-button value="day">日</el-radio-button>
              <el-radio-button value="month">月</el-radio-button>
              <el-radio-button value="year">年</el-radio-button>
              <el-radio-button value="total">总</el-radio-button>
            </el-radio-group>
            <el-date-picker v-model="trendDateC" :type="trendTypeC === 'month' ? 'month' : 'date'" placeholder="选择日期" size="small" />
          </div>
        </div>
        <div class="trend-chart-body" :style="{ height: trendHeight + 'px' }" ref="trendCRef"></div>
      </div>
    </div>

    <!-- 方案D -->
    <div class="scheme-section">
      <h3 class="scheme-label">方案D：仪表盘360px + 3列精简卡片</h3>
      <div class="s-merged-card">
        <div class="s-gauge-d">
          <div class="s-gauge-chart" ref="gaugeDRef"></div>
          <div class="s-gauge-capacity">组件总容量：755.16 kWp</div>
        </div>
        <div class="s-kpi-3col">
          <div class="s-kpi-item">
            <div class="s-kpi-label">当日电量</div>
            <div class="s-kpi-val">2846<span>kWh</span></div>
            <div class="s-kpi-desc">较昨日 ↑5.2% | 日满发 5.2h</div>
          </div>
          <div class="s-kpi-item">
            <div class="s-kpi-label">当日收益</div>
            <div class="s-kpi-val">¥1138.4</div>
            <div class="s-kpi-desc">当年 45200 | 累计 128500 元</div>
          </div>
          <div class="s-kpi-item">
            <div class="s-kpi-label">运行状态</div>
            <div class="s-kpi-status"><span class="s-dot green"></span>运行中</div>
            <div class="s-kpi-desc">逆变器 6/6 在线 | 告警 0 | 通信 ✅</div>
          </div>
        </div>
      </div>
      <div class="trend-chart-card">
        <div class="card-header space-between">
          <span class="card-title">📈 发电功率趋势</span>
          <div class="chart-tools">
            <el-radio-group v-model="trendTypeD" size="small" @change="() => renderTrendChart('D')">
              <el-radio-button value="day">日</el-radio-button>
              <el-radio-button value="month">月</el-radio-button>
              <el-radio-button value="year">年</el-radio-button>
              <el-radio-button value="total">总</el-radio-button>
            </el-radio-group>
            <el-date-picker v-model="trendDateD" :type="trendTypeD === 'month' ? 'month' : 'date'" placeholder="选择日期" size="small" />
          </div>
        </div>
        <div class="trend-chart-body" :style="{ height: trendHeight + 'px' }" ref="trendDRef"></div>
      </div>
    </div>

    <!-- 方案E：狂野缩小 -->
    <div class="scheme-section">
      <h3 class="scheme-label">方案E：仪表盘缩小至220px × 240px + 右侧3列卡片（狂野缩小）</h3>
      <div class="s-merged-card">
        <div class="s-gauge-e">
          <div class="s-gauge-chart" ref="gaugeERef"></div>
          <div class="s-gauge-capacity">组件总容量：755.16 kWp</div>
        </div>
        <div class="s-kpi-3col">
          <div class="s-kpi-item">
            <div class="s-kpi-label">当日发电量</div>
            <div class="s-kpi-val">2846<span>kWh</span></div>
            <div class="s-kpi-trend"><span class="trend-up">↑ 5.2%</span><span class="trend-desc">较昨日同期</span></div>
            <div class="s-kpi-desc">累计发电量：128500 kWh</div>
          </div>
          <div class="s-kpi-item">
            <div class="s-kpi-label">当日收益</div>
            <div class="s-kpi-val">¥ 1138.4</div>
            <div class="s-kpi-desc">当年收益：45200 元<br>累计收益：128500 元</div>
            <div class="s-kpi-price">上网电价：0.4 元/kWh<br>自用电价：0.6 元/kWh</div>
          </div>
          <div class="s-kpi-item">
            <div class="s-kpi-label">系统运行状态</div>
            <div class="s-kpi-status"><span class="s-dot green"></span>运行中</div>
            <div class="s-kpi-alarm">当前告警数量 <span class="alarm-zero">0</span></div>
            <div class="s-kpi-desc">设备通信状态：✅ 全部在线<br>逆变器在线数/总数：6/6</div>
          </div>
        </div>
      </div>
      <div class="trend-chart-card">
        <div class="card-header space-between">
          <span class="card-title">📈 发电功率趋势</span>
          <div class="chart-tools">
            <el-radio-group v-model="trendTypeE" size="small" @change="() => renderTrendChart('E')">
              <el-radio-button value="day">日</el-radio-button>
              <el-radio-button value="month">月</el-radio-button>
              <el-radio-button value="year">年</el-radio-button>
              <el-radio-button value="total">总</el-radio-button>
            </el-radio-group>
            <el-date-picker v-model="trendDateE" :type="trendTypeE === 'month' ? 'month' : 'date'" placeholder="选择日期" size="small" />
          </div>
        </div>
        <div class="trend-chart-body" :style="{ height: trendHeight + 'px' }" ref="trendERef"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { ArrowDown, ArrowRight } from '@element-plus/icons-vue'

const switcherCollapsed = ref(false)
const trendHeight = ref(450)

const gaugeARef = ref(null), gaugeBRef = ref(null), gaugeCRef = ref(null), gaugeDRef = ref(null), gaugeERef = ref(null)
const trendARef = ref(null), trendBRef = ref(null), trendCRef = ref(null), trendDRef = ref(null), trendERef = ref(null)
const trendTypeA = ref('day'), trendTypeB = ref('day'), trendTypeC = ref('day'), trendTypeD = ref('day'), trendTypeE = ref('day')
const trendDateA = ref(new Date()), trendDateB = ref(new Date()), trendDateC = ref(new Date()), trendDateD = ref(new Date()), trendDateE = ref(new Date())

const allCharts = []
const trendCharts = {}
const DISPOSE = (chart) => { if (chart && !chart.isDisposed()) chart.dispose() }

const makeGauge = (dom, size = 'large') => {
  if (!dom) return null
  const existing = echarts.getInstanceByDom(dom)
  if (existing) existing.dispose()
  const chart = echarts.init(dom)
  allCharts.push(chart)

  const capacity = 755.16
  const realPower = 285

  const configMap = {
    large:   { radius: '85%', fontSize: 30, width: 18, splitFontSize: 12, offsetY: '40%', labelDist: -25 },
    medium:  { radius: '82%', fontSize: 26, width: 14, splitFontSize: 10, offsetY: '38%', labelDist: -22 },
    small:   { radius: '78%', fontSize: 22, width: 12, splitFontSize: 9,  offsetY: '35%', labelDist: -20 },
    compact: { radius: '85%', fontSize: 28, width: 16, splitFontSize: 11, offsetY: '42%', labelDist: -25 },
    wild:    { radius: '75%', fontSize: 18, width: 10, splitFontSize: 8,  offsetY: '32%', labelDist: -18 },
  }
  const cfg = configMap[size] || configMap.large

  chart.setOption({
    backgroundColor: 'transparent',
    series: [{
      type: 'gauge',
      center: ['50%', '55%'],
      radius: cfg.radius,
      startAngle: 200,
      endAngle: -20,
      min: 0,
      max: capacity,
      splitNumber: 5,
      axisLabel: { distance: cfg.labelDist, fontSize: cfg.splitFontSize, color: '#aaa', formatter: (val) => Math.round(val) },
      axisTick: { distance: -15, length: 6, lineStyle: { color: '#ccc' } },
      splitLine: { distance: -15, length: 10, lineStyle: { color: '#ccc' } },
      axisLine: { lineStyle: { width: cfg.width, color: [[1, '#e9eef4']] } },
      progress: { show: true, width: cfg.width, itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: '#ff9a42' }, { offset: 1, color: '#ff6b00' }]) } },
      pointer: { length: '55%', width: 5, itemStyle: { color: '#ff6b00' } },
      anchor: { size: 12, itemStyle: { color: '#ff6b00' } },
      title: { show: false },
      detail: { fontSize: cfg.fontSize, fontWeight: 700, color: '#ff6b00', offsetCenter: [0, cfg.offsetY], formatter: '{value} kW' },
      data: [{ value: realPower }]
    }]
  })
  return chart
}

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

const makeTrendChart = (dom, type) => {
  if (!dom) return null
  const existing = echarts.getInstanceByDom(dom)
  if (existing) existing.dispose()
  const chart = echarts.init(dom)
  allCharts.push(chart)
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

const renderTrendChart = (key) => {
  const typeMap = { A: trendTypeA.value, B: trendTypeB.value, C: trendTypeC.value, D: trendTypeD.value, E: trendTypeE.value }
  const refMap = { A: trendARef.value, B: trendBRef.value, C: trendCRef.value, D: trendDRef.value, E: trendERef.value }
  if (trendCharts[key]) {
    DISPOSE(trendCharts[key])
    const idx = allCharts.indexOf(trendCharts[key])
    if (idx > -1) allCharts.splice(idx, 1)
  }
  trendCharts[key] = makeTrendChart(refMap[key], typeMap[key])
}

const onTrendHeightChange = () => {
  nextTick(() => {
    Object.keys(trendCharts).forEach(key => {
      if (trendCharts[key] && !trendCharts[key].isDisposed()) {
        trendCharts[key].resize()
      }
    })
  })
}

onMounted(() => {
  nextTick(() => {
    makeGauge(gaugeARef.value, 'large')
    makeGauge(gaugeBRef.value, 'medium')
    makeGauge(gaugeCRef.value, 'small')
    makeGauge(gaugeDRef.value, 'compact')
    makeGauge(gaugeERef.value, 'wild')
    ;['A','B','C','D','E'].forEach(key => renderTrendChart(key))
  })
})

onUnmounted(() => {
  allCharts.forEach(c => DISPOSE(c))
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
.explorer-desc { font-size: 14px; color: #86909c; margin-bottom: 24px; line-height: 1.6; }

/* 可折叠切换器 */
.trend-height-switcher {
  position: sticky;
  top: 12px;
  z-index: 90;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  margin-bottom: 24px;
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  gap: 12px;
  transition: all 0.2s ease;
}
.trend-height-switcher.collapsed {
  padding: 8px 16px;
  gap: 8px;
}
.switcher-trigger {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
}
.switcher-arrow { color: #606266; }
.switcher-label { font-weight: 600; color: #1D2129; font-size: 14px; }
.switcher-content { display: flex; align-items: center; }

.scheme-section { margin-bottom: 40px; }
.scheme-label { font-size: 16px; font-weight: 600; color: #1D2129; margin-bottom: 12px; padding: 8px 16px; background: #fff; border-radius: 8px; display: inline-block; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }

/* 合并卡片 */
.s-merged-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

/* 仪表盘尺寸 */
.s-gauge-a { flex: 0 0 420px; height: 400px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.s-gauge-b { flex: 0 0 320px; height: 340px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.s-gauge-c { flex: 0 0 280px; height: 300px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.s-gauge-d { flex: 0 0 360px; height: 380px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.s-gauge-e { flex: 0 0 220px; height: 240px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.s-gauge-chart { width: 100%; height: calc(100% - 36px); }
.s-gauge-capacity { font-size: 14px; color: #666; margin-top: 4px; }

/* KPI卡片 */
.s-kpi-item {
  background: #F8F9FA;
  border-radius: 12px;
  padding: 14px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  transition: all 0.3s ease;
}
.s-kpi-item:hover { transform: translateY(-4px); box-shadow: 0 8px 20px rgba(255, 122, 24, 0.15); }
.s-kpi-label { font-size: 13px; color: #666; }
.s-kpi-val { font-size: 28px; font-weight: bold; color: #1D2129; line-height: 1; }
.s-kpi-val span { font-size: 14px; font-weight: normal; color: #666; margin-left: 3px; }
.s-kpi-desc { font-size: 11px; color: #999; text-align: center; line-height: 1.5; }
.s-kpi-trend { display: flex; gap: 6px; font-size: 12px; }
.trend-up { color: #52c41a; font-weight: 500; }
.trend-desc { color: #999; }
.s-kpi-price { font-size: 11px; color: #999; text-align: center; line-height: 1.5; }
.s-kpi-status { display: flex; align-items: center; gap: 8px; font-size: 18px; font-weight: bold; color: #52c41a; }
.s-kpi-alarm { font-size: 12px; color: #666; }
.alarm-zero { font-weight: bold; color: #1D2129; }
.s-dot { width: 10px; height: 10px; border-radius: 50%; }
.s-dot.green { background: #52c41a; box-shadow: 0 0 0 4px rgba(82, 196, 26, 0.2); }

/* 列布局 */
.s-kpi-3col { flex: 1; min-width: 420px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; padding: 20px; align-content: center; }
.s-kpi-3col-wide { flex: 1; min-width: 420px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; padding: 20px; align-content: center; }

/* 趋势图卡片 */
.trend-chart-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  padding: 20px;
}
.card-header { display: flex; align-items: center; margin-bottom: 12px; }
.space-between { justify-content: space-between; }
.card-title { font-size: 16px; font-weight: 700; color: #1a1a2e; }
.chart-tools { display: flex; gap: 10px; align-items: center; }
.trend-chart-body { width: 100%; }
</style>