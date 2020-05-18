import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  UnauthorizedException
} from "@nestjs/common";
import { Response } from "express";

@Catch(HttpException)
export class LoginRootExceptionFilter implements ExceptionFilter {
  private templatePath = "login/index";

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    if (exception instanceof UnauthorizedException) {
      return response.status(401).render(this.templatePath, {
        csrfToken: request.csrfToken(),
        emailPrefill: request.body.username,
        emailError: "Email and password combination is invalid."
      });
    }

    // TODO: Add better error handling if needed.
    throw exception;
  }
}
