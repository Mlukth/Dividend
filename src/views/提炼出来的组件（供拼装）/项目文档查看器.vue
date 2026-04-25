<template>
  <div class="project-doc-container">
    <!-- 触发按钮 -->
    <button class="doc-trigger-btn" @click="openDialog">
      📄 项目文档
    </button>

    <!-- 模态框（对话框） -->
    <Teleport to="body">
      <div v-if="visible" class="modal-overlay" @click.self="closeDialog">
        <div class="modal-content">
          <div class="modal-header">
            <h3>项目文档</h3>
            <button class="close-btn" @click="closeDialog">×</button>
          </div>
          <div class="modal-body">
            <div class="doc-path-info">
              文档目录：{{ displayPath }}
            </div>
            <textarea
              v-model="docContent"
              readonly
              class="doc-textarea"
              placeholder="加载文档内容..."
            ></textarea>
            <div v-if="loading" class="loading-indicator">
              <span>📖 正在加载文档内容...</span>
            </div>
            <div v-if="errorMsg" class="error-msg">
              ⚠️ {{ errorMsg }}
            </div>
          </div>
          <div class="modal-footer">
            <button class="close-dialog-btn" @click="closeDialog">关闭</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 组件属性（可配置）
const props = defineProps({
  // 文档目录的绝对路径（Windows 路径或 POSIX 路径均可，后端需能解析）
  docDirectory: {
    type: String,
    default: 'D:/photovoltaic/pv-station-admin/src/views/小工具研发部(vue版本)/vue_little_tool_md'
  },
  // 后端 API 端点（用于读取目录下所有文档内容）
  apiEndpoint: {
    type: String,
    default: '/api/readDocDirectory'
  },
  // 是否使用 mock 模式（无需后端，展示模拟文档内容，便于预览 UI）
  mockMode: {
    type: Boolean,
    default: true   // 默认为 true，方便直接预览；实际集成时可设为 false 对接真实后端
  },
  // 自定义请求头（可选）
  requestHeaders: {
    type: Object,
    default: () => ({})
  }
})

// UI 状态
const visible = ref(false)       // 对话框是否可见
const docContent = ref('')       // 文档内容（文本）
const loading = ref(false)       // 加载中标志
const errorMsg = ref('')         // 错误信息

// 显示用的路径（将反斜杠转为正斜杠方便展示）
const displayPath = props.docDirectory.replace(/\\/g, '/')

// 模拟文档内容（用于 mock 模式，展示一个示例文档）
const getMockDocContent = () => {
  return `【模拟文档内容 - 演示模式】
当前配置的文档目录：
${displayPath}

说明：
这是一个模拟文档内容，用于展示组件的 UI 和交互效果。
实际使用时，可以将 mockMode 设置为 false，并配合后端 API 读取真实目录下的所有 .md / .txt 文件内容。

=== 示例文档结构 ===

## 项目介绍
光伏电站管理系统前端工具集。

## 小工具研发部说明
该目录下包含各种提高开发效率的脚本和文档。

## 待办事项
- 完善组件库文档
- 优化打包配置
- 集成自动化测试

=== 提示 ===
请将 mockMode 设为 false，并实现后端接口 /api/readDocDirectory 以读取真实文档。
接口约定：GET 请求，参数 path，返回 JSON 格式 { code: 0, data: { content: "合并后的文档文本" } }
`
}

// 从后端读取真实文档内容（或 mock）
const fetchRealDocContent = async () => {
  try {
    // 构造请求 URL，将绝对路径作为查询参数传给后端
    const encodedPath = encodeURIComponent(props.docDirectory)
    const url = `${props.apiEndpoint}?path=${encodedPath}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...props.requestHeaders
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const result = await response.json()
    // 约定后端返回格式：{ code: 0, data: { content: "文本内容" } }
    if (result.code === 0 && result.data && typeof result.data.content === 'string') {
      docContent.value = result.data.content
    } else {
      throw new Error('后端返回的数据格式无效，期望 { code:0, data:{ content: string } }')
    }
    errorMsg.value = ''
  } catch (err) {
    console.error('读取文档失败:', err)
    errorMsg.value = `读取文档失败：${err.message}`
    docContent.value = `【错误】无法从后端获取文档内容。\n请确认后端接口 ${props.apiEndpoint} 已实现且能正确读取目录：\n${displayPath}\n\n原始错误：${err.message}`
    // 如果希望降级显示模拟内容（便于调试），可以取消下一行注释
    // docContent.value = getMockDocContent() + '\n\n【注】由于真实接口失败，以上为模拟内容。'
  }
}

// 加载文档内容（根据 mockMode 决定数据来源）
const loadDocContent = async () => {
  loading.value = true
  errorMsg.value = ''
  docContent.value = ''
  
  if (props.mockMode) {
    // 模拟模式：直接显示模拟文档内容
    setTimeout(() => {
      docContent.value = getMockDocContent()
      loading.value = false
      errorMsg.value = ''
    }, 300) // 小延迟模拟异步加载，更真实
  } else {
    // 真实模式：请求后端 API
    await fetchRealDocContent()
    loading.value = false
  }
}

// 打开对话框
const openDialog = async () => {
  visible.value = true
  await loadDocContent()
}

// 关闭对话框
const closeDialog = () => {
  visible.value = false
  // 可选：清空内容或保留，下次打开重新加载即可
  // 若希望关闭时重置状态可取消注释
  // docContent.value = ''
  // errorMsg.value = ''
  // loading.value = false
}
</script>

<style scoped>
/* 按钮样式 */
.doc-trigger-btn {
  background: linear-gradient(135deg, #2c3e50, #3498db);
  border: none;
  color: white;
  padding: 8px 20px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 24px;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.doc-trigger-btn:hover {
  transform: translateY(-1px);
  background: linear-gradient(135deg, #1e2a36, #2980b9);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* 遮罩层 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.2s ease-out;
}

/* 对话框内容 */
.modal-content {
  background: #ffffff;
  border-radius: 20px;
  width: 85%;
  max-width: 900px;
  height: 70%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 35px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.25s ease-out;
}

/* 头部 */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #e9ecef;
  background: #f8fafc;
  border-radius: 20px 20px 0 0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 8px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #7f8c8d;
  transition: color 0.2s;
  line-height: 1;
  padding: 0 6px;
}

.close-btn:hover {
  color: #e74c3c;
}

/* 主体 */
.modal-body {
  flex: 1;
  padding: 20px 24px;
  overflow-y: auto;
  position: relative;
  background: #fefefe;
}

.doc-path-info {
  font-size: 12px;
  color: #5d6f7f;
  background: #ecf0f1;
  padding: 6px 12px;
  border-radius: 30px;
  margin-bottom: 16px;
  word-break: break-all;
  font-family: monospace;
}

.doc-textarea {
  width: 100%;
  height: calc(100% - 70px);
  min-height: 280px;
  padding: 14px 16px;
  font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
  font-size: 13px;
  line-height: 1.5;
  border: 1px solid #ddd;
  border-radius: 16px;
  resize: vertical;
  background: #fff;
  color: #1e2a3a;
  outline: none;
  transition: border 0.2s;
}

.doc-textarea:focus {
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.loading-indicator {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 6px 16px;
  border-radius: 40px;
  font-size: 13px;
  pointer-events: none;
}

.error-msg {
  margin-top: 12px;
  padding: 8px 12px;
  background: #ffeaea;
  color: #c0392b;
  border-radius: 12px;
  font-size: 13px;
  border-left: 4px solid #e74c3c;
}

/* 底部 */
.modal-footer {
  padding: 12px 24px;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
  background: #f8fafc;
  border-radius: 0 0 20px 20px;
}

.close-dialog-btn {
  background: #ecf0f1;
  border: none;
  padding: 8px 20px;
  border-radius: 40px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  color: #2c3e50;
  font-weight: 500;
}

.close-dialog-btn:hover {
  background: #dfe6e9;
  transform: scale(0.96);
}

/* 简单动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* 滚动条美化 */
.modal-body::-webkit-scrollbar {
  width: 6px;
}

.modal-body::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 8px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: #bdc3c7;
  border-radius: 8px;
}
</style>