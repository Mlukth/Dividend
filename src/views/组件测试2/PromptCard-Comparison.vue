<template>
  <div class="comparison-container">
    <!-- 页面标题 -->
    <header class="page-header">
      <h1>🎴 提示词卡组 - 铜级视觉方案对比</h1>
      <p class="subtitle">四种铜级卡片设计方案对比展示</p>
    </header>

    <!-- 方案对比表格 -->
    <section class="scheme-comparison">
      <div class="comparison-table">
        <div class="comparison-header">
          <div class="col-scheme">方案</div>
          <div class="col-name">名称</div>
          <div class="col-tech">技术实现</div>
          <div class="col-pros">优点</div>
          <div class="col-cons">缺点</div>
          <div class="col-suit">适用场景</div>
        </div>
        
        <div class="comparison-row">
          <div class="col-scheme scheme-a">A</div>
          <div class="col-name">
            <strong>铭刻纹</strong>
            <span>Brushed Texture</span>
          </div>
          <div class="col-tech">repeating-linear-gradient + 径向高光</div>
          <div class="col-pros">金属质感强，视觉独特</div>
          <div class="col-cons">性能开销略高</div>
          <div class="col-suit">强调工艺感的设计</div>
        </div>

        <div class="comparison-row">
          <div class="col-scheme scheme-b">B</div>
          <div class="col-name">
            <strong>渐变描边</strong>
            <span>Gradient Border</span>
          </div>
          <div class="col-tech">mask-composite + 动画</div>
          <div class="col-pros">边框发光，层次分明</div>
          <div class="col-cons">仅边框效果，整体偏素</div>
          <div class="col-suit">需要边框强调的场景</div>
        </div>

        <div class="comparison-row">
          <div class="col-scheme scheme-c">C</div>
          <div class="col-name">
            <strong>局部金属</strong>
            <span>Partial Metallic</span>
          </div>
          <div class="col-tech">复杂度球 + 版本标签渐变</div>
          <div class="col-pros">聚焦小元素，克制优雅</div>
          <div class="col-cons">铜级辨识度较低</div>
          <div class="col-suit">简约设计风格</div>
        </div>

        <div class="comparison-row">
          <div class="col-scheme scheme-d">D</div>
          <div class="col-name">
            <strong>悬浮揭示</strong>
            <span>Hover Reveal</span>
          </div>
          <div class="col-tech">::after伪元素 + 过渡动画</div>
          <div class="col-pros">交互惊喜，动态感强</div>
          <div class="col-cons">默认状态较平淡</div>
          <div class="col-suit">强调交互体验</div>
        </div>
      </div>
    </section>

    <!-- 卡片对比展示 -->
    <section class="card-comparison-grid">
      <!-- 方案A -->
      <div class="scheme-section">
        <div class="scheme-title">
          <span class="scheme-tag scheme-a">A</span>
          <h2>铭刻纹</h2>
          <p class="scheme-tagline">暗玻璃底 + 隐约的铜色金属纹理/拉丝纹作为卡片内衬</p>
        </div>
        <div class="card-row">
          <div class="demo-card rarity-copper category-CDEV">
            <div class="copper-texture"></div>
            <div class="complexity-sphere">2</div>
            <div class="category-border border-CDEV"></div>
            <div class="card-content">
              <div class="card-icon">💻</div>
              <div class="card-code">CDEV-extract-001</div>
              <div class="card-name">组件提取专家</div>
              <div class="card-tag tag-CDEV">代码工程</div>
              <div class="card-desc">从复杂代码中提取可复用组件的最佳实践</div>
              <div class="card-version">
                <span class="version-text">v1.2</span>
                <span class="variant-badge">+2</span>
              </div>
            </div>
          </div>
        </div>
        <div class="code-snippet">
          <pre>/* 方案A：铭刻纹 */
background: 
  repeating-linear-gradient(0deg, ...),
  repeating-linear-gradient(45deg, ...),
  radial-gradient(ellipse at 30% 20%, ...);</pre>
        </div>
      </div>

      <!-- 方案B -->
      <div class="scheme-section">
        <div class="scheme-title">
          <span class="scheme-tag scheme-b">B</span>
          <h2>渐变描边</h2>
          <p class="scheme-tagline">边框用微弱的铜色渐变发光（类似RGB边框但只用铜色系）</p>
        </div>
        <div class="card-row">
          <div class="demo-card rarity-copper category-PM">
            <div class="gradient-border-effect"></div>
            <div class="complexity-sphere">1</div>
            <div class="category-border border-PM"></div>
            <div class="card-content">
              <div class="card-icon">📋</div>
              <div class="card-code">PM-prompt-库-003</div>
              <div class="card-name">提示词库构建器</div>
              <div class="card-tag tag-PM">提示词管理</div>
              <div class="card-desc">构建结构化提示词库的管理框架</div>
              <div class="card-version">
                <span class="version-text">v2.0</span>
              </div>
            </div>
          </div>
        </div>
        <div class="code-snippet">
          <pre>/* 方案B：渐变描边 */
background: linear-gradient(135deg, rgba(203,106,82,0.4) ...);
mask-composite: xor;</pre>
        </div>
      </div>

      <!-- 方案C -->
      <div class="scheme-section">
        <div class="scheme-title">
          <span class="scheme-tag scheme-c">C</span>
          <h2>局部金属</h2>
          <p class="scheme-tagline">仅复杂度球、版本标签等小块元素用铜色金属质感</p>
        </div>
        <div class="card-row">
          <div class="demo-card rarity-copper category-INFO">
            <div class="complexity-sphere metallic-sphere">3</div>
            <div class="category-border border-INFO"></div>
            <div class="card-content">
              <div class="card-icon">🔍</div>
              <div class="card-code">INFO-analyze-007</div>
              <div class="card-name">信息分析助手</div>
              <div class="card-tag tag-INFO">信息处理</div>
              <div class="card-desc">深度分析文本信息并提取关键洞察</div>
              <div class="card-version">
                <span class="version-text metallic-text">v1.5</span>
                <span class="variant-badge metallic-badge">+1</span>
              </div>
            </div>
          </div>
        </div>
        <div class="code-snippet">
          <pre>/* 方案C：局部金属 */
.complexity-sphere {
  background: linear-gradient(145deg, #CB6A52, #A0522D, #8B4513);
  box-shadow: inset 0 2px 4px rgba(255,255,255,0.3), ...;
}</pre>
        </div>
      </div>

      <!-- 方案D -->
      <div class="scheme-section">
        <div class="scheme-title">
          <span class="scheme-tag scheme-d">D</span>
          <h2>悬浮揭示</h2>
          <p class="scheme-tagline">默认暗底，hover时浮现淡铜色光泽</p>
        </div>
        <div class="card-row hover-demo">
          <div class="demo-card rarity-copper category-LEARN hover-reveal">
            <div class="hover-copper-shimmer"></div>
            <div class="complexity-sphere">2</div>
            <div class="category-border border-LEARN"></div>
            <div class="card-content">
              <div class="card-icon">📚</div>
              <div class="card-code">LEARN-summary-012</div>
              <div class="card-name">学习摘要生成</div>
              <div class="card-tag tag-LEARN">学习辅助</div>
              <div class="card-desc">从教材中自动生成学习要点摘要</div>
              <div class="card-version">
                <span class="version-text">v1.0</span>
              </div>
            </div>
          </div>
        </div>
        <div class="code-snippet">
          <pre>/* 方案D：悬浮揭示 */
.hover-reveal:hover .hover-copper-shimmer { opacity: 1; }
.hover-reveal:hover {
  box-shadow: 0 0 30px rgba(203,106,82,0.15), ...;
}</pre>
        </div>
      </div>
    </section>

    <!-- 稀有度展示 -->
    <section class="rarity-showcase">
      <h2>🔮 稀有度体系</h2>
      <div class="rarity-cards">
        <div class="rarity-card copper">
          <div class="rarity-label">铜 Copper</div>
          <div class="rarity-range">0-49 次</div>
          <div class="rarity-preview"></div>
        </div>
        <div class="rarity-card bronze">
          <div class="rarity-label">青铜 Bronze</div>
          <div class="rarity-range">50-99 次</div>
          <div class="rarity-preview"></div>
        </div>
        <div class="rarity-card silver">
          <div class="rarity-label">银 Silver</div>
          <div class="rarity-range">100-299 次</div>
          <div class="rarity-preview"></div>
        </div>
        <div class="rarity-card gold">
          <div class="rarity-label">金 Gold</div>
          <div class="rarity-range">300+ 次</div>
          <div class="rarity-preview"></div>
        </div>
      </div>
    </section>

    <!-- 建议 -->
    <section class="recommendation">
      <h2>💡 推荐方案</h2>
      <div class="recommendation-content">
        <div class="rec-badge">🏆 首选推荐</div>
        <h3>方案A - 铭刻纹</h3>
        <p>理由：</p>
        <ul>
          <li>视觉冲击力最强，金属质感最为明显</li>
          <li>符合Dark academia + 玻璃拟态的整体风格</li>
          <li>默认状态就有视觉吸引力，无需交互即可展示铜级特色</li>
          <li>与其他稀有度（青铜/银/金）形成递进关系</li>
        </ul>
        <div class="rec-secondary">
          <span class="rec-badge secondary">🥈 备选推荐</span>
          <strong>方案D - 悬浮揭示</strong>
          <p>适合强调交互体验、卡片数量较多的场景。默认状态更简洁，悬浮时给予惊喜。</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
</script>

<style scoped>
.comparison-container {
  min-height: 100vh;
  background: #0a0a0a;
  background-image: 
    radial-gradient(circle at 50% 50%, rgba(255,255,255,0.03) 0%, transparent 50%),
    radial-gradient(circle at 20px 20px, rgba(255,255,255,0.06) 1px, transparent 1px);
  background-size: 100% 100%, 40px 40px;
  padding: 40px;
  font-family: 'Inter', 'PingFang SC', sans-serif;
  color: #e5e5e5;
}

.page-header {
  text-align: center;
  margin-bottom: 48px;
}

.page-header h1 {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 12px;
  background: linear-gradient(135deg, #e5e5e5, #c5ab50);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  font-size: 16px;
  color: #666;
}

/* 对比表格 */
.scheme-comparison {
  margin-bottom: 48px;
}

.comparison-table {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  overflow: hidden;
}

.comparison-header,
.comparison-row {
  display: grid;
  grid-template-columns: 60px 140px 1fr 1fr 1fr 1fr;
  gap: 16px;
  padding: 16px 20px;
  align-items: center;
}

.comparison-header {
  background: rgba(255,255,255,0.03);
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.comparison-row {
  border-top: 1px solid rgba(255,255,255,0.05);
}

.comparison-row:hover {
  background: rgba(255,255,255,0.02);
}

.col-scheme {
  font-size: 24px;
  font-weight: 700;
  text-align: center;
}

.col-scheme.scheme-a { color: #CB6A52; }
.col-scheme.scheme-b { color: #A97142; }
.col-scheme.scheme-c { color: #B08D57; }
.col-scheme.scheme-d { color: #9b59b6; }

.col-name strong {
  display: block;
  font-size: 14px;
}

.col-name span {
  font-size: 11px;
  color: #666;
}

.col-tech {
  font-size: 12px;
  color: #888;
  font-family: 'JetBrains Mono', monospace;
}

.col-pros, .col-cons, .col-suit {
  font-size: 13px;
  color: #aaa;
}

/* 卡片对比网格 */
.card-comparison-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32px;
  margin-bottom: 48px;
}

.scheme-section {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 16px;
  padding: 24px;
}

.scheme-title {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.scheme-title h2 {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
}

.scheme-tag {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
}

.scheme-tag.scheme-a { background: rgba(203,106,82,0.2); color: #CB6A52; }
.scheme-tag.scheme-b { background: rgba(169,113,66,0.2); color: #A97142; }
.scheme-tag.scheme-c { background: rgba(176,141,87,0.2); color: #B08D57; }
.scheme-tag.scheme-d { background: rgba(155,89,182,0.2); color: #9b59b6; }

.scheme-tagline {
  width: 100%;
  font-size: 12px;
  color: #666;
  margin-top: 8px;
}

/* 演示卡片 */
.card-row {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.demo-card {
  position: relative;
  width: 220px;
  height: 210px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255,255,255,0.02);
  backdrop-filter: blur(2px);
  border: 1px solid #171717;
}

/* 方案A - 铭刻纹 */
.demo-card.rarity-copper .copper-texture {
  position: absolute;
  inset: 0;
  opacity: 0.15;
  background: 
    repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(203,106,82,0.1) 2px, rgba(203,106,82,0.1) 4px),
    repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(203,106,82,0.05) 8px, rgba(203,106,82,0.05) 12px),
    radial-gradient(ellipse at 30% 20%, rgba(203,106,82,0.15) 0%, transparent 50%);
  pointer-events: none;
  animation: textureShimmer 8s ease-in-out infinite;
}

/* 方案B - 渐变描边 */
.demo-card .gradient-border-effect {
  position: absolute;
  inset: 0;
  border-radius: 12px;
  padding: 1px;
  background: linear-gradient(135deg, rgba(203,106,82,0.4) 0%, rgba(203,106,82,0.1) 25%, rgba(203,106,82,0.05) 50%, rgba(203,106,82,0.1) 75%, rgba(203,106,82,0.4) 100%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0.6;
}

/* 方案D - 悬浮揭示 */
.hover-demo .hover-reveal:hover .hover-copper-shimmer {
  opacity: 1;
}

.hover-demo .hover-reveal:hover {
  transform: translateY(-4px);
  border-color: rgba(203,106,82,0.5);
  box-shadow: 0 12px 40px rgba(0,0,0,0.5), 0 0 30px rgba(203,106,82,0.15);
}

.demo-card .hover-copper-shimmer {
  position: absolute;
  inset: 0;
  border-radius: 12px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.4s ease;
  background: 
    linear-gradient(180deg, rgba(203,106,82,0.25) 0%, rgba(203,106,82,0.05) 30%, transparent 60%),
    radial-gradient(ellipse at 0% 50%, rgba(203,106,82,0.2) 0%, transparent 50%);
}

/* 通用卡片元素 */
.complexity-sphere {
  position: absolute;
  top: 12px;
  left: 20px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  background: rgba(255,255,255,0.03);
  border: 1px solid #333;
  color: #888;
  z-index: 2;
}

/* 方案C 金属球 */
.complexity-sphere.metallic-sphere {
  background: linear-gradient(145deg, #CB6A52 0%, #A0522D 50%, #8B4513 100%);
  border-color: rgba(203,106,82,0.5);
  color: #fff;
  box-shadow: inset 0 2px 4px rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.3), 0 2px 8px rgba(203,106,82,0.3);
}

.category-border {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
}

.border-CDEV { background: #c0392b; }
.border-PM { background: #2980b9; }
.border-INFO { background: #27ae60; }
.border-LEARN { background: #8e44ad; }

.card-content {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px;
  gap: 6px;
}

.card-icon { font-size: 28px; margin-bottom: 2px; }
.card-code { font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #525252; letter-spacing: 0.5px; }
.card-name { font-size: 13px; font-weight: 600; color: #e5e5e5; text-align: center; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.card-tag { font-size: 10px; padding: 2px 8px; border-radius: 4px; background: rgba(255,255,255,0.05); }
.tag-CDEV { color: #e74c3c; background: rgba(192,57,43,0.15); }
.tag-PM { color: #3498db; background: rgba(41,128,185,0.15); }
.tag-INFO { color: #2ecc71; background: rgba(39,174,96,0.15); }
.tag-LEARN { color: #9b59b6; background: rgba(142,68,173,0.15); }
.card-desc { font-size: 11px; color: #737373; text-align: center; max-width: 100%; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; line-height: 1.4; }
.card-version { display: flex; align-items: center; gap: 6px; margin-top: 4px; }
.version-text { font-family: monospace; font-size: 10px; color: #737373; }
.variant-badge { font-size: 9px; padding: 1px 5px; background: rgba(46,204,113,0.2); color: #2ecc71; border-radius: 3px; font-weight: 600; }

/* 方案C 金属文本 */
.version-text.metallic-text {
  background: linear-gradient(135deg, #CB6A52 0%, #A0522D 100%);
  padding: 2px 6px;
  border-radius: 3px;
  color: #fff;
  font-weight: 600;
}

.variant-badge.metallic-badge {
  background: linear-gradient(135deg, #CB6A52 0%, #A0522D 100%);
}

.code-snippet {
  background: rgba(0,0,0,0.3);
  border-radius: 8px;
  padding: 12px;
  margin-top: 12px;
}

.code-snippet pre {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: #888;
  margin: 0;
  white-space: pre-wrap;
}

@keyframes textureShimmer {
  0%, 100% { opacity: 0.12; }
  50% { opacity: 0.18; }
}

/* 稀有度展示 */
.rarity-showcase {
  margin-bottom: 48px;
}

.rarity-showcase h2 {
  font-size: 24px;
  margin-bottom: 24px;
  text-align: center;
}

.rarity-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.rarity-card {
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  border: 1px solid;
}

.rarity-card.copper {
  background: linear-gradient(135deg, rgba(203,106,82,0.03) 0%, rgba(15,15,15,0.95) 50%);
  border-color: rgba(203,106,82,0.2);
}

.rarity-card.bronze {
  background: linear-gradient(135deg, #A97142 0%, #6E3A06 50%, #B08D57 100%);
  border-color: rgba(169,113,66,0.3);
}

.rarity-card.silver {
  background: linear-gradient(135deg, #B4B9BE 0%, #716F71 50%, #A8A9AD 100%);
  border-color: rgba(180,185,190,0.3);
}

.rarity-card.gold {
  background: linear-gradient(135deg, #C5AB50 0%, #AC933E 50%, #FBF8AE 100%);
  border-color: rgba(197,171,80,0.4);
  box-shadow: 0 0 20px rgba(197,171,80,0.2);
}

.rarity-label {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
}

.rarity-card.copper .rarity-label { color: #CB6A52; }
.rarity-card.bronze .rarity-label { color: #fff; }
.rarity-card.silver .rarity-label { color: #333; }
.rarity-card.gold .rarity-label { color: #1a0e00; }

.rarity-range {
  font-size: 11px;
  color: #666;
}

.rarity-card.bronze .rarity-range,
.rarity-card.silver .rarity-range,
.rarity-card.gold .rarity-range {
  color: rgba(255,255,255,0.6);
}

.rarity-preview {
  height: 60px;
  margin-top: 16px;
  border-radius: 6px;
  background: rgba(255,255,255,0.05);
}

/* 推荐建议 */
.recommendation {
  background: rgba(197,171,80,0.05);
  border: 1px solid rgba(197,171,80,0.2);
  border-radius: 16px;
  padding: 32px;
}

.recommendation h2 {
  font-size: 24px;
  margin-bottom: 20px;
  text-align: center;
}

.recommendation-content {
  max-width: 600px;
  margin: 0 auto;
}

.rec-badge {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 12px;
  background: linear-gradient(135deg, #c5ab50 0%, #ac933e 100%);
  color: #1a0e00;
}

.rec-badge.secondary {
  background: rgba(203,106,82,0.2);
  color: #CB6A52;
  margin-right: 12px;
}

.recommendation-content h3 {
  font-size: 20px;
  margin-bottom: 16px;
}

.recommendation-content ul {
  list-style: none;
  padding: 0;
}

.recommendation-content li {
  padding: 8px 0;
  padding-left: 24px;
  position: relative;
  color: #aaa;
}

.recommendation-content li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #2ecc71;
}

.rec-secondary {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid rgba(255,255,255,0.1);
}

.rec-secondary strong {
  color: #CB6A52;
}

/* 响应式 */
@media (max-width: 1024px) {
  .card-comparison-grid {
    grid-template-columns: 1fr;
  }
  
  .rarity-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .comparison-header,
  .comparison-row {
    grid-template-columns: 50px 1fr;
  }
  
  .col-tech, .col-pros, .col-cons, .col-suit {
    display: none;
  }
}
</style>
