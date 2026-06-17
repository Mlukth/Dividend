# C盘保护规则

C盘仅剩约3GB（200GB总量），空间极度紧张。

## 文件写入规则
- **所有新建文件必须写到 D 盘**
- 脚本 → `D:\scripts\`
- 文档/设计稿 → `D:\docs\`
- 临时文件 → `D:\temp\`
- Vue 组件/测试文件 → `D:\photovoltaic\pv-station-admin\src\views\组件测试\`
- **禁止往 `C:\Users\16707\` 下写任何新文件**
- **禁止往 `C:\Users\16707\Desktop\` 写文件**（桌面上已有的两份设计文档是历史遗留，用户自行处理）

## 邮件通知
- 发信: `python3 D:/scripts/sendmail.py --confirm "主题" "正文"`
- 查回复: `node D:/scripts/checkmail.mjs --id <confirm_id> --watch`
- 用户邮箱: 1670711589@qq.com

## 项目结构
- 主项目: `D:\photovoltaic\fronted\fusion-solar-demo\`
- 子项目(测试): `D:\photovoltaic\pv-station-admin\`
- 组件测试目录: `D:\photovoltaic\pv-station-admin\src\views\组件测试\`

## 会话启动检查清单
每次新会话开始自动执行：
1. **扫邮件任务**: `node D:/scripts/checkmail.mjs --tasks` 检查是否有新 [Claude-Task]
2. **读任务卡片**: 查看 `public/task-sync.json` 了解当前进度
3. **更新任务卡**: 完成事项及时更新 task-sync.json 决策树进度

## 工具文件夹规则
- `src/views/小工具研发部(vue版本)/` 有独立文档系统
- 关联文档在 `vue_little_tool_markdown/关联文档/`，修改组件后必须同步更新
- 需求文档在 `vue_little_tool_markdown/需求文档/`，用户自己维护，我不动

---

# 🌊 算法水波渐进分析工具 (AlgorithmWaveTool)

## 原始需求（用户逐字，2026-06-11）
> 把英语翻译的水波渐进推理模式迁移到算法学习。截图→水波分层分析→关键帧动画→引导式理解→递归式写代码→回声验证，帮基础不佳的初学者完整理解算法。

参考工具：`EnglishTranslationTool_v2_rebuild.vue` 的水波训练模式（grammarTree→logicSplit→stuckPoint→resolveTip→analogy）

## 文件
- **主文件**：`src/views/小工具研发部(vue版本)/AlgorithmWaveTool.vue`
- **备份**：`src/views/小工具研发部(vue版本)/_备份/AlgorithmWaveTool_2026-06-12_窗口AI-基础管道.vue`
- **URL**：`/auto/小工具研发部(vue版本)/AlgorithmWaveTool`（端口5174）

## 水波五层映射
| Layer | 字段 | 含义 |
|-------|------|------|
| 0 | opCore | 算法一句话本质（<50字白话） |
| 1 | stepFrames | 关键步骤：输入状态→操作→输出状态 |
| 2 | stuckWhy | 卡点白话诊断（禁用递归/指针等术语） |
| 3 | bypassHow | 突破策略（具体操作步骤） |
| 4 | lifeAnalogy | 生活类比 |

## 管道流程
```
输入代码/截图 → [1]复制水波提示词→AI→贴回→5层展开
                      → [2](可选)Canvas帧→AI→贴回→渲染
                      → [3]写伪代码→复制验证→AI→贴回
                      → [4]如有偏差→深入引导→AI→贴回→修改→[5]重验（循环）
```

## 关键设计决策
- **窗口AI模式**：拼接提示词→复制→贴任意AI→贴回JSON→解析（不用API key）
- **截图模式**：ClipboardItem双通道，文本+图片一起复制（需多模态AI）
- **Canvas**：LLM生成绘制指令JSON，前端渲染rect/text/arrow/circle四种图元，可翻帧+自动播放
- **拒绝Manim**：太重、MP4不可交互、LLM生成成功率仅25%
- **伪代码验证**：只看逻辑对错，语法风格不扣分。isCorrect:true只要核心逻辑对
- **迭代引导**：验证完不能"平分走人"，有偏差就深入引导→修改→重验→循环
- **持久化**：localStorage自动保存（500ms防抖），切页不丢
- **首批语言**：Python + C

## 全部提示词（5个，代码中）
1. WAVE_SYSTEM_PROMPT — 水波五层分析（JSON输出）
2. CANVAS_SYSTEM_PROMPT — Canvas关键帧生成（JSON输出）
3. VERIFY_SYSTEM_PROMPT — 伪代码验证（JSON输出）
4. DEEP_GUIDANCE_PROMPT — 深入引导（中文讲解，非JSON）
5. REVERIFY_PROMPT — 重新验证（JSON输出，含progress字段）

## 当前状态
- ✅ 所有管道节点和引导循环已通
- ⏳ 未用真实算法代码实测，提示词效果待验证
- ⏳ 截图模式需多模态AI（Claude/GPT-4V），DeepSeek不行

## 待确认问题（下次会话可能讨论）
1. Canvas帧是否需要"猜下一步"交互？是否允许拖拽模拟算法操作？
2. 伪代码验证是否需要分难度等级（基础→进阶）？
3. 伪代码之后是否引导写真正的Python/C代码？
4. 跨算法对比（如快排vs归并排序都是分治）是否需要？
5. 算法库什么时候开始做？
6. "今日算法总结"用户已拒绝，但跨算法薄弱点追踪是否需要？
