import { newGalaxyIntegrationConfig } from "./interfaces/galaxy-integration";

export const GatekeeperGalaxyIntegration = newGalaxyIntegrationConfig({
  pathPrefix: "/",
  appName: "TAMU Datathon",
});

export const DefaultGalaxyIntegrations = {
  "/": GatekeeperGalaxyIntegration,
  "/auth": GatekeeperGalaxyIntegration,
  "/apply": newGalaxyIntegrationConfig({
    pathPrefix: "/apply",
    appName: "TD 2021 Application Portal",
    loginPageSubtext: "to apply for TAMU Datathon 2024",
    signupPageSubtext: "afterwards, you'll be sent back to your application",
    verificationPageSubtext:
      "afterwards, you'll be sent back to your application",
  }),
  "/events": newGalaxyIntegrationConfig({
    pathPrefix: "/events",
    appName: "TD Events",
    loginPageSubtext: "to see TD Events/Workshops",
    signupPageSubtext: "afterwards, you'll be sent back to the events page",
    verificationPageSubtext:
      "afterwards, you'll be sent back to the events page",
  }),
  "/discord": newGalaxyIntegrationConfig({
    pathPrefix: "/discord",
    appName: "TD Discord",
    loginPageSubtext: "to join the TD Discord Server",
    signupPageSubtext:
      "afterwards, you can continue joining the TD Discord Server",
    verificationPageSubtext:
      "afterwards, you can continue joining the TD Discord Server",
  }),
  "/guild": newGalaxyIntegrationConfig({
    pathPrefix: "/guild",
    appName: "TD Discord",
    loginPageSubtext: "to join the TD Discord Server",
    signupPageSubtext:
      "afterwards, you can continue joining the TD Discord Server",
    verificationPageSubtext:
      "afterwards, you can continue joining the TD Discord Server",
  }),
  "/projects": newGalaxyIntegrationConfig({
    pathPrefix: "/projects",
    appName: "hacker submissions",
    loginPageSubtext: "to make project submissions",
    signupPageSubtext:
      "afterwards, you can continue doing stuff with project submissions",
    verificationPageSubtext:
      "afterwards, you can continue doing stuff with project submissions",
  }),
  "/bulletin": newGalaxyIntegrationConfig({
    pathPrefix: "/bulletin",
    appName: "hacker submissions",
    loginPageSubtext: "to make project submissions",
    signupPageSubtext:
      "afterwards, you can continue doing stuff with project submissions",
    verificationPageSubtext:
      "afterwards, you can continue doing stuff with project submissions",
  }),
  "/forms": newGalaxyIntegrationConfig({
    pathPrefix: "/forms",
    appName: "TD Forms",
    loginPageSubtext: "to continue to the form",
    signupPageSubtext: "afterwards, you can continue with your form",
    verificationPageSubtext: "afterwards, you can continue with your form",
  }),
};
