import MyLayout from '../components/MyLayout.js';
import { MicroTerminal } from '../components/MicroTerminal.js';
import {
  checkCluster, checkStats,
  cleanETH,
  deployContract, getAccountList,execContractMethod,
  getContractList,
  getNodeList, getSignerList,
  reopenRedis, restartETH,
  startETH,
  stopETH,
  uploadContract
} from '../apis';
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { uniq, compact, flatten, uniqBy } from 'lodash';
import { Button, Card, Icon, Modal, Upload, Tooltip, Row, Col,Input,Badge, Select, Alert, Layout } from 'antd';
import { NodeListCard } from '../components/NodeListCard';
import { ContractListCard } from '../components/ContractListCard';
import { BlockInfoCard } from '../components/BlockInfoCard';
import { UserListCard } from '../components/UserListCard';
import { NodeStatusList } from '../components/NodeStatusList';
import { AccountControl } from '../components/AccountControl';
import { BlockSearch } from '../components/BlockSearch';
import { TransactionSearch } from '../components/TransactionSearch';

checkStats().then(r => r).catch(e => e);

const index = (props) => {
  var contracts=props.ContractList
  var methods=[]
  var params=[]
  var callTyp=[]
  // for (let i = 0; i < contracts.length; i++) {
  //   for (let j = 0; j < eval(contracts[i].abi).length; j++) {
      
  //     console.log(eval(contracts[i].abi)[j].constant)
  //   }
  // }
  function methodChange(contractName) {
    methods=[]
    for (let i = 0; i < contracts.length; i++) {
      if ((contracts[i].name).toString()==contractName.toString()) {
        for (let j = 0; j < eval(contracts[i].abi).length; j++) {
          console.log(eval(contracts[i].abi)[j].constant!=='undefined')
          if((eval(contracts[i].abi)[j].constant==true)||(eval(contracts[i].abi)[j].constant==false)){
            methods.push(eval(contracts[i].abi)[j])
          }
          
        }
      }
      
    }
  }
  
  function getCallType(methodName='') {
    callTyp=[]
    for (let i = 0; i < methods.length; i++) {
      if ((methods[i].name).toString()==methodName.toString()) {
        if(methods[i].constant==true){
          callTyp.push('call')
        }
        else if(methods[i].constant==false){
          callTyp.push('send')
        }
        else{
          callTyp.push()
        }
      }
      
    }
  }

  function getParams(methodName='') {
    params=[]
    for (let i = 0; i < methods.length; i++) {
      if ((methods[i].name).toString()==methodName.toString()) {
        for (let j = 0; j < eval(methods[i].inputs).length; j++) {
          params.push(methods[i].inputs[j].type)
        }
      }
    }
  }
  const [startNodes, setStartNodes] = useState(1);
  const [NodeList, setNodeList] = useState(props.NodeList);
  const [AccountList, setAccountList] = useState(uniqBy(props.AccountList, 'address'));
  const [isMining, setMining] = useState(false);
  const [SignerList, setSignerList] = useState(props.SignerList);
  const [ContractList, setContractList] = useState(props.ContractList || []);
  const preMsgList = props.status === 'success' ?
    ['[no_ansi]<span style="color:#3DC37F">集群已经启动!</span> 可访问 <a href="http://localhost:7001" target="_blank">http://localhost:7001</a>']
      .concat(['等待下一步操作...'])
    : props.status === 'warning'
      ? ['[no_ansi]<span style="color:#ffad36">集群停止中或尚未启动完成</span>']
        .concat(['等待下一步操作...'])
      : ['等待下一步操作...'];
  const [msgList, setMsg] = React.useState(preMsgList);
  const [onOpen, setOpen] = React.useState(false);
  const [onDeployOpen,setDeployOpen] = React.useState(false);
  const [onExecOpen,setExecOpen] = React.useState(false);
  const [status, setStatus] = useState(props.status);
  const [BlockInfo, setBlockInfo] = useState({});
  let nowMsgList = msgList.slice(0);

  const stopCluster = async () => {
    setMsg([...msgList, '尝试停止集群...']);
    const res = await stopETH();
    try {
      const data = await res.json();
      if (!data.data) {
        setMsg([...msgList, '测试集群已停止']);
        setStatus('warning');
        setNodeList([]);
        setSignerList([]);
        setAccountList([]);
        setContractList([]);
      } else {
        setMsg([
          ...msgList,
          `停止指令失败,\n错误信息`,
          JSON.stringify(data.data),
          '等待下一步操作...'
        ]);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const restartCluster = async () => {
    setMsg([...msgList, '尝试重启集群...']);
    const res = await restartETH();
    try {
      const data = await res.json();
      if (!data.data) {
        setMsg([...msgList, '测试集群已成功重启!需要等待大约2分钟直至启动完成', '等待下一步操作...']);
        setStatus('success');
      } else {
        setMsg([
          ...msgList,
          `重启指令失败,\n错误信息`,
          JSON.stringify(data.data),
          '等待下一步操作...'
        ]);
      }
      console.log(data);
    } catch (err) {
      console.log(err);
    }
  };

  /**
   * 下发智能合约的弹框
   * @return {*}
   * @constructor
   */
  const UpLoadSolModel = () => {
    const [fileList, setFileList] = useState([]);

    const handleOk = async () => {
      setOpen(false);
      const formData = new FormData();
      formData.append('name', fileList[0].name.split('.sol')[0]);
      formData.append('contract', fileList[0]);
      setMsg([...msgList, '尝试上传合约...']);
      const res = await uploadContract(formData);
      try {
        const data = await res.json();
        if (data.status === 'error') {
          setMsg([
            ...msgList,
            '合约上传失败, 原因:',
            data.err,
            '等待进行下一步操作...'
          ]);
        } else if (data.status === 'success') {
          const ContractList = await (await getContractList()).json();
          setContractList(ContractList.data);
          setMsg([
            ...msgList,
            `合约${fileList[0].name.split('.sol')[0]}上传成功!`
          ]);
        }
      } catch (err) {
        console.log(err);
      }
    };

    const beforeUpload = file => {
      setFileList([file]);
      return false;
    };

    const onRemove = file => {
      setFileList([]);
    };

    const props = {
      accept: '.sol',
      beforeUpload: beforeUpload,
      onRemove: onRemove
    };

    return (
      <Modal
        title="智能合约下发"
        visible={onOpen}
        onCancel={() => setOpen(false)}
        onOk={handleOk}
      >
        <p>只支持上传sol文件</p>
        <Upload fileList={fileList} {...props}>
          <Button>
            <Icon type="upload"/> 上传合约文件
          </Button>
        </Upload>
      </Modal>
    );
  };


  /**
   * 部署智能合约的弹框
   * @return {*}
   * @constructor
   */
  const DeployModel = () => {
    const [name, setName] = useState('');
    const handleOk = async (name) => {
      setMsg([...msgList, '开始部署合约...']);
      setDeployOpen(false);
      const data = await deployContract(name);
      const rst = await data.json();
      if (rst.status === 'success') {
        setMining(true);
        setMsg([...msgList, '[no_ansi]<span style="color: #3DC37F">合约部署成功!</span>', '等待下一步操作...']);
      } else {
        setMsg([...msgList, '[no_ansi]<span style="color: #de0002">合约部署失败!</span>', `原因:`, JSON.stringify(rst.data), '等待下一步操作...']);
      }
    };
    return (
      <Modal
        title="智能合约部署"
        visible={onDeployOpen}
        onCancel={() => setDeployOpen(false)}
        onOk={() => handleOk(name)}
        okButtonProps={{ disabled: name.trim().length === 0 }}
      >
        <Alert showIcon message="若已部署同名合约, 重新部署将会丢失原合约的数据库链接, 请先备份原合约abi和compiled" type="warning"/>
        <div style={{
          marginTop: 20
        }}>
          <span
            style={{
              marginRight: 20,
              fontWeight: 600
            }}>选择合约
          </span>
          <Select
            placeholder={'选择合约'}
            onSelect={value => {
              setName(value);
            }}
            style={{
              width: 200
            }}>
            {
              ContractList && ContractList.map(c => {
                return (
                  <Select.Option value={c.name} key={c.name}>
                    {c.name}
                  </Select.Option>
                );
              })
            }
          </Select>
        </div>
      </Modal>
    );
  };
  // for (let i = 0; i < ContractList.length; i++) {
  //   console.log(props.ContractList[i].abi)
  // }
  
  const ExecModel = () => {
    const [name, setName] = useState('');
    const [method, setMethod] = useState('');
    const [paras, setParas] = useState('');
    const [callType, setCallType] = useState('');
    const handleOk = async (name,method,callType,paras) => {
      
      setExecOpen(false);
      console.log(eval(paras))
      console.log(typeof(eval(paras)))
      console.log(name,method,paras,callType)
      setMsg([...msgList, '开始测试合约...']);
      const data = await execContractMethod(name,method,callType,eval(paras));
      
      const rst = await data.json();

      if (rst.status === 'success') {
        setMining(true);
        setMsg([...msgList, JSON.stringify(rst.data)]);
      } else {
        setMsg([...msgList, '[no_ansi]<span style="color: #de0002">合约函数执行失败!</span>', `原因:`, JSON.stringify(rst.data), '等待下一步操作...']);
      }
    };
    
    
    return (
      <Modal
        title="智能合约测试"
        visible={onExecOpen}
        onCancel={() => setExecOpen(false)}
        onOk={() => handleOk(name,method,callType,paras)}
        okButtonProps={{ disabled: name.trim().length === 0||method.trim().length === 0}}
      >
        <Alert showIcon message="注意：用event等修饰符修饰的匿名函数不能进行测试" type="info"/>
        <div style={{
          marginTop: 20
        }}>
          <span
            style={{
              marginRight: 20,
              fontWeight: 600
            }}>选择合约
          </span>
            
          <Select
            placeholder={'选择合约'}
            onSelect={value => {
              setName(value);
              methodChange(value)
            }} 
            style={{
              width: 200
            }}>
            {
                contracts && contracts.map(c => {
                  return (
                    <Select.Option value={c.name} key={c.name}>
                      {c.name}
                    </Select.Option>
                  );
                })
            }
          </Select>
          
          <br/>
          <br/>
          <span
            style={{
              marginRight: 20,
              fontWeight: 600
            }}>选择函数
          </span>
          <Select
            placeholder={'选择函数'}
            onSelect={value => {
              setMethod(value);
              getParams(value);
              getCallType(value)
            }}
            style={{
              width: 200
            }}>
            {
              methods && methods.map(c => {
                return (
                  <Select.Option value={c.name} key={c.name}>
                    {c.name}
                  </Select.Option>
                );
              })
            }
          </Select>

          <br/>
          <br/>
          <span
            style={{
              marginRight: 20,
              fontWeight: 600
            }}>调用方式
          </span>
          <Select
            placeholder={'调用方式'}
            onSelect={value => {
              setCallType(value);
            }}
            style={{
              width: 200
            }}>
              <Select.Option value={callTyp[0]} key={callTyp[0]}>
                {callTyp[0]}
              </Select.Option>
          </Select>
          <br/>
          <br/>
          <span
            style={{
              marginRight: 20,
              fontWeight: 600
            }}>传入参数
          </span>
          
        <Input
          style={{
            width: 200
          }}
          placeholder={params}
          onChange={e => {
            setParas(e.target.value);
          }}
        />
        </div>
      </Modal>
    );
  };

  useEffect(() => {
    const socket = io();
    /**
     * websocket的监听事件
     * 监听newMsg
     */
    socket.on('newMsg', function(newMsg) {
      const msgSegments = compact(newMsg.data.split('\n'));
      let newMsgList = msgList.slice(0).map(msg => {
        for (const newmsg of msgSegments) {
          if (
            (newmsg.indexOf(msg.trim()) > -1 ||
              msg.indexOf(newmsg.trim()) > -1) &&
            msg !== ''
          ) {
            return newmsg;
          }
        }
        return msg;
      });
      newMsgList = uniq([...newMsgList, ...msgSegments]);
      setMsg(newMsgList);
      nowMsgList = newMsgList.slice(0);
    });


    /**
     * 当集群内部master节点启动后, 会主动向redis发布事件
     * 宿主机server订阅事件, 接受到信息后判断master节点load完成
     */
    socket.on('onLoad', async () => {
      let data, ContractList;
      try {
        const NodeList = await getNodeList();
        ContractList = (await (await getContractList()).json()).data;
        data = await NodeList.json();
      } catch (e) {
        data = [];
        ContractList = [];
      }
      setNodeList(data);
      setContractList(ContractList);
      setMsg([...nowMsgList, `[no_ansi]集群已可用, 可访问 <a href="http://localhost:7001" target="_blank">http://localhost:7001</a>`, '等待下一步操作...']);
      setStatus('success');
    });


    /**
     * 当一段子进程信息完成输出后, websocket发出终止信号
     * 客户端打印出相应提示
     */
    socket.on('close', function(data) {
      if (data && data.status === 'success') {
        setMsg([...nowMsgList, '集群启动成功! 如果是第一次启动, 需要等待大约2分钟直至启动完成。', '等待下一步操作...']);
        setStatus('success');
      } else if (data && data.status === 'error') {
        setMsg([...nowMsgList, '集群启动失败!', '等待下一步操作...']);
        setStatus('default');
      } else {
        setMsg([...nowMsgList, '集群恢复启动成功!']);
        setStatus('success');
      }
    });

    return () => {
      socket.disconnect();
    };
  });


  return (
    <React.Fragment>
      <Layout>
        <MyLayout>
          <UpLoadSolModel/>
          <DeployModel/>
          <ExecModel/>
          <Row gutter={16}>
            <Col span={15}>
              <Card
                style={{
                  marginBottom: 16
                }}
                title={
                  (<Badge status={status}>
                    <h3>
                      区块链系统控制台
                    </h3>
                  </Badge>)
                }
                extra={
                  <Button.Group>
                    {NodeList.length === 0 && status === 'default' ? <Button
                      type={'primary'}
                      onClick={async () => {
                        setMsg([...msgList, `正在启动集群, 从节点启动数${startNodes}...`]);
                        const res = startETH(startNodes);
                        try {
                          let data = await res;
                          data = JSON.stringify(data);
                          if (data.err) {
                            setMsg([...msgList, `启动指令失败`]);
                          }
                        } catch (err) {
                          console.log(err);
                        }
                      }}
                    >
                      启动集群
                      <Icon type="caret-right"/>
                    </Button> : null}
                    <Button
                      type={'primary'}
                      onClick={status === 'warning' ? restartCluster : stopCluster}
                    >
                      {`${status === 'warning' ? '重启' : '停止'}集群`}
                      <Icon type="pause-circle"/>
                    </Button>
                    <Button type={'primary'} onClick={() => setOpen(true)}>
                      下发合约
                      <Icon type="cloud-download"/>
                    </Button>

                    <Tooltip title="一旦启动, 内存占用率将急增(单个容器约占用1G), 可能出现容器宕机的情况, 请知悉">
                      <Button
                        type={'primary'}
                        onClick={async () => {
                          setDeployOpen(true);
                        }}
                      >
                        部署合约
                        <Icon type="rocket"/>
                      </Button>
                    </Tooltip>

                    <Button
                      type={'primary'}
                      onClick={async () => {
                        setExecOpen(true);
                      }}
                    >
                      测试合约
                      <Icon type="check"/>
                    </Button>

                    <Button
                      type={'danger'}
                      onClick={async () => {
                        setMsg([...msgList, '尝试清除集群...']);
                        const res = await cleanETH();
                        try {
                          const data = await res.json();
                          if (!data.data) {
                            setMsg(['测试集群已移除']);
                            setStatus('default');
                            setNodeList([]);
                          } else {
                            setMsg([
                              ...msgList,
                              `清除指令失败,\n错误信息`,
                              JSON.stringify(data.data),
                              '等待下一步操作...'
                            ]);
                          }
                          console.log(data);
                        } catch (err) {
                          console.log(err);
                        }
                      }}
                    >
                      移除集群
                    </Button>
                  </Button.Group>
                }
              >
                <MicroTerminal msgList={msgList}/>
              </Card>
              <NodeListCard NodeList={NodeList}/>
              <Row gutter={16}>
                <Col span={14}>
                  <UserListCard AccountList={AccountList}/>
                  <NodeStatusList/>
                </Col>
                <Col span={10}>
                  <AccountControl
                    NodeList={NodeList}
                    SignerList={SignerList}
                    isMining={isMining}
                    onSelect={setStartNodes}
                    startNodes={startNodes}
                    setMsg={setMsg}
                    msgList={msgList}
                  />
                </Col>
              </Row>
            </Col>
            <Col span={9}>
              <ContractListCard ContractList={ContractList} setMsg={setMsg} msgList={msgList}/>
              <BlockSearch/>
              <TransactionSearch/>
              <BlockInfoCard BlockInfo={BlockInfo} setMining={setMining}/>
            </Col>
          </Row>
          <style jsx>
            {`
            a {
              font-family: 'Roboto';
            }

            ul {
              padding: 0;
            }

            li {
              list-style: none;
              margin: 5px 0;
            }

            a {
              text-decoration: none;
              color: blue;
            }

            a:hover {
              opacity: 0.6;
            }

          `}
          </style>
          <style jsx global>
            {`
            body {
              background-color: '#D9D9D9' !important;
            }

            h3 {
              color: #213146;
              margin-bottom: 0px;
            }
          `}
          </style>
        </MyLayout>
      </Layout>
    </React.Fragment>
  );
};

index.getInitialProps = async () => {
  try {
    const NodeList = await (await getNodeList()).json();
    const ContractList = await (await getContractList()).json();
    const Accounts = await (await getAccountList()).json();
    const SignerList = await (await getSignerList()).json();
    let AccountList = [];
    for (const account of flatten(Accounts)) {
      let status;
      if (SignerList.includes(account)) {
        status = 'signer';
      } else {
        status = 'user';
      }
      AccountList.push({
        address: account,
        status
      });
    }
    if (NodeList && NodeList.length > 0) {
      console.log('开始唤起redis');
      reopenRedis().then(_ => {
        console.log('唤起完毕, 结果');
      }).catch(e => e);
    }
    return {
      status: 'success',
      NodeList: NodeList,
      ContractList: ContractList.data,
      AccountList: uniqBy(AccountList, 'address'),
      SignerList: SignerList
    };
  } catch (err) {
    console.log(err);
    const hasCreated = (await (await checkCluster()).json()).status;
    return {
      status: hasCreated === 'success' ? 'warning' : 'default',
      NodeList: [],
      ContractList: [],
      AccountList: [],
      SignerList: []
    };
  }
};

export default index;