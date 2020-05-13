import { Controller, Get, Render, Req } from '@nestjs/common';

@Controller('login')
export class LoginController {

  @Get()
  @Render("login/index")
  root(@Req() req) {
    return { csrfToken: req.csrfToken() };
  }
}
