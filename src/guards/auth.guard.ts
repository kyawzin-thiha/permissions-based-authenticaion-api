import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtTokenService } from 'src/helper/jwt.service';

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(
		private reflector: Reflector,
		private readonly jwt: JwtTokenService,
	) {}

	canActivate(context: ExecutionContext): boolean {
		const type = this.reflector.get<string>(
			'type',
			context.getHandler(),
		);
		if (type === "Public") {
			return true;
		}
		const request = context.switchToHttp().getRequest();
		const token =
			request.cookies?.['token'] || request.signedCookies?.['token'];
		if (!token) {
			return false;
		}

		const user = this.jwt.verify(token);

		if (!user) {
			return false;
		}

		request.user = user;

		return true;
	}
}
