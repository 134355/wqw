import React, { Component } from 'react'
import { Modal, Form, message } from 'antd'
import ReViewContext from './ReViewContext'
import { renderFormItem, isFunction } from './utils'

export default class ReModal extends Component {
  constructor(props) {
    super(props)
    this.formRef = React.createRef()
  }

  static contextType = ReViewContext

  handleOk = () => {
    this.formRef.current.validateFields().then(values => {
      const { addOrEdit, service } = this.context.state
      const { add, edit } = service
      let func
      if (addOrEdit) {
        func = add
        if (!isFunction(add)) return console.error('service.add 请参考 service')
      } else {
        func = edit
        if (!isFunction(edit)) return console.error('service.edit 请参考 service')
      }

      this.context.setState(state => ({
        modalForm: {
          ...state.modalForm,
          modal: {
            ...state.modalForm.modal,
            confirmLoading: true,
          }
        }
      }))

      const { submitBefore } = this.context.state.callback
      if (isFunction(submitBefore)) submitBefore(values)
      console.log(values)
      func(values).then(() => {
        this.context.setState(state => ({
          modalForm: {
            ...state.modalForm,
            modal: {
              ...state.modalForm.modal,
              confirmLoading: false,
              visible: false
            }
          }
        }))
        if (addOrEdit) {
          message.success('添加成功')
        } else {
          message.success('编辑成功')
        }
        this.context.getTableData()
      }).catch(() => {
        this.context.setState(state => ({
          modalForm: {
            ...state.modalForm,
            modal: {
              ...state.modalForm.modal,
              confirmLoading: false
            }
          }
        }))
      })
    })
  }

  handleCancel = () => {
    this.context.setState(state => ({
      modalForm: {
        ...state.modalForm,
        modal: {
          ...state.modalForm.modal,
          visible: false,
        }
      }
    }))
  }

  handleResetFields = () => {
    setTimeout(() => {
      if (this.formRef.current) {
        this.formRef.current.resetFields()
      }
    })
  }

  handleSetFieldsValue = (data) => {
    setTimeout(() => {
      if (this.formRef.current) {
        this.formRef.current.setFieldsValue(data)
      }
    })
  }

  render () {
    const { addOrEdit, modalForm, tab } = this.context.state
    const { modal, formItem, initialValues, formData } = modalForm
    const { visible, confirmLoading, title, width, props } =  modal
    return (
      <Modal
        {...props}
        title={title}
        width={width}
        visible={visible}
        confirmLoading={confirmLoading}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <Form
          ref={this.formRef}
          initialValues={initialValues}
        >
          {renderFormItem(formItem, formData, { tab: tab.tabValue, addOrEdit })}
        </Form>
      </Modal>
    )
  }
}
