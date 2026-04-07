<template>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>🏆 小组贡献积分统计工具</h1>
      <p>标准化积分计算 · 数据可追溯 · 支持导入导出</p>
      <div class="mode-indicator">
        <span v-if="!isAdminMode" class="mode-badge normal">👤 普通模式</span>
        <span v-else class="mode-badge admin">🔐 管理模式</span>
        <button v-if="!isAdminMode" class="btn btn-sm btn-outline" style="color: white; border-color: white;" @click="enterAdminMode">
          进入管理模式
        </button>
        <button v-else class="btn btn-sm" style="background: rgba(255,255,255,0.2); color: white;" @click="exitAdminMode">
          退出管理模式
        </button>
      </div>
    </div>

    <!-- 主内容 -->
    <div class="main-content">
      <!-- 左侧操作区 -->
      <div class="left-panel">
        <!-- 积分计算器 -->
        <div class="card" v-if="isAdminMode">
          <div class="card-title">
            <span class="icon">🧮</span>
            积分计算器（即时加分）
          </div>

          <div class="form-group">
            <label>任务名称</label>
            <input type="text" class="form-control" v-model="calculator.taskName" placeholder="输入任务名称">
          </div>

          <div class="form-group">
            <label>任务难度</label>
            <select class="form-control" v-model="calculator.difficulty">
              <option v-for="d in difficultyLevels" :key="d.level" :value="d.level">
                {{ d.level }}级 - {{ d.label }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>预估工时（小时）</label>
            <input type="number" class="form-control" v-model.number="calculator.hours" min="0.1" max="999" step="0.5">
          </div>

          <div class="form-group">
            <label>完成质量</label>
            <select class="form-control" v-model="calculator.quality">
              <option v-for="q in qualityOptions" :key="q.value" :value="q.value">
                {{ q.label }}（×{{ q.coefficient }}）
              </option>
            </select>
          </div>

          <button class="btn btn-primary btn-block" @click="calculatePoints">
            自动计算积分
          </button>

          <div class="result-box" v-if="calculator.result !== null">
            <div class="label">本次积分</div>
            <div class="value">{{ calculator.result.toFixed(1) }} 分</div>
            <div class="formula">
              {{ calculator.hours }}小时 × {{ currentDifficulty.points }}分/时 × {{ currentQuality.coefficient }} = {{ calculator.result.toFixed(1) }}分
            </div>
          </div>

          <div class="form-group" style="margin-top: 16px;" v-if="calculator.result !== null">
            <label>加分到成员</label>
            <select class="form-control" v-model="calculator.memberId">
              <option v-for="m in members" :key="m.id" :value="m.id">{{ m.name }}</option>
            </select>
          </div>

          <button class="btn btn-success btn-block" style="margin-top: 8px;" v-if="calculator.result !== null" @click="addPointsDirect">
            ✓ 一键加到该成员
          </button>
        </div>

        <!-- 预加分登记 -->
        <div class="card">
          <div class="card-title">
            <span class="icon">📝</span>
            预加分登记（接单时创建）
          </div>

          <div class="form-group">
            <label>任务名称</label>
            <input type="text" class="form-control" v-model="pending.taskName" placeholder="输入任务名称">
          </div>

          <div class="form-group">
            <label>任务难度</label>
            <select class="form-control" v-model="pending.difficulty">
              <option v-for="d in difficultyLevels" :key="d.level" :value="d.level">
                {{ d.level }}级 - {{ d.label }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>预估工时（小时）</label>
            <input type="number" class="form-control" v-model.number="pending.hours" min="0.1" max="999" step="0.5">
          </div>

          <div class="form-group">
            <label>预计完成日期</label>
            <input type="date" class="form-control" v-model="pending.expectedDate">
          </div>

          <div class="form-group">
            <label>指派成员</label>
            <select class="form-control" v-model="pending.memberId">
              <option v-for="m in members" :key="m.id" :value="m.id">{{ m.name }}</option>
            </select>
          </div>

          <div class="result-box" style="background: #f0fdf4;" v-if="pending.hours">
            <div class="label">预估积分（按按时完成计算）</div>
            <div class="value" style="color: #10b981;">{{ (pending.hours * getDifficultyInfo(pending.difficulty).points).toFixed(1) }} 分</div>
          </div>

          <button class="btn btn-primary btn-block" style="margin-top: 12px;" @click="createPending">
            + 创建预加分
          </button>
        </div>

        <!-- 发布任务（仅管理员） -->
        <div class="card" v-if="isAdminMode">
          <div class="card-title">
            <span class="icon">📌</span>
            发布任务到公告栏
          </div>

          <div class="form-group">
            <label>任务名称</label>
            <input type="text" class="form-control" v-model="newTask.taskName" placeholder="输入任务名称">
          </div>

          <div class="form-group">
            <label>任务难度</label>
            <select class="form-control" v-model="newTask.difficulty">
              <option v-for="d in difficultyLevels" :key="d.level" :value="d.level">
                {{ d.level }}级 - {{ d.label }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>预估工时（小时）</label>
            <input type="number" class="form-control" v-model.number="newTask.hours" min="0.1" max="999" step="0.5">
          </div>

          <div class="result-box" style="background: #fef3c7;" v-if="newTask.hours">
            <div class="label">预估积分</div>
            <div class="value" style="color: #d97706; font-size: 20px;">{{ (newTask.hours * getDifficultyInfo(newTask.difficulty).points).toFixed(1) }} 分</div>
          </div>

          <button class="btn btn-warning btn-block" style="margin-top: 12px;" @click="publishTask">
            📌 发布到公告栏
          </button>
        </div>

        <!-- 数据管理 -->
        <div class="card" v-if="isAdminMode">
          <div class="card-title">
            <span class="icon">💾</span>
            数据管理
          </div>

          <div class="btn-group">
            <button class="btn btn-outline btn-sm" @click="importData">
              📥 导入JSON
            </button>
            <button class="btn btn-outline btn-sm" @click="exportData">
              📤 导出JSON
            </button>
            <button class="btn btn-success btn-sm" @click="exportExcel">
              📊 导出Excel
            </button>
            <button class="btn btn-outline btn-sm" @click="showHistory = true">
              📋 操作历史
            </button>
            <button class="btn btn-outline btn-sm" @click="showAuditLog = true">
              📝 审计日志
            </button>
          </div>

          <div style="margin-top: 12px; font-size: 12px; color: #888;">
            <div>✅ localStorage自动保存：正常</div>
            <div>📄 记录总数：{{ records.length }}条</div>
            <div>📝 待处理：{{ pendingRecords.filter(p => p.status === 'pending').length }}条</div>
            <div>📌 公告栏：{{ taskBoard.filter(t => t.status === 'open').length }}条待认领</div>
            <div style="color: #f59e0b; margin-top: 4px;">⚠️ 数据存于浏览器缓存，请定期导出JSON备份</div>
          </div>
        </div>

        <!-- 最近操作 -->
        <div class="card" v-if="isAdminMode && lastRecord">
          <div class="card-title">
            <span class="icon">⏱️</span>
            最近操作
          </div>
          <div style="font-size: 13px; color: #666; margin-bottom: 8px;">
            {{ lastRecord.memberName }} +{{ lastRecord.points.toFixed(1) }}分（{{ formatTime(lastRecord.timestamp) }}）
          </div>
          <div style="font-size: 12px; color: #888; margin-bottom: 12px;">
            {{ lastRecord.taskName }} | {{ lastRecord.taskDifficulty }}级 | {{ lastRecord.estimatedHours }}h | ×{{ lastRecord.qualityCoefficient }}
          </div>
          <button class="btn btn-warning btn-sm" @click="showRevokeModal = true">
            ↩️ 撤销上一次加分
          </button>
        </div>

        <!-- 危险操作 -->
        <div class="card" v-if="isAdminMode" style="border: 1px solid #ef4444;">
          <div class="card-title" style="color: #ef4444;">
            <span class="icon">⚠️</span>
            危险操作
          </div>
          <div class="btn-group">
            <button class="btn btn-danger btn-sm" @click="clearAllPoints">
              清空所有积分
            </button>
            <button class="btn btn-danger btn-sm" @click="clearAllRecords">
              清空所有记录
            </button>
          </div>
        </div>
      </div>

      <!-- 右侧展示区 -->
      <div class="right-panel">
        <!-- 任务公告栏 -->
        <div class="card" v-if="taskBoard.filter(t => t.status === 'open').length > 0 || isAdminMode">
          <div class="card-title">
            <span class="icon">📌</span>
            任务公告栏
            <span style="margin-left: auto; font-size: 12px; color: #666;">
              {{ taskBoard.filter(t => t.status === 'open').length }}条待认领
            </span>
          </div>

          <div v-if="taskBoard.length === 0" class="empty-state" style="padding: 20px;">
            <div>暂无待认领任务</div>
          </div>

          <div v-else>
            <div v-for="t in taskBoard" :key="t.taskId" class="task-board-card" :class="{ claimed: t.status === 'claimed' }">
              <div class="task-header">
                <span class="task-name">📌 {{ t.taskName }}</span>
                <span class="task-status" :class="t.status">
                  {{ t.status === 'open' ? '待认领' : '已认领' }}
                </span>
              </div>
              <div class="task-meta">
                {{ t.difficulty }}级 | {{ t.estimatedHours }}h | 预估 {{ t.estimatedPoints.toFixed(1) }}分
              </div>
              
              <div v-if="t.status === 'claimed'" class="task-claimed-info">
                ✅ 已被 <strong>{{ t.claimedByMemberName }}</strong> 认领
              </div>

              <div class="task-actions" v-if="t.status === 'open'">
                <button class="btn btn-success btn-sm" @click="openClaimModal(t.taskId)">
                  🙋 认领任务
                </button>
                <button class="btn btn-danger btn-sm" v-if="isAdminMode" @click="deleteTask(t.taskId)">
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 待处理任务 -->
        <div class="card" v-if="pendingRecords.filter(p => p.status === 'pending').length > 0">
          <div class="card-title">
            <span class="icon">📋</span>
            待处理任务
            <span style="margin-left: auto; font-size: 12px; color: #f59e0b;">
              ⚠️ {{ overdueTasks.length }}条待确认
            </span>
          </div>

          <div v-for="p in pendingRecords.filter(p => p.status === 'pending')" :key="p.pendingId" 
               class="pending-card"
               :class="{ overdue: isOverdue(p.expectedDate), today: isToday(p.expectedDate) }">
            <div class="header-row">
              <div class="task-name">📋 {{ p.taskName }}</div>
              <span class="status-badge" 
                    :style="{ background: getTaskStatusColor(p.taskStatus), color: 'white' }">
                {{ getTaskStatusText(p.taskStatus) }}
              </span>
            </div>
            <div class="meta">
              {{ p.memberName }} | {{ p.taskDifficulty }}级 | {{ p.estimatedHours }}h | 
              预计：{{ p.expectedDate }}
              <span v-if="isOverdue(p.expectedDate)" style="color: #ef4444;">
                （已逾期{{ getOverdueDays(p.expectedDate) }}天）
              </span>
              <span v-else-if="isToday(p.expectedDate)" style="color: #10b981;">
                （今日到期）
              </span>
            </div>
            <div style="font-size: 12px; color: #888; margin-bottom: 12px;">
              预估积分：{{ p.estimatedPoints.toFixed(1) }}分
            </div>

            <!-- 任务状态 -->
            <div style="margin-bottom: 12px;" v-if="isAdminMode">
              <label style="font-size: 12px; color: #666; margin-bottom: 6px; display: block;">任务状态</label>
              <div class="btn-group">
                <button class="btn btn-sm" 
                        :class="p.taskStatus === 'pending' ? 'btn-primary' : 'btn-outline'"
                        @click="updateTaskStatus(p.pendingId, 'pending')">
                  未开始
                </button>
                <button class="btn btn-sm" 
                        :class="p.taskStatus === 'in_progress' ? 'btn-primary' : 'btn-outline'"
                        @click="updateTaskStatus(p.pendingId, 'in_progress')">
                  进行中
                </button>
                <button class="btn btn-sm" 
                        :class="p.taskStatus === 'completed' ? 'btn-success' : 'btn-outline'"
                        @click="updateTaskStatus(p.pendingId, 'completed')">
                  已完成
                </button>
              </div>
            </div>

            <!-- 确认入账（仅管理员） -->
            <div v-if="isAdminMode" style="background: #f8f9fa; border-radius: 8px; padding: 12px; margin-bottom: 12px;">
              <div style="font-size: 12px; color: #666; margin-bottom: 8px;">确认入账（选择完成质量）</div>
              <div class="form-group" style="margin-bottom: 8px;">
                <label style="font-size: 11px;">实际工时</label>
                <input type="number" class="form-control" v-model.number="p.actualHours" 
                       :placeholder="String(p.estimatedHours)" step="0.5" style="padding: 6px 10px;">
              </div>
              <div class="quality-options">
                <label class="quality-option" v-for="q in qualityOptions" :key="q.value">
                  <input type="radio" :name="'quality-' + p.pendingId" :value="q.value" v-model="p.selectedQuality">
                  <span>{{ q.label }}（×{{ q.coefficient }}）</span>
                </label>
              </div>
            </div>

            <div class="btn-group" v-if="isAdminMode">
              <button class="btn btn-success btn-sm" @click="confirmPending(p)" :disabled="!p.selectedQuality">
                ✓ 确认入账
              </button>
              <button class="btn btn-outline btn-sm" @click="editPending(p)">
                编辑
              </button>
              <button class="btn btn-danger btn-sm" @click="cancelPending(p.pendingId)">
                取消任务
              </button>
            </div>
          </div>
        </div>

        <!-- 团队积分概览 -->
        <div class="card">
          <div class="card-title">
            <span class="icon">📊</span>
            团队积分概览
          </div>

          <div class="team-stats">
            <div class="label">团队总积分</div>
            <div class="value">{{ totalPoints.toFixed(1) }} 分</div>
          </div>

          <div class="members-grid">
            <div class="member-card" v-for="m in members" :key="m.id" @click="showMemberHistory(m)">
              <div class="name">{{ m.name }}</div>
              <div class="points">{{ m.totalPoints.toFixed(1) }}</div>
              <div class="percent">{{ getPercent(m.totalPoints) }}%</div>
            </div>
          </div>

          <div class="chart-container" ref="pieChartRef"></div>
        </div>
      </div>
    </div>

    <!-- 认领任务弹窗 -->
    <div class="modal-overlay" v-if="showClaimModal" @click.self="showClaimModal = false">
      <div class="modal" style="max-width: 400px;">
        <div class="modal-header">
          <h3>🙋 认领任务</h3>
          <button class="modal-close" @click="showClaimModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>选择你的名字</label>
            <select class="form-control" v-model="claimMemberId">
              <option v-for="m in members" :key="m.id" :value="m.id">{{ m.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>预期完成日期</label>
            <input type="date" class="form-control" v-model="claimExpectedDate">
          </div>
          <div style="font-size: 12px; color: #888; margin-top: 8px;">
            认领后任务将出现在你的"待处理任务"列表中
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="showClaimModal = false">取消</button>
          <button class="btn btn-success" @click="claimTask">确认认领</button>
        </div>
      </div>
    </div>

    <!-- 密码验证弹窗 -->
    <div class="modal-overlay" v-if="showPasswordModal" @click.self="showPasswordModal = false">
      <div class="modal" style="max-width: 360px;">
        <div class="modal-header">
          <h3>🔐 进入管理模式</h3>
          <button class="modal-close" @click="showPasswordModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>请输入管理员密码</label>
            <input type="password" class="form-control" v-model="passwordInput" 
                   @keyup.enter="verifyPassword" placeholder="输入密码"
                   style="text-align: center; font-size: 18px; letter-spacing: 4px;">
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="showPasswordModal = false">取消</button>
          <button class="btn btn-primary" @click="verifyPassword">确认</button>
        </div>
      </div>
    </div>

    <!-- 撤销确认弹窗 -->
    <div class="modal-overlay" v-if="showRevokeModal" @click.self="showRevokeModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3>确认撤销</h3>
          <button class="modal-close" @click="showRevokeModal = false">&times;</button>
        </div>
        <div class="modal-body" v-if="lastRecord">
          <p style="margin-bottom: 12px;">确定要撤销以下加分吗？</p>
          <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; margin-bottom: 16px;">
            <div><strong>成员：</strong>{{ lastRecord.memberName }}</div>
            <div><strong>积分：</strong>{{ lastRecord.points.toFixed(1) }}分</div>
            <div><strong>任务：</strong>{{ lastRecord.taskName }}</div>
            <div><strong>时间：</strong>{{ formatTime(lastRecord.timestamp) }}</div>
          </div>
          <div class="form-group">
            <label>撤销原因（必填）</label>
            <input type="text" class="form-control" v-model="revokeReason" placeholder="请输入撤销原因">
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="showRevokeModal = false">取消</button>
          <button class="btn btn-danger" @click="revokeLastRecord" :disabled="!revokeReason">确认撤销</button>
        </div>
      </div>
    </div>

    <!-- 操作历史弹窗 -->
    <div class="modal-overlay" v-if="showHistory" @click.self="showHistory = false">
      <div class="modal" style="max-width: 700px;">
        <div class="modal-header">
          <h3>操作历史</h3>
          <button class="modal-close" @click="showHistory = false">&times;</button>
        </div>
        <div class="modal-body">
          <div style="margin-bottom: 12px; display: flex; gap: 8px; align-items: center;">
            <label style="display: flex; align-items: center; gap: 4px; font-size: 13px;">
              <input type="checkbox" v-model="selectAllHistory" @change="toggleSelectAll">
              全选
            </label>
            <span style="font-size: 13px; color: #666;">已选：{{ selectedRecords.length }}条</span>
            <button class="btn btn-warning btn-sm" @click="showBatchModifyModal = true" :disabled="selectedRecords.length === 0">
              批量修改质量
            </button>
            <button class="btn btn-danger btn-sm" @click="batchDelete" :disabled="selectedRecords.length === 0">
              批量删除
            </button>
          </div>

          <div v-if="records.length === 0" class="empty-state">
            <div class="icon">📭</div>
            <div>暂无操作记录</div>
          </div>

          <div v-else style="max-height: 500px; overflow-y: auto;">
            <div v-for="r in records" :key="r.recordId" class="history-item">
              <div class="checkbox-item" :class="{ selected: r.selected }">
                <input type="checkbox" v-model="r.selected">
                <div style="flex: 1;">
                  <div class="header">
                    <span>{{ formatTime(r.timestamp) }}  {{ r.memberName }}  <strong class="points">+{{ r.points.toFixed(1) }}分</strong></span>
                  </div>
                  <div class="detail">
                    {{ r.taskName }} | {{ r.taskDifficulty }}级 | {{ r.estimatedHours }}h | ×{{ r.qualityCoefficient }}
                  </div>
                  <div v-if="r.modificationHistory && r.modificationHistory.length > 0" style="font-size: 11px; color: #f59e0b; margin-top: 4px;">
                    📝 已修改{{ r.modificationHistory.length }}次
                  </div>
                  <div class="btn-group" style="margin-top: 8px;">
                    <button class="btn btn-outline btn-sm" @click="editRecord(r)">编辑</button>
                    <button class="btn btn-danger btn-sm" @click="deleteRecord(r.recordId)">删除</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑记录弹窗 -->
    <div class="modal-overlay" v-if="showEditModal" @click.self="showEditModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3>编辑积分记录</h3>
          <button class="modal-close" @click="showEditModal = false">&times;</button>
        </div>
        <div class="modal-body" v-if="editingRecord">
          <div class="tabs">
            <div class="tab" :class="{ active: editTab === 'current' }" @click="editTab = 'current'">当前记录</div>
            <div class="tab" :class="{ active: editTab === 'history' }" @click="editTab = 'history'">修改历史</div>
          </div>

          <div v-if="editTab === 'current'">
            <div class="form-group">
              <label>成员</label>
              <input type="text" class="form-control" :value="editingRecord.memberName" disabled>
            </div>
            <div class="form-group">
              <label>任务名称</label>
              <input type="text" class="form-control" v-model="editingRecord.taskName">
            </div>
            <div class="form-group">
              <label>任务难度</label>
              <select class="form-control" v-model="editingRecord.taskDifficulty">
                <option v-for="d in difficultyLevels" :key="d.level" :value="d.level">{{ d.level }}级</option>
              </select>
            </div>
            <div class="form-group">
              <label>工时</label>
              <input type="number" class="form-control" v-model.number="editingRecord.estimatedHours" step="0.5">
            </div>
            <div class="form-group">
              <label>完成质量</label>
              <select class="form-control" v-model="editingRecord.qualityCoefficient">
                <option v-for="q in qualityOptions" :key="q.value" :value="q.coefficient">{{ q.label }}（×{{ q.coefficient }}）</option>
              </select>
            </div>

            <div class="result-box">
              <div class="label">积分预览</div>
              <div class="value">{{ calculateEditedPoints.toFixed(1) }} 分</div>
              <div class="diff-highlight" :class="calculateEditedPoints > editingRecord.points ? 'positive' : 'negative'">
                变化：{{ calculateEditedPoints > editingRecord.points ? '+' : '' }}{{ (calculateEditedPoints - editingRecord.points).toFixed(1) }}分
              </div>
            </div>

            <div class="form-group" style="margin-top: 12px;">
              <label>修改原因（必填）</label>
              <input type="text" class="form-control" v-model="editReason" placeholder="请输入修改原因">
            </div>
          </div>

          <div v-else>
            <div v-if="!editingRecord.modificationHistory || editingRecord.modificationHistory.length === 0" class="empty-state">
              <div class="icon">📭</div>
              <div>暂无修改历史</div>
            </div>
            <div v-else>
              <div v-for="mod in editingRecord.modificationHistory" :key="mod.modificationId" style="background: #f8f9fa; padding: 12px; border-radius: 8px; margin-bottom: 12px;">
                <div style="font-size: 12px; color: #666; margin-bottom: 8px;">修改时间：{{ formatTime(mod.modifiedAt) }}</div>
                <div style="font-size: 13px; margin-bottom: 8px;">原因：{{ mod.reason }}</div>
                <div style="font-size: 12px; color: #888;">
                  <div v-for="change in mod.changes" :key="change.field">
                    {{ change.field }}: {{ change.oldValue }} → {{ change.newValue }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="showEditModal = false">取消</button>
          <button class="btn btn-primary" @click="saveEditRecord" :disabled="!editReason">保存修改</button>
        </div>
      </div>
    </div>

    <!-- 批量修改弹窗 -->
    <div class="modal-overlay" v-if="showBatchModifyModal" @click.self="showBatchModifyModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3>批量修改完成质量</h3>
          <button class="modal-close" @click="showBatchModifyModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <p style="margin-bottom: 12px;">已选记录：{{ selectedRecords.length }}条</p>

          <div class="form-group">
            <label>修改为</label>
            <select class="form-control" v-model="batchQuality">
              <option v-for="q in qualityOptions" :key="q.value" :value="q.value">{{ q.label }}（×{{ q.coefficient }}）</option>
            </select>
          </div>

          <div class="form-group">
            <label>修改原因（必填）</label>
            <input type="text" class="form-control" v-model="batchReason" placeholder="请输入修改原因">
          </div>

          <div class="result-box">
            <div class="label">积分变化预览</div>
            <div class="value" style="font-size: 20px;">{{ batchPointsChange > 0 ? '+' : '' }}{{ batchPointsChange.toFixed(1) }} 分</div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="showBatchModifyModal = false">取消</button>
          <button class="btn btn-warning" @click="confirmBatchModify" :disabled="!batchReason">确认修改</button>
        </div>
      </div>
    </div>

    <!-- 审计日志弹窗 -->
    <div class="modal-overlay" v-if="showAuditLog" @click.self="showAuditLog = false">
      <div class="modal" style="max-width: 700px;">
        <div class="modal-header">
          <h3>审计日志</h3>
          <button class="modal-close" @click="showAuditLog = false">&times;</button>
        </div>
        <div class="modal-body">
          <div v-if="auditLogs.length === 0" class="empty-state">
            <div class="icon">📭</div>
            <div>暂无审计日志</div>
          </div>
          <div v-else style="max-height: 500px; overflow-y: auto;">
            <div v-for="log in auditLogs" :key="log.logId" style="background: #f8f9fa; padding: 12px; border-radius: 8px; margin-bottom: 12px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-weight: 600;">{{ getActionText(log.action) }}</span>
                <span style="font-size: 12px; color: #888;">{{ formatTime(log.timestamp) }}</span>
              </div>
              <div style="font-size: 12px; color: #666;">
                <div v-if="log.details.originalRecord">
                  <div>成员：{{ log.details.originalRecord.memberName }}</div>
                  <div>任务：{{ log.details.originalRecord.taskName }}</div>
                  <div>积分：{{ log.details.originalRecord.points }}分</div>
                </div>
                <div v-if="log.details.reason">
                  <div>原因：{{ log.details.reason }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 成员历史弹窗 -->
    <div class="modal-overlay" v-if="showMemberModal" @click.self="showMemberModal = false">
      <div class="modal" style="max-width: 600px;">
        <div class="modal-header">
          <h3>{{ currentMember?.name }} 的积分记录</h3>
          <button class="modal-close" @click="showMemberModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div v-if="memberRecords.length === 0" class="empty-state">
            <div class="icon">📭</div>
            <div>暂无记录</div>
          </div>
          <div v-else style="max-height: 400px; overflow-y: auto;">
            <div v-for="r in memberRecords" :key="r.recordId" class="history-item">
              <div class="header">
                <span>{{ formatDate(r.date) }}</span>
                <span class="points">+{{ r.points.toFixed(1) }}分</span>
              </div>
              <div class="detail">{{ r.taskName }} | {{ r.taskDifficulty }}级 | {{ r.estimatedHours }}h | ×{{ r.qualityCoefficient }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 逾期提醒弹窗 -->
    <div class="modal-overlay" v-if="showOverdueReminder">
      <div class="modal">
        <div class="modal-header" style="background: #fef2f2;">
          <h3 style="color: #ef4444;">⚠️ 任务提醒</h3>
        </div>
        <div class="modal-body">
          <div v-if="overdueTasks.length > 0" class="alert alert-danger">
            <strong>🔴 逾期任务：{{ overdueTasks.length }}条</strong>
            <ul style="margin: 8px 0 0 20px; font-size: 13px;">
              <li v-for="p in overdueTasks" :key="p.pendingId">
                {{ p.taskName }}（{{ p.memberName }}）- 逾期{{ getOverdueDays(p.expectedDate) }}天
              </li>
            </ul>
          </div>

          <div v-if="todayTasks.length > 0" class="alert alert-warning">
            <strong>⚠️ 今日到期：{{ todayTasks.length }}条</strong>
            <ul style="margin: 8px 0 0 20px; font-size: 13px;">
              <li v-for="p in todayTasks" :key="p.pendingId">
                {{ p.taskName }}（{{ p.memberName }}）
              </li>
            </ul>
          </div>

          <p style="font-size: 13px; color: #666;">请及时处理逾期任务，避免影响团队积分统计。</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="showOverdueReminder = false">稍后提醒</button>
          <button class="btn btn-primary" @click="showOverdueReminder = false">立即处理</button>
        </div>
      </div>
    </div>

    <!-- 隐藏的文件输入 -->
    <input type="file" ref="fileInputRef" accept=".json" style="display: none;" @change="handleFileImport">
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import * as XLSX from 'xlsx'
import * as echarts from 'echarts'

// 成员数据
const members = ref([
  { id: 'member_01', name: '王思贤', totalPoints: 0 },
  { id: 'member_02', name: '胡斌', totalPoints: 0 },
  { id: 'member_03', name: '温嘉凌', totalPoints: 0 },
  { id: 'member_04', name: '赵梓丞', totalPoints: 0 },
  { id: 'member_05', name: '胡春红', totalPoints: 0 },
  { id: 'member_06', name: '周志赋', totalPoints: 0 }
])

// 难度等级
const difficultyLevels = ref([
  { level: 1, label: '简单打杂、文档整理、基础排版、进度跟进', points: 1 },
  { level: 2, label: '基础前端、数据集标注、PPT制作、简易辅助开发', points: 2 },
  { level: 3, label: '基础前端、数据集标注、PPT制作、简易辅助开发', points: 3 },
  { level: 4, label: '后端核心开发、模型训练、智能合约、系统联调', points: 4 },
  { level: 5, label: '模型调优、合约部署、核心bug修复、性能攻坚', points: 5 }
])

// 完成质量
const qualityOptions = ref([
  { value: 'ontime', label: '按时合格完成', coefficient: 1.0 },
  { value: 'delayed', label: '超时完成、验收合格', coefficient: 0.7 },
  { value: 'poor', label: '敷衍摆烂、低质量交付', coefficient: 0.4 }
])

// 积分计算器
const calculator = ref({
  taskName: '',
  difficulty: 3,
  hours: 1,
  quality: 'ontime',
  memberId: 'member_01',
  result: null
})

// 预加分
const pending = ref({
  taskName: '',
  difficulty: 3,
  hours: 1,
  expectedDate: new Date().toISOString().split('T')[0],
  memberId: 'member_01'
})

// 发布任务
const newTask = ref({
  taskName: '',
  difficulty: 3,
  hours: 1
})

// 认领任务
const claimTaskId = ref('')
const claimMemberId = ref('')
const claimExpectedDate = ref(new Date().toISOString().split('T')[0])
const showClaimModal = ref(false)

// 数据存储
const records = ref([])
const pendingRecords = ref([])
const auditLogs = ref([])
const taskBoard = ref([]) // 任务公告栏

// UI状态
const isAdminMode = ref(false)
const showPasswordModal = ref(false)
const passwordInput = ref('')
const adminPassword = '123456' // 管理员密码，可自行修改

const showRevokeModal = ref(false)
const showHistory = ref(false)
const showEditModal = ref(false)
const showBatchModifyModal = ref(false)
const showAuditLog = ref(false)
const showMemberModal = ref(false)
const showOverdueReminder = ref(false)
const editTab = ref('current')

// 编辑相关
const editingRecord = ref(null)
const editReason = ref('')
const revokeReason = ref('')

// 批量操作
const selectAllHistory = ref(false)
const batchQuality = ref('ontime')
const batchReason = ref('')

// 成员详情
const currentMember = ref(null)
const memberRecords = ref([])

// refs
const pieChartRef = ref(null)
const fileInputRef = ref(null)

// 计算属性
const totalPoints = computed(() => {
  return members.value.reduce((sum, m) => sum + m.totalPoints, 0)
})

const currentDifficulty = computed(() => {
  return difficultyLevels.value.find(d => d.level === calculator.value.difficulty) || difficultyLevels.value[2]
})

const currentQuality = computed(() => {
  return qualityOptions.value.find(q => q.value === calculator.value.quality) || qualityOptions.value[0]
})

const lastRecord = computed(() => {
  return records.value.length > 0 ? records.value[records.value.length - 1] : null
})

const overdueTasks = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return pendingRecords.value.filter(p => p.expectedDate < today && p.status === 'pending')
})

const todayTasks = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return pendingRecords.value.filter(p => p.expectedDate === today && p.status === 'pending')
})

const selectedRecords = computed(() => {
  return records.value.filter(r => r.selected)
})

const calculateEditedPoints = computed(() => {
  if (!editingRecord.value) return 0
  const diff = difficultyLevels.value.find(d => d.level === editingRecord.value.taskDifficulty)
  const qual = qualityOptions.value.find(q => q.coefficient === editingRecord.value.qualityCoefficient)
  return editingRecord.value.estimatedHours * (diff?.points || 1) * (qual?.coefficient || 1)
})

const batchPointsChange = computed(() => {
  const newCoeff = qualityOptions.value.find(q => q.value === batchQuality.value)?.coefficient || 1
  return selectedRecords.value.reduce((sum, r) => {
    const diff = difficultyLevels.value.find(d => d.level === r.taskDifficulty)
    const newPoints = r.estimatedHours * (diff?.points || 1) * newCoeff
    return sum + (newPoints - r.points)
  }, 0)
})

// 方法
const generateId = (prefix) => {
  const now = new Date()
  const timestamp = now.toISOString().replace(/[-:T]/g, '').split('.')[0]
  const random = Math.random().toString(36).substr(2, 3)
  return `${prefix}_${timestamp}_${random}`
}

const getDifficultyInfo = (level) => {
  return difficultyLevels.value.find(d => d.level === level) || difficultyLevels.value[2]
}

const getPercent = (points) => {
  if (totalPoints.value === 0) return '0.0'
  return ((points / totalPoints.value) * 100).toFixed(1)
}

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const formatDate = (dateStr) => {
  return dateStr
}

const calculatePoints = () => {
  const diff = currentDifficulty.value
  const qual = currentQuality.value
  calculator.value.result = calculator.value.hours * diff.points * qual.coefficient
}

const addPointsDirect = () => {
  if (calculator.value.result === null || !calculator.value.memberId) return

  const member = members.value.find(m => m.id === calculator.value.memberId)
  if (!member) return

  const diff = currentDifficulty.value
  const qual = currentQuality.value

  const record = {
    recordId: generateId('rec'),
    memberId: calculator.value.memberId,
    memberName: member.name,
    taskName: calculator.value.taskName || '未命名任务',
    taskDifficulty: calculator.value.difficulty,
    difficultyLabel: diff.label,
    pointsPerHour: diff.points,
    estimatedHours: calculator.value.hours,
    qualityStatus: qual.label,
    qualityCoefficient: qual.coefficient,
    points: calculator.value.result,
    timestamp: new Date().toISOString(),
    date: new Date().toISOString().split('T')[0],
    source: 'direct',
    selected: false,
    modificationHistory: []
  }

  records.value.push(record)
  member.totalPoints += calculator.value.result

  saveToStorage()

  // 重置计算器
  calculator.value.taskName = ''
  calculator.value.result = null
}

const createPending = () => {
  if (!pending.value.taskName || !pending.value.hours) {
    alert('请填写任务名称和预估工时')
    return
  }

  const member = members.value.find(m => m.id === pending.value.memberId)
  const diff = getDifficultyInfo(pending.value.difficulty)

  const pendingRecord = {
    pendingId: generateId('pending'),
    memberId: pending.value.memberId,
    memberName: member.name,
    taskName: pending.value.taskName,
    taskDifficulty: pending.value.difficulty,
    difficultyLabel: diff.label,
    pointsPerHour: diff.points,
    estimatedHours: pending.value.hours,
    estimatedPoints: pending.value.hours * diff.points,
    expectedDate: pending.value.expectedDate,
    taskStatus: 'pending',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    selectedQuality: null,
    actualHours: pending.value.hours
  }

  pendingRecords.value.push(pendingRecord)
  saveToStorage()

  // 重置表单
  pending.value.taskName = ''
  pending.value.hours = 1
}

const confirmPending = (p) => {
  if (!p.selectedQuality) {
    alert('请选择完成质量')
    return
  }

  const member = members.value.find(m => m.id === p.memberId)
  const qual = qualityOptions.value.find(q => q.value === p.selectedQuality)
  const actualHours = p.actualHours || p.estimatedHours
  const actualPoints = actualHours * p.pointsPerHour * qual.coefficient

  const record = {
    recordId: generateId('rec'),
    memberId: p.memberId,
    memberName: p.memberName,
    taskName: p.taskName,
    taskDifficulty: p.taskDifficulty,
    difficultyLabel: p.difficultyLabel,
    pointsPerHour: p.pointsPerHour,
    estimatedHours: actualHours,
    qualityStatus: qual.label,
    qualityCoefficient: qual.coefficient,
    points: actualPoints,
    timestamp: new Date().toISOString(),
    date: p.expectedDate,
    source: 'pending',
    pendingId: p.pendingId,
    selected: false,
    modificationHistory: []
  }

  records.value.push(record)
  member.totalPoints += actualPoints

  // 更新预加分状态
  p.status = 'processed'
  p.processedAt = new Date().toISOString()
  p.qualityStatus = qual.label
  p.qualityCoefficient = qual.coefficient
  p.actualHours = actualHours
  p.actualPoints = actualPoints

  saveToStorage()
}

const updateTaskStatus = (pendingId, status) => {
  const p = pendingRecords.value.find(item => item.pendingId === pendingId)
  if (p) {
    p.taskStatus = status
    p.updatedAt = new Date().toISOString()
    saveToStorage()
  }
}

const cancelPending = (pendingId) => {
  if (!confirm('确定要取消这个任务吗？')) return

  const p = pendingRecords.value.find(item => item.pendingId === pendingId)
  if (p) {
    p.status = 'cancelled'
    saveToStorage()
  }
}

const editPending = (p) => {
  const newTaskName = prompt('任务名称：', p.taskName)
  if (newTaskName) {
    p.taskName = newTaskName
    p.updatedAt = new Date().toISOString()
    saveToStorage()
  }
}

const revokeLastRecord = () => {
  if (!revokeReason.value || !lastRecord.value) return

  const record = lastRecord.value
  const member = members.value.find(m => m.id === record.memberId)

  // 记录审计日志
  auditLogs.value.push({
    logId: generateId('audit'),
    action: 'revoke',
    timestamp: new Date().toISOString(),
    operator: '系统管理员',
    details: {
      originalRecord: { ...record },
      reason: revokeReason.value
    }
  })

  // 扣除积分
  member.totalPoints -= record.points

  // 删除记录
  records.value.pop()

  saveToStorage()

  showRevokeModal.value = false
  revokeReason.value = ''
}

const editRecord = (r) => {
  editingRecord.value = { ...r }
  editTab.value = 'current'
  editReason.value = ''
  showEditModal.value = true
}

const saveEditRecord = () => {
  if (!editReason.value || !editingRecord.value) return

  const original = records.value.find(r => r.recordId === editingRecord.value.recordId)
  if (!original) return

  const member = members.value.find(m => m.id === original.memberId)

  // 记录修改历史
  const changes = []
  if (original.estimatedHours !== editingRecord.value.estimatedHours) {
    changes.push({ field: 'estimatedHours', oldValue: original.estimatedHours, newValue: editingRecord.value.estimatedHours })
  }
  if (original.taskDifficulty !== editingRecord.value.taskDifficulty) {
    changes.push({ field: 'taskDifficulty', oldValue: original.taskDifficulty, newValue: editingRecord.value.taskDifficulty })
  }
  if (original.qualityCoefficient !== editingRecord.value.qualityCoefficient) {
    changes.push({ field: 'qualityCoefficient', oldValue: original.qualityCoefficient, newValue: editingRecord.value.qualityCoefficient })
  }

  if (changes.length > 0) {
    if (!original.modificationHistory) {
      original.modificationHistory = []
    }
    original.modificationHistory.push({
      modificationId: generateId('mod'),
      modifiedAt: new Date().toISOString(),
      modifiedBy: '系统管理员',
      changes: changes,
      reason: editReason.value
    })
  }

  // 更新积分
  const oldPoints = original.points
  const newPoints = calculateEditedPoints.value

  member.totalPoints = member.totalPoints - oldPoints + newPoints

  // 更新记录
  Object.assign(original, {
    taskName: editingRecord.value.taskName,
    taskDifficulty: editingRecord.value.taskDifficulty,
    estimatedHours: editingRecord.value.estimatedHours,
    qualityCoefficient: editingRecord.value.qualityCoefficient,
    points: newPoints
  })

  saveToStorage()

  showEditModal.value = false
  editingRecord.value = null
  editReason.value = ''
}

const deleteRecord = (recordId) => {
  if (!confirm('确定要删除这条记录吗？')) return

  const record = records.value.find(r => r.recordId === recordId)
  if (!record) return

  const member = members.value.find(m => m.id === record.memberId)
  member.totalPoints -= record.points

  // 记录审计日志
  auditLogs.value.push({
    logId: generateId('audit'),
    action: 'delete',
    timestamp: new Date().toISOString(),
    operator: '系统管理员',
    details: {
      originalRecord: { ...record },
      reason: '用户主动删除'
    }
  })

  records.value = records.value.filter(r => r.recordId !== recordId)
  saveToStorage()
}

const toggleSelectAll = () => {
  records.value.forEach(r => {
    r.selected = selectAllHistory.value
  })
}

const confirmBatchModify = () => {
  if (!batchReason.value) return

  const qual = qualityOptions.value.find(q => q.value === batchQuality.value)

  selectedRecords.value.forEach(r => {
    const member = members.value.find(m => m.id === r.memberId)
    const diff = difficultyLevels.value.find(d => d.level === r.taskDifficulty)
    const newPoints = r.estimatedHours * diff.points * qual.coefficient

    // 记录修改历史
    if (!r.modificationHistory) {
      r.modificationHistory = []
    }
    r.modificationHistory.push({
      modificationId: generateId('mod'),
      modifiedAt: new Date().toISOString(),
      modifiedBy: '系统管理员',
      changes: [
        { field: 'qualityCoefficient', oldValue: r.qualityCoefficient, newValue: qual.coefficient },
        { field: 'points', oldValue: r.points, newValue: newPoints }
      ],
      reason: batchReason.value
    })

    // 更新积分
    member.totalPoints = member.totalPoints - r.points + newPoints

    r.qualityStatus = qual.label
    r.qualityCoefficient = qual.coefficient
    r.points = newPoints
    r.selected = false
  })

  // 记录审计日志
  auditLogs.value.push({
    logId: generateId('audit'),
    action: 'batch_modify_quality',
    timestamp: new Date().toISOString(),
    operator: '系统管理员',
    details: {
      affectedRecords: selectedRecords.value.map(r => r.recordId),
      newQuality: qual.label,
      newCoefficient: qual.coefficient,
      reason: batchReason.value
    }
  })

  saveToStorage()

  showBatchModifyModal.value = false
  batchReason.value = ''
  selectAllHistory.value = false
}

const batchDelete = () => {
  if (!confirm(`确定要删除 ${selectedRecords.value.length} 条记录吗？此操作不可恢复！`)) return

  const reason = prompt('请输入删除原因：')
  if (!reason) return

  selectedRecords.value.forEach(r => {
    const member = members.value.find(m => m.id === r.memberId)
    member.totalPoints -= r.points
  })

  // 记录审计日志
  auditLogs.value.push({
    logId: generateId('audit'),
    action: 'batch_delete',
    timestamp: new Date().toISOString(),
    operator: '系统管理员',
    details: {
      affectedRecords: selectedRecords.value.map(r => ({
        memberName: r.memberName,
        taskName: r.taskName,
        points: r.points
      })),
      reason: reason
    }
  })

  records.value = records.value.filter(r => !r.selected)
  saveToStorage()

  selectAllHistory.value = false
}

const clearAllPoints = () => {
  if (!confirm('确定要清空所有积分吗？此操作不可恢复！')) return

  members.value.forEach(m => {
    m.totalPoints = 0
  })
  records.value = []
  pendingRecords.value = []
  auditLogs.value = []

  saveToStorage()
}

const clearAllRecords = () => {
  if (!confirm('确定要清空所有记录吗？此操作不可恢复！')) return

  records.value = []
  pendingRecords.value = []

  saveToStorage()
}

const saveToStorage = () => {
  const data = {
    storageVersion: '4.0',
    lastUpdated: new Date().toISOString(),
    members: members.value,
    records: records.value,
    pendingRecords: pendingRecords.value.filter(p => p.status === 'pending'),
    auditLogs: auditLogs.value,
    taskBoard: taskBoard.value
  }
  localStorage.setItem('team_points_data', JSON.stringify(data))
}

const loadFromStorage = () => {
  const data = localStorage.getItem('team_points_data')
  if (data) {
    try {
      const parsed = JSON.parse(data)
      if (parsed.members) members.value = parsed.members
      if (parsed.records) records.value = parsed.records
      if (parsed.pendingRecords) pendingRecords.value = parsed.pendingRecords
      if (parsed.auditLogs) auditLogs.value = parsed.auditLogs
      if (parsed.taskBoard) taskBoard.value = parsed.taskBoard
    } catch (e) {
      console.error('加载数据失败', e)
    }
  }
}

const importData = () => {
  fileInputRef.value.click()
}

const handleFileImport = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result)
      if (data.members) members.value = data.members
      if (data.records) records.value = data.records
      if (data.pendingRecords) pendingRecords.value = data.pendingRecords
      if (data.auditLogs) auditLogs.value = data.auditLogs
      if (data.taskBoard) taskBoard.value = data.taskBoard
      saveToStorage()
      alert('导入成功！')
    } catch (err) {
      alert('JSON格式不正确，请检查文件')
    }
  }
  reader.readAsText(file)
  event.target.value = ''
}

const exportData = () => {
  const data = {
    storageVersion: '4.0',
    lastUpdated: new Date().toISOString(),
    members: members.value,
    records: records.value,
    pendingRecords: pendingRecords.value,
    auditLogs: auditLogs.value,
    taskBoard: taskBoard.value
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `小组贡献积分统计_${new Date().toISOString().split('T')[0].replace(/-/g, '')}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const exportExcel = () => {
  // 创建工作簿
  const wb = XLSX.utils.book_new()

  // Sheet 1: 按日积分统计表（带公式明细）
  const dates = [...new Set(records.value.map(r => r.date))].sort()
  const memberNames = members.value.map(m => m.name)

  const sheet1Data = [['日期', ...memberNames, '当日合计']]

  dates.forEach(date => {
    const row = [date]
    let dayTotal = 0
    
    members.value.forEach(m => {
      const dayRecords = records.value.filter(r => r.date === date && r.memberId === m.id)
      
      if (dayRecords.length === 0) {
        row.push('')
      } else if (dayRecords.length === 1) {
        // 单条记录：显示"任务名 | 难度级 | 工时h | ×系数=积分"
        const r = dayRecords[0]
        const formulaStr = `${r.taskName} | ${r.taskDifficulty}级 | ${r.estimatedHours}h | ×${r.qualityCoefficient}=${r.points.toFixed(1)}`
        row.push(formulaStr)
        dayTotal += r.points
      } else {
        // 多条记录：显示"任务1 | x级 | xh | ×x=x.x; 任务2 | x级 | xh | ×x=x.x"
        const formulaParts = dayRecords.map(r => {
          return `${r.taskName} | ${r.taskDifficulty}级 | ${r.estimatedHours}h | ×${r.qualityCoefficient}=${r.points.toFixed(1)}`
        })
        const totalPoints = dayRecords.reduce((sum, r) => sum + r.points, 0)
        row.push(formulaParts.join('\n') + `\n合计=${totalPoints.toFixed(1)}`)
        dayTotal += totalPoints
      }
    })
    
    row.push(dayTotal.toFixed(1))
    sheet1Data.push(row)
  })

  // 汇总行
  const totalRow = ['累计']
  let grandTotal = 0
  members.value.forEach(m => {
    totalRow.push(m.totalPoints.toFixed(1))
    grandTotal += m.totalPoints
  })
  totalRow.push(grandTotal.toFixed(1))
  sheet1Data.push(totalRow)

  const ws1 = XLSX.utils.aoa_to_sheet(sheet1Data)
  
  // 设置列宽
  ws1['!cols'] = [
    { wch: 12 },  // 日期
    { wch: 40 },  // 成员1
    { wch: 40 },  // 成员2
    { wch: 40 },  // 成员3
    { wch: 40 },  // 成员4
    { wch: 40 },  // 成员5
    { wch: 40 },  // 成员6
    { wch: 12 }   // 当日合计
  ]
  
  XLSX.utils.book_append_sheet(wb, ws1, '按日积分统计')

  // Sheet 2: 原始操作日志
  const sheet2Data = [['日期', '成员', '任务名称', '难度', '工时', '质量系数', '积分计算', '积分', '时间']]
  records.value.forEach(r => {
    const formulaStr = `${r.estimatedHours}h × ${r.taskDifficulty}级(${r.pointsPerHour}分/h) × ${r.qualityCoefficient} = ${r.points.toFixed(1)}`
    sheet2Data.push([
      r.date,
      r.memberName,
      r.taskName,
      `${r.taskDifficulty}级`,
      r.estimatedHours,
      `×${r.qualityCoefficient}`,
      formulaStr,
      r.points.toFixed(1),
      formatTime(r.timestamp)
    ])
  })

  const ws2 = XLSX.utils.aoa_to_sheet(sheet2Data)
  ws2['!cols'] = [
    { wch: 12 },  // 日期
    { wch: 10 },  // 成员
    { wch: 20 },  // 任务名称
    { wch: 8 },   // 难度
    { wch: 8 },   // 工时
    { wch: 10 },  // 质量系数
    { wch: 35 },  // 积分计算
    { wch: 8 },   // 积分
    { wch: 20 }   // 时间
  ]
  XLSX.utils.book_append_sheet(wb, ws2, '原始操作日志')

  // 导出
  XLSX.writeFile(wb, `小组贡献积分统计_${new Date().toISOString().split('T')[0].replace(/-/g, '')}.xlsx`)
}

const showMemberHistory = (m) => {
  currentMember.value = m
  memberRecords.value = records.value.filter(r => r.memberId === m.id).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  showMemberModal.value = true
}

const isOverdue = (dateStr) => {
  const today = new Date().toISOString().split('T')[0]
  return dateStr < today
}

const isToday = (dateStr) => {
  const today = new Date().toISOString().split('T')[0]
  return dateStr === today
}

const getOverdueDays = (dateStr) => {
  const expected = new Date(dateStr)
  const today = new Date()
  const diff = Math.floor((today - expected) / (1000 * 60 * 60 * 24))
  return diff
}

const getTaskStatusColor = (status) => {
  const colors = {
    pending: '#9ca3af',
    in_progress: '#3b82f6',
    completed: '#10b981',
    cancelled: '#ef4444'
  }
  return colors[status] || '#9ca3af'
}

const getTaskStatusText = (status) => {
  const texts = {
    pending: '未开始',
    in_progress: '进行中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return texts[status] || '未知'
}

const getActionText = (action) => {
  const texts = {
    revoke: '撤销操作',
    delete: '删除操作',
    batch_modify_quality: '批量修改质量',
    batch_delete: '批量删除'
  }
  return texts[action] || action
}

// 管理模式相关
const enterAdminMode = () => {
  showPasswordModal.value = true
  passwordInput.value = ''
}

const verifyPassword = () => {
  if (passwordInput.value === adminPassword) {
    isAdminMode.value = true
    showPasswordModal.value = false
    passwordInput.value = ''
  } else {
    alert('密码错误！')
  }
}

const exitAdminMode = () => {
  isAdminMode.value = false
}

// 任务公告栏相关
const publishTask = () => {
  if (!newTask.value.taskName || !newTask.value.hours) {
    alert('请填写任务名称和工时')
    return
  }

  const diff = getDifficultyInfo(newTask.value.difficulty)

  taskBoard.value.push({
    taskId: generateId('task'),
    taskName: newTask.value.taskName,
    difficulty: newTask.value.difficulty,
    difficultyLabel: diff.label,
    pointsPerHour: diff.points,
    estimatedHours: newTask.value.hours,
    estimatedPoints: newTask.value.hours * diff.points,
    status: 'open', // open / claimed
    createdAt: new Date().toISOString(),
    claimedBy: null,
    claimedAt: null
  })

  saveToStorage()

  // 重置表单
  newTask.value.taskName = ''
  newTask.value.hours = 1
}

const openClaimModal = (taskId) => {
  claimTaskId.value = taskId
  claimMemberId.value = 'member_01'
  claimExpectedDate.value = new Date().toISOString().split('T')[0]
  showClaimModal.value = true
}

const claimTask = () => {
  if (!claimMemberId.value || !claimExpectedDate.value) {
    alert('请选择成员和预期完成日期')
    return
  }

  const task = taskBoard.value.find(t => t.taskId === claimTaskId.value)
  if (!task) return

  const member = members.value.find(m => m.id === claimMemberId.value)

  // 创建预加分记录
  pendingRecords.value.push({
    pendingId: generateId('pending'),
    memberId: claimMemberId.value,
    memberName: member.name,
    taskName: task.taskName,
    taskDifficulty: task.difficulty,
    difficultyLabel: task.difficultyLabel,
    pointsPerHour: task.pointsPerHour,
    estimatedHours: task.estimatedHours,
    estimatedPoints: task.estimatedPoints,
    expectedDate: claimExpectedDate.value,
    taskStatus: 'pending',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    selectedQuality: null,
    actualHours: task.estimatedHours,
    source: 'board',
    taskId: task.taskId
  })

  // 更新任务状态
  task.status = 'claimed'
  task.claimedBy = claimMemberId.value
  task.claimedByMemberName = member.name
  task.claimedAt = new Date().toISOString()

  saveToStorage()
  showClaimModal.value = false
}

const deleteTask = (taskId) => {
  if (!confirm('确定要删除这个任务吗？')) return
  
  const index = taskBoard.value.findIndex(t => t.taskId === taskId)
  if (index > -1) {
    taskBoard.value.splice(index, 1)
    saveToStorage()
  }
}

const initPieChart = () => {
  if (!pieChartRef.value) return

  const chart = echarts.init(pieChartRef.value)
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}分 ({d}%)'
    },
    legend: {
      bottom: 0,
      left: 'center'
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: false
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 14,
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false
      },
      data: members.value.map((m, index) => ({
        value: m.totalPoints.toFixed(1),
        name: m.name,
        itemStyle: {
          color: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'][index]
        }
      }))
    }]
  }

  chart.setOption(option)

  // 响应式
  window.addEventListener('resize', () => {
    chart.resize()
  })
}

// 监听数据变化更新图表
watch([members, records], () => {
  nextTick(() => {
    initPieChart()
  })
}, { deep: true })

// 生命周期
onMounted(() => {
  loadFromStorage()

  nextTick(() => {
    initPieChart()
  })

  // 检查逾期任务
  if (overdueTasks.value.length > 0 || todayTasks.value.length > 0) {
    setTimeout(() => {
      showOverdueReminder.value = true
    }, 500)
  }
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.container {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  padding: 20px;
}

.header {
  text-align: center;
  color: white;
  margin-bottom: 24px;
}

.header h1 {
  font-size: 28px;
  margin-bottom: 8px;
}

.header p {
  opacity: 0.8;
  font-size: 14px;
}

.mode-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 12px;
}

.mode-badge {
  font-size: 13px;
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 500;
}

.mode-badge.normal {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.mode-badge.admin {
  background: rgba(16, 185, 129, 0.3);
  color: #a7f3d0;
  border: 1px solid rgba(16, 185, 129, 0.5);
}

.main-content {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 24px;
}

@media (max-width: 1024px) {
  .main-content {
    grid-template-columns: 1fr;
  }
}

.card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 16px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-title .icon {
  font-size: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 13px;
  color: #666;
  margin-bottom: 6px;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: #667eea;
}

select.form-control {
  cursor: pointer;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-success:hover {
  background: #059669;
}

.btn-warning {
  background: #f59e0b;
  color: white;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-outline {
  background: white;
  border: 1px solid #e0e0e0;
  color: #666;
}

.btn-outline:hover {
  background: #f5f5f5;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.btn-block {
  width: 100%;
}

.btn-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.result-box {
  background: linear-gradient(135deg, #f0f4ff 0%, #f5f0ff 100%);
  border-radius: 12px;
  padding: 16px;
  margin-top: 16px;
}

.result-box .label {
  font-size: 12px;
  color: #888;
  margin-bottom: 4px;
}

.result-box .value {
  font-size: 28px;
  font-weight: 700;
  color: #667eea;
}

.result-box .formula {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
}

.team-stats {
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
  margin-bottom: 20px;
}

.team-stats .label {
  font-size: 13px;
  opacity: 0.8;
}

.team-stats .value {
  font-size: 36px;
  font-weight: 700;
}

.members-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.member-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.member-card:hover {
  background: #f0f4ff;
  border-color: #667eea;
}

.member-card .name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.member-card .points {
  font-size: 24px;
  font-weight: 700;
  color: #667eea;
}

.member-card .percent {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
}

.pending-card {
  background: #fff8e6;
  border: 1px solid #f59e0b;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.pending-card.overdue {
  background: #fef2f2;
  border-color: #ef4444;
}

.pending-card.today {
  background: #f0fdf4;
  border-color: #10b981;
}

.pending-card .header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.pending-card .task-name {
  font-weight: 600;
  color: #333;
}

.pending-card .status-badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;
}

.pending-card .meta {
  font-size: 12px;
  color: #666;
  margin-bottom: 12px;
}

.quality-options {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.quality-option {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  cursor: pointer;
}

.quality-option input {
  cursor: pointer;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal {
  background: white;
  border-radius: 16px;
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 600;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.chart-container {
  height: 300px;
  margin-top: 16px;
}

.history-item {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
}

.history-item .header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.history-item .time {
  font-size: 12px;
  color: #888;
}

.history-item .points {
  font-weight: 600;
  color: #667eea;
}

.history-item .detail {
  font-size: 12px;
  color: #666;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 6px;
  margin-bottom: 4px;
}

.checkbox-item.selected {
  background: #f0f4ff;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.empty-state .icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.tabs {
  display: flex;
  border-bottom: 2px solid #f0f0f0;
  margin-bottom: 16px;
}

.tab {
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: all 0.2s;
}

.tab.active {
  color: #667eea;
  border-bottom-color: #667eea;
}

.alert {
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 12px;
  font-size: 13px;
}

.alert-warning {
  background: #fff8e6;
  border: 1px solid #f59e0b;
  color: #92400e;
}

.alert-danger {
  background: #fef2f2;
  border: 1px solid #ef4444;
  color: #991b1b;
}

.alert-success {
  background: #f0fdf4;
  border: 1px solid #10b981;
  color: #065f46;
}

.diff-highlight {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  background: #f0f4ff;
  border-radius: 4px;
  font-size: 12px;
}

.diff-highlight.positive {
  color: #10b981;
}

.diff-highlight.negative {
  color: #ef4444;
}

.left-panel {
  position: sticky;
  top: 20px;
  height: fit-content;
}

/* 任务公告栏卡片 */
.task-board-card {
  background: #fffbeb;
  border: 1px solid #fcd34d;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.task-board-card.claimed {
  background: #f0fdf4;
  border-color: #86efac;
}

.task-board-card .task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.task-board-card .task-name {
  font-weight: 600;
  color: #333;
}

.task-board-card .task-status {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;
}

.task-board-card .task-status.open {
  background: #fef3c7;
  color: #92400e;
}

.task-board-card .task-status.claimed {
  background: #dcfce7;
  color: #166534;
}

.task-board-card .task-meta {
  font-size: 12px;
  color: #666;
  margin-bottom: 12px;
}

.task-board-card .task-claimed-info {
  font-size: 13px;
  color: #166534;
  padding: 8px;
  background: #dcfce7;
  border-radius: 6px;
}

.task-board-card .task-actions {
  display: flex;
  gap: 8px;
}
</style>
