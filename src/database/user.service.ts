import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/helper/prisma.service';
import { UserWithRoleDto } from 'src/types/database.dto';
import { ErrorDto } from 'src/types/error.dto';

@Injectable()
export class UserService {
	constructor(private readonly prisma: PrismaService) {}

	async getUserById(id: string): Promise<[UserWithRoleDto, ErrorDto]> {
		try {
			const user = await this.prisma.user.findUnique({
				where: {
					id,
				},
				include: {
					role: true,
				},
			});
			if (!user) {
				return [null, { message: 'User not found', statusCode: 404 }];
			}
			return [user, null];
		} catch (error) {
			return [null, { message: 'Internal server error', statusCode: 500 }];
		}
	}

	async getUserByAccountId(
		accountId: string,
	): Promise<[UserWithRoleDto, ErrorDto]> {
		try {
			const user = await this.prisma.user.findFirst({
				where: {
					account: {
						id: accountId,
					},
				},
				include: {
					role: true,
				},
			});
			if (!user) {
				return [null, { message: 'User not found', statusCode: 404 }];
			}
			return [user, null];
		} catch (error) {
			return [null, { message: 'Internal server error', statusCode: 500 }];
		}
	}

	async getUsersByRole(roleId: string): Promise<[UserWithRoleDto[], ErrorDto]> {
		try {
			const users = await this.prisma.user.findMany({
				where: {
					role: {
						id: roleId,
					},
				},
				include: {
					role: true,
				},
			});
			return [users, null];
		} catch (error) {
			return [null, { message: 'Internal server error', statusCode: 500 }];
		}
	}

	async getAllUsers(): Promise<[UserWithRoleDto[], ErrorDto]> {
		try {
			const users = await this.prisma.user.findMany({
				include: {
					role: true,
				},
			});
			return [users, null];
		} catch (error) {
			return [null, { message: 'Internal server error', statusCode: 500 }];
		}
	}

	async updateName(id: string, name: string): Promise<ErrorDto> {
		try {
			await this.prisma.user.update({
				where: {
					id,
				},
				data: {
					name,
				},
			});
			return null;
		} catch (error) {
			return { message: 'Internal server error', statusCode: 500 };
		}
	}

	async updateEmail(id: string, email: string): Promise<ErrorDto> {
		try {
			await this.prisma.user.update({
				where: {
					id,
				},
				data: {
					email,
				},
			});
			return null;
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
				return { message: 'Email already taken', statusCode: 400 };
			} 
			return { message: 'Internal server error', statusCode: 500 };
		}
	}

	async updateAvatar(id: string, avatar: string): Promise<ErrorDto> {
		try {
			await this.prisma.user.update({
				where: {
					id,
				},
				data: {
					avatar,
				},
			});
			return null;
		} catch (error) {
			return { message: 'Internal server error', statusCode: 500 };
		}
	}

	async updateRole(id: string, roleId: string): Promise<ErrorDto> {
		try {
			await this.prisma.user.update({
				where: {
					id,
				},
				data: {
					role: {
						connect: {
							id: roleId,
						},
					},
				},
			});
			return null;
		} catch (error) {
			return { message: 'Internal server error', statusCode: 500 };
		}
	}

	async verifyEmail(id: string): Promise<ErrorDto> {
		try {
			await this.prisma.user.update({
				where: {
					id,
				},
				data: {
					isVerified: true,
				},
			});
			return null;
		} catch (error) {
			return { message: 'Internal server error', statusCode: 500 };
		}
	}
}
