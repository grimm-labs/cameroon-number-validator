/**
 * Ultra-performant Cameroonian phone number validator.
 * Uses a pre-built O(1) prefix lookup table (Map).
 */

// Types
export type CameroonCarrier =
  | 'MTN_CM'
  | 'ORANGE_CM'
  | 'CAMTEL_CM'
  | 'NEXTTEL_CM'
  | 'YOOMEE_CM'
  | 'FIXE_CM'
  | 'UNKNOWN_CM';

export type PhoneNumberType = 'MOBILE' | 'LANDLINE' | 'UNKNOWN';

export interface CameroonPhoneValidationResult {
  isValid: boolean;
  carrier: CameroonCarrier;
  type: PhoneNumberType;
  localNumber?: string;
  e164?: string;
  display?: string;
  errorCode?: PhoneValidationError;
  errorMessage?: string;
}

export type PhoneValidationError =
  | 'EMPTY'
  | 'TOO_SHORT'
  | 'TOO_LONG'
  | 'INVALID_CHARS'
  | 'UNKNOWN_PREFIX';

// Prefix lookup table
interface PrefixEntry {
  carrier: CameroonCarrier;
  type: PhoneNumberType;
}

function range3(start: number, end: number, entry: PrefixEntry): [string, PrefixEntry][] {
  const result: [string, PrefixEntry][] = [];
  for (let i = start; i <= end; i++) {
    result.push([String(i).padStart(3, '0'), entry]);
  }
  return result;
}

const PREFIX_TABLE: ReadonlyMap<string, PrefixEntry> = new Map<string, PrefixEntry>([
  ...range3(650, 654, { carrier: 'MTN_CM', type: 'MOBILE' }),
  ...range3(670, 679, { carrier: 'MTN_CM', type: 'MOBILE' }),
  ...range3(680, 689, { carrier: 'MTN_CM', type: 'MOBILE' }),
  ...range3(655, 659, { carrier: 'ORANGE_CM', type: 'MOBILE' }),
  ...range3(690, 699, { carrier: 'ORANGE_CM', type: 'MOBILE' }),
  ...range3(660, 669, { carrier: 'NEXTTEL_CM', type: 'MOBILE' }),
  ['624', { carrier: 'YOOMEE_CM', type: 'MOBILE' }],
  ...range3(620, 623, { carrier: 'CAMTEL_CM', type: 'MOBILE' }),
  ...range3(625, 629, { carrier: 'CAMTEL_CM', type: 'MOBILE' }),
  ...range3(222, 222, { carrier: 'CAMTEL_CM', type: 'LANDLINE' }),
  ...range3(223, 223, { carrier: 'CAMTEL_CM', type: 'LANDLINE' }),
  ...range3(233, 233, { carrier: 'CAMTEL_CM', type: 'LANDLINE' }),
  ...range3(242, 242, { carrier: 'CAMTEL_CM', type: 'LANDLINE' }),
  ...range3(243, 243, { carrier: 'CAMTEL_CM', type: 'LANDLINE' }),
  ...range3(244, 244, { carrier: 'CAMTEL_CM', type: 'LANDLINE' }),
  ...range3(232, 232, { carrier: 'CAMTEL_CM', type: 'LANDLINE' }),
  ...range3(227, 227, { carrier: 'CAMTEL_CM', type: 'LANDLINE' }),
  ...range3(229, 229, { carrier: 'CAMTEL_CM', type: 'LANDLINE' }),
]);

const YOOMEE_LANDLINE_FIVE_PREFIXES: ReadonlySet<string> = new Set(['24226', '24227']);
const CC = '237';

function stripToLocal(raw: string): string {
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('00' + CC)) {
    digits = digits.slice(5);
  } else if (digits.startsWith(CC) && digits.length > 9) {
    digits = digits.slice(CC.length);
  }
  return digits;
}

function formatDisplay(local: string, type: PhoneNumberType): string {
  if ((type === 'MOBILE' || type === 'LANDLINE') && local.length === 9) {
    return `+${CC} ${local[0]}${local[1]}${local[2]} ${local[3]}${local[4]} ${local[5]}${local[6]} ${local[7]}${local[8]}`;
  }
  return `+${CC}${local}`;
}

/**
 * Validates a Cameroonian phone number and identifies its carrier.
 * @param phone - Raw phone number string in any reasonable format.
 * @returns Validation result with carrier, type, and formatted numbers.
 */
export function validateCameroonPhone(phone: string): CameroonPhoneValidationResult {
  if (!phone || phone.trim().length === 0) {
    return {
      isValid: false,
      carrier: 'UNKNOWN_CM',
      type: 'UNKNOWN',
      errorCode: 'EMPTY',
      errorMessage: 'Phone number is empty.',
    };
  }

  const raw = phone.trim();
  if (/[^\d\s\+\-\.\(\)\/]/.test(raw)) {
    return {
      isValid: false,
      carrier: 'UNKNOWN_CM',
      type: 'UNKNOWN',
      errorCode: 'INVALID_CHARS',
      errorMessage: 'Phone number contains invalid characters.',
    };
  }

  const local = stripToLocal(raw);
  if (local.length < 9) {
    return {
      isValid: false,
      carrier: 'UNKNOWN_CM',
      type: 'UNKNOWN',
      errorCode: 'TOO_SHORT',
      errorMessage: `Phone number too short (${local.length} digit(s) — 9 required after country code).`,
    };
  }
  if (local.length > 9) {
    return {
      isValid: false,
      carrier: 'UNKNOWN_CM',
      type: 'UNKNOWN',
      errorCode: 'TOO_LONG',
      errorMessage: `Phone number too long (${local.length} digits — 9 required after country code).`,
    };
  }

  const prefix3 = local.substring(0, 3);
  const entry = PREFIX_TABLE.get(prefix3);
  if (!entry) {
    return {
      isValid: false,
      carrier: 'UNKNOWN_CM',
      type: 'UNKNOWN',
      errorCode: 'UNKNOWN_PREFIX',
      errorMessage: `Unknown prefix "${prefix3}" — not recognized by any Cameroonian carrier.`,
    };
  }

  let carrier = entry.carrier;
  if (carrier === 'CAMTEL_CM' && entry.type === 'LANDLINE') {
    const prefix5 = local.substring(0, 5);
    if (YOOMEE_LANDLINE_FIVE_PREFIXES.has(prefix5)) {
      carrier = 'YOOMEE_CM';
    }
  }

  const e164 = `+${CC}${local}`;
  return {
    isValid: true,
    carrier,
    type: entry.type,
    localNumber: local,
    e164,
    display: formatDisplay(local, entry.type),
  };
}

/** Returns true if the number is valid and belongs to the given carrier. */
export function isCarrier(phone: string, carrier: CameroonCarrier): boolean {
  const result = validateCameroonPhone(phone);
  return result.isValid && result.carrier === carrier;
}

/** Returns true if the number is a valid Cameroonian mobile number. */
export function isMobile(phone: string): boolean {
  const result = validateCameroonPhone(phone);
  return result.isValid && result.type === 'MOBILE';
}

/** Normalises a phone number to E.164 format (+237XXXXXXXXX). Returns null if invalid. */
export function toE164(phone: string): string | null {
  const result = validateCameroonPhone(phone);
  return result.isValid ? result.e164! : null;
}

/** Returns the 9-digit local number. Returns null if invalid. */
export function toLocalNumber(phone: string): string | null {
  const result = validateCameroonPhone(phone);
  return result.isValid ? result.localNumber! : null;
}

export interface BatchValidationResult {
  valid: Array<CameroonPhoneValidationResult & { original: string }>;
  invalid: Array<CameroonPhoneValidationResult & { original: string }>;
  summary: {
    total: number;
    validCount: number;
    invalidCount: number;
    byCarrier: Record<CameroonCarrier, number>;
  };
}

/** Validates an array of phone numbers in one pass. */
export function validateBatch(phones: string[]): BatchValidationResult {
  const valid: BatchValidationResult['valid'] = [];
  const invalid: BatchValidationResult['invalid'] = [];
  const byCarrier: Record<CameroonCarrier, number> = {
    MTN_CM: 0,
    ORANGE_CM: 0,
    CAMTEL_CM: 0,
    NEXTTEL_CM: 0,
    YOOMEE_CM: 0,
    FIXE_CM: 0,
    UNKNOWN_CM: 0,
  };

  for (const phone of phones) {
    const result = validateCameroonPhone(phone);
    if (result.isValid) {
      valid.push({ ...result, original: phone });
      byCarrier[result.carrier]++;
    } else {
      invalid.push({ ...result, original: phone });
    }
  }

  return {
    valid,
    invalid,
    summary: {
      total: phones.length,
      validCount: valid.length,
      invalidCount: invalid.length,
      byCarrier,
    },
  };
}

/** Maps a validated carrier to the CarrierType enum. Returns null for carriers without an equivalent. */
export function toCarrierType(carrier: CameroonCarrier): string | null {
  const MAP: Partial<Record<CameroonCarrier, string>> = {
    MTN_CM: 'MTN_CM',
    ORANGE_CM: 'ORANGE_CM',
    CAMTEL_CM: 'CAMTEL_CM',
    NEXTTEL_CM: 'NEXTTEL_CM',
    YOOMEE_CM: 'YOOMEE_CM',
  };
  return MAP[carrier] ?? null;
}