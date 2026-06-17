<template>
  <div class="preview-page">
    <h2 class="page-title">✏️ 练习页 — 手机端布局方案对比</h2>
    <p class="page-desc">
      6.67英寸手机（375dp），深色主题。数据来自真实 essays-data.json。<br>
      四种模式：<b>API评分</b> / 窗口AI / 水波训练 / 反转训练。
    </p>

    <div class="schemes-row">
      <!-- 方案A：一页滚动，原文可折叠 -->
      <div class="scheme-column">
        <div class="scheme-label">
          <span class="badge scheme1">方案 A</span>
          <strong>一页滚动 · 原文可折叠</strong>
        </div>
        <div class="mock-phone">
          <div class="phone-screen" style="background:#1a1a2e">
            <!-- 顶栏 -->
            <div class="ph-topbar">
              <span style="font-size:11px;color:#888;cursor:pointer">← 范文库</span>
              <span style="font-size:13px;font-weight:700;color:#fff">翻译练习</span>
              <span style="font-size:10px;color:#409eff;cursor:pointer">⚙ 提示词</span>
            </div>
            <!-- 模式切换 -->
            <div class="ph-mode-row">
              <span v-for="m in modes" :key="m.key" class="ph-mode-btn"
                :class="{ active: aMode === m.key }" @click="aMode = m.key">{{ m.label }}</span>
            </div>
            <!-- 可滚动内容 -->
            <div class="ph-scroll">
              <!-- 原文区（除水波/反转外显示） -->
              <template v-if="aMode !== 'wave'">
                <div class="ph-src-bar" @click="aSrc = !aSrc">
                  <span style="font-size:10px;color:#aaa">📄 原文 · 考研英语一 2015 翻译真题 {{ aSrc ? '▾' : '▸' }}</span>
                  <span style="font-size:9px;color:#666">5段</span>
                </div>
                <div v-if="aSrc" class="ph-src-body">
                  <div class="ph-src-scroll">
                    <div v-for="(seg, i) in essay.segments" :key="i" class="ph-seg"
                      :class="{ sel: aSeg === i }" @click="aSeg = i">
                      <span class="ph-seg-num">{{ i + 1 }}</span>
                      <span class="ph-seg-en">{{ seg.en }}</span>
                      <span class="ph-seg-kp" v-if="seg.keyPoints.length">{{ seg.keyPoints.join(' · ') }}</span>
                    </div>
                  </div>
                  <div class="ph-src-dots">
                    <span v-for="i in essay.segments.length" :key="i" class="ph-src-dot" :class="{ on: aSeg === i-1 }"></span>
                  </div>
                </div>
              </template>

              <!-- ===== API评分 模式 ===== -->
              <template v-if="aMode === 'api'">
                <div class="ph-section-label">✏️ 你的译文 <span style="color:#888;font-weight:400">⏱ 02:15</span></div>
                <textarea class="ph-textarea-a" placeholder="在此输入你的中文翻译..."></textarea>
                <div class="ph-action-row">
                  <div class="ph-submit-btn green">提交 AI 评分</div>
                </div>
                <div class="ph-section-label">📊 评分结果</div>
                <div class="ph-score-row">
                  <div style="font-size:38px;font-weight:700;color:#22C55E">78</div>
                  <div style="font-size:11px;color:#888">/100</div>
                  <div style="flex:1"></div>
                  <div class="ph-dims-col">
                    <div class="ph-dim-sm"><span>准确性</span><div class="ph-dim-bar-sm"><div style="width:84%;background:#22C55E"></div></div><span>21/25</span></div>
                    <div class="ph-dim-sm"><span>语法</span><div class="ph-dim-bar-sm"><div style="width:76%;background:#409eff"></div></div><span>19/25</span></div>
                    <div class="ph-dim-sm"><span>词汇</span><div class="ph-dim-bar-sm"><div style="width:72%;background:#e6a23c"></div></div><span>18/25</span></div>
                    <div class="ph-dim-sm"><span>流畅</span><div class="ph-dim-bar-sm"><div style="width:80%;background:#a855f7"></div></div><span>20/25</span></div>
                  </div>
                </div>
                <div class="ph-fb-card">
                  <div class="ph-fb-title">AI 点评</div>
                  <div class="ph-fb-text">整体理解正确，长句拆分合理。'principal forces' 译为"主要力量"基本准确，但"核心驱动力"更贴政论文体。</div>
                </div>
                <div class="ph-section-label">译文对照 <span style="font-weight:400;font-size:8px;color:#888">🟢匹配 🟡差异 🔴缺失</span></div>
                <div class="ph-cmp">
                  <div class="ph-cmp-line bad">
                    <b>你：</b>美国是两股<span class="hl-match">主要力量</span>的<span class="hl-diff">产物——欧洲移民带来了他们不同的思想、风俗和民族特征，以及新国家改变了这些特征的影响。</span><span class="hl-miss">（缺：二是…在改变这些特征后所产生的影响）</span>
                  </div>
                  <div class="ph-cmp-line good">
                    <b>参：</b>美国是两股<span class="hl-match">主要力量</span>的<span class="hl-diff">产物：一是欧洲各民族带来了各自不同的思想、风俗和民族特征，二是新国家在改变这些特征后所产生的影响。</span>
                  </div>
                </div>
                <div class="ph-section-label">🌊 错误结构分析</div>
                <div class="ph-wave-box">
                  <div class="ph-wave-row"><span class="ph-wave-lbl">卡住你的英文结构</span><span class="ph-wave-en">the immigration of...with their...and the impact of...which...</span></div>
                  <div class="ph-wave-row"><span class="ph-wave-lbl">为什么容易卡</span><span class="ph-wave-zh">同位语 + 定语从句双重嵌套，中文习惯短句，英文一个长句包了三层信息</span></div>
                  <div class="ph-wave-row"><span class="ph-wave-lbl">💡 同类例句</span><span class="ph-wave-ex">The rise of cities <b>with their diverse populations and cultures</b> → 城市的兴起<b>，它们拥有多元的人口和文化</b>，...</span></div>
                  <div class="ph-wave-row"><span class="ph-wave-lbl">下次遇到怎么拆</span><span class="ph-wave-tip">遇到 A of B with C and D of E which F → 先断成 A of B. B has C. E does F.</span></div>
                </div>
                <div class="ph-section-label">🌊 错误结构分析</div>
                <div class="ph-wave-box">
                  <div class="ph-wave-row"><span class="ph-wave-lbl">卡住你的英文结构</span><span class="ph-wave-en">the immigration of...with their...and the impact of...which...</span></div>
                  <div class="ph-wave-row"><span class="ph-wave-lbl">为什么容易卡</span><span class="ph-wave-zh">同位语 + 定语从句双重嵌套</span></div>
                  <div class="ph-wave-row"><span class="ph-wave-lbl">💡 同类例句</span><span class="ph-wave-ex">The rise of cities <b>with their diverse populations...</b></span></div>
                  <div class="ph-wave-row"><span class="ph-wave-lbl">下次遇到怎么拆</span><span class="ph-wave-tip">A of B with C and D of E → 先断成 A of B. B has C.</span></div>
                </div>
              </template>

              <!-- ===== 窗口AI 模式 ===== -->
              <template v-if="aMode === 'window'">
                <div class="ph-section-label">✏️ 你的译文 <span style="color:#888;font-weight:400">⏱ 02:15</span></div>
                <textarea class="ph-textarea-a" placeholder="在此输入你的中文翻译..."></textarea>
                <div class="ph-action-row" style="display:flex;gap:6px">
                  <div class="ph-submit-btn" style="background:#e6a23c;flex:1">一键复制拼接 prompt</div>
                </div>
                <div class="ph-section-label" style="color:#e6a23c">📋 粘贴 AI 返回的 JSON 评分结果</div>
                <textarea class="ph-textarea-a" placeholder="{&quot;accuracy&quot;:20,&quot;grammar&quot;:18,&quot;vocabulary&quot;:19,&quot;fluency&quot;:21,&quot;total&quot;:78,&quot;feedback&quot;:&quot;...&quot;}" style="height:56px;font-size:10px"></textarea>
                <div class="ph-action-row">
                  <div class="ph-submit-btn" style="background:#409eff">解析并录入评分</div>
                </div>
              </template>

              <!-- ===== 水波训练 模式 ===== -->
              <template v-if="aMode === 'wave'">
                <div class="ph-section-label">🌊 点击句子进行语法结构分析</div>
                <div class="ph-wave-list">
                  <div v-for="(seg, i) in essay.segments" :key="i"
                    class="ph-wave-item" :class="{ sel: aWaveIdx === i, cached: aWaveCache[i] }"
                    @click="aWaveIdx = i; aWaveCache[i] = true">
                    <span class="ph-wave-num">{{ i + 1 }}</span>
                    <span class="ph-wave-txt">{{ seg.en.slice(0, 55) }}...</span>
                    <span v-if="aWaveCache[i] && aWaveIdx !== i" style="color:#22C55E;font-size:9px">✓</span>
                  </div>
                </div>
                <!-- 分析结果卡片 -->
                <div v-if="aWaveIdx >= 0" class="ph-wave-answer">
                  <div class="ph-wave-answer-title">📝 第{{ aWaveIdx + 1 }}句分析</div>
                  <div class="ph-wave-row"><span class="ph-wave-lbl">语法结构</span><span class="ph-wave-en">主句: built a nation, shaped the character. 过去分词driven by...作状语修饰主语movement. 介词by插在并列谓语中间.</span></div>
                  <div class="ph-wave-row"><span class="ph-wave-lbl">逻辑切分</span><span class="ph-wave-zh">[驱动力] This movement → [结果1] built a nation → [结果2] shaped character and destiny</span></div>
                  <div class="ph-wave-row"><span class="ph-wave-lbl">🚧 卡点</span><span class="ph-wave-en stuck">"driven by..., built..., shaped..." 三个动词不在一行，容易被插入语打断节奏</span></div>
                  <div class="ph-wave-row"><span class="ph-wave-lbl">💡 突破</span><span class="ph-wave-tip">遇到逗号隔开的过去分词短语，先跳过，找完主谓宾再回头看</span></div>
                  <div class="ph-wave-row"><span class="ph-wave-lbl">🌊 类比</span><span class="ph-wave-ex">Children, raised in bilingual homes, develop better cognitive skills and, by extension, excel academically.</span></div>
                </div>
                <div class="ph-action-row">
                  <div class="ph-submit-btn" style="background:#409eff">生成今日总结</div>
                </div>
              </template>

              <!-- ===== 反转训练 模式 ===== -->
              <template v-if="aMode === 'reverse'">
                <div class="ph-section-label">📖 中文参考译文</div>
                <div class="ph-rev-ref">
                  <p v-for="(line, i) in revRefLines" :key="i">{{ line }}</p>
                </div>
                <div class="ph-action-row" style="text-align:center">
                  <span style="font-size:10px;color:#409eff;cursor:pointer">🔄 AI生成参考译文</span>
                </div>
                <div class="ph-section-label">✏️ 你的英译（中→英） <span style="color:#888;font-weight:400">⏱ 02:15</span></div>
                <textarea class="ph-textarea-a" placeholder="根据中文参考译文，在此输入你的英文翻译..." style="height:90px"></textarea>
                <div class="ph-action-row" style="display:flex;gap:6px">
                  <div class="ph-submit-btn green" style="flex:1;font-size:11px">API评分</div>
                  <div class="ph-submit-btn" style="background:#e6a23c;flex:1;font-size:11px">复制prompt</div>
                </div>
                <div class="ph-section-label">译文对照（反转）</div>
                <div class="ph-cmp">
                  <div class="ph-cmp-line bad"><b>你：</b>The United States is the product of two major forces...</div>
                  <div class="ph-cmp-line good"><b>原：</b>The United States is the product of two principal forces...</div>
                </div>
              </template>
            </div>
          </div>
        </div>
        <ul class="scheme-notes">
          <li>全部四种模式可通过 pill 切换，功能与桌面版一一对应</li>
          <li><b>API评分</b>：翻译 → 提交 → 评分+四维度+AI点评+译文对照+错误分析</li>
          <li><b>窗口AI</b>：翻译 → 复制prompt → 粘贴JSON → 解析录入</li>
          <li><b>水波训练</b>：点击句子 → 语法结构/逻辑切分/卡点/突破/类比分析</li>
          <li><b>反转训练</b>：中文参考（AI生成）→ 英译输入 → 评分 → 对照</li>
          <li>原文横向滑动卡片，每段完整显示+考点标签</li>
        </ul>
      </div>

      <!-- 方案B：两步分页，翻译 → 结果 -->
      <div class="scheme-column">
        <div class="scheme-label">
          <span class="badge scheme2">方案 B</span>
          <strong>两步分页 · 翻译 ⇄ 结果</strong>
        </div>
        <div class="mock-phone">
          <div class="phone-screen" style="background:#1a1a2e">
            <!-- 顶栏 + 分页切换 -->
            <div class="ph-topbar">
              <span style="font-size:11px;color:#888;cursor:pointer">← 范文库</span>
              <div class="ph-page-tabs">
                <span class="ph-page-tab" :class="{ active: bPage === 'input' }" @click="bPage='input'">翻译</span>
                <span class="ph-page-tab" :class="{ active: bPage === 'result' }" @click="bPage='result'">结果</span>
              </div>
              <span style="font-size:10px;color:#888">⏱ 02:15</span>
            </div>

            <!-- ====== 翻译页 ====== -->
            <div v-if="bPage === 'input'" style="flex:1;display:flex;flex-direction:column;overflow-y:auto">
              <!-- 模式 + 提示词 -->
              <div class="ph-mode-row" style="padding:0 14px 6px">
                <span class="ph-mode-btn active">API评分</span>
                <span class="ph-mode-btn">窗口AI</span>
                <span class="ph-mode-btn">水波</span>
                <span class="ph-mode-btn">反转</span>
                <span style="flex:1"></span>
                <span style="font-size:10px;color:#409eff;cursor:pointer;white-space:nowrap">⚙</span>
              </div>
              <!-- 原文 -->
              <div class="ph-src-fixed">
                <div style="font-size:9px;color:#666;margin-bottom:3px">考研英语一 2015 翻译真题 · 5段</div>
                <div style="font-size:10px;color:#bbb;line-height:1.5;max-height:60px;overflow-y:auto">
                  <span v-for="(seg, i) in essay.segments" :key="i">
                    <b style="color:#409eff">[{{ i+1 }}]</b> {{ seg.en.slice(0, 60) }}{{ seg.en.length > 60 ? '...' : '' }}
                  </span>
                </div>
                <div style="font-size:9px;color:#409eff;text-align:right;cursor:pointer;margin-top:2px">展开全部 ▸</div>
              </div>
              <!-- 输入区 -->
              <div style="flex:1;padding:6px 14px;display:flex">
                <textarea class="ph-textarea-b" placeholder="在此输入你的中文翻译..."></textarea>
              </div>
              <!-- 提交 -->
              <div style="padding:8px 14px">
                <div class="ph-submit-btn green" @click="bPage='result'">提交 AI 评分</div>
              </div>
            </div>

            <!-- ====== 结果页 ====== -->
            <div v-else style="flex:1;display:flex;flex-direction:column;overflow-y:auto;padding:0 14px">
              <!-- 总分 + 四维度 -->
              <div class="ph-result-hero">
                <div style="text-align:center;margin-right:12px">
                  <div style="font-size:42px;font-weight:700;color:#22C55E">78</div>
                  <div style="font-size:10px;color:#888">总分 / 100</div>
                </div>
                <div class="ph-dims-col" style="flex:1">
                  <div class="ph-dim-sm"><span>准确性</span><div class="ph-dim-bar-sm"><div style="width:84%;background:#22C55E"></div></div><span>21</span></div>
                  <div class="ph-dim-sm"><span>语法结构</span><div class="ph-dim-bar-sm"><div style="width:76%;background:#409eff"></div></div><span>19</span></div>
                  <div class="ph-dim-sm"><span>词汇表达</span><div class="ph-dim-bar-sm"><div style="width:72%;background:#e6a23c"></div></div><span>18</span></div>
                  <div class="ph-dim-sm"><span>流畅度</span><div class="ph-dim-bar-sm"><div style="width:80%;background:#a855f7"></div></div><span>20</span></div>
                </div>
              </div>
              <!-- AI 点评 -->
              <div class="ph-fb-card">
                <div class="ph-fb-title">AI 点评</div>
                <div class="ph-fb-text">整体理解正确，长句拆分合理。'principal forces' 建议译为"核心驱动力"更贴政论文体。第2段同位语嵌套可以拆成两个短句更流畅。</div>
              </div>
              <!-- 译文对照 -->
              <div class="ph-section-label">译文对照</div>
              <div class="ph-cmp">
                <div class="ph-cmp-line bad"><b>你：</b>美国是两股主要力量的产物——欧洲移民带来了...</div>
                <div class="ph-cmp-line good"><b>参：</b>美国是两股主要力量的产物：一是欧洲各民族带来了...</div>
              </div>
              <!-- 错误结构分析 -->
              <div class="ph-section-label">🌊 错误结构分析</div>
              <div class="ph-wave-box">
                <div class="ph-wave-row"><span class="ph-wave-lbl">卡住你的英文结构</span><span class="ph-wave-en">the immigration of...with their...and the impact of...which modified...</span></div>
                <div class="ph-wave-row"><span class="ph-wave-lbl">为什么容易卡</span><span class="ph-wave-zh">同位语 + 定语从句双重嵌套，中文习惯短句，英文一个长句包含三层信息</span></div>
                <div class="ph-wave-row"><span class="ph-wave-lbl">💡 同类例句</span><span class="ph-wave-ex">The rise of cities <b>with their diverse populations and cultures</b> → 城市的兴起<b>，它们拥有多元的人口和文化</b>，...</span></div>
                <div class="ph-wave-row"><span class="ph-wave-lbl">下次遇到怎么拆</span><span class="ph-wave-tip">遇到 A of B with C and D of E which F → 先断成 A of B. B has C. E does F.</span></div>
              </div>
              <!-- 趋势图（示意） -->
              <div class="ph-section-label">📈 历史趋势</div>
              <div class="ph-chart-placeholder">
                <div style="display:flex;align-items:flex-end;gap:8px;height:50px">
                  <div style="width:16px;height:32px;background:#374151;border-radius:3px"></div>
                  <div style="width:16px;height:40px;background:#374151;border-radius:3px"></div>
                  <div style="width:16px;height:36px;background:#22C55E;border-radius:3px;position:relative">
                    <span style="position:absolute;top:-14px;left:-2px;font-size:9px;color:#22C55E">78</span>
                  </div>
                </div>
                <span style="font-size:9px;color:#666;margin-top:4px">最近3次：72 → 75 → 78</span>
              </div>
            </div>
          </div>
        </div>
        <ul class="scheme-notes">
          <li>翻译和结果完全分离，顶部双 tab 切换</li>
          <li>翻译页：模式 pill + 原文（固定顶）+ 输入区（占满剩余）+ 提交按钮</li>
          <li>结果页：总分+维度+点评+对照+错误分析+历史趋势图</li>
          <li>空间充裕，ECharts 趋势图/雷达图完整展示</li>
          <li>提交后自动切到结果页</li>
        </ul>
      </div>
    </div>

    <div class="interaction-tip">
      <h3>💡 方案对比</h3>
      <p>
        · <strong>方案A（一页滚动）</strong>：输入和结果在同一页，适合反复修改翻译后查看分数变化。原文默认折叠节省空间，每段有编号和考点标签。<br>
        · <strong>方案B（两步分页）</strong>：翻译/结果各占全屏，互不干扰。结果页空间大，ECharts图表完整展示。适合"先专心翻再仔细看"的习惯。<br>
        两个方案都保留了完整的桌面功能：四种模式切换、原文分段+考点、评分四维度、AI 点评、译文 diff 对照、水波错误结构分析。
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

// 方案A 状态
const aSrc = ref(false)
const aSeg = ref(0)
const aMode = ref('api')
const aWaveIdx = ref(-1)
const aWaveCache = reactive({})
const modes = [
  { key: 'api', label: 'API评分' },
  { key: 'window', label: '窗口AI' },
  { key: 'wave', label: '水波' },
  { key: 'reverse', label: '反转' },
]
const revRefLines = [
  '在各种强大而多样化的动机推动下，这场移民运动在荒野中建立了一个国家，并且就其本质而言，塑造了一片未知大陆的性格与命运。',
  '美国是两股主要力量的产物：一是欧洲各民族带来了各自不同的思想、风俗和民族特征，二是这个新国家在改变这些特征后所产生的影响。',
  '但是，美国特有的地理条件、不同民族群体之间的相互影响，以及在这片原始的新大陆上维持旧有生活方式的巨大困难，都引起了深刻的改变。',
]

// 方案B 状态
const bPage = ref('input')

// 真实 essay 数据（来自 essays-data.json 第一篇）
const essay = {
  title: '美国移民与国家构建',
  source: '考研英语一 2015 翻译真题',
  segments: [
    {
      en: 'This movement, driven by powerful and diverse motivations, built a nation out of a wilderness and, by its nature, shaped the character and destiny of an uncharted continent.',
      contextZH: '概述移民运动的历史意义',
      keyPoints: ['过去分词作定语', '并列谓语', '插入语']
    },
    {
      en: 'The United States is the product of two principal forces — the immigration of European peoples with their varied ideas, customs, and national characteristics and the impact of a new country which modified these traits.',
      contextZH: '美国形成的两股力量',
      keyPoints: ['破折号引出同位语', 'which定语从句', '长并列结构']
    },
    {
      en: 'But, the force of geographic conditions peculiar to America, the interplay of the varied national groups upon one another, and the sheer difficulty of maintaining old-world ways in a raw, new continent caused significant changes.',
      contextZH: '导致变化的三个因素',
      keyPoints: ['三并列主语', '形容词后置定语', '动名词短语']
    },
    {
      en: 'The first shiploads of immigrants bound for the territory which is now the United States crossed the Atlantic more than a hundred years after the 15th-and-16th-century explorations of North America.',
      contextZH: '早期移民的时间线',
      keyPoints: ['过去分词定语', 'which定语从句', '时间状语后置']
    },
    {
      en: 'The virgin forest with its richness and variety of trees was a veritable real treasure-house which extended from Maine all the way down to Georgia.',
      contextZH: '原始森林的地理范围',
      keyPoints: ['with介词短语', 'which定语从句', '比喻修辞']
    }
  ]
}
</script>

<style scoped>
* { box-sizing: border-box; }

.preview-page {
  padding: 24px 20px;
  max-width: 1300px;
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
  font-size: 24px;
}

.page-desc {
  text-align: center;
  color: #555;
  margin-bottom: 30px;
  font-size: 13px;
  line-height: 1.6;
}

.schemes-row {
  display: flex;
  gap: 28px;
  justify-content: center;
  flex-wrap: wrap;
}

.scheme-column {
  flex: 1 1 300px;
  min-width: 340px;
  max-width: 420px;
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

/* ===== 手机模拟框 ===== */
.mock-phone { display: flex; justify-content: center; margin-bottom: 12px; }

.phone-screen {
  width: 280px;
  height: 540px;
  border-radius: 28px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 0 0 3px #333, 0 0 0 6px #1a1a1a, 0 12px 36px rgba(0,0,0,0.3);
  font-size: 12px;
  color: #e0e0e0;
  position: relative;
}

/* ===== 通用部件 ===== */
.ph-topbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 14px 8px; flex-shrink: 0;
}

.ph-mode-row {
  display: flex; gap: 5px; padding: 4px 14px; flex-shrink: 0; overflow-x: auto;
}
.ph-mode-btn {
  padding: 3px 8px; border-radius: 12px; font-size: 9px;
  background: #2d2d3f; color: #888; cursor: pointer; white-space: nowrap;
}
.ph-mode-btn.active { background: #409eff; color: #fff; }

.ph-section-label {
  font-size: 10px; color: #999; font-weight: 600;
  padding: 10px 0 4px; display: flex; align-items: center; gap: 8px;
}

/* ===== 方案A ===== */
.ph-scroll { flex: 1; overflow-y: auto; padding: 0 14px; }

.ph-src-bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 7px 10px; background: #2d2d3f; border-radius: 8px;
  cursor: pointer; margin-bottom: 4px;
}

.ph-src-body {
  background: #1e1e30; border-radius: 8px; padding: 0; margin-bottom: 4px;
  overflow: hidden;
}

.ph-src-scroll {
  display: flex; overflow-x: auto; scroll-snap-type: x mandatory;
  gap: 0; padding: 6px 0;
}
.ph-src-scroll::-webkit-scrollbar { height: 0; }

.ph-seg {
  min-width: 100%; max-width: 100%; scroll-snap-align: start;
  padding: 8px 10px; cursor: pointer; overflow: hidden;
  display: flex; flex-direction: column; gap: 6px;
  flex-shrink: 0;
}

.ph-seg-num {
  display: inline-block; min-width: 16px; height: 16px; border-radius: 8px;
  background: #409eff; color: #fff; font-size: 9px; font-weight: 600;
  text-align: center; line-height: 16px; align-self: flex-start;
}

.ph-seg-en {
  font-size: 10px; color: #bbb; line-height: 1.5;
  word-break: break-word; overflow-wrap: break-word;
}

.ph-seg-kp {
  font-size: 8px; color: #e6a23c; background: #2a2a1a;
  padding: 2px 6px; border-radius: 4px; align-self: flex-start;
}

/* 底部滑动指示点 */
.ph-src-dots {
  display: flex; gap: 4px; justify-content: center; padding: 4px 0 6px;
}
.ph-src-dot {
  width: 5px; height: 5px; border-radius: 3px; background: #374151; transition: all 0.2s;
}
.ph-src-dot.on { width: 14px; background: #409eff; }

.ph-textarea-a {
  width: 100%; height: 72px; background: #2d2d3f; border: none;
  border-radius: 10px; padding: 10px; color: #ddd; font-size: 11px;
  resize: none; outline: none; font-family: inherit;
}
.ph-textarea-a::placeholder { color: #555; }

.ph-action-row { padding: 8px 0; }

.ph-submit-btn {
  text-align: center; padding: 11px; border-radius: 12px;
  color: #fff; font-size: 13px; font-weight: 600; cursor: pointer;
}
.ph-submit-btn.green { background: #22C55E; }

.ph-score-row {
  display: flex; align-items: center; gap: 8px;
  background: #2d2d3f; border-radius: 12px; padding: 10px 12px;
}

.ph-dims-col { display: flex; flex-direction: column; gap: 4px; }

.ph-dim-sm {
  display: flex; align-items: center; gap: 4px; font-size: 9px; color: #aaa;
}
.ph-dim-bar-sm {
  width: 50px; height: 3px; background: #374151; border-radius: 2px; overflow: hidden;
}
.ph-dim-bar-sm div { height: 100%; border-radius: 2px; }

.ph-fb-card {
  background: #2d2d3f; border-radius: 10px; padding: 10px; margin: 4px 0;
}
.ph-fb-title {
  font-size: 10px; font-weight: 600; color: #e0e0e0; margin-bottom: 4px;
}
.ph-fb-text { font-size: 9px; color: #999; line-height: 1.55; }

.ph-cmp {
  font-size: 9px; line-height: 1.6;
  background: #2d2d3f; border-radius: 10px; padding: 8px 10px;
}
.ph-cmp-line { color: #bbb; }
.hl-match { background: rgba(34,197,94,0.2); border-radius: 2px; padding: 0 1px; }
.hl-diff { background: rgba(234,179,8,0.25); border-radius: 2px; padding: 0 1px; }
.hl-miss { background: rgba(239,68,68,0.2); border-radius: 2px; padding: 0 1px; font-size: 8px; }

.ph-wave-box {
  background: #2d2d3f; border-radius: 10px; padding: 8px;
  display: flex; flex-direction: column; gap: 6px; margin-bottom: 8px;
}
.ph-wave-row { display: flex; flex-direction: column; gap: 2px; }
.ph-wave-lbl { font-size: 9px; color: #666; }
.ph-wave-en { font-size: 9px; color: #f87171; background: #3a1a2a; padding: 4px 6px; border-radius: 4px; line-height: 1.4; }
.ph-wave-zh { font-size: 9px; color: #aaa; line-height: 1.4; }
.ph-wave-ex { font-size: 9px; color: #22C55E; background: #1a2a1a; padding: 4px 6px; border-radius: 4px; line-height: 1.4; }
.ph-wave-tip { font-size: 9px; color: #409eff; background: #1a2a3a; padding: 4px 6px; border-radius: 4px; line-height: 1.4; }

/* 水波训练列表 */
.ph-wave-list { margin: 4px 0; }
.ph-wave-item {
  display: flex; align-items: center; gap: 6px; padding: 7px 8px;
  background: #2d2d3f; border-radius: 8px; margin: 2px 0; cursor: pointer;
}
.ph-wave-item.sel { border: 1px solid #409eff; background: #1e2a3a; }
.ph-wave-item.cached { opacity: 0.7; }
.ph-wave-num {
  width: 16px; height: 16px; border-radius: 8px; background: #409eff;
  color: #fff; font-size: 9px; font-weight: 600; text-align: center; line-height: 16px;
  flex-shrink: 0;
}
.ph-wave-txt { font-size: 9px; color: #bbb; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.ph-wave-answer {
  background: #2d2d3f; border-radius: 10px; padding: 8px; margin: 6px 0;
  display: flex; flex-direction: column; gap: 6px;
}
.ph-wave-answer-title { font-size: 10px; font-weight: 600; color: #e0e0e0; }

/* 反转训练 */
.ph-rev-ref {
  background: #2d2d3f; border-radius: 8px; padding: 8px 10px;
  font-size: 10px; color: #bbb; line-height: 1.6;
}

/* ===== 方案B ===== */
.ph-page-tabs {
  display: flex; gap: 0; background: #2d2d3f; border-radius: 8px; padding: 2px;
}
.ph-page-tab {
  padding: 4px 16px; font-size: 11px; border-radius: 6px;
  color: #888; cursor: pointer;
}
.ph-page-tab.active { background: #409eff; color: #fff; }

.ph-src-fixed {
  margin: 4px 14px; padding: 8px 10px; background: #2d2d3f;
  border-radius: 10px; flex-shrink: 0; border-left: 3px solid #409eff;
}

.ph-textarea-b {
  width: 100%; flex: 1; background: #2d2d3f; border: none;
  border-radius: 12px; padding: 12px; color: #ddd; font-size: 12px;
  resize: none; outline: none; font-family: inherit;
}
.ph-textarea-b::placeholder { color: #555; }

.ph-result-hero {
  display: flex; gap: 10px; align-items: center; padding: 10px;
  background: #2d2d3f; border-radius: 12px; margin: 8px 0;
}

.ph-chart-placeholder {
  background: #2d2d3f; border-radius: 10px; padding: 10px;
  display: flex; flex-direction: column; align-items: center; margin-bottom: 8px;
}

/* ===== 说明区 ===== */
.scheme-notes {
  margin: 12px 0 0;
  padding-left: 20px;
  color: #666;
  font-size: 13px;
  line-height: 1.6;
}

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
