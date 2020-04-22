export class SendEmailParamsDto {
  emailTo: string;
  subject: string;
  emailsCC?: [string];
  emailsBCC?: [string];
  bodyText?: string;
  bodyHTML?: string;
  templateFile?: string;
  templateParams?: Record<string, any>;
}
