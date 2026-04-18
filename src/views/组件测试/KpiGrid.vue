<template>
  <!-- 仅当图标组件有效时渲染，缺失时自动隐藏，绝不崩溃 -->
  <component
    v-if="resolvedIcon"
    :is="resolvedIcon"
    :style="{ width: size, height: size, color }"
  />
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
// 官方推荐的全量导入方式，确保名称完全一致，避免拼写错误
import * as ElementPlusIcons from '@element-plus/icons-vue'

const props = defineProps<{
  name: string
  size?: string
  color?: string
}>()

const resolvedIcon = ref<any>(null)

const loadIcon = (iconName: string) => {
  resolvedIcon.value = null
  if (!iconName) return

  // ✅ 严格校验：仅使用官方真实存在的图标
  const IconComponent = ElementPlusIcons[iconName as keyof typeof ElementPlusIcons]

  if (IconComponent) {
    resolvedIcon.value = IconComponent
  } else {
    // 🛡️ 容错逻辑：记录警告并隐藏，阻断错误冒泡，不导致路由/页面崩溃
    console.warn(`[SafeIcon] 图标 "${iconName}" 非 Element Plus 官方有效图标，已安全隐藏。`)
    resolvedIcon.value = null
  }
}

onMounted(() => loadIcon(props.name))
watch(() => props.name, loadIcon)
</script>
