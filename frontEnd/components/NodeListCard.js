import { Card, Empty, Table, Tag } from 'antd';
import React from 'react';

export const NodeListCard = (props) => {
  const columns = [{
    title: '节点名称',
    dataIndex: 'name',
    key: 'name',
    width: 100,
    fixed: 'left',
  }, {
    title: '节点类型',
    dataIndex: 'type',
    key: 'type',
    width: 100,
    fixed: 'left',
    render: (text) => {
      return <Tag color={text === 'master' ? '#4475ff' : '#42d48c'}>{text}</Tag>;
    }
  }, {
    title: 'P2P节点url',
    dataIndex: 'nodeAddr',
    key: 'nodeAddr'
  }, {
    title: '节点IP',
    dataIndex: 'ip',
    key: 'ip',
    width: 100,
    fixed: 'right',
  }
  ];
  const data = props.NodeList;
  const dataSource = data.map((value) => {
    return {
      name: value[0],
      type: value[0].split('_')[2] === '0' ? 'master' : 'slaver',
      ip: value[1].ip,
      nodeAddr: value[1].peers.filter(p => p.node_name === value[0])[0] ? value[1].peers.filter(p => p.node_name === value[0])[0].node_addr : 'Null'
    };
  });
  return (
    <Card
      style={{
        marginBottom: 16
      }}
      title={<h3>节点情况概览</h3>}
      bodyStyle={{
        padding: 15
      }}>
      <Table
        columns={columns}
        dataSource={dataSource}
        scroll={{x: 1500}}
        locale={{
          emptyText: <Empty/>
        }}/>
    </Card>);
};

