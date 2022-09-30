import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as firebase from 'firebase-admin';

@Injectable()
export class FirebaseService {
  private _defaultApp: firebase.app.App;

  constructor(config: ConfigService) {
    this._defaultApp = firebase.initializeApp({
      credential: firebase.credential.cert(
        JSON.parse(config.get<string>('FIREBASE_CONFIG')),
      ),
    });
  }

  get defaultApp() {
    return this._defaultApp;
  }
}
