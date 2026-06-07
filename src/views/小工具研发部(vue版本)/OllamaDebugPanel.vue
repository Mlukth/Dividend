<template>
  <div class="ollama-debug">
    <!-- ═══ 顶栏：启停 + 模型 + 状态 ═══ -->
    <div class="topbar">
      <h1>🔧 Ollama 本地模型调试面板</h1>
      <div class="topbar-right">
        <el-switch 
          v-model="ollamaOn" 
          :loading="toggling" 
          @change="toggleOllama" 
          active-text="运行中" 
          inactive-text="已停止" 
          size="small" 
        />
        <el-select 
          v-model="model" 
          size="small" 
          style="width:180px" 
          :disabled="!ollamaOn" 
          @change="fetchModelInfo"
        >
          <el-option label="qwen3:8b" value="qwen3:8b" />
          <el-option label="qwen3.5:4b-v2 (推荐)" value="qwen3.5:4b-v2" />
        </el-select>
        <el-tag v-if="ollamaOn" type="success" size="small">{{ model }}</el-tag>
        <el-tag v-else type="danger" size="small">离线</el-tag>
        <span v-if="modelInfo" class="model-meta">
          {{ modelInfo.size }} / {{ modelInfo.family }} / {{ modelInfo.quant }}
        </span>
      </div>
    </div>

    <div class="main-grid">
      <!-- ═══ 左栏：参数 ═══ -->
      <div class="params-panel">
        <h3>请求参数</h3>

        <div class="param-row">
          <label>System Prompt <span class="hint" style="color:#c8a45c">🔥 标题生成建议留空</span></label>
          <el-input 
            v-model="systemPrompt" 
            type="textarea" 
            :rows="2" 
            placeholder="系统指令（可选）" 
            class="spire-textarea"
          />
        </div>

        <div class="param-grid">
          <div class="param-item">
            <label>Temperature <span class="hint">(0-2)</span></label>
            <el-slider 
              v-model="params.temperature" 
              :min="0" :max="2" :step="0.01" 
              show-input size="small" 
            />
          </div>
          <div class="param-item">
            <label>num_predict <span class="hint">🔥 标题设 20</span></label>
            <el-input-number 
              v-model="params.num_predict" 
              :min="-1" :max="16384" :step="5" 
              size="small" controls-position="right" 
              style="width:100%" 
            />
          </div>
          <div class="param-item">
            <label>top_k</label>
            <el-input-number 
              v-model="params.top_k" 
              :min="1" :max="200" 
              size="small" controls-position="right" 
              style="width:100%" 
            />
          </div>
          <div class="param-item">
            <label>top_p <span class="hint">(0-1)</span></label>
            <el-slider 
              v-model="params.top_p" 
              :min="0" :max="1" :step="0.01" 
              show-input size="small" 
            />
          </div>
          <div class="param-item">
            <label>repeat_penalty <span class="hint">(≥1)</span></label>
            <el-slider 
              v-model="params.repeat_penalty" 
              :min="1" :max="2" :step="0.01" 
              show-input size="small" 
            />
          </div>
          <div class="param-item">
            <label>seed <span class="hint">(0=随机)</span></label>
            <el-input-number 
              v-model="params.seed" 
              :min="0" :max="9999999" 
              size="small" controls-position="right" 
              style="width:100%" 
            />
          </div>
          <div class="param-item">
            <label>num_ctx</label>
            <el-input-number 
              v-model="params.num_ctx" 
              :min="512" :max="32768" :step="512" 
              size="small" controls-position="right" 
              style="width:100%" 
            />
          </div>
          <div class="param-item">
            <label>mirostat <span class="hint">(0/1/2)</span></label>
            <el-radio-group v-model="params.mirostat" size="small">
              <el-radio-button :value="0">关</el-radio-button>
              <el-radio-button :value="1">v1</el-radio-button>
              <el-radio-button :value="2">v2</el-radio-button>
            </el-radio-group>
          </div>
          <div class="param-item" v-if="params.mirostat > 0">
            <label>mirostat_tau</label>
            <el-input-number 
              v-model="params.mirostat_tau" 
              :min="0.1" :max="20" :step="0.1" 
              size="small" controls-position="right" 
              style="width:100%" 
            />
          </div>
          <div class="param-item" v-if="params.mirostat > 0">
            <label>mirostat_eta</label>
            <el-input-number 
              v-model="params.mirostat_eta" 
              :min="0.01" :max="1" :step="0.01" 
              size="small" controls-position="right" 
              style="width:100%" 
            />
          </div>
          <!-- 🔧 关键：think 参数放在根层级 -->
          <div class="param-item">
            <label>think <span class="hint">qwen3:8b 建议关</span></label>
            <el-switch 
              v-model="params.think" 
              inactive-text="🧠思考" 
              active-text="✅直出" 
              size="small" 
            />
          </div>
          <div class="param-item">
            <label>raw <span class="hint">用 /api/generate</span></label>
            <el-switch v-model="useGenerate" size="small" />
          </div>
          <!-- 🔧 强制语言约束 -->
          <div class="param-item">
            <label>语言约束</label>
            <el-switch 
              v-model="enforceChinese" 
              inactive-text="宽松" 
              active-text="🇨🇳仅中文" 
              size="small" 
            />
          </div>
        </div>

        <div class="param-row">
          <label>Stop 词 <span class="hint">🔥 遇到换行/句号就停</span></label>
          <el-input 
            v-model="stopStr" 
            placeholder="如:\n,。" 
            size="small" 
          />
        </div>
        
        <div class="param-row">
          <label>摘要截断 <span class="hint">🔥 300 字足够</span></label>
          <el-slider 
            v-model="maxInputLen" 
            :min="100" :max="2000" :step="50" 
            show-input size="small" 
          />
        </div>
      </div>

      <!-- ═══ 右栏：测试区 + 响应 ═══ -->
      <div class="test-panel">
        <div class="input-section">
          <div class="input-header">
            <h3>测试输入</h3>
            <div>
              <el-button size="small" @click="loadPreset('title')">🔥 标题生成</el-button>
              <el-button size="small" @click="loadPreset('translate')">翻译</el-button>
              <el-button size="small" @click="loadPreset('code')">写代码</el-button>
            </div>
          </div>
          <el-input 
            v-model="userInput" 
            type="textarea" 
            :rows="5" 
            placeholder="输入发送给模型的内容..." 
            class="spire-textarea"
          />
          <div class="prompt-preview" v-if="builtPrompt">
            <strong>完整 Prompt:</strong>
            <pre>{{ builtPrompt }}</pre>
          </div>
          <el-button 
            type="primary" 
            @click="send" 
            :loading="sending" 
            :disabled="!ollamaOn || !userInput.trim()" 
            style="margin-top:12px"
            class="spire-btn-gold"
          >
            {{ sending ? '请求中...' : '🚀 发送测试' }}
          </el-button>
          <span v-if="elapsed" class="elapsed">{{ elapsed }}ms</span>
        </div>

        <!-- 响应展示 -->
        <div v-if="lastResponse" class="response-section">
          <div class="resp-tabs">
            <button 
              :class="['resp-tab', { active: respTab === 'reply' }]" 
              @click="respTab = 'reply'"
            >回复</button>
            <button 
              :class="['resp-tab', { active: respTab === 'think' }]" 
              @click="respTab = 'think'"
              v-if="thinking"
            >思考</button>
            <button 
              :class="['resp-tab', { active: respTab === 'raw' }]" 
              @click="respTab = 'raw'"
            >原始 JSON</button>
            <button 
              :class="['resp-tab', { active: respTab === 'stats' }]" 
              @click="respTab = 'stats'"
            >统计</button>
            <el-button size="small" @click="copyResponse" style="margin-left:auto" class="spire-btn-ghost">
              📋 复制
            </el-button>
          </div>

          <div v-if="respTab === 'reply'" class="resp-content" :class="{ 'lang-warn': isNonChinese }">
            {{ reply }}
            <span v-if="isNonChinese" class="lang-badge">⚠️ 非中文</span>
            <span v-if="isVerbose" class="lang-badge warn">⚠️ 过于冗长</span>
          </div>
          <div v-if="respTab === 'think'" class="resp-content dim">{{ thinking }}</div>
          <div v-if="respTab === 'raw'" class="resp-content pre">{{ JSON.stringify(lastResponse, null, 2) }}</div>
          <div v-if="respTab === 'stats'" class="resp-content">
            <table class="stats-table">
              <tr><td>总耗时</td><td>{{ lastResponse.total_duration ? (lastResponse.total_duration / 1e6).toFixed(0) + 'ms' : '-' }}</td></tr>
              <tr><td>生成 token</td><td>{{ lastResponse.eval_count || 0 }} / {{ lastResponse.eval_duration ? (lastResponse.eval_duration / 1e6).toFixed(0) + 'ms' : '-' }}</td></tr>
              <tr><td>生成速度</td><td>{{ lastResponse.eval_count && lastResponse.eval_duration ? (lastResponse.eval_count / (lastResponse.eval_duration / 1e9)).toFixed(1) + ' tok/s' : '-' }}</td></tr>
              <tr><td>完成原因</td><td>{{ lastResponse.done_reason || '-' }}</td></tr>
            </table>
          </div>
        </div>

        <!-- 智能诊断 -->
        <div v-if="lastResponse" class="tips-section">
          <h3>💡 诊断结果</h3>
          <ul>
            <li v-if="isVerbose">
              ⚠️ <strong>模型在"聊天"</strong>：请确保 <code>num_predict≤30</code> 且 <code>stop</code> 填了 <code>\n,。</code>
            </li>
            <li v-if="isNonChinese">
              ⚠️ <strong>语言漂移</strong>：开启「🇨仅中文」或缩短输入至 300 字内
            </li>
            <li v-if="reply && !isNonChinese && !isVerbose">
              ✅ <strong>提取成功</strong>："{{ reply }}"
            </li>
            <li v-if="!reply && thinking">
              ⚠️ <strong>无 response 输出</strong>：请关闭 <code>think</code> 参数
            </li>
            <li>
              ✅ <strong>推荐参数</strong>：temp=0.1, num_predict=20, stop=\n, think=false
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue' // 🔧 修复：添加 watch
import { ElMessage } from 'element-plus'

const API = 'http://127.0.0.1:11434'

// ── 状态 ──
const ollamaOn = ref(false)
const toggling = ref(false)
const model = ref('qwen3.5:4b-v2') // 默认使用 4B 版本
const modelInfo = ref(null)

// ── 检查模型 ──
async function checkStatus() {
  try {
    const r = await fetch(API + '/api/tags')
    const d = await r.json()
    ollamaOn.value = true
    modelInfo.value = null
    fetchModelInfo()
  } catch {
    ollamaOn.value = false
    ElMessage.error('无法连接 Ollama')
  }
}

async function fetchModelInfo() {
  try {
    const r = await fetch(API + '/api/tags')
    const d = await r.json()
    const m = d.models.find(x => x.name === model.value)
    if (m) {
      modelInfo.value = {
        size: (m.size / 1e9).toFixed(1) + 'GB',
        family: m.details?.family || '-',
        quant: m.details?.quantization_level || '-'
      }
    }
  } catch {}
}

async function toggleOllama(on) {
  toggling.value = true
  // 简单的启停逻辑
  if (on) {
    for (let i = 0; i < 10; i++) {
      await new Promise(r => setTimeout(r, 1000))
      try { await fetch(API + '/api/tags'); break } catch {}
    }
  }
  await checkStatus()
  toggling.value = false
}

onMounted(checkStatus)
watch(model, fetchModelInfo) // 🔧 修复：此处不再报错

// ── 参数 ──
const params = reactive({
  temperature: 0.1,  // 🔥 极低温度，拒绝发挥
  num_predict: 20,   // 🔥 只要 20 个 token，防止发散
  top_k: 40,
  top_p: 0.9,
  repeat_penalty: 1.1,
  seed: 0,
  num_ctx: 2048,
  mirostat: 0,
  mirostat_tau: 5.0,
  mirostat_eta: 0.1,
  think: false
})

const systemPrompt = ref('')
const userInput = ref('')
const stopStr = ref('\\n,。')  // 🔥 默认强制停止
const useGenerate = ref(false)
const enforceChinese = ref(true)
const maxInputLen = ref(300)

const builtPrompt = computed(() => {
  if (!userInput.value) return ''
  const truncated = userInput.value.length > maxInputLen.value 
    ? userInput.value.slice(0, maxInputLen.value) + '...(截断)' 
    : userInput.value
  
  let prompt = systemPrompt.value 
    ? `[System] ${systemPrompt.value}\n\n[User] ${truncated}` 
    : truncated
  
  if (enforceChinese.value) {
    prompt += '\n\n[约束] 直接输出标题，禁止其他内容'
  }
  
  return prompt
})

const isNonChinese = computed(() => {
  if (!reply.value) return false
  const zhCount = (reply.value.match(/[\u4e00-\u9fa5]/g) || []).length
  const total = reply.value.replace(/\s/g, '').length
  return total > 0 && zhCount / total < 0.6
})

const isVerbose = computed(() => {
  return reply.value && reply.value.length > 18
})

// ── 发送请求 ──
const sending = ref(false)
const elapsed = ref('')
const lastResponse = ref(null)
const reply = ref('')
const thinking = ref('')
const respTab = ref('reply')

async function send() {
  sending.value = true
  elapsed.value = ''
  lastResponse.value = null
  reply.value = ''
  thinking.value = ''
  
  const t0 = performance.now()
  // 解析 Stop 词
  const stop = stopStr.value 
    ? stopStr.value.split(/[,，]/).map(s => s.trim().replace(/\\n/g, '\n')).filter(Boolean) 
    : undefined
  
  const baseBody = {
    model: model.value,
    stream: false,
    think: params.think,
    options: {
      temperature: params.temperature,
      num_predict: params.num_predict,
      top_k: params.top_k,
      top_p: params.top_p,
      repeat_penalty: params.repeat_penalty,
      seed: params.seed,
      num_ctx: params.num_ctx,
      mirostat: params.mirostat,
      stop: stop
    }
  }

  try {
    let res, data
    
    if (useGenerate.value) {
      const { think, messages, ...rest } = baseBody
      const body = { ...rest, prompt: builtPrompt.value }
      res = await fetch(API + '/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
    } else {
      const messages = systemPrompt.value
        ? [
            { role: 'system', content: systemPrompt.value },
            { role: 'user', content: userInput.value }
          ]
        : [{ role: 'user', content: userInput.value }]
      
      const body = { ...baseBody, messages }
      res = await fetch(API + '/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
    }
    
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    
    data = await res.json()
    lastResponse.value = data
    
    reply.value = (data.message?.content || data.response || '').trim()
    thinking.value = data.message?.thinking || data.thinking || ''
    
    // 提取纯中文标题（去除多余符号）
    reply.value = reply.value.replace(/^["'`]+|["'`]+$/g, '')
      .replace(/^(标题[:：]?)\s*/i, '')
      .replace(/[。！?？\n]/g, '')
      .slice(0, 20)
    
    elapsed.value = Math.round(performance.now() - t0)
    respTab.value = reply.value ? 'reply' : thinking.value ? 'think' : 'raw'
    
  } catch (e) {
    ElMessage.error('请求失败: ' + e.message)
    elapsed.value = Math.round(performance.now() - t0)
  }
  
  sending.value = false
}

function copyResponse() {
  if (reply.value) {
    navigator.clipboard.writeText(reply.value)
    ElMessage.success('已复制: ' + reply.value)
  }
}

// ── 预设 ──
function loadPreset(type) {
  systemPrompt.value = ''
  if (type === 'title') {
    // 🔥 标题生成终极配置
    systemPrompt.value = '你是一个标题生成器。请为以下内容生成一个 8-12 字的中文标题。只返回标题，不要解释。'
    params.temperature = 0.1
    params.num_predict = 20
    params.think = false
    enforceChinese.value = true
    maxInputLen.value = 300
    stopStr.value = '\\n,。'
    ElMessage.success('已加载「标题生成」参数')
  } else if (type === 'translate') {
    systemPrompt.value = '翻译成中文，只返回译文。'
    params.temperature = 0.2
    params.num_predict = 1024
    ElMessage.success('已加载「翻译」参数')
  } else if (type === 'code') {
    systemPrompt.value = '你是一个编程助手。直接输出代码。'
    params.temperature = 0.3
    params.num_predict = 2048
    ElMessage.success('已加载「代码」参数')
  }
}
</script>

<style scoped>
/* 样式保持与之前一致 */
.ollama-debug { font-family: 'Segoe UI', system-ui, sans-serif; background: #0d0805; color: #d4c8a8; min-height: 100vh; padding: 16px; }
.topbar { background: #140e09; padding: 12px 20px; display: flex; align-items: center; gap: 16px; border: 1px solid #2a1f14; border-radius: 8px; flex-wrap: wrap; margin-bottom: 16px; }
.topbar h1 { font-size: 16px; color: #c8a45c; margin: 0; white-space: nowrap; font-weight: 600; font-family: 'SimSun', 'Source Han Serif SC', serif; }
.topbar-right { margin-left: auto; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.model-meta { font-size: 11px; color: #8a7a6a; font-family: monospace; }
.main-grid { display: grid; grid-template-columns: 340px 1fr; gap: 16px; max-width: 1400px; margin: 0 auto; }
@media (max-width: 900px) { .main-grid { grid-template-columns: 1fr; } }
.params-panel { background: #100a06; border-radius: 8px; padding: 16px; border: 1px solid #2a1f14; }
.params-panel h3 { font-size: 14px; margin: 0 0 12px; color: #c8a45c; font-weight: 600; font-family: 'SimSun', serif; }
.param-row { margin-bottom: 12px; }
.param-row label { display: block; font-size: 12px; color: #8a7a6a; margin-bottom: 4px; font-weight: 500; }
.param-grid { display: flex; flex-direction: column; gap: 10px; }
.param-item label { font-size: 12px; color: #8a7a6a; display: flex; align-items: center; gap: 4px; margin-bottom: 2px; font-weight: 500; }
.hint { color: #6a5a4a; font-weight: normal; font-size: 11px; }
.test-panel { display: flex; flex-direction: column; gap: 16px; }
.input-section { background: #100a06; border-radius: 8px; padding: 16px; border: 1px solid #2a1f14; }
.input-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px; }
.input-header h3 { font-size: 14px; margin: 0; color: #c8a45c; font-weight: 600; font-family: 'SimSun', serif; }
.prompt-preview { margin-top: 8px; font-size: 12px; color: #8a7a6a; }
.prompt-preview pre { background: #0d0805; padding: 8px; border-radius: 6px; max-height: 120px; overflow-y: auto; white-space: pre-wrap; font-size: 11px; color: #8a7a6a; border: 1px solid #2a1f14; }
.elapsed { font-size: 12px; color: #c8a45c; margin-left: 12px; font-family: monospace; }
.response-section { background: #100a06; border-radius: 8px; padding: 16px; border: 1px solid #2a1f14; }
.resp-tabs { display: flex; gap: 4px; margin-bottom: 12px; align-items: center; flex-wrap: wrap; }
.resp-tab { padding: 6px 14px; border: 1px solid #2a1f14; background: #0d0805; color: #8a7a6a; cursor: pointer; border-radius: 6px; font-size: 13px; transition: all 0.15s; font-family: inherit; }
.resp-tab:hover { border-color: #c8a45c; color: #c8a45c; }
.resp-tab.active { background: rgba(200,164,92,0.1); color: #c8a45c; border-color: #c8a45c; }
.resp-content { background: #0d0805; border-radius: 6px; padding: 14px; font-size: 14px; line-height: 1.8; white-space: pre-wrap; max-height: 400px; overflow-y: auto; color: #d4c8a8; border: 1px solid #2a1f14; position: relative; }
.resp-content.lang-warn { border-color: #f87171; background: rgba(248,113,113,0.05); }
.lang-badge { position: absolute; top: 8px; right: 8px; background: #f87171; color: #fff; font-size: 10px; padding: 2px 6px; border-radius: 3px; font-weight: 500; }
.lang-badge.warn { right: auto; left: 8px; background: #f59e0b; }
.resp-content.dim { color: #8a7a6a; font-style: italic; font-size: 13px; }
.resp-content.pre { font-size: 11px; font-family: 'Cascadia Code', 'Fira Code', monospace; }
.stats-table { width: 100%; border-collapse: collapse; }
.stats-table td { padding: 6px 10px; border-bottom: 1px solid #2a1f14; font-size: 13px; font-family: monospace; }
.stats-table td:first-child { color: #8a7a6a; width: 120px; }
.tips-section { background: rgba(200,164,92,0.06); border: 1px solid rgba(200,164,92,0.2); border-radius: 6px; padding: 12px 16px; }
.tips-section h3 { font-size: 13px; margin: 0 0 8px; color: #c8a45c; font-weight: 600; font-family: 'SimSun', serif; }
.tips-section ul { font-size: 12px; color: #8a7a6a; padding-left: 20px; line-height: 1.8; margin: 0; }
.tips-section li { margin-bottom: 4px; }
.tips-section code { background: #0d0805; padding: 2px 4px; border-radius: 3px; color: #c8a45c; font-family: monospace; }
:deep(.el-switch__core) { background: #2a1f14 !important; border-color: #3a2a1a !important; }
:deep(.el-switch.is-checked .el-switch__core) { background: rgba(200,164,92,0.2) !important; border-color: #c8a45c !important; }
:deep(.el-select .el-input__inner) { background: #0d0805 !important; border-color: #2a1f14 !important; color: #d4c8a8 !important; }
:deep(.el-input-number .el-input__inner) { background: #0d0805 !important; border-color: #2a1f14 !important; color: #d4c8a8 !important; }
:deep(.el-slider__runway) { background: #2a1f14 !important; }
:deep(.el-slider__bar) { background: #c8a45c !important; }
:deep(.el-radio-button__inner) { background: #0d0805 !important; border-color: #2a1f14 !important; color: #8a7a6a !important; }
:deep(.is-active .el-radio-button__inner) { background: rgba(200,164,92,0.1) !important; border-color: #c8a45c !important; color: #c8a45c !important; }
:deep(.el-textarea__inner) { background: #0d0805 !important; border-color: #2a1f14 !important; color: #d4c8a8 !important; font-family: monospace !important; }
:deep(.el-button--primary) { background: #5a3a1a !important; border-color: #8b6a3a !important; color: #e0d4b8 !important; }
:deep(.el-button--primary:hover) { background: #6a4a2a !important; border-color: #a0804a !important; }
</style>