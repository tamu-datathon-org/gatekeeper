import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  UnauthorizedException,
  NotFoundException,
} from "@nestjs/common";
import { Response } from "express";
import { UserNotVerifiedException } from "../../auth/exceptions/user-not-verified.exception";
import { Constants } from "../../common/constants";

@Catch(HttpException)
export class LoginRootExceptionFilter implements ExceptionFilter {
  private templatePath = "login/index";

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    if (exception instanceof UnauthorizedException)
      return response.status(401).render(this.templatePath, {
        csrfToken: request.csrfToken(),
        emailPrefill: request.body.username,
        redirectLink: request.query.r || request.session.redirect,
        emailError: "Email and password combination is invalid.",
      });
    if (exception instanceof NotFoundException)
      return response.status(404).render(this.templatePath, {
        csrfToken: request.csrfToken(),
        emailPrefill: request.body.username,
        redirectLink: request.query.r || request.session.redirect,
        emailError: "User with the given email does not exist.",
      });
    if (exception instanceof UserNotVerifiedException) {
      return response
        .status(401)
        .render("signup/resend-verification-email.ejs", {
          redirectLink: request.query.r || Constants.defaultRedirect,
        });
    }

    // TODO: Add better error handling if needed.
    throw exception;
  }
}
