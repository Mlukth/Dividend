```javascript
/**
 * Element Plus 图标搜索关键词对照表
 * 用于根据 emoji 含义搜索对应的图标组件名
 * 
 * 使用方法：
 * 1. 打开 https://element-plus.org/zh-CN/component/icon.html
 * 2. 使用 Ctrl+F 搜索下方关键词
 * 3. 找到喜欢的图标后点击复制组件名
 */

// ============================================
// 一级导航图标
// ============================================

export const navIcons = {
  // 📊 电站概览
  dashboard: {
    emoji: '📊',
    keywords: ['chart', 'dashboard', 'statistics', 'data', 'graph', 'monitor', 'odometer', 'trend', 'pie', 'bar', 'line'],
    recommended: ['Odometer', 'DataAnalysis', 'TrendCharts', 'Monitor']
  },

  // 🏠 电站信息
  stationInfo: {
    emoji: '🏠',
    keywords: ['home', 'house', 'building', 'office', 'location', 'map', 'station', 'solar', 'sun'],
    recommended: ['House', 'HomeFilled', 'OfficeBuilding', 'Sunny']
  },

  // 🔧 运维管理
  operation: {
    emoji: '🔧',
    keywords: ['tool', 'wrench', 'setting', 'config', 'maintenance', 'repair', 'operation', 'manage', 'fix'],
    recommended: ['Tools', 'ToolsFilled', 'Wrench', 'Setting', 'Operation', 'Management']
  },

  // 🤖 AI 助手
  aiAssistant: {
    emoji: '🤖',
    keywords: ['cpu', 'chip', 'ai', 'smart', 'brain', 'robot', 'assistant', 'magic', 'connect', 'chat', 'idea', 'lightbulb'],
    recommended: ['Cpu', 'ChatDotRound', 'MagicStick', 'Guide', 'Connection', 'Aim']
  },

  // 💰 经营管理
  business: {
    emoji: '💰',
    keywords: ['money', 'coin', 'wallet', 'finance', 'payment', 'cost', 'dollar', 'cash', 'RMB', 'yuan', 'bill'],
    recommended: ['Money', 'Coin', 'Wallet', 'Tickets', 'Finance']
  }
}

// ============================================
// 二级菜单图标
// ============================================

export const subMenuIcons = {
  // 发电/健康
  power: {
    emoji: '⚡',
    keywords: ['lightning', 'bolt', 'power', 'electric', 'energy', 'wind', 'sunny', 'solar', 'sun'],
    recommended: ['Lightning', 'Sunny', 'WindPower', 'Connection']
  },

  // 预警/告警
  warning: {
    emoji: '⚠️',
    keywords: ['warning', 'alert', 'danger', 'error', 'fail', 'stop', 'bell', 'notification', 'caution'],
    recommended: ['Warning', 'WarningFilled', 'Bell', 'BellFilled', 'CircleClose']
  },

  // 成功/完成
  success: {
    emoji: '✅',
    keywords: ['check', 'success', 'complete', 'finish', 'tick', 'done', 'ok', 'pass', 'yes'],
    recommended: ['CircleCheck', 'Check', 'SuccessFilled', 'CircleCheckFilled']
  },

  // 文档/合同
  document: {
    emoji: '📄',
    keywords: ['document', 'file', 'paper', 'list', 'ticket', 'form', 'report', 'contract', 'agreement'],
    recommended: ['Document', 'Tickets', 'Reading', 'FileDocument']
  },

  // 文件夹/归档
  folder: {
    emoji: '📁',
    keywords: ['folder', 'directory', 'file', 'archive', 'group', 'box', 'basket', 'collection'],
    recommended: ['Folder', 'FolderOpened', 'Files', 'Box']
  },

  // 箭头/导航
  arrow: {
    emoji: '➡️',
    keywords: ['arrow', 'right', 'down', 'chevron', 'caret', 'next', 'forward', 'back', 'left', 'up'],
    recommended: ['ArrowRight', 'ArrowDown', 'DArrowRight', 'CaretRight', 'CaretBottom']
  },

  // 搜索/查找
  search: {
    emoji: '🔍',
    keywords: ['search', 'find', 'magnify', 'query', 'look', 'eye', 'inspect', 'glass'],
    recommended: ['Search', 'View', 'ZoomIn', 'Filter']
  },

  // 编辑/修改
  edit: {
    emoji: '✏️',
    keywords: ['edit', 'pen', 'pencil', 'write', 'modify', 'change', 'alter', 'update'],
    recommended: ['Edit', 'EditPen', 'Document']
  },

  // 删除/移除
  delete: {
    emoji: '🗑️',
    keywords: ['delete', 'remove', 'trash', 'dustbin', 'clear', 'cancel', 'close', 'minus'],
    recommended: ['Delete', 'Close', 'Minus', 'CircleClose']
  },

  // 日期/时间
  date: {
    emoji: '📅',
    keywords: ['calendar', 'date', 'schedule', 'clock', 'time', 'timer', 'watch', 'event'],
    recommended: ['Calendar', 'Clock', 'Timer', 'Stopwatch']
  },

  // 设置/配置
  setting: {
    emoji: '⚙️',
    keywords: ['setting', 'gear', 'config', 'adjust', 'wheel', 'cog', 'setup', 'tool'],
    recommended: ['Setting', 'SetUp', 'Tools', 'Operation']
  },

  // 用户/人员
  user: {
    emoji: '👤',
    keywords: ['user', 'people', 'person', 'account', 'avatar', 'profile', 'member'],
    recommended: ['User', 'UserFilled', 'Avatar']
  },

  // 锁/安全
  lock: {
    emoji: '🔒',
    keywords: ['lock', 'security', 'key', 'password', 'access', 'permission', 'auth', 'safe', 'shield'],
    recommended: ['Lock', 'Key', 'Unlock', 'Shield']
  },

  // 上传/下载
  upload: {
    emoji: '📤',
    keywords: ['upload', 'export', 'share', 'send', 'out', 'arrow up', 'top'],
    recommended: ['Upload', 'UploadFilled', 'Top']
  },

  download: {
    emoji: '📥',
    keywords: ['download', 'import', 'in', 'arrow down', 'receive', 'bottom', 'save'],
    recommended: ['Download', 'Bottom']
  },

  // 刷新/更新
  refresh: {
    emoji: '🔄',
    keywords: ['refresh', 'reload', 'update', 'sync', 'rotate', 'loop', 'renew'],
    recommended: ['Refresh', 'RefreshRight', 'RefreshLeft']
  },

  // 消息/通知
  message: {
    emoji: '💬',
    keywords: ['message', 'chat', 'comment', 'speech', 'bubble', 'notification', 'bell'],
    recommended: ['Message', 'MessageFilled', 'ChatDotRound', 'BellFilled']
  },

  // 电气/接线
  electric: {
    emoji: '🔌',
    keywords: ['plug', 'connection', 'link', 'wire', 'electric', 'socket', 'usb', 'connector'],
    recommended: ['Connection', 'Link', 'Cpu', 'Switch']
  },

  // 表格/列表
  table: {
    emoji: '📋',
    keywords: ['table', 'list', 'grid', 'matrix', 'sheet', 'excel', 'rows'],
    recommended: ['List', 'Grid', 'Tickets', 'Menu']
  },

  // 图表/趋势
  chart: {
    emoji: '📈',
    keywords: ['chart', 'trend', 'line', 'bar', 'pie', 'histogram', 'graph', 'analysis'],
    recommended: ['TrendCharts', 'DataAnalysis', 'PieChart', 'Histogram']
  },

  // 筛选/过滤
  filter: {
    emoji: '🔲',
    keywords: ['filter', 'funnel', 'sieve', 'sort', 'arrange', 'classify'],
    recommended: ['Filter', 'Sort', 'Operation']
  }
}

// ============================================
// 快捷导出所有关键词（用于搜索）
// ============================================

export const allKeywords = [
  // 常用词
  'chart', 'dashboard', 'data', 'graph', 'monitor', 'home', 'house', 'building',
  'tool', 'wrench', 'setting', 'cpu', 'chip', 'ai', 'smart', 'money', 'coin',
  'wallet', 'finance', 'document', 'file', 'folder', 'list', 'search', 'edit',
  'delete', 'warning', 'check', 'arrow', 'user', 'key', 'lock', 'calendar',
  'clock', 'timer', 'bell', 'message', 'refresh', 'upload', 'download',
  
  // 细分词
  'chart', 'trend', 'pie', 'bar', 'line', 'histogram', 'statistics', 'analysis',
  'office', 'location', 'map', 'station', 'solar', 'sun', 'wind', 'power',
  'lightning', 'electric', 'energy', 'bolt', 'maintenance', 'repair', 'manage',
  'operation', 'magic', 'stick', 'brain', 'robot', 'assistant', 'chat',
  'payment', 'cost', 'dollar', 'cash', 'ticket', 'contract', 'paper',
  'ticket', 'report', 'form', 'archive', 'box', 'collection', 'chevron',
  'caret', 'next', 'forward', 'magnify', 'glass', 'eye', 'inspect', 'pen',
  'pencil', 'write', 'modify', 'change', 'trash', 'dustbin', 'clear',
  'schedule', 'event', 'watch', 'stopwatch', 'gear', 'wheel', 'cog', 'config',
  'adjust', 'setup', 'people', 'person', 'account', 'avatar', 'profile',
  'member', 'security', 'password', 'access', 'permission', 'auth', 'safe',
  'shield', 'export', 'share', 'send', 'import', 'receive', 'sync', 'loop',
  'reload', 'update', 'renew', 'rotate', 'comment', 'speech', 'bubble',
  'notification', 'plug', 'wire', 'socket', 'usb', 'connector', 'link',
  'table', 'grid', 'matrix', 'sheet', 'excel', 'rows', 'filter', 'funnel',
  'sieve', 'sort', 'arrange', 'classify', 'caution', 'danger', 'error',
  'fail', 'stop', 'pass', 'yes', 'ok', 'done', 'complete', 'finish', 'tick'
]

// ============================================
// 完整组件名列表（供参考）
// ============================================

export const recommendedIconNames = [
  // 一级导航
  'Odometer', 'DataAnalysis', 'TrendCharts', 'Monitor',
  'House', 'HomeFilled', 'OfficeBuilding', 'Sunny',
  'Tools', 'ToolsFilled', 'Wrench', 'Setting', 'Operation', 'Management',
  'Cpu', 'ChatDotRound', 'MagicStick', 'Guide', 'Connection', 'Aim',
  'Money', 'Coin', 'Wallet', 'Tickets', 'Finance',
  
  // 状态图标
  'Warning', 'WarningFilled', 'CircleCheck', 'CircleClose', 'Check',
  'SuccessFilled', 'CircleCheckFilled', 'InfoFilled',
  'Bell', 'BellFilled', 'Message', 'MessageFilled',
  
  // 文件文档
  'Document', 'FileDocument', 'Tickets', 'List', 'Files',
  'Folder', 'FolderOpened', 'Reading', 'Box',
  
  // 箭头导航
  'ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown',
  'DArrowRight', 'DArrowLeft',
  'CaretRight', 'CaretLeft', 'CaretTop', 'CaretBottom',
  'More', 'MoreFilled', 'Back', 'Right', 'Top', 'Bottom',
  
  // 操作图标
  'Search', 'View', 'ZoomIn', 'ZoomOut', 'Filter',
  'Edit', 'EditPen', 'Delete', 'Close', 'Plus', 'Minus',
  'Refresh', 'RefreshLeft', 'RefreshRight',
  'Upload', 'UploadFilled', 'Download', 'Share', 'Link',
  
  // 导航系统
  'Menu', 'SetUp', 'Compass', 'Key', 'Lock', 'Unlock',
  'User', 'UserFilled', 'Avatar',
  
  // 时间天气
  'Timer', 'Clock', 'Calendar', 'Stopwatch',
  'Sunny', 'Moon', 'Lightning', 'Sunrise', 'Sunset',
  'Cloudy', 'Pouring', 'WindPower',
  
  // 图表
  'PieChart', 'Histogram', 'DataLine', 'Grid', 'TrendCharts',
  
  // 其他实用
  'Aim', 'Guide', 'Promotion', 'Present', 'Goblet', 'Trophy',
  'Medal', 'Star', 'StarFilled', 'Collection', 'Stamp'
]
```