<template>
  <div id="map" ref="map">
    <!--点击查看详情弹框-->
    <div id="popup" class="ol-popup2">
      <a
        href="#"
        id="popup-closer"
        class="ol-popup-closer2"
        @click="removePopup"
      />
      <div id="popup-content"></div>
    </div>
    <!--道路选择器-->
    <div class="switch-div">
      <el-switch
        active-color="#004AB3"
        inactive-color="#ACAFB3"
        v-model="trafficData"
        active-text="显示交通数据"
        inactive-text=""
      >
      </el-switch>
    </div>
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
          <el-tree
            style="height: 200px; overflow: auto"
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
    </div>

    <!--总体信息浮动框-->
    <transition name="move">
      <div id="pop-summry" class="ol-layer" v-if="hidPop">
        <div class="mbg"></div>
        <!--总体信息控制图层(上)-->
        <div class="pop-summry-control" @click="hideSummryPop">
          <div>
            <div class="pop-summry-control-title">
              <span>总体信息</span>
              <img
                src="~@/assets/images/arrow-down.png"
                class="jt-icon"
              />
            </div>
          </div>
        </div>
        <!--总体信息表格-->
        <scoll-div-vue style="padding: 25px">
          <!--总体信息表格-->
          <div class="div-bg" v-for="(item, index) in tableArray" :key="index">
            <table
              class="ol-popsummry-detail-table"
              v-if="item.cptType == 'TABLE'"
            >
             <span class="table-title" v-show="item.title !=null">{{item.title}}</span>
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
      <div id="pop-summry—collapse" class="ol-layer" v-if="showPop">
        <div class="pop-summry-control">
          <div>
            <div class="pop-summry-control-title blue-title">
              <span @click="showSummryPop">总体信息</span>
              <img
                src="~@/assets/images/arrow-up.png"
                class="jt-icon"
                @click="showSummryPop"
              />
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
import { transform } from 'ol/proj'
import proj4 from 'proj4'
import { register } from 'ol/proj/proj4';
import VectorSource from 'ol/source/Vector'
import VectorLayer from 'ol/layer/Vector'
import { TileWMS } from 'ol/source'

import Feature from 'ol/Feature'
import { Draw } from 'ol/interaction'
import { Style, Circle, Stroke, Fill } from 'ol/src/style'
import WKT from 'ol/format/WKT'
import GeoJSON from 'ol/format/GeoJSON'
import Overlay from 'ol/Overlay'
import * as echarts from "echarts";
import axios from 'axios'
import { findComponentInfo } from "@/api/config/component";
import { getUrlKey, request } from '@/utils/request'
import Vue from 'vue'
import nav_barVue from '../components/nav_bar.vue'
import bar_chart_vVue from '../traffic-decision/components/bar_chart_v.vue'
import pie_chartVue from '../traffic-decision/components/pie_chart.vue'
import scollDivVue from '../traffic-decision/components/scollDiv.vue'
import bar_chart_hVue from '../traffic-decision/components/bar_chart_h.vue'
const centerCordinate = [118.725493, 32.079162]
//坐标定义
proj4.defs("EPSG:4548", "+proj=tmerc +lat_0=0 +lon_0=117 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs");
register(proj4);
//是否展示总体信息标识
var showSummryFlag = true;
//Test:road_area Test:road_area0808
const layerName = 'Test:road_area0808'
var vectorLayer;
//地图初始化
const view = new View({
  center: transform(centerCordinate, 'EPSG:4326', 'EPSG:3857'),
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

export default {
  name: "Road",
  components: {
    nav_barVue, scollDivVue, bar_chart_vVue, pie_chartVue, bar_chart_hVue
  },
  data () {
    return {
      navList: ['信息查询', '交通小区信息'],
      trafficData: 'false',//交通开关
      value1: 'true',   //开关
      radio: [],        //道路等级
      radio2: [],       //建设信息
      geoJsonList: {},
      roadBasicInfo: {},
      myChart: {},
      menuId: '',
      tableArray: [],
      treeData: [],
      treeData2: [],
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      defaultCheckedIds: [],
      defaultExpandIds: [],
      hidPop: false,
      showPop: true,
    }
  },
  mounted () {
    this.initMap();
    this.menuId = getUrlKey('menuId');
    this.initComponentInfo()
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
    document.getElementById('pop-summry—collapse').style.display = 'none';
    //交通信息点击按钮
    window.preview1 = function () {
      document.getElementById('info2').style.display = 'block';
      document.getElementById('info1').style.display = 'none';
      document.getElementById('btn1').style.background = '#004AB3';
      document.getElementById('btn2').style.background = '#D3D6DB';
    }
    //基本信息点击按钮
    window.preview2 = function () {
      document.getElementById('info2').style.display = 'none';
      document.getElementById('info1').style.display = 'block';
      document.getElementById('btn2').style.background = '#004AB3';
      document.getElementById('btn1').style.backgroundColor = '#D3D6DB';
    }
  },



  methods: {
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
        _this.tableArray = response.data.tableList;


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
    handleCheckChange () { },
    // 初始化地图
    initMap () {
      const mapContainer = this.$refs.map
      const FullScreen = new olControl.FullScreen() // 全屏控件
      // //通过wms加载数据
      const wmsSource = new TileWMS({
        url: process.env.VUE_APP_GIS_BASE_URL + '/wms',
        //  projection: 'EPSG:3857',
        params: {
          'LAYERS': layerName,
          'VERSION': '1.1.0',
          'STYLES': '',
          'FORMAT': 'image/png',

        },
        serverType: 'geoserver'
      });
      //自定义图层
      vectorLayer = new TileLayer({
        source: wmsSource
      });

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
    // 弹出框
    addPopup (coordinate, feature) {
      this.removePopup()
      // 获取弹出层DOM
      let container = document.getElementsByClassName('popup')
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
      let featureProperties = feature.properties;
      let sectionTypeName = featureProperties.f;

      let trafficTotalNum = featureProperties.a;
      let trafficAttractNum = featureProperties.a1;
      let motorNum = featureProperties.f1;
      let motorAttractNum = featureProperties.f2;

      let noMotorNum = featureProperties.f3;
      let noMotorAttractNum = featureProperties.f4;

      let peopleNum = featureProperties.p;
      let peopleAttractNum = featureProperties.p1;

      let area = featureProperties.area;

      //   (.innerHTML = "<a href='#' οnclick=\"doGo(this.title);return false;\" >" + citys + "</a>";)
      content.innerHTML = `
            <div style='color:#121924;font-weight: bold;width:100%;z-index:4;height:95px;padding:6px;font-size: 15px'>`+ sectionTypeName + `
            <div style='margin-top:10px'><button id='btn1' style='margin-right:10px;border: none;height: 28px;line-height: 28px;border-radius: 4px;width: 80px;background: #004AB3;color: #ffffff;' onclick="preview1()">基本信息</button>
            <button id='btn2' style="border: none;height: 28px;line-height: 28px;border-radius: 4px;width: 80px;background: #D3D6DB;color: #ffffff;" onclick="preview2()">交通信息</button></div>
            </div>
            <el-row :gutter="20" style='font-size: 10px;width:100%' id='info1'>
                <el-col :span='12' style="width:45%;display:inline-block">
                    <div style="color:#646566;height: 22px;">交通高峰产生总量:</div>
                    <div style="font-size:14px;height: 26px;">`+ trafficTotalNum + `万人次/小时</div>
                </el-col>
                <el-col :span='12' style="width:45%;display:inline-block;margin-left:5%">
                    <div class='poptable-th' style="color:#646566;height: 22px;">交通高峰吸引总量:</div>
                    <div style="font-size:14px;height: 26px;">`+ trafficAttractNum + `万人次/小时</div>
                </el-col>
                <el-col :span='12' style="width:45%;display:inline-block">
                    <div class='poptable-th' style="color:#646566;height: 22px;">机动车产生量:</div>
                    <div style="font-size:14px;height: 26px;">`+ motorNum + `万 pcu/小时</div>
                </el-col>
                <el-col :span='12'style=" width:45%;display:inline-block;margin-left:5%">
                    <div class='poptable-th' style="color:#646566;height: 22px;">机动车吸引量:</div>
                    <div style="font-size:14px;height: 26px;">`+ motorAttractNum + `万 pcu/小时</div>
                </el-col>
                <el-col :span='12' style="width:45%;display:inline-block">
                    <div class='poptable-th' style="color:#646566;height: 22px;">非机动车产生量:</div>
                    <div style="font-size:14px;height: 26px;">`+ noMotorNum + `万 pcu/小时</div>
                </el-col>
                <el-col :span='12' style="width:45%;display:inline-block;margin-left:5%">
                    <div class='poptable-th' style="color:#646566;height: 22px;">非机动车吸引量:</div>
                    <div style="font-size:14px;height: 26px;">`+ noMotorAttractNum + `万 pcu/小时</div>
                </el-col>
                <el-col :span='12' style="width:45%;display:inline-block">
                    <div class='poptable-th' style="color:#646566;height: 22px;">行人产生量:</div>
                    <div style="font-size:14px;height: 26px;">`+ peopleNum + `万 pcu/小时</div>
                </el-col>
                <el-col :span='12' style="width:45%;display:inline-block;margin-left:5%">
                    <div class='poptable-th' style="color:#646566;height: 22px;">行人吸引量:</div>
                    <div style="font-size:14px;height: 26px;">`+ peopleAttractNum + `万 pcu/小时</div>
                </el-col>
            </el-row>
            <div style='font-size: 10px;width:100%' id='info2'>
                <div style="height: 26px;width:100%">
                    <a style="color:#646566;width:45%;display: inline-block;">面积:</a>
                    <a style="text-align: right;font-size:14px;width:50%;display: inline-block;">`+ area + ` km²</a>
                </div>
                <div style="height: 26px;width:100%">
                    <a style="color:#646566;width:45%;display: inline-block;">用地性质:</a>
                    <a style="text-align: right;font-size:14px;width:50%;display: inline-block;">`+ sectionTypeName + `</a>
                </div>
                <div style="height: 26px;width:100%">
                    <a style="color:#646566;width:45%;display: inline-block;">规划人口:</a>
                    <a style="text-align: right;font-size:14px;width:50%;display: inline-block;">1.02 万人</a>
                </div>
                <div style="height: 26px;width:100%">
                    <a style="color:#646566;width:45%;display: inline-block;">岗位数量:</a>
                    <a style="text-align: right;font-size:14px;width:50%;display: inline-block;">3457</a>
                </div>
            </table>
            `
      // 设置弹出层位置即可出现
      this.overlay.setPosition(coordinate)
      document.getElementById('info1').style.display = 'none';
    },
    // 清除弹出框
    removePopup () {
      if (this.overlay) {
        // 设置位置undefined可达到隐藏清除弹出框
        this.overlay.setPosition(undefined)
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

    updateSoldBody (radioCheckedValues, radioValues, filterProp) {
      var defaultFillColor = '#AAAAAA'
      var defaultStokeColor = '#000000'
      var uncheckedSid = '<PolygonSymbolizer><Fill><CssParameter name="fill">' + defaultFillColor + '</CssParameter></Fill><Stroke><CssParameter name="stroke">' + defaultStokeColor + '</CssParameter><CssParameter name="stroke-width">1</CssParameter></Stroke></PolygonSymbolizer>';
      var dynamicSld = '<?xml version="1.0" encoding="GBK"?><StyledLayerDescriptor version="1.0.0" xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:gml="http://www.opengis.net/gml" xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.0.0/StyledLayerDescriptor.xsd"><NamedLayer><Name>' + layerName + '</Name><UserStyle><Name>landType</Name><Title>roadType</Title><Abstract>landType</Abstract><FeatureTypeStyle>';
      var defaultSld = '<Rule><Title>default</Title><ogc:Filter><ogc:And>';
      for (var i = 0; i < radioValues.length; i++) {
        let landTypeChekedVal = radioCheckedValues.find(item => {
          return item == radioValues[i].value;
        });
        var parcelTypeNm = radioValues[i].parcelType;
        if (landTypeChekedVal) {
          dynamicSld = dynamicSld + '<Rule><Title>' + parcelTypeNm + '</Title><ogc:Filter><ogc:PropertyIsEqualTo><ogc:PropertyName>' + filterProp + '</ogc:PropertyName><ogc:Literal>' + parcelTypeNm + '</ogc:Literal></ogc:PropertyIsEqualTo></ogc:Filter>' + '<PolygonSymbolizer><Fill><CssParameter name="fill">' + radioValues[i].color + '</CssParameter></Fill><Stroke><CssParameter name="stroke">' + radioValues[i].color + '</CssParameter><CssParameter name="stroke-width">3</CssParameter></Stroke></PolygonSymbolizer></Rule>';
        } else {
          dynamicSld = dynamicSld + '<Rule><Title>' + parcelTypeNm + '</Title><ogc:Filter><ogc:PropertyIsEqualTo><ogc:PropertyName>' + filterProp + '</ogc:PropertyName><ogc:Literal>' + parcelTypeNm + '</ogc:Literal></ogc:PropertyIsEqualTo></ogc:Filter>' + uncheckedSid + '</Rule>';

        }
        //默认样式组装
        defaultSld = defaultSld + '<ogc:PropertyIsNotEqualTo><ogc:PropertyName>' + filterProp + '</ogc:PropertyName><ogc:Literal>' + parcelTypeNm + '</ogc:Literal></ogc:PropertyIsNotEqualTo>';
      }
      var defaultFillColor = '#AAAAAA'
      var defaultStokeColor = '#000000'

      defaultSld = defaultSld + '</ogc:And></ogc:Filter>' + uncheckedSid + '</Rule>'
      dynamicSld = dynamicSld + defaultSld + '</FeatureTypeStyle></UserStyle></NamedLayer></StyledLayerDescriptor>';

      vectorLayer.getSource().updateParams({ 'STYLES': undefined, 'SLD_BODY': dynamicSld });
    },

    //用地类型选中事件
    parceTypeChange (e) {
      this.updateSoldBody(this.radio, this.parceTypeleLengend, 'f')
    },

    //建设状态选中事件
    buildTypeChange (e) {
      this.updateSoldBody(this.radio2, this.buildTypeLengend, 'f')
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
@import '~@/assets/styles/draws.scss';
@import '~@/assets/styles/popup.scss';
@import '~@/assets/styles/switch.scss';

</style>
