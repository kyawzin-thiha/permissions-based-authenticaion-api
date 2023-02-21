import { SetMetadata } from '@nestjs/common';

export const Permissions = (
	...permissions: ('admin' | 'read' | 'write' | 'edit' | 'delete')[]
) => SetMetadata('permissions', permissions);
