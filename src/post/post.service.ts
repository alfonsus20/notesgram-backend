import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreatePostDto } from './dto';

@Injectable()
export class PostService {
  constructor(
    private storageService: StorageService,
    private prisma: PrismaService,
  ) {}

  async getPosts() {
    const posts = await this.prisma.post.findMany({
      include: { note: { include: { note_pictures: true } } },
    });

    return { message: 'Sukses get semua post', data: posts };
  }

  async createPost(
    userId: number,
    files: Array<Express.Multer.File>,
    dto: CreatePostDto,
  ) {
    const post = await this.prisma.$transaction(async (prismaTransaction) => {
      const arrOfFileUploadPromise = files.map((file) =>
        this.storageService.upload(file),
      );

      const arrOfFileUrl = await Promise.all(arrOfFileUploadPromise);

      const newPost = await prismaTransaction.post.create({
        data: {
          caption: dto.caption,
          userId,
          note: {
            create: {
              price: +dto.price,
              title: dto.title,
              note_pictures: {
                create: arrOfFileUrl.map((file) => ({ picture_url: file })),
              },
            },
          },
        },
        include: { note: { include: { note_pictures: true } } },
      });

      return newPost;
    });

    return { message: 'Sukses upload post', data: post };
  }
}
