// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { buildFileTree } from '@/utils/fileTree'

// 手动路由
const manualRoutes = [
  { path: '/', name: 'SolarMonitor', component: () => import('../views/PowerStationPage.vue') },
  { path: '/contract', name: 'ContractPage', component: () => import('../views/ContractPage.vue') },
  { path: '/archive', name: 'ArchivePage', component: () => import('../views/ArchivePage.vue') },
  { path: '/archive-v4', name: 'ArchivePageV4', component: () => import('../views/ArchivePage-4.vue') },
  { path: '/inverter-tracker', name: 'InverterTracker', component: () => import('../views/InverterTracker.vue') },
  { path: '/test', name: 'TestPage', component: () => import('../views/test.vue') },
  { path: '/grades', name: 'Grades', component: () => import('../views/grades.vue') },
]

// 扫描所有 .vue 文件
const modules = import.meta.glob('../views/**/*.vue')

// 生成动态路由（解决中文路径匹配问题）
function generateAutoRoutes() {
  const autoRoutes = []
  for (const path in modules) {
    const relativePath = path.replace('../views/', '').replace('.vue', '')
    if (relativePath.startsWith('_')) continue

    // 将路径中的反斜杠统一为斜杠，并对中文部分进行编码以匹配浏览器行为
    const encodedPath = relativePath
      .replace(/\\/g, '/')
      .split('/')
      .map(segment => encodeURIComponent(segment)) // 对每个路径段进行编码
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
        title: relativePath.split('/').pop(),
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

// 构建文件树（用于导航），但需要保证文件对象中的 routePath 与路由定义一致
export const fileTree = buildFileTree(modules)

export default router