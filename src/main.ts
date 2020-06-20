import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";
import * as session from "express-session";
import { join } from "path";
import * as cookieParser from "cookie-parser";
import passport = require("passport");
import csrf = require("csurf");
import bodyParser = require("body-parser");
import { Request, Response, NextFunction } from "express";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: console
  });

  /**
   * In production the real host header will be in x-forwarded-host, as the host header will be squashed as the heroku url
   * https://vercel.com/docs/v2/edge-network/headers#inlinecode
   */
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (process.env.NODE_ENV === "prod") {
      req.headers.host = req.header("x-forwarded-host");
      req.headers["x-forwarded-proto"] = "https";
      req.protocol = "https";
    }
    next();
  });

  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      saveUninitialized: false,
      resave: false
    })
  );

  app.use(cookieParser());
  app.use(bodyParser.urlencoded({ extended: false }));

  app.use(passport.initialize());
  app.use(passport.session());

  // Use session level CRSF for better protection. (only on login and signup endpoints)
  app.use("/login", csrf());
  app.use("/signup", csrf());

  app.useStaticAssets(join(__dirname, "..", "public"));
  app.setBaseViewsDir(join(__dirname, "..", "views"));
  app.setViewEngine("ejs");

  await app.listen(process.env.PORT || 3000); // listen on $PORT but default to 3000 (needed for heroku)
}
bootstrap();
