import { Model } from "mongoose";
import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { UserAuth } from "./interfaces/user-auth.interface";
import * as bcrypt from "bcrypt";
import { CreateUserAuthDto } from "./dto/create-user-auth.dto";

@Injectable()
export class UserAuthService {
  constructor(
    @InjectModel("UserAuth") private userAuthModel: Model<UserAuth>
  ) {}

  /**
   * Create a new UserAuth. Note that the email must be unique otherwise an error will be thrown
   * This is used to track a users authentication details and if they are a verified user (have they verified their email or used an oAuth service)
   * @param createUserAuth CreateUserAuthDto
   */
  async create(createUserAuth: CreateUserAuthDto): Promise<UserAuth> {
    let existingUser: UserAuth | undefined = undefined;
    if (!createUserAuth.email)
      throw new BadRequestException(
        "Email is required to be a non-empty string"
      );
    createUserAuth.email = createUserAuth.email.toLowerCase();
    try {
      existingUser = await this.findByEmail(createUserAuth.email);
    } catch (e) {
      existingUser = undefined;
    }
    if (existingUser) {
      throw new ConflictException(
        "A user with the same email address already exists"
      );
    }
    if (createUserAuth.authType === "EmailAndPassword") {
      if (!createUserAuth.password)
        throw new BadRequestException(
          "Password is required if the authType is EmailAndPassword"
        );
      const { password, ...userAuth } = createUserAuth;
      const passwordHash = await bcrypt.hash(password, 10);
      const createdUserAuth = new this.userAuthModel({
        ...userAuth,
        passwordHash,
        isVerified: userAuth.isVerified || false
      });
      return createdUserAuth.save();
    } else {
      const createdUserAuth = new this.userAuthModel({
        ...createUserAuth,
        isVerified: true
      });
      return createdUserAuth.save();
    }
  }

  /**
   * Returns a list of all the UserAuth objects in the Database
   */
  async findAll(): Promise<UserAuth[]> {
    return this.userAuthModel.find().exec();
  }

  /**
   * Finds one UserAuth with the matching email address.
   * @param email Email Address (UserAuth.email)
   */

  async findByEmail(email: string): Promise<UserAuth | undefined> {
    return (
      (await this.userAuthModel.findOne({ email: email.toLowerCase() })) ||
      undefined
    );
  }

  /**
   * Finds one UserAuth with the matching ID.
   * @param id UserAuth ID (UserAuth.id)
   */
  async findById(id: string): Promise<UserAuth | undefined> {
    return (await this.userAuthModel.findById(id)) || undefined;
  }

  /**
   * Updates the password of the user with the given email
   */
  async updatePasswordForUser(email: string, password: string): Promise<UserAuth> {
    const user = await this.findByEmail(email);
    if (!user)
      throw new NotFoundException(
        "A user with the given email does not exist."
      );
    user.passwordHash = await bcrypt.hash(password, 10);
    return user.save();;
  }
}
