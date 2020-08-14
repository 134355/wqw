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

  handleReset = () => {
    this.formRef.current.resetFields()
    this.context.getTableDataf()
  }

  getFieldsValue = () => {
    return this.formRef.current.getFieldsValue()
  }

  renderBtn = (action) => {
    if (!action.is) return
    if(isFunction(action.render)) {
      return action.render({
        getTableData: this.context.getTableDataf,
        reset: this.handleReset
      })
    }
    const el = action.item.map((item, key) => {
      switch (item) {
        case 'search':
          return (
            <Button type="primary" onClick={this.context.getTableDataf} key={key}>
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
    const { addOrEdit, searchForm, tab } = this.context.state
    const { formItem, action, formData, defaultData } = searchForm
    return (
      <Form
        ref={this.formRef}
        layout="inline"
        initialValues={defaultData}
        onValuesChange={this.handleForceUpdate}
      >
        {renderFormItem({ formItem, formData, tab: tab.tabValue, addOrEdit })}
        {this.renderBtn(action)}
      </Form>
    )
  }
}

export default ReForm
