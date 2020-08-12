import React, { Component } from 'react'
import { Form, Button } from 'antd'
import { default as SearchOutlined } from '@ant-design/icons/lib/icons/SearchOutlined'
import { default as SyncOutlined } from '@ant-design/icons/lib/icons/SyncOutlined'
import ReViewContext from './ReViewContext'
import { renderFormItem, isFunction } from './utils'

class ReForm extends Component {
  constructor(props) {
    super(props)
    this.formRef = React.createRef()
  }

  static contextType = ReViewContext

  componentWillMount () {
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
              <SearchOutlined />
              查询
            </Button>
          )
        case 'reset':
          return (
            <Button onClick={this.handleReset} key={key}>
              <SyncOutlined />
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
    if (this.formRef.current) {
      this.formRef.current.setFieldsValue(data)
    }
  }

  render () {
    const { formItem, action, initialValues, formData } = this.context.state.searchForm
    return (
      <Form
        ref={this.formRef}
        layout="inline"
        initialValues={initialValues}
        onValuesChange={this.handleForceUpdate}
      >
        {renderFormItem(formItem, formData)}
        {this.renderBtn(action)}
      </Form>
    )
  }
}

export default ReForm
