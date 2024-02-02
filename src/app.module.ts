import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UrlModule } from './url/url.module';
import { CommonConfigService } from './common/config/config.service';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (commonConfigService: CommonConfigService) => ({
        uri: commonConfigService.getMongoDBUri(),
      }),
      inject: [CommonConfigService],
    }),
    UrlModule,
  ],
  controllers: [],
  providers: [CommonConfigService],
  exports: [CommonConfigService],
})
export class AppModule {}
