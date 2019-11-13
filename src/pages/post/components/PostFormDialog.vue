<template>
  <div class="PostFormDialog">
    <!-- 600px【小型，单列】 70% 【中型，双列】-->
    <el-dialog
      :title="rowData._id ? '编辑笔记' : '新建笔记'"
      :visible="visible"
      width="600px"
      :before-close="handleClose"
      @close="close"
    >
      <div>
        <el-form
          :inline="false"
          :model="formData"
          :rules="rules"
          label-width="100px"
          ref="form"
        >
          <el-form-item label="标题" prop="title">
            <el-input
              style="width:200px;"
              v-model="formData.title"
              placeholder="请输入标题"
            ></el-input>
          </el-form-item>
          <el-form-item label="分类" prop="category">
            <el-select
              :loading="!map['categories']"
              v-model="formData.category"
              placeholder="请选择分类"
              clearable
            >
              <el-option
                v-for="item in map['categories']"
                :key="item.key"
                :label="item.key"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="发布" prop="show">
            <el-switch
              v-model="formData.show"
              :active-value="true"
              :inactive-value="false"
            >
            </el-switch>
          </el-form-item>
          <el-form-item label="标签" prop="tags">
            <el-input
              style="width:200px"
              v-model="formData.tags"
              maxlength="300"
              placeholder="请输入标签，多个标签之间用空格分离"
            ></el-input>
          </el-form-item>
          <el-form-item label="效果图">
            <el-upload
              class="avatar-uploader"
              action="/api/upload"
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
              :before-upload="beforeAvatarUpload"
            >
              <img v-if="imageUrl" :src="imageUrl" class="avatar" />
              <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            </el-upload>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="close()">取 消</el-button>
        <el-button type="primary" :loading="loading" @click="confirm()"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { postsCreate, postsUpdate, sourcesUpdate } from "@/api";
export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    /** 数据初始 */
    row: {
      type: Object,
      default: () => {}
    }
  },
  computed: {
    /** 防止父级传递 null */
    rowData() {
      return this.row || {};
    },
    map() {
      return this.$store.state.map;
    }
  },
  watch: {
    /** 监听数据切换，重置表单 */
    visible(val) {
      if (!val) return;
      let temp = { ...this.rowData };
      temp.category = temp.category ? temp.category._id : undefined;
      temp.tags = temp.tags.join(" ");
      Object.keys(this.formData).forEach(key => {
        this.formData[key] = temp[key];
      });
      if (this.rowData._id) {
        this.imageUrl = this.rowData.imgUrl;
      }
    }
  },
  data() {
    return {
      image: undefined,
      imageUrl: "",
      dialogVisible: false,
      fileList: [],
      loading: false,
      formData: {
        //  ... 表单字段
        title: undefined,
        category: undefined,
        tags: undefined,
        logos: undefined,
        show: undefined
      },
      rules: {
        //  ... 表单校验
        title: [
          { required: true, message: "必填项", trigger: "blur" },
          { min: 0, max: 200, message: "不能超过200个字符", trigger: "blur" }
        ],
        category: [{ required: true, message: "必填项", trigger: "blur" }]
      }
    };
  },
  methods: {
    handleAvatarSuccess(res, file) {
      this.image = res;
      this.imageUrl = URL.createObjectURL(file.raw);
    },
    beforeAvatarUpload(file) {
      const isJPG = file.type === "image/jpeg" || file.type === "image/png";
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        this.$message.error("上传图片只能是 JPG/PNG 格式!");
      }
      if (!isLt2M) {
        this.$message.error("上传图片大小不能超过 2MB!");
      }
      return isJPG && isLt2M;
    },
    /** 确定 */
    confirm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          this.loading = true;
          let params = { ...this.formData };
          let api = postsCreate;
          if (this.rowData._id) {
            api = postsUpdate;
          }
          params.tags = this.tagsToArray(params.tags);
          params.imgUrl = this.image.url;
          if (this.rowData.source && this.image) {
            sourcesUpdate({ img: this.image._id }, this.rowData.source);
          }
          api(params, this.rowData._id).then(res => {
            this.loading = false;
            if (!res) return;
            this.$message.success("操作成功！");
            this.$emit("visible:update", false);
            this.$emit("submited");
            this.close();
          });
        }
      });
    },
    /** 关闭弹窗 */
    close() {
      this.visible && this.$emit("update:visible", false);
      this.$nextTick(() => {
        Object.keys(this.formData).forEach(key => {
          this.formData[key] = undefined;
        });
      });
      this.fileList = [];
    },
    tagsToArray(tags) {
      tags = (tags || "").split(" ").filter(v => v);
      return [...new Set(tags)];
    },
    handleClose(done) {
      this.$confirm("确认关闭？")
        .then(() => {
          done();
        })
        .catch(() => {});
    }
  }
};
</script>

<style lang="less">
.PostFormDialog {
  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409eff;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }
}
</style>
