import { Injectable } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import ejs from 'ejs';

@Injectable()
export class MailService {
  private readonly MailgunAPIBaseURL = `${process.env.MAILGUN_API_URL}/${process.env.MAILGUN_EMAIL_DOMAIN}`;
  private readonly MailgunFromString = `${process.env.MAILGUN_DEFAULT_NAME} <${process.env.MAILGUN_DEFAULT_EMAIL}>`; 

  // Private helper function to send a payload to mailgun API.
  // Exists to reduce code redundancy.
  private sendMailPayload(params: Object): Promise<AxiosResponse> {
    return axios.post(
      `${this.MailgunAPIBaseURL}/messages`,
      {}, /* Mailgun needs the payload to be in params, leave body empty */
      { 
        auth: {username: 'api', password: process.env.MAILGUN_API_KEY}, 
        params 
      }
    );
  }

  // Sends a simple email with a plain text body.
  async sendTextMail(
    emailsTo: [string],
    subject: string,
    bodyText: string,
    emailsCC?: [string],
    emailsBCC?: [string]
  ): Promise<[Number, string]> {
    const payload = {
      from: this.MailgunFromString,
      to: emailsTo.join(','),
      cc: emailsCC ? emailsCC.join(',') : undefined,
      bcc: emailsCC ? emailsBCC.join(',') : undefined,
      subject,
      text: bodyText,
    };

    try {
      const res = await this.sendMailPayload(payload);
      return [res.status, 'Email queued.'];
    } catch (err) {
      return [err.status, 'Error in sending email.'];
    }
  }

  // Sends a simple email with an HTML body.
  async sendHTMLMail(
    emailsTo: [string],
    subject: string,
    bodyHTML: string,
    emailsCC?: [string],
    emailsBCC?: [string]
  ): Promise<[Number, string]> {
    const payload = {
      from: this.MailgunFromString,
      to: emailsTo.join(','),
      cc: emailsCC ? emailsCC.join(',') : undefined,
      bcc: emailsCC ? emailsBCC.join(',') : undefined,
      subject,
      html: bodyHTML,
    };

    try {
      const res = await this.sendMailPayload(payload);
      return [res.status, 'Email queued.'];
    } catch (err) {
      return [err.status, 'Error in sending email.'];
    }
  }

  // Sends an email to a **single** recipient after rendering the given template.
  async sendSingleTemplatedMail(
    emailTo: string,
    subject: string,
    templatePath: string,
    templateVariables: Object,
    emailsCC?: [string],
    emailsBCC?: [string]
  ): Promise<[Number, string]> {
    try {
      const emailHTML = await ejs.renderFile(templatePath, templateVariables);
      const payload = {
        from: this.MailgunFromString,
        to: emailTo,
        cc: emailsCC ? emailsCC.join(',') : undefined,
        bcc: emailsCC ? emailsBCC.join(',') : undefined,
        subject,
        html: emailHTML
      };
      const res = await this.sendMailPayload(payload);
      return [res.status, 'Email queued.'];
    } catch (err) {
      return [err.status, 'Error in sending email.'];
    }
  }
}
