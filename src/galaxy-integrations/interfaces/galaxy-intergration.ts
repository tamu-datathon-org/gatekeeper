export interface GalaxyIntegrationConfig {
  // Config with longest matching path prefix will be used
  // as template variables for viewz.
  pathPrefix: string;

  // To be shown / rendered to user-facing views.
  appName?: string;
  // To be used internally;
  appId?: string;

  /* Login Page Variables */
  loginPageSubtext?: string;

  /* Signup Page Variables */
  signupPageSubtext?: string;
}

export const newGalaxyIntegrationConfig = (
  config: GalaxyIntegrationConfig
): GalaxyIntegrationConfig => {
  // Defining variables to be used in constant config values.
  const appName = config.appName || "TAMU Datathon";

  return {
    /* path is required in GalaxyIntegrationConfig */
    pathPrefix: config.pathPrefix,

    appName,
    appId: config.appId || "gatekeeper",

    loginPageSubtext: config.loginPageSubtext || `to continue to ${appName}`,

    signupPageSubtext: config.signupPageSubtext || `to continue to ${appName}`
  };
};
