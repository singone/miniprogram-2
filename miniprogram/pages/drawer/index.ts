// pages/drawer/index.ts
import store from "../../store/index"
import * as echarts from 'echarts';
import { transform } from 'echarts-stat';
import { calculateAngle, findIntersection, tangentSlope } from "./utils";
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
    },
    fileData: store.filesData || {},
    selectType: '',
    changeNum: 1,
  },
  drawInfo: {
    width: 0,
    height: 0,
    dpr: 1,
  },
  chart: null,
  canvas: null,
  drawCom: null,
  scale: 1,
  
  currentInfo: {
    x: 0,
    y: 0,
    rotation: 0,
    concentration: '',
    angle: 0,
    img: {
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      url: '',
      rotation: 0,
      imgScale: 0,
    },
    line: {
      x1: 0,
      y1: 0,
      x2: 0,
      y2: 0,
      rotation: 0,
    },
    ellipse: {
      cx: 0,
      cy: 0,
      rx: 0,
      ry: 0,
    },
  },
  handleSelect(e){
    const {item, index} = e.currentTarget.dataset;
    this.setData({
      selectedIndex: index,
      currentUrl: item,
    })
    this.readImgInfo();
    this.drawImg();
  },
  initChart() {
    if (this.chart) {
      return;
    }
    this.drawCom.init((canvas, width, height, dpr) => {
      // 获取组件的 canvas、width、height 后的回调函数
      // 在这里初始化图表
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: dpr // new
      });
      this.chart = chart;

      this.drawInfo = {
        width,
        height,
        dpr,
      }
      this.canvas = canvas;
      this.readImgInfo();
  
      console.log(canvas, width, height, dpr)
      // const session = this.session = wx.createVKSession({
      //   track: {
      //     depth: {
      //       mode: 2
      //     }
      //   },                                                                                                                                                                                                                                                    
      //   cameraPosition: 0,
      //   version: 'v1',
      //   gl: this.gl,
      // })
      // session.start(err => {
      //   if (err) {
      //     console.error('VK error', err);
      //     return;
      //   }
      //   session.on('updateAnchors', anchors => {

      //     console.log(anchors);
      //   }
      //   )
      //   session.on('removeAnchors', anchors => {
      //   })
      // })
      const $page = this;
      // 将图表实例绑定到 this 上，可以在其他成员函数（如 dispose）中访问
      chart.on('click', function(params) {
        console.log(params.event.target.id);
        $page.setData({
          selectType: params.event.target.id,
        });
      })
      chart.on('mousedown', function(params) {
        console.log(params);
      });
      chart.on('mousemove', function(params) {
        console.log(params);
      });
      chart.on('mouseup', function(params) {
        console.log(params);
      });
      // 注意这里一定要返回 chart 实例，否则会影响事件处理等
      return chart;
    });
  },

  readImgInfo() {
    const {currentUrl, fileData } = this.data;
    if (!currentUrl) {
      return;
    }
  
    if (fileData[currentUrl.tempFilePath]) {
      this.currentInfo = fileData[currentUrl.tempFilePath];
      this.drawImg();
      return;
    }
      wx.getImageInfo({
        src: currentUrl.tempFilePath,
        success: (res) => {
        console.log(res);
        const widthScale = this.drawInfo.width / res.width;
        const heightScale = this.drawInfo.height / res.height;
        const imgScale = widthScale < heightScale ? widthScale : heightScale;
        this.scale = 1;
          this.currentInfo = {
            x: 0,
            y: 0,
            concentration: '',
            angle: 0,
          rotation: 0,
          img: {
            width:  res.width,
            height: res.height,
            url: currentUrl.tempFilePath,
            imgScale,
            rotation: 0,
            x: 0,
            y: 0,
          },
          line: {
            x1: 0,
            y1: res.height * imgScale * 0.55,
            x2: res.width,
            y2: res.height * imgScale * 0.50,
            rotation: 0,
          },
          ellipse: {
            cx: this.drawInfo.width / 2,
            cy: res.height * imgScale * 0.50,
            rx: 24,
            ry: 20,
          },
        };
        this.drawImg();
      }
    })
  },
  drawImg() {
    const {currentUrl } = this.data;
    if (!currentUrl) {
      return;
    }
    const $page = this;
    console.log($page.currentInfo, $page.drawInfo,  $page.scale);
    const intersections = findIntersection(this.currentInfo.ellipse, this.currentInfo.line);
    console.log(intersections );
      // 获取直线的斜率
      const m1 = (this.currentInfo.line.y2 - this.currentInfo.line.y1) / (this.currentInfo.line.x2 - this.currentInfo.line.x1);
      console.log(intersections );
      let angleResult = 0;
      // 计算夹角的位置
      const tangentArcs = intersections.map((p, index) => {
        const m2 = tangentSlope(this.currentInfo.ellipse, p.x, p.y);
        const angle = calculateAngle(m1, m2);
        if (!angle) {
          angleResult = angle;
        } else {
          angleResult = (angle + angleResult ) / 2;
        }
        const startAngle = calculateAngle(m1, 0);
        const showAngle = (angle * 180 / Math.PI).toFixed(2) + '°';
        if (index === 0) {
      
          return {
            x: p.x,
            y: p.y,
            fontX: p.x + 10,
            fontY: p.y - 20,
            clockwise: false,
            startAngle: startAngle,
            endAngle: -angle,
            angle: angle,
            showAngle: showAngle,
          }
        }
        return {
          x: p.x,
          y: p.y,
          fontX: p.x - 40,
          fontY: p.y - 20,
          clockwise: true,
          startAngle: startAngle + Math.PI,
          endAngle: -angle,
          angle: angle,
          showAngle: showAngle,
        }
      })
      this.currentInfo.angle = angleResult;
    // 更新每个交点的切线斜率与夹角
    const tangentLines = intersections.map((p, index) => {
        const m2 = tangentSlope(this.currentInfo.ellipse, p.x, p.y);
        const angle = calculateAngle(m1, m2);

        console.log(m2, angle, m1, this.currentInfo.ellipse, p);
        // 计算切线终点（假设在一定范围内，比如长度为 3）
        const length = 40;
        if(m2 === Infinity || m2 === -Infinity){
          return {
            x1: p.x,
            y1: p.y,
            x2: p.x,
            y2: p.y - length,
            angle: angle
          }
        }
        let dx = length / Math.sqrt(1 + m2 * m2);
        let dy = m2 * dx;

        if (dy > 0) {
          dx = -dx;
          dy = -dy;
        }
        // 计算切线端点
        const x2_tangent = p.x + dx;
        const y2_tangent = p.y + dy;
        console.log(x2_tangent, y2_tangent);
        return {
            x1: p.x, 
            y1: p.y,
            x2: x2_tangent,
            y2: y2_tangent,
            angle: angle
        };
    });
    console.log(tangentLines);
    const option = {
      useCoarsePointer: true,
      graphic: {
        elements: [
          {
            type: 'group',
            id: 'group',
            x: $page.currentInfo.x,
            y: $page.currentInfo.y,
            scaleX: $page.scale,
            scaleY: $page.scale,
            children: [
              {
                type: 'image',
                id: 'image',
                x: $page.currentInfo.img.x,
                y: $page.currentInfo.img.y,
                rotation: $page.currentInfo.img.rotation,
                style: {
                  image: $page.currentInfo.img.url,
                  width: $page.drawInfo.width ,
                  height: $page.currentInfo.img.height * $page.currentInfo.img.imgScale,
                },
              },
              {
                type: 'line',
                id: 'line',
                x: 0,
                y: 0,
                shape: {
                  x1: $page.currentInfo.line.x1,
                  y1: $page.currentInfo.line.y1,
                  x2: $page.currentInfo.line.x2 ,
                  y2: $page.currentInfo.line.y2,
                },
                style: {
                  lineWidth: 1,
                  stroke: 'red',
                },
              },
              {
                type: 'ellipse',
                id: 'ellipse',
                shape: {
                  rotation: $page.scale,
                  cx: $page.currentInfo.ellipse.cx, // 椭圆中心的 x 坐标
                  cy: $page.currentInfo.ellipse.cy, // 椭圆中心的 y 坐标
                  rx: $page.currentInfo.ellipse.rx, // 椭圆的 x 轴半径
                  ry: $page.currentInfo.ellipse.ry,   // 椭圆的 y 轴半径
                },
                style: {
                  fill: 'transparent', // 填充颜色
                  stroke: 'green',    // 边框颜色
                  lineWidth: 1,       // 边框宽度
                },
              },
            // // 交点标记
            //   {
            //       type: 'scatter',
            //       data: intersectionPoints,
            //       symbolSize: 10,
            //       itemStyle: {
            //           color: 'red'
            //       },
            //       name: '交点'
            //   },
              // 切线的绘制
            ...tangentLines.map(tangent => ({
              type: 'line',
              shape: {
                  x1: tangent.x1,
                  y1: tangent.y1,
                  x2: tangent.x2,
                  y2: tangent.y2
              },
              style: {
                  stroke: 'purple',  // 切线的颜色
                  lineWidth: 1,
                  lineDash: [5, 5]  // 虚线
              },
              name: '切线'
          })),
          // 夹角标记（虚弧线）
          ...tangentArcs.map(tangent => ({
            type: 'arc',
            shape: {
              cx: tangent.x,
              cy: tangent.y,
              clockwise: tangent.clockwise,
                r: 10,
                startAngle: tangent.startAngle,
                endAngle: tangent.endAngle,
            },
            style: {
                stroke: 'green',   // 夹角标记线的颜色
                lineWidth: 1,
                lineDash: [2, 2]   // 虚线
            },
            name: '夹角标记线'
        })),
         // 夹角标记（虚弧线）
         ...tangentArcs.map(tangent => ({
          type: 'text',
          style: {
            fill: 'green',   // 夹角标记线的颜色
            fontSize: 12,
            x: tangent.fontX,
            y: tangent.fontY  ,
            text: `${(tangent.angle * 180 / Math.PI).toFixed(2)}°`, 
          },
      
          name: '内容'
      })),
            ],
          },
        ],
      
      },

    }
    $page.changeValue();

    $page.chart.setOption(option);

  },
  dealEllipse(type){
    console.log(type);
    const {changeNum} = this.data;
    switch(type){
      case 'up':
        this.currentInfo.ellipse.cy = this.currentInfo.ellipse.cy - 1 * changeNum;
        break;
      case 'down':  
        this.currentInfo.ellipse.cy = this.currentInfo.ellipse.cy + 1 * changeNum;
        break;
      case 'left':
        this.currentInfo.ellipse.cx = this.currentInfo.ellipse.cx - 1 * changeNum;
        break;
      case 'right':
        this.currentInfo.ellipse.cx = this.currentInfo.ellipse.cx + 1 * changeNum;
        break;
      case 'horizontal-max':
        this.currentInfo.ellipse.rx = this.currentInfo.ellipse.rx + 1 * changeNum;
        break;
      case 'horizontal-min':
        this.currentInfo.ellipse.rx = this.currentInfo.ellipse.rx - 1 * changeNum;
        break;
      case 'vertical-max':
        this.currentInfo.ellipse.ry = this.currentInfo.ellipse.ry + 1 * changeNum;
        break;
      case 'vertical-min':
        this.currentInfo.ellipse.ry = this.currentInfo.ellipse.ry - 1 * changeNum;
        break;
    }
    this.drawImg();
  },
  dealLine(type){
    console.log(type);
    const {changeNum} = this.data;
    switch(type){
      case 'up':
        this.currentInfo.line.y1 = this.currentInfo.line.y1 - 1 * changeNum;
        this.currentInfo.line.y2 = this.currentInfo.line.y2 - 1 * changeNum;
        break;
      case 'down':  
        this.currentInfo.line.y1 = this.currentInfo.line.y1 + 1 * changeNum;
        this.currentInfo.line.y2 = this.currentInfo.line.y2 + 1 * changeNum;
        break;
    }
  
    this.drawImg();
  },
  dealBox(type){
    console.log(type);
    const {changeNum} = this.data;
    switch(type){
      case 'up':
        this.currentInfo.y = this.currentInfo.y - 1 * changeNum;
        break;
      case 'down':
        this.currentInfo.y = this.currentInfo.y + 1 * changeNum ;
        break;
      case 'left':
        this.currentInfo.x = this.currentInfo.x - 1 * changeNum;
        break;
      case 'right':
        this.currentInfo.x = this.currentInfo.x + 1 * changeNum;
        break;
      case 'min':
        this.scale = this.scale - 0.1 * (changeNum > 1 ? 2 : changeNum);
        break;
      case 'max':
        this.scale = this.scale + 0.1 * (changeNum > 1 ? 2 : changeNum);
        break;
  
      default:
        break;
    }
    console.log(this.currentInfo.x, this.currentInfo.y, this.scale);
    this.chart.setOption({
      graphic: [
        {
          id: 'group',
          scaleX: this.scale,
          scaleY: this.scale,
          x: this.currentInfo.x,
          y: this.currentInfo.y,
        }
      ]
    });
    // this.drawImg();
  },

  handleSelectType(e){
    const {type} = e.currentTarget.dataset;
    const {selectType} = this.data;
    switch(selectType){ 
      case 'ellipse':
        this.dealEllipse(type);
        break;
      case 'image':
        break;
      case 'line':
        this.dealLine(type);
        break;
      default:
        this.dealBox(type);
        break;
    }
  },
  handleSelectNum(e){
    const {type} = e.currentTarget.dataset;
    this.setData({
      changeNum: type,
    })
  },

  handleChangeConcentration(){
    const $page = this;
    wx.navigateTo({
      url: '/pages/write/index',
      events: {
        // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
        change: function(data) {
          console.log(data)
          $page.changeConcentration(data.value)
        },
      },
      routerType: 'wx://zoom',
    });
  },
  handlePrev(){
    const {selectedIndex, files} = this.data;
    if (selectedIndex === 0) {
      return;
    }
    this.setData({
      selectedIndex: selectedIndex - 1,
      currentUrl: files[selectedIndex - 1],
    });
    this.readImgInfo();
    this.drawImg();
  },
  handleNext(){
    const {selectedIndex, files} = this.data;
    if (selectedIndex === files.length - 1) {
      return;
    }
    this.setData({
      selectedIndex: selectedIndex + 1,
      currentUrl: files[selectedIndex + 1],
    });
    this.readImgInfo();
    this.drawImg();
  },
  handleFinish() {
    const { fileData } = this.data;
    if (Object.keys(fileData).length !== store.files.length || Object.keys(fileData).some(key => {
      return !fileData[key].concentration || !fileData[key].angle;
    })) {
      wx.showToast({
        title: '请完成所有图片的标注',
        icon: 'none',
      })
      return;
    }
    store.setFilesData(fileData);

    wx.navigateTo({
      url: '/pages/chart/index',
    });
  },
  changeConcentration(value: string){
    console.log(value);
    this.currentInfo.concentration = value;
    this.changeValue();
  },
  changeValue () {
    const {currentUrl} = this.data;
    console.log(currentUrl);
    if (!currentUrl) {
      return;
    }
    store.setFilesData({
      [currentUrl.tempFilePath]: this.currentInfo,
    });
    console.log(store.filesData);
    this.setData({
      fileData: store.filesData,
    })
  },
  handleClear(e){
    const {index, src} = e.currentTarget.dataset;
    wx.showModal({
      title: '提示',
      content: '确定要删除吗？',
      success: (res) => {
        if (res.confirm) {
          store.removeFile(src);
          this.setData({
            files: store.files,
            fileData: store.filesData,
          });
          const { selectedIndex } = this.data;
          if (selectedIndex === index) {
            this.setData({
              selectedIndex: 0,
              currentUrl: store.files[0] || null,
            })
            this.readImgInfo();
            this.drawImg();
          }
        }
      }
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.setData({
      files: store.files || [],
      currentUrl: store.files[0] || null,
      fileData: store.filesData || {},
      selectedIndex: 0,
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
    this.drawCom = this.selectComponent('#draw-com');
    this.initChart();
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