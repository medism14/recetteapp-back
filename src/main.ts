import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  // Configuration
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());

  // Configuration swagger
  const config = new DocumentBuilder()
  .setTitle('API Recettes')
  .setDescription('Documentation de l\'API de recettes')
  .setVersion('1.0')
  .addTag('recettes')
  .addBearerAuth()
  .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)

  // Port d'écoute de l'application
  await app.listen(process.env.PORT);
}
bootstrap();
