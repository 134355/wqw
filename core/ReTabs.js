import React, {Component} from 'react'
import { Tabs } from 'antd'
import ReViewContext from './ReViewContext'

const { TabPane } = Tabs

export default class ReTabs extends Component {
  constructor(props) {
    super(props)
  }

  static contextType = ReViewContext

  handleChange = (e) => {
    console.log(e)
  }

  renderTabPane = (tab) => {
    return tab.map(item => {
      return (
        <TabPane {...item} />
      )
    })
  }

  render () {
    const { tab } = this.context.state
    return (
      <Tabs onChange={this.handleChange}>
        {this.renderTabPane(tab.item)}        
      </Tabs>
    )
  }
}
