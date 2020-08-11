import React, {Component} from 'react'
import { Table, Button, Popconfirm, Tooltip, Icon } from 'antd'
import { default as FormOutlined } from '@ant-design/icons/lib/icons/FormOutlined'
import { default as DeleteOutlined } from '@ant-design/icons/lib/icons/DeleteOutlined'
import { default as QuestionCircleOutlined } from '@ant-design/icons/lib/icons/QuestionCircleOutlined'
import ReViewContext from './ReViewContext'
import { isString, isObject } from './utils'

export default class ReTable extends Component {
  constructor(props) {
    super(props)
  }

  static contextType = ReViewContext

  handleDel = (row, index) => {
    this.context.handleDel(row, index)
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
      this.context.handleSetFieldsValue(row)
    })
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
                <Button type="link" key={key} onClick={funcs.edit} className="table-action-btn">
                  <FormOutlined />
                </Button>
              )
            case 'del':
              return (
                <Popconfirm
                  key={key}
                  title="您确定要删除选中数据？"
                  okText="确定"
                  cancelText="取消"
                  onConfirm={funcs.del}
                >
                  <Button type="link" className="table-action-btn">
                    <DeleteOutlined />
                  </Button>
                </Popconfirm>
              )
          }
        }
        return 
      })
    }
    return action
  }

  render () {
    const { table: { columns, action, rowSelection, rowKey, ...props }, data } = this.context.state
    let newColumns = columns.map(item => {
      if (isObject(item.tooltip)) {
        item.title = (
          <Tooltip title={item.tooltip.content}>
            {item.tooltip.title}
            <QuestionCircleOutlined className="question" />
          </Tooltip>
        )
      }
      return item
    })
    if (action.is !== false) {
      newColumns = [...columns, this.renderBtn(action)]
    }
    
    return (
      <Table {...props} rowKey={rowKey} rowSelection={rowSelection} className="re-table" columns={newColumns} dataSource={data} pagination={false} />
    )
  }
}