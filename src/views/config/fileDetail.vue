<template>
  <!-- 添加或修改文件信息对话框 -->
  <el-dialog :title="title" :visible.sync="open" width="700px" append-to-body>
    <el-form ref="form" :model="form" :rules="rules" label-width="120px">
      <el-row>
        <el-col :span="12">
          <el-form-item label="文件类型" prop="fileType">
            <el-select
              v-model="form.fileType"
              placeholder="请选择文件类型"
              clearable
            >
              <el-option
                v-for="dict in dict.type.sys_file_type"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="图层类型" prop="layerType">
            <el-select
              v-model="form.layerType"
              placeholder="请选择图层类型"
              clearable
            >
              <el-option
                v-for="dict in dict.type.sys_layer_file_type"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="24">
          <el-form-item label="图层名称" prop="layerName">
            <el-input v-model="form.layerName" placeholder="请输入图层名称" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-upload
            ref="uploadFile"
            style="margin-left: 50px"
            class="upload-demo"
            :http-request="httpRequest"
            :file-list="files"
            :multiple="fileMultiple"
            :limit="8"
            action="#"
            :show-file-list="true"
            :before-upload="beforeUpload"
            :data="form"
          >
            <el-button size="small" type="primary">点击上传</el-button>
          </el-upload>
        </el-col>
      </el-row>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { listInfo, getInfo, delInfo, addInfo, updateInfo, upload } from "@/api/config/file";

export default {
  name: "Info",
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
      operation: null,
      // 支持文件多个上传
      fileMultiple: false,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 文件信息表格数据
      infoList: [],
      files: [],
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
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        componentId: [
          { required: true, message: "组件ID不能为空", trigger: "blur" }
        ],
        fileType: [
          { required: true, message: "文件类型不能为空", trigger: "blur" }
        ],
      }
    };
  },
  created () {
    this.getList();
  },

  methods: {



    httpRequest (option) {

      if (this.operation == 'update') {
        this.files = [];
      }
      this.files.push({
        name: option.file.name,
        url: option.file.name,
        file: option.file
      })

    },

    // 上传预处理
    beforeUpload (file) {

    },


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
      this.files = [];
      //清空上传控件文件信息
      let uploadFile = this.$refs.uploadFile;
      if (uploadFile) {
        this.$refs.uploadFile.clearFiles();
      }
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
      this.reset();
      this.open = true;
      this.title = "添加文件信息";
    },
    /** 修改按钮操作 */
    handleUpdate (row) {
      this.reset();
      const id = row.id || this.ids
      getInfo(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改文件信息";
      });
    },
    /** 提交按钮 */
    submitForm () {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.files.length == 0) {
            this.$modal.msgError("请上传文件");
            return;
          }

          let formData = new FormData();
          // formData.append("files", this.files);
          // 将上传文件数组依次添加到参数paramsData中
          let formatError = true;
          console.log(this.files);
          this.files.forEach((x) => {
            if (this.form.fileType == 'SHP') {
              if (x.file.name.indexOf("shp") != -1) {
                formatError = false;
              }
            }
            formData.append('file', x.file)
          });
          if (formatError) {
            this.$modal.msgError("文件格式错误，请上传shp文件类型");
            return;
          }
          if (this.form.id != null) {
            formData.append("id", this.form.id);
          }
          formData.append("fileType", this.form.fileType);
          if (this.form.layerType != null) {
            formData.append("layerType", this.form.layerType);
          }
          if (this.form.layerName != null) {
            formData.append("layerName", this.form.layerName);
          }
          formData.append("componentId", this.form.componentId)
          upload(formData).then(response => {
            if (response && response.data) {
              this.$modal.msgSuccess("操作成功");
              this.open = false;
              this.$parent.getList();
            }

          });
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete (row) {
      const ids = row.id || this.ids;
      this.$modal.confirm('是否确认删除文件信息？').then(function () {
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

