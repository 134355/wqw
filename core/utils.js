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
 * @description 判断是否是false
 */
export function isFalse (value) {
  return value === false
}

/**
 * @description 判断是否是true
 */
export function isTrue (value) {
  return value === true
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
 * @description rendenEL
 */
export function rendenEL (component, props, children) {
  let childrenEL = children
  if (isArray(children)) {
    childrenEL = children.map(item => {
      return rendenEL(
        item.component,
        item.props,
        item.children,
      )
    })
  }
   return React.createElement(
    component,
    props,
    childrenEL,
  )
}

/**
 * @description 生成 FormItem
 */
export function renderFormItem ({ formItem, formData, tab, addOrEdit }) {
  return formItem.map(item => {
    let el = ''

    const { hidden, render, label, name, rules, fiprops, dataDict = { label: 'label', value: 'value' } } = item
   
    if (isFunction(hidden)) {
      if (hidden({ formItem, formData, tab, addOrEdit })) return
    }

    if (isFunction(render)) {
      return (
        <Form.Item label={label} name={name} key={name} rules={rules} {...fiprops}>
          {render({ formItem, formData, tab, addOrEdit })}
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
              return <Select.Option value={e[dataDict.value]} key={e[dataDict.value]}>{e[dataDict.label]}</Select.Option>
            })}
          </Select>
        )
        break
      default:
        el = rendenEL(
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
        case 'action':
        case 'layout':
          self.setState(({
            [key]: data
          }))
          break
        case 'searchForm':
        case 'modalForm':
          const formData = {}
          const defaultData = {}
          data.formItem.forEach(item => {
            const val = isUndefined(item.value) ? null : item.value
            formData[item.name] = val
            defaultData[item.name] = val
          })
          data.formData = formData
          data.defaultData = defaultData
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
