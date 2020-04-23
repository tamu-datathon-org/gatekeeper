import { Injectable } from "@nestjs/common";
import axios from "axios";
import { MailgunPayloadDto } from "./dto/mailgun-payload.dto";

@Injectable()
export class MailCoreService {
  private readonly mailgunMessagesURL: string;
  private readonly mailgunApiKey: string;

  constructor() {
    this.mailgunMessagesURL = `${process.env.MAILGUN_API_URL}/${process.env.MAILGUN_EMAIL_DOMAIN}/messages`;
    this.mailgunApiKey = process.env.MAILGUN_API_KEY;
  }

  sendMailPayload(params: MailgunPayloadDto): Promise<any> {
    return axios.post(
      this.mailgunMessagesURL,
      {} /* Mailgun needs the payload to be in params, leave body empty */,
      {
        auth: { username: "api", password: this.mailgunApiKey },
        params
      }
    );
  }
}
