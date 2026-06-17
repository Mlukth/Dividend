<template>
  <div class="preview-page">
    <h2 class="page-title">👤 我的 — 手机端布局方案对比</h2>
    <p class="page-desc">
      6.67英寸手机（375dp），深色主题。<br>
      聚合：<b>统计数据</b> / 生词池 / 短语默写 / 历史记录 / 提示词 / 设置。
    </p>

    <div class="schemes-row">
      <!-- 方案A：卡片列表 -->
      <div class="scheme-column">
        <div class="scheme-label">
          <span class="badge scheme1">方案 A</span>
          <strong>卡片列表</strong>
        </div>
        <div class="mock-phone">
          <div class="phone-screen" style="background:#1a1a2e">
            <div class="ph-topbar">
              <span style="font-size:14px;font-weight:700;color:#fff">我的</span>
              <span style="font-size:10px;color:#888">考研英语一</span>
            </div>
            <!-- 打卡统计卡片 -->
            <div class="ph-stats-hero">
              <div class="ph-stat-big">
                <span class="ph-stat-num">32</span>
                <span class="ph-stat-label">连续打卡</span>
              </div>
              <div class="ph-stat-divider"></div>
              <div class="ph-stat-big">
                <span class="ph-stat-num">26</span>
                <span class="ph-stat-label">累计篇数</span>
              </div>
              <div class="ph-stat-divider"></div>
              <div class="ph-stat-big">
                <span class="ph-stat-num">82</span>
                <span class="ph-stat-label">平均分</span>
              </div>
              <div class="ph-stat-divider"></div>
              <div class="ph-stat-big">
                <span class="ph-stat-num">3.2h</span>
                <span class="ph-stat-label">总耗时</span>
              </div>
            </div>
            <!-- 功能宫格入口（3列） -->
            <div class="ph-mine-grid">
              <div class="ph-mine-grid-item" v-for="item in menuItems" :key="item.label">
                <span class="ph-mine-grid-icon">{{ item.icon }}</span>
                <span class="ph-mine-grid-label">{{ item.label }}</span>
              </div>
            </div>
            <!-- 底部设置 -->
            <div class="ph-settings-row">
              <div class="ph-setting-item">
                <span>🌙 深色模式</span>
                <span class="ph-toggle on"></span>
              </div>
              <div class="ph-setting-item">
                <span>🔑 API Key</span>
                <span style="font-size:10px;color:#888">sk-xxx...a1b2</span>
              </div>
            </div>
          </div>
        </div>
        <ul class="scheme-notes">
          <li>顶部四格统计卡片，一目了然</li>
          <li>功能入口为 3列圆角正方形宫格，图标+名称</li>
          <li>底部常驻深色模式开关 + API Key 状态</li>
          <li>一屏可见全部功能，简洁直观</li>
        </ul>
      </div>

      <!-- 方案B：宫格 + 列表混合 -->
      <div class="scheme-column">
        <div class="scheme-label">
          <span class="badge scheme2">方案 B</span>
          <strong>宫格入口 + 统计条</strong>
        </div>
        <div class="mock-phone">
          <div class="phone-screen" style="background:#1a1a2e">
            <div class="ph-topbar">
              <span style="font-size:14px;font-weight:700;color:#fff">我的</span>
              <span style="font-size:10px;color:#409eff;cursor:pointer">⚙ 设置</span>
            </div>
            <!-- 统计条 -->
            <div class="ph-stats-bar-b">
              <div class="ph-stat-item"><b>32</b>天连续</div>
              <div class="ph-stat-item"><b>26</b>篇已练</div>
              <div class="ph-stat-item"><b>82</b>均分</div>
              <div class="ph-stat-item"><b>3.2h</b>总时</div>
            </div>
            <!-- 宫格入口 -->
            <div class="ph-grid-b">
              <div class="ph-grid-item" v-for="item in gridItems" :key="item.label">
                <span class="ph-grid-icon">{{ item.icon }}</span>
                <span class="ph-grid-label">{{ item.label }}</span>
                <span class="ph-grid-badge" v-if="item.badge">{{ item.badge }}</span>
              </div>
            </div>
            <!-- 快捷操作 -->
            <div class="ph-quick-actions">
              <div class="ph-quick-btn" style="background:#409eff">🔄 同步数据</div>
              <div class="ph-quick-btn" style="background:#2d2d3f">📤 导出数据</div>
            </div>
          </div>
        </div>
        <ul class="scheme-notes">
          <li>统计用紧凑横条，风格统一</li>
          <li>功能入口采用宫格（3列），带角标</li>
          <li>快捷操作按钮在底部</li>
          <li>设置齿轮在顶栏右侧</li>
          <li>视觉更活泼，适合功能较多的场景</li>
        </ul>
      </div>
    </div>

    <div class="interaction-tip">
      <h3>💡 选择建议</h3>
      <p>
        · <strong>方案A</strong>：卡片列表，信息层级清晰，每项有描述文字，适合功能名需要解释的场景。<br>
        · <strong>方案B</strong>：宫格入口更紧凑，一屏能看全部功能，适合功能多但名称简短的场景。<br>
        两个方案都包含：统计面板 + 功能入口 + 深色模式/API Key + 同步导出。
      </p>
    </div>
  </div>
</template>

<script setup>
const menuItems = [
  { icon: '📖', label: '生词短语池', desc: '82个词汇 · 涵盖考研/六级/四级' },
  { icon: '✍️', label: '短语默写', desc: '6组卡片 · 最近正确率78%' },
  { icon: '🕐', label: '练习历史', desc: '26篇范文 · 共148次练习' },
  { icon: '⚡', label: '提示词配置', desc: '评分/分段/图片/水波 提示词' },
  { icon: '📷', label: '图片导入管理', desc: '拍照/截图导入翻译题目' },
  { icon: '🧩', label: '词根词缀分析', desc: '查词分解 · 词源推理' },
]

const gridItems = [
  { icon: '📚', label: '生词池', badge: '82' },
  { icon: '📝', label: '短语默写', badge: '6组' },
  { icon: '📋', label: '历史记录', badge: '148次' },
  { icon: '💬', label: '提示词', badge: '' },
  { icon: '🖼️', label: '图片导入', badge: '' },
  { icon: '🔬', label: '词根分析', badge: '' },
]
</script>

<style scoped>
* { box-sizing: border-box; }

.preview-page {
  padding: 24px 20px;
  max-width: 1100px;
  margin: 0 auto;
  font-family: system-ui, -apple-system, 'Microsoft YaHei', sans-serif;
  background: #f0f2f5;
  min-height: 100vh;
}

.page-title { text-align: center; margin-bottom: 8px; color: #1e1e1e; font-weight: 600; font-size: 24px; }
.page-desc { text-align: center; color: #555; margin-bottom: 30px; font-size: 13px; line-height: 1.6; }

.schemes-row { display: flex; gap: 28px; justify-content: center; flex-wrap: wrap; }

.scheme-column {
  flex: 1 1 300px; min-width: 340px; max-width: 400px;
  background: #ffffff; border-radius: 24px; padding: 20px 16px 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  display: flex; flex-direction: column; transition: transform 0.15s;
}
.scheme-column:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1); }

.scheme-label {
  display: flex; align-items: center; gap: 8px; margin-bottom: 16px;
  padding-bottom: 12px; border-bottom: 2px solid #eef2f6;
}

.badge { padding: 4px 10px; border-radius: 30px; font-size: 12px; font-weight: 600; color: white; }
.badge.scheme1 { background: #409eff; }
.badge.scheme2 { background: #67c23a; }

/* 手机框 */
.mock-phone { display: flex; justify-content: center; margin-bottom: 12px; }
.phone-screen {
  width: 280px; height: 500px; border-radius: 28px; overflow: hidden;
  display: flex; flex-direction: column;
  box-shadow: 0 0 0 3px #333, 0 0 0 6px #1a1a1a, 0 12px 36px rgba(0,0,0,0.3);
  font-size: 12px; color: #e0e0e0; position: relative;
}

.ph-topbar { display: flex; align-items: center; justify-content: space-between; padding: 14px 14px 10px; flex-shrink: 0; }

/* ===== 方案A ===== */
.ph-stats-hero {
  display: flex; align-items: center; margin: 0 14px 10px; padding: 12px 8px;
  background: #2d2d3f; border-radius: 14px;
}
.ph-stat-big { flex: 1; text-align: center; }
.ph-stat-num { display: block; font-size: 18px; font-weight: 700; color: #22C55E; }
.ph-stat-label { font-size: 9px; color: #888; }
.ph-stat-divider { width: 1px; height: 28px; background: #374151; }

.ph-mine-grid {
  display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;
  padding: 0 14px; flex: 1; align-content: start;
}
.ph-mine-grid-item {
  background: #2d2d3f; border-radius: 16px; aspect-ratio: 1;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 8px; cursor: pointer;
}
.ph-mine-grid-icon { font-size: 26px; }
.ph-mine-grid-label { font-size: 10px; color: #bbb; text-align: center; }

.ph-settings-row {
  padding: 8px 14px; display: flex; flex-direction: column; gap: 6px;
  border-top: 1px solid #2d2d3f; flex-shrink: 0;
}
.ph-setting-item {
  display: flex; align-items: center; justify-content: space-between;
  font-size: 11px; color: #aaa;
}
.ph-toggle {
  width: 36px; height: 20px; border-radius: 10px; background: #22C55E; position: relative;
}
.ph-toggle::after {
  content: ''; position: absolute; top: 2px; right: 2px;
  width: 16px; height: 16px; border-radius: 8px; background: #fff;
}

/* ===== 方案B ===== */
.ph-stats-bar-b {
  display: flex; margin: 0 14px 8px; padding: 8px 6px;
  background: #2d2d3f; border-radius: 10px;
}
.ph-stat-item { flex:1; text-align: center; font-size: 9px; color: #888; }
.ph-stat-item b { display: block; font-size: 14px; color: #e0e0e0; }

.ph-grid-b {
  display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;
  padding: 0 14px; flex: 1;
}
.ph-grid-item {
  background: #2d2d3f; border-radius: 14px; padding: 14px 6px;
  text-align: center; cursor: pointer; position: relative;
  display: flex; flex-direction: column; align-items: center; gap: 6px;
}
.ph-grid-icon { font-size: 22px; }
.ph-grid-label { font-size: 10px; color: #bbb; }
.ph-grid-badge {
  position: absolute; top: 6px; right: 6px;
  font-size: 8px; background: #409eff; color: #fff;
  padding: 1px 5px; border-radius: 8px; min-width: 16px; text-align: center;
}

.ph-quick-actions {
  display: flex; gap: 8px; padding: 8px 14px; flex-shrink: 0;
  border-top: 1px solid #2d2d3f;
}
.ph-quick-btn {
  flex: 1; text-align: center; padding: 10px 0; border-radius: 10px;
  font-size: 11px; color: #fff; cursor: pointer;
}

/* 通用 */
.scheme-notes { margin: 12px 0 0; padding-left: 20px; color: #666; font-size: 13px; line-height: 1.6; }

.interaction-tip {
  margin-top: 36px; background: #e6f7ff; border-radius: 20px;
  padding: 20px 28px; border-left: 6px solid #1890ff;
}
.interaction-tip h3 { margin: 0 0 8px; color: #1e1e1e; }
.interaction-tip p { margin: 0; color: #333; line-height: 1.6; }
</style>
