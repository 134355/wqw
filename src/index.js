import React from 'react'
import ReactDom from 'react-dom'
import moment from 'moment'
import ReView from '../core/index'
import { Input, Select, Tag, Switch, Popconfirm, message } from 'antd'
import ReDatePicker from '../core/ReDatePicker'
import { formatImage } from '../utils'
import {
  getInternalConsts,
  getBannerList,
  getBannerListOptions,
  getRuleListOptions,
  setApprove,
  createBanner,
  deleteAppBanner
} from '../api'

const { ReRangePicker } = ReDatePicker

import 'antd/dist/antd.css'

const viewRef = React.createRef()

const idList = [2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13]
const adList = []
const ruleList = []
const jumpType = [
  {
    id: 1,
    name: '不跳转',
  },
  {
    id: 2,
    name: '观点',
  },
  {
    id: 3,
    name: '视频直播间',
  },
  {
    id: 4,
    name: 'URL链接H5',
  },
  {
    id: 5,
    name: '投教课程宣传页',
  },
  {
    id: 6,
    name: '经点股声音频专辑',
  },
  {
    id: 7,
    name: '经点股声音频详情',
  },
  {
    id: 8,
    name: '微信小程序',
  },
  {
    id: 9,
    name: '券商开户',
  },
  {
    id: 10,
    name: '录播回放',
  },
  {
    id: 11,
    name: '精品课程详情页',
  },
  {
    id: 12,
    name: '经选内参策略文章',
  },
  {
    id: 13,
    name: '经选内参专题',
  },
]

function getTabList () {
  return new Promise((resolve, reject) => {
    getInternalConsts({
      paths: ['common.banner.show_types']
    }).then(res => {
      const data = res.response.data['common.banner.show_types']
      const list = []
      Object.keys(data).forEach((key) => {
        list.push({
          name: data[key],
          id: key
        })
      })
      resolve({ list })
    })
  })
}

getBannerListOptions().then(res => {
  const data = res.options
  Object.keys(data).forEach(key => {
    adList.push({
      label: data[key],
      value: key
    })
  })
})

getRuleListOptions().then(res => {
  if (res.code === 1) {
    const data = res.response.options
    Object.keys(data).forEach(key => {
      ruleList.push({
        label: data[key],
        value: key
      })
    })
  }
})

const Demo  = () => {
  function handleLoad(app) {
    app
      .set('service', {
        list: getBannerList,
        add: createBanner,
        del: deleteAppBanner
      })
      .set('callback', {
        listBefore: (data) => {
          return {
            scene: 1,
            ...data
          }
        },
        listAfter: (data) => {
          return {
            list: data.data,
            total: data.total
          }
        }
      })
      .set('tab', {
        service: getTabList,
        key: 'id',
        tab: 'name',
        tabValue: '1',
        tabKey: 'show_type'
      })
      .set('table', {
        columns: [
          { title: 'ID', dataIndex: 'id' },
          { title: '标题', dataIndex: 'title', width: '200px' },
          { title: '跳转方式', width: '200px',
            render(row) {
              const data = jumpType.filter(item => item.id === row.jump_type)[0] || {}
              return data.name
            },
          },
          { title: '跳转地址', width: '200px',
            render: (row) => {
              let jump_url = ''
              if (idList.includes(row.jump_type)) {
                jump_url = row.jump_params.id
              } else {
                jump_url = row.jump_params.url
              }
              return jump_url
            }
          },
          { title: '广告位', width: '150px',
            render(row) {
              const data = adList.filter(item => +item.value === row.position_id)[0] || {}
              return data.label
            }
          },
          { title: '推送用户',
            render(row) {
              return row.rules.map(item => <Tag key={item.id}>{item.name}</Tag>)
            }
          },
          {
            title: '预览图',
            dataIndex: 'show_content',
            render: (text, _, __, c) => {
              if (+c === 2) {
                return text
              }
              return <img src={formatImage(text, 100, 100, 1)} alt="" />
            }
          },
          { title: '开始时间', dataIndex: 'valid_start_time' },
          { title: '结束时间', dataIndex: 'valid_end_time' },
          { title: '是否过期',
            render(row) {
              const isExpired = !moment(new Date()).isBefore(row.valid_end_time)
              return (
                <span>
                  <Tag color={isExpired ? 'red' : 'green'}>{isExpired ? '已过期' : '未过期'}</Tag>
                </span>
              )
            }
          },
          { title: '审核时是否显示',
            render: (row) => (
              <Popconfirm
                title={
                  !!Number(row.is_hide_when_ios_approve) && moment(new Date()).isBefore(row.valid_end_time)
                    ? '是否取消显示？'
                    : '是否显示？'
                }
                onConfirm={() => {
                  const isExpired = !moment(new Date()).isBefore(row.valid_end_time)
                  if (isExpired) {
                    return message.warning('广告已到期，如需重新显示，请更改广告结束时间~', 3)
                  }
                  return setApprove({
                    id: row.id,
                    is_hide: +row.is_hide_when_ios_approve === 1 ? 0 : 1,
                  }).then(({ code, msg }) => {
                    if (code === 1) {
                      viewRef.current.getTableData()
                    } else {
                      message.warning(msg)
                    }
                  })
                }}
              >
                <Switch
                  checked={!!Number(row.is_hide_when_ios_approve) && moment(new Date()).isBefore(row.valid_end_time)}
                />
              </Popconfirm>
            )
          },
          { width: '100px', title: '展示量',
            tooltip: {
              content: '展示量为广告显示次数，一般为页面访问量，若为滚动广告，则需要具体到每个广告显示次数。例：首页滚动广告'
            },
            render(row) {
              return row.counts.show
            }
          },
          { title: '点击量',
            render(row) {
              return row.counts.click
            }
          },
          { title: '点击人数',
            render(row) {
              return row.counts.click_users
            }
          },
        ],
        action: {
          width: '150px'
        }
      })
      .set('searchForm', {
        formItem: [
          {
            label: '广告位',
            name: 'position_id',
            component: Select,
            props: {
              placeholder: '请选择',
              style: { width: '130px'},
            },
            options: adList
          },
          {
            label: '跳转类型',
            name: 'jump_type',
            component: Select,
            props: {
              placeholder: '请选择',
              style: { width: '130px'},
            },
            options: jumpType,
            dataDict: {
              label: 'name',
              value: 'id'
            }
          },
          {
            label: '标题',
            name: 'title',
            component: Input,
            props: {
              placeholder: '输入关键字查询',
            },
          }
        ]
      })
      .set('modalForm', {
        layout: {
          labelCol: { span: 6 },
          wrapperCol: { span: 17 }
        },
        formItem: [
          {
            label: '广告位',
            name: 'position_id',
            component: Select,
            props: {
              placeholder: '请选择广告位',
              style: { width: '100%' },
            },
            options: adList,
            rules: [{ required: true, message: '请选择广告位' }]
          },
          {
            label: '推送用户',
            name: 'rule_ids',
            component: Select,
            props: {
              placeholder: '请选择推送用户',
              style: { width: '100%' },
            },
            options: ruleList
          },
          {
            label: '广告标题',
            name: 'title',
            component: Input,
            props: {
              placeholder: '请输入广告标题',
              style: { width: '100%' },
            },
            rules: [{ required: true, message: '请输入广告标题' }]
          },
          {
            label: '跳转类型',
            name: 'jump_type',
            component: Select,
            props: {
              placeholder: '请选择跳转类型',
              style: {  width: '100%' },
            },
            options: jumpType,
            dataDict: {
              label: 'name',
              value: 'id'
            },
            rules: [{ required: true, message: '请选择跳转类型' }]
          },
          {
            label: '跳转地址',
            name: 'jump_url',
            component: Input,
            props: {
              placeholder: '请输入跳转地址',
              style: {  width: '100%' },
            },
            rules: [{ required: true, message: '请选择跳转类型' }]
          },
          {
            label: '广告时间',
            name: 'valid_start_time$$valid_end_time',
            component: ReRangePicker,
            props: {
              valueFormat: 'YYYY-MM-DD',
              placeholder: ['请选择开始时间', '请选择结束时间'],
              style: {  width: '100%' },
            },
            rules: [{ required: true, message: '请选择开始和结束时间' }]
          },
          {
            label: '审核时是否显示',
            name: 'is_hide_when_ios_approve',
            component: Switch,
            fiprops: { valuePropName: 'checked' },
          },
          {
            label: '是否显示',
            name: 'is_valid',
            component: Switch,
            fiprops: { valuePropName: 'checked' },
          }
        ]
      })
      .set('action', ['add'])
      .set('layout', [
        ['action', 'placeholder', 'form'],
        ['table'],
        ['placeholder', 'pagination'],
      ])
      .done()
  } 
  return (
    <div>
      <ReView onLoad={handleLoad} ref={viewRef} />
    </div>
  )
}

ReactDom.render(<Demo />, document.getElementById('root'))
