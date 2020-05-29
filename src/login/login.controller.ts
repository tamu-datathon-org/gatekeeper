import {
  Controller,
  Get,
  Post,
  Render,
  Req,
  Res,
  UseFilters,
  UseGuards
} from "@nestjs/common";
import { AuthService } from "../auth/auth.service";
import { LoginRootExceptionFilter } from "./filters/login-root-exception.filter";
import { AuthGuard } from "@nestjs/passport";
import { LoginProviderExceptionFilter } from "./filters/login-provider-exception.filter";
import { QueryWithDefault } from "../common/decorators/query-with-default.decorator";
import { User } from "../user/interfaces/user.interface";
import { GetUser } from "../user/user-auth.decorator";
import { RedirectGalaxyIntegration } from "../galaxy-integrations/decorators/redirect-galaxy-integration.decorator";
import { GalaxyIntegrationConfig } from "../galaxy-integrations/interfaces/galaxy-intergration";

@Controller("login")
export class LoginController {
  constructor(private authService: AuthService) {}

  @Get("/")
  @Render("login/index")
  root(
    @Req() req,
    @QueryWithDefault("r", "/auth/me") redirectLink: string | undefined,
    @RedirectGalaxyIntegration() integrationConfig: GalaxyIntegrationConfig,
  ) {
    return {
      ...integrationConfig,
      csrfToken: req.csrfToken(),
      redirectLink
    };
  }

  @Get("google")
  @UseFilters(new LoginProviderExceptionFilter())
  @UseGuards(AuthGuard("Google"))
  googleLogin() {
    // Passport handles redirects to google's login pages.
  }

  @Get("google/callback")
  @UseFilters(new LoginProviderExceptionFilter())
  // The Strategy (GoogleStrategy) does not re-validate for this endpoint
  @UseGuards(AuthGuard("Google"))
  googleLoginCallback(@Req() req, @GetUser() user: User, @Res() res) {
    // TODO: Add error handling for when user does not exist. That mostly shouldn't happen due to the Google AuthGuard
    this.authService.applyJwt(user, res);
    const redirect = req.session.redirect || "/auth/me";
    req.session.redirect = null;
    // TODO: Based on how redirects are done, implement the propagation of the URL from the original request to the callback
    return res.redirect(redirect);
  }

  @Get("facebook")
  @UseGuards(AuthGuard("Facebook"))
  facebookLogin() {
    // Passport handles redirects to google's login pages.
  }

  @UseFilters(new LoginProviderExceptionFilter())
  @Get("facebook/callback")
  // The Strategy (GoogleStrategy) does not re-validate for this endpoint
  @UseGuards(AuthGuard("Facebook"))
  facebookLoginCallback(@Req() req, @GetUser() user: User, @Res() res) {
    // TODO: Add error handling for when user does not exist. That mostly shouldn't happen due to the Facebook AuthGuard
    this.authService.applyJwt(user, res);
    const redirect = req.session.redirect || "/auth/me";
    req.session.redirect = null;
    // TODO: Based on how redirects are done, implement the propagation of the URL from the original request to the callback
    return res.redirect(redirect);
  }

  @UseFilters(LoginRootExceptionFilter, LoginProviderExceptionFilter) // Need exception filter to handle guard fails (maintain order).
  @UseGuards(AuthGuard("local")) // used to parse out the login credentials and generate a user
  @Post("/")
  loginEmailAndPassword(
    @GetUser() user: User,
    @QueryWithDefault("r", "/auth/me") redirect: string | undefined,
    @Res() res
  ) {
    this.authService.applyJwt(user, res);
    // TODO: make sure the redirect is only a relative url and cannot be a URL outside (like https://google.com)
    return res.redirect(redirect);
  }
}
