import { Alert, Card, Empty, List, Popconfirm, Table, Tag, Tooltip } from 'antd';
import React from 'react';
import { dropContract } from '../apis';

export const ContractListCard = (props) => {
  const [expandedRowKeys, setRowKeys] = React.useState([]);
  const onConfirm = async (name) => {
    let rst;
    try {
      rst = (await (await dropContract(name)).json());
    } catch (err) {
      console.log(err);
      rst = { status: 'error' };
    }
    if (rst.status === 'success') {
      props.setMsg([...props.msgList, '[no_ansi]<span style="color:#42d48c">移除合约文件成功!</span>', '等待下一步操作...']);
    } else {
      props.setMsg([...props.msgList, '[no_ansi]<span style="color:#ae2639">移除合约文件失败!</span>', `原因: ${rst.data}`, '等待下一步操作...']);
    }
  };
  const innerColumns = [
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (text) => {
        return (
          <Tooltip title={text}>
            <Tag color="#4475FF">
              {text[0].toUpperCase()}
            </Tag>
          </Tooltip>
        );
      }
    },
    {
      title: '方法名',
      dataIndex: 'method',
      key: 'method'
    },
    {
      title: '调用方式',
      dataIndex: 'type',
      key: 'call_type',
      render: (text, record) => {
        return (
          <Tag>{text === 'function' ? record.constant ? 'send' : 'call' : 'null'}</Tag>
        );
      }
    }
  ];
  const apiTable = ({ abi: props, address, position, TxHash }) => {
    const paramsList = (props) => {
      console.log(props);
      return (
        <React.Fragment>
          <List
            dataSource={props.inputs}
            renderItem={(item, index) => (
              <List.Item.Meta
                title={`参数名: ${item.name || '无'}`}
                description={`参数类型 ${item.type}`}
              />
            )}
          />
        </React.Fragment>
      );
    };

    const dataSource = JSON.parse(props).map(p => ({
      ...p,
      method: p.name,
      type: p.type,
      inputs: p.inputs,
      outputs: p.type === 'function' ? p.outputs : []
    }));
    return (
      <div style={{
        overflow: 'scroll'
      }}>
        <Alert message={`部署地址: ${address}`} banner type="success" />
        <Alert message={`区块位置: ${position}`} banner type="success"/>
        <Alert message={<span style={{width: 300, overflowWrap: 'break-all', wordBreak: 'break-all'}}>{`交易哈希: ${TxHash}`}</span>} banner type="success"/>
        <Table
          scroll={{ x: true }}
          columns={innerColumns}
          dataSource={dataSource}
          expandRowByClick={true}
          expandedRowRender={record => paramsList(record)}
          pagination={false}
        />
      </div>
    );
  };
  const columns = [
    {
      title: '合约名',
      dataIndex: 'name',
      key: 'name',
      width: 80
    },
    {
      title: '部署状态',
      dataIndex: 'hasDeployed',
      key: 'hasDeployed',
      width: 80,
      render: (record) => {
        return <Tag color={record ? '#587dff' : '#bfbfbf'}>{record ? '已部署' : '未部署'}</Tag>;
      }
    }, {
      title: '获取api',
      dataIndex: 'api',
      key: 'api',
      width: 80,
      render: (text, record, index) => {
        return (
          <Tag color="green" onClick={() => {
            if (expandedRowKeys.includes(index)) {
              setRowKeys([...expandedRowKeys.filter(v => v !== index)]);
            } else {
              setRowKeys([...expandedRowKeys, index]);
            }
          }}>
            获取api
          </Tag>
        );
      }
    },
    {
      title: '源文件',
      dataIndex: 'hasRaw',
      key: 'hasRaw',
      width: 80,
      render: (text) => {
        return (
          <Tag color={text ? '#42d48c' : '#ffad36'}>
            {
              text ? 'EXIST' : 'NONE'
            }
          </Tag>
        );
      }
    },
    {
      title: '移除合约',
      key: 'remove',
      width: 80,
      render: (text, record) => {
        return (
          <Tooltip
            placement={'left'}
            title="移除合约只会移除服务器上的合约文件, 但不会丢失链上已部署的合约, 但上传新的同名合约后将会丢失与原合约的链接, 操作前请先保存好abi和compiled的备份!">
            <Popconfirm title={'确认移除当前合约文件吗?'} placement="topLeft" onConfirm={() => onConfirm(record.name)} okText="确认"
                        cancelText="取消">
              <Tag color="#f50">
                确认移除
              </Tag>
            </Popconfirm>
          </Tooltip>
        );
      }
    }
  ];
  return (
    <Card
      title={<h3>智能合约概览</h3>}
      bodyStyle={{
        padding: 15
      }}
      style={{
        marginBottom: 16
      }}
    >
      <Table
        style={{
          width: '100%',
        }}
        scroll={{ x: true }}
        dataSource={props.ContractList}
        columns={columns}
        expandIconAsCell={false}
        expandIconColumnIndex={-1}
        expandedRowKeys={expandedRowKeys}
        expandedRowRender={record => <div style={{ margin: 0 }}>{record.abi ? apiTable(record) : '请先部署合约'}</div>}
        locale={{
          emptyText: <Empty/>
        }}/>
    </Card>
  );
};
