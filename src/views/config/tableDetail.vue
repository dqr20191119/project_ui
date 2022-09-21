<template>
  <!-- 添加或修改表格对话框 -->
  <el-dialog :title="title" :visible.sync="open" width="880px" append-to-body>
    <el-form ref="form" :model="form" :rules="rules" label-width="140px">
      <el-row>
        <el-col :span="12">
          <el-form-item label="标签名称" prop="label">
            <el-input v-model="form.label" placeholder="请输入标签名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="标签值" prop="value">
            <el-input v-model="form.value" placeholder="请输入标签值" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="父节点" prop="parentId">
            <treeselect
              v-model="form.parentId"
              :options="tableOptions"
              :normalizer="normalizer"
              placeholder="选择上级图例"
            />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="显示顺序" prop="orderNum">
            <el-input-number
              v-model="form.orderNum"
              :min="1"
              style="width: 280px"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-col :span="12" v-if="cptType != 'TABLE'">
        <el-form-item label="颜色">
          <span slot="label">
            <el-tooltip
              content="支持选择多种颜色，按照选择顺序渐变"
              placement="top"
            >
              <i class="el-icon-question"></i>
            </el-tooltip>
            颜色
          </span>

          <el-color-picker show-alpha v-model="color1"></el-color-picker>
          <el-color-picker v-model="color2" show-alpha></el-color-picker>
        </el-form-item>
      </el-col>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </el-dialog>

  <!-- </div> -->
</template>
<script>
import { getInfo, delInfo, addInfo, updateInfo, initTableTreeSelect } from "@/api/config/table";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  dicts: ['sys_show_hide', 'sys_yes_no'],
  components: { Treeselect },
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
      title: "",
      // 是否展示弹框
      open: false,
      addRootLegend: false,
      tableOptions: [],
      cptType: null,
      colorSplit: '@',
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        componentId: null,
        label: null,
        parentId: null,
        value: null,
        color: null,
        visible: null,
      },
      color1: '',
      color2: '',
      // 表单参数
      form: {

      },
      // 表单校验
      rules: {
        label: [
          { required: true, message: "标签名称不能为空", trigger: "blur" },
          { min: 1, max: 80, message: '标签名称长度不能超过48', trigger: 'blur' }
        ],
        visible: [
          { required: true, message: "显示状态不能为空", trigger: "blur" }
        ]

      }
    };
  },
  created () {
    // this.initLegendTreeSelect(this.form.componentId);
  },
  methods: {

    // 取消按钮
    cancel () {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset () {
      this.color1 = null,
        this.color2 = null,
        this.form = {
          id: null,
          componentId: null,
          label: null,
          parentId: null,
          value: null,
          color: null,
          visible: null,
          createBy: null,
          createTime: null,
          updateBy: null,
          updateTime: null,
          orderNum: 1,
          color1: null,
          color2: null

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

    changeColor1 (val) {
      this.form.color1 = val || ''
    },

    changeColor2 (val) {
      this.form.color2 = val || ''
    },



    /** 转换图例数据结构 */
    normalizer (node) {
      if (node.children && !node.children.length) {
        delete node.children;
      }
      return {
        id: node.id,
        label: node.label,
        children: node.children
      };
    },

    /** 新增按钮操作 */
    handleAdd () {
      this.reset();
      this.openSaveDialog = true;
      this.openLegendList = false;
      this.title = "添加图表配置";

    },

    /** 初始化颜色配置 */
    initColor (form) {
      let color = form.color;
      if (color == null || color == '') {
        return;
      }
      let colorArray = color.split(this.colorSplit)
      if (colorArray.length > 1) {
        this.color1 = colorArray[0]
        this.color2 = colorArray[1]
      } else {
        this.color1 = color
      }
    },

    /** 组装颜色配置 */
    assembleColor () {
      let color = null;
      if (this.color1) {
        color = this.color1;
      }
      if (this.color2) {
        color = color + this.colorSplit + this.color2
      }
      this.form.color = color;
    },

    /** 修改按钮操作 */
    handleUpdate (row) {
      this.reset();
      const id = row.id || this.ids
      getInfo(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改图表配置";
        this.initColor(this.form.color)
      });
    },
    /** 提交按钮 */
    submitForm () {
      this.$refs["form"].validate(valid => {
        this.assembleColor();
        if (valid) {
          if (this.form.id != null) {
            updateInfo(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.$parent.getList();
            });
          } else {
            addInfo(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.$parent.getList();
            });
          }
        }
      });
    },

    // 节点单击事件
    handleNodeClick (data) {
      getInfo(data.id).then(response => {
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
.colorspan {
  float: left;
  margin-right: 20px;
}
</style>
