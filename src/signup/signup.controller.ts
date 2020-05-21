import {
  Controller,
  Get,
  Render,
  Req,
  Post,
  Body,
  ConflictException,
  Res,
  Query
} from "@nestjs/common";
import { SignupUserDto } from "./dto/signup-user.dto";
import { SignupService } from "./signup.service";
import { ValidatorService } from "../validator/validator.service";
import { AuthService } from "../auth/auth.service";

@Controller("signup")
export class SignupController {
  public readonly controllerErrors = {
    invalidEmail: "Please enter a valid email.",
    invalidPassword: "A password must contain at least 6 characters.",
    invalidConfirmPassword: "Value must match the given password.",
    userExists: "A user with this email already exists."
  };

  constructor(
    private authService: AuthService,
    private signupService: SignupService,
    private validatorService: ValidatorService
  ) {}

  @Get()
  @Render("signup/index")
  root(@Req() req, @Query("r") redirect: string | undefined) {
    return {
      csrfToken: req.csrfToken(),
      redirectLink: redirect || "/auth/me"
    };
  }

  @Post("")
  async signupUserEmailAndPassword(
    @Req() req,
    @Body() signupUserDto: SignupUserDto,
    @Query("r") redirect: string | undefined,
    @Res() res
  ) {
    // Validate signupUserDto.
    let validationErrors = undefined;
    if (
      !signupUserDto.email ||
      !this.validatorService.validateEmail(signupUserDto.email)
    )
      validationErrors = { emailError: this.controllerErrors.invalidEmail };
    else if (
      !signupUserDto.password ||
      !this.validatorService.validatePassword(signupUserDto.password)
    )
      validationErrors = {
        passwordError: this.controllerErrors.invalidPassword
      };
    else if (
      !signupUserDto.confirmPassword ||
      signupUserDto.confirmPassword !== signupUserDto.password
    )
      validationErrors = {
        confirmPasswordError: this.controllerErrors.invalidConfirmPassword
      };

    if (validationErrors)
      return res.status(400).render("signup/index", {
        csrfToken: req.csrfToken(),
        redirectLink: redirect,
        emailPrefill: signupUserDto.email,
        ...validationErrors
      });

    try {
      const user = await this.signupService.signupUserEmailAndPassword(
        signupUserDto,
        redirect
      );
      return res.render("signup/email-pwd-signup-success", {
        userEmail: user.email
      });
    } catch (e) {
      // Show user-already-exists error on the signup-form.
      if (e instanceof ConflictException)
        return res.status(409).render("signup/index", {
          csrfToken: req.csrfToken(),
          redirectLink: redirect,
          emailPrefill: signupUserDto.email,
          emailError: this.controllerErrors.userExists
        });

      // TODO: Change this to a standard way of handling 5XX errors.
      throw e;
    }
  }

  @Get("verify")
  async confirmSignup(
    @Req() req,
    @Query("r") redirectLink: string | undefined,
    @Query("user") userJwt: string,
    @Res() res
  ) {
    try {
      const user = await this.signupService.confirmUserSignup(userJwt)
      this.authService.applyJwt(user, res);
      return res.render("signup/verification-success", {
        redirectLink
      });
    } catch (e) {
      console.log(e);
      return res.status(400).render("signup/verification-failure");
    }
  }
}
