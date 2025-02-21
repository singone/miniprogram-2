
type Store = {
    files: (WechatMiniprogram.MediaFile & {
        checked?: boolean
    })[]
    filesData: Record<string, any>
    setFilesData(data: Record<string, any>): void
    removeFile(src: string): void
    setFiles(files: WechatMiniprogram.MediaFile[]): void
    clearFilesData(): void  
    testInfo: { file: WechatMiniprogram.MediaFile, linear: boolean }
    setTestInfo(info: { file: WechatMiniprogram.MediaFile, linear: boolean }): void
}
export default {
    files: wx.getStorageSync('files') || [],
    testInfo: wx.getStorageSync('testInfo') || {},
    filesData: wx.getStorageSync('filesData') || {},
    setFilesData(data: Record<string, any>) {
        this.filesData = {
            ...this.filesData || {},
            ...data,
        };
        wx.setStorage({
            key: 'filesData',
            data: data,
        });
    },
    clearFilesData() {
        this.filesData = {};
        wx.setStorage({
            key: 'filesData',
            data: this.filesData,
        });
    },
    removeFile(src: string) {
        const files = this.files.filter((file) => file.tempFilePath !== src);
        this.files = files;
        if (src in this.filesData) {
            delete this.filesData[src];
            wx.setStorage({
                key: 'filesData',
                data: this.filesData,
            });
        }
    
        wx.setStorage({
            key: 'files',
            data: files,
        });
    },
    addFile(files: WechatMiniprogram.MediaFile[]) {
        this.files = [...this.files, ...files];
        wx.setStorage({
            key: 'files',
            data: this.files,
        })
    },
    setFiles(files: WechatMiniprogram.MediaFile[]) {
        this.files = files;
        this.clearFilesData();
        wx.setStorage({
            key: 'files',
            data: files,
        })
    },
    setTestInfo(info: { file: WechatMiniprogram.MediaFile, linear: boolean }) {
        this.testInfo = info;
        wx.setStorage({
            key: 'testInfo',
            data: info,
        })
    },
} as Store;
