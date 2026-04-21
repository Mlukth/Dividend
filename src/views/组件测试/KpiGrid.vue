<template>
  <div class="kpi-grid-wrapper">
    <!-- ✅ 修复1: 你的 EP 版本校验器不支持 type="link"，改回 type="text" 消除 Invalid prop 报错 -->
    <el-button type="text" @click="handleTest">
      <component v-if="testIcon" :is="testIcon" style="width: 16px; height: 16px; margin-right: 4px;" />
      测试操作
    </el-button>

    <!-- ✅ 修复2: el-radio 严格使用 value 绑定，文本放插槽，消除 label 弃用警告 -->
    <el-radio-group v-model="radioValue" style="margin: 16px 0;">
      <el-radio value="1">模式一</el-radio>
      <el-radio value="2">模式二</el-radio>
    </el-radio-group>

    <!-- ✅ 修复3: 安全渲染列表，空数据展示占位，彻底阻断 Missing prop 警告 -->
    <div v-if="safeItems.length" class="kpi-list">
      <div v-for="(item, idx) in safeItems" :key="idx" class="kpi-item">
        <component
          v-if="item.icon && resolvedIcons[item.icon]"
          :is="resolvedIcons[item.icon]"
          style="width: 20px; height: 20px; margin-right: 6px;"
        />
        <span>{{ item.label || item.name || '未命名' }}</span>
        <span class="kpi-value">{{ item.value ?? '-' }}</span>
      </div>
    </div>
    <el-empty v-else description="暂无数据" :image-size="80" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, markRaw } from 'vue'
import * as EpIcons from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps<{
  name?: string
  items?: Array<{ label?: string; name?: string; icon?: string; value?: any }>
}>()

const safeName = computed(() => props.name ?? 'kpi-default')
const safeItems = computed(() => props.items ?? [])

// ✅ 修复 Reactive 警告：组件对象必须用 markRaw 包裹，禁止被 Vue 深度代理
const testIcon = markRaw(EpIcons.Edit)

const resolvedIcons = computed(() => {
  const map: Record<string, any> = {}
  safeItems.value.forEach(item => {
    if (item.icon) {
      const IconComp = EpIcons[item.icon as keyof typeof EpIcons]
      if (IconComp) map[item.icon] = markRaw(IconComp)
    }
  })
  return map
})

// 默认选中模式二，与你截图保持一致
const radioValue = ref('2')

// ✅ 修复点击无反馈：添加 ElMessage 视觉提示 + 控制台日志
const handleTest = () => {
  ElMessage.success('按钮点击成功！')
  console.log('[KpiGrid] 测试操作已触发 | 当前模式:', radioValue.value)
}
</script>

<style scoped>
.kpi-grid-wrapper { padding: 16px; }
.kpi-list { display: flex; flex-direction: column; gap: 12px; margin-top: 16px; }
.kpi-item { display: flex; align-items: center; padding: 10px; background: #f5f7fa; border-radius: 6px; }
.kpi-value { margin-left: auto; font-weight: 600; color: #409eff; }
</style>
