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
    isAllChecked: false,
    actions: [
      { name: '从相册选择', value: 'photo' },
      { name: '从聊天记录中选择', value: 'chat' },
    ],
  },

  handleSelectAll(e) {
    console.log(e);
    this.setData({
      isAllChecked: e.detail,
      files: this.data.files.map(item => {
        return {
          ...item,
          checked: e.detail,
        }
      }),
    })
  },
  handleCheckItem(e) {
    console.log(e);
    const {index, item} = e.currentTarget.dataset;
    const newFiles = this.data.files.map((item, idx) => {
      return {
        ...item,
        checked: index === idx ? e.detail : item.checked,
      }
    });
    this.setData({
      files: newFiles,
      isAllChecked: newFiles.every(item => item.checked),
    })
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
        checked: true,
        angle: Math.round(fileData.angle * 180 / Math.PI * 100)/100,
        concentration: fileData.concentration,
      }
    });
    this.setData({
      fileData: store.filesData || {},
      files,
      isAllChecked: files.every(item => item.checked),
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

  handleViewDetail(e) {
    const {index} = e.currentTarget.dataset;
    wx.previewImage({
      current: index,
      urls: this.data.files.map(item => item.tempFilePath),
    })
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
  handleSaveChart() {
    console.log('保存图表');
    wx.saveImageToPhotosAlbum({
      filePath: this.chart.getImage(),
      success: () => {
        wx.showToast({
          title: '保存成功',
        })
      },
    });
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