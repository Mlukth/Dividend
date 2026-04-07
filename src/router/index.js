import { createRouter, createWebHistory } from 'vue-router'
import SolarMonitor from '../views/PowerStationPage.vue'
import ContractPage from '../views/ContractPage.vue'
import ArchivePage from '../views/ArchivePage.vue'
import ArchivePageV4 from '../views/ArchivePage-4.vue'
// 新增：导入逆变器追踪页面
import InverterTracker from '../views/InverterTracker.vue'
// 新增：导入测试页面
import TestPage from '../views/test.vue'
// 新增：导入等级管理页面
import Grades from '../views/grades.vue'

// 逆变器抽卡页面导入
import TestHajimi1 from '../views/抽卡/逆变器页面抽卡/test（哈基米的审美确实可以）.vue'
import TestHajimi2 from '../views/抽卡/逆变器页面抽卡/test（哈基米的想法，扣子实现）.vue'
import TestHajimi3 from '../views/抽卡/逆变器页面抽卡/test（哈基米的想法，豆包实现）.vue'
import TestChou1 from '../views/抽卡/逆变器页面抽卡/test（好丑好一般）.vue'
import TestChou2 from '../views/抽卡/逆变器页面抽卡/test（扣子给的，也很不错）.vue'
import InverterDetailKouzi from '../views/抽卡/逆变器页面抽卡/InverterDetail（扣子单一页面）.vue'
import InverterCardGrid from '../views/抽卡/逆变器页面抽卡/InverterCardGrid.vue'
// 最新：带表格的卡片网格页面
import InverterCardGridWithTable from '../views/抽卡/逆变器页面抽卡/InverterCardGridWithTable-fb8bc016d4.vue'

const routes = [
  {
    path: '/',
    name: 'SolarMonitor',
    component: SolarMonitor
  },
  {
    path: '/contract',
    name: 'ContractPage',
    component: ContractPage
  },
  {
    path: '/archive',
    name: 'ArchivePage',
    component: ArchivePage
  },
  {
    path: '/archive-v4',
    name: 'ArchivePageV4',
    component: ArchivePageV4
  },
  // 新增：逆变器追踪路由
  {
    path: '/inverter-tracker',
    name: 'InverterTracker',
    component: InverterTracker
  },
  // 新增：测试页面路由
  {
    path: '/test',
    name: 'TestPage',
    component: TestPage
  },
  // 新增：等级管理路由
  {
    path: '/grades',
    name: 'Grades',
    component: Grades
  },

  // ===================== 逆变器抽卡页面路由 =====================
  {
    path: '/draw/inverter-shenmei',
    name: 'TestHajimi1',
    component: TestHajimi1
  },
  {
    path: '/draw/inverter-kouzi',
    name: 'TestHajimi2',
    component: TestHajimi2
  },
  {
    path: '/draw/inverter-doubao',
    name: 'TestHajimi3',
    component: TestHajimi3
  },
  {
    path: '/draw/inverter-bad',
    name: 'TestChou1',
    component: TestChou1
  },
  {
    path: '/draw/inverter-good',
    name: 'TestChou2',
    component: TestChou2
  },
  {
    path: '/draw/inverter-detail-kouzi',
    name: 'InverterDetailKouzi',
    component: InverterDetailKouzi
  },
  {
    path: '/draw/inverter-card-grid',
    name: 'InverterCardGrid',
    component: InverterCardGrid
  },
  // 最新：带表格卡片路由
  {
    path: '/draw/inverter-card-grid-table',
    name: 'InverterCardGridWithTable',
    component: InverterCardGridWithTable
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router