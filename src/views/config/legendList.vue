<template>
  <div>
    <el-dialog
      :title="title"
      :visible.sync="open"
      width="1200px"
      append-to-body
    >
      <el-form
        :model="queryParams"
        ref="queryForm"
        size="small"
        :inline="true"
        v-show="showSearch"
      >
        <el-form-item label="标签" prop="label">
          <el-input
            v-model="queryParams.label"
            placeholder="请输入标签"
            clearable
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
            v-hasPermi="['system:dept:add']"
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
        v-if="refreshTable"
        v-loading="loading"
        :data="legendList"
        row-key="id"
        :default-expand-all="isExpandAll"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      >
        <el-table-column
          prop="label"
          label="标签"
          width="260"
        ></el-table-column>

        <el-table-column prop="visible" label="显示状态" width="160">
          <template slot-scope="scope">
            <dict-tag
              :options="dict.type.sys_show_hide"
              :value="scope.row.visible"
            />
          </template>
        </el-table-column>

        <el-table-column prop="lengendColor" label="图例颜色" width="160">
          <template slot-scope="scope">
            <span
              class="colorBox"
              :style="{ background: scope.row.lengendColor }"
            ></span>
          </template>
        </el-table-column>

        <el-table-column
          prop="orderNum"
          label="显示顺序"
          width="120"
        ></el-table-column>

        <el-table-column
          prop="width"
          label="宽度"
          width="120"
        ></el-table-column>

        <el-table-column
          label="创建时间"
          align="center"
          prop="createTime"
          width="160"
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
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['system:dept:edit']"
              >修改</el-button
            >
            <el-button
              size="mini"
              type="text"
              icon="el-icon-plus"
              @click="handleAdd(scope.row)"
              v-hasPermi="['system:dept:add']"
              >新增</el-button
            >
            <el-button
              v-if="scope.row.parentId != 0"
              size="mini"
              type="text"
              icon="el-icon-delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['system:dept:remove']"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="cancel">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
    <LegendDetail ref="legendDetail"></LegendDetail>
  </div>
  <!-- </div> -->
</template>
<script>
import { listConfig, getConfig, delConfig, addConfig, updateConfig, listByCptId, initLegendTreeSelect } from "@/api/config/legend";
import LegendDetail from './legendDetail.vue';
export default {
  dicts: ['sys_show_hide'],
  components: { LegendDetail },

  name: "Config",
  data () {
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
      // 【请填写功能名称】表格数据
      configList: [],
      // 弹出层标题
      title: "图例数据管理",
      // 是否显示查询列表弹出层
      open: false,
      addRootLegend: false,
      // 是否展开，默认全部展开
      isExpandAll: true,
      // 重新渲染表格状态
      refreshTable: true,
      legendList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        componentId: null,
        label: null,
        parentId: null,
        layerName: null,
        filterKey: null,
        filterValue: null,
        lengendColor: null,
        fillColor: null,
        strokeColor: null,
        width: null,
        dashArray: null,
        dashOffset: null,
        visible: null,
        extension: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        componentId: [
          { required: true, message: "组件ID不能为空", trigger: "blur" }
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
  created () {
    //this.initLegendTreeSelect();
    //this.getList();
  },
  methods: {
    /** 查询【请填写功能名称】列表 */
    getList () {
      this.loading = true;
      listByCptId(this.queryParams).then(response => {
        this.legendList = this.handleTree(response.data, "id");;
        this.loading = false;
      });
    },
    cancel () {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset () {
      this.form = {
        id: null,
        componentId: null,
        label: null,
        parentId: null,
        layerName: null,
        filterKey: null,
        filterValue: null,
        lengendColor: null,
        fillColor: null,
        strokeColor: null,
        width: null,
        dashArray: null,
        dashOffset: null,
        visible: null,
        extension: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
        delFlag: null
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
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange (selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },

    /** 查询菜单下拉树结构 */
    // initLegendTreeSelect () {
    //   initLegendTreeSelect().then(response => {
    //     this.menuOptions = response.data;
    //   });
    // },

    /** 新增按钮操作 */


    handleAdd (row) {
      let lengedDetailRefs = this.$refs.legendDetail;

      lengedDetailRefs.reset();
      let componentId = this.queryParams.componentId;
      initLegendTreeSelect(componentId).then(response => {
        lengedDetailRefs.legendOptions = response.data;
        lengedDetailRefs.open = true;
        lengedDetailRefs.form.componentId = componentId
        lengedDetailRefs.title = "新增图例数据";
      });



    },
    /** 修改按钮操作 */
    handleUpdate (row) {
      this.reset();
      const id = row.id || this.ids
      let lengedDetailRefs = this.$refs.legendDetail;
      getConfig(id).then(response => {
        lengedDetailRefs.open = true;
        lengedDetailRefs.form = response.data;
        lengedDetailRefs.title = "修改图例数据";
      });
    },
    /** 提交按钮 */
    submitForm () {
      let _this = this;
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateConfig(this.form).then(response => {
              _this.$modal.msgSuccess("修改成功");
              _this.open = false;
              _this.getList();
            });
          } else {
            addConfig(this.form).then(response => {
              _this.$modal.msgSuccess("新增成功");
              _this.open = false;
              _this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete (row) {
      const ids = row.id || this.ids;
      this.$modal.confirm('是否确认删除该数据项？').then(function () {
        return delConfig(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => { });
    },
    // 节点单击事件
    handleNodeClick (data) {
      getConfig(data.id).then(response => {
        this.form = response.data;
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
  }
};
</script>
<style scoped>
.colorBox {
  width: 48px;
  height: 12px;
  display: inline-block;
  border-radius: 2px;
  position: absolute;
}
</style>
