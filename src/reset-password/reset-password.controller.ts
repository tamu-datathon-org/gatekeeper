import {
  Controller,
  Get,
  Render,
  Req,
  Post,
  Body,
  NotFoundException,
  Res,
  Query,
} from "@nestjs/common";
import { QueryWithDefault } from "../common/decorators/query-with-default.decorator";
import { RedirectGalaxyIntegration } from "../galaxy-integrations/decorators/redirect-galaxy-integration.decorator";
import { GalaxyIntegrationConfig } from "../galaxy-integrations/interfaces/galaxy-integration";
import { ValidatedHost } from "../common/decorators/validated-host.decorator";
import { ResetPasswordService } from "./reset-password.service";
import { AuthProviderException } from "../auth/exceptions/auth-provider.exception";
import { ValidatorService } from "../validator/validator.service";

@Controller("reset-password")
export class ResetPasswordController {
  constructor(
    private resetPaswordService: ResetPasswordService,
    private validatorService: ValidatorService
  ) {}

  @Get("/")
  @Render("reset-password/index")
  root(
    @Req() req,
    @QueryWithDefault("r") redirectLink: string | undefined,
    @RedirectGalaxyIntegration() integrationConfig: GalaxyIntegrationConfig
  ) {
    return {
      ...integrationConfig,
      csrfToken: req.csrfToken(),
      redirectLink,
    };
  }

  @Post("/")
  async sendResetPasswordLink(
    @Req() req,
    @Body("email") userEmail: string,
    @QueryWithDefault("r") redirectLink: string | undefined,
    @ValidatedHost() host: string,
    @RedirectGalaxyIntegration() integrationConfig: GalaxyIntegrationConfig,
    @Res() res
  ) {
    try {
      await this.resetPaswordService.handleResetPasswordRequest(
        userEmail,
        host,
        redirectLink
      );
      return res.render("reset-password/reset-password-link-sent", {
        ...integrationConfig,
        userEmail: userEmail,
      });
    } catch (e) {
      if (e instanceof NotFoundException)
        return res.status(409).render("reset-password/index", {
          csrfToken: req.csrfToken(),
          redirectLink,
          emailPrefill: userEmail,
          emailError: e.message,
        });
      if (e instanceof AuthProviderException)
        return res.status(409).render("reset-password/index", {
          csrfToken: req.csrfToken(),
          redirectLink,
          emailPrefill: userEmail,
          emailError: `The user with the given was created using ${e.message}. Passwords cannot be reset for accounts created using ${e.message}.`,
        });

      throw e;
    }
  }

  @Get("reset")
  async getResetPage(
    @Req() req,
    @Query("user") userJwt: string,
    @QueryWithDefault("r") redirectLink: string | undefined,
    @Res() res
  ) {
    try {
      this.resetPaswordService.validateResetPasswordRequest(userJwt);
      return res.render("reset-password/reset-page", {
        csrfToken: req.csrfToken(),
        userJwt,
        redirectLink,
      });
    } catch (e) {
      return res.status(400).render("reset-password/reset-failure", {
        redirectLink,
      });
    }
  }

  @Post("reset")
  async resetPassword(
    @Req() req,
    @Body("password") password: string,
    @Body("confirmPassword") confirmPassword: string,
    @Query("user") userJwt: string,
    @QueryWithDefault("r") redirectLink: string | undefined,
    @Res() res
  ) {
    try {
      // Validate new password.
      let validationErrors = undefined;
      if (!password || !this.validatorService.validatePassword(password))
        validationErrors = {
          passwordError: "A password must contain at least 6 characters.",
        };
      else if (!confirmPassword || confirmPassword !== password)
        validationErrors = {
          confirmPasswordError: "Value must match the given password.",
        };

      if (validationErrors)
        return res.status(400).render("reset-password/reset-page", {
          csrfToken: req.csrfToken(),
          redirectLink,
          userJwt,
          ...validationErrors,
        });

      await this.resetPaswordService.resetPassword(userJwt, password);
      return res.status(400).render("reset-password/reset-success", {
        redirectLink,
      });
    } catch (e) {
      return res.status(400).render("reset-password/reset-failure", {
        redirectLink,
      });
    }
  }
}
