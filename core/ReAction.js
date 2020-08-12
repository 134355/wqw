import React, { Component } from 'react'
import { Button, Alert } from 'antd'
import ReViewContext from './ReViewContext'
import { default as PlusOutlined } from '@ant-design/icons/lib/icons/PlusOutlined'
import { default as DeleteOutlined } from '@ant-design/icons/lib/icons/DeleteOutlined'
import { isString, isFunction } from './utils'

export default class ReAction extends Component {
  constructor(props) {
    super(props)
  }

  static contextType = ReViewContext

  handleAdd = () => {
    this.context.setState(state => ({
      addOrEdit: true,
      modalForm: {
        ...state.modalForm,
        modal: {
          ...state.modalForm.modal,
          title: '添加',
          visible: true,
        }
      }
    }), () => {
      this.context.handleResetModalForm()
    })
  }

  handleDel = () => {
    this.context.setState({
      clearRowKey: true
    }, () => {
      this.context.handleDel({ id: this.context.state.selectedRowKeys.join() })
    })
  }

  renderBtn = () => {
    const { action, selectedRowKeys } = this.context.state
    return action.map((item, key) => {
      const funcs = {
        add: () => {
          this.handleAdd()
        },
        del: () => {
          this.handleDel()
        }
      }
      if (isString(item)) {
        switch (item) {
          case 'add':
            return (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={funcs.add}
                key={key}>
                添加
              </Button>
            )
          case 'del':
            return (
              <Button
                type="primary"
                icon={<DeleteOutlined />}
                disabled={!selectedRowKeys.length}
                danger
                onClick={funcs.del}
                key={key}>
                批量删除
              </Button>
            )
        }
      }
      if (isFunction(item)) {
        item(funcs)
      }
    })
  }

  render () {
    return (
      <div className="flex">
        {this.renderBtn()}        
      </div>
    )
  }
}
