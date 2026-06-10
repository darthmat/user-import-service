import { Module } from '@nestjs/common';
import { HealthzController } from './modules/healtz/healthz.controller';

@Module({
  imports: [],
  controllers: [HealthzController],
})
export class AppModule {}
