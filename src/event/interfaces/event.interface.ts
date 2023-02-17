import { Document } from "mongoose";

export interface Event extends Document {
  readonly name: string;
  readonly parentId: "root" | string;
  readonly description: string;
}
