import { Test, TestingModule } from "@nestjs/testing";
import { SignupService } from "./signup.service";
import { UserAuthService } from "../user-auth/user-auth.service";
import { ConflictException, BadRequestException } from "@nestjs/common";
import { CreateUserAuthDto } from "../user-auth/dto/create-user-auth.dto";
import { MailService } from "../mail/mail.service";
import { MockMailCoreService } from "../mail/mocks/mock-mail-core.service";
import { MailCoreService } from "../mail/mail-core.service";

class MockUserAuthService {
  async create(createUserAuth: CreateUserAuthDto) {
    if (!createUserAuth.email)
      throw new BadRequestException();

    // Existing user errors should be tested using spyOn and mockImplementation.

    if (createUserAuth.authType === "EmailAndPassword") {
      if (!createUserAuth.password)
        throw new BadRequestException();
    } else {
      if (!createUserAuth.oAuthToken)
        throw new BadRequestException();
    }
    return {email: createUserAuth.email};
  }
}

describe("SignupService", () => {
  let service: SignupService;
  let userAuthService: UserAuthService;
  let mailService: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignupService,
        MailService,
        {
          provide: MailCoreService,
          useValue: new MockMailCoreService(),
        },
        {
          provide: UserAuthService,
          useValue: new MockUserAuthService()
        }
      ]
    }).compile();

    service = module.get<SignupService>(SignupService);
    userAuthService = module.get<UserAuthService>(UserAuthService);
    mailService = module.get<MailService>(MailService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should be able to signup a user with email and password and send email", async () => {
    const signupPayload = {
      email: "testy@mcface.com",
      password: "TestPassword"
    };

    const sendEmailFunc = jest.spyOn(mailService, "sendTemplatedEmail");

    const user = await service.signupUserEmailAndPassword(signupPayload);
    expect(user).toBeDefined();
    expect(user.email).toBe(signupPayload.email);
    expect(sendEmailFunc).toHaveBeenCalled();
  });

  it("should propagate the user conflict error for a user that already exists", async () => {
    const signupPayload = {
      email: "already@exists.com",
      password: "TestPassword"
    };

    jest.spyOn(userAuthService, "create").mockImplementation(() => {
      throw new ConflictException();
    });

    try {
      await service.signupUserEmailAndPassword(signupPayload);
    } catch (e) {
      // Extract error from NestJS Exception Filter.
      const err = e.message;
      expect(err.statusCode).toEqual(409);
      expect(err.error).toEqual("Conflict");
    }
  });

  it("should propagate the bad request error for an empty email string", async () => {
    const signupPayload = {
      email: "",
      password: "TestPassword"
    };

    jest.spyOn(userAuthService, "create").mockImplementation(() => {
      throw new BadRequestException();
    });

    try {
      await service.signupUserEmailAndPassword(signupPayload);
    } catch (e) {
      // Extract error from NestJS Exception Filter.
      const err = e.message;
      expect(err.statusCode).toEqual(400);
      expect(err.error).toEqual("Bad Request");
    }
  });

  it("should propagate the bad request error for an empty password", async () => {
    const signupPayload = {
      email: "testy@mcface.com",
      password: ""
    };

    jest.spyOn(userAuthService, "create").mockImplementation(() => {
      throw new BadRequestException();
    });

    try {
      await service.signupUserEmailAndPassword(signupPayload);
    } catch (e) {
      // Extract error from NestJS Exception Filter.
      const err = e.message;
      expect(err.statusCode).toEqual(400);
      expect(err.error).toEqual("Bad Request");
    }
  });
});
