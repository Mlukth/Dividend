<template>
  <div class="style-b-stage">
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
        <el-empty description="右侧内容宽度固定，左侧菜单为半透明深色浮层" />
      </div>
    </div>

    <!-- 半透明深色菜单 -->
    <div class="float-sidebar-dark" :class="{ collapsed: isCollapsed }">
      <div v-if="!isCollapsed" class="sidebar-inner-dark">
        <div class="search-box-dark">
          <el-input v-model="searchQuery" placeholder="搜索电站" size="small" clearable>
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
        </div>
        <el-menu class="station-menu-dark" :default-active="selectedStation?.id" background-color="transparent" text-color="#e0e0e0" active-text-color="#ffffff">
          <el-menu-item v-for="s in filteredStations" :key="s.id" :index="s.id" @click="selectedStation = s">
            <el-icon><House /></el-icon>
            <span class="menu-text">
              <span class="dot" :style="{ background: s.state === 1 ? '#67c23a' : '#ff4d4f' }"></span>
              {{ s.name }}
            </span>
          </el-menu-item>
        </el-menu>
      </div>
      <!-- 圆形悬浮拉手 -->
      <div class="toggle-handle-dark" @click="isCollapsed = !isCollapsed">
        <el-icon :size="20"><ArrowLeft v-if="!isCollapsed" /><ArrowRight v-else /></el-icon>
      </div>
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

const filteredStations = computed(() => stations.value.filter(s => s.name.includes(searchQuery.value)))
</script>

<style scoped>
.style-b-stage {
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
.content-header { margin-bottom: 20px; }
.station-name { font-size: 18px; font-weight: 600; }
.content-body { background: #fff; padding: 40px; border-radius: 12px; text-align: center; }

.float-sidebar-dark {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 280px;
  background: rgba(30, 30, 40, 0.9);
  backdrop-filter: blur(4px);
  box-shadow: 4px 0 20px rgba(0,0,0,0.2);
  transition: transform 0.25s ease;
  z-index: 10;
}
.float-sidebar-dark.collapsed {
  transform: translateX(-280px);
}
.sidebar-inner-dark {
  width: 280px;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.search-box-dark {
  padding: 16px;
}
.station-menu-dark {
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
.toggle-handle-dark {
  position: absolute;
  right: -44px;
  bottom: 30px;
  width: 44px;
  height: 44px;
  background: rgba(30, 30, 40, 0.9);
  border-radius: 0 22px 22px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  cursor: pointer;
  box-shadow: 2px 2px 10px rgba(0,0,0,0.3);
  transition: 0.2s;
}
.toggle-handle-dark:hover {
  background: #409eff;
}
</style>