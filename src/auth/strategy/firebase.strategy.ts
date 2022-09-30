import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Strategy, ExtractJwt } from 'passport-firebase-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { FirebaseService } from '../../firebase/firebase.service';
@Injectable()
export class FirebaseStrategy extends PassportStrategy(
  Strategy,
  'firebase-auth',
) {
  constructor(
    private prisma: PrismaService,
    private firebase: FirebaseService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(token: string) {
    const firebaseUser = await this.firebase.defaultApp
      .auth()
      .verifyIdToken(token)
      .catch(() => {
        throw new UnauthorizedException('Token invalid');
      });

    if (!firebaseUser) {
      throw new UnauthorizedException('User not found');
    }

    let user = await this.prisma.user.findUnique({
      where: { firebase_id: firebaseUser.uid },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: firebaseUser.email,
          avatar_url: firebaseUser.picture,
          firebase_id: firebaseUser.uid,
        },
      });
    }

    return user;
  }
}
