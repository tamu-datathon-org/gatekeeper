import * as ejs from "ejs";
import { Injectable, Inject } from "@nestjs/common";
import { SendEmailParamsDto } from "./dto/send-email-params.dto";
import { MailCoreService } from "./mail-core.service";

@Injectable()
export class MailService {
  private readonly emailFromString = `${process.env.MAILGUN_DEFAULT_NAME} <${process.env.MAILGUN_DEFAULT_EMAIL}>`;

  constructor(
    @Inject(MailCoreService) private mailCoreService: MailCoreService
  ) {}

  /**
   * Sends an email with a text body to a single recipient.
   * @param sendEmailParams SendEmailParamsDto
   */
  async sendTextEmail(sendEmailParams: SendEmailParamsDto): Promise<void> {
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
      text: sendEmailParams.bodyText,
    };
    await this.mailCoreService.sendMailPayload(payload);
  }

  /**
   * Sends an email with a HTML body to a single recipient.
   * @param sendEmailParams SendEmailParamsDto
   */
  async sendHTMLEmail(sendEmailParams: SendEmailParamsDto): Promise<void> {
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
      html: sendEmailParams.bodyHTML,
    };
    await this.mailCoreService.sendMailPayload(payload);
  }

  // Sends an email to a **single** recipient after rendering the given template.
  /**
   * Sends an email to a single recipient using the given template file and given template parameters.
   * Note: The template file renderer is EJS.
   * Note: The template file variable should contain the relative path (preferably just a file-name)
   *   from the env variable EMAIL_TEMPLATES_DIR
   * @param sendEmailParams SendEmailParamsDto
   */
  async sendTemplatedEmail(sendEmailParams: SendEmailParamsDto): Promise<void> {
    if (!sendEmailParams.templateFile || !sendEmailParams.templateParams) {
      throw new Error(
        "Email params must include template file and template params"
      );
    }

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
      html: emailHTML,
    };
    await this.mailCoreService.sendMailPayload(payload);
  }
}
