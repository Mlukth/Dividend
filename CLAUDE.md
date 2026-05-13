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
