import * as os from "os";
class InitOwnIp {
  static IpList = new Map();
  getIp() {
    const iptable = {} as any,
      ifaces = os.networkInterfaces();
    for (const dev in ifaces) {
      ifaces[dev].forEach((details, alias) => {
        if (details.family === "IPv4") {
          iptable[dev + (alias ? ":" + alias : "")] = details.address;
        }
      });
    }
    return iptable["eth0"];
  }
}

export default new InitOwnIp();