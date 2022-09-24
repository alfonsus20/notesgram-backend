import { Controller, Get, Body, Put, Param, Delete } from '@nestjs/common';
import { Post, UseGuards } from '@nestjs/common/decorators';
import { GetUser } from '../auth/decorators';
import { JwtGuard } from '../auth/guard';
import {
  CreateBookmarkedNoteGroupDto,
  CreatePurchasedNoteGroupDto,
  UpdateBookmarkedNoteGroupDto,
  UpdatePurchasedNoteGroupDto,
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

  @Put('bookmarked/:groupId')
  updateBookmarkedPostGroups(
    @GetUser('id') userId: number,
    @Param('groupId') groupId: string,
    @Body() dto: UpdateBookmarkedNoteGroupDto,
  ) {
    return this.noteGroupService.updateBookmarkedNoteGroup(
      userId,
      +groupId,
      dto,
    );
  }

  @Put('purchased/:groupId')
  updatePurchasedPostGroups(
    @GetUser('id') userId: number,
    @Param('groupId') groupId: string,
    @Body() dto: UpdatePurchasedNoteGroupDto,
  ) {
    return this.noteGroupService.updatePurchasedNoteGroup(
      userId,
      +groupId,
      dto,
    );
  }

  @Delete('bookmarked/:groupId')
  deleteBookmarkedPostGroups(
    @GetUser('id') userId: number,
    @Param('groupId') groupId: string,
  ) {
    return this.noteGroupService.deleteBookmarkedNoteGroup(userId, +groupId);
  }

  @Delete('purchased/:groupId')
  deletePurchasedPostGroups(
    @GetUser('id') userId: number,
    @Param('groupId') groupId: string,
  ) {
    return this.noteGroupService.deletePurchasedNoteGroup(userId, +groupId);
  }
}
