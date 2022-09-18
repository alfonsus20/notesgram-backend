import { Controller, Post, UseGuards, Body, Get, Param } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorators';
import { JwtGuard } from '../auth/guard';
import { PurchaseNoteDto } from './dto';
import { NoteService } from './note.service';

@UseGuards(JwtGuard)
@Controller('note')
export class NoteController {
  constructor(private noteService: NoteService) {}

  @Post('purchase')
  purchaseNote(@GetUser() user: User, @Body() dto: PurchaseNoteDto) {
    return this.noteService.purchaseNote(user, dto);
  }

  @Get('my')
  getMyNotes(@GetUser('id') userId: number) {
    return this.noteService.getMyNotes(userId);
  }

  @Get(':id')
  getNoteById(@Param('id') noteId: string) {
    return this.noteService.getNoteById(+noteId);
  }
}
