import { Controller, Get, Render } from '@nestjs/common';

@Controller('signup')
export class SignupController {

  @Get()
  @Render('signup/index')
  root() {
    return {}
  }
}
