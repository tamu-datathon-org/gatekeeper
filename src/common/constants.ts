export const Constants = {
  defaultRedirect: "/",
  validHosts: ["tamudatathon.com"], // Localhost is considered valid by default.
  validSubdomainHosts: [
    "tamudatathon.com",
    "tamudatathon.now.sh",
    "tamudatathon.vercel.app"
  ]
};

export const validDomainRegex = /^((?:(?:(?:\w[.\-+]?)*)\w)+)((?:(?:(?:\w[.\-+]?){0,62})\w)+)\.(\w{2,6})$/;
