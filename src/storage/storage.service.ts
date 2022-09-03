import { Storage } from '@google-cloud/storage';
import { Bucket } from '@google-cloud/storage/build/src/bucket';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StorageService extends Storage {
  private storageBucket: Bucket;
  private bucketName: string;

  constructor(config: ConfigService) {
    super({ keyFile: config.get<string>('GOOGLE_APPLICATION_CREDENTIALS') });
    this.bucketName = config.get<string>('STORAGE_BUCKET_NAME');
    this.storageBucket = this.bucket(this.bucketName);
  }

  async upload(file: Express.Multer.File) {
    try {
      const blob = this.storageBucket.file(file.originalname);

      const url = await new Promise((resolve, reject) => {
        const blobStream = blob.createWriteStream({ resumable: false });

        blobStream.on('error', (e) => {
          reject(e.message);
        });

        blobStream.on('finish', async () => {
          const publicUrl = `https://storage.googleapis.com/${this.bucketName}/${blob.name}`;
          resolve(publicUrl);
        });

        blobStream.end(file.buffer);
      });

      return url;
    } catch (e) {
      throw new InternalServerErrorException('Error upload file');
    }
  }
}
