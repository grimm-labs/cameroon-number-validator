import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { PhoneValidatorService } from './phone-validator.service';

@Controller('phone-validator')
export class PhoneValidatorController {
  constructor(private readonly validatorService: PhoneValidatorService) {}

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  validate(@Body('phone') phone: string) {
    return this.validatorService.validate(phone);
  }
}