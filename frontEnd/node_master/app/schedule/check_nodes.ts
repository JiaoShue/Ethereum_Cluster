module.exports = {
  schedule: {
    interval: '15s',
    type: 'all',
  },
  async task(ctx) {
    console.log(`[${new Date().toLocaleString()}]\t定时任务开始`);
    await ctx.service.initIpList.getHosts();
    await ctx.service.initRedis.setNodes();
    await ctx.service.initRedis.setNodeMap(),
    await ctx.service.initRedis.checkAllNodes();
    console.log(`[${new Date().toLocaleString()}]\t定时任务结束`);
  },
};
