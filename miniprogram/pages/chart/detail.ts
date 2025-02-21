// pages/chart/detail.ts
import * as echarts from '../../components/ec-canvas/echarts.min.js';
import store from '../../store/index';
import { getDrawerData } from '../drawer/utils.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ec: {
      lazyLoad: true,
    },
  },

  handleBack() {
    wx.navigateBack();
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log(options);
    const index = options.index;
    const item = store.files[index];
    console.log(item, index);
    const currentInfo = store.filesData[item.tempFilePath];
    console.log(currentInfo);
    if (!currentInfo) { 
      return;
    }
    this.drawCom = this.selectComponent('#chart-detail-com');
    this.drawCom.init((canvas, width, height, dpr) => {
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