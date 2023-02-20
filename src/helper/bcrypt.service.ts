import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class BcryptService {
    
	hashValue(value: string) {
		const salt = bcrypt.genSaltSync(10);
		return bcrypt.hashSync(value, salt);
	}

	compareValue(value: string, hash: string) {
		return bcrypt.compareSync(value, hash);
	}
}
