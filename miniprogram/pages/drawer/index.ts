// pages/drawer/index.ts
import store from "../../store/index"
import * as echarts from 'echarts';
import { transform } from 'echarts-stat';
echarts.registerTransform(transform.regression);

Page({

  /**
   * 页面的初始数据
   */
  data: {
    files: store.files || [],
    selectedIndex: 0,
    currentUrl: null,
    ec: {
      lazyLoad: true,
    }
  },

  methods: {
    handleSelect(item, index){
      this.setData({
        selectedIndex: index,
        currentUrl: item,
      })
    },
   
  },
  initChart() {
    this.drawCom.init((canvas, width, height, dpr) => {
      // 获取组件的 canvas、width、height 后的回调函数
      // 在这里初始化图表
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: dpr // new
      });
      this.canvas = canvas;
      wx.getImageInfo({
        src: store.files[0].tempFilePath,
        success(res) {
          console.log(res);
          const option = {
            dataZoom: [
              {
                type: 'inside',  // 内部缩放，允许通过双指缩放
                start: 0,
                end: 100
              },
              {
                type: 'slider', // 外部滑动条缩放（可选）
                show: true,      // 显示滑动条
                top: '90%',      // 位置
                start: 0,
                end: 100
              }
            ],
            graphic: {
              elements: [
                {
                  type: 'image',
                  x: 0, 
                  id: 'image',
                  y: 0,
                  style: {
                    image:  store.files[0].tempFilePath,
                    width,
                    height: res.height / res.width * width,
                  },
                  onClick(e) {
                    console.log(e);
                  },
                },
                {
                  type: 'line',
                  x: 0, 
                  id: 'line1',
                  y: 100,
                  rotation: 0,
                  shape: {
                    x1: 0,
                    y1: 0,
                    x2: width,
                    y2: 0,
                  },
                  style: {
                    lineWidth: 10,
                    stroke: 'red',
                  },
                  focus: 'self',
                  onClick(e) {
                    console.log(e);
                  },
                },
              ]
            }
          }
          chart.setOption(option);
        },
        fail(err) {
          console.log(err);
        }
      })

      console.log(canvas, width, height, dpr)
      // 将图表实例绑定到 this 上，可以在其他成员函数（如 dispose）中访问
      this.chart = chart;

      this.setData({
        isLoaded: true,
        isDisposed: false
      });

      // 注意这里一定要返回 chart 实例，否则会影响事件处理等
      return chart;
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.setData({
      files: store.files || [],
      currentUrl: store.files[0] || null,
     
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    this.drawCom = this.selectComponent('#draw-com');
    this.initChart();
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