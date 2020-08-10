import React from 'react';
import ReactDom from 'react-dom';
import ReView from '../core/index'
import { Input, Select, Switch, DatePicker, Cascader, Tag } from 'antd'

import 'antd/dist/antd.css';
import './common/index.scss'
const viewRef = React.createRef()
const Demo  = () => {
  const data = [
    {
      key: '1',
      name: 'John Brown',
      age: 32,
      address: 'New York No. 1 Lake Park',
      tags: ['nice', 'developer'],
    },
    {
      key: '2',
      name: 'Jim Green',
      age: 42,
      address: 'London No. 1 Lake Park',
      tags: ['loser'],
    },
    {
      key: '3',
      name: 'Joe Black',
      age: 32,
      address: 'Sidney No. 1 Lake Park',
      tags: ['cool', 'teacher'],
    },
  ];
  const list = (e) => {
    console.log(e)
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({ list: [...data], total: 97 })
      }, 1000)
    })
  }

  const slist = (e) => {
    console.log('slist')
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

  function handleLoad(app) {
    app
      .set('service', {
        list: list,
        del: list
      })
      .set('table', {
        columns: [
          {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <a>{text}</a>,
          },
          {
            title: 'Age',
            dataIndex: 'age',
            key: 'age',
          },
          {
            title: 'Address',
            dataIndex: 'address',
            key: 'address',
          },
          {
            title: 'Tags',
            key: 'tags',
            dataIndex: 'tags',
            render: (tags) => (
              <>
                {tags.map(tag => {
                  let color = tag.length > 5 ? 'geekblue' : 'green';
                  if (tag === 'loser') {
                    color = 'volcano';
                  }
                  return (
                    <Tag color={color} key={tag}>
                      {tag.toUpperCase()}
                    </Tag>
                  );
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
            },
            link (e) {
              console.log(e)
              return e.username === 'add'
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
              onChange: (e, f) => {
                viewRef.current.getTableData()
              }
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
            component: DatePicker
          },
        ],
        initialValues: {
          username: 'ad'
        }
      })
      .set('keyWords', {
        value: 'username'
      })
      .done()
  } 
  return <div>
    <ReView onLoad={handleLoad} ref={viewRef}/>
  </div>
}

ReactDom.render(<Demo />, document.getElementById('root'));
