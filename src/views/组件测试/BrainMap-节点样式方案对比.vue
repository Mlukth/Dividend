<template>
  <div class="preview-page">
    <h2 class="page-title">🧠 脑图节点样式 — 方案对比</h2>
    <p class="page-desc">
      同一组数据（3条计划链 + 分支节点），3种视觉方案。<br>
      覆盖全部6种状态：计划pending / 游标激活 / 计划done / 计划failed / action执行 / action done
    </p>

    <div class="schemes-row">
      <!-- ===== 方案A：圆形节点 ===== -->
      <div class="scheme-column">
        <div class="scheme-label">
          <span class="badge s1">方案 A</span>
          <strong>圆形节点 · 紧凑排列</strong>
        </div>
        <div class="mock-area">
          <!-- 主链 -->
          <div class="a-chain">
            <div class="a-node root">✓<br>会话</div>
            <span class="a-arrow">→</span>
            <!-- 计划链1 pending -->
            <div class="a-node plan-pending">⏳<br>审计弹窗</div>
            <span class="a-arrow">→</span>
            <!-- 计划链1 active 游标 -->
            <div class="a-node plan-active">
              ▶<br>泳道渲染
              <div class="a-cursor"></div>
            </div>
            <span class="a-arrow">→</span>
            <!-- 计划链1 done -->
            <div class="a-node plan-done">✓<br>倒计时</div>
          </div>
          <!-- 支链 -->
          <div class="a-branch">
            <span class="a-branch-arrow">└→</span>
            <div class="a-node action-active">🔵<br>Read文档</div>
            <span style="color:#58a6ff;font-size:14px">→</span>
            <div class="a-node action-done">✓<br>Write代码</div>
            <span style="color:#f85149;font-size:14px">→</span>
            <div class="a-node action-failed">✗<br>方案A失败</div>
          </div>
        </div>
        <ul class="notes">
          <li>圆形，链式排列，箭头连接</li>
          <li>分支从主链下方伸出</li>
          <li>紧凑，适合大量节点</li>
          <li>当前实现方式</li>
        </ul>
      </div>

      <!-- ===== 方案B：卡片式 ===== -->
      <div class="scheme-column">
        <div class="scheme-label">
          <span class="badge s2">方案 B</span>
          <strong>卡片式 · 信息丰富</strong>
        </div>
        <div class="mock-area" style="background:#0d1117;padding:16px;border-radius:12px">
          <!-- 主链 -->
          <div style="display:flex;align-items:flex-start;gap:0;overflow-x:auto">
            <div class="b-card root-card">
              <div class="b-card-status">✓</div>
              <div class="b-card-title">会话开始</div>
              <div class="b-card-meta">root</div>
            </div>
            <div style="color:#58a6ff;padding:0 4px;align-self:center;font-size:14px">→</div>
            <div class="b-card plan-pending-card">
              <div class="b-card-status">⏳</div>
              <div class="b-card-title">审计弹窗</div>
              <div class="b-card-meta">计划 · 待执行</div>
              <div class="b-card-note">PreToolUse hook</div>
            </div>
            <div style="color:#58a6ff;padding:0 4px;align-self:center;font-size:14px">→</div>
            <div class="b-card plan-active-card">
              <div class="b-card-status selected">▶</div>
              <div class="b-card-title selected">泳道渲染</div>
              <div class="b-card-meta selected">游标 · 执行中</div>
              <div class="b-card-bar"></div>
            </div>
            <div style="color:#58a6ff;padding:0 4px;align-self:center;font-size:14px">→</div>
            <div class="b-card plan-done-card">
              <div class="b-card-status">✓</div>
              <div class="b-card-title">倒计时</div>
              <div class="b-card-meta">计划 · 已完成</div>
            </div>
          </div>
          <!-- 分支卡片 -->
          <div style="display:flex;gap:8px;margin-top:8px;margin-left:40px;padding:8px;border-left:2px dashed #58a6ff55">
            <div class="b-card action-card">
              <div class="b-card-status">🔵</div>
              <div class="b-card-title">Read文档</div>
              <div class="b-card-meta">执行中</div>
            </div>
            <div class="b-card action-done-card">
              <div class="b-card-status">✓</div>
              <div class="b-card-title">Write代码</div>
              <div class="b-card-meta">已完成</div>
            </div>
            <div class="b-card action-failed-card">
              <div class="b-card-status">✗</div>
              <div class="b-card-title">方案A失败</div>
              <div class="b-card-meta">失败</div>
            </div>
          </div>
        </div>
        <ul class="notes">
          <li>卡片矩形，显示更多信息</li>
          <li>当前节点有脉冲进度条</li>
          <li>空间稍大，信息密度高</li>
          <li>适合需要看备注/成功标准的场景</li>
        </ul>
      </div>

      <!-- ===== 方案C：时间轴式 ===== -->
      <div class="scheme-column">
        <div class="scheme-label">
          <span class="badge s3">方案 C</span>
          <strong>时间轴式 · 纵向延展</strong>
        </div>
        <div class="mock-area" style="background:#0d1117;padding:16px;border-radius:12px;overflow-x:auto">
          <!-- 链1 -->
          <div style="margin-bottom:14px">
            <div class="c-lane-label">泳道渲染</div>
            <div class="c-timeline">
              <div class="c-item">
                <div class="c-dot root-dot"></div>
                <div class="c-content">
                  <div class="c-name">会话开始</div>
                  <div class="c-badge done">已完成</div>
                </div>
              </div>
              <div class="c-item">
                <div class="c-dot active-ring"></div>
                <div class="c-content">
                  <div class="c-name" style="color:#fff;font-weight:700">▶ 审计弹窗</div>
                  <div class="c-badge active">游标</div>
                  <div class="c-sub">备注: PreToolUse hook拦截graph请求</div>
                  <div class="c-sub">标准: 弹窗可确认/拒绝</div>
                </div>
              </div>
              <div class="c-item" style="margin-left:30px">
                <div class="c-dot branch-dot"></div>
                <div class="c-content">
                  <div class="c-name">Read hook文档</div>
                  <div class="c-badge active">执行中</div>
                </div>
              </div>
              <div class="c-item">
                <div class="c-dot done-dot"></div>
                <div class="c-content">
                  <div class="c-name">泳道渲染</div>
                  <div class="c-badge done">已完成</div>
                </div>
              </div>
            </div>
          </div>
          <!-- 链2折叠 -->
          <div style="margin-bottom:8px">
            <div class="c-lane-label" style="color:#8b949e">倒计时 · 待做</div>
            <div class="c-collapsed">⏳ 倒计时自动递进 — 60秒后自动开始</div>
          </div>
          <!-- 链3折叠 -->
          <div>
            <div class="c-lane-label" style="color:#8b949e">修复Bug · 待做</div>
            <div class="c-collapsed">⏳ 修复action显示 + 灰色节点变色</div>
          </div>
        </div>
        <ul class="notes">
          <li>纵向时间轴，每条计划链独立泳道</li>
          <li>折叠/展开，干净清爽</li>
          <li>子节点内缩显示</li>
          <li>适合多条计划链同时展示</li>
        </ul>
      </div>
    </div>

    <!-- ===== D E F G ===== -->
    <div class="schemes-row" style="margin-top:24px">

      <!-- 方案D：连接线贯通式 -->
      <div class="scheme-column">
        <div class="scheme-label">
          <span class="badge s4">方案 D</span>
          <strong>连接线贯通式 · 主链粗线</strong>
        </div>
        <div class="mock-area" style="background:#0d1117;padding:20px 14px;border-radius:12px;overflow-x:auto">
          <div class="d-track">
            <!-- 主链线 -->
            <div class="d-mainline"></div>
            <!-- 节点在线上的位置 -->
            <div style="display:flex;align-items:center;gap:0;position:relative;z-index:1;justify-content:center">
              <div class="d-node root-d">
                <div class="d-inner">会话</div>
              </div>
              <div style="width:30px;height:4px;background:#58a6ff;flex-shrink:0"></div>
              <div class="d-node plan-pending">
                <div class="d-inner">⏳<br>审计</div>
              </div>
              <div style="width:30px;height:4px;background:#58a6ff;flex-shrink:0"></div>
              <div class="d-node plan-active" style="box-shadow:0 0 20px rgba(250,200,88,.4)">
                <div class="d-inner"><span class="d-cursor">●</span>泳道</div>
              </div>
              <div style="width:30px;height:4px;background:#444c56;flex-shrink:0"></div>
              <div class="d-node plan-done">
                <div class="d-inner">✓<br>倒计时</div>
              </div>
            </div>
          </div>
          <div style="margin-top:10px;padding-left:20px;display:flex;gap:12px;flex-wrap:wrap">
            <div class="d-node action-d" style="width:56px;height:56px;font-size:9px">
              <div class="d-inner">Read</div>
            </div>
            <span style="color:#58a6ff;align-self:center;font-size:14px">→</span>
            <div class="d-node action-d-done" style="width:52px;height:52px;font-size:8px">
              <div class="d-inner">Write</div>
            </div>
          </div>
        </div>
        <ul class="notes">
          <li>主链上一条粗连接线贯穿</li>
          <li>圆形节点浮在连接线上</li>
          <li>计划节点更大，action节点更小</li>
          <li>游标节点有光晕</li>
        </ul>
      </div>

      <!-- 方案E：珠链式 -->
      <div class="scheme-column">
        <div class="scheme-label">
          <span class="badge s5">方案 E</span>
          <strong>珠链式 · 大珠小珠串一线</strong>
        </div>
        <div class="mock-area" style="background:#0d1117;padding:20px 14px;border-radius:12px;overflow-x:auto">
          <div class="e-chain">
            <!-- 一根细线从头到尾 -->
            <svg style="position:absolute;top:50%;left:0;width:100%;height:4px;overflow:visible" class="e-svg">
              <line x1="25" y1="2" x2="310" y2="2" stroke="#30363d" stroke-width="2" stroke-dasharray="8,4"/>
            </svg>
            <div style="display:flex;align-items:center;gap:6px;position:relative">
              <div class="e-bead root-bead">会话</div>
              <span class="e-spacer">—</span>
              <div class="e-bead plan-pending-bead">审计</div>
              <span class="e-spacer">—</span>
              <!-- active 大珠 -->
              <div class="e-bead-big">
                <div class="e-big-inner">▶ 泳道</div>
                <div class="e-big-ring"></div>
              </div>
              <span class="e-spacer">—</span>
              <div class="e-bead plan-done-bead">✓</div>
            </div>
          </div>
          <div style="margin-top:14px;display:flex;gap:8px;padding-left:30px;flex-wrap:wrap">
            <div class="e-bead action-bead">Read</div>
            <div class="e-bead action-done-bead">Write</div>
            <div class="e-bead action-failed-bead">✗ 方案A</div>
          </div>
        </div>
        <ul class="notes">
          <li>细线串起圆形"珠子"</li>
          <li>计划节点=大珠，action=小珠</li>
          <li>游标节点=带光环的大珠</li>
          <li>done=小半透明珠</li>
        </ul>
      </div>

      <!-- 方案F：双环式 -->
      <div class="scheme-column">
        <div class="scheme-label">
          <span class="badge s6">方案 F</span>
          <strong>双环式 · 内环状态外环类型</strong>
        </div>
        <div class="mock-area" style="background:#0d1117;padding:20px 14px;border-radius:12px;overflow-x:auto">
          <div style="display:flex;align-items:flex-start;gap:0;flex-wrap:wrap">
            <!-- 根 -->
            <div style="display:flex;align-items:center">
              <div class="f-node">
                <div class="f-outer root-outer"></div>
                <div class="f-inner root-inner">会话</div>
              </div>
              <span class="f-link">━━</span>
            </div>
            <!-- plan-pending -->
            <div style="display:flex;align-items:center">
              <div class="f-node">
                <div class="f-outer plan-outer"></div>
                <div class="f-inner plan-inner">⏳ 审计</div>
              </div>
              <span class="f-link">━━</span>
            </div>
            <!-- plan-active -->
            <div style="display:flex;align-items:center">
              <div class="f-node f-active">
                <div class="f-outer active-outer"></div>
                <div class="f-inner active-inner">泳道</div>
                <div class="f-ping"></div>
              </div>
              <span class="f-link">━━</span>
            </div>
            <!-- plan-done -->
            <div style="display:flex;align-items:center">
              <div class="f-node">
                <div class="f-outer done-outer"></div>
                <div class="f-inner done-inner">✓ 倒计时</div>
              </div>
            </div>
          </div>
          <div style="display:flex;gap:10px;margin-top:10px;padding-left:30px">
            <div class="f-node" style="width:60px;height:60px">
              <div class="f-outer action-outer"></div>
              <div class="f-inner action-inner">Read</div>
            </div>
            <div class="f-node" style="width:56px;height:56px;opacity:.5">
              <div class="f-outer done-outer"></div>
              <div class="f-inner done-inner">Write</div>
            </div>
          </div>
        </div>
        <ul class="notes">
          <li>内外双环结构</li>
          <li>外环=类型(计划/action/root)</li>
          <li>内环=状态(pending/active/done)</li>
          <li>active节点有脉冲波纹</li>
        </ul>
      </div>
    </div>

    <!-- G H I -->
    <div class="schemes-row" style="margin-top:24px">

      <!-- 方案G：轨道式 -->
      <div class="scheme-column">
        <div class="scheme-label">
          <span class="badge s7">方案 G</span>
          <strong>轨道式 · 水平轨+垂直分支</strong>
        </div>
        <div class="mock-area" style="background:#0d1117;padding:20px 14px;border-radius:12px">
          <div class="g-railway">
            <!-- 水平轨道 -->
            <div class="g-rail"></div>
            <div style="display:flex;align-items:center;gap:0;position:relative;z-index:1">
              <div class="g-station root-st">
                <div class="g-st-dot"></div>
                <div class="g-st-label">会话</div>
              </div>
              <div class="g-rail-seg"></div>
              <div class="g-station plan-st">
                <div class="g-st-dot"></div>
                <div class="g-st-label">审计</div>
              </div>
              <div class="g-rail-seg active"></div>
              <div class="g-station plan-active-st">
                <div class="g-st-dot" style="animation: gPulse 1s infinite"></div>
                <div class="g-st-label" style="color:#fac858;font-weight:900">▶ 泳道</div>
              </div>
              <div class="g-rail-seg"></div>
              <div class="g-station plan-done-st">
                <div class="g-st-dot done"></div>
                <div class="g-st-label">倒计时</div>
              </div>
            </div>
          </div>
          <div style="margin-top:6px;padding-left:100px;display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <div class="g-spur">├</div>
            <div class="g-station action-st" style="width:auto;gap:4px">
              <div class="g-st-dot" style="width:10px;height:10px"></div>
              <div class="g-st-label" style="font-size:9px">Read</div>
            </div>
            <div class="g-station action-done-st" style="width:auto;gap:4px;opacity:.5">
              <div class="g-st-dot done" style="width:8px;height:8px"></div>
              <div class="g-st-label" style="font-size:9px">Write</div>
            </div>
          </div>
        </div>
        <ul class="notes">
          <li>水平轨道 + 节点像地铁站</li>
          <li>活跃段轨道亮色，done段暗色</li>
          <li>分支从站点下方伸出</li>
          <li>空间利用好，垂直省空间</li>
        </ul>
      </div>

      <!-- 方案H：极简圆点 -->
      <div class="scheme-column">
        <div class="scheme-label">
          <span class="badge s8">方案 H</span>
          <strong>极简圆点 · 线性指示</strong>
        </div>
        <div class="mock-area" style="background:#0d1117;padding:20px 14px;border-radius:12px">
          <div class="h-line">
            <!-- 一条进度条式主线 -->
            <div class="h-bar">
              <div class="h-progress" style="width:55%"></div>
            </div>
            <div class="h-dots">
              <div class="h-dot done" title="会话开始"></div>
              <div class="h-dot-sep"></div>
              <div class="h-dot done" title="审计弹窗"></div>
              <div class="h-dot-sep"></div>
              <!-- active游标 -->
              <div class="h-dot active">
                <div class="h-label below" style="color:#fac858;font-weight:700">泳道渲染</div>
              </div>
              <div class="h-dot-sep future"></div>
              <div class="h-dot future" title="倒计时推进"></div>
            </div>
          </div>
          <div style="margin-top:20px;display:flex;gap:14px;padding-left:20px">
            <div class="h-dot branch"></div>
            <span style="font-size:9px;color:#7ee787;align-self:center">Read hook</span>
            <div class="h-dot branch done"></div>
            <span style="font-size:9px;color:#555;align-self:center">Write代码</span>
          </div>
        </div>
        <ul class="notes">
          <li>最简方案，进度条+圆点</li>
          <li>主链=进度条；游标=大亮点</li>
          <li>分支=小圆点+标签</li>
          <li>信息密度最低，最快的扫一眼</li>
        </ul>
      </div>

      <!-- 方案I：节点卡片混合 -->
      <div class="scheme-column">
        <div class="scheme-label">
          <span class="badge s9">方案 I</span>
          <strong>圆形主节点 · 悬浮信息卡</strong>
        </div>
        <div class="mock-area" style="background:#0d1117;padding:20px 14px;border-radius:12px">
          <div style="display:flex;align-items:center;gap:0;flex-wrap:wrap">
            <div class="i-node root-i">
              <div class="i-circle">会话</div>
            </div>
            <span class="i-arrow">→</span>
            <div class="i-node" style="border-style:dashed;border-color:#555;opacity:.7">
              <div class="i-circle">审计</div>
              <div class="i-badge">计划</div>
            </div>
            <span class="i-arrow" style="color:#fac858">→</span>
            <!-- active -->
            <div class="i-node i-active">
              <div class="i-circle" style="background:linear-gradient(135deg,#4169e1,#2d5aa0);border-color:#fac858;box-shadow:0 0 18px rgba(250,200,88,.3)">泳道</div>
              <div class="i-float">
                <div class="i-float-title">▶ 泳道渲染</div>
                <div class="i-float-body">备注: planRoots→多行水平链式布局<br>成功标准: 3链独立泳道</div>
              </div>
            </div>
            <span class="i-arrow">→</span>
            <div class="i-node">
              <div class="i-circle" style="opacity:.5">✓</div>
              <div class="i-badge">完成</div>
            </div>
          </div>
        </div>
        <ul class="notes">
          <li>圆形节点 + hover悬浮卡片</li>
          <li>active节点有浮窗显示详情</li>
          <li>备注/成功标准自动展示</li>
          <li>信息最丰富，扫一眼即可</li>
        </ul>
      </div>
    </div>

    <!-- 颜色对照表 -->
    <div class="color-table-section" style="margin-top:32px">
      <h3>🎨 全部方案共用颜色体系</h3>
      <div class="color-grid">
        <div class="color-card" v-for="c in colors" :key="c.name">
          <div class="color-swatch" :style="{background:c.bg,border:c.border}"></div>
          <div><strong>{{ c.name }}</strong><br><span class="color-desc">{{ c.desc }}</span></div>
        </div>
      </div>
    </div>

    <div class="interaction-tip">
      <h3>💡 选型建议</h3>
      <p>
        · <strong>方案A</strong>：最紧凑，已实现。适合监控视角只看进度。<br>
        · <strong>方案B</strong>：信息最丰富，适合需要看备注/成功标准。<br>
        · <strong>方案C</strong>：泳道最清晰，多条链并行时最直观，但纵向占比大。<br>
        建议：选C为主方案（泳道直觉最强），A作为备选紧凑模式。
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const selected = ref('A')
const colors = [
  { name:'计划pending', desc:'#444 灰色虚线', bg:'#4442', border:'2px dashed #666' },
  { name:'游标激活', desc:'任务线色 + 黄框', bg:'#5470c6cc', border:'3px solid #fac858' },
  { name:'计划done', desc:'任务线色半透', bg:'#5470c644', border:'2px solid #5470c666' },
  { name:'计划failed', desc:'红框', bg:'#ee666644', border:'3px solid #f85149' },
  { name:'action执行', desc:'彩色+白边框', bg:'#5470c6cc', border:'2px solid #fff' },
  { name:'action done', desc:'彩色半透', bg:'#5470c644', border:'1px solid #8884' },
]
</script>

<style scoped>
*{box-sizing:border-box}
.preview-page{padding:24px 20px;max-width:1500px;margin:0 auto;font-family:system-ui,'Microsoft YaHei',sans-serif;background:#f0f2f5;min-height:100vh}
.page-title{text-align:center;margin-bottom:8px;color:#1e1e1e;font-weight:600;font-size:24px}
.page-desc{text-align:center;color:#555;margin-bottom:24px;font-size:13px;line-height:1.6}
.schemes-row{display:flex;gap:24px;justify-content:center;flex-wrap:wrap}
.scheme-column{flex:1 1 300px;min-width:340px;max-width:440px;background:#fff;border-radius:24px;padding:20px 16px 24px;box-shadow:0 8px 24px rgba(0,0,0,.06);display:flex;flex-direction:column}
.scheme-column:hover{transform:translateY(-3px);box-shadow:0 12px 32px rgba(0,0,0,.1);transition:.15s}
.scheme-label{display:flex;align-items:center;gap:8px;margin-bottom:12px;padding-bottom:10px;border-bottom:2px solid #eef2f6}
.badge{padding:4px 10px;border-radius:30px;font-size:12px;font-weight:600;color:#fff}
.badge.s1{background:#409eff}.badge.s2{background:#67c23a}.badge.s3{background:#e6a23c}
.mock-area{background:#1a1a2e;border-radius:16px;padding:16px 12px;min-height:120px}
.notes{margin:12px 0 0;padding-left:20px;color:#666;font-size:13px;line-height:1.6}

/* === 方案A: 圆形 === */
.a-chain{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:8px}
.a-node{width:64px;height:64px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:10px;font-weight:bold;text-align:center;line-height:1.2;position:relative;color:#ddd;transition:all .2s}
.a-node.root{background:#8883;border:2px solid #8886}
.a-node.plan-pending{background:#4442;border:2px dashed #666;color:#999}
.a-node.plan-active{background:#5470c6cc;border:3px solid #fac858;color:#fff;box-shadow:0 0 12px rgba(250,200,88,.4);width:72px;height:72px}
.a-node.plan-done{background:#5470c644;border:2px solid #5470c666;color:#bbb;opacity:.6}
.a-node.action-active{background:#5470c6cc;border:2px solid #fff;width:56px;height:56px;font-size:9px}
.a-node.action-done{background:#5470c644;border:1px solid #8884;color:#aaa;opacity:.5;width:56px;height:56px;font-size:9px}
.a-node.action-failed{background:#ee666644;border:2px solid #f85149;color:#faa;width:56px;height:56px;font-size:9px}
.a-arrow{color:#555;font-size:18px;font-weight:bold}
.a-cursor{position:absolute;top:-4px;right:-4px;width:10px;height:10px;border-radius:50%;background:#fac858;border:1px solid #fff;animation:pulse 1s infinite}
.a-branch{display:flex;align-items:center;gap:6px;padding-left:40px;flex-wrap:wrap}
.a-branch-arrow{color:#58a6ff;font-size:14px;font-family:monospace}

@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(250,200,88,.6)}50%{box-shadow:0 0 0 6px rgba(250,200,88,0)}}

/* === 方案B: 卡片 === */
.b-card{background:#161b22;border:1px solid #30363d;border-radius:10px;padding:10px 14px;min-width:100px;position:relative;flex-shrink:0}
.b-card-status{font-size:16px;margin-bottom:2px}
.b-card-title{font-size:12px;font-weight:700;color:#e0e0e0;margin-bottom:2px}
.b-card-meta{font-size:9px;color:#8b949e}
.b-card-note{font-size:8px;color:#666;margin-top:4px;padding-top:4px;border-top:1px solid #30363d;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.b-card-bar{position:absolute;bottom:0;left:0;height:3px;background:#fac858;border-radius:0 0 10px 10px;animation:barGlow 1.5s ease-in-out infinite;width:100%}
@keyframes barGlow{0%,100%{opacity:.6}50%{opacity:1}}
.root-card .b-card-title{color:#888}
.plan-pending-card{border-style:dashed;border-color:#555;opacity:.7}
.plan-pending-card .b-card-title{color:#999}
.plan-active-card{border-color:#fac858;border-width:2px;background:#1a1f2e}
.plan-active-card .selected{color:#fff}
.plan-done-card{opacity:.5}
.plan-done-card .b-card-title{text-decoration:line-through}
.action-card .b-card-title{color:#91cc75}
.action-done-card{opacity:.4}
.action-failed-card{border-color:#f85149;background:#1f1515}
.action-failed-card .b-card-title{color:#faa}

/* === 方案C: 时间轴 === */
.c-lane-label{font-size:11px;font-weight:700;color:#e0e0e0;margin-bottom:6px;padding:4px 10px;background:#1c2128;border-radius:6px;display:inline-block}
.c-timeline{position:relative;padding-left:16px}
.c-timeline::before{content:'';position:absolute;left:8px;top:0;bottom:0;width:2px;background:#30363d}
.c-item{display:flex;align-items:flex-start;gap:10px;margin-bottom:8px;position:relative}
.c-dot{width:14px;height:14px;border-radius:50%;flex-shrink:0;position:relative;z-index:1;margin-top:4px}
.c-dot.root-dot{background:#888;border:2px solid #ccc}
.c-dot.active-ring{background:#5470c6;border:3px solid #fac858;box-shadow:0 0 8px rgba(250,200,88,.6);animation:pulse 1s infinite}
.c-dot.done-dot{background:#5470c666;border:2px solid #5470c688}
.c-dot.branch-dot{background:#91cc7588;border:1px solid #91cc75;width:10px;height:10px;margin-top:6px}
.c-content{flex:1}
.c-name{font-size:12px;color:#ddd;margin-bottom:2px}
.c-badge{display:inline-block;padding:1px 6px;border-radius:4px;font-size:8px;color:#fff}
.c-badge.done{background:#238636}.c-badge.active{background:#409eff}
.c-sub{font-size:9px;color:#8b949e;margin-top:2px}
.c-collapsed{padding:8px 12px;background:#1c2128;border-radius:8px;font-size:11px;color:#8b949e;border:1px dashed #30363d}

/* 颜色表 */
.color-table-section{margin-top:32px;background:#fff;border-radius:24px;padding:24px;box-shadow:0 8px 24px rgba(0,0,0,.06)}
.color-table-section h3{margin-bottom:16px;color:#1e1e1e}
.color-grid{display:flex;gap:16px;flex-wrap:wrap}
.color-card{display:flex;align-items:center;gap:10px;padding:10px 16px;background:#f8f9fa;border-radius:12px}
.color-swatch{width:36px;height:36px;border-radius:50%;flex-shrink:0}
.color-desc{font-size:11px;color:#888}
.interaction-tip{margin-top:32px;background:#e6f7ff;border-radius:20px;padding:20px 28px;border-left:6px solid #1890ff}
.interaction-tip h3{margin:0 0 8px;color:#1e1e1e}
.interaction-tip p{margin:0;color:#333;line-height:1.6}

/* === D: 连接线贯通式 === */
.d-track{position:relative;padding:12px 0}
.d-mainline{position:absolute;top:50%;left:0;right:0;height:4px;background:linear-gradient(90deg,#58a6ff,#58a6ff 60%,#444c56 60%,#444c56);border-radius:2px}
.d-node{width:70px;height:70px;border-radius:50%;display:flex;align-items:center;justify-content:center;position:relative;flex-shrink:0}
.d-node.root-d{background:linear-gradient(135deg,#2d333b,#22272e);border:2px solid #444c56}
.d-node.plan-pending{background:linear-gradient(135deg,#1c2128,#1a1e24);border:2px dashed #444c56;opacity:.8}
.d-node.plan-active{background:linear-gradient(135deg,#2d3c5a,#1e2d4a);border:3px solid #fac858;width:82px;height:82px}
.d-node.plan-done{background:linear-gradient(135deg,#1a2a1a,#1a241a);border:2px solid #2d4a2d;opacity:.55}
.d-inner{color:#e0e0e0;font-size:10px;font-weight:700;text-align:center;line-height:1.3}
.d-cursor{color:#fac858;font-size:14px}
.d-node.action-d{background:linear-gradient(135deg,#1a3a2a,#1a3322);border:2px solid #3fb950}
.d-node.action-d-done{background:linear-gradient(135deg,#1a222a,#1a1e24);border:2px solid #2d3a2d;opacity:.5}

/* === E: 珠链式 === */
.e-chain{position:relative;padding:10px 0}
.e-bead{width:52px;height:52px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#e0e0e0;text-align:center;flex-shrink:0}
.e-bead.root-bead{background:#2d333b;border:2px solid #444c56;width:48px;height:48px}
.e-bead.plan-pending-bead{background:#1c2128;border:2px dashed #555;opacity:.8}
.e-bead.plan-done-bead{background:#1a2a1a;border:2px solid #2d4a2d;opacity:.5;width:40px;height:40px;font-size:14px}
.e-bead-big{width:74px;height:74px;border-radius:50%;display:flex;align-items:center;justify-content:center;position:relative;background:linear-gradient(135deg,#2d3c5a,#1e2d4a);border:3px solid #fac858;flex-shrink:0}
.e-big-inner{color:#fff;font-size:10px;font-weight:800;z-index:1;text-align:center}
.e-big-ring{position:absolute;inset:-6px;border-radius:50%;border:2px solid rgba(250,200,88,.4);animation:eRingPulse 2s infinite}
@keyframes eRingPulse{0%,100%{transform:scale(1);opacity:.4}50%{transform:scale(1.15);opacity:.8}}
.e-bead.action-bead{background:#1a3a2a;border:2px solid #3fb950;width:44px;height:44px;font-size:8px}
.e-bead.action-done-bead{background:#1a222a;border:1px solid #2d3a2d;opacity:.4;width:40px;height:40px;font-size:8px}
.e-bead.action-failed-bead{background:#2d1a1a;border:2px solid #f85149;color:#faa;width:44px;height:44px;font-size:8px}
.e-spacer{color:#30363d;font-size:14px;flex-shrink:0}

/* === F: 双环式 === */
.f-node{width:76px;height:76px;border-radius:50%;position:relative;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.f-outer{position:absolute;inset:0;border-radius:50%;transition:all .3s}
.f-outer.root-outer{border:3px solid #444c56}
.f-outer.plan-outer{border:3px dashed #555}
.f-outer.active-outer{border:4px solid #fac858;animation:fRotate 4s linear infinite}
@keyframes fRotate{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
.f-outer.done-outer{border:3px solid #2d4a2d;opacity:.5}
.f-outer.action-outer{border:2px solid #3fb950}
.f-inner{width:52px;height:52px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;text-align:center;z-index:1}
.f-inner.root-inner{background:#2d333b;color:#768390}
.f-inner.plan-inner{background:#1c2128;color:#999}
.f-inner.active-inner{background:linear-gradient(135deg,#2d3c5a,#1e2d4a);color:#fff;font-size:11px;font-weight:900}
.f-inner.done-inner{background:#1a2a1a;color:#768390;font-size:9px}
.f-inner.action-inner{background:#1a3a2a;color:#7ee787}
.f-active .f-ping{position:absolute;inset:-8px;border-radius:50%;border:2px solid rgba(250,200,88,.3);animation:fPing 1.5s ease-out infinite}
@keyframes fPing{0%{transform:scale(.9);opacity:.8}100%{transform:scale(1.3);opacity:0}}
.f-link{color:#30363d;font-size:14px;padding:0 4px;flex-shrink:0;align-self:center}

/* === G: 轨道式 === */
.g-railway{position:relative;padding:14px 0}
.g-rail{position:absolute;top:50%;left:0;right:0;height:2px;background:#30363d;border-radius:1px}
.g-station{display:flex;flex-direction:column;align-items:center;gap:4px;flex-shrink:0}
.g-st-dot{width:14px;height:14px;border-radius:50%;background:#444c56;border:2px solid #30363d;z-index:1}
.g-st-dot.done{background:#2d4a2d;border-color:#238636}
.g-st-label{font-size:10px;font-weight:600;color:#8b949e;text-align:center;max-width:60px;line-height:1.2}
.g-rail-seg{width:24px;height:3px;background:#30363d;flex-shrink:0}
.g-rail-seg.active{background:#58a6ff}
.g-spur{color:#58a6ff;font-size:20px;font-family:monospace}
@keyframes gPulse{0%,100%{box-shadow:0 0 0 0 rgba(250,200,88,.6)}50%{box-shadow:0 0 0 8px rgba(250,200,88,0)}}

/* === H: 极简圆点 === */
.h-line{position:relative;padding:10px 0}
.h-bar{height:3px;background:#21262d;border-radius:2px;position:relative}
.h-progress{height:100%;background:linear-gradient(90deg,#58a6ff,#3fb950);border-radius:2px;transition:width .5s}
.h-dots{display:flex;align-items:center;gap:0;margin-top:-12px;position:relative;z-index:1}
.h-dot{width:20px;height:20px;border-radius:50%;background:#2d333b;border:2px solid #444c56;flex-shrink:0;position:relative}
.h-dot.done{background:#2d4a2d;border-color:#238636;width:16px;height:16px}
.h-dot.active{background:#2d3c5a;border-color:#fac858;width:28px;height:28px;box-shadow:0 0 14px rgba(250,200,88,.4)}
.h-dot.future{background:#1c2128;border-color:#333;width:14px;height:14px;opacity:.5}
.h-dot.branch{width:12px;height:12px;background:#1a3a2a;border:1px solid #3fb950}
.h-dot.branch.done{background:#1a2a1a;border-color:#2d4a2d;opacity:.5}
.h-dot-sep{width:28px;height:2px;background:#30363d;flex-shrink:0}
.h-dot-sep.future{background:#1c2128}
.h-label{position:absolute;top:24px;left:50%;transform:translateX(-50%);white-space:nowrap;font-size:9px;font-weight:600;color:#8b949e}
.h-label.below{font-size:10px}

/* === I: 圆形主节点+悬浮信息卡 === */
.i-node{position:relative;flex-shrink:0;display:flex;flex-direction:column;align-items:center;gap:2px}
.i-circle{width:64px;height:64px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#e0e0e0;text-align:center;background:linear-gradient(135deg,#2d333b,#22272e);border:2px solid #444c56}
.i-active .i-circle{border-color:#fac858;width:78px;height:78px;font-size:12px}
.i-badge{padding:1px 6px;border-radius:6px;font-size:7px;font-weight:600;background:#444c56;color:#8b949e}
.i-arrow{color:#30363d;font-size:18px;font-weight:bold;padding:0 4px;flex-shrink:0;align-self:center}
.i-float{position:absolute;top:-60px;left:50%;transform:translateX(-50%);background:#161b22;border:1px solid #fac858;border-radius:8px;padding:8px 12px;min-width:180px;z-index:10;box-shadow:0 8px 24px rgba(0,0,0,.5);white-space:nowrap}
.i-float-title{font-size:10px;font-weight:700;color:#fac858;margin-bottom:4px}
.i-float-body{font-size:9px;color:#8b949e;line-height:1.4}

/* badges extra */
.badge.s4{background:#9a60b4}.badge.s5{background:#fc8452}.badge.s6{background:#8b5cf6}
.badge.s7{background:#0891b2}.badge.s8{background:#059669}.badge.s9{background:#d946ef}
</style>
