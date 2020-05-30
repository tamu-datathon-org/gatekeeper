import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import {
  DefaultGalaxyIntegrations,
  GatekeeperGalaxyIntegration
} from "../constants/default-integrations";

/**
 * Returns the the longest string in the given list that is a prefix of the given key.
 *
 * @param  {string} key The string that will be searched for prefixes
 * @param  {string[]} prefixes List of strings that will be checked with the key
 */
export const getLongestMatchingPrefix = (key: string, prefixes: string[]) => {
  let longestPathPrefix = "";
  let maxNumMatchingTokens = 0;
  key = key.toLowerCase(); //
  const keyPathTokens: string[] = key.split("/").filter(String); // Filter undefined values.

  prefixes.forEach(prefix => {
    const prefixTokens: string[] = prefix
      .toLowerCase()
      .split("/")
      .filter(String); // Filter undefined values.
    let numMatches = 0;
    // Check how many path tokens match as a prefix.
    for (let i = 0; i < prefixTokens.length && i < keyPathTokens.length; i++) {
      if (keyPathTokens[i] === prefixTokens[i]) numMatches++;
      else break;
    }

    if (numMatches > maxNumMatchingTokens) {
      longestPathPrefix = prefix;
      maxNumMatchingTokens = numMatches;
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
