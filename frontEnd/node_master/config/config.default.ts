import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg';

export default (appInfo: EggAppInfo) => {
  const config = {} as PowerPartial<EggAppConfig>;

  // override config from framework / plugin
  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1550739915423_2635';

  // add your egg config in here
  config.middleware = [];

  // 启动redis
  config.redis = {
    client: {
      port: 6379, // Redis port
      host: '172.19.0.20', // Redis host
      password: '',
      db: 0,
    },
  };

  exports.logger = {
    consoleLevel: 'NONE',
  };

  // add your special config in here
  const bizConfig = {
    sourceUrl: `https://github.com/eggjs/examples/tree/master/${appInfo.name}`,
  };

  config.security = {
    csrf: {
      enable: false,
      ignoreJSON: true,
    },
    domainWhiteList: [ '*' ],
  };

  exports.cors = {
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
    origin: '*',
  };

  config.multipart = {
    mode: 'stream',
    fileExtensions: [
      '.sol',
    ],
  };



  // the return config will combines to EggAppConfig
  return {
    ...config,
    ...bizConfig,
  };
};
