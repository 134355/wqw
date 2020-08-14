import { isUndefined } from 'lodash';
import { IN_PROD, getUserSetting, isProject } from './utils';

export function configBaseUrl(url) {
  const { testMode } = getUserSetting();
  const isFund = isProject('fund');
  const isOperation = isProject('operation');
  // 仅匹配到基金投教相关接口时 切换请求域名
  const isStockFetchUrl = url.includes('api/v1/minp/guess/stock/search');
  const isStudioFetchUrl = url.includes('admin/api/lives/v1/');
  const isIMFetchUrl = url.includes('imadmin/api/v1/');
  const isFundSoftUrl = url.includes('api/v1/softad');
  const isNiuNiuPushUrl = url.includes('niuniuim/api/v1/');
  let baseUrl = 'https://gw.n8n8.cn/';

  if (testMode || (isUndefined(testMode) && !IN_PROD)) {
    baseUrl = 'https://gw-dev.n8n8.cn/';
    if (isFund) {
      baseUrl = 'https://gw-dev.n8n8.cn/funduser/';

      // 登录接口不需要 /funduser
      if (url.includes('api/auth/v1/login')) {
        baseUrl = 'https://gw-dev.n8n8.cn/';
      }
      if (isStudioFetchUrl) {
        baseUrl = 'http://gw-dev.jzdyfund.com/fundrpc/';
      }
      if (isIMFetchUrl) {
        baseUrl = 'http://api-test.xunim.com/';
      }
    }
    if (isOperation) {
      baseUrl = 'https://gw-dev.n8n8.cn/';
      if (isNiuNiuPushUrl) baseUrl = 'https://gw-dev.n8n8.cn/jzpush';
      if (isFundSoftUrl) baseUrl = 'http://api-test.xuanfund.com/';
    }
    if (isStockFetchUrl) {
      baseUrl = 'https://wechat-test.n8n8.cn/';
    }
  } else if (isFund) {
    baseUrl = 'https://gw.n8n8.cn/funduser/';

    // 登录接口不需要 /funduser
    if (url.includes('api/auth/v1/login')) {
      baseUrl = 'https://gw.n8n8.cn/';
    }
    if (isStudioFetchUrl) {
      baseUrl = 'https://gw.jzdyfund.com/fundrpc/';
    }
    if (isIMFetchUrl) {
      baseUrl = 'https://gw.jzdyfund.com/imapi/';
    }
  } else if (isOperation) {
    if (isNiuNiuPushUrl) baseUrl = 'https://gw.n8n8.cn/jzpush/';
  }

  return baseUrl;
}
