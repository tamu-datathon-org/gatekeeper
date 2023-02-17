import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Observable } from "rxjs";

@Injectable()
export class GalaxyIntegrationGuard implements CanActivate {
  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    if (
      request.headers["gatekeeper-integration"] &&
      request.headers["gatekeeper-integration"] ===
        process.env.GATEKEEPER_INTEGRATION_SECRET
    ) {
      return true;
    }
    return false;
  }
}
