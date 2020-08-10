import React, { Component } from 'react'
import { Row, Spin, message } from 'antd'

import Action from './Action'
import ReForm from './ReForm'
import ReTable from './ReTable'
import RePagination from './RePagination'
import KeyWordsSearch from './KeyWordsSearch'
import ReModal from './ReModal'
import ReViewContext from './ReViewContext'
import { application, isFunction } from './utils'
const formRef = React.createRef()

export default class ReView extends Component {
  constructor(props) {
    super(props)
    
    this.state = {
      service: {},
      data: [],
      table: {
        columns: [],
        action: {
          is: true,
          title: '操作',
          align: 'center',
          item: ['update', 'del']
        }
      },
      loading: false,
      pagination: {
        total: 0,
        current: 1,
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
        pageSizeOptions: [10, 20, 30, 50],
        showTotal: total => `共 ${total} 条`,
      },
      keyWords: {
        name: 'keyWords',
        value: '',
        placeholder: '输入关键字查询',
        style: { width: '270px' }
      },
      searchForm: {
        layout: 'inline',
        initialValues: {},
        formItem: [],
        formData: {},
        action: {
          is: true,
          item: ['search', 'reset']
        }
      },
      modal: {
        title: 'modal',
        visible: false,
        confirmLoading: false,
      },
      layout: [
        ['action', 'placeholder', 'keyWords'],
        ['placeholder', 'form'],
        ['table'],
        ['placeholder', 'pagination'],
      ],
      isDone: false
    }
  }
  componentDidMount () {
    const { onLoad } = this.props
    onLoad(application(this))
  }
  
  getTableData = () => {
    this.setState({
      loading: true
    })
    setTimeout(() => {
      let formData = {}
      if (formRef.current) {
        formData = formRef.current.getFieldsValue()
      }
      const { list } = this.state.service
      const { current: page, pageSize } = this.state.pagination
      const { keyWords } = this.state
      const keyWordsData = {
        [keyWords.name]: keyWords.value
      }
      if (!isFunction(list)) return console.error('service.list 请参考 service')
      list({
        ...formData,
        page,
        pageSize,
        ...keyWordsData
      }).then((res) => {
        this.setState((state) => ({
          data: res.list,
          pagination: {
            ...state.pagination,
            total: res.total
          }
        }))
      }).finally(() => {
        this.setState({
          loading: false
        })
      })
    })
  }

  handleDel = (row) => {
    const { del } = this.state.service
    if (!isFunction(del)) return console.error('service.del 请参考 service')
    del(row.id).then(() => {
      message.success('删除成功')
      this.getTableData()
    })
  }
  
  renderLayout = (item, index) => {
    switch (item) {
      case 'action':
        return <Action key={index}/>
      case 'form':
        return <ReForm ref={formRef} key={index}/>
      case 'table':
        return <ReTable key={index}/>
      case 'pagination':
        return <RePagination key={index}/>
      case 'keyWords':
        return <KeyWordsSearch key={index}/>
      case 'placeholder':
        return <div className="flex-1" key={index}></div>
    }
  }
  render() {
    const { layout, loading, isDone } = this.state
    return (
      <div className="re-view">
        <ReViewContext.Provider value={this}>
          {
            isDone && (
              <Spin spinning={loading}>
                {layout.map((item, index) => {
                  return (
                    <Row key={index} className={{'m-top-15': index !== 0}}>
                      {item.map(this.renderLayout)}
                    </Row>
                  )
                })}
                <ReModal />
              </Spin>
            )
          }
        </ReViewContext.Provider>
      </div>
    )
  }
}