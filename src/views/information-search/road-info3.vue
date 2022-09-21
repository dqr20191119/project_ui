<template>
  <div id="map" ref="map">
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
    <!-- <div id="pop-road-selector" class="ol-layer">
      <div class="road-selector-pop">
        <div class="pop-title">地块颜色</div>
        <el-switch
        class="div-switch"
          v-model="value1"
          active-color="#004AB3"
          inactive-color="#004AB3"
          active-text="建设信息"
          inactive-text="道路等级"
          @change="switchChange"
        >
        </el-switch>
        <div ref="roadTypeColorDiv" class="road-selector-color">
          <el-tree
            ref="tree"
            :data="treeData"
            show-checkbox
            node-key="id"
            :default-checked-keys="defaultCheckedIds"
            :default-expanded-keys="defaultExpandIds"
            :props="defaultProps"
            @check="handleCheckChange"
            v-show="value1 == false"
          >
            <div class="custom-tree-node" slot-scope="{ node, data }">
              <span>
                {{ node.label }}
              </span>
              <span
                class="dot"
                :style="{ background: data.lengendColor }"
              ></span>
            </div>
          </el-tree>
          <el-tree
            style="height: 200px; overflow: auto"
            ref="tree"
            :data="treeData2"
            show-checkbox
            node-key="id"
            default-expand-all
            :default-checked-keys="defaultCheckedIds"
            :default-expanded-keys="defaultExpandIds"
            :props="defaultProps"
            @check="handleCheckChange"
            v-show="value1 == true"
          >
            <div class="custom-tree-node" slot-scope="{ node, data }">
              <span>
                {{ node.label }}
              </span>
              <span
                class="dot"
                :style="{ background: data.lengendColor }"
              ></span>
            </div>
          </el-tree>
        </div>
      </div>
    </div> -->
    <div id="pop-road-selector" class="ol-layer">
      <div class="road-selector-pop">
        <div class="pop-title">道路颜色</div>
        <el-switch
          class="div-switch"
          v-model="value1"
          active-color="#004AB3"
          inactive-color="#004AB3"
          active-text="建设信息"
          inactive-text="道路等级"
          @change="switchChange"
        >
        </el-switch>
        <div ref="roadTypeColorDiv" class="road-selector-color">
          <el-checkbox-group v-model="roadTypeRadio" v-show="value1 == false">
            <el-checkbox
              v-for="(item, index) in roadTypeDispalyLengendList"
              :label="item.lengendTypeValue"
              @change="roadTypeChange"
              :key="index"
              >{{ item.lengendTypeName
              }}<span
                class="colorBox"
                :style="{ background: item.stroke }"
              ></span
            ></el-checkbox>
          </el-checkbox-group>

          <el-checkbox-group v-model="radio2" v-show="value1 == true">
            <el-checkbox
              v-for="(item, index) in buildStatusLengendList"
              :label="item.lengendTypeValue"
              @change="buildStatusChange"
              :key="index"
              >{{ item.lengendTypeName
              }}<span
                class="colorBox"
                :style="{ background: item.stroke }"
              ></span
            ></el-checkbox>
          </el-checkbox-group>
        </div>
      </div>
    </div>
    <!--总体信息折叠控制层-->
    <transition name="move">
      <!--总体信息浮动框-->
      <div id="pop-summry" class="ol-layer" v-if="hidPop">
        <div class="mbg"></div>
        <!--总体信息控制图层(上)-->
        <div class="pop-summry-control" @click="hideSummryPop">
          <div>
            <div class="pop-summry-control-title">
              <span>总体信息</span>
              <img src="~@/assets/images/arrow-down.png" class="jt-icon" />
            </div>
          </div>
        </div>
        <scoll-div-vue style="padding: 25px">
          <!--总体信息表格-->
          <div class="div-bg" v-for="(item, index) in tableArray" :key="index">
            <table
              class="ol-popsummry-detail-table"
              v-if="item.cptType == 'TABLE'"
            >
              <span class="table-title">{{ item.title }}</span>
              <tr v-for="(item2, index2) in item.tableData" :key="index2">
                <th>{{ item2.label }}</th>
                <td>{{ item2.value }}</td>
              </tr>
            </table>
            <bar_chart_vVue
              :barData="item"
              v-if="item.cptType == 'BAR' && item.tableDirection == 'H'"
            ></bar_chart_vVue>
            <pie_chartVue
              :pieData="item"
              v-if="item.cptType == 'PIE'"
            ></pie_chartVue>
            <bar_chart_hVue
              :barData="item"
              v-if="item.cptType == 'BAR' && item.tableDirection == 'V'"
            ></bar_chart_hVue>
          </div>
        </scoll-div-vue>
      </div>
    </transition>
    <!--总体信息折叠控制层-->
    <transition name="move">
      <div id="pop-summry—collapse" class="ol-layer" v-show="showPop">
        <div class="pop-summry-control" @click="showSummryPop">
          <div>
            <div class="pop-summry-control-title blue-title">
              <span>总体信息</span>
              <img src="~@/assets/images/arrow-up.png" class="jt-icon" />
            </div>
          </div>
        </div>
      </div>
    </transition>
    <nav_barVue :navList="navList"></nav_barVue>
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
import { transform, fromLonLat } from 'ol/proj'
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
import OlGeomPoint from 'ol/geom/Point'
import OlStyleStyle from 'ol/style/Style'
import OlStyleIcon from 'ol/style/Icon'
import Text from 'ol/style/Text'
import nav_barVue from '../components/nav_bar.vue'
import { findComponentInfo } from "@/api/config/component";
import { getUrlKey, request } from '@/utils/request'
import bar_chart_vVue from '../traffic-decision/components/bar_chart_v.vue'
import pie_chartVue from '../traffic-decision/components/pie_chart.vue'
import scollDivVue from '../traffic-decision/components/scollDiv.vue'
import bar_chart_hVue from '../traffic-decision/components/bar_chart_h.vue'
import Vue from 'vue'
//中心坐标
const centerCordinate = [656813.44256, 3560432.98245]
//坐标定义
proj4.defs("EPSG:4548", "+proj=tmerc +lat_0=0 +lon_0=117 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs");
register(proj4);
//是否展示总体信息标识
var showSummryFlag = true;
// 道路类型图例常量

const layerName = "Test:plane1_v2";
var vectorLayer;
//地图初始化
const view = new View({
  center: transform(centerCordinate, 'EPSG:4548', 'EPSG:3857'),
  minZoom: 4,
  maxZoom: 18,
  zoom: 13.6 // 地图初始化的缩放级别
})



//高德地图图层
const gaodeMapLayer = new TileLayer({
  source: new XYZ({
    url: 'http://webst0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}'
  })
});



export default {
  name: "Road",
  components: {
    nav_barVue, bar_chart_vVue, scollDivVue, pie_chartVue, bar_chart_hVue
  },
  data () {
    return {
      navList: ['信息查询', '道路信息'],
      value1: 'true',   //开关
      roadTypeRadio: ["1", "2", "3", "4", "5", "6", "7"],        //道路等级
      radio2: ["1", "2", "3"],       //建设信息
      geoJsonList: {},
      roadBasicInfo: {},
      markLayerName: 'Test%3Aroad_points',
      markMinZoom: 14.7,
      markFlag: false,
      hidPop: false,
      showPop: true,
      markVectorArray: [],
      tableArray: [],
      menuId: null,
      markDataCache: null,
      myChart: {},
      // sortData: [], //动态排序数据
      myChartStyle: {
        width: "100%", height: "250px", display: "inline-block"
      },
      roadTypeLengendList: [
        {
          lengendTypeName: "高速公路",
          lengendTypeValue: "5",
          filterProperty: "layer",
          stroke: "#00FF00",
          strokeWidth: "7.2",
          enableSelect: true
        },
        {
          lengendTypeName: "快速路",
          lengendTypeValue: "1",
          filterProperty: "layer",
          stroke: "#ff00ff",
          strokeWidth: "6.3",
          enableSelect: true

        },
        {
          lengendTypeName: "主干路",
          lengendTypeValue: "2",
          filterProperty: "layer",
          stroke: "#ff0000",
          strokeWidth: "5.4",
          enableSelect: true
        },

        {
          lengendTypeName: "次干路",
          lengendTypeValue: "3",
          filterProperty: "layer",
          stroke: "#007fff",
          strokeWidth: "3.6",
          enableSelect: true
        },
        {
          lengendTypeName: "支路",
          lengendTypeValue: "4",
          filterProperty: "layer",
          stroke: "#00994c",
          strokeWidth: "2.7",
          enableSelect: true
        },

        {
          lengendTypeName: "低等级道路",
          lengendTypeValue: "6",
          filterProperty: "layer",
          stroke: "#999900",
          strokeWidth: "1.8",
          enableSelect: true
        },
        {
          lengendTypeName: "匝道",
          lengendTypeValue: "7",
          filterProperty: "layer",
          stroke: "#00FFFF",
          strokeWidth: "1.8",
          enableSelect: true
        },

        {
          lengendTypeName: "00道路红线",
          lengendTypeValue: "8",
          filterProperty: "layer",
          stroke: "#bbbbbb",
          strokeWidth: "1.6",
          enableSelect: false
        },
        {
          lengendTypeName: "00规划边界",
          lengendTypeValue: "9",
          filterProperty: "layer",
          stroke: "#FF0000",
          strokeWidth: "1.8",
          dashOffset: "10",
          dasharray: "10 15",
          enableSelect: false

        },

      ],
      roadTypeDispalyLengendList: [],

      buildStatusLengendList: [
        {
          lengendTypeName: "建成使用",
          lengendTypeValue: "1",
          filterProperty: "status",
          stroke: "#b1db16",
          strokeWidth: "3",
          enableSelect: true

        },
        {
          lengendTypeName: "施工建设中",
          lengendTypeValue: "2",
          filterProperty: "status",
          stroke: "#ebcc0c",
          strokeWidth: "4",
          enableSelect: true
        },

        {
          lengendTypeName: "规划道路",
          lengendTypeValue: "3",
          filterProperty: "status",
          stroke: "#eb7323",
          strokeWidth: "5",
          enableSelect: true
        }],


      layerStyleSld: ""
    }
  },
  mounted () {

    //初始化菜单
    this.menuId = getUrlKey('menuId');
    //查询组件信息
    this.initComponentInfo();
    //初始图例展示数据
    this.initDisplayLengendData()
    //组装图层样式数据
    this.initStyle();
    //初始化图层
    this.initMap();
    this.showPop = false
    this.hidPop = true
    //加载道路整体信息
    //this.getRoadInfo(this)
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
    document.getElementsByClassName('ol-popup').style.display = 'none';
  },



  methods: {
    initLegendInfo (legendList, _this) {
      if (legendList && legendList.length > 0) {
        //设置树节点数据
        let treeData_ = legendList[0];
        _this.treeData = treeData_;
        //设置顶级菜单选中
        let checkedIds_ = [];
        let expandIds = [];
        for (let k = 0; k < treeData_.length; k++) {
          let item = treeData_[k];
          if (item.parentId == null) {
            checkedIds_.push(item.id);
            let children_ = item.children;
            if (children_ != null && children_.length != 0) {
              for (let j = 0; j < children_.length; j++) {
                expandIds.push(children_[j].id);
              }
            } else {
              expandIds.push(item.id);
            }
          }
        }
        //默认展展开二级菜单
        _this.defaultExpandIds = expandIds;
        _this.defaultCheckedIds = checkedIds_;
      }

    },

    initComponentInfo () {
      let _this = this;
      findComponentInfo(this.menuId, null).then(response => {
        //图例
        let legendConfigData = response.data.decLegendConfigList;
        if (legendConfigData && legendConfigData.length > 0) {
          //设置树节点数据
          let treeData_ = legendConfigData[0];
          let treeData2_ = legendConfigData[1];
          //隐藏设置的节点
          _this.treeData = treeData_;
          _this.treeData2 = treeData2_;
          debugger
          //设置顶级菜单选中
          let expandIds = [];
          for (let k = 0; k < treeData_.length; k++) {
            let item = treeData_[k];
            if (item.parentId == null) {
              let children_ = item.children;
              if (children_ != null && children_.length != 0) {
                for (let j = 0; j < children_.length; j++) {
                  expandIds.push(children_[j].id);
                }
              } else {
                expandIds.push(item.id);
              }
            }
          }
          //默认展展开二级菜单
          this.defaultExpandIds = expandIds;
          this.defaultCheckedIds = _this.getTreecheckedId(treeData_);
        }
        //表格
        let tableList = response.data.tableList;
        _this.tableArray = tableList;


      });
    },
    //递归获节点信息
    getCheckedIdsRecur (item, ids_) {
      if (item.id && item.checkStatus == 'Y') {
        ids_ = (ids_ == null ? [] : ids_);
        ids_.push(item.id);
      }
      //如果子节点选中，需要将父节半选中状态节点加入
      let currentLen = ids_.length;
      if (item.children != null) {
        item.children.forEach(item => {
          this.getCheckedIdsRecur(item, ids_)
        })
        if (currentLen < ids_.length && ids_.indexOf(item.id) == -1) {
          ids_.push(item.id);
        }
      }
    },
    //获取树所有的节点信息
    getTreecheckedId (treeData) {
      let ids = [];
      treeData.forEach(item => {
        this.getCheckedIdsRecur(item, ids);
      })
      return ids;
    },
    initDisplayLengendData () {
      this.roadTypeDispalyLengendList = this.roadTypeLengendList.filter((item) => {
        return item.enableSelect == true;
      })

    },
    //初始化样式
    initStyle () {
      var initSld = '<?xml version="1.0" encoding="GBK"?><StyledLayerDescriptor version="1.0.0" xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:gml="http://www.opengis.net/gml" xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.0.0/StyledLayerDescriptor.xsd"><NamedLayer><Name>' + layerName + '</Name><UserStyle><Name>roadType</Name><Title>roadType</Title><Abstract>roadType</Abstract><FeatureTypeStyle>';
      this.roadTypeLengendList.forEach((item) => {
        var typeName = item.lengendTypeName;
        var filterProperty = item.filterProperty;
        var stroke = item.stroke;
        var strokeWidth = item.strokeWidth;
        var dashOffset = item.dashOffset;
        var dasharray = item.dasharray;
        initSld = initSld + '<Rule><Title>' + typeName + '</Title><ogc:Filter><ogc:PropertyIsEqualTo><ogc:PropertyName>' + filterProperty + '</ogc:PropertyName><ogc:Literal>' + typeName + '</ogc:Literal></ogc:PropertyIsEqualTo></ogc:Filter>' + '<PolygonSymbolizer><Stroke><CssParameter name="stroke">' + stroke + '</CssParameter><CssParameter name="stroke-width">' + strokeWidth + '</CssParameter>';
        if (dashOffset) {
          initSld = initSld + '<CssParameter name="stroke-dashoffset">' + dashOffset + '</CssParameter>'
        }
        if (dasharray) {
          initSld = initSld + '<CssParameter name="stroke-dasharray">' + dasharray + '</CssParameter>'
        }
        initSld = initSld + '</Stroke></PolygonSymbolizer></Rule>'

      });
      initSld = initSld + '</FeatureTypeStyle></UserStyle></NamedLayer></StyledLayerDescriptor>';
      this.layerStyleSld = initSld;
    },

    // 初始化地图
    initMap () {
      const mapContainer = this.$refs.map
      //通过wms加载数据
      const wmsSource = new TileWMS({
        url: process.env.VUE_APP_GIS_BASE_URL + '/wms',
        projection: 'EPSG:4548',
        params: {
          'LAYERS': layerName,
          'VERSION': '1.1.0',
          'STYLES': undefined,
          'SLD_BODY': this.layerStyleSld
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
      map.on('moveend', this.mapMoveend);
      // 保存地图
      this.mapData = map
    },
    createMarkStyle (feature, fontAngle) {
      //返回一个样式
      return new OlStyleStyle({
        //文本样式
        text: new Text({
          textAlign: 'center',
          textBaseline: 'middle',
          font: 'normal 12px 微软雅黑',
          text: feature.get('name'),
          fill: new Fill({
            color: '#bbbbbb'
          }),
          rotation: fontAngle * Math.PI / 180,
          padding: [2, 5, 2, 5],
        }),
        // 设置层级
        zIndex: 1999999999
      });
    },

    createMarkFeature (featureParam) {
      // 初始化标签要素
      let cordinate = transform(
        featureParam.geometry.coordinates,
        "EPSG:4548",
        "EPSG:3857"
      )
      let fontAngle = featureParam.properties.font_angle;
      let feature = new Feature({
        geometry: new OlGeomPoint(cordinate),
        name: featureParam.properties.name,
        // img: require('../../assets/images/mark.png'),
      })
      feature.setId(featureParam.id)
      feature.setStyle(this.createMarkStyle(feature, fontAngle))
      let source = new VectorSource({})
      source.addFeature(feature)
      let layer = new VectorLayer({
        source: source
      })
      this.markVectorArray.push(layer);
      this.mapData.addLayer(layer);
    },

    addRoadMark (viewObj) {
      try {
        if (viewObj.markDataCache != null) {
          let featureArray = viewObj.markDataCache.features;
          featureArray.forEach(item => {
            viewObj.createMarkFeature(item);
          })
          return;
        }
        let url = process.env.VUE_APP_GIS_BASE_URL + '/Test/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=' + this.markLayerName + '&maxFeatures=500000000&outputFormat=application%2Fjson';
        axios.get(url, null).then(function (res) {
          let markRespData = res.data;
          viewObj.markDataCache = res.data;
          if (markRespData) {
            let featureArray = markRespData.features;
            featureArray.forEach(item => {
              viewObj.createMarkFeature(item);
            })

          }

        });
      } catch (error) {
        console.error(error)
      }
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
      let featureVal = feature.properties;
      let layer = featureVal.layer == null ? "" : featureVal.layer;
      let handle = featureVal.handle == null ? "" : featureVal.handle;
      let length = featureVal.length == null ? "" : Math.floor(featureVal.length) + " m";
      let capacity = featureVal.capacity == null ? "" : featureVal.capacity + ' pcu/h';
      let dir = featureVal.dir == 1 ? "单向" : featureVal.dir == -1 ? "反向单向" : featureVal.dir == 0 ? "双向" : '';
      let speed = featureVal.speed == null ? "" : featureVal.speed + ' m/h';


      let popHtml = `
            <div style='color:#121924;font-weight: bold;width:100%;z-index:4;height:50px;padding:6px;font-size: 15px'>`+ layer + `</div>
  
            <div style='font-size: 10px;width:100%' id='info1'>
`
      if (handle != '') {
        popHtml = popHtml + `
        <div style="height: 28px;width:100%">
          <a style="color:#646566;width:45%;display: inline-block;">道路ID:</a>
          <a style="text-align: right;font-size:14px;width:50%;display: inline-block;">`+ handle + `</a>
        </div> `
      }
      if (layer != '') {
        popHtml = popHtml + `
        <div style="height: 28px;width:100%">
          <a style="color:#646566;width:45%;display: inline-block;">道路等级:</a>
          <a style="text-align: right;font-size:14px;width:50%;display: inline-block;">`+ layer + `</a>
        </div> `
      }
      if (length != '') {
        popHtml = popHtml + `
        <div style="height: 28px;width:100%">
          <a style="color:#646566;width:45%;display: inline-block;">道路长度:</a>
          <a style="text-align: right;font-size:14px;width:50%;display: inline-block;">`+ length + `</a>
        </div> `
      }
      if (dir != '') {
        popHtml = popHtml + `
        <div style="height: 28px;width:100%">
          <a style="color:#646566;width:45%;display: inline-block;">方向:</a>
          <a style="text-align: right;font-size:14px;width:50%;display: inline-block;">`+ dir + `</a>
        </div> `
      }
      if (capacity != '') {
        popHtml = popHtml + `
        <div style="height: 28px;width:100%">
          <a style="color:#646566;width:45%;display: inline-block;">通行能力:</a>
          <a style="text-align: right;font-size:14px;width:50%;display: inline-block;">`+ capacity + `</a>
        </div> `
      }
      if (speed != '') {
        popHtml = popHtml + `
        <div style="height: 28px;width:100%">
          <a style="color:#646566;width:45%;display: inline-block;">设计车速:</a>
          <a style="text-align: right;font-size:14px;width:50%;display: inline-block;">`+ speed + `</a>
        </div> `
      }

      popHtml = popHtml + `
        <div style="height: 28px;width:100%">
          <a style="color:#646566;width:45%;display: inline-block;">建设信息:</a>
          <a style="text-align: right;font-size:14px;width:50%;display: inline-block;">规划道路</a>
        </div> </div > `
      content.innerHTML = popHtml;
      // 设置弹出层位置即可出现
      this.overlay.setPosition(coordinate)
      document.getElementsByClassName('ol-popup').style.display = 'block';
    },

    // 清除弹出框
    removePopup () {
      if (this.overlay) {
        // 设置位置undefined可达到隐藏清除弹出框
        this.overlay.setPosition(undefined)
        this.clearHighlight()
      }
    },
    showSummryPop () {
      this.showPop = false
      this.hidPop = true
    },

    hideSummryPop () {
      this.showPop = true
      this.hidPop = false
    },
    changeStyle (lengendList, checkedList) {
      if (checkedList == null || checkedList.length == 0) {
        vectorLayer.setVisible(false);
        return;
      }
      vectorLayer.setVisible(true);
      var changeStyle = false;
      var initSld = '<?xml version="1.0" encoding="GBK"?><StyledLayerDescriptor version="1.0.0" xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:gml="http://www.opengis.net/gml" xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.0.0/StyledLayerDescriptor.xsd"><NamedLayer><Name>' + layerName + '</Name><UserStyle><Name>roadType</Name><Title>roadType</Title><Abstract>roadType</Abstract><FeatureTypeStyle>';
      lengendList.forEach((item) => {
        var typeName = item.lengendTypeName;
        var lengendTypeValue = item.lengendTypeValue;
        var filterProperty = item.filterProperty;
        var stroke = item.stroke;
        var strokeWidth = item.strokeWidth;
        var dashOffset = item.dashOffset;
        var dasharray = item.dasharray;
        //
        var index = checkedList.findIndex(item => {
          return item === lengendTypeValue;
        })
        var enableSelect = item.enableSelect
        if (!enableSelect || index != -1) {
          changeStyle = true;
          initSld = initSld + '<Rule><Title>' + typeName + '</Title><ogc:Filter><ogc:PropertyIsEqualTo><ogc:PropertyName>' + filterProperty + '</ogc:PropertyName><ogc:Literal>' + typeName + '</ogc:Literal></ogc:PropertyIsEqualTo></ogc:Filter>' + '<PolygonSymbolizer><Stroke><CssParameter name="stroke">' + stroke + '</CssParameter><CssParameter name="stroke-width">' + strokeWidth + '</CssParameter>';
          if (dashOffset) {
            initSld = initSld + '<CssParameter name="stroke-dashoffset">' + dashOffset + '</CssParameter>'
          }
          if (dasharray) {
            initSld = initSld + '<CssParameter name="stroke-dasharray">' + dasharray + '</CssParameter>'
          }
          initSld = initSld + '</Stroke></PolygonSymbolizer></Rule>'
        }
      });
      initSld = initSld + '</FeatureTypeStyle></UserStyle></NamedLayer></StyledLayerDescriptor>';
      if (changeStyle) {
        vectorLayer.getSource().updateParams({ 'STYLES': undefined, 'SLD_BODY': initSld });
      }

    },




    //道路类型样式改变
    roadTypeChange () {
      this.removePopup();
      this.clearHighlight();
      this.changeStyle(this.roadTypeLengendList, this.roadTypeRadio);
    },

    //建设状态样式
    buildStatusChange () {
      this.clearHighlight();
      this.removePopup();
      this.changeStyle(this.buildStatusLengendList, this.radio2);
    },

    switchChange () {
      var changeVal = this.value1;
      changeVal ? this.buildStatusChange() : this.roadTypeChange();
    },

    //删除高亮图层
    clearHighlight () {
      let arr = this.mapData.getLayers().array_
      let highlightLayer = {}
      arr.forEach(item => {
        if (item.get("id") == "highlightLayer") {
          highlightLayer = item
        }
      })
      if (highlightLayer && highlightLayer.className_) {
        this.mapData.removeLayer(highlightLayer)
      }
    },

    //新增高亮图层
    addHighLightStyle (clickFeature, thisObj, clickLayer) {
      this.clearHighlight();
      let featureObj = new GeoJSON({ featureProjection: 'EPSG:3857', dataProjection: 'EPSG:4548' }).readFeatures(clickFeature)
      let highLightStyle = new Style({
        fill: new Fill({
          color: "#ffff00"
        }),
        stroke: new Stroke({
          color: "#ffff00",

          width: 6
        }),

      })
      featureObj[0].setStyle(highLightStyle);
      thisObj.highLightLayer = new VectorLayer({
        name: "highlightLayer",
        source: new VectorSource({
          features: featureObj,
        }),
        style: (feature, solution) => {
          let currentStyle = feature.getSource().getResolution().style;
          return highLightStyle;
        }
      })
      thisObj.highLightLayer.set("id", "highlightLayer")
      this.mapData.addLayer(thisObj.highLightLayer)


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
              thisObj.addHighLightStyle(objData.features[0], thisObj, vectorLayer)

            } else {
              thisObj.removePopup();
            }

          });
      } else {
        this.removePopup();
      }
    },

    mapMoveend (evt) {
      var zoom = this.mapData.getView().getZoom();
      if (zoom > this.markMinZoom && this.markFlag == false) {
        this.markFlag = true;
        this.addRoadMark(this);
      } else if (zoom <= this.markMinZoom && this.markFlag == true) {
        this.markFlag = false;
        this.markVectorArray.forEach(item => {
          this.mapData.removeLayer(item);
        })
        this.markVectorArray = [];
      }
    },
    handleCheckChange (data_) {
      this.clearHighlight();
      this.removePopup();
      let halfCheckNode = this.$refs.tree.getHalfCheckedNodes();
      let halfCheckIds = [];
      halfCheckNode.forEach(item => {
        halfCheckIds.push(item.id)
      });
      //获取选中以及半选中节点
      var checkedArray = this.$refs.tree.getCheckedKeys(false);
      checkedArray = checkedArray.concat(halfCheckIds);
      let checkedLayerArray = this.getLayerMap(checkedArray);
      let currentLayers = this.layerArray;
      //如果当前选中数组为空，当前所有图层隐藏
      if (checkedLayerArray == null || checkedLayerArray.length == 0) {
        currentLayers.forEach(item => {
          item.setVisible(false)
        })
        return;
      }
      //获取待添加的图层(图例树初始化部分选中)
      for (let i = 0; i < checkedLayerArray.length; i++) {
        if (!checkedLayerArray[i].layerName) {
          continue;
        }
        let treeDataItem = checkedLayerArray[i].treeDataItem;
        if (!treeDataItem) {
          currentLayers.forEach(item => {
            if (item.values_.name == checkedLayerArray[i].layerName) {
              item.setVisible(false)

            }
          })
          continue;
        }
        for (let j = 0; j < treeDataItem.length; j++) {
          let item = treeDataItem[j];
          let exist = false;
          for (let n = 0; n < currentLayers.length; n++) {
            let layer = currentLayers[n];
            if (layer.values_.filterVal == item.filterValue &&
              layer.values_.name == checkedLayerArray[i].layerName) {
              exist = true;
              layer.setVisible(true)
              continue;
            }

          }
        }
      }

      //隐藏取消勾选的图层
      if (!currentLayers || currentLayers.length == 0) {
        return;
      }
      let existLayer = [];
      for (let k = 0; k < currentLayers.length; k++) {
        let exist = false;
        for (let i = 0; i < checkedLayerArray.length; i++) {
          let tempItems = checkedLayerArray[i].treeDataItem;
          let layArray_ = this.getAreaLineLays(checkedLayerArray[i].layerName, currentLayers[k].values_.filterVal);
          for (let m = 0; m < tempItems.length; m++) {
            if (currentLayers[k].values_.filterVal == tempItems[m].filterValue &&
              currentLayers[k].values_.name == checkedLayerArray[i].layerName) {
              exist = true;
              if (existLayer.indexOf(tempItems[m].filterValue) == -1 && layArray_.length > 1) {
                existLayer.push(tempItems[m].filterValue);
              }
              currentLayers[k].setVisible(true);
              break;
            }
          }
        }
        if (!exist) {
          currentLayers[k].setVisible(false);

        }
      }
    },

  }

}


</script>

<style scoped lang="scss">
@import '~@/assets/styles/draws.scss';
@import '~@/assets/styles/popup.scss';
@import '~@/assets/styles/switch.scss';
.el-checkbox-group {
  width: 100%;
}
.colorBox {
  width: 48px;
  display: inline-block;
  border-radius: 2px;
  position: absolute;
  right: 10px;
  top: 6px;
}
.el-checkbox-group .el-checkbox:nth-child(1) .colorBox {
  height: 12px;
}
.el-checkbox-group .el-checkbox:nth-child(2) .colorBox {
  height: 11px;
}
.el-checkbox-group .el-checkbox:nth-child(3) .colorBox {
  height: 10px;
}
.el-checkbox-group .el-checkbox:nth-child(4) .colorBox {
  height: 9px;
}
.el-checkbox-group .el-checkbox:nth-child(5) .colorBox {
  height: 8px;
}
.el-checkbox-group .el-checkbox:nth-child(6) .colorBox {
  height: 7px;
}
.el-checkbox-group .el-checkbox:nth-child(7) .colorBox {
  height: 6px;
}
.road-selector-color {
  width: 100%;
}
::v-deep .el-checkbox {
  position: relative;
  display: block;
  height: 26px;
  // line-height: 26px;
  width: 100%;
}
</style>
