import { STATUS_CODE } from "./statusCode";
export interface Msg {
  title: string;
  msg?: string;
  status: STATUS_CODE;
  meta?: any;
}
