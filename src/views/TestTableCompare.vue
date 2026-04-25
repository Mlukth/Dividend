<template>
  <div style="padding: 20px; background: #f0f2f5; min-height: 100vh;">
    <!-- 上方：故障版（overflow: hidden） -->
    <div style="margin-bottom: 40px;">
      <h3 style="color: #f56c6c; margin-top: 0;">上方：overflow: hidden（缩放会错位）</h3>
      <div class="station-list-module-bug">
        <el-table :data="tableData" border stripe class="station-table-bug"
          style="width: 100%; table-layout: fixed;">
          <el-table-column label="状态" align="center" width="80">
            <template #default="{ row }">
              <el-tag :type="row.healthStatus === 'normal' ? 'success' : 'danger'" size="small">
                {{ row.healthStatus === 'normal' ? '正常' : '异常' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="电站名称" align="center" width="160">
            <template #default="{ row }">
              <span>{{ row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="address" label="电站地址" align="center" width="180" show-overflow-tooltip />
          <el-table-column prop="capacity" label="组串总容量(kW)" align="center" width="140" />
          <el-table-column prop="gridTime" label="并网时间" align="center" width="110" />
          <el-table-column prop="lastMaintenanceTime" label="上次运维时间" align="center" width="120" />
          <el-table-column prop="maintenanceUnit" label="运维单位" align="center" width="140" />
          <el-table-column prop="alarmCount" label="告警数据" align="center" width="90" />
          <el-table-column prop="defectRate" label="消缺率(%)" align="center" width="100" />
          <el-table-column prop="cleanTimes" label="年清洗次数" align="center" width="110" />
          <el-table-column prop="healthScore" label="电站健康评分" align="center" width="120" />
          <el-table-column prop="lastIssue" label="上次运维问题处理情况" align="center" width="180" show-overflow-tooltip />
        </el-table>
      </div>
    </div>

    <!-- 下方：修复版（无 overflow: hidden） -->
    <div>
      <h3 style="color: #67c23a; margin-top: 0;">下方：overflow: visible / auto（缩放正常）</h3>
      <div class="station-list-module-fix">
        <el-table :data="tableData" border stripe class="station-table-fix"
          style="width: 100%; table-layout: fixed;">
          <el-table-column label="状态" align="center" width="80">
            <template #default="{ row }">
              <el-tag :type="row.healthStatus === 'normal' ? 'success' : 'danger'" size="small">
                {{ row.healthStatus === 'normal' ? '正常' : '异常' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="电站名称" align="center" width="160">
            <template #default="{ row }">
              <span>{{ row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="address" label="电站地址" align="center" width="180" show-overflow-tooltip />
          <el-table-column prop="capacity" label="组串总容量(kW)" align="center" width="140" />
          <el-table-column prop="gridTime" label="并网时间" align="center" width="110" />
          <el-table-column prop="lastMaintenanceTime" label="上次运维时间" align="center" width="120" />
          <el-table-column prop="maintenanceUnit" label="运维单位" align="center" width="140" />
          <el-table-column prop="alarmCount" label="告警数据" align="center" width="90" />
          <el-table-column prop="defectRate" label="消缺率(%)" align="center" width="100" />
          <el-table-column prop="cleanTimes" label="年清洗次数" align="center" width="110" />
          <el-table-column prop="healthScore" label="电站健康评分" align="center" width="120" />
          <el-table-column prop="lastIssue" label="上次运维问题处理情况" align="center" width="180" show-overflow-tooltip />
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const tableData = ref([
  {
    id: '1',
    name: '三期-芳宇工程',
    address: '广东省,惠州市,博罗县',
    capacity: 755.16,
    gridTime: '2025-05-24',
    lastMaintenanceTime: '2025-04-10',
    maintenanceUnit: '阳光运维',
    alarmCount: 3,
    defectRate: 92.5,
    cleanTimes: 4,
    healthScore: 86,
    lastIssue: '逆变器风扇异常已更换',
    healthStatus: 'normal'
  },
  {
    id: '2',
    name: '二期-金富缘',
    address: '广东省,惠州市,博罗县',
    capacity: 778.72,
    gridTime: '2025-05-11',
    lastMaintenanceTime: '2025-03-20',
    maintenanceUnit: '绿能服务',
    alarmCount: 8,
    defectRate: 68.3,
    cleanTimes: 2,
    healthScore: 72,
    lastIssue: '组件污染严重待清洗',
    healthStatus: 'abnormal'
  },
  {
    id: '3',
    name: '金华市亿翔文体有限公司',
    address: '浙江省,金华市,金东区',
    capacity: 235.0,
    gridTime: '2025-10-15',
    lastMaintenanceTime: '2025-02-15',
    maintenanceUnit: '自运维',
    alarmCount: 0,
    defectRate: 100,
    cleanTimes: 1,
    healthScore: 95,
    lastIssue: '无异常',
    healthStatus: 'normal'
  }
])
</script>

<style scoped>
/* 上方故障版：保留 overflow: hidden */
.station-list-module-bug {
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  overflow: hidden; /* 疑似导致错位的样式 */
}
.station-table-bug {
  width: 100%;
  border-radius: 8px;
  font-size: 13px;
  table-layout: fixed;
}
/* 下方修复版：移除 overflow: hidden */
.station-list-module-fix {
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.station-table-fix {
  width: 100%;
  border-radius: 8px;
  font-size: 13px;
  table-layout: fixed;
}
</style>