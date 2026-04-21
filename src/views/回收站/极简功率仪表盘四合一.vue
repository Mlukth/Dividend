<template>
  <div class="gauge-wrap">
    <div class="title">极简精致仪表盘 · 4版合集（仅5个刻度 | 圆润圆弧 | 天蓝色）</div>
    <div class="gauge-list">
      <!-- 版本1：纯白极简（1:1对标你截图） -->
      <div class="gauge-item">
        <div class="tag">版本1 纯白极简（推荐）</div>
        <div ref="g1" class="chart"></div>
        <div class="info">组件总容量：2.336MWp</div>
      </div>
      <!-- 版本2：浅蓝磨砂 -->
      <div class="gauge-item">
        <div class="tag">版本2 浅蓝磨砂</div>
        <div ref="g2" class="chart"></div>
        <div class="info">组件总容量：2.336MWp</div>
      </div>
      <!-- 版本3：渐变柔光 -->
      <div class="gauge-item">
        <div class="tag">版本3 渐变柔光</div>
        <div ref="g3" class="chart"></div>
        <div class="info">组件总容量：2.336MWp</div>
      </div>
      <!-- 版本4：线性极简 -->
      <div class="gauge-item">
        <div class="tag">版本4 线性极简</div>
        <div ref="g4" class="chart"></div>
        <div class="info">组件总容量：2.336MWp</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
const g1=ref(null),g2=ref(null),g3=ref(null),g4=ref(null)
const charts = []

// 核心通用配置（严格对标截图：仅5个标签+圆润圆弧+精细刻度）
const base = {
  backgroundColor:'transparent',
  series:[{
    type:'gauge',startAngle:210,endAngle:-30,min:0,max:100,
    axisLabel:{
      distance:-45,fontSize:18,color:'#c0c6d0',
      formatter:v=>[0,20,50,80,100].includes(v)?`${v}%`:''
    },
    axisTick:{distance:-24,splitNumber:2,length:5,lineStyle:{color:'#d8dce6',width:1.5}},
    splitLine:{distance:-24,length:10,lineStyle:{color:'#d8dce6',width:1.5}},
    axisLine:{lineStyle:{width:20,cap:'round'}},
    progress:{show:true,width:20,cap:'round'},
    pointer:{length:'72%',width:3,itemStyle:{cap:'round'}},
    anchor:{show:true,size:12},title:{show:false},
    detail:{fontSize:46,fontWeight:500,offsetCenter:[0,'68%'],formatter:'743kW'}
  }]
}

// 初始化4个版本
onMounted(()=>{
  // 版1 纯白极简
  const c1 = echarts.init(g1.value)
  c1.setOption({...base,series:[{...base.series[0],
    axisLine:{lineStyle:{...base.series[0].axisLine.lineStyle,color:[[1,'#f2f5fa']]}},
    progress:{itemStyle:{color:'#4aa3ff'}},pointer:{itemStyle:{color:'#4aa3ff'}},anchor:{itemStyle:{color:'#4aa3ff'}},detail:{color:'#4aa3ff'}
  }]})
  // 版2 磨砂浅蓝
  const c2 = echarts.init(g2.value)
  c2.setOption({...base,series:[{...base.series[0],
    axisLine:{lineStyle:{...base.series[0].axisLine.lineStyle,color:[[1,'#e8f2ff']]}},
    progress:{itemStyle:{color:'#69b1ff'}},pointer:{itemStyle:{color:'#69b1ff'}},anchor:{itemStyle:{color:'#69b1ff'}},detail:{color:'#69b1ff'}
  }]})
  // 版3 渐变柔光
  const c3 = echarts.init(g3.value)
  c3.setOption({...base,series:[{...base.series[0],
    axisLine:{lineStyle:{...base.series[0].axisLine.lineStyle,color:[[1,'#f0f7ff']]}},
    progress:{itemStyle:{color:new echarts.graphic.LinearGradient(0,0,1,0,[{o:0,c:'#73b8ff'},{o:1,c:'#409eff'}])}},
    pointer:{itemStyle:{color:'#409eff'}},anchor:{itemStyle:{color:'#409eff'}},detail:{color:'#409eff'}
  }]})
  // 版4 线性极简
  const c4 = echarts.init(g4.value)
  c4.setOption({...base,series:[{...base.series[0],
    axisLine:{lineStyle:{...base.series[0].axisLine.lineStyle,color:[[1,'#edf2f9']]}},
    progress:{itemStyle:{color:'#369cff'}},pointer:{length:'68%',itemStyle:{color:'#369cff'}},anchor:{itemStyle:{color:'#369cff'}},detail:{color:'#369cff'}
  }]})
  charts.push(c1,c2,c3,c4)
  window.addEventListener('resize',()=>charts.forEach(c=>c.resize()))
})
onUnmounted(()=>charts.forEach(c=>c.dispose()))
</script>

<style scoped>
.gauge-wrap{width:100%;min-height:100vh;padding:24px;background:#f8fafc;box-sizing:border-box;font-family:system-ui,-apple-system}
.title{font-size:18px;color:#2d5a99;margin-bottom:24px;text-align:center}
.gauge-list{display:grid;grid-template-columns:repeat(2,1fr);gap:32px;max-width:1200px;margin:0 auto}
.gauge-item{background:#fff;border-radius:16px;padding:24px;text-align:center;box-shadow:0 2px 12px rgba(64,158,255,0.08)}
.tag{font-size:14px;color:#409eff;margin-bottom:12px}
.chart{width:100%;height:320px}
.info{font-size:18px;color:#667085;margin-top:8px}
</style>