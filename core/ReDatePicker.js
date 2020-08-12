import React from 'react'
import { DatePicker } from 'antd'
import moment from 'moment'

const { RangePicker } = DatePicker


function transformMoment (value, format) {
  if (Array.isArray(value)) {
    return [value[0] ? moment(value[0], format) : undefined, value[1] ? moment(value[1], format) : undefined]
  }
  return value ? moment(value, format) : undefined
}

function transformFormat (value, valueFormat) {
  switch (valueFormat) {
    case 'no':
      if (Array.isArray(value)) {
        return [value[0] ? value[0] : undefined, value[1] ? value[1] : undefined]
      }
      return value || undefined
    case 'timestamp':
      if (Array.isArray(value)) {
        return [value[0] ? value[0].valueOf() : undefined, value[1] ? value[1].valueOf() : undefined]
      }
      return value ? value.valueOf() : undefined
    default:
      if (Array.isArray(value)) {
        return [value[0] ? value[0].format(valueFormat) : undefined, value[1] ? value[1].format(valueFormat) : undefined]
      }
      return value ? value.format(valueFormat) : undefined
  }
}

const ReDatePicker = ({ value, onChange, format, valueFormat = 'YYYY-MM-DD HH:mm:ss', ...props }) => {
  const transformValue = transformMoment(value, format)

  const transformOnChange = val => {
    onChange(transformFormat(val, valueFormat))
  }

  return (
    <DatePicker
      {...props}
      showTime
      value={transformValue}
      onChange={transformOnChange}
    />
  )
}

const ReRangePicker = ({ value, onChange, format, valueFormat = 'YYYY-MM-DD HH:mm:ss', ...props }) => {
  const transformValue = transformMoment(value, format)

  const transformOnChange = val => {
    onChange(transformFormat(val, valueFormat))
  }

  return (
    <RangePicker
      {...props}
      showTime
      value={transformValue}
      onChange={transformOnChange}
    />
  )
}

ReDatePicker.ReRangePicker = ReRangePicker

export default ReDatePicker
