import { Service } from 'egg';

export default class Logger extends Service {
  log(value) {
    console.log(`[${new Date().toLocaleString()}]\t${value}`);
  }
  logObj(value) {
    console.log(`[${new Date().toLocaleString()}]\t%O`, value);
  }

  prefixLog(value, prefix) {
    console.log(`[${new Date().toLocaleString()}]\t${prefix}:`, `${value}`);
  }
}
