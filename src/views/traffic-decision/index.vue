<template>
  <div class="content">
        <div class="tab-div">
            <div class="tab-item" v-for="(item,index) in tabList" :key="index" @click="tabClick(index)" :class="{isActive:isShow==index}">{{item}}</div>
        </div>
        <keep-alive>
            <tab2-vue v-if="isShow==0"></tab2-vue>
        </keep-alive>
        <keep-alive>
            <tab3-vue v-if="isShow==1"></tab3-vue>
        </keep-alive>
  </div>
</template>

<script>
import tab2Vue from './components/tab2.vue'
import tab3Vue from './components/tab3.vue'
export default {
    components:{
        tab2Vue,tab3Vue
    },
    data(){
        return{
            isShow:0,
            tabList:['方案比选','优化建议']
        }
    },
    methods:{
        tabClick(index){
            this.isShow=index
        }
    }

}
</script>

<style scoped lang="scss">
@import '~@/assets/styles/tab.scss';
</style>