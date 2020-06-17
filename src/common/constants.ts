export const Constants = {
  defaultRedirect: "/",
  validHosts: [
    "localhost:4000",
    "localhost:8080",
    "tamudatathon.com"
  ],
  validSubdomainHosts: [
    "tamudatathon.com",
    "tamudatathon.now.sh",
    "tamudatathon.vercel.app"
  ]
};

export const validDomainRegex = /^((?:(?:(?:\w[\.\-\+]?)*)\w)+)((?:(?:(?:\w[\.\-\+]?){0,62})\w)+)\.(\w{2,6})$/;
