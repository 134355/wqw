import React, {Component} from 'react'
import { Button, Popconfirm } from 'antd'
import ReViewContext from './ReViewContext'
import { default as PlusOutlined } from '@ant-design/icons/lib/icons/PlusOutlined'
import { default as DeleteOutlined } from '@ant-design/icons/lib/icons/DeleteOutlined'
import { isString, isFunction } from './utils'

export default class ReTable extends Component {
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
    this.context.handleDel({ id: this.context.state.ids })
  }

  renderBtn = () => {
    const { action } = this.context.state
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
                className="m-right-10"
                onClick={funcs.add}
                key={key}>
                添加
              </Button>
            )
          case 'del':
            return (
              <Popconfirm
                title="您确定要删除选中数据？"
                okText="确定"
                cancelText="取消"
                disabled={!this.context.state.ids}
                onConfirm={funcs.del}
                key={key}
              >
                <Button
                  type="primary"
                  icon={<DeleteOutlined />}
                  disabled={!this.context.state.ids}
                  danger>
                  删除
                </Button>
              </Popconfirm>
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
      <div>
        {this.renderBtn()}        
      </div>
    )
  }
}
