import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  	app.enableCors({
		origin: process.env.CLIENT_URL || 'http://localhost:3000',
		credentials: true,
	});

	app.use(helmet());
	app.use(cookieParser(process.env.COOKIE_SECRET));
  
  const PORT = process.env.PORT || 3001;

  await app.listen(PORT);
}
bootstrap();
