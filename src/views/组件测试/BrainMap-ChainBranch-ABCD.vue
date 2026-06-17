<template>
  <div class="preview-page">
    <h2 class="page-title">脑图 主链/分支/attempts 渲染 — 方案 A~D</h2>
    <p class="page-desc">
      深色主题，模拟脑图泳道。目标：展示 action 珠子挂 goal、attempts 多方案追踪、分支判定。<br>
      模拟场景 — goal "接qwen API" 经历了 方案A(失败)→方案B(失败)→方案C(成功) 三个 attempt。
    </p>

    <!-- ===== 方案 A: 内联分支 ===== -->
    <div class="section-label">
      <span class="badge sa">方案 A</span>
      <strong>内联分支</strong>
      <span style="font-size:11px;color:#888;margin-left:8px">action 直接挂在 goal 下面展开/折叠</span>
    </div>
    <div class="schemes-row">
      <div class="scheme-column" v-for="(scene, si) in schemeA.scenes" :key="'a'+si">
        <div class="scheme-sub-label">{{ scene.label }}</div>
        <div class="mock-chain">
          <!-- root -->
          <div class="bead root">R</div><div class="link-arrow">→</div>
          <!-- goal1 -->
          <div class="bead goal done">✓<br>讨论方案</div><div class="link-arrow">→</div>
          <!-- goal2 with children -->
          <div style="display:flex;flex-direction:column;align-items:center">
            <div style="display:flex;align-items:center">
              <div :class="['bead','goal', scene.goalStatus]">
                <span style="font-size:11px">{{ scene.goalIcon }}</span><br>{{ scene.goalName }}
              </div>
              <div class="link-arrow">→</div>
            </div>
            <!-- 展开的 action 珠子 -->
            <div v-if="scene.expanded" class="branch-row">
              <div class="branch-connector"></div>
              <div style="display:flex;gap:4px;flex-wrap:wrap">
                <div v-for="(act, ai) in scene.actions" :key="ai"
                  :class="['bead','action', act.status]"
                  :style="{opacity: act.status==='failed'?0.45:1}">
                  {{ act.icon }}<br><span style="font-size:7px">{{ act.name }}</span>
                </div>
              </div>
            </div>
            <div v-if="!scene.expanded" class="expand-hint" @click="scene.expanded=true">
              ▶ 展开 {{ scene.actions.length }} 个 action
            </div>
            <div v-if="scene.expanded" class="expand-hint" @click="scene.expanded=false">
              ▲ 折叠
            </div>
          </div>
          <!-- goal3 -->
          <div class="bead goal active">▶<br>写测试</div>
        </div>
        <ul class="scheme-notes-sm">
          <li v-for="n in scene.notes" :key="n">{{ n }}</li>
        </ul>
      </div>
    </div>

    <!-- ===== 方案 B: attempts 时间线 ===== -->
    <div class="section-label">
      <span class="badge sb">方案 B</span>
      <strong>attempts 时间线</strong>
      <span style="font-size:11px;color:#888;margin-left:8px">每个 attempt = 一条迷你时间线，展示方案→操作→结果</span>
    </div>
    <div class="schemes-row">
      <div class="scheme-column" v-for="(scene, si) in schemeB.scenes" :key="'b'+si">
        <div class="scheme-sub-label">{{ scene.label }}</div>
        <div class="mock-chain" style="flex-direction:column;align-items:flex-start;gap:0">
          <div style="display:flex;align-items:center;gap:4px">
            <div class="bead root">R</div><div class="link-arrow">→</div>
            <div class="bead goal done">✓<br>讨论方案</div><div class="link-arrow">→</div>
            <div :class="['bead','goal', scene.goalStatus]">
              {{ scene.goalIcon }}<br>{{ scene.goalName }}
            </div>
          </div>
          <!-- attempts 时间线 -->
          <div class="attempts-block">
            <div v-for="(att, ai) in scene.attempts" :key="ai" class="attempt-row">
              <div class="att-label">方案{{ ai+1 }}</div>
              <div class="att-desc">{{ att.approach }}</div>
              <div style="display:flex;gap:3px;margin-left:4px">
                <div v-for="(step, si) in att.steps" :key="si"
                  :class="['bead','action', step.status]"
                  :style="{width:'30px',height:'30px',minWidth:'30px',minHeight:'30px',fontSize:'7px'}">
                  {{ step.icon }}
                </div>
              </div>
              <div :class="['att-verdict', att.verdict]">
                {{ att.verdict === 'success' ? '✓ 成功' : att.verdict === 'failed' ? '✗ 失败' : '⋯ 待定' }}
              </div>
            </div>
          </div>
          <div class="bead goal active">▶<br>下一步</div>
        </div>
        <ul class="scheme-notes-sm">
          <li v-for="n in scene.notes" :key="n">{{ n }}</li>
        </ul>
      </div>
    </div>

    <!-- ===== 方案 C: 树形卡片 ===== -->
    <div class="section-label">
      <span class="badge sc">方案 C</span>
      <strong>树形卡片</strong>
      <span style="font-size:11px;color:#888;margin-left:8px">每个 goal 是卡片，内含 attempts + actions 的完整树</span>
    </div>
    <div class="schemes-row">
      <div class="scheme-column" v-for="(scene, si) in schemeC.scenes" :key="'c'+si">
        <div class="scheme-sub-label">{{ scene.label }}</div>
        <div style="display:flex;flex-direction:column;gap:10px">
          <div class="goal-card" :class="scene.goalStatus">
            <div class="card-header">
              <span class="card-icon">{{ scene.goalIcon }}</span>
              <span class="card-title">{{ scene.goalName }}</span>
              <span class="card-badge">{{ scene.goalStatus === 'active' ? '进行中' : scene.goalStatus === 'done' ? '已完成' : '计划中' }}</span>
            </div>
            <div class="card-body">
              <div v-if="scene.notes" class="card-notes">📝 {{ scene.notes }}</div>
              <div v-if="scene.successCriteria" class="card-criteria">🎯 标准: {{ scene.successCriteria }}</div>
              <!-- attempts -->
              <div v-for="(att, ai) in scene.attempts" :key="ai" class="card-attempt">
                <div class="att-header">
                  <span :class="['att-dot', att.verdict]"></span>
                  方案{{ ai+1 }}: {{ att.approach }}
                </div>
                <div style="display:flex;gap:3px;padding:4px 0 0 12px">
                  <div v-for="(step, si) in att.steps" :key="si"
                    :class="['bead','action', step.status]"
                    :style="{width:'28px',height:'28px',minWidth:'28px',minHeight:'28px',fontSize:'7px'}">
                    {{ step.icon }}
                  </div>
                </div>
              </div>
            </div>
            <div v-if="scene.result" class="card-footer">
              {{ scene.result }}
            </div>
          </div>
          <div class="link-arrow" style="transform:rotate(90deg);align-self:center">→</div>
          <div class="goal-card active">
            <div class="card-header"><span class="card-icon">▶</span><span class="card-title">下一步: 写测试</span><span class="card-badge">进行中</span></div>
            <div class="card-body"><div style="color:#8b949e;font-size:10px">(展开中...)</div></div>
          </div>
        </div>
        <ul class="scheme-notes-sm">
          <li v-for="n in scene.notes" :key="n">{{ n }}</li>
        </ul>
      </div>
    </div>

    <!-- ===== 方案 D: 混合棋盤 ===== -->
    <div class="section-label">
      <span class="badge sd">方案 D</span>
      <strong>混合棋盤</strong>
      <span style="font-size:11px;color:#888;margin-left:8px">主链珠子 + 悬浮attempts面板 + 侧边分支池</span>
    </div>
    <div class="schemes-row">
      <div class="scheme-column" v-for="(scene, si) in schemeD.scenes" :key="'d'+si">
        <div class="scheme-sub-label">{{ scene.label }}</div>
        <div style="display:flex;gap:0">
          <!-- 主链 -->
          <div style="display:flex;flex-direction:column;gap:12px;flex:1">
            <div style="display:flex;align-items:center;gap:4px">
              <div class="bead root">R</div><div class="link-arrow">→</div>
              <div class="bead goal done">✓<br>讨论</div>
            </div>
            <div style="display:flex;align-items:center;gap:4px;position:relative">
              <div class="link-arrow">→</div>
              <div :class="['bead','goal', scene.goalStatus]" @mouseenter="scene.hover=true" @mouseleave="scene.hover=false">
                {{ scene.goalIcon }}<br>{{ scene.goalName }}
              </div>
              <!-- hover 浮窗 -->
              <div v-if="scene.hover" class="hover-panel">
                <div class="hp-title">{{ scene.goalName }} — attempts</div>
                <div v-for="(att, ai) in scene.attempts" :key="ai" style="margin-bottom:4px">
                  <div style="font-size:9px;color:#8b949e">方案{{ ai+1 }}: {{ att.approach }}</div>
                  <div style="display:flex;gap:2px;margin-top:2px">
                    <div v-for="(step, si) in att.steps" :key="si"
                      :class="['bead','action', step.status]"
                      :style="{width:'24px',height:'24px',minWidth:'24px',minHeight:'24px',fontSize:'6px'}">
                      {{ step.icon }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:4px">
              <div class="link-arrow">→</div>
              <div class="bead goal active">▶<br>测试</div>
            </div>
          </div>
          <!-- 右侧分支池 -->
          <div v-if="scene.showPool" class="branch-pool">
            <div class="pool-title">分支池</div>
            <div v-for="(br, bi) in scene.poolBranches" :key="bi" class="pool-item">
              <div :class="['bead','action',br.status]" :style="{width:'32px',height:'32px',minWidth:'32px',minHeight:'32px',fontSize:'7px'}">{{ br.icon }}</div>
              <span style="font-size:8px;color:#8b949e">{{ br.name }}</span>
            </div>
          </div>
        </div>
        <ul class="scheme-notes-sm">
          <li v-for="n in scene.notes" :key="n">{{ n }}</li>
        </ul>
      </div>
    </div>

    <!-- 对比总结 -->
    <div class="section-label" style="margin-top:30px">
      <span class="badge" style="background:#f0883e">对比</span>
      <strong>方案对比</strong>
    </div>
    <table class="compare-table">
      <tr><th></th><th>A 内联分支</th><th>B attempts时间线</th><th>C 树形卡片</th><th>D 混合棋盤</th></tr>
      <tr><td>实现难度</td><td>🟢 低</td><td>🟡 中</td><td>🟡 中</td><td>🔴 高</td></tr>
      <tr><td>信息密度</td><td>低（需展开）</td><td>中</td><td>高</td><td>高</td></tr>
      <tr><td>action 可见性</td><td>需点击展开</td><td>始终可见</td><td>始终可见</td><td>hover可见</td></tr>
      <tr><td>attempts 表达</td><td>✗ 不支持</td><td>✓ 完整时间线</td><td>✓ 树形卡片</td><td>✓ hover浮窗</td></tr>
      <tr><td>适合场景</td><td>简单记录</td><td>回溯调试</td><td>深度审计</td><td>仪表盘监控</td></tr>
      <tr><td>主链/分支判定</td><td>手动</td><td>自动(attempts)</td><td>手动+规则</td><td>规则引擎</td></tr>
    </table>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

// ===== 模拟数据 =====
const makeAttempts = (verdicts) => verdicts.map((v, i) => ({
  approach: v.approach,
  verdict: v.verdict,
  steps: v.steps.map(s => ({ icon: s[0], name: s, status: s.includes('失败')||s.includes('报错')?'failed':s.includes('搜索')||s.includes('查')?'active':'done' }))
}))

const sharedAttempts3 = makeAttempts([
  { approach: '方案A: Requests直接调', verdict: 'failed', steps: ['🔧 写脚本', '🚀 测试', '❌ 401报错'] },
  { approach: '方案B: SDK官方库', verdict: 'failed', steps: ['📦 安装SDK', '🔧 配认证', '❌ 超时'] },
  { approach: '方案C: fetch+代理', verdict: 'success', steps: ['🔍 查文档', '🔧 改fetch', '✅ 200OK'] }
])

const sharedAttempts2 = makeAttempts([
  { approach: '直接调API', verdict: 'success', steps: ['🔍 搜文档', '🔧 写代码', '✅ 通过'] }
])

// 方案A: 内联分支
const schemeA = reactive({
  scenes: [
    { label: '场景1: 展开态', expanded: true, goalName: '接qwen', goalIcon: '⏳', goalStatus: 'active',
      actions: [{icon:'🔍',name:'搜索',status:'done'},{icon:'📝',name:'写脚本',status:'done'},{icon:'🚀',name:'测试',status:'active'},{icon:'✅',name:'验证',status:'pending'}],
      notes: ['action珠子直接排在goal下方', '可展开/折叠', '不展示attempts分组'] },
    { label: '场景2: 折叠态', expanded: false, goalName: '接qwen', goalIcon: '▶', goalStatus: 'active',
      actions: [{icon:'🔍',name:'搜索',status:'done'},{icon:'📝',name:'写脚本',status:'done'},{icon:'🚀',name:'测试',status:'failed'},{icon:'🔄',name:'换方案',status:'active'}],
      notes: ['折叠时只显示action数量', '点击展开看详情', '主链保持干净'] },
    { label: '场景3: 全部完成', expanded: true, goalName: '接qwen', goalIcon: '✓', goalStatus: 'done',
      actions: [{icon:'🔍',name:'搜',status:'done'},{icon:'📝',name:'写',status:'done'},{icon:'✅',name:'测',status:'done'}],
      notes: ['全部完成→自动折叠', 'goal变暗+✓', 'action数量=完成数'] },
  ]
})

// 方案B: attempts时间线
const schemeB = reactive({
  scenes: [
    { label: '场景1: 三方案(两败一成)', goalName: '接API', goalIcon: '▶', goalStatus: 'active',
      attempts: sharedAttempts3,
      notes: ['每个attempt=一行', '步骤珠子+结论标签', '失败红色/成功绿色'] },
    { label: '场景2: 单方案成功', goalName: '接API', goalIcon: '✓', goalStatus: 'done',
      attempts: sharedAttempts2,
      notes: ['只展示成功路径', '无冗余信息', '简洁清晰'] },
    { label: '场景3: 方案进行中', goalName: '接API', goalIcon: '⏳', goalStatus: 'active',
      attempts: makeAttempts([{approach:'方案A: SDK',verdict:'pending',steps:['📦 安装中','⏳ 配置...']}]),
      notes: ['未完成=待定标签', '随时间更新', '不阻塞后续节点'] },
  ]
})

// 方案C: 树形卡片
const schemeC = reactive({
  scenes: [
    { label: '场景1: 审计模式', goalName: '接qwen API', goalIcon: '▶', goalStatus: 'active',
      notes: '需要接入qwen3:8b本地模型', successCriteria: 'POST /chat 返回200 + 正确响应',
      attempts: sharedAttempts3,
      result: '✅ 方案C成功: fetch+代理绕过认证 → 延迟<200ms',
      extraNotes: ['卡片=节点详情弹窗', '含备注+成功标准+attempts+结果', '审计时一目了然'] },
    { label: '场景2: 紧凑模式', goalName: '重构', goalIcon: '✓', goalStatus: 'done',
      notes: '', successCriteria: '',
      attempts: sharedAttempts2,
      result: '✅ 1次通过',
      extraNotes: ['无备注/标准时可折叠', '只显示attempts+结果'] },
  ]
})

// 方案D: 混合棋盤
const schemeD = reactive({
  scenes: [
    { label: '场景1: hover浮窗', goalName: '接API', goalIcon: '⏳', goalStatus: 'active', hover: false,
      attempts: sharedAttempts3,
      showPool: true,
      poolBranches: [{icon:'📄',name:'读文档',status:'done'},{icon:'🔍',name:'搜索',status:'done'},{icon:'🔧',name:'改代码',status:'active'}],
      notes: ['hover goal→浮窗attemps', '右侧分支池=未归属action', '主链最干净'] },
    { label: '场景2: 关闭分支池', goalName: '接API', goalIcon: '▶', goalStatus: 'active', hover: true,
      attempts: sharedAttempts3,
      showPool: false, poolBranches: [],
      notes: ['无分支池→纯hover', '最简洁的仪表盘模式', '适合多泳道同屏'] },
  ]
})
</script>

<style scoped>
.preview-page { padding: 20px; background: #0d1117; min-height: 100vh; color: #e0e0e0; font-family: system-ui,'Microsoft YaHei',sans-serif }
.page-title { font-size: 18px; margin-bottom: 6px; color: #fff }
.page-desc { font-size: 11px; color: #8b949e; margin-bottom: 20px; line-height: 1.5 }

.section-label { display: flex; align-items: center; gap: 8px; margin: 18px 0 10px; padding: 8px 12px; background: #161b22; border-radius: 8px; border-left: 3px solid #30363d }
.badge { padding: 2px 10px; border-radius: 10px; font-size: 10px; font-weight: 700; color: #fff }
.sa { background: #5470c6 } .sb { background: #91cc75 } .sc { background: #fac858; color: #000 } .sd { background: #ee6666 }

.schemes-row { display: flex; gap: 16px; flex-wrap: wrap }
.scheme-column { flex: 1; min-width: 260px; max-width: 380px; background: #111820; border: 1px solid #1e2a3a; border-radius: 10px; padding: 14px }
.scheme-sub-label { font-size: 11px; font-weight: 600; color: #58a6ff; margin-bottom: 10px }

/* 珠子 */
.mock-chain { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; margin-bottom: 8px }
.bead { border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; font-weight: 700; line-height: 1.2; transition: all .2s }
.bead.root { width: 36px; height: 36px; min-width: 36px; min-height: 36px; background: #2d333b; border: 2px solid #444; color: #768390; font-size: 8px }
.bead.goal { width: 52px; height: 52px; min-width: 52px; min-height: 52px; font-size: 8px }
.bead.goal.active { background: linear-gradient(135deg,#1a3a2a,#1a3322); border: 2px solid #3fb950; color: #7ee787 }
.bead.goal.done { background: linear-gradient(135deg,#1a222a,#1a1e24); border: 1px solid #2d3a2d; color: #555; opacity: .45 }
.bead.goal.pending { background: #1c2128; border: 2px dashed #555; color: #8b949e }
.bead.action { width: 36px; height: 36px; min-width: 36px; min-height: 36px; font-size: 8px }
.bead.action.done { background: #1a222a; border: 1px solid #2d3a2d; color: #555; opacity: .35 }
.bead.action.active { background: linear-gradient(135deg,#1a3a2a,#1a3322); border: 2px solid #3fb950; color: #7ee787 }
.bead.action.failed { background: #2d1a1a; border: 2px solid #f85149; color: #faa }
.bead.action.pending { background: #1c2128; border: 1px dashed #444; color: #8b949e }

.link-arrow { color: #30363d; font-size: 14px; font-weight: bold; flex-shrink: 0 }

/* 方案A: 分支行 */
.branch-row { display: flex; align-items: flex-start; gap: 6px; margin-top: 4px }
.branch-connector { width: 0; border-left: 1.5px solid #58a6ff33; min-height: 20px; margin-right: 4px }
.expand-hint { font-size: 8px; color: #58a6ff; cursor: pointer; user-select: none; margin-top: 2px }

/* 方案B: attempts块 */
.attempts-block { margin: 8px 0 8px 48px; display: flex; flex-direction: column; gap: 4px; padding: 8px; background: #0d1520; border-radius: 8px; border-left: 2px solid #30363d }
.attempt-row { display: flex; align-items: center; gap: 6px }
.att-label { font-size: 8px; color: #8b949e; min-width: 30px }
.att-desc { font-size: 9px; color: #c9d1d9; min-width: 80px }
.att-verdict { font-size: 9px; font-weight: 700; margin-left: 6px }
.att-verdict.success { color: #3fb950 } .att-verdict.failed { color: #f85149 } .att-verdict.pending { color: #fac858 }

/* 方案C: 卡片 */
.goal-card { background: #111820; border: 1px solid #1e2a3a; border-radius: 10px; overflow: hidden }
.goal-card.active { border-color: #3fb950 } .goal-card.done { border-color: #2d3a2d; opacity: .7 }
.card-header { display: flex; align-items: center; gap: 8px; padding: 10px 14px; background: #161e2a; border-bottom: 1px solid #1e2a3a }
.card-icon { font-size: 16px } .card-title { font-size: 13px; font-weight: 700; color: #fff } .card-badge { font-size: 9px; color: #8b949e; margin-left: auto }
.card-body { padding: 10px 14px } .card-notes { font-size: 10px; color: #8b949e; margin-bottom: 6px } .card-criteria { font-size: 9px; color: #fac858; margin-bottom: 8px } .card-footer { padding: 8px 14px; background: #0d1520; font-size: 10px; color: #3fb950; border-top: 1px solid #1e2a3a }
.card-attempt { margin-bottom: 8px }
.att-header { font-size: 10px; color: #c9d1d9; display: flex; align-items: center; gap: 6px }
.att-dot { width: 6px; height: 6px; border-radius: 3px; display: inline-block }
.att-dot.success { background: #3fb950 } .att-dot.failed { background: #f85149 } .att-dot.pending { background: #fac858 }

/* 方案D: hover浮窗+分支池 */
.hover-panel { position: absolute; top: 60px; left: 0; background: #161b22; border: 1px solid #30363d; border-radius: 10px; padding: 12px; z-index: 10; min-width: 180px; box-shadow: 0 8px 24px rgba(0,0,0,.5) }
.hp-title { font-size: 10px; font-weight: 700; color: #58a6ff; margin-bottom: 8px }
.branch-pool { margin-left: 12px; padding: 8px; background: #0d1520; border-radius: 8px; border: 1px dashed #30363d; min-width: 90px }
.pool-title { font-size: 8px; color: #8b949e; margin-bottom: 6px } .pool-item { display: flex; align-items: center; gap: 4px; margin-bottom: 4px }

.scheme-notes-sm { margin-top: 8px; padding-left: 16px }
.scheme-notes-sm li { font-size: 9px; color: #8b949e; line-height: 1.5 }

.compare-table { width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 40px }
.compare-table th, .compare-table td { border: 1px solid #1e2a3a; padding: 8px 12px; text-align: left }
.compare-table th { background: #161e2a; color: #58a6ff; font-weight: 600 }
.compare-table td { color: #c9d1d9 }
.compare-table tr:hover td { background: #161b22 }
</style>
