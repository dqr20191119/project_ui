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
        <div class="div-switch">
          <div class="switch-title">背景底图</div>
          <el-switch
            v-model="value1"
            active-color="#004AB3"
            inactive-color="#004AB3"
            active-text="卫星地图"
            inactive-text="电子地图"
            @change="switchChange"
          >
          </el-switch>
        </div>
        <el-collapse accordion class="nav-select" v-model="ac">
          <el-collapse-item name="1">
            <template slot="title"> 显示图层 </template>
            <el-tree
              ref="tree"
              :data="filterTreeData"
              show-checkbox
              node-key="id"
              :default-checked-keys="[1, 2, 3, 4, 5]"
              :props="defaultProps"
              @check="handleCheckChange"
            >
              <span class="custom-tree-node" slot-scope="{ node, data }">
                <span>
                  {{ node.label }}
                </span>
                <span
                  class="dot"
                  :style="{ background: data.strokeColor }"
                ></span>
              </span>
            </el-tree>
          </el-collapse-item>
        </el-collapse>
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
import LineString from 'ol/geom/LineString';
import MultiLineString from 'ol/geom/MultiLineString';
import MultiPolygon from 'ol/geom/MultiPolygon';



import Vue from 'vue'
//中心坐标
const centerCordinate = [656951.22379894, 3559139.26626369]
const vectorLayerArray = [];
const layerNames = ['Test:road_area0808', 'Test:lines_view'];
//坐标定义
proj4.defs("EPSG:4548", "+proj=tmerc +lat_0=0 +lon_0=117 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs");
register(proj4);
//是否展示总体信息标识
var showSummryFlag = true;
// 道路类型图例常量
const roadTypeName = ['快速路', '主干路', '次干路', '支路'];
const roadTypeNum = ['1', '2', '3', '4'];
const roadTypeColor = ['#b1db16', '#ebcc0c', '#eb7323', '#1979ff'];
//图层名称 待修改 Test:GH_DL
const layerName = "	Test:gh_dl";


var vectorLayer;
var vectorLayer2;
//地图初始化
const view = new View({
  center: transform(centerCordinate, 'EPSG:4548', 'EPSG:3857'),
  minZoom: 4,
  maxZoom: 18,
  zoom: 13.7 // 地图初始化的缩放级别
})



//高德地图图层
const gaodeMapLayer = new TileLayer({
  source: new XYZ({
    url: 'http://webst0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}'
  })
});

//卫星地图
const wxMapLayer = new TileLayer({
  source: new XYZ({
    crossOrigin: "anonymous",
    url: 'http://t0.tianditu.gov.cn/img_w/wmts?tk=129364168580e7f0e3ff5bd759d41a75&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=tiles'
  })
});



export default {
  name: "Road",
  data () {
    return {
      ac: '1',
      value1: 'true',
      roadTypeRadio: [],
      radio2: [],
      addForm: {
        sDeptName: '',
        sDeptId: ''
      },
      checkedLayerArray: [],
      vectorArray: [],
      popDetailFlag: false,
      filterTreeData: [],
      treeData: [{
        id: 1,
        label: '道路',
        layerName: "Test:gh_dl",
        filterKey: 'layer',
        fillTyple: "fill",
        children: [{
          id: 11,
          label: '01北站快速路',
          literal: '01北站快速路',
          fillColor: "#C6D7F5",
          strokeColor: "#8D9092",
          width: "1",

        }, {
          id: 12,
          label: '02朱家山河路',
          literal: '02朱家山河路',
          fillColor: "#C6D7F5",
          strokeColor: "#8D9092",
          width: "1",

        }, {
          id: 13,
          label: '03站南一路',
          literal: '03站南一路',
          fillColor: "#C6D7F5",
          strokeColor: "#8D9092",
          width: "1",

        },
        {
          id: 14,
          label: '04站南二路',
          literal: '04站南二路',
          fillColor: "#C6D7F5",
          strokeColor: "#8D9092",
          width: "1",

        },
        {
          id: 15,
          label: '05站西路',
          fillColor: "#C6D7F5",
          strokeColor: "#8D9092",
          literal: '05站西路',
          width: "1",

        },
        {
          id: 16,
          label: '06涉段节点道',
          literal: '06涉段节点道',
          fillColor: "#C6D7F5",
          strokeColor: "#8D9092",
          width: "1",

        },
        {
          id: 17,
          label: '07西快线',
          literal: '07西快线',
          fillColor: "#C6D7F5",
          strokeColor: "#8D9092",
          width: "1",

        }, {
          id: 18,
          label: '08涉铁支路',
          literal: '08涉铁支路',
          fillColor: "#C6D7F5",
          strokeColor: "#8D9092",
          width: "1",

        }]

      }, {
        id: 2,
        label: '河道',
        layerName: "Test:gh_hd_v2",
        filterKey: 'layer',
        fillTyple: "fill",
        children: [{
          id: 21,
          label: '01中心河',
          literal: '01中心',
          fillColor: "#d9f2ce",
          strokeColor: "#8D9092",
          width: "1",

        }, {
          id: 22,
          label: '02东一河',
          literal: '02东一',
          fillColor: "#d9f2ce",
          strokeColor: "#8D9092",
          width: "1",

        }]
      }, {
        id: 4,
        label: '市政管线工程',
        filterKey: 'layer',
        layerName: "Test:gh_gx",
        children: [{
          id: 41,
          label: '01市政管线工程',
          literal: '01市政管线',
          fillColor: "#949D42",
          strokeColor: "#949D42",
          width: "1",

        }]
      },
      {
        id: 5,
        label: '水域',
        filterKey: 'layer',
        layerName: "Test:gh_sy",
        fillTyple: "fill",
        // display: false,
        children: [{
          id: 51,
          label: '01水域',
          literal: '01水域',
          fillColor: "#BEE4F7",
          width: "1",

        }]
      },
      {
        id: 3,
        label: '水环境整治',
        filterKey: 'layer',
        layerName: "Test:gh_shjzz",
        fillTyple: "fill",
        children: [{
          id: 31,
          label: '01水环境整治工程',
          literal: '01水环境',
          fillColor: "#FFC8FE",
          strokeColor: "#8D9092",
          width: "1",

        }]
      }

      ],

      defaultProps: {
        children: 'children',
        label: 'label'
      },
      projectRadio: ["1", "2"],
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
    this.initLayer();
    document.getElementById('popup').style.display = 'none';

  },

  created () {
    //过滤不需要展示树形节点
    this.filterDataTree();
  },



  methods: {

    filterDataTree () {
      this.treeData.forEach(item => {
        if (item.display != false) {
          this.filterTreeData.push(item);
        }
      })

    },

    initCheckedLayer () {
      var checkedArray = this.$refs.tree.getCheckedKeys(false);
      var layerNameArray = [];
      this.treeData.forEach(item => {
        var idIndex = checkedArray.findIndex(item2 => {
          return item2 == item.id;
        });
        //图例树层级不展示需要加载到图层
        if (idIndex != -1 || item.display == false) {
          let layerNameTmp = item.layerName;
          if (layerNameTmp) {
            layerNameArray.push({
              layerName: layerNameTmp,
              filterKey: item.filterKey,
              treeDataItem: item
            })
          }
        }
      })
      this.checkedLayerArray = layerNameArray;
    },



    handleCheckChange (data, checkedInfo) {
      this.removePopup();
      this.clearHighlight();
      //图层显隐藏
      var isParentCheckBox = data.layerName != '' && data.layerName != undefined;
      var checkedKeys = checkedInfo.checkedKeys;
      var chekboxId = data.id;
      var index = checkedKeys.findIndex(item => {
        return item == chekboxId;
      })
      let checked = (index != -1)
      //设置图层显隐
      if (isParentCheckBox) {
        this.vectorArray.forEach((element, index) => {
          if (element.id == chekboxId) {
            checked ? element.vectorLayer.setVisible(true)
              : element.vectorLayer.setVisible(false);
          }
        })
      }
      //设置图层属性样式
      let treeDataItem;
      let parentNode;
      if (isParentCheckBox) {
        parentNode = this.$refs.tree.getNode(chekboxId);
      } else {
        let currentNode = this.$refs.tree.getNode(chekboxId);
        parentNode = currentNode.parent.data;
      }
      var parentNodeId = parentNode.id;
      const vectoryLayerTmpArray = this.vectorArray.filter(item => item.id == parentNodeId)
      treeDataItem = JSON.parse(JSON.stringify(parentNode));
      let treeeDataChildren = [];
      treeDataItem.children.forEach(item => {
        var isItemChecked = checkedKeys.findIndex(item2 => {
          return item2 == item.id;
        })
        if (isItemChecked != -1) {
          treeeDataChildren.push(item);
        }
      })
      let vectoryLayerTmp = vectoryLayerTmpArray[0].vectorLayer
      if (treeeDataChildren.length == 0) {
        vectoryLayerTmp.setVisible(false);
        return;
      }
      treeDataItem.children = treeeDataChildren;
      let changeStyleParam = {
        layerName: parentNode.layerName,
        filterKey: parentNode.filterKey,
        treeDataItem: treeDataItem
      }
      this.initStyle(changeStyleParam, (data) => {
        //子节点全部取消勾选，隐藏图层
        vectoryLayerTmp.setVisible(true);
        vectoryLayerTmp.getSource().updateParams({ 'STYLES': undefined, 'SLD_BODY': data });
      })

    },

    //初始化样式
    initStyle (checkedItem, callback) {
      if (checkedItem == null || checkedItem.length == 0) {
        callback(null);
      }
      let layerName = checkedItem.layerName;
      let filterKey = checkedItem.filterKey;
      var fillTyple = checkedItem.treeDataItem.fillTyple
      var initSld = '<?xml version="1.0" encoding="GBK"?><StyledLayerDescriptor version="1.0.0" xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:gml="http://www.opengis.net/gml" xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.0.0/StyledLayerDescriptor.xsd"><NamedLayer><Name>' + layerName + '</Name><UserStyle><Name>project</Name><Title>project</Title><Abstract>project</Abstract><FeatureTypeStyle>';
      checkedItem.treeDataItem.children.forEach((item) => {
        var literal = item.literal;
        var fillColor = item.fillColor;
        var strokeColor = item.strokeColor;
        var width = item.width;
        initSld = initSld + '<Rule><Title>' + literal + '</Title><ogc:Filter><ogc:PropertyIsEqualTo><ogc:PropertyName>' + filterKey + '</ogc:PropertyName><ogc:Literal>' + literal + '</ogc:Literal></ogc:PropertyIsEqualTo></ogc:Filter>' + '<PolygonSymbolizer>';
        if (fillTyple == 'fill') {
          initSld = initSld + '<Fill><CssParameter name="fill">' + fillColor + '</CssParameter></Fill>';
        }
        if (strokeColor != '' && strokeColor != undefined) {
          initSld = initSld + '<Stroke><CssParameter name="stroke">' + strokeColor + '</CssParameter><CssParameter name="stroke-width">' + width + '</CssParameter></Stroke>'
        }
        initSld = initSld + '</PolygonSymbolizer></Rule>';
      });
      initSld = initSld + '</FeatureTypeStyle></UserStyle></NamedLayer></StyledLayerDescriptor>';
      callback(initSld);
    },

    initLayer () {
      const roadLinesWms = new TileWMS({
        url: process.env.VUE_APP_GIS_BASE_URL + '/wms',
        projection: 'EPSG:3857',
        params: {
          'LAYERS': 'Test:Road_lines',
          'VERSION': '1.1.0'

        },
        serverType: 'geoserver'
      });
      //自定义图层1
      const roadLineLayer = new TileLayer({
        source: roadLinesWms
      });
      //底图：卫星图 高德底图 道路图
      wxMapLayer.setVisible(false);
      let layers = [wxMapLayer, gaodeMapLayer, roadLineLayer];
      this.initCheckedLayer();
      const mapContainer = this.$refs.map
      this.checkedLayerArray.forEach(item => {
        let sldBody;
        this.initStyle(item, (data) => {
          sldBody = data;
        })
        const wmsSourceTmp = new TileWMS({
          url: process.env.VUE_APP_GIS_BASE_URL + '/wms',
          projection: 'EPSG:4548',
          params: {
            'LAYERS': item.layerName,
            'VERSION': '1.1.0',
            'STYLES': undefined,
            'SLD_BODY': sldBody
          },
          serverType: 'geoserver'
        });
        const vectorLayerTemp = new TileLayer({
          source: wmsSourceTmp,
          name: item.layerName
        });
        this.vectorArray.push({
          id: item.treeDataItem.id,
          vectorLayer: vectorLayerTemp
        })
        layers.push(vectorLayerTemp)
      })
      const map = new Map({
        layers: layers,
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

      let projectName = feature.properties.项目名;
      let projectDesc = feature.properties.项目概;
      let start = feature.properties.起点;
      let end = feature.properties.终点 == null ? "" : feature.properties.终点;
      let length = feature.properties.长度 == null ? "" : feature.properties.长度;
      let jaf = feature.properties.建安费_;
      let ztz = feature.properties.总投资;
      let kcsjf = feature.properties.勘察设;
      let kcsjffh = feature.properties.勘察_1 == null ? "" : feature.properties.勘察_1;
      let status = feature.properties.目前工 == null ? "" : feature.properties.目前工;
      let bz = feature.properties.备注 == null ? "" : feature.properties.备注;

      //  word-break:keep-all; white-space:nowrap;overflow:hidden; text-overflow:ellipsis;

      content.innerHTML = `
                      <div style='color:#121924;font-weight: bold;width:100%;z-index:4;height:42px;padding:6px;font-size: 15px'>`+ projectName + `</div>
                      <div style='font-size: 10px;width:100%;line-height:30px;height:315px;overflow-y: auto;'>
                        <div style='margin-top:10px;line-height: 24px;'>
                          <span style="color:#646566;width: 90px;">项目概况：</span>
                          <div style="text-indent: 2rem;font-size:14px;">`+ projectDesc + `</div>
                        </div>
                          <div>
                            <span class='poptable-th' style="color:#646566;">起点：</span>
                            <span style="text-align: right;font-size:14px">`+ start + `</span>
                          </div>
                          <div>
                              <span class='poptable-th' style="color:#646566">目前工作进展：</span>
                              <span style="text-align: right;font-size:14px">`+ status + `</span>
                          </div>


                          <div>
                            <span class='poptable-th' style="color:#646566">终点：</span>
                            <span style="text-align: right;font-size:14px">`+ end + `</span>
                          </div>
                          <div>
                            <span class='poptable-th' style="color:#646566">长度/km：</span>
                            <span style="text-align: right;font-size:14px">`+ length + `</span>
                          </div>


                          <div>
                            <span class='poptable-th' style="color:#646566">总投资/亿元：</span>
                            <span style="text-align: right;font-size:14px">`+ ztz + `</span>
                          </div>

                        <div>
                          <span class='poptable-th' style="color:#646566">勘察设计费复核：</span>
                          <span style="text-align: right;font-size:14px">`+ kcsjffh + `</span>
                        </div>
                          <div style='line-height: 24px;>
                          <span class='poptable-th' style="color:#646566">备注：</span>
                          <span style="text-indent: 2rem;font-size:14px;">`+ bz + `</span>
                        </div>
                      </div>
                      `

      // 设置弹出层位置即可出现
      this.overlay.setPosition(coordinate)
      document.getElementById('popup').style.display = 'block';
    },

    // 清除弹出框
    removePopup () {
      console.log('移除弹框')
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



    clearHighlight () {
      let arr = this.mapData.getLayers().array_
      let oldLayer = {}
      arr.forEach(item => {
        if (item.get("id") == "highlightLayer") {
          oldLayer = item
        }
      })
      if (oldLayer && oldLayer.className_) {
        this.mapData.removeLayer(oldLayer)
      }
    },


    addHighLightStyle (clickFeature, thisObj, clickLayer) {
      this.clearHighlight();
      let featureObj = new GeoJSON({ featureProjection: 'EPSG:3857', dataProjection: 'EPSG:4548' }).readFeatures(clickFeature)
      let highLightStyle = new Style({
        fill: new Fill({
          color: "#ffff00",
        }),
        stroke: new Stroke({
          color: "#ffff00",
          width: 3.5
        }),

      })
      featureObj[0].setStyle(highLightStyle);
      thisObj.highLightLayer = new VectorLayer({
        name: "dk",
        source: new VectorSource({
          features: featureObj,
        }),
        style: (feature, solution) => {
          return highLightStyle;
        }
      })
      thisObj.highLightLayer.set("id", "highlightLayer")
      this.mapData.addLayer(thisObj.highLightLayer)


    },


    fechFeatureInfo: async function (url, thisObj, evt, clickLayer) {
      try {
        await axios.get(url, null).then(function (res) {
          var objData = res.data;
          if (objData && objData.features[0]) {
            if (thisObj.popDetailFlag == true) {
              return;
            }
            thisObj.popDetailFlag = true;
            thisObj.addPopup(evt.coordinate, objData.features[0]);
            //设置高亮图层
            thisObj.addHighLightStyle(objData.features[0], thisObj, clickLayer)

          } else {
            if (thisObj.popDetailFlag == false) {
              thisObj.removePopup();
            }
          }
        });
      } catch (error) {
        console.error(error)
      }
    },

    //卫星地图切换
    switchChange () {
      let layerTypeSelect = this.value1;
      gaodeMapLayer.setVisible(!layerTypeSelect)
      wxMapLayer.setVisible(layerTypeSelect)
    },



    //地图点击事件
    mapClick (evt) {
      this.removePopup();
      this.popDetailFlag = false;
      let thisObj = this;
      var viewResolution = view.getResolution();
      for (let k = 0; k < this.vectorArray.length; k++) {
        let item = this.vectorArray[k];
        let vectoryTemp = item.vectorLayer;
        let visible = vectoryTemp.values_.visible;
        //水域图层不展示详情
        if (this.popDetailFlag == true || item.id == 5 || !visible) {
          continue;
        }
        var featureUrl = vectoryTemp.getSource().getFeatureInfoUrl(
          evt['coordinate'],
          viewResolution,
          'EPSG:3857',
          { 'INFO_FORMAT': 'application/json' }
        );
        if (featureUrl) {
          this.fechFeatureInfo(featureUrl, thisObj, evt, vectoryTemp);
        } else {
          this.removePopup();
        }
      }

    }

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
  padding: 15px 15px 15px 25px;
  background: url(../../assets/images/pop_up_bg.png) no-repeat;
  background-size: 100% 100%;
}
#popup-content ::after {
  position: absolute;
  bottom: -15px;
  left: 148px;
  content: '';
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
::v-deep .el-checkbox {
  position: relative;
  display: block;

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
  width: 120px;
  height: 200px;
  z-index: 200000;
  position: fixed;
  margin-left: 70px;
  margin-top: 55px;
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
.el-collapse-item {
  width: 260px;
  height: 44px;
  opacity: 1;
  ::v-deep .el-collapse-item__header {
    height: 44px;
    padding-left: 10px;
    background: rgba(255, 255, 255, 0.96);
    box-shadow: 0px 5px 10px 1px rgba(180, 190, 204, 0.4);
    border-radius: 8px;
  }
}
::v-deep .el-collapse {
  border: none;
}
::v-deep .el-collapse-item__wrap {
  border-radius: 0 0 8px 8px;
  margin-top: -5px;
}
.dot {
  width: 24px;
  height: 10px;
  border-radius: 2px;
  display: inline-block;
  margin-left: 8px;
}
.div-switch {
  width: 260px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0px 5px 10px 1px rgba(180, 190, 204, 0.4);
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  .switch-title {
    font-weight: bold;
    font-size: 14px;
    margin-bottom: 8px;
  }
}
</style>
