<template>
  <el-container style="height: 100vh; background: #f5f7fa">
    <!-- 顶部导航 -->
    <el-header style="background: #165DFF; color: white; display: flex; align-items: center; justify-content: space-between; padding: 0 20px">
      <div style="font-size: 18px; font-weight: 500">
        光伏电站管理系统
      </div>
      <div>管理员</div>
    </el-header>

    <el-container>
      <!-- 左侧菜单 - 纯文字，无任何图标 -->
      <el-aside width="200px" style="background: white; border-right: 1px solid #e4e7ed">
        <el-menu default-active="1" mode="vertical" style="height: 100%; border-right: none">
          <el-menu-item index="1">电站管理</el-menu-item>
          <el-menu-item index="2">设备监控</el-menu-item>
          <el-menu-item index="3">数据统计</el-menu-item>
          <el-menu-item index="4">运维管理</el-menu-item>
          <el-menu-item index="5">告警中心</el-menu-item>
          <el-menu-item index="6">系统设置</el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 主内容区 -->
      <el-main style="padding: 20px; overflow: auto">
        <!-- 数据概览卡片 - 纯文字，无图标 -->
        <el-row :gutter="20" style="margin-bottom: 20px">
          <el-col :span="6">
            <el-card shadow="hover">
              <div class="stat-item">
                <div>
                  <div class="stat-label">今日发电量</div>
                  <div class="stat-value">2.68 万kWh</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover">
              <div class="stat-item">
                <div>
                  <div class="stat-label">总装机容量</div>
                  <div class="stat-value">12.5 MWp</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover">
              <div class="stat-item">
                <div>
                  <div class="stat-label">在线电站</div>
                  <div class="stat-value">18 座</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover">
              <div class="stat-item">
                <div>
                  <div class="stat-label">异常设备</div>
                  <div class="stat-value">2 台</div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <!-- 电站列表 -->
        <el-card shadow="hover" style="margin-bottom: 20px">
          <div style="margin-bottom: 15px; font-size: 16px; font-weight: 500">电站列表</div>
          <el-table :data="stationList" border stripe>
            <el-table-column prop="name" label="电站名称" />
            <el-table-column prop="address" label="所在位置" />
            <el-table-column prop="power" label="当前功率(kW)" />
            <el-table-column prop="capacity" label="装机容量(MWp)" />
            <el-table-column label="运行状态">
              <template #default="scope">
                <el-tag :type="scope.row.status === '正常' ? 'success' : scope.row.status === '异常' ? 'danger' : 'info'">
                  {{ scope.row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作">
              <template #default>
                <el-button type="text" size="small">查看</el-button>
                <el-button type="text" size="small">运维</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>

        <!-- 发电量图表 -->
        <el-card shadow="hover">
          <div style="margin-bottom: 15px; font-size: 16px; font-weight: 500">近7日发电量趋势</div>
          <div ref="chartRef" style="width: 100%; height: 300px"></div>
        </el-card>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

// 彻底删除所有图标引入，零图标依赖
const chartRef = ref(null)
let myChart = null

// 模拟数据
const stationList = [
  { name: '工业园区光伏电站', address: '北京市朝阳区', power: 1250, capacity: 2.5, status: '正常' },
  { name: '商业中心光伏电站', address: '上海市浦东新区', power: 980, capacity: 1.8, status: '正常' },
  { name: '居民小区光伏电站', address: '广州市天河区', power: 0, capacity: 1.2, status: '异常' },
  { name: '工厂屋顶光伏电站', address: '深圳市南山区', power: 850, capacity: 1.5, status: '正常' },
  { name: '办公楼光伏电站', address: '杭州市西湖区', power: 0, capacity: 1.0, status: '离线' }
]

// 初始化图表
onMounted(() => {
  myChart = echarts.init(chartRef.value)
  myChart.setOption({
    xAxis: { type: 'category', data: ['1日', '2日', '3日', '4日', '5日', '6日', '7日'] },
    yAxis: { type: 'value', name: '发电量(kWh)' },
    series: [{
      data: [2800, 3200, 2900, 3500, 3100, 2700, 2680],
      type: 'line',
      smooth: true,
      itemStyle: { color: '#165DFF' },
      lineStyle: { width: 3 }
    }]
  })
})

// 销毁图表
onUnmounted(() => {
  myChart?.dispose()
})
</script>

<style scoped>
.stat-item { padding: 10px 0; }
.stat-label { font-size: 14px; color: #666; margin-bottom: 4px; }
.stat-value { font-size: 22px; font-weight: bold; color: #1D2129; }
</style>