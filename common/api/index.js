import { request } from '@/common/request.js'

// 获取最新 app 下载链接
export function getApp(deviceName) {
  return request({
    url: '/app/system/version',
    method: 'get',
    data: {
      deviceName
    }
  })
}

// 获取最新 pda 下载链接
export function getPda() {
  return request({
    url: '/app/pda/version',
    method: 'get'
  })
}
