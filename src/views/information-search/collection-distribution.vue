<template>
  <div>
      <div class="tab-div">
          <div class="tab-bg"></div>
          <div class="tab-item" v-for="(item,index) in tabList" :key="index" @click="tabClick(index)" :class="{isActive:isShow==index}">{{item}}</div>
      </div>
      
    <tab1-vue v-show="isShow==0"></tab1-vue>
    <tab2-vue v-show="isShow==1"></tab2-vue>
  </div>
</template>

<script>
import tab1Vue from './components/tab1.vue'
import tab2Vue from './components/tab2.vue'
export default {
  components:{
    tab1Vue,tab2Vue
  },
     data(){
        return{
            isShow:0,
            tabList:['枢纽基本信息','集疏运交通']
        }
    },
    methods:{
        tabClick(index){
            this.isShow=index
            console.log(index)
        }
    }
}
</script>

<style scoped lang="scss">
@import '~@/assets/styles/tab.scss';
</style>