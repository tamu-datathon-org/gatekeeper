import { Injectable, ExecutionContext } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

/**
 * Guard for Login Endpoint
 */
@Injectable()
export class LoginGuard extends AuthGuard("local") {
  /**
   * Returns value indicating whether or not the current request is allowed to proceed.
   * @param context Current execution context. Provides access to details about the current request pipeline.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const result = (await super.canActivate(context)) as boolean;
    await super.logIn(request);
    return result;
  }
}
