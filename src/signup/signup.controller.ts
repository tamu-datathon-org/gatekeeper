import {
  Controller,
  Get,
  Render,
  Req,
  Post,
  Body,
  Res,
  ConflictException
} from "@nestjs/common";
import { Response } from "express";
import { SignupUserDto } from "./dto/signup-user.dto";
import { SignupService } from "./signup.service";

@Controller("signup")
export class SignupController {
  constructor(
    private signupService: SignupService
  ) {}

  @Get()
  @Render("signup/index")
  root(@Req() req) {
    return { csrfToken: req.csrfToken() };
  }

  @Post()
  async signupUser(
    @Req() req,
    @Body() signupUserDto: SignupUserDto,
    @Res() res: Response
  ) {

    try {
      const user = await this.signupService.signupUserEmailAndPassword(
        signupUserDto
      );
      return res.render("signup/email-pwd-signup-success", {
        userEmail: user.email
      });
    } catch (e) {
      // Show error on the signup-form
      if(e instanceof ConflictException)
        return res.render("signup/index", {
          csrfToken: req.csrfToken(),
          userExistsError: true
        });

      // TODO: Change this to a standard way of handling 5XX errors.
      throw e;
    }
  }
}
