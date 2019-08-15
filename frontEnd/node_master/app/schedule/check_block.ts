module.exports = {
  schedule: {
    interval: '5s',
    type: 'all',
  },
  async task(ctx) {
    console.log(`[${new Date().toLocaleString()}]\t检查区块任务开始`);
    await ctx.service.contracts.getBlockInfo();
    console.log(`[${new Date().toLocaleString()}]\t检查区块任务结束`);
  },
};
