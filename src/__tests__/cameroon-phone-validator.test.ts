import { describe, it, expect } from 'vitest';
import {
  validateCameroonPhone,
  isCarrier,
  isMobile,
  toE164,
  toLocalNumber,
  validateBatch,
  toCarrierType,
  CameroonCarrier,
} from '../cameroon-phone-validator';

// ─── validateCameroonPhone ──────────────────────────────────────────────────

describe('validateCameroonPhone', () => {
  // ── Empty / null-ish inputs ────────────────────────────────────────────

  describe('empty inputs', () => {
    it.each(['', '   ', undefined, null])('returns EMPTY error for "%s"', (input) => {
      const result = validateCameroonPhone(input as unknown as string);
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe('EMPTY');
      expect(result.carrier).toBe('UNKNOWN_CM');
      expect(result.type).toBe('UNKNOWN');
    });
  });

  // ── Invalid characters ─────────────────────────────────────────────────

  describe('invalid characters', () => {
    it.each(['abc650123456', '6501234@56', '650#123456', '6501234é56'])(
      'returns INVALID_CHARS for "%s"',
      (input) => {
        const result = validateCameroonPhone(input);
        expect(result.isValid).toBe(false);
        expect(result.errorCode).toBe('INVALID_CHARS');
      },
    );
  });

  // ── Too short ──────────────────────────────────────────────────────────

  describe('too short', () => {
    it.each(['650', '65012345', '12345678'])('returns TOO_SHORT for "%s"', (input) => {
      const result = validateCameroonPhone(input);
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe('TOO_SHORT');
    });
  });

  // ── Too long ───────────────────────────────────────────────────────────

  describe('too long', () => {
    it.each(['6501234567890', '65012345678'])('returns TOO_LONG for "%s"', (input) => {
      const result = validateCameroonPhone(input);
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe('TOO_LONG');
    });
  });

  // ── Unknown prefix ─────────────────────────────────────────────────────

  describe('unknown prefix', () => {
    it.each(['999123456', '100123456', '300123456'])(
      'returns UNKNOWN_PREFIX for "%s"',
      (input) => {
        const result = validateCameroonPhone(input);
        expect(result.isValid).toBe(false);
        expect(result.errorCode).toBe('UNKNOWN_PREFIX');
      },
    );
  });

  // ── MTN numbers ────────────────────────────────────────────────────────

  describe('MTN carrier', () => {
    it.each(['650123456', '654123456', '670123456', '679123456', '680123456', '689123456'])(
      'identifies %s as MTN mobile',
      (input) => {
        const result = validateCameroonPhone(input);
        expect(result.isValid).toBe(true);
        expect(result.carrier).toBe('MTN_CM');
        expect(result.type).toBe('MOBILE');
      },
    );
  });

  // ── Orange numbers ─────────────────────────────────────────────────────

  describe('Orange carrier', () => {
    it.each(['655123456', '659123456', '690123456', '699123456'])(
      'identifies %s as Orange mobile',
      (input) => {
        const result = validateCameroonPhone(input);
        expect(result.isValid).toBe(true);
        expect(result.carrier).toBe('ORANGE_CM');
        expect(result.type).toBe('MOBILE');
      },
    );
  });

  // ── Nexttel numbers ────────────────────────────────────────────────────

  describe('Nexttel carrier', () => {
    it.each(['660123456', '665123456', '669123456'])(
      'identifies %s as Nexttel mobile',
      (input) => {
        const result = validateCameroonPhone(input);
        expect(result.isValid).toBe(true);
        expect(result.carrier).toBe('NEXTTEL_CM');
        expect(result.type).toBe('MOBILE');
      },
    );
  });

  // ── Yoomee numbers ─────────────────────────────────────────────────────

  describe('Yoomee carrier', () => {
    it('identifies 624XXXXXX as Yoomee mobile', () => {
      const result = validateCameroonPhone('624123456');
      expect(result.isValid).toBe(true);
      expect(result.carrier).toBe('YOOMEE_CM');
      expect(result.type).toBe('MOBILE');
    });

    it('identifies Yoomee landline via 5-digit prefix 24226', () => {
      const result = validateCameroonPhone('242261234');
      expect(result.isValid).toBe(true);
      expect(result.carrier).toBe('YOOMEE_CM');
      expect(result.type).toBe('LANDLINE');
    });

    it('identifies Yoomee landline via 5-digit prefix 24227', () => {
      const result = validateCameroonPhone('242271234');
      expect(result.isValid).toBe(true);
      expect(result.carrier).toBe('YOOMEE_CM');
      expect(result.type).toBe('LANDLINE');
    });
  });

  // ── Camtel numbers ─────────────────────────────────────────────────────

  describe('Camtel carrier', () => {
    it.each(['620123456', '623123456', '625123456', '629123456'])(
      'identifies %s as Camtel mobile',
      (input) => {
        const result = validateCameroonPhone(input);
        expect(result.isValid).toBe(true);
        expect(result.carrier).toBe('CAMTEL_CM');
        expect(result.type).toBe('MOBILE');
      },
    );

    it.each(['222123456', '223123456', '233123456', '232123456', '227123456', '229123456'])(
      'identifies %s as Camtel landline',
      (input) => {
        const result = validateCameroonPhone(input);
        expect(result.isValid).toBe(true);
        expect(result.carrier).toBe('CAMTEL_CM');
        expect(result.type).toBe('LANDLINE');
      },
    );

    it('Camtel landline 242XX is not overridden to Yoomee when prefix5 is not in Yoomee set', () => {
      const result = validateCameroonPhone('242111234');
      expect(result.isValid).toBe(true);
      expect(result.carrier).toBe('CAMTEL_CM');
      expect(result.type).toBe('LANDLINE');
    });
  });

  // ── Input format handling ──────────────────────────────────────────────

  describe('input formats', () => {
    const expected = {
      isValid: true,
      carrier: 'MTN_CM',
      type: 'MOBILE',
      localNumber: '650123456',
      e164: '+237650123456',
    };

    it('handles local number (650123456)', () => {
      const result = validateCameroonPhone('650123456');
      expect(result).toMatchObject(expected);
    });

    it('handles E.164 format (+237650123456)', () => {
      const result = validateCameroonPhone('+237650123456');
      expect(result).toMatchObject(expected);
    });

    it('handles country code without + (237650123456)', () => {
      const result = validateCameroonPhone('237650123456');
      expect(result).toMatchObject(expected);
    });

    it('handles 00 international prefix (00237650123456)', () => {
      const result = validateCameroonPhone('00237650123456');
      expect(result).toMatchObject(expected);
    });

    it('handles spaces (6 50 12 34 56)', () => {
      const result = validateCameroonPhone('6 50 12 34 56');
      expect(result).toMatchObject(expected);
    });

    it('handles dashes (650-12-34-56)', () => {
      const result = validateCameroonPhone('650-12-34-56');
      expect(result).toMatchObject(expected);
    });

    it('handles parentheses ((650) 123456)', () => {
      const result = validateCameroonPhone('(650) 123456');
      expect(result).toMatchObject(expected);
    });

    it('handles dots (650.12.34.56)', () => {
      const result = validateCameroonPhone('650.12.34.56');
      expect(result).toMatchObject(expected);
    });

    it('handles slashes (650/12/34/56)', () => {
      const result = validateCameroonPhone('650/12/34/56');
      expect(result).toMatchObject(expected);
    });

    it('handles +237 with spaces (+237 650 12 34 56)', () => {
      const result = validateCameroonPhone('+237 650 12 34 56');
      expect(result).toMatchObject(expected);
    });

    it('trims whitespace', () => {
      const result = validateCameroonPhone('  650123456  ');
      expect(result).toMatchObject(expected);
    });
  });

  // ── Output fields ──────────────────────────────────────────────────────

  describe('output fields', () => {
    it('returns correct e164 format', () => {
      const result = validateCameroonPhone('650123456');
      expect(result.e164).toBe('+237650123456');
    });

    it('returns correct display format for mobile', () => {
      const result = validateCameroonPhone('650123456');
      expect(result.display).toBe('+237 650 12 34 56');
    });

    it('returns correct display format for landline', () => {
      const result = validateCameroonPhone('222123456');
      expect(result.display).toBe('+237 222 12 34 56');
    });

    it('returns localNumber as 9 digits', () => {
      const result = validateCameroonPhone('+237650123456');
      expect(result.localNumber).toBe('650123456');
      expect(result.localNumber).toHaveLength(9);
    });

    it('does not include error fields on valid result', () => {
      const result = validateCameroonPhone('650123456');
      expect(result.errorCode).toBeUndefined();
      expect(result.errorMessage).toBeUndefined();
    });

    it('does not include success fields on invalid result', () => {
      const result = validateCameroonPhone('');
      expect(result.localNumber).toBeUndefined();
      expect(result.e164).toBeUndefined();
      expect(result.display).toBeUndefined();
    });
  });
});

// ─── isCarrier ──────────────────────────────────────────────────────────────

describe('isCarrier', () => {
  it('returns true when carrier matches', () => {
    expect(isCarrier('650123456', 'MTN_CM')).toBe(true);
    expect(isCarrier('690123456', 'ORANGE_CM')).toBe(true);
    expect(isCarrier('660123456', 'NEXTTEL_CM')).toBe(true);
    expect(isCarrier('624123456', 'YOOMEE_CM')).toBe(true);
    expect(isCarrier('620123456', 'CAMTEL_CM')).toBe(true);
  });

  it('returns false when carrier does not match', () => {
    expect(isCarrier('650123456', 'ORANGE_CM')).toBe(false);
    expect(isCarrier('690123456', 'MTN_CM')).toBe(false);
  });

  it('returns false for invalid numbers', () => {
    expect(isCarrier('invalid', 'MTN_CM')).toBe(false);
    expect(isCarrier('', 'MTN_CM')).toBe(false);
  });
});

// ─── isMobile ───────────────────────────────────────────────────────────────

describe('isMobile', () => {
  it('returns true for mobile numbers', () => {
    expect(isMobile('650123456')).toBe(true);
    expect(isMobile('690123456')).toBe(true);
    expect(isMobile('660123456')).toBe(true);
    expect(isMobile('624123456')).toBe(true);
  });

  it('returns false for landline numbers', () => {
    expect(isMobile('222123456')).toBe(false);
    expect(isMobile('233123456')).toBe(false);
  });

  it('returns false for invalid numbers', () => {
    expect(isMobile('invalid')).toBe(false);
    expect(isMobile('')).toBe(false);
  });
});

// ─── toE164 ─────────────────────────────────────────────────────────────────

describe('toE164', () => {
  it('returns E.164 string for valid numbers', () => {
    expect(toE164('650123456')).toBe('+237650123456');
    expect(toE164('+237 690 12 34 56')).toBe('+237690123456');
    expect(toE164('00237660123456')).toBe('+237660123456');
  });

  it('returns null for invalid numbers', () => {
    expect(toE164('')).toBeNull();
    expect(toE164('invalid')).toBeNull();
    expect(toE164('123')).toBeNull();
    expect(toE164('999123456')).toBeNull();
  });
});

// ─── toLocalNumber ──────────────────────────────────────────────────────────

describe('toLocalNumber', () => {
  it('returns 9-digit local number for valid inputs', () => {
    expect(toLocalNumber('650123456')).toBe('650123456');
    expect(toLocalNumber('+237650123456')).toBe('650123456');
    expect(toLocalNumber('237650123456')).toBe('650123456');
    expect(toLocalNumber('00237650123456')).toBe('650123456');
    expect(toLocalNumber('6 50 12 34 56')).toBe('650123456');
  });

  it('returns null for invalid inputs', () => {
    expect(toLocalNumber('')).toBeNull();
    expect(toLocalNumber('invalid')).toBeNull();
    expect(toLocalNumber('123')).toBeNull();
  });
});

// ─── validateBatch ──────────────────────────────────────────────────────────

describe('validateBatch', () => {
  it('separates valid and invalid numbers', () => {
    const result = validateBatch(['650123456', 'invalid', '690123456']);
    expect(result.valid).toHaveLength(2);
    expect(result.invalid).toHaveLength(1);
  });

  it('includes original number in results', () => {
    const result = validateBatch(['650123456', 'bad']);
    expect(result.valid[0].original).toBe('650123456');
    expect(result.invalid[0].original).toBe('bad');
  });

  it('returns correct summary counts', () => {
    const result = validateBatch(['650123456', '690123456', 'invalid', '']);
    expect(result.summary.total).toBe(4);
    expect(result.summary.validCount).toBe(2);
    expect(result.summary.invalidCount).toBe(2);
  });

  it('counts carriers correctly in summary', () => {
    const result = validateBatch(['650123456', '651000000', '690123456', '660123456']);
    expect(result.summary.byCarrier.MTN_CM).toBe(2);
    expect(result.summary.byCarrier.ORANGE_CM).toBe(1);
    expect(result.summary.byCarrier.NEXTTEL_CM).toBe(1);
    expect(result.summary.byCarrier.CAMTEL_CM).toBe(0);
  });

  it('handles empty array', () => {
    const result = validateBatch([]);
    expect(result.valid).toHaveLength(0);
    expect(result.invalid).toHaveLength(0);
    expect(result.summary.total).toBe(0);
  });

  it('initializes all carrier counts to 0', () => {
    const result = validateBatch([]);
    const carriers: CameroonCarrier[] = [
      'MTN_CM', 'ORANGE_CM', 'CAMTEL_CM', 'NEXTTEL_CM', 'YOOMEE_CM', 'FIXE_CM', 'UNKNOWN_CM',
    ];
    for (const carrier of carriers) {
      expect(result.summary.byCarrier[carrier]).toBe(0);
    }
  });
});

// ─── toCarrierType ──────────────────────────────────────────────────────────

describe('toCarrierType', () => {
  it('maps known carriers', () => {
    expect(toCarrierType('MTN_CM')).toBe('MTN_CM');
    expect(toCarrierType('ORANGE_CM')).toBe('ORANGE_CM');
    expect(toCarrierType('CAMTEL_CM')).toBe('CAMTEL_CM');
    expect(toCarrierType('NEXTTEL_CM')).toBe('NEXTTEL_CM');
    expect(toCarrierType('YOOMEE_CM')).toBe('YOOMEE_CM');
  });

  it('returns null for unknown carriers', () => {
    expect(toCarrierType('UNKNOWN_CM')).toBeNull();
    expect(toCarrierType('FIXE_CM')).toBeNull();
  });
});
