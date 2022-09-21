<template>
  <div>
     <div ref="barChart2" class="bar-chart"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
export default {
    props:{
      barData: {
        type: Object,
        default: () => {
          return undefined
        }
      }
    },
    watch: {
      barData: {
        handler(newValue, oldValue) {
          if (newValue) {
           this.initBarChart()
          }
        }, deep: true
      }
    },
    data(){
        return{

        }
    },
    mounted(){
        this.$nextTick(()=>{
             this.initBarChart()
        })
    },
    methods:{
        initBarChart() {
        var barChart = echarts.init(this.$refs.barChart2)
        var grid=[];
        var zhu=[];
        var legend=[];
        var xAxis = [];
        var yAxis = [];
        var series = [];
        var  category=[];
        var barColor=[];
        var datas=[];
        this.barData.tableData.map(function(e,i){
       
       zhu.push(e.label)
       e.children.map(function(v,j){
           datas.push({
               value:v.value,
               name:v.label,
           })
          });
       });
       this.barData.tableData[0].children.forEach(s=>{
            barColor.push(s.colors)
            category.push(s.label)
            series.push({
            name:s.label,
            type: 'bar',
            label: {
              show: true,
              position: 'top',
              textStyle: {
                color: '#555'
              }
            },
            barWidth: 22, //柱子宽度
            barGap: 0.7, //柱子之间间距
            itemStyle: {
              normal: {
                //柱图颜色
                color: function (params) {
                      var colorItem = s.colors;
                      return new echarts.graphic.LinearGradient(0, 0, 1, 1, [{
                              offset: 0,
                              color: colorItem[0]
                          },
                          {
                              offset: 1,
                              color: colorItem[1]
                          }
                      ], false);
                  },
               
              }
            },
            data: datas
            });
        })

       
        legend.push({
            data:category,
            bottom:0,
            textStyle: {
                color: "#333",
                fontSize: 14,
                fontWeight: 200
            },
            itemWidth: 14,
            itemHeight: 14,
            itemGap: 35
        }),
        grid.push({
            left: '0',
            right: '0',
            bottom: '18%',
            top: '15%',
            containLabel: true
        });
        xAxis.push({
            type: 'category',
            offset: 10,
            data: zhu,
            axisLine: {
                show: false
            },
            axisTick: {
                show: false
            },
            axisLabel: {
                show: true,
                textStyle: {
                    color: "#333",
                    fontSize: 16,
                    fontWeight: 200
                }
            },
        });
        yAxis.push({
            type: 'value',
            axisLabel: {
            
            },
            axisTick: {
                show: false
            },
            axisLine: {
                show: false
            },
            splitLine: {
            lineStyle: {
                color: '#e7e7e7'
            }
            }
        });
      
          var option = {
            color:barColor,
            title: {
            left: 'center',
            text: this.barData.title,
            textStyle: {
                color: '#323233',
                fontSize:16
            }
          },
            tooltip: {
              trigger: "axis",
              padding: [8, 10],
              backgroundColor: 'rgba(0,0,0,0.5)',
              axisPointer: {
                  type: "shadow",
                  textStyle: {
                      color: "#fff"
                  }
              }
            },
            legend:legend,
            grid: grid,
            label: {
              show: false,
          },
            xAxis: xAxis,
            yAxis: yAxis,
            series: series
            }
            option && barChart.setOption(option)
        }
    }
}
</script>

<style scoped>
.bar-chart{
    width: 9.25rem;
    height:3.125rem
}
</style>