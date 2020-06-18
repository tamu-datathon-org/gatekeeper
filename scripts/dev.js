const express = require("express");
const httpProxy = require("http-proxy");
const proxy = new httpProxy();

proxy.on("error", (err, req, res) => {
  console.error(err);
  res.status(500).send("Couldn't connect");
});

const app = express();
const port = process.env.PORT || 4000;

const proxyToLocalhost = (req, res, next) => {
  try {
    const path = req.originalUrl.split("/").slice(1);
    let url = req.originalUrl;
    if (path[0] == "auth") {
      url = path.slice(1).length >= 1 ? path.slice(1).join("/") : "";
    }
    req.originalUrl = url;
    //req.headers["host"] = "tamudatathon.com"; // Hosts need to be preserved for oauth strategies
    const target = `http://localhost:3000/${url || ""}`;
    const config = {
      target,
      prependPath: true,
      ignorePath: true,
      xfwd: true,
      secure: false,
      cookieDomainRewrite: { "localhost:3000": `localhost:${port}` }
    };
    proxy.web(req, res, config);
  } catch (e) {
    console.error(e);
    res.status(500).send();
  }
};

app.all("/auth", proxyToLocalhost);
app.all("/auth/*", proxyToLocalhost);

app.all("*", (req, res) => {
  try {
    req.headers["host"] = "gigabowser.now.sh";
    proxy.web(req, res, {
      target: `https://gigabowser.now.sh`,
      changeOrigin: true,
      cookieDomainRewrite: { "tamudatathon.com": `localhost:${port}` }
    });
  } catch (e) {
    console.error(e);
    res.status(500).send();
  }
});

app.listen(port, () => {
  console.log(`[Proxy Server] listening on ${port}!`);
});
