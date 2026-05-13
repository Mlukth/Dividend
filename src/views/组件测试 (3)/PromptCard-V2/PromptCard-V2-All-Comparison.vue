<template>
  <div class="comparison-container">
    <h1 class="title">悬浮特效 V2 对比</h1>
    <p class="subtitle">四种不同对比度增强方案</p>
    
    <div class="comparison-grid">
      <div class="compare-card">
        <div class="card-preview">
          <div class="preview-badge">边框升级</div>
          <div class="preview-visual bronze">
            <span>铜</span>
          </div>
          <div class="preview-visual silver">
            <span>银</span>
          </div>
          <div class="preview-visual gold">
            <span>金</span>
          </div>
          <div class="arrow">→</div>
          <div class="preview-visual upgraded bronze">
            <span>银</span>
          </div>
          <div class="preview-visual upgraded silver">
            <span>金</span>
          </div>
          <div class="preview-visual upgraded gold">
            <span>铂</span>
          </div>
        </div>
        <div class="card-info">
          <h3>A. 边框颜色升级</h3>
          <p>悬浮时边框颜色跳级：铜→银→金→铂金</p>
          <div class="pros-cons">
            <span class="pro">✓ 对比度最强</span>
            <span class="pro">✓ 金属感递进</span>
            <span class="con">✗ 跳跃感明显</span>
          </div>
        </div>
        <a href="/组件测试/PromptCard-V2-A-GlowRing.vue" class="demo-link">查看 Demo →</a>
      </div>

      <div class="compare-card">
        <div class="card-preview">
          <div class="preview-badge">外发光晕</div>
          <div class="aura-demo bronze"></div>
          <div class="aura-demo silver"></div>
          <div class="aura-demo gold"></div>
        </div>
        <div class="card-info">
          <h3>B. 稀有度光晕</h3>
          <p>卡片外围扩散大范围发光：铜=暖橙、银=冷蓝、金=强金</p>
          <div class="pros-cons">
            <span class="pro">✓ 氛围感强</span>
            <span class="pro">✓ 视觉冲击力</span>
            <span class="con">✗ 可能有干扰</span>
          </div>
        </div>
        <a href="/组件测试/PromptCard-V2-B-Aura.vue" class="demo-link">查看 Demo →</a>
      </div>

      <div class="compare-card">
        <div class="card-preview">
          <div class="preview-badge">槽位激活</div>
          <div class="slot-demo bronze">
            <div class="slot-inner">内容</div>
          </div>
          <div class="slot-demo silver">
            <div class="slot-inner">内容</div>
          </div>
          <div class="slot-demo gold">
            <div class="slot-inner">内容</div>
          </div>
        </div>
        <div class="card-info">
          <h3>C. 卡片槽背景</h3>
          <p>槽位根据稀有度有不同底色，悬浮时槽位激活发光</p>
          <div class="pros-cons">
            <span class="pro">✓ 不干扰卡片</span>
            <span class="pro">✓ 层次分明</span>
            <span class="con">✗ 效果较间接</span>
          </div>
        </div>
        <a href="/组件测试/PromptCard-V2-C-Slot.vue" class="demo-link">查看 Demo →</a>
      </div>

      <div class="compare-card">
        <div class="card-preview">
          <div class="preview-badge">粒子星尘</div>
          <div class="particle-row">
            <div class="particle bronze">✦</div>
            <div class="particle silver">✦</div>
            <div class="particle gold">✦</div>
          </div>
        </div>
        <div class="card-info">
          <h3>D. 粒子星尘效果</h3>
          <p>悬浮时卡片内飘出稀有度对应的粒子，铜=橙、银=蓝白、金=金</p>
          <div class="pros-cons">
            <span class="pro">✓ 动态感强</span>
            <span class="pro">✓ 独特有趣</span>
            <span class="con">✗ 性能开销</span>
          </div>
        </div>
        <a href="/组件测试/PromptCard-V2-D-Particles.vue" class="demo-link">查看 Demo →</a>
      </div>
    </div>

    <div class="summary-section">
      <h2>效果对比总结</h2>
      <table class="compare-table">
        <thead>
          <tr>
            <th>方案</th>
            <th>对比度</th>
            <th>性能</th>
            <th>氛围</th>
            <th>推荐场景</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>A. 边框升级</td>
            <td class="rating high">★★★★★</td>
            <td class="rating high">★★★★★</td>
            <td class="rating mid">★★★☆☆</td>
            <td>需要强反馈</td>
          </tr>
          <tr>
            <td>B. 外发光晕</td>
            <td class="rating high">★★★★☆</td>
            <td class="rating high">★★★★☆</td>
            <td class="rating high">★★★★★</td>
            <td>氛围展示</td>
          </tr>
          <tr>
            <td>C. 槽位激活</td>
            <td class="rating mid">★★★☆☆</td>
            <td class="rating high">★★★★★</td>
            <td class="rating mid">★★★☆☆</td>
            <td>克制风格</td>
          </tr>
          <tr>
            <td>D. 粒子星尘</td>
            <td class="rating high">★★★★☆</td>
            <td class="rating low">★★☆☆☆</td>
            <td class="rating high">★★★★★</td>
            <td>科技感/华丽</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.comparison-container {
  min-height: 100vh;
  background: #0a0a0c;
  padding: 48px 24px;
  font-family: 'SF Pro Display', system-ui, sans-serif;
  color: #e8e8e8;
}

.title {
  font-size: 36px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #fff 0%, #888 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  text-align: center;
  color: #666;
  font-size: 16px;
  margin-bottom: 48px;
}

.comparison-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto 64px;
}

.compare-card {
  background: #111113;
  border: 1px solid #222;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  transition: all 0.3s ease;
}

.compare-card:hover {
  border-color: #c76a52;
  transform: translateY(-4px);
}

.card-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: #0c0c0e;
  border-radius: 12px;
  min-height: 100px;
}

.preview-badge {
  width: 100%;
  text-align: center;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: #555;
  margin-bottom: 8px;
}

.preview-visual {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid;
  transition: all 0.3s;
}

.preview-visual.bronze {
  background: rgba(205, 127, 50, 0.15);
  border-color: rgba(205, 127, 50, 0.4);
  color: #cd7f32;
}
.preview-visual.silver {
  background: rgba(168, 212, 255, 0.12);
  border-color: rgba(168, 212, 255, 0.3);
  color: #a8d4ff;
}
.preview-visual.gold {
  background: rgba(255, 215, 0, 0.15);
  border-color: rgba(255, 215, 0, 0.4);
  color: #ffd700;
}

.preview-visual.upgraded {
  border-width: 2px;
  box-shadow: 0 0 15px currentColor;
}

.arrow {
  color: #444;
  font-size: 18px;
}

/* B - 光晕演示 */
.aura-demo {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  position: relative;
}

.aura-demo.bronze {
  background: #1a1512;
  border: 1px solid rgba(205, 127, 50, 0.3);
  box-shadow: 0 0 20px rgba(205, 127, 50, 0.4);
}
.aura-demo.silver {
  background: #1a1c1f;
  border: 1px solid rgba(168, 212, 255, 0.3);
  box-shadow: 0 0 25px rgba(168, 212, 255, 0.4);
}
.aura-demo.gold {
  background: #1f1a12;
  border: 1px solid rgba(255, 215, 0, 0.4);
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
}

/* C - 槽位演示 */
.slot-demo {
  padding: 3px;
  border-radius: 10px;
  transition: all 0.3s;
}

.slot-demo.bronze {
  background: linear-gradient(145deg, rgba(80, 50, 25, 0.6) 0%, rgba(50, 30, 15, 0.4) 100%);
  border: 1px solid rgba(205, 127, 50, 0.4);
}
.slot-demo.silver {
  background: linear-gradient(145deg, rgba(60, 70, 80, 0.6) 0%, rgba(40, 50, 60, 0.4) 100%);
  border: 1px solid rgba(168, 212, 255, 0.3);
}
.slot-demo.gold {
  background: linear-gradient(145deg, rgba(80, 70, 30, 0.7) 0%, rgba(50, 45, 20, 0.5) 100%);
  border: 1px solid rgba(255, 215, 0, 0.4);
}

.slot-inner {
  background: #111;
  border-radius: 7px;
  padding: 8px 16px;
  font-size: 11px;
  color: #555;
}

/* D - 粒子演示 */
.particle-row {
  display: flex;
  gap: 12px;
}

.particle {
  font-size: 24px;
  animation: float 2s ease-in-out infinite;
}

.particle.bronze {
  color: #cd7f32;
  text-shadow: 0 0 10px rgba(205, 127, 50, 0.8);
  animation-delay: 0s;
}
.particle.silver {
  color: #a8d4ff;
  text-shadow: 0 0 15px rgba(168, 212, 255, 0.8);
  animation-delay: 0.3s;
}
.particle.gold {
  color: #ffd700;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
  animation-delay: 0.6s;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.card-info h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
}

.card-info p {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 12px;
}

.pros-cons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 12px;
}

.pro { color: #4ade80; }
.con { color: #f87171; }

.demo-link {
  display: block;
  text-align: center;
  padding: 12px;
  background: rgba(199, 106, 82, 0.1);
  border: 1px solid rgba(199, 106, 82, 0.3);
  border-radius: 8px;
  color: #c76a52;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.3s;
  margin-top: auto;
}

.demo-link:hover {
  background: rgba(199, 106, 82, 0.2);
  border-color: #c76a52;
}

/* 总结表格 */
.summary-section {
  max-width: 900px;
  margin: 0 auto;
}

.summary-section h2 {
  font-size: 24px;
  text-align: center;
  margin-bottom: 24px;
}

.compare-table {
  width: 100%;
  border-collapse: collapse;
  background: #111113;
  border-radius: 12px;
  overflow: hidden;
}

.compare-table th,
.compare-table td {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid #222;
}

.compare-table th {
  background: #0c0c0e;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: #666;
}

.compare-table tr:last-child td {
  border-bottom: none;
}

.compare-table tr:hover td {
  background: rgba(199, 106, 82, 0.05);
}

.rating {
  font-size: 14px;
  letter-spacing: 2px;
}

.rating.high { color: #4ade80; }
.rating.mid { color: #facc15; }
.rating.low { color: #f87171; }
</style>
