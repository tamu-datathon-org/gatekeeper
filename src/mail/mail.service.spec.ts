import { Test, TestingModule } from "@nestjs/testing";
import { MailService } from "./mail.service";
import { MailCoreService } from "./mail-core.service";
import { MockMailCoreService } from "./mocks/mock-mail-core.service";

const testRecipientEmail = "admin@tamudatathon.com";

describe("MailService", () => {
  let mailService: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: MailCoreService,
          useValue: new MockMailCoreService()
        }
      ]
    }).compile();

    mailService = module.get<MailService>(MailService);
  });

  it("should be defined", () => {
    expect(mailService).toBeDefined();
  });

  describe("sendTextEmail", () => {
    it("should successfully send a test text email.", async () => {
      const mailParams = {
        emailTo: testRecipientEmail,
        subject: "Gatekeeper Test: sendTextMail",
        bodyText: "Ignore this, it's a test"
      };

      // Function returns void, test that no error is thrown.
      expect(
        async () => await mailService.sendTextEmail(mailParams)
      ).not.toThrow();
    });
  });

  describe("sendHTMLEmail", () => {
    it("should successfully send a test HTML email.", async () => {
      const mailParams = {
        emailTo: testRecipientEmail,
        subject: "Gatekeeper Test: sendHTMLEmail",
        bodyHTML: "<h1>Ignore this, it's a test<h1>"
      };

      // Function returns void, test that no error is thrown.
      expect(
        async () => await mailService.sendHTMLEmail(mailParams)
      ).not.toThrow();
    });
  });

  describe("sendTemplatedEmail", () => {
    it("should successfully send a templated email.", async () => {
      const mailParams = {
        emailTo: testRecipientEmail,
        subject: "Gatekeeper Test: sendTemplatedEmail",
        templateFile: "test.ejs",
        templateParams: {
          name: "JarJarBinks",
          listStuff: ["The Force", "Lightsabers", "C3P0", "Seagulls"],
          randomWord: "Apricots"
        }
      };

      // Function returns void, test that no error is thrown.
      expect(
        async () => await mailService.sendTemplatedEmail(mailParams)
      ).not.toThrow();
    });
  });
});
