import { Module } from '@nestjs/common';
import { LoanModule } from './modules/loan/loan.module';
import { LoanBillModule } from './modules/loan-bill/loan-bill.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CONFIG_KEY_ENUM } from './constants/env.enum';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>(CONFIG_KEY_ENUM.MONGODB_URI),
      }),
      inject: [ConfigService],
    }),
    LoanModule,
    LoanBillModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
