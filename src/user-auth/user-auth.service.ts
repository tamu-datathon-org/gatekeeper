import { Model } from "mongoose";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { UserAuth } from "./interfaces/user-auth.interface";

@Injectable()
export class UserAuthService {
  constructor(
    @InjectModel("UserAuth") private userAuthModel: Model<UserAuth>
  ) {}

  async create(createUserAuth: Partial<UserAuth>): Promise<UserAuth> {
    const createdUserAuth = new this.userAuthModel(createUserAuth);
    return createdUserAuth.save();
  }

  async findAll(): Promise<UserAuth[]> {
    return this.userAuthModel.find().exec();
  }

  async findByEmail(email: string): Promise<UserAuth> {
    return await this.userAuthModel.findOne({ email });
  }
}
