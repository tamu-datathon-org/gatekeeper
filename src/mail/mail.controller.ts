import { Controller, Get, Post, Body, HttpCode } from '@nestjs/common';
import { Request } from 'express';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private mailService: MailService) {}

  @Post()
  @HttpCode(201)
  sendMail(@Body('emails') emails: Array<string>, 
           @Body('emailTemplateFile') emailFile: string, 
           @Body('emailTemplateObjects') templateObjects: Array<JSON>): string {
    emails.forEach(async email => console.log(await this.mailService.sendMailText([email], "Test Subject", "Test Body")))
    return 'Hello!'
  }
}