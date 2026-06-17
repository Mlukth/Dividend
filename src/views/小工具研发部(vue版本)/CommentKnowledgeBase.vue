<template>
  <div class="ckb-container">
    <!-- 顶栏 -->
    <div class="ckb-header">
      <h2 class="ckb-title">📚 评论区知识库</h2>
      <div class="ckb-header-actions">
        <el-input v-model="apiKey" type="password" placeholder="DeepSeek API Key" size="small" style="width:220px" show-password />
        <el-radio-group v-model="scoringMode" size="small">
          <el-radio-button value="api">API处理</el-radio-button>
          <el-radio-button value="window">窗口AI</el-radio-button>
        </el-radio-group>
        <el-button size="small" type="primary" @click="showInputDialog = true">+ 新评论</el-button>
        <el-button size="small" @click="showPromptDialog = true">提示词</el-button>
      </div>
    </div>

    <!-- 三栏主体 -->
    <div class="ckb-body">
      <!-- 左栏：知识库浏览 -->
      <aside class="ckb-left">
        <div class="left-search">
          <el-input v-model="searchQuery" placeholder="搜索观点..." size="small" clearable>
            <template #prefix><span>🔍</span></template>
          </el-input>
        </div>

        <!-- 话题树 -->
        <div class="left-section">
          <div class="left-section-title">🏷 话题</div>
          <div class="topic-list">
            <div v-for="topic in topicTree" :key="topic.name"
              class="topic-item" :class="{active: activeTopic === topic.name}"
              @click="activeTopic = topic.name">
              <span class="topic-name">{{ topic.name }}</span>
              <span class="topic-count">{{ topic.count }}</span>
            </div>
          </div>
        </div>

        <!-- 标签筛选 -->
        <div class="left-section">
          <div class="left-section-title">🏷 标签</div>
          <div class="tag-cloud">
            <span v-for="tag in allTags" :key="tag.name"
              class="tag-chip" :class="{active: activeTag === tag.name}"
              @click="activeTag = activeTag === tag.name ? null : tag.name">
              {{ tag.name }}<span class="tag-n">{{ tag.count }}</span>
            </span>
          </div>
        </div>

        <!-- 信息价值筛选 -->
        <div class="left-section">
          <div class="left-section-title">⭐ 信息价值</div>
          <div class="value-filters">
            <span v-for="v in [5,4,3,2,1]" :key="v"
              class="value-chip" :class="{active: minInfoValue === v, dim: minInfoValue > v}"
              @click="minInfoValue = minInfoValue === v ? 0 : v">
              {{ '⭐'.repeat(v) }}
            </span>
          </div>
        </div>

        <!-- 观点列表 -->
        <div class="left-section" style="flex:1;overflow-y:auto">
          <div class="left-section-title">
            📌 观点 ({{ filteredViewpoints.length }})
          </div>
          <div v-for="vp in filteredViewpoints" :key="vp.id"
            class="vp-item" :class="{active: activeViewpoint?.id === vp.id}"
            @click="activeViewpoint = vp">
            <div class="vp-item-tag">{{ vp.tag }}</div>
            <div class="vp-item-speaker">{{ vp.speaker }}<span v-if="vp.speakerRole==='UP主'" class="up-badge">UP</span></div>
            <div class="vp-item-preview">{{ vp.original.slice(0, 40) }}...</div>
            <div class="vp-item-meta">
              <span class="vp-value vp-value-{{ vp.infoValue }}">{{ '⭐'.repeat(vp.infoValue) }}</span>
              <span class="vp-topics">{{ vp.topics[0] }}</span>
            </div>
          </div>
        </div>
      </aside>

      <!-- 中栏：观点详情 + 输入 -->
      <main class="ckb-center">
        <template v-if="activeViewpoint">
          <!-- 观点阅读版 -->
          <div class="center-section">
            <div class="center-section-hdr">
              <span class="section-label">📖 观点详情</span>
              <span class="vp-value-badge" :class="'val-'+activeViewpoint.infoValue">
                ⭐{{ activeViewpoint.infoValue }}
              </span>
            </div>
            <div class="vp-detail">
              <div class="vp-detail-header">
                <span class="vp-detail-tag">[{{ activeViewpoint.tag }}]</span>
                <span class="vp-detail-speaker">
                  {{ activeViewpoint.speaker }}
                  <span v-if="activeViewpoint.speakerRole==='UP主'" class="role-badge up">UP主</span>
                  <span v-else-if="activeViewpoint.speakerRole==='提问者'" class="role-badge ask">提问</span>
                  <span v-else class="role-badge comment">评论</span>
                </span>
              </div>
              <div class="vp-detail-original">{{ activeViewpoint.original }}</div>
              <div class="vp-detail-attrs">
                <span class="attr-item">📂 {{ activeViewpoint.topics.join(' / ') }}</span>
                <span class="attr-item">💬 {{ activeViewpoint.stance }}</span>
                <span class="attr-item">📝 {{ activeViewpoint.infoType }}</span>
              </div>
            </div>
          </div>

          <!-- 来源上下文 -->
          <div class="center-section">
            <div class="center-section-hdr">
              <span class="section-label">📋 来源上下文</span>
            </div>
            <div class="source-context">
              <div class="source-thread">
                <div class="source-thread-title">
                  {{ activeViewpoint.source?.videoTitle || '楼层讨论' }}
                </div>
                <div class="source-thread-meta">
                  {{ activeViewpoint.source?.platform || 'B站' }} ·
                  {{ activeViewpoint.source?.up主 || '' }} ·
                  {{ activeViewpoint.source?.date || '' }}
                </div>
                <!-- 同楼层其他观点 -->
                <div class="sibling-vps" v-if="siblingViewpoints.length > 1">
                  <div class="sibling-label">同楼层其他观点：</div>
                  <div v-for="svp in siblingViewpoints.filter(s => s.id !== activeViewpoint.id)" :key="svp.id"
                    class="sibling-vp" @click="activeViewpoint = svp">
                    <span class="sibling-tag">[{{ svp.tag }}]</span>
                    <span class="sibling-speaker">{{ svp.speaker }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- 无选中时的占位 -->
        <div v-else class="center-empty">
          <div class="empty-icon">📚</div>
          <div class="empty-text">从左侧选择一个观点查看详情</div>
          <div class="empty-sub">或点击顶栏"+ 新评论"添加内容</div>
        </div>
      </main>

      <!-- 右栏：JSON + 元数据 -->
      <aside class="ckb-right">
        <div class="right-section" v-if="activeViewpoint">
          <div class="right-section-hdr">
            <span class="section-label">{ } JSON</span>
            <el-button size="small" text @click="copyJson">📋 复制</el-button>
          </div>
          <pre class="json-view">{{ JSON.stringify(activeViewpoint, null, 2) }}</pre>
        </div>
        <div class="right-section" v-if="activeViewpoint">
          <div class="right-section-hdr">
            <span class="section-label">📊 统计</span>
          </div>
          <div class="stat-grid">
            <div class="stat-item">
              <div class="stat-val">{{ allViewpoints.length }}</div>
              <div class="stat-lbl">总观点</div>
            </div>
            <div class="stat-item">
              <div class="stat-val">{{ topicTree.length }}</div>
              <div class="stat-lbl">话题</div>
            </div>
            <div class="stat-item">
              <div class="stat-val">{{ allTags.length }}</div>
              <div class="stat-lbl">标签</div>
            </div>
            <div class="stat-item">
              <div class="stat-val">{{ highValueCount }}</div>
              <div class="stat-lbl">≥⭐4</div>
            </div>
          </div>
        </div>
        <div v-if="!activeViewpoint" class="right-empty">
          <span style="color:#888;font-size:12px">选中观点后显示JSON和统计</span>
        </div>
      </aside>
    </div>

    <!-- 新评论输入弹窗 -->
    <el-dialog v-model="showInputDialog" title="粘贴评论楼层" width="700px" top="3vh">
      <div style="margin-bottom:12px">
        <div style="font-size:12px;color:#888;margin-bottom:4px">视频信息（可选）</div>
        <div style="display:flex;gap:8px">
          <el-input v-model="newThreadSource.videoTitle" placeholder="视频标题" size="small" style="flex:1" />
          <el-input v-model="newThreadSource.UP" placeholder="UP主" size="small" style="width:140px" />
          <el-input v-model="newThreadSource.platform" placeholder="平台" size="small" style="width:100px" value="B站" />
        </div>
      </div>
      <el-input v-model="newThreadText" type="textarea" :rows="10"
        placeholder="粘贴楼层原文...&#10;&#10;格式：说话人：内容&#10;说话人：内容" />
      <template #footer>
        <div style="display:flex;gap:8px;justify-content:flex-end">
          <template v-if="scoringMode === 'api'">
            <el-button @click="showInputDialog = false">取消</el-button>
            <el-button type="primary" @click="processWithAPI" :loading="processing">🤖 API处理</el-button>
          </template>
          <template v-else>
            <el-button @click="showInputDialog = false">取消</el-button>
            <el-button type="warning" @click="copyPromptForWindow">📋 复制提示词+原文</el-button>
            <el-button type="success" @click="showPasteDialog = true" :disabled="!windowAIResult">📥 粘贴AI结果</el-button>
          </template>
        </div>
      </template>
    </el-dialog>

    <!-- 粘贴窗口AI结果 -->
    <el-dialog v-model="showPasteDialog" title="粘贴窗口AI返回的JSON" width="600px" top="5vh">
      <el-input v-model="windowAIInput" type="textarea" :rows="12"
        placeholder='粘贴AI返回的JSON...' />
      <template #footer>
        <el-button @click="showPasteDialog = false">取消</el-button>
        <el-button type="success" @click="parseWindowAIResult">解析并入库</el-button>
      </template>
    </el-dialog>

    <!-- 提示词配置弹窗 -->
    <el-dialog v-model="showPromptDialog" title="提示词配置" width="800px" top="3vh">
      <el-tabs v-model="promptTab">
        <el-tab-pane label="提取提示词" name="extract">
          <el-input v-model="extractPrompt" type="textarea" :rows="20" />
        </el-tab-pane>
        <el-tab-pane label="统计提示词" name="stats">
          <el-input v-model="statsPrompt" type="textarea" :rows="20" />
        </el-tab-pane>
      </el-tabs>
      <template #footer>
        <el-button @click="loadPromptsFromFile">🔄 重载默认</el-button>
        <el-button type="primary" @click="savePrompts">💾 保存提示词</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'

// ---- 状态 ----
const apiKey = ref(localStorage.getItem('ckb_apikey') || '')
const scoringMode = ref('api')
const searchQuery = ref('')
const activeTopic = ref(null)
const activeTag = ref(null)
const minInfoValue = ref(0)
const activeViewpoint = ref(null)
const processing = ref(false)

// 输入弹窗
const showInputDialog = ref(false)
const newThreadText = ref('')
const newThreadSource = ref({ videoTitle: '', UP: '', platform: 'B站' })

// 窗口AI模式
const showPasteDialog = ref(false)
const windowAIInput = ref('')
const windowAIResult = ref(null)

// 提示词
const showPromptDialog = ref(false)
const promptTab = ref('extract')
const extractPrompt = ref('')
const statsPrompt = ref('')

// 默认提示词
const defaultExtractPrompt = `你是一个评论区知识提取助手。你的任务是对给定的评论楼层做两件事：

## 任务A：输出人类阅读版（带标签分段）

规则：
1. **不修改原文任何字词**，只做分段和加标签。表情符号也必须保留
2. **全部保留，不丢弃任何内容**
3. 将大段文字按观点/话题切分成小段，每段前加 **[简短总结]**（方括号包裹，5-10字以内）
4. 低信息量内容用标签如 [感谢] [表情回应] [附和] 标记，仍保留原文
5. 保留说话人身份标记（UP主/评论者）

## 任务B：输出JSON

在末尾输出一个JSON代码块：
{
  "threadId": "第一个评论者-日期",
  "completeness": "完整或 不完整",
  "topics": ["话题1", "话题2"],
  "viewpoints": [
    {
      "speaker": "说话人",
      "speakerRole": "UP主|评论者|提问者",
      "tag": "观点简短标签",
      "original": "原文不修改",
      "stance": "支持|反对|中立|提问|补充|感谢",
      "infoType": "个人经验|事实陈述|推测|建议|辟谣|提问|社交互动",
      "infoValue": 1-5
    }
  ],
  "summary": ["[标签] 一句话汇总"]
}`

const defaultStatsPrompt = `你是一个评论区统计分析助手。给定一组已提取的评论观点（JSON数组），请完成以下统计：

## 统计维度
1. 阵营分布：按观点倾向聚类
2. 高频话题：Top-N话题及出现次数
3. 共识区：大多数人一致同意的观点
4. 争议区：存在明显分歧的观点
5. 信息价值评分：对每个观点给出1-5分

输出格式：Markdown统计报告 + JSON数据块`

// ---- 样本数据（从考研评论提取的观点）----
const sampleViewpoints = [
  { id:'vp-01', speaker:'嘿-U喂', speakerRole:'提问者', tag:'暴涨后是否会回落', original:'26某211的其中某个专业非常炸（暴涨54分那种），但是其他专业一般，这种情况这个专业27会不会冷啊或者热度回归[大哭]', stance:'提问', infoType:'提问', infoValue:3, topics:['考研择校','热度预测'], source:{threadId:'hey-u-wei-20260423',platform:'B站',videoTitle:'26考研择校讨论',up主:'Yoken怀古',date:'2026-04-23'} },
  { id:'vp-02', speaker:'Yoken怀古', speakerRole:'UP主', tag:'大概率下降，幅度看秋招热度', original:'一定是下降的趋势，但是下降多少具体要看八九十月份的热度', stance:'中立', infoType:'个人经验', infoValue:4, topics:['考研择校','热度预测'], source:{threadId:'hey-u-wei-20260423',platform:'B站',videoTitle:'26考研择校讨论',up主:'Yoken怀古',date:'2026-04-23'} },
  { id:'vp-03', speaker:'bili_46429895043', speakerRole:'提问者', tag:'热度参考来源', original:'到时候怎么看院校的热度呀[doge]', stance:'提问', infoType:'提问', infoValue:2, topics:['考研择校','热度预测'], source:{threadId:'hey-u-wei-20260423',platform:'B站',videoTitle:'26考研择校讨论',up主:'Yoken怀古',date:'2026-04-29'} },
  { id:'vp-04', speaker:'Yoken怀古', speakerRole:'UP主', tag:'多渠道综合判断热度', original:'小红书帖子数量、🐧裙讨论热度，还有一些官方文件的下载量、博主引流、公众号的浏览量等等，综合考虑吧', stance:'中立', infoType:'个人经验', infoValue:5, topics:['考研择校','热度预测','方法论'], source:{threadId:'hey-u-wei-20260423',platform:'B站',videoTitle:'26考研择校讨论',up主:'Yoken怀古',date:'2026-04-29'} },
  { id:'vp-05', speaker:'比安卡我老婆', speakerRole:'评论者', tag:'点名海南大学085404', original:'点名海南大学085404[doge]', stance:'补充', infoType:'事实陈述', infoValue:2, topics:['考研择校','院校案例'], source:{threadId:'hey-u-wei-20260423',platform:'B站',videoTitle:'26考研择校讨论',up主:'Yoken怀古',date:'2026-04-23'} },
  { id:'vp-06', speaker:'豪桑好快的刀', speakerRole:'评论者', tag:'福州大学计专370复试线', original:'福州大学更是逆天，计专三百七复试线', stance:'补充', infoType:'事实陈述', infoValue:3, topics:['考研择校','院校案例'], source:{threadId:'hey-u-wei-20260423',platform:'B站',videoTitle:'26考研择校讨论',up主:'Yoken怀古',date:'2026-04-29'} },
  { id:'vp-07', speaker:'比安卡我老婆', speakerRole:'评论者', tag:'A区211 vs 末流211对比', original:'但是福州大学是A区211啊，不像海南大学末流211计专复试线360+', stance:'中立', infoType:'事实陈述', infoValue:4, topics:['考研择校','院校案例'], source:{threadId:'hey-u-wei-20260423',platform:'B站',videoTitle:'26考研择校讨论',up主:'Yoken怀古',date:'2026-04-29'} },
  { id:'vp-08', speaker:'带角度刮刀', speakerRole:'提问者', tag:'为什么网安分数低', original:'为什么网安分数低这么多啊？进去也不一定研究网络工程吧？', stance:'提问', infoType:'提问', infoValue:2, topics:['网安考研','就业'], source:{threadId:'daijiaodu-guadao-20260423',platform:'B站',videoTitle:'26考研择校讨论',up主:'Yoken怀古',date:'2026-04-23'} },
  { id:'vp-09', speaker:'Yoken怀古', speakerRole:'UP主', tag:'网安读研性价比不高', original:'因为网安这个东西本身本科就可以就业，不需要读个研究生，你还要去被迫老师的研究方向去研究，跟网络相关的研究生出去就业率也跟本科几乎差不多，可能多不了很多的钱，所以性价比不是很高，但是如果你能就是偷跑出去实习的话，你的相当于你不是网安就业的，是以别的方向去转到大模型的，工资还是挺高的。', stance:'中立', infoType:'个人经验', infoValue:5, topics:['网安考研','就业','性价比'], source:{threadId:'daijiaodu-guadao-20260423',platform:'B站',videoTitle:'26考研择校讨论',up主:'Yoken怀古',date:'2026-04-23'} },
  { id:'vp-10', speaker:'带角度刮刀', speakerRole:'提问者', tag:'专升本+网安=性价比之选', original:'大佬请问，我是专升本的想考研去好的学校提高，那还是报网安性价比高是吗？最好是在网安专业找放养的老师', stance:'提问', infoType:'提问', infoValue:3, topics:['网安考研','专升本'], source:{threadId:'daijiaodu-guadao-20260423',platform:'B站',videoTitle:'26考研择校讨论',up主:'Yoken怀古',date:'2026-04-23'} },
  { id:'vp-11', speaker:'Yoken怀古', speakerRole:'UP主', tag:'确认策略，强调偷跑实习', original:'是的，你理解的没问题，完全正确，尽量偷跑出去实习。获得了实习经历+高学历。点个关注吧~', stance:'支持', infoType:'建议', infoValue:4, topics:['网安考研','专升本','实习'], source:{threadId:'daijiaodu-guadao-20260423',platform:'B站',videoTitle:'26考研择校讨论',up主:'Yoken怀古',date:'2026-04-23'} },
  { id:'vp-12', speaker:'高二文叙仔', speakerRole:'评论者', tag:'网安分低有原因', original:'网安肯定就业没那么好呗，大家都不是傻子，分低有分低点道理', stance:'支持', infoType:'个人经验', infoValue:2, topics:['网安考研','就业'], source:{threadId:'daijiaodu-guadao-20260423',platform:'B站',videoTitle:'26考研择校讨论',up主:'Yoken怀古',date:'2026-04-23'} },
  { id:'vp-13', speaker:'Yoken怀古', speakerRole:'UP主', tag:'实习不重要，学校层次更关键', original:'实习不重要，考一个更高层次的学校更重要', stance:'中立', infoType:'建议', infoValue:4, topics:['央国企','择校'], source:{threadId:'tangsong111-20260521',platform:'B站',videoTitle:'26考研择校讨论',up主:'Yoken怀古',date:'2026-05-21'} },
  { id:'vp-14', speaker:'Yoken怀古', speakerRole:'UP主', tag:'当地92进当地央国企有优势', original:'是的，相对来说肯定是当地的92更好', stance:'支持', infoType:'个人经验', infoValue:3, topics:['央国企','92院校'], source:{threadId:'chunyunqi-20260425',platform:'B站',videoTitle:'26考研择校讨论',up主:'Yoken怀古',date:'2026-04-25'} },
  { id:'vp-15', speaker:'纯运气选手', speakerRole:'提问者', tag:'烟草是否最难进', original:'这些央国企里面是不是烟草是最难进的？', stance:'提问', infoType:'提问', infoValue:2, topics:['央国企','烟草'], source:{threadId:'chunyunqi-20260425',platform:'B站',videoTitle:'26考研择校讨论',up主:'Yoken怀古',date:'2026-04-25'} },
  { id:'vp-16', speaker:'Yoken怀古', speakerRole:'UP主', tag:'选调资格比学校名气重要', original:'走选调生，只要这学校有该省的选调生资格，其余的跟学校没关系', stance:'中立', infoType:'个人经验', infoValue:4, topics:['选调生','择校'], source:{threadId:'xuejisuanji-de-xiaowang-20260424',platform:'B站',videoTitle:'26考研择校讨论',up主:'Yoken怀古',date:'2026-04-24'} },
  { id:'vp-17', speaker:'SiLy佟暖年', speakerRole:'评论者', tag:'面试可能能看到学历', original:'好像选调面试是能看到你学历的[吃瓜]', stance:'补充', infoType:'推测', infoValue:2, topics:['选调生','学历'], source:{threadId:'xuejisuanji-de-xiaowang-20260424',platform:'B站',videoTitle:'26考研择校讨论',up主:'Yoken怀古',date:'2026-05-02'} },
  { id:'vp-18', speaker:'带角度刮刀', speakerRole:'提问者', tag:'弱985 vs 强211择校难题', original:'我想问一下，如果是中央民族大学这种比较菜的985也行吗？中央民族大学和北京邮电大学相比，去考那个央企，国企这个方面哪个更有优势呢？一个是强的211，一个是弱的985？', stance:'提问', infoType:'提问', infoValue:3, topics:['央国企','985vs211'], source:{threadId:'daijiaodu-guadao-20260425',platform:'B站',videoTitle:'26考研择校讨论',up主:'Yoken怀古',date:'2026-04-25',completeness:'不完整'} },
  { id:'vp-19', speaker:'Spr_Aachen', speakerRole:'评论者', tag:'0854曾是死亡代码', original:'085400以前被称为死亡代码来着，说是考不了公也去不了事业编。看来现在是好起来了（当然竞争更激烈了）', stance:'中立', infoType:'事实陈述', infoValue:3, topics:['0854代码','考公'], source:{threadId:'spr-aachen-20260501',platform:'B站',videoTitle:'26考研择校讨论',up主:'Yoken怀古',date:'2026-05-01'} },
  { id:'vp-20', speaker:'Yoken怀古', speakerRole:'UP主', tag:'0854考公逐渐放开', original:'现在是考公岗位逐渐给0854放开了，当然竞争还是很激烈', stance:'支持', infoType:'事实陈述', infoValue:4, topics:['0854代码','考公'], source:{threadId:'spr-aachen-20260501',platform:'B站',videoTitle:'26考研择校讨论',up主:'Yoken怀古',date:'2026-05-01'} }
]

const allViewpoints = ref([...sampleViewpoints])

// ---- 计算属性 ----
const topicTree = computed(() => {
  const map = {}
  allViewpoints.value.forEach(vp => {
    (vp.topics || []).forEach(t => {
      map[t] = (map[t] || 0) + 1
    })
  })
  return Object.entries(map).map(([name, count]) => ({name, count})).sort((a,b) => b.count - a.count)
})

const allTags = computed(() => {
  const map = {}
  allViewpoints.value.forEach(vp => {
    const t = vp.tag
    map[t] = (map[t] || 0) + 1
  })
  return Object.entries(map).map(([name, count]) => ({name, count})).sort((a,b) => b.count - a.count)
})

const highValueCount = computed(() => allViewpoints.value.filter(v => v.infoValue >= 4).length)

const filteredViewpoints = computed(() => {
  let list = allViewpoints.value
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(v =>
      v.tag.includes(q) || v.original.includes(q) || v.speaker.includes(q) ||
      (v.topics || []).some(t => t.includes(q))
    )
  }
  if (activeTopic.value) {
    list = list.filter(v => (v.topics || []).includes(activeTopic.value))
  }
  if (activeTag.value) {
    list = list.filter(v => v.tag === activeTag.value)
  }
  if (minInfoValue.value > 0) {
    list = list.filter(v => v.infoValue >= minInfoValue.value)
  }
  return list
})

const siblingViewpoints = computed(() => {
  if (!activeViewpoint.value) return []
  const tid = activeViewpoint.value.source?.threadId
  return allViewpoints.value.filter(v => v.source?.threadId === tid)
})

// ---- 方法 ----
function processWithAPI() {
  // TODO: 对接DeepSeek API
  ElMessage.info('API模式待实现 — 目前使用窗口AI模式')
}

function copyPromptForWindow() {
  const promptText = extractPrompt.value || defaultExtractPrompt
  const fullText = `${promptText}\n\n---\n\n以下是要处理的评论楼层：\n\n${newThreadText.value}`
  navigator.clipboard.writeText(fullText).then(() => {
    windowAIResult.value = fullText
    ElMessage.success('提示词+原文已复制到剪贴板，粘贴到AI窗口')
  })
}

function parseWindowAIResult() {
  try {
    const text = windowAIInput.value.trim()
    // 尝试提取JSON块
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/(\{[\s\S]*\})/)
    const jsonStr = jsonMatch ? jsonMatch[1] : text
    const data = JSON.parse(jsonStr)

    if (!data.viewpoints || !Array.isArray(data.viewpoints)) {
      throw new Error('JSON格式不正确：缺少viewpoints数组')
    }

    // 给每个观点加ID和来源信息
    const newVps = data.viewpoints.map((vp, i) => ({
      id: `vp-${Date.now()}-${i}`,
      ...vp,
      topics: vp.topics || data.topics || [],
      source: {
        threadId: data.threadId || `manual-${Date.now()}`,
        platform: newThreadSource.value.platform || '手动录入',
        videoTitle: newThreadSource.value.videoTitle || '未命名',
        up主: newThreadSource.value.UP || '',
        date: new Date().toISOString().slice(0,10),
        completeness: data.completeness || '完整'
      }
    }))

    allViewpoints.value.push(...newVps)
    windowAIInput.value = ''
    windowAIResult.value = null
    showPasteDialog.value = false
    showInputDialog.value = false
    newThreadText.value = ''
    ElMessage.success(`成功入库 ${newVps.length} 个观点`)

    // 自动选中第一个
    if (newVps.length > 0) activeViewpoint.value = newVps[0]
  } catch (e) {
    ElMessage.error(`解析失败: ${e.message}`)
  }
}

function copyJson() {
  if (!activeViewpoint.value) return
  navigator.clipboard.writeText(JSON.stringify(activeViewpoint.value, null, 2))
  ElMessage.success('JSON已复制')
}

async function loadPromptsFromFile() {
  try {
    const resp = await fetch('/comment-kb-prompts.json')
    if (resp.ok) {
      const data = await resp.json()
      extractPrompt.value = data.extractPrompt || defaultExtractPrompt
      statsPrompt.value = data.statsPrompt || defaultStatsPrompt
      ElMessage.success('提示词已从文件加载')
    }
  } catch {
    extractPrompt.value = defaultExtractPrompt
    statsPrompt.value = defaultStatsPrompt
  }
}

async function savePrompts() {
  try {
    await fetch('/api/comment-kb-prompts', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        extractPrompt: extractPrompt.value,
        statsPrompt: statsPrompt.value
      })
    })
    ElMessage.success('提示词已保存')
  } catch {
    ElMessage.warning('API未配置，提示词仅保存在当前会话')
  }
}

// 监听API Key
watch(apiKey, (v) => localStorage.setItem('ckb_apikey', v))

onMounted(() => {
  loadPromptsFromFile()
  // 默认选中第一个高价值观点
  activeViewpoint.value = allViewpoints.value.find(v => v.infoValue >= 4) || allViewpoints.value[0]
})
</script>

<style scoped>
.ckb-container {
  height: 100vh; display: flex; flex-direction: column;
  background: #f0f2f5; font-family: system-ui, -apple-system, 'Microsoft YaHei', sans-serif;
}

/* 顶栏 */
.ckb-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 16px; background: #fff; border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
}
.ckb-title { font-size: 18px; font-weight: 700; margin: 0; color: #1e1e1e; }
.ckb-header-actions { display: flex; gap: 8px; align-items: center; }

/* 三栏主体 */
.ckb-body {
  display: flex; flex: 1; overflow: hidden;
}

/* 左栏 */
.ckb-left {
  width: 280px; min-width: 240px; flex-shrink: 0;
  background: #fff; border-right: 1px solid #e4e7ed;
  display: flex; flex-direction: column; overflow: hidden;
}
.left-search { padding: 8px; }
.left-section { padding: 0 8px 8px; }
.left-section-title {
  font-size: 11px; font-weight: 700; color: #888;
  text-transform: uppercase; margin-bottom: 6px;
}

.topic-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 5px 8px; border-radius: 6px; cursor: pointer;
  font-size: 12px; color: #333;
}
.topic-item:hover { background: #f0f2f5; }
.topic-item.active { background: #e6f4ff; color: #1677ff; font-weight: 600; }
.topic-count { font-size: 10px; color: #999; background: #f0f0f0; padding: 1px 6px; border-radius: 8px; }

.tag-cloud { display: flex; flex-wrap: wrap; gap: 4px; }
.tag-chip {
  font-size: 10px; padding: 2px 7px; border-radius: 10px;
  background: #f0f2f5; color: #666; cursor: pointer;
}
.tag-chip:hover { background: #e6f4ff; }
.tag-chip.active { background: #1677ff; color: #fff; }
.tag-n { font-size: 8px; margin-left: 2px; opacity: 0.7; }

.value-filters { display: flex; gap: 4px; }
.value-chip {
  font-size: 11px; padding: 2px 6px; border-radius: 8px;
  background: #f0f2f5; cursor: pointer;
}
.value-chip:hover { background: #fff7e6; }
.value-chip.active { background: #faad14; color: #fff; }
.value-chip.dim { opacity: 0.3; }

/* 观点列表项 */
.vp-item {
  padding: 6px 8px; border-radius: 6px; margin-bottom: 4px;
  cursor: pointer; border: 1px solid transparent;
}
.vp-item:hover { background: #f5f5f5; }
.vp-item.active { background: #e6f4ff; border-color: #91caff; }
.vp-item-tag { font-size: 11px; font-weight: 600; color: #333; }
.vp-item-speaker { font-size: 10px; color: #888; }
.up-badge {
  font-size: 8px; background: #ff4d4f; color: #fff;
  padding: 0 3px; border-radius: 3px; margin-left: 3px;
}
.vp-item-preview { font-size: 10px; color: #999; margin-top: 2px; }
.vp-item-meta { display: flex; gap: 6px; align-items: center; margin-top: 3px; }
.vp-value { font-size: 9px; }
.vp-topics { font-size: 9px; color: #1677ff; background: #e6f4ff; padding: 0 4px; border-radius: 3px; }

/* 中栏 */
.ckb-center {
  flex: 1; overflow-y: auto; padding: 12px;
}
.center-section {
  background: #fff; border-radius: 10px; padding: 12px; margin-bottom: 10px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.center-section-hdr {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid #f0f0f0;
}
.section-label { font-size: 13px; font-weight: 700; color: #333; }
.vp-value-badge {
  font-size: 11px; padding: 2px 10px; border-radius: 10px;
}
.vp-value-badge.val-5 { background: #f6ffed; color: #52c41a; }
.vp-value-badge.val-4 { background: #e6f4ff; color: #1677ff; }
.vp-value-badge.val-3 { background: #fff7e6; color: #faad14; }
.vp-value-badge.val-2 { background: #fff2e8; color: #fa8c16; }
.vp-value-badge.val-1 { background: #fff1f0; color: #ff4d4f; }

.vp-detail-header { margin-bottom: 8px; }
.vp-detail-tag {
  font-size: 14px; font-weight: 700; color: #faad14; margin-right: 10px;
}
.vp-detail-speaker { font-size: 13px; color: #333; }
.role-badge {
  font-size: 9px; padding: 1px 5px; border-radius: 3px; margin-left: 4px;
}
.role-badge.up { background: #ff4d4f; color: #fff; }
.role-badge.ask { background: #1677ff; color: #fff; }
.role-badge.comment { background: #f0f0f0; color: #666; }

.vp-detail-original {
  font-size: 13px; color: #333; line-height: 1.8;
  background: #fafafa; padding: 10px 12px; border-radius: 8px;
  border-left: 3px solid #faad14;
}
.vp-detail-attrs { display: flex; gap: 10px; margin-top: 8px; }
.attr-item { font-size: 10px; color: #888; }

/* 来源上下文 */
.source-thread {
  background: #fafafa; border-radius: 8px; padding: 10px;
}
.source-thread-title { font-size: 12px; font-weight: 600; color: #333; }
.source-thread-meta { font-size: 10px; color: #999; margin-top: 2px; }
.sibling-vps { margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee; }
.sibling-label { font-size: 10px; color: #888; margin-bottom: 4px; }
.sibling-vp {
  display: flex; gap: 6px; padding: 3px 6px; border-radius: 4px;
  cursor: pointer; font-size: 11px;
}
.sibling-vp:hover { background: #e6f4ff; }
.sibling-tag { color: #faad14; font-weight: 600; }
.sibling-speaker { color: #888; }

/* 空状态 */
.center-empty {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  height: 100%; color: #ccc;
}
.empty-icon { font-size: 64px; margin-bottom: 16px; }
.empty-text { font-size: 16px; color: #999; }
.empty-sub { font-size: 12px; color: #ccc; margin-top: 8px; }

/* 右栏 */
.ckb-right {
  width: 320px; min-width: 260px; flex-shrink: 0;
  background: #fff; border-left: 1px solid #e4e7ed;
  display: flex; flex-direction: column; overflow-y: auto;
}
.right-section {
  padding: 10px; border-bottom: 1px solid #f0f0f0;
}
.right-section-hdr {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 6px;
}
.json-view {
  font-size: 9px; font-family: 'SF Mono','Cascadia Code',monospace;
  color: #333; background: #fafafa; padding: 8px; border-radius: 6px;
  max-height: 400px; overflow: auto; margin: 0;
  white-space: pre-wrap; word-break: break-all;
}
.right-empty {
  display: flex; align-items: center; justify-content: center;
  height: 200px;
}

.stat-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
}
.stat-item {
  text-align: center; padding: 8px; background: #fafafa; border-radius: 8px;
}
.stat-val { font-size: 22px; font-weight: 700; color: #1677ff; }
.stat-lbl { font-size: 10px; color: #888; margin-top: 2px; }
</style>
