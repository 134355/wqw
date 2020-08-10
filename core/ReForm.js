import React, { Component } from 'react'
import { Form, Button } from 'antd'
import ReViewContext from './ReViewContext'
import { renderFormItem, isFunction } from './utils'

class ReForm extends Component {
  constructor(props) {
    super(props)
    this.formRef = React.createRef()
  }

  static contextType = ReViewContext

  componentWillMount () {
    console.log(1)
    this.context.setState(state => ({
      searchForm: {
        ...state.searchForm,
        formData: this.getFieldsValue()
      }
    }))
  }

  handleReset = () => {
    this.formRef.current.resetFields()
    this.context.getTableData()
  }

  getFieldsValue = () => {
    return this.formRef.current.getFieldsValue()
  }

  renderBtn = (action) => {
    if (!action.is) return
    if(isFunction(action.render)) {
      return action.render({
        getTableData: this.context.getTableData,
        reset: this.handleReset
      })
    }
    const el = action.item.map((item, key) => {
      switch (item) {
        case 'search':
          return (
            <Button type="primary" onClick={this.context.getTableData} key={key}>
              查询
            </Button>
          )
        case 'reset':
          return (
            <Button className="m-left-10" onClick={this.handleReset} key={key}>
              重置
            </Button>
          )
      }
    })
    return (
      <Form.Item>
        {el}
      </Form.Item>
    )
  }

  handleForceUpdate = (_, data) => {
    this.context.setState(state => ({
      searchForm: {
        ...state.searchForm,
        formData: {
          ...state.searchForm.formData,
          ...data
        }
      }
    }))
  }

  handleSetFieldsValue = (data) => {
    console.log(11111)
    if (this.formRef.current) {
      this.formRef.current.setFieldsValue(data)
    }
  }

  render () {
    const { formItem, action, initialValues, formData } = this.context.state.searchForm
    this.handleSetFieldsValue(formData)
    return (
      <Form
        ref={this.formRef}
        layout="inline"
        initialValues={initialValues}
        onValuesChange={this.handleForceUpdate}
      >
        {renderFormItem(formItem, formData, this.handleForceUpdate)}
        {this.renderBtn(action)}
      </Form>
    )
  }
}

export default ReForm
