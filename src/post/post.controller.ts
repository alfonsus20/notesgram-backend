import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { Get, UseGuards } from '@nestjs/common/decorators';
import { AnyFilesInterceptor } from '@nestjs/platform-express/multer';
import { GetUser } from '../auth/decorators';
import { JwtGuard } from '../auth/guard';
import { CreatePostDto } from './dto/create-post.dto';
import { PostService } from './post.service';

@Controller('post')
@UseGuards(JwtGuard)
export class PostController {
  constructor(private postService: PostService) {}

  @Get()
  getPost() {
    return this.postService.getPosts();
  }

  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  createPost(
    @GetUser('id') userId: number,
    @UploadedFiles()
    files: Array<Express.Multer.File>,
    @Body() dto: CreatePostDto,
  ) {
    if (
      files.some(
        (file) => !/\.(gif|jpe?g|tiff?|png|webp|bmp)$/i.test(file.originalname),
      )
    ) {
      throw new BadRequestException('Error file type');
    }

    if (files.length < 2) {
      throw new BadRequestException('File minimal 2');
    }

    return this.postService.createPost(userId, files, dto);
  }
}
