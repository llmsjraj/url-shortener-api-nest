import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CommonConfigService {
  constructor(private readonly configService: ConfigService) {}

  getMongoDBUri(): string {
    return this.configService.get<string>('MONGODB_URI');
  }
}
