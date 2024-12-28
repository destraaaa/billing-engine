import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class AppService {
  constructor(
    private configService: ConfigService,
    @InjectConnection() private readonly connection: Connection,
  ) {}
  getHello(): string {
    return 'Hello World!';
  }
}
