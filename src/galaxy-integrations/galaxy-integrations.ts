import { newGalaxyIntegrationConfig } from "./interfaces/galaxy-integration";

export const GatekeeperGalaxyIntegration = newGalaxyIntegrationConfig({
  pathPrefix: "/auth",
  appName: "TAMU Datathon 2020"
});

export const DefaultGalaxyIntegrations = {
  "/auth": GatekeeperGalaxyIntegration,
  "/apply": newGalaxyIntegrationConfig({
    pathPrefix: "/apply",
    appName: "TAMU Datathon 2020 Applications"
  }),
  "/workshops": newGalaxyIntegrationConfig({
    pathPrefix: "/workshops",
    appName: "TAMU Datathon 2020 Workshops"
  })
};
