<template>
  <div>
    <div ref="barChart2" class="bar-chart"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
var barColor = [];
export default {
  props: {
    barData: {
      type: Object,
      default: () => {
        return undefined
      }
    }
  },
  watch: {
    barData: {
      handler (newValue, oldValue) {
        if (newValue) {
          this.initBarChart()
        }
      }, deep: true
    }
  },
  data () {
    return {
      lenged: [],
      data: []
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.initBarChart()
    })
  },
  methods: {
    initBarChart () {
      this.barData.tableData.forEach(e => {
        this.lenged.push(e.label)
        this.data.push(e.value)
        if (e.colors == null) {
          e.color = ['rgba(25, 121, 255, 1)', 'rgba(25, 121, 255,0.1000)']
        }
        barColor.push(e.colors)
      });
      var barChart = echarts.init(this.$refs.barChart2)
      var option = {
        title: {
          text: this.barData.title,
          left: 'center',
          textStyle: {
            color: '#323233',
            fontSize: 16
          }
        },
        xAxis: {
          type: 'category',
          axisTick: {
            show: false,
          },
          axisLabel: {
            textStyle: {
              color: '#323233'
            },
            interval: 0,
            formatter: function (val) {
              var strs = val.split(''); //字符串数组
              var str = ''
              for (var i = 0, s; s = strs[i++];) { //遍历字符串数组
                str += s;
                if (!(i % 4)) str += '\n'; //按需要求余
              }
              return str
            }
          },
          data: this.lenged,
          axisLine: {
            show: true,
            lineStyle: {
              color: "#E2E5EB",
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
              color: '#323233'
            }
          },
          splitLine: {
            lineStyle: {
              color: '#E2E5EB'
            }
          }
        },
        series: [
          {
            data: this.data,
            type: 'bar',
            //柱图宽度
            barWidth: 12,
            itemStyle: {
              normal: {
                //柱图颜色
                color: function (params) {
                  var colorItem = barColor[params.dataIndex];
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
                barBorderRadius: [90, 90, 0, 0]
              }
            },
          },
        ]
      }
      option && barChart.setOption(option)
    }
  }
}
</script>

<style scoped>
.bar-chart {
  width: 6.75rem;
  height: 3.125rem;
}
</style>