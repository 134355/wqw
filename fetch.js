import axios from 'axios'
import { getToken } from './utils';

const service = axios.create({
  baseURL: 'https://gw-dev.n8n8.cn',
  timeout: 30000,
})

service.interceptors.request.use(config => {
  const token = getToken();
  config.headers.Authorization = `Bearer ${token}`
  return config
}, error => {
  return Promise.reject(error)
})

service.interceptors.response.use(response => {
  const { data: { code, msg, response: data } } = response
  if (code === 1) {
    return data
  }
  return Promise.reject(msg)
}, error => {
  return Promise.reject(error)
})

export default service
