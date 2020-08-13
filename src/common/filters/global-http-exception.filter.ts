import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  UnauthorizedException
} from "@nestjs/common";
import { Response } from "express";
import { UserNotVerifiedException } from "../../auth/exceptions/user-not-verified.exception";
import fetch from "node-fetch";

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    // Send exception to r2d2 slackbot if in production.
    if (process.env.NODE_ENV === "prod") {
      const payload = {
        source: "GATEKEEPER",
        error: `${exception.stack}\n${JSON.stringify(exception, undefined, 2)}`
      };
      fetch(`${process.env.SLACKBOT_BASE_URL}slack/log-error`, {
        method: "post",
        body: JSON.stringify(payload, undefined, 2),
        headers: {
          "Content-Type": "application/json",
          "Gatekeeper-Integration": process.env
            .GATEKEEPER_INTEGRATION_SECRET as string
        }
      });
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
        redirectLink: `/auth${request.path}`
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
  }
}
