import { Injectable } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class PostService {
  constructor(private storageService: StorageService) {}

  async createPost(file: Express.Multer.File) {
    const res = await this.storageService.upload(file);
    return { url: res };
  }
}
