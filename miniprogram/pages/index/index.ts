// index.ts
// 获取应用实例
import store from "../../store/index"

const app = getApp<IAppOption>()

Page({
  data: {
  },
  handleSelect() {
    wx.chooseMedia({
      mediaType: ['image'],
      count: 20,
      success(res) {
        if(res.errMsg !== 'chooseMedia:ok') {
          return
        }
        store.setFiles(res.tempFiles);
        wx.navigateTo({
          url: '/pages/drawer/index',
        })
        console.log(res)
      }
    })
  },
  handleSelectChat() {
    wx.chooseMessageFile({
      count: 30,
      type: 'image',
      success(res) {
        store.setFiles(res.tempFiles.map(item => ({
          ...item,
          tempFilePath: item.path,
          duration: 0,
          height: 0,
          thumbTempFilePath: '',
          width: 0,
        })) as WechatMiniprogram.MediaFile[]);
        wx.navigateTo({
          url: '/pages/drawer/index',
        })
        console.log(res)
      }
    });
  }
})
