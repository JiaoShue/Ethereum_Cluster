import { Application } from 'egg';

export default (app: Application) => {
  const { controller, router } = app;

  router.get('/', controller.home.index);
  router.get('/ownIp', controller.nodeStatus.OwnIp);
  router.get('/checkAllNodes', controller.nodeStatus.checkAllNodes);
  router.get('/ownPeers', controller.nodeStatus.OwnPeers);
  router.get('/ownNodeInfo', controller.nodeStatus.getOwnNodeInfo);
  router.get('/NodeList', controller.nodeStatus.NodeList);
  router.post('/NodeList', controller.nodeStatus.NodeList);
  router.get('/AccountList', controller.nodeStatus.AllAcounts);
  router.get('/initAllMiners', controller.nodeStatus.initAllMiners);
  router.post('/getNewContract', controller.contractHandler.getNewContract);
  router.post('/unlockAllNodes', controller.nodeStatus.unlockAllNode);
  router.post('/dropAllContract', controller.contractHandler.dropAllContract);
  router.post('/dropContract', controller.contractHandler.dropContract);
  router.post('/deployContract', controller.contractHandler.deployContract);
  router.post('/execContractMethod', controller.contractHandler.execContractMethod);
  router.post('/getContractAPI', controller.contractHandler.getContractAPI);
  router.post('/getContractInfo', controller.contractHandler.getContractInfo);
  router.post('/getAllContractInfo', controller.contractHandler.getAllContractInfo);
  router.post('/getAllSigner', controller.nodeStatus.getAllSigner);
  router.post('/newAccount', controller.contractHandler.newAccount);
  router.post('/newActiveAccount', controller.contractHandler.newActiveAccount);
  router.post('/importPrivateKey', controller.contractHandler.importPrivateKey);
  router.post('/startMining', controller.nodeStatus.unlockAllNode);
  router.post('/stopMining', controller.nodeStatus.stopMining);
  router.post('/raiseNewSigner', controller.nodeStatus.rasieNewSigner);
  router.post('/setCoinBase', controller.nodeStatus.setCoinBase);
  router.post('/getBlockInfo', controller.contractHandler.getBlockInfo);
  router.post('/getTransaction', controller.contractHandler.getTransaction);
  router.post('/sendTransaction', controller.contractHandler.sendTransaction);
};
