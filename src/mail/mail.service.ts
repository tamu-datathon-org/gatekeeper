import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class MailService {
  private readonly MailgunAPIBaseURL = `${process.env.MAILGUN_API_URL}/${process.env.MAILGUN_EMAIL_DOMAIN}`;
  private readonly MailgunFromString = `${process.env.MAILGUN_DEFAULT_NAME} <${process.env.MAILGUN_DEFAULT_EMAIL}>`; 
  private readonly MailgunAuth = {username: 'api', password: process.env.MAILGUN_API_KEY}

  // Private helper function to send a payload to mailgun API.
  // Exists to reduce code redundancy.
  sendMailPayload(payload: Object) {
    return axios.post(
      `${this.MailgunAPIBaseURL}/messages`,
      {}, /* Mailgun needs the payload to be in params */
      { auth: this.MailgunAuth, params: payload }
    );
  }

  // Sends a simple email with a plain text body.
  async sendMailText(
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
  async sendMailHTML(
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
}
