import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "./app.controller";
import { UserAuthModule } from "./user-auth/user-auth.module";
import { TestDatabaseModule } from "./test-database/test-database.module";

describe("App Controller", () => {
  let controller: AppController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TestDatabaseModule, UserAuthModule],
      controllers: [AppController]
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
