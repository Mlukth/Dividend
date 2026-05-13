# 可复用组件库 — 供拼装

## 已有组件

| 文件 | 用途 |
|------|------|
| `决策树编辑.vue` | 内联决策树编辑器 |
| `决策树页面.vue` | 独立决策树页面 |
| `决策树编辑器.vue` | 决策树编辑器变体 |
| `决策树编辑器（独立页面）.vue` | 独立页面版 |
| `PromptMerge 提示词整合器.vue` | 多提示词合并 |
| `项目文档查看器.vue` | 项目文档浏览 |

---

## 窗口AI智能导入导出（通用模式）

**一句话**：把数据打包成自然语言prompt → 用户粘贴到外部AI → AI返回JSON → 粘贴回来解析录入。省token，不依赖API Key。

### 适用场景
- 需要AI做结构化提取（文本→JSON）
- 需要AI做评分/判断/审查
- 批量导入外部数据（语雀、飞书、Notion导出的文档）
- 用户想用自己的AI工具（ChatGPT/DeepSeek/Kimi等）

### 三步流程

```
1. 点击"复制提示词" → 拼接好的prompt写入剪贴板
2. 用户粘贴到任意AI窗口 → AI返回JSON结果
3. 粘贴JSON回来 → 点击"解析导入" → 数据录入
```

### 参考实现

**ETT（评分类 — 单条）**：`src/views/小工具研发部(vue版本)/EnglishTranslationTool.vue`
- `buildScoringPrompt()` — 拼接系统提示词+原文+参考译文+学生译文+考点
- `copyPromptToClipboard()` — 写入剪贴板
- `submitWindowAI()` — 正则 `/\{[\s\S]*\}/` 提取JSON，容错AI附加文字
- `saveScoreResult()` — 解析后持久化
- 评分模式切换：`scoringMode` ref (`'api'` | `'window'`)，共享同一个 `buildScoringPrompt()`

**SlayTheSpire（导入类 — 单条+批量）**：`src/views/组件测试/PromptManager-SlayTheSpire.vue`
- `SINGLE_IMPORT_PROMPT` — 单条分析模板
- `BATCH_IMPORT_PROMPT` — 批量导入模板（含语雀格式说明）
- `importMode` ref (`'single'` | `'batch'`) — 切换自动重复制
- `copyImportPrompt()` — 根据模式复制对应prompt
- `submitAiImport()` — 数组用 `JSON.parse`，单条用正则提取 `{...}`
- `importPlaceholder` computed — 根据模式切换输入框提示

### 代码模板

新建工具需要实现以下部分：

```js
// 1. 定义提示词模板（用模板字符串，不要拼接）
const IMPORT_PROMPT = `你是...专家。请分析以下...返回严格JSON...

待处理数据：`

// 2. 拼接prompt
function buildPrompt() {
  return IMPORT_PROMPT + '\n' + userData.value
}

// 3. 复制到剪贴板
async function copyPrompt() {
  await navigator.clipboard.writeText(buildPrompt())
  ElMessage.success('已复制，粘贴到窗口AI获取结果')
}

// 4. 解析AI返回的JSON（正则容错）
function parseAiResult() {
  const text = aiInput.value.trim()
  let parsed
  if (text.startsWith('[')) {
    parsed = JSON.parse(text)  // 数组直接解析
  } else {
    const m = text.match(/\{[\s\S]*\}/)  // 对象正则提取
    if (!m) throw new Error('未识别到JSON')
    parsed = JSON.parse(m[0])
  }
  // ... 录入数据
}
```

```html
<!-- UI模板 -->
<el-button @click="copyPrompt">复制提示词到剪贴板</el-button>
<el-input v-model="aiInput" type="textarea" placeholder="粘贴AI返回的JSON" />
<el-button type="success" @click="parseAiResult">解析导入</el-button>
```

### 关键细节
- **正则容错**：`/\{[\s\S]*\}/` 而非裸 `JSON.parse`，因为AI常在JSON外包裹说明文字
- **数组优先检测**：`startsWith('[')` 处理批量模式
- **模式切换自动重复制**：`@change="copyPrompt"` 在 radio-group 上
- **导入字段映射**：AI返回的字段名和内部字段名不同时，在 `submitAiImport` 里做转换
- **JSON导出含提示词**：`exportVersion: 2` 格式包含 `scoringPrompt`，导入时兼容 v1（无提示词）
