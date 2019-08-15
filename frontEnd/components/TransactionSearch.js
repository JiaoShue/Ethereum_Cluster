import { Card, Input, message } from 'antd';
import React, { useState } from 'react';
import { getTransaction } from '../apis';
import { SearchTransactionInfo } from './SearchTransactionInfo';

export const TransactionSearch = () => {
  const [transactionInfo, setTransactionInfo] = useState({});
  const [searchValue, setSearchValue] = useState('');
  return (
    <Card title={<h3>交易自主查询</h3>} style={{
      marginBottom: 16
    }}>
      <Input.Search
        style={{
          marginBottom: 16
        }}
        placeholder={'请输入交易编号'}
        enterButton={'搜索'}
        value={searchValue}
        onChange={({ target: { value } }) => setSearchValue(value)}
        onSearch={async () => {
          const rst = await (await getTransaction(searchValue)).json();
          if (rst.status === 'success') {
            message.success('搜索成功!');
            setTransactionInfo(rst.data);
          } else {
            message.error('搜索失败!');
          }
        }}
      />
      {transactionInfo.hash && <SearchTransactionInfo transactionInfo={ transactionInfo }/>}
    </Card>
  );
};
