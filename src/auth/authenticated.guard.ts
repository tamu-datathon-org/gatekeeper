import {
  ExecutionContext,
  Injectable,
  CanActivate,
  UnauthorizedException
} from "@nestjs/common";

/**
 * Guard for endpoints that require authentication to work
 */
@Injectable()
export class AuthenticatedGuard implements CanActivate {
  /**
   * Returns value indicating whether or not the current request is allowed to proceed.
   * @param context Current execution context. Provides access to details about the current request pipeline.
   */
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();

    try {
      if (request.session.passport.user) {
        return true;
      }
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
}
