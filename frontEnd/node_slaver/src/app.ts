import { log } from './utils/log';
import * as Koa from "koa";
import * as logger from "koa-logger";
import { router } from "./router";
import services from "./services";

export const app = new Koa();
app.use(logger());
app.use(router.routes());
app.listen(3000);
console.log("slaver running on port 3000");
getRegist();

async function getRegist () {
    log("开始注册节点");
    const rst = await services.InitRedis.registerNode();
    const status = rst.status ? "成功" : "失败";
    const msg = rst.title;
    log(`注册结果: [${status}: ${msg}]`);
}
