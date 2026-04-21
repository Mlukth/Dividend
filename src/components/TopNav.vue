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
        <!-- 文件夹工具栏 -->
        <div class="folder-toolbar" v-if="folderFiles(folder).length > 0">
          <el-tooltip content="按修改时间倒序" placement="top">
            <el-button 
              :type="getFolderConfig(folder.path).sortByTime ? 'primary' : 'default'" 
              size="small"
              text
              @click="toggleSortByTime(folder.path)"
            >
              🕒
            </el-button>
          </el-tooltip>
          <el-tooltip content="分组视图" placement="top">
            <el-button 
              :type="getFolderConfig(folder.path).grouped ? 'primary' : 'default'" 
              size="small"
              text
              @click="toggleGrouped(folder.path)"
            >
              🗂️
            </el-button>
          </el-tooltip>
        </div>

        <!-- 扁平列表视图 -->
        <div v-if="!getFolderConfig(folder.path).grouped" class="file-list">
          <div
            v-for="file in getSortedFiles(folder)"
            :key="file.path"
            class="file-item"
            :class="{ active: isActive(file.routePath) }"
            draggable="true"
            @dragstart="handleDragStart($event, file, folder)"
            @click="navigateTo(file.routePath)"
            @contextmenu.prevent="openContextMenu($event, file, folder)"
          >
            <el-icon><Document /></el-icon>
            <span class="file-name" :title="file.name">{{ file.name }}</span>
          </div>
        </div>

        <!-- 分组视图 -->
        <div v-else class="grouped-file-list">
          <el-collapse v-model="activeGroups[folder.path]" class="group-collapse">
            <el-collapse-item
              v-for="group in getFolderGroups(folder)"
              :key="group.id"
              :name="group.id"
            >
              <template #title>
                <div 
                  class="group-title" 
                  @dblclick.stop="startRenameGroup(folder.path, group)"
                  @dragover.prevent
                  @drop="handleGroupDrop($event, folder, group)"
                >
                  <el-icon><FolderOpened /></el-icon>
                  <span v-if="renamingGroupId !== group.id" class="group-name">{{ getGroupDisplayName(group) }}</span>
                  <el-input
                    v-else
                    v-model="tempGroupName"
                    size="small"
                    @blur="finishRenameGroup(folder.path, group)"
                    @keyup.enter="finishRenameGroup(folder.path, group)"
                    @click.stop
                    ref="groupNameInput"
                  />
                  <span class="group-file-count">{{ group.files.length }}</span>
                </div>
              </template>
              <div 
                class="group-files"
                @dragover.prevent
                @drop="handleGroupDrop($event, folder, group)"
              >
                <div
                  v-for="file in group.files"
                  :key="file.path"
                  class="file-item"
                  :class="{ active: isActive(file.routePath) }"
                  draggable="true"
                  @dragstart="handleDragStart($event, file, folder, group)"
                  @click="navigateTo(file.routePath)"
                  @contextmenu.prevent="openContextMenu($event, file, folder, group)"
                >
                  <el-icon><Document /></el-icon>
                  <span class="file-name" :title="file.name">{{ file.name }}</span>
                </div>
                <!-- 空分组提示（用于拖拽放置区域） -->
                <div v-if="group.files.length === 0" class="empty-group-hint">
                  拖拽文件至此分组
                </div>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>
    </div>

    <!-- 右键菜单浮层 -->
    <Teleport to="body">
      <div
        v-if="contextMenu.visible"
        class="context-menu"
        :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
        @click.stop
      >
        <div class="menu-item" @click="openInVSCode(contextMenu.file)">
          <el-icon><Edit /></el-icon>
          <span>在 VS Code 中打开</span>
        </div>
        <div class="menu-item" @click="copyFilePath(contextMenu.file)">
          <el-icon><CopyDocument /></el-icon>
          <span>复制相对路径</span>
        </div>
        <div class="menu-item" @click="copyFileCode(contextMenu.file)">
          <el-icon><DocumentCopy /></el-icon>
          <span>复制组件代码（纯净版）</span>
        </div>
        <div class="menu-item" @click="copyRouteLink(contextMenu.file)">
          <el-icon><Link /></el-icon>
          <span>复制路由链接</span>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Folder, Document, FolderOpened, Edit, CopyDocument, DocumentCopy, Link } from '@element-plus/icons-vue'
import { fileTree as originalTree } from '@/router'
import { cloneDeep } from 'lodash-es'
import { moveFiles } from '@/api/file'
import { ElMessage } from 'element-plus'
import { groupFilesBySimilarName, sortFilesByTime, sortFilesBySimilarity } from '@/utils/groupFiles'

const router = useRouter()
const route = useRoute()

const displayTree = ref([])
const dragInfo = ref({ file: null, sourceFolder: null, sourceGroup: null })

// 右键菜单状态
const contextMenu = ref({
  visible: false,
  x: 0,
  y: 0,
  file: null,
  folder: null,
  group: null
})

// 记录已变更的文件（用于批量保存）
const pendingMoves = ref([])
const hasChanges = computed(() => pendingMoves.value.length > 0)

// 文件元数据映射表
const fileStatsMap = ref({})

// 每个文件夹的视图配置
const folderConfigMap = ref({})

// 分组重命名相关
const renamingGroupId = ref(null)
const tempGroupName = ref('')
const groupNameInput = ref(null)

// 用户自定义分组名存储
const customGroupNames = ref({})

// 每个文件夹的激活折叠项
const activeGroups = ref({})

// 初始化配置
const initFolderConfig = () => {
  const saved = localStorage.getItem('topnav-folder-config')
  if (saved) {
    try {
      folderConfigMap.value = JSON.parse(saved)
    } catch (e) {}
  }
  const savedNames = localStorage.getItem('topnav-group-names')
  if (savedNames) {
    try {
      customGroupNames.value = JSON.parse(savedNames)
    } catch (e) {}
  }
}
initFolderConfig()

const getFolderConfig = (folderPath) => {
  if (!folderConfigMap.value[folderPath]) {
    folderConfigMap.value[folderPath] = { grouped: false, sortByTime: false }
  }
  return folderConfigMap.value[folderPath]
}

const toggleSortByTime = (folderPath) => {
  const config = getFolderConfig(folderPath)
  config.sortByTime = !config.sortByTime
  saveFolderConfig()
  // 清除缓存，强制重新分组
  clearFolderCache(folderPath)
}

const toggleGrouped = (folderPath) => {
  const config = getFolderConfig(folderPath)
  config.grouped = !config.grouped
  saveFolderConfig()
  clearFolderCache(folderPath)
}

const saveFolderConfig = () => {
  localStorage.setItem('topnav-folder-config', JSON.stringify(folderConfigMap.value))
}

const saveCustomGroupNames = () => {
  localStorage.setItem('topnav-group-names', JSON.stringify(customGroupNames.value))
}

const getGroupDisplayName = (group) => {
  return customGroupNames.value[group.id] || group.name
}

const startRenameGroup = (folderPath, group) => {
  renamingGroupId.value = group.id
  tempGroupName.value = getGroupDisplayName(group)
  nextTick(() => {
    if (groupNameInput.value) {
      const input = Array.isArray(groupNameInput.value) ? groupNameInput.value[0] : groupNameInput.value
      input?.focus?.()
    }
  })
}

const finishRenameGroup = (folderPath, group) => {
  if (tempGroupName.value.trim() && tempGroupName.value.trim() !== group.autoName) {
    customGroupNames.value[group.id] = tempGroupName.value.trim()
  } else {
    delete customGroupNames.value[group.id]
  }
  saveCustomGroupNames()
  renamingGroupId.value = null
  tempGroupName.value = ''
}

const folderFiles = (folder) => {
  if (!folder.children || !Array.isArray(folder.children)) return []
  return folder.children.filter(c => c.type === 'file')
}

const folderFileCount = (folder) => folderFiles(folder).length

const getSortedFiles = (folder) => {
  const files = folderFiles(folder)
  const config = getFolderConfig(folder.path)
  if (config.sortByTime) {
    return sortFilesByTime(files)
  } else {
    return sortFilesBySimilarity(files)
  }
}

const folderGroupsCache = ref(new Map())
const getFolderGroups = (folder) => {
  const config = getFolderConfig(folder.path)
  const files = folderFiles(folder)
  if (!config.grouped) return []
  
  const cacheKey = `${folder.path}-${config.sortByTime ? 'time' : 'name'}`
  if (folderGroupsCache.value.has(cacheKey)) {
    return folderGroupsCache.value.get(cacheKey)
  }
  
  const sorted = config.sortByTime ? sortFilesByTime(files) : sortFilesBySimilarity(files)
  const groups = groupFilesBySimilarName(sorted)
  folderGroupsCache.value.set(cacheKey, groups)
  return groups
}

const clearFolderCache = (folderPath) => {
  for (const key of folderGroupsCache.value.keys()) {
    if (key.startsWith(folderPath)) {
      folderGroupsCache.value.delete(key)
    }
  }
}

const mergeStatsToTree = (nodes, statsMap) => {
  for (const node of nodes) {
    if (node.type === 'file') {
      const stat = statsMap[node.path]
      if (stat) {
        node.mtime = stat.mtime
        node.size = stat.size
      }
    } else if (node.type === 'folder' && node.children) {
      mergeStatsToTree(node.children, statsMap)
    }
  }
}

const fetchFileStats = async () => {
  try {
    const res = await fetch('/api/file-stats')
    const stats = await res.json()
    fileStatsMap.value = stats
    mergeStatsToTree(displayTree.value, stats)
    folderGroupsCache.value.clear()
  } catch (err) {
    console.warn('获取文件元数据失败', err)
  }
}

const initTree = () => {
  displayTree.value = cloneDeep(originalTree)
  pendingMoves.value = []
  if (Object.keys(fileStatsMap.value).length > 0) {
    mergeStatsToTree(displayTree.value, fileStatsMap.value)
  }
  folderGroupsCache.value.clear()
}

onMounted(async () => {
  await fetchFileStats()
  initTree()
  
  document.addEventListener('click', closeContextMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', closeContextMenu)
})

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

const handleDragStart = (event, file, folder, group = null) => {
  dragInfo.value = { file, sourceFolder: folder, sourceGroup: group }
  event.dataTransfer.effectAllowed = 'move'
}

const handleDrop = async (event, targetFolder) => {
  event.preventDefault()
  const { file, sourceFolder, sourceGroup } = dragInfo.value
  if (!file || !sourceFolder) return
  if (sourceFolder.path === targetFolder.path && !sourceGroup) return

  const targetFolderPath = targetFolder.path

  removeFileFromSource(file, sourceFolder, sourceGroup)

  if (!targetFolder.children) targetFolder.children = []
  const newFile = cloneDeep(file)
  targetFolder.children.push(newFile)
  sortFolderFiles(targetFolder)

  recordPendingMove(file.path, targetFolderPath)

  clearFolderCache(sourceFolder.path)
  clearFolderCache(targetFolder.path)
  dragInfo.value = { file: null, sourceFolder: null, sourceGroup: null }
}

const handleGroupDrop = (event, folder, targetGroup) => {
  event.preventDefault()
  event.stopPropagation()
  const { file, sourceFolder, sourceGroup } = dragInfo.value
  if (!file || !sourceFolder) return
  // 如果拖拽到同一个分组，忽略
  if (sourceGroup && sourceGroup.id === targetGroup.id) return

  removeFileFromSource(file, sourceFolder, sourceGroup)

  // 添加到目标分组
  const newFile = cloneDeep(file)
  targetGroup.files.push(newFile)
  
  // 重新计算目标分组的 latestMtime
  const times = targetGroup.files.map(f => f.mtime || 0)
  targetGroup.latestMtime = times.length ? Math.max(...times) : 0
  
  // 组内排序
  const config = getFolderConfig(folder.path)
  if (config.sortByTime) {
    targetGroup.files.sort((a, b) => (b.mtime || 0) - (a.mtime || 0))
  } else {
    targetGroup.files.sort((a, b) => similarityScore(a.name, b.name))
  }
  
  // 更新源分组（如果有）
  if (sourceGroup) {
    const srcTimes = sourceGroup.files.map(f => f.mtime || 0)
    sourceGroup.latestMtime = srcTimes.length ? Math.max(...srcTimes) : 0
    // 注意：不自动删除空分组，保留空壳以便继续拖拽
  }

  // 记录移动操作：目标文件夹路径 = 原文件夹路径 + 分组显示名
  const targetGroupName = getGroupDisplayName(targetGroup)
  const targetFolderPath = `${folder.path}/${targetGroupName}`

  recordPendingMove(file.path, targetFolderPath)

  // 清除当前文件夹缓存，强制重新渲染分组
  clearFolderCache(folder.path)
  
  dragInfo.value = { file: null, sourceFolder: null, sourceGroup: null }
}

const removeFileFromSource = (file, sourceFolder, sourceGroup) => {
  if (sourceGroup) {
    const idx = sourceGroup.files.findIndex(f => f.path === file.path)
    if (idx !== -1) sourceGroup.files.splice(idx, 1)
    const times = sourceGroup.files.map(f => f.mtime || 0)
    sourceGroup.latestMtime = times.length ? Math.max(...times) : 0
  } else {
    const sourceChildren = sourceFolder.children
    const fileIndex = sourceChildren.findIndex(c => c.type === 'file' && c.path === file.path)
    if (fileIndex !== -1) sourceChildren.splice(fileIndex, 1)
  }
}

const recordPendingMove = (filePath, targetFolderPath) => {
  const existingIndex = pendingMoves.value.findIndex(m => m.sourcePath === filePath)
  if (existingIndex !== -1) {
    pendingMoves.value[existingIndex].targetFolder = targetFolderPath
  } else {
    const originalFolderPath = findOriginalFolderPath(filePath)
    if (originalFolderPath !== targetFolderPath) {
      pendingMoves.value.push({
        sourcePath: filePath,
        targetFolder: targetFolderPath
      })
    }
  }
}

const findOriginalFolderPath = (filePath) => {
  for (const folder of originalTree) {
    if (folder.children?.some(f => f.type === 'file' && f.path === filePath)) {
      return folder.path
    }
  }
  return null
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

const openContextMenu = (event, file, folder, group = null) => {
  contextMenu.value = {
    visible: true,
    x: event.clientX,
    y: event.clientY,
    file,
    folder,
    group
  }
}

const closeContextMenu = () => {
  contextMenu.value.visible = false
}

const openInVSCode = (file) => {
  if (!file) return
  const absolutePath = `D:/photovoltaic/pv-station-admin/src/views/${file.path}.vue`.replace(/\//g, '\\')
  const vscodeUrl = `vscode://file/${absolutePath}`
  window.open(vscodeUrl, '_blank')
  ElMessage.success('已在 VS Code 中打开')
  closeContextMenu()
}

const copyFilePath = async (file) => {
  if (!file) return
  const relativePath = `src/views/${file.path}.vue`
  try {
    await navigator.clipboard.writeText(relativePath)
    ElMessage.success('路径已复制')
  } catch (err) {
    ElMessage.error('复制失败')
  }
  closeContextMenu()
}

const copyFileCode = async (file) => {
  if (!file) return
  try {
    // 使用新接口获取纯净源码
    const res = await fetch(`/api/file-content?path=${encodeURIComponent(file.path)}`)
    if (!res.ok) throw new Error('文件不存在')
    const code = await res.text()
    await navigator.clipboard.writeText(code)
    ElMessage.success('纯净代码已复制')
  } catch (err) {
    ElMessage.error('复制失败：' + err.message)
  }
  closeContextMenu()
}

const copyRouteLink = async (file) => {
  if (!file) return
  const fullUrl = window.location.origin + file.routePath
  try {
    await navigator.clipboard.writeText(fullUrl)
    ElMessage.success('路由链接已复制')
  } catch (err) {
    ElMessage.error('复制失败')
  }
  closeContextMenu()
}

const saveChanges = async () => {
  if (pendingMoves.value.length === 0) {
    ElMessage.warning('没有需要保存的更改')
    return
  }

  try {
    const result = await moveFiles(pendingMoves.value)
    if (result.success) {
      ElMessage.success(`成功移动 ${result.results.filter(r => r.success).length} 个文件`)
      pendingMoves.value = []
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
.folder-toolbar {
  padding: 4px 6px;
  display: flex;
  gap: 4px;
  border-bottom: 1px solid #ebeef5;
  background: #fafafa;
  flex-shrink: 0;
}
.file-list {
  flex: 1;
  overflow-y: auto;
  padding: 6px;
}
.grouped-file-list {
  flex: 1;
  overflow-y: auto;
  padding: 6px;
}
.group-collapse {
  border: none;
}
.group-collapse :deep(.el-collapse-item__header) {
  padding: 4px 8px;
  background: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 2px;
  font-weight: 500;
  height: auto;
  line-height: 1.5;
}
.group-collapse :deep(.el-collapse-item__wrap) {
  border: none;
}
.group-collapse :deep(.el-collapse-item__content) {
  padding: 4px 0 4px 12px;
}
.group-title {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
}
.group-name {
  flex: 1;
}
.group-file-count {
  margin-left: auto;
  font-size: 11px;
  color: #909399;
  background: #e4e7ed;
  padding: 1px 5px;
  border-radius: 8px;
}
.group-files {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-height: 30px;
}
.empty-group-hint {
  padding: 8px;
  text-align: center;
  color: #909399;
  font-size: 12px;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  margin: 4px 0;
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
.context-menu {
  position: fixed;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 4px 0;
  min-width: 180px;
  z-index: 9999;
  border: 1px solid #e4e7ed;
}
.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 13px;
  color: #1D2129;
  transition: background 0.15s;
}
.menu-item:hover {
  background: #ecf5ff;
}
.menu-item .el-icon {
  font-size: 16px;
  color: #606266;
}
</style>