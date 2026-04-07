<template>
  <div class="contract-page">
    <!-- 1. 页面头部（与全局风格统一） -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="main-title">电站合同信息</h1>
        <span class="sub-title">Contract Management</span>
      </div>
      <div class="header-right">
        <el-select v-model="contractStatus" placeholder="合同状态筛选" class="status-filter">
          <el-option label="全部" value="" />
          <el-option label="生效中" value="active" />
          <el-option label="已到期" value="expired" />
          <el-option label="即将到期" value="willExpire" />
          <el-option label="草稿" value="draft" />
        </el-select>
      </div>
    </div>

    <!-- 2. 合同类型标签页（全覆盖5类合同） -->
    <div class="tabs-container">
      <div 
        v-for="tab in tabs" 
        :key="tab.key"
        class="tab-item"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </div>
    </div>

    <!-- 3. 内容区域：全字段覆盖 -->
    <div class="content-area">
      <!-- ====================== EMC合同（100%全字段覆盖） ====================== -->
      <div v-if="activeTab === 'emc'" class="contract-content">
        <!-- 顶部概览卡片 -->
        <div class="overview-card">
          <!-- 左侧：关键指标 -->
          <div class="metrics-section">
            <div class="metric-item">
              <div class="metric-icon roof-icon"></div>
              <div class="metric-info">
                <div class="metric-value">{{ emcMockData.电站屋顶面积 }} <span class="unit">㎡</span></div>
                <div class="metric-label">屋顶面积</div>
              </div>
            </div>
            <div class="metric-item">
              <div class="metric-icon clock-icon"></div>
              <div class="metric-info">
                <div class="metric-value green">{{ emcMockData.剩余合作年限 }} <span class="unit">年</span></div>
                <div class="metric-label">剩余合作年限</div>
              </div>
            </div>
            <div class="metric-item">
              <div class="metric-icon money-icon"></div>
              <div class="metric-info">
                <div class="metric-value">{{ emcMockData.屋顶租金标准 }} <span class="unit">元/㎡</span></div>
                <div class="metric-label">租金标准</div>
              </div>
            </div>
          </div>

          <!-- 中间：合同全周期时间轴 -->
          <div class="timeline-section">
            <div class="timeline-title">合同生命周期</div>
            <div class="timeline">
              <div class="timeline-node completed">
                <div class="node-dot"></div>
                <div class="node-label">签订<br>{{ emcMockData.签订日期 }}</div>
              </div>
              <div class="timeline-line active"></div>
              <div class="timeline-node completed">
                <div class="node-dot"></div>
                <div class="node-label">生效<br>{{ emcMockData.生效日期 }}</div>
              </div>
              <div class="timeline-line active"></div>
              <div class="timeline-node active">
                <div class="node-dot pulse"></div>
                <div class="node-label">生效中</div>
              </div>
              <div class="timeline-line"></div>
              <div class="timeline-node">
                <div class="node-dot"></div>
                <div class="node-label">到期<br>{{ emcMockData.到期日期 }}</div>
              </div>
            </div>
          </div>

          <!-- 右侧：快捷操作 -->
          <div class="actions-section">
            <el-button class="btn-outline">查看附件</el-button>
            <el-button type="primary" class="btn-primary">导出合同</el-button>
          </div>
        </div>

        <!-- 详情网格：全字段拆分展示 -->
        <div class="details-grid">
          <!-- 卡片1：合同基础信息（全覆盖通用列表字段） -->
          <div class="detail-card">
            <div class="card-title">合同基础信息</div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">合同编号</span>
                <span class="info-value">{{ emcMockData.合同编号 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">合同名称</span>
                <span class="info-value">{{ emcMockData.合同名称 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">电站名称</span>
                <span class="info-value">{{ emcMockData.电站名称 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">合同状态</span>
                <span class="info-value status-active">{{ emcMockData.合同状态 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">签订日期</span>
                <span class="info-value">{{ emcMockData.签订日期 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">生效日期</span>
                <span class="info-value">{{ emcMockData.生效日期 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">到期日期</span>
                <span class="info-value">{{ emcMockData.到期日期 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">合作方</span>
                <span class="info-value">{{ emcMockData.合作方 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">产权方</span>
                <span class="info-value">{{ emcMockData.产权方 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">合同主体方</span>
                <span class="info-value">{{ emcMockData.合同主体方 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">负责人</span>
                <span class="info-value">{{ emcMockData.负责人 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">联系电话</span>
                <span class="info-value">{{ emcMockData.电话 }}</span>
              </div>
            </div>
          </div>

          <!-- 卡片2：屋顶与合作信息（全覆盖特有字段） -->
          <div class="detail-card">
            <div class="card-title">屋顶与合作信息</div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">屋顶面积</span>
                <span class="info-value">{{ emcMockData.电站屋顶面积 }} ㎡</span>
              </div>
              <div class="info-item">
                <span class="info-label">屋顶类型</span>
                <span class="info-value">{{ emcMockData.屋顶类型 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">租赁期限</span>
                <span class="info-value">{{ emcMockData.租赁期限 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">合作期限</span>
                <span class="info-value">{{ emcMockData.合作期限 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">剩余合作年限</span>
                <span class="info-value">{{ emcMockData.剩余合作年限 }} 年</span>
              </div>
              <div class="info-item">
                <span class="info-label">电价折扣系数</span>
                <span class="info-value">{{ emcMockData.电价折扣系数 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">自用电价</span>
                <span class="info-value">{{ emcMockData.自用电价 }} 元/kWh</span>
              </div>
            </div>
          </div>

          <!-- 卡片3：租金与财务信息 -->
          <div class="detail-card">
            <div class="card-title">租金与财务信息</div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">屋顶租金标准</span>
                <span class="info-value">{{ emcMockData.屋顶租金标准 }} 元/㎡</span>
              </div>
              <div class="info-item">
                <span class="info-label">年租金总额</span>
                <span class="info-value">{{ emcMockData.租金总额 }} 元</span>
              </div>
              <div class="info-item">
                <span class="info-label">支付周期</span>
                <span class="info-value">{{ emcMockData.支付周期 }}</span>
              </div>
            </div>
            <!-- 租金趋势可视化 -->
            <div class="mini-chart" ref="rentTrendChart"></div>
          </div>

          <!-- 卡片4：账户信息（全宽） -->
          <div class="detail-card full-width">
            <div class="card-title">收款账户信息</div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">账户名称</span>
                <span class="info-value">{{ emcMockData.账户信息.账户名称 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">开户行</span>
                <span class="info-value">{{ emcMockData.账户信息.开户行 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">银行账号</span>
                <span class="info-value">{{ emcMockData.账户信息.银行账号 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">支付方式</span>
                <span class="info-value">银行转账</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 附件区域（覆盖通用字段「附件」） -->
        <div class="attachments-section">
          <div class="section-title">合同附件</div>
          <div class="attachments-list">
            <div 
              v-for="(file, index) in emcMockData.附件" 
              :key="index"
              class="attachment-item"
            >
              <div class="file-icon" :class="`${file.type}-icon`"></div>
              <div class="file-info">
                <div class="file-name">{{ file.name }}</div>
                <div class="file-size">{{ file.size }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ====================== EPC合同（100%全字段覆盖） ====================== -->
      <div v-if="activeTab === 'epc'" class="contract-content">
        <!-- 顶部概览卡片 -->
        <div class="overview-card">
          <div class="metrics-section">
            <div class="metric-item">
              <div class="metric-icon money-icon"></div>
              <div class="metric-info">
                <div class="metric-value">{{ epcMockData.电站投资单价 }} <span class="unit">元/W</span></div>
                <div class="metric-label">投资单价</div>
              </div>
            </div>
            <div class="metric-item">
              <div class="metric-icon money-icon"></div>
              <div class="metric-info">
                <div class="metric-value">{{ (epcMockData.电站投资总额/10000000).toFixed(1) }} <span class="unit">千万</span></div>
                <div class="metric-label">投资总额</div>
              </div>
            </div>
            <div class="metric-item">
              <div class="metric-icon clock-icon"></div>
              <div class="metric-info">
                <div class="metric-value">{{ epcMockData.施工周期 }} <span class="unit">天</span></div>
                <div class="metric-label">施工周期</div>
              </div>
            </div>
          </div>
          <!-- 施工周期甘特图 -->
          <div class="chart-section" ref="ganttChart"></div>
        </div>

        <!-- 详情网格：全字段覆盖 -->
        <div class="details-grid">
          <!-- 卡片1：合同基础信息（全覆盖通用列表字段） -->
          <div class="detail-card">
            <div class="card-title">合同基础信息</div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">合同编号</span>
                <span class="info-value">{{ epcMockData.合同编号 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">电站名称</span>
                <span class="info-value">{{ epcMockData.电站名称 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">合同状态</span>
                <span class="info-value status-active">{{ epcMockData.合同状态 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">签订日期</span>
                <span class="info-value">{{ epcMockData.签订日期 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">生效日期</span>
                <span class="info-value">{{ epcMockData.生效日期 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">到期日期</span>
                <span class="info-value">{{ epcMockData.到期日期 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">EPC总包公司</span>
                <span class="info-value">{{ epcMockData.EPC总包公司名称 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">合作方</span>
                <span class="info-value">{{ epcMockData.合作方 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">负责人</span>
                <span class="info-value">{{ epcMockData.负责人 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">联系电话</span>
                <span class="info-value">{{ epcMockData.电话 }}</span>
              </div>
            </div>
          </div>

          <!-- 卡片2：项目关键时间节点（全覆盖特有字段） -->
          <div class="detail-card">
            <div class="card-title">项目关键时间节点</div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">备案时间</span>
                <span class="info-value">{{ epcMockData.备案时间 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">电网接入批复时间</span>
                <span class="info-value">{{ epcMockData.电网接入批复时间 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">开工时间</span>
                <span class="info-value">{{ epcMockData.开工时间 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">组件到场时间</span>
                <span class="info-value">{{ epcMockData.组件到场时间 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">竣工时间</span>
                <span class="info-value">{{ epcMockData.竣工时间 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">并网时间</span>
                <span class="info-value">{{ epcMockData.并网时间 }}</span>
              </div>
            </div>
          </div>

          <!-- 卡片3：设备与施工资料 -->
          <div class="detail-card">
            <div class="card-title">设备与施工资料</div>
            <div class="info-grid">
              <div class="info-item full-item">
                <span class="info-label">施工设备清单/品牌型号</span>
                <div class="device-list">
                  <el-tag v-for="item in epcMockData.施工设备清单" :key="item" size="small" style="margin-right: 8px; margin-bottom: 8px;">
                    {{ item }}
                  </el-tag>
                </div>
              </div>
              <div class="info-item">
                <span class="info-label">施工图纸</span>
                <el-button link type="primary" style="padding: 0;">查看图纸附件</el-button>
              </div>
            </div>
            <!-- 设备品牌分布饼图 -->
            <div class="pie-chart" ref="brandPieChart"></div>
          </div>

          <!-- 卡片4：质保信息（全覆盖特有字段） -->
          <div class="detail-card">
            <div class="card-title">质保信息</div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">质保周期</span>
                <span class="info-value">{{ epcMockData.质保周期 }} 个月</span>
              </div>
              <div class="info-item">
                <span class="info-label">质保金额</span>
                <span class="info-value">{{ epcMockData.质保金额 }} 元</span>
              </div>
              <div class="info-item">
                <span class="info-label">质保金支付状态</span>
                <span class="info-value" :class="epcMockData.质保金支付状态 === '未支付' ? 'status-warning' : 'status-active'">
                  {{ epcMockData.质保金支付状态 }}
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">质保服务记录</span>
                <el-button link type="primary" style="padding: 0;">查看服务记录</el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 附件区域 -->
        <div class="attachments-section">
          <div class="section-title">合同附件</div>
          <div class="attachments-list">
            <div 
              v-for="(file, index) in epcMockData.附件" 
              :key="index"
              class="attachment-item"
            >
              <div class="file-icon" :class="`${file.type}-icon`"></div>
              <div class="file-info">
                <div class="file-name">{{ file.name }}</div>
                <div class="file-size">{{ file.size }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ====================== 购售电合同（100%全字段覆盖） ====================== -->
      <div v-if="activeTab === 'purchase'" class="contract-content">
        <!-- 顶部概览卡片 -->
        <div class="overview-card">
          <div class="metrics-section">
            <div class="metric-item">
              <div class="metric-icon money-icon"></div>
              <div class="metric-info">
                <div class="metric-value">{{ purchaseMockData.上网电价预估 }} <span class="unit">元/kWh</span></div>
                <div class="metric-label">上网电价预估</div>
              </div>
            </div>
            <div class="metric-item">
              <div class="metric-icon clock-icon"></div>
              <div class="metric-info">
                <div class="metric-value green">{{ purchaseMockData.剩余期限 }} <span class="unit">年</span></div>
                <div class="metric-label">合同剩余期限</div>
              </div>
            </div>
          </div>
          <div class="timeline-section">
            <div class="timeline-title">合同周期</div>
            <div class="timeline">
              <div class="timeline-node completed">
                <div class="node-dot"></div>
                <div class="node-label">签订<br>{{ purchaseMockData.签订日期 }}</div>
              </div>
              <div class="timeline-line active"></div>
              <div class="timeline-node active">
                <div class="node-dot pulse"></div>
                <div class="node-label">生效中<br>{{ purchaseMockData.生效日期 }}</div>
              </div>
              <div class="timeline-line"></div>
              <div class="timeline-node">
                <div class="node-dot"></div>
                <div class="node-label">到期<br>{{ purchaseMockData.到期日期 }}</div>
              </div>
            </div>
          </div>
          <div class="actions-section">
            <el-button class="btn-outline">查看附件</el-button>
            <el-button type="primary" class="btn-primary">导出合同</el-button>
          </div>
        </div>

        <!-- 详情网格：全字段覆盖 -->
        <div class="details-grid">
          <!-- 卡片1：合同基础信息（全覆盖通用+特有字段） -->
          <div class="detail-card full-width">
            <div class="card-title">合同基础信息</div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">合同编号</span>
                <span class="info-value">{{ purchaseMockData.合同编号 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">电站名称</span>
                <span class="info-value">{{ purchaseMockData.电站名称 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">合同主体</span>
                <span class="info-value">{{ purchaseMockData.合同主体 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">合作方（购电方）</span>
                <span class="info-value">{{ purchaseMockData.合作方 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">合同状态</span>
                <span class="info-value status-active">{{ purchaseMockData.合同状态 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">合同期限</span>
                <span class="info-value">{{ purchaseMockData.合同期限 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">签订日期</span>
                <span class="info-value">{{ purchaseMockData.签订日期 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">生效日期</span>
                <span class="info-value">{{ purchaseMockData.生效日期 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">到期日期</span>
                <span class="info-value">{{ purchaseMockData.到期日期 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">上网电价预估</span>
                <span class="info-value">{{ purchaseMockData.上网电价预估 }} 元/kWh</span>
              </div>
              <div class="info-item">
                <span class="info-label">负责人</span>
                <span class="info-value">{{ purchaseMockData.负责人 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">联系电话</span>
                <span class="info-value">{{ purchaseMockData.电话 }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 附件区域 -->
        <div class="attachments-section">
          <div class="section-title">合同附件</div>
          <div class="attachments-list">
            <div 
              v-for="(file, index) in purchaseMockData.附件" 
              :key="index"
              class="attachment-item"
            >
              <div class="file-icon" :class="`${file.type}-icon`"></div>
              <div class="file-info">
                <div class="file-name">{{ file.name }}</div>
                <div class="file-size">{{ file.size }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ====================== 融资合同（100%全字段覆盖） ====================== -->
      <div v-if="activeTab === 'financing'" class="contract-content">
        <!-- 顶部概览卡片 -->
        <div class="overview-card">
          <div class="metrics-section">
            <div class="metric-item">
              <div class="metric-icon money-icon"></div>
              <div class="metric-info">
                <div class="metric-value">{{ (financingMockData.融资总额/10000000).toFixed(1) }} <span class="unit">千万</span></div>
                <div class="metric-label">融资总额</div>
              </div>
            </div>
            <div class="metric-item">
              <div class="metric-icon percent-icon"></div>
              <div class="metric-info">
                <div class="metric-value">{{ financingMockData.融资比例 }} <span class="unit">%</span></div>
                <div class="metric-label">融资比例</div>
              </div>
            </div>
            <div class="metric-item">
              <div class="metric-icon rate-icon"></div>
              <div class="metric-info">
                <div class="metric-value">{{ financingMockData.具体利率 }} <span class="unit">%</span></div>
                <div class="metric-label">年化利率</div>
              </div>
            </div>
          </div>
          <div class="timeline-section">
            <div class="timeline-title">融资周期</div>
            <div class="timeline">
              <div class="timeline-node completed">
                <div class="node-dot"></div>
                <div class="node-label">签订<br>{{ financingMockData.签订日期 }}</div>
              </div>
              <div class="timeline-line active"></div>
              <div class="timeline-node active">
                <div class="node-dot pulse"></div>
                <div class="node-label">还款中</div>
              </div>
              <div class="timeline-line"></div>
              <div class="timeline-node">
                <div class="node-dot"></div>
                <div class="node-label">到期<br>{{ financingMockData.到期日期 }}</div>
              </div>
            </div>
          </div>
          <div class="actions-section">
            <el-button class="btn-outline">查看附件</el-button>
            <el-button type="primary" class="btn-primary">导出合同</el-button>
          </div>
        </div>

        <!-- 详情网格：全字段覆盖 -->
        <div class="details-grid">
          <!-- 卡片1：合同基础信息（全覆盖通用+特有字段） -->
          <div class="detail-card">
            <div class="card-title">合同基础信息</div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">合同编号</span>
                <span class="info-value">{{ financingMockData.合同编号 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">电站名称</span>
                <span class="info-value">{{ financingMockData.电站名称 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">合同状态</span>
                <span class="info-value status-active">{{ financingMockData.合同状态 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">融资方</span>
                <span class="info-value">{{ financingMockData.融资方 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">合作方</span>
                <span class="info-value">{{ financingMockData.合作方 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">签订日期</span>
                <span class="info-value">{{ financingMockData.签订日期 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">生效日期</span>
                <span class="info-value">{{ financingMockData.生效日期 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">到期日期</span>
                <span class="info-value">{{ financingMockData.到期日期 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">负责人</span>
                <span class="info-value">{{ financingMockData.负责人 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">联系电话</span>
                <span class="info-value">{{ financingMockData.电话 }}</span>
              </div>
            </div>
          </div>

          <!-- 卡片2：融资核心信息 -->
          <div class="detail-card">
            <div class="card-title">融资核心信息</div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">融资总额</span>
                <span class="info-value">{{ financingMockData.融资总额 }} 元</span>
              </div>
              <div class="info-item">
                <span class="info-label">单瓦融资金额</span>
                <span class="info-value">{{ financingMockData.单瓦融资金额 }} 元/W</span>
              </div>
              <div class="info-item">
                <span class="info-label">融资比例</span>
                <span class="info-value">{{ financingMockData.融资比例 }} %</span>
              </div>
              <div class="info-item">
                <span class="info-label">融资总期限</span>
                <span class="info-value">{{ financingMockData.总期限 }} 年</span>
              </div>
              <div class="info-item">
                <span class="info-label">利率类型</span>
                <span class="info-value">{{ financingMockData.利率类型 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">年化利率</span>
                <span class="info-value">{{ financingMockData.具体利率 }} %</span>
              </div>
              <div class="info-item">
                <span class="info-label">还款方式</span>
                <span class="info-value">{{ financingMockData.还款方式 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">还款支付方式</span>
                <span class="info-value">{{ financingMockData.还款支付方式 }}</span>
              </div>
            </div>
          </div>

          <!-- 卡片3：还款计划可视化 -->
          <div class="detail-card full-width">
            <div class="card-title">还款计划明细</div>
            <div class="chart-container" ref="repayChart"></div>
            <div style="margin-top: 16px;">
              <el-button link type="primary">查看完整还款时间表</el-button>
              <el-button link type="primary" style="margin-left: 20px;">查看还款金额明细</el-button>
            </div>
          </div>
        </div>

        <!-- 附件区域 -->
        <div class="attachments-section">
          <div class="section-title">合同附件</div>
          <div class="attachments-list">
            <div 
              v-for="(file, index) in financingMockData.附件" 
              :key="index"
              class="attachment-item"
            >
              <div class="file-icon" :class="`${file.type}-icon`"></div>
              <div class="file-info">
                <div class="file-name">{{ file.name }}</div>
                <div class="file-size">{{ file.size }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ====================== 运维合同（100%全字段覆盖） ====================== -->
      <div v-if="activeTab === 'operation'" class="contract-content">
        <!-- 顶部概览卡片 -->
        <div class="overview-card">
          <div class="metrics-section">
            <div class="metric-item">
              <div class="metric-icon money-icon"></div>
              <div class="metric-info">
                <div class="metric-value">{{ operationMockData.运维费用合计 }} <span class="unit">元/年</span></div>
                <div class="metric-label">年运维总费用</div>
              </div>
            </div>
            <div class="metric-item">
              <div class="metric-icon tool-icon"></div>
              <div class="metric-info">
                <div class="metric-value">{{ operationMockData.年运维次数 }} <span class="unit">次</span></div>
                <div class="metric-label">年运维次数</div>
              </div>
            </div>
            <div class="metric-item">
              <div class="metric-icon watt-icon"></div>
              <div class="metric-info">
                <div class="metric-value">{{ operationMockData.折算单瓦成本 }} <span class="unit">元/W</span></div>
                <div class="metric-label">单瓦运维成本</div>
              </div>
            </div>
          </div>
          <div class="timeline-section">
            <div class="timeline-title">合同周期</div>
            <div class="timeline">
              <div class="timeline-node completed">
                <div class="node-dot"></div>
                <div class="node-label">签订<br>{{ operationMockData.签订日期 }}</div>
              </div>
              <div class="timeline-line active"></div>
              <div class="timeline-node active">
                <div class="node-dot pulse"></div>
                <div class="node-label">服务中</div>
              </div>
              <div class="timeline-line"></div>
              <div class="timeline-node">
                <div class="node-dot"></div>
                <div class="node-label">到期<br>{{ operationMockData.到期日期 }}</div>
              </div>
            </div>
          </div>
          <div class="actions-section">
            <el-button class="btn-outline">查看附件</el-button>
            <el-button type="primary" class="btn-primary">导出合同</el-button>
          </div>
        </div>

        <!-- 详情网格：全字段覆盖 -->
        <div class="details-grid">
          <!-- 卡片1：合同基础信息（全覆盖通用+特有字段） -->
          <div class="detail-card">
            <div class="card-title">合同基础信息</div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">合同编号</span>
                <span class="info-value">{{ operationMockData.合同编号 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">电站名称</span>
                <span class="info-value">{{ operationMockData.电站名称 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">合同状态</span>
                <span class="info-value status-active">{{ operationMockData.合同状态 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">运维单位名称</span>
                <span class="info-value">{{ operationMockData.运维单位名称 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">合作方</span>
                <span class="info-value">{{ operationMockData.合作方 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">签订日期</span>
                <span class="info-value">{{ operationMockData.签订日期 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">生效日期</span>
                <span class="info-value">{{ operationMockData.生效日期 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">到期日期</span>
                <span class="info-value">{{ operationMockData.到期日期 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">负责人</span>
                <span class="info-value">{{ operationMockData.负责人 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">联系电话</span>
                <span class="info-value">{{ operationMockData.电话 }}</span>
              </div>
            </div>
          </div>

          <!-- 卡片2：运维费用信息 -->
          <div class="detail-card">
            <div class="card-title">运维费用信息</div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">基础服务费用</span>
                <span class="info-value">{{ operationMockData.基础服务费用 }} 元/年</span>
              </div>
              <div class="info-item">
                <span class="info-label">差异化分成费用</span>
                <span class="info-value">{{ operationMockData.差异化分成费用 }} 元/年</span>
              </div>
              <div class="info-item">
                <span class="info-label">运维费用合计</span>
                <span class="info-value">{{ operationMockData.运维费用合计 }} 元/年</span>
              </div>
              <div class="info-item">
                <span class="info-label">折算单瓦成本</span>
                <span class="info-value">{{ operationMockData.折算单瓦成本 }} 元/W</span>
              </div>
              <div class="info-item">
                <span class="info-label">年运维次数</span>
                <span class="info-value">{{ operationMockData.年运维次数 }} 次</span>
              </div>
              <div class="info-item">
                <span class="info-label">计费方式</span>
                <span class="info-value">{{ operationMockData.计费方式 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">支付状态</span>
                <span class="info-value" :class="operationMockData.支付状态 === '已支付' ? 'status-active' : 'status-warning'">
                  {{ operationMockData.支付状态 }}
                </span>
              </div>
            </div>
            <!-- 费用构成可视化 -->
            <div class="mini-chart" ref="costChart"></div>
          </div>
        </div>

        <!-- 附件区域 -->
        <div class="attachments-section">
          <div class="section-title">合同附件</div>
          <div class="attachments-list">
            <div 
              v-for="(file, index) in operationMockData.附件" 
              :key="index"
              class="attachment-item"
            >
              <div class="file-icon" :class="`${file.type}-icon`"></div>
              <div class="file-info">
                <div class="file-name">{{ file.name }}</div>
                <div class="file-size">{{ file.size }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts'
import { ElButton, ElSelect, ElOption, ElEmpty, ElTag } from 'element-plus'

// 响应式核心数据
const activeTab = ref('emc')
const contractStatus = ref('')

// 标签页配置
const tabs = [
  { key: 'emc', label: 'EMC合同' },
  { key: 'epc', label: 'EPC合同' },
  { key: 'purchase', label: '购售电合同' },
  { key: 'financing', label: '融资合同' },
  { key: 'operation', label: '运维合同' }
]

// ====================== 模拟数据（100%覆盖所有字段） ======================
// EMC合同模拟数据（全覆盖所有通用+特有字段）
const emcMockData = {
  // 通用列表字段
  电站名称: '赣州瑞金市10MW分布式光伏电站',
  签订日期: '2023-01-15',
  生效日期: '2023-02-01',
  到期日期: '2033-01-31',
  合同状态: '生效中',
  合作方: '瑞金市工业投资集团有限公司',
  负责人: '张三',
  电话: '138****1234',
  附件: [
    { name: 'EMC合同正本.pdf', type: 'pdf', size: '2.3 MB' },
    { name: '租金计算明细表.xlsx', type: 'excel', size: '156 KB' },
    { name: '屋顶产权证明.pdf', type: 'pdf', size: '1.2 MB' },
    { name: '屋顶平面图.png', type: 'img', size: '4.8 MB' }
  ],
  // 特有详情字段
  合同编号: 'EMC-RJ-20230115',
  合同名称: '10MW分布式光伏发电项目能源管理合同',
  产权方: '瑞金市工业投资集团有限公司',
  合同主体方: '江西XX新能源科技有限公司',
  电站屋顶面积: '12000',
  屋顶类型: '混凝土平顶',
  屋顶租金标准: '8',
  租金总额: '96000',
  租赁期限: '10年',
  支付周期: '按季度支付',
  账户信息: {
    账户名称: '瑞金市工业投资集团有限公司',
    开户行: '中国工商银行股份有限公司瑞金支行',
    银行账号: '1502 0231 0900 0012 345'
  },
  电价折扣系数: '0.85',
  自用电价: '0.62',
  合作期限: '10年',
  剩余合作年限: '8'
}

// EPC合同模拟数据（全覆盖所有通用+特有字段）
const epcMockData = {
  // 通用列表字段
  电站名称: '赣州瑞金市10MW分布式光伏电站',
  签订日期: '2023-01-20',
  生效日期: '2023-02-01',
  到期日期: '2025-08-28',
  合同状态: '质保期内',
  合作方: '江西XX新能源科技有限公司',
  负责人: '李四',
  电话: '139****5678',
  附件: [
    { name: 'EPC总承包合同.pdf', type: 'pdf', size: '3.5 MB' },
    { name: '施工设计图纸.zip', type: 'zip', size: '12.8 MB' },
    { name: '设备采购清单.xlsx', type: 'excel', size: '245 KB' },
    { name: '竣工验收报告.pdf', type: 'pdf', size: '4.2 MB' }
  ],
  // 特有详情字段
  合同编号: 'EPC-RJ-20230120',
  EPC总包公司名称: '中国电建集团江西省电力设计院有限公司',
  电站投资单价: '4.2',
  电站投资总额: '42000000',
  施工周期: '180',
  施工图纸: '详见附件',
  施工设备清单: ['隆基550W组件', '阳光电源110kW逆变器', '华为智能监控系统', '正泰电缆', '施耐德配电柜'],
  备案时间: '2023-02-10',
  开工时间: '2023-03-01',
  电网接入批复时间: '2023-02-25',
  组件到场时间: '2023-05-20',
  竣工时间: '2023-08-20',
  并网时间: '2023-08-28',
  质保周期: '24',
  质保金额: '2100000',
  质保金支付状态: '未支付',
  质保服务记录: '详见服务台账'
}

// 购售电合同模拟数据（全覆盖所有通用+特有字段）
const purchaseMockData = {
  // 通用列表字段
  电站名称: '赣州瑞金市10MW分布式光伏电站',
  签订日期: '2023-01-25',
  生效日期: '2023-09-01',
  到期日期: '2026-08-31',
  合同状态: '生效中',
  合作方: '国家电网江西省电力有限公司',
  负责人: '王五',
  电话: '137****9012',
  附件: [
    { name: '购售电合同正本.pdf', type: 'pdf', size: '1.8 MB' },
    { name: '电网接入批复文件.pdf', type: 'pdf', size: '896 KB' }
  ],
  // 特有详情字段
  合同编号: 'GSD-RJ-20230125',
  合同主体: '江西XX新能源科技有限公司',
  合同期限: '3年',
  上网电价预估: '0.4132',
  剩余期限: '0.5'
}

// 融资合同模拟数据（全覆盖所有通用+特有字段）
const financingMockData = {
  // 通用列表字段
  电站名称: '赣州瑞金市10MW分布式光伏电站',
  签订日期: '2023-02-10',
  生效日期: '2023-03-01',
  到期日期: '2033-02-28',
  合同状态: '还款中',
  合作方: '中国建设银行股份有限公司赣州分行',
  负责人: '赵六',
  电话: '136****3456',
  附件: [
    { name: '固定资产贷款合同.pdf', type: 'pdf', size: '4.2 MB' },
    { name: '抵押合同.pdf', type: 'pdf', size: '2.1 MB' },
    { name: '还款计划表.xlsx', type: 'excel', size: '189 KB' }
  ],
  // 特有详情字段
  合同编号: 'RZ-RJ-20230210',
  融资方: '江西XX新能源科技有限公司',
  融资总额: '30000000',
  单瓦融资金额: '3.0',
  融资比例: '70',
  总期限: '10',
  利率类型: '固定利率',
  具体利率: '3.85',
  还款方式: '等额本息',
  还款时间表: '详见附件',
  还款金额明细: '详见附件',
  还款支付方式: '银行自动转账'
}

// 运维合同模拟数据（全覆盖所有通用+特有字段）
const operationMockData = {
  // 通用列表字段
  电站名称: '赣州瑞金市10MW分布式光伏电站',
  签订日期: '2023-09-01',
  生效日期: '2023-09-01',
  到期日期: '2026-08-31',
  合同状态: '服务中',
  合作方: '江西XX新能源科技有限公司',
  负责人: '孙七',
  电话: '135****7890',
  附件: [
    { name: '运维服务合同.pdf', type: 'pdf', size: '2.0 MB' },
    { name: '运维服务方案.pdf', type: 'pdf', size: '3.1 MB' },
    { name: '年度运维计划表.xlsx', type: 'excel', size: '122 KB' }
  ],
  // 特有详情字段
  合同编号: 'YW-RJ-20230901',
  运维单位名称: '江西XX智能运维有限公司',
  基础服务费用: '120000',
  差异化分成费用: '30000',
  运维费用合计: '150000',
  折算单瓦成本: '0.015',
  年运维次数: '12',
  计费方式: '固定年费+发电量分成',
  支付状态: '已支付'
}

// ====================== 图表引用与初始化 ======================
// 图表DOM引用
const rentTrendChart = ref(null)
const ganttChart = ref(null)
const brandPieChart = ref(null)
const repayChart = ref(null)
const costChart = ref(null)

// EMC租金趋势图
const initRentTrendChart = () => {
  if (!rentTrendChart.value) return
  const chart = echarts.init(rentTrendChart.value)
  chart.setOption({
    grid: { top: 10, right: 10, bottom: 20, left: 30 },
    xAxis: {
      type: 'category',
      data: ['2019', '2020', '2021', '2022', '2023'],
      axisLine: { lineStyle: { color: '#E5E6EB' } },
      axisLabel: { color: '#86909C', fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#F5F7FA' } },
      axisLabel: { color: '#86909C', fontSize: 10 }
    },
    series: [{
      data: [7.5, 7.8, 8.0, 8.0, 8.0],
      type: 'bar',
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#0066CC' },
          { offset: 1, color: '#165DFF' }
        ]),
        borderRadius: [4, 4, 0, 0]
      }
    }]
  })
}

// EPC施工甘特图
const initGanttChart = () => {
  if (!ganttChart.value) return
  const chart = echarts.init(ganttChart.value)
  chart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { top: 30, right: 30, bottom: 30, left: 80 },
    xAxis: {
      type: 'time',
      min: '2023-02-01',
      max: '2023-09-01',
      axisLine: { lineStyle: { color: '#E5E6EB' } }
    },
    yAxis: {
      type: 'category',
      data: ['并网验收', '竣工', '组件安装', '设备到场', '开工准备'],
      inverse: true,
      axisLine: { show: false },
      axisTick: { show: false }
    },
    series: [{
      type: 'bar',
      horizontal: true,
      data: [
        [new Date('2023-08-20'), new Date('2023-08-28')],
        [new Date('2023-08-10'), new Date('2023-08-20')],
        [new Date('2023-06-01'), new Date('2023-08-10')],
        [new Date('2023-05-15'), new Date('2023-06-01')],
        [new Date('2023-03-01'), new Date('2023-03-15')]
      ],
      itemStyle: { 
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: '#0066CC' },
          { offset: 1, color: '#165DFF' }
        ]),
        borderRadius: 4 
      }
    }]
  })
}

// EPC设备品牌饼图
const initBrandPieChart = () => {
  if (!brandPieChart.value) return
  const chart = echarts.init(brandPieChart.value)
  chart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {d}%' },
    legend: { bottom: 0, itemWidth: 10, itemHeight: 10, textStyle: { fontSize: 11 } },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      data: [
        { value: 40, name: '隆基组件', itemStyle: { color: '#0066CC' } },
        { value: 30, name: '阳光电源', itemStyle: { color: '#165DFF' } },
        { value: 20, name: '华为逆变器', itemStyle: { color: '#52C41A' } },
        { value: 10, name: '其他辅材', itemStyle: { color: '#86909C' } }
      ]
    }]
  })
}

// 融资合同还款计划图
const initRepayChart = () => {
  if (!repayChart.value) return
  const chart = echarts.init(repayChart.value)
  chart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
    legend: { data: ['应还本金', '应还利息', '还款总额'], top: 0 },
    grid: { top: 40, right: 30, bottom: 30, left: 60 },
    xAxis: {
      type: 'category',
      data: ['2023', '2024', '2025', '2026', '2027', '2028', '2029', '2030', '2031', '2032', '2033'],
      axisLine: { lineStyle: { color: '#E5E6EB' } }
    },
    yAxis: {
      type: 'value',
      name: '万元',
      splitLine: { lineStyle: { color: '#F5F7FA' } }
    },
    series: [
      {
        name: '应还本金',
        type: 'bar',
        stack: 'total',
        data: [240, 250, 260, 270, 285, 300, 315, 330, 345, 360, 345],
        itemStyle: { color: '#0066CC' }
      },
      {
        name: '应还利息',
        type: 'bar',
        stack: 'total',
        data: [115, 105, 95, 85, 70, 55, 40, 25, 10, 0, 0],
        itemStyle: { color: '#52C41A' }
      },
      {
        name: '还款总额',
        type: 'line',
        data: [355, 355, 355, 355, 355, 355, 355, 355, 355, 360, 345],
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { color: '#FAAD14', width: 2 }
      }
    ]
  })
}

// 运维合同费用构成图
const initCostChart = () => {
  if (!costChart.value) return
  const chart = echarts.init(costChart.value)
  chart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c}元 ({d}%)' },
    legend: { orient: 'vertical', right: 10, top: 'center', textStyle: { fontSize: 12 } },
    series: [{
      type: 'pie',
      radius: ['0%', '60%'],
      center: ['30%', '50%'],
      data: [
        { value: 120000, name: '基础服务费', itemStyle: { color: '#0066CC' } },
        { value: 30000, name: '差异化分成费', itemStyle: { color: '#165DFF' } }
      ],
      label: { show: true, formatter: '{b}\n{c}元', fontSize: 11 }
    }]
  })
}

// 窗口resize适配
const resizeAllCharts = () => {
  rentTrendChart.value && echarts.getInstanceByDom(rentTrendChart.value)?.resize()
  ganttChart.value && echarts.getInstanceByDom(ganttChart.value)?.resize()
  brandPieChart.value && echarts.getInstanceByDom(brandPieChart.value)?.resize()
  repayChart.value && echarts.getInstanceByDom(repayChart.value)?.resize()
  costChart.value && echarts.getInstanceByDom(costChart.value)?.resize()
}

// 组件挂载后初始化
onMounted(() => {
  initRentTrendChart()
  initGanttChart()
  initBrandPieChart()
  initRepayChart()
  initCostChart()
  window.addEventListener('resize', resizeAllCharts)
})

// 标签页切换后重绘图表（避免DOM未渲染导致图表初始化失败）
watch(activeTab, (newVal) => {
  setTimeout(() => {
    if (newVal === 'emc') initRentTrendChart()
    if (newVal === 'epc') {
      initGanttChart()
      initBrandPieChart()
    }
    if (newVal === 'financing') initRepayChart()
    if (newVal === 'operation') initCostChart()
  }, 100)
})
</script>

<style scoped>
/* 页面整体布局（与全局布局完全适配） */
.contract-page {
  background-color: #F5F7FA;
  min-height: calc(100vh - 80px);
  padding: 10px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 10px;
}

.header-left {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.main-title {
  font-size: 20px;
  font-weight: 600;
  color: #1D2129;
  margin: 0;
}

.sub-title {
  font-size: 14px;
  color: #86909C;
}

.status-filter {
  width: 180px;
}

/* 标签页容器（与全局风格统一） */
.tabs-container {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  padding: 0 10px;
  flex-wrap: wrap;
}

.tab-item {
  padding: 8px 20px;
  border-radius: 8px;
  font-size: 14px;
  color: #4E5969;
  background-color: #FFFFFF;
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
}

.tab-item:hover {
  background-color: #F5F7FA;
}

.tab-item.active {
  background: linear-gradient(90deg, #0066CC, #165DFF);
  color: #FFFFFF;
  font-weight: 500;
}

/* 内容区域 */
.content-area {
  padding: 0 10px;
}

.contract-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 顶部概览卡片 */
.overview-card {
  background-color: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

/* 关键指标模块 */
.metrics-section {
  display: flex;
  gap: 40px;
  flex-wrap: wrap;
}

.metric-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.metric-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background-size: 24px;
  background-repeat: no-repeat;
  background-position: center;
  flex-shrink: 0;
}

/* ==================== 完整的图标样式（SVG已补全） ==================== */
.roof-icon {
  background-color: #EEF7FF;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%230066CC' viewBox='0 0 24 24'%3E%3Cpath d='M14 11h4v7h-4zm-6 0h4v7H8zm-3 0h2v7H5zM12 3L2 9v1h20V9z'/%3E%3C/svg%3E");
}

.clock-icon {
  background-color: #E8FFEA;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%2352C41A' viewBox='0 0 24 24'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z'/%3E%3C/svg%3E");
}

.money-icon {
  background-color: #FFF7E6;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23FAAD14' viewBox='0 0 24 24'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z'/%3E%3C/svg%3E");
}

.percent-icon {
  background-color: #F9F0FF;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23722ED1' viewBox='0 0 24 24'%3E%3Cpath d='M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm-1-8V6h2v3h-2zm0 8v-3h2v3h-2z'/%3E%3C/svg%3E");
}

.rate-icon {
  background-color: #E6F7FF;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%231890FF' viewBox='0 0 24 24'%3E%3Cpath d='M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z'/%3E%3C/svg%3E");
}

.tool-icon {
  background-color: #FFF1F0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23F5222D' viewBox='0 0 24 24'%3E%3Cpath d='M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z'/%3E%3C/svg%3E");
}

.watt-icon {
  background-color: #E8FFEA;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%2352C41A' viewBox='0 0 24 24'%3E%3Cpath d='M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66.19-.34.05-.08.07-.12C8.48 10.94 10.42 7.54 13 3h1l-1 7h3.5c.49 0 .56.33.47.51l-.07.15C12.96 17.55 11 21 11 21z'/%3E%3C/svg%3E");
}

.metric-info {
  display: flex;
  flex-direction: column;
}

.metric-value {
  font-size: 24px;
  font-weight: 600;
  color: #0066CC;
  line-height: 1.2;
}

.metric-value.green {
  color: #52C41A;
}

.metric-value .unit {
  font-size: 14px;
  font-weight: 400;
}

.metric-label {
  font-size: 13px;
  color: #86909C;
}

/* 时间轴模块 */
.timeline-section {
  flex: 1;
  min-width: 300px;
  padding: 0 20px;
}

.timeline-title {
  font-size: 14px;
  color: #1D2129;
  margin-bottom: 16px;
  font-weight: 500;
}

.timeline {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.timeline-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.node-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #E5E6EB;
  margin-bottom: 8px;
  position: relative;
  z-index: 2;
}

.timeline-node.completed .node-dot {
  background-color: #52C41A;
}

.timeline-node.active .node-dot {
  background-color: #52C41A;
}

.node-dot.pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(82, 196, 26, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(82, 196, 26, 0); }
  100% { box-shadow: 0 0 0 0 rgba(82, 196, 26, 0); }
}

.node-label {
  font-size: 12px;
  color: #86909C;
  text-align: center;
  line-height: 1.4;
  white-space: nowrap;
}

.timeline-node.active .node-label {
  color: #52C41A;
  font-weight: 500;
}

.timeline-line {
  flex: 1;
  height: 2px;
  background-color: #E5E6EB;
  margin: 0 10px;
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
}

.timeline-line.active {
  background-color: #52C41A;
}

/* 操作按钮模块 */
.actions-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn-outline {
  border-color: #0066CC;
  color: #0066CC;
  border-radius: 8px;
}

.btn-primary {
  background: linear-gradient(90deg, #0066CC, #165DFF);
  border: none;
  border-radius: 8px;
}

/* 详情网格布局 */
.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

@media (max-width: 1200px) {
  .details-grid {
    grid-template-columns: 1fr;
  }
}

.detail-card {
  background-color: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  padding: 20px;
}

.detail-card.full-width {
  grid-column: 1 / -1;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1D2129;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #F5F7FA;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 24px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item.full-item {
  grid-column: 1 / -1;
}

.info-label {
  font-size: 13px;
  color: #86909C;
}

.info-value {
  font-size: 14px;
  color: #1D2129;
  font-weight: 500;
  word-break: break-all;
}

.status-active {
  color: #52C41A;
}

.status-warning {
  color: #FAAD14;
}

.device-list {
  margin-top: 4px;
}

/* 图表容器 */
.mini-chart {
  width: 100%;
  height: 140px;
  margin-top: 16px;
}

.chart-section {
  flex: 1;
  min-width: 300px;
  height: 200px;
  padding: 0 20px;
}

.chart-container {
  width: 100%;
  height: 300px;
}

.pie-chart {
  width: 100%;
  height: 220px;
  margin-top: 10px;
}

/* 附件区域 */
.attachments-section {
  background-color: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  padding: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1D2129;
  margin-bottom: 16px;
}

.attachments-list {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background-color: #F5F7FA;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.attachment-item:hover {
  background-color: #EEF7FF;
}

.file-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-size: 20px;
  background-repeat: no-repeat;
  background-position: center;
  flex-shrink: 0;
}

/* 文件类型图标 */
.pdf-icon {
  background-color: #FFECE8;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23F5222D' viewBox='0 0 24 24'%3E%3Cpath d='M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 2l5 5h-5V4zM9 13h2v2H9zm0 4h2v2H9zm4-4h2v6h-2z'/%3E%3C/svg%3E");
}

.excel-icon {
  background-color: #E8FFEA;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%2352C41A' viewBox='0 0 24 24'%3E%3Cpath d='M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 2l5 5h-5V4zm-3 7l2 3-2 3-2-3 2-3zm7 6h-2v-2h2v2zm0-4h-2v-2h2v2z'/%3E%3C/svg%3E");
}

.zip-icon {
  background-color: #FFF7E6;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23FAAD14' viewBox='0 0 24 24'%3E%3Cpath d='M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-2 6h-2v2h2v-2zm-4 0h-2v2h2v-2zm-4 0h-2v2h2v-2zm8-4h-2v2h2V8zm-4 0h-2v2h2V8zm-4 0h-2v2h2V8z'/%3E%3C/svg%3E");
}

.img-icon {
  background-color: #E6F7FF;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%231890FF' viewBox='0 0 24 24'%3E%3Cpath d='M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z'/%3E%3C/svg%3E");
}

.file-info {
  display: flex;
  flex-direction: column;
}

.file-name {
  font-size: 14px;
  color: #1D2129;
  font-weight: 500;
}

.file-size {
  font-size: 12px;
  color: #86909C;
}
</style>