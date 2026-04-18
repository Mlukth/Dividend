// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

// 1. 保留你原有的手动定义路由（如果需要）
const manualRoutes = [
  { path: '/', name: 'SolarMonitor', component: () => import('../views/PowerStationPage.vue') },
  { path: '/contract', name: 'ContractPage', component: () => import('../views/ContractPage.vue') },
  { path: '/archive', name: 'ArchivePage', component: () => import('../views/ArchivePage.vue') },
  { path: '/archive-v4', name: 'ArchivePageV4', component: () => import('../views/ArchivePage-4.vue') },
  { path: '/inverter-tracker', name: 'InverterTracker', component: () => import('../views/InverterTracker.vue') },
  { path: '/test', name: 'TestPage', component: () => import('../views/test.vue') },
  { path: '/grades', name: 'Grades', component: () => import('../views/grades.vue') },
  // ... 原有抽卡页面等可同样保留，或也改为自动扫描（这里为了简洁，先保留）
]

// 2. 自动扫描 views 目录下所有 .vue 文件（包括子目录）
const modules = import.meta.glob('../views/**/*.vue')

// 3. 生成动态路由的函数
function generateAutoRoutes() {
  const autoRoutes = []
  for (const path in modules) {
    // 提取文件名（不含扩展名）
    const fileName = path.replace('../views/', '').replace('.vue', '')
    // 如果你希望忽略某些文件（比如以 _ 开头或特定名称），可在此过滤
    if (fileName.startsWith('_')) continue

    // 生成路由路径：将文件路径中的反斜杠转为斜杠，并处理中文/特殊字符
    // 例如 '抽卡/逆变器页面抽卡/test（哈基米的审美确实可以）' -> '/auto/抽卡/逆变器页面抽卡/test（哈基米的审美确实可以）'
    // 为防止与手动路由冲突，我们统一加一个前缀，比如 '/auto/'
    const routePath = `/auto/${fileName.replace(/\\/g, '/')}`

    // 生成路由名称：将路径中的非字母数字替换为 '-'，并转小写（用于编程导航）
    const routeName = fileName
      .replace(/[^\w\u4e00-\u9fa5]/g, '-')   // 保留中文和字母数字，其余变横线
      .replace(/-+/g, '-')
      .toLowerCase()

    autoRoutes.push({
      path: routePath,
      name: routeName || `route-${Date.now()}-${Math.random()}`, // 防止空名
      component: modules[path], // 直接使用 glob 导入的函数，支持懒加载
      meta: {
        title: fileName.split('/').pop(), // 可用作导航栏显示名称
        auto: true // 标记为自动路由，方便后续处理
      }
    })
  }
  return autoRoutes
}

const autoRoutes = generateAutoRoutes()

// 4. 合并路由（手动路由在前，自动路由在后）
const routes = [...manualRoutes, ...autoRoutes]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router