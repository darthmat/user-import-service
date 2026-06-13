import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core/constants';
import { HealthzController } from './modules/healtz/healthz.controller';
import { UserModule } from './modules/user/user.module';
import { CustomErrorHandlerFilter } from './utils/errorHandler';

@Module({
  imports: [UserModule],
  controllers: [HealthzController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: CustomErrorHandlerFilter,
    },
  ],
})
export class AppModule {}
