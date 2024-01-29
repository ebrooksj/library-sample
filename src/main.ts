import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { APP_CONSTANTS } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      errorHttpStatusCode: 422,
      whitelist: true,
      forbidUnknownValues: true,
      skipMissingProperties: false,
    }),
  );
  const PORT = process.env.PORT || 3000;

  const config = new DocumentBuilder()
    .setTitle('Library API')
    .setDescription(
      'A simple, example API to provide basic functionality of checking out and returning books from a library.',
    )
    .setVersion('1.0')
    .addApiKey(null, APP_CONSTANTS.AUTH_HEADER)
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(PORT);
}
bootstrap();
