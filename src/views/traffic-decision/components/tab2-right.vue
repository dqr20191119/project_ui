<template>
  <div class="content">
    <!--  -->
    <div class="select-div">
      <div class="select-title">右侧方案</div>
      <div>
        <el-select
          v-model="rightPlane"
          placeholder="请选择"
          @change="changeRigthPlane"
        >
          <el-option
            v-for="item in rightPlaneList"
            :key="item.key"
            :label="item.name"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </div>
    </div>
    <div id="map2" ref="map2" style="width: 100%; height: 890px">
      <!--点击查看详情弹框-->
      <div id="popup2" class="ol-popup2">
        <a
          href="#"
          id="popup-closer2"
          class="ol-popup-closer2"
          @click="removeBtn"
        />
        <div id="popup-content2"></div>
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
import proj4 from 'proj4'
import { register } from 'ol/proj/proj4';
import VectorSource from 'ol/source/Vector'
import { TileWMS } from 'ol/source'
import VectorLayer from 'ol/layer/Vector'
import Feature from 'ol/Feature'
import { Draw } from 'ol/interaction'
import { Style, Circle, Stroke, Fill, Icon, IconImage, Image, Text } from 'ol/src/style'
import WKT from 'ol/format/WKT'
import GeoJSON from 'ol/format/GeoJSON'
import Overlay from 'ol/Overlay'
import * as echarts from "echarts";
import axios from 'axios'
import request from '@/utils/request'
import tab2LeftVue from './tab2-left.vue'
import { formatFixNum, convertFeature } from "@/api/common/common";
import { featureCompaire } from "@/api/decision/plane";
import * as turf from '@turf/turf';
import Point from 'ol/geom/Point';
import { fromLonLat, toLonLat, transformExtent, transform } from 'ol/proj'
import LineString from 'ol/geom/LineString';
import MultiLineString from 'ol/geom/MultiLineString';
import { initTreeList } from "@/api/decision-manage/decision";
//中心坐标
const centerCordinate = [656813.44256, 3560432.98245]
//坐标定义
proj4.defs("EPSG:4548", "+proj=tmerc +lat_0=0 +lon_0=117 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs");
register(proj4);
let newList = []
let parentVal=''
//地图初始化
const view2 = new View({
  center: transform(centerCordinate, 'EPSG:4548', 'EPSG:3857'),
  minZoom: 10,
  maxZoom: 18,
  zoom: 13.5// 地图初始化的缩放级别
})


//高德地图图层
const gaodeMapLayer = new TileLayer({
  source: new XYZ({
    url: 'http://webst0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scl=2&style=7&x={x}&y={y}&z={z}'
  })
});



export default {
  data () {
    return {
      rightPlaneList: [],
      popTransList: [
        { label: 'AB交通量', propertie: 'ab_flow', unit: 'pcu/h', type: 'int' },
        { label: 'BA交通量', propertie: 'ba_flow', unit: 'pcu/h', type: 'int' },
        { label: '总交通量', propertie: 'tot_flow', unit: 'pcu/h', type: 'int' },
        { label: 'AB饱和度', propertie: 'ab_voc', maxlength: 2, type: 'float' },
        { label: 'BA饱和度', propertie: 'ba_voc', maxlength: 2, type: 'float' },
        { label: '最大饱和度', propertie: 'max_voc', maxlength: 2, type: 'float' },
      ],
      rightPlane: '',
      leftSelectedPlane: null,
      vectorLayer: null,
      style: {
        line_width: 3,
        line_stroke: '#459c50',
        interval: 40
      },
      map: null
    }
  },
  mounted () {
    this.initComponentInfo()
    this.initMap();
    // 高亮
    this.$bas.$on("addRightHighLightStyle", (i, j, num) => {
      this.addHighLightStyle(i, j, num)
    })
    //清除高亮
    this.$bas.$on("clearHighlight_L", (i) => {
      this.clearHighlight()
    })
    this.rightPlaneList = this.rightPlaneList.filter((item) => {
      return item.bizVal == parentVal
    })

    this.$bas.$on("leftPlaneChange", (i) => {
      this.rightPlaneList = JSON.parse(JSON.stringify(newList));
      console.log(this.rightPlaneList);
      this.rightPlaneList = this.rightPlaneList.filter((item) => {
        return item.value != i && item.bizVal == parentVal
      })
      this.rightPlane = this.rightPlaneList[0].value
      this.leftSelectedPlane=i
      this.initVectorLayer()
    })

    //拖动监听方法
    this.$bas.$on("leftPanelDrageChange", (cordinate, zoom) => {
      if (cordinate && zoom) {
        this.rightCurrentCordinate = cordinate;
        this.rigthtCurrentZoom = zoom;
        view2.animate({
          center: cordinate,
          zoom: zoom, // 缩放级别
          rotation: undefined,
          duration: 10
        })
      }
    })

    //缩放监听
    this.$bas.$on("leftMovvendChange", (cordinate, zoom) => {
      if (cordinate && zoom) {
        this.rightCurrentCordinate = cordinate;
        this.rigthtCurrentZoom = zoom;
        view2.animate({
          center: cordinate,
          zoom: zoom, // 缩放级别
          rotation: undefined,
          duration: 10
        })
      }
    })
    document.getElementById('popup2').style.display = 'none';
    //交通信息点击按钮
    window.preview3 = function () {
      document.getElementById('info4').style.display = 'block';
      document.getElementById('info3').style.display = 'none';
      document.getElementById('btn3').style.background = '#004AB3';
      document.getElementById('btn4').style.background = '#D3D6DB';
      document.getElementById('info2').style.display = 'block';
      document.getElementById('info1').style.display = 'none';
      document.getElementById('btn1').style.background = '#004AB3';
      document.getElementById('btn2').style.background = '#D3D6DB';
    }
    //基本信息点击按钮
    window.preview4 = function () {
      document.getElementById('info4').style.display = 'none';
      document.getElementById('info3').style.display = 'block';
      document.getElementById('btn4').style.background = '#004AB3';
      document.getElementById('btn3').style.backgroundColor = '#D3D6DB';
      document.getElementById('info2').style.display = 'none';
      document.getElementById('info1').style.display = 'block';
      document.getElementById('btn2').style.background = '#004AB3';
      document.getElementById('btn1').style.backgroundColor = '#D3D6DB';
    }
  },
  methods: {

    addMarkTextLayer () {
      this.$emit('aquirePointMarkData', this.mapData);
    },

    changeCompareItemByBizType (parentVal, this_, leftPanel) {
      parentVal=parentVal
      this_.rightPlaneList = JSON.parse(JSON.stringify(newList));
      this_.rightPlaneList = this_.rightPlaneList.filter((item) => {
        return item.bizVal == parentVal && item.value != leftPanel
      })
      this_.rightPlane = this_.rightPlaneList[0].value
      this_.initVectorLayer()

    },

    // getPointsByLine (coords, dir) {
    //   let this_ = this;
    //   let styles = [];
    //   let distance_ = this_.style.interval / 2;//首个点放置在距离起点1/2间隔的位置
    //   let pix_start = this_.mapData.getPixelFromCoordinate(coords[0])
    //   let pix_end
    //   for (let i = 1; i < coords.length; i++) {
    //     let coord_, coord_pix;
    //     let style_;
    //     pix_end = this_.mapData.getPixelFromCoordinate(coords[i]);
    //     let dis_start2end = Math.sqrt(Math.pow((pix_start[0] - pix_end[0]), 2) + Math.pow((pix_start[1] - pix_end[1]), 2)) // 计算收尾在屏幕上的距离
    //     if (dis_start2end > distance_) { // 距离大于间隔
    //       // 计算距离开始点位的像素值
    //       coord_pix = [
    //         (distance_ * (pix_end[0] - pix_start[0])) / dis_start2end + pix_start[0],
    //         (distance_ * (pix_end[1] - pix_start[1])) / dis_start2end + pix_start[1]
    //       ];
    //       // 计算经纬度
    //       coord_ = this_.mapData.getCoordinateFromPixel(coord_pix);
    //       var rotation = Math.PI / 2 + Math.atan2(pix_end[1] - pix_start[1], pix_end[0] - pix_start[0]);
    //       if (dir == -1) {
    //         rotation = rotation + Math.PI
    //       }
    //       // 生成样式
    //       style_ = new Style({
    //         // 箭头点的位置
    //         geometry: new Point(coord_),
    //         // 箭头点的样式
    //         image: new Icon({
    //           src: require('@/assets/images/juece/up10-10.png'),
    //           rotateWithView: true,
    //           rotation: rotation,
    //           scale: this.style.line_width / 5,
    //           imgSize: [10, 10]
    //         })
    //       })
    //       //下次循环开始点为当前点
    //       pix_start = coord_pix;
    //       distance_ = this_.style.interval;
    //       i--;
    //     } else if (dis_start2end == distance_) {// 距离等于间隔
    //       var rotation = Math.PI / 2 + Math.atan2(pix_end[1] - pix_start[1], pix_end[0] - pix_start[0])
    //       if (dir == -1) {
    //         rotation = rotation + Math.PI
    //       }
    //       // 生成样式
    //       style_ = new Style({
    //         // 箭头点的位置
    //         geometry: new Point(coords[i]),
    //         // 箭头点的样式
    //         image: new Icon({
    //           src: require('@/assets/images/juece/up10-10.png'),
    //           rotateWithView: true,
    //           rotation: rotation,
    //           scale: this.style.line_width / 5,
    //           imgSize: [10, 10]
    //         })
    //       })
    //       pix_start = pix_end;
    //       distance_ = this_.style.interval;
    //     } else {//距离小于间隔
    //       distance_ = distance_ - dis_start2end;
    //       pix_start = pix_end;
    //     }
    //     style_ && styles.push(style_)
    //   }
    //   return styles
    // },

    getPointExtent (n) {
      n = n ? n : 1.2;
      let view = this.mapData.getView();
      let mapsize = this.mapData.getSize().map(it_ => {
        return it_ * n
      });
      return view.calculateExtent(mapsize);
    },


    getMiddlePoint (coords, feature) {
      try {
        if (coords == null || coords.length == 0 || coords == undefined) {
          return null;
        }
        if (coords.length <= 3) {
          var point_features = turf.points(feature.getGeometry().getCoordinates()[0]);
          return new Point(turf.center(point_features).geometry.coordinates);
        }
        if (coords.length % 2 == 0) {
          return new Point(coords[coords.length / 2])
        } else {
          return new Point(coords[Math.ceil(coords.length / 2)])
        }
      } catch (err) {
        console.log(err)
      }

    },


    iniFlowOrVocText (coords, feature, this_, text, offsetX, offsety) {
      let centerPoint = this.getMiddlePoint(coords, feature);
      if (!centerPoint) {
        return null;
      }
      let pix_start = this_.mapData.getPixelFromCoordinate(coords[0])
      let pix_end = this_.mapData.getPixelFromCoordinate(centerPoint.flatCoordinates);
      var rotation = Math.PI + Math.atan2(pix_end[1] - pix_start[1], pix_end[0] - pix_start[0]);
      if (pix_end[0] > pix_start[0]) {
        rotation = rotation + Math.PI
      }
      text = text + "";
      let color = this_.getColorByFeature(feature);
      return this.createTextStyle(centerPoint, rotation, text, offsetX, offsety, color);
    },



    initFlowOrVocPoint (feature, this_, isFlow) {
      let coords = feature.getGeometry().getCoordinates();
      let styles = [];
      let extent_ = this_.getPointExtent();
      let line_ = turf.multiLineString(coords);
      let line_clip_arr = turf.bboxClip(line_, extent_)
      let ab_text = isFlow ? feature.get("ab_flow") : feature.get("ab_voc");
      let ba_text = isFlow ? feature.get("ba_flow") : feature.get("ba_voc");
      if (ab_text != null && ab_text != '') {
        ab_text = isFlow ? Math.floor(ab_text) : formatFixNum(ab_text, 2);
      }
      if (ba_text != null && ba_text != '') {
        ba_text = isFlow ? Math.floor(ba_text) : formatFixNum(ba_text, 2);
      }

      if (line_clip_arr.geometry.type == "LineString") {
        if (ab_text != null && ab_text != '') {
          let offsetX = 15;
          let offsety = 15;
          let style_ab = this_.iniFlowOrVocText(line_clip_arr.geometry.coordinates, feature, this_, ab_text, offsetX, offsety);
          styles = styles.concat(style_ab)
        }
        if (ba_text != null && ba_text != '') {
          let offsetX = -15;
          let offsety = -15;
          let style_ba = this_.iniFlowOrVocText(line_clip_arr.geometry.coordinates, feature, this_, ba_text, offsetX, offsety);
          styles = styles.concat(style_ba)
        }

      }
      return styles;
    },


    createTextStyle (coordinate, roation, text, offsetx, offsety, color) {
      let styles_ = [];
      let text_ = new Text({
        textAlign: 'center',
        textBaseline: 'middle',
        font: 'normal 15px 微软雅黑',
        text: text,
        textBaseline: "middle", //文本基线
        offsetY: offsetx,
        offsetX: offsety,
        fill: new Fill({
          color: color
        }),
        rotation: roation,
      })
      let style_ = new Style({
        geometry: coordinate,
      })
      style_.setText(text_)
      styles_.push(style_)
      return styles_;
    },

    getColorByFeature (feature) {
      // 饱和度
      var max_voc = feature.get("max_voc");
      var color = this.style.line_stroke;
      if (max_voc > 0 && max_voc <= 0.25) {
        color = '#185817';
      } else if (max_voc > 0.25 && max_voc <= 0.5) {
        color = '#61a43a';
      } else if (max_voc > 0.5 && max_voc <= 0.75) {
        color = '#cfe05d';
      } else if (max_voc > 0.75 && max_voc <= 1) {
        color = '#d8c964';
      } else if (max_voc > 1 && max_voc <= 1.25) {
        color = '#d79550';
      } else if (max_voc > 1.25 && max_voc <= 1.5) {
        color = '#c75b41';
      } else if (max_voc > 1.5 && max_voc <= 1.75) {
        color = '#c75b41';
      } else if (max_voc > 1.75) {
        color = '#000000';
      }
      return color;
    },


    getPointsStyle (feature) {
      let coords = feature.getGeometry().getCoordinates();
      let this_ = this;
      let styles = [];
      // 方向（1单向，-1反向单向，0双向）
      var dir = feature.get("dir");
      // 饱和度
      var max_voc = feature.get("max_voc");
      // 流量
      var tot_flow = feature.get("tot_flow");
      // 颜色默认值
      var color = this.getColorByFeature(feature);
      // 粗细默认值
      var width = this_.style.line_width;

      var pec = 2;
      if (tot_flow > 0 && tot_flow <= 1250) {
        width = 1 * pec;
      } else if (tot_flow > 1250 && tot_flow <= 2500) {
        width = 2 * pec;
      } else if (tot_flow >= 2500) {
        width = 4 * pec;
      }
      styles.push(
        new Style({
          stroke: new Stroke({
            color: color,
            width: width,
          }),
        })
      )
      // let extent_ = this.getPointExtent();
      // let line_ = turf.multiLineString(coords);
      // let line_clip_arr = turf.bboxClip(line_, extent_)
      // if (line_clip_arr && line_clip_arr.geometry) {
      //   if (line_clip_arr.geometry.type == "LineString") {
      //     let style_ = this_.getPointsByLine(line_clip_arr.geometry.coordinates, dir);
      //     if (style_ instanceof Array) {
      //       styles = styles.concat(style_)
      //     } else {
      //       styles.push(style_)
      //     }
      //   } else if (line_clip_arr.geometry.type == "MultiLineString") {
      //     line_clip_arr.geometry.coordinates.forEach(coords => {
      //       let style_ = this_.getPointsByLine(coords, dir)
      //       if (style_ instanceof Array) {
      //         styles = styles.concat(style_)
      //       } else {
      //         styles.push(style_)
      //       }
      //     })
      //   }
      // }
      return styles
    },

    initVectorLayer () {
      let planeInfo = this.rightPlaneList.find(item => item.value == this.rightPlane)
      // 初始化拿到公共数据
      var $map = this.mapData;
      $map.removeLayer(this.vectorLayer);
      var $this = this;
      // 请求数据
      var url = process.env.VUE_APP_GIS_BASE_URL + '/Test/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=' + encodeURI(planeInfo.layerName) + '&maxFeatures=500000000&outputFormat=application%2Fjson';
      axios.get(url, null).then(function (res) {
        var featuresData = res.data;
        var vectorSource = new VectorSource({
          features: (new GeoJSON({ featureProjection: 'EPSG:3857', dataProjection: 'EPSG:4548' })).readFeatures(featuresData)
        });

        $this.vectorLayer = new VectorLayer({
          source: vectorSource,
          name: planeInfo.layerName,
          style: (feature, solution) => {
            let styles = $this.getPointsStyle(feature);
            //根据文字控制按钮新增文字样式
            let activeBtn = $this.$parent.$parent.$parent.activeBtn;
            if (activeBtn != '' && activeBtn != 3) {
              let isFlow = activeBtn == 3;
              let flowStyle = $this.initFlowOrVocPoint(feature, $this, isFlow)
              if (flowStyle != null) {
                styles = styles.concat(flowStyle);
              }
            }
            return styles;
          }
        })
        $this.mapData.addLayer($this.vectorLayer);

      });
    },
    // 初始化地图
    initMap () {
      const mapContainer = this.$refs.map2
      //将图层加入Map
      let map = new Map({
        layers: [gaodeMapLayer],
        target: mapContainer,
        view: view2
      });
      // 添加鼠标点击事件
      map.on('click', this.mapClick);
      // 拖动监听
      map.on('pointerdrag', this.rightPointerdrag);
      // 缩放监听
      map.on('moveend', this.rightMovvend);
      // 保存地图
      this.mapData = map
      //添加文字标注
      this.addMarkTextLayer();
    },

    getRightPlane () {
      return this.rightPlane;
    },

    leftPlaneChange () {
      this.mapData.removeLayer(this.vectorLayer);
      this.initVectorLayer();
      this.mapData.addLayer(this.vectorLayer);
    },

    changeRigthPlane () {
      this.removePopup();
      this.mapData.removeLayer(this.vectorLayer);
      this.initVectorLayer();
      this.mapData.addLayer(this.vectorLayer);
      this.$bas.$emit("rightPlaneChange", this.rightPlane)
    },

    rightPointerdrag () {
      this.rightCurrentCordinate = view2.getCenter();
      this.rigthtCurrentZoom = view2.getZoom()
      this.$bas.$emit("rightPanelDrageChange", this.rightCurrentCordinate, this.rigthtCurrentZoom)
    },


    rightMovvend () {
      this.rightCurrentCordinate = view2.getCenter();
      this.rigthtCurrentZoom = view2.getZoom()
      this.$bas.$emit("rightMovvendChange", this.rightCurrentCordinate, this.rigthtCurrentZoom)
    },

    showFlowText (this_, isFlow) {
      this_.vectorLayer.setStyle((feature, solution) => {
        let styles = [];
        let pointArrowStyle = this_.getPointsStyle(feature);
        let flowStyle = this_.initFlowOrVocPoint(feature, this_, isFlow)
        if (pointArrowStyle != null && pointArrowStyle.length > 0) {
          styles = styles.concat(pointArrowStyle)
        }
        if (flowStyle != null && flowStyle.length > 0) {
          styles = styles.concat(flowStyle)
        }
        return styles;
      })

    },

    hideFlowText (this_) {
      if (this_.vectorLayer) {
        this_.vectorLayer.setStyle(null);
        this_.vectorLayer.setStyle((feature, solution) => {
          let styles = [];
          let pointArrowStyle = this_.getPointsStyle(feature);
          if (pointArrowStyle != null && pointArrowStyle.length > 0) {
            styles = styles.concat(pointArrowStyle)
          }
          return styles;
        })
      }

    },



    assebleRightTransPopContent (feature, compaireFeature, layer) {
      let compaireResult = {}
      if (compaireFeature != null && compaireFeature != undefined) {
        compaireResult = featureCompaire(feature.properties, compaireFeature.properties);
      }
      let downUrl = require('@/assets/images/nav/down.png');
      let upUrl = require('@/assets/images/nav/up.png');
      let content = `<div style='color:#121924;font-weight: bold;width:100%;z-index:4;height:95px;padding:6px;font-size: 15px'>` + layer + `
        <div style = 'margin-top:10px' ><button id='btn3' style='margin-right:10px;border: none;height: 28px;line-height: 28px;border-radius: 4px;width: 80px;background: #004AB3;color: #ffffff;' onclick="preview3()">基本信息</button>
            <button id='btn4' style="border: none;height: 28px;line-height: 28px;border-radius: 4px;width: 80px;background: #D3D6DB;color: #ffffff;" onclick="preview4()">交通信息</button></div>
            </div>
        <div style='font-size: 10px;width:100%' id='info3'>`
      this.popTransList.forEach(element => {
        let propVal = feature.properties[element.propertie];
        if (propVal != null) {
          let maxLen = element.maxlength;
          let type = element.type;
          //格式化
          if (maxLen != null && type == 'float') {
            propVal = formatFixNum(propVal, maxLen)
          }
          if (type == 'int') {
            propVal = Math.floor(propVal)
          }
          //拼接单位
          let unit = element.unit;
          if (unit != null && propVal != null) {
            propVal = propVal + "&nbsp" + unit;
          }
        } else {
          propVal = '';
        }
        content = content + `<div style="height: 26px;width:100%">
                    <a style="color:#646566;width:40%;display: inline-block;">`+ element.label + `:</a>
                    <a style="text-align: right;font-size:14px;width:50%;display: inline-block;">`+ propVal + `</a>`
        if (compaireResult[element.propertie] == '>') {
          content = content + `<img src = ` + upUrl + ` style = 'width:20px;height:18px' />`
        } else if (compaireResult[element.propertie] == '<') {
          content = content + `<img src = ` + downUrl + ` style = 'width:20px;height:18px' />`
        }
        content = content + `</div>`
      });
      content = content + '</div>';
      return content;
    },






    // 弹出框
    addRightPopup (coordinate, feature, compaireFeature) {
      let thisObj = this;
      thisObj.removePopup()
      // 获取弹出层DOM
      let container = document.getElementById('popup2')
      let content = document.getElementById('popup-content2')
      if (thisObj.overlay) {
      } else {
        // 创建Overlay弹出层绑定DOM
        thisObj.overlay = new Overlay({
          element: container
        })
        // 添加到map
        thisObj.mapData.addOverlay(this.overlay)

      }
      // 道路信息
      let layer = feature.properties.layer == null ? "" : feature.properties.layer;
      let handle = feature.properties.handle == null ? "" : feature.properties.handle;
      let length = feature.properties.length == null ? "" : Math.floor(feature.properties.length) + " m";
      let capacity = feature.properties.capacity == null ? "" : feature.properties.capacity + ' pcu/h';
      // 方向（1单向，-1反向单向，0双向）
      let dir = feature.properties.dir == 1 ? "单向" : feature.properties.dir == -1 ? "反向单向" : feature.properties.dir == 0 ? "双向" : '';
      //交通流量
      let transPopContent = thisObj.assebleRightTransPopContent(feature, compaireFeature, layer);
      transPopContent = transPopContent + `</div>
          </div>
          <div style='font-size: 10px;width:100%' id='info4'>
            <div style="height: 26px;width:100%">
              <a style="color:#646566;width:45%;display: inline-block;">道路ID:</a>
              <a style="text-align: right;font-size:14px;width:50%;display: inline-block;">`+ handle + `</a>
            </div>
            <div style="height: 26px;width:100%">
              <a style="color:#646566;width:45%;display: inline-block;">等级:</a>
              <a style="text-align: right;font-size:14px;width:50%;display: inline-block;">`+ layer + `</a>
            </div>
            <div style="height: 26px;width:100%">
              <a style="color:#646566;width:45%;display: inline-block;">长度:</a>
              <a style="text-align: right;font-size:14px;width:50%;display: inline-block;">`+ length + `</a>
            </div>
            <div style="height: 26px;width:100%">
              <a style="color:#646566;width:45%;display: inline-block;">通行能力:</a>
              <a style="text-align: right;font-size:14px;width:50%;display: inline-block;">`+ capacity + `</a>
            </div>
             <div style="height: 26px;width:100%">
              <a style="color:#646566;width:45%;display: inline-block;">方向:</a>
              <a style="text-align: right;font-size:14px;width:50%;display: inline-block;">`+ dir + `</a>
            </div>
          </div>`;
      content.innerHTML = transPopContent;
      // 设置弹出层位置即可出现
      thisObj.overlay.setPosition(coordinate)
      document.getElementById('info3').style.display = 'none';
      document.getElementById('popup2').style.display = 'block';
    },

    // 清除弹出框
    removePopup () {
      if (this.overlay) {
        // 设置位置undefined可达到隐藏清除弹出框
        this.overlay.setPosition(undefined)
      }
    },
    removeBtn () {
      if (this.overlay) {
        // 设置位置undefined可达到隐藏清除弹出框
        this.overlay.setPosition(undefined)
        if (document.getElementById('popup').style.display == 'block') {
          document.getElementById('popup').style.display = 'none'
        }
        this.clearHighlight()
        //清除对面高亮
        this.$bas.$emit('clearHighlight_Y', '1')
      }
    },

    parseFeatureDetail (featureResp, feature) {
      if (!featureResp) {
        return null;
      }
      var jsonObj = JSON.parse(featureResp);
      var features = jsonObj.features;
      if (features == null || features.length == 0) {
        return null;
      }
      let compaireFeature;
      for (let k = 0; k < features.length; k++) {
        let properties = features[k].properties;
        if (properties.layer == feature.properties.layer
          && feature.properties.handle == properties.handle) {
          compaireFeature = features[k];
          break;
        }
      }
      return compaireFeature;

    },


    //根据道路ID查询对比方案详情
    assembleRightCompairePop (feature, thisObj, evt) {
      let selectedPlaneVal = thisObj.leftSelectedPlane;
      if (selectedPlaneVal == null || selectedPlaneVal == undefined) {
        selectedPlaneVal = 1;
      }
      let handle = feature.properties.handle
      if (handle == null) {
        thisObj.addRightPopup(evt.coordinate, feature, null);
        return;
      }
      let leftLayerName;
      newList.forEach(item => {
        if (item.value == selectedPlaneVal) {
          leftLayerName = item.layerName
        }
      })
      if (!leftLayerName) {
        thisObj.addRightPopup(evt.coordinate, feature, null);
        return;
      }
      let propertyName = 'Test:handle';
      let respProperties = 'layer,handle,length,capacity,ab_flow,ba_flow,tot_flow,ab_voc,ba_voc,max_voc,geom';
      let url = process.env.VUE_APP_GIS_BASE_URL + '/wfs?request=GetFeature&version=1.1.0&typeName='
        + leftLayerName + '&propertyName=' + respProperties + '&outputFormat=JSON&FILTER=<Filter xmlns="http://www.opengis.net/ogc"><PropertyIsEqualTo><PropertyName>'
        + propertyName + '</PropertyName><Literal>' + handle + '</Literal></PropertyIsEqualTo></Filter>'
      //请求url对比方案道路详情
      fetch(url)
        .then(function (response) {
          return response.text();
        })
        .then(function (info) {
          if (info != null) {
            let compaireFeature = thisObj.parseFeatureDetail(info, feature);
            thisObj.addRightPopup(evt.coordinate, feature, compaireFeature);
            //弹出左边弹出框
            thisObj.$emit('addLeftPopupByParent', evt.coordinate, compaireFeature, feature);

          } else {
            thisObj.addRightPopup(evt.coordinate, feature, null);
          }
        })


    },



    // 鼠标点击地图事件
    mapClick (evt) {
      let pixel = this.mapData.getEventPixel(evt.originalEvent);
      let feature = this.mapData.forEachFeatureAtPixel(pixel,
        function (feature, layer) {
          return feature;
        });
      if (feature) {
        //捕捉到要素后，弹框
        let featureConvert = convertFeature(feature);
        this.addHighLightStyle(feature, this, '')
        this.assembleRightCompairePop(featureConvert, this, evt);
      } else {
        this.removeBtn();
      }

    },
    addHighLightStyle (clickFeature, thisObj, num) {
      let featureObj = [];
      featureObj.push(clickFeature);
      this.clearHighlight();
      let highLightStyle = new Style({
        fill: new Fill({
          color: "#ffff00",
        }),
        stroke: new Stroke({
          color: "#ffff00",
          width: 8
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
      if (num === '') {
        //右边高亮
        this.$bas.$emit("addLeftHighLightStyle", clickFeature, thisObj, '1')
      }
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
    initComponentInfo () {
      let param = {};
      this.options=[]
      param.bizKey = 'plane_compare'
      initTreeList(param).then(res=> {
        let responseData = res.data[0].children;
        //初始化页面选择默认第一个
        responseData[1].children.forEach(s=>{
          this.rightPlaneList.push({
            layerName: s.layerName,
            name:s.name, 
            value: s.id,
            bizVal: s.parentId
          })
        })
        //newlist 获取全部的数据 筛选用
        responseData.forEach(ss=>{
          ss.children.forEach(r=>{
            newList.push({
            layerName: r.layerName,
            name:r.name, 
            value: r.id,
            bizVal: r.parentId,
          })
        })
        })
      parentVal=responseData[0].id
      this.leftSelectedPlane=this.rightPlaneList[0].value
      this.rightPlane=this.rightPlaneList[1].value
      // 初始化图层
      this.initVectorLayer();
      });
    },

  }


}
</script>

<style scoped lang="scss">
@import '~@/assets/styles/popup.scss';
@import '~@/assets/styles/traffic.scss';
.content {
  position: relative;
}
.select-div {
  left: 28px;
  top: 70px;
  padding: 10px 16px 0 16px;
}
</style>
