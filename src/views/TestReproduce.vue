<template>
  <div style="padding: 20px; font-family: sans-serif;">
    <h2>表格错位复现测试</h2>
    <p>请将浏览器窗口缩放（Ctrl+滚轮）或调整窗口宽度至<strong>小于 1000px</strong>，观察两个表格的表头与表体对齐情况。</p>
    <p style="color: #666;">关键差异：上方表格外层 <code>overflow-x: hidden</code>（模拟全局容器），下方表格外层 <code>overflow-x: auto</code>。</p>

    <!-- 模拟全局布局：左侧占位，右侧内容区 -->
    <div style="display: flex; gap: 10px; margin-bottom: 30px;">
      <div style="width: 80px; background: #eee; border-radius: 4px; display: flex; align-items: center; justify-content: center;">侧边栏</div>
      <!-- 模拟 .content-wrapper -->
      <div style="flex: 1; display: flex; flex-direction: column; gap: 30px; min-width: 0;">
        
        <!-- 异常环境：overflow-x: hidden -->
        <div>
          <h3 style="color: #f56c6c;">异常表格（overflow-x: hidden）</h3>
          <div style="border: 2px dashed #f56c6c; padding: 10px; border-radius: 4px;">
            <!-- 模拟异常页面的外层容器，包裹标题+表格+底部空白 -->
            <div style="overflow-x: hidden; background: #fff; padding: 16px; border: 2px solid #67c23a; border-radius: 8px;">
              <div style="font-weight: 600; margin-bottom: 12px;">运维总览（模拟）</div>
              <el-table :data="tableData" border stripe style="width: 100%;">
                <el-table-column prop="status" label="状态" width="80" />
                <el-table-column prop="name" label="电站名称" min-width="160" />
                <el-table-column prop="address" label="电站地址" width="180" show-overflow-tooltip />
                <el-table-column prop="capacity" label="组串总容量(kW)" width="140" />
                <el-table-column prop="gridTime" label="并网时间" width="110" />
                <el-table-column prop="lastMaintenance" label="上次运维时间" width="120" />
                <el-table-column prop="unit" label="运维单位" width="140" />
                <el-table-column prop="alarmCount" label="告警数据" width="90" />
                <el-table-column prop="defectRate" label="消缺率(%)" width="100" />
                <el-table-column prop="cleanTimes" label="年清洗次数" width="110" />
                <el-table-column prop="healthScore" label="健康评分" width="120" />
                <el-table-column prop="lastIssue" label="上次运维问题处理情况" min-width="180" show-overflow-tooltip />
              </el-table>
              <!-- 底部空白，模拟多余空间 -->
              <div style="height: 150px; background: rgba(128,0,128,0.05); margin-top: 16px; display: flex; align-items: center; justify-content: center; color: purple; border: 1px dashed purple; border-radius: 4px;">
                底部空白区域
              </div>
            </div>
          </div>
        </div>

        <!-- 正常环境：overflow-x: auto -->
        <div>
          <h3 style="color: #67c23a;">正常表格（overflow-x: auto）</h3>
          <div style="border: 2px dashed #67c23a; padding: 10px; border-radius: 4px;">
            <div style="overflow-x: auto; background: #fff; padding: 16px; border: 2px solid #67c23a; border-radius: 8px;">
              <div style="font-weight: 600; margin-bottom: 12px;">运维总览（模拟）</div>
              <el-table :data="tableData" border stripe style="width: 100%;">
                <el-table-column prop="status" label="状态" width="80" />
                <el-table-column prop="name" label="电站名称" min-width="160" />
                <el-table-column prop="address" label="电站地址" width="180" show-overflow-tooltip />
                <el-table-column prop="capacity" label="组串总容量(kW)" width="140" />
                <el-table-column prop="gridTime" label="并网时间" width="110" />
                <el-table-column prop="lastMaintenance" label="上次运维时间" width="120" />
                <el-table-column prop="unit" label="运维单位" width="140" />
                <el-table-column prop="alarmCount" label="告警数据" width="90" />
                <el-table-column prop="defectRate" label="消缺率(%)" width="100" />
                <el-table-column prop="cleanTimes" label="年清洗次数" width="110" />
                <el-table-column prop="healthScore" label="健康评分" width="120" />
                <el-table-column prop="lastIssue" label="上次运维问题处理情况" min-width="180" show-overflow-tooltip />
              </el-table>
              <div style="height: 150px; background: rgba(128,0,128,0.05); margin-top: 16px; display: flex; align-items: center; justify-content: center; color: purple; border: 1px dashed purple; border-radius: 4px;">
                底部空白区域
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <div style="margin-top: 20px; color: #999; font-size: 13px;">
      * 预期：异常表格在窗口宽度不足以容纳所有列时，表头与表体可能出现轻微水平偏移；正常表格出现横向滚动条，始终对齐。
      <br>* 如未复现，请尝试将浏览器窗口缩得更小（如 600-800px），或调整浏览器缩放比例（90%、110%）。
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const tableData = ref([
  {
    status: '正常',
    name: '三期-芳宇工程',
    address: '广东省,惠州市,博罗县',
    capacity: 755.16,
    gridTime: '2025-05-24',
    lastMaintenance: '2025-04-10',
    unit: '阳光运维',
    alarmCount: 3,
    defectRate: '92.5%',
    cleanTimes: 4,
    healthScore: 86,
    lastIssue: '逆变器风扇异常已更换'
  },
  {
    status: '异常',
    name: '二期-金富缘',
    address: '广东省,惠州市,博罗县',
    capacity: 778.72,
    gridTime: '2025-05-11',
    lastMaintenance: '2025-03-20',
    unit: '绿能服务',
    alarmCount: 8,
    defectRate: '68.3%',
    cleanTimes: 2,
    healthScore: 72,
    lastIssue: '组件污染严重待清洗'
  },
  {
    status: '正常',
    name: '金华市亿翔文体有限公司',
    address: '浙江省,金华市,金东区',
    capacity: 235.0,
    gridTime: '2025-10-15',
    lastMaintenance: '2025-02-15',
    unit: '自运维',
    alarmCount: 0,
    defectRate: '100%',
    cleanTimes: 1,
    healthScore: 95,
    lastIssue: '无异常'
  }
])
</script>