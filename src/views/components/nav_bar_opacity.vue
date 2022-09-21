<template>
  <div>
      <div class="nav-bar">
        <div class="nav-bg"></div>
        <span v-for="(item,index) in navList" :key="index" class="nav-item">{{item}}</span>
      </div>
  </div>
</template>

<script>
export default {
  props: {
    navList: {
      type: Array,
      default: ''
    }
  },
}
</script>

<style lang="scss" scoped>
.nav-bar{
    position: absolute;
    top: 0.4rem;
    left: 0.4rem;
    background: rgba(255, 255, 255, .8);
    padding: 0.1rem 0.1875rem;
    border-radius: 0.025rem;
}
.nav-bg{
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    overflow: hidden;
    border-radius: 0.05rem;
}
.nav-item{
    font-size: 0.15rem;
    color: rgba(100, 101, 102, 1);
    z-index: 2;
}
.nav-item::after{
  content: '>';
  margin: 0 0.0625rem;
}
.nav-item:last-child{     
    color: rgba(34, 35, 36, 1);
    font-weight: bold;
}
.nav-item:last-child::after{    
    content: '';
    margin: 0;
}
</style>