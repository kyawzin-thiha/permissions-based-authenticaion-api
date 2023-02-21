import { SetMetadata } from '@nestjs/common';

export const Type = (type: "Public") => SetMetadata('type', type);