<template>
  <div class="preview-page">
    <h2 class="page-title">📱 AlgorithmWaveTool 手机端布局方案对比</h2>
    <p class="page-desc">
      桌面版 902 行：左栏（代码输入+水波5层+Canvas帧）+ 右栏 420px（伪代码+回声验证）。<br>
      手机版需重新设计为单列。以下 3 种方案，375dp 宽手机模拟。
    </p>

    <!-- ===== 方案对比 ===== -->
    <div class="schemes-row">
      <!-- 方案A：Tab 切换 -->
      <div class="scheme-column">
        <div class="scheme-label">
          <span class="badge scheme-a">方案 A</span>
          <strong>底部 Tab 切换</strong>
        </div>
        <div class="mock-phone">
          <div class="phone-screen" style="background:#0d1117">
            <!-- Tab 内容区 -->
            <div class="ph-tab-content">
              <!-- Tab: 水波分析 -->
              <div class="ph-section">
                <div class="ph-section-hdr">🌊 水波分析</div>
                <!-- 代码输入 -->
                <div class="ph-code-input">
                  <div style="display:flex;gap:4px;align-items:center">
                    <span class="ph-chip on">粘贴代码</span>
                    <span class="ph-chip">截图</span>
                    <span style="font-size:9px;color:#888;margin-left:auto">Python ▾</span>
                  </div>
                  <textarea class="ph-ta-sm" placeholder="在此粘贴算法代码片段..." style="height:60px"></textarea>
                  <div class="ph-btn-row">
                    <span class="ph-btn blue">🌊 复制提示词</span>
                  </div>
                </div>
                <!-- 水波层 -->
                <div class="ph-wave-layers">
                  <div class="ph-wave-item l0">🔵 算法本质（一句话）</div>
                  <div class="ph-wave-item l1">🟢 关键步骤切分 ▸</div>
                  <div class="ph-wave-item l2">🟡 卡点诊断 ▸</div>
                  <div class="ph-wave-item l3">🟠 突破策略 ▸</div>
                  <div class="ph-wave-item l4">🔴 生活类比 ▸</div>
                </div>
              </div>
            </div>
            <!-- 底部 Tab 栏 -->
            <div class="ph-tab-bar">
              <span class="ph-tab active">🌊 分析</span>
              <span class="ph-tab">📡 验证</span>
            </div>
          </div>
        </div>
        <div class="ph-tab-hint">← 点击切换 Tab →</div>
        <ul class="scheme-notes">
          <li>底部 2 个固定 Tab，一键切换分析和验证</li>
          <li>Tab1 分析：代码输入 → 5 层水波结果展开</li>
          <li>Tab2 验证：伪代码输入 → 验证结果 → 深入引导</li>
          <li>优点：结构清晰，和桌面版一一对应</li>
          <li>缺点：分析结果和伪代码不同屏，需来回切</li>
        </ul>
      </div>

      <!-- 方案B：垂直堆叠 -->
      <div class="scheme-column">
        <div class="scheme-label">
          <span class="badge scheme-b">方案 B</span>
          <strong>垂直堆叠 · 全滚动</strong>
        </div>
        <div class="mock-phone">
          <div class="phone-screen" style="background:#0d1117;overflow-y:auto">
            <!-- 标题栏 -->
            <div class="ph-topbar">🌊 算法水波渐进分析</div>
            <!-- 代码输入 -->
            <div class="ph-collapse open">
              <div class="ph-collapse-hdr">📋 代码输入</div>
              <div class="ph-collapse-body">
                <textarea class="ph-ta-sm" placeholder="粘贴算法代码..." style="height:48px"></textarea>
                <div class="ph-btn-row">
                  <span class="ph-btn blue">🌊 复制提示词</span>
                  <span class="ph-btn gray">粘贴结果</span>
                </div>
              </div>
            </div>
            <!-- 水波分析 -->
            <div class="ph-collapse open">
              <div class="ph-collapse-hdr">🌊 水波分析 — 快速排序</div>
              <div class="ph-collapse-body">
                <div class="ph-wave-item l0" style="font-size:10px">🔵 选一个基准数，比它小的放左边，大的放右边</div>
                <div class="ph-wave-item l1" style="font-size:10px">🟢 关键步骤切分 (5步) ▸</div>
                <div class="ph-wave-item l2" style="font-size:10px">🟡 纠结基准数怎么选？ ▸</div>
              </div>
            </div>
            <!-- 伪代码 -->
            <div class="ph-collapse">
              <div class="ph-collapse-hdr">✍️ 你的理解（伪代码）</div>
            </div>
            <!-- 验证 -->
            <div class="ph-collapse">
              <div class="ph-collapse-hdr">📡 回声验证</div>
            </div>
          </div>
        </div>
        <ul class="scheme-notes">
          <li>全部内容一列到底，折叠面板控制展开/收起</li>
          <li>默认展开当前步骤，已完成步骤可折叠</li>
          <li>优点：一屏看完流程全貌</li>
          <li>缺点：5 层展开后滚动很长，Canvas 帧难放</li>
        </ul>
      </div>

      <!-- 方案C：步骤向导 -->
      <div class="scheme-column">
        <div class="scheme-label">
          <span class="badge scheme-c">方案 C</span>
          <strong>步骤向导</strong>
        </div>
        <div class="mock-phone">
          <div class="phone-screen" style="background:#0d1117">
            <!-- 步骤指示器 -->
            <div class="ph-steps-bar">
              <span class="ph-step done">①</span><span class="ph-step-conn done"></span>
              <span class="ph-step active">②</span><span class="ph-step-conn"></span>
              <span class="ph-step">③</span><span class="ph-step-conn"></span>
              <span class="ph-step">④</span>
            </div>
            <div class="ph-steps-label">
              <span style="font-size:13px;font-weight:700;color:#fff">步骤 2/4 — 🌊 水波分析</span>
            </div>
            <!-- 步骤内容 -->
            <div class="ph-step-content">
              <div class="ph-wave-item l0">🔵 算法本质</div>
              <div style="font-size:10px;color:#aaa;padding:6px 10px">选一个基准数pivot，比它小的放左边，大的放右边，对左右递归</div>
              <div class="ph-wave-item l1">🟢 步骤切分 (5帧) ▸</div>
              <div class="ph-wave-item l2">🟡 卡点：基准怎么选？ ▸</div>
              <div class="ph-wave-item l3">🟠 策略：三数取中 ▸</div>
              <div class="ph-wave-item l4">🔴 类比：整理扑克牌 ▸</div>
            </div>
            <!-- 步骤按钮 -->
            <div class="ph-step-btns">
              <span class="ph-btn gray">← 上一步</span>
              <span class="ph-btn blue">下一步 →</span>
            </div>
          </div>
        </div>
        <ul class="scheme-notes">
          <li>顶部步骤条：①输入 → ②分析 → ③伪代码 → ④验证</li>
          <li>每步全屏独占，完成才解锁下一步</li>
          <li>优点：引导式，适合学习场景，不迷路</li>
          <li>缺点：灵活性差，无法跳步或对比不同步骤</li>
        </ul>
      </div>
    </div>

    <!-- 额外：Canvas 帧适配 -->
    <div class="canvas-note">
      <h3>🎬 Canvas 关键帧 — 通用适配</h3>
      <p>
        桌面版 Canvas 600×220 固定尺寸。手机端需缩放为 <code>canvas { width: 100%; max-width: 375px; height: auto }</code>，
        或用 CSS <code>transform: scale()</code> 缩放到容器宽度。三种方案均适用。
      </p>
    </div>

    <!-- 底部建议 -->
    <div class="interaction-tip">
      <h3>💡 选择建议</h3>
      <p>
        · <strong>方案 A（Tab）</strong>：功能分区最清晰，和桌面版逻辑一致，实现成本中等。适合习惯桌面版的老用户。<br>
        · <strong>方案 B（堆叠）</strong>：最接近"一页看完"的体验，折叠面板是现成组件。适合快速浏览全部内容。<br>
        · <strong>方案 C（向导）</strong>：最适合教学场景，强制按顺序走。适合给不熟悉算法的用户用。<br>
        推荐 <strong>A+B 混合</strong>：主结构用 Tab（分析/验证），分析 Tab 内用可折叠面板展示 5 层水波。
      </p>
    </div>
  </div>
</template>

<script setup>
// 纯展示页面，无交互逻辑
</script>

<style scoped>
* { box-sizing: border-box; }

.preview-page {
  padding: 24px 20px; max-width: 1400px; margin: 0 auto;
  font-family: system-ui, -apple-system, 'Microsoft YaHei', sans-serif;
  background: #f0f2f5; min-height: 100vh;
}

.page-title { text-align: center; margin-bottom: 8px; color: #1e1e1e; font-weight: 600; font-size: 24px; }
.page-desc { text-align: center; color: #555; margin-bottom: 24px; font-size: 13px; line-height: 1.6; }

/* 三列布局 */
.schemes-row { display: flex; gap: 24px; justify-content: center; flex-wrap: wrap; }

.scheme-column {
  flex: 1 1 300px; min-width: 320px; max-width: 400px;
  background: #ffffff; border-radius: 24px; padding: 20px 16px 24px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.06);
  display: flex; flex-direction: column; transition: transform 0.15s;
}
.scheme-column:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.1); }

.scheme-label {
  display: flex; align-items: center; gap: 8px; margin-bottom: 12px;
  padding-bottom: 10px; border-bottom: 2px solid #eef2f6;
}

.badge { padding: 4px 10px; border-radius: 30px; font-size: 12px; font-weight: 600; color: white; }
.badge.scheme-a { background: #409eff; }
.badge.scheme-b { background: #67c23a; }
.badge.scheme-c { background: #e6a23c; }

/* 手机框 */
.mock-phone { display: flex; justify-content: center; margin-bottom: 8px; }
.phone-screen {
  width: 280px; height: 520px; border-radius: 28px; overflow: hidden;
  display: flex; flex-direction: column;
  box-shadow: 0 0 0 3px #333, 0 0 0 6px #1a1a1a, 0 12px 36px rgba(0,0,0,0.3);
  font-size: 12px; color: #e0e0e0; position: relative;
}

/* ===== 方案A：Tab 切换 ===== */
.ph-tab-content { flex: 1; overflow-y: auto; padding: 8px 10px; }
.ph-section-hdr {
  font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 8px;
  padding-bottom: 6px; border-bottom: 1px solid #30363d;
}

.ph-code-input { margin-bottom: 10px; }

.ph-chip {
  display: inline-block; padding: 2px 8px; border-radius: 10px;
  font-size: 9px; background: #21262d; color: #888; cursor: pointer;
}
.ph-chip.on { background: #1f6feb33; color: #58a6ff; }

.ph-ta-sm {
  width: 100%; background: #161b22; border: 1px solid #30363d; border-radius: 6px;
  padding: 6px 8px; color: #c9d1d9; font-size: 10px; resize: none;
  outline: none; font-family: inherit; margin-top: 4px;
}

.ph-btn-row { display: flex; gap: 6px; margin-top: 6px; }
.ph-btn { padding: 4px 10px; border-radius: 6px; font-size: 10px; cursor: pointer; text-align: center; }
.ph-btn.blue { background: #238636; color: #fff; }
.ph-btn.gray { background: #21262d; color: #c9d1d9; }

/* 水波层 */
.ph-wave-layers { display: flex; flex-direction: column; gap: 4px; }
.ph-wave-item {
  padding: 6px 10px; border-radius: 6px; font-size: 10px; cursor: pointer;
  border-left: 3px solid transparent;
}
.ph-wave-item.l0 { border-left-color: #58a6ff; background: #1f6feb11; }
.ph-wave-item.l1 { border-left-color: #3fb950; background: #23863611; }
.ph-wave-item.l2 { border-left-color: #d29922; background: #9e6a0311; }
.ph-wave-item.l3 { border-left-color: #db6d28; background: #bd561d11; }
.ph-wave-item.l4 { border-left-color: #f85149; background: #da363311; }

/* Tab 栏 */
.ph-tab-bar {
  display: flex; border-top: 1px solid #30363d; flex-shrink: 0;
}
.ph-tab {
  flex: 1; text-align: center; padding: 10px 0; font-size: 12px;
  color: #888; cursor: pointer; transition: color 0.15s;
}
.ph-tab.active { color: #58a6ff; font-weight: 600; }

.ph-tab-hint { text-align: center; font-size: 10px; color: #999; margin-bottom: 4px; }

/* ===== 方案B：垂直堆叠 ===== */
.ph-topbar {
  padding: 10px 14px; font-size: 13px; font-weight: 700; color: #fff;
  border-bottom: 1px solid #30363d; text-align: center; flex-shrink: 0;
}

.ph-collapse { border-bottom: 1px solid #21262d; flex-shrink: 0; }
.ph-collapse.open { }
.ph-collapse-hdr {
  padding: 8px 12px; font-size: 11px; font-weight: 600; color: #c9d1d9;
  cursor: pointer; display: flex; align-items: center; gap: 4px;
}
.ph-collapse-hdr::before { content: '▸'; font-size: 8px; color: #888; }
.ph-collapse.open .ph-collapse-hdr::before { content: '▾'; }
.ph-collapse-body { padding: 0 12px 8px; display: none; }
.ph-collapse.open .ph-collapse-body { display: block; }

/* ===== 方案C：步骤向导 ===== */
.ph-steps-bar {
  display: flex; align-items: center; justify-content: center;
  padding: 12px 10px 6px; gap: 0; flex-shrink: 0;
}
.ph-step {
  width: 24px; height: 24px; border-radius: 50%; font-size: 10px;
  display: flex; align-items: center; justify-content: center;
  background: #21262d; color: #888; flex-shrink: 0;
}
.ph-step.done { background: #238636; color: #fff; }
.ph-step.active { background: #1f6feb; color: #fff; box-shadow: 0 0 8px #1f6feb66; }
.ph-step-conn {
  width: 20px; height: 2px; background: #30363d; flex-shrink: 0;
}
.ph-step-conn.done { background: #238636; }

.ph-steps-label { text-align: center; padding: 6px 0; }

.ph-step-content { flex: 1; overflow-y: auto; padding: 8px 12px; display: flex; flex-direction: column; gap: 4px; }

.ph-step-btns {
  display: flex; gap: 8px; padding: 10px 12px; border-top: 1px solid #30363d; flex-shrink: 0;
}
.ph-step-btns .ph-btn { flex: 1; }

/* ===== 通用 ===== */
.scheme-notes {
  margin: 8px 0 0 0; padding-left: 16px; font-size: 12px; color: #666; line-height: 1.7;
}
.scheme-notes li { margin-bottom: 2px; }

/* Canvas 适配说明 */
.canvas-note {
  margin-top: 32px; background: #fff; border-radius: 20px; padding: 20px 28px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}
.canvas-note h3 { margin: 0 0 8px; color: #1e1e1e; }
.canvas-note p { font-size: 13px; color: #555; line-height: 1.6; }
.canvas-note code { background: #eef2f6; padding: 2px 6px; border-radius: 4px; font-size: 12px; }

/* 底部建议 */
.interaction-tip {
  margin-top: 32px; background: #e6f7ff; border-radius: 20px;
  padding: 20px 28px; border-left: 6px solid #1890ff;
}
.interaction-tip h3 { margin: 0 0 10px; color: #1e1e1e; }
.interaction-tip p { font-size: 13px; color: #555; line-height: 1.8; }
</style>
