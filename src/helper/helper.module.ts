import { Module } from '@nestjs/common';
import { createClient } from 'redis';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from './prisma.service';
import { RedisService } from './redis.service';
import { JwtTokenService } from './jwt.service';
import { AwsService } from './aws.service';
import { AvatarService } from './avatar.service';
import { MailService } from './mail.service';
import { BcryptService } from './bcrypt.service';
@Module({
	imports: [
		JwtModule.register({
			secret: process.env.JWT_SECRET,
		}),
	],
	providers: [
		PrismaService,
		RedisService,
		JwtTokenService,
		AwsService,
		AvatarService,
		MailService,
		BcryptService,
		{
			provide: 'Redis',
			useFactory: async () => {
				const client = createClient({
					url: process.env.REDIS_URL,
				});
				client.on('error', (err) => {
					console.log(err);
					process.exit(1);
				});
				await client.connect();
				return client;
			},
		},
	],
	exports: [PrismaService, RedisService, JwtTokenService, AwsService, AvatarService, MailService, BcryptService],
})
export class HelperModule {}
