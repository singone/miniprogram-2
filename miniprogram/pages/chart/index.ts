import store from "../../store/index";
import * as echarts from 'echarts';
import { transform } from 'echarts-stat';

echarts.registerTransform(transform.regression);
// pages/chart/index.ts
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ec: {
      lazyLoad: true,
      fileData: store.filesData || {},
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.setData({
      fileData: store.filesData || {},
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
      return [fileData[key].concentration, fileData[key].angle];
    });
    console.log(data);
    this.drawCom.init((canvas, width, height, dpr) => {
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: dpr // new
      });
      this.chart = chart;
      const option = {
        title: {
          text: '结果分析',
        },
        xAxis: {
          type: 'category',
          show: true,
        },
        yAxis: {
          type: 'value',
          show: true,
        },
        series: [{
          data: data,
          type: 'scatter',
        },   {
          transform: {
            type: 'ecStat:regression',
            // 'linear' by default.
            // config: { method: 'linear', formulaOn: 'end'}
          },
          type: 'line',
        }],
      };
      this.chart.setOption(option);
    });
   

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