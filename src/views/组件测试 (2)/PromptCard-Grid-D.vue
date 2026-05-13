<template>
  <div class="prompt-card-container">
    <!-- 顶部遗物栏 -->
    <header class="relic-bar">
      <div class="relic-left">
        <span class="relic-icon">📜</span>
        <span class="relic-title">提示词库</span>
        <span class="scheme-badge scheme-d">方案D - 悬浮揭示</span>
      </div>
      <div class="relic-center">
        <el-button-group>
          <el-button :type="mode === 'browse' ? 'primary' : 'default'" @click="mode = 'browse'">
            <span>👁️</span> 浏览模式
          </el-button>
          <el-button :type="mode === 'copy' ? 'primary' : 'default'" @click="mode = 'copy'">
            <span>⚡</span> 一键复制
          </el-button>
        </el-button-group>
      </div>
      <div class="relic-right">
        <span class="total-count">调用 <strong>{{ totalUsage }}</strong> 次</span>
        <span class="card-count">共 <strong>{{ filteredCards.length }}</strong> 张</span>
      </div>
    </header>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <div class="category-filters">
        <el-radio-group v-model="selectedCategory" size="small">
          <el-radio-button label="全部" value="ALL" />
          <el-radio-button label="💻 代码" value="CDEV" />
          <el-radio-button label="📋 管理" value="PM" />
          <el-radio-button label="🔍 信息" value="INFO" />
          <el-radio-button label="📚 学习" value="LEARN" />
          <el-radio-button label="📝 文书" value="DOC" />
          <el-radio-button label="🔧 工具" value="TOOL" />
        </el-radio-group>
      </div>
      <div class="filter-actions">
        <el-input v-model="searchQuery" placeholder="搜索提示词..." prefix-icon="Search" clearable style="width: 200px" />
        <el-button type="primary">导入</el-button>
        <el-button type="success">新卡</el-button>
      </div>
    </div>

    <!-- 卡片网格 -->
    <div class="card-grid">
      <div
        v-for="card in filteredCards"
        :key="card.id"
        :class="['prompt-card', `rarity-${card.rarity}`, `category-${card.category}`]"
        @click="handleCardClick(card)"
      >
        <!-- 悬浮铜色光泽层 -->
        <div class="hover-copper-shimmer"></div>
        
        <!-- 复杂度球 -->
        <div :class="['complexity-sphere', `complexity-${card.complexity}`]">
          {{ card.complexity }}
        </div>

        <!-- 分类边框 -->
        <div :class="['category-border', `border-${card.category}`]"></div>

        <!-- 主内容 -->
        <div class="card-content">
          <div class="card-icon">{{ card.icon }}</div>
          <div class="card-code">{{ card.code }}</div>
          <div class="card-name">{{ card.name }}</div>
          <div :class="['card-tag', `tag-${card.category}`]">{{ getCategoryName(card.category) }}</div>
          <div class="card-desc">{{ card.description }}</div>
          <div class="card-version">
            <span class="version-text">v{{ card.version }}</span>
            <span v-if="card.variants > 0" class="variant-badge">+{{ card.variants }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog v-model="showDetail" :show-close="false" :close-on-click-modal="true" width="900px" class="detail-dialog">
      <div class="detail-container">
        <div :class="['detail-card', `rarity-${currentCard?.rarity}`]">
          <div class="detail-header">
            <span class="detail-icon">{{ currentCard?.icon }}</span>
            <span class="detail-code">{{ currentCard?.code }}</span>
          </div>
          <div class="detail-name">{{ currentCard?.name }}</div>
          <div :class="['detail-tag', `tag-${currentCard?.category}`]">{{ getCategoryName(currentCard?.category) }}</div>
          <div class="detail-content"><pre>{{ currentCard?.content }}</pre></div>
        </div>
        <div class="detail-sidebar">
          <div class="sidebar-section">
            <h4>变体版本</h4>
            <div class="variant-list">
              <div class="variant-node root"><span class="variant-label">v{{ currentCard?.version }}</span><span class="variant-desc">原始版本</span></div>
              <div v-for="i in (currentCard?.variants || 0)" :key="i" class="variant-node">
                <div class="variant-connector"></div>
                <span class="variant-label">v{{ currentCard?.version }}.{{ i }}</span>
                <span class="variant-desc">变体 {{ i }}</span>
              </div>
            </div>
          </div>
          <div class="sidebar-section">
            <h4>操作</h4>
            <el-button type="primary" size="large" class="copy-btn" @click="copyContent"><span>📋</span> 复制到剪贴板</el-button>
            <div class="usage-info">已使用 <strong>{{ currentCard?.usageCount }}</strong> 次</div>
          </div>
          <div class="sidebar-section">
            <h4>灵感/备注</h4>
            <el-input type="textarea" v-model="note" placeholder="添加你的备注..." :rows="3" />
          </div>
          <div class="sidebar-section">
            <h4>测试日志</h4>
            <div class="log-list">
              <div v-for="(log, idx) in (currentCard?.logs || [])" :key="idx" class="log-item">
                <span class="log-time">{{ log.time }}</span>
                <span class="log-text">{{ log.text }}</span>
              </div>
              <div v-if="!currentCard?.logs?.length" class="log-empty">暂无日志</div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const mockCards = [
  { id: 1, icon: '💻', code: 'CDEV-extract-001', name: '组件提取专家', category: 'CDEV', description: '从复杂代码中提取可复用组件的最佳实践', complexity: 2, version: '1.2', variants: 2, usageCount: 156, logs: [] },
  { id: 2, icon: '📋', code: 'PM-prompt-库-003', name: '提示词库构建器', category: 'PM', description: '构建结构化提示词库的管理框架', complexity: 1, version: '2.0', variants: 0, usageCount: 89, logs: [] },
  { id: 3, icon: '🔍', code: 'INFO-analyze-007', name: '信息分析助手', category: 'INFO', description: '深度分析文本信息并提取关键洞察', complexity: 3, version: '1.5', variants: 1, usageCount: 312, logs: [] },
  { id: 4, icon: '📚', code: 'LEARN-summary-012', name: '学习摘要生成', category: 'LEARN', description: '从教材中自动生成学习要点摘要', complexity: 2, version: '1.0', variants: 0, usageCount: 45, logs: [] },
  { id: 5, icon: '📝', code: 'DOC-report-004', name: '报告撰写助手', category: 'DOC', description: '专业报告的结构化撰写模板', complexity: 2, version: '3.1', variants: 3, usageCount: 567, logs: [] },
  { id: 6, icon: '🔧', code: 'TOOL-debug-008', name: '代码调试向导', category: 'TOOL', description: '智能定位并修复代码错误的流程', complexity: 3, version: '2.3', variants: 1, usageCount: 234, logs: [] },
  { id: 7, icon: '💻', code: 'CDEV-refactor-009', name: '代码重构助手', category: 'CDEV', description: '优化代码结构提升可维护性', complexity: 2, version: '1.1', variants: 0, usageCount: 78, logs: [] },
  { id: 8, icon: '📋', code: 'PM-chain-011', name: '思维链设计器', category: 'PM', description: '构建多步推理的提示词链', complexity: 3, version: '2.0', variants: 2, usageCount: 145, logs: [] },
  { id: 9, icon: '🔍', code: 'INFO-extract-015', name: '数据提取工具', category: 'INFO', description: '从非结构化文本中提取结构化数据', complexity: 2, version: '1.3', variants: 0, usageCount: 67, logs: [] },
  { id: 10, icon: '📚', code: 'LEARN-quiz-018', name: '测验题生成器', category: 'LEARN', description: '根据内容自动生成测验题目', complexity: 1, version: '1.0', variants: 0, usageCount: 23, logs: [] },
  { id: 11, icon: '📝', code: 'DOC-email-021', name: '邮件撰写模板', category: 'DOC', description: '各类商务邮件的标准模板库', complexity: 1, version: '2.1', variants: 1, usageCount: 189, logs: [] },
  { id: 12, icon: '🔧', code: 'TOOL-test-025', name: '测试用例生成', category: 'TOOL', description: '自动生成单元测试和集成测试', complexity: 3, version: '1.8', variants: 2, usageCount: 98, logs: [] },
  { id: 13, icon: '💻', code: 'CDEV-api-028', name: 'API文档生成', category: 'CDEV', description: '自动生成规范化的API文档', complexity: 2, version: '2.0', variants: 0, usageCount: 134, logs: [] },
  { id: 14, icon: '📋', code: 'PM-version-031', name: '版本迭代管理', category: 'PM', description: '提示词版本控制与变更追踪', complexity: 1, version: '1.2', variants: 0, usageCount: 56, logs: [] },
  { id: 15, icon: '🔍', code: 'INFO-compare-034', name: '对比分析工具', category: 'INFO', description: '多文档对比与差异高亮', complexity: 2, version: '1.0', variants: 0, usageCount: 89, logs: [] },
  { id: 16, icon: '📚', code: 'LEARN-flash-037', name: '闪卡学习助手', category: 'LEARN', description: '基于艾宾浩斯记忆曲线的复习计划', complexity: 2, version: '1.5', variants: 1, usageCount: 167, logs: [] },
  { id: 17, icon: '📝', code: 'DOC-proposal-041', name: '方案提案生成', category: 'DOC', description: '商业方案的框架与撰写指南', complexity: 3, version: '2.2', variants: 2, usageCount: 234, logs: [] },
  { id: 18, icon: '🔧', code: 'TOOL-deploy-044', name: '部署脚本生成', category: 'TOOL', description: '一键生成应用部署脚本', complexity: 2, version: '1.0', variants: 0, usageCount: 12, logs: [] },
  { id: 19, icon: '💻', code: 'CDEV-review-047', name: '代码审查清单', category: 'CDEV', description: '标准化代码审查要点清单', complexity: 1, version: '1.3', variants: 0, usageCount: 78, logs: [] },
  { id: 20, icon: '📋', code: 'PM-optimize-051', name: '提示词优化器', category: 'PM', description: '自动优化提示词的表达与结构', complexity: 3, version: '3.0', variants: 4, usageCount: 456, logs: [] },
]

const mode = ref('browse')
const selectedCategory = ref('ALL')
const searchQuery = ref('')
const showDetail = ref(false)
const currentCard = ref(null)
const note = ref('')

const getRarity = (usageCount) => {
  if (usageCount >= 300) return 'gold'
  if (usageCount >= 100) return 'silver'
  if (usageCount >= 50) return 'bronze'
  return 'copper'
}

const cardsWithContent = computed(() => mockCards.map(card => ({
  ...card,
  rarity: getRarity(card.usageCount),
  content: `${card.name}\n\n【角色定义】\n你是一个专业的${getCategoryName(card.category)}专家，擅长${card.description}。\n\n【核心能力】\n- 精准理解和分析用户需求\n- 提供专业、高效的解决方案\n- 持续优化和迭代输出质量\n\n【工作流程】\n1. 理解并确认用户需求\n2. 分析问题关键点\n3. 逐步执行并给出反馈\n4. 根据反馈优化结果\n\n【输出要求】\n- 结构清晰、逻辑完整\n- 语言简洁、专业\n- 提供可操作的建议`
})))

const filteredCards = computed(() => {
  let result = cardsWithContent.value
  if (selectedCategory.value !== 'ALL') result = result.filter(c => c.category === selectedCategory.value)
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(c => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.code.toLowerCase().includes(q))
  }
  return result.sort((a, b) => b.usageCount - a.usageCount)
})

const totalUsage = computed(() => mockCards.reduce((s, c) => s + c.usageCount, 0))
const getCategoryName = (c) => ({ CDEV: '代码工程', PM: '提示词管理', INFO: '信息处理', LEARN: '学习辅助', DOC: '文书产出', TOOL: '工具开发' }[c] || c)

const handleCardClick = (card) => {
  if (mode.value === 'copy') {
    copyToClipboard(card.content)
    card.usageCount++
    localStorage.setItem(`card-${card.id}-usage`, card.usageCount)
  } else {
    currentCard.value = card
    note.value = localStorage.getItem(`card-${card.id}-note`) || ''
    showDetail.value = true
  }
}

const copyContent = () => {
  if (currentCard.value) {
    copyToClipboard(currentCard.value.content)
    currentCard.value.usageCount++
    localStorage.setItem(`card-${currentCard.value.id}-usage`, currentCard.value.usageCount)
  }
}

const copyToClipboard = async (text) => {
  try { await navigator.clipboard.writeText(text); ElMessage.success('已复制到剪贴板') } 
  catch { ElMessage.error('复制失败') }
}

onMounted(() => mockCards.forEach(c => { const s = localStorage.getItem(`card-${c.id}-usage`); if (s) c.usageCount = parseInt(s) }))
</script>

<style scoped>
.prompt-card-container {
  min-height: 100vh;
  background: #0a0a0a;
  background-image: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.03) 0%, transparent 50%), radial-gradient(circle at 20px 20px, rgba(255,255,255,0.06) 1px, transparent 1px);
  background-size: 100% 100%, 40px 40px;
  padding: 20px;
  font-family: 'Inter', 'PingFang SC', sans-serif;
}

.relic-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  margin-bottom: 20px;
  background: rgba(255,255,255,0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05);
}

.relic-left { display: flex; align-items: center; gap: 12px; }
.relic-icon { font-size: 24px; }
.relic-title { font-size: 20px; font-weight: 600; color: #e5e5e5; letter-spacing: 0.5px; }
.scheme-badge {
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 20px;
  border: 1px solid;
}
.scheme-d { background: rgba(142,68,173,0.2); color: #9b59b6; border-color: rgba(142,68,173,0.3); }
.relic-right { display: flex; gap: 20px; font-size: 14px; color: #666; }
.relic-right strong { color: #e5e5e5; font-weight: 600; }

.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  margin-bottom: 24px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 12px;
}

.category-filters :deep(.el-radio-button__inner) { background: transparent; border-color: rgba(255,255,255,0.1); color: #888; font-size: 13px; }
.category-filters :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) { background: rgba(197,171,80,0.2); border-color: #c5ab50; color: #c5ab50; box-shadow: none; }
.filter-actions { display: flex; gap: 12px; align-items: center; }

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
  padding: 4px;
}

/* ========== 方案D：悬浮揭示 - 铜级专属样式 ========== */
.prompt-card {
  position: relative;
  height: 210px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(255,255,255,0.02);
  backdrop-filter: blur(2px);
  border: 1px solid #171717;
}

/* 悬浮铜色光泽层 - 默认隐藏 */
.prompt-card.rarity-copper .hover-copper-shimmer {
  position: absolute;
  inset: 0;
  border-radius: 12px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.4s ease;
  background: 
    /* 顶部光泽 */
    linear-gradient(
      180deg,
      rgba(203,106,82,0.25) 0%,
      rgba(203,106,82,0.05) 30%,
      transparent 60%
    ),
    /* 左侧铜色光晕 */
    radial-gradient(
      ellipse at 0% 50%,
      rgba(203,106,82,0.2) 0%,
      transparent 50%
    ),
    /* 右上角高光 */
    radial-gradient(
      circle at 85% 15%,
      rgba(255,200,150,0.15) 0%,
      transparent 30%
    );
}

/* 悬浮时显示铜色光泽 */
.prompt-card.rarity-copper:hover {
  transform: translateY(-4px);
  border-color: rgba(203,106,82,0.5);
  box-shadow: 
    0 12px 40px rgba(0,0,0,0.5),
    0 0 30px rgba(203,106,82,0.15),
    inset 0 0 20px rgba(203,106,82,0.05);
}

.prompt-card.rarity-copper:hover .hover-copper-shimmer {
  opacity: 1;
}

/* 悬浮时边框呼吸光效 */
.prompt-card.rarity-copper:hover::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: 13px;
  padding: 1px;
  background: linear-gradient(
    135deg,
    rgba(203,106,82,0.6) 0%,
    rgba(203,106,82,0.2) 50%,
    rgba(203,106,82,0.6) 100%
  );
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  animation: borderPulse 2s ease-in-out infinite;
}

@keyframes borderPulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

/* 稀有度背景 */
.prompt-card.rarity-bronze { background: linear-gradient(135deg, #A97142 0%, #6E3A06 50%, #B08D57 100%); border-color: rgba(169,113,66,0.3); }
.prompt-card.rarity-silver { background: linear-gradient(135deg, #B4B9BE 0%, #716F71 50%, #A8A9AD 100%); border-color: rgba(180,185,190,0.3); }
.prompt-card.rarity-gold { background: linear-gradient(135deg, #C5AB50 0%, #AC933E 50%, #FBF8AE 100%); border-color: rgba(197,171,80,0.4); box-shadow: 0 0 20px rgba(197,171,80,0.2), inset 0 1px 0 rgba(255,255,255,0.3); }

.prompt-card.rarity-bronze:hover,
.prompt-card.rarity-silver:hover,
.prompt-card.rarity-gold:hover {
  transform: translateY(-4px);
  border-color: rgba(255,255,255,0.15);
  box-shadow: 0 12px 40px rgba(0,0,0,0.5), 0 0 1px rgba(255,255,255,0.1);
}

/* 分类边框 */
.category-border { position: absolute; left: 0; top: 0; bottom: 0; width: 3px; }
.border-CDEV { background: #c0392b; }
.border-PM { background: #2980b9; }
.border-INFO { background: #27ae60; }
.border-LEARN { background: #8e44ad; }
.border-DOC { background: #e67e22; }
.border-TOOL { background: #555555; }

/* 复杂度球 */
.complexity-sphere {
  position: absolute;
  top: 12px;
  left: 20px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  background: rgba(255,255,255,0.03);
  border: 1px solid #333;
  color: #888;
  z-index: 2;
}

.card-content {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px;
  gap: 6px;
}

.card-icon { font-size: 28px; margin-bottom: 2px; }
.card-code { font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #525252; letter-spacing: 0.5px; }
.card-name { font-size: 13px; font-weight: 600; color: #e5e5e5; text-align: center; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.card-tag { font-size: 10px; padding: 2px 8px; border-radius: 4px; background: rgba(255,255,255,0.05); }
.tag-CDEV { color: #e74c3c; background: rgba(192,57,43,0.15); }
.tag-PM { color: #3498db; background: rgba(41,128,185,0.15); }
.tag-INFO { color: #2ecc71; background: rgba(39,174,96,0.15); }
.tag-LEARN { color: #9b59b6; background: rgba(142,68,173,0.15); }
.tag-DOC { color: #e67e22; background: rgba(230,126,34,0.15); }
.tag-TOOL { color: #888; background: rgba(85,85,85,0.15); }
.card-desc { font-size: 11px; color: #737373; text-align: center; max-width: 100%; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; line-height: 1.4; }
.card-version { display: flex; align-items: center; gap: 6px; margin-top: 4px; }
.version-text { font-family: monospace; font-size: 10px; color: #737373; }
.variant-badge { font-size: 9px; padding: 1px 5px; background: rgba(46,204,113,0.2); color: #2ecc71; border-radius: 3px; font-weight: 600; }

/* 稀有度文字颜色 */
.prompt-card.rarity-bronze .card-name, .prompt-card.rarity-silver .card-name { color: #fff; }
.prompt-card.rarity-bronze .card-desc, .prompt-card.rarity-silver .card-desc { color: rgba(255,255,255,0.75); }
.prompt-card.rarity-bronze .card-code, .prompt-card.rarity-silver .card-code { color: rgba(255,255,255,0.5); }
.prompt-card.rarity-gold .card-name { color: #1a0e00; }
.prompt-card.rarity-gold .card-desc { color: rgba(0,0,0,0.7); }
.prompt-card.rarity-gold .card-code { color: rgba(0,0,0,0.5); }
.prompt-card.rarity-gold .card-tag { background: rgba(0,0,0,0.15); }

/* 详情弹窗 */
.detail-dialog :deep(.el-dialog) { background: #0a0a0a; border: 1px solid #222; border-radius: 14px; }
.detail-dialog :deep(.el-dialog__body) { padding: 0; }
.detail-container { display: grid; grid-template-columns: 1fr 320px; min-height: 500px; }
.detail-card { padding: 32px; border-right: 1px solid #1a1a1a; overflow-y: auto; max-height: 70vh; }
.detail-card.rarity-bronze, .detail-card.rarity-silver { background: linear-gradient(135deg, rgba(169,113,66,0.1) 0%, transparent 100%); }
.detail-card.rarity-gold { background: linear-gradient(135deg, rgba(197,171,80,0.15) 0%, transparent 100%); }
.detail-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.detail-icon { font-size: 36px; }
.detail-code { font-family: monospace; font-size: 11px; color: #525252; }
.detail-name { font-size: 24px; font-weight: 700; color: #e5e5e5; margin-bottom: 12px; }
.detail-tag { display: inline-block; padding: 4px 12px; border-radius: 6px; font-size: 12px; margin-bottom: 24px; }
.detail-content { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 10px; padding: 20px; }
.detail-content pre { font-family: 'JetBrains Mono', monospace; font-size: 13px; line-height: 1.7; color: #a0a0a0; white-space: pre-wrap; word-break: break-word; margin: 0; }

.detail-sidebar { background: #050505; padding: 24px; display: flex; flex-direction: column; gap: 24px; }
.sidebar-section h4 { font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
.variant-list { display: flex; flex-direction: column; gap: 8px; }
.variant-node { position: relative; padding: 10px 12px; background: rgba(255,255,255,0.03); border-radius: 8px; border: 1px solid rgba(255,255,255,0.06); }
.variant-node.root { border-color: rgba(203,106,82,0.3); background: rgba(203,106,82,0.08); }
.variant-connector { position: absolute; left: -12px; top: 50%; width: 12px; height: 2px; background: rgba(255,255,255,0.1); }
.variant-label { font-family: monospace; font-size: 11px; color: #888; display: block; }
.variant-desc { font-size: 12px; color: #666; }
.copy-btn { width: 100%; height: 48px; font-size: 15px; background: linear-gradient(135deg, #c5ab50 0%, #ac933e 100%); border: none; color: #1a0e00; font-weight: 600; }
.usage-info { text-align: center; font-size: 12px; color: #666; margin-top: 8px; }
.usage-info strong { color: #c5ab50; }
.log-list { max-height: 150px; overflow-y: auto; }
.log-item { display: flex; gap: 12px; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 12px; }
.log-time { color: #525252; font-family: monospace; flex-shrink: 0; }
.log-text { color: #888; }
.log-empty { color: #444; font-size: 12px; text-align: center; padding: 20px; }

:deep(.el-input__wrapper) { background: rgba(255,255,255,0.03); border-color: rgba(255,255,255,0.08); }
:deep(.el-input__inner) { color: #e5e5e5; }
:deep(.el-textarea__inner) { background: rgba(255,255,255,0.03); border-color: rgba(255,255,255,0.08); color: #e5e5e5; }
</style>
