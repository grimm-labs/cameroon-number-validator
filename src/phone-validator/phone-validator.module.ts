import { Module } from '@nestjs/common';
import { PhoneValidatorService } from './phone-validator.service';
import { PhoneValidatorController } from './phone-validator.controller';

@Module({
  controllers: [PhoneValidatorController],
  providers: [PhoneValidatorService],
  exports: [PhoneValidatorService],
})
export class PhoneValidatorModule {}