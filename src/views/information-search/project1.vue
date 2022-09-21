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
              :default-checked-keys="[1, 2, 3, 4, 5, 6]"
              :props="defaultProps"
              @check="handleCheckChange"
            >
              <span class="custom-tree-node" slot-scope="{ node, data }">
                <span>
                  {{ node.label }}
                </span>
                <span
                  v-if="data.fillColor != null"
                  class="dot"
                  :style="{ background: data.fillColor }"
                ></span>
                <span
                  v-else
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
import { clone } from "@/utils/ruoyi";

//中心坐标
const centerCordinate = [656951.22379894, 3559139.26626369]
//坐标定义
proj4.defs("EPSG:4548", "+proj=tmerc +lat_0=0 +lon_0=117 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs");
register(proj4);

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
    zIndex: 1,
    url: 'http://webst0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}'
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
      wxMapLayer: null,
      checkedLayerArray: [],
      vectorArray: [],
      popDetailFlag: false,
      filterTreeData: [],
      layerArray: [],
      treeData: [
        {
          id: 90,
          label: '项目管理',
          layerName: "Test:gh_dl",
          filterKey: 'layer',
          children: [{
            id: 1,
            label: '道路',
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

            },


            {
              id: 2,
              label: '河道',
              layerName: "Test:gh_hd_v2",
              filterKey: 'layer',
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
            }]

          }



            , {
            id: 4,
            label: '市政管线工程',
            children: [{
              id: 41,
              label: '01市政管线工程',
              layerName: "Test:gh_gx",
              filterKey: 'layer',
              children: [{
                id: 411,
                label: '01市政管线',
                literal: '01市政管线',
                fillColor: "#949D42",
                strokeColor: "#949D42",
                width: "1",

              }, {
                id: 412,
                label: '市政管线工程文字',
                literal: '市政管线工程文字',
                literal: '01市政管线2',
                fillColor: "#949D42",
                strokeColor: "#949D42",
                width: "1"

              }]

            }]
          }

          ]
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
        },
        {
          id: 6,
          label: '基础设施',
          filterKey: 'layer',
          layerName: "road_area0808",
          children: [{
            id: 61,
            label: '12-01给水',
            literal: '12-01给水',
            fillColor: "#949D42",
            strokeColor: "#949D42",
            width: "1",

          },
          {
            id: 62,
            label: '12-04燃气管',
            literal: '12-04燃气管',
            fillColor: "#949D42",
            strokeColor: "#949D42",
            width: "1",

          },
          {
            id: 63,
            label: '12-05电力-01',
            literal: '12-05电力-01',
            fillColor: "#949D42",
            strokeColor: "#949D42",
            width: "1",

          },
          {
            id: 64,
            label: '12-06通信',
            literal: '12-06通信',
            fillColor: "#949D42",
            strokeColor: "#949D42",
            width: "1",

          }

          ]
        }

      ],

      defaultProps: {
        children: 'children',
        label: 'label'
      },
      projectRadio: ["1", "2"],
      geoJsonList: {},



    }
  },
  mounted () {

    //初始化图层 wms
    //this.initLayerWms();
    //初始化图层 wfs
    this.initLayerToMapWfs(this);
    this.addVectorLayerWfs(this);
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

    getLayerMap (checkedArray) {
      if (checkedArray == null) {
        return null;
      }
      var layerMap = [];
      this.treeData.forEach(item => {
        this.assembleLayerItems(item, null, layerMap, checkedArray);
      })
      return layerMap;
    },

    assembleLayerItems (item, arr, m, checkedArray) {
      var newItem = null;
      if (item.layerName != null) {
        var needAdd = item.literal != null || (item.children != null && item.children != undefined);
        if (!needAdd) {
          return;
        }

        let existItem;
        for (let j = 0; j < m.length; j++) {
          if (m[j].layerName == item.layerName) {
            existItem = m[j];
            break;
          }
        }

        if (existItem != null) {
          arr = existItem.treeDataItem;
        } else {
          arr = [];
          newItem = {};
          newItem.treeDataItem = arr;
          newItem.layerName = item.layerName;
          newItem.filterKey = item.filterKey;
        }
      }

      //选中状态
      var idIndex = checkedArray.findIndex(item2 => {
        return item2 == item.id;
      });

      if (idIndex != -1) {
        if (newItem != null) {
          m.push(newItem);
        }
        if (item.literal != null) {
          arr.push(item);
        }
        if (item.children != null && item.children != undefined) {
          item.children.forEach(i => {
            this.assembleLayerItems(i, arr, m, checkedArray);
          })
        }
      }
    },



    initWfsStyle (feature, item) {

      let styles = [];
      // 过滤属性
      var filterKey = feature.get(item.filterKey);
      var treeDataItem = item.treeDataItem;
      if (treeDataItem == null || treeDataItem == undefined || treeDataItem.length == 0) {
        return undefined;
      } else {
        let isExist = false;;
        for (let k = 0; k < treeDataItem.length; k++) {
          let item2 = treeDataItem[k];
          if (filterKey != treeDataItem[k].literal) {
            continue;
          }
          isExist = true;
          let style = new Style();
          //线条颜色
          let strokeColor = item2.strokeColor;
          let strokeWidth = item2.width;
          let stroke = null;
          if (strokeColor) {
            stroke = new Stroke({
              color: strokeColor,
            })
          }
          if (strokeWidth) {
            if (stroke == null) {
              stroke = new Stroke({
                width: strokeWidth,
              })
            } else {
              stroke.width_ = strokeWidth;
            }
          }
          style.stroke_ = stroke;
          //填充颜色
          if (item2.fillColor) {
            let fill = new Fill({
              color: item2.fillColor
            })
            style.fill_ = fill;
          }

          styles.push(style);
          return styles;
        }
        if (!isExist) {
          return undefined;
        }

      }

    },



    handleCheckChange (data, checkedInfo) {
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
      let allLayerArray = this.layerArray;
      for (let j = 0; j < allLayerArray.length; j++) {
        let item = allLayerArray[j];
        let layerName = item.values_.name;
        let exist = false;
        //如果全部未选中 隐藏
        if (checkedLayerArray == null || checkedLayerArray.length == 0) {
          item.setVisible(false);
          continue;
        }
        for (let k = 0; k < checkedLayerArray.length; k++) {
          let checkItem = checkedLayerArray[k];
          if (layerName == checkItem.layerName) {
            console.log(layerName == checkItem.layerName);
            console.log(layerName);
            console.log(checkItem.layerName);
            exist = true;
            if (checkItem.treeDataItem == null || checkItem.treeDataItem.length == 0) {
              item.setVisible(false);
              break;
            }
            //更新样式
            item.setVisible(true);
            item.setStyle((feature, solution) => {
              return this.initWfsStyle(feature, checkItem)
            })

          }
        }
        if (!exist) {
          item.setVisible(false);
        }
      }

    },




    // 初始化地图
    initLayerToMapWfs (_this) {
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
        source: roadLinesWms,
        zIndex: 3
      });
      const mapContainer = _this.$refs.map
      let layers = [gaodeMapLayer, roadLineLayer];
      //将图层加入Map
      const map = new Map({
        layers: layers,
        target: mapContainer,
        view: view
      });
      // 添加鼠标点击事件
      map.on('click', _this.mapClick);
      // 保存地图
      _this.mapData = map
    },










    addVectorLayerWfs (_this) {
      var checkedArray = this.$refs.tree.getCheckedKeys(false);
      let checkedLayerMap = this.getLayerMap(checkedArray);
      checkedLayerMap.forEach(item => {
        var url = process.env.VUE_APP_GIS_BASE_URL + '/Test/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=' + encodeURI(item.layerName) + '&maxFeatures=500000000&outputFormat=application%2Fjson';
        axios.get(url, null).then(function (res) {
          var featuresData = res.data;
          var vectorSource = new VectorSource({
            features: (new GeoJSON({ featureProjection: 'EPSG:3857', dataProjection: 'EPSG:4548' })).readFeatures(featuresData)
          });

          let vectorLayerTmp = new VectorLayer({
            source: vectorSource,
            name: item.layerName,
            style: (feature, solution) => {
              return _this.initWfsStyle(feature, item)
            }
          })

          //    _this.mapData.addLayer(vectorLayerTmp);
          _this.layerArray.push(vectorLayerTmp);
        })

      })

      _this.mapData.addLayer(_this.layerArray);
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
      let featureValues = feature.values_;
      let projectName = featureValues.项目名 == null ? '' : featureValues.项目名;
      let projectDesc = featureValues.项目概 == null ? '' : featureValues.项目概;
      let start = featureValues.起点 == null ? '' : featureValues.起点;
      let end = featureValues.终点 == null ? "" : featureValues.终点;
      let length = featureValues.长度 == null ? "" : featureValues.长度;
      let ztz = featureValues.总投资 == null ? "" : featureValues.总投资;
      let kcsjffh = featureValues.勘察_1 == null ? "" : featureValues.勘察_1;
      let status = featureValues.目前工 == null ? "" : featureValues.目前工;
      let bz = featureValues.备注 == null ? "" : featureValues.备注;
      // if (projectName == '') {
      //   return;
      // }

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


    addHighLightStyle (clickFeature, thisObj) {
      let featureObj = [];
      featureObj.push(clickFeature);
      this.clearHighlight();
      let highLightStyle = new Style({
        fill: new Fill({
          color: "#ffff00",
        }),
        stroke: new Stroke({
          color: "#ffff00",
          width: 3.5
        }),
      })
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
      //卫星地图
      if (layerTypeSelect) {
        if (this.wxMapLayer == null) {
          this.wxMapLayer = new TileLayer({
            source: new XYZ({
              zIndex: 0,
              crossOrigin: "anonymous",
              url: 'http://t0.tianditu.gov.cn/img_w/wmts?tk=129364168580e7f0e3ff5bd759d41a75&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=tiles'
            })
          });
          this.mapData.addLayer(this.wxMapLayer);
        } else {
          this.wxMapLayer.setVisible(true)
          // this.wxMapLayer.setZIndex(1);
          gaodeMapLayer.setVisible(true)

        }
      } else {
        this.wxMapLayer.setVisible(false)
        gaodeMapLayer.setVisible(true)
        //gaodeMapLayer.setZIndex(0);
      }

    },



    //地图点击事件
    // mapClick (evt) {
    //   this.removePopup();
    //   this.popDetailFlag = false;
    //   let thisObj = this;
    //   var viewResolution = view.getResolution();
    //   for (let k = 0; k < this.vectorArray.length; k++) {
    //     let item = this.vectorArray[k];
    //     let vectoryTemp = item.vectorLayer;
    //     let visible = vectoryTemp.values_.visible;
    //     //水域图层不展示详情
    //     if (this.popDetailFlag == true || item.id == 5 || !visible) {
    //       continue;
    //     }
    //     var featureUrl = vectoryTemp.getSource().getFeatureInfoUrl(
    //       evt['coordinate'],
    //       viewResolution,
    //       'EPSG:3857',
    //       { 'INFO_FORMAT': 'application/json' }
    //     );
    //     if (featureUrl) {
    //       this.fechFeatureInfo(featureUrl, thisObj, evt, vectoryTemp);
    //     } else {
    //       this.removePopup();
    //     }
    //   }

    // },


    // 鼠标点击地图事件
    mapClick (evt) {
      let pixel = this.mapData.getEventPixel(evt.originalEvent);
      let feature = this.mapData.forEachFeatureAtPixel(pixel,
        function (feature, layer) {
          return feature;
        });
      if (feature) {
        //捕捉到要素后，弹框
        let coordinate = evt.coordinate
        this.addPopup(coordinate, feature)
        this.addHighLightStyle(feature, this)
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
