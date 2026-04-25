<template>
  <div v-if="shouldShow" class="floating-doc-wrapper">
    <el-tooltip content="当前项目文档" placement="left">
      <el-button class="floating-trigger-btn" :class="{ active: drawerVisible }" type="primary" :icon="Notebook" circle size="large" @click="toggleDrawer" />
    </el-tooltip>

    <Teleport to="body">
      <el-drawer v-model="drawerVisible" :title="`文档助手 · ${currentFileName}`" direction="rtl" size="500px" :before-close="handleClose" :z-index="2500">
        <div class="mode-tabs">
          <el-radio-group v-model="mode" size="small" @change="onModeChange">
            <el-radio-button value="reference">📖 关联文档</el-radio-button>
            <el-radio-button value="write">✍️ 需求文档</el-radio-button>
          </el-radio-group>
        </div>

        <!-- 关联文档 -->
        <template v-if="mode === 'reference'">
          <div class="selector">
            <span class="label">关联文档：</span>
            <el-select v-model="selectedDoc" filterable clearable size="small" style="flex:1" @change="loadDocContent">
              <el-option v-for="doc in relatedDocs" :key="doc" :label="doc" :value="doc" />
            </el-select>
            <el-button size="small" circle :icon="Refresh" @click="fetchRelatedDocs" />
          </div>
          <div v-if="relatedDocs.length===0 && !loading" class="empty">📭 暂无关联文档</div>
          <div v-else class="doc-display">
            <div class="doc-toolbar"><el-button size="small" :icon="CopyDocument" @click="copyCurrentDoc">复制全文</el-button></div>
            <el-input v-model="docContent" type="textarea" readonly :rows="18" class="doc-textarea" />
          </div>
        </template>

        <!-- 需求文档：列出全部 -->
        <template v-else>
          <div class="selector">
            <span class="label">需求文档：</span>
            <el-select v-model="selectedRequirementDoc" filterable clearable size="small" style="flex:1" @change="onRequirementDocSelect">
              <el-option v-for="doc in requirementDocs" :key="doc" :label="doc" :value="doc" />
            </el-select>
            <el-button size="small" circle :icon="Refresh" @click="fetchRequirementDocs" />
          </div>
          <div class="write-controls" v-if="selectedRequirementDoc || writeDocName">
            <div class="doc-name-row">
              <span class="label">文档名：</span>
              <el-input v-model="writeDocName" size="small" style="flex:1" />
              <span class="suffix">.md</span>
            </div>
            <div class="write-actions">
              <el-button size="small" type="primary" :icon="Check" @click="saveCurrentDoc">保存</el-button>
              <el-button size="small" type="danger" :icon="Delete" @click="deleteCurrentDoc" :disabled="!writeDocName">删除</el-button>
              <el-button size="small" :icon="Plus" @click="newRequirementDoc">新建需求</el-button>
            </div>
          </div>
          <el-input v-model="writeContent" type="textarea" :rows="18" placeholder="选择或新建需求文档" class="doc-textarea editable" />
        </template>

        <template #footer>
          <div class="footer-hint">文档目录：vue_little_tool_markdown/{{ mode==='reference' ? '关联文档' : '需求文档' }}</div>
        </template>
      </el-drawer>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Notebook, Refresh, CopyDocument, Check, Delete, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const currentFileName = computed(() => (route.meta?.title || '').replace(/\.vue$/, ''))
const shouldShow = computed(() => decodeURIComponent(route.path).includes('小工具研发部'))

const drawerVisible = ref(false)
const mode = ref('reference')
const loading = ref(false)

const relatedDocs = ref([])
const selectedDoc = ref('')
const docContent = ref('')

const requirementDocs = ref([])
const selectedRequirementDoc = ref('')
const writeDocName = ref('')
const writeContent = ref('')

const toggleDrawer = () => {
  drawerVisible.value = !drawerVisible.value
  if (drawerVisible.value) {
    mode.value === 'reference' ? fetchRelatedDocs() : fetchRequirementDocs()
  }
}
const handleClose = (done) => done()

// 关联文档
const fetchRelatedDocs = async () => {
  loading.value = true
  try {
    const res = await fetch(`/api/markdown-doc?action=search&subdir=关联文档&prefix=${encodeURIComponent(currentFileName.value)}`)
    const data = await res.json()
    relatedDocs.value = data.success ? (data.data || []) : []
    if (!relatedDocs.value.includes(selectedDoc.value)) {
      selectedDoc.value = relatedDocs.value[0] || ''
      docContent.value = selectedDoc.value ? await readDoc('关联文档', selectedDoc.value) : ''
    }
  } catch (e) { console.error(e) } finally { loading.value = false }
}

const loadDocContent = async (name) => {
  if (!name) { docContent.value = ''; return }
  docContent.value = await readDoc('关联文档', name)
}

// 需求文档：列出全部
const fetchRequirementDocs = async () => {
  loading.value = true
  try {
    const res = await fetch('/api/markdown-doc?action=list&subdir=需求文档')
    const data = await res.json()
    requirementDocs.value = data.success ? (data.data || []) : []
    if (!requirementDocs.value.includes(selectedRequirementDoc.value)) {
      selectedRequirementDoc.value = requirementDocs.value[0] || ''
      if (selectedRequirementDoc.value) {
        writeDocName.value = selectedRequirementDoc.value
        writeContent.value = await readDoc('需求文档', selectedRequirementDoc.value)
      } else {
        writeDocName.value = ''
        writeContent.value = ''
      }
    }
  } catch (e) { console.error(e) } finally { loading.value = false }
}

const onRequirementDocSelect = async (name) => {
  if (!name) { writeDocName.value = ''; writeContent.value = ''; return }
  writeDocName.value = name
  writeContent.value = await readDoc('需求文档', name)
}

const readDoc = async (subdir, name) => {
  try {
    const res = await fetch(`/api/markdown-doc?action=read&subdir=${encodeURIComponent(subdir)}&name=${encodeURIComponent(name)}`)
    const data = await res.json()
    return (data.success && data.data) ? (data.data.content || '') : ''
  } catch { return '' }
}

const saveCurrentDoc = async () => {
  const name = writeDocName.value.trim()
  if (!name) { ElMessage.warning('请输入文档名'); return }
  await fetch('/api/markdown-doc?action=save&subdir=需求文档', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, content: writeContent.value })
  })
  ElMessage.success('保存成功')
  await fetchRequirementDocs()
}

const deleteCurrentDoc = async () => {
  const name = writeDocName.value.trim()
  if (!name) return
  await ElMessageBox.confirm(`确定删除「${name}.md」？`, '确认删除', { type: 'warning' })
  await fetch(`/api/markdown-doc?action=delete&subdir=需求文档&name=${encodeURIComponent(name)}`, { method: 'DELETE' })
  ElMessage.success('已删除')
  selectedRequirementDoc.value = ''
  writeDocName.value = ''
  writeContent.value = ''
  await fetchRequirementDocs()
}

const newRequirementDoc = () => {
  writeDocName.value = currentFileName.value + '需求文档'
  writeContent.value = ''
  selectedRequirementDoc.value = ''
}

const copyCurrentDoc = () => {
  if (!docContent.value) { ElMessage.warning('无内容'); return }
  navigator.clipboard.writeText(docContent.value).then(() => ElMessage.success('已复制')).catch(() => ElMessage.error('复制失败'))
}

const onModeChange = (val) => {
  if (val === 'reference') fetchRelatedDocs()
  else fetchRequirementDocs()
}

watch(() => route.fullPath, () => {
  if (drawerVisible.value) {
    mode.value === 'reference' ? fetchRelatedDocs() : fetchRequirementDocs()
  }
})

onMounted(() => { if (shouldShow.value) fetchRelatedDocs() })
</script>

<style scoped>
.floating-doc-wrapper { position: fixed; bottom: 32px; right: 32px; z-index: 2000; }
.floating-trigger-btn { width: 56px; height: 56px; box-shadow: 0 4px 16px rgba(0,102,204,0.35); transition: all 0.25s; }
.floating-trigger-btn:hover { transform: translateY(-4px) scale(1.05); box-shadow: 0 8px 24px rgba(0,102,204,0.45); }
.floating-trigger-btn.active { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,102,204,0.4); }
.mode-tabs { margin-bottom: 20px; display: flex; justify-content: center; }
.selector { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
.selector .label { font-size: 13px; color: #606266; }
.empty { text-align: center; padding: 40px; color: #909399; }
.doc-display { display: flex; flex-direction: column; gap: 10px; }
.doc-toolbar { display: flex; justify-content: flex-end; }
.doc-textarea { font-family: 'SF Mono','Fira Code',monospace; font-size: 13px; line-height: 1.6; }
.doc-textarea.editable :deep(textarea) { background: #fefdf6; }
.write-controls { display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; }
.doc-name-row { display: flex; align-items: center; gap: 8px; }
.doc-name-row .suffix { color: #909399; }
.write-actions { display: flex; gap: 8px; justify-content: flex-end; }
.footer-hint { text-align: center; color: #909399; font-size: 12px; }
</style>