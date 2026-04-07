import { createRouter, createWebHistory } from 'vue-router'
import SolarMonitor from '../views/PowerStationPage.vue'
import ContractPage from '../views/ContractPage.vue'
import ArchivePage from '../views/ArchivePage.vue'

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
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router