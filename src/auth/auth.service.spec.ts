import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { LocalStrategy } from "./strategies/local.strategy";
import { UserAuthModule } from "../user-auth/user-auth.module";
import { PassportModule } from "@nestjs/passport";
import { TestDatabaseModule } from "../test-database/test-database.module";
import { UserAuthService } from "../user-auth/user-auth.service";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { NotFoundException } from "@nestjs/common";
import { User } from "../user/interfaces/user.interface";

describe("AuthService", () => {
  let service: AuthService;
  let userAuthService: UserAuthService;
  let module: TestingModule;
  let jwtService: JwtService;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        TestDatabaseModule,
        UserAuthModule,
        PassportModule,
        JwtModule.register({ secret: "TEST_SECRET" })
      ],
      providers: [AuthService, LocalStrategy]
    }).compile();

    service = module.get<AuthService>(AuthService);
    userAuthService = module.get<UserAuthService>(UserAuthService);
    jwtService = module.get<JwtService>(JwtService);
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
      isVerified: false
    });

    try {
      const userAuthReturned = await service.validateUser(
        "george@example.com",
        "Testing12345"
      );
      expect(userAuthReturned).toBeNull();
    } catch (e) {
      expect(e.message).toEqual("Google");
    }
  });

  it("should validate a user with an OAuth account", async () => {
    const userAuth = await userAuthService.create({
      authType: "Google",
      email: "george@example.com",
      isVerified: true
    });

    const userAuthReturned = await service.validateOAuthUser(
      "george@example.com",
      "Google"
    );
    expect(userAuthReturned.id).toEqual(userAuth.id);
  });

  it("should fail oAuth validation when validating a non-existent user", async () => {
    const validatePromise = service.validateOAuthUser(
      "george@example.com",
      "Google"
    );
    await expect(validatePromise).rejects.toThrow(NotFoundException);
  });

  it("should fail oAuth validation when validating an EmailAndPassword user", async () => {
    await userAuthService.create({
      authType: "EmailAndPassword",
      email: "george@example.com",
      password: "Testing123",
      isVerified: false
    });

    const validatePromise = service.validateOAuthUser(
      "george@example.com",
      "Google"
    );
    await expect(validatePromise).rejects.toThrow("EmailAndPassword");
  });

  it("should add a valid auth JWT to a response", async () => {
    const user = {
      email: "testy@mctest.com"
    };
    let res = {
      cookie: (key, val) => {
        this[key] = val;
        return this;
      }
    };
    res = service.applyJwt(user as User, res);
    expect(res["accessToken"]).toBeDefined();
    // Check that JWT is valid and has user email.
    const payload = jwtService.verify(res["accessToken"]);
    expect(payload.email).toEqual("testy@mctest.com");
  });

  afterAll(() => {
    return module.close();
  }, 10000);
});
