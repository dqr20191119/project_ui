<template>
  <div id="map" ref="map" style="height: 2000px">
    <!--点击查看详情弹框-->
    <div id="popup" class="ol-popup">
      <a
        href="#"
        id="popup-closer"
        class="ol-popup-closer"
        @click="removePopup"
      />
      <div id="popup-content"></div>
    </div>
    <!--道路选择器-->
    <div id="pop-road-selector" class="ol-layer">
      <div class="road-selector-pop">
        <div class="road-selector-nav">显示道路</div>

        <div ref="roadTypeColorDiv" class="road-selector-color">
          <div>
            <div style="float: left">
              <input
                type="checkbox"
                name="roadType"
                value="快速路"
                @click="checkRoadType($event)"
              /><label class="roadTypelabel">快速路</label>
            </div>
            <div class="roadTypebox lightGreen"></div>
          </div>

          <div style="float: left">
            <div style="float: left">
              <input
                type="checkbox"
                name="roadType"
                value="主干路"
                @click="checkRoadType($event)"
              /><label class="roadTypelabel">主干路</label>
            </div>
            <div class="roadTypebox lightYellow"></div>
          </div>

          <div style="float: left">
            <div style="float: left">
              <input
                type="checkbox"
                name="roadType"
                value="次干路"
                @click="checkRoadType($event)"
              /><label class="roadTypelabel">次干路</label>
            </div>
            <div class="roadTypebox lightRed"></div>
          </div>

          <div style="float: left">
            <div style="float: left">
              <input
                type="checkbox"
                name="roadType"
                value="支路"
                @click="checkRoadType($event)"
              />
              <label class="roadTypelabel">支路</label>
            </div>
            <div class="roadTypebox blue"></div>
          </div>
        </div>
      </div>
    </div>

    <!--总体信息浮动框-->
    <div id="pop-summry" class="ol-layer">
      <!--总体信息控制图层(上)-->
      <div class="pop-summry-control">
        <div>
          <div class="pop-summry-control-title">总体信息</div>
          <div class="control-display-div">
            <a href="#" @click="showSummryPop" style="display: none">>></a>
            <a
              href="#"
              id="hideSummryLink"
              class="ol-popsummry-link_hide"
              @click="hideSummryPop"
              >>></a
            >
          </div>
        </div>
      </div>
      <!--总体信息表格-->
      <div>
        <div>
          <table class="ol-popsummry-detail-table" id="roadSummryTable">
            <tr>
              <th>跨网合计（km）</th>
              <td id="gridTotalLength"></td>
            </tr>
            <tr>
              <th>片区面积（km²）</th>
              <td id="sectionArea"></td>
            </tr>
            <tr>
              <th>跨网密度（km/km²）</th>
              <td id="networkDensity"></td>
            </tr>
            <tr>
              <th>快速路（km）</th>
              <td id="highRoadNum"></td>
            </tr>
            <tr>
              <th>主干路（km）</th>
              <td id="mainRoadNum"></td>
            </tr>
            <tr>
              <th>次干路（km）</th>
              <td id="subRoadNum"></td>
            </tr>
            <tr>
              <th>支路（km）</th>
              <td id="branchRoadNum"></td>
            </tr>
          </table>
        </div>
        <!--道路长度柱状图标-->
        <div class="ol-road-chart-div">
          <div id="roadLengChart" :style="myChartStyle"></div>
        </div>
        <!--道路长度柱状图标-->
        <div class="ol-road-chart-div">
          <div id="roadRationChart" :style="myChartStyle"></div>
        </div>
      </div>
    </div>

    <!--总体信息折叠控制层-->
    <div id="pop-summry—collapse" class="ol-layer">
      <div class="pop-summry-control">
        <div>
          <div class="pop-summry-control-title">总体信息</div>
          <div class="control-display-div">
            <a href="#" @click="showSummryPop">>></a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import 'ol/ol.css'
import Map from 'ol/Map'
import * as olControl from 'ol/control'
import View from 'ol/View'
import { getWidth, getCenter } from 'ol/extent'
import TileLayer from 'ol/layer/Tile'
import WMTS from 'ol/source/WMTS'
import XYZ from 'ol/source/XYZ'
import WMTSTileGrid from 'ol/tilegrid/WMTS'
import Projection from 'ol/proj/Projection'
import { transform } from 'ol/proj'
import proj4 from 'proj4'
import { register } from 'ol/proj/proj4';
import VectorSource from 'ol/source/Vector'
import VectorLayer from 'ol/layer/Vector'
import Feature from 'ol/Feature'
import { Draw } from 'ol/interaction'
import { Style, Circle, Stroke, Fill } from 'ol/src/style'
import WKT from 'ol/format/WKT'
import GeoJSON from 'ol/format/GeoJSON'
import Overlay from 'ol/Overlay'
import * as echarts from "echarts";
import axios from 'axios'
import request from '@/utils/request'
import Vue from 'vue'
//中心坐标
//const centerCordinate = [118.659, 32.165];
//const centerCordinate = [656951.22378694, 3560739.26626369]

const centerCordinate = [656951.22378694, 3549039.26626369]
//是否展示总体信息标识
var showSummryFlag = true;
// 道路类型图例常量
const roadType = ['快速路', '主干路', '次干路', '支路'];
const roadTypeColor = ['#00c297', '#ffff80', '#d9001b', '#0000ff'];
var vectorLayer;
//地图初始化
proj4.defs("EPSG:4548", "+proj=tmerc +lat_0=0 +lon_0=117 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs");
register(proj4);

const view = new View({
  //center: transform(centerCordinate, 'EPSG:4326', 'EPSG:3857'),
  center: transform(centerCordinate, 'EPSG:4548', 'EPSG:3857'),
  minZoom: 4,
  maxZoom: 18,
  zoom: 13 // 地图初始化的缩放级别
})


//高德地图图层
const gaodeMapLayer = new TileLayer({
  source: new XYZ({
    url: 'http://webst0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}'
  })
});

//天地图底图
const tdMapLayer = new TileLayer({
  source: new XYZ({
    url: 'http://t4.tianditu.com/DataServer?T=vec_w&tk=b9031f80391e6b65bd1dd80dcde1b097&x={x}&y={y}&l={z}'
  })
});

//中国彩色地图
const colorLayer = new TileLayer({
  source: new XYZ({
    url: 'http://cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnlineCommunity/MapServer/tile/{z}/{y}/{x}'
  })
});


export default {
  name: "Road",
  data () {
    return {
      geoJsonList: {},
      roadBasicInfo: {},
      myChart: {},
      // sortData: [], //动态排序数据
      myChartStyle: {
        width: "100%", height: "240px", display: "inline-block"
      },
      roadChartOption: {
        title: {
          text: '北站片区各类型道路总长度(km)',
          textStyle: {
            color: '#828282',
            fontSize: 13,
            fontWeight: 'normal'
          },
          x: 'center',
          y: '4px',

        },
        xAxis: {
          max: "dataMax",
          //坐标轴刻度线
          axisTick: {
            show: false
          },
          //轴线
          axisLine: {
            show: false
          },
          axisLabel: {//修改坐标系字体颜色
            show: true,
            textStyle: {
              color: "#828282",
              fontSize: 10
            }
          },

        },
        yAxis: {
          type: "category",
          data: ["支路", "次干路", "主干路", "快速路"],
          axisTick: {
            show: false  //坐标轴刻度线
          },
          axisLabel: {//修改坐标系字体颜色
            show: true,
            textStyle: {
              color: "#828282",
              fontSize: 10
            }
          },
          axisLine: {//y轴线的颜色以及宽度
            show: true,
            lineStyle: {
              color: "#DEDEDE",

            },
          },

        },
        series: [
          {
            //  name: "北站片区各类型道路总长度(km)",
            type: "bar",
            data: [],
            label: {
              show: true,
              position: "right",
              valueAnimation: true,
              textStyle: {
                fontSize: 10,
                color: 'black'
              }
            },
            //柱图宽度
            barWidth: 12,
            itemStyle: {
              normal: {
                //柱图颜色
                color: '#5D9CD5'
              }
            },
          }

        ],
        legend: {

        },
        grid: {
          left: '2%',
          top: '35px',
          containLabel: true,
          backgroundColor: 'green',
          borderWidth: 1,
          borderColor: '#ccc'
        },
      }
    }
  },
  mounted () {
    this.getRoadGeoJson(this);
    this.getRoadInfo(this)
    //初始化道路速度统计图表
    // this.myChart = echarts.init(document.getElementById("roadLengChart"));
    // this.myChart.setOption(this.roadChartOption);
    //初始化道路占比图表
    //this.initRoadRationChart();

    var popSummry = document.getElementById('pop-summry')
    popSummry.addEventListener("webkitAnimationEnd", function () {
      if (!showSummryFlag) {
        document.getElementById('pop-summry—collapse').style.display = 'block';
      }
    })

    popSummry.addEventListener("animationend", function () {
      if (!showSummryFlag) {
        document.getElementById('pop-summry—collapse').style.display = 'block';
      }
    })


  },



  methods: {
    // 初始化地图
    initMap () {
      const mapContainer = this.$refs.map
      const FullScreen = new olControl.FullScreen() // 全屏控件
      //自定义图层数据源
      const vectorSource = new VectorSource({
        features: (new GeoJSON({ featureProjection: 'EPSG:3857', dataProjection: 'EPSG:4548' })).readFeatures(this.geoJsonList)
      });

      //使用数据源和显示方法构建图层
      vectorLayer = new VectorLayer({
        source: vectorSource,
        style: new Style({
          stroke: new Stroke({
            color: 'red',
            width: 1,
          }),
        })
      });
      const map = new Map({
        layers: [colorLayer, vectorLayer],
        target: mapContainer,
        view: view
      });
      // 添加鼠标点击事件
      map.on('click', this.mapClick);
      // 保存地图
      this.mapData = map
    },

    getRoadGeoJson: async function (vueObject) {
      try {
        // let url = "http://localhost:8080/geoserver/Test/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Test%3Aroad0714_view&maxFeatures=500000000&outputFormat=application%2Fjson";
        // let url = "http://106.14.106.138:7770/geoserver/Test/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Test%3Alines_view&maxFeatures=500000000&outputFormat=application%2Fjson";
        let url = "http://106.14.106.138:7770/geoserver/Test/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Test%3ARoad_lines&maxFeatures=500000000&outputFormat=application%2Fjson";
        await axios.get(url, null).then(function (res) {
          vueObject.geoJsonList = res.data;
          // 调用初始化图层信息
          vueObject.initMap();
        });
      } catch (error) {

      }
    },

    initRoadRationChart (respData) {
      var rationData = [                  //每个模块的名字和值
        { name: '支路', value: respData.branchRoadNum },
        { name: '次干路', value: respData.subRoadNum },
        { name: '主干路', value: respData.mainRoadNum },
        { name: '快速路', value: respData.highRoadNum }
      ];
      // 绘制图表
      var roadRationChart = echarts.init(document.getElementById('roadRationChart'))
      // 指定图表的配置项和数据
      var option = {
        //标题
        title: {
          text: '北站片区各类型道路占比',
          x: 'center',
          y: '4px',          //标题位置
          textStyle: { //标题内容的样式
            color: '#828282',
            fontWeight: 'normal',
            fontSize: 13
          },
        },
        // stillShowZeroSum: true,
        //鼠标划过时饼状图上显示的数据
        tooltip: {
          trigger: 'item',
          formatter: '{a}<br/>{b}:{c} ({d}%)'
        },
        //图例
        legend: {//图例  标注各种颜色代表的模块
          orient: 'vertical',//图例的显示方式  默认横向显示
          left: 'left',//控制图例的位置
          // itemWidth: 16,//图例颜色块的宽度和高度
          // itemHeight: 12,
          textStyle: {//图例中文字的样式
            color: '#000',
            fontSize: 10
          },
          data: ['支路', '次干路', '主干路', '快速路']//图例上显示的饼图各模块上的名字
        },
        //饼图中各模块的颜色
        color: ['#5B9BD5', '#ED7D31', '#A5A5A5', '#FFC000'],
        // 饼图数据
        series: {
          // name: 'bug分布',
          type: 'pie',             //echarts图的类型   pie代表饼图
          radius: '40%',           //饼图中饼状部分的大小所占整个父元素的百分比
          center: ['50%', '50%'],  //整个饼图在整个父元素中的位置
          data: rationData,
          itemStyle: {
            normal: {
              label: {
                show: true,//饼图上是否出现标注文字 标注各模块代表什么  默认是true
                // position: 'inner',//控制饼图上标注文字相对于饼图的位置  默认位置在饼图外
              },
              labelLine: {
                show: true//官网demo里外部标注上的小细线的显示隐藏    默认显示
              }
            }
          },

        }

      }
      // 使用刚指定的配置项和数据显示图表。
      roadRationChart.setOption(option)
    },

    //加载道路总体信息
    getRoadInfo: function (vueObject) {
      request({
        url: '/rdsummry/info/queryInfo',
        method: 'get'
      }).then(response => {
        var respData = response.data;
        //初始化表格
        document.getElementById("gridTotalLength").innerHTML = respData.gridTotalLength;
        document.getElementById("sectionArea").innerHTML = respData.sectionArea;
        document.getElementById("networkDensity").innerHTML = respData.networkDensity;
        document.getElementById("highRoadNum").innerHTML = respData.highRoadNum;
        document.getElementById("mainRoadNum").innerHTML = respData.mainRoadNum;
        document.getElementById("subRoadNum").innerHTML = respData.subRoadNum;
        document.getElementById("branchRoadNum").innerHTML = respData.branchRoadNum;

        //初始化柱状图
        this.myChart = echarts.init(document.getElementById("roadLengChart"));
        this.roadChartOption.series[0].data = [respData.highRoadNum, respData.mainRoadNum, respData.subRoadNum, respData.branchRoadNum]
        this.myChart.setOption(this.roadChartOption);

        //初始化饼图
        vueObject.initRoadRationChart(respData);
      });
    },

    // 弹出框
    addPopup (coordinate, feature) {
      this.removePopup()
      // 获取弹出层DOM
      let container = document.getElementById('popup')
      let content = document.getElementById('popup-content')
      if (this.overlay) {
      } else {
        // 创建Overlay弹出层绑定DOM
        this.overlay = new Overlay({
          element: container,
          autoPan: {
            animation: {
              duration: 250
            }
          }
        })
        // 添加到map
        this.mapData.addOverlay(this.overlay)
      }
      // 弹出层内容
      // let layer = feature.get('layer');
      let layer = feature.get('LAYER');

      content.innerHTML = `
                      <div style='color:white;background-color:#169BD5;font-weight: bold;width:100%;z-index:4;height:30px;padding:6px;font-size: 15px'>`+ layer + `</div>
                      <table style='font-size: 10px'>
                        <tr>
                          <td class='poptable-th'>等级：</td>
                          <td>`+ layer + `</td>
                        </tr>
                        <tr>
                          <td class='poptable-th'>长度：</td>
                          <td>1232.32m</td>
                        </tr>
                        <tr>
                          <td class='poptable-th'>车道规模：</td>
                          <td>4</td>
                        </tr>
                        <tr>
                          <td class='poptable-th'>图层：</td>
                          <td>次干路36</td>
                        </tr>
                        <tr>
                          <td class='poptable-th'>同行能力：</td>
                          <td>1700</td>
                        </tr>
                        <tr>
                          <td class='poptable-th'>速度：</td>
                          <td>40</td>
                        </tr>
                        <tr>
                          <td class='poptable-th'>A-B流量：</td>
                          <td>40</td>
                        </tr>
                        <tr>
                          <td class='poptable-th'>B-A流量：</th>
                          <td>40</td>
                        </tr>
                        <tr>
                          <td class='poptable-th'>建设情况：</td>
                          <td>建成使用</td>
                        </tr>
                      </table>
                      `
      // 设置弹出层位置即可出现
      this.overlay.setPosition(coordinate)
    },

    // 清除弹出框
    removePopup () {
      if (this.overlay) {
        // 设置位置undefined可达到隐藏清除弹出框
        this.overlay.setPosition(undefined)
      }
    },


    showSummryPop () {
      showSummryFlag = true;
      document.getElementById('pop-summry—collapse').style.display = 'none';
      document.getElementById('pop-summry').classList.remove('popsummry-down-animation')
      document.getElementById('pop-summry').classList.remove('popsummry-up-animation')
      document.getElementById('pop-summry').style.bottom = '-250px'
      document.getElementById('pop-summry').classList.add('popsummry-up-animation')
      document.getElementById('hideSummryLink').style.right = '60px'

    },

    hideSummryPop () {
      showSummryFlag = false;
      //重置，否则动画效果只触发一次
      document.getElementById('pop-summry').style.bottom = '0px'
      document.getElementById('pop-summry').classList.remove('popsummry-down-animation')
      document.getElementById('pop-summry').classList.remove('popsummry-up-animation')
      document.getElementById('pop-summry').classList.add('popsummry-down-animation');
    },

    checkRoadType (e) {
      let checkArray = [];
      let elements = document.getElementsByName('roadType');
      for (var i = 0; i < elements.length; i++) {
        if (elements[i].checked) {
          checkArray.push(elements[i].value);
        }
      }

      //组装样式并重新加载图层
      let newStyle = new Style({
        stroke: new Stroke({
          color: 'blue',
          width: 1,
        }),
      })

      vectorLayer.setStyle(newStyle);

    },



    // 鼠标点击地图事件
    mapClick (evt) {
      let coordinate = evt.coordinate
      let pixel = this.mapData.getEventPixel(evt.originalEvent);
      let feature = this.mapData.forEachFeatureAtPixel(pixel,
        function (feature, layer) {
          return feature;
        });
      if (feature) {
        //捕捉到要素后，弹框
        const layerName = feature.get('layer');
        // 显示弹出窗体
        this.addPopup(coordinate, feature);
      } else {
        this.removePopup();
      }
    },









  }




}


</script>

<style scoped>
.ol-popup {
  position: absolute;
  background-color: white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  /**padding: 15px; **/
  border-radius: 10px;
  border: 1px solid #cccccc;
  bottom: 12px;
  left: -50px;
  min-width: 160px;
}
.ol-popup:after,
.ol-popup:before {
  top: 100%;
  border: solid transparent;
  content: ' ';
  height: 0;
  width: 0;
  position: absolute;
  pointer-events: none;
}
.ol-popup:after {
  border-top-color: white;
  border-width: 10px;
  left: 48px;
  margin-left: -10px;
}
.ol-popup:before {
  border-top-color: #cccccc;
  border-width: 11px;
  left: 48px;
  margin-left: -11px;
}
.ol-popup-closer {
  text-decoration: none;
  position: absolute;
  top: 2px;
  right: 8px;
  z-index: 2000;
  color: white;
  font-weight: bold;
}
.ol-popup-closer:after {
  content: '✖';
}

.poptable-th {
  text-align: left;
}
.popTable td {
  font-size: 14px;
}

#pop-summry {
  width: 100%;
  height: 250px;
  bottom: 0px;
  z-index: 10000;
  background-color: white;
  position: fixed;
}

#pop-summry—collapse {
  width: 15%;
  bottom: 0px;
  z-index: 10000;
  background-color: white;
  position: fixed;
  display: none;
}

.ol-popsummry-link_hide {
  position: fixed;
  color: white;
  margin-right: 10px;
  font-size: 25px;
  line-height: 40px;
  right: 0px;
}
/* .ol-popsummry-link_hide::after {
  content: '>>';
} */

.pop-summry-control {
  position: relative;
  height: 36px;
  width: 100%;
  background-color: #056ed1;
}

.pop-summry-control-title {
  background-color: white;
  width: 102px;
  margin-left: 42px;
  height: 36px;
  z-index: 200;
  border-radius: 6px 6px 0px 0px;
  color: #056ed1;
  font-weight: bold;
  text-align: center;
  line-height: 38px;
  font-size: 19px;
  float: left;
  border-width: thin thin thin thin;
  border-style: solid;
  border-color: #056ed1;
  border-bottom-color: white;
}

.control-display-div {
  margin-left: 148px;
  color: white;
  font-size: 25px;
  line-height: 40px;
}

.ol-popsummry-detail-table {
  background: #797979;
  width: 29%;
  margin-left: 40px;
  margin-top: 16px;
  float: left;
}
.ol-popsummry-detail-table th {
  background: #056ed1;
  width: 50%;
  color: white;
  text-align: center;
  font-size: 14px;
  height: 25px;
}

.ol-popsummry-detail-table td {
  background: #fff;
  height: 50%;
  text-align: center;
  font-size: 8px;
  font-weight: bold;
}
.ol-road-chart-div {
  border-color: #d9d9d9;
  display: inline-block;
  border-style: solid;
  border-width: 1px;
  margin-left: 25px;
  margin-top: 16px;
  width: 29%;
  height: 189px;
}

.popsummry-down-animation {
  -webkit-animation: bounce-down 0.5s linear;
  animation: bounce-down 0.5s linear;
  -webkit-animation-fill-mode: forwards;
  animation-fill-mode: forwards;
}

.popsummry-up-animation {
  -webkit-animation: bounce-up 0.5s linear;
  animation: bounce-up 0.5s linear;
  -webkit-animation-fill-mode: forwards;
  animation-fill-mode: forwards;
}

/* 
@-webkit-keyframes bounce-down {
  25% {
    -webkit-transform: translateY(120px);
  }
  50%,
  100% {
    -webkit-transform: translateY(1900);
  }
  75% {
    -webkit-transform: translateY(240px);
  }
} */

@keyframes bounce-up {
  0% {
    transform: translateY(0);
  }
  25% {
    transform: translateY(-62.8px);
  }
  50% {
    transform: translateY(-125.6px);
  }
  75% {
    transform: translateY(-188.4px);
  }
  100% {
    transform: translateY(-250.8px);
  }
}

@keyframes bounce-down {
  0% {
    transform: translateY(0);
  }
  25% {
    transform: translateY(91.6px);
  }
  55% {
    transform: translateY(182px);
  }
  75% {
    transform: translateY(270px);
  }
  100% {
    transform: translateY(458px);
  }
}

.roadTypelabel {
  font-size: 10px;
  font-weight: normal;
  vertical-align: middle;
  position: absolute;
}

.roadTypebox {
  width: 65px;
  height: 16px;
  margin-left: 60px;
}
.lightGreen {
  background-color: #00c297;
}
.lightYellow {
  background-color: #ffff80;
}
.lightRed {
  background-color: #d9001b;
}
.blue {
  background-color: #0000ff;
}

.road-selector-pop {
  width: 120px;
  height: 200px;
  z-index: 200000;
  position: fixed;
  margin-left: 70px;
  margin-top: 40px;
}
.road-selector-nav {
  background-color: #d7d7d7;
  width: 80px;
  height: 25px;
  text-align: center;
  padding: 4px;
  border-radius: 4px 4px 4px 4px;
  font-size: 12px;
}
.road-selector-color {
  width: 145px;
  height: 90px;
  text-align: center;
  padding: 4px;
  border-radius: 4px 4px 4px 4px;
  border: 1px solid #797979;
  margin-top: 5px;
}
</style>
