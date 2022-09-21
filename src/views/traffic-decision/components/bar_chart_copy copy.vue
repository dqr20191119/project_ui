<template>
  <div>
     <div ref="barChart2" class="bar-chart" style="width: 940px;height:250px" ></div>
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
        const baseData = [{
            value: '朱家山河路',
            children: [
              { value: '东往西', num: 1233 },
              { value: '西往东', num: 983 },
            ]
          },{
            value: '北站快速路',
            children: [
              { value: '东往西', num: 2544 },
              { value: '西往东', num: 3211 }
            ]
          },{
            value: '站南一路',
            children: [
              { value: '东往西', num: 5444 },
              { value: '西往东', num: 7032 },
            ]
          },{
            value: '站南二路',
            children: [
              { value: '东往西', num: 1456 },
              { value: '西往东', num: 3456 },
            ]
          },{
            value: '林杨二交',
            children: [
              { value: '南向西', num: 5700 },
              { value: '西向南', num: 4233 }
            ]
          }]
          const title='地面进场（有东侧匝道）'
          const dLength = baseData.map(item => item.children.length).reduce((n, m) => n + m) // x轴数据总长度，用于计算父级x轴的宽度
          let xData = []
          let yData = []
          let series = [{
            data: yData,
            type: 'bar',
            barWidth: '32',
            label: {
              show: true,
              position: 'top',
              textStyle: {
                color: '#555'
              }
            },
            itemStyle: {
              color: (params) => {
                return colorBg(params.dataIndex)
              },
                barBorderRadius: [16, 16, 0, 0]
            },
            xAxisIndex: 0,
            yAxisIndex: 0
          }]
          let baseObj = {
            data: [{
              name: '',
              value: 1
            }],
            label: {
              show: true,
              position: 'inside',
              formatter: '{b}',
              offset: [0, 10],
              textStyle: {
                color: '#666'
              }
            },
            type: 'bar',
            barGap: 0,
            barWidth: '',
            itemStyle: {
              normal: {
                    color: '#ffffff'
              }
            },
            animationEasing: 'bounceOut',
            xAxisIndex: 1,
            yAxisIndex: 1
          }
          baseData.forEach((item, index) => {
            let pObj = JSON.parse(JSON.stringify(baseObj))
            pObj.data[0].name = item.value
            pObj.barWidth = item.children.length / dLength* 100 + '%'
            pObj.itemStyle.color = colorBg(index)
            series.push(pObj)
            item.children.forEach(cItem => {
              xData.push({
                value: cItem.value,
                pName: item.value
              })
              yData.push(cItem.num)
            })
          })

          function colorBg(index) {
            const colors = ['#4150d8', '#28bf7e', '#ed7c2f', '#f2a93b', '#f9cf36', '#4a5bdc', '#4cd698', '#f4914e','#b6c2ff', '#96edc1']
            return colors[index]
          }

          barChart.setOption({
            title: {
                text: title,
                left: 'center',
                textStyle: {
                    color: '#323233',
                    fontSize:16
            }
        },
            tooltip: {
              trigger: 'axis',
              axisPointer: {
                type: 'shadow'
              }
            },
            grid: [{
                top: 40,
                bottom: 51
              },{
                height: 50,
                bottom: 0,
                tooltip: { show: false }
            }],
            xAxis: [{
              type: 'category',
              data: xData,
              gridIndex: 0,
              axisLabel: {
                color: '#333',
              },
              axisLine: {
                lineStyle: {
                  color: '#e7e7e7'
                }
              },
              axisTick: {
                lineStyle: {
                  color: '#e7e7e7'
                }
              },
              zlevel: 2
            }, {
              type: 'category',
              gridIndex: 1,
              axisLine: { show: false },
              axisLabel: { show: false },
              axisTick: { show: false },
              zlevel: 1
            }],
            yAxis: [{
              type: 'value',
              gridIndex: 0,
              axisLabel: {
                color: '#333'
              },
              splitLine: {
                lineStyle: {
                  color: '#E2E5EB'
                }
              },
              axisLine: {
                show:false
              },
              axisTick: {
                lineStyle: {
                  color: '#E2E5EB'
                }
              }
            },{
              type: 'value',
              gridIndex: 1,
              axisLabel: { show: false },
              axisLine: { show: false },
              splitLine: { show: false },
              axisTick: { show: false }
            }],
            series
})
        }
    }
}
</script>

<style>

</style>