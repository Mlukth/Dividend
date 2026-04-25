<template>
  <div class="solis-inverter-page">
    <!-- 模拟顶部系统栏 (仅作视觉补全) -->
    <div class="mock-system-header">
      <div class="logo-area">
        <span class="logo-text">solis</span>
        <el-tag type="info" size="small" effect="plain" class="back-tag">返回旧版</el-tag>
      </div>
      <div class="user-area">
        <el-icon class="header-icon"><Bell /></el-icon>
        <el-icon class="header-icon"><Setting /></el-icon>
        <el-icon class="header-icon"><ShoppingCart /></el-icon>
        <div class="user-avatar"></div>
        <span class="user-name">惠州百财新能源科...</span>
        <el-icon><ArrowDown /></el-icon>
      </div>
    </div>

    <!-- 主体内容区 -->
    <div class="main-content">
      <!-- 左侧导航树 (模拟) -->
      <div class="left-sidebar">
        <div class="nav-item active">
          <el-icon><Odometer /></el-icon>
          <span>概览</span>
        </div>
        <div class="nav-item">
          <el-icon><Tools /></el-icon>
          <span>运维</span>
        </div>
        <div class="nav-item">
          <el-icon><TrendCharts /></el-icon>
          <span>报表</span>
        </div>
        <div class="nav-item">
          <el-icon><Service /></el-icon>
          <span>服务</span>
        </div>
        
        <div class="inverter-tree">
          <div class="tree-title">逆变器详情</div>
          <el-input v-model="searchText" placeholder="搜索名称/SN" size="small" class="tree-search" />
          <div class="tree-list">
            <div class="tree-item">10号楼11号逆变器</div>
            <div class="tree-item active">10号楼12号逆变器</div>
            <div class="tree-item">11号楼13号逆变器</div>
            <!-- 省略更多树节点 -->
          </div>
        </div>
      </div>

      <!-- 右侧详情主区域 -->
      <div class="right-detail-area">
        
        <!-- 1. 顶部标题与操作栏 -->
        <div class="detail-header">
          <div class="header-left">
            <h1 class="inverter-title">
              <span class="green-icon"><el-icon><Lightning /></el-icon></span>
              10号楼12号逆变器
              <el-tooltip content="设置" placement="top">
                <el-icon class="action-icon"><Setting /></el-icon>
              </el-tooltip>
              <el-tooltip content="关注" placement="top">
                <el-icon class="action-icon"><Star /></el-icon>
              </el-tooltip>
              <el-tooltip content="分享" placement="top">
                <el-icon class="action-icon"><Share /></el-icon>
              </el-tooltip>
            </h1>
            <div class="sub-meta">
              <span>电站ID: 248802</span>
              <span class="divider">|</span>
              <span>2026-04-16 17:35:51 1分钟前</span>
            </div>
          </div>
          
          <div class="header-right">
            <el-button type="primary" size="default" class="solis-btn-primary">逆变器控制</el-button>
            <el-button class="solis-btn-text">校准电量</el-button>
            <el-button class="solis-btn-text">操作日志</el-button>
            <el-button class="solis-btn-text danger">删除</el-button>
          </div>
        </div>

        <!-- 2. 基础信息卡片 -->
        <div class="info-card">
          <div class="info-card-inner">
            <!-- 左侧设备图 -->
            <div class="device-preview">
              <div class="img-placeholder">
                <!-- 这里用简单的SVG模拟设备图轮廓，实际项目替换为真实图片 -->
                <svg viewBox="0 0 100 160" class="device-svg">
                  <rect x="10" y="10" width="80" height="140" rx="5" fill="#f4f6f8" stroke="#e0e6ed"/>
                  <rect x="25" y="30" width="50" height="30" rx="2" fill="#dfe6ed"/>
                  <circle cx="50" cy="100" r="15" fill="#e0e6ed"/>
                </svg>
              </div>
              <div class="sn-text">SN:2011600258250257 <el-icon class="copy-icon"><DocumentCopy /></el-icon></div>
            </div>

            <!-- 右侧信息网格 (改为4列布局) -->
            <div class="info-grid-4col">
              <div class="field">
                <span class="label">型号：</span>
                <span class="val">1160</span>
              </div>
              <div class="field">
                <span class="label">机型：</span>
                <span class="val">G6-GC50K-PRO</span>
              </div>
              <div class="field">
                <span class="label">额定功率：</span>
                <span class="val">50kW</span>
              </div>
              <div class="field">
                <span class="label">所属电站：</span>
                <span class="val link">惠州百财新能源科技有限公司 <el-icon><Right /></el-icon></span>
              </div>
              
              <div class="field">
                <span class="label">质保状态：</span>
                <span class="val status-green">在保</span>
              </div>
              <div class="field">
                <span class="label">质保到期时间：</span>
                <span class="val">2030-11-29</span>
              </div>
              <div class="field">
                <span class="label">国家标准：</span>
                <span class="val link">GN-380L <el-icon><Right /></el-icon></span>
              </div>
              <div class="field">
                <span class="label">逆变器版本：</span>
                <span class="val">A8020C-030006</span>
              </div>

              <div class="field">
                <span class="label">AFO版本：</span>
                <span class="val">0000</span>
              </div>
              <div class="field">
                <span class="label">G100运行状态：</span>
                <span class="val">--</span>
              </div>
              <div class="field">
                <span class="label">AFO方案：</span>
                <span class="val">AFC10</span>
              </div>
              <div class="field">
                <span class="label">备注：</span>
                <span class="val val-edit">-- <el-icon><Edit /></el-icon></span>
              </div>
              
              <div class="field">
                <span class="label">地址：</span>
                <span class="val">1</span>
              </div>
              <!-- 补齐4列网格的空缺 -->
              <div class="field"></div>
              <div class="field"></div>
              <div class="field"></div>
            </div>
          </div>
        </div>

        <!-- 3. 实时数据与电气参数 (核心重构：左右布局) -->
        <div class="realtime-section">
          
          <!-- 左侧：实时信息概览 -->
          <div class="realtime-left-card">
            <div class="section-title">实时信息</div>
            
            <div class="kpi-wrapper">
              <div class="kpi-item">
                <div class="kpi-label">实时功率</div>
                <div class="kpi-value">0.57kW</div>
              </div>
              <div class="kpi-item">
                <div class="kpi-label">当日发电</div>
                <div class="kpi-value">184.4kWh</div>
              </div>
              <div class="kpi-item">
                <div class="kpi-label">日满发小时数</div>
                <div class="kpi-value">3.69h</div>
              </div>
              <div class="kpi-item">
                <div class="kpi-label">当月发电</div>
                <div class="kpi-value">2.114MWh</div>
              </div>
              <div class="kpi-item">
                <div class="kpi-label">报警信息</div>
                <div class="kpi-value status-normal">无报警</div>
              </div>
              <div class="kpi-item">
                <div class="kpi-label">当年发电</div>
                <div class="kpi-value">15.925MWh</div>
              </div>
              <div class="kpi-item full-width">
                <div class="kpi-label">IGBT温度 <el-tooltip content="最高可承受150℃" placement="top"><el-icon><InfoFilled /></el-icon></el-tooltip></div>
                <div class="kpi-value">52.5℃</div>
              </div>
              <div class="kpi-item">
                <div class="kpi-label">累计发电</div>
                <div class="kpi-value">25.387MWh</div>
              </div>
            </div>
          </div>

          <!-- 右侧：详细电气参数表格 -->
          <div class="realtime-right-tables">
            
            <!-- 直流侧 -->
            <div class="data-table-box">
              <div class="table-header-row">
                <span class="col-name">直流</span>
                <span class="col-v">电压(V)</span>
                <span class="col-i">电流(A)</span>
                <span class="col-p">功率(W)</span>
              </div>
              <div class="table-body">
                <div v-for="(item, idx) in dcData" :key="idx" class="table-row" :class="{'warning-row': isLowCurrent(item.current)}">
                  <span class="col-name">{{ item.name }}</span>
                  <span class="col-v">{{ item.voltage }}</span>
                  <span class="col-i" :class="{'danger-text': isLowCurrent(item.current)}">
                    {{ item.current }}
                    <el-tag v-if="isLowCurrent(item.current)" type="danger" size="small" effect="dark">低电流</el-tag>
                  </span>
                  <span class="col-p">{{ item.power }}</span>
                </div>
              </div>
            </div>

            <!-- 交流侧 -->
            <div class="data-table-box">
              <div class="table-header-row">
                <span class="col-name">交流</span>
                <span class="col-v">电压(V)</span>
                <span class="col-i">电流(A)</span>
                <span class="col-p">频率(Hz)</span>
              </div>
              <div class="table-body">
                <div v-for="(item, idx) in acData" :key="idx" class="table-row">
                  <span class="col-name">{{ item.name }}</span>
                  <span class="col-v">{{ item.voltage }}</span>
                  <span class="col-i">{{ item.current }}</span>
                  <span class="col-p">{{ item.freq }}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { 
  Lightning, Setting, Star, Share, Bell, ShoppingCart, ArrowDown, 
  Odometer, Tools, TrendCharts, Service, DocumentCopy, Right, Edit, InfoFilled
} from '@element-plus/icons-vue'

// 搜索文本
const searchText = ref('')

// 阈值配置
const lowCurrentThreshold = ref(0.15)

// 模拟数据
const dcData = ref([
  { name: 'PV1', voltage: 648.6, current: 0.1, power: 65 },
  { name: 'PV2', voltage: 648.6, current: 0, power: 0 },
  { name: 'PV3', voltage: 596.5, current: 0.1, power: 60 },
  { name: 'PV4', voltage: 596.5, current: 0, power: 0 },
  { name: 'PV5', voltage: 553.9, current: 0.1, power: 55 },
  { name: 'PV6', voltage: 553.9, current: 0, power: 0 },
  { name: 'PV7', voltage: 632.9, current: 0.2, power: 127 },
  { name: 'PV8', voltage: 632.9, current: 0, power: 0 },
  { name: 'MPPT1', voltage: 648.5, current: 0.1, power: 65 },
  { name: 'MPPT2', voltage: 596.6, current: 0.1, power: 60 },
])

const acData = ref([
  { name: 'L1', voltage: 255.9, current: 1.4, freq: 50.03 },
  { name: 'L2', voltage: 257.7, current: 1.2, freq: 50.03 },
  { name: 'L3', voltage: 255.3, current: 1.2, freq: 50.03 },
])

// 判定逻辑
const isLowCurrent = (val) => val <= lowCurrentThreshold.value
</script>

<style scoped lang="scss">
/* 全局重置与字体 */
.solis-inverter-page {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  background-color: #ffffff;
  height: 100vh;
  display: flex;
  flex-direction: column;
  color: #333;
  overflow: hidden;
}

/* 1. 顶部系统栏 */
.mock-system-header {
  height: 56px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  flex-shrink: 0;
  
  .logo-area {
    display: flex;
    align-items: center;
    gap: 16px;
    .logo-text {
      font-size: 20px;
      font-weight: 700;
      color: #333;
      letter-spacing: 1px;
    }
    .back-tag {
      border-radius: 4px;
    }
  }
  
  .user-area {
    display: flex;
    align-items: center;
    gap: 20px;
    color: #666;
    .header-icon {
      font-size: 18px;
      cursor: pointer;
      &:hover { color: #409eff; }
    }
    .user-avatar {
      width: 28px;
      height: 28px;
      background: #dcdfe6;
      border-radius: 50%;
    }
    .user-name {
      font-size: 14px;
    }
  }
}

/* 2. 主体内容 */
.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 左侧导航 */
.left-sidebar {
  width: 240px;
  background: #fff;
  border-right: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
  
  .nav-item {
    height: 50px;
    display: flex;
    align-items: center;
    padding: 0 24px;
    font-size: 14px;
    color: #666;
    cursor: pointer;
    gap: 10px;
    &.active {
      background: #f0f9ff;
      color: #409eff;
      border-right: 2px solid #409eff;
    }
  }
  
  .inverter-tree {
    flex: 1;
    padding: 16px;
    border-top: 1px solid #eee;
    .tree-title {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 12px;
      padding-left: 4px;
    }
    .tree-search {
      margin-bottom: 12px;
    }
    .tree-list {
      overflow-y: auto;
      .tree-item {
        padding: 8px 4px;
        font-size: 13px;
        color: #666;
        cursor: pointer;
        border-radius: 4px;
        margin-bottom: 2px;
        &.active {
          background: #e6f7ff;
          color: #409eff;
        }
        &:hover {
          background: #f5f7fa;
        }
      }
    }
  }
}

/* 右侧详情区 */
.right-detail-area {
  flex: 1;
  background: #f7f8fa;
  padding: 20px 24px;
  overflow-y: auto;
}

/* 3. 详情头部 */
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  
  .header-left {
    .inverter-title {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
      display: flex;
      align-items: center;
      gap: 8px;
      
      .green-icon {
        color: #67c23a;
        display: flex;
        font-size: 20px;
      }
      
      .action-icon {
        margin-left: 12px;
        color: #999;
        font-size: 16px;
        cursor: pointer;
        &:hover { color: #409eff; }
      }
    }
    
    .sub-meta {
      font-size: 13px;
      color: #999;
      margin-top: 6px;
      .divider { margin: 0 8px; color: #ddd; }
    }
  }
  
  .header-right {
    display: flex;
    gap: 8px;
    .solis-btn-primary {
      background: #409eff;
      border-color: #409eff;
      border-radius: 4px;
      font-size: 14px;
    }
    .solis-btn-text {
      background: #fff;
      border: 1px solid #dcdfe6;
      color: #666;
      font-size: 14px;
      &:hover { color: #409eff; border-color: #c6e2ff; }
      &.danger { 
        color: #f56c6c; 
        border: none; 
        background: transparent;
        &:hover { color: #f78989; }
      }
    }
  }
}

/* 4. 基础信息卡片 */
.info-card {
  background: #fff;
  border-radius: 4px;
  border: 1px solid #ebeef5;
  padding: 20px;
  margin-bottom: 16px;
  
  .info-card-inner {
    display: flex;
    gap: 40px;
  }
  
  .device-preview {
    width: 140px;
    text-align: center;
    flex-shrink: 0;
    .img-placeholder {
      margin-bottom: 8px;
      .device-svg {
        width: 100px;
        height: 160px;
      }
    }
    .sn-text {
      font-size: 12px;
      color: #666;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      .copy-icon { cursor: pointer; }
    }
  }
  
  .info-grid-4col {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px 8px;
    align-items: start;
    
    .field {
      font-size: 13px;
      line-height: 20px;
      white-space: nowrap;
      .label { color: #999; margin-right: 4px; }
      .val { color: #333; }
      .val.link { color: #409eff; cursor: pointer; display: inline-flex; align-items: center; }
      .val-edit { color: #409eff; cursor: pointer; }
      .status-green { color: #67c23a; font-weight: 500; }
    }
  }
}

/* 5. 实时数据区域 (核心布局) */
.realtime-section {
  display: flex;
  gap: 16px;
}

/* 左侧实时信息卡片 */
.realtime-left-card {
  width: 420px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 16px 20px;
  flex-shrink: 0;
  
  .section-title {
    font-size: 15px;
    font-weight: 600;
    color: #333;
    margin-bottom: 20px;
  }
  
  .kpi-wrapper {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px 10px;
    
    .kpi-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
      &.full-width { grid-column: span 2; }
      
      .kpi-label {
        font-size: 13px;
        color: #666;
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .kpi-value {
        font-size: 16px;
        font-weight: 600;
        color: #333;
        &.status-normal { color: #67c23a; font-weight: 500; font-size: 14px; }
      }
    }
  }
}

/* 右侧表格区域 */
.realtime-right-tables {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.data-table-box {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  font-size: 13px;
  
  .table-header-row {
    display: grid;
    grid-template-columns: 100px 120px 180px 1fr;
    padding: 12px 16px;
    background: #fafafa;
    border-bottom: 1px solid #ebeef5;
    font-weight: 500;
    color: #333;
  }
  
  .table-body {
    max-height: 300px;
    overflow-y: auto;
    
    .table-row {
      display: grid;
      grid-template-columns: 100px 120px 180px 1fr;
      padding: 10px 16px;
      border-bottom: 1px solid #f5f7fa;
      color: #333;
      transition: background 0.2s;
      &:last-child { border-bottom: none; }
      &:hover { background: #f5f7fa; }
      &.warning-row { background: #fef0f0; }
      
      .col-i {
        display: flex;
        align-items: center;
        gap: 8px;
        &.danger-text { color: #f56c6c; font-weight: 600; }
      }
    }
  }
}
</style>