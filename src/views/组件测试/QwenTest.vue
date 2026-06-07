<template>
  <div class="qwen-test">
    <h2>🔧 Qwen 本地模型调试工具</h2>
    
    <!-- 配置区 -->
    <div class="config-section">
      <label>API 地址</label>
      <input v-model="apiUrl" placeholder="http://127.0.0.1:11434">
      
      <label>模型名称</label>
      <input v-model="modelName" placeholder="qwen3:8b">
      
      <label>Temperature</label>
      <input type="number" v-model.number="temperature" min="0" max="1" step="0.1">
      
      <label>Max Tokens</label>
      <input type="number" v-model.number="maxTokens" min="10" max="4096" step="10">
      
      <button @click="checkHealth" :disabled="checking">🔍 检查模型状态</button>
      <span v-if="healthStatus" :class="['status', healthStatus.ok ? 'ok' : 'err']">
        {{ healthStatus.msg }}
      </span>
    </div>

    <!-- 测试输入 -->
    <div class="test-section">
      <label>测试内容</label>
      <textarea v-model="testInput" rows="5" placeholder="输入一段话让 Qwen 生成标题..."></textarea>
      
      <div class="prompt-preview">
        <strong>实际发送的 Prompt：</strong>
        <pre>{{ builtPrompt }}</pre>
      </div>
      
      <button @click="runTest" :disabled="loading || !testInput.trim()">
        {{ loading ? '🔄 请求中...' : '🚀 发送测试' }}
      </button>
    </div>

    <!-- 响应展示 -->
    <div v-if="lastResponse" class="response-section">
      <h3>📦 完整响应</h3>
      <pre class="json-view">{{ JSON.stringify(lastResponse, null, 2) }}</pre>
      
      <h3>🔍 字段解析</h3>
      <div class="field-grid">
        <div><strong>response:</strong> <code>{{ lastResponse.response || '(空)' }}</code></div>
        <div><strong>thinking:</strong> <code>{{ lastResponse.thinking?.slice(0,100) || '(无)' }}{{ lastResponse.thinking?.length > 100 ? '...' : '' }}</code></div>
        <div><strong>done:</strong> <code>{{ lastResponse.done }}</code></div>
        <div><strong>total_duration:</strong> <code>{{ lastResponse.total_duration ? (lastResponse.total_duration/1e6).toFixed(1)+'ms' : '-' }}</code></div>
      </div>
      
      <h3>✨ 清理后标题</h3>
      <div class="result-box">
        <code>{{ cleanedTitle || '(提取失败)' }}</code>
        <button v-if="cleanedTitle" @click="copyTitle">📋 复制</button>
      </div>
    </div>

    <!-- 常见问题 -->
    <div class="tips-section">
      <h3>💡 常见问题排查</h3>
      <ul>
        <li v-if="lastResponse?.response === '' && lastResponse?.thinking">
          ⚠️ <strong>模型在思考但未输出 response</strong>：qwen3:8b 可能启用了思考模式，尝试在请求中添加 <code>"think": false</code> 或使用 <code>chat</code> 接口
        </li>
        <li v-if="healthStatus?.ok === false">
          ⚠️ <strong>模型未找到/未加载</strong>：执行 <code>ollama pull qwen3:8b</code> 或等待冷启动完成
        </li>
        <li v-if="lastError?.includes('CONNECTION_REFUSED')">
          ⚠️ <strong>连接被拒绝</strong>：确认 Ollama 正在运行，且未因并发请求崩溃
        </li>
        <li>✅ <strong>建议参数</strong>：temperature=0.3, num_predict≥256（本地没token限制，太小会被thinking吃光）, 添加 <code>format: "json"</code> 强制结构化输出</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const apiUrl = ref('http://127.0.0.1:11434')
const modelName = ref('qwen3:8b')
const temperature = ref(0.3)
const maxTokens = ref(256)
const testInput = ref('')
const loading = ref(false)
const checking = ref(false)
const healthStatus = ref(null)
const lastResponse = ref(null)
const lastError = ref(null)

const builtPrompt = computed(() => {
  return `请为以下内容生成一个准确的中文标题（8-12字），直接返回标题，不要任何解释或符号。
内容摘要：${testInput.value.slice(0, 300)}`
})

const cleanedTitle = computed(() => {
  if (!lastResponse.value) return null
  let title = (lastResponse.value.response || '').trim()
  
  // 如果 response 为空但 thinking 有内容，尝试从 thinking 提取
  if (!title && lastResponse.value.thinking) {
    const think = lastResponse.value.thinking
    // 尝试提取思考后的结论
    const match = think.match(/(?:标题|title)[：::\s]*["']?([^"'\n]{2,20})["']?/i)
    if (match) title = match[1].trim()
  }
  
  // 清理
  title = title.replace(/^["'`]+|["'`]+$/g, '')
    .replace(/^(标题[:：]?)\s*/i, '')
    .replace(/^\d+[\.\s]+/, '')
    .replace(/\n.*$/s, '')
    .slice(0, 20)
  
  return title.length >= 2 ? title : null
})

const checkHealth = async () => {
  checking.value = true
  healthStatus.value = null
  try {
    const res = await fetch(`${apiUrl.value}/api/tags`)
    const data = await res.json()
    const found = data.models?.some(m => m.name.includes(modelName.value))
    healthStatus.value = {
      ok: found,
      msg: found ? `✓ ${modelName.value} 已加载` : `✗ 未找到 ${modelName.value}，可用: ${data.models?.map(m=>m.name).join(', ') || '无'}`
    }
  } catch (e) {
    healthStatus.value = { ok: false, msg: `✗ 连接失败: ${e.message}` }
  }
  checking.value = false
}

const runTest = async () => {
  loading.value = true
  lastResponse.value = null
  lastError.value = null
  
  try {
    const res = await fetch(`${apiUrl.value}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelName.value,
        prompt: builtPrompt.value,
        stream: false,
        options: {
          temperature: temperature.value,
          num_predict: maxTokens.value,
          repeat_penalty: 1.1
        }
        // 尝试添加 think: false 禁用思考模式（如果模型支持）
        // , think: false
      })
    })
    
    if (!res.ok) {
      const err = await res.text()
      throw new Error(`HTTP ${res.status}: ${err}`)
    }
    
    lastResponse.value = await res.json()
    console.log('[QwenTest] 完整响应:', lastResponse.value)
    
  } catch (e) {
    lastError.value = e.message
    console.error('[QwenTest] 请求失败:', e)
  }
  
  loading.value = false
}

const copyTitle = () => {
  if (cleanedTitle.value) {
    navigator.clipboard.writeText(cleanedTitle.value)
    alert('✓ 已复制: ' + cleanedTitle.value)
  }
}
</script>

<style scoped>
.qwen-test {
  max-width: 900px;
  margin: 20px auto;
  padding: 20px;
  background: #140e09;
  border: 1px solid #2a1f14;
  border-radius: 8px;
  color: #d4c8a8;
  font-family: 'SimSun', 'Source Han Serif SC', monospace;
}

h2, h3 { color: #c8a45c; margin: 16px 0 12px; }

.config-section, .test-section, .response-section, .tips-section {
  background: #100a06;
  padding: 16px;
  border-radius: 6px;
  margin-bottom: 16px;
  border: 1px solid #2a1f14;
}

label {
  display: block;
  font-size: 12px;
  color: #8a7a6a;
  margin: 8px 0 4px;
}

input, textarea {
  width: 100%;
  padding: 8px 10px;
  background: #0d0805;
  border: 1px solid #2a1f14;
  border-radius: 4px;
  color: #d4c8a8;
  font-family: inherit;
  font-size: 13px;
  box-sizing: border-box;
}

input:focus, textarea:focus {
  outline: none;
  border-color: #c8a45c;
}

button {
  margin-top: 12px;
  padding: 8px 16px;
  background: #5a3a1a;
  border: 1px solid #8b6a3a;
  color: #e0d4b8;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: 0.2s;
}

button:hover:not(:disabled) {
  background: #6a4a2a;
  border-color: #a0804a;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.status {
  margin-left: 12px;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
}
.status.ok { background: rgba(74,222,128,0.1); color: #4ade80; }
.status.err { background: rgba(248,113,113,0.1); color: #f87171; }

.prompt-preview {
  margin: 12px 0;
  font-size: 11px;
  color: #6a5a4a;
}
.prompt-preview pre {
  background: #0d0805;
  padding: 8px;
  border-radius: 4px;
  white-space: pre-wrap;
  margin: 4px 0 0;
}

.json-view {
  background: #0d0805;
  padding: 12px;
  border-radius: 4px;
  font-size: 11px;
  overflow-x: auto;
  max-height: 300px;
  white-space: pre-wrap;
}

.field-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 8px;
  font-size: 12px;
}
.field-grid code {
  color: #8a7a6a;
  word-break: break-all;
}

.result-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #0d0805;
  border-radius: 4px;
}
.result-box code {
  font-size: 16px;
  color: #c8a45c;
  font-weight: bold;
}

.tips-section ul {
  font-size: 12px;
  color: #8a7a6a;
  padding-left: 20px;
  line-height: 1.8;
}
.tips-section code {
  background: #0d0805;
  padding: 2px 4px;
  border-radius: 3px;
  color: #c8a45c;
}
</style>