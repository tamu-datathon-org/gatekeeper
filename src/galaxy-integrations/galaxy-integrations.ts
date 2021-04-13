import { newGalaxyIntegrationConfig } from "./interfaces/galaxy-integration";

export const GatekeeperGalaxyIntegration = newGalaxyIntegrationConfig({
  pathPrefix: "/",
  appName: "TAMU Datathon 2020"
});

export const DefaultGalaxyIntegrations = {
  "/": GatekeeperGalaxyIntegration,
  "/auth": GatekeeperGalaxyIntegration,
  "/apply": newGalaxyIntegrationConfig({
    pathPrefix: "/apply",
    appName: "TAMU Datathon 2020 Applications"
  }),
  "/events": newGalaxyIntegrationConfig({
    pathPrefix: "/events",
    appName: "TAMU Datathon 2020 Events"
  }),
  "/mailing": newGalaxyIntegrationConfig({
    pathPrefix: "/mailing",
    appName: "TAMU Datathon 2020 Mailing"
  }),
  "/workshops": newGalaxyIntegrationConfig({
    pathPrefix: "/workshops",
    appName: "TAMU Datathon 2020 Workshops"
  })
};
