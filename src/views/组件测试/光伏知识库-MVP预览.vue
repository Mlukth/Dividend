<template>
  <div class="pv-kb-preview">
    <!-- 头部 -->
    <div class="header">
      <h1>{{ article.title }}</h1>
      <div class="meta">
        <span>作者: {{ article.author }}</span>
        <span>日期: {{ article.date }}</span>
        <span>来源: {{ article.account }}</span>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats">
      <div class="stat">
        <div class="num">{{ chunks.length }}</div>
        <div class="label">知识片段</div>
      </div>
      <div class="stat">
        <div class="num">{{ categoryCount }}</div>
        <div class="label">分类覆盖</div>
      </div>
      <div class="stat">
        <div class="num">{{ tagCount }}</div>
        <div class="label">标签总数</div>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="filters">
      <span
        v-for="cat in categories"
        :key="cat"
        :class="['filter-tag', { active: activeCat === cat }]"
        @click="activeCat = activeCat === cat ? '' : cat"
      >{{ cat }}</span>
    </div>

    <!-- 知识卡片列表 -->
    <div class="chunk-list">
      <div
        v-for="(chunk, i) in filteredChunks"
        :key="i"
        class="chunk-card"
      >
        <div class="chunk-header">
          <span class="chunk-id">#{{ chunk.index }}</span>
          <span
            class="category"
            :style="{ background: catColor(chunk.primary) + '20', color: catColor(chunk.primary), borderColor: catColor(chunk.primary) + '40' }"
          >
            {{ chunk.primary }} &raquo; {{ chunk.secondary }}
          </span>
        </div>

        <!-- 原文中的小标题 -->
        <div v-if="chunk.heading" class="heading-nav">
          📂 {{ chunk.heading }}
        </div>

        <!-- AI概括（核心产出） -->
        <div class="summary">
          {{ chunk.summary }}
        </div>

        <!-- 标签 -->
        <div class="tags">
          <span v-for="t in chunk.tags" :key="t" class="tag">{{ t }}</span>
        </div>

        <!-- 原文（折叠，点开查看） -->
        <details>
          <summary class="original-toggle">📋 查看原文</summary>
          <div class="original-text">{{ chunk.text }}</div>
        </details>
      </div>
    </div>

    <div class="footer">
      光伏知识库 MVP演示 | 原文完整保留（折叠区内） | 分类 + 标签 + 概括 = AI标注 | 原文 = 不变
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// ===== 数据：1篇文章的标注结果 =====
// 原文：光伏运维员小李 公众号 2025-04-14
// 《光伏逆变器那些事（二）小风扇大账单——散热的经济学》

const article = {
  title: '光伏逆变器那些事（二）| 小风扇大账单——散热的经济学',
  author: '小李',
  date: '2025-04-14',
  account: '光伏运维员小李',
  url: 'https://mp.weixin.qq.com/s/-ZUmqX-wUU_lTPqAGkxVWg'
}

const chunks = ref([
  {
    index: 1,
    primary: '3.故障与处理', secondary: '3.1 逆变器故障',
    heading: '逆变器为啥会发热？先搞懂它的脾气',
    summary: '逆变器IGBT模块每秒开关2万次，97%效率意味着3%能量变热量，100kW逆变器每小时产热3kW。温度每升10度元件寿命减半，散热不良是逆变器故障的首要原因。',
    tags: ['逆变器', '发热原理', 'IGBT', '效率', '温度'],
    text: '在逆变器内部的一块巴掌大的IGBT模块，每秒开关动作就高达2万次！在光伏逆变器中，电子元件在工作时会经历复杂的电流传导与电压转换过程，必然会产生一定热量。一般来说，逆变器的效率在97%左右，也就是说，有3%的能量变成了热量。别小看这3%，一个100kW的逆变器，每小时就能产生3kW的热量。这些热量要是不及时散出去，当温度超过额定工作温度时，逆变器的效率会下降，寿命也会跟着缩短。温度每升高10℃，电子元件的寿命就会缩短一半。'
  },
  {
    index: 2,
    primary: '1.设备与组件', secondary: '1.1 逆变器',
    heading: '散热系统：逆变器的降温神器',
    summary: '逆变器散热系统分主动散热和自然冷却两种。主动散热最常见的是风扇，大型逆变器也有液冷方案——冷却液像搬运工把热量运到外部散热器再通过空气冷却。',
    tags: ['逆变器', '散热系统', '主动散热', '自然冷却', '风扇', '液冷'],
    text: '为了让逆变器能在合适的温度下工作，我们给它配备了一套散热系统。这套系统就像人体的散热机制一样，有主动散热和自然冷却两种方式。主动散热最常见的就是风扇散热，在逆变器内部或外部安装风扇把热量赶出去。不过风扇也有累的时候，长时间工作后轴承会磨损、叶片上会积灰，导致风量减小散热效果下降。除了风扇，还有一种主动散热方式是液体冷却，在大型逆变器中比较常见。液冷一般通过在逆变器内部设置冷却管道的方式，让冷却液在管道中循环带走热量。液体冷却的散热效果确实更好，但结构复杂维护成本也高。'
  },
  {
    index: 3,
    primary: '1.设备与组件', secondary: '1.1 逆变器',
    heading: '自然冷却 vs 强制风冷',
    summary: '自然冷却靠机壳散热无噪音免维护但功率密度低，强制风冷成本低安装简单但需定期清灰换风扇。两种方案各有适用场景。',
    tags: ['逆变器', '散热', '自然冷却', '强制风冷', '成本对比'],
    text: '自然冷却就像是逆变器自身的被动技能——不需要额外动力，单纯靠机壳散热片和空气对流来降温。优点很明显：零噪音、零维护、永远不会出现风扇故障。但缺点也很致命——散热能力有限，功率密度上不去。强制风冷就是用风扇强制吹风，散热效果比自然冷却好得多，成本也比较低，是目前中小型逆变器的主流散热方案。但风扇是易损件，隔段时间就得清灰、检查、更换。'
  },
  {
    index: 4,
    primary: '1.设备与组件', secondary: '1.1 逆变器',
    heading: '液冷方案：效果好但门槛高',
    summary: '液冷散热效率最高噪音最低，适合大型集中式逆变器，但系统复杂维护成本高，冷却液需定期检测更换，一旦泄漏风险极高。',
    tags: ['逆变器', '液冷散热', '大型逆变器', '维护成本', '冷却液'],
    text: '液冷散热是目前大型集中式逆变器的标配方案。散热效率确实没得说——同等体积下液冷散热能力是风冷的几十倍。而且没有风扇噪音，适合对噪声有要求的场景。但液冷系统结构复杂，管道、泵、散热器、冷却液，哪一个环节出问题都不行。维护成本更是居高不下：冷却液需要定期检测电导率和PH值，一旦变质就得换；管道接头处有泄漏风险，冷却液一旦漏到电路板上就是灾难性后果。所以液冷虽好，不是所有电站都养得起。'
  },
  {
    index: 5,
    primary: '3.故障与处理', secondary: '3.1 逆变器故障',
    heading: '风扇故障——逆变器的头号杀手',
    summary: '风扇故障是逆变器散热问题的最常见原因。轴承磨损、叶片积灰、电源线松动都会导致风扇停转或风量不足，进而引发逆变器过温保护停机。',
    tags: ['逆变器', '风扇故障', '散热失效', '轴承磨损', '积灰', '过温保护'],
    text: '在运维现场，风扇故障可以说是逆变器散热问题的第一大元凶。最常见的情况有三种：一是轴承磨损，风扇转起来咔咔响甚至直接卡死；二是叶片积灰严重，风量大幅下降根本带不走热量；三是风扇电源线松动或接头氧化，供电不稳导致风扇时转时停。任何一个情况都可能导致逆变器内部温度飙升，触发过温保护直接停机。关键是风扇故障往往是渐进式的，今天还能转明天就不行了，等发现的时候逆变器已经跳了。'
  },
  {
    index: 6,
    primary: '2.运维操作', secondary: '2.1 日常巡检',
    heading: '日常巡检：耳朵比仪器好用',
    summary: '逆变器散热系统日常巡检三招：听风扇声音判断轴承状态、摸外壳温度找异常热点、看通风口是否堵塞。定检不能偷懒，等故障发生就晚了。',
    tags: ['逆变器', '散热巡检', '风扇检查', '温度监测', '日常运维'],
    text: '老运维都有一套自己的巡检经验，散热系统这块尤其如此。第一，走到逆变器跟前先听声音——正常的散热风扇是均匀的嗡嗡声，如果听到咔咔、吱吱的异响，轴承八成已经磨损了。第二，用手背快速触碰逆变器外壳不同位置——如果某个区域明显比别处烫，说明那个位置散热出了问题。第三，看通风口和滤网——被杨絮、灰尘、杂物堵住是最容易被忽略的问题。这些事情花不了几分钟，但就是这几分钟的巡检，能避免几个小时的停机损失。'
  },
  {
    index: 7,
    primary: '3.故障与处理', secondary: '3.1 逆变器故障',
    heading: '散热不良的连锁反应',
    summary: '散热不良会导致逆变器效率下降→发热加剧→元件加速老化→故障率上升的恶性循环。良好的散热管理是延长逆变器寿命最经济有效的手段。',
    tags: ['逆变器', '散热', '寿命', '温度管理', '连锁故障'],
    text: '散热问题最可怕的地方不在于它本身，而在于它会引发一连串的连锁反应。散热不良导致内部温度升高，高温下电子元件的电阻增加效率下降，效率下降又产生更多热量，形成恶性循环。在这种高温环境下长期运行，IGBT模块、电容器、电路板都在加速老化。等哪天真出故障了，往往不是换一个风扇能解决的——IGBT烧了、电容鼓包了、主板变形了，维修成本直接从几百块飙到几万块。所以运维圈有句话：管好散热，逆变器能多活好几年。'
  }
])

// 分类列表
const categories = computed(() => [...new Set(chunks.value.map(c => c.primary))])

// 分类颜色
const catColor = (cat) => {
  const map = {
    '1.设备与组件': '#3b82f6',
    '2.运维操作': '#10b981',
    '3.故障与处理': '#ef4444',
    '4.安全规范': '#f59e0b',
    '5.政策与标准': '#8b5cf6',
    '6.设计与工程': '#06b6d4'
  }
  return map[cat] || '#6b7280'
}

const categoryCount = computed(() => categories.value.length)
const tagCount = computed(() => chunks.value.reduce((s, c) => s + c.tags.length, 0))

// 筛选
const activeCat = ref('')
const filteredChunks = computed(() =>
  activeCat.value
    ? chunks.value.filter(c => c.primary === activeCat.value)
    : chunks.value
)
</script>

<style scoped>
.pv-kb-preview {
  max-width: 860px;
  margin: 0 auto;
  padding: 24px;
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
  color: #333;
  background: #f5f6f8;
  min-height: 100vh;
}

.header {
  background: linear-gradient(135deg, #1e3a5f, #2563eb);
  color: #fff;
  padding: 28px 32px;
  border-radius: 12px;
  margin-bottom: 20px;
}
.header h1 {
  font-size: 21px;
  font-weight: 600;
  margin-bottom: 10px;
  line-height: 1.4;
}
.header .meta {
  font-size: 13px;
  opacity: 0.85;
  display: flex;
  gap: 20px;
}

.stats {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}
.stat {
  background: #fff;
  padding: 16px 24px;
  border-radius: 10px;
  text-align: center;
  flex: 1;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.stat .num {
  font-size: 26px;
  font-weight: 700;
  color: #2563eb;
}
.stat .label {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
}

.filters {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.filter-tag {
  font-size: 12px;
  padding: 4px 14px;
  border-radius: 14px;
  background: #fff;
  color: #666;
  cursor: pointer;
  border: 1px solid #e0e0e0;
  transition: all 0.2s;
}
.filter-tag:hover { border-color: #2563eb; color: #2563eb; }
.filter-tag.active { background: #2563eb; color: #fff; border-color: #2563eb; }

.chunk-list { display: flex; flex-direction: column; gap: 14px; }

.chunk-card {
  background: #fff;
  border-radius: 10px;
  padding: 20px 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  transition: box-shadow 0.2s;
}
.chunk-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.1); }

.chunk-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}
.chunk-id {
  font-size: 12px;
  color: #bbb;
  font-weight: 600;
  min-width: 28px;
}
.category {
  font-size: 11px;
  padding: 3px 12px;
  border-radius: 12px;
  font-weight: 500;
  border: 1px solid;
}

.heading-nav {
  font-size: 13px;
  color: #666;
  margin: 10px 0;
  padding: 6px 12px;
  background: #f0f4ff;
  border-left: 3px solid #2563eb;
  border-radius: 0 4px 4px 0;
}

.summary {
  font-size: 14px;
  color: #1e3a5f;
  font-weight: 500;
  line-height: 1.7;
  margin: 12px 0;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 6px;
  border-left: 4px solid #2563eb;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 10px 0;
}
.tag {
  font-size: 11px;
  padding: 2px 10px;
  background: #eef2ff;
  color: #4f6ef7;
  border-radius: 12px;
}

.original-toggle {
  font-size: 13px;
  color: #2563eb;
  cursor: pointer;
  padding: 6px 0;
  user-select: none;
}
.original-toggle:hover { text-decoration: underline; }
.original-text {
  font-size: 13px;
  color: #666;
  white-space: pre-wrap;
  line-height: 1.8;
  padding: 14px;
  background: #fafafa;
  border-radius: 6px;
  margin-top: 6px;
  border: 1px solid #eee;
}

.footer {
  text-align: center;
  padding: 30px;
  color: #aaa;
  font-size: 12px;
  margin-top: 20px;
}
</style>
