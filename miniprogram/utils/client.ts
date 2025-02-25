import CryptoJS from './crypto-js/index';
import { Base64 } from './js-base64/index';

/**
"YOUR_ACCESS_KEY_ID", "YOUR_ACCESS_KEY_SECRET" 的生成请参考https://help.aliyun.com/document_detail/175144.html
如果您是用的子账号AccessKey，还需要为子账号授予权限AliyunVIAPIFullAccess，请参考https://help.aliyun.com/document_detail/145025.html
*/
//AccessKeyID
const accessKeyId = "LTAI5tHKFv114p4W9gdnsXGt";
//AccessKeySecret
const accessKeySecret = "zIkq2PqAwQL5VxOom9XvchzvrrXCFi";
// miniProgramType：小程序类型，比如：微信小程序传参数：wx，支付宝传参数：my，钉钉传参数：dd，注意不要传字符串;
const miniProgramType = wx;

/**
 * ========================================================================================================================
 * 以RecognizeBankCard为例。
 * 这里只是为了小程序端演示流程，所以将代码写在了小程序端
 * 真正上线不建议将ACCESS_KEY_ID和ACCESS_KEY_SECRET写在小程序端，会有泄漏风险，建议将请求API接口代码写到您的服务端
 * 请求银行卡识别：https://help.aliyun.com/document_detail/151893.html
 * ========================================================================================================================
 */
// 参数说明：
// imageUrl：图片url
// callback：结果的回调
export function callRecognizePicture(imageUrl, callback) {
  // 这里endpoint为API访问域名，与类目相关，具体类目的API访问域名请参考：https://help.aliyun.com/document_detail/143103.html
  const endpoint = "objectdet.cn-shanghai.aliyuncs.com";
  // API Action，能力名称，请参考具体算法文档详情页中的Action参数，这里以银行卡识别为例：https://help.aliyun.com/document_detail/151893.html
  const Action = "DetectMainBody";
  // API_HTTP_METHOD推荐使用POST
  const API_HTTP_METHOD = "POST";
  // API_VERSION为API版本，与类目相关，具体类目的API版本请参考：https://help.aliyun.com/document_detail/464194.html
  const API_VERSION = "2019-12-30";

  const params = {};
  // 业务参数，请参考具体的AI能力的API文档进行修改
  params["ImageURL"] = imageUrl;

  callApi(endpoint, Action, API_VERSION, params, callback);
}

export  async function callRecognizeLocalPicture(localUrl: string) {
  return new Promise((resolve, reject) => {
    getOssStsToken((result) => {
      uploadToTempOss({
        AccessKeyId: result.Data.AccessKeyId,
        AccessKeySecret: result.Data.AccessKeySecret,
        SecurityToken: result.Data.SecurityToken,
      }, localUrl, 'image.jpg', (error, result) => {
        if (error) {
          reject(error);
        } else {
          callRecognizePicture(result, (result) => {
            resolve(result);
          })
        }
      })
    })
  })
}
/**
 * ========================================================================================================================
 * 获取oss sts token，使用阿里云视觉智能开放平台官方OSS-Bucket作为临时存储，仅为方便用户方便调试接口使用，文件存储有效期为1天。
 * 这里只是为了Web前端演示流程，所以将代码写在了Web前端
 * 真正上线不建议将ACCESS_KEY_ID和ACCESS_KEY_SECRET写在Web前端，会有泄漏风险，建议将请求API接口代码写到您的服务端
 * ossStsToken获取原理：xxx
 * ========================================================================================================================
 */
export function getOssStsToken(callback) {
  
  // 这里endpoint为API访问域名，与类目相关，具体类目的API访问域名请参考：https://help.aliyun.com/document_detail/143103.html
  const endpoint = "viapiutils.cn-shanghai.aliyuncs.com";
  // API Action，能力名称，请参考具体算法文档详情页中的Action参数，这里以银行卡识别为例：https://help.aliyun.com/document_detail/151893.html
  const Action = "GetOssStsToken";
  // API_VERSION为API版本，与类目相关，具体类目的API版本请参考：https://help.aliyun.com/document_detail/464194.html
  const API_VERSION = "2020-04-01";

  callApi(endpoint, Action, API_VERSION, null, callback);
}

/**
 * ========================================================================================================================
 * 通过签名方式调用API，支持平台的任意API。
 * 这里只是为了小程序端演示流程，所以将代码写在了小程序端
 * 真正上线不建议将ACCESS_KEY_ID和ACCESS_KEY_SECRET写在小程序端，会有泄漏风险，建议将请求API接口代码写到您的服务端
 * 签名文档：https://help.aliyun.com/document_detail/144904.html
 * ========================================================================================================================
 */
export function callApi(endpoint, action, version, params, callback) {
  // API_HTTP_METHOD推荐使用POST
  const API_HTTP_METHOD = "POST";

  const request_ = {};
  //系统参数
  request_["SignatureMethod"] = "HMAC-SHA1",
  request_["SignatureNonce"] = signNRandom(),
  request_["AccessKeyId"] = accessKeyId,
  request_["SignatureVersion"] = "1.0",
  request_["Timestamp"] = getTimestamp(),
  request_["Format"] = "JSON",
  request_["RegionId"] = "cn-shanghai",
  request_["Version"] = version,
  request_["Action"] = action;
  // 业务参数，请参考具体的AI能力的API文档进行修改
  if(params) {
    for(let key in params) {
      request_[key] = params[key];
    }
  }

  callApiRequest(miniProgramType, request_, API_HTTP_METHOD, endpoint, accessKeySecret, callback);
}

/**
 * ========================================================================================================================
 * 处理文件和URL，将其上传到阿里云视觉智能开放平台官方OSS-Bucket作为临时存储，该方式仅为方便用户方便调试接口使用，文件存储有效期为1天。
 * ========================================================================================================================
 */
// 使用oss-client-sdk进行文件上传
export function uploadToTempOss(ossStsToken, tempFilePath, fileName, callback) {
  const host = 'https://viapi-customer-temp.oss-cn-shanghai.aliyuncs.com';
  let formDataParams = getFormDataParams(ossStsToken.AccessKeyId,ossStsToken.AccessKeySecret,ossStsToken.SecurityToken);
  const signature = formDataParams.signature;
  const ossAccessKeyId = ossStsToken.AccessKeyId;
  const policy = formDataParams.policy;
  const key = accessKeyId+'/'+getNonce(6)+'/'+fileName;
  const securityToken = formDataParams['x-oss-security-token']; 
  miniProgramType.uploadFile({
    url: host, // 开发者服务器的URL。
    filePath: tempFilePath,
    name: 'file', // 必须填file。
    formData: {
      key,
      policy,
      OSSAccessKeyId: ossAccessKeyId,
      signature,
      'x-oss-security-token': securityToken // 使用STS签名时必传。
    },
    success: (res) => {
      if (res.statusCode === 204 || res.statusCode === '204') {
        let result = 'https://viapi-customer-temp.oss-cn-shanghai.aliyuncs.com/'+key;
        callback && callback(null, result);
      } else {
        callback && callback(res, null);
        console.log('upload error', res);
      }
    },
    fail: err => {
      callback && callback(err, null);
      console.log(err);
    }
  });
}

//请求数据
export function callApiRequest(miniProgramType, request_, API_HTTP_METHOD, endpoint, accessKeySecret, callback) {
  const url = generateUrl(request_, API_HTTP_METHOD, endpoint, accessKeySecret);
  console.log(url);
  wx.request({
    url: url,
    method: 'POST',
    header: {
      "ContentType": "application/json"
    },
    success: (result) => {
      // 获取结果
      return typeof callback == "function" && callback(result.data)
    },
    fail: (error) => {
      // 获取报错信息
      return typeof callback == "function" && callback(error.data)
    }
  })
}

/**
 * ========================================================================================================================
 * 以下代码仅仅为了调用服务端接口计算签名，其逻辑可参考文档：https://help.aliyun.com/document_detail/144904.html
 * 这里只是为了Web前端演示，所以将代码写在了Web前端
 * 真正上线不建议将ACCESS_KEY_ID和ACCESS_KEY_SECRET写在Web前端上，会有泄漏风险，建议将请求API接口代码写到您的服务端
 * ========================================================================================================================
 */

//随机数字
function signNRandom() {
  const Rand = Math.random()
  const mineId = Math.round(Rand * 100000000000000)
  return mineId;
};
//Timestamp
function getTimestamp() {
  let date = new Date();
  let YYYY = pad2(date.getUTCFullYear());
  let MM = pad2(date.getUTCMonth() + 1);
  let DD = pad2(date.getUTCDate());
  let HH = pad2(date.getUTCHours());
  let mm = pad2(date.getUTCMinutes());
  let ss = pad2(date.getUTCSeconds());
  return `${YYYY}-${MM}-${DD}T${HH}:${mm}:${ss}Z`;
}
function pad2(num) {
  if (num < 10) {
    return '0' + num;
  }
  return '' + num;
};
function ksort(params) {
  let keys = Object.keys(params).sort();
  let newParams = {};
  keys.forEach((key) => {
  newParams[key] = params[key];
  });
  return newParams;
};
function createHmac(stringToSign, key) {
  const CrypStringToSign = CryptoJS.HmacSHA1(CryptoJS.enc.Utf8.parse(stringToSign), key);
  const base64 = CryptoJS.enc.Base64.stringify(CrypStringToSign);
  return base64;
};
function encode(str) {
  var result = encodeURIComponent(str);
  return result.replace(/!/g, '%21')
  .replace(/'/g, '%27')
  .replace(/\(/g, '%28')
  .replace(/\)/g, '%29')
  .replace(/\*/g, '%2A');
};
function sha1(stringToSign, key) {
  return createHmac(stringToSign, key);
};
function getSignature(signedParams, method, secret) {
  var stringToSign = `${method}&${encode('/')}&${encode(signedParams)}`;
  const key = secret + "&";
  return sha1(stringToSign, key);
};
//参数拼接
function objToParam(param) {
  if (Object.prototype.toString.call(param) !== '[object Object]') {
    return '';
  }
  let queryParam = '';
  for (let key in param) {
    if (param.hasOwnProperty(key)) {
      let value = param[key];
      queryParam += toQueryPair(key, value);
    }
  }
  return queryParam;
};
function toQueryPair(key, value) {
  if (typeof value == 'undefined') {
    return `&${key}=`;
  }
  return `&${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
};
function generateUrl(request, httpMethod, endpoint, accessKeySecret) {
  //参数中key排序
  const sortParams = ksort(request);
  //拼成参数
  const sortQueryStringTmp = objToParam(sortParams);
  const sortedQueryString = sortQueryStringTmp.substring(1);// 去除第一个多余的&符号
  //构造待签名的字符串
  const Signture = getSignature(sortedQueryString, httpMethod, accessKeySecret)
  //签名最后也要做特殊URL编码
  request["Signature"] = encodeURIComponent(Signture);

  //最终生成出合法请求的URL
  const finalUrl = "https://" + endpoint + "/?Signature=" + encodeURIComponent(Signture) + sortQueryStringTmp;
  return finalUrl;
}

/**
 * ========================================================================================================================
 * 以下代码仅仅为了调用OSS上传文件计算签名，其逻辑可参考文档：https://help.aliyun.com/document_detail/92883.html#section-mx7-v31-uy7，客户端签名第二步
 * 这里只是为了Web前端演示，所以将代码写在了Web前端
 * 真正上线不建议将ACCESS_KEY_ID和ACCESS_KEY_SECRET写在Web前端上，会有泄漏风险，建议将请求API接口代码写到您的服务端
 * ========================================================================================================================
 */
// 计算签名 getSignature
function computeSignature(accessKeySecret, canonicalString) {
  return CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA1(canonicalString, accessKeySecret));
}
// 随机字符串
function getNonce(length) {
  var str = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var result = '';
  for (var i = length; i > 0; --i)
      result += str[Math.floor(Math.random() * str.length)];
  return result;
}
// 计算上传OSS的计算签名
function getFormDataParams(stsAccessKeyId,stsAccessKeySecret,securityToken) {
  const date = new Date();
  date.setHours(date.getHours() + 1);
  const policyText = {
    expiration: date.toISOString(), // 设置policy过期时间。
    conditions: [
      // 限制上传大小。
      ["content-length-range", 0, 1024 * 1024 * 1024],
    ],
  };
  const policy = Base64.encode(JSON.stringify(policyText)) // policy必须为base64的string。
  const signature = computeSignature(stsAccessKeySecret, policy)
  const formData = {
    OSSAccessKeyId: stsAccessKeyId,
    signature,
    policy,
    'x-oss-security-token': securityToken 
  }
  console.log(formData)
  return formData
}
