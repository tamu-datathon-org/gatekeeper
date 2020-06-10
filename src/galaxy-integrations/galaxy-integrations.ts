import { newGalaxyIntegrationConfig } from "./interfaces/galaxy-integration";

export const GatekeeperGalaxyIntegration = newGalaxyIntegrationConfig({
  pathPrefix: "/",
  appName: "TAMU Datathon 2020"
});

export const DefaultGalaxyIntegrations = {
  "/": GatekeeperGalaxyIntegration,
  "/apply": newGalaxyIntegrationConfig({
    pathPrefix: "/apply",
    appName: "TAMU Datathon 2020 Applications"
  }),
  "/workshops": newGalaxyIntegrationConfig({
    pathPrefix: "/workshops",
    appName: "TAMU Datathon 2020 Workshops"
  })
};
