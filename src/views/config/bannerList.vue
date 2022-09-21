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
        <el-form-item label="图片名称" prop="filePath">
          <el-input
            v-model="queryParams.filePath"
            placeholder="请输入图片名称"
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
            v-hasPermi="['config:banner:add']"
            >新增</el-button
          >
        </el-col>
        <!-- <el-col :span="1.5">
          <el-button
            type="success"
            plain
            icon="el-icon-edit"
            size="mini"
            :disabled="single"
            @click="handleUpdate"
            v-hasPermi="['config:banner:edit']"
            >修改</el-button
          >
        </el-col> -->
        <el-col :span="1.5">
          <el-button
            type="danger"
            plain
            icon="el-icon-delete"
            size="mini"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['config:banner:remove']"
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
        <el-table-column label="主键" align="center" prop="id" v-if="false" />
        <el-table-column label="排序" align="center" prop="orderNum" />
        <el-table-column label="图片" align="center" prop="filePath">
          <template slot-scope="scope">
            　　　　<img
              :src="scope.row.fileBase64"
              :width="miniImageWidth"
              :height="miniImageHeight"
            />
            　　</template
          >
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
              v-hasPermi="['system:info:edit']"
              >修改</el-button
            >
            <el-button
              size="mini"
              type="text"
              icon="el-icon-delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['system:info:remove']"
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

    <!-- 添加或修改轮播组件对话框 -->
    <BannerDetail ref="bannerDetail"></BannerDetail>
  </div>
</template>

<script>
import { listInfo, getInfo, delInfo, addInfo, updateInfo } from "@/api/config/banner";
import BannerDetail from './bannerDetail.vue';

export default {
  name: "Info",
  components: { BannerDetail },

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
      // 轮播组件表格数据
      infoList: [],
      // 弹出层标题
      title: "",
      imageRation: null,
      miniImageWidth: 150,
      miniImageHeight: null,

      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        filePath: null,
        orderNum: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        componentId: [
          { required: true, message: "组件ID不能为空", trigger: "blur" }
        ],
        filePath: [
          { required: true, message: "图片路径不能为空", trigger: "blur" }
        ],
      }
    };
  },
  created () {


    this.getList();
  },
  methods: {
    /** 查询轮播组件列表 */
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
        orderNum: null,
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
    /** 新增按钮操作 */
    handleAdd () {

      let bannerDetailRefs = this.$refs.bannerDetail;
      bannerDetailRefs.reset();
      bannerDetailRefs.open = true;
      bannerDetailRefs.form.componentId = this.queryParams.componentId;
      bannerDetailRefs.title = "添加轮播组件";
      if (this.bannerWidth && this.bannerHeight) {
        bannerDetailRefs.options.autoCropWidth = this.bannerWidth;
        bannerDetailRefs.options.autoCropHeight = this.bannerHeight;
        bannerDetailRefs.bannerHeight = bannerDetailRefs.bannerWidth / (this.bannerWidth / this.bannerHeight) + 'px'
        bannerDetailRefs.bannerWidth = bannerDetailRefs.bannerWidth + "px"

      }

    },
    /** 修改按钮操作 */
    handleUpdate (row) {
      const id = row.id || this.ids
      let bannerDetailRefs = this.$refs.bannerDetail;
      if (this.bannerWidth && this.bannerHeight) {
        bannerDetailRefs.options.autoCropWidth = this.bannerWidth;
        bannerDetailRefs.options.autoCropHeight = this.bannerHeight;
        bannerDetailRefs.bannerHeight = bannerDetailRefs.bannerWidth / (this.bannerWidth / this.bannerHeight) + 'px'
        bannerDetailRefs.bannerWidth = bannerDetailRefs.bannerWidth + "px"
      }
      bannerDetailRefs.handleUpdate(row, bannerDetailRefs);
    },

    /** 删除按钮操作 */
    handleDelete (row) {
      const ids = row.id || this.ids;
      this.$modal.confirm('是否确认删除轮播组件数据项？').then(function () {
        return delInfo(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => { });
    },

  }
};
</script>
