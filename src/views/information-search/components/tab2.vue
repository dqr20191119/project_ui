<template>
  <div class="content">
    <nav_barVue :navList="navList"></nav_barVue>
    <transition name="fade">
      <div class="chart-btn btn-div2" v-show="show2" @click="showClick1">
         <img src="~@/assets/images/arrow-right-b.png" class="arrow-right jt-icon"/>
      </div>
    </transition>
    <transition name="fade">
      <div class="pie-div" v-show="show1">
        <div class="chart-title-div">
          <div class="chart-title">
            <span class="title1">高峰小时交通吸引量：</span>
            <span class="title2">{{ totalAttractSum }}万人次/小时</span>
          </div>
          <div class="chart-title">
            <span class="title1">高峰小时交通发生量：</span>
            <span class="title2">{{ totalTrafficSum }}万人次/小时</span>
          </div>
        </div>
           <img src="~@/assets/images/arrow-left-b.png" class="arrow-left jt-icon"  @click="hideClick1"/>
        <div
          ref="pieChart"
          class="pie-chart"
          style="width: 580px; height: 350px"
        ></div>
      </div>
    </transition>
    <transition name="fade">
      <div class="chart-btn2 btn-div2" v-show="show4" @click="showClick2">
        <img src="~@/assets/images/arrow-left-b.png" class="arrow-left jt-icon"/>
      </div>
    </transition>
    <transition name="fade">
      <div class="bar-div" v-show="show3">
      <img src="~@/assets/images/arrow-right-b.png" class="arrow-right jt-icon"  @click="hideClick2"/>
        <div
          ref="barChart"
          class="bar-chart"
          style="width: 800px; height: 360px"
        ></div>
      </div>
    </transition>

    <div id="map" ref="map"></div>
  </div>
</template>

<script>
import 'ol/ol.css'
import Map from 'ol/Map'
import nav_barVue from '../../components/nav_bar.vue'
import * as echarts from 'echarts'
import View from 'ol/View'
import { transform } from 'ol/proj'
import TileLayer from 'ol/layer/Tile'
import XYZ from 'ol/source/XYZ'
import proj4 from 'proj4'
import { register } from 'ol/proj/proj4';
import { TileWMS } from 'ol/source'
import Overlay from 'ol/Overlay'

import * as olControl from 'ol/control'
import VectorSource from 'ol/source/Vector'
import VectorLayer from 'ol/layer/Vector'
import GeoJSON from 'ol/format/GeoJSON'
import request from '@/utils/request'

//
//const centerCordinate=[32.103162, 118.725493]
const centerCordinate = [656951.22378694, 3559639.26626369]
//坐标定义
proj4.defs("EPSG:4548", "+proj=tmerc +lat_0=0 +lon_0=117 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs");
register(proj4);
//地图初始化
const view = new View({
  center: transform(centerCordinate, 'EPSG:4548', 'EPSG:3857'),
  minZoom: 4,
  maxZoom: 18,
  zoom: 15 // 地图初始化的缩放级别
})

//高德地图图层
const gaodeMapLayer = new TileLayer({
  source: new XYZ({
    url: 'http://webst0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}'
  })
});

export default {
  components: {
    nav_barVue
  },
  data () {
    return {
      atractList: [],
      trafficList: [],
      totalAttractSum: 0,
      totalTrafficSum: 0,
      show1: true, //
      show2: false,
      show3: true, //
      show4: false,
      data: {
        data1: '1.50 万人次/小时',
        data2: '1.50 万人次/小时'
      },
      navList: ['信息查询', '集疏运信息', '集疏运交通'],
    }
  },
  mounted () {
    this.$nextTick(() => {
      //this.initPieChart(this)
      this.initBarChart()
      //查询交通吸引力量/发生量
      this.queryTrafficInfo();
      //初始化图层
      this.initMap();
      //添加线
      //addLine();


    })
  },
  methods: {

    queryTrafficInfo () {
      request({
        url: '/decision/trafficsummry/queryInfo',
        method: 'get'
      }).then(response => {

        var respData = response.data;
        if (!respData) {
          return;
        }


        //吸引量
        var attractResp = respData["01"];
        attractResp.forEach((item2) => {
          this.totalAttractSum = this.totalAttractSum + item2.passengerNum;
          this.atractList.push({
            name: item2.carTypeName,
            value: parseFloat(item2.passergerRation * 100).toFixed(2),
          })
        });

        //发生量
        var trafficResp = respData["02"];
        trafficResp.forEach((item3) => {
          this.totalTrafficSum = this.totalTrafficSum + item3.passengerNum;
          this.trafficList.push({
            name: item3.carTypeName,
            value: parseFloat(item3.passergerRation * 100).toFixed(2),
          })

        })
        this.initPieChart(this)



      });



    },


    // 初始化地图
    initMap () {
      const mapContainer = this.$refs.map
      //将图层加入Map
      const map = new Map({
        layers: [gaodeMapLayer],
        target: mapContainer,
        view: view
      });
      // 保存地图
      this.mapData = map
    },
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
    initPieChart (vueObje) {
      const attractData = vueObje.atractList
      const trafficData = vueObje.trafficList

      //   const data = [
      //     {
      //       name: '轨道交通',
      //       value: 70
      //     },
      //     {
      //       name: '长途客运',
      //       value: 68
      //     },
      //     {
      //       name: '公交',
      //       value: 48
      //     },
      //     {
      //       name: '团体车',
      //       value: 40
      //     },
      //     {
      //       name: '私家车',
      //       value: 32
      //     },
      //     {
      //       name: '出租车',
      //       value: 27
      //     },
      //     {
      //       name: '网约车',
      //       value: 18
      //     },
      //     {
      //       name: '其他',
      //       value: 18
      //     }
      //   ];
      var pieChart = echarts.init(this.$refs.pieChart)
      var option = {
        color: ['#1979FF', '#B9E617', '#66A6FF', '#FF7D26', '#0CE7F5', '#FFA800', '#FFDB00', '#FA5E4B'],
        title: [
          {
            text: '南京北站高峰小时交通吸引量&发生量占比',
            left: 'center'
          },
          {
            text: '吸引量',
            left: '24%',
            top: '46%',
            textAlign: 'center',
          },
          {
            text: '发生量',
            left: '74%',
            top: '46%',
            textAlign: 'center',
          }
        ],
        legend: {
          bottom: "10",
          textStyle: {
            color: '#646566',
          },
          icon: 'roundRect',
          data: attractData,
        },
        series: [
          {
            type: 'pie',
            radius: ['30%', '50%'],
            center: ['50%', '50%'],
            data: attractData,
            label: {
              normal: {
                show: true,
                formatter: "{c}%",
                textStyle: {
                  color: '#232324',
                },
                position: 'outside'
              },
              emphasis: {
                show: true
              }
            },
            itemStyle: {
              borderColor: '#fff',
              borderWidth: 5
            },
            left: 0,
            right: '50%',
            top: 0,
            bottom: 0
          },
          // 边框的设置  不用管
          {
            radius: ['30%', '38%'],
            center: ['50%', '50%'],
            type: 'pie',
            label: {
              normal: {
                show: false
              },
              emphasis: {
                show: false
              }
            },
            labelLine: {
              normal: {
                show: false
              },
              emphasis: {
                show: false
              }
            },
            animation: false,
            tooltip: {
              show: false
            },
            data: [{
              value: 1,
              itemStyle: {
                color: "rgba(250,250,250,0.3)",
              },
            }],
            left: 0,
            right: '50%',
            top: 0,
            bottom: 0
          },
          {
            type: 'pie',
            radius: ['30%', '50%'],
            center: ['50%', '50%'],
            data: trafficData,
            label: {
              normal: {
                show: true,
                formatter: "{c}%",
                textStyle: {
                  color: '#232324',
                },
                position: 'outside'
              },
              emphasis: {
                show: true
              }
            },
            itemStyle: {
              borderColor: '#fff',
              borderWidth: 5
            },
            left: '50%',
            right: 0,
            top: 0,
            bottom: 0
          },
          // 边框的设置  不用管
          {
            radius: ['30%', '38%'],
            center: ['50%', '50%'],
            type: 'pie',
            label: {
              normal: {
                show: false
              },
              emphasis: {
                show: false
              }
            },
            labelLine: {
              normal: {
                show: false
              },
              emphasis: {
                show: false
              }
            },
            animation: false,
            tooltip: {
              show: false
            },
            data: [{
              value: 1,
              itemStyle: {
                color: "rgba(250,250,250,0.3)",
              },
            }],
            left: '50%',
            right: 0,
            top: 0,
            bottom: 0
          },
        ]
      }
      option && pieChart.setOption(option)
    },
    initBarChart () {
      var charts = { // 按顺序排列从大到小
        cityList: ['江北新区', '栖霞', '江宁', '浦口', '鼓楼', '六合', '秦淮', '建邺', '雨花台', '溧水', '汊河新城', '玄武', '高淳'],
        cityData: [7500, 6200, 5700, 4200, 3500, 2400, 2200, 2100, 2000, 1700, 1500, 1400, 1300, 1200]
      }
      var top10CityList = charts.cityList
      var top10CityData = charts.cityData
      var color = ['#FF7D26', '#FFA800', '#0CE7F5', '#1979FF']
      var color1 = ['rgba(255, 125, 38, 0.4000)', 'rgba(255, 168, 0, 0.4000)', 'rgba(12, 231, 245, 0.4000)', 'rgba(25, 121, 255, 0.1000)']

      let lineY = []
      for (var i = 0; i < charts.cityList.length; i++) {
        var x = i
        if (x > 2) {
          x = 3
        }
        var data = {
          name: charts.cityList[i],
          color: color[x],
          value: top10CityData[i],
          itemStyle: {
            normal: {
              show: true,
              color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [{
                offset: 0,
                color: color[x]
              }, {
                offset: 1,
                color: color1[x]
              }], false),
              barBorderRadius: [14, 14, 0, 0]
            }
          }
        }

        lineY.push(data)
      }

      var barChart = echarts.init(this.$refs.barChart)
      var option = {
        title: {
          text: '交通分布方向',
          left: 'center'
        },
        tooltip: {
          trigger: 'item',
          formatter: (p) => {
            if (p.seriesName === 'total') {
              return ''
            }
            return `${p.name}<br/>${p.value}`
          }
        },
        grid: {
          left: '8%',
          bottom: '10%'
        },
        color: color,
        xAxis: {
          type: 'category',
          axisTick: {
            show: false,
            alignWithLabel: true
          },
          axisLine: {
            lineStyle: {
              color: "#EEF1F7",
            }
          },
          axisLabel: {
            textStyle: {
              color: '#121924',
              fontSize: 10
            }
          },
          data: top10CityList
        },
        yAxis: {
          axisTick: {
            show: false
          },
          axisLine: {
            show: false
          },
          splitLine: {
            lineStyle: {
              color: "#EEF1F7",
            }
          },
          axisLabel: {
            textStyle: {
              color: '#646566'
            }
          }
        },
        series: [{
          type: 'bar',
          barWidth: '20px',
          data: lineY,
          label: {
            normal: {
              show: true,
              position: 'top',
              formatter: '{c}%',
              textStyle: {
                color: function (param) {
                  return color[param.dataIndex];
                },
                fontSize: 12
              }
            }
          }
        }],
      }
      option && barChart.setOption(option)
    },
    // 绘制连线
    addLine () {
      let featureLine = new Feature({
        geometry: new LineString([
          [118.725493, 32.103162],
          [118.4643, 32.0238],
        ]),
      });
      let source = new VectorSource()
      source.addFeature(featureLine)
      let layer = new VectorLayer()
      layer.setSource(source)
      this.mapData.addLayer(layer)
    }


  }
}
</script>

<style lang="scss" scoped>
@import '~@/assets/styles/draws.scss';
.pie-div {
  width: 636px;
  height: 390px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0px 10px 20px 1px rgba(180, 190, 204, 0.4);
  border-radius: 12px;
  opacity: 1;
  position: absolute;
  z-index: 4;
  top: 100px;
  left: 32px;
  padding: 25px 20px;
  .chart-title-div {
    display: flex;
    justify-content: space-between;
    z-index: 3;
    position: absolute;
    top: 62px;
    width: 94%;
    .chart-title {
      span {
        font-size: 14px;
      }
      .title1 {
        color: #646566;
      }
      .title2 {
        color: #333233;
      }
    }
  }
}
.bar-div {
  width: 830px;
  height: 390px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0px 10px 20px 1px rgba(180, 190, 204, 0.4);
  border-radius: 12px;
  opacity: 1;
  position: absolute;
  bottom: 32px;
  right: 32px;
  padding: 25px 20px;
  z-index: 4;
}
.btn-div2 {
  width: 48px;
  height: 40px;
  text-align: center;
  line-height: 40px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0px 10px 20px 1px rgba(180, 190, 204, 0.4);
  border-radius: 8px 8px 8px 8px;
  z-index: 4;
}
.chart-btn {
  top: 100px;
  left: 32px;
  position: absolute;
  .el-icon-d-arrow-right {
    color: #939699;
  }
}
.chart-btn2 {
  bottom: 32px;
  right: 32px;
  position: absolute;
}

</style>