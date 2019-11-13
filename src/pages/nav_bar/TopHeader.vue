<template>
  <div>
    <div class="top-header">
      <h2 @click="$router.push('/')">紫菊后台</h2>
      <div class="menu">
        <el-dropdown @command="handleCommand">
          <span class="el-dropdown-link">
            {{ user.username }}<i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="logout">退出</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>
<script>
import { authLogout } from "@/api";
export default {
  data() {
    return {};
  },
  computed: {
    user() {
      return this.$store.state.user || {};
    }
  },
  methods: {
    handleCommand(key) {
      if (key === "logout") {
        this.logout();
      }
    },
    logout() {
      this.$router.replace({ name: "UserLogin" });
      this.$store.commit("setUser", null);
      authLogout();
    }
  }
};
</script>

<style lang="less">
.top-header {
  display: flex;
  h2 {
    margin: 0;
  }
  .menu {
    flex: 1;
    text-align: right;
    .el-dropdown {
      line-height: 1.2;
    }
  }
  .el-dropdown-link {
    cursor: pointer;
  }
}
</style>
