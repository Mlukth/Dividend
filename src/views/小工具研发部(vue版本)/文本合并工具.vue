<template>
  <div class="text-merger-tool">
    <h2 class="tool-title">
      <el-icon class="title-icon"><DocumentCopy /></el-icon>
      文本合并与计数工具
    </h2>

    <!-- 排序切换栏 + 导入导出工具条 -->
    <div class="sort-bar card">
      <div class="sort-section">
        <span class="sort-label">排序方式：</span>
        <div class="sort-options">
          <button 
            class="sort-btn" 
            :class="{ active: sortMode === 'custom' }" 
            @click="switchSortMode('custom')"
          >
            <el-icon class="btn-icon"><List /></el-icon>
            自定义排列
          </button>
          <button 
            class="sort-btn" 
            :class="{ active: sortMode === 'usage' }" 
            @click="switchSortMode('usage')"
          >
            <el-icon class="btn-icon"><TrendCharts /></el-icon>
            使用次数排行
          </button>
        </div>
        <span v-if="sortMode === 'usage'" class="sort-hint">（使用频次越高越靠前）</span>
      </div>

      <!-- 导入导出工具区 -->
      <div class="import-export-section">
        <button class="tool-btn" @click="exportPresets" title="导出预设为JSON文件">
          <el-icon><Download /></el-icon>
          导出
        </button>
        <button class="tool-btn" @click="triggerImport">
          <el-icon><Upload /></el-icon>
          导入
        </button>
        <button class="tool-btn" @click="resetToDefault" title="重置为默认示例">
          <el-icon><RefreshLeft /></el-icon>
          重置
        </button>
        <!-- 隐藏的文件输入框用于导入 -->
        <input 
          ref="fileInputRef" 
          type="file" 
          accept=".json,application/json" 
          style="display: none" 
          @change="handleImportFile"
        />
      </div>
    </div>

    <!-- 主工作区：左右两列 -->
    <div class="workspace">
      <!-- 左侧：预设分组管理 -->
      <div class="panel left-panel card">
        <div class="panel-header">
          <h3>
            <el-icon class="title-icon"><Folder /></el-icon>
            预设分组
          </h3>
          <button class="btn-add" @click="openAddPresetDialog">
            <el-icon><Plus /></el-icon>
            新建预设
          </button>
        </div>

        <!-- 预设列表 -->
        <div class="preset-list">
          <div 
            v-for="(preset, index) in sortedPresets" 
            :key="preset.id" 
            class="preset-item card" 
            :class="{ active: currentPresetId === preset.id }"
            @click="selectPreset(preset.id)"
          >
            <div class="preset-info">
              <div class="preset-name">{{ preset.name }}</div>
              <div class="preset-content-preview">{{ truncate(preset.content, 30) }}</div>
              <div class="preset-stats">
                <span class="usage-count">
                  <el-icon><TrendCharts /></el-icon>
                  使用 {{ preset.usageCount }} 次
                </span>
              </div>
            </div>
            <div class="preset-actions" @click.stop>
              <button class="icon-btn" title="编辑" @click="editPreset(preset)">
                <el-icon><Edit /></el-icon>
              </button>
              <button 
                v-if="sortMode === 'custom'" 
                class="icon-btn move-btn" 
                :disabled="index === 0" 
                title="上移"
                @click="movePreset(preset.id, -1)"
              >
                <el-icon><Top /></el-icon>
              </button>
              <button 
                v-if="sortMode === 'custom'" 
                class="icon-btn move-btn" 
                :disabled="index === sortedPresets.length - 1" 
                title="下移"
                @click="movePreset(preset.id, 1)"
              >
                <el-icon><Bottom /></el-icon>
              </button>
              <button class="icon-btn delete-btn" title="删除" @click="deletePreset(preset.id)">
                <el-icon><Delete /></el-icon>
              </button>
            </div>
          </div>
          <div v-if="sortedPresets.length === 0" class="empty-tip">
            <el-icon><InfoFilled /></el-icon>
            暂无预设，点击“新建预设”或“导入”开始
          </div>
        </div>

        <!-- 当前选中预设的内容显示/编辑区（左侧文本框） -->
        <div class="current-preset-editor" v-if="currentPreset">
          <label>
            <el-icon><Document /></el-icon>
            预设内容（可编辑保存）
          </label>
          <textarea 
            v-model="editingContent" 
            class="preset-textarea" 
            rows="4" 
            placeholder="预设文本内容..."
          ></textarea>
          <div class="editor-actions">
            <button class="btn-save" @click="saveCurrentPresetContent">
              <el-icon><Check /></el-icon>
              保存修改
            </button>
            <span class="tip" v-if="hasUnsavedChanges">
              <el-icon><WarningFilled /></el-icon>
              未保存
            </span>
          </div>
        </div>
      </div>

      <!-- 右侧：输入区 + 操作面板 -->
      <div class="panel right-panel card">
        <h3>
          <el-icon class="title-icon"><EditPen /></el-icon>
          右侧输入
        </h3>
        <textarea 
          v-model="rightText" 
          class="right-textarea" 
          rows="6" 
          placeholder="在这里输入要拼接的文本..."
        ></textarea>

        <div class="action-bar">
          <button class="btn-primary" @click="handleMergeAndCopy">
            <el-icon><Connection /></el-icon>
            拼接并复制
          </button>
          <button class="btn-secondary" @click="handleCopyRightOnly">
            <el-icon><CopyDocument /></el-icon>
            仅复制右侧
          </button>
          <button class="btn-warning" @click="confirmClearRight">
            <el-icon><Delete /></el-icon>
            清空右侧
          </button>
        </div>

        <!-- 计数展示（当前选中预设的使用次数） -->
        <div class="usage-info" v-if="currentPreset">
          <span>当前预设“<strong>{{ currentPreset.name }}</strong>”已使用 
            <strong>{{ currentPreset.usageCount }}</strong> 次</span>
        </div>
        <div v-else class="usage-info placeholder">
          <el-icon><InfoFilled /></el-icon>
          请先选择一个预设
        </div>

        <!-- 快捷提示 -->
        <div class="tip-box">
          <el-icon><InfoFilled /></el-icon>
          点击“拼接并复制”：左侧预设内容 + 右侧输入内容 → 复制到剪贴板，计数+1，并询问是否清空右侧。
        </div>
      </div>
    </div>

    <!-- 新增/编辑预设对话框 -->
    <div v-if="showPresetDialog" class="modal-overlay" @click.self="closePresetDialog">
      <div class="modal card">
        <h3>{{ editingPresetId ? '编辑预设' : '新建预设' }}</h3>
        <div class="form-item">
          <label>预设名称</label>
          <input v-model="dialogForm.name" type="text" placeholder="例如：问候语" />
        </div>
        <div class="form-item">
          <label>预设内容</label>
          <textarea v-model="dialogForm.content" rows="5" placeholder="预设的文本内容..."></textarea>
        </div>
        <div class="modal-actions">
          <button class="btn-save" @click="savePresetDialog">
            <el-icon><Check /></el-icon>
            保存
          </button>
          <button class="btn-cancel" @click="closePresetDialog">
            <el-icon><Close /></el-icon>
            取消
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
// 导入 Element Plus 图标
import {
  DocumentCopy,
  List,
  TrendCharts,
  Folder,
  Plus,
  Edit,
  Top,
  Bottom,
  Delete,
  InfoFilled,
  Document,
  Check,
  WarningFilled,
  EditPen,
  Connection,
  CopyDocument,
  Close,
  Download,
  Upload,
  RefreshLeft
} from '@element-plus/icons-vue'

// --- 预设数据结构 ---
const STORAGE_KEY = 'text_merger_presets'

// 默认示例数据
const DEFAULT_PRESETS = [
  { id: '1', name: '问候语', content: '你好，很高兴为您服务。', usageCount: 5, order: 1 },
  { id: '2', name: '结束语', content: '感谢使用，再见！', usageCount: 3, order: 2 },
  { id: '3', name: '提示信息', content: '请注意操作安全。', usageCount: 8, order: 3 },
]

// 预设列表
const presets = ref([])

// 当前选中的预设ID
const currentPresetId = ref(null)

// 右侧输入框文本
const rightText = ref('')

// 编辑中的预设内容
const editingContent = ref('')

// 排序模式
const sortMode = ref('custom')

// 对话框显示状态
const showPresetDialog = ref(false)
const editingPresetId = ref(null)

const dialogForm = reactive({
  name: '',
  content: ''
})

// 文件导入 input 引用
const fileInputRef = ref(null)

// --- 初始化加载预设 ---
function loadPresets() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      presets.value = JSON.parse(stored)
    } else {
      presets.value = JSON.parse(JSON.stringify(DEFAULT_PRESETS)) // 深拷贝默认数据
    }
  } catch (e) {
    console.error('加载预设失败', e)
    ElMessage.error('加载预设数据失败，已重置为默认数据')
    presets.value = JSON.parse(JSON.stringify(DEFAULT_PRESETS))
  }
}
loadPresets()

// 保存预设到本地存储
function savePresetsToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets.value))
}

// 监听预设变化自动保存
watch(presets, () => {
  savePresetsToStorage()
}, { deep: true })

// 当前选中的预设对象
const currentPreset = computed(() => {
  return presets.value.find(p => p.id === currentPresetId.value)
})

// 是否未保存修改
const hasUnsavedChanges = computed(() => {
  if (!currentPreset.value) return false
  return editingContent.value !== currentPreset.value.content
})

// 排序后的预设列表
const sortedPresets = computed(() => {
  const list = [...presets.value]
  if (sortMode.value === 'custom') {
    return list.sort((a, b) => (a.order || 0) - (b.order || 0))
  } else {
    return list.sort((a, b) => {
      if (b.usageCount !== a.usageCount) {
        return b.usageCount - a.usageCount
      }
      return a.name.localeCompare(b.name)
    })
  }
})

// 切换排序模式
function switchSortMode(mode) {
  sortMode.value = mode
}

// 选中预设
function selectPreset(id) {
  currentPresetId.value = id
  const preset = presets.value.find(p => p.id === id)
  if (preset) {
    editingContent.value = preset.content
  }
}

// 保存当前预设内容
function saveCurrentPresetContent() {
  if (!currentPreset.value) return
  currentPreset.value.content = editingContent.value
  presets.value = [...presets.value]
}

// 移动预设顺序
function movePreset(id, delta) {
  if (sortMode.value !== 'custom') return
  const index = sortedPresets.value.findIndex(p => p.id === id)
  if (index === -1) return
  const newIndex = index + delta
  if (newIndex < 0 || newIndex >= sortedPresets.value.length) return

  const currentOrder = sortedPresets.value[index].order
  const targetOrder = sortedPresets.value[newIndex].order
  const presetA = presets.value.find(p => p.id === sortedPresets.value[index].id)
  const presetB = presets.value.find(p => p.id === sortedPresets.value[newIndex].id)
  if (presetA && presetB) {
    presetA.order = targetOrder
    presetB.order = currentOrder
    presets.value = [...presets.value]
  }
}

// 删除预设
function deletePreset(id) {
  if (!confirm('确定删除此预设吗？')) return
  const index = presets.value.findIndex(p => p.id === id)
  if (index !== -1) {
    presets.value.splice(index, 1)
    if (currentPresetId.value === id) {
      currentPresetId.value = presets.value.length > 0 ? presets.value[0].id : null
      if (currentPresetId.value) {
        const first = presets.value.find(p => p.id === currentPresetId.value)
        editingContent.value = first?.content || ''
      } else {
        editingContent.value = ''
      }
    }
  }
}

// --- 导入导出功能 ---

// 导出预设为 JSON 文件
function exportPresets() {
  try {
    const dataStr = JSON.stringify(presets.value, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `text-merger-presets-${new Date().toISOString().slice(0,10)}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    ElMessage.success('预设导出成功')
  } catch (err) {
    console.error('导出失败', err)
    ElMessage.error('导出失败，请重试')
  }
}

// 触发文件选择
function triggerImport() {
  fileInputRef.value?.click()
}

// 处理导入文件
function handleImportFile(event) {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const importedData = JSON.parse(e.target.result)
      
      // 验证数据结构（简单校验是否为数组，且每个元素有基本字段）
      if (!Array.isArray(importedData)) {
        throw new Error('导入数据必须是数组格式')
      }
      
      // 可选：深度校验每个预设的结构，这里简单判断必须有 id/name/content
      const isValid = importedData.every(item => 
        item && typeof item === 'object' && 
        'id' in item && 'name' in item && 'content' in item
      )
      if (!isValid) {
        throw new Error('导入数据格式不正确，缺少必要字段')
      }

      // 询问用户是替换还是合并
      const action = confirm('导入预设数据，是否替换当前所有预设？\n点击“确定”替换，点击“取消”则合并（保留重复ID的预设以导入为准）')
      
      if (action) {
        // 替换
        presets.value = importedData
      } else {
        // 合并：如果 ID 重复则用导入的覆盖，否则添加
        const existingIds = new Set(presets.value.map(p => p.id))
        importedData.forEach(item => {
          const existingIndex = presets.value.findIndex(p => p.id === item.id)
          if (existingIndex !== -1) {
            // 替换已存在的
            presets.value[existingIndex] = item
          } else {
            // 添加新预设
            presets.value.push(item)
          }
        })
        presets.value = [...presets.value] // 触发响应式更新
      }
      
      // 重新计算 order 确保自定义排序正确（可选）
      if (sortMode.value === 'custom') {
        // 为所有预设重新分配连续的 order
        presets.value.forEach((p, idx) => {
          p.order = idx + 1
        })
      }

      ElMessage.success('导入成功')
      
      // 如果当前选中的预设被替换或删除，尝试选中第一个
      if (!presets.value.some(p => p.id === currentPresetId.value)) {
        currentPresetId.value = presets.value.length > 0 ? presets.value[0].id : null
        if (currentPresetId.value) {
          const first = presets.value.find(p => p.id === currentPresetId.value)
          editingContent.value = first?.content || ''
        }
      }
    } catch (err) {
      console.error('导入失败', err)
      ElMessage.error('导入失败：' + err.message)
    } finally {
      // 清空 input 以便再次选择同一文件
      if (fileInputRef.value) {
        fileInputRef.value.value = ''
      }
    }
  }
  reader.readAsText(file)
}

// 重置为默认示例
function resetToDefault() {
  if (!confirm('重置预设将丢失当前所有数据，确定要继续吗？')) return
  presets.value = JSON.parse(JSON.stringify(DEFAULT_PRESETS))
  currentPresetId.value = presets.value.length > 0 ? presets.value[0].id : null
  if (currentPresetId.value) {
    const first = presets.value.find(p => p.id === currentPresetId.value)
    editingContent.value = first?.content || ''
  }
  ElMessage.success('已重置为默认示例')
}

// --- 对话框相关 ---
function openAddPresetDialog() {
  editingPresetId.value = null
  dialogForm.name = ''
  dialogForm.content = ''
  showPresetDialog.value = true
}

function editPreset(preset) {
  editingPresetId.value = preset.id
  dialogForm.name = preset.name
  dialogForm.content = preset.content
  showPresetDialog.value = true
}

function closePresetDialog() {
  showPresetDialog.value = false
  editingPresetId.value = null
}

function savePresetDialog() {
  if (!dialogForm.name.trim()) {
    alert('请输入预设名称')
    return
  }
  if (editingPresetId.value) {
    const preset = presets.value.find(p => p.id === editingPresetId.value)
    if (preset) {
      preset.name = dialogForm.name
      preset.content = dialogForm.content
      if (currentPresetId.value === preset.id) {
        editingContent.value = preset.content
      }
    }
  } else {
    const newId = Date.now() + '' + Math.floor(Math.random() * 1000)
    const maxOrder = presets.value.length > 0 
      ? Math.max(...presets.value.map(p => p.order || 0)) 
      : 0
    presets.value.push({
      id: newId,
      name: dialogForm.name,
      content: dialogForm.content,
      usageCount: 0,
      order: maxOrder + 1
    })
  }
  presets.value = [...presets.value]
  closePresetDialog()
}

// --- 核心功能：拼接并复制 ---
async function handleMergeAndCopy() {
  if (!currentPreset.value) {
    alert('请先在左侧选择一个预设')
    return
  }
  const leftContent = currentPreset.value.content
  const rightContent = rightText.value
  const mergedText = leftContent + rightContent

  try {
    await navigator.clipboard.writeText(mergedText)
    currentPreset.value.usageCount += 1
    presets.value = [...presets.value]

    const shouldClear = confirm('✅ 已复制拼接内容到剪贴板。\n是否清空右侧文本框？')
    if (shouldClear) {
      rightText.value = ''
    }
  } catch (err) {
    alert('复制失败，请手动复制。错误：' + err)
  }
}

// 仅复制右侧内容
async function handleCopyRightOnly() {
  if (!rightText.value.trim()) {
    alert('右侧无内容可复制')
    return
  }
  try {
    await navigator.clipboard.writeText(rightText.value)
    const shouldClear = confirm('✅ 已复制右侧内容到剪贴板。\n是否清空右侧文本框？')
    if (shouldClear) {
      rightText.value = ''
    }
  } catch (err) {
    alert('复制失败：' + err)
  }
}

// 确认清空右侧
function confirmClearRight() {
  if (!rightText.value.trim()) {
    rightText.value = ''
    return
  }
  if (confirm('确定清空右侧文本框吗？')) {
    rightText.value = ''
  }
}

// 辅助函数：截断文本预览
function truncate(text, maxLen) {
  if (!text) return ''
  return text.length > maxLen ? text.slice(0, maxLen) + '…' : text
}
</script>

<style scoped>
/* 图标样式适配 */
.title-icon,
.btn-icon {
  margin-right: 6px;
  font-size: 1.1em;
  vertical-align: middle;
}

.el-icon {
  vertical-align: middle;
}

.text-merger-tool {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  font-family: system-ui, 'Segoe UI', Roboto, sans-serif;
  color: #2c3e50;
}

.tool-title {
  margin-top: 0;
  margin-bottom: 20px;
  font-weight: 500;
  border-bottom: 2px solid #eaeef2;
  padding-bottom: 12px;
  display: flex;
  align-items: center;
}

/* 卡片通用设计 */
.card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1);
  padding: 20px;
  border: 1px solid #f0f3f7;
  transition: box-shadow 0.2s;
}

.card:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

/* 排序栏 + 导入导出 */
.sort-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding: 12px 20px;
  flex-wrap: wrap;
  gap: 16px;
}

.sort-section {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.sort-label {
  font-weight: 600;
  color: #34495e;
}

.sort-options {
  display: flex;
  gap: 8px;
}

.sort-btn {
  padding: 6px 16px;
  border: 1px solid #d0d9e2;
  background: white;
  border-radius: 30px;
  font-size: 14px;
  cursor: pointer;
  color: #476481;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.sort-btn.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.sort-hint {
  font-size: 13px;
  color: #7f8c8d;
}

.import-export-section {
  display: flex;
  gap: 8px;
}

.tool-btn {
  padding: 6px 14px;
  border: 1px solid #d0d9e2;
  background: white;
  border-radius: 30px;
  font-size: 14px;
  cursor: pointer;
  color: #476481;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.tool-btn:hover {
  background: #f1f5f9;
  border-color: #3b82f6;
}

/* 工作区左右布局 */
.workspace {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.panel {
  flex: 1 1 400px;
  display: flex;
  flex-direction: column;
}

.left-panel {
  min-width: 380px;
}

.right-panel {
  min-width: 360px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

h3 {
  margin: 0;
  font-weight: 500;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
}

/* 预设列表 */
.preset-list {
  max-height: 360px;
  overflow-y: auto;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.preset-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  cursor: pointer;
  border: 1px solid transparent;
  background: #fafcff;
  border-radius: 14px;
  transition: all 0.15s;
}

.preset-item.active {
  border-color: #3b82f6;
  background: #f0f7ff;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
}

.preset-info {
  flex: 1;
}

.preset-name {
  font-weight: 600;
  margin-bottom: 6px;
  color: #1e293b;
}

.preset-content-preview {
  font-size: 13px;
  color: #64748b;
  font-family: 'SF Mono', 'Fira Code', monospace;
  background: #f1f5f9;
  padding: 4px 8px;
  border-radius: 8px;
  margin: 6px 0;
}

.preset-stats {
  font-size: 12px;
  color: #5b6f82;
}

.usage-count {
  background: #e9ecf0;
  padding: 2px 10px;
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.preset-actions {
  display: flex;
  gap: 6px;
}

.icon-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 8px;
  opacity: 0.7;
  transition: all 0.1s;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #476481;
}

.icon-btn:hover {
  opacity: 1;
  background: rgba(0,0,0,0.03);
}

.move-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.delete-btn:hover {
  color: #e74c3c;
}

.empty-tip {
  text-align: center;
  color: #94a3b8;
  padding: 20px;
  font-style: italic;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

/* 左侧预设编辑器 */
.current-preset-editor {
  margin-top: 8px;
  border-top: 1px dashed #dce5ec;
  padding-top: 16px;
}

.current-preset-editor label {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.preset-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d9e6;
  border-radius: 14px;
  font-family: inherit;
  resize: vertical;
  background: #fdfdfe;
  margin: 8px 0;
}

.editor-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.tip {
  font-size: 13px;
  color: #e67e22;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 右侧 */
.right-textarea {
  width: 100%;
  padding: 16px;
  border: 1px solid #d1d9e6;
  border-radius: 18px;
  font-family: inherit;
  resize: vertical;
  background: #fafcff;
  margin: 12px 0 20px;
  font-size: 15px;
}

.action-bar {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.btn-primary, .btn-secondary, .btn-warning, .btn-save, .btn-add, .btn-cancel {
  padding: 10px 20px;
  border-radius: 40px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.15s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  box-shadow: 0 4px 8px rgba(59,130,246,0.2);
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: #f1f5f9;
  color: #334155;
  border: 1px solid #cbd5e1;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

.btn-warning {
  background: #fef3c7;
  color: #b45309;
  border: 1px solid #fde68a;
}

.btn-warning:hover {
  background: #fde68a;
}

.btn-save {
  background: #10b981;
  color: white;
}

.btn-add {
  background: #f8fafc;
  border: 1px dashed #3b82f6;
  color: #3b82f6;
}

.usage-info {
  padding: 14px 0;
  font-size: 15px;
  border-top: 1px solid #ecf1f7;
  margin-top: 10px;
}

.usage-info.placeholder {
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 6px;
}

.tip-box {
  background: #f8fafc;
  border-radius: 14px;
  padding: 16px;
  margin-top: 24px;
  color: #475569;
  border-left: 4px solid #3b82f6;
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

/* 模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  width: 500px;
  max-width: 90%;
}

.form-item {
  margin-bottom: 20px;
}

.form-item label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
}

.form-item input, .form-item textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #d1d9e6;
  border-radius: 14px;
  font-family: inherit;
  background: #fafcff;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}
</style>