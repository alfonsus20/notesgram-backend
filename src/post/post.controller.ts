import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { Get, Param, Query, UseGuards } from '@nestjs/common/decorators';
import { AnyFilesInterceptor } from '@nestjs/platform-express/multer';
import { GetUser } from '../auth/decorators';
import { JwtGuard } from '../auth/guard';
import { CommentPostDto, CreatePostDto } from './dto';
import { PostService } from './post.service';

@Controller('post')
@UseGuards(JwtGuard)
export class PostController {
  constructor(private postService: PostService) {}

  @Get()
  getPost(@GetUser('id') userId: number) {
    return this.postService.getPosts(userId);
  }

  @Get('/following')
  getFollowingUsersPosts(@GetUser('id') userId) {
    return this.postService.getFollowingUsersPosts(userId);
  }

  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  createPost(
    @GetUser('id') userId: number,
    @UploadedFiles()
    files: Array<Express.Multer.File>,
    @Body() dto: CreatePostDto,
  ) {
    return this.postService.createPost(userId, files, dto);
  }

  @Get(':id/like')
  likePost(@GetUser('id') userId: number, @Param('id') postId: string) {
    return this.postService.likePost(userId, +postId);
  }

  @Get(':id/bookmark')
  bookmarkPost(@GetUser('id') userId: number, @Param('id') postId: string) {
    return this.postService.bookmarkPost(userId, +postId);
  }

  @Post(':id/comment')
  commentPost(
    @GetUser('id') userId: number,
    @Param('id') postId: string,
    @Body() dto: CommentPostDto,
  ) {
    return this.postService.commentPost(userId, +postId, dto);
  }

  @Get('explore')
  explorePost(
    @Query('note_title') noteTitle: string,
    @Query('username') username: string,
    @Query('author_name') authorName: string,
  ) {
    return this.postService.explorePost(noteTitle, username, authorName);
  }
}
