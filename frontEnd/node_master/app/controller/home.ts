import { Controller } from 'egg';

export default class HomeController extends Controller {
  public async index() {
    await this.app.redis.publish("SayHi", "Hi");
    this.ctx.body = 'Hello, this is controll system of geth cluster';
  }
}
