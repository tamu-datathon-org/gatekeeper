import { Test, TestingModule } from "@nestjs/testing";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { User } from "./interfaces/user.interface";

class MockUseService {
  async update() {
    /* Should be overriden using spyOn */
  }
}

describe("User Controller", () => {
  let controller: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: new MockUseService()
        }
      ]
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("should return a user object with mongo fields removed", async () => {
    const user = {
      _id: "random-id",
      __v: "random-value",
      email: "testy@mcface.com",
      toObject: () => user
    };
    const result = await controller.root((user as unknown) as User);
    expect(result.email).toBe("testy@mcface.com");
    expect(result._id).toBeUndefined();
    expect(result.__v).toBeUndefined();
  });

  it("should successfully update a user", async () => {
    const user = {
      _id: "random-id",
      __v: "random-value",
      email: "testy@mcface.com",
      toObject: () => user
    };
    const userUpdate = {
      notificationEmail: "testy@mcface.com",
      firstName: "test",
      lastName: "McFace"
    };

    // Update should run normally without any errors.
    jest.spyOn(userService, "update").mockImplementation(async () => {
      return;
    });

    const result = await controller.modify(
      userUpdate,
      (user as unknown) as User
    );
    expect(result.success).toBe(true);
  });

  it("should propagate any errors from UserService when modifying users", async () => {
    const user = {
      _id: "random-id",
      __v: "random-value",
      email: "testy@mcface.com",
      toObject: () => user
    };
    const userUpdate = {
      notificationEmail: "testy@mcface.com",
      firstName: "test",
      lastName: "McFace"
    };

    // Update should run normally without any errors.
    jest.spyOn(userService, "update").mockImplementation(async () => {
      throw new Error("Error from UserService");
    });

    const promise = controller.modify(userUpdate, (user as unknown) as User);
    await expect(promise).rejects.toThrow(new Error("Error from UserService"));
  });
});
