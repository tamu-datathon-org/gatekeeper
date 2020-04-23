import { ResponseBase } from "../../common/dto/response-base";

export interface MailResponse extends ResponseBase {
  error?: Error;
}
