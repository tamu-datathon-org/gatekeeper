import { Controller, Get, Render, Req, Post, Body } from "@nestjs/common";
import { SignupUserDto } from "./dto/signup-use.dto";

@Controller("signup")
export class SignupController {
  @Get()
  @Render("signup/index")
  root(@Req() req) {
    return { csrfToken: req.csrfToken() };
  }

  @Post()
  signupUser(@Body() signupUserDto: SignupUserDto) {
    console.log(signupUserDto);
  }
}
