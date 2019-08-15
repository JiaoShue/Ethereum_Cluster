import { Controller } from 'egg';

export default class ContractHandler extends Controller {
  public async getNewContract() {
    const { ctx } = this;
    const data = await ctx.getFileStream();
    try {
      const redisRst = await this.app.redis.sadd('contracts', data.fields.name);
      ctx.service.logger.prefixLog(redisRst, '写入完成, 结果');
      const rst = await ctx.service.contracts.getNewContract(data);
      ctx.body = {
        status: 'success',
        data: rst,
      };
    } catch (err) {
      ctx.body = {
        status: 'error',
        err,
      };
    }
    return;
  }

  public async deployContract() {
    const { ctx } = this;
    const data = ctx.request.body;
    
    try {
      const rst = await ctx.service.contracts.deployContract(data.name);
      ctx.body = {
        status: 'success',
        data: rst,
      };
      return;
    } catch (err) {
      ctx.body = {
        status: 'error',
        data: err,
      };
    }

  }

  public async getContractAPI() {
    const { ctx } = this;
    const data = ctx.request.body;
    ctx.service.logger.logObj(data);
    const rst = await ctx.service.contracts.getContractAPIList(data.name);
    ctx.body = {
      data: rst,
    };
    return;
  }

  public async getContractInfo() {
    const { ctx } = this;
    const data = ctx.request.body;
    if (!data.name) {
      ctx.body = {
        status: 'error',
        err: '缺少name字段',
      };
      return;
    }
    const rst = await ctx.service.initRedis.getContractInfo(data.name);
    ctx.body = {
      name: data.name,
      status: 'success',
      data: rst,
    };
  }

  public async dropAllContract() {
    this.service.logger.log('开始清除全部合约文件');
    const { ctx } = this;
    const rst = await ctx.service.contracts.dropAllContract();
    if (rst) {
      ctx.body = {
        status: 'success',
      };
    } else {
      ctx.body = {
        status: 'error',
      };
    }
    return;
  }


  /**
   * 清除合约文件
   */
  public async dropContract() {
    this.service.logger.log('开始清除合约文件');
    const { ctx } = this;
    const { name } = ctx.request.body;
    if (!name) {
      ctx.body = {
        status: 'error',
      };
      return;
    }
    try {
      const rst = await ctx.service.contracts.dropContract(name);
      ctx.body = {
        status: 'success',
        data: rst,
      };
    } catch (e) {
      ctx.body = {
        status: 'error',
        data: e
      };
    }
    return;
  }

  public async getAllContractInfo() {
    const { ctx } = this;
    const contracts = await this.app.redis.smembers('contracts');
    let infos: any[] = [];
    for (const contract of contracts) {
      const rst = await ctx.service.initRedis.getContractInfo(contract);
      infos.push(rst);
    }
    ctx.body = {
      status: 'success',
      data: infos,
    };
  }

  public async execContractMethod() {
    const { ctx } = this;
    const { name, method, callType , params} = ctx.request.body;
    if (!(name && method)) {
      ctx.body = {
        status: 'error',
        data: '缺少参数',
      };
      return;
    }
    const result = await ctx.service.contracts.executeContract(name, method, callType, params);
    ctx.body = result;
    return;
  }

  public async newAccount() {
    const { ctx } = this;
    ctx.body = await ctx.service.contracts.newAccount();
  }

  public async newActiveAccount() {
    const { ctx } = this;
    const data = ctx.request.body;
    if (!data.password) {
      ctx.body = {
        status: 'error',
        data: '缺少参数',
      };
      return;
    }
    try {
      const rst = await ctx.service.contracts.newActiveAccount(data.password);
      ctx.body = {
        status: 'success',
        data: rst,
      };
    } catch (e) {
      ctx.body = {
        status: 'error',
        data: e,
      };
    }
    return;
  }

  public async getBlockInfo() {
    const { ctx } = this;
    const data = ctx.request.body;
    if (!(data && (data.number || data.hash))) {
      ctx.body = {
        status: 'error',
        data: '缺少参数',
      };
      return;
    }
    try {
      const rst = await ctx.service.contracts.searchBlockInfo(data.number || data.hash);
      ctx.body = {
        status: 'success',
        data: rst,
      };
    } catch (e) {
      ctx.body = {
        status: 'error',
        data: e,
      };
    }
  }

  public async sendTransaction() {
    const { ctx } = this;
    const opt = ctx.request.body;
    ctx.service.contracts.logObj(opt.sourceAccount);
    if (!(opt && opt.sourceAccount && opt.txPassword && opt.distAccount && opt.amount)) {
      ctx.body = {
        status: 'error',
        data: '请输入填入完整转账信息',
      };
      return;
    }
    try {
      const rst = await ctx.service.contracts.sendTransaction(opt.sourceAccount, opt.txPassword, opt.distAccount, opt.amount);
      ctx.body = {
        status: 'success',
        data: rst,
      };
    } catch (e) {
      ctx.body = {
        status: 'error',
        data: e,
      };
    }
  }

  public async getTransaction() {
    const { ctx } = this;
    const txID = ctx.request.body.txID;
    if (!txID) {
      ctx.body = {
        status: 'error',
        data: '请输入交易ID',
      };
      return;
    }
    try {
      const rst = await ctx.service.contracts.getTransaction(txID);
      ctx.body = {
        status: 'success',
        data: rst,
      };
    } catch (e) {
      ctx.body = {
        status: 'error',
        data: e,
      };
    }
  }

  public async importPrivateKey() {
    const { ctx } = this;
    const data = ctx.request.body;
    if (!(data && data.password && data.privateKey)) {
      ctx.body = {
        status: 'error',
        data: '缺少参数',
      };
      return;
    }
    try {
      const status = await ctx.service.contracts.importPrivateKey(data.privateKey, data.password);
      ctx.body = {
        status: 'success',
        data: status,
      };
    } catch (e) {
      ctx.body = {
        status: 'error',
        data: e,
      };
    }

  }
}
