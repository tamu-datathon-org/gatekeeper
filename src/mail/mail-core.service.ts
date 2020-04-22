import { Injectable } from "@nestjs/common";
import axios, { AxiosResponse } from "axios";

@Injectable()
export class MailCoreService {
  private readonly mailgunMessagesURL: string;
  private readonly mailgunApiKey: string;

  constructor() {
    this.mailgunMessagesURL = `${process.env.MAILGUN_API_URL}/${process.env.MAILGUN_EMAIL_DOMAIN}/messages`;
    this.mailgunApiKey = process.env.MAILGUN_API_KEY;
  }

  // Private helper function to send a payload to mailgun API.
  // Exists to reduce code redundancy.
  sendMailPayload(params: Record<string, any>): Promise<AxiosResponse> {
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
