import { Controller, Get, Render, Req, Post, Body, Inject } from "@nestjs/common";
import { SignupUserDto } from "./dto/signup-user.dto";
import { SignupService } from "./signup.service";

@Controller("signup")
export class SignupController {
  constructor(@Inject(SignupService) private signupService: SignupService) {}

  @Get()
  @Render("signup/index")
  root(@Req() req) {
    return { csrfToken: req.csrfToken() };
  }

  @Post()
  async signupUser(@Body() signupUserDto: SignupUserDto) {
    console.log(signupUserDto);

    // Any errors thrown in child services will be propagated into HTTP Errors.
    await this.signupService.signupUserEmailAndPassword(signupUserDto);
    return "User created";
  }
}
