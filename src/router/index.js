// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { buildFileTree } from '@/utils/fileTree'

// 手动路由
const manualRoutes = [
  { path: '/', name: 'SolarMonitor', component: () => import('../views/PowerStationPage.vue'), meta: { title: '电站管理' } },
  { path: '/contract', name: 'ContractPage', component: () => import('../views/ContractPage.vue'), meta: { title: '合同管理' } },
  { path: '/archive', name: 'ArchivePage', component: () => import('../views/ArchivePage.vue'), meta: { title: '档案管理' } },
  { path: '/archive-v4', name: 'ArchivePageV4', component: () => import('../views/ArchivePage-4.vue'), meta: { title: '档案管理V4' } },
  { path: '/inverter-tracker', name: 'InverterTracker', component: () => import('../views/InverterTracker.vue'), meta: { title: '逆变器追踪' } },
  { path: '/test', name: 'TestPage', component: () => import('../views/test.vue'), meta: { title: '测试页' } },
  { path: '/grades', name: 'Grades', component: () => import('../views/grades.vue'), meta: { title: '成绩表' } },
]

// 扫描所有 .vue 文件
const modules = import.meta.glob('../views/**/*.vue')

// 生成动态路由（解决中文路径匹配问题）
function generateAutoRoutes() {
  const autoRoutes = []
  for (const path in modules) {
    const relativePath = path.replace('../views/', '').replace('.vue', '')
    if (relativePath.startsWith('_')) continue

    // 提取文件名作为标题（不含扩展名）
    const fileName = relativePath.split('/').pop()
    
    const encodedPath = relativePath
      .replace(/\\/g, '/')
      .split('/')
      .map(segment => encodeURIComponent(segment))
      .join('/')
    
    const routePath = `/auto/${encodedPath}`
    
    const routeName = relativePath
      .replace(/[^\w\u4e00-\u9fa5]/g, '-')
      .replace(/-+/g, '-')
      .toLowerCase()

    autoRoutes.push({
      path: routePath,
      name: routeName || `route-${Date.now()}-${Math.random()}`,
      component: modules[path],
      meta: {
        title: fileName,          // 用于标签页标题
        auto: true
      }
    })
  }
  return autoRoutes
}

const autoRoutes = generateAutoRoutes()
const routes = [...manualRoutes, ...autoRoutes]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 构建文件树（用于导航）
export const fileTree = buildFileTree(modules)

// 全局后置守卫：更新标签页标题
router.afterEach((to) => {
  const title = to.meta?.title
  if (title) {
    document.title = `${title} · 视图管理器`
  } else {
    document.title = '视图管理器'
  }
})

export default router