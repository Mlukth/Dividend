<template>
  <div class="style-c-stage">
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
        <el-empty description="右侧内容固定，左侧菜单为浅灰圆角风格" />
      </div>
    </div>

    <div class="float-sidebar-c" :class="{ collapsed: isCollapsed }">
      <div v-if="!isCollapsed" class="sidebar-inner-c">
        <div class="search-box-c">
          <el-input v-model="searchQuery" placeholder="搜索电站" size="small" clearable>
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
        </div>
        <el-menu class="station-menu-c" :default-active="selectedStation?.id">
          <el-menu-item v-for="s in filteredStations" :key="s.id" :index="s.id" @click="selectedStation = s">
            <el-icon><House /></el-icon>
            <span class="menu-text">
              <span class="dot" :style="{ background: s.state === 1 ? '#67c23a' : '#909399' }"></span>
              {{ s.name }}
            </span>
          </el-menu-item>
        </el-menu>
      </div>
      <!-- 胶囊拉手 -->
      <div class="toggle-handle-c" @click="isCollapsed = !isCollapsed">
        <el-icon><ArrowLeft v-if="!isCollapsed" /><ArrowRight v-else /></el-icon>
        <span class="handle-text">{{ isCollapsed ? '展开' : '收缩' }}</span>
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
.style-c-stage {
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

.float-sidebar-c {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 280px;
  background: #f8f9fc;
  border-right: 1px solid #e4e7ed;
  box-shadow: 4px 0 12px rgba(0,0,0,0.02);
  transition: transform 0.25s ease;
  z-index: 10;
}
.float-sidebar-c.collapsed {
  transform: translateX(-280px);
}
.sidebar-inner-c {
  width: 280px;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.search-box-c {
  padding: 16px;
}
.station-menu-c {
  flex: 1;
  border: none;
  background: transparent;
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
.toggle-handle-c {
  position: absolute;
  right: -50px;
  top: 30px;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 30px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  color: #606266;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  transition: 0.2s;
  white-space: nowrap;
}
.toggle-handle-c:hover {
  background: #ecf5ff;
  border-color: #409eff;
  color: #409eff;
}
.handle-text {
  font-size: 12px;
}
</style>