import { Controller } from 'egg';

export default class HomeController extends Controller {
  static hasInitMiners: boolean;

  constructor(props) {
    super(props);
    HomeController.hasInitMiners = false;
  }

  public async checkAllNodes() {
    const { ctx } = this;
    ctx.body = await ctx.service.initRedis.checkAllNodes();
  }

  public async NodeList() {
    const { ctx } = this;
    ctx.body = await ctx.service.initRedis.setNodeMap();
  }

  public async OwnIp() {
    const { ctx } = this;
    ctx.body = await ctx.service.initIpList.getHosts();
  }

  public async OwnPeers() {
    const { ctx } = this;
    ctx.body = await ctx.service.gethApi.getPeers()();
  }

  public async AllAcounts() {
    const { ctx } = this;
    ctx.body = await ctx.service.node.updateNodeAccountList();
  }

  public async initAllMiners() {
    const { ctx } = this;
    if (!HomeController.hasInitMiners) {
      ctx.body = ctx.service.node.initAllMiners();
      HomeController.hasInitMiners = true;
    } else {
      const rst = await ctx.service.node.updateNodeAccountList();
      ctx.body = rst;
    }
  }

  public async unlockAllNode() {
    this.service.logger.log('开始解锁signer并启动挖矿');
    const { ctx } = this;
    try {
      const rst = await ctx.service.node.unlockAllNode();
      this.service.logger.log('挖矿启动成功');
      ctx.body = rst;
    } catch (e) {
      this.service.logger.log('挖矿启动失败, 原因');
      this.service.logger.logObj(e);
      ctx.body = {
        status: 'error',
        err: e
      };
    }
  }

  public async stopMining() {
    this.service.logger.log('开始停止挖矿');
    const { ctx } = this;
    try {
      const rst = await ctx.service.node.stopAllMining();
      this.service.logger.log('停止挖矿成功');
      ctx.body = rst;
    } catch (e) {
      this.service.logger.log('停止挖矿失败, 原因');
      ctx.body = {
        status: 'error',
        err: e
      };
    }
  }

  public async getOwnNodeInfo() {
    const { ctx } = this;
    ctx.body = await ctx.service.gethApi.getNodeInfo();
  }

  public async getAllSigner() {
    const { ctx } = this;
    ctx.body = await this.service.node.getAllSigner();
  }

  public async setCoinBase() {
    const {ctx} = this;
    const data = ctx.request.body;
    if (!(data.address && data.node)) {
      ctx.body = {
        status: 'error',
        data: '缺少参数 address || node'
      }
    }
    try {
      const rst = await this.service.node.setCoinbase(data.address, data.node);
      ctx.body = {
        status: 'success',
        data: rst
      };
    } catch (e) {
      ctx.body = {
        status: 'error',
        data: e
      };
    }
    return;
  }

  public async rasieNewSigner() {
    const { ctx } = this;
    const body = ctx.request.body;
    if (!body.address) {
      ctx.body = {
        status: 'error',
        data: '缺少参数 address'
      };
    }
    try {
      const rst = await this.service.node.rasieNewSigner(body.address);
      ctx.body = {
        status: 'success',
        data: rst
      };
    } catch (e) {
      ctx.body = {
        status: 'error',
        data: e
      };
    }
    return;
  }
}
