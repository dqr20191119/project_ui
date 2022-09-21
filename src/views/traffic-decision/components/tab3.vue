<template>
  <div>
    <nav_bar :navList="navList"></nav_bar>
    <div class="road-selector-pop">
      <div class="lenged-title">道路样式</div>
      <el-switch
        class="div-switch"
        v-model="value1"
        active-color="#004AB3"
        inactive-color="#004AB3"
        inactive-text="路网饱和度"
        active-text="路网流量"
        @change="switchChange"
      >
      </el-switch>
      <!--图例 路网饱和度 -->
      <div class="lenged1" v-show="value1 == false">
        <div
          v-for="(item, index) in legend1List"
          :key="index"
          class="lenged-item"
        >
          <div class="dot" :style="{ background: item.color }"></div>
          <div class="dot-text">{{ item.text }}</div>
        </div>
      </div>
      <!--图例 路网流量 -->
      <div class="lenged2" v-show="value1 == true">
        <div
          v-for="(item, index) in legend2List"
          :key="index"
          class="lenged-item"
        >
          <div
            class="lin-dot"
            :style="{ background: item.color, height: item.height }"
          ></div>
          <div class="dot-text">{{ item.text }}</div>
        </div>
      </div>
    </div>
    <!-- 悬浮框 -->
    <transition name="move">
      <div class="drawer-btn" @click="showClick" v-show="show2">
        优化建议 <img src="~@/assets/images/arrow-up.png" class="jt-icon" />
      </div>
    </transition>
    <transition name="move">
      <div class="drawer-div" v-show="show1">
        <div class="drawer-btn2" @click="hideClick">
          优化建议 <img src="~@/assets/images/arrow-down.png" class="jt-icon" />
        </div>
        <div class="box-content">
          <div class="flex-box box1">
            <div>
              <div class="box1-title">推荐方案</div>
              <el-table :data="tableData" style="width: 100%; margin-top: 12px">
                <el-table-column
                  prop="project"
                  label="对比项目"
                  :show-overflow-tooltip="true"
                >
                </el-table-column>
                <el-table-column
                  prop="programme"
                  :show-overflow-tooltip="true"
                  label="推荐方案"
                >
                </el-table-column>
              </el-table>
            </div>
            <div class="summary-div">
              <div class="summary-title">结论阐述</div>
              <div class="summary-div">{{ content }}</div>
            </div>
          </div>
          <div class="flex-box">
            <div class="box1-title">建设前后对比</div>
            <div>
              <div class="box-div box2">
                <bar_chart_h :barData="barData2"></bar_chart_h>
              </div>
              <div class="box-div box3">
                <bar_chart_v :barData="barData"></bar_chart_v>
              </div>
              <div class="box-div box4">
                <pie_chart-vue :pieData="pieData"></pie_chart-vue>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <!-- 地图 -->
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
    </div>
    <div class="change-div">
      <div
        class="switch-btn left-btn"
        @click="changeMap(1)"
        :class="{ 'btn-active': activeBtn == 1 }"
      >
        路网饱和度
      </div>
      <div
        class="switch-btn"
        @click="changeMap(2)"
        :class="{ 'btn-active': activeBtn == 2 }"
      >
        路网流量
      </div>
      <div
        class="switch-btn right-btn"
        @click="changeMap(3)"
        :class="{ 'btn-active': activeBtn == 3 }"
      >
        隐藏数值
      </div>
    </div>
  </div>
</template>

<script>
import nav_bar from '../../components/nav_bar.vue'
import pie_chartVue from './pie_chart.vue'
import bar_chart_h from './bar_chart_h.vue'
import Bar_chart_v from './bar_chart_v.vue'
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
import { Style, Circle, Stroke, Fill, Icon, IconImage, Image, Text } from 'ol/src/style'
import WKT from 'ol/format/WKT'
import GeoJSON from 'ol/format/GeoJSON'
import Overlay from 'ol/Overlay'
import * as echarts from "echarts";
import axios from 'axios'
import request from '@/utils/request'
import { formatFixNum } from "@/api/common/common";
import * as turf from '@turf/turf';
import Point from 'ol/geom/Point';



//中心坐标
const centerCordinate = [656813.44256, 3560432.98245]
//坐标定义
proj4.defs("EPSG:4548", "+proj=tmerc +lat_0=0 +lon_0=117 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs");
register(proj4);
const layerName = 'Test:plane1_v2';
//地图初始化
const view = new View({
  center: transform(centerCordinate, 'EPSG:4548', 'EPSG:3857'),
  minZoom: 4,
  maxZoom: 18,
  zoom: 14// 地图初始化的缩放级别
})


//高德地图图层
const gaodeMapLayer = new TileLayer({
  source: new XYZ({
    url: 'http://webst0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scl=2&style=7&x={x}&y={y}&z={z}'
  })
});
export default {
  components: {
    nav_bar,
    pie_chartVue,
    Bar_chart_v,
    bar_chart_h
  },
  data () {
    return {
      navList: ['交通决策', '优化建议'],
      show1: false,
      show2: true,
      vectorLayer: null,
      options: [{
        value: '1',
        label: '集疏运方案'
      }],
      value: '1',
      value1: false,
      //图例1
      style: {
        line_width: 3,
        line_stroke: '#459c50',
        interval: 40
      },
      legend1List: [
        {
          text: '0.00-0.25',
          color: '#B1DB16'
        },
        {
          text: '0.25-0.50',
          color: '#EBCC0C'
        }, {
          text: '0.50-0.75',
          color: '#EB7323'
        }, {
          text: '0.75-1.00',
          color: '#66A6FF'
        }, {
          text: '1.00-1.25',
          color: '#1979FF'
        }, {
          text: '>=1.25',
          color: '#0CE7F5'
        },
      ],
      //图例2
      legend2List: [
        {
          text: '0-600',
          color: '#7E59EB',
          height: '2px'
        },
        {
          text: '600-1500',
          color: '#7E59EB',
          height: '4px'
        }, {
          text: '1500-3000',
          color: '#7E59EB',
          height: '6px'
        }, {
          text: '3000-5000',
          color: '#7E59EB',
          height: '8px'
        }, {
          text: '5000以上',
          color: '#7E59EB',
          height: '10px'
        }
      ],
      //饼图数据
      pieData: {
        name: '交通量对比',
        data: [
          { value: 1048, name: '建设前' },
          { value: 735, name: '建设后' }
        ]
      },
      //柱状图 横向
      barData: {
        name: '车辆平均行驶速度',
        lenged: ['建设前', '建设后'],
        data: ['500', '99'],
      },
      //柱状图 竖向
      barData2: {
        name: '车辆平均延误时间',
        lenged: ['建设前', '建设后'],
        data: ['200', '129'],
      },
      //表格 数据
      tableData: [
        {
          project: '集疏运方案',
          programme: '方案2'
        },
        {
          project: '......',
          programme: '......'
        },
        {
          project: '......',
          programme: '......'
        }
      ],
      content: '采用相应方案组合后收费站平均排队时间减少5%路网整体通行效率提升10%......',
      activeBtn: ''

    }
  },
  mounted () {
    this.initVectorLayer(this);
    document.getElementById('popup').style.display = 'none';
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


    changeMap (num) {
      this.activeBtn = num;
      let this_ = this;
      this.vectorLayer.setStyle(function (feature, res) {
        return this_.setCurrentStyle(feature)
      });
    },


    showClick () {
      this.show1 = true
      this.show2 = false
    },
    hideClick () {
      this.show2 = true
      this.show1 = false
    },

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
      let color = this_.getColor(feature);
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


    getColor (feature) {
      var max_voc = feature.get("max_voc");
      var color = this.style.line_stroke;
      let switchColor = this.value1;
      if (!switchColor) {
        if (max_voc > 0 && max_voc <= 0.25) {
          color = '#b1db16';
        } else if (max_voc > 0.25 && max_voc <= 0.5) {
          color = '#ebcc0c';
        } else if (max_voc > 0.5 && max_voc <= 0.75) {
          color = '#eb7323';
        } else if (max_voc > 0.75 && max_voc <= 1) {
          color = '#66a6ff';
        } else if (max_voc > 1 && max_voc <= 1.25) {
          color = '#1979ff';
        } else if (max_voc > 1.25) {
          color = '#0ce7f5';
        }
      } else {
        color = '#7E59EB';
      }
      return color;
    },


    initVocStyle (feature) {
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
      var color = this_.getColor(feature);
      var width = this_.style.line_width;
      styles.push(
        new Style({
          stroke: new Stroke({
            color: color,
            width: width,
          }),
        })
      )

      return styles;
    },


    //初始化路网流量样式
    initFlowStyle (feature) {
      let coords = feature.getGeometry().getCoordinates();
      let this_ = this;
      let styles = [];
      var tot_flow = feature.get("tot_flow");
      var pec = 1;
      var width = this_.style.line_width;
      if (tot_flow > 0 && tot_flow <= 600) {
        width = 2 * pec;
      } else if (tot_flow > 600 && tot_flow <= 1500) {
        width = 4 * pec;
      } else if (tot_flow > 1500 && tot_flow <= 3000) {
        width = 6 * pec;
      } else if (tot_flow > 3000 && tot_flow <= 5000) {
        width = 8 * pec;
      } else if (tot_flow > 5000) {
        width = 10 * pec;
      }
      var color = this_.getColor(feature);
      styles.push(
        new Style({
          stroke: new Stroke({
            color: color,
            width: width,
          }),
        })
      )
      return styles;

    },

    switchChange () {
      let this_ = this;
      this.vectorLayer.setStyle(function (feature, res) {
        return this_.setCurrentStyle(feature)
      });
    },

    setCurrentStyle (feature) {
      let this_ = this;
      //开关控制样式
      let changeVal = this.value1;
      let styles = [];
      if (!changeVal) {
        styles = styles.concat(this_.initVocStyle(feature));
      } else {
        styles = styles.concat(this_.initFlowStyle(feature));
      }
      //隐藏文字 显示文字样式
      let activeBtn = this.activeBtn;
      if (activeBtn == 1) {
        let style = this_.initFlowOrVocPoint(feature, this_, false);
        if (style) {
          styles = styles.concat(style)
        }
      } else if (activeBtn == 2) {
        let style = this_.initFlowOrVocPoint(feature, this_, true);
        if (style) {
          styles = styles.concat(style)
        }
      }
      return styles;
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







    // 初始化地图
    addLayerToMap () {
      const mapContainer = this.$refs.map
      //将图层加入Map
      const map = new Map({
        layers: [gaodeMapLayer, this.vectorLayer],
        target: mapContainer,
        view: view
      });
      // 添加鼠标点击事件
      map.on('click', this.mapClick);
      // 保存地图
      this.mapData = map
    },

    initVectorLayer (_this) {
      var url = process.env.VUE_APP_GIS_BASE_URL + '/Test/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=' + encodeURI(layerName) + '&maxFeatures=500000000&outputFormat=application%2Fjson';
      axios.get(url, null).then(function (res) {
        var featuresData = res.data;
        var vectorSource = new VectorSource({
          features: (new GeoJSON({ featureProjection: 'EPSG:3857', dataProjection: 'EPSG:4548' })).readFeatures(featuresData)
        });

        _this.vectorLayer = new VectorLayer({
          source: vectorSource,
          style: (feature, solution) => {
            return _this.initVocStyle(feature)
          }
        })
        _this.addLayerToMap();

      })
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
      // 道路信息
      let featureVal = feature.values_;
      let layer = featureVal.layer == null ? "" : featureVal.layer;
      let handle = featureVal.handle == null ? "" : featureVal.handle;
      let length = featureVal.length == null ? "" : Math.floor(featureVal.length) + " m";
      let capacity = featureVal.capacity == null ? "" : featureVal.capacity + ' pcu/h';


      let abFlow = featureVal.ab_flow == null ? "" : Math.floor(featureVal.ab_flow) + 'pcu/h';
      let baFlow = featureVal.ba_flow == null ? "" : Math.floor(featureVal.ba_flow) + ' pcu/h';
      let totalFlow = featureVal.tot_flow == null ? "" : Math.floor(featureVal.tot_flow) + 'pcu/h';

      let abVoc = featureVal.ab_voc == null ? "" : formatFixNum(featureVal.ab_voc, 2);
      let baVoc = featureVal.ba_voc == null ? "" : formatFixNum(featureVal.ba_voc, 2);
      let maxVoc = featureVal.max_voc == null ? "" : formatFixNum(featureVal.max_voc, 2);


      content.innerHTML = `
            <div style='color:#121924;font-weight: bold;width:100%;z-index:4;height:95px;padding:6px;font-size: 15px'>`+ layer + `
            <div style='margin-top:10px'><button id='btn1' style='margin-right:10px;border: none;height: 28px;line-height: 28px;border-radius: 4px;width: 80px;background: #004AB3;color: #ffffff;' onclick="preview1()">基本信息</button>
            <button id='btn2' style="border: none;height: 28px;line-height: 28px;border-radius: 4px;width: 80px;background: #D3D6DB;color: #ffffff;" onclick="preview2()">交通信息</button></div>
            </div>
            <div style='font-size: 10px;width:100%' id='info1'>
                <div style="height: 26px;width:100%">
                    <a style="color:#646566;width:45%;display: inline-block;">AB交通量:</a>
                    <a style="text-align: right;font-size:14px;width:50%;display: inline-block;">`+ abFlow + `</a>
                </div>
                <div style="height: 26px;width:100%">
                    <a style="color:#646566;width:45%;display: inline-block;">BA交通量:</a>
                    <a style="text-align: right;font-size:14px;width:50%;display: inline-block;">`+ baFlow + `</a>
                </div>
                <div style="height: 26px;width:100%">
                    <a style="color:#646566;width:45%;display: inline-block;">总交通量:</a>
                    <a style="text-align: right;font-size:14px;width:50%;display: inline-block;">`+ totalFlow + `</a>
                </div>
                <div style="height: 26px;width:100%">
                    <a style="color:#646566;width:45%;display: inline-block;">AB饱和度:</a>
                    <a style="text-align: right;font-size:14px;width:50%;display: inline-block;">`+ abVoc + `</a>
                </div>
                <div style="height: 26px;width:100%">
                    <a style="color:#646566;width:45%;display: inline-block;">BA饱和度:</a>
                    <a style="text-align: right;font-size:14px;width:50%;display: inline-block;">`+ baVoc + `</a>
                </div>
                <div style="height: 26px;width:100%">
                    <a style="color:#646566;width:45%;display: inline-block;">最大饱和度:</a>
                    <a style="text-align: right;font-size:14px;width:50%;display: inline-block;">`+ maxVoc + `</a>
                </div>
            </div>
            <div style='font-size: 10px;width:100%' id='info2'>
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
            </div>
            `
      // 设置弹出层位置即可出现
      this.overlay.setPosition(coordinate)
      document.getElementById('info1').style.display = 'none';
      document.getElementById('popup').style.display = 'block';
    },

    // 清除弹出框
    removePopup () {
      if (this.overlay) {
        // 设置位置undefined可达到隐藏清除弹出框
        this.overlay.setPosition(undefined)
      }
    },

    // 鼠标点击地图事件
    mapClick (evt) {
      this.clearHighlight();
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


    // 鼠标点击地图事件
    //地图点击事件
    // mapClick (evt) {
    //   this.removePopup();
    //   let thisObj = this;
    //   var viewResolution = view.getResolution();
    //   var featureUrl = this.vectorLayer.getSource().getFeatureInfoUrl(
    //     evt['coordinate'],
    //     viewResolution,
    //     'EPSG:3857',
    //     { 'INFO_FORMAT': 'application/json' }
    //   );
    //   if (featureUrl) {
    //     fetch(featureUrl)
    //       .then(function (response) {
    //         return response.text();
    //       })
    //       .then(function (info) {
    //         var objData = JSON.parse(info);
    //         if (objData && objData.features[0]) {

    //           thisObj.addPopup(evt.coordinate, objData.features[0]);
    //         } else {
    //           thisObj.removePopup();
    //         }

    //       });
    //   } else {
    //     this.removePopup();
    //   }
    // },
  }
}
</script>

<style lang="scss" scoped>
@import '~@/assets/styles/draws.scss';
@import '~@/assets/styles/popup.scss';
@import '~@/assets/styles/traffic.scss';
.change-div {
  position: absolute;
  right: 4rem;
  top: 0.5rem;
  z-index: 999;
  .switch-btn {
    display: inline-block;
    width: 1.2875rem;
    height: 0.475rem;
    text-align: center;
    background: #004ab3;
    box-sizing: border-box;
    border: 0.025rem solid #004ab3;
    font-size: 0.175rem;
    font-weight: bold;
    line-height: 0.4375rem;
    color: #ffffff;
    cursor: pointer;
    box-shadow: 0 0.125rem 0.25rem 0.0125rem rgb(138 144 153 / 40%);
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
</style>