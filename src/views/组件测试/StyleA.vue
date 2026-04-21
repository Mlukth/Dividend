<template>
  <div class="style-a-stage">
    <!-- 右侧固定内容区 -->
    <div class="fixed-content">
      <div class="content-header">
        <span class="station-name">当前电站：{{ selectedStation?.name || '请选择' }}</span>
        <el-tabs v-model="activeTab" class="demo-tabs">
          <el-tab-pane label="明细" name="detail" />
          <el-tab-pane label="结算" name="settlement" />
          <el-tab-pane label="对比" name="compare" />
        </el-tabs>
      </div>
      <div class="content-body">
        <el-empty description="右侧内容区域宽度固定，不受左侧菜单状态影响" />
        <p class="note">当前激活标签：{{ activeTab }}</p>
      </div>
    </div>

    <!-- 左侧菜单浮层 (绝对定位) -->
    <div class="float-sidebar" :class="{ collapsed: isCollapsed }">
      <div v-if="!isCollapsed" class="sidebar-inner">
        <div class="search-box">
          <el-input v-model="searchQuery" placeholder="搜索电站" size="small" clearable>
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
        </div>
        <el-menu class="station-menu" :default-active="selectedStation?.id">
          <el-menu-item v-for="s in filteredStations" :key="s.id" :index="s.id" @click="selectedStation = s">
            <el-icon><House /></el-icon>
            <span class="menu-text">
              <span class="dot" :style="{ background: s.state === 1 ? '#67c23a' : '#909399' }"></span>
              {{ s.name }}
            </span>
          </el-menu-item>
        </el-menu>
      </div>
    </div>

    <!-- 拉手独立于侧边栏，始终可见 -->
    <div 
      class="toggle-handle" 
      :class="{ 'handle-collapsed': isCollapsed }"
      @click="isCollapsed = !isCollapsed"
    >
      <el-icon><ArrowLeft v-if="!isCollapsed" /><ArrowRight v-else /></el-icon>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Search, House, ArrowLeft, ArrowRight } from '@element-plus/icons-vue'

const isCollapsed = ref(false)
const searchQuery = ref('')
const activeTab = ref('detail')

const stations = ref([
  { id: '1', name: '三期-芳宇工程', state: 1 },
  { id: '2', name: '二期-金富缘', state: 2 },
  { id: '3', name: '一期-罗斯热熔胶', state: 1 },
])
const selectedStation = ref(stations.value[0])

const filteredStations = computed(() => {
  return stations.value.filter(s => s.name.includes(searchQuery.value))
})
</script>

<style scoped>
.style-a-stage {
  position: relative;
  width: 100%;
  height: 600px;
  background: #f5f7fa;
}

.fixed-content {
  width: 100%;
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
  overflow-y: auto;
}

.content-header {
  margin-bottom: 20px;
}
.station-name {
  font-size: 18px;
  font-weight: 600;
}
.content-body {
  background: #fff;
  padding: 40px;
  border-radius: 12px;
  text-align: center;
}
.note {
  margin-top: 16px;
  color: #86909c;
}

/* 浮层菜单 */
.float-sidebar {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 280px;
  background: #ffffff;
  box-shadow: 2px 0 12px rgba(0,0,0,0.05);
  transition: transform 0.25s ease;
  z-index: 10;
}
.float-sidebar.collapsed {
  transform: translateX(-280px);
}
.sidebar-inner {
  width: 280px;
  display: flex;
  flex-direction: column;
  height: 100%;
  border-right: 1px solid #e4e7ed;
}
.search-box {
  padding: 16px;
}
.station-menu {
  flex: 1;
  border: none;
}
.menu-text {
  display: flex;
  align-items: center;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
}

/* 拉手独立定位，始终在侧边栏右侧边缘 */
.toggle-handle {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: 280px; /* 默认侧边栏展开时的宽度 */
  width: 18px;
  height: 60px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-left: none;
  border-radius: 0 8px 8px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #606266;
  z-index: 11;
  transition: left 0.25s ease, background-color 0.2s;
}
.toggle-handle:hover {
  background: #ecf5ff;
  color: #409eff;
}

/* 收缩时拉手移动到左侧边缘 */
.toggle-handle.handle-collapsed {
  left: 0;
  border-left: 1px solid #e4e7ed;
  border-radius: 0 8px 8px 0;
}
</style>