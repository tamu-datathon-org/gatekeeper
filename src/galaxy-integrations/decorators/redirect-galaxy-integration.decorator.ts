import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import {
  DefaultGalaxyIntegrations,
  GatekeeperGalaxyIntegration
} from "../constants/default-integrations";

const getLongestMatchingPrefix = (key, prefixes) => {
  let longestPathPrefix = "";

  prefixes.forEach(prefix => {
    if (key.startsWith(prefix)) {
      if (prefix.length > longestPathPrefix.length) longestPathPrefix = prefix;
    }
  });

  return longestPathPrefix;
};

/*
 * Decorator that returns the GalaxyIntegrationConfig for
 * the redirect path specified in the request.
 * Uses the DefaultGalaxyIntegrations constant.
 */
export const RedirectGalaxyIntegration = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const redirectPath = request.query?.r || "/auth/me";

    // Use default gatekeeper pathPrefix if no matching prefix.
    const longestPathPrefix =
      getLongestMatchingPrefix(
        redirectPath,
        Object.keys(DefaultGalaxyIntegrations)
      ) || GatekeeperGalaxyIntegration.pathPrefix;
    return DefaultGalaxyIntegrations[longestPathPrefix];
  }
);
