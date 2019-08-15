import Logger from './Logger';
import * as os from 'os';

export default class InitIpList extends Logger {
  static IpList = new Map();
  constructor(props) {
    super(props);
  }
  async getHosts() {
    const iptable = {},
      ifaces = os.networkInterfaces();
    for (const dev in ifaces) {
      ifaces[dev].forEach((details, alias) => {
        if (details.family === 'IPv4') {
          iptable[dev + (alias ? ':' + alias : '')] = details.address;
        }
      });
    }
    // tslint:disable-next-line
    const ip = iptable["eth0"];
    this.log(`本机IP: ${ip}`);
    return ip;
  }
}
