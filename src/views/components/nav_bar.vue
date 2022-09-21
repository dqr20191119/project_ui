<template>
  <div>
      <div class="nav-bar">
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
    background: rgba(255,255,255,0.9600);
    box-shadow: 0 0.125rem 0.25rem 0.0125rem rgba(138,144,153,0.4);
    border-radius: 0.05rem;
    border: 0.0125rem solid #E6EFFA;
    padding: 0.1rem 0.1875rem;
    z-index: 1000;
}
.nav-item{
    font-size: 0.15rem;
    color: #646566;
}
.nav-item::after{
  content: '>';
  margin: 0 0.0625rem;
}
.nav-item:last-child{    
    color: #222324;
    font-weight: bold;
}
.nav-item:last-child::after{    
    content: '';
    margin: 0;
}
</style>