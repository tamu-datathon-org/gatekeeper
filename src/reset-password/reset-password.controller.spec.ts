import { Test, TestingModule } from "@nestjs/testing";
import { ResetPasswordController } from "./reset-password.controller";
import { ValidatorService } from "../validator/validator.service";
import { ResetPasswordService } from "./reset-password.service";

describe("ResetPassword Controller", () => {
  let controller: ResetPasswordController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResetPasswordController],
      providers: [
        {
          provide: ResetPasswordService,
          useValue: {}
        },
        ValidatorService
      ]
    }).compile();

    controller = module.get<ResetPasswordController>(ResetPasswordController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
