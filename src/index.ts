/**
 * cameroon-number-validator
 * A lightweight library to validate Cameroonian phone numbers,
 * identify carriers, and format to E.164.
 */

export {
  // Main validation function
  validateCameroonPhone,

  // Utility functions
  isCarrier,
  isMobile,
  toE164,
  toLocalNumber,
  validateBatch,
  toCarrierType,

  // Types
  type CameroonCarrier,
  type PhoneNumberType,
  type PhoneValidationError,
  type CameroonPhoneValidationResult,
  type BatchValidationResult,
} from './cameroon-phone-validator';
