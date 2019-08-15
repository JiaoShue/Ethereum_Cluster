import { SUCCESS } from "./../models/statusCode";
import { Msg } from "./../models/Msg";
class Messages {
  success(title?: string, msg?: string, meta?: any): Msg {
    return {
      title: title,
      msg,
      status: 1,
      meta
    };
  }
  error(title?: string, msg?: string, meta?: any): Msg {
    return {
      title: title,
      msg,
      status: -1,
      meta
    };
  }
  info(title?: string, msg?: string, meta?: any): Msg {
    return {
      title: title,
      msg,
      status: 0,
      meta
    };
  }
}
export default new Messages();