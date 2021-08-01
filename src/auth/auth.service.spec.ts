import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { LocalStrategy } from "./strategies/local.strategy";
import { UserAuthModule } from "../user-auth/user-auth.module";
import { PassportModule } from "@nestjs/passport";
import { TestDatabaseModule } from "../test-database/test-database.module";
import { UserAuthService } from "../user-auth/user-auth.service";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { NotFoundException, UnauthorizedException } from "@nestjs/common";
import { User } from "../user/interfaces/user.interface";
import { UserModule } from "../user/user.module";
import { UserService } from "../user/user.service";

describe("AuthService", () => {
  let service: AuthService;
  let userAuthService: UserAuthService;
  let userService: UserService;
  let module: TestingModule;
  let jwtService: JwtService;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        TestDatabaseModule,
        UserAuthModule,
        PassportModule,
        UserModule,
        JwtModule.register({ secret: "TEST_SECRET" }),
      ],
      providers: [AuthService, LocalStrategy],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userAuthService = module.get<UserAuthService>(UserAuthService);
    userService = module.get<UserService>(UserService);
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
      isVerified: true,
    });

    await userService.create({
      userAuthId: userAuth.id,
    });

    const user = await service.validateUser("george@example.com", "Testing123");
    expect(user.authId).toEqual(userAuth.id);
    expect(user.email).toEqual("george@example.com");
  });

  it("should fail validate a user with email and password when the password is incorrect", async () => {
    await userAuthService.create({
      authType: "EmailAndPassword",
      email: "george@example.com",
      password: "Testing123",
      isVerified: false,
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
      isVerified: false,
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
      isVerified: true,
    });

    await userService.create({
      userAuthId: userAuth.id,
    });

    const user = await service.validateOAuthUser(
      "george@example.com",
      "Google"
    );
    expect(user.authId).toEqual(userAuth.id);
    expect(user.email).toEqual("george@example.com");
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
      isVerified: false,
    });

    const validatePromise = service.validateOAuthUser(
      "george@example.com",
      "Google"
    );
    await expect(validatePromise).rejects.toThrow("EmailAndPassword");
  });

  it("should authorize a valid user by adding a JWT access token to cookies", async () => {
    const userAuth = await userAuthService.create({
      authType: "Google",
      email: "george@example.com",
      isVerified: true,
    });

    const user = {
      email: "george@example.com",
      authId: userAuth.id,
    };
    let res = {
      cookie: (key, val) => {
        this[key] = val;
        return this;
      },
    };
    res = await service.authorizeUser(user as User, res);
    expect(res["accessToken"]).toBeDefined();
    const payload = jwtService.verify(res["accessToken"]);
    expect(payload.email).toEqual("george@example.com");
    expect(payload.id).toEqual(userAuth.id);

    const newUserAuth = await userAuthService.findById(userAuth.id);
    expect(payload.accessId).toEqual(newUserAuth.accessId);
  });

  it("should fail to authorize a user without a UserAuth", async () => {
    const user = {
      email: "george@example.com",
    };
    const res = {
      cookie: (key, val) => {
        this[key] = val;
        return this;
      },
    };
    const promise = service.authorizeUser(user as User, res);
    await expect(promise).rejects.toThrow(UnauthorizedException);
  });

  it("should use the same accessId (if one exists) to authorize user", async () => {
    const userAuth = await userAuthService.create({
      authType: "Google",
      email: "george@example.com",
      isVerified: true,
    });

    const user = {
      email: "george@example.com",
      authId: userAuth.id,
    };
    let res = {
      cookie: (key, val) => {
        this[key] = val;
        return this;
      },
    };
    res = await service.authorizeUser(user as User, res);
    expect(res["accessToken"]).toBeDefined();
    // Check that JWT is valid and has user email.
    const payload = jwtService.verify(res["accessToken"]);
    const existingAccessId = payload.accessId;

    // Reauthorize user and check that it has the same accessId.
    let newRes = {
      cookie: (key, val) => {
        this[key] = val;
        return this;
      },
    };
    newRes = await service.authorizeUser(user as User, newRes);
    expect(newRes["accessToken"]).toBeDefined();
    const newPayload = jwtService.verify(newRes["accessToken"]);
    expect(newPayload.email).toEqual("george@example.com");
    expect(newPayload.id).toEqual(userAuth.id);
    expect(newPayload.accessId).toEqual(existingAccessId);
  });

  it("should deauthorize a user by removing the accessToken cookie from the response", async () => {
    const userAuth = await userAuthService.create({
      authType: "Google",
      email: "george@example.com",
      isVerified: true,
    });
    userAuth.accessId = "random-id";
    await userAuth.save();

    const user = {
      email: "george@example.com",
      authId: userAuth.id,
    };
    let res = {
      accessToken: "random-access-token",
      clearCookie: (key) => {
        delete this[key];
        return this;
      },
    };
    res = await service.deauthorizeUser(user as User, res);
    expect(res["accessToken"]).toBeUndefined();

    const newUserAuth = await userAuthService.findById(userAuth.id);
    expect(newUserAuth.accessId).toBeUndefined();
  });

  it("should successfully deauthorize a user without a valid UserAuth object", async () => {
    const user = {
      email: "george@example.com",
      /* Non existent authId */
    };
    let res = {
      accessToken: "random-access-token",
      clearCookie: (key) => {
        delete this[key];
        return this;
      },
    };
    res = await service.deauthorizeUser(user as User, res);
    expect(res["accessToken"]).toBeUndefined();
  });

  afterAll(() => {
    return module.close();
  }, 10000);
});
