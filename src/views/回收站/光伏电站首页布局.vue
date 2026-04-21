```vue
<template>
  <!-- 根容器 -->
  <div class="App new-app-container">
    <!-- 电站首页主容器 -->
    <div class="nco-home-container">
      <!-- 顶部工具栏：视图切换 -->
      <div class="nco-home-container-toolbar">
        <div class="nco-home-container-switcher" style="top: 1.25rem">
          <!-- 列表视图 -->
          <div class="nco-home-container-switcher-active">
            <span class="dpicon" title="列表视图">
              <svg fill="currentColor" viewBox="0 0 24 24" width="1em" height="1em">
                <path d="M20.158 19.95L3.841 19.95L3.841 17.95L20.158 17.95L20.158 19.95ZM21.158 18.95C21.158 19.5 20.711 19.95 20.158 19.95C19.606 19.95 19.158 19.5 19.158 18.95C19.158 18.4 19.606 17.95 20.158 17.95C20.711 17.95 21.158 18.4 21.158 18.95ZM4.841 18.95C4.841 19.5 4.394 19.95 3.841 19.95C3.289 19.95 2.841 19.5 2.841 18.95C2.841 18.4 3.289 17.95 3.841 17.95C4.394 17.95 4.841 18.4 4.841 18.95ZM20.158 6.008L3.841 6.008L3.841 4.008L20.158 4.008L20.158 6.008ZM21.158 5.008C21.158 5.56 20.711 6.008 20.158 6.008C19.606 6.008 19.158 5.56 19.158 5.008C19.158 4.456 19.606 4.008 20.158 4.008C20.711 4.008 21.158 4.456 21.158 5.008ZM4.841 5.008C4.841 5.56 4.394 6.008 3.841 6.008C3.289 6.008 2.841 5.56 2.841 5.008C2.841 4.456 3.289 4.008 3.841 4.008C4.394 4.008 4.841 4.456 4.841 5.008ZM20.158 12.979L3.841 12.979L3.841 10.979L20.158 10.979L20.158 12.979ZM21.158 11.979C21.158 12.531 20.711 12.979 20.158 12.979C19.606 12.979 19.158 12.531 19.158 11.979C19.158 11.427 19.606 10.979 20.158 10.979C20.711 10.979 21.158 11.427 21.158 11.979ZM4.841 11.979C4.841 12.531 4.394 12.979 3.841 12.979C3.289 12.979 2.841 12.531 2.841 11.979C2.841 11.427 3.289 10.979 3.841 10.979C4.394 10.979 4.841 11.427 4.841 11.979" />
              </svg>
            </span>
          </div>
          <!-- KPI视图 -->
          <div>
            <span class="dpicon" title="KPI视图">
              <svg fill="currentColor" viewBox="0 0 24 24" width="1em" height="1em">
                <path d="M12.97 11.03C13.11 11.17 13.3 11.25 13.5 11.25H21c.41 0 .75-.34.75-.75C21.75 7.08 19.33 4.67 16.92 2.25H13.5c-.41 0-.75.34-.75.75v7.5c0 .2.08.39.22.53zM2.43 14.3Q1.88 11.55 2.95 9C4.03 6.37 6.36 4.81 8.27 3.53C10.51 3.3 11.5 3.7 11.5 4.25v7.25c0 .55.45 1 1 1h7.25c.55 0 1-.45 1-1-.15-1.48-.65-2.86-1.5-4.14-1.54-2.33-4.13-3.9-6.96-4.54C9.69 2.42 6.94 2 4.96 3.96 3 5.94 2.43 8.7 2.43 14.3z" fill-rule="evenodd" />
              </svg>
            </span>
          </div>
        </div>
      </div>

      <!-- 核心卡片区域：KPI + 状态 + 告警 -->
      <div class="nco-home-banner nco-home-banner-show">
        <!-- 1. 电站KPI卡片 -->
        <div class="nco-home-banner-card">
          <div class="nco-home-kpi-card">
            <div class="nco-site-kpi-card">
              <div class="nco-site-kpi-title">
                <span class="nco-site-kpi-titleWord">电站KPI</span>
                <div class="nco-firlter-params">
                  <i class="icon-setting-lined" title="选择参数"></i>
                </div>
              </div>
              <div class="nco-site-kpi-card-optional">
                <ul>
                  <li>
                    <div class="nco-kpi-counter-value">
                      <div class="counter-value-icon">
                        <i class="icon-current-power-lined" title="当前功率"></i>
                      </div>
                      <div class="counter-value-main">
                        <div class="counter-value-main-value">
                          <div class="value"><span>18.83</span></div>
                          <div class="unit-and-increase"><div class="unit">kW</div></div>
                        </div>
                        <div class="counter-value-main-title">当前功率</div>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div class="nco-kpi-counter-value">
                      <div class="counter-value-icon">
                        <i class="icon-yield-today-lined" title="当日发电量"></i>
                      </div>
                      <div class="counter-value-main">
                        <div class="counter-value-main-value">
                          <div class="value"><span>27.68</span></div>
                          <div class="unit-and-increase"><div class="unit">度</div></div>
                        </div>
                        <div class="counter-value-main-title">当日发电量</div>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div class="nco-kpi-counter-value">
                      <div class="counter-value-icon">
                        <i class="icon-total-yield-lined" title="累计发电量"></i>
                      </div>
                      <div class="counter-value-main">
                        <div class="counter-value-main-value">
                          <div class="value"><span>7.14</span></div>
                          <div class="unit-and-increase"><div class="unit">万度</div></div>
                        </div>
                        <div class="counter-value-main-title">累计发电量</div>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div class="nco-kpi-counter-value">
                      <div class="counter-value-icon">
                        <i class="icon-inverter-power-lined" title="逆变器额定功率"></i>
                      </div>
                      <div class="counter-value-main">
                        <div class="counter-value-main-value">
                          <div class="value"><span>32.00</span></div>
                          <div class="unit-and-increase"><div class="unit">kW</div></div>
                        </div>
                        <div class="counter-value-main-title">逆变器额定功率</div>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. 电站状态卡片 -->
        <div class="nco-home-status-card">
          <div class="nco-site-status-card">
            <div class="nco-site-status-title"><span>电站状态</span></div>
            <div class="nco-site-status-echarts-container">
              <div class="nco-site-status-echarts" style="width:135px;height:177px"></div>
            </div>
            <div class="legend-container">
              <div class="legend-item">
                <span class="circle legend-icon" style="background-color: #41ba41"></span>
                <div class="legend-text"><span class="value">2</span><span class="title">正常电站</span></div>
              </div>
              <div class="legend-item">
                <span class="circle legend-icon" style="background-color: #fa2a2d"></span>
                <div class="legend-text"><span class="value">0</span><span class="title">故障电站</span></div>
              </div>
              <div class="legend-item">
                <span class="circle legend-icon" style="background-color: #999"></span>
                <div class="legend-text"><span class="value">0</span><span class="title">断连电站</span></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. 当前告警卡片 -->
        <div class="nco-home-status-card" style="width: 22%; padding-right: 2%">
          <div class="nco-realtime-alarm-card">
            <div class="nco-realtime-alarm-title"><span>当前告警</span></div>
            <div class="nco-realtime-alarm-echarts-container">
              <div class="nco-realtime-alarm-echarts" style="width:135px;height:175px"></div>
            </div>
            <div class="legend-container">
              <div class="legend-item">
                <i class="icon-alarm-critical-lined legend-icon" style="color: #e44545"></i>
                <div class="legend-text"><span class="value">0</span><span class="title">紧急告警</span></div>
              </div>
              <div class="legend-item">
                <i class="icon-alarm-major-lined legend-icon" style="color: #ff8000"></i>
                <div class="legend-text"><span class="value">0</span><span class="title">重要告警</span></div>
              </div>
              <div class="legend-item">
                <i class="icon-alarm-minor-lined legend-icon" style="color: #ffbb33"></i>
                <div class="legend-text"><span class="value">0</span><span class="title">次要告警</span></div>
              </div>
              <div class="legend-item">
                <i class="icon-alarm-prompt-lined legend-icon" style="color: #4faff5"></i>
                <div class="legend-text"><span class="value">0</span><span class="title">提示告警</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 分隔块 -->
      <div class="nco-home-container-split" style="height: 1.5rem"></div>

      <!-- 电站列表区域 -->
      <div class="nco-home-list">
        <div class="ant-row">
          <div class="nco-home-site-list">
            <!-- 筛选表单 -->
            <div class="nco-table-with-search-bar">
              <div class="collapse-form">
                <form class="ant-form ant-form-horizontal">
                  <div class="ant-row">
                    <div class="ant-col collapse-item">
                      <div class="ant-form-item">
                        <label class="ant-form-item-label">电站名称</label>
                        <div class="ant-form-item-control">
                          <input placeholder="电站名称" class="ant-input" style="width: 12rem" />
                        </div>
                      </div>
                    </div>
                    <div class="ant-col collapse-item">
                      <div class="ant-form-item">
                        <label class="ant-form-item-label">国家/地区</label>
                        <div class="ant-form-item-control">
                          <input placeholder="国家/地区" class="ant-input" style="width: 12rem" />
                        </div>
                      </div>
                    </div>
                    <div class="ant-col collapse-item">
                      <div class="ant-form-item">
                        <label class="ant-form-item-label">设备类型</label>
                        <div class="ant-form-item-control">
                          <div class="ant-select" style="width: 12rem">
                            <div class="ant-select-selector"><span>全部</span></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="ant-col collapse-item">
                      <div class="ant-form-item">
                        <label class="ant-form-item-label">设备SN</label>
                        <div class="ant-form-item-control">
                          <input placeholder="设备SN" class="ant-input" style="width: 12rem" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="ant-col collapse-form-btn-wrapper">
                    <button class="ant-btn ant-btn-primary">查询</button>
                    <button class="ant-btn ant-btn-default">重置</button>
                  </div>
                </form>
              </div>
            </div>

            <!-- 数据表格 -->
            <div class="nco-table-with-search-bar-table">
              <div class="ant-table-wrapper">
                <div class="ant-table">
                  <div class="ant-table-container">
                    <table>
                      <thead class="ant-table-thead">
                        <tr>
                          <th>状态</th>
                          <th>电站实景</th>
                          <th>电站名称</th>
                          <th>电站类型</th>
                          <th>国家/地区</th>
                          <th>当日发电量</th>
                          <th>累计发电量</th>
                        </tr>
                      </thead>
                      <tbody class="ant-table-tbody">
                        <tr>
                          <td><div class="nco-station-state-green-circle"></div></td>
                          <td><img src="https://via.placeholder.com/40" alt="实景" /></td>
                          <td>浅山别墅***</td>
                          <td>户用</td>
                          <td>中国</td>
                          <td>15.44 度</td>
                          <td>43907.55 度</td>
                        </tr>
                        <tr>
                          <td><div class="nco-station-state-green-circle"></div></td>
                          <td><img src="https://via.placeholder.com/40" alt="实景" /></td>
                          <td>上城郡3***</td>
                          <td>户用</td>
                          <td>中国</td>
                          <td>12.24 度</td>
                          <td>27497.11 度</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <!-- 分页 -->
            <ul class="ant-pagination ant-pagination-mini">
              <li>总计：2</li>
              <li class="ant-pagination-item-active">1</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 按需引入ECharts（模拟图表，可替换为真实ECharts实例）
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'

onMounted(() => {
  // 电站状态饼图
  const statusChart = echarts.init(document.querySelector('.nco-site-status-echarts'))
  statusChart.setOption({
    series: [{ type: 'pie', radius: ['40%', '70%'], data: [{ value: 2, name: '正常' }] }],
    color: ['#41ba41', '#fa2a2d', '#999']
  })

  // 告警饼图
  const alarmChart = echarts.init(document.querySelector('.nco-realtime-alarm-echarts'))
  alarmChart.setOption({
    series: [{ type: 'pie', radius: ['40%', '70%'], data: [] }],
    color: ['#e44545', '#ff8000', '#ffbb33', '#4faff5']
  })
})
</script>

<style scoped>
/* 全局样式：完全继承原页面美术风格 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.new-app-container {
  width: 100%;
  min-height: 100vh;
  background: #f5f7fa;
  padding: 1rem;
}

/* 主容器 */
.nco-home-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* 工具栏 */
.nco-home-container-toolbar {
  display: flex;
  justify-content: flex-end;
  padding: 0 1rem;
}

.nco-home-container-switcher {
  display: flex;
  gap: 1rem;
  align-items: center;
  cursor: pointer;
}

.nco-home-container-switcher-active {
  color: #1890ff;
  font-weight: 500;
}

.dpicon {
  font-size: 1.2rem;
}

/* 核心卡片区域 */
.nco-home-banner {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.nco-home-banner-card,
.nco-home-status-card {
  flex: 1;
  min-width: 300px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 1rem;
}

/* KPI卡片 */
.nco-site-kpi-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 1rem;
  font-weight: 500;
  color: #333;
}

.nco-site-kpi-card-optional ul {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.nco-kpi-counter-value {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.counter-value-icon {
  font-size: 1.5rem;
  color: #1890ff;
}

.counter-value-main-value {
  display: flex;
  align-items: baseline;
  gap: 0.3rem;
}

.value {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
}

.unit {
  font-size: 0.8rem;
  color: #999;
}

.counter-value-main-title {
  font-size: 0.8rem;
  color: #666;
  margin-top: 0.2rem;
}

/* 图例样式 */
.legend-container {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
}

.legend-icon {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.circle {
  display: inline-block;
}

/* 状态圆点 */
.nco-station-state-green-circle {
  width: 10px;
  height: 10px;
  background-color: #41ba41;
  border-radius: 50%;
}

/* 表格样式 */
.ant-table {
  background: #fff;
  border-radius: 8px;
  margin-top: 1rem;
}

.ant-table-thead tr {
  background: #fafafa;
}

.ant-table th,
.ant-table td {
  padding: 0.8rem 1rem;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
}

/* 表单样式 */
.ant-form {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.ant-form-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ant-form-item-label {
  font-size: 0.8rem;
  color: #666;
  white-space: nowrap;
}

.ant-input {
  padding: 0.4rem 0.8rem;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  outline: none;
}

.ant-btn {
  padding: 0.4rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  border: none;
}

.ant-btn-primary {
  background: #1890ff;
  color: #fff;
}

.ant-btn-default {
  background: #fff;
  border: 1px solid #d9d9d9;
  color: #666;
}

/* 分页 */
.ant-pagination {
  list-style: none;
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  align-items: center;
}

.ant-pagination-item-active {
  color: #1890ff;
  font-weight: 500;
}
</style>
```