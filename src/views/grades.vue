<template>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>🏆 小组贡献积分统计工具</h1>
      <p>标准化积分计算 · 数据可追溯 · 多人实时同步</p>
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

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <div style="margin-top: 16px; color: #666;">加载中...</div>
    </div>

    <!-- 主内容 -->
    <div class="main-content" v-else>
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
            <div>✅ 数据库连接：正常</div>
            <div>📄 记录总数：{{ records.length }}条</div>
            <div>📝 待处理：{{ pendingRecords.filter(p => p.status === 'pending').length }}条</div>
            <div>📌 公告栏：{{ taskBoard.filter(t => t.status === 'open').length }}条待认领</div>
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
          <div v-if="records.length === 0" class="empty-state">
            <div class="icon">📭</div>
            <div>暂无操作记录</div>
          </div>
          <div v-else style="max-height: 500px; overflow-y: auto;">
            <div v-for="r in records" :key="r.recordId" class="history-item">
              <div class="header">
                <span>{{ formatTime(r.timestamp) }}  {{ r.memberName }}  <strong class="points">+{{ r.points.toFixed(1) }}分</strong></span>
              </div>
              <div class="detail">
                {{ r.taskName }} | {{ r.taskDifficulty }}级 | {{ r.estimatedHours }}h | ×{{ r.qualityCoefficient }}
              </div>
              <div class="btn-group" style="margin-top: 8px;" v-if="isAdminMode">
                <button class="btn btn-outline btn-sm" @click="editRecord(r)">编辑</button>
                <button class="btn btn-danger btn-sm" @click="deleteRecord(r.recordId)">删除</button>
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
          </div>

          <div class="form-group" style="margin-top: 12px;">
            <label>修改原因（必填）</label>
            <input type="text" class="form-control" v-model="editReason" placeholder="请输入修改原因">
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="showEditModal = false">取消</button>
          <button class="btn btn-primary" @click="saveEditRecord" :disabled="!editReason">保存修改</button>
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
                <div v-if="log.details && log.details.originalRecord">
                  <div>成员：{{ log.details.originalRecord.memberName }}</div>
                  <div>任务：{{ log.details.originalRecord.taskName }}</div>
                  <div>积分：{{ log.details.originalRecord.points }}分</div>
                </div>
                <div v-if="log.details && log.details.reason">
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
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { createClient } from '@supabase/supabase-js'
import * as XLSX from 'xlsx'
import * as echarts from 'echarts'

// ============================================
// 🔧 配置 Supabase（替换成你的值）
// ============================================
const supabaseUrl = 'https://njdsqlupqfuqepoeeihd.supabase.co'
const supabaseKey = 'sb_publishable_W15Z5Rfky7FZkhI-ZivfBQ_CoJ017xt'
const supabase = createClient(supabaseUrl, supabaseKey)

// ============================================
// 数据
// ============================================
const loading = ref(true)
const members = ref([])
const records = ref([])
const pendingRecords = ref([])
const auditLogs = ref([])
const taskBoard = ref([])
const adminPassword = ref('123456') // 从数据库获取

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

// UI状态
const isAdminMode = ref(false)
const showPasswordModal = ref(false)
const passwordInput = ref('')

const showRevokeModal = ref(false)
const showHistory = ref(false)
const showEditModal = ref(false)
const showAuditLog = ref(false)
const showMemberModal = ref(false)
const showOverdueReminder = ref(false)

// 编辑相关
const editingRecord = ref(null)
const editReason = ref('')
const revokeReason = ref('')

// 成员详情
const currentMember = ref(null)
const memberRecords = ref([])

// refs
const pieChartRef = ref(null)

// ============================================
// 计算属性
// ============================================
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

const calculateEditedPoints = computed(() => {
  if (!editingRecord.value) return 0
  const diff = difficultyLevels.value.find(d => d.level === editingRecord.value.taskDifficulty)
  const qual = qualityOptions.value.find(q => q.coefficient === editingRecord.value.qualityCoefficient)
  return editingRecord.value.estimatedHours * (diff?.points || 1) * (qual?.coefficient || 1)
})

// ============================================
// 工具函数
// ============================================
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
  if (!timestamp) return ''
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

// ============================================
// Supabase 数据操作
// ============================================
const loadAllData = async () => {
  loading.value = true
  
  try {
    // 加载成员
    const { data: membersData } = await supabase
      .from('members')
      .select('*')
      .order('id')
    members.value = membersData?.map(m => ({
      id: m.id,
      name: m.name,
      totalPoints: m.total_points
    })) || []

    // 加载记录
    const { data: recordsData } = await supabase
      .from('records')
      .select('*')
      .order('timestamp', { ascending: true })
    records.value = recordsData?.map(r => ({
      recordId: r.record_id,
      memberId: r.member_id,
      memberName: r.member_name,
      taskName: r.task_name,
      taskDifficulty: r.task_difficulty,
      difficultyLabel: r.difficulty_label,
      pointsPerHour: r.points_per_hour,
      estimatedHours: r.estimated_hours,
      qualityStatus: r.quality_status,
      qualityCoefficient: r.quality_coefficient,
      points: r.points,
      timestamp: r.timestamp,
      date: r.date,
      source: r.source,
      modificationHistory: r.modification_history || [],
      selected: r.selected
    })) || []

    // 加载预加分
    const { data: pendingData } = await supabase
      .from('pending_records')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
    pendingRecords.value = pendingData?.map(p => ({
      pendingId: p.pending_id,
      memberId: p.member_id,
      memberName: p.member_name,
      taskName: p.task_name,
      taskDifficulty: p.task_difficulty,
      difficultyLabel: p.difficulty_label,
      pointsPerHour: p.points_per_hour,
      estimatedHours: p.estimated_hours,
      estimatedPoints: p.estimated_points,
      expectedDate: p.expected_date,
      taskStatus: p.task_status,
      status: p.status,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      selectedQuality: p.selected_quality,
      actualHours: p.actual_hours,
      source: p.source,
      taskId: p.task_id
    })) || []

    // 加载任务公告栏
    const { data: taskData } = await supabase
      .from('task_board')
      .select('*')
      .order('created_at', { ascending: false })
    taskBoard.value = taskData?.map(t => ({
      taskId: t.task_id,
      taskName: t.task_name,
      difficulty: t.difficulty,
      difficultyLabel: t.difficulty_label,
      pointsPerHour: t.points_per_hour,
      estimatedHours: t.estimated_hours,
      estimatedPoints: t.estimated_points,
      status: t.status,
      createdAt: t.created_at,
      claimedBy: t.claimed_by,
      claimedByMemberName: t.claimed_by_member_name,
      claimedAt: t.claimed_at
    })) || []

    // 加载审计日志
    const { data: logsData } = await supabase
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100)
    auditLogs.value = logsData?.map(l => ({
      logId: l.log_id,
      action: l.action,
      timestamp: l.timestamp,
      operator: l.operator,
      details: l.details
    })) || []

    // 加载密码
    const { data: pwdData } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'admin_password')
      .single()
    if (pwdData) {
      adminPassword.value = pwdData.value
    }

  } catch (error) {
    console.error('加载数据失败:', error)
    alert('加载数据失败，请检查Supabase配置')
  }
  
  loading.value = false
}

// 更新成员积分
const updateMemberPoints = async (memberId, delta) => {
  const member = members.value.find(m => m.id === memberId)
  if (!member) return
  
  member.totalPoints += delta
  
  await supabase
    .from('members')
    .update({ total_points: member.totalPoints })
    .eq('id', memberId)
}

// ============================================
// 积分计算器
// ============================================
const calculatePoints = () => {
  const diff = currentDifficulty.value
  const qual = currentQuality.value
  calculator.value.result = calculator.value.hours * diff.points * qual.coefficient
}

const addPointsDirect = async () => {
  if (calculator.value.result === null || !calculator.value.memberId) return

  const member = members.value.find(m => m.id === calculator.value.memberId)
  if (!member) return

  const diff = currentDifficulty.value
  const qual = currentQuality.value

  const recordId = generateId('rec')
  const now = new Date().toISOString()

  // 插入数据库
  await supabase.from('records').insert({
    record_id: recordId,
    member_id: calculator.value.memberId,
    member_name: member.name,
    task_name: calculator.value.taskName || '未命名任务',
    task_difficulty: calculator.value.difficulty,
    difficulty_label: diff.label,
    points_per_hour: diff.points,
    estimated_hours: calculator.value.hours,
    quality_status: qual.label,
    quality_coefficient: qual.coefficient,
    points: calculator.value.result,
    timestamp: now,
    date: now.split('T')[0],
    source: 'direct',
    modification_history: [],
    selected: false
  })

  // 更新本地
  records.value.push({
    recordId,
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
    timestamp: now,
    date: now.split('T')[0],
    source: 'direct',
    modificationHistory: [],
    selected: false
  })

  // 更新成员积分
  await updateMemberPoints(calculator.value.memberId, calculator.value.result)

  // 重置计算器
  calculator.value.taskName = ''
  calculator.value.result = null
}

// ============================================
// 预加分
// ============================================
const createPending = async () => {
  if (!pending.value.taskName || !pending.value.hours) {
    alert('请填写任务名称和预估工时')
    return
  }

  const member = members.value.find(m => m.id === pending.value.memberId)
  const diff = getDifficultyInfo(pending.value.difficulty)
  const pendingId = generateId('pending')
  const now = new Date().toISOString()

  await supabase.from('pending_records').insert({
    pending_id: pendingId,
    member_id: pending.value.memberId,
    member_name: member.name,
    task_name: pending.value.taskName,
    task_difficulty: pending.value.difficulty,
    difficulty_label: diff.label,
    points_per_hour: diff.points,
    estimated_hours: pending.value.hours,
    estimated_points: pending.value.hours * diff.points,
    expected_date: pending.value.expectedDate,
    task_status: 'pending',
    status: 'pending',
    created_at: now,
    updated_at: now,
    selected_quality: null,
    actual_hours: pending.value.hours
  })

  pendingRecords.value.push({
    pendingId,
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
    createdAt: now,
    updatedAt: now,
    selectedQuality: null,
    actualHours: pending.value.hours
  })

  pending.value.taskName = ''
  pending.value.hours = 1
}

const confirmPending = async (p) => {
  if (!p.selectedQuality) {
    alert('请选择完成质量')
    return
  }

  const qual = qualityOptions.value.find(q => q.value === p.selectedQuality)
  const actualHours = p.actualHours || p.estimatedHours
  const actualPoints = actualHours * p.pointsPerHour * qual.coefficient
  const now = new Date().toISOString()

  const recordId = generateId('rec')

  // 插入记录
  await supabase.from('records').insert({
    record_id: recordId,
    member_id: p.memberId,
    member_name: p.memberName,
    task_name: p.taskName,
    task_difficulty: p.taskDifficulty,
    difficulty_label: p.difficultyLabel,
    points_per_hour: p.pointsPerHour,
    estimated_hours: actualHours,
    quality_status: qual.label,
    quality_coefficient: qual.coefficient,
    points: actualPoints,
    timestamp: now,
    date: p.expectedDate,
    source: 'pending',
    modification_history: []
  })

  records.value.push({
    recordId,
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
    timestamp: now,
    date: p.expectedDate,
    source: 'pending',
    modificationHistory: []
  })

  // 更新预加分状态
  await supabase
    .from('pending_records')
    .update({ status: 'processed' })
    .eq('pending_id', p.pendingId)

  p.status = 'processed'

  // 更新成员积分
  await updateMemberPoints(p.memberId, actualPoints)
}

const updateTaskStatus = async (pendingId, status) => {
  await supabase
    .from('pending_records')
    .update({ task_status: status, updated_at: new Date().toISOString() })
    .eq('pending_id', pendingId)

  const p = pendingRecords.value.find(item => item.pendingId === pendingId)
  if (p) {
    p.taskStatus = status
  }
}

const cancelPending = async (pendingId) => {
  if (!confirm('确定要取消这个任务吗？')) return

  await supabase
    .from('pending_records')
    .update({ status: 'cancelled' })
    .eq('pending_id', pendingId)

  const p = pendingRecords.value.find(item => item.pendingId === pendingId)
  if (p) {
    p.status = 'cancelled'
  }
}

const editPending = (p) => {
  const newTaskName = prompt('任务名称：', p.taskName)
  if (newTaskName) {
    p.taskName = newTaskName
    supabase
      .from('pending_records')
      .update({ task_name: newTaskName, updated_at: new Date().toISOString() })
      .eq('pending_id', p.pendingId)
  }
}

// ============================================
// 任务公告栏
// ============================================
const publishTask = async () => {
  if (!newTask.value.taskName || !newTask.value.hours) {
    alert('请填写任务名称和工时')
    return
  }

  const diff = getDifficultyInfo(newTask.value.difficulty)
  const taskId = generateId('task')
  const now = new Date().toISOString()

  await supabase.from('task_board').insert({
    task_id: taskId,
    task_name: newTask.value.taskName,
    difficulty: newTask.value.difficulty,
    difficulty_label: diff.label,
    points_per_hour: diff.points,
    estimated_hours: newTask.value.hours,
    estimated_points: newTask.value.hours * diff.points,
    status: 'open',
    created_at: now
  })

  taskBoard.value.unshift({
    taskId,
    taskName: newTask.value.taskName,
    difficulty: newTask.value.difficulty,
    difficultyLabel: diff.label,
    pointsPerHour: diff.points,
    estimatedHours: newTask.value.hours,
    estimatedPoints: newTask.value.hours * diff.points,
    status: 'open',
    createdAt: now
  })

  newTask.value.taskName = ''
  newTask.value.hours = 1
}

const openClaimModal = (taskId) => {
  claimTaskId.value = taskId
  claimMemberId.value = 'member_01'
  claimExpectedDate.value = new Date().toISOString().split('T')[0]
  showClaimModal.value = true
}

const claimTask = async () => {
  if (!claimMemberId.value || !claimExpectedDate.value) {
    alert('请选择成员和预期完成日期')
    return
  }

  const task = taskBoard.value.find(t => t.taskId === claimTaskId.value)
  if (!task) return

  const member = members.value.find(m => m.id === claimMemberId.value)
  const now = new Date().toISOString()
  const pendingId = generateId('pending')

  // 创建预加分记录
  await supabase.from('pending_records').insert({
    pending_id: pendingId,
    member_id: claimMemberId.value,
    member_name: member.name,
    task_name: task.taskName,
    task_difficulty: task.difficulty,
    difficulty_label: task.difficultyLabel,
    points_per_hour: task.pointsPerHour,
    estimated_hours: task.estimatedHours,
    estimated_points: task.estimatedPoints,
    expected_date: claimExpectedDate.value,
    task_status: 'pending',
    status: 'pending',
    created_at: now,
    updated_at: now,
    selected_quality: null,
    actual_hours: task.estimatedHours,
    source: 'board',
    task_id: task.taskId
  })

  pendingRecords.value.push({
    pendingId,
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
    createdAt: now,
    updatedAt: now,
    selectedQuality: null,
    actualHours: task.estimatedHours,
    source: 'board',
    taskId: task.taskId
  })

  // 更新任务状态
  await supabase
    .from('task_board')
    .update({
      status: 'claimed',
      claimed_by: claimMemberId.value,
      claimed_by_member_name: member.name,
      claimed_at: now
    })
    .eq('task_id', task.taskId)

  task.status = 'claimed'
  task.claimedBy = claimMemberId.value
  task.claimedByMemberName = member.name
  task.claimedAt = now

  showClaimModal.value = false
}

const deleteTask = async (taskId) => {
  if (!confirm('确定要删除这个任务吗？')) return

  await supabase
    .from('task_board')
    .delete()
    .eq('task_id', taskId)

  taskBoard.value = taskBoard.value.filter(t => t.taskId !== taskId)
}

// ============================================
// 管理模式
// ============================================
const enterAdminMode = () => {
  showPasswordModal.value = true
  passwordInput.value = ''
}

const verifyPassword = () => {
  if (passwordInput.value === adminPassword.value) {
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

// ============================================
// 撤销、编辑、删除
// ============================================
const revokeLastRecord = async () => {
  if (!revokeReason.value || !lastRecord.value) return

  const record = lastRecord.value

  // 记录审计日志
  await supabase.from('audit_logs').insert({
    log_id: generateId('audit'),
    action: 'revoke',
    timestamp: new Date().toISOString(),
    operator: '系统管理员',
    details: {
      originalRecord: {
        memberName: record.memberName,
        taskName: record.taskName,
        points: record.points
      },
      reason: revokeReason.value
    }
  })

  // 删除记录
  await supabase
    .from('records')
    .delete()
    .eq('record_id', record.recordId)

  // 扣除积分
  await updateMemberPoints(record.memberId, -record.points)

  // 更新本地
  records.value.pop()
  showRevokeModal.value = false
  revokeReason.value = ''
}

const editRecord = (r) => {
  editingRecord.value = { ...r }
  editReason.value = ''
  showEditModal.value = true
}

const saveEditRecord = async () => {
  if (!editReason.value || !editingRecord.value) return

  const newPoints = calculateEditedPoints.value
  const oldPoints = editingRecord.value.points
  const pointsDiff = newPoints - oldPoints

  // 更新数据库
  await supabase
    .from('records')
    .update({
      task_name: editingRecord.value.taskName,
      task_difficulty: editingRecord.value.taskDifficulty,
      estimated_hours: editingRecord.value.estimatedHours,
      quality_coefficient: editingRecord.value.qualityCoefficient,
      points: newPoints
    })
    .eq('record_id', editingRecord.value.recordId)

  // 更新成员积分
  if (pointsDiff !== 0) {
    await updateMemberPoints(editingRecord.value.memberId, pointsDiff)
  }

  // 更新本地
  const original = records.value.find(r => r.recordId === editingRecord.value.recordId)
  if (original) {
    original.taskName = editingRecord.value.taskName
    original.taskDifficulty = editingRecord.value.taskDifficulty
    original.estimatedHours = editingRecord.value.estimatedHours
    original.qualityCoefficient = editingRecord.value.qualityCoefficient
    original.points = newPoints
  }

  showEditModal.value = false
  editingRecord.value = null
  editReason.value = ''
}

const deleteRecord = async (recordId) => {
  if (!confirm('确定要删除这条记录吗？')) return

  const record = records.value.find(r => r.recordId === recordId)
  if (!record) return

  await supabase.from('audit_logs').insert({
    log_id: generateId('audit'),
    action: 'delete',
    timestamp: new Date().toISOString(),
    operator: '系统管理员',
    details: {
      originalRecord: {
        memberName: record.memberName,
        taskName: record.taskName,
        points: record.points
      },
      reason: '用户主动删除'
    }
  })

  await supabase
    .from('records')
    .delete()
    .eq('record_id', recordId)

  await updateMemberPoints(record.memberId, -record.points)

  records.value = records.value.filter(r => r.recordId !== recordId)
}

// ============================================
// 清空操作
// ============================================
const clearAllPoints = async () => {
  if (!confirm('确定要清空所有积分吗？此操作不可恢复！')) return

  await supabase.from('records').delete().neq('record_id', '')
  await supabase.from('pending_records').delete().neq('pending_id', '')
  await supabase.from('task_board').delete().neq('task_id', '')
  await supabase.from('audit_logs').delete().neq('log_id', '')
  await supabase.from('members').update({ total_points: 0 }).neq('id', '')

  members.value.forEach(m => m.totalPoints = 0)
  records.value = []
  pendingRecords.value = []
  taskBoard.value = []
  auditLogs.value = []
}

const clearAllRecords = async () => {
  if (!confirm('确定要清空所有记录吗？此操作不可恢复！')) return

  await supabase.from('records').delete().neq('record_id', '')
  await supabase.from('pending_records').delete().neq('pending_id', '')
  await supabase.from('task_board').delete().neq('task_id', '')

  records.value = []
  pendingRecords.value = []
  taskBoard.value = []
}

// ============================================
// 导出
// ============================================
const exportExcel = () => {
  const wb = XLSX.utils.book_new()

  // Sheet 1
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
        const r = dayRecords[0]
        const formulaStr = `${r.taskName} | ${r.taskDifficulty}级 | ${r.estimatedHours}h | ×${r.qualityCoefficient}=${r.points.toFixed(1)}`
        row.push(formulaStr)
        dayTotal += r.points
      } else {
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

  const totalRow = ['累计']
  let grandTotal = 0
  members.value.forEach(m => {
    totalRow.push(m.totalPoints.toFixed(1))
    grandTotal += m.totalPoints
  })
  totalRow.push(grandTotal.toFixed(1))
  sheet1Data.push(totalRow)

  const ws1 = XLSX.utils.aoa_to_sheet(sheet1Data)
  XLSX.utils.book_append_sheet(wb, ws1, '按日积分统计')

  // Sheet 2
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
  XLSX.utils.book_append_sheet(wb, ws2, '原始操作日志')

  XLSX.writeFile(wb, `小组贡献积分统计_${new Date().toISOString().split('T')[0].replace(/-/g, '')}.xlsx`)
}

// ============================================
// 其他
// ============================================
const showMemberHistory = (m) => {
  currentMember.value = m
  memberRecords.value = records.value.filter(r => r.memberId === m.id).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  showMemberModal.value = true
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

  window.addEventListener('resize', () => {
    chart.resize()
  })
}

// ============================================
// 生命周期
// ============================================
watch([members, records], () => {
  nextTick(() => {
    initPieChart()
  })
}, { deep: true })

onMounted(async () => {
  await loadAllData()

  nextTick(() => {
    initPieChart()
  })

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

.loading-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
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

.history-item .points {
  font-weight: 600;
  color: #667eea;
}

.history-item .detail {
  font-size: 12px;
  color: #666;
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
