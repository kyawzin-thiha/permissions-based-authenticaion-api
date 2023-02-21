import { Body, Controller, Delete, Get, HttpException, Param, Post, Put } from '@nestjs/common';
import { RoleService } from 'src/database/role.service';
import { Permissions } from 'src/decorators/permissions.decorator';

@Controller('role')
export class RoleController {
	constructor(private readonly roleService: RoleService) {}

	@Permissions('admin')
	@Get('get-all-roles')
	async getAllRoles() {
		const [roles, dbError] = await this.roleService.getAllRoles();

		if (dbError) {
			throw new HttpException(dbError.message, dbError.statusCode);
		}

		return roles;
	}

	@Permissions('admin')
	@Post('create-role')
	async createRole(
		@Body()
		data: {
			name: string;
			description: string;
			permission: {
				read: boolean;
				write: boolean;
				delete: boolean;
				admin: boolean;
			};
		},
	) {
		const [role, dbError] = await this.roleService.createNewRole(
			data.name,
			data.description,
			data.permission,
		);

		if (dbError) {
			throw new HttpException(dbError.message, dbError.statusCode);
		}

		return role;
	}

	@Permissions('admin')
	@Put('update-role')
	async updateRole(
		@Body()
		data: {
			id: string;
			name: string;
			description: string;
			permission: {
				read: boolean;
				write: boolean;
				delete: boolean;
				admin: boolean;
			};
		},
	) {
		const dbError = await this.roleService.updateRole(
			data.id,
			data.name,
			data.description,
			data.permission,
		);

		if (dbError) {
			throw new HttpException(dbError.message, dbError.statusCode);
		}

		return;
	}

	@Permissions('admin')
	@Delete(':id')
	async deleteRole(@Param("id") id: string) {
		const dbError = await this.roleService.deleteRole(id);

		if (dbError) {
			throw new HttpException(dbError.message, dbError.statusCode);
		}

		return;
	}
}
