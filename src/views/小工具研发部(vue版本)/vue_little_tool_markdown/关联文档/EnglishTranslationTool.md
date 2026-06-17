# EnglishTranslationTool — 英语翻译练习工具

## 用途
考研英语一翻译练习+AI评分+水波训练+图片导入+短语默写工具。将范文转为翻译题，用户逐篇翻译后AI四维评分，支持水波式长难句训练、图片OCR导入、短语对默写（看中文写英文）。

## 核心功能

### 翻译练习
- 原文展示 → 用户输入译文（打字即自动计时）→ AI评分
- 可手动点"开始练习"/"结束练习"控制计时
- 划词模式：鼠标选中原文单词显示翻译
- 批注系统：canvas自由画笔，标注原文重点

### AI评分（API模式）
- DeepSeek API四维评分：准确性/语法结构/词汇表达/流畅度，各25分
- 返回字段：score/mistakeWave（水波纠错）/unknownItems（生词短语）/errorSpans（精确标红）
- 水波纠错：英文句式分析，含patternEN/同类例句/下次如何拆解
- 生词自动归入词汇池，带范围标签（四级/六级/考研/雅思/托福/超纲）

### 反转训练
- 英文原文 → AI 生成中文参考 → 用户根据中文翻译回英文 → AI 对比原文评分
- 支持 API 评分和窗口 AI 两种模式
- 原文练习期间自动隐藏（避免泄题）
- 译文对照：用户英文 vs 原文英文逐句对比，差异标红

### 词根词缀分析
- 点击原文或水波训练中的任意英文单词 → AI 拆解词根/词缀
- 三步交互：拆解展示（含可靠性标记 ✓常见/△不常见/✗误导）→ 用户推理 → 答案揭晓
- 答案含推理链（词根→词义的推导过程）
- 可一键加入生词池
- 结果缓存到本地 JSON 文件，同一单词不重复调 API
- 解析失败时显示 AI 原始输出作为兜底

### 水波训练（独立模式）
- 输入读不懂的英文长难句 → AI逻辑切分 → 逐片段白话解释
- 点击卡住的片段 → AI深入解答（这个结构在做什么/类比简单句/下次怎么办）
- 生成"今日水波"总结（核心卡点/扩散认知/下次如何）
- 分析结果缓存 JSON 文件，避免重复API调用

### 窗口AI模式
- 一键复制评分提示词 → 粘贴到任意AI窗口 → 贴回JSON → 解析评分
- 复制后粘贴区保持显示，计时器冻结，贴回JSON时记录实际耗时
- 和API模式共用同一套评分逻辑和数据结构

### 短语默写·中留英填
- 图片导入 → 反转短语模式 → AI 提取短语对 `[{en, zh}]` → 存入卡片组
- 短语默写弹窗：左侧卡片组列表，右侧练习区
- 练习：显示中文提示 → 用户默写英文 → 查看答案对照原文 → 自评正确/需复习
- 支持筛选"只看需复习"，翻卡导航
- 练习进度持久化（每张卡片 correct/review 状态）
- 支持删除卡片组（hover 显示 × 按钮）

### 图片导入翻译题
- 三种提取模式：教辅·一字不易 / 参考·灵活提取 / 反转短语·中留英填
- 两种导入方式：单题多图（多张截图→一篇题）、批处理（每张图→一篇题）
- 多图自动合成一张PNG，一键复制图片+提示词到AI窗口
- AI自动识别截图来源（sourceNote），导入时存入范文记录
- 后续评分时自动附带教辅资料来源，AI评分更有上下文
- **教辅关键字串流**：图片导入时 AI 返回的 `raw_text_archive`（截图全文存档）和每段的 `raw_teaching_note`（教辅详解）会被保存到 essay 对象中。评分时 `buildScoringPrompt()` 自动将这些教辅内容追加到提示词的【教辅详解存档】和【逐句教辅解析】块中，AI 评分时可参考教辅原版分析。

### 词汇池
- 评分后自动积累生词短语，按类别分组（法律/经济/科技/抽象/固定搭配等）
- 每个词显示范围标签（四级/六级/考研/雅思/托福/超纲）和出现次数

### 范文库管理
- 内置考研英语一真题范文
- 支持手动添加/AI自动分段/图片导入
- 拖拽排序（自定义顺序持久化）
- 删除按钮、最后活动时间追踪（类似Windows文件管理器）
- 日历打卡：每日完成标记，色标显示分数

### 历史面板
- 每篇文章的评分历史记录，含译文/分数/反馈/标注
- 统计面板：连续打卡天数/练习篇数/平均分/今日耗时/累计用时
- 打字即自动开始计时，无需手动点击"开始练习"
- ECharts趋势折线图+四维雷达图

### 译文对照
- 用户译文 vs 参考译文逐句对齐
- AI返回errorSpans精确标红有误字词片段（非整句标红）
- 参考译文独立编号分段展示

### 提示词系统（重要）

### 持久化方式
提示词不再仅存 localStorage，改为 **JSON 文件双向同步**：

| 存储层 | 位置 | 用途 |
|--------|------|------|
| **主存储** | `public/ett-prompts.json` | 评分/分段/水波/图片导入x2 共五个系统提示词，点击"保存"写入 |
| **API** | `GET/POST /api/ett-prompts` | vite.config.js 中间件，读写 JSON 文件 |
| **兜底** | 代码中 `SCORING_SYSTEM_PROMPT` 等常量 | JSON 文件不可用时 fallback |

**数据流**：页面加载 → `GET /api/ett-prompts` → 填充 `promptConfig` → 缺 key 则自动补默认值并回写文件 → 用户编辑 → 点击"保存" → `POST /api/ett-prompts` → 写入 JSON 文件

修改提示词只需在 UI 的"评分提示词配置"对话框编辑后点保存即可，无需改代码。

**自动初始化**：JSON 文件缺少任何系统提示词 key 时，`loadPromptConfig` 会用代码常量填充默认值并自动写回文件，确保文件始终包含全部六个 key。

### 六个系统提示词
- **评分提示词** (`scoringPrompt`)：API评分和窗口AI模式共用
- **分段提示词** (`segmentPrompt`)：添加范文时 AI 自动分段出题
- **水波训练提示词** (`wavePrompt`)：逻辑切分、卡点解答、水波总结共用

### 图片导入提示词（就近编辑 + JSON 持久化）
三个图片导入提示词在图片导入对话框内编辑（就近原则），但持久化到 `ett-prompts.json`：
- `imageStrictPrompt` — 教辅·一字不易模式
- `imageRefPrompt` — 参考·灵活提取模式
- `imagePhrasePrompt` — 反转短语·中留英填模式（提取 en/zh 短语对，zh 必须是可直接默写的自然中文提示）

切换模式时自动从 `promptConfig` 加载，点击"保存提示词"按钮写入 JSON 文件。刷新页面或关对话框不丢失。

### 自定义提示词模板
存 `public/ett-custom-prompts.json`（API读写），多组增删改。

## 技术
- Vue 3 Composition API + Element Plus + ECharts
- DeepSeek API (deepseek-chat)，API Key存localStorage
- Canvas批注系统 + 图片合成
- HTML5 Drag & Drop（范文拖拽排序）
- Clipboard API（图片+文本一并复制）
- **全量 JSON 文件存储**：所有数据通过 vite.config.js 中间件读写 JSON 文件（见下方存储表）
- **教辅关键字串流**：图片导入→存储 `rawTextArchive`/`rawTeachingNote`→评分时注入提示词

## 数据存储（全部 JSON 文件化）

| 文件 | API 端点 | 内容 |
|------|----------|------|
| `public/ett-data.json` | `GET/POST /api/ett-data` | essays + records + essayOrder + annotations + tokenUsage + phraseCards — 主数据库 |
| `public/ett-prompts.json` | `GET/POST /api/ett-prompts` | scoringPrompt + segmentPrompt + wavePrompt + imageStrictPrompt + imageRefPrompt |
| `public/ett-custom-prompts.json` | `GET/POST /api/ett-custom-prompts` | 自定义提示词模板数组 |
| `public/ett-wave-cache.json` | `GET/POST /api/ett-wave-cache` | 水波分析结果缓存 |
| `public/ett-word-roots.json` | `GET/POST /api/ett-word-roots` | 词根词缀分析结果缓存 |

| ~~旧 localStorage key~~ | 状态 |
|------|------|
| ~~`ett_data`~~ | 已迁移到 `ett-data.json` |
| ~~`ett_prompt_config`~~ | 已迁移到 `ett-prompts.json` |
| ~~`ett_custom_prompts`~~ | 已迁移到 `ett-custom-prompts.json` |
| ~~`ett_wave_cache`~~ | 已迁移到 `ett-wave-cache.json` |
| ~~`ett_token_usage`~~ | 合并入 `ett-data.json` |
| ~~`ett_essay_order`~~ | 合并入 `ett-data.json` |
| ~~`ett_annotations`~~ | 合并入 `ett-data.json` |
| `ett_apikey` | **保留 localStorage**（敏感信息，不存文件） |

**读写机制**：修改后 800ms 防抖自动 `syncData()` → POST 到 `/api/ett-data`。旧数据首次加载时自动迁移。

### 短语卡片同步（读-合并-写）

三个函数分工：

| 函数 | 触发时机 | 行为 |
|------|----------|------|
| `syncData()` | watcher 监听数据变化，800ms 防抖 | GET 服务器 → 合并 phraseCards → POST 全量写入 |
| `flushSave()` | 导入卡片、同步按钮、页面加载 | 同 syncData 但立即执行，不走防抖 |
| `syncFromServer()` | 手动点击"同步"按钮 | GET 服务器 → 合并 phraseCards → flushSave 写回 |

**合并策略（syncData / flushSave / syncFromServer 共用）**：
1. 写入前先 GET 服务器当前数据
2. 服务器有、本地没有的卡片 → 补入本地（另一设备导入的）
3. 两边都有的卡片 → practiceState 按 key 合并：服务器有进度的保留，本地有新进度的覆盖（`pending` 优先级最低）
4. 合并后再 POST 写回服务器

**页面加载自动同步**：`onMounted` 在 `loadData()` 后自动 GET `/api/ett-data`，拉取 phraseCards 并 `flushSave()`。防止本地 localStorage 空/旧数据在首次 `syncData` 触发时覆盖服务器。

**为什么必须读-合并-写**：如果直接 POST 本地数据，另一设备刚写入的 phraseCards 会被覆盖丢失。典型场景：手机导入短语卡 → 电脑打开页面 → 电脑 watcher 触发 syncData → 电脑本地无短语卡 → 覆盖服务器 → 手机刷新后卡片消失。

### 数据流全貌

```
设备A 修改 → syncData(800ms) → GET 服务器 → 合并 → POST
设备B 加载 → loadData(localStorage) → GET 服务器合并 → 页面就绪
设备B 手动  → 点击"同步" → syncFromServer → GET → 合并 → flushSave
```

| essay.rawTextArchive | 图片导入时截图全文存档（评分时注入提示词） |
| essay.segments[].rawTeachingNote | 每句教辅详解原文（评分时注入提示词） |

## 路由
- 自动路由：`/auto/小工具研发部(vue版本)/EnglishTranslationTool.vue`

## 双端同步 + 手机适配
- Vite dev server 绑定 `0.0.0.0:5174`，手机连电脑热点后访问 `http://192.168.137.1:5174`
- **自动同步**：每次数据修改 800ms 后自动 POST 到 `/api/ett-data`，写入前先 GET 合并（防覆盖）
- **页面加载同步**：打开页面时自动从服务器拉取 phraseCards，无需手动操作
- **手动同步**：Header "同步"按钮 → `syncFromServer()` → 拉取全量数据合并
- 手机端（≤768px）自动切换竖向布局：范文列表在上 → 原文+输入在中 → 评分面板在底
- 原文段落竖排（编号/英文/考点上下堆叠），英文全宽不被考点挤压
- 手机端自动隐藏 API Key 输入框和 Token 用量
- 手机端右侧评分面板无内容时自动隐藏

## ⚠️ 已知问题：全局暗色样式污染整站

**确认时间**：2026-06-13

**问题文件**：`EnglishTranslationTool_v2_rebuild.vue`（约3965行版本）

**根因**：
1. `darkMode` 默认 `true`，组件挂载时立即执行 `document.documentElement.classList.add('ett-dark')`（第3261-3263行 watcher）
2. 文件底部存在一个**不带 `scoped` 的全局 `<style>` 块**（约第3931行起），用 `html.ett-dark` 前缀选择器覆盖 Element Plus 组件：
   - `html.ett-dark .el-tag` → 暗色低饱和度标签（`bg:#1a1a1a, color:#999`）
   - `html.ett-dark .el-dialog` / `.el-drawer` → 暗色弹窗抽屉
   - `html.ett-dark .el-input__wrapper` / `.el-textarea__inner` → 暗色输入框
   - `html.ett-dark .el-select-dropdown` → 暗色下拉菜单
3. `ett-dark` class 切路由后**不会自动清除**，持续污染其他页面

**症状**：
- 同站其他小工具的 el-tag 全部变暗色低饱和度
- 所有弹窗/抽屉/输入框被强制套用暗色主题
- 表现为"串层"——但实际不是 `EnglishTranslationTool-mobile`（独立项目，端口5175）远程污染，而是本文件同源 fork 的全局样式在站内从 `<html>` 级别覆盖了整站

**修复思路**（待执行）：
1. `onUnmounted` 钩子退出时移除 `ett-dark` class
2. 或将全局样式收窄为路由限定选择器：`html.ett-dark body[data-route="ett"] .el-*`
3. 或放弃覆盖 teleport 弹窗，暗色限定在组件根节点内

## 模型限制
- AI评分精度依赖DeepSeek API能力
- 图片导入OCR质量取决于截图清晰度和AI视觉模型精度
- 教辅·一字不易模式虽强调逐字照抄，仍需肉眼校对AI OCR结果
