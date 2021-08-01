import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "./app.controller";
import { UserAuthModule } from "./user-auth/user-auth.module";
import { TestDatabaseModule } from "./test-database/test-database.module";
import { AuthModule } from "./auth/auth.module";

describe("App Controller", () => {
  let controller: AppController;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [TestDatabaseModule, UserAuthModule, AuthModule],
      controllers: [AppController],
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  afterAll(() => {
    return module.close();
  }, 10000);
});
