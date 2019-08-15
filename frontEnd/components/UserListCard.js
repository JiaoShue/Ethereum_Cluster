import { Card, Table, Tag } from 'antd';
import React from 'react';

export const UserListCard = (props) => {
  const columns = [
    {
      title: '账户地址',
      key: 'address',
      dataIndex: 'address'
    },
    {
      title: '账户类型',
      key: 'status',
      dataIndex: 'status',
      render: (text) => <Tag color={text === 'signer' ? '#42d48c' : '#3fc0ff'}>{text}</Tag>
    }
  ];
  return (
    <Card title={<h3>链上用户信息</h3>} bodyStyle={{
      padding: 5
    }}>
      <Table columns={columns} dataSource={props.AccountList || []}/>
    </Card>
  )
};
