<template>
  <div class="content">
     <nav_bar :navList="navList"></nav_bar>
    <transition name="fade">
        <div class="drawer-btn" @click="showClick" v-show="show2">路网方案 <i class="el-icon-arrow-up"></i> </div>
    </transition>
     <transition name="fade">
        <div class="drawer-div" v-show="show1">
            <div  class="drawer-btn2" @click="hideClick">路网方案 <i class="el-icon-arrow-down"></i> </div>
            <div class="box-content"> 
                <div class="flex-box box1">
                    
                </div>
                <div class="flex-box box2"></div>
                <div class="flex-box box3">
                     <div ref="barChart" class="bar-chart" style="width: 540px;height:250px" ></div>
                </div>
                <div class="flex-box box4">
                  <pie_chart-vue :pieData="pieData"></pie_chart-vue>
                </div>
            </div>
        </div>
     </transition>
  </div>
</template>

<script>
import nav_bar from '../../components/nav_bar.vue'
import pie_chartVue from './pie_chart.vue'
import * as echarts from 'echarts'
export default {
components:{
    nav_bar,
    pie_chartVue
},
data () {
    return{
        navList:['交通决策','路网方案'],
        drawer: false,
        show1:false,
        show2:true,
        yearList: ['2021','2033'],
        passengerNumList:['2000','1111'],
        //饼图数据
        pieData:{
            color : ['#1979FF','#EB7323'],  
        }

    }
},
mounted() {
    this.$nextTick(()=>{
        this.initBarChart()
     

    })
},
methods:{
    showClick(){
        this.show1=true
        this.show2=false
    },
    hideClick(){
        this.show2=true
        this.show1=false
    },
    initPieChart() {
        var pieChart = echarts.init(this.$refs.pieChart)
        var option = {
            color : ['#1979FF','#EB7323'],
             title: {
                text: '交通量对比',
                left: 'center'
            },
            tooltip: {
                trigger: 'item'
            },
            legend: {
                orient: 'vertical',
                x: 'right',
                y: 'center'
            },
            series: [
                {
                name: 'Access From',
                type: 'pie',
                radius: '50%',
                data: [
                    { value: 1048, name: '建设前' },
                    { value: 735, name: '建设后' }
                ],
                labelLine:{  //删除指示线
                    show:false
                },
                label:{
                    position: 'inner',
                    formatter: '{d}%',
                    fontSize: '10',
                },
                itemStyle: {
                    borderColor: '#fff',
                    borderWidth: 4
                },
              }
            ]
        }
            option && pieChart.setOption(option)
      },
    initBarChart() {
        var barChart = echarts.init(this.$refs.barChart)
        var option = {
        title: {
                text: '南京北站预计旅客发送量',
                left: 'center',
                textStyle: {
                    color: '#ffffff'
            }
        },
        xAxis: {
          type: 'category',
          data: this.yearList,
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
            data: this.passengerNumList,
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
                color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
                  { offset: 0, color: 'rgba(235, 115, 35,0.9600)' },
                  { offset: 1, color: 'rgba(235, 115, 35,0.1000)' }
                ]),
                barBorderRadius: [14, 14, 0, 0]
              }
            },
          }
        ]
      }
            option && barChart.setOption(option)
      }
}
}
</script>

<style lang="scss" scoped>

.drawer-div{
    width: 100%;
    height: 364px;
    padding: 24px 32px;
    background: rgba(255,255,255,0.9400);
    box-shadow: 0px -10px 20px 1px rgba(180,190,204,0.4000);
    border-radius: 40px 40px 0px 0px;
    position: absolute;
    bottom: 0;
    left: 0;
    .box-content{
    display: flex;
    justify-content: space-between;
    }
    .flex-box{
        height: 270px;
        background: rgba(255,255,255,0.9600);
        box-shadow: 0px 10px 20px 1px rgba(135,141,153,0.1000);
        border-radius: 12px 12px 12px 12px;
    }
    .box1{
        width: 436px;
    }
    .box2{
        width: 412px;
    }
    .box3{
    width: 564px;
    }
    .box4{
        width: 348px;
    }
    .drawer-btn2{
        text-align: center;
        cursor: pointer;
        font-weight: bold;
        color: #121924;
        margin-bottom: 20px;
    }
}
.drawer-btn{
    width: 174px;
    height: 40px;
    line-height: 40px;
    border-radius:40px 40px 0 0;
    background: rgba(255,255,255,0.9600);
    box-shadow: 0px -5px 10px 1px rgba(180,190,204,0.4000);
    position: absolute;
    bottom: 0;
    left: 45%;
    cursor: pointer;
    text-align: center;
}
.fade-enter-active, .fade-leave-active {
	transition: opacity .25s
 }
 .fade-enter, .fade-leave-to{
	opacity: 0
}
</style>