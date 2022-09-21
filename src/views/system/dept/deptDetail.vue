<template>
  <div class="app-container">
    <!-- 添加或修改部门对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="24" v-if="form.parentId !== 0">
            <el-form-item label="上级名称" prop="parentName">
              <el-input
                disabled
                v-model="form.parentName"
                placeholder="请输入节点名称"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="orgType == 'O'">
          <el-col :span="24">
            <el-form-item label="单位类型" prop="deptTypeList">
              <el-select
                style="width: 480px"
                multiple
                v-model="form.deptTypeList"
                placeholder="请选择单位类型"
                clearable
              >
                <el-option
                  v-for="dict in dict.type.sys_dept_type"
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
            <el-form-item label="节点名称" prop="deptName">
              <el-input v-model="form.deptName" placeholder="请输入节点名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="显示排序" prop="orderNum">
              <el-input-number
                style="width: 480px"
                v-model="form.orderNum"
                controls-position="right"
                :min="0"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <!-- <el-row>
          <el-col :span="12">
            <el-form-item label="负责人" prop="leader">
              <el-input
                v-model="form.leader"
                placeholder="请输入负责人"
                maxlength="20"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input
                v-model="form.phone"
                placeholder="请输入联系电话"
                maxlength="11"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input
                v-model="form.email"
                placeholder="请输入邮箱"
                maxlength="50"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部门状态">
              <el-radio-group v-model="form.status">
                <el-radio
                  v-for="dict in dict.type.sys_normal_disable"
                  :key="dict.value"
                  :label="dict.value"
                  >{{ dict.label }}</el-radio
                >
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row> -->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listDept, getDept, delDept, addDept, updateDept, listDeptExcludeChild } from "@/api/system/dept";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  name: "Dept",
  dicts: ['sys_normal_disable', 'sys_dept_type'],
  components: { Treeselect },
  data () {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 表格树数据
      deptList: [],
      // 部门树选项
      deptOptions: [],

      treeProps: {
        children: 'children',
        label: 'label',
        disabled: true
      },

      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,

      parentRef: null,

      orgType: null,


      // 表单参数
      form: {},
      // 表单校验
      rules: {
        parentId: [
          { required: true, message: "上级部门不能为空", trigger: "blur" }
        ],
        deptName: [
          { required: true, message: "部门名称不能为空", trigger: "blur" }
        ],
        orderNum: [
          { required: true, message: "显示排序不能为空", trigger: "blur" }
        ],
        email: [
          {
            type: "email",
            message: "请输入正确的邮箱地址",
            trigger: ["blur", "change"]
          }
        ],
        phone: [
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: "请输入正确的手机号码",
            trigger: "blur"
          }
        ]
      }
    };
  },
  created () {

  },
  methods: {

    /** 转换部门数据结构 */
    normalizer (node) {
      if (node.children && !node.children.length) {
        delete node.children;
      }
      return {
        id: node.deptId,
        label: node.deptName,
        children: node.children
      };
    },
    // 取消按钮
    cancel () {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset () {
      this.form = {
        deptId: undefined,
        deptTypeList: null,
        parentId: undefined,
        deptName: undefined,
        orderNum: 1,
        leader: undefined,
        phone: undefined,
        email: undefined,
        status: "0"
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery () {
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery () {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 新增按钮操作 */
    handleAdd (deptId, deptName) {
      this.reset();
      if (deptId != undefined) {
        this.form.parentId = deptId;
      }
      if (deptName != undefined) {
        this.form.parentName = deptName;
      }
      this.open = true;
      var title_ = this.getTitileByType(this.orgType);
      this.title = "新增" + title_;
      listDept().then(response => {
        this.deptOptions = this.handleTree(response.data, "deptId");
      });
    },

    /** 修改按钮操作 */
    handleUpdate (deptId, deptName) {
      this.reset();
      getDept(deptId).then(response => {
        this.form = response.data;
        this.form.parentName = deptName;
        this.open = true;
        var title_ = this.getTitileByType(this.orgType);
        this.title = "修改" + title_;
      });
      listDeptExcludeChild(row.deptId).then(response => {
        this.deptOptions = this.handleTree(response.data, "deptId");
      });
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.deptId != undefined) {
            updateDept(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.parentRef.getTreeselect();
            });
          } else {
            addDept(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.parentRef.getTreeselect();


            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete (data) {
      this.$modal.confirm('是否确认删除名称为"' + data.label + '"的数据项？').then(function () {
        return delDept(data.id);
      }).then(() => {
        //刷新树结构数据
        this.parentRef.getTreeselect();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => { });
    },

    getTitileByType () {
      if (this.orgType == 'O') {
        return "单位"
      } else {
        return "部门"
      }
    }
  }
};
</script>
