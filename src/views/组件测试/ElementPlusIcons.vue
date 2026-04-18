```vue
<template>
  <div class="icons-demo">
    <h2>Element Plus 图标预览（已验证存在）</h2>
    <p class="tip">
      点击图标可复制组件名称 | 
      <a href="https://element-plus.org/zh-CN/component/icon.html" target="_blank">官方文档</a>
    </p>

    <!-- 一级导航图标 -->
    <div class="icon-section">
      <h3>📊 电站概览</h3>
      <div class="icon-grid">
        <div class="icon-item" @click="copyName('Odometer')">
          <el-icon :size="32"><Odometer /></el-icon>
          <span>Odometer</span>
        </div>
        <div class="icon-item" @click="copyName('DataAnalysis')">
          <el-icon :size="32"><DataAnalysis /></el-icon>
          <span>DataAnalysis</span>
        </div>
        <div class="icon-item" @click="copyName('DataBoard')">
          <el-icon :size="32"><DataBoard /></el-icon>
          <span>DataBoard</span>
        </div>
        <div class="icon-item" @click="copyName('TrendCharts')">
          <el-icon :size="32"><TrendCharts /></el-icon>
          <span>TrendCharts</span>
        </div>
        <div class="icon-item" @click="copyName('PieChart')">
          <el-icon :size="32"><PieChart /></el-icon>
          <span>PieChart</span>
        </div>
        <div class="icon-item" @click="copyName('Histogram')">
          <el-icon :size="32"><Histogram /></el-icon>
          <span>Histogram</span>
        </div>
        <div class="icon-item" @click="copyName('DataLine')">
          <el-icon :size="32"><DataLine /></el-icon>
          <span>DataLine</span>
        </div>
        <div class="icon-item" @click="copyName('Monitor')">
          <el-icon :size="32"><Monitor /></el-icon>
          <span>Monitor</span>
        </div>
      </div>
    </div>

    <div class="icon-section">
      <h3>🏠 电站信息</h3>
      <div class="icon-grid">
        <div class="icon-item" @click="copyName('House')">
          <el-icon :size="32"><House /></el-icon>
          <span>House</span>
        </div>
        <div class="icon-item" @click="copyName('HomeFilled')">
          <el-icon :size="32"><HomeFilled /></el-icon>
          <span>HomeFilled</span>
        </div>
        <div class="icon-item" @click="copyName('OfficeBuilding')">
          <el-icon :size="32"><OfficeBuilding /></el-icon>
          <span>OfficeBuilding</span>
        </div>
        <div class="icon-item" @click="copyName('Sunny')">
          <el-icon :size="32"><Sunny /></el-icon>
          <span>Sunny</span>
        </div>
        <div class="icon-item" @click="copyName('WindPower')">
          <el-icon :size="32"><WindPower /></el-icon>
          <span>WindPower</span>
        </div>
        <div class="icon-item" @click="copyName('LocationInformation')">
          <el-icon :size="32"><LocationInformation /></el-icon>
          <span>LocationInformation</span>
        </div>
        <div class="icon-item" @click="copyName('MapLocation')">
          <el-icon :size="32"><MapLocation /></el-icon>
          <span>MapLocation</span>
        </div>
      </div>
    </div>

    <div class="icon-section">
      <h3>🔧 运维管理</h3>
      <div class="icon-grid">
        <div class="icon-item" @click="copyName('Tools')">
          <el-icon :size="32"><Tools /></el-icon>
          <span>Tools</span>
        </div>
        <div class="icon-item" @click="copyName('Setting')">
          <el-icon :size="32"><Setting /></el-icon>
          <span>Setting</span>
        </div>
        <div class="icon-item" @click="copyName('Operation')">
          <el-icon :size="32"><Operation /></el-icon>
          <span>Operation</span>
        </div>
        <div class="icon-item" @click="copyName('Management')">
          <el-icon :size="32"><Management /></el-icon>
          <span>Management</span>
        </div>
        <div class="icon-item" @click="copyName('SetUp')">
          <el-icon :size="32"><SetUp /></el-icon>
          <span>SetUp</span>
        </div>
      </div>
    </div>

    <div class="icon-section">
      <h3>🤖 AI 助手（已验证可用的替代图标）</h3>
      <div class="icon-grid">
        <div class="icon-item" @click="copyName('Cpu')">
          <el-icon :size="32"><Cpu /></el-icon>
          <span>Cpu（推荐）</span>
        </div>
        <div class="icon-item" @click="copyName('ChatDotRound')">
          <el-icon :size="32"><ChatDotRound /></el-icon>
          <span>ChatDotRound</span>
        </div>
        <div class="icon-item" @click="copyName('ChatRound')">
          <el-icon :size="32"><ChatRound /></el-icon>
          <span>ChatRound</span>
        </div>
        <div class="icon-item" @click="copyName('MagicStick')">
          <el-icon :size="32"><MagicStick /></el-icon>
          <span>MagicStick</span>
        </div>
        <div class="icon-item" @click="copyName('Guide')">
          <el-icon :size="32"><Guide /></el-icon>
          <span>Guide</span>
        </div>
        <div class="icon-item" @click="copyName('Connection')">
          <el-icon :size="32"><Connection /></el-icon>
          <span>Connection</span>
        </div>
        <div class="icon-item" @click="copyName('Aim')">
          <el-icon :size="32"><Aim /></el-icon>
          <span>Aim</span>
        </div>
        <div class="icon-item" @click="copyName('Opportunity')">
          <el-icon :size="32"><Opportunity /></el-icon>
          <span>Opportunity</span>
        </div>
      </div>
    </div>

    <div class="icon-section">
      <h3>💰 经营管理</h3>
      <div class="icon-grid">
        <div class="icon-item" @click="copyName('Money')">
          <el-icon :size="32"><Money /></el-icon>
          <span>Money</span>
        </div>
        <div class="icon-item" @click="copyName('Coin')">
          <el-icon :size="32"><Coin /></el-icon>
          <span>Coin</span>
        </div>
        <div class="icon-item" @click="copyName('Wallet')">
          <el-icon :size="32"><Wallet /></el-icon>
          <span>Wallet</span>
        </div>
        <div class="icon-item" @click="copyName('Tickets')">
          <el-icon :size="32"><Tickets /></el-icon>
          <span>Tickets</span>
        </div>
        <div class="icon-item" @click="copyName('Ticket')">
          <el-icon :size="32"><Ticket /></el-icon>
          <span>Ticket</span>
        </div>
        <div class="icon-item" @click="copyName('TrendCharts')">
          <el-icon :size="32"><TrendCharts /></el-icon>
          <span>TrendCharts</span>
        </div>
        <div class="icon-item" @click="copyName('Discount')">
          <el-icon :size="32"><Discount /></el-icon>
          <span>Discount</span>
        </div>
        <div class="icon-item" @click="copyName('PriceTag')">
          <el-icon :size="32"><PriceTag /></el-icon>
          <span>PriceTag</span>
        </div>
        <div class="icon-item" @click="copyName('CreditCard')">
          <el-icon :size="32"><CreditCard /></el-icon>
          <span>CreditCard</span>
        </div>
      </div>
    </div>

    <!-- 二级菜单常用图标 -->
    <div class="icon-section">
      <h3>⚠️ 告警/状态类</h3>
      <div class="icon-grid">
        <div class="icon-item" @click="copyName('Warning')">
          <el-icon :size="28"><Warning /></el-icon>
          <span>Warning</span>
        </div>
        <div class="icon-item" @click="copyName('WarningFilled')">
          <el-icon :size="28"><WarningFilled /></el-icon>
          <span>WarningFilled</span>
        </div>
        <div class="icon-item" @click="copyName('CircleCheck')">
          <el-icon :size="28"><CircleCheck /></el-icon>
          <span>CircleCheck</span>
        </div>
        <div class="icon-item" @click="copyName('CircleClose')">
          <el-icon :size="28"><CircleClose /></el-icon>
          <span>CircleClose</span>
        </div>
        <div class="icon-item" @click="copyName('SuccessFilled')">
          <el-icon :size="28"><SuccessFilled /></el-icon>
          <span>SuccessFilled</span>
        </div>
        <div class="icon-item" @click="copyName('InfoFilled')">
          <el-icon :size="28"><InfoFilled /></el-icon>
          <span>InfoFilled</span>
        </div>
        <div class="icon-item" @click="copyName('Failed')">
          <el-icon :size="28"><Failed /></el-icon>
          <span>Failed</span>
        </div>
        <div class="icon-item" @click="copyName('CircleCheckFilled')">
          <el-icon :size="28"><CircleCheckFilled /></el-icon>
          <span>CircleCheckFilled</span>
        </div>
        <div class="icon-item" @click="copyName('CircleCloseFilled')">
          <el-icon :size="28"><CircleCloseFilled /></el-icon>
          <span>CircleCloseFilled</span>
        </div>
      </div>
    </div>

    <div class="icon-section">
      <h3>📄 文件/文档类</h3>
      <div class="icon-grid">
        <div class="icon-item" @click="copyName('Document')">
          <el-icon :size="28"><Document /></el-icon>
          <span>Document</span>
        </div>
        <div class="icon-item" @click="copyName('DocumentCopy')">
          <el-icon :size="28"><DocumentCopy /></el-icon>
          <span>DocumentCopy</span>
        </div>
        <div class="icon-item" @click="copyName('Tickets')">
          <el-icon :size="28"><Tickets /></el-icon>
          <span>Tickets</span>
        </div>
        <div class="icon-item" @click="copyName('Folder')">
          <el-icon :size="28"><Folder /></el-icon>
          <span>Folder</span>
        </div>
        <div class="icon-item" @click="copyName('FolderOpened')">
          <el-icon :size="28"><FolderOpened /></el-icon>
          <span>FolderOpened</span>
        </div>
        <div class="icon-item" @click="copyName('Files')">
          <el-icon :size="28"><Files /></el-icon>
          <span>Files</span>
        </div>
        <div class="icon-item" @click="copyName('Reading')">
          <el-icon :size="28"><Reading /></el-icon>
          <span>Reading</span>
        </div>
        <div class="icon-item" @click="copyName('List')">
          <el-icon :size="28"><List /></el-icon>
          <span>List</span>
        </div>
        <div class="icon-item" @click="copyName('Memo')">
          <el-icon :size="28"><Memo /></el-icon>
          <span>Memo</span>
        </div>
        <div class="icon-item" @click="copyName('Postcard')">
          <el-icon :size="28"><Postcard /></el-icon>
          <span>Postcard</span>
        </div>
      </div>
    </div>

    <div class="icon-section">
      <h3>↔️ 箭头/导航类</h3>
      <div class="icon-grid">
        <div class="icon-item" @click="copyName('ArrowRight')">
          <el-icon :size="28"><ArrowRight /></el-icon>
          <span>ArrowRight</span>
        </div>
        <div class="icon-item" @click="copyName('ArrowDown')">
          <el-icon :size="28"><ArrowDown /></el-icon>
          <span>ArrowDown</span>
        </div>
        <div class="icon-item" @click="copyName('DArrowRight')">
          <el-icon :size="28"><DArrowRight /></el-icon>
          <span>DArrowRight</span>
        </div>
        <div class="icon-item" @click="copyName('CaretRight')">
          <el-icon :size="28"><CaretRight /></el-icon>
          <span>CaretRight</span>
        </div>
        <div class="icon-item" @click="copyName('CaretBottom')">
          <el-icon :size="28"><CaretBottom /></el-icon>
          <span>CaretBottom</span>
        </div>
        <div class="icon-item" @click="copyName('Right')">
          <el-icon :size="28"><Right /></el-icon>
          <span>Right</span>
        </div>
        <div class="icon-item" @click="copyName('Back')">
          <el-icon :size="28"><Back /></el-icon>
          <span>Back</span>
        </div>
        <div class="icon-item" @click="copyName('More')">
          <el-icon :size="28"><More /></el-icon>
          <span>More</span>
        </div>
        <div class="icon-item" @click="copyName('MoreFilled')">
          <el-icon :size="28"><MoreFilled /></el-icon>
          <span>MoreFilled</span>
        </div>
      </div>
    </div>

    <div class="icon-section">
      <h3>🔍 操作类</h3>
      <div class="icon-grid">
        <div class="icon-item" @click="copyName('Search')">
          <el-icon :size="28"><Search /></el-icon>
          <span>Search</span>
        </div>
        <div class="icon-item" @click="copyName('Filter')">
          <el-icon :size="28"><Filter /></el-icon>
          <span>Filter</span>
        </div>
        <div class="icon-item" @click="copyName('Sort')">
          <el-icon :size="28"><Sort /></el-icon>
          <span>Sort</span>
        </div>
        <div class="icon-item" @click="copyName('Edit')">
          <el-icon :size="28"><Edit /></el-icon>
          <span>Edit</span>
        </div>
        <div class="icon-item" @click="copyName('EditPen')">
          <el-icon :size="28"><EditPen /></el-icon>
          <span>EditPen</span>
        </div>
        <div class="icon-item" @click="copyName('Delete')">
          <el-icon :size="28"><Delete /></el-icon>
          <span>Delete</span>
        </div>
        <div class="icon-item" @click="copyName('View')">
          <el-icon :size="28"><View /></el-icon>
          <span>View</span>
        </div>
        <div class="icon-item" @click="copyName('Refresh')">
          <el-icon :size="28"><Refresh /></el-icon>
          <span>Refresh</span>
        </div>
        <div class="icon-item" @click="copyName('Upload')">
          <el-icon :size="28"><Upload /></el-icon>
          <span>Upload</span>
        </div>
        <div class="icon-item" @click="copyName('Download')">
          <el-icon :size="28"><Download /></el-icon>
          <span>Download</span>
        </div>
        <div class="icon-item" @click="copyName('Share')">
          <el-icon :size="28"><Share /></el-icon>
          <span>Share</span>
        </div>
        <div class="icon-item" @click="copyName('Link')">
          <el-icon :size="28"><Link /></el-icon>
          <span>Link</span>
        </div>
        <div class="icon-item" @click="copyName('Pointer')">
          <el-icon :size="28"><Pointer /></el-icon>
          <span>Pointer</span>
        </div>
        <div class="icon-item" @click="copyName('ZoomIn')">
          <el-icon :size="28"><ZoomIn /></el-icon>
          <span>ZoomIn</span>
        </div>
        <div class="icon-item" @click="copyName('ZoomOut')">
          <el-icon :size="28"><ZoomOut /></el-icon>
          <span>ZoomOut</span>
        </div>
      </div>
    </div>

    <div class="icon-section">
      <h3>🧭 导航/系统类</h3>
      <div class="icon-grid">
        <div class="icon-item" @click="copyName('Menu')">
          <el-icon :size="28"><Menu /></el-icon>
          <span>Menu</span>
        </div>
        <div class="icon-item" @click="copyName('Bell')">
          <el-icon :size="28"><Bell /></el-icon>
          <span>Bell</span>
        </div>
        <div class="icon-item" @click="copyName('BellFilled')">
          <el-icon :size="28"><BellFilled /></el-icon>
          <span>BellFilled</span>
        </div>
        <div class="icon-item" @click="copyName('Message')">
          <el-icon :size="28"><Message /></el-icon>
          <span>Message</span>
        </div>
        <div class="icon-item" @click="copyName('Notification')">
          <el-icon :size="28"><Notification /></el-icon>
          <span>Notification</span>
        </div>
        <div class="icon-item" @click="copyName('User')">
          <el-icon :size="28"><User /></el-icon>
          <span>User</span>
        </div>
        <div class="icon-item" @click="copyName('UserFilled')">
          <el-icon :size="28"><UserFilled /></el-icon>
          <span>UserFilled</span>
        </div>
        <div class="icon-item" @click="copyName('Avatar')">
          <el-icon :size="28"><Avatar /></el-icon>
          <span>Avatar</span>
        </div>
        <div class="icon-item" @click="copyName('Compass')">
          <el-icon :size="28"><Compass /></el-icon>
          <span>Compass</span>
        </div>
        <div class="icon-item" @click="copyName('Key')">
          <el-icon :size="28"><Key /></el-icon>
          <span>Key</span>
        </div>
        <div class="icon-item" @click="copyName('Lock')">
          <el-icon :size="28"><Lock /></el-icon>
          <span>Lock</span>
        </div>
        <div class="icon-item" @click="copyName('Unlock')">
          <el-icon :size="28"><Unlock /></el-icon>
          <span>Unlock</span>
        </div>
      </div>
    </div>

    <div class="icon-section">
      <h3>⏰ 时间/天气类</h3>
      <div class="icon-grid">
        <div class="icon-item" @click="copyName('Timer')">
          <el-icon :size="28"><Timer /></el-icon>
          <span>Timer</span>
        </div>
        <div class="icon-item" @click="copyName('Clock')">
          <el-icon :size="28"><Clock /></el-icon>
          <span>Clock</span>
        </div>
        <div class="icon-item" @click="copyName('Calendar')">
          <el-icon :size="28"><Calendar /></el-icon>
          <span>Calendar</span>
        </div>
        <div class="icon-item" @click="copyName('Stopwatch')">
          <el-icon :size="28"><Stopwatch /></el-icon>
          <span>Stopwatch</span>
        </div>
        <div class="icon-item" @click="copyName('Sunny')">
          <el-icon :size="28"><Sunny /></el-icon>
          <span>Sunny</span>
        </div>
        <div class="icon-item" @click="copyName('Moon')">
          <el-icon :size="28"><Moon /></el-icon>
          <span>Moon</span>
        </div>
        <div class="icon-item" @click="copyName('Lightning')">
          <el-icon :size="28"><Lightning /></el-icon>
          <span>Lightning</span>
        </div>
        <div class="icon-item" @click="copyName('Sunrise')">
          <el-icon :size="28"><Sunrise /></el-icon>
          <span>Sunrise</span>
        </div>
        <div class="icon-item" @click="copyName('Sunset')">
          <el-icon :size="28"><Sunset /></el-icon>
          <span>Sunset</span>
        </div>
        <div class="icon-item" @click="copyName('Cloudy')">
          <el-icon :size="28"><Cloudy /></el-icon>
          <span>Cloudy</span>
        </div>
        <div class="icon-item" @click="copyName('Pouring')">
          <el-icon :size="28"><Pouring /></el-icon>
          <span>Pouring</span>
        </div>
        <div class="icon-item" @click="copyName('MostlyCloudy')">
          <el-icon :size="28"><MostlyCloudy /></el-icon>
          <span>MostlyCloudy</span>
        </div>
      </div>
    </div>

    <!-- 复制提示 -->
    <transition name="fade">
      <div v-if="showTip" class="copy-tip">
        已复制: {{ copiedName }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

// 引入 Element Plus 图标（全部从官方 UNPKG 验证存在）
import {
  // 一级导航
  Odometer, DataAnalysis, DataBoard, TrendCharts, PieChart, Histogram, DataLine, Monitor,
  House, HomeFilled, OfficeBuilding, Sunny, WindPower, LocationInformation, MapLocation,
  Tools, Setting, Operation, Management, SetUp,
  Cpu, ChatDotRound, ChatRound, MagicStick, Guide, Connection, Aim, Opportunity,
  Money, Coin, Wallet, Tickets, Ticket, Discount, PriceTag, CreditCard,
  
  // 告警状态
  Warning, WarningFilled, CircleCheck, CircleClose, SuccessFilled, InfoFilled,
  Failed, CircleCheckFilled, CircleCloseFilled,
  
  // 文件文档
  Document, DocumentCopy, Folder, FolderOpened, Files, Reading, List, Memo, Postcard,
  
  // 箭头导航
  ArrowRight, ArrowDown, DArrowRight, CaretRight, CaretBottom, Right, Back, More, MoreFilled,
  
  // 操作
  Search, Filter, Sort, Edit, EditPen, Delete, View,
  Refresh, Upload, Download, Share, Link, Pointer, ZoomIn, ZoomOut,
  
  // 导航系统
  Menu, Bell, BellFilled, Message, Notification, User, UserFilled, Avatar,
  Compass, Key, Lock, Unlock,
  
  // 时间天气
  Timer, Clock, Calendar, Stopwatch, Moon, Lightning, Sunrise, Sunset,
  Cloudy, Pouring, MostlyCloudy
} from '@element-plus/icons-vue'

const showTip = ref(false)
const copiedName = ref('')

const copyName = (name) => {
  navigator.clipboard.writeText(name).then(() => {
    copiedName.value = name
    showTip.value = true
    ElMessage.success(`已复制: ${name}`)
    setTimeout(() => {
      showTip.value = false
    }, 1500)
  })
}
</script>

<style scoped>
.icons-demo {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.icons-demo h2 {
  text-align: center;
  color: #303133;
  margin-bottom: 8px;
}

.tip {
  text-align: center;
  color: #909399;
  font-size: 14px;
  margin-bottom: 32px;
}

.tip a {
  color: #409EFF;
  text-decoration: none;
}

.tip a:hover {
  text-decoration: underline;
}

.icon-section {
  margin-bottom: 40px;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.icon-section h3 {
  color: #409EFF;
  font-size: 16px;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px dashed #E4E7ED;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #F5F7FA;
}

.icon-item:hover {
  background: #ECF5FF;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}

.icon-item span {
  margin-top: 8px;
  font-size: 12px;
  color: #606266;
  text-align: center;
  word-break: break-all;
}

.copy-tip {
  position: fixed;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  background: #303133;
  color: #fff;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```