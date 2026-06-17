<template>
  <div class="preview-page">
    <h2 class="page-title">🧠 脑图计划链 — 生命周期演示</h2>
    <p class="page-desc">
      3条平行计划链，展示从预设→激活→执行→完成(或失败)→递进下一条的完整生命周期。<br>
      灰色=预设计划 | 彩色=执行中 | 亮色+黄框=游标当前位置 | 半透明=已完成 | 红框=失败
    </p>

    <!-- ===== 阶段展示 ===== -->
    <div class="schemes-row">
      <!-- 阶段1：预设 -->
      <div class="scheme-column">
        <div class="scheme-label">
          <span class="badge s1">阶段1</span>
          <strong>预设计划链</strong>
        </div>
        <div class="mock-chain">
          <div class="chain-row">
            <!-- root -->
            <div class="node root" style="background:#8883">✓<br>会话</div>
            <div class="chain-arrow">→</div>
            <!-- 3个灰色计划节点 -->
            <div class="node plan pending" style="border-color:#666;background:#4442;border-style:dashed">
              ⏳<br>审计弹窗
              <div class="node-note">PreToolUse hook</div>
            </div>
            <div class="chain-arrow">→</div>
            <div class="node plan pending" style="border-color:#666;background:#4442;border-style:dashed">
              ⏳<br>倒计时推进
              <div class="node-note">60s countdown</div>
            </div>
            <div class="chain-arrow">→</div>
            <div class="node plan pending" style="border-color:#666;background:#4442;border-style:dashed">
              ⏳<br>平行泳道
              <div class="node-note">swimlane</div>
            </div>
          </div>
          <div class="stage-label">3个灰色计划节点，虚线边框，#666</div>
        </div>
        <ul class="notes">
          <li>planMode: true, 灰色虚线</li>
          <li>planRoots 数组记录起点</li>
          <li>currentPlanIndex = 0</li>
        </ul>
      </div>

      <!-- 阶段2：游标激活链1 -->
      <div class="scheme-column">
        <div class="scheme-label">
          <span class="badge s2">阶段2</span>
          <strong>游标激活 → 链1执行</strong>
        </div>
        <div class="mock-chain">
          <div class="chain-row">
            <div class="node root done">✓<br>会话</div>
            <div class="chain-arrow">→</div>
            <!-- 链1被激活：任务线颜色+白边框+黄标 -->
            <div class="node plan active" style="border-color:#fac858;background:#5470c644;border-width:3px;border-style:solid">
              ▶<br>审计弹窗
              <div class="cursor-dot"></div>
            </div>
            <div class="chain-arrow">→</div>
            <div class="node plan pending" style="border-color:#666;background:#4442;border-style:dashed">
              ⏳<br>倒计时推进
            </div>
            <div class="chain-arrow">→</div>
            <div class="node plan pending" style="border-color:#666;background:#4442;border-style:dashed">
              ⏳<br>平行泳道
            </div>
          </div>
          <!-- 链1下挂的彩色子节点 -->
          <div class="sub-nodes">
            <div class="sub-arrow">├→</div>
            <div class="node action active" style="background:#5470c6cc;border-color:#fff;border-width:2px">
              🔵<br>Read hook文档
            </div>
            <div class="sub-arrow">├→</div>
            <div class="node action done" style="background:#5470c633;border-color:#fff3">
              ✓<br>实现拦截
            </div>
          </div>
          <div class="stage-label">链1游标激活(黄框+亮色) + 彩色action子节点</div>
        </div>
        <ul class="notes">
          <li>move-cursor → 激活planMode节点</li>
          <li>灰色→任务线颜色+白边框+黄标</li>
          <li>action子节点有彩色(非灰色)</li>
        </ul>
      </div>

      <!-- 阶段3：链1完成，倒计时递进 -->
      <div class="scheme-column">
        <div class="scheme-label">
          <span class="badge s3">阶段3</span>
          <strong>链1完成 → 倒计时 → 链2</strong>
        </div>
        <div class="mock-chain">
          <div class="chain-row">
            <div class="node root done">✓<br>会话</div>
            <div class="chain-arrow">→</div>
            <div class="node plan done" style="background:#5470c633;border-color:#5470c666">
              ✓<br>审计弹窗
            </div>
            <div class="chain-arrow">→</div>
            <div class="node plan active" style="border-color:#fac858;background:#91cc7555;border-width:3px;border-style:solid">
              ▶<br>倒计时推进
              <div class="cursor-dot"></div>
            </div>
            <div class="chain-arrow">→</div>
            <div class="node plan pending" style="border-color:#666;background:#4442;border-style:dashed">
              ⏳<br>平行泳道
            </div>
          </div>
          <!-- 倒计时弹窗 -->
          <div class="countdown-modal">
            <div class="cd-header">🔄 链1已完成</div>
            <div class="cd-body">链2「倒计时推进」将在<br><strong>{{ countdownSec }} 秒后</strong>自动开始</div>
            <div class="cd-btns">
              <span class="cd-btn pause">⏸ 暂停</span>
              <span class="cd-btn start">▶ 立即开始</span>
            </div>
          </div>
          <div class="stage-label">链1done(半透) + 倒计时弹窗 → 链2游标到达</div>
        </div>
        <ul class="notes">
          <li>链1所有子节点done → 链1完成</li>
          <li>60s倒计时弹窗 → 浏览器Modal</li>
          <li>用户在=暂停；不在=自动递进</li>
        </ul>
      </div>
    </div>

    <!-- ===== 第二阶段：失败与重试 ===== -->
    <div class="schemes-row" style="margin-top:24px">
      <!-- 阶段4：失败处理 -->
      <div class="scheme-column">
        <div class="scheme-label">
          <span class="badge s4">阶段4</span>
          <strong>执行失败 → 方案B重试</strong>
        </div>
        <div class="mock-chain">
          <div class="chain-row">
            <div class="node plan active" style="border-color:#fac858;background:#91cc7555;border-width:3px">
              ▶<br>倒计时推进
              <div class="cursor-dot"></div>
            </div>
          </div>
          <div class="sub-nodes">
            <div class="sub-arrow">├→</div>
            <div class="node action failed" style="background:#ee666655;border-color:#f85149;border-width:3px">
              ✗<br>方案A<br>setInterval
              <div class="node-note">SSE断连失效</div>
            </div>
            <div class="sub-arrow" style="color:#f85149">↓ 备选</div>
            <div class="node action active" style="background:#91cc75cc;border-color:#fff;border-width:2px">
              🔵<br>方案B<br>服务端倒计时
            </div>
          </div>
          <div class="stage-label">方案A失败(红框) → 自动分叉方案B → 继续</div>
        </div>
        <ul class="notes">
          <li>action失败标红 + finalReport</li>
          <li>Claude自动创建备选分支</li>
          <li>3次失败=人工介入</li>
        </ul>
      </div>

      <!-- 阶段5：最终完成 -->
      <div class="scheme-column">
        <div class="scheme-label">
          <span class="badge s5">阶段5</span>
          <strong>全部完成 → 归档</strong>
        </div>
        <div class="mock-chain">
          <div class="chain-row" style="flex-wrap:wrap;justify-content:center">
            <div class="node plan done" style="background:#5470c633;border-color:#5470c666">
              ✓<br>审计弹窗
            </div>
            <div class="node plan done" style="background:#91cc7533;border-color:#91cc7566">
              ✓<br>倒计时推进
            </div>
            <div class="node plan done" style="background:#fac85833;border-color:#fac85866">
              ✓<br>平行泳道
            </div>
          </div>
          <div class="stage-label">3条链全部done → 归档到JSONL</div>
        </div>
        <ul class="notes">
          <li>全部planRoot done → 整体完成</li>
          <li>有价值节点导出到 archive.jsonl</li>
          <li>finalReport 可在浏览器点击查看</li>
        </ul>
      </div>

      <!-- 阶段6：状态对照表 -->
      <div class="scheme-column">
        <div class="scheme-label">
          <span class="badge s6">状态</span>
          <strong>节点颜色对照表</strong>
        </div>
        <div class="color-table">
          <div class="color-row">
            <div class="color-swatch" style="border:2px dashed #666;background:#4442"></div>
            <div><strong>计划pending</strong><br>灰色虚线，#666</div>
          </div>
          <div class="color-row">
            <div class="color-swatch" style="border:3px solid #fac858;background:#5470c6cc"></div>
            <div><strong>游标激活</strong><br>任务线色+黄框+白边</div>
          </div>
          <div class="color-row">
            <div class="color-swatch" style="background:#5470c6cc;border:2px solid #fff"></div>
            <div><strong>action执行中</strong><br>彩色+白边框</div>
          </div>
          <div class="color-row">
            <div class="color-swatch" style="background:#5470c633"></div>
            <div><strong>done完成</strong><br>彩色半透明+✓</div>
          </div>
          <div class="color-row">
            <div class="color-swatch" style="border:3px solid #f85149;background:#ee666655"></div>
            <div><strong>failed失败</strong><br>红色边框+✗</div>
          </div>
          <div class="color-row">
            <div class="color-swatch" style="border:2px dashed #888;background:#0003"></div>
            <div><strong>shelved搁置</strong><br>灰色虚线半透</div>
          </div>
        </div>
      </div>
    </div>

    <div class="interaction-tip">
      <h3>💡 当前实现状态</h3>
      <p>
        <strong>✅ 已实现</strong>：planRoots数组、灰色节点、游标(黄框)、move-cursor、mark-done/failed、finalReport、归档JSONL<br>
        <strong>⚠️ 部分实现</strong>：审计弹窗(Modal已有，须真实触发验证)、倒计时自动递进(只手动模拟)<br>
        <strong>❌ 未实现</strong>：平行泳道渲染、游标在计划链上的自动移动、倒计时Modal + 自动递进代码
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const countdownSec = ref(48)
</script>

<style scoped>
* { box-sizing: border-box; }

.preview-page {
  padding: 24px 20px; max-width: 1500px; margin: 0 auto;
  font-family: system-ui, -apple-system, 'Microsoft YaHei', sans-serif;
  background: #f0f2f5; min-height: 100vh;
}

.page-title { text-align: center; margin-bottom: 8px; color: #1e1e1e; font-weight: 600; font-size: 24px; }
.page-desc { text-align: center; color: #555; margin-bottom: 24px; font-size: 13px; line-height: 1.6; }

.schemes-row { display: flex; gap: 24px; justify-content: center; flex-wrap: wrap; }

.scheme-column {
  flex: 1 1 300px; min-width: 320px; max-width: 420px;
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
.badge.s1 { background: #909399; }
.badge.s2 { background: #409eff; }
.badge.s3 { background: #67c23a; }
.badge.s4 { background: #e6a23c; }
.badge.s5 { background: #5470c6; }
.badge.s6 { background: #9a60b4; }

/* 链模拟 */
.mock-chain {
  background: #1a1a2e; border-radius: 16px; padding: 16px 12px;
  display: flex; flex-direction: column; gap: 10px;
  position: relative; min-height: 140px;
}
.chain-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.chain-arrow { color: #555; font-size: 18px; font-weight: bold; }

.node {
  width: 64px; height: 64px; border-radius: 50%;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  font-size: 10px; font-weight: bold; text-align: center; line-height: 1.2;
  position: relative; transition: all 0.3s;
  color: #ddd;
}
.node.root { background: #8883; border: 2px solid #8886; }
.node.plan { width: 72px; height: 72px; }
.node.action { width: 56px; height: 56px; font-size: 9px; }
.node-note { font-size: 7px; color: #888; font-weight: normal; margin-top: 2px; max-width: 60px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.cursor-dot {
  position: absolute; top: -4px; right: -4px;
  width: 10px; height: 10px; border-radius: 50%;
  background: #fac858; border: 1px solid #fff;
  animation: pulse 1s infinite;
}
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(250,200,88,0.6); }
  50% { box-shadow: 0 0 0 6px rgba(250,200,88,0); }
}

.sub-nodes { display: flex; align-items: center; gap: 6px; padding-left: 30px; flex-wrap: wrap; }
.sub-arrow { color: #58a6ff; font-size: 14px; font-family: monospace; }

.stage-label {
  font-size: 10px; color: #8b949e; text-align: center; margin-top: 8px;
  padding: 4px 8px; background: #ffffff0a; border-radius: 6px;
}

/* 倒计时弹窗 */
.countdown-modal {
  background: #161b22; border: 2px solid #fac858; border-radius: 12px;
  padding: 12px; margin-top: 4px;
}
.cd-header { font-size: 12px; font-weight: 700; color: #fac858; margin-bottom: 6px; }
.cd-body { font-size: 11px; color: #bbb; text-align: center; }
.cd-body strong { font-size: 18px; color: #fff; }
.cd-btns { display: flex; gap: 8px; margin-top: 8px; justify-content: center; }
.cd-btn { padding: 4px 12px; border-radius: 6px; font-size: 10px; cursor: pointer; }
.cd-btn.pause { background: #30363d; color: #f85149; }
.cd-btn.start { background: #238636; color: #fff; }

/* 颜色对照表 */
.color-table { display: flex; flex-direction: column; gap: 8px; }
.color-row { display: flex; align-items: center; gap: 10px; font-size: 11px; color: #333; }
.color-swatch { width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0; }

/* 通用 */
.notes { margin: 12px 0 0; padding-left: 20px; color: #666; font-size: 13px; line-height: 1.6; }

.interaction-tip {
  margin-top: 32px; background: #e6f7ff; border-radius: 20px; padding: 20px 28px; border-left: 6px solid #1890ff;
}
.interaction-tip h3 { margin: 0 0 8px; color: #1e1e1e; }
.interaction-tip p { margin: 0; color: #333; line-height: 1.6; }
</style>
