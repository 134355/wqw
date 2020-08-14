import React, { Component } from 'react'
import { Table, Button, Tooltip } from 'antd'
import { default as FormOutlined } from '@ant-design/icons/lib/icons/FormOutlined'
import { default as DeleteOutlined } from '@ant-design/icons/lib/icons/DeleteOutlined'
import { default as QuestionCircleOutlined } from '@ant-design/icons/lib/icons/QuestionCircleOutlined'
import ReViewContext from './ReViewContext'
import { isString, isObject, isFunction, isBoolean, isTrue, deepClone } from './utils'

export default class ReTable extends Component {
  constructor(props) {
    super(props)
  }

  static contextType = ReViewContext

  handleDel = (row, index) => {
    this.context.setState({
      clearRowKey: false
    }, () => {
      this.context.handleDel(row, index)
    })
  }

  handleEdit = (row) => {
    this.context.setState(state => ({
      addOrEdit: false,
      modalForm: {
        ...state.modalForm,
        modal: {
          ...state.modalForm.modal,
          title: '编辑',
          visible: true,
        }
      }
    }), () => {
      const { editBefore } = this.context.state.callback
      const data = deepClone(row)
      let newData = data
      if (isFunction(editBefore)) {
        newData = editBefore(data)
      }
      const { formData } = this.context.state.modalForm
      Object.keys(formData).forEach(key => {
        if (key.includes('$$')) {
          const arr = []
          key.split('$$').forEach((k, i) => {
            arr[i] = row[k]
          })
          newData[key] = arr
        } else {
          newData[key] = row[key]
        }
      })
      this.context.handleSetFieldsValue(newData)
    })
  }

  renderCol = (item, tabValue) => {
    const newItem = { ...item }

    let is = false
    if (isFunction(newItem.hidden)) {
      is = newItem.hidden({ tab: tabValue })
    }
    if (isBoolean(newItem.hidden)) {
      is = newItem.hidden
    }
    if (is) return

    if (isObject(newItem.tooltip)) {
      newItem.title = (
        <Tooltip title={newItem.tooltip.content}>
          {item.title}
          <QuestionCircleOutlined className="question" />
        </Tooltip>
      )
    }

    if (isFunction(newItem.render)) {
      newItem.render = (...ags) => {
        return item.render(...ags, tabValue)
      }
    }
    
    return newItem
  }

  renderBtn = (action) => {
    action.render = (_, row, index) => {
      return action.item.map((item, key) => {
        const funcs = {
          edit: () => {
            this.handleEdit(row, index)
          },
          del: () => {
            this.handleDel(row, index)
          }
        }
        if (isString(item)) {
          switch (item) {
            case 'edit':
              return (
                <Button type="link" className="table-action-btn" key={key} onClick={funcs.edit}>
                  <FormOutlined />
                </Button>
              )
            case 'del':
              return (
                <Button type="link" className="table-action-btn" key={key} onClick={funcs.del}>
                  <DeleteOutlined />
                </Button>
              )
          }
        }
        if (isFunction(item)) {
          return item({ funcs, row, index })
        }
        return
      })
    }
    return action
  }

  render () {
    const type = ['checkbox', 'radio']
    const { table: { columns, action, selectType, rowKey, ...props },
      data, tab: { tabValue }, selectedRowKeys } = this.context.state
    let newColumns = []
    let rowSelection
    columns.forEach(item => {
      if (type.includes(item.type)) {
        rowSelection = {
          selectedRowKeys,
          onChange: (rowKeys, rows) => {
            this.context.setState({
              selectedRowKeys: rowKeys
            })
          },
          ...item
        }
      } else {
        const el = this.renderCol(item, tabValue)
        if (el) newColumns.push(el)
      }
    })
    if (action.is !== false) {
      newColumns = [...newColumns, this.renderBtn(action)]
    }
    return (
      <Table {...props} rowKey={rowKey} rowSelection={rowSelection} className="re-table" columns={newColumns} dataSource={data} pagination={false} />
    )
  }
}