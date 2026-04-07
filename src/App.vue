<template>
  <div>
    <!-- 导航栏 -->
    <div style="padding: 20px; background: #f5f5f5;">
      <router-link to="/" style="margin-right: 20px; text-decoration: none;">电站监控</router-link>
      <router-link to="/contract" style="margin-right: 20px; text-decoration: none;">合同管理</router-link>
      <router-link to="/archive" style="margin-right: 20px; text-decoration: none;">档案管理</router-link>
      <router-link to="/archive-v4" style="margin-right: 20px; text-decoration: none;">新档案(版本4)</router-link>
      <!-- 新增：逆变器追踪菜单 -->
      <router-link to="/inverter-tracker" style="margin-right: 20px; text-decoration: none;">逆变器追踪</router-link>
      <!-- 新增：测试页面菜单 -->
      <router-link to="/test" style="margin-right: 20px; text-decoration: none;">测试页面</router-link>
      <!-- 新增：等级管理菜单 -->
      <router-link to="/grades" style="text-decoration: none;">等级管理</router-link>

      <br />
      <div style="margin-top:10px;">
        <span style="margin-right:10px; color:#666">抽卡页面：</span>
        <router-link to="/draw/inverter-shenmei" style="margin-right: 12px; text-decoration: none;">gemini审美</router-link>
        <router-link to="/draw/inverter-kouzi" style="margin-right: 12px; text-decoration: none;">gemini扣子版</router-link>
        <router-link to="/draw/inverter-doubao" style="margin-right: 12px; text-decoration: none;">gemini豆包版</router-link>
        <router-link to="/draw/inverter-bad" style="margin-right: 12px; text-decoration: none;">一般页面</router-link>
        <router-link to="/draw/inverter-good" style="margin-right: 12px; text-decoration: none;">扣子优质版</router-link>
        <router-link to="/draw/inverter-detail-kouzi" style="margin-right: 12px; text-decoration: none;">扣子单一页面</router-link>
        <router-link to="/draw/inverter-card-grid" style="margin-right: 12px; text-decoration: none;">卡片网格</router-link>
        <!-- 最新：带表格卡片 -->
        <router-link to="/draw/inverter-card-grid-table" style="text-decoration: none;">卡片表格版</router-link>
      </div>
    </div>

    <!-- 页面显示区域 -->
    <router-view />
  </div>
</template>

<script setup>
</script>