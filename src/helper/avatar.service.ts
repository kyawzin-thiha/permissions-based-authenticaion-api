import { Injectable } from '@nestjs/common';
import { createAvatar } from '@dicebear/avatars';
import * as style from "@dicebear/big-ears-neutral";

@Injectable()
export class AvatarService {
	createAvatar(username: string) {
		const svg = createAvatar(style, {
			seed: username,
			backgroundColor: ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf'],
		});
		return svg;
	}
}
