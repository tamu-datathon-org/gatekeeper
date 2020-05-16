import { Injectable } from "@nestjs/common";
import * as EmailValidator from "email-validator";

@Injectable()
export class ValidatorService {
  validateEmail(email: string): boolean {
    return EmailValidator.validate(email);
  }

  validatePassword(password: string): boolean {
    // Add more complex password validation if needed.
    return password.length >= 6;
  }
}
