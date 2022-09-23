import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { PostController } from './post.controller';
import { PostService } from './post.service';

@Module({
  imports: [UserModule],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
