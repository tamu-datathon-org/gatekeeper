import { Test, TestingModule } from "@nestjs/testing";
import { ResetPasswordService } from "./reset-password.service";
import { UserAuthService } from "../user-auth/user-auth.service";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { MailService } from "../mail/mail.service";
import { MailCoreService } from "../mail/mail-core.service";
import { MockMailCoreService } from "../mail/mocks/mock-mail-core.service";
import { AuthLinkGeneratorService } from "../auth/auth-link-generator.service";
import { UserAuth } from "../user-auth/interfaces/user-auth.interface";
import { NotFoundException } from "@nestjs/common";
import { AuthProviderException } from "../auth/exceptions/auth-provider.exception";

class MockUserAuthService {
  async findByEmail() {
    /* Should be overriden using spyOn */
  }

  async updatePasswordForUser() {
    /* Should be overriden using spyOn */
  }
}

describe("ResetPasswordService", () => {
  let service: ResetPasswordService;
  let userAuthService: UserAuthService;
  let mailService: MailService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: "TEST_SECRET" })],
      providers: [
        ResetPasswordService,
        {
          provide: UserAuthService,
          useValue: new MockUserAuthService(),
        },
        MailService,
        {
          provide: MailCoreService,
          useValue: new MockMailCoreService(),
        },
        AuthLinkGeneratorService,
      ],
    }).compile();

    service = module.get<ResetPasswordService>(ResetPasswordService);
    userAuthService = module.get<UserAuthService>(UserAuthService);
    mailService = module.get<MailService>(MailService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it("should send a valid user a reset-password email", async () => {
    jest
      .spyOn(userAuthService, "findByEmail")
      .mockImplementation(async (email) => {
        return { email, authType: "EmailAndPassword" } as UserAuth;
      });
    const sendEmailFunc = jest.spyOn(mailService, "sendTemplatedEmail");

    // Implicitly expect for handleResetPasswordRequest() to not throw an error.
    await service.handleResetPasswordRequest(
      "test@mctestface.com",
      "localhost",
      "/apply/status"
    );

    expect(sendEmailFunc).toBeCalled();
  });

  it("should fail when trying to reset password for a non-existent user", async () => {
    jest.spyOn(userAuthService, "findByEmail").mockImplementation(async () => {
      return null;
    });

    const promise = service.handleResetPasswordRequest(
      "test@mctestface.com",
      "localhost",
      "/apply/status"
    );

    await expect(promise).rejects.toThrow(
      new NotFoundException("A user with the given email does not exist.")
    );
  });

  it("should fail when trying to reset password when user's AuthType isn't EmailAndPassword", async () => {
    jest
      .spyOn(userAuthService, "findByEmail")
      .mockImplementation(async (email) => {
        return { email, authType: "Facebook" } as UserAuth;
      });

    const promise = service.handleResetPasswordRequest(
      "test@mctestface.com",
      "localhost",
      "/apply/status"
    );

    await expect(promise).rejects.toThrow(
      new AuthProviderException("Facebook", 401)
    );
  });

  it("should successfully validate a valid reset-password request", async () => {
    const userJwt = jwtService.sign(
      { email: "testy@mctestface.com" },
      { expiresIn: "1h" }
    );

    const email = await service.validateResetPasswordRequest(userJwt);
    expect(email).toBe("testy@mctestface.com");
  });

  it("should fail validation when given an invalid reset-password request", async () => {
    const userJwt = jwtService.sign(
      { email: "testy@mctestface.com" },
      { expiresIn: "1h" }
    );

    // Modify userJwt to make it invalid.
    const func = () =>
      service.validateResetPasswordRequest(userJwt + "thisisrandom");
    expect(func).toThrowError();
  });

  it("should fail validation when given an expired reset-password request", async () => {
    const userJwt = jwtService.sign(
      { email: "testy@mctestface.com" },
      { expiresIn: "0s" }
    );

    const func = () => service.validateResetPasswordRequest(userJwt);
    expect(func).toThrowError();
  });

  it("should successfully reset the password for a valid user", async () => {
    jest
      .spyOn(userAuthService, "updatePasswordForUser")
      .mockImplementation(async (email) => {
        return { email } as UserAuth;
      });
    const userJwt = jwtService.sign(
      { email: "testy@mctestface.com" },
      { expiresIn: "1h" }
    );

    const user = await service.resetPassword(
      userJwt,
      "the-magnificent-password"
    );

    expect(user.email).toBe("testy@mctestface.com");
  });

  it("should fail to reset the password with an invalid request JWT", async () => {
    const userJwt = jwtService.sign(
      { email: "testy@mctestface.com" },
      { expiresIn: "1h" }
    );

    // Modify userJwt to make it invalid.
    const promise = service.resetPassword(
      userJwt + "this-is-random",
      "the-magnificent-password"
    );

    await expect(promise).rejects.toThrowError();
  });

  it("should propagate any errors thrown by UserAuthService when trying to reset password", async () => {
    jest
      .spyOn(userAuthService, "updatePasswordForUser")
      .mockImplementation(async () => {
        throw new Error();
      });
    const userJwt = jwtService.sign(
      { email: "testy@mctestface.com" },
      { expiresIn: "1h" }
    );

    // Modify userJwt to make it invalid.
    const promise = service.resetPassword(userJwt, "the-magnificent-password");

    await expect(promise).rejects.toThrowError();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
