import {
  Controller,
  Get,
  Render,
  Req,
  Post,
  Body,
  ConflictException
} from "@nestjs/common";
import { SignupUserDto } from "./dto/signup-user.dto";
import { SignupService } from "./signup.service";

@Controller("signup")
export class SignupController {
  constructor(private signupService: SignupService) {}

  @Get()
  root(@Req() req) {
    return this.renderEmailPaswwordSignupForm({ csrfToken: req.csrfToken() });
  }

  @Post()
  async signupUserEmailAndPassword(
    @Req() req,
    @Body() signupUserDto: SignupUserDto
  ) {
    try {
      const user = await this.signupService.signupUserEmailAndPassword(
        signupUserDto
      );
      return this.renderEmailPasswordSignupSuccess({
        userEmail: user.email
      });
    } catch (e) {
      // Show error on the signup-form.
      if (e instanceof ConflictException)
        return this.renderEmailPaswwordSignupForm({
          csrfToken: req.csrfToken(),
          userExistsError: true
        });

      // TODO: Change this to a standard way of handling 5XX errors.
      throw e;
    }
  }

  @Render("signup/email-pwd-signup-success")
  private renderEmailPasswordSignupSuccess(params) {
    return params;
  }

  @Render("signup/index")
  private renderEmailPaswwordSignupForm(params) {
    return params;
  }
}
