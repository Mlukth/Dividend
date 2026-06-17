<template>
  <div class="preview-page">
    <h2 class="page-title">📱 弹窗/抽屉 手机端适配方案对比</h2>
    <p class="page-desc">
      6.67英寸手机（375dp）。所有弹窗/抽屉需在手机上可用。<br>
      典型场景：提示词配置、短语默写、图片导入、历史记录、添加范文、生词池、词根分析。
    </p>

    <!-- ===== 方案对比 ===== -->
    <div class="schemes-row">
      <!-- 方案A：全屏弹窗 -->
      <div class="scheme-column">
        <div class="scheme-label">
          <span class="badge scheme1">方案 A</span>
          <strong>全屏弹窗 · 纵向滚动</strong>
        </div>
        <div class="mock-phone">
          <div class="phone-screen" style="background:#1a1a2e">
            <!-- 弹窗头部 -->
            <div class="ph-dialog-hdr">
              <span style="font-size:11px;color:#888" @click="aDialog=null">✕ 关闭</span>
              <span style="font-size:14px;font-weight:700;color:#fff">{{ aDialog }}</span>
              <span style="font-size:11px;color:#409eff">保存</span>
            </div>
            <div class="ph-dialog-body">
              <!-- 提示词配置示例 -->
              <div v-if="aDialog === '提示词配置'">
                <div class="ph-form-group">
                  <div class="ph-form-label">评分提示词</div>
                  <textarea class="ph-form-ta">请对以下英译中翻译进行评分，从准确性(25分)、语法结构(25分)、词汇表达(25分)、流畅度(25分)四个维度评分...</textarea>
                </div>
                <div class="ph-form-group">
                  <div class="ph-form-label">分段提示词</div>
                  <textarea class="ph-form-ta" style="height:80px">请将以下英文文本按意群切分成3-8个逻辑段落...</textarea>
                </div>
                <div class="ph-form-group">
                  <div class="ph-form-label">自定义提示词</div>
                  <div style="display:flex;gap:6px;align-items:center">
                    <span style="font-size:10px;color:#409eff;cursor:pointer">+ 添加</span>
                  </div>
                  <div style="background:#1e1e30;border-radius:6px;padding:6px;margin-top:4px">
                    <input class="ph-form-input" value="短文改错提示词" style="margin-bottom:4px">
                    <textarea class="ph-form-ta" style="height:60px">请检查以下英文翻译中的语法和拼写错误...</textarea>
                  </div>
                </div>
              </div>
              <!-- 短语默写示例 -->
              <div v-if="aDialog === '短语默写'">
                <div style="display:flex;gap:6px;margin-bottom:8px;flex-wrap:wrap">
                  <span v-for="s in ['全部','复习']" :key="s" class="ph-chip" :class="{on:s==='全部'}">{{ s }}</span>
                </div>
                <div class="ph-card-set-list">
                  <div v-for="(cs,i) in ['考研高频短语','真题生词','熟词僻义','写作模板句']" :key="i" class="ph-card-set-row">
                    <span style="font-size:11px;color:#ddd">{{ cs }}</span>
                    <span style="font-size:9px;color:#888">{{ 8+i*3 }}张</span>
                  </div>
                </div>
                <div style="border-top:1px solid #2d2d3f;padding-top:8px;margin-top:8px">
                  <div class="ph-form-label">📝 练习 — 考研高频短语 (3/11)</div>
                  <div style="background:#2d2d3f;border-radius:10px;padding:10px;text-align:center;margin-bottom:8px">
                    <div style="font-size:13px;color:#e0e0e0">以...为代价</div>
                    <div style="font-size:10px;color:#888;margin-top:2px">请输入英文短语</div>
                  </div>
                  <input class="ph-form-input" placeholder="输入英文翻译..." style="text-align:center;font-size:14px">
                  <div style="display:flex;gap:6px;margin-top:6px">
                    <div class="ph-btn-sm flex1" style="background:#22C55E">✓ 正确</div>
                    <div class="ph-btn-sm flex1" style="background:#e6a23c">↻ 复习</div>
                  </div>
                </div>
              </div>
              <!-- 图片导入示例 -->
              <div v-if="aDialog === '图片导入'">
                <div style="display:flex;gap:6px;margin-bottom:8px">
                  <span class="ph-chip on">单张导入</span>
                  <span class="ph-chip">批量导入</span>
                </div>
                <div class="ph-paste-zone">
                  <span style="font-size:24px">📷</span>
                  <span style="font-size:11px;color:#888">点击粘贴或选择图片</span>
                </div>
                <div class="ph-form-group">
                  <div class="ph-form-label">提取模式</div>
                  <div style="display:flex;gap:4px">
                    <span class="ph-chip on">严格提取</span>
                    <span class="ph-chip">参考提取</span>
                    <span class="ph-chip">仅短语</span>
                  </div>
                </div>
                <div class="ph-form-group">
                  <div class="ph-form-label">提示词</div>
                  <textarea class="ph-form-ta" style="height:60px">请分析这张考研英语教辅截图...</textarea>
                </div>
                <div class="ph-form-label">📋 粘贴 AI JSON 结果</div>
                <textarea class="ph-form-ta" style="height:60px"></textarea>
                <div class="ph-btn-sm" style="background:#409eff;text-align:center;margin-top:6px">解析并录入</div>
              </div>
            </div>
          </div>
        </div>
        <div class="ph-dialog-picker">
          <span v-for="d in dialogs" :key="d" class="ph-pick-btn" @click="aDialog = d">{{ d }}</span>
        </div>
        <ul class="scheme-notes">
          <li>所有弹窗变为全屏（100vw × 100dvh）</li>
          <li>内容纵向滚动，顶部固定标题栏 + 关闭/保存</li>
          <li>图片导入/短语默写的双栏布局改为纵向堆叠</li>
          <li>优点：实现简单（CSS一行），保留所有功能</li>
          <li>缺点：失去"弹窗"的空间感，像新开了一页</li>
        </ul>
      </div>

      <!-- 方案B：底部抽屉 -->
      <div class="scheme-column">
        <div class="scheme-label">
          <span class="badge scheme2">方案 B</span>
          <strong>底部抽屉 · 半屏弹出</strong>
        </div>
        <div class="mock-phone">
          <div class="phone-screen" style="background:#1a1a2e">
            <!-- 背景内容（Tab 页面半透明） -->
            <div style="flex:1;opacity:0.3;padding:12px">
              <div style="font-size:14px;font-weight:700;color:#fff;margin-bottom:8px">我的</div>
              <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">
                <div v-for="i in 6" :key="i" style="background:#2d2d3f;border-radius:12px;aspect-ratio:1"></div>
              </div>
            </div>
            <!-- 底部抽屉（半屏） -->
            <div class="ph-bottom-sheet">
              <div class="ph-sheet-handle"></div>
              <div class="ph-sheet-title">短语默写 · 中留英填</div>
              <div class="ph-sheet-body">
                <div style="display:flex;gap:4px;margin-bottom:8px">
                  <span v-for="s in ['考研高频短语 (11)','真题生词 (8)']" :key="s" class="ph-chip" :class="{on:s.includes('高频')}">{{ s }}</span>
                </div>
                <div style="background:#2d2d3f;border-radius:10px;padding:12px;text-align:center;margin-bottom:6px">
                  <div style="font-size:14px;color:#e0e0e0;margin-bottom:4px">以...为代价</div>
                  <div style="font-size:10px;color:#888">请输入英文短语</div>
                </div>
                <input class="ph-form-input" value="at the cost of" style="text-align:center;font-size:14px">
                <div style="display:flex;gap:6px;margin-top:6px">
                  <div class="ph-btn-sm flex1" style="background:#22C55E">✓ 正确</div>
                  <div class="ph-btn-sm flex1" style="background:#e6a23c">↻ 复习</div>
                </div>
                <div style="display:flex;gap:6px;margin-top:4px">
                  <div class="ph-btn-sm flex1" style="background:#374151">上一张</div>
                  <div class="ph-btn-sm flex1" style="background:#374151">下一张</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <ul class="scheme-notes">
          <li>弹窗从底部滑出，占屏幕 50-70% 高度</li>
          <li>背后页面半透明可见，保持上下文感</li>
          <li>顶部下拉手柄，可拖拽关闭</li>
          <li>优点：不打断当前页面，操作完即回</li>
          <li>缺点：内容多时需滚动，表单类弹窗不太适合</li>
        </ul>
      </div>

      <!-- 方案C：混合策略 -->
      <div class="scheme-column">
        <div class="scheme-label">
          <span class="badge scheme3">方案 C</span>
          <strong>混合策略 · 按类型分</strong>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:12px">
          <div class="ph-strategy-card">
            <div class="ph-strategy-icon">📋</div>
            <div>
              <div style="font-size:12px;font-weight:600;color:#e0e0e0">表单类 → 全屏</div>
              <div style="font-size:10px;color:#888">提示词配置 / 添加范文 / 设置</div>
            </div>
          </div>
          <div class="ph-strategy-card">
            <div class="ph-strategy-icon">📝</div>
            <div>
              <div style="font-size:12px;font-weight:600;color:#e0e0e0">练习类 → 底部抽屉</div>
              <div style="font-size:10px;color:#888">短语默写 / 生词池 / 词根分析</div>
            </div>
          </div>
          <div class="ph-strategy-card">
            <div class="ph-strategy-icon">🖼️</div>
            <div>
              <div style="font-size:12px;font-weight:600;color:#e0e0e0">工具类 → 全屏 + 分段</div>
              <div style="font-size:10px;color:#888">图片导入（上传→设置→结果 分段）</div>
            </div>
          </div>
          <div class="ph-strategy-card">
            <div class="ph-strategy-icon">📜</div>
            <div>
              <div style="font-size:12px;font-weight:600;color:#e0e0e0">浏览类 → 底部抽屉</div>
              <div style="font-size:10px;color:#888">历史记录 / 日历详情</div>
            </div>
          </div>
        </div>
        <ul class="scheme-notes">
          <li>不同弹窗用不同展开方式</li>
          <li>表单类全屏 → 空间大，方便打字</li>
          <li>练习类底部抽屉 → 不离开上下文</li>
          <li>实现最精细，但工作量比A方案大</li>
        </ul>
      </div>
    </div>

    <div class="interaction-tip">
      <h3>💡 选择建议</h3>
      <p>
        · <strong>方案A</strong>：实施最快，一条CSS解决全部。适合快速上线。<br>
        · <strong>方案B</strong>：体验最好，但有实现成本（手势拖拽/动画）。<br>
        · <strong>方案C</strong>：最精细但工作量大，每种弹窗单独适配。<br>
        建议先用方案A快速上线，后续逐个优化重要弹窗（短语默写优先做底部抽屉）。
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const aDialog = ref('提示词配置')
const dialogs = ['提示词配置', '短语默写', '图片导入']
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

.schemes-row { display: flex; gap: 24px; justify-content: center; flex-wrap: wrap; }

.scheme-column {
  flex: 1 1 300px; min-width: 320px; max-width: 380px;
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
.badge.scheme1 { background: #409eff; }
.badge.scheme2 { background: #67c23a; }
.badge.scheme3 { background: #e6a23c; }

/* 手机框 */
.mock-phone { display: flex; justify-content: center; margin-bottom: 8px; }
.phone-screen {
  width: 280px; height: 480px; border-radius: 28px; overflow: hidden;
  display: flex; flex-direction: column;
  box-shadow: 0 0 0 3px #333, 0 0 0 6px #1a1a1a, 0 12px 36px rgba(0,0,0,0.3);
  font-size: 12px; color: #e0e0e0; position: relative;
}

/* 方案A - 全屏弹窗 */
.ph-dialog-hdr {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 14px; flex-shrink: 0; border-bottom: 1px solid #2d2d3f;
}
.ph-dialog-body { flex: 1; overflow-y: auto; padding: 12px 14px; }

.ph-form-group { margin-bottom: 12px; }
.ph-form-label { font-size: 10px; color: #999; margin-bottom: 4px; font-weight: 600; }
.ph-form-ta {
  width: 100%; height: 100px; background: #2d2d3f; border: none;
  border-radius: 8px; padding: 8px; color: #ddd; font-size: 10px;
  resize: none; outline: none; font-family: inherit;
}
.ph-form-input {
  width: 100%; background: #2d2d3f; border: none; border-radius: 8px;
  padding: 8px; color: #ddd; font-size: 11px; outline: none;
}

.ph-chip {
  padding: 3px 8px; border-radius: 10px; font-size: 9px;
  background: #2d2d3f; color: #888; cursor: pointer;
}
.ph-chip.on { background: #409eff; color: #fff; }

.ph-card-set-list { display: flex; flex-direction: column; gap: 4px; }
.ph-card-set-row {
  display: flex; justify-content: space-between; padding: 8px 10px;
  background: #2d2d3f; border-radius: 8px; cursor: pointer;
}

.ph-paste-zone {
  height: 80px; border: 2px dashed #374151; border-radius: 12px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 4px; margin-bottom: 10px; cursor: pointer;
}

.ph-btn-sm { padding: 8px 12px; border-radius: 8px; font-size: 11px; color: #fff; cursor: pointer; }
.flex1 { flex: 1; text-align: center; }

.ph-dialog-picker { display: flex; gap: 6px; margin-top: 8px; }
.ph-pick-btn {
  flex: 1; text-align: center; padding: 6px; border-radius: 8px;
  background: #2d2d3f; color: #aaa; font-size: 10px; cursor: pointer;
}

/* 方案B - 底部抽屉 */
.ph-bottom-sheet {
  position: absolute; bottom: 0; left: 0; right: 0; max-height: 70%;
  background: #1e1e30; border-radius: 16px 16px 0 0;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.5); overflow: hidden;
}
.ph-sheet-handle {
  width: 32px; height: 4px; border-radius: 2px; background: #555;
  margin: 8px auto;
}
.ph-sheet-title {
  font-size: 13px; font-weight: 700; color: #fff; text-align: center; padding: 0 14px 8px;
}
.ph-sheet-body { padding: 0 14px 12px; overflow-y: auto; }

/* 方案C */
.ph-strategy-card {
  display: flex; gap: 10px; align-items: center;
  padding: 10px; background: #2d2d3f; border-radius: 10px;
}
.ph-strategy-icon { font-size: 20px; flex-shrink: 0; }

/* 通用 */
.scheme-notes { margin: 12px 0 0; padding-left: 20px; color: #666; font-size: 13px; line-height: 1.6; }

.interaction-tip {
  margin-top: 32px; background: #e6f7ff; border-radius: 20px; padding: 20px 28px; border-left: 6px solid #1890ff;
}
.interaction-tip h3 { margin: 0 0 8px; color: #1e1e1e; }
.interaction-tip p { margin: 0; color: #333; line-height: 1.6; }
</style>
