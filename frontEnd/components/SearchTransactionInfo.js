import React from 'react';
import { PageHeader, Tooltip } from 'antd';

export const SearchTransactionInfo = (props) => {
  const Transaction = props.transactionInfo;
  const Description = (props) => (
    <React.Fragment>
      <Tooltip title={props.tips || null}>
        <h4 style={{
          marginTop: 10,
          cursor: 'pointer'
        }}>{props.title}</h4>

        <span style={{
          overflowWrap: 'break-word',
          color: '#0199ff'
        }}>{props.value || '暂无数据'}</span>
      </Tooltip>
    </React.Fragment>
  );
  return (
    <PageHeader title={'交易信息'} style={{ paddingLeft: 0, paddingRight: 0 }}>
        <Description title="交易哈希" value={Transaction.hash} />
        <Description title="发起用户" value={Transaction.from || "无"} />
        <Description title="接收用户" value={Transaction.to || "无"} />
        <Description title="转账金额（ether）" value={Transaction.value/(10**18) || 0} />
        <Description title="gas单价（wei）" value={Transaction.gasPrice || 0} />
        <Description title="gas总数" value={Transaction.gas || 0} />
        <Description title="手续费(ether)" value={(Transaction.gas * Transaction.gasPrice)/(10**18) || 0} />
        <Description title="所在区块" value={Transaction.blockNumber || ""} />
        <Description title="所在区块哈希" value={Transaction.blockHash || ""} />
        <Description title="交易在区块中的序号" value={Transaction.transactionIndex || ""} />
        <Description title="发起方发起过交易的次数" value={Transaction.nonce || 0} />
        <Description title="交易输入" value={Transaction.input || ""} />
    </PageHeader>
  );
};
