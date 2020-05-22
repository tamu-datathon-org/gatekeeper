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
