import {
  Injectable,
  BadRequestException,
  ConflictException
} from "@nestjs/common";
import { Model } from "mongoose";
import { User } from "./interfaces/user.interface";
import { InjectModel } from "@nestjs/mongoose";
import { CreateUserDto } from "./dto/create-user.dto";
import { UserAuthService } from "../user-auth/user-auth.service";

@Injectable()
export class UserService {
  constructor(
    @InjectModel("User") private userModel: Model<User>,
    private userAuthService: UserAuthService
  ) {}

  /**
   * Create a User. Note that the user must be verified.
   * @param req CreateUserDto
   */
  async create(req: CreateUserDto): Promise<User> {
    const userAuth = await this.userAuthService.findById(req.userAuthId);
    if (!userAuth.isVerified) {
      throw new BadRequestException("User must be verified");
    }

    let existingUser: User | undefined = undefined;
    try {
      existingUser = await this.findByAuthId(req.userAuthId);
    } catch (e) {
      existingUser = undefined;
    }

    if (existingUser) {
      throw new ConflictException("A user with the same authId already exists");
    }

    const createdUser = new this.userModel({
      userAuthId: userAuth.id,
      email: userAuth.email,
      name: req.name
    });

    return createdUser.save();
  }

  /**
   * Returns a list of all the Users in the database
   */
  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  /**
   * Finds a User with the matching AuthId
   * @param authId User Auth Id to find
   */
  async findByAuthId(authId: string): Promise<User> {
    return await this.userModel.findOne({ authId });
  }
}
