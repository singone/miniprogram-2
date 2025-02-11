
type Store = {
    files: WechatMiniprogram.MediaFile[]
}
export default {
    files: wx.getStorageSync('files') || [],
    setFiles(files: WechatMiniprogram.MediaFile[]) {
        this.files = files;
        wx.setStorage({
            key: 'files',
            data: files,
        })
    }
} as Store;