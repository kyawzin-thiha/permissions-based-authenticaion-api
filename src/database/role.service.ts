import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/helper/prisma.service';
import {
	RoleWithPermissionDto,
	RolesWithPermissionDto,
} from 'src/types/database.dto';
import { ErrorDto } from 'src/types/error.dto';

@Injectable()
export class RoleService {
	constructor(private readonly prisma: PrismaService) {}

	async createNewRole(
		name: string,
		description: string,
		permission: {
			read: boolean;
			write: boolean;
			delete: boolean;
			admin: boolean;
		},
	): Promise<[RoleWithPermissionDto, ErrorDto]> {
		try {
			const role = await this.prisma.role.create({
				data: {
					name,
					description,
					permission: {
						create: permission,
					},
				},
				include: {
					permission: true,
				},
			});
			return [role, null];
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === 'P2002') {
					return [null, { message: 'Role already exists', statusCode: 400 }];
				}
			}
			return [null, { message: 'Internal server error', statusCode: 500 }];
		}
	}

	async getAllRoles(): Promise<[RolesWithPermissionDto, ErrorDto]> {
		try {
			const roles = await this.prisma.role.findMany({
				include: {
					permission: true,
				},
			});
			return [roles, null];
		} catch (error) {
			return [null, { message: 'Internal server error', statusCode: 500 }];
		}
	}

	async getRoleById(id: string): Promise<[RoleWithPermissionDto, ErrorDto]> {
		try {
			const role = await this.prisma.role.findUnique({
				where: {
					id,
				},
				include: {
					permission: true,
				},
			});
			if (!role) {
				return [null, { message: 'Role not found', statusCode: 404 }];
			}
			return [role, null];
		} catch (error) {
			return [null, { message: 'Internal server error', statusCode: 500 }];
		}
	}

	async getUserPermissions(userId: string): Promise<[string[], ErrorDto]> {
		try {
			const role = await this.prisma.role.findFirst({
				where: {
					users: {
						some: {
							id: userId,
						},
					},
				},
				include: {
					permission: true,
				},
			});
			if (!role) {
				return [null, { message: 'Internal Server Error', statusCode: 500 }];
			}
			return [
				Object.keys(role.permission).filter(
					(key) => role.permission[key] === true,
				),
				null,
			];
		} catch (error) {
			return [null, { message: 'Internal Server Error', statusCode: 500 }];
		}
	}

	async updateRole(
		id: string,
		name: string,
		description: string,
		permission: {
			read: boolean;
			write: boolean;
			delete: boolean;
			admin: boolean;
		},
	): Promise<ErrorDto> {
		try {
			await this.prisma.role.update({
				where: {
					id,
				},
				data: {
					name,
					description,
					permission: {
						update: permission,
					},
				},
			});
			return null;
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
				return { message: 'Role already exists', statusCode: 400 };
			} 
			return { message: 'Internal server error', statusCode: 500 };
		}
	}

	async deleteRole(id: string): Promise<ErrorDto> {
		try {
			await this.prisma.role.delete({
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
