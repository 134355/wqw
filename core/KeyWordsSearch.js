import React, {Component} from 'react'
import { Form, Input } from 'antd'
import ReViewContext from './ReViewContext'

const { Search } = Input

export default class KeyWordsSearch extends Component {
  constructor(props) {
    super(props)
  }

  static contextType = ReViewContext

  handleSearch = (value) => {
    this.context.setState(state => ({
      keyWords: {
        ...state.keyWords,
        value
      }
    }))
    this.context.getTableData()
  }

  render () {
    const { name, value, placeholder, style } = this.context.state.keyWords
    return (
      <Form
        layout="inline"
        initialValues={{
          [name]: value
        }}
      >
        <Form.Item name={name}>
          <Search
            allowClear
            placeholder={placeholder}
            onSearch={this.handleSearch}
            style={style}
          />
        </Form.Item>
      </Form>
    )
  }
}
