import {
  Controller,
  Get,
  Render,
  Req,
  Post,
  Body,
  ConflictException,
  Res,
  UseGuards
} from "@nestjs/common";
import { SignupUserDto } from "./dto/signup-user.dto";
import { SignupService } from "./signup.service";
import { AuthGuard } from "@nestjs/passport";

@Controller("signup")
export class SignupController {
  constructor(private signupService: SignupService) {}

  @Get()
  @Render("signup/index")
  root(@Req() req) {
    return { csrfToken: req.csrfToken() };
  }

  @Post("")
  async signupUserEmailAndPassword(
    @Req() req,
    @Body() signupUserDto: SignupUserDto,
    @Res() res
  ) {
    try {
      const user = await this.signupService.signupUserEmailAndPassword(
        signupUserDto
      );
      return res.render("signup/email-pwd-signup-success", {
        userEmail: user.email
      });
    } catch (e) {
      // Show user-already-exists error on the signup-form.
      if (e instanceof ConflictException)
        return res.render("signup/index", {
          csrfToken: req.csrfToken(),
          userExistsError: true
        });

      // TODO: Change this to a standard way of handling 5XX errors.
      throw e;
    }
  }

  @Get("google")
  @UseGuards(AuthGuard('google'))
  googleLogin() {
    console.log("Google login ENDPOINT called")
  }

  @Get("google/callback")
  @UseGuards(AuthGuard('google'))
  googleLoginCallback(@Req() req) {
    console.log("Google login CALLBACK called")
  }
}
