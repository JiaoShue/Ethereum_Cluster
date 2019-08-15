import { Card, Radio, Row, Input, Select, Tooltip, Button, PageHeader, Tag, Popconfirm, message } from 'antd';
import React, { useState } from 'react';
import { importPK, newAccount, newActiveAccount,sendTransaction, raiseNewSigner, setCoinBase, startMining, stopMining } from '../apis';

export const AccountControl = (props) => {
  const [inActiveAccount, setInActiveAccount] = useState({ privateKey: '', address: '' });
  const [importAccount, setImportAccount] = useState({ privateKey: '', password: '' });
  const [activeAccount, setActiveAccount] = useState({ password: '', address: '' });
  const [sourceAccount, setSourceAccount] = useState('');//useState参数为初始值，state所读为最新值，setState负责更新改变
  const [txPassword, setTxPassword] = useState('');
  const [distAccount, setDistAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [newSigner, setNewSigner] = useState('');
  const [newMiner, setNewMiner] = useState({
    node: '',
    address: ''
  });
  return (
    <Card title={<h3>节点&账户管理</h3>}>
      <Row>
        {props.NodeList.length ?
          (<div>
            <PageHeader
              title={'区块链运行状态'}
              tags={
                <Tag
                  color={props.isMining ? '#42d48c' : '#d2523d'}
                >
                  {props.isMining ? '挖矿中' : '未挖矿'}
                </Tag>}
              style={{ padding: 0, marginBottom: 20 }}/>
            <PageHeader
              title={'启动挖矿'}
              subTitle={'只有在挖矿中, 合约操作和账户交易才会被确认'}
              style={{ padding: 0, marginBottom: 20 }}
            >
              <Button.Group>
                <Popconfirm
                  title={'确定要开启挖矿吗, 这将消耗大量系统资源'}
                  cancelText={'取消'}
                  okText={'确定挖矿'}
                  onConfirm={async () => {
                    const rst = await (await startMining()).json();
                    if (rst.err) {
                      message.error('启动挖矿失败');
                      props.setMsg([...props.msgList, '[no_ansi]<span style="color: #de0002">挖矿启动失败</span>, 原因', JSON.stringify(rst.err)]);
                    } else {
                      message.success('启动挖矿成功');
                      props.setMsg([...props.msgList, '[no_ansi]<span style="color: #42d48c">挖矿启动成功</span>']);
                    }
                  }}
                >
                  <Button type={'primary'}>开启挖矿</Button>
                </Popconfirm>
                <Popconfirm
                  title={'确定要停止挖矿吗? 此后交易和合约部署将会阻塞'}
                  cancelText={'取消'}
                  okText={'确定停止挖矿'}
                  onConfirm={async () => {
                    const rst = await (await stopMining()).json();
                    if (rst.err) {
                      message.error('停止挖矿失败');
                      props.setMsg(
                        [
                          ...props.msgList,
                          '[no_ansi]<span style="color: #de0002">挖矿停止失败</span>, 原因',
                          JSON.stringify(rst.err),
                          '等待下一步操作...'
                        ]
                      );
                    } else {
                      message.success('停止挖矿成功');
                      props.setMsg([
                          ...props.msgList,
                          '[no_ansi]<span style="color: #42d48c">挖矿停止成功</span>',
                          '等待下一步操作...'
                        ]
                      );
                    }
                  }}
                >
                  <Button type={'danger'}>停止挖矿</Button>
                </Popconfirm>
              </Button.Group>
            </PageHeader>
            <PageHeader
              title={'授权新Signer'}
              subTitle={'若全节点处在解锁阶段, 默认都会确认新Signer'}
              style={{ padding: 0, marginBottom: 20 }}
            >
              <Input.Search
                placeholder="新Signer的地址"
                enterButton="授权"
                size="middle"
                value={newSigner}
                onChange={({ target: { value } }) => {
                  setNewSigner(value);
                }}
                onSearch={async () => {
                  if (props.NodeList.length <= ((props.SignerList.length + 1) / 2)) {
                    message.error('可以完成确认的节点数小于50%signer, 驳回');
                    props.setMsg(
                      [...props.msgList,
                        '[no_ansi]<span style="color: #de0002">可以完成确认的节点数小于50%signer, 驳回</span>',
                        '等待下一步操作...']
                    );
                    return;
                  }
                  const rst = await (await raiseNewSigner(newSigner)).json();
                  if (rst.status === 'success') {
                    message.success('指派新signer成功');
                    props.setMsg(
                      [...props.msgList,
                        '[no_ansi]<span style="color: #42d48c">指派新signer成功</span>',
                        '等待下一步操作...']
                    );
                  } else {
                    message.error('指派新signer失败');
                    props.setMsg(
                      [
                        ...props.msgList,
                        '[no_ansi]<span style="color: #de0002">指派新signer失败</span>, 原因',
                        JSON.stringify(rst.data),
                        '等待下一步操作...'
                      ]
                    );
                  }
                }}
              />
            </PageHeader>
            <PageHeader
              title={'设置新矿工'}
              subTitle={'设置矿工coinbase需要其为signer'}
              style={{ padding: 0, marginBottom: 20 }}
            >
              <Select
                style={{
                  width: '100%',
                  marginBottom: 10
                }}
                placeholder={'选择节点'}
                onSelect={(value) => {
                  setNewMiner({
                    node: value,
                    address: newMiner.address
                  });
                }}
              >
                {props.NodeList.map(n => (
                  <Select.Option value={n[1].ip} key={n[0]}>{n[0]}</Select.Option>
                ))}
              </Select>
              <Select
                style={{
                  width: '100%',
                  marginBottom: 10
                }}
                placeholder={'选择Signer'}
                onSelect={(value) => {
                  setNewMiner({
                    node: newMiner.value,
                    address: value
                  });
                }}
              >
                {props.SignerList.map(s => (
                  <Select.Option value={s} key={s}>
                    <Tooltip title={s}>
                      {s}
                    </Tooltip>
                  </Select.Option>
                ))}
              </Select>
              <Button
                block
                type={'primary'}
                onClick={async () => {
                  const rst = await (await setCoinBase(newMiner)).json();
                  if (rst.status === 'success') {
                    message.success('设定新矿工成功');
                    props.setMsg(
                      [...props.msgList,
                        '[no_ansi]<span style="color: #42d48c">设定新矿工成功</span>',
                        '等待下一步操作...']
                    );
                  } else {
                    message.error('设定新矿工失败');
                    props.setMsg(
                      [
                        ...props.msgList,
                        '[no_ansi]<span style="color: #de0002">设定新矿工失败</span>, 原因',
                        JSON.stringify(rst.data), '等待下一步操作...'
                      ]
                    );
                  }
                }}
              >
                指定
              </Button>
            </PageHeader>
            <PageHeader
              title={'创建新激活账户'}
              subTitle={'只提供简单口令, 账户自动导入keyStore'}
              style={{ padding: 0, marginBottom: 20 }}
            >
              <Input.Search
                type={'password'}
                enterButton={'创建'}
                placeholder={'输入简单口令'}
                style={{ marginBottom: 10 }}
                onSearch={async () => {
                  const rst = await (await newActiveAccount(activeAccount.password)).json();
                  if (activeAccount.password===''||rst.data === '') {
                    message.error('创建活跃账户失败');
                    props.setMsg(
                      [
                        ...props.msgList,
                        '[no_ansi]<span style="color: #de0002">创建活跃账户失败</span>, 原因',
                        JSON.stringify(rst.data), '等待下一步操作...'
                      ]
                    );
                  } else {
                    message.success('创建活跃账户成功');
                    setActiveAccount({
                      password: '',
                      address: rst.data
                    });
                    props.setMsg(
                      [...props.msgList,
                        '[no_ansi]<span style="color: #42d48c">创建活跃账户成功</span>',
                        '等待下一步操作...']
                    );
                    
                  }
                }}
                onChange={
                  ({ target: { value } }) => {
                    setActiveAccount({
                      password: value,
                      address: activeAccount.address
                    });
                  }}/>
              <Input placeholder={'在这里获取你的地址'} value={activeAccount.address}/>
            </PageHeader>
            <PageHeader
              title={'创建未激活账户'}
              subTitle={'创建的账户包含地址及私钥, 但没有导入节点'}
              style={{ padding: 0, marginBottom: 20 }}>
              <Input
                placeholder={'在这里获取你的地址'}
                style={{ marginBottom: 10 }}
                value={inActiveAccount.address}
              />
              <Input
                placeholder={'在这里获取你的私钥'}
                style={{ marginBottom: 10 }}
                value={inActiveAccount.privateKey}
              />
              <Button
                block
                type={'primary'}
                onClick={async () => {
                  const rst = await (await newAccount()).json();
                  setInActiveAccount(rst);
                }}
              >
                获取账户
              </Button>
            </PageHeader>
            <PageHeader
              title={'转账'}
              style={{ padding: 0, marginBottom: 20 }}
            >
              <Input
                placeholder={'请输入本人账号'}
                style={{ marginBottom: 10 }}
                onChange={({ target: { value } }) => {
                  setSourceAccount({
                    value
                  });
                }}
              />
              <Input
                type={'password'}
                placeholder={'请输入账户密码'}
                style={{ marginBottom: 10 }}
                onChange={({ target: { value } }) => {
                  setTxPassword({
                    value
                  });
                }}
              />
              <Input
                placeholder={'请输入目的账户'}
                style={{ marginBottom: 10 }}
                onChange={({ target: { value } }) => {
                  setDistAccount({
                    value
                  });
                }}
              />
              <Input
                placeholder={'请输入金额'}
                style={{ marginBottom: 10 }}
                onChange={({ target: { value } }) => {
                  setAmount({
                    value
                  });
                }}
              />
              <Button block type={'primary'} onClick={async () => {
                const rst = await (await sendTransaction(sourceAccount.value,txPassword.value,distAccount.value,amount.value)).json();
                if (rst.status === 'error') {
                  message.error('转账失败');
                  props.setMsg(
                    [
                      ...props.msgList,
                      '[no_ansi]<span style="color: #de0002">转账失败</span>, 原因',
                      JSON.stringify(rst.data), '等待下一步操作...'
                    ]
                  );
                } else {
                  message.success('转账成功');
                  props.setMsg(
                    [...props.msgList,
                      '[no_ansi]<span style="color: #42d48c">转账成功</span>',
                      '交易ID为：',
                      rst.data.transactionHash,
                      '等待下一步操作...']
                  );
                }
              }}>提交</Button>
            </PageHeader>
            <PageHeader
              title={'账户导入节点'}
              subTitle={'该方法有安全隐患, 只推荐开发环境下使用'}
              style={{ padding: 0, marginBottom: 20 }}
            >
              <Input
                placeholder={'输入要导入的私钥'}
                style={{ marginBottom: 10 }}
                onChange={({ target: { value } }) => {
                  setImportAccount({
                    privateKey: value,
                    password: importAccount.password
                  });
                }}
              />
              <Input
                placeholder={'输入加密keyStore的口令'}
                style={{ marginBottom: 10 }}
                value={importAccount.password}
                onChange={({ target: { value } }) => {
                  setImportAccount({
                    privateKey: importAccount.privateKey,
                    password: value
                  });
                }}
              />
              <Button block type={'primary'} onClick={async () => {
                const rst = await (await importPK(importAccount)).json();
                if (rst.status === 'error') {
                  message.error('导入私钥失败');
                  props.setMsg(
                    [
                      ...props.msgList,
                      '[no_ansi]<span style="color: #de0002">导入私钥失败</span>, 原因',
                      JSON.stringify(rst.data), '等待下一步操作...'
                    ]
                  );
                } else {
                  message.success('导入私钥成功');
                  props.setMsg(
                    [...props.msgList,
                      '[no_ansi]<span style="color: #42d48c">导入私钥成功</span>',
                      '等待下一步操作...']
                  );
                }
              }}>导入账户</Button>
            </PageHeader>

          </div>) :
          (<div>
            <h4>启动从节点数</h4>
            <Radio.Group onChange={({ target: { value } }) => props.onSelect(value)} value={props.startNodes}>
              <Radio value={1}>1</Radio>
              <Radio value={2}>2</Radio>
              <Radio value={3}>3</Radio>
            </Radio.Group>
          </div>)
        }
      </Row>
    </Card>
  );
};
