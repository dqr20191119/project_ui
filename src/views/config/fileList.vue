<template>
  <div class="app-container">
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
        label-width="68px"
      >
        <el-form-item label="图层名称" prop="layerName">
          <el-input
            v-model="queryParams.layerName"
            placeholder="请输入图层名称"
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
            v-hasPermi="['config:file:add']"
            >新增</el-button
          >
        </el-col>

        <el-col :span="1.5">
          <el-button
            type="danger"
            plain
            icon="el-icon-delete"
            size="mini"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['config:file:remove']"
            >删除</el-button
          >
        </el-col>

        <right-toolbar
          :showSearch.sync="showSearch"
          @queryTable="getList"
        ></right-toolbar>
      </el-row>

      <el-table
        v-loading="loading"
        :data="infoList"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="id" align="center" prop="id" v-if="false" />
        <el-table-column label="文件名称" align="center" prop="fileName" />
        <el-table-column label="文件路径" align="center" prop="filePath" />

        <el-table-column label="图层类型" align="center" prop="layerType">
          <template slot-scope="scope">
            <dict-tag
              :options="dict.type.sys_layer_file_type"
              :value="scope.row.layerType"
            />
          </template>
        </el-table-column>
        <el-table-column label="文件类型" align="center" prop="fileType">
          <template slot-scope="scope">
            <dict-tag
              :options="dict.type.sys_file_type"
              :value="scope.row.fileType"
            />
          </template>
        </el-table-column>
        <el-table-column label="图层名称" align="center" prop="layerName" />
        <el-table-column
          label="操作"
          v-if="false"
          align="center"
          class-name="small-padding fixed-width"
        >
          <template slot-scope="scope">
            <el-button
              v-if="fileType != 'SHP'"
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['config:file:edit']"
              >修改</el-button
            >
            <el-button
              v-if="fileType != 'SHP'"
              size="mini"
              type="text"
              icon="el-icon-delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['config:file:remove']"
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
    </el-dialog>
    <FileDetail ref="fileDetail"></FileDetail>
  </div>
</template>

<script>
import { listInfo, getInfo, delInfo, addInfo, updateInfo, upload } from "@/api/config/file";
import FileDetail from './fileDetail.vue';


export default {
  name: "Info",
  components: { FileDetail },
  dicts: ['sys_file_type', 'sys_layer_file_type'],

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
      // 文件信息表格数据
      infoList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        filePath: null,
        layerName: null,
        layerType: null,
        fileType: null,
        componentId: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
      }
    };
  },
  created () {
    this.getList();
  },
  methods: {
    /** 查询文件信息列表 */
    getList () {
      this.loading = true;
      listInfo(this.queryParams).then(response => {
        this.infoList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel () {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset () {
      this.form = {
        id: null,
        filePath: null,
        layerName: null,
        layerType: null,
        fileType: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null
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
    /** 新增按钮操作 */
    handleAdd () {

      let fileDetailRefs = this.$refs.fileDetail;
      fileDetailRefs.reset();
      fileDetailRefs.open = true;
      fileDetailRefs.form.componentId = this.queryParams.componentId;
      fileDetailRefs.title = "添加文件信息";
      fileDetailRefs.fileMultiple = true;
      fileDetailRefs.operation = 'add'



    },
    /** 修改按钮操作 */
    handleUpdate (row) {
      this.reset();
      const id = row.id || this.ids
      let fileDetailRefs = this.$refs.fileDetail;
      getInfo(id).then(response => {
        let respData = response.data;
        fileDetailRefs.form = respData;
        //回显文件信息
        let files = [];
        files.push({
          name: respData.fileName,
          file: new File([], respData.fileName, {}),
          url: respData.fileName
        })
        fileDetailRefs.files = files;
        fileDetailRefs.open = true;
        fileDetailRefs.title = "修改文件信息";
        fileDetailRefs.fileMultiple = false;
        fileDetailRefs.operation = 'update'

      });
    },
    /** 提交按钮 */
    submitForm () {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateInfo(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addInfo(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete (row) {
      const ids = row.id || this.ids;
      this.$modal.confirm('是否确认删除文件信息的数据项？').then(function () {
        return delInfo(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => { });
    },
    /** 导出按钮操作 */
    handleExport () {
      this.download('system/info/export', {
        ...this.queryParams
      }, `info_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
