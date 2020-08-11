import React, {Component} from 'react'
import { Pagination } from 'antd'
import ReViewContext from './ReViewContext'

export default class RePagination extends Component {
  constructor(props) {
    super(props)
  }

  handleChange = (self, page, pageSize) => {
    self.setState((state) => ({
      pagination: {
        ...state.pagination,
        current: page,
        pageSize
      }
    }), () => {
      self.getTableData()
    })
  }

  render () {
    return (
      <ReViewContext.Consumer>
        {(self) => {
          const { pagination } = self.state
          return (
            <Pagination
              className="re-pagination"
              {...pagination}
              onChange={(page, pageSize) => {
                this.handleChange(self, page, pageSize)
              }}
            />
          )
        }}
      </ReViewContext.Consumer>
    )
  }
}
