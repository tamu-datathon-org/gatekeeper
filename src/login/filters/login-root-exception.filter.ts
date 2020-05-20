import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  UnauthorizedException,
  NotFoundException
} from "@nestjs/common";
import { Response } from "express";

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
        emailError: "Email and password combination is invalid."
      });
    else if (exception instanceof NotFoundException)
      return response.status(404).render(this.templatePath, {
        csrfToken: request.csrfToken(),
        emailPrefill: request.body.username,
        emailError: "User with the given email does not exist."
      });

    // TODO: Add better error handling if needed.
    throw exception;
  }
}
