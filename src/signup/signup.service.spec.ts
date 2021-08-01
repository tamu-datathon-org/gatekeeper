import { Test, TestingModule } from "@nestjs/testing";
import { SignupService } from "./signup.service";
import { UserAuthService } from "../user-auth/user-auth.service";
import { ConflictException, BadRequestException } from "@nestjs/common";
import { MailService } from "../mail/mail.service";
import { MockMailCoreService } from "../mail/mocks/mock-mail-core.service";
import { MailCoreService } from "../mail/mail-core.service";
import { JwtService, JwtModule } from "@nestjs/jwt";
import { UserAuth } from "../user-auth/interfaces/user-auth.interface";
import { UserService } from "../user/user.service";
import { User } from "../user/interfaces/user.interface";
import { AuthLinkGeneratorService } from "../auth/auth-link-generator.service";

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

class MockUserService {
  async create() {
    /* Should be overriden using spyOn */
  }
}

describe("SignupService", () => {
  let service: SignupService;
  let userAuthService: UserAuthService;
  let userService: UserService;
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
          useValue: new MockMailCoreService(),
        },
        {
          provide: UserAuthService,
          useValue: new MockUserAuthService(),
        },
        {
          provide: UserService,
          useValue: new MockUserService(),
        },
        {
          provide: AuthLinkGeneratorService,
          useValue: {
            async getLinkWithUserJwt() {
              return "";
            },
          },
        },
      ],
    }).compile();

    service = module.get<SignupService>(SignupService);
    userAuthService = module.get<UserAuthService>(UserAuthService);
    userService = module.get<UserService>(UserService);
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
      confirmPassword: "TestPassword",
    };

    jest.spyOn(userAuthService, "create").mockImplementation(async () => {
      return { email: "testy@mcface.com" } as UserAuth;
    });

    const sendEmailFunc = jest.spyOn(mailService, "sendTemplatedEmail");

    const user = await service.signupUserEmailAndPassword(
      signupPayload,
      "https://tamudatathon.com",
      "/"
    );
    expect(user).toBeDefined();
    expect(user.email).toBe(signupPayload.email);
    expect(sendEmailFunc).toHaveBeenCalled();
  });

  it("should propagate the user conflict error for a user that already exists", async () => {
    const signupPayload = {
      email: "already@exists.com",
      password: "TestPassword",
      confirmPassword: "TestPassword",
    };

    jest.spyOn(userAuthService, "create").mockImplementation(() => {
      throw new ConflictException();
    });

    const promise = service.signupUserEmailAndPassword(
      signupPayload,
      "https://tamudatathon.com",
      "/"
    );
    await expect(promise).rejects.toThrow(ConflictException);
  });

  it("should propagate the bad request error for an empty email string", async () => {
    const signupPayload = {
      email: "",
      password: "TestPassword",
      confirmPassword: "TestPassword",
    };

    jest.spyOn(userAuthService, "create").mockImplementation(() => {
      throw new BadRequestException();
    });

    const promise = service.signupUserEmailAndPassword(
      signupPayload,
      "https://tamudatathon.com",
      "/"
    );
    await expect(promise).rejects.toThrow(BadRequestException);
  });

  it("should propagate the bad request error for an empty password", async () => {
    const signupPayload = {
      email: "testy@mcface.com",
      password: "",
      confirmPassword: "",
    };

    jest.spyOn(userAuthService, "create").mockImplementation(() => {
      throw new BadRequestException();
    });

    const promise = service.signupUserEmailAndPassword(
      signupPayload,
      "https://tamudatathon.com",
      "/"
    );
    await expect(promise).rejects.toThrow(BadRequestException);
  });

  it("should return a valid user on a valid signup confirmation", async () => {
    const userJwt = jwtService.sign(
      { email: "testy@mctestface.com" },
      { expiresIn: "1h" }
    );

    jest.spyOn(userAuthService, "findByEmail").mockImplementation(async () => {
      return {
        email: "testy@mctestface.com",
        save: () => {
          /* no implementation needed */
        },
      } as UserAuth;
    });

    jest.spyOn(userService, "create").mockImplementation(async () => {
      return { email: "testy@mctestface.com" } as User;
    });

    const user = await service.confirmUserSignup(userJwt);
    expect(user.email).toEqual("testy@mctestface.com");
  });

  it("should throw an error when confirming an user with an invalid JWT", async () => {
    const userJwt = "Thisis.aninvalid.jwt";

    jest.spyOn(userAuthService, "findByEmail").mockImplementation(async () => {
      return { email: "testy@mctestface.com" } as UserAuth;
    });

    // Don't need an implementation for userService:create.

    const promise = service.confirmUserSignup(userJwt);
    await expect(promise).rejects.toThrow();
  });

  it("should throw an error when confirming an user with an expired JWT", async () => {
    const userJwt = jwtService.sign(
      { email: "testy@mctestface.com" },
      { expiresIn: "0s" }
    );

    jest.spyOn(userAuthService, "findByEmail").mockImplementation(async () => {
      return { email: "testy@mctestface.com" } as UserAuth;
    });

    // Don't need an implementation for userService:create.

    const promise = service.confirmUserSignup(userJwt);
    await expect(promise).rejects.toThrow();
  });

  it("should throw an error when confirming an non-existent user", async () => {
    const userJwt = jwtService.sign(
      { email: "testy@mctestface.com" },
      { expiresIn: "1h" }
    );

    jest.spyOn(userAuthService, "findByEmail").mockImplementation(async () => {
      return null; // UserAuthService returns null when user does not exist.
    });

    // Don't need an implementation for userService:create.

    const promise = service.confirmUserSignup(userJwt);
    await expect(promise).rejects.toThrow("Invalid user");
  });

  it("should create a User object when verifying a user", async () => {
    const userJwt = jwtService.sign(
      { email: "testy@mctestface.com" },
      { expiresIn: "1h" }
    );

    jest.spyOn(userAuthService, "findByEmail").mockImplementation(async () => {
      return {
        email: "testy@mctestface.com",
        save: () => {
          /* no implementation needed */
        },
      } as UserAuth;
    });

    const userServiceCreateFunc = jest
      .spyOn(userService, "create")
      .mockImplementation(async () => {
        return { email: "testy@mctestface.com" } as User;
      });

    const user = await service.confirmUserSignup(userJwt);
    expect(user.email).toBe("testy@mctestface.com");
    expect(userServiceCreateFunc).toHaveBeenCalled();
  });

  it("should throw an error when confirming a already-verified user", async () => {
    const userJwt = jwtService.sign(
      { email: "testy@mctestface.com" },
      { expiresIn: "1h" }
    );

    jest.spyOn(userAuthService, "findByEmail").mockImplementation(async () => {
      return {
        email: "testy@mctestface.com",
        isVerified: true,
      } as UserAuth;
    });

    // Don't need an implementation for userService:create.

    const promise = service.confirmUserSignup(userJwt);
    await expect(promise).rejects.toThrow("User is already verified");
  });

  it("should resend a verification email for a valid user JWT", async () => {
    const userJwt = jwtService.sign(
      { email: "testy@mctestface.com" },
      { expiresIn: "1h" }
    );

    jest.spyOn(userAuthService, "findByEmail").mockImplementation(async () => {
      return { email: "testy@mctestface.com" } as UserAuth;
    });
    const sendEmailFunc = jest.spyOn(mailService, "sendTemplatedEmail");

    const userEmail = await service.resendVerificationEmail(
      userJwt,
      "https://tamudatathon.com",
      "/app/me"
    );
    expect(userEmail).toBe("testy@mctestface.com");
    expect(sendEmailFunc).toHaveBeenCalled();
  });

  it("should fail sending a verification email for an invalid", async () => {
    const userJwt = jwtService.sign(
      { email: "testy@mctestface.com" },
      { expiresIn: "1h" }
    );

    jest.spyOn(userAuthService, "findByEmail").mockImplementation(async () => {
      return null; // UserAuthService returns null when user does not exist.
    });

    const promise = service.resendVerificationEmail(
      userJwt,
      "https://tamudatathon.com",
      "/app/me"
    );
    await expect(promise).rejects.toThrow("Invalid user");
  });

  it("should throw an error when confirming a already-verified user", async () => {
    const userJwt = jwtService.sign(
      { email: "testy@mctestface.com" },
      { expiresIn: "1h" }
    );

    jest.spyOn(userAuthService, "findByEmail").mockImplementation(async () => {
      return {
        email: "testy@mctestface.com",
        isVerified: true,
      } as UserAuth;
    });

    const promise = service.resendVerificationEmail(
      userJwt,
      "https://tamudatathon.com",
      "/app/me"
    );
    await expect(promise).rejects.toThrow("User is already verified");
  });
});
