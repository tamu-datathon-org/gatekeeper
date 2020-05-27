import { Test, TestingModule } from "@nestjs/testing";
import { UserService } from "./user.service";
import { UserAuthService } from "../user-auth/user-auth.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UserAuth } from "../user-auth/interfaces/user-auth.interface";
import { TestDatabaseModule } from "../test-database/test-database.module";
import { MongooseModule } from "@nestjs/mongoose";
import { UserSchema } from "./schemas/user.schema";

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

describe("UserService", () => {
  let service: UserService;
  let userAuthService: UserAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TestDatabaseModule,
        MongooseModule.forFeature([{ name: "User", schema: UserSchema }])
      ],
      providers: [
        UserService,
        { provide: UserAuthService, useValue: new MockUserAuthService() }
      ]
    }).compile();

    service = module.get<UserService>(UserService);
    userAuthService = module.get<UserAuthService>(UserAuthService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should be able to create a user", async () => {
    const createPayload = {
      userAuthId: "random",
      name: "George Blah"
    } as CreateUserDto;

    jest.spyOn(userAuthService, "findById").mockImplementation(async () => {
      return ({
        email: "george@example.com",
        id: "random",
        isVerified: true,
        authType: "EmailAndPassword",
        passwordHash: "random"
      } as UserAuth);
    });

    const user = await service.create(createPayload);

    expect(user).toBeDefined();
    expect(user.email).toEqual("george@example.com");
    expect(user.name).toEqual("George Blah");
    expect(user.authId).toEqual("random");
  });

  it("should be fail to create a user when they are not verified", async () => {
    const createPayload = {
      userAuthId: "random",
      name: "George Blah"
    } as CreateUserDto;

    jest.spyOn(userAuthService, "findById").mockImplementation(async () => {
      return ({
        email: "george@example.com",
        id: "random",
        isVerified: false,
        authType: "EmailAndPassword",
        passwordHash: "random"
      } as unknown) as UserAuth;
    });

    try {
      await service.create(createPayload);
    } catch (e) {
      expect(e).toBeDefined();
      expect(e.status).toBe(400);
      expect(e.message).toBe("User must be verified");
    }
  });

  it("should fail to create a user that already exists", async () => {
    const createPayload = {
      userAuthId: "random",
      name: "George Blah"
    } as CreateUserDto;

    jest.spyOn(userAuthService, "findById").mockImplementation(async () => {
      return ({
        email: "george@example.com",
        id: "random",
        isVerified: true,
        authType: "EmailAndPassword",
        passwordHash: "random"
      } as unknown) as UserAuth;
    });

    await service.create(createPayload);
    try {
      await service.create(createPayload);
    } catch (e) {
      expect(e).toBeDefined();
      expect(e.status).toBe(409);
      expect(e.message).toBe("A user with the same authId already exists");
    }
  });

  it("should find all users and find by authId", async () => {
    const createPayload = {
      userAuthId: "random",
      name: "George Blah"
    } as CreateUserDto;

    const createPayload2 = {
      userAuthId: "random2",
      name: "George Blah Bleh"
    } as CreateUserDto;

    jest
      .spyOn(userAuthService, "findById")
      .mockImplementation(async (authId: string) => {
        return ({
          email: authId === "random" ? "george@example.com" : "bob@example.com",
          id: authId,
          isVerified: true,
          authType: "EmailAndPassword",
          passwordHash: "random"
        } as unknown) as UserAuth;
      });

    await service.create(createPayload);
    await service.create(createPayload2);

    const users = await service.findAll();
    expect(users.length).toBe(2);
    const user = await service.findByAuthId("random");
    expect(user).toBeDefined();
    expect(user.authId).toBe("random");
    expect(user.name).toBe("George Blah");
  });

  it("should be able to update a user", async () => {
    const createPayload = {
      userAuthId: "random",
      name: "George Blah"
    } as CreateUserDto;

    jest
      .spyOn(userAuthService, "findById")
      .mockImplementation(async (authId: string) => {
        return ({
          email: "george@example.com",
          id: authId,
          isVerified: true,
          authType: "EmailAndPassword",
          passwordHash: "random"
        } as unknown) as UserAuth;
      });

    await service.create(createPayload);

    await service.update("random", {
      resumeLink: "hello.com"
    });

    const updatedUser = await service.findByAuthId("random");

    expect(updatedUser).toBeDefined();
    expect(updatedUser.resumeLink).toBe("hello.com");
  });

  it("should not be able to update a users authId or email", async () => {
    const createPayload = {
      userAuthId: "random",
      name: "George Blah"
    } as CreateUserDto;

    jest
      .spyOn(userAuthService, "findById")
      .mockImplementation(async (authId: string) => {
        return ({
          email: "george@example.com",
          id: authId,
          isVerified: true,
          authType: "EmailAndPassword",
          passwordHash: "random"
        } as unknown) as UserAuth;
      });

    await service.create(createPayload);

    await service.update("random", {
      resumeLink: "hello.com",
      email: "hello@example.com",
      authId: "differentAuthId"
    });

    const updatedUser = await service.findByAuthId("differentAuthId");
    const actualUpdatedUser = await service.findByAuthId("random");

    expect(updatedUser).toBeUndefined();
    expect(actualUpdatedUser.resumeLink).toBe("hello.com");
    expect(actualUpdatedUser.email).toBe("george@example.com");
    expect(actualUpdatedUser.authId).toBe("random");
  });
});
