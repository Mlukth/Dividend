<template>
  <div class="debate-app">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="role-selector">
        <button
          v-for="role in roles"
          :key="role.id"
          :class="{ active: currentRole === role.id }"
          @click="currentRole = role.id"
        >
          {{ role.name }}
        </button>
      </div>
      <div class="actions">
        <button @click="generateTree" :disabled="treeLoading">
          {{ treeLoading ? '生成中...' : '🌳 生成观点树' }}
        </button>
        <div class="slider-group" v-show="showSliders">
          <label class="slider-label">
            探索广度
            <input type="range" v-model.number="treeParams.breadth" min="0" max="1" step="0.1" />
          </label>
          <label class="slider-label">
            逻辑严密度
            <input type="range" v-model.number="treeParams.strictness" min="0" max="1" step="0.1" />
          </label>
        </div>
        <button @click="showSliders = !showSliders">⚙️ 树参数</button>
        <button @click="exportCurrentProject">📥 导出</button>
        <label class="import-btn">
          📤 导入
          <input type="file" @change="importProject" accept=".json" style="display:none" />
        </label>
        <button @click="openDoc">📄 项目文档</button>
      </div>
    </div>

    <!-- 主体：左侧对话列表+观点树 / 右侧聊天 -->
    <div class="main-content">
      <!-- 左侧面板 -->
      <div class="left-panel">
        <div class="project-list">
          <div class="project-header">
            <h3>📁 辩论项目</h3>
            <button @click="newProject" title="新建对话">➕</button>
          </div>
          <div class="project-items">
            <div
              v-for="proj in projects"
              :key="proj.id"
              class="project-item"
              :class="{ active: currentProjectId === proj.id }"
              @click="switchProject(proj.id)"
            >
              <span class="project-title">{{ proj.title || '未命名辩论' }}</span>
              <button class="delete-proj" @click.stop="deleteProject(proj.id)">🗑</button>
            </div>
          </div>
        </div>
        <div class="tree-section" v-if="currentProject.opinionTree">
          <h3>🌲 观点树</h3>
          <TreeRecursive
            v-if="currentProject.opinionTree.nodes && currentProject.opinionTree.nodes.length"
            :nodes="currentProject.opinionTree.nodes"
            :parent-id="null"
          />
        </div>
      </div>

      <!-- 右侧：对话区 -->
      <div class="right-panel">
        <div class="chat-panel" ref="chatPanel">
          <div
            v-for="msg in currentProject.messages"
            :key="msg.id"
            :ref="el => (msgRefs[msg.id] = el)"
            class="message"
            :class="{
              'ai-generated': msg.source === 'ai_fill' || msg.source === 'ai_polish',
              'role-a': msg.role === 'A',
              'role-b': msg.role === 'B',
              'role-c': msg.role === 'C',
            }"
          >
            <div class="message-header">
              <span class="role-tag">{{ roles.find(r => r.id === msg.role)?.name }}</span>
              <span v-if="msg.source !== 'manual'" class="ai-badge">AI</span>
              <span v-if="msg.edited" class="edited-badge">已编辑</span>
            </div>
            <div class="content" v-html="renderMessageContent(msg)"></div>
            <div class="message-actions">
              <button @click="editMessage(msg)" title="编辑">✏️</button>
              <button @click="deleteMessage(msg.id)" title="删除">🗑</button>
              <button
                v-if="msg.source === 'manual'"
                @click="polishMessage(msg)"
                :disabled="polishing[msg.id]"
                title="润色"
              >
                {{ polishing[msg.id] ? '✨...' : '✨' }}
              </button>
            </div>
          </div>
        </div>
        <div class="input-area">
          <textarea
            v-model="newMessage"
            @keydown.enter.exact.prevent="sendMessage"
            placeholder="以当前角色发言..."
            rows="3"
          ></textarea>
          <div class="input-buttons">
            <button @click="sendMessage" :disabled="!newMessage.trim()">发送</button>
            <button @click="fillMessage" :disabled="fillLoading || currentProject.messages.length === 0">
              {{ fillLoading ? 'AI 填补中...' : '🤖 AI 填补' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 提示词编辑器 -->
    <div class="prompt-panel" v-show="showPromptEditor">
      <h3>提示词编辑器</h3>
      <div v-for="(prompt, key) in promptTemplates" :key="key" class="prompt-field">
        <label>{{ promptLabels[key] }}</label>
        <textarea v-model="promptTemplates[key]" rows="5"></textarea>
      </div>
      <button @click="showPromptEditor = false">关闭</button>
    </div>

    <!-- API Key 设置 -->
    <div class="api-key-bar">
      <span>DeepSeek API Key:</span>
      <input type="password" v-model="apiKey" placeholder="输入你的 API Key" />
      <button @click="showPromptEditor = !showPromptEditor">📝 提示词</button>
    </div>

    <!-- 文档弹窗 -->
    <div class="modal-overlay" v-if="docVisible" @click.self="docVisible = false">
      <div class="modal-content">
        <div class="modal-header">
          <h2>项目文档：三角色辩论馆</h2>
          <button class="close-btn" @click="docVisible = false">✖</button>
        </div>
        <div class="modal-body" v-html="renderedDoc"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, computed, onMounted, watch } from 'vue';
import { v4 as uuidv4 } from 'uuid';

// ---------- 基础角色定义 ----------
const roles = [
  { id: 'A', name: '角色 A（攻方）', stance: '正面论述' },
  { id: 'B', name: '角色 B（防方）', stance: '反驳/防御' },
  { id: 'C', name: '角色 C（观察员）', stance: '中立分析' },
];

// ---------- 全局状态 ----------
const apiKey = ref(localStorage.getItem('debate_api_key') || '');
const showSliders = ref(false);
const treeLoading = ref(false);
const fillLoading = ref(false);
const polishing = reactive({});
const showPromptEditor = ref(false);
const chatPanel = ref(null);
const msgRefs = reactive({});

const currentRole = ref('A');
const newMessage = ref('');

// 多项目管理
const projects = ref([]);
const currentProjectId = ref(null);
const currentProject = computed(() => {
  return projects.value.find(p => p.id === currentProjectId.value) || createEmptyProject();
});

function createEmptyProject(title = '新辩论') {
  return {
    id: uuidv4(),
    title,
    messages: [],
    opinionTree: null,
    treeParams: { breadth: 0.7, strictness: 0.8 },
    createdAt: new Date().toISOString(),
  };
}

// 树参数绑定到当前项目
const treeParams = computed({
  get: () => currentProject.value.treeParams,
  set: (val) => {
    const proj = projects.value.find(p => p.id === currentProjectId.value);
    if (proj) Object.assign(proj.treeParams, val);
  },
});

// 初始化：从 localStorage 恢复（如果有）或创建第一个项目
onMounted(() => {
  const saved = localStorage.getItem('debate_projects');
  if (saved) {
    try {
      const data = JSON.parse(saved);
      projects.value = data.projects || [];
    } catch (e) {
      console.warn('无法恢复项目数据');
    }
  }
  if (projects.value.length === 0) {
    const first = createEmptyProject('我的辩论');
    projects.value.push(first);
  }
  currentProjectId.value = projects.value[0].id;
});

// 自动保存到 localStorage
watch(
  () => ({ projects: JSON.parse(JSON.stringify(projects.value)) }),
  (val) => {
    localStorage.setItem('debate_projects', JSON.stringify({ projects: val.projects }));
  },
  { deep: true }
);

// 切换当前项目时清空输入、重置滚动
watch(currentProjectId, () => {
  newMessage.value = '';
  nextTick(() => scrollToBottom());
});

// ---------- 项目操作 ----------
function newProject() {
  const proj = createEmptyProject();
  projects.value.push(proj);
  currentProjectId.value = proj.id;
}

function switchProject(id) {
  currentProjectId.value = id;
}

function deleteProject(id) {
  if (projects.value.length <= 1) {
    alert('至少保留一个项目');
    return;
  }
  projects.value = projects.value.filter(p => p.id !== id);
  if (currentProjectId.value === id) {
    currentProjectId.value = projects.value[0]?.id || null;
  }
}

// ---------- 消息操作 ----------
function createMessage(role, content, source = 'manual', extra = {}) {
  return {
    id: uuidv4(),
    role,
    content,
    source,
    edited: false,
    originalContent: source === 'ai_polish' ? (extra.originalContent || content) : null,
    revisionMarks: source === 'ai_polish' ? (extra.revisionMarks || null) : null,
    replyTo: extra.replyTo || null,
    timestamp: new Date().toISOString(),
  };
}

function renderMessageContent(msg) {
  let text = msg.content;
  if (msg.source === 'ai_polish' && msg.revisionMarks) {
    text = msg.revisionMarks
      .replace(/\[-(.*?)-\]/g, '<del style="color:red;text-decoration:line-through;">$1</del>')
      .replace(/\{\+(.*?)\+\}/g, '<ins style="color:green;text-decoration:underline;">$1</ins>');
  }
  return text.replace(/\n/g, '<br/>');
}

function scrollToBottom() {
  nextTick(() => {
    if (chatPanel.value) {
      chatPanel.value.scrollTop = chatPanel.value.scrollHeight;
    }
  });
}

function sendMessage() {
  if (!newMessage.value.trim()) return;
  const proj = projects.value.find(p => p.id === currentProjectId.value);
  if (!proj) return;
  const msg = createMessage(currentRole.value, newMessage.value.trim());
  proj.messages.push(msg);
  newMessage.value = '';
  scrollToBottom();
}

function editMessage(msg) {
  const newContent = prompt('编辑发言', msg.content);
  if (newContent !== null && newContent.trim() !== '') {
    msg.content = newContent.trim();
    msg.edited = true;
    if (msg.source === 'ai_polish') {
      msg.revisionMarks = null;
    }
  }
}

function deleteMessage(id) {
  const proj = projects.value.find(p => p.id === currentProjectId.value);
  if (proj) {
    proj.messages = proj.messages.filter(m => m.id !== id);
  }
}

// ---------- AI 调用 ----------
function buildHistoryText(messages) {
  return messages
    .map(m => `[${roles.find(r => r.id === m.role)?.name || m.role}] ${m.content}`)
    .join('\n');
}

function fillTemplate(template, vars) {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  return result;
}

async function callDeepSeek(prompt, temperature = 0.7) {
  if (!apiKey.value) {
    alert('请输入 DeepSeek API Key');
    return null;
  }
  localStorage.setItem('debate_api_key', apiKey.value);
  try {
    const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey.value}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature,
        max_tokens: 1024,
      }),
    });
    const data = await res.json();
    if (!data.choices || data.choices.length === 0) {
      throw new Error('API 返回异常：' + JSON.stringify(data));
    }
    return data.choices[0].message.content;
  } catch (e) {
    alert('API 调用失败: ' + e.message);
    return null;
  }
}

async function fillMessage() {
  const proj = projects.value.find(p => p.id === currentProjectId.value);
  if (!proj || proj.messages.length === 0) return;
  fillLoading.value = true;
  try {
    const vars = {
      topic: proj.title || '当前辩论',
      role: roles.find(r => r.id === currentRole.value).name,
      stance: roles.find(r => r.id === currentRole.value).stance,
      history: buildHistoryText(proj.messages),
    };
    const prompt = fillTemplate(promptTemplates.fill, vars);
    const content = await callDeepSeek(prompt, 0.7);
    if (content) {
      const msg = createMessage(currentRole.value, content.trim(), 'ai_fill');
      proj.messages.push(msg);
      scrollToBottom();
    }
  } finally {
    fillLoading.value = false;
  }
}

async function polishMessage(msg) {
  polishing[msg.id] = true;
  try {
    const vars = { content: msg.content };
    const prompt = fillTemplate(promptTemplates.polish, vars);
    const result = await callDeepSeek(prompt, 0.7);
    if (!result) return;
    const revisionMarks = result.trim();
    const newContent = revisionMarks
      .replace(/\[-(.*?)-\]/g, '')
      .replace(/\{\+(.*?)\+\}/g, '$1');
    if (!newContent) {
      alert('润色结果异常，未提取到有效内容');
      return;
    }
    msg.originalContent = msg.content;
    msg.content = newContent;
    msg.source = 'ai_polish';
    msg.revisionMarks = revisionMarks;
    msg.edited = false;
  } catch (e) {
    alert('润色失败: ' + e.message);
  } finally {
    delete polishing[msg.id];
  }
}

// 健壮的 JSON 提取
function extractJSON(text) {
  // 移除可能的 markdown 代码块标记
  let cleaned = text.replace(/```json|```/g, '').trim();
  // 尝试找到第一个 { 和最后一个 }
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    cleaned = cleaned.substring(start, end + 1);
  }
  return cleaned;
}

async function generateTree() {
  const proj = projects.value.find(p => p.id === currentProjectId.value);
  if (!proj || proj.messages.length === 0) {
    alert('请先进行辩论对话');
    return;
  }
  treeLoading.value = true;
  try {
    const vars = {
      breadth: proj.treeParams.breadth,
      strictness: proj.treeParams.strictness,
      history: buildHistoryText(proj.messages),
    };
    const prompt = fillTemplate(promptTemplates.tree, vars);
    const result = await callDeepSeek(prompt, 0.5);
    if (!result) return;
    const jsonStr = extractJSON(result);
    let treeData;
    try {
      treeData = JSON.parse(jsonStr);
    } catch (e) {
      alert('AI 生成的树格式错误，无法解析为 JSON。原始返回：\n' + result);
      console.error('解析失败，提取的JSON字符串：', jsonStr);
      return;
    }
    proj.opinionTree = treeData;
  } finally {
    treeLoading.value = false;
  }
}

// ---------- 导入导出（基于当前项目） ----------
function exportCurrentProject() {
  const proj = projects.value.find(p => p.id === currentProjectId.value);
  if (!proj) return;
  const data = {
    meta: {
      title: proj.title,
      created_at: proj.createdAt,
    },
    roles,
    messages: proj.messages,
    treeParams: proj.treeParams,
    opinionTree: proj.opinionTree,
    prompts: { ...promptTemplates },
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${proj.title || 'debate'}_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importProject(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      // 导入为一个新项目
      const newProj = createEmptyProject(data.meta?.title || '导入的辩论');
      newProj.messages = data.messages || [];
      newProj.opinionTree = data.opinionTree || null;
      if (data.treeParams) Object.assign(newProj.treeParams, data.treeParams);
      if (data.prompts) Object.assign(promptTemplates, data.prompts);
      projects.value.push(newProj);
      currentProjectId.value = newProj.id;
      nextTick(() => scrollToBottom());
      alert('导入成功');
    } catch (err) {
      alert('JSON 格式错误');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

// ---------- 提示词模板 ----------
const promptLabels = {
  fill: '填补发言',
  polish: '润色修改',
  tree: '生成观点树',
};

const promptTemplates = reactive({
  fill: `你是辩论助手，主题：{{topic}}。当前角色：{{role}}（立场：{{stance}}）。历史对话如下：
{{history}}
请以{{role}}的身份，针对最后一条消息写一句尖锐且逻辑严密的发言。只输出发言本身，不要附加任何解释。`,
  polish: `请润色以下辩论发言，使其更严谨流畅，但保持原意。用标记标明改动：删除部分用 [-...-] 包裹，新增部分用 {+...+} 包裹。原文：
{{content}}`,
  tree: `根据以下辩论对话，生成一个观点树 JSON。探索广度：{{breadth}}，逻辑严密度：{{strictness}}。
对话历史：
{{history}}
输出格式要求：严格 JSON，形如 {"nodes":[{"id":"...","parentId":"...","summary":"...","role":"角色标识","associatedMessageIds":[],"type":"explored或potential"}]}。其中 type 为 explored 表示已讨论节点，potential 表示可探索的潜在新分支。角色标识对应 A/B/C。注意字段名准确，不要拼写错误。`,
});

// ---------- 文档弹窗 ----------
const docVisible = ref(false);
const docContent = ref('');

const renderedDoc = computed(() => {
  return docContent.value ? docContent.value.replace(/\n/g, '<br/>') : '加载中...';
});

async function openDoc() {
  docVisible.value = true;
  if (!docContent.value) {
    try {
      const response = await fetch('/md/三角色辩论馆.md');
      if (!response.ok) throw new Error('文档不存在');
      docContent.value = await response.text();
    } catch (e) {
      docContent.value = '文档加载失败：请确认 public/md/三角色辩论馆.md 文件是否存在。';
    }
  }
}

// ---------- 递归树组件 ----------
const TreeRecursive = {
  name: 'TreeRecursive',
  props: {
    nodes: { type: Array, required: true },
    parentId: { default: null },
  },
  setup(props) {
    const children = computed(() => {
      return props.nodes.filter(n => n.parentId === props.parentId);
    });
    return { children };
  },
  template: `
    <ul class="tree-node-list">
      <li v-for="node in children" :key="node.id" :class="'type-' + node.type">
        <span class="node-icon">
          {{ node.type === 'potential' ? '○' : '●' }}
        </span>
        <span class="node-summary">{{ node.summary }}</span>
        <span v-if="node.role" class="node-role">[{{ node.role }}]</span>
        <TreeRecursive v-if="node.id" :nodes="nodes" :parent-id="node.id" />
      </li>
    </ul>
  `,
};

</script>
<style scoped>
.debate-app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  font-family: 'Segoe UI', sans-serif;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  gap: 0.5rem;
}
.role-selector button {
  margin-right: 0.5rem;
  padding: 0.4rem 1rem;
  border: 1px solid #ccc;
  background: #f0f0f0;
  cursor: pointer;
}
.role-selector button.active {
  background: #4a90e2;
  color: white;
  border-color: #2a6bb0;
}
.actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.slider-group {
  display: flex;
  gap: 1rem;
  align-items: center;
}
.slider-label {
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.main-content {
  display: flex;
  gap: 1rem;
  height: 70vh;
}

.left-panel {
  width: 260px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 0.8rem;
  overflow-y: auto;
  background: #fafafa;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.history-section h3, .tree-section h3 {
  margin: 0 0 0.5rem;
  font-size: 1rem;
  border-bottom: 1px solid #ccc;
  padding-bottom: 0.3rem;
}

.msg-list .msg-item {
  padding: 0.3rem 0.5rem;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.85rem;
}
.msg-item:hover {
  background: #f0f0f0;
}
.msg-item.ai-item {
  color: #2e7d32;
}
.preview {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 160px;
}

.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.chat-panel {
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  overflow-y: auto;
  background: #fafafa;
}

.message {
  margin-bottom: 1rem;
  padding: 0.8rem;
  border-radius: 10px;
  background: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
.message.role-a { border-left: 4px solid #4a90e2; }
.message.role-b { border-left: 4px solid #e24a4a; }
.message.role-c { border-left: 4px solid #75b798; }
.message-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.4rem;
}
.role-tag { font-weight: bold; }
.ai-badge {
  background: #48bb78;
  color: white;
  font-size: 0.7rem;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
}
.edited-badge {
  background: #ecc94b;
  color: #1a202c;
  font-size: 0.7rem;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
}

.message-actions {
  margin-top: 0.5rem;
  text-align: right;
}
.message-actions button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  margin-left: 0.3rem;
}

.ai-generated {
  background: #f0fff4;
}

.input-area {
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
}
.input-area textarea {
  flex: 1;
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid #ccc;
  resize: vertical;
}
.input-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

button {
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  border: 1px solid #ccc;
  background: #fff;
  cursor: pointer;
  font-size: 0.9rem;
}
button:hover {
  background: #f0f0f0;
}
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.prompt-panel {
  margin-top: 1rem;
  border: 1px solid #ccc;
  padding: 1rem;
  border-radius: 8px;
  background: #fffbeb;
}
.prompt-field {
  margin-bottom: 1rem;
}
.prompt-field textarea {
  width: 100%;
  border-radius: 4px;
  border: 1px solid #ddd;
  padding: 0.5rem;
}

.api-key-bar {
  margin-top: 0.5rem;
  display: flex;
  gap: 0.5rem;
  align-items: center;
  font-size: 0.9rem;
}
.api-key-bar input {
  flex: 1;
  padding: 0.2rem;
  border-radius: 4px;
  border: 1px solid #ccc;
}

/* 文档弹窗 */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: white;
  max-width: 700px;
  width: 90%;
  max-height: 80vh;
  border-radius: 12px;
  overflow: auto;
  padding: 1.5rem;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

/* 观点树样式 */
.tree-node-list {
  list-style: none;
  padding-left: 1.2rem;
  margin: 0;
}
.tree-node-list li {
  margin: 0.4rem 0;
}
.node-icon {
  font-weight: bold;
  margin-right: 0.3rem;
}
.type-explored .node-icon { color: #4a90e2; } /* 实心圆 */
.type-potential .node-icon { color: #9e9e9e; } /* 空心圆 */
.node-role {
  font-size: 0.75rem;
  color: #555;
  margin-left: 0.3rem;
}


.project-list {
  flex-shrink: 0;
}
.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}
.project-header h3 {
  margin: 0;
  font-size: 1rem;
}
.project-items {
  max-height: 200px;
  overflow-y: auto;
}
.project-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.3rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 2px;
}
.project-item:hover {
  background: #e9e9e9;
}
.project-item.active {
  background: #d0ebff;
  font-weight: bold;
}
.delete-proj {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.8rem;
  opacity: 0.6;
}
.delete-proj:hover {
  opacity: 1;
}
</style>