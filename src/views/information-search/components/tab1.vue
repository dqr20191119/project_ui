<template>
  <div class="container">
    <nav_bar_opacity :navList="navList"></nav_bar_opacity>
    <transition name="fade">
      <div class="cover-btn btn-div" v-show="show2" @click="showClick1">
        <img src="~@/assets/images/snxx_left_arrow.png" class="arrow-right jt-icon"/>
      </div>
    </transition>

    <transition name="fade">
      <div class="cover" v-show="show1">
        <div @click="hideClick1" class="arrow-left jt-icon"> </div>
        <div class="cover-div">
          <div class="cover-title">
            {{ data.title }}
          </div>
          <div class="cover-info">
            {{ data.info1 }}
          </div>
        </div>
      </div>
    </transition>

    <transition name="fade">
      <div class="cover-btn2 btn-div" v-show="show4" @click="showClick2">
         <img src="~@/assets/images/snxx_right_arrow.png" class="arrow-left jt-icon"/>
      </div>
    </transition>
    <transition name="fade">
      <div class="cover-map" v-show="show3">
        <img src="~@/assets/images/arrow-right.png" class="arrow-right jt-icon" @click="hideClick2"/>
        <div
          ref="chart"
          class="bar-chart"
          style="width: 52s0px; height: 380px"
        ></div>
      </div>
    </transition>
  </div>
</template>
<script>
import * as echarts from 'echarts'
import nav_bar_opacity from '../../components/nav_bar_opacity.vue'
import request from '@/utils/request'
export default {
  name: "Index",
  data () {
    return {
      navList: ['信息查询', '集疏运信息', '枢纽基本信息'],
      yearList: [],
      passengerNumList: [],
      show1: true, //
      show2: false,
      show3: true, //
      show4: false,
      data: {
        title: '南京北站',
        info1: '南京北站车站为高架站，三场布置形式，自北向南依次为沿江高铁车场、宁淮-宁蚌城际车场和普速车场。车站总规模为3场16台30线，其中沿江高铁车场规模为5台9线，宁淮-宁蚌车场规模为6台12线，规划普速车场规模为5台9线。南京北站旅客发送量在2035年、2040年、2050年预计分别达到2900万人次、3400万人次和3650万人次。',
      }
    }
  },
  watch: {

  },
  components: {
    nav_bar_opacity
  },
  mounted () {
    this.$nextTick(() => {

      //初始化柱状图信息
      this.initBarChartInfo();


    })
  },
  methods: {
    // 显示隐藏
    hideClick1 () {
      this.show1 = false
      this.show2 = true
    },
    showClick1 () {
      this.show1 = true
      this.show2 = false
    },
    hideClick2 () {
      this.show3 = false
      this.show4 = true
    },
    showClick2 () {
      this.show3 = true
      this.show4 = false
    },
    initBarChartInfo () {
      request({
        url: '/decision/hubbasicinfo/queryInfo',
        method: 'get'
      }).then(response => {
        var respData = response.data;
        if (!respData) {
          return;
        }
        respData.forEach((item) => {
          this.yearList.push(item.staticYear);
          this.passengerNumList.push(item.passengerNum);
        })

        this.initChartOption(this);

      });

    },
    initChartOption (vueObj) {
      var myChart = echarts.init(this.$refs.chart)
      var option = {
        title: {
          text: '南京北站预计旅客发送量',
          left: '0',
          textStyle: {
            color: '#ffffff'
          }
        },
        grid: {
              left: '0',
              right: '0',
              bottom: '0',
              top: '20%',
              containLabel: true
          },
        xAxis: {
          type: 'category',
          data: vueObj.yearList,
          axisTick: {
            show: false
          },
          axisLabel: {
            textStyle: {
              color: '#ffffff'
            }
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: "#fff",
            }
          }
        },
        yAxis: {
          type: 'value',
          axisTick: {
            show: false  //坐标轴刻度线
          },
          axisLine: {
            show: false
          },
          axisLabel: {
            textStyle: {
              color: '#ffffff'
            }
          }
        },
        series: [
          {
            data: vueObj.passengerNumList,
            type: 'bar',
            barWidth: 26,
            label: {
              show: true,
              position: "top",
              valueAnimation: true,
              textStyle: {
                fontSize: 10,
                color: '#FFFFFF'
              }
            },
            itemStyle: {
              normal: {
                //柱图颜色
                color: function (params) {
                      console.log(params);
                      var colorList = [
                          ['rgba(25, 121, 255, 1)', 'rgba(25, 121, 255,0.1000)'],
                          ['rgba(12, 231, 245, 1)', 'rgba(12, 231, 245,0.1000)'],
                          ['rgba(235, 115, 35,0.9600)', 'rgba(235, 115, 35,0.1000)']
                      ];

                      var colorItem = colorList[params.dataIndex];
                      return new echarts.graphic.LinearGradient(1, 0, 0, 1, [{
                              offset: 0,
                              color: colorItem[0]
                          },
                          {
                              offset: 1,
                              color: colorItem[1]
                          }
                      ], false);
                  },
                barBorderRadius: [14, 14, 0, 0]
              }
            },
          }
        ]
      }
      option && myChart.setOption(option)
    }
  }

}
</script>

<style scoped lang="scss">
@import '~@/assets/styles/draws.scss';
.container {
  width: 100%;
  height: 900px;
  position: relative;
  background: url(~@/assets/images/hinge_bg.png) no-repeat;
  background-size: cover;
}
.el-carousel__item h3 {
  color: #475669;
  font-size: 18px;
  opacity: 0.75;
  line-height: 300px;
  margin: 0;
}
.cover {
  position: absolute;
  width: 428px;
  height: 370px;
  background: url(~@/assets/images/snxx_left_bg.png) no-repeat;
  background-size: 100% 100%;
  top: 112px;
  left: 32px;
  .cover-div {
    color: #ffffff;
    line-height: 36px;
    font-size: 16px;
    padding: 25px 20px;
    z-index: 2;
    .cover-title {
      text-align: left;
      font-size: 0.225rem;
      position: relative;
      height: 0.75rem;
      line-height: 0.55rem;
      position: relative;
    }
    .cover-info {
      line-height: 0.4rem;
      font-size: 0.2rem;
      overflow-y: auto;
      text-indent: 0.45rem
    }
  }
}
.cover-map {
  position: absolute;
  width: 524px;
  height: 384px;
  background: url(~@/assets/images/snxx_right_bg.png) no-repeat;
  background-size: 100% 100%;
  bottom: 40px;
  right: 32px;
  padding: 25px 20px;
  z-index: 2;

}
.cover-btn {
  top: 100px;
  left: 32px;
  position: absolute;
}
.cover-btn2 {
  bottom: 32px;
  right: 32px;
  position: absolute;
}
</style>