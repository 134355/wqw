import axios from 'axios';
import { notification, message } from 'antd';
import { startsWith, includes, some, has } from 'lodash';
import { getToken, isProject, gotoLogin } from './utils';
import { configBaseUrl } from './baseUrl';

const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};

const checkStatus = async (res, options) => {
  const {
    status,
    statusText,
    config: { url },
    data: response,
  } = res;
  const { retData } = options;
  const { code, msg, response: data } = response;

  if (code !== undefined) {
    if (code === 401 || code === 400003 || code === 400004) {
      gotoLogin();
      return [];
    }
    if (data === undefined || retData) {
      return response;
    }
    if (code === 1) {
      return data;
    }
    if (msg) {
      message.error(msg);
      return [];
    }
    return response;
  }

  if (retData || !some(['n8n8.cn', 'jzdyfund.com', 'xuanfund.com'], host => includes(url, host))) {
    return response;
  }

  const errortext = codeMessage[status] || statusText;
  notification.destroy();
  notification.error({
    message: `请求错误 ${status}: ${url}`,
    description: errortext,
    duration: null,
  });
  const error = new Error(errortext);
  error.name = status;
  error.response = response;
  throw error;
};

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
export default function request(url, options) {
  const token = getToken();
  const baseUrl = configBaseUrl(url);
  const isFund = isProject('fund');

  const defaultOptions = {
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    timeout: 30000,
    validateStatus: status => status >= 200 && status < 600,
  };
  const newOptions = { ...defaultOptions, ...options };
  window.JZENV = { BaseUrl: baseUrl };
  const { headers, method, body } = newOptions;
  const { catchFn } = body || {};
  const isPost = method === 'POST';

  if (catchFn) delete body.catchFn;

  if (isPost) {
    newOptions.headers = {
      Accept: 'application/json',
      ...headers,
    };
    if (!(body instanceof FormData)) {
      newOptions.headers['Content-Type'] = 'application/json; charset=utf-8';
      newOptions.body = JSON.stringify(body);
    }
  }

  let requestUrl = url;
  if (!startsWith(requestUrl, 'http')) {
    requestUrl = baseUrl + url;
  }

  if (includes(requestUrl, 'qiniup.com')) {
    newOptions.timeout = 100000;
  }

  if (!includes(requestUrl, 'n8n8') && !isFund) {
    delete newOptions.headers.Authorization;
  }

  if (includes(requestUrl, 'openLink')) {
    window.open(requestUrl);
    return [];
  }

  if (isFund && !token && !includes(requestUrl, '/login')) {
    gotoLogin();
    return [];
  }

  // TEST
  const { kk } = window;
  if (kk) {
    newOptions.headers.kk = kk;
  }
  if (has(newOptions, 'body')) {
    newOptions.data = newOptions.body;
    delete newOptions.body;
  }
  return axios
    .request(requestUrl, newOptions)
    .then(response => checkStatus(response, newOptions))
    .catch(error => {
      let err = String(error);
      if (catchFn) {
        catchFn(err);
      } else {
        if (includes(err, 'timeout')) {
          err = '请求超时，请稍后再试~';
        }
        message.error(err);
      }

      // eslint-disable-next-line no-console
      console.error(err);

      return [];
    });
}
