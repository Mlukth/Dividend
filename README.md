# 动态路由文件管理器 · 分组折叠与快捷操作

> 基于 Vue 3 + Vite + Element Plus 的前端视图文件管理工具。自动扫描 `views` 目录生成动态路由，支持相似名称自动分组、时间排序、拖拽移动文件、右键快捷操作（VS Code 打开、复制代码等），大幅提升多文件测试与管理的效率。

---

## ✨ 主要功能

- **动态路由**：自动扫描 `src/views/**/*.vue`，生成 `/auto/xxx` 路由，无需手动配置。
- **文件夹卡片导航**：顶部导航以卡片形式展示 `views` 下的文件夹结构，点击文件即可切换预览。
- **分组折叠视图**：每个文件夹内可按文件名相似度自动分组，组内文件支持按修改时间倒序排列。
- **拖拽整理**：支持文件在文件夹间、分组间拖拽移动，点击「锁定保存」后物理移动文件并刷新路由。
- **右键快捷菜单**：在 VS Code 中打开、复制相对路径、复制组件源码、复制路由链接。
- **手动重命名分组**：双击分组标题可自定义名称，并持久化到本地存储。
- **导航栏折叠**：分隔条中央设有折叠按钮，可快速收起/展开导航栏，拖拽可调整高度。

---

## 🚀 快速开始

### 环境要求
- Node.js >= 18
- 包管理器：npm / pnpm / yarn

### 安装与启动
```bash
# 安装依赖
npm install

# 启动开发服务器 (默认端口 5174)
npm run dev

# 构建生产版本
npm run build
```

访问 `http://localhost:5174` 即可使用。

---

## 📁 项目结构与核心文件说明

```
fusion-solar-demo/
├── public/                     # 静态资源
├── src/
│   ├── api/                    # 接口请求封装
│   │   └── file.js             # 移动文件 API (POST /api/move-files)
│   ├── assets/                 # 图片、字体等资源
│   ├── components/             # 公共组件
│   │   ├── AppHeader.vue       # 顶部标题栏（简单布局）
│   │   ├── AppSidebar.vue      # 侧边栏导航（备用，当前未使用）
│   │   ├── TopNav.vue          # 核心导航组件：文件树展示、分组、拖拽、右键菜单
│   │   ├── DashboardFilter.vue # 筛选卡片示例组件
│   │   ├── DashboardTable.vue  # 表格示例组件
│   │   └── Operation.vue       # 综合运维测试页面（含 ECharts 演示）
│   ├── router/
│   │   └── index.js            # 动态路由生成 + 手动路由定义，导出 fileTree 供导航使用
│   ├── utils/
│   │   ├── fileTree.js         # 根据 views 目录构建文件树（供 router 和导航使用）
│   │   └── groupFiles.js       # 相似名称分组算法、时间排序辅助函数
│   ├── views/                  # 所有 .vue 视图文件存放目录（动态路由自动扫描）
│   │   ├── 回收站/             # 测试组件、样式对比等
│   │   ├── 抽卡/               # 逆变器页面抽卡相关测试
│   │   ├── 组件测试/           # 各类组件预览、图表测试
│   │   └── ...                 # 其他业务页面
│   ├── App.vue                 # 根组件，包含导航栏折叠/拖拽逻辑
│   ├── main.js                 # 入口文件，注册 Element Plus 及全局图标
│   └── style.css               # 全局样式（部分未使用）
├── .gitignore
├── index.html
├── package.json
├── vite.config.js              # Vite 配置，自定义文件移动 API 和文件元数据接口
└── README.md
```

### 核心文件调用关系图

```
router/index.js
    ├── 调用 buildFileTree (utils/fileTree.js) 构建 fileTree
    └── 导出 fileTree 给 TopNav 使用

TopNav.vue (核心组件)
    ├── 接收 fileTree 初始数据
    ├── 调用 /api/file-stats 获取文件 mtime (vite.config.js 提供)
    ├── 调用 groupFiles.js 进行分组与排序
    ├── 拖拽保存时调用 api/file.js → /api/move-files (vite.config.js)
    └── 右键菜单调用 fetch 获取源码 /src/views/xxx.vue

App.vue
    └── 包含 TopNav 并管理其高度、折叠状态
```

### 各文件职责详解

| 文件路径 | 主要职责 | 依赖关系 |
|---------|---------|---------|
| `vite.config.js` | 开发服务器插件：提供 `/api/move-files`（移动文件）和 `/api/file-stats`（获取文件元数据） | 被 `api/file.js`、`TopNav.vue` 调用 |
| `src/router/index.js` | 动态生成 `autoRoutes`，定义 `fileTree`，导出路由实例 | 调用 `utils/fileTree.js`，被 `TopNav.vue` 导入 `fileTree` |
| `src/utils/fileTree.js` | 将 `import.meta.glob` 扫描结果构建为树形结构，供导航渲染 | 被 `router/index.js` 调用 |
| `src/utils/groupFiles.js` | 导出 `groupFilesBySimilarName`、`sortFilesByTime`、`sortFilesBySimilarity` | 被 `TopNav.vue` 用于分组和排序 |
| `src/api/file.js` | 封装 `moveFiles` 请求，调用后端移动文件接口 | 被 `TopNav.vue` 在锁定保存时调用 |
| `src/components/TopNav.vue` | **核心组件**：渲染文件夹卡片、分组视图、处理拖拽、右键菜单、重命名、本地配置存储 | 依赖 `vue-router`、`element-plus`、`lodash-es`、`groupFiles.js`、`api/file.js` |
| `src/App.vue` | 根布局：包含 `TopNav` 和可拖拽分隔条，管理导航栏高度与折叠 | 依赖 `element-plus` 图标 |
| `src/main.js` | 全局注册 Element Plus 组件和所有图标，挂载路由 | 无特殊依赖 |

---

## 🔧 关键技术点说明

### 1. 动态路由与文件树
- `router/index.js` 使用 `import.meta.glob('../views/**/*.vue')` 递归扫描所有 `.vue` 文件。
- 对中文路径进行 `encodeURIComponent` 处理，确保路由可访问。
- `fileTree.js` 将扫描结果按目录结构组织，每个文件节点包含 `routePath` 用于导航。

### 2. 文件元数据获取
- Vite 插件在开发服务器启动后挂载 `GET /api/file-stats` 接口。
- 前端在 `TopNav` 挂载时请求该接口，将 `mtime` 合并到文件节点，用于时间排序。

### 3. 相似名称分组算法
- 先将文件名按首字符语言类型分为「中文」和「非中文」两个池。
- 对每个池，计算两两文件名的**最长公共前缀**，长度 ≥ 2 则归为一组。
- 组名取组内所有文件的公共前缀，支持用户双击重命名并存入 `localStorage`。

### 4. 拖拽与锁定保存
- 使用 HTML5 原生拖拽 API。
- 分组视图下，通过 `handleGroupDrop` 单独处理分组内的放置，避免与文件夹级事件冲突。
- 保存时，目标文件夹路径为 `原文件夹路径/分组显示名`，后端 `fs.mkdirSync` 递归创建目录。

### 5. 右键菜单
- 通过 `Teleport` 将菜单渲染至 `body`，避免被父容器裁剪。
- 「在 VS Code 中打开」使用 `vscode://file/绝对路径` 协议（路径需在代码中硬编码调整）。
- 「复制组件代码」通过 `fetch` 读取开发服务器托管的源码文件。

---

## 📦 主要依赖

| 依赖 | 版本 | 用途 |
|------|------|------|
| vue | ^3.5.25 | 核心框架 |
| vue-router | ^4.6.4 | 路由管理 |
| element-plus | ^2.13.5 | UI 组件库 |
| @element-plus/icons-vue | ^2.3.2 | 图标库 |
| echarts | ^6.0.0 | 图表展示（`Operation.vue` 使用） |
| @vue-flow/core | ^1.48.2 | 流程图组件（部分测试页面使用） |
| lodash-es | ^4.18.1 | 工具函数（深拷贝等） |
| xlsx | ^0.18.5 | Excel 处理（预留） |
| vite | ^7.3.1 | 构建工具 |
| sass-embedded | ^1.98.0 | SCSS 支持 |

---

## 📝 使用提示

- **添加新测试页面**：直接在 `src/views` 下创建 `.vue` 文件，重启开发服务器即可自动出现在导航中。
- **调整项目根路径**：右键菜单「VS Code 打开」功能中硬编码了 `D:/photovoltaic/pv-station-admin`，若你的项目路径不同，请修改 `TopNav.vue` 中 `openInVSCode` 函数的 `absolutePath` 变量。
- **生产环境**：文件移动 API 和元数据接口仅存在于开发服务器，生产构建时不包含，建议仅在开发环境使用。

---

## 📄 许可证

内部工具，未指定开源许可证。