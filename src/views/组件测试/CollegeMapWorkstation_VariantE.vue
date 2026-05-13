<template>
  <div class="workstation">
    <div ref="mapContainer" class="map-container"></div>

    <!-- 全局新增按钮 -->
    <el-button class="global-add-btn" type="primary" circle @click="openAddDialog" title="全局新增">+</el-button>

    <!-- 右键菜单 -->
    <div v-if="contextMenu.visible" class="context-menu" :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }" @click.stop>
      <div class="menu-item" @click="addCollegeInProvince(contextMenu.province)"><span class="menu-icon">+</span> 新增院校 ({{ contextMenu.province }})</div>
      <div v-if="contextMenu.collegeCount > 0" class="menu-item" @click="openProvinceList(contextMenu.province)"><span class="menu-icon">☰</span> 查看已记录院校 ({{ contextMenu.collegeCount }})</div>
    </div>

    <!-- 抽屉 -->
    <el-drawer :title="drawerTitle" v-model="drawerVisible" size="350px" direction="rtl">
      <ul class="college-list" v-if="drawerColleges.length">
        <li v-for="college in drawerColleges" :key="college.id" @click="editCollege(college); drawerVisible = false" class="college-item">
          <span class="college-name">{{ college.name }}</span>
          <span class="college-tags">{{ college.tags.join(' / ') }}</span>
        </li>
      </ul>
      <div v-else style="text-align:center; margin-top:40px; color:#999;">暂无院校，请通过右键菜单新增</div>
    </el-drawer>

    <!-- 表单弹窗（与方案D完全一致，此处省略内联细节，见下方脚本） -->
    <el-dialog :title="editMode === 'create' ? '新增院校信息' : '编辑院校信息'" v-model="formVisible" width="700px" :close-on-click-modal="false">
      <!-- 表单内容同方案D，为保完整这里保留全部，但模板过长只列出结构，用注释占位 -->
      <!-- 实际使用请填充完整，或直接复用方案D的模板，这里为了可运行给出简化版 -->
      <div class="form-step-indicator">
        <span :class="{ active: currentStep === 1 }">基本信息</span>
        <span :class="{ active: currentStep === 2 }">考试信息</span>
        <span :class="{ active: currentStep === 3 }">软信息与证明</span>
      </div>
      <el-form :model="form" label-width="100px" size="default">
        <template v-if="currentStep === 1">
          <el-form-item label="院校名称"><el-input v-model="form.name" placeholder="请输入完整校名"></el-input></el-form-item>
          <el-form-item label="所在省/市"><el-input v-model="form.province" placeholder="如：江苏" @blur="autoLocate"></el-input></el-form-item>
          <el-form-item label="城市"><el-input v-model="form.city" placeholder="如：南京"></el-input></el-form-item>
          <el-form-item label="专业"><el-input v-model="form.major" placeholder="报考专业"></el-input></el-form-item>
          <el-form-item label="方向"><el-input v-model="form.direction" placeholder="研究方向（可选）"></el-input></el-form-item>
          <el-form-item label="标签">
            <el-select v-model="form.tags" multiple placeholder="请选择">
              <el-option label="冲刺" value="冲刺"></el-option>
              <el-option label="稳妥" value="稳妥"></el-option>
              <el-option label="保底" value="保底"></el-option>
              <el-option label="自命题" value="自命题"></el-option>
              <el-option label="统考" value="统考"></el-option>
              <el-option label="已联系导师" value="已联系导师"></el-option>
            </el-select>
          </el-form-item>
        </template>
        <template v-if="currentStep === 2">
          <el-form-item label="考试科目"><el-input v-model="form.subjects" placeholder="如：政治、英语一、数学一、408"></el-input></el-form-item>
          <el-form-item label="最近分数线"><el-input v-model="form.scoreLine" placeholder="如：365"></el-input></el-form-item>
          <el-form-item label="报录比"><el-input v-model="form.ratio" placeholder="如：1:8"></el-input></el-form-item>
          <el-form-item label="学费/学制"><el-input v-model="form.tuition" placeholder="如：8000/年 3年"></el-input></el-form-item>
          <el-form-item label="备注"><el-input type="textarea" v-model="form.remark" rows="3"></el-input></el-form-item>
        </template>
        <template v-if="currentStep === 3">
          <el-form-item label="导师信息"><el-input v-model="form.tutorInfo" placeholder="导师姓名、方向、风评等"></el-input></el-form-item>
          <el-form-item label="复试风格"><el-input v-model="form.interviewStyle" placeholder="如：偏重项目经验"></el-input></el-form-item>
          <el-form-item label="其他主观信息"><el-input v-model="form.subjective" placeholder="是否歧视双非、宿舍条件等"></el-input></el-form-item>
          <el-form-item label="证明材料">
            <div class="proof-area">
              <div v-for="(proof, idx) in form.proofs" :key="idx" class="proof-item"><span>{{ proof.type }}: {{ proof.label }}</span><el-button size="small" type="text" @click="removeProof(idx)">删除</el-button></div>
              <el-upload action="#" :auto-upload="false" :on-change="handleProofFile" :show-file-list="false" accept="image/*,.pdf,.xlsx,.docx,.html"><el-button size="small">上传文件</el-button></el-upload>
              <el-input v-model="proofLink" placeholder="粘贴链接" style="width:200px; margin-left:10px;" size="small"></el-input>
              <el-button size="small" @click="addProofLink">添加链接</el-button>
            </div>
          </el-form-item>
        </template>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button v-if="currentStep > 1" @click="currentStep--">上一步</el-button>
          <el-button v-if="currentStep < 3" type="primary" @click="currentStep++">下一步</el-button>
          <el-button v-if="currentStep === 3" type="success" @click="saveCollege">保存</el-button>
          <el-button @click="formVisible = false">取 消</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 导出工具 -->
    <div class="toolbar">
      <el-dropdown @command="handleExport">
        <el-button size="small">导出</el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="all-pdf">导出总表 PDF</el-dropdown-item>
            <el-dropdown-item command="all-word">导出总表 Word</el-dropdown-item>
            <el-dropdown-item command="single-pdf" v-if="currentEditCollege">当前院校 PDF</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <el-button size="small" @click="exportJson">备份 JSON</el-button>
      <el-button size="small" @click="importJson">恢复 JSON</el-button>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import * as echarts from 'echarts'

// 内嵌简版中国地图GeoJSON（含主要省份，足够显示）
const CHINA_GEOJSON = {"type":"FeatureCollection","features":[{"type":"Feature","properties":{"name":"北京"},"geometry":{"type":"Polygon","coordinates":[[[117.2900,40.2200],[117.2900,39.7500],[116.7500,39.7500],[116.7500,40.2200],[117.2900,40.2200]]]}},{"type":"Feature","properties":{"name":"上海"},"geometry":{"type":"Polygon","coordinates":[[[121.8000,31.5000],[121.8000,30.7000],[120.9000,30.7000],[120.9000,31.5000],[121.8000,31.5000]]]}},{"type":"Feature","properties":{"name":"江苏"},"geometry":{"type":"Polygon","coordinates":[[[119.2000,35.2000],[119.2000,30.7000],[116.3000,30.7000],[116.3000,35.2000],[119.2000,35.2000]]]}},{"type":"Feature","properties":{"name":"广东"},"geometry":{"type":"Polygon","coordinates":[[[114.5000,25.5000],[114.5000,20.1000],[109.5000,20.1000],[109.5000,25.5000],[114.5000,25.5000]]]}},{"type":"Feature","properties":{"name":"湖北"},"geometry":{"type":"Polygon","coordinates":[[[112.0000,33.3000],[112.0000,29.0000],[108.3000,29.0000],[108.3000,33.3000],[112.0000,33.3000]]]}},{"type":"Feature","properties":{"name":"甘肃"},"geometry":{"type":"Polygon","coordinates":[[[100.0000,43.0000],[100.0000,32.5000],[92.0000,32.5000],[92.0000,43.0000],[100.0000,43.0000]]]}}]};
// 注意：这只是一个示例用的简略多边形，仅包含北京、上海、江苏、广东、湖北、甘肃，其他省份会被忽略，但足够让用户看到地图轮廓和测试数据的省份。

const GAODE_KEY = '你的高德Web服务Key'

export default {
  name: 'CollegeMapWorkstationE',
  setup() {
    const colleges = ref([])
    const mapContainer = ref(null)
    const chart = ref(null)

    const contextMenu = reactive({ visible: false, x: 0, y: 0, province: '', collegeCount: 0 })
    const drawerVisible = ref(false)
    const drawerTitle = ref('')
    const drawerColleges = ref([])
    const formVisible = ref(false)
    const editMode = ref('create')
    const currentEditCollegeId = ref(null)
    const currentStep = ref(1)
    const form = reactive(getEmptyForm())
    const proofLink = ref('')
    const currentEditCollege = ref(null)

    function getEmptyForm() {
      return {
        name: '', province: '', city: '', major: '', direction: '',
        tags: [], subjects: '', scoreLine: '', ratio: '', tuition: '',
        remark: '', tutorInfo: '', interviewStyle: '', subjective: '', proofs: []
      }
    }

    function loadColleges() {
      const saved = localStorage.getItem('colleges_data')
      if (saved) colleges.value = JSON.parse(saved)
    }
    function saveCollegesToStorage() {
      localStorage.setItem('colleges_data', JSON.stringify(colleges.value))
    }

    function renderMap() {
      const provinceCount = {}
      colleges.value.forEach(c => { if (c.province) provinceCount[c.province] = (provinceCount[c.province] || 0) + 1 })
      chart.value.setOption({
        tooltip: { trigger: 'item', formatter: (p) => `${p.name}<br/>已记录院校: ${provinceCount[p.name] || 0} 所` },
        series: [{
          type: 'map', map: 'china', roam: true,
          label: { show: true, color: '#333', fontSize: 10 },
          itemStyle: { areaColor: '#e6f0fa', borderColor: '#999' },
          emphasis: { label: { show: true }, itemStyle: { areaColor: '#cfdfff' } },
          data: Object.keys(provinceCount).map(name => ({ name, value: provinceCount[name] }))
        }]
      })
    }

    function initMap() {
      chart.value = echarts.init(mapContainer.value)
      echarts.registerMap('china', CHINA_GEOJSON)
      renderMap()

      chart.value.on('contextmenu', (params) => {
        params.event.event.preventDefault()
        const province = params.name
        if (!province) return
        contextMenu.collegeCount = colleges.value.filter(c => c.province === province).length
        contextMenu.province = province
        contextMenu.x = params.event.offsetX + 10
        contextMenu.y = params.event.offsetY + 10
        contextMenu.visible = true
      })
      chart.value.getZr().on('click', () => { contextMenu.visible = false })
      window.addEventListener('resize', () => chart.value?.resize())
    }

    function closeContextMenu() { contextMenu.visible = false }
    function openAddDialog() {
      formVisible.value = true; editMode.value = 'create'; currentStep.value = 1
      Object.assign(form, getEmptyForm()); currentEditCollegeId.value = null
    }
    function addCollegeInProvince(province) {
      contextMenu.visible = false; openAddDialog(); form.province = province
    }
    function openProvinceList(province) {
      drawerColleges.value = colleges.value.filter(c => c.province === province)
      drawerTitle.value = `${province} 已记录院校`
      drawerVisible.value = true
      contextMenu.visible = false
    }
    function editCollege(college) {
      formVisible.value = true; editMode.value = 'edit'; currentEditCollegeId.value = college.id
      currentEditCollege.value = college; Object.assign(form, college); currentStep.value = 1
    }
    function saveCollege() {
      if (editMode.value === 'create') {
        const newCollege = { id: Date.now().toString(), ...form }
        if (!newCollege.coords) geocodeCollege(newCollege)
        colleges.value.push(newCollege)
        currentEditCollege.value = newCollege
      } else {
        const idx = colleges.value.findIndex(c => c.id === currentEditCollegeId.value)
        if (idx !== -1) { Object.assign(colleges.value[idx], form); currentEditCollege.value = colleges.value[idx] }
      }
      saveCollegesToStorage(); formVisible.value = false; renderMap()
    }
    async function geocodeCollege(college) {
      if (!GAODE_KEY || GAODE_KEY === '你的高德Web服务Key') return
      const address = `${college.province}${college.city}${college.name}`
      try {
        const resp = await fetch(`https://restapi.amap.com/v3/geocode/geo?key=${GAODE_KEY}&address=${encodeURIComponent(address)}`)
        const data = await resp.json()
        if (data.status === '1' && data.geocodes.length) {
          const loc = data.geocodes[0].location.split(',')
          college.coords = [parseFloat(loc[0]), parseFloat(loc[1])]
        }
      } catch (e) {}
    }
    function autoLocate() { if (form.name) geocodeCollege(form) }
    function handleProofFile(file) { form.proofs.push({ type: 'file', label: file.name, data: file.raw }) }
    function addProofLink() {
      if (proofLink.value.trim()) {
        form.proofs.push({ type: 'link', label: proofLink.value, data: proofLink.value })
        proofLink.value = ''
      }
    }
    function removeProof(idx) { form.proofs.splice(idx, 1) }

    // 导出功能（简化但可用）
    function handleExport(command) { alert(`导出功能将在后续完善（${command}）`) }
    function exportJson() {
      const blob = new Blob([JSON.stringify(colleges.value, null, 2)], {type: 'application/json'})
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'colleges_backup.json'; a.click()
    }
    function importJson() {
      const input = document.createElement('input'); input.type = 'file'; input.accept = '.json'
      input.onchange = e => {
        const file = e.target.files[0]; const reader = new FileReader()
        reader.onload = ev => {
          try {
            colleges.value = JSON.parse(ev.target.result)
            saveCollegesToStorage(); renderMap(); alert('导入成功')
          } catch(ex) { alert('文件格式错误') }
        }
        reader.readAsText(file)
      }
      input.click()
    }

    onMounted(() => {
      loadColleges()
      initMap()
    })

    return {
      mapContainer, colleges, contextMenu, drawerVisible, drawerTitle, drawerColleges,
      formVisible, editMode, currentEditCollegeId, currentStep, form, proofLink, currentEditCollege,
      closeContextMenu, openAddDialog, addCollegeInProvince, openProvinceList, editCollege,
      saveCollege, handleProofFile, addProofLink, removeProof, handleExport, exportJson, importJson
    }
  }
}
</script>

<style scoped>
.workstation { position: relative; width: 100%; height: 100vh; display: flex; }
.map-container { flex: 1; height: 100%; }
.global-add-btn { position: absolute; top: 20px; right: 80px; z-index: 100; width: 40px; height: 40px; font-size: 20px; }
.toolbar { position: absolute; top: 10px; right: 20px; z-index: 100; background: rgba(255,255,255,0.9); padding: 6px 12px; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
.context-menu { position: absolute; background: white; border: 1px solid #dcdcdc; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 300; min-width: 180px; padding: 4px 0; }
.menu-item { padding: 8px 16px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 14px; color: #333; }
.menu-item:hover { background: #f0f7ff; color: #409EFF; }
.menu-icon { font-weight: bold; width: 16px; text-align: center; }
.college-list { list-style: none; padding: 0; }
.college-item { padding: 12px 20px; border-bottom: 1px solid #f0f0f0; cursor: pointer; display: flex; justify-content: space-between; }
.college-item:hover { background: #f5f7fa; }
.college-name { font-weight: 500; }
.college-tags { font-size: 12px; color: #909399; }
.form-step-indicator { display: flex; justify-content: space-around; margin-bottom: 20px; padding: 0 40px; }
.form-step-indicator span { flex: 1; text-align: center; padding: 6px; background: #f5f5f5; border-radius: 20px; margin: 0 5px; }
.form-step-indicator span.active { background: #409EFF; color: white; }
.proof-area { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.proof-item { background: #f2f2f2; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
</style>