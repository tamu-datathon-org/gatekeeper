import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from "@nestjs/common";
import { Observable } from "rxjs";

// NOTE: This MUST be used in conjuction (and after) an AuthGuard.
// This uses the `user` object that AuthGuards attach to the request.
// Will throw an error if the user object is not found.

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    if (!request.user) {
      throw new UnauthorizedException();
    }
    if (!request.user.isAdmin) {
      throw new ForbiddenException("User must be admin.");
    }
    return true;
  }
}
