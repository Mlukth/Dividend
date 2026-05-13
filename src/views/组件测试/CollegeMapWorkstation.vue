<template>
  <div class="workstation">
    <!-- 地图容器 -->
    <div ref="mapContainer" class="map-container"></div>

    <!-- 省份悬浮详情弹出层 -->
    <div 
      v-if="hoveredProvince && hoveredProvince.colleges.length" 
      class="province-popup" 
      :style="{ left: popupPos.x + 'px', top: popupPos.y + 'px' }"
      @mouseenter="keepPopup = true"
      @mouseleave="hidePopup"
    >
      <div class="popup-header">{{ hoveredProvince.name }} ({{ hoveredProvince.colleges.length }})</div>
      <ul class="popup-list">
        <li 
          v-for="college in hoveredProvince.colleges" 
          :key="college.id"
          @click="editCollege(college)"
        >
          {{ college.name }}
        </li>
      </ul>
      <button class="btn-add" @click="addCollegeInProvince(hoveredProvince.name)">+ 新增院校</button>
    </div>

    <!-- 表单弹窗 -->
    <el-dialog 
      :title="editMode === 'create' ? '新增院校信息' : '编辑院校信息'" 
      :visible.sync="formVisible" 
      width="700px"
      :close-on-click-modal="false"
    >
      <div class="form-step-indicator">
        <span :class="{ active: currentStep === 1 }">基本信息</span>
        <span :class="{ active: currentStep === 2 }">考试信息</span>
        <span :class="{ active: currentStep === 3 }">软信息与证明</span>
      </div>
      <el-form :model="form" label-width="100px" size="small">
        <!-- 步骤1: 基本信息 -->
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

        <!-- 步骤2: 考试信息 -->
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

        <!-- 步骤3: 软信息与证明 -->
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
                <el-button size="mini" type="text" @click="removeProof(idx)">删除</el-button>
              </div>
              <el-upload
                action="#" 
                :auto-upload="false"
                :on-change="handleProofFile"
                :show-file-list="false"
                accept="image/*,.pdf,.xlsx,.docx,.html"
              >
                <el-button size="small" icon="el-icon-paperclip">上传文件</el-button>
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

      <div slot="footer" class="dialog-footer">
        <el-button v-if="currentStep > 1" @click="currentStep--">上一步</el-button>
        <el-button v-if="currentStep < 3" type="primary" @click="currentStep++">下一步</el-button>
        <el-button v-if="currentStep === 3" type="success" @click="saveCollege">保存</el-button>
        <el-button @click="formVisible = false">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 导出选项 (可集成在右上角) -->
    <div class="toolbar">
      <el-dropdown @command="handleExport">
        <el-button size="small" icon="el-icon-download">导出</el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="all-pdf">导出总表 PDF</el-dropdown-item>
          <el-dropdown-item command="all-word">导出总表 Word</el-dropdown-item>
          <el-dropdown-item command="single-pdf" v-if="currentEditCollege">当前院校 PDF</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <el-button size="small" @click="exportJson">备份 JSON</el-button>
      <el-button size="small" @click="importJson">恢复 JSON</el-button>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts';
// 中国地图GeoJSON（离线 CDN 备用）
const CHINA_GEOJSON_URL = 'https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json';
const GAODE_KEY = '	fb15db372d4132c1e6aa041f8a9481fa'; // 请自行申请，用于地理编码

export default {
  name: 'CollegeMapWorkstation',
  data() {
    return {
      chart: null,
      geoJson: null,
      colleges: [], // 所有院校数据 { id, name, province, city, coords:[lng,lat], ... }
      hoveredProvince: null,
      popupPos: { x: 0, y: 0 },
      keepPopup: false,
      formVisible: false,
      editMode: 'create', // create / edit
      currentEditCollegeId: null,
      currentStep: 1,
      form: this.getEmptyForm(),
      proofLink: '',
      currentEditCollege: null, // 用于导出单校
    };
  },
  mounted() {
    this.loadColleges();
    this.loadMap();
  },
  methods: {
    getEmptyForm() {
      return {
        name: '',
        province: '',
        city: '',
        major: '',
        direction: '',
        tags: [],
        subjects: '',
        scoreLine: '',
        ratio: '',
        tuition: '',
        remark: '',
        tutorInfo: '',
        interviewStyle: '',
        subjective: '',
        proofs: []
      };
    },
    loadColleges() {
      const saved = localStorage.getItem('colleges_data');
      if (saved) {
        this.colleges = JSON.parse(saved);
      }
    },
    saveCollegesToStorage() {
      localStorage.setItem('colleges_data', JSON.stringify(this.colleges));
    },
    async loadMap() {
      this.chart = echarts.init(this.$refs.mapContainer);
      // 获取 GeoJSON
      const resp = await fetch(CHINA_GEOJSON_URL);
      this.geoJson = await resp.json();
      echarts.registerMap('china', this.geoJson);
      this.renderMap();
      // 监听鼠标事件
      this.chart.on('mouseover', (params) => {
        if (params.componentType === 'series' && params.name) {
          this.onProvinceHover(params.name, params.event.offsetX, params.event.offsetY);
        }
      });
      this.chart.on('mouseout', () => {
        if (!this.keepPopup) this.hoveredProvince = null;
      });
      window.addEventListener('resize', () => this.chart?.resize());
    },
    renderMap() {
      // 计算各省份已记录院校数量
      const provinceCount = {};
      this.colleges.forEach(c => {
        if (c.province) {
          provinceCount[c.province] = (provinceCount[c.province] || 0) + 1;
        }
      });
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: function(params) {
            const cnt = provinceCount[params.name] || 0;
            return `${params.name}<br/>已记录院校: ${cnt} 所`;
          }
        },
        series: [{
          type: 'map',
          map: 'china',
          roam: true,
          label: {
            show: true,
            color: '#333',
            fontSize: 10
          },
          itemStyle: {
            areaColor: '#e6f0fa',
            borderColor: '#999'
          },
          emphasis: {
            label: { show: true, color: '#000' },
            itemStyle: { areaColor: '#cfdfff' }
          },
          data: Object.keys(provinceCount).map(name => ({
            name,
            value: provinceCount[name]
          }))
        }]
      };
      this.chart.setOption(option);
    },
    onProvinceHover(provinceName, x, y) {
      const collegesInProv = this.colleges.filter(c => c.province === provinceName);
      this.hoveredProvince = { name: provinceName, colleges: collegesInProv };
      this.popupPos = { x: x + 10, y: y + 10 };
    },
    hidePopup() {
      this.keepPopup = false;
      this.hoveredProvince = null;
    },
    addCollegeInProvince(provinceName) {
      this.formVisible = true;
      this.editMode = 'create';
      this.currentStep = 1;
      this.form = this.getEmptyForm();
      this.form.province = provinceName; // 预填省份
      this.currentEditCollegeId = null;
    },
    editCollege(college) {
      this.formVisible = true;
      this.editMode = 'edit';
      this.currentEditCollegeId = college.id;
      this.currentEditCollege = college;
      this.form = { ...college };
      this.currentStep = 1;
    },
    saveCollege() {
      if (this.editMode === 'create') {
        const newId = Date.now().toString();
        const newCollege = { id: newId, ...this.form };
        // 自动定位经纬度（如有）
        if (!newCollege.coords) {
          this.geocodeCollege(newCollege);
        }
        this.colleges.push(newCollege);
        this.currentEditCollege = newCollege;
      } else {
        const idx = this.colleges.findIndex(c => c.id === this.currentEditCollegeId);
        if (idx !== -1) {
          Object.assign(this.colleges[idx], this.form);
          this.currentEditCollege = this.colleges[idx];
        }
      }
      this.saveCollegesToStorage();
      this.formVisible = false;
      this.renderMap();
    },
    async geocodeCollege(college) {
      // 高德地理编码，需要key
      if (!GAODE_KEY || GAODE_KEY === '你的高德Web服务Key') return;
      const address = `${college.province}${college.city}${college.name}`;
      try {
        const resp = await fetch(`https://restapi.amap.com/v3/geocode/geo?key=${GAODE_KEY}&address=${encodeURIComponent(address)}`);
        const data = await resp.json();
        if (data.status === '1' && data.geocodes.length) {
          const loc = data.geocodes[0].location.split(',');
          college.coords = [parseFloat(loc[0]), parseFloat(loc[1])];
        }
      } catch (e) { /* ignore */ }
    },
    autoLocate() {
      if (this.form.name) {
        this.geocodeCollege(this.form);
      }
    },
    // 证明材料处理
    handleProofFile(file) {
      // 简化：保存文件名作为证明
      this.form.proofs.push({ type: 'file', label: file.name, data: file.raw });
    },
    addProofLink() {
      if (this.proofLink.trim()) {
        this.form.proofs.push({ type: 'link', label: this.proofLink, data: this.proofLink });
        this.proofLink = '';
      }
    },
    removeProof(idx) {
      this.form.proofs.splice(idx, 1);
    },
    // 导出
    async handleExport(command) {
      if (command === 'all-pdf') {
        await this.exportAllPDF();
      } else if (command === 'all-word') {
        this.exportAllWord();
      } else if (command === 'single-pdf') {
        await this.exportSinglePDF();
      }
    },
    async exportAllPDF() {
      const element = document.createElement('div');
      element.innerHTML = this.generateAllHTML();
      document.body.appendChild(element);
      // 使用 html2canvas + jspdf (需在 index.html 中引入)
      if (window.html2canvas && window.jspdf) {
        const canvas = await html2canvas(element, { scale: 2 });
        const pdf = new jspdf.jsPDF('p', 'mm', 'a4');
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 10, 10, 190, 0);
        pdf.save('考研院校总表.pdf');
      } else {
        alert('请引入 html2canvas 和 jspdf 库');
      }
      document.body.removeChild(element);
    },
    exportAllWord() {
      const html = this.generateAllHTML();
      const blob = new Blob([html], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '考研院校总表.doc';
      a.click();
      URL.revokeObjectURL(url);
    },
    async exportSinglePDF() {
      if (!this.currentEditCollege) return;
      const element = document.createElement('div');
      element.innerHTML = this.generateSingleHTML(this.currentEditCollege);
      document.body.appendChild(element);
      if (window.html2canvas && window.jspdf) {
        const canvas = await html2canvas(element, { scale: 2 });
        const pdf = new jspdf.jsPDF('p', 'mm', 'a4');
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 10, 10, 190, 0);
        pdf.save(`${this.currentEditCollege.name}_报告.pdf`);
      } else {
        alert('请引入 html2canvas 和 jspdf 库');
      }
      document.body.removeChild(element);
    },
    generateAllHTML() {
      let html = '<h2>考研择校信息总表</h2><table border="1" cellpadding="5" cellspacing="0">';
      html += '<tr><th>院校</th><th>专业</th><th>方向</th><th>标签</th><th>考试科目</th><th>分数线</th><th>报录比</th><th>备注</th></tr>';
      this.colleges.forEach(c => {
        html += `<tr>
          <td>${c.name}</td><td>${c.major}</td><td>${c.direction || ''}</td><td>${c.tags.join(',')}</td>
          <td>${c.subjects}</td><td>${c.scoreLine}</td><td>${c.ratio}</td><td>${c.remark || ''}</td>
        </tr>`;
      });
      html += '</table><p>证明链接：<ul>';
      this.colleges.forEach(c => {
        if (c.proofs.length) {
          html += `<li>${c.name}: ${c.proofs.map(p => p.label).join(', ')}</li>`;
        }
      });
      html += '</ul></p>';
      return html;
    },
    generateSingleHTML(college) {
      return `<h2>${college.name} - ${college.major}</h2>
        <p><b>标签:</b> ${college.tags.join(',')}</p>
        <table border="1"><tr><td>城市</td><td>${college.city}</td></tr>
        <tr><td>考试科目</td><td>${college.subjects}</td></tr>
        <tr><td>分数线</td><td>${college.scoreLine}</td></tr>
        <tr><td>报录比</td><td>${college.ratio}</td></tr>
        <tr><td>导师信息</td><td>${college.tutorInfo || ''}</td></tr>
        <tr><td>复试风格</td><td>${college.interviewStyle || ''}</td></tr>
        <tr><td>备注</td><td>${college.remark || ''}</td></tr></table>
        <h4>证明材料</h4><ul>${college.proofs.map(p => `<li>${p.label}</li>`).join('')}</ul>`;
    },
    exportJson() {
      const data = JSON.stringify(this.colleges, null, 2);
      const blob = new Blob([data], {type: 'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'colleges_backup.json'; a.click();
      URL.revokeObjectURL(url);
    },
    importJson() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (ev) => {
          try {
            this.colleges = JSON.parse(ev.target.result);
            this.saveCollegesToStorage();
            this.renderMap();
            alert('导入成功');
          } catch (ex) { alert('文件格式错误'); }
        };
        reader.readAsText(file);
      };
      input.click();
    }
  }
};
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
.province-popup {
  position: absolute;
  background: white;
  border: 1px solid #ccc;
  padding: 8px;
  border-radius: 4px;
  z-index: 200;
  min-width: 160px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.2);
}
.popup-header {
  font-weight: bold;
  margin-bottom: 6px;
}
.popup-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.popup-list li {
  cursor: pointer;
  padding: 4px 0;
  border-bottom: 1px solid #f0f0f0;
}
.popup-list li:hover {
  color: #409EFF;
}
.btn-add {
  margin-top: 6px;
  width: 100%;
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