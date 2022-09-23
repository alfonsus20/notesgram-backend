import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateBookmarkedNoteGroupDto,
  CreatePurchasedNoteGroupDto,
} from './dto';

@Injectable()
export class NoteGroupService {
  constructor(private prismaService: PrismaService) {}

  async getMyBookmarkedNoteGroups(userId: number) {
    try {
      const groups = await this.prismaService.bookmarkedGroup.findMany({
        include: { members: true },
        where: { userId },
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Success get my bookmarked note groups',
        data: groups,
      };
    } catch (error) {
      throw error;
    }
  }

  async getMyPurchasedNoteGroups(userId: number) {
    try {
      const groups = await this.prismaService.purchasedGroup.findMany({
        include: { members: true },
        where: { userId },
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Success get my purchased note groups',
        data: groups,
      };
    } catch (error) {
      throw error;
    }
  }

  async createPurchasedNoteGroup(
    userId: number,
    dto: CreatePurchasedNoteGroupDto,
  ) {
    try {
      const group = await this.prismaService.purchasedGroup.create({
        data: { userId, name: dto.name },
      });

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Success create purchased note groups',
        data: group,
      };
    } catch (error) {
      throw error;
    }
  }

  async createBookmarkedNoteGroup(
    userId: number,
    dto: CreateBookmarkedNoteGroupDto,
  ) {
    try {
      const group = await this.prismaService.bookmarkedGroup.create({
        data: { userId, name: dto.name },
      });

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Success create bookmarked note groups',
        data: group,
      };
    } catch (error) {
      throw error;
    }
  }
}
