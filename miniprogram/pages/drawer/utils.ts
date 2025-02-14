export const checkTap = () => {

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
            return Math.abs(Math.atan(Math.abs(1 / m2)));
        }
    }
    if (m2 === Infinity || m2 === -Infinity) {
        if (m1 === 0) {
            return Math.PI / 2; // 垂直线与水平线的夹角为 90 度
        } else {
            return Math.abs(Math.atan(Math.abs(1 / m1)));
        }
    }

    // 正常情况
    if (m1 * m2 === -1) {
        return Math.PI / 2; // 垂直，夹角为 90 度
    }

    const tanTheta = Math.abs((m2 - m1) / (1 + m1 * m2));
    const thetaRadians = Math.atan(tanTheta);
    const thetaDegrees = (thetaRadians);

    return thetaDegrees;
}