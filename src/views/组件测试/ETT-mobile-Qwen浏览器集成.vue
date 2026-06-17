<template>
  <div class="preview-page">
    <h2 class="page-title">🌐 Qwen 浏览器集成 — 交互流程</h2>
    <p class="page-desc">
      6.67英寸手机（375dp），深色主题。<br>
      Capacitor Browser 插件实现 App 内打开 Qwen，<b>并行运行不切出 App</b>。
    </p>

    <div class="flow-row">
      <!-- 步骤1：App 内复制 prompt -->
      <div class="flow-step">
        <div class="step-num">1</div>
        <div class="mock-phone">
          <div class="phone-screen" style="background:#1a1a2e">
            <div class="ph-topbar">
              <span style="font-size:11px;color:#888">← 范文库</span>
              <span style="font-size:13px;font-weight:700;color:#fff">窗口AI</span>
              <span style="font-size:10px;color:#e6a23c">⚙ 提示词</span>
            </div>
            <div class="ph-mode-row">
              <span class="ph-mode-btn">API评分</span>
              <span class="ph-mode-btn active">窗口AI</span>
              <span class="ph-mode-btn">水波</span>
              <span class="ph-mode-btn">反转</span>
            </div>
            <div class="ph-scroll">
              <div class="ph-src-bar">
                <span style="font-size:10px;color:#aaa">📄 原文 · 美国移民与国家构建 ▸</span>
              </div>
              <div class="ph-label">✏️ 你的译文 ⏱ 02:15</div>
              <textarea class="ph-ta" placeholder="在此输入你的中文翻译..."></textarea>
              <div class="ph-btn-row">
                <div class="ph-btn orange" @click="step = 2">一键复制拼接 prompt</div>
              </div>
              <div class="ph-toast" v-if="step >= 2">✅ prompt 已复制到剪贴板</div>
              <div class="ph-btn-row" v-if="step >= 2">
                <div class="ph-btn blue" @click="step = 3">🌐 打开 Qwen</div>
              </div>
            </div>
          </div>
        </div>
        <div class="step-label">App 窗口AI模式<br>复制拼接好的完整 prompt</div>
      </div>

      <!-- 步骤2：Qwen 浮层 -->
      <div class="flow-step">
        <div class="step-num">2</div>
        <div class="mock-phone" style="position:relative">
          <div class="phone-screen" style="background:#1a1a2e;position:relative">
            <!-- App 底部 -->
            <div style="flex:1;display:flex;flex-direction:column;opacity:0.3">
              <div class="ph-topbar">
                <span style="font-size:11px;color:#888">← 范文库</span>
                <span style="font-size:13px;font-weight:700;color:#fff">窗口AI</span>
              </div>
              <div style="flex:1"></div>
            </div>
            <!-- Qwen 浮层 -->
            <div class="qwen-overlay" :class="{ active: step >= 3 }">
              <div class="qwen-topbar">
                <span style="font-size:12px;font-weight:600">chat.qwen.ai</span>
                <span class="qwen-close" @click="step = 4">✕ 关闭</span>
              </div>
              <div class="qwen-body">
                <div class="qwen-msg user">
                  <div class="qwen-msg-label">你粘贴的 prompt</div>
                  <div class="qwen-msg-text">请对以下英译中翻译进行评分...<br>原文：The United States is the product of...<br>译文：美国是两股主要力量的产物...</div>
                </div>
                <div class="qwen-msg ai" v-if="step >= 4">
                  <div class="qwen-msg-label">Qwen 回复</div>
                  <div class="qwen-msg-text" style="color:#22C55E">
                    {"accuracy":21,"grammar":19,"vocabulary":18,"fluency":20,"total":78,"feedback":"整体理解正确，长句拆分合理。'principal forces'建议译为'核心驱动力'更贴政论文体。","mistakeWave":{"patternEN":"the immigration of...with their...and the impact of...which...","whereStuck":"同位语嵌套","examples":[{"en":"The rise of cities with their diverse populations...","zh":"城市的兴起，它们拥有多元的人口和文化..."}],"nextTime":"遇到A of B with C and D of E which F → 先断成短句"}}
                  </div>
                </div>
              </div>
              <div class="qwen-input-bar">
                <span class="qwen-copy-btn" v-if="step >= 4" @click="step = 5">📋 复制回复</span>
              </div>
            </div>
          </div>
        </div>
        <div class="step-label">Qwen 浮层浏览器<br>粘贴 prompt → 获取评分 JSON</div>
      </div>

      <!-- 步骤3：回到 App 录入 -->
      <div class="flow-step">
        <div class="step-num">3</div>
        <div class="mock-phone">
          <div class="phone-screen" style="background:#1a1a2e">
            <div class="ph-topbar">
              <span style="font-size:11px;color:#888">← 范文库</span>
              <span style="font-size:13px;font-weight:700;color:#fff">窗口AI</span>
              <span style="font-size:10px;color:#e6a23c">⚙</span>
            </div>
            <div class="ph-scroll">
              <div class="ph-label">📋 粘贴 AI 返回的 JSON 评分结果</div>
              <textarea class="ph-ta json" v-if="step >= 5">{"accuracy":21,"grammar":19,"vocabulary":18,"fluency":20,"total":78,"feedback":"..."}</textarea>
              <textarea class="ph-ta json" v-else placeholder="{&quot;accuracy&quot;:20,&quot;grammar&quot;:18,...}"></textarea>
              <div class="ph-btn-row">
                <div class="ph-btn green" v-if="step >= 5">✅ 解析并录入评分</div>
                <div class="ph-btn green" v-else>解析并录入评分</div>
              </div>
              <div class="ph-toast" v-if="step >= 5">✅ 评分已录入！总分 78/100</div>
            </div>
          </div>
        </div>
        <div class="step-label">回到 App<br>粘贴 JSON → 解析录入</div>
      </div>
    </div>

    <!-- 操作控制 -->
    <div class="play-bar">
      <span style="font-size:13px;font-weight:600">▶ 演示流程</span>
      <span class="play-btn" @click="runDemo">自动播放</span>
      <span class="play-btn reset" @click="step = 1">重置</span>
      <span style="font-size:11px;color:#888">当前步骤：{{ step }}/5</span>
    </div>

    <div class="tech-note">
      <h3>技术方案</h3>
      <p>
        <b>插件</b>：<code>@capacitor/browser</code>（Capacitor 官方浏览器插件）<br>
        <b>实现</b>：<code>Browser.open({ url: 'https://chat.qwen.ai' })</code> → 系统 Chrome Custom Tab / SFSafariViewController 浮层<br>
        <b>优势</b>：浮层覆盖在 App 上方，不杀 App 进程，关闭后直接回到之前页面状态<br>
        <b>复制粘贴</b>：<code>navigator.clipboard.writeText(prompt)</code> → 用户粘贴到 Qwen → <code>navigator.clipboard.readText()</code> 或手动粘贴回 App<br>
        <b>并行</b>：浮层打开期间 App 保持运行，计时器不停，翻译输入不丢失
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const step = ref(1)

function runDemo() {
  step.value = 1
  const delays = [800, 1000, 1200, 800, 600]
  for (let i = 2; i <= 5; i++) {
    setTimeout(() => { step.value = i }, delays.slice(0, i - 1).reduce((a, b) => a + b, 0))
  }
}
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

.flow-row { display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; align-items: flex-start; }

.flow-step {
  flex: 0 0 300px; text-align: center;
}

.step-num {
  width: 28px; height: 28px; border-radius: 14px; background: #409eff;
  color: #fff; font-size: 14px; font-weight: 700; line-height: 28px;
  margin: 0 auto 10px;
}

.step-label { margin-top: 10px; font-size: 12px; color: #666; line-height: 1.5; }

/* 手机框 */
.mock-phone { display: flex; justify-content: center; }
.phone-screen {
  width: 250px; height: 440px; border-radius: 24px; overflow: hidden;
  display: flex; flex-direction: column;
  box-shadow: 0 0 0 3px #333, 0 0 0 6px #1a1a1a, 0 10px 28px rgba(0,0,0,0.3);
  font-size: 12px; color: #e0e0e0; position: relative;
}

.ph-topbar { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px 6px; flex-shrink: 0; }

.ph-mode-row { display: flex; gap: 4px; padding: 2px 12px 6px; flex-shrink: 0; }
.ph-mode-btn {
  padding: 3px 7px; border-radius: 10px; font-size: 8px;
  background: #2d2d3f; color: #888; cursor: pointer; white-space: nowrap;
}
.ph-mode-btn.active { background: #e6a23c; color: #fff; }

.ph-scroll { flex: 1; overflow-y: auto; padding: 0 12px; }

.ph-src-bar {
  padding: 6px 8px; background: #2d2d3f; border-radius: 6px;
  cursor: pointer; margin-bottom: 4px;
}

.ph-label { font-size: 9px; color: #999; font-weight: 600; padding: 8px 0 4px; }

.ph-ta {
  width: 100%; height: 52px; background: #2d2d3f; border: none;
  border-radius: 8px; padding: 8px; color: #ddd; font-size: 10px;
  resize: none; outline: none; font-family: inherit;
}
.ph-ta::placeholder { color: #555; }
.ph-ta.json { height: 72px; font-size: 9px; color: #86efac; }

.ph-btn-row { padding: 6px 0; display: flex; gap: 6px; }
.ph-btn {
  flex: 1; text-align: center; padding: 9px; border-radius: 10px;
  color: #fff; font-size: 11px; font-weight: 600; cursor: pointer;
}
.ph-btn.orange { background: #e6a23c; }
.ph-btn.blue { background: #409eff; }
.ph-btn.green { background: #22C55E; }

.ph-toast {
  font-size: 10px; color: #22C55E; text-align: center;
  background: #1a2a1a; padding: 6px; border-radius: 6px; margin: 2px 0;
}

/* Qwen 浮层 */
.qwen-overlay {
  position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background: #0d1117; display: flex; flex-direction: column;
  opacity: 0; pointer-events: none; transition: opacity 0.3s;
}
.qwen-overlay.active { opacity: 1; pointer-events: all; }

.qwen-topbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 10px; background: #161b22; border-bottom: 1px solid #30363d;
  color: #c9d1d9; flex-shrink: 0;
}
.qwen-close { font-size: 10px; color: #f85149; cursor: pointer; }

.qwen-body { flex: 1; padding: 8px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; }
.qwen-msg { padding: 8px; border-radius: 8px; font-size: 9px; line-height: 1.4; }
.qwen-msg.user { background: #1a2a3a; align-self: flex-end; max-width: 90%; }
.qwen-msg.ai { background: #1a2a1a; max-width: 90%; color: #c9d1d9; }
.qwen-msg-label { font-size: 8px; color: #888; margin-bottom: 3px; }
.qwen-msg-text { font-size: 8px; line-height: 1.4; color: #c9d1d9; }

.qwen-input-bar {
  padding: 6px 10px; border-top: 1px solid #30363d; flex-shrink: 0;
}
.qwen-copy-btn {
  display: block; text-align: center; padding: 8px; border-radius: 8px;
  background: #238636; color: #fff; font-size: 10px; cursor: pointer;
}

/* 播放条 */
.play-bar {
  display: flex; align-items: center; gap: 12px; justify-content: center;
  margin-top: 20px; padding: 12px; background: #fff; border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.play-btn {
  padding: 6px 16px; border-radius: 8px; background: #409eff;
  color: #fff; font-size: 12px; cursor: pointer;
}
.play-btn.reset { background: #666; }

.tech-note {
  margin-top: 24px; background: #e6f7ff; border-radius: 16px;
  padding: 18px 24px; border-left: 6px solid #1890ff;
}
.tech-note h3 { margin: 0 0 8px; color: #1e1e1e; font-size: 15px; }
.tech-note p { margin: 0; color: #333; line-height: 1.7; font-size: 13px; }
.tech-note code { background: #d4e6f1; padding: 1px 5px; border-radius: 3px; font-size: 12px; }
</style>
