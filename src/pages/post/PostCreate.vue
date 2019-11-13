<template>
  <div v-loading="loading" class="PostCreate">
    <el-form
      :model="formData"
      :rules="rules"
      :inline="true"
      ref="formData"
      label-width="100px"
    >
      <el-form-item label="标题" prop="title">
        <el-input
          style="width:200px"
          v-model="formData.title"
          maxlength="300"
          placeholder="请输入标题"
        ></el-input>
      </el-form-item>
      <el-form-item label="分类" prop="category">
        <el-select
          style="width:200px"
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
      <el-form-item label="标签" prop="tags">
        <el-input
          style="width:200px"
          v-model="formData.tags"
          maxlength="300"
          placeholder="请输入标签，多个标签之间用空格分离"
        ></el-input>
      </el-form-item>
      <el-form-item label="html" class="item-block">
        <el-input
          type="textarea"
          :rows="20"
          v-model="formData.html"
          style="width:100%;"
        ></el-input>
      </el-form-item>
      <el-form-item label="css" class="item-block">
        <el-input
          type="textarea"
          :rows="20"
          v-model="formData.css"
          style="width:100%;"
        ></el-input>
      </el-form-item>
      <el-form-item label="描述">
        <el-input
          type="textarea"
          :rows="2"
          v-model="formData.intro"
          style="width:400px;"
        ></el-input>
      </el-form-item>
      <el-form-item label="发布" prop="show">
        <el-switch
          v-model="formData.show"
          :active-value="true"
          :inactive-value="false"
        ></el-switch>
      </el-form-item>
      <div>
        <el-form-item>
          <el-button type="primary" @click="submitForm('formData')">
            {{ edit ? "立即修改" : "立即创建" }}
          </el-button>
          <!-- <el-button @click="resetForm('formData')">重置</el-button> -->
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>
<script>
// import "tui-editor/dist/tui-editor-extScrollSync.js";
// import Editor from "tui-editor";
import { postsCreate, postsUpdate, postsShow, sourcesCreate } from "@/api";
export default {
  data() {
    return {
      edit: false, // 是否是编辑状态
      query: this.$route.query,
      detail: {},
      loading: false,
      formData: {
        title: undefined,
        intro: undefined,
        category: undefined,
        tags: undefined,
        show: true,
        html: `<div class="_abc_">haha</div>`,
        css: `._abc_ { color: red; }`
      },
      rules: {
        title: [{ required: true, message: "请输入标题", trigger: "blur" }]
      }
    };
  },
  computed: {
    map() {
      return this.$store.state.map;
    }
  },
  created() {
    if (this.query.id) {
      this.edit = true;
      this.initData();
    }
  },
  methods: {
    // 数据初始化
    initData() {
      this.loading = true;
      postsShow(this.query.id).then(res => {
        this.loading = false;
        if (!res) return;
        res.tags = res.tags.join(" ");
        res.css = res.source.css;
        res.html = res.source.html;
        res.show = res.source.show;
        this.detail = res;
        Object.keys(this.formData).forEach(key => {
          this.formData[key] = res[key];
        });
      });
    },
    // 提交
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          let detail = {
            ...this.formData
          };
          let api = this.edit ? postsUpdate : postsCreate;
          this.loading = true;
          sourcesCreate({
            css: detail.css,
            html: detail.html,
            show: detail.show
          }).then(res => {
            if (!res) {
              this.loading = false;
              return;
            }
            delete detail.css;
            delete detail.html;
            delete detail.show;
            detail.tags = this.tagsToArray(detail.tags);
            detail.source = res._id;
            api(detail, this.edit ? this.query.id : undefined).then(res => {
              this.loading = false;
              if (!res) return;
              this.$message.success(this.edit ? "修改成功" : "创建成功");
              // 非编辑状态改为编辑状态
              this.edit = true;
              this.$router.replace({
                name: "PostList"
              });
            });
          });
        }
      });
    },
    tagsToArray(tags) {
      tags = (tags || "").split(" ").filter(v => v);
      return [...new Set(tags)];
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    }
  }
};
</script>
<style lang="less">
.PostCreate {
  .item-block {
    display: flex;
    .el-form-item__content {
      flex: 1;
    }
  }
}
</style>
