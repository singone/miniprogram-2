
import store from "../../store/index"
import { behavior as computedBehavior  } from '../../utils/miniprogram-computed';
import * as echarts from '../../components/ec-canvas/echarts.min.js';
import { ELLIPSE_ID, getDrawerData, LINE_ID, GROUP_ID, IMAGE_ID, getAngle, getWidth, RECT_ID, transformAngleToRadian, transformAngle } from "./utils";
import Touch from '../../utils/touch';

console.log(computedBehavior);
Page({
  behaviors: [computedBehavior],
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
    isTest: false,
    angle: '',
    concentration: '',
    showTest: false,
    actions: [
      {
        name: '从相册中选择',
        value: 'photo',
      },
      {
        name: '从聊天中选择',
        value: 'chat',
      },
    ],
    sliderType: '',
    sliderValue: 10,
    defaultSliderValue: 10,
    sliderMax: 100,
    sliderMin: 0,
    sliderStep: 1,
  },
  computed: {
    sliderList(data: {sliderMax: number, sliderMin: number, sliderStep: number}) {
      const {sliderMax, sliderMin, sliderStep} = data;
      console.log(sliderMax, sliderMin, sliderStep);
      return Array.from({length: (data.sliderMax - data.sliderMin) / data.sliderStep}).map((item, index) => index * data.sliderStep + data.sliderMin);
    }
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
    originX: 0,
    originY: 0,
    maxWidth: 0,
    maxHeight: 0,
    rotation: 0,
    concentration: '',
    angle: 0,
    selectType: '',
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
  defaultValue: {
    x: 0,
    y: 0,
    rotation: 0,
    cx: 0,
    cy: 0,
    rx: 0,
    ry: 0,
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
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
      let moveId: string | null = null;
      let startX = 0;
      let startY = 0;
      new Touch(this, 'touch', {
        tap: (e) => {
          console.log(e, 'tap');
        },
        rotate: (e) => {
          if (!moveId) {
            return;
          }
          console.log(e.angle, transformAngleToRadian(e.angle), 'angle');
          // $page.currentInfo.img.rotation = e.angle + $page.currentInfo.img.rotation;
          // $page.drawImg();
        },
        multipointStart: (e) => {
          console.log(e, 'multipointStart');
          startX = e.centerX;
          startY = e.centerY;
        },
        multipointEnd: (e) => {
          console.log(e, 'multipointEnd');
        },
        pinch: (e) => {
          console.log(e.singleZoom, 'zoom');
          $page.scale = e.zoom;
        
          const deltaX = e.centerX - startX;
          const deltaY = e.centerY - startY;
          $page.currentInfo.x = $page.currentInfo.x + deltaX;
          $page.currentInfo.y = $page.currentInfo.y + deltaY;
          $page.currentInfo.originX = e.centerX;
          $page.currentInfo.originY = e.centerY;
          startX = e.centerX;
          startY = e.centerY;
          $page.chart.setOption({
            graphic: [
              {
                id: 'group',
                scaleX: $page.scale,
                scaleY: $page.scale,
                originX: $page.currentInfo.originX,
                originY: $page.currentInfo.originY,
                x: $page.currentInfo.x ,
                y: $page.currentInfo.y,
              }
            ]
          });
        },
        pressMove: (e) => {
          if (moveId === RECT_ID + '_close') {
            return;
          }
          console.log(moveId, e.deltaX, e.deltaY);

          if (this.currentInfo.selectType === 'line') {
            if (moveId === RECT_ID + '_rotate_left') {
              this.currentInfo.line.x1 = this.currentInfo.line.x1 + e.deltaX;
              this.currentInfo.line.y1 = this.currentInfo.line.y1 + e.deltaY;
            } else if (moveId === RECT_ID + '_rotate_right') {
              this.currentInfo.line.x2 = this.currentInfo.line.x2 + e.deltaX;
              this.currentInfo.line.y2 = this.currentInfo.line.y2 + e.deltaY;
            } else  {
              this.currentInfo.line.x1 = this.currentInfo.line.x1 + e.deltaX;
              this.currentInfo.line.y1 = this.currentInfo.line.y1 + e.deltaY;
              this.currentInfo.line.x2 = this.currentInfo.line.x2 + e.deltaX;
              this.currentInfo.line.y2 = this.currentInfo.line.y2 + e.deltaY;
            }
            this.drawImg();
            return;
          }
          if (this.currentInfo.selectType === 'ellipse') {
            if (moveId === RECT_ID + '_rect') {
              this.currentInfo.ellipse.cx = this.currentInfo.ellipse.cx + e.deltaX;
              this.currentInfo.ellipse.cy = this.currentInfo.ellipse.cy + e.deltaY;
            } else if (moveId === RECT_ID + '_rotate') {
              this.currentInfo.ellipse.cx = this.currentInfo.ellipse.cx + e.deltaX / 2;
              this.currentInfo.ellipse.cy = this.currentInfo.ellipse.cy + e.deltaY / 2;
              this.currentInfo.ellipse.rx = this.currentInfo.ellipse.rx + e.deltaX / 2;
              this.currentInfo.ellipse.ry = this.currentInfo.ellipse.ry + e.deltaY / 2;
            }
            this.drawImg();
            return;
          }
          if (this.currentInfo.selectType === 'image') {
            if (this.currentInfo.x < this.currentInfo.maxWidth && this.currentInfo.x > -this.currentInfo.maxWidth) {
              this.currentInfo.x = this.currentInfo.x + e.deltaX;
            }
            if (this.currentInfo.y < this.currentInfo.maxHeight && this.currentInfo.y > -this.currentInfo.maxHeight) {
              this.currentInfo.y = this.currentInfo.y + e.deltaY;
            }
      
            this.drawImg();
            return;
          }
          console.log(e, moveId);
        },
        
      });
      this.chart = chart;
      console.log(dpr, width, height)
      this.drawInfo = {
        width,
        height,
        dpr : dpr || 1,
      }
      this.scale = 1;
      this.canvas = canvas;
      this.readImgInfo();
  
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
        const targetId = params.event.target.id;
        if (targetId === RECT_ID + '_close' || !targetId) {
          $page.currentInfo.selectType = '';
          $page.setData({
            selectType: '',
          })
          $page.drawImg();
          return;
        }
        if (targetId.includes('ellipse')) {
          $page.currentInfo.selectType = 'ellipse';
          $page.setData({
            selectType: 'ellipse',
          })
          $page.initSlider();
          $page.drawImg();
          return;
        }
        if (targetId.includes('line')) {
          $page.currentInfo.selectType = 'line';
          $page.setData({
            selectType: 'line',
          })
          $page.initSlider();
          $page.drawImg();
          return;
        }
        if (targetId.includes('image')) {
          $page.currentInfo.selectType = 'image';
          $page.setData({
            selectType: 'image',
          }) 
          $page.initSlider();
          $page.drawImg();
          return;
        }
      })

      chart.on('mousedown', function(params) {
        moveId = params.event.target.id;
        console.log(moveId);
    
        $page.touch.start(params.event.which);
      });
      chart.on('mousemove', function(params) {
        $page.touch.move(params.event.which);
      });
      chart.on('mouseup', function(params) {
        $page.touch.end(params.event.which);
        moveId = null;

        // console.log(params);
      });
      // 注意这里一定要返回 chart 实例，否则会影响事件处理等
      return chart;
    });
  },

  readImgInfo() {
    const {currentUrl, fileData, isTest } = this.data;
    if (!currentUrl) {
      return;
    }
  
    console.log(fileData);
    if (!isTest && fileData[currentUrl.tempFilePath]) {
      this.currentInfo = fileData[currentUrl.tempFilePath];
      const getImgSize = (img) => {

        let imgWidth = this.drawInfo.width;
        let imgHeight = img.height * this.drawInfo.width / img.width;
        if (imgHeight > this.drawInfo.height) {
          imgHeight = this.drawInfo.height;
          imgWidth = img.width * this.drawInfo.height / img.height;
        }
        return  {
          showWidth: imgWidth,
          showHeight: imgHeight,
        };
      }
      this.currentInfo.img = {
        ...this.currentInfo.img,
        ...getImgSize(this.currentInfo.img),
      };
      this.currentInfo.line = {
        ...this.currentInfo.line,
        x1: 10,
        x2: this.drawInfo.width - 20,
      };
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
        
        let imgWidth = this.drawInfo.width;
        let imgHeight = res.height * widthScale;
        if (imgHeight > this.drawInfo.height) {
          imgHeight = this.drawInfo.height;
          imgWidth = res.width * heightScale;
        }
          this.currentInfo = {
            selectType: '',
            x: 0,
            y: 0,
            concentration: '',
            angle: 0,
          rotation: 0,
          originX: imgWidth / 2,
          originY: imgHeight / 2,
          maxWidth: imgWidth,
          maxHeight: imgHeight,
          img: {
            showWidth:  imgWidth,
            showHeight: imgHeight,
            width: res.width,
            height: res.height,
            url: currentUrl.tempFilePath,
            imgScale,
            rotation: 0,
            x: 0,
            y: 0,
          },
          line: {
            x1: 10,
            y1: res.height * imgScale * 0.55,
            x2: this.drawInfo.width - 20,
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
    const {option, angle} = getDrawerData($page.currentInfo, $page.drawInfo,  $page.scale);
    $page.currentInfo.angle = angle;
    this.setData({
      angle: transformAngle(angle),
    })
    $page.changeValue();
    $page.chart.setOption(option);

  },
  handleSlider(e){
    this.setData({
      sliderValue: e.detail,
    });
    this.dealSlider();
  },
  handleReset(){
    this.setData({
      sliderValue: this.data.defaultSliderValue,
    });
    this.dealSlider();
  },
  timer: null,
  handleScrollSlider(e){
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      console.log(e);
    }, 100);
  },
  dealSlider(){
    const {sliderType} = this.data;
    switch(sliderType){
      case 'horizontal-move':
        this.dealMoveHorizontal();
        break;
      case 'vertical-move':
        this.dealMoveVertical();
        break;
      case 'rotate':
        this.dealRotate();
        break;
      case 'horizontal-scale':
        this.dealScaleHorizontal();
        break;
      case 'vertical-scale':
        this.dealScaleVertical();
        break;
      default:
        break;
    }
  },
  dealMoveHorizontal(){
    const {sliderValue, selectType, defaultSliderValue} = this.data;
    const changeNum = sliderValue - defaultSliderValue;
    switch(selectType){
      case 'line':
        this.currentInfo.line.x1 = this.defaultValue.x1 + 1 * changeNum;
        this.currentInfo.line.x2 = this.defaultValue.x2 + 1 * changeNum;
        break;
      case 'ellipse':
        this.currentInfo.ellipse.cx = this.defaultValue.cx + 1 * changeNum;
        break;
      case 'image':
        this.currentInfo.x = this.defaultValue.x + 1 * changeNum;
        break;
      default:
        this.currentInfo.x = this.defaultValue.x + 1 * changeNum;

        break;
    }
    this.drawImg();
  },
  dealMoveVertical(){
    const {sliderValue, selectType, defaultSliderValue} = this.data;
    const changeNum = sliderValue - defaultSliderValue;
    switch(selectType){
      case 'line':
        this.currentInfo.line.y1 = this.defaultValue.y1 + 1 * changeNum;
        this.currentInfo.line.y2 = this.defaultValue.y2 + 1 * changeNum;
        break;
      case 'ellipse':
        this.currentInfo.ellipse.cy = this.defaultValue.cy + 1 * changeNum;
        break;
      default:
        this.currentInfo.y = this.defaultValue.y + 1 * changeNum;
        break;
    }
    this.drawImg();
  },
  dealRotate(){
    const {sliderValue, selectType, defaultSliderValue} = this.data;
    const changeNum = sliderValue - defaultSliderValue;
    const rotation = (this.defaultValue.rotation + 1 * changeNum) * Math.PI / 180;

    switch(selectType){
      case 'line':
        console.log(rotation, this.defaultValue.width, Math.cos(rotation), Math.sin(rotation));
        this.currentInfo.line.x1 = this.defaultValue.x - Math.cos(rotation) * this.defaultValue.width / 2;
        this.currentInfo.line.y1 = this.defaultValue.y - Math.sin(rotation) * this.defaultValue.width / 2;
        this.currentInfo.line.x2 = this.defaultValue.x + Math.cos(rotation) * this.defaultValue.width / 2;
        this.currentInfo.line.y2 = this.defaultValue.y + Math.sin(rotation) * this.defaultValue.width / 2;
        console.log(this.currentInfo.line);
        break;
      case 'ellipse':
        this.currentInfo.ellipse.rotation = (this.defaultValue.rotation + 1 * changeNum) * Math.PI / 180;
        break;
      default:
        this.currentInfo.img.rotation = (this.defaultValue.rotation + 1 * changeNum) * Math.PI / 180;
        break;
    }
    this.drawImg();
  },
  dealScaleHorizontal(){
    const {sliderValue, selectType, defaultSliderValue} = this.data;
    const changeNum = sliderValue - defaultSliderValue;
    console.log(changeNum, selectType);
    switch(selectType){
      case 'line':
        this.currentInfo.line.width = this.defaultValue.width + 1 * changeNum;
        break;
      case 'ellipse':
        this.currentInfo.ellipse.rx = this.defaultValue.rx + 1 * changeNum;
        break;
      default:
        this.currentInfo.x = this.defaultValue.x + 1 * changeNum;
        break;
    }
    this.drawImg();
  },
  dealScaleVertical(){
    const {sliderValue, selectType, defaultSliderValue} = this.data;
    const changeNum = sliderValue - defaultSliderValue;
    switch(selectType){
      case 'line':
        this.currentInfo.line.height = this.currentInfo.line.height + 1 * changeNum;
        break;
      case 'ellipse':
        this.currentInfo.ellipse.ry = this.currentInfo.ellipse.ry + 1 * changeNum;
        break;
      default:
        this.scale = this.defaultValue.scale + changeNum;
        break;
    } 
    this.drawImg();
  },

  handleSelectType(e){
    const {type} = e.currentTarget.dataset;
  
    this.setData({
      sliderType: type,
    });
    this.initSlider();
  },
  initSlider(){
    const {sliderType} = this.data;
    switch(sliderType){
      case 'horizontal-move':
        this.sliderInitHorizontalMove();
        break;
      case 'vertical-move':
        this.sliderInitVerticalMove();
        break;
      case 'rotate':
        this.sliderInitRotate();
        break;
      case 'horizontal-scale':
        this.sliderInitHorizontalScale();
        break;
      case 'vertical-scale':
        this.sliderInitVerticalScale();
        break;
      default:
        break;
    }
  },
  sliderInitHorizontalMove(){
    const { selectType } = this.data;
    let defaultSliderValue = 1;
    let sliderStep = 1;
    let sliderMax = this.currentInfo.maxWidth;
    let sliderMin = -this.currentInfo.maxWidth;
    switch(selectType){
      case 'line':
        this.defaultValue = {
          x1: this.currentInfo.line.x1,
          x2: this.currentInfo.line.x2,
        };
        defaultSliderValue = Math.round((this.currentInfo.line.x2 - this.currentInfo.line.x1) / 2);
        break;
      case 'ellipse':
        this.defaultValue = {
          cx: this.currentInfo.ellipse.cx,
          cy: this.currentInfo.ellipse.cy,
        };
        defaultSliderValue = this.currentInfo.ellipse.cx;
        break;
      default:
        this.defaultValue = {
          x: this.currentInfo.x,
          y: this.currentInfo.y,
        };
        defaultSliderValue = this.currentInfo.x;
        break;
    }
    this.setData({
      sliderStep,
      defaultSliderValue,
      sliderMax,
      sliderMin,
      
      sliderValue: defaultSliderValue,
    });
  },
  sliderInitVerticalMove(){
    const { selectType } = this.data;
    let defaultSliderValue = 1;
    let sliderStep = 1;
    let sliderMax = this.currentInfo.maxHeight;
    let sliderMin = -this.currentInfo.maxHeight;
    switch(selectType){
      case 'line':  
        this.defaultValue = {
          y1: this.currentInfo.line.y1,
          y2: this.currentInfo.line.y2,
        };
        defaultSliderValue = Math.round((this.currentInfo.line.y2 - this.currentInfo.line.y1) / 2);
        break;
      case 'ellipse':
        this.defaultValue = {
          cy: this.currentInfo.ellipse.cy,
          ry: this.currentInfo.ellipse.ry,
        };
        defaultSliderValue = Math.round(this.currentInfo.ellipse.cy);
        break;
      default:
        this.defaultValue = {
          x: this.currentInfo.x,
          y: this.currentInfo.y,
        };
        defaultSliderValue = Math.round(this.currentInfo.y);
        break;

    }
    this.setData({
      sliderStep,
      defaultSliderValue,
      sliderMax,
      sliderMin,
      sliderValue: defaultSliderValue,
    }); 
  },
  sliderInitRotate(){
    let defaultSliderValue = 0;
 
    const { selectType } = this.data;
    switch(selectType){
      case 'line':
        console.log(this.currentInfo.line);
        defaultSliderValue = Math.round(transformAngle(getAngle(this.currentInfo.line.x1, this.currentInfo.line.y1, this.currentInfo.line.x2, this.currentInfo.line.y2)));
        this.defaultValue = {
          rotation: defaultSliderValue,
          x1: this.currentInfo.line.x1,
          width: getWidth(this.currentInfo.line.x1, this.currentInfo.line.y1, this.currentInfo.line.x2, this.currentInfo.line.y2),
          x2: this.currentInfo.line.x2,
          y1: this.currentInfo.line.y1,
          y2: this.currentInfo.line.y2,
          x: (this.currentInfo.line.x1 + this.currentInfo.line.x2) / 2,
          y: (this.currentInfo.line.y1 + this.currentInfo.line.y2) / 2,
        };
        break;
      default:
        defaultSliderValue = Math.round(transformAngle(this.currentInfo.img.rotation));

        this.defaultValue = {
          rotation: defaultSliderValue,
        };
        break;
    }
    this.setData({
      sliderStep: 1,
      defaultSliderValue,
      sliderMax: 90,
      sliderMin: -90,
      sliderValue: 0,
    });
  },
  sliderInitHorizontalScale(){
    const { selectType } = this.data;
    let defaultSliderValue = 1;
    let sliderStep = 0.1;
    let sliderMax = 10;
    let sliderMin = 0;
    switch(selectType){
      case 'line':
        this.defaultValue = {
          width: this.currentInfo.line.width,
        };
        break;
      case 'ellipse':
        this.defaultValue = {
          rx: this.currentInfo.ellipse.rx,
        };
        console.log(this.currentInfo.ellipse, this.drawInfo.width);
        defaultSliderValue = Math.round(this.currentInfo.ellipse.rx);
        sliderMax = 100;
        sliderMin = 0;
        sliderStep = 1;
        break;
    }
    this.setData({
      sliderStep,
      defaultSliderValue,
      sliderMax,
      sliderMin,
      sliderValue: defaultSliderValue,
    });
  },
  sliderInitVerticalScale(){
    const { selectType } = this.data;
    let defaultSliderValue = 1;
    let sliderStep = 0.1;
    let sliderMax = 10;
    let sliderMin = 0;
    switch(selectType){
      case 'line':
        this.defaultValue = {
          width: this.currentInfo.line.width,
        };
        break;
      case 'ellipse':
        this.defaultValue = {
          ry: this.currentInfo.ellipse.ry,
        };
        defaultSliderValue = Math.round(this.currentInfo.ellipse.ry);
        sliderMax = 100;
        sliderMin = 0;
        sliderStep = 1;
        break;
      default:
        this.defaultValue = {
          scale: this.scale,
        };
        sliderMax = 10;
        sliderMin = 0;
        sliderStep = 0.1;
        defaultSliderValue = Math.round(this.scale * 10) / 10;
        break;
    }
    this.setData({
      sliderStep,
      defaultSliderValue,
      sliderMax,
      sliderMin,
      sliderValue: defaultSliderValue,
    });
  },
  handleChangeConcentration(){
    const $page = this;
    wx.navigateTo({
      url: `/pages/write/index?defaultValue=${$page.currentInfo.concentration || ''}`,
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
      selectType: '',
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
      selectType: '',
      selectedIndex: selectedIndex + 1,
      currentUrl: files[selectedIndex + 1],
    });
    this.readImgInfo();
    this.drawImg();
  },
  handleFinish() {
    const { fileData } = this.data;
    console.log(fileData);
    if (Object.keys(fileData).some(key => {
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
  changeValue (force?: boolean) {
    const {currentUrl, fileData, isTest, linear} = this.data;
    if (!currentUrl) {
      return;
    }
    if (isTest) {
      if (linear) {
        const angle = this.currentInfo.angle * 180 / Math.PI;
        const concentration = (angle - linear.parameter.intercept) / linear.parameter.gradient;
        this.setData({
          angle: Math.round(angle * 100) / 100,
          concentration: Math.round(concentration * 100) / 100,
        });
      }
      return;
    }
    if (force) {
      store.setFilesData({
        [currentUrl.tempFilePath]: this.currentInfo,
      });
    }

    this.setData({
      fileData: {
        ...fileData,
        [currentUrl.tempFilePath]: this.currentInfo,
      },
    })
  },
  handleBack() {
    wx.navigateBack({
      delta: 1,
    })
  },
  handleTest(){
    this.setData({
      showTest: true,
    })
  },
  handleCancel(){
    this.setData({
      showTest: false,
    })
  },
  handleAdd(){
    this.setData({
      showTest: true,
    })
  },
  handleSelectPhoto(e){
    const {value} = e.detail;
    const { isTest } = this.data;
    console.log(value);
    if (e.detail.value === 'photo') {
      wx.chooseMedia({
        count: isTest ? 1 : 10,
        mediaType: ['image'],
        sourceType: ['album'],
        success: (res) => {
          if (isTest) {
            this.goToTest(res.tempFiles[0]);
          } else {
            this.addFile(res.tempFiles);
          }
        },
      })
      return;
    } 
    if (e.detail.value === 'chat') {
      wx.chooseMessageFile({
        count: isTest ? 1 : 10,
        type: 'image',
        success: (res) => {
          if (isTest) {
            this.goToTest({
              tempFilePath: res.tempFiles[0].path,
              duration: 0,
              height: 0,
              width: 0,
              thumbTempFilePath: '',
              size: res.tempFiles[0].size || 0,
            });
          } else {
            this.addFile(res.tempFiles.map(item => ({
              ...item,
              tempFilePath: item.path,
              duration: 0,
              height: 0,
              width: 0,
              thumbTempFilePath: '',
              size: item.size || 0,
            }) as WechatMiniprogram.MediaFile));
          }
        },
      });
    }
  },
  goToTest(file: WechatMiniprogram.MediaFile) {
    this.setData({
      currentUrl: file,
      showTest: false,
    })
    this.readImgInfo();
    this.drawImg();
  },
  addFile(files: WechatMiniprogram.MediaFile[]){
    store.addFile(files);
    this.setData({
      files: store.files,
      fileData: store.filesData,
    });
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
  onLoad(options) {
    console.log(options);
    if (options.test) {
      this.setData({
        isTest: true,
        files: [],
        fileData: {},
        linear: store.testInfo.linear,
        currentUrl: store.testInfo.file || null,
      });
      return;
    }
    this.setData({
      files: store.files || [],
      currentUrl: store.files[0] || null,
      fileData: store.filesData || {},
      selectedIndex: 0,
      isTest: false,
    });
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