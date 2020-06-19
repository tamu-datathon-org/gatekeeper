import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";
import * as session from "express-session";
import { join } from "path";
import * as cookieParser from "cookie-parser";
import passport = require("passport");
import csrf = require("csurf");
import bodyParser = require("body-parser");

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: console
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
  app.use("/reset-password", csrf());

  app.useStaticAssets(join(__dirname, "..", "public"));
  app.setBaseViewsDir(join(__dirname, "..", "views"));
  app.setViewEngine("ejs");

  await app.listen(process.env.PORT || 3000); // listen on $PORT but default to 3000 (needed for heroku)
}
bootstrap();
