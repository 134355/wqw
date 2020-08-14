import { stringify } from 'qs';
import request from './request';
import fetch from './fetch'

/**
 * 广告 - 列表
 */
export async function getBannerList(params) {
  return fetch(`zhushou/api/base/v1/banner/list?${stringify(params)}`, {
    retData: true,
  });
}

/**
 * 广告位- 选项列表
 */
export async function getBannerListOptions() {
  return fetch('zhushou/api/base/v1/banner-position/option-list', {
    retData: true,
  });
}

/**
 * 广告 - 更新
 */
export async function updateAPPBanner(params) {
  return request('zhushou/api/base/v1/banner/update', {
    method: 'POST',
    body: {
      ...params,
    },
    retData: true,
  });
}

/**
 * 广告 - 创建
 */
export async function createBanner(params) {
  return request('zhushou/api/base/v1/banner/create', {
    method: 'POST',
    body: {
      ...params,
    },
    retData: true,
  });
}

/**
 * 广告 - 删除
 */
export async function deleteAppBanner(params) {
  return request('zhushou/api/base/v1/banner/delete', {
    method: 'POST',
    body: {
      id: params,
    },
    retData: true,
  });
}

/**
 * 筛选规则 - 选项列表
 */
export async function getRuleListOptions() {
  return request('zhushou/api/base/v1/select-rule/option-list?app_id=1&app_module_id=0', {
    retData: true,
  });
}

/**
 * 广告 - 设置IOS应用审核状态下是否显示
 */
export async function setApprove(params) {
  return request('zhushou/api/base/v1/banner/set-hide-for-ios-approve', {
    method: 'POST',
    body: {
      ...params,
    },
    retData: true,
  });
}

/**
 * 经选内参 - 状态常量
 */
export async function getInternalConsts(params) {
  return request(`zhushou/api/base/v1/enum/maps?${stringify(params)}`, {
    retData: true,
  });
}
