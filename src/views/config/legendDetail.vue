<template>
  <!-- <div class="app-container"> -->
  <el-dialog :title="title" :visible.sync="open" width="880px" append-to-body>
    <el-form ref="form" :model="form" :rules="rules" label-width="140px">
      <el-row>
        <el-col :span="12">
          <el-form-item label="名称" prop="label">
            <span slot="label">
              <el-tooltip content="展示在图例中的名称" placement="top">
                <i class="el-icon-question"></i>
              </el-tooltip>
              名称
            </span>
            <el-input v-model="form.label" placeholder="请输入标签" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="父节点" prop="parentId">
            <treeselect
              v-model="form.parentId"
              :options="legendOptions"
              :normalizer="normalizer"
              placeholder="选择上级图例"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="图层名称" prop="layerName">
            <span slot="label">
              <el-tooltip content="图层服务中的名称" placement="top">
                <i class="el-icon-question"></i>
              </el-tooltip>
              图层名称
            </span>
            <el-input v-model="form.layerName" placeholder="请输入图层名称" />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="属性名称" prop="filterKey">
            <el-input v-model="form.filterKey" placeholder="请输属性名称" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="属性值" prop="filterValue">
            <el-input v-model="form.filterValue" placeholder="请输属性值" />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="图例颜色" prop="lengendColor">
            <span class="colorspan">{{ form.lengendColor }}</span>
            <el-color-picker v-model="form.lengendColor"></el-color-picker>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="填充颜色" prop="fillColor">
            <span class="colorspan">{{ form.fillColor }}</span>
            <el-color-picker v-model="form.fillColor"></el-color-picker>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="线条颜色" prop="strokeColor">
            <span class="colorspan">{{ form.strokeColor }}</span>
            <el-color-picker v-model="form.strokeColor"></el-color-picker>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="宽度" prop="width">
            <el-input v-model="form.width" placeholder="请输入宽度" />
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
      <el-row>
        <el-col :span="12">
          <el-form-item label="虚线间距" prop="dashArray">
            <el-input v-model="form.dashArray" placeholder="请输入虚线间距" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="虚线偏移" prop="dashOffset">
            <el-input v-model="form.dashOffset" placeholder="请输入虚线偏移" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12" style="display: flex">
          <el-form-item label="属性范围" prop="filterMinValue">
            <el-input
              v-model="form.filterMinValue"
              placeholder="请输入最小值"
              style="width: 125px"
            />
          </el-form-item>
          <span class="del-span">&nbsp;－&nbsp;</span>

          <el-form-item prop="filterMaxValue" class="filterMaxValue">
            <el-input
              v-model="form.filterMaxValue"
              placeholder="请输入最大值"
              style="width: 125px"
            />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="扩展信息" prop="extension">
            <el-input v-model="form.extension" placeholder="请输入扩展信息" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <el-form-item label="显示状态" prop="visible">
            <span slot="label">
              <el-tooltip
                content="选择隐藏则不会出现在图例列表中"
                placement="top"
              >
                <i class="el-icon-question"></i>
              </el-tooltip>
              显示状态
            </span>
            <el-radio-group v-model="form.visible">
              <el-radio
                v-for="dict in dict.type.sys_show_hide"
                :key="dict.value"
                :label="dict.value"
                >{{ dict.label }}</el-radio
              >
            </el-radio-group>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="是否同步高亮" prop="highLightMode">
            <el-switch
              v-model="form.highLightMode"
              active-value="Y"
              inactive-value="N"
            ></el-switch>
          </el-form-item>
        </el-col>
      </el-row>
      <!-- <el-row>
        <el-col :span="12">
          <el-form-item label="扩展信息" prop="extension">
            <el-input v-model="form.extension" placeholder="请输入扩展信息" />
          </el-form-item>
        </el-col>
      </el-row> -->
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </el-dialog>

  <!-- </div> -->
</template>
<script>
import { getConfig, delConfig, addConfig, updateConfig, initLegendTreeSelect } from "@/api/config/legend";
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
      legendOptions: [],
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
        label: [
          { required: true, message: "图例名称不能为空", trigger: "blur" },
          { min: 1, max: 80, message: '图例名称长度不能超过80', trigger: 'blur' }
        ],
        visible: [
          { required: true, message: "显示状态不能为空", trigger: "blur" }
        ],
        createTime: [
          { required: true, message: "创建时间不能为空", trigger: "blur" }
        ],

        width: [{ type: 'number', message: '请输入有效数字', trigger: 'blur', transform: (value) => Number(value) }],


        filterMinValue: [{ type: 'number', message: '请输入有效数字', trigger: 'blur', transform: (value) => Number(value) }],

        filterMaxValue: [{ type: 'number', message: '请输入有效数字', trigger: 'blur', transform: (value) => Number(value) }],


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
        filterMinValue: null,
        filterMaxValue: null,
        dashArray: null,
        dashOffset: null,
        visible: '0',
        extension: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
        delFlag: null,
        orderNum: 1,
        checkStatus: 'Y',
        layerOrderNum: 1

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
    //     this.legendOptions = response.data;
    //   });
    // },

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
      this.title = "添加图例配置";

    },
    /** 修改按钮操作 */
    handleUpdate (row) {
      this.reset();
      const id = row.id || this.ids
      getConfig(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改图例配置";
      });
    },
    /** 提交按钮 */
    submitForm () {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateConfig(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.$parent.getList();
            });
          } else {
            addConfig(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.$parent.getList();
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
<style scoped lang="scss">
.colorspan {
  float: left;
  margin-right: 20px;
}

.del-span {
  display: inline-block;
  margin: 5px 8px;
}

.filterMaxValue {
  ::v-deep .el-form-item__content {
    margin-left: 0 !important;
  }
}
</style>
