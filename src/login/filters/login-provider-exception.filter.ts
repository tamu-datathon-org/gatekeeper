import { ExceptionFilter, Catch, ArgumentsHost } from "@nestjs/common";
import { Response } from "express";
import { AuthProviderException } from "../../auth/exceptions/auth-provider.exception";

@Catch(AuthProviderException)
export class LoginProviderExceptionFilter implements ExceptionFilter {
  private templatePath = "login/index";

  catch(e: AuthProviderException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    if (e instanceof AuthProviderException) {
      let emailError = "Please sign in using your email.";
      if (e.message != "EmailAndPassword")
        emailError = `User account was made using ${e.message}. Please use the appropriate provider to login.`;
      return response.status(401).render(this.templatePath, {
        csrfToken: request.csrfToken(),
        emailPrefill: request.body.username,
        redirectLink: request.query.r || request.session.redirect,
        emailError
      });
    }

    // TODO: Add better error handling if needed.
    throw e;
  }
}
