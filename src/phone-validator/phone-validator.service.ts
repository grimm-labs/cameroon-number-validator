import { Injectable } from '@nestjs/common';
import {
  validateCameroonPhone,
  isCarrier,
  isMobile,
  toE164,
  toLocalNumber,
  validateBatch,
  toCarrierType,
  CameroonCarrier,
  CameroonPhoneValidationResult,
  BatchValidationResult,
} from './cameroon-phone-validator';

@Injectable()
export class PhoneValidatorService {
  validate(phone: string): CameroonPhoneValidationResult {
    return validateCameroonPhone(phone);
  }

  isCarrier(phone: string, carrier: CameroonCarrier): boolean {
    return isCarrier(phone, carrier);
  }

  isMobile(phone: string): boolean {
    return isMobile(phone);
  }

  toE164(phone: string): string | null {
    return toE164(phone);
  }

  toLocalNumber(phone: string): string | null {
    return toLocalNumber(phone);
  }

  validateBatch(phones: string[]): BatchValidationResult {
    return validateBatch(phones);
  }

  toCarrierType(carrier: CameroonCarrier): string | null {
    return toCarrierType(carrier);
  }
}