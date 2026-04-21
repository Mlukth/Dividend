<template>
  <div class="top-nav">
    <div class="nav-header">
      <h3>页面导航</h3>
      <div class="header-actions">
        <el-button 
          :type="hasChanges ? 'primary' : 'default'" 
          :disabled="!hasChanges"
          @click="saveChanges"
        >
          锁定保存
        </el-button>
        <el-button text @click="resetTree">重置</el-button>
      </div>
    </div>
    <div class="folder-strip" ref="stripContainer">
      <div
        v-for="folder in displayTree"
        :key="folder.path"
        class="folder-card"
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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Folder, Document } from '@element-plus/icons-vue'
import { fileTree as originalTree } from '@/router'
import { cloneDeep } from 'lodash-es'
import { moveFiles } from '@/api/file'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()

const displayTree = ref([])
const dragInfo = ref({ file: null, sourceFolder: null })

// 记录已变更的文件（用于批量保存）
const pendingMoves = ref([])  // 格式: { sourcePath, targetFolder }

// 是否有未保存的更改
const hasChanges = computed(() => pendingMoves.value.length > 0)

const folderFiles = (folder) => {
  if (!folder.children || !Array.isArray(folder.children)) return []
  return folder.children.filter(c => c.type === 'file')
}

const folderFileCount = (folder) => folderFiles(folder).length

const initTree = () => {
  displayTree.value = cloneDeep(originalTree)
  pendingMoves.value = []
}
initTree()

const resetTree = () => {
  initTree()
  ElMessage.info('已重置为原始结构')
}

const navigateTo = (path) => {
  router.push(path).catch(err => {
    if (!err.message.includes('Avoided redundant navigation')) {
      console.warn('路由跳转失败:', err)
    }
  })
}

const isActive = (path) => {
  return decodeURIComponent(route.path) === decodeURIComponent(path)
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

  // 虚拟移动（更新前端显示）
  if (!targetFolder.children) targetFolder.children = []

  const sourceChildren = sourceFolder.children
  const fileIndex = sourceChildren.findIndex(c => c.type === 'file' && c.path === file.path)
  if (fileIndex !== -1) sourceChildren.splice(fileIndex, 1)

  const newFile = cloneDeep(file)
  targetFolder.children.push(newFile)
  sortFolderFiles(targetFolder)

  // 记录移动操作（去重：如果同一个文件已有记录，则更新目标文件夹）
  const existingIndex = pendingMoves.value.findIndex(m => m.sourcePath === file.path)
  if (existingIndex !== -1) {
    pendingMoves.value[existingIndex].targetFolder = targetFolder.path
  } else {
    // 只有当目标文件夹与原始文件夹不同时才记录
    const originalFolderPath = findOriginalFolderPath(file.path)
    if (originalFolderPath !== targetFolder.path) {
      pendingMoves.value.push({
        sourcePath: file.path,
        targetFolder: targetFolder.path
      })
    }
  }

  dragInfo.value = { file: null, sourceFolder: null }
}

// 辅助：根据文件路径查找原始所属文件夹
const findOriginalFolderPath = (filePath) => {
  for (const folder of originalTree) {
    if (folder.children?.some(f => f.type === 'file' && f.path === filePath)) {
      return folder.path
    }
  }
  return null
}

// 排序函数
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

// 保存更改：调用后端 API 真正移动文件
const saveChanges = async () => {
  if (pendingMoves.value.length === 0) {
    ElMessage.warning('没有需要保存的更改')
    return
  }

  try {
    const result = await moveFiles(pendingMoves.value)
    if (result.success) {
      ElMessage.success(`成功移动 ${result.results.filter(r => r.success).length} 个文件`)
      // 清空待保存列表
      pendingMoves.value = []
      // 刷新页面以重新加载路由和文件树（因为文件位置已改变）
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } else {
      ElMessage.error('保存失败：' + (result.error || '未知错误'))
    }
  } catch (err) {
    ElMessage.error('请求失败：' + err.message)
  }
}
</script>

<style scoped>
.top-nav {
  background: #f9fafb;
  border-bottom: 1px solid #e4e7ed;
  padding: 8px 16px 12px;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}
.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  flex-shrink: 0;
}
.header-actions {
  display: flex;
  gap: 8px;
}
.folder-strip {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 4px;
  flex: 1;
  min-height: 0;
}
.folder-card {
  flex: 0 0 200px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  max-height: 100%;
  border: 1px solid #e4e7ed;
}
.folder-header {
  padding: 6px 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  border-bottom: 1px solid #ebeef5;
  background: #fafafa;
  border-radius: 8px 8px 0 0;
  flex-shrink: 0;
}
.file-count {
  margin-left: auto;
  font-size: 12px;
  color: #909399;
  background: #e4e7ed;
  padding: 2px 6px;
  border-radius: 10px;
}
.file-list {
  flex: 1;
  overflow-y: auto;
  padding: 6px;
}
.file-item {
  padding: 6px 8px;
  margin: 2px 0;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.15s;
  user-select: none;
  font-size: 13px;
}
.file-item:hover {
  background: #ecf5ff;
}
.file-item.active {
  background: #e6f7ff;
  color: #1890ff;
  border-left: 3px solid #1890ff;
}
.file-item:active {
  cursor: grabbing;
}
.file-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}
</style>