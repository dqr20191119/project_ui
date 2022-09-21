<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      size="small"
      :inline="true"
      v-show="showSearch"
    >
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
          >搜索</el-button
        >
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery"
          >重置</el-button
        >
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
          v-hasPermi="['decision:manage:add']"
          >新增</el-button
        >
      </el-col>

      <el-col :span="1.5">
        <el-button
          type="info"
          plain
          icon="el-icon-sort"
          size="mini"
          @click="toggleExpandAll"
          >展开/折叠</el-button
        >
      </el-col>

      <right-toolbar
        :showSearch.sync="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>

    <el-table
      v-loading="loading"
      :data="decisionManageList"
      v-if="refreshTable"
      row-key="id"
      :default-expand-all="isExpandAll"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
    >
      <el-table-column prop="id" width="150" v-if="false" />
      <el-table-column label="名称" prop="name" width="240" />
      <el-table-column label="业务类型" prop="bizKey" width="240" />
      <!-- <el-table-column
        label="父级"
        prop="parentId"
        :show-overflow-tooltip="true"
        width="150"
      /> -->
      <el-table-column
        label="图层名称"
        prop="layerName"
        :show-overflow-tooltip="true"
        width="250"
      />

      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        width="180"
      >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope" v-if="scope.row.roleId !== 1">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['decision:manager:edit']"
            >修改</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['decision:manager:remove']"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改角色配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="业务类型" prop="bizKey">
              <el-input v-model="form.bizKey" placeholder="请输入业务类型" />
              <!-- <el-select
                style="width: 280px"
                v-model="form.bizKey"
                placeholder="请选择业务类型"
                clearable
              >
                <el-option></el-option>
                <el-option
                  v-for="dict in dict.type.sys_cmp_biz_type"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select> -->
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="父级选择" prop="parentId">
              <treeselect
                v-model="form.parentId"
                :options="parentOptions"
                :show-count="true"
                :normalizer="normalizer"
                placeholder="请选择菜单"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="图层名称" prop="layerName">
              <el-input v-model="form.layerName" placeholder="请选择图层名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="显示排序" prop="orderNum">
              <el-input-number
                style="width: 280px"
                v-model="form.orderNum"
                controls-position="right"
                :min="0"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { bizTreeSelect, getInfo, addInfo, updateInfo, delInfo, initTreeList } from "@/api/decision-manage/decision";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
export default {
  name: "DecisionManage",
  dicts: ['sys_normal_disable', 'sys_cmp_biz_type'],
  components: { Treeselect },

  data () {
    return {
      // 遮罩层
      loading: true,
      parentOptions: [],
      id: null,
      name: null,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: false,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 角色表格数据
      decisionManageList: [],
      // 是否展开，默认全部展开
      isExpandAll: true,
      // 重新渲染表格状态
      refreshTable: true,
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 是否显示弹出层（数据权限）
      openDataScope: false,
      menuExpand: false,
      menuNodeAll: false,
      deptExpand: true,
      deptNodeAll: false,
      // 日期范围
      dateRange: [],
      // 数据范围选项
      dataScopeOptions: [
        {
          value: "1",
          label: "全部数据权限"
        },
        {
          value: "2",
          label: "自定数据权限"
        },
        {
          value: "3",
          label: "本部门数据权限"
        },
        {
          value: "4",
          label: "本部门及以下数据权限"
        },
        {
          value: "5",
          label: "仅本人数据权限"
        }
      ],
      // 菜单列表
      menuOptions: [],
      // 部门列表
      deptOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        roleName: undefined,
        roleKey: undefined,
        status: undefined
      },
      // 表单参数
      form: {},
      defaultProps: {
        children: "children",
        label: "label"
      },
      // 表单校验
      rules: {
        name: [
          { required: true, message: "名称不能为空", trigger: "blur" },
          { min: 1, max: 80, message: '名称长度不能超过80', trigger: 'blur' }
        ],
        layerName: [
          { min: 0, max: 80, message: '图层名称长度不能超过40', trigger: 'blur' }
        ],
        orderNum: [{ type: 'number', message: '请输入有效数字', trigger: 'blur', transform: (value) => Number(value) }],
        bizKey: [
          { min: 0, max: 80, message: '业务类型长度不能超过80', trigger: 'blur' }
        ],

      }
    };
  },
  created () {
    this.getParentTreeselect();
    this.getList();
  },
  methods: {
    getList () {
      this.loading = true;
      initTreeList(this.queryParams).then(response => {
        this.decisionManageList = response.data;
        this.loading = false;
      });
    },

    /** 展开/折叠操作 */
    toggleExpandAll () {
      this.refreshTable = false;
      this.isExpandAll = !this.isExpandAll;
      this.$nextTick(() => {
        this.refreshTable = true;
      });
    },

    /** 查询菜单树结构 */
    getParentTreeselect () {
      bizTreeSelect().then(response => {
        let responseData = response.data;
        if (responseData) {
          this.parentOptions = response.data;
        }
      });
    },

    // 取消按钮
    cancel () {
      this.open = false;
      this.reset();
    },

    // 多选框选中数据
    handleSelectionChange (selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },

    // 表单重置
    reset () {
      this.form = {
        id: null,
        name: null,
        bizKey: null,
        delFlag: null,
        parentId: null,
        layerName: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
        orderNum: 1
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery () {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery () {
      this.dateRange = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },

    /** 转换图例数据结构 */
    normalizer (node) {
      if (node.children && !node.children.length) {
        delete node.children;
      }
      return {
        id: node.id,
        label: node.name,
        children: node.children
      };
    },

    /** 新增按钮操作 */
    handleAdd () {
      this.reset();
      this.open = true;
      this.title = "新增业务配置";
    },
    /** 修改按钮操作 */
    handleUpdate (row) {
      this.reset();
      const id = row.id
      getInfo(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改业务配置";
      });
    },

    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            updateInfo(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
              //刷新父类下拉列表
              this.getParentTreeselect();
            });
          } else {
            addInfo(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
              //刷新父类下拉列表
              this.getParentTreeselect();
            });
          }
        }
      });
    },

    /** 删除按钮操作 */
    handleDelete (row) {
      const ids = row.id || this.ids;
      this.$modal.confirm('是否确认删除数据项？').then(function () {
        return delInfo(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
        //刷新父类下拉列表
        this.getParentTreeselect();
      }).catch(() => { });
    },



  }
};
</script>
