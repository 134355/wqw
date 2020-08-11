import React, {Component} from 'react'
import { Tabs } from 'antd'
import ReViewContext from './ReViewContext'
import { isFunction } from './utils'

const { TabPane } = Tabs

export default class ReTabs extends Component {
  constructor(props) {
    super(props)
  }

  static contextType = ReViewContext

  componentDidMount () {
    const { service } = this.context.state.tab
    if (isFunction(service)) {
      service().then(res => {
        this.context.setState(state => ({
          tab: {
            ...state.tab,
            item: res.list
          }
        }))
      })
    }
  }

  handleChange = (e) => {
    this.context.setState(state => ({
      tab: {
        ...state.tab,
        tabValue: e
      }
    }), () => {
      this.context.getTableData()
    })
  }

  renderTabPane = () => {
    const { item, key, tab } = this.context.state.tab
    return item.map(e => {
      return (
        <TabPane key={e[key]} tab={e[tab]} />
      )
    })
  }

  render () {
    return (
      <Tabs onChange={this.handleChange}>
        {this.renderTabPane()}        
      </Tabs>
    )
  }
}
