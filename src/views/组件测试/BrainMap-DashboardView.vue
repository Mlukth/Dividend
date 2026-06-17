<template>
  <div class="preview-page">
    <h2 class="page-title">脑图 俯瞰仪表盘 — 双视图切换</h2>
    <p class="page-desc">
      模拟 3 个 goal 节点的实际执行情况。右上角开关切换"日常监控"↔"俯瞰审计"。
    </p>

    <!-- 视图切换 -->
    <div class="view-toggle">
      <span :class="['toggle-label', { active: mode === 'compact' }]">日常监控</span>
      <div class="toggle-switch" @click="mode = mode === 'compact' ? 'audit' : 'compact'">
        <div :class="['toggle-knob', mode]"></div>
      </div>
      <span :class="['toggle-label', { active: mode === 'audit' }]">俯瞰审计</span>
    </div>

    <!-- ===== 紧凑模式 ===== -->
    <div v-if="mode === 'compact'" class="chain-container">
      <div class="chain-title">主链 — 折叠态，点击 goal 展开 action</div>

      <div class="chain-row" v-for="(goal, gi) in goals" :key="'g'+gi">
        <!-- 链箭头 -->
        <div v-if="gi > 0" class="chain-connector">
          <div class="connector-line"></div>
          <div class="connector-arrow">→</div>
        </div>

        <!-- Goal 珠子 + 展开区 -->
        <div class="goal-block">
          <div class="goal-row" @click="toggleGoal(gi)">
            <div :class="['bead', 'goal', goal.status]">
              <span class="goal-icon">{{ statusIcon(goal.status) }}</span>
              <span class="goal-name">{{ goal.name }}</span>
            </div>
            <!-- 状态标记 -->
            <span v-if="goal.status === 'active'" class="status-tag active-tag">进行中</span>
            <span v-if="goal.status === 'done'" class="status-tag done-tag">完成</span>
            <span v-if="goal.status === 'failed'" class="status-tag fail-tag">失败</span>
            <span v-if="goal.hasAttempts" class="attempts-badge">
              {{ goal.attempts.filter(a => a.verdict === 'success').length }}/{{ goal.attempts.length }} 方案
            </span>
            <span class="expand-icon">{{ goal.expanded ? '▼' : '▶' }}</span>
          </div>

          <!-- 展开的 action beads -->
          <div v-if="goal.expanded" class="actions-area">
            <div class="actions-label">执行动作</div>
            <div class="actions-row">
              <template v-for="(act, ai) in goal.actions" :key="ai">
                <div class="bead-link" v-if="ai > 0">→</div>
                <div :class="['bead', 'action', act.status]" :title="act.name">
                  {{ act.icon }}
                  <span class="act-name">{{ act.name }}</span>
                </div>
              </template>
            </div>
            <!-- attempts 摘要 -->
            <div v-if="goal.hasAttempts" class="attempts-mini">
              <span class="mini-title">尝试方案：</span>
              <span v-for="(att, ai) in goal.attempts" :key="ai"
                :class="['mini-chip', att.verdict]">
                {{ att.approach.substring(0, 12) }}
                {{ att.verdict === 'success' ? '✓' : att.verdict === 'failed' ? '✗' : '⋯' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="chain-footer">共 {{ goals.length }} 个目标，{{ totalActions }} 个动作</div>
    </div>

    <!-- ===== 俯瞰审计模式 ===== -->
    <div v-if="mode === 'audit'" class="audit-container">
      <div class="chain-title">俯瞰审计 — 全部 attempts 展开</div>

      <div v-for="(goal, gi) in goals" :key="'a'+gi" :class="['audit-card', goal.status]">
        <!-- 卡片头 -->
        <div class="audit-header">
          <div :class="['bead', 'goal-sm', goal.status]">
            {{ statusIcon(goal.status) }}
          </div>
          <div class="audit-header-info">
            <div class="audit-goal-name">{{ goal.name }}</div>
            <div class="audit-goal-full">{{ goal.fullText }}</div>
          </div>
          <div class="audit-header-meta">
            <span v-if="goal.notes" class="meta-note">📝 {{ goal.notes }}</span>
            <span v-if="goal.successCriteria" class="meta-criteria">🎯 {{ goal.successCriteria }}</span>
          </div>
        </div>

        <!-- Attempts 时间线 -->
        <div class="audit-body">
          <div v-if="!goal.hasAttempts" class="no-attempts">无多方案尝试记录</div>

          <div v-for="(att, ai) in goal.attempts" :key="ai" class="attempt-block">
            <div class="attempt-header-row">
              <div :class="['attempt-dot', att.verdict]"></div>
              <span class="attempt-label">方案 {{ ai + 1 }}</span>
              <span class="attempt-approach">{{ att.approach }}</span>
              <span :class="['attempt-verdict-tag', att.verdict]">
                {{ att.verdict === 'success' ? '✓ 成功' : att.verdict === 'failed' ? '✗ 失败' : '⋯ 待定' }}
              </span>
              <span class="attempt-time">{{ att.time }}</span>
            </div>

            <!-- 步骤珠子 -->
            <div class="attempt-steps">
              <div v-for="(step, si) in att.steps" :key="si"
                :class="['bead', 'step-bead', step.status]"
                :title="step.name">
                <span class="step-icon">{{ step.icon }}</span>
                <span class="step-label">{{ step.name }}</span>
              </div>
              <div v-if="att.steps.length === 0" class="no-steps">(无详细步骤)</div>
            </div>

            <!-- 方案结果 -->
            <div v-if="att.result" class="attempt-result">
              {{ att.result }}
            </div>
          </div>
        </div>

        <!-- 卡片脚 -->
        <div v-if="goal.finalResult" class="audit-footer">
          <span class="footer-label">📋 最终结果：</span>
          {{ goal.finalResult }}
          <button class="report-btn">查看完整报告</button>
        </div>
      </div>
    </div>

    <!-- 图例 -->
    <div class="legend">
      <span class="legend-title">节点状态：</span>
      <span class="legend-item"><span class="bead goal active" style="width:24px;height:24px;min-width:24px;min-height:24px;font-size:8px;display:inline-flex">▶</span> 进行中</span>
      <span class="legend-item"><span class="bead goal done" style="width:24px;height:24px;min-width:24px;min-height:24px;font-size:8px;display:inline-flex">✓</span> 完成</span>
      <span class="legend-item"><span class="bead goal failed" style="width:24px;height:24px;min-width:24px;min-height:24px;font-size:8px;display:inline-flex">✗</span> 失败</span>
      <span class="legend-item"><span class="bead action done" style="width:20px;height:20px;min-width:20px;min-height:20px;font-size:7px;display:inline-flex">✓</span> 动作完成</span>
      <span class="legend-item"><span class="bead action failed" style="width:20px;height:20px;min-width:20px;min-height:20px;font-size:7px;display:inline-flex">✗</span> 动作失败</span>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

const mode = ref('compact')

function statusIcon(s) {
  return s === 'done' ? '✓' : s === 'failed' ? '✗' : s === 'active' ? '▶' : '⏳'
}

const goals = reactive([
  {
    name: '接qwen API', fullText: '接入qwen3:8b本地模型到ETT翻译工具',
    status: 'done', notes: '需要本地ollama部署', successCriteria: 'POST /chat 返回200',
    expanded: false, hasAttempts: true,
    actions: [
      { icon: '🔍', name: '搜索文档', status: 'done' },
      { icon: '📦', name: '装依赖', status: 'done' },
      { icon: '🔧', name: '写脚本', status: 'done' },
      { icon: '🚀', name: '测试', status: 'done' },
      { icon: '✅', name: '验证', status: 'done' },
    ],
    attempts: [
      { approach: '方案1: Requests直连', verdict: 'failed', time: '14:02',
        steps: [{icon:'🔧',name:'写Python脚本',status:'done'},{icon:'🚀',name:'跑测试',status:'done'},{icon:'❌',name:'401认证失败',status:'failed'}],
        result: '❌ 401 Unauthorized — API key 格式不兼容' },
      { approach: '方案2: OpenAI SDK', verdict: 'failed', time: '14:15',
        steps: [{icon:'📦',name:'装openai包',status:'done'},{icon:'🔧',name:'配base_url',status:'done'},{icon:'❌',name:'超时30s',status:'failed'}],
        result: '❌ Timeout — SDK 默认重试策略导致超时' },
      { approach: '方案3: fetch+代理', verdict: 'success', time: '14:28',
        steps: [{icon:'🔍',name:'查fetch文档',status:'done'},{icon:'🔧',name:'手写fetch',status:'done'},{icon:'✅',name:'200 OK',status:'done'},{icon:'📝',name:'封装函数',status:'done'}],
        result: '✅ 成功 — 延迟&lt;200ms，稳定运行' },
    ],
    finalResult: '✅ 方案3成功: 手写fetch绕过SDK兼容性问题，封装为 qwenChat() 函数'
  },
  {
    name: '重构关联逻辑', fullText: '重构 BrainMap 四规则关联评分算法',
    status: 'active', notes: '', successCriteria: '同目录文件正确关联到同taskLine',
    expanded: true, hasAttempts: true,
    actions: [
      { icon: '📖', name: '读旧代码', status: 'done' },
      { icon: '🔍', name: '搜方案', status: 'done' },
      { icon: '🔧', name: '改scoreTaskLine', status: 'active' },
    ],
    attempts: [
      { approach: '方案1: 纯文件邻近匹配', verdict: 'pending', time: '15:10',
        steps: [{icon:'🔧',name:'调权重参数',status:'done'},{icon:'🧪',name:'单元测试',status:'active'}],
        result: null },
    ],
    finalResult: null
  },
  {
    name: '写单元测试', fullText: '为 server.cjs 的 session 路由写测试',
    status: 'pending', notes: '需覆盖多CLI并发场景', successCriteria: '3个mock CLI各发10个事件，验证不串session',
    expanded: false, hasAttempts: false,
    actions: [],
    attempts: [],
    finalResult: null
  }
])

const totalActions = computed(() => {
  let n = 0; goals.forEach(g => n += g.actions.length); return n
})

function toggleGoal(gi) {
  goals[gi].expanded = !goals[gi].expanded
}
</script>

<style scoped>
.preview-page { padding: 20px; background: #0d1117; min-height: 100vh; color: #e0e0e0; font-family: system-ui,'Microsoft YaHei',sans-serif }
.page-title { font-size: 18px; margin-bottom: 4px; color: #fff }
.page-desc { font-size: 11px; color: #8b949e; margin-bottom: 16px }

/* 视图切换 */
.view-toggle { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; padding: 10px 16px; background: #161b22; border-radius: 10px }
.toggle-label { font-size: 12px; color: #8b949e; transition: color .2s }
.toggle-label.active { color: #58a6ff; font-weight: 700 }
.toggle-switch { width: 48px; height: 26px; background: #30363d; border-radius: 13px; cursor: pointer; position: relative; transition: background .2s }
.toggle-knob { width: 20px; height: 20px; background: #8b949e; border-radius: 10px; position: absolute; top: 3px; left: 3px; transition: all .2s }
.toggle-knob.audit { background: #3fb950; left: 25px }

/* 珠子 */
.bead { border-radius: 50%; display: inline-flex; flex-direction: column; align-items: center; justify-content: center; font-weight: 700; transition: all .2s; cursor: pointer }
.bead.goal { width: 56px; height: 56px; min-width: 56px; min-height: 56px; font-size: 9px }
.bead.goal.active { background: linear-gradient(135deg,#1a3a2a,#1a3322); border: 3px solid #3fb950; color: #7ee787 }
.bead.goal.done { background: linear-gradient(135deg,#1a222a,#1a1e24); border: 2px solid #2d3a2d; color: #555; opacity: .5 }
.bead.goal.failed { background: linear-gradient(135deg,#2d1a1a,#241a1a); border: 3px solid #f85149; color: #faa }
.bead.goal.pending { background: #1c2128; border: 2px dashed #555; color: #8b949e }
.bead.goal-sm { width: 36px; height: 36px; min-width: 36px; min-height: 36px; font-size: 12px }
.bead.action { width: 40px; height: 40px; min-width: 40px; min-height: 40px; font-size: 8px }
.bead.action.done { background: #1a222a; border: 1px solid #2d3a2d; color: #888; opacity: .4 }
.bead.action.active { background: linear-gradient(135deg,#1a3a2a,#1a3322); border: 2px solid #3fb950; color: #7ee787 }
.bead.action.failed { background: #2d1a1a; border: 2px solid #f85149; color: #faa }
.bead.action.pending { background: #1c2128; border: 1px dashed #444; color: #8b949e }
.bead.step-bead { width: 48px; height: 48px; min-width: 48px; min-height: 48px; font-size: 8px; gap: 1px }
.bead.step-bead.done { background: #1a222a; border: 1px solid #2d3a2d; color: #888; opacity: .35 }
.bead.step-bead.active { background: linear-gradient(135deg,#1a3a2a,#1a3322); border: 2px solid #3fb950; color: #7ee787 }
.bead.step-bead.failed { background: #2d1a1a; border: 2px solid #f85149; color: #faa }

.goal-icon { font-size: 14px } .goal-name { font-size: 7px; max-width: 50px; text-align: center; word-break: break-all }
.act-name { font-size: 6px; max-width: 36px; text-align: center; word-break: break-all }
.step-icon { font-size: 12px } .step-label { font-size: 6px; max-width: 42px; text-align: center; word-break: break-all }

/* 紧凑模式 */
.chain-container { background: #111820; border: 1px solid #1e2a3a; border-radius: 10px; padding: 20px }
.chain-title { font-size: 11px; color: #8b949e; margin-bottom: 16px }
.chain-row { display: flex; align-items: flex-start; gap: 0; margin-bottom: 8px }
.chain-connector { display: flex; flex-direction: column; align-items: center; min-width: 30px }
.connector-line { width: 0; border-left: 2px solid #30363d; height: 20px }
.connector-arrow { color: #30363d; font-size: 16px; font-weight: bold }
.goal-block { flex: 1 }
.goal-row { display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px; border-radius: 8px; transition: background .15s }
.goal-row:hover { background: #161e2a }
.status-tag { font-size: 8px; padding: 2px 8px; border-radius: 8px; font-weight: 600 }
.active-tag { background: #1a3a2a; color: #3fb950; border: 1px solid #3fb950 }
.done-tag { background: #1a222a; color: #8b949e; border: 1px solid #2d3a2d }
.fail-tag { background: #2d1a1a; color: #f85149; border: 1px solid #f85149 }
.attempts-badge { font-size: 9px; color: #fac858; margin-left: auto }
.expand-icon { font-size: 10px; color: #8b949e }

.actions-area { margin: 4px 0 4px 68px; padding: 10px; background: #0d1520; border-radius: 8px; border-left: 2px solid #30363d }
.actions-label { font-size: 8px; color: #8b949e; margin-bottom: 6px }
.actions-row { display: flex; align-items: center; gap: 4px; flex-wrap: wrap }
.bead-link { color: #30363d; font-size: 12px; flex-shrink: 0 }

.attempts-mini { margin-top: 8px; display: flex; align-items: center; gap: 4px; flex-wrap: wrap }
.mini-title { font-size: 8px; color: #8b949e }
.mini-chip { font-size: 8px; padding: 2px 6px; border-radius: 8px; background: #1c2128 }
.mini-chip.success { color: #3fb950; border: 1px solid #2d3a2d }
.mini-chip.failed { color: #f85149; border: 1px solid #3d1f1f }
.mini-chip.pending { color: #fac858; border: 1px solid #3d3a1f }

.chain-footer { margin-top: 12px; font-size: 9px; color: #484f58; text-align: center }

/* 俯瞰审计模式 */
.audit-container { display: flex; flex-direction: column; gap: 16px }
.audit-card { background: #111820; border: 1px solid #1e2a3a; border-radius: 10px; overflow: hidden }
.audit-card.active { border-color: #3fb950 } .audit-card.done { border-color: #2d3a2d; opacity: .75 } .audit-card.failed { border-color: #f85149 }

.audit-header { display: flex; align-items: flex-start; gap: 12px; padding: 14px; background: #161e2a; border-bottom: 1px solid #1e2a3a }
.audit-header-info { flex: 1 }
.audit-goal-name { font-size: 14px; font-weight: 700; color: #fff }
.audit-goal-full { font-size: 10px; color: #8b949e; margin-top: 2px }
.audit-header-meta { display: flex; flex-direction: column; gap: 3px; align-items: flex-end }
.meta-note { font-size: 9px; color: #8b949e } .meta-criteria { font-size: 9px; color: #fac858 }

.audit-body { padding: 14px }
.no-attempts { font-size: 10px; color: #8b949e; text-align: center; padding: 10px }

.attempt-block { margin-bottom: 12px; padding: 10px; background: #0d1520; border-radius: 8px; border-left: 2px solid #30363d }
.attempt-block:last-child { margin-bottom: 0 }
.attempt-header-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px }
.attempt-dot { width: 8px; height: 8px; border-radius: 4px; flex-shrink: 0 }
.attempt-dot.success { background: #3fb950 } .attempt-dot.failed { background: #f85149 } .attempt-dot.pending { background: #fac858 }
.attempt-label { font-size: 9px; color: #8b949e } .attempt-approach { font-size: 11px; font-weight: 600; color: #c9d1d9 }
.attempt-verdict-tag { font-size: 9px; font-weight: 700; margin-left: auto }
.attempt-verdict-tag.success { color: #3fb950 } .attempt-verdict-tag.failed { color: #f85149 } .attempt-verdict-tag.pending { color: #fac858 }
.attempt-time { font-size: 8px; color: #484f58 }

.attempt-steps { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; padding: 4px 0 4px 8px }
.no-steps { font-size: 9px; color: #8b949e }

.attempt-result { margin-top: 6px; padding: 6px 10px; background: #161e2a; border-radius: 6px; font-size: 10px; color: #c9d1d9 }

.audit-footer { padding: 10px 14px; background: #0d1520; border-top: 1px solid #1e2a3a; display: flex; align-items: center; gap: 8px; font-size: 10px; color: #3fb950 }
.footer-label { color: #8b949e }
.report-btn { margin-left: auto; padding: 4px 12px; background: #238636; color: #fff; border: none; border-radius: 6px; font-size: 9px; cursor: pointer }
.report-btn:hover { background: #2ea043 }

/* 图例 */
.legend { margin-top: 20px; padding: 10px 14px; background: #161b22; border-radius: 8px; display: flex; align-items: center; gap: 14px; flex-wrap: wrap }
.legend-title { font-size: 10px; color: #8b949e }
.legend-item { font-size: 9px; color: #c9d1d9; display: flex; align-items: center; gap: 4px }
</style>
