<template>
  <!-- 电站概览表格模块（独立组件） -->
  <div class="table-container">
    <el-table :data="tableData" border stripe style="width: 100%">
      <el-table-column prop="name" label="电站名称"></el-table-column>
      <el-table-column prop="power" label="当前功率(kW)"></el-table-column>
      <el-table-column prop="status" label="状态">
        <template #default>
          <el-tag type="success" class="status-tag">运行中</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default>
          <el-button size="small" type="primary" class="operate-btn">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      :current-page="1"
      :page-size="10"
      layout="total, pager, jumper"
      :total="25"
      style="margin-top: 20px; text-align: right"
    ></el-pagination>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
// 接收父组件传递的表格数据
const props = defineProps({
  tableData: {
    type: Array,
    default: () => []
  }
})
</script>

<style scoped>
.table-container {
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  overflow-x: auto;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
:deep(.el-table__row:hover>td) {
  background-color: #F0F7FF !important;
  border-radius: 8px;
}
.status-tag {
  border-radius: 6px !important;
}
.operate-btn {
  border-radius: 6px !important;
}
:deep(.el-pagination .el-pager li) {
  border-radius: 6px !important;
}
</style>