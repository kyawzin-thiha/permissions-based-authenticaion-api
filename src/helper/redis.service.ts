import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class RedisService {
	constructor(@Inject('Redis') private readonly redis) {}

	async set(key: string, value: string, expire?: number) {
		if (expire) {
			await this.redis.set(key, value, { EX: expire, NX: true });
			return;
		}
		await this.redis.set(key, value);
		return;
	}

	async get(key: string) {
		return await this.redis.get(key);
	}
}
