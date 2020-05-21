import { Test, TestingModule } from "@nestjs/testing";
import { SignupService } from "./signup.service";
import { UserAuthService } from "../user-auth/user-auth.service";
import { ConflictException, BadRequestException } from "@nestjs/common";
import { MailService } from "../mail/mail.service";
import { MockMailCoreService } from "../mail/mocks/mock-mail-core.service";
import { MailCoreService } from "../mail/mail-core.service";
import { JwtService, JwtModule } from "@nestjs/jwt";
import { UserAuth } from "../user-auth/interfaces/user-auth.interface";

class MockUserAuthService {
  async create() {
    /* Should be overriden using spyOn */
  }
  async findByEmail() {
    /* Should be overriden using spyOn */
  }
  async findById() {
    /* Should be overriden using spyOn */
  }
}

describe("SignupService", () => {
  let service: SignupService;
  let userAuthService: UserAuthService;
  let mailService: MailService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: "TEST_SECRET" })],
      providers: [
        SignupService,
        MailService,
        {
          provide: MailCoreService,
          useValue: new MockMailCoreService()
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
    jwtService = module.get<JwtService>(JwtService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should be able to signup a user with email and password and send email", async () => {
    const signupPayload = {
      email: "testy@mcface.com",
      password: "TestPassword",
      confirmPassword: "TestPassword"
    };

    jest.spyOn(userAuthService, "create").mockImplementation(async () => {
      return { email: "testy@mcface.com" } as UserAuth;
    });

    const sendEmailFunc = jest.spyOn(mailService, "sendTemplatedEmail");

    const user = await service.signupUserEmailAndPassword(
      signupPayload,
      "/auth/me"
    );
    expect(user).toBeDefined();
    expect(user.email).toBe(signupPayload.email);
    expect(sendEmailFunc).toHaveBeenCalled();
  });

  it("should propagate the user conflict error for a user that already exists", async () => {
    const signupPayload = {
      email: "already@exists.com",
      password: "TestPassword",
      confirmPassword: "TestPassword"
    };

    jest.spyOn(userAuthService, "create").mockImplementation(() => {
      throw new ConflictException();
    });

    try {
      await service.signupUserEmailAndPassword(signupPayload, "/auth/me");
    } catch (e) {
      // Extract error from NestJS Exception Filter.
      const err = e.response;
      expect(err.statusCode).toEqual(409);
      expect(err.message).toEqual("Conflict");
    }
  });

  it("should propagate the bad request error for an empty email string", async () => {
    const signupPayload = {
      email: "",
      password: "TestPassword",
      confirmPassword: "TestPassword"
    };

    jest.spyOn(userAuthService, "create").mockImplementation(() => {
      throw new BadRequestException();
    });

    try {
      await service.signupUserEmailAndPassword(signupPayload, "/auth/me");
    } catch (e) {
      // Extract error from NestJS Exception Filter.
      const err = e.response;
      expect(err.statusCode).toEqual(400);
      expect(err.message).toEqual("Bad Request");
    }
  });

  it("should propagate the bad request error for an empty password", async () => {
    const signupPayload = {
      email: "testy@mcface.com",
      password: "",
      confirmPassword: ""
    };

    jest.spyOn(userAuthService, "create").mockImplementation(() => {
      throw new BadRequestException();
    });

    try {
      await service.signupUserEmailAndPassword(signupPayload, "/auth/me");
    } catch (e) {
      // Extract error from NestJS Exception Filter.
      const err = e.response;
      expect(err.statusCode).toEqual(400);
      expect(err.message).toEqual("Bad Request");
    }
  });

  it("should return a valid user on a valid signup confirmation", async () => {
    const userJwt = jwtService.sign(
      { email: "testy@mctestface.com" },
      { expiresIn: "1h" }
    );

    jest.spyOn(userAuthService, "findByEmail").mockImplementation(async () => {
      return { email: "testy@mctestface.com" } as UserAuth;
    });

    const user = await service.confirmUserSignup(userJwt);
    expect(user.email).toEqual("testy@mctestface.com");
  });

  it("should throw an error when given an invalid JWT", async () => {
    const userJwt = "Thisis.aninvalid.jwt";

    jest.spyOn(userAuthService, "findByEmail").mockImplementation(async () => {
      return { email: "testy@mctestface.com" } as UserAuth;
    });

    const confirmPromise = service.confirmUserSignup(userJwt);
    await expect(confirmPromise).rejects.toThrow();
  });

  it("should throw an error when given an expired JWT", async () => {
    const userJwt = jwtService.sign(
      { email: "testy@mctestface.com" },
      { expiresIn: "0s" }
    );

    jest.spyOn(userAuthService, "findByEmail").mockImplementation(async () => {
      return { email: "testy@mctestface.com" } as UserAuth;
    });

    const confirmPromise = service.confirmUserSignup(userJwt);
    await expect(confirmPromise).rejects.toThrow();
  });

  it("should throw an error when given an non-existent user", async () => {
    const userJwt = jwtService.sign(
      { email: "testy@mctestface.com" },
      { expiresIn: "1h" }
    );

    jest.spyOn(userAuthService, "findByEmail").mockImplementation(async () => {
      return null; // UserAuthService returns null when user does not exist.
    });

    const confirmPromise = service.confirmUserSignup(userJwt);
    await expect(confirmPromise).rejects.toThrow("Invalid user");
  });
});
