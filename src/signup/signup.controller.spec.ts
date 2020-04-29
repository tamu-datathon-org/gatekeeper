import { Test, TestingModule } from "@nestjs/testing";
import { SignupController } from "./signup.controller";
import { SignupService } from "./signup.service";
import { MailService } from "../mail/mail.service";
import { MailCoreService } from "../mail/mail-core.service";
import { MockMailCoreService } from "../mail/mocks/mock-mail-core.service";
import { UserAuthService } from "../user-auth/user-auth.service";
import { TestDatabaseModule } from "../test-database/test-database.module";
import { MongooseModule } from "@nestjs/mongoose";
import { UserAuthSchema } from "../user-auth/schemas/user-auth.schema";

const mockCsrf = "test-csrf";
const mockCsrfGenerator = () => mockCsrf;

describe("Signup Controller", () => {
  let controller: SignupController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SignupController],
      imports: [
        TestDatabaseModule,
        MongooseModule.forFeature([
          { name: "UserAuth", schema: UserAuthSchema }
        ])
      ],
      providers: [
        SignupService,
        MailService,
        {
          provide: MailCoreService,
          useValue: new MockMailCoreService(),
        },
        UserAuthService
      ]
    }).compile();

    controller = module.get<SignupController>(SignupController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("should create a signup form with a CSRF token", () => {
    const res = controller.root({ csrfToken: mockCsrfGenerator });
    // Response will be the templateParams for ejs.
    expect(res.csrfToken).toBe(mockCsrf);
  });
});
