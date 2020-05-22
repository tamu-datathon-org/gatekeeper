import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException
} from "@nestjs/common";
import { Response } from "express";
import { JwtUserNotVerifiedException } from "../../auth/exceptions/jwt-user-not-verified.exception";

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    if (exception instanceof JwtUserNotVerifiedException) {
      return response
        .status(401)
        .render("signup/resend-verification-email.ejs", {
          redirectLink: request.query.r || "/auth/me"
        });
    }

    // TODO: Add better error handling if needed.
    throw exception;
  }
}
