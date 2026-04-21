<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <h3>页面导航</h3>
      <el-button text @click="resetTree">重置</el-button>
    </div>
    <div class="folder-columns" ref="columnsContainer">
      <div
        v-for="folder in displayTree"
        :key="folder.path"
        class="folder-column"
        @dragover.prevent
        @drop="handleDrop($event, folder)"
      >
        <div class="folder-header">
          <el-icon><Folder /></el-icon>
          <span>{{ folder.name }}</span>
          <span class="file-count">{{ folderFileCount(folder) }}</span>
        </div>
        <div class="file-list">
          <div
            v-for="file in folderFiles(folder)"
            :key="file.path"
            class="file-item"
            :class="{ active: isActive(file.routePath) }"
            draggable="true"
            @dragstart="handleDragStart($event, file, folder)"
            @click="navigateTo(file.routePath)"
          >
            <el-icon><Document /></el-icon>
            <span class="file-name" :title="file.name">{{ file.name }}</span>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Folder, Document } from '@element-plus/icons-vue'
import { fileTree as originalTree } from '@/router'
import { cloneDeep } from 'lodash-es'

const router = useRouter()
const route = useRoute()

const displayTree = ref([])
const dragInfo = ref({ file: null, sourceFolder: null })

const folderFiles = (folder) => {
  if (!folder.children || !Array.isArray(folder.children)) return []
  return folder.children.filter(c => c.type === 'file')
}

const folderFileCount = (folder) => folderFiles(folder).length

const initTree = () => {
  displayTree.value = cloneDeep(originalTree)
}
initTree()

const resetTree = () => initTree()

const navigateTo = (path) => {
  // 直接使用文件对象中存储的 routePath（已解码的中文路径）
  router.push(path).catch(err => {
    if (!err.message.includes('Avoided redundant navigation')) {
      console.warn('路由跳转失败:', err)
    }
  })
}

const isActive = (path) => {
  // 比较时需考虑 URL 可能被浏览器编码的情况，使用 decodeURI 处理
  return decodeURI(route.path) === decodeURI(path)
}

const handleDragStart = (event, file, folder) => {
  dragInfo.value = { file, sourceFolder: folder }
  event.dataTransfer.effectAllowed = 'move'
}

const handleDrop = async (event, targetFolder) => {
  event.preventDefault()
  const { file, sourceFolder } = dragInfo.value
  if (!file || !sourceFolder) return
  if (sourceFolder.path === targetFolder.path) return

  if (!targetFolder.children) targetFolder.children = []

  const sourceChildren = sourceFolder.children
  const fileIndex = sourceChildren.findIndex(c => c.type === 'file' && c.path === file.path)
  if (fileIndex !== -1) sourceChildren.splice(fileIndex, 1)

  const newFile = cloneDeep(file)
  targetFolder.children.push(newFile)
  sortFolderFiles(targetFolder)

  dragInfo.value = { file: null, sourceFolder: null }
}

const sortFolderFiles = (folder) => {
  if (!folder.children) return
  const files = folder.children.filter(c => c.type === 'file')
  const folders = folder.children.filter(c => c.type === 'folder')
  files.sort((a, b) => similarityScore(a.name, b.name))
  folder.children = [...folders, ...files]
}

const similarityScore = (a, b) => {
  let i = 0
  const minLen = Math.min(a.length, b.length)
  while (i < minLen && a[i] === b[i]) i++
  return -i
}
</script>

<style scoped>
/* 样式保持不变，略 */
.sidebar { width: 100%; height: 100%; background: #f9fafb; display: flex; flex-direction: column; overflow: hidden; }
.sidebar-header { padding: 16px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e4e7ed; }
.folder-columns { flex: 1; display: flex; overflow-x: auto; overflow-y: hidden; padding: 12px 8px; gap: 16px; }
.folder-column { flex: 0 0 220px; background: #fff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); display: flex; flex-direction: column; max-height: 100%; border: 1px solid #e4e7ed; }
.folder-header { padding: 12px 16px; font-weight: 600; display: flex; align-items: center; gap: 6px; border-bottom: 1px solid #ebeef5; background: #fafafa; border-radius: 8px 8px 0 0; }
.file-count { margin-left: auto; font-size: 12px; color: #909399; background: #e4e7ed; padding: 2px 8px; border-radius: 10px; }
.file-list { flex: 1; overflow-y: auto; padding: 8px; }
.file-item { padding: 8px 12px; margin: 2px 0; border-radius: 6px; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: all 0.15s; user-select: none; }
.file-item:hover { background: #ecf5ff; }
.file-item.active { background: #e6f7ff; color: #1890ff; border-left: 3px solid #1890ff; }
.file-item:active { cursor: grabbing; }
.file-name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; font-size: 13px; }
</style>