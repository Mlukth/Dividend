<template>
  <!-- 电站概览搜索框模块（独立组件） -->
  <div class="filter-bar">
    <el-input placeholder="请输入电站名称" class="filter-input"></el-input>
    <el-select placeholder="电站状态" class="filter-select">
      <el-option label="全部" value=""></el-option>
      <el-option label="运行中" value="running"></el-option>
    </el-select>
    <el-button type="primary" class="filter-btn">查询</el-button>
  </div>
</template>

<script setup>
// 后续可添加搜索逻辑（如查询按钮点击事件/数据筛选）
// 可通过defineEmits向外传递查询参数
const emit = defineEmits(['search'])
const handleSearch = () => {
  // 示例：获取输入值后传递给父组件
  emit('search', { name: '', status: '' })
}
</script>

<style scoped>
.filter-bar {
  background: #fff;
  padding: 16px 24px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.filter-input, .filter-select {
  border-radius: 8px !important;
  min-width: 200px;
}
.filter-btn {
  border-radius: 8px !important;
  padding: 8px 20px;
}
</style>