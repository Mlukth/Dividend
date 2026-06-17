<template>
  <div class="experiment">
    <div class="topbar">
      <h2>知识提取方案对比实验</h2>
      <div class="article-tabs">
        <button v-for="(a,i) in articles" :key="i"
          :class="['tab', { active: activeArticle === i }]"
          @click="activeArticle = i"
        >{{ i+1 }}. {{ a.shortTitle }}</button>
      </div>
    </div>

    <div class="compare">
      <!-- 方案A: Chunk标注 -->
      <div class="panel panel-a">
        <div class="panel-header">方案A：单chunk标注<br><small>原文切分 → 逐块分类+标签+概括</small></div>
        <div class="panel-body">
          <div v-for="(c, j) in currentArticle.chunks" :key="'a'+j" class="mini-card">
            <div class="chunk-head">
              <span class="badge" :style="{background: catColor(c.cat)+'20', color: catColor(c.cat)}">{{ c.cat }}</span>
              <span class="heading-name">{{ c.heading }}</span>
            </div>
            <div class="mini-summary">{{ c.summary }}</div>
            <div class="mini-tags"><span v-for="t in c.tags" :key="t" class="mtag">{{ t }}</span></div>
            <details><summary>原文</summary><div class="mini-text">{{ c.text }}</div></details>
          </div>
        </div>
      </div>

      <!-- 方案B: Agent综合推理 -->
      <div class="panel panel-b">
        <div class="panel-header">方案B：Agent通读综合推理<br><small>通读全文所有chunk → 提取隐性知识+结构化卡片</small></div>
        <div class="panel-body">
          <div v-for="(card, j) in currentArticle.synthesis" :key="'b'+j" class="synth-card">
            <div class="synth-type" :class="card.type">{{ card.typeLabel }}</div>
            <div class="synth-title">{{ card.title }}</div>
            <div class="synth-body">{{ card.body }}</div>
            <div v-if="card.sources" class="synth-sources">
              依据：<span v-for="s in card.sources" :key="s" class="src-ref">{{ s }}</span>
            </div>
            <div v-if="card.warning" class="synth-warn">⚠ {{ card.warning }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// ==================== 5篇文章数据 ====================

const articles = [
  // === 文章1：逆变器散热 ===
  {
    shortTitle: '逆变器散热经济学',
    chunks: [
      { cat:'3.故障与处理', heading:'逆变器为啥会发热', summary:'IGBT每秒开关2万次，逆变器效率约97%即3%能量变热。100kW逆变器每小时产热3kW。', tags:['逆变器','IGBT','效率','发热原理'], text:'在逆变器内部的一块巴掌大的IGBT模块，每秒开关动作就高达2万次。在光伏逆变器中，电子元件在工作时会经历复杂的电流传导与电压转换过程，必然会产生一定热量。一般来说，逆变器的效率在97%左右，即3%能量变成热量。一个100kW逆变器每小时就能产生3kW热量。这些热量不及时散出去，当温度超过额定工作温度时，逆变器效率会下降，寿命也会跟着缩短。温度每升高10℃，电子元件寿命就会缩短一半。' },
      { cat:'1.设备与组件', heading:'散热系统分类', summary:'逆变器散热分主动散热和自然冷却两种。主动散热最常见是风扇，大型逆变器也有液冷方案。', tags:['逆变器','散热系统','主动散热','自然冷却','液冷'], text:'为了让逆变器能在合适的温度下工作，配备了一套散热系统。这套系统就像人体的散热机制，有主动散热和自然冷却两种方式。主动散热最常见的就是风扇散热，在逆变器内部或外部安装风扇把热量赶出去。除了风扇，还有一种主动散热方式是液体冷却，在大型逆变器中比较常见。液冷一般通过在逆变器内部设置冷却管道，让冷却液在管道中循环带走热量。液冷散热效果确实更好，但结构复杂维护成本也高。' },
      { cat:'1.设备与组件', heading:'自然冷却vs强制风冷', summary:'自然冷却靠机壳散热无噪音免维护但功率密度低。强制风冷成本低安装简单但需定期清灰换风扇。', tags:['逆变器','散热','自然冷却','强制风冷','成本'], text:'自然冷却就像逆变器的被动技能——不需要额外动力，单纯靠机壳散热片和空气对流来降温。优点：零噪音、零维护、永远不会出现风扇故障。缺点也很致命——散热能力有限，功率密度上不去。强制风冷用风扇强制吹风，散热效果比自然冷却好得多，成本也比较低，是目前中小型逆变器的主流散热方案。但风扇是易损件，隔段时间就得清灰、检查、更换。' },
      { cat:'3.故障与处理', heading:'风扇故障——头号杀手', summary:'风扇故障是逆变器散热问题最常见原因。轴承磨损、叶片积灰、电源线松动都会导致散热失效。关键是渐进式恶化。', tags:['逆变器','风扇故障','轴承磨损','积灰','渐进式故障'], text:'在运维现场，风扇故障可以说是逆变器散热问题的第一大元凶。最常见三种情况：一是轴承磨损，风扇咔咔响甚至卡死；二是叶片积灰严重，风量大幅下降带不走热量；三是电源线松动或接头氧化，供电不稳导致风扇时转时停。任何一个都可能导致逆变器内部温度飙升，触发过温保护停机。关键是风扇故障往往是渐进式的——今天还能转，明天就不行了，等发现的时候逆变器已经跳了。' },
      { cat:'2.运维操作', heading:'日常巡检要点', summary:'巡检三招：听风扇声音判断轴承状态、摸外壳温度找异常热点、看通风口是否堵塞。定检不能偷懒。', tags:['逆变器','巡检','风扇检查','温度监测','日常运维'], text:'老运维都有一套巡检经验：第一走到逆变器跟前先听声音——正常散热风扇是均匀嗡嗡声，如果听到咔咔、吱吱的异响，轴承八成已经磨损。第二用手背快速触碰逆变器外壳不同位置——某个区域明显比别处烫，说明那个位置散热出问题。第三看通风口和滤网——被杨絮、灰尘、杂物堵住是最容易被忽略的问题。这些事情花不了几分钟，但就是这几分钟能避免几小时的停机损失。' },
    ],
    synthesis: [
      { type:'principle', typeLabel:'📐 原理', title:'逆变器散热的本质矛盾',
        body:'逆变器97%的效率意味着每100kW容量每小时产生3kW废热。温度每升10℃元件寿命减半。散热不是附加功能，而是决定逆变器全生命周期成本的核心设计参数。风扇虽然便宜，但它把逆变器的可靠性绑在了一个几十块钱的易损件上——这是散热经济学最隐蔽的坑。',
        sources:['chunk1-发热原理','chunk3-自然冷却vs强制风冷'], warning:'选逆变器时只看初始报价不看散热方案，后期运维成本可能翻倍。' },
      { type:'insight', typeLabel:'💡 运维直觉', title:'风扇不会突然坏——它一直在告诉你它要坏了',
        body:'风扇故障是渐进式的。在彻底停转之前，它会先给你信号：咔咔响=轴承磨损，风量变小=叶片积灰，时转时停=电源接触不良。但问题是——这些信号只有你主动去听、去摸、去看才能发现。等到逆变器过温跳机才去检查风扇，说明巡检已经漏了很久了。这正是运维中最危险的情况：故障在眼皮底下慢慢发展，没人注意到。',
        sources:['chunk4-风扇故障','chunk5-巡检要点'], warning:'巡检时听到风扇异响，不要"再等等看"——立即安排更换。从异响到停转往往只有几天。' },
      { type:'actionable', typeLabel:'🔧 操作指南', title:'风扇健康检查三步法',
        body:'1. 听：正常嗡嗡声 vs 咔咔/吱吱异响 → 判断轴承状态\n2. 摸：外壳温度均匀 vs 局部烫手 → 定位散热死角\n3. 看：通风口/滤网是否被灰尘、杨絮堵塞 → 最常见也最容易被忽略\n这三步每次巡检花不了5分钟，但能避免几小时的跳机停机和几万块的元件损坏。',
        sources:['chunk5-巡检要点'], warning:'' },
    ]
  },

  // === 文章2：逆变器保护机制 ===
  {
    shortTitle: '逆变器保护机制',
    chunks: [
      { cat:'3.故障与处理', heading:'逆变器的自我保护', summary:'逆变器有一整套保护机制，当检测到异常时会自动停机保护，防止故障扩大。但这些保护本身也可能被误触发。', tags:['逆变器','保护机制','停机保护','故障诊断'], text:'逆变器内部设计了一套完善的保护系统，就像人的免疫系统。当检测到电压异常、电流过大、温度过高、绝缘下降等情况，保护机制会自动触发，让逆变器停机。有了这套保护，元件不容易烧毁，故障不会扩大。但保护机制本身也有被误触发的时候——比如电网电压波动引起的瞬间过压，逆变器就会"自闭"，让你以为是逆变器坏了，其实只是它太敏感。' },
      { cat:'3.故障与处理', heading:'过温保护的连锁效应', summary:'过温保护触发后逆变器停机，但停机本身可能造成发电损失。需要区分真过温还是传感器误报。', tags:['逆变器','过温保护','误触发','传感器','发电损失'], text:'过温保护是逆变器最常见的保护动作之一。但并不是每次过温停机都是真的过温。温度传感器本身故障也会误报。一个电站因为传感器误报反复停机，运维人员以为是散热问题，换了风扇、清了滤网，问题依旧——最后发现是温度传感器接线端子氧化，电阻漂移导致读数偏高20℃。一个小小端子让电站白白停了好几天。' },
      { cat:'2.运维操作', heading:'保护动作后的排查顺序', summary:'保护停机后先不要急于复位，应先排查触发原因。优先级：看故障代码→查运行日志→现场检查→判断真伪→处理。', tags:['逆变器','保护停机','排查流程','故障代码','复位'], text:'保护动作停机后，运维新手的第一反应往往是"先复位试试，看能不能好"。这是大忌。正确顺序：1.先看故障代码，确定是哪种保护触发的；2.查运行日志，看停机前后的电压电流温度曲线；3.现场检查对应的设备和接线；4.判断是真故障还是误触发；5.确认真故障则处理后再复位，确认误触发则排查传感器和接线。跳过前两步直接复位，等于把故障埋起来等下次更大的爆发。' },
    ],
    synthesis: [
      { type:'insight', typeLabel:'💡 运维直觉', title:'逆变器"自闭"不一定是坏了',
        body:'保护机制停机 ≠ 逆变器故障。很多情况下是逆变器太"尽责"了——电网电压一波动它就自保停机。这就像烟雾报警器被炒菜的油烟触发，不是房子着火了。但每次停机都是发电损失，所以真正的运维能力在于：快速判断是真故障还是误触发，而不是每次停机都当成故障去修。一条关键线索是看停机前后的运行曲线——真故障通常有渐变过程（温度慢慢升、电流逐步降），误触发往往是突然跳变。',
        sources:['chunk1-自我保护','chunk2-过温保护','chunk3-排查顺序'],
        warning:'温度传感器接线端子氧化导致读数漂移是常见但容易被忽视的误触发原因。停机后除了查逆变器本身，别忘了查传感器。' },
      { type:'actionable', typeLabel:'🔧 操作指南', title:'保护停机后的标准排查流程',
        body:'⚠ 禁止第一步就复位！\n1. 读取故障代码 → 确定保护类型（过温/过压/绝缘/孤岛等）\n2. 查运行日志 → 看停机前后5分钟的电压电流温度曲线\n3. 现场检查 → 对应设备/接线/传感器\n4. 判断：渐变=真故障，跳变=可能误触发\n5. 真故障先修后复位，误触发查传感器和接线\n跳过前两步直接复位 = 把故障埋起来，下次可能就不是停机而是烧设备了。',
        sources:['chunk3-排查顺序'], warning:'反复过温停机但现场温度正常 → 优先检查温度传感器接线端子是否氧化' },
    ]
  },

  // === 文章3：IGBT失效 ===
  {
    shortTitle: 'IGBT怎么坏的',
    chunks: [
      { cat:'1.设备与组件', heading:'IGBT——逆变器的心脏', summary:'IGBT是逆变器最核心的功率器件，每秒开关数万次。它的可靠性直接决定逆变器寿命。', tags:['逆变器','IGBT','功率器件','开关频率','可靠性'], text:'IGBT（绝缘栅双极型晶体管）是逆变器中最核心的功率半导体器件，负责将光伏组件发出的直流电转换为电网可接受的交流电。在逆变器中，IGBT模块每秒需要进行数千到数万次的开关动作。这个开关频率越高，逆变器的效率越高、体积越小——但代价是开关损耗增大，发热增加，对器件的应力也加大。可以说IGBT是逆变器里最辛苦、也最值钱的零件。' },
      { cat:'3.故障与处理', heading:'过流是IGBT的头号杀手', summary:'瞬间过流可以在微秒级烧毁IGBT。常见原因：电网侧短路、逆变器输出短路、雷击感应过电压。', tags:['IGBT','过流','短路','雷击','瞬间烧毁'], text:'IGBT最怕的不是发热，而是过流。发热是慢性的，过流是瞬间的。电网侧发生短路、逆变器输出端短路、或者雷击感应的过电压，都可能在微秒级时间内让流过IGBT的电流超过其额定值的数倍甚至数十倍。IGBT内部芯片瞬间过热熔毁——这个过程快到保护电路都来不及动作。所以防过流不能只靠IGBT本身的保护，必须在前端做好防雷和短路保护。' },
      { cat:'2.运维操作', heading:'延长IGBT寿命的关键', summary:'控制结温、避免频繁热循环冲击、做好防雷接地，是延长IGBT寿命的三大要点。', tags:['IGBT','寿命','结温','热循环','防雷接地'], text:'IGBT的寿命与结温（芯片内部温度）和热循环次数直接相关。每次逆变器启停、功率大幅波动，IGBT都会经历一次热胀冷缩的应力循环。长期下来，IGBT内部的键合线会疲劳断裂，就像反复弯折一根铁丝最后折断一样。所以，减少不必要的启停、保持逆变器运行在稳定的温度区间，对延长IGBT寿命非常关键。另外防雷接地做得好不好，直接决定IGBT会不会在某天被一个雷"送走"。' },
    ],
    synthesis: [
      { type:'principle', typeLabel:'📐 原理', title:'IGBT的两种死法：热死的和电死的',
        body:'IGBT失效分两大类：热失效（慢性）和过流失效（瞬间）。热失效像人老死——键合线疲劳、焊料层退化，是长期热循环累积的结果，可以预判和延缓。过流失效像被车撞——电网短路或雷击导致的瞬时过流，微秒级烧毁，保护电路都来不及。理解了这两种死法，才能理解为什么运维既要管好散热（防热死），又要管好防雷接地（防电死）。两者缺一不可。',
        sources:['chunk1-IGBT心脏','chunk2-过流杀手','chunk3-延长寿命'], warning:'防雷接地线松动或腐蚀 → IGBT等于裸奔。巡检时必须检查接地电阻。' },
      { type:'insight', typeLabel:'💡 运维直觉', title:'减少启停比你想的更重要',
        body:'很多电站为了省电或者响应调度，频繁启停逆变器。表面上看是在"优化运行"，实际上每一次启停都让IGBT经历一次剧烈的热胀冷缩——相当于反复弯折一根铁丝。这种热循环对IGBT内部键合线的损伤是累积且不可逆的。所以判断一个运维策略好不好，不仅要看短期发电量，还要看它对设备寿命的隐形损耗。发电量好算，寿命损耗难算——但后者往往才是真正的成本大头。',
        sources:['chunk3-延长寿命'], warning:'频繁启停=加速IGBT老化。非必要不要频繁开关逆变器。' },
    ]
  },

  // === 文章4：温度影响发电 ===
  {
    shortTitle: '温度偷走发电量',
    chunks: [
      { cat:'6.设计与工程', heading:'光伏组件的最佳发电温度', summary:'组件最佳发电温度约25℃。温度每升高1℃，输出功率降低约0.35-0.44%。高温是效率杀手。', tags:['组件','温度系数','发电效率','最佳温度','功率衰减'], text:'人们想当然以为"阳光越强气温越高光伏发电量越大"，真实情况恰恰相反。光伏组件存在一个最佳发电温度，大约在25℃左右。温度每升高1℃，组件输出功率降低约0.35%-0.44%。夏季组件温度可达85℃，效率下降超过20%。这是因为光伏电池内部半导体材料在高温下电阻增加，电子迁移率下降。' },
      { cat:'6.设计与工程', heading:'季节对效率的影响', summary:'春秋季发电效率最高（接近25℃最佳温度），夏季光照虽足但高温抵消部分优势。', tags:['组件','季节','发电效率','春秋季','夏季衰减'], text:'春季和秋季通常是发电效率最高的季节，此时环境温度接近组件最佳工作温度25℃且光照强度适中。夏季虽然光照充足但高温会抵消部分优势。2024年夏季南方某2.55MW电站数据显示：7月光照时间优于去年但平均日发电量却比去年低8.4%，原因就是高温导致组件输出功率下降。' },
      { cat:'3.故障与处理', heading:'温度过高对设备的综合危害', summary:'不仅组件，逆变器、电缆、变压器都受高温影响。高温加速所有电气元件的老化。', tags:['高温','设备老化','逆变器','电缆','变压器','综合危害'], text:'高温的危害远不止影响组件发电量。逆变器在高温环境下效率下降、保护频繁触发、寿命缩短。电缆在高温下绝缘加速老化。变压器的油温升高导致绝缘油劣化加速。整个电站其实是一个热力学系统——温度管理做得好不好，直接决定全站设备的可靠性和寿命。很多运维只盯着组件温度，忽略了其他设备的热管理，这是片面的。' },
    ],
    synthesis: [
      { type:'principle', typeLabel:'📐 原理', title:'高温是电站的隐性税',
        body:'温度每升高1℃，组件功率降0.4%。这听起来不多，但一个100MW电站在夏季高温时段全站效率下降20%，一年累积下来就是几百万度的电量损失。而且高温不只是影响组件——逆变器、电缆、变压器全都在加速老化。高温是全站范围的隐性损耗税，收缴方式是"每次不多，但每天都在扣"。运维不能只盯着故障修，更要理解温度和效率的关系，把热管理当成日常工作而非应急响应。',
        sources:['chunk1-最佳温度','chunk2-季节效率','chunk3-综合危害'], warning:'夏季温度越高光照越好但发电量越低——这是正常的物理规律，不能因为发电量下降就怀疑设备故障。先算温度修正。' },
      { type:'insight', typeLabel:'💡 运维直觉', title:'春秋季发电量高是正常的，夏季低也是正常的',
        body:'这个常识很多电站老板和运维新手不理解。他们看到夏天太阳大、光照长，直觉上觉得发电量应该最高，结果发现反而没有春秋高，就怀疑设备坏了。其实这就是组件温度系数在起作用——25℃最佳，每高1℃降0.4%。夏季组件表面七八十度，效率自然低。理解了这个规律，就不会在夏天瞎排查设备，也不会给运维团队施加不合理的发电量压力。',
        sources:['chunk2-季节效率'], warning:'夏季发电量评估必须做温度修正，不能直接用"光照好就应该多发"的逻辑判断。' },
    ]
  },

  // === 文章5：两个细则 ===
  {
    shortTitle: '两个细则与运维',
    chunks: [
      { cat:'5.政策与标准', heading:'两个细则对运维的意义', summary:'"两个细则"不是挂在墙上的政策文件，而是直接绑定电站考核和收益的硬标准。', tags:['两个细则','政策','考核','收益','合规'], text:'不管是场站运维、值守巡检还是设备检修、调度配合，"两个细则"早已不是挂在墙上的政策文件，而是直接绑定电站考核、关乎收益盈亏的硬标准。很多运维伙伴觉得这些文件离自己很远，是站长或管理层的事。其实不用把细则想得太复杂——核心就是给光伏运维划定了"合规底线"和"履职标准"。' },
      { cat:'5.政策与标准', heading:'并网运行管理细则——守底线避考核', summary:'核心是规范电站并网后日常运行行为。数据上报出错、设备维护不及时、调度指令不执行都会触发考核扣款。', tags:['并网运行','考核','数据上报','设备维护','调度指令','扣款'], text:'并网运行管理细则核心是规范光伏电站并网后的日常运行行为。设备运维不到位、调度指令不执行、运行数据不达标，都会触发考核扣款。说白了就是给光伏运维划下"不能碰的红线"。其中数据上报是最容易踩坑的：电站需每15分钟上报一次运行数据，数据合格率按日统计按月考核，每日合格率低于95%就会被考核。' },
      { cat:'5.政策与标准', heading:'辅助服务管理细则——履义务赚收益', summary:'电网稳定需要光伏配合调频调压调峰。细则明确了强制义务和有偿服务的补偿标准——运维做到位既能合规又能创收。', tags:['辅助服务','调频','调压','调峰','补偿','创收'], text:'辅助服务管理细则要求光伏电站配合电网提供调频、调压、调峰等辅助服务。细则既明确了强制履约的基础义务，也划定了有偿服务的补偿标准。运维做到位，既能合规履职，又能给电站额外创收。这意味着运维工作已经不再局限于"维护设备"，而是扩展到了"运营资产"——不仅懂技术还要懂市场懂政策懂经营。' },
      { cat:'5.政策与标准', heading:'通信和数据是考核重灾区', summary:'通信故障导致数据中断、功率预测系统异常、上报数据格式错误——这些技术细节都可能直接转化为经济损失。', tags:['通信故障','数据中断','功率预测','考核','经济损失'], text:'细则里考核最频繁也最容易踩坑的地方集中在通信和数据：通信故障导致数据中断运维人员没及时发现；功率预测系统运行异常预测数据一直报不上去；上报数据格式或时间不符合要求。这些问题看起来是"技术细节"，但每一项都可能导致考核扣款。运维需要把通信状态和数据上报纳入日常巡检范围，不能只盯着硬件设备。' },
    ],
    synthesis: [
      { type:'principle', typeLabel:'📐 原理', title:'两个细则把"做得好"变成了"必须做好"',
        body:'以前光伏运维是"能做多好做多好"——凭良心、拼责任心。两个细则把运维从道德约束变成了经济约束。数据上报不合格→扣钱；调度指令不执行→扣钱；设备维护不及时→扣钱。但反过来，辅助服务做得好→赚钱。所以两个细则既是紧箍咒也是摇钱树——关键在于运维团队有没有能力把合规要求转化为创收机会。这对运维人员的技能结构提出了全新要求：不能只会修设备，必须懂数据、懂调度、懂市场。',
        sources:['chunk1-意义','chunk2-并网考核','chunk3-辅助服务','chunk4-通信数据'], warning:'通信和数据上报不再是"IT的事"而是运维的事——考核扣款直接关联电站收益。' },
      { type:'insight', typeLabel:'💡 运维直觉', title:'最容易被考核扣款的往往不是设备故障',
        body:'很多运维人员的注意力集中在设备上——逆变器有没有报警、组件有没有损坏。但两个细则考核最频繁的地方恰恰不是设备本身，而是数据上报和通信。数据中断了、格式错了、晚了——这些看不到摸不着的问题比设备故障扣得多。所以巡检清单上必须加一条：检查通信状态、确认数据上报正常。这条花不了一分钟，但漏了就可能是真金白银的损失。',
        sources:['chunk2-并网考核','chunk4-通信数据'], warning:'每日巡检清单加一项：确认远动通信正常、数据上报无中断。' },
    ]
  },
]

const activeArticle = ref(0)
const currentArticle = computed(() => articles[activeArticle.value])

const catColor = (cat) => {
  const m = { '1.设备与组件':'#3b82f6','2.运维操作':'#10b981','3.故障与处理':'#ef4444',
    '4.安全规范':'#f59e0b','5.政策与标准':'#8b5cf6','6.设计与工程':'#06b6d4' }
  return m[cat] || '#6b7280'
}
</script>

<style scoped>
.experiment { font-family: "PingFang SC","Microsoft YaHei",sans-serif; padding:16px; background:#f0f2f5; min-height:100vh; }
.topbar { background:#fff; padding:16px 20px; border-radius:10px; margin-bottom:12px; box-shadow:0 1px 3px rgba(0,0,0,0.06); }
.topbar h2 { margin:0 0 12px 0; font-size:18px; }
.article-tabs { display:flex; gap:6px; flex-wrap:wrap; }
.tab { font-size:12px; padding:6px 14px; border-radius:14px; border:1px solid #ddd; background:#fff; cursor:pointer; white-space:nowrap; }
.tab.active { background:#2563eb; color:#fff; border-color:#2563eb; }

.compare { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.panel { background:#fff; border-radius:10px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.06); }
.panel-header { padding:12px 16px; font-weight:600; font-size:14px; }
.panel-header small { font-weight:400; font-size:11px; color:#888; }
.panel-a .panel-header { background:#f8fafc; border-bottom:2px solid #e2e8f0; }
.panel-b .panel-header { background:#fefce8; border-bottom:2px solid #fde68a; }
.panel-body { padding:12px; max-height:80vh; overflow-y:auto; display:flex; flex-direction:column; gap:10px; }

/* 方案A卡片 */
.mini-card { border:1px solid #eee; border-radius:8px; padding:12px; }
.chunk-head { display:flex; align-items:center; gap:8px; margin-bottom:6px; }
.badge { font-size:11px; padding:2px 8px; border-radius:10px; font-weight:500; }
.heading-name { font-size:13px; color:#333; font-weight:500; }
.mini-summary { font-size:13px; color:#1e3a5f; line-height:1.6; margin-bottom:6px; padding:8px 10px; background:#f8fafc; border-left:3px solid #2563eb; border-radius:0 4px 4px 0; }
.mini-tags { display:flex; flex-wrap:wrap; gap:4px; margin-bottom:6px; }
.mtag { font-size:10px; padding:1px 8px; background:#eef2ff; color:#4f6ef7; border-radius:10px; }
details { font-size:12px; color:#2563eb; cursor:pointer; }
details summary { padding:4px 0; }
.mini-text { font-size:12px; color:#666; line-height:1.7; padding:8px; background:#fafafa; border-radius:4px; margin-top:4px; white-space:pre-wrap; }

/* 方案B卡片 */
.synth-card { border:1px solid #fde68a; border-radius:10px; padding:16px; background:#fffef5; }
.synth-type { font-size:12px; font-weight:600; margin-bottom:6px; }
.synth-title { font-size:15px; font-weight:700; color:#1e3a5f; margin-bottom:8px; }
.synth-body { font-size:13px; color:#333; line-height:1.8; white-space:pre-wrap; }
.synth-sources { font-size:11px; color:#888; margin-top:8px; }
.src-ref { background:#eef2ff; padding:1px 6px; border-radius:4px; margin:0 2px; }
.synth-warn { font-size:12px; color:#d97706; background:#fef3c7; padding:6px 10px; border-radius:4px; margin-top:8px; }
</style>
