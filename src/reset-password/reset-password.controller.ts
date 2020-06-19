import { Controller, Get, Render, Req, Post, Body, NotFoundException, Res } from '@nestjs/common';
import { QueryWithDefault } from 'src/common/decorators/query-with-default.decorator';
import { RedirectGalaxyIntegration } from 'src/galaxy-integrations/decorators/redirect-galaxy-integration.decorator';
import { GalaxyIntegrationConfig } from 'src/galaxy-integrations/interfaces/galaxy-integration';
import { ValidatedHost } from 'src/common/decorators/validated-host.decorator';
import { ResetPasswordService } from './reset-password.service';
import { AuthProviderException } from 'src/auth/exceptions/auth-provider.exception';

@Controller('reset-password')
export class ResetPasswordController {
  constructor(
    private resetPaswordService: ResetPasswordService,
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
      redirectLink
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
      await this.resetPaswordService.sendResetPasswordEmailForUser(userEmail, host, redirectLink);
      return res.render("reset-password/reset-password-link-sent", {
        ...integrationConfig,
        userEmail: userEmail
      });
    } catch (e) {
      if (e instanceof NotFoundException)
        return res.status(409).render("reset-password/index", {
          csrfToken: req.csrfToken(),
          redirectLink,
          emailPrefill: userEmail,
          emailError: e.message
        });
      if (e instanceof AuthProviderException)
        return res.status(409).render("reset-password/index", {
          csrfToken: req.csrfToken(),
          redirectLink,
          emailPrefill: userEmail,
          emailError: `The user with the given was created using ${e.message}. Passwords cannot be reset for accounts created using ${e.message}.`
        });
        
      throw e;
    }
  }
}
