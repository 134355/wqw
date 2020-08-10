import React, {Component} from 'react'
import { Table, Button, Popconfirm } from 'antd'
import { FormOutlined, DeleteOutlined } from '@ant-design/icons'
import ReViewContext from './ReViewContext'
import { isString } from './utils'

export default class ReTable extends Component {
  constructor(props) {
    super(props)
  }

  static contextType = ReViewContext

  handleDel = (row, index) => {
    this.context.handleDel(row, index)
  }

  renderBtn = (action) => {
    action.render = (_, row, index) => {
      return action.item.map((item, key) => {
        const funcs = {
          update: () => {
            console.log(row, index)
          },
          del: () => {
            this.handleDel(row, index)
          }
        }
        if (isString(item)) {
          switch (item) {
            case 'update':
              return (
                <Button type="link" key={key} onClick={funcs.update} className="table-action-btn">
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
    const { table: { columns, action }, data } = this.context.state
    let newColumns = [...columns]
    if (action.is !== false) {
      newColumns = [...columns, this.renderBtn(action)]
    }
    
    return (
      <Table className="re-table" columns={newColumns} dataSource={data} pagination={false} />
    )
  }
}