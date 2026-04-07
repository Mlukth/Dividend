<template>
  <div class="archive-page-wrapper">
    <!-- 1. 顶部标题区 -->
    <div class="page-header">
      <div class="header-left">
        <div class="title-group">
          <span class="title-icon">📁</span>
          <h1 class="page-title">电站档案信息</h1>
        </div>
        <el-breadcrumb separator="/" class="breadcrumb">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>基本信息</el-breadcrumb-item>
          <el-breadcrumb-item>电站档案信息</el-breadcrumb-item>
        </el-breadcrumb>
        <div class="title-decoration-line"></div>
      </div>
      <div class="header-right">
        <el-button class="action-btn" :icon="Printer">打印预览</el-button>
        <el-button type="primary" class="action-btn primary-btn" :icon="Download">导出档案</el-button>
      </div>
    </div>

    <!-- 2. 电站概要信息模块 -->
    <el-card class="module-card summary-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="card-title">电站概要信息</span>
          <el-tag type="info" effect="dark">运行中</el-tag>
        </div>
      </template>

      <div class="summary-content">
        <!-- 左侧：可视化看板 -->
        <div class="summary-left">
          <div class="capacity-visual">
            <div class="gauge-container">
              <div class="gauge-circle">
                <div class="gauge-inner">
                  <div class="gauge-value">5000</div>
                  <div class="gauge-unit">kW</div>
                </div>
                <svg class="gauge-svg" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="54" fill="none" stroke="#E5E6EB" stroke-width="8" />
                  <circle cx="60" cy="60" r="54" fill="none" stroke="url(#blueGradient)" stroke-width="8" 
                          stroke-dasharray="339.292" stroke-dashoffset="169.646" 
                          stroke-linecap="round" transform="rotate(-90 60 60)" />
                  <defs>
                    <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stop-color="#0066CC" />
                      <stop offset="100%" stop-color="#165DFF" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div class="gauge-label">装机容量</div>
            </div>
            
            <div class="capacity-compare">
              <div class="compare-item">
                <span class="compare-label">设计容量</span>
                <div class="compare-bar">
                  <div class="bar-fill design" style="width: 100%"></div>
                </div>
                <span class="compare-val">10000 kW</span>
              </div>
              <div class="compare-item">
                <span class="compare-label">运行容量</span>
                <div class="compare-bar">
                  <div class="bar-fill running" style="width: 50%"></div>
                </div>
                <span class="compare-val">5000 kW</span>
              </div>
            </div>
          </div>

          <!-- 时间轴 -->
          <div class="timeline-section">
            <div class="timeline-title">投运时间轴</div>
            <div class="timeline-line">
              <div class="timeline-node start">
                <div class="node-dot"></div>
                <div class="node-date">2023-06-15</div>
                <div class="node-label">投运日期</div>
              </div>
              <div class="timeline-track"></div>
              <div class="timeline-node milestone">
                <div class="node-dot"></div>
                <div class="node-date">2024-01-20</div>
                <div class="node-label">设备检修</div>
              </div>
              <div class="timeline-track"></div>
              <div class="timeline-node end active">
                <div class="node-dot"></div>
                <div class="node-date">至今</div>
                <div class="node-label highlight">已运行 638 天</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：基础属性网格 -->
        <div class="divider-vertical"></div>
        <div class="summary-right">
          <div class="attr-grid">
            <div class="attr-item">
              <div class="attr-icon">🏭</div>
              <div class="attr-info">
                <div class="attr-label">电站名称</div>
                <div class="attr-value name">赣州兴国县光伏电站</div>
              </div>
            </div>
            <div class="attr-item">
              <div class="attr-icon">📍</div>
              <div class="attr-info">
                <div class="attr-label">电站位置</div>
                <div class="attr-value">
                  江西省赣州市兴国县
                  <el-link type="primary" :underline="false" style="margin-left: 8px; font-size: 12px;">查看地图</el-link>
                </div>
              </div>
            </div>
            <div class="attr-item">
              <div class="attr-icon">☀️</div>
              <div class="attr-info">
                <div class="attr-label">电站类型</div>
                <div class="attr-value"><el-tag type="primary" size="small" effect="light">地面光伏</el-tag></div>
              </div>
            </div>
            <div class="attr-item">
              <div class="attr-icon">🔌</div>
              <div class="attr-info">
                <div class="attr-label">并网电压等级</div>
                <div class="attr-value">
                  <div class="voltage-bar">
                    <div class="v-bar" style="height: 60%"></div>
                    <span class="v-text">10kV</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="attr-item">
              <div class="attr-icon">🌤️</div>
              <div class="attr-info">
                <div class="attr-label">气候区域</div>
                <div class="attr-value">亚热带季风气候</div>
              </div>
            </div>
            <div class="attr-item">
              <div class="attr-icon">🏗️</div>
              <div class="attr-info">
                <div class="attr-label">土地性质</div>
                <div class="attr-value">未利用地</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 3. 设备台账模块 -->
    <el-card class="module-card" shadow="hover">
      <template #header>
        <div class="card-header with-actions">
          <span class="card-title">设备台账</span>
          <div class="header-toolbar">
            <div class="toolbar-left">
              <el-input v-model="deviceSearch" placeholder="搜索设备型号/名称" prefix-icon="Search" style="width: 240px" class="search-input" />
              <el-select v-model="deviceTypeFilter" placeholder="设备类型" clearable style="width: 140px; margin-left: 12px;">
                <el-option label="全部" value="" />
                <el-option label="逆变器" value="inverter" />
                <el-option label="光伏板" value="panel" />
                <el-option label="支架" value="support" />
              </el-select>
            </div>
            <el-button type="primary" class="primary-btn" :icon="Plus">新增设备</el-button>
          </div>
        </div>
      </template>

      <el-table :data="filteredDevices" style="width: 100%" class="custom-table" stripe>
        <el-table-column prop="type" label="设备类型" width="140">
          <template #default="{ row }">
            <div class="cell-with-icon">
              <span class="device-icon">{{ row.typeIcon }}</span>
              <span>{{ row.type }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="model" label="型号" />
        <el-table-column prop="quantity" label="数量" width="120">
          <template #default="{ row }">
            <div class="quantity-cell">
              <span class="qty-num">{{ row.quantity }}</span>
              <div class="qty-bar-wrap">
                <div class="qty-bar" :style="{ width: (row.quantity / 100 * 100) + '%' }"></div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="params" label="核心参数" min-width="200">
          <template #default="{ row }">
            <div class="params-tags">
              <el-tag v-for="(tag, idx) in row.params.slice(0, 3)" :key="idx" size="small" class="param-tag">{{ tag }}</el-tag>
              <el-tag v-if="row.params.length > 3" size="small" class="param-tag more">+{{ row.params.length - 3 }}</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="manufacturer" label="生产厂家" />
        <el-table-column prop="installDate" label="安装日期" width="120">
          <template #default="{ row }">
            <span :class="{ 'recent': row.isRecent }">{{ row.installDate }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default>
            <el-link type="primary" :underline="false">查看详情</el-link>
            <el-divider direction="vertical" />
            <el-link type="info" :underline="false">编辑</el-link>
            <el-divider direction="vertical" />
            <el-link type="danger" :underline="false">删除</el-link>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 表格底部统计 -->
      <div class="table-footer">
        <div class="stats-row">
          <div class="stat-item">
            <span class="stat-label">设备总数：</span>
            <span class="stat-val">1,245 台</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">在线率：</span>
            <div class="mini-ring">
              <svg width="20" height="20" viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="8" fill="none" stroke="#E5E6EB" stroke-width="2"/>
                <circle cx="10" cy="10" r="8" fill="none" stroke="#23C343" stroke-width="2" 
                        stroke-dasharray="50.265" stroke-dashoffset="5.026" transform="rotate(-90 10 10)"/>
              </svg>
            </div>
            <span class="stat-val success">98.5%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">待维护：</span>
            <span class="stat-val danger">12 台</span>
          </div>
        </div>
        <el-pagination layout="prev, pager, next" :total="100" />
      </div>
    </el-card>

    <!-- 4. 设计图纸模块 -->
    <el-card class="module-card" shadow="hover">
      <template #header>
        <div class="card-header with-actions">
          <div class="header-left-group">
            <span class="card-title">设计图纸</span>
            <el-radio-group v-model="viewMode" size="small" style="margin-left: 16px;">
              <el-radio-button value="table">列表视图</el-radio-button>
              <el-radio-button value="grid">瀑布流</el-radio-button>
            </el-radio-group>
          </div>
          <div class="header-toolbar">
            <div class="toolbar-left">
              <el-select v-model="docTypeFilter" placeholder="图纸类型" clearable style="width: 140px;">
                <el-option label="全部" value="" />
                <el-option label="电气原理图" value="elec" />
                <el-option label="平面布置图" value="layout" />
                <el-option label="结构施工图" value="struct" />
              </el-select>
            </div>
            <el-button style="margin-right: 8px;">版本历史</el-button>
            <el-button type="primary" class="primary-btn" :icon="Upload">上传新版本</el-button>
          </div>
        </div>
      </template>

      <!-- 视图：表格 -->
      <div v-if="viewMode === 'table'">
        <el-table :data="documents" style="width: 100%" class="custom-table">
          <el-table-column label="缩略图" width="140">
            <template #default="{ row }">
              <div class="thumb-wrap" @click="openPreview(row)">
                <div class="thumb-placeholder" :style="{ background: row.thumbBg }">
                  <span class="thumb-icon">📄</span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="图纸名称" />
          <el-table-column prop="type" label="图纸类型" />
          <el-table-column prop="version" label="版本号" width="100">
            <template #default="{ row }">
              <el-tag :type="row.isLatest ? 'success' : 'info'" size="small" effect="light">
                {{ row.version }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="updateDate" label="更新日期" width="120">
            <template #default="{ row }">
              <div class="date-cell">
                {{ row.updateDate }}
                <span v-if="row.isNew" class="new-badge">NEW</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right">
            <template #default>
              <el-link :underline="false" style="margin-right: 8px;"><el-icon><View /></el-icon> 预览</el-link>
              <el-link :underline="false"><el-icon><Download /></el-icon> 下载</el-link>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 视图：卡片瀑布流 -->
      <div v-else class="grid-view">
        <div v-for="(doc, idx) in documents" :key="idx" class="doc-card" @click="openPreview(doc)">
          <div class="doc-card-thumb" :style="{ background: doc.thumbBg }">
            <span class="thumb-icon-large">📊</span>
          </div>
          <div class="doc-card-info">
            <div class="doc-card-title">{{ doc.name }}</div>
            <div class="doc-card-meta">
              <span>{{ doc.type }}</span>
              <span class="dot">•</span>
              <span>{{ doc.version }}</span>
            </div>
            <div class="doc-card-footer">
              <span class="doc-date">{{ doc.updateDate }}</span>
              <div class="doc-actions">
                <el-button size="small" :icon="View" circle />
                <el-button size="small" :icon="Download" circle />
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 图纸预览弹窗 -->
    <el-dialog v-model="previewVisible" title="图纸预览" width="80%" top="5vh" class="preview-dialog">
      <div class="preview-content">
        <div class="preview-main">
          <div class="preview-img-placeholder">
            <span class="big-icon">🗺️</span>
            <p>图纸渲染区域（支持缩放、平移）</p>
          </div>
        </div>
        <div class="preview-sidebar">
          <h4>图纸信息</h4>
          <div class="info-row">
            <span class="label">名称：</span>
            <span>电气主接线图_v2.0.pdf</span>
          </div>
          <div class="info-row">
            <span class="label">版本：</span>
            <span>v2.0</span>
          </div>
          <div class="info-row">
            <span class="label">更新时间：</span>
            <span>2026-03-10</span>
          </div>
          <el-divider />
          <h4>版本历史</h4>
          <div class="simple-timeline">
            <div class="tl-item">
              <div class="tl-dot blue"></div>
              <div class="tl-content">
                <div class="tl-title">v2.0 (当前)</div>
                <div class="tl-time">2026-03-10</div>
              </div>
            </div>
            <div class="tl-item">
              <div class="tl-dot"></div>
              <div class="tl-content">
                <div class="tl-title">v1.9</div>
                <div class="tl-time">2025-11-22</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button>关闭</el-button>
        <el-button type="primary">下载原图</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Printer, Download, Plus, Upload, View, Search } from '@element-plus/icons-vue'

// --- 状态定义 ---
const deviceSearch = ref('')
const deviceTypeFilter = ref('')
const docTypeFilter = ref('')
const viewMode = ref('table')
const previewVisible = ref(false)

// --- 模拟数据 ---
const devices = ref([
  { 
    type: '逆变器', typeIcon: '🔄', model: 'SUN-50K-G', quantity: 50, 
    params: ['效率:98.6%', '功率:50kW', 'MPPT:12路'], 
    manufacturer: '阳光电源', installDate: '2023-06-10', isRecent: false 
  },
  { 
    type: '光伏板', typeIcon: '☀️', model: 'JAM72S30-550/MR', quantity: 10000, 
    params: ['功率:550W', '效率:21.3%', '尺寸:2278x1134mm'], 
    manufacturer: '晶澳太阳能', installDate: '2026-03-01', isRecent: true 
  },
  { 
    type: '支架', typeIcon: '🔩', model: 'HD-ZJ-01', quantity: 2400, 
    params: ['材质:镀锌钢', '倾角:35°', '高度:2.5m'], 
    manufacturer: '华为数字能源', installDate: '2023-05-20', isRecent: false 
  }
])

const documents = ref([
  { name: '电气主接线图', type: '电气原理图', version: 'v2.0', isLatest: true, updateDate: '2026-03-10', isNew: true, thumbBg: 'linear-gradient(135deg, #E0F2FF, #B3D8FF)' },
  { name: '总平面布置图', type: '平面布置图', version: 'v1.5', isLatest: true, updateDate: '2026-01-20', isNew: false, thumbBg: 'linear-gradient(135deg, #E8FFEA, #B3F2B8)' },
  { name: '基础结构施工图', type: '结构施工图', version: 'v1.0', isLatest: false, updateDate: '2023-04-15', isNew: false, thumbBg: 'linear-gradient(135deg, #FFF7E0, #FFE8A8)' }
])

// --- 计算属性 ---
const filteredDevices = computed(() => {
  // 简单模拟过滤逻辑
  return devices.value
})

// --- 方法 ---
const openPreview = (row) => {
  previewVisible.value = true
}
</script>

<style scoped>
/* 全局变量与重置 */
.archive-page-wrapper {
  background-color: #F5F7FA;
  min-height: calc(100vh - 80px); /* 假设顶部+左侧padding */
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #1D2129;
}

/* 1. 顶部标题区 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}
.header-left {
  display: flex;
  flex-direction: column;
}
.title-group {
  display: flex;
  align-items: center;
}
.title-icon {
  font-size: 24px;
  margin-right: 12px;
}
.page-title {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  color: #1D2129;
}
.breadcrumb {
  margin-top: 4px;
  font-size: 12px;
}
.title-decoration-line {
  height: 2px;
  width: 120px;
  background: linear-gradient(90deg, #0066CC, transparent);
  margin-top: 8px;
  border-radius: 1px;
}
.header-right {
  display: flex;
  gap: 12px;
}
.action-btn {
  border-radius: 8px;
}
.primary-btn {
  background: linear-gradient(90deg, #0066CC, #165DFF);
  border: none;
}

/* 2. 通用卡片样式 */
.module-card {
  border-radius: 12px;
  border: none;
  margin-bottom: 24px;
}
.module-card :deep(.el-card__header) {
  background: #fff;
  border-bottom: 1px solid #F5F7FA;
  padding: 16px 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.card-header.with-actions {
  flex-wrap: wrap;
  gap: 12px;
}
.header-left-group {
  display: flex;
  align-items: center;
}
.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1D2129;
}
.header-toolbar {
  display: flex;
  align-items: center;
}
.toolbar-left {
  display: flex;
  margin-right: 16px;
}

/* 概要卡片内容 */
.summary-content {
  display: flex;
  min-height: 320px;
}
.summary-left {
  flex: 0 0 60%;
  padding-right: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.divider-vertical {
  width: 1px;
  background-color: #F0F0F0;
}
.summary-right {
  flex: 1;
  padding-left: 20px;
  display: flex;
  align-items: center;
}

/* 仪表盘 */
.capacity-visual {
  display: flex;
  align-items: center;
  gap: 40px;
  margin-bottom: 30px;
}
.gauge-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.gauge-circle {
  position: relative;
  width: 120px;
  height: 120px;
}
.gauge-inner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}
.gauge-value {
  font-size: 24px;
  font-weight: 700;
  color: #0066CC;
}
.gauge-unit {
  font-size: 12px;
  color: #999;
}
.gauge-label {
  margin-top: 12px;
  font-size: 14px;
  color: #4E5969;
}
.gauge-svg {
  width: 100%;
  height: 100%;
}

/* 对比条 */
.capacity-compare {
  flex: 1;
}
.compare-item {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}
.compare-label {
  width: 80px;
  font-size: 14px;
  color: #666;
}
.compare-bar {
  flex: 1;
  height: 8px;
  background: #F5F7FA;
  border-radius: 4px;
  margin: 0 12px;
  overflow: hidden;
}
.bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 1s ease;
}
.bar-fill.design { background: #0066CC; }
.bar-fill.running { background: #23C343; }
.compare-val {
  width: 80px;
  text-align: right;
  font-size: 14px;
  font-weight: 500;
}

/* 时间轴 */
.timeline-section {
  background: #F9FAFB;
  padding: 16px;
  border-radius: 8px;
}
.timeline-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #4E5969;
}
.timeline-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}
.timeline-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 2;
  background: #F9FAFB;
  padding: 0 10px;
}
.node-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #E5E6EB;
  border: 2px solid #fff;
  box-shadow: 0 0 0 2px #E5E6EB;
}
.timeline-node.start .node-dot { background: #0066CC; box-shadow: 0 0 0 2px #CCE0FF; }
.timeline-node.end .node-dot { background: #23C343; box-shadow: 0 0 0 2px #CFF7D3; }
.timeline-node.milestone .node-dot { background: #FF7D00; box-shadow: 0 0 0 2px #FFE7CC; }
.node-date { font-size: 12px; color: #999; margin-top: 6px; }
.node-label { font-size: 12px; color: #666; margin-top: 2px; }
.node-label.highlight { color: #23C343; font-weight: 700; }
.timeline-track {
  flex: 1;
  height: 2px;
  background: #E5E6EB;
  z-index: 1;
  margin: 0 -10px; /* 穿透节点padding */
}

/* 属性网格 */
.attr-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  width: 100%;
}
.attr-item {
  display: flex;
  align-items: flex-start;
}
.attr-icon {
  font-size: 24px;
  margin-right: 12px;
  margin-top: 2px;
}
.attr-info {
  flex: 1;
}
.attr-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}
.attr-value {
  font-size: 14px;
  color: #1D2129;
  font-weight: 500;
}
.attr-value.name {
  font-size: 15px;
  color: #0066CC;
}

/* 电压柱 */
.voltage-bar {
  display: flex;
  align-items: flex-end;
  height: 40px;
}
.v-bar {
  width: 16px;
  background: linear-gradient(180deg, #0066CC, #165DFF);
  border-radius: 4px 4px 0 0;
  margin-right: 8px;
}
.v-text {
  font-weight: 700;
}

/* 表格样式 */
.custom-table {
  border-radius: 8px;
  overflow: hidden;
}
.custom-table :deep(.el-table__header th) {
  background-color: #EEF7FF;
  color: #0066CC;
  font-weight: 600;
}
.cell-with-icon {
  display: flex;
  align-items: center;
}
.device-icon {
  font-size: 18px;
  margin-right: 8px;
}
.quantity-cell {
  display: flex;
  align-items: center;
  width: 100%;
}
.qty-num {
  width: 30px;
  font-weight: 600;
}
.qty-bar-wrap {
  flex: 1;
  height: 6px;
  background: #F5F7FA;
  border-radius: 3px;
  overflow: hidden;
}
.qty-bar {
  height: 100%;
  background: linear-gradient(90deg, #0066CC, #165DFF);
  border-radius: 3px;
}
.params-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}
.param-tag {
  background: #F5F7FA;
  border: none;
  color: #4E5969;
}
.param-tag.more {
  background: #EEF7FF;
  color: #0066CC;
  cursor: pointer;
}
.recent {
  color: #0066CC;
  font-weight: 600;
}

/* 表格底部 */
.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #F5F7FA;
  margin-top: 16px;
}
.stats-row {
  display: flex;
  gap: 24px;
}
.stat-item {
  display: flex;
  align-items: center;
  font-size: 14px;
}
.stat-label { color: #666; }
.stat-val { font-weight: 600; margin-left: 4px; }
.stat-val.success { color: #23C343; }
.stat-val.danger { color: #F53F3F; }
.mini-ring { margin: 0 6px; }

/* 图纸缩略图 */
.thumb-wrap {
  cursor: pointer;
}
.thumb-placeholder {
  width: 100px;
  height: 60px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #E5E6EB;
}
.thumb-icon {
  font-size: 24px;
}
.date-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}
.new-badge {
  font-size: 10px;
  background: #F53F3F;
  color: #fff;
  padding: 0 4px;
  border-radius: 2px;
  line-height: 1.2;
}

/* 卡片视图 */
.grid-view {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}
.doc-card {
  border: 1px solid #F0F0F0;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
}
.doc-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  transform: translateY(-2px);
}
.doc-card-thumb {
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.thumb-icon-large {
  font-size: 48px;
  opacity: 0.6;
}
.doc-card-info {
  padding: 16px;
  background: #fff;
}
.doc-card-title {
  font-weight: 600;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.doc-card-meta {
  font-size: 12px;
  color: #999;
  margin-bottom: 12px;
}
.dot { margin: 0 6px; }
.doc-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.doc-date { font-size: 12px; color: #999; }

/* 预览弹窗 */
.preview-dialog :deep(.el-dialog__body) {
  padding: 0;
}
.preview-content {
  display: flex;
  height: 60vh;
}
.preview-main {
  flex: 1;
  background: #222;
  display: flex;
  align-items: center;
  justify-content: center;
}
.preview-img-placeholder {
  text-align: center;
  color: #666;
}
.big-icon {
  font-size: 64px;
  display: block;
  margin-bottom: 16px;
}
.preview-sidebar {
  width: 260px;
  background: #fff;
  padding: 20px;
  border-left: 1px solid #eee;
}
.preview-sidebar h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
}
.info-row {
  font-size: 13px;
  margin-bottom: 8px;
  display: flex;
}
.info-row .label {
  color: #999;
  width: 70px;
  flex-shrink: 0;
}
.simple-timeline {
  position: relative;
  padding-left: 16px;
}
.tl-item {
  position: relative;
  padding-bottom: 16px;
}
.tl-dot {
  position: absolute;
  left: -16px;
  top: 4px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #E5E6EB;
}
.tl-dot.blue { background: #0066CC; }
.tl-content {
  line-height: 1.2;
}
.tl-title {
  font-size: 13px;
  font-weight: 500;
}
.tl-time {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}
</style>