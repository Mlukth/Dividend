<template>
  <button class="custom-theme-btn">
    <slot>确认按钮</slot>
  </button>
</template>

<script setup>
</script>

<style scoped>
.custom-theme-btn {
  /* 基础布局 */
  display: inline-flex;
  justify-content: center;
  align-items: center;
  white-space: nowrap;
  box-sizing: border-box;
  vertical-align: middle;
  user-select: none;
  -webkit-appearance: none;
  outline: none;
  border: none;
  cursor: pointer;
  transition: 0.1s;

  /* 字体 */
  font-family: Manrope, PingFang SC, Microsoft YaHei, 微软雅黑, Helvetica Neue, Helvetica, Arial, Verdana, Tahoma, sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 1;
  text-align: center;

  /* 尺寸与圆角 */
  width: 100%;
  height: 50px;
  padding: 8px 15px;
  border-radius: 100px;

  /* 默认颜色（修复默认不显示问题） */
  color: var(--el-color-white);
  background-color: var(--theme-color);

  /* 继承项目变量 */
  --el-button-hover-bg-color: var(--el-color-primary-light-3);
  --el-button-active-bg-color: var(--el-color-primary-dark-2);
}

/* 悬浮效果 */
.custom-theme-btn:hover {
  background-color: var(--el-button-hover-bg-color);
}

/* 点击按下效果 */
.custom-theme-btn:active {
  background-color: var(--el-button-active-bg-color);
}
</style>