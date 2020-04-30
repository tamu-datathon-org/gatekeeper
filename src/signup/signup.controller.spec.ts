import { Test, TestingModule } from "@nestjs/testing";
import { SignupController } from "./signup.controller";
import { SignupService } from "./signup.service";
import { SignupUserDto } from "./dto/signup-user.dto";
import { BadRequestException, ConflictException } from "@nestjs/common";

const existingUserEmails = ["already@exists.com"];
const mockEmail = "testy@mctestface.com";
const mockPassword = "TestyMcTestFace";

const mockCsrfToken = "test-csrf";
const mockCsrfGenerator = (): string => mockCsrfToken;
const csrfReq = {
  csrfToken: mockCsrfGenerator
};

class MockSignupService {
  async signupUserEmailAndPassword(signupUserDto: SignupUserDto) {
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
}

describe("Signup Controller", () => {
  let controller: SignupController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SignupController],
      providers: [
        {
          provide: SignupService,
          useValue: new MockSignupService()
        }
      ]
    }).compile();

    controller = module.get<SignupController>(SignupController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("should return a signup form with a CSRF token", () => {
    const res = controller.root(csrfReq);
    // Response will be the templateParams for renderer.
    expect(res.csrfToken).toBe(mockCsrfToken);
  });

  it("should return a successful response for a valid email-password signup", async () => {
    const signupUserDto = {
      email: mockEmail,
      password: mockPassword
    };
    const res = await controller.signupUserEmailAndPassword(
      csrfReq,
      signupUserDto
    );
    // Response will be the templateParams for renderer.
    expect(res.userEmail).toBe(signupUserDto.email);
  });

  it("should return the signup form with an error if user already exists", async () => {
    const signupUserDto = {
      email: "already@exists.com",
      password: mockPassword
    };
    const res = await controller.signupUserEmailAndPassword(
      csrfReq,
      signupUserDto
    );
    // Response will be the templateParams for renderer.
    expect(res.csrfToken).toBe(mockCsrfToken);
    expect(res.userExistsError).toBe(true);
  });

  it("should return a bad request exception on an email-password signup with an empty email", async () => {
    const signupUserDto = {
      email: "",
      password: mockPassword
    };

    try {
      await controller.signupUserEmailAndPassword(csrfReq, signupUserDto);
    } catch (e) {
      // Extract error from NestJS Exception Filter.
      const err = e.message;
      expect(err.statusCode).toEqual(400);
      expect(err.error).toEqual("Bad Request");
      expect(err.message).toEqual("Email is required to be a non-empty string");
    }
  });

  it("should return a bad request exception on an email-password signup with an empty password", async () => {
    const signupUserDto = {
      email: mockEmail,
      password: ""
    };

    try {
      await controller.signupUserEmailAndPassword(csrfReq, signupUserDto);
    } catch (e) {
      // Extract error from NestJS Exception Filter.
      const err = e.message;
      expect(err.statusCode).toEqual(400);
      expect(err.error).toEqual("Bad Request");
      expect(err.message).toEqual(
        "Password is required if the authType is EmailAndPassword"
      );
    }
  });
});
