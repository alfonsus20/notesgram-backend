import { Controller, Get, Body } from '@nestjs/common';
import { Post, UseGuards } from '@nestjs/common/decorators';
import { GetUser } from '../auth/decorators';
import { JwtGuard } from '../auth/guard';
import { PurchaseNoteDto } from '../note/dto';
import {
  CreateBookmarkedNoteGroupDto,
  CreatePurchasedNoteGroupDto,
} from './dto';
import { NoteGroupService } from './note-group.service';

@UseGuards(JwtGuard)
@Controller('note-group')
export class NoteGroupController {
  constructor(private noteGroupService: NoteGroupService) {}

  @Get('my/bookmarked')
  getMyBookmarkedPostGroups(@GetUser('id') userId: number) {
    return this.noteGroupService.getMyBookmarkedNoteGroups(userId);
  }

  @Get('my/purchased')
  getMyPurchasedPostGroups(@GetUser('id') userId: number) {
    return this.noteGroupService.getMyPurchasedNoteGroups(userId);
  }

  @Post('purchased')
  createPurchasedPostGroups(
    @GetUser('id') userId: number,
    @Body() dto: CreatePurchasedNoteGroupDto,
  ) {
    return this.noteGroupService.createPurchasedNoteGroup(userId, dto);
  }

  @Post('bookmarked')
  createBookmarkedPostGroups(
    @GetUser('id') userId: number,
    @Body() dto: CreateBookmarkedNoteGroupDto,
  ) {
    return this.noteGroupService.createBookmarkedNoteGroup(userId, dto);
  }
}
