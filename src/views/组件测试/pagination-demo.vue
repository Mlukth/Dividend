
<template>
  <div class="pagination-showcase">
    <!-- 方案1：原生箭头+实心页码+无外框 -->
    <div class="pagination-item">
      <div class="title">方案1：原图复刻 · 项目原生箭头版</div>
      <div class="pagination-wrap pagination-original">
        <span class="total-text">共 {{ total }} 条</span>
        <el-select v-model="pageSize" class="size-select">
          <el-option label="10条/页" :value="10" />
          <el-option label="20条/页" :value="20" />
          <el-option label="50条/页" :value="50" />
        </el-select>
        <!-- 项目原生左箭头 -->
        <button class="pagination-arrow" :disabled="currentPage === 1" @click="currentPage--">
          <i class="el-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
              <path fill="currentColor" d="M609.408 149.376 277.76 489.6a32 32 0 0 0 0 44.672l331.648 340.352a29.12 29.12 0 0 0 41.728 0 30.59 30.59 0 0 0 0-42.752L339.264 511.936l311.872-319.872a30.59 30.59 0 0 0 0-42.688 29.12 29.12 0 0 0-41.728 0"></path>
            </svg>
          </i>
        </button>
        <div class="current-page-box">{{ currentPage }}</div>
        <!-- 项目原生右箭头 -->
        <button class="pagination-arrow" :disabled="currentPage === totalPage" @click="currentPage++">
          <i class="el-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
              <path fill="currentColor" d="M340.864 149.312a30.59 30.59 0 0 0 0 42.752L652.736 512 340.864 831.872a30.59 30.59 0 0 0 0 42.752 29.12 29.12 0 0 0 41.728 0L714.24 534.336a32 32 0 0 0 0-44.672L382.592 149.376a29.12 29.12 0 0 0-41.728 0z"></path>
            </svg>
          </i>
        </button>
        <span class="jump-text">前往</span>
        <el-input v-model="jumpValue" class="jump-input" @keyup.enter="handleJump" />
        <span class="jump-text">页</span>
      </div>
    </div>

    <!-- 方案2：原生箭头+连续页码 -->
    <div class="pagination-item">
      <div class="title">方案2：连续页码 · 项目原生箭头版</div>
      <div class="pagination-wrap pagination-basic">
        <span class="total-text">共 {{ total }} 条</span>
        <el-select v-model="pageSize2" class="size-select">
          <el-option label="10条/页" :value="10" />
          <el-option label="20条/页" :value="20" />
          <el-option label="50条/页" :value="50" />
        </el-select>
        <button class="pagination-arrow" :disabled="currentPage2 === 1" @click="currentPage2--">
          <i class="el-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path fill="currentColor" d="M609.408 149.376 277.76 489.6a32 32 0 0 0 0 44.672l331.648 340.352a29.12 29.12 0 0 0 41.728 0 30.59 30.59 0 0 0 0-42.752L339.264 511.936l311.872-319.872a30.59 30.59 0 0 0 0-42.688 29.12 29.12 0 0 0-41.728 0"></path></svg></i>
        </button>
        <div class="page-list">
          <span v-for="p in pageList2" :key="p" class="page-item" :class="{ active: p === currentPage2 }" @click="currentPage2 = p">{{ p }}</span>
        </div>
        <button class="pagination-arrow" :disabled="currentPage2 === totalPage2" @click="currentPage2++">
          <i class="el-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path fill="currentColor" d="M340.864 149.312a30.59 30.59 0 0 0 0 42.752L652.736 512 340.864 831.872a30.59 30.59 0 0 0 0 42.752 29.12 29.12 0 0 0 41.728 0L714.24 534.336a32 32 0 0 0 0-44.672L382.592 149.376a29.12 29.12 0 0 0-41.728 0z"></path></svg></i>
        </button>
        <span class="jump-text">前往</span>
        <el-input v-model="jumpValue2" class="jump-input" @keyup.enter="handleJump2" />
        <span class="jump-text">页</span>
      </div>
    </div>

    <!-- 方案3：原生箭头+省略号页码 -->
    <div class="pagination-item">
      <div class="title">方案3：省略号页码 · 项目原生箭头版</div>
      <div class="pagination-wrap pagination-fold">
        <span class="total-text">共 {{ total }} 条</span>
        <el-select v-model="pageSize3" class="size-select">
          <el-option label="10条/页" :value="10" />
          <el-option label="20条/页" :value="20" />
          <el-option label="50条/页" :value="50" />
        </el-select>
        <button class="pagination-arrow" :disabled="currentPage3 === 1" @click="currentPage3--">
          <i class="el-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path fill="currentColor" d="M609.408 149.376 277.76 489.6a32 32 0 0 0 0 44.672l331.648 340.352a29.12 29.12 0 0 0 41.728 0 30.59 30.59 0 0 0 0-42.752L339.264 511.936l311.872-319.872a30.59 30.59 0 0 0 0-42.688 29.12 29.12 0 0 0-41.728 0"></path></svg></i>
        </button>
        <div class="page-list">
          <span class="page-item" :class="{ active: 1 === currentPage3 }" @click="currentPage3 = 1">1</span>
          <span v-if="currentPage3 > 3" class="page-dots">…</span>
          <span v-for="p in middlePages3" :key="p" class="page-item" :class="{ active: p === currentPage3 }" @click="currentPage3 = p">{{ p }}</span>
          <span v-if="currentPage3 < totalPage3 - 2" class="page-dots">…</span>
          <span class="page-item" :class="{ active: totalPage3 === currentPage3 }" @click="currentPage3 = totalPage3">{{ totalPage3 }}</span>
        </div>
        <button class="pagination-arrow" :disabled="currentPage3 === totalPage3" @click="currentPage3++">
          <i class="el-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path fill="currentColor" d="M340.864 149.312a30.59 30.59 0 0 0 0 42.752L652.736 512 340.864 831.872a30.59 30.59 0 0 0 0 42.752 29.12 29.12 0 0 0 41.728 0L714.24 534.336a32 32 0 0 0 0-44.672L382.592 149.376a29.12 29.12 0 0 0-41.728 0z"></path></svg></i>
        </button>
        <span class="jump-text">前往</span>
        <el-input v-model="jumpValue3" class="jump-input" @keyup.enter="handleJump3" />
        <span class="jump-text">页</span>
      </div>
    </div>

    <!-- 方案4：原生箭头+首尾快捷 -->
    <div class="pagination-item">
      <div class="title">方案4：首尾快捷 · 项目原生箭头版</div>
      <div class="pagination-wrap pagination-fast">
        <span class="total-text">共 {{ total }} 条</span>
        <el-select v-model="pageSize4" class="size-select">
          <el-option label="10条/页" :value="10" />
          <el-option label="20条/页" :value="20" />
          <el-option label="50条/页" :value="50" />
        </el-select>
        <button class="text-btn" :disabled="currentPage4 === 1" @click="currentPage4 = 1">首页</button>
        <button class="pagination-arrow" :disabled="currentPage4 === 1" @click="currentPage4--">
          <i class="el-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path fill="currentColor" d="M609.408 149.376 277.76 489.6a32 32 0 0 0 0 44.672l331.648 340.352a29.12 29.12 0 0 0 41.728 0 30.59 30.59 0 0 0 0-42.752L339.264 511.936l311.872-319.872a30.59 30.59 0 0 0 0-42.688 29.12 29.12 0 0 0-41.728 0"></path></svg></i>
        </button>
        <div class="current-page-box">{{ currentPage4 }}</div>
        <button class="pagination-arrow" :disabled="currentPage4 === totalPage4" @click="currentPage4++">
          <i class="el-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path fill="currentColor" d="M340.864 149.312a30.59 30.59 0 0 0 0 42.752L652.736 512 340.864 831.872a30.59 30.59 0 0 0 0 42.752 29.12 29.12 0 0 0 41.728 0L714.24 534.336a32 32 0 0 0 0-44.672L382.592 149.376a29.12 29.12 0 0 0-41.728 0z"></path></svg></i>
        </button>
        <button class="text-btn" :disabled="currentPage4 === totalPage4" @click="currentPage4 = totalPage4">尾页</button>
        <span class="jump-text">前往</span>
        <el-input v-model="jumpValue4" class="jump-input" @keyup.enter="handleJump4" />
        <span class="jump-text">页</span>
      </div>
    </div>

    <!-- 方案5：项目原生DOM版（保持不变） -->
    <div class="pagination-item">
      <div class="title">方案5：项目原生DOM · 完美匹配版</div>
      <div class="pagination-wrap pagination-native">
        <el-pagination
          v-model:current-page="currentPage5"
          v-model:page-size="pageSize5"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
const total = ref(128)

// 方案1
const pageSize = ref(10)
const currentPage = ref(1)
const totalPage = computed(() => Math.ceil(total.value / pageSize.value))
const jumpValue = ref('')
const handleJump = () => {
  let num = Number(jumpValue.value)
  if (num >= 1 && num <= totalPage.value) currentPage.value = num
  jumpValue.value = ''
}

// 方案2
const pageSize2 = ref(10)
const currentPage2 = ref(1)
const totalPage2 = computed(() => Math.ceil(total.value / pageSize2.value))
const pageList2 = computed(() => Array.from({length: totalPage2.value}, (_, i) => i + 1))
const jumpValue2 = ref('')
const handleJump2 = () => {
  let num = Number(jumpValue2.value)
  if (num >= 1 && num <= totalPage2.value) currentPage2.value = num
  jumpValue2.value = ''
}

// 方案3
const pageSize3 = ref(10)
const currentPage3 = ref(5)
const totalPage3 = computed(() => Math.ceil(total.value / pageSize3.value))
const middlePages3 = computed(() => {
  const pages = []
  const start = Math.max(2, currentPage3.value - 1)
  const end = Math.min(totalPage3.value - 1, currentPage3.value + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})
const jumpValue3 = ref('')
const handleJump3 = () => {
  let num = Number(jumpValue3.value)
  if (num >= 1 && num <= totalPage3.value) currentPage3.value = num
  jumpValue3.value = ''
}

// 方案4
const pageSize4 = ref(10)
const currentPage4 = ref(1)
const totalPage4 = computed(() => Math.ceil(total.value / pageSize4.value))
const jumpValue4 = ref('')
const handleJump4 = () => {
  let num = Number(jumpValue4.value)
  if (num >= 1 && num <= totalPage4.value) currentPage4.value = num
  jumpValue4.value = ''
}

// 方案5
const pageSize5 = ref(10)
const currentPage5 = ref(1)
</script>

<style scoped>
.pagination-showcase {
  padding: 24px;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
  gap: 32px;
}
.pagination-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.title {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

/* 统一容器 */
.pagination-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: #fff;
  border-radius: 8px;
}
.total-text {
  font-size: 14px;
  color: #333;
  white-space: nowrap;
}
.size-select {
  width: 120px;
}
:deep(.el-select__wrapper) {
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  background: #fff;
}

/* --------- 核心：项目原生箭头样式（无外框、纯图标，和你项目完全一致） --------- */
.pagination-arrow {
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: #666;
}
.pagination-arrow:disabled {
  color: #c0c4cc;
  cursor: not-allowed;
}
.pagination-arrow:hover:not(:disabled) {
  color: #1677FF;
}
.pagination-arrow svg {
  width: 16px;
  height: 16px;
}

/* --------- 实心正方形页码（100%匹配项目） --------- */
.current-page-box {
  width: 36px;
  height: 36px;
  line-height: 36px;
  text-align: center;
  border-radius: 8px;
  background-color: #1677FF;
  color: #fff;
  font-weight: 500;
}

/* 页码列表 */
.page-list {
  display: flex;
  align-items: center;
  gap: 8px;
}
.page-item {
  width: 36px;
  height: 36px;
  line-height: 36px;
  text-align: center;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  color: #666;
  cursor: pointer;
}
.page-item:hover:not(.active) {
  border-color: #1677FF;
  color: #1677FF;
}
.page-item.active {
  background-color: #1677FF;
  border: none;
  color: #fff;
  font-weight: 500;
}
.page-dots {
  color: #999;
  padding: 0 4px;
}

/* 首尾文字按钮 */
.text-btn {
  background: transparent;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 0 8px;
}
.text-btn:hover {
  color: #1677FF;
}
.text-btn:disabled {
  color: #c0c4cc;
}

/* 跳转样式 */
.jump-text {
  font-size: 14px;
  color: #333;
}
.jump-input {
  width: 60px;
}
:deep(.el-input__wrapper) {
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  background: #fff;
}

/* --------- 方案5 原生样式 --------- */
.pagination-native :deep(.el-pagination) {
  --el-color-primary: #1677FF;
}
.pagination-native :deep(.el-pager li.is-active.number) {
  background-color: #1677FF;
  color: #fff;
  border: none;
}
.pagination-native :deep(.el-pager li.number) {
  width: 36px;
  height: 36px;
  line-height: 36px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
}
/* 全中文替换 */
.pagination-native :deep(.el-pagination__total)::before { content: "共 "; }
.pagination-native :deep(.el-pagination__goto)::before { content: "前往"; }
.pagination-native :deep(.el-pagination__goto) { visibility: hidden; }
.pagination-native :deep(.el-pagination__classifier)::before { content: "页"; }
.pagination-native :deep(.el-pagination__classifier) { visibility: hidden; }
</style>
