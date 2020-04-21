import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { LocalStrategy } from "./strategies/local.strategy";
import { UserAuthModule } from "../user-auth/user-auth.module";
import { PassportModule } from "@nestjs/passport";
import { TestDatabaseModule } from "../test-database/test-database.module";
import { UserAuthService } from "../user-auth/user-auth.service";

describe("AuthService", () => {
  let service: AuthService;
  let userAuthService: UserAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TestDatabaseModule, UserAuthModule, PassportModule],
      providers: [AuthService, LocalStrategy]
    }).compile();

    service = module.get<AuthService>(AuthService);
    userAuthService = module.get<UserAuthService>(UserAuthService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
    expect(userAuthService).toBeDefined();
  });

  it("should validate a user with email and password", async () => {
    const userAuth = await userAuthService.create({
      authType: "EmailAndPassword",
      email: "george@example.com",
      password: "Testing123",
      isVerified: false
    });

    const userAuthReturned = await service.validateUser(
      "george@example.com",
      "Testing123"
    );
    expect(userAuthReturned.id).toEqual(userAuth.id);
  });

  it("should fail validate a user with email and password when the password is incorrect", async () => {
    await userAuthService.create({
      authType: "EmailAndPassword",
      email: "george@example.com",
      password: "Testing123",
      isVerified: false
    });

    try {
      const userAuthReturned = await service.validateUser(
        "george@example.com",
        "Testing12345"
      );
      expect(userAuthReturned).toBeNull();
    } catch (e) {
      expect(e.message).toEqual("Invalid Credentials");
    }
  });

  it("should fail validate a user with email and password when the authType is different", async () => {
    await userAuthService.create({
      authType: "Google",
      email: "george@example.com",
      oAuthToken: "Testing123",
      isVerified: false
    });

    try {
      const userAuthReturned = await service.validateUser(
        "george@example.com",
        "Testing12345"
      );
      expect(userAuthReturned).toBeNull();
    } catch (e) {
      expect(e.message).toEqual(
        "User signed up with a different authentication provider"
      );
    }
  });
});
