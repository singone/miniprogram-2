// pages/write/index.ts
Page({

  /**
   * 页面的初始数据
   */
  data: {
    value: '',
  },

  handleConfirm() {
    const {value} = this.data;

    if (!value || Number.isNaN(value * 1)) {
      wx.showToast({
        title: '请输入浓度',
        icon: 'none',
      })
      return;
    }
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.emit('change', { 
      value: Number(value),
    })
    wx.navigateBack({
      delta: 1,
    })
  },
  handleBack() {
    wx.navigateBack({
      delta: 1,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const {defaultValue} = options;
    this.setData({
      value: defaultValue,
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