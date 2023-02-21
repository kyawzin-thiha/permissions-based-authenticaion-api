import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleService } from 'src/database/role.service';

@Injectable()
export class PermissionGuard implements CanActivate {
	constructor(
		private reflector: Reflector,
		private readonly role: RoleService,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		console.log("permission guard");
		const requiredPermissions = this.reflector.get<string[]>(
			'permissions',
			context.getHandler(),
		);
		if (!requiredPermissions) {
			return true;
		}
		const request = context.switchToHttp().getRequest();
		
		const user = request.user;

		const [userPermissions, error] = await this.role.getUserPermissions(
			user.id,
		);

		if (error) {
			return false;
		}

		const hasPermission = userPermissions.some((permission) =>
			requiredPermissions.includes(permission),
		);

		return hasPermission;
	}
}
