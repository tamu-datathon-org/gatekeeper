import { Test, TestingModule } from "@nestjs/testing";
import { UserAuthService } from "./user-auth.service";
import { MongooseModule } from "@nestjs/mongoose";
import { UserAuthSchema } from "./schemas/user-auth.schema";
import { TestDatabaseModule } from "../test-database/test-database.module";
import {
  ConflictException,
  BadRequestException,
  NotFoundException
} from "@nestjs/common";

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

  it("should be able to create a user with an oAuth provider", async () => {
    const userAuth = await service.create({
      email: "george@example.com",
      authType: "Google",
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
    const promise = service.create({
      email: "george@example.com",
      authType: "EmailAndPassword",
      password: "SomePassword",
      isVerified: false
    });

    await expect(promise).rejects.toThrow(
      new ConflictException("A user with the same email address already exists")
    );
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
    const promise1 = service.create({
      email: "george@example.com",
      authType: "EmailAndPassword",
      isVerified: false
    });
    await expect(promise1).rejects.toThrow(
      new BadRequestException(
        "Password is required if the authType is EmailAndPassword"
      )
    );

    const promise2 = service.create({
      email: "george@example.com",
      authType: "EmailAndPassword",
      password: "",
      isVerified: false
    });
    await expect(promise2).rejects.toThrow(
      new BadRequestException(
        "Password is required if the authType is EmailAndPassword"
      )
    );
  });

  it("should only allow creation of a user email is there", async () => {
    const promise = service.create({
      email: "",
      authType: "EmailAndPassword",
      isVerified: false
    });
    await expect(promise).rejects.toThrow(
      new BadRequestException("Email is required to be a non-empty string")
    );
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

  it("should be able to update user passwords", async () => {
    await service.create({
      email: "george@example.com",
      authType: "EmailAndPassword",
      password: "SomePassword",
      isVerified: false
    });
    const { passwordHash: originalPasswordHash } = await service.findByEmail(
      "george@example.com"
    );

    const {
      passwordHash: newPasswordHash,
      email
    } = await service.updatePasswordForUser(
      "george@example.com",
      "NewPassword"
    );
    expect(email).toBe("george@example.com");
    expect(newPasswordHash !== originalPasswordHash).toBe(true);
  });

  it("should fail when updating passwords for non-existent users", async () => {
    const promise = service.updatePasswordForUser(
      "doesnotexist@example.com",
      "NewPassword"
    );
    await expect(promise).rejects.toThrow(NotFoundException);
  });

  afterAll(() => {
    return module.close();
  }, 10000);
});
