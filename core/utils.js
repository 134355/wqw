import React from 'react'
import { Form, Select } from 'antd'
const toString = Object.prototype.toString

/**
 * @description 判断是否是Object类型
 */
export function isObject (value) {
  return toString.call(value) === '[object Object]'
}

/**
 * @description 判断是否是Array类型
 */
export function isArray (value) {
  return toString.call(value) === '[object Array]'
}

/**
 * @description 判断是否是Function类型
 */
export function isFunction (value) {
  return toString.call(value) === '[object Function]'
}

/**
 * @description 判断是否是String类型
 */
export function isString (value) {
  return toString.call(value) === '[object String]'
}

/**
 * @description 判断是否是Undefined类型
 */
export function isUndefined (value) {
  return toString.call(value) === '[object Undefined]'
}

/**
 * @description 判断是否是Boolean类型
 */
export function isBoolean (value) {
  return toString.call(value) === '[object Boolean]'
}

/**
 * @description 克隆
 */
export function deepClone (data) {
  return JSON.parse(JSON.stringify(data))
}

/**
 * @description 深度合并对象
 */
export function deepMerge (obj1, obj2) {
  let key
  for (key in obj2) {
    obj1[key] = obj1[key] && isObject(obj1[key]) ? deepMerge(obj1[key], obj2[key]) : obj1[key] = obj2[key]
  }
  return obj1
}

/**
 * @description 参数解析
 */
export function parseParams (obj) {
  const params = {}
  Object.keys(obj).forEach(key => {
    if (key.includes('$$')) {
      key.split('$$').forEach((k, i) => {
        params[k] = (obj[key] && (obj[key][i] || '')) || ''
      })
    } else {
      params[key] = obj[key]
    }
  })
  return deepClone(params)
}

/**
 * @description 生成 FormItem
 */
export function renderFormItem (formItem, formData) {
  return formItem.map(item => {
    let el = ''
   
    if (isFunction(item.hidden)) {
      if (item.hidden(formData, formItem)) return
    }

    if (isFunction(item.render)) {
      return (
        <Form.Item label={item.label} name={item.name} key={item.name} rules={item.rules} {...item.fiprops}>
          {item.render(formData, formItem)}
        </Form.Item>
      )
    }
    if (isFunction(item.service)) {
      if (!item.isDone) {
        item.service().then(res => {
          item.options = res.list
        })
        item.isDone = true
      }
    }
    switch (item.component) {
      case Select:
        el = (
          <Select {...item.props}>
            {item.options.map(e => {
              return <Select.Option value={e.value} key={e.value}>{e.label}</Select.Option>
            })}
          </Select>
        )
        break
      default:
        el = React.createElement(
          item.component,
          item.props,
          item.children,
        )
        break
    }
    return (
      <Form.Item label={item.label} name={item.name} key={item.name} rules={item.rules} {...item.fiprops}>
        {el}
      </Form.Item>
    )
  })
}

/**
 * @description 应用
 */
export function application(self) {
  const app = {
    set (key, data) {
      switch (key) {
        case 'modalForm':
          console.log(data)
          const formData = {}
          data.formItem.forEach(item => {
            const val = isUndefined(item.value) ? '' : item.value
            formData[item.name] = val
          })
          data.formData = formData
          self.setState(state => ({
            [key]: deepMerge(state[key], data)
          }))
          break
        default:
          self.setState(state => ({
            [key]: deepMerge(state[key], data)
          }))
          break
      }
      return app
    },
    done () {
      self.setState(({
        isDone: true
      }), () => {
        self.getTableData()
      })
    }
  }
  return app
}
