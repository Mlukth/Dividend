<template>
  <div class="preview-page">
    <h2 class="page-title">评论区知识库 — UI布局方案 C~G</h2>
    <p class="page-desc">
      每种方案展示输入评论 → AI处理 → 查看结果(阅读版/JSON/统计) 的布局方式。<br>
      桌面端工具，参考ETT的双模式设计（API评分 + 窗口AI粘贴JSON）。
    </p>

    <!-- ===== 方案 C ===== -->
    <div class="section-label">
      <span class="badge scheme-c">方案 C</span>
      <strong>左右双栏 · 经典编辑器</strong>
      <span style="font-size:11px;color:#888;margin-left:8px">左输入/右结果 · Tab切换阅读版+JSON+统计</span>
    </div>
    <div class="schemes-row">
      <div class="scheme-column desktop-col" v-for="(item, i) in schemeC" :key="'c'+i">
        <div class="scheme-sub-label">{{ item.label }}</div>
        <div class="mock-desktop">
          <div class="desktop-screen">
            <!-- 顶栏 -->
            <div class="win-topbar">
              <span class="win-dot" style="background:#ff5f57"></span>
              <span class="win-dot" style="background:#febc2e"></span>
              <span class="win-dot" style="background:#28c840"></span>
              <span class="win-title">CommentKB</span>
              <span class="win-mode-badge" v-if="item.mode==='api'">API</span>
              <span class="win-mode-badge" v-else style="background:#e6a23c">窗口AI</span>
            </div>
            <!-- 主体左右两栏 -->
            <div class="win-body-row">
              <!-- 左栏：输入 -->
              <div class="win-left" :style="{width: item.leftW || '42%'}">
                <div class="panel-hdr">📥 粘贴评论楼层</div>
                <div class="mock-input" :style="{height: item.inputH || '70%'}">
                  <span style="color:#888;font-size:9px">嘿-U喂：26某211的其中某个专业非常炸（暴涨54分那种）...</span>
                </div>
                <div class="mock-actions" v-if="item.mode==='api'">
                  <span class="mock-btn primary">🤖 API评分</span>
                </div>
                <div class="mock-actions" v-else>
                  <span class="mock-btn warn">📋 复制提示词+原文</span>
                  <span class="mock-btn" style="margin-top:3px">📥 粘贴AI结果JSON</span>
                </div>
              </div>
              <!-- 右栏：结果 -->
              <div class="win-right">
                <div class="panel-tabs">
                  <span class="tab" :class="{active: item.activeTab===0}">📖 阅读版</span>
                  <span class="tab" :class="{active: item.activeTab===1}">{ } JSON</span>
                  <span class="tab" :class="{active: item.activeTab===2}">📊 统计</span>
                </div>
                <div class="mock-result">
                  <div v-if="item.activeTab===0" class="result-reading">
                    <div style="font-size:10px;font-weight:700;color:#e0e0e0;margin-bottom:4px">### 热度趋势讨论</div>
                    <div style="font-size:9px;color:#ccc;margin-bottom:6px"><span style="color:#f0c040">[暴涨后是否会回落]</span> <b>嘿-U喂</b>：26某211的其中某个专业非常炸...</div>
                    <div style="font-size:9px;color:#ccc;margin-bottom:6px"><span style="color:#f0c040">[大概率下降]</span> <b>Yoken怀古</b>：一定是下降的趋势...</div>
                    <div style="border-top:1px solid #333;margin:8px 0"></div>
                    <div style="font-size:9px;color:#86efac">📊 观点汇总：2个观点 · infoValue≥4: 1条</div>
                  </div>
                  <div v-else-if="item.activeTab===1" class="result-json">
                    <pre style="font-size:8px;color:#86efac;margin:0;white-space:pre-wrap">{{ '{ "threadId":"hey-u-wei", "topics":["考研择校"], "viewpoints":[...] }' }}</pre>
                  </div>
                  <div v-else class="result-stats">
                    <div style="font-size:9px;color:#ccc">📊 本视频统计：7楼层 · 22观点 · 4话题</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <ul class="scheme-notes-sm">
          <li v-for="n in item.notes" :key="n">{{ n }}</li>
        </ul>
      </div>
    </div>

    <!-- ===== 方案 D ===== -->
    <div class="section-label">
      <span class="badge scheme-d">方案 D</span>
      <strong>上下分屏 · ETT风格</strong>
      <span style="font-size:11px;color:#888;margin-left:8px">上输入+模式切换 / 下结果 · 和ETT翻译练习区一致</span>
    </div>
    <div class="schemes-row">
      <div class="scheme-column desktop-col" v-for="(item, i) in schemeD" :key="'d'+i">
        <div class="scheme-sub-label">{{ item.label }}</div>
        <div class="mock-desktop">
          <div class="desktop-screen">
            <div class="win-topbar">
              <span class="win-dot" style="background:#ff5f57"></span>
              <span class="win-dot" style="background:#febc2e"></span>
              <span class="win-dot" style="background:#28c840"></span>
              <span class="win-title">CommentKB</span>
            </div>
            <!-- 上区：输入 + 工具栏 -->
            <div class="win-top-section" :style="{height: item.topH || '45%'}">
              <div class="toolbar-row">
                <span class="mock-btn sm" :class="{active: item.viewMode==='input'}">📝 输入</span>
                <span class="mock-btn sm" :class="{active: item.viewMode==='threads'}">📋 楼层列表</span>
                <span class="mock-select sm">API模式 ▾</span>
              </div>
              <div v-if="item.viewMode==='input'" class="mock-input" style="flex:1;margin:4px 8px">
                <span style="color:#888;font-size:9px">粘贴评论楼层原文...</span>
              </div>
              <div v-else class="mock-input" style="flex:1;margin:4px 8px;overflow-y:auto">
                <div v-for="t in 4" :key="t" style="padding:4px 6px;margin:2px 0;background:#2d2d3f;border-radius:4px;font-size:9px;color:#ccc">
                  {{ ['楼层1: 嘿-U喂 · 热度预测','楼层2: 带角度刮刀 · 网安性价比','楼层3: 唐宋111 · 央国企实习','楼层4: 纯运气选手 · 92院校'][t-1] }}
                </div>
              </div>
            </div>
            <!-- 下区：结果 -->
            <div class="win-bottom-section">
              <div class="panel-tabs">
                <span class="tab" :class="{active: item.activeTab===0}">📖 阅读版</span>
                <span class="tab" :class="{active: item.activeTab===1}">{ } JSON</span>
                <span class="tab" :class="{active: item.activeTab===2}">📊 统计</span>
              </div>
              <div class="mock-result" style="flex:1">
                <div v-if="item.activeTab===0" style="font-size:9px;color:#ccc;padding:4px">
                  <div style="color:#f0c040">[暴涨后是否会回落]</div>
                  <div style="margin-bottom:4px"><b>嘿-U喂</b>：26某211的其中某个专业非常炸（暴涨54分那种）...</div>
                  <div style="color:#f0c040">[大概率下降]</div>
                  <div style="margin-bottom:4px"><b>Yoken怀古</b>：一定是下降的趋势，但是下降多少具体要看八九十月份的热度</div>
                </div>
                <div v-else-if="item.activeTab===1" style="font-size:8px;color:#86efac;padding:4px">{"viewpoints":[...]}</div>
                <div v-else style="font-size:9px;color:#ccc;padding:4px">📊 7楼层 · 22观点 · 4话题</div>
              </div>
            </div>
          </div>
        </div>
        <ul class="scheme-notes-sm">
          <li v-for="n in item.notes" :key="n">{{ n }}</li>
        </ul>
      </div>
    </div>

    <!-- ===== 方案 E ===== -->
    <div class="section-label">
      <span class="badge scheme-e">方案 E</span>
      <strong>三栏工作台 · 专业重型</strong>
      <span style="font-size:11px;color:#888;margin-left:8px">左线程树/中输入+阅读/右JSON实时预览 · 适合大量处理</span>
    </div>
    <div class="schemes-row">
      <div class="scheme-column desktop-col" v-for="(item, i) in schemeE" :key="'e'+i">
        <div class="scheme-sub-label">{{ item.label }}</div>
        <div class="mock-desktop">
          <div class="desktop-screen">
            <div class="win-topbar">
              <span class="win-dot" style="background:#ff5f57"></span>
              <span class="win-dot" style="background:#febc2e"></span>
              <span class="win-dot" style="background:#28c840"></span>
              <span class="win-title">CommentKB — 工作台</span>
            </div>
            <div class="win-body-row" style="flex:1">
              <!-- 左：线程树 -->
              <div class="win-col-sidebar">
                <div class="sidebar-hdr">📋 楼层</div>
                <div v-for="t in 5" :key="t" class="thread-item" :class="{active: t===1}">
                  <div style="font-size:9px;font-weight:600;color:#e0e0e0">{{ ['嘿-U喂 热度','带角度刮刀 网安','唐宋111 央国企','纯运气 92院校','Spr 0854代码'][t-1] }}</div>
                  <div style="font-size:7px;color:#888">{{ [5,3,1,2,1][t-1] }}个观点</div>
                </div>
              </div>
              <!-- 中：输入+阅读 -->
              <div class="win-col-main">
                <div class="mock-input" style="height:30%;margin:4px;font-size:9px">
                  <span style="color:#888">输入区：粘贴评论...</span>
                </div>
                <div class="mock-result" style="flex:1;margin:4px">
                  <div style="font-size:9px;color:#ccc">
                    <div style="color:#f0c040">[暴涨后是否会回落]</div>
                    <div style="margin-bottom:6px"><b>嘿-U喂</b>：26某211的其中某个专业非常炸（暴涨54分那种）...</div>
                    <div style="color:#f0c040">[大概率下降]</div>
                    <div><b>Yoken怀古</b>：一定是下降的趋势...</div>
                  </div>
                </div>
              </div>
              <!-- 右：JSON -->
              <div class="win-col-sidebar" style="width:28%">
                <div class="sidebar-hdr">{ } JSON</div>
                <div style="font-size:7px;color:#86efac;padding:4px;overflow-y:auto;flex:1">
                  <pre style="margin:0;white-space:pre-wrap">{{ '{ "threadId":"hey-u-wei", "topics":["考研择校","热度预测"], "viewpoints":[ {"speaker":"嘿-U喂", "tag":"暴涨后是否会回落","infoValue":3}, {"speaker":"Yoken怀古","tag":"大概率下降","infoValue":4} ], "summary":["[暴涨后大概率回落]...","[热度监控方法]..."] }' }}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
        <ul class="scheme-notes-sm">
          <li v-for="n in item.notes" :key="n">{{ n }}</li>
        </ul>
      </div>
    </div>

    <!-- ===== 方案 F ===== -->
    <div class="section-label">
      <span class="badge scheme-f">方案 F</span>
      <strong>卡片流水流 · 轻量浏览</strong>
      <span style="font-size:11px;color:#888;margin-left:8px">顶部输入栏 / 结果以卡片流展示 · 每楼层一张可折叠卡片</span>
    </div>
    <div class="schemes-row">
      <div class="scheme-column desktop-col" v-for="(item, i) in schemeF" :key="'f'+i">
        <div class="scheme-sub-label">{{ item.label }}</div>
        <div class="mock-desktop">
          <div class="desktop-screen">
            <div class="win-topbar">
              <span class="win-dot" style="background:#ff5f57"></span>
              <span class="win-dot" style="background:#febc2e"></span>
              <span class="win-dot" style="background:#28c840"></span>
              <span class="win-title">CommentKB</span>
            </div>
            <!-- 顶部输入条 -->
            <div class="compact-input-bar">
              <span style="font-size:9px;color:#888;flex:1">📥 粘贴评论楼层...</span>
              <span class="mock-btn sm primary">处理</span>
            </div>
            <!-- 卡片流 -->
            <div class="card-stream">
              <div v-for="(card, ci) in item.cards || [1,2,3]" :key="ci" class="kb-card" :class="{expanded: ci===0}">
                <div class="card-header">
                  <span class="card-topic">🏷 {{ ['热度预测','网安性价比','央国企'][ci] }}</span>
                  <span class="card-meta">{{ ['嘿-U喂 · 5条回复','带角度刮刀 · 3条回复','唐宋111 · 1条回复'][ci] }}</span>
                  <span class="card-toggle">{{ ci===0 ? '▼' : '▶' }}</span>
                </div>
                <div v-if="ci===0" class="card-body">
                  <div style="font-size:9px;color:#ccc;margin-bottom:3px">
                    <span style="color:#f0c040">[暴涨后是否会回落]</span> <b>嘿-U喂</b>：26某211的其中某个专业非常炸...
                  </div>
                  <div style="font-size:9px;color:#ccc;margin-bottom:3px">
                    <span style="color:#f0c040">[大概率下降]</span> <b>Yoken怀古</b>：一定是下降的趋势...
                  </div>
                  <div style="display:flex;gap:4px;margin-top:6px">
                    <span class="info-badge green">infoValue 4</span>
                    <span class="info-badge blue">个人经验</span>
                    <span class="info-badge">考研择校</span>
                  </div>
                </div>
                <div v-else class="card-body" style="opacity:0.5;font-size:8px;color:#888">
                  点击展开查看观点...
                </div>
              </div>
            </div>
          </div>
        </div>
        <ul class="scheme-notes-sm">
          <li v-for="n in item.notes" :key="n">{{ n }}</li>
        </ul>
      </div>
    </div>

    <!-- ===== 方案 G ===== -->
    <div class="section-label">
      <span class="badge scheme-g">方案 G</span>
      <strong>极简单页 · 一次性处理</strong>
      <span style="font-size:11px;color:#888;margin-left:8px">粘贴→处理→看结果→复制/导出 · 无线程管理</span>
    </div>
    <div class="schemes-row">
      <div class="scheme-column desktop-col" v-for="(item, i) in schemeG" :key="'g'+i">
        <div class="scheme-sub-label">{{ item.label }}</div>
        <div class="mock-desktop">
          <div class="desktop-screen">
            <div class="win-topbar">
              <span class="win-dot" style="background:#ff5f57"></span>
              <span class="win-dot" style="background:#febc2e"></span>
              <span class="win-dot" style="background:#28c840"></span>
              <span class="win-title">CommentKB</span>
            </div>
            <!-- 单页三步 -->
            <div class="single-page-flow">
              <!-- 步骤条 -->
              <div class="flow-steps">
                <div class="flow-step done">✓ 粘贴</div>
                <div class="flow-step-conn done"></div>
                <div class="flow-step active">2 处理</div>
                <div class="flow-step-conn"></div>
                <div class="flow-step">3 结果</div>
              </div>
              <!-- 内容区 -->
              <div class="flow-content" v-if="item.step===1">
                <div class="mock-input" style="height:50%;margin:8px">
                  <span style="color:#888;font-size:9px">嘿-U喂：26某211的其中某个专业非常炸...</span>
                </div>
                <div style="display:flex;gap:6px;padding:0 8px">
                  <span class="mock-btn primary flex1">🤖 API处理</span>
                  <span class="mock-btn warn flex1">📋 窗口AI</span>
                </div>
              </div>
              <div class="flow-content" v-else>
                <div class="panel-tabs" style="padding:4px 8px">
                  <span class="tab active">📖 阅读版</span>
                  <span class="tab">{ } JSON</span>
                </div>
                <div style="font-size:9px;color:#ccc;padding:4px 8px">
                  <div style="color:#f0c040">[暴涨后是否会回落]</div>
                  <div style="margin-bottom:4px"><b>嘿-U喂</b>：26某211的其中某个专业非常炸...</div>
                  <div style="color:#f0c040">[大概率下降]</div>
                  <div><b>Yoken怀古</b>：一定是下降的趋势...</div>
                </div>
              </div>
              <!-- 底部导出 -->
              <div class="flow-footer">
                <span class="mock-btn sm">📥 导出JSON</span>
                <span class="mock-btn sm">📋 复制阅读版</span>
                <span class="mock-btn sm">💾 存入知识库</span>
              </div>
            </div>
          </div>
        </div>
        <ul class="scheme-notes-sm">
          <li v-for="n in item.notes" :key="n">{{ n }}</li>
        </ul>
      </div>
    </div>

    <!-- ===== 总结对比 ===== -->
    <div class="interaction-tip">
      <h3>方案对照表</h3>
      <table class="compare-table">
        <thead>
          <tr>
            <th>方案</th>
            <th>核心思路</th>
            <th>适用场景</th>
            <th>实现成本</th>
            <th>知识库浏览体验</th>
            <th>适合谁</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span class="badge-sm c3">C</span></td>
            <td>左右双栏</td>
            <td>单楼层处理，边看输入边看结果</td>
            <td>低</td>
            <td>⭐⭐ — 一次看一个楼层</td>
            <td>初期快速验证</td>
          </tr>
          <tr>
            <td><span class="badge-sm d4">D</span></td>
            <td>上下分屏（ETT风格）</td>
            <td>熟悉ETT交互的用户，上输入下结果</td>
            <td>低-中</td>
            <td>⭐⭐ — 可切换楼层列表</td>
            <td>ETT老用户</td>
          </tr>
          <tr>
            <td><span class="badge-sm e5">E</span></td>
            <td>三栏工作台</td>
            <td>大量处理+实时预览JSON，专业用户</td>
            <td>高</td>
            <td>⭐⭐⭐⭐ — 线程树+阅读+JSON同屏</td>
            <td>重度使用</td>
          </tr>
          <tr>
            <td><span class="badge-sm f6">F</span></td>
            <td>卡片流水流</td>
            <td>浏览为主，快速扫观点，折叠展开</td>
            <td>中</td>
            <td>⭐⭐⭐⭐⭐ — 最佳浏览体验</td>
            <td>知识库浏览</td>
          </tr>
          <tr>
            <td><span class="badge-sm g7">G</span></td>
            <td>极简单页</td>
            <td>偶尔用，粘贴→处理→导出走人</td>
            <td>最低</td>
            <td>⭐ — 无浏览功能</td>
            <td>尝鲜/偶尔用</td>
          </tr>
        </tbody>
      </table>
      <p style="margin-top:16px">
        <strong>推荐策略</strong>：先用 <strong>方案C</strong>（左右双栏）快速出活，后续迭代到 <strong>方案F</strong>（卡片流）做知识库浏览。
        方案E三栏工作台成本太高，初期不推荐。方案G太简陋，只能当原型。<br>
        <span style="color:#888;font-size:12px">
          和ETT一样：方案C的"API模式"调DeepSeek，"窗口AI模式"一键复制提示词→粘贴结果。
        </span>
      </p>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

// ---- 方案 C: 左右双栏 ----
const schemeC = reactive([
  {
    label: 'API模式 · 一键评分',
    mode: 'api', leftW: '42%', inputH: '70%', activeTab: 0,
    notes: ['左栏粘贴评论原文', '点"API评分"直接调DeepSeek', '右栏Tab切换阅读版/JSON/统计', '和ETT的API评分模式一致']
  },
  {
    label: '窗口AI模式 · 粘贴结果',
    mode: 'window', leftW: '42%', inputH: '55%', activeTab: 0,
    notes: ['点"复制提示词+原文"→粘贴到ChatGPT/Claude', 'AI返回JSON→粘贴回右栏', '解析后自动展示阅读版+JSON', '和ETT窗口AI模式一致']
  },
  {
    label: '纯浏览模式 · 只读结果',
    mode: 'api', leftW: '0%', inputH: '0%', activeTab: 2,
    notes: ['左侧可折叠隐藏', '右栏全宽展示统计/JSON', '适合知识库浏览场景']
  }
])

// ---- 方案 D: 上下分屏 ----
const schemeD = reactive([
  {
    label: '输入模式 · 粘贴评论',
    viewMode: 'input', topH: '45%', activeTab: 0,
    notes: ['上区：输入框+API/窗口AI按钮', '下区：结果展示+Tab切换', '和ETT翻译练习区布局一致', '熟悉的用户体验']
  },
  {
    label: '楼层列表模式 · 切换浏览',
    viewMode: 'threads', topH: '45%', activeTab: 0,
    notes: ['上区切换为楼层列表', '点击楼层→下区展示该楼层结果', '适合批量处理后的浏览']
  }
])

// ---- 方案 E: 三栏工作台 ----
const schemeE = reactive([
  {
    label: '标准三栏 · 输入+阅读+JSON',
    notes: ['左栏：楼层列表树（可切换视频来源）', '中栏：输入区(上) + 阅读版结果(下)', '右栏：JSON实时预览', '适合需要同时看原文和JSON的场景', '实现成本最高（三栏响应式+拖拽调整宽度）']
  }
])

// ---- 方案 F: 卡片流 ----
const schemeF = reactive([
  {
    label: '卡片流 · 知识库浏览',
    cards: [1,2,3],
    notes: ['顶部紧凑输入条（不占主空间）', '每个楼层一张可折叠卡片', '卡片内显示标签+infoValue+话题', '展开看详细观点，折叠看摘要', '最佳知识库浏览体验', '类似小红书/B站评论区的浏览感']
  }
])

// ---- 方案 G: 极简单页 ----
const schemeG = reactive([
  {
    label: '三步流程 · 粘贴→处理→结果',
    step: 1,
    notes: ['步骤条引导：粘贴→处理→结果', '第三步可切换阅读版/JSON', '底部一键导出/复制/存入知识库', '最简实现，适合原型验证', '无楼层管理，每次处理一个']
  }
])
</script>

<style scoped>
* { box-sizing: border-box; }

.preview-page {
  padding: 24px 20px; max-width: 1600px; margin: 0 auto;
  font-family: system-ui, -apple-system, 'Microsoft YaHei', sans-serif;
  background: #f0f2f5; min-height: 100vh;
}

.page-title { text-align: center; margin-bottom: 8px; color: #1e1e1e; font-weight: 600; font-size: 24px; }
.page-desc { text-align: center; color: #555; margin-bottom: 0; font-size: 13px; line-height: 1.6; }

.section-label {
  display: flex; align-items: center; gap: 8px;
  margin: 28px 0 14px; padding: 12px 18px;
  background: #fff; border-radius: 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.schemes-row { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }

.scheme-column {
  flex: 1 1 300px; min-width: 300px; max-width: 520px;
  background: #ffffff; border-radius: 20px; padding: 16px 12px 20px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.05);
  display: flex; flex-direction: column;
}
.scheme-column.desktop-col { max-width: 420px; }

.scheme-sub-label {
  font-size: 11px; font-weight: 600; color: #555;
  text-align: center; margin-bottom: 8px;
}

/* Badges */
.badge { padding: 4px 10px; border-radius: 30px; font-size: 12px; font-weight: 600; color: white; }
.badge.scheme-c { background: #8b5cf6; }
.badge.scheme-d { background: #ec4899; }
.badge.scheme-e { background: #f97316; }
.badge.scheme-f { background: #14b8a6; }
.badge.scheme-g { background: #6366f1; }

/* 桌面窗口模拟 */
.mock-desktop { display: flex; justify-content: center; margin-bottom: 6px; }
.desktop-screen {
  width: 100%; max-width: 380px; height: 340px; border-radius: 10px; overflow: hidden;
  display: flex; flex-direction: column;
  background: #1a1a2e;
  box-shadow: 0 0 0 1px #333, 0 8px 30px rgba(0,0,0,0.3);
  font-size: 10px; color: #e0e0e0;
}

.win-topbar {
  display: flex; align-items: center; gap: 5px;
  padding: 6px 10px; background: #252535; flex-shrink: 0;
}
.win-dot { width: 8px; height: 8px; border-radius: 4px; flex-shrink: 0; }
.win-title { font-size: 9px; color: #888; flex: 1; text-align: center; }
.win-mode-badge {
  font-size: 7px; padding: 1px 5px; border-radius: 6px;
  background: #409eff; color: #fff;
}

/* 双栏 */
.win-body-row { display: flex; flex: 1; overflow: hidden; }
.win-left {
  display: flex; flex-direction: column; border-right: 1px solid #2d2d3f;
  padding: 4px; flex-shrink: 0;
}
.win-right { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

/* 三栏 */
.win-col-sidebar {
  width: 22%; border-right: 1px solid #2d2d3f;
  display: flex; flex-direction: column; flex-shrink: 0;
}
.win-col-main { flex: 1; display: flex; flex-direction: column; }

/* 面板元素 */
.panel-hdr { font-size: 9px; font-weight: 600; color: #ccc; padding: 4px 6px; flex-shrink: 0; }
.sidebar-hdr { font-size: 9px; font-weight: 600; color: #ccc; padding: 4px 6px; border-bottom: 1px solid #2d2d3f; }
.panel-tabs { display: flex; gap: 2px; padding: 4px; flex-shrink: 0; border-bottom: 1px solid #2d2d3f; }
.tab {
  font-size: 8px; padding: 2px 6px; border-radius: 4px;
  color: #888; cursor: pointer;
}
.tab.active { background: #409eff; color: #fff; }

.mock-input {
  background: #252535; border-radius: 6px; padding: 6px;
  border: 1px solid #333; overflow-y: auto;
}
.mock-result { flex: 1; overflow-y: auto; padding: 4px; }
.mock-actions { padding: 4px 6px; display: flex; flex-direction: column; gap: 3px; }
.mock-btn {
  display: inline-block; padding: 4px 8px; border-radius: 5px;
  font-size: 9px; background: #374151; color: #ccc; cursor: pointer; text-align: center;
}
.mock-btn.primary { background: #409eff; color: #fff; }
.mock-btn.warn { background: #e6a23c; color: #fff; }
.mock-btn.sm { font-size: 8px; padding: 2px 6px; }
.mock-btn.active { background: #409eff; color: #fff; }
.flex1 { flex: 1; }
.mock-select { font-size: 8px; color: #888; padding: 2px 4px; background: #252535; border-radius: 3px; }

/* 上下分屏 */
.win-top-section {
  display: flex; flex-direction: column; border-bottom: 1px solid #2d2d3f;
  flex-shrink: 0;
}
.toolbar-row { display: flex; gap: 4px; padding: 4px 8px; align-items: center; }
.win-bottom-section { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

/* 线程列表 */
.thread-item {
  padding: 5px 8px; border-bottom: 1px solid #2d2d3f; cursor: pointer;
}
.thread-item.active { background: #2d2d3f; border-left: 2px solid #409eff; }
.thread-item:hover { background: #252535; }

/* 卡片流 */
.compact-input-bar {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 10px; border-bottom: 1px solid #2d2d3f; flex-shrink: 0;
}
.card-stream { flex: 1; overflow-y: auto; padding: 6px; }
.kb-card {
  background: #1e1e30; border-radius: 8px; margin-bottom: 6px;
  border: 1px solid #2d2d3f; overflow: hidden;
}
.kb-card.expanded { border-color: #409eff; }
.card-header {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 8px; cursor: pointer;
}
.card-header:hover { background: #252535; }
.card-topic { font-size: 10px; font-weight: 600; color: #e0e0e0; flex: 1; }
.card-meta { font-size: 7px; color: #888; }
.card-toggle { font-size: 8px; color: #888; }
.card-body { padding: 6px 8px; border-top: 1px solid #2d2d3f; }
.info-badge {
  font-size: 7px; padding: 1px 5px; border-radius: 6px;
  background: #374151; color: #ccc;
}
.info-badge.green { background: #1a3a2a; color: #86efac; }
.info-badge.blue { background: #1a2a3a; color: #60a5fa; }

/* 极简单页 */
.single-page-flow { display: flex; flex-direction: column; flex: 1; }
.flow-steps { display: flex; align-items: center; justify-content: center; padding: 8px; gap: 0; }
.flow-step {
  font-size: 9px; padding: 3px 10px; border-radius: 10px;
  background: #374151; color: #888;
}
.flow-step.active { background: #409eff; color: #fff; }
.flow-step.done { background: #22C55E; color: #fff; }
.flow-step-conn { width: 20px; height: 1px; background: #374151; }
.flow-step-conn.done { background: #22C55E; }
.flow-content { flex: 1; display: flex; flex-direction: column; }
.flow-footer { display: flex; gap: 6px; padding: 6px 8px; border-top: 1px solid #2d2d3f; justify-content: center; }

/* 通用 */
.scheme-notes-sm { margin: 8px 0 0; padding-left: 18px; color: #666; font-size: 11px; line-height: 1.5; }

/* 对比表格 */
.interaction-tip {
  margin-top: 32px; background: #e6f7ff; border-radius: 20px; padding: 20px 28px; border-left: 6px solid #1890ff;
}
.interaction-tip h3 { margin: 0 0 12px; color: #1e1e1e; }
.interaction-tip p { margin: 0; color: #333; line-height: 1.6; font-size: 13px; }

.compare-table {
  width: 100%; border-collapse: collapse; font-size: 13px;
}
.compare-table th {
  background: #d4e6f1; padding: 8px 10px; text-align: left;
  font-weight: 600; color: #1e1e1e;
}
.compare-table td {
  padding: 8px 10px; border-bottom: 1px solid #d4e6f1;
  color: #333;
}
.badge-sm { display: inline-block; width: 22px; height: 22px; border-radius: 11px; text-align: center; line-height: 22px; font-size: 11px; font-weight: 600; color: #fff; }
.badge-sm.c3 { background: #8b5cf6; }
.badge-sm.d4 { background: #ec4899; }
.badge-sm.e5 { background: #f97316; }
.badge-sm.f6 { background: #14b8a6; }
.badge-sm.g7 { background: #6366f1; }
</style>
