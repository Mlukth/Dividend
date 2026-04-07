<template>
  <div class="layout-container">
    <!-- 左侧侧边栏 -->
    <aside class="sidebar" :class="{ 'is-collapsed': isCollapsed }">
      <!-- 顶部区域（仅展开时显示） -->
      <template v-if="!isCollapsed">
        <div class="back-bar" @click="handleBack">
          <el-icon class="back-icon"><ArrowLeft /></el-icon>
          <span class="back-text">返回</span>
        </div>

        <div class="company-selector">
          <el-dropdown trigger="click">
            <span class="company-name">
              {{ currentCompany }}
              <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item 
                  v-for="company in companies" 
                  :key="company"
                  @click="currentCompany = company"
                >
                  {{ company }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>

        <div class="search-area">
          <el-input 
            v-model="searchQuery" 
            placeholder="请输入电站名" 
            clearable
          >
            <template #prefix>
              <el-icon><House /></el-icon>
            </template>
            <template #suffix>
              <el-icon class="search-icon"><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </template>

      <!-- 电站列表区域（支持折叠） -->
      <el-menu
        :default-active="selectedStation.id"
        class="station-menu"
        :collapse="isCollapsed"
        @select="selectStation"
      >
        <el-menu-item 
          v-for="station in filteredStations" 
          :key="station.id"
          :index="station.id"
        >
          <el-icon class="menu-icon"><House /></el-icon>
          <!-- 绿色状态点（折叠时隐藏） -->
          <span v-if="!isCollapsed" class="status-dot"></span>
          <template #title>{{ station.name }}</template>
        </el-menu-item>
      </el-menu>
    </aside>

    <!-- 【核心修改】侧边栏折叠/展开开关（悬浮在边缘） -->
    <div class="collapse-toggle" @click="isCollapsed = !isCollapsed">
      <el-icon class="toggle-icon">
        <component :is="isCollapsed ? 'ArrowRight' : 'ArrowLeft'" />
      </el-icon>
    </div>

    <!-- 右侧主体区域 -->
    <main class="main-content" :class="{ 'is-expanded': isCollapsed }">
      <!-- 顶部标题 + Tab导航 -->
      <header class="top-header">
        <div class="station-title">
          <el-icon class="location-icon"><Location /></el-icon>
          <span>{{ selectedStation.name }}</span>
        </div>

        <el-tabs v-model="activeTab" class="nav-tabs" @tab-click="handleTabClick">
          <el-tab-pane 
            v-for="tab in tabs" 
            :key="tab.key"
            :label="tab.label"
            :name="tab.key"
          />
        </el-tabs>
      </header>

      <div class="content-placeholder">
        <p>内容展示区域</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Location, House, Search, ArrowDown, ArrowLeft, ArrowRight } from '@element-plus/icons-vue'

// --- 1. 状态控制 ---
const isCollapsed = ref(false) // 控制侧边栏折叠

// --- 2. 模拟数据 ---
const companies = ref([
  '深圳菱瑞新能源有限公司',
  '江西赣州新能源集团',
  '华东光伏运维中心'
])
const currentCompany = ref(companies.value[0])

const stations = ref([
  { id: '1', name: '裕同2000KW光伏发电', capacity: '2000KW' },
  { id: '2', name: '欧菲光1000KW光伏电站', capacity: '1000KW' },
  { id: '3', name: '赣州产业园5MW光伏项目', capacity: '5MW' }
])
const selectedStation = ref(stations.value[0])

const tabs = ref([
  { key: 'overview', label: '概览' },
  { key: 'view', label: '电站视图' },
  { key: 'trend', label: '趋势分析' },
  { key: 'report', label: '报表管理' },
  { key: 'device', label: '设备管理' },
  { key: 'alarm', label: '告警管理' },
  { key: 'dispersion', label: '离散率分析' },
  { key: 'user', label: '电站用户' }
])
const activeTab = ref('overview')

// --- 3. 搜索逻辑 ---
const searchQuery = ref('')
const filteredStations = computed(() => {
  if (!searchQuery.value) return stations.value
  return stations.value.filter(s => 
    s.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// --- 4. 交互方法 ---
const selectStation = (index) => {
  const station = stations.value.find(s => s.id === index)
  if (station) {
    selectedStation.value = station
    if (!isCollapsed.value) {
      ElMessage.success(`已切换至: ${station.name}`)
    }
  }
}

const handleTabClick = (tab) => {
  console.log('切换Tab至:', tab.props.label)
}

const handleBack = () => {
  ElMessage.info('执行返回上一级操作')
}
</script>

<style scoped>
/* 整体布局 */
.layout-container {
  position: relative; /* 为了给绝对定位的按钮做参照 */
  display: flex;
  height: 100vh;
  background-color: #f5f7fa;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

/* --- 左侧侧边栏样式 --- */
.sidebar {
  position: relative;
  z-index: 10;
  width: 280px;
  background-color: #ffffff;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease; /* 平滑展开/折叠动画 */
  overflow: hidden;
  flex-shrink: 0; /* 防止被挤压 */
}

/* 折叠状态下的宽度 */
.sidebar.is-collapsed {
  width: 64px;
}

/* 返回按钮 */
.back-bar {
  height: 56px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  cursor: pointer;
  color: #606266;
  transition: background-color 0.2s;
  border-bottom: 1px solid #f0f0f0;
}
.back-bar:hover {
  background-color: #f5f7fa;
  color: #409eff;
}
.back-icon {
  font-size: 18px;
  margin-right: 6px;
}
.back-text {
  font-size: 14px;
  font-weight: 500;
}

/* 企业下拉 */
.company-selector {
  padding: 20px 20px;
  border-bottom: 1px solid #f0f0f0;
}
.company-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.dropdown-icon {
  font-size: 14px;
  color: #909399;
  margin-left: 8px;
}

/* 搜索区 */
.search-area {
  padding: 16px 20px;
}

/* 电站列表 */
.station-menu {
  flex: 1;
  border-right: none;
  overflow-y: auto;
}
.station-menu .el-menu-item {
  height: 50px;
  line-height: 50px;
  margin: 4px 12px;
  border-radius: 6px;
  color: #606266;
}
.station-menu .el-menu-item.is-active {
  background-color: #ecf5ff;
  color: #409eff;
}
.menu-icon {
  margin-right: 8px;
  color: inherit;
}
/* 绿色在线状态点 */
.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  background-color: #67c23a;
  border-radius: 50%;
  margin-right: 8px;
  vertical-align: middle;
}

/* 【核心修改】悬浮式折叠/展开按钮 */
.collapse-toggle {
  position: absolute;
  left: 280px; /* 初始位置与侧边栏右侧对齐 */
  top: 50%;
  transform: translateY(-50%);
  z-index: 20; /* 确保浮在最上层 */
  
  /* 小矩形样式 */
  width: 16px;
  height: 48px;
  background-color: #ffffff;
  border: 1px solid #e4e7ed;
  border-left: none; /* 去掉左边框，使其看起来像附着在侧边栏上 */
  border-radius: 0 6px 6px 0; /* 右侧圆角 */
  box-shadow: 2px 0 8px rgba(0,0,0,0.05);
  
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #909399;
  transition: all 0.3s ease;
}

.collapse-toggle:hover {
  color: #409eff;
  width: 18px; /* hover 时稍微变宽一点增加交互感 */
}

/* 折叠状态下按钮的位置 */
.sidebar.is-collapsed + .collapse-toggle {
  left: 64px;
}

.toggle-icon {
  font-size: 14px;
  font-weight: bold;
}

/* --- 右侧主体样式 --- */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: margin-left 0.3s ease;
}

/* 占位内容区 */
.content-placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 16px;
}

/* 顶部通栏 */
.top-header {
  background-color: #ffffff;
  padding: 0 24px;
  border-bottom: 1px solid #e4e7ed;
}

/* 电站标题 */
.station-title {
  padding: 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
}
.location-icon {
  color: #409eff;
  margin-right: 8px;
}

/* Tab 导航 */
.nav-tabs {
  --el-tabs-header-height: 44px;
}
.nav-tabs :deep(.el-tabs__item) {
  font-size: 14px;
  padding: 0 20px;
}
</style>