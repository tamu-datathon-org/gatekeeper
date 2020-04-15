import { Injectable } from "@nestjs/common";

@Injectable()
export class MailService {
  sendMail(email: string) {
    return `Sent email to ${email}`
  }
}