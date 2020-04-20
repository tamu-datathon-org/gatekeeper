import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as session from "express-session";
import * as cookieParser from "cookie-parser";
import passport = require("passport");

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
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

  app.use(passport.initialize());
  app.use(passport.session());

  await app.listen(3000);
}
bootstrap();
