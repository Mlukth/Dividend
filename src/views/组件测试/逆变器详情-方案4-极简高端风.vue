<template>
  <div class="lux-page">
    <!-- 玻璃顶栏 -->
    <div class="glass-header">
      <div class="gh-left">
        <div class="avatar-icon">
          <svg viewBox="0 0 1024 1024"><path fill="currentColor" d="M288 671.36v64.128A239.81 239.81 0 0 1 63.744 496.192a240.32 240.32 0 0 1 199.488-236.8 256.128 256.128 0 0 1 487.872-30.976A256.064 256.064 0 0 1 736 734.016v-64.768a192 192 0 0 0 3.328-377.92l-35.2-6.592-12.8-33.408a192.064 192.064 0 0 0-365.952 23.232l-9.92 40.896-41.472 7.04a176.32 176.32 0 0 0-146.24 173.568c0 91.968 70.464 167.36 160.256 175.232z"/></svg>
        </div>
        <div>
          <h1 class="gh-title">{{ inverter.name }}</h1>
          <p class="gh-sub">{{ inverter.stationName }} · SN {{ inverter.sn }}</p>
        </div>
      </div>
      <div class="gh-right">
        <div class="live-dot">
          <span class="live-pulse"></span>
          实时监控中
        </div>
        <button class="gh-btn" @click="handleControl">设备控制</button>
        <button class="gh-btn sec" @click="goBack">返回电站</button>
      </div>
    </div>

    <!-- 核心数值行：大数字留白 -->
    <div class="hero-numbers">
      <div class="hero-num-item">
        <div class="hn-value">
          <span class="hn-num counter">{{ inverter.realPower }}</span>
        </div>
        <div class="hn-label">实时功率</div>
      </div>
      <div class="hn-divider"></div>
      <div class="hero-num-item">
        <div class="hn-value">
          <span class="hn-num">{{ inverter.dayEnergy }}</span>
        </div>
        <div class="hn-label">当日发电</div>
      </div>
      <div class="hn-divider"></div>
      <div class="hero-num-item">
        <div class="hn-value">
          <span class="hn-num">{{ inverter.dayHours }}</span>
        </div>
        <div class="hn-label">日满发小时</div>
      </div>
      <div class="hn-divider"></div>
      <div class="hero-num-item">
        <div class="hn-value">
          <span class="hn-num">{{ inverter.totalEnergy }}</span>
        </div>
        <div class="hn-label">累计发电</div>
      </div>
    </div>

    <!-- 信息卡片组：毛玻璃 + 微阴影 -->
    <div class="card-cluster">
      <!-- 基础信息 -->
      <div class="lux-card">
        <div class="lux-card-title">基础信息</div>
        <div class="lux-info-grid">
          <div class="lux-info-item" v-for="f in infoFields" :key="f.label">
            <div class="lux-info-v" :class="{ ok: f.good, link: f.link }">{{ f.value }}</div>
            <div class="lux-info-l">{{ f.label }}</div>
          </div>
        </div>
      </div>

      <!-- 运行指标 -->
      <div class="lux-card">
        <div class="lux-card-title">运行指标</div>
        <div class="run-cols">
          <div class="run-col" v-for="r in runData" :key="r.label">
            <div class="rc-ring-wrap">
              <svg class="rc-ring" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#F0F1F3" stroke-width="5"/>
                <circle cx="50" cy="50" r="42" fill="none" :stroke="r.color" stroke-width="5"
                  stroke-linecap="round" :stroke-dasharray="2 * Math.PI * 42"
                  :stroke-dashoffset="2 * Math.PI * 42 * (1 - r.pct / 100)"
                  transform="rotate(-90 50 50)" style="transition: stroke-dashoffset 1s ease;"/>
              </svg>
              <span class="rc-val">{{ r.value }}</span>
            </div>
            <div class="rc-label">{{ r.label }}</div>
          </div>
        </div>
      </div>

      <!-- 直流侧 -->
      <div class="lux-card">
        <div class="lux-card-title">直流侧数据 <span class="lux-badge">模拟</span></div>
        <div class="lux-dc-grid">
          <div class="dc-cell" v-for="d in dcData" :key="d.name" :class="{ 'dc-warn': d.current <= 0.15 }">
            <div class="dc-cell-name">{{ d.name }}</div>
            <div class="dc-cell-volt">{{ d.voltage }}<span>V</span></div>
            <div class="dc-cell-curr">{{ d.current }}<span>A</span></div>
            <div class="dc-cell-power">{{ d.power }}<span>W</span></div>
          </div>
        </div>
      </div>

      <!-- 交流侧 -->
      <div class="lux-card">
        <div class="lux-card-title">交流侧数据 <span class="lux-badge">模拟</span></div>
        <div class="lux-ac-row">
          <div class="ac-cell" v-for="a in acData" :key="a.name">
            <div class="ac-phase">{{ a.name }}</div>
            <div class="ac-v"><span class="ac-num">{{ a.voltage }}</span><span class="ac-unit">V</span></div>
            <div class="ac-v"><span class="ac-num">{{ a.current }}</span><span class="ac-unit">A</span></div>
            <div class="ac-v"><span class="ac-num">{{ a.freq }}</span><span class="ac-unit">Hz</span></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const goBack = () => {}
const handleControl = () => {}

const inverter = ref({
  name: 'INV-东江园区A1-001',
  sn: 'SOLIS-2024-A1B2C3D4',
  stationName: '东江高新产业园区',
  realPower: '48.6kW',
  dayEnergy: '312.5kWh',
  dayHours: '4.8h',
  totalEnergy: '158.6MWh'
})

const infoFields = [
  { label: '型号', value: 'S6-GC60K-US' },
  { label: '机型', value: '组串式逆变器' },
  { label: '额定功率', value: '60kW', good: true },
  { label: '所属电站', value: '东江高新产业园区', link: true },
  { label: '质保状态', value: '质保期内', good: true },
  { label: '质保到期时间', value: '2029-06-15' },
  { label: '逆变器版本', value: 'V2.4.1' },
  { label: 'AFO版本', value: 'V1.3.0' },
  { label: 'G100运行状态', value: '运行中' },
  { label: '地址', value: '广东省惠州市博罗县' }
]

const runData = [
  { label: '系统效率', value: '85%', pct: 85, color: '#6366F1' },
  { label: '逆变器效率', value: '98.2%', pct: 98.2, color: '#10B981' },
  { label: '功率因数', value: '0.96', pct: 96, color: '#F59E0B' },
  { label: '离散率', value: '3.2%', pct: 16, color: '#EF4444' }
]

const dcData = [
  { name: 'PV1', voltage: 648.6, current: 6.8, power: 4410 },
  { name: 'PV2', voltage: 648.6, current: 0.05, power: 32 },
  { name: 'PV3', voltage: 596.5, current: 7.1, power: 4235 },
  { name: 'PV4', voltage: 596.5, current: 0.08, power: 48 },
  { name: 'PV5', voltage: 553.9, current: 5.3, power: 2936 },
  { name: 'PV6', voltage: 553.9, current: 0.03, power: 17 },
  { name: 'PV7', voltage: 632.9, current: 8.2, power: 5189 },
  { name: 'PV8', voltage: 632.9, current: 0.12, power: 76 }
]

const acData = [
  { name: 'L1相', voltage: 255.9, current: 14.2, freq: 50.03 },
  { name: 'L2相', voltage: 257.7, current: 13.8, freq: 50.03 },
  { name: 'L3相', voltage: 255.3, current: 14.0, freq: 50.03 }
]
</script>

<style scoped>
.lux-page {
  width: 100%; min-height: 100vh;
  background: linear-gradient(160deg, #F8FAFC 0%, #F1F5F9 40%, #EFF6FF 100%);
  padding: 28px 36px; box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", sans-serif;
  color: #1E293B;
}

.glass-header {
  display: flex; justify-content: space-between; align-items: center;
  background: rgba(255,255,255,0.7); backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.9);
  border-radius: 16px; padding: 20px 28px;
  margin-bottom: 28px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.gh-left { display: flex; align-items: center; gap: 14px; }
.avatar-icon {
  width: 44px; height: 44px; border-radius: 12px;
  background: linear-gradient(135deg, #6366F1, #8B5CF6);
  display: flex; align-items: center; justify-content: center; color: #fff;
}
.avatar-icon svg { width: 22px; height: 22px; }
.gh-title { font-size: 20px; font-weight: 700; margin: 0; letter-spacing: -0.3px; }
.gh-sub { margin: 2px 0 0; font-size: 13px; color: #64748B; }
.gh-right { display: flex; align-items: center; gap: 14px; }
.live-dot { font-size: 12px; color: #10B981; font-weight: 500; display: flex; align-items: center; gap: 6px; }
.live-pulse { width: 7px; height: 7px; border-radius: 50%; background: #10B981; animation: luxPulse 2s infinite; }
@keyframes luxPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.4); } 50% { box-shadow: 0 0 0 6px rgba(16,185,129,0); } }
.gh-btn {
  padding: 8px 18px; border: none; border-radius: 10px;
  background: #1E293B; color: #fff; font-size: 13px; font-weight: 500; cursor: pointer;
  transition: all 0.2s;
}
.gh-btn:hover { background: #334155; }
.gh-btn.sec { background: rgba(0,0,0,0.04); color: #64748B; }
.gh-btn.sec:hover { background: rgba(0,0,0,0.08); }

.hero-numbers {
  display: flex; align-items: center; justify-content: center;
  gap: 40px; padding: 32px 0 40px;
}
.hero-num-item { text-align: center; }
.hn-value { margin-bottom: 6px; }
.hn-num {
  font-size: 42px; font-weight: 200; letter-spacing: -1px;
  background: linear-gradient(135deg, #1E293B, #475569);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}
.hn-label { font-size: 13px; color: #94A3B8; font-weight: 500; letter-spacing: 0.5px; text-transform: uppercase; }
.hn-divider { width: 1px; height: 48px; background: #E2E8F0; }

.card-cluster {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.lux-card {
  background: rgba(255,255,255,0.75); backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.9);
  border-radius: 14px; padding: 22px 24px;
  transition: box-shadow 0.3s;
}
.lux-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
.lux-card-title {
  font-size: 13px; font-weight: 600; color: #64748B;
  text-transform: uppercase; letter-spacing: 0.8px;
  margin-bottom: 18px; display: flex; align-items: center; gap: 6px;
}
.lux-badge { font-size: 10px; padding: 2px 6px; border-radius: 4px; background: #FEF3C7; color: #D97706; font-weight: 500; letter-spacing: 0; text-transform: none; }

.lux-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 16px; }
.lux-info-item { display: flex; flex-direction: column-reverse; gap: 2px; }
.lux-info-v { font-size: 14px; font-weight: 500; color: #1E293B; }
.lux-info-v.ok { color: #10B981; }
.lux-info-v.link { color: #6366F1; cursor: pointer; }
.lux-info-l { font-size: 11px; color: #94A3B8; }

.run-cols { display: flex; justify-content: space-around; }
.run-col { text-align: center; }
.rc-ring-wrap { position: relative; width: 72px; height: 72px; margin: 0 auto 8px; }
.rc-ring { width: 100%; height: 100%; }
.rc-val { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 700; color: #1E293B; }
.rc-label { font-size: 11px; color: #94A3B8; }

.lux-dc-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.dc-cell {
  background: rgba(248,250,252,0.8); border-radius: 10px;
  padding: 12px; text-align: center;
  transition: all 0.2s;
}
.dc-cell:hover { background: rgba(241,245,249,1); }
.dc-cell.dc-warn { background: rgba(254,242,242,0.6); }
.dc-cell-name { font-size: 11px; color: #94A3B8; font-weight: 500; margin-bottom: 6px; }
.dc-cell-volt { font-size: 16px; font-weight: 600; color: #1E293B; margin-bottom: 2px; }
.dc-cell-volt span, .dc-cell-curr span, .dc-cell-power span { font-size: 10px; color: #94A3B8; margin-left: 2px; font-weight: 400; }
.dc-cell-curr { font-size: 14px; font-weight: 500; color: #475569; margin-bottom: 2px; }
.dc-cell.dc-warn .dc-cell-curr { color: #EF4444; }
.dc-cell-power { font-size: 14px; font-weight: 500; color: #475569; }

.lux-ac-row { display: flex; gap: 16px; }
.ac-cell {
  flex: 1; background: rgba(248,250,252,0.8); border-radius: 10px;
  padding: 16px; text-align: center;
}
.ac-phase { font-size: 11px; color: #94A3B8; font-weight: 500; margin-bottom: 10px; }
.ac-v { display: flex; align-items: baseline; justify-content: center; gap: 3px; margin-bottom: 4px; }
.ac-num { font-size: 16px; font-weight: 600; color: #1E293B; }
.ac-unit { font-size: 10px; color: #94A3B8; }
</style>
