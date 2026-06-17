<template>
  <div class="kb-preview">
    <div class="topbar">
      <h2>盲审实验 — 纯Prompt标注（无人介入）</h2>
      <div class="rules">Prompt: D:\scripts\pv-kb\annotation_prompt.md | 两篇新文章，标注过程用户未介入</div>
      <div class="article-tabs">
        <button v-for="(a,i) in articles" :key="i"
          :class="['tab', { active: i === active }]"
          @click="active = i"
        >{{ i+1 }}. {{ a.shortTitle }}</button>
      </div>
    </div>

    <div class="chunk-list">
      <div v-for="(c, j) in currentArticle.chunks" :key="j" class="chunk-card">
        <div class="chunk-header">
          <span class="chunk-num">[{{ j+1 }}/{{ currentArticle.chunks.length }}]</span>
          <span class="badge" :style="{background: catColor(c.cat)+'18', color: catColor(c.cat), borderColor: catColor(c.cat)+'40'}">{{ c.cat }}</span>
          <span class="heading-name" v-if="c.heading">{{ c.heading }}</span>
          <span class="conf" :class="confClass(c.confidence)" :title="'置信度: ' + Math.round(c.confidence*100) + '%'">
            {{ Math.round(c.confidence*100) }}%
          </span>
        </div>

        <div class="summary">{{ c.summary }}</div>

        <div v-if="c.highlight" class="highlight">
          <span class="hl-label">金句</span>{{ c.highlight }}
        </div>

        <div class="tags-row"><span v-for="t in c.tags" :key="t" class="tag">{{ t }}</span></div>

        <div v-if="c.warning" class="warning">⚠ {{ c.warning }}</div>

        <details><summary class="toggle">查看原文</summary><div class="original">{{ c.text }}</div></details>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const articles = [
  // ===== 文章1：光伏电站设备全知道 =====
  {
    shortTitle: '光伏电站设备全知道',
    chunks: [
      {
        cat:'1.设备与组件', heading:'光伏组件：光电转换的核心',
        confidence:0.95,
        summary:'光伏组件由大量晶硅或薄膜材质的太阳能电池片通过串并联构成，基于光生伏打效应将太阳能直接转换为直流电。大型电站中大面积有序排列的蓝色光伏板形成了独特的光伏景观。',
        highlight:'',
        tags:['光伏组件','电池片','晶硅','薄膜','光生伏打效应','直流电'],
        warning:'',
        text:'光伏组件在光伏电站中占据显著地位，尤其在大型光伏电站，从远处眺望，大面积有序排列的蓝色光伏板形成了独特的光伏景观。其内部由大量晶硅材质或薄膜材质的太阳能电池片，通过串联和并联的电气连接方式构成。在光照条件下，光伏组件基于光生伏打效应原理，将太阳能直接转换为直流电。'
      },
      {
        confidence:0.90, cat:'1.设备与组件', heading:'固定支架 vs 跟踪支架',
        summary:'光伏支架分固定支架和跟踪支架两类。固定支架角度依据当地纬度和太阳高度角设计，组件固定在特定倾角，全年大部分时间获得相对充足光照。跟踪支架能实时监测太阳位置变化，通过控制系统驱动支架转动使组件始终朝向太阳，极大地提高了太阳能捕获效率，在太阳高度角变化大的地区优势尤为明显。',
        highlight:'',
        tags:['光伏支架','固定支架','跟踪支架','太阳高度角','纬度','捕获效率'],
        warning:'跟踪支架虽然发电效率更高，但有机械运动部件——控制系统和驱动机构需要额外维护，不能当固定支架一样对待。',
        text:'为使光伏组件能以最优角度接收太阳能辐射，光伏支架发挥着重要的支撑和角度调节作用。光伏支架系统可分为固定支架和跟踪支架两类。固定支架的角度依据当地的地理纬度以及太阳高度角的长期统计数据进行设计，将光伏组件固定在特定的倾斜角度，确保组件在一年中的大部分时间里能获得相对充足的光照。跟踪支架则具备智能化的调节功能，它能够实时监测太阳的位置变化，并通过控制系统驱动支架转动，带动光伏组件始终朝向太阳方向。这种动态跟踪方式极大地提高了光伏组件对太阳能的捕获效率，尤其在太阳高度角变化较大的地区或季节，优势更为明显。'
      },
      {
        confidence:0.85, cat:'1.设备与组件', heading:'逆变器：直流→交流的核心',
        summary:'光伏组件输出的是直流电，必须通过逆变器转换为交流电。逆变器通过功率半导体器件和脉宽调制（PWM）技术实现直流到交流的逆变。常见三种类型：集中式（功率大适合大型电站但对组件一致性要求高，一串故障可能影响整体效率）、组串式（每串独立监控互不干扰，一串故障其他串正常运行，可靠性更高）、微型逆变器（直接装在每块组件旁，最大化每块组件发电潜力，适合复杂光照条件但成本较高限制大规模应用）。',
        highlight:'',
        tags:['逆变器','直流','交流','PWM','集中式','组串式','微型逆变器'],
        warning:'集中式逆变器一串组件故障可能拖累整个逆变器输出。组串式虽然贵一些但故障隔离能力好得多——选型时不能只看逆变器本身价格。',
        text:'光伏组件输出的直流电无法直接满足日常用电需求，需通过逆变器将其转换为交流电。逆变器在光伏电站系统中扮演着电能形态转换的核心角色，通过内部的功率半导体器件组成的电路拓扑结构，利用脉宽调制（PWM）等控制技术，将直流电逆变为符合电网或用电设备标准的交流电。逆变器的类型丰富多样，常见的有集中式逆变器、组串式逆变器和微型逆变器。集中式逆变器一般适用于大型光伏电站，它将多个光伏组件并联后的直流电集中进行逆变处理。这种逆变器功率较大，适用于大规模集中发电场景，但对光伏组件的一致性要求较高，一旦某一串组件出现故障，可能影响整个逆变器的输出效率。组串式逆变器更契合分布式光伏电站的需求，它能够对每一串光伏组件进行独立的监控和逆变处理，每一串的工作状态互不干扰，当某一串组件出现故障时，其他串仍可正常工作，提高了系统的可靠性和发电效率。微型逆变器是一种直接安装在每一块光伏组件旁，实现对每一块组件的单独逆变的逆变器，这种方式能最大程度发挥每块组件的发电潜力，尤其适用于复杂光照条件下的分布式应用，但由于其成本相对较高，目前在大规模应用上受到一定限制。'
      },
      {
        confidence:0.75, cat:'1.设备与组件', heading:'汇流箱：电流汇集与保护',
        summary:'大型光伏电站中组件以多个串并联组串形式分布，每组串产生的直流电需先经汇流箱汇集再传输至逆变器。汇流箱不仅起汇集作用，还承担着对光伏阵列的电气保护功能。',
        highlight:'',
        tags:['汇流箱','电流汇集','直流','光伏阵列','电气保护'],
        warning:'汇流箱是逆变器前最后一道直流侧保护关口——熔断器老化、防反二极管失效容易被忽视，巡检时别只看逆变器不看汇流箱。',
        text:'在大型光伏电站中，光伏组件通常以多个串联和并联的组串形式分布，每组串产生的直流电需先进行汇集，再传输至逆变器。汇流箱正是承担着这一汇集与保护双重功能的关键设备，它通过直流熔断器、防反二极管和断路器等元器件，实现对各组串电流的安全汇集和故障隔离。'
      },
    ]
  },

  // ===== 文章2：高处作业新国标 =====
  {
    shortTitle: '高处作业新国标',
    chunks: [
      {
        confidence:0.95, cat:'4.安全规范', heading:'GB/T → GB：从推荐到强制',
        summary:'GB 3608-2025《高处作业分级》于2026年5月1日正式生效。最核心的变化：由过去的推荐性标准（GB/T 3608-2008）升级为强制性国家标准（GB）。GB代表必须执行，违反可能面临法律责任；GB/T是推荐性标准，企业可自愿选择是否遵循。光伏运维大半时间都在"登高"——厂房屋面巡检、山地支架检修、渔光互补排查——2米以上全是高处作业，也是行业事故最高发的场景。',
        highlight:'由过去的推荐性标准，一跃成为强制性国家标准。',
        tags:['高处作业','GB 3608-2025','强制性标准','GB/T','推荐性标准','2026年5月1日'],
        warning:'推荐变强制意味着不执行不再是"不规范"而是"违法"。企业不配防护、不做培训，出了事故责任直接压实。',
        text:'《高处作业分级》国标已强制生效。做光伏运维的老同行都清楚，我们的工作大半时间都在"登高"：厂房屋面巡检、山地光伏支架检修、渔光互补设备排查、高架汇流箱故障处理……2米以上的作业，全都是高处作业，也是咱们行业事故最高发的场景。这部新标准最核心的变化，在于它的身份——由过去的推荐性标准（GB/T 3608-2008），一跃成为强制性国家标准。GB代表强制性国家标准，必须执行，违反可能面临法律责任，保障人体健康和安全。GB/T代表推荐性国家标准，属于自愿采用的标准，企业可以选择是否遵循。老版本GB/T3608-2008已经用了十几年，一直是推荐性标准，没人强制要求执行。'
      },
      {
        confidence:0.90, cat:'4.安全规范', heading:'为什么升级为强制标准：原因一',
        summary:'光伏运维安全事故中八成以上是高处坠落。分布式光伏的彩钢瓦屋面薄脆滑、透光瓦踩上去随时可能碎裂；山地光伏支架檩条窄得离谱；渔光互补电站架在水面上坠落就是落水——双重危险。以前标准不强制，很多人抱着"干了好几年都没事"的侥幸心理，结果出了意外。国家用制度卡死侥幸作业，用规则守住一线人员的生命安全。',
        highlight:'光伏运维的安全事故里，八成以上都是高处坠落。',
        tags:['高处坠落','事故率','彩钢瓦','山地光伏','渔光互补','侥幸心理'],
        warning:'"干了好几年都没事"是最危险的想法——每次没事不等于下次没事，侥幸一次就可能是最后一次。',
        text:'高处坠落，是光伏运维的一大杀手。熟悉行业的都知道，光伏运维的安全事故里，八成以上都是高处坠落。和建筑施工、市政作业一样，咱们的作业场景天生高危：分布式光伏大多是彩钢瓦屋面，薄、脆、滑，透光瓦踩上去随时可能碎裂；山地光伏高低错落，立足的支架檩条窄得离谱；渔光互补电站架在水面上，坠落就是落水，双重危险。以前标准不强制，很多项目、很多师傅抱着"干了好几年都没事"的侥幸心理，很可能就出了意外。国家将标准升级为强制，核心目的就是用制度卡死侥幸作业，用规则守住一线人员的生命安全。'
      },
      {
        confidence:0.85, cat:'4.安全规范', heading:'升级强制标准的原因二和三',
        summary:'原因二：旧推荐标准下不同地区不同企业对高处作业的理解和执行标准存在差异，光伏运维外包普遍、跨区域作业是常态，这种不统一本身就是安全隐患。新国标用一把标尺衡量全国所有高处作业，填平"管理洼地"。原因三：推荐标准最大问题是没有约束力，企业不落实监管部门也没法处罚。升级强制后安全责任直接压实：企业配齐防护做好培训、班组长盯现场风险、运维人员规范操作。一旦发生事故从管理层到一线责任清清楚楚，再无模糊空间。',
        highlight:'用一把标尺衡量全国所有高处作业，填平管理洼地。',
        tags:['强制性标准','统一标准','管理洼地','安全责任','外包','跨区域'],
        warning:'如果你是外包运维团队的成员——你服务的电站安全标准可能每换一个项目就变一次。新国标让这种"每个项目一套规矩"的状态变成违法。',
        text:'在旧的推荐性标准体系下，不同地区、不同行业，甚至不同企业对高处作业的理解和执行标准都存在差异。有的企业严格，有的则相对松散，这就形成了安全管理的"洼地"。尤其在光伏行业，运维服务外包现象普遍，运维团队跨区域作业是常态。一个团队可能今天在执行A标准的项目，明天就要去适应B标准的电站。这种不统一性本身就是巨大的安全隐患。新国标的强制实施，旨在用一把标尺衡量全国所有高处作业，确保无论你在哪个省份、哪个电站，安全的基本要求都是一致的，从而填平这些"管理洼地"。推荐性标准最大的问题就是没有约束力，企业不落实、现场不执行，监管部门也没法处罚。升级为强制标准后，安全责任直接压实：企业要配齐防护、做好培训、规范审批；班组长要盯好现场风险；运维人员必须规范操作。一旦发生事故，从管理层到现场作业人员，责任划分清清楚楚，再也没有模糊空间。'
      },
      {
        confidence:0.80, cat:'4.安全规范', heading:'作业高度新公式：hw = hb + R',
        summary:'新国标高处作业定义仍是"坠落高度基准面2米及以上"，但对作业高度的确定给出了更精确公式：hw = hb + R。hw是作业高度，hb是基础高度（脚下距地面距离），R是可能的坠落半径（身体向外倾斜的活动半径）。实例：彩钢瓦屋顶清洗，站在屋顶边缘距地面10米（hb=10m），操作时身体外倾活动半径0.8米（R=0.8m）→ 实际判定作业高度hw=10.8米，这个数字决定了作业等级。另一实例：地面电站2.5米支架作业，如果支架下方是沟壑或边坡，坠落基准面不是脚下的土地而是沟壑底部，hb远大于2.5米。',
        highlight:'',
        tags:['作业高度','hw=hb+R','坠落半径','作业等级','计算公式','坠落基准面'],
        warning:'支架下方是沟壑或边坡时，坠落基准面不是脚底是沟底——很多人算错作业高度就是因为忽略了这一点。',
        text:'高处作业的定义依然是"坠落高度基准面2米及以上"。但新国标对作业高度的确定方法给出了更精确的公式：hw = hb + R。其中hw是作业高度，hb是基础高度，R是可能的坠落半径。实例：彩钢瓦屋顶组件清洗，你站在屋顶边缘，脚下距离地面高度为10米（hb=10m）。但你作业时身体可能会因为操作而向外倾斜，这个活动半径（R）可能是0.8米。那么你的实际判定作业高度hw就是10.8米。这决定了你的作业等级。地面电站支架螺丝紧固，你站在一个2.5米高的支架上，脚下是平地，看似只是刚过2米线。但如果支架下方是沟壑或边坡，那么你的坠落基准面就不再是脚下的土地，而是沟壑的底部！此时hb会远大于2.5米。'
      },
    ]
  },
]

const active = ref(0)
const currentArticle = computed(() => articles[active.value])

const confClass = (v) => {
  if (v >= 0.9) return 'conf-high'
  if (v >= 0.75) return 'conf-mid'
  return 'conf-low'
}
const catColor = (cat) => {
  const m = { '1.设备与组件':'#3b82f6','2.运维操作':'#10b981','3.故障与处理':'#ef4444',
    '4.安全规范':'#f59e0b','5.政策与标准':'#8b5cf6','6.设计与工程':'#06b6d4' }
  return m[cat] || '#6b7280'
}
</script>

<style scoped>
.kb-preview { font-family:"PingFang SC","Microsoft YaHei",sans-serif; padding:16px 20px; background:#f0f2f5; min-height:100vh; max-width:900px; margin:0 auto; }
.topbar { background:#fff; padding:16px 20px; border-radius:10px; margin-bottom:16px; }
.topbar h2 { margin:0 0 4px 0; font-size:18px; }
.rules { font-size:11px; color:#888; margin-bottom:12px; }
.article-tabs { display:flex; gap:6px; flex-wrap:wrap; }
.tab { font-size:12px; padding:6px 14px; border-radius:14px; border:1px solid #ddd; background:#fff; cursor:pointer; }
.tab.active { background:#2563eb; color:#fff; border-color:#2563eb; }

.chunk-list { display:flex; flex-direction:column; gap:14px; }
.chunk-card { background:#fff; border-radius:10px; padding:18px 22px; }
.chunk-header { display:flex; align-items:center; gap:10px; margin-bottom:10px; user-select:none; flex-wrap:wrap; }
.chunk-num { font-size:11px; color:#bbb; min-width:42px; }
.badge { font-size:11px; padding:2px 10px; border-radius:10px; border:1px solid; font-weight:500; }
.heading-name { font-size:13px; color:#555; font-weight:500; }

.summary { font-size:14px; color:#1e3a5f; line-height:1.8; padding:12px 14px; background:#f8fafc; border-left:4px solid #2563eb; border-radius:0 6px 6px 0; margin-bottom:8px; user-select:text; }

.highlight { font-size:13px; color:#7c3aed; margin:6px 0; padding:8px 12px; background:#f5f3ff; border-left:3px solid #7c3aed; border-radius:0 4px 4px 0; user-select:text; }
.hl-label { font-size:10px; font-weight:600; background:#7c3aed; color:#fff; padding:1px 6px; border-radius:4px; margin-right:8px; user-select:none; }

.tags-row { display:flex; flex-wrap:wrap; gap:4px; margin:6px 0; user-select:none; }
.tag { font-size:10px; padding:2px 8px; background:#eef2ff; color:#4f6ef7; border-radius:10px; }

.warning { font-size:12px; color:#d97706; padding:6px 10px; background:#fffbeb; border-left:3px solid #f59e0b; border-radius:0 4px 4px 0; margin-top:6px; user-select:text; }

.conf { font-size:10px; padding:2px 8px; border-radius:10px; font-weight:600; margin-left:auto; }
.conf-high { background:#dcfce7; color:#16a34a; border:1px solid #bbf7d0; }
.conf-mid { background:#fef9c3; color:#ca8a04; border:1px solid #fef08a; }
.conf-low { background:#fee2e2; color:#dc2626; border:1px solid #fecaca; }

.toggle { font-size:12px; color:#2563eb; cursor:pointer; padding:4px 0; margin-top:6px; user-select:none; }
.original { font-size:13px; color:#666; white-space:pre-wrap; line-height:1.8; padding:12px; background:#fafafa; border-radius:6px; margin-top:4px; border:1px solid #eee; user-select:text; }
</style>
