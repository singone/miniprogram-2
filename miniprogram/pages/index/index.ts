// index.ts
// 获取应用实例
import store from "../../store/index"

const app = getApp<IAppOption>()

Component({
  data: {
  },
  methods: {
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
    }
  },
})
