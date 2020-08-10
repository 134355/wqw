import React, {Component} from 'react'
import { Modal } from 'antd'
import ReViewContext from './ReViewContext'

export default class ReTable extends Component {
  constructor(props) {
    super(props)
  }

  static contextType = ReViewContext

  handleOk = () => {
    this.context.setState(state => ({
      modal: {
        ...state.modal,
        confirmLoading: true,
      }
    }))
 
    setTimeout(() => {
      this.context.setState(state => ({
        modal: {
          ...state.modal,
          confirmLoading: false,
          visible: false
        }
      }))
    }, 2000)
  }

  handleCancel = () => {
    this.context.setState(state => ({
      modal: {
        ...state.modal,
        visible: false,
      }
    }))
  }

  render () {
    const { visible, confirmLoading, title } = this.context.state.modal
    return (
      <Modal
        title={title}
        visible={visible}
        onOk={this.handleOk}
        confirmLoading={confirmLoading}
        onCancel={this.handleCancel}
      >
        <p>ModalText</p>
      </Modal>
    )
  }
}
