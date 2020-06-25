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
import { QueryWithDefault } from "../common/decorators/query-with-default.decorator";
import { RedirectGalaxyIntegration } from "../galaxy-integrations/decorators/redirect-galaxy-integration.decorator";
import { GalaxyIntegrationConfig } from "../galaxy-integrations/interfaces/galaxy-integration";
import { ValidatedHost } from "../common/decorators/validated-host.decorator";

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
  root(
    @Req() req,
    @QueryWithDefault("r") redirectLink: string | undefined,
    @RedirectGalaxyIntegration() integrationConfig: GalaxyIntegrationConfig
  ) {
    return {
      ...integrationConfig,
      csrfToken: req.csrfToken(),
      redirectLink
    };
  }

  @Post("")
  async signupUserEmailAndPassword(
    @Req() req,
    @Body() signupUserDto: SignupUserDto,
    @QueryWithDefault("r", "/") redirectLink: string | undefined,
    @RedirectGalaxyIntegration() integrationConfig: GalaxyIntegrationConfig,
    @ValidatedHost() host,
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
        redirectLink,
        emailPrefill: signupUserDto.email,
        ...validationErrors
      });

    try {
      const user = await this.signupService.signupUserEmailAndPassword(
        signupUserDto,
        host,
        redirectLink
      );
      return res.render("signup/verification-email-sent", {
        ...integrationConfig,
        userEmail: user.email
      });
    } catch (e) {
      // Show user-already-exists error on the signup-form.
      if (e instanceof ConflictException)
        return res.status(409).render("signup/index", {
          csrfToken: req.csrfToken(),
          redirectLink,
          emailPrefill: signupUserDto.email,
          emailError: this.controllerErrors.userExists
        });

      throw e;
    }
  }

  @Get("verify")
  async confirmSignup(
    @QueryWithDefault("r") redirectLink: string | undefined,
    @Query("user") userJwt: string,
    @Res() res
  ) {
    try {
      const user = await this.signupService.confirmUserSignup(userJwt);
      await this.authService.authorizeUser(user, res);
      return res.render("signup/verification-success", {
        redirectLink
      });
    } catch (e) {
      if (e instanceof ConflictException) {
        return res.status(409).render("signup/user-already-verified", {
          redirectLink
        });
      }
      return res.status(400).render("signup/verification-failure", {
        redirectLink
      });
    }
  }

  @Get("verify/resend")
  // Don't user a JWT guard here because we need custom error handling.
  /**
   * Resends the verification link via email for a user.
   * NOTE: User is specified by the JWT token that is included in the request.
   */
  async resendVerificationEmail(
    @Req() req,
    @QueryWithDefault("r") redirectLink: string | undefined,
    @ValidatedHost() host,
    @Res() res
  ) {
    try {
      const userEmail = await this.signupService.resendVerificationEmail(
        req.cookies["accessToken"],
        host,
        redirectLink
      );
      return res.render("signup/verification-email-sent", {
        userEmail
      });
    } catch (e) {
      if (e instanceof ConflictException) {
        return res.status(409).render("signup/user-already-verified", {
          redirectLink
        });
      }
      return res.status(400).render("signup/verification-failure", {
        redirectLink
      });
    }
  }
}
