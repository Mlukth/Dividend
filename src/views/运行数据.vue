<template>
  <div class="pv-run-data-page">
    <!-- 页面标题 -->
    <div class="page-title">运行数据</div>

    <!-- 顶部操作栏 + 统计数据（保持原位置） -->
    <div class="top-bar">
      <!-- 左侧统计指标 -->
      <div class="stats-group">
        <div class="stat-item">
          <div class="stat-label">日发电量</div>
          <div class="stat-value">2.012MWh</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-label">日收益</div>
          <div class="stat-value">804.68元</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-label">日满发小时数</div>
          <div class="stat-value">0.86h</div>
        </div>
      </div>

      <!-- 右侧操作按钮 -->
      <div class="action-group">
        <el-date-picker
          v-model="selectDate"
          type="date"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          :arrow-control="true"
        />
        <el-radio-group v-model="dateType" size="default">
          <el-radio-button label="day">日</el-radio-button>
          <el-radio-button label="month">月</el-radio-button>
          <el-radio-button label="year">年</el-radio-button>
          <el-radio-button label="total">总</el-radio-button>
        </el-radio-group>
        <el-button>参数选择</el-button>
        <el-button>导出</el-button>
      </div>
    </div>

    <!-- 核心区域：左侧仪表盘 + 右侧统计卡片（已交换位置） -->
    <div class="core-container">
      <!-- 左侧：仪表盘卡片（原右边） -->
      <div class="gauge-card-wrapper">
        <div class="gauge-card">
          <div class="time-text">数据上报时间：2026-04-16 10:35:41 5分钟前</div>
          <div ref="gaugeRef" class="gauge-box"></div>
          <div class="desc">组件总容量：2.336MWp</div>
        </div>
      </div>

      <!-- 右侧：四个统计卡片（原左边） -->
      <div class="cards-container">
        <!-- 1. 实时功率 -->
        <div class="card bs-br">
          <div class="title-box">
            <div class="title-top">
              <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAAsCAMAAAAO9CvbAAACE1BMVEUAAAD13Nv/wpb/39b13dv/iAP23NvqXWb33dz8n0z/4+P/8PD/t3D/jQzrX2L/hwH23Nv23dv/iAP23dz8jif23dvyeV/13tvsbnH23d3/mzn03tv6nWL8qVnz5OT/sXn/nED8gQ35eh3sXVH/hgH+hgr/iwn/hgH0dDrqW2H/hgHtf4Xwm5//hgHwbUv/hwL/iwjvZkz+ixT23dv5hzX9kRf8kif6iyn13dz/igb4hDztaGH/iQX9kyn+lyj33dz+mD33zhj7mDXzhGX13Nz+n0D33tr/igr43d334OD33tv/jRb/liH7gRXpV2D3dyn6gBr0dS/2dyvqZGv8hBn/jhDra3L9iR36gRz+jxPuZ1btYlztg4n/hwH3fS3+jxT5gyXwbU3+hwH8jRzyubr3gCz9kBLzckHyy8nyb0X/jQ/3eDX8jyP2fTL/jQn2eTv0bj37iSXuaFH129n0c0Tyd0jvcVjtcnb1z8/13tv/hwX/iAbtgoj2iE3/iAb/hwbziV3/iwj/iQj/iwnxh33/pFL1lGbud33/jQ3/kg/thIT14uLzkob/hwD/hgHoUlz9gwb8gQr+hQTuYEP8gA37fg/6exX6fBL5eBv6ehfpVFj0bS72ciX4dh3rWFLrWVDsW0ztXErtXkfvYz/wZTzxZjnxaDbzazH0biv2cyPqVlX1cCj3dSD3dCDyaTTyaTPqVlTyajT0cCiaR8KLAAAAi3RSTlMAmgUEmPmK830oDQgI3r+rk46JdHBsYlhTQTEuIBgVDAz++vj18ezm5dnX0r26rJ2XlJSPjYmHhYN9e3BvZl9eWFNMS0gzJSEeHRf49vXx8O/r5+Tg2tnW1dLPyMC/uba0r6unp6ainp2bmZWPi4l9e3p4cnFwZmRkWlZWVlNSREM5NTUyLSYjHRoVt0h4rQAAAmtJREFUSMft1GdXE0EUBuDZDSkkkMSEJAQSCb0oVelKFSn23nvvvfdedoPBgiJ2xYaCP1F2dudmMjsb0MNH3g9J7uQ8596ZLWgm8YSunzl+oGJHRfVJ/23Tv0DxyqGSoZHxL58/fRwY+PD+Xb6z+eEUaeqRla9/fB0a+Q347Zvvr5yZU6F78n5+w/hXAo5GSyfjOfV5g8OjXDwR571kNmv985eDw/zOSpZeNrYLl7zQ8B9mz2MqjlrPOwxsXe4zjEcB053VzPXaufbwk6cY88YeI3iOYOPpun4Vw4GNJ3QGLJxy6PcbY3DJvtP+9nb/2eqN+fTYgiD4TOw5mxUMY684dhdBHjdvItgqKOlgrm+6THVe1pSDEpNZqtrdGKcsRnRqJQpvDSFdTOfWWldt3i+osdGDp5opPB9x020R4llE/bFXkuR+DTchg8ym9CwH3Rgw9NXn0Txe6xpJImNvR0mSnQLYQnYtFgFeHkbJ0ipAsrWlNglwhhFL61M+7fHBL2h/VAFenWZgH7gi+LsjfmTa3OmATxjYS4UXEY49vusevBCWCM4NcWmkUi4Ttd8+wEFcdyoWX6p1XNtVJsvXSBEEHMB1BuAanl1gluUtUPUA9uK6EcbmnHXfTnkiN6F2wKYbcO0B3KazN4oVW06tWAi24PIg4E6Gip6YYmNd1FoDwW5cHgV8h7kxymUcF73ohQuNyxaCC0XmqFRrvk8vBgj2qQ3ITVLPTO1ScVXig+kWEt4mWUX4Uu0SGVyJbUEv82i5sQ2SOly7Yc22FsTmFj6uRt1LIWCztXajyXK1WC7wiOg/Y+qNoJlMX/4CM5BsaGxw3IQAAAAASUVORK5CYII=" alt="" class="gl-img">
              <span class="f__14">实时功率</span>
            </div>
            <div class="title-value">
              <span class="f__30">42.84</span>
              <span class="f__18">kW</span>
            </div>
          </div>
          <div class="glContentItem gl-content-item">
            <div class="gl-content-item-label">
              <span class="f__14 colon">组件总容量</span>
            </div>
            <div class="text-value">
              <div class="gl-content-item-content">
                <span class="el-tooltip gl-content-item-content-value f__14">2.336MWp</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. 当日电量 -->
        <div class="card bs-br">
          <div class="title-box">
            <div class="title-top">
              <img src="data:image/png;base64,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" alt="" class="gl-img">
              <span class="f__14">当日电量</span>
            </div>
            <div class="title-value">
              <span class="f__30">5.573</span>
              <span class="f__18">MWh</span>
            </div>
          </div>
          <div class="glContentItem gl-content-item">
            <div class="gl-content-item-label">
              <span class="f__14 colon">当日收益</span>
            </div>
            <div class="text-value">
              <div class="gl-content-item-content">
                <span class="el-tooltip gl-content-item-content-value f__14">2229元</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. 当月电量 -->
        <div class="card bs-br">
          <div class="title-box">
            <div class="title-top">
              <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD4AAAAsCAMAAAAKAfvmAAABhlBMVEUAAAD72rn2rX/////rZEb+9vT99/X++PTrZkPJWxb+9/bzpYTwiV7wgSDtcjLudi7veyfqYUnwfyPwgx3sazvsbTnveijudyzveCvvgh70qpbrZ0Hsaj375dz+/f3xln786uj74tbrY0b97eXtcDTudDD3xK7saD/wfSXtbzbxhhr96+b+8/D759r86NjxiBj1qWDudl7qXE/qXkzxhBv5yr/0qov0qorrZkL++vn97+z4y7j1sqP51Mn50cX1tJrymHTteVrufFXvhEzrZUf78u398Or639r62ND1tqbzn4rxknzylnjwjHbznW7tc2PueV/sb1LvgFD+/Pv86OP75d762dL63c/4zsDw0L32vK70r570r5LymoTvhm/zoGvzomjuf2btc1jRdDnWYSHLYiDWZhr74dv3w7f3v6j2uqHxkHnwiHDvhGz51c7x1sT2uKrwkXvugnv0pnb0o2braEvzmT/vfDbPXxn748f4xbf0q5bzpZP2tG3rZ0rpazfreSbsfCJNhH+wAAAAA3RSTlMA/v2zRYZMAAADc0lEQVRIx7XWh1MTQRQGcHRzgVzoJUCAkwiCwClSAoY0UEhDJEivivQqSLXrf+635SF3lwFmGL9hJvd28uO9Xe7myMtj90iejY98GrHUtHY3Pr/h2Zinwr52O1/zeDxrVNjXbuceHnw61v4f//LjBcXDc3r6AXmPvOURa4M8b3gyM1b+oLOzs723t6KitrbIw1NaWuqrqamuLikpeVJcXCzWqqoqKyvr61vr6l4WBC38HLpdauI+n9JXXOlW6IIhC0dz0kWb+OYmNZe6eR1r61VKg7tcFk69wcv/bF5u/raM3tzctn65/gtajV7gepyTQ5eXP+Ub91l0W5XaOGkrd2jL6JLT6FzbODQ4Ng4N7gPPral5mZVDnz94rvIMP1dpsCe6Cu3gtYF8W7Tr0XXdrbtFktBW3ouNazdrcEqZnWPfnGvpRyKZafABvyz8CejpjCzSWk6OUwefK1DZw69apGIRfJSKObc7FGt0h+zdOY/Sl5Yxb5qKNEZfpiI6aTifOP4n43sPfvPzRBLYubngF1kwse9ERBYxjvWZ4HZ0ysFvP7dJfD01eubiyUY04tDgd9HmqOsqE0End2ri/LymugSkLCpeLvlsi0h4hLuYLGIasBluaZkzmEl63y8/FwTnTwp4oFAlDh2m4isax/EZY4wm/2gm5cVwknNozqMk+sF3qNjB3dpXWDhosJRLoRTbVpdjnEOXgms7XpGlBvBEXBbxAXSfXvKG/zWPGOy7S2ULHBpcRHOeOh27fqY6GoytEI9YuUMTN9iM2vgAY8by8XFWVHvg0D7NqRUmHpQbP2Tg+DkU5So4tOCJgEiDwB2y6BB4OmCwbXVYisv5s5LXgDf1e2XC0LNelVnoOa/XzaKy+8HKSgw6re4AcJ9P8CuxCx6mIgy+6/VOsSkXJcWMrZ/yMgMOzbm52y+yFOCzx/tE4nz6wFJfirEscZOFVtVlEBy6GjznsVF0xiJ00zHDT4+NrngTQeJ2bzBtgm61mWHFjxg4dPWJebPmD1xQmmWNHp2DEOfipXDxWuQdzyuRIZ4ukXEkydiiVJiC7iDOLyzvM8TyPitDenp6usc1xhbE1NQbmvOH4o0ELTnpOmhwpbu7P+P4kmOEJ45CTPL8E9ncqqk5aXjebiuyt5rdzwT1a/8amU2WdKg02jJgMns4v0fy/gK6PtCNcs1dgwAAAABJRU5ErkJggg==" alt="" class="gl-img">
              <span class="f__14">当月电量</span>
            </div>
            <div class="title-value">
              <span class="f__30">116.771</span>
              <span class="f__18">MWh</span>
            </div>
          </div>
          <div class="glContentItem gl-content-item">
            <div class="gl-content-item-label">
              <span class="f__14 colon">当月收益</span>
            </div>
            <div class="text-value">
              <div class="gl-content-item-content">
                <span class="el-tooltip gl-content-item-content-value f__14">4.67万元</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 4. 累计电量 -->
        <div class="card bs-br">
          <div class="title-box">
            <div class="title-top">
              <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAAsCAMAAAAO9CvbAAABdFBMVEX////50cjtcjL608T+/v3ylnjsaT3sbDrrZUPrZ0Dsbjjxk33ymHXsbTrtcTT608X50sbudS/tbzb+/Pz++vjqYUjueyfudi3xlXvrY0budyz50MrxkYDxkn7zmnP50cX++/r98e3tcDbueSr++ff73NL+9/X99fL97ef85t7618j61Mj62s/61cT1sJP0pYXtckf99O/86uP86d/74Nn62crzo4jynYb75+T63db2uaf0portc1LtdjzvgC7udy798Or74+D74t3859v75Nf739X518v50sn4zcT4yr/4z773w7f1sqj0rJz1spj0qYzxkIL0rHvzpHTzm3Lzn27ufWrtdlvqX0vuei374NH63Mz2vq/2vJLvhXXwi1787eL75eH749374dz0r6L1tJ/0qZfzqJH0rI71tob1soH0pYHymWjxlGXteWPwkGHtckDufS33ybj50bf3ybP2v5/xlXDvhF/ugF3wjljvg0zraEnuf0UWWTABAAAC2UlEQVRIx82RaVvaQBCAR9laD6hWotZqS9ImHHILiiAicggUQTnrfd937+vPd3fJpkmgKn7yZWGyM/NuZh/gaSJsbvofqcZPY8PDsdM4tI/9DKuE2Jm9TXWndDuscFvaaUMNlFbfN1iNNUIp8EA1WV59zfgckB/my0m4n1R1fmQEL8omWqdxnnyrqXvUtepLFWWEvqr31bU71PWLTjU/RYByp4aLdWjN1KW28Y8dAfzq1HE51Wwi9/ULLXNkRv8cRle4diOt694efDdIlxK/AKPI8ixuG9SuYOrV41WO57Z7mxDUQ3tuTCbTcxOGxW8fMFZSm2V5Jd4UtYMLHt/zJkwcrnzSZ30eAfT4i74uHd8BkEOX9RX90Arboa+rp6urpwf/0BgCsP5gexp9h7ZWpnkiiVsj0R4VEYRC6n00YgVITph1Km84r1Q8KQRiJNqt4EIb3f+IRkRAKU+lcm7g1S7nfUvxpBFwG3XWLoR/K2p9gwOU9jT6vJxWNjY4kRDw+fooZSs6KlPP84CkE6Ox0cdkNrbXKLPsQmDOXw0NjQ4RSLzKmwG5llmHl42tYHZOP8MY8ZpdxL252pBMLYdPW5zFJVqfdpqhCdogQxpQtvYRU8sidjCBHNzKRWQ0RbfgS45tbY0h4C2KSq6Emm3O4Z6y44p0/EomlOVoIRtimWMJN9in3A5Oo6KA24ChevioTyaUi8dzIbY7ClOV9LkdSP1eg8zEJL5ssNDXRCGIrz45wfo07xZcah0ShTcaCglQqy4BNCBBMvQb+glU3z0YVzjYpSqrSwKCJvxSv4wzwAPMLI2Pr+C1NAPAB5ysJvmhNbbwgIzTwRF9ZWXJTv4JJ8uHbfB/bOkBC/0MZIguCACiI0P2JJum6l16sANjsXR0ZPZErO5lLPI+iNV7sVKdIknKY9AKD8O636Fj3woPR0yo1YQI7SEujMksiNA+3AJVOXgc/MwMD0+Sv3DHifN7ODhaAAAAAElFTkSuQmCC" alt="" class="gl-img">
              <span class="f__14">累计电量</span>
            </div>
            <div class="title-value">
              <span class="f__30">972.79</span>
              <span class="f__18">MWh</span>
            </div>
          </div>
          <div class="glContentItem gl-content-item">
            <div class="gl-content-item-label">
              <span class="f__14 colon">累计收益</span>
            </div>
            <div class="text-value">
              <div class="gl-content-item-content">
                <span class="el-tooltip gl-content-item-content-value f__14">38.911万元</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 功率曲线图表（底部） -->
    <div class="chart-container">
      <div ref="powerChartRef" class="chart-box"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { ElDatePicker, ElRadioGroup, ElRadioButton, ElButton } from 'element-plus'

// 响应式数据
const selectDate = ref('2026-04-16')
const dateType = ref('day')
const powerChartRef = ref(null)
const gaugeRef = ref(null)
let myChart = null
let gaugeChart = null

// 初始化功率曲线图
const initPowerChart = () => {
  if (!powerChartRef.value) return
  myChart = echarts.init(powerChartRef.value)

  const option = {
    backgroundColor: '#ffffff',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#7a7d84',
      textStyle: { color: '#fff', fontSize: 14 },
      padding: [12, 16],
      borderWidth: 0,
      axisPointer: {
        type: 'cross',
        lineStyle: { color: '#ff9a42', type: 'dashed' }
      }
    },
    legend: {
      bottom: 0,
      left: 'center',
      itemIcon: 'diamond',
      textStyle: { color: '#ff9a42' },
      data: ['功率']
    },
    grid: {
      left: '3%',
      right: '3%',
      top: '10%',
      bottom: '12%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#666', fontSize: 13 },
      data: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00']
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#f0f0f0' } },
      axisLabel: { color: '#666', fontSize: 13 }
    },
    series: [
      {
        name: '功率',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: { color: '#ff9a42' },
        lineStyle: { color: '#ff9a42', width: 3 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(255,154,66,0.35)' },
            { offset: 1, color: 'rgba(255,154,66,0.05)' }
          ])
        },
        data: [0, 0, 0, 0, 220, 780, 160, 0, 0, 0, 0, 0]
      }
    ]
  }

  myChart.setOption(option)
  window.addEventListener('resize', () => myChart?.resize())
}

// 初始化仪表盘
const initGauge = () => {
  if (!gaugeRef.value) return
  gaugeChart = echarts.init(gaugeRef.value)
  
  const deepColor = new echarts.graphic.LinearGradient(0,0,1,0,[
    {offset:0, color:'#2d7dd2'},
    {offset:1, color:'#1a5aaa'}
  ])

  gaugeChart.setOption({
    backgroundColor: 'transparent',
    graphic: [
      {
        type: 'text',
        left: 'center',
        top: '5%',
        style: {
          text: '50%',
          fontSize: 20,
          fill: '#c5c9d2'
        }
      }
    ],
    series: [{
      type: 'gauge',
      startAngle: 200,
      endAngle: -20,
      min: 0,
      max: 100,
      axisLabel: {
        distance: -40,
        fontSize: 16,
        color: '#c5c9d2',
        formatter: v => [0,20,50,80,100].includes(v) ? `${v}%` : ''
      },
      axisTick: {
        show: true,
        distance: -22,
        splitNumber: 2,
        length: 4,
        lineStyle: { color: '#dfe3e9', width: 1.5 }
      },
      splitLine: {
        show: true,
        distance: -22,
        length: 8,
        lineStyle: { color: '#dfe3e9', width: 1.5 }
      },
      axisLine: {
        lineStyle: { width: 18, color: [[1, '#f1f5fa']], cap: 'round' }
      },
      progress: {
        show: true,
        width: 18,
        cap: 'round',
        itemStyle: { color: deepColor }
      },
      pointer: {
        show: true,
        length: '70%',
        width: 4,
        itemStyle: { color: '#1a5aaa' }
      },
      anchor: {
        show: true,
        size: 10,
        itemStyle: { color: '#1a5aaa' }
      },
      title: { show: false },
      detail: {
        show: true,
        fontSize: 40,
        fontWeight: 600,
        color: '#1a5aaa',
        offsetCenter: [0, '65%'],
        formatter: '743kW'
      },
      data: [{ value: 32 }]
    }]
  })
}

// 组件挂载
onMounted(() => {
  initPowerChart()
  initGauge()
})

// 组件卸载
onUnmounted(() => {
  if (myChart) {
    myChart.dispose()
    myChart = null
  }
  if (gaugeChart) {
    gaugeChart.dispose()
    gaugeChart = null
  }
})
</script>

<style scoped>
.pv-run-data-page {
  width: 100%;
  min-height: 100vh;
  padding: 20px;
  box-sizing: border-box;
  background-color: #f5f7fa;
  font-family: "Microsoft YaHei", sans-serif;
}

/* 页面标题 */
.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #ff7d29;
  margin-bottom: 20px;
}

/* 顶部操作栏 */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #fff;
  border-radius: 4px;
  margin-bottom: 16px;
}

/* 统计组 */
.stats-group {
  display: flex;
  align-items: center;
  gap: 32px;
}
.stat-item {
  text-align: center;
}
.stat-label {
  font-size: 16px;
  color: #333;
  margin-bottom: 6px;
}
.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #333;
}
.stat-divider {
  width: 1px;
  height: 40px;
  background-color: #e5e7eb;
}

/* 操作按钮组 */
.action-group {
  display: flex;
  align-items: center;
  gap: 12px;
}
:deep(.el-radio-button__orig-radio:checked + .el-radio-button__inner) {
  background-color: #ff7d29 !important;
  border-color: #ff7d29 !important;
}

/* 核心区域：左右并排 */
.core-container {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
}

/* 左侧仪表盘卡片 */
.gauge-card-wrapper {
  flex: 1;
  background: #fff;
  border-radius: 4px;
  padding: 16px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}
.gauge-card {
  text-align: center;
}
.time-text {
  font-size: 16px;
  color: #409eff;
  margin-bottom: 10px;
}
.gauge-box {
  width: 100%;
  height: 320px;
}
.desc {
  font-size: 20px;
  color: #666;
  margin-top: 8px;
}

/* 右侧四个统计卡片容器 */
.cards-container {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

/* 卡片通用样式 */
.card {
  background: #fff;
  padding: 16px 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}
.title-box {
  margin-bottom: 12px;
}
.title-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.gl-img {
  width: 28px;
  height: 24px;
  object-fit: contain;
}
.f__14 {
  font-size: 14px;
  color: #333;
}
.title-value {
  display: flex;
  align-items: baseline;
  gap: 4px;
}
.f__30 {
  font-size: 30px;
  font-weight: 700;
  color: #333;
}
.f__18 {
  font-size: 18px;
  color: #666;
}
.gl-content-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}
.gl-content-item-label {
  display: flex;
  align-items: center;
}
.colon::after {
  content: '：';
}
.text-value {
  text-align: right;
}
.gl-content-item-content-value {
  color: #333;
}

/* 图表容器 */
.chart-container {
  width: 100%;
  height: 500px;
  background: #fff;
  border-radius: 4px;
  padding: 16px;
  box-sizing: border-box;
}
.chart-box {
  width: 100%;
  height: 100%;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .core-container {
    flex-direction: column;
  }
  .cards-container {
    grid-template-columns: 1fr;
  }
}
</style>