<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!--部门数据-->
      <el-col :span="4" :xs="24">
        <div class="head-container">
          <el-input
            v-model="menuName"
            placeholder="请输入菜单名称"
            clearable
            size="small"
            prefix-icon="el-icon-search"
            style="margin-bottom: 20px"
          />
        </div>
        <div class="head-container">
          <el-tree
            :data="menuOptions"
            :props="defaultProps"
            :expand-on-click-node="false"
            :filter-node-method="filterNode"
            ref="tree"
            default-expand-all
            highlight-current
            @node-click="handleNodeClick"
          />
        </div>
      </el-col>
      <el-col :span="20" :xs="24">
        <el-form
          :model="queryParams"
          ref="queryForm"
          size="small"
          :inline="true"
          v-show="showSearch"
          label-width="68px"
        >
          <el-form-item label="组件名称" prop="cptName">
            <el-input
              v-model="queryParams.cptName"
              placeholder="请输入组件名称"
              clearable
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>

          <el-form-item label="组件类型" prop="cptType">
            <el-select v-model="queryParams.cptType" placeholder="请选组件类型">
              <el-option
                v-for="dict in dict.type.sys_component_type"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              ></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="状态" prop="enable">
            <el-select v-model="queryParams.enable" placeholder="请选择状态">
              <el-option
                v-for="dict in dict.type.sys_enable_status"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              ></el-option>
            </el-select>
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
              v-hasPermi="['config:component:add']"
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
              v-hasPermi="['config:component:remove']"
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
          <el-table-column
            label="${comment}"
            align="center"
            prop="id"
            v-if="false"
          />
          <el-table-column
            label="菜单ID"
            align="center"
            prop="menuId"
            v-if="false"
          />
          <el-table-column
            label="轮播图宽度"
            align="center"
            prop="bannerWidth"
            v-if="false"
          />
          <el-table-column
            label="轮播图高度"
            align="center"
            prop="bannerHeight"
            v-if="false"
          />

          <el-table-column label="菜单名称" align="center" prop="menuName" />
          <el-table-column
            label="组件名称"
            align="center"
            prop="cptName"
            :show-overflow-tooltip="true"
          />
          <el-table-column label="组件类型" align="center" prop="cptType">
            <template slot-scope="scope">
              <dict-tag
                :options="dict.type.sys_component_type"
                :value="scope.row.cptType"
              />
            </template>
          </el-table-column>
          <el-table-column label="业务类型" align="center" prop="bizTypeDesc">
            <!-- <template slot-scope="scope">
              <dict-tag
                :options="dict.type.sys_cmp_biz_type"
                :value="scope.row.bizType"
              />
            </template> -->
          </el-table-column>
          <el-table-column label="显示排序" align="center" prop="orderNum" />
          <el-table-column label="状态" align="center" prop="enable">
            <template slot-scope="scope">
              <dict-tag
                :options="dict.type.sys_enable_status"
                :value="scope.row.enable"
              />
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
                v-hasPermi="['config:component:edit']"
                >修改</el-button
              >

              <el-button
                size="mini"
                type="text"
                icon="el-icon-circle-check"
                @click="handleCommand('handleSetting', scope.row)"
                v-hasPermi="['config:component:add']"
                >配置组件</el-button
              >

              <!-- <el-button
                size="mini"
                type="text"
                icon="el-icon-delete"
                @click="handleDelete(scope.row)"
                v-hasPermi="['config:component:remove']"
                >删除</el-button
              > -->
              <el-dropdown
                size="mini"
                @command="(command) => handleCommand(command, scope.row)"
                v-hasPermi="['config:legend:add']"
              >
                <span class="el-dropdown-link">
                  <i class="el-icon-d-arrow-right el-icon--right"></i>更多
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item
                    command="handleDelete"
                    icon="el-icon-delete"
                    v-hasPermi="['cconfig:component:remove']"
                    >删除</el-dropdown-item
                  >
                </el-dropdown-menu>
              </el-dropdown>
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
      </el-col>
    </el-row>
    <!-- 添加或修改【请填写功能名称】对话框 -->
    <el-dialog
      :title="title"
      :visible.sync="open"
      width="850px"
      heigth="500px"
      append-to-body
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="菜单" prop="menuId">
              <treeselect
                v-model="form.menuId"
                :options="menuOptions"
                :show-count="true"
                placeholder="请选择菜单"
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="组件类型" prop="cptType">
              <el-select
                :disabled="isUpdate"
                style="width: 285px"
                v-model="form.cptType"
                placeholder="组件类型"
                clearable
              >
                <el-option
                  v-for="dict in dict.type.sys_component_type"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="组件名称" prop="cptName">
              <el-input v-model="form.cptName" placeholder="请输入组件名称" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="显示排序" prop="orderNum">
              <el-input-number
                v-model="form.orderNum"
                :min="1"
                style="width: 285px"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="业务类型" prop="bizType">
              <treeselect
                v-model="form.bizType"
                :options="bizOptions"
                :show-count="true"
                :normalizer="bizNormalizer"
                placeholder="请选业务类型"
              />
              <!-- <el-select
                style="width: 285px"
                v-model="form.bizType"
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

          <el-col :span="12">
            <el-form-item label="标题" prop="title">
              <el-input v-model="form.title" placeholder="请输入标题" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="状态" prop="enable">
              <el-select
                v-model="form.enable"
                placeholder="状态"
                clearable
                style="width: 285px"
              >
                <el-option
                  v-for="dict in dict.type.sys_enable_status"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" placeholder="请输入备注" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-col :span="12" v-if="form.cptType == 'BAR'">
          <el-form-item label="柱状图方向" prop="tableDirection">
            <el-select
              style="width: 285px"
              v-model="form.tableDirection"
              placeholder="请选择柱状图方向"
              clearable
            >
              <el-option></el-option>
              <el-option
                v-for="dict in dict.type.sys_table_direction"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col
          :span="12"
          v-if="form.cptType == 'BANNER'"
          style="display: flex"
        >
          <el-form-item label="轮播图尺寸" prop="bannerSize">
            <el-input
              :readonly="isUpdate"
              v-model="form.bannerWidth"
              placeholder="请输入宽度"
              style="width: 133px"
            />
          </el-form-item>
          <span class="del-span"> x </span>

          <el-form-item prop="bannerHeight" class="bannerHeight">
            <el-input
              :readonly="isUpdate"
              v-model="form.bannerHeight"
              placeholder="请输入高度"
              style="width: 133px"
            />
          </el-form-item>
        </el-col>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <LegendList ref="legendList"></LegendList>
    <TableList ref="tableList"></TableList>
    <TxtList ref="txtList"></TxtList>
    <BannerList ref="bannerList"></BannerList>
    <FileList ref="fileList"></FileList>
  </div>
</template>

<script>
import { listInfo, getInfo, delInfo, addInfo, updateInfo } from "@/api/config/component";
import { treeselect } from "@/api/system/menu";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import LegendList from './legendList.vue';
import TableList from './tableList.vue'
import TxtList from './txtList.vue'
import BannerList from "./bannerList.vue";
import FileList from "./fileList.vue";
import { bizTreeSelect } from "@/api/decision-manage/decision";


export default {
  name: "Info",
  dicts: ['sys_enable_status', 'sys_component_type', 'sys_table_direction'],
  components: { Treeselect, LegendList, TableList, TxtList, BannerList, FileList },

  data () {

    // 柱状图类型必须选择柱状图方向
    var validateDirection = (rule, value, callback) => {
      let cptType = this.form.cptType;
      if ((value == '' || value == null) && cptType == 'BAR') {
        callback(new Error('请选择柱状图方向'));
      } else {
        callback();
      }
    };

    // 轮播图类型必须输入宽度及高度
    var validateBannerWidth = (rule, value, callback) => {
      let cptType = this.form.cptType;
      if (cptType != 'BANNER') {
        return;
      }
      if (value == '' || value == null) {
        callback(new Error('请输入轮播图宽度'));
      } else if (isNaN(value)) {
        callback(new Error('轮播图宽度数据格式有误'));
      } else {
        callback();
      }
    };

    // 轮播图类型必须输入宽度及高度
    var validateBannerHeight = (rule, value, callback) => {
      let cptType = this.form.cptType;
      if (cptType != 'BANNER') {
        return;
      }
      if (value == '' || value == null) {
        callback(new Error('请输入轮播图高度'));
        return false;
      } else if (isNaN(value)) {
        callback(new Error('轮播图高度数据格式有误'));
        return false;
      } else {
        callback();
      }
    };



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
      infoList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      isUpdate: false,
      bizOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        cptName: null,
        bizType: null,
        cptType: null,
        menuId: null,
        menuName: null,
        orderNum: null,
      },
      // 菜单名称
      menuName: undefined,
      // 菜单树选项
      menuOptions: undefined,
      defaultProps: {
        children: "children",
        label: "label"
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        cptName: [
          { required: true, message: "组件名称不能为空", trigger: "blur" },
          {
            min: 1, max: 80, message: '组件名称长度不能超过80', trigger: 'blur'
          }
        ],

        menuId: [
          { required: true, message: "菜单不能为空", trigger: "blur" }
        ],
        cptType: [
          { required: true, message: "组件类型不能为空", trigger: "blur" }
        ],
        enable: [
          { required: true, message: "状态不能为空", trigger: "blur" }
        ],
        remark: [

          {
            min: 1, max: 80, message: '备注长度不能超过80', trigger: 'blur'
          }
        ],
        title: [
          {
            min: 1, max: 80, message: '标题长度不能超过80', trigger: 'blur'
          }
        ],
        tableDirection: [
          { validator: validateDirection, trigger: 'blur' }
        ],
        bannerWidth: [
          { validator: validateBannerWidth, trigger: 'blur' }
        ],
        bannerHeight: [
          { validator: validateBannerHeight, trigger: 'blur' }
        ]





      }
    };
  },
  watch: {
    // 根据名称筛选菜单树
    menuName (val) {
      this.$refs.tree.filter(val);
    }
  },
  created () {
    //初始化菜单树
    this.getTreeselect();
    //初始化业务类型树
    this.bizTreeSelect();

    this.getList();
  },
  methods: {
    /** 查询【请填写功能名称】列表 */
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
        cptName: null,
        bizType: null,
        cptType: null,
        menuId: null,
        menuName: null,
        orderNum: null,
        remark: null,
        title: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        enable: '1',
        updateTime: null,
        delFlag: null,
        menuId: this.menuId,
        menuName: this.menuName,
        tableDirection: null,
        bannerHeight: null,
        bannerWidth: null
      };
      this.resetForm("form");
    },

    // 筛选节点
    filterNode (value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    // 节点单击事件
    handleNodeClick (data) {
      this.queryParams.menuId = data.id;
      this.form.menuId = data.id;
      this.form.menuName = data.label;
      this.handleQuery();
    },
    /** 查询菜单下拉树结构 */
    getTreeselect () {
      treeselect().then(response => {
        let responseData = response.data;
        if (responseData != null) {
          this.menuOptions = responseData.filter(item => (item.groupType == 'F' && item.tenantCode == 'DECISION'))
        }
      });
    },

    // 更多操作触发
    handleCommand (command, row) {
      switch (command) {
        case "handleSetting":
          this.handleSetting(row);
          break;
        case "handleDelete":
          this.handleDelete(row)
        default:
          break;
      }
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
      this.isUpdate = false;
      this.title = "添加组件信息";
    },
    /** 修改按钮操作 */
    handleUpdate (row) {
      this.reset();
      this.isUpdate = true;
      const id = row.id || this.ids
      getInfo(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改组件信息";
      });
    },

    handleSetting (row) {
      let cptType = row.cptType;
      switch (cptType) {
        //图例
        case "LEGEND":
          this.initLegendList(row);
          break;
        //表格
        case "TABLE": case "BAR": case "PIE": case "MBAR":
          this.initTableList(row, cptType);
          break;
        //表格
        case "TEXT":
          this.initTxtDetail(row);
          break;
        //轮播
        case "BANNER":
          this.initBannerList(row);
          break;
        //文件
        case "FILE":
          this.initFileList(row)
          break;
        default:
          break;
      }

    },

    initFileList (row) {
      let fileListRefs = this.$refs.fileList;
      fileListRefs.open = true;
      fileListRefs.queryParams.componentId = row.id

    },

    //初始化图例列表页面
    initLegendList (row) {
      let lengedListRefs = this.$refs.legendList;
      lengedListRefs.open = true;
      lengedListRefs.queryParams.componentId = row.id
      lengedListRefs.getList();
    },

    //初始化表格列表
    initTableList (row, cptType) {
      let tableListRefs = this.$refs.tableList;
      tableListRefs.open = true;
      tableListRefs.queryParams.componentId = row.id
      tableListRefs.cptType = cptType
      //初始化标题
      tableListRefs.setTitleByType();
      //查询列表
      tableListRefs.getList();
    },

    //初始化轮播组件列表
    initBannerList (row, cptType) {
      let bannerListRefs = this.$refs.bannerList;
      bannerListRefs.open = true;
      bannerListRefs.queryParams.componentId = row.id
      bannerListRefs.cptType = cptType
      if (row.bannerWidth && row.bannerHeight) {
        bannerListRefs.imageRation = row.bannerWidth / row.bannerHeight
        bannerListRefs.miniImageHeight = bannerListRefs.miniImageWidth / bannerListRefs.imageRation
        bannerListRefs.bannerWidth = row.bannerWidth;
        bannerListRefs.bannerHeight = row.bannerHeight;

      } else {
        bannerListRefs.miniImageHeight = 120;
      }

      //查询列表
      bannerListRefs.getList();
    },

    initTxtDetail (row) {
      let txtListRefs = this.$refs.txtList;
      txtListRefs.open = true;
      txtListRefs.form.componentId = row.id
      txtListRefs.handleUpdate(row.id);
    },


    /** 提交按钮 */
    submitForm () {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateInfo(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.queryParams.menuId = this.form.menuId;
              this.getList();
            });
          } else {
            addInfo(this.form).then(response => {
              this.queryParams.menuId = this.form.menuId;
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
      this.$modal.confirm('是否确认删除组件数据项？').then(function () {
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
    },

    /** 查询菜单树结构 */
    bizTreeSelect () {
      bizTreeSelect().then(response => {
        let responseData = response.data;
        if (responseData) {
          this.bizOptions = response.data;
        }
      });
    },

    /** 转换图例数据结构 */
    bizNormalizer (node) {
      if (node.children && !node.children.length) {
        delete node.children;
      }
      return {
        id: node.id,
        label: node.name,
        children: node.children
      };
    },

  }
};
</script>
<style scoped lang="scss">
.bannerHeight {
  ::v-deep .el-form-item__content {
    margin-left: 0 !important;
  }
}
.del-span {
  display: inline-block;
  margin: 5px 8px;
}
</style>
