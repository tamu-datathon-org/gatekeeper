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
    emails.forEach(email => console.log(this.mailService.sendMail(email)))
    return 'Hello!'
  }
}