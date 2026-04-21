<template>
  <div class="prompt-app">
    <!-- 顶部：打开提示词配置按钮 -->
    <div class="header">
      <h2>提示词组合工具</h2>
      <el-button type="primary" @click="showPromptDialog = true">
        <el-icon><Edit /></el-icon> 编辑预设提示词
      </el-button>
    </div>

    <!-- 需求输入区 -->
    <div class="input-card">
      <div class="card-title">需求描述</div>
      <el-input
        v-model="userRequirement"
        type="textarea"
        :rows="5"
        placeholder="请输入你的需求..."
        class="custom-textarea"
      />
      <!-- 核心按钮：组合并复制完整提示词 -->
      <el-button type="primary" class="action-btn" @click="combineAndCopyPrompt">
        <el-icon><CopyDocument /></el-icon> 组合并复制完整提示词
      </el-button>
      <p class="hint-text">点击后复制到剪贴板，可粘贴至 AI 对话窗口</p>
    </div>

    <!-- 提示词编辑弹窗 -->
    <el-dialog v-model="showPromptDialog" title="预设提示词配置" width="700px">
      <el-form :model="promptConfig" label-width="120px">
        <el-form-item label="基础提示词">
          <el-input
            v-model="promptConfig.taskPrompt"
            type="textarea"
            :rows="12"
            placeholder="输入预设的系统提示词..."
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPromptDialog = false">取消</el-button>
        <el-button type="primary" @click="savePromptConfig">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Edit, CopyDocument } from '@element-plus/icons-vue'

// 弹窗控制
const showPromptDialog = ref(false)
// 用户输入的需求
const userRequirement = ref('')

// 预设提示词配置（核心）
const promptConfig = ref({
  taskPrompt: `你是一个任务拆解助手。用户会输入一段话，请提取其中的任务信息并输出JSON数组。

输出字段说明：
- taskName: 任务名称（必填）
- taskDate: 预计完成日期，格式YYYY-MM-DD（必填）
- priority: 优先级，high/medium/low（必填）
- dependencies: 关联的前置任务名数组（可选）
- estimatedHours: 预计耗时小时数（必填）
- description: 任务详细描述（可选）
- tags: 标签数组，如["开发","测试"]（可选）

注意：
1. 只输出JSON数组，不要其他内容
2. 如果有前置任务依赖，dependencies中填入已存在任务的taskName`
})

// 初始化：从本地存储加载提示词
onMounted(() => {
  const savedPrompt = localStorage.getItem('taskManager_prompt')
  if (savedPrompt) {
    try {
      promptConfig.value = JSON.parse(savedPrompt)
    } catch (e) {
      console.error('解析提示词失败', e)
    }
  }
})

// 保存预设提示词到本地
const savePromptConfig = () => {
  localStorage.setItem('taskManager_prompt', JSON.stringify(promptConfig.value))
  showPromptDialog.value = false
  ElMessage.success('预设提示词已保存')
}

// 【核心功能】组合预设提示词+用户需求，并复制到剪贴板
const combineAndCopyPrompt = async () => {
  // 1. 获取预设提示词
  const basePrompt = promptConfig.value.taskPrompt
  // 2. 获取用户输入的内容
  const userInput = userRequirement.value.trim()

  // 校验输入
  if (!userInput) {
    ElMessage.warning('请先输入需求描述')
    return
  }

  // 3. 拼接最终提示词
  const fullPrompt = `${basePrompt}\n\n用户需求：\n${userInput}\n\n请根据以上需求生成符合格式的 JSON 数组。`

  // 4. 复制到剪贴板
  try {
    await navigator.clipboard.writeText(fullPrompt)
    ElMessage.success('✅ 完整提示词已复制到剪贴板！')
  } catch {
    ElMessage.error('复制失败，请手动复制')
  }
}
</script>

<style scoped>
.prompt-app {
  max-width: 600px;
  margin: 40px auto;
  padding: 0 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.input-card {
  background: #fafcfd;
  border-radius: 18px;
  padding: 24px;
  border: 1px solid #e2e8f0;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
}

.custom-textarea :deep(.el-textarea__inner) {
  border-radius: 12px;
  min-height: 120px;
}

.action-btn {
  width: 100%;
  margin-top: 16px;
  border-radius: 12px;
  padding: 12px;
}

.hint-text {
  font-size: 13px;
  color: #64748b;
  margin-top: 10px;
  text-align: center;
}
</style>