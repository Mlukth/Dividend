<template>
  <div class="preview-page">
    <h2 class="page-title">弹窗/抽屉 混合策略 — 细化方案 D~H</h2>
    <p class="page-desc">
      6.67英寸手机（375dp），深色主题。方案C"按类型分"的进一步拆解。<br>
      每种方案展示2~3类弹窗的具体处理方式。
    </p>

    <!-- ===== 方案 D ===== -->
    <div class="section-label">
      <span class="badge scheme4">方案 D</span>
      <strong>内容自适应高度</strong>
      <span style="font-size:11px;color:#888;margin-left:8px">统一底部抽屉 · 内容决定高度</span>
    </div>
    <div class="schemes-row">
      <div class="scheme-column" v-for="(item, i) in schemeD" :key="'d'+i">
        <div class="scheme-sub-label">{{ item.label }}</div>
        <div class="mock-phone">
          <div class="phone-screen" style="background:#1a1a2e">
            <div style="flex:1;opacity:0.25;padding:10px">
              <div style="font-size:12px;font-weight:700;color:#fff">App 背景</div>
              <div v-for="j in 4" :key="j" style="height:6px;background:#2d2d3f;border-radius:3px;margin:4px 0"></div>
            </div>
            <div class="ph-sheet-d" :style="{height: item.sheetH}">
              <div class="ph-sheet-handle"></div>
              <div class="ph-sheet-title-sm">{{ item.title }}</div>
              <div class="ph-sheet-body-sm">
                <div v-if="item.type==='short'" style="text-align:center;padding:10px 0">
                  <div style="font-size:28px;margin-bottom:6px">{{ item.icon }}</div>
                  <div style="font-size:11px;color:#ccc;margin-bottom:4px">{{ item.mainText }}</div>
                  <div style="font-size:9px;color:#888">{{ item.subText }}</div>
                  <div style="display:flex;gap:6px;margin-top:10px">
                    <div class="ph-d-btn flex1" style="background:#409eff">确认</div>
                    <div class="ph-d-btn flex1" style="background:#374151">取消</div>
                  </div>
                </div>
                <div v-if="item.type==='medium'" style="display:flex;flex-direction:column;gap:6px">
                  <div v-for="r in item.rows || 4" :key="r" style="display:flex;justify-content:space-between;align-items:center;padding:6px 8px;background:#2d2d3f;border-radius:6px">
                    <span style="font-size:10px;color:#ccc">{{ item.rowPrefix || '' }}{{ r }}</span>
                    <span style="font-size:9px;color:#888">→</span>
                  </div>
                </div>
                <div v-if="item.type==='tall'">
                  <div v-for="g in 3" :key="g" style="margin-bottom:8px">
                    <div style="font-size:9px;color:#999;margin-bottom:2px">配置项 {{ g }}</div>
                    <div style="height:28px;background:#2d2d3f;border-radius:5px"></div>
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

    <!-- ===== 方案 E ===== -->
    <div class="section-label">
      <span class="badge scheme5">方案 E</span>
      <strong>三段手动拖拽</strong>
      <span style="font-size:11px;color:#888;margin-left:8px">25% ⇄ 55% ⇄ 90% · 用户自由切换</span>
    </div>
    <div class="schemes-row">
      <div class="scheme-column" v-for="(item, i) in schemeE" :key="'e'+i">
        <div class="scheme-sub-label">{{ item.label }}</div>
        <div class="mock-phone">
          <div class="phone-screen" style="background:#1a1a2e">
            <div style="flex:1;opacity:0.2;padding:10px">
              <div style="font-size:12px;font-weight:700;color:#fff">App 背景</div>
            </div>
            <div class="ph-sheet-e" :style="{height: item.sheetH}">
              <div class="ph-sheet-handle"></div>
              <div style="display:flex;gap:3px;justify-content:center;margin-bottom:6px">
                <div class="ph-detent-dot" :class="{on: item.activeDetent===1}"></div>
                <div class="ph-detent-dot" :class="{on: item.activeDetent===2}"></div>
                <div class="ph-detent-dot" :class="{on: item.activeDetent===3}"></div>
              </div>
              <div class="ph-sheet-title-sm">{{ item.title }}</div>
              <div class="ph-sheet-body-sm">
                <div v-if="item.activeDetent===1" style="text-align:center;padding:4px 0">
                  <div style="font-size:10px;color:#888">↑ 上拉查看更多</div>
                </div>
                <div v-if="item.activeDetent===2">
                  <div v-for="r in 3" :key="r" style="padding:8px;background:#2d2d3f;border-radius:6px;margin-bottom:4px;font-size:10px;color:#ccc">
                    {{ item.midContent || '内容行' }} {{ r }}
                  </div>
                </div>
                <div v-if="item.activeDetent===3" style="max-height:100%;overflow-y:auto">
                  <div v-for="r in 6" :key="r" style="padding:8px;background:#2d2d3f;border-radius:6px;margin-bottom:4px;font-size:10px;color:#ccc">
                    {{ item.fullContent || '完整内容' }} {{ r }}
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

    <!-- ===== 方案 F ===== -->
    <div class="section-label">
      <span class="badge scheme6">方案 F</span>
      <strong>抽屉内嵌导航</strong>
      <span style="font-size:11px;color:#888;margin-left:8px">底部抽屉内 push/pop · 多步不跳全屏</span>
    </div>
    <div class="schemes-row">
      <div class="scheme-column" v-for="(item, i) in schemeF" :key="'f'+i">
        <div class="scheme-sub-label">{{ item.label }}</div>
        <div class="mock-phone">
          <div class="phone-screen" style="background:#1a1a2e">
            <div style="flex:1;opacity:0.2;padding:10px">
              <div style="font-size:12px;font-weight:700;color:#fff">App 背景</div>
            </div>
            <div class="ph-sheet-f">
              <div class="ph-sheet-handle"></div>
              <!-- 步骤条 -->
              <div style="display:flex;align-items:center;gap:4px;padding:0 14px 6px">
                <div v-for="(s, si) in item.steps" :key="si" style="display:flex;align-items:center;gap:4px;flex:1">
                  <div class="ph-step-dot" :class="{done: si < item.currentStep, active: si === item.currentStep}">{{ si < item.currentStep ? '✓' : si+1 }}</div>
                  <div style="font-size:7px;color:#888;white-space:nowrap">{{ s }}</div>
                  <div v-if="si < item.steps.length-1" style="flex:1;height:1px;background:#374151;margin:0 2px"></div>
                </div>
              </div>
              <div class="ph-sheet-title-sm" style="display:flex;align-items:center;gap:6px">
                <span v-if="item.currentStep > 0" style="font-size:10px;color:#409eff;cursor:pointer">← 上一步</span>
                <span>{{ item.steps[item.currentStep] }}</span>
              </div>
              <div class="ph-sheet-body-sm">
                <!-- 步骤内容 -->
                <div v-if="item.currentStep === 0">
                  <div class="ph-f-upload-zone">{{ item.step0Content || '点击上传' }}</div>
                </div>
                <div v-if="item.currentStep === 1">
                  <div v-for="g in 3" :key="g" style="margin-bottom:6px">
                    <div style="font-size:9px;color:#999;margin-bottom:2px">设置 {{ g }}</div>
                    <div style="display:flex;gap:4px">
                      <span v-for="opt in ['A','B','C']" :key="opt" class="ph-d-chip" :class="{on: opt==='A'}">{{ opt }}</span>
                    </div>
                  </div>
                </div>
                <div v-if="item.currentStep === 2">
                  <div style="background:#1a2a1a;border-radius:8px;padding:8px;font-size:9px;color:#86efac;line-height:1.4">
                    {{ item.step2Content || 'AI 解析结果...' }}
                  </div>
                  <div class="ph-d-btn" style="background:#22C55E;text-align:center;margin-top:8px">确认录入</div>
                </div>
                <!-- 底部按钮 -->
                <div v-if="item.currentStep < 2" style="display:flex;gap:6px;margin-top:auto;padding-top:8px">
                  <div class="ph-d-btn flex1" style="background:#409eff" @click="item.currentStep = Math.min(2, item.currentStep+1)">下一步</div>
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
      <span class="badge scheme7">方案 G</span>
      <strong>类型精准匹配</strong>
      <span style="font-size:11px;color:#888;margin-left:8px">四种容器 · 每种弹窗选最佳</span>
    </div>
    <div class="schemes-row">
      <div class="scheme-column" v-for="(item, i) in schemeG" :key="'g'+i">
        <div class="scheme-sub-label">{{ item.label }}</div>
        <div class="mock-phone">
          <div class="phone-screen" style="background:#1a1a2e">
            <!-- 表单全屏 -->
            <template v-if="item.mode==='fullscreen'">
              <div class="ph-dialog-hdr">
                <span style="font-size:10px;color:#888">✕ 取消</span>
                <span style="font-size:13px;font-weight:700;color:#fff">{{ item.title }}</span>
                <span style="font-size:10px;color:#409eff">保存</span>
              </div>
              <div class="ph-dialog-body">
                <div v-for="g in 4" :key="g" style="margin-bottom:10px">
                  <div style="font-size:9px;color:#999;margin-bottom:3px">{{ item.fieldLabel || '字段' }} {{ g }}</div>
                  <div v-if="g===3" style="height:80px;background:#2d2d3f;border-radius:6px"></div>
                  <div v-else style="height:28px;background:#2d2d3f;border-radius:6px"></div>
                </div>
              </div>
            </template>
            <!-- 底部抽屉 -->
            <template v-if="item.mode==='bottomsheet'">
              <div style="flex:1;opacity:0.2;padding:10px"></div>
              <div class="ph-sheet-d" style="height:58%">
                <div class="ph-sheet-handle"></div>
                <div class="ph-sheet-title-sm">{{ item.title }}</div>
                <div class="ph-sheet-body-sm">
                  <div v-for="r in 4" :key="r" style="padding:7px;background:#2d2d3f;border-radius:6px;margin-bottom:4px;font-size:10px;color:#ccc;display:flex;justify-content:space-between">
                    <span>{{ item.rowName || '条目' }} {{ r }}</span>
                    <span style="color:#888;font-size:9px">→</span>
                  </div>
                </div>
              </div>
            </template>
            <!-- 侧边滑入 -->
            <template v-if="item.mode==='sidedrawer'">
              <div style="flex:1;opacity:0.2;padding:10px"></div>
              <div class="ph-side-drawer">
                <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;border-bottom:1px solid #2d2d3f">
                  <span style="font-size:13px;font-weight:700;color:#fff">{{ item.title }}</span>
                  <span style="font-size:10px;color:#888">✕</span>
                </div>
                <div style="flex:1;overflow-y:auto;padding:8px">
                  <div v-for="r in 5" :key="r" style="padding:10px;background:#2d2d3f;border-radius:8px;margin-bottom:6px">
                    <div style="font-size:10px;color:#ccc">{{ item.rowName || '记录' }} {{ r }}</div>
                    <div style="font-size:8px;color:#888;margin-top:2px">2024-0{{ r }}-15 · 得分 8{{ r }}</div>
                  </div>
                </div>
              </div>
            </template>
            <!-- 居中模态 -->
            <template v-if="item.mode==='centerModal'">
              <div style="flex:1;opacity:0.2;padding:10px"></div>
              <div class="ph-center-modal">
                <div style="text-align:center;padding:12px">
                  <div style="font-size:32px;margin-bottom:6px">{{ item.icon || '📝' }}</div>
                  <div style="font-size:13px;font-weight:700;color:#fff;margin-bottom:4px">{{ item.title }}</div>
                  <div style="font-size:9px;color:#888;margin-bottom:8px">{{ item.modalDesc || '快速操作' }}</div>
                  <div style="height:28px;background:#2d2d3f;border-radius:6px;margin-bottom:8px"></div>
                  <div style="display:flex;gap:6px">
                    <div class="ph-d-btn flex1" style="background:#22C55E">✓</div>
                    <div class="ph-d-btn flex1" style="background:#e6a23c">↻</div>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
        <ul class="scheme-notes-sm">
          <li v-for="n in item.notes" :key="n">{{ n }}</li>
        </ul>
      </div>
    </div>

    <!-- ===== 方案 H ===== -->
    <div class="section-label">
      <span class="badge scheme8">方案 H</span>
      <strong>键盘感知二分法</strong>
      <span style="font-size:11px;color:#888;margin-left:8px">最简混合 · 只看需不需要打字</span>
    </div>
    <div class="schemes-row">
      <div class="scheme-column" v-for="(item, i) in schemeH" :key="'h'+i">
        <div class="scheme-sub-label">{{ item.label }}</div>
        <div class="mock-phone">
          <div class="phone-screen" style="background:#1a1a2e">
            <template v-if="item.needsKeyboard">
              <!-- 需要键盘 → 全屏 -->
              <div class="ph-dialog-hdr">
                <span style="font-size:10px;color:#888">✕</span>
                <span style="font-size:13px;font-weight:700;color:#fff">{{ item.title }}</span>
                <span style="font-size:10px;color:#409eff">保存</span>
              </div>
              <div class="ph-dialog-body">
                <div v-for="g in (item.fields || 3)" :key="g" style="margin-bottom:10px">
                  <div style="font-size:9px;color:#999;margin-bottom:3px">配置项 {{ g }}</div>
                  <div v-if="g===item.fields" style="height:70px;background:#2d2d3f;border-radius:6px;display:flex;align-items:flex-start;padding:6px">
                    <span style="font-size:9px;color:#555">| 输入框...</span>
                  </div>
                  <div v-else style="height:28px;background:#2d2d3f;border-radius:6px;display:flex;align-items:center;padding:0 8px">
                    <span style="font-size:9px;color:#555">输入...</span>
                  </div>
                </div>
                <!-- 模拟键盘 -->
                <div style="background:#1a1a1a;border-radius:8px;padding:8px;margin-top:6px">
                  <div v-for="row in 3" :key="row" style="display:flex;gap:3px;margin-bottom:3px;justify-content:center">
                    <div v-for="k in (row===3?3:6)" :key="k" style="width:22px;height:22px;background:#333;border-radius:4px"></div>
                  </div>
                </div>
              </div>
            </template>
            <template v-else>
              <!-- 不需要键盘 → 底部抽屉 -->
              <div style="flex:1;opacity:0.2;padding:10px"></div>
              <div class="ph-sheet-d" :style="{height: item.sheetH || '52%'}">
                <div class="ph-sheet-handle"></div>
                <div class="ph-sheet-title-sm">{{ item.title }}</div>
                <div class="ph-sheet-body-sm">
                  <div v-if="item.contentType==='list'">
                    <div v-for="r in 4" :key="r" style="padding:8px;background:#2d2d3f;border-radius:6px;margin-bottom:4px;display:flex;justify-content:space-between">
                      <span style="font-size:10px;color:#ccc">{{ item.rowName || '条目' }} {{ r }}</span>
                      <span style="font-size:9px;color:#888">→</span>
                    </div>
                  </div>
                  <div v-if="item.contentType==='practice'" style="text-align:center">
                    <div style="background:#2d2d3f;border-radius:10px;padding:10px;margin-bottom:6px">
                      <div style="font-size:13px;color:#e0e0e0">{{ item.practiceQ || '以...为代价' }}</div>
                      <div style="font-size:9px;color:#888;margin-top:2px">请输入英文</div>
                    </div>
                    <div style="display:flex;gap:4px">
                      <div class="ph-d-btn flex1" style="background:#22C55E">✓ 正确</div>
                      <div class="ph-d-btn flex1" style="background:#e6a23c">↻ 复习</div>
                    </div>
                  </div>
                  <div v-if="item.contentType==='tool'" style="text-align:center">
                    <div style="font-size:28px;margin-bottom:4px">{{ item.icon || '🔬' }}</div>
                    <div style="font-size:10px;color:#ccc;margin-bottom:4px">{{ item.toolResult || '分析结果' }}</div>
                    <div style="display:flex;flex-wrap:wrap;gap:3px;justify-content:center">
                      <span v-for="t in ['前缀','词根','后缀','词源']" :key="t" class="ph-d-chip">{{ t }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </template>
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
            <th>用户认知负担</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span class="badge-sm s4">D</span></td>
            <td>内容自适应高度</td>
            <td>内容量差异大的产品</td>
            <td>中</td>
            <td>低（自动，无感）</td>
          </tr>
          <tr>
            <td><span class="badge-sm s5">E</span></td>
            <td>三段手动拖拽</td>
            <td>需要灵活查看详情的场景</td>
            <td>高（手势+动画）</td>
            <td>中（需学习拖拽）</td>
          </tr>
          <tr>
            <td><span class="badge-sm s6">F</span></td>
            <td>抽屉内嵌导航</td>
            <td>多步骤流程（如图片导入）</td>
            <td>高（步骤状态机）</td>
            <td>低（步骤条引导）</td>
          </tr>
          <tr>
            <td><span class="badge-sm s7">G</span></td>
            <td>四种容器精准匹配</td>
            <td>弹窗类型差异极大的产品</td>
            <td>最高（4套容器）</td>
            <td>中（不同弹窗不同体验）</td>
          </tr>
          <tr>
            <td><span class="badge-sm s8">H</span></td>
            <td>键盘感知二分法</td>
            <td>快速落地，规则极简</td>
            <td>最低</td>
            <td>最低（只有两种）</td>
          </tr>
        </tbody>
      </table>
      <p style="margin-top:16px">
        <strong>推荐</strong>：先上 <strong>方案H</strong>（二分法，2天搞定），高频弹窗（短语默写）按 <strong>方案D</strong> 做自适应高度，图片导入按 <strong>方案F</strong> 加步骤条。方案G成本太高不推荐初期全部实现。
      </p>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

// ---- 方案 D: 内容自适应高度 ----
const schemeD = reactive([
  {
    label: '短内容 · 35% peek',
    type: 'short', sheetH: '35%',
    icon: '📋', title: '历史记录',
    mainText: '最近 7 条练习记录',
    subText: '共 148 次练习',
    notes: ['内容少时抽屉仅占35%', '背后页面大面积可见', '上下文保持感最强']
  },
  {
    label: '中内容 · 55% 半屏',
    type: 'medium', sheetH: '55%',
    title: '生词短语池', rows: 4, rowPrefix: '词汇组 ',
    notes: ['列表4-8条时用55%', '足够展示主要信息', '用户可手动上拉至85%']
  },
  {
    label: '长内容 · 85% 高屏',
    type: 'tall', sheetH: '85%',
    title: '提示词配置',
    notes: ['表单多、需键盘输入时', '自动撑到85%给键盘留空间', '本质接近全屏但有底部背景']
  }
])

// ---- 方案 E: 三段手动拖拽 ----
const schemeE = reactive([
  {
    label: '短语默写 · 默认50%',
    sheetH: '50%', activeDetent: 2,
    title: '短语默写 · 中留英填',
    midContent: '考研高频短语',
    fullContent: '完整短语卡片',
    notes: ['默认停在半屏(55%)', '拖拽手柄切换到25%或90%', '25%=纯浏览, 90%=详情编辑']
  },
  {
    label: '图片导入 · 默认90%',
    sheetH: '90%', activeDetent: 3,
    title: '图片导入',
    midContent: '上传区域',
    fullContent: '完整设置项',
    notes: ['多步骤工具默认90%', '用户可下拉到55%看背景', '三档手势需惯性动画']
  },
  {
    label: '历史记录 · 默认25%',
    sheetH: '25%', activeDetent: 1,
    title: '练习历史',
    notes: ['纯浏览类默认25% peek', '快速扫一眼即可关闭', '上拉展开看详情']
  }
])

// ---- 方案 F: 抽屉内嵌导航 ----
const schemeF = reactive([
  {
    label: '图片导入 · 3步',
    steps: ['上传图片', '设置参数', '确认录入'],
    currentStep: 0, step0Content: '📷 点击上传或粘贴截图',
    notes: ['步骤条在抽屉顶部', '每步完成后点"下一步"', '不跳全屏, 上下文不丢']
  },
  {
    label: '图片导入 · 第2步',
    steps: ['上传图片', '设置参数', '确认录入'],
    currentStep: 1,
    notes: ['设置提取模式/提示词', '可"上一步"返回修改', '滑动切换步骤(可选)']
  },
  {
    label: '图片导入 · 第3步',
    steps: ['上传图片', '设置参数', '确认录入'],
    currentStep: 2, step2Content: '{"accuracy":21,"grammar":19,...}',
    notes: ['AI结果预览+确认', '"确认录入"关闭抽屉', '全程在抽屉内完成']
  }
])

// ---- 方案 G: 四种容器精准匹配 ----
const schemeG = reactive([
  {
    label: '表单类 → 全屏',
    mode: 'fullscreen', title: '提示词配置', fieldLabel: '提示词字段',
    notes: ['需要大量键盘输入 → 全屏', '标题栏+保存/取消固定顶部', '分类: 提示词/添加范文/设置']
  },
  {
    label: '浏览类 → 底部抽屉',
    mode: 'bottomsheet', title: '生词短语池', rowName: '词汇组',
    notes: ['纯浏览/选择 → 底部抽屉', '保持背后页面可见', '分类: 历史记录/生词池']
  },
  {
    label: '列表类 → 侧边滑入',
    mode: 'sidedrawer', title: '练习历史',
    notes: ['长列表浏览 → 右侧滑入', 'iOS风格, 左滑返回', '分类: 日历详情/全部记录']
  },
  {
    label: '快速操作 → 居中模态',
    mode: 'centerModal', title: '词根分析', icon: '🔬',
    modalDesc: '输入单词查看词根分解',
    notes: ['简单交互 → 居中弹性模态', '适合查询/确认类操作', '分类: 词根分析/快速查词']
  }
])

// ---- 方案 H: 键盘感知二分法 ----
const schemeH = reactive([
  {
    label: '需键盘 → 全屏',
    needsKeyboard: true, title: '提示词配置', fields: 4,
    notes: ['需要键盘输入 → 全屏弹窗', '键盘弹出后空间充足', '适用: 提示词/添加范文/图片导入设置']
  },
  {
    label: '不需键盘 → 底部抽屉',
    needsKeyboard: false, sheetH: '52%', title: '生词短语池',
    contentType: 'list', rowName: '词汇组',
    notes: ['不需要键盘 → 底部抽屉', '快速浏览/选择', '适用: 历史/生词池/日历']
  },
  {
    label: '不需键盘 → 底部抽屉',
    needsKeyboard: false, sheetH: '55%', title: '短语默写',
    contentType: 'practice', practiceQ: 'at the cost of',
    notes: ['交互操作 → 底部抽屉', '正确/复习按钮在底部', '适用: 短语默写/词根分析']
  },
  {
    label: '不需键盘 → 底部抽屉',
    needsKeyboard: false, sheetH: '48%', title: '词根分析',
    contentType: 'tool', icon: '🔬', toolResult: 'dis·trib·ute',
    notes: ['查询结果展示 → 底部抽屉', '结果简单, 不需要大空间', '适用: 词根/生词详情']
  }
])
</script>

<style scoped>
* { box-sizing: border-box; }

.preview-page {
  padding: 24px 20px; max-width: 1500px; margin: 0 auto;
  font-family: system-ui, -apple-system, 'Microsoft YaHei', sans-serif;
  background: #f0f2f5; min-height: 100vh;
}

.page-title { text-align: center; margin-bottom: 8px; color: #1e1e1e; font-weight: 600; font-size: 24px; }
.page-desc { text-align: center; color: #555; margin-bottom: 0; font-size: 13px; line-height: 1.6; }

/* 分区标签 */
.section-label {
  display: flex; align-items: center; gap: 8px;
  margin: 28px 0 14px; padding: 12px 18px;
  background: #fff; border-radius: 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.schemes-row { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }

.scheme-column {
  flex: 1 1 240px; min-width: 240px; max-width: 280px;
  background: #ffffff; border-radius: 20px; padding: 16px 12px 20px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.05);
  display: flex; flex-direction: column;
}

.scheme-sub-label {
  font-size: 11px; font-weight: 600; color: #555;
  text-align: center; margin-bottom: 8px;
}

/* Badges */
.badge { padding: 4px 10px; border-radius: 30px; font-size: 12px; font-weight: 600; color: white; }
.badge.scheme4 { background: #8b5cf6; }
.badge.scheme5 { background: #ec4899; }
.badge.scheme6 { background: #f97316; }
.badge.scheme7 { background: #14b8a6; }
.badge.scheme8 { background: #6366f1; }

/* 手机框 */
.mock-phone { display: flex; justify-content: center; margin-bottom: 6px; }
.phone-screen {
  width: 240px; height: 420px; border-radius: 24px; overflow: hidden;
  display: flex; flex-direction: column;
  box-shadow: 0 0 0 3px #333, 0 0 0 6px #1a1a1a, 0 10px 28px rgba(0,0,0,0.3);
  font-size: 12px; color: #e0e0e0; position: relative;
}

/* 通用弹窗元素 */
.ph-dialog-hdr {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 12px; flex-shrink: 0; border-bottom: 1px solid #2d2d3f;
}
.ph-dialog-body { flex: 1; overflow-y: auto; padding: 10px 12px; }

/* 底部抽屉通用 */
.ph-sheet-d, .ph-sheet-e, .ph-sheet-f {
  position: absolute; bottom: 0; left: 0; right: 0;
  background: #1e1e30; border-radius: 14px 14px 0 0;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.5); overflow: hidden;
  display: flex; flex-direction: column;
}
.ph-sheet-handle {
  width: 28px; height: 4px; border-radius: 2px; background: #555;
  margin: 7px auto; flex-shrink: 0;
}
.ph-sheet-title-sm {
  font-size: 11px; font-weight: 700; color: #fff;
  text-align: center; padding: 0 12px 6px; flex-shrink: 0;
}
.ph-sheet-body-sm { flex: 1; overflow-y: auto; padding: 0 12px 10px; }

/* 方案D 高度示意 */
.ph-d-btn { padding: 7px 10px; border-radius: 7px; font-size: 10px; color: #fff; cursor: pointer; }
.flex1 { flex: 1; text-align: center; }

/* 方案E 档位点 */
.ph-detent-dot {
  width: 5px; height: 5px; border-radius: 3px; background: #374151; transition: all 0.2s;
}
.ph-detent-dot.on { width: 16px; background: #409eff; }

/* 方案F 步骤点 */
.ph-step-dot {
  width: 15px; height: 15px; border-radius: 8px;
  background: #374151; font-size: 8px; color: #888;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.ph-step-dot.active { background: #409eff; color: #fff; }
.ph-step-dot.done { background: #22C55E; color: #fff; }
.ph-f-upload-zone {
  height: 60px; border: 2px dashed #374151; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; color: #888; margin-bottom: 8px;
}

/* 方案G 四种容器 */
.ph-side-drawer {
  position: absolute; top: 0; right: 0; bottom: 0; width: 75%;
  background: #1e1e30; display: flex; flex-direction: column;
  box-shadow: -4px 0 20px rgba(0,0,0,0.5);
}
.ph-center-modal {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
  width: 75%; background: #1e1e30; border-radius: 16px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.6);
}
.ph-d-chip {
  padding: 2px 6px; border-radius: 8px; font-size: 8px;
  background: #374151; color: #888; cursor: pointer;
}
.ph-d-chip.on { background: #409eff; color: #fff; }

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
.badge-sm.s4 { background: #8b5cf6; }
.badge-sm.s5 { background: #ec4899; }
.badge-sm.s6 { background: #f97316; }
.badge-sm.s7 { background: #14b8a6; }
.badge-sm.s8 { background: #6366f1; }
</style>
