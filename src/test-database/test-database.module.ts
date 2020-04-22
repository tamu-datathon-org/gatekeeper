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
        if (process.env.CI) {
          // http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
          const randomDBName =
            Math.random()
              .toString(36)
              .substring(2, 15) +
            Math.random()
              .toString(36)
              .substring(2, 20);
          return { uri: `mongodb://localhost:27017/${randomDBName}` };
        }
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
