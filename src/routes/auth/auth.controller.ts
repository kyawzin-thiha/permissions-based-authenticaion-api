import {
	Body,
	Controller,
	Delete,
	Get,
	HttpException,
	Param,
	Post,
	Put,
	Request,
	Response,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AccountService } from 'src/database/account.service';
import { UserService } from 'src/database/user.service';
import { Permissions } from 'src/decorators/permissions.decorator';
import { Type } from 'src/decorators/type.decorator';
import { AvatarService } from 'src/helper/avatar.service';
import { AwsService } from 'src/helper/aws.service';
import { BcryptService } from 'src/helper/bcrypt.service';
import { JwtTokenService } from 'src/helper/jwt.service';
import { MailService } from 'src/helper/mail.service';
import { RedisService } from 'src/helper/redis.service';

@Controller('auth')
export class AuthController {
	constructor(
		private readonly accountService: AccountService,
		private readonly userService: UserService,
		private readonly bcryptService: BcryptService,
		private readonly jwtService: JwtTokenService,
		private readonly redisService: RedisService,
		private readonly awsService: AwsService,
		private readonly mailService: MailService,
		private readonly avatarService: AvatarService,
	) {}

	@Permissions("admin")
	@Post('create-user')
	async register(
		@Body()
		data: {
			username: string;
			email: string;
			password: string;
			name: string;
			role: string;
		}
	) {
		const avatar = this.avatarService.createAvatar(data.username);

		const [avatarUrl, awsError] = await this.awsService.uploadString(
			data.username,
			'avatar',
			avatar,
			'image/svg+xml',
		);

		if (awsError) {
			throw new HttpException(awsError.message, awsError.statusCode);
		}

		const hashedPassword = this.bcryptService.hashValue(data.password);

		const [account, dbError] = await this.accountService.createNewAccount(
			data.username,
			hashedPassword,
			data.name,
			data.email,
			data.role,
			avatarUrl,
		);

		if (dbError) {
			throw new HttpException(dbError.message, dbError.statusCode);
		}

		const confirmationTemplate =
			process.env.EMAIL_VERIFICATION_TEMPLATE_ID;
		const confirmationData = {
			subject: 'Welcome to the team!',
		};

		const mailError = await this.mailService.sendMail(
			account.user.email,
			confirmationTemplate,
			confirmationData,
		);

		if (mailError) {
			throw new HttpException(mailError.message, mailError.statusCode);
		}

		return;
	}

	@Type('Public')
	@Post('login')
	async login(
		@Body() data: { usernameOrEmail: string; password: string },
		@Response({ passthrough: true }) res,
	) {
		const [account, error] =
			await this.accountService.getAccountByUsernameOrEmail(
				data.usernameOrEmail,
			);

		if (error) {
			throw new HttpException(error.message, error.statusCode);
		}

		let isPasswordCorrect: boolean;

		if (account.username === 'root') {
			isPasswordCorrect = account.password === data.password.trim();
		} else {
			isPasswordCorrect = await this.bcryptService.compareValue(
				data.password,
				account.password,
			);
		}

		if (!isPasswordCorrect) {
			throw new HttpException('Incorrect password', 401);
		}

		const token = this.jwtService.sign(
			{
				id: account.user.id,
				username: account.username,
				accountId: account.id,
				role: account.user.role.name,
			},
			'7d',
		);

		res.cookie('token', token, {
			signed: process.env.NODE_ENV === 'production' ? true : false,
			httpOnly: process.env.NODE_ENV === 'production' ? true : false,
			secure: process.env.NODE_ENV === 'production' ? true : false,
			SameSite: 'None',
			maxAge: 60 * 60 * 24 * 7 * 1000,
		});

		return;
	}

	@Get('request-email-verification')
	async requestEmailVerification(@Request() req) {
		const { id } = req.user;

		const [user, dbError] = await this.userService.getUserById(id);

		if (dbError) {
			throw new HttpException(dbError.message, dbError.statusCode);
		}

		const uniqueKey = randomUUID();

		await this.redisService.set(uniqueKey, user.id, 60 * 60 * 24 * 3);

		const emailVerificationUrl = `${process.env.WEB_URL}/email-verification?key=${uniqueKey}`;
		const emailVerificationTemplate =
			process.env.EMAIL_VERIFICATION_TEMPLATE_ID;
		const emailVerificationData = {
			subject: 'Welcome to the team! Place verify your email address',
			url: emailVerificationUrl,
		};

		const mailError = await this.mailService.sendMail(
			user.email,
			emailVerificationTemplate,
			emailVerificationData,
		);

		if (mailError) {
			throw new HttpException(mailError.message, mailError.statusCode);
		}
	}

	@Type('Public')
	@Put('verify-email')
	async verifyEmail(@Body() data: { key: string }) {
		const userId = await this.redisService.get(data.key);

		if (!userId) {
			throw new HttpException('Invalid key', 400);
		}

		const dbError = await this.userService.verifyEmail(userId);

		if (dbError) {
			throw new HttpException(dbError.message, dbError.statusCode);
		}

		return;
	}

	@Type("Public")
	@Post('request-password-reset')
	async requestPasswordReset(@Body() data: {usernameOrEmail: string}) {

		const [account, dbError] = await this.accountService.getAccountByUsernameOrEmail(data.usernameOrEmail);

		if (dbError) {
			throw new HttpException(dbError.message, dbError.statusCode);
		}

		const uniqueKey = randomUUID();

		await this.redisService.set(uniqueKey, account.id, 60 * 60 * 24 * 3);

		console.log(uniqueKey);

		const resetPasswordUrl = `${process.env.WEB_URL}/reset-password?key=${uniqueKey}`;
		const resetPasswordTemplate = process.env.RESET_PASSWORD_TEMPLATE_ID;
		const resetPasswordData = {
			subject: 'Reset your password',
			url: resetPasswordUrl,
		};

		const mailError = await this.mailService.sendMail(
			account.user.email,
			resetPasswordTemplate,
			resetPasswordData,
		);

		if (mailError) {
			throw new HttpException(mailError.message, mailError.statusCode);
		}

		return;
	}

	@Type('Public')
	@Put('reset-password')
	async resetPassword(@Body() data: { key: string; password: string }) {

		const accountId = await this.redisService.get(data.key);

		if (!accountId) {
			throw new HttpException('Invalid key', 400);
		}

		const hashedPassword = this.bcryptService.hashValue(data.password);

		const dbError = await this.accountService.updatePassword(
			accountId,
			hashedPassword,
		);

		if (dbError) {
			throw new HttpException(dbError.message, dbError.statusCode);
		}

		return;
	}

	@Put('update-password')
	async updatePassword(@Request() req, @Body() data: { password: string }) {
		const { id } = req.user;

		const hashedPassword = this.bcryptService.hashValue(data.password);

		const dbError = await this.accountService.updatePassword(
			id,
			hashedPassword,
		);

		if (dbError) {
			throw new HttpException(dbError.message, dbError.statusCode);
		}

		return;
	}

	@Permissions('admin')
	@Put('activate-account')
	async activateAccount(@Body() data: { accountId: string }) {
		const dbError = await this.accountService.activateAccount(data.accountId);

		if (dbError) {
			throw new HttpException(dbError.message, dbError.statusCode);
		}

		return;
	}

	@Permissions('admin')
	@Put('deactivate-account')
	async deactivateAccount(@Body() data: { accountId: string }) {
		const dbError = await this.accountService.deactivateAccount(data.accountId);

		if (dbError) {
			throw new HttpException(dbError.message, dbError.statusCode);
		}

		return;
	}

	@Post('logout')
	async logout(@Response({ passthrough: true }) res) {
		res.clearCookie('token');

		return;
	}

	@Permissions('admin')
	@Delete('remove-user/:accountId')
	async deleteUser(@Param("accountId") accountId: string) {
		const dbError = await this.accountService.deleteAccount(accountId);

		if (dbError) {
			throw new HttpException(dbError.message, dbError.statusCode);
		}

		return;
	}

	@Delete('account')
	async deleteAccount(@Request() req) {

		const { accountId } = req.user;

		const dbError = await this.accountService.deleteAccount(accountId);

		if (dbError) {
			throw new HttpException(dbError.message, dbError.statusCode);
		}

		return;
	}
}
