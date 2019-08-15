import { Msg } from "./../models/Msg";
import * as Redis from "ioredis";
import InitOwnIp from "./InitOwnIp";
import Message from "./Message";
import { log } from "../utils/log";

type enode = {
  name: string;
  ip: string;
};

class InitRedis {
  static OWNNODE: enode;
  redis: Redis.Redis;
  constructor() {
    try {
      this.redis = new Redis({
        port: 6379, // Redis port
        host: "172.19.0.20" // Redis host
      });
    } catch (err) {
      setInterval(() => console.log("连接到Redis失败..."), 2000);
    }
  }
  async registerNode(): Promise<Msg> {
    if (!this.redis) {
      return await Message.error("Redis连接失败", "请检查redis的IP地址");
    }
    if (await this.checkNodes()) {
      return await Message.success("已有注册记录", "节点已经被注册");
    }
    const number = await this.redis.scard("enodes");
    if (number === 0) {
      Message.info("初始节点尚未初始化", "进入下一轮队列");
      return await this.registerNode();
    }
    const name = `eth_node_${number + 1}`;
    try {
      const ip = InitOwnIp.getIp();
      if ((await this.redis.setnx(name, ip)) === 0) {
        Message.info("节点名已被抢占", "进入下一轮队列");
        return await this.registerNode();
      }
      await this.redis.sadd("enodes", name);
      if (!InitRedis.OWNNODE) {
        InitRedis.OWNNODE = {
          name,
          ip
        };
      }
    } catch (err) {
      return await Message.error("节点注册失败", "节点IP未能存储到Redis", {
        errMsg: err
      });
    }
    return await Message.success(
      "节点注册成功",
      "节点IP已经成功记录",
      InitRedis.OWNNODE
    );
  }

  private async checkNodes() {
    const ip = InitOwnIp.getIp();
    try {
      const enodeList = await this.redis.smembers("enodes");
      for (const enode of enodeList) {
        const remoteIp = await this.redis.get(enode);
        if (remoteIp === ip) {
          log(`[remoteIp]: ${remoteIp}\t[ownIp]: ${ip}`);
          return true;
        }
      }
      return false;
    } catch (err) {
      return false;
    }
  }
}

export default new InitRedis();
