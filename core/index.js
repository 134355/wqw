import React, { Component } from 'react'
import { Row, Spin, message, Modal } from 'antd'
import { default as ExclamationCircleOutlined } from '@ant-design/icons/lib/icons/ExclamationCircleOutlined'
import ReAction from './ReAction'
import ReForm from './ReForm'
import ReTable from './ReTable'
import RePagination from './RePagination'
import KeyWordsSearch from './KeyWordsSearch'
import ReModal from './ReModal'
import ReTabs from './ReTabs'
import ReViewContext from './ReViewContext'
import { application, isFunction, deepClone } from './utils'
import '../src/common/index.scss'

const formRef = React.createRef()
const modalFormRef = React.createRef()

export default class ReView extends Component {
  constructor(props) {
    super(props)
    
    this.state = {
      loading: false,
      service: {},
      callback: {},
      addOrEdit: true,
      tab: {
        is: true,
        item: [],
        key: 'key',
        tab: 'tab',
        tabKey: 'type',
        tabValue: ''
      },
      data: [],
      table: {
        columns: [],
        action: {
          is: true,
          title: '操作',
          align: 'center',
          item: ['edit', 'del']
        },
        rowKey: 'id'
      },
      selectedRowKeys: [],
      clearRowKey: false,
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
          item: ['reset', 'search']
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
        ['form'],
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
      const { keyWords, tab } = this.state
      const { tabKey, tabValue } = tab
      const keyWordsData = {
        [keyWords.name]: keyWords.value
      }
      if (!isFunction(list)) return console.error('service.list 请参考 service')
      const data = {
        page,
        pageSize,
        [tabKey]: tabValue,
        ...formData,
        ...keyWordsData
      }
      let newData
      if (isFunction(listBefore)) {
        newData = listBefore(data)
      }
      list(newData).then((res) => {
        let newRes = res
        if (isFunction(listAfter)) {
          newRes = listAfter(res)
        }
        this.setState((state) => ({
          data: newRes.list,
          pagination: {
            ...state.pagination,
            total: newRes.total
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
    const { service: { del }, selectedRowKeys, clearRowKey } = this.state
    if (!isFunction(del)) return console.error('service.del 请参考 service')
     const modal = Modal.confirm({
      title: '温馨提示',
      icon: <ExclamationCircleOutlined />,
      content: '您确定要删除选中数据？',
      okText: '确定',
      cancelText: '取消',
      onOk: (close) => {
        modal.update({
          okButtonProps: {
            loading: true
          }
        })
        del(row.id).then(() => {
          message.success('删除成功')
          if (clearRowKey) {
            this.setState({
              selectedRowKeys: [],
              clearRowKey: false
            })
          } else {
            const rowKeys = deepClone(selectedRowKeys)
            if (rowKeys.includes(row.id)) {
              const index = rowKeys.indexOf(row.id)
              if (index !== -1) {
                rowKeys.splice(index, 1)
                this.setState({
                  selectedRowKeys: rowKeys
                })
              }
            }
          }
          this.getTableData()
        }).finally(() => {
          close()
        })
      }
    })
  }

  handleResetModalForm = () => {
    modalFormRef.current.handleResetFields()
  }

  handleSetFieldsValue = (data) => {
    modalFormRef.current.handleSetFieldsValue(data)
  }
  
  renderLayout = (item, key) => {
    if (isFunction(item)) {
      return (
        <div key={key}>{item()}</div>
      )
    }
    switch (item) {
      case 'action':
        return <ReAction key={key} />
      case 'form':
        return <ReForm ref={formRef} key={key} />
      case 'table':
        return <ReTable key={key} />
      case 'pagination':
        return <RePagination key={key} />
      case 'keyWords':
        return <KeyWordsSearch key={key} />
      case 'placeholder':
        return <div className="flex-1" key={key}></div>
    }
  }

  render() {
    const { layout, loading, isDone } = this.state
    return (
      <div className={this.state.tab.is ? 're-view re-view-no-pt' : 're-view'}>
        <ReViewContext.Provider value={this}>
          {
            isDone && (
              <Spin spinning={loading}>
                {this.state.tab.is && <ReTabs />}
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