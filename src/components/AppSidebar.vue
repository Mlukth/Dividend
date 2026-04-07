<template>
  <aside class="sidebar">
    <div class="sidebar-main">
      <!-- 1. 一级导航：电站概览（无下级） -->
      <div 
        class="nav-item level1" 
        :class="{ active: activeNav === 'dashboard' }"
        @click="handleNavClick('dashboard')"
      >
        <span class="icon-emoji">📊</span>
        <span class="nav-text">电站概览</span>
      </div>

      <!-- 2. 一级导航：基本信息（自定义多级浮窗） -->
      <div 
        class="nav-item level1" 
        :class="{ active: activeNav === 'basic' }" 
        @click="handleNavClick('basic')"
      >
        <span class="icon-emoji">📄</span>
        <span class="nav-text">基本信息</span>
        <!-- 二级浮窗（绝对定位） -->
        <div class="sub-nav level2">
          <!-- 二级：电站发电信息 -->
          <div 
            class="nav-item level2" 
            :class="{ active: activeSubNav.basic === 'power' }" 
            @click.stop="handleSubNavClick('basic', 'power', '/basic/power')"
          >
            <span class="nav-text">电站发电信息</span>
            <span class="arrow">→</span>
            <!-- 三级浮窗 -->
            <div class="sub-nav level3">
              <div class="nav-item level3" @click.stop="handleSubNavClick('basic', 'power', '/basic/power/system')">系统构成信息</div>
              <div class="nav-item level3" @click.stop="handleSubNavClick('basic', 'power', '/basic/power/data')">发电数据</div>
              <div class="nav-item level3" @click.stop="handleSubNavClick('basic', 'power', '/basic/power/profit')">收益计算</div>
              <div class="nav-item level3" @click.stop="handleSubNavClick('basic', 'power', '/basic/power/monitor')">系统状态监控</div>
              <div class="nav-item level3" @click.stop="handleSubNavClick('basic', 'power', '/basic/power/env')">环境监测数据</div>
              <div class="nav-item level3" @click.stop="handleSubNavClick('basic', 'power', '/basic/power/evaluate')">电站评估数据</div>
            </div>
          </div>

          <!-- 二级：电站合同信息 -->
          <div 
            class="nav-item level2" 
            :class="{ active: activeSubNav.basic === 'contract' }" 
            @click.stop="handleSubNavClick('basic', 'contract', '/basic/contract')"
          >
            <span class="nav-text">电站合同信息</span>
            <span class="arrow">→</span>
            <!-- 三级浮窗 -->
            <div class="sub-nav level3">
              <div class="nav-item level3" @click.stop="handleSubNavClick('basic', 'contract', '/basic/contract/emc')">EMC 合同</div>
              <div class="nav-item level3" @click.stop="handleSubNavClick('basic', 'contract', '/basic/contract/epc')">EPC 合同</div>
              <div class="nav-item level3" @click.stop="handleSubNavClick('basic', 'contract', '/basic/contract/electricity')">购售电合同</div>
              <div class="nav-item level3" @click.stop="handleSubNavClick('basic', 'contract', '/basic/contract/financing')">融资合同信息</div>
              <div class="nav-item level3" @click.stop="handleSubNavClick('basic', 'contract', '/basic/contract/maintenance')">运维合同信息</div>
            </div>
          </div>

          <!-- 二级：电站档案信息 -->
          <div 
            class="nav-item level2" 
            :class="{ active: activeSubNav.basic === 'archive' }" 
            @click.stop="handleSubNavClick('basic', 'archive', '/basic/archive')"
          >
            <span class="nav-text">电站档案信息</span>
            <span class="arrow">→</span>
            <!-- 三级浮窗 -->
            <div class="sub-nav level3">
              <div class="nav-item level3" @click.stop="handleSubNavClick('basic', 'archive', '/basic/archive/file')">电站档案</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. 一级导航：运维管理 -->
      <div 
        class="nav-item level1" 
        :class="{ active: activeNav === 'operation' }" 
        @click="handleNavClick('operation')"
      >
        <span class="icon-emoji">🔧</span>
        <span class="nav-text">运维管理</span>
        <!-- 二级浮窗 -->
        <div class="sub-nav level2">
          <!-- 二级：定向检查 -->
          <div 
            class="nav-item level2" 
            :class="{ active: activeSubNav.operation === 'directional' }" 
            @click.stop="handleSubNavClick('operation', 'directional', '/operation/directional')"
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
                  <div class="nav-item level4" @click.stop="handleSubNavClick('operation', 'directional', '/operation/directional/alert')">告警排查</div>
                  <div class="nav-item level4" @click.stop="handleSubNavClick('operation', 'directional', '/operation/directional/power')">发电异常排查</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 二级：常规巡检 -->
          <div 
            class="nav-item level2" 
            :class="{ active: activeSubNav.operation === 'routine' }" 
            @click.stop="handleSubNavClick('operation', 'routine', '/operation/routine')"
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
                  <div class="nav-item level4" @click.stop="handleSubNavClick('operation', 'routine', '/operation/routine/pv-module')">光伏组件</div>
                  <div class="nav-item level4" @click.stop="handleSubNavClick('operation', 'routine', '/operation/routine/bracket')">固定支架</div>
                </div>
              </div>

              <!-- 三级：线路检查 -->
              <div class="nav-item level3">
                <span class="nav-text">线路检查</span>
                <span class="arrow">→</span>
                <!-- 四级浮窗 -->
                <div class="sub-nav level4">
                  <div class="nav-item level4" @click.stop="handleSubNavClick('operation', 'routine', '/operation/routine/dc-cable')">直流侧电缆</div>
                  <div class="nav-item level4" @click.stop="handleSubNavClick('operation', 'routine', '/operation/routine/ac-cable')">交流侧电缆</div>
                </div>
              </div>

              <!-- 三级：桥架水管检查 -->
              <div class="nav-item level3">
                <span class="nav-text">桥架水管检查</span>
                <span class="arrow">→</span>
                <!-- 四级浮窗 -->
                <div class="sub-nav level4">
                  <div class="nav-item level4" @click.stop="handleSubNavClick('operation', 'routine', '/operation/routine/bridge')">桥架外观检查</div>
                  <div class="nav-item level4" @click.stop="handleSubNavClick('operation', 'routine', '/operation/routine/water-pipe')">运维水管</div>
                </div>
              </div>

              <!-- 三级：逆变器检查 -->
              <div class="nav-item level3">
                <span class="nav-text">逆变器检查</span>
                <span class="arrow">→</span>
                <!-- 四级浮窗 -->
                <div class="sub-nav level4">
                  <div class="nav-item level4" @click.stop="handleSubNavClick('operation', 'routine', '/operation/routine/inverter/appearance')">外观检查</div>
                  <div class="nav-item level4" @click.stop="handleSubNavClick('operation', 'routine', '/operation/routine/inverter/install')">安装检查</div>
                  <div class="nav-item level4" @click.stop="handleSubNavClick('operation', 'routine', '/operation/routine/inverter/electric')">电气连接检查</div>
                  <div class="nav-item level4" @click.stop="handleSubNavClick('operation', 'routine', '/operation/routine/inverter/switch')">开关分合闸检查</div>
                  <div class="nav-item level4" @click.stop="handleSubNavClick('operation', 'routine', '/operation/routine/inverter/ground')">接地检查</div>
                  <div class="nav-item level4" @click.stop="handleSubNavClick('operation', 'routine', '/operation/routine/inverter/ui')">人机界面检查</div>
                </div>
              </div>

              <!-- 三级：并网柜检查 -->
              <div class="nav-item level3">
                <span class="nav-text">并网柜检查</span>
                <span class="arrow">→</span>
                <!-- 四级浮窗 -->
                <div class="sub-nav level4">
                  <div class="nav-item level4" @click.stop="handleSubNavClick('operation', 'routine', '/operation/routine/grid-cabinet')">并网柜检验</div>
                </div>
              </div>

              <!-- 三级：运维巡检记录（无四级） -->
              <div class="nav-item level3" @click.stop="handleSubNavClick('operation', 'routine', '/operation/routine/record')">运维巡检记录</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. 一级导航：AI 助手 -->
      <div 
        class="nav-item level1" 
        :class="{ active: activeNav === 'ai' }" 
        @click="handleNavClick('ai')"
      >
        <span class="icon-emoji">🤖</span>
        <span class="nav-text">AI 助手</span>
        <!-- 二级浮窗 -->
        <div class="sub-nav level2">
          <div class="nav-item level2" @click.stop="handleSubNavClick('ai', 'power-warning', '/ai/power-warning')">电站整体发电健康预警</div>
          <div class="nav-item level2" @click.stop="handleSubNavClick('ai', 'inverter-warning', '/ai/inverter-warning')">单逆变器发电健康预警</div>
          <div class="nav-item level2" @click.stop="handleSubNavClick('ai', 'module-health', '/ai/module-health')">组件发电健康</div>
          <div class="nav-item level2" @click.stop="handleSubNavClick('ai', 'evaluation', '/ai/evaluation')">电站评估</div>
          <div class="nav-item level2" @click.stop="handleSubNavClick('ai', 'suggestion', '/ai/suggestion')">电站提升建议</div>

          <!-- 二级：电站运维建议 -->
          <div class="nav-item level2">
            <span class="nav-text">电站运维建议</span>
            <span class="arrow">→</span>
            <!-- 三级浮窗 -->
            <div class="sub-nav level3">
              <div class="nav-item level3" @click.stop="handleSubNavClick('ai', 'maintenance', '/ai/maintenance/work-order')">推送工单</div>
              <div class="nav-item level3" @click.stop="handleSubNavClick('ai', 'maintenance', '/ai/maintenance/feedback')">协同反馈</div>
            </div>
          </div>

          <!-- 二级：低效电站查询 -->
          <div class="nav-item level2">
            <span class="nav-text">低效电站查询</span>
            <span class="arrow">→</span>
            <!-- 三级浮窗 -->
            <div class="sub-nav level3">
              <div class="nav-item level3" @click.stop="handleSubNavClick('ai', 'inefficient', '/ai/inefficient/history')">历史低效电站</div>
              <div class="nav-item level3" @click.stop="handleSubNavClick('ai', 'inefficient', '/ai/inefficient/info')">电站低效信息</div>
              <div class="nav-item level3" @click.stop="handleSubNavClick('ai', 'inefficient', '/ai/inefficient/equipment')">低效设备</div>
              <div class="nav-item level3" @click.stop="handleSubNavClick('ai', 'inefficient', '/ai/inefficient/contact')">联系信息</div>
              <div class="nav-item level3" @click.stop="handleSubNavClick('ai', 'inefficient', '/ai/inefficient/export')">导出低效电站</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 5. 一级导航：经营管理 -->
      <div 
        class="nav-item level1" 
        :class="{ active: activeNav === 'business' }" 
        @click="handleNavClick('business')"
      >
        <span class="icon-emoji">💰</span>
        <span class="nav-text">经营管理</span>
        <!-- 二级浮窗 -->
        <div class="sub-nav level2">
          <!-- 二级：电站经营信息 -->
          <div 
            class="nav-item level2" 
            :class="{ active: activeSubNav.business === 'info' }" 
            @click.stop="handleSubNavClick('business', 'info', '/business/info')"
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
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeNav = ref('dashboard') 
const activeSubNav = ref({
  basic: 'power',         
  operation: 'directional', 
  ai: '',                 
  business: 'info'        
})

// 一级导航点击事件（对应正确路由）
const handleNavClick = (navKey) => {
  activeNav.value = navKey
  switch(navKey) {
    case 'dashboard':
      router.push('/dashboard')
      break
    case 'basic':
      router.push('/basic-info')
      break
    case 'operation':
      router.push('/operation')
      break
    case 'ai':
      router.push('/ai-assistant')
      break
    case 'business':
      router.push('/business')
      break
    default:
      router.push('/dashboard')
  }
}

const setSubNav = (parentKey, subKey) => {
  activeSubNav.value[parentKey] = subKey
}

// 保留子导航点击事件（模板中仍在使用）
const handleSubNavClick = (parentKey, subKey, routePath) => {
  // 调用新增的setSubNav方法更新子导航状态
  setSubNav(parentKey, subKey)
  // 更新一级导航激活状态
  activeNav.value = parentKey
  
  // 跳转到对应路由
  if (routePath) {
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
  width: 200px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  z-index: 1000;
  overflow: visible !important;
}
.sidebar-main {
  padding: 10px;
  overflow: visible !important;
  position: relative;
}

/* 通用导航项样式 */
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

/* 一级导航项 */
.nav-item.level1 {
  padding: 12px 16px;
  color: #333;
  margin-bottom: 4px;
  position: relative;
  z-index: 1001;
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

/* 二级导航浮窗 + 项 */
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
  z-index: 1002;
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
  z-index: 1002;
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

/* 三级导航浮窗 + 项 */
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
  z-index: 1003;
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
  z-index: 1003;
}
.nav-item.level3:hover {
  background-color: #F5F7FA;
}
.nav-item.level3:hover > .sub-nav.level4 {
  display: block;
  opacity: 1;
  visibility: visible;
}

/* 四级导航浮窗 + 项 */
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
  z-index: 1004;
  margin-left: -1px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
}
.nav-item.level4 {
  padding: 8px 16px;
  color: #333;
  margin: 2px 6px;
  z-index: 1004;
}
.nav-item.level4:hover {
  background-color: #F5F7FA;
}

/* 图标和箭头 */
.icon-emoji {
  font-size: 18px;
  margin-right: 8px;
  vertical-align: middle;
}
.nav-text {
  flex: 1;
}
.arrow {
  font-size: 12px;
  color: #999;
  margin-left: 8px;
}

/* 浮窗 hover 保持显示 */
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
</style>