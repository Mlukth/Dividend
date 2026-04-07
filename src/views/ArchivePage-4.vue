<template>
  <div class="archive-page-wrapper">
    <!-- 1. 顶部标题区已移除（原“📁 电站档案信息 首页 / 基本信息 / 电站档案信息”不再显示）-->

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
                  <div class="gauge-value">{{ stationData.capacity }}</div>
                  <div class="gauge-unit">kW</div>
                </div>
                <svg class="gauge-svg" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="54" fill="none" stroke="#E5E6EB" stroke-width="8" />
                  <circle cx="60" cy="60" r="54" fill="none" stroke="url(#blueGradient)" stroke-width="8" 
                          stroke-dasharray="339.292" :stroke-dashoffset="gaugeOffset" 
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
                <span class="compare-val">{{ stationData.capacity }} kW</span>
              </div>
              <div class="compare-item">
                <span class="compare-label">当前并网</span>
                <div class="compare-bar">
                  <div class="bar-fill running" style="width: 100%"></div>
                </div>
                <span class="compare-val">{{ stationData.capacity }} kW</span>
              </div>
            </div>
          </div>

          <!-- 时间轴 -->
          <div class="timeline-section">
            <div class="timeline-title">投运时间轴</div>
            <div class="timeline-line">
              <div class="timeline-node start">
                <div class="node-dot"></div>
                <div class="node-date">{{ stationData.operationDate }}</div>
                <div class="node-label">投运日期</div>
              </div>
              <div class="timeline-track"></div>
              <div class="timeline-node milestone">
                <div class="node-dot"></div>
                <div class="node-date">2024-01-20</div>
                <div class="node-label">年度检修</div>
              </div>
              <div class="timeline-track"></div>
              <div class="timeline-node end active">
                <div class="node-dot"></div>
                <div class="node-date">至今</div>
                <div class="node-label highlight">已运行 {{ daysOfOperation }} 天</div>
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
                <div class="attr-value name">{{ stationData.name }}</div>
              </div>
            </div>
            <div class="attr-item">
              <div class="attr-icon">📍</div>
              <div class="attr-info">
                <div class="attr-label">电站位置</div>
                <div class="attr-value">
                  {{ stationData.location }}
                  <el-link type="primary" :underline="false" style="margin-left: 8px; font-size: 12px;" @click="mapModalVisible = true">查看地图</el-link>
                </div>
              </div>
            </div>
            <div class="attr-item">
              <div class="attr-icon">☀️</div>
              <div class="attr-info">
                <div class="attr-label">电站类型</div>
                <div class="attr-value"><el-tag type="primary" size="small" effect="light">{{ stationData.type }}</el-tag></div>
              </div>
            </div>
            <div class="attr-item">
              <div class="attr-icon">🔌</div>
              <div class="attr-info">
                <div class="attr-label">并网电压等级</div>
                <div class="attr-value">
                  <!-- 移除了蓝色柱子，仅保留电压数值 -->
                  <span class="v-text">{{ stationData.gridVoltage }}kV</span>
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
                <div class="attr-label">建设单位</div>
                <div class="attr-value">国家电投集团</div>
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
                <el-option label="逆变器" value="逆变器" />
                <el-option label="光伏组件" value="光伏组件" />
                <el-option label="支架" value="支架" />
              </el-select>
            </div>
            <el-button type="primary" class="primary-btn" :icon="Plus">新增设备</el-button>
          </div>
        </div>
      </template>

      <el-table :data="filteredDevices" style="width: 100%" class="custom-table" stripe>
        <el-table-column prop="stationName" label="所属电站" width="140" />
        <el-table-column prop="type" label="设备类型" width="140">
          <template #default="{ row }">
            <div class="cell-with-icon">
              <span class="device-icon">{{ row.typeIcon }}</span>
              <span>{{ row.type }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="model" label="型号" />
        <el-table-column prop="quantity" label="数量" width="140">
          <template #default="{ row }">
            <div class="quantity-cell">
              <span class="qty-num">{{ row.quantity }}</span>
              <div class="qty-bar-wrap">
                <div class="qty-bar" :style="{ width: Math.min(100, (row.quantity / 200) * 100) + '%' }"></div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="coreParams" label="核心参数" min-width="200">
          <template #default="{ row }">
            <div class="params-tags">
              <el-tag v-for="(tag, idx) in row.params" :key="idx" size="small" class="param-tag">{{ tag }}</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="manufacturer" label="生产厂家" show-overflow-tooltip />
        <el-table-column prop="installDate" label="安装日期" width="120">
          <template #default="{ row }">
            <span :class="{ 'recent': row.isRecent }">{{ row.installDate }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-link type="primary" :underline="false" @click="viewDeviceDetail(row)">查看详情</el-link>
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
            <span class="stat-val">{{ totalDevices }} 台</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">在线率：</span>
            <div class="mini-ring">
              <svg width="20" height="20" viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="8" fill="none" stroke="#E5E6EB" stroke-width="2"/>
                <circle cx="10" cy="10" r="8" fill="none" stroke="#23C343" stroke-width="2" 
                        stroke-dasharray="50.265" stroke-dashoffset="2.5" transform="rotate(-90 10 10)"/>
              </svg>
            </div>
            <span class="stat-val success">95.2%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">待维护：</span>
            <span class="stat-val danger">3 台</span>
          </div>
        </div>
        <el-pagination layout="prev, pager, next" :total="filteredDevices.length" />
      </div>
    </el-card>

    <!-- 4. 设计图纸模块（融合优化版） -->
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
              <el-select v-model="filterType" placeholder="图纸类型" clearable style="width: 140px; margin-right: 12px;">
                <el-option label="全部" value="" />
                <el-option label="电气主接线图" value="电气主接线图" />
                <el-option label="总平面布置图" value="总平面布置图" />
                <el-option label="设备基础图" value="设备基础图" />
                <el-option label="接地网图" value="接地网图" />
              </el-select>
              <el-checkbox v-model="filterLatest">仅显示最新版本</el-checkbox>
            </div>
            <el-button style="margin-right: 8px;">版本历史</el-button>
            <el-button type="primary" class="primary-btn" :icon="Upload">上传新版本</el-button>
          </div>
        </div>
      </template>

      <!-- 视图：表格 -->
      <div v-if="viewMode === 'table'">
        <el-table :data="filteredDrawings" style="width: 100%" class="custom-table">
          <el-table-column label="缩略图" width="100">
            <template #default="{ row }">
              <div class="thumb-wrap" @click="openPreview(row)">
                <div class="thumb-placeholder" :style="{ background: row.thumbBg || '#EEF7FF' }">
                  <span class="thumb-icon">{{ row.icon }}</span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="图纸名称" />
          <el-table-column prop="type" label="图纸类型" />
          <el-table-column prop="code" label="图纸编号" />
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
                <span v-if="row.isLatest" class="new-badge">LATEST</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="{ row }">
              <el-link :underline="false" style="margin-right: 8px;" @click="openPreview(row)">
                <el-icon><View /></el-icon> 预览
              </el-link>
              <el-link :underline="false" @click="downloadDrawing(row)">
                <el-icon><Download /></el-icon> 下载
              </el-link>
              <el-divider direction="vertical" />
              <el-link :underline="false" @click="showHistory(row)">历史</el-link>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 视图：卡片瀑布流（增强版） -->
      <div v-else class="grid-view">
        <div v-for="(doc, idx) in filteredDrawings" :key="idx" class="doc-card" @click="openPreview(doc)">
          <div class="doc-card-thumb" :style="{ background: doc.thumbBg || 'linear-gradient(135deg, #EEF7FF, #E6F4FF)' }">
            <span class="thumb-icon-large">{{ doc.icon }}</span>
            <div v-if="doc.isLatest" class="latest-badge">LATEST</div>
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
                <el-button size="small" :icon="View" circle @click.stop="openPreview(doc)" />
                <el-button size="small" :icon="Download" circle @click.stop="downloadDrawing(doc)" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 地图弹窗 -->
    <el-dialog v-model="mapModalVisible" title="电站地理位置" width="60%" top="5vh">
      <div class="map-modal-content">
        <div class="map-large-placeholder">
          <el-icon :size="80" color="#ccc"><Location /></el-icon>
          <p>地图组件加载中...</p>
          <p class="sub-text">(此处接入百度/高德地图API)</p>
        </div>
      </div>
      <template #footer>
        <el-button @click="mapModalVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 图纸预览弹窗（增强版） -->
    <el-dialog v-model="previewVisible" :title="currentDrawing?.name" width="80%" top="5vh" class="preview-dialog">
      <div class="preview-content">
        <div class="preview-main">
          <div class="preview-img-placeholder">
            <span class="big-icon">{{ currentDrawing?.icon }}</span>
            <p>图纸渲染区域（支持缩放、平移）</p>
          </div>
        </div>
        <div class="preview-sidebar">
          <h4>图纸信息</h4>
          <div class="info-row">
            <span class="label">图纸编号：</span>
            <span>{{ currentDrawing?.code }}</span>
          </div>
          <div class="info-row">
            <span class="label">版本号：</span>
            <span>
              {{ currentDrawing?.version }}
              <el-tag v-if="currentDrawing?.isLatest" type="danger" size="small" style="margin-left: 8px;">最新</el-tag>
            </span>
          </div>
          <div class="info-row">
            <span class="label">类型：</span>
            <span>{{ currentDrawing?.type }}</span>
          </div>
          <div class="info-row">
            <span class="label">更新日期：</span>
            <span>{{ currentDrawing?.updateDate }}</span>
          </div>
          <el-divider />
          <h4>版本历史</h4>
          <div class="simple-timeline">
            <div class="tl-item">
              <div class="tl-dot blue"></div>
              <div class="tl-content">
                <div class="tl-title">{{ currentDrawing?.version }} (当前)</div>
                <div class="tl-time">{{ currentDrawing?.updateDate }}</div>
              </div>
            </div>
            <div class="tl-item">
              <div class="tl-dot"></div>
              <div class="tl-content">
                <div class="tl-title">v1.0 (归档)</div>
                <div class="tl-time">2023-04-15</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="previewVisible = false">关闭</el-button>
        <el-button type="primary" @click="downloadDrawing(currentDrawing)">下载原图</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Printer, Download, Plus, Upload, View, Search, Location } from '@element-plus/icons-vue'

// --- 状态定义 ---
const deviceSearch = ref('')
const deviceTypeFilter = ref('')
const viewMode = ref('grid') // 默认瀑布流视图
const previewVisible = ref(false)
const mapModalVisible = ref(false)
const currentDrawing = ref(null)

// --- 新增筛选状态 ---
const filterType = ref('')
const filterLatest = ref(false)

// --- 模拟数据 (扩充设计图纸字段) ---
const stationData = ref({
  name: '赣州瑞金市叶坪镇100MW光伏电站',
  location: '江西省赣州市瑞金市叶坪镇',
  capacity: 100000,
  operationDate: '2023-06-15',
  type: '地面光伏电站',
  gridVoltage: 110
})

const deviceList = ref([
  { 
    stationName: '瑞金叶坪电站', 
    type: '逆变器', 
    typeIcon: '🔄', 
    model: 'SUN2000-100KTL-M0', 
    quantity: 1000, 
    params: ['效率:98.6%', 'Max:1100V', '12路MPPT'], 
    coreParams: '此处省略详细参数',
    manufacturer: '华为技术有限公司', 
    installDate: '2023-03-10', 
    isRecent: false 
  },
  { 
    stationName: '瑞金叶坪电站', 
    type: '光伏组件', 
    typeIcon: '☀️', 
    model: 'JAM72S30-550/MR', 
    quantity: 181820, 
    params: ['功率:550W', '效率:21.3%', '单晶硅'], 
    coreParams: '此处省略详细参数',
    manufacturer: '晶澳太阳能科技股份有限公司', 
    installDate: '2023-02-20', 
    isRecent: false 
  },
  { 
    stationName: '瑞金叶坪电站', 
    type: '支架', 
    typeIcon: '🔩', 
    model: 'ZT-001', 
    quantity: 45455, 
    params: ['镀锌铝镁', '倾角:25°', '固定可调'], 
    coreParams: '此处省略详细参数',
    manufacturer: '江苏中信博新能源', 
    installDate: '2023-01-15', 
    isRecent: false 
  }
])

// 设计图纸数据（合并了原两个来源的字段）
const drawings = ref([
  { 
    stationName: '赣州瑞金光伏电站',
    name: '110kV升压站主接线', 
    type: '电气主接线图', 
    code: 'GR-PV-ELE-001', 
    version: 'v2.1', 
    updateDate: '2024-01-10', 
    icon: '📐', 
    isLatest: true,
    thumbBg: 'linear-gradient(135deg, #E0F2FF, #B3D8FF)'
  },
  { 
    stationName: '赣州瑞金光伏电站',
    name: '电站总平面规划', 
    type: '总平面布置图', 
    code: 'GR-PV-GEO-001', 
    version: 'v1.5', 
    updateDate: '2023-11-22', 
    icon: '🗺️', 
    isLatest: false,
    thumbBg: 'linear-gradient(135deg, #E8FFEA, #B3F2B8)'
  },
  { 
    stationName: '赣州瑞金光伏电站',
    name: '逆变器基础施工图', 
    type: '设备基础图', 
    code: 'GR-PV-STR-005', 
    version: 'v3.0', 
    updateDate: '2024-02-01', 
    icon: '🏗️', 
    isLatest: true,
    thumbBg: 'linear-gradient(135deg, #FFF7E0, #FFE8A8)'
  },
  { 
    stationName: '赣州瑞金光伏电站',
    name: '全站接地系统', 
    type: '接地网图', 
    code: 'GR-PV-GRD-002', 
    version: 'v1.0', 
    updateDate: '2023-01-15', 
    icon: '⚡', 
    isLatest: false,
    thumbBg: 'linear-gradient(135deg, #F0E6FF, #D9C2FF)'
  }
])

// --- 计算属性 ---
const daysOfOperation = computed(() => {
  const start = new Date(stationData.value.operationDate)
  const now = new Date()
  const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24))
  return diff
})

const gaugeOffset = computed(() => {
  // SVG圆周长 2*PI*54 ≈ 339.292
  // 这里显示80%
  return 339.292 * 0.2
})

// voltageHeight 计算属性已不再使用，可保留但无影响，也可删除

const totalDevices = computed(() => {
  return deviceList.value.reduce((sum, item) => sum + item.quantity, 0)
})

const filteredDevices = computed(() => {
  return deviceList.value.filter(item => {
    const matchSearch = !deviceSearch.value || item.model.includes(deviceSearch.value) || item.manufacturer.includes(deviceSearch.value)
    const matchType = !deviceTypeFilter.value || item.type === deviceTypeFilter.value
    return matchSearch && matchType
  })
})

// 设计图纸筛选
const filteredDrawings = computed(() => {
  return drawings.value.filter(drawing => {
    const matchType = !filterType.value || drawing.type === filterType.value
    const matchLatest = !filterLatest.value || drawing.isLatest
    return matchType && matchLatest
  })
})

// --- 方法 ---
const viewDeviceDetail = (row) => {
  ElMessageBox.alert(`
    <strong>设备型号:</strong> ${row.model}<br/>
    <strong>核心参数:</strong> ${row.coreParams}<br/>
    <strong>厂家:</strong> ${row.manufacturer}
  `, '设备详情', {
    dangerouslyUseHTMLString: true,
    confirmButtonText: '关闭'
  })
}

const openPreview = (row) => {
  currentDrawing.value = row
  previewVisible.value = true
}

const downloadDrawing = (row) => {
  if(!row) return
  ElMessage.success(`正在下载: ${row.name}_${row.version}.pdf`)
}

const showHistory = (row) => {
  ElMessage.info(`查看 ${row.name} 的历史版本`)
}
</script>

<style scoped>
/* 全局变量与重置 */
.archive-page-wrapper {
  background-color: #F5F7FA;
  min-height: calc(100vh - 80px);
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #1D2129;
}

/* 1. 顶部标题区已移除，相关样式可保留或删除（此处保留不影响） */

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
  width: 100px;
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
  margin: 0 -10px;
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

/* 电压柱样式已移除，仅保留文字样式 */
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
  width: 50px;
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
  width: 80px;
  height: 60px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #E5E6EB;
  background: #EEF7FF;
}
.thumb-icon {
  font-size: 28px;
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
  position: relative;
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
  background-size: cover;
  position: relative;
}
.thumb-icon-large {
  font-size: 48px;
  opacity: 0.8;
  z-index: 1;
}
.latest-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: #F53F3F;
  color: #fff;
  font-size: 10px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 4px;
  letter-spacing: 0.5px;
  z-index: 2;
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
.doc-actions {
  display: flex;
  gap: 4px;
}

/* 弹窗通用 */
.map-modal-content {
  min-height: 400px;
}
.map-large-placeholder {
  height: 400px;
  background: #F5F7FA;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  border-radius: 8px;
}
.sub-text {
  font-size: 12px;
  color: #ccc;
}

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