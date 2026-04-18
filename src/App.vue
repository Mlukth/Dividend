<!-- src/App.vue -->
<template>
  <div>
    <div style="padding: 20px; background: #f5f5f5;">
      <!-- 手动定义的基础导航（如果你愿意也可以完全动态，但这里保留原有结构作为示例） -->
      <router-link v-for="route in mainNavRoutes" :key="route.path" :to="route.path" style="margin-right: 20px; text-decoration: none;">
        {{ route.meta?.title || route.name || route.path }}
      </router-link>

      <!-- 抽卡页面分组（可选） -->
      <br />
      <div style="margin-top:10px;">
        <span style="margin-right:10px; color:#666">抽卡页面：</span>
        <router-link v-for="route in drawRoutes" :key="route.path" :to="route.path" style="margin-right: 12px; text-decoration: none;">
          {{ route.meta?.title || route.name || route.path }}
        </router-link>
      </div>
    </div>

    <router-view />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { computed } from 'vue'

const router = useRouter()

// 获取所有路由
const allRoutes = router.options.routes

// 定义你想要在主导航显示的路由（根据 path 或 meta 筛选）
const mainNavRoutes = computed(() => {
  return allRoutes.filter(r => {
    // 例如：只显示路径不以 /auto/draw 开头的自动路由 + 手动路由中你想显示的
    // 这里简单演示：排除抽卡分组的路由（/auto/抽卡 开头），其余都显示在主导航
    return !r.path.startsWith('/auto/抽卡') && r.path !== '/'
  })
})

// 抽卡分组路由
const drawRoutes = computed(() => {
  return allRoutes.filter(r => r.path.startsWith('/auto/抽卡'))
})
</script>