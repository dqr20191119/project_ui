<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="编码" prop="projectCode">
        <el-input
          v-model="queryParams.projectCode"
          placeholder="请输入编码"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="简称" prop="shortName">
        <el-input
          v-model="queryParams.shortName"
          placeholder="请输入简称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">

      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['system:manager:add']"
        >新增</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="managerList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="排序" align="center" prop="orderNum" />
      <el-table-column label="项目简称" align="center" prop="shortName" />
      <el-table-column label="工程类别" align="center" prop="projectClass" >
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_project_class" :value="scope.row.projectClass"
          />
        </template>
      </el-table-column>
      <el-table-column label="工程造价" align="center" prop="projectCost" />
      <el-table-column label="工可编织单位" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-Query"
            @click="handleInfo(scope.row)"
            v-hasPermi="['system:manager:query']"
          >查看</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:manager:edit']"
          >修改</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改项目对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="680px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="项目名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入项目名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="项目简称" prop="shortName">
              <el-input v-model="form.shortName" placeholder="请输入项目简称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="工程类别" prop="projectClass">
              <el-select v-model="form.projectClass" placeholder="请选择">

                <el-option
                  v-for="dict in dict.type.sys_project_class"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属地区" prop="area">
              <el-cascader :options="areaOptions" clearable></el-cascader>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="立项编码" prop="projectCode">
              <el-input v-model="form.projectCode" placeholder="请输入立项编码" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序" prop="orderNum">
              <el-input-number v-model="form.orderNum" controls-position="right" :min="0" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="业主管理单位" prop="deptManager">
          <el-select v-model="form.deptManager" multiple placeholder="请选择">
            <el-option
              v-for="item in deptManagerOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="项目总承包单位" prop="deptContracting">
          <el-select v-model="form.deptContracting" multiple placeholder="请选择">
            <el-option
              v-for="item in deptContractingOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="项目咨询单位" prop="deptConsult">
          <el-select v-model="form.deptConsult" multiple placeholder="请选择">
            <el-option
              v-for="item in deptConsultOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="工可编织单位" prop="deptOrganization">
          <el-select v-model="form.deptOrganization" multiple placeholder="请选择">
            <el-option
              v-for="item in deptOrganizationOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="项目建设单位" prop="deptBuild">
          <el-select v-model="form.deptBuild" multiple placeholder="请选择">
            <el-option
              v-for="item in deptBuildOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="项目勘察单位" prop="deptSurvey">
          <el-select v-model="form.deptSurvey" multiple placeholder="请选择">
            <el-option
              v-for="item in deptSurveyOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="项目设计单位" prop="deptDesign">
          <el-select v-model="form.deptDesign" multiple placeholder="请选择">
            <el-option
              v-for="item in deptDesignOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="项目施工单位" prop="deptConstruction">
          <el-select v-model="form.deptConstruction" multiple placeholder="请选择">
            <el-option
              v-for="item in deptConstructionOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="项目监理单位" prop="deptSupervisor">
          <el-select v-model="form.deptSupervisor" multiple placeholder="请选择">
            <el-option
              v-for="item in deptSupervisorOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="项目其他单位" prop="deptOthers">
          <el-select v-model="form.deptOthers" multiple placeholder="请选择">
            <el-option
              v-for="item in deptOthersOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="saveForm">保 存</el-button>
        <el-button type="primary" @click="deleteForm">删 除</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>




    <!-- 添加或修改项目对话框 -->
    <el-dialog :title="title" :visible.sync="openReadOnly" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="项目名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入项目名称" readonly/>
        </el-form-item>
        <el-form-item label="项目简称" prop="shortName">
          <el-input v-model="form.shortName" placeholder="请输入项目简称" readonly/>
        </el-form-item>
        <el-form-item label="工程类别" prop="projectClass">
          <el-select v-model="form.projectClass" placeholder="请选择" aria-readonly="true">
            <el-option
              v-for="dict in dict.type.sys_project_class"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="所属地区" prop="area">
          <el-cascader :options="areaOptions" clearable aria-readonly="true"></el-cascader>
        </el-form-item>
        <el-form-item label="立项编码" prop="projectCode">
          <el-input v-model="form.projectCode" placeholder="请输入立项编码" readonly/>
        </el-form-item>
        <el-form-item label="排序" prop="orderNum">
          <el-input-number v-model="form.orderNum" controls-position="right" :min="0" readonly/>
        </el-form-item>
        <el-form-item label="业主管理单位" prop="deptManager">
          <el-select v-model="form.deptManager" multiple placeholder="请选择">
            <el-option
              v-for="item in deptManagerOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="项目总承包单位" prop="deptContracting">
          <el-select v-model="form.deptContracting" multiple placeholder="请选择">
            <el-option
              v-for="item in deptContractingOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="项目咨询单位" prop="deptConsult">
          <el-select v-model="form.deptConsult" multiple placeholder="请选择">
            <el-option
              v-for="item in deptConsultOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="工可编织单位" prop="deptOrganization">
          <el-select v-model="form.deptOrganization" multiple placeholder="请选择">
            <el-option
              v-for="item in deptOrganizationOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="项目建设单位" prop="deptBuild">
          <el-select v-model="form.deptBuild" multiple placeholder="请选择">
            <el-option
              v-for="item in deptBuildOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="项目勘察单位" prop="deptSurvey">
          <el-select v-model="form.deptSurvey" multiple placeholder="请选择">
            <el-option
              v-for="item in deptSurveyOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="项目设计单位" prop="deptDesign">
          <el-select v-model="form.deptDesign" multiple placeholder="请选择">
            <el-option
              v-for="item in deptDesignOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="项目施工单位" prop="deptConstruction">
          <el-select v-model="form.deptConstruction" multiple placeholder="请选择">
            <el-option
              v-for="item in deptConstructionOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="项目监理单位" prop="deptSupervisor">
          <el-select v-model="form.deptSupervisor" multiple placeholder="请选择">
            <el-option
              v-for="item in deptSupervisorOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="项目其他单位" prop="deptOthers">
          <el-select v-model="form.deptOthers" multiple placeholder="请选择">
            <el-option
              v-for="item in deptOthersOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelReadOnly">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listManager, getManager, delManager, addManager, updateManager,saveManager } from "@/api/project/manager/manager";
import { listDept} from "@/api/system/dept";
export default {
  name: "Manager",
  dicts: ['sys_project_class'],
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 项目表格数据
      managerList: [],
      deptManagerOptions:[],
      deptContractingOptions:[],
      deptConsultOptions:[],
      deptOrganizationOptions:[],
      deptBuildOptions:[],
      deptSurveyOptions:[],
      deptDesignOptions:[],
      deptConstructionOptions:[],
      deptSupervisorOptions:[],
      deptOthersOptions:[],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      openReadOnly:false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        projectCode: null,
        shortName: null,
        name: null,
      },
      // 表单参数
      form: {
        deptManager:null,
      },
      // 表单校验
      rules: {
        projectCode: [
          { required: true, message: "编码不能为空", trigger: "blur" }
        ],
        name: [
          { required: true, message: "名称不能为空", trigger: "blur" }
        ],
        createBy: [
          { required: true, message: "创建人不能为空", trigger: "blur" }
        ],
        createTime: [
          { required: true, message: "创建时间不能为空", trigger: "blur" }
        ],
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询项目列表 */
    getList() {
      this.loading = true;
      listManager(this.queryParams).then(response => {
        this.managerList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    deptList(){
      this.loading = true;
      listDept().then(response => {
        response.data.forEach(s=>{
          this.deptManagerOptions.push({
            label:s.deptName,
            value:s.deptId
          }),
          this.deptContractingOptions.push({
            label:s.deptName,
            value:s.deptId
          }),
          this.deptConsultOptions.push({
            label:s.deptName,
            value:s.deptId
          }),
          this.deptOrganizationOptions.push({
            label:s.deptName,
            value:s.deptId
          }),
          this.deptBuildOptions.push({
            label:s.deptName,
            value:s.deptId
          }),
          this.deptSurveyOptions.push({
            label:s.deptName,
            value:s.deptId
          }),
          this.deptDesignOptions.push({
            label:s.deptName,
            value:s.deptId
          }),
          this.deptConstructionOptions.push({
            label:s.deptName,
            value:s.deptId
          }),
          this.deptSupervisorOptions.push({
            label:s.deptName,
            value:s.deptId
          }),
          this.deptOthersOptions.push({
            label:s.deptName,
            value:s.deptId
          })
        })
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    cancelReadOnly() {
      this.openReadOnly = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        projectCode: null,
        shortName: null,
        projectClass:null,
        deptManager:null,
        deptContracting:null,
        deptConsult:null,
        deptOrganization:null,
        deptBuild:null,
        deptSurvey:null,
        deptDesign:null,
        deptConstruction:null,
        deptSupervisor:null,
        deptOthers:null,
        name: null,
        remark: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
        delFlag: null
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.deptList();
      this.open = true;
      this.title = "项目-新增";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.deptList();
      const id = row.id || this.ids
      getManager(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "项目-修改";
      });
    },
    /** 查看按钮操作**/
    handleInfo(row) {
      this.reset();
      this.deptList();
      const id = row.id || this.ids
      getManager(id).then(response => {
        this.form = response.data;
        this.openReadOnly = true;
        this.title = "项目-查看";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateManager(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addManager(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },

    /** 保存按钮 */
    saveForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id == null) {
            saveManager(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    deleteForm() {
      const id = this.form.id
      if (id != null) {
        this.$modal.confirm('是否确认删除项目名称为"' + this.form.name + '"的数据项？').then(function() {
          return delManager(id);
        }).then(() => {
          this.$modal.msgSuccess("删除成功");
          this.open = false;
          this.getList();
        }).catch(() => {});
      }

    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/manager/export', {
        ...this.queryParams
      }, `manager_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
