<template>
  <div class="navbar">
    <!-- <hamburger id="hamburger-container" :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" /> -->

    <!-- <breadcrumb id="breadcrumb-container" class="breadcrumb-container" v-if="!topNav"/> -->
    <top-nav id="topmenu-container" class="" v-if="topNav" />
    <el-dropdown class="nav-div-img" trigger="click" v-if="showFront">
      <div class="avatar-wrapper">
        <img class="nav-logo" src="~@/assets/logo/logo2.png" />
        <img class="nav-logo" src="~@/assets/logo/logo.png" />
        <img class="nav-img" src="~@/assets/images/nav/nav_logo_bg2.png" />
        <i class="el-icon-caret-bottom" />
      </div>
      <el-dropdown-menu slot="dropdown" class="toggest-div">
        <el-dropdown-item class="toggest-item active">
          南京北站枢纽经济区建设项目管理平台
        </el-dropdown-item>
        <el-dropdown-item class="toggest-item">
          <div @click="to">南京北站枢纽经济区可视化平台</div>
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>

    <div class="right-menu">
      <el-dropdown
        class="avatar-container right-menu-item hover-effect"
        trigger="click"
      >
        <div class="avatar-wrapper">
          <span> {{ name }}</span>
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown" class="toggest-div2">
          <router-link to="/user/profile">
            <el-dropdown-item class="toggest-item">个人中心</el-dropdown-item>
          </router-link>
          <el-dropdown-item class="toggest-item" v-if="showFront">
            <div @click="toAdmin">后台管理</div>
          </el-dropdown-item>
          <el-dropdown-item class="toggest-item" v-if="showAdmin">
            <div @click="toFront">项目管理平台</div>
          </el-dropdown-item>
          <el-dropdown-item class="toggest-item">
            <div @click="logout">安全退出</div>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <sidebar style="width: '100%'" v-if="showFront"></sidebar>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import TopNav from '@/components/TopNav'
import Hamburger from '@/components/Hamburger'
import Screenfull from '@/components/Screenfull'
import SizeSelect from '@/components/SizeSelect'
import Search from '@/components/HeaderSearch'
import RuoYiGit from '@/components/RuoYi/Git'
import RuoYiDoc from '@/components/RuoYi/Doc'
import Sidebar from './Sidebar'
export default {
  components: {
    Breadcrumb,
    TopNav,
    Hamburger,
    Screenfull,
    SizeSelect,
    Search,
    RuoYiGit,
    RuoYiDoc,
    Sidebar
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'name',
      'device'
    ]),
    data () {
      return {
        user: ''
      };
    },
    setting: {
      get () {
        return this.$store.state.settings.showSettings
      },
      set (val) {
        this.$store.dispatch('settings/changeSetting', {
          key: 'showSettings',
          value: val
        })
      }
    },
    topNav: {
      get () {
        return this.$store.state.settings.topNav
      }
    },
    showFront: {
      get () {
        return this.$store.state.settings.showFront
      }
    },
    showAdmin: {
      get () {
        return this.$store.state.settings.showAdmin
      }
    }
  },
  methods: {
    toggleSideBar () {
      this.$store.dispatch('app/toggleSideBar')
    },
    async logout () {
      this.$confirm('确定注销并退出系统吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$store.dispatch('LogOut').then(() => {
          location.href = '/index';
        })
      }).catch(() => { });
    },
    to () {
      window.location.replace("http://106.14.106.138:8093/index");
    },
    toAdmin () {
      this.$store.state.settings.showAdmin = true
      this.$store.state.settings.showFront = false
      this.$router.push('/admin/index')
    },
    toFront () {
      debugger
      this.$store.state.settings.showAdmin = false
      this.$store.state.settings.showFront = true
      this.$router.push('/index?menuId=2020')
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 0.8rem;
  padding: 0 0.4rem;
  line-height: 0.8rem;
  overflow: hidden;
  position: relative;
  background: #004ab3;
  color: #fff;
  box-shadow: 0px 0.125rem 0.25rem 0.0125rem rgba(0, 63, 151, 0.3);
  font-family: 'pmzdbtt';

  .hamburger-container {
    line-height: 0.575rem;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: rgba(0, 0, 0, 0.025);
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .topmenu-container {
    position: absolute;
    left: 0.625rem;
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    float: right;
    height: 100%;
    display: inline-flex;
    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 0.01rem 0 0.4rem;
      height: 100%;
      font-size: 0.25rem;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
      }
    }

    .avatar-container {
      margin-right: 0.125rem;

      .avatar-wrapper {
        position: relative;
        span {
          color: #fff;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -0.25rem;
          top: 0.3125rem;
          font-size: 0.2rem;
          color: #fff;
        }
      }
    }
  }
}
.nav-div-img {
  width: 7.625rem;
  align-items: center;
  position: absolute;
  color: #fff;
  font-size: 0.25rem;
}
.nav-img {
  height: 0.45rem;
  width: auto;
  vertical-align: middle;
  margin: 0 0.2rem 0 0;
}
.nav-logo {
  height: 0.6rem;
  width: auto;
  vertical-align: middle;
  margin-right: 0.15rem;
}
.toggest-div {
  top: 0.5rem !important;
  left: 1.9375rem !important;
  border: 0 !important;
  text-align: center;
  width: 5.525rem;
  padding: 0.05rem;
  background: #ffffff;
  box-shadow: 0px 0.125rem 0.25rem 0.0125rem rgba(184, 192, 204, 0.4);
  border-radius: 0.1rem;
  z-index: 999999 !important;
}
.toggest-div2 {
  top: 0.5rem !important;
  width: 1.4rem;
  box-shadow: 0px 0.125rem 0.25rem 0.0125rem rgba(184, 192, 204, 0.4);
  border-radius: 0.01rem;
  text-align: center;
  z-index: 999999 !important;
  border-radius: 0.1rem;
}
.toggest-item {
  width: 100%;
  height: 0.5rem;
  line-height: 0.5rem;
  border-radius: 0.005rem;
}
.active,
.toggest-item:hover {
  background: #004ab3;
  color: #fff;
}
::v-deep .popper__arrow {
  display: none;
}
</style>
