import { Injectable } from '@nestjs/common';
import { ErrorDto } from 'src/types/error.dto';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sgMail = require('@sendgrid/mail');

@Injectable()
export class MailService {
	setApiKey = () => sgMail.setApiKey(process.env.SENDGRID_API_KEY);

	async sendMail(
		to: string,
		templateId: string,
		dynamicTemplateData: any,
	): Promise<ErrorDto> {
		try {
			this.setApiKey();
			const msg = {
				to,
				from: process.env.SENDGRID_FROM_EMAIL,
				templateId,
				dynamicTemplateData,
			};
			await sgMail.send(msg);
			return null;
		} catch (error) {
			return { message: 'Server Error', statusCode: 500 };
		}
	}
}
