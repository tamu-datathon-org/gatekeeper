import { Test, TestingModule } from "@nestjs/testing";
import { UserAuthService } from "./user-auth.service";
import { MongooseModule } from "@nestjs/mongoose";
import { UserAuthSchema } from "./schemas/user-auth.schema";
import { TestDatabaseModule } from "../test-database/test-database.module";
import { ConflictException } from "@nestjs/common";

describe("UserAuthService", () => {
  let service: UserAuthService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        TestDatabaseModule,
        MongooseModule.forFeature([
          { name: "UserAuth", schema: UserAuthSchema }
        ])
      ],
      providers: [UserAuthService]
    }).compile();

    service = module.get<UserAuthService>(UserAuthService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should be able to create a user with email and password", async () => {
    const userAuth = await service.create({
      email: "george@example.com",
      authType: "EmailAndPassword",
      password: "SomePassword",
      isVerified: false
    });
    expect(userAuth).toBeDefined();
    expect(userAuth.id).toBeDefined();
  });

  it("should be able to create a user with oAuthToken", async () => {
    const userAuth = await service.create({
      email: "george@example.com",
      authType: "Google",
      oAuthToken: "SomeAuthToken",
      isVerified: true
    });
    expect(userAuth).toBeDefined();
    expect(userAuth.id).toBeDefined();
  });

  it("should not be able to create a users with the same email", async () => {
    await service.create({
      email: "george@example.com",
      authType: "EmailAndPassword",
      password: "SomePassword",
      isVerified: false
    });
    try {
      await service.create({
        email: "george@example.com",
        authType: "EmailAndPassword",
        password: "SomePassword",
        isVerified: false
      });
    } catch (e) {
      // Extract error from NestJS Exception Filter.
      const err = e.response;
      expect(err.statusCode).toEqual(409);
      expect(err.error).toEqual("Conflict");
      expect(err.message).toEqual(
        "A user with the same email address already exists"
      );
    }
  });

  it("should not be able to create a users with the same email regardless of case", async () => {
    await service.create({
      email: "gEOrge@ExampLE.com",
      authType: "EmailAndPassword",
      password: "SomePassword",
      isVerified: false
    });
    const promise = service.create({
      email: "GeoRGe@example.COM",
      authType: "EmailAndPassword",
      password: "DifferentPassword",
      isVerified: false
    });

    await expect(promise).rejects.toThrow(
      new ConflictException("A user with the same email address already exists")
    );
  });

  it("should only allow creation of a user if the password exists when AuthType is EmailAndPassword", async () => {
    try {
      await service.create({
        email: "george@example.com",
        authType: "EmailAndPassword",
        isVerified: false
      });
    } catch (e) {
      // Extract error from NestJS Exception Filter.
      const err = e.response;
      expect(err.statusCode).toEqual(400);
      expect(err.error).toEqual("Bad Request");
      expect(err.message).toEqual(
        "Password is required if the authType is EmailAndPassword"
      );
    }
    try {
      await service.create({
        email: "george@example.com",
        authType: "EmailAndPassword",
        password: "",
        isVerified: false
      });
    } catch (e) {
      // Extract error from NestJS Exception Filter.
      const err = e.response;
      expect(err.statusCode).toEqual(400);
      expect(err.error).toEqual("Bad Request");
      expect(err.message).toEqual(
        "Password is required if the authType is EmailAndPassword"
      );
    }
  });

  it("should only allow creation of a user if the oAuthToken exists when AuthType is not EmailAndPassword", async () => {
    try {
      await service.create({
        email: "george@example.com",
        authType: "Google",
        isVerified: false
      });
    } catch (e) {
      // Extract error from NestJS Exception Filter.
      const err = e.response;
      expect(err.statusCode).toEqual(400);
      expect(err.error).toEqual("Bad Request");
      expect(err.message).toEqual(
        "oAuthToken is required if the authType is not EmailAndPassword"
      );
    }
    try {
      await service.create({
        email: "george@example.com",
        authType: "Facebook",
        oAuthToken: "",
        isVerified: false
      });
    } catch (e) {
      // Extract error from NestJS Exception Filter.
      const err = e.response;
      expect(err.statusCode).toEqual(400);
      expect(err.error).toEqual("Bad Request");
      expect(err.message).toEqual(
        "oAuthToken is required if the authType is not EmailAndPassword"
      );
    }
  });

  it("should only allow creation of a user email is there", async () => {
    try {
      await service.create({
        email: "",
        authType: "EmailAndPassword",
        isVerified: false
      });
    } catch (e) {
      // Extract error from NestJS Exception Filter.
      const err = e.response;
      expect(err.statusCode).toEqual(400);
      expect(err.error).toEqual("Bad Request");
      expect(err.message).toEqual("Email is required to be a non-empty string");
    }
  });

  it("should be able to find all users", async () => {
    await service.create({
      email: "george@example.com",
      authType: "EmailAndPassword",
      password: "SomePassword",
      isVerified: false
    });
    await service.create({
      email: "bob@example.com",
      authType: "EmailAndPassword",
      password: "SomePassword",
      isVerified: true
    });
    await service.create({
      email: "jan@example.com",
      authType: "EmailAndPassword",
      password: "SomePassword",
      isVerified: false
    });
    const users = await service.findAll();
    expect(users).toBeDefined();
    expect(users.length).toBe(3);
  });

  it("should be able to find users by email", async () => {
    await service.create({
      email: "george@example.com",
      authType: "EmailAndPassword",
      password: "SomePassword",
      isVerified: false
    });
    await service.create({
      email: "bob@example.com",
      authType: "EmailAndPassword",
      password: "SomePassword",
      isVerified: true
    });
    await service.create({
      email: "jan@example.com",
      authType: "EmailAndPassword",
      password: "SomePassword",
      isVerified: false
    });
    const user = await service.findByEmail("bob@example.com");
    expect(user).toBeDefined();
    expect(user.email).toBe("bob@example.com");
  });

  it("should be able to find users by email regardless of case", async () => {
    await service.create({
      email: "george@example.com",
      authType: "EmailAndPassword",
      password: "SomePassword",
      isVerified: false
    });
    await service.create({
      email: "bob@example.com",
      authType: "EmailAndPassword",
      password: "SomePassword",
      isVerified: true
    });
    await service.create({
      email: "jan@example.com",
      authType: "EmailAndPassword",
      password: "SomePassword",
      isVerified: false
    });

    const user = await service.findByEmail("BOB@eXAmpLE.cOm");
    expect(user).toBeDefined();
    expect(user.email).toBe("bob@example.com");

    const sameUser = await service.findByEmail("boB@exampLE.coM");
    expect(sameUser).toBeDefined();
    expect(sameUser.email).toBe("bob@example.com");

    expect(user).toEqual(sameUser);
  });

  it("should be able to find users by id", async () => {
    await service.create({
      email: "george@example.com",
      authType: "EmailAndPassword",
      password: "SomePassword",
      isVerified: false
    });
    const bob = await service.create({
      email: "bob@example.com",
      authType: "EmailAndPassword",
      password: "SomePassword",
      isVerified: true
    });
    await service.create({
      email: "jan@example.com",
      authType: "EmailAndPassword",
      password: "SomePassword",
      isVerified: false
    });
    const user = await service.findById(bob.id);
    expect(user).toBeDefined();
    expect(user.email).toBe("bob@example.com");
  });
  afterAll(() => {
    return module.close();
  }, 10000);
});
