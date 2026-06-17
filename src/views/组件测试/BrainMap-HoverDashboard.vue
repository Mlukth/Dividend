<template>
  <div class="preview-page">
    <h2 class="page-title">脑图 Hover仪表盘 — 横向链式 + 悬浮attempts + 弹窗报告</h2>
    <p class="page-desc">
      模拟多CLI泳道。横向珠子链，hover goal 弹出 attempts 时间线面板，失败节点有警告标记。
    </p>

    <!-- ===== CLI-A 泳道 ===== -->
    <div class="swimlane">
      <div class="swimlane-bar">
        <span class="swimlane-dot" style="background:#5470c6"></span>
        <span class="swimlane-name">CLI-A · 脑图项目</span>
        <span class="swimlane-meta">8节点 | 链长8 | 2计划</span>
      </div>
      <div class="bead-chain">
        <template v-for="(goal, gi) in cliA.goals" :key="'a'+gi">
          <div class="chain-sep" v-if="gi > 0">→</div>
          <div class="goal-bead-wrap"
            @mouseenter="showHover($event, goal, 'cliA', gi)"
            @mouseleave="leaveBead">
            <div :class="['bead', 'goal-bead', goal.planMode ? 'plan-'+goal.status : goal.status]">
              <span class="bead-icon">{{ icon(goal.status) }}</span>
              <span class="bead-label">{{ goal.name }}</span>
            </div>
            <!-- attempt 计数徽章 -->
            <span v-if="goal.attempts && goal.attempts.length > 0" class="att-count"
              :class="goal.failedCount > 0 ? 'has-fail' : 'all-ok'">
              {{ goal.successCount }}/{{ goal.attempts.length }}
            </span>
            <!-- 失败警告点 -->
            <span v-if="goal.failedCount > 0" class="warn-dot" title="有失败方案">!</span>
          </div>
        </template>
      </div>
    </div>

    <!-- ===== CLI-B 泳道 ===== -->
    <div class="swimlane">
      <div class="swimlane-bar">
        <span class="swimlane-dot" style="background:#91cc75"></span>
        <span class="swimlane-name">CLI-B · 知识库项目</span>
        <span class="swimlane-meta">6节点 | 链长6 | 1计划</span>
      </div>
      <div class="bead-chain">
        <template v-for="(goal, gi) in cliB.goals" :key="'b'+gi">
          <div class="chain-sep" v-if="gi > 0">→</div>
          <div class="goal-bead-wrap"
            @mouseenter="showHover($event, goal, 'cliB', gi)"
            @mouseleave="leaveBead">
            <div :class="['bead', 'goal-bead', goal.planMode ? 'plan-'+goal.status : goal.status]">
              <span class="bead-icon">{{ icon(goal.status) }}</span>
              <span class="bead-label">{{ goal.name }}</span>
            </div>
            <span v-if="goal.attempts && goal.attempts.length > 0" class="att-count"
              :class="goal.failedCount > 0 ? 'has-fail' : 'all-ok'">
              {{ goal.successCount }}/{{ goal.attempts.length }}
            </span>
            <span v-if="goal.failedCount > 0" class="warn-dot">!</span>
          </div>
        </template>
      </div>
    </div>

    <!-- Hover 浮窗 -->
    <div v-if="hover.show" class="hover-panel" :style="{left:hover.x+'px',top:hover.y+'px'}"
      @mouseenter="enterPanel" @mouseleave="leavePanel">
      <div class="hp-header">
        <span :class="['hp-dot', hover.goal.status]"></span>
        <span class="hp-name">{{ hover.goal.name }}</span>
        <span class="hp-session">{{ hover.sessionLabel }}</span>
      </div>
      <div class="hp-body">
        <div v-if="hover.goal.fullText" class="hp-fulltext">{{ hover.goal.fullText }}</div>
        <div v-if="hover.goal.successCriteria" class="hp-criteria">🎯 {{ hover.goal.successCriteria }}</div>

        <!-- Attempts -->
        <div v-if="hover.goal.attempts && hover.goal.attempts.length > 0" class="hp-attempts">
          <div class="hp-section-title">
            尝试方案 ({{ hover.goal.successCount }}/{{ hover.goal.attempts.length }} 成功)
          </div>
          <div v-for="(att, ai) in hover.goal.attempts" :key="ai" class="hp-att-row">
            <span :class="['hp-att-dot', att.verdict]"></span>
            <span class="hp-att-label">#{{ ai+1 }}</span>
            <span class="hp-att-approach">{{ att.approach }}</span>
            <span :class="['hp-att-verdict', att.verdict]">
              {{ att.verdict === 'success' ? '✓' : att.verdict === 'failed' ? '✗' : '⋯' }}
            </span>
          </div>
        </div>

        <!-- 最终结果 -->
        <div v-if="hover.goal.finalResult" class="hp-result">
          {{ hover.goal.finalResult }}
        </div>
      </div>
      <div class="hp-footer">
        <button class="hp-btn" @click="openReport(hover.goal)">📋 完整报告</button>
      </div>
    </div>

    <!-- 报告弹窗 -->
    <div v-if="report.show" class="modal-overlay" @click.self="report.show=false">
      <div class="modal-box">
        <h3>{{ report.goal.name }} — 审计报告</h3>
        <div class="modal-section" v-if="report.goal.fullText">
          <div class="modal-label">目标</div>
          <div class="modal-text">{{ report.goal.fullText }}</div>
        </div>
        <div class="modal-section" v-if="report.goal.successCriteria">
          <div class="modal-label">成功标准</div>
          <div class="modal-text" style="color:#fac858">{{ report.goal.successCriteria }}</div>
        </div>
        <div class="modal-section" v-if="report.goal.attempts && report.goal.attempts.length > 0">
          <div class="modal-label">尝试记录</div>
          <div v-for="(att, ai) in report.goal.attempts" :key="ai" class="modal-attempt">
            <div class="modal-att-header">
              <span :class="['att-dot-modal', att.verdict]"></span>
              方案 {{ ai+1 }}: {{ att.approach }}
              <span :class="['att-verdict-modal', att.verdict]">
                {{ att.verdict === 'success' ? '✓ 成功' : att.verdict === 'failed' ? '✗ 失败' : '⋯ 待定' }}
              </span>
            </div>
            <div class="modal-att-time">{{ att.time }}</div>
            <div class="modal-att-steps" v-if="att.steps && att.steps.length > 0">
              <span v-for="(step, si) in att.steps" :key="si"
                :class="['step-chip', step.status]">{{ step.icon }} {{ step.name }}</span>
            </div>
            <div v-if="att.result" class="modal-att-result">{{ att.result }}</div>
          </div>
        </div>
        <div class="modal-section" v-if="report.goal.finalResult">
          <div class="modal-label">最终结果</div>
          <div class="modal-text" style="color:#3fb950">{{ report.goal.finalResult }}</div>
        </div>
        <div class="modal-btns">
          <button class="hp-btn" @click="report.show=false">关闭</button>
        </div>
      </div>
    </div>

    <!-- 图例 -->
    <div class="legend">
      <span class="legend-title">节点：</span>
      <span class="legend-item"><span class="bead goal-bead active" style="width:28px;height:28px;min-width:28px;min-height:28px;font-size:8px;display:inline-flex">▶</span> 进行中</span>
      <span class="legend-item"><span class="bead goal-bead done" style="width:28px;height:28px;min-width:28px;min-height:28px;font-size:8px;display:inline-flex">✓</span> 完成</span>
      <span class="legend-item"><span class="bead goal-bead plan-done" style="width:28px;height:28px;min-width:28px;min-height:28px;font-size:8px;display:inline-flex">✓</span> 计划完成</span>
      <span class="legend-item"><span class="bead goal-bead plan-pending" style="width:28px;height:28px;min-width:28px;min-height:28px;font-size:8px;display:inline-flex">⏳</span> 计划待定</span>
      <span class="legend-item"><span class="att-count all-ok" style="position:static">3/3</span> 全部成功</span>
      <span class="legend-item"><span class="att-count has-fail" style="position:static">1/3</span> 有失败</span>
      <span class="legend-item"><span class="warn-dot" style="position:static;margin:0">!</span> 失败警告</span>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

function icon(s) { return s === 'done' ? '✓' : s === 'failed' ? '✗' : s === 'active' ? '▶' : '⏳' }

// session A: 脑图项目
const cliA = reactive({ goals: makeGoalsA() })
function makeGoalsA() {
  const g = (name,full,status,planMode,attempts,final) => {
    const sc = attempts.filter(a=>a.verdict==='success').length
    const fc = attempts.filter(a=>a.verdict==='failed').length
    return { name,fullText:full,status,planMode,attempts,successCount:sc,failedCount:fc,finalResult:final }
  }
  return [
    g('讨论需求','讨论脑图v2.1多CLI架构', 'done', false,
      [], null),
    g('P0 修缮老图','修复chain+父节点+SessionEnd', 'done', true,
      [{approach:'方案A: cwd注册表',verdict:'failed',time:'16:10',steps:[],result:'❌ 同目录合并'},
       {approach:'方案B: 纯session_id',verdict:'success',time:'16:35',steps:[],result:'✅ 3窗口独立'}],
      '✅ session_id路由验证通过'),
    g('修hook-forwarder','Stop误触发/cleanup', 'done', false,
      [{approach:'直接删除cleanup调用',verdict:'success',time:'17:00',steps:[],result:'✅ 不再被误删'}],
      '✅ Stop不再清理session'),
    g('渲染方案讨论','ABCD方案+双视图切换', 'active', false,
      [{approach:'DashboardView组件',verdict:'pending',time:'18:30',steps:[],result:null}],
      null),
    g('P1 多泳道渲染','实现多session泳道+视图切换', 'pending', true,
      [], null),
    g('P2 交互增强','拖拽+试错栏+右键增强', 'pending', true,
      [], null),
    g('审计报告系统','📋按钮+result.finalReport', 'pending', false,
      [], null),
    g('性能优化','增量写入+虚拟滚动', 'pending', false,
      [], null),
  ]
}

// session B: 知识库项目
const cliB = reactive({ goals: makeGoalsB() })
function makeGoalsB() {
  const g = (name,full,status,planMode,attempts,final) => {
    const sc = attempts.filter(a=>a.verdict==='success').length
    const fc = attempts.filter(a=>a.verdict==='failed').length
    return { name,fullText:full,status,planMode,attempts,successCount:sc,failedCount:fc,finalResult:final }
  }
  return [
    g('下载公众号','wechatDownloader批量下载', 'done', false,
      [{approach:'方案A: selenium模拟',verdict:'failed',time:'10:05',steps:[],result:'❌ 反爬拦截'},
       {approach:'方案B: 公众号API',verdict:'failed',time:'10:20',steps:[],result:'❌ token过期'},
       {approach:'方案C: 搜狗微信+手动',verdict:'success',time:'10:45',steps:[],result:'✅ 部分成功20/25篇'}],
      '⚠️ 20/25篇下载成功，5篇反爬失败'),
    g('P0 MVP验证','下载→清洗→切片→标注→手册', 'done', true,
      [{approach:'流水线脚本',verdict:'success',time:'11:30',steps:[],result:'✅ 5步全通'}],
      '✅ MVP验证通过'),
    g('P1 核心骨架','Agent+入栈+问答+增量', 'active', true,
      [{approach:'方案A: LangChain',verdict:'failed',time:'14:00',steps:[],result:'❌ token消耗过大'},
       {approach:'方案B: 手写Agent',verdict:'pending',time:'14:30',steps:[],result:null}],
      null),
    g('数据库选型','SQLite vs ChromaDB', 'active', false,
      [{approach:'SQLite全文检索',verdict:'pending',time:'15:00',steps:[],result:null}],
      null),
    g('P2 智能维护','审计+确认+日志+迭代', 'pending', true,
      [], null),
    g('P3 扩展集成','多来源+向量+平台+安全', 'pending', true,
      [], null),
  ]
}

// Hover state — 面板自己保持打开，只有鼠标离开珠子+面板后才关
const hover = reactive({ show: false, x: 0, y: 0, goal: {}, sessionLabel: '', panelHover: false })
let hoverTimer = null

function showHover(e, goal, sessionKey, idx) {
  clearTimeout(hoverTimer)
  const rect = e.currentTarget.getBoundingClientRect()
  const label = sessionKey === 'cliA' ? 'CLI-A · 脑图' : 'CLI-B · 知识库'
  hover.show = true
  hover.x = Math.min(rect.right + 6, window.innerWidth - 320)
  hover.y = Math.max(10, Math.min(rect.top, window.innerHeight - 420))
  hover.goal = goal
  hover.sessionLabel = label
}
function leaveBead() {
  // 延迟关闭，给鼠标移到面板的时间
  hoverTimer = setTimeout(() => {
    if (!hover.panelHover) hover.show = false
  }, 300)
}
function enterPanel() { clearTimeout(hoverTimer); hover.panelHover = true }
function leavePanel() { hover.panelHover = false; hover.show = false }

// Report modal — 打开弹窗时关闭浮窗
const report = reactive({ show: false, goal: {} })
function openReport(goal) {
  report.goal = goal
  report.show = true
  hover.show = false
  hover.panelHover = false
}
</script>

<style scoped>
.preview-page { padding: 20px; background: #0d1117; min-height: 100vh; color: #e0e0e0; font-family: system-ui,'Microsoft YaHei',sans-serif }
.page-title { font-size: 18px; color: #fff; margin-bottom: 4px }
.page-desc { font-size: 11px; color: #8b949e; margin-bottom: 20px }

/* 泳道 */
.swimlane { background: #111820; border: 1px solid #1e2a3a; border-radius: 10px; margin-bottom: 16px; overflow: hidden }
.swimlane-bar { display: flex; align-items: center; gap: 8px; padding: 8px 16px; background: #161e2a; border-bottom: 1px solid #1e2a3a }
.swimlane-dot { width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0 }
.swimlane-name { font-size: 12px; font-weight: 600; color: #c9d1d9 }
.swimlane-meta { font-size: 9px; color: #8b949e; margin-left: auto }

/* 珠子链 */
.bead-chain { display: flex; align-items: center; gap: 0; padding: 14px 12px; flex-wrap: wrap; overflow-x: auto }
.chain-sep { color: #30363d; font-size: 16px; font-weight: bold; flex-shrink: 0; margin: 0 2px }
.goal-bead-wrap { position: relative; flex-shrink: 0; cursor: pointer }

.bead { border-radius: 50%; display: inline-flex; flex-direction: column; align-items: center; justify-content: center; font-weight: 700; transition: all .2s }
.goal-bead { width: 58px; height: 58px; min-width: 58px; min-height: 58px; font-size: 8px }
.goal-bead:hover { filter: brightness(1.2); z-index: 5 }
.goal-bead.done { background: linear-gradient(135deg,#1a222a,#1a1e24); border: 2px solid #2d3a2d; color: #777; opacity: .5 }
.goal-bead.active { background: linear-gradient(135deg,#1a3a2a,#1a3322); border: 3px solid #3fb950; color: #7ee787 }
.goal-bead.pending { background: #1c2128; border: 2px dashed #555; color: #8b949e }
.goal-bead.failed { background: #2d1a1a; border: 3px solid #f85149; color: #faa }
.goal-bead.plan-done { background: linear-gradient(135deg,#1a2a1a,#1a241a); border: 2px dashed #3d5a3d; color: #768390; opacity: .5 }
.goal-bead.plan-active { background: linear-gradient(135deg,#2d3c5a,#1e2d4a); border: 3px dashed #fac858; color: #f0d060; box-shadow: 0 0 16px rgba(250,200,88,.25) }
.goal-bead.plan-pending { background: #1c2128; border: 2px dashed #666; color: #8b949e }
.goal-bead.plan-failed { background: #2d1a1a; border: 3px dashed #f85149; color: #faa }

.bead-icon { font-size: 14px; line-height: 1 } .bead-label { font-size: 7px; max-width: 52px; text-align: center; word-break: break-all; line-height: 1.1; margin-top: 1px }

/* attempt 计数 */
/* 徽章位置说明: cursor-dot在右上(top:-3,right:-3)，att-count放左下避免冲突 */
.att-count { position: absolute; bottom: -3px; left: -3px; font-size: 7px; font-weight: 900; padding: 1px 5px; border-radius: 6px; z-index: 3; min-width: 18px; text-align: center }
.att-count.all-ok { background: #1a3a1a; color: #3fb950; border: 1px solid #2d5a2d }
.att-count.has-fail { background: #3d1a1a; color: #f85149; border: 1px solid #5a2d2d }

/* 失败警告红点 */
.warn-dot { position: absolute; top: -4px; left: -4px; width: 16px; height: 16px; border-radius: 8px; background: #f85149; color: #fff; font-size: 10px; font-weight: 900; display: flex; align-items: center; justify-content: center; z-index: 4; animation: warnPulse 2s ease-in-out infinite }
@keyframes warnPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(248,81,73,.4) } 50% { box-shadow: 0 0 0 6px rgba(248,81,73,0) } }

/* Hover 浮窗 */
.hover-panel { position: fixed; background: #161b22; border: 1px solid #30363d; border-radius: 10px; z-index: 100; min-width: 280px; max-width: 320px; box-shadow: 0 8px 32px rgba(0,0,0,.6); pointer-events: auto }
.hp-header { display: flex; align-items: center; gap: 8px; padding: 10px 14px; border-bottom: 1px solid #30363d }
.hp-dot { width: 8px; height: 8px; border-radius: 4px }
.hp-dot.done { background: #3fb950 } .hp-dot.active { background: #3fb950 } .hp-dot.failed { background: #f85149 } .hp-dot.pending { background: #8b949e }
.hp-name { font-size: 13px; font-weight: 700; color: #fff } .hp-session { font-size: 9px; color: #8b949e; margin-left: auto }
.hp-body { padding: 10px 14px; max-height: 300px; overflow-y: auto }
.hp-fulltext { font-size: 10px; color: #c9d1d9; margin-bottom: 6px; line-height: 1.4 }
.hp-criteria { font-size: 9px; color: #fac858; margin-bottom: 8px }
.hp-section-title { font-size: 9px; color: #8b949e; margin-bottom: 6px; border-bottom: 1px solid #1e2a3a; padding-bottom: 4px }
.hp-attempts { margin-bottom: 8px }
.hp-att-row { display: flex; align-items: center; gap: 6px; padding: 4px 0; font-size: 10px }
.hp-att-dot { width: 6px; height: 6px; border-radius: 3px; flex-shrink: 0 }
.hp-att-dot.success { background: #3fb950 } .hp-att-dot.failed { background: #f85149 } .hp-att-dot.pending { background: #fac858 }
.hp-att-label { color: #8b949e; min-width: 18px } .hp-att-approach { color: #c9d1d9; flex: 1 }
.hp-att-verdict { font-weight: 700; font-size: 12px }
.hp-att-verdict.success { color: #3fb950 } .hp-att-verdict.failed { color: #f85149 } .hp-att-verdict.pending { color: #fac858 }
.hp-result { font-size: 10px; color: #3fb950; padding: 6px 8px; background: #0d1520; border-radius: 6px; margin-top: 4px }
.hp-footer { padding: 8px 14px; border-top: 1px solid #30363d; text-align: right }
.hp-btn { padding: 4px 14px; background: #21262d; border: 1px solid #30363d; border-radius: 6px; color: #c9d1d9; font-size: 10px; cursor: pointer }
.hp-btn:hover { background: #30363d; border-color: #58a6ff }

/* 弹窗 */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,.65); z-index: 200; display: flex; align-items: center; justify-content: center }
.modal-box { background: #161b22; border: 1px solid #30363d; border-radius: 12px; padding: 24px; max-width: 560px; max-height: 80vh; overflow-y: auto; box-shadow: 0 12px 40px rgba(0,0,0,.6); min-width: 380px }
.modal-box h3 { margin-bottom: 16px; font-size: 16px; color: #fff }
.modal-section { margin-bottom: 14px } .modal-label { font-size: 10px; color: #8b949e; margin-bottom: 4px; font-weight: 600 }
.modal-text { font-size: 11px; color: #c9d1d9; line-height: 1.5 }
.modal-attempt { margin-bottom: 12px; padding: 10px; background: #0d1520; border-radius: 8px }
.modal-att-header { font-size: 11px; color: #c9d1d9; display: flex; align-items: center; gap: 6px; margin-bottom: 4px }
.att-dot-modal { width: 8px; height: 8px; border-radius: 4px; display: inline-block }
.att-dot-modal.success { background: #3fb950 } .att-dot-modal.failed { background: #f85149 } .att-dot-modal.pending { background: #fac858 }
.att-verdict-modal { font-weight: 700; font-size: 10px; margin-left: auto }
.att-verdict-modal.success { color: #3fb950 } .att-verdict-modal.failed { color: #f85149 } .att-verdict-modal.pending { color: #fac858 }
.modal-att-time { font-size: 8px; color: #484f58; margin-bottom: 4px }
.modal-att-steps { display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 4px }
.step-chip { font-size: 8px; padding: 2px 6px; border-radius: 4px; background: #1c2128; color: #8b949e }
.step-chip.done { color: #3fb950 } .step-chip.failed { color: #f85149 } .step-chip.active { color: #fac858 }
.modal-att-result { font-size: 10px; color: #c9d1d9; padding: 6px; background: #111820; border-radius: 4px }
.modal-btns { display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px }

/* 图例 */
.legend { margin-top: 20px; padding: 10px 14px; background: #161b22; border-radius: 8px; display: flex; align-items: center; gap: 14px; flex-wrap: wrap }
.legend-title { font-size: 10px; color: #8b949e }
.legend-item { font-size: 9px; color: #c9d1d9; display: flex; align-items: center; gap: 4px }
</style>
