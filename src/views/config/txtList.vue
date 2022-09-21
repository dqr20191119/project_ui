<template>
 
    <!-- 添加或修改文本自定义信息对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="1000px" height='800px' append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="180px">
        
        <el-form-item label="文本内容"  prop="content">
          <editor v-model="form.content" :min-height="292" />
        </el-form-item>
        
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getInfo, delInfo, save, queryByCmpId } from "@/api/config/text";

export default {
  name: "Info",
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
      // 文本自定义信息表格数据
      infoList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        componentId: null,
        content: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        componentId: [
          { required: true, message: "组件ID不能为空", trigger: "blur" }
        ],
        content: [
          { required: true, message: "文本内容不能为空", trigger: "blur" }
        ],
      }
    };
  },
  created () {

  },
  methods: {

    // 取消按钮
    cancel () {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset () {
      this.form = {
        id: null,
        content: '',
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
        delFlag: null
      };
      this.resetForm("form");
    },


    /** 修改按钮操作 */
    handleUpdate (componentId) {
      queryByCmpId(componentId).then(response => {
        if (response.data) {
          this.form = response.data;
        } else {
          this.reset();
          this.form.componentId = componentId;
        }
        this.open = true;
        this.title = '配置文本信息';
      });
    },

    /** 提交按钮 */
    submitForm () {
      let this_ = this
      this.$refs["form"].validate(valid => {
        if (valid) {
          save(this_.form).then(response => {
            this_.$modal.msgSuccess("保存成功");
            this_.open = false;
          });
        }

      });
    },
    /** 删除按钮操作 */
    handleDelete (row) {
      const ids = row.id || this.ids;
      this.$modal.confirm('是否确认删除文本自定义信息编号为"' + ids + '"的数据项？').then(function () {
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
