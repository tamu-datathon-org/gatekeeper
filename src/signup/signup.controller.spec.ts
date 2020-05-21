import { Test, TestingModule } from "@nestjs/testing";
import { SignupController } from "./signup.controller";
import { SignupService } from "./signup.service";
import { SignupUserDto } from "./dto/signup-user.dto";
import { BadRequestException, ConflictException } from "@nestjs/common";
import { ValidatorService } from "../validator/validator.service";
import { UserAuth } from "../user-auth/interfaces/user-auth.interface";
import { AuthService } from "../auth/auth.service";

const existingUserEmails = ["already@exists.com"];
const mockEmail = "testy@mctestface.com";
const mockPassword = "TestyMcTestFace";

const mockCsrfToken = "test-csrf";
const mockCsrfGenerator = (): string => mockCsrfToken;
const csrfReq = {
  csrfToken: mockCsrfGenerator
};
const response = {
  code: 200,
  render: (path, params): Record<string, any> => {
    return { path, params };
  },
  status: (statusCode: number) => {
    response.code = statusCode;
    return response;
  }
};

class MockSignupService {
  async signupUserEmailAndPassword(
    signupUserDto: SignupUserDto
  ): Promise<Record<string, any>> {
    if (!signupUserDto.email)
      throw new BadRequestException(
        "Email is required to be a non-empty string"
      );
    if (!signupUserDto.password)
      throw new BadRequestException(
        "Password is required if the authType is EmailAndPassword"
      );

    // To test user conflict functionality.
    if (existingUserEmails.includes(signupUserDto.email))
      throw new ConflictException(
        "A user with the same email address already exists"
      );

    return {
      email: mockEmail,
      authType: "EmailAndPassword",
      isVerified: false
    };
  }

  async confirmUserSignup() {
    // Should be overriden using spyOn
  }
}

describe("Signup Controller", () => {
  let controller: SignupController;
  let signupService: SignupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SignupController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            applyJwt: () => {
              // Should be overriden using spyOn
            }
          }
        },
        {
          provide: SignupService,
          useValue: new MockSignupService()
        },
        ValidatorService
      ]
    }).compile();

    controller = module.get<SignupController>(SignupController);
    signupService = module.get<SignupService>(SignupService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("should return a signup form with a CSRF token", () => {
    const res = controller.root(csrfReq, "/auth/me");
    expect(res.csrfToken).toBe(mockCsrfToken);
  });

  it("should return a successful response for a valid email-password signup", async () => {
    const signupUserDto = {
      email: mockEmail,
      password: mockPassword,
      confirmPassword: mockPassword
    };

    const { path, params } = await controller.signupUserEmailAndPassword(
      csrfReq,
      signupUserDto,
      "/app/me",
      response
    );
    expect(path).toBe("signup/email-pwd-signup-success");
    expect(params.userEmail).toBe(signupUserDto.email);
  });

  it("should return the signup form with an error if user already exists", async () => {
    const signupUserDto = {
      email: "already@exists.com",
      password: mockPassword,
      confirmPassword: mockPassword
    };

    const { path, params } = await controller.signupUserEmailAndPassword(
      csrfReq,
      signupUserDto,
      "/app/me",
      response
    );
    expect(response.code).toBe(409);
    expect(path).toBe("signup/index");
    expect(params.csrfToken).toBe(mockCsrfToken);
    expect(params.emailPrefill).toBe("already@exists.com");
    expect(params.emailError).toBe(controller.controllerErrors.userExists);
    expect(params.redirectLink).toBe("/app/me");
  });

  it("should return the signup form with an error if given an empty email", async () => {
    const signupUserDto = {
      email: "",
      password: mockPassword,
      confirmPassword: mockPassword
    };

    const { path, params } = await controller.signupUserEmailAndPassword(
      csrfReq,
      signupUserDto,
      "/app/me",
      response
    );
    expect(response.code).toBe(400);
    expect(path).toBe("signup/index");
    expect(params.csrfToken).toBe(mockCsrfToken);
    expect(params.emailError).toBe(controller.controllerErrors.invalidEmail);
    expect(params.redirectLink).toBe("/app/me");
  });

  it("should return the signup form with an error if given an invalid email", async () => {
    const signupUserDto = {
      email: "test@test",
      password: mockPassword,
      confirmPassword: mockPassword
    };

    const { path, params } = await controller.signupUserEmailAndPassword(
      csrfReq,
      signupUserDto,
      "/app/me",
      response
    );
    expect(response.code).toBe(400);
    expect(path).toBe("signup/index");
    expect(params.csrfToken).toBe(mockCsrfToken);
    expect(params.emailError).toBe(controller.controllerErrors.invalidEmail);
    expect(params.redirectLink).toBe("/app/me");
  });

  it("should return the signup form with an error if given an empty password", async () => {
    const signupUserDto = {
      email: mockEmail,
      password: "",
      confirmPassword: ""
    };

    const { path, params } = await controller.signupUserEmailAndPassword(
      csrfReq,
      signupUserDto,
      "/app/me",
      response
    );
    expect(response.code).toBe(400);
    expect(path).toBe("signup/index");
    expect(params.csrfToken).toBe(mockCsrfToken);
    expect(params.emailPrefill).toBe(mockEmail);
    expect(params.passwordError).toBe(
      controller.controllerErrors.invalidPassword
    );
    expect(params.redirectLink).toBe("/app/me");
  });

  it("should return the signup form with an error if given an invalid password", async () => {
    const signupUserDto = {
      email: mockEmail,
      password: "test", // Should be more than 6 characters
      confirmPassword: "test"
    };

    const { path, params } = await controller.signupUserEmailAndPassword(
      csrfReq,
      signupUserDto,
      "/app/me",
      response
    );
    expect(response.code).toBe(400);
    expect(path).toBe("signup/index");
    expect(params.csrfToken).toBe(mockCsrfToken);
    expect(params.emailPrefill).toBe(mockEmail);
    expect(params.passwordError).toBe(
      controller.controllerErrors.invalidPassword
    );
    expect(params.redirectLink).toBe("/app/me");
  });

  it("should return the signup form with an error if confirmPassword does not match password", async () => {
    const signupUserDto = {
      email: mockEmail,
      password: "testing", // Should be more than 6 characters
      confirmPassword: "testing2"
    };

    const { path, params } = await controller.signupUserEmailAndPassword(
      csrfReq,
      signupUserDto,
      "/app/me",
      response
    );
    expect(response.code).toBe(400);
    expect(path).toBe("signup/index");
    expect(params.csrfToken).toBe(mockCsrfToken);
    expect(params.emailPrefill).toBe(mockEmail);
    expect(params.confirmPasswordError).toBe(
      controller.controllerErrors.invalidConfirmPassword
    );
    expect(params.redirectLink).toBe("/app/me");
  });

  it("should return a success message and auto-login a valid confirmation", async () => {
    jest
      .spyOn(signupService, "confirmUserSignup")
      .mockImplementation(async () => {
        return { email: "testy@mctestface.com" } as UserAuth;
      });

    const { path, params } = await controller.confirmSignup(
      csrfReq,
      "/app/me",
      "test.user.jwt",
      response
    );

    expect(path).toBe("signup/verification-success");
    expect(params.redirectLink).toBe("/app/me");
  });

  it("should return a failure screen for an invalid confirmation", async () => {
    jest
      .spyOn(signupService, "confirmUserSignup")
      .mockImplementation(async () => {
        throw new Error(); // Mimics JWT errors and user not found errors.
      });

    const { path, params } = await controller.confirmSignup(
      csrfReq,
      "/app/me",
      "test.user.jwt",
      response
    );

    expect(response.code).toEqual(400);
    expect(path).toBe("signup/verification-failure");
    expect(params.redirectLink).toBe("/app/me")
  });
});
