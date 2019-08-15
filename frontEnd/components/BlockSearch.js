import { Card, Input, message } from 'antd';
import React, { useState } from 'react';
import { getBlockInfo } from '../apis';
import { SearchBlockInfo } from './SearchBlockInfo';

export const BlockSearch = () => {
  const [blockInfo, setBlockInfo] = useState({});
  const [searchValue, setSearchValue] = useState('');
  return (
    <Card title={<h3>区块自主查询</h3>} style={{
      marginBottom: 16
    }}>
      <Input.Search
        style={{
          marginBottom: 16
        }}
        placeholder={'请输入区块编号/哈希'}
        enterButton={'搜索'}
        value={searchValue}
        onChange={({ target: { value } }) => setSearchValue(value)}
        onSearch={async () => {
          const rst = await (await getBlockInfo(searchValue)).json();
          if (rst.status === 'success') {
            message.success('搜索成功!');
            setBlockInfo(rst.data);
          } else {
            message.error('搜索失败!');
          }
        }}
      />
      {blockInfo.number && <SearchBlockInfo BlockInfo={{ blocks: [blockInfo], number: blockInfo.number }}/>}
    </Card>
  );
};
