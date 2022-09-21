<template>
  <div>
    <div ref="pieChart" class="pie-chart"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
export default {
  props: {
    pieData: {
      type: Object,
      default: () => {
        return undefined
      }
    }
  },
  watch: {
  },
  data () {
    return {
      data: [],
      pieColor: []
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.initPieChart()
    })
  },
  methods: {
    initPieChart () {
      this.pieData.tableData.forEach(e => {
        this.data.push(
          { value: e.value, name: e.label },
        )
        this.pieColor.push(e.colors)
      });
      var pieChart = echarts.init(this.$refs.pieChart)
      var option = {
        color: this.pieColor,
        title: {
          text: this.pieData.title,
          left: 'center',
          textStyle: {
            color: '#323233',
            fontSize: 16
          }
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
            name: this.pieData.name,
            type: 'pie',
            radius: '50%',
            data: this.data,
            labelLine: {  //删除指示线
              // show:false
            },
            label: {
              // position: 'inner',
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
  }
}
</script>

<style scoped>
.pie-chart {
  width: 6.25rem;
  height: 3.125rem;
}
</style>