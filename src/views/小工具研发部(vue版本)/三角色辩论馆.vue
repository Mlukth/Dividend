<template>
  <div class="debate-app">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="role-selector">
        <button
          v-for="r in roles"
          :key="r.id"
          :class="{ active: currentRole === r.id }"
          @click="currentRole = r.id"
        >
          {{ r.name }}
        </button>
      </div>
      <div class="actions">
        <button @click="generateTree" :disabled="treeLoading">
          {{ treeLoading ? '生成中...' : '🌳 生成观点树' }}
        </button>
        <button @click="exportJSON">📥 导出</button>
        <label class="import-btn">
          📤 导入
          <input type="file" @change="importJSON" accept=".json" hidden />
        </label>
      </div>
    </div>

    <!-- 主区域 -->
    <div class="main-content">
      <DebateTreePanel ref="treePanel" :tree-mermaid-code="treeMermaidCode" />
      <DebateChatPanel
        :messages="messages"
        :current-role="currentRole"
        :roles="roles"
        :fill-loading="fillLoading"
        :polishing="polishing"
        @send="onSend"
        @edit-msg="editMsg"
        @delete-msg="deleteMsg"
        @polish="polish"
        @fill="fill"
      />
    </div>

    <!-- 底部工具 -->
    <div class="bottom-bar">
      <input v-model="apiKey" placeholder="DeepSeek API Key" type="password" />
      <button @click="showPrompts = !showPrompts">📝 提示词</button>
    </div>
    <div v-if="showPrompts" class="prompt-editor">
      <div v-for="(v, k) in prompts" :key="k">
        <label>{{ promptLabels[k] }}</label>
        <textarea v-model="prompts[k]" rows="5"></textarea>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, watch } from 'vue';
import { v4 as uuid } from 'uuid';
import mermaid from 'mermaid';
import DebateTreePanel from './三角色辩论馆/DebateTreePanel.vue';
import DebateChatPanel from './三角色辩论馆/DebateChatPanel.vue';

// --- 角色 ---
const roles = [
  { id: 'A', name: '角色A（攻）', stance: '正方' },
  { id: 'B', name: '角色B（防）', stance: '反方' },
  { id: 'C', name: '角色C（观）', stance: '中立' },
];
const currentRole = ref('A');

// --- 对话数据 ---
const messages = ref([]);
const polishing = reactive({});

// --- API ---
const apiKey = ref(localStorage.getItem('debate_apikey') || '');
const fillLoading = ref(false);
const treeLoading = ref(false);

// --- 提示词 ---
const showPrompts = ref(false);
const promptLabels = { fill: '填补', polish: '润色', tree: '观点树 (Mermaid)' };
const prompts = reactive({
  fill: `你是一个辩论助手。主题：{{topic}}。角色：{{role}}（立场：{{stance}}）。对话：
{{history}}
请以{{role}}身份写一句尖锐反驳。只输出发言。`,
  polish: `润色以下发言，用 [-旧-] 和 {+新+} 标记改动。原文：{{content}}`,
  tree: `你是一个辩论分析师。请将以下辩论对话总结为 Mermaid mindmap。
只输出 Mermaid 代码（从 mindmap 开始），不要其他文字。
要求：
- 根节点为辩论主题
- 实线节点前加 🟢，虚线（潜在）前加 🔵~~
- 角色用 (A)/(B)/(C) 标注

示例：
mindmap
  核心议题
    正方A 论点1 🟢
      论据1
      论据2
    反方B 反驳 🟢
    反方潜在 🔵~~
      质疑1

对话：
{{history}}`,
});

// --- 观点树 ---
const treeMermaidCode = ref('');
const treePanel = ref(null);

mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    fontFamily: '"Segoe UI", Roboto, sans-serif',
    primaryColor: '#D9EAF7',
    primaryTextColor: '#1E293B',
    primaryBorderColor: '#93C5FD',
    lineColor: '#B0BEC5',
    secondaryColor: '#F0F4FF',
    tertiaryColor: '#E8F5E9',
  },
  mindmap: { useMaxWidth: false, padding: 20 },
});

// --- 工具函数 ---
function makeMsg(role, content, source = 'manual', extra = {}) {
  return {
    id: uuid(), role, content, source,
    edited: false,
    originalContent: source === 'ai_polish' ? (extra.originalContent || content) : null,
    revisionMarks: source === 'ai_polish' ? (extra.revisionMarks || null) : null,
    timestamp: new Date().toISOString(),
  };
}

function scrollToBottom() {
  nextTick(() => {
    const el = document.querySelector('.chat-panel');
    if (el) el.scrollTop = el.scrollHeight;
  });
}

function buildHistory() {
  return messages.value.map(m => `[${roles.find(r => r.id === m.role)?.name}] ${m.content}`).join('\n');
}

// --- 消息操作 ---
function onSend(content) {
  messages.value.push(makeMsg(currentRole.value, content));
  scrollToBottom();
}

function editMsg(msg) {
  const newContent = prompt('编辑', msg.content);
  if (newContent !== null && newContent.trim()) {
    msg.content = newContent.trim();
    msg.edited = true;
    if (msg.source === 'ai_polish') msg.revisionMarks = null;
  }
}

function deleteMsg(id) {
  messages.value = messages.value.filter(m => m.id !== id);
}

// --- AI 调用 ---
function fillTemplate(tpl, vars) {
  let s = tpl;
  for (const [k, v] of Object.entries(vars)) s = s.replace(new RegExp(`{{${k}}}`, 'g'), v);
  return s;
}

async function callDeepSeek(prompt, temperature = 0.7) {
  if (!apiKey.value) { alert('请填写API Key'); return null; }
  localStorage.setItem('debate_apikey', apiKey.value);
  try {
    const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey.value}` },
      body: JSON.stringify({ model: 'deepseek-chat', messages: [{ role: 'user', content: prompt }], temperature, max_tokens: 2048 }),
    });
    const data = await res.json();
    if (!data.choices?.length) throw new Error('API返回异常');
    return data.choices[0].message.content;
  } catch (e) { alert('AI调用失败: ' + e.message); return null; }
}

async function fill() {
  if (messages.value.length === 0) return;
  fillLoading.value = true;
  const vars = {
    topic: '当前辩论',
    role: roles.find(r => r.id === currentRole.value).name,
    stance: roles.find(r => r.id === currentRole.value).stance,
    history: buildHistory(),
  };
  const content = await callDeepSeek(fillTemplate(prompts.fill, vars), 0.7);
  if (content) {
    messages.value.push(makeMsg(currentRole.value, content.trim(), 'ai_fill'));
    scrollToBottom();
  }
  fillLoading.value = false;
}

async function polish(msg) {
  polishing[msg.id] = true;
  const prompt = fillTemplate(prompts.polish, { content: msg.content });
  const result = await callDeepSeek(prompt, 0.7);
  if (!result) { delete polishing[msg.id]; return; }
  const marks = result.trim();
  const newContent = marks.replace(/\[-(.*?)-\]/g, '').replace(/\{\+(.*?)\+\}/g, '$1');
  if (!newContent) { alert('润色结果异常'); delete polishing[msg.id]; return; }
  msg.originalContent = msg.content;
  msg.content = newContent;
  msg.source = 'ai_polish';
  msg.revisionMarks = marks;
  msg.edited = false;
  delete polishing[msg.id];
}

async function generateTree() {
  if (messages.value.length === 0) { alert('请先对话'); return; }
  treeLoading.value = true;
  const prompt = fillTemplate(prompts.tree, { history: buildHistory() });
  const raw = await callDeepSeek(prompt, 0.4);
  if (!raw) { treeLoading.value = false; return; }
  let code = raw.replace(/```mermaid|```mindmap|```/gi, '').trim();
  if (!code.startsWith('mindmap')) code = 'mindmap\n' + code;
  treeMermaidCode.value = code;
  await renderMermaidTo(treePanel.value?.mermaidContainer, code);
  treeLoading.value = false;
}

async function renderMermaidTo(container, code) {
  await nextTick();
  if (!container) return;
  container.innerHTML = '';
  const div = document.createElement('div');
  div.textContent = code;
  container.appendChild(div);
  try { await mermaid.run({ nodes: [div] }); }
  catch (e) { container.innerHTML = `<pre style="color:red">渲染失败\n${code}</pre>`; }
}

watch(() => treePanel.value?.fullscreenVisible, async (val) => {
  if (val && treeMermaidCode.value) {
    await nextTick();
    if (treePanel.value?.fullscreenContainer) {
      await renderMermaidTo(treePanel.value.fullscreenContainer, treeMermaidCode.value);
    }
  }
});

// --- 导出/导入 ---
function exportJSON() {
  const data = { messages: messages.value, prompts: { ...prompts }, treeMermaidCode: treeMermaidCode.value };
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `debate_${Date.now()}.json`;
  a.click();
}

function importJSON(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const data = JSON.parse(e.target.result);
      messages.value = data.messages || [];
      if (data.prompts) Object.assign(prompts, data.prompts);
      if (data.treeMermaidCode) {
        treeMermaidCode.value = data.treeMermaidCode;
        await nextTick();
        await renderMermaidTo(treePanel.value?.mermaidContainer, data.treeMermaidCode);
      } else { treeMermaidCode.value = ''; }
      scrollToBottom();
      alert('导入成功');
    } catch { alert('文件格式错误'); }
  };
  reader.readAsText(file);
  event.target.value = '';
}
</script>

<style scoped>
.debate-app { max-width: 1200px; margin: 0 auto; padding: 1rem; font-family: 'Segoe UI', Roboto, sans-serif; }
.toolbar { display: flex; justify-content: space-between; margin-bottom: 1rem; gap: 0.5rem; }
.role-selector button { margin-right: 0.5rem; padding: 0.4rem 1rem; border: 1px solid #D1D5DB; background: #F9FAFB; cursor: pointer; border-radius: 4px; color: #1F2937; }
.role-selector button.active { background: #DBEAFE; color: #1E40AF; border-color: #BFDBFE; }
.actions { display: flex; gap: 0.5rem; align-items: center; }
.main-content { display: flex; gap: 1rem; height: 75vh; }
.bottom-bar { margin-top: 0.8rem; display: flex; gap: 0.5rem; align-items: center; }
.bottom-bar input { flex: 1; padding: 0.4rem; border: 1px solid #E5E7EB; border-radius: 6px; }
.prompt-editor { margin-top: 0.5rem; background: #FFFBEB; padding: 1rem; border-radius: 8px; border: 1px solid #FDE68A; }
.prompt-editor textarea { width: 100%; margin-bottom: 0.5rem; border: 1px solid #E5E7EB; border-radius: 4px; padding: 0.5rem; }
button { padding: 0.4rem 0.8rem; border-radius: 6px; border: 1px solid #D1D5DB; background: white; cursor: pointer; font-size: 0.85rem; color: #1F2937; transition: background 0.1s; }
button:hover:not(:disabled) { background: #F3F4F6; }
button:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
