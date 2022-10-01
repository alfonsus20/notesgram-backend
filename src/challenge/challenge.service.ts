import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChallengeService {
  constructor(private readonly prismaService: PrismaService) {}

  async createChallenge() {
    try {
    } catch (error) {
      throw error;
    }
  }
}
