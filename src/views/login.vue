<template>
  <div class="login">
    <el-form
      ref="loginForm"
      :model="loginForm"
      :rules="loginRules"
      class="login-form"
    >
      <div class="title">
        <img class="nav-logo" src="~@/assets/logo/logo.png" /><span
          >南京北站枢纽经济区建设项目管理平台</span
        >
      </div>
      <el-form-item prop="username">
        <el-input
          v-model="loginForm.username"
          type="text"
          auto-complete="off"
          placeholder="账号"
        >
          <svg-icon
            slot="prefix"
            icon-class="user"
            class="el-input__icon input-icon"
          />
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          v-model="loginForm.password"
          type="password"
          auto-complete="off"
          placeholder="密码"
          @keyup.enter.native="handleLogin"
        >
          <svg-icon
            slot="prefix"
            icon-class="password"
            class="el-input__icon input-icon"
          />
        </el-input>
      </el-form-item>
      <el-form-item prop="code" v-if="captchaOnOff">
        <el-input
          v-model="loginForm.code"
          auto-complete="off"
          placeholder="验证码"
          style="width: 78%"
          @keyup.enter.native="handleLogin"
        >
          <svg-icon
            slot="prefix"
            icon-class="validCode"
            class="el-input__icon input-icon"
          />
        </el-input>
        <div class="login-code">
          <img :src="codeUrl" @click="getCode" class="login-code-img" />
        </div>
      </el-form-item>
      <el-checkbox v-model="loginForm.rememberMe" class="check-div"
        >记住密码</el-checkbox
      >
      <el-form-item style="width: 100%">
        <el-button
          :loading="loading"
          size="medium"
          type="primary"
          class="login-btn"
          @click.native.prevent="handleLogin"
        >
          <span v-if="!loading">登 录</span>
          <span v-else>登 录 中...</span>
        </el-button>
        <div style="float: right" v-if="register">
          <router-link class="link-type" :to="'/register'"
            >立即注册</router-link
          >
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { getCodeImg } from "@/api/login";
import Cookies from "js-cookie";
import { encrypt, decrypt } from '@/utils/jsencrypt'

export default {
  name: "Login",
  data () {
    return {
      codeUrl: "",
      loginForm: {
        username: "admin",
        password: "admin123",
        rememberMe: false,
        code: "",
        uuid: ""
      },
      loginRules: {
        username: [
          { required: true, trigger: "blur", message: "请输入您的账号" }
        ],
        password: [
          { required: true, trigger: "blur", message: "请输入您的密码" }
        ],
        code: [{ required: true, trigger: "change", message: "请输入验证码" }]
      },
      loading: false,
      // 验证码开关
      captchaOnOff: true,
      // 注册开关
      register: false,
      redirect: undefined
    };
  },
  watch: {
    $route: {
      handler: function (route) {
        this.redirect = route.query && route.query.redirect;
      },
      immediate: true
    }
  },
  created () {
    this.getCode();
    this.getCookie();
  },
  methods: {
    getCode () {
      getCodeImg().then(res => {
        this.captchaOnOff = res.captchaOnOff === undefined ? true : res.captchaOnOff;
        if (this.captchaOnOff) {
          this.codeUrl = "data:image/gif;base64," + res.img;
          this.loginForm.uuid = res.uuid;
        }
      });
    },
    getCookie () {
      const username = Cookies.get("username");
      const password = Cookies.get("password");
      const rememberMe = Cookies.get('rememberMe')
      this.loginForm = {
        username: username === undefined ? this.loginForm.username : username,
        password: password === undefined ? this.loginForm.password : decrypt(password),
        rememberMe: rememberMe === undefined ? false : Boolean(rememberMe)
      };
    },
    handleLogin () {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true;
          if (this.loginForm.rememberMe) {
            Cookies.set("username", this.loginForm.username, { expires: 30 });
            Cookies.set("password", encrypt(this.loginForm.password), { expires: 30 });
            Cookies.set('rememberMe', this.loginForm.rememberMe, { expires: 30 });
          } else {
            Cookies.remove("username");
            Cookies.remove("password");
            Cookies.remove('rememberMe');
          }
          this.$store.dispatch("Login", this.loginForm).then((resp) => {
            //非首次登陆跳转首页，首次登陆跳转修改密码
            if (resp.firstLogin == true) {
              this.$router.push({ path: '/user/profile' || "/" }).catch(() => { });
            } else {
              this.$router.push({ path: '/index?menuId=' + resp.indexMenuId, }).catch(() => { });
            }
          }).catch(() => {
            this.loading = false;
            if (this.captchaOnOff) {
              this.getCode();
            }
          });
        }
      });
    }
  }
};
</script>

<style scoped lang="scss">
.login {
  display: grid;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-image: url('../assets/images/login-background.png');
  background-size: 100% 100%;
}
.title {
  display: inline-block;
  text-align: center;
  color: #ffffff;
  font-size: 44px;
  font-weight: bold;
  height: 50px;
  position: absolute;
  top: 0;
  left: 0;
}

.login-form {
  width: 850px;
  padding: 120px 100px 0 100px;
  position: relative;
  .el-input {
    width: 650px;
    height: 60px;
    input {
    }
  }
  .input-icon {
    height: 0.525rem;
    width: 0.175rem;
    margin-left: 0.025rem;
  }
}
::v-deep .el-input--medium .el-input__inner {
  background: rgba(9, 87, 198, 0.4);
  border: 1px solid #3587fb;
  height: 0.525rem;
  color: #fff;
}
.login-tip {
  font-size: 0.1265rem;
  text-align: center;
  color: #bfbfbf;
}
.login-code {
  width: 18%;
  height: 0.525rem;
  float: right;
  img {
    cursor: pointer;
    vertical-align: middle;
  }
}
.el-login-footer {
  height: 0.5rem;
  line-height: 0.5rem;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: #fff;
  font-family: Arial;
  font-size: 0.15rem;
  letter-spacing: 0.0125rem;
}
.login-code-img {
  height: 0.525rem;
  border: 1px solid #3587fb;
  border-radius: 4px;
}
.login-btn {
  width: 100%;
  height: 0.65rem;
  font-size: 22px;
  background: linear-gradient(0deg, #0957c6, #2e80f3);
}
.check-div {
  margin: 0 0 0.3125rem 0;
  color: rgba(225, 228, 230, 1);
}
.nav-logo {
  width: 40px;
  height: 48px;
  margin-right: 18px;
  vertical-align: middle;
}
</style>
