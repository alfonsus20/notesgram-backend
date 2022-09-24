import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateBookmarkedNoteGroupDto,
  CreatePurchasedNoteGroupDto,
  UpdateBookmarkedNoteGroupDto,
  UpdatePurchasedNoteGroupDto,
} from './dto';

@Injectable()
export class NoteGroupService {
  constructor(private prismaService: PrismaService) {}

  async getMyBookmarkedNoteGroups(userId: number) {
    try {
      const groups = await this.prismaService.bookmarkedGroup.findMany({
        include: {
          note_ids: {
            include: {
              note: {
                include: {
                  note_pictures: true,
                  post: true,
                },
              },
            },
          },
        },
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
        include: {
          note_ids: {
            include: {
              note: {
                include: {
                  note_pictures: true,
                  post: true,
                },
              },
            },
          },
        },
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

  async updateBookmarkedNoteGroup(
    userId: number,
    groupId: number,
    dto: UpdateBookmarkedNoteGroupDto,
  ) {
    try {
      const group = await this.prismaService.bookmarkedGroup.findFirst({
        where: { id: groupId, userId },
      });

      if (!group) {
        throw new NotFoundException('Bookmarked group note not found');
      }

      const { data } = await this.prismaService.$transaction(
        async (prismaTrans) => {
          const data = await prismaTrans.bookmarkedGroup.update({
            where: { id: groupId },
            data: { name: dto.name },
          });
          await prismaTrans.bookmarkedGroupMember.deleteMany({
            where: { groupId },
          });

          const newMembers = dto.note_ids.map((id) => ({
            noteId: id,
            groupId,
          }));

          await prismaTrans.bookmarkedGroupMember.createMany({
            data: newMembers,
          });

          return { data };
        },
      );

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Success update bookmarked note group',
        data: { ...data, note_ids: dto.note_ids },
      };
    } catch (error) {
      throw error;
    }
  }

  async updatePurchasedNoteGroup(
    userId: number,
    groupId: number,
    dto: UpdatePurchasedNoteGroupDto,
  ) {
    try {
      const group = await this.prismaService.purchasedGroup.findFirst({
        where: { id: groupId, userId },
      });

      if (!group) {
        throw new NotFoundException('Bookmarked group note not found');
      }

      const { data } = await this.prismaService.$transaction(
        async (prismaTrans) => {
          const data = await prismaTrans.purchasedGroup.update({
            where: { id: groupId },
            data: { name: dto.name },
          });
          await prismaTrans.purchasedGroupMember.deleteMany({
            where: { groupId },
          });

          const newMembers = dto.note_ids.map((id) => ({
            noteId: id,
            groupId,
          }));

          await prismaTrans.purchasedGroupMember.createMany({
            data: newMembers,
          });

          return { data };
        },
      );

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Success update purchased note group',
        data: { ...data, note_ids: dto.note_ids },
      };
    } catch (error) {
      throw error;
    }
  }
}
