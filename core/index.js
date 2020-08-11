import React, { Component } from 'react'
import { Row, Spin, message } from 'antd'

import ReAction from './ReAction'
import ReForm from './ReForm'
import ReTable from './ReTable'
import RePagination from './RePagination'
import KeyWordsSearch from './KeyWordsSearch'
import ReModal from './ReModal'
import ReViewContext from './ReViewContext'
import { application, isFunction } from './utils'
const formRef = React.createRef()
const modalFormRef = React.createRef()

export default class ReView extends Component {
  constructor(props) {
    super(props)
    
    this.state = {
      service: {},
      callback: {},
      ids: '',
      addOrEdit: true,
      data: [],
      table: {
        columns: [],
        action: {
          is: true,
          title: '操作',
          align: 'center',
          item: ['edit', 'del']
        },
        rowSelection: {
          type: 'checkbox',
          onChange: (selectedRowKeys, selectedRows) => {
            console.log(selectedRowKeys)
            this.setState({
              ids: selectedRowKeys.join()
            })
          }
        },
        rowKey: 'id'
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
      modalForm: {
        modal: {
          title: 'modal',
          visible: false,
          confirmLoading: false,
          width: 520,
          props: {}
        },
        layout: 'inline',
        initialValues: {},
        formItem: [],
        formData: {}
      },
      action: ['add', 'del'],
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
      const { listBefore, listAfter } = this.state.callback
      const { current: page, pageSize } = this.state.pagination
      const { keyWords } = this.state
      const keyWordsData = {
        [keyWords.name]: keyWords.value
      }
      if (!isFunction(list)) return console.error('service.list 请参考 service')
      const data = {
        ...formData,
        page,
        pageSize,
        ...keyWordsData
      }
      if (isFunction(listBefore)) listBefore(data)
      list(data).then((res) => {
        this.setState((state) => ({
          data: res.list,
          pagination: {
            ...state.pagination,
            total: res.total
          }
        }))
        if (isFunction(listAfter)) listAfter(res)
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

  handleResetModalForm = () => {
    modalFormRef.current.handleResetFields()
  }

  handleSetFieldsValue = (data) => {
    modalFormRef.current.handleSetFieldsValue(data)
  }
  
  renderLayout = (item, key) => {
    switch (item) {
      case 'action':
        return <ReAction key={key}/>
      case 'form':
        return <ReForm ref={formRef} key={key}/>
      case 'table':
        return <ReTable key={key}/>
      case 'pagination':
        return <RePagination key={key}/>
      case 'keyWords':
        return <KeyWordsSearch key={key}/>
      case 'placeholder':
        return <div className="flex-1" key={key}></div>
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
                <ReModal ref={modalFormRef} />
              </Spin>
            )
          }
        </ReViewContext.Provider>
      </div>
    )
  }
}