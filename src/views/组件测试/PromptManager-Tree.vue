<template>
  <div class="pm-tree">
    <!-- 左侧树形目录 -->
    <aside class="tree-sidebar">
      <div class="tree-header">
        <h3>提示词库</h3>
        <el-button size="small" circle :icon="Plus" @click="addFolder" />
      </div>
      <el-input v-model="search" placeholder="搜索..." size="small" class="tree-search" clearable />
      <el-tree :data="treeData" :props="treeProps" node-key="id" highlight-current :filter-node-method="filterNode"
        ref="treeRef" @node-click="selectNode" default-expand-all>
        <template #default="{ data }">
          <span class="tree-node">
            <el-icon v-if="data.type==='folder'" color="#409EFF"><Folder /></el-icon>
            <el-icon v-else color="#F59E0B"><Document /></el-icon>
            <span class="tree-label">{{ data.label }}</span>
            <el-tag v-if="data.version" size="small" type="info" class="tree-version">{{ data.version }}</el-tag>
          </span>
        </template>
      </el-tree>
    </aside>

    <!-- 右侧编辑区 -->
    <main class="tree-main">
      <template v-if="selectedNode && selectedNode.type === 'prompt'">
        <div class="editor-toolbar">
          <el-input v-model="selectedNode.label" size="small" style="width:300px" placeholder="提示词名称" />
          <el-select v-model="selectedNode.version" size="small" style="width:100px">
            <el-option v-for="v in versions" :key="v" :label="v" :value="v" />
          </el-select>
          <el-button size="small" :icon="CopyDocument" @click="copyPrompt">复制全文</el-button>
          <el-button size="small" :icon="Clock" @click="showHistory = !showHistory">版本历史</el-button>
        </div>
        <el-input v-model="selectedNode.content" type="textarea" :rows="16" resize="vertical" class="editor-area" />
        <div class="editor-meta">
          <span>创建：2026-04-15</span>
          <span>更新：2026-05-10</span>
          <span>调用 127 次</span>
          <el-tag size="small" type="success">生产环境</el-tag>
        </div>

        <!-- 底部版本历史面板 -->
        <div v-if="showHistory" class="version-panel">
          <div class="version-title">版本历史</div>
          <div class="version-item" v-for="v in mockVersions" :key="v.id"
            :class="{ active: v.version === selectedNode.version }">
            <span class="v-tag">{{ v.version }}</span>
            <span class="v-date">{{ v.date }}</span>
            <span class="v-desc">{{ v.desc }}</span>
            <el-button size="small" text @click="selectedNode.version = v.version">恢复</el-button>
          </div>
        </div>
      </template>
      <el-empty v-else description="选择左侧提示词开始编辑" :image-size="100" />
    </main>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { Plus, Folder, Document, CopyDocument, Clock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const search = ref('')
const treeRef = ref(null)
const showHistory = ref(false)
const treeProps = { children: 'children', label: 'label' }
const selectedNode = ref(null)
const versions = ['v1.0', 'v1.1', 'v2.0', 'v2.1', 'v3.0']

const treeData = ref([
  { id: '1', label: '翻译评分', type: 'folder', children: [
    { id: '1-1', label: '考研英语翻译评分', type: 'prompt', version: 'v3.0', content: '你是考研英语一翻译题的专业评分老师。你需要对学生的中文译文进行四维评分...\n\n评分标准：\n1. 准确性(0-25)...\n2. 语法结构(0-25)...' },
    { id: '1-2', label: '通用翻译质量评估', type: 'prompt', version: 'v1.0', content: '请评估以下翻译的质量...' },
  ]},
  { id: '2', label: '代码生成', type: 'folder', children: [
    { id: '2-1', label: 'Vue3组件生成器', type: 'prompt', version: 'v2.1', content: '你是一个Vue 3专家...' },
    { id: '2-2', label: 'Python脚本编写', type: 'prompt', version: 'v1.0', content: '请编写一个Python脚本...' },
  ]},
  { id: '3', label: '写作助手', type: 'folder', children: [
    { id: '3-1', label: '周报生成', type: 'prompt', version: 'v1.2', content: '根据以下要点生成周报...' },
    { id: '3-2', label: '邮件润色', type: 'prompt', version: 'v1.0', content: '润色以下邮件...' },
    { id: '3-3', label: '论文摘要改写', type: 'prompt', version: 'v2.0', content: '改写以下摘要，使其更简洁...' },
  ]},
  { id: '4', label: '任务编排', type: 'folder', children: [
    { id: '4-1', label: 'TaskCenter 任务解析', type: 'prompt', version: 'v1.0', content: '解析用户输入为任务卡片...' },
    { id: '4-2', label: '决策树生成', type: 'prompt', version: 'v1.3', content: '根据任务描述生成决策树JSON...' },
  ]},
])

const mockVersions = [
  { id: 1, version: 'v3.0', date: '2026-05-10', desc: '增加流畅度评分维度，调整权重' },
  { id: 2, version: 'v2.1', date: '2026-04-28', desc: '修复JSON输出格式不稳定的问题' },
  { id: 3, version: 'v2.0', date: '2026-04-15', desc: '重构评分标准，增加考点提示字段' },
  { id: 4, version: 'v1.0', date: '2026-03-20', desc: '初版，基础三围评分' },
]

function selectNode(node) { if (node.type === 'prompt') { selectedNode.value = node; showHistory.value = false } }
function copyPrompt() { navigator.clipboard.writeText(selectedNode.value.content).then(() => ElMessage.success('已复制')); }
function addFolder() { ElMessage.info('新建文件夹（演示）') }

watch(search, (v) => treeRef.value?.filter(v))
function filterNode(v, d) { return !v || d.label.includes(v) }
</script>

<style scoped>
.pm-tree { display:flex; height:calc(100vh - 80px); background:#fff; border-radius:8px; overflow:hidden; }
.tree-sidebar { width:280px; border-right:1px solid #eee; padding:12px; display:flex; flex-direction:column; overflow:hidden; }
.tree-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
.tree-header h3 { margin:0; font-size:15px; }
.tree-search { margin-bottom:8px; }
.tree-node { display:flex; align-items:center; gap:4px; font-size:13px; }
.tree-label { flex:1; }
.tree-version { font-size:10px; }

.tree-main { flex:1; display:flex; flex-direction:column; padding:16px; overflow-y:auto; }
.editor-toolbar { display:flex; gap:8px; align-items:center; margin-bottom:12px; flex-wrap:wrap; }
.editor-area { font-family: 'Consolas','monospace'; font-size:13px; }
.editor-meta { display:flex; gap:16px; align-items:center; margin-top:10px; font-size:12px; color:#8492a6; }

.version-panel { margin-top:16px; border-top:2px solid #409EFF; padding-top:12px; }
.version-title { font-weight:700; font-size:14px; margin-bottom:8px; }
.version-item { display:flex; align-items:center; gap:12px; padding:8px; border-radius:6px; font-size:13px; border:1px solid transparent; }
.version-item.active { border-color:#409EFF; background:#ecf5ff; }
.version-item:hover { background:#f5f7fa; }
.v-tag { font-family:monospace; font-size:11px; background:#e6f0ff; color:#409EFF; padding:2px 6px; border-radius:3px; }
.v-date { color:#8492a6; font-size:12px; }
.v-desc { flex:1; }
</style>
