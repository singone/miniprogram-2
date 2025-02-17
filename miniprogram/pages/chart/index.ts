import store from "../../store/index";
import * as echarts from '../../components/ec-canvas/echarts.min.js';
import ecStat from 'echarts-stat';
import { getDrawerData } from "../drawer/utils";

echarts.registerTransform(ecStat.transform.regression);
// pages/chart/index.ts
Page({

  /**
   * 页面的初始数据
   */
  data: {
    fileData: store.filesData || {},
    files: store.files || [],
    ec: {
      lazyLoad: true,
    },
    showTest: false,
    actions: [
      { name: '从相册选择', value: 'photo' },
      { name: '从聊天记录中选择', value: 'chat' },
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    const files = (store.files || []).map(item => {
      const fileData = store.filesData[item.tempFilePath];
      if (!fileData) {
        return item;
      }
      return {
        ...item,
        ...fileData,
        angle: Math.round(fileData.angle * 180 / Math.PI * 100)/100,
        concentration: fileData.concentration,
      }
    });
    this.setData({
      fileData: store.filesData || {},
      files,
      ecDrawer: {
        onInit: (canvas, width, height, dpr ) => {
          const index = canvas.canvasId.replace('table-Chart-', '');
          const item = store.files[index];
          console.log(item, index);
          const currentInfo = store.filesData[item.tempFilePath];
          console.log(currentInfo);
          if (!currentInfo) { 
            return;
          }
          console.log(currentInfo, canvas, width, height, dpr);
          const chart = echarts.init(canvas, null, {
            width: width,
            height: height,
            devicePixelRatio: dpr // new
          });
          const {option} = getDrawerData(currentInfo, {
            width: width,
            height: height,
            dpr: dpr,
          }, 1);
          chart.setOption(option);
        },
      },
    });
    this.drawCom = this.selectComponent('#chart-com');
    this.initChart();
  },

  initChart() {
    if (this.chart) {
      return;
    }
    const {fileData} = this.data;
    const keys = Object.keys(fileData);
    const data = keys.map(key => {
      return [fileData[key].concentration, fileData[key].angle * 180 / Math.PI];
    });
    console.log(data, ecStat.regression('linear', data, 1));
    const linear = ecStat.regression('linear', data, 1);
    this.setData({
      linear: linear,
    });
    this.drawCom.init((canvas, width, height, dpr) => {
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: dpr // new
      });
      this.chart = chart;
      const option = {
    
        xAxis: {
          type: 'value',
          show: true,
          name: '浓度(mol/L)',
          nameLocation: 'middle',
          nameGap: 30,
          splitLine: {
            lineStyle: {
              type: 'dashed'
            }
          }
        },
        yAxis: {
          type: 'value',
          show: true,
          offset: -10,
          name: '角度(°)',
          nameLocation: 'end',
          splitLine: {
            lineStyle: {
              type: 'dashed'
            }
          }
        },
        dataset: [
          {
            source: data
          },
          {
            source: linear.points,
          }
        ],
        series: [{
          data: data,
          type: 'scatter',
        },   {
          datasetIndex: 1,
          type: 'line',
        }],
      };
      this.chart.setOption(option);
    });
   

  },
  handleScroll() {
  },
  handleBack() {
    wx.navigateBack({
      delta: 1,
    })
  },
  handleTest() {
    this.setData({
      showTest: true,
    })
  },
  handleCancel() {
    this.setData({
      showTest: false,
    })
  },
  handleSelect(e) {
    console.log(e);
    if (e.detail.value === 'photo') {
      wx.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sourceType: ['album'],
        success: (res) => {
          console.log(res);
          this.goToTest(res.tempFiles[0]);
        },
      })
      return;
    } 
    if (e.detail.value === 'chat') {
      wx.chooseMessageFile({
        count: 1,
        type: 'image',
        success: (res) => {
          this.goToTest({
            tempFilePath: res.tempFiles[0].path,
          });
        },
      });
    }
  },  
  goToTest(file) {
    const { linear } = this.data;
    store.setTestInfo({
      file,
      linear,
    });
    wx.navigateTo({
      url: `/pages/drawer/index?test=true`,
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})