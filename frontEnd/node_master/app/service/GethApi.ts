import { curl } from 'urllib';
import Logger from './Logger';

export type HTTP_METHOD = 'GET' | 'POST' | 'PUT' | 'DELETE';
export interface ICurlData {
  jsonrpc: string | number;
  method: string;
  params: any[];
  id: string | number;
}
export interface ICurlBody {
  method: HTTP_METHOD;
  headers: any;
  data: string;
  dataType: string;
}

export interface INodePorts {
  discovery: number | string;
  listener: number | string;
}

export interface INodeInfo {
  id: string;
  ip: string;
  enode: string;
  listenAddr: string;
  ports: INodePorts;
}

/**
 * 和geth进行交互的api
 */
export default class GethApi extends Logger {
  static EnodeList: any[] = [];
  static ownEnode: string;
  private getCurlData(rawData: ICurlData): string {
    return JSON.stringify(rawData);
  }

  private curlDataFactory = (method: string, ...params: any) => async (
    target?: string | null,
  ) => {
    const curlData: ICurlData = {
      jsonrpc: '2.0',
      method,
      params: [ ...params ],
      id: '74',
    };
    const data = await this.ERpc(curlData, target);
    return data;
  }
  /**
   * 直接向geth发起http请求
   * @param data 请求的方法所对应的对象
   * @param target 请求的服务器
   */
  public async ERpc(data: ICurlData, target?: string | null) {
    const rst = await curl(`${target || 'localhost'}:8545`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      data: this.getCurlData(data),
      dataType: 'json',
    });
    return rst;
  }
  /**
   * 获得以太坊节点的Enode地址, 用于调用admin方法交互
   * @param ip 以太坊节点的ip地址
   */
  public async getNodeAddr(ip: string | null) {
    if (!ip) {
      return null;
    }
    const queryEnode = {
      jsonrpc: '2.0',
      method: 'admin_nodeInfo',
      params: [],
      id: '0',
    };
    const result = await this.ERpc(queryEnode, ip);
    const { enode } = result.data.result as INodeInfo;
    const enodeIdentifier = enode.split('@')[0] + '@' + ip + ':30303';
    return enodeIdentifier;
  }

  /**
   * 获得以太坊节点的nodeInfo
   * @param target 以太坊节点的ip地址
   */
  public async getNodeInfo(target?: string | null) {
    const queryEnode = {
      jsonrpc: '2.0',
      method: 'admin_nodeInfo',
      params: [],
      id: '0',
    };
    return await this.ERpc(queryEnode, target);
  }

  /**
   * 向geth发送连接节点的请求
   * @param enodeIdentifier 需要连接的节点地址
   */
  public addPeer = (enodeIdentifier: any) => async (target: string | null) =>
    await this.curlDataFactory('admin_addPeer', enodeIdentifier)(target)

  /**
   * 向geth发送查看连接上的节点的请求
   * @param 目标节点ip
   */
  public getPeers = () => async (target?: string | null) =>
    await this.curlDataFactory('admin_peers')(target)

  /**
   * 设置solc编译器(用于编译智能合约)的本地路径
   * @param path solc编译器所处绝对路径
   * @param target 目标节点ip
   */
  public setSolc = (path: string) => async (target?: string | null) =>
    await this.curlDataFactory('admin_setSolc', path)(target)

  /**
   * 设置是否开启RPC
   * @param host 目标ip地址
   * @param port 目标端口
   * @param cors 跨域请求的请求头(默认为"")
   * @param apis 需要使用当前调用方式的api功能(默认为eth,net,web3)
   */
  public startRPC = (
    host: string = 'localhost',
    port: string = '8545',
    cors?: string,
    apis?: string,
  ) => async (target?: string | null) =>
    await this.curlDataFactory('admin_startRPC', host, port, cors, apis)(
      target,
    )

  /**
   * 设置是否开启Websocket
   * @param host 目标ip地址
   * @param port 目标端口
   * @param cors 跨域请求的请求头(默认为"")
   * @param apis 需要使用当前调用方式的api功能(默认为eth,net,web3)
   */
  public startWS = (
    host: string = 'localhost',
    port: string = '8545',
    cors?: string,
    apis?: string,
  ) => async (target?: string | null) =>
    await this.curlDataFactory('admin_startWS', host, port, cors, apis)(target)

  /**
   * 关闭所有rpc
   */
  public stopRPC = () => async (target?: string | null) =>
    await this.curlDataFactory('admin_stopRPC')(target)

  /**
   * 关闭所有Websocket
   */
  public stopWS = () => async (target?: string | null) =>
    await this.curlDataFactory('admin_stopWS')(target)

  /**
   * 获得某个区块的账户列表(包括storage和代码)
   * @param number 区块编号
   */
  public getBlockInfo = (number: number) => async (target?: string | null) =>
    await this.curlDataFactory('debug_dumpBlock', number)(target)

  /**
   * 获得某个区块的Rlp编码
   * @link https://github.com/ethereum/wiki/wiki/RLP
   * @param number 区块编号
   */
  public getBlockRlp = (number: number) => async (target?: string | null) =>
    await this.curlDataFactory('debug_getBlockRlp', number)(target)

  /**
   * 获得目标节点的GC情况
   */
  public getGCStats = () => async (target?: string | null) =>
    await this.curlDataFactory('debug_gcStats')(target)

  /**
   * 获得目标节点的内存状况
   */
  public getMEMStats = () => async (target?: string | null) =>
    await this.curlDataFactory('debug_memStats')(target)

  /**
   * 根据区块的Rlp编码查看当前区块信息
   * @param blockRlp 当前区块的rlp编码
   */
  public traceBlock = (blockRlp: string) => async (target?: string | null) =>
    await this.curlDataFactory('debug_traceBlock', blockRlp)(target)

  /**
   * 根据区块的块编号查看当前区块信息
   * @param number {string} 区块编号
   */
  public traceBlockByNumber = (number: number) => async (
    target?: string | null,
  ) => await this.curlDataFactory('debug_traceBlockByNumber', number)(target)

  /**
   * 根据区块的块哈希查看当前区块信息
   * @param blockHash {string} 区块哈希值
   */
  public traceBlockByHash = (blockHash: string) => async (
    target?: string | null,
  ) => await this.curlDataFactory('debug_traceBlockByHash', blockHash)(target)

  /**
   * 设置最小接受范围的挖矿条件, 如果交易支付的gas少于这个，会被矿工排除
   * @number gas的最低限
   */
  public setGasPrice = (number: number) => async (target: string | null) =>
    await this.curlDataFactory('miner_setGasPrice', number)(target)

  /**
   * 对指定节点开始启动挖矿
   * @param number 指定挖矿的线程数
   */
  public startMining = (number: number) => async (target?: string | null) =>
    await this.curlDataFactory('miner_start', number)(target)

  /**
   * 停止指定节点的挖矿
   */
  public stopMining = () => async (target?: string | null) =>
    await this.curlDataFactory('miner_stop')(target)

  /**
   * 指定挖矿账户(一个节点只能有一个矿工)
   * @param address 挖矿账户的地址
   */
  public setEtherBase = (address: string) => async (target?: string | null) =>
    await this.curlDataFactory('miner_setEtherbase', address)(target)

  /**
   * 向节点的KeyStore中导入一个私钥，并提供一个passphrase加密
   * @param keyData 原始的私钥数据
   * @param passphrase 加密私钥的口令
   */
  public importRawKey = (keyData: string, passphrase: string) => async (
    target?: string | null,
  ) =>
    await this.curlDataFactory('personal_importRawKey', keyData, passphrase)(
      target,
    )

  /**
   * 展示当前节点keyStore中所有的账户地址
   */
  public listAccounts = () => async (target?: string | null) =>
    await this.curlDataFactory('personal_listAccounts')(target);

  /**
   * 从内存中删除某个地址和私钥数据, 该地址将无法发起交易请求
   * @param address 要锁定的地址
   */
  public lockAccount = (address: string) => async (target?: string | null) =>
    await this.curlDataFactory('personal_lockAccounts', address)(target);

  /**
   * 展示当前节点的钱包信息
   */
  public listWallets = () => async (target?: string | null) =>
    await this.curlDataFactory('personal_listWallets')(target);

  /**
   * 新建一个账号并导入keystore
   * @param passphrase 加密私钥的口令
   */
  public newAccount = (passphrase: string) => async (target?: string | null) =>
    await this.curlDataFactory('personal_newAccount', passphrase)(target)

  /**
   * 根据口令解锁某个(存在于keystore中的)账号, 使其能够发送交易
   * @param address 账户地址
   * @param passphrase 口令
   * @param expiration 解锁时间, 默认为300s, 过期后会重新锁住
   */
  public unlockAccount = (
    address: string,
    passphrase: string,
    expiration: number = 300,
  ) => async (target?: string | null) =>
    await this.curlDataFactory(
      'personal_unlockAccount',
      address,
      passphrase,
      expiration,
    )(target)

  /**
   * 操纵节点发送交易
   * @param tx 交易对象, 形如{from: "xxx", to: "xxx", value: web3.toWei(1.23, "ether")}
   * @param passphrase 用来解锁交易对象中from对应地址账户的口令
   */
  public sendTransaction = (tx: any, passphrase: string) => async (
    target?: string | null,
  ) =>
    await this.curlDataFactory('personal_sendTransaction', tx, passphrase)(
      target,
    )

  /**
   * 对消息提供数字签名
   * @param message 要签名的消息
   * @param address 签名该消息的地址
   * @param password 使用该地址所需的口令
   */
  public sign = (
    message: string,
    address: string,
    password: string = '',
  ) => async (target?: string | null) =>
    await this.curlDataFactory('personal_sign', message, address, password)(
      target,
    )

  /**
   * 从签名中还原出地址
   * @param message 待验证的消息
   * @param siganture 数字签名
   */
  public recover = (message: string, signatire: string) => async (
    target?: string | null,
  ) =>
    await this.curlDataFactory('personal_ecRecover', message, signatire)(
      target,
    )

  /**
   * 获得节点交易池中的pending状态和queue状态的交易细节
   */
  public txPoolContent = () => async (target?: string | null) =>
    await this.curlDataFactory('txpool_content')(target)

  /**
   * 获得节点交易池中的pending状态和queue状态的简报
   */
  public txPoolInspect = () => async (target?: string | null) =>
    await this.curlDataFactory('txpool_inspect')(target)

  /**
   * 获得节点交易池中的pending状态和queue状态的数量
   */
  public txPoolStatus = () => async (target?: string | null) =>
    await this.curlDataFactory('txpool_status')(target)

  /**
   * 联盟链api, 开启clique下产生
   * 获得目前所有的授权节点
   */
  public getSigners = () => async (target?: string | null) =>
    await this.curlDataFactory('clique_getSigners')(target)

  /**
   * 对某个节点做授权(投票)
   */
  public propose = (address: string) => async (target?: string | null) =>
    await this.curlDataFactory('clique_propose', address, true)(target);

  /**
   * 废弃某个用户的权限(投票)
   */
  public discard = (address: string) => async (target?: string | null) =>
    await this.curlDataFactory('clique_discard', address)(target);

  /**
   * 获取某个POA块的矿工(signer)
   */
  public getPOABlockSigner = (hash: string) => async (target?: string | null) =>
    await this.curlDataFactory('clique_getSignersAtHash', hash)(target);
}
