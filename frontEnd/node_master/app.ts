import { Application } from 'egg';

export default class AppBootHook {
  private app: Application;
  private hasPublish: boolean;
  constructor(app) {
    this.app = app;
    this.hasPublish = false;
  }
  configWillLoad() {
    // 获取当前redis容器ip地址, 修改config中的redis ip
    // 此时 config 文件已经被读取并合并，但是还并未生效
    // 这是应用层修改配置的最后时机
  }

  async didLoad() {
    // 所有的配置已经加载完毕
    // 可以用来加载应用自定义的文件，启动自定义的服务
  }

  async didReady() {
    // curl连接geth获取enode, 修改后写入配置对象并更新redis
    // 获取当前节点ip, 查询redis中是否存在当前节点, 没有就新增当前节点
    // 若有则与当前节点对比, 不同就更新当前节点覆盖原有的
    // 启动轮询和发布订阅, 持续检查节点更新状况
    const ctx = await this.app.createAnonymousContext();
    await ctx.service.initRedis.clearCache();
    await this.app.runSchedule('check_nodes');
    await this.app.runSchedule('check_block');
    if (!this.hasPublish) {
      await this.app.redis.publish("SayHi", "Hi");
      this.hasPublish = true;
    }
    console.log("初始化完成");
  }

  async serverDidReady() {}
}
