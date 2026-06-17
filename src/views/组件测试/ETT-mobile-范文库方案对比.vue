<template>
  <div class="preview-page">
    <h2 class="page-title">📚 范文库 — 手机端布局方案对比</h2>
    <p class="page-desc">
      6.67英寸手机（375dp），深色主题。<br>
      核心操作：<b>图片导入</b>（最常用） / 选范文开始练习 / 查看打卡日历。
    </p>

    <div class="schemes-row">
      <!-- 方案1：卡片列表 + 底部FAB -->
      <div class="scheme-column">
        <div class="scheme-label">
          <span class="badge scheme1">方案 1</span>
          <strong>卡片列表 · 右下FAB</strong>
        </div>
        <div class="mock-phone">
          <div class="phone-screen" style="background:#1a1a2e">
            <!-- 顶部 -->
            <div class="ph-topbar">
              <span class="ph-title">范文库</span>
              <span class="ph-count">30篇</span>
            </div>
            <!-- 四格统计条 -->
            <div class="ph-stats-bar" style="background: #2a3a3a">
              <div class="ph-stat-item"><b>7</b>天连续</div>
              <div class="ph-stat-item"><b>26</b>篇已练</div>
              <div class="ph-stat-item"><b>82</b>均分</div>
              <div class="ph-stat-item"><b>3.2h</b>总时</div>
            </div>
            <!-- 范文卡片列表 -->
            <div class="ph-list">
              <div v-for="e in mockEssays" :key="e.id" class="ph-card"
                :class="{ active: e.id === 'e2' }">
                <div class="ph-card-left">
                  <div class="ph-card-title">{{ e.title }}</div>
                  <div class="ph-card-meta">{{ e.source }}</div>
                </div>
                <div class="ph-card-right">
                  <span class="ph-card-score" v-if="e.score" :style="{color: e.score>=80?'#22C55E':'#F59E0B'}">{{ e.score }}</span>
                  <span class="ph-card-new" v-else>新</span>
                </div>
              </div>
            </div>
            <!-- 日历折叠条 -->
            <div class="ph-calendar-bar" @click="scheme1Cal = !scheme1Cal">
              <span>📅 打卡日历 {{ scheme1Cal ? '▾' : '▸' }}</span>
              <span class="ph-cal-dots">
                <span v-for="i in 7" :key="i" class="cal-dot" :style="{background: i<=5?'#22C55E':'#374151'}"></span>
              </span>
            </div>
            <div v-if="scheme1Cal" class="ph-calendar-expand">
              <div v-for="w in 2" :key="w" style="display:flex;gap:3px;justify-content:center">
                <span v-for="d in 7" :key="d" class="cal-day" :style="{background: Math.random()>0.3?'#22C55E':'#374151'}"></span>
              </div>
              <span style="font-size:10px;color:#888">5月25日 — 6月7日</span>
            </div>
            <!-- FAB -->
            <div class="ph-fab">📷</div>
          </div>
        </div>
        <ul class="scheme-notes">
          <li>卡片列表全屏滚动，信息密度适中</li>
          <li>右下角 FAB 固定，一键图片导入</li>
          <li>日历默认收起为色点条，点开展开</li>
          <li>四格统计条：连续天数/已练篇数/均分/总时</li>
        </ul>
      </div>

      <!-- 方案2：紧凑列表 + 顶部固定操作栏 -->
      <div class="scheme-column">
        <div class="scheme-label">
          <span class="badge scheme2">方案 2</span>
          <strong>紧凑列表 · 顶部操作栏</strong>
        </div>
        <div class="mock-phone">
          <div class="phone-screen" style="background:#1a1a2e">
            <!-- 顶部操作栏 -->
            <div class="ph-topbar">
              <span class="ph-title">范文库</span>
              <div class="ph-actions">
                <span class="ph-action-btn">+</span>
                <span class="ph-action-btn" style="background:#22C55E">📷</span>
              </div>
            </div>
            <!-- 统计小条 -->
            <div class="ph-stats-bar">
              <div class="ph-stat-item"><b>7</b>天连续</div>
              <div class="ph-stat-item"><b>26</b>篇已练</div>
              <div class="ph-stat-item"><b>82</b>均分</div>
              <div class="ph-stat-item"><b>3.2h</b>总时</div>
            </div>
            <!-- 紧凑列表 -->
            <div class="ph-list">
              <div v-for="e in mockEssays" :key="e.id" class="ph-row">
                <div class="ph-row-info">
                  <span class="ph-row-title">{{ e.title }}</span>
                  <span class="ph-row-src">{{ e.source }}</span>
                </div>
                <span class="ph-row-score" v-if="e.score" :style="{color: e.score>=80?'#22C55E':'#F59E0B'}">{{ e.score }}</span>
                <span class="ph-row-new" v-else>NEW</span>
              </div>
            </div>
            <!-- 底部日历横条 -->
            <div class="ph-calendar-strip">
              <span style="font-size:10px;color:#888;margin-right:6px">📅</span>
              <span v-for="i in 14" :key="i" class="cal-strip-dot" :style="{background: i<=10?'#22C55E':'#374151'}"></span>
            </div>
          </div>
        </div>
        <ul class="scheme-notes">
          <li>顶部固定操作栏：+添加 + 📷导入</li>
          <li>统计四格横排，不占纵向空间</li>
          <li>列表项紧凑（单行高度），可容纳更多范文</li>
          <li>日历用 GitHub 贡献图式色点横条</li>
          <li>空间利用率最高，适合范文数量多</li>
        </ul>
      </div>

      <!-- 方案3：双列网格 + 底部固定按钮 -->
      <div class="scheme-column">
        <div class="scheme-label">
          <span class="badge scheme3">方案 3</span>
          <strong>双列网格 · 底部按钮</strong>
        </div>
        <div class="mock-phone">
          <div class="phone-screen" style="background:#1a1a2e">
            <!-- 顶栏 -->
            <div class="ph-topbar">
              <span class="ph-title">范文库</span>
              <span class="ph-filter">全部 ▾</span>
            </div>
            <!-- 筛选tab -->
            <div class="ph-tabs">
              <span class="ph-tab active">全部 30</span>
              <span class="ph-tab">已练 26</span>
              <span class="ph-tab">未练 4</span>
            </div>
            <!-- 双列网格 -->
            <div class="ph-grid">
              <div v-for="e in mockEssays.slice(0,6)" :key="e.id" class="ph-grid-card"
                :class="{ active: e.id === 'e2' }">
                <div class="ph-grid-title">{{ e.title }}</div>
                <div class="ph-grid-src">{{ e.source.split(' ').pop() }}</div>
                <span class="ph-grid-score" v-if="e.score" :style="{color: e.score>=80?'#22C55E':'#F59E0B'}">{{ e.score }}分</span>
                <span class="ph-grid-new" v-else>未练</span>
              </div>
            </div>
            <!-- 底部固定条 -->
            <div class="ph-bottom-bar">
              <div class="ph-bottom-btn" style="background:#22C55E">
                <span>📷 图片导入</span>
              </div>
              <div class="ph-bottom-btn" style="background:#374151" @click="scheme3Cal = !scheme3Cal">
                <span>📅 日历</span>
              </div>
            </div>
          </div>
        </div>
        <ul class="scheme-notes">
          <li>双列网格，封面感强，适合浏览挑选</li>
          <li>筛选 tab 快速切换 全部/已练/未练</li>
          <li>底部固定双按钮：图片导入 + 日历</li>
          <li>内容多时需滚动，但视觉层次清晰</li>
          <li>每张卡信息有限，需要点进去看详情</li>
        </ul>
      </div>
    </div>

    <div class="interaction-tip">
      <h3>💡 选择建议</h3>
      <p>
        · <strong>方案1</strong>：平衡型，卡片信息够 + FAB不占空间，适合 10-50 篇范文。<br>
        · <strong>方案2</strong>：效率型，信息密度最高，适合范文很多或常搜特定篇目。<br>
        · <strong>方案3</strong>：浏览型，视觉友好适合挑题，但双列信息量小，范文少时效果好。<br>
        三个方案都可加「左滑删除」「长按拖拽排序」等手势。
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const scheme1Cal = ref(false)
const scheme3Cal = ref(false)

const mockEssays = [
  { id: 'e1', title: '美国移民与国家构建', source: '考研英语一 2015 翻译', score: 85 },
  { id: 'e2', title: '人工智能的伦理困境', source: '考研英语一 2023 Text 4', score: null },
  { id: 'e3', title: '气候变化科学争议', source: '考研英语一 2022 Text 2', score: 72 },
  { id: 'e4', title: '莎士比亚文学批评', source: '考研英语一 2018 翻译', score: 91 },
  { id: 'e5', title: '量子计算的商业前景', source: '考研英语一 2024 Text 3', score: 68 },
]
</script>

<style scoped>
* { box-sizing: border-box; }

.preview-page {
  padding: 24px 20px;
  max-width: 1500px;
  margin: 0 auto;
  font-family: system-ui, -apple-system, 'Microsoft YaHei', sans-serif;
  background: #f0f2f5;
  min-height: 100vh;
}

.page-title {
  text-align: center;
  margin-bottom: 8px;
  color: #1e1e1e;
  font-weight: 600;
  font-size: 26px;
}

.page-desc {
  text-align: center;
  color: #555;
  margin-bottom: 30px;
  font-size: 14px;
  line-height: 1.6;
}

.schemes-row {
  display: flex;
  gap: 24px;
  justify-content: center;
  flex-wrap: wrap;
}

.scheme-column {
  flex: 1 1 300px;
  min-width: 340px;
  max-width: 400px;
  background: #ffffff;
  border-radius: 24px;
  padding: 20px 16px 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  transition: transform 0.15s;
}

.scheme-column:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
}

.scheme-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #eef2f6;
}

.badge {
  padding: 4px 10px;
  border-radius: 30px;
  font-size: 12px;
  font-weight: 600;
  color: white;
}

.badge.scheme1 { background: #409eff; }
.badge.scheme2 { background: #67c23a; }
.badge.scheme3 { background: #e6a23c; }

/* ===== 手机模拟框 ===== */
.mock-phone {
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
}

.phone-screen {
  width: 280px;
  height: 500px;
  border-radius: 28px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 0;
  box-shadow: 0 0 0 3px #333, 0 0 0 6px #1a1a1a, 0 12px 36px rgba(0,0,0,0.3);
  font-size: 12px;
  color: #e0e0e0;
}

/* ===== 方案1 ===== */
.ph-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 14px 8px;
}
.ph-title { font-size: 16px; font-weight: 700; color: #fff; }
.ph-count { font-size: 11px; color: #888; background: #374151; padding: 2px 8px; border-radius: 10px; }
.ph-actions { display: flex; gap: 8px; }
.ph-action-btn {
  width: 30px; height: 30px; border-radius: 15px; background: #374151;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; cursor: pointer; color: #fff;
}

.ph-search-row {
  display: flex; align-items: center; gap: 8px; padding: 4px 14px 8px;
}
.ph-search-box {
  flex:1; background: #2d2d3f; border-radius: 16px; padding: 6px 12px;
}
.ph-stats-mini {
  display: flex; gap: 8px; font-size: 11px; color: #aaa; white-space: nowrap;
}

.ph-stats-bar {
  display: flex; gap: 0; padding: 6px 10px; margin: 0 14px 4px;
  background: #2d2d3f; border-radius: 10px;
}
.ph-stat-item {
  flex:1; text-align: center; font-size: 10px; color: #888;
}
.ph-stat-item b { display: block; font-size: 14px; color: #e0e0e0; }

.ph-list {
  flex:1; overflow-y: auto; padding: 0 14px;
}
.ph-card {
  display: flex; align-items: center; padding: 10px 12px; margin: 4px 0;
  background: #2d2d3f; border-radius: 12px; cursor: pointer;
  transition: all 0.15s; border: 1px solid transparent;
}
.ph-card.active { border-color: #409eff; background: #1e2a3a; }
.ph-card-left { flex:1; min-width:0; }
.ph-card-title { font-size: 12px; font-weight: 600; color: #e0e0e0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ph-card-meta { font-size: 10px; color: #777; margin-top: 2px; }
.ph-card-right { margin-left: 8px; }
.ph-card-score { font-size: 18px; font-weight: 700; }
.ph-card-new { font-size: 10px; color: #409eff; background: #1a2a3a; padding: 2px 6px; border-radius: 6px; }

.ph-row {
  display: flex; align-items: center; padding: 8px 12px; margin: 1px 0;
  border-bottom: 1px solid #2d2d3f; cursor: pointer;
}
.ph-row-info { flex:1; min-width:0; }
.ph-row-title { font-size: 11px; font-weight: 500; color: #ddd; font-family: 'YouYuan', 'STYuanti', 'PingFang SC', sans-serif; }
.ph-row-src { font-size: 9px; color: #666; }
.ph-row-score { font-size: 14px; font-weight: 700; margin-left: 8px; }
.ph-row-new { font-size: 9px; color: #409eff; font-weight: 600; margin-left: 8px; }

/* 日历折叠 */
.ph-calendar-bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 14px; margin: 0 14px; font-size: 11px; color: #888;
  border-top: 1px solid #2d2d3f; cursor: pointer;
}
.ph-cal-dots { display: flex; gap: 4px; }
.cal-dot { width: 6px; height: 6px; border-radius: 3px; }

.ph-calendar-expand {
  padding: 6px 14px 10px; margin: 0 14px; text-align: center;
}
.cal-day { width: 16px; height: 16px; border-radius: 4px; display: inline-block; margin: 1px; }

.ph-calendar-strip {
  display: flex; align-items: center; padding: 8px 14px;
  border-top: 1px solid #2d2d3f; gap: 3px;
}
.cal-strip-dot { width: 8px; height: 8px; border-radius: 2px; }

/* FAB */
.ph-fab {
  position: absolute; bottom: 16px; right: 16px;
  width: 44px; height: 44px; border-radius: 22px;
  background: #22C55E; color: #fff; font-size: 20px;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 12px rgba(34,197,94,0.4); cursor: pointer;
}
.phone-screen { position: relative; }

/* ===== 方案3 网格 ===== */
.ph-filter { font-size: 11px; color: #888; }
.ph-tabs {
  display: flex; gap: 0; padding: 0 14px 6px;
}
.ph-tab {
  flex:1; text-align: center; font-size: 11px; color: #888;
  padding: 6px 0; border-bottom: 2px solid transparent; cursor: pointer;
}
.ph-tab.active { color: #409eff; border-bottom-color: #409eff; }

.ph-grid {
  flex:1; overflow-y: auto; padding: 0 14px;
  display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
}
.ph-grid-card {
  background: #2d2d3f; border-radius: 12px; padding: 12px 10px;
  cursor: pointer; border: 1px solid transparent; text-align: center;
}
.ph-grid-card.active { border-color: #409eff; }
.ph-grid-title { font-size: 11px; font-weight: 600; color: #ddd; }
.ph-grid-src { font-size: 9px; color: #666; margin-top: 4px; }
.ph-grid-score { font-size: 20px; font-weight: 700; display: block; margin-top: 6px; }
.ph-grid-new { font-size: 10px; color: #888; display: block; margin-top: 6px; }

.ph-bottom-bar {
  display: flex; gap: 8px; padding: 8px 14px;
  border-top: 1px solid #2d2d3f;
}
.ph-bottom-btn {
  flex:1; text-align: center; padding: 10px 0; border-radius: 10px;
  font-size: 12px; color: #fff; cursor: pointer;
}

/* ===== 方案说明 ===== */
.scheme-notes {
  margin: 12px 0 0;
  padding-left: 20px;
  color: #666;
  font-size: 13px;
  line-height: 1.6;
}

/* ===== 底部建议 ===== */
.interaction-tip {
  margin-top: 36px;
  background: #e6f7ff;
  border-radius: 20px;
  padding: 20px 28px;
  border-left: 6px solid #1890ff;
}
.interaction-tip h3 { margin: 0 0 8px; color: #1e1e1e; }
.interaction-tip p { margin: 0; color: #333; line-height: 1.6; }
</style>
