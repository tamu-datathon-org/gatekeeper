import { Test, TestingModule } from "@nestjs/testing";
import { ResetPasswordController } from "./reset-password.controller";
import { ValidatorService } from "../validator/validator.service";
import { ResetPasswordService } from "./reset-password.service";
import { GatekeeperGalaxyIntegration } from "../galaxy-integrations/galaxy-integrations";
import { NotFoundException } from "@nestjs/common";
import { AuthProviderException } from "../auth/exceptions/auth-provider.exception";
import { UserAuth } from "../user-auth/interfaces/user-auth.interface";

class MockResetPasswordService {
  async handleResetPasswordRequest() {
    /* Should be overriden using spyOn */
  }

  async validateResetPasswordRequest() {
    /* Should be overriden using spyOn */
  }

  async resetPassword() {
    /* Should be overriden using spyOn */
  }
}

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
  },
  new: () => {
    // Reset the state of the response
    response.code = 200;
    return response;
  }
};

describe("ResetPassword Controller", () => {
  let controller: ResetPasswordController;
  let resetPasswordService: ResetPasswordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResetPasswordController],
      providers: [
        {
          provide: ResetPasswordService,
          useValue: new MockResetPasswordService()
        },
        ValidatorService
      ]
    }).compile();

    controller = module.get<ResetPasswordController>(ResetPasswordController);
    resetPasswordService = module.get<ResetPasswordService>(
      ResetPasswordService
    );
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("should return a root page with a csrfToken & redirectLink", () => {
    const result = controller.root(
      csrfReq,
      "/apply/status",
      GatekeeperGalaxyIntegration
    );
    expect(result.csrfToken).toBe(mockCsrfToken);
    expect(result.redirectLink).toBe("/apply/status");
  });

  it("should return a reset-password-link-sent page on a successful reset-password request", async () => {
    jest
      .spyOn(resetPasswordService, "handleResetPasswordRequest")
      .mockImplementation(async () => {
        return;
      });

    const { path, params } = await controller.sendResetPasswordLink(
      csrfReq,
      "testy@mctestface.com",
      "/apply/status",
      "localhost",
      GatekeeperGalaxyIntegration,
      response.new()
    );
    expect(path).toBe("reset-password/reset-password-link-sent");
    expect(params.userEmail).toBe("testy@mctestface.com");
  });

  it("should return the reset-password page with an email error if user doesn't exist", async () => {
    jest
      .spyOn(resetPasswordService, "handleResetPasswordRequest")
      .mockImplementation(async () => {
        throw new NotFoundException("Should be in the email error.");
      });

    const { path, params } = await controller.sendResetPasswordLink(
      csrfReq,
      "testy@mctestface.com",
      "/apply/status",
      "localhost",
      GatekeeperGalaxyIntegration,
      response.new()
    );
    expect(path).toBe("reset-password/index");
    expect(params.csrfToken).toBe(mockCsrfToken);
    expect(params.redirectLink).toBe("/apply/status");
    expect(params.emailPrefill).toBe("testy@mctestface.com");
    expect(params.emailError).toBe("Should be in the email error.");
  });

  it("should return the reset-password page with an email error if user didn't sign up with email", async () => {
    jest
      .spyOn(resetPasswordService, "handleResetPasswordRequest")
      .mockImplementation(async () => {
        throw new AuthProviderException("Google", 401);
      });

    const { path, params } = await controller.sendResetPasswordLink(
      csrfReq,
      "testy@mctestface.com",
      "/apply/status",
      "localhost",
      GatekeeperGalaxyIntegration,
      response.new()
    );
    expect(path).toBe("reset-password/index");
    expect(params.csrfToken).toBe(mockCsrfToken);
    expect(params.redirectLink).toBe("/apply/status");
    expect(params.emailPrefill).toBe("testy@mctestface.com");
    expect(params.emailError).toBe(
      "The user with the given was created using Google. " +
        "Passwords cannot be reset for accounts created using Google."
    );
  });

  it("should return the reset-password page for a valid reset-password link", async () => {
    jest
      .spyOn(resetPasswordService, "validateResetPasswordRequest")
      .mockImplementation(() => {
        return "testy@mctestface.com";
      });

    const { path, params } = await controller.getResetPage(
      csrfReq,
      "test-user-jwt",
      "/apply/application",
      response.new()
    );
    expect(path).toBe("reset-password/reset-page");
    expect(params.csrfToken).toBe(mockCsrfToken);
    expect(params.userJwt).toBe("test-user-jwt");
    expect(params.redirectLink).toBe("/apply/application");
  });

  it("should return a reset-failure page for an invalid reset-password link", async () => {
    jest
      .spyOn(resetPasswordService, "validateResetPasswordRequest")
      .mockImplementation(() => {
        throw new Error("JWT is invalid");
      });

    const { path, params } = await controller.getResetPage(
      csrfReq,
      "invalid-user-jwt",
      "/apply/application",
      response.new()
    );
    expect(path).toBe("reset-password/reset-failure");
    expect(params.redirectLink).toBe("/apply/application");
  });

  it("should return a reset-password-success page on a valid reset-password request", async () => {
    jest
      .spyOn(resetPasswordService, "resetPassword")
      .mockImplementation(async () => {
        return { email: "testy@mctestface.com" } as UserAuth;
      });

    const { path, params } = await controller.resetPassword(
      csrfReq,
      "validPassword123$",
      "validPassword123$",
      "valid-user-jwt",
      "/apply/success",
      response.new()
    );
    expect(path).toBe("reset-password/reset-success");
    expect(params.redirectLink).toBe("/apply/success");
  });

  it("should return the reset-password page with an error for an invalid password", async () => {
    jest
      .spyOn(resetPasswordService, "resetPassword")
      .mockImplementation(async () => {
        return { email: "testy@mctestface.com" } as UserAuth;
      });

    const { path, params } = await controller.resetPassword(
      csrfReq,
      "smol", // Password should be atleast 6 characters to be valid.
      "smol",
      "valid-user-jwt",
      "/apply/success",
      response.new()
    );
    expect(path).toBe("reset-password/reset-page");
    expect(params.csrfToken).toBe(mockCsrfToken);
    expect(params.userJwt).toBe("valid-user-jwt");
    expect(params.redirectLink).toBe("/apply/success");
    expect(params.passwordError).toBe(
      "A password must contain at least 6 characters."
    );
  });

  it("should return the reset-password page with an error when password & confirmPassword mismatch", async () => {
    jest
      .spyOn(resetPasswordService, "resetPassword")
      .mockImplementation(async () => {
        return { email: "testy@mctestface.com" } as UserAuth;
      });

    const { path, params } = await controller.resetPassword(
      csrfReq,
      "validPassword123$", // Password should be atleast 6 characters to be valid.
      "validPasswordButDifferent123$",
      "valid-user-jwt",
      "/apply/success",
      response.new()
    );
    expect(path).toBe("reset-password/reset-page");
    expect(params.csrfToken).toBe(mockCsrfToken);
    expect(params.userJwt).toBe("valid-user-jwt");
    expect(params.redirectLink).toBe("/apply/success");
    expect(params.confirmPasswordError).toBe(
      "Value must match the given password."
    );
  });

  it("should return the reset-failure page for any errors during the password reset", async () => {
    jest
      .spyOn(resetPasswordService, "resetPassword")
      .mockImplementation(async () => {
        throw new Error("Something went wrong");
      });

    const { path, params } = await controller.resetPassword(
      csrfReq,
      "validPassword123$", // Password should be atleast 6 characters to be valid.
      "validPassword123$",
      "valid-user-jwt",
      "/apply/success",
      response.new()
    );
    expect(path).toBe("reset-password/reset-failure");
    expect(params.redirectLink).toBe("/apply/success");
  });
});
