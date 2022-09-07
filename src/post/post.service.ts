import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostService {
  constructor(
    private storageService: StorageService,
    private prisma: PrismaService,
  ) {}

  async createPost(
    userId: number,
    files: Array<Express.Multer.File>,
    dto: CreatePostDto,
  ) {
    const post = await this.prisma.$transaction(async (prismaTransaction) => {
      const newPost = await prismaTransaction.post.create({
        data: { caption: dto.caption, userId },
      });

      const arrOfFileUploadPromise = files.map((file) =>
        this.storageService.upload(file),
      );

      const arrOfFileUrl = await Promise.all(arrOfFileUploadPromise);

      const newNote = await prismaTransaction.note.create({
        data: { price: +dto.price, title: dto.title, postId: newPost.id },
      });

      await prismaTransaction.notePictures.createMany({
        data: arrOfFileUrl.map((url) => ({
          picture_url: url,
          noteId: newNote.id,
        })),
      });

      return { ...newPost, note: { ...newNote, pictures: arrOfFileUrl } };
    });

    return { message: 'Sukses upload post', data: post };
  }
}
