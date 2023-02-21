import {
	Controller,
	Get,
	Request,
	HttpException,
	Body,
	Put,
	UseInterceptors,
	UploadedFile,
	ParseFilePipe,
	FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from 'src/database/user.service';
import { Permissions } from 'src/decorators/permissions.decorator';
import { AwsService } from 'src/helper/aws.service';

@Controller('user')
export class UserController {
	constructor(
		private readonly userService: UserService,
		private readonly awsService: AwsService,
	) {}

	@Get('get-user')
	async getUser(@Request() req) {
		const { id } = req.user;

		const [user, dbError] = await this.userService.getUserById(id);

		if (dbError) {
			throw new HttpException(dbError.message, dbError.statusCode);
		}

		return user;
	}

	@Permissions('admin')
	@Get("get-all-users")
	async getAllUsers() {
		const [users, dbError] = await this.userService.getAllUsers();

		if (dbError) {
			throw new HttpException(dbError.message, dbError.statusCode);
		}

		return users;
	}

	@Put('update-avatar')
	@UseInterceptors(FileInterceptor('avatar'))
	async updateAvatar(
		@Request() req,
		@UploadedFile(
			new ParseFilePipe({
                validators: [
					new FileTypeValidator({ fileType: "image/*" }),
				],
			}),
		)
		avatar: Express.Multer.File,
	) {
		const { id, username } = req.user;

 		const [avatarUrl, awsUploadError] = await this.awsService.uploadFile(
			username,
			avatar,
			'avatar',
		);

		if (awsUploadError) {
			throw new HttpException(awsUploadError.message, awsUploadError.statusCode);
		} 

		const dbError = await this.userService.updateAvatar(id, avatarUrl);

		if (dbError) {
			throw new HttpException(dbError.message, dbError.statusCode);
		}

		return;
	}

	@Permissions('admin')
	@Put('update-user-name')
	async updateUserName(@Body() data: { userId: string; name: string }) {
		const dbError = await this.userService.updateName(data.userId, data.name);

		if (dbError) {
			throw new HttpException(dbError.message, dbError.statusCode);
		}

		return;
	}

	@Permissions("admin")
	@Put("update-name")
	async updateName(@Request() req, @Body() data: { name: string }) {
		const { id } = req.user;
		const dbError = await this.userService.updateName(id, data.name);

		if (dbError) {
			throw new HttpException(dbError.message, dbError.statusCode);
		}

		return;
	}

	@Permissions('admin')
	@Put('update-user-email')
	async updateUserEmail(@Body() data: { userId: string; email: string }) {
		const dbError = await this.userService.updateEmail(data.userId, data.email);

		if (dbError) {
			throw new HttpException(dbError.message, dbError.statusCode);
		}

		return;
	}

	@Permissions('admin')
	@Put('update-email')
	async updateEmail(@Request() req, @Body() data: { email: string }) {

		const { id } = req.user;
		
		const dbError = await this.userService.updateEmail(id, data.email);

		if (dbError) {
			throw new HttpException(dbError.message, dbError.statusCode);
		}

		return;
	}

	@Permissions('admin')
	@Put('update-role')
	async updateRole(@Body() data: { userId: string; role: string }) {
		const dbError = await this.userService.updateRole(data.userId, data.role);

		if (dbError) {
			throw new HttpException(dbError.message, dbError.statusCode);
		}

		return;
	}
}
