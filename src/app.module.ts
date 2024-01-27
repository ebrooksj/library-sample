import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { BooksModule } from './books/books.module';
import { AuthenticationService } from './authentication/authentication.service';
import { APP_GUARD } from '@nestjs/core';
import { HasRoleGuard } from './authentication/guards/has-role/has-role.guard';
import { SetUserRoleMiddleware } from './authentication/middleware/get-user-role/set-user-role.middleware';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ENV_KEYS } from './config/env.constants';
import {
  UserRole,
  UserRoleSchema,
} from './authentication/entities/role.entity';

@Module({
  imports: [
    UsersModule,
    BooksModule,
    // Global config for the sake of expediency.
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        uri: config.get<string>(ENV_KEYS.MONGO_URI),
      }),
    }),
    MongooseModule.forFeature([
      { name: UserRole.name, schema: UserRoleSchema },
    ]),
  ],
  controllers: [],
  providers: [
    AuthenticationService,
    {
      provide: APP_GUARD,
      useClass: HasRoleGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply consumer role middleware to all routes, since we don't have any non-authorized routes at this time.
    // We can conditionally apply the middleware if needed.
    consumer.apply(SetUserRoleMiddleware).forRoutes('*');
  }
}
