<template>
  <div class="ett-container">
    <!-- 顶部工具栏 -->
    <div class="ett-header">
      <h2 class="ett-title">英语翻译练习 — 考研英语一</h2>
      <div class="ett-header-actions">
        <el-input v-model="apiKey" type="password" placeholder="DeepSeek API Key" size="small" style="width:240px" show-password />
        <el-radio-group v-model="scoringMode" size="small">
          <el-radio-button value="api">API评分</el-radio-button>
          <el-radio-button value="window">窗口AI</el-radio-button>
          <el-radio-button value="wave">水波训练</el-radio-button>
        </el-radio-group>
        <el-button size="small" @click="showPromptConfig = true" :icon="Setting">提示词</el-button>
        <el-select v-model="currentEssayId" placeholder="选择练习篇目" filterable size="small" style="width:260px">
          <el-option v-for="(e, idx) in essays" :key="e.id" :label="`${e.date} ${e.title}`" :value="e.id">
            <span>{{ e.title }}</span>
            <span style="float:right;color:#8492a6;font-size:12px">{{ e.date }}</span>
          </el-option>
        </el-select>
        <el-button type="primary" size="small" @click="startPractice" :disabled="!currentEssay">开始练习</el-button>
        <el-button size="small" @click="showAddDialog = true">+ 添加范文</el-button>
        <el-button size="small" @click="exportData">导出</el-button>
        <el-upload :show-file-list="false" :before-upload="importData" accept=".json" style="display:inline-block;margin-left:4px">
          <el-button size="small">导入</el-button>
        </el-upload>
        <el-button size="small" type="success" @click="openImageImport" style="margin-left:4px">图片导入</el-button>
        <el-switch v-model="darkMode" size="small" active-text="🌙" style="margin-left:12px" />
      
            <el-divider direction="vertical" />
            <span class="token-usage" title="Token用量（本次会话）">
              <span class="token-label">Tokens:</span>
              <span class="token-val">{{ (tokenUsage.total / 1000).toFixed(1) }}k</span>
              <span class="token-detail">({{ tokenUsage.calls }}次)</span>
            </span></div>
    </div>

    <!-- 主体三栏 -->
    <div class="ett-body" :class="{ dark: darkMode }">
      <!-- 左侧栏：范文列表 + 日历 -->
      <aside class="ett-left">
        <el-tabs model-value="list" type="border-card" class="ett-left-tabs">
          <el-tab-pane label="范文库" name="list">
            <div class="essay-list">
              <div v-for="(e, idx) in essays" :key="e.id"
                class="essay-item"
                :class="{ active: e.id === currentEssayId, done: getRecord(e.id)?.completed, 'drag-over': dragOverIdx === idx }"
                @click="currentEssayId = e.id"
                draggable="true"
                @dragstart="onEssayDragStart($event, e.id)"
                @dragend="onEssayDragEnd"
                @dragover="onEssayDragOver($event, idx)"
                @dragleave="onEssayDragLeave"
                @drop="onEssayDrop($event, idx)">
                <div class="essay-item-title">{{ e.title }}</div>
                <div class="essay-item-meta">{{ e.source }} · {{ e.date }}</div>
                <div class="essay-item-score" v-if="getRecord(e.id)?.completed">
                  <el-tag :type="scoreTag(getRecord(e.id).totalScore)">{{ getRecord(e.id).totalScore }}分</el-tag>
                  <el-button size="small" text type="info" @click.stop="openHistoryPanel(e.id)" class="history-btn">
                    历史
                  </el-button>
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="打卡日历" name="calendar">
            <el-calendar v-model="calendarDate">
              <template #default="{ data }">
                <div class="cal-cell" @click="calendarDate = data.date"
                  :class="{ checked: hasRecord(data.date), 'cal-today': isToday(data.date) }">
                  {{ data.date.getDate() }}
                  <span v-if="hasRecord(data.date)" class="cal-dot" :style="{ background: scoreDotColor(data.date) }"></span>
                </div>
              </template>
            </el-calendar>
          </el-tab-pane>
        </el-tabs>

        <!-- 统计面板 -->
        <div class="stats-panel" v-if="records.length > 0">
          <div class="stat-row"><span>连续打卡</span><strong>{{ streakDays }}天</strong></div>
          <div class="stat-row"><span>累计练习</span><strong>{{ records.filter(r=>r.completed).length }}篇</strong></div>
          <div class="stat-row"><span>平均分</span><strong>{{ avgScore }}分</strong></div>
          <div class="stat-row"><span>总耗时</span><strong>{{ totalTime }}</strong></div>
        </div>
      </aside>

      <!-- 中间栏：翻译练习区 -->
      <main class="ett-main" :class="{ 'anno-main': annoMode }" ref="annoMainRef">
        <!-- 批注浮动工具栏 -->
        <div v-if="annoMode" class="anno-float-toolbar">
          <span v-for="c in drawColors" :key="c.color"
            class="color-dot" :class="{ active: drawColor === c.color && !isErasing }"
            :style="{ background: c.css }"
            @click="setDrawColor(c.color)" :title="c.name"></span>
          <el-divider direction="vertical" />
          <span class="toolbar-label">粗细</span>
          <el-slider v-model="drawWidth" :min="1" :max="12" size="small" style="width:70px" />
          <el-divider direction="vertical" />
          <el-button size="small" :type="isErasing ? 'warning' : 'default'" @click="toggleErase">
            {{ isErasing ? '橡皮擦中' : '橡皮擦' }}
          </el-button>
          <el-button size="small" @click="clearAnnoDrawings" :disabled="currentAnnoCount === 0">清除</el-button>
          <span class="anno-count" v-if="currentAnnoCount > 0">{{ currentAnnoCount }}笔</span>
          <el-button size="small" type="info" @click="toggleAnnoMode" style="margin-left:auto">退出批注</el-button>
        </div>
        <canvas v-if="annoMode" ref="annoCanvasRef"
          class="anno-canvas"
          @mousedown="onAnnoMouseDown"
          @mousemove="onAnnoMouseMove"
          @mouseup="onAnnoMouseUp"
          @mouseleave="onAnnoMouseUp"
        ></canvas>
        <template v-if="currentEssay">
          <!-- 原文区 -->
          <div class="section">
            <div class="section-header">
              <span class="section-label">原文</span>
              <span class="section-source">{{ currentEssay.source }}</span>
              <el-button size="small" text @click="toggleHighlight" v-if="practiceStarted && !annoMode">划词模式</el-button>
              <el-button size="small" :type="annoMode ? 'warning' : 'default'" @click="toggleAnnoMode" style="margin-left:auto">
                {{ annoMode ? '退出批注' : '批注模式' }}
              </el-button>
            </div>
            <div class="original-text" ref="originalRef">
              <p v-for="(seg, i) in currentEssay.segments" :key="i" class="orig-seg"
                :class="{ selected: selectedSeg === i }" @click="selectedSeg = i">
                <span class="seg-num">{{ i + 1 }}</span>
                <span class="seg-en">{{ seg.en }}</span>
                <span class="seg-hint" v-if="seg.keyPoints.length">考点：{{ seg.keyPoints.join('、') }}</span>
              </p>
            </div>
          </div>

          
          <!-- 水波训练区（独立模式） -->
          <div class="section wave-section" v-if="scoringMode === 'wave' && currentEssay">
            <div class="section-header">
              <span class="section-label">🌊 水波训练</span>
              <span class="hint-text">点击句子进行语法结构分析</span>
              <el-button size="small" text @click="resetWave" v-if="waveSelectedIdx >= 0">重置</el-button>
            </div>
            <div class="wave-seg-list">
              <div v-for="(seg, i) in currentEssay.segments" :key="i"
                class="wave-seg-item"
                :class="{ active: waveSelectedIdx === i, analyzing: waveAnalyzingIdx === i, cached: hasWaveCache(currentEssay.id, i) }"
                @click="selectWaveSegment(i)">
                <span class="wave-seg-num">{{ i + 1 }}</span>
                <span class="wave-seg-text">{{ seg.en }}</span>
                <span class="wave-seg-badge" v-if="hasWaveCache(currentEssay.id, i) && waveSelectedIdx !== i">✓</span>
                <el-icon v-if="waveAnalyzingIdx === i" class="is-loading"><Loading /></el-icon>
              </div>
            </div>
            <!-- 水波答案卡片 -->
            <div class="wave-answer-card" v-if="waveAnswer">
              <div class="wave-answer-header">
                <span class="wave-answer-title">📝 第{{ waveSelectedIdx + 1 }}句分析</span>
              </div>
              <div class="wave-answer-content" v-if="waveAnswer.grammarTree">
                <div class="wave-tree-section">
                  <div class="wave-tree-label">语法结构</div>
                  <div class="wave-tree-text">{{ waveAnswer.grammarTree }}</div>
                </div>
                <div class="wave-tree-section" v-if="waveAnswer.logicSplit">
                  <div class="wave-tree-label">逻辑切分</div>
                  <div class="wave-tree-text">{{ waveAnswer.logicSplit }}</div>
                </div>
                <div class="wave-tree-section" v-if="waveAnswer.stuckPoint">
                  <div class="wave-tree-label">🚧 卡点</div>
                  <div class="wave-tree-text stuck">{{ waveAnswer.stuckPoint }}</div>
                </div>
                <div class="wave-tree-section" v-if="waveAnswer.resolveTip">
                  <div class="wave-tree-label">💡 突破</div>
                  <div class="wave-tree-text resolve">{{ waveAnswer.resolveTip }}</div>
                </div>
                <div class="wave-tree-section" v-if="waveAnswer.analogy">
                  <div class="wave-tree-label">🌊 类比</div>
                  <div class="wave-tree-text analogy">{{ waveAnswer.analogy }}</div>
                </div>
              </div>
              <div class="wave-answer-content" v-else-if="waveAnswer.raw">
                <pre class="wave-raw">{{ waveAnswer.raw }}</pre>
              </div>
            </div>
            <!-- 水波总结 -->
            <div class="wave-summary-section" v-if="waveSummaryData">
              <el-divider />
              <div class="wave-summary-header">📊 今日水波总结</div>
              <div class="wave-summary-overview">{{ waveSummaryData.overview }}</div>
              <div class="wave-summary-grid" v-if="waveSummaryData.patterns?.length || waveSummaryData.strengths?.length">
                <div class="wave-summary-col" v-if="waveSummaryData.patterns?.length">
                  <div class="wave-summary-label">⚠️ 共性问题</div>
                  <ul><li v-for="p in waveSummaryData.patterns" :key="p">{{ p }}</li></ul>
                </div>
                <div class="wave-summary-col" v-if="waveSummaryData.strengths?.length">
                  <div class="wave-summary-label">✅ 做得好的</div>
                  <ul><li v-for="s in waveSummaryData.strengths" :key="s">{{ s }}</li></ul>
                </div>
              </div>
              <div class="wave-summary-focus" v-if="waveSummaryData.focusAreas?.length">
                <div class="wave-summary-label">🎯 后续重点</div>
                <div class="focus-tags">
                  <el-tag v-for="(f, i) in waveSummaryData.focusAreas" :key="i" size="small" type="warning">{{ f }}</el-tag>
                </div>
              </div>
              <div class="wave-summary-cheer" v-if="waveSummaryData.encouragement">{{ waveSummaryData.encouragement }}</div>
              <el-button size="small" type="primary" @click="requestWaveSummary" :loading="waveLoading" style="margin-top:8px">
                {{ waveSummaryData ? '重新生成总结' : '生成今日总结' }}
              </el-button>
            </div>
            <div style="text-align:center;margin-top:12px" v-if="currentEssay.segments.some((_,i) => hasWaveCache(currentEssay.id, i)) && !waveSummaryData">
              <el-button size="small" type="primary" @click="requestWaveSummary" :loading="waveLoading">生成今日总结</el-button>
            </div>
          </div>
<!-- 翻译输入区 -->
          <div class="section" v-if="scoringMode !== 'wave' && practiceStarted">
            <div class="section-header">
              <span class="section-label">你的译文</span>
              <span class="timer">{{ formatTime(elapsed) }}</span>
              <template v-if="scoringMode === 'api'">
                <el-button size="small" type="primary" @click="submitTranslation" :loading="scoring" :disabled="!userTranslation.trim()">
                  提交AI评分
                </el-button>
              </template>
              <template v-else-if="scoringMode === 'window'">
                <el-button size="small" type="warning" @click="submitTranslation" :disabled="!userTranslation.trim()">
                  一键复制拼接prompt
                </el-button>
              </template>
            </div>
            <el-input v-model="userTranslation" type="textarea" :rows="8" resize="vertical"
              placeholder="在此输入你的中文翻译..." />
            <!-- 窗口AI模式：粘贴结果 -->
            <div v-if="scoringMode === 'window'" class="window-ai-paste">
              <div class="window-ai-label">粘贴窗口AI返回的评分JSON结果：</div>
              <el-input v-model="windowAIInput" type="textarea" :rows="5" placeholder='{"accuracy":20,"grammar":18,"vocabulary":19,"fluency":21,"total":78,"feedback":"..."}' />
              <el-button type="success" size="small" @click="submitWindowAI" :disabled="!windowAIInput.trim()" style="margin-top:6px">
                解析并录入评分
              </el-button>
            </div>
          </div>

          <!-- 对照区 -->
          <div class="section" v-if="scoredRecord">
            <div class="section-header">
              <span class="section-label">译文对照</span>
            </div>
            <div class="compare-view">
              <div class="compare-col yours">
                <div class="compare-col-title">你的译文</div>
                <p v-for="(line, i) in diffResult.userLines" :key="i"
                  :class="line.type"><span v-if="line.html" v-html="line.html" /><span v-else>{{ line.text }}</span></p>
              </div>
              <div class="compare-col ref">
                <div class="compare-col-title">参考译文</div>
                <p v-for="(line, i) in diffResult.refLines" :key="i"
                  :class="line.type">{{ line.text }}</p>
              </div>
            </div>
          </div>
        </template>
        <el-empty v-else description="选择一篇范文，点击「开始练习」" :image-size="120" />
      </main>

      <!-- 右侧栏：AI评分面板 -->
      <aside class="ett-right">
        <template v-if="scoredRecord">
          <div class="score-card">
            <div class="total-score" :style="{ color: scoreColor(scoredRecord.totalScore) }">
              {{ scoredRecord.totalScore }}<span class="score-unit">/100</span>
            </div>
            <el-divider />
            <div class="dim-scores">
              <div class="dim-item">
                <span>准确性 ({{ scoredRecord.score.accuracy }}/25)</span>
                <el-progress :percentage="scoredRecord.score.accuracy / 25 * 100" :color="dimColor(scoredRecord.score.accuracy,25)" :stroke-width="8" />
              </div>
              <div class="dim-item">
                <span>语法结构 ({{ scoredRecord.score.grammar }}/25)</span>
                <el-progress :percentage="scoredRecord.score.grammar / 25 * 100" :color="dimColor(scoredRecord.score.grammar,25)" :stroke-width="8" />
              </div>
              <div class="dim-item">
                <span>词汇表达 ({{ scoredRecord.score.vocabulary }}/25)</span>
                <el-progress :percentage="scoredRecord.score.vocabulary / 25 * 100" :color="dimColor(scoredRecord.score.vocabulary,25)" :stroke-width="8" />
              </div>
              <div class="dim-item">
                <span>流畅度 ({{ scoredRecord.score.fluency }}/25)</span>
                <el-progress :percentage="scoredRecord.score.fluency / 25 * 100" :color="dimColor(scoredRecord.score.fluency,25)" :stroke-width="8" />
              </div>
            </div>
          </div>
          <div class="feedback-card">
            <div class="feedback-title">AI 点评</div>
            <div class="feedback-content" v-html="renderedFeedback"></div>
            <div v-if="bilibiliMatches.length" class="bilibili-links">
              <div class="bilibili-title">相关知识点视频：</div>
              <a v-for="link in bilibiliMatches" :key="link.bvid"
                :href="`https://www.bilibili.com/video/${link.bvid}`" target="_blank"
                class="bilibili-card">
                <span class="bilibili-tag">{{ link.keyword }}</span>
                <span class="bilibili-name">{{ link.title }}</span>
                <span class="bilibili-desc">{{ link.desc }}</span>
              </a>
            </div>
          </div>
          <div class="history-card" v-if="records.length > 1">
            <div class="feedback-title">趋势</div>
            <div ref="trendChartRef" style="width:100%;height:160px"></div>
            <div ref="radarChartRef" style="width:100%;height:180px;margin-top:8px"></div>

          <!-- 水波纠错展示 -->
          <div class="mistake-wave-card" v-if="scoredRecord?.mistakeWave?.patternEN && scoredRecord.mistakeWave.patternEN !== '无'">
            <div class="feedback-title">🌊 错误结构分析</div>
            <div class="mw-pattern">
              <span class="mw-label">错误结构：</span>
              <code>{{ scoredRecord.mistakeWave.patternEN }}</code>
            </div>
            <div class="mw-stuck" v-if="scoredRecord.mistakeWave.whereStuck">
              <span class="mw-label">为什么卡住：</span>
              <span>{{ scoredRecord.mistakeWave.whereStuck }}</span>
            </div>
            <div class="mw-examples" v-if="scoredRecord.mistakeWave.examples?.length">
              <div class="mw-label">同类例句：</div>
              <div v-for="(ex, ei) in scoredRecord.mistakeWave.examples" :key="ei" class="mw-example-item">
                <div class="mw-ex-en">{{ ex.en }}</div>
                <div class="mw-ex-zh">{{ ex.zh }}</div>
              </div>
            </div>
            <div class="mw-next" v-if="scoredRecord.mistakeWave.nextTime">
              <span class="mw-label">下次这样做：</span>
              <span>{{ scoredRecord.mistakeWave.nextTime }}</span>
            </div>
          </div>

          <!-- 生词短语池 -->
          <div class="vocab-pool-card" v-if="vocabPool.length">
            <div class="feedback-title" style="cursor:pointer" @click="showVocabPool = !showVocabPool">
              📚 生词短语池 ({{ vocabPool.length }})
              <span style="font-size:12px;color:#999">{{ showVocabPool ? '收起' : '展开' }}</span>
            </div>
            <div v-if="showVocabPool" class="vocab-list">
              <div v-for="item in vocabPool.slice(0, 20)" :key="item.item" class="vocab-item">
                <div class="vocab-word">
                  <span class="vocab-text">{{ item.item }}</span>
                  <el-tag size="small" :type="item.level === '考研' ? 'warning' : item.level === '六级' ? 'primary' : 'info'">{{ item.level }}</el-tag>
                  <el-tag size="small" type="success" v-if="item.category">{{ item.category }}</el-tag>
                </div>
                <div class="vocab-meaning">{{ item.meaning }}</div>
                <div class="vocab-meta">出现 {{ item.count }} 次 · {{ item.dateCount }} 天</div>
              </div>
            </div>
          </div>
          </div>
        </template>
        <el-empty v-else description="提交翻译后查看评分" :image-size="100" />
      </aside>
    </div>

    <!-- 提示词配置对话框 (P0) -->
    <el-dialog v-model="showPromptConfig" title="提示词配置" width="780px" destroy-on-close>
      <el-form label-width="100px">
        <el-form-item label="评分提示词">
          <el-input v-model="promptConfig.scoringPrompt" type="textarea" :rows="14" />
          <p class="hint-text">窗口AI模式会把这段提示词+原文+译文拼接复制到剪贴板</p>
        </el-form-item>
        <el-form-item label="分段提示词">
          <el-input v-model="promptConfig.segmentPrompt" type="textarea" :rows="8" />
          <p class="hint-text">添加范文时用于AI自动分段出题的提示词</p>
        </el-form-item>
        <el-form-item label="模式说明">
          <div class="mode-desc">
            <p><b>API评分</b>：直接调用DeepSeek API，填写Key即可一键评分</p>
            <p><b>窗口AI</b>：点击按钮复制拼接好的完整prompt→粘贴到任意AI窗口→把AI回复的JSON粘贴回来</p>
          </div>
        </el-form-item>
        <el-form-item label="自定义提示词">
          <div style="width:100%">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
              <el-button size="small" @click="addCustomPrompt">+ 添加</el-button>
            </div>
            <div v-for="p in customPrompts" :key="p.id" style="margin-bottom:10px;padding:8px;border:1px solid #eee;border-radius:6px">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
                <el-input v-model="p.name" size="small" style="width:200px" placeholder="提示词名称" />
                <el-button size="small" type="danger" text @click="deleteCustomPrompt(p.id)">删除</el-button>
              </div>
              <el-input v-model="p.content" type="textarea" :rows="6" size="small" placeholder="提示词内容..." />
            </div>
            <p v-if="customPrompts.length === 0" class="hint-text">尚未添加自定义提示词，点击"+ 添加"创建</p>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPromptConfig = false">取消</el-button>
        <el-button type="primary" @click="savePromptConfig">保存</el-button>
      </template>
    </el-dialog>

    <!-- 历史记录详情面板 (P2) -->
    <el-drawer v-model="showHistoryPanel" title="练习历史" size="480px" direction="rtl">
      <template v-if="historyEssay">
        <div class="history-essay-info">
          <h3>{{ historyEssay.title }}</h3>
          <p class="history-meta">{{ historyEssay.source }} · {{ historyEssay.date }}</p>
        </div>
        <el-divider />
        <div v-if="historyRecords.length === 0" class="history-empty">
          <el-empty description="暂无练习记录" :image-size="80" />
        </div>
        <div v-for="(rec, idx) in historyRecords" :key="rec.id" class="history-record-card">
          <div class="history-record-header">
            <span class="history-record-date">{{ rec.date }}</span>
            <el-tag :type="scoreTag(rec.totalScore)" size="small">{{ rec.totalScore }}分</el-tag>
            <span class="history-time">{{ formatTime(rec.timeSpent || 0) }}</span>
          </div>
          <div class="history-dims">
            <span>准确性{{ rec.score.accuracy }}</span>
            <span>语法{{ rec.score.grammar }}</span>
            <span>词汇{{ rec.score.vocabulary }}</span>
            <span>流畅{{ rec.score.fluency }}</span>
          </div>
          <div class="history-translation">
            <div class="history-label">你的译文：</div>
            <p>{{ rec.userTranslation?.slice(0, 200) }}{{ rec.userTranslation?.length > 200 ? '...' : '' }}</p>
          </div>
          <div class="history-feedback" v-if="rec.feedback">
            <div class="history-label">点评：</div>
            <p v-html="rec.feedback.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').slice(0, 300)"></p>
          </div>
          <el-divider v-if="idx < historyRecords.length - 1" />
        </div>
      </template>
    </el-drawer>

    <!-- 添加范文对话框 -->
    <el-dialog v-model="showAddDialog" title="添加练习范文" width="640px" destroy-on-close>
      <el-form label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="newEssay.title" placeholder="如：环境保护" />
        </el-form-item>
        <el-form-item label="来源">
          <el-input v-model="newEssay.source" placeholder="如：考研英语一 2023 Text 4" />
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker v-model="newEssay.date" type="date" value-format="YYYY-MM-DD" placeholder="练习日期" />
        </el-form-item>
        <el-form-item label="英文原文">
          <el-input v-model="newEssay.originalEN" type="textarea" :rows="8" placeholder="粘贴英文原文..." />
        </el-form-item>
        <el-form-item label="参考译文">
          <el-input v-model="newEssay.referenceTranslation" type="textarea" :rows="6" placeholder="粘贴参考译文..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="addEssay" :loading="aiProcessing" :disabled="!newEssay.originalEN.trim()">
          AI自动分段出题
        </el-button>
      </template>
    </el-dialog>
  </div>


    <!-- 图片导入翻译题对话框 -->
    <el-dialog v-model="showImageImportDialog" title="图片导入翻译题" width="780px" destroy-on-close @opened="onImageDialogOpened">
      <!-- 提取模式切换 -->
      <div class="extract-mode-bar">
        <el-radio-group v-model="imageExtractMode" @change="onExtractModeChange" size="small">
          <el-radio-button value="strict">教辅·一字不易</el-radio-button>
          <el-radio-button value="reference">参考·灵活提取</el-radio-button>
        </el-radio-group>
        <el-button size="small" text @click="saveImagePrompt" style="margin-left:8px">保存当前提示词</el-button>
      </div>
      <div class="image-import-layout">
        <div class="image-import-left">
          <!-- 多图槽位模式 -->
          <div class="image-slots-section">
            <div class="image-import-label">
              截图粘贴区（点击框内 Ctrl+V 粘贴，最多5张）
              <el-button size="small" text @click="addImageSlot" :disabled="imageSlots.length >= 5">+ 添加槽位</el-button>
            </div>
            <div class="image-slots-grid">
              <div v-for="(slot, si) in imageSlots" :key="si" class="image-slot-wrap">
                <div class="image-slot"
                  :class="{ 'has-image': slot.url }"
                  @paste="onSlotPaste($event, si)"
                  tabindex="0">
                  <img v-if="slot.url" :src="slot.url" class="slot-preview" />
                  <div v-else class="slot-placeholder">
                    <span>槽 {{ si + 1 }}</span>
                    <span class="slot-hint">Ctrl+V</span>
                  </div>
                </div>
                <el-button v-if="imageSlots.length > 1" size="small" type="danger" text @click="removeImageSlot(si)" class="slot-remove">✕</el-button>
              </div>
            </div>
          </div>
          <!-- 批处理粘贴区 -->
          <div class="batch-paste-section" v-if="imageSlots.length >= 2">
            <div class="image-import-label">批处理粘贴区（一次性粘贴多张截图）</div>
            <div class="batch-paste-zone" @paste="onBatchPaste" tabindex="0">
              <span>在此区域 Ctrl+V 一次性粘贴多张截图</span>
            </div>
          </div>
          <!-- 单图模式保留兼容 -->
          <div v-if="imageSlots.length === 1 && !imageSlots[0].url" class="image-paste-zone single-fallback"
            :class="{ 'has-image': imageSlots[0]?.url }"
            @paste="onSlotPaste($event, 0)"
            tabindex="0"
            ref="imagePasteZoneRef">
            <img v-if="imageSlots[0]?.url" :src="imageSlots[0].url" class="pasted-image-preview" />
            <div v-else class="paste-placeholder">
              <span class="paste-icon">🖼️</span>
              <span>在此区域点击后 Ctrl+V 粘贴截图</span>
            </div>
          </div>
        </div>
        <div class="image-import-right">
          <div class="image-import-section">
            <div class="image-import-label">提示词模板（可修改 · {{ imageExtractMode === 'strict' ? '一字不易' : '灵活提取' }}模式）</div>
            <el-input v-model="imageImportPrompt" type="textarea" :rows="8" resize="vertical" />
            <el-button type="primary" size="small" @click="copyImagePrompt" style="margin-top:8px" :disabled="!imageSlots.some(s => s.url)">
              一键复制提示词（{{ imageSlots.filter(s => s.url).length }}图）
            </el-button>
            <span class="hint-text" style="margin-left:8px">复制后粘贴到其他AI窗口，同时粘贴截图</span>
          </div>
          <el-divider />
          <div class="image-import-section">
            <div class="image-import-label">粘贴AI返回的JSON结果：</div>
            <el-input v-model="imageImportResult" type="textarea" :rows="8" placeholder="粘贴另一个AI返回的JSON..." />
            <div style="margin-top:8px;display:flex;gap:8px">
              <el-button type="success" size="small" @click="importFromImageJson" :disabled="!imageImportResult.trim()">
                解析单题导入
              </el-button>
              <el-button type="success" size="small" @click="importBatchFromImageJson" :disabled="!imageImportResult.trim()">
                解析批量导入
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, nextTick, h } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Setting, CopyDocument, Link, VideoPlay, ArrowLeft, Loading } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

// ========== 数据状态 ==========
const apiKey = ref(localStorage.getItem('ett_apikey') || '')

const essays = ref([])
const records = ref([])
const settings = reactive({
  dailyGoal: 1,
  targetScore: 80
})

const currentEssayId = ref(null)
const userTranslation = ref('')
const practiceStarted = ref(false)
const scoring = ref(false)
const elapsed = ref(0)
let timerInterval = null

const darkMode = ref(false)
const selectedSeg = ref(null)
const showAddDialog = ref(false)
const aiProcessing = ref(false)
const calendarDate = ref(new Date())

// P0: 提示词系统
const scoringMode = ref('api')
const showPromptConfig = ref(false)
const promptConfig = ref({
  scoringPrompt: '',
  segmentPrompt: ''
})
const windowAIInput = ref('')
const customPrompts = ref([])
// 图片导入
const showImageImportDialog = ref(false)
const imagePreviewUrl = ref('')
const imagePasteZoneRef = ref(null)
const imageImportPrompt = ref('')
const imageImportResult = ref('')

// 批注系统（全局，每个essay独立存储）
const annoMode = ref(false)
const isDrawing = ref(false)
const drawColor = ref('#FF0000')
const drawWidth = ref(3)
const isErasing = ref(false)
const currentAnnoStroke = ref([])
const annoCanvasRef = ref(null)
const annoMainRef = ref(null)
const originalRef = ref(null)

const drawColors = [
  { color: '#FF0000', css: '#FF0000', name: '红色' },
  { color: '#00AA00', css: '#00AA00', name: '绿色' },
  { color: '#0066FF', css: '#0066FF', name: '蓝色' },
  { color: '#FF8800', css: '#FF8800', name: '橙色' },
  { color: '#000000', css: '#000000', name: '黑色' },
]

// 每个essay的批注存储: { [essayId]: [{points, color, width}, ...] }
const essayAnnotations = ref({})
const currentAnnoCount = computed(() => {
  if (!currentEssayId.value) return 0
  return (essayAnnotations.value[currentEssayId.value] || []).length
})

	const IMAGE_IMPORT_DEFAULT_PROMPT = `请分析这张考研英语教辅截图（通常为多张拼接：顶部题目原文+下方解析）。你的任务是：【意群逻辑切分】+【简洁考点提取】+【教辅详解无损暂存】。

请严格输出以下JSON格式的数据，不要包含任何markdown标记（如\`\`\`json），不要任何额外解释文字：

{
  "raw_text_archive": "【无损存储层】将截图所有文字一字不落地提取到这里。包括：英文原句、选择题题干及[A][B][C][D]选项、所有中文解析、小标题、编号、例句对比等。保留所有换行符(\\n)和标点，绝对禁止概括、删减。",

  "title": "根据文章主题自拟一个简洁中文标题（如'人工智能的伦理困境''气候变化的科学争议''美国司法体系的演变'等），必须贴合原文内容，禁止用'考研英语阅读理解'或'长难句分析'等泛称",
  "source": "来源（如：考研英语一 20XX年 Text X）",
  "date": "YYYY-MM-DD（如无法确定填YYYY-01-01）",
  "sourceNote": "用一句话说明截图资料类型",

  "originalEN": "【展示层】从raw_text_archive顶部提取完整的英文原文段落，一字不易。若截图底部英文被截断，请根据句法逻辑自动补全。",

  "referenceTranslation": "【展示层】优先提取截图中带'参考译文/译文/翻译'标识的中文段落；若截图中未提供参考译文，请你自己作为考研英语翻译专家进行精准翻译。要求：忠实原文结构、术语准确、行文符合中文学术表达习惯，严禁生硬机翻腔。",

  "segments": [
    {
      "en": "【展示层】按语法意群切分的英文分句（确保语义完整，不要碎片化；若教辅编号有误请智能修正）",
      "contextZH": "【展示层-简洁】该分句的简短中文翻译或结构提示（1句话，如'祈使句结构，以...开始'）",
      "keyPoints": ["【展示层-简洁】核心考点关键词1（短语形式，如'祈使句'）", "考点2（如'begin with短语'）", "考点3（如'for作连词表原因'）"],
      "raw_teaching_note": "【存储层-可选】从raw_text_archive复制该分句对应的教辅详细解析原文（包含易错点、例句对比、词义辨析等完整讲解）；若无详细解析则留空字符串''"
    }
  ]
}

⚠️ 核心铁律：

【无损存储层】
1. raw_text_archive 必须100%还原截图所有文字（含选择题、长篇解析、例句、编号笔误等），供后端存储/后续环节调用。

【展示层-简洁为主】
2. originalEN / segments.en：英文原文一字不易；segments按语法意群逻辑切分（通常3-4段），不要机械照抄教辅的碎片化编号。
3. contextZH：简短中文翻译或结构提示，1句话以内，不要长篇大论。
4. keyPoints：核心考点关键词，用短语形式（如'祈使句'、'for表原因'、'where引导不定式'），禁止复制教辅长篇解析。
5. 若截图底部英文被截断，originalEN和segments.en必须根据完整句法逻辑自动补全，严禁输出残缺句。

【参考译文-智能处理】
6. referenceTranslation 字段：截图有明确译文则原样提取；截图无译文则由模型直接生成高质量翻译。生成译文需达到考研阅卷标准，语义严密、逻辑通顺。

【存储层-详解隔离】
7. raw_teaching_note：仅当教辅对该分句有详细解析时，从raw_text_archive复制对应原文；否则留空""。这是存放长篇详解的唯一位置，不要混入keyPoints。

【输出格式】
8. 只返回纯JSON字符串，不要使用\`\`\`json代码块包裹，不要有任何开头或结尾的废话。
9. 遇到字迹模糊无法辨认的，用[?]标注不确定位置，不要猜词。`;

const IMAGE_IMPORT_PROMPT_REFERENCE = `请分析以下考研英语一翻译相关截图。截图中的教辅资料（真题解析、参考译文、长难句讲解等）作为参考依据，可以综合判断后提取最优内容。提取并生成以下JSON格式的数据：

{
  "raw_text_archive": "截图全部文字OCR结果",
  "title": "根据文章主题自拟简洁中文标题",
  "source": "来源（如：考研英语一 20XX年 Text X）",
  "date": "YYYY-MM-DD",
  "sourceNote": "用一句话说明截图资料类型",
  "originalEN": "完整的英文原文",
  "referenceTranslation": "参考中文翻译",
  "segments": [
    {
      "en": "英文分句1",
      "contextZH": "简短中文背景提示",
      "keyPoints": ["考点1", "考点2"],
      "raw_teaching_note": "教辅解析原文（如有；无则空字符串）"
    }
  ]
}

要求：
1. originalEN完整提取英文原文，如有多个版本以最清晰的为准
2. referenceTranslation提取参考中文翻译，如有多个版本综合取最优
3. 教辅中的断句和考点分析可作为参考，但你可以根据原文结构灵活调整
4. sourceNote用一句话描述截图资料类型
5. raw_text_archive存截图全文OCR，raw_teaching_note存逐句教辅解析
6. 只返回JSON，不要加任何其他文字`;



// P2: 历史面板

// 水波训练
const waveAnalyzingIdx = ref(-1)
const waveSegments = ref([])
const waveSelectedIdx = ref(-1)
const waveAnswer = ref(null)
const waveSummaryData = ref(null)
const waveLoading = ref(false)
const waveCache = ref({})
const revealedSegs = ref({})

function waveCacheKey(essayId, segIdx) { return essayId + '-' + segIdx }

async function loadWaveCache() {
  try { const res = await fetch('/api/ett-wave-cache'); if (res.ok) waveCache.value = await res.json() } catch {}
}
let _waveSaveTimer = null
function saveWaveCache() {
  clearTimeout(_waveSaveTimer)
  _waveSaveTimer = setTimeout(async () => {
    try { await fetch('/api/ett-wave-cache', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(waveCache.value) }) } catch {}
  }, 1000)
}

const hasWaveCache = (essayId, segIdx) => {
  const key = waveCacheKey(essayId, segIdx)
  return !!waveCache.value[key]?.segments
}

// ========== 通用JSON提取 ==========
function extractJSON(text) {
  // Try direct parse first
  try { return JSON.parse(text) } catch {}
  // Strip markdown code fences
  let cleaned = text.replace(/```jsons*/gi, '').replace(/```s*/g, '')
  // Find first { ... } block (greedy match for nested)
  const match = cleaned.match(/\{[\s\S]*\}/)
  if (match) {
    try { return JSON.parse(match[0]) } catch {}
  }
  return null
}

// ========== 水波训练 ==========
async function startWaveAnalysis(segIdx) {
  if (!currentEssay.value || !apiKey.value) { ElMessage.warning('请先选择范文并填写API Key'); return }
  const essay = currentEssay.value
  const seg = essay.segments[segIdx]
  if (!seg) return

  waveSelectedIdx.value = segIdx
  waveAnalyzingIdx.value = segIdx
  waveAnswer.value = null
  waveLoading.value = true

  const key = waveCacheKey(essay.id, segIdx)
  if (waveCache.value[key]?.answer) {
    waveAnswer.value = waveCache.value[key].answer
    waveAnalyzingIdx.value = -1
    waveLoading.value = false
    scrollToWaveAnswer()
    return
  }

  const prompt = promptConfig.value.wavePrompt || WAVE_SYSTEM_PROMPT
  const fullPrompt = `${prompt}

【英文原文段落】
${essay.originalEN}

【目标分句】
${seg.en}

【分句考点】
${seg.keyPoints.join('、')}

【教辅解析参考】
${seg.rawTeachingNote || '（无）'}`

  try {
    const result = await callDeepSeek(fullPrompt, 0.5)
    if (result) {
      const parsed = extractJSON(result)
      waveAnswer.value = parsed || { raw: result }
      waveCache.value[key] = { answer: waveAnswer.value, timestamp: Date.now() }
      saveWaveCache()
      scrollToWaveAnswer()
    }
  } catch (e) { ElMessage.error('水波分析失败: ' + e.message) }
  waveAnalyzingIdx.value = -1
  waveLoading.value = false
}

function selectWaveSegment(idx) {
  if (waveAnalyzingIdx.value >= 0) return
  waveSelectedIdx.value = idx
  startWaveAnalysis(idx)
}

function resetWave() {
  waveSelectedIdx.value = -1
  waveAnswer.value = null
  waveAnalyzingIdx.value = -1
  waveSummaryData.value = null
  waveSegments.value = []
  revealedSegs.value = {}
}

function scrollToWaveAnswer() {
  nextTick(() => {
    const el = document.querySelector('.wave-answer-card')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}

async function requestWaveSummary() {
  if (!currentEssay.value || !apiKey.value) return
  const essay = currentEssay.value
  const keys = essay.segments.map((_, i) => waveCacheKey(essay.id, i))
  const answers = keys.map(k => waveCache.value[k]?.answer).filter(Boolean)
  if (answers.length < 2) { ElMessage.warning('至少需要2个分句的水波分析结果'); return }

  waveLoading.value = true
  const prompt = `你是一位考研英语一教学专家。以下是学生今天完成的长难句水波训练的汇总数据。请生成一份"今日水波总结"，格式为JSON：

{
  "overview": "一句话总结今天的训练主题和薄弱环节",
  "patterns": ["发现的共性问题1", "共性问题2"],
  "strengths": ["学生做得好的方面1"],
  "focusAreas": ["建议后续重点练习的方向1", "方向2"],
  "encouragement": "一句鼓励的话"
}

各分句水波分析记录：
${answers.map((a, i) => `【第${i+1}句】${JSON.stringify(a)}`).join('\n\n')}`

  try {
    const result = await callDeepSeek(prompt, 0.5)
    if (result) {
      const parsed = extractJSON(result)
      waveSummaryData.value = parsed || { overview: result }
    }
  } catch {}
  waveLoading.value = false
}

// API token 花费追踪
const tokenUsage = ref({ prompt: 0, completion: 0, total: 0, calls: 0 })
function resetTokenUsage() {
  tokenUsage.value = { prompt: 0, completion: 0, total: 0, calls: 0 }
  syncData()
}

// 翻译草稿 + 独立计时
const translationDrafts = reactive({})
const timerStates = reactive({})

// 范文排序
const essayOrder = ref([])
let _dataSyncTimer = null

function touchEssay(id) {
  const e = essays.value.find(x => x.id === id)
  if (e) {
    const now = new Date()
    e.lastActivity = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0') + ' ' + String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0')
    sortEssays()
  }
}

function deleteEssay(id) {
  essays.value = essays.value.filter(e => e.id !== id)
  records.value = records.value.filter(r => r.essayId !== id)
  if (currentEssayId.value === id) currentEssayId.value = essays.value[0]?.id || null
  ElMessage.success('已删除')
}

// ========== 工具函数（补充） ==========
const ANNO_STORAGE_KEY = 'ett_annotations'

function sortEssays() {
  const orderMap = {}
  essayOrder.value.forEach((id, i) => { orderMap[id] = i })
  const hasOrder = essayOrder.value.length > 0
  essays.value.sort((a, b) => {
    if (hasOrder && orderMap[a.id] !== undefined && orderMap[b.id] !== undefined) {
      return orderMap[a.id] - orderMap[b.id]
    }
    const la = a.lastActivity || a.date || ''
    const lb = b.lastActivity || b.date || ''
    return lb.localeCompare(la)
  })
}

async function loadPromptConfig() {
  try {
    const res = await fetch('/api/ett-prompts')
    if (res.ok) {
      const data = await res.json()
      // Initialize all 5 prompt keys if missing
      if (!data.scoringPrompt) data.scoringPrompt = SCORING_SYSTEM_PROMPT
      if (!data.segmentPrompt) data.segmentPrompt = SEGMENT_PROMPT
      if (!data.imageStrictPrompt) data.imageStrictPrompt = IMAGE_IMPORT_DEFAULT_PROMPT
      if (!data.imageRefPrompt) data.imageRefPrompt = IMAGE_IMPORT_PROMPT_REFERENCE
      if (!data.wavePrompt) data.wavePrompt = WAVE_SYSTEM_PROMPT
      Object.assign(promptConfig.value, data)
    }
  } catch {}
  loadCustomPrompts()
}

async function savePromptConfig() {
  try {
    await fetch('/api/ett-prompts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(promptConfig.value)
    })
    saveCustomPrompts()
    showPromptConfig.value = false
    ElMessage.success('提示词已保存')
  } catch { ElMessage.error('保存失败') }
}

function loadCustomPrompts() {
  try {
    const raw = localStorage.getItem('ett_custom_prompts')
    if (raw) customPrompts.value = JSON.parse(raw)
  } catch {}
}
function saveCustomPrompts() {
  localStorage.setItem('ett_custom_prompts', JSON.stringify(customPrompts.value))
}
function addCustomPrompt() {
  customPrompts.value.push({ id: Date.now().toString(36), name: '新提示词', content: '' })
  saveCustomPrompts()
}
function deleteCustomPrompt(id) {
  customPrompts.value = customPrompts.value.filter(p => p.id !== id)
  saveCustomPrompts()
}

const showHistoryPanel = ref(false)
const historyEssayId = ref(null)

const newEssay = reactive({
  title: '', source: '', date: '', originalEN: '', referenceTranslation: ''
})

const trendChartRef = ref(null)
const radarChartRef = ref(null)

// ========== 30篇考研英语一真题范文(内置题库) ==========
const BUILTIN_ESSAYS = [];

// 从 public/essays-data.json 加载真题数据
async function loadBuiltinEssays() {
  try {
    const res = await fetch('/essays-data.json');
    if (res.ok) BUILTIN_ESSAYS.length = 0, BUILTIN_ESSAYS.push(...await res.json());
  } catch(e) { /* fallback to empty */ }
}
loadBuiltinEssays();



// ========== B站知识点视频链接库 (P2) ==========
const BILIBILI_LINKS = [
  { keyword: '定语从句', bvid: 'BV1aY411b7nW', title: '定语从句精讲', desc: '关系代词that/which/who区别与省略规则' },
  { keyword: '被动语态', bvid: 'BV1s4411C7Wx', title: '被动语态全解析', desc: '英汉被动转换策略' },
  { keyword: '倒装', bvid: 'BV1Hb411p7JJ', title: '倒装句完全掌握', desc: '部分倒装与完全倒装的识别与翻译' },
  { keyword: '虚拟语气', bvid: 'BV1Zt4y1m7uN', title: '虚拟语气三大句型', desc: 'if条件句、wish、as if的翻译处理' },
  { keyword: '分词结构', bvid: 'BV1aL4y1F7Xr', title: '分词作状语/定语', desc: '现在分词与过去分词的翻译技巧' },
  { keyword: '同位语', bvid: 'BV1tG4y1U7QM', title: '同位语从句', desc: 'that引导同位语从句vs定语从句的区分' },
  { keyword: '名词性从句', bvid: 'BV1yW4y1D7GN', title: '名词性从句体系', desc: '主语/宾语/表语/同位语从句的翻译' },
  { keyword: '状语从句', bvid: 'BV1uT4y1S7Fq', title: '状语从句翻译策略', desc: '时间/原因/让步/条件状语从句' },
  { keyword: '强调句', bvid: 'BV1NK4y1U7eJ', title: '强调句型识别', desc: 'It is...that...结构的翻译方法' },
  { keyword: '比较结构', bvid: 'BV18V411b7LH', title: '比较级与最高级', desc: 'as...as, more than, the more...等结构' },
  { keyword: '长难句拆分', bvid: 'BV1gF411i7Hj', title: '长难句拆分五步法', desc: '找主干→定语→状语→并列→嵌套的处理顺序' },
  { keyword: '代词指代', bvid: 'BV1xB4y1T7Dc', title: '代词指代还原', desc: 'it/they/this/that指代判断，英译汉代词还原技巧' },
  { keyword: '固定搭配', bvid: 'BV1KM4y1U7mX', title: '考研英语常见搭配', desc: '动词+介词、形容词+介词等高频搭配' },
  { keyword: '插入语', bvid: 'BV1iL41177KN', title: '插入语的处理', desc: '双破折号/逗号分隔的插入成分翻译' },
  { keyword: '否定结构', bvid: 'BV1fY4y1C7vT', title: '否定表达辨析', desc: '部分否定/全部否定/双重否定的翻译' },
  { keyword: '省略句', bvid: 'BV19P4y1U7Xd', title: '省略句还原技巧', desc: '并列结构省略、状语从句省略的识别' },
  { keyword: 'with结构', bvid: 'BV1hN4y1T7yF', title: 'with复合结构', desc: 'with+名词+分词/形容词/介词短语的翻译' },
  { keyword: 'as用法', bvid: 'BV1KW4y1H7Qk', title: 'as的多重用法', desc: 'as作介词/连词/关系代词的翻译区分' },
  { keyword: 'it句型', bvid: 'BV1SP411p7TG', title: 'it形式主语句型', desc: 'It is+adj+that/to do结构的翻译' },
  { keyword: '独立主格', bvid: 'BV1Dd4y1m7LB', title: '独立主格结构', desc: '名词+分词/形容词的独立结构翻译' },
]

function matchBilibiliLinks(feedback) {
  if (!feedback) return []
  const matched = []
  const seen = new Set()
  for (const item of BILIBILI_LINKS) {
    if (feedback.includes(item.keyword) && !seen.has(item.bvid)) {
      matched.push(item)
      seen.add(item.bvid)
    }
    if (matched.length >= 3) break
  }
  return matched
}

// ========== 计算属性 ==========
const currentEssay = computed(() => essays.value.find(e => e.id === currentEssayId.value))
const scoredRecord = computed(() => currentEssayId.value ? getRecord(currentEssayId.value) : null)

const streakDays = computed(() => {
  let streak = 0
  const today = new Date()
  for (let d = new Date(today); ; d.setDate(d.getDate() - 1)) {
    const ds = d.toISOString().slice(0, 10)
    if (hasRecord(ds)) streak++
    else break
  }
  return streak
})
const avgScore = computed(() => {
  const done = records.value.filter(r => r.completed)
  if (!done.length) return 0
  return Math.round(done.reduce((s, r) => s + r.totalScore, 0) / done.length)
})
const totalTime = computed(() => {
  const sec = records.value.reduce((s, r) => s + (r.timeSpent || 0), 0)
  const h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
})

const diffResult = computed(() => {
  if (!scoredRecord.value || !currentEssay.value) return { userLines: [], refLines: [] }
  const userSentences = splitSentences(scoredRecord.value.userTranslation)
  const refSentences = splitSentences(currentEssay.value.referenceTranslation)
  const errorSpans = scoredRecord.value.errorSpans
  const maxLen = Math.max(userSentences.length, refSentences.length)
  const userLines = [], refLines = []
  for (let i = 0; i < maxLen; i++) {
    const u = userSentences[i] || '', r = refSentences[i] || ''
    if (u === r) {
      userLines.push({ text: u || '(空)', type: 'match' })
      refLines.push({ text: r || '(空)', type: 'match' })
    } else {
      userLines.push({ text: u || '(缺)', html: u ? highlightErrors(u, errorSpans) : '', type: u ? 'diff' : 'missing' })
      refLines.push({ text: r || '(缺)', type: r ? 'diff' : 'missing' })
    }
  }
  return { userLines, refLines }
})

const renderedFeedback = computed(() => {
  if (!scoredRecord.value?.feedback) return ''
  return scoredRecord.value.feedback.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
})

const bilibiliMatches = computed(() => matchBilibiliLinks(scoredRecord.value?.feedback || ''))

const historyRecords = computed(() => {
  if (!historyEssayId.value) return []
  return records.value.filter(r => r.essayId === historyEssayId.value && r.completed)
    .sort((a, b) => b.date.localeCompare(a.date))
})

const historyEssay = computed(() => essays.value.find(e => e.id === historyEssayId.value))

const todayTime = computed(() => {
  const today = new Date().toISOString().slice(0, 10)
  const sec = records.value
    .filter(r => r.date === today)
    .reduce((s, r) => s + (r.timeSpent || 0), 0)
  const m = Math.floor(sec / 60)
  if (m < 60) return `${m}分钟`
  const h = Math.floor(m / 60)
  return `${h}小时${m % 60}分钟`
})

const showVocabPool = ref(false)

const vocabPool = computed(() => {
  const pool = {}
  records.value.filter(r => r.completed && r.unknownItems?.length).forEach(r => {
    r.unknownItems.forEach(item => {
      const key = item.item?.toLowerCase().trim()
      if (!key) return
      if (!pool[key]) {
        pool[key] = { ...item, count: 0, dates: new Set() }
      }
      pool[key].count++
      pool[key].dates.add(r.date)
    })
  })
  return Object.values(pool)
    .map(v => ({ ...v, dateCount: v.dates.size }))
    .sort((a, b) => b.count - a.count)
})

function togglePractice() {
  if (practiceStarted.value) {
    stopTimer()
    if (currentEssay.value) {
      timerStates[currentEssay.value.id] = elapsed.value
    }
    practiceStarted.value = false
  } else {
    startPractice()
  }
}

// ========== 工具函数 ==========
function generateId() { return 'ett_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8) }
function getRecord(essayId) { return records.value.find(r => r.essayId === essayId) || null }
function hasRecord(dateStr) { return records.value.some(r => r.date === dateStr && r.completed) }
function isToday(d) { return new Date().toDateString() === d.toDateString() }

function splitSentences(text) {
  return text.split(/(?<=[。！？；\n])/).map(s => s.trim()).filter(Boolean)
}

function highlightErrors(text, errorSpans) {
  if (!text || !errorSpans?.length) return text
  let result = text
  const sorted = [...errorSpans].sort((a, b) => b.length - a.length)
  const used = new Set()
  for (const span of sorted) {
    if (used.has(span)) continue
    used.add(span)
    const escaped = span.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    result = result.replace(new RegExp(escaped, 'g'), m => `<mark>${m}</mark>`)
  }
  return result
}

function formatTime(sec) {
  const m = Math.floor(sec / 60), s = sec % 60
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
}

function scoreColor(s) { if (s >= 80) return '#22C55E'; if (s >= 60) return '#F59E0B'; return '#EF4444' }
function scoreTag(s) { if (s >= 80) return 'success'; if (s >= 60) return 'warning'; return 'danger' }
function dimColor(v, max) { const p = v / max; if (p >= 0.8) return '#22C55E'; if (p >= 0.6) return '#F59E0B'; return '#EF4444' }
function scoreDotColor(dateStr) {
  const r = records.value.find(r => r.date === dateStr && r.completed)
  if (!r) return '#ccc'
  return scoreColor(r.totalScore)
}

// ========== 持久化 (JSON文件API) ==========
function syncData() {
  clearTimeout(_dataSyncTimer)
  _dataSyncTimer = setTimeout(async () => {
    try {
      await fetch('/api/ett-data', { method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ essays: essays.value, records: records.value, essayOrder: essayOrder.value, annotations: essayAnnotations.value, tokenUsage: tokenUsage.value }) })
    } catch {}
  }, 800)
}
function saveEssayOrder() { syncData() }
function saveData() { syncData() }

async function loadData() {
  try {
    const res = await fetch('/api/ett-data')
    if (res.ok) {
      const data = await res.json()
      essays.value = data.essays || []
      records.value = data.records || []
      essayOrder.value = data.essayOrder || []
      essayAnnotations.value = data.annotations || {}
      tokenUsage.value = data.tokenUsage || { prompt:0,completion:0,total:0,calls:0 }
    }
  } catch {}
  if (essays.value.length === 0) {
    essays.value = BUILTIN_ESSAYS.map(e => ({ ...e, id: generateId() }))
    syncData()
  }
  sortEssays()
}

// ========== AI评分 ==========
async function callDeepSeek(prompt, temperature = 0.3, systemPrompt = null) {
  if (!apiKey.value) { ElMessage.warning('请先填写 DeepSeek API Key'); return null }
  try {
    const sysPrompt = systemPrompt || promptConfig.value.scoringPrompt || SCORING_SYSTEM_PROMPT
    const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey.value}` },
      body: JSON.stringify({ model: 'deepseek-chat', messages: [{ role: 'system', content: sysPrompt }, { role: 'user', content: prompt }], temperature, max_tokens: 2048 }),
    })
    const data = await res.json()
    if (!data.choices?.length) throw new Error(data.error?.message || 'API返回异常')
    if (data.usage) {
      tokenUsage.value.prompt += data.usage.prompt_tokens || 0
      tokenUsage.value.completion += data.usage.completion_tokens || 0
      tokenUsage.value.total += data.usage.total_tokens || 0
      tokenUsage.value.calls++
      syncData()
    }
    return data.choices[0].message.content
  } catch (e) { ElMessage.error('AI调用失败: ' + e.message); return null }
}

const SCORING_SYSTEM_PROMPT = `你是考研英语一翻译题的资深评分老师。你需要对学生提交的中文译文进行四维评分，满分100分（每个维度25分）。

【评分维度】
各维度分数必须为整数（0-25），不要返回小数。
1. 准确性(0-25)：原文意思是否准确传达，无漏译、误译、增译。特别注意原文的限定词、否定范围、比较结构是否完整还原。
2. 语法结构(0-25)：长难句和特殊语法结构（定语从句、被动语态、倒装、虚拟语气、分隔结构、省略等）是否被正确识别并转化为通顺中文。
3. 词汇表达(0-25)：用词是否准确地道，搭配是否自然，术语翻译是否恰当。注意一词多义在语境中的选择是否合理。
4. 流畅度(0-25)：中文表达是否通顺，语序是否符合汉语习惯，句间衔接是否自然。避免欧化长句、生硬直译。

【教辅参考资料的使用规则】
如果提示词下方提供了"教辅详解存档"或"逐句教辅解析"内容：
- 这些来自专业考研教辅（真题解析、长难句讲解等），代表了专业老师的分析视角。
- 评分前，先浏览教辅中标注的考点和解析要点，对这篇文章的评分重点建立预期。
- 教辅中重点分析的长难句结构、易错词汇、翻译陷阱——这些是评分时应当特别留意的位置，学生译文在这些点上的表现直接影响对应维度的得分。
- 教辅的解析角度可作为评分校准参考（如教辅从"定语从句拆分"角度分析某句，你的语法结构评分应同步关注学生是否处理好了这个定语从句）。
- 教辅不等于标准答案。你对学生译文的整体判断拥有最终决定权。如果教辅的解析角度与学生实际错误不完全对应，以你的专业判断为准。
- 教辅中的词汇辨析、例句对比等内容，可酌情融入"mistakeWave"和"unknownItems"的回答中，但要标注来源（如"教辅指出……"）。
- 如果题目没有附带教辅资料，则跳过上述步骤，完全依靠你的专业能力独立评分。

【输出格式】
严格按照以下JSON格式返回，不要加markdown代码块，不要加任何其他文字：

{
  "accuracy": 20,
  "grammar": 18,
  "vocabulary": 19,
  "fluency": 21,
  "total": 78,
  "feedback": "逐句点评（按原文句子编号逐条分析，每句先说学生译文的处理情况，再指出问题或亮点）：\n1. 第一句……\n2. 第二句……",
  "mistakeWave": {
    "patternEN": "原文中导致学生翻错的英文句子片段（只选最典型的一个错误结构）",
    "whereStuck": "这个英文结构为什么容易卡住中国学生（用白话解释，禁止使用语法术语如'定语从句''后置定语'等，要说'这部分在补充说明xxx''这个词其实是修饰前面的xxx'）",
    "examples": [
      {"en": "与错误结构同类的英文例句1", "zh": "对应的中文翻译1"},
      {"en": "与错误结构同类的英文例句2", "zh": "对应的中文翻译2"}
    ],
    "nextTime": "下次看到类似英文结构时，大脑应该怎么做（给出可操作的拆解步骤，用白话，禁止术语）"
  },
  "unknownItems": [
    {
      "item": "原文中翻错或不认识的单词/短语",
      "meaning": "在该语境下的准确中文释义",
      "type": "word或phrase",
      "category": "归类标签（法律/经济/科技/抽象概念/固定搭配/近义易混/熟词僻义等）",
      "level": "四级/六级/考研/雅思/托福/超纲"
    }
  ],
  "errorSpans": ["学生译文中翻错的具体字词片段1", "翻错片段2"]
}

【字段说明】
- mistakeWave：只选取学生译文中最典型的一处结构性错误进行分析，不必面面俱到。如果没有明显的结构错误，patternEN和whereStuck可填"无"、examples为空数组。
- unknownItems：提取学生译文中所有翻错或不认识的单词短语。每个词标注category（语义类别）和level（难度等级）。如果学生全部翻译正确，返回空数组[]。
- errorSpans：精确摘录学生译文中翻译有误的中文字词片段（不是整句），用于前端标红显示。每个片段尽量控制在2-6个字，定位到具体的错误词或短语。如果无法精确定位到片段，返回空数组[]。`;

const SEGMENT_PROMPT = `请将以下英文段落处理为考研英语一翻译练习题格式。返回严格JSON：
{
  "segments": [{"en":"原文分句1", "contextZH":"简短中文背景提示", "keyPoints":["考点1","考点2"]}]
}
每段segments的en为原文按句拆分。keyPoints标注每句涉及的语法考点（如定语从句、被动语态、倒装等）。

英文原文：`


const WAVE_SYSTEM_PROMPT = `你是一位考研英语一长难句教学专家，擅长用"水波法"（由核心向外层层扩展）分析英文长难句。学生点击句子后，你需要对该句进行水波式拆解分析。

请严格输出以下JSON格式，不要加markdown代码块：

{
  "grammarTree": "【句法主干】先提取句子核心主干（主语+谓语+宾语/表语），然后逐层向外添加修饰成分，用树形结构或分层缩进展示：\nLayer 0 (核心): ... \nLayer 1 (第一层修饰): ...\nLayer 2 (第二层修饰): ...",
  "logicSplit": "【逻辑切分】将长句按意群分成2-4段，每段用简短中文标注它的语法作用（如'让步状语''后置定语补充说明xx'等）",
  "stuckPoint": "【卡点诊断】指出这个句子最容易让中国学生卡住的一个结构点（用白话解释为什么容易卡，禁止使用语法术语）",
  "resolveTip": "【突破方法】针对上述卡点，给出简单明了的拆解/理解策略（如'先找到那个xxx，然后把它暂时遮住，读剩下的部分'）",
  "analogy": "【类比助记】用一个生活化/自然界的类比来帮助理解这个句子结构（如'这个句子像一颗洋葱/一个俄罗斯套娃...'）"
}

要求：
1. grammarTree必须分层展示，从核心到外层
2. logicSplit不要机械照抄教辅编号
3. stuckPoint和resolveTip用白话，禁止使用'定语从句''分词状语'等术语
4. analogy要生动有趣，帮助学生形成画面记忆`;

// ========== 窗口AI模式 ==========
function buildScoringPrompt() {
  const essay = currentEssay.value
  const hasRawText = essay.rawTextArchive || essay.segments?.some(s => s.rawTeachingNote)
  const rawTextBlock = hasRawText ? `
【教辅详解存档（来自截图OCR，评分时请参考）】
${essay.rawTextArchive || ''}
${essay.segments?.filter(s => s.rawTeachingNote).length ? `【逐句教辅解析】
${essay.segments.filter(s => s.rawTeachingNote).map((s, i) => `第${i + 1}句：${s.rawTeachingNote}`).join('\\n')}` : ''}` : ''
  const imageSourceBlock = essay.imageSource ? `
【教辅资料来源】
此题目来自以下教辅资料的截图提取：
${essay.imageSource}
（以上资料信息仅供你了解题目出处，评分时请参考其中涉及的考点解析角度）` : ''
  return `${promptConfig.value.scoringPrompt}

【英文原文】
${essay.originalEN}

【参考译文】
${essay.referenceTranslation}

【学生译文】
${userTranslation.value}

【考点提示】
${essay.segments.map(s => s.keyPoints.join('、')).join(' | ')}${rawTextBlock}${imageSourceBlock}
`
	}

async function copyPromptToClipboard() {
  if (!userTranslation.value.trim()) { ElMessage.warning('请先输入译文'); return }
  const full = buildScoringPrompt()
  try {
    await navigator.clipboard.writeText(full)
    if (practiceStarted.value) {
      stopTimer()
      if (currentEssay.value) timerStates[currentEssay.value.id] = elapsed.value
    }
    ElMessage.success('提示词已复制到剪贴板（计时已暂停），粘贴到窗口AI中获取评分')
  } catch {
    ElMessage.error('复制失败，请手动复制')
  }
}

function submitWindowAI() {
  if (!windowAIInput.value.trim()) { ElMessage.warning('请粘贴AI返回的JSON结果'); return }
  try {
    const parsed = extractJSON(windowAIInput.value)
    if (!parsed) throw new Error('未识别到JSON')
    saveScoreResult(parsed)
    windowAIInput.value = ''
    ElMessage.success(`评分完成：${parsed.total}/100`)
  } catch (e) {
    ElMessage.error('JSON解析失败：' + e.message)
  }
}

function saveScoreResult(parsed) {
  const essay = currentEssay.value
  const record = getRecord(essay.id)
  if (record) {
    record.userTranslation = userTranslation.value
    record.score = { accuracy: parsed.accuracy, grammar: parsed.grammar, vocabulary: parsed.vocabulary, fluency: parsed.fluency }
    record.totalScore = parsed.total
    record.feedback = parsed.feedback
    record.completed = true
    record.timeSpent = Math.max(record.timeSpent || 0, elapsed.value)
    record.date = essay.date
    if (parsed.mistakeWave) record.mistakeWave = parsed.mistakeWave
    if (parsed.unknownItems) record.unknownItems = parsed.unknownItems
    if (parsed.errorSpans) record.errorSpans = parsed.errorSpans
  } else {
    records.value.push({
      id: generateId(),
      essayId: essay.id,
      date: essay.date,
      userTranslation: userTranslation.value,
      score: { accuracy: parsed.accuracy, grammar: parsed.grammar, vocabulary: parsed.vocabulary, fluency: parsed.fluency },
      totalScore: parsed.total,
      feedback: parsed.feedback,
      timeSpent: elapsed.value,
      completed: true,
      ...(parsed.mistakeWave ? { mistakeWave: parsed.mistakeWave } : {}),
      ...(parsed.unknownItems ? { unknownItems: parsed.unknownItems } : {}),
      ...(parsed.errorSpans ? { errorSpans: parsed.errorSpans } : {})
    })
  }
  stopTimer()
  practiceStarted.value = false
  delete timerStates[essay.id]
  touchEssay(essay.id)
  nextTick(() => { renderTrendChart(); renderRadarChart() })
}

// ========== 历史面板 ==========
function openHistoryPanel(essayId) {
  historyEssayId.value = essayId
  showHistoryPanel.value = true
}

async function submitTranslation() {
  if (!userTranslation.value.trim()) return
  if (scoringMode.value === 'window') { copyPromptToClipboard(); return }
  if (!apiKey.value) { ElMessage.warning('请先填写 DeepSeek API Key'); return }

  scoring.value = true
  const prompt = buildScoringPrompt()

  try {
    const result = await callDeepSeek(prompt, 0.3)
    if (!result) { scoring.value = false; return }

    const parsed = extractJSON(result)
    if (!parsed) throw new Error('未识别到评分JSON')
    saveScoreResult(parsed)
  } catch (e) {
    ElMessage.error('评分解析失败：' + e.message)
  }
  scoring.value = false
}

// ========== 练习流程 ==========
function startPractice() {
  if (!currentEssay.value) return
  stopTimer()
  practiceStarted.value = true
  userTranslation.value = ''
  elapsed.value = 0
  timerInterval = setInterval(() => { elapsed.value++ }, 1000)
}

function stopTimer() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null }
}

function toggleHighlight() { /* 简单划词：点击词→查词典API，暂不实现 */ }

// ========== 范文管理 ==========
async function addEssay() {
  if (!newEssay.originalEN.trim() || !apiKey.value) {
    ElMessage.warning('请填写英文原文和API Key')
    return
  }
  aiProcessing.value = true
  try {
    const segmentPrompt = promptConfig.value.segmentPrompt || SEGMENT_PROMPT
    const prompt = segmentPrompt + newEssay.originalEN

    const result = await callDeepSeek(prompt, 0.3, segmentPrompt)
    if (!result) { aiProcessing.value = false; return }
    const parsed = extractJSON(result) || { segments: [{ en: newEssay.originalEN, contextZH: '', keyPoints: [] }] }

    essays.value.push({
      id: generateId(),
      date: newEssay.date || new Date().toISOString().slice(0, 10),
      title: newEssay.title || '未命名',
      source: newEssay.source || '自定义',
      originalEN: newEssay.originalEN,
      referenceTranslation: newEssay.referenceTranslation || '',
      segments: parsed.segments
    })
    ElMessage.success('范文添加成功')
    showAddDialog.value = false
    Object.assign(newEssay, { title: '', source: '', date: '', originalEN: '', referenceTranslation: '' })
  } catch (e) { ElMessage.error('AI处理失败：' + e.message) }
  aiProcessing.value = false
}


// ====== Drag & Drop reorder ======
let dragOverIdx = ref(-1)
function onEssayDragStart(e, essayId) {
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('text/plain', essayId)
  e.currentTarget.classList.add('dragging')
}
function onEssayDragEnd(e) {
  e.currentTarget.classList.remove('dragging')
  dragOverIdx.value = -1
}
function onEssayDragOver(e, idx) {
  e.preventDefault()
  e.dataTransfer.dropEffect = 'move'
  dragOverIdx.value = idx
}
function onEssayDragLeave() {
  dragOverIdx.value = -1
}
function onEssayDrop(e, dropIdx) {
  e.preventDefault()
  dragOverIdx.value = -1
  const dragId = e.dataTransfer.getData('text/plain')
  if (!dragId || dragId === essays.value[dropIdx]?.id) return
  const arr = essayOrder.value.filter(id => id !== dragId)
  arr.splice(dropIdx, 0, dragId)
  essayOrder.value = arr
  saveEssayOrder()
  sortEssays()
}

// ========== 导入导出 ==========
function exportData() {
  const blob = new Blob([JSON.stringify({
    essays: essays.value, records: records.value, settings, annotations: essayAnnotations.value,
    scoringPrompt: promptConfig.value.scoringPrompt,
    segmentPrompt: promptConfig.value.segmentPrompt,
    exportVersion: 3
  }, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = `english-translation-backup-${new Date().toISOString().slice(0,10)}.json`; a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('数据已导出（含评分提示词，可自包含评分）')
}

function importData(file) {
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result)
      if (data.essays) essays.value = data.essays
      if (data.records) records.value = data.records
      if (data.settings) Object.assign(settings, data.settings)
      if (data.annotations) essayAnnotations.value = data.annotations
      if (data.exportVersion >= 3) saveAnnotations()
      if (data.scoringPrompt) promptConfig.value.scoringPrompt = data.scoringPrompt
      if (data.segmentPrompt) promptConfig.value.segmentPrompt = data.segmentPrompt
      saveData()
      const ver = data.exportVersion === 2 ? '(含提示词)' : ''
      ElMessage.success(`导入成功：${data.essays?.length || 0}篇范文，${data.records?.length || 0}条记录 ${ver}`)
    } catch (ex) { ElMessage.error('文件格式错误') }
  }
  reader.readAsText(file)
  return false
}

// ========== 图表 ==========
function renderTrendChart() {
  if (!trendChartRef.value || records.value.length < 2) return
  const done = records.value.filter(r => r.completed).sort((a, b) => a.date.localeCompare(b.date))
  if (done.length < 2) return
  const chart = echarts.init(trendChartRef.value)
  chart.setOption({
    grid: { top: 8, right: 8, bottom: 24, left: 32 },
    xAxis: { type: 'category', data: done.map(r => r.date.slice(5)), axisLabel: { fontSize: 10 } },
    yAxis: { type: 'value', min: 0, max: 100, axisLabel: { fontSize: 10 } },
    series: [{ data: done.map(r => r.totalScore), type: 'line', smooth: true, areaStyle: { opacity: 0.15 }, lineStyle: { color: '#409EFF' }, itemStyle: { color: '#409EFF' }, symbolSize: 4 }],
  })
  chart.resize()
}

function renderRadarChart() {
  if (!radarChartRef.value || !scoredRecord.value) return
  const s = scoredRecord.value.score
  const chart = echarts.init(radarChartRef.value)
  chart.setOption({
    radar: { center: ['50%', '50%'], radius: '70%', indicator: [{ name: '准确性', max: 25 }, { name: '语法结构', max: 25 }, { name: '词汇表达', max: 25 }, { name: '流畅度', max: 25 }], axisName: { fontSize: 9 } },
    series: [{ type: 'radar', data: [{ value: [s.accuracy, s.grammar, s.vocabulary, s.fluency], name: '本次', areaStyle: { color: 'rgba(64,158,255,0.2)' }, lineStyle: { color: '#409EFF' } }], symbolSize: 3 }],
  })
  chart.resize()
}



// ========== 图片导入增强 ==========
function openImageImport() {
  imageExtractMode.value = 'strict'
  imageImportPrompt.value = promptConfig.value.imageStrictPrompt || IMAGE_IMPORT_DEFAULT_PROMPT
  // Preserve existing images/slots — only init if empty
  if (!imageSlots.value.length || !imageSlots.value.some(s => s.url)) {
    imageSlots.value = [{ url: '', blob: null }]
  }
  imageImportResult.value = ''
  showImageImportDialog.value = true
}

function onImageDialogOpened() {
  // Focus handled by individual slot paste handlers
}

function onImagePaste(e) {
  // Backward compat: redirect to slot 0
  onSlotPaste(e, 0)
}

const imageExtractMode = ref('strict') // 'strict' | 'reference'
const imageSlots = ref([{ url: '', blob: null }]) // multi-image mode

function onExtractModeChange(mode) {
  imageExtractMode.value = mode
  if (mode === 'strict') {
    imageImportPrompt.value = promptConfig.value.imageStrictPrompt || IMAGE_IMPORT_DEFAULT_PROMPT
  } else {
    imageImportPrompt.value = promptConfig.value.imageRefPrompt || IMAGE_IMPORT_PROMPT_REFERENCE
  }
}

function saveImagePrompt() {
  if (imageExtractMode.value === 'strict') {
    promptConfig.value.imageStrictPrompt = imageImportPrompt.value
  } else {
    promptConfig.value.imageRefPrompt = imageImportPrompt.value
  }
  savePromptConfig()
  ElMessage.success('提示词已保存')
}

function addImageSlot() {
  if (imageSlots.value.length >= 5) { ElMessage.warning('最多5张截图'); return }
  imageSlots.value.push({ url: '', blob: null })
}

function removeImageSlot(idx) {
  if (imageSlots.value.length <= 1) { ElMessage.warning('至少保留1个槽位'); return }
  imageSlots.value.splice(idx, 1)
}

function onSlotPaste(e, idx) {
  const items = e.clipboardData?.items
  if (!items) return
  const images = []
  for (const item of items) {
    if (item.type.startsWith('image/')) images.push(item)
  }
  if (!images.length) return
  e.preventDefault()
  // Fill slots starting from idx, auto-expand if needed
  images.forEach((item, i) => {
    const targetIdx = idx + i
    while (targetIdx >= imageSlots.value.length && imageSlots.value.length < 5) {
      imageSlots.value.push({ url: '', blob: null })
    }
    if (targetIdx < imageSlots.value.length) {
      const blob = item.getAsFile()
      const reader = new FileReader()
      reader.onload = (ev) => { imageSlots.value[targetIdx].url = ev.target.result; imageSlots.value[targetIdx].blob = blob }
      reader.readAsDataURL(blob)
    }
  })
  if (images.length > 1) ElMessage.success(`已识别 ${images.length} 张图片，自动填充槽位`)
}

function onBatchPaste(e) {
  const items = e.clipboardData?.items
  if (!items) return
  const images = []
  for (const item of items) {
    if (item.type.startsWith('image/')) images.push(item)
  }
  if (!images.length) return
  e.preventDefault()
  // Auto-expand slots to fit all images (max 5)
  while (imageSlots.value.length < Math.min(images.length, 5)) {
    imageSlots.value.push({ url: '', blob: null })
  }
  images.forEach((item, i) => {
    if (i >= imageSlots.value.length) return
    const blob = item.getAsFile()
    const reader = new FileReader()
    reader.onload = (ev) => {
      imageSlots.value[i].url = ev.target.result
      imageSlots.value[i].blob = blob
    }
    reader.readAsDataURL(blob)
  })
  ElMessage.success(`已识别 ${Math.min(images.length, 5)} 张图片`)
}

const buildImagePrompt = computed(() => {
  const base = imageImportPrompt.value
  const slotCount = imageSlots.value.filter(s => s.url).length
  if (slotCount <= 1) return base
  return `${base}\n\n⚠️ 本次共提供了 ${slotCount} 张截图（多图拼接/连续多页），请综合所有截图内容进行分析。`
})

async function copyImagePrompt() {
  const prompt = buildImagePrompt.value
  if (!prompt.trim()) { ElMessage.warning('提示词为空'); return }
  const filledSlots = imageSlots.value.filter(s => s.url)
  if (!filledSlots.length) { ElMessage.warning('请先粘贴至少一张截图'); return }

  try {
    // Load all images
    const imgs = await Promise.all(filledSlots.map(s => {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = s.url
      })
    }))

    let imageBlob
    if (imgs.length === 1) {
      // Single image: use blob directly if available, otherwise convert
      const blob = filledSlots[0].blob
      if (blob) {
        imageBlob = blob
      } else {
        imageBlob = await (await fetch(filledSlots[0].url)).blob()
      }
    } else {
      // Stitch images vertically into one combined image
      const maxW = Math.max(...imgs.map(img => img.naturalWidth))
      const totalH = imgs.reduce((s, img) => s + img.naturalHeight, 0) + (imgs.length - 1) * 4 // 4px gap
      const canvas = document.createElement('canvas')
      canvas.width = maxW
      canvas.height = totalH
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, maxW, totalH)

      let y = 0
      for (const img of imgs) {
        ctx.drawImage(img, 0, y, img.naturalWidth, img.naturalHeight)
        y += img.naturalHeight + 4
      }

      imageBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
    }

    // Copy text + combined image to clipboard
    const clipboardItem = new ClipboardItem({
      'text/plain': new Blob([prompt], { type: 'text/plain' }),
      'image/png': imageBlob
    })
    await navigator.clipboard.write([clipboardItem])
    ElMessage.success(`提示词+${imgs.length}张截图${imgs.length > 1 ? '(已竖拼)' : ''}已复制，直接粘贴到AI窗口即可`)
  } catch (e) {
    // Fallback: text only
    try {
      await navigator.clipboard.writeText(prompt)
      ElMessage.warning('仅复制了提示词文本（图片拼接失败：' + e.message + '），请手动附上截图')
    } catch {
      ElMessage.error('复制失败，请手动复制')
    }
  }
}

function importFromImageJson() {
  if (!imageImportResult.value.trim()) { ElMessage.warning('请粘贴AI返回的JSON'); return }
  try {
    const parsed = extractJSON(imageImportResult.value)
    if (!parsed) throw new Error('未识别到JSON')
    if (!parsed.originalEN) throw new Error('JSON缺少originalEN字段')

    essays.value.push({
      id: generateId(),
      date: new Date().toISOString().slice(0, 10),
      title: parsed.title || '图片导入',
      source: parsed.source || '图片导入',
      originalEN: parsed.originalEN,
      referenceTranslation: parsed.referenceTranslation || '',
      segments: (parsed.segments || [{ en: parsed.originalEN, contextZH: '', keyPoints: [] }]).map(seg => ({
        ...seg, rawTeachingNote: seg.raw_teaching_note || ''
      })),
      rawTextArchive: parsed.raw_text_archive || '',
      imageSource: parsed.sourceNote || ''
    })
    sortEssays()
    ElMessage.success(`导入成功：${parsed.title || '未命名'}（${parsed.segments?.length || 1}段）`)
    imageSlots.value = [{ url: '', blob: null }]
    imageImportResult.value = ''
    showImageImportDialog.value = false
  } catch (e) {
    ElMessage.error('JSON解析失败：' + e.message)
  }
}

function importBatchFromImageJson() {
  if (!imageImportResult.value.trim()) { ElMessage.warning('请粘贴AI返回的JSON'); return }
  try {
    // Try array first, then single object
    let items = extractJSON(imageImportResult.value)
    if (!items) throw new Error('未识别到JSON')
    if (!Array.isArray(items)) items = [items]

    let imported = 0
    for (const parsed of items) {
      if (!parsed.originalEN) continue
      essays.value.push({
        id: generateId(),
        date: new Date().toISOString().slice(0, 10),
        title: parsed.title || '图片导入',
        source: parsed.source || '图片导入',
        originalEN: parsed.originalEN,
        referenceTranslation: parsed.referenceTranslation || '',
        segments: (parsed.segments || [{ en: parsed.originalEN, contextZH: '', keyPoints: [] }]).map(seg => ({
          ...seg, rawTeachingNote: seg.raw_teaching_note || ''
        })),
        rawTextArchive: parsed.raw_text_archive || '',
        imageSource: parsed.sourceNote || ''
      })
      imported++
    }
    sortEssays()
    ElMessage.success(`导入成功：${imported}篇`)
    imageSlots.value = [{ url: '', blob: null }]
    imageImportResult.value = ''
    showImageImportDialog.value = false
  } catch (e) {
    ElMessage.error('JSON解析失败：' + e.message)
  }
}

// ========== 批注系统 ==========
function loadAnnotations() {
  try {
    const raw = localStorage.getItem(ANNO_STORAGE_KEY)
    if (raw) essayAnnotations.value = JSON.parse(raw)
  } catch { essayAnnotations.value = {} }
}

function saveAnnotations() {
  localStorage.setItem(ANNO_STORAGE_KEY, JSON.stringify(essayAnnotations.value))
}

function toggleAnnoMode() {
  annoMode.value = !annoMode.value
  if (annoMode.value) {
    nextTick(() => {
      initAnnoCanvas()
      const main = annoMainRef.value
      if (main) {
        main.addEventListener('scroll', onMainScroll, { passive: true })
      }
      window.addEventListener('resize', onWindowResize)
    })
  } else {
    const main = annoMainRef.value
    if (main) {
      main.removeEventListener('scroll', onMainScroll)
    }
    window.removeEventListener('resize', onWindowResize)
  }
}

function initAnnoCanvas() {
  const canvas = annoCanvasRef.value
  const main = annoMainRef.value
  if (!canvas || !main) return

  // Cover the FULL scrollable content of .ett-main
  const w = main.scrollWidth
  const h = main.scrollHeight
  canvas.width = w
  canvas.height = h
  canvas.style.width = w + 'px'
  canvas.style.height = h + 'px'
  redrawAnnoCanvas()
}

function redrawAnnoCanvas() {
  const canvas = annoCanvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const anns = getCurrentAnno()
  for (const ann of anns) {
    drawAnnoStroke(ctx, ann.points, ann.color, ann.width)
  }
  if (currentAnnoStroke.value.length > 1) {
    drawAnnoStroke(ctx, currentAnnoStroke.value, drawColor.value, drawWidth.value)
  }
}

function drawAnnoStroke(ctx, points, color, width) {
  if (points.length < 2) return
  ctx.beginPath()
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.moveTo(points[0].x, points[0].y)
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y)
  }
  ctx.stroke()
}

function getAnnoCoords(e) {
  const canvas = annoCanvasRef.value
  const main = annoMainRef.value
  if (!canvas || !main) return null
  const rect = canvas.getBoundingClientRect()
  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height
  // Account for scroll position so annotations align with scrolled content
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY + main.scrollTop * scaleY
  }
}

function getCurrentAnno() {
  if (!currentEssayId.value) return []
  return essayAnnotations.value[currentEssayId.value] || []
}

function setCurrentAnno(anns) {
  if (currentEssayId.value) {
    essayAnnotations.value[currentEssayId.value] = anns
    saveAnnotations()
  }
}

function onAnnoMouseDown(e) {
  if (!annoMode.value) return
  const pos = getAnnoCoords(e)
  if (!pos) return

  if (isErasing.value) {
    const erased = eraseAnnoAtPos(pos)
    if (erased) redrawAnnoCanvas()
  } else {
    isDrawing.value = true
    currentAnnoStroke.value = [{ x: pos.x, y: pos.y }]
  }
}

function onAnnoMouseMove(e) {
  if (!annoMode.value) return
  const pos = getAnnoCoords(e)
  if (!pos) return

  if (isDrawing.value) {
    currentAnnoStroke.value.push({ x: pos.x, y: pos.y })
    redrawAnnoCanvas()
  } else if (isErasing.value && e.buttons === 1) {
    const erased = eraseAnnoAtPos(pos)
    if (erased) redrawAnnoCanvas()
  }
}

function onAnnoMouseUp() {
  if (isDrawing.value && currentAnnoStroke.value.length > 1) {
    const anns = getCurrentAnno()
    anns.push({
      points: [...currentAnnoStroke.value],
      color: drawColor.value,
      width: drawWidth.value
    })
    setCurrentAnno(anns)
  }
  isDrawing.value = false
  currentAnnoStroke.value = []
}

function eraseAnnoAtPos(pos) {
  const size = drawWidth.value * 4 + 4
  const half = size / 2
  const rect = { left: pos.x - half, right: pos.x + half, top: pos.y - half, bottom: pos.y + half }

  const anns = getCurrentAnno()
  const newAnns = []
  let changed = false

  for (const ann of anns) {
    const segments = splitAnnoStrokeByRect(ann.points, rect)
    if (segments.length === 1 && segments[0].length === ann.points.length) {
      newAnns.push(ann)
    } else {
      changed = true
      for (const seg of segments) {
        if (seg.length > 1) {
          newAnns.push({ points: seg, color: ann.color, width: ann.width })
        }
      }
    }
  }

  if (changed) setCurrentAnno(newAnns)
  return changed
}

function splitAnnoStrokeByRect(points, rect) {
  const segments = []
  let current = []
  for (const p of points) {
    const inside = p.x >= rect.left && p.x <= rect.right && p.y >= rect.top && p.y <= rect.bottom
    if (inside) {
      if (current.length > 1) { segments.push(current); current = [] }
      else { current = [] }
    } else {
      if (current.length === 0) current.push(p)
      else current.push(p)
    }
  }
  if (current.length > 1) segments.push(current)
  return segments
}

function setDrawColor(color) {
  drawColor.value = color
  isErasing.value = false
}

function toggleErase() {
  isErasing.value = !isErasing.value
}

function clearAnnoDrawings() {
  setCurrentAnno([])
  currentAnnoStroke.value = []
  redrawAnnoCanvas()
}

// 切换essay时重新初始化canvas
watch(currentEssayId, (newId, oldId) => {
  if (annoMode.value && newId) {
    nextTick(() => { initAnnoCanvas() })
  }
})

// 监听主区域滚动，同步canvas覆盖
function onMainScroll() {
  if (!annoMode.value) return
  const main = annoMainRef.value
  const canvas = annoCanvasRef.value
  if (!main || !canvas) return
  // Resize canvas when content changes (e.g., scoredRecord appears)
  const w = main.scrollWidth
  const h = main.scrollHeight
  if (canvas.width !== w || canvas.height !== h) {
    initAnnoCanvas()
  }
}

// 窗口大小变化时重设canvas
function onWindowResize() {
  if (annoMode.value) initAnnoCanvas()
}

watch([essays, records, essayOrder, essayAnnotations, tokenUsage], syncData, { deep: true })
watch(currentEssayId, (newId, oldId) => {
  // Save current essay's translation draft and timer state
  if (oldId) {
    translationDrafts[oldId] = userTranslation.value
    if (practiceStarted.value) {
      timerStates[oldId] = { elapsed: elapsed.value, running: timerInterval !== null }
    }
  }
  stopTimer()
  // Restore new essay's draft
  userTranslation.value = translationDrafts[newId] || ''
  const saved = timerStates[newId]
  if (saved) {
    elapsed.value = saved.elapsed
    practiceStarted.value = true
    if (saved.running) {
      timerInterval = setInterval(() => { elapsed.value++ }, 1000)
    }
  } else {
    elapsed.value = 0
    practiceStarted.value = false
  }
})
watch(userTranslation, (val) => {
  // Persist draft on every change
  if (currentEssay.value) translationDrafts[currentEssay.value.id] = val
  if (val.trim() && !practiceStarted.value && currentEssay.value) {
    practiceStarted.value = true
    elapsed.value = 0
    stopTimer()
    timerInterval = setInterval(() => { elapsed.value++ }, 1000)
  }
})
watch(apiKey, (v) => localStorage.setItem('ett_apikey', v))
watch(customPrompts, () => saveCustomPrompts(), { deep: true })

// ========== 生命周期 ==========
onMounted(() => {
  loadData()
  loadPromptConfig()
  if (essays.value.length > 0 && !currentEssayId.value) currentEssayId.value = essays.value[0].id
})
</script>

<style scoped>
.ett-container { display:flex; flex-direction:column; height:calc(100vh - 80px); padding:12px; gap:8px; box-sizing:border-box; }
.ett-header { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.ett-title { margin:0; font-size:18px; white-space:nowrap; }
.ett-header-actions { display:flex; align-items:center; gap:6px; margin-left:auto; }
.ett-body { display:flex; flex:1; gap:8px; overflow:hidden; background:#fff; border-radius:8px; }
.ett-body.dark { background:#1a1a2e; color:#e0e0e0; }

/* 左侧 */
.ett-left { width:260px; flex-shrink:0; display:flex; flex-direction:column; overflow:hidden; border-right:1px solid #eee; }
.ett-left-tabs { flex:1; overflow:hidden; }
.ett-left-tabs :deep(.el-tabs__content) { overflow-y:auto; height:calc(100% - 40px); }
.essay-list { padding:8px; }
.essay-item { padding:8px; border-radius:6px; cursor:pointer; margin-bottom:4px; transition:background .15s; border:1px solid transparent; }
.essay-item:hover { background:#f0f4ff; }
.essay-item.active { background:#e8f0fe; border-color:#409EFF; }
.essay-item.done { opacity:.85; }
.essay-item-title { font-weight:600; font-size:13px; }
.essay-item-meta { font-size:11px; color:#8492a6; margin-top:2px; }
.essay-item-score { margin-top:4px; }
.cal-cell { position:relative; cursor:pointer; padding:4px; text-align:center; }
.cal-cell.checked { font-weight:700; }
.cal-dot { display:inline-block; width:6px; height:6px; border-radius:50%; margin-left:2px; vertical-align:middle; }
.stats-panel { padding:12px; border-top:1px solid #eee; display:grid; grid-template-columns:1fr 1fr; gap:8px; }
.stat-row { text-align:center; }
.stat-row span { font-size:11px; color:#8492a6; display:block; }
.stat-row strong { font-size:16px; }

/* 中间 */
.ett-main { flex:1; overflow-y:auto; padding:12px; }
.section { margin-bottom:16px; border:1px solid #eee; border-radius:8px; padding:12px; position:relative; z-index:1; }
.section-header { display:flex; align-items:center; gap:8px; margin-bottom:8px; position:relative; z-index:60; }
.section-label { font-weight:700; font-size:14px; }
.section-source { font-size:12px; color:#8492a6; }
.timer { font-family:monospace; font-size:14px; color:#409EFF; margin-left:auto; }
.original-text { max-height:260px; overflow-y:auto; }
.orig-seg { display:flex; align-items:flex-start; gap:6px; padding:6px 4px; cursor:pointer; border-radius:4px; transition:background .15s; }
.orig-seg:hover { background:#f8f9fa; }
.orig-seg.selected { background:#e8f0fe; }
.seg-num { flex-shrink:0; width:20px; height:20px; border-radius:50%; background:#409EFF; color:#fff; font-size:11px; text-align:center; line-height:20px; }
.seg-en { flex:1; font-size:14px; line-height:1.6; }
.seg-hint { font-size:11px; color:#F59E0B; flex-shrink:0; }

/* 对照视图 */
.compare-view { display:flex; gap:8px; }
.compare-col { flex:1; border:1px solid #eee; border-radius:6px; padding:8px; }
.compare-col-title { font-size:12px; color:#8492a6; margin-bottom:6px; font-weight:600; }
.compare-col p { margin:4px 0; padding:4px; border-radius:3px; font-size:13px; line-height:1.6; }
.compare-col p.match { background:#f0fff0; }
.compare-col p.diff { background:#fff3cd; }
.compare-col p.missing { background:#ffe0e0; color:#aaa; font-style:italic; }

/* 右侧评分 */
.ett-right { width:320px; flex-shrink:0; overflow-y:auto; padding:12px; border-left:1px solid #eee; }
.score-card { text-align:center; }
.total-score { font-size:48px; font-weight:800; }
.score-unit { font-size:18px; color:#8492a6; }
.dim-scores { margin-top:8px; }
.dim-item { margin-bottom:10px; }
.dim-item span { font-size:12px; color:#606266; display:block; margin-bottom:4px; }
.feedback-card { margin-top:16px; border:1px solid #eee; border-radius:8px; padding:12px; }
.feedback-title { font-weight:700; font-size:14px; margin-bottom:8px; }
.feedback-content { font-size:13px; line-height:1.8; }
.history-card { margin-top:12px; }

/* Dark mode */
.dark .essay-item:hover { background:#2a2a3e; }
.dark .essay-item.active { background:#1e3a5f; }
.dark .section,.dark .feedback-card,.dark .score-card { border-color:#333; }
.dark .stat-row span { color:#aaa; }
.dark .compare-col p.match { background:#1a3a1a; }
.dark .compare-col p.diff { background:#3a3510; }
.dark .orig-seg:hover { background:#2a2a3e; }

/* Window AI mode */
.window-ai-paste { margin-top:12px; padding:10px; background:#fdf6e3; border-radius:6px; border:1px dashed #e6c560; }
.window-ai-label { font-size:12px; color:#b8860b; margin-bottom:6px; font-weight:600; }

/* B站链接 */
.bilibili-links { margin-top:12px; }
.bilibili-title { font-size:12px; color:#fb7299; font-weight:600; margin-bottom:6px; }
.bilibili-card { display:flex; flex-wrap:wrap; align-items:center; gap:6px; padding:8px; margin-bottom:6px; background:#fff7fa; border:1px solid #ffe0ea; border-radius:6px; text-decoration:none; color:#333; transition:background .15s; }
.bilibili-card:hover { background:#ffe0ea; }
.bilibili-tag { font-size:11px; background:#fb7299; color:#fff; padding:1px 6px; border-radius:3px; flex-shrink:0; }
.bilibili-name { font-size:13px; font-weight:600; color:#e8587a; }
.bilibili-desc { font-size:11px; color:#999; width:100%; }

/* History */
.history-btn { font-size:11px; padding:0 2px; margin-left:6px; }
.history-essay-info h3 { margin:0 0 4px; font-size:16px; }
.history-meta { font-size:12px; color:#8492a6; margin:0; }
.history-empty { padding:40px 0; }
.history-record-card { padding:8px 0; }
.history-record-header { display:flex; align-items:center; gap:8px; margin-bottom:6px; }
.history-record-date { font-size:13px; font-weight:600; }
.history-time { font-size:12px; color:#8492a6; margin-left:auto; }
.history-dims { display:flex; gap:12px; font-size:11px; color:#606266; margin-bottom:6px; }
.history-dims span { background:#f0f4ff; padding:2px 6px; border-radius:3px; }
.history-translation { margin-bottom:6px; }
.history-translation p { font-size:12px; color:#444; margin:2px 0 0; line-height:1.6; }
.history-label { font-size:11px; color:#8492a6; font-weight:600; }
.history-feedback p { font-size:12px; line-height:1.6; margin:2px 0 0; }

/* Hint text */
.hint-text { font-size:11px; color:#8492a6; margin-top:4px; }
.mode-desc p { margin:4px 0; font-size:12px; color:#606266; }
.mode-desc b { color:#333; }


/* Image import dialog */
/* Image import dialog */
.image-import-layout { display:flex; gap:16px; }
.image-import-left { width:340px; flex-shrink:0; }
.image-import-right { flex:1; display:flex; flex-direction:column; }
.image-paste-label { font-size:13px; font-weight:600; margin-bottom:6px; }
.image-paste-zone {
  width:100%; height:320px; border:2px dashed #d9d9d9; border-radius:8px;
  display:flex; align-items:center; justify-content:center; cursor:pointer;
  outline:none; transition:border-color .2s; overflow:hidden; background:#f5f5f5;
}
.image-paste-zone:focus { border-color:#409EFF; }
.image-paste-zone.has-image { border-style:solid; border-color:#67C23A; padding:0; background:#fff; }
.paste-placeholder { text-align:center; color:#c0c4cc; display:flex; flex-direction:column; align-items:center; gap:8px; font-size:13px; }
.paste-icon { font-size:36px; }
.pasted-image-preview { width:100%; height:100%; object-fit:contain; }
.image-import-section { display:flex; flex-direction:column; }
.image-import-label { font-size:13px; font-weight:600; margin-bottom:6px; }

/* Annotation system */
.anno-main { position:relative; }
.anno-float-toolbar {
  display:flex; align-items:center; gap:6px; padding:4px 10px;
  background:#fffaeb; border:1px solid #ffe8a0; border-bottom:2px solid #f0c040;
  border-radius:0 0 6px 6px; flex-wrap:wrap;
  position:sticky; top:0; z-index:100;
}
.toolbar-label { font-size:11px; color:#606266; white-space:nowrap; }
.color-dot {
  width:18px; height:18px; border-radius:50%; cursor:pointer;
  border:2px solid transparent; transition:border-color .15s, transform .15s; flex-shrink:0;
}
.color-dot:hover { transform:scale(1.15); }
.color-dot.active { border-color:#333; box-shadow:0 0 0 2px rgba(0,0,0,0.15); }
.anno-count { font-size:11px; color:#8492a6; white-space:nowrap; margin-left:4px; }

.anno-canvas {
  position:absolute; top:0; left:0; z-index:50; cursor:crosshair;
  pointer-events:auto; background:transparent;
}

/* responsive */
@media (max-width:1000px) { .ett-body { flex-direction:column; } .ett-left,.ett-right { width:100%; border:none; } }

/* ========== Token 用量 ========== */
.token-usage {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
}
.token-label { margin-right: 2px; }
.token-val { color: #409EFF; font-weight: 600; }
.token-detail { color: #c0c4cc; }

/* ========== 水波训练 ========== */
.wave-section { margin-top: 12px; }
.wave-seg-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 8px 0;
}
.wave-seg-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid #e4e7ed;
  transition: all 0.2s;
  font-size: 14px;
}
.wave-seg-item:hover { border-color: #409EFF; background: #ecf5ff; }
.wave-seg-item.active { border-color: #409EFF; background: #d9ecff; box-shadow: 0 0 0 2px rgba(64,158,255,0.2); }
.wave-seg-item.analyzing { opacity: 0.7; pointer-events: none; }
.wave-seg-item.cached { border-color: #c0e0c0; }
.wave-seg-num {
  width: 24px; height: 24px;
  border-radius: 50%;
  background: #409EFF;
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px;
  flex-shrink: 0;
}
.wave-seg-text { flex: 1; }
.wave-seg-badge { color: #67c23a; font-size: 12px; flex-shrink: 0; }

.wave-answer-card {
  margin-top: 12px;
  padding: 16px;
  border-radius: 10px;
  background: linear-gradient(135deg, #f0f7ff 0%, #e8f4fd 100%);
  border: 2px solid #b3d8ff;
}
.wave-answer-header { margin-bottom: 10px; }
.wave-answer-title { font-weight: 700; font-size: 15px; color: #303133; }
.wave-tree-section { margin-bottom: 10px; }
.wave-tree-label {
  font-size: 13px;
  color: #606266;
  font-weight: 600;
  margin-bottom: 4px;
}
.wave-tree-text {
  font-size: 14px;
  color: #303133;
  line-height: 1.6;
  padding-left: 8px;
  border-left: 3px solid #409EFF;
}
.wave-tree-text.stuck { border-left-color: #f56c6c; background: #fef0f0; padding: 8px; border-radius: 0 6px 6px 0; }
.wave-tree-text.resolve { border-left-color: #67c23a; background: #f0f9eb; padding: 8px; border-radius: 0 6px 6px 0; }
.wave-tree-text.analogy { border-left-color: #e6a23c; background: #fdf6ec; padding: 8px; border-radius: 0 6px 6px 0; font-style: italic; }
.wave-raw { font-size: 13px; white-space: pre-wrap; color: #606266; margin: 0; }

.wave-summary-section { margin-top: 16px; }
.wave-summary-header { font-weight: 700; font-size: 16px; margin-bottom: 10px; }
.wave-summary-overview { font-size: 14px; color: #303133; line-height: 1.6; margin-bottom: 12px; }
.wave-summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
.wave-summary-col { background: #fafafa; border-radius: 8px; padding: 10px; }
.wave-summary-label { font-size: 13px; color: #606266; font-weight: 600; margin-bottom: 6px; }
.wave-summary-col ul { margin: 0; padding-left: 18px; font-size: 13px; color: #606266; }
.wave-summary-col li { margin-bottom: 4px; }
.focus-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
.wave-summary-cheer {
  margin-top: 12px;
  padding: 10px 14px;
  background: linear-gradient(135deg, #e8f8e8, #d4edda);
  border-radius: 8px;
  font-size: 14px;
  color: #2d6a4f;
  font-weight: 500;
}

/* ========== 图片导入增强 ========== */
.extract-mode-bar {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
}
.image-slots-section { margin-bottom: 10px; }
.image-slots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 8px;
}
.image-slot-wrap { position: relative; }
.image-slot {
  width: 100%;
  aspect-ratio: 4/3;
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.2s;
  overflow: hidden;
  background: #fafafa;
}
.image-slot:focus { outline: none; border-color: #409EFF; }
.image-slot.has-image { border-style: solid; border-color: #c0c4cc; }
.slot-preview { width: 100%; height: 100%; object-fit: contain; }
.slot-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  color: #c0c4cc;
  font-size: 13px;
}
.slot-hint { font-size: 11px; color: #dcdfe6; }
.slot-remove { position: absolute; top: -6px; right: -6px; padding: 2px 6px; min-width: auto; }
.batch-paste-section { margin-top: 12px; }
.batch-paste-zone {
  border: 2px dashed #e6a23c;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  color: #e6a23c;
  font-size: 13px;
  cursor: pointer;
  background: #fdf6ec;
  transition: all 0.2s;
}
.batch-paste-zone:focus { border-color: #f56c6c; background: #fef0f0; }
.single-fallback { margin-top: 8px; }

/* ========== 错误结构分析卡片 ========== */
.mistake-wave-card {
  margin-top: 12px;
  padding: 14px;
  border-radius: 10px;
  background: #fef7f0;
  border: 1px solid #f5dab1;
}
.mw-pattern { margin: 8px 0; }
.mw-pattern code {
  background: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 13px;
  color: #e6a23c;
  border: 1px solid #f5dab1;
}
.mw-label { font-size: 12px; color: #909399; margin-right: 4px; }
.mw-stuck, .mw-next { font-size: 13px; color: #606266; margin-bottom: 6px; line-height: 1.5; }
.mw-examples { margin: 8px 0; }
.mw-example-item { padding: 6px 10px; background: #fff; border-radius: 6px; margin-bottom: 4px; }
.mw-ex-en { font-size: 13px; color: #303133; font-weight: 500; }
.mw-ex-zh { font-size: 12px; color: #909399; }

/* ========== 生词短语池 ========== */
.vocab-pool-card {
  margin-top: 12px;
  padding: 14px;
  border-radius: 10px;
  border: 1px solid #e4e7ed;
}
.vocab-list { max-height: 400px; overflow-y: auto; }
.vocab-item {
  padding: 8px 10px;
  border-bottom: 1px solid #f2f3f5;
}
.vocab-item:last-child { border-bottom: none; }
.vocab-word {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}
.vocab-text { font-weight: 600; font-size: 14px; color: #303133; }
.vocab-meaning { font-size: 13px; color: #606266; margin-bottom: 2px; }
.vocab-meta { font-size: 11px; color: #c0c4cc; }

/* ========== Drag-drop ========== */
.essay-item.dragging { opacity: 0.5; }
.essay-item.drag-over { border-color: #409EFF; background: #ecf5ff; }

</style>
