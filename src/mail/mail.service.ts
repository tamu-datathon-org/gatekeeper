import * as ejs from "ejs";
import { Injectable, Inject } from "@nestjs/common";
import { SendEmailParamsDto } from "./dto/send-email-params.dto";
import { MailResponse } from "./dto/mail-response";
import { MailCoreService } from "./mail-core.service";
import { ResponseStatus } from "../common/dto/response-base";

@Injectable()
export class MailService {
  private readonly emailFromString = `${process.env.MAILGUN_DEFAULT_NAME} <${process.env.MAILGUN_DEFAULT_EMAIL}>`;

  constructor(
    @Inject(MailCoreService) private mailCoreService: MailCoreService
  ) {}

  // Sends a simple email with a plain text body.
  async sendTextEmail(
    sendEmailParams: SendEmailParamsDto
  ): Promise<MailResponse> {
    if (!sendEmailParams.bodyText) {
      throw new Error("Email params must include body text.");
    }

    const payload = {
      from: this.emailFromString,
      to: sendEmailParams.emailTo,
      cc: sendEmailParams.emailsCC
        ? sendEmailParams.emailsCC.join(",")
        : undefined,
      bcc: sendEmailParams.emailsCC
        ? sendEmailParams.emailsBCC.join(",")
        : undefined,
      subject: sendEmailParams.subject,
      text: sendEmailParams.bodyText
    };

    try {
      await this.mailCoreService.sendMailPayload(payload);
      return { status: ResponseStatus.Success };
    } catch (err) {
      return {
        status: ResponseStatus.Failure,
        error: err
      };
    }
  }

  // Sends a simple email with an HTML body.
  async sendHTMLEmail(
    sendEmailParams: SendEmailParamsDto
  ): Promise<MailResponse> {
    if (!sendEmailParams.bodyHTML) {
      throw new Error("Email params must include body HTML.");
    }

    const payload = {
      from: this.emailFromString,
      to: sendEmailParams.emailTo,
      cc: sendEmailParams.emailsCC
        ? sendEmailParams.emailsCC.join(",")
        : undefined,
      bcc: sendEmailParams.emailsCC
        ? sendEmailParams.emailsBCC.join(",")
        : undefined,
      subject: sendEmailParams.subject,
      html: sendEmailParams.bodyHTML
    };

    try {
      await this.mailCoreService.sendMailPayload(payload);
      return { status: ResponseStatus.Success };
    } catch (err) {
      return {
        status: ResponseStatus.Failure,
        error: err
      };
    }
  }

  // Sends an email to a **single** recipient after rendering the given template.
  async sendTemplatedEmail(
    sendEmailParams: SendEmailParamsDto
  ): Promise<MailResponse> {
    if (!sendEmailParams.templateFile || !sendEmailParams.templateParams) {
      throw new Error(
        "Email params must include template file and template params"
      );
    }

    try {
      const emailHTML = await ejs.renderFile(
        process.env.EMAIL_TEMPLATES_DIR + sendEmailParams.templateFile,
        sendEmailParams.templateParams
      );

      const payload = {
        from: this.emailFromString,
        to: sendEmailParams.emailTo,
        cc: sendEmailParams.emailsCC
          ? sendEmailParams.emailsCC.join(",")
          : undefined,
        bcc: sendEmailParams.emailsCC
          ? sendEmailParams.emailsBCC.join(",")
          : undefined,
        subject: sendEmailParams.subject,
        html: emailHTML
      };
      await this.mailCoreService.sendMailPayload(payload);
      return { status: ResponseStatus.Success };
    } catch (err) {
      return {
        status: ResponseStatus.Failure,
        error: err
      };
    }
  }
}
