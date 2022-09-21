<template>
  <div>
    <el-row :gutter="20">
      <!-- 对比-左边内容 -->
      <el-col :span="12">
        <tab2-left-vue
          ref="leftTab"
          @addRightPopupByParent="addRightPopupByParent"
          @getRightSelectedPlane="getRightSelectedPlane"
          @compareItemChange="compareItemChange"
          @aquirePointMarkData="aquirePointMarkData"
        ></tab2-left-vue>
      </el-col>
      <!-- 对比-右边内容 -->
      <el-col :span="12">
        <tab2-right-vue
          ref="rightTab"
          @addLeftPopupByParent="addLeftPopupByParent"
          @aquirePointMarkData="aquirePointMarkData"
        ></tab2-right-vue>
      </el-col>
    </el-row>
    <nav_bar :navList="navList"></nav_bar>
    <!-- 下拉框 对比项-->
    <div class="select-div">
      <div class="lenged-title">对比项</div>

      <el-select
        v-model="value"
        placeholder="请选择"
        @change="compareItemChange($event)"
        class="b-bg"
      >
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
        </el-option>
      </el-select>
    </div>
    <!--图例 路网饱和度 -->
    <div class="lenged1">
      <div class="lenged-title">网路饱和度</div>
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
    <div class="lenged2">
      <div class="lenged-title">路网流量</div>
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
    <transition name="move">
      <div class="drawer-btn" @click="showClick" v-show="show2">
        方案比选
        <img src="~@/assets/images/arrow-up.png" class="jt-icon" />
      </div>
    </transition>
    <transition name="move">
      <div class="drawer-div" v-show="show1">
        <div class="drawer-btn2" @click="hideClick">
          方案比选
          <img src="~@/assets/images/arrow-down.png" class="jt-icon" />
        </div>
        <scoll-div-vue v-if="show1">
        <!--总体信息表格-->
         <div v-for="(item, index) in tableArray" :key="index">
          <div class="flex-box box0" v-if="item.cptType == 'TABLE'">
            <div class="box1-title" v-show="item.title !=null">{{item.title}}</div>
            <div class="table-div">
              <div v-for="(item2, index2) in item.tableData" :key="index2" class="table-box">
                <el-tooltip placement="top">
                  <div slot="content">{{item2.label}}</div>
                  <span class="table-header">{{item2.label}}</span>
                </el-tooltip>
                  <div v-for="s in item2.children" :key="s.id" class="table-body">
                    <el-tooltip placement="top">
                  <div slot="content">{{s.value}}</div>
                  <span> {{s.value}}</span>
                </el-tooltip>
                
                  </div>
              </div>
            </div>
          </div>
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
            <div class="flex-box box2" v-if="item.cptType == 'MBAR'">
              <bar_chart_h :barData="item"  ></bar_chart_h>
            </div>
          </div>
        </scoll-div-vue>
      </div>
    </transition>
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
import bar_chart_h from './bar_chart_copy.vue'
import Bar_chart_v from './bar_chart_v.vue'
import tab2LeftVue from './tab2-left.vue'
import tab2RightVue from './tab2-right.vue'
import scollDivVue from './scollDiv.vue'
import TileLayer from 'ol/layer/Tile'
import XYZ from 'ol/source/XYZ'
import axios from 'axios'
import VectorSource from 'ol/source/Vector'
import VectorLayer from 'ol/layer/Vector'
import GeoJSON from 'ol/format/GeoJSON'
import OlStyleStyle from 'ol/style/Style'
import OlStyleIcon from 'ol/style/Icon'
import Text from 'ol/style/Text'

import { Style, Circle, Stroke, Fill } from 'ol/src/style'

import { initTreeList } from "@/api/decision-manage/decision";
import { findComponentInfo } from "@/api/config/component";
import { getUrlKey } from '@/utils/request'
export default {
  components: {
    nav_bar,
    pie_chartVue,
    Bar_chart_v,
    bar_chart_h,
    tab2LeftVue,
    tab2RightVue,
    scollDivVue
  },
  data () {
    return {
      navList: ['交通决策', '方案比选'],
      show1: false,
      show2: true,
      planeTxtMarkCacheKey: "planeTxtMark",
      planeTextMarkLayerName: "Test:plane_point",
      options: [],
      value: '',
      //图例1
      legend1List: [],
      //图例2
      legend2List: [],
      activeBtn: '',
      tableArray: [],

    }
  },
  mounted () {
    this.show1 = true
    this.show2 = false

  },
  created () {
    this.menuId = getUrlKey('menuId');
    this.initData(this)
    this.initCompareItemByBizKey()
  },
  methods: {
    changeMap (num) {
      this.activeBtn = num
      let leftTab = this.$refs.leftTab;
      let rightTab = this.$refs.rightTab;
      if (this.activeBtn == 1) {
        leftTab.showFlowText(leftTab, false)
        rightTab.showFlowText(rightTab, false)
      } else if (this.activeBtn == 2) {
        leftTab.showFlowText(leftTab, true)
        rightTab.showFlowText(rightTab, true)
      } else if (this.activeBtn == 3) {
        leftTab.hideFlowText(leftTab)
        rightTab.hideFlowText(rightTab)

      }
    },

    //获取文字标注信息
    aquirePointMarkData (_mapData) {
      let this_ = this;
      let pointMarkData = sessionStorage.getItem(this.planeTxtMarkCacheKey)
      if (pointMarkData != null) {
        this.addPointMarkLayer(_mapData, JSON.parse(pointMarkData));
        return;
      }
      // 请求数据
      var url = process.env.VUE_APP_GIS_BASE_URL + '/Test/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=' + encodeURI(this.planeTextMarkLayerName) + '&maxFeatures=500000000&outputFormat=application%2Fjson';
      axios.get(url, null).then(function (res) {
        var featuresData = res.data;
        if (featuresData) {
          sessionStorage.setItem(this_.planeTxtMarkCacheKey, JSON.stringify(featuresData));
          this_.addPointMarkLayer(_mapData, featuresData);
        }

      })

    },

    createTextMarkStyle (feature) {
      let styles = [];
      let style = new OlStyleStyle({
        //文本样式
        text: new Text({
          textAlign: 'center',
          textBaseline: 'middle',
          font: 'normal 15px 微软雅黑',
          text: feature.values_.name,
          offsetY: -25,
          fill: new Fill({
            color: feature.values_.font_color
          }),
          rotation: feature.values_.font_angle * Math.PI / 180,
          padding: [2, 5, 2, 5],
        }),
      });
      styles.push(style);
      return styles;
    },



    //初始化图层
    addPointMarkLayer (_mapData, featuresData) {
      var vectorSource = new VectorSource({
        features: (new GeoJSON({ featureProjection: 'EPSG:3857', dataProjection: 'EPSG:4548' })).readFeatures(featuresData)
      });
      let vectorLayer = new VectorLayer({
        source: vectorSource,
        style: (feature, solution) => {
          return this.createTextMarkStyle(feature)
        }
      })
      _mapData.addLayer(vectorLayer);
    },



    //对比项切换
    compareItemChange (val) {
      this.bizId=val
      //跟新弹出层下方数据
      this.initTableData(this.bizId)
      // //左右对比项
      let leftPanel = this.$refs.leftTab.changeCompareItemByBizType(val, this.$refs.leftTab)
      this.$refs.rightTab.changeCompareItemByBizType(val, this.$refs.rightTab, leftPanel)

    },
    showClick () {
      this.show1 = true
      this.show2 = false
    },
    hideClick () {
      this.show2 = true
      this.show1 = false
    },

    addRightPopupByParent (coordinate, compaireFeature, feature) {
      this.$refs.rightTab.addRightPopup(coordinate, compaireFeature, feature)
    },

    addLeftPopupByParent (coordinate, compaireFeature, feature) {
      this.$refs.leftTab.addLeftPopup(coordinate, compaireFeature, feature)
    },

    getRightSelectedPlane () {
      return this.$refs.rightTab.getRightPlane();
    },
    //初始化页面
    initCompareItemByBizKey () {
      let param = {};
      this.options=[]
      param.bizKey = 'plane_compare'
      initTreeList(param).then(response => {
        let responseData = response.data[0].children;
        responseData.forEach(s=>{
          this.options.push({
            value:s.id,
            label:s.name
          })       
        })
      this.value=this.options[0].label
      this.bizId=this.options[0].value
      this.initTableData(this.bizId)
      });
    },
    initData(_this) {
      this.legend1List=[]
      this.legend2List=[]
      findComponentInfo(this.menuId,null,null).then(res => {
        //图例
        let lenged1=res.data.decLegendConfigList[0]
          lenged1.forEach(s => {
            this.legend1List.push({
              text:s.label,
              color:s.lengendColor
            })
          });
          let lenged2=res.data.decLegendConfigList[1]
          lenged2.forEach(s => {
            this.legend2List.push({
              text:s.label,
              color:s.lengendColor,
              height:(s.width)/80+'rem'
            })
          });
      })
    },
    initTableData(id){
      this.tableArray=[]
      findComponentInfo(this.menuId, null,id).then(res => {
          this.tableArray= res.data.tableList
      })
    }




  }
}
</script>

<style lang="scss" scoped>
@import '~@/assets/styles/draws.scss';
@import '~@/assets/styles/traffic.scss';
.lenged1,
.lenged2 {
  padding: 0.125rem 0.2rem;
  background: rgba(255, 255, 255, 0.96);
  border: 0.0125rem solid #e6effa;
  box-shadow: 0px 0.125rem 0.25rem 0.0125rem rgba(138, 144, 153, 0.4);
  border-radius: 0.05rem 0.05rem 0.05rem 0.05rem;
  .lenged-item {
    line-height: 0.25rem;
  }
}
.lenged1 {
  position: absolute;
  top: 2.225rem;
  left: 0.4rem;
  width: 2.175rem;
}
.lenged2 {
  position: absolute;
  top: 5rem;
  left: 0.4rem;
  width: 2.175rem;
}
.select-div {
  top: 1rem;
  left: 0.4rem;
  padding: 0.125rem 0.2rem;
}
.el-select > .el-input {
  width: 1.5rem;
  border-radius: 0.025rem;
}
::v-deep .el-table th.el-table__cell > .cell {
  white-space: pre;
}
::v-deep .el-table__cell {
  padding: 0.0625rem 0;
}
.b-bg ::v-deep .el-input__inner {
  background: rgba(242, 245, 250, 0.96);
}
::v-deep .el-select .el-input .el-select__caret {
  color: #222324;
}
::v-deep .el-input__inner {
  border: 0;
}
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
.table-div{
    width: 100%;
    margin-top: 0.125rem;
    border-radius: 0.05rem;
    display: flex;

  }
  .table-header{
    display: inline-block;
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 0 5%;
    background: #F5F7FA;
  }
  .table-box{
    line-height: 32px;
    text-align: center;
    border-bottom: 1px solid #E6E8EB;
    .table-body{
      width: 100%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      padding: 0 5%;
    }
  }
</style>
