<template>
  <aside class="sidebar">
    <div class="sidebar-main">
      <!-- 1. 电站概览 -->
      <div 
        class="nav-item level1" 
        :class="{ active: activeNav === 'dashboard' }"
        @click="handleNavClick('dashboard')"
      >
        <el-icon class="menu-icon"><PieChart /></el-icon>
        <span class="nav-text">电站概览</span>
      </div>

      <!-- 2. 电站信息（新增） -->
      <div 
        class="nav-item level1" 
        :class="{ active: activeNav === 'station-info' }" 
        @click="handleNavClick('station-info')"
      >
        <el-icon class="menu-icon"><Sunny /></el-icon>
        <span class="nav-text">电站信息</span>
      </div>

      <!-- 3. 新运维管理（一级导航） -->
      <div 
        class="nav-item level1" 
        :class="{ active: activeNav === 'operation-new' }" 
        @click="handleNavClick('operation-new')"
      >
        <el-icon class="menu-icon"><Tools /></el-icon>
        <span class="nav-text">运维管理</span>
      </div>

      <!-- 4. AI 助手 -->
      <div 
        class="nav-item level1" 
        :class="{ active: activeNav === 'ai' }" 
        @click="handleNavClick('ai')"
      >
        <el-icon class="menu-icon"><Cpu /></el-icon>
        <span class="nav-text">AI 助手</span>
        <!-- 二级浮窗 -->
        <div class="sub-nav level2">
          <!-- 分组1：发电健康预警（蓝色） -->
          <div class="menu-group menu-group-primary">
            <div class="nav-item level2" @click.stop="handleSubNavClick('ai', 'power-warning', '/ai/power-warning')">电站整体发电健康预警</div>
            <div class="nav-item level2" @click.stop="handleSubNavClick('ai', 'power-warning', '/ai/power-warning')">单逆变器发电健康预警</div>
            <div class="nav-item level2" @click.stop="handleSubNavClick('ai', 'power-warning', '/ai/power-warning')">组件发电健康</div>
          </div>
          
          <!-- 分组2：电站评估与提升建议（紫色） -->
          <div class="menu-group menu-group-secondary">
            <div class="nav-item level2" @click.stop="handleSubNavClick('ai', 'evaluation', '/ai/evaluation')">电站评估</div>
            <div class="nav-item level2" @click.stop="handleSubNavClick('ai', 'evaluation', '/ai/evaluation')">电站提升建议</div>
          </div>
          
          <!-- 电站运维建议（指向 /ai/suggestion） -->
          <div class="nav-item level2" @click.stop="handleSubNavClick('ai', 'suggestion', '/ai/suggestion')">电站运维建议</div>
          
          <!-- 低效电站查询（指向 /ai/inefficient） -->
          <div class="nav-item level2" @click.stop="handleSubNavClick('ai', 'inefficient', '/ai/inefficient')">低效电站查询</div>
        </div>
      </div>

      <!-- 5. 经营管理 -->
      <div 
        class="nav-item level1" 
        :class="{ active: activeNav === 'business' }" 
        @click="handleNavClick('business')"
      >
        <el-icon class="menu-icon"><Money /></el-icon>
        <span class="nav-text">经营管理</span>
        <!-- 二级浮窗 -->
        <div class="sub-nav level2">
          <!-- 二级：电站经营信息（移除点击跳转） -->
          <div 
            class="nav-item level2" 
            :class="{ active: activeSubNav.business === 'info' }" 
            @click.stop=""
          >
            <span class="nav-text">电站经营信息</span>
            <span class="arrow">→</span>
            <!-- 三级浮窗 -->
            <div class="sub-nav level3">
              <div class="nav-item level3" @click.stop="handleSubNavClick('business', 'info', '/business/info/lease')">租赁结算</div>
              <div class="nav-item level3" @click.stop="handleSubNavClick('business', 'info', '/business/info/electricity-fee')">电费结算</div>
              <div class="nav-item level3" @click.stop="handleSubNavClick('business', 'info', '/business/info/purchase')">购电结算</div>
              <div class="nav-item level3" @click.stop="handleSubNavClick('business', 'info', '/business/info/financing')">融资还款结算</div>
              <div class="nav-item level3" @click.stop="handleSubNavClick('business', 'info', '/business/info/financial')">项目财务指标实测</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 6. 基本信息（移至最后） -->
      <div 
        class="nav-item level1" 
        :class="{ active: activeNav === 'basic' }" 
        @click="handleNavClick('basic')"
      >
        <el-icon class="menu-icon"><Document /></el-icon>
        <span class="nav-text">旧-基本信息</span>
        <!-- 二级浮窗 -->
        <div class="sub-nav level2">
          <!-- 二级：电站发电信息 -->
          <div 
            class="nav-item level2" 
            :class="{ active: activeSubNav.basic === 'power' }" 
            @click.stop="handleSubNavClick('basic', 'power', '/basic-info/power')"
          >
            <span class="nav-text">电站发电信息</span>
            <span class="arrow">→</span>
            <!-- 三级浮窗 -->
            <div class="sub-nav level3">
              <div class="nav-item level3" @click.stop="handleSubNavClick('basic', 'power', '/basic-info/power/system')">系统构成信息</div>
              <div class="nav-item level3" @click.stop="handleSubNavClick('basic', 'power', '/basic-info/power/data')">发电数据</div>
              <div class="nav-item level3" @click.stop="handleSubNavClick('basic', 'power', '/basic-info/power/profit')">收益计算</div>
              <div class="nav-item level3" @click.stop="handleSubNavClick('basic', 'power', '/basic-info/power/monitor')">系统状态监控</div>
              <div class="nav-item level3" @click.stop="handleSubNavClick('basic', 'power', '/basic-info/power/env')">环境监测数据</div>
              <div class="nav-item level3" @click.stop="handleSubNavClick('basic', 'power', '/basic-info/power/evaluate')">电站评估数据</div>
            </div>
          </div>

          <!-- 二级：电站合同信息 -->
          <div 
            class="nav-item level2" 
            :class="{ active: activeSubNav.basic === 'contract' }" 
            @click.stop="handleSubNavClick('basic', 'contract', '/basic-info/contract')"
          >
            <span class="nav-text">电站合同信息</span>
            <span class="arrow">→</span>
            <!-- 三级浮窗 -->
            <div class="sub-nav level3">
              <div class="nav-item level3" @click.stop="handleSubNavClick('basic', 'contract', '/basic-info/contract/emc')">EMC 合同</div>
              <div class="nav-item level3" @click.stop="handleSubNavClick('basic', 'contract', '/basic-info/contract/epc')">EPC 合同</div>
              <div class="nav-item level3" @click.stop="handleSubNavClick('basic', 'contract', '/basic-info/contract/electricity')">购售电合同</div>
              <div class="nav-item level3" @click.stop="handleSubNavClick('basic', 'contract', '/basic-info/contract/financing')">融资合同信息</div>
              <div class="nav-item level3" @click.stop="handleSubNavClick('basic', 'contract', '/basic-info/contract/maintenance')">运维合同信息</div>
            </div>
          </div>

          <!-- 二级：电站档案信息 -->
          <div 
            class="nav-item level2" 
            :class="{ active: activeSubNav.basic === 'archive' }" 
            @click.stop="handleSubNavClick('basic', 'archive', '/basic-info/archive')"
          >
            <span class="nav-text">电站档案信息</span>
            <span class="arrow">→</span>
            <!-- 三级浮窗 -->
            <div class="sub-nav level3">
              <div class="nav-item level3" @click.stop="handleSubNavClick('basic', 'archive', '/basic-info/archive/file')">电站档案</div>
            </div>
          </div>

          <!-- 二级：电站全量信息（新增） -->
          <div 
            class="nav-item level2" 
            :class="{ active: activeSubNav.basic === 'detail' }" 
            @click.stop="handleSubNavClick('basic', 'detail', '/basic-info/detail/1')"
          >
            <span class="nav-text">电站全量信息</span>
            <span class="arrow">→</span>
            <!-- 三级浮窗 -->
            <div class="sub-nav level3">
              <div class="nav-item level3" @click.stop="handleSubNavClick('basic', 'detail', '/basic-info/detail/1')">全量信息详情</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 7. 旧-运维管理（改名后移至基本信息后） -->
      <div 
        class="nav-item level1" 
        :class="{ active: activeNav === 'old-operation' }" 
        @click="handleNavClick('old-operation')"
      >
        <el-icon class="menu-icon"><Switch /></el-icon>
        <span class="nav-text">旧-运维管理</span>
        <!-- 二级浮窗 -->
        <div class="sub-nav level2">
          <!-- 二级：定向检查 -->
          <div 
            class="nav-item level2" 
            :class="{ active: activeSubNav.oldOperation === 'directional' }" 
            @click.stop="handleSubNavClick('oldOperation', 'directional', '/operation/directional')"
          >
            <span class="nav-text">定向检查</span>
            <span class="arrow">→</span>
            <!-- 三级浮窗 -->
            <div class="sub-nav level3">
              <div class="nav-item level3">
                <span class="nav-text">电站异常排查</span>
                <span class="arrow">→</span>
                <!-- 四级浮窗 -->
                <div class="sub-nav level4">
                  <div class="nav-item level4" @click.stop="handleSubNavClick('oldOperation', 'directional', '/operation/directional/alert')">告警排查</div>
                  <div class="nav-item level4" @click.stop="handleSubNavClick('oldOperation', 'directional', '/operation/directional/power')">发电异常排查</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 二级：常规巡检 -->
          <div 
            class="nav-item level2" 
            :class="{ active: activeSubNav.oldOperation === 'routine' }" 
            @click.stop="handleSubNavClick('oldOperation', 'routine', '/operation/routine')"
          >
            <span class="nav-text">常规巡检</span>
            <span class="arrow">→</span>
            <!-- 三级浮窗 -->
            <div class="sub-nav level3">
              <!-- 三级：光伏租金及固定 -->
              <div class="nav-item level3">
                <span class="nav-text">光伏租金及固定</span>
                <span class="arrow">→</span>
                <!-- 四级浮窗 -->
                <div class="sub-nav level4">
                  <div class="nav-item level4" @click.stop="handleSubNavClick('oldOperation', 'routine', '/operation/routine/pv-module')">光伏组件</div>
                  <div class="nav-item level4" @click.stop="handleSubNavClick('oldOperation', 'routine', '/operation/routine/bracket')">固定支架</div>
                </div>
              </div>

              <!-- 三级：线路检查 -->
              <div class="nav-item level3">
                <span class="nav-text">线路检查</span>
                <span class="arrow">→</span>
                <!-- 四级浮窗 -->
                <div class="sub-nav level4">
                  <div class="nav-item level4" @click.stop="handleSubNavClick('oldOperation', 'routine', '/operation/routine/dc-cable')">直流侧电缆</div>
                  <div class="nav-item level4" @click.stop="handleSubNavClick('oldOperation', 'routine', '/operation/routine/ac-cable')">交流侧电缆</div>
                </div>
              </div>

              <!-- 三级：桥架水管检查 -->
              <div class="nav-item level3">
                <span class="nav-text">桥架水管检查</span>
                <span class="arrow">→</span>
                <!-- 四级浮窗 -->
                <div class="sub-nav level4">
                  <div class="nav-item level4" @click.stop="handleSubNavClick('oldOperation', 'routine', '/operation/routine/bridge')">桥架外观检查</div>
                  <div class="nav-item level4" @click.stop="handleSubNavClick('oldOperation', 'routine', '/operation/routine/water-pipe')">运维水管</div>
                </div>
              </div>

              <!-- 三级：逆变器检查 -->
              <div class="nav-item level3">
                <span class="nav-text">逆变器检查</span>
                <span class="arrow">→</span>
                <!-- 四级浮窗 -->
                <div class="sub-nav level4">
                  <div class="nav-item level4" @click.stop="handleSubNavClick('oldOperation', 'routine', '/operation/routine/inverter/appearance')">外观检查</div>
                  <div class="nav-item level4" @click.stop="handleSubNavClick('oldOperation', 'routine', '/operation/routine/inverter/install')">安装检查</div>
                  <div class="nav-item level4" @click.stop="handleSubNavClick('oldOperation', 'routine', '/operation/routine/inverter/electric')">电气连接检查</div>
                  <div class="nav-item level4" @click.stop="handleSubNavClick('oldOperation', 'routine', '/operation/routine/inverter/switch')">开关分合闸检查</div>
                  <div class="nav-item level4" @click.stop="handleSubNavClick('oldOperation', 'routine', '/operation/routine/inverter/ground')">接地检查</div>
                  <div class="nav-item level4" @click.stop="handleSubNavClick('oldOperation', 'routine', '/operation/routine/inverter/ui')">人机界面检查</div>
                </div>
              </div>

              <!-- 三级：并网柜检查 -->
              <div class="nav-item level3">
                <span class="nav-text">并网柜检查</span>
                <span class="arrow">→</span>
                <!-- 四级浮窗 -->
                <div class="sub-nav level4">
                  <div class="nav-item level4" @click.stop="handleSubNavClick('oldOperation', 'routine', '/operation/routine/grid-cabinet')">并网柜检验</div>
                </div>
              </div>

              <!-- 三级：运维巡检记录（无四级） -->
              <div class="nav-item level3" @click.stop="handleSubNavClick('oldOperation', 'routine', '/operation/routine/record')">运维巡检记录</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  PieChart, Sunny, Tools, Cpu, Money, Document, Switch 
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const activeNav = ref('dashboard')
const activeSubNav = ref({
  basic: 'power',
  oldOperation: 'directional',
  ai: 'power-warning',
  business: 'info'
})

// 根据路径更新高亮
const updateActiveNavByRoute = (path) => {
  if (path.startsWith('/dashboard')) {
    activeNav.value = 'dashboard'
  } else if (path.startsWith('/station-info')) {
    activeNav.value = 'station-info'
  } else if (path.startsWith('/operation-new')) {
    activeNav.value = 'operation-new'
  } else if (path.startsWith('/operation')) {
    activeNav.value = 'old-operation'
    // 子菜单匹配
    if (path.startsWith('/operation/directional')) {
      activeSubNav.value.oldOperation = 'directional'
    } else if (path.startsWith('/operation/routine')) {
      activeSubNav.value.oldOperation = 'routine'
    }
  } else if (path.startsWith('/ai')) {
    activeNav.value = 'ai'
    // 根据路径设置子菜单
    if (path.includes('/evaluation')) {
      activeSubNav.value.ai = 'evaluation'
    } else if (path.includes('/suggestion')) {
      activeSubNav.value.ai = 'suggestion'
    } else if (path.includes('/inefficient')) {
      activeSubNav.value.ai = 'inefficient'
    } else {
      activeSubNav.value.ai = 'power-warning'
    }
  } else if (path.startsWith('/business')) {
    activeNav.value = 'business'
    // 经营管理子菜单固定为 info（因为只有这个二级菜单）
    activeSubNav.value.business = 'info'
  } else if (path.startsWith('/basic-info')) {
    activeNav.value = 'basic'
    if (path === '/basic-info/power' || path.startsWith('/basic-info/power/')) {
      activeSubNav.value.basic = 'power'
    } else if (path === '/basic-info/contract' || path.startsWith('/basic-info/contract/')) {
      activeSubNav.value.basic = 'contract'
    } else if (path === '/basic-info/archive' || path.startsWith('/basic-info/archive/')) {
      activeSubNav.value.basic = 'archive'
    } else if (path.startsWith('/basic-info/detail')) {
      activeSubNav.value.basic = 'detail'
    }
  } else {
    activeNav.value = 'dashboard'
  }
}

// 监听路由变化，自动更新高亮
watch(() => route.path, (newPath) => {
  updateActiveNavByRoute(newPath)
}, { immediate: true })

onMounted(() => {
  updateActiveNavByRoute(route.path)
})

// 一级导航点击（只负责跳转，高亮由路由监听自动处理）
const handleNavClick = (navKey) => {
  switch(navKey) {
    case 'dashboard':
      router.push('/dashboard')
      break
    case 'basic':
      router.push('/basic-info/power')
      break
    case 'station-info':
      router.push('/station-info/1')
      break
    case 'operation-new':
      router.push('/operation-new')
      break
    case 'old-operation':
      router.push('/operation')
      break
    case 'ai':
      router.push('/ai/power-warning')
      break
    case 'business':
      router.push('/business')
      break
    default:
      router.push('/dashboard')
  }
}

// 子导航状态更新（用于手动点击时同步）
const setSubNav = (parentKey, subKey) => {
  activeSubNav.value[parentKey] = subKey
  if (parentKey === 'basic') {
    const routeMap = {
      power: '/basic-info/power',
      contract: '/basic-info/contract',
      archive: '/basic-info/archive',
      detail: '/basic-info/detail/1'
    }
    if (routeMap[subKey]) {
      router.push(routeMap[subKey]).catch(err => {
        if (!err.message.includes('Avoided redundant navigation')) {
          console.error('路由跳转失败:', err)
        }
      })
    }
  }
}

// 子导航点击事件
const handleSubNavClick = (parentKey, subKey, routePath) => {
  setSubNav(parentKey, subKey)
  if (parentKey === 'oldOperation') {
    activeNav.value = 'old-operation'
  } else {
    activeNav.value = parentKey
  }
  if (routePath && parentKey !== 'basic') {
    router.push(routePath).catch(err => {
      if (!err.message.includes('Avoided redundant navigation')) {
        console.error('路由跳转失败:', err)
      }
    })
  }
}

defineExpose({
  activeNav,
  activeSubNav,
  handleNavClick
})
</script>

<style scoped>
/* 左侧导航样式 */
.sidebar {
  width: 220px;  /* 从 200px 调整为 220px，使图标+文字更舒适 */
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  z-index: 10;
  overflow: visible !important;
}
.sidebar-main {
  padding: 10px;
  overflow: visible !important;
  position: relative;
}

.nav-item {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  border-radius: 8px;
  transition: all 0.2s ease;
  position: relative;
  z-index: 1;
  min-height: 40px;
}

.nav-item.level1 {
  padding: 12px 16px;
  color: #333;
  margin-bottom: 4px;
  position: relative;
  z-index: 11;
}
.nav-item.level1.active {
  background-color: #EEF7FF;
  color: #0066CC;
  box-shadow: 0 2px 6px rgba(0,102,204,0.1);
}
.nav-item.level1:hover {
  background-color: #F5F7FA;
  transform: translateY(-1px);
}
.nav-item.level1:hover > .sub-nav.level2 {
  display: block;
  opacity: 1;
  visibility: visible;
}

/* 新增图标样式，替代原有 emoji */
.menu-icon {
  font-size: 20px;
  margin-right: 10px;
  vertical-align: middle;
  color: inherit;  /* 继承父级颜色，active 时自动变蓝 */
}

.sub-nav.level2 {
  display: none;
  position: absolute;
  top: 0;
  left: 100%;
  min-width: 220px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  padding: 4px 0;
  z-index: 12;
  margin-left: -1px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
}
.nav-item.level2 {
  padding: 8px 16px;
  color: #333;
  margin: 2px 6px;
  justify-content: space-between;
  z-index: 12;
}
.nav-item.level2.active {
  background: linear-gradient(90deg, #0066CC, #165DFF);
  color: #fff;
  box-shadow: 0 2px 6px rgba(0,102,204,0.2);
}
.nav-item.level2:hover {
  background-color: #F5F7FA;
}
.nav-item.level2:hover > .sub-nav.level3 {
  display: block;
  opacity: 1;
  visibility: visible;
}

.sub-nav.level3 {
  display: none;
  position: absolute;
  top: 0;
  left: 100%;
  min-width: 200px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  padding: 4px 0;
  z-index: 13;
  margin-left: -1px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
}
.nav-item.level3 {
  padding: 8px 16px;
  color: #333;
  margin: 2px 6px;
  justify-content: space-between;
  z-index: 13;
}
.nav-item.level3:hover {
  background-color: #F5F7FA;
}
.nav-item.level3:hover > .sub-nav.level4 {
  display: block;
  opacity: 1;
  visibility: visible;
}

.sub-nav.level4 {
  display: none;
  position: absolute;
  top: 0;
  left: 100%;
  min-width: 180px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  padding: 4px 0;
  z-index: 14;
  margin-left: -1px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
}
.nav-item.level4 {
  padding: 8px 16px;
  color: #333;
  margin: 2px 6px;
  z-index: 14;
}
.nav-item.level4:hover {
  background-color: #F5F7FA;
}

/* 原有 emoji 样式已弃用，可保留或删除 */
.icon-emoji {
  display: none;  /* 隐藏旧版 emoji 占位，不再使用 */
}

.nav-text {
  flex: 1;
}
.arrow {
  font-size: 12px;
  color: #999;
  margin-left: 8px;
}

.sub-nav:hover {
  display: block !important;
  opacity: 1 !important;
  visibility: visible !important;
}
.nav-item:hover > .sub-nav {
  display: block !important;
  opacity: 1 !important;
  visibility: visible !important;
}

/* 新增分组样式 */
.menu-group {
  position: relative;
  margin: 4px 0;
}
.menu-group::before {
  content: '';
  position: absolute;
  left: 0;
  top: 4px;
  bottom: 4px;
  width: 2px;
  border-radius: 1px;
}
.menu-group .nav-item.level2 {
  margin-left: 12px;
}
.menu-group-primary::before {
  background: linear-gradient(180deg, #0066CC 0%, #165DFF 100%);
}
.menu-group-secondary::before {
  background: linear-gradient(180deg, #9B59B6 0%, #8E44AD 100%);
}
</style>