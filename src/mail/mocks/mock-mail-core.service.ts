
import { Injectable } from "@nestjs/common";
import { MailgunPayloadDto } from "../dto/mailgun-payload.dto";

@Injectable()
export class MockMailCoreService {
  async sendMailPayload(params: MailgunPayloadDto): Promise<void> {
    const requiredParams = ["to", "from", "subject"];
    if (!requiredParams.every(key => params[key])) {
      throw new Error("Required params not found");
    }
  }
}