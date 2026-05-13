# EnglishTranslationTool — 英语翻译练习工具

## 用途
考研英语一翻译练习+AI评分工具。将范文转为翻译题，用户逐篇翻译后DeepSeek API四维评分。

## 功能
- **范文库**：内置30篇考研英语一真题范文，支持AI自动分段添加新范文
- **翻译练习**：原文展示→用户输入译文→计时器
- **AI评分**：DeepSeek API四维评分（准确性/语法结构/词汇表达/流畅度，各25分）
- **对照高亮**：用户译文 vs 参考译文逐句对齐diff
- **日历打卡**：el-calendar每日完成标记，色标显示分数
- **统计图表**：ECharts趋势折线图+四维雷达图
- **数据管理**：JSON导入导出，localStorage持久化

## 技术
- Vue 3 Composition API + Element Plus + ECharts
- DeepSeek API (deepseek-chat)，API Key存localStorage
- 纯客户端，无需后端

## 数据存储
- localStorage key: `ett_data`（题库+记录+设置）
- localStorage key: `ett_apikey`（API Key）

## 路由
- 自动路由：`/auto/小工具研发部(vue版本)/EnglishTranslationTool.vue`
