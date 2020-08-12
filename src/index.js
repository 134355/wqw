import React from 'react'
import ReactDom from 'react-dom'
import ReView from '../core/index'
import { Input, Select, Switch, DatePicker, Cascader, Tag } from 'antd'
import ReDatePicker from '../core/ReDatePicker'

const { ReRangePicker } = ReDatePicker

import 'antd/dist/antd.css'

const viewRef = React.createRef()
const Demo  = () => {
  const data = [
    {
      id: 1,
      name: 'John Brown',
      age: 32,
      address: 'New York No. 1 Lake Park',
      tags: ['nice', 'developer'],
    },
    {
      id: 21,
      name: 'Jim Green',
      age: 42,
      address: 'London No. 1 Lake Park',
      tags: ['loser'],
    },
    {
      id: 32,
      name: 'Joe Black',
      age: 32,
      address: 'Sidney No. 1 Lake Park',
      tags: ['cool', 'teacher'],
    },
  ]
  const list = (e) => {
    console.log(e, '============ list add edit del service ==========')
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({ list: [...data], total: 97 })
      }, 1000)
    })
  }

  const slist = (e) => {
    console.log('============ form service ==========')
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({ list: [{
          label: 'a',
          value: 1
        }, {
          label: 'b',
          value: 2
        }]})
      }, 1000)
    })
  }
  const slists = (e) => {
    console.log('============ tab service ==========')
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({ list: [
          {
            id: 1,
            name: '图文广告'
          }, {
            id: 2,
            name: '文字广告'
          }
        ]})
      }, 2000)
    })
  }

  const onGenderChange = value => {
    console.log(value)
  }

  function handleLoad(app) {
    app
      .set('service', {
        list: list,
        del: list,
        add: list,
        edit: list
      })
      .set('callback', {
        listBefore: (data) => {
          console.log(data, '====== listBefore ======')
          return data
        },
        editBefore: (data) => {
          data.name = '123'
          return data
        },
        submitBefore: (data) => {
          return data
        }
      })
      .set('tab', {
        service: slists,
        key: 'id',
        tab: 'name',
        tabValue: ''
      })
      .set('table', {
        columns: [
          {
            type: 'checkbox'
          },
          {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <a>{text}</a>,
          },
          {
            dataIndex: 'age',
            key: 'age',
            tooltip: {
              title: 'Age',
              content: '年龄'
            }
          },
          {
            title: 'Address',
            dataIndex: 'address',
            key: 'address',
            hidden ({ tab }) {
              return tab == '1'
            }
          },
          {
            title: 'Tags',
            key: 'tags',
            dataIndex: 'tags',
            render: (tags) => (
              <>
                {tags.map(tag => {
                  let color = tag.length > 5 ? 'geekblue' : 'green'
                  if (tag === 'loser') {
                    color = 'volcano'
                  }
                  return (
                    <Tag color={color} key={tag}>
                      {tag.toUpperCase()}
                    </Tag>
                  )
                })}
              </>
            ),
          }
        ],
      })
      .set('searchForm', {
        formItem: [
          {
            label: '',
            name: 'username',
            component: Input,
            props: {
              placeholder: '用户名'
            }
          },
          {
            label: '',
            name: 'select',
            component: Select,
            service: slist,
            props: {
              placeholder: '请选择',
              style: { width: '110px'},
            },
            options: [
              { value: 1, label: '123' }
            ]
          },
          {
            name: 'switch',
            fiprops: {
              valuePropName: 'checked'
            },
            component: Switch
          },
          {
            name: 'datae',
            render () {
              return <DatePicker></DatePicker>
            }
          },
          {
            name: 'cascader',
            component: Cascader,
            props: {
              options: [
                {
                  value: 'zhejiang',
                  label: 'Zhejiang',
                  children: [
                    {
                      value: 'hangzhou',
                      label: 'Hangzhou',
                    }
                  ]
                }
              ]
            }
          },
          {
            name: 'date',
            component: DatePicker,
            props: {
              value: '2021-08-08',
              onChange: (value, dateString) => {
                console.log('Selected Time: ', value); 
                value = dateString
                console.log('Formatted Selected Time: ', dateString);
              }
            }
          },
          {
            name: 'render',
            render(h) {
              return (
                <Select
                  placeholder="Select a option and change input text above"
                  onChange={onGenderChange}
                  allowClear
                >
                  <Select.Option value="male">male</Select.Option>
                  <Select.Option value="female">female</Select.Option>
                  <Select.Option value="other">other</Select.Option>
                </Select>
              )
            },
          },
          {
            name: 'timestamp',
            component: ReDatePicker,
            props: {
              valueFormat: 'timestamp'
            }
          },
          {
            name: 'startData$$endDate',
            component: ReRangePicker
          }
        ],
        initialValues: {
          username: 'ad'
        }
      })
      .set('modalForm', {
        formItem: [
          {
            label: '用户名',
            name: 'name',
            component: Input,
            rules: [{required: true}],
            props: {
              placeholder: '请输入用户名'
            }
          },
        ]
      })
      .set('keyWords', {
        value: 'username'
      })
      .done()
  } 
  return (
    <div>
      <ReView onLoad={handleLoad} ref={viewRef} />
    </div>
  )
}

ReactDom.render(<Demo />, document.getElementById('root'))
