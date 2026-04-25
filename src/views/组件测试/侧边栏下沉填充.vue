<template>
  <!-- 外层布局容器 -->
  <div class="layout-wrapper">
    <!-- 1. 左侧导航栏（你的核心侧边栏） -->
    <aside class="sidebar">
      <div class="nav-list">
        <div class="nav-item active">常规巡检</div>
        <div class="nav-item">电站体检</div>
        <div class="nav-item">故障处理</div>
      </div>
    </aside>

    <!-- 2. 👇 你要的【下沉填充块】（核心视觉，层级低于导航栏） -->
    <div class="float-sidebar"></div>

    <!-- 3. 👇 收缩拉手（固定在填充块上） -->
    <div class="toggle-handle">
      <svg viewBox="0 0 1024 1024" width="14" height="14">
        <path fill="currentColor" d="M340.864 149.312a30.59 30.59 0 0 0 0 42.752L652.736 512 340.864 831.872a30.59 30.59 0 0 0 0 42.752 29.12 29.12 0 0 0 41.728 0L714.24 534.336a32 32 0 0 0 0-44.672L382.592 149.376a29.12 29.12 0 0 0-41.728 0z"></path>
      </svg>
    </div>

    <!-- 4. 右侧内容区 → 你的【巡检表单】（完全原样保留） -->
    <div class="content-area">
      <div class="inspection-form">
        <h2>常规巡检记录</h2>
        <el-form :model="form" label-width="120px" class="form-container">
          <el-form-item label="电站名称">
            <el-input v-model="form.stationName" placeholder="自动填充" readonly />
          </el-form-item>
          <el-form-item label="巡检日期">
            <el-date-picker v-model="form.inspectionDate" type="date" placeholder="选择日期" />
          </el-form-item>
          <el-form-item label="巡检人员">
            <el-input v-model="form.inspector" placeholder="请输入" />
          </el-form-item>
          <el-form-item label="组件清洁状况">
            <el-select v-model="form.cleanStatus" placeholder="请选择">
              <el-option label="良好" value="良好" />
              <el-option label="一般" value="一般" />
              <el-option label="较差" value="较差" />
            </el-select>
          </el-form-item>
          <el-form-item label="逆变器运行状态">
            <el-input v-model="form.inverterStatus" type="textarea" />
          </el-form-item>
          <el-form-item label="异常记录">
            <el-input v-model="form.abnormalRecord" type="textarea" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitForm">提交巡检记录</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
// 👇 你的业务代码 完全原样保留，无任何修改
import { reactive, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  stationId: { type: String, default: '' }
})

const stationName = computed(() => {
  const map = {
    '1': '裕同2000KW光伏发电',
    '2': '欧菲光1000KW光伏电站',
    '1299184320439337138': '三期-芳宇工程',
    '1299184320439337137': '二期-金富缘'
  }
  return map[props.stationId] || '未知电站'
})

const form = reactive({
  stationName: stationName.value,
  inspectionDate: '',
  inspector: '',
  cleanStatus: '',
  inverterStatus: '',
  abnormalRecord: ''
})

watch(stationName, (newName) => {
  form.stationName = newName
})

const submitForm = () => {
  ElMessage.success('巡检记录已提交')
}
</script>

<style scoped>
/* 👇 全局布局（仅实现你要的视觉效果，无多余样式） */
.layout-wrapper {
  display: flex;
  height: 100vh;
  position: relative;
  background: #f5f7fa;
  margin: 0;
  padding: 0;
}

/* 1. 左侧导航栏样式 */
.sidebar {
  width: 160px;
  height: 100%;
  background: #2b343f;
  color: #fff;
  z-index: 99; /* 导航栏层级最高 */
  padding: 20px 0;
}
.nav-item {
  padding: 12px 20px;
  cursor: pointer;
  font-size: 14px;
}
.nav-item.active {
  background: #409eff;
}

/* 2. 👇 核心：下沉填充块（层级低于导航栏，视觉凹进去） */
.float-sidebar {
  position: absolute;
  left: 160px; /* 紧贴导航栏右侧 */
  top: 50%;
  transform: translateY(-50%);
  z-index: 10; /* 关键：低于导航栏，实现下沉 */
  width: 32px;
  height: 60px;
  background: #ffffff;
  border-radius: 0 6px 6px 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

/* 3. 拉手样式（固定在填充块上方） */
.toggle-handle {
  position: absolute;
  left: 160px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 20; /* 拉手在填充块之上 */
  width: 32px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #666;
}

/* 4. 右侧内容区 */
.content-area {
  flex: 1;
  padding: 20px;
}

/* 👇 你的表单原有样式 完全保留 */
.inspection-form { 
  padding: 20px; 
  background: #fff; 
  border-radius: 8px;
}
.form-container { 
  max-width: 600px; 
}
</style>