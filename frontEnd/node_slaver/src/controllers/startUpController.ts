import services from "../services";

export default class StartUpController {
    static index(ctx: any) {
        const ip = services.InitOwnIp.getIp();
        console.log(ip);
        ctx.body = ip;
        return ctx;
    }
}