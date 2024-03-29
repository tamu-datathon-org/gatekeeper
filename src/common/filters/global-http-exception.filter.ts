import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  UnauthorizedException,
} from "@nestjs/common";
import { Response } from "express";
import { UserNotVerifiedException } from "../../auth/exceptions/user-not-verified.exception";
import fetch from "node-fetch";

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    console.error(exception);
    try {
      // Send server exceptions to r2d2 slackbot, if in production mode.
      if (
        process.env.NODE_ENV === "prod" &&
        exception.getStatus &&
        exception.getStatus() >= 500
      ) {
        const payload = {
          source: "GATEKEEPER",
          error: `${exception.stack}\n${JSON.stringify(
            exception,
            undefined,
            2
          )}`,
        };
      }

      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest();

      // don't render views or do redirects if its an api request
      const isAPIRequest = request.headers.accept === "application/json";

      if (isAPIRequest && exception instanceof HttpException) {
        return response
          .status(exception.getStatus())
          .json(exception.getResponse());
      } else if (isAPIRequest && !(exception instanceof HttpException)) {
        console.error(exception);
        return response
          .status(500)
          .json(new HttpException("Internal Server Error", 500));
      }

      // render views if it is not an API request
      if (exception instanceof UserNotVerifiedException) {
        return response.render("signup/resend-verification-email.ejs", {
          redirectLink: `/auth${request.path}`,
        });
      } else if (exception instanceof UnauthorizedException) {
        return response.redirect(`/auth/login?r=/auth${request.path}`);
      }

      // Default Exception Case: Just return the error
      if (exception instanceof HttpException)
        // turns out normal Errors can come through here
        return response.status(exception.getStatus()).json(exception);
      else {
        console.error(exception);
        return response
          .status(500)
          .json(new HttpException("Internal Server Error", 500));
      }
    } catch (e) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      console.error("GlobalExceptionHandlerError, oh the irony", e);
      return response
        .status(500)
        .json(new HttpException("Internal Server Error", 500));
    }
  }
}
