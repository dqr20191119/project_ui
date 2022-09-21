<template>
  <div id="map" ref="map">
    <!--点击查看详情弹框-->
    <div id="popup" class="ol-popup">
      <div class="popup-nav-title">
        <span>{{ this.projectName }}</span>
        <span>{{ this.status }}</span>
      </div>
      <el-divider></el-divider>
      <div v-show="this.projectDesc != ''">
        <el-row class="popup-item">
          <el-col :span="12">
            <img src="../assets/images/fly_pre.png" class="popup-nav-icon" />
            <span>{{ this.start }}</span>
            <img
              src="../assets/images/right.png"
              style="width: 16px; float: right; margin-right: 0.125rem"
            />
          </el-col>

          <el-col :span="12">
            <img src="../assets/images/fly_nor.png" class="popup-nav-icon" />
            <span>{{ this.end }}</span>
          </el-col>
        </el-row>
        <el-row class="popup-item">
          <el-col :span="12">
            <img src="../assets/images/cd.png" class="popup-nav-icon" />
            <span>长度（KM）:{{ this.length }}</span>
          </el-col>

          <el-col :span="12">
            <img src="../assets/images/tz.png" class="popup-nav-icon" />
            <span>总投资（亿元）:{{ this.ztz }}</span>
          </el-col>
        </el-row>
        <div class="popup-item">
          <span>项目概况</span>
          <i
            class="el-icon-caret-right"
            v-show="this.projectDesc != '' && showGk === false"
            @click="showGk = true"
          ></i>
          <i
            class="el-icon-caret-bottom"
            @click="showGk = false"
            v-show="showGk === true"
          ></i>
          <span v-show="this.showGk === true">{{ this.projectDesc }}</span>
        </div>
        <div class="popup-item">
          <span>勘察设计费复核:</span>
          <span>{{ this.kcsjffh }}</span>
        </div>
        <div class="popup-item">
          <span>备注</span>
          <i
            class="el-icon-caret-right"
            v-show="this.bz != '' && showBz === false"
            @click="showBz = true"
          ></i>
          <i
            class="el-icon-caret-bottom"
            @click="showBz = false"
            v-show="showBz === true"
          ></i>
          <span v-show="this.showBz === true">{{ this.bz }}</span>
        </div>
      </div>
      <img src="../assets/images/bg_down.png" class="jt-icon" />
    </div>

    <!--图片弹窗-->
    <div v-for="(item, index) in imagePopArray" :key="index">
      <div
        :id="'imagePopup' + item"
        @mousedown.prevent="down($event, index + 1)"
        @mousewheel.prevent="scaleDom($event)"
        style="position: relative; width: 250px; height: 250px; display: none"
      >
        <i
          class="el-icon-close ol-popup-closer"
          @click="removeImgPopup(item)"
        ></i>
        <div :id="'imageContent' + item"></div>
      </div>
    </div>

    <!--道路选择器-->
    <div id="pop-road-selector" class="ol-layer">
      <div class="change-div">
        <div
          class="switch-btn left-btn"
          @click="changeMap('1')"
          :class="{ 'btn-active': activeBtn == 1 }"
        >
          卫星图
        </div>
        <div
          class="switch-btn"
          @click="changeMap('2')"
          :class="{ 'btn-active': activeBtn == 2 }"
        >
          电子地图
        </div>
        <div
          class="switch-btn right-btn"
          @click="changeMap('3')"
          :class="{ 'btn-active': activeBtn == 3 }"
        >
          隐藏底图
        </div>
      </div>
      <div class="road-selector-pop">
        <el-collapse accordion class="nav-select" v-model="ac">
          <el-collapse-item name="1">
            <template slot="title"> 显示图层 </template>
            <el-tree
              class="tree-div"
              ref="tree"
              :data="treeData2"
              show-checkbox
              node-key="id"
              :default-checked-keys="defaultCheckedIds"
              :default-expanded-keys="defaultExpandIds"
              :props="defaultProps"
              @check="handleCheckChange"
            >
              <div class="custom-tree-node" slot-scope="{ node, data }">
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
              </div>
            </el-tree>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>
  </div>
</template>

<script>
import 'ol/ol.css'

import * as olControl from 'ol/control'

import { Map, View, Feature, Collection } from "ol";

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

import { Draw, Translate, DragPan } from 'ol/interaction'
import { Style, Circle, Stroke, Fill } from 'ol/src/style'
import WKT from 'ol/format/WKT'
import GeoJSON from 'ol/format/GeoJSON'
import Overlay from 'ol/Overlay'
import * as echarts from "echarts";
import axios from 'axios'
import LineString from 'ol/geom/LineString';
import MultiLineString from 'ol/geom/MultiLineString';
import MultiPolygon from 'ol/geom/MultiPolygon';
import Vue from 'vue'
import { clone } from "@/utils/ruoyi";
import OlGeomPoint from 'ol/geom/Point'
import OlStyleStyle from 'ol/style/Style'
import OlStyleIcon from 'ol/style/Icon'
import index from "@/api/index";
import Point from 'ol/geom/Point';
import Text from 'ol/style/Text'
import { findComponentInfo } from "@/api/config/component";
import { initTree } from "@/api/tree/tree";
import { getHighLightMode } from "@/api/config/legend";

import { getUrlKey } from '@/utils/request'




//中心坐标
const centerCordinate = [656951.22379894, 3560959.26626369]
//坐标定义
proj4.defs("EPSG:4548", "+proj=tmerc +lat_0=0 +lon_0=117 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs");
register(proj4);

//地图初始化
const view = new View({
  center: transform(centerCordinate, 'EPSG:4548', 'EPSG:3857'),
  minZoom: 4,
  maxZoom: 18,
  zoom: 14.5 // 地图初始化的缩放级别
})


//高德地图图层
const gaodeMapLayer = new TileLayer({
  source: new XYZ({
    zIndex: 1,
    url: 'http://webst0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scl=2&style=7&x={x}&y={y}&z={z}'
  })
});

//卫星地图
// const wxMapLayer = new TileLayer({
//   source: new XYZ({
//     crossOrigin: "anonymous",
//     url: 'http://t0.tianditu.gov.cn/img_w/wmts?tk=129364168580e7f0e3ff5bd759d41a75&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=tiles'
//   })
// });

const wxMapLayer = new TileLayer({
  source: new XYZ({
    url: 'http://webst0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=6&x={x}&y={y}&z={z}'
  })
});



export default {
  name: "project",
  mixins: [index],
  data () {
    return {
      ac: '1',
      value1: 'true',
      radio2: [],
      addForm: {
        sDeptName: '',
        sDeptId: ''
      },
      //图层对象数组
      layerArray: [],
      //树结构数据
      treeData2: [],
      //默认选中节点
      defaultCheckedIds: [],
      //默认扩展节点
      defaultExpandIds: [],
      //临时图片弹框数组
      imgPopDivArray: [],
      markLayerArray: [],
      defaultProps: {
        children: 'children',
        label: 'label'
      },

      imagePopArray: [],
      imageOverLayArray: [],
      textMarkLayerNmArray: [],

      markMinZoom: 14.5,
      markFlag: false,
      markVectorArray: [],
      showGk: false,
      showBz: false,
      projectName: '',
      start: '',
      end: '',
      projectDesc: '',
      length: '',
      ztz: '',
      status: '',
      bz: '',
      kcsjffh: '',
      isDragable: false,//是否可以拖动
      currentX: '', //点击时鼠标距左边的距离
      currentY: '',//点击时鼠标距顶边的距离
      objX: '', //点击时元素距左边的距离
      objY: '', //点击时元素距顶边的距离
      activeBtn: '2'
    }
  },
  mounted () {


    //获取菜单ID
    this.menuId = getUrlKey('menuId');
    //根据菜单ID查询组件信息
    this.findComponentInfo(this);
    this.removePopup();
    document.getElementById('popup').style.display = 'none';


  },

  watch: {

    defaultCheckedIds: function () {
      //初始化地图
      this.initLayerToMapWfs(this);
      //添加自定义图层
      let checkedIds = this.getTreecheckedId(this.treeData2);
      this.addVectorLayerWfs(checkedIds);
    }
  },





  methods: {




    findComponentInfo (_this) {
      findComponentInfo(this.menuId, null).then(response => {
        if (!response.data) {
          return;
        }
        let legendConfigData = response.data.decLegendConfigList;
        if (legendConfigData && legendConfigData.length > 0) {
          //设置树节点数据
          let treeData_ = legendConfigData[0];
          //隐藏设置的节点
          _this.treeData2 = treeData_;
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

      });
    },



    // 初始化地图
    initLayerToMapWfs (_this) {

      const mapContainer = _this.$refs.map
      wxMapLayer.setVisible(false)
      let layers = [gaodeMapLayer, wxMapLayer];
      //将图层加入Map
      const map = new Map({
        layers: layers,
        target: mapContainer,
        view: view
      });
      // 添加鼠标点击事件
      map.on('click', _this.mapClick);
      map.on('moveend', this.mapMoveend);
      // 保存地图
      _this.mapData = map
    },

    assembleLayerItems (item, arr, m, checkedArray) {
      var newItem = null;
      if (item.layerName != null) {
        var needAdd = item.filterValue || (item.children != null && item.children != undefined);
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
        if (item.filterValue != null) {
          arr.push(item);
        }
        if (item.children != null && item.children != undefined) {
          item.children.forEach(i => {
            this.assembleLayerItems(i, arr, m, checkedArray);
          })
        }
      }
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



    initSingleLayer (featuresData, param, dataItem, _this) {
      let layerName = param.layerName;
      let vectorSourceTmp;
      if (layerName == 'Test:xzxw' || layerName == 'Test:jqxw' || layerName == 'Test:yqxw') {
        vectorSourceTmp = new VectorSource({
          features: (new GeoJSON({ featureProjection: 'EPSG:3857', dataProjection: 'EPSG:4326' })).readFeatures(featuresData)
        });
      } else {
        vectorSourceTmp = new VectorSource({
          features: (new GeoJSON({ featureProjection: 'EPSG:3857', dataProjection: 'EPSG:4548' })).readFeatures(featuresData)
        });
      }
      let vectorLayerTmp = new VectorLayer({
        source: vectorSourceTmp,
        name: layerName,
        filterVal: param.filterVal,
        style: (feature, solution) => {
          return _this.initLayerStyle(feature, dataItem, vectorLayerTmp);
        }
      })

      console.log(param.layerName + ":" + param.filterVal);
      _this.mapData.addLayer(vectorLayerTmp);
      _this.layerArray.push(vectorLayerTmp);

    },



    //添加单个图层信息
    addSingleLayer (_this, layerName, dataItem) {
      let filterKey = dataItem.filterKey;
      let filterVal = dataItem.filterValue;
      if (!layerName || !filterVal) {
        return;
      }
      var url = process.env.VUE_APP_GIS_BASE_URL + '/Test/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=' + encodeURIComponent(layerName)
        + '&maxFeatures=500000000&outputFormat=application%2Fjson&cql_filter=' + encodeURIComponent(filterKey) + '=' + encodeURIComponent("'" + filterVal + "'");
      let param = {
        layerName: layerName,
        filterVal: filterVal
      }
      console.log(decodeURIComponent(url))
      axios.get(url, param, { timeout: 1200000 }).then(function (res) {
        var featuresData = res.data;
        if (featuresData) {

          _this.initSingleLayer(featuresData, param, dataItem, _this)
        }
      })

    },

    //根据图层名字以及过滤属性值获取图层信息(线和面文件同时查询处理)
    getAreaLineLays (layerName, filterVal) {
      let arrays_ = [];
      let isEqual = false;
      for (let i = 0; i < this.areaLineFilterVals.length; i++) {
        for (let key in this.areaLineFilterVals[i]) {
          if (arrays_.indexOf(key) == -1) {
            arrays_.push(key)
          }
          if (key == layerName && this.areaLineFilterVals[i][layerName] == filterVal) {
            isEqual = true;
            break;
          }
        }
      }
      if (isEqual) {
        return arrays_;
      } else {
        arrays_ = [];
        arrays_.push(layerName)
        return arrays_;
      }
    },


    addVectorLayerWfs (checkedArray) {
      let _this = this;
      let checkedLayerMap = this.getLayerMap(checkedArray);
      for (let k = 0; k < checkedLayerMap.length; k++) {
        let item = checkedLayerMap[k];
        let treeDataItems_ = item.treeDataItem;
        let layerName_ = item.layerName;
        if (!treeDataItems_ || treeDataItems_.length == 0 || !layerName_) {
          continue;
        }
        for (let i = 0; i < treeDataItems_.length; i++) {
          var filterVal = treeDataItems_[i].filterValue;
          var filterKey = treeDataItems_[i].filterKey;
          if (!filterKey || !filterVal) {
            continue;
          }
          try {
            //处理线和面两边都存在数据的情况
            let layerFileArray = this.getAreaLineLays(layerName_, filterVal);
            for (let m = 0; m < layerFileArray.length; m++) {
              this.addSingleLayer(this, layerFileArray[m], treeDataItems_[i]);
            }
          } catch (err) {
            console.log("图层：" + layerName_ + "过滤值：" + filterVal + "请求异常：", err);
          }
        }
      }
      //})
    },



    getLayerMap (checkedArray) {
      if (checkedArray == null) {
        return null;
      }
      var layerMap = [];
      this.treeData2.forEach(item => {
        this.assembleLayerItems(item, null, layerMap, checkedArray);
      })

      layerMap = layerMap.filter(item => (item.layerName && item.filterKey))

      return layerMap;
    },


    createPointStyle (feature, item) {
      if (!item) {
        return undefined;
      }
      let styles = [];

      let style = new OlStyleStyle({
        //图标样式
        // image: new OlStyleIcon({
        //   anchor: [10, 18],
        //   scale: 1,
        //   anchorOrigin: 'top-right',
        //   anchorXUnits: 'pixels',
        //   anchorYUnits: 'pixels',
        //   offsetOrigin: 'bottom-left',
        //   opacity: 1,
        //   src: require('../../assets/images/mark.png'),
        // }),
        //文本样式
        text: new Text({
          textAlign: 'center',
          textBaseline: 'middle',
          font: 'normal 0.15rem 微软雅黑',
          text: feature.values_.name,
          offsetY: -25,
          fill: new Fill({
            color: feature.values_.font_color
          }),
          rotation: feature.values_.font_angle * Math.PI / 180,
          padding: [2, 5, 2, 5],
        }),
        // 设置层级
        zIndex: 1999999999
      });
      styles.push(style);
      return styles;
    },


    //初始要素样式
    initLayerStyle (feature, item, vectorLayerTmp) {
      let fileType = feature.values_.file_type;
      if (feature.values_.geometry instanceof Point) {
        if (fileType && fileType == 'image') {
          //图片弹框样式
          feature.values_.src = require("@/assets/images/img_mark.png");
          if (this.imagePopArray.indexOf(feature.values_.name) == -1) {
            console.log(feature.values_.name);
            this.imagePopArray.push(feature.values_.name);
          }
          return this.createImageMarkStyle(feature, vectorLayerTmp);

        } else {
          let layerName = vectorLayerTmp.values_.name;
          if (this.textMarkLayerNmArray.indexOf(layerName) == -1) {
            vectorLayerTmp.setVisible(false)
            vectorLayerTmp.set('initHide', true)
            this.textMarkLayerNmArray.push(layerName);
          }
          vectorLayerTmp.values_.zIndex = 99999999999999
          return this.createPointStyle(feature, item);
        }
      } else {
        return this.initGraphStyle(feature, item);
      }
    },

    getStyleSetting (feature, item) {
      let style = {};
      let strokeColor = item.strokeColor ? item.strokeColor : (feature.get('border_col') ? feature.get('border_col') : feature.get('line_color'))
      let fillColor = item.fillColor ? item.fillColor : feature.get('fill_color')
      let strokeWidth = item.width ? item.width : (feature.get('border_wid') ? feature.get('border_wid') : feature.get('line_width'))
      style.strokeColor = strokeColor;
      style.fillColor = fillColor;
      style.strokeWidth = strokeWidth;
      return style;
    },




    initGraphStyle (feature, item) {
      let styles = [];
      var fill_style = feature.get("fill_style");
      if (!item) {
        return undefined;
      }
      let styleSetting = this.getStyleSetting(feature, item);
      var dashOffset = item.dashOffset;
      var dasharray = item.dashArray;
      var lineColor = styleSetting.strokeColor;
      var fillColor = styleSetting.fillColor;
      let strokeWidth = styleSetting.strokeWidth;
      let style = new Style();
      // //线条颜色
      // let strokeColor = item.strokeColor;
      // let strokeWidth = item.width;
      let stroke = null;
      if (lineColor) {
        stroke = new Stroke({
          color: lineColor,
        })
      }
      // if (stroke == null && strokeColor != null) {
      //   stroke = new Stroke({
      //     color: strokeColor,
      //   })
      // }
      if (strokeWidth) {
        if (stroke == null) {
          stroke = new Stroke({
            width: strokeWidth,
          })
        } else {
          stroke.width_ = strokeWidth;
        }
      }
      if (dashOffset) {

        stroke.lineDashOffset_ = dashOffset;
      }
      if (dasharray) {

        stroke.lineDash_ = dasharray.split(",");
      }
      style.stroke_ = stroke;
      //填充颜色
      if (fillColor && fill_style != '' && fill_style != 'No Fill') {
        let fill = new Fill({
          color: fillColor
        })
        style.fill_ = fill;
      }

      styles.push(style);
      return styles;
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
          //this.setLayerVisible(item, false);
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

          //新增图层
          if (!exist) {
            console.log("新增图层=======================");
            console.log(checkedLayerArray[i].layerName);
            //处理线和面两边都存在数据的情况
            let layerFileArray = this.getAreaLineLays(checkedLayerArray[i].layerName, item.filterValue);
            for (let m = 0; m < layerFileArray.length; m++) {
              this.addSingleLayer(this, layerFileArray[m], item);
            }
            continue;
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

      //线和面同时查询显示隐藏控制处理
      for (let n = 0; n < currentLayers.length; n++) {
        let exist = false;
        let areaLineConfig = this.getAreaLineLays(currentLayers[n].values_.name, currentLayers[n].values_.filterVal);
        for (let m = 0; m < existLayer.length; m++) {
          if (currentLayers[n].values_.filterVal == existLayer[m] && areaLineConfig.length > 1) {
            exist = true;
            currentLayers[n].setVisible(true);
          }
        }
        if (!exist) {
          if (areaLineConfig.length > 1) {
            currentLayers[n].setVisible(false);
          }
        }

      }



      // 图片标注关闭开启时控制显示隐藏
      this.imageOverLayArray.forEach(item => {
        if (item.id == filterVal) {
          if (!visible) {
            this.removeImgPopup(item.id);
          } else {
            // console.log("ccccc");
            // console.log(item);
            //this.showImgPopup(item.id, item.values_.position)
          }
        }
      })



    },



    // 弹出框
    addPopup (coordinate, feature) {
      this.removePopup()
      let featureValues = feature.values_;
      this.projectName = featureValues.layer == null ? '' : featureValues.layer;
      this.projectDesc = featureValues.项目概 == null || featureValues.项目概 == undefined ? '' : featureValues.项目概;
      this.start = featureValues.起点 == null ? '' : featureValues.起点;
      this.end = featureValues.终点 == null ? "" : featureValues.终点;
      this.length = featureValues.长度 == null ? "" : featureValues.长度;
      this.ztz = featureValues.总投资 == null ? "" : featureValues.总投资;
      this.kcsjffh = featureValues.勘察_1 == null ? "" : featureValues.勘察_1;
      this.status = featureValues.目前工 == null ? "" : featureValues.目前工;
      this.bz = featureValues.备注 == null ? "" : featureValues.备注;

      // 获取弹出层DOM
      let container = document.getElementById('popup')
      if (this.projectName === "0") {
        return
      }
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
      // 设置弹出层位置即可出现
      this.overlay.setPosition(coordinate)
      document.getElementById('popup').style.display = 'block';
    },

    // 清除弹出框
    removePopup () {
      if (this.overlay) {
        this.overlay.setPosition(undefined)
        this.showGk = false,
          this.showBz = false
        this.clearHighlight()
      }

    },

    //隐藏图片弹框
    removeImgPopup (id) {
      let result = false;
      if (!id) {
        return result;
      }
      let layerArray = this.imageOverLayArray;
      if (layerArray.length == 0) {
        return result;
      }
      layerArray.forEach(item => {
        if (item.id == id) {

          if (item.values_.position != undefined) {
            result = true;
          }
          item.setPosition(undefined)
        }
      })
      return result;
    },

    //显示图片弹框
    showImgPopup (id, coordinate) {
      if (!id) {
        return;
      }
      let layerArray = this.imageOverLayArray;
      if (layerArray.length == 0) {
        return;
      }
      layerArray.forEach(item => {
        if (item.id == id) {
          let container = document.getElementById('imagePopup' + id);
          if (container) {
            container.style.display = 'block';
            item.setPosition(coordinate)
          }
        }
      })
    },


    //删除高亮图层
    clearHighlight () {
      let arr = this.mapData.getLayers().array_
      let arrayLen = arr.length;
      let remove = 0;
      for (let k = 0; k < arrayLen; k++) {
        let item = arr[k - remove]
        let layerId = item.values_.id
        if (layerId != null && layerId != undefined) {
          if (layerId.indexOf("highlightLayer") != -1) {
            this.mapData.removeLayer(item);
            remove++;
          }
        }
      }


    },

    //根据图层名字高亮
    addHighLightByLayerName (this_, layerName, filterVal) {
      let layerFileArray = this_.getAreaLineLays(layerName, filterVal);
      let featureArray = [];
      for (let m = 0; m < layerFileArray.length; m++) {
        for (let n = 0; n < this_.layerArray.length; n++) {
          if (layerFileArray[m] != this_.layerArray[n].values_.name || this_.layerArray[n].values_.filterVal != filterVal) {
            continue;
          }
          let vectoryResouce = this_.layerArray[n].getSource();
          featureArray = vectoryResouce.featuresRtree_.getAll();
          this_.addHighLightStyle(featureArray, this_, layerFileArray[m]);
        }
      }
    },




    addHightLigthByLayer (feature, layer, this_) {
      let layerName = layer.values_.name;
      let filterVal = feature.values_.layer;
      let layerFileArray = this_.getAreaLineLays(layerName, filterVal);
      let queryParam = {};
      queryParam.layerNameArray = layerFileArray;
      queryParam.filterValue = filterVal;
      this_.clearHighlight();
      getHighLightMode(queryParam).then(response => {
        let respData = response.data;
        this_.clearHighlight();
        if (respData == null || respData == 'N') {
          let featureArray = [];
          featureArray.push(feature);
          this_.addHighLightStyle(featureArray, this_, layerName);
        } else {
          this_.addHighLightByLayerName(this_, layerName, filterVal);
        }


      });
    },

    createHighLightStyle () {
      let highLightStyle = new Style({
        fill: new Fill({
          color: "#ffff00",
        }),
        stroke: new Stroke({
          color: "#ffff00",
          width: 3.5
        }),
      })
      return highLightStyle;
    },


    addHighLightStyle (featureObj, thisObj, layerName) {
      if (!featureObj) {
        return;
      }
      thisObj.highLightLayer = new VectorLayer({
        zIndex: 9999999999999,
        name: layerName,
        source: new VectorSource({
          features: featureObj,
        }),
        style: (feature, solution) => {
          return thisObj.createHighLightStyle();
        }
      })
      thisObj.highLightLayer.set("id", "highlightLayer" + Math.round(Math.random() * 1000))
      this.mapData.addLayer(thisObj.highLightLayer)

    },

    changeMap (num) {
      this.activeBtn = num
      if (this.activeBtn == 1) {
        gaodeMapLayer.setVisible(false)
        wxMapLayer.setVisible(true)
        //修改文字标注样式
        this.changeTextStyle(this.activeBtn)
      } else if (this.activeBtn == 2) {
        gaodeMapLayer.setVisible(true)
        wxMapLayer.setVisible(false)
        this.changeTextStyle(this.activeBtn)
      } else if (this.activeBtn == 3) {
        gaodeMapLayer.setVisible(false)
        wxMapLayer.setVisible(false)
        this.changeTextStyle(this.activeBtn)
      }
    },

    createPointStyleByColor (feature, color) {
      let styles = [];
      let style = new OlStyleStyle({
        // //图标样式
        // image: new OlStyleIcon({
        //   anchor: [10, 18],
        //   scale: 1,
        //   anchorOrigin: 'top-right',
        //   anchorXUnits: 'pixels',
        //   anchorYUnits: 'pixels',
        //   offsetOrigin: 'bottom-left',
        //   opacity: 1,
        //   src: require('../../assets/images/mark.png'),
        // }),
        //文本样式
        text: new Text({
          textAlign: 'center',
          textBaseline: 'middle',
          font: 'normal 0.15rem 微软雅黑',
          text: feature.values_.name,
          offsetY: -25,
          fill: new Fill({
            color: color
          }),
          rotation: feature.values_.font_angle * Math.PI / 180,
          padding: [2, 5, 2, 5],
        }),
        // 设置层级
        zIndex: 1999999999
      });
      styles.push(style);
      return styles;
    },


    changeTextStyle (checkVal) {
      let textLayer = this.textMarkLayerNmArray;
      this.layerArray.forEach(item => {
        let layerName = item.values_.name
        if (textLayer.indexOf(layerName) != -1) {
          let vectoryResouce = item.getSource();
          let featureArray = vectoryResouce.featuresRtree_.getAll();
          for (let m = 0; m < featureArray.length; m++) {
            let fontcolor = featureArray[m].values_.font_color;
            let changeColor;
            if (checkVal == 1) {
              changeColor = '#ffff00'
            } else {
              changeColor = '#000000'
            }
            featureArray[m].setStyle(this.createPointStyleByColor(featureArray[m], changeColor))
          }

        }
      })
    },


    //卫星地图切换
    switchChange () {
      let layerTypeSelect = this.value1;
      if (layerTypeSelect) {
        gaodeMapLayer.setVisible(false)
        wxMapLayer.setVisible(true)
      } else {
        gaodeMapLayer.setVisible(true)
        wxMapLayer.setVisible(false)
      }
    },

    //创建图片弹框
    createImageOverLayer (feature, evt, layer) {
      let id = feature.values_.name;
      let container = document.getElementById("imagePopup" + id)
      console.log("弹窗容器为空");
      if (container == null) {
        return;
      }
      let content = document.getElementById('imageContent' + id)
      let imageFileName = feature.values_.name + ".png";
      let src = require("@/assets/images/" + imageFileName);
      var zoom = this.mapData.getView().getZoom();
      let width = (zoom - this.markMinZoom) * 250 + 100;
      let height = width * 0.5582
      content.style.width = width;
      content.style.height = height;
      content.innerHTML = `<img src = ` + src + ` style = 'width:100%` + `;height:100%` + `'/>`;
      let overlayTemp = null;
      this.imageOverLayArray.forEach(item => {
        if (item.id == id) {
          overlayTemp = item;
        }
      })
      if (overlayTemp == null) {
        overlayTemp = new Overlay({
          element: container,
          id: id,
          stopEvent: true,
          insertFirst: false


        })
        this.imageOverLayArray.push(overlayTemp);
      }
      this.mapData.addOverlay(overlayTemp)
      overlayTemp.setPosition(evt.coordinate)
      container.style.display = 'block';
    },


    //设置标记图片样式
    createImageMarkStyle (feature, vectorLayerTmp) {
      let this_ = this;
      vectorLayerTmp.values_.zIndex = 99999999999999
      var zoom = this.mapData.getView().getZoom();
      let scaleChange = (zoom - this.markMinZoom) * 0.2 + 0.5;
      //设置可拖动
      var translate = new Translate({
        hitTolerance: 20,
        layers: [vectorLayerTmp]
      });
      //图片标注拖动，图片弹窗关闭
      translate.on('translating', function (e) {
        let result = this_.removeImgPopup(feature.values_.name);
        translate.values_.openStatus = result;

      })

      translate.on(['translateend'], function (e) {
        let openStatus = translate.values_.openStatus;
        console.log('拖动结束' + openStatus)
        if (openStatus) {
          let coordinate = e.coordinate;
          this_.showImgPopup(feature.values_.name, coordinate);
        }
        //重置状态
        translate.values_.openStatus = null;
      })

      this.mapData.addInteraction(translate);
      return new OlStyleStyle({
        //图标样式
        image: new OlStyleIcon({
          anchor: [10, 18],
          scale: scaleChange,
          anchorOrigin: 'top-right',
          anchorXUnits: 'pixels',
          anchorYUnits: 'pixels',
          offsetOrigin: 'bottom-left',
          opacity: 1,
          src: feature.values_.src
        }),
      });
    },


    // 鼠标点击地图事件
    mapClick (evt) {
      let pixel = this.mapData.getEventPixel(evt.originalEvent);
      let featureInfo = {};
      this.mapData.forEachFeatureAtPixel(pixel,
        function (feature, layer) {
          featureInfo.feature = feature;
          featureInfo.layer = layer;
          return featureInfo;
        });
      let feature = featureInfo.feature;
      let layer = featureInfo.layer;
      if (featureInfo.feature) {
        //捕捉到要素后，弹框
        let coordinate = evt.coordinate
        this.addPopup(coordinate, feature)
        this.addHightLigthByLayer(feature, layer, this)
        //对于图片图层展示图片弹框
        this.popImage(feature, layer, evt);
      } else {

        this.removePopup();
      }
    },

    createImageStyle (feature, image) {
      var zoom = this.mapData.getView().getZoom();
      let scaleChange = (zoom - this.markMinZoom) * 0.2 + 0.1;
      return new OlStyleStyle({
        //图标样式
        image: new OlStyleIcon({
          anchor: [10, 18],
          scale: scaleChange,
          anchorOrigin: 'top-right',
          anchorXUnits: 'pixels',
          anchorYUnits: 'pixels',
          offsetOrigin: 'bottom-left',
          opacity: 1,
          src: image
        }),
      });
    },



    popImage (feature, layer, evt) {
      if (!feature.values_.file_type) {
        return;
      }
      if (feature.values_.file_type != 'image') {
        return;
      }

      this.createImageOverLayer(feature, evt, layer);
    },



    mapMoveend () {
      var zoom = this.mapData.getView().getZoom();
      if (zoom > this.markMinZoom) {

        //显示文字标注
        this.layerArray.forEach(item => {
          if (item.values_.moveeHide || item.values_.initHide) {
            item.setVisible(true);
            item.set('moveeHide', false);
            item.set('initHide', false);
          }
        })

      } else if (zoom <= this.markMinZoom) {
        this.markFlag = false;
        //隐藏图片弹框
        this.imageOverLayArray.forEach(item => {
          let container = document.getElementById('imagePopup' + item.id);
          if (container != null) {
            container.style.display = 'none';
          }
        });

        //隐藏文字标注
        this.layerArray.forEach(item => {
          if (this.textMarkLayerNmArray.indexOf(item.values_.name) != -1) {
            if (item.values_.visible) {
              //缩放隐藏标识
              item.set('moveeHide', true)
            }
            item.setVisible(false);
          }
        })



      }

      //根据缩放事件调整弹框大小
      this.imageOverLayArray.forEach(item => {
        let container = document.getElementById('imagePopup' + item.id)
        if (container != null) {
          let width = (zoom - this.markMinZoom) * 250 + 100;
          container.style.width = width + "px"
          container.style.height = width * 0.5582 + "px"
        }
      })

    },
    down (e, i) {
      let dragObj = e.currentTarget
      this.isMouseDown = true
      this['currentX' + i] = e.clientX
      this['currentY' + i] = e.clientY
      this['objX' + i] = dragObj.offsetLeft
      this['objY' + i] = dragObj.offsetTop
      document.onmouseup = e => {

        this.isMouseDown = false //鼠标抬起时候不要在跟随鼠标移动
        if (!this.isMouseDown) {
          return false
        }
        this.isMouseDown = false //鼠标抬起时候不要在跟随鼠标移动
        dragObj.style.zIndex = 1
      }
      document.onmousemove = e => {
        if (this.isMouseDown == false) {
          return false
        }
        let moveX = e.clientX - this['currentX' + i]
        let moveY = e.clientY - this['currentY' + i]
        dragObj.style.left = this['objX' + i] + moveX + 'px'
        dragObj.style.top = this['objY' + i] + moveY + 'px'
        dragObj.style.zIndex = 999 //让拖动的div权重最大
      }

    },
    scaleDom (e) {

      let div = e.currentTarget
      let zoom = parseInt(div.style.zoom, 10) || 100;
      zoom += e.wheelDelta / 12;
      if (zoom > 0) { div.style.zoom = `${zoom}%` }
    }


  }
}






</script>

<style scoped lang="scss">
.ol-popup {
  position: absolute;
  bottom: 0.1875rem;
  left: -2.1125rem;
  width: 4.8875rem;
  border-radius: 0.0625rem;
  padding: 0.125rem 0.1875rem;
  background: #ffffff;
  border: 0.0125rem solid #d2e3fa;
  box-shadow: 0 0.125rem 0.25rem 0.0125rem rgba(138, 144, 153, 0.4);
  color: #4a4a4a;
}
.ol-popup-closer {
  position: absolute;
  top: 0.1rem;
  color: #999999;
  font-weight: bold;
  font-size: 0.125rem;
  right: 0.1rem;
}
.popup-nav-title {
  display: flex;
  justify-content: space-between;
}
.popup-nav-title span:first-child {
  color: #000;
}
.popup-nav-title span:last-child {
  color: #707070;
  font-size: 0.15rem;
}
.el-divider--horizontal {
  margin: 0.1875rem 0;
}
.popup-nav-item {
  display: flex;
  color: #4a4a4a;
}
.popup-nav-icon {
  margin-right: 0.1rem;
  width: 0.1875rem;
}
.popup-item {
  font-size: 0.175rem;
  margin-bottom: 0.1rem;
}
.jt-icon {
  width: 0.375rem;
  position: absolute;
  bottom: -0.175rem;
  left: 1.925rem;
}
::v-deep .el-checkbox {
  position: relative;
  display: block;
  height: 0.325rem;
}
.el-checkbox-group {
  width: 100%;
}
.colorBox {
  width: 0.6rem;
  height: 0.15rem;
  display: inline-block;
  border-radius: 0.025rem;
  position: absolute;
  right: 0.125rem;
}
.road-selector-pop {
  width: 1.5rem;
  height: 2.5rem;
  z-index: 200000;
  position: fixed;
  margin-left: 0.875rem;
  margin-top: 0.6875rem;
  .pop-title {
    font-weight: bold;
    font-size: 0.175rem;
  }
}
.el-collapse-item {
  width: 3.25rem;
  height: 0.55rem;
  opacity: 1;

  ::v-deep .el-collapse-item__header {
    height: 0.55rem;
    padding-left: 0.125rem;
    background: #ffffff;
    box-shadow: 0 0.125rem 0.25rem 0.0125rem rgba(138, 144, 153, 0.4);
    border-radius: 0.1rem;
  }
}
::v-deep .el-collapse {
  border: none;
  box-shadow: 0 0.125rem 0.25rem 0.0125rem rgba(138, 144, 153, 0.4);
}
::v-deep .el-collapse-item__wrap {
  border-radius: 0 0 0.1rem 0.1rem;
  margin-top: -0.0625rem;
  box-shadow: 0 0.125rem 0.25rem 0.0125rem rgba(138, 144, 153, 0.4);
}
.dot {
  width: 0.3rem;
  height: 0.125rem;
  border-radius: 0.025rem;
  display: inline-block;
  margin-left: 0.1rem;
}
::v-deep .el-tree-node__children {
  overflow: initial !important;
}
.change-div {
  position: absolute;
  right: 0.25rem;
  top: 0.375rem;
  z-index: 999;
  .switch-btn {
    display: inline-block;
    width: 1.2875rem;
    height: 0.475rem;
    text-align: center;
    background: #001d40;
    box-sizing: border-box;
    border: 0.025rem solid #336bb4;
    font-size: 0.175rem;
    font-weight: bold;
    line-height: 0.4375rem;
    color: #ffffff;
    cursor: pointer;
  }
  .left-btn {
    border-radius: 0.2375rem 0 0 0.2375rem;
    margin-right: 0.1rem;
  }
  .right-btn {
    border-radius: 0 0.2375rem 0.2375rem 0;
    margin-left: 0.1rem;
  }
  .switch-btn:hover {
    background: linear-gradient(180deg, #2ca6ff 37%, #00ffb7 100%);
    color: #ffffff;
  }
  .btn-active {
    background: linear-gradient(180deg, #2ca6ff 37%, #00ffb7 100%);
    color: #ffffff;
  }
}
/* 设置滚动条的样式 */
::-webkit-scrollbar {
  width: 0.075rem;
}
/* 滚动槽 */
::-webkit-scrollbar-track {
  -webkit-box-shadow: inset006pxrgba(0, 0, 0, 0.3);
  border-radius: 0.1rem;
}
/* 滚动条滑块 */
::-webkit-scrollbar-thumb {
  border-radius: 0.075rem;
  background: #ebeef5;
  -webkit-box-shadow: inset006pxrgba(0, 0, 0, 0.5);
}
::-webkit-scrollbar-thumb:window-inactive {
  background: #ebeef5;
}
.tree-div {
  height: 4rem;
  overflow: auto;
}
</style>
