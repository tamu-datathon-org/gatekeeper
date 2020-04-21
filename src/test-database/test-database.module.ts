import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

/**
 * Test In-Memory Mongo DB instance used for Unit Tests
 */
@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: async () => {
        const mongod = new MongoMemoryServer();
        const uri = await mongod.getConnectionString();
        return {
          uri: uri
        };
      }
    })
  ]
})
export class TestDatabaseModule {}
