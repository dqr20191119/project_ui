<template>
  <div id="map" ref="map" style="height: 890px">
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
        <div class="pop-title">地块颜色</div>
        <el-switch
          class="div-switch"
          v-model="value1"
          active-color="#004AB3"
          inactive-color="#004AB3"
          active-text="建设信息"
          inactive-text="交通信息"
        >
        </el-switch>
        <div ref="roadTypeColorDiv" class="road-selector-color">
          <el-checkbox-group v-model="roadTypeRadio" v-show="value1 == false">
            <el-checkbox label="1" @change="roadTypeChange"
              >快速路 <span class="lightGreen colorBox"></span
            ></el-checkbox>
            <el-checkbox label="2" @change="roadTypeChange"
              >主干路<span class="lightYellow colorBox"></span
            ></el-checkbox>
            <el-checkbox label="3" @change="roadTypeChange"
              >次干路<span class="lightRed colorBox"></span
            ></el-checkbox>
            <el-checkbox label="4" @change="roadTypeChange"
              >支路 <span class="blue colorBox"></span
            ></el-checkbox>
          </el-checkbox-group>
          <el-checkbox-group v-model="radio2" v-show="value1 == true">
            <el-checkbox label="1"
              >建成使用 <span class="lightGreen colorBox"></span
            ></el-checkbox>
            <el-checkbox label="3"
              >施工建设中<span class="lightYellow colorBox"></span
            ></el-checkbox>
            <el-checkbox label="6"
              >规划道路<span class="lightRed colorBox"></span
            ></el-checkbox>
          </el-checkbox-group>
        </div>
      </div>
    </div>

    <!--总体信息浮动框-->
    <div id="pop-summry" class="ol-layer">
      <div class="mbg"></div>
      <!--总体信息控制图层(上)-->
      <div class="pop-summry-control">
        <div>
          <div class="pop-summry-control-title">
            <span @click="hideSummryPop">总体信息</span>
            <i class="el-icon-arrow-down" @click="hideSummryPop"></i>
          </div>
        </div>
      </div>
      <!--总体信息表格-->
      <div class="flex-div">
        <div class="div-bg">
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
        <div class="ol-road-chart-div div-bg">
          <div id="roadLengChart" :style="myChartStyle"></div>
        </div>
        <!--道路长度柱状图标-->
        <div class="ol-road-chart-div div-bg">
          <div id="roadRationChart" :style="myChartStyle"></div>
        </div>
      </div>
    </div>

    <!--总体信息折叠控制层-->
    <div id="pop-summry—collapse" class="ol-layer">
      <div class="pop-summry-control">
        <div>
          <div class="pop-summry-control-title blue-title">
            <span @click="showSummryPop">总体信息</span>
            <i class="el-icon-arrow-up" @click="showSummryPop"></i>
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
import { TileWMS } from 'ol/source'
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
const centerCordinate = [656951.22378694, 3559039.26626369]
//坐标定义
proj4.defs("EPSG:4548", "+proj=tmerc +lat_0=0 +lon_0=117 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs");
register(proj4);
//是否展示总体信息标识
var showSummryFlag = true;
// 道路类型图例常量
const roadTypeName = ['快速路', '主干路', '次干路', '支路'];
const roadTypeNum = ['1', '2', '3', '4'];
const roadTypeColor = ['#b1db16', '#ebcc0c', '#eb7323', '#1979ff'];
const layerName = "Test:Road_lines";
var vectorLayer;
//地图初始化
const view = new View({
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
      value1: 'true',   //开关
      roadTypeRadio: [],        //道路等级
      radio2: [],       //建设信息
      geoJsonList: {},
      roadBasicInfo: {},
      myChart: {},
      // sortData: [], //动态排序数据
      myChartStyle: {
        width: "100%", height: "250px", display: "inline-block"
      },
      roadChartOption: {
        title: {
          text: '北站片区各类型道路总长度（km）',
          textStyle: {
            color: 'rgba(18, 25, 36, 1)',
            fontSize: 15,
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
              color: "rgba(100, 101, 102, 1)",
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
              color: "rgba(100, 101, 102, 1)",
              fontSize: 10
            }
          },
          axisLine: {//y轴线的颜色以及宽度
            show: true,
            lineStyle: {
              color: "rgba(226, 229, 235, 1)",

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
                color: new echarts.graphic.LinearGradient(1, 1, 0, 0, [
                  { offset: 0, color: '#1979ff' },
                  { offset: 1, color: 'rgba(25,121,255,0.1000)' }
                ]),
                barBorderRadius: [0, 90, 90, 0]
              }
            },
          }

        ],
        legend: {

        },
        grid: {
          left: '2%',
          top: '40px',
          containLabel: true,
          backgroundColor: 'green',
          borderWidth: 1,
          borderColor: '#ccc'
        },
      }
    }
  },
  mounted () {
    //初始化图层
    this.initMap();
    //加载道路整体信息
    this.getRoadInfo(this)
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
    document.getElementById('popup').style.display = 'none';

  },



  methods: {
    // 初始化地图
    initMap () {
      const mapContainer = this.$refs.map
      const FullScreen = new olControl.FullScreen() // 全屏控件

      //通过wms加载数据
      const wmsSource = new TileWMS({
        url: process.env.VUE_APP_GIS_BASE_URL + '/wms',
        projection: 'EPSG:3857',
        params: {
          'LAYERS': layerName,
          'VERSION': '1.1.0'

        },
        serverType: 'geoserver'
      });
      //自定义图层
      vectorLayer = new TileLayer({
        source: wmsSource
      });

      //将图层加入Map
      const map = new Map({
        layers: [gaodeMapLayer, vectorLayer],
        target: mapContainer,
        view: view
      });

      // 添加鼠标点击事件
      map.on('click', this.mapClick);
      // 保存地图
      this.mapData = map
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
          text: '北站片区各类型道路比例',
          x: 'center',
          y: '4px',          //标题位置
          textStyle: { //标题内容的样式
            color: 'rgba(18, 25, 36, 1)',
            fontWeight: 'normal',
            fontSize: 15
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
          left: 'right',//控制图例的位置
          bottom: 20,
          // itemWidth: 16,//图例颜色块的宽度和高度
          // itemHeight: 12,
          textStyle: {//图例中文字的样式
            color: '#000',
            fontSize: 10
          },
          data: ['支路', '次干路', '主干路', '快速路']//图例上显示的饼图各模块上的名字
        },
        //饼图中各模块的颜色
        color: ['#1979FF', '#EBCC0C', '#B1DB16', '#EB7323'],
        // 饼图数据
        series: {
          // name: 'bug分布',
          type: 'pie',             //echarts图的类型   pie代表饼图
          radius: '60%',           //饼图中饼状部分的大小所占整个父元素的百分比
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
      let layer = feature.properties.LAYER;
      content.innerHTML = `
                      <div style='color:#121924;font-weight: bold;width:100%;z-index:4;height:50px;padding:6px;font-size: 15px'>`+ layer + `</div>
                      <table style='font-size: 10px;width:100%'>
                        <tr style="height: 26px;">
                          <td style="color:#646566">等级：</td>
                          <td style="text-align: right;font-size:14px">`+ layer + `</td>
                        </tr>
                        <tr style="height: 26px;">
                          <td class='poptable-th' style="color:#646566">长度：</td>
                          <td style="text-align: right;font-size:14px">1232.32m</td>
                        </tr>
                        <tr style="height: 26px;">
                          <td class='poptable-th' style="color:#646566">车道规模：</td>
                          <td style="text-align: right;font-size:14px">4</td>
                        </tr>
                        <tr style="height: 26px;">
                          <td class='poptable-th' style="color:#646566">图层：</td>
                          <td style="text-align: right;font-size:14px">次干路36</td>
                        </tr>
                        <tr style="height: 26px;">
                          <td class='poptable-th' style="color:#646566">同行能力：</td>
                          <td style="text-align: right;font-size:14px">1700</td>
                        </tr>
                        <tr style="height: 26px;">
                          <td class='poptable-th' style="color:#646566">速度：</td>
                          <td style="text-align: right;font-size:14px">40</td>
                        </tr>
                        <tr style="height: 26px;">
                          <td class='poptable-th' style="color:#646566">A-B流量：</td>
                          <td style="text-align: right;font-size:14px">40</td>
                        </tr>
                        <tr style="height: 26px;">
                          <td class='poptable-th' style="color:#646566">B-A流量：</th>
                          <td style="text-align: right;font-size:14px">40</td>
                        </tr>
                        <tr style="height: 26px;">
                          <td class='poptable-th' style="color:#646566">建设情况：</td>
                          <td style="text-align: right;font-size:14px">建成使用</td>
                        </tr>
                      </table>
                      `
      // 设置弹出层位置即可出现
      this.overlay.setPosition(coordinate)
      document.getElementById('popup').style.display = 'block';
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


    roadTypeChange () {
      //var sld = '<?xml version="1.0" encoding="GBK"?><StyledLayerDescriptor version="1.0.0" xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:gml="http://www.opengis.net/gml" xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.0.0/StyledLayerDescriptor.xsd"><NamedLayer><Name>Test:Road_lines</Name><UserStyle><Name>subroad</Name><Title>subroad</Title><Abstract>roadType</Abstract><FeatureTypeStyle><Rule><Title></Title><ogc:Filter><ogc:PropertyIsEqualTo><ogc:PropertyName>LAYER</ogc:PropertyName><ogc:Literal>主干路</ogc:Literal></ogc:PropertyIsEqualTo></ogc:Filter><PolygonSymbolizer><Stroke><CssParameter name="stroke">#ebcc0c</CssParameter><CssParameter name="stroke-width">3</CssParameter></Stroke></PolygonSymbolizer></Rule></FeatureTypeStyle></UserStyle></NamedLayer></StyledLayerDescriptor>';
      let checkedRoadType = this.roadTypeRadio;
      let filterProp = 'LAYER'
      let unCheckRoudType = checkedRoadType.concat(roadTypeNum).filter(v => !roadTypeNum.includes(v) || !checkedRoadType.includes(v));
      var uncheckedSid = '<PolygonSymbolizer><Stroke><CssParameter name="stroke">#DDDDDD</CssParameter><CssParameter name="stroke-width">3</CssParameter></Stroke></PolygonSymbolizer>';
      var dynamicSld = '<?xml version="1.0" encoding="GBK"?><StyledLayerDescriptor version="1.0.0" xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:gml="http://www.opengis.net/gml" xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.0.0/StyledLayerDescriptor.xsd"><NamedLayer><Name>' + layerName + '</Name><UserStyle><Name>roadType</Name><Title>roadType</Title><Abstract>roadType</Abstract><FeatureTypeStyle>';
      for (var i = 0; i < checkedRoadType.length; i++) {
        dynamicSld = dynamicSld + '<Rule><Title>' + roadTypeName[checkedRoadType[i] - 1] + '</Title><ogc:Filter><ogc:PropertyIsEqualTo><ogc:PropertyName>' + filterProp + '</ogc:PropertyName><ogc:Literal>' + roadTypeName[checkedRoadType[i] - 1] + '</ogc:Literal></ogc:PropertyIsEqualTo></ogc:Filter>' + '<PolygonSymbolizer><Stroke><CssParameter name="stroke">' + roadTypeColor[checkedRoadType[i] - 1] + '</CssParameter><CssParameter name="stroke-width">3</CssParameter></Stroke></PolygonSymbolizer></Rule>';
      }
      for (var i = 0; i < unCheckRoudType.length; i++) {
        dynamicSld = dynamicSld + '<Rule><Title>' + roadTypeName[unCheckRoudType[i] - 1] + '</Title><ogc:Filter><ogc:PropertyIsEqualTo><ogc:PropertyName>' + filterProp + '</ogc:PropertyName><ogc:Literal>' + roadTypeName[unCheckRoudType[i] - 1] + '</ogc:Literal></ogc:PropertyIsEqualTo></ogc:Filter>' + uncheckedSid + '</Rule>';
      }

      //设置默认样式
      let defaultColor = '#DDDDDD';
      dynamicSld = dynamicSld + '<Rule><Title>default</Title><ogc:Filter><ogc:And>';
      for (var k = 0; k < roadTypeName.length; k++) {
        dynamicSld = dynamicSld + '<ogc:PropertyIsNotEqualTo><ogc:PropertyName>' + filterProp + '</ogc:PropertyName><ogc:Literal>' + roadTypeName[k] + '</ogc:Literal></ogc:PropertyIsNotEqualTo>'
      }
      dynamicSld = dynamicSld + '</ogc:And></ogc:Filter><PolygonSymbolizer><Stroke><CssParameter name="stroke">' + defaultColor + '</CssParameter><CssParameter name="stroke-width">1</CssParameter></Stroke></PolygonSymbolizer></Rule>'
      dynamicSld = dynamicSld + '</FeatureTypeStyle></UserStyle></NamedLayer></StyledLayerDescriptor>';
      vectorLayer.getSource().updateParams({ 'STYLES': undefined, 'SLD_BODY': dynamicSld });
    },

    //地图点击事件
    mapClick (evt) {
      this.removePopup();
      let thisObj = this;
      var viewResolution = view.getResolution();
      var featureUrl = vectorLayer.getSource().getFeatureInfoUrl(
        evt['coordinate'],
        viewResolution,
        'EPSG:3857',
        { 'INFO_FORMAT': 'application/json' }
      );
      if (featureUrl) {
        fetch(featureUrl)
          .then(function (response) {
            return response.text();
          })
          .then(function (info) {
            var objData = JSON.parse(info);
            if (objData && objData.features[0]) {
              thisObj.addPopup(evt.coordinate, objData.features[0]);
            } else {
              thisObj.removePopup();
            }

          });
      } else {
        this.removePopup();
      }
    },




  }




}


</script>

<style scoped lang="scss">
.ol-popup {
  position: absolute;
  width: 338px;
  height: 388px;
  opacity: 1;
  bottom: 15px;
  left: -169px;
  padding: 15px 25px;
  background: url(../../assets/images/pop_up_bg.png) no-repeat;
  background-size: 100% 100%;
}
#popup-content ::after{
  position: absolute;
  bottom: -15px;
  left: 148px;
  content: "";
  width: 40px;
  height: 15px;
  background: url(../../assets/images/bg_down.png) no-repeat;
   background-size: 100% 100%;
}
.ol-popup-closer {
  background: url(../../assets/images/close.png) no-repeat;
  text-decoration: none;
  position: absolute;
  top: 25px;
  width: 16px;
  height: 16px;
  background-size: cover;
  right: 40px;
  z-index: 2000;
  color: white;
  font-weight: bold;
}

.poptable-th {
  text-align: left;
  color: #646566;
  margin-bottom: 12px;
}
.popTable td {
  font-size: 14px;
}

#pop-summry {
  width: 100%;
  height: 378px;
  bottom: 0px;
  z-index: 10000;
  border-radius: 40px 40px 0px 0px;
  position: fixed;
  border: 2px solid #fff;
}
  .mbg {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    z-index: 1;
    border-radius: 8px 8px 8px 8px;
    overflow: hidden;
    pointer-events: none;
  }
  .mbg::after {
    content: ' ';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: -1;
    filter: blur(15px);
    background-color: rgba(255, 255, 255, 0.5);
    pointer-events: none;
  }
#pop-summry—collapse {
  width: 174px;
  height: 40px;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 40px 40px 0px 0px;
  border: 2px solid #fff;
  opacity: 1;
  left: 45%;
  bottom: 0px;
  z-index: 10000;
  position: fixed;
  display: none;
}

.ol-popsummry-link_hide {
  position: fixed;
  color: #333;
  margin-right: 10px;
  font-size: 25px;
  line-height: 40px;
  right: 0px;
}
.pop-summry-control {
  position: relative;
  height: 36px;
  width: 100%;
  text-align: center;
  z-index: 2;
}

.pop-summry-control-title {
  height: 36px;
  z-index: 200;
  color: #333333;
  font-weight: bold;
  line-height: 38px;
  font-size: 18px;
  span {
    cursor: pointer;
  }
  i {
    font-size: 16px;
  }
}

.control-display-div {
  margin-left: 148px;
  color: #333333;
  font-size: 25px;
  line-height: 40px;
}

.ol-popsummry-detail-table {
  width: 100%;
  border-radius: 4px 4px 4px 4px;
    z-index: 2;
}
.ol-popsummry-detail-table th {
  height: 30px;
  width: 50%;
  background: rgba(255, 255, 255, 1);
  border-radius: 2px 0px 0px 2px;
  color: #222324;
  font-size: 14px;
  box-shadow: 0px 10px 20px 1px rgba(135, 141, 153, 0.1);
}

.ol-popsummry-detail-table td {
  background: rgba(255, 255, 255, 1);
  box-shadow: 0px 10px 20px 1px rgba(135, 141, 153, 0.1);
  height: 50%;
  text-align: center;
  font-weight: bold;
  color: #222324;
  font-size: 14px;
}
.ol-road-chart-div {
     z-index: 2;
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
::v-deep .el-checkbox {
  position: relative;
  display: block;
  width: 100%;
  height: 26px;
}
.el-checkbox-group {
  width: 100%;
}
.colorBox {
  width: 48px;
  height: 12px;
  display: inline-block;
  border-radius: 2px;
  position: absolute;
  right: 10px;
}
.lightGreen {
  background-color: #b1db16;
}
.lightYellow {
  background-color: #ebcc0c;
}
.lightRed {
  background-color: #eb7323;
}
.blue {
  background-color: #1979ff;
}

.road-selector-pop {
  width: 202px;
  height: 218px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0px 10px 20px 1px rgba(180, 190, 204, 0.4);
  border-radius: 8px 8px 8px 8px;
  padding: 15px;
  z-index: 200000;
  position: fixed;
  margin-left: 70px;
  margin-top: 65px;
  .pop-title {
    font-weight: bold;
    font-size: 14px;
  }
  .div-switch {
    margin: 10px 0 20px 0;
  }
}
.road-selector-color {
  width: 100%;
}
.flex-div {
  display: flex;
  justify-content: space-between;
  padding: 25px 32px;
  div {
    width: 33%;
  }
}
/* 悬浮框背景 */
.div-bg {
  background: rgba(255, 255, 255, 0.56);
  box-shadow: 0px 10px 20px 1px rgba(135, 141, 153, 0.1);
  border-radius: 12px 12px 12px 12px;
  height: 270px;
  padding: 20px;
}
.blue-title {
  color: #003f97;
}
</style>
