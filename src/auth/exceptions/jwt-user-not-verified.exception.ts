import { HttpException } from "@nestjs/common";

export class JwtUserNotVerifiedException extends HttpException {}
