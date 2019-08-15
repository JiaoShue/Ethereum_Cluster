import Logger from './Logger';
import { uniqBy, findIndex, isEqual } from 'lodash';
import { EnodeMap } from '../store/EnodeMap';

/**
 * 项目开始前启动redis,完成一系列初始化操作
 */
export default class InitRedis extends Logger {
  static ownEnode: string;
  constructor(props) {
    super(props);
  }

  /**
   * 新启动时, 删掉以前所有的智能合约
   */
  public async clearCache() {
    const service = this.ctx.service;
    const redis = this.app.redis;
    const OWNHOST = process.env.OWNHOST as string;
    const hasCreated = await redis.get(OWNHOST);
    if (!hasCreated) {
      await service.contracts.dropAllContract();
    }
  }

  /**
   * 启动server时，自动添加当前enode节点ip和相关信息到redis
   */
  public async setNodes() {
    const service = this.ctx.service;
    const redis = this.app.redis;
    const OWNHOST = process.env.OWNHOST as string;
    const ownIp = await service.initIpList.getHosts();
    InitRedis.ownEnode = ownIp;
    const hasCreated = await redis.get(OWNHOST);
    if (!hasCreated) {
      await redis.set(OWNHOST, ownIp);
      await redis.sadd('enodes', OWNHOST);
    }
  }
  /**
   *  遍历redis, 检查有没有新增节点
   */
  public async setNodeMap() {
    const enodes = await this.app.redis.smembers('enodes');
    for (const enode of enodes) {
      const nodeIp = await this.app.redis.get(enode);
      const NodeInfo = {
        name: enode,
        ip: nodeIp,
        peers: [],
      };
      if (EnodeMap.get(enode) && isEqual(EnodeMap.get(enode).ip, nodeIp)) {
        this.log('节点无变化，跳过');
        continue;
      }
      this.prefixLog(`[${enode}: ${NodeInfo.ip}]`, '发现新节点');
      EnodeMap.set(enode, NodeInfo);
    }
    return [ ...EnodeMap ];
  }
  /**
   *  获得当前缓存中所有节点的数据
   */
  public getNodeMap() {
    return EnodeMap;
  }
  /**
   * 检查节点，执行更新或新增操作
   */
  public async checkNodes(node) {
    const enodes = await this.app.redis.smembers('enodes');
    const nodeIp = await this.app.redis.get(node);
    const { gethApi } = this.ctx.service;

    this.log(`正在checkNode: ${node}`);

    if (!EnodeMap.get(node)) {
      EnodeMap.set(node, {
        name: node,
        ip: nodeIp,
        peers: [],
      });
    }
    let peers = EnodeMap.get(node).peers;
    for (const enode of enodes) {
      const pos = findIndex(peers, o => o.node_name === enode);
      let peerStatus;
      const Ip = await this.app.redis.get(enode);
      const enodeIdentifier = await gethApi.getNodeAddr(Ip);
      if (enode === node) {
        peerStatus = 'this is the node';
      } else {
        peerStatus = await gethApi.addPeer(enodeIdentifier)(nodeIp);
      }
      const newNode = {
        node_name: enode,
        node_addr: enodeIdentifier,
        peersStatus: peerStatus,
      };
      if (pos === -1) {
        peers.push(newNode);
        peers = uniqBy(peers, 'node_name');
      } else {
        peers[pos] = newNode;
      }
      EnodeMap.get(node).peers = peers;
    }
    return EnodeMap.get(node);
  }
  /**
   * 遍历检查所有节点, 并调用其互相发现
   */
  public async checkAllNodes() {
    const rst = [ ...EnodeMap ].forEach(async element => {
      return await this.checkNodes(element[1].name);
    });
    return rst;
  }
  /**
   * 向redis写入数据
   */
  public async set(key: string, value: any) {
    const rst = await this.app.redis.set(key, value);
    return rst;
  }

  /**
   * 获取智能合约信息
   */
  public async getContractInfo(name) {
    const redis = this.app.redis;
    const object = await redis.sismember('contracts', name);
    const hasDeployed = await redis.get(name);
    const hasRaw = await redis.get(`${name}.hasRaw`);
    if (object) {
      if (hasDeployed) {
        const address = hasDeployed;
        const abi = await redis.get(`${name}.abi`);
        const code = await redis.get(`${name}.compiled`);
        const TxHash = await redis.get(`${name}.TxHash`);
        const position = await redis.get(`${name}.position`);
        return {
          name: name,
          hasDeployed: true,
          position,
          hasRaw,
          address,
          TxHash,
          abi,
          code
        }
      } else {
        return {
          name: name,
          hasRaw,
          hasDeployed: false
        }
      }
    } else {
      return null;
    }
  }
}
