import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });

if (process.env.NODE_ENV !== "test") {
  throw Error("Test environment mismatch!");
}
