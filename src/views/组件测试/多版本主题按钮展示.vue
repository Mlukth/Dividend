<template>
  <div class="btn-show-box">
    <h3>主题按钮4版样式挑选（修复版）</h3>
    <div class="btn-list">
      <div class="btn-item">
        <p>版本1·主色实心按钮</p>
        <button class="custom-btn btn-1">确认登录</button>
      </div>

      <div class="btn-item">
        <p>版本2·渐变质感按钮</p>
        <button class="custom-btn btn-2">立即提交</button>
      </div>

      <div class="btn-item">
        <p>版本3·描边镂空按钮</p>
        <button class="custom-btn btn-3">返回上页</button>
      </div>

      <div class="btn-item">
        <p>版本4·扁平简约按钮</p>
        <button class="custom-btn btn-4">操作确认</button>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.btn-show-box {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}
.btn-show-box h3 {
  font-size: 18px;
  color: var(--font-color-title, #34393b);
  margin-bottom: 20px;
  font-weight: 500;
}
.btn-list {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
  align-items: center;
}
.btn-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
}
.btn-item p {
  font-size: 14px;
  color: var(--font-color-desc, #ABB1B3);
  margin: 0;
}

.custom-btn {
  font-family: Manrope, PingFang SC, Microsoft YaHei, 微软雅黑, Helvetica Neue, Helvetica, Arial, Verdana, Tahoma, sans-serif;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  white-space: nowrap;
  cursor: pointer;
  text-align: center;
  box-sizing: border-box;
  transition: 0.2s ease;
  user-select: none;
  vertical-align: middle;
  -webkit-appearance: none;
  outline: none;
  width: 220px;
  height: 50px;
  font-size: 16px;
  font-weight: 400;
  border-radius: 100px;
  border: none;
}

/* 版本1：主色实心按钮 - 强制高对比度 */
.btn-1 {
  color: #ffffff;
  background-color: var(--theme-color, #F08519);
  box-shadow: 0 2px 8px rgba(240, 133, 25, 0.25);
}
.btn-1:hover {
  background-color: var(--theme-color2, #F19130);
  box-shadow: 0 4px 12px rgba(240, 133, 25, 0.35);
}
.btn-1:active {
  background-color: var(--theme-color11, #D87817);
}

/* 版本2：渐变质感按钮 - 保留阴影防融合 */
.btn-2 {
  color: #ffffff;
  background: linear-gradient(90deg, var(--theme-color, #F08519), var(--theme-color3, #F39D47));
  box-shadow: 0 4px 12px rgba(240, 133, 25, 0.3);
}
.btn-2:hover {
  background: linear-gradient(90deg, var(--theme-color2, #F19130), var(--theme-color4, #F4A95E));
  box-shadow: 0 6px 16px rgba(240, 133, 25, 0.4);
}
.btn-2:active {
  background: linear-gradient(90deg, var(--theme-color11, #D87817), var(--theme-color, #F08519));
}

/* 版本3：描边镂空按钮 - 加边框+背景，防止和白色背景融合 */
.btn-3 {
  color: var(--theme-color, #F08519);
  background-color: #ffffff;
  border: 2px solid var(--theme-color, #F08519);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}
.btn-3:hover {
  color: #ffffff;
  background-color: var(--theme-color, #F08519);
  border-color: var(--theme-color, #F08519);
  box-shadow: 0 4px 10px rgba(240, 133, 25, 0.25);
}
.btn-3:active {
  background-color: var(--theme-color11, #D87817);
  border-color: var(--theme-color11, #D87817);
}

/* 版本4：扁平简约按钮 - 加边框+浅背景，确保可见 */
.btn-4 {
  color: var(--theme-color, #F08519);
  background-color: var(--theme-color9, #FCE7D1);
  border: 1px solid var(--theme-color7, #F9CEA3);
  border-radius: 8px;
}
.btn-4:hover {
  color: #ffffff;
  background-color: var(--theme-color3, #F39D47);
  border-color: var(--theme-color3, #F39D47);
}
.btn-4:active {
  background-color: var(--theme-color11, #D87817);
  border-color: var(--theme-color11, #D87817);
}
</style>