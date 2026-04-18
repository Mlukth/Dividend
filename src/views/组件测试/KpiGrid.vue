<template>
  <div class="fix-container">
    <!-- ✅ 修复 1: type.text 弃用警告 → 官方已改为 type="link" -->
    <el-button type="link" @click="handleAction">
      <SafeIcon name="Edit" size="16px" />
      操作
    </el-button>

    <!-- ✅ 修复 2: el-radio label 弃用警告 → value 绑定值，label 仅用于显示文本 -->
    <el-radio-group v-model="radioValue">
      <el-radio value="opt1" label="选项一">选项一</el-radio>
      <el-radio value="opt2" label="选项二">选项二</el-radio>
    </el-radio-group>

    <!-- ✅ 修复 3: Missing required prop "name" & "items" → 显式传递必填属性，杜绝 undefined -->
    <KpiGrid
      name="kpi-dashboard"
      :items="kpiList ?? []"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SafeIcon from './SafeIcon.vue'
import KpiGrid from './KpiGrid.vue'

const radioValue = ref('opt1')

// ✅ 必须提供非空数组，彻底消除 Missing required prop: "items" 警告
const kpiList = ref([
  { id: 1, title: '数据A', value: '98%' },
  { id: 2, title: '数据B', value: '120' }
])

const handleAction = () => console.log('点击')
</script>
