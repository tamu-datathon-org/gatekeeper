import {
  Controller,
  Get,
  Render,
  Req,
  Post,
  Body,
  ConflictException,
  Res
} from "@nestjs/common";
import { SignupUserDto } from "./dto/signup-user.dto";
import { SignupService } from "./signup.service";
import { ValidatorService } from "../validator/validator.service";

@Controller("signup")
export class SignupController {
  constructor(
    private signupService: SignupService,
    private validatorService: ValidatorService
  ) {}

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
    // Validate signupUserDto.
    const validationErrors = {};
    if (!signupUserDto.email ||
        !this.validatorService.validateEmail(signupUserDto.email))
      validationErrors["emailError"] = "Please enter a valid email.";
    else if (!signupUserDto.password ||
      !this.validatorService.validatePassword(signupUserDto.password))
      validationErrors["passwordError"] = "A password must contain atleast 6 characters.";
    else if (!signupUserDto.confirmPassword || 
      signupUserDto.confirmPassword !== signupUserDto.password)
      validationErrors["confirmPasswordError"] = "Value must match the given password.";
    
    if (validationErrors) 
      return res.render("signup/index", {
        csrfToken: req.csrfToken(),
        emailPrefill: signupUserDto.email,
        ...validationErrors
      });

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
          emailPrefill: signupUserDto.email,
          emailError: "A user with this email already exists."
        });

      // TODO: Change this to a standard way of handling 5XX errors.
      throw e;
    }
  }
}
