<template>
  <div class="workstation" @click.self="closeContextMenu">
    <!-- 地图容器 -->
    <div ref="mapContainer" class="map-container" @contextmenu.prevent></div>

    <!-- 全局新增按钮 (保留，但主要用右键) -->
    <el-button
      class="global-add-btn"
      type="primary"
      icon="el-icon-plus"
      circle
      @click="openAddDialog()"
      title="全局新增（不关联省份）"
    ></el-button>

    <!-- 右键菜单：固定定位，不随鼠标移动 -->
    <div
      v-if="contextMenu.visible"
      class="context-menu"
      :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
      @click.stop
    >
      <div class="menu-item" @click="addCollegeInProvince(contextMenu.province)">
        <i class="el-icon-plus"></i> 新增院校 ({{ contextMenu.province }})
      </div>
      <div
        v-if="contextMenu.collegeCount > 0"
        class="menu-item"
        @click="openProvinceList(contextMenu.province)"
      >
        <i class="el-icon-view"></i> 查看已记录院校 ({{ contextMenu.collegeCount }})
      </div>
    </div>

    <!-- 省份院校列表抽屉 -->
    <el-drawer
      :title="drawerTitle"
      :visible.sync="drawerVisible"
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

    <!-- 表单弹窗 (与原版完全一致) -->
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

    <!-- 导出工具 -->
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
const CHINA_GEOJSON_URL = 'https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json';
const GAODE_KEY = '你的高德Web服务Key';

export default {
  name: 'CollegeMapWorkstationC',
  data() {
    return {
      chart: null,
      colleges: [],
      // 右键菜单状态
      contextMenu: {
        visible: false,
        x: 0,
        y: 0,
        province: '',
        collegeCount: 0
      },
      // 抽屉
      drawerVisible: false,
      drawerTitle: '',
      drawerColleges: [],
      // 表单
      formVisible: false,
      editMode: 'create',
      currentEditCollegeId: null,
      currentStep: 1,
      form: this.getEmptyForm(),
      proofLink: '',
      currentEditCollege: null
    };
  },
  mounted() {
    this.loadColleges();
    this.loadMap();
  },
  methods: {
    getEmptyForm() {
      return {
        name: '', province: '', city: '', major: '', direction: '',
        tags: [], subjects: '', scoreLine: '', ratio: '', tuition: '',
        remark: '', tutorInfo: '', interviewStyle: '', subjective: '',
        proofs: []
      };
    },
    loadColleges() {
      const saved = localStorage.getItem('colleges_data');
      if (saved) this.colleges = JSON.parse(saved);
    },
    saveCollegesToStorage() {
      localStorage.setItem('colleges_data', JSON.stringify(this.colleges));
    },
    async loadMap() {
      this.chart = echarts.init(this.$refs.mapContainer);
      const resp = await fetch(CHINA_GEOJSON_URL);
      const geoJson = await resp.json();
      echarts.registerMap('china', geoJson);
      this.renderMap();

      // 监听右键点击事件
      this.chart.on('contextmenu', (params) => {
        params.event.event.preventDefault(); // 阻止浏览器默认菜单
        const province = params.name;
        if (!province) return;
        
        const count = this.colleges.filter(c => c.province === province).length;
        
        // 计算菜单位置：使用鼠标客户区坐标
        this.contextMenu = {
          visible: true,
          x: params.event.offsetX + 10,
          y: params.event.offsetY + 10,
          province: province,
          collegeCount: count
        };
      });

      // 点击地图其他区域关闭右键菜单
      this.chart.getZr().on('click', () => {
        this.closeContextMenu();
      });

      window.addEventListener('resize', () => this.chart?.resize());
    },
    renderMap() {
      const provinceCount = {};
      this.colleges.forEach(c => {
        if (c.province) provinceCount[c.province] = (provinceCount[c.province] || 0) + 1;
      });
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: (params) => {
            const cnt = provinceCount[params.name] || 0;
            return `${params.name}<br/>已记录院校: ${cnt} 所`;
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
      };
      this.chart.setOption(option);
    },
    // 右键菜单交互
    closeContextMenu() {
      this.contextMenu.visible = false;
    },
    addCollegeInProvince(province) {
      this.closeContextMenu();
      this.formVisible = true;
      this.editMode = 'create';
      this.currentStep = 1;
      this.form = this.getEmptyForm();
      this.form.province = province;
      this.currentEditCollegeId = null;
    },
    openProvinceList(province) {
      this.closeContextMenu();
      this.drawerColleges = this.colleges.filter(c => c.province === province);
      this.drawerTitle = `${province} 已记录院校`;
      this.drawerVisible = true;
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
        if (!newCollege.coords) this.geocodeCollege(newCollege);
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
      if (this.form.name) this.geocodeCollege(this.form);
    },
    // 证明操作
    handleProofFile(file) {
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
    // 导出功能（和之前一样，略）
    async handleExport(command) { /* 同前，此处省略 */ },
    exportJson() {
      const data = JSON.stringify(this.colleges, null, 2);
      const blob = new Blob([data], {type: 'application/json'});
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'colleges_backup.json';
      a.click();
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
          } catch(ex) { alert('文件格式错误'); }
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
/* 右键菜单样式 */
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
.menu-item i {
  font-size: 16px;
}
/* 抽屉内院校列表 */
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
/* 表单指示器 */
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