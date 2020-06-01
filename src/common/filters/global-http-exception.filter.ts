import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  UnauthorizedException
} from "@nestjs/common";
import { Response } from "express";
import { UserNotVerifiedException } from "../../auth/exceptions/user-not-verified.exception";
import { GatekeeperGalaxyIntegration } from "../../galaxy-integrations/galaxy-integrations";

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    if (exception instanceof UserNotVerifiedException) {
      return response
        .status(401)
        .render("signup/resend-verification-email.ejs", {
          redirectLink: request.query.r || "/auth/me"
        });
    } else if (exception instanceof UnauthorizedException) {
      return response.status(401).render("login/index", {
        ...GatekeeperGalaxyIntegration,
        csrfToken: request.csrfToken(),
        redirectLink: "/auth/me"
      });
    }

    // TODO: maybe we should just redirect to /auth/login if status code is 401

    // Default Exception Case: Just return the error
    if (exception instanceof HttpException)
      // turns out normal Errors can come through here
      return response
        .status(exception.getStatus())
        .json(exception.getResponse());
    else
      return response
        .status(500)
        .json(new HttpException("Internal Server Error", 500).getResponse());
  }
}
