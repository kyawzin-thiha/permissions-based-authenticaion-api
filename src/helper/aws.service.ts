import { Injectable } from '@nestjs/common';
import {
	DeleteObjectCommand,
	PutObjectCommand,
	S3Client,
} from '@aws-sdk/client-s3';
import { ErrorDto } from 'src/types/error.dto';

@Injectable()
export class AwsService {
	s3Client = new S3Client({
		region: process.env.AWS_REGION,
		apiVersion: '2006-03-01',
	});

	async uploadFile(
		username: string,
		file: Express.Multer.File,
		fileName?: string,
	): Promise<[string | null, ErrorDto]> {
		const params = {
			Bucket: process.env.AWS_BUCKET,
			Key: `${process.env.AWS_S3_FOLDER_PATH}/${username}/${fileName? fileName : file.originalname}`,
			Body: file.buffer,
		};

		try {
			await this.s3Client.send(new PutObjectCommand(params));
		} catch (error) {
			return [null, { message: 'Server Error', statusCode: 500}];
		} finally {
			return [`${process.env.AWS_S3_DOMAIN}/${params.Key}`, null];
		}
	}

	async uploadString(
		username: string,
		fileName: string,
		fileString: string,
		type: string,
	): Promise<[string | null, ErrorDto]> {
		const params = {
			Bucket: process.env.AWS_BUCKET,
			Key: `${process.env.AWS_S3_FOLDER_PATH}/${username}/${fileName}`,
			Body: fileString,
			ContentType: type,
		};
		try {
			await this.s3Client.send(new PutObjectCommand(params));
		} catch (error) {
			return [null, { message: 'Server Error', statusCode: 500}];
		} finally {
			return [`${process.env.AWS_S3_DOMAIN}/${params.Key}`, null];
		}
	}

	async deleteFile(fileKey: string): Promise<ErrorDto> {
		const params = {
			Bucket: process.env.AWS_BUCKET,
			Key: fileKey,
		};

		try {
			await this.s3Client.send(new DeleteObjectCommand(params));
			return null;
		} catch (error) {
			return { message: 'Server Error', statusCode: 500};
		}
	}
}
