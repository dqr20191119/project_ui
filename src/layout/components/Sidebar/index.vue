<template>
  <el-scrollbar wrap-class="scrollbar-wrapper">
    <el-menu
      :default-active="activeMenu"
      :background-color="variables.menuBg"
      :text-color="variables.menuText"
      :active-text-color="variables.menuActiveText"
      style="background:none;display: flex"
      mode="horizontal">
 
      <sidebar-item
        v-for="route in topbarRouters"
        :key="route.path"
        :item="route"
        :base-path="route.path"/>
    </el-menu>
  </el-scrollbar>
 
</template>
 
<script>
  import {mapGetters} from 'vuex'
  import SidebarItem from './SidebarItem'
  import variables from "@/assets/styles/variables.scss";
 
  export default {
    name: 'Sidebar',
    components: {SidebarItem},
    computed: {
      ...mapGetters([
        'permission_routes',
        'sidebar'
      ]),
      activeMenu() {
        const route = this.$route
        const {meta, path} = route
        // if set path, the sidebar will highlight the path you set
        if (meta.activeMenu) {
          return meta.activeMenu
        }
        return path
      },
      showLogo() {
        return this.$store.state.settings.sidebarLogo
      },
      variables() {
        return variables
      },
      isCollapse() {
        return !this.sidebar.opened
      }
    },
    data(){
        return{
            topbarRouters:[]
        }
    
    },
     created () {
        this.permission_routes.forEach(e => {
            if(e.groupType){
              if(e.groupType=='F'){
                this.topbarRouters.push(e)
              }
            }else{
                this.topbarRouters.push(e)
            }
        });
    }
  }
</script>
<style scoped>
.el-menu--horizontal /deep/ .el-menu--popup {
    padding: 0.1875rem!important;
}
.el-scrollbar{
  margin-left: 7.625rem;
}
</style>