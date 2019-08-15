import * as Router from "koa-router";
import controllers from "./controllers";
export const router = new Router();

router.get("/", ctx => controllers.StartUpController.index(ctx));
