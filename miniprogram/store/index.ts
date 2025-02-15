
type Store = {
    files: WechatMiniprogram.MediaFile[]
    filesData: Record<string, any>
    setFilesData(data: Record<string, any>): void
    removeFile(src: string): void
    setFiles(files: WechatMiniprogram.MediaFile[]): void
    clearFilesData(): void
}
export default {
    files: wx.getStorageSync('files') || [],
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
    setFiles(files: WechatMiniprogram.MediaFile[]) {
        this.files = files;
        this.filesData = {};
        this.clearFilesData();
        wx.setStorage({
            key: 'files',
            data: files,
        })
    }
} as Store;