import {
  Injectable,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { NotificationService } from '../notification/notification.service';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';

@Injectable()
export class AuthService {
  constructor(
    private notificationService: NotificationService,
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  @HttpCode(HttpStatus.OK)
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

    await this.prisma.user.update({
      where: { id: user.id },
      data: { fcm_token: dto.fcm_token },
    });

    await this.notificationService.sendNotifToSpecificUser(
      user.id,
      {
        title: 'Notifikasi Keamanan',
        body: 'Kami menemukan adanya login baru ke akun Anda di perangkat lain. Jika ini memang Anda, Anda tidak perlu melakukan apa-apa. Jika bukan, kami akan membantu untuk mengamankan akun Anda.',
      },
      'INFO',
      {},
    );

    return {
      statusCode: HttpStatus.OK,
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

      delete user.password;

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Pendaftaran berhasil',
        data: user,
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

  async signToken(userId: number, email: string) {
    const token = await this.jwt.signAsync(
      { sub: userId, email },
      { expiresIn: '60d', secret: this.config.get('JWT_SECRET') },
    );

    return token;
  }

  async logout(userId: number) {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: { fcm_token: null },
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Success logout',
        data: null,
      };
    } catch (error) {
      throw error;
    }
  }
}
