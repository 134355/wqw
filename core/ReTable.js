import React, { Component } from 'react'
import { Table, Button, Tooltip } from 'antd'
import { default as FormOutlined } from '@ant-design/icons/lib/icons/FormOutlined'
import { default as DeleteOutlined } from '@ant-design/icons/lib/icons/DeleteOutlined'
import { default as QuestionCircleOutlined } from '@ant-design/icons/lib/icons/QuestionCircleOutlined'
import ReViewContext from './ReViewContext'
import { isString, isObject, isFunction, isBoolean, deepClone } from './utils'

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
      this.context.handleSetFieldsValue(newData)
    })
  }

  renderCol = (item, tabValue) => {
    if (isObject(item.tooltip)) {
      item.title = (
        <Tooltip title={item.tooltip.content}>
          {item.tooltip.title}
          <QuestionCircleOutlined className="question" />
        </Tooltip>
      )
    }
    let is = false
    if (isFunction(item.hidden)) {
      is = item.hidden({ tab: tabValue })
    }
    if (isBoolean(item.hidden)) {
      is = item.hidden
    }
    if (is) return
    return item
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