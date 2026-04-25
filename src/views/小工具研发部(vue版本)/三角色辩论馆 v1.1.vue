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
      <!-- 左侧观点树 -->
      <div class="left-panel">
        <div class="panel-header">
          <h3>🌲 观点地图</h3>
          <div class="zoom-controls" v-if="treeMermaidCode">
            <button @click="zoomOut" :disabled="scale <= 0.3">−</button>
            <span class="zoom-label">{{ Math.round(scale * 100) }}%</span>
            <button @click="zoomIn" :disabled="scale >= 2">+</button>
            <button @click="resetZoom">↺</button>
            <button @click="openFullscreen">🔍</button>
          </div>
        </div>
        <div
          ref="viewport"
          class="tree-viewport"
          @wheel.prevent="onWheel"
          @mousedown="startPan"
          @mousemove="onPan"
          @mouseup="endPan"
          @mouseleave="endPan"
          @contextmenu.prevent
        >
          <div
            class="tree-scaler"
            :style="{ transform: `translate(${panX}px, ${panY}px) scale(${scale})` }"
          >
            <div ref="mermaidContainer" class="mermaid-container" v-show="treeMermaidCode"></div>
          </div>
          <div v-if="!treeMermaidCode" class="placeholder">
            对话后点击“生成观点树”<br/>在此看到交互式地图
          </div>
        </div>
      </div>

      <!-- 右侧对话 -->
      <div class="right-panel">
        <div class="chat-panel" ref="chatPanel">
          <div
            v-for="msg in messages"
            :key="msg.id"
            class="message"
            :class="[
              'role-' + msg.role.toLowerCase(),
              { 'ai-msg': msg.source !== 'manual' },
            ]"
          >
            <div class="msg-header">
              <span class="role-tag">{{ roles.find(r => r.id === msg.role)?.name }}</span>
              <span v-if="msg.source !== 'manual'" class="ai-badge">AI</span>
              <span v-if="msg.edited" class="edited-badge">已编辑</span>
            </div>
            <div class="content" v-html="renderContent(msg)"></div>
            <div class="msg-actions">
              <button @click="editMsg(msg)">✏️</button>
              <button @click="deleteMsg(msg.id)">🗑</button>
              <button
                v-if="msg.source === 'manual'"
                @click="polish(msg)"
                :disabled="polishing[msg.id]"
              >
                {{ polishing[msg.id] ? '✨...' : '✨' }}
              </button>
            </div>
          </div>
        </div>
        <div class="input-area">
          <textarea
            v-model="newMsg"
            @keydown.enter.exact.prevent="send"
            placeholder="以当前角色发言..."
            rows="3"
          ></textarea>
          <div class="input-btns">
            <button @click="send" :disabled="!newMsg.trim()">发送</button>
            <button @click="fill" :disabled="fillLoading || messages.length === 0">
              {{ fillLoading ? '填补中...' : '🤖 AI填补' }}
            </button>
          </div>
        </div>
      </div>
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

    <!-- 全屏弹窗（背景浅灰，支持左键拖动） -->
    <div class="fullscreen-overlay" v-if="fullscreenVisible" @click.self="closeFullscreen">
      <div class="fullscreen-content">
        <div class="fullscreen-toolbar">
          <button @click="zoomOut" :disabled="scale <= 0.3">−</button>
          <span>{{ Math.round(scale * 100) }}%</span>
          <button @click="zoomIn" :disabled="scale >= 2">+</button>
          <button @click="resetZoom">↺</button>
          <button @click="closeFullscreen">✖ 关闭</button>
        </div>
        <div
          class="fullscreen-viewport"
          @wheel.prevent="onWheel"
          @mousedown="startPan"
          @mousemove="onPan"
          @mouseup="endPan"
          @mouseleave="endPan"
          @contextmenu.prevent
        >
          <div :style="{ transform: `scale(${scale})`, transformOrigin: 'center top' }">
            <div ref="fullscreenContainer" class="mermaid-container"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, watch } from 'vue';
import { v4 as uuid } from 'uuid';
import mermaid from 'mermaid';

// --- 角色 ---
const roles = [
  { id: 'A', name: '角色A（攻）', stance: '正方' },
  { id: 'B', name: '角色B（防）', stance: '反方' },
  { id: 'C', name: '角色C（观）', stance: '中立' },
];
const currentRole = ref('A');

// --- 对话数据 ---
const messages = ref([]);
const newMsg = ref('');
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

// --- 观点树状态 ---
const treeMermaidCode = ref('');
const mermaidContainer = ref(null);
const fullscreenContainer = ref(null);

const scale = ref(1);
const panX = ref(0);
const panY = ref(0);
const isPanning = ref(false);
const panStart = { x: 0, y: 0 };

const fullscreenVisible = ref(false);

// 初始化 Mermaid（主视图保持明亮）
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
  mindmap: {
    useMaxWidth: false,
    padding: 20,
  },
});

// --- 工具函数 ---
function makeMsg(role, content, source = 'manual', extra = {}) {
  return {
    id: uuid(),
    role,
    content,
    source,
    edited: false,
    originalContent: source === 'ai_polish' ? (extra.originalContent || content) : null,
    revisionMarks: source === 'ai_polish' ? (extra.revisionMarks || null) : null,
    timestamp: new Date().toISOString(),
  };
}

function renderContent(msg) {
  if (msg.source === 'ai_polish' && msg.revisionMarks) {
    return msg.revisionMarks
      .replace(/\[-(.*?)-\]/g, '<del style="color:#DC2626;">$1</del>')
      .replace(/\{\+(.*?)\+\}/g, '<ins style="color:#16A34A;">$1</ins>');
  }
  return msg.content.replace(/\n/g, '<br/>');
}

function scrollToBottom() {
  nextTick(() => {
    const el = document.querySelector('.chat-panel');
    if (el) el.scrollTop = el.scrollHeight;
  });
}

// --- 消息操作 ---
function send() {
  if (!newMsg.value.trim()) return;
  messages.value.push(makeMsg(currentRole.value, newMsg.value.trim()));
  newMsg.value = '';
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
function buildHistory() {
  return messages.value.map(m => `[${roles.find(r => r.id === m.role)?.name}] ${m.content}`).join('\n');
}

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

  await renderMermaidTo(mermaidContainer.value, code);
  scale.value = 1;
  panX.value = 0;
  panY.value = 0;
  treeLoading.value = false;
}

async function renderMermaidTo(container, code) {
  await nextTick();
  if (!container) return;
  container.innerHTML = '';
  const div = document.createElement('div');
  div.textContent = code;
  container.appendChild(div);
  try {
    await mermaid.run({ nodes: [div] });
  } catch (e) {
    container.innerHTML = `<pre style="color:red">渲染失败\n${code}</pre>`;
  }
}

watch(fullscreenVisible, async (val) => {
  if (val && treeMermaidCode.value) {
    await nextTick();
    if (fullscreenContainer.value) await renderMermaidTo(fullscreenContainer.value, treeMermaidCode.value);
  }
});

// --- 缩放与拖动 (左键/右键均可) ---
function zoomIn() { if (scale.value < 2) scale.value = Math.round((scale.value + 0.1) * 10) / 10; }
function zoomOut() { if (scale.value > 0.3) scale.value = Math.round((scale.value - 0.1) * 10) / 10; }
function resetZoom() { scale.value = 1; panX.value = 0; panY.value = 0; }

function onWheel(e) {
  if (!e.ctrlKey) return;
  e.preventDefault();
  const delta = e.deltaY > 0 ? -0.1 : 0.1;
  scale.value = Math.min(2, Math.max(0.3, Math.round((scale.value + delta) * 10) / 10));
}

function startPan(e) {
  // 允许左键 (0) 或右键 (2)
  if (e.button !== 0 && e.button !== 2) return;
  isPanning.value = true;
  panStart.x = e.clientX - panX.value;
  panStart.y = e.clientY - panY.value;
}
function onPan(e) {
  if (!isPanning.value) return;
  panX.value = e.clientX - panStart.x;
  panY.value = e.clientY - panStart.y;
}
function endPan() { isPanning.value = false; }

function openFullscreen() { fullscreenVisible.value = true; }
function closeFullscreen() { fullscreenVisible.value = false; }

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
        await renderMermaidTo(mermaidContainer.value, data.treeMermaidCode);
      } else {
        treeMermaidCode.value = '';
      }
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

.left-panel { width: 45%; min-width: 360px; border: 1px solid #E5E7EB; border-radius: 12px; background: #FFFFFF; display: flex; flex-direction: column; overflow: hidden; }
.panel-header { display: flex; justify-content: space-between; align-items: center; padding: 0.7rem 1rem; border-bottom: 1px solid #F3F4F6; }
.panel-header h3 { margin: 0; font-size: 1rem; color: #1F2937; }
.zoom-controls { display: flex; align-items: center; gap: 0.3rem; }
.zoom-label { font-size: 0.8rem; min-width: 40px; text-align: center; color: #6B7280; }

.tree-viewport { flex: 1; overflow: hidden; position: relative; background: #FAFBFC; user-select: none; }
.tree-scaler { transform-origin: 0 0; }
.mermaid-container { padding: 20px; background: white; border-radius: 8px; }
.placeholder { display: flex; align-items: center; justify-content: center; height: 100%; color: #9CA3AF; text-align: center; font-size: 0.9rem; }

.right-panel { flex: 1; display: flex; flex-direction: column; }
.chat-panel { flex: 1; border: 1px solid #E5E7EB; border-radius: 12px; padding: 1rem; overflow-y: auto; margin-bottom: 0.5rem; background: #FFFFFF; }
.message { padding: 0.8rem; border-radius: 8px; margin-bottom: 0.8rem; background: white; box-shadow: 0 1px 2px rgba(0,0,0,0.04); }
.role-a { border-left: 4px solid #60A5FA; }
.role-b { border-left: 4px solid #F87171; }
.role-c { border-left: 4px solid #34D399; }
.ai-msg { background-color: #F4F9F4; }
.msg-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.3rem; }
.role-tag { font-weight: 600; color: #1F2937; }
.ai-badge { background: #10B981; color: #ECFDF5; font-size: 0.7rem; padding: 0.15rem 0.5rem; border-radius: 4px; }
.edited-badge { background: #FBBF24; color: #78350F; font-size: 0.7rem; padding: 0.15rem 0.5rem; border-radius: 4px; }
.msg-actions { margin-top: 0.5rem; text-align: right; }
.msg-actions button { background: none; border: none; cursor: pointer; font-size: 1rem; margin-left: 0.2rem; opacity: 0.7; }
.msg-actions button:hover { opacity: 1; }

.input-area { display: flex; gap: 0.5rem; }
.input-area textarea { flex: 1; padding: 0.6rem; border-radius: 8px; border: 1px solid #E5E7EB; resize: vertical; font-size: 0.9rem; }
.input-btns { display: flex; flex-direction: column; gap: 0.3rem; }

.bottom-bar { margin-top: 0.8rem; display: flex; gap: 0.5rem; align-items: center; }
.bottom-bar input { flex: 1; padding: 0.4rem; border: 1px solid #E5E7EB; border-radius: 6px; }
.prompt-editor { margin-top: 0.5rem; background: #FFFBEB; padding: 1rem; border-radius: 8px; border: 1px solid #FDE68A; }
.prompt-editor textarea { width: 100%; margin-bottom: 0.5rem; border: 1px solid #E5E7EB; border-radius: 4px; padding: 0.5rem; }

button { padding: 0.4rem 0.8rem; border-radius: 6px; border: 1px solid #D1D5DB; background: white; cursor: pointer; font-size: 0.85rem; color: #1F2937; transition: background 0.1s; }
button:hover:not(:disabled) { background: #F3F4F6; }
button:disabled { opacity: 0.5; cursor: not-allowed; }

/* 全屏弹窗 —— 背景浅灰，节点保持可辨识 */
.fullscreen-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: #F3F4F6;  /* 浅灰色背景 */
  z-index: 1000;
  display: flex; flex-direction: column;
}
.fullscreen-content { flex: 1; display: flex; flex-direction: column; }
.fullscreen-toolbar {
  padding: 0.8rem; display: flex; gap: 0.5rem; align-items: center;
  background: #E5E7EB; border-bottom: 1px solid #D1D5DB;
}
.fullscreen-toolbar span { min-width: 50px; color: #1F2937; }
.fullscreen-viewport {
  flex: 1; overflow: auto; display: flex; justify-content: center;
  padding: 20px;
  background: #F3F4F6;  /* 浅灰背景保持一致 */
}
</style>