export const checkTap = () => {

}

export const GROUP_ID = 'group';
export const IMAGE_ID = 'image';
export const LINE_ID = 'line';
export const ELLIPSE_ID = 'ellipse';
export const TANGENT_LINE_ID = 'tangent_line';
export const TANGENT_ARC_ID = 'tangent_arc';
export const TANGENT_TEXT_ID = 'tangent_text';
export const RECT_ID = 'rect';
export const transformAngle = (angle: number) => {
  return Math.round(angle * 180 / Math.PI * 100) / 100;
}
export const getWidth = (x1: number, y1: number, x2: number, y2: number) => {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}
export const transformAngleToRadian = (angle: number) => {
  return angle * Math.PI / 180;
}
export const getLineSlope = (x1: number, y1: number, x2: number, y2: number) => {
  if (x1 === x2) {
    return Infinity;
  }
  return (y2 - y1) / (x2 - x1);
}
export const getAngle = (x1: number, y1: number, x2: number, y2: number) => {
  if (x1 === x2) {
    return 0;
  }
  if (y1 === y2) {
    return Math.PI / 2;
  }
  const k = (y2 - y1) / (x2 - x1);
  return Math.atan(k);
}
// 计算直线和椭圆的交点
// line ax + by + c = 0
export function findIntersection(ellipse, line) {
    const { cx, cy, rx, ry} = ellipse;
    const { x1, y1, x2, y2} = line;
  // 计算直线斜率和截距
  let k, b;
  if (x1 === x2) {
      // 垂直线，斜率无穷大
      k = Infinity;
      b = x1; // 垂直线方程为 x = x1
  } else {
      k = (y2 - y1) / (x2 - x1); // 斜率
      b = y1 - k * x1; // 截距
  }

  // 椭圆方程: ((x - cx)^2  / rx^2) + ((y - cy)^2 / ry^2) = 1
  // 直线方程: y = kx + b 或 x = b (垂直线)

  let intersections = [];

  if (k === Infinity) {
      // 垂直线，x = b
      const x = b;
      const term = (1 - ((x - cx) ** 2) / (rx ** 2)) * (ry ** 2);
      if (term < 0) {
          return []; // 无交点
      }
      const y1_ellipse = cy + Math.sqrt(term);
      const y2_ellipse = cy - Math.sqrt(term);

      // 检查 y 是否在直线段内
      if (y1_ellipse >= Math.min(y1, y2) && y1_ellipse <= Math.max(y1, y2)) {
          intersections.push({ x: x, y: y1_ellipse });
      }
      if (y2_ellipse >= Math.min(y1, y2) && y2_ellipse <= Math.max(y1, y2)) {
          intersections.push({ x: x, y: y2_ellipse });
      }
  } else {
      // 一般直线，y = kx + b
      // 将直线方程代入椭圆方程，解二次方程
      const A = (1 / (rx ** 2)) + ((k ** 2) / (ry ** 2));
      const B = (-2 * cx / (rx ** 2)) + ((2 * k * (b - cy)) / (ry ** 2));
      const C = ((cx ** 2) / (rx ** 2)) + (((b - cy) ** 2) / (ry ** 2)) - 1;

      const discriminant = B ** 2 - 4 * A * C;

      if (discriminant < 0) {
          return []; // 无交点
      }

      const sqrtDiscriminant = Math.sqrt(discriminant);
      const x1_intersection = (-B + sqrtDiscriminant) / (2 * A);
      const x2_intersection = (-B - sqrtDiscriminant) / (2 * A);

      // 计算对应的 y 值
      const y1_intersection = k * x1_intersection + b;
      const y2_intersection = k * x2_intersection + b;

      // 检查交点是否在直线段内
      if (x1_intersection >= Math.min(x1, x2) && x1_intersection <= Math.max(x1, x2)) {
          intersections.push({ x: x1_intersection, y: y1_intersection });
      }
      if (x2_intersection >= Math.min(x1, x2) && x2_intersection <= Math.max(x1, x2)) {
          intersections.push({ x: x2_intersection, y: y2_intersection });
      }
  }

  return intersections.sort((a, b) => b.x - a.x);
}


// 计算切线斜率
export function tangentSlope(ellipse, x, y) {
    const { cx, cy, rx, ry} = ellipse;
    // 检查点是否在椭圆上
    const ellipseEquation = ((x - cx) ** 2) / (rx ** 2) + ((y - cy) ** 2) / (ry ** 2);
    if (Math.abs(ellipseEquation - 1) > 1e-6) {
        throw new Error("点不在椭圆上");
    }

    // 计算斜率
    const slope = -((x - cx) * (ry ** 2)) / ((y - cy) * (rx ** 2));
    return slope;
}


// 计算夹角
export function calculateAngle(m1, m2) {
    // 处理垂直线
    if (m1 === Infinity || m1 === -Infinity) {
        if (m2 === 0) {
            return Math.PI / 2; // 垂直线与水平线的夹角为 90 度
        } else {
            return Math.atan(Math.abs(1 / m2));
        }
    }
    if (m2 === Infinity || m2 === -Infinity) {
        if (m1 === 0) {
            return Math.PI / 2; // 垂直线与水平线的夹角为 90 度
        } else {
            return Math.atan(Math.abs(1 / m1));
        }
    }

    // 正常情况
    if (m1 * m2 === -1) {
        return Math.PI / 2; // 垂直，夹角为 90 度
    }

    const tanTheta = (m2 - m1) / (1 + m1 * m2);
    const thetaRadians = Math.atan(tanTheta);
    const thetaDegrees = (thetaRadians);

    return thetaDegrees;
}

export function getDrawerData(currentInfo, drawInfo, scale) {
  const selectedColor = '#ee0a24';
  const normalColor = '#909399';
    const intersections = findIntersection(currentInfo.ellipse, currentInfo.line);
      // 获取直线的斜率
        const m1 = getLineSlope(currentInfo.line.x1, currentInfo.line.y1, currentInfo.line.x2, currentInfo.line.y2);
      let angleResult = 0;

      // 计算夹角的位置
      const tangentArcs = [0, 1].map((index) => {
        const p = intersections[index];
        if (!p) {
          return {
            invisible: true,
          }
        }
        const m2 = tangentSlope(currentInfo.ellipse, p.x, p.y);
        let angle = calculateAngle(m1, m2);
        let isClockwise = true;
        if (angle < 0) {
          if (p.x < currentInfo.ellipse.cx) {
            angle = -angle;
          } else {
            angle = Math.PI + angle;
          }
          isClockwise = false;

        } else {
          if (p.x < currentInfo.ellipse.cx) {
            angle = Math.PI - angle;
          }
          isClockwise = true;
        }
        if (!angleResult) {
          angleResult = angle;
        } else {
          angleResult = (angle + angleResult ) / 2;
        }
        const startAngle = calculateAngle(m1, 0);
        const showAngle = transformAngle(angle) + '°';
        if (index === 0) {
      
          return {
            x: p.x,
            y: p.y,
            fontX: p.x + 10,
            fontY: p.y - 20,
            clockwise: true,
            startAngle: startAngle + Math.PI,
            endAngle: angle + Math.PI,
            angle: angle,
            showAngle: showAngle,
          }
        }
        return {
          x: p.x,
          y: p.y,
          fontX: p.x - 5 ,
          fontY: p.y - 25,
          clockwise: false,
          startAngle: startAngle,
          endAngle: -angle,
          angle: angle,
          showAngle: showAngle,
        }
      })
    // 更新每个交点的切线斜率与夹角
    const tangentLines = [0, 1].map((index) => {
        const p = intersections[index];
        if (!p) {
          return {
            invisible: true,
          }
        }
        const m2 = tangentSlope(currentInfo.ellipse, p.x, p.y);
        const angle = calculateAngle(m1, m2);

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
        return {
            x1: p.x, 
            y1: p.y,
            x2: x2_tangent,
            y2: y2_tangent,
            angle: angle
        };
    });
    let tools = {}
    if (currentInfo.selectType === 'ellipse') {
      tools = {
        x: currentInfo.ellipse.cx - currentInfo.ellipse.rx,
        y: currentInfo.ellipse.cy - currentInfo.ellipse.ry,
        width: currentInfo.ellipse.rx * 2,
        height: currentInfo.ellipse.ry * 2,
      };
    } else if (currentInfo.selectType === 'line') {
      tools = {
        x: 0,
        y: 0,
        width: Math.min(drawInfo.width - 10, Math.max(Math.abs(currentInfo.line.x2 - currentInfo.line.x1), 20)),
      };
    }
    const option = {
      useCoarsePointer: true,
      backgroundColor: 'transparent',
      graphic: {
        elements: [
          {
            type: 'group',
            id: GROUP_ID,
            x: currentInfo.x,
            y: currentInfo.y,
            scaleX: scale,
            scaleY: scale,
            originX: currentInfo.originX,
            originY: currentInfo.originY,
            children: [
              {
                type: 'image',
                id: IMAGE_ID,
                x: currentInfo.img.x,
                y: currentInfo.img.y,
                originX: currentInfo.img.showWidth / 2,
                originY: currentInfo.img.showHeight / 2,
                rotation: currentInfo.img.rotation,
                style: {  
                  image: currentInfo.img.url,
                  width: currentInfo.img.showWidth ,
                  height: currentInfo.img.showHeight,
                },
              },
              {
                type: 'line',
                id: LINE_ID,
                x: 0,
                y: 0,
                shape: {
                  x1: currentInfo.line.x1,
                  y1: currentInfo.line.y1,
                  x2: currentInfo.line.x2 ,
                  y2: currentInfo.line.y2,
                },
                style: {
                  lineWidth: 1,
                  stroke: '#3173FA',
                },
              },
              {
                type: 'ellipse',
                id: ELLIPSE_ID,
                x: currentInfo.ellipse.cx - currentInfo.ellipse.rx,
                y: currentInfo.ellipse.cy - currentInfo.ellipse.ry,
                originX: currentInfo.ellipse.rx,
                originY: currentInfo.ellipse.ry,
                shape: {
                  cx: currentInfo.ellipse.rx, // 椭圆中心的 x 坐标
                  cy: currentInfo.ellipse.ry, // 椭圆中心的 y 坐标
                  rx: currentInfo.ellipse.rx, // 椭圆的 x 轴半径
                  ry: currentInfo.ellipse.ry,   // 椭圆的 y 轴半径
                },
                style: {
                  fill: 'transparent', // 填充颜色
                  stroke: '#FF4500',    // 边框颜色
                  lineWidth: 1.5,       // 边框宽度
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
            ...tangentLines.map((tangent, index) => ({
              type: 'line',
              invisible: tangent.invisible,
              silent: true,
              id: TANGENT_LINE_ID + '_' + index,
            
              shape: {
                  x1: tangent.x1,
                  y1: tangent.y1,
                  x2: tangent.x2,
                  y2: tangent.y2
              },
              style: {
                  stroke: '#FF4500',  // 切线的颜色
                  lineWidth: 1,
                  lineDash: [2, 2]  // 虚线
              },
              name: '切线'
          })),
          // 夹角标记（虚弧线）
          ...tangentArcs.map((tangent, index) => ({
            type: 'arc',
            invisible: tangent.invisible,
            silent: true,
            id: TANGENT_ARC_ID + '_' + index,
            shape: {
              cx: tangent.x,
              cy: tangent.y,
              clockwise: tangent.clockwise,
                r: 10,
                startAngle: tangent.startAngle,
                endAngle: tangent.endAngle,
            },
            style: {
                stroke: '#FF4500',   // 夹角标记线的颜色
                lineWidth: 1,
                lineDash: [1, 1]   // 虚线
            },
            name: '夹角标记线'
        })), 
         // 夹角标记（虚弧线）
         ...tangentArcs.map((tangent, index) => ({
          type: 'text', 
          silent: true,
          invisible: tangent.invisible,
          id: TANGENT_TEXT_ID + '_' + index,
          style: {
            fill: '#FF4500',   // 夹角标记线的颜色
            fontSize: 12,
            x: tangent.fontX,
            y: tangent.fontY  ,
            text: `${transformAngle(tangent.angle)}°`, 
          },
          name: '内容'
      })),
      {
        type: 'group',
        id: RECT_ID,
        ignore: !tools.width,
        x: tools.x,
        y: tools.y,
        $action:'replace',
        children:  currentInfo.selectType === 'line' ? [
          {
            type: 'line',
            id: RECT_ID + '_rect',
            shape: {
              x1: currentInfo.line.x1 - tools.x,
              y1: currentInfo.line.y1 - tools.y,
              x2: currentInfo.line.x2 - tools.x,
              y2: currentInfo.line.y2 - tools.y,
            },
            style: {
              fill: 'transparent',
              stroke: '#3173FA',
              lineWidth: 2,
            },
          },
          {
            type: 'image',
            id: RECT_ID + '_rotate_left',
            x: currentInfo.line.x1 - tools.x - 6,
            y: currentInfo.line.y1 - tools.y - 6,
            originX: 0,
            originY: 0,
            style: {
              image: '/images/icon-pic-rotate.png',
              width: 12,
              height: 12,
            },
          },
          {
            type: 'image',
            id: RECT_ID + '_rotate_right',
            x: currentInfo.line.x2 - 6,
            y: currentInfo.line.y2 - 6,
            originX: 0,
            originY: 0,
            style: {
              image: '/images/icon-pic-rotate.png',
              width: 12,
              height: 12,
            },
          },
        ] :[ {
            type: 'rect',
            id: RECT_ID + '_rect',
            shape: {
              x: 0,
              y: 0,
              width: tools.width,
              height: tools.height,
            },
            style: {
              fill: 'transparent',
              stroke: '#efefef',
              lineWidth: 2,
            },
          },
        
          {
            type: 'image',
            id: RECT_ID + '_rotate',
            x:  tools.width - 6,
            y:  tools.height - 6,
            originX: 0,
            originY: 0,
            style: {
              image: '/images/icon-pic-rotate.png',
              width: 12,
              height: 12,
            },
          },
          {
            type: 'image',
            id: RECT_ID + '_close',
            x: tools.width - 6,
            y: -6,
            originX: 0,
            originY: 0,
            style: {
              image: '/images/icon-photo-delete.png',
              width: 12,
              height: 12,
            },
          },
        ]

      }
    ]
  }]
      
      },
    
    }

    return {
        option,
        angle: angleResult
    }
}   