<template>
  <div class="user-container">
    <el-row>
      <el-col :span="24" :xs="24">
        <el-card class="box-card">
          <div>
            <el-descriptions class="margin-top" title="个人信息" :column="1"  border>
                <el-descriptions-item>
                  <template slot="label">
                    <i class="el-icon-user"></i>
                    用户名
                  </template>
                  {{ user.userName }}
                </el-descriptions-item>
                <el-descriptions-item>
                  <template slot="label">
                    <i class="el-icon-mobile-phone"></i>
                    手机号
                  </template>
                  {{ user.phonenumber }}
                </el-descriptions-item>
                <el-descriptions-item>
                  <template slot="label">
                    <i class="el-icon-location-outline"></i>
                    用户邮箱
                  </template>
                  {{ user.email }}
                </el-descriptions-item>
                <el-descriptions-item>
                  <template slot="label">
                    <i class="el-icon-tickets"></i>
                    所属部门
                  </template>
                  <div v-if="user.dept">{{ user.dept.deptName }} / {{ postGroup }}</div>
                </el-descriptions-item>
                <el-descriptions-item>
                  <template slot="label">
                    <i class="el-icon-office-building"></i>
                    创建日期
                  </template>
                  {{ user.createTime }}
                </el-descriptions-item>
              </el-descriptions>
          </div>
        </el-card>
      </el-col>
      <el-col :span="24" :xs="24">
        <el-card>
          <div slot="header" class="clearfix el-descriptions__header">
            <span class="el-descriptions__title">基本资料</span>
          </div>
          <el-tabs v-model="activeTab" type="card">
            <el-tab-pane label="基本资料" name="userinfo">
              <userInfo :user="user" />
            </el-tab-pane>
            <el-tab-pane label="修改密码" name="resetPwd">
              <resetPwd :user="user" />
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import userAvatar from "./userAvatar";
import userInfo from "./userInfo";
import resetPwd from "./resetPwd";
import { getUserProfile } from "@/api/system/user";

export default {
  name: "Profile",
  components: { userAvatar, userInfo, resetPwd },
  data() {
    return {
      user: {},
      roleGroup: {},
      postGroup: {},
      activeTab: "userinfo"
    };
  },
  created() {
    this.getUser();
  },
  methods: {
    getUser() {
      getUserProfile().then(response => {
        this.user = response.data;
        this.roleGroup = response.roleGroup;
        this.postGroup = response.postGroup;
      });
    }
  }
};
</script>
<style scoped>
.user-container{
  padding: 0.75rem 5.875rem;
  background: #f3f3f3;
}
.box-card{
  margin-bottom: 0.4rem;
}
</style>