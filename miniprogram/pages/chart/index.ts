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
    this.drawLine();
  },
  handleCheckItem(e) {
    console.log(e);
    const {index} = e.currentTarget.dataset;
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
    this.drawLine();
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
        checked: item.checked === undefined ? true : item.checked,
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
      
        },
      },
    });
    this.drawCom = this.selectComponent('#chart-com');
    this.initChart();
  },
  drawLine() {
    const {files} = this.data;
    const data = files.filter(i => i.checked).map(item => {
      return [item.concentration, item.angle];
    });
    if (data.length < 3) {
      wx.showToast({
        title: '请至少选择3个数据',
        icon: 'none',
      });
      return;
    }
    console.log(data, ecStat.regression('linear', data, 1));
    const linear = ecStat.regression('linear', data, 1);
    this.setData({
      linear: linear,
    });
    const option = {
      title: {
        top: 16,
        right: 20,
        text: linear.expression,
        textStyle: {
          fontSize: 16,
          color: '#333',
        },
      },
      grid: {
        left: '5%',
        bottom: '10%',
        right: '5%',
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        show: true,
        name: '浓度(mol/L)',
        nameLocation: 'end',
        nameGap: -60,
        nameTextStyle:{
          fontSize: 12,
          color: '#999',
        },
        min: function (value) {
          return value.min - 1;
        },
        max: function (value) {
          return value.max + 1;
        },  
        axisLabel: {
          fontSize: 16,
          color: '#666',
        },
        splitLine: {
          show: false,
        },
        axisLine: {
          lineStyle: {
            color: '#ebeff5',
          }
        },
        axisTick: {
          show: false,
        },
      },
      yAxis: {
        type: 'value',
        show: true,
        offset: -10,
        name: '角度(°)',
        nameLocation: 'end',
        nameTextStyle:{
          fontSize: 12,
          color: '#999',
        },
        axisLabel: {
          fontSize: 16,
          color: '#666',
        },
        axisLine: {
          lineStyle: {
            color: '#ebeff5',
          }
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          lineStyle: {
            type: 'solid',
            color: '#ebeff5',
          }
        },
       
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
        itemStyle: {
          color: '#3173FA',
        },
      },   {
        datasetIndex: 1,
        type: 'line',
        showSymbol: false,
        lineStyle: {
          color: '#3173FA',
        },
      }],
    };
    this.chart.setOption(option);
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
   
    this.drawCom.init((canvas, width, height, dpr) => {
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: dpr // new
      });
      this.chart = chart;
      this.drawLine();
     
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
    this.drawCom.canvasToTempFilePath({
      success: res => {
        // 存入系统相册
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath || '',
          success: res => {
            wx.showToast({
              title: '保存成功',
            })
          },
          fail: res => {
            wx.showToast({
              title: '保存失败',
              icon: 'none',
            })
          }
        })
      },
      fail: res => {
        wx.showToast({
          title: '保存失败',
          icon: 'none',
        })
      }
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
  handleViewResult(e) {
    const {index} = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/chart/detail?index=${index}`,
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