import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/helper/prisma.service';
import { AccountWithUserAndsRoleDto } from 'src/types/database.dto';
import { ErrorDto } from 'src/types/error.dto';

@Injectable()
export class AccountService {
	constructor(private readonly prisma: PrismaService) {}

	async createNewAccount(
		username: string,
		password: string,
		name: string,
		email: string,
		role: string,
		avatar: string,
	): Promise<[AccountWithUserAndsRoleDto, ErrorDto]> {
		try {
			const account = await this.prisma.account.create({
				data: {
					username,
					password,
					user: {
						create: {
							name,
							email,
							avatar,
							role: {
								connect: {
									id: role,
								},
							},
						},
					},
				},
				include: {
					user: {
						include: {
							role: true,
						},
					},
				},
			});
			return [account, null];
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === 'P2002') {
					return [
						null,
						{ message: 'Username or email already exists', statusCode: 400 },
					];
				}
			}
			return [null, { message: 'Internal server error', statusCode: 500 }];
		}
	}

	async getAccountById(
		id: string,
	): Promise<[AccountWithUserAndsRoleDto, ErrorDto]> {
		try {
			const account = await this.prisma.account.findUnique({
				where: {
					id,
				},
				include: {
					user: {
						include: {
							role: true,
						},
					},
				},
			});
			return [account, null];
		} catch (error) {
			return [null, { message: 'Internal server error', statusCode: 500 }];
		}
	}

	async getAccountByUsername(
		username: string,
	): Promise<[AccountWithUserAndsRoleDto, ErrorDto]> {
		try {
			const account = await this.prisma.account.findUnique({
				where: {
					username,
				},
				include: {
					user: {
						include: {
							role: true,
						},
					},
				},
			});
			if (!account) {
				return [null, { message: 'Account not found', statusCode: 404 }];
			}
			return [account, null];
		} catch (error) {
			return [null, { message: 'Internal server error', statusCode: 500 }];
		}
	}

	async getAccountByEmail(
		email: string,
	): Promise<[AccountWithUserAndsRoleDto, ErrorDto]> {
		try {
			const account = await this.prisma.account.findFirst({
				where: {
					user: {
						email,
					},
				},
				include: {
					user: {
						include: {
							role: true,
						},
					},
				},
			});
			if (!account) {
				return [null, { message: 'Account not found', statusCode: 404 }];
			}
			return [account, null];
		} catch (error) {
			return [null, { message: 'Internal server error', statusCode: 500 }];
		}
	}

	async getAccountByUsernameOrEmail(
		usernameOrEmail: string,
	): Promise<[AccountWithUserAndsRoleDto, ErrorDto]> {
		try {
			const account = await this.prisma.account.findFirst({
				where: {
					OR: [
						{
							username: usernameOrEmail,
						},
						{
							user: {
								email: usernameOrEmail,
							},
						},
					],
					isActive: true,
				},
				include: {
					user: {
						include: {
							role: true,
						},
					},
				},
			});
			if (!account) {
				return [null, { message: 'Account not found', statusCode: 404 }];
			}
			return [account, null];
		} catch (error) {
			return [null, { message: 'Internal server error', statusCode: 500 }];
		}
	}

	async getAllUsernames(): Promise<[string[], ErrorDto]> {
		try {
			const accounts = await this.prisma.account.findMany({
				select: {
					username: true,
				},
			});
			return [accounts.map((account) => account.username), null];
		} catch (error) {
			return [null, { message: 'Internal server error', statusCode: 500 }];
		}
	}

	async getAllEmails(): Promise<[string[], ErrorDto]> {
		try {
			const accounts = await this.prisma.account.findMany({
				select: {
					user: {
						select: {
							email: true,
						},
					},
				},
			});
			return [accounts.map((account) => account.user.email), null];
		} catch (error) {
			return [null, { message: 'Internal server error', statusCode: 500 }];
		}
	}

	async updateUsername(id: string, username: string): Promise<ErrorDto> {
		try {
			await this.prisma.account.update({
				where: {
					id,
				},
				data: {
					username,
				},
			});
			return null;
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === 'P2002') {
					return { message: 'Username already exists', statusCode: 400 };
				}
			}
			return { message: 'Internal server error', statusCode: 500 };
		}
	}

	async updatePassword(id: string, password: string): Promise<ErrorDto> {
		try {
			await this.prisma.account.update({
				where: {
					id,
				},
				data: {
					password,
				},
			});
			return null;
		} catch (error) {
			return { message: 'Internal server error', statusCode: 500 };
		}
	}

	async activateAccount(id: string): Promise<ErrorDto> {
		try {
			await this.prisma.account.update({
				where: {
					id,
				},
				data: {
					isActive: true,
				},
			});
			return null;
		} catch (error) {
			return { message: 'Internal server error', statusCode: 500 };
		}
	}

	async deactivateAccount(id: string): Promise<ErrorDto> {
		try {
			await this.prisma.account.update({
				where: {
					id,
				},
				data: {
					isActive: false,
				},
			});
			return null;
		} catch (error) {
			return { message: 'Internal server error', statusCode: 500 };
		}
	}

	async deleteAccount(id: string): Promise<ErrorDto> {
		try {
			await this.prisma.account.delete({
				where: {
					id,
				},
			});
			return null;
		} catch (error) {
			return { message: 'Internal server error', statusCode: 500 };
		}
	}
}
