import Logger from './Logger';
import { EnodeMap } from '../store/EnodeMap';

export default class Node extends Logger {
  public static hasInit: boolean = false;
  constructor(props) {
    super(props);
  }

  public callAllNode(func, key) {
    const rst = Promise.all(
      [ ...EnodeMap ].map(async element => {
        const ans = await func(element[1][key]);
        this.log('单个节点调用结果如下:');
        this.logObj(ans.data.result);
        return ans.data.result;
      }),
    );
    return rst;
  }


  public callAllNodeSync(func, key) {
    const rst = [ ...EnodeMap ].map(element => {
      return func(element[1][key]);
    });
    return rst;
  }

  public async updateNodeAccountList() {
    const accounts = await this.callAllNode(
      this.ctx.service.gethApi.listAccounts(),
      'ip',
    );
    this.log(accounts);
    return accounts;
  }

  public async stopAllMining() {
    const { gethApi } = this.ctx.service;
    return await this.callAllNode(gethApi.stopMining(), 'ip');
  }

  public async unlockAllNode(middleWare?: (any?: any) => any) {
    const { gethApi } = this.ctx.service;
    const rst = await gethApi.getSigners()();
    const signers = rst.data.result;
    for (const signer of signers) {
      middleWare && middleWare(signer);
    }
    return await this.callAllNode(gethApi.startMining(2), 'ip');
  }

  public async initAllMiners() {
    // 为每个节点新建一个账户并开始挖矿
    const { gethApi } = this.ctx.service;
    if (!Node.hasInit) {
      await this.callAllNode(gethApi.newAccount('123456'), 'ip');
      Node.hasInit = true;
    }
    await this.callAllNode(gethApi.startMining(2), 'ip');
    return await this.callAllNode(gethApi.listAccounts(), 'ip');
  }

  public async rasieNewSigner(address: string) {
    // 新增一个授权账户, 使其具有挖矿权限
    const { gethApi } = this.ctx.service;
    await this.unlockAllNode(async (signer) => await this.callAllNode(gethApi.propose(signer), 'ip'));
    const rst:any = await this.callAllNode(gethApi.propose(address), 'ip');
    return rst;
  }

  public async getAllSigner() {
    const { gethApi } = this.ctx.service;
    const rst = await gethApi.getSigners()();
    return rst.data.result;
  }

  public async setCoinbase(address: string, node: string) {
    try {
      const rst = await this.ctx.service.gethApi.setEtherBase(address)(node);
      this.ctx.body = {
        status: 'success',
        data: rst.data.result
      }
    } catch (e) {
      this.ctx.body = {
        status: 'error',
        data: e
      }
    }
    return;
  }
}


