import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Strategy, ExtractJwt } from 'passport-firebase-jwt';
import * as firebase from 'firebase-admin';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FirebaseStrategy extends PassportStrategy(
  Strategy,
  'firebase-auth',
) {
  private defaultApp: firebase.app.App;

  constructor(config: ConfigService, private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
    this.defaultApp = firebase.initializeApp({
      credential: firebase.credential.cert(
        JSON.parse(config.get<string>('FIREBASE_CONFIG')),
      ),
    });
  }

  async validate(token: string) {
    const firebaseUser = await this.defaultApp
      .auth()
      .verifyIdToken(token, true)
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
