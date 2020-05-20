import { Test, TestingModule } from "@nestjs/testing";
import { LoginController } from "./login.controller";
import { AuthModule } from "../auth/auth.module";
import { TestDatabaseModule } from "../test-database/test-database.module";

const mockCsrfToken = "test-csrf";
const mockCsrfGenerator = (): string => mockCsrfToken;
const csrfReq = {
  csrfToken: mockCsrfGenerator
};

describe("Login Controller", () => {
  let controller: LoginController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TestDatabaseModule, AuthModule],
      controllers: [LoginController]
    }).compile();

    controller = module.get<LoginController>(LoginController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("should return a login form with a CSRF token", () => {
    const res = controller.root(csrfReq, "/auth/me");
    expect(res.csrfToken).toBe(mockCsrfToken);
  });
});
