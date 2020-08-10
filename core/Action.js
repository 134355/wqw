import React, {Component} from 'react'
import { Button } from 'antd'
import ReViewContext from './ReViewContext'

export default class ReTable extends Component {
  constructor(props) {
    super(props)
  }

  static contextType = ReViewContext

  handleAdd = () => {
    this.context.setState(state => ({
      modal: {
        ...state.modal,
        visible: true,
      }
    }))
  }

  render () {
    return (
      <div>
        <Button type="primary" className="m-right-10" onClick={this.handleAdd}>添加</Button>
        <Button type="primary" danger>删除</Button>
      </div>
    )
  }
}
