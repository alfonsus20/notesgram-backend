import { Module } from '@nestjs/common';
import { NoteGroupController } from './note-group.controller';
import { NoteGroupService } from './note-group.service';

@Module({
  controllers: [NoteGroupController],
  providers: [NoteGroupService],
})
export class NoteGroupModule {}
