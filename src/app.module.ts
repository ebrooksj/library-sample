import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthorizationService } from './authorization/authorization.service';
import { UserRole, UserRoleSchema } from './authorization/entities/role.entity';
import { SetUserRoleMiddleware } from './authorization/middleware/get-user-role/set-user-role.middleware';
import { BooksModule } from './books/books.module';
import { ENV_KEYS } from './config/env.constants';
import { UsersModule } from './users/users.module';

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
    AuthorizationService,
    // Providing the APP_GUARD token provides the HasRoleGuard to all routes.
    // {
    //   provide: APP_GUARD,
    //   useClass: HasRoleGuard,
    // },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply consumer role middleware to all routes, since we don't have any non-authorized routes at this time.
    // We can conditionally apply the middleware if needed.
    consumer.apply(SetUserRoleMiddleware).forRoutes('*');
  }
}
