<template>
  <div class="workstation" @click.self="closeContextMenu">
    <!-- 地图容器 -->
    <div ref="mapContainer" class="map-container" @contextmenu.prevent></div>

    <!-- 全局新增按钮（文字 +，不再依赖旧图标） -->
    <el-button
      class="global-add-btn"
      type="primary"
      circle
      @click="openAddDialog"
      title="全局新增（不关联省份）"
    >+</el-button>

    <!-- 右键菜单：固定定位，不会随鼠标移动 -->
    <div
      v-if="contextMenu.visible"
      class="context-menu"
      :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
      @click.stop
    >
      <div class="menu-item" @click="addCollegeInProvince(contextMenu.province)">
        <span class="menu-icon">+</span> 新增院校 ({{ contextMenu.province }})
      </div>
      <div
        v-if="contextMenu.collegeCount > 0"
        class="menu-item"
        @click="openProvinceList(contextMenu.province)"
      >
        <span class="menu-icon">☰</span> 查看已记录院校 ({{ contextMenu.collegeCount }})
      </div>
    </div>

    <!-- 省份院校列表抽屉 -->
    <el-drawer
      :title="drawerTitle"
      v-model="drawerVisible"
      size="350px"
      direction="rtl"
    >
      <ul class="college-list">
        <li
          v-for="college in drawerColleges"
          :key="college.id"
          @click="editCollege(college); drawerVisible = false"
          class="college-item"
        >
          <span class="college-name">{{ college.name }}</span>
          <span class="college-tags">{{ college.tags.join(' / ') }}</span>
        </li>
      </ul>
      <div v-if="!drawerColleges.length" style="text-align:center; margin-top:40px; color:#999;">
        暂无院校，请通过右键菜单新增
      </div>
    </el-drawer>

    <!-- 表单弹窗 -->
    <el-dialog
      :title="editMode === 'create' ? '新增院校信息' : '编辑院校信息'"
      v-model="formVisible"
      width="700px"
      :close-on-click-modal="false"
    >
      <div class="form-step-indicator">
        <span :class="{ active: currentStep === 1 }">基本信息</span>
        <span :class="{ active: currentStep === 2 }">考试信息</span>
        <span :class="{ active: currentStep === 3 }">软信息与证明</span>
      </div>
      <el-form :model="form" label-width="100px" size="default">
        <!-- 步骤1 -->
        <template v-if="currentStep === 1">
          <el-form-item label="院校名称">
            <el-input v-model="form.name" placeholder="请输入完整校名"></el-input>
          </el-form-item>
          <el-form-item label="所在省/市">
            <el-input v-model="form.province" placeholder="如：江苏" @blur="autoLocate"></el-input>
          </el-form-item>
          <el-form-item label="城市">
            <el-input v-model="form.city" placeholder="如：南京"></el-input>
          </el-form-item>
          <el-form-item label="专业">
            <el-input v-model="form.major" placeholder="报考专业"></el-input>
          </el-form-item>
          <el-form-item label="方向">
            <el-input v-model="form.direction" placeholder="研究方向（可选）"></el-input>
          </el-form-item>
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
        <!-- 步骤2 -->
        <template v-if="currentStep === 2">
          <el-form-item label="考试科目">
            <el-input v-model="form.subjects" placeholder="如：政治、英语一、数学一、408"></el-input>
          </el-form-item>
          <el-form-item label="最近分数线">
            <el-input v-model="form.scoreLine" placeholder="如：365"></el-input>
          </el-form-item>
          <el-form-item label="报录比">
            <el-input v-model="form.ratio" placeholder="如：1:8"></el-input>
          </el-form-item>
          <el-form-item label="学费/学制">
            <el-input v-model="form.tuition" placeholder="如：8000/年 3年"></el-input>
          </el-form-item>
          <el-form-item label="备注">
            <el-input type="textarea" v-model="form.remark" rows="3"></el-input>
          </el-form-item>
        </template>
        <!-- 步骤3 -->
        <template v-if="currentStep === 3">
          <el-form-item label="导师信息">
            <el-input v-model="form.tutorInfo" placeholder="导师姓名、方向、风评等"></el-input>
          </el-form-item>
          <el-form-item label="复试风格">
            <el-input v-model="form.interviewStyle" placeholder="如：偏重项目经验"></el-input>
          </el-form-item>
          <el-form-item label="其他主观信息">
            <el-input v-model="form.subjective" placeholder="是否歧视双非、宿舍条件等"></el-input>
          </el-form-item>
          <el-form-item label="证明材料">
            <div class="proof-area">
              <div v-for="(proof, idx) in form.proofs" :key="idx" class="proof-item">
                <span>{{ proof.type }}: {{ proof.label }}</span>
                <el-button size="small" type="text" @click="removeProof(idx)">删除</el-button>
              </div>
              <el-upload
                action="#"
                :auto-upload="false"
                :on-change="handleProofFile"
                :show-file-list="false"
                accept="image/*,.pdf,.xlsx,.docx,.html"
              >
                <el-button size="small">上传文件</el-button>
              </el-upload>
              <el-input
                v-model="proofLink"
                placeholder="粘贴链接"
                style="width:200px; margin-left:10px;"
                size="small"
              ></el-input>
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
        <el-button size="small" icon="Download">导出</el-button>
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

const CHINA_GEOJSON_URL = 'https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json'
const GAODE_KEY = '你的高德Web服务Key' // 替换为你的Key

export default {
  name: 'CollegeMapWorkstationD',
  setup() {
    // 数据
    const colleges = ref([])
    const chart = ref(null)
    const mapContainer = ref(null)

    // 右键菜单
    const contextMenu = reactive({
      visible: false,
      x: 0,
      y: 0,
      province: '',
      collegeCount: 0
    })

    // 抽屉
    const drawerVisible = ref(false)
    const drawerTitle = ref('')
    const drawerColleges = ref([])

    // 表单
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
        remark: '', tutorInfo: '', interviewStyle: '', subjective: '',
        proofs: []
      }
    }

    // 数据持久化
    function loadColleges() {
      const saved = localStorage.getItem('colleges_data')
      if (saved) colleges.value = JSON.parse(saved)
    }
    function saveCollegesToStorage() {
      localStorage.setItem('colleges_data', JSON.stringify(colleges.value))
    }

    // 地图渲染
    function renderMap() {
      const provinceCount = {}
      colleges.value.forEach(c => {
        if (c.province) provinceCount[c.province] = (provinceCount[c.province] || 0) + 1
      })
      chart.value.setOption({
        tooltip: {
          trigger: 'item',
          formatter: (params) => {
            const cnt = provinceCount[params.name] || 0
            return `${params.name}<br/>已记录院校: ${cnt} 所`
          }
        },
        series: [{
          type: 'map',
          map: 'china',
          roam: true,
          label: { show: true, color: '#333', fontSize: 10 },
          itemStyle: { areaColor: '#e6f0fa', borderColor: '#999' },
          emphasis: { label: { show: true, color: '#000' }, itemStyle: { areaColor: '#cfdfff' } },
          data: Object.keys(provinceCount).map(name => ({ name, value: provinceCount[name] }))
        }]
      })
    }

    async function loadMap() {
      chart.value = echarts.init(mapContainer.value)
      const resp = await fetch(CHINA_GEOJSON_URL)
      const geoJson = await resp.json()
      echarts.registerMap('china', geoJson)
      renderMap()

      // 右键菜单事件
      chart.value.on('contextmenu', (params) => {
        params.event.event.preventDefault()
        const province = params.name
        if (!province) return
        const count = colleges.value.filter(c => c.province === province).length
        contextMenu.visible = true
        contextMenu.x = params.event.offsetX + 10
        contextMenu.y = params.event.offsetY + 10
        contextMenu.province = province
        contextMenu.collegeCount = count
      })

      // 点击地图其他地方关闭菜单
      chart.value.getZr().on('click', () => {
        contextMenu.visible = false
      })

      window.addEventListener('resize', () => chart.value?.resize())
    }

    function closeContextMenu() {
      contextMenu.visible = false
    }

    // 打开全局新增表单（无预填省份）
    function openAddDialog() {
      formVisible.value = true
      editMode.value = 'create'
      currentStep.value = 1
      Object.assign(form, getEmptyForm())
      currentEditCollegeId.value = null
    }

    // 在指定省份新增
    function addCollegeInProvince(province) {
      contextMenu.visible = false
      openAddDialog()
      form.province = province
    }

    // 查看省份院校列表
    function openProvinceList(province) {
      contextMenu.visible = false
      drawerColleges.value = colleges.value.filter(c => c.province === province)
      drawerTitle.value = `${province} 已记录院校`
      drawerVisible.value = true
    }

    // 编辑院校
    function editCollege(college) {
      formVisible.value = true
      editMode.value = 'edit'
      currentEditCollegeId.value = college.id
      currentEditCollege.value = college
      Object.assign(form, college)
      currentStep.value = 1
    }

    // 保存院校
    function saveCollege() {
      if (editMode.value === 'create') {
        const newCollege = { id: Date.now().toString(), ...form }
        if (!newCollege.coords) geocodeCollege(newCollege)
        colleges.value.push(newCollege)
        currentEditCollege.value = newCollege
      } else {
        const idx = colleges.value.findIndex(c => c.id === currentEditCollegeId.value)
        if (idx !== -1) {
          Object.assign(colleges.value[idx], form)
          currentEditCollege.value = colleges.value[idx]
        }
      }
      saveCollegesToStorage()
      formVisible.value = false
      renderMap()
    }

    // 高德地理编码
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
      } catch (e) { /* ignore */ }
    }

    function autoLocate() {
      if (form.name) geocodeCollege(form)
    }

    // 证明操作
    function handleProofFile(file) {
      form.proofs.push({ type: 'file', label: file.name, data: file.raw })
    }
    function addProofLink() {
      if (proofLink.value.trim()) {
        form.proofs.push({ type: 'link', label: proofLink.value, data: proofLink.value })
        proofLink.value = ''
      }
    }
    function removeProof(idx) {
      form.proofs.splice(idx, 1)
    }

    // 导出功能 (完整实现)
    function generateAllHTML() {
      let html = '<h2>考研择校信息总表</h2><table border="1" cellpadding="5" cellspacing="0">'
      html += '<tr><th>院校</th><th>专业</th><th>方向</th><th>标签</th><th>考试科目</th><th>分数线</th><th>报录比</th><th>备注</th></tr>'
      colleges.value.forEach(c => {
        html += `<tr>
          <td>${c.name}</td><td>${c.major}</td><td>${c.direction || ''}</td><td>${c.tags.join(',')}</td>
          <td>${c.subjects}</td><td>${c.scoreLine}</td><td>${c.ratio}</td><td>${c.remark || ''}</td>
        </tr>`
      })
      html += '</table><p>证明链接：<ul>'
      colleges.value.forEach(c => {
        if (c.proofs.length) {
          html += `<li>${c.name}: ${c.proofs.map(p => p.label).join(', ')}</li>`
        }
      })
      html += '</ul></p>'
      return html
    }

    function generateSingleHTML(college) {
      return `<h2>${college.name} - ${college.major}</h2>
        <p><b>标签:</b> ${college.tags.join(',')}</p>
        <table border="1"><tr><td>城市</td><td>${college.city}</td></tr>
        <tr><td>考试科目</td><td>${college.subjects}</td></tr>
        <tr><td>分数线</td><td>${college.scoreLine}</td></tr>
        <tr><td>报录比</td><td>${college.ratio}</td></tr>
        <tr><td>导师信息</td><td>${college.tutorInfo || ''}</td></tr>
        <tr><td>复试风格</td><td>${college.interviewStyle || ''}</td></tr>
        <tr><td>备注</td><td>${college.remark || ''}</td></tr></table>
        <h4>证明材料</h4><ul>${college.proofs.map(p => `<li>${p.label}</li>`).join('')}</ul>`
    }

    async function exportAllPDF() {
      const element = document.createElement('div')
      element.innerHTML = generateAllHTML()
      document.body.appendChild(element)
      if (window.html2canvas && window.jspdf) {
        const canvas = await html2canvas(element, { scale: 2 })
        const pdf = new jspdf.jsPDF('p', 'mm', 'a4')
        const imgData = canvas.toDataURL('image/png')
        pdf.addImage(imgData, 'PNG', 10, 10, 190, 0)
        pdf.save('考研院校总表.pdf')
      } else {
        alert('请引入 html2canvas 和 jspdf 库')
      }
      document.body.removeChild(element)
    }

    function exportAllWord() {
      const html = generateAllHTML()
      const blob = new Blob([html], { type: 'application/msword' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = '考研院校总表.doc'
      a.click()
      URL.revokeObjectURL(a.href)
    }

    async function exportSinglePDF() {
      if (!currentEditCollege.value) return
      const element = document.createElement('div')
      element.innerHTML = generateSingleHTML(currentEditCollege.value)
      document.body.appendChild(element)
      if (window.html2canvas && window.jspdf) {
        const canvas = await html2canvas(element, { scale: 2 })
        const pdf = new jspdf.jsPDF('p', 'mm', 'a4')
        const imgData = canvas.toDataURL('image/png')
        pdf.addImage(imgData, 'PNG', 10, 10, 190, 0)
        pdf.save(`${currentEditCollege.value.name}_报告.pdf`)
      } else {
        alert('请引入 html2canvas 和 jspdf 库')
      }
      document.body.removeChild(element)
    }

    function handleExport(command) {
      if (command === 'all-pdf') exportAllPDF()
      else if (command === 'all-word') exportAllWord()
      else if (command === 'single-pdf') exportSinglePDF()
    }

    function exportJson() {
      const data = JSON.stringify(colleges.value, null, 2)
      const blob = new Blob([data], {type: 'application/json'})
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = 'colleges_backup.json'
      a.click()
    }

    function importJson() {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.json'
      input.onchange = (e) => {
        const file = e.target.files[0]
        const reader = new FileReader()
        reader.onload = (ev) => {
          try {
            colleges.value = JSON.parse(ev.target.result)
            saveCollegesToStorage()
            renderMap()
            alert('导入成功')
          } catch(ex) { alert('文件格式错误') }
        }
        reader.readAsText(file)
      }
      input.click()
    }

    onMounted(() => {
      loadColleges()
      loadMap()
    })

    return {
      mapContainer,
      chart,
      colleges,
      contextMenu,
      drawerVisible,
      drawerTitle,
      drawerColleges,
      formVisible,
      editMode,
      currentEditCollegeId,
      currentStep,
      form,
      proofLink,
      currentEditCollege,
      closeContextMenu,
      openAddDialog,
      addCollegeInProvince,
      openProvinceList,
      editCollege,
      saveCollege,
      handleProofFile,
      addProofLink,
      removeProof,
      handleExport,
      exportJson,
      importJson
    }
  }
}
</script>

<style scoped>
.workstation {
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
}
.map-container {
  flex: 1;
  height: 100%;
}
.global-add-btn {
  position: absolute;
  top: 20px;
  right: 80px;
  z-index: 100;
  width: 40px;
  height: 40px;
  font-size: 20px;
}
.toolbar {
  position: absolute;
  top: 10px;
  right: 20px;
  z-index: 100;
  background: rgba(255,255,255,0.9);
  padding: 6px 12px;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}
.context-menu {
  position: absolute;
  background: white;
  border: 1px solid #dcdcdc;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 300;
  min-width: 180px;
  padding: 4px 0;
}
.menu-item {
  padding: 8px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #333;
}
.menu-item:hover {
  background: #f0f7ff;
  color: #409EFF;
}
.menu-icon {
  font-weight: bold;
  width: 16px;
  text-align: center;
}
.college-list {
  list-style: none;
  padding: 0;
}
.college-item {
  padding: 12px 20px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
}
.college-item:hover {
  background: #f5f7fa;
}
.college-name {
  font-weight: 500;
}
.college-tags {
  font-size: 12px;
  color: #909399;
}
.form-step-indicator {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
  padding: 0 40px;
}
.form-step-indicator span {
  flex: 1;
  text-align: center;
  padding: 6px;
  background: #f5f5f5;
  border-radius: 20px;
  margin: 0 5px;
}
.form-step-indicator span.active {
  background: #409EFF;
  color: white;
}
.proof-area {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.proof-item {
  background: #f2f2f2;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}
</style>