<template>
  <div class="tab-time-range-container">
    <div v-for="version in versions" :key="version.id" class="version-item">
      <h3 class="version-title">{{ version.name }}</h3>
      <div class="tab-buttons" :class="version.wrapperClass">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          class="tab-button"
          :class="[
            currentActive[version.id] === tab.value ? version.activeClass : version.inactiveClass
          ]"
          @click="currentActive[version.id] = tab.value"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const tabs = [
  { label: '日', value: 'day' },
  { label: '月', value: 'month' },
  { label: '年', value: 'year' },
  { label: '总', value: 'total' }
]

const currentActive = ref({
  v1: 'day',
  v2: 'day',
  v3: 'day',
  v4: 'day',
  v5: 'day',
  v6: 'day',
  v7: 'day',
  v8: 'day',
  v9: 'day',
  v10: 'day'
})

const versions = [
  {
    id: 'v1',
    name: '版本1：原始风格',
    wrapperClass: 'wrapper-v1',
    activeClass: 'active-v1',
    inactiveClass: 'inactive-v1'
  },
  {
    id: 'v2',
    name: '版本2：大圆角渐变',
    wrapperClass: 'wrapper-v2',
    activeClass: 'active-v2',
    inactiveClass: 'inactive-v2'
  },
  {
    id: 'v3',
    name: '版本3：胶囊形态',
    wrapperClass: 'wrapper-v3',
    activeClass: 'active-v3',
    inactiveClass: 'inactive-v3'
  },
  {
    id: 'v4',
    name: '版本4：底部线条指示',
    wrapperClass: 'wrapper-v4',
    activeClass: 'active-v4',
    inactiveClass: 'inactive-v4'
  },
  {
    id: 'v5',
    name: '版本5：卡片阴影',
    wrapperClass: 'wrapper-v5',
    activeClass: 'active-v5',
    inactiveClass: 'inactive-v5'
  },
  {
    id: 'v6',
    name: '版本6：扁平无边框',
    wrapperClass: 'wrapper-v6',
    activeClass: 'active-v6',
    inactiveClass: 'inactive-v6'
  },
  {
    id: 'v7',
    name: '版本7：毛玻璃质感',
    wrapperClass: 'wrapper-v7',
    activeClass: 'active-v7',
    inactiveClass: 'inactive-v7'
  },
  {
    id: 'v8',
    name: '版本8：复古粗边框',
    wrapperClass: 'wrapper-v8',
    activeClass: 'active-v8',
    inactiveClass: 'inactive-v8'
  },
  {
    id: 'v9',
    name: '版本9：简约淡色',
    wrapperClass: 'wrapper-v9',
    activeClass: 'active-v9',
    inactiveClass: 'inactive-v9'
  },
  {
    id: 'v10',
    name: '版本10：科技发光',
    wrapperClass: 'wrapper-v10',
    activeClass: 'active-v10',
    inactiveClass: 'inactive-v10'
  }
]
</script>

<style scoped>
.tab-time-range-container {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.version-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.version-title {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.tab-buttons {
  display: flex;
  gap: 8px;
}

.tab-button {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

/* 版本1：原始风格 */
.wrapper-v1 .tab-button {
  border-radius: 12px;
}
.active-v1 {
  background-color: #2196f3;
  color: white;
}
.inactive-v1 {
  background-color: white;
  color: #666;
  border: 1px solid #e0e0e0;
}

/* 版本2：大圆角渐变 */
.wrapper-v2 .tab-button {
  border-radius: 24px;
}
.active-v2 {
  background: linear-gradient(135deg, #2196f3, #42a5f5);
  color: white;
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
}
.inactive-v2 {
  background-color: #f5f5f5;
  color: #666;
  border: 1px solid #e0e0e0;
}

/* 版本3：胶囊形态 */
.wrapper-v3 .tab-button {
  border-radius: 30px;
  padding: 10px 24px;
}
.active-v3 {
  background-color: #2196f3;
  color: white;
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.2);
}
.inactive-v3 {
  background-color: white;
  color: #666;
  border: 1px solid #2196f3;
}

/* 版本4：底部线条指示 */
.wrapper-v4 .tab-button {
  border-radius: 0;
  padding: 10px 16px;
  border-bottom: 3px solid transparent;
}
.active-v4 {
  background-color: transparent;
  color: #2196f3;
  border-bottom-color: #2196f3;
  font-weight: 500;
}
.inactive-v4 {
  background-color: transparent;
  color: #666;
  border-bottom-color: transparent;
}

/* 版本5：卡片阴影 */
.wrapper-v5 .tab-button {
  border-radius: 12px;
}
.active-v5 {
  background-color: white;
  color: #2196f3;
  box-shadow: 0 4px 16px rgba(33, 150, 243, 0.2);
  border: 1px solid #2196f3;
}
.inactive-v5 {
  background-color: white;
  color: #666;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #e0e0e0;
}

/* 版本6：扁平无边框 */
.wrapper-v6 .tab-button {
  border-radius: 0;
  padding: 10px 18px;
}
.active-v6 {
  background-color: #e3f2fd;
  color: #2196f3;
}
.inactive-v6 {
  background-color: transparent;
  color: #666;
}

/* 版本7：毛玻璃质感 */
.wrapper-v7 {
  background-color: rgba(255, 255, 255, 0.8);
  padding: 4px;
  border-radius: 12px;
  backdrop-filter: blur(8px);
}
.wrapper-v7 .tab-button {
  border-radius: 8px;
}
.active-v7 {
  background-color: rgba(33, 150, 243, 0.9);
  color: white;
}
.inactive-v7 {
  background-color: transparent;
  color: #666;
}

/* 版本8：复古粗边框 */
.wrapper-v8 .tab-button {
  border-radius: 4px;
  border-width: 2px;
}
.active-v8 {
  background-color: #2196f3;
  color: white;
  border: 2px solid #2196f3;
}
.inactive-v8 {
  background-color: white;
  color: #666;
  border: 2px solid #9e9e9e;
}

/* 版本9：简约淡色 */
.wrapper-v9 .tab-button {
  border-radius: 16px;
  padding: 8px 20px;
}
.active-v9 {
  background-color: #bbdefb;
  color: #1976d2;
  font-weight: 500;
}
.inactive-v9 {
  background-color: #f5f5f5;
  color: #757575;
}

/* 版本10：科技发光 */
.wrapper-v10 .tab-button {
  border-radius: 12px;
}
.active-v10 {
  background-color: #2196f3;
  color: white;
  box-shadow: 0 0 12px rgba(33, 150, 243, 0.6);
}
.inactive-v10 {
  background-color: #1a237e;
  color: #90caf9;
  border: 1px solid #2196f3;
}
</style>