<template>
  <!-- 添加或修改轮播组件对话框 -->
  <el-dialog
    :title="title"
    :visible.sync="open"
    width="1480px"
    append-to-body
    @close="closeDialog"
  >
    <el-form ref="form" :model="form" :rules="rules" label-width="80px">
      <el-row :gutter="20">
        <el-col
          :xs="24"
          :md="12"
          :style="{ height: '720px', width:'1320px'}"
        >
          <vue-cropper
            ref="cropper"
            :img="options.img"
            :info="false"
            :autoCropWidth="options.autoCropWidth"
            :autoCropHeight="options.autoCropHeight"
            :fixedNumber="options.fixedNumber"
            :outputSize="1"
            :autoCrop="true"
            :fixed="true"
            :fixedBox="true"
            :infoTrue="true"
            @realTime="realTime"
          />
        </el-col>
        <el-col
          :xs="24"
          :md="12"
          :style="{ height: '720px', width:'1320px'}"
        >
          <div
            class="banner-upload-preview"
          >
            <img :src="previews.url" :style="previews.img" />
          </div>
        </el-col>
      </el-row>
      <br />
      <el-row>
        <el-col :lg="2" :md="2">
          <el-upload
            ref="uploadBanner"
            :http-request="httpRequest"
            accept="image/jpeg,image/gif,image/png"
            :file-lis="files"
            action="#"
            :show-file-list="false"
            :before-upload="beforeUpload"
          >
            <el-button size="small">
              选择
              <i class="el-icon-upload el-icon--right"></i>
            </el-button>
          </el-upload>
        </el-col>

        <el-col :lg="{ span: 1, offset: 1 }" :md="2">
          <el-button
            icon="el-icon-plus"
            size="small"
            @click="changeScale(1)"
          ></el-button>
        </el-col>
        <el-col :lg="{ span: 1, offset: 1 }" :md="2">
          <el-button
            icon="el-icon-minus"
            size="small"
            @click="changeScale(-1)"
          ></el-button>
        </el-col>
        <el-col :lg="{ span: 1, offset: 1 }" :md="2">
          <el-button
            icon="el-icon-refresh-left"
            size="small"
            @click="rotateLeft()"
          ></el-button>
        </el-col>
        <el-col :lg="{ span: 1, offset: 1 }" :md="2">
          <el-button
            icon="el-icon-refresh-right"
            size="small"
            @click="rotateRight()"
          ></el-button>
        </el-col>
      </el-row>
      <br />
      <el-row>
        <el-col :xs="24" :md="12">
          <el-form-item label="显示顺序" prop="orderNum">
            <el-input-number
              v-model="form.orderNum"
              :min="1"
              style="width: 280px"
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
</template>

<script>
import { listInfo, getInfo, delInfo, addInfo, updateInfo, upload } from "@/api/config/banner";
import { VueCropper } from "vue-cropper";
import store from "@/store";

export default {
  name: "Info",
  components: { VueCropper },
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
      action: process.env.VUE_APP_BASE_API + "/config/banner/upload",
      // 轮播组件表格数据
      infoList: [],
      // fileList: [{ name: 'food.jpeg', url: 'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100' }, { name: 'food2.jpeg', url: 'https://fuss10.elemecdn.com/3/63/4e7f3a15429bfda99bce42a18cdd1jpeg.jpeg?imageMogr2/thumbnail/360x360/format/webp/quality/100' }],
      files: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      options: {
        img: null, //裁剪图片的地址
        autoCropWidth: 495, // 默认生成截图框宽度
        autoCropHeight: 270, // 默认生成截图框高度
        fixedNumber: [1.83333,1],
        original:true
      },
      bannerWidth: '',
      bannerHeight: '',
      previews: {},

      // 表单参数
      form: {},
      // 表单校验
      rules: {
        componentId: [
          { required: true, message: "组件ID不能为空", trigger: "blur" }
        ],
        orderNum: [
          { required: true, message: "显示顺序不能为空", trigger: "blur" }
        ],

      }
    };
  },
  created () {
    this.getList();
  },
  methods: {

    httpRequest (option) {
      this.files = [];
      this.files.push(option)
    },

    // 向左旋转
    rotateLeft () {
      this.$refs.cropper.rotateLeft();
    },
    // 向右旋转
    rotateRight () {
      this.$refs.cropper.rotateRight();
    },
    // 图片缩放
    changeScale (num) {
      num = num || 1;
      this.$refs.cropper.changeScale(num);
    },

    // 上传预处理
    beforeUpload (file) {
      if (file.type.indexOf("image/") == -1) {
        this.$modal.msgError("文件格式错误，请上传图片类型,如：JPG，PNG后缀的文件。");
      } else {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          this.options.img = reader.result;
        };
      }
    },

    // 实时预览
    realTime (data) {
      this.previews = data;
    },






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
      //清空上传控件文件信息
      let uploadBanner = this.$refs.uploadBanner;
      if (uploadBanner) {
        this.$refs.uploadBanner.clearFiles();
      }
      this.files = [];

      this.options.img = null;
      this.form = {
        id: null,
        componentId: null,
        filePath: null,
        orderNum: 1,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
        delFlag: null
      };
      this.resetForm("form");
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
      this.title = "添加轮播组件";
    },

    base64ToBlob (base64) {
      let parts = base64.split(";base64,");
      let contentType = parts[0].split(":")[1];
      let raw = window.atob(parts[1]);
      let rawLength = raw.length;
      let uInt8Array = new Uint8Array(rawLength);
      for (let i = 0; i < rawLength; i += 1) {
        uInt8Array[i] = raw.charCodeAt(i);
      }
      return new Blob([uInt8Array], { type: contentType });
    },

    /** 修改按钮操作 */
    handleUpdate (row, _this) {
      console.log(_this);
      _this.reset();
      const id = row.id || _this.ids
      getInfo(id).then(response => {
        _this.form = response.data;
        _this.open = true;
        _this.title = "修改轮播组件";
        let fileBase64 = response.data.fileBase64;
        if (fileBase64) {
          _this.options.img = URL.createObjectURL(_this.base64ToBlob(fileBase64))
        }
        //this.files.push(option)

      });
    },
    /** 提交按钮 */
    submitForm () {
      this.$refs["form"].validate(valid => {
        if (valid) {
          let formData = new FormData();
          this.$refs.cropper.getCropBlob(data => {
            if (!data) {
              this.$message.error("请上传文件");
              return;
            }
            formData.append("file", data);
            formData.append("componentId", this.form.componentId)
            formData.append("orderNum", this.form.orderNum)
            if (this.form.id != null) {
              formData.append("id", this.form.id);
            }
            upload(formData).then(response => {
              if (response && response.data) {
                this.$modal.msgSuccess("操作成功");
                this.open = false;
                this.$parent.getList();
              }

            });
          })

        }
      });
    },
    /** 删除按钮操作 */
    handleDelete (row) {
      const ids = row.id || this.ids;
      this.$modal.confirm('是否确认删除轮播组件编号为"' + ids + '"的数据项？').then(function () {
        return delInfo(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => { });
    },

    // 关闭窗口
    closeDialog () {
      this.options.img = null
      this.open = false;
    }
  }
};
</script>
<style scoped>
.banner-upload-preview {
  height: 100%;
  box-shadow: 0 0 4px #ccc;
  overflow: hidden;

}
</style>
