import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleAuthDto, RegisterDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.emailOrUsername }, { username: dto.emailOrUsername }],
      },
    });

    if (!user) {
      throw new ForbiddenException('Akun tidak ditemukan');
    }

    const isPasswordCorrect = await argon.verify(user.password, dto.password);

    if (!isPasswordCorrect) {
      throw new ForbiddenException('Password salah');
    }

    delete user.password;

    const token = await this.signToken(user.id, user.email);

    return {
      message: 'Login berhasil',
      data: { user, token },
    };
  }

  async register(dto: RegisterDto) {
    const hash = await argon.hash(dto.password);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hash,
          name: dto.name,
        },
      });

      const token = await this.signToken(user.id, user.email);

      delete user.password;

      return {
        message: 'Pendaftaran berhasil',
        data: { user, token },
      };
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          throw new ForbiddenException('Email sudah digunakan');
        }
      }
      throw err;
    }
  }

  async loginOrRegisterGoogle(dto: GoogleAuthDto) {
    let user = await this.prisma.user.findUnique({
      where: { google_id: dto.googleId },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: { name: dto.name, email: dto.email, google_id: dto.googleId },
      });
    }

    const token = await this.signToken(user.id, user.email);

    return { user, token };
  }

  async signToken(userId: number, email: string) {
    const token = await this.jwt.signAsync(
      { sub: userId, email },
      { expiresIn: '60d', secret: this.config.get('JWT_SECRET') },
    );

    return token;
  }
}
