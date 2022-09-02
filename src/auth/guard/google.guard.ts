import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

export class GoogleGuard extends AuthGuard('google') {
  constructor() {
    super();
  }
}
