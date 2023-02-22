import { Prisma } from '@prisma/client';

export function PermissionMiddleware<
	T extends Prisma.BatchPayload = Prisma.BatchPayload,
>(): Prisma.Middleware {
	return async (
		params: Prisma.MiddlewareParams,
		next: (params: Prisma.MiddlewareParams) => Promise<T>,
	) => {
        if (params.model == 'Role') {
			switch (params.action) {
				case 'create':
					if (params.args.data.permission.create.admin) {
						params.args.data.permission.create.read = true;
						params.args.data.permission.create.write = true;
						params.args.data.permission.create.delete = true;
                    }
					break;
				case 'update':
					if (params.args.data.permission.update.admin) {
						params.args.data.permission.update.read = true;
						params.args.data.permission.update.write = true;
						params.args.data.permission.update.delete = true;
					}
					break;
			}
		}
		return next(params);
	};
}
