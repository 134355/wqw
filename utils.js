/* eslint-disable import/no-mutable-exports */
import React from 'react';
import { parse } from 'qs';
import { Select, Message } from 'antd';
import {
  isObject,
  isArray,
  isString,
  isEmpty,
  repeat,
  trim,
  truncate,
  some,
  includes,
} from 'lodash';
import moment from 'moment';

const { Option } = Select;

const { host } = window.location;
const { userAgent } = navigator;

/* eslint no-useless-escape:0 */
/**
 * 是否URL链接
 */
const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;
export function isUrl(path) {
  return reg.test(path);
}

export const importCDN = (url, name) =>
  new Promise(resolve => {
    const dom = document.createElement('script');
    dom.src = url;
    dom.type = 'text/javascript';
    dom.onload = () => {
      resolve(window[name]);
    };
    document.head.appendChild(dom);
  });

// electron更新服务器地址
export const ELECTRON_UPDATE_SERVER = 'http://jzy-download.jingzhuan.cn/transfer/';


/**
 * 下载客户端版本
 *
 * @export
 * @param {boolean} [isWin32=false]
 */
export function downloadDesktop(isWin32 = false) {
  const isWin64 = winIsX64() && !isWin32;
  const isTest = APP_TYPE === 'site';
  // eslint-disable-next-line no-nested-ternary
  const platform = IN_WINDOWS ? (isWin64 ? 'win64' : 'win32') : 'mac';
  const urlPrefix = `${ELECTRON_UPDATE_SERVER +
    (isTest ? 'test' : 'update')}/${platform}/${APP_NAME + (isTest ? '-test' : '')}`;
  const downloadUrl = IN_WINDOWS
    ? `${urlPrefix}-${isWin64 ? 'x64' : 'ia32'}-${APP_VERSION}.exe`
    : `${urlPrefix}-${APP_VERSION}.dmg`;

  window.open(downloadUrl);
}

/**
 * 设置第三方请求接口Headers
 *
 * @export
 * @param {object} data
 * @param {object} headers
 */
export function setRequestHeaders(data, headers = {}) {
  const { cookies, user_agent: agent } = data;
  let cookiesText = '';

  if (isObject(cookies)) {
    Object.keys(cookies).forEach(item => {
      cookiesText += `${item}=${cookies[item].value}; `;
    });
  }

  const { session } = window.require('electron').remote;
  const filter = {
    urls: ['https://*.toutiao.com/*'],
  };
  session.defaultSession.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
    const { requestHeaders, url } = details;
    const newHeaders = {
      ...requestHeaders,
      Cookie: cookiesText,
      Origin: 'https://mp.toutiao.com',
      Referer: 'https://mp.toutiao.com/profile_v3/graphic/publish',
      'User-Agent': agent,
      ...headers,
    };

    if (url.includes('edit_article_post')) {
      newHeaders.Accept = 'application/json, text/plain, */*';
      newHeaders['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
    }

    delete newHeaders.Authorization;
    callback({ requestHeaders: newHeaders });
  });
}

/**
 * 打开链接
 *
 * @export
 * @param {object} event
 * @returns
 */
export function openLink(event) {
  if (IN_ELECTRON) {
    event.preventDefault();
    const { shell } = window.require('electron');
    shell.openExternal(event.target.href);
  }
}

/**
 * 设置cookie
 *
 * @export
 * @param {string} name
 * @param {string} value
 * @param {number} expiredays
 */
export function setCookie(name, value, expiredays = 365) {
  const exdate = new Date();
  exdate.setDate(exdate.getDate() + expiredays);
  document.cookie = `${name}=${escape(value)};expires=${exdate.toUTCString()};path=/`;
}

/**
 * 获取cookie
 *
 * @export
 * @param {string} name
 * @returns
 */
export function getCookie(name) {
  if (document.cookie.length > 0) {
    let cStart = document.cookie.indexOf(`${name}=`);
    if (cStart !== -1) {
      cStart = cStart + name.length + 1;
      let cEnd = document.cookie.indexOf(';', cStart);
      if (cEnd === -1) {
        cEnd = document.cookie.length;
      }
      return unescape(document.cookie.substring(cStart, cEnd));
    }
  }
  return '';
}

/**
 * 移除cookie
 *
 * @export
 * @param {string} name
 */
export function clearCookie(name) {
  setCookie(name, '');
}

/**
 * 设置localStorage
 *
 * @export
 * @param {string} key
 * @param {string} value
 * @returns
 */
export function setStorage(key, value) {
  localStorage.setItem(key, value);
}

/**
 * 获取localStorage
 *
 * @export
 * @param {string} key
 * @returns
 */
export function getStorage(key) {
  return localStorage.getItem(key);
}

/**
 * 删除localStorage
 *
 * @export
 * @param {string} key
 * @returns
 */
export function delStorage(key) {
  return localStorage.removeItem(key);
}

/**
 * 判断项目类型
 *
 * @export
 * @param {string} type
 * @returns
 */
export function isProject(type) {
  const { href } = window.location;
  const isProj = href.includes(type);

  return isProj;
}

/**
 * 获取项目类型
 *
 * @export
 * @returns
 */
export function getProjectType() {
  let project = 'zt';

  if (isProject('fund')) {
    project = 'fund';
  } else if (isProject('school')) {
    project = 'school';
  } else if (isProject('operation')) {
    project = 'operation';
  }

  return project;
}

/**
 * 获取Token Key
 *
 * @export
 * @returns
 */
export function getTokenKey() {
  let key = 'transfer_token';

  if (isProject('fund')) {
    key = 'fund_token';
  } else if (isProject('school')) {
    key = 'school_token';
  } else if (isProject('operation')) {
    key = 'operation_token';
  }

  return key;
}

/**
 * 获取token
 *
 * @export
 * @returns
 */
export function getToken() {
  return getCookie(getTokenKey());
}

/**
 * 跳转登录页面
 *
 * @export
 * @returns
 */
export function gotoLogin() {
  const project = getProjectType();

  clearCookie(getTokenKey());

  window.location.href = `/zt#/user/login/${project}`;
}

/**
 * 清除权限数据
 *
 * @export
 * @returns
 */
export function clearAuthority() {
  const project = getProjectType();
  const authority = localStorage.getItem('transfer-authority');

  if (project === 'fund') {
    if (authority && authority.includes('fund.manage')) return;
    localStorage.setItem('transfer-authority', '["fund.manage"]');
    window.location.reload();
  } else if (project === 'school') {
    if (authority && authority.includes('school.manage')) return;
    localStorage.setItem('transfer-authority', '["school.manage"]');
    window.location.reload();
  } else if (project === 'zt') {
    window.location.reload();
  } else if (project === 'operation') {
    if (authority && authority.includes('operation.manage')) return;
    localStorage.setItem('transfer-authority', '["operation.manage"]');
    window.location.reload();
  }
}

/**
 * 是否拥有权限
 *
 * @export
 * @param {object} props
 * @param {string} type
 * @returns
 */
export function hasPermission(props, type) {
  const {
    common: {
      permissions: { permit },
    },
  } = props;
  const isPermit = includes(permit, type);

  return isPermit;
}

/**
 * 是否支持canvas
 *
 * @export
 * @returns
 */
export function isCanvas() {
  return !!window.HTMLCanvasElement;
}

/**
 * 复制到剪切板
 *
 * @export
 * @param {string} text
 * @param {string} tips
 */
export function copyToClipboard(text, tips) {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);

  Message.info(tips || formatMessage({ id: 'app.utils.copy-success' }));
}

/**
 * 换行符转换
 *
 * @export
 * @param {string} str
 * @returns
 */
export function enter2Br(str) {
  const val = str || '';

  return val.replace(/(?:\r\n|\r|\n)/g, '<br />');
}

/**
 * 格式化图片
 *
 * @export
 * @param {string} imgSrc
 * @param {number} width
 * @param {number} height
 * @param {number} type [1: 等比缩放，居中裁剪, 2: 等比缩放，不裁剪]
 * @returns
 */
export function formatImage(imgSrc, width, height, type = 2) {
  let imgUrl = imgSrc;

  if (!imgUrl) return imgUrl;
  if (typeof imgUrl !== 'string') return '';

  [imgUrl] = imgUrl.split('?');

  if (imgUrl.indexOf('http') < 0) {
    imgUrl = `https://imgs.n8n8.cn/${imgUrl}`;
  }

  if (width) {
    imgUrl += `?imageView2/${type}/w/${width}`;
  }

  if (height) {
    imgUrl += `/h/${height}`;
  }

  return imgUrl;
}

/**
 * 截取字符串
 *
 * @export
 * @param {string} value
 * @param {number} length
 * @param {string} omission
 * @returns
 */
export function truncateString(value, length = 50, omission = '...') {
  let newValue = value ? String(value) : '';
  newValue = removeHtmlTags(newValue);
  newValue = trim(newValue);
  newValue = truncate(newValue, {
    length,
    omission,
  });

  return newValue;
}

/**
 * 移除HTML标签
 *
 * @export
 * @param {string} str
 * @returns
 */
export function removeHtmlTags(str) {
  const regex = /(<([^>]+)>)/gi;
  let val = (str || '').replace(regex, '');
  val = trim(val);

  return val;
}

/**
 * 设置视频封面
 *
 * @export
 * @param {string} html
 * @returns
 */
export function setVideoPoster(html) {
  const videoRegex = /<video[^>]+src="?(https:\/\/imgs\.n8n8\.cn\/[^"\s]+)"?\s*><\/video>/g;
  const newHtml = html.replace(videoRegex, (tag, url) => {
    const tagHtml = `<video controls="" controlslist="nodownload" src="${url}" poster="${url}?vframe/jpg/offset/1"></video>`;

    return tagHtml;
  });
  return newHtml;
}

/**
 * 获取视频封面
 *
 * @param {string} url 视频地址
 * @param {string} frame 第几帧
 * @returns
 */
export function getVideoPoster(url, frame) {
  let poster = '';
  if (url && some(['imgs.n8n8.cn', 'xy-v.jingzhuan.cn'], item => includes(url, item))) {
    poster = `${url.split('?')[0]}?vframe/jpg/offset/${frame || 1}`;
  }
  return poster;
}

/**
 * 获取音频时长
 *
 * @param {object} props
 * @param {string} url 音频地址
 * @returns
 */
export async function getAudioTime(props, url, isTrans = true) {
  let time = '';
  if (url && some(['imgs.n8n8.cn', 'xy-v.jingzhuan.cn'], item => includes(url, item))) {
    const { dispatch } = props;
    const { format } = await dispatch({
      type: 'common/avinfo',
      payload: url,
    });
    if (format) {
      time = format.duration;
    }
    if (isTrans && format) {
      time = secondsToTime(format.duration);
    }
  }
  return time;
}

/**
 * 页面滚动
 *
 * @export
 * @param {string} str
 * @returns
 */
export function handScrolltop(elm) {
  if (elm) {
    const anchorElement = document.getElementById(elm);
    if (anchorElement) {
      window.scrollTo(0, anchorElement.offsetTop - window.innerHeight / 2);
    }
  } else {
    window.scrollTo(0, window.offsetTop - window.innerHeight / 2);
  }
}

/**
 * 获取对象的值
 *
 * @export
 * @param {object} obj
 * @returns
 */
export function getValue(obj) {
  return Object.keys(obj)
    .map(key => obj[key])
    .join(',');
}

/**
 * 获取URL参数
 *
 * @export
 * @returns
 */
export function getPageQuery() {
  return parse(window.location.href.split('?')[1]);
}

/**
 * 处理两位数字
 *
 * @export
 * @param {string} str
 * @returns
 */
export function twoDigit(str) {
  const val = str || '';
  return `00${val}`.slice(-2);
}

/**
 * 两位数字补零
 *
 * @export
 * @param {string} val
 * @returns
 */
export function fixedZero(val) {
  return val * 1 < 10 ? `0${val}` : val;
}

/**
 * 获取时间范围
 *
 * @export
 * @param {string} type
 * @returns
 */
export function getTimeDistance(type) {
  const now = new Date();
  const oneDay = 1000 * 60 * 60 * 24;

  if (type === 'today') {
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    return [moment(now), moment(now.getTime() + (oneDay - 1000))];
  }

  if (type === 'week') {
    let day = now.getDay();
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);

    if (day === 0) {
      day = 6;
    } else {
      day -= 1;
    }

    const beginTime = now.getTime() - day * oneDay;

    return [moment(beginTime), moment(beginTime + (7 * oneDay - 1000))];
  }

  if (type === 'month') {
    const year = now.getFullYear();
    const month = now.getMonth();
    const nextDate = moment(now).add(1, 'months');
    const nextYear = nextDate.year();
    const nextMonth = nextDate.month();

    return [
      moment(`${year}-${fixedZero(month + 1)}-01 00:00:00`),
      moment(moment(`${nextYear}-${fixedZero(nextMonth + 1)}-01 00:00:00`).valueOf() - 1000),
    ];
  }

  const year = now.getFullYear();
  return [moment(`${year}-01-01 00:00:00`), moment(`${year}-12-31 23:59:59`)];
}

/**
 * 获取日期计算
 *
 * @export
 * @param {number} amount
 * @param {string} unit
 * @param {string} type
 * @returns
 */
export function getDateCount(amount = 0, unit = 'days', type = 'subtract') {
  return moment()[type](amount, unit);
}

/**
 * 获取日期范围
 *
 * @export
 * @param {string} type
 * @param {number} value
 * @returns
 */
export function getDateRange(type, value) {
  const today = getDateCount();
  const yesterday = getDateCount(1);
  const beforeLast = getDateCount(2);
  let range = [];

  switch (type) {
    case 'today':
      range = [today, today];
      break;
    case 'yesterday':
      range = [yesterday, yesterday];
      break;
    case 'beforeLast':
      range = [beforeLast, beforeLast];
      break;
    case 'thisWeek':
      range = [moment().startOf('week'), moment().endOf('week')];
      break;
    case 'lastWeek':
      range = [getDateCount(1, 'week').startOf('week'), getDateCount(1, 'week').endOf('week')];
      break;
    case 'whichWeek': {
      const weekValue = moment().week() - value;
      const weekFirst = getDateCount(weekValue, 'week').startOf('week');
      const weekLast = getDateCount(weekValue, 'week').endOf('week');
      range = [weekFirst, weekLast];
      break;
    }
    case 'thisMonth':
      range = [moment().startOf('month'), moment().endOf('month')];
      break;
    case 'lastMonth':
      range = [
        getDateCount(1, 'months').startOf('month'),
        getDateCount(1, 'months').endOf('month'),
      ];
      break;
    default:
      break;
  }

  return range;
}

/**
 * 获取日期字符串
 *
 * @export
 * @param {object} date
 * @param {string} format
 * @returns
 */
export function getDateString(date, format = 'YYYY-MM-DD') {
  let dates = '';

  if (Array.isArray(date) && date.length) {
    const [start, end] = date;
    dates = [];
    dates.push(start ? start.format(format) : start);
    dates.push(end ? end.format(format) : end);
  } else if (!Array.isArray(date) && date) {
    dates = date.format(format);
  }

  return dates;
}

/**
 * 秒数转为时分秒
 *
 * @export
 * @param {string} val
 * @returns
 */
export function secondsToTime(val) {
  const time = parseInt(val, 10);
  const hours = Math.floor(time / 60 / 60);
  const minutes = Math.floor(time / 60) % 60;
  const seconds = Math.floor(time - minutes * 60);

  return `${hours ? `${twoDigit(hours)}:${twoDigit(minutes)}` : minutes}:${twoDigit(seconds, 2)}`;
}

/**
 * 获取来源选项
 *
 * @export
 * @param {object} sources
 * @returns
 */
export function getSourceOptions(sources) {
  const { data = {} } = sources || {};
  const options = Object.keys(data).map(key => (
    <Option key={key} value={key}>
      {data[key]}
    </Option>
  ));

  return options;
}

/**
 * 获取下拉选项
 *
 * @export
 * @param {object} list
 * @param {string} title
 * @param {string} key
 * @param {string} value
 * @returns
 */
export function getSelectOptions(list, title = 'title', key = 'id', value = key) {
  const { data = [] } = Array.isArray(list) ? { data: list } : list;
  let options = '';

  if (data.length) {
    options = data.map(item => (
      <Option key={item[key]} value={item[value]}>
        {item[title]}
      </Option>
    ));
  }

  return options;
}

/**
 * 获取下拉名称
 *
 * @export
 * @param {object} list
 * @param {string} title
 * @param {string} value
 * @param {string} key
 * @returns
 */
export function getSelectTitle(list, title, value, key = 'id') {
  const { data = [] } = Array.isArray(list) ? { data: list } : list;
  const selected = Array.isArray(data) && data.find(item => item[key] === Number(value));
  let titleText = '';

  if (selected) {
    titleText = selected[title];
  }

  return titleText;
}

/**
 * 获取下拉数值
 *
 * @export
 * @param {object} list
 * @param {string} title
 * @param {string} value
 * @param {string} key
 * @returns
 */
export function getSelectValue(list, title, value, key = 'id') {
  const { data = [] } = Array.isArray(list) ? { data: list } : list;
  const selected = data.find(item => item[title] === value);
  let titleValue = '';

  if (selected) {
    titleValue = selected[key];
  }

  return titleValue;
}

/**
 * 获取头像地址
 *
 * @export
 * @param {string} avatar
 * @returns
 */
export function getAvatarURL(avatar) {
  const url = avatar || 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png';
  return url;
}

/**
 * 获取用户设置
 *
 * @export
 * @param {string} key
 * @returns
 */
export function getUserSetting(key) {
  let setting = localStorage.getItem('transfer-setting');
  setting = setting ? JSON.parse(setting) : {};

  if (key) return setting[key];
  return setting;
}

/**
 * 获取禁用日期
 *
 * @export
 * @param {object} currentDate
 * @returns
 */
export function getDisabledDate(current) {
  return current && current < moment().startOf('day');
}

/**
 * 获取文件名称
 *
 * @export
 * @param {string} file
 * @returns
 */
export function getFileName(file) {
  let value = '';

  if (file) {
    value = file.split('/').pop();
    [value] = value.split(/\?|\#/g);
  }

  return value;
}

/**
 * 获取文件扩展
 *
 * @export
 * @param {string} file
 * @returns
 */
export function getFileExt(file) {
  let value = '';

  if (file) {
    value = getFileName(file);
    value = value.split('.').pop();
  }

  return value;
}

/**
 * 获取上传图片
 *
 * @export
 * @param {array} value
 * @returns
 */
export function getUploadImages(value) {
  const images = [];

  if (!isEmpty(value)) {
    value.forEach(item => {
      images.push(item.url);
    });
  }

  return images;
}

/**
 * 设置上传图片
 *
 * @export
 * @param {array/string} value
 * @returns
 */
export function setUploadImages(value) {
  const images = [];

  if (isArray(value)) {
    value.forEach((item, index) => {
      const image = {};
      if (!item) return;
      image.url = item;
      image.uid = -(index + 1);
      image.name = getFileName(item);

      images.push(image);
    });
  } else if (value && isString(value)) {
    images.push({ url: value, uid: -1, name: getFileName(value) });
  }

  return images;
}

/**
 * 下载跨域图片
 *
 * @export
 * @param {string} src
 * @param {string} name
 * @returns
 */
export function downloadImage(src, name) {
  const image = new Image();

  image.setAttribute('crossOrigin', 'anonymous');
  image.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;

    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0);

    const url = canvas.toDataURL('image/jpeg');
    const a = document.createElement('a');
    const event = new MouseEvent('click');

    a.download = name || '图片';
    a.href = url;
    a.dispatchEvent(event);
  };
  image.src = src;
}

/**
 * 设置表单时间
 *
 * @export
 * @param {string} value
 * @param {string} format
 * @returns
 */
export function setFormTime(value, format = 'YYYY-MM-DD') {
  const dateValue = value && moment(value, format);

  return dateValue && dateValue.isValid() ? dateValue : null;
}

/**
 * 格式化数组参数
 *
 * @export
 * @param {array} data
 * @param {string} type
 * @param {string} name
 * @returns
 */
export function formatArrayData(data, type, name = 'id') {
  let newData = new FormData();
  if (type === 'obj') {
    newData = {};
  }

  for (let i = 0; i < data.length; i += 1) {
    const key = `${name}[${i}]`;
    const val = data[i];

    if (type === 'obj') {
      newData[key] = val;
    } else {
      newData.append(key, val);
    }
  }

  return newData;
}

/**
 * 格式化对象选项
 *
 * @export
 * @param {object} data
 * @returns
 */
export function formatObjectOptions(data) {
  const list = [];

  if (!isEmpty(data)) {
    Object.keys(data).forEach(item => list.push({ id: Number(item), title: data[item] }));
  }

  return list;
}

/**
 * 格式化股票代码
 *
 * @export
 * @param {string} code
 * @returns
 */
export function formatStockCode(code) {
  const newCode = code ? code.replace(/[^0-9]/gi, '') : code;

  return newCode;
}

/**
 * 字符串加星号
 *
 * @export
 * @param {string} value
 * @param {number} times
 * @returns
 */
export function formatStrAsterisk(value, times = 5) {
  const asterisk = repeat('*', times);
  const { length } = String(value);
  let str = value;

  if (length > times) {
    str =
      str.substr(0, Math.floor(length / 2 - 2)) +
      asterisk +
      str.substr(Math.floor(length / 2 + 3), length);
  }

  return str;
}

/**
 * 获取字符串长度
 *
 * @export
 * @param {string} value
 * @param {string} double
 * @param {string} type
 * @returns
 */
export function getStringLength(value, double, type) {
  const newValue = value ? String(value) : '';
  let { length } = newValue;

  // eslint-disable-next-line no-control-regex
  if (double) length = Math.ceil(newValue.replace(/[^\x00-\xff]/g, '**').length / 2);

  if (type === 'sina' && /[a-z]/i.test(newValue)) {
    const letterLength = newValue.match(/[a-z]/gi).length;
    length += 0.2 * letterLength;
  }

  return length;
}

/**
 * Create WebSocket
 *
 * @export
 * @param {object} config
 * @param {function} onMessage
 * @returns
 */
let WS;
let wsClose;
let wsSubscribe;
export function createWebSocket(config = {}, onMessage = () => {}) {
  const options = {
    ws: 'wss:zt.jingzhuan.cn/wss',
    ...config,
  };
  const data = {
    controller_name: '',
    method_name: '',
    params: [],
  };
  const { ws } = options;
  const token = getToken();
  let heartTimer;

  WS = new WebSocket(ws);

  const wxSend = val => {
    let str = val;

    if (typeof val === 'object') {
      str = JSON.stringify(val);
    }

    WS.send(str);
  };

  const wxLogin = () => {
    data.controller_name = 'LoginControllers';
    data.method_name = 'login';
    data.params = [token, ''];

    wxSend(data);
  };

  const wsHeart = () => {
    wxSend('@heart');

    clearTimeout(heartTimer);
    heartTimer = setTimeout(wsHeart, 30000);
  };

  wsSubscribe = (params = []) => {
    data.controller_name = 'MobileDeviceController';
    data.method_name = 'addTopic';
    data.params = params;

    wxSend(data);
  };

  WS.onopen = () => {
    wxLogin();

    // eslint-disable-next-line no-console
    console.log(`[WS]${formatMessage({ id: 'app.utils.ws.connected' })}：${JSON.stringify(data)}`);
  };

  WS.onmessage = e => {
    const res = JSON.parse(e.data);
    const { cmd, code, response } = res;

    // eslint-disable-next-line no-console
    console.log(`[WS]${formatMessage({ id: 'app.utils.ws.fetch' })}：${response}`);

    if (code !== 1) return;

    if (cmd === 'login') {
      wsHeart();
    }

    onMessage(cmd, response);
  };

  WS.onclose = () => {
    clearTimeout(heartTimer);

    if (!wsClose) {
      setTimeout(() => createWebSocket(config, onMessage), 100);
    }
    wsClose = false;

    // eslint-disable-next-line no-console
    console.log(`[WS]${formatMessage({ id: 'app.utils.ws.closed' })}`);
  };

  WS.onerror = e => {
    const err = e.data || e.type;

    WS.close();

    // eslint-disable-next-line no-console
    console.log(`[WS]${formatMessage({ id: 'app.utils.ws.error' })}：${err}`);
  };
}

/**
 * Close WebSocket
 *
 * @export
 * @returns
 */
export function closeWebSocket() {
  if (!WS) return;

  wsClose = true;
  WS.close();
}

export { WS, wsSubscribe };
